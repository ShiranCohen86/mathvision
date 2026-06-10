import { Router } from 'express';
import { healthRouter } from './health.js';
import { solveRouter } from './solve.js';
import { recognizeRouter } from './recognize.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/solve', solveRouter);
apiRouter.use('/recognize', recognizeRouter);

// Future routers mount here: auth, family, tutor, practice…
