import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Governance statuses + model-fleet tokens + two neutrals. Every colour here
 * maps back to src/styles/tokens.ts so semantics stay consistent app-wide.
 */
export type BadgeVariant =
  | 'pass'
  | 'pending'
  | 'fail'
  | 'info'
  | 'neutral'
  | 'accent'
  | 'sovereignArabic'
  | 'granite'
  | 'medgemma'
  | 'classicalMl'
  | 'frontier';

/** Static class map so Tailwind's scanner can see every utility. */
const VARIANT_CLASSES: Record<BadgeVariant, { solid: string; soft: string; dot: string }> = {
  pass: {
    solid: 'bg-gov-pass text-white border-gov-pass',
    soft: 'bg-gov-pass/12 text-gov-pass border-gov-pass/35',
    dot: 'bg-gov-pass',
  },
  pending: {
    solid: 'bg-gov-pending text-white border-gov-pending',
    soft: 'bg-gov-pending/12 text-gov-pending border-gov-pending/40',
    dot: 'bg-gov-pending',
  },
  fail: {
    solid: 'bg-gov-fail text-white border-gov-fail',
    soft: 'bg-gov-fail/12 text-gov-fail border-gov-fail/40',
    dot: 'bg-gov-fail',
  },
  info: {
    solid: 'bg-gov-info text-white border-gov-info',
    soft: 'bg-gov-info/12 text-gov-info border-gov-info/35',
    dot: 'bg-gov-info',
  },
  neutral: {
    solid: 'bg-fg-1 text-white border-fg-1',
    soft: 'bg-surface-3/60 text-fg-1 border-surface-4',
    dot: 'bg-fg-2',
  },
  accent: {
    solid: 'bg-accent text-white border-accent',
    soft: 'bg-accent/10 text-accent border-accent/40',
    dot: 'bg-accent',
  },
  sovereignArabic: {
    solid: 'bg-model-sovereign-arabic text-white border-model-sovereign-arabic',
    soft: 'bg-model-sovereign-arabic/12 text-model-sovereign-arabic border-model-sovereign-arabic/40',
    dot: 'bg-model-sovereign-arabic',
  },
  granite: {
    solid: 'bg-model-granite text-white border-model-granite',
    soft: 'bg-model-granite/14 text-model-granite border-model-granite/45',
    dot: 'bg-model-granite',
  },
  medgemma: {
    solid: 'bg-model-medgemma text-white border-model-medgemma',
    soft: 'bg-model-medgemma/12 text-model-medgemma border-model-medgemma/40',
    dot: 'bg-model-medgemma',
  },
  classicalMl: {
    solid: 'bg-model-classical-ml text-white border-model-classical-ml',
    soft: 'bg-model-classical-ml/12 text-model-classical-ml border-model-classical-ml/40',
    dot: 'bg-model-classical-ml',
  },
  frontier: {
    solid: 'bg-model-frontier text-white border-model-frontier',
    soft: 'bg-model-frontier/12 text-model-frontier border-model-frontier/40',
    dot: 'bg-model-frontier',
  },
};

interface BadgeProps {
  variant?: BadgeVariant;
  /** `soft` (default) is a tinted chip; `solid` is a filled pill for emphasis. */
  tone?: 'soft' | 'solid';
  size?: 'sm' | 'md';
  /** Leading status dot. */
  dot?: boolean;
  /** Leading icon slot (lucide icon). */
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  title?: string;
}

/** Status / model-routing chip. Colour is driven entirely by `variant`. */
export function Badge({
  variant = 'neutral',
  tone = 'soft',
  size = 'sm',
  dot = false,
  icon,
  children,
  className,
  title,
}: BadgeProps) {
  const v = VARIANT_CLASSES[variant];
  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded border font-medium',
        size === 'sm' ? 'h-5 px-1.5 text-caption' : 'h-6 px-2 text-[0.75rem]',
        v[tone],
        className,
      )}
    >
      {dot ? <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', v.dot)} /> : null}
      {icon ? <span className="flex shrink-0 [&>svg]:h-3 [&>svg]:w-3">{icon}</span> : null}
      {children}
    </span>
  );
}

export { VARIANT_CLASSES as BADGE_VARIANT_CLASSES };

