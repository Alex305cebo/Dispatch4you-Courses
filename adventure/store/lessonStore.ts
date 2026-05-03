/**
 * LESSON PROGRESS STORE
 * Хранит прогресс прохождения Duolingo-уроков
 * Сохраняется в localStorage
 */
import { create } from 'zustand';

const STORAGE_KEY = 'dispatch-lesson-progress';

interface LessonProgress {
  completedLessons: string[];   // ['m1-l1', 'm1-l2', ...]
  totalXP: number;
  streak: number;               // дней подряд
  lastLessonDate: string;       // ISO date для streak
  contextTriggered: string[];   // какие контекстные уже показаны
  dailyQuizShownToday: string;  // ISO date — показывали ли сегодня
}

interface LessonStore extends LessonProgress {
  // Actions
  completeLesson: (lessonId: string, xp: number) => void;
  markContextTriggered: (lessonId: string) => void;
  markDailyQuizShown: () => void;
  shouldShowDailyQuiz: () => boolean;
  getNextLesson: () => string | null;
  getCompletedCount: () => number;
  reset: () => void;
}

function loadFromStorage(): LessonProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    completedLessons: [],
    totalXP: 0,
    streak: 0,
    lastLessonDate: '',
    contextTriggered: [],
    dailyQuizShownToday: '',
  };
}

function saveToStorage(state: LessonProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function getTodayISO(): string {
  return new Date().toISOString().split('T')[0]; // "2026-05-02"
}

function updateStreak(lastDate: string, currentStreak: number): number {
  const today = getTodayISO();
  if (lastDate === today) return currentStreak; // уже играл сегодня

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayISO = yesterday.toISOString().split('T')[0];

  if (lastDate === yesterdayISO) return currentStreak + 1; // продолжение серии
  return 1; // серия сброшена
}

export const useLessonStore = create<LessonStore>((set, get) => {
  const initial = loadFromStorage();

  return {
    ...initial,

    completeLesson: (lessonId: string, xp: number) => {
      const state = get();
      if (state.completedLessons.includes(lessonId)) return; // уже пройден

      const today = getTodayISO();
      const newStreak = updateStreak(state.lastLessonDate, state.streak);

      const updated: LessonProgress = {
        completedLessons: [...state.completedLessons, lessonId],
        totalXP: state.totalXP + xp,
        streak: newStreak,
        lastLessonDate: today,
        contextTriggered: state.contextTriggered,
        dailyQuizShownToday: state.dailyQuizShownToday,
      };

      saveToStorage(updated);
      set(updated);
    },

    markContextTriggered: (lessonId: string) => {
      const state = get();
      if (state.contextTriggered.includes(lessonId)) return;

      const updated = {
        ...state,
        contextTriggered: [...state.contextTriggered, lessonId],
      };
      saveToStorage(updated);
      set({ contextTriggered: updated.contextTriggered });
    },

    markDailyQuizShown: () => {
      const today = getTodayISO();
      const state = get();
      const updated = { ...state, dailyQuizShownToday: today };
      saveToStorage(updated);
      set({ dailyQuizShownToday: today });
    },

    shouldShowDailyQuiz: () => {
      const state = get();
      const today = getTodayISO();
      // Показываем если сегодня ещё не показывали И есть непройденные уроки
      return state.dailyQuizShownToday !== today && state.completedLessons.length < 39;
    },

    getNextLesson: () => {
      const { completedLessons } = get();
      // Импортируем порядок уроков из данных
      // Возвращаем ID первого непройденного
      const allIds = [
        'm1-l1-what-is-dispatcher', 'm1-l2-industry-size', 'm1-l3-mc-dot-basics',
        'm2-l1-fmcsa-intro', 'm2-l2-dot-inspection',
        'm3-l1-11-hour-rule', 'm3-l2-14-hour-window', 'm3-l3-30-min-break',
        'm4-l1-what-is-load-board', 'm4-l2-dat-vs-truckstop', 'm4-l3-reading-load-posting',
        'm5-l1-first-call-to-broker', 'm5-l2-rate-negotiation', 'm5-l3-checking-broker-credit',
        'm6-l1-driver-info', 'm6-l2-hos-check', 'm6-l3-driver-motivation',
        'm7-l1-route-planning-tools', 'm7-l2-calculating-drive-time', 'm7-l3-time-zones', 'm7-l4-deadhead-minimization',
        'm8-l1-dry-van-basics', 'm8-l2-reefer-vs-dry-van', 'm8-l3-hazmat-requirements',
        'm9-l1-calculating-profitability', 'm9-l2-rpm-analysis', 'm9-l3-factoring-basics',
        'm10-l1-accident-protocol', 'm10-l2-breakdown-handling', 'm10-l3-weather-delays', 'm10-l4-cargo-theft',
        'm11-l1-tms-basics', 'm11-l2-eld-mandate', 'm11-l3-gps-tracking',
        'm12-l1-salary-expectations', 'm12-l2-career-path', 'm12-l3-starting-own-company', 'm12-l4-interview-tips',
      ];
      return allIds.find(id => !completedLessons.includes(id)) || null;
    },

    getCompletedCount: () => get().completedLessons.length,

    reset: () => {
      const fresh: LessonProgress = {
        completedLessons: [],
        totalXP: 0,
        streak: 0,
        lastLessonDate: '',
        contextTriggered: [],
        dailyQuizShownToday: '',
      };
      saveToStorage(fresh);
      set(fresh);
    },
  };
});
