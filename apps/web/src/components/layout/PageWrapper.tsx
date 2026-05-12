import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * PageWrapper — vertical rhythm container used inside `/app/*` routes.
 * Centres content, applies the canonical 56px / 32px padding from the
 * design system, and exposes optional `eyebrow` + `title` + `description`
 * header slots.
 */

export interface PageWrapperProps {
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Max content width. Default 1080px (matches the design system page width). */
  size?: 'narrow' | 'default' | 'wide';
}

const SIZE_CLASS: Record<NonNullable<PageWrapperProps['size']>, string> = {
  narrow: 'max-w-2xl',
  default: 'max-w-[1080px]',
  wide: 'max-w-[1280px]',
};

export function PageWrapper({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
  size = 'default',
}: PageWrapperProps): React.ReactElement {
  const hasHeader = Boolean(eyebrow || title || description || actions);
  return (
    <div className={cn('mx-auto w-full px-8 py-14', SIZE_CLASS[size], className)}>
      {hasHeader ? (
        <header className="mb-12 flex items-start justify-between gap-6">
          <div className="min-w-0">
            {eyebrow ? (
              <span className="font-mono text-[10px] tracking-widest text-warm-400 uppercase">
                {eyebrow}
              </span>
            ) : null}
            {title ? (
              <h1 className="mt-2 font-display text-4xl leading-tight font-medium text-warm-900">
                {title}
              </h1>
            ) : null}
            {description ? (
              <p className="mt-3 max-w-2xl text-warm-500">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex items-center gap-2 shrink-0">{actions}</div> : null}
        </header>
      ) : null}
      {children}
    </div>
  );
}
