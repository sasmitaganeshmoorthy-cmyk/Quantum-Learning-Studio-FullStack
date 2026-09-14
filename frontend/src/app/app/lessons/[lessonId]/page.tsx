'use client';

import { use, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Play,
  CheckCircle,
  Menu,
  ChevronLeft,
} from 'lucide-react';
import { mockLessons } from '@/lib/api/mock-client';
import { awardGamificationActivity } from '@/lib/api/gamification-client';
import { BlochSphere } from '@/components/quantum/bloch-sphere';
import { InteractivePageHero } from '@/components/visual/interactive-page-hero';

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const router = useRouter();
  const { lessonId } = use(params);

  const lesson = mockLessons[lessonId];
  const currentModuleId = lesson?.moduleId;

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Record<string, boolean>>({});
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);
  const [isModuleComplete, setIsModuleComplete] = useState(false);
  const [progressError, setProgressError] = useState('');
  const [gamificationError, setGamificationError] = useState('');
  // Mobile syllabus drawer state
  const [outlineOpen, setOutlineOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!outlineOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    overlayRef.current?.focus();

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOutlineOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousOverflow;
      lastTriggerRef.current?.focus();
    };
  }, [outlineOpen]);

  if (!lesson) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold">Lesson not found</h1>
        <p className="text-text-secondary">We could not locate this lesson. Check your path.</p>
        <Link href="/app/catalog" className="inline-flex py-2 px-4 bg-primary-color text-white rounded-medium">
          Back to Catalog
        </Link>
      </div>
    );
  }

  // Mock outline lessons list
  const outlineLessons = [
    { id: 'lesson-101-1', title: 'Qubits & The Bloch Sphere', isCompleted: true },
    { id: 'lesson-102-1', title: 'Building Bell States', isCompleted: false }
  ];

  const moduleLessons: Record<string, string[]> = {
    'mod-101-1': [
      'lesson-101-1',
      'lesson-101-2',
      'lesson-101-3',
    ],
    'mod-101-2': [
      'lesson-101-4',
      'lesson-101-5',
    ],
    'mod-102-1': [
      'lesson-102-1',
      'lesson-102-2',
      'lesson-102-3',
    ],
  };
  const handleAnswerSelect = (qId: string, idx: number) => {
    if (submittedQuestions[qId]) return; // locked after submit
    setSelectedAnswers((prev) => ({ ...prev, [qId]: idx }));
  };

  const handleQuizSubmit = (qId: string) => {
    setSubmittedQuestions((prev) => ({ ...prev, [qId]: true }));
  };
  const allQuizSubmitted =
    lesson.quizQuestions?.length
      ? lesson.quizQuestions.every(
        (question) => submittedQuestions[question.id]
      )
      : false;

  const saveLessonProgress = async () => {
    if (progressSaving || progressSaved || !lesson.quizQuestions) {
      return;
    }

    setProgressSaving(true);
    setProgressError('');

    try {
      const correctAnswers = lesson.quizQuestions.filter(
        (question) =>
          selectedAnswers[question.id] === question.correctOptionIndex
      ).length;

      const masteryScore = Math.round(
        (correctAnswers / lesson.quizQuestions.length) * 100
      );

      const currentResponse = await fetch('/api/v1/progress', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!currentResponse.ok) {
        throw new Error('Unable to load your existing progress.');
      }

      const currentData = await currentResponse.json();

      const currentProgress = currentData.progress as
        | {
          completedLessons?: string[];
          completedModules?: string[];
          mastery?: Record<string, number>;
          suggestedNext?: string;
        }
        | null;

      const completedLessons = Array.from(
        new Set([
          ...(currentProgress?.completedLessons ?? []),
          lessonId,
        ])
      );



      const lessonsInCurrentModule = currentModuleId
        ? moduleLessons[currentModuleId] ?? []
        : [];

      const moduleComplete =
        lessonsInCurrentModule.length > 0 &&
        lessonsInCurrentModule.every((id) => completedLessons.includes(id));

      setIsModuleComplete(moduleComplete);

      const completedModules = moduleComplete
        ? Array.from(
            new Set([
              ...(currentProgress?.completedModules ?? []),
              currentModuleId,
            ])
          )
        : currentProgress?.completedModules ?? [];

      const suggestedNext =
        lessonId === 'lesson-101-1'
          ? 'Continue with Building Bell States.'
          : 'Practice the completed lesson in the Quantum Lab.';

      const saveResponse = await fetch('/api/v1/progress', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    completedLessons,
    completedModules,
    mastery: {
      ...(currentProgress?.mastery ?? {}),
      [lessonId]: masteryScore,
    },
    suggestedNext,
  }),
});

