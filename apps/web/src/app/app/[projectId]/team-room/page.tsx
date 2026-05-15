import * as React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Plus, Play } from 'lucide-react';
import mongoose from 'mongoose';
import { auth } from '@clerk/nextjs/server';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { OfficeFloor } from '@/features/office-floor/components/OfficeFloor';
import type { OfficeFloorDesk } from '@/features/office-floor/components/OfficeFloor';
import { WelcomeBanner } from '@/features/onboarding/components/WelcomeBanner';
import { connectDb } from '@/lib/db/connect';
import { Project, Team, User } from '@/lib/db/models';
import { isAgentId, type AgentId } from '@/lib/agents/registry';
import type { AgentStatus } from '@/features/agents/components/StatusRing';

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
 * Fetches the project from MongoDB and 404s if it's missing or not owned
 * by the signed-in user. WelcomeBanner renders when `?welcome=<agentId>`
 * is present in the URL (set by hireFirstAgentAction right after a hire).
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

  const desks: OfficeFloorDesk[] = teamMembers
    .filter((t) => isAgentId(t.agentId) && t.agentId !== 'jamie') // Jamie is implicit
    .map((t) => ({
      agentId: t.agentId as AgentId,
      status: STATUS_VALUES.has(t.status) ? t.status : 'idle',
      currentTask: t.currentTask || undefined,
      progress: typeof t.progress === 'number' && t.progress > 0 ? t.progress : undefined,
    }));

  const welcomeAgent = welcome && isAgentId(welcome) ? (welcome as AgentId) : null;
  const activeCount = desks.filter((d) => d.status === 'active').length;
  const busyCount = desks.filter((d) => d.status === 'busy').length;
  const blockedCount = desks.filter((d) => d.status === 'blocked').length;

  return (
    <PageWrapper
      eyebrow="Team room"
      title={project.name}
      description="Your team is working. The Meeting Room glows when two or more agents are talking — click any desk to message that agent directly."
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
            Hire someone new
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

      <div className="mb-6 flex items-center gap-2">
        <Badge intent="success">{activeCount} active</Badge>
        <Badge intent="warning">{busyCount} waiting</Badge>
        <Badge intent="danger">{blockedCount} blocked</Badge>
      </div>

      <OfficeFloor
        projectId={String(project._id)}
        desks={desks}
        emptySlots={Math.max(0, 3 - desks.length)}
      />
    </PageWrapper>
  );
}
