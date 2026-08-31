import { Router } from 'express';

import { getMongoDatabase } from '../config/mongodb';
import { requireUserId } from '../middleware/auth';

const COLLECTION_NAME = 'user_onboarding';

export const onboardingRouter = Router();

onboardingRouter.get('/', async (request, response) => {
  const userId = requireUserId(request, response);
  if (!userId) return;

  try {
    const database = await getMongoDatabase();
    if (!database) {
      response.status(503).json({ error: 'Database unavailable' });
      return;
    }

    const onboarding = await database.collection(COLLECTION_NAME).findOne(
      { userId },
      { projection: { _id: 0, userId: 0 } },
    );

    response.set('Cache-Control', 'no-store').json({
      completed: onboarding?.completed === true,
      onboarding: onboarding ?? null,
    });
  } catch (error) {
    console.error('Onboarding status check failed:', error);
    response.status(500).json({ error: 'Unable to check onboarding status' });
  }
});

onboardingRouter.post('/', async (request, response) => {
  const userId = requireUserId(request, response);
  if (!userId) return;

  const {
    role,
    goal,
    mathLevel,
    codeLevel,
    quizAnswers,
    recommendedLevel,
    recommendedCourseId,
  } = request.body ?? {};

  if (![role, goal, mathLevel, codeLevel].every((value) => typeof value === 'string' && value.trim())) {
    response.status(400).json({ error: 'Please complete all onboarding questions' });
    return;
  }

  try {
    const database = await getMongoDatabase();
    if (!database) {
      response.status(503).json({ error: 'Database unavailable' });
      return;
    }

    const collection = database.collection(COLLECTION_NAME);
    await collection.createIndex({ userId: 1 }, { unique: true });

    const now = new Date();
    await collection.updateOne(
      { userId },
      {
        $set: {
          userId,
          role,
          goal,
          mathLevel,
          codeLevel,
          quizAnswers: quizAnswers ?? {},
          recommendedLevel,
          recommendedCourseId,
          completed: true,
          completedAt: now,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );

    response.json({ completed: true, message: 'Onboarding completed successfully' });
  } catch (error) {
    console.error('Onboarding save failed:', error);
    response.status(500).json({ error: 'Unable to save onboarding' });
  }
});
