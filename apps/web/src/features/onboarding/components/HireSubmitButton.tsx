'use client';

import * as React from 'react';
import { useFormStatus } from 'react-dom';
import { Sparkles, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Submit button for the "Hire X" action on the wizard's meet step.
 *
 * Uses React 19's `useFormStatus` hook to surface the pending state of the
 * enclosing `<form action={...}>` while the server action runs. The button
 * becomes disabled and swaps to "Hiring X…" with a spinner so the click
 * doesn't feel like a dead button.
 */
export interface HireSubmitButtonProps {
  agentName: string;
}

export function HireSubmitButton({ agentName }: HireSubmitButtonProps): React.ReactElement {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" intent="primary" size="lg" disabled={pending}>
      {pending ? (
        <Loader className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Sparkles className="h-4 w-4" aria-hidden="true" />
      )}
      {pending ? `Hiring ${agentName}…` : `Hire ${agentName} — let's start`}
    </Button>
  );
}
