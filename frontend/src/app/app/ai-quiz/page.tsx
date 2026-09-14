'use client';

import { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  CircleAlert,
  Lightbulb,
  LockKeyhole,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  XCircle,
} from 'lucide-react';

import {
  generateAiQuiz,
  type AiQuizQuestion,
  type GeneratedAiQuiz,
} from '@/lib/api/ai-quiz-client';

import { mockLessons } from '@/lib/api/mock-client';

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

function MathText({
  children,
  className = '',
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children: markdownChildren }) => (
            <>{markdownChildren}</>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

interface QuizResult {
  questionId: string;
  selectedOptionIndex: number;
  correctOptionIndex: number;
  correct: boolean;
  concept: string;
  explanation: string;
}

export default function AiQuizPage() {
  const searchParams = useSearchParams();

  const lessonId = searchParams.get('lessonId');
  const moduleId = searchParams.get('moduleId');

  const selectedLesson = lessonId
    ? mockLessons[lessonId]
    : undefined;

  const moduleLessons = useMemo(
    () =>
      moduleId
        ? Object.values(mockLessons).filter(
            (lesson) => lesson.moduleId === moduleId,
          )
        : [],
    [moduleId],
  );

  const moduleTitle =
    moduleLessons.length > 0
      ? `Module Assessment: ${moduleLessons
          .map((lesson) => lesson.title)
          .join(' + ')}`
      : '';

  const moduleContext = useMemo(
    () =>
      moduleLessons
        .map(
          (lesson) =>
            `LESSON: ${lesson.title}\n` +
            `DESCRIPTION: ${lesson.description}\n` +
            `CONTENT:\n${lesson.contentMarkdown}`,
        )
        .join('\n\n---\n\n')
        .slice(0, 19500),
    [moduleLessons],
  );

  const [topic, setTopic] = useState('');
  const [quiz, setQuiz] = useState<GeneratedAiQuiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [results, setResults] = useState<QuizResult[]>([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const reviewSectionRef =
    useRef<HTMLDivElement | null>(null);

  const isLessonQuiz = Boolean(lessonId);
  const isModuleQuiz = !isLessonQuiz && Boolean(moduleId);

  async function handleGenerateQuiz() {
    if (isLessonQuiz && !selectedLesson) {
      setError('This lesson could not be found.');
      return;
    }

    if (isModuleQuiz && moduleLessons.length === 0) {
      setError(
        'This module does not have enough lesson content for an AI quiz yet.',
      );
      return;
    }

    if (!isLessonQuiz && !isModuleQuiz && !topic.trim()) {
      setError('Please enter a topic.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const lessonContext = selectedLesson
        ? `LESSON: ${selectedLesson.title}\n` +
          `DESCRIPTION: ${selectedLesson.description}\n` +
          `CONTENT:\n${selectedLesson.contentMarkdown}`
        : undefined;

      const generatedQuiz = await generateAiQuiz({
        topic: isLessonQuiz
          ? selectedLesson!.title
          : isModuleQuiz
            ? moduleTitle
            : topic.trim(),

        lessonId: isLessonQuiz
          ? selectedLesson!.id
          : undefined,

        lessonTitle: isLessonQuiz
          ? selectedLesson!.title
          : undefined,

        moduleId: isModuleQuiz
          ? moduleId ?? undefined
          : undefined,

        moduleTitle: isModuleQuiz
          ? moduleTitle
          : undefined,

        content: isLessonQuiz
          ? lessonContext?.slice(0, 19500)
          : isModuleQuiz
            ? moduleContext
            : undefined,

        questionCount: 5,
      });

      setQuiz(generatedQuiz);
      setAnswers({});
      setResults([]);
      setSubmitted(false);
      setScore(null);
      setCurrentQuestion(0);
      setError('');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to generate the quiz.',
      );
    } finally {
      setLoading(false);
    }
  }

  function handleAnswer(
    questionId: string,
    optionIndex: number,
  ) {
    if (submitted) return;

    setAnswers((current) => ({
      ...current,
      [questionId]: optionIndex,
    }));
  }

  function goToPreviousQuestion() {
    setCurrentQuestion((current) =>
      Math.max(0, current - 1),
    );
  }

  function goToNextQuestion() {
    if (!quiz) return;

    setCurrentQuestion((current) =>
      Math.min(quiz.questions.length - 1, current + 1),
    );
  }

  async function handleSubmitQuiz() {
    if (!quiz) return;

    if (Object.keys(answers).length !== quiz.questions.length) {
      setError(
        'Please answer all questions before submitting.',
      );
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(
        '/api/v1/ai-quizzes/' +
          quiz.quizId +
          '/submit',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            answers,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? 'Unable to submit quiz.',
        );
      }

      setScore(data.scorePercent);

      setResults(
        data.results.map(
          (result: QuizResult) => ({
            questionId: result.questionId,
            selectedOptionIndex:
              result.selectedOptionIndex,
            correctOptionIndex:
              result.correctOptionIndex,
            correct: result.correct,
            concept: result.concept,
            explanation: result.explanation,
          }),
        ),
      );

      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to submit the quiz.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  function reviewAnswers() {
    reviewSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  function getResultForQuestion(questionId: string) {
    return results.find(
      (result) => result.questionId === questionId,
    );
  }

  function resetQuiz() {
    setQuiz(null);
    setAnswers({});
    setResults([]);
    setSubmitted(false);
    setScore(null);
    setError('');
    setCurrentQuestion(0);
  }

  const currentQuizQuestion =
    quiz?.questions[currentQuestion];

  const answeredCount = quiz
    ? Object.keys(answers).length
    : 0;

  const progressPercent = quiz
    ? ((currentQuestion + 1) / quiz.questions.length) * 100
    : 0;

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-violet-400">
              <Sparkles className="h-4 w-4" />
              Adaptive Learning
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              AI Quiz
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Test your understanding with AI-generated
              questions based on what you just learned.
              Every assessment adapts to your knowledge level.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-violet-500/30 bg-violet-500/10 px-5 py-4 shadow-[0_0_30px_rgba(139,92,246,0.12)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/20">
              <BrainCircuit className="h-6 w-6 text-violet-300" />
            </div>

            <div>
              <p className="text-sm font-semibold text-white">
                Powered by AI
              </p>

              <p className="text-xs text-slate-400">
                Personalized for your learning
              </p>
            </div>
          </div>
        </div>

        {/* GENERATION SCREEN */}
        {!quiz && (
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur-xl">

            <div className="border-b border-white/10 bg-gradient-to-r from-violet-500/10 via-transparent to-blue-500/10 p-6 sm:p-8">

              <div className="flex flex-wrap items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15">
                  <Target className="h-6 w-6 text-violet-300" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
                    {lessonId
                      ? 'Lesson Assessment'
                      : moduleId
                        ? 'Module Assessment'
                        : 'AI Quiz Arena'}
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-white">
                    {lessonId
                      ? selectedLesson?.title ||
                        'Completed Lesson'
                      : moduleId
                        ? moduleTitle
                        : 'Create your adaptive quiz'}
                  </h2>
                </div>
              </div>

              {lessonId && (
                <p className="mt-6 max-w-3xl text-sm leading-6 text-slate-400">
                  You completed this lesson. Your AI
                  assessment contains 5 fresh questions based
                  on what you just learned. The difficulty
                  adapts to your current knowledge and
                  previous performance.
                </p>
              )}

              {moduleId && (
                <p className="mt-6 max-w-3xl text-sm leading-6 text-slate-400">
                  Test your understanding across the lessons
                  completed in this module. Questions are
                  generated dynamically and adapted to your
                  current learning level.
                </p>
              )}
            </div>

            <div className="p-6 sm:p-8">

              {lessonId ? (
                <div className="grid gap-4 sm:grid-cols-3">

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Assessment
                    </p>
                    <p className="mt-2 text-lg font-bold text-white">
                      5 Questions
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Difficulty
                    </p>
                    <p className="mt-2 text-lg font-bold text-violet-300">
                      Adaptive
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                      Questions
                    </p>
                    <p className="mt-2 text-lg font-bold text-white">
                      Fresh Every Time
                    </p>
                  </div>

                </div>
              ) : moduleId ? (
                <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5">
                  <div className="flex gap-3">
                    <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-violet-300" />

                    <div>
                      <p className="font-semibold text-white">
                        Adaptive module assessment
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        The AI will use the lessons in this
                        module to create a fresh set of
                        questions matched to your current
                        learning level.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="quiz-topic"
                    className="mb-3 block text-sm font-semibold text-slate-200"
                  >
                    What do you want to practice?
                  </label>

                  <input
                    id="quiz-topic"
                    value={topic}
                    onChange={(event) =>
                      setTopic(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        handleGenerateQuiz();
                      }
                    }}
                    placeholder="Example: Quantum Superposition"
                    maxLength={200}
                    className="w-full rounded-2xl border border-white/10 bg-black/25 px-5 py-4 text-white placeholder:text-slate-600 outline-none transition focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10"
                  />
                </div>
              )}

              {error && (
                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                  <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />

                  <p className="text-sm text-red-300">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleGenerateQuiz}
                disabled={loading}
                className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Generating your quiz...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    {lessonId
                      ? 'Start 5-Question AI Assessment'
                      : moduleId
                        ? 'Start Module AI Quiz'
                        : 'Generate AI Quiz'}
                  </>
                )}
              </button>
            </div>
          </section>
        )}

        {/* QUIZ */}
        {quiz && !submitted && currentQuizQuestion && (
          <section>

            {/* QUIZ TOP BAR */}
            <div className="mb-5 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur-xl">

              <div className="p-5 sm:p-6">

                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15">
                      <Target className="h-5 w-5 text-violet-300" />
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                        {lessonId
                          ? 'Lesson Assessment'
                          : moduleId
                            ? 'Module Assessment'
                            : 'AI Quiz Arena'}
                      </p>

                      <h2 className="mt-1 max-w-xl truncate text-base font-bold text-white sm:text-lg">
                        {lessonId
                          ? selectedLesson?.title
                          : moduleId
                            ? moduleTitle
                            : topic}
                      </h2>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">

                    <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold capitalize text-violet-300">
                      {quiz.learnerLevel}
                    </span>

                    <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300">
                      Difficulty {quiz.difficulty}/5
                    </span>

                  </div>
                </div>

                <div className="mt-6">

                  <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400">
                      Question {currentQuestion + 1} of{' '}
                      {quiz.questions.length}
                    </span>

                    <span className="text-violet-300">
                      {answeredCount}/{quiz.questions.length} answered
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-500"
                      style={{
                        width: `${progressPercent}%`,
                      }}
                    />
                  </div>

                </div>
              </div>
            </div>

            {/* QUESTION CARD */}
            <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.07] shadow-2xl backdrop-blur-xl">

              <div className="border-b border-white/10 bg-gradient-to-br from-violet-500/10 via-transparent to-blue-500/5 p-6 sm:p-8">

                <div className="flex gap-5">

                  <div className="hidden h-10 w-1 shrink-0 rounded-full bg-gradient-to-b from-violet-500 to-blue-500 sm:block" />

                  <div className="flex-1">

                    <p className="text-sm font-semibold text-violet-300">
                      Question {currentQuestion + 1}
                    </p>

                    <MathText
                      className="mt-3 text-xl font-bold leading-8 text-white sm:text-2xl sm:leading-9"
                    >
                      {currentQuizQuestion.questionText}
                    </MathText>

                    <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3.5 py-2 text-xs font-medium text-slate-300">
                      <Lightbulb className="h-4 w-4 text-amber-300" />
                      Concept: {currentQuizQuestion.concept}
                    </div>

                  </div>

                </div>
              </div>

              {/* ANSWERS */}
              <div className="space-y-3 p-5 sm:p-8">

                {currentQuizQuestion.options.map(
                  (option, optionIndex) => {

                    const selected =
                      answers[currentQuizQuestion.id] ===
                      optionIndex;

                    const letter =
                      String.fromCharCode(
                        65 + optionIndex,
                      );

                    return (
                      <button
                        key={optionIndex}
                        type="button"
                        onClick={() =>
                          handleAnswer(
                            currentQuizQuestion.id,
                            optionIndex,
                          )
                        }
                        className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 sm:p-5 ${
                          selected
                            ? 'border-violet-400/70 bg-violet-500/15 shadow-[0_0_25px_rgba(139,92,246,0.14)]'
                            : 'border-white/10 bg-black/15 hover:border-violet-400/40 hover:bg-white/[0.06]'
                        }`}
                      >

                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
                            selected
                              ? 'bg-violet-500 text-white shadow-lg shadow-violet-900/40'
                              : 'bg-white/10 text-slate-300 group-hover:bg-violet-500/20 group-hover:text-violet-200'
                          }`}
                        >
                          {letter}
                        </span>

                        <MathText
                          className={`text-sm font-medium leading-6 sm:text-base ${
                            selected
                              ? 'text-white'
                              : 'text-slate-300'
                          }`}
                        >
                          {option}
                        </MathText>

                        {selected && (
                          <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-violet-300" />
                        )}

                      </button>
                    );
                  },
                )}

              </div>

              {/* NAVIGATION */}
              <div className="border-t border-white/10 px-5 py-5 sm:px-8">

                {error && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                    <CircleAlert className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between gap-3">

                  <button
                    type="button"
                    onClick={goToPreviousQuestion}
                    disabled={currentQuestion === 0}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      Previous
                    </span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {quiz.questions.map(
                      (question, index) => (
                        <button
                          key={question.id}
                          type="button"
                          onClick={() =>
                            setCurrentQuestion(index)
                          }
                          className={`h-2.5 rounded-full transition-all ${
                            index === currentQuestion
                              ? 'w-7 bg-violet-500'
                              : answers[question.id] !==
                                  undefined
                                ? 'w-2.5 bg-violet-300/70'
                                : 'w-2.5 bg-white/15'
                          }`}
                          aria-label={`Go to question ${index + 1}`}
                        />
                      ),
                    )}
                  </div>

                  {currentQuestion <
                  quiz.questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={goToNextQuestion}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:from-violet-500 hover:to-indigo-500"
                    >
                      <span className="hidden sm:inline">
                        Next Question
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitQuiz}
                      disabled={submitting}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Checking...
                        </>
                      ) : (
                        <>
                          <Trophy className="h-4 w-4" />
                          Finish Quiz
                        </>
                      )}
                    </button>
                  )}

                </div>

                <p className="mt-4 text-center text-xs text-slate-600">
                  {currentQuestion + 1} of{' '}
                  {quiz.questions.length}
                </p>

              </div>
            </article>
          </section>
        )}

        {/* RESULTS */}
        {quiz && submitted && (
          <section>

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.07] shadow-2xl backdrop-blur-xl">

              {/* SCORE */}
              <div className="border-b border-white/10 bg-gradient-to-br from-violet-500/15 via-transparent to-blue-500/10 p-8 text-center sm:p-12">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/15">
                  <Trophy className="h-8 w-8 text-violet-300" />
                </div>

                <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">
                  Quiz Complete
                </p>

                <h2 className="mt-3 text-6xl font-black text-white">
                  {score}%
                </h2>

                <p className="mt-3 text-slate-400">
                  {results.filter(
                    (result) => result.correct,
                  ).length}{' '}
                  of {quiz.questions.length} questions correct
                </p>

                <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-white/10 bg-black/20 p-4">

                  <p className="text-sm leading-6 text-slate-300">
                    {score !== null && score >= 70
                      ? 'Excellent work! Your performance shows strong understanding. Your next AI assessment can increase the challenge.'
                      : 'Keep practicing. Your next AI assessment will use your updated performance to focus on areas that need more attention.'}
                  </p>

                </div>
              </div>

              {/* PERFORMANCE */}
              <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">

                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Current Level
                  </p>
                  <p className="mt-2 text-xl font-bold capitalize text-violet-300">
                    {quiz.learnerLevel}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Difficulty
                  </p>
                  <p className="mt-2 text-xl font-bold text-blue-300">
                    Level {quiz.difficulty}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Questions
                  </p>
                  <p className="mt-2 text-xl font-bold text-white">
                    {quiz.questions.length}
                  </p>
                </div>

              </div>

              {/* QUESTION REVIEW */}
              <div
                ref={reviewSectionRef}
                className="scroll-mt-6 border-t border-white/10 p-6 sm:p-8"
              >

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white">
                    Assessment Review
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Review your answers and AI explanations.
                  </p>
                </div>

                <div className="space-y-4">

                  {quiz.questions.map(
                    (
                      question: AiQuizQuestion,
                      index,
                    ) => {

                      const result =
                        getResultForQuestion(
                          question.id,
                        );

                      if (!result) return null;

                      return (
                        <article
                          key={question.id}
                          className="rounded-2xl border border-white/10 bg-black/20 p-5"
                        >

                          <div className="flex items-start gap-4">

                            <div
                              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                                result.correct
                                  ? 'bg-emerald-500/15 text-emerald-300'
                                  : 'bg-red-500/15 text-red-300'
                              }`}
                            >
                              {result.correct ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : (
                                <XCircle className="h-5 w-5" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">

                              <p className="text-xs font-semibold uppercase tracking-wider text-violet-300">
                                Question {index + 1}
                              </p>

                              <MathText className="mt-2 text-base font-semibold leading-6 text-white">
                                {question.questionText}
                              </MathText>

                              <p className="mt-3 text-sm text-slate-400">
                                Your answer:{' '}
                                <span className="text-slate-200">
                                  {result.selectedOptionIndex >=
                                  0
                                    ? `${String.fromCharCode(
                                        65 +
                                          result.selectedOptionIndex,
                                      )}. ${
                                        question.options[
                                          result.selectedOptionIndex
                                        ]
                                      }`
                                    : 'No answer'}
                                </span>
                              </p>

                              {!result.correct && (
                                <p className="mt-2 text-sm text-slate-400">
                                  Correct answer:{' '}
                                  <span className="font-medium text-emerald-300">
                                    {String.fromCharCode(
                                      65 +
                                        result.correctOptionIndex,
                                    )}
                                    .{' '}
                                    {
                                      question.options[
                                        result.correctOptionIndex
                                      ]
                                    }
                                  </span>
                                </p>
                              )}

                              <div className="mt-4 rounded-xl border border-violet-500/15 bg-violet-500/5 p-4">

                                <div className="flex gap-2">
                                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />

                                  <MathText className="text-sm leading-6 text-slate-300">
                                    {result.explanation}
                                  </MathText>
                                </div>

                              </div>

                            </div>
                          </div>
                        </article>
                      );
                    },
                  )}

                </div>

                {/* WEAK CONCEPTS */}
                {(() => {
                  const weakConcepts =
                    Array.from(
                      new Set(
                        results
                          .filter(
                            (result) => !result.correct,
                          )
                          .map(
                            (result) =>
                              result.concept,
                          ),
                      ),
                    );

                  return weakConcepts.length > 0 ? (
                    <div className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5">

                      <div className="flex gap-3">
                        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />

                        <div>
                          <p className="font-semibold text-white">
                            Concepts to review
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {weakConcepts.map(
                              (concept) => (
                                <span
                                  key={concept}
                                  className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-200"
                                >
                                  {concept}
                                </span>
                              ),
                            )}
                          </div>

                          <p className="mt-3 text-sm leading-6 text-slate-400">
                            Your next AI quiz will use
                            your updated performance to
                            adjust difficulty and focus
                            on these areas.
                          </p>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5">

                      <div className="flex gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />

                        <div>
                          <p className="font-semibold text-white">
                            Strong understanding
                          </p>

                          <p className="mt-1 text-sm leading-6 text-slate-400">
                            You answered every question
                            correctly. The next assessment
                            can challenge you at a higher
                            level.
                          </p>
                        </div>
                      </div>

                    </div>
                  );
                })()}

                {/* ACTIONS */}
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                  <button
                    type="button"
                    onClick={handleGenerateQuiz}
                    disabled={loading}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-4 font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
                  >
                    <RotateCcw className="h-5 w-5" />
                    {loading
                      ? 'Generating new questions...'
                      : 'Review & Retake'}
                  </button>

                  {!lessonId && (
                    <button
                      type="button"
                      onClick={resetQuiz}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 font-semibold text-slate-300 transition hover:bg-white/[0.08]"
                    >
                      <ArrowLeft className="h-5 w-5" />
                      Choose Another Topic
                    </button>
                  )}

                </div>

              </div>
            </div>
          </section>
        )}

        {/* FOOTER NOTE */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-600">
          <LockKeyhole className="h-3.5 w-3.5" />
          Correct answers are securely evaluated by the learning system.
        </div>

      </div>
    </main>
  );
}






