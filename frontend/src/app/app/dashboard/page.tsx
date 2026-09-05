'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import {
  Flame,
  ArrowRight,
  Atom,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  FolderOpen
} from 'lucide-react';
import { mockUser, mockCourses, mockConcepts } from '@/lib/api/mock-client';
import { getGamificationProfile } from '@/lib/api/gamification-client';
import type { LearnerGamification } from '@/lib/api/gamification-client';
import { InteractivePageHero } from '@/components/visual/interactive-page-hero';
import { QuantumUniversePanel } from '@/components/gamification/quantum-universe-panel';
interface OnboardingProfile {
  role: 'student' | 'instructor';
  goal: string;
  mathLevel: string;
  codeLevel: string;
  recommendedLevel: string;
  recommendedCourseId: string;
}
interface LearnerProgress {
  completedModules: string[];
  mastery: Record<string, number>;
  suggestedNext: string;
  updatedAt: string;
}
export default function LearnerDashboard() {
  const { user, isLoaded } = useUser();

  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [progress, setProgress] = useState<LearnerProgress | null>(null);
  const [gamification, setGamification] =
  useState<LearnerGamification | null>(null);

const [gamificationLoading, setGamificationLoading] =
  useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProgress() {
      try {
        const response = await fetch('/api/v1/progress', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Progress API returned ${response.status}`);
        }

        const data = (await response.json()) as {
          progress: LearnerProgress | null;
        };

        if (!cancelled) {
          setProgress(data.progress);
        }
      } catch (error) {
        console.error('Dashboard progress loading failed:', error);
      }
    }

    void loadProgress();

    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const response = await fetch('/api/v1/onboarding', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Profile API returned ${response.status}`);
        }

        const data = (await response.json()) as {
          completed: boolean;
          onboarding: OnboardingProfile | null;
        };

        if (!cancelled && data.completed) {
          setProfile(data.onboarding);
        }
      } catch (error) {
        console.error('Dashboard profile loading failed:', error);
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
  let cancelled = false;

  async function loadGamification() {
    try {
      const data = await getGamificationProfile();

      if (!cancelled) {
        setGamification(data);
      }
    } catch (error) {
      console.error(
        'Dashboard gamification loading failed:',
        error
      );
    } finally {
      if (!cancelled) {
        setGamificationLoading(false);
      }
    }
  }

  void loadGamification();

  return () => {
    cancelled = true;
  };
}, []);

  const displayName =
    user?.firstName ||
    user?.username ||
    mockUser.name;

  const isBeginner =
    profile?.recommendedCourseId !== 'course-102';

  const completedLessons = new Set(
    progress?.completedModules ?? []
  );

  const lesson101Completed = completedLessons.has('lesson-101-1');
  const lesson102Completed = completedLessons.has('lesson-102-1');

  const recommendedLessonId = !lesson101Completed
    ? 'lesson-101-1'
    : !lesson102Completed
      ? 'lesson-102-1'
      : null;

  const recommendedHref = recommendedLessonId
    ? `/app/lessons/${recommendedLessonId}`
    : '/app/lab';

  const recommendedLessonTitle =
    recommendedLessonId === 'lesson-101-1'
      ? 'Qubits & The Bloch Sphere'
      : recommendedLessonId === 'lesson-102-1'
        ? 'Building Bell States'
        : 'Practice in the Quantum Lab';

  const recommendedDescription =
    recommendedLessonId === 'lesson-101-1'
      ? 'Begin with qubit states, superposition, measurement, and interactive Bloch sphere visualization.'
      : recommendedLessonId === 'lesson-102-1'
        ? 'Explore the CNOT gate, entanglement, Bell states, and multi-qubit circuit experiments.'
        : 'You completed the available lessons. Apply your knowledge by constructing and testing circuits.';

  const masteryValues = Object.values(progress?.mastery ?? {});

  const currentMastery =
    masteryValues.length > 0
      ? Math.round(
        masteryValues.reduce((total, score) => total + score, 0) /
        masteryValues.length
      )
      : 0;

  const earnedXp = gamification?.xp ?? 0;
