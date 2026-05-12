import { useEffect, useRef, useState, useCallback } from "react";
import TimerBar from "./TimerBar";
import PronunciationModal from "./PronunciationModal";
import { getPronunciation } from "../data/pronunciations";
import { STATES } from "../data/states";

const AUTO_NEXT_DELAY = 4000; // мс

// Получить полное название штата по ID или вернуть переданное значение
function getFullStateName(question) {
  if (question?.stateName) {
    // Если stateName — это код (2 буквы), ищем полное название
    if (question.stateName.length === 2) {
      const found = STATES.find(s => s.id === question.stateName);
      return found ? found.name : question.stateName;
    }
    return question.stateName;
  }
  if (question?.correctAnswer) {
    // Если correctAnswer — это код (2 буквы), ищем полное название
    if (question.correctAnswer.length === 2) {
      const found = STATES.find(s => s.id === question.correctAnswer);
      return found ? found.name : question.correctAnswer;
    }
    return question.correctAnswer;
  }
  return "";
}

export default function QuizPanel({
  mode,
  level,
  question,
  feedback,
  score,
  total,
  maxPoints,
  penaltySkip,
  penaltyHint,
  // Таймер
  timerLeft,
  timerPct,
  timerColor,
  timerSeconds,
  timerPause,
  timerResume,
  // Подсказка
  hint,
  hintUsed,
  onHint,
  // Варианты ответа (name-state / timezone / region)
  options,
  onOptionSelect,
  onOptionHover,
  // Кнопки
  onNext,
  onSkip,
  streak = 0,
  shakePanel = false,
  quizReady = true,
  onStartQuiz,
}) {
  const pct = score.points / maxPoints;
  const barColor = pct > 0.6 ? (level?.color || "#06b6d4") : pct > 0.3 ? "#f97316" : "#ef4444";
  const isMapClick = mode === "find-state" || mode === "find-city";

  const [showPronunciation, setShowPronunciation] = useState(false);

  // Открытие модального окна с паузой таймера
  const handleOpenPronunciation = useCallback(() => {
    setShowPronunciation(true);
    // Ставим на паузу только если есть feedback (после ответа)
    if (feedback && timerPause) {
      timerPause();
    }
  }, [feedback, timerPause]);

  // Закрытие модального окна с возобновлением таймера
  const handleClosePronunciation = useCallback(() => {
    setShowPronunciation(false);
    // Возобновляем только если есть feedback (после ответа)
    if (feedback && timerResume) {
      timerResume();
    }
  }, [feedback, timerResume]);

  // Авто-переход через 4 секунды после ответа
  const [autoProgress, setAutoProgress] = useState(0); // 0..100
  const autoTimerRef = useRef(null);
  const autoRafRef   = useRef(null);
  const autoStartRef = useRef(null);
  const autoPausedTimeRef = useRef(0); // Сколько времени было на паузе

  useEffect(() => {
    if (!feedback) {
      // Сбрасываем если вопрос сменился
      setAutoProgress(0);
      clearTimeout(autoTimerRef.current);
      cancelAnimationFrame(autoRafRef.current);
      autoPausedTimeRef.current = 0;
      return;
    }

    // При неправильном ответе — НЕ запускаем автопереход (ждём кнопку "Продолжить")
    if (!feedback.correct) {
      setAutoProgress(0);
      return;
    }

    // Если открыт поп-ап - не запускаем автопереход
    if (showPronunciation) {
      clearTimeout(autoTimerRef.current);
      cancelAnimationFrame(autoRafRef.current);
      return;
    }

    // Запускаем отсчёт (с учётом паузы)
    autoStartRef.current = performance.now() - autoPausedTimeRef.current;

    const tick = (now) => {
      const elapsed = now - autoStartRef.current;
      const p = Math.min(100, (elapsed / AUTO_NEXT_DELAY) * 100);
      setAutoProgress(p);
      if (p < 100) {
        autoRafRef.current = requestAnimationFrame(tick);
      }
    };
    autoRafRef.current = requestAnimationFrame(tick);

    autoTimerRef.current = setTimeout(() => {
      onNext();
    }, AUTO_NEXT_DELAY - autoPausedTimeRef.current);

    return () => {
      // Сохраняем сколько времени прошло перед паузой
      if (autoStartRef.current) {
        autoPausedTimeRef.current = performance.now() - autoStartRef.current;
      }
      clearTimeout(autoTimerRef.current);
      cancelAnimationFrame(autoRafRef.current);
    };
  }, [feedback, showPronunciation]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
  <>
    <div style={{
      background: "rgba(255,255,255,0.06)",
      backdropFilter: "blur(12px) saturate(1.3)",
      WebkitBackdropFilter: "blur(12px) saturate(1.3)",
      border: `1px solid rgba(${level?.colorRgb || "6,182,212"},0.25)`,
      borderRadius: "16px",
      padding: "14px 16px",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      boxShadow: `0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`,
      animation: shakePanel ? "shakeAnim 0.5s ease" : "none",
    }}>

      {/* Streak индикатор с огненными частицами */}
      {streak >= 3 && !feedback && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: "6px", padding: "6px 14px",
          background: streak >= 5
            ? "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(245,158,11,0.15))"
            : "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,191,36,0.1))",
          border: `1px solid ${streak >= 5 ? "rgba(239,68,68,0.5)" : "rgba(245,158,11,0.4)"}`,
          borderRadius: "10px",
          position: "relative",
          overflow: "hidden",
          animation: "streakPulse 1s ease-in-out infinite",
        }}>
          {/* Огненные частицы */}
          <div className="fire-particles">
            {[...Array(8)].map((_, i) => (
              <span key={i} className="fire-particle" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <span style={{ fontSize: "18px", position: "relative", zIndex: 1 }}>🔥</span>
          <span style={{
            fontSize: "14px", fontWeight: 800,
            color: streak >= 5 ? "#fbbf24" : "#f59e0b",
            position: "relative", zIndex: 1,
            textShadow: "0 0 8px rgba(251,191,36,0.5)",
          }}>
            {streak} подряд!
          </span>
          <span style={{
            fontSize: "11px", fontWeight: 700,
            color: "#fff",
            background: streak >= 5 ? "#ef4444" : "#f59e0b",
            padding: "2px 6px", borderRadius: "4px",
            position: "relative", zIndex: 1,
          }}>
            {streak >= 5 ? "×2 очков" : "×1.5 очков"}
          </span>
        </div>
      )}

      {/* ═══ Компактная карточка: прогресс + таймер + вопрос ═══ */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        padding: "8px 10px",
      }}>
        {/* Одна строка: таймер-бар (65%) + цифры (35%) */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          {/* Левая часть: прогресс-бар таймера */}
          <div style={{ flex: 1 }}>
            <TimerBar
              timeLeft={timerLeft}
              pct={timerPct}
              color={timerColor}
              totalSeconds={timerSeconds}
            />
          </div>
          {/* Правая часть: цифры */}
          <div style={{ flexShrink: 0, textAlign: "right", minWidth: "80px" }}>
            <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>
              {total.current}/{total.max}
            </span>
            {" "}
            <span style={{ fontSize: "12px", color: "#22c55e", fontWeight: 700 }}>✓{score.correct}</span>
            {" "}
            <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: 700 }}>✗{score.wrong}</span>
          </div>
        </div>

        {/* Вопрос — просто текст, без обёртки */}
        <button
          onClick={feedback ? handleOpenPronunciation : undefined}
          style={{
            width: "100%",
            background: feedback
              ? "linear-gradient(135deg, rgba(6,182,212,0.12), rgba(14,165,233,0.08))"
              : "none",
            border: feedback ? "1px solid rgba(6,182,212,0.4)" : "none",
            borderRadius: "10px",
            padding: feedback ? "10px 10px 8px" : "6px 0 2px",
            textAlign: "center",
            cursor: feedback ? "pointer" : "default",
            boxShadow: feedback ? "0 0 16px rgba(6,182,212,0.2), inset 0 0 12px rgba(6,182,212,0.05)" : "none",
            animation: feedback ? "glowPulse 2s ease-in-out infinite" : "none",
            transition: "all 0.3s ease",
          }}
        >
          <p style={{
            fontSize: "16px",
            fontWeight: 800,
            color: "#fff",
            margin: 0,
            lineHeight: 1.3,
          }}>
            {question?.text}
          </p>
          {feedback && (
            <p style={{ fontSize: "12px", color: "#06b6d4", margin: "6px 0 0 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
              <span style={{ fontSize: "14px" }}>🔊</span> Нажми для произношения
            </p>
          )}
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 12px rgba(6,182,212,0.15), inset 0 0 8px rgba(6,182,212,0.03); }
          50% { box-shadow: 0 0 20px rgba(6,182,212,0.3), inset 0 0 12px rgba(6,182,212,0.06); }
        }
        @keyframes shakeAnim {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-6px); }
          30% { transform: translateX(5px); }
          45% { transform: translateX(-4px); }
          60% { transform: translateX(3px); }
          75% { transform: translateX(-2px); }
          90% { transform: translateX(1px); }
        }
        @keyframes streakPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 rgba(245,158,11,0); }
          50% { transform: scale(1.02); box-shadow: 0 0 12px rgba(245,158,11,0.3); }
        }
        .fire-particles {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .fire-particle {
          position: absolute;
          bottom: 0;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #fbbf24;
          box-shadow: 0 0 4px #f59e0b, 0 0 8px rgba(239,68,68,0.5);
          animation: fireFloat 1.2s ease-out infinite;
          opacity: 0;
        }
        .fire-particle:nth-child(1) { left: 10%; }
        .fire-particle:nth-child(2) { left: 25%; }
        .fire-particle:nth-child(3) { left: 40%; }
        .fire-particle:nth-child(4) { left: 55%; }
        .fire-particle:nth-child(5) { left: 70%; }
        .fire-particle:nth-child(6) { left: 85%; }
        .fire-particle:nth-child(7) { left: 15%; }
        .fire-particle:nth-child(8) { left: 60%; }
        @keyframes fireFloat {
          0% { transform: translateY(0) scale(1); opacity: 0.8; }
          50% { opacity: 1; }
          100% { transform: translateY(-30px) scale(0.3); opacity: 0; }
        }
      `}</style>

      {/* Подсказка — блок */}
      {hint && (
        <div style={{
          background: "rgba(245,158,11,0.1)",
          border: "1px solid rgba(245,158,11,0.3)",
          borderRadius: "10px",
          padding: "8px 12px",
          display: "flex",
          alignItems: "flex-start",
          gap: "8px",
        }}>
          <span style={{ fontSize: "14px" }}>💡</span>
          <p style={{ fontSize: "12px", color: "#fcd34d", margin: 0, lineHeight: 1.4 }}>
            {hint}
          </p>
        </div>
      )}

      {/* Кнопки действий — над вариантами, рядом по горизонтали */}
      {feedback ? (
        <button
          onClick={() => {
            clearTimeout(autoTimerRef.current);
            cancelAnimationFrame(autoRafRef.current);
            onNext();
          }}
          style={{
            width: "100%", padding: "12px",
            background: "linear-gradient(135deg,#06b6d4,#0284c7)",
            border: "none", borderRadius: "10px",
            color: "#fff", fontSize: "14px", fontWeight: 700,
            cursor: "pointer", minHeight: "44px", touchAction: "manipulation",
            position: "relative", overflow: "hidden",
          }}
        >
          <div style={{
            position: "absolute", bottom: 0, left: 0,
            height: "3px", width: `${autoProgress}%`,
            background: "rgba(255,255,255,0.5)",
            transition: "none", borderRadius: "0 2px 2px 0",
          }} />
          Следующий →
        </button>
      ) : (
        <div style={{ display: "flex", gap: "8px" }}>
          {!hintUsed && (
            <button onClick={onHint} style={{
              flex: 1, padding: "10px 8px",
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: "10px",
              color: "#fcd34d", fontSize: "12px", fontWeight: 600,
              cursor: "pointer", touchAction: "manipulation",
            }}>
              💡 −{penaltyHint}pts
            </button>
          )}
          <button onClick={onSkip} style={{
            flex: 1, padding: "10px 8px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            color: "#94a3b8", fontSize: "12px",
            cursor: "pointer", touchAction: "manipulation",
          }}>
            Пропустить −{penaltySkip}pts
          </button>
        </div>
      )}

      {/* Варианты ответа (name-state / timezone / region) */}
      {!isMapClick && options && !feedback && (
        <div style={{ display: "grid", gridTemplateColumns: options.length >= 4 ? "1fr 1fr" : "1fr", gap: "6px" }}>
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onOptionSelect(opt.value)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(6,182,212,0.12)";
                e.currentTarget.style.borderColor = "rgba(6,182,212,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              }}
              style={{
                padding: "9px 12px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                color: "#e2e8f0",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "center",
                touchAction: "manipulation",
                transition: "all 0.15s ease",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Варианты после ответа — с подсветкой */}
      {!isMapClick && options && feedback && (
        <div style={{ display: "grid", gridTemplateColumns: options.length >= 4 ? "1fr 1fr" : "1fr", gap: "6px" }}>
          {options.map((opt) => {
            const isCorrect = opt.value === question?.correctAnswer;
            const isSelected = opt.value === feedback?.selectedAnswer;
            let bg = "rgba(255,255,255,0.03)";
            let border = "rgba(255,255,255,0.08)";
            let color = "#64748b";
            if (isCorrect) { bg = "rgba(34,197,94,0.12)"; border = "rgba(34,197,94,0.4)"; color = "#22c55e"; }
            else if (isSelected && !isCorrect) { bg = "rgba(239,68,68,0.12)"; border = "rgba(239,68,68,0.4)"; color = "#ef4444"; }
            return (
              <div key={opt.value} style={{
                padding: "9px 12px",
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: "10px",
                color,
                fontSize: "13px",
                fontWeight: 600,
                textAlign: "center",
              }}>
                {isCorrect ? "✓ " : isSelected ? "✗ " : ""}{opt.label}
              </div>
            );
          })}
        </div>
      )}

      {/* Фидбек — при правильном: компактная строка, при неправильном: popup */}
      {feedback && feedback.correct && (
        <div style={{
          background: "rgba(34,197,94,0.1)",
          border: "1px solid rgba(34,197,94,0.3)",
          borderRadius: "8px",
          padding: "6px 10px",
          textAlign: "center",
          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
        }}>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#22c55e" }}>✓ Правильно!</span>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#22c55e", background: "rgba(34,197,94,0.15)", padding: "1px 6px", borderRadius: "4px" }}>+10</span>
          {feedback.streak >= 3 && (
            <span style={{ fontSize: "11px", color: "#f59e0b" }}>🔥{feedback.streak}</span>
          )}
        </div>
      )}

      {/* Подсказка/инструкция */}
      {!feedback && (
        <p style={{ fontSize: "13px", color: "#06b6d4", textAlign: "center", margin: 0, fontWeight: 600 }}>
          {isMapClick
            ? "👆 Нажми на штат на карте"
            : mode === "timezone"
              ? "🕐 Выбери часовой пояс для этого штата"
              : mode === "region" || mode === "regions-intro"
                ? "🌎 Выбери регион, в котором находится штат"
                : mode === "capitals"
                  ? "🏛️ Выбери столицу этого штата"
                  : mode === "name-state"
                    ? "✏️ Выбери правильное название штата"
                    : "Выбери правильный ответ"
          }
        </p>
      )}
    </div>

    {/* Popup при неправильном ответе */}
    {feedback && !feedback.correct && (
      <div
        onClick={() => {
          clearTimeout(autoTimerRef.current);
          cancelAnimationFrame(autoRafRef.current);
          onNext();
        }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          padding: "20px",
          animation: "fadeIn 0.2s ease",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "linear-gradient(135deg, #1a0a0a 0%, #2a1015 50%, #1a0a1a 100%)",
            border: "2px solid rgba(239,68,68,0.4)",
            borderRadius: "20px",
            padding: "24px 20px",
            maxWidth: "360px",
            width: "100%",
            textAlign: "center",
            boxShadow: "0 20px 60px rgba(239,68,68,0.15), 0 0 40px rgba(0,0,0,0.5)",
            animation: "slideUp 0.3s ease",
            maxHeight: "85vh",
            overflowY: "auto",
            position: "relative",
          }}
        >
          {/* Крестик закрытия */}
          <button
            onClick={() => {
              clearTimeout(autoTimerRef.current);
              cancelAnimationFrame(autoRafRef.current);
              onNext();
            }}
            style={{
              position: "absolute", top: "12px", right: "12px",
              width: "28px", height: "28px", borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#94a3b8", fontSize: "16px",
              cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            ×
          </button>

          {/* Верхняя часть: иконка + текст + pts — в одну строку */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "10px", marginBottom: "12px",
          }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              background: "rgba(239,68,68,0.15)",
              border: "2px solid rgba(239,68,68,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px", color: "#ef4444", flexShrink: 0,
            }}>
              ✗
            </div>
            <p style={{ fontSize: "17px", fontWeight: 800, color: "#ef4444", margin: 0 }}>
              Неправильно
            </p>
            <span style={{
              fontSize: "12px", fontWeight: 700, color: "#ef4444",
              background: "rgba(239,68,68,0.15)", padding: "3px 8px", borderRadius: "5px",
              flexShrink: 0,
            }}>
              −{Math.abs(feedback.pointsChange)}
            </span>
          </div>

          {/* Правильный ответ */}
          <div style={{
            marginTop: "16px",
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.25)",
            borderRadius: "12px",
            padding: "14px",
          }}>
            <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 4px 0" }}>Правильный ответ:</p>
            <p style={{ fontSize: "18px", fontWeight: 800, color: "#22c55e", margin: "0 0 6px 0" }}>
              {question?.cityName || getFullStateName(question)}
            </p>
            {/* Транскрипция */}
            {(() => {
              const name = question?.cityName || getFullStateName(question);
              const pron = getPronunciation(name);
              return pron && pron.en !== name ? (
                <div style={{ borderTop: "1px solid rgba(34,197,94,0.15)", paddingTop: "8px", marginTop: "8px", display: "flex", justifyContent: "center", gap: "20px" }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "9px", color: "#64748b", margin: "0 0 2px 0", textTransform: "uppercase", letterSpacing: "1px" }}>ENGLISH</p>
                    <p style={{ fontSize: "16px", color: "#e2e8f0", margin: 0, fontFamily: "monospace" }}>[{pron.en}]</p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: "9px", color: "#64748b", margin: "0 0 2px 0", textTransform: "uppercase", letterSpacing: "1px" }}>КИРИЛЛИЦА</p>
                    <p style={{ fontSize: "16px", color: "#e2e8f0", margin: 0, fontFamily: "monospace" }}>[{pron.ru}]</p>
                  </div>
                </div>
              ) : null;
            })()}
            {/* Пояснение: для какого штата */}
            {(mode === "timezone" || mode === "region" || mode === "regions-intro" || mode === "capitals") && (
              <p style={{ fontSize: "14px", color: "#94a3b8", margin: "8px 0 0 0" }}>
                Штат: {question?.stateName}
                {(() => {
                  const statePron = getPronunciation(question?.stateName);
                  return statePron && statePron.en !== question?.stateName
                    ? ` [${statePron.ru}]`
                    : "";
                })()}
              </p>
            )}
          </div>

          {/* Кнопка произношения — озвучивает правильный ответ */}
          <button
            onClick={() => {
              if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                // Озвучиваем только полное название штата/города (без кодов)
                const textToSpeak = question?.cityName || getFullStateName(question);
                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                utterance.lang = 'en-US';
                utterance.rate = 0.75;
                utterance.pitch = 0.95;
                utterance.volume = 0.85;
                const voices = window.speechSynthesis.getVoices();
                const preferred = ["Google US English", "Microsoft Aria", "Microsoft Jenny", "Samantha", "Karen", "Daniel"];
                let bestVoice = null;
                for (const name of preferred) {
                  bestVoice = voices.find(v => v.name.includes(name) && v.lang.startsWith("en"));
                  if (bestVoice) break;
                }
                if (!bestVoice) bestVoice = voices.find(v => v.lang === "en-US") || voices.find(v => v.lang.startsWith("en"));
                if (bestVoice) utterance.voice = bestVoice;
                window.speechSynthesis.speak(utterance);
              }
            }}
            style={{
              width: "100%",
              marginTop: "14px",
              padding: "14px",
              background: "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1))",
              border: "2px solid rgba(34,197,94,0.5)",
              borderRadius: "12px",
              color: "#22c55e",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
              touchAction: "manipulation",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 4px 12px rgba(34,197,94,0.2)",
            }}
          >
            🔊 Послушать произношение
          </button>

          {/* Аналитика — 4 столбца (2 пары ключ-значение в строку) */}
          <div style={{
            marginTop: "10px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "10px",
            padding: "8px 10px",
            display: "grid",
            gridTemplateColumns: "auto auto auto auto",
            gap: "4px 8px",
            alignItems: "center",
          }}>
            {question?.tz && (
              <>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>Пояс:</span>
                <span style={{ fontSize: "11px", color: "#fff", fontWeight: 700 }}>{question.tz}</span>
              </>
            )}
            {question?.region && (
              <>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>Регион:</span>
                <span style={{ fontSize: "11px", color: "#fff", fontWeight: 700 }}>{question.region}</span>
              </>
            )}
            {question?.capital && (
              <>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>Столица:</span>
                <span style={{ fontSize: "11px", color: "#fff", fontWeight: 700 }}>{question.capital}</span>
              </>
            )}
            <>
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>Код:</span>
              <span style={{ fontSize: "11px", color: "#fff", fontWeight: 700 }}>{question?.stateId}</span>
            </>
          </div>

          {/* Совет */}
          <div style={{
            marginTop: "8px",
            background: "rgba(6,182,212,0.06)",
            border: "1px solid rgba(6,182,212,0.15)",
            borderRadius: "8px",
            padding: "6px 10px",
          }}>
            <p style={{ fontSize: "12px", color: "#06b6d4", margin: 0, lineHeight: 1.4 }}>
              💡 {question?.stateName || question?.cityName}: {question?.region || "—"}, {question?.tz || "—"}
            </p>
          </div>

          {/* Кнопка продолжить */}
          <button
            onClick={() => {
              clearTimeout(autoTimerRef.current);
              cancelAnimationFrame(autoRafRef.current);
              onNext();
            }}
            style={{
              width: "100%",
              marginTop: "10px",
              padding: "11px",
              background: "linear-gradient(135deg, #06b6d4, #0284c7)",
              border: "none",
              borderRadius: "10px",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              touchAction: "manipulation",
            }}
          >
            Продолжить →
          </button>
        </div>
      </div>
    )}

    {/* Модальное окно произношения */}
    {showPronunciation && question && (
      <PronunciationModal
        stateName={question.stateName || question.cityName || question.text}
        pronunciation={getPronunciation(question.stateName || question.cityName || question.text)}
        isLocked={!feedback}
        onClose={handleClosePronunciation}
      />
    )}
  </>
  );
}
