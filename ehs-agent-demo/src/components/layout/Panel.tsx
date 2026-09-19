import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface PanelProps {
  title?: ReactNode;
  /** Small caption rendered under/next to the title. */
  subtitle?: ReactNode;
  /** Right-aligned header slot for controls, badges, counts. */
  actions?: ReactNode;
  /** Leading icon in the header. */
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** Remove body padding — for full-bleed content like the reactflow canvas. */
  flush?: boolean;
  /** Visual level — `raised` is used for cards nested inside a panel. */
  level?: 'panel' | 'raised';
}

/**
 * Titled dark container. The default `panel` level sits on the page
 * background; `raised` sits inside another panel.
 */
export function Panel({
  title,
  subtitle,
  actions,
  icon,
  children,
  className,
  flush = false,
  level = 'panel',
}: PanelProps) {
  const hasHeader = title || actions || subtitle;
  return (
    <section
      className={cn(
        'flex min-h-0 flex-col overflow-hidden rounded-card border',
        level === 'panel'
          ? 'border-surface-4 bg-surface-1 shadow-panel'
          : 'border-surface-3 bg-surface-2',
        className,
      )}
    >
      {hasHeader ? (
        <header
          className={cn(
            'flex shrink-0 items-center gap-2 border-b border-surface-3 px-4',
            level === 'panel' ? 'h-11 bg-surface-2/60' : 'h-9 px-3',
          )}
        >
          {icon ? <span className="flex text-fg-2">{icon}</span> : null}
          <div className="flex min-w-0 flex-1 items-baseline gap-2">
            {title ? (
              <h2 className="truncate font-heading text-panel-heading text-accent">{title}</h2>
            ) : null}
            {subtitle ? <span className="truncate text-caption text-fg-2">{subtitle}</span> : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      <div className={cn('relative min-h-0 flex-1', flush ? '' : 'overflow-auto p-4')}>{children}</div>
    </section>
  );
}
