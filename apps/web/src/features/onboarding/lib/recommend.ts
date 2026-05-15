import type { AgentId } from '@/lib/agents/registry';

/**
 * Map of "need" → recommended agent. The canonical key set is enforced by
 * the form in /onboarding/needs (the action whitelists allowed values).
 */
const NEED_TO_AGENT: Record<string, AgentId> = {
  plan: 'sarah',
  design: 'alex',
  frontend: 'lena',
  backend: 'marcus',
  security: 'ryan',
  marketing: 'mia',
};

/** Priority order when multiple non-`plan` needs are picked. */
const ORDER = ['design', 'frontend', 'backend', 'security', 'marketing'] as const;

/**
 * Pick the first agent the user should hire based on the selected needs.
 *
 * Rules:
 * - If `plan` is selected OR nothing is selected → Sarah (she scopes the
 *   project for everyone else, so she's almost always the right first hire).
 * - Otherwise, walk the priority order and pick the first matching agent.
 * - Fallback (defensive): Sarah.
 */
export function pickFirstAgent(needs: readonly string[]): AgentId {
  if (needs.length === 0 || needs.includes('plan')) return 'sarah';
  for (const n of ORDER) {
    if (needs.includes(n) && NEED_TO_AGENT[n]) {
      return NEED_TO_AGENT[n] as AgentId;
    }
  }
  return 'sarah';
}
