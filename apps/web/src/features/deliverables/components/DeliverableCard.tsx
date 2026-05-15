import * as React from 'react';
import Link from 'next/link';
import { Download, FileText } from 'lucide-react';
import { AgentIconWrap } from '@/features/agents/components/AgentIconWrap';
import { Badge } from '@/components/ui/badge';
import type { AgentId } from '@/lib/agents/registry';
import { cn } from '@/lib/utils';

export type DeliverableType =
  | 'prd'
  | 'wireframes'
  | 'design-tokens'
  | 'frontend-code'
  | 'backend-code'
  | 'security-report'
  | 'test-plan'
  | 'devops-config'
  | 'marketing-plan'
  | 'social-post'
  | 'adr'
  | 'other';

export interface DeliverableCardProps {
  id: string;
  title: string;
  type: DeliverableType;
  agentId: AgentId;
  createdAt: string;
  /** Project-relative URL to the viewer. */
  href: string;
  className?: string;
}

export function DeliverableCard({
  id: _id,
  title,
  type,
  agentId,
  createdAt,
  href,
  className,
}: DeliverableCardProps): React.ReactElement {
  void _id;
  return (
    <article
      className={cn(
        'flex items-start gap-4 rounded-md border border-warm-200 bg-surface-card p-4 shadow-desk transition-shadow hover:shadow-card',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-warm-100 text-warm-700"
      >
        <FileText className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-display text-base italic text-warm-900 truncate">{title}</h4>
          <Badge intent="neutral" size="sm">
            {type}
          </Badge>
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-warm-500">
          <AgentIconWrap agentId={agentId} size="sm" />
          <span className="font-mono text-[10px] text-warm-400">
            {new Date(createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <Link
          href={href}
          className="inline-flex h-8 items-center rounded-sm border border-warm-200 px-3 text-xs font-medium text-warm-700 hover:bg-warm-50"
        >
          View
        </Link>
        <button
          type="button"
          aria-label="Download (coming soon)"
          title="Download — wires up once exports are added"
          disabled
          className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-warm-200 text-warm-400 disabled:cursor-not-allowed"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
