import { Router } from 'express';

import { getLearnerProgress, saveLearnerProgress } from '../repositories/chat-repository';
import { isMongoConfigured } from '../config/mongodb';
import { requireUserId } from '../middleware/auth';
import { parseLearnerProgress } from '../validation/companion-validation';

export const progressRouter = Router();

function getLearnerId(userId: string): string {
  return `user-${userId}`;
}

progressRouter.get('/', async (request, response) => {
  const userId = requireUserId(request, response);
  if (!userId) return;

  if (!isMongoConfigured()) {
    response.json({ progress: null, persisted: false });
    return;
  }

  try {
    const progress = await getLearnerProgress(getLearnerId(userId));
    response.set('Cache-Control', 'no-store').json({ progress, persisted: true });
  } catch (error) {
    console.error('Progress loading failed:', error);
    response.status(503).json({ error: 'Progress data is temporarily unavailable.' });
  }
});

progressRouter.patch('/', async (request, response) => {
  const userId = requireUserId(request, response);
  if (!userId) return;

  if (!request.body || typeof request.body !== 'object' || Array.isArray(request.body)) {
    response.status(400).json({ error: 'Invalid progress payload.' });
    return;
  }

  const progress = parseLearnerProgress({
    ...request.body,
    learnerId: getLearnerId(userId),
  });

  if (!progress) {
    response.status(400).json({ error: 'Invalid progress payload.' });
    return;
  }

  if (!isMongoConfigured()) {
    response.json({ progress, persisted: false });
    return;
  }

  try {
    const persisted = await saveLearnerProgress(progress);
    response.json({ progress, persisted });
  } catch (error) {
    console.error('Progress saving failed:', error);
    response.status(503).json({ error: 'Progress data could not be saved.' });
  }
});
