import { useEffect, useRef, useState, useCallback } from "react";
import TimerBar from "./TimerBar";
import PronunciationModal from "./PronunciationModal";
import { getPronunciation } from "../data/pronunciations";

const AUTO_NEXT_DELAY = 4000; // мс

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
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(6,182,212,0.2)",
      borderRadius: "16px",
      padding: "14px 16px",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    }}>

      {/* Строка: прогресс + счёт */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "13px", color: "#94a3b8" }}>
          {total.current} / {total.max}
        </span>
        <span style={{ fontSize: "13px" }}>
          <span style={{ color: "#22c55e" }}>✓ {score.correct}</span>
          &nbsp;&nbsp;
          <span style={{ color: "#ef4444" }}>✗ {score.wrong}</span>
        </span>
      </div>

      {/* Полоска очков */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
          <span style={{ fontSize: "11px", color: "#94a3b8" }}>Очки</span>
          <span style={{ fontSize: "11px", color: barColor, fontWeight: 700 }}>
            {score.points} / {maxPoints}
          </span>
        </div>
        <div style={{ height: "5px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${pct * 100}%`,
            background: barColor,
            borderRadius: "3px",
            transition: "width 0.4s ease, background 0.4s ease",
          }} />
        </div>
      </div>

      {/* Таймер */}
      <TimerBar
        timeLeft={timerLeft}
        pct={timerPct}
        color={timerColor}
        totalSeconds={timerSeconds}
      />

      {/* Вопрос */}
      {/* Карточка всегда кликабельная */}
      <button
        onClick={handleOpenPronunciation}
        style={{
          width: "100%",
          background: feedback 
            ? "linear-gradient(135deg,rgba(6,182,212,0.12),rgba(14,165,233,0.08))"
            : "linear-gradient(135deg,rgba(6,182,212,0.08),rgba(14,165,233,0.05))",
          border: feedback
            ? "2px solid rgba(6,182,212,0.3)"
            : "2px solid rgba(6,182,212,0.2)",
          borderRadius: "12px",
          padding: "0",
          textAlign: "center",
          position: "relative",
          cursor: "pointer",
          transition: "all 0.2s ease",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = feedback
            ? "linear-gradient(135deg,rgba(6,182,212,0.18),rgba(14,165,233,0.12))"
            : "linear-gradient(135deg,rgba(6,182,212,0.12),rgba(14,165,233,0.08))";
          e.currentTarget.style.borderColor = "rgba(6,182,212,0.5)";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 4px 16px rgba(6,182,212,0.25)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = feedback
            ? "linear-gradient(135deg,rgba(6,182,212,0.12),rgba(14,165,233,0.08))"
            : "linear-gradient(135deg,rgba(6,182,212,0.08),rgba(14,165,233,0.05))";
          e.currentTarget.style.borderColor = feedback
            ? "rgba(6,182,212,0.3)"
            : "rgba(6,182,212,0.2)";
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {/* Верхняя полоска с подсказкой и иконкой */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px 6px",
          background: "rgba(6,182,212,0.05)",
          borderBottom: "1px solid rgba(6,182,212,0.15)",
        }}>
          <p style={{
            fontSize: "10px",
            color: "#94a3b8",
            margin: 0,
            fontWeight: 600,
          }}>
            {question?.hint}
          </p>
          
          {/* Иконка произношения */}
          <div style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            background: feedback
              ? "linear-gradient(135deg, rgba(6,182,212,0.25), rgba(14,165,233,0.2))"
              : "linear-gradient(135deg, rgba(100,116,139,0.2), rgba(71,85,105,0.15))",
            border: feedback
              ? "2px solid rgba(6,182,212,0.5)"
              : "2px solid rgba(100,116,139,0.3)",
            color: feedback ? "#06b6d4" : "#64748b",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: feedback ? "0 2px 8px rgba(6,182,212,0.3)" : "none",
            animation: feedback ? "pulse 2s ease-in-out infinite" : "none",
            flexShrink: 0,
          }}>
            {feedback ? "🔊" : "🔒"}
          </div>
        </div>

        {/* Основной текст вопроса */}
        <div style={{
          padding: "12px 12px 10px",
        }}>
          <p style={{
            fontSize: "19px",
            fontWeight: 800,
            color: "#fff",
            margin: 0,
            lineHeight: 1.3,
            letterSpacing: "-0.3px",
          }}>
            {question?.text}
          </p>
        </div>

        {/* Нижняя подсказка */}
        <div style={{
          padding: "6px 12px 8px",
          background: "rgba(6,182,212,0.05)",
          borderTop: "1px solid rgba(6,182,212,0.15)",
        }}>
          <p style={{
            fontSize: "10px",
            color: feedback ? "#64748b" : "#475569",
            margin: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "4px",
          }}>
            <span style={{ fontSize: "12px" }}>{feedback ? "👆" : "🔒"}</span>
            <span>{feedback ? "Нажми для произношения" : "Транскрипция появится после ответа"}</span>
          </p>
        </div>

        {/* Декоративное свечение - только после ответа */}
        {feedback && (
          <div style={{
            position: "absolute",
            top: "-50%",
            right: "-20%",
            width: "150px",
            height: "150px",
            background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
            animation: "glow 3s ease-in-out infinite",
          }} />
        )}
      </button>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
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

      {/* Варианты ответа (name-state / timezone / region) */}
      {!isMapClick && options && !feedback && (
        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onOptionSelect(opt.value)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(6,182,212,0.12)";
                e.currentTarget.style.borderColor = "rgba(6,182,212,0.4)";
                // Подсвечиваем на карте только для timezone (не для region!)
                if (mode === "timezone") {
                  onOptionHover?.(opt.value);
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                if (mode === "timezone") {
                  onOptionHover?.(null);
                }
              }}
              style={{
                padding: "11px 14px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                color: "#e2e8f0",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                textAlign: "left",
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
        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
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
                padding: "11px 14px",
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: "10px",
                color,
                fontSize: "14px",
                fontWeight: 600,
              }}>
                {isCorrect ? "✓ " : isSelected ? "✗ " : ""}{opt.label}
              </div>
            );
          })}
        </div>
      )}

      {/* Фидбек */}
      {feedback && (
        <div style={{
          background: feedback.correct ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
          border: `1px solid ${feedback.correct ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)"}`,
          borderRadius: "10px",
          padding: "10px 14px",
          textAlign: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "3px" }}>
            <span style={{ fontSize: "14px", fontWeight: 700, color: feedback.correct ? "#22c55e" : "#ef4444" }}>
              {feedback.correct ? "✓ Правильно!" : "✗ Неправильно"}
            </span>
            {feedback.pointsChange !== 0 && (
              <span style={{
                fontSize: "12px", fontWeight: 700, color: "#ef4444",
                background: "rgba(239,68,68,0.15)", padding: "1px 6px", borderRadius: "5px",
              }}>
                −{Math.abs(feedback.pointsChange)} pts
              </span>
            )}
            {feedback.correct && (
              <span style={{
                fontSize: "12px", fontWeight: 700, color: "#22c55e",
                background: "rgba(34,197,94,0.15)", padding: "1px 6px", borderRadius: "5px",
              }}>
                +10 pts
              </span>
            )}
          </div>
          <p style={{ fontSize: "12px", color: "#e2e8f0", margin: 0, lineHeight: 1.4 }}>
            {feedback.message}
          </p>
        </div>
      )}

      {/* Кнопки действий */}
      {feedback ? (
        <button
          onClick={() => {
            clearTimeout(autoTimerRef.current);
            cancelAnimationFrame(autoRafRef.current);
            onNext();
          }}
          style={{
            width: "100%", padding: "13px",
            background: "linear-gradient(135deg,#06b6d4,#0284c7)",
            border: "none", borderRadius: "12px",
            color: "#fff", fontSize: "15px", fontWeight: 700,
            cursor: "pointer", minHeight: "48px", touchAction: "manipulation",
            position: "relative", overflow: "hidden",
          }}
        >
          {/* Прогресс-полоска обратного отсчёта */}
          <div style={{
            position: "absolute", bottom: 0, left: 0,
            height: "3px",
            width: `${autoProgress}%`,
            background: "rgba(255,255,255,0.5)",
            transition: "none",
            borderRadius: "0 2px 2px 0",
          }} />
          Следующий →
        </button>
      ) : (
        <div style={{ display: "flex", gap: "8px" }}>
          {/* Подсказка */}
          {!hintUsed && (
            <button
              onClick={onHint}
              style={{
                flex: 1, padding: "11px 8px",
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.3)",
                borderRadius: "10px",
                color: "#fcd34d", fontSize: "13px", fontWeight: 600,
                cursor: "pointer", touchAction: "manipulation",
              }}
            >
              💡 −{penaltyHint}pts
            </button>
          )}
          {/* Пропустить */}
          <button
            onClick={onSkip}
            style={{
              flex: hintUsed ? 1 : 1, padding: "11px 8px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              color: "#94a3b8", fontSize: "13px",
              cursor: "pointer", touchAction: "manipulation",
            }}
          >
            Пропустить −{penaltySkip}pts
          </button>
        </div>
      )}

      {/* Подсказка для find-state */}
      {isMapClick && !feedback && (
        <p style={{ fontSize: "11px", color: "#475569", textAlign: "center", margin: 0 }}>
          👆 Кликни на карте
        </p>
      )}
    </div>

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
