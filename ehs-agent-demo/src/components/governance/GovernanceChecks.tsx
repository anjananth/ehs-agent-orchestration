import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, CircleDashed, ShieldAlert } from 'lucide-react';
import type { GovernanceCheck, GovernanceCheckStatus } from '@/types';
import { Badge, type BadgeVariant } from '@/components/layout';
import { cn } from '@/lib/cn';

interface GovernanceChecksProps {
  checks: GovernanceCheck[];
  className?: string;
}

const STATUS: Record<GovernanceCheckStatus, { variant: BadgeVariant; label: string; Icon: typeof CheckCircle2; row: string }> = {
  pass: { variant: 'pass', label: 'Pass', Icon: CheckCircle2, row: 'border-gov-pass/30' },
  pending: { variant: 'pending', label: 'Pending', Icon: CircleDashed, row: 'border-gov-pending/40' },
  fail: { variant: 'fail', label: 'Flagged', Icon: ShieldAlert, row: 'border-gov-fail/60 bg-gov-fail/[0.06]' },
};

/** Pre-send checkpoint chips. The flagged check shakes once on first appearance. */
export function GovernanceChecks({ checks, className }: GovernanceChecksProps) {
  if (checks.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-md border border-dashed border-surface-4 py-3 text-caption text-fg-3',
          className,
        )}
      >
        No checkpoint active
      </div>
    );
  }
  return (
    <ul className={cn('flex flex-col gap-1.5', className)}>
      <AnimatePresence initial={false}>
        {checks.map((c, i) => {
          const s = STATUS[c.status];
          return (
            <motion.li
              key={`${c.id}-${c.status}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, position: 'absolute' }}
              transition={{ duration: 0.2, delay: i * 0.12 }}
              title={c.status !== 'fail' ? c.detail : undefined}
              className={cn(
                'rounded-md border bg-surface-2/60 px-2.5',
                c.status === 'fail' ? 'py-2' : 'py-1.5',
                s.row,
                c.status === 'fail' && 'animate-shake',
              )}
              style={c.status === 'fail' ? { animationDelay: `${i * 0.12 + 0.2}s` } : undefined}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-[0.8rem] font-medium text-fg-0">
                  <s.Icon
                    className={cn(
                      'h-3.5 w-3.5',
                      c.status === 'pass' && 'text-gov-pass',
                      c.status === 'pending' && 'animate-spin text-gov-pending [animation-duration:2.5s]',
                      c.status === 'fail' && 'text-gov-fail',
                    )}
                  />
                  {c.label}
                </span>
                <span className="flex items-center gap-1.5">
                  {c.policyRef ? <span className="font-mono text-[0.62rem] text-fg-3">{c.policyRef}</span> : null}
                  <Badge variant={s.variant} tone={c.status === 'fail' ? 'solid' : 'soft'} dot={c.status !== 'fail'}>
                    {s.label}
                  </Badge>
                </span>
              </div>
              {c.status === 'fail' ? <p className="mt-1 text-log leading-snug text-fg-0">{c.detail}</p> : null}
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
