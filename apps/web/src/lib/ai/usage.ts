import 'server-only';
import { MODEL_COST_PER_MTOK } from '@/lib/ai/models';
import type { ModelTier } from '@/lib/agents/registry';

/**
 * Token-usage logging stub. In Phase 6 this writes to a `Usage` collection
 * for plan-tier enforcement and per-project cost dashboards. For now, it
 * just computes the cost and prints it in dev.
 */
export interface UsageRecord {
  projectId: string;
  agentId: string;
  tier: ModelTier;
  inputTokens: number;
  outputTokens: number;
}

export function recordUsage(u: UsageRecord): void {
  const cost = estimateCostUsd(u);
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console -- intentional dev-only diagnostic
    console.log(
      `[usage] ${u.projectId} ${u.agentId} ${u.tier}: in=${u.inputTokens} out=${u.outputTokens} cost=$${cost.toFixed(4)}`,
    );
  }
  // TODO(phase-6): persist to MongoDB Usage collection.
}

export function estimateCostUsd(u: UsageRecord): number {
  const rate = MODEL_COST_PER_MTOK[u.tier];
  return (u.inputTokens * rate.input + u.outputTokens * rate.output) / 1_000_000;
}
