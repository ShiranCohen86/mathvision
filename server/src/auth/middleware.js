import { verifyToken, SESSION_COOKIE } from './jwt.js';

/** Attaches req.user from the signed session cookie (or null). No DB hit. */
export function optionalAuth(req, _res, next) {
  const token = req.cookies?.[SESSION_COOKIE];
  const payload = token ? verifyToken(token) : null;
  req.user = payload?.sub
    ? { id: payload.sub, email: payload.email, name: payload.name }
    : null;
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  next();
}
