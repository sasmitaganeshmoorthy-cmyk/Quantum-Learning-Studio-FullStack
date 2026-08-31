'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Atom,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Brain,
  Code,
  User
} from 'lucide-react';

export default function Onboarding() {
  const router = useRouter(); const [checkingStatus, setCheckingStatus] = useState(true); const [saving, setSaving] = useState(false); const [errorMessage, setErrorMessage] = useState('');
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'student' | 'instructor' | 'professional' | ''>('');
  const [goal, setGoal] = useState<string>('');
  const [mathLevel, setMathLevel] = useState<string>('');
  const [codeLevel, setCodeLevel] = useState<string>('');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkOnboarding() {
      try {
        const response = await fetch('/api/v1/onboarding', {
          method: 'GET',
          cache: 'no-store',
        });

        if (response.status === 401) {
          router.replace('/auth/login');
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(`Unable to check onboarding status: ${response.status} ${data.error || JSON.stringify(data)}`);
        }

        if (cancelled) return;

        if (data.completed) {
          router.replace('/app/dashboard');
          return;
        }

        setCheckingStatus(false);
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setErrorMessage('Unable to load onboarding. Please try again.');
          setCheckingStatus(false);
        }
      }
    }

    void checkOnboarding();

    return () => {
      cancelled = true;
    };
  }, [router]);



  const diagnosticQuestions = [
    {
      id: 1,
      question: 'Which vector represents the standard |0⟩ state in quantum computing?',
      options: [
        '[0, 1]ᵀ',
        '[1, 0]ᵀ',
        '[1/√2, 1/√2]ᵀ',
        '[1, 1]ᵀ'
      ],
      correctIndex: 1
    },
    {
      id: 2,
      question: 'If a Hadamard (H) gate is applied to a state of |0⟩, what state is produced?',
      options: [
        '|1⟩',
        '|+⟩ = 1/√2(|0⟩ + |1⟩)',
        '|-⟩ = 1/√2(|0⟩ - |1⟩)',
        'It remains unchanged'
      ],
      correctIndex: 1
    }
  ];

  const handleQuizAnswer = (qIndex: number, optionIndex: number) => {
    setQuizAnswers(prev => ({ ...prev, [qIndex]: optionIndex }));
  };

  // Determine path recommendations
  const getRecommendation = () => {
    const score = Object.entries(quizAnswers).reduce((acc, [qId, ansIndex]) => {
      const questionObj = diagnosticQuestions.find(q => q.id === parseInt(qId));
      if (questionObj && questionObj.correctIndex === ansIndex) {
        return acc + 1;
      }
      return acc;
    }, 0);

    if (role === 'instructor') {
      return {
        level: 'Instructor Dashboard Mode',
        title: 'Quantum Educator Blueprint',
        description: 'Manage classrooms, assign challenges, and inspect misconception trends.',
        courseId: 'course-102',
        link: '/instructor/dashboard'
      };
    }

    if (mathLevel === 'beginner' || score === 0) {
      return {
        level: 'Beginner Foundations Path',
        title: 'Course 101: Quantum Foundations & Superposition',
        description: 'Focus on qubits, superposition states, and Bloch sphere visual manipulation.',
        courseId: 'course-101',
        link: '/app/dashboard'
      };
    } else {
      return {
        level: 'Intermediate Entanglement Path',
        title: 'Course 102: Quantum Entanglement & Multi-Qubit Systems',
        description: 'Jump straight into entangling operations, CNOT gates, and Bell states.',
        courseId: 'course-102',
        link: '/app/dashboard'
      };
    }
  };

  const recommendation = getRecommendation();

  const handleCompleteOnboarding = async () => {
    if (saving) return;

    setSaving(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/v1/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role,
          goal,
          mathLevel,
          codeLevel,
          quizAnswers,
          recommendedLevel: recommendation.level,
          recommendedCourseId: recommendation.courseId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'Unable to save onboarding');
      }

      router.replace(recommendation.link);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to complete onboarding'
      );
    } finally {
      setSaving(false);
    }
  };

  if (checkingStatus) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 mx-auto rounded-full border-4 border-primary-color/20 border-t-primary-color animate-spin" />

          <p className="text-text-secondary">
            Checking your learning profile...
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary transition-colors duration-standard flex flex-col font-sans">

      {/* Onboarding Header */}
      <header className="h-16 border-b border-border-color bg-surface flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Atom className="h-6 w-6 text-primary-color animate-pulse" />
          <span className="font-bold text-md text-primary-color">Quantum Learning Studio</span>
        </div>
        <div className="text-body-small font-semibold text-text-secondary">
          Step {step} of 5
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 max-w-xl mx-auto w-full">
        <div className="w-full bg-surface border border-border-color rounded-large p-6 md:p-8 shadow-md space-y-6">

          {/* Step indicator tracker */}
          <div className="flex justify-between items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-pill transition-all ${s === step
                  ? 'bg-primary-color'
                  : s < step
                    ? 'bg-primary-color/40'
                    : 'bg-border-color'
                  }`}
              />
            ))}
          </div>

          {/* STEP 1: Select Role */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2 text-center sm:text-left">
                <h1 className="text-2xl font-bold tracking-tight">Select your role</h1>
                <p className="text-body-small text-text-secondary">Choose the layout tailored to your goals.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => setRole('student')}
                  className={`flex items-start gap-4 p-4 rounded-large border text-left transition-all hover:bg-surface-hover ${role === 'student' ? 'border-primary-color bg-primary-color/5' : 'border-border-color'
                    }`}
                >
                  <div className="h-10 w-10 shrink-0 bg-primary-color/10 text-primary-color rounded-medium flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-body-large text-text-primary">I am a Student or Learner</h3>
                    <p className="text-body-small text-text-secondary">I want to study quantum concepts, construct circuits, and practice coding challenges.</p>
                  </div>
                </button>

                <button
                  onClick={() => setRole('instructor')}
                  className={`flex items-start gap-4 p-4 rounded-large border text-left transition-all hover:bg-surface-hover ${role === 'instructor' ? 'border-primary-color bg-primary-color/5' : 'border-border-color'
                    }`}
                >
                  <div className="h-10 w-10 shrink-0 bg-success-color/10 text-success-color rounded-medium flex items-center justify-center">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-body-large text-text-primary">I am an Instructor or Professor</h3>
                    <p className="text-body-small text-text-secondary">I want to manage classes, assign lessons, and monitor group misconceptions.</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Goal and Target Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2 text-center sm:text-left">
                <h1 className="text-2xl font-bold tracking-tight">What is your learning goal?</h1>
                <p className="text-body-small text-text-secondary">Help us customize your path recommendations.</p>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'fundamental', label: 'Understand the core physics (superposition, entanglement)' },
                  { id: 'python', label: 'Learn to write quantum algorithms using Python (Qiskit)' },
                  { id: 'simulate', label: 'Simulate physical systems and study noise behavior' }
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGoal(g.id)}
                    className={`w-full p-4 rounded-large border text-left text-body-small font-medium transition-all hover:bg-surface-hover ${goal === g.id ? 'border-primary-color bg-primary-color/5 font-bold' : 'border-border-color'
                      }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Survey Experience */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2 text-center sm:text-left">
                <h1 className="text-2xl font-bold tracking-tight">Tell us about your background</h1>
                <p className="text-body-small text-text-secondary">We adapt explanations to match your technical level.</p>
              </div>

              <div className="space-y-6">
                {/* Math background */}
                <div className="space-y-3">
                  <span className="text-caption font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Brain size={14} /> Linear Algebra & Math Experience
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {['beginner', 'advanced'].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setMathLevel(lvl)}
                        className={`p-3 rounded-medium border text-body-small font-semibold capitalize transition-all hover:bg-surface-hover ${mathLevel === lvl ? 'border-primary-color bg-primary-color/5' : 'border-border-color'
                          }`}
                      >
                        {lvl === 'beginner' ? 'Basic Vectors' : 'Complex Matrices'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Programming background */}
                <div className="space-y-3">
                  <span className="text-caption font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <Code size={14} /> Python Programming Experience
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {['beginner', 'advanced'].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setCodeLevel(lvl)}
                        className={`p-3 rounded-medium border text-body-small font-semibold capitalize transition-all hover:bg-surface-hover ${codeLevel === lvl ? 'border-primary-color bg-primary-color/5' : 'border-border-color'
                          }`}
                      >
                        {lvl === 'beginner' ? 'New to Coding' : 'Write Functions'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Diagnostic Quiz */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-2 text-center sm:text-left">
                <h1 className="text-2xl font-bold tracking-tight">Mini Diagnostic Assessment</h1>
                <p className="text-body-small text-text-secondary">Answer these quick questions (you can guess or skip).</p>
              </div>

              <div className="space-y-6">
                {diagnosticQuestions.map((q, idx) => (
                  <div key={q.id} className="space-y-3">
                    <span className="text-body-small font-bold">
                      {idx + 1}. {q.question}
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {q.options.map((opt, optIdx) => (
                        <button
                          key={optIdx}
                          onClick={() => handleQuizAnswer(q.id, optIdx)}
                          className={`p-3 text-left rounded-medium border text-body-small font-medium transition-all hover:bg-surface-hover ${quizAnswers[q.id] === optIdx
                            ? 'border-primary-color bg-primary-color/5 font-bold'
                            : 'border-border-color'
                            }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Final Recommendation path */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="space-y-3 text-center">
                <div className="h-14 w-14 bg-primary-color/10 text-primary-color rounded-pill flex items-center justify-center mx-auto mb-2">
                  <Sparkles size={28} className="animate-spin-slow" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Your Diagnostic Assessment Complete!</h1>
                <p className="text-body-small text-text-secondary">We calculated your customized syllabus route.</p>
              </div>

              {/* Recommended Route Badge */}
              <div className="p-5 rounded-large bg-background border border-border-color text-center space-y-4">
                <div className="space-y-1">
                  <span className="text-caption font-bold text-primary-color tracking-wide uppercase">{recommendation.level}</span>
                  <h3 className="text-lg font-bold text-text-primary">{recommendation.title}</h3>
                </div>
                <p className="text-body-small text-text-secondary">{recommendation.description}</p>
              </div>

              <div className="bg-surface-hover/50 p-4 rounded-medium border border-border-color/50 flex items-start gap-3">
                <Brain className="text-primary-color shrink-0 h-5 w-5 mt-0.5" />
                <p className="text-caption text-text-secondary">
                  You can change this path or view other modules in the catalogue at any time.
                </p>
              </div>
            </div>
          )}

          {/* Error Message Display */}
          {errorMessage && (
            <div className="rounded-medium border border-error-color/30 bg-error-color/10 p-3 text-body-small text-error-color">
              {errorMessage}
            </div>
          )}

          {/* Navigation Action Buttons */}
          <div className="flex justify-between gap-4 pt-4 border-t border-border-color">
            <button
              onClick={() => step > 1 && setStep(step - 1)}
              disabled={step === 1}
              className={`flex items-center gap-1.5 py-2 px-3 border border-border-color text-body-small font-semibold rounded-medium transition-colors hover:bg-surface-hover disabled:opacity-30`}
            >
              <ChevronLeft size={16} /> Back
            </button>

            {step < 5 ? (
              <button
                onClick={() => {
                  if (step === 1 && !role) setRole('student');
                  setStep(step + 1);
                }}
                className="flex items-center gap-1.5 py-2 px-5 bg-primary-color hover:bg-primary-hover text-white text-body-small font-bold rounded-medium transition-colors"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCompleteOnboarding}
                disabled={saving}
                className="flex items-center gap-1.5 py-2 px-6 bg-success-color hover:bg-success-color/90 text-white text-body-small font-bold rounded-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Enter Studio'}

                {!saving && <ArrowRight size={16} />}
              </button>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
