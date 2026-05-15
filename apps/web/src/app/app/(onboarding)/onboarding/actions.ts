'use server';

import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';
import { isAgentId } from '@/lib/agents/registry';
import { connectDb } from '@/lib/db/connect';
import { Project, ProjectBrain, Team, User } from '@/lib/db/models';

/**
 * Server actions for the onboarding wizard.
 *
 * Steps 1-3 keep state in URL search params (refresh-safe, shareable).
 * Step 4 (`hireFirstAgentAction`) commits everything to MongoDB:
 *   - Upsert the User from the Clerk session
 *   - Create a Project
 *   - Create a Team entry per recommended agent
 *   - Initialise a ProjectBrain with the user's description + selected needs
 *   - Redirect to /app/<projectId>/team-room?welcome=<agentId>
 */

const ALLOWED_NEEDS = new Set([
  'plan',
  'design',
  'development', // shorthand for "frontend AND backend"
  'frontend',
  'backend',
  'qa',
  'security',
  'marketing',
]);
const ALLOWED_TYPES = new Set(['fresh', 'existing']);

export async function submitDescribeAction(formData: FormData): Promise<void> {
  const name = String(formData.get('name') ?? '').trim().slice(0, 80);
  const description = String(formData.get('description') ?? '').trim().slice(0, 500);
  if (!name || !description) {
    redirect('/app/onboarding/describe?error=missing');
  }
  const params = new URLSearchParams({ type: 'fresh', name, desc: description });
  redirect(`/app/onboarding/needs?${params.toString()}`);
}

export async function submitNeedsAction(formData: FormData): Promise<void> {
  const carry = new URLSearchParams();
  const type = String(formData.get('type') ?? '');
  if (ALLOWED_TYPES.has(type)) carry.set('type', type);
  const name = String(formData.get('name') ?? '').trim().slice(0, 80);
  if (name) carry.set('name', name);
  const desc = String(formData.get('desc') ?? '').trim().slice(0, 500);
  if (desc) carry.set('desc', desc);
  for (const raw of formData.getAll('need')) {
    const need = String(raw);
    if (ALLOWED_NEEDS.has(need)) carry.append('need', need);
  }
  redirect(`/app/onboarding/meet?${carry.toString()}`);
}

export async function hireFirstAgentAction(formData: FormData): Promise<void> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    redirect('/sign-in');
  }

  // Parse + validate form data
  // Multi-agent: every kept agent on the meet step submits one `agentId`.
  const agentIds = formData
    .getAll('agentId')
    .map((v) => String(v))
    .filter(isAgentId);
  if (agentIds.length === 0) {
    redirect('/app/home');
  }
  const leadAgent = agentIds[0]!; // first kept = the recommended lead

  const name = String(formData.get('name') ?? '').trim().slice(0, 80);
  const description = String(formData.get('desc') ?? '').trim().slice(0, 500);
  const rawType = String(formData.get('type') ?? 'fresh');
  const type: 'greenfield' | 'existing' = rawType === 'existing' ? 'existing' : 'greenfield';

  const needs = formData
    .getAll('need')
    .map((v) => String(v))
    .filter((n) => ALLOWED_NEEDS.has(n));

  if (!name || !description) {
    redirect('/app/onboarding/describe?error=missing');
  }

  // Connect once for the whole action
  await connectDb();

  // 1. Upsert the User from Clerk. Email/name/avatar are pulled from the
  //    Clerk session; the Clerk webhook will keep these in sync once wired.
  const clerk = await currentUser();
  const email = clerk?.emailAddresses?.[0]?.emailAddress ?? `${clerkUserId}@example.invalid`;
  const fullName =
    [clerk?.firstName, clerk?.lastName].filter(Boolean).join(' ') ||
    clerk?.username ||
    '';

  const user = await User.findOneAndUpdate(
    { clerkUserId },
    {
      $set: {
        email,
        name: fullName,
        avatarUrl: clerk?.imageUrl ?? '',
      },
      $setOnInsert: { clerkUserId, plan: 'free' },
    },
    { upsert: true, new: true },
  );

  // 2. Create the Project, recording the user's wizard picks so the
  //    team-room can derive recommended-next-hires from them later.
  const project = await Project.create({
    userId: user._id,
    name,
    description,
    type,
    status: 'active',
    initialNeeds: needs,
  });

  // 3. Auto-hire the kept agents (from the meet step) plus Jamie.
  //    The lead (first kept agent) starts 'active' with an initial task;
  //    the rest come in 'idle' until they pick up work. Removals from
  //    the team are one-click in the team room.
  const teamDocs = agentIds.map((id) => ({
    projectId: project._id,
    agentId: id,
    status: id === leadAgent ? ('active' as const) : ('idle' as const),
    currentTask: id === leadAgent ? `Reading ${name}'s description` : '',
    progress: 0,
  }));
  if (!agentIds.includes('jamie')) {
    teamDocs.push({
      projectId: project._id,
      agentId: 'jamie',
      status: 'active' as const,
      currentTask: 'Coordinating the team',
      progress: 0,
    });
  }
  await Team.insertMany(teamDocs);

  // 4. Initialise ProjectBrain with the description.
  await ProjectBrain.create({
    projectId: project._id,
    projectDescription: description,
  });

  // 5. Off to the workspace.
  redirect(`/app/${String(project._id)}/team-room?welcome=${leadAgent}`);
}
