import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Badge — small inline label. Used for status, role, type, count.
 *
 * Variants:
 *   intent: neutral | accent | success | warning | danger | info | dark
 *   size:   sm | md
 */

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full font-medium select-none',
  {
    variants: {
      intent: {
        neutral: 'bg-warm-100 text-warm-700',
        accent: 'bg-indigo-50 text-indigo-700',
        success: 'bg-status-active/10 text-status-active',
        warning: 'bg-status-busy/10 text-status-busy',
        danger: 'bg-status-blocked/10 text-status-blocked',
        info: 'bg-status-talking/15 text-indigo-700',
        dark: 'bg-warm-900 text-warm-300 font-mono',
      },
      size: {
        sm: 'h-5 px-2 text-[10px] tracking-wide uppercase',
        md: 'h-6 px-2.5 text-xs',
      },
    },
    defaultVariants: {
      intent: 'neutral',
      size: 'md',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, intent, size, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ intent, size }), className)} {...props} />
  ),
);
Badge.displayName = 'Badge';

export { badgeVariants };
