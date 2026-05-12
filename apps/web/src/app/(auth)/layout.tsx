import * as React from 'react';

/**
 * Auth route group layout — centred, no chrome. Used by /sign-in and /sign-up.
 * Route group `(auth)` does not appear in the URL.
 */
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): React.ReactElement {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-page px-4 py-12">
      {children}
    </main>
  );
}
