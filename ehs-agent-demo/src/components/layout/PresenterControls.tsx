import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import { Badge } from './Badge';
import { cn } from '@/lib/cn';
import { selectIsComplete, selectPendingHuman, useScenarioStore, type Speed } from '@/lib/store/scenarioStore';

const SPEEDS: Speed[] = [0.5, 1, 2];

/**
 * Play / Pause / Step back / Step forward / Reset + speed. Step mode never
 * auto-advances; Play halts on human gates. Keyboard: Space = play/pause,
 * → / ← = step, R = reset.
 */
export function PresenterControls() {
  const isPlaying = useScenarioStore((s) => s.isPlaying);
  const speed = useScenarioStore((s) => s.speed);
  const index = useScenarioStore((s) => s.currentStepIndex);
  const total = useScenarioStore((s) => s.sequence.length);
  const pending = useScenarioStore(selectPendingHuman);
  const complete = useScenarioStore(selectIsComplete);
  const { play, pause, stepForward, stepBack, reset, setSpeed } = useScenarioStore.getState();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      const s = useScenarioStore.getState();
      if (e.code === 'Space') {
        e.preventDefault();
        s.isPlaying ? s.pause() : s.play();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        s.stepForward();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        s.stepBack();
      } else if (e.key === 'r' || e.key === 'R') {
        s.reset();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 rounded-md border border-surface-4 bg-surface-2 p-1">
        <CtrlButton label="Reset (R)" onClick={reset} disabled={index < 0}>
          <RotateCcw className="h-3.5 w-3.5" />
        </CtrlButton>
        <CtrlButton label="Step back (←)" onClick={stepBack} disabled={index < 0}>
          <ChevronLeft className="h-4 w-4" />
        </CtrlButton>
        {isPlaying ? (
          <CtrlButton label="Pause (Space)" onClick={pause} primary>
            <Pause className="h-4 w-4" />
          </CtrlButton>
        ) : (
          <CtrlButton label="Play (Space)" onClick={play} disabled={complete} primary>
            <Play className="h-4 w-4" />
          </CtrlButton>
        )}
        <CtrlButton
          label={pending ? 'Waiting for human decision' : 'Step forward (→)'}
          onClick={stepForward}
          disabled={complete || pending !== null}
        >
          <ChevronRight className="h-4 w-4" />
        </CtrlButton>
      </div>

      <div className="flex items-center rounded-md border border-surface-4 bg-surface-2 p-0.5">
        {SPEEDS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSpeed(s)}
            className={cn(
              'h-6 rounded px-2 font-mono text-caption transition-colors',
              speed === s ? 'bg-accent text-white' : 'text-fg-2 hover:text-fg-0',
            )}
          >
            {s}×
          </button>
        ))}
      </div>

      <div className="hidden min-w-[92px] items-center justify-end lg:flex">
        {pending ? (
          <Badge variant="pending" tone="solid">
            Human gate
          </Badge>
        ) : (
          <span className="font-mono text-caption text-fg-2">
            step {Math.max(0, index + 1)} / {total}
          </span>
        )}
      </div>
    </div>
  );
}

function CtrlButton({
  children,
  label,
  onClick,
  disabled,
  primary,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex h-7 items-center justify-center rounded transition-colors disabled:cursor-not-allowed disabled:opacity-35',
        primary ? 'w-9 bg-accent text-white hover:bg-accent-lo' : 'w-7 text-fg-1 hover:bg-surface-3 hover:text-fg-0',
      )}
    >
      {children}
    </button>
  );
}
