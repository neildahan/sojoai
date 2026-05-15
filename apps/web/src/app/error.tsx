'use client';

import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Root error boundary. Renders for any unhandled error in a route segment.
 * The `reset` function rebuilds the segment without a full reload — handy
 * for transient failures.
 */
export default function RootError({ error, reset }: ErrorProps): React.ReactElement {
  React.useEffect(() => {
    // TODO(phase-6): forward to Sentry / structured logger.
    // eslint-disable-next-line no-console -- intentional client-side error trace
    console.error('Root error boundary:', error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-start justify-center gap-6 px-8">
      <span
        aria-hidden="true"
        className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-status-blocked/10 text-status-blocked"
      >
        <AlertTriangle className="h-5 w-5" />
      </span>
      <h1 className="font-display text-4xl leading-tight font-medium text-warm-900">
        Something went sideways.
      </h1>
      <p className="text-warm-500">
        That wasn&rsquo;t supposed to happen. Try again, or head back to safer ground.
      </p>
      {error.digest ? (
        <p className="font-mono text-[10px] text-warm-400">Error id: {error.digest}</p>
      ) : null}
      <div className="flex items-center gap-3">
        <Button onClick={reset} intent="primary" size="md">
          Try again
        </Button>
        <a
          href="/"
          className="inline-flex h-11 items-center rounded-md border border-warm-200 bg-surface-card px-6 text-sm font-medium text-warm-800 shadow-desk hover:bg-warm-50"
        >
          Back home
        </a>
      </div>
    </main>
  );
}
