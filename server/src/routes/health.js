import { Router } from 'express';
import { dbState } from '../db/mongoose.js';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'mathvision-server',
    version: '0.0.0',
    time: new Date().toISOString(),
    db: dbState(),
  });
});
