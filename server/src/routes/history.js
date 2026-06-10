import { Router } from 'express';
import { requireAuth } from '../auth/middleware.js';
import { Solve } from '../models/Solve.js';

export const historyRouter = Router();

historyRouter.get('/', requireAuth, async (req, res) => {
  const items = await Solve.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  res.json({
    items: items.map((it) => ({
      id: String(it._id),
      input: it.input,
      problemLatex: it.problemLatex,
      finalAnswer: it.finalAnswer,
      verified: it.verified,
      source: it.source,
      createdAt: it.createdAt,
      solution: it.solution,
    })),
  });
});

historyRouter.delete('/:id', requireAuth, async (req, res) => {
  await Solve.deleteOne({ _id: req.params.id, userId: req.user.id });
  res.json({ ok: true });
});
