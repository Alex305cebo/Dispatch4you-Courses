import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadFlashcards } from '../services/content-loader';
import { useProgressStore } from '../store/useProgressStore';
import { calculateSM2 } from '../logic/sm2';
import { getDueCards, getNextReviewDate } from '../logic/flashcard-filter';
import type { Flashcard } from '../types/index';
import type { FlashcardReviewState, SM2Rating } from '../types/progress';

type PageState = 'loading' | 'error' | 'review' | 'done';
type DifficultyRating = 'again' | 'hard' | 'good' | 'easy';

interface CardDifficultyState {
  cardId: string;
  level: number; // 1-10 difficulty levels
  correctStreak: number;
}

/** Returns today's date as YYYY-MM-DD */
function getToday(): string {
  return new Date().toISOString().split('T')[0]!;
}

/** Creates a default SM-2 state for a new card */
function createDefaultState(cardId: string): FlashcardReviewState {
  return {
    cardId,
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
    nextReviewDate: getToday(),
  };
}

/** Creates a default difficulty state for a new card */
function createDefaultDifficultyState(cardId: string): CardDifficultyState {
  return {
    cardId,
    level: 1,
    correctStreak: 0,
  };
}

/** Calculates XP reward based on difficulty level and rating */
function calculateXPReward(level: number, rating: DifficultyRating): number {
  const baseXP = level * 10;
  switch (rating) {
    case 'again':
      return Math.floor(baseXP * 0.2);
    case 'hard':
      return Math.floor(baseXP * 0.4);
    case 'good':
      return Math.floor(baseXP * 0.8);
    case 'easy':
      return baseXP;
    default:
      return 0;
  }
}

const ratingButtons: { rating: DifficultyRating; label: string; color: string }[] = [
  { rating: 'again', label: 'Снова', color: 'bg-red-500 hover:bg-red-400' },
  { rating: 'hard', label: 'Трудно', color: 'bg-orange-500 hover:bg-orange-400' },
  { rating: 'good', label: 'Хорошо', color: 'bg-green-500 hover:bg-green-400' },
  { rating: 'easy', label: 'Легко', color: 'bg-cyan-500 hover:bg-cyan-400' },
];

