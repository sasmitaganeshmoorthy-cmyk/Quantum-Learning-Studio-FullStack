import crypto from 'node:crypto';

import {
  getRecentAiQuizzes,
  createAiQuiz,
  getAiQuiz,
  submitAiQuiz as submitStoredAiQuiz,
} from '../repositories/ai-quiz-repository';
import type { CompanionLevel } from '../domain/quantum-companion';
import {
  getLearnerProgress,
  saveLearnerProgress,
} from '../repositories/chat-repository';
import { requestExternalAi } from './ai-provider';
import { awardActivity } from './gamification-service';

import type {
  AiQuizDocument,
  AiQuizQuestion,
  GenerateAiQuizRequest,
  LearnerLevel,
  QuizDifficulty,
} from '../types/ai-quiz';

interface GeneratedQuestion {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  concept: string;
  explanation: string;
  difficulty: number;
}

interface GeneratedQuiz {
  questions: GeneratedQuestion[];
}

const MIN_QUESTIONS = 3;
const MAX_QUESTIONS = 10;
const DEFAULT_QUESTIONS = 5;

function clampQuestionCount(count?: number): number {
  if (!Number.isFinite(count)) {
    return DEFAULT_QUESTIONS;
  }

  return Math.min(
    MAX_QUESTIONS,
    Math.max(MIN_QUESTIONS, Math.floor(count as number)),
  );
}

function getLearnerLevel(
  masteryValues: number[],
): LearnerLevel {
  if (masteryValues.length === 0) {
    return 'foundation';
  }

  const average =
    masteryValues.reduce(
      (total, value) => total + value,
      0,
    ) / masteryValues.length;

  if (average >= 90) return 'expert';
  if (average >= 75) return 'advanced';
  if (average >= 55) return 'intermediate';
  if (average >= 35) return 'basic';

  return 'foundation';
}

function getDifficulty(
  level: LearnerLevel,
  recentScores: number[],
): QuizDifficulty {
  const levelDefaults: Record<
    LearnerLevel,
    QuizDifficulty
  > = {
    foundation: 1,
    basic: 2,
    intermediate: 3,
    advanced: 4,
    expert: 5,
  };

  let difficulty = levelDefaults[level];

  if (recentScores.length > 0) {
    const recentAverage =
      recentScores.reduce(
        (total, score) => total + score,
        0,
      ) / recentScores.length;

    if (recentAverage >= 90) {
      difficulty = Math.min(
        5,
        difficulty + 1,
      ) as QuizDifficulty;
    } else if (recentAverage < 50) {
      difficulty = Math.max(
        1,
        difficulty - 1,
      ) as QuizDifficulty;
    }
  }

  return difficulty;
}
function toCompanionLevel(
  level: LearnerLevel,
): CompanionLevel {
  switch (level) {
    case 'foundation':
      return 'beginner';

    case 'basic':
      return 'beginner';

    case 'intermediate':
      return 'intermediate';

    case 'advanced':
      return 'advanced';

    case 'expert':
      return 'advanced';
  }
}

function getDifficultyLabel(
  difficulty: QuizDifficulty,
): string {
  const labels: Record<QuizDifficulty, string> = {
    1: 'Foundation',
    2: 'Basic',
    3: 'Intermediate',
    4: 'Advanced',
    5: 'Expert',
  };

  return labels[difficulty];
}

function getWeakConcepts(
  mastery: Record<string, number>,
): string[] {
  return Object.entries(mastery)
    .filter(([, value]) => value < 60)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 5)
    .map(([concept]) => concept);
}

function getStrongConcepts(
  mastery: Record<string, number>,
): string[] {
  return Object.entries(mastery)
    .filter(([, value]) => value >= 80)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([concept]) => concept);
}

