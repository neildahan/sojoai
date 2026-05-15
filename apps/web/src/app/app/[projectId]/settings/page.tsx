import * as React from 'react';
import { notFound } from 'next/navigation';
import mongoose from 'mongoose';
import { Archive } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DeleteProjectForm } from '@/features/projects/components/DeleteProjectForm';
import { connectDb } from '@/lib/db/connect';
import { Project, User } from '@/lib/db/models';
import { archiveProjectAction, deleteProjectAction } from './actions';

export const metadata = { title: 'Project settings' };

interface PageProps {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ error?: string }>;
}

/**
 * /app/[projectId]/settings — project configuration + danger zone.
 *
 * Editing the project name/description/standup time is not wired yet
 * (Phase 3.3). Archive and Delete ARE wired — archive sets status to
 * 'archived' (soft delete, hidden from /app/home); delete cascades
 * across every related collection.
 */
export default async function SettingsPage({
  params,
  searchParams,
}: PageProps): Promise<React.ReactElement> {
  const { projectId } = await params;
  const { error } = await searchParams;

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) notFound();
  if (!mongoose.Types.ObjectId.isValid(projectId)) notFound();

  await connectDb();
  const user = await User.findOne({ clerkUserId }).lean<{ _id: mongoose.Types.ObjectId }>();
  if (!user) notFound();

  const project = await Project.findOne({
    _id: new mongoose.Types.ObjectId(projectId),
    userId: user._id,
  }).lean<{
    _id: mongoose.Types.ObjectId;
    name: string;
    description: string;
    status: 'active' | 'archived';
    settings?: {
      standupTime?: string;
      timezone?: string;
      workingHours?: { start?: string; end?: string };
    };
  }>();
  if (!project) notFound();

  const isArchived = project.status === 'archived';

  return (
    <PageWrapper
      eyebrow={isArchived ? 'Settings · archived' : 'Settings'}
      title="Settings"
      description="Project name, working hours, daily standup time, and the danger zone."
      size="narrow"
    >
      {/* General settings — not yet wired to a save action */}
      <form className="flex flex-col gap-6 rounded-lg border border-warm-200 bg-surface-card p-6 shadow-desk">
        <Field label="Project name" hint="Shown in the sidebar and notifications.">
          <Input name="name" defaultValue={project.name} disabled />
        </Field>

        <Field label="Description">
          <Textarea name="description" rows={3} defaultValue={project.description} disabled />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Daily standup time" hint="Jamie sends the digest at this local time.">
            <Input
              name="standupTime"
              type="time"
              defaultValue={project.settings?.standupTime ?? '09:00'}
              disabled
            />
          </Field>
          <Field label="Timezone">
            <Input
              name="timezone"
              defaultValue={project.settings?.timezone ?? 'UTC'}
              disabled
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Working hours start">
            <Input
              name="workingHoursStart"
              type="time"
              defaultValue={project.settings?.workingHours?.start ?? '09:00'}
              disabled
            />
          </Field>
          <Field label="Working hours end">
            <Input
              name="workingHoursEnd"
              type="time"
              defaultValue={project.settings?.workingHours?.end ?? '18:00'}
              disabled
            />
          </Field>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-warm-200 pt-4">
          <Badge intent="warning" size="sm">
            Saving settings — coming soon
          </Badge>
          <Button type="button" intent="primary" size="md" disabled>
            Save changes
          </Button>
        </div>
      </form>

      {/* Danger zone */}
      <div className="mt-10 flex flex-col gap-4">
        <h2 className="font-mono text-[10px] tracking-widest text-status-blocked uppercase">
          Danger zone
        </h2>

        {/* Archive */}
        <form
          action={archiveProjectAction}
          className="flex flex-col gap-3 rounded-lg border border-status-busy/30 bg-status-busy/5 p-5"
        >
          <header className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-status-busy/10 text-status-busy"
            >
              <Archive className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-base italic text-warm-900">
                {isArchived ? 'This project is archived' : 'Archive this project'}
              </h3>
              <p className="mt-1 text-xs text-warm-600">
                {isArchived
                  ? 'Archived projects are hidden from your home view. (Restore from archive will land in a later release.)'
                  : 'Hides it from your home view. Nothing is deleted — you can restore later.'}
              </p>
            </div>
          </header>
          {!isArchived ? (
            <div className="flex justify-end">
              <input type="hidden" name="projectId" value={String(project._id)} />
              <Button type="submit" intent="secondary" size="sm">
                Archive
              </Button>
            </div>
          ) : null}
        </form>

        {/* Delete */}
        <DeleteProjectForm
          projectId={String(project._id)}
          projectName={project.name}
          action={deleteProjectAction}
          initialError={error === 'name-mismatch' ? 'name-mismatch' : undefined}
        />
      </div>
    </PageWrapper>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-warm-700">{label}</span>
      {children}
      {hint ? <span className="text-xs text-warm-400">{hint}</span> : null}
    </label>
  );
}
