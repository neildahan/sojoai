import * as React from 'react';
import Link from 'next/link';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { AgentCatalogCard } from '@/features/hiring/components/AgentCatalogCard';
import { AGENTS, AGENT_IDS, type AgentCategory, type AgentId } from '@/lib/agents/registry';
import { hireAgentAction } from './actions';

export const metadata = { title: 'Hire' };

interface PageProps {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ category?: string }>;
}

const CATEGORIES: Array<{ value: AgentCategory | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'strategy', label: 'Strategy' },
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'growth', label: 'Growth' },
];

/**
 * /app/[projectId]/hire — agent catalog.
 *
 * Until Mongo lands, the "hired" set is empty for demo (or any project),
 * so every agent shows the Hire CTA. Filtering by category is via URL param.
 */
export default async function HirePage({
  params,
  searchParams,
}: PageProps): Promise<React.ReactElement> {
  const { projectId } = await params;
  const { category } = await searchParams;
  const activeCategory: AgentCategory | 'all' =
    category === 'strategy' ||
    category === 'design' ||
    category === 'engineering' ||
    category === 'growth'
      ? category
      : 'all';

  const visible: AgentId[] = AGENT_IDS.filter(
    (id) => activeCategory === 'all' || AGENTS[id].category === activeCategory,
  );

  // TODO(phase-3.2): read hired agent ids from the Team collection.
  const hiredSet = new Set<AgentId>();

  return (
    <PageWrapper
      eyebrow="Hiring room"
      title="Hire your next teammate"
      description="Each agent has a clear role and writes in their own voice. They read the same project brain — hire one and the rest can pick up where they left off."
      size="wide"
    >
      <nav className="mb-8 flex flex-wrap items-center gap-2">
        {CATEGORIES.map((c) => {
          const href =
            c.value === 'all'
              ? `/app/${projectId}/hire`
              : `/app/${projectId}/hire?category=${c.value}`;
          const isActive = activeCategory === c.value;
          return (
            <Link
              key={c.value}
              href={href}
              className={`inline-flex h-9 items-center rounded-full px-4 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-warm-900 text-warm-50'
                  : 'bg-warm-100 text-warm-700 hover:bg-warm-200'
              }`}
            >
              {c.label}
              {c.value !== 'all' ? (
                <span className="ml-2 font-mono text-[10px] opacity-70">
                  {AGENT_IDS.filter((id) => AGENTS[id].category === c.value).length}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {activeCategory === 'engineering' ? (
        <aside className="mb-6 rounded-lg border border-indigo-200 bg-indigo-50/40 p-5">
          <p className="font-mono text-[10px] tracking-widest text-indigo-700 uppercase">
            Not sure who you need?
          </p>
          <p className="mt-2 text-sm text-warm-700">
            Hire <strong className="font-medium">Lena</strong> if you want to start with what
            users see (the screens and buttons).{' '}
            Hire <strong className="font-medium">Marcus</strong> if your product needs data,
            APIs, or integrations from day one. Most projects end up wanting both.
          </p>
        </aside>
      ) : null}

      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed border-warm-300 p-10 text-center text-warm-500">
          No agents in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((id) => (
            <AgentCatalogCard
              key={id}
              agentId={id}
              hired={hiredSet.has(id)}
              projectId={projectId}
              onHire={hireAgentAction}
            />
          ))}
        </div>
      )}

      <footer className="mt-12 flex items-center justify-between border-t border-warm-200 pt-6">
        <p className="font-mono text-[10px] text-warm-400">
          <Badge intent="info" size="sm">
            {hiredSet.size} of {AGENT_IDS.length} hired
          </Badge>
        </p>
        <Link
          href={`/app/${projectId}/team-room`}
          className={buttonVariants({ intent: 'ghost', size: 'sm' })}
        >
          Back to team room →
        </Link>
      </footer>
    </PageWrapper>
  );
}
