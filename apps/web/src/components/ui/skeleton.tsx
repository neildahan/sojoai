import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Skeleton — loading placeholder. Use during route transitions and Suspense
 * fallbacks. Respects `prefers-reduced-motion` (pulse animation disabled).
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return (
    <div
      role="status"
      aria-busy="true"
      className={cn('animate-pulse-soft rounded-md bg-warm-200/60', className)}
      {...props}
    />
  );
}
