import { Router } from 'express';
import { googleConfigured, getAuthUrl, exchangeCode } from '../auth/google.js';
import { signToken, SESSION_COOKIE, cookieOptions } from '../auth/jwt.js';
import { User } from '../models/User.js';
import { env } from '../config/env.js';

export const authRouter = Router();

authRouter.get('/google', (_req, res) => {
  if (!googleConfigured()) {
    return res.status(501).json({ error: 'google-not-configured' });
  }
  res.redirect(getAuthUrl());
});

authRouter.get('/google/callback', async (req, res) => {
  if (!googleConfigured()) {
    return res.status(501).json({ error: 'google-not-configured' });
  }
  const { code, error } = req.query;
  if (error || !code) {
    return res.redirect(`${env.CLIENT_URL}/?auth=failed`);
  }
  try {
    const profile = await exchangeCode(String(code));
    const user = await User.findOneAndUpdate(
      { googleId: profile.googleId },
      {
        $set: {
          email: profile.email,
          displayName: profile.displayName,
          avatar: profile.avatar,
          locale: profile.locale || 'he',
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    res.cookie(SESSION_COOKIE, signToken(user), cookieOptions());
    res.redirect(`${env.CLIENT_URL}/profile`);
  } catch {
    res.redirect(`${env.CLIENT_URL}/?auth=error`);
  }
});

authRouter.get('/me', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const user = await User.findById(req.user.id).lean();
  if (!user) return res.status(401).json({ error: 'unauthorized' });
  res.json({
    id: String(user._id),
    email: user.email,
    displayName: user.displayName,
    avatar: user.avatar,
    locale: user.locale,
    role: user.role,
  });
});

authRouter.post('/logout', (_req, res) => {
  res.clearCookie(SESSION_COOKIE, { path: '/' });
  res.json({ ok: true });
});
