'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * NeedToggleCard — toggleable card used in Step 3 (what do you need).
 * Renders as a `<label>` wrapping a hidden checkbox, so it submits in a
 * normal form (the server action reads `formData.getAll('need')`).
 *
 * Client component for the toggle visual state — the underlying input is
 * a real checkbox so the form works without JS too.
 */

export interface NeedToggleCardProps {
  /** The form value submitted when checked. */
  value: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  /** Pastel bg behind the icon. Match the agent palette when relevant. */
  iconBg?: string;
  /** Render as initially selected. */
  defaultChecked?: boolean;
}

export function NeedToggleCard({
  value,
  title,
  description,
  icon,
  iconBg = 'bg-warm-100',
  defaultChecked = false,
}: NeedToggleCardProps): React.ReactElement {
  const [checked, setChecked] = React.useState(defaultChecked);
  return (
    <label
      className={cn(
        'group flex cursor-pointer items-start gap-4 rounded-lg border bg-surface-card p-5 shadow-desk transition-all',
        'hover:shadow-card focus-within:shadow-glow',
        checked
          ? 'border-indigo-400 ring-1 ring-indigo-400/40'
          : 'border-warm-200 hover:border-warm-300',
      )}
    >
      <input
        type="checkbox"
        name="need"
        value={value}
        defaultChecked={defaultChecked}
        onChange={(e) => setChecked(e.target.checked)}
        className="sr-only"
        aria-label={title}
      />
      <span
        className={cn(
          'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-warm-700',
          '[&_svg]:h-5 [&_svg]:w-5',
          iconBg,
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-base italic text-warm-900">{title}</h3>
        <p className="mt-1 text-xs text-warm-500">{description}</p>
      </div>
      <span
        aria-hidden="true"
        className={cn(
          'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
          checked
            ? 'border-indigo-500 bg-indigo-500 text-white'
            : 'border-warm-300 bg-transparent text-transparent',
        )}
      >
        <Check className="h-3 w-3" />
      </span>
    </label>
  );
}
