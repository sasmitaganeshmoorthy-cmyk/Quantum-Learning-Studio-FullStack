import type { QuizDifficulty, LearnerLevel } from './types';

export interface AiQuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  concept: string;
  difficulty: QuizDifficulty;
}

export interface GeneratedAiQuiz {
  quizId: string;
  learnerLevel: LearnerLevel;
  difficulty: QuizDifficulty;
  questions: AiQuizQuestion[];
}

export async function generateAiQuiz(input: {
  topic: string;
  moduleId?: string;
  moduleTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  content?: string;
  questionCount?: number;
}): Promise<GeneratedAiQuiz> {
  const response = await fetch('/api/v1/ai-quizzes/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? 'Unable to generate quiz.');
  }

  return data;
}

