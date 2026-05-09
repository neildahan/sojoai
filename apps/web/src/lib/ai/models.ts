import type { ModelTier } from '@/lib/agents/registry';

/**
 * Claude model IDs. Update here when Anthropic releases new versions.
 * Latest as of project start: Claude 4.X family (Opus 4.7 / Sonnet 4.6 / Haiku 4.5).
 */
export const MODEL_IDS: Record<ModelTier, string> = {
  haiku: 'claude-haiku-4-5-20251001',
  sonnet: 'claude-sonnet-4-6',
  opus: 'claude-opus-4-7',
};

/** Approximate cost per 1M tokens (input / output) — used for usage logging. */
export const MODEL_COST_PER_MTOK: Record<ModelTier, { input: number; output: number }> = {
  haiku: { input: 1, output: 5 },
  sonnet: { input: 3, output: 15 },
  opus: { input: 15, output: 75 },
};
