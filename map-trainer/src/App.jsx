import { useState, useCallback, useEffect, useRef } from "react";
import LevelMap     from "./components/LevelMap";
import LevelResult  from "./components/LevelResult";
import StateReference from "./components/StateReference";
import USAMap       from "./components/USAMap";
import QuizPanel    from "./components/QuizPanel";
import LoginScreen  from "./components/LoginScreen";
import ParticlesBackground from "./components/ParticlesBackground";
import { STATES }   from "./data/states";
import { LEVELS }   from "./data/levels";
import { buildQuestions, MAP_CLICK_MODES } from "./data/questionBuilder";
import { useTimer, useSessionTimer } from "./hooks/useTimer";
import { useStats }    from "./hooks/useStats";
import { useProgress, initProgress } from "./hooks/useProgress";
import { useAuth }     from "./hooks/useAuth";
import { useSounds }   from "./hooks/useSounds";
import { saveLevelRecord, getAllLevelRecords, clearAllLevelRecords } from "./firebase/progressService";

// ── Версия логики рекордов ────────────────────────────────────
// При изменении — все старые рекорды сбрасываются автоматически
const RECORDS_VERSION = "v2-accuracy"; // v1 = points, v2 = accuracy+time
const RECORDS_VERSION_KEY = "mt_records_version";

