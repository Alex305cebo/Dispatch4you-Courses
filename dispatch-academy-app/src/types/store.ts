import type { DayStatus, FlashcardReviewState, SM2Rating, TaskResult } from './progress';

// === Progress Store ===

export interface ProgressState {
  // Identity
  userId: string;
  displayName: string;

  // XP & Level
  totalXP: number;
  level: number;

  // Streak
  currentStreak: number;
  lastActivityDate: string | null; // ISO date (YYYY-MM-DD)

  // Day progress
  dayStatuses: Record<number, DayStatus>; // dayId → status
  taskScores: Record<string, TaskResult>; // taskId → result

  // Exam progress
  miniExamPassed: Record<number, boolean>; // weekId → passed
  finalExamPassed: boolean;
  finalExamScore: number | null;
  certificateId: string | null;

  // Flashcard states
  flashcardStates: Record<string, FlashcardReviewState>;

  // Achievements
  unlockedAchievements: string[]; // achievement ids

  // Cooldowns
  miniExamCooldowns: Record<number, string>; // weekId → cooldown end ISO
  finalExamCooldown: string | null;

  // Actions
  addXP: (amount: number, reason: string) => void;
  completeTask: (dayId: number, result: TaskResult) => void;
  unlockNextDay: (currentDayId: number) => void;
  updateStreak: () => void;
  checkAchievements: () => void;
  updateFlashcardState: (cardId: string, rating: SM2Rating) => void;
  submitExam: (examType: 'mini' | 'final', score: number, weekId?: number) => void;
  syncToFirestore: () => Promise<void>;
  loadFromFirestore: () => Promise<void>;
}

// === UI Store ===

export interface AchievementToast {
  icon: string;
  title: string;
  description: string;
}

export interface UIState {
  soundEnabled: boolean;
  isOffline: boolean;
  pendingSyncCount: number;
  showLevelUpModal: boolean;
  levelUpData: { level: number; title: string } | null;
  achievementModal: AchievementToast | null;
  toastMessage: string | null;

  // Actions
  toggleSound: () => void;
  setOffline: (offline: boolean) => void;
  showToast: (message: string, duration?: number) => void;
  triggerLevelUp: (level: number, title: string) => void;
  dismissLevelUp: () => void;
  showAchievement: (achievement: AchievementToast) => void;
  dismissAchievement: () => void;
}
