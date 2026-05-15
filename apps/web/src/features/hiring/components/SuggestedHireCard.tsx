import * as React from 'react';
import { UserPlus } from 'lucide-react';
import { AgentIconWrap } from '@/features/agents/components/AgentIconWrap';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAgent, type AgentId } from '@/lib/agents/registry';
import { HIRE_RATIONALE } from '@/features/hiring/lib/rationale';
import { cn } from '@/lib/utils';

/**
 * SuggestedHireCard — compact card used in the team-room "Recommended
 * next hires" section. Visually distinct from DeskCard so users don't
 * confuse a recommendation for an active team member.
 *
 * Renders a small <form> with hidden inputs so submitting hits the same
 * `hireAgentAction` used by the Hiring Room. No client JS needed.
 */

export interface SuggestedHireCardProps {
  agentId: AgentId;
  projectId: string;
  /** Server action that writes the Team doc. */
  onHire: (data: FormData) => void | Promise<void>;
  className?: string;
}

export function SuggestedHireCard({
  agentId,
  projectId,
  onHire,
  className,
}: SuggestedHireCardProps): React.ReactElement {
  const agent = getAgent(agentId);

  return (
    <article
      className={cn(
        'flex flex-col gap-3 rounded-lg border border-dashed border-warm-300 bg-surface-card/40 p-4 transition-shadow',
        'hover:border-warm-400 hover:shadow-desk',
        className,
      )}
    >
      <header className="flex items-start gap-3">
        <AgentIconWrap agentId={agentId} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-display text-base italic text-warm-900">{agent.name}</h4>
            <Badge intent="neutral" size="sm">
              {agent.role}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-warm-500">Recommended next hire</p>
        </div>
      </header>

      <p className="text-sm leading-relaxed text-warm-700">{HIRE_RATIONALE[agentId]}</p>

      <form action={onHire} className="mt-auto pt-1">
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="agentId" value={agentId} />
        <Button type="submit" intent="primary" size="sm" className="w-full gap-1.5">
          <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
          Hire {agent.name}
        </Button>
      </form>
    </article>
  );
}
