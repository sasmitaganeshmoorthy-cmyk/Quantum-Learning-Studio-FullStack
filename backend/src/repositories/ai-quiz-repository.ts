import type { Db } from 'mongodb';
import { getMongoDatabase } from '../config/mongodb';
import type { AiQuizDocument } from '../types/ai-quiz';

const QUIZ_COLLECTION = 'ai_quizzes';

let indexesInitialized = false;

async function getDatabase(): Promise<Db> {
  const db = await getMongoDatabase();

  if (!db) {
    throw new Error('MongoDB is not configured');
  }

  return db;
}

async function ensureIndexes(db: Db): Promise<void> {
  if (indexesInitialized) return;

  await Promise.all([
    db.collection<AiQuizDocument>(QUIZ_COLLECTION).createIndex(
      { quizId: 1 },
      { unique: true },
    ),

    db.collection<AiQuizDocument>(QUIZ_COLLECTION).createIndex({
      learnerId: 1,
      generatedAt: -1,
    }),

    db.collection<AiQuizDocument>(QUIZ_COLLECTION).createIndex({
      learnerId: 1,
      lessonId: 1,
      generatedAt: -1,
    }),

    db.collection<AiQuizDocument>(QUIZ_COLLECTION).createIndex({
      learnerId: 1,
      topic: 1,
      generatedAt: -1,
    }),
  ]);

  indexesInitialized = true;
}

export async function createAiQuiz(
  quiz: AiQuizDocument,
): Promise<AiQuizDocument> {
  const db = await getDatabase();

  await ensureIndexes(db);

  await db
    .collection<AiQuizDocument>(QUIZ_COLLECTION)
    .insertOne(quiz);

  return quiz;
}

export async function getAiQuiz(
  learnerId: string,
  quizId: string,
): Promise<AiQuizDocument | null> {
  const db = await getDatabase();

  await ensureIndexes(db);

  return db
    .collection<AiQuizDocument>(QUIZ_COLLECTION)
    .findOne({
      learnerId,
      quizId,
    });
}

export async function getRecentAiQuizzes(
  learnerId: string,
  limit = 10,
  context?: {
    lessonId?: string;
    moduleId?: string;
    topic?: string;
  },
): Promise<AiQuizDocument[]> {
  const db = await getDatabase();

  await ensureIndexes(db);

  const filter: Record<string, unknown> = {
    learnerId,
  };

  if (context?.lessonId) {
    filter.lessonId = context.lessonId;
  } else if (context?.moduleId) {
    filter.moduleId = context.moduleId;
  } else if (context?.topic) {
    filter.topic = context.topic;
  }

  return db
    .collection<AiQuizDocument>(QUIZ_COLLECTION)
    .find(filter)
    .sort({ generatedAt: -1 })
    .limit(limit)
    .toArray();
}

export async function submitAiQuiz(
  learnerId: string,
  quizId: string,
  scorePercent: number,
  submittedAt: string,
): Promise<AiQuizDocument | null> {
  const db = await getDatabase();

  await ensureIndexes(db);

  return db
    .collection<AiQuizDocument>(QUIZ_COLLECTION)
    .findOneAndUpdate(
      {
        learnerId,
        quizId,
        submittedAt: { $exists: false },
      },
      {
        $set: {
          scorePercent,
          submittedAt,
        },
      },
      {
        returnDocument: 'after',
      },
    );
}

export { QUIZ_COLLECTION };
