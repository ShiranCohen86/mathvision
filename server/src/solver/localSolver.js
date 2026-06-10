import { create, all } from 'mathjs';
import { detectVariables } from '../providers/verification/numericEquivalence.js';

const math = create(all, {});

/**
 * A real, key-free solver for single-variable LINEAR and QUADRATIC equations.
 * Produces pedagogical, CAS-verified steps (roots are checked by substitution).
 * Returns null for anything it doesn't handle, so the caller can fall back to
 * the LLM path.
 */

function clean(n) {
  const r = Math.round(n);
  return Math.abs(n - r) < 1e-9 ? r : Number(n.toFixed(6));
}

function num(n) {
  return Number.isInteger(n) ? String(n) : String(n);
}

function paren(n) {
  return n < 0 ? `(${num(n)})` : num(n);
}

/** Build a nice "a x^2 + b x + c" LaTeX string, handling signs and unit coeffs. */
function polyLatex(a, b, c, v) {
  const terms = [];
  if (a !== 0) terms.push({ coeff: a, sym: `${v}^2` });
  if (b !== 0) terms.push({ coeff: b, sym: v });
  if (c !== 0) terms.push({ coeff: c, sym: '' });
  if (terms.length === 0) return '0';

  return terms
    .map((term, i) => {
      const mag = Math.abs(term.coeff);
      const coeffStr = mag === 1 && term.sym !== '' ? '' : num(mag);
      if (i === 0) {
        return (term.coeff < 0 ? '-' : '') + coeffStr + term.sym;
      }
      return ` ${term.coeff < 0 ? '-' : '+'} ` + coeffStr + term.sym;
    })
    .join('');
}

/** Extract coefficients of a degree-≤2 polynomial by sampling (deg check included). */
function extractQuadratic(exprStr, variable) {
  let compiled;
  try {
    compiled = math.parse(exprStr).compile();
  } catch {
    return null;
  }
  const ev = (x) => {
    try {
      const value = compiled.evaluate({ [variable]: x });
      return typeof value === 'number' ? value : NaN;
    } catch {
      return NaN;
    }
  };
  const p0 = ev(0);
  const p1 = ev(1);
  const pm1 = ev(-1);
  const p2 = ev(2);
  if (![p0, p1, pm1, p2].every((value) => Number.isFinite(value))) return null;

  const c = p0;
  const a = (p1 + pm1) / 2 - c;
  const b = (p1 - pm1) / 2;
  // Reject anything that isn't actually a degree-≤2 polynomial.
  if (Math.abs(a * 4 + b * 2 + c - p2) > 1e-6 * Math.max(1, Math.abs(p2))) return null;

  return { a: clean(a), b: clean(b), c: clean(c), eval: ev };
}

function step(ordinal, latex, relation, explanationEn, explanationHe, verified) {
  return { ordinal, latex, relation, explanationEn, explanationHe, verified };
}

function solveLinear({ v, b, c, problemLatex, evalFn }) {
  const root = clean(-c / b);
  const verified = Math.abs(evalFn(root)) < 1e-6 * Math.max(1, Math.abs(b) + Math.abs(c));
  const moved = `${polyLatex(0, b, c, v)} = 0`;
  const isolated = `${polyLatex(0, b, 0, v)} = ${num(-c)}`;

  const steps = [
    step(1, problemLatex, 'given', 'The equation to solve.', 'המשוואה לפתרון.', true),
    step(2, moved, 'move-term', 'Bring every term to one side.', 'מעבירים את כל האיברים לצד אחד.', true),
    step(3, isolated, 'move-term', `Move the constant to the other side.`, 'מעבירים את הקבוע לצד השני.', true),
    step(4, `${v} = ${num(root)}`, 'solve', `Divide both sides by ${num(b)}.`, `מחלקים את שני האגפים ב-${num(b)}.`, verified),
  ];

  return {
    type: 'linear-equation',
    finalAnswer: `${v} = ${num(root)}`,
    verified,
    methods: [{ name: 'Isolate the variable', nameHe: 'בידוד המשתנה', steps }],
  };
}

