import { Router } from 'express';
import { generateProblem, dailyProblem } from '../lib/practiceGenerator.js';

export const practiceRouter = Router();

practiceRouter.get('/new', (req, res) => {
  const kind =
    req.query.kind === 'linear' || req.query.kind === 'quadratic'
      ? req.query.kind
      : undefined;
  res.json({ problem: generateProblem(Math.random, kind) });
});

practiceRouter.get('/daily', (_req, res) => {
  const date = new Date().toISOString().slice(0, 10);
  res.json({ problem: dailyProblem(date), date });
});
