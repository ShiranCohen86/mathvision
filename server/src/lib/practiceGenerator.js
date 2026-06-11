/**
 * Generates fresh, clean, solvable practice problems (linear & quadratic with
 * integer roots) — no AI needed. Output strings are understood by the local
 * solver. Pure + deterministic when given a seeded RNG (for daily challenges).
 */

function randInt(rng, lo, hi) {
  return lo + Math.floor(rng() * (hi - lo + 1));
}

function randIntNonZero(rng, lo, hi) {
  let v = 0;
  do {
    v = randInt(rng, lo, hi);
  } while (v === 0);
  return v;
}

function termX(a) {
  if (a === 1) return 'x';
  if (a === -1) return '-x';
  return `${a}x`;
}

function formatLinear(a, b, c) {
  let left = termX(a);
  if (b !== 0) left += b > 0 ? ` + ${b}` : ` - ${Math.abs(b)}`;
  return `${left} = ${c}`;
}

function formatQuadratic(b, c) {
  let s = 'x^2';
  if (b !== 0) {
    const bx = Math.abs(b) === 1 ? 'x' : `${Math.abs(b)}x`;
    s += b > 0 ? ` + ${bx}` : ` - ${bx}`;
  }
  if (c !== 0) s += c > 0 ? ` + ${c}` : ` - ${Math.abs(c)}`;
  return `${s} = 0`;
}

export function generateProblem(rng = Math.random, kind) {
  const k = kind ?? (rng() < 0.5 ? 'linear' : 'quadratic');
  if (k === 'linear') {
    const root = randIntNonZero(rng, -9, 9);
    const a = randIntNonZero(rng, -6, 6);
    const b = randInt(rng, -12, 12);
    return formatLinear(a, b, a * root + b);
  }
  const r1 = randInt(rng, -7, 7);
  const r2 = randInt(rng, -7, 7);
  return formatQuadratic(-(r1 + r2), r1 * r2);
}

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic problem-of-the-day from a 'YYYY-MM-DD' string. */
export function dailyProblem(dateStr) {
  const seed = hashString(dateStr);
  const rng = mulberry32(seed);
  return generateProblem(rng, seed % 2 === 0 ? 'linear' : 'quadratic');
}