const savedData = await saveResponse.json();

if (!saveResponse.ok) {
  throw new Error(
    savedData.error ?? 'Unable to save lesson progress.'
  );
}

try {
  await awardGamificationActivity({
    activityType: 'lesson',
    activityId: lessonId,
    eventId: `lesson-completion-${lessonId}`,
    result: {
      scorePercent: masteryScore,
      passed: masteryScore >= 50,
    },
  });
} catch (error) {
  console.error(
    'Lesson gamification award failed:',
    error
  );
}

setProgressSaved(true);
    } catch (error) {
      console.error('Lesson progress save failed:', error);

      setProgressError(
        error instanceof Error
          ? error.message
          : 'Unable to save lesson progress.'
      );
    } finally {
      setProgressSaving(false);
    }
  };
  const handlePrevLesson = () => {
    if (lessonId === 'lesson-102-1') {
      router.push('/app/lessons/lesson-101-1');
    }
  };

  const handleNextLesson = () => {
    if (lessonId === 'lesson-101-1') {
      router.push('/app/lessons/lesson-102-1');
      return;
    }

    if (lessonId === 'lesson-102-1') {
      router.push('/app/lab');
    }
  };

  return (
    <div className="h-[calc(100dvh-8.5rem)] min-h-0 w-full min-w-0 flex overflow-hidden font-sans relative md:h-dvh">

      {/* 1. Left Outline Sidebar (Desktop Only) */}
      <aside className="hidden xl:flex w-64 border-r border-border-color bg-surface flex-col shrink-0">
        <div className="p-4 border-b border-border-color bg-surface-hover/20">
          <Link href="/app/catalog" className="flex items-center gap-1 text-caption text-text-secondary hover:text-text-primary font-semibold">
            <ChevronLeft size={14} /> Back to Syllabus
          </Link>
          <span className="font-bold text-body-small block mt-2 text-text-primary">Course Lessons</span>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {outlineLessons.map((item) => (
            <Link
              key={item.id}
              href={`/app/lessons/${item.id}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-medium font-semibold text-body-small transition-colors ${item.id === lessonId
                ? 'bg-primary-color/10 text-primary-color'
                : 'text-text-secondary hover:bg-surface-hover'
                }`}
            >
              {item.isCompleted ? (
                <CheckCircle className="text-success-color shrink-0" size={16} />
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-border-color shrink-0" />
              )}
              <span className="truncate">{item.title}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* 2. Middle Column: Lesson Content viewport */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-background">

        {/* Sticky Mobile actions sub-bar */}
        <div className="xl:hidden flex items-center justify-between px-4 py-2 border-b border-border-color bg-surface z-10 shrink-0">
          <div className="xl:hidden">
            <button
              onClick={(event) => {
                lastTriggerRef.current = event.currentTarget;
                setOutlineOpen(true);
              }}
              className="flex items-center gap-1 text-body-small font-semibold text-text-secondary hover:text-text-primary"
              aria-haspopup="dialog"
              aria-expanded={outlineOpen}
            >
              <Menu size={16} /> Syllabus
            </button>
          </div>

        </div>

        {/* Scrollable Main text panel */}
        <div className="flex-1 min-h-0 w-full overflow-y-auto overscroll-contain px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-3xl mx-auto">
          <InteractivePageHero
            eyebrow="Continue learning"
            title={lesson.title}
            description={lesson.description}
            imageSrc={lessonId === 'lesson-102-1' ? '/images/quantum/entanglement-module.png' : '/images/quantum/learning-pathway.png'}
            imageAlt={lessonId === 'lesson-102-1' ? 'Two entangled qubit cores joined by a luminous quantum link' : 'A luminous quantum curriculum pathway'}
            accent={lessonId === 'lesson-102-1' ? 'violet' : 'cyan'}
            compact
            actions={lesson.circuitTemplate ? (
              <Link href="/app/lab" className="app-hero-primary"><Play size={15} fill="currentColor" /> Open lesson circuit</Link>
            ) : undefined}
            metrics={
              <>
                <div className="app-hero-metric"><strong>+{lesson.xpReward} XP</strong><span>Completion reward</span></div>
                <div className="app-hero-metric"><strong>{lesson.isCompleted ? 'Complete' : 'In progress'}</strong><span>Lesson status</span></div>
              </>
            }
          />

          {/* Main Theory Text */}
          <article className="prose dark:prose-invert max-w-none text-body text-text-secondary leading-relaxed space-y-4">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                h1: ({ children }) => (
                  <h1 className="mb-4 mt-6 text-3xl font-extrabold tracking-tight text-text-primary">
                    {children}
                  </h1>
                ),

                h2: ({ children }) => (
                  <h2 className="mb-3 mt-8 text-2xl font-bold text-text-primary">
                    {children}
                  </h2>
                ),

                p: ({ children }) => (
                  <p className="my-4 leading-7 text-text-secondary">
                    {children}
                  </p>
                ),

                strong: ({ children }) => (
                  <strong className="font-bold text-text-primary">
                    {children}
                  </strong>
                ),

                ol: ({ children }) => (
                  <ol className="my-4 list-decimal space-y-3 pl-6">
                    {children}
                  </ol>
                ),

                ul: ({ children }) => (
                  <ul className="my-4 list-disc space-y-2 pl-6">
                    {children}
                  </ul>
                ),

                li: ({ children }) => (
                  <li className="pl-1 leading-7 text-text-secondary">
                    {children}
                  </li>
                ),
              }}
            >
              {lesson.contentMarkdown}
            </ReactMarkdown>
          </article>
          {/* Bloch Sphere Demo display if initial state parameter exists */}
          {lesson.blochSphereInitialState && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center p-4 border border-border-color rounded-large bg-surface">
              <div className="space-y-3">
                <span className="text-caption font-bold text-text-secondary uppercase tracking-wider block">Interactive Demonstration</span>
                <h4 className="font-bold text-body-large text-text-primary">Qubit Spin Vector</h4>
                <p className="text-body-small text-text-secondary">
                  The initial state vector of this lesson is plotted below. Move the sliders to test custom rotations manually and inspect coordinates real-time.
                </p>
              </div>
              <BlochSphere
                theta={lesson.blochSphereInitialState.theta}
                phi={lesson.blochSphereInitialState.phi}
                showControls
              />
            </div>
          )}

          {/* Embedded circuit templates link */}
          {lesson.circuitTemplate && (
            <div className="p-5 rounded-large bg-primary-color/5 border border-primary-color/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-bold text-body-large text-text-primary flex items-center gap-1.5 justify-center sm:justify-start">
                  <Sparkles className="text-primary-color" size={18} /> Sandbox Lab Circuit
                </h4>
                <p className="text-body-small text-text-secondary">
                  Open this lesson&apos;s circuit template directly in the sandbox lab to manipulate gates.
                </p>
              </div>
              <Link
                href="/app/lab"
                className="px-4 py-2 bg-primary-color hover:bg-primary-hover text-white text-body-small font-bold rounded-medium transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
              >
                <Play size={14} fill="white" /> Try in Lab
              </Link>
            </div>
          )}

          {/* Knowledge Checks / Quiz Section */}
          {lesson.quizQuestions && lesson.quizQuestions.length > 0 && (
            <div className="space-y-6 pt-6 border-t border-border-color">
              <h3 className="text-xl font-bold tracking-tight">Concept Knowledge Check</h3>

              {lesson.quizQuestions.map((q) => {
                const selectedIdx = selectedAnswers[q.id];
                const isSubmitted = submittedQuestions[q.id];
                const isCorrect = selectedIdx === q.correctOptionIndex;

                return (
                  <div key={q.id} className="p-5 bg-surface border border-border-color rounded-large space-y-4 shadow-xs">
                    <h4 className="font-bold text-body-small text-text-primary">
                      {q.questionText}
                    </h4>

                    {/* Quiz choices */}
                    <div className="grid grid-cols-1 gap-2">
                      {q.options.map((opt, idx) => {
                        const isSelected = selectedIdx === idx;
                        let btnStyle = 'border-border-color bg-background';

                        if (isSubmitted) {
                          if (idx === q.correctOptionIndex) {
                            btnStyle = 'border-success-color bg-success-color/10 font-bold';
                          } else if (isSelected && !isCorrect) {
                            btnStyle = 'border-error-color bg-error-color/10';
                          }
                        } else if (isSelected) {
                          btnStyle = 'border-primary-color bg-primary-color/5 font-bold';
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleAnswerSelect(q.id, idx)}
                            disabled={isSubmitted}
                            className={`p-3 text-left text-body-small rounded-medium border transition-colors ${btnStyle}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {/* Submit Answer */}
                    {!isSubmitted && (
                      <button
                        onClick={() => handleQuizSubmit(q.id)}
                        disabled={selectedIdx === undefined}
                        className="py-2 px-5 bg-primary-color hover:bg-primary-hover text-white text-body-small font-bold rounded-medium transition-colors disabled:opacity-30"
                      >
                        Submit Answer
                      </button>
                    )}

                    {/* Feedback Output */}
                    {isSubmitted && (
                      <div className={`p-4 rounded-medium text-body-small space-y-2 border ${isCorrect
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-success-color/30 text-success-color'
                        : 'bg-red-50 dark:bg-red-950/20 border-error-color/30 text-error-color'
                        }`}>
                        <div className="font-bold">
                          {isCorrect ? 'Correct Answer!' : 'Incorrect. Try again.'}
                        </div>
                        <p className="text-text-secondary leading-relaxed">
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {allQuizSubmitted && (
            <div className="rounded-large border border-success-color/30 bg-success-color/10 p-5 space-y-3">
              <div>
                <h3 className="font-bold text-text-primary">
                  Lesson assessment completed
                </h3>

                <p className="text-body-small text-text-secondary">
                  Save your result to your personal learning profile.
                </p>
              </div>

              {progressError && (
                <p className="text-body-small text-error-color">
                  {progressError}
                </p>
              )}

              <button
                type="button"
                onClick={saveLessonProgress}
                disabled={progressSaving || progressSaved}
                className="rounded-medium bg-success-color px-5 py-2 text-body-small font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {progressSaving
                  ? 'Saving progress...'
                  : progressSaved
                    ? 'Progress saved'
                    : `Complete lesson and earn ${lesson.xpReward} XP`}
              </button>

              {progressSaved && (
                <div className="mt-4 rounded-large border border-primary-color/30 bg-primary-color/5 p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-text-primary">
                      AI learning assessment ready
                    </h3>
                    <p className="text-body-small text-text-secondary">
                      Test what you learned in this lesson with 5 fresh AI-generated questions adapted to your current knowledge level.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push(`/app/ai-quiz?lessonId=${encodeURIComponent(lessonId)}`)}
                    className="rounded-medium bg-primary-color px-5 py-2 text-body-small font-bold text-white hover:bg-primary-hover transition-colors"
                  >
                    Take 5-Question AI Assessment
                  </button>
                </div>
              )}
            </div>
          )}
          {/* Previous / Next Navigation actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3 pt-6 border-t border-border-color">
            <button
              onClick={handlePrevLesson}
              disabled={lessonId === 'lesson-101-1'}
              className="w-full sm:w-auto py-2 px-4 border border-border-color rounded-medium text-body-small font-semibold hover:bg-surface-hover transition-colors disabled:opacity-30"
            >
              Previous Lesson
            </button>
            <button
              type="button"
              onClick={handleNextLesson}
              className="w-full sm:w-auto py-2 px-4 bg-primary-color hover:bg-primary-hover text-white rounded-medium text-body-small font-bold transition-colors"
            >
              {lessonId === 'lesson-102-1'
                ? 'Practice in Quantum Lab'
                : 'Next Lesson'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Syllabus Drawer */}
      {outlineOpen && (
        <div className="xl:hidden fixed inset-0 z-40 flex" role="presentation">
          <button type="button" tabIndex={-1} aria-label="Close lesson outline" className="fixed inset-0 min-h-0 w-full cursor-default bg-slate-950/50 backdrop-blur-xs" onClick={() => setOutlineOpen(false)} />
          <div ref={overlayRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Lesson outline" className="relative w-[min(20rem,88vw)] bg-surface border-r border-border-color flex flex-col h-full p-4 shadow-2xl animate-slide-in">
            <div className="flex items-center justify-between pb-3 border-b border-border-color">
              <span className="font-bold text-body-small text-text-primary">Module Lessons</span>
              <button onClick={() => setOutlineOpen(false)} className="px-3 text-text-primary text-caption font-bold" aria-label="Close lesson outline">Close</button>
            </div>
            <nav className="flex-1 space-y-2 py-4">
              {outlineLessons.map((item) => (
                <Link
                  key={item.id}
                  href={`/app/lessons/${item.id}`}
                  className={`flex items-center gap-2 p-2 rounded-medium text-body-small font-semibold ${item.id === lessonId ? 'text-primary-color bg-primary-color/10' : 'text-text-secondary'
                    }`}
                  onClick={() => setOutlineOpen(false)}
                >
                  <span>{item.title}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}












