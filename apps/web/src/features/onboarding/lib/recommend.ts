import type { AgentId } from '@/lib/agents/registry';

/**
 * Map of "need" → recommended agent. The canonical key set is enforced by
 * the form in /onboarding/needs (the action whitelists allowed values).
 *
 * "development" is the shorthand the wizard submits when the user picks
 * the Development card without using the Customize sub-options. We treat
 * it like "frontend" for the *first* hire: UI is the most tangible starting
 * point for a non-technical founder, and the team will hire Marcus next
 * if backend work surfaces.
 */
/**
 * Each need maps to one or more agents. `development` is the only multi-
 * agent need: when a user picks it without using Customize, they're saying
 * "build the whole thing" — that's BOTH Lena (frontend) and Marcus
 * (backend). Picking just `frontend` or `backend` narrows to one.
 *
 * Order within the array matters: it sets the recommended-first-hire
 * preference when the need is the priority winner (e.g. `development`
 * recommends Lena first, with Marcus as the next teammate).
 */
const NEED_TO_AGENTS: Record<string, AgentId[]> = {
  plan: ['sarah'],
  design: ['alex'],
  development: ['lena', 'marcus'],
  frontend: ['lena'],
  backend: ['marcus'],
  qa: ['nina'],
  security: ['ryan'],
  marketing: ['mia'],
};

/**
 * Priority order when multiple non-`plan` needs are picked.
 * QA sits after development because you can't test what isn't built;
 * security sits after QA because hardening is a later concern.
 */
const ORDER = [
  'design',
  'development',
  'frontend',
  'backend',
  'qa',
  'security',
  'marketing',
] as const;

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
  return mapNeedsToTeam(needs)[0] ?? 'sarah';
}

/**
 * Map the user's selected needs to the full ordered list of agents they
 * should hire. The first entry is the recommended FIRST hire; the rest
 * follow in priority order. Duplicates are removed (e.g. picking both
 * `development` and `frontend` produces a single Lena entry).
 *
 * Sarah is prepended when `plan` is selected (or when nothing is selected,
 * as a sensible default) — she leads scoping for everyone else.
 */
export function mapNeedsToTeam(needs: readonly string[]): AgentId[] {
  const result: AgentId[] = [];
  const push = (a: AgentId): void => {
    if (!result.includes(a)) result.push(a);
  };

  if (needs.length === 0 || needs.includes('plan')) {
    push('sarah');
  }

  for (const n of ORDER) {
    if (needs.includes(n)) {
      for (const a of NEED_TO_AGENTS[n] ?? []) {
        push(a);
      }
    }
  }

  // Defensive: empty `ORDER` walk could happen if needs contains only
  // unknown values — fall back to Sarah.
  if (result.length === 0) push('sarah');

  return result;
}
