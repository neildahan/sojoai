import * as React from 'react';
import { AgentIconWrap } from '@/features/agents/components/AgentIconWrap';
import { Badge } from '@/components/ui/badge';
import { getAgent, type AgentId } from '@/lib/agents/registry';
import { cn } from '@/lib/utils';

export type StandupStatus = 'on-track' | 'in-discussion' | 'blocked';

export interface StandupCardProps {
  agentId: AgentId;
  /** What the agent did / is doing — 1-3 lines. */
  update: string;
  status: StandupStatus;
  /** When the status is "blocked", what's blocking. */
  blocker?: string;
  className?: string;
}

const STATUS_LABEL: Record<StandupStatus, string> = {
  'on-track': 'On track',
  'in-discussion': 'In discussion',
  blocked: 'Blocked',
};

const STATUS_INTENT: Record<StandupStatus, React.ComponentProps<typeof Badge>['intent']> = {
  'on-track': 'success',
  'in-discussion': 'info',
  blocked: 'danger',
};

export function StandupCard({
  agentId,
  update,
  status,
  blocker,
  className,
}: StandupCardProps): React.ReactElement {
  const agent = getAgent(agentId);
  return (
    <article
      className={cn(
        'flex items-start gap-4 rounded-lg border border-warm-200 bg-surface-card p-5 shadow-desk',
        status === 'blocked' && 'ring-1 ring-status-blocked/25',
        className,
      )}
    >
      <AgentIconWrap agentId={agentId} size="md" />
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between gap-2">
          <div>
            <h3 className="font-display text-base italic text-warm-900">{agent.name}</h3>
            <p className="text-xs text-warm-500">{agent.role}</p>
          </div>
          <Badge intent={STATUS_INTENT[status]} size="sm">
            {STATUS_LABEL[status]}
          </Badge>
        </header>
        <p className="mt-3 text-sm text-warm-700">{update}</p>
        {status === 'blocked' && blocker ? (
          <p className="mt-2 rounded-md border border-status-blocked/30 bg-status-blocked/5 px-3 py-2 text-xs text-status-blocked">
            <span className="font-medium">Blocked by:</span> {blocker}
          </p>
        ) : null}
      </div>
    </article>
  );
}
