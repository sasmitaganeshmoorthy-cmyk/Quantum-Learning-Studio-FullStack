import { Router } from 'express';

import { requireUserId } from '../middleware/auth';
import {
  generateAiQuiz,
  submitAiQuiz,
} from '../services/ai-quiz-service';

import type {
  GenerateAiQuizRequest,
} from '../types/ai-quiz';

export const aiQuizRouter = Router();

function getLearnerId(userId: string): string {
  return `user-${userId}`;
}

function parseGenerateRequest(
  body: unknown,
): GenerateAiQuizRequest | null {
  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body)
  ) {
    return null;
  }

  const value =
    body as Record<string, unknown>;

  if (
    typeof value.topic !== 'string' ||
    value.topic.trim().length === 0 ||
    value.topic.trim().length > 200
  ) {
    return null;
  }

  if (
    value.moduleId !== undefined &&
    (
      typeof value.moduleId !== 'string' ||
      value.moduleId.length > 200
    )
  ) {
    return null;
  }

  if (
    value.moduleTitle !== undefined &&
    (
      typeof value.moduleTitle !== 'string' ||
      value.moduleTitle.length > 200
    )
  ) {
    return null;
  }

  if (
    value.lessonId !== undefined &&
    (
      typeof value.lessonId !== 'string' ||
      value.lessonId.length > 200
    )
  ) {
    return null;
  }

  if (
    value.lessonTitle !== undefined &&
    (
      typeof value.lessonTitle !== 'string' ||
      value.lessonTitle.length > 200
    )
  ) {
    return null;
  }

  if (
    value.content !== undefined &&
    (
      typeof value.content !== 'string' ||
      value.content.length > 20_000
    )
  ) {
    return null;
  }

  if (
    value.questionCount !== undefined &&
    (
      typeof value.questionCount !== 'number' ||
      !Number.isInteger(value.questionCount) ||
      value.questionCount < 3 ||
      value.questionCount > 10
    )
  ) {
    return null;
  }

  return {
    topic: value.topic.trim(),
    ...(typeof value.moduleId === 'string'
      ? {
          moduleId: value.moduleId.trim(),
        }
      : {}),
    ...(typeof value.moduleTitle === 'string'
      ? {
          moduleTitle:
            value.moduleTitle.trim(),
        }
      : {}),
    ...(typeof value.lessonId === 'string'
      ? {
          lessonId: value.lessonId.trim(),
        }
      : {}),
    ...(typeof value.lessonTitle === 'string'
      ? {
          lessonTitle:
            value.lessonTitle.trim(),
        }
      : {}),
    ...(typeof value.content === 'string'
      ? {
          content: value.content.trim(),
        }
      : {}),
    ...(typeof value.questionCount === 'number'
      ? {
          questionCount:
            value.questionCount,
        }
      : {}),
  };
}

aiQuizRouter.post(
  '/generate',
  async (request, response) => {
    const userId =
      requireUserId(request, response);

    if (!userId) return;

    const payload =
      parseGenerateRequest(request.body);

    if (!payload) {
      return response.status(400).json({
        error: 'Invalid AI quiz generation request.',
      });
    }

    try {
      const result =
        await generateAiQuiz(
          getLearnerId(userId),
          payload,
        );

      return response.json({
        quizId: result.quiz.quizId,
        learnerLevel:
          result.quiz.learnerLevel,
        difficulty:
          result.quiz.difficulty,
        questions: result.questions,
      });
    } catch (error) {
      console.error(
        'AI quiz generation failed:',
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : 'Unable to generate AI quiz.';

      if (
        message.includes('AI quiz generation') ||
        message.includes('invalid quiz format') ||
        message.includes('repeated questions')
      ) {
        return response.status(503).json({
          error: message,
        });
      }

      return response.status(500).json({
        error: 'Unable to generate AI quiz.',
      });
    }
  },
);


function parseSubmitAnswers(
  body: unknown,
): Record<string, number> | null {
  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body)
  ) {
    return null;
  }

  const value =
    body as Record<string, unknown>;

  if (
    !value.answers ||
    typeof value.answers !== 'object' ||
    Array.isArray(value.answers)
  ) {
    return null;
  }

  const answers =
    value.answers as Record<string, unknown>;

  const parsedAnswers: Record<string, number> = {};

  for (const [questionId, answer] of Object.entries(answers)) {
    if (
      typeof questionId !== 'string' ||
      questionId.trim().length === 0 ||
      typeof answer !== 'number' ||
      !Number.isInteger(answer) ||
      answer < 0 ||
      answer > 3
    ) {
      return null;
    }

    parsedAnswers[questionId] = answer;
  }

  if (Object.keys(parsedAnswers).length === 0) {
    return null;
  }

  return parsedAnswers;
}

aiQuizRouter.post(
  '/:quizId/submit',
  async (request, response) => {
    const userId =
      requireUserId(request, response);

    if (!userId) return;

    const { quizId } = request.params;

    if (
      typeof quizId !== 'string' ||
      quizId.trim().length === 0 ||
      quizId.length > 200
    ) {
      return response.status(400).json({
        error: 'Invalid quiz ID.',
      });
    }

    const answers =
      parseSubmitAnswers(request.body);

    if (!answers) {
      return response.status(400).json({
        error: 'Invalid quiz submission.',
      });
    }

    try {
      const result =
        await submitAiQuiz(
          getLearnerId(userId),
          quizId,
          answers,
        );

      return response.json(result);
    } catch (error) {
      console.error(
        'AI quiz submission failed:',
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : 'Unable to submit AI quiz.';

      if (
        message === 'Quiz not found.' ||
        message === 'This quiz has already been submitted.'
      ) {
        return response.status(400).json({
          error: message,
        });
      }

      return response.status(500).json({
        error: 'Unable to submit AI quiz.',
      });
    }
  },
);


