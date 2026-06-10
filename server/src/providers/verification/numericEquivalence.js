import { create, all } from 'mathjs';

const math = create(all, {});

const RESERVED = new Set([
  'pi',
  'e',
  'i',
  'Infinity',
  'NaN',
  'true',
  'false',
  'PI',
  'E',
  'phi',
  'tau',
]);

/** Collect free variables across expressions, excluding constants and functions. */
export function detectVariables(expressions) {
  const found = new Set();
  for (const expr of expressions) {
    let node;
    try {
      node = math.parse(expr);
    } catch {
      continue;
    }
    node.traverse((n) => {
      if (!n.isSymbolNode || !n.name) return;
      const name = n.name;
      if (RESERVED.has(name)) return;
      if (typeof math[name] === 'function') return;
      found.add(name);
    });
  }
  return [...found].sort();
}

function isRealFinite(x) {
  return typeof x === 'number' && Number.isFinite(x);
}

function sample(lo, hi) {
  let v = lo + Math.random() * (hi - lo);
  // Nudge away from 0 to dodge common singularities (1/x, log, …).
  if (Math.abs(v) < 0.1) v += 0.7;
  return v;
}

/**
 * Decide whether two expressions are equivalent by evaluating both at many
 * random points and comparing. Robust, language-agnostic, and catches the vast
 * majority of invalid algebraic steps without any symbolic engine.
 *
 * @param {string} exprA
 * @param {string} exprB
 * @param {{ variables?: string[], samples?: number, tolerance?: number, range?: [number, number] }} [options]
 */
export function checkNumericEquivalence(exprA, exprB, options = {}) {
  const variables = options.variables ?? detectVariables([exprA, exprB]);
  const samples = options.samples ?? 32;
  const tolerance = options.tolerance ?? 1e-7;
  const [lo, hi] = options.range ?? [-4, 4];

  let compiledA;
  let compiledB;
  try {
    compiledA = math.parse(exprA).compile();
    compiledB = math.parse(exprB).compile();
  } catch (err) {
    return {
      equivalent: false,
      confidence: 0,
      checkedSamples: 0,
      validSamples: 0,
      variables,
      note: `parse error: ${err.message}`,
    };
  }

  const attempts = variables.length === 0 ? 1 : samples;
  let valid = 0;
  let matched = 0;

  for (let i = 0; i < attempts; i++) {
    const scope = {};
    for (const v of variables) scope[v] = sample(lo, hi);

    let va;
    let vb;
    try {
      va = compiledA.evaluate(scope);
      vb = compiledB.evaluate(scope);
    } catch {
      continue; // domain error at this point — skip it
    }
    if (!isRealFinite(va) || !isRealFinite(vb)) continue;

    valid++;
    const denom = Math.max(1, Math.abs(va), Math.abs(vb));
    if (Math.abs(va - vb) <= tolerance * denom) matched++;
  }

  return {
    equivalent: valid > 0 && matched === valid,
    confidence: valid === 0 ? 0 : matched / valid,
    checkedSamples: attempts,
    validSamples: valid,
    variables,
    note: valid === 0 ? 'no valid sample points (domain or parse issue)' : undefined,
  };
}
