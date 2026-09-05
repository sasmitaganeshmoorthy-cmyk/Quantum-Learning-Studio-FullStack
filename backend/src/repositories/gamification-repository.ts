import type {
  ClientSession,
  Db,
  UpdateFilter,
} from 'mongodb';

import { getMongoDatabase } from '../config/mongodb';
import type {
  GamificationActivityEvent,
  LearnerGamification,
} from '../types/gamification';

interface GamificationEventDocument
  extends GamificationActivityEvent {
  processedAt: string;
  xpEarned: number;
  creditsEarned: number;
}

const GAMIFICATION_COLLECTION =
  'learner_gamification';

const EVENTS_COLLECTION =
  'gamification_events';

let indexesInitialized = false;

async function getDatabase(): Promise<Db | null> {
  return getMongoDatabase();
}

async function ensureIndexes(db: Db): Promise<void> {
  if (indexesInitialized) return;

  const gamification =
    db.collection<LearnerGamification>(
      GAMIFICATION_COLLECTION
    );

  const events =
    db.collection<GamificationEventDocument>(
      EVENTS_COLLECTION
    );

  await Promise.all([
    gamification.createIndex(
      { learnerId: 1 },
      { unique: true }
    ),

    events.createIndex(
      { learnerId: 1, eventId: 1 },
      { unique: true }
    ),

    events.createIndex({
      learnerId: 1,
      activityType: 1,
      activityId: 1,
    }),
  ]);

  indexesInitialized = true;
}

export async function getGamification(
  learnerId: string
): Promise<LearnerGamification | null> {
  const db = await getDatabase();

  if (!db) return null;

  await ensureIndexes(db);

  return db
    .collection<LearnerGamification>(
      GAMIFICATION_COLLECTION
    )
    .findOne({ learnerId });
}

export async function createGamification(
  gamification: LearnerGamification,
  session?: ClientSession
): Promise<LearnerGamification> {
  const db = await getDatabase();

  if (!db) {
    throw new Error('MongoDB is not configured');
  }

  await ensureIndexes(db);

  await db
    .collection<LearnerGamification>(
      GAMIFICATION_COLLECTION
    )
    .insertOne(
      gamification as LearnerGamification,
      session ? { session } : undefined
    );

  return gamification;
}

export async function updateGamification(
  learnerId: string,
  update: UpdateFilter<LearnerGamification>,
  session?: ClientSession
): Promise<LearnerGamification | null> {
  const db = await getDatabase();

  if (!db) {
    throw new Error('MongoDB is not configured');
  }

  await ensureIndexes(db);

  return db
    .collection<LearnerGamification>(
      GAMIFICATION_COLLECTION
    )
    .findOneAndUpdate(
      { learnerId },
      update,
      {
        returnDocument: 'after',
        ...(session ? { session } : {}),
      }
    );
}

export async function getEvent(
  learnerId: string,
  eventId: string,
  session?: ClientSession
): Promise<GamificationEventDocument | null> {
  const db = await getDatabase();

  if (!db) return null;

  await ensureIndexes(db);

  return db
    .collection<GamificationEventDocument>(
      EVENTS_COLLECTION
    )
    .findOne(
      {
        learnerId,
        eventId,
      },
      session ? { session } : undefined
    );
}

export async function createEvent(
  event: GamificationEventDocument,
  session?: ClientSession
): Promise<void> {
  const db = await getDatabase();

  if (!db) {
    throw new Error('MongoDB is not configured');
  }

  await ensureIndexes(db);

  await db
    .collection<GamificationEventDocument>(
      EVENTS_COLLECTION
    )
    .insertOne(
      event,
      session ? { session } : undefined
    );
}

export async function withGamificationTransaction<T>(
  callback: (
    db: Db,
    session: ClientSession
  ) => Promise<T>
): Promise<T> {
  const db = await getDatabase();

  if (!db) {
    throw new Error('MongoDB is not configured');
  }

  await ensureIndexes(db);

  const client = db.client;
  const session = client.startSession();

  try {
    return await session.withTransaction(
      async () => callback(db, session),
      {
        readConcern: {
          level: 'snapshot',
        },
        writeConcern: {
          w: 'majority',
        },
        readPreference: 'primary',
      }
    );
  } finally {
    await session.endSession();
  }
}

export type {
  GamificationEventDocument,
};