import * as React from 'react';
import { AgentIconWrap } from '@/features/agents/components/AgentIconWrap';
import { Badge } from '@/components/ui/badge';
import type { AgentId } from '@/lib/agents/registry';
import { cn } from '@/lib/utils';

export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskCardProps {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: AgentId;
  /** ISO date string. */
  createdAt: string;
  className?: string;
}

const STATUS_INTENT: Record<TaskStatus, React.ComponentProps<typeof Badge>['intent']> = {
  todo: 'neutral',
  'in-progress': 'info',
  done: 'success',
  blocked: 'danger',
};

const PRIORITY_DOT: Record<TaskPriority, string> = {
  low: 'bg-warm-300',
  medium: 'bg-status-busy',
  high: 'bg-status-blocked',
};

export function TaskCard({
  title,
  description,
  status,
  priority,
  assigneeId,
  createdAt,
  className,
}: TaskCardProps): React.ReactElement {
  return (
    <article
      className={cn(
        'flex flex-col gap-3 rounded-md border border-warm-200 bg-surface-card p-4 shadow-desk transition-shadow hover:shadow-card',
        className,
      )}
    >
      <header className="flex items-start gap-2">
        <span
          aria-hidden="true"
          title={`Priority: ${priority}`}
          className={cn('mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full', PRIORITY_DOT[priority])}
        />
        <h4 className="flex-1 text-sm font-medium leading-snug text-warm-900">{title}</h4>
      </header>
      {description ? <p className="text-xs text-warm-500 line-clamp-2">{description}</p> : null}
      <footer className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AgentIconWrap agentId={assigneeId} size="sm" />
          <Badge intent={STATUS_INTENT[status]} size="sm">
            {status}
          </Badge>
        </div>
        <span className="font-mono text-[10px] text-warm-400">
          {new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </footer>
    </article>
  );
}
