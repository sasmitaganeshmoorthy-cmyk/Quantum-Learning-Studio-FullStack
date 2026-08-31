import type { CompanionApiMessage, CompanionChatRequest, CompanionChatResponse } from '../types/companion';
import { buildQuantumCompanionResponse } from '../domain/quantum-companion';
import { requestExternalAi } from './ai-provider';
import { appendChatExchange } from '../repositories/chat-repository';

export async function answerCompanionQuestion(request: CompanionChatRequest): Promise<CompanionChatResponse> {
  const startedAt = Date.now();
  const external = request.consentToExternalAI
    ? await requestExternalAi({
      question: request.question,
      level: request.level,
      context: request.context,
      history: request.history ?? [],
    })
    : null;

  const answer = external?.answer ?? buildQuantumCompanionResponse(request.question, request.level, request.context);
  const source = external?.source ?? 'local';
  const timestamp = new Date().toISOString();
  let persisted = false;
  if (request.persistHistory && request.sessionId) {
    const messages: CompanionApiMessage[] = [
      {
        id: `server-user-${crypto.randomUUID()}`,
        role: 'user',
        content: request.question,
        timestamp,
      },
      {
        id: `server-assistant-${crypto.randomUUID()}`,
        role: 'assistant',
        content: answer,
        timestamp,
      },
    ];
    try {
      persisted = await appendChatExchange(request.sessionId, request.level, request.context, messages);
    } catch {
      persisted = false;
    }
  }

  return { answer, source, latencyMs: Date.now() - startedAt, persisted };
}
