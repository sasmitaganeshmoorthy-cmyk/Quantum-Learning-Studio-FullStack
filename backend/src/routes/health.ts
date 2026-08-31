import { Router } from 'express';

import { isExternalAiConfigured } from '../services/ai-provider';
import { getMongoDatabase, isMongoConfigured } from '../config/mongodb';

export const healthRouter = Router();

healthRouter.get('/', async (_request, response) => {
  let database: 'connected' | 'not-configured' | 'unavailable' =
    isMongoConfigured() ? 'unavailable' : 'not-configured';

  if (isMongoConfigured()) {
    try {
      const db = await getMongoDatabase();
      await db?.command({ ping: 1 });
      database = 'connected';
    } catch {
      database = 'unavailable';
    }
  }

  response
    .set('Cache-Control', 'no-store')
    .json({
      status: database === 'unavailable' ? 'degraded' : 'ok',
      database,
      externalAi: isExternalAiConfigured() ? 'configured' : 'local-fallback',
      timestamp: new Date().toISOString(),
    });
});
