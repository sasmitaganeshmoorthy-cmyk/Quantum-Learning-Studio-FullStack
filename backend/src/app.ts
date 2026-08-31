import { clerkMiddleware } from '@clerk/express';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { companionRouter } from './routes/companion';
import { healthRouter } from './routes/health';
import { onboardingRouter } from './routes/onboarding';
import { progressRouter } from './routes/progress';

function allowedOrigins(): string[] {
  return (process.env.FRONTEND_URLS ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: allowedOrigins(), credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(clerkMiddleware());

  app.use('/api/health', healthRouter);
  app.use('/api/v1/onboarding', onboardingRouter);
  app.use('/api/v1/progress', progressRouter);
  app.use('/api/v1/companion', companionRouter);

  app.use((_request, response) => {
    response.status(404).json({ error: 'Route not found' });
  });

  return app;
}
