import { logger } from '../lib/logger.js';

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export function notFound(_req, res) {
  res.status(404).json({ error: 'Not found' });
}

// Express recognises an error handler by its four-argument signature.
export function errorHandler(err, _req, res, _next) {
  const status = err instanceof HttpError ? err.status : 500;
  const message = err instanceof Error ? err.message : 'Internal error';
  if (status >= 500) logger.error(message, err);
  res.status(status).json({ error: message });
}
