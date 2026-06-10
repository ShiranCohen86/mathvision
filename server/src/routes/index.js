import { Router } from 'express';
import { healthRouter } from './health.js';
import { authRouter } from './auth.js';
import { solveRouter } from './solve.js';
import { recognizeRouter } from './recognize.js';
import { historyRouter } from './history.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/solve', solveRouter);
apiRouter.use('/recognize', recognizeRouter);
apiRouter.use('/history', historyRouter);

// Future routers mount here: family, tutor, practice…
