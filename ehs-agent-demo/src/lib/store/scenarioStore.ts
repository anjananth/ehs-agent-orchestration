import { create } from 'zustand';
import type { HumanAction, ScenarioStep } from '@/types';
import { FALLBACK_REPLACES_INDEX, FALLBACK_STEPS, SCENARIO_STEPS } from '@/data/scenario';
import { adapters } from '@/lib/adapters';
import { deriveState, type DerivedState } from './derive';

export type Speed = 0.5 | 1 | 2;
export type Branch = 'main' | 'fallback';
export type ViewMode = 'governance' | 'clinical';

interface ScenarioState {
  // --- playback ---
  /** -1 = idle / before step 1. */
  currentStepIndex: number;
  isPlaying: boolean;
  speed: Speed;
  branch: Branch;
  /** ids of human-gated steps whose action has been taken. */
  resolved: string[];
  /** ids of human-gated steps where the human clicked Reject first. */
  rejected: string[];
  /** Bumps every time a step lands (incl. re-landing the same index) so pulses re-fire. */
  tick: number;

  // --- presenter prefs ---
  showGloss: boolean;
  presenterMode: boolean;
  viewMode: ViewMode;
  aboutOpen: boolean;

  // --- derived (recomputed on every playback change) ---
  sequence: ScenarioStep[];
  derived: DerivedState;

  // --- actions ---
  play: () => void;
  pause: () => void;
  stepForward: () => void;
  stepBack: () => void;
  reset: () => void;
  setSpeed: (s: Speed) => void;
  jumpTo: (index: number) => void;
  resolveHuman: (action: HumanAction) => void;
  rejectHuman: (action: HumanAction) => void;
  triggerFallback: () => void;
  setShowGloss: (v: boolean) => void;
  setPresenterMode: (v: boolean) => void;
  setViewMode: (v: ViewMode) => void;
  setAboutOpen: (v: boolean) => void;
}

/** Build the effective step sequence for a branch. */
export function buildSequence(branch: Branch): ScenarioStep[] {
  if (branch === 'main') return SCENARIO_STEPS;
  return [
    ...SCENARIO_STEPS.slice(0, FALLBACK_REPLACES_INDEX),
    ...FALLBACK_STEPS,
    ...SCENARIO_STEPS.slice(FALLBACK_REPLACES_INDEX + 1),
  ];
}

/** Human gate on the current step that hasn't been resolved yet. */
export function pendingHumanAction(seq: ScenarioStep[], index: number, resolved: string[]): HumanAction | null {
  const step = seq[index];
  if (!step?.requiresHuman) return null;
  return resolved.includes(step.id) ? null : step.requiresHuman;
}

let timer: number | null = null;
function clearTimer() {
  if (timer !== null) {
    window.clearTimeout(timer);
    timer = null;
  }
}

