import type {
  CompanionChatRequest,
  CompanionChatResponse,
  CompanionHistoryResponse,
} from '@/lib/api/companion-types';
import { buildQuantumCompanionResponse } from '@/lib/quantum-companion';

export async function requestCompanionAnswer(
  payload: CompanionChatRequest,
  signal?: AbortSignal,
): Promise<CompanionChatResponse> {
  const startedAt = performance.now();
  try {
    const response = await fetch('/api/v1/companion/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal,
    });
    if (!response.ok) throw new Error(`Companion API returned ${response.status}`);
    return (await response.json()) as CompanionChatResponse;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    return {
      answer: buildQuantumCompanionResponse(payload.question, payload.level, payload.context),
      source: 'local',
      latencyMs: Math.round(performance.now() - startedAt),
      persisted: false,
    };
  }
}
export async function getPersistedCompanionHistory(
  signal?: AbortSignal
): Promise<CompanionHistoryResponse> {
  const response = await fetch('/api/v1/companion/history', {
    method: 'GET',
    cache: 'no-store',
    signal,
  });

  if (!response.ok) {
    throw new Error(`History API returned ${response.status}`);
  }

  return (await response.json()) as CompanionHistoryResponse;
}
export async function deletePersistedCompanionHistory(sessionId: string): Promise<void> {
  try {
    await fetch(`/api/v1/companion/history?sessionId=${encodeURIComponent(sessionId)}`, {
      method: 'DELETE',
      cache: 'no-store',
    });
  } catch {
    // Local history is still cleared when the optional backend is unavailable.
  }
}

