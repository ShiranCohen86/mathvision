import { Router } from 'express';
import { healthRouter } from './health.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);

// Future routers mount here: auth, family, recognize, solve, tutor, practice…
