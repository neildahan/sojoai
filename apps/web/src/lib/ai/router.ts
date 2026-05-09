import { getAgent, type AgentId, type ModelTier } from '@/lib/agents/registry';
import { MODEL_IDS } from '@/lib/ai/models';
import { buildSystemPrompt, type ProjectContext } from '@/lib/ai/prompts';

/**
 * The Claude Router.
 *
 * Single point that decides which Claude model + prompt to use for a given
 * (agent, task) pair. Inspired by Ruflo's per-task routing (clean-room build,
 * not a fork) — the goal is 30-50% token cost savings without losing quality.
 *
 * Rule of thumb:
 *   - Default to the agent's `defaultModel` (Haiku/Sonnet).
 *   - Upgrade to Opus only for the explicit "heavy" task types below.
 *   - Never hard-code model strings inside route handlers — go through here.
 */

export type TaskType =
  // Light tasks → tend to stay at the agent's default tier.
  | 'chat'
  | 'standup-summary'
  | 'social-post'
  | 'devops-config'
  | 'qa-summary'
  // Heavy tasks → upgrade to Opus.
  | 'full-prd'
  | 'architecture-decision'
  | 'security-audit';

const HEAVY_TASKS: ReadonlySet<TaskType> = new Set([
  'full-prd',
  'architecture-decision',
  'security-audit',
]);

interface RouteInput {
  agentId: AgentId;
  taskType: TaskType;
  project: ProjectContext;
  /** Optional override — escape hatch for explicit user request. */
  forceTier?: ModelTier;
}

export interface RouteResult {
  modelId: string;
  tier: ModelTier;
  systemPrompt: string;
  maxOutputTokens: number;
}

const MAX_TOKENS_BY_TIER: Record<ModelTier, number> = {
  haiku: 1024,
  sonnet: 2048,
  opus: 4096,
};

export function route({ agentId, taskType, project, forceTier }: RouteInput): RouteResult {
  const agent = getAgent(agentId);

  const tier: ModelTier =
    forceTier ?? (HEAVY_TASKS.has(taskType) ? 'opus' : agent.defaultModel);

  return {
    modelId: MODEL_IDS[tier],
    tier,
    systemPrompt: buildSystemPrompt({ agent, project, taskType }),
    maxOutputTokens: MAX_TOKENS_BY_TIER[tier],
  };
}
