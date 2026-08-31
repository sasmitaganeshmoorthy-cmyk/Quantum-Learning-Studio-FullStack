import { describe, expect, it } from 'vitest';
import {
  buildQuantumCompanionResponse,
  getCompanionCourseContext,
  isActiveLearningRoute,
} from '../lib/quantum-companion';

describe('quantum companion knowledge engine', () => {
  it('appears only on learning routes', () => {
    expect(isActiveLearningRoute('/app/lessons/lesson-102-1')).toBe(true);
    expect(isActiveLearningRoute('/app/lab')).toBe(true);
    expect(isActiveLearningRoute('/app/settings')).toBe(false);
    expect(isActiveLearningRoute('/app/dashboard')).toBe(false);
  });

  it('adapts qubit explanations to the selected level', () => {
    const context = getCompanionCourseContext('/app/lessons/lesson-102-1');
    const beginner = buildQuantumCompanionResponse('What is a qubit?', 'beginner', context);
    const advanced = buildQuantumCompanionResponse('What is a qubit?', 'advanced', context);

    expect(beginner).toContain('direction on a globe');
    expect(advanced).toContain('density operator');
    expect(beginner).not.toEqual(advanced);
  });

  it('provides a hint before revealing a complete solution', () => {
    const context = getCompanionCourseContext('/app/challenges/challenge-bell-fix');
    const hint = buildQuantumCompanionResponse('I am stuck, give me a hint', 'beginner', context);
    const solution = buildQuantumCompanionResponse('Give me the full solution for the Bell challenge', 'beginner', context);

    expect(hint).toContain('Hint 1');
    expect(hint).not.toContain('initialize |00⟩');
    expect(solution).toContain('initialize |00⟩');
  });

  it('personalizes roadmaps by goal and weekly time', () => {
    const context = getCompanionCourseContext('/app/catalog');
    const response = buildQuantumCompanionResponse(
      'Build an industry career roadmap for a beginner with 3 hours per week',
      'beginner',
      context,
    );

    expect(response).toContain('12–16 weeks');
    expect(response).toContain('3 hours per week');
    expect(response).toContain('portfolio project');
  });

  it('uses route context for progress recommendations', () => {
    const context = getCompanionCourseContext('/app/progress');
    const response = buildQuantumCompanionResponse('What should I review next?', 'intermediate', context);

    expect(response).toContain('estimated mastery of 64%');
    expect(response).toContain('Review entanglement');
  });
});

