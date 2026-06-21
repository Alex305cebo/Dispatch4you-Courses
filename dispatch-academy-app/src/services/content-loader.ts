import type { DayContent, Flashcard } from '../types/index';
import type { ExamQuestion } from '../types/progress';

/** Internal cache for loaded day content — avoids re-fetching */
const contentCache = new Map<number, DayContent>();

/** Timeout duration in milliseconds for content loading */
const LOAD_TIMEOUT_MS = 15_000;

/**
 * Lazily loads day content by dynamically importing the corresponding JSON file.
 * Results are cached for subsequent calls. Rejects with a user-facing error
 * if the import does not resolve within 15 seconds.
 *
 * @param dayId - Day number (1–23 for main levels, 101–111 for dream levels)
 * @returns Parsed DayContent object
 * @throws Error if dayId is invalid or load times out
 */
export async function loadDayContent(dayId: number): Promise<DayContent> {
  const isDream = dayId >= 101 && dayId <= 111;
  const isMain = dayId >= 1 && dayId <= 23;
  
  if (!isDream && !isMain) {
    throw new Error(`Invalid dayId: ${dayId}. Must be 1-23 or 101-111.`);
  }

  const cached = contentCache.get(dayId);
  if (cached) {
    return cached;
  }

  let importPromise: Promise<DayContent>;

  if (isDream) {
    const dreamNum = String(dayId - 100).padStart(2, '0');
    importPromise = import(`../data/lessons/dream-${dreamNum}.json`).then(
      (module) => module.default as DayContent
    );
  } else {
    const paddedId = String(dayId).padStart(2, '0');
    importPromise = import(`../data/lessons/day-${paddedId}.json`).then(
      (module) => module.default as DayContent
    );
  }

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(
        new Error(
          'Не удалось загрузить урок. Проверьте интернет и нажмите "Повторить".'
        )
      );
    }, LOAD_TIMEOUT_MS);
  });

  const content = await Promise.race([importPromise, timeoutPromise]);

  // Don't cache — each visit gets fresh shuffled order
  const shuffledContent = shuffleDayContent(content);
  return shuffledContent;
}

/**
 * Fisher-Yates shuffle (creates a new array).
 */
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

/**
 * Shuffles task order within a day and randomizes quiz answer options
 * so the correct answer appears in a random position each time.
 */
function shuffleDayContent(content: DayContent): DayContent {
  // Shuffle the order of tasks
  const shuffledTasks = shuffle(content.tasks).map((task) => {
    // For quiz tasks, shuffle the options and update correctIndex
    if (task.type === 'quiz') {
      const quizData = task.data as { question: string; options: string[]; correctIndex: number; explanation: string };
      const correctAnswer = quizData.options[quizData.correctIndex]!;
      const shuffledOptions = shuffle(quizData.options);
      const newCorrectIndex = shuffledOptions.indexOf(correctAnswer);

      return {
        ...task,
        data: {
          ...quizData,
          options: shuffledOptions,
          correctIndex: newCorrectIndex,
        },
      };
    }
    return task;
  });

  return { ...content, tasks: shuffledTasks };
}

/**
 * Pre-fetches the next day's content in the background at low priority.
 * Fire-and-forget — does not block and silently ignores failures.
 * Only triggers if currentDayId <= 19 (i.e., there is a next day).
 * Skips if the next day is already cached.
 *
 * @param currentDayId - The currently active day (1–19 to trigger prefetch)
 */
export function prefetchNextDay(currentDayId: number): void {
  if (currentDayId > 19) {
    return;
  }

  const nextDayId = currentDayId + 1;

  // Skip if already cached
  if (contentCache.has(nextDayId)) {
    return;
  }

  // Fire and forget — low priority background load
  void loadDayContent(nextDayId).catch(() => {
    // Silently ignore prefetch failures
  });
}

/**
 * Returns cached day content without triggering a load.
 *
 * @param dayId - Day number (1–20)
 * @returns The cached DayContent, or null if not yet loaded
 */
export function getCachedDay(dayId: number): DayContent | null {
  return contentCache.get(dayId) ?? null;
}

/**
 * Clears the content cache. Primarily used in testing.
 */
export function clearContentCache(): void {
  contentCache.clear();
}

/**
 * Lazily loads the flashcards dataset.
 *
 * @returns Array of Flashcard objects
 */
export async function loadFlashcards(): Promise<Flashcard[]> {
  const module = await import('../data/flashcards.json');
  return module.default as Flashcard[];
}

/**
 * Lazily loads an exam question pool.
 *
 * @param weekId - If provided (1–4), loads the mini-exam pool for that week.
 *                 If omitted, loads the final exam pool.
 * @returns Array of ExamQuestion objects
 */
export async function loadExamPool(weekId?: number): Promise<ExamQuestion[]> {
  if (weekId !== undefined) {
    const module = await import(`../data/exams/mini-exam-pool-week${weekId}.json`);
    return module.default as ExamQuestion[];
  }

  const module = await import('../data/exams/final-exam-pool.json');
  return module.default as ExamQuestion[];
}
