import { Router } from 'express';
import mongoose from 'mongoose';
import { solveLocally } from '../solver/localSolver.js';
import { solveWithLlm } from '../solver/llmSolver.js';
import { getProviders } from '../providers/index.js';
import { Solve } from '../models/Solve.js';

export const solveRouter = Router();

async function saveSolve(req, problem, solution, source) {
  if (!req.user || mongoose.connection.readyState !== 1) return;
  try {
    await Solve.create({
      userId: req.user.id,
      input: problem,
      problemLatex: solution.problem?.latex ?? '',
      finalAnswer: solution.finalAnswer ?? '',
      verified: Boolean(solution.verified),
      type: solution.type ?? '',
      source,
      solution,
    });
  } catch {
    /* history is best-effort — never fail a solve because saving failed */
  }
}

solveRouter.post('/', async (req, res) => {
  const problem = req.body?.problem;
  if (typeof problem !== 'string' || !problem.trim()) {
    return res.status(400).json({ error: 'Provide a non-empty "problem" string.' });
  }

  // 1) Real, key-free path: linear & quadratic equations, CAS-verified.
  const local = solveLocally(problem);
  if (local) {
    await saveSolve(req, problem, local, 'local-cas');
    return res.json({ source: 'local-cas', solution: local });
  }

  // 2) General path: the LLM proposes, the CAS verifies the result.
  const { llm } = getProviders();
  if (!llm.configured) {
    return res.status(422).json({
      error: 'unsupported',
      message:
        'Add an OPENAI_API_KEY to enable general solving. Linear and quadratic equations already work without a key.',
    });
  }

  try {
    const result = await solveWithLlm(problem);
    if (!result) return res.status(422).json({ error: 'unsupported' });
    await saveSolve(req, problem, result.solution, 'openai');
    return res.json({
      source: 'openai',
      verifiedBy: result.verifiedBy,
      solution: result.solution,
    });
  } catch (err) {
    return res.status(502).json({ error: 'ai-failed', message: err.message });
  }
});
