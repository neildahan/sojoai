import * as React from 'react';
import { notFound } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
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
 * /app/[projectId]/messages/[agentId] — direct message with one agent.
 *
 * Layout: two-column — Chat (65%) + Deliverables panel (35%).
 * Deliverables panel becomes real once Mongo + agents land; for now it's a
 * placeholder empty state.
 *
 * Initial messages: stubbed greeting from the agent. Replaced with the real
 * conversation history (`Conversation.messages`) once Mongo is wired.
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
    <div className="grid h-[calc(100vh-0px)] grid-cols-1 lg:grid-cols-[1fr_360px]">
      <section className="flex min-h-0 flex-col">
        {/* Agent header */}
        <header className="flex items-center justify-between gap-3 border-b border-warm-200 bg-surface-page/85 px-6 py-3 backdrop-blur">
          <div className="flex items-center gap-3 min-w-0">
            <AgentIconWrap agentId={agentId} size="md" />
            <div className="min-w-0">
              <h1 className="font-display text-base italic text-warm-900">{agent.name}</h1>
              <p className="text-xs text-warm-500 truncate">{agent.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusRing status="active" />
            <Badge intent="success" size="sm">
              active
            </Badge>
          </div>
        </header>

        {/* Conversation */}
        <div className="min-h-0 flex-1 bg-surface-page">
          <ChatPanel projectId={projectId} agentId={agentId} initialMessages={initialMessages} />
        </div>
      </section>

      {/* Deliverables panel */}
      <aside className="hidden border-l border-warm-200 bg-surface-card lg:flex lg:flex-col">
        <header className="flex items-center gap-2 border-b border-warm-200 px-5 py-4">
          <MessageSquare className="h-4 w-4 text-warm-500" aria-hidden="true" />
          <span className="font-mono text-[10px] tracking-widest text-warm-500 uppercase">
            Deliverables from {agent.name}
          </span>
        </header>
        <div className="flex flex-1 items-center justify-center px-6 text-center">
          <p className="text-sm text-warm-500">
            No deliverables yet. Once {agent.name} ships something, it&rsquo;ll show up here.
          </p>
        </div>
      </aside>

    </div>
  );
}
