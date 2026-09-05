import type {
  GamificationActivityEvent,
  GamificationActivityType,
} from '../types/gamification';

const ACTIVITY_TYPES: GamificationActivityType[] = [
  'lesson',
  'challenge',
  'assessment',
  'simulation',
  'daily_mission',
  'boss',
];

const MAX_ID_LENGTH = 200;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isActivityType(
  value: unknown
): value is GamificationActivityType {
  return (
    typeof value === 'string' &&
    ACTIVITY_TYPES.includes(value as GamificationActivityType)
  );
}

export function validateGamificationActivityEvent(
  input: unknown,
  learnerId: string
): GamificationActivityEvent {
  if (!input || typeof input !== 'object') {
    throw new Error('Invalid gamification event');
  }

  const body = input as Record<string, unknown>;

  if (!isNonEmptyString(body.activityType)) {
    throw new Error('activityType is required');
  }

  if (!isActivityType(body.activityType)) {
    throw new Error('Invalid activityType');
  }

  if (!isNonEmptyString(body.activityId)) {
    throw new Error('activityId is required');
  }

  if (body.activityId.length > MAX_ID_LENGTH) {
    throw new Error('activityId is too long');
  }

  if (!isNonEmptyString(body.eventId)) {
    throw new Error('eventId is required');
  }

  if (body.eventId.length > MAX_ID_LENGTH) {
    throw new Error('eventId is too long');
  }

  let result: GamificationActivityEvent['result'] | undefined;

  if (body.result !== undefined) {
    if (
      !body.result ||
      typeof body.result !== 'object' ||
      Array.isArray(body.result)
    ) {
      throw new Error('Invalid result');
    }

    const rawResult = body.result as Record<string, unknown>;

    if (
      rawResult.scorePercent !== undefined &&
      (
        typeof rawResult.scorePercent !== 'number' ||
        !Number.isFinite(rawResult.scorePercent) ||
        rawResult.scorePercent < 0 ||
        rawResult.scorePercent > 100
      )
    ) {
      throw new Error('scorePercent must be between 0 and 100');
    }

    if (
      rawResult.passed !== undefined &&
      typeof rawResult.passed !== 'boolean'
    ) {
      throw new Error('passed must be a boolean');
    }

    if (
      rawResult.simulationCompleted !== undefined &&
      typeof rawResult.simulationCompleted !== 'boolean'
    ) {
      throw new Error(
        'simulationCompleted must be a boolean'
      );
    }

    result = {
      ...(typeof rawResult.scorePercent === 'number'
        ? { scorePercent: rawResult.scorePercent }
        : {}),
      ...(typeof rawResult.passed === 'boolean'
        ? { passed: rawResult.passed }
        : {}),
      ...(typeof rawResult.simulationCompleted === 'boolean'
        ? {
            simulationCompleted:
              rawResult.simulationCompleted,
          }
        : {}),
    };
  }

  return {
    learnerId,
    activityType: body.activityType,
    activityId: body.activityId.trim(),
    eventId: body.eventId.trim(),
    ...(result ? { result } : {}),
  };
}