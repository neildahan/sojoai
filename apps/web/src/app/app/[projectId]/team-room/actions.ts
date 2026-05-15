'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { auth } from '@clerk/nextjs/server';
import { isAgentId } from '@/lib/agents/registry';
import { connectDb } from '@/lib/db/connect';
import { Project, Team, User } from '@/lib/db/models';

/**
 * Remove an agent from the project's team.
 *
 * "Remove" deletes the Team doc only. Conversations and deliverables
 * authored by the agent stay in Mongo — re-hiring the same agent later
 * will pick up where they left off (their ProjectBrain reads are unchanged).
 *
 * Auth: Clerk signed-in user must own the project.
 */
export async function removeAgentAction(formData: FormData): Promise<void> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect('/sign-in');

  const projectId = String(formData.get('projectId') ?? '').trim();
  const agentId = String(formData.get('agentId') ?? '').trim();
  if (!projectId || !mongoose.Types.ObjectId.isValid(projectId) || !isAgentId(agentId)) {
    redirect('/app/home');
  }

  await connectDb();

  const user = await User.findOne({ clerkUserId }).lean<{ _id: mongoose.Types.ObjectId }>();
  if (!user) redirect('/app/home');

  // Ownership check
  const project = await Project.findOne({
    _id: new mongoose.Types.ObjectId(projectId),
    userId: user._id,
    status: 'active',
  }).lean<{ _id: mongoose.Types.ObjectId }>();
  if (!project) redirect('/app/home');

  // Jamie is always-included team coordinator — block removal.
  if (agentId === 'jamie') {
    redirect(`/app/${projectId}/team-room`);
  }

  await Team.deleteOne({ projectId: project._id, agentId });

  revalidatePath(`/app/${projectId}/team-room`);
  redirect(`/app/${projectId}/team-room`);
}
