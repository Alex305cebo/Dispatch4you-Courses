import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { loadDayContent, prefetchNextDay } from '../services/content-loader';
import { useProgressStore } from '../store/useProgressStore';
import { calculateDayMeanScore } from '../logic/unlock';
import { getBaseXPForTask, getPerfectScoreBonus, getDayPerfectBonus } from '../logic/xp';
import TaskRenderer from '../components/tasks/TaskRenderer';
import type { DayContent } from '../types/index';
import type { TaskResult } from '../types/progress';

type PageState = 'loading' | 'error' | 'active' | 'complete';

export default function DayPage() {
  const { dayId: dayIdParam } = useParams<{ dayId: string }>();
  const navigate = useNavigate();
  const dayId = Number(dayIdParam);

  const completeTask = useProgressStore((s) => s.completeTask);
  const unlockNextDay = useProgressStore((s) => s.unlockNextDay);
  const addXP = useProgressStore((s) => s.addXP);
  const updateStreak = useProgressStore((s) => s.updateStreak);
  const syncToFirestore = useProgressStore((s) => s.syncToFirestore);
  const taskScores = useProgressStore((s) => s.taskScores);

  const [pageState, setPageState] = useState<PageState>('loading');
  const [dayContent, setDayContent] = useState<DayContent | null>(null);
  const [taskQueue, setTaskQueue] = useState<DayContent['tasks']>([]);
  const [initialTaskCount, setInitialTaskCount] = useState(0);
  const [completedResults, setCompletedResults] = useState<TaskResult[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [meanScore, setMeanScore] = useState(0);
  const [totalXPEarned, setTotalXPEarned] = useState(0);
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());

  const hasPrefetched = useRef(false);

  // Load day content
  const loadContent = useCallback(async () => {
    setPageState('loading');
    setErrorMessage('');
    try {
      const content = await loadDayContent(dayId);
      setDayContent(content);

      // Progressive task count: day 1 = 1 task, day 2 = 2, ..., day 10+ = all tasks
      // For dream levels (101-111): dream1 = 1, dream2 = 2, etc.
      const isDream = dayId >= 100;
      const levelNumber = isDream ? dayId - 100 : dayId; // 101→1, 102→2, etc.
      const maxTasks = content.tasks.length;
      const taskCount = Math.min(levelNumber, maxTasks);
      const limitedTasks = content.tasks.slice(0, taskCount);

      setTaskQueue([...limitedTasks]);
      setInitialTaskCount(limitedTasks.length);
      setPageState('active');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Не удалось загрузить урок. Попробуйте ещё раз.';
      setErrorMessage(message);
      setPageState('error');
    }
  }, [dayId]);

  useEffect(() => {
    if (!dayId || isNaN(dayId)) {
      setErrorMessage('Некорректный номер дня.');
      setPageState('error');
      return;
    }
    loadContent();
  }, [dayId, loadContent]);

  // Handle task completion
  const handleTaskComplete = useCallback(
    (result: TaskResult) => {
      // Save to progress store
      completeTask(dayId, result);

      // Determine if this is the first completion of this task
      const isFirstCompletion = !taskScores[result.taskId];
      const isFirstAttempt = result.attempts === 1;

      // Get the task type from queue head
      const taskDef = taskQueue[0];
      const taskType = taskDef?.type ?? 'quiz';

      // Calculate XP using proper logic
      const baseXP = getBaseXPForTask(taskType, isFirstCompletion);
      const perfectBonus = getPerfectScoreBonus(result.score, isFirstAttempt);
      const taskXP = baseXP + perfectBonus;

      if (taskXP > 0) {
        addXP(taskXP, taskXP === baseXP ? 'task-complete' : 'perfect-score');
      }

      const updatedResults = [...completedResults, result];
      setCompletedResults(updatedResults);
      setTotalXPEarned((prev) => prev + taskXP);

      // Remove completed task from queue
      const newQueue = taskQueue.slice(1);
      setTaskQueue(newQueue);

      // Check if all tasks are done (queue empty)
      if (newQueue.length === 0) {
        // All tasks completed — calculate day perfect bonus
        const allScores = updatedResults.map((r) => r.score);
        const dayBonus = getDayPerfectBonus(allScores);
        if (dayBonus > 0) {
          addXP(dayBonus, 'day-perfect');
          setTotalXPEarned((prev) => prev + dayBonus);
        }

        const score = calculateDayMeanScore(updatedResults);
        setMeanScore(score);

        if (score >= 70) {
          unlockNextDay(dayId);
        }

        updateStreak();

        syncToFirestore().catch(() => {});

        if (!hasPrefetched.current) {
          hasPrefetched.current = true;
          prefetchNextDay(dayId);
        }

        setPageState('complete');
      }
    },
    [dayId, taskQueue, completedResults, completeTask, unlockNextDay, addXP, updateStreak, syncToFirestore, taskScores]
  );

  // Handle skip — move current task to end of queue, don't count it
  const handleSkip = useCallback(() => {
    if (taskQueue.length === 0) return;
    const [current, ...rest] = taskQueue;
    if (!current) return;

    // Only allow skipping if there are other tasks remaining
    if (rest.length === 0) {
      // Last task — can't skip, must answer
      return;
    }

    // Track skipped so we can show indicator
    setSkippedIds((prev) => new Set(prev).add(current.id));

    // Move current to end of queue
    setTaskQueue([...rest, current]);
  }, [taskQueue]);

  // Progress calculation — use fixed initial count
  const totalTasks = initialTaskCount;
  const completedCount = completedResults.length;
  const progressPercent = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;

  // Current task — head of queue
  const currentTask = taskQueue[0] ?? null;
  const isSkipped = currentTask ? skippedIds.has(currentTask.id) : false;

  // --- RENDER STATES ---

  // Loading skeleton
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4 animate-pulse">
          {/* Progress bar skeleton */}
          <div className="h-2 bg-slate-700 rounded-full w-full" />
          {/* Title skeleton */}
          <div className="h-6 bg-slate-700 rounded w-3/4 mx-auto" />
          {/* Task area skeleton */}
          <div className="space-y-3 mt-8">
            <div className="h-16 bg-slate-700/60 rounded-xl" />
            <div className="h-12 bg-slate-700/40 rounded-xl" />
            <div className="h-12 bg-slate-700/40 rounded-xl" />
            <div className="h-12 bg-slate-700/40 rounded-xl" />
            <div className="h-12 bg-slate-700/40 rounded-xl" />
          </div>
        </div>
        <p className="text-slate-400 text-sm mt-6">Загрузка урока...</p>
      </div>
    );
  }

  // Error state
  if (pageState === 'error') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <span className="text-4xl mb-4 block" aria-hidden="true">
            ⚠️
          </span>
          <h1 className="text-xl font-bold text-white mb-2">Ошибка загрузки</h1>
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            {errorMessage}
          </p>
          <button
            onClick={loadContent}
            className="min-h-[44px] px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            aria-label="Повторить загрузку"
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  // Day complete state
  if (pageState === 'complete') {
    const passed = meanScore >= 70;

    const handleRetry = () => {
      setTaskQueue(dayContent ? [...dayContent.tasks] : []);
      setCompletedResults([]);
      setSkippedIds(new Set());
      setTotalXPEarned(0);
      setMeanScore(0);
      setPageState('active');
    };

    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-center max-w-md"
        >
          <span className="text-5xl mb-4 block" aria-hidden="true">
            {passed ? '🎉' : '📋'}
          </span>
          <h1 className="text-2xl font-bold text-white mb-2">
            День завершён!
          </h1>
          <p className="text-slate-300 text-base mb-2">
            {dayContent?.title}
          </p>
          <div className="mt-4 mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
            <p className="text-sm text-slate-400 mb-1">Средний балл</p>
            <p
              className={`text-3xl font-bold ${
                passed ? 'text-green-400' : 'text-amber-400'
              }`}
            >
              {Math.round(meanScore)}%
            </p>
            <p className="text-sm text-slate-400 mt-1">
              {completedCount} из {totalTasks} заданий
            </p>
            {totalXPEarned > 0 && (
              <p className="text-sm text-cyan-400 mt-2 font-medium">
                +{totalXPEarned} XP
              </p>
            )}
            {passed && (
              <p className="text-xs text-green-400 mt-2">
                ✓ Следующий день разблокирован
              </p>
            )}
            {!passed && (
              <p className="text-xs text-amber-400 mt-2">
                Нужно ≥ 70% для разблокировки следующего дня
              </p>
            )}
          </div>

          {!passed && (
            <button
              onClick={handleRetry}
              className="w-full min-h-[44px] px-6 py-3 mb-3 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold rounded-xl transition-colors hover:bg-amber-500/30 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-label="Попробовать пройти день снова"
            >
              Попробуйте снова
            </button>
          )}

          <button
            onClick={() => navigate('/map')}
            className="w-full min-h-[44px] px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            aria-label="Вернуться к карте прогресса"
          >
            Вернуться к карте
          </button>
        </motion.div>
      </div>
    );
  }

  // Active lesson state
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Progress integrated into header area - minimal space */}
      <div className="shrink-0 px-4 py-1 flex items-center gap-2 border-b border-white/5">
        <span className="text-[10px] text-slate-400 truncate flex-1">{dayContent?.title}</span>
        <div className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-cyan-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-[10px] text-slate-400">{completedCount}/{totalTasks}</span>
        <button
          onClick={() => navigate('/glossary')}
          className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 hover:bg-cyan-500/20 transition-colors"
          aria-label="Открыть словарь терминов"
          title="Непонятен термин? Открыть словарь"
        >
          <span>📖</span>
          <span>Словарь</span>
        </button>
      </div>

      {/* Task area — smooth vertical scroll when needed */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 lg:px-8 pb-2 lg:pb-4" style={{ WebkitOverflowScrolling: 'touch', scrollBehavior: 'smooth' }}>
        <AnimatePresence mode="wait">
          {currentTask && (
            <motion.div
              key={currentTask.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg lg:max-w-2xl mx-auto"
            >
              {/* Skipped badge — shown when this task was previously skipped */}
              {isSkipped && (
                <div className="flex items-center justify-center gap-1.5 mb-3">
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                    ↩ Возвращённый вопрос
                  </span>
                </div>
              )}
              <TaskRenderer
                task={currentTask}
                onComplete={handleTaskComplete}
                onSkip={taskQueue.length > 1 ? handleSkip : undefined}
                isRetry={false}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
