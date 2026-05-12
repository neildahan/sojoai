import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Sidebar — the dark warm-900 chrome that sits beside project routes.
 * Pure presentational: takes nav items and slots as props.
 *
 * Width is fixed at 240px (per the design system). The page background
 * remains warm-100 — the sidebar contrast is what grounds the whole layout.
 */

export interface SidebarNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  /** Numeric badge (e.g. open task count) shown right-aligned in the row. */
  badge?: number | string;
  active?: boolean;
}

export interface SidebarSection {
  /** Optional uppercase section label rendered above the items. */
  label?: string;
  items: SidebarNavItem[];
}

export interface SidebarProps {
  /** Brand / logo block at the top. */
  brand: React.ReactNode;
  /** Top-of-sidebar contextual block — e.g. <ProjectSwitcher /> on project routes. */
  context?: React.ReactNode;
  sections: SidebarSection[];
  /** Bottom-pinned items (e.g. All projects, Settings). */
  footer?: SidebarNavItem[];
  className?: string;
}

export function Sidebar({
  brand,
  context,
  sections,
  footer,
  className,
}: SidebarProps): React.ReactElement {
  return (
    <aside
      aria-label="Primary"
      className={cn(
        'flex h-screen w-60 shrink-0 flex-col bg-surface-sidebar text-warm-300',
        'border-r border-warm-900/40',
        className,
      )}
    >
      <div className="px-5 py-6">{brand}</div>

      {context ? <div className="px-3 pb-4">{context}</div> : null}

      <nav className="flex-1 overflow-y-auto px-2">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className={cn(sIdx > 0 && 'mt-6')}>
            {section.label ? (
              <span className="block px-3 pb-2 font-mono text-[10px] tracking-widest text-warm-500 uppercase">
                {section.label}
              </span>
            ) : null}
            <ul className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <li key={item.href}>
                  <SidebarLink item={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {footer && footer.length > 0 ? (
        <div className="border-t border-warm-900/40 px-2 py-3">
          <ul className="flex flex-col gap-0.5">
            {footer.map((item) => (
              <li key={item.href}>
                <SidebarLink item={item} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}

function SidebarLink({ item }: { item: SidebarNavItem }): React.ReactElement {
  return (
    <Link
      href={item.href}
      aria-current={item.active ? 'page' : undefined}
      className={cn(
        'flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors',
        '[&_svg]:h-4 [&_svg]:w-4',
        item.active
          ? 'bg-warm-700/50 text-warm-50'
          : 'text-warm-300 hover:bg-warm-700/30 hover:text-warm-50',
      )}
    >
      <span aria-hidden="true" className="inline-flex shrink-0">
        {item.icon}
      </span>
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge !== undefined ? (
        <span className="font-mono text-[10px] text-warm-400">{item.badge}</span>
      ) : null}
    </Link>
  );
}
