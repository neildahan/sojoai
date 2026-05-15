'use client';

import * as React from 'react';
import { MessageThread, type ThreadMessage } from './MessageThread';
import { MessageInput } from './MessageInput';
import type { AgentId } from '@/lib/agents/registry';

/**
 * ChatPanel — the full chat surface used in /messages/[agentId].
 * Owns the thread state, the typing indicator, the auto-scroll-to-bottom.
 *
 * Streaming wires in Phase 3.2 once ANTHROPIC_API_KEY is set:
 * `onSend(text)` will POST to `/api/projects/[id]/chat/[agentId]` (SSE)
 * and append chunks to the active assistant message.
 *
 * For now, `onSend` echoes a stubbed agent reply so the UX is functional
 * without the Claude API. Replace `mockReply` with a real fetch when wired.
 */

export interface ChatPanelProps {
  agentId: AgentId;
  initialMessages: ThreadMessage[];
}

export function ChatPanel({ agentId, initialMessages }: ChatPanelProps): React.ReactElement {
  const [messages, setMessages] = React.useState<ThreadMessage[]>(initialMessages);
  const [pending, setPending] = React.useState(false);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, pending]);

  const onSend = React.useCallback(
    async (text: string) => {
      const userMsg: ThreadMessage = {
        id: crypto.randomUUID(),
        senderId: 'user',
        role: 'user',
        content: text,
        createdAt: new Date().toISOString(),
      };
      setMessages((m) => [...m, userMsg]);
      setPending(true);
      try {
        // TODO(phase-3.2): replace with fetch to /api/projects/[id]/chat/[agentId]
        // and stream the response via ReadableStream.
        const reply = await mockReply(agentId, text);
        setMessages((m) => [...m, reply]);
      } finally {
        setPending(false);
      }
    },
    [agentId],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-4">
        <MessageThread messages={messages} typingAgentId={pending ? agentId : null} />
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-warm-200 bg-surface-page/40 px-4 py-3">
        <MessageInput onSend={onSend} pending={pending} />
      </div>
    </div>
  );
}

/**
 * Stub reply — pretends to be the agent thinking for ~700ms and replying.
 * Removed when SSE wiring lands.
 */
async function mockReply(agentId: AgentId, _userText: string): Promise<ThreadMessage> {
  await new Promise((r) => setTimeout(r, 700));
  return {
    id: crypto.randomUUID(),
    senderId: agentId,
    role: 'assistant',
    content:
      'Got it. Once the Claude API key is wired, I\'ll respond for real — token-by-token via SSE. For now this is a stub reply so the chat UX is browsable.',
    createdAt: new Date().toISOString(),
  };
}
