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

progressRouter.get('/leaderboard', requireAuth, async (req, res) => {
  const top = await Progress.find().sort({ xp: -1 }).limit(20).lean();
  const users = await User.find({ _id: { $in: top.map((t) => t.userId) } }).lean();
  const byId = new Map(users.map((u) => [String(u._id), u]));
  res.json({
    items: top.map((t, i) => {
      const u = byId.get(String(t.userId));
      return {
        rank: i + 1,
        displayName: u?.displayName ?? 'Player',
        avatar: u?.avatar ?? null,
        xp: t.xp ?? 0,
        level: t.level ?? 1,
        me: String(t.userId) === req.user.id,
      };
    }),
  });
});
