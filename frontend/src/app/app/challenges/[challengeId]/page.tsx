'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Trophy,
  Star,
  CheckCircle,
  XCircle,
  Loader2,
  Lightbulb,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { mockChallenges, mockApi } from '@/lib/api/mock-client';
import { Circuit, ChallengeEvaluation } from '@/lib/api/types';
import { CircuitBuilder } from '@/components/quantum/circuit-builder';
import { AiTutor } from '@/components/learning/ai-tutor';

export default function ChallengeWorkspace({ params }: { params: Promise<{ challengeId: string }> }) {
  const router = useRouter();
  const { challengeId } = use(params);

  const challenge = mockChallenges.find((c) => c.id === challengeId);

  // Challenge workspace circuit states
  const [circuit, setCircuit] = useState<Circuit | null>(
    challenge ? JSON.parse(JSON.stringify(challenge.startingCircuit)) : null
  );
  
  const [selectedPaletteGate, setSelectedPaletteGate] = useState<string | null>(null);
  
  // Hint states
  const [hintIndex, setHintIndex] = useState(-1);
  
  // Submit states
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<ChallengeEvaluation | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'canvas' | 'instructions' | 'tutor'>('canvas');

  if (!challenge || !circuit) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold">Challenge not found</h1>
        <p className="text-text-secondary">We could not load the requested challenge.</p>
        <Link href="/app/challenges" className="inline-flex py-2 px-4 bg-primary-color text-white rounded-medium">
          Back to list
        </Link>
      </div>
    );
  }

  const handleRequestHint = () => {
    if (hintIndex < challenge.hints.length - 1) {
      setHintIndex((prev) => prev + 1);
    }
  };

  const handleSubmitSolution = async () => {
    setSubmitting(true);
    setEvaluation(null);

    try {
      const res = await mockApi.evaluateChallenge(challenge.id, circuit);
      setEvaluation(res);

      if (res.isCorrect) {
        // Trigger confetti fireworks
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
        setShowSuccessModal(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="h-full min-h-0 min-w-0 flex flex-col overflow-hidden font-sans relative">
      
      {/* Top Header toolbar */}
      <header className="min-h-16 border-b border-border-color bg-surface px-3 sm:px-4 py-2 flex items-center justify-between gap-2 shrink-0">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            onClick={() => router.back()}
            className="touch-target flex shrink-0 items-center justify-center hover:bg-surface-hover rounded-medium text-text-secondary hover:text-text-primary"
            aria-label="Back to challenges list"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0">
            <h1 className="truncate font-bold text-body-small leading-tight">{challenge.title}</h1>
            <span className="hidden sm:block text-[10px] text-text-secondary uppercase font-bold tracking-wider">Attempt Workspace</span>
          </div>
        </div>

        {/* Submit action */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmitSolution}
            disabled={submitting}
            className="px-3 sm:px-5 py-1.5 bg-success-color hover:bg-success-color/90 text-white text-caption font-bold rounded-medium transition-colors flex shrink-0 items-center gap-1.5 disabled:opacity-30"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Trophy size={14} />}
            <span className="hidden sm:inline">Submit Challenge</span><span className="sm:hidden">Submit</span>
          </button>
        </div>
      </header>

      {/* Mobile Tab Swapper */}
      <div className="flex lg:hidden bg-surface border-b border-border-color shrink-0 p-1" role="tablist" aria-label="Challenge workspace">
        <button
          onClick={() => setActiveMobileTab('canvas')}
          role="tab"
          aria-selected={activeMobileTab === 'canvas'}
          className={`min-h-11 flex-1 py-2 text-xs font-bold text-center rounded-medium transition-all ${
            activeMobileTab === 'canvas' ? 'bg-primary-color text-white' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Workspace
        </button>
        <button
          onClick={() => setActiveMobileTab('instructions')}
          role="tab"
          aria-selected={activeMobileTab === 'instructions'}
          className={`min-h-11 flex-1 py-2 text-xs font-bold text-center rounded-medium transition-all ${
            activeMobileTab === 'instructions' ? 'bg-primary-color text-white' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Instructions
        </button>
        <button
          onClick={() => setActiveMobileTab('tutor')}
          role="tab"
          aria-selected={activeMobileTab === 'tutor'}
          className={`min-h-11 flex-1 py-2 text-xs font-bold text-center rounded-medium transition-all ${
            activeMobileTab === 'tutor' ? 'bg-primary-color text-white' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          AI Tutor
        </button>
      </div>

      {/* Main split dashboard zones */}
      <div className="flex-1 min-h-0 min-w-0 flex overflow-hidden">
        
        {/* Left Sidepanel: Task metrics */}
        <aside className={`w-full lg:w-80 border-r border-border-color bg-surface p-4 flex flex-col justify-between shrink-0 overflow-y-auto ${activeMobileTab === 'instructions' ? 'flex' : 'hidden'} lg:flex`}>
          <div className="space-y-6">
            
            {/* Description */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-text-secondary tracking-wider uppercase block">Task Description</span>
              <p className="text-body-small text-text-secondary leading-relaxed">
                {challenge.description}
              </p>
            </div>

            {/* Validation checklist criteria */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-text-secondary tracking-wider uppercase block">Target Objective</span>
              <div className="p-3 bg-background rounded-medium border border-border-color/50 flex items-start gap-2.5">
                <CheckCircle className="text-primary-color shrink-0 mt-0.5" size={16} />
                <span className="text-caption text-text-secondary leading-relaxed">
                  {challenge.validationCriteria}
                </span>
              </div>
            </div>

            {/* Clues/Hints lists */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-text-secondary tracking-wider uppercase block">Clues & Hints</span>
              
              {hintIndex >= 0 && (
                <div className="p-3 rounded-medium bg-amber-50 dark:bg-amber-950/20 border border-warning-color/30 text-warning-color text-caption leading-relaxed flex gap-2">
                  <Lightbulb size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Hint {hintIndex + 1}:</span>
                    <p className="text-text-secondary">{challenge.hints[hintIndex]}</p>
                  </div>
                </div>
              )}

              {hintIndex < challenge.hints.length - 1 && (
                <button
                  onClick={handleRequestHint}
                  className="w-full py-2 px-3 border border-border-color rounded-medium text-caption font-semibold bg-background hover:bg-surface-hover transition-colors text-text-secondary"
                >
                  Request Next Hint ({hintIndex + 1} / {challenge.hints.length} unlocked)
                </button>
              )}
            </div>
          </div>

          {/* Reward summary */}
          <div className="pt-4 border-t border-border-color">
            <div className="flex items-center gap-2 text-warning-color font-bold text-body-small">
              <Star size={18} fill="currentColor" />
              <span>+{challenge.xpReward} XP Reward Available</span>
            </div>
          </div>
        </aside>

        {/* MIDDLE SECTION: Visual Circuit Builder grid */}
        <div className={`min-w-0 flex-1 flex-col overflow-hidden bg-background p-2 sm:p-4 justify-between gap-3 sm:gap-4 ${activeMobileTab === 'canvas' ? 'flex' : 'hidden'} lg:flex`}>
          
          {/* Visual canvas grid */}
          <div className="flex-1 min-h-[300px] overflow-hidden">
            <CircuitBuilder
              circuit={circuit}
              onChange={setCircuit}
              selectedPaletteGate={selectedPaletteGate}
              setSelectedPaletteGate={setSelectedPaletteGate}
            />
          </div>

          {/* Inline Evaluation logs banners */}
          {evaluation && (
            <div className={`p-4 rounded-large border shrink-0 flex items-start gap-3 shadow-xs ${
              evaluation.isCorrect
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-success-color/30 text-success-color'
                : 'bg-red-50 dark:bg-red-950/20 border-error-color/30 text-error-color'
            }`}>
              {evaluation.isCorrect ? (
                <CheckCircle size={20} className="shrink-0 mt-0.5" />
              ) : (
                <XCircle size={20} className="shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <span className="font-bold text-body-small block">
                  {evaluation.isCorrect ? 'Success Confirmation!' : 'Diagnostic Review Required'}
                </span>
                <p className="text-caption text-text-secondary leading-relaxed">
                  {evaluation.feedback}
                </p>
                {evaluation.misconceptionDetected && (
                  <span className="text-[10px] bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300 px-2 py-0.5 rounded-pill font-bold tracking-wide uppercase mt-1 inline-block">
                    Diagnostic: {evaluation.misconceptionDetected}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Palette Selector tools (Mobile responsive drawer fallback) */}
          <div className="bg-surface border border-border-color p-2 sm:p-3 rounded-large shrink-0 flex min-w-0 items-center gap-2">
            <span className="text-[10px] font-bold text-text-secondary tracking-wider uppercase hidden sm:inline">Select Gate:</span>
            <div className="scrollbar-hidden flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1">
              {['H', 'CNOT', 'MEASURE', 'X'].map((gate) => (
                <button
                  key={gate}
                  onClick={() => setSelectedPaletteGate(selectedPaletteGate === gate ? null : gate)}
                  className={`min-w-11 shrink-0 px-3 py-1.5 rounded-medium border font-mono font-bold text-body-small transition-all ${
                    selectedPaletteGate === gate
                      ? 'border-primary-color bg-primary-color/10 text-primary-color shadow-xs'
                      : 'border-border-color bg-background text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {gate === 'MEASURE' ? '🎛️ Measure' : gate}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => {
                if (circuit) {
                  // Reset back to starting buggy circuit
                  setCircuit(JSON.parse(JSON.stringify(challenge.startingCircuit)));
                  setEvaluation(null);
                }
              }}
              className="shrink-0 py-1.5 px-3 border border-border-color rounded-medium text-caption font-semibold bg-background hover:bg-surface-hover transition-colors text-text-secondary flex items-center gap-1"
              title="Reset circuit"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: AI Tutor Sidebar synced to challenge context */}
        <aside className={`min-w-0 w-full lg:w-80 border-l border-border-color bg-surface shrink-0 overflow-y-auto ${activeMobileTab === 'tutor' ? 'flex' : 'hidden'} lg:flex`}>
          <AiTutor contextType="challenge" contextId={challenge.id} />
        </aside>

      </div>

      {/* Success Modal Popups */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
          {/* Backdrop */}
          <button type="button" tabIndex={-1} aria-label="Close completion dialog" className="fixed inset-0 min-h-0 w-full cursor-default bg-slate-950/50 backdrop-blur-xs" onClick={() => setShowSuccessModal(false)} />
          
          {/* Modal Container */}
          <div role="dialog" aria-modal="true" aria-labelledby="challenge-complete-title" className="relative max-h-[90dvh] overflow-y-auto bg-surface border border-border-color rounded-large p-5 sm:p-6 md:p-8 max-w-md w-full shadow-lg text-center space-y-6 animate-scale-in">
            <div className="h-16 w-16 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 rounded-pill flex items-center justify-center mx-auto">
              <Trophy size={32} />
            </div>

            <div className="space-y-2">
              <h2 id="challenge-complete-title" className="text-2xl font-bold tracking-tight text-text-primary">Challenge Completed!</h2>
              <p className="text-body-small text-text-secondary">
                Outstanding job! You resolved the entanglement glitch and successfully simulated the Phi+ Bell State.
              </p>
            </div>

            <div className="p-4 bg-background border border-border-color/50 rounded-medium flex items-center justify-center gap-2">
              <Star className="text-warning-color h-5 w-5" fill="currentColor" />
              <span className="font-bold text-body-large text-warning-color">+{challenge.xpReward} XP Gained</span>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:gap-4">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 py-2 border border-border-color rounded-medium text-body-small font-semibold hover:bg-surface-hover transition-colors"
              >
                Close View
              </button>
              <Link
                href="/app/challenges"
                className="flex-1 py-2 bg-primary-color hover:bg-primary-hover text-white text-body-small font-bold rounded-medium transition-colors flex items-center justify-center"
              >
                Back to Challenges
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
