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
import { PENALTIES } from "./data/quizConfig";
import { buildQuestions, MAP_CLICK_MODES } from "./data/questionBuilder";
import { useTimer }    from "./hooks/useTimer";
import { useStats }    from "./hooks/useStats";
import { useProgress } from "./hooks/useProgress";
import { useAuth }     from "./hooks/useAuth";
import { useSounds }   from "./hooks/useSounds";

// ── Константы ────────────────────────────────────────────────
const POINTS_PER_Q = 10;

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
  const [activeLevel,   setActiveLevel]   = useState(null);
  const [questions,     setQuestions]     = useState([]);
  const [currentIdx,    setCurrentIdx]    = useState(0);
  const [score,         setScore]         = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [feedback,      setFeedback]      = useState(null);
  const [pointsDelta,   setPointsDelta]   = useState(null);
  const [hintUsed,      setHintUsed]      = useState(false);
  const [hintText,      setHintText]      = useState(null);
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

  const currentQuestion = questions[currentIdx];
  const maxPoints = activeLevel ? activeLevel.questions * POINTS_PER_Q : 200;

  // ── Таймер ──
  const handleTimeout = useCallback(() => {
    if (feedback) return;
    showDelta(-PENALTIES.timeout);
    sounds.wrong();
    const mode = activeLevel?.mode;
    let timeoutMsg;
    if (mode === "find-city") {
      const correctStateName = STATES.find((s) => s.id === currentQuestion?.stateId)?.name || currentQuestion?.stateId;
      timeoutMsg = `⏱ Время вышло! ${currentQuestion?.cityName} находится в штате ${correctStateName}`;
    } else {
      timeoutMsg = `⏱ Время вышло! Правильный ответ: ${currentQuestion?.stateName || currentQuestion?.cityName}`;
    }
    setFeedback({
      correct: false,
      pointsChange: -PENALTIES.timeout,
      selectedAnswer: null,
      message: timeoutMsg,
    });
    setSelectedState("__timeout__");
    setScore((prev) => ({
      ...prev,
      wrong: prev.wrong + 1,
      skipped: prev.skipped + 1,
      points: Math.max(0, prev.points - PENALTIES.timeout),
    }));
    if (currentQuestion) recordResult(currentQuestion.stateId, currentQuestion.stateName, false);
  }, [feedback, currentQuestion, activeLevel, recordResult]); // eslint-disable-line

  const timer = useTimer(activeLevel?.timePerQ || null, handleTimeout);

  // ── Анимация дельты ──
  const showDelta = useCallback((value) => {
    setPointsDelta({ value, key: Date.now() });
    setTimeout(() => setPointsDelta(null), 1200);
  }, []);

  // ── Старт уровня ──
  const startLevel = useCallback((level) => {
    const qs = buildQuestions(level.mode, level.questions);
    const initScore = { correct: 0, wrong: 0, skipped: 0, points: level.questions * POINTS_PER_Q };
    setActiveLevel(level);
    setQuestions(qs);
    setCurrentIdx(0);
    setScore(initScore);
    setSelectedState(null);
    setFeedback(null);
    setPointsDelta(null);
    setHintUsed(false);
    setHintText(null);
    setHoveredTz(null);
    setHoveredRegion(null);
    setStreak(0);
    setAnsweredStates({});
    setShakePanel(false);
    setQuizReady(false);
    resetStats();
    setScreen("quiz");
  }, [resetStats]);

  // Запуск таймера при смене вопроса (только если quizReady)
  useEffect(() => {
    if (screen === "quiz" && currentQuestion && activeLevel?.timePerQ && quizReady) {
      timer.start();
      setHintUsed(false);
      setHintText(null);
      setHoveredTz(null);
      setHoveredRegion(null);
    }
  }, [currentIdx, screen, quizReady]); // eslint-disable-line

  // ── Обработка ответа ──
  const processAnswer = useCallback((correct, selectedAnswer, penalty) => {
    timer.stop();
    
    // Streak логика
    const newStreak = correct ? streak + 1 : 0;
    setStreak(newStreak);
    
    // Множитель за streak
    const multiplier = newStreak >= 5 ? 2 : newStreak >= 3 ? 1.5 : 1;
    const bonusPoints = correct && newStreak >= 3 ? Math.round(POINTS_PER_Q * (multiplier - 1)) : 0;
    
    showDelta(correct ? bonusPoints : -penalty);
    correct ? sounds.correct() : sounds.wrong();
    
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
    
    // Устанавливаем selectedState для режимов с вариантами ответа
    setSelectedState(selectedAnswer);
    
    // Устанавливаем правильный часовой пояс или регион для подсветки
    const mode = activeLevel?.mode;
    if (mode === "timezone") {
      setCorrectTz(currentQuestion.tz);
    } else if (mode === "region" || mode === "regions-intro") {
      setCorrectRegion(currentQuestion.region);
    }
    
    setFeedback({
      correct,
      pointsChange: correct ? bonusPoints : -penalty,
      selectedAnswer,
      streak: newStreak,
      message: correct
        ? (newStreak >= 5 ? "🔥 ОГОНЬ! Двойные очки!" : newStreak >= 3 ? `🔥 ${newStreak} подряд! Бонус!` : buildCorrectMsg(currentQuestion))
        : buildWrongMsg(currentQuestion),
    });
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      wrong:   prev.wrong   + (correct ? 0 : 1),
      skipped: prev.skipped,
      points:  Math.max(0, prev.points - (correct ? 0 : penalty) + bonusPoints),
    }));
    recordResult(currentQuestion.stateId, currentQuestion.stateName, correct);
  }, [timer, currentQuestion, activeLevel, showDelta, recordResult, streak, sounds]);

  // ── Клик по штату на карте ──
  const handleStateClick = useCallback((stateId) => {
    if (feedback) return;
    const mode = activeLevel?.mode;

    if (mode === "find-state") {
      setSelectedState(stateId);
      const correct = stateId === currentQuestion.stateId;
      const clickedState = STATES.find((s) => s.id === stateId);
      const penalty = hintUsed ? PENALTIES.wrong + PENALTIES.hint : PENALTIES.wrong;
      timer.stop();
      showDelta(correct ? 0 : -penalty);
      correct ? sounds.correct() : sounds.wrong();
      setFeedback({
        correct,
        pointsChange: correct ? 0 : -penalty,
        selectedAnswer: stateId,
        message: correct
          ? buildCorrectMsg(currentQuestion)
          : `Это ${clickedState?.name || stateId}. Правильный: ${currentQuestion.stateName}`,
      });
      setScore((prev) => ({
        correct: prev.correct + (correct ? 1 : 0),
        wrong:   prev.wrong   + (correct ? 0 : 1),
        skipped: prev.skipped,
        points:  Math.max(0, prev.points - (correct ? 0 : penalty)),
      }));
      recordResult(currentQuestion.stateId, currentQuestion.stateName, correct);
      return;
    }

    if (mode === "find-city") {
      setSelectedState(stateId);
      // Для города правильный штат — тот в котором этот город находится
      const correct = stateId === currentQuestion.stateId;
      const clickedState = STATES.find((s) => s.id === stateId);
      const correctStateName = STATES.find((s) => s.id === currentQuestion.stateId)?.name || currentQuestion.stateId;
      const penalty = hintUsed ? PENALTIES.wrong + PENALTIES.hint : PENALTIES.wrong;
      timer.stop();
      showDelta(correct ? 0 : -penalty);
      correct ? sounds.correct() : sounds.wrong();
      setFeedback({
        correct,
        pointsChange: correct ? 0 : -penalty,
        selectedAnswer: stateId,
        message: correct
          ? `✓ Верно! ${currentQuestion.cityName} — это штат ${correctStateName}.`
          : `Это ${clickedState?.name || stateId}. ${currentQuestion.cityName} находится в штате ${correctStateName}.`,
      });
      setScore((prev) => ({
        correct: prev.correct + (correct ? 1 : 0),
        wrong:   prev.wrong   + (correct ? 0 : 1),
        skipped: prev.skipped,
        points:  Math.max(0, prev.points - (correct ? 0 : penalty)),
      }));
      recordResult(currentQuestion.stateId, currentQuestion.cityName, correct);
      return;
    }
  }, [feedback, activeLevel, currentQuestion, hintUsed, timer, showDelta, recordResult]);

  // ── Выбор варианта ──
  const handleOptionSelect = useCallback((value) => {
    if (feedback) return;
    const correct = value === currentQuestion.correctAnswer;
    const penalty = hintUsed ? PENALTIES.wrong + PENALTIES.hint : PENALTIES.wrong;
    processAnswer(correct, value, penalty);
  }, [feedback, currentQuestion, hintUsed, processAnswer]);

  // ── Подсказка ──
  const handleHint = useCallback(() => {
    if (hintUsed || feedback) return;
    setHintUsed(true);
    setHintText(currentQuestion?.hintText);
    setScore((prev) => ({ ...prev, points: Math.max(0, prev.points - PENALTIES.hint) }));
    showDelta(-PENALTIES.hint);
  }, [hintUsed, feedback, currentQuestion, showDelta]);

  // ── Пропустить ──
  const handleSkip = useCallback(() => {
    if (feedback) return;
    timer.stop();
    showDelta(-PENALTIES.skip);
    setFeedback({
      correct: false,
      pointsChange: -PENALTIES.skip,
      selectedAnswer: null,
      message: `Пропущено. Правильный ответ: ${currentQuestion.stateName || currentQuestion.cityName}`,
    });
    setSelectedState("__skip__");
    setScore((prev) => ({
      ...prev,
      wrong: prev.wrong + 1,
      skipped: prev.skipped + 1,
      points: Math.max(0, prev.points - PENALTIES.skip),
    }));
    recordResult(currentQuestion.stateId, currentQuestion.stateName, false);
  }, [feedback, currentQuestion, timer, showDelta, recordResult]);

  // ── Следующий вопрос ──
  const handleNext = useCallback(() => {
    if (currentIdx + 1 >= activeLevel.questions) {
      timer.stop();
      sounds.levelComplete();
      // Считаем XP
      const finalScore = score;
      const pct = Math.round((finalScore.points / maxPoints) * 100);
      const earned = Math.round((activeLevel.xpReward * pct) / 100);
      setXpEarned(earned);
      completeLevel(activeLevel.id, pct, finalScore.correct, earned);
      setScreen("result");
      return;
    }
    setCurrentIdx((i) => i + 1);
    setSelectedState(null);
    setFeedback(null);
    setCorrectTz(null);
    setCorrectRegion(null);
  }, [currentIdx, activeLevel, score, maxPoints, timer, completeLevel]);

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
    return <LoginScreen onSignIn={signIn} loading={authLoading} />;
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
      />
    );
  }

  if (screen === "reference") {
    return <StateReference onBack={() => setScreen("map")} />;
  }

  if (screen === "result") {
    const nextLevel = LEVELS.find((l) => l.id === activeLevel.id + 1);
    const pct = Math.round((score.points / maxPoints) * 100);
    return (
      <LevelResult
        level={activeLevel}
        score={score}
        maxPoints={maxPoints}
        xpEarned={xpEarned}
        weakStates={weakStates}
        nextLevel={pct >= activeLevel.unlockPct ? nextLevel : null}
        onRestart={handleRestart}
        onNextLevel={handleNextLevel}
        onBackToMap={() => setScreen("map")}
      />
    );
  }

  // ── Квиз ──
  const mode = activeLevel?.mode;
  const needsMap = true;
  const isMapClick = MAP_CLICK_MODES.has(mode);
  const highlightedState = feedback ? currentQuestion?.stateId : null;
  // markedState — подсвечиваем штат на карте ДО ответа только для name-state
  // (там вопрос "как называется этот штат?" — нужно показать какой именно)
  // Для остальных режимов название штата написано в тексте — подсветка раскрывает ответ
  const markedState = mode === "name-state" ? currentQuestion?.stateId : null;

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
        justifyContent: "space-between",
        marginBottom: "4px",
        flexShrink: 0,
      }}>
        {/* Левая: кнопка сайта + кнопка уровней */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Кнопка на главную страницу Dispatch4You */}
          <a
            href="https://dispatch4you.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px", height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3d2e14, #2a1f0e)",
              border: "2px solid #8b6914",
              textDecoration: "none",
              transition: "all 0.2s ease",
              flexShrink: 0,
              boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
              fontSize: "14px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#d4a853";
              e.currentTarget.style.boxShadow = "0 2px 10px rgba(212,168,83,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#8b6914";
              e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.4)";
            }}
            title="Dispatch For You — Главная"
          >
            🏠
          </a>

          <button
            onClick={() => { timer.stop(); setScreen("map"); }}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#94a3b8", fontSize: "13px",
              padding: "7px 14px", cursor: "pointer",
              minHeight: "36px", touchAction: "manipulation",
            }}
          >
            ← Уровни
          </button>

          {/* Кнопка звука */}
          <button
            onClick={() => {
              const newVal = !sounds.enabled;
              sounds.setEnabled(newVal);
              // Force re-render
              setScore((s) => ({ ...s }));
            }}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#94a3b8", fontSize: "15px",
              padding: "7px 10px", cursor: "pointer",
              minHeight: "36px", touchAction: "manipulation",
            }}
            title={sounds.enabled ? "Выключить звук" : "Включить звук"}
          >
            {sounds.enabled ? "🔊" : "🔇"}
          </button>
        </div>

        {/* Центр: уровень + очки */}
        <div style={{ position: "relative", textAlign: "center" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "rgba(255,255,255,0.06)",
            border: `1px solid rgba(${activeLevel?.colorRgb},0.3)`,
            borderRadius: "10px", padding: "5px 14px",
          }}>
            <span style={{ fontSize: "14px" }}>⭐</span>
            <span style={{
              fontSize: "18px", fontWeight: 900,
              color: score.points > maxPoints * 0.6 ? activeLevel?.color
                   : score.points > maxPoints * 0.3 ? "#f97316" : "#ef4444",
              transition: "color 0.3s",
              minWidth: "36px", textAlign: "center",
            }}>
              {score.points}
            </span>
            <span style={{ fontSize: "11px", color: "#475569" }}>/ {maxPoints}</span>
          </div>

          {pointsDelta && (
            <div key={pointsDelta.key} style={{
              position: "absolute", top: "-22px", left: "50%",
              transform: "translateX(-50%)",
              fontSize: "14px", fontWeight: 700,
              color: pointsDelta.value < 0 ? "#ef4444" : "#22c55e",
              animation: "floatUp 1.2s ease-out forwards",
              pointerEvents: "none", whiteSpace: "nowrap",
            }}>
              {pointsDelta.value === 0 ? "✓ +10" : `−${Math.abs(pointsDelta.value)}`}
            </div>
          )}
        </div>

        <span style={{ fontSize: "13px", color: activeLevel?.color, fontWeight: 700 }}>
          {currentIdx + 1}/{activeLevel?.questions}
        </span>
      </div>

      {/* ── Прогресс-бар ── */}
      <div style={{
        height: "3px", background: "rgba(255,255,255,0.06)",
        borderRadius: "2px", marginBottom: "6px",
        overflow: "hidden", flexShrink: 0,
      }}>
        <div style={{
          height: "100%",
          width: `${((currentIdx + (feedback ? 1 : 0)) / activeLevel?.questions) * 100}%`,
          background: `linear-gradient(90deg,${activeLevel?.color},${activeLevel?.color}88)`,
          borderRadius: "2px", transition: "width 0.3s ease",
        }} />
      </div>

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
        <div className="map-col" style={{
          flex: 1,
          background: "rgba(255,255,255,0.02)",
          border: `1px solid rgba(${activeLevel?.colorRgb},0.15)`,
          borderRadius: "12px",
          padding: "0", overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
          minHeight: "200px",
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
          />
        </div>

        {/* Панель — снизу */}
        <div className="panel-col" style={{ display: "flex", flexDirection: "column", minHeight: 0, flexShrink: 0, overflowY: "auto", maxHeight: "45dvh" }}>
          <QuizPanel
            mode={mode}
            level={activeLevel}
            question={currentQuestion}
            feedback={feedback}
            score={score}
            total={{ current: currentIdx + 1, max: activeLevel?.questions }}
            maxPoints={maxPoints}
            penaltySkip={PENALTIES.skip}
            penaltyHint={PENALTIES.hint}
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
