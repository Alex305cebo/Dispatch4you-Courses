import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProgressState } from '../types/store';
import type { SM2Rating, TaskResult } from '../types/progress';
import { calculateStreak, checkMilestone } from '../logic/streak';
import { getLevelForXP, didLevelUp } from '../logic/levels';
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

      // Day progress — ALL UNLOCKED TEMPORARILY FOR TESTING
      dayStatuses: { 1: 'available', 2: 'available', 3: 'available', 4: 'available', 5: 'available', 6: 'available', 7: 'available', 8: 'available', 9: 'available', 10: 'available', 11: 'available', 12: 'available', 13: 'available', 14: 'available', 15: 'available', 16: 'available', 17: 'available', 18: 'available', 19: 'available', 20: 'available' },
      taskScores: {},

      // Exam progress
      miniExamPassed: {},
      finalExamPassed: false,
      finalExamScore: null,
      certificateId: null,

      // Flashcard states
      flashcardStates: {},

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
        set((state) => ({
          dayStatuses: {
            ...state.dayStatuses,
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