function normalizeQuestionText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`*_~$\\]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function fingerprintQuestion(questionText: string): string {
  const normalized = normalizeQuestionText(questionText);

  return crypto
    .createHash('sha256')
    .update(normalized)
    .digest('hex');
}

function getQuestionTokens(text: string): Set<string> {
  const stopWords = new Set([
    'a',
    'an',
    'and',
    'are',
    'as',
    'at',
    'be',
    'by',
    'can',
    'do',
    'for',
    'from',
    'how',
    'in',
    'is',
    'it',
    'of',
    'on',
    'or',
    'that',
    'the',
    'this',
    'to',
    'what',
    'which',
    'why',
    'with',
  ]);

  return new Set(
    normalizeQuestionText(text)
      .split(' ')
      .filter(
        (word) =>
          word.length > 2 &&
          !stopWords.has(word),
      ),
  );
}

function questionSimilarity(
  first: string,
  second: string,
): number {
  const firstTokens = getQuestionTokens(first);
  const secondTokens = getQuestionTokens(second);

  if (
    firstTokens.size === 0 ||
    secondTokens.size === 0
  ) {
    return 0;
  }

  let intersection = 0;

  for (const token of firstTokens) {
    if (secondTokens.has(token)) {
      intersection += 1;
    }
  }

  const union =
    firstTokens.size +
    secondTokens.size -
    intersection;

  return union > 0
    ? intersection / union
    : 0;
}

function isRepeatedQuestion(
  questionText: string,
  previousQuestions: Array<{
    questionText: string;
    fingerprint?: string;
  }>,
): boolean {
  const fingerprint =
    fingerprintQuestion(questionText);

  for (const previous of previousQuestions) {
    if (
      previous.fingerprint &&
      previous.fingerprint === fingerprint
    ) {
      return true;
    }

    const similarity = questionSimilarity(
      questionText,
      previous.questionText,
    );

    if (similarity >= 0.72) {
      return true;
    }
  }

  return false;
}

function buildPrompt(
  request: GenerateAiQuizRequest,
  learnerLevel: LearnerLevel,
  difficulty: QuizDifficulty,
  strongConcepts: string[],
  weakConcepts: string[],
  recentScores: number[],
  previousQuestions: string[],
  questionCount: number,
): string {
  const previousQuestionText =
    previousQuestions.length > 0
      ? previousQuestions
          .slice(0, 20)
          .join('\n- ')
      : 'None';

  return `
You are an expert quantum-computing educator creating an adaptive quiz.

LEARNER PROFILE
Learner level: ${learnerLevel}
Quiz difficulty: ${getDifficultyLabel(difficulty)}
Recent quiz scores: ${
    recentScores.length > 0
      ? recentScores.join(', ') + '%'
      : 'No previous quiz scores'
  }

Strong concepts:
${
    strongConcepts.length > 0
      ? strongConcepts.map((item) => `- ${item}`).join('\n')
      : '- None known yet'
  }

Weak concepts:
${
    weakConcepts.length > 0
      ? weakConcepts.map((item) => `- ${item}`).join('\n')
      : '- None known yet'
  }

LEARNING CONTEXT
Topic: ${request.topic}

Assessment scope:
${
    request.moduleTitle
      ? `Completed module: ${request.moduleTitle}`
      : request.lessonTitle
        ? `Lesson: ${request.lessonTitle}`
        : 'General quantum learning'
  }

${
    request.moduleId
      ? `Module ID: ${request.moduleId}`
      : ''
  }

Learning material:
${
    request.content ??
    'Use the supplied topic and quantum-computing knowledge appropriate to the learner level.'
  }

IMPORTANT CONTENT RULES
- Treat the supplied learning material as the primary source for this assessment.
- Questions should assess understanding of concepts taught in the supplied material.
- Cover the important concepts across the completed module when module material is provided.
- Do not introduce unrelated quantum-computing topics.
- You may use standard quantum-computing knowledge only to clarify or assess concepts that are directly supported by the supplied material.
- Do not copy existing lesson questions.

