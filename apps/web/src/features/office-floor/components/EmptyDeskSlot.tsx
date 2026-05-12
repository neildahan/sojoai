import * as React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * EmptyDeskSlot — placeholder for an un-hired agent role on the Office Floor.
 * Links to the Hiring Room.
 */

export interface EmptyDeskSlotProps {
  projectId: string;
  className?: string;
}

export function EmptyDeskSlot({ projectId, className }: EmptyDeskSlotProps): React.ReactElement {
  return (
    <Link
      href={`/app/${projectId}/hire`}
      aria-label="Hire a new agent"
      className={cn(
        'flex min-h-40 flex-col items-center justify-center gap-2 rounded-desk',
        'border border-dashed border-warm-300 bg-transparent text-warm-400',
        'transition-colors hover:border-indigo-400 hover:bg-indigo-50/40 hover:text-indigo-600',
        'focus-visible:outline-none focus-visible:shadow-glow',
        className,
      )}
    >
      <Plus className="h-5 w-5" aria-hidden="true" />
      <span className="text-xs font-medium">Hire from Hiring Room</span>
    </Link>
  );
}
