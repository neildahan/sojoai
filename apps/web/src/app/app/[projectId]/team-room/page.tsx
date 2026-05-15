import * as React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Plus, Play, ArrowRight } from 'lucide-react';
import mongoose from 'mongoose';
import { auth } from '@clerk/nextjs/server';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { DeskCard } from '@/features/office-floor/components/DeskCard';
import { AgentIconWrap } from '@/features/agents/components/AgentIconWrap';
import { SuggestedHireCard } from '@/features/hiring/components/SuggestedHireCard';
import { WelcomeBanner } from '@/features/onboarding/components/WelcomeBanner';
import { mapNeedsToTeam } from '@/features/onboarding/lib/recommend';
import { connectDb } from '@/lib/db/connect';
import { Project, Team, User } from '@/lib/db/models';
import { getAgent, isAgentId, type AgentId } from '@/lib/agents/registry';
import type { AgentStatus } from '@/features/agents/components/StatusRing';
import { hireAgentAction } from '@/app/app/[projectId]/hire/actions';

export const metadata = { title: 'Team Room' };

interface PageProps {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ welcome?: string }>;
}

const STATUS_VALUES: ReadonlySet<AgentStatus> = new Set([
  'active',
  'busy',
  'blocked',
  'talking',
  'idle',
]);

/**
 * /app/[projectId]/team-room — the project workspace.
 *
 * Two clearly separated sections:
 *   1. "Your team" — agents you've actually hired (Team docs in Mongo).
 *      Full DeskCards. Jamie is shown as a small "always coordinating"
 *      chip since he doesn't need a desk.
 *   2. "Recommended next hires" — agents the wizard surfaced based on
 *      Project.initialNeeds but you haven't hired yet. Dashed-border
 *      SuggestedHireCards with a one-click Hire button each.
 */
export default async function TeamRoomPage({
  params,
  searchParams,
}: PageProps): Promise<React.ReactElement> {
  const { projectId } = await params;
  const { welcome } = await searchParams;

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) notFound();
  if (!mongoose.Types.ObjectId.isValid(projectId)) notFound();

  await connectDb();

  const user = await User.findOne({ clerkUserId }).lean<{ _id: mongoose.Types.ObjectId }>();
  if (!user) notFound();

  const project = await Project.findOne({
    _id: new mongoose.Types.ObjectId(projectId),
    userId: user._id,
    status: 'active',
  }).lean<{
    _id: mongoose.Types.ObjectId;
    name: string;
    description: string;
    initialNeeds: string[];
  }>();
  if (!project) notFound();

  const teamMembers = await Team.find({ projectId: project._id }).lean<
    Array<{
      agentId: string;
      status: AgentStatus;
      currentTask: string;
      progress: number;
    }>
  >();

  const hiredIds = new Set<AgentId>();
  for (const t of teamMembers) {
    if (isAgentId(t.agentId)) hiredIds.add(t.agentId as AgentId);
  }

  const hiredDesks = teamMembers
    .filter((t) => isAgentId(t.agentId) && t.agentId !== 'jamie')
    .map((t) => ({
      agentId: t.agentId as AgentId,
      status: STATUS_VALUES.has(t.status) ? t.status : 'idle',
      currentTask: t.currentTask || undefined,
      progress: typeof t.progress === 'number' && t.progress > 0 ? t.progress : undefined,
    }));

  // Suggested next hires: from the wizard's needs minus anyone already hired.
  const recommendedTeam = mapNeedsToTeam(project.initialNeeds ?? []);
  const suggestedHires = recommendedTeam.filter((id) => !hiredIds.has(id));

  const welcomeAgent = welcome && isAgentId(welcome) ? (welcome as AgentId) : null;
  const activeCount = hiredDesks.filter((d) => d.status === 'active').length;
  const busyCount = hiredDesks.filter((d) => d.status === 'busy').length;
  const blockedCount = hiredDesks.filter((d) => d.status === 'blocked').length;

  return (
    <PageWrapper
      eyebrow="Team room"
      title={project.name}
      description="See who's working now and who you can bring on next."
      actions={
        <>
          <Link
            href={`/app/${String(project._id)}/messages/meeting`}
            className={buttonVariants({ intent: 'secondary', size: 'sm' })}
          >
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
            Start meeting
          </Link>
          <Link
            href={`/app/${String(project._id)}/hire`}
            className={buttonVariants({ intent: 'primary', size: 'sm' })}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Hire from full catalog
          </Link>
        </>
      }
      size="wide"
    >
      {welcomeAgent ? (
        <WelcomeBanner
          agentId={welcomeAgent}
          projectId={String(project._id)}
          className="mb-6"
        />
      ) : null}

      {/* ─── Your team (hired) ─── */}
      <section className="mb-12">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-[10px] tracking-widest text-warm-500 uppercase">
            Your team · {hiredDesks.length} hired
          </h2>
          <div className="flex items-center gap-2">
            <Badge intent="success">{activeCount} active</Badge>
            <Badge intent="warning">{busyCount} waiting</Badge>
            <Badge intent="danger">{blockedCount} blocked</Badge>
          </div>
        </header>

        {hiredDesks.length === 0 ? (
          <p className="rounded-lg border border-dashed border-warm-300 bg-surface-card/40 p-8 text-center text-sm text-warm-500">
            No agents hired yet. Pick one below to get started.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {hiredDesks.map((d) => (
              <DeskCard
                key={d.agentId}
                projectId={String(project._id)}
                agentId={d.agentId}
                status={d.status}
                currentTask={d.currentTask}
                progress={d.progress}
              />
            ))}
          </div>
        )}

        {/* Jamie chip — always-coordinating */}
        {hiredIds.has('jamie') ? (
          <div className="mt-5 flex items-center gap-3 rounded-md border border-indigo-200 bg-indigo-50/40 px-4 py-2.5">
            <AgentIconWrap agentId="jamie" size="sm" />
            <p className="text-xs text-warm-700">
              <span className="font-display italic text-warm-900">{getAgent('jamie').name}</span>{' '}
              is keeping the team coordinated — runs daily standups and surfaces blockers. No
              need to message; you&rsquo;ll see a digest each morning.
            </p>
          </div>
        ) : null}
      </section>

      {/* ─── Recommended next hires ─── */}
      {suggestedHires.length > 0 ? (
        <section>
          <header className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="font-mono text-[10px] tracking-widest text-warm-500 uppercase">
                Recommended next hires
              </h2>
              <p className="mt-1 text-sm text-warm-500">
                Based on what you picked at onboarding. They aren&rsquo;t on the team yet — hire
                them when you&rsquo;re ready.
              </p>
            </div>
            <Link
              href={`/app/${String(project._id)}/hire`}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              Or browse all 10 agents
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          </header>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {suggestedHires.map((id) => (
              <SuggestedHireCard
                key={id}
                agentId={id}
                projectId={String(project._id)}
                onHire={hireAgentAction}
              />
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-lg border border-dashed border-warm-200 bg-surface-card/40 p-6 text-center">
          <p className="text-sm text-warm-500">
            You&rsquo;ve hired everyone the wizard suggested. Want more help?{' '}
            <Link
              href={`/app/${String(project._id)}/hire`}
              className="font-medium text-indigo-600 hover:underline"
            >
              Browse the full Hiring Room →
            </Link>
          </p>
        </section>
      )}
    </PageWrapper>
  );
}
