import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import { env, isProd, isTest } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { optionalAuth } from './auth/middleware.js';
import { notFound, errorHandler } from './middleware/error.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// server/src is two levels below the repo root, so this resolves the built
// client whether running from source (dev) or in production.
const clientDist = path.resolve(__dirname, '../../client/dist');

export function createApp() {
  const app = express();
  app.disable('x-powered-by');

  // CSP is disabled for now; it will be tuned to the built client in the
  // security-hardening pass (spec §17) before any public exposure.
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(compression());
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  if (!isProd && !isTest) app.use(morgan('dev'));

  // Attach req.user (if signed in) to every request.
  app.use(optionalAuth);

  // API
  app.use('/api', apiRouter);
  app.use('/api', notFound);

  // In production the Express server also serves the built React app.
  if (isProd && existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  app.use(errorHandler);
  return app;
}
