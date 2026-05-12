import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * TopBar — the lightweight chrome used on cross-project surfaces (/app/home,
 * marketing). Project routes use the dark Sidebar instead; the two are
 * intentionally never visible together.
 */

export interface TopBarProps {
  /** Brand block (logo + wordmark). */
  brand: React.ReactNode;
  /** Right-side actions: bell, avatar, "New project", etc. */
  actions?: React.ReactNode;
  /** Optional center slot — breadcrumb or page title. */
  center?: React.ReactNode;
  className?: string;
}

export function TopBar({
  brand,
  actions,
  center,
  className,
}: TopBarProps): React.ReactElement {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-warm-200 bg-surface-page/85 px-6 backdrop-blur',
        className,
      )}
    >
      <Link
        href="/"
        className="inline-flex items-center gap-2 font-display text-base font-medium text-warm-900 hover:opacity-80"
      >
        {brand}
      </Link>
      {center ? <div className="flex-1 min-w-0">{center}</div> : <div className="flex-1" />}
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}
