import * as React from 'react';
import Link from 'next/link';
import { Users, MessageSquare } from 'lucide-react';
import { AgentIconWrap } from '@/features/agents/components/AgentIconWrap';
import { StatusRing } from '@/features/agents/components/StatusRing';
import { AGENT_IDS, getAgent } from '@/lib/agents/registry';

export const metadata = { title: 'Messages' };

interface PageProps {
  params: Promise<{ projectId: string }>;
}

/**
 * /app/[projectId]/messages — the "no conversation selected" surface.
 *
 * On lg+: empty state in the right column (the ConversationList lives in
 *         the parent layout).
 * On mobile: full agent list, since the layout's left rail is hidden.
 */
export default async function MessagesIndexPage({
  params,
}: PageProps): Promise<React.ReactElement> {
  const { projectId } = await params;

  return (
    <>
      {/* lg+ — empty state */}
      <div className="hidden h-full lg:flex lg:flex-col lg:items-center lg:justify-center lg:bg-surface-page lg:px-12 lg:text-center">
        <span
          aria-hidden="true"
          className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-warm-100 text-warm-500"
        >
          <MessageSquare className="h-6 w-6" />
        </span>
        <h2 className="mt-5 font-display text-2xl italic text-warm-900">
          Pick a conversation
        </h2>
        <p className="mt-2 max-w-md text-warm-500">
          Pick anyone from the list on the left to start chatting, or open{' '}
          <Link
            href={`/app/${projectId}/messages/general`}
            className="text-indigo-600 hover:underline"
          >
            #general
          </Link>{' '}
          to read what the team is talking about right now.
        </p>
      </div>

      {/* Mobile — full list */}
      <div className="flex h-full flex-col overflow-y-auto bg-surface-page lg:hidden">
        <header className="px-6 pt-8 pb-4">
          <h1 className="font-display text-3xl font-medium text-warm-900">Messages</h1>
          <p className="mt-1 text-sm text-warm-500">
            Talk to anyone on the team, or jump into #general.
          </p>
        </header>

        <Link
          href={`/app/${projectId}/messages/general`}
          className="mx-4 mb-3 flex items-start gap-3 rounded-lg border border-warm-200 bg-surface-card p-4 shadow-desk"
        >
          <span
            aria-hidden="true"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-700"
          >
            <Users className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-base italic text-warm-900">#general</h2>
            <p className="text-xs text-warm-500">Live agent-to-agent feed.</p>
          </div>
        </Link>

        <ul className="flex flex-col">
          {AGENT_IDS.map((id) => {
            const a = getAgent(id);
            return (
              <li key={id}>
                <Link
                  href={`/app/${projectId}/messages/${id}`}
                  className="flex items-center gap-3 border-t border-warm-200 px-4 py-3 active:bg-warm-100"
                >
                  <AgentIconWrap agentId={id} size="md" />
                  <div className="min-w-0 flex-1">
                    <span className="font-display text-sm italic text-warm-900">
                      {a.name}
                    </span>
                    <p className="text-xs text-warm-500 truncate">{a.pitch}</p>
                  </div>
                  <StatusRing status="active" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
