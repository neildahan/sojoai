import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function RootLoading(): React.ReactElement {
  return (
    <main
      aria-busy="true"
      aria-label="Loading"
      className="mx-auto flex max-w-3xl flex-col gap-6 px-8 py-24"
    >
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="h-12 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </main>
  );
}
