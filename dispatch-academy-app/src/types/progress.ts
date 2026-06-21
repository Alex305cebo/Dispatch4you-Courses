import type { TaskData } from './index';

// === Day Status ===

export type DayStatus = 'locked' | 'available' | 'in-progress' | 'completed';

// === Task Result ===

export interface TaskResult {
  taskId: string;
  score: number; // 0-100
  correct: boolean;
  timeSpentSeconds: number;
  attempts: number;
}

// === XP & Gamification ===

export interface XPEvent {
  taskId: string;
  dayId: number;
  xpAmount: number;
  reason: 'task-complete' | 'perfect-score' | 'day-perfect' | 'mini-exam' | 'final-exam';
  timestamp: string; // ISO date string
}

export interface LevelDefinition {
  level: number;
  title: string;
  xpThreshold: number;
}

// === Flashcard Spaced Repetition ===

export type SM2Rating = 'again' | 'hard' | 'good' | 'easy';

export interface FlashcardReviewState {
  cardId: string;
  easeFactor: number; // min 1.3, default 2.5
  interval: number; // days
  repetitions: number;
  nextReviewDate: string; // ISO date (YYYY-MM-DD)
  lastRating?: SM2Rating;
}

// === Exams ===

export interface ExamQuestion {
  id: string;
  type: 'quiz' | 'fill-blank' | 'calculator' | 'drag-match';
  moduleSource: number; // 1-12
  data: TaskData;
}

export interface ExamSession {
  examType: 'mini' | 'final';
  weekId?: number; // for mini exams
  questions: ExamQuestion[];
  answers: Map<string, unknown>;
  startTime: string; // ISO date string
  timeLimitMinutes: number;
  status: 'in-progress' | 'submitted' | 'timed-out';
}
