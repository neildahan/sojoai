import * as React from 'react';
import { DeskCard } from './DeskCard';
import { EmptyDeskSlot } from './EmptyDeskSlot';
import { MeetingRoom } from './MeetingRoom';
import type { AgentStatus } from '@/features/agents/components/StatusRing';
import type { AgentId } from '@/lib/agents/registry';
import { cn } from '@/lib/utils';

/**
 * OfficeFloor — the signature spatial layout. Renders a responsive grid of
 * DeskCards, optionally a MeetingRoom spanning two columns, and EmptyDeskSlots
 * for un-hired roles.
 *
 * The MeetingRoom always renders first so the eye lands on the live activity.
 */

export interface OfficeFloorDesk {
  agentId: AgentId;
  status: AgentStatus;
  currentTask?: string;
  progress?: number;
}

export interface OfficeFloorMeeting {
  participants: AgentId[];
  topic?: string;
}

export interface OfficeFloorProps {
  projectId: string;
  desks: OfficeFloorDesk[];
  meeting?: OfficeFloorMeeting;
  /** How many "hire someone new" placeholders to render at the end. */
  emptySlots?: number;
  className?: string;
}

export function OfficeFloor({
  projectId,
  desks,
  meeting,
  emptySlots = 0,
  className,
}: OfficeFloorProps): React.ReactElement {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {meeting ? (
        <MeetingRoom participants={meeting.participants} topic={meeting.topic} />
      ) : null}
      {desks.map((d) => (
        <DeskCard
          key={d.agentId}
          projectId={projectId}
          agentId={d.agentId}
          status={d.status}
          currentTask={d.currentTask}
          progress={d.progress}
        />
      ))}
      {Array.from({ length: emptySlots }).map((_, i) => (
        <EmptyDeskSlot key={`empty-${i}`} projectId={projectId} />
      ))}
    </div>
  );
}
