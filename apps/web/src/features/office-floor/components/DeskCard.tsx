import * as React from 'react';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { AgentIconWrap } from '@/features/agents/components/AgentIconWrap';
import { StatusRing, type AgentStatus } from '@/features/agents/components/StatusRing';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { RemoveAgentButton } from './RemoveAgentButton';
import { getAgent, type AgentId } from '@/lib/agents/registry';
import { cn } from '@/lib/utils';

/**
 * DeskCard — a single agent's desk on the Office Floor.
 * Layout reference: shiftai-design-system-v3.html `.desk` section.
 *
 * Active desks get a soft `desk-active` background tint and a status ring.
 * Blocked desks get a red-tinted shadow. The "talking" variant is rendered
 * inside the MeetingRoom — DeskCard itself just shows the dot.
 */

const BG_BY_STATUS: Record<AgentStatus, string> = {
  active: 'bg-desk-active',
  busy: 'bg-desk-busy',
  blocked: 'bg-desk-away',
  talking: 'bg-desk-active',
  idle: 'bg-desk-away',
};

export interface DeskCardProps {
  projectId: string;
  agentId: AgentId;
  status: AgentStatus;
  /** Free-text "what they're working on right now". */
  currentTask?: string;
  /** 0–100. */
  progress?: number;
  /** Optional server action to remove the agent from the team. When
   *  provided, a small "Remove" control renders in the footer. */
  removeAction?: (data: FormData) => void | Promise<void>;
  className?: string;
}

export function DeskCard({
  projectId,
  agentId,
  status,
  currentTask,
  progress,
  removeAction,
  className,
}: DeskCardProps): React.ReactElement {
  const agent = getAgent(agentId);
  return (
    <article
      aria-label={`${agent.name} (${agent.role}) — ${status}`}
      className={cn(
        'group relative flex flex-col gap-4 rounded-desk p-5 shadow-desk',
        BG_BY_STATUS[status],
        status === 'blocked' && 'ring-1 ring-status-blocked/30',
        status === 'talking' && 'shadow-active-desk',
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <AgentIconWrap agentId={agentId} size="md" />
          <div className="min-w-0">
            <h3 className="font-display text-base italic text-warm-900">{agent.name}</h3>
            <p className="text-xs text-warm-500 truncate">{agent.role}</p>
          </div>
        </div>
        <StatusRing status={status} className="mt-2" />
      </header>

      {currentTask ? (
        <p className="line-clamp-2 text-sm italic text-warm-600">{currentTask}</p>
      ) : (
        <p className="text-sm text-warm-400 italic">No active task.</p>
      )}

      {typeof progress === 'number' ? (
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-warm-200">
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.max(0, Math.min(100, progress))}
              className="h-full rounded-full bg-indigo-500 transition-[width] duration-300"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>
          <span className="font-mono text-[10px] text-warm-400">{Math.round(progress)}%</span>
        </div>
      ) : null}

      <footer className="flex items-center justify-between gap-2">
        <Badge
          intent={status === 'blocked' ? 'danger' : status === 'busy' ? 'warning' : 'success'}
          size="sm"
        >
          {status}
        </Badge>
        <div className="flex items-center gap-1">
          {removeAction ? (
            <RemoveAgentButton
              projectId={projectId}
              agentId={agentId}
              agentName={agent.name}
              action={removeAction}
            />
          ) : null}
          <Link
            href={`/app/${projectId}/messages/${agentId}`}
            className={cn(buttonVariants({ intent: 'ghost', size: 'sm' }), 'gap-1.5 px-2.5')}
            aria-label={`Message ${agent.name}`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Message
          </Link>
        </div>
      </footer>
    </article>
  );
}
