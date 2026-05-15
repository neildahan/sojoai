import * as React from 'react';
import Link from 'next/link';
import { Users, ArrowLeft } from 'lucide-react';
import { AgentIconWrap } from '@/features/agents/components/AgentIconWrap';
import { ChatBubble } from '@/features/chat/components/ChatBubble';
import { Badge } from '@/components/ui/badge';
import { getAgent, type AgentId } from '@/lib/agents/registry';

export const metadata = { title: '#general' };

interface PageProps {
  params: Promise<{ projectId: string }>;
}

/**
 * #general — the team feed. Renders inside the WhatsApp-style messages
 * layout: only the right column.
 *
 * In production, this streams from the Conversation collection where
 * type === 'team'. For now, hardcoded sample messages.
 */
export default async function GeneralFeedPage({
  params,
}: PageProps): Promise<React.ReactElement> {
  const { projectId } = await params;

  const messages: Array<{ id: string; agentId: AgentId; content: string; at: string }> = [
    {
      id: '1',
      agentId: 'sarah',
      content: 'Wrapped the PRD draft. @alex, ready when you want to start wireframes.',
      at: '09:14',
    },
    {
      id: '2',
      agentId: 'alex',
      content:
        "Great. I'll keep the layout flexible enough that Lena doesn't have to fight responsive on the dashboard.",
      at: '09:15',
    },
    {
      id: '3',
      agentId: 'marcus',
      content:
        'API shape proposal coming up. Will keep the workout-ingestion endpoint idempotent so reruns are cheap.',
      at: '09:32',
    },
    {
      id: '4',
      agentId: 'ryan',
      content:
        'Flagging that the existing OAuth scopes look broader than needed. Will write it up after standup.',
      at: '09:40',
    },
  ];

  return (
    <section className="flex h-full flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-warm-200 bg-surface-page/85 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/app/${projectId}/messages`}
            aria-label="Back to messages"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-warm-700 hover:bg-warm-100 lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span
            aria-hidden="true"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-indigo-50 text-indigo-700"
          >
            <Users className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-base italic text-warm-900">#general</h1>
            <p className="text-xs text-warm-500">Live team feed</p>
          </div>
        </div>
        <Badge intent="info">live</Badge>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto bg-surface-page px-4 py-6 sm:px-6">
        <ol className="mx-auto flex max-w-3xl flex-col gap-6">
          {messages.map((m) => (
            <li key={m.id} className="flex items-start gap-3">
              <AgentIconWrap agentId={m.agentId} size="sm" className="mt-1" />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-baseline gap-2">
                  <span className="font-display text-sm font-medium italic text-warm-900">
                    {getAgent(m.agentId).name}
                  </span>
                  <span className="font-mono text-[10px] text-warm-400">{m.at}</span>
                </div>
                <ChatBubble variant="agent">{m.content}</ChatBubble>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-10 text-center text-xs text-warm-400">
          Once chat streaming is wired (ANTHROPIC_API_KEY), this feed updates live.
        </p>
      </div>
    </section>
  );
}
