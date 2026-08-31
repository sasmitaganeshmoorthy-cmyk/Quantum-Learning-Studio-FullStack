import { describe, expect, it } from 'vitest';

import { isSafeIdentifier, parseCompanionChatRequest, parseLearnerProgress } from '@/lib/api/companion-validation';

const context = {
  routeLabel: 'Bell States lesson',
  currentTopic: 'Entanglement',
  masteryPercent: 45,
  completedModules: ['Qubits'],
  suggestedNext: 'Build a Bell state',
};

describe('companion API validation', () => {
  it('accepts and normalizes a valid chat request', () => {
    const request = parseCompanionChatRequest({
      question: ' Explain entanglement ',
      level: 'beginner',
      context,
      consentToExternalAI: true,
    });
    expect(request?.question).toBe('Explain entanglement');
    expect(request?.consentToExternalAI).toBe(true);
  });

  it('rejects empty or oversized chat input', () => {
    expect(parseCompanionChatRequest({ question: '', level: 'beginner', context })).toBeNull();
    expect(parseCompanionChatRequest({ question: 'x'.repeat(1_501), level: 'beginner', context })).toBeNull();
  });

  it('clamps mastery values and validates identifiers', () => {
    const progress = parseLearnerProgress({
      learnerId: 'learner-demo-001',
      completedModules: ['Qubits'],
      mastery: { Qubits: 130, Entanglement: -5 },
      suggestedNext: 'Study controlled gates',
    });
    expect(progress?.mastery).toEqual({ Qubits: 100, Entanglement: 0 });
    expect(isSafeIdentifier('learner-demo-001')).toBe(true);
    expect(isSafeIdentifier('../unsafe')).toBe(false);
  });
});

