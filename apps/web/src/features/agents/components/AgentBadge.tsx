import * as React from 'react';
import { getAgent, type AgentId } from '@/lib/agents/registry';
import { AgentIconWrap } from './AgentIconWrap';
import { cn } from '@/lib/utils';

/**
 * AgentBadge — icon tile + agent name (Fraunces italic) + optional role.
 * Used in headers, message metadata, and the hiring room cards.
 */

export interface AgentBadgeProps {
  agentId: AgentId;
  size?: 'sm' | 'md' | 'lg';
  showRole?: boolean;
  className?: string;
}

const nameSize: Record<NonNullable<AgentBadgeProps['size']>, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
};

const roleSize: Record<NonNullable<AgentBadgeProps['size']>, string> = {
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-sm',
};

export function AgentBadge({
  agentId,
  size = 'md',
  showRole = true,
  className,
}: AgentBadgeProps): React.ReactElement {
  const agent = getAgent(agentId);
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <AgentIconWrap agentId={agentId} size={size === 'lg' ? 'lg' : size} />
      <span className="flex flex-col leading-tight">
        <span className={cn('font-display italic text-warm-900', nameSize[size])}>
          {agent.name}
        </span>
        {showRole ? (
          <span className={cn('text-warm-500', roleSize[size])}>{agent.role}</span>
        ) : null}
      </span>
    </span>
  );
}
