import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Input — a single-line text input with the Sojo AI focus ring.
 * Wraps native <input>, forwards refs, accepts any standard input prop.
 */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        aria-invalid={invalid || undefined}
        className={cn(
          'h-11 w-full rounded-md border bg-surface-card px-3.5 py-2 text-sm text-warm-800',
          'placeholder:text-warm-400',
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
    );
  },
);
Input.displayName = 'Input';
