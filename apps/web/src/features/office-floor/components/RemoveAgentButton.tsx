'use client';

import * as React from 'react';
import { useFormStatus } from 'react-dom';
import { UserMinus, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * RemoveAgentButton — inline two-step "remove from team" control for the
 * DeskCard footer. First click reveals a Yes/Cancel confirmation right
 * inside the desk; second click submits a server action that deletes the
 * Team doc.
 *
 * Not destructive in any deeper sense — conversations and deliverables
 * persist, and the agent can be re-hired any time. Confirmation exists
 * to prevent accidental clicks while still feeling lightweight.
 */

export interface RemoveAgentButtonProps {
  projectId: string;
  agentId: string;
  agentName: string;
  action: (data: FormData) => void | Promise<void>;
  className?: string;
}

export function RemoveAgentButton({
  projectId,
  agentId,
  agentName,
  action,
  className,
}: RemoveAgentButtonProps): React.ReactElement {
  const [confirming, setConfirming] = React.useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={`Remove ${agentName} from team`}
        className={cn(
          'inline-flex h-7 items-center gap-1 rounded-sm px-1.5 text-[11px] font-medium text-warm-500',
          'hover:bg-warm-100 hover:text-warm-800',
          className,
        )}
      >
        <UserMinus className="h-3 w-3" aria-hidden="true" />
        Remove
      </button>
    );
  }

  return (
    <form action={action} className={cn('flex items-center gap-1.5', className)}>
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="agentId" value={agentId} />
      <span className="text-[11px] text-warm-700">Remove?</span>
      <ConfirmSubmit agentName={agentName} />
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="h-7 rounded-sm px-1.5 text-[11px] text-warm-500 hover:bg-warm-100"
      >
        Cancel
      </button>
    </form>
  );
}

function ConfirmSubmit({ agentName }: { agentName: string }): React.ReactElement {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={`Confirm remove ${agentName}`}
      className={cn(
        'inline-flex h-7 items-center gap-1 rounded-sm bg-status-blocked/10 px-2 text-[11px] font-medium text-status-blocked',
        'hover:bg-status-blocked/15 disabled:opacity-50',
      )}
    >
      {pending ? (
        <Loader className="h-3 w-3 animate-spin" aria-hidden="true" />
      ) : (
        <UserMinus className="h-3 w-3" aria-hidden="true" />
      )}
      {pending ? 'Removing…' : 'Yes, remove'}
    </button>
  );
}
