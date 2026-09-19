import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { AuditEvent, AuditSeverity } from '@/types';
import { FLEET_MODELS } from '@/data/models';
import { Badge } from '@/components/layout';
import { cn } from '@/lib/cn';
import { model as modelTokens } from '@/styles/tokens';

interface AuditFeedProps {
  events: AuditEvent[];
  className?: string;
  /** Compact strip mode (Clinical Ops view) — one line per event. */
  compact?: boolean;
}

const SEVERITY_RAIL: Record<AuditSeverity, string> = {
  info: 'bg-gov-info',
  pass: 'bg-gov-pass',
  pending: 'bg-gov-pending',
  fail: 'bg-gov-fail',
};

function fmtTs(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  return { date, time };
}

/** Timestamped, monospace-leaning audit log. Auto-scrolls to newest. */
export function AuditFeed({ events, className, compact = false }: AuditFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [events.length]);

  return (
    <div ref={scrollRef} className={cn('min-h-0 overflow-y-auto pr-1', className)}>
      {events.length === 0 ? (
        <div className="flex h-full min-h-32 items-center justify-center rounded-md border border-dashed border-surface-4 text-caption text-fg-3">
          No events yet — waiting for ADT^A03 discharge trigger
        </div>
      ) : (
        <ol className="flex flex-col gap-1">
          <AnimatePresence initial={false}>
            {events.map((e) => {
              const { date, time } = fmtTs(e.timestamp);
              const model = e.relatedModel ? FLEET_MODELS[e.relatedModel] : null;
              return (
                <motion.li
                  key={e.id}
                  layout="position"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  className={cn(
                    'relative grid gap-x-3 rounded-md border border-surface-3/80 bg-surface-2/50 py-1.5 pl-3 pr-2.5',
                    compact ? 'grid-cols-[auto_1fr] items-center' : 'grid-cols-[auto_1fr]',
                  )}
                  style={
                    model
                      ? { borderLeft: `3px solid ${modelTokens[model.colourToken]}` }
                      : undefined
                  }
                >
                  {!model ? (
                    <span className={cn('absolute inset-y-1.5 left-0 w-[3px] rounded-r', SEVERITY_RAIL[e.severity])} />
                  ) : null}
                  <div className="flex flex-col font-mono text-[0.66rem] leading-tight text-fg-2">
                    <span className="text-fg-1">{time}</span>
                    <span className="text-fg-3">{date}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="font-mono text-[0.66rem] uppercase tracking-wide text-fg-2">{e.actor}</span>
                      {model ? (
                        <Badge variant={model.colourToken} dot>
                          {model.name}
                        </Badge>
                      ) : null}
                      {e.humanDecision ? (
                        <Badge variant="pass" tone="solid">
                          Human · {e.humanDecision}
                        </Badge>
                      ) : null}
                    </div>
                    <div
                      className={cn(
                        'text-[0.78rem] font-medium leading-snug',
                        e.severity === 'fail' ? 'text-gov-fail' : e.severity === 'pending' ? 'text-gov-pending' : 'text-fg-0',
                      )}
                    >
                      {e.action}
                    </div>
                    {!compact ? <div className="text-log leading-snug text-fg-2">{e.detail}</div> : null}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>
      )}
    </div>
  );
}
