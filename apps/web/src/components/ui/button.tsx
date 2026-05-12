import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Button — the canonical interactive primitive.
 *
 * Variants:
 *   intent: primary | secondary | ghost | danger
 *   size:   sm | md | lg | icon
 *
 * Sojo AI's primary button is warm-900 (`#1A1814`) — same hue as the dark
 * sidebar — to anchor calls-to-action against the warm-100 page background.
 */

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-medium transition-[transform,background,box-shadow] duration-150',
    'focus-visible:outline-none focus-visible:shadow-glow',
    'disabled:pointer-events-none disabled:opacity-50',
  ].join(' '),
  {
    variants: {
      intent: {
        primary: 'bg-warm-900 text-warm-50 shadow-card hover:-translate-y-px',
        secondary:
          'bg-surface-card text-warm-800 shadow-desk border border-warm-200 hover:bg-warm-50',
        ghost: 'bg-transparent text-warm-800 hover:bg-warm-100',
        danger:
          'bg-surface-card text-status-blocked shadow-desk border border-status-blocked/30 hover:bg-status-blocked/5',
      },
      size: {
        sm: 'h-9 px-3 text-sm rounded-sm',
        md: 'h-11 px-6 text-sm rounded-md',
        lg: 'h-12 px-8 text-base rounded-lg',
        icon: 'h-10 w-10 rounded-md',
      },
    },
    defaultVariants: {
      intent: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, intent, size, type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ intent, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
