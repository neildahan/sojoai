'use client';

import * as React from 'react';
import Link from 'next/link';
import { Sparkles, X, MessageSquare } from 'lucide-react';
import { AgentIconWrap } from '@/features/agents/components/AgentIconWrap';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { getAgent, type AgentId } from '@/lib/agents/registry';
import { cn } from '@/lib/utils';

/**
 * WelcomeBanner — shown on the team room right after the first hire.
 *
 * Triggered by `?welcome=<agentId>` in the URL. Click-dismissable. Has a
 * "Message <agent>" CTA so the user can drop straight into the chat
 * instead of staring at an empty desk.
 */

export interface WelcomeBannerProps {
  agentId: AgentId;
  projectId: string;
  className?: string;
}

export function WelcomeBanner({
  agentId,
  projectId,
  className,
}: WelcomeBannerProps): React.ReactElement | null {
  const [dismissed, setDismissed] = React.useState(false);
  if (dismissed) return null;

  const agent = getAgent(agentId);

  return (
    <section
      className={cn(
        'relative flex items-start gap-4 overflow-hidden rounded-lg border border-indigo-200 bg-indigo-50/60 p-5',
        'animate-fade-up',
        className,
      )}
    >
      <AgentIconWrap agentId={agentId} size="lg" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Badge intent="accent" size="sm">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            New team member
          </Badge>
        </div>
        <h2 className="mt-2 font-display text-lg italic text-warm-900">
          {agent.name} just joined your team.
        </h2>
        <p className="mt-1 text-sm text-warm-700">
          They&rsquo;re reading your project description now. Drop them a message to share more
          context, or wait for their first questions.
        </p>
        <div className="mt-3">
          <Link
            href={`/app/${projectId}/messages/${agentId}`}
            className={buttonVariants({ intent: 'primary', size: 'sm' })}
          >
            <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
            Message {agent.name}
          </Link>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss welcome"
        className="absolute top-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-md text-warm-500 hover:bg-warm-100 hover:text-warm-900"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </section>
  );
}
