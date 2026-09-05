import type {
  GamificationAchievement,
  GamificationActivityEvent,
  GamificationActivityType,
  GamificationEventResult,
  LearnerGamification,
} from '../types/gamification';

import {
  createEvent,
  createGamification,
  getEvent,
  getGamification,
  updateGamification,
  withGamificationTransaction,
} from '../repositories/gamification-repository';

interface ActivityReward {
  xp: number;
  credits: number;
}

interface AwardActivityInput {
  learnerId: string;
  eventId: string;
  activityType: GamificationActivityType;
  activityId: string;
  result?: GamificationActivityEvent['result'];
}

const ACTIVITY_REWARDS: Record<
  GamificationActivityType,
  ActivityReward
> = {
  lesson: {
    xp: 50,
    credits: 10,
  },
  challenge: {
    xp: 150,
    credits: 30,
  },
  assessment: {
    xp: 75,
    credits: 15,
  },
  simulation: {
    xp: 100,
    credits: 20,
  },
  daily_mission: {
    xp: 50,
    credits: 10,
  },
  boss: {
    xp: 500,
    credits: 100,
  },
};

const XP_PER_LEVEL = 250;

const UNLOCKS = [
  {
    id: 'quantum-foundations',
    requiredXp: 0,
  },
  {
    id: 'superposition-sector',
    requiredXp: 250,
  },
  {
    id: 'entanglement-sector',
    requiredXp: 750,
  },
  {
    id: 'quantum-algorithms-sector',
    requiredXp: 1500,
  },
  {
    id: 'quantum-lab-sector',
    requiredXp: 2500,
  },
  {
    id: 'quantum-mastery-sector',
    requiredXp: 5000,
  },
] as const;

