'use server';

import { redirect } from 'next/navigation';

/**
 * Server actions for the onboarding wizard.
 *
 * State persists in URL search params — each step reads the prior step's
 * params from the URL and forwards them. This keeps the wizard refresh-safe
 * and link-share-able. When Mongo lands (Phase 3.2), the final `hireFirstAgent`
 * action will write a Project + Team doc instead of redirecting to /demo.
 */

const ALLOWED_NEEDS = new Set([
  'plan',
  'design',
  'development', // shorthand for "frontend AND backend"
  'frontend',
  'backend',
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
  // TODO(phase-3.2): create Project + Team + ProjectBrain docs from formData,
  // then redirect to `/app/<newProjectId>/team-room`. Stub: send to demo.
  const _agentId = String(formData.get('agentId') ?? 'sarah');
  void _agentId;
  redirect('/app/demo/team-room');
}