const currentStreak = gamification?.streak ?? 0;

  const getCourseProgress = (courseId: string) => {
    if (courseId === 'course-101') {
      return lesson101Completed ? 100 : 0;
    }

    if (courseId === 'course-102') {
      return lesson102Completed ? 100 : 0;
    }

    return 0;
  };

  const personalizedCourses = [...mockCourses].sort((first, second) => {
    if (first.id === profile?.recommendedCourseId) return -1;
    if (second.id === profile?.recommendedCourseId) return 1;
    return 0;
  });

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <InteractivePageHero
        eyebrow={
          profileLoading
            ? 'Loading your learning path'
            : profile?.recommendedLevel ?? 'Personal learning command center'
        }
        title={`Welcome back, ${isLoaded ? displayName : 'Learner'}. Your next quantum leap is ready.`}
        description={
          profile?.goal === 'python'
            ? 'Your learning path focuses on quantum programming, algorithms, and practical circuit development.'
            : profile?.goal === 'simulate'
              ? 'Your learning path focuses on quantum simulation, physical systems, and noise behaviour.'
              : 'Your learning path focuses on quantum foundations, superposition, entanglement, and interactive experiments.'
        }
        imageSrc="/images/quantum/dashboard-command-center.png"
        imageAlt="A futuristic quantum learning command center with a holographic Bloch sphere and connected mastery nodes"
        actions={
          <>
            <Link href={recommendedHref} className="app-hero-primary">
              Continue learning <ArrowRight size={16} />
            </Link>
            <Link href="/app/lab" className="app-hero-secondary">
              <Atom size={16} /> Open Quantum Lab
            </Link>
          </>
        }
        metrics={
  <>
    <div className="app-hero-metric">
      <strong>
  {gamificationLoading
    ? '—'
    : `${currentStreak} ${currentStreak === 1 ? 'day' : 'days'}`}
</strong>
      <span>Learning streak</span>
    </div>

    <div className="app-hero-metric">
      <strong>
        {gamificationLoading
          ? '—'
          : `${earnedXp} XP`}
      </strong>
      <span>Experience</span>
    </div>

    <div className="app-hero-metric">
      <strong>
        {gamificationLoading
          ? '—'
          : `${gamification?.quantumCredits ?? 0}`}
      </strong>
      <span>Quantum Credits</span>
    </div>

    <div className="app-hero-metric">
      <strong>{currentMastery}%</strong>
      <span>Current mastery</span>
    </div>
  </>
}
            />

      <QuantumUniversePanel
        gamification={gamification}
        loading={gamificationLoading}
      />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Columns (Main content) */}
        <div className="lg:col-span-2 space-y-8">

          {/* Priority Next Action Recommendation Card */}
          <section className="app-depth-card app-interactive-card rounded-large p-6 md:p-7" aria-labelledby="continue-learning-title">
            <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl space-y-3">
                <span className="inline-flex items-center gap-1.5 text-caption font-black uppercase tracking-wider text-primary-color">
                  <Sparkles size={14} /> Recommended next activity
                </span>
                <h2 id="continue-learning-title" className="text-2xl font-extrabold tracking-tight">{recommendedLessonTitle}</h2>
                <p className="text-body-small text-text-secondary">
                  {recommendedDescription}
                </p>
              </div>
              <Link href={recommendedHref} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-medium bg-primary-color px-5 font-bold text-white hover:bg-primary-hover">
                Resume module <ArrowRight size={16} />
              </Link>
            </div>
          </section>

          {/* Active Courses Progress */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold tracking-tight">My Active Courses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {personalizedCourses.slice(0, 2).map((course) => {
                const courseProgress = getCourseProgress(course.id);

                return (
                  <div
                    key={course.id}
                    className="app-depth-card app-interactive-card p-5 rounded-large flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-caption font-bold text-text-secondary uppercase">{course.difficulty}</span>
                        <span className="text-caption text-text-secondary flex items-center gap-1">
                          <Clock size={12} /> {course.estimatedDuration}
                        </span>
                      </div>
                      <h4 className="font-bold text-body-large text-text-primary hover:text-primary-color">
                        <Link href={`/app/courses/${course.id}`}>{course.title}</Link>
                      </h4>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-body-small font-semibold">
                        <span className="text-text-secondary">Progress</span>
                        <span>{courseProgress}%</span>
                      </div>
                      <div className="w-full bg-background border border-border-color/30 h-2 rounded-pill overflow-hidden">
                        <div
                          className="bg-primary-color h-full transition-all duration-standard"
                          style={{ width: `${courseProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent Workspace Projects */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold tracking-tight">Recent Projects</h3>
              <Link href="/app/projects" className="text-body-small text-primary-color hover:underline font-semibold flex items-center">
                View All Projects <ChevronRight size={16} />
              </Link>
            </div>

            <div className="p-4 rounded-large bg-surface border border-border-color shadow-xs flex items-center justify-between gap-4 hover:border-primary-color/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary-color/10 text-primary-color rounded-medium flex items-center justify-center">
                  <FolderOpen size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-body-small text-text-primary">
                    <Link href="/app/lab">My Bell State Experiment</Link>
                  </h4>
                  <span className="text-caption text-text-secondary">Ideal Simulator • 1024 shots • Modified 2h ago</span>
                </div>
              </div>
              <Link href="/app/lab" className="text-body-small text-text-secondary hover:text-text-primary">
                <ChevronRight size={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Sidebar (Mastery map and updates) */}
        <div className="space-y-8">

          {/* Concept Mastery Tree List */}
          <div className="p-6 rounded-large bg-surface border border-border-color shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-body-large tracking-tight flex items-center gap-2">
                <TrendingUp className="text-success-color" size={20} /> Concept Mastery
              </h3>
              <Link href="/app/progress" className="text-caption text-primary-color hover:underline font-semibold">
                Detail Map
              </Link>
            </div>

            {/* Concepts Listing */}
            <div className="space-y-4">
              {mockConcepts.slice(0, 3).map((concept) => (
                <div key={concept.conceptId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-body-small">
                    <span className="font-medium text-text-primary">{concept.name}</span>
                    <span className={`px-2 py-0.5 rounded-pill text-[10px] font-bold ${concept.status === 'mastered'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300'
                      }`}>
                      {concept.masteryPercent}% Mastery
                    </span>
                  </div>
                  <div className="w-full bg-background border border-border-color/30 h-1.5 rounded-pill overflow-hidden">
                    <div
                      className={`h-full transition-all duration-standard ${concept.status === 'mastered' ? 'bg-success-color' : 'bg-primary-color'
                        }`}
                      style={{ width: `${concept.masteryPercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
