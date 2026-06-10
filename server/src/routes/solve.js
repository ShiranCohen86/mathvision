import { Router } from 'express';
import { solveLocally } from '../solver/localSolver.js';
import { getProviders } from '../providers/index.js';

export const solveRouter = Router();

solveRouter.post('/', async (req, res) => {
  const problem = req.body?.problem;
  if (typeof problem !== 'string' || !problem.trim()) {
    return res.status(400).json({ error: 'Provide a non-empty "problem" string.' });
  }

  // 1) Real, key-free path: linear & quadratic equations, CAS-verified.
  const local = solveLocally(problem);
  if (local) {
    return res.json({ source: 'local-cas', solution: local });
  }

  // 2) General path needs the LLM (Phase 1.5). Be honest until it's wired.
  const { llm } = getProviders();
  if (!llm.configured) {
    return res.status(422).json({
      error: 'unsupported',
      message:
        'This one needs the AI solver — add an OPENAI_API_KEY to enable general solving. Linear and quadratic equations already work without a key.',
    });
  }
  return res.status(501).json({ error: 'not-implemented', message: 'The LLM solver lands in Phase 1.5.' });
});
