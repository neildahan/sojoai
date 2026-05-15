import * as React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ChoiceCard — large clickable card for single-select navigation.
 * Used in Step 1 (fresh vs existing) and Step 2-existing (integrations).
 *
 * Always renders as a `<Link>` — keep it semantic and progressive-enhancement
 * friendly. For multi-select toggles, use NeedToggleCard.
 */

export interface ChoiceCardProps {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg?: string;
  className?: string;
}

export function ChoiceCard({
  href,
  title,
  description,
  icon,
  iconBg = 'bg-indigo-50',
  className,
}: ChoiceCardProps): React.ReactElement {
  return (
    <Link
      href={href}
      className={cn(
        'group flex flex-col items-start gap-5 rounded-lg border border-warm-200 bg-surface-card p-7 text-left shadow-desk transition-shadow',
        'hover:shadow-card focus-visible:outline-none focus-visible:shadow-glow',
        className,
      )}
    >
      <span
        className={cn(
          'inline-flex h-12 w-12 items-center justify-center rounded-md text-warm-700',
          '[&_svg]:h-5 [&_svg]:w-5',
          iconBg,
        )}
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <h3 className="font-display text-xl font-medium text-warm-900">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-warm-500">{description}</p>
      </div>
      <span className="mt-auto inline-flex items-center gap-1.5 text-sm text-warm-600 transition-colors group-hover:text-indigo-600">
        Continue
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
