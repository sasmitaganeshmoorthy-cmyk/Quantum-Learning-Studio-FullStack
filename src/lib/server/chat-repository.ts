import 'server-only';

import type { CompanionApiMessage, LearnerProgressDto } from '@/lib/api/companion-types';
import type { CompanionCourseContext, CompanionLevel } from '@/lib/quantum-companion';
import { getMongoDatabase } from '@/lib/server/mongodb';

interface StoredChatSession {
  sessionId: string;
  level: CompanionLevel;
  routeLabel: string;
  currentTopic: string;
  messages: CompanionApiMessage[];
  createdAt: Date;
  updatedAt: Date;
}

let indexesReady: Promise<void> | null = null;

async function ensureIndexes(): Promise<void> {
  if (indexesReady) return indexesReady;
  indexesReady = (async () => {
    const db = await getMongoDatabase();
    if (!db) return;
    await Promise.all([
      db.collection<StoredChatSession>('chat_sessions').createIndex({ sessionId: 1 }, { unique: true }),
      db.collection('learner_progress').createIndex({ learnerId: 1 }, { unique: true }),
    ]);
  })().catch((error) => {
    indexesReady = null;
    throw error;
  });
  return indexesReady;
}

export async function appendChatExchange(
  sessionId: string,
  level: CompanionLevel,
  context: CompanionCourseContext,
  messages: CompanionApiMessage[],
): Promise<boolean> {
  const db = await getMongoDatabase();
  if (!db) return false;
  await ensureIndexes();

  const now = new Date();
  await db.collection<StoredChatSession>('chat_sessions').updateOne(
    { sessionId },
    {
      $set: {
        level,
        routeLabel: context.routeLabel,
        currentTopic: context.currentTopic,
        updatedAt: now,
      },
      $setOnInsert: { sessionId, createdAt: now },
      $push: { messages: { $each: messages, $slice: -80 } },
    },
    { upsert: true },
  );
  return true;
}

export async function getChatHistory(sessionId: string): Promise<CompanionApiMessage[]> {
  const db = await getMongoDatabase();
  if (!db) return [];
  await ensureIndexes();
  const session = await db.collection<StoredChatSession>('chat_sessions').findOne(
    { sessionId },
    { projection: { _id: 0, messages: 1 } },
  );
  return session?.messages?.slice(-80) ?? [];
}

export async function deleteChatHistory(sessionId: string): Promise<boolean> {
  const db = await getMongoDatabase();
  if (!db) return false;
  await ensureIndexes();
  await db.collection<StoredChatSession>('chat_sessions').deleteOne({ sessionId });
  return true;
}

export async function getLearnerProgress(learnerId: string): Promise<LearnerProgressDto | null> {
  const db = await getMongoDatabase();
  if (!db) return null;
  await ensureIndexes();
  const progress = await db.collection<LearnerProgressDto>('learner_progress').findOne(
    { learnerId },
    { projection: { _id: 0 } },
  );
  return progress;
}

export async function saveLearnerProgress(progress: LearnerProgressDto): Promise<boolean> {
  const db = await getMongoDatabase();
  if (!db) return false;
  await ensureIndexes();
  await db.collection<LearnerProgressDto>('learner_progress').updateOne(
    { learnerId: progress.learnerId },
    { $set: progress },
    { upsert: true },
  );
  return true;
}

