import * as React from 'react';
import { Check } from 'lucide-react';
import { AgentIconWrap } from '@/features/agents/components/AgentIconWrap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAgent, type AgentId } from '@/lib/agents/registry';
import { cn } from '@/lib/utils';

/**
 * AgentCatalogCard — used in /app/[projectId]/hire.
 * Renders the agent's pitch + personality tags + Hire CTA.
 *
 * When `hired=true`, the CTA flips to a disabled "On your team" pill.
 */

export interface AgentCatalogCardProps {
  agentId: AgentId;
  hired?: boolean;
  /** Form action that writes the Team doc. Stubbed until Mongo lands. */
  onHire?: (data: FormData) => void | Promise<void>;
  /** Required when onHire is a server action — the project to hire into. */
  projectId?: string;
  className?: string;
}

export function AgentCatalogCard({
  agentId,
  hired = false,
  onHire,
  projectId,
  className,
}: AgentCatalogCardProps): React.ReactElement {
  const agent = getAgent(agentId);

  return (
    <article
      className={cn(
        'flex flex-col gap-4 rounded-lg border border-warm-200 bg-surface-card p-6 shadow-desk transition-shadow',
        !hired && 'hover:shadow-card',
        className,
      )}
    >
      <header className="flex items-start gap-3">
        <AgentIconWrap agentId={agentId} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-xl italic text-warm-900">{agent.name}</h3>
          <p className="text-sm text-warm-500">{agent.role}</p>
        </div>
      </header>

      <p className="text-sm text-warm-600">{agent.pitch}</p>

      <div className="flex flex-wrap items-center gap-1.5">
        {agent.personality.map((trait) => (
          <Badge key={trait} intent="neutral" size="sm">
            {trait}
          </Badge>
        ))}
      </div>

      <footer className="mt-auto pt-3">
        {hired ? (
          <span className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-warm-100 text-sm font-medium text-warm-500">
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            On your team
          </span>
        ) : (
          <form action={onHire} className="contents">
            {projectId ? <input type="hidden" name="projectId" value={projectId} /> : null}
            <input type="hidden" name="agentId" value={agentId} />
            <Button type="submit" intent="primary" size="sm" className="w-full">
              Hire {agent.name}
            </Button>
          </form>
        )}
      </footer>
    </article>
  );
}