function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function calculateStreak(
  currentStreak: number,
  longestStreak: number,
  lastActivityDate: string | undefined,
  currentDate: string
): {
  streak: number;
  longestStreak: number;
} {
  if (!lastActivityDate) {
    return {
      streak: 1,
      longestStreak: Math.max(longestStreak, 1),
    };
  }

  if (lastActivityDate === currentDate) {
    return {
      streak: currentStreak,
      longestStreak,
    };
  }

  const previous =
    new Date(`${lastActivityDate}T00:00:00.000Z`);

  const current =
    new Date(`${currentDate}T00:00:00.000Z`);

  const difference = Math.round(
    (current.getTime() - previous.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (difference === 1) {
    const streak = currentStreak + 1;

    return {
      streak,
      longestStreak: Math.max(
        longestStreak,
        streak
      ),
    };
  }

  return {
    streak: 1,
    longestStreak: Math.max(longestStreak, 1),
  };
}

function getUnlockedRegions(
  xp: number
): string[] {
  return UNLOCKS
    .filter(
      (unlock) =>
        xp >= unlock.requiredXp
    )
    .map((unlock) => unlock.id);
}

function getNewUnlocks(
  previousXp: number,
  newXp: number,
  existingRegions: string[]
): string[] {
  return UNLOCKS
    .filter(
      (unlock) =>
        previousXp < unlock.requiredXp &&
        newXp >= unlock.requiredXp &&
        !existingRegions.includes(unlock.id)
    )
    .map((unlock) => unlock.id);
}

function createAchievement(
  id: string,
  unlockedAt: string
): GamificationAchievement {
  return {
    id,
    unlockedAt,
  };
}

function getNewAchievements(
  gamification: LearnerGamification,
  activityType: GamificationActivityType,
  now: string
): GamificationAchievement[] {
  const existingIds = new Set(
    gamification.achievements.map(
      (achievement) => achievement.id
    )
  );

  const achievements: GamificationAchievement[] =
    [];

  const addAchievement = (
    id: string
  ): void => {
    if (existingIds.has(id)) {
      return;
    }

    achievements.push(
      createAchievement(id, now)
    );

    existingIds.add(id);
  };

  if (
    gamification.statistics
      .totalActivitiesCompleted >= 1
  ) {
    addAchievement(
      'first-quantum-step'
    );
  }

  if (
    gamification.statistics
      .totalActivitiesCompleted >= 10
  ) {
    addAchievement(
      'quantum-explorer'
    );
  }

  if (
    gamification.statistics
      .totalActivitiesCompleted >= 25
  ) {
    addAchievement(
      'quantum-pioneer'
    );
  }

  if (gamification.streak >= 3) {
    addAchievement(
      'three-day-streak'
    );
  }

  if (gamification.streak >= 7) {
    addAchievement(
      'seven-day-streak'
    );
  }

  if (gamification.streak >= 30) {
    addAchievement(
      'thirty-day-streak'
    );
  }

  if (
    activityType === 'challenge' &&
    gamification.statistics
      .challengesCompleted >= 1
  ) {
    addAchievement(
      'first-challenge'
    );
  }

  if (
    activityType === 'boss' &&
    gamification.statistics
      .bossesDefeated >= 1
  ) {
    addAchievement(
      'first-boss'
    );
  }

  if (gamification.xp >= 1000) {
    addAchievement(
      'one-thousand-xp'
    );
  }

  return achievements;
}

function createInitialGamification(
  learnerId: string,
  now: string
): LearnerGamification {
  return {
    learnerId,

    xp: 0,
    level: 1,

    streak: 0,
    longestStreak: 0,

    lastActivityDate: undefined,

    streakShields: 1,

    quantumCredits: 0,

    achievements: [],

    quests: [],

    bosses: [],

    worlds: [
      {
        id: 'quantum-foundations',
        name: 'Quantum Foundations',
        theme: 'quantum',
        unlocked: true,
        unlockedAt: now,
      },
    ],

    unlockedRegions: [
      'quantum-foundations',
    ],

    statistics: {
      lessonsCompleted: 0,
      challengesCompleted: 0,
      assessmentsCompleted: 0,
      simulationsCompleted: 0,
      bossesDefeated: 0,
      totalActivitiesCompleted: 0,
    },

    updatedAt: now,
  };
}

function updateStatistics(
  statistics: LearnerGamification['statistics'],
  activityType: GamificationActivityType
): LearnerGamification['statistics'] {
  const updated = {
    ...statistics,

    totalActivitiesCompleted:
      statistics.totalActivitiesCompleted + 1,
  };

  switch (activityType) {
    case 'lesson':
      updated.lessonsCompleted += 1;
      break;

    case 'challenge':
      updated.challengesCompleted += 1;
      break;

    case 'assessment':
      updated.assessmentsCompleted += 1;
      break;

    case 'simulation':
      updated.simulationsCompleted += 1;
      break;

    case 'boss':
      updated.bossesDefeated += 1;
      break;

    case 'daily_mission':
      break;

    default:
      break;
  }

  return updated;
}

export async function getOrCreateGamification(
  learnerId: string
): Promise<LearnerGamification> {
  const existing =
    await getGamification(learnerId);

  if (existing) {
    return existing;
  }

  const now =
    new Date().toISOString();

  const gamification =
    createInitialGamification(
      learnerId,
      now
    );

  try {
    return await createGamification(
      gamification
    );
  } catch (error) {
    const existingAfterRace =
      await getGamification(
        learnerId
      );

    if (existingAfterRace) {
      return existingAfterRace;
    }

    throw error;
  }
}

export async function awardActivity(
  input: AwardActivityInput
): Promise<GamificationEventResult> {
  const reward =
    ACTIVITY_REWARDS[
      input.activityType
    ];

  const completedAt =
    new Date().toISOString();

  const activityDate =
    getToday();

  return withGamificationTransaction(
    async (_db, session) => {
      const existingEvent =
        await getEvent(
          input.learnerId,
          input.eventId,
          session
        );

      if (existingEvent) {
        const existingGamification =
          await getGamification(
            input.learnerId
          );

        if (!existingGamification) {
          throw new Error(
            'Gamification profile not found'
          );
        }

        return {
          xp: existingGamification.xp,
          level: existingGamification.level,
          streak:
            existingGamification.streak,
          longestStreak:
            existingGamification.longestStreak,
          quantumCredits:
            existingGamification.quantumCredits,
          xpEarned:
            existingEvent.xpEarned,
          creditsEarned:
            existingEvent.creditsEarned,
          levelUp: false,
          newAchievements: [],
          newUnlocks: [],
          alreadyProcessed: true,
        };
      }

      let gamification =
        await getGamification(
          input.learnerId
        );

      if (!gamification) {
        gamification =
          createInitialGamification(
            input.learnerId,
            completedAt
          );

        await createGamification(
          gamification,
          session
        );
      }

      const previousXp =
        gamification.xp;

      const previousLevel =
        gamification.level;

      const streakState =
        calculateStreak(
          gamification.streak,
          gamification.longestStreak,
          gamification.lastActivityDate,
          activityDate
        );

      const newXp =
        previousXp + reward.xp;

      const newLevel =
        calculateLevel(newXp);

      const levelUp =
        newLevel > previousLevel;

      const newCredits =
        gamification.quantumCredits +
        reward.credits;

      const newStatistics =
        updateStatistics(
          gamification.statistics,
          input.activityType
        );

      const newUnlocks =
        getNewUnlocks(
          previousXp,
          newXp,
          gamification.unlockedRegions
        );

      const unlockedRegions =
        Array.from(
          new Set([
            ...gamification.unlockedRegions,
            ...getUnlockedRegions(
              newXp
            ),
          ])
        );

      const updatedGamification:
        LearnerGamification = {
        ...gamification,

        xp: newXp,
        level: newLevel,

        streak:
          streakState.streak,

        longestStreak:
          streakState.longestStreak,

        lastActivityDate:
          activityDate,

        quantumCredits:
          newCredits,

        unlockedRegions,

        statistics:
          newStatistics,

        updatedAt:
          completedAt,
      };

      const newAchievements =
        getNewAchievements(
          updatedGamification,
          input.activityType,
          completedAt
        );

      updatedGamification.achievements =
        [
          ...gamification.achievements,
          ...newAchievements,
        ];

      await updateGamification(
        input.learnerId,
        {
          $set:
            updatedGamification,
        },
        session
      );

      const event:
        GamificationActivityEvent = {
        learnerId:
          input.learnerId,

        activityType:
          input.activityType,

        activityId:
          input.activityId,

        eventId:
          input.eventId,

        ...(input.result
          ? {
              result:
                input.result,
            }
          : {}),
      };

      await createEvent(
        {
          ...event,
          processedAt:
            completedAt,
          xpEarned:
            reward.xp,
          creditsEarned:
            reward.credits,
        },
        session
      );

      return {
        xp:
          updatedGamification.xp,

        level:
          updatedGamification.level,

        streak:
          updatedGamification.streak,

        longestStreak:
          updatedGamification.longestStreak,

        quantumCredits:
          updatedGamification.quantumCredits,

        xpEarned:
          reward.xp,

        creditsEarned:
          reward.credits,

        levelUp,

        newAchievements,

        newUnlocks,

        alreadyProcessed: false,
      };
    }
  );
}

export function getActivityReward(
  activityType: GamificationActivityType
): ActivityReward {
  const reward =
    ACTIVITY_REWARDS[
      activityType
    ];

  if (!reward) {
    throw new Error(
      `Unsupported activity type: ${activityType}`
    );
  }

  return {
    ...reward,
  };
}

export {
  ACTIVITY_REWARDS,
  XP_PER_LEVEL,
};