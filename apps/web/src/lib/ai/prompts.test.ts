import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, type ProjectContext } from './prompts';
import { AGENTS } from '@/lib/agents/registry';

const base: ProjectContext = {
  projectId: 'p1',
  name: 'Mango Health',
  description: 'A diet-tracking app for endurance athletes.',
};

describe('buildSystemPrompt', () => {
  it('composes persona + project context + task instruction', () => {
    const out = buildSystemPrompt({
      agent: AGENTS.sarah,
      project: base,
      taskType: 'chat',
    });
    expect(out).toContain('Sarah');
    expect(out).toContain('Product Manager');
    expect(out).toContain('Mango Health');
    expect(out).toContain('Respond conversationally');
  });

  it('injects PRD into the brain block when present', () => {
    const out = buildSystemPrompt({
      agent: AGENTS.alex,
      project: { ...base, prdMarkdown: '# PRD\nGoals: ship MVP.' },
      taskType: 'chat',
    });
    expect(out).toContain('PRD (latest)');
    expect(out).toContain('Goals: ship MVP.');
  });

  it('includes the current task when provided', () => {
    const out = buildSystemPrompt({
      agent: AGENTS.lena,
      project: {
        ...base,
        currentTask: { title: 'Build OfficeFloor', description: 'Implement the desk grid' },
      },
      taskType: 'chat',
    });
    expect(out).toContain('Your current task: Build OfficeFloor');
    expect(out).toContain('Implement the desk grid');
  });

  it('produces a longer, structured prompt for heavy tasks', () => {
    const chat = buildSystemPrompt({
      agent: AGENTS.sarah,
      project: base,
      taskType: 'chat',
    });
    const prd = buildSystemPrompt({
      agent: AGENTS.sarah,
      project: base,
      taskType: 'full-prd',
    });
    expect(prd.length).toBeGreaterThan(chat.length);
    expect(prd).toContain('Produce a complete, well-structured PRD');
  });

  it('uses Markdown checklist phrasing for QA summary tasks', () => {
    const out = buildSystemPrompt({
      agent: AGENTS.nina,
      project: base,
      taskType: 'qa-summary',
    });
    expect(out).toContain('Markdown checklist');
  });
});
