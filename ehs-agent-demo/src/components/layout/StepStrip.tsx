import { AnimatePresence, motion } from 'framer-motion';
import { Badge } from './Badge';
import { cn } from '@/lib/cn';
import { selectCurrentStep, selectPendingHuman, useScenarioStore } from '@/lib/store/scenarioStore';

/**
 * Bottom bar: step progress dots + current step title/narration. Clicking a
 * dot jumps to that step (presenter shortcut).
 */
export function StepStrip() {
  const sequence = useScenarioStore((s) => s.sequence);
  const index = useScenarioStore((s) => s.currentStepIndex);
  const branch = useScenarioStore((s) => s.branch);
  const step = useScenarioStore(selectCurrentStep);
  const pending = useScenarioStore(selectPendingHuman);
  const jumpTo = useScenarioStore((s) => s.jumpTo);

  return (
    <div className="flex h-[76px] shrink-0 items-center gap-4 border-t border-surface-4 bg-surface-1 px-5">
      {/* Progress dots */}
      <ol className="flex shrink-0 items-center gap-1">
        {sequence.map((s, i) => {
          const done = i < index;
          const cur = i === index;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => jumpTo(i)}
                title={`${i + 1}. ${s.title}`}
                className={cn(
                  'flex h-6 min-w-6 items-center justify-center rounded px-1 font-mono text-[0.65rem] transition-colors',
                  cur && (pending ? 'bg-gov-pending text-white' : 'bg-accent text-white'),
                  done && 'bg-surface-3 text-fg-1',
                  !cur && !done && 'text-fg-3 hover:bg-surface-3 hover:text-fg-1',
                  s.branch === 'fallback' && 'border border-dashed border-fg-3',
                )}
              >
                {i + 1}
              </button>
            </li>
          );
        })}
      </ol>

      {/* Narration */}
      <div className="min-w-0 flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step?.id ?? 'idle'}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="flex min-w-0 flex-col"
          >
            <div className="flex items-center gap-2">
              <span className="truncate font-heading text-[0.9rem] font-semibold text-accent">
                {step ? `${index + 1}. ${step.title}` : 'Ready — press Play or Step to begin'}
              </span>
              {step?.requiresHuman ? (
                <Badge variant={pending ? 'pending' : 'pass'} dot>
                  {pending ? 'Awaiting human' : 'Human decision recorded'}
                </Badge>
              ) : null}
              {branch === 'fallback' ? <Badge variant="neutral">Fallback path · Hamda</Badge> : null}
            </div>
            <p className="truncate text-log text-fg-2" title={step?.description}>
              {step
                ? step.description
                : 'Post-discharge journey for Fatima Al Mazrouei (fictional), 58, cardiology discharge. 12 steps, ~90 s at 1×.'}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
