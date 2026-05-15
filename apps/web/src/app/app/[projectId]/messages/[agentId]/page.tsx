import * as React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';
import { AgentIconWrap } from '@/features/agents/components/AgentIconWrap';
import { StatusRing } from '@/features/agents/components/StatusRing';
import { ChatPanel } from '@/features/chat/components/ChatPanel';
import type { ThreadMessage } from '@/features/chat/components/MessageThread';
import { Badge } from '@/components/ui/badge';
import { getAgent, isAgentId, type AgentId } from '@/lib/agents/registry';

export const metadata = { title: 'Conversation' };

interface PageProps {
  params: Promise<{ projectId: string; agentId: string }>;
}

/**
 * /app/[projectId]/messages/[agentId] — one-on-one DM with an agent.
 *
 * Renders inside the WhatsApp-style messages layout — the ConversationList
 * is already on the left, so this page only owns the right column: agent
 * header + thread + input.
 *
 * Initial messages: stubbed greeting from the agent. Replaced with real
 * Conversation history once Mongo is wired.
 */
export default async function AgentDMPage({ params }: PageProps): Promise<React.ReactElement> {
  const { projectId, agentId: rawAgentId } = await params;
  if (!isAgentId(rawAgentId)) {
    notFound();
  }
  const agentId = rawAgentId as AgentId;
  const agent = getAgent(agentId);

  const initialMessages: ThreadMessage[] = [
    {
      id: 'greeting',
      senderId: agentId,
      role: 'assistant',
      content: `Hey — I'm ${agent.name}. I'll be your ${agent.role.toLowerCase()} on this project. Tell me what you're trying to build and I'll get started.`,
      createdAt: new Date().toISOString(),
    },
  ];

  return (
    <section className="flex h-full flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-warm-200 bg-surface-page/85 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile-only back to list */}
          <Link
            href={`/app/${projectId}/messages`}
            aria-label="Back to messages"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-warm-700 hover:bg-warm-100 lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <AgentIconWrap agentId={agentId} size="md" />
          <div className="min-w-0">
            <h1 className="font-display text-base italic text-warm-900 truncate">
              {agent.name}
            </h1>
            <div className="flex items-center gap-1.5">
              <StatusRing status="active" />
              <span className="text-xs text-warm-500 truncate">{agent.role} · active</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge intent="accent" size="sm">
            {agent.defaultModel}
          </Badge>
          <Link
            href={`/app/${projectId}/deliverables`}
            aria-label="View deliverables"
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-xs font-medium text-warm-700 hover:bg-warm-100"
          >
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            Deliverables
          </Link>
        </div>
      </header>

      <div className="min-h-0 flex-1 bg-surface-page">
        <ChatPanel projectId={projectId} agentId={agentId} initialMessages={initialMessages} />
      </div>
    </section>
  );
}
