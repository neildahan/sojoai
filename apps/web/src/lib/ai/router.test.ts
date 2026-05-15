import { describe, it, expect } from 'vitest';
import { route } from './router';
import { MODEL_IDS } from './models';
import type { ProjectContext } from './prompts';

const ctx: ProjectContext = {
  projectId: 'p1',
  name: 'Test Project',
  description: 'A test project for routing.',
};

describe('Claude router', () => {
  it('uses the agent default tier for light tasks (Sarah → Sonnet for chat)', () => {
    const r = route({ agentId: 'sarah', taskType: 'chat', project: ctx });
    expect(r.tier).toBe('sonnet');
    expect(r.modelId).toBe(MODEL_IDS.sonnet);
  });

  it('uses Haiku for Jamie chat (Scrum default)', () => {
    const r = route({ agentId: 'jamie', taskType: 'standup-summary', project: ctx });
    expect(r.tier).toBe('haiku');
    expect(r.modelId).toBe(MODEL_IDS.haiku);
  });

  it('upgrades to Opus for full-prd regardless of agent default', () => {
    const r = route({ agentId: 'sarah', taskType: 'full-prd', project: ctx });
    expect(r.tier).toBe('opus');
    expect(r.modelId).toBe(MODEL_IDS.opus);
  });

  it('upgrades to Opus for architecture-decision and security-audit', () => {
    expect(route({ agentId: 'marcus', taskType: 'architecture-decision', project: ctx }).tier).toBe(
      'opus',
    );
    expect(route({ agentId: 'ryan', taskType: 'security-audit', project: ctx }).tier).toBe('opus');
  });

  it('respects forceTier override', () => {
    const r = route({
      agentId: 'jamie',
      taskType: 'chat',
      project: ctx,
      forceTier: 'opus',
    });
    expect(r.tier).toBe('opus');
    expect(r.modelId).toBe(MODEL_IDS.opus);
  });

  it('sets a sensible max-output token budget per tier', () => {
    expect(route({ agentId: 'jamie', taskType: 'chat', project: ctx }).maxOutputTokens).toBe(1024);
    expect(route({ agentId: 'sarah', taskType: 'chat', project: ctx }).maxOutputTokens).toBe(2048);
    expect(route({ agentId: 'sarah', taskType: 'full-prd', project: ctx }).maxOutputTokens).toBe(
      4096,
    );
  });

  it('builds a system prompt that mentions the agent and project', () => {
    const r = route({ agentId: 'alex', taskType: 'chat', project: ctx });
    expect(r.systemPrompt).toContain('Alex');
    expect(r.systemPrompt).toContain('UI/UX Designer');
    expect(r.systemPrompt).toContain('Sojo AI');
    expect(r.systemPrompt).toContain('Test Project');
  });
});