function solveQuadratic({ v, a, b, c, problemLatex, evalFn }) {
  const disc = clean(b * b - 4 * a * c);
  const standard = `${polyLatex(a, b, c, v)} = 0`;

  const baseSteps = [
    step(1, problemLatex, 'given', 'The equation to solve.', 'המשוואה לפתרון.', true),
    step(2, standard, 'move-term', 'Write it in standard form (all terms on one side).', 'כותבים בצורה הסטנדרטית (כל האיברים בצד אחד).', true),
    step(3, `a = ${num(a)},\\quad b = ${num(b)},\\quad c = ${num(c)}`, 'substitute', 'Identify the coefficients.', 'מזהים את המקדמים.', true),
    step(4, `\\Delta = b^2 - 4ac = ${paren(b)}^2 - 4(${paren(a)})(${paren(c)}) = ${num(disc)}`, 'evaluate', 'Compute the discriminant.', 'מחשבים את הדיסקרימיננטה.', true),
  ];

  if (disc < 0) {
    return {
      type: 'quadratic-equation',
      finalAnswer: 'No real solutions',
      verified: true,
      noRealRoots: true,
      methods: [
        {
          name: 'Quadratic formula',
          nameHe: 'נוסחת השורשים',
          steps: [
            ...baseSteps,
            step(5, `\\Delta = ${num(disc)} < 0`, 'conclude', 'A negative discriminant means there are no real solutions.', 'דיסקרימיננטה שלילית — אין פתרונות ממשיים.', true),
          ],
        },
      ],
    };
  }

  const sqrtD = Math.sqrt(disc);
  const formula = `${v} = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a} = \\dfrac{${num(-b)} \\pm \\sqrt{${num(disc)}}}{${num(2 * a)}}`;
  const exact = Number.isInteger(sqrtD);

  const r1 = clean((-b + sqrtD) / (2 * a));
  const r2 = clean((-b - sqrtD) / (2 * a));
  const verify = (r) => Math.abs(evalFn(r)) < 1e-6 * Math.max(1, Math.abs(a) + Math.abs(b) + Math.abs(c));
  const verified = verify(r1) && verify(r2);

  let rootsLatex;
  let finalAnswer;
  if (disc === 0) {
    rootsLatex = `${v} = ${num(r1)}`;
    finalAnswer = `${v} = ${num(r1)}`;
  } else if (exact) {
    rootsLatex = `${v} = ${num(r1)} \\quad\\text{or}\\quad ${v} = ${num(r2)}`;
    finalAnswer = `${v} = ${num(r1)},\\ ${v} = ${num(r2)}`;
  } else {
    const approx = (r) => Number(r.toFixed(4));
    rootsLatex = `${v} \\approx ${approx(r1)} \\quad\\text{or}\\quad ${v} \\approx ${approx(r2)}`;
    finalAnswer = `${v} \\approx ${approx(r1)},\\ ${v} \\approx ${approx(r2)}`;
  }

  return {
    type: 'quadratic-equation',
    finalAnswer,
    verified,
    methods: [
      {
        name: 'Quadratic formula',
        nameHe: 'נוסחת השורשים',
        steps: [
          ...baseSteps,
          step(5, formula, 'apply-operation', 'Apply the quadratic formula.', 'מציבים בנוסחת השורשים.', true),
          step(6, rootsLatex, 'solve', disc === 0 ? 'A zero discriminant gives one (double) root.' : 'Compute the two roots.', disc === 0 ? 'דיסקרימיננטה אפס — שורש כפול יחיד.' : 'מחשבים את שני השורשים.', verified),
        ],
      },
    ],
  };
}

export function solveLocally(input) {
  if (typeof input !== 'string') return null;
  const text = input.trim();
  if (!text.includes('=')) return null;

  const parts = text.split('=');
  if (parts.length !== 2) return null;
  const lhsStr = parts[0].trim();
  const rhsStr = parts[1].trim();
  if (!lhsStr || !rhsStr) return null;

  const combined = `(${lhsStr}) - (${rhsStr})`;

  let vars;
  try {
    vars = detectVariables([combined]);
  } catch {
    return null;
  }
  if (vars.length !== 1) return null;
  const v = vars[0];

  const coeffs = extractQuadratic(combined, v);
  if (!coeffs) return null;
  const { a, b, c, eval: evalFn } = coeffs;

  let lhsTex;
  let rhsTex;
  try {
    lhsTex = math.parse(lhsStr).toTex();
    rhsTex = math.parse(rhsStr).toTex();
  } catch {
    return null;
  }
  const problemLatex = `${lhsTex} = ${rhsTex}`;

  let result;
  if (a === 0) {
    if (b === 0) return null; // no variable left — contradiction or identity
    result = solveLinear({ v, b, c, problemLatex, evalFn });
  } else {
    result = solveQuadratic({ v, a, b, c, problemLatex, evalFn });
  }

  return {
    problem: { input: text, latex: problemLatex, variable: v },
    domain: 'algebra',
    ...result,
  };
}
