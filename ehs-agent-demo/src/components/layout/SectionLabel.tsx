import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface SectionLabelProps {
  children: ReactNode;
  className?: string;
  /** Optional right-aligned slot (count, status, action). */
  trailing?: ReactNode;
}

/** Small uppercase caption used to label sections inside panels. */
export function SectionLabel({ children, className, trailing }: SectionLabelProps) {
  return (
    <div className={cn('flex items-center justify-between gap-2', className)}>
      <span className="text-caption uppercase tracking-[0.08em] text-fg-2">{children}</span>
      {trailing ? <span className="text-caption text-fg-2">{trailing}</span> : null}
    </div>
  );
}
