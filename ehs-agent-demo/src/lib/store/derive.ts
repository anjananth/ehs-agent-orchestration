import type {
  AgentId,
  AgentStatus,
  AuditEvent,
  ChatMessage,
  DischargeBundle,
  FleetModelId,
  GovernanceCheck,
  RiskScore,
  ScenarioStep,
  StepEffects,
} from '@/types';
import { AGENTS } from '@/data/agents';
import { CASE_BUNDLE } from '@/data/case';

/** Everything the three panels need, derived purely from (sequence, index, resolved). */
export interface DerivedState {
  nodeStatus: Record<AgentId, AgentStatus>;
  activeEdges: Array<[AgentId, AgentId]>;
  pulse: AgentId | null;
  events: AuditEvent[];
  checks: GovernanceCheck[];
  modelsInvoked: FleetModelId[];
  riskScore: RiskScore | null;
  /** Approval gate to show, if the current step opened one and it isn't resolved. */
  openApproval: 'pre-send' | 'nurse-escalation' | null;
  messages: ChatMessage[];
  typing: 'amal' | 'patient' | null;
  bundle: DischargeBundle;
}

export function initialNodeStatus(): Record<AgentId, AgentStatus> {
  const out = {} as Record<AgentId, AgentStatus>;
  for (const id of Object.keys(AGENTS) as AgentId[]) out[id] = AGENTS[id].status;
  return out;
}

export function emptyDerivedState(): DerivedState {
  return {
    nodeStatus: initialNodeStatus(),
    activeEdges: [],
    pulse: null,
    events: [],
    checks: [],
    modelsInvoked: [],
    riskScore: null,
    openApproval: null,
    messages: [],
    typing: null,
    bundle: structuredClone(CASE_BUNDLE),
  };
}

function applyEffects(state: DerivedState, fx: StepEffects, isCurrent: boolean): void {
  const { canvasEffect, governanceEffect, chatEffect, bundleEffect } = fx;

  if (canvasEffect) {
    if (canvasEffect.nodeStatus) Object.assign(state.nodeStatus, canvasEffect.nodeStatus);
    if (canvasEffect.activeEdges) state.activeEdges = canvasEffect.activeEdges;
    if (isCurrent && canvasEffect.pulse) state.pulse = canvasEffect.pulse;
  }

  if (governanceEffect) {
    if (governanceEffect.appendEvents) state.events.push(...governanceEffect.appendEvents);
    if (governanceEffect.checks) state.checks = governanceEffect.checks;
    if (governanceEffect.modelsInvoked) state.modelsInvoked = governanceEffect.modelsInvoked;
    if (governanceEffect.riskScore) state.riskScore = governanceEffect.riskScore;
  }

  if (chatEffect) {
    if (chatEffect.appendMessages) state.messages.push(...chatEffect.appendMessages);
    if (isCurrent && chatEffect.typing) state.typing = chatEffect.typing;
  }

  if (bundleEffect?.addServiceRequest) {
    if (!state.bundle.serviceRequests.some((s) => s.id === bundleEffect.addServiceRequest!.id)) {
      state.bundle.serviceRequests.push(bundleEffect.addServiceRequest);
    }
  }
}

/**
 * Fold step effects 0..index. Deterministic: stepping back is just folding
 * to a smaller index; reset is index -1.
 *
 * @param resolved ids of human-gated steps whose action has been taken.
 * @param rejected ids of human-gated steps where the human first rejected.
 */
export function deriveState(
  sequence: ScenarioStep[],
  index: number,
  resolved: ReadonlySet<string>,
  rejected: ReadonlySet<string> = new Set(),
): DerivedState {
  const state = emptyDerivedState();
  for (let i = 0; i <= index && i < sequence.length; i++) {
    const step = sequence[i];
    const isCurrent = i === index;
    applyEffects(state, step, isCurrent);

    if (step.requiresHuman && rejected.has(step.id) && step.onReject) {
      applyEffects(state, step.onReject, false);
    }

    const gate = step.governanceEffect?.openApproval ?? null;
    if (step.requiresHuman && resolved.has(step.id)) {
      if (step.onResolve) applyEffects(state, step.onResolve, isCurrent);
      if (isCurrent) state.openApproval = null;
    } else if (isCurrent && gate) {
      state.openApproval = gate;
    }
  }
  // Only the current step's typing indicator matters; messages already landed for earlier steps.
  if (index >= 0 && index < sequence.length) {
    const cur = sequence[index];
    const curTyping = cur.chatEffect?.typing ?? (resolved.has(cur.id) ? cur.onResolve?.chatEffect?.typing : undefined);
    state.typing = curTyping ?? null;
  }
  return state;
}
