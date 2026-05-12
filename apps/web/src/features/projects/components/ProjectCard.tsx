import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AgentIconWrap } from '@/features/agents/components/AgentIconWrap';
import type { AgentId } from '@/lib/agents/registry';
import { cn } from '@/lib/utils';

/**
 * ProjectCard — used on /app/home. Click anywhere on the card to open.
 * Variants:
 *   active      — default
 *   has-blocker — red left border + blocker count
 *   archived    — faded; "Restore" action surfaces in the parent.
 */

export interface ProjectCardProps {
  id: string;
  name: string;
  description: string;
  /** Agents hired on this project — first 4 stacked as avatars. */
  hiredAgents: AgentId[];
  openTaskCount: number;
  blockerCount: number;
  /** ISO date string; rendered as the relative timestamp. */
  lastActivityAt: string;
  archived?: boolean;
  className?: string;
}

const MAX_STACKED = 4;

export function ProjectCard({
  id,
  name,
  description,
  hiredAgents,
  openTaskCount,
  blockerCount,
  lastActivityAt,
  archived = false,
  className,
}: ProjectCardProps): React.ReactElement {
  const hasBlocker = blockerCount > 0 && !archived;
  const overflow = Math.max(0, hiredAgents.length - MAX_STACKED);
  const visible = hiredAgents.slice(0, MAX_STACKED);

  return (
    <Link
      href={`/app/${id}`}
      aria-label={`Open ${name}`}
      className={cn(
        'group block rounded-lg bg-surface-card p-6 shadow-desk transition-shadow',
        'hover:shadow-card focus-visible:outline-none focus-visible:shadow-glow',
        hasBlocker && 'ring-2 ring-status-blocked/25',
        archived && 'opacity-60',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-xl font-medium text-warm-900">{name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-warm-500">{description}</p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-warm-300 transition-transform group-hover:translate-x-0.5 group-hover:text-warm-700" />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex -space-x-2">
          {visible.map((id) => (
            <AgentIconWrap
              key={id}
              agentId={id}
              size="sm"
              className="ring-2 ring-surface-card"
            />
          ))}
          {overflow > 0 ? (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-warm-100 font-mono text-[10px] text-warm-600 ring-2 ring-surface-card">
              +{overflow}
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {hasBlocker ? (
            <Badge intent="danger" size="sm">
              <AlertTriangle className="h-3 w-3" />
              {blockerCount} blocker{blockerCount === 1 ? '' : 's'}
            </Badge>
          ) : null}
          <Badge intent="neutral" size="sm">
            {openTaskCount} open
          </Badge>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-warm-200 pt-3">
        <span className="font-mono text-[10px] text-warm-400">
          {formatRelative(lastActivityAt)}
        </span>
        {archived ? (
          <span className="font-mono text-[10px] tracking-wider text-warm-500 uppercase">
            Archived
          </span>
        ) : null}
      </div>
    </Link>
  );
}

/**
 * Tiny relative-time helper. For Phase 3 we'll swap to a real i18n-aware
 * formatter (Intl.RelativeTimeFormat) once locale negotiation lands.
 */
function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.round((now - then) / 1000);
  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.round(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.round(diffSec / 3600)}h ago`;
  return `${Math.round(diffSec / 86400)}d ago`;
}
