import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { loadExamPool } from '../services/content-loader';
import { selectMiniExamQuestions, selectFinalExamQuestions, evaluateExam, canRetakeExam, getModulesForWeek } from '../logic/exam';
import { useProgressStore } from '../store/useProgressStore';
import type { ExamQuestion } from '../types/progress';
import type { QuizData } from '../types/index';

// === Types ===
type ExamPhase = 'loading' | 'cooldown' | 'ready' | 'in-progress' | 'results';

interface ExamResults {
  score: number;
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
  topicBreakdown: Record<number, { correct: number; total: number }>;
  timeSpent: number;
}

interface SavedExamSession {
  examType: 'mini' | 'final';
  weekId?: number;
  questions: ExamQuestion[];
  answers: Record<string, number>;
  currentIndex: number;
  remainingSeconds: number;
}

// === Constants ===
const SESSION_STORAGE_KEY = 'dispatch-academy-exam-session';

// === Helpers ===
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function generateCertificateId(): string {
  return `DA-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
}

function saveExamSession(session: SavedExamSession): void {
  try { localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session)); } catch { /* quota */ }
}

function loadExamSession(): SavedExamSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedExamSession) : null;
  } catch { return null; }
}

function clearExamSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

// === Celebration Confetti (3 seconds for final exam pass) ===
function CelebrationConfetti() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(t);
  }, []);
  if (!visible) return null;
  const colors = ['#22c55e', '#eab308', '#3b82f6', '#ec4899', '#f97316', '#8b5cf6'];
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-sm"
          style={{ left: `${Math.random() * 100}%`, top: -20, backgroundColor: colors[i % 6] }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{ y: 900, rotate: Math.random() * 720 - 360, opacity: [1, 1, 0.8, 0], x: Math.random() * 200 - 100 }}
          transition={{ duration: 2.5 + Math.random() * 1.5, delay: Math.random() * 0.8, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
}

// === Main Component ===
export default function ExamPage() {
  const { weekId: weekIdParam } = useParams<{ weekId?: string }>();
  const navigate = useNavigate();

  // Determine mode from route: /exam/mini/:weekId vs /exam/final
  const isMini = weekIdParam !== undefined;
  const isFinal = !isMini;
  const weekId = isMini ? Number(weekIdParam) : undefined;
  const timeLimitMinutes = isMini ? 45 : 90;
  const passingScore = isMini ? 70 : 80;
  const xpReward = isMini ? 50 : 100;
  const cooldownMinutes = isMini ? 30 : 24 * 60;

  // Store
  const { miniExamCooldowns, finalExamCooldown, addXP, submitExam } = useProgressStore();

  // State
  const [phase, setPhase] = useState<ExamPhase>('loading');
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(timeLimitMinutes * 60);
  const [results, setResults] = useState<ExamResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);

  // Refs for stable access in callbacks
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submitCalledRef = useRef(false);
  const questionsRef = useRef(questions);
  const answersRef = useRef(answers);
  const currentIndexRef = useRef(currentIndex);
  const timeLeftRef = useRef(timeLeft);
  questionsRef.current = questions;
  answersRef.current = answers;
  currentIndexRef.current = currentIndex;
  timeLeftRef.current = timeLeft;

  // === Cooldown check ===
  const checkCooldown = useCallback((): boolean => {
    const lastAttempt = isMini && weekId !== undefined
      ? (miniExamCooldowns[weekId] ?? null)
      : finalExamCooldown;
    if (!lastAttempt) return true;
    const canRetake = canRetakeExam(lastAttempt, cooldownMinutes);
    if (!canRetake) {
      const endTime = new Date(lastAttempt).getTime() + cooldownMinutes * 60 * 1000;
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setCooldownRemaining(remaining);
    }
    return canRetake;
  }, [isMini, weekId, miniExamCooldowns, finalExamCooldown, cooldownMinutes]);

  // === Submit exam ===
  const handleSubmit = useCallback(() => {
    if (submitCalledRef.current) return;
    submitCalledRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);

    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
    let correctCount = 0;
    const topicBreakdown: Record<number, { correct: number; total: number }> = {};

    for (const question of questionsRef.current) {
      const moduleId = question.moduleSource;
      if (!topicBreakdown[moduleId]) topicBreakdown[moduleId] = { correct: 0, total: 0 };
      const entry = topicBreakdown[moduleId]!;
      entry.total++;
      const selectedAnswer = answersRef.current[question.id];
      if (selectedAnswer !== undefined) {
        const qData = question.data as QuizData;
        if (selectedAnswer === qData.correctIndex) {
          correctCount++;
          entry.correct++;
        }
      }
      // Unanswered = incorrect (requirement 8.6, 9.4)
    }

    const totalQuestions = questionsRef.current.length;
    const evalResult = evaluateExam(correctCount, totalQuestions, passingScore);
    const now = new Date().toISOString();

    // Set cooldown on failure
    if (!evalResult.passed) {
      if (isMini && weekId !== undefined) {
        useProgressStore.setState((state) => ({
          miniExamCooldowns: { ...state.miniExamCooldowns, [weekId]: now },
        }));
      } else {
        useProgressStore.setState({ finalExamCooldown: now });
      }
    }

    // Persist result
    submitExam(isMini ? 'mini' : 'final', evalResult.score, weekId);

    // Award XP & certificate on pass
    if (evalResult.passed) {
      addXP(xpReward, isMini ? 'mini-exam' : 'final-exam');
      if (isFinal) {
        useProgressStore.setState({ certificateId: generateCertificateId() });
        setShowConfetti(true);
      }
    }

    // Clear saved session
    clearExamSession();

    setResults({ score: evalResult.score, passed: evalResult.passed, correctCount, totalQuestions, topicBreakdown, timeSpent });
    setPhase('results');
  }, [passingScore, isMini, isFinal, weekId, submitExam, addXP, xpReward]);

  // === Start a fresh exam ===
  const startFresh = useCallback(async () => {
    setPhase('loading');
    setError(null);
    submitCalledRef.current = false;
    try {
      const pool = await loadExamPool(weekId);
      let selected: ExamQuestion[];
      if (isMini && weekId !== undefined) {
        selected = selectMiniExamQuestions(weekId, pool);
      } else {
        selected = selectFinalExamQuestions(pool);
      }
      if (selected.length === 0) { setError('Нет вопросов для экзамена.'); return; }
      setQuestions(selected);
      setAnswers({});
      setCurrentIndex(0);
      setTimeLeft(timeLimitMinutes * 60);
      startTimeRef.current = Date.now();
      setPhase('in-progress');
    } catch {
      setError('Не удалось загрузить вопросы экзамена.');
    }
  }, [weekId, isMini, timeLimitMinutes]);

  // === Resume interrupted session ===
  const resumeSession = useCallback((session: SavedExamSession) => {
    submitCalledRef.current = false;
    setQuestions(session.questions);
    setAnswers(session.answers);
    setCurrentIndex(session.currentIndex);
    setTimeLeft(session.remainingSeconds);
    startTimeRef.current = Date.now() - ((timeLimitMinutes * 60 - session.remainingSeconds) * 1000);
    setShowResumePrompt(false);
    setPhase('in-progress');
  }, [timeLimitMinutes]);

  // === Init: check cooldown, then check for interrupted session ===
  useEffect(() => {
    if (!checkCooldown()) { setPhase('cooldown'); return; }
    // Check for interrupted session
    const saved = loadExamSession();
    if (saved) {
      const matchesRoute = isFinal
        ? saved.examType === 'final'
        : saved.examType === 'mini' && saved.weekId === weekId;
      if (matchesRoute && saved.remainingSeconds > 0) {
        setShowResumePrompt(true);
        setPhase('ready');
        return;
      }
      clearExamSession();
    }
    setPhase('ready');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // === Countdown timer ===
  useEffect(() => {
    if (phase !== 'in-progress') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, handleSubmit]);

  // === Cooldown countdown ===
  useEffect(() => {
    if (phase !== 'cooldown') return;
    const interval = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) { clearInterval(interval); setPhase('ready'); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // === Session persistence: save on beforeunload ===
  useEffect(() => {
    const handler = () => {
      if (questionsRef.current.length > 0 && timeLeftRef.current > 0 && !submitCalledRef.current) {
        saveExamSession({
          examType: isFinal ? 'final' : 'mini',
          weekId,
          questions: questionsRef.current,
          answers: answersRef.current,
          currentIndex: currentIndexRef.current,
          remainingSeconds: timeLeftRef.current,
        });
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isFinal, weekId]);

  // === Auto-persist every 10 seconds during active exam ===
  useEffect(() => {
    if (phase !== 'in-progress') return;
    const interval = setInterval(() => {
      if (questionsRef.current.length > 0 && timeLeftRef.current > 0 && !submitCalledRef.current) {
        saveExamSession({
          examType: isFinal ? 'final' : 'mini',
          weekId,
          questions: questionsRef.current,
          answers: answersRef.current,
          currentIndex: currentIndexRef.current,
          remainingSeconds: timeLeftRef.current,
        });
      }
    }, 10_000);
    return () => clearInterval(interval);
  }, [phase, isFinal, weekId]);

  // === Cleanup timer on unmount ===
  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // === Event handlers ===
  const handleAnswer = useCallback((questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) setCurrentIndex((i) => i + 1);
  }, [currentIndex, questions.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  }, [currentIndex]);

  // ===================== RENDER =====================

  // Loading state
  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        {error ? (
          <div className="text-center p-6">
            <p className="text-red-400 text-base mb-4">{error}</p>
            <button onClick={startFresh} className="min-h-[44px] px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg transition-colors">
              Повторить
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-300 text-base">Загрузка вопросов...</p>
          </div>
        )}
      </div>
    );
  }

  // Cooldown state
  if (phase === 'cooldown') {
    const cooldownMin = Math.ceil(cooldownRemaining / 60);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">&#9203;</div>
          <h2 className="text-xl font-bold text-white mb-2">Период ожидания</h2>
          <p className="text-gray-300 text-base mb-4">
            {isMini
              ? 'Повторная попытка мини-экзамена доступна через 30 минут.'
              : 'Повторная попытка финального экзамена доступна через 24 часа.'}
          </p>
          <div className="bg-gray-800 rounded-xl p-4 mb-6">
            <p className="text-gray-400 text-sm mb-1">Осталось ждать</p>
            <p className="text-2xl font-bold text-cyan-400">
              {cooldownMin > 60 ? Math.floor(cooldownMin / 60) + 'ч ' + (cooldownMin % 60) + 'мин' : cooldownMin + ' мин'}
            </p>
          </div>
          <button onClick={() => navigate('/map')} className="min-h-[44px] px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors">
            Вернуться к карте
          </button>
        </div>
      </div>
    );
  }

  // Ready state (start screen with optional resume prompt)
  if (phase === 'ready') {
    const title = isFinal ? 'Итоговый экзамен' : `Мини-экзамен · Неделя ${weekId}`;
    const questionCount = isFinal ? 100 : 25;
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="text-center max-w-md w-full">
          <div className="text-5xl mb-4">{isFinal ? '🎓' : '📝'}</div>
          <h1 className="text-2xl font-bold text-white mb-3">{title}</h1>
          <div className="space-y-2 mb-6 text-gray-300 text-sm">
            <p>📋 {questionCount} вопросов</p>
            <p>⏱️ {timeLimitMinutes} минут</p>
            <p>✅ Порог прохождения: {passingScore}%</p>
          </div>

          {/* Resume prompt for interrupted session */}
          <AnimatePresence>
            {showResumePrompt && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-yellow-900/30 border border-yellow-500/30 rounded-xl p-4 mb-4"
              >
                <p className="text-yellow-200 text-sm font-medium mb-3">
                  Найдена прерванная сессия. Хотите продолжить?
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => { const s = loadExamSession(); if (s) resumeSession(s); }}
                    className="min-h-[44px] px-4 py-2 bg-yellow-600/30 border border-yellow-500/40 text-yellow-200 font-medium rounded-lg hover:bg-yellow-600/40 transition-colors text-sm"
                  >
                    Продолжить
                  </button>
                  <button
                    onClick={() => { clearExamSession(); setShowResumePrompt(false); }}
                    className="min-h-[44px] px-4 py-2 bg-gray-700 border border-gray-600 text-gray-300 font-medium rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    Начать заново
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!showResumePrompt && (
            <button onClick={startFresh} className="min-h-[44px] px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-base rounded-lg transition-colors">
              Начать экзамен
            </button>
          )}
        </div>
      </div>
    );
  }

  // Results state
  if (phase === 'results' && results) {
    const weekModules = isMini && weekId ? getModulesForWeek(weekId) : [];
    const weakTopics = Object.entries(results.topicBreakdown)
      .filter(([, d]) => d.total > 0 && Math.round((d.correct / d.total) * 100) < 70)
      .map(([m]) => Number(m));

    return (
      <div className="h-full p-3 overflow-y-auto">
        {showConfetti && <CelebrationConfetti />}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="w-full max-w-lg">
          {results.passed ? (
            <div className="bg-gray-800 rounded-2xl p-6 text-center border border-green-500/30">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10, delay: 0.1 }} className="text-6xl mb-4">
                {isFinal ? '🎓' : '🎉'}
              </motion.div>
              <h2 className="text-2xl font-bold text-green-400 mb-2">
                {isFinal ? 'Финальный экзамен сдан!' : 'Мини-экзамен сдан!'}
              </h2>
              <p className="text-white text-lg mb-4">Результат: <span className="font-bold text-green-400">{results.score}%</span></p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Правильных</p>
                  <p className="text-lg font-bold text-white">{results.correctCount}/{results.totalQuestions}</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Время</p>
                  <p className="text-lg font-bold text-white">{formatTime(results.timeSpent)}</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-3">
                  <p className="text-xs text-gray-400">XP</p>
                  <p className="text-lg font-bold text-cyan-400">+{xpReward}</p>
                </div>
              </div>
              {isFinal && (
                <button onClick={() => navigate('/certificate')} className="min-h-[44px] w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors text-base mb-3">
                  Посмотреть сертификат
                </button>
              )}
              <button onClick={() => navigate('/map')} className="min-h-[44px] w-full px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors text-base">
                Продолжить обучение
              </button>
            </div>

          ) : (
            <div className="bg-gray-800 rounded-xl p-4 border border-red-500/30">
              <div className="text-center mb-3">
                <h2 className="text-lg font-bold text-red-400 mb-1">Не пройдено — {results.score}%</h2>
                <p className="text-gray-300 text-xs">
                  Необходимо {passingScore}% для прохождения. Правильных: {results.correctCount}/{results.totalQuestions}
                </p>
              </div>
              {/* Per-module breakdown */}
              <div className="mb-3">
                <h3 className="text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Результаты по модулям</h3>
                <div className="space-y-1.5">
                  {(isMini ? weekModules : Array.from({ length: 12 }, (_, i) => i + 1))
                    .filter((mid) => results.topicBreakdown[mid] !== undefined)
                    .map((mid) => {
                      const d = results.topicBreakdown[mid]!;
                      const pct = d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0;
                      const weak = pct < 70;
                      return (
                        <div key={mid} className="flex items-center gap-3 bg-gray-700/50 rounded-lg px-3 py-2">
                          <span className="text-sm text-gray-300 w-20 shrink-0">Модуль {mid}</span>
                          <div className="flex-1 h-2 bg-gray-600 rounded-full overflow-hidden">
                            <div className={'h-full rounded-full ' + (weak ? 'bg-red-500' : 'bg-green-500')} style={{ width: pct + '%' }} />
                          </div>
                          <span className={'text-sm font-semibold ' + (weak ? 'text-red-400' : 'text-green-400')}>
                            {d.correct}/{d.total}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
              {/* Weak areas */}
              {weakTopics.length > 0 && (
                <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-2 mb-2">
                  <p className="text-xs font-semibold text-red-400 mb-0.5">Зоны для повторения:</p>
                  <p className="text-xs text-gray-300">{weakTopics.map((m) => 'Модуль ' + m).join(', ')}</p>
                </div>
              )}
              <div className="bg-gray-700/50 rounded-lg p-2 mb-3 text-center">
                <p className="text-xs text-gray-300">
                  ⏳ Повтор через <span className="text-cyan-400 font-semibold">{isFinal ? '24 часа' : '30 минут'}</span>
                </p>
              </div>
              <button onClick={() => navigate('/map')} className="min-h-[40px] w-full px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg transition-colors text-sm">
                Вернуться к карте
              </button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // In-progress: active exam view
  const currentQuestion = questions[currentIndex];
  const quizData = currentQuestion ? (currentQuestion.data as QuizData) : undefined;
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const answeredCount = Object.keys(answers).length;
  const progressPct = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const isTimeLow = timeLeft <= 60;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header: timer + progress */}
      <div className="shrink-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 px-4 py-2">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-300 font-medium">
              {isFinal ? 'Итоговый экзамен' : `Мини-экзамен · Неделя ${weekId}`}
            </span>
            <div
              className={'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ' + (isTimeLow ? 'bg-red-900/50 text-red-400 animate-pulse' : 'bg-gray-700 text-white')}
              aria-live="polite"
              aria-label={'Осталось: ' + formatTime(timeLeft)}
            >
              <span aria-hidden="true">⏱️</span>
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden" role="progressbar" aria-valuenow={currentIndex + 1} aria-valuemin={1} aria-valuemax={questions.length}>
              <motion.div className="h-full bg-cyan-500 rounded-full" initial={{ width: 0 }} animate={{ width: progressPct + '%' }} transition={{ duration: 0.2 }} />
            </div>
            <span className="text-xs font-semibold text-gray-300 whitespace-nowrap">{currentIndex + 1}/{questions.length}</span>
          </div>
        </div>
      </div>

      {/* Question area — scrollable */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-4 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion?.id ?? currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg"
          >
            {quizData && currentQuestion && (
              <>
                <h2 className="text-white font-bold text-base md:text-lg leading-relaxed mb-6">{quizData.question}</h2>
                <div className="flex flex-col gap-3" role="radiogroup" aria-label="Варианты ответа">
                  {quizData.options?.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleAnswer(currentQuestion.id, index)}
                        aria-pressed={isSelected}
                        className={'min-h-[44px] w-full px-4 py-3 rounded-lg text-left text-[14px] md:text-[15px] leading-snug transition-all duration-150 ' +
                          (isSelected ? 'bg-cyan-600 text-white ring-2 ring-cyan-400' : 'bg-gray-700 hover:bg-gray-600 text-white')}
                      >
                        <span className="flex items-center gap-3">
                          <span className={'w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold ' +
                            (isSelected ? 'border-white bg-white text-cyan-600' : 'border-gray-500 text-gray-400')}>
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span>{option}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom navigation bar */}
      <div className="shrink-0 bg-gray-900/95 border-t border-gray-700 px-4 py-2">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="min-h-[44px] px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
          >
            ← Назад
          </button>
          <span className="text-sm text-gray-400">
            Отвечено: <span className="text-cyan-400 font-semibold">{answeredCount}</span>/{questions.length}
          </span>
          {currentIndex < questions.length - 1 ? (
            <button onClick={handleNext} className="min-h-[44px] px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors text-sm font-bold">
              Далее →
            </button>
          ) : (
            <button onClick={handleSubmit} className="min-h-[44px] px-5 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors text-sm font-bold">
              Завершить
            </button>
          )}
        </div>
      </div>
    </div>
  );
}