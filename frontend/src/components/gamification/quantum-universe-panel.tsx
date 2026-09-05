'use client';

import Link from 'next/link';
import {
  Atom,
  ChevronRight,
  Flame,
  Gem,
  Lock,
  Shield,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';

import type { LearnerGamification } from '@/lib/api/gamification-client';

interface QuantumUniversePanelProps {
  gamification: LearnerGamification | null;
  loading?: boolean;
}

const achievementDetails: Record<
  string,
  {
    name: string;
    description: string;
  }
> = {
  'first-quantum-step': {
    name: 'First Quantum Step',
    description: 'Complete your first quantum learning activity.',
  },
  'quantum-explorer': {
    name: 'Quantum Explorer',
    description: 'Explore the first stage of your quantum journey.',
  },
  'quantum-pioneer': {
    name: 'Quantum Pioneer',
    description: 'Unlock your first major quantum territory.',
  },
  'three-day-streak': {
    name: 'Three-Day Streak',
    description: 'Learn for three consecutive days.',
  },
  'seven-day-streak': {
    name: 'Seven-Day Streak',
    description: 'Maintain a seven-day learning streak.',
  },
  'thirty-day-streak': {
    name: 'Thirty-Day Streak',
    description: 'Maintain a thirty-day learning streak.',
  },
  'first-challenge': {
    name: 'Challenge Initiate',
    description: 'Complete your first quantum challenge.',
  },
  'first-boss': {
    name: 'Boss Defeater',
    description: 'Defeat your first quantum boss.',
  },
  'one-thousand-xp': {
    name: 'Quantum Mastery',
    description: 'Earn 1,000 XP through meaningful learning.',
  },
};

function formatAchievementName(id: string) {
  return (
    achievementDetails[id]?.name ??
    id
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  );
}

function getAchievementDescription(id: string) {
  return (
    achievementDetails[id]?.description ??
    'Achievement unlocked during your quantum learning journey.'
  );
}

export function QuantumUniversePanel({
  gamification,
  loading = false,
}: QuantumUniversePanelProps) {
  const xp = gamification?.xp ?? 0;
  const level = gamification?.level ?? 1;
  const streak = gamification?.streak ?? 0;
  const credits = gamification?.quantumCredits ?? 0;
  const shields = gamification?.streakShields ?? 0;

  const xpPerLevel = 250;
  const currentLevelXp = xp % xpPerLevel;
  const xpProgress = Math.min(
    100,
    Math.round((currentLevelXp / xpPerLevel) * 100)
  );

  const unlockedRegions =
    gamification?.unlockedRegions ?? ['quantum-foundations'];

  const worlds = gamification?.worlds ?? [];

  const achievements =
    gamification?.achievements?.slice(-3).reverse() ?? [];

  const activities =
    gamification?.statistics?.totalActivitiesCompleted ?? 0;

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-primary-color/20 bg-surface shadow-xl">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-color/10 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-caption font-black uppercase tracking-[0.18em] text-primary-color">
              <Sparkles size={15} />
              Your Quantum Universe
            </div>

            <h2 className="text-2xl font-black tracking-tight text-text-primary md:text-3xl">
              Level {level} Quantum Explorer
            </h2>

            <p className="max-w-2xl text-body-small leading-6 text-text-secondary">
              Build your expertise by completing missions, mastering concepts,
              and unlocking new quantum territories.
            </p>
          </div>

          <Link
            href="/app/progress"
            className="inline-flex items-center gap-1 text-body-small font-bold text-primary-color hover:underline"
          >
            View full progress
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-border-color bg-background/60 p-4">
            <div className="mb-2 flex items-center gap-2 text-text-secondary">
              <Zap size={17} />
              <span className="text-caption font-bold uppercase">
                Experience
              </span>
            </div>

            <strong className="text-xl font-black text-text-primary">
              {loading ? '—' : `${xp} XP`}
            </strong>
          </div>

          <div className="rounded-xl border border-border-color bg-background/60 p-4">
            <div className="mb-2 flex items-center gap-2 text-text-secondary">
              <Flame size={17} />
              <span className="text-caption font-bold uppercase">
                Streak
              </span>
            </div>

            <strong className="text-xl font-black text-text-primary">
              {loading ? '—' : `${streak} days`}
            </strong>
          </div>

          <div className="rounded-xl border border-border-color bg-background/60 p-4">
            <div className="mb-2 flex items-center gap-2 text-text-secondary">
              <Gem size={17} />
              <span className="text-caption font-bold uppercase">
                Credits
              </span>
            </div>

            <strong className="text-xl font-black text-text-primary">
              {loading ? '—' : credits}
            </strong>
          </div>

          <div className="rounded-xl border border-border-color bg-background/60 p-4">
            <div className="mb-2 flex items-center gap-2 text-text-secondary">
              <Shield size={17} />
              <span className="text-caption font-bold uppercase">
                Shields
              </span>
            </div>

            <strong className="text-xl font-black text-text-primary">
              {loading ? '—' : shields}
            </strong>
          </div>
        </div>

        {/* XP Progress */}
        <div className="mt-5 rounded-xl border border-border-color bg-background/60 p-5">
          <div className="mb-2 flex items-center justify-between gap-4">
            <div>
              <span className="text-caption font-bold uppercase tracking-wider text-text-secondary">
                Quantum Level Progress
              </span>
            </div>

            <span className="text-body-small font-black text-primary-color">
              {currentLevelXp} / {xpPerLevel} XP
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-pill bg-background">
            <div
              className="h-full rounded-pill bg-primary-color transition-all duration-700"
              style={{
                width: `${loading ? 0 : xpProgress}%`,
              }}
            />
          </div>

          <div className="mt-2 flex justify-between text-caption text-text-secondary">
            <span>Level {level}</span>
            <span>Level {level + 1}</span>
          </div>
        </div>

        {/* Universe map + achievements */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Universe */}
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-black text-text-primary">
                  Quantum Territories
                </h3>
                <p className="mt-1 text-caption text-text-secondary">
                  Unlock new regions as your mastery grows.
                </p>
              </div>

              <Atom
                size={22}
                className="text-primary-color"
              />
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-border-color bg-background p-5">
              <div className="absolute left-8 top-1/2 h-px w-[calc(100%-4rem)] bg-border-color" />

              <div className="relative grid grid-cols-2 gap-5 md:grid-cols-4">
                {[
                  {
                    id: 'quantum-foundations',
                    name: 'Quantum Foundations',
                    description: 'Your starting territory',
                  },
                  {
                    id: 'superposition',
                    name: 'Superposition',
                    description: 'Master quantum states',
                  },
                  {
                    id: 'entanglement',
                    name: 'Entanglement',
                    description: 'Connect quantum systems',
                  },
                  {
                    id: 'quantum-algorithms',
                    name: 'Quantum Algorithms',
                    description: 'Enter advanced territory',
                  },
                ].map((region) => {
                  const unlocked =
                    unlockedRegions.includes(region.id) ||
                    worlds.some(
                      (world) =>
                        world.id === region.id && world.unlocked
                    );

                  return (
                    <div
                      key={region.id}
                      className="relative z-10 flex flex-col items-center text-center"
                    >
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-full border-2 ${
                          unlocked
                            ? 'border-primary-color bg-primary-color/10 text-primary-color'
                            : 'border-border-color bg-surface text-text-secondary'
                        }`}
                      >
                        {unlocked ? (
                          <Atom size={23} />
                        ) : (
                          <Lock size={19} />
                        )}
                      </div>

                      <h4 className="mt-3 text-body-small font-black text-text-primary">
                        {region.name}
                      </h4>

                      <p className="mt-1 text-[11px] leading-4 text-text-secondary">
                        {unlocked
                          ? region.description
                          : 'Locked territory'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-black text-text-primary">
                  Recent Achievements
                </h3>
                <p className="mt-1 text-caption text-text-secondary">
                  Milestones from your journey.
                </p>
              </div>

              <Trophy
                size={21}
                className="text-primary-color"
              />
            </div>

            <div className="space-y-3">
              {achievements.length > 0 ? (
                achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 rounded-xl border border-border-color bg-background p-3"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-color/10 text-primary-color">
                      <Trophy size={18} />
                    </div>

                    <div className="min-w-0">
                      <h4 className="truncate text-body-small font-black text-text-primary">
                        {formatAchievementName(achievement.id)}
                      </h4>

                      <p className="text-caption leading-4 text-text-secondary">
                        {getAchievementDescription(
                          achievement.id
                        )}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-border-color bg-background p-5 text-center">
                  <Trophy
                    size={24}
                    className="mx-auto mb-2 text-text-secondary"
                  />

                  <p className="text-body-small font-bold text-text-primary">
                    Your first achievement is waiting.
                  </p>

                  <p className="mt-1 text-caption text-text-secondary">
                    Complete meaningful learning activities to unlock
                    milestones.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Journey footer */}
        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-primary-color/20 bg-primary-color/5 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles
                size={17}
                className="text-primary-color"
              />
              <span className="text-caption font-black uppercase tracking-wider text-primary-color">
                Quantum Journey
              </span>
            </div>

            <p className="mt-1 text-body-small text-text-secondary">
              {activities === 0
                ? 'Complete your first mission to begin your journey.'
                : `${activities} learning ${
                    activities === 1 ? 'activity' : 'activities'
                  } completed. Keep advancing.`}
            </p>
          </div>

          <Link
            href="/app/challenges"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-medium bg-primary-color px-5 text-body-small font-black text-white transition-colors hover:bg-primary-hover"
          >
            Explore Missions
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}