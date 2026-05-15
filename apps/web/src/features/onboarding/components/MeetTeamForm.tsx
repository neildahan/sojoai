'use client';

import * as React from 'react';
import { useFormStatus } from 'react-dom';
import { Sparkles, Loader, UserMinus, RotateCcw, AlertCircle } from 'lucide-react';
import { AgentIconWrap } from '@/features/agents/components/AgentIconWrap';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAgent, type AgentId } from '@/lib/agents/registry';
import { HIRE_RATIONALE } from '@/features/hiring/lib/rationale';
import { cn } from '@/lib/utils';

/**
 * MeetTeamForm — Step 4 of the wizard.
 *
 * Square-card grid: every recommended teammate shown as a card with their
 * icon, name, role, why-and-when copy, and a Remove control. Jamie is
 * always in the grid but can't be removed (he's the team coordinator).
 *
 * Submitting hires the kept set in one shot. `hireFirstAgentAction` reads
 * `formData.getAll('agentId')` — the first kept id is the lead (starts
 * 'active' with a task); the rest start 'idle'.
 */

export interface MeetTeamFormProps {
  team: AgentId[];
  projectType: string;
  projectName: string;
  projectDesc: string;
  needs: string[];
  action: (data: FormData) => void | Promise<void>;
  backHref: string;
}

export function MeetTeamForm({
  team,
  projectType,
  projectName,
  projectDesc,
  needs,
  action,
  backHref,
}: MeetTeamFormProps): React.ReactElement {
  const [excluded, setExcluded] = React.useState<Set<AgentId>>(new Set());

  const kept = team.filter((id) => !excluded.has(id));
  const lead = kept[0];

  const toggle = (id: AgentId): void => {
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <form action={action} className="flex flex-col gap-6">
      {/* Hidden — wizard state. agentIds repeat for the kept set. */}
      <input type="hidden" name="type" value={projectType} />
      <input type="hidden" name="name" value={projectName} />
      <input type="hidden" name="desc" value={projectDesc} />
      {needs.map((n) => (
        <input key={`n-${n}`} type="hidden" name="need" value={n} />
      ))}
      {kept.map((id) => (
        <input key={`a-${id}`} type="hidden" name="agentId" value={id} />
      ))}

      {/* Grid of teammate cards. Jamie is appended as an always-included card. */}
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {team.map((id) => (
          <li key={id}>
            <TeamMemberCard
              agentId={id}
              isLead={id === lead}
              removed={excluded.has(id)}
              onToggle={() => toggle(id)}
            />
          </li>
        ))}
        <li>
          <JamieCard />
        </li>
      </ul>

      {/* Footer */}
      <div className="mt-4 flex items-start justify-between gap-3">
        <a
          href={backHref}
          className="inline-flex h-11 items-center rounded-md px-4 text-sm font-medium text-warm-700 hover:bg-warm-100"
        >
          Back
        </a>
        <div className="flex flex-col items-end gap-1.5">
          <HireTeamSubmit
            count={kept.length + 1 /* +1 for Jamie (always included) */}
            canSubmit={kept.length > 0}
          />
          {kept.length === 0 ? (
            <p
              role="alert"
              className="inline-flex max-w-xs items-center gap-1.5 text-right text-xs text-status-blocked"
            >
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Pick at least one specialist. Jamie joins regardless as your coordinator.
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}

function TeamMemberCard({
  agentId,
  isLead,
  removed,
  onToggle,
}: {
  agentId: AgentId;
  isLead: boolean;
  removed: boolean;
  onToggle: () => void;
}): React.ReactElement {
  const agent = getAgent(agentId);
  return (
    <article
      className={cn(
        'flex h-full flex-col gap-4 rounded-lg border bg-surface-card p-5 shadow-desk transition-all',
        removed
          ? 'border-warm-200 opacity-50'
          : isLead
            ? 'border-indigo-300 ring-1 ring-indigo-300/40'
            : 'border-warm-200',
      )}
    >
      <header className="flex items-start gap-3">
        <AgentIconWrap agentId={agentId} size="lg" className={removed ? 'grayscale' : ''} />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg italic text-warm-900">{agent.name}</h3>
          <p className="text-xs text-warm-500">{agent.role}</p>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-1.5">
        {isLead && !removed ? (
          <Badge intent="accent" size="sm">
            Lead
          </Badge>
        ) : null}
        {removed ? (
          <Badge intent="neutral" size="sm">
            Removed
          </Badge>
        ) : null}
      </div>

      <p className="flex-1 text-xs leading-relaxed text-warm-600">{HIRE_RATIONALE[agentId]}</p>

      <button
        type="button"
        onClick={onToggle}
        aria-label={removed ? `Add ${agent.name} back` : `Remove ${agent.name}`}
        className={cn(
          'inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors',
          removed
            ? 'border border-indigo-300 bg-indigo-50/60 text-indigo-700 hover:bg-indigo-50'
            : 'border border-warm-200 bg-surface-card text-warm-700 hover:border-status-blocked/40 hover:text-status-blocked',
        )}
      >
        {removed ? (
          <>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Add back
          </>
        ) : (
          <>
            <UserMinus className="h-3.5 w-3.5" aria-hidden="true" />
            Remove
          </>
        )}
      </button>
    </article>
  );
}

function JamieCard(): React.ReactElement {
  const jamie = getAgent('jamie');
  return (
    <article className="flex h-full flex-col gap-4 rounded-lg border border-indigo-200 bg-indigo-50/40 p-5">
      <header className="flex items-start gap-3">
        <AgentIconWrap agentId="jamie" size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg italic text-warm-900">{jamie.name}</h3>
          <p className="text-xs text-warm-500">{jamie.role}</p>
        </div>
      </header>
      <Badge intent="info" size="sm">
        Always included
      </Badge>
      <p className="flex-1 text-xs leading-relaxed text-warm-600">{HIRE_RATIONALE.jamie}</p>
      <span className="inline-flex h-9 w-full items-center justify-center rounded-md border border-indigo-200 bg-indigo-50/60 text-xs font-medium text-indigo-700">
        Joins automatically
      </span>
    </article>
  );
}

function HireTeamSubmit({
  count,
  canSubmit,
}: {
  count: number;
  canSubmit: boolean;
}): React.ReactElement {
  const { pending } = useFormStatus();
  const label = !canSubmit
    ? 'No team to hire'
    : count === 1
      ? 'Hire team'
      : `Hire ${count}-person team`;
  return (
    <Button type="submit" intent="primary" size="lg" disabled={pending || !canSubmit}>
      {pending ? (
        <Loader className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Sparkles className="h-4 w-4" aria-hidden="true" />
      )}
      {pending ? 'Hiring team…' : `${label} — let's start`}
    </Button>
  );
}