export const useScenarioStore = create<ScenarioState>((set, get) => {
  function recompute(partial: Partial<Pick<ScenarioState, 'currentStepIndex' | 'branch' | 'resolved' | 'rejected'>>) {
    const cur = get();
    const branch = partial.branch ?? cur.branch;
    const index = partial.currentStepIndex ?? cur.currentStepIndex;
    const resolved = partial.resolved ?? cur.resolved;
    const sequence = buildSequence(branch);
    // Rejections only survive while their step is still at/after the current index.
    const rejected = (partial.rejected ?? cur.rejected).filter((id) => {
      const i = sequence.findIndex((s) => s.id === id);
      return i >= 0 && i <= index;
    });
    const derived = deriveState(sequence, index, new Set(resolved), new Set(rejected));
    // Keep the mock governance adapter's log in step with the UI so export reflects the trace.
    adapters.governance.replace(derived.events, derived.checks);
    return { branch, currentStepIndex: index, resolved, rejected, sequence, derived, tick: cur.tick + 1 };
  }

  /** Schedule the next auto-advance if playing and not gated. */
  function scheduleNext() {
    clearTimer();
    const { isPlaying, sequence, currentStepIndex, resolved, speed } = get();
    if (!isPlaying) return;
    if (currentStepIndex >= sequence.length - 1) {
      set({ isPlaying: false });
      return;
    }
    if (pendingHumanAction(sequence, currentStepIndex, resolved)) return; // wait for the human
    const holdMs = currentStepIndex < 0 ? 600 : sequence[currentStepIndex].durationMs / speed;
    timer = window.setTimeout(() => {
      const s = get();
      if (!s.isPlaying) return;
      s.stepForward();
    }, holdMs);
  }

  const initialSequence = buildSequence('main');

  return {
    currentStepIndex: -1,
    isPlaying: false,
    speed: 1,
    branch: 'main',
    resolved: [],
    rejected: [],
    tick: 0,
    showGloss: true,
    presenterMode: false,
    viewMode: 'governance',
    aboutOpen: false,
    sequence: initialSequence,
    derived: deriveState(initialSequence, -1, new Set()),

    play: () => {
      const { sequence, currentStepIndex } = get();
      if (currentStepIndex >= sequence.length - 1) return;
      set({ isPlaying: true });
      scheduleNext();
    },

    pause: () => {
      clearTimer();
      set({ isPlaying: false });
    },

    stepForward: () => {
      const { sequence, currentStepIndex, resolved } = get();
      // Never sail past an unresolved human gate.
      if (pendingHumanAction(sequence, currentStepIndex, resolved)) return;
      if (currentStepIndex >= sequence.length - 1) {
        clearTimer();
        set({ isPlaying: false });
        return;
      }
      set(recompute({ currentStepIndex: currentStepIndex + 1 }));
      scheduleNext();
    },

    stepBack: () => {
      const { sequence, currentStepIndex, resolved } = get();
      clearTimer();
      const next = Math.max(-1, currentStepIndex - 1);
      // Stepping back before a resolved gate un-resolves it so it gates again on replay.
      const keep = resolved.filter((id) => sequence.findIndex((s) => s.id === id) < next);
      set({ ...recompute({ currentStepIndex: next, resolved: keep }), isPlaying: false });
    },

    reset: () => {
      clearTimer();
      adapters.governance.reset();
      set({ ...recompute({ currentStepIndex: -1, branch: 'main', resolved: [], rejected: [] }), isPlaying: false });
    },

    setSpeed: (speed) => {
      set({ speed });
      scheduleNext();
    },

    jumpTo: (index) => {
      const { sequence, resolved } = get();
      clearTimer();
      const clamped = Math.max(-1, Math.min(sequence.length - 1, index));
      // Jumping forward over gates auto-resolves them (presenter deliberately skipping ahead).
      const auto = sequence.slice(0, clamped).filter((s) => s.requiresHuman).map((s) => s.id);
      const keep = resolved.filter((id) => sequence.findIndex((s) => s.id === id) <= clamped);
      set({ ...recompute({ currentStepIndex: clamped, resolved: Array.from(new Set([...keep, ...auto])) }), isPlaying: false });
    },

    resolveHuman: (action) => {
      const { sequence, currentStepIndex, resolved } = get();
      const step = sequence[currentStepIndex];
      if (!step || step.requiresHuman !== action || resolved.includes(step.id)) return;
      set(recompute({ resolved: [...resolved, step.id] }));
      // Give the resolution beat a moment on screen before auto-advancing.
      const { isPlaying } = get();
      if (isPlaying) {
        clearTimer();
        timer = window.setTimeout(() => {
          const s = get();
          if (s.isPlaying) s.stepForward();
        }, 2600 / get().speed);
      }
    },

    rejectHuman: (action) => {
      const { sequence, currentStepIndex, resolved, rejected } = get();
      const step = sequence[currentStepIndex];
      if (!step || step.requiresHuman !== action || resolved.includes(step.id) || rejected.includes(step.id)) return;
      set(recompute({ rejected: [...rejected, step.id] }));
    },

    triggerFallback: () => {
      const { resolved, branch } = get();
      if (branch === 'fallback') return;
      clearTimer();
      // Land on the first fallback step (the slot "patient reply" occupies on the main path).
      const seq = buildSequence('fallback');
      const landing = FALLBACK_REPLACES_INDEX;
      // Gates before the landing point are auto-resolved; anything at/after it gates again.
      const auto = seq.slice(0, landing).filter((s) => s.requiresHuman).map((s) => s.id);
      const keep = resolved.filter((id) => {
        const i = seq.findIndex((s) => s.id === id);
        return i >= 0 && i < landing;
      });
      set({
        ...recompute({
          branch: 'fallback',
          currentStepIndex: landing,
          resolved: Array.from(new Set([...keep, ...auto])),
        }),
        isPlaying: false,
      });
    },

    setShowGloss: (showGloss) => set({ showGloss }),
    setPresenterMode: (presenterMode) => set({ presenterMode, showGloss: presenterMode ? false : get().showGloss }),
    setViewMode: (viewMode) => set({ viewMode }),
    setAboutOpen: (aboutOpen) => set({ aboutOpen }),
  };
});

/** Convenience selectors. */
export const selectCurrentStep = (s: ScenarioState) => (s.currentStepIndex >= 0 ? s.sequence[s.currentStepIndex] : null);
export const selectPendingHuman = (s: ScenarioState) => pendingHumanAction(s.sequence, s.currentStepIndex, s.resolved);
export const selectIsComplete = (s: ScenarioState) => s.currentStepIndex >= s.sequence.length - 1;
