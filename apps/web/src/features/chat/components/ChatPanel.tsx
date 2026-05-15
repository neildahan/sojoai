'use client';

import * as React from 'react';
import { MessageThread, type ThreadMessage } from './MessageThread';
import { MessageInput } from './MessageInput';
import { streamReply } from '../lib/streamReply';
import type { AgentId } from '@/lib/agents/registry';

/**
 * ChatPanel — the full chat surface used in /messages/[agentId].
 * Owns thread state, typing indicator, auto-scroll, and the SSE stream.
 *
 * Flow:
 * 1. User submits a message → appended optimistically.
 * 2. Open POST /api/projects/[id]/chat/[agentId] (SSE).
 * 3. Append each `delta.text` chunk to the active assistant bubble in place.
 * 4. On `done`: close. On `error`: fall back to a one-shot stub reply so the
 *    UX stays functional when ANTHROPIC_API_KEY isn't set yet.
 */

export interface ChatPanelProps {
  projectId: string;
  agentId: AgentId;
  initialMessages: ThreadMessage[];
}

export function ChatPanel({
  projectId,
  agentId,
  initialMessages,
}: ChatPanelProps): React.ReactElement {
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
      const assistantId = crypto.randomUUID();
      const assistantPlaceholder: ThreadMessage = {
        id: assistantId,
        senderId: agentId,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
      };
      setMessages((m) => [...m, userMsg, assistantPlaceholder]);
      setPending(true);

      const appendChunk = (chunk: string): void => {
        setMessages((m) =>
          m.map((msg) =>
            msg.id === assistantId ? { ...msg, content: msg.content + chunk } : msg,
          ),
        );
      };

      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        await streamReply({ projectId, agentId, messages: history, onDelta: appendChunk });
      } catch (err) {
        // Stream failed (likely no ANTHROPIC_API_KEY). Surface a stub reply so
        // the UX is still functional. Remove this fallback once the key is set.
        appendChunk(
          err instanceof Error && err.message.includes('ANTHROPIC_API_KEY')
            ? "I can't reach the model yet — drop your Anthropic key into apps/web/.env.local and I'll respond for real."
            : 'Streaming failed — falling back to a stub reply. Real responses come once the chat API is reachable.',
        );
      } finally {
        setPending(false);
      }
    },
    [agentId, messages, projectId],
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
