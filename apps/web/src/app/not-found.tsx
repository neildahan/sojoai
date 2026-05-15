import * as React from 'react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export const metadata = { title: 'Not found' };

export default function NotFoundPage(): React.ReactElement {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-start justify-center gap-6 px-8">
      <span className="font-mono text-[10px] tracking-widest text-warm-400 uppercase">404</span>
      <h1 className="font-display text-5xl leading-tight font-medium text-warm-900">
        Nothing lives here.
      </h1>
      <p className="text-warm-500">
        The page you&rsquo;re looking for doesn&rsquo;t exist, was renamed, or hasn&rsquo;t been
        built yet. Pick somewhere to go.
      </p>
      <div className="flex items-center gap-3">
        <Link href="/" className={buttonVariants({ intent: 'primary', size: 'md' })}>
          Back home
        </Link>
        <Link href="/app/home" className={buttonVariants({ intent: 'ghost', size: 'md' })}>
          Workspace
        </Link>
      </div>
    </main>
  );
}
