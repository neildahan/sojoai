import * as React from 'react';
import { Users } from 'lucide-react';
import { AgentIconWrap } from '@/features/agents/components/AgentIconWrap';
import type { AgentId } from '@/lib/agents/registry';
import { getAgent } from '@/lib/agents/registry';
import { cn } from '@/lib/utils';

/**
 * MeetingRoom — the anchor of the Office Floor metaphor.
 * Spans 2 grid columns, has a dashed indigo border, and pulses via the
 * `glow-ring` keyframe to signal a live agent-to-agent conversation.
 * `prefers-reduced-motion` is respected via the global rule in globals.css.
 */

export interface MeetingRoomProps {
  participants: AgentId[];
  /** Short label describing the topic (e.g. "Reviewing PRD"). */
  topic?: string;
  className?: string;
}

export function MeetingRoom({
  participants,
  topic,
  className,
}: MeetingRoomProps): React.ReactElement {
  return (
    <section
      aria-label="Agents in conversation"
      className={cn(
        'relative flex flex-col gap-4 rounded-desk bg-meeting-room p-5',
        'border-2 border-dashed border-indigo-400',
        'animate-glow-ring sm:col-span-2',
        className,
      )}
    >
      <header className="flex items-center gap-2 text-indigo-700">
        <Users className="h-4 w-4" aria-hidden="true" />
        <span className="font-mono text-[10px] tracking-widest uppercase">Meeting Room</span>
      </header>

      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {participants.map((id) => (
            <AgentIconWrap
              key={id}
              agentId={id}
              size="md"
              className="ring-2 ring-meeting-room"
            />
          ))}
        </div>
        <div className="min-w-0">
          <p className="font-display text-base italic text-warm-900">
            {formatParticipants(participants)}
          </p>
          {topic ? <p className="text-xs text-warm-500 truncate">{topic}</p> : null}
        </div>
      </div>
    </section>
  );
}

function formatParticipants(ids: AgentId[]): string {
  const names = ids.map((id) => getAgent(id).name);
  if (names.length <= 1) return names[0] ?? '';
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  const last = names[names.length - 1];
  return `${names.slice(0, -1).join(', ')} & ${last}`;
}
