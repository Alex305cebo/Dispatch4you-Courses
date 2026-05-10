import { useEffect, useState } from "react";
import { LEVELS } from "../data/levels";

export default function LevelResult({
  level,
  score,
  maxPoints,
  xpEarned,
  weakStates,
  onRestart,
  onNextLevel,
  onBackToMap,
  nextLevel,
}) {
  const pct = Math.round((score.points / maxPoints) * 100);
  const passed = pct >= level.unlockPct;

  // Анимация XP счётчика
  const [displayXp, setDisplayXp] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(xpEarned / 30);
    const timer = setInterval(() => {
      start += step;
      if (start >= xpEarned) { setDisplayXp(xpEarned); clearInterval(timer); }
      else setDisplayXp(start);
    }, 30);
    return () => clearInterval(timer);
  }, [xpEarned]);

  const grade =
    pct >= 90 ? { letter: "S", color: "#f59e0b", label: "Идеально!" } :
    pct >= 75 ? { letter: "A", color: "#22c55e", label: "Отлично!" } :
    pct >= 60 ? { letter: "B", color: "#06b6d4", label: "Хорошо" } :
    pct >= 40 ? { letter: "C", color: "#f97316", label: "Неплохо" } :
                { letter: "D", color: "#ef4444", label: "Попробуй ещё" };

  const barColor = pct > 60 ? "#06b6d4" : pct > 30 ? "#f97316" : "#ef4444";

  return (
    <div className="level-result-root" style={{
      height: "100dvh",
      background: "linear-gradient(160deg,#060d1a 0%,#0f172a 40%,#1a1040 100%)",
      padding: "20px",
      overflowY: "auto",
      overflowX: "hidden",
      boxSizing: "border-box",
      WebkitOverflowScrolling: "touch",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "420px",
        margin: "0 auto",
      }}>

        {/* Заголовок уровня */}
        <div className="lr-header" style={{ textAlign: "center", marginBottom: "16px" }}>
          <div className="lr-header-icon" style={{ fontSize: "36px", marginBottom: "6px", lineHeight: 1 }}>{level.icon}</div>
          <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 2px 0" }}>
            Уровень {level.id}
          </p>
          <h2 className="lr-header-title" style={{ fontSize: "20px", fontWeight: 800, color: "#fff", margin: 0 }}>
            {level.title}
          </h2>
        </div>

        {/* Карточка результата */}
        <div className="lr-card" style={{
          background: "linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))",
          border: `1px solid rgba(${level.colorRgb},0.3)`,
          borderRadius: "20px",
          padding: "20px 18px",
          marginBottom: "12px",
          textAlign: "center",
        }}>
          {/* Оценка */}
          <div style={{
            width: "72px", height: "72px",
            borderRadius: "50%",
            border: `3px solid ${grade.color}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px",
            fontSize: "30px", fontWeight: 900, color: grade.color,
            background: `${grade.color}18`,
            boxShadow: `0 0 24px ${grade.color}33`,
          }}>
            {grade.letter}
          </div>

          <p style={{ fontSize: "18px", fontWeight: 700, color: "#fff", margin: "0 0 4px 0" }}>
            {grade.label}
          </p>

          {/* Статус прохождения */}
          {passed ? (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.3)",
              borderRadius: "8px", padding: "4px 12px",
              marginBottom: "16px",
            }}>
              <span style={{ fontSize: "12px", color: "#22c55e", fontWeight: 700 }}>
                ✓ Уровень пройден!
              </span>
              {nextLevel && (
                <span style={{ fontSize: "12px", color: "#22c55e" }}>
                  → Открыт: {nextLevel.title}
                </span>
              )}
            </div>
          ) : (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: "8px", padding: "4px 12px",
              marginBottom: "16px",
            }}>
              <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: 700 }}>
                Нужно {level.unlockPct}% для прохождения
              </span>
            </div>
          )}

          {/* Очки */}
          <div style={{ marginBottom: "16px" }}>
            <p style={{ fontSize: "36px", fontWeight: 900, color: barColor, margin: "0 0 6px 0", lineHeight: 1 }}>
              {score.points}
              <span style={{ fontSize: "16px", color: "#475569", fontWeight: 400 }}> / {maxPoints}</span>
            </p>
            <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden", marginBottom: "4px" }}>
              <div style={{
                height: "100%", width: `${pct}%`,
                background: barColor, borderRadius: "3px",
                transition: "width 0.8s ease",
              }} />
            </div>
            <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>{pct}% правильных</p>
          </div>

          {/* Статистика */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "16px" }}>
            {[
              { label: "Правильно", value: score.correct,               color: "#22c55e", icon: "✓" },
              { label: "Ошибки",    value: score.wrong - score.skipped, color: "#ef4444", icon: "✗" },
              { label: "Пропущено", value: score.skipped,               color: "#f97316", icon: "→" },
            ].map((s) => (
              <div key={s.label} style={{
                background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "10px 6px",
              }}>
                <p style={{ fontSize: "20px", fontWeight: 700, color: s.color, margin: "0 0 2px 0" }}>
                  {s.icon} {s.value}
                </p>
                <p style={{ fontSize: "10px", color: "#64748b", margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* XP награда */}
          <div style={{
            background: `rgba(${level.colorRgb},0.1)`,
            border: `1px solid rgba(${level.colorRgb},0.25)`,
            borderRadius: "12px",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}>
            <span style={{ fontSize: "16px" }}>⭐</span>
            <span style={{ fontSize: "18px", fontWeight: 900, color: level.color }}>
              +{displayXp} XP
            </span>
            <span style={{ fontSize: "12px", color: "#64748b" }}>получено</span>
          </div>
        </div>

        {/* Слабые штаты */}
        {weakStates && weakStates.length > 0 && (
          <div style={{
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.15)",
            borderRadius: "14px",
            padding: "12px 16px",
            marginBottom: "12px",
          }}>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#ef4444", margin: "0 0 8px 0" }}>
              📌 Повтори эти штаты:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {weakStates.map((s) => (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "13px", color: "#e2e8f0" }}>{s.name}</span>
                  <span style={{
                    fontSize: "11px", color: "#ef4444",
                    background: "rgba(239,68,68,0.12)",
                    padding: "2px 7px", borderRadius: "5px",
                  }}>
                    {s.wrong}× ошибка
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Кнопки */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Кнопка на главную страницу */}
          <a
            href="https://dispatch4you.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "13px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "14px",
              color: "#e2e8f0",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              minHeight: "48px",
              touchAction: "manipulation",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(6,182,212,0.12)";
              e.currentTarget.style.borderColor = "rgba(6,182,212,0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            }}
          >
            🏠 Dispatch For You
          </a>

          {passed && nextLevel && (
            <button
              onClick={onNextLevel}
              style={{
                padding: "14px",
                background: `linear-gradient(135deg,${level.color},${level.color}bb)`,
                border: "none", borderRadius: "14px",
                color: "#fff", fontSize: "15px", fontWeight: 700,
                cursor: "pointer", minHeight: "52px", touchAction: "manipulation",
                boxShadow: `0 4px 20px rgba(${level.colorRgb},0.3)`,
              }}
            >
              Уровень {nextLevel.id}: {nextLevel.title} →
            </button>
          )}
          <button
            onClick={onRestart}
            style={{
              padding: "13px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "14px",
              color: "#e2e8f0", fontSize: "14px", fontWeight: 600,
              cursor: "pointer", minHeight: "48px", touchAction: "manipulation",
            }}
          >
            🔄 Пройти ещё раз
          </button>
          <button
            onClick={onBackToMap}
            style={{
              padding: "13px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px",
              color: "#64748b", fontSize: "14px",
              cursor: "pointer", minHeight: "48px", touchAction: "manipulation",
            }}
          >
            ← Карта уровней
          </button>
        </div>
      </div>
    </div>
  );
}
