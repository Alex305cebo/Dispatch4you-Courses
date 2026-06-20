import { useEffect, useState } from "react";

export default function LevelResult({
  level,
  score,
  accuracy,          // % правильных из всех вопросов уровня
  xpEarned,
  weakStates,
  sessionTime = 0,
  onRestart,
  onNextLevel,
  onBackToMap,
  nextLevel,
}) {
  function formatTime(s) {
    if (!s) return "—";
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}м ${String(sec).padStart(2, "0")}с` : `${sec}с`;
  }

  const passed = accuracy >= level.unlockPct;
  const totalAnswered = score.correct + score.wrong;
  const answerAccuracy = totalAnswered > 0 ? Math.round((score.correct / totalAnswered) * 100) : 0;

  // Оценка по точности
  const grade =
    accuracy >= 90 ? { letter: "S", color: "#f59e0b", label: "Идеально!", emoji: "🏆" } :
    accuracy >= 75 ? { letter: "A", color: "#22c55e", label: "Отлично!", emoji: "🌟" } :
    accuracy >= 60 ? { letter: "B", color: "#06b6d4", label: "Хорошо!", emoji: "👍" } :
    accuracy >= 40 ? { letter: "C", color: "#f97316", label: "Неплохо", emoji: "💪" } :
                     { letter: "D", color: "#ef4444", label: "Попробуй ещё", emoji: "📚" };

  const accColor = accuracy >= 70 ? "#22c55e" : accuracy >= 40 ? "#f97316" : "#ef4444";

  // Анимация XP
  const [displayXp, setDisplayXp] = useState(0);
  useEffect(() => {
    if (!xpEarned) return;
    let start = 0;
    const step = Math.ceil(xpEarned / 30);
    const timer = setInterval(() => {
      start += step;
      if (start >= xpEarned) { setDisplayXp(xpEarned); clearInterval(timer); }
      else setDisplayXp(start);
    }, 30);
    return () => clearInterval(timer);
  }, [xpEarned]);

  // Советы
  const tips = [];
  if (score.skipped > 3) tips.push("Старайся не пропускать — даже неправильный ответ учит лучше.");
  if (answerAccuracy < 60) tips.push("Повтори слабые штаты перед следующей попыткой.");
  if (accuracy >= 90 && sessionTime > 0) tips.push("Отличная точность! Попробуй побить свой рекорд по времени.");
  if (passed && nextLevel) tips.push(`Открыт следующий уровень: ${nextLevel.title} +${nextLevel.xpReward} XP`);
  if (weakStates?.length > 3) tips.push("Обрати внимание на мелкие штаты востока — они самые сложные.");

  // Достижения
  const achievements = [];
  if (score.correct >= 15) achievements.push({ icon: "🎯", text: "Снайпер — 15+ правильных" });
  if (score.skipped === 0) achievements.push({ icon: "💎", text: "Без пропусков" });
  if (answerAccuracy >= 90) achievements.push({ icon: "🧠", text: "Точность 90%+" });
  if (score.wrong === 0) achievements.push({ icon: "🏆", text: "Без единой ошибки!" });
  if (sessionTime > 0 && sessionTime < 120) achievements.push({ icon: "⚡", text: "Быстрее 2 минут!" });

  return (
    <div className="level-result-root" style={{
      minHeight: "100dvh",
      background: "linear-gradient(160deg,#060d1a 0%,#0f172a 40%,#1a1040 100%)",
      padding: "14px",
      overflowY: "auto",
      overflowX: "hidden",
      boxSizing: "border-box",
      WebkitOverflowScrolling: "touch",
    }}>
      <div style={{ width: "100%", maxWidth: "420px", margin: "0 auto" }}>

        {/* ── Верхняя панель ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: "14px", gap: "8px",
        }}>
          <button onClick={onBackToMap} style={{
            padding: "8px 14px", background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px",
            color: "#94a3b8", fontSize: "13px", fontWeight: 600,
            cursor: "pointer", touchAction: "manipulation",
          }}>← Уровни</button>
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={onRestart} style={{
              padding: "8px 14px", background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px",
              color: "#e2e8f0", fontSize: "13px", fontWeight: 600,
              cursor: "pointer", touchAction: "manipulation",
            }}>🔄 Ещё раз</button>
            {passed && nextLevel && (
              <button onClick={onNextLevel} style={{
                padding: "8px 14px",
                background: `linear-gradient(135deg,${level.color},${level.color}bb)`,
                border: "none", borderRadius: "10px",
                color: "#fff", fontSize: "13px", fontWeight: 700,
                cursor: "pointer", touchAction: "manipulation",
                boxShadow: `0 2px 10px rgba(${level.colorRgb},0.3)`,
              }}>Далее →</button>
            )}
          </div>
        </div>

        {/* ── Главная карточка ── */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: `1px solid rgba(${level.colorRgb},0.25)`,
          borderRadius: "16px", padding: "18px", marginBottom: "10px",
          textAlign: "center", position: "relative", overflow: "hidden",
        }}>
          {/* Фоновое свечение */}
          <div style={{
            position: "absolute", top: "-30%", left: "50%", transform: "translateX(-50%)",
            width: "200px", height: "200px", borderRadius: "50%",
            background: `radial-gradient(circle, ${grade.color}15 0%, transparent 70%)`,
            pointerEvents: "none",
          }} />

          {/* Оценка + заголовок */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "14px", position: "relative" }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "50%",
              border: `3px solid ${grade.color}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "22px", fontWeight: 900, color: grade.color,
              background: `${grade.color}15`,
              boxShadow: `0 0 20px ${grade.color}33`,
              animation: "resultPulse 2s ease-in-out infinite", flexShrink: 0,
            }}>{grade.letter}</div>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>Уровень {level.id} · {level.title}</p>
              <p style={{ fontSize: "20px", fontWeight: 800, color: "#fff", margin: "2px 0 0 0" }}>
                {grade.emoji} {grade.label}
              </p>
            </div>
          </div>

          {/* Точность — главная метрика */}
          <div style={{ marginBottom: "14px", position: "relative" }}>
            <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 4px 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Точность
            </p>
            <p style={{ fontSize: "42px", fontWeight: 900, color: accColor, margin: "0 0 6px 0", lineHeight: 1 }}>
              {accuracy}<span style={{ fontSize: "20px", color: "#475569" }}>%</span>
            </p>
            <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden", marginBottom: "6px" }}>
              <div style={{ height: "100%", width: `${accuracy}%`, background: `linear-gradient(90deg, ${accColor}99, ${accColor})`, borderRadius: "3px", transition: "width 1s ease" }} />
            </div>
            <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>
              {score.correct} из {level.questions} вопросов
            </p>
          </div>

          {/* Время + XP в одну строку */}
          <div style={{ display: "flex", alignItems: "stretch", gap: "8px", marginBottom: "12px" }}>
            <div style={{
              flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "10px", padding: "10px", textAlign: "center",
            }}>
              <p style={{ fontSize: "10px", color: "#64748b", margin: "0 0 3px 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>Время</p>
              <p style={{ fontSize: "18px", fontWeight: 800, color: "#e2e8f0", margin: 0 }}>⏱ {formatTime(sessionTime)}</p>
            </div>
            <div style={{
              flex: 1, background: `rgba(${level.colorRgb},0.08)`, border: `1px solid rgba(${level.colorRgb},0.2)`,
              borderRadius: "10px", padding: "10px", textAlign: "center",
            }}>
              <p style={{ fontSize: "10px", color: "#64748b", margin: "0 0 3px 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>Опыт</p>
              <p style={{ fontSize: "18px", fontWeight: 800, color: level.color, margin: 0 }}>⭐ +{displayXp} XP</p>
            </div>
          </div>

          {/* Статус прохождения */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            {passed ? (
              <span style={{ fontSize: "13px", color: "#22c55e", fontWeight: 700, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "8px", padding: "6px 14px" }}>
                ✓ Уровень пройден {nextLevel ? `→ открыт ${nextLevel.title}` : ""}
              </span>
            ) : (
              <span style={{ fontSize: "13px", color: "#ef4444", fontWeight: 700, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", padding: "6px 14px" }}>
                Нужно {level.unlockPct}% · у тебя {accuracy}%
              </span>
            )}
          </div>
        </div>

        {/* ── Статистика: 3 блока ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "10px" }}>
          {[
            { label: "Правильно", value: score.correct, color: "#22c55e", icon: "✓" },
            { label: "Ошибки", value: score.wrong - score.skipped, color: "#ef4444", icon: "✗" },
            { label: "Пропущено", value: score.skipped, color: "#f97316", icon: "→" },
          ].map((s) => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "10px", padding: "10px 6px", textAlign: "center",
            }}>
              <p style={{ fontSize: "18px", fontWeight: 700, color: s.color, margin: "0 0 2px 0" }}>{s.icon} {s.value}</p>
              <p style={{ fontSize: "10px", color: "#64748b", margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Достижения ── */}
        {achievements.length > 0 && (
          <div style={{
            background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)",
            borderRadius: "12px", padding: "10px 14px", marginBottom: "10px",
          }}>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#fbbf24", margin: "0 0 6px 0" }}>🏅 Достижения:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {achievements.map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "14px" }}>{a.icon}</span>
                  <span style={{ fontSize: "12px", color: "#e2e8f0" }}>{a.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Слабые штаты ── */}
        {weakStates && weakStates.length > 0 && (
          <div style={{
            background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.12)",
            borderRadius: "12px", padding: "10px 14px", marginBottom: "10px",
          }}>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#ef4444", margin: "0 0 6px 0" }}>
              📌 Повтори эти штаты:
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {weakStates.map((s) => (
                <span key={s.id} style={{
                  fontSize: "12px", color: "#e2e8f0",
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
                  padding: "4px 8px", borderRadius: "6px",
                }}>
                  {s.name} <span style={{ color: "#ef4444", fontSize: "10px" }}>×{s.wrong}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Советы ── */}
        {tips.length > 0 && (
          <div style={{
            background: "rgba(6,182,212,0.05)", border: "1px solid rgba(6,182,212,0.12)",
            borderRadius: "12px", padding: "10px 14px", marginBottom: "10px",
          }}>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#06b6d4", margin: "0 0 6px 0" }}>💡 Советы:</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {tips.map((t, i) => (
                <p key={i} style={{ fontSize: "12px", color: "#94a3b8", margin: 0, lineHeight: 1.4 }}>{t}</p>
              ))}
            </div>
          </div>
        )}

        {/* ── Параметры уровня ── */}
        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "12px", padding: "10px 14px", marginBottom: "20px",
        }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#64748b", margin: "0 0 8px 0" }}>📊 Параметры уровня:</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {[
              { label: "Вопросов", value: level.questions },
              { label: "Время / вопрос", value: level.timePerQ ? `${level.timePerQ}с` : "без лимита" },
              { label: "Порог прохождения", value: `${level.unlockPct}%` },
              { label: "Макс. опыт", value: `${level.xpReward} XP` },
            ].map((item) => (
              <div key={item.label}>
                <p style={{ fontSize: "10px", color: "#475569", margin: "0 0 1px 0" }}>{item.label}</p>
                <p style={{ fontSize: "13px", color: "#e2e8f0", fontWeight: 700, margin: 0 }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
      <style>{`
        @keyframes resultPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
