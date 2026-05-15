'use server';

import { redirect } from 'next/navigation';
import { isAgentId } from '@/lib/agents/registry';

/**
 * Hire action — adds an agent to the project's Team.
 *
 * Stubbed until Mongo lands. Once wired, this will:
 *   1. Authenticate the request (Clerk userId).
 *   2. Verify the user owns `projectId`.
 *   3. Upsert a Team doc with (projectId, agentId).
 *   4. Optionally trigger an agent-greeting message via the Claude router.
 * For now, just redirects back to the team-room.
 */
export async function hireAgentAction(formData: FormData): Promise<void> {
  const projectId = String(formData.get('projectId') ?? '').trim();
  const agentId = String(formData.get('agentId') ?? '').trim();
  if (!projectId || !isAgentId(agentId)) {
    redirect('/app/home');
  }
  // TODO(phase-3.2): persist the hire.
  redirect(`/app/${projectId}/team-room`);
}
