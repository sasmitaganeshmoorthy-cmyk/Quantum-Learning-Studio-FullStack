import type { CompanionCourseContext, CompanionLevel } from '@/lib/quantum-companion';

export interface CompanionApiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface CompanionChatRequest {
  question: string;
  level: CompanionLevel;
  context: CompanionCourseContext;
  history?: CompanionApiMessage[];
  sessionId?: string;
  persistHistory?: boolean;
  consentToExternalAI?: boolean;
}

export interface CompanionChatResponse {
  answer: string;
  source: 'local' | 'external';
  latencyMs: number;
  persisted: boolean;
}

export interface CompanionHistoryResponse {
  sessionId: string;
  messages: CompanionApiMessage[];
}

export interface LearnerProgressDto {
  learnerId: string;
  completedModules: string[];
  mastery: Record<string, number>;
  suggestedNext: string;
  updatedAt: string;
}

