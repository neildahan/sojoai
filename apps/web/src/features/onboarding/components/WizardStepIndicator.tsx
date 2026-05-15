import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * WizardStepIndicator — "Step n of N" + dotted progress.
 * Used at the top of every onboarding step page.
 */

export interface WizardStepIndicatorProps {
  current: number;
  total: number;
  className?: string;
}

export function WizardStepIndicator({
  current,
  total,
  className,
}: WizardStepIndicatorProps): React.ReactElement {
  return (
    <div
      aria-label={`Step ${current} of ${total}`}
      className={cn('flex items-center gap-3', className)}
    >
      <span className="font-mono text-[10px] tracking-widest text-warm-500 uppercase">
        Step {current} of {total}
      </span>
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => {
          const step = i + 1;
          const filled = step <= current;
          const isCurrent = step === current;
          return (
            <span
              key={step}
              aria-hidden="true"
              className={cn(
                'block h-1.5 rounded-full transition-[width,background]',
                isCurrent ? 'w-6 bg-indigo-500' : filled ? 'w-1.5 bg-warm-400' : 'w-1.5 bg-warm-200',
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
