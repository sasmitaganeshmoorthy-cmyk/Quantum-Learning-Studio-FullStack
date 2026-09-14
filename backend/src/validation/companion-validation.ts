import type { CompanionApiMessage, CompanionChatRequest, LearnerProgressDto } from '../types/companion';
import type { CompanionCourseContext, CompanionLevel } from '../domain/quantum-companion';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  return text && text.length <= maxLength ? text : null;
}

function readLevel(value: unknown): CompanionLevel | null {
  return value === 'beginner' || value === 'intermediate' || value === 'advanced' ? value : null;
}

function readContext(value: unknown): CompanionCourseContext | null {
  if (!isRecord(value)) return null;
  const routeLabel = readText(value.routeLabel, 120);
  const currentTopic = readText(value.currentTopic, 200);
  const suggestedNext = readText(value.suggestedNext, 500);
  const masteryPercent = typeof value.masteryPercent === 'number' ? value.masteryPercent : NaN;
  const completedModules = Array.isArray(value.completedModules)
    ? value.completedModules.map((item) => readText(item, 120)).filter((item): item is string => Boolean(item)).slice(0, 30)
    : [];

  if (!routeLabel || !currentTopic || !suggestedNext || !Number.isFinite(masteryPercent)) return null;
  return {
    routeLabel,
    currentTopic,
    suggestedNext,
    completedModules,
    masteryPercent: Math.round(Math.min(Math.max(masteryPercent, 0), 100)),
  };
}

function readHistory(value: unknown): CompanionApiMessage[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): CompanionApiMessage[] => {
    if (!isRecord(item) || (item.role !== 'user' && item.role !== 'assistant')) return [];
    const id = readText(item.id, 160);
    const content = readText(item.content, 8_000);
    const timestamp = readText(item.timestamp, 80);
    return id && content && timestamp ? [{ id, role: item.role, content, timestamp }] : [];
  }).slice(-12);
}

export function parseCompanionChatRequest(value: unknown): CompanionChatRequest | null {
  if (!isRecord(value)) return null;
  const question = readText(value.question, 1_500);
  const level = readLevel(value.level);
  const context = readContext(value.context);
  if (!question || !level || !context) return null;

  const sessionId = value.sessionId === undefined ? undefined : readText(value.sessionId, 160) ?? undefined;
  return {
    question,
    level,
    context,
    history: readHistory(value.history),
    sessionId,
    persistHistory: value.persistHistory === true,
    consentToExternalAI: value.consentToExternalAI === true,
  };
}

export function parseLearnerProgress(value: unknown): LearnerProgressDto | null {
  if (!isRecord(value)) return null;

  const learnerId = readText(value.learnerId, 160);
  const suggestedNext = readText(value.suggestedNext, 500);

  if (!learnerId || !suggestedNext || !isRecord(value.mastery)) {
    return null;
  }

  const completedLessons = Array.isArray(value.completedLessons)
    ? value.completedLessons
        .map((item) => readText(item, 120))
        .filter((item): item is string => Boolean(item))
        .slice(0, 200)
    : [];

  const completedModules = Array.isArray(value.completedModules)
    ? value.completedModules
        .map((item) => readText(item, 120))
        .filter((item): item is string => Boolean(item))
        .slice(0, 100)
    : [];

  const mastery = Object.fromEntries(
    Object.entries(value.mastery)
      .filter(
        ([key, score]) =>
          key.length <= 120 &&
          typeof score === 'number' &&
          Number.isFinite(score),
      )
      .slice(0, 100)
      .map(([key, score]) => [
        key,
        Math.round(Math.min(Math.max(score as number, 0), 100)),
      ]),
  );

  return {
    learnerId,
    completedLessons,
    completedModules,
    mastery,
    suggestedNext,
    updatedAt: new Date().toISOString(),
  };
}

export function isSafeIdentifier(value: string | null): value is string {
  return Boolean(value && /^[A-Za-z0-9_-]{8,160}$/.test(value));
}
