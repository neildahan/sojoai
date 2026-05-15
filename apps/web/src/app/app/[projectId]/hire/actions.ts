'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';
import { auth } from '@clerk/nextjs/server';
import { isAgentId } from '@/lib/agents/registry';
import { connectDb } from '@/lib/db/connect';
import { Project, Team, User } from '@/lib/db/models';

/**
 * Hire action — adds an agent to the project's Team.
 *
 * Verifies the request:
 *   1. Clerk authenticated
 *   2. User owns the projectId
 * Then upserts a Team doc with status='active' so the new hire shows up on
 * the team room. The unique index on (projectId, agentId) prevents
 * duplicate hires — a second click is a no-op.
 *
 * Triggering an agent-greeting message via Claude is deferred to a later
 * commit (needs the chat persistence layer).
 */
export async function hireAgentAction(formData: FormData): Promise<void> {
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

  // Verify ownership before mutating.
  const project = await Project.findOne({
    _id: new mongoose.Types.ObjectId(projectId),
    userId: user._id,
    status: 'active',
  }).lean<{ _id: mongoose.Types.ObjectId; name: string }>();
  if (!project) redirect('/app/home');

  await Team.updateOne(
    { projectId: project._id, agentId },
    {
      $setOnInsert: {
        projectId: project._id,
        agentId,
        status: 'active',
        currentTask: `Catching up on ${project.name}`,
        progress: 0,
        hiredAt: new Date(),
      },
    },
    { upsert: true },
  );

  revalidatePath(`/app/${projectId}/team-room`);
  redirect(`/app/${projectId}/team-room?welcome=${agentId}`);
}
