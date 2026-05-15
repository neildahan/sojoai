import * as React from 'react';
import { ChatBubble } from './ChatBubble';
import { TypingIndicator } from '@/features/agents/components/TypingIndicator';
import { getAgent, type AgentId } from '@/lib/agents/registry';
import { cn } from '@/lib/utils';

export interface ThreadMessage {
  id: string;
  /** Agent id when role === 'assistant'; literal 'user' when role === 'user'. */
  senderId: AgentId | 'user';
  role: 'assistant' | 'user';
  content: string;
  /** ISO timestamp. */
  createdAt: string;
}

export interface MessageThreadProps {
  messages: ThreadMessage[];
  /** Render the typing indicator at the bottom for this agent. */
  typingAgentId?: AgentId | null;
  className?: string;
}

/**
 * MessageThread — vertically stacked ChatBubbles, oldest first.
 * Pure presentational; the parent owns the auto-scroll-to-bottom behaviour.
 */
export function MessageThread({
  messages,
  typingAgentId,
  className,
}: MessageThreadProps): React.ReactElement {
  return (
    <ol className={cn('flex flex-col gap-4 px-1 py-6', className)}>
      {messages.map((m) => (
        <li
          key={m.id}
          className={cn('flex w-full', m.role === 'assistant' ? 'justify-start' : 'justify-end')}
        >
          <ChatBubble
            variant={m.role === 'user' ? 'user' : 'agent'}
            footer={formatBubbleFooter(m)}
          >
            {m.content}
          </ChatBubble>
        </li>
      ))}
      {typingAgentId ? (
        <li className="flex w-full justify-start">
          <ChatBubble variant="agent" footer={`${getAgent(typingAgentId).name} is typing…`}>
            <TypingIndicator />
          </ChatBubble>
        </li>
      ) : null}
    </ol>
  );
}

function formatBubbleFooter(m: ThreadMessage): string {
  const time = new Date(m.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  if (m.role === 'user') return time;
  return `${getAgent(m.senderId as AgentId).name} · ${time}`;
}
