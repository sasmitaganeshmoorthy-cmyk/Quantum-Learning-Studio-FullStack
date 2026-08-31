import { Router } from 'express';

import { deleteChatHistory, getChatHistory } from '../repositories/chat-repository';
import { isMongoConfigured } from '../config/mongodb';
import { requireUserId } from '../middleware/auth';
import { allowRequest } from '../services/rate-limit';
import { answerCompanionQuestion } from '../services/chat-service';
import { parseCompanionChatRequest } from '../validation/companion-validation';

export const companionRouter = Router();

function getUserResourceId(userId: string): string {
  return `user-${userId}`;
}

companionRouter.post('/chat', async (request, response) => {
  const userId = requireUserId(request, response);
  if (!userId) return;

  if (!allowRequest(`chat:${userId}`)) {
    response.status(429).json({ error: 'Too many requests. Please wait a minute and try again.' });
    return;
  }

  const parsed = parseCompanionChatRequest(request.body);
  if (!parsed) {
    response.status(400).json({ error: 'Invalid chat request.' });
    return;
  }

  const result = await answerCompanionQuestion({
    ...parsed,
    sessionId: getUserResourceId(userId),
  });

  response
    .set({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' })
    .json(result);
});

companionRouter.get('/history', async (request, response) => {
  const userId = requireUserId(request, response);
  if (!userId) return;

  const sessionId = getUserResourceId(userId);
  if (!isMongoConfigured()) {
    response.json({ sessionId, messages: [], persisted: false });
    return;
  }

  try {
    const messages = await getChatHistory(sessionId);
    response.set('Cache-Control', 'no-store').json({ sessionId, messages, persisted: true });
  } catch {
    response.status(503).json({ error: 'Chat history is temporarily unavailable.' });
  }
});

companionRouter.delete('/history', async (request, response) => {
  const userId = requireUserId(request, response);
  if (!userId) return;

  if (!isMongoConfigured()) {
    response.json({ deleted: false, persisted: false });
    return;
  }

  try {
    const deleted = await deleteChatHistory(getUserResourceId(userId));
    response.json({ deleted, persisted: true });
  } catch {
    response.status(503).json({ error: 'Chat history could not be deleted.' });
  }
});
