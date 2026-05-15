'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { Users, Search } from 'lucide-react';
import { AgentIconWrap } from '@/features/agents/components/AgentIconWrap';
import { StatusRing, type AgentStatus } from '@/features/agents/components/StatusRing';
import { AGENT_IDS, getAgent, type AgentId } from '@/lib/agents/registry';
import { cn } from '@/lib/utils';

/**
 * ConversationList — WhatsApp-style persistent left rail for /messages/*.
 *
 * - "#general" pinned at the top.
 * - Then one row per hired agent. Active row gets the warm-100 wash
 *   + indigo left bar.
 * - Lightweight client-side filter input. Filtering happens in-memory
 *   over the agent registry — no network needed.
 *
 * Uses `useSelectedLayoutSegment` to read the active segment one level
 * below the parent /messages/layout — returns 'general', the agentId,
 * or null when we're at /messages itself.
 */

export interface ConversationListItem {
  agentId: AgentId;
  status: AgentStatus;
  /** Short preview text — the last message snippet (mocked for now). */
  preview?: string;
  /** Pre-formatted timestamp (e.g. "09:14"). */
  timestamp?: string;
  /** Count of unread messages. */
  unread?: number;
}

export interface ConversationListProps {
  projectId: string;
  items?: ConversationListItem[];
}

const DEFAULT_PREVIEWS: Record<string, string> = {
  sarah: 'Wrapped the v1 PRD draft.',
  alex: 'Reading the PRD now.',
  lena: 'Scaffolding the dashboard.',
  marcus: 'Schema for ingestion endpoint.',
  ryan: 'OAuth scopes — needs answer.',
  nina: '—',
  david: '—',
  jamie: 'Standup at 9:00.',
  mia: '—',
  kai: '—',
};

export function ConversationList({
  projectId,
  items,
}: ConversationListProps): React.ReactElement {
  const segment = useSelectedLayoutSegment();
  const [query, setQuery] = React.useState('');

  // Build the canonical item list. Defaults to every agent in the registry
  // until real Team data lands.
  const allItems: ConversationListItem[] = React.useMemo(() => {
    if (items && items.length > 0) return items;
    return AGENT_IDS.map((id) => ({
      agentId: id,
      status: 'active' as const,
      preview: DEFAULT_PREVIEWS[id] ?? '—',
    }));
  }, [items]);

  const filtered = React.useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.trim().toLowerCase();
    return allItems.filter((it) => {
      const a = getAgent(it.agentId);
      return (
        a.name.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        (it.preview ?? '').toLowerCase().includes(q)
      );
    });
  }, [allItems, query]);

  return (
    <div className="flex h-full flex-col bg-surface-card">
      <header className="flex flex-col gap-3 border-b border-warm-200 px-4 py-4">
        <h2 className="font-display text-lg font-medium text-warm-900">Messages</h2>
        <label className="flex items-center gap-2 rounded-md border border-warm-200 bg-surface-page px-3 py-1.5 focus-within:shadow-glow">
          <Search className="h-3.5 w-3.5 shrink-0 text-warm-400" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search conversations"
            className="w-full bg-transparent text-sm text-warm-800 placeholder:text-warm-400 focus:outline-none"
          />
        </label>
      </header>

      <ol className="flex-1 overflow-y-auto">
        {/* #general pinned */}
        <li>
          <GeneralRow projectId={projectId} active={segment === 'general'} />
        </li>
        {filtered.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-warm-400">No matches.</li>
        ) : (
          filtered.map((it) => (
            <li key={it.agentId}>
              <AgentRow
                projectId={projectId}
                item={it}
                active={segment === it.agentId}
              />
            </li>
          ))
        )}
      </ol>
    </div>
  );
}

function GeneralRow({
  projectId,
  active,
}: {
  projectId: string;
  active: boolean;
}): React.ReactElement {
  return (
    <Link
      href={`/app/${projectId}/messages/general`}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group flex items-center gap-3 border-b border-warm-200 px-4 py-3 transition-colors',
        active ? 'bg-warm-100' : 'hover:bg-warm-50',
      )}
    >
      <span
        aria-hidden="true"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-700"
      >
        <Users className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-display text-sm italic text-warm-900">#general</span>
        </div>
        <p className="text-xs text-warm-500 truncate">Live team feed</p>
      </div>
    </Link>
  );
}

function AgentRow({
  projectId,
  item,
  active,
}: {
  projectId: string;
  item: ConversationListItem;
  active: boolean;
}): React.ReactElement {
  const agent = getAgent(item.agentId);
  return (
    <Link
      href={`/app/${projectId}/messages/${item.agentId}`}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex items-center gap-3 border-b border-warm-200 px-4 py-3 transition-colors',
        active ? 'bg-warm-100' : 'hover:bg-warm-50',
      )}
    >
      {active ? (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-0.5 bg-indigo-500"
        />
      ) : null}
      <AgentIconWrap agentId={item.agentId} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-display text-sm italic text-warm-900 truncate">
            {agent.name}
          </span>
          {item.timestamp ? (
            <span className="font-mono text-[10px] text-warm-400">{item.timestamp}</span>
          ) : null}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-warm-500 truncate">{item.preview ?? agent.role}</p>
          {item.unread ? (
            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 font-mono text-[10px] font-medium text-white">
              {item.unread}
            </span>
          ) : null}
        </div>
      </div>
      <StatusRing status={item.status} className="ml-1" />
    </Link>
  );
}
