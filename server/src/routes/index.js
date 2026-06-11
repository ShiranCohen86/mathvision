import { Router } from 'express';
import { healthRouter } from './health.js';
import { authRouter } from './auth.js';
import { solveRouter } from './solve.js';
import { recognizeRouter } from './recognize.js';
import { historyRouter } from './history.js';
import { progressRouter } from './progress.js';
import { practiceRouter } from './practice.js';
import { familyRouter } from './family.js';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/solve', solveRouter);
apiRouter.use('/recognize', recognizeRouter);
apiRouter.use('/history', historyRouter);
apiRouter.use('/progress', progressRouter);
apiRouter.use('/practice', practiceRouter);
apiRouter.use('/family', familyRouter);

// Future routers mount here: tutor…
