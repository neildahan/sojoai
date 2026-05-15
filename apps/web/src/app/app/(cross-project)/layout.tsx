import * as React from 'react';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { TopBar } from '@/components/layout/TopBar';
import { buttonVariants } from '@/components/ui/button';

/**
 * Cross-project app shell. Used by /app/home and /app/onboarding/*.
 *
 * Project routes (/app/[projectId]/*) get their OWN nested layout with the
 * dark Sidebar — see app/app/[projectId]/layout.tsx (added in a later batch).
 *
 * Auth is enforced by `proxy.ts` matcher (`/app(.*)`). By the time this
 * layout renders, Clerk has confirmed the session.
 */
export default function WorkspaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar
        brand={
          <>
            <span className="font-display text-lg italic">Sojo</span>
            <span className="text-warm-500">AI</span>
          </>
        }
        actions={
          <>
            <Link
              href="/app/onboarding/start"
              className={buttonVariants({ intent: 'primary', size: 'sm' })}
            >
              + New project
            </Link>
            <UserButton />
          </>
        }
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}
