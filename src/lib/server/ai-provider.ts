import 'server-only';

import type { CompanionApiMessage } from '@/lib/api/companion-types';
import type { CompanionCourseContext, CompanionLevel } from '@/lib/quantum-companion';

interface ProviderResult {
  answer: string;
  source: 'external';
}

interface ProviderPayload {
  question: string;
  level: CompanionLevel;
  context: CompanionCourseContext;
  history: CompanionApiMessage[];
}

export function isExternalAiConfigured(): boolean {
  return Boolean(process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY);
}

function buildSystemPrompt(level: CompanionLevel, context: CompanionCourseContext): string {
  return `You are Qubit, a friendly and rigorous quantum-computing learning companion.

Learner level: ${level}
Current area: ${context.routeLabel}
Current topic: ${context.currentTopic}
Completed modules: ${context.completedModules.join(', ')}
Suggested next step: ${context.suggestedNext}

Cover quantum fundamentals, algorithms, hardware, error correction, Qiskit, Cirq, PennyLane, and realistic industry applications. Adapt mathematical depth to the learner level. Correct misconceptions gently. For practice problems, provide the smallest useful hint first and do not provide a complete solution unless the user explicitly requests it. Keep answers focused, structured, and below 500 words. Never claim live hardware access or guaranteed quantum advantage.`;
}

export async function requestExternalAi(payload: ProviderPayload): Promise<ProviderResult | null> {
  const apiKey = process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const baseUrl = (process.env.AI_API_BASE_URL ?? 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = process.env.AI_MODEL ?? 'gpt-4.1-mini';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18_000);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.35,
        max_tokens: 700,
        messages: [
          { role: 'system', content: buildSystemPrompt(payload.level, payload.context) },
          ...payload.history.slice(-8).map(({ role, content }) => ({ role, content })),
          { role: 'user', content: payload.question },
        ],
      }),
      cache: 'no-store',
      signal: controller.signal,
    });

    const rawBody = await response.text();
    const contentType = response.headers.get('content-type') ?? '';

    if (!response.ok) {
      console.error('External AI request failed:', response.status, rawBody.slice(0, 500));
      return null;
    }

    if (!contentType.includes('application/json')) {
      console.error(
        'External AI returned non-JSON:',
        response.status,
        contentType,
        rawBody.slice(0, 500),
      );
      return null;
    }

    let body: {
      choices?: Array<{ message?: { content?: string } }>;
    };

    try {
      body = JSON.parse(rawBody);
    } catch (error) {
      console.error('Unable to parse external AI response:', error);
      return null;
    }
    const answer = body.choices?.[0]?.message?.content?.trim();
    return answer ? { answer: answer.slice(0, 8_000), source: 'external' } : null;
  } catch (error) {
    console.error('External AI connection failed:', error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

