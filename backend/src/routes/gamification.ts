import { getAuth } from '@clerk/express';
import { Router } from 'express';

import {
  awardActivity,
  getOrCreateGamification,
} from '../services/gamification-service';
import { validateGamificationActivityEvent } from '../validation/gamification-validation';

const router = Router();

/**
 * GET /api/v1/gamification
 *
 * Returns the authenticated learner's gamification profile.
 */
router.get('/', async (request, response) => {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return response.status(401).json({
        error: 'Unauthorized',
      });
    }

    const learnerId = `user-${userId}`;

    const gamification =
      await getOrCreateGamification(learnerId);

    return response.json({
      gamification,
    });
  } catch (error) {
    console.error(
      'Failed to load gamification profile:',
      error
    );

    return response.status(500).json({
      error: 'Failed to load gamification profile',
    });
  }
});

/**
 * POST /api/v1/gamification/activity
 *
 * Records a completed learning activity and awards
 * XP, credits, streak progress, etc.
 */
router.post('/activity', async (request, response) => {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return response.status(401).json({
        error: 'Unauthorized',
      });
    }

    const learnerId = `user-${userId}`;

    const event =
      validateGamificationActivityEvent(
        request.body,
        learnerId
      );

    const result = await awardActivity({
      learnerId: event.learnerId,
      eventId: event.eventId,
      activityType: event.activityType,
      activityId: event.activityId,
      result: event.result,
    });

    return response.json(result);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Failed to process gamification activity';

    console.error(
      'Failed to process gamification activity:',
      error
    );

    if (
      message.includes('required') ||
      message.includes('Invalid') ||
      message.includes('too long') ||
      message.includes('must be')
    ) {
      return response.status(400).json({
        error: message,
      });
    }

    return response.status(500).json({
      error: 'Failed to process gamification activity',
    });
  }
});

export { router as gamificationRouter };