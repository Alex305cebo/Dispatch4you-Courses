import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProgressState } from '../types/store';
import type { SM2Rating, TaskResult } from '../types/progress';
import { calculateStreak, checkMilestone } from '../logic/streak';
import { getLevelForXP, didLevelUp } from '../logic/levels';
import { deriveStats, findNewlyUnlocked, getAchievementById } from '../logic/achievements';
import { useUIStore } from './useUIStore';

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      // Identity
      userId: '',
      displayName: '',

      // XP & Level
      totalXP: 0,
      level: 1,

      // Streak
      currentStreak: 0,
      lastActivityDate: null,

      // Day progress — day 1 is available; further days unlock on completion.
      // (The map itself gates levels sequentially from taskScores; dayStatuses
      // tracks completion for stats, achievements and cross-device sync.)
      dayStatuses: { 1: 'available' },
      taskScores: {},

      // Exam progress
      miniExamPassed: {},
      finalExamPassed: false,
      finalExamScore: null,
      certificateId: null,

      // Flashcard states
      flashcardStates: {},

      // Achievements
      unlockedAchievements: [],

      // Cooldowns
      miniExamCooldowns: {},
      finalExamCooldown: null,

      // Actions
      addXP: (amount: number, _reason: string) => {
        set((state) => {
          const newXP = state.totalXP + amount;
          const newLevelDef = getLevelForXP(newXP);
          // Celebrate when the student crosses into a new level.
          if (didLevelUp(state.totalXP, newXP)) {
            useUIStore.getState().triggerLevelUp(newLevelDef.level, newLevelDef.title);
          }
          return {
            totalXP: newXP,
            level: newLevelDef.level,
          };
        });
      },

      completeTask: (_dayId: number, result: TaskResult) => {
        set((state) => ({
          taskScores: {
            ...state.taskScores,
            [result.taskId]: result,
          },
        }));
      },

      unlockNextDay: (currentDayId: number) => {
        // Mark the day just finished as completed and open the next one.
        set((state) => ({
          dayStatuses: {
            ...state.dayStatuses,
            [currentDayId]: 'completed',
            [currentDayId + 1]: 'available',
          },
        }));
      },

      updateStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        set((state) => {
          const todayStr = today ?? new Date().toISOString().split('T')[0];
          const result = calculateStreak(state.lastActivityDate, state.currentStreak, todayStr || '');
          // Check for streak milestone and notify
          const milestone = checkMilestone(result.newStreak);
          if (milestone) {
            useUIStore.getState().showToast(`🔥 Серия ${milestone} дней подряд!`);
          }
          return {
            currentStreak: result.newStreak,
            lastActivityDate: todayStr,
          };
        });
      },

      checkAchievements: () => {
        set((state) => {
          const stats = deriveStats({
            totalXP: state.totalXP,
            level: state.level,
            currentStreak: state.currentStreak,
            taskScores: state.taskScores,
            dayStatuses: state.dayStatuses,
            miniExamPassed: state.miniExamPassed,
            finalExamPassed: state.finalExamPassed,
            flashcardStates: state.flashcardStates,
          });
          const newly = findNewlyUnlocked(stats, state.unlockedAchievements);
          if (newly.length === 0) return {};
          // Announce the first newly-earned badge; the rest still unlock.
          const firstId = newly[0];
          const def = firstId ? getAchievementById(firstId) : undefined;
          if (def) {
            useUIStore.getState().showToast(`🏅 Достижение: ${def.icon} ${def.title}`);
          }
          return {
            unlockedAchievements: [...state.unlockedAchievements, ...newly],
          };
        });
      },

      updateFlashcardState: (_cardId: string, _rating: SM2Rating) => {
        // Stub — will use SM-2 engine later
      },

      submitExam: (examType: 'mini' | 'final', score: number, weekId?: number) => {
        if (examType === 'mini' && weekId !== undefined) {
          const passed = score >= 70;
          set((state) => ({
            miniExamPassed: {
              ...state.miniExamPassed,
              [weekId]: passed,
            },
          }));
        } else if (examType === 'final') {
          const passed = score >= 80;
          set({
            finalExamPassed: passed,
            finalExamScore: score,
          });
        }
      },

      syncToFirestore: async () => {
        // Stub — to be implemented in Firebase integration task
      },

      loadFromFirestore: async () => {
        // Stub — to be implemented in Firebase integration task
      },
    }),
    {
      name: 'dispatch-academy-progress',
    }
  )
);
