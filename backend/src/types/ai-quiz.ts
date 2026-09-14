export type QuizDifficulty = 1 | 2 | 3 | 4 | 5;

export type LearnerLevel =
  | 'foundation'
  | 'basic'
  | 'intermediate'
  | 'advanced'
  | 'expert';

export interface QuizGenerationContext {
  lessonId?: string;
  lessonTitle?: string;
  topic: string;
  content?: string;
  learnerLevel: LearnerLevel;
  difficulty: QuizDifficulty;
  strongConcepts: string[];
  weakConcepts: string[];
  recentScores: number[];
  previousQuestionFingerprints: string[];
}

export interface AiQuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  concept: string;
  difficulty: QuizDifficulty;
}

export interface StoredAiQuizQuestion
  extends AiQuizQuestion {
  correctOptionIndex: number;
  explanation: string;
  fingerprint: string;
}

export interface AiQuizDocument {
  quizId: string;
  learnerId: string;
  moduleId?: string;
  moduleTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  topic: string;
  learnerLevel: LearnerLevel;
  difficulty: QuizDifficulty;
  questions: StoredAiQuizQuestion[];
  generatedAt: string;
  submittedAt?: string;
  scorePercent?: number;
}

export interface GenerateAiQuizRequest {
  moduleId?: string;
  moduleTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  topic: string;
  content?: string;
  questionCount?: number;
}

export interface GenerateAiQuizResponse {
  quizId: string;
  learnerLevel: LearnerLevel;
  difficulty: QuizDifficulty;
  questions: AiQuizQuestion[];
}

export interface SubmitAiQuizRequest {
  answers: Record<string, number>;
}

export interface AiQuizQuestionResult {
  questionId: string;
  selectedOptionIndex: number;
  correct: boolean;
  concept: string;
  explanation: string;
}

export interface SubmitAiQuizResponse {
  quizId: string;
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  results: AiQuizQuestionResult[];
  gamification?: {
    xpEarned: number;
    creditsEarned: number;
    level: number;
    levelUp: boolean;
  };
}


