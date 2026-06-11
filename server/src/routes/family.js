import { Router } from 'express';
import { requireAuth } from '../auth/middleware.js';
import { Family } from '../models/Family.js';
import { User } from '../models/User.js';
import { Progress } from '../models/Progress.js';

// Readable codes, no ambiguous characters (0/O/1/I).
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function genCode() {
  let s = '';
  for (let i = 0; i < 6; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return s;
}

async function uniqueCode() {
  for (let i = 0; i < 10; i++) {
    const c = genCode();
    if (!(await Family.exists({ inviteCode: c }))) return c;
  }
  return genCode();
}

async function familyPayload(familyId, meId) {
  const family = await Family.findById(familyId).lean();
  if (!family) return null;
  const members = await User.find({ familyId }).lean();
  const progresses = await Progress.find({
    userId: { $in: members.map((m) => m._id) },
  }).lean();
  const progById = new Map(progresses.map((p) => [String(p.userId), p]));
  return {
    name: family.name,
    code: family.inviteCode,
    isOwner: String(family.ownerId) === String(meId),
    members: members
      .map((m) => ({
        displayName: m.displayName,
        avatar: m.avatar ?? null,
        level: progById.get(String(m._id))?.level ?? 1,
        xp: progById.get(String(m._id))?.xp ?? 0,
        me: String(m._id) === String(meId),
      }))
      .sort((a, b) => b.xp - a.xp),
  };
}

export const familyRouter = Router();

familyRouter.get('/', requireAuth, async (req, res) => {
  const me = await User.findById(req.user.id).lean();
  if (!me?.familyId) return res.json({ family: null });
  res.json({ family: await familyPayload(me.familyId, req.user.id) });
});

familyRouter.post('/create', requireAuth, async (req, res) => {
  const name = (req.body?.name ?? '').trim();
  if (!name) return res.status(400).json({ error: 'name-required' });
  const inviteCode = await uniqueCode();
  const family = await Family.create({ name, inviteCode, ownerId: req.user.id });
  await User.findByIdAndUpdate(req.user.id, { familyId: family._id });
  res.json({ family: await familyPayload(family._id, req.user.id) });
});

familyRouter.post('/join', requireAuth, async (req, res) => {
  const code = (req.body?.code ?? '').trim().toUpperCase();
  if (!code) return res.status(400).json({ error: 'code-required' });
  const family = await Family.findOne({ inviteCode: code });
  if (!family) return res.status(404).json({ error: 'not-found' });
  await User.findByIdAndUpdate(req.user.id, { familyId: family._id });
  res.json({ family: await familyPayload(family._id, req.user.id) });
});

familyRouter.post('/leave', requireAuth, async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { familyId: null });
  res.json({ family: null });
});
