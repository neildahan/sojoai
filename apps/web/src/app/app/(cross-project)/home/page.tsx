import * as React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { currentUser } from '@clerk/nextjs/server';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { buttonVariants } from '@/components/ui/button';
import { ProjectCard } from '@/features/projects/components/ProjectCard';

export const metadata = { title: 'Home' };

/**
 * /app/home — cross-project list.
 *
 * Currently renders the empty state — Mongo wiring lands in Phase 3 batch 2,
 * once we add the Clerk → User sync webhook and the project create flow.
 *
 * Server Component: reads the Clerk user directly via `currentUser()`.
 */
export default async function AppHomePage(): Promise<React.ReactElement> {
  const user = await currentUser();
  const firstName = user?.firstName ?? user?.username ?? 'there';
  const greeting = greetingForHour(new Date().getHours());

  // TODO(phase-3.2): replace with a real project query once Mongo is wired.
  const projects: Array<React.ComponentProps<typeof ProjectCard>> = [];

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

function ProjectGrid({
  projects,
}: {
  projects: Array<React.ComponentProps<typeof ProjectCard>>;
}): React.ReactElement {
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
      <div className="flex items-center gap-3">
        <Link
          href="/app/onboarding/start"
          className={buttonVariants({ intent: 'primary', size: 'md' })}
        >
          Start your first project
        </Link>
        <Link
          href="/app/demo/team-room"
          className={buttonVariants({ intent: 'ghost', size: 'md' })}
        >
          Or peek at the demo workspace →
        </Link>
      </div>
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
