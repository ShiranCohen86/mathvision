import { describe, it, expect } from 'vitest';
import {
  xpForLevel,
  levelFromXp,
  levelProgress,
  xpForSolve,
  updateStreak,
  checkAchievements,
  applySolve,
} from './gamification.js';

describe('levels', () => {
  it('maps xp to levels on the triangular curve', () => {
    expect(xpForLevel(1)).toBe(0);
    expect(xpForLevel(2)).toBe(100);
    expect(xpForLevel(3)).toBe(300);
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(99)).toBe(1);
    expect(levelFromXp(100)).toBe(2);
    expect(levelFromXp(299)).toBe(2);
    expect(levelFromXp(300)).toBe(3);
  });

  it('reports progress within a level', () => {
    const p = levelProgress(150);
    expect(p.level).toBe(2);
    expect(p.into).toBe(50);
    expect(p.span).toBe(200);
    expect(p.ratio).toBeCloseTo(0.25);
  });
});

describe('xpForSolve', () => {
  it('rewards verified and AI solves more', () => {
    expect(xpForSolve({ verified: false, source: 'local-cas' })).toBe(10);
    expect(xpForSolve({ verified: true, source: 'local-cas' })).toBe(20);
    expect(xpForSolve({ verified: true, source: 'openai' })).toBe(25);
  });
});

describe('updateStreak', () => {
  it('starts a streak', () => {
    expect(updateStreak(null, '2026-06-10')).toEqual({
      current: 1,
      longest: 1,
      lastActive: '2026-06-10',
    });
  });
  it('continues on consecutive days', () => {
    const s1 = updateStreak(null, '2026-06-10');
    const s2 = updateStreak(s1, '2026-06-11');
    expect(s2.current).toBe(2);
    expect(s2.longest).toBe(2);
  });
  it('does not double-count the same day', () => {
    const s1 = updateStreak(null, '2026-06-10');
    const s2 = updateStreak(s1, '2026-06-10');
    expect(s2.current).toBe(1);
  });
  it('resets after a gap but keeps longest', () => {
    let s = updateStreak(null, '2026-06-10');
    s = updateStreak(s, '2026-06-11');
    s = updateStreak(s, '2026-06-15');
    expect(s.current).toBe(1);
    expect(s.longest).toBe(2);
  });
});

describe('achievements', () => {
  it('awards newly-earned achievements only', () => {
    const stats = { solvedCount: 1, verifiedCount: 1, level: 1, streak: { current: 1 } };
    expect(checkAchievements(stats, [])).toContain('first-solve');
    expect(checkAchievements(stats, ['first-solve'])).not.toContain('first-solve');
  });
});

describe('applySolve', () => {
  it('awards xp, counts, streak, level, and first-solve achievement', () => {
    const progress = {};
    const { progress: p, delta } = applySolve(progress, {
      verified: true,
      source: 'local-cas',
      today: '2026-06-10',
    });
    expect(p.xp).toBe(20);
    expect(p.solvedCount).toBe(1);
    expect(p.verifiedCount).toBe(1);
    expect(p.streak.current).toBe(1);
    expect(p.level).toBe(1);
    expect(delta.gainedXp).toBe(20);
    expect(delta.newAchievements).toContain('first-solve');
  });

  it('detects a level-up', () => {
    const progress = { xp: 95 };
    const { delta } = applySolve(progress, { verified: true, source: 'local-cas', today: '2026-06-10' });
    expect(delta.leveledUp).toBe(true);
    expect(delta.level).toBe(2);
  });
});
