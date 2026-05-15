import { describe, it, expect } from 'vitest';
import { pickFirstAgent } from './recommend';

describe('pickFirstAgent', () => {
  it('returns Sarah when nothing is selected', () => {
    expect(pickFirstAgent([])).toBe('sarah');
  });

  it('returns Sarah when "plan" is in the selection (even with others)', () => {
    expect(pickFirstAgent(['plan'])).toBe('sarah');
    expect(pickFirstAgent(['plan', 'design', 'security'])).toBe('sarah');
    expect(pickFirstAgent(['design', 'plan'])).toBe('sarah');
  });

  it('walks the priority order when plan is absent', () => {
    expect(pickFirstAgent(['design'])).toBe('alex');
    expect(pickFirstAgent(['frontend'])).toBe('lena');
    expect(pickFirstAgent(['backend'])).toBe('marcus');
    expect(pickFirstAgent(['security'])).toBe('ryan');
    expect(pickFirstAgent(['marketing'])).toBe('mia');
  });

  it('picks design over backend when both are selected (priority order)', () => {
    expect(pickFirstAgent(['backend', 'design'])).toBe('alex');
    expect(pickFirstAgent(['security', 'frontend'])).toBe('lena');
  });

  it('falls back to Sarah for unknown needs', () => {
    expect(pickFirstAgent(['nonsense'])).toBe('sarah');
    expect(pickFirstAgent(['nonsense', 'other'])).toBe('sarah');
  });

  it('is read-only over inputs (no mutation)', () => {
    const input: string[] = ['design', 'backend'];
    const snapshot = [...input];
    pickFirstAgent(input);
    expect(input).toEqual(snapshot);
  });
});