export default function FlashcardPage() {
  const flashcardStates = useProgressStore((s) => s.flashcardStates);
  const updateFlashcardState = useProgressStore((s) => s.updateFlashcardState);
  const { totalXP } = useProgressStore();
  const { addXP } = useProgressStore((s) => ({ addXP: s.addXP || (() => {}) }));

  const [pageState, setPageState] = useState<PageState>('loading');
  const [allCards, setAllCards] = useState<Flashcard[]>([]);
  const [dueQueue, setDueQueue] = useState<FlashcardReviewState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedToday, setReviewedToday] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [sessionXP, setSessionXP] = useState(0);
  const [difficultyStates, setDifficultyStates] = useState<Record<string, CardDifficultyState>>({});

  // Initialize states for cards that don't have one yet
  const initializeStates = useCallback(
    (cards: Flashcard[]): Record<string, FlashcardReviewState> => {
      const states = { ...flashcardStates };
      let hasNew = false;

      for (const card of cards) {
        if (!states[card.id]) {
          states[card.id] = createDefaultState(card.id);
          hasNew = true;
        }
      }

      // If we initialized new cards, persist them via store
      if (hasNew) {
        for (const card of cards) {
          if (!flashcardStates[card.id]) {
            // We'll handle initialization through the store set directly
            // For now collect them to build the due queue
          }
        }
      }

      return states;
    },
    [flashcardStates]
  );

  // Load flashcards
  const loadContent = useCallback(async () => {
    setPageState('loading');
    setErrorMessage('');
    try {
      const cards = await loadFlashcards();
      setAllCards(cards);

      const today = getToday();
      const states = initializeStates(cards);

      // Initialize difficulty states for all cards
      const difficulties: Record<string, CardDifficultyState> = {};
      for (const card of cards) {
        difficulties[card.id] = createDefaultDifficultyState(card.id);
      }
      setDifficultyStates(difficulties);

      // Build complete states array
      const allStates = cards.map((c) => states[c.id] ?? createDefaultState(c.id));
      const due = getDueCards(allStates, today);

      setDueQueue(due);
      setCurrentIndex(0);
      setIsFlipped(false);
      setSessionXP(0);
      setPageState(due.length > 0 ? 'review' : 'done');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Не удалось загрузить карточки. Попробуйте ещё раз.';
      setErrorMessage(message);
      setPageState('error');
    }
  }, [initializeStates]);

  useEffect(() => {
    loadContent();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Current due card info
  const currentDueCard = dueQueue[currentIndex] ?? null;
  const currentFlashcard = useMemo(
    () => allCards.find((c) => c.id === currentDueCard?.cardId) ?? null,
    [allCards, currentDueCard]
  );

  // Stats
  const remainingCount = dueQueue.length - currentIndex;
  const totalCards = allCards.length;
  const reviewedCards = Object.values(flashcardStates).filter((s) => s.lastRating).length;
  const retentionRate =
    totalCards > 0 ? Math.round((reviewedCards / totalCards) * 100) : 0;

  // Next review date for "done" screen
  const nextReview = useMemo(() => {
    if (allCards.length === 0) return null;
    const today = getToday();
    const allStates = allCards.map(
      (c) => flashcardStates[c.id] ?? createDefaultState(c.id)
    );
    return getNextReviewDate(allStates, today);
  }, [allCards, flashcardStates]);

  // Handle flip
  const handleFlip = useCallback(() => {
    setIsFlipped(true);
  }, []);

  // Handle rating with difficulty progression
  const handleRate = useCallback(
    (rating: DifficultyRating) => {
      if (!currentDueCard || !currentFlashcard) return;

      const today = getToday();
      const currentState =
        flashcardStates[currentDueCard.cardId] ?? createDefaultState(currentDueCard.cardId);
      const newState = calculateSM2(currentState, rating as SM2Rating, today);

      // Update the store
      useProgressStore.setState((state) => ({
        flashcardStates: {
          ...state.flashcardStates,
          [currentDueCard.cardId]: newState,
        },
      }));

      // Calculate XP reward
      const currentDifficulty = difficultyStates[currentDueCard.cardId] ?? createDefaultDifficultyState(currentDueCard.cardId);
      const xpReward = calculateXPReward(currentDifficulty.level, rating);

      // Update session XP and difficulty
      setSessionXP((prev) => prev + xpReward);
      
      // Update difficulty state based on rating
      const newDifficulty = { ...currentDifficulty };
      switch (rating) {
        case 'again':
          newDifficulty.level = Math.max(1, newDifficulty.level - 1);
          newDifficulty.correctStreak = 0;
          break;
        case 'hard':
          newDifficulty.correctStreak = 0;
          break;
        case 'good':
          newDifficulty.correctStreak += 1;
          if (newDifficulty.correctStreak >= 2 && newDifficulty.level < 10) {
            newDifficulty.level += 1;
            newDifficulty.correctStreak = 0;
          }
          break;
        case 'easy':
          newDifficulty.correctStreak += 2;
          if (newDifficulty.correctStreak >= 2 && newDifficulty.level < 10) {
            newDifficulty.level += 1;
            newDifficulty.correctStreak = 0;
          }
          break;
      }

      setDifficultyStates((prev) => ({
        ...prev,
        [currentDueCard.cardId]: newDifficulty,
      }));

      updateFlashcardState(currentDueCard.cardId, rating as SM2Rating);
      setReviewedToday((prev) => prev + 1);

      // Advance to next card
      const nextIndex = currentIndex + 1;
      if (nextIndex >= dueQueue.length) {
        setPageState('done');
      } else {
        setCurrentIndex(nextIndex);
        setIsFlipped(false);
      }
    },
    [currentDueCard, currentFlashcard, currentIndex, dueQueue.length, flashcardStates, difficultyStates, updateFlashcardState]
  );

  // --- RENDER STATES ---

  // Loading
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md space-y-4 animate-pulse">
          <div className="h-48 bg-slate-700/60 rounded-2xl" />
          <div className="h-6 bg-slate-700 rounded w-2/3 mx-auto" />
          <div className="flex gap-3 justify-center mt-4">
            <div className="h-11 w-20 bg-slate-700/40 rounded-xl" />
            <div className="h-11 w-20 bg-slate-700/40 rounded-xl" />
            <div className="h-11 w-20 bg-slate-700/40 rounded-xl" />
            <div className="h-11 w-20 bg-slate-700/40 rounded-xl" />
          </div>
        </div>
        <p className="text-slate-400 text-sm mt-6">Загрузка карточек...</p>
      </div>
    );
  }

  // Error
  if (pageState === 'error') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md">
          <span className="text-4xl mb-4 block" aria-hidden="true">⚠️</span>
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

  // Done — all cards reviewed
  if (pageState === 'done') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="text-center max-w-md"
        >
          <span className="text-5xl mb-4 block" aria-hidden="true">🎉</span>
          <h1 className="text-2xl font-bold text-white mb-2">
            Все карточки на сегодня повторены!
          </h1>
          <p className="text-slate-300 text-base mb-6">
            Отличная работа! Повторено сегодня: {reviewedToday}
          </p>

          {nextReview && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl mb-6">
              <p className="text-sm text-slate-400 mb-1">Следующее повторение</p>
              <p className="text-lg font-bold text-cyan-400">
                {new Date(nextReview + 'T00:00:00').toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
            </div>
          )}

          <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-slate-400">Повторено</p>
                <p className="text-lg font-bold text-white">{reviewedToday}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Всего карт</p>
                <p className="text-lg font-bold text-white">{totalCards}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Усвоение</p>
                <p className="text-lg font-bold text-green-400">{retentionRate}%</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Active review state
  const xpProgressPercent = Math.min(100, (sessionXP / 500) * 100); // 500 XP = full bar
  const currentDifficultyLevel = currentDueCard 
    ? difficultyStates[currentDueCard.cardId]?.level ?? 1 
    : 1;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Main XP Progress Bar - Distinctive Top Section */}
      <div className="bg-gradient-to-b from-slate-800/80 to-slate-900/40 border-b-2 border-cyan-500/30 px-4 py-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-white">Сессионный прогресс</h2>
            <span className="text-xs font-semibold text-cyan-400">+{sessionXP} / 500 XP</span>
          </div>
          <div className="relative w-full h-3 bg-slate-700/60 rounded-full overflow-hidden border border-cyan-500/20">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full shadow-lg shadow-cyan-500/50"
              animate={{ width: `${xpProgressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">Ответьте правильнее чтобы быстрее заполнить шкалу</p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-slate-900/95 backdrop-blur-sm border-b border-white/5 px-4 py-3">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-slate-400">Повторено</p>
                <p className="text-sm font-bold text-white">{reviewedToday}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400">Осталось</p>
                <p className="text-sm font-bold text-white">{remainingCount}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400">Уровень</p>
                <p className="text-sm font-bold text-yellow-400">{currentDifficultyLevel}/10</p>
              </div>
            </div>
            <span className="text-xs text-slate-500">
              {currentIndex + 1}/{dueQueue.length}
            </span>
          </div>
        </div>
      </div>

      {/* Card area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <AnimatePresence mode="wait">
          {currentFlashcard && (
            <motion.div
              key={currentFlashcard.id + (isFlipped ? '-back' : '-front')}
              initial={false}
              className="w-full max-w-md"
            >
              {/* Flashcard with flip animation */}
              <div
                className="relative w-full perspective-1000"
                style={{ perspective: '1000px' }}
              >
                <motion.div
                  className="w-full min-h-[280px] cursor-pointer"
                  onClick={!isFlipped ? handleFlip : undefined}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  style={{ transformStyle: 'preserve-3d' }}
                  role="button"
                  aria-label={
                    isFlipped
                      ? 'Карточка перевёрнута — определение'
                      : 'Нажмите чтобы перевернуть карточку'
                  }
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (!isFlipped) handleFlip();
                    }
                  }}
                >
                  {/* Front side */}
                  <div
                    className="absolute inset-0 w-full min-h-[280px] flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-800 to-slate-800/80 border border-white/10 rounded-2xl shadow-xl"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <p className="text-xs text-cyan-400 font-medium uppercase tracking-wide mb-2">
                      {currentFlashcard.category} • Уровень {currentDifficultyLevel}/10
                    </p>
                    <h2 className="text-2xl font-bold text-white text-center leading-snug">
                      {currentFlashcard.term}
                    </h2>
                    <p className="text-xs text-slate-500 mt-4 text-center">
                      Чем выше уровень, тем больше очков получишь
                    </p>
                    <p className="text-sm text-slate-400 mt-2">
                      Нажмите чтобы перевернуть
                    </p>
                  </div>

                  {/* Back side */}
                  <div
                    className="absolute inset-0 w-full min-h-[280px] flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-800 to-slate-700/80 border border-cyan-500/20 rounded-2xl shadow-xl"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <p className="text-base text-white text-center leading-relaxed mb-4">
                      {currentFlashcard.definition}
                    </p>
                    <div className="w-full border-t border-white/10 pt-3 mt-auto">
                      <p className="text-xs text-slate-400 mb-1">Пример:</p>
                      <p className="text-sm text-cyan-300 italic text-center">
                        "{currentFlashcard.example}"
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Rating buttons — shown only after flip */}
              <AnimatePresence>
                {isFlipped && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="grid grid-cols-2 gap-3 mt-8 w-full max-w-md"
                    role="group"
                    aria-label="Оценка знания карточки"
                  >
                    {ratingButtons.map(({ rating, label, color }) => {
                      const xpReward = calculateXPReward(currentDifficultyLevel, rating);
                      return (
                        <button
                          key={rating}
                          onClick={() => handleRate(rating)}
                          className={`min-h-[60px] px-4 py-4 ${color} text-white font-semibold rounded-xl transition-all text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-slate-900 hover:scale-105`}
                          aria-label={`Оценка: ${label} (+${xpReward} XP)`}
                        >
                          <div className="font-bold text-base">{label}</div>
                          <div className="text-xs opacity-90">+{xpReward} XP</div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