// ── Константы ────────────────────────────────────────────────
// points убраны — оценка только по точности и времени
// Штрафы ко времени рекорда (секунды)
const TIME_PENALTY = {
  wrong:   5,   // неправильный ответ
  skip:    5,   // пропуск
  timeout: 2,   // истекло время
  hint:    10,  // подсказка
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Компонент ────────────────────────────────────────────────
export default function App() {
  const { user, loading: authLoading, signIn, logOut } = useAuth();
  const { progress, syncing, completeLevel, resetProgress } = useProgress(user?.uid || null, user);
  const sounds = useSounds();

  // Экраны: "map" | "quiz" | "result"
  const [screen,        setScreen]        = useState("map");

  // Блокируем скролл body во время квиза
  useEffect(() => {
    if (screen === "quiz") {
      document.documentElement.classList.add("quiz-active");
    } else {
      document.documentElement.classList.remove("quiz-active");
    }
    return () => document.documentElement.classList.remove("quiz-active");
  }, [screen]);
  const [activeLevel,   setActiveLevel]   = useState(null);
  const [questions,     setQuestions]     = useState([]);
  const [currentIdx,    setCurrentIdx]    = useState(0);
  const [score,         setScore]         = useState(null);   // { correct, wrong, skipped }
  const [selectedState, setSelectedState] = useState(null);
  const [feedback,      setFeedback]      = useState(null);
  const [pointsDelta,   setPointsDelta]   = useState(null);   // анимация +XP / +сек
  const [hintUsed,      setHintUsed]      = useState(false);
  const [hintText,      setHintText]      = useState(null);
  const [hintCount,     setHintCount]     = useState(0);    // кол-во подсказок (для совместимости)
  const [timePenalty,   setTimePenalty]   = useState(0);    // суммарный штраф сек: ошибки + подсказки + пропуски
  const [hoveredTz,     setHoveredTz]     = useState(null);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [xpEarned,      setXpEarned]      = useState(0);
  const [correctTz,     setCorrectTz]     = useState(null);
  const [correctRegion, setCorrectRegion] = useState(null);
  const [streak,        setStreak]        = useState(0);
  const [answeredStates, setAnsweredStates] = useState({}); // {stateId: "correct"|"wrong"}
  const [shakePanel,    setShakePanel]    = useState(false);
  const [quizReady,     setQuizReady]     = useState(false);

  const { weakStates, recordResult, reset: resetStats } = useStats();

  // ── Сброс рекордов при смене версии логики ──
  useEffect(() => {
    const storedVersion = localStorage.getItem(RECORDS_VERSION_KEY);
    if (storedVersion !== RECORDS_VERSION) {
      clearAllLevelRecords().then(() => {
        localStorage.setItem(RECORDS_VERSION_KEY, RECORDS_VERSION);
        console.log("[mapTrainer] Рекорды сброшены — новая версия логики:", RECORDS_VERSION);
      });
    }
  }, []); // eslint-disable-line

  const currentQuestion = questions[currentIdx];
  // accuracy — процент правильных из отвеченных (для XP и разблокировки)
  const answeredCount = score ? (score.correct + score.wrong) : 0;
  const accuracy = answeredCount > 0 ? Math.round((score.correct / answeredCount) * 100) : 100;

  // ── Секундомер сессии ──
  const sessionTimer = useSessionTimer();
  const [sessionTime, setSessionTime] = useState(0);
  const [levelRecord, setLevelRecord] = useState(null); // рекорд текущего уровня

  // ── Анимация дельты ──
  // value: число (XP бонус за стрик) или null, isTimePenalty: true для +сек подсказки
  const showDelta = useCallback((value, isTimePenalty = false) => {
    if (value === null || value === undefined) return;
    setPointsDelta({ value, key: Date.now(), isTimePenalty });
    setTimeout(() => setPointsDelta(null), 1200);
  }, []);

  // ── Таймер на вопрос ──
  // Используем ref чтобы избежать TDZ (timer объявляется после handleTimeout)
  const timerRef = useRef(null);

  // При истечении времени — НЕ засчитываем ошибку, а показываем подсказку
  // и даём дополнительное время (половина от оригинального)
  const handleTimeout = useCallback(() => {
    if (feedback) return;
    if (hintUsed) {
      // Если подсказка уже была показана ранее — засчитываем как пропуск
      sounds.wrong();
      const mode = activeLevel?.mode;
      const timeoutMsg = mode === "find-city"
        ? `⏱ Время вышло! ${currentQuestion?.cityName} → ${STATES.find(s => s.id === currentQuestion?.stateId)?.name}`
        : `⏱ Время вышло! Правильный ответ: ${currentQuestion?.stateName || currentQuestion?.cityName}`;
      setFeedback({ correct: false, selectedAnswer: null, message: timeoutMsg });
      setSelectedState("__timeout__");
      setScore((prev) => ({ ...prev, wrong: prev.wrong + 1, skipped: prev.skipped + 1 }));
      setTimePenalty((prev) => prev + TIME_PENALTY.timeout);
      showDelta(TIME_PENALTY.timeout, true);
      if (currentQuestion) recordResult(currentQuestion.stateId, currentQuestion.stateName, false);
      return;
    }
    // Первый таймаут — показываем подсказку + штраф + перезапускаем таймер
    sounds.wrong();
    setHintUsed(true);
    setHintText(currentQuestion?.hintText);
    setTimePenalty((prev) => prev + TIME_PENALTY.timeout);
    showDelta(TIME_PENALTY.timeout, true);
    // Перезапускаем таймер на половину оригинального времени (минимум 5с)
    const extraTime = Math.max(5, Math.floor((activeLevel?.timePerQ || 10) / 2));
    setTimeout(() => timerRef.current?.startWith(extraTime), 0);
  }, [feedback, hintUsed, currentQuestion, activeLevel, sounds, showDelta, recordResult]); // eslint-disable-line

  const timer = useTimer(activeLevel?.timePerQ || null, handleTimeout);
  timerRef.current = timer;

  // ── Старт уровня ──
  const startLevel = useCallback((level, questionCount) => {
    const count = questionCount || level.questions;
    const qs = buildQuestions(level.mode, count);
    const initScore = { correct: 0, wrong: 0, skipped: 0 }; // points убраны
    // Создаём копию уровня с выбранным количеством вопросов
    const activeLvl = { ...level, questions: count };
    setActiveLevel(activeLvl);
    setQuestions(qs);
    setCurrentIdx(0);
    setScore(initScore);
    setSelectedState(null);
    setFeedback(null);
    setPointsDelta(null);
    setHintUsed(false);
    setHintText(null);
    setHintCount(0);
    setTimePenalty(0);
    setHoveredTz(null);
    setHoveredRegion(null);
    setStreak(0);
    setAnsweredStates({});
    setShakePanel(false);
    setQuizReady(true);
    setSessionTime(0);
    setLevelRecord(null);
    resetStats();
    // Секундомер сессии — запустится при первом вопросе
    sessionTimer.reset();
    setScreen("quiz");
    // Загружаем рекорды этого уровня для всех сложностей
    getAllLevelRecords().then((records) => {
      setLevelRecord(records);
    }).catch(() => {});

    // Сохраняем сессию квиза в sessionStorage для восстановления при рефреше
    try {
      sessionStorage.setItem('mt_quiz_session', JSON.stringify({
        levelId: level.id,
        questionCount: count,
        timestamp: Date.now(),
      }));
    } catch {}
  }, [resetStats]);

  // Запуск таймера при смене вопроса (только если quizReady)
  useEffect(() => {
    if (screen === "quiz" && currentQuestion && quizReady) {
      // Запускаем секундомер сессии при первом вопросе
      if (!sessionTimer.running) sessionTimer.start();
      // Таймер на вопрос
      if (activeLevel?.timePerQ) timer.start();
      setHintUsed(false);
      setHintText(null);
      setHoveredTz(null);
      setHoveredRegion(null);
    }
  }, [currentIdx, screen, quizReady]); // eslint-disable-line

  // ── Восстановление сессии квиза после рефреша ──
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('mt_quiz_session');
      if (!saved) return;
      const session = JSON.parse(saved);
      // Восстанавливаем только если сессия свежая (< 10 минут)
      if (Date.now() - session.timestamp > 10 * 60 * 1000) {
        sessionStorage.removeItem('mt_quiz_session');
        return;
      }
      const level = LEVELS.find((l) => l.id === session.levelId);
      if (level && screen === 'map') {
        startLevel(level, session.questionCount);
      }
    } catch {}
  }, []); // eslint-disable-line

  // ── Предупреждение при рефреше во время квиза ──
  useEffect(() => {
    function handleBeforeUnload(e) {
      if (screen === 'quiz') {
        e.preventDefault();
        e.returnValue = 'Вы потеряете прогресс текущего уровня. Уверены?';
        return e.returnValue;
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [screen]);

  // Очищаем сессию при завершении уровня
  useEffect(() => {
    if (screen === 'result' || screen === 'map') {
      try { sessionStorage.removeItem('mt_quiz_session'); } catch {}
    }
  }, [screen]);

  // ── Обработка ответа ──
  const processAnswer = useCallback((correct, selectedAnswer) => {
    timer.stop();

    // Streak логика
    const newStreak = correct ? streak + 1 : 0;
    setStreak(newStreak);

    // Бонус XP за стрик — только визуальная анимация
    const streakBonus = correct && newStreak >= 3;
    if (streakBonus) showDelta(newStreak >= 5 ? "+2 XP" : "+1 XP");

    correct ? sounds.correct() : sounds.wrong();

    // Штраф ко времени за ошибку
    if (!correct) {
      setTimePenalty((prev) => prev + TIME_PENALTY.wrong);
      showDelta(TIME_PENALTY.wrong, true);
    }

    // Shake при ошибке
    if (!correct) {
      setShakePanel(true);
      setTimeout(() => setShakePanel(false), 500);
    }

    // Запоминаем ответ на карте
    if (currentQuestion?.stateId) {
      setAnsweredStates(prev => ({
        ...prev,
        [currentQuestion.stateId]: correct ? "correct" : "wrong",
      }));
    }

    setSelectedState(selectedAnswer);

    // Подсветка правильного региона/зоны
    const mode = activeLevel?.mode;
    if (mode === "timezone") {
      setCorrectTz(currentQuestion.tz);
    } else if (mode === "region" || mode === "regions-intro") {
      setCorrectRegion(currentQuestion.region);
    }

    setFeedback({
      correct,
      selectedAnswer,
      streak: newStreak,
      message: correct
        ? (newStreak >= 5 ? "🔥 ОГОНЬ! Стрик ×5!" : newStreak >= 3 ? `🔥 ${newStreak} подряд!` : buildCorrectMsg(currentQuestion))
        : buildWrongMsg(currentQuestion),
    });
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      wrong:   prev.wrong   + (correct ? 0 : 1),
      skipped: prev.skipped,
    }));
    recordResult(currentQuestion.stateId, currentQuestion.stateName, correct);
  }, [timer, currentQuestion, activeLevel, showDelta, recordResult, streak, sounds]);

  // ── Клик по штату на карте ──
  const handleStateClick = useCallback((stateId) => {
    if (feedback) return;
    const mode = activeLevel?.mode;

    if (mode === "find-state" || (mode === "green-map" && currentQuestion?._mode === "find-state") || (mode === "speed-run" && currentQuestion?._mode === "find-state")) {
      setSelectedState(stateId);
      const correct = stateId === currentQuestion.stateId;
      const clickedState = STATES.find((s) => s.id === stateId);
      timer.stop();
      correct ? sounds.correct() : sounds.wrong();
      if (!correct) { setShakePanel(true); setTimeout(() => setShakePanel(false), 500); }
      setAnsweredStates(prev => ({
        ...prev,
        [currentQuestion.stateId]: correct ? "correct" : "wrong",
      }));
      setFeedback({
        correct,
        selectedAnswer: stateId,
        message: correct
          ? buildCorrectMsg(currentQuestion)
          : `Это ${clickedState?.name || stateId}. Правильный: ${currentQuestion.stateName}`,
      });
      setScore((prev) => ({
        correct: prev.correct + (correct ? 1 : 0),
        wrong:   prev.wrong   + (correct ? 0 : 1),
        skipped: prev.skipped,
      }));
      if (!correct) { setTimePenalty((prev) => prev + TIME_PENALTY.wrong); showDelta(TIME_PENALTY.wrong, true); }
      recordResult(currentQuestion.stateId, currentQuestion.stateName, correct);
      return;
    }

    if (mode === "find-city") {
      setSelectedState(stateId);
      const correct = stateId === currentQuestion.stateId;
      const clickedState = STATES.find((s) => s.id === stateId);
      const correctStateName = STATES.find((s) => s.id === currentQuestion.stateId)?.name || currentQuestion.stateId;
      timer.stop();
      correct ? sounds.correct() : sounds.wrong();
      if (!correct) { setShakePanel(true); setTimeout(() => setShakePanel(false), 500); }
      setAnsweredStates(prev => ({
        ...prev,
        [currentQuestion.stateId]: correct ? "correct" : "wrong",
      }));
      setFeedback({
        correct,
        selectedAnswer: stateId,
        message: correct
          ? `✓ Верно! ${currentQuestion.cityName} — это штат ${correctStateName}.`
          : `Это ${clickedState?.name || stateId}. ${currentQuestion.cityName} находится в штате ${correctStateName}.`,
      });
      setScore((prev) => ({
        correct: prev.correct + (correct ? 1 : 0),
        wrong:   prev.wrong   + (correct ? 0 : 1),
        skipped: prev.skipped,
      }));
      if (!correct) { setTimePenalty((prev) => prev + TIME_PENALTY.wrong); showDelta(TIME_PENALTY.wrong, true); }
      recordResult(currentQuestion.stateId, currentQuestion.cityName, correct);
      return;
    }
  }, [feedback, activeLevel, currentQuestion, hintUsed, timer, showDelta, recordResult, sounds]);

  // ── Выбор варианта ──
  const handleOptionSelect = useCallback((value) => {
    if (feedback) return;
    const correct = value === currentQuestion.correctAnswer;
    processAnswer(correct, value);
  }, [feedback, currentQuestion, processAnswer]);

  // ── Подсказка ──
  // На всех уровнях: штраф = +10с к рекорду (очков нет)
  const HINT_TIME_PENALTY = TIME_PENALTY.hint;
  const handleHint = useCallback(() => {
    if (hintUsed || feedback) return;
    setHintUsed(true);
    setHintText(currentQuestion?.hintText);
    setHintCount((prev) => prev + 1);
    setTimePenalty((prev) => prev + TIME_PENALTY.hint);
    showDelta(TIME_PENALTY.hint, true);
  }, [hintUsed, feedback, currentQuestion, showDelta]);

  // ── Пропустить ──
  const handleSkip = useCallback(() => {
    if (feedback) return;
    timer.stop();
    sounds.wrong();
    setFeedback({
      correct: false,
      selectedAnswer: null,
      message: `Пропущено. Правильный ответ: ${currentQuestion.stateName || currentQuestion.cityName}`,
    });
    setSelectedState("__skip__");
    setScore((prev) => ({
      ...prev,
      wrong: prev.wrong + 1,
      skipped: prev.skipped + 1,
    }));
    setTimePenalty((prev) => prev + TIME_PENALTY.skip);
    showDelta(TIME_PENALTY.skip, true);
    recordResult(currentQuestion.stateId, currentQuestion.stateName, false);
  }, [feedback, currentQuestion, timer, sounds, recordResult, showDelta]);

  // ── Следующий вопрос ──
  const handleNext = useCallback(() => {
    if (currentIdx + 1 >= activeLevel.questions) {
      timer.stop();
      const elapsed = sessionTimer.startTimeRef
        ? Math.floor((Date.now() - sessionTimer.startTimeRef) / 1000)
        : sessionTimer.elapsed;
      sessionTimer.stop();
      setSessionTime(elapsed);
      sounds.levelComplete();

      const finalScore = score;
      const totalAnswered = finalScore.correct + finalScore.wrong;
      // Точность = % правильных из всех отвеченных (пропуски — ошибки)
      const acc = totalAnswered > 0
        ? Math.round((finalScore.correct / activeLevel.questions) * 100)
        : 0;

      // XP по точности
      const xpMultiplier = activeLevel.questions >= 50 ? 1.5 : activeLevel.questions <= 15 ? 0.6 : 1.0;
      const earned = Math.round((activeLevel.xpReward * acc * xpMultiplier) / 100);
      setXpEarned(earned);

      // Разблокировка по точности (unlockPct теперь = % правильных из всех вопросов)
      completeLevel(activeLevel.id, acc, finalScore.correct, earned);

      // Рекорд по времени — суммарный штраф: ошибки + пропуски + таймауты + подсказки
      const elapsedWithPenalty = elapsed + timePenalty;
      if (acc >= activeLevel.unlockPct && user?.uid && elapsed > 0) {
        saveLevelRecord(user.uid, user, activeLevel.id, activeLevel.questions, elapsedWithPenalty);
      }
      setScreen("result");
      return;
    }
    setCurrentIdx((i) => i + 1);
    setSelectedState(null);
    setFeedback(null);
    setCorrectTz(null);
    setCorrectRegion(null);
  }, [currentIdx, activeLevel, score, timer, sessionTimer, completeLevel, user, timePenalty, sounds]);

  // ── Рестарт уровня ──
  const handleRestart = useCallback(() => {
    startLevel(activeLevel);
  }, [activeLevel, startLevel]);

  // ── Следующий уровень ──
  const handleNextLevel = useCallback(() => {
    const nextLevel = LEVELS.find((l) => l.id === activeLevel.id + 1);
    if (nextLevel) startLevel(nextLevel);
    else setScreen("map");
  }, [activeLevel, startLevel]);

  // ── Экраны ──
  if (authLoading) {
    // Пока Firebase проверяет сессию — показываем спиннер
    return (
      <div style={{
        height: "100dvh",
        background: "linear-gradient(160deg,#060d1a 0%,#0f172a 50%,#1a1040 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: "32px", height: "32px",
          border: "3px solid rgba(255,255,255,0.1)",
          borderTopColor: "#06b6d4",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    // Незарегистрированный пользователь видит карту уровней, но не может играть
    return (
      <LevelMap
        progress={initProgress()}
        user={null}
        syncing={false}
        onSelectLevel={() => {}}
        onOpenReference={() => {}}
        onLogOut={() => {}}
        onReset={() => {}}
        onSignIn={signIn}
        isGuest={true}
      />
    );
  }

  if (screen === "map") {
    return (
      <LevelMap
        progress={progress}
        user={user}
        syncing={syncing}
        onSelectLevel={startLevel}
        onOpenReference={() => setScreen("reference")}
        onLogOut={logOut}
        onReset={() => { if (confirm("Сбросить весь прогресс?")) resetProgress(); }}
        onSignIn={signIn}
        isGuest={false}
      />
    );
  }

  if (screen === "reference") {
    return <StateReference onBack={() => setScreen("map")} />;
  }

  if (screen === "result") {
    const nextLevel = LEVELS.find((l) => l.id === activeLevel.id + 1);
    const totalAnswered = score.correct + score.wrong;
    const acc = totalAnswered > 0
      ? Math.round((score.correct / activeLevel.questions) * 100)
      : 0;
    return (
      <LevelResult
        level={activeLevel}
        score={score}
        accuracy={acc}
        xpEarned={xpEarned}
        weakStates={weakStates}
        sessionTime={sessionTime}
        nextLevel={acc >= activeLevel.unlockPct ? nextLevel : null}
        onRestart={handleRestart}
        onNextLevel={handleNextLevel}
        onBackToMap={() => setScreen("map")}
      />
    );
  }

  // ── Квиз ──
  const mode = activeLevel?.mode;
  const needsMap = true;
  // Для green-map и speed-run — тип вопроса определяется per-question
  const questionMode = currentQuestion?._mode || mode;
  const isMapClick = MAP_CLICK_MODES.has(questionMode) || (mode === "green-map" && currentQuestion?._mode === "find-state") || (mode === "speed-run" && currentQuestion?._mode === "find-state");
  const highlightedState = feedback ? currentQuestion?.stateId : null;
  // markedState — подсвечиваем штат на карте ДО ответа только для name-state
  // Если подсказка активна — тоже подсвечиваем правильный штат (для find-state, find-city)
  // (там вопрос "как называется этот штат?" — нужно показать какой именно)
  // Для остальных режимов название штата написано в тексте — подсветка раскрывает ответ
  const markedState = (questionMode === "name-state")
    ? currentQuestion?.stateId
    : (hintUsed && (questionMode === "find-state" || questionMode === "find-city") && !feedback)
      ? currentQuestion?.stateId
      : null;

  return (
    <div style={{
      height: "100dvh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      background: "linear-gradient(160deg,#060d1a 0%,#0f172a 40%,#1a1040 100%)",
      padding: "8px 10px",
      boxSizing: "border-box",
      overflow: "hidden",
    }}>

    {/* Обёртка с max-width для центрирования */}
    <div style={{
      width: "100%",
      maxWidth: "680px",
      display: "flex",
      flexDirection: "column",
      flex: 1,
      minHeight: 0,
    }}>

      {/* ── Шапка ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "8px",
        flexShrink: 0,
        padding: "2px 0",
      }}>
        {/* Кнопка закрытия */}
        <button
          onClick={() => { timer.stop(); setScreen("map"); }}
          className="qb-icon-btn"
        >
          ✕
        </button>

        {/* Кнопка звука */}
        <button
          onClick={() => {
            const newVal = !sounds.enabled;
            sounds.setEnabled(newVal);
            setScore((s) => ({ ...s }));
          }}
          className="qb-icon-btn"
          title={sounds.enabled ? "Выключить звук" : "Включить звук"}
        >
          {sounds.enabled ? "🔊" : "🔇"}
        </button>

        {/* Прогресс-бар */}
        <div className="qb-progress-wrap">
          <div
            className="qb-progress-fill"
            style={{
              width: `${((currentIdx + (feedback ? 1 : 0)) / activeLevel?.questions) * 100}%`,
              background: `linear-gradient(90deg, ${activeLevel?.color}99, ${activeLevel?.color})`,
              boxShadow: `0 0 8px ${activeLevel?.color}55`,
            }}
          />
        </div>

        {/* Точность */}
        <div style={{
          display: "flex", alignItems: "center", gap: "4px",
          flexShrink: 0, position: "relative",
        }}>
          <span style={{
            fontSize: "13px", fontWeight: 800,
            color: accuracy > 60 ? activeLevel?.color : accuracy > 30 ? "#f97316" : "#ef4444",
          }}>
            {accuracy}%
          </span>
          {pointsDelta && (
            <div key={pointsDelta.key} style={{
              position: "absolute", top: "-18px", right: "0",
              fontSize: "13px", fontWeight: 800,
              color: pointsDelta.isTimePenalty ? "#f97316" : "#22c55e",
              animation: "floatUp 1.2s ease-out forwards",
              pointerEvents: "none", whiteSpace: "nowrap",
            }}>
              {pointsDelta.isTimePenalty
                ? `⏱ +${pointsDelta.value}с`
                : `${pointsDelta.value}`}
            </div>
          )}
        </div>

        {/* Счётчик */}
        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, flexShrink: 0 }}>
          {currentIdx + 1}/{activeLevel?.questions}
        </span>
      </div>

      {/* ── Второй бар: КРУПНЫЙ таймер сессии по центру + рекорд ── */}
      {quizReady && (() => {
        const recKey = `${activeLevel?.id}_${activeLevel?.questions}`;
        const rec = levelRecord?.[recKey] || null;
        const fmt = (s) => { const m = Math.floor(s/60); const sec = s%60; return m > 0 ? `${m}:${String(sec).padStart(2,"0")}` : `0:${String(sec).padStart(2,"0")}`; };
        const displayTime = sessionTimer.elapsed + timePenalty;
        const isOverRecord = rec?.time && displayTime > rec.time;
        const isPenaltyFlash = pointsDelta && pointsDelta.isTimePenalty;
        return (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "8px", flexShrink: 0 }}>
            {/* Крупный таймер по центру */}
            <div style={{
              position: "relative",
              display: "flex", alignItems: "center", gap: "6px",
              background: isPenaltyFlash
                ? "rgba(249,115,22,0.18)"
                : isOverRecord ? "rgba(239,68,68,0.12)" : "rgba(34,197,94,0.08)",
              border: `1.5px solid ${isPenaltyFlash
                ? "rgba(249,115,22,0.6)"
                : isOverRecord ? "rgba(239,68,68,0.4)" : "rgba(34,197,94,0.25)"}`,
              borderRadius: "10px",
              padding: "4px 14px",
              transition: "all 0.3s ease",
              animation: isPenaltyFlash ? "timerShake 0.5s ease-out" : "none",
            }}>
              <span style={{ fontSize: "16px" }}>⏱</span>
              <span style={{
                fontSize: "22px", fontWeight: 900, letterSpacing: "1px",
                color: isPenaltyFlash ? "#f97316" : isOverRecord ? "#ef4444" : "#e2e8f0",
                fontVariantNumeric: "tabular-nums",
                textShadow: isPenaltyFlash
                  ? "0 0 12px rgba(249,115,22,0.7)"
                  : isOverRecord ? "0 0 8px rgba(239,68,68,0.5)" : "0 0 8px rgba(34,197,94,0.3)",
                transition: "color 0.3s, text-shadow 0.3s",
              }}>
                {fmt(displayTime)}
              </span>
              {/* Анимация штрафа "+Xс" рядом с таймером */}
              {isPenaltyFlash && (
                <span key={pointsDelta.key} style={{
                  position: "absolute",
                  right: "-38px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "16px", fontWeight: 900,
                  color: "#f97316",
                  textShadow: "0 0 8px rgba(249,115,22,0.6)",
                  animation: "penaltyPop 1.2s ease-out forwards",
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                }}>
                  +{pointsDelta.value}с
                </span>
              )}
            </div>
            {/* Рекорд рядом */}
            {rec?.time ? (
              <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                <span style={{ fontSize: "14px" }}>🥇</span>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#d4a853", fontVariantNumeric: "tabular-nums" }}>{fmt(rec.time)}</span>
              </div>
            ) : (
              <span style={{ fontSize: "11px", color: "#475569", flexShrink: 0 }}>нет рекорда</span>
            )}
          </div>
        );
      })()}

      {/* ── Инструкция перед стартом уровня ── */}
      {!quizReady && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(6,13,26,0.92)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          padding: "20px",
          animation: "fadeIn 0.3s ease",
        }}>
          <div style={{
            background: "linear-gradient(160deg, #0f172a 0%, #1a1040 100%)",
            border: `2px solid rgba(${activeLevel?.colorRgb || "6,182,212"},0.4)`,
            borderRadius: "24px",
            padding: "32px 28px",
            maxWidth: "420px",
            width: "100%",
            textAlign: "center",
            boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(${activeLevel?.colorRgb || "6,182,212"},0.1)`,
          }}>
            {/* Иконка уровня */}
            <div style={{
              width: "64px", height: "64px",
              borderRadius: "50%",
              background: `rgba(${activeLevel?.colorRgb || "6,182,212"},0.15)`,
              border: `2px solid ${activeLevel?.color || "#06b6d4"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "28px",
              margin: "0 auto 16px",
            }}>
              {activeLevel?.icon}
            </div>

            {/* Название уровня */}
            <h2 style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#fff",
              margin: "0 0 4px 0",
            }}>
              Уровень {activeLevel?.id}: {activeLevel?.title}
            </h2>
            <p style={{
              fontSize: "14px",
              color: "#94a3b8",
              margin: "0 0 16px 0",
            }}>
              {activeLevel?.subtitle}
            </p>

            {/* Описание / инструкция */}
            <div style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              padding: "14px 16px",
              marginBottom: "20px",
              textAlign: "left",
            }}>
              <p style={{
                fontSize: "14px",
                color: "#e2e8f0",
                margin: 0,
                lineHeight: 1.6,
              }}>
                {activeLevel?.description}
              </p>
            </div>

            {/* Параметры уровня */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "16px",
              marginBottom: "24px",
              flexWrap: "wrap",
            }}>
              <div style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                padding: "8px 14px",
                textAlign: "center",
              }}>
                <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 2px 0" }}>Вопросов</p>
                <p style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: 0 }}>{activeLevel?.questions}</p>
              </div>
              <div style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                padding: "8px 14px",
                textAlign: "center",
              }}>
                <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 2px 0" }}>Время</p>
                <p style={{ fontSize: "16px", fontWeight: 700, color: "#fff", margin: 0 }}>
                  {activeLevel?.timePerQ ? `${activeLevel.timePerQ}с` : "∞"}
                </p>
              </div>
              <div style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                padding: "8px 14px",
                textAlign: "center",
              }}>
                <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 2px 0" }}>XP</p>
                <p style={{ fontSize: "16px", fontWeight: 700, color: activeLevel?.color || "#06b6d4", margin: 0 }}>+{activeLevel?.xpReward}</p>
              </div>
            </div>

            {/* Кнопка Начать */}
            <button
              onClick={() => setQuizReady(true)}
              style={{
                width: "100%",
                padding: "16px 24px",
                background: `linear-gradient(135deg, ${activeLevel?.color || "#06b6d4"}, ${activeLevel?.color || "#06b6d4"}cc)`,
                border: "none",
                borderRadius: "14px",
                color: "#fff",
                fontSize: "18px",
                fontWeight: 800,
                cursor: "pointer",
                touchAction: "manipulation",
                boxShadow: `0 4px 20px rgba(${activeLevel?.colorRgb || "6,182,212"},0.3)`,
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.03)";
                e.currentTarget.style.boxShadow = `0 6px 28px rgba(${activeLevel?.colorRgb || "6,182,212"},0.45)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = `0 4px 20px rgba(${activeLevel?.colorRgb || "6,182,212"},0.3)`;
              }}
            >
              🚀 Начать
            </button>
          </div>
        </div>
      )}

      {/* ── Layout ── */}
      <div className="quiz-layout" style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        minHeight: 0,
      }}>
        {/* Карта — сверху, занимает основное пространство */}
        <div className="map-col qb-map-col" style={{
          flex: 1,
          background: "linear-gradient(160deg, #060e1c 0%, #0a1628 60%, #060e1c 100%)",
          border: `1px solid rgba(${activeLevel?.colorRgb},0.2)`,
          padding: "0", overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
          minHeight: "200px",
          boxShadow: `0 4px 24px rgba(0,0,0,0.45), inset 0 0 40px rgba(${activeLevel?.colorRgb},0.04)`,
          position: "relative",
        }}>
          <USAMap
            highlightedState={highlightedState}
            markedState={markedState}
            selectedState={selectedState}
            onStateClick={handleStateClick}
            mode={mode}
            hoveredTz={hoveredTz}
            hoveredRegion={hoveredRegion}
            correctTz={correctTz}
            correctRegion={correctRegion}
            levelColor={activeLevel?.color}
            answeredStates={answeredStates}
            autoZoomState={!feedback ? currentQuestion?.stateId : null}
          />
        </div>

        {/* Панель — снизу */}
        <div className="panel-col" style={{ display: "flex", flexDirection: "column", minHeight: 0, flexShrink: 0, overflowY: "auto", maxHeight: "45dvh" }}>
          <QuizPanel
            mode={questionMode}
            level={activeLevel}
            question={currentQuestion}
            feedback={feedback}
            score={score}
            total={{ current: currentIdx + 1, max: activeLevel?.questions }}
            timerLeft={timer.timeLeft}
            timerPct={timer.pct}
            timerColor={timer.color}
            timerSeconds={activeLevel?.timePerQ}
            timerPause={timer.pause}
            timerResume={timer.resume}
            hint={hintText}
            hintUsed={hintUsed}
            onHint={handleHint}
            options={currentQuestion?.options}
            onOptionSelect={handleOptionSelect}
            onOptionHover={(val) => {
              if (mode === "timezone") setHoveredTz(val);
              if (mode === "region" || mode === "regions-intro") setHoveredRegion(val);
            }}
            onNext={handleNext}
            onSkip={handleSkip}
            streak={streak}
            shakePanel={shakePanel}
            quizReady={quizReady}
            onStartQuiz={() => setQuizReady(true)}
          />
        </div>
      </div>

      <style>{`
        @keyframes floatUp {
          0%   { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
    </div>
  );
}

// ── Вспомогательные функции ──────────────────────────────────
function buildCorrectMsg(q) {
  if (!q) return "Правильно!";
  if (q.cityName) return `${q.cityName}, ${q.stateId} — ${q.tz} Time`;
  return `${q.stateName} — ${q.tz} Time · ${q.region}`;
}

function buildWrongMsg(q) {
  if (!q) return "";
  if (q.cityName) return `Правильный ответ: ${q.cityName}, ${q.stateId}`;
  return `Правильный ответ: ${q.stateName}`;
}
