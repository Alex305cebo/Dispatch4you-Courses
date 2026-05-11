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
      minHeight: "100dvh",
      background: "linear-gradient(160deg,#060d1a 0%,#0f172a 40%,#1a1040 100%)",
      padding: "14px",
      overflowY: "auto",
      overflowX: "hidden",
      boxSizing: "border-box",
      WebkitOverflowScrolling: "touch",
    }}>
      <div style={{ width: "100%", maxWidth: "420px", margin: "0 auto" }}>

        {/* ── Верхняя панель: навигация + кнопки действий ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: "14px", gap: "8px",
        }}>
          <button
            onClick={onBackToMap}
            style={{
              padding: "8px 14px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              color: "#94a3b8", fontSize: "13px", fontWeight: 600,
              cursor: "pointer", touchAction: "manipulation",
              whiteSpace: "nowrap",
            }}
          >
            ← Уровни
          </button>

          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={onRestart}
              style={{
                padding: "8px 14px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                color: "#e2e8f0", fontSize: "13px", fontWeight: 600,
                cursor: "pointer", touchAction: "manipulation",
                whiteSpace: "nowrap",
              }}
            >
              🔄 Ещё раз
            </button>

            {passed && nextLevel && (
              <button
                onClick={onNextLevel}
                style={{
                  padding: "8px 14px",
                  background: `linear-gradient(135deg,${level.color},${level.color}bb)`,
                  border: "none", borderRadius: "10px",
                  color: "#fff", fontSize: "13px", fontWeight: 700,
                  cursor: "pointer", touchAction: "manipulation",
                  boxShadow: `0 2px 10px rgba(${level.colorRgb},0.3)`,
                  whiteSpace: "nowrap",
                }}
              >
                Далее →
              </button>
            )}
          </div>
        </div>

        {/* ── Компактный заголовок: иконка + название в строку ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          marginBottom: "12px",
        }}>
          <div style={{
            width: "40px", height: "40px",
            borderRadius: "10px",
            background: `rgba(${level.colorRgb},0.15)`,
            border: `1px solid rgba(${level.colorRgb},0.3)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px", flexShrink: 0,
          }}>
            {level.icon}
          </div>
          <div>
            <p style={{ fontSize: "11px", color: "#64748b", margin: 0 }}>Уровень {level.id}</p>
            <p style={{ fontSize: "17px", fontWeight: 800, color: "#fff", margin: 0, lineHeight: 1.2 }}>
              {level.title}
            </p>
          </div>
          {/* Оценка справа */}
          <div style={{
            marginLeft: "auto",
            width: "44px", height: "44px",
            borderRadius: "50%",
            border: `3px solid ${grade.color}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px", fontWeight: 900, color: grade.color,
            background: `${grade.color}15`,
            boxShadow: `0 0 16px ${grade.color}33`,
            flexShrink: 0,
          }}>
            {grade.letter}
          </div>
        </div>

        {/* ── Статус + XP в одну строку ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: "12px", gap: "8px",
        }}>
          {passed ? (
            <div style={{
              display: "flex", alignItems: "center", gap: "4px",
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.25)",
              borderRadius: "8px", padding: "5px 10px",
            }}>
              <span style={{ fontSize: "12px", color: "#22c55e", fontWeight: 700 }}>
                ✓ Пройден
              </span>
              {nextLevel && (
                <span style={{ fontSize: "11px", color: "#22c55e" }}>
                  → {nextLevel.title}
                </span>
              )}
            </div>
          ) : (
            <div style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "8px", padding: "5px 10px",
            }}>
              <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: 700 }}>
                Нужно {level.unlockPct}%
              </span>
            </div>
          )}

          {/* XP */}
          <div style={{
            background: `rgba(${level.colorRgb},0.1)`,
            border: `1px solid rgba(${level.colorRgb},0.25)`,
            borderRadius: "8px", padding: "5px 12px",
            display: "flex", alignItems: "center", gap: "5px",
          }}>
            <span style={{ fontSize: "13px" }}>⭐</span>
            <span style={{ fontSize: "14px", fontWeight: 800, color: level.color }}>
              +{displayXp} XP
            </span>
          </div>
        </div>

        {/* ── Очки + прогресс-бар ── */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: `1px solid rgba(${level.colorRgb},0.2)`,
          borderRadius: "14px",
          padding: "14px 16px",
          marginBottom: "10px",
        }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: "4px", marginBottom: "8px" }}>
            <span style={{ fontSize: "32px", fontWeight: 900, color: barColor, lineHeight: 1 }}>
              {score.points}
            </span>
            <span style={{ fontSize: "14px", color: "#475569" }}>/ {maxPoints}</span>
          </div>
          <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden", marginBottom: "6px" }}>
            <div style={{
              height: "100%", width: `${pct}%`,
              background: barColor, borderRadius: "3px",
              transition: "width 0.8s ease",
            }} />
          </div>
          <p style={{ fontSize: "11px", color: "#64748b", margin: 0, textAlign: "center" }}>{pct}% правильных</p>
        </div>

        {/* ── Статистика: 3 блока ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "10px" }}>
          {[
            { label: "Правильно", value: score.correct, color: "#22c55e", icon: "✓" },
            { label: "Ошибки", value: score.wrong - score.skipped, color: "#ef4444", icon: "✗" },
            { label: "Пропущено", value: score.skipped, color: "#f97316", icon: "→" },
          ].map((s) => (
            <div key={s.label} style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "10px", padding: "10px 6px", textAlign: "center",
            }}>
              <p style={{ fontSize: "18px", fontWeight: 700, color: s.color, margin: "0 0 2px 0" }}>
                {s.icon} {s.value}
              </p>
              <p style={{ fontSize: "10px", color: "#64748b", margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Слабые штаты ── */}
        {weakStates && weakStates.length > 0 && (
          <div style={{
            background: "rgba(239,68,68,0.05)",
            border: "1px solid rgba(239,68,68,0.12)",
            borderRadius: "12px",
            padding: "10px 14px",
            marginBottom: "10px",
          }}>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#ef4444", margin: "0 0 6px 0" }}>
              📌 Повтори:
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {weakStates.map((s) => (
                <span key={s.id} style={{
                  fontSize: "12px", color: "#e2e8f0",
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  padding: "3px 8px", borderRadius: "6px",
                }}>
                  {s.name} <span style={{ color: "#ef4444", fontSize: "10px" }}>×{s.wrong}</span>
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
