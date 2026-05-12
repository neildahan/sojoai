import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * StatusRing — the 6px coloured dot used on agent desks.
 * `talking` is the only animated variant — it pulses with the `glow-ring`
 * keyframe to signal an in-progress conversation. All animations respect
 * `prefers-reduced-motion` via the global rule in `globals.css`.
 */

export type AgentStatus = 'active' | 'busy' | 'blocked' | 'talking' | 'idle';

const STATUS_LABEL: Record<AgentStatus, string> = {
  active: 'Active',
  busy: 'Waiting',
  blocked: 'Blocked',
  talking: 'In conversation',
  idle: 'Idle',
};

const STATUS_COLOR: Record<AgentStatus, string> = {
  active: 'bg-status-active',
  busy: 'bg-status-busy',
  blocked: 'bg-status-blocked',
  talking: 'bg-status-talking',
  idle: 'bg-status-idle',
};

export interface StatusRingProps {
  status: AgentStatus;
  className?: string;
}

export function StatusRing({ status, className }: StatusRingProps): React.ReactElement {
  return (
    <span
      role="status"
      aria-label={STATUS_LABEL[status]}
      className={cn(
        'inline-block h-1.5 w-1.5 rounded-full',
        STATUS_COLOR[status],
        status === 'talking' && 'animate-glow-ring',
        className,
      )}
    />
  );
}
