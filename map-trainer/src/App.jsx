import { useState, useCallback, useEffect, useRef } from "react";
import LevelMap     from "./components/LevelMap";
import LevelResult  from "./components/LevelResult";
import USAMap       from "./components/USAMap";
import QuizPanel    from "./components/QuizPanel";
import LoginScreen  from "./components/LoginScreen";
import { STATES }   from "./data/states";
import { LEVELS }   from "./data/levels";
import { PENALTIES } from "./data/quizConfig";
import { buildQuestions, MAP_CLICK_MODES } from "./data/questionBuilder";
import { useTimer }    from "./hooks/useTimer";
import { useStats }    from "./hooks/useStats";
import { useProgress } from "./hooks/useProgress";
import { useAuth }     from "./hooks/useAuth";

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

  const { weakStates, recordResult, reset: resetStats } = useStats();

  const currentQuestion = questions[currentIdx];
  const maxPoints = activeLevel ? activeLevel.questions * POINTS_PER_Q : 200;

  // ── Таймер ──
  const handleTimeout = useCallback(() => {
    if (feedback) return;
    showDelta(-PENALTIES.timeout);
    setFeedback({
      correct: false,
      pointsChange: -PENALTIES.timeout,
      selectedAnswer: null,
      message: `⏱ Время вышло! Правильный ответ: ${currentQuestion?.stateName || currentQuestion?.cityName}`,
    });
    setSelectedState("__timeout__");
    setScore((prev) => ({
      ...prev,
      wrong: prev.wrong + 1,
      skipped: prev.skipped + 1,
      points: Math.max(0, prev.points - PENALTIES.timeout),
    }));
    if (currentQuestion) recordResult(currentQuestion.stateId, currentQuestion.stateName, false);
  }, [feedback, currentQuestion, recordResult]); // eslint-disable-line

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
    resetStats();
    setScreen("quiz");
  }, [resetStats]);

  // Запуск таймера при смене вопроса
  useEffect(() => {
    if (screen === "quiz" && currentQuestion && activeLevel?.timePerQ) {
      timer.start();
      setHintUsed(false);
      setHintText(null);
      setHoveredTz(null);
      setHoveredRegion(null);
    }
  }, [currentIdx, screen]); // eslint-disable-line

  // ── Обработка ответа ──
  const processAnswer = useCallback((correct, selectedAnswer, penalty) => {
    timer.stop();
    showDelta(correct ? 0 : -penalty);
    
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
      pointsChange: correct ? 0 : -penalty,
      selectedAnswer,
      message: correct
        ? buildCorrectMsg(currentQuestion)
        : buildWrongMsg(currentQuestion),
    });
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      wrong:   prev.wrong   + (correct ? 0 : 1),
      skipped: prev.skipped,
      points:  Math.max(0, prev.points - (correct ? 0 : penalty)),
    }));
    recordResult(currentQuestion.stateId, currentQuestion.stateName, correct);
  }, [timer, currentQuestion, activeLevel, showDelta, recordResult]);

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
        onLogOut={logOut}
        onReset={() => { if (confirm("Сбросить весь прогресс?")) resetProgress(); }}
      />
    );
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
  const markedState = !isMapClick ? currentQuestion?.stateId : null;

  return (
    <div style={{
      height: "100dvh",
      display: "flex",
      flexDirection: "column",
      background: "linear-gradient(160deg,#060d1a 0%,#0f172a 40%,#1a1040 100%)",
      padding: "10px 14px",
      boxSizing: "border-box",
      overflow: "hidden",
    }}>

      {/* ── Шапка ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "8px",
        flexShrink: 0,
      }}>
        {/* Левая: кнопка сайта + кнопка уровней */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Кнопка на главную страницу с логотипом */}
          <a
            href="https://dispatch4you.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px 12px",
              borderRadius: "10px",
              background: "rgba(6,182,212,0.1)",
              border: "2px solid rgba(6,182,212,0.3)",
              textDecoration: "none",
              transition: "all 0.3s ease",
              flexShrink: 0,
              boxShadow: "0 0 15px rgba(6,182,212,0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(6,182,212,0.15)";
              e.currentTarget.style.borderColor = "rgba(6,182,212,0.5)";
              e.currentTarget.style.boxShadow = "0 0 25px rgba(6,182,212,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(6,182,212,0.1)";
              e.currentTarget.style.borderColor = "rgba(6,182,212,0.3)";
              e.currentTarget.style.boxShadow = "0 0 15px rgba(6,182,212,0.3)";
            }}
            title="Dispatch For You"
          >
            <span style={{
              fontSize: "13px",
              fontWeight: 900,
              color: "#06b6d4",
              textShadow: "0 0 8px rgba(6,182,212,0.8)",
              letterSpacing: "0.3px",
            }}>
              Home
            </span>
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
        </div>

        {/* Центр: уровень + очки */}
        <div style={{ position: "relative", textAlign: "center" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "rgba(255,255,255,0.06)",
            border: `1px solid rgba(${activeLevel?.colorRgb},0.3)`,
            borderRadius: "10px", padding: "5px 14px",
          }}>
            <span style={{ fontSize: "14px" }}>{activeLevel?.icon}</span>
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
        borderRadius: "2px", marginBottom: "10px",
        overflow: "hidden", flexShrink: 0,
      }}>
        <div style={{
          height: "100%",
          width: `${((currentIdx + (feedback ? 1 : 0)) / activeLevel?.questions) * 100}%`,
          background: `linear-gradient(90deg,${activeLevel?.color},${activeLevel?.color}88)`,
          borderRadius: "2px", transition: "width 0.3s ease",
        }} />
      </div>

      {/* ── Layout ── */}
      <div className="quiz-layout" style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "minmax(250px,290px) 1fr",
        gap: "12px",
        alignItems: "stretch",
        minHeight: 0,
      }}>
        <div className="panel-col" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
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
          />
        </div>

        <div className="map-col" style={{
          background: "rgba(255,255,255,0.02)",
          border: `1px solid rgba(${activeLevel?.colorRgb},0.15)`,
          borderRadius: "16px",
          padding: "8px", overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
          minHeight: 0,
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
      `}</style>
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
