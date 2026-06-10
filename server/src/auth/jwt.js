import jwt from 'jsonwebtoken';
import { env, isProd } from '../config/env.js';

export const SESSION_COOKIE = 'mv_session';

export function signToken(user) {
  return jwt.sign(
    { sub: String(user._id), email: user.email, name: user.displayName },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN },
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch {
    return null;
  }
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}
