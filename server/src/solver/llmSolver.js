import { create, all } from 'mathjs';
import { getProviders } from '../providers/index.js';
import { checkNumericEquivalence } from '../providers/verification/numericEquivalence.js';

const math = create(all, {});

const SYSTEM_PROMPT = `You are an expert mathematics tutor. Solve the user's problem and reply with ONLY a JSON object (no markdown, no prose) of exactly this shape:
{
  "problemLatex": string,
  "domain": string,
  "kind": "equation" | "expression",
  "variable": string | null,
  "normalizedExpr": string,
  "solutions": string[],
  "resultExpr": string | null,
  "finalAnswerLatex": string,
  "steps": [ { "latex": string, "relation": string, "explanationEn": string, "explanationHe": string } ]
}
Conventions:
- All machine fields (normalizedExpr, solutions, resultExpr) MUST be valid mathjs syntax: ^ for powers, * for multiply, sqrt(), sin(), cos(), log(), pi, e.
- EQUATION: kind="equation", normalizedExpr = "LHS-(RHS)", solutions = each solution as a mathjs value, e.g. ["2","3","sqrt(2)"].
- EXPRESSION (simplify / evaluate / differentiate / integrate): kind="expression", normalizedExpr = the original expression, resultExpr = the final result expression.
- Provide 3 to 8 clear teaching steps. Hebrew explanations must be natural, correct Hebrew.
- Be mathematically correct above everything else.`;

function verifyRoot(exprStr, variable, solStr) {
  try {
    const f = math.parse(exprStr).compile();
    const value = math.evaluate(solStr);
    if (typeof value !== 'number' || !Number.isFinite(value)) return false;
    const r = f.evaluate({ [variable]: value });
    return typeof r === 'number' && Math.abs(r) < 1e-6;
  } catch {
    return false;
  }
}

/** CAS verification of the AI's RESULT — the only thing that earns a "✓". */
function verifyResult(data) {
  try {
    if (
      data.kind === 'equation' &&
      data.variable &&
      Array.isArray(data.solutions) &&
      data.solutions.length
    ) {
      return data.solutions.every((sol) =>
        verifyRoot(data.normalizedExpr, data.variable, String(sol)),
      );
    }
    if (data.kind === 'expression' && data.resultExpr && data.normalizedExpr) {
      return checkNumericEquivalence(data.normalizedExpr, data.resultExpr).equivalent;
    }
  } catch {
    return false;
  }
  return false;
}

export async function solveWithLlm(problem) {
  const { llm } = getProviders();
  if (!llm.configured) return null;

  const content = await llm.complete(
    [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: problem },
    ],
    { json: true, temperature: 0 },
  );

  let data;
  try {
    data = JSON.parse(content);
  } catch {
    throw new Error('The AI returned a response that could not be parsed.');
  }

  const verified = verifyResult(data);
  const steps = Array.isArray(data.steps) ? data.steps : [];

  const solution = {
    problem: {
      input: problem,
      latex: data.problemLatex || problem,
      variable: data.variable || null,
    },
    domain: data.domain || 'unknown',
    type: data.kind === 'equation' ? 'equation' : 'expression',
    finalAnswer: data.finalAnswerLatex || '',
    verified,
    methods: [
      {
        name: 'AI solution',
        nameHe: 'פתרון AI',
        steps: steps.map((s, i) => ({
          ordinal: i + 1,
          latex: s.latex || '',
          relation: s.relation || 'step',
          explanationEn: s.explanationEn || '',
          explanationHe: s.explanationHe || '',
          verified: false,
        })),
      },
    ],
  };

  return { solution, verifiedBy: verified ? 'cas' : 'unverified' };
}
