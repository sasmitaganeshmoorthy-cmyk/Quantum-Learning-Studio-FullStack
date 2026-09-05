export type GamificationActivityType =
  | 'lesson'
  | 'challenge'
  | 'assessment'
  | 'simulation'
  | 'daily_mission'
  | 'boss';

export interface GamificationAchievement {
  id: string;
  unlockedAt: string;
}

export interface GamificationQuest {
  id: string;
  status:
    | 'locked'
    | 'available'
    | 'in_progress'
    | 'completed';
  progress: number;
  startedAt?: string;
  completedAt?: string;
}

export interface GamificationBoss {
  id: string;
  status: 'locked' | 'available' | 'defeated';
  defeatedAt?: string;
}

export interface GamificationWorld {
  id: string;
  name: string;
  theme: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface GamificationStatistics {
  lessonsCompleted: number;
  challengesCompleted: number;
  assessmentsCompleted: number;
  simulationsCompleted: number;
  bossesDefeated: number;
  totalActivitiesCompleted: number;
}

export interface LearnerGamification {
  learnerId: string;
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastActivityDate?: string;
  streakShields: number;
  quantumCredits: number;
  achievements: GamificationAchievement[];
  quests: GamificationQuest[];
  bosses: GamificationBoss[];
  worlds: GamificationWorld[];
  unlockedRegions: string[];
  statistics: GamificationStatistics;
  updatedAt: string;
}

export interface GamificationActivityResult {
  scorePercent?: number;
  passed?: boolean;
  simulationCompleted?: boolean;
}

export interface AwardGamificationActivityInput {
  activityType: GamificationActivityType;
  activityId: string;
  eventId: string;
  result?: GamificationActivityResult;
}

export interface GamificationEventResult {
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  quantumCredits: number;
  xpEarned: number;
  creditsEarned: number;
  levelUp: boolean;
  newAchievements: GamificationAchievement[];
  newUnlocks: string[];
  alreadyProcessed: boolean;
}

interface GamificationProfileResponse {
  gamification: LearnerGamification;
}

async function parseResponse<T>(
  response: Response
): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data &&
      typeof data === 'object' &&
      'error' in data &&
      typeof data.error === 'string'
        ? data.error
        : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}

export async function getGamificationProfile(): Promise<
  LearnerGamification
> {
  const response = await fetch(
    '/api/v1/gamification',
    {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    }
  );

  const data =
    await parseResponse<GamificationProfileResponse>(
      response
    );

  return data.gamification;
}

export async function awardGamificationActivity(
  input: AwardGamificationActivityInput
): Promise<GamificationEventResult> {
  const response = await fetch(
    '/api/v1/gamification/activity',
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    }
  );

  return parseResponse<GamificationEventResult>(
    response
  );
}