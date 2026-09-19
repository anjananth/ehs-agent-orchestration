import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ArabicTextProps {
  /** Arabic string — rendered RTL. PLACEHOLDER copy until native-speaker review. */
  children: ReactNode;
  className?: string;
  /** Larger patient-facing size. */
  size?: 'md' | 'lg';
}

/**
 * The single RTL-aware wrapper for all Arabic patient-facing content.
 * Sets `dir="rtl"`, `lang="ar"`, right-aligns, and uses `unicode-bidi: isolate`
 * so embedded Latin/digits (e.g. "80") don't break the run.
 */
export function ArabicText({ children, className, size = 'md' }: ArabicTextProps) {
  return (
    <span
      dir="rtl"
      lang="ar"
      className={cn(
        // Noto Kufi Arabic — the Arabic face ehs.gov.ae uses.
        'block font-arabic text-right [unicode-bidi:isolate]',
        size === 'lg' ? 'text-[1rem] leading-[1.9]' : 'text-[0.9rem] leading-[1.8]',
        className,
      )}
    >
      {children}
    </span>
  );
}
