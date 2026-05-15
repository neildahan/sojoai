'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { auth } from '@clerk/nextjs/server';
import { connectDb } from '@/lib/db/connect';
import {
  Conversation,
  Deliverable,
  Project,
  ProjectBrain,
  StandupSummary,
  Task,
  Team,
  User,
} from '@/lib/db/models';

/**
 * Settings actions for a project.
 *
 * Every action authenticates via Clerk and verifies the project belongs
 * to the signed-in user before mutating anything.
 */

async function loadOwnedProject(projectId: string): Promise<{
  _id: mongoose.Types.ObjectId;
  name: string;
} | null> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;
  if (!mongoose.Types.ObjectId.isValid(projectId)) return null;

  await connectDb();
  const user = await User.findOne({ clerkUserId }).lean<{ _id: mongoose.Types.ObjectId }>();
  if (!user) return null;

  const project = await Project.findOne({
    _id: new mongoose.Types.ObjectId(projectId),
    userId: user._id,
  }).lean<{ _id: mongoose.Types.ObjectId; name: string }>();

  return project ?? null;
}

/**
 * Soft-delete — sets the project's status to 'archived'. Home + team-room
 * queries filter on `status: 'active'` so an archived project disappears
 * from those views but its data is preserved for later restore.
 */
export async function archiveProjectAction(formData: FormData): Promise<void> {
  const projectId = String(formData.get('projectId') ?? '').trim();
  const project = await loadOwnedProject(projectId);
  if (!project) redirect('/app/home');

  await Project.updateOne({ _id: project._id }, { $set: { status: 'archived' } });

  revalidatePath('/app/home');
  redirect('/app/home');
}

/**
 * Hard delete — removes the project and all related documents (Team,
 * Conversation, Task, Deliverable, ProjectBrain, StandupSummary).
 * Requires the user to type the project name in the form to confirm.
 */
export async function deleteProjectAction(formData: FormData): Promise<void> {
  const projectId = String(formData.get('projectId') ?? '').trim();
  const confirmName = String(formData.get('confirmName') ?? '').trim();

  const project = await loadOwnedProject(projectId);
  if (!project) redirect('/app/home');

  if (confirmName !== project.name) {
    // Send them back with an error indicator.
    redirect(`/app/${projectId}/settings?error=name-mismatch`);
  }

  // Cascade delete every related collection. Run in parallel — none of
  // them depend on each other.
  await Promise.all([
    Team.deleteMany({ projectId: project._id }),
    Conversation.deleteMany({ projectId: project._id }),
    Task.deleteMany({ projectId: project._id }),
    Deliverable.deleteMany({ projectId: project._id }),
    ProjectBrain.deleteMany({ projectId: project._id }),
    StandupSummary.deleteMany({ projectId: project._id }),
  ]);
  await Project.deleteOne({ _id: project._id });

  revalidatePath('/app/home');
  redirect('/app/home');
}
