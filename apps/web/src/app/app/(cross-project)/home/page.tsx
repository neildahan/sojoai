import * as React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import mongoose from 'mongoose';
import { auth, currentUser } from '@clerk/nextjs/server';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { buttonVariants } from '@/components/ui/button';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
import { connectDb } from '@/lib/db/connect';
import { Project, Team, Task, User } from '@/lib/db/models';
import { isAgentId, type AgentId } from '@/lib/agents/registry';

export const metadata = { title: 'Home' };

/**
 * /app/home — cross-project list.
 *
 * Reads the signed-in user's projects from MongoDB (and per-project task
 * counts for the badge). Empty state when the user has none — that's the
 * onboarding entry point.
 */
export default async function AppHomePage(): Promise<React.ReactElement> {
  const clerk = await currentUser();
  const firstName = clerk?.firstName ?? clerk?.username ?? 'there';
  const greeting = greetingForHour(new Date().getHours());

  const projects = await loadProjects();

  return (
    <PageWrapper
      eyebrow={formatDateLong(new Date())}
      title={
        <>
          {greeting}, <em className="font-display text-indigo-600">{firstName}</em>
        </>
      }
      description="Your projects, in one place. Open a project to meet the team."
    >
      {projects.length === 0 ? <EmptyState /> : <ProjectGrid projects={projects} />}
    </PageWrapper>
  );
}

type ProjectCardData = React.ComponentProps<typeof ProjectCard>;

async function loadProjects(): Promise<ProjectCardData[]> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return [];

  await connectDb();

  const user = await User.findOne({ clerkUserId }).lean<{
    _id: mongoose.Types.ObjectId;
  }>();
  if (!user) return [];

  const projects = await Project.find({ userId: user._id, status: 'active' })
    .sort({ updatedAt: -1 })
    .lean<
      Array<{
        _id: mongoose.Types.ObjectId;
        name: string;
        description: string;
        updatedAt: Date;
      }>
    >();
  if (projects.length === 0) return [];

  const projectIds = projects.map((p) => p._id);

  const [teams, taskCounts] = await Promise.all([
    Team.find({ projectId: { $in: projectIds } }).lean<
      Array<{ projectId: mongoose.Types.ObjectId; agentId: string }>
    >(),
    Task.aggregate<{ _id: mongoose.Types.ObjectId; open: number; blocked: number }>([
      { $match: { projectId: { $in: projectIds } } },
      {
        $group: {
          _id: '$projectId',
          open: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 0, 1] } },
          blocked: { $sum: { $cond: [{ $eq: ['$status', 'blocked'] }, 1, 0] } },
        },
      },
    ]),
  ]);

  const teamsByProject = new Map<string, AgentId[]>();
  for (const t of teams) {
    if (!isAgentId(t.agentId)) continue;
    const key = String(t.projectId);
    const list = teamsByProject.get(key) ?? [];
    list.push(t.agentId as AgentId);
    teamsByProject.set(key, list);
  }

  const countsByProject = new Map<string, { open: number; blocked: number }>();
  for (const c of taskCounts) {
    countsByProject.set(String(c._id), { open: c.open, blocked: c.blocked });
  }

  return projects.map((p) => {
    const id = String(p._id);
    const counts = countsByProject.get(id) ?? { open: 0, blocked: 0 };
    return {
      id,
      name: p.name,
      description: p.description,
      hiredAgents: teamsByProject.get(id) ?? [],
      openTaskCount: counts.open,
      blockerCount: counts.blocked,
      lastActivityAt: (p.updatedAt ?? new Date()).toISOString(),
    } satisfies ProjectCardData;
  });
}

function ProjectGrid({ projects }: { projects: ProjectCardData[] }): React.ReactElement {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <ProjectCard key={p.id} {...p} />
      ))}
    </div>
  );
}

function EmptyState(): React.ReactElement {
  return (
    <section className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-warm-300 bg-surface-card/40 px-8 py-16 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
        <Sparkles className="h-5 w-5" aria-hidden="true" />
      </span>
      <h2 className="font-display text-2xl font-medium text-warm-900">
        You haven&rsquo;t created any projects yet.
      </h2>
      <p className="max-w-md text-warm-500">
        Start your first project, describe what you&rsquo;re building, and we&rsquo;ll match you
        with the right agent to kick things off.
      </p>
      <Link
        href="/app/onboarding/start"
        className={buttonVariants({ intent: 'primary', size: 'md' })}
      >
        Start your first project
      </Link>
    </section>
  );
}

function greetingForHour(hour: number): string {
  if (hour < 5) return 'Working late';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatDateLong(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}
