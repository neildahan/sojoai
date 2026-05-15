import * as React from 'react';
import Link from 'next/link';
import { Users, MessageSquare } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { AgentIconWrap } from '@/features/agents/components/AgentIconWrap';
import { StatusRing } from '@/features/agents/components/StatusRing';
import { AGENT_IDS, getAgent, type AgentId } from '@/lib/agents/registry';

export const metadata = { title: 'Messages' };

interface PageProps {
  params: Promise<{ projectId: string }>;
}

/**
 * /app/[projectId]/messages — conversation index.
 * - "#general" team feed (live agent-to-agent thread) at top
 * - DM list per hired agent
 *
 * Until Mongo lands, every agent in the registry is shown.
 */
export default async function MessagesIndexPage({
  params,
}: PageProps): Promise<React.ReactElement> {
  const { projectId } = await params;

  // TODO(phase-3.2): show only hired agents (Team docs).
  const hired: AgentId[] = AGENT_IDS;

  return (
    <PageWrapper title="Messages" description="Talk to anyone on the team, or jump into #general.">
      <Link
        href={`/app/${projectId}/messages/general`}
        className="mb-6 flex items-start gap-4 rounded-lg border border-warm-200 bg-surface-card p-5 shadow-desk transition-shadow hover:shadow-card"
      >
        <span
          aria-hidden="true"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-indigo-50 text-indigo-700"
        >
          <Users className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg italic text-warm-900">#general</h2>
          </div>
          <p className="text-sm text-warm-500">
            Live agent-to-agent feed for this project. Drop in to read or to @mention the team.
          </p>
        </div>
        <MessageSquare className="h-4 w-4 text-warm-300" aria-hidden="true" />
      </Link>

      <ul className="grid grid-cols-1 gap-3">
        {hired.map((id) => {
          const agent = getAgent(id);
          return (
            <li key={id}>
              <Link
                href={`/app/${projectId}/messages/${id}`}
                className="flex items-center gap-4 rounded-lg border border-warm-200 bg-surface-card p-4 shadow-desk transition-shadow hover:shadow-card"
              >
                <AgentIconWrap agentId={id} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-base italic text-warm-900">
                      {agent.name}
                    </span>
                    <span className="text-xs text-warm-500">{agent.role}</span>
                  </div>
                  <p className="text-xs text-warm-400 truncate">{agent.pitch}</p>
                </div>
                <StatusRing status="active" />
              </Link>
            </li>
          );
        })}
      </ul>
    </PageWrapper>
  );
}
