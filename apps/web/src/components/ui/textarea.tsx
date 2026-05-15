import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Textarea — multi-line input matching the Sojo AI focus ring + token palette.
 * Forwards refs; accepts any standard textarea prop.
 */

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, rows = 4, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        'w-full rounded-md border bg-surface-card px-3.5 py-2.5 text-sm text-warm-800',
        'placeholder:text-warm-400 resize-y',
        'focus-visible:outline-none focus-visible:shadow-glow',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-[box-shadow,border-color] duration-150',
        invalid
          ? 'border-status-blocked focus-visible:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]'
          : 'border-warm-200 focus-visible:border-indigo-500',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';
