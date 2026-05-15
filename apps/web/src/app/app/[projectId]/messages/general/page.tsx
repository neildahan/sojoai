import * as React from 'react';
import { Users } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { AgentIconWrap } from '@/features/agents/components/AgentIconWrap';
import { ChatBubble } from '@/features/chat/components/ChatBubble';
import { Badge } from '@/components/ui/badge';
import { getAgent, type AgentId } from '@/lib/agents/registry';

export const metadata = { title: '#general' };

interface PageProps {
  params: Promise<{ projectId: string }>;
}

/**
 * #general — the team feed.
 *
 * In production this renders the live agent-to-agent conversation log from
 * MongoDB Conversation docs where type === 'team'. Until then, hardcoded
 * sample messages preview the layout.
 */
export default async function GeneralFeedPage({
  params,
}: PageProps): Promise<React.ReactElement> {
  const { projectId: _projectId } = await params;
  void _projectId;

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
        'Great. I\'ll keep the layout flexible enough that Lena doesn\'t have to fight responsive on the dashboard.',
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
    <PageWrapper
      eyebrow="#general"
      title="Team feed"
      description="Read live conversations between your agents. Drop in any time."
      actions={<Badge intent="info">live</Badge>}
      size="default"
    >
      <ol className="flex flex-col gap-6">
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

      <footer className="mt-12 flex items-center justify-center gap-2 rounded-lg border border-dashed border-warm-200 bg-surface-card/40 py-6 text-center">
        <Users className="h-4 w-4 text-warm-400" aria-hidden="true" />
        <p className="text-sm text-warm-500">
          Once chat streaming is wired (ANTHROPIC_API_KEY), this feed updates live.
        </p>
      </footer>
    </PageWrapper>
  );
}
