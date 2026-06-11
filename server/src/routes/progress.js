import { Router } from 'express';
import { requireAuth } from '../auth/middleware.js';
import { Progress } from '../models/Progress.js';
import { User } from '../models/User.js';
import { levelProgress } from '../lib/gamification.js';

export const progressRouter = Router();

progressRouter.get('/', requireAuth, async (req, res) => {
  const p = await Progress.findOne({ userId: req.user.id }).lean();
  const xp = p?.xp ?? 0;
  res.json({
    xp,
    ...levelProgress(xp),
    solvedCount: p?.solvedCount ?? 0,
    verifiedCount: p?.verifiedCount ?? 0,
    streak: { current: p?.streak?.current ?? 0, longest: p?.streak?.longest ?? 0 },
    achievements: (p?.achievements ?? []).map((a) => ({ key: a.key, earnedAt: a.earnedAt })),
  });
});

// Leaderboard scoped to the signed-in user's family (private group).
progressRouter.get('/leaderboard', requireAuth, async (req, res) => {
  const me = await User.findById(req.user.id).lean();
  if (!me?.familyId) return res.json({ items: [], family: false });

  const members = await User.find({ familyId: me.familyId }).lean();
  const progresses = await Progress.find({
    userId: { $in: members.map((m) => m._id) },
  }).lean();
  const progById = new Map(progresses.map((p) => [String(p.userId), p]));

  const items = members
    .map((m) => ({
      displayName: m.displayName ?? 'Player',
      avatar: m.avatar ?? null,
      xp: progById.get(String(m._id))?.xp ?? 0,
      level: progById.get(String(m._id))?.level ?? 1,
      me: String(m._id) === req.user.id,
    }))
    .sort((a, b) => b.xp - a.xp)
    .map((r, i) => ({ rank: i + 1, ...r }));

  res.json({ items, family: true });
});
