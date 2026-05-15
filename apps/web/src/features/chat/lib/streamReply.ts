import type { AgentId } from '@/lib/agents/registry';

/**
 * Stream an agent reply from /api/projects/[id]/chat/[agentId].
 *
 * Calls `onDelta(text)` for every token chunk. Resolves on `done`.
 * Rejects on `error` event or HTTP-level failure.
 *
 * Used by `features/chat/ChatPanel` once `ANTHROPIC_API_KEY` is set —
 * until then, ChatPanel falls back to its in-process mock reply.
 */

export interface StreamReplyArgs {
  projectId: string;
  agentId: AgentId;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  onDelta: (text: string) => void;
  signal?: AbortSignal;
}

export async function streamReply({
  projectId,
  agentId,
  messages,
  onDelta,
  signal,
}: StreamReplyArgs): Promise<void> {
  const res = await fetch(`/api/projects/${projectId}/chat/${agentId}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`Chat stream failed: ${res.status} ${res.statusText}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE events are separated by blank lines.
    const events = buffer.split('\n\n');
    buffer = events.pop() ?? ''; // last (possibly partial) event back into buffer

    for (const block of events) {
      const line = block.split('\n').find((l) => l.startsWith('data:'));
      if (!line) continue;
      const json = line.slice('data:'.length).trim();
      if (!json) continue;
      let parsed: { type: string; text?: string; message?: string };
      try {
        parsed = JSON.parse(json);
      } catch {
        continue;
      }
      if (parsed.type === 'delta' && typeof parsed.text === 'string') {
        onDelta(parsed.text);
      } else if (parsed.type === 'error') {
        throw new Error(parsed.message ?? 'Stream error');
      } else if (parsed.type === 'done') {
        return;
      }
    }
  }
}
