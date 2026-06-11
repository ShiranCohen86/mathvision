/**
 * Pure gamification logic — XP, levels, streaks, achievements.
 * No DB or I/O here, so it's fully unit-testable (golden tests).
 */

/** Cumulative XP required to be AT the start of `level` (level 1 = 0). */
export function xpForLevel(level) {
  return 50 * level * (level - 1); // 0, 100, 300, 600, 1000, …
}

export function levelFromXp(xp) {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) level++;
  return level;
}

export function levelProgress(xp) {
  const level = levelFromXp(xp);
  const base = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const into = xp - base;
  const span = next - base;
  return { level, into, span, ratio: span > 0 ? into / span : 0, nextLevelXp: next };
}

export function xpForSolve({ verified, source }) {
  let xp = 10;
  if (verified) xp += 10;
  if (source === 'openai') xp += 5; // general/harder problems
  return xp;
}

function daysBetween(a, b) {
  const da = new Date(`${a}T00:00:00Z`).getTime();
  const db = new Date(`${b}T00:00:00Z`).getTime();
  return Math.round((db - da) / 86_400_000);
}

/** `today` is a 'YYYY-MM-DD' string so callers/tests control the clock. */
export function updateStreak(streak, today) {
  const cur = streak ?? { current: 0, longest: 0, lastActive: null };
  if (cur.lastActive === today) {
    return { current: cur.current, longest: cur.longest, lastActive: today };
  }
  const continued = cur.lastActive && daysBetween(cur.lastActive, today) === 1;
  const current = continued ? (cur.current ?? 0) + 1 : 1;
  const longest = Math.max(cur.longest ?? 0, current);
  return { current, longest, lastActive: today };
}

export const ACHIEVEMENTS = [
  { key: 'first-solve', test: (s) => s.solvedCount >= 1 },
  { key: 'ten-solves', test: (s) => s.solvedCount >= 10 },
  { key: 'fifty-solves', test: (s) => s.solvedCount >= 50 },
  { key: 'streak-3', test: (s) => s.streak.current >= 3 },
  { key: 'streak-7', test: (s) => s.streak.current >= 7 },
  { key: 'level-5', test: (s) => s.level >= 5 },
  { key: 'verified-10', test: (s) => s.verifiedCount >= 10 },
];

export function checkAchievements(stats, earnedKeys) {
  const earned = new Set(earnedKeys);
  return ACHIEVEMENTS.filter((a) => !earned.has(a.key) && a.test(stats)).map((a) => a.key);
}

/**
 * Apply one solve to a progress-like object (mutates and returns it), plus a
 * `delta` describing what changed so the client can celebrate it.
 */
export function applySolve(progress, { verified, source, today }) {
  const p = progress;
  const prevLevel = levelFromXp(p.xp ?? 0);

  const gainedXp = xpForSolve({ verified, source });
  p.xp = (p.xp ?? 0) + gainedXp;
  p.solvedCount = (p.solvedCount ?? 0) + 1;
  if (verified) p.verifiedCount = (p.verifiedCount ?? 0) + 1;
  p.streak = updateStreak(p.streak, today);
  p.level = levelFromXp(p.xp);

  const stats = {
    solvedCount: p.solvedCount,
    verifiedCount: p.verifiedCount,
    level: p.level,
    streak: p.streak,
  };
  const earnedKeys = (p.achievements ?? []).map((a) => a.key);
  const newAchievements = checkAchievements(stats, earnedKeys);
  if (newAchievements.length) {
    p.achievements = [
      ...(p.achievements ?? []),
      ...newAchievements.map((key) => ({ key, earnedAt: new Date() })),
    ];
  }

  return {
    progress: p,
    delta: {
      gainedXp,
      level: p.level,
      leveledUp: p.level > prevLevel,
      streak: p.streak.current,
      newAchievements,
    },
  };
}
