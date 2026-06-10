import { createApp } from './app.js';
import { connectDb } from './db/mongoose.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';

function main() {
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(
      `MathVision server listening on http://localhost:${env.PORT} (${env.NODE_ENV})`,
    );
  });

  // Connect to MongoDB in the background — the API (e.g. /api/health) should
  // come up even if the database is momentarily unavailable.
  void connectDb().catch(() => {
    logger.warn('Started without a database connection (MongoDB unavailable).');
  });

  const shutdown = (signal) => {
    logger.info(`Received ${signal}, shutting down…`);
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main();
