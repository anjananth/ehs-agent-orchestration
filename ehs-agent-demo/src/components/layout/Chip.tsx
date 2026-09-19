import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ChipProps {
  children: ReactNode;
  /** Highlighted (selected / active) state. */
  active?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
  className?: string;
  title?: string;
  disabled?: boolean;
}

/**
 * Neutral, optionally interactive pill — for filters, toggles and labels
 * that carry no governance meaning. Coloured status chips use `Badge`.
 */
export function Chip({ children, active = false, onClick, icon, className, title, disabled }: ChipProps) {
  const Comp = onClick ? 'button' : 'span';
  return (
    <Comp
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={cn(
        'inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 text-caption transition-colors',
        active ? 'border-accent/60 bg-accent/10 text-accent' : 'border-surface-4 bg-surface-1 text-accent',
        onClick && !disabled && 'hover:border-accent hover:bg-accent/5',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      {icon ? <span className="flex [&>svg]:h-3 [&>svg]:w-3">{icon}</span> : null}
      {children}
    </Comp>
  );
}