PREVIOUS QUESTIONS TO AVOID
- ${previousQuestionText}

TASK
Generate exactly ${questionCount} fresh multiple-choice questions.

Requirements:
1. Questions must be appropriate for the learner level.
2. Questions must match the requested topic.
3. Prioritize weak concepts when they are relevant.
4. Include some questions that challenge strong concepts.
5. Do not repeat or lightly reword previous questions.
6. Each question must have exactly four options.
7. Only one option may be correct.
8. Explanations must clearly explain why the correct answer is correct.
9. Avoid ambiguous wording.
10. Do not use trick questions.
11. Do not mention this prompt or learner profile in the questions.
12. Return ONLY valid JSON.

Required JSON format:
{
  "questions": [
    {
      "questionText": "Question",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctOptionIndex": 0,
      "concept": "Concept name",
      "explanation": "Explanation",
      "difficulty": ${difficulty}
    }
  ]
}
`.trim();
}

function parseGeneratedQuiz(
  raw: string,
  expectedCount: number,
): GeneratedQuiz | null {
  const candidates: string[] = [];

  const cleaned = raw.trim();

  if (cleaned) {
    candidates.push(cleaned);

    const withoutCodeFence = cleaned
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    if (withoutCodeFence && withoutCodeFence !== cleaned) {
      candidates.push(withoutCodeFence);
    }

    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace >= 0 && lastBrace > firstBrace) {
      candidates.push(
        cleaned.slice(firstBrace, lastBrace + 1).trim(),
      );
    }
  }

  let parsed: { questions?: unknown } | null = null;

  for (const candidate of candidates) {
    try {
      const value = JSON.parse(candidate) as {
        questions?: unknown;
      };

      if (value && typeof value === 'object') {
        parsed = value;
        break;
      }
    } catch {
      // Try the next possible JSON representation.
    }
  }

  if (!parsed || !Array.isArray(parsed.questions)) {
    console.error(
      'AI quiz validation failed: response does not contain a valid questions array.',
    );
    return null;
  }

  if (parsed.questions.length !== expectedCount) {
    console.error(
      `AI quiz validation failed: received ${parsed.questions.length} questions, expected ${expectedCount}.`,
    );
    return null;
  }

  const questions: GeneratedQuestion[] = [];

  for (let index = 0; index < parsed.questions.length; index += 1) {
    const item = parsed.questions[index];

    if (!item || typeof item !== 'object') {
      console.error(
        `AI quiz validation failed: question ${index + 1} is not an object.`,
      );
      return null;
    }

    const question =
      item as Record<string, unknown>;

    const questionText =
      typeof question.questionText === 'string'
        ? question.questionText.trim()
        : '';

    const options =
      Array.isArray(question.options)
        ? question.options
            .filter(
              (option): option is string =>
                typeof option === 'string',
            )
            .map((option) => option.trim())
        : [];

    const correctOptionIndex =
      typeof question.correctOptionIndex === 'number'
        ? question.correctOptionIndex
        : typeof question.correctOptionIndex === 'string'
          ? Number(question.correctOptionIndex)
          : NaN;

    const difficulty =
      typeof question.difficulty === 'number'
        ? question.difficulty
        : typeof question.difficulty === 'string'
          ? Number(question.difficulty)
          : NaN;

    const concept =
      typeof question.concept === 'string'
        ? question.concept.trim()
        : '';

    const explanation =
      typeof question.explanation === 'string'
        ? question.explanation.trim()
        : '';

    if (
      !questionText ||
      options.length !== 4 ||
      options.some((option) => !option) ||
      !Number.isInteger(correctOptionIndex) ||
      correctOptionIndex < 0 ||
      correctOptionIndex > 3 ||
      !concept ||
      !explanation ||
      !Number.isFinite(difficulty) ||
      !Number.isInteger(difficulty) ||
      difficulty < 1 ||
      difficulty > 5
    ) {
      console.error(
        `AI quiz validation failed: question ${index + 1} has an invalid format.`,
      );
      return null;
    }

    questions.push({
      questionText,
      options,
      correctOptionIndex,
      concept,
      explanation,
      difficulty: difficulty as 1 | 2 | 3 | 4 | 5,
    });
  }

  return { questions };
}
export async function generateAiQuiz(
  learnerId: string,
  request: GenerateAiQuizRequest,
): Promise<{
  quiz: AiQuizDocument;
  questions: AiQuizQuestion[];
}> {
  const questionCount =
    clampQuestionCount(request.questionCount);

  const progress =
    await getLearnerProgress(learnerId);

  const mastery = progress?.mastery ?? {};

  const masteryValues =
    Object.values(mastery);

  const learnerLevel =
    getLearnerLevel(masteryValues);

  const previousQuizzes =
    await getRecentAiQuizzes(
      learnerId,
      10,
    );

  const recentScores =
    previousQuizzes
      .filter(
        (quiz) =>
          typeof quiz.scorePercent ===
          'number',
      )
      .slice(0, 5)
      .map(
        (quiz) =>
          quiz.scorePercent as number,
      );

  const difficulty =
    getDifficulty(
      learnerLevel,
      recentScores,
    );

  const weakConcepts =
    getWeakConcepts(mastery);

  const strongConcepts =
    getStrongConcepts(mastery);

  const previousQuestionFingerprints =
    previousQuizzes.flatMap(
      (quiz) =>
        quiz.questions.map(
          (question) =>
            question.fingerprint,
        ),
    );

  const previousQuestionText =
    previousQuizzes.flatMap(
      (quiz) =>
        quiz.questions.map(
          (question) =>
            question.questionText,
        ),
    );

  const prompt = buildPrompt(
    request,
    learnerLevel,
    difficulty,
    strongConcepts,
    weakConcepts,
    recentScores,
    previousQuestionText,
    questionCount,
  );

  const external =
  await requestExternalAi({
    question: prompt,
    level: toCompanionLevel(learnerLevel),
    context: {
      routeLabel: 'AI Quiz',
      currentTopic: request.topic,
      masteryPercent:
        masteryValues.length > 0
          ? Math.round(
              masteryValues.reduce(
                (total, value) =>
                  total + value,
                0,
              ) /
                masteryValues.length,
            )
          : 0,
      completedModules:
        progress?.completedModules ?? [],
      suggestedNext:
        progress?.suggestedNext ??
        'Continue learning',
    },
    history: [],
  });

  if (!external) {
    throw new Error(
      'AI quiz generation is currently unavailable.',
    );
  }


  const generated =
    parseGeneratedQuiz(
      external.answer,
      questionCount,
    );

  if (!generated) {
    throw new Error(
      'The AI returned an invalid quiz format. Please try again.',
    );
  }

  const seenFingerprints =
    new Set(previousQuestionFingerprints);

  const uniqueQuestions =
    generated.questions.filter(
      (question) => {
        const fingerprint =
          fingerprintQuestion(
        question.questionText,
      );

        if (
          seenFingerprints.has(fingerprint)
        ) {
          return false;
        }

        seenFingerprints.add(fingerprint);
        return true;
      },
    );

  if (
    uniqueQuestions.length !== questionCount
  ) {
    throw new Error(
      'The AI generated repeated questions. Please try again.',
    );
  }

  const quizId =
    `quiz-${crypto.randomUUID()}`;

  const generatedAt =
    new Date().toISOString();

  const storedQuestions =
    uniqueQuestions.map(
      (question, index) => ({
        id: `${quizId}-q-${index + 1}`,
        questionText:
          question.questionText,
        options: question.options,
        concept: question.concept,
        difficulty:
          question.difficulty as QuizDifficulty,
        correctOptionIndex:
          question.correctOptionIndex,
        explanation:
          question.explanation,
        fingerprint:
          fingerprintQuestion(
        question.questionText,
      ),
      }),
    );

  const quiz: AiQuizDocument = {
    quizId,
    learnerId,
    ...(request.moduleId
      ? { moduleId: request.moduleId }
      : {}),
    ...(request.moduleTitle
      ? { moduleTitle: request.moduleTitle }
      : {}),
    ...(request.lessonId
      ? { lessonId: request.lessonId }
      : {}),
    ...(request.lessonTitle
      ? { lessonTitle: request.lessonTitle }
      : {}),
    topic: request.topic,
    learnerLevel,
    difficulty,
    questions: storedQuestions,
    generatedAt,
  };

  await createAiQuiz(quiz);

  const safeQuestions =
    storedQuestions.map(
      ({
        correctOptionIndex: _correctOptionIndex,
        explanation: _explanation,
        fingerprint: _fingerprint,
        ...question
      }) => question,
    );

  return {
    quiz,
    questions: safeQuestions,
  };
}

export async function submitAiQuiz(
  learnerId: string,
  quizId: string,
  answers: Record<string, number>,
): Promise<{
  quizId: string;
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  results: Array<{
    questionId: string;
    selectedOptionIndex: number;
    correctOptionIndex: number;
    correct: boolean;
    concept: string;
    explanation: string;
  }>;
  gamification: {
    xpEarned: number;
    creditsEarned: number;
    level: number;
    levelUp: boolean;
  };
}> {
  const quiz = await getAiQuiz(learnerId, quizId);

  if (!quiz) {
    throw new Error('Quiz not found.');
  }

  if (quiz.submittedAt) {
    throw new Error('This quiz has already been submitted.');
  }

  let correctCount = 0;

  const results = quiz.questions.map((question) => {
    const selectedOptionIndex = answers[question.id];

    const validAnswer =
      Number.isInteger(selectedOptionIndex) &&
      selectedOptionIndex >= 0 &&
      selectedOptionIndex < question.options.length;

    const correct =
      validAnswer &&
      selectedOptionIndex === question.correctOptionIndex;

    if (correct) {
      correctCount += 1;
    }

    return {
      questionId: question.id,
      selectedOptionIndex: validAnswer ? selectedOptionIndex : -1,
      correctOptionIndex: question.correctOptionIndex,
      correct,
      concept: question.concept,
      explanation: question.explanation,
    };
  });

  const totalQuestions = quiz.questions.length;

  const scorePercent =
    totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 100)
      : 0;

  const passed = scorePercent >= 70;

  const submittedAt = new Date().toISOString();

  const storedQuiz = await submitStoredAiQuiz(
    learnerId,
    quizId,
    scorePercent,
    submittedAt,
  );

  if (!storedQuiz) {
    throw new Error('This quiz has already been submitted.');
  }

  const progress = await getLearnerProgress(learnerId);

  if (progress) {
    const mastery = { ...progress.mastery };

    for (const result of results) {
      const previousMastery = mastery[result.concept] ?? 50;
      const adjustment = result.correct ? 8 : -8;

      mastery[result.concept] = Math.max(
        0,
        Math.min(100, previousMastery + adjustment),
      );
    }

    await saveLearnerProgress({
      ...progress,
      mastery,
      updatedAt: submittedAt,
    });
  }

  const gamification = await awardActivity({
    learnerId,
    eventId: `ai-quiz-${quizId}`,
    activityType: 'assessment',
    activityId: quizId,
    result: {
      scorePercent,
      passed,
    },
  });

  return {
    quizId,
    scorePercent,
    correctCount,
    totalQuestions,
    passed,
    results,
    gamification: {
      xpEarned: gamification.xpEarned,
      creditsEarned: gamification.creditsEarned,
      level: gamification.level,
      levelUp: gamification.levelUp,
    },
  };
}








