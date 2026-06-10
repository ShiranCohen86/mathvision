import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

// Load .env from the current working dir and the repo root (covers running
// from /server in dev and from the repo root in prod). On Render, real env
// vars are already set, so a missing file is a harmless no-op.
for (const candidate of [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env'),
]) {
  dotenv.config({ path: candidate });
}

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  CLIENT_URL: z.string().default('http://localhost:5173'),

  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/mathvision'),

  JWT_SECRET: z.string().default('dev-only-change-me'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  OPENAI_API_KEY: z.string().optional(),
  MATHPIX_APP_ID: z.string().optional(),
  MATHPIX_APP_KEY: z.string().optional(),

  VERIFIER_URL: z.string().default('http://127.0.0.1:8000'),
  VERIFIER_SERVICE_KEY: z.string().default('dev-only-change-me'),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  OAUTH_REDIRECT_BASE: z.string().default('http://localhost:5173'),
});

export const env = schema.parse(process.env);
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
