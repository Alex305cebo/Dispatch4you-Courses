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
    <div
      className={`qp-panel${shakePanel ? " shake" : ""}`}
      style={{ borderColor: `rgba(${level?.colorRgb || "6,182,212"},0.22)` }}
    >

      {/* Streak индикатор */}
      {streak >= 3 && !feedback && (
        <div className="qp-streak" style={{
          background: streak >= 5
            ? "linear-gradient(135deg, rgba(239,68,68,0.18), rgba(245,158,11,0.12))"
            : "linear-gradient(135deg, rgba(245,158,11,0.14), rgba(251,191,36,0.08))",
          border: `1px solid ${streak >= 5 ? "rgba(239,68,68,0.45)" : "rgba(245,158,11,0.35)"}`,
        }}>
          <div className="fire-particles">
            {[...Array(8)].map((_, i) => (
              <span key={i} className="fire-particle" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <span style={{ fontSize: "17px", position: "relative", zIndex: 1 }}>🔥</span>
          <span style={{
            fontSize: "13px", fontWeight: 800,
            color: streak >= 5 ? "#fbbf24" : "#f59e0b",
            position: "relative", zIndex: 1,
          }}>
            {streak} подряд!
          </span>
          <span style={{
            fontSize: "11px", fontWeight: 700, color: "#fff",
            background: streak >= 5 ? "#ef4444" : "#f59e0b",
            padding: "2px 7px", borderRadius: "4px",
            position: "relative", zIndex: 1,
          }}>
            {streak >= 5 ? "×2" : "×1.5"}
          </span>
        </div>
      )}

      {/* ═══ Карточка вопроса: таймер + текст ═══ */}
      <div className="qp-question-card">
        {/* Одна строка: таймер + счёт */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
          <div style={{ flex: 1 }}>
            <TimerBar
              timeLeft={timerLeft}
              pct={timerPct}
              color={timerColor}
              totalSeconds={timerSeconds}
            />
          </div>
          <div style={{ flexShrink: 0, textAlign: "right", minWidth: "80px" }}>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
              {total.current}/{total.max}
            </span>
            {" "}
            <span style={{ fontSize: "12px", color: "#22c55e", fontWeight: 700 }}>✓{score.correct}</span>
            {" "}
            <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: 700 }}>✗{score.wrong}</span>
          </div>
        </div>

        {/* Текст вопроса */}
        <button
          onClick={feedback ? handleOpenPronunciation : undefined}
          style={{
            width: "100%",
            background: feedback
              ? "linear-gradient(135deg, rgba(6,182,212,0.1), rgba(14,165,233,0.06))"
              : "none",
            border: feedback ? "1px solid rgba(6,182,212,0.35)" : "none",
            borderRadius: "8px",
            padding: feedback ? "10px 12px 8px" : "4px 0 2px",
            textAlign: "center",
            cursor: feedback ? "pointer" : "default",
            animation: feedback ? "glowPulse 2s ease-in-out infinite" : "none",
            transition: "all 0.3s ease",
          }}
        >
          <p className="qp-question-text">{question?.text}</p>
          {feedback && (
            <p style={{ fontSize: "11px", color: "#06b6d4", margin: "5px 0 0 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px", opacity: 0.85 }}>
              <span>🔊</span> Нажми для произношения
            </p>
          )}
        </button>
      </div>

      {/* Hint подсказка */}
      {hint && (
        <div style={{
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.22)",
          borderRadius: "8px",
          padding: "7px 12px",
          display: "flex", alignItems: "flex-start", gap: "7px",
          animation: "fadeSlideIn 0.2s ease",
        }}>
          <span style={{ fontSize: "13px", flexShrink: 0 }}>💡</span>
          <p style={{ fontSize: "12px", color: "#fbbf24", margin: 0, lineHeight: 1.45 }}>{hint}</p>
        </div>
      )}

      {/* Инструкция */}
      {!feedback && (
        <div className="qp-instruction">
          <span className="qp-instruction-icon">
            {mode === "find-city" ? "🏙️"
              : mode === "find-state" ? "🗺️"
              : mode === "timezone" ? "🕐"
              : mode === "region" || mode === "regions-intro" ? "🌎"
              : mode === "capitals" ? "🏛️"
              : mode === "name-state" ? "✏️"
              : "❓"}
          </span>
          <span className="qp-instruction-text">
            {mode === "find-city" ? "В каком штате находится этот город?"
              : mode === "find-state" ? "Найди этот штат на карте"
              : mode === "timezone" ? "Выбери часовой пояс этого штата"
              : mode === "region" || mode === "regions-intro" ? "В каком регионе находится этот штат?"
              : mode === "capitals" ? "Какая столица у этого штата?"
              : mode === "name-state" ? "Как называется выделенный штат?"
              : "Выбери правильный ответ"}
          </span>
        </div>
      )}

      {/* Кнопки действий */}
      {feedback ? (
        <button
          className="qp-next-btn"
          onClick={() => { clearTimeout(autoTimerRef.current); cancelAnimationFrame(autoRafRef.current); onNext(); }}
        >
          <div style={{
            position: "absolute", bottom: 0, left: 0,
            height: "3px", width: `${autoProgress}%`,
            background: "rgba(255,255,255,0.4)",
            transition: "none", borderRadius: "0 2px 2px 0",
          }} />
          Следующий →
        </button>
      ) : (
        <div style={{ display: "flex", gap: "8px" }}>
          {!hintUsed && !level?.noHints && (
            <button onClick={onHint} className="qp-action-btn qp-hint-btn">
              💡 −{penaltyHint}pts
            </button>
          )}
          {!level?.noSkip && (
            <button onClick={onSkip} className="qp-action-btn qp-skip-btn">
              Пропустить −{penaltySkip}pts
            </button>
          )}
        </div>
      )}

      {/* Варианты до ответа */}
      {!isMapClick && options && !feedback && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
          {options.map((opt) => (
            <button
              key={opt.value}
              className="qp-option"
              onClick={() => onOptionSelect(opt.value)}
              onMouseEnter={() => onOptionHover && onOptionHover(opt.value)}
              onMouseLeave={() => onOptionHover && onOptionHover(null)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Варианты после ответа — подсветка */}
      {!isMapClick && options && feedback && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px" }}>
          {options.map((opt) => {
            const isCorrect  = opt.value === question?.correctAnswer;
            const isSelected = opt.value === feedback?.selectedAnswer;
            const cls = isCorrect ? "qp-option correct"
                      : isSelected ? "qp-option wrong"
                      : "qp-option dimmed";
            return (
              <div key={opt.value} className={cls}>
                {isCorrect ? "✓ " : isSelected ? "✗ " : ""}{opt.label}
              </div>
            );
          })}
        </div>
      )}

      {/* Фидбек правильного ответа */}
      {feedback && feedback.correct && (
        <div className="qp-correct-feedback">
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#22c55e" }}>✓ Правильно!</span>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#22c55e", background: "rgba(34,197,94,0.15)", padding: "1px 7px", borderRadius: "4px" }}>+10</span>
          {feedback.streak >= 3 && <span style={{ fontSize: "11px", color: "#f59e0b" }}>🔥{feedback.streak}</span>}
        </div>
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

          {/* Твой ответ (неправильный) — показываем только если есть selectedAnswer и это не таймаут/пропуск */}
          {feedback.selectedAnswer && (() => {
            // Получаем отображаемое значение выбранного ответа
            let selectedDisplay = null;
            // Подсказка: для чего на самом деле был выбранный вариант
            let crossHint = null;

            if (mode === "find-state") {
              const clickedState = STATES.find(s => s.id === feedback.selectedAnswer);
              selectedDisplay = clickedState ? clickedState.name : feedback.selectedAnswer;
            } else if (mode === "find-city") {
              const clickedState = STATES.find(s => s.id === feedback.selectedAnswer);
              selectedDisplay = clickedState ? clickedState.name : feedback.selectedAnswer;
            } else if (mode === "capitals") {
              // selectedAnswer — столица, которую выбрали. Находим штат которому она принадлежит
              selectedDisplay = feedback.selectedAnswer;
              const ownerState = STATES.find(s => s.capital === feedback.selectedAnswer);
              if (ownerState) crossHint = `это столица штата ${ownerState.name}`;
            } else if (mode === "timezone") {
              // selectedAnswer — таймзона. Показываем сколько штатов в ней
              selectedDisplay = feedback.selectedAnswer;
              const tzCount = STATES.filter(s => s.tz === feedback.selectedAnswer).length;
              crossHint = `${tzCount} штат${tzCount === 1 ? "" : tzCount < 5 ? "а" : "ов"} в этой зоне`;
            } else if (mode === "region" || mode === "regions-intro") {
              // selectedAnswer — регион. Показываем сколько штатов в нём
              selectedDisplay = feedback.selectedAnswer;
              const regionCount = STATES.filter(s => s.region === feedback.selectedAnswer).length;
              crossHint = `регион из ${regionCount} штатов`;
            } else if (mode === "name-state") {
              // selectedAnswer — название штата
              selectedDisplay = feedback.selectedAnswer;
              const selectedSt = STATES.find(s => s.name === feedback.selectedAnswer);
              if (selectedSt) crossHint = `код: ${selectedSt.id}, ${selectedSt.region}`;
            } else {
              selectedDisplay = feedback.selectedAnswer;
            }

            return selectedDisplay ? (
              <div style={{
                marginTop: "16px",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: "12px",
                padding: "10px 14px",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontSize: "11px", color: "#94a3b8", margin: "0 0 2px 0" }}>Твой ответ:</p>
                    <p style={{ fontSize: "16px", fontWeight: 700, color: "#ef4444", margin: 0 }}>✗ {selectedDisplay}</p>
                  </div>
                  <div style={{
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: "rgba(239,68,68,0.2)",
                    border: "2px solid rgba(239,68,68,0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "14px", color: "#ef4444", flexShrink: 0,
                  }}>
                    ✗
                  </div>
                </div>
                {crossHint && (
                  <p style={{
                    fontSize: "11px", color: "#f97316", margin: "6px 0 0 0",
                    background: "rgba(249,115,22,0.1)", borderRadius: "6px",
                    padding: "4px 8px", display: "inline-block",
                  }}>
                    💡 {crossHint}
                  </p>
                )}
              </div>
            ) : null;
          })()}

          {/* Правильный ответ */}
          <div style={{
            marginTop: "10px",
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.25)",
            borderRadius: "12px",
            padding: "14px",
          }}>
            <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 4px 0" }}>Правильный ответ:</p>
            <p style={{ fontSize: "18px", fontWeight: 800, color: "#22c55e", margin: "0 0 6px 0" }}>
              {/* Для find-state/name-state: название штата. Для timezone/region/capitals: correctAnswer. Для find-city: город */}
              {mode === "find-city"
                ? question?.cityName
                : (mode === "timezone" || mode === "region" || mode === "regions-intro" || mode === "capitals")
                  ? question?.correctAnswer
                  : getFullStateName(question)
              }
            </p>
            {/* Название штата — всегда показываем с транскрипцией */}
            {(() => {
              const name = getFullStateName(question);
              const pron = getPronunciation(name);
              // Показываем штат отдельной строкой для режимов где правильный ответ — не штат
              const showStateLabel = mode === "timezone" || mode === "region" || mode === "regions-intro" || mode === "capitals" || mode === "find-city";
              return (
                <>
                  {showStateLabel && name && (
                    <p style={{ fontSize: "14px", color: "#94a3b8", margin: "6px 0 4px 0" }}>
                      Штат: <span style={{ color: "#e2e8f0", fontWeight: 700 }}>{name}</span>
                    </p>
                  )}
                  {pron && pron.en !== name ? (
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
                  ) : null}
                </>
              );
            })()}
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
                const preferred = ["Daniel", "Google US English", "Microsoft Aria", "Microsoft David", "Alex", "Samantha", "Karen"];
                let bestVoice = null;
                for (const name of preferred) {
                  bestVoice = voices.find(v => v.name.includes(name) && v.lang.startsWith("en"));
                  if (bestVoice) break;
                }
                if (!bestVoice) {
                  bestVoice = voices.find(v => v.name.includes("Daniel") && v.lang.startsWith("en"));
                  if (!bestVoice) bestVoice = voices.find(v => v.lang === "en-US") || voices.find(v => v.lang.startsWith("en"));
                }
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
              💡 {question?.cityName || getFullStateName(question)}: {question?.region || "—"}, {question?.tz || "—"}
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
