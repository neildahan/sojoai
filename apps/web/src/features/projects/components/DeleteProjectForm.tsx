'use client';

import * as React from 'react';
import { useFormStatus } from 'react-dom';
import { AlertTriangle, Trash2, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * DeleteProjectForm — danger-zone form on the settings page.
 *
 * Two-step:
 *   1. Click the "Delete this project" button → expands an inline
 *      confirmation panel.
 *   2. Type the project name → unlocks the final destructive button.
 *
 * Submit hits `deleteProjectAction` (server). useFormStatus is used to
 * show "Deleting…" with a spinner while the action runs.
 */

export interface DeleteProjectFormProps {
  projectId: string;
  projectName: string;
  /** Server action that performs the cascade delete. */
  action: (data: FormData) => void | Promise<void>;
  /** Pre-set when the action redirects back with an error. */
  initialError?: 'name-mismatch';
}

export function DeleteProjectForm({
  projectId,
  projectName,
  action,
  initialError,
}: DeleteProjectFormProps): React.ReactElement {
  const [confirming, setConfirming] = React.useState(initialError === 'name-mismatch');
  const [typed, setTyped] = React.useState('');
  const namesMatch = typed.trim() === projectName;
  const invalid = initialError === 'name-mismatch' && typed.length === 0;

  if (!confirming) {
    return (
      <section className="flex flex-col gap-3 rounded-lg border border-status-blocked/30 bg-status-blocked/5 p-5">
        <header className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-status-blocked/10 text-status-blocked"
          >
            <Trash2 className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-base italic text-warm-900">Delete this project</h3>
            <p className="mt-1 text-xs text-warm-600">
              Permanently removes the project and everything attached — team, tasks, deliverables,
              chat history. This cannot be undone.
            </p>
          </div>
        </header>
        <div className="flex justify-end">
          <Button
            type="button"
            intent="danger"
            size="sm"
            onClick={() => setConfirming(true)}
          >
            Delete this project
          </Button>
        </div>
      </section>
    );
  }

  return (
    <form
      action={action}
      className="flex flex-col gap-4 rounded-lg border border-status-blocked/50 bg-status-blocked/5 p-5"
    >
      <header className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-status-blocked/15 text-status-blocked"
        >
          <AlertTriangle className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-base italic text-warm-900">
            Type <span className="font-mono not-italic">{projectName}</span> to confirm.
          </h3>
          <p className="mt-1 text-xs text-warm-600">
            This deletes every record for this project. There&rsquo;s no undo.
          </p>
        </div>
      </header>

      <input type="hidden" name="projectId" value={projectId} />
      <Input
        name="confirmName"
        autoFocus
        autoComplete="off"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        placeholder={projectName}
        invalid={invalid}
        aria-label="Type the project name to confirm"
      />
      {initialError === 'name-mismatch' ? (
        <p role="alert" className="text-xs text-status-blocked">
          That didn&rsquo;t match the project name. Try again.
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          intent="ghost"
          size="sm"
          onClick={() => {
            setConfirming(false);
            setTyped('');
          }}
        >
          Cancel
        </Button>
        <DeleteSubmit disabled={!namesMatch} />
      </div>
    </form>
  );
}

function DeleteSubmit({ disabled }: { disabled: boolean }): React.ReactElement {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      intent="danger"
      size="sm"
      disabled={disabled || pending}
      className={cn('gap-1.5', pending && 'opacity-80')}
    >
      {pending ? (
        <Loader className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {pending ? 'Deleting…' : 'Permanently delete'}
    </Button>
  );
}
