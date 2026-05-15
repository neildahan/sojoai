import * as React from 'react';
import Link from 'next/link';

/**
 * Onboarding shell — intentionally minimal. No sidebar, no TopBar.
 * Just brand + centred content. Used by /app/onboarding/*.
 *
 * Auth is enforced by `proxy.ts` (`/app(.*)` matcher). New sign-ups land
 * here via NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL.
 */
export default function OnboardingShell({
  children,
}: Readonly<{ children: React.ReactNode }>): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-8 py-6">
        <Link
          href="/app/home"
          aria-label="Skip onboarding and go to home"
          className="inline-flex items-center gap-2 font-display text-lg italic text-warm-900 hover:opacity-80"
        >
          Sojo<span className="text-warm-500">AI</span>
        </Link>
      </header>
      <main className="flex flex-1 flex-col items-center justify-start px-6 pb-16">
        {children}
      </main>
    </div>
  );
}
