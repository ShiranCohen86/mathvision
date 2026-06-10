import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';

export function googleConfigured() {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
}

/** The redirect URI you must register in Google Cloud Console. */
export function redirectUri() {
  return `${env.OAUTH_REDIRECT_BASE}/api/auth/google/callback`;
}

function client() {
  return new OAuth2Client({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri: redirectUri(),
  });
}

export function getAuthUrl() {
  return client().generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    prompt: 'select_account',
  });
}

export async function exchangeCode(code) {
  const oauth = client();
  const { tokens } = await oauth.getToken(code);
  const ticket = await oauth.verifyIdToken({
    idToken: tokens.id_token,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return {
    googleId: payload.sub,
    email: payload.email,
    displayName: payload.name,
    avatar: payload.picture,
    locale: payload.locale,
  };
}
