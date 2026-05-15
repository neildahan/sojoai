import { describe, it, expect } from 'vitest';
import { pickFirstAgent, mapNeedsToTeam } from './recommend';

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
    expect(pickFirstAgent(['development'])).toBe('lena');
    expect(pickFirstAgent(['frontend'])).toBe('lena');
    expect(pickFirstAgent(['backend'])).toBe('marcus');
    expect(pickFirstAgent(['qa'])).toBe('nina');
    expect(pickFirstAgent(['security'])).toBe('ryan');
    expect(pickFirstAgent(['marketing'])).toBe('mia');
  });

  it('picks development over QA when both are picked (build before test)', () => {
    expect(pickFirstAgent(['qa', 'development'])).toBe('lena');
    expect(pickFirstAgent(['qa', 'backend'])).toBe('marcus');
  });

  it('picks QA over security when both are picked (test before harden)', () => {
    expect(pickFirstAgent(['security', 'qa'])).toBe('nina');
  });

  it('treats "development" as Lena (frontend default — UI is most tangible)', () => {
    expect(pickFirstAgent(['development'])).toBe('lena');
    expect(pickFirstAgent(['development', 'security'])).toBe('lena');
  });

  it('picks design over development when both are selected (priority order)', () => {
    expect(pickFirstAgent(['development', 'design'])).toBe('alex');
    expect(pickFirstAgent(['backend', 'design'])).toBe('alex');
  });

  it('frontend takes precedence over backend when both are picked alongside development sibling', () => {
    expect(pickFirstAgent(['frontend', 'backend'])).toBe('lena');
    expect(pickFirstAgent(['backend', 'frontend'])).toBe('lena');
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

describe('mapNeedsToTeam', () => {
  it('returns Sarah alone for empty selection', () => {
    expect(mapNeedsToTeam([])).toEqual(['sarah']);
  });

  it('prepends Sarah when plan is picked, in priority order', () => {
    expect(mapNeedsToTeam(['plan', 'design', 'marketing'])).toEqual([
      'sarah',
      'alex',
      'mia',
    ]);
  });

  it('walks order without Sarah when plan is absent', () => {
    expect(mapNeedsToTeam(['design', 'marketing'])).toEqual(['alex', 'mia']);
  });

  it('expands "development" to BOTH Lena and Marcus', () => {
    expect(mapNeedsToTeam(['development'])).toEqual(['lena', 'marcus']);
    expect(mapNeedsToTeam(['plan', 'development'])).toEqual(['sarah', 'lena', 'marcus']);
  });

  it('dedupes overlapping picks', () => {
    // development already includes Lena — picking frontend on top adds nothing new.
    expect(mapNeedsToTeam(['development', 'frontend'])).toEqual(['lena', 'marcus']);
    // plan + design + qa: Sarah, Alex, Nina in order
    expect(mapNeedsToTeam(['plan', 'design', 'qa'])).toEqual(['sarah', 'alex', 'nina']);
  });

  it('preserves both Lena and Marcus when frontend AND backend are picked', () => {
    expect(mapNeedsToTeam(['frontend', 'backend'])).toEqual(['lena', 'marcus']);
  });

  it('first entry always matches pickFirstAgent', () => {
    const cases: string[][] = [
      [],
      ['plan'],
      ['design'],
      ['design', 'marketing'],
      ['security', 'qa'],
      ['frontend'],
      ['plan', 'design', 'development', 'qa', 'security', 'marketing'],
    ];
    for (const c of cases) {
      expect(mapNeedsToTeam(c)[0]).toBe(pickFirstAgent(c));
    }
  });
});
