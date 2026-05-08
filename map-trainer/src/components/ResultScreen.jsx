export default function ResultScreen({ score, total, maxPoints, weakStates, onRestart, onChangeMode }) {
  const pct = Math.round((score.points / maxPoints) * 100);

  const grade =
    pct >= 90 ? { letter: "S", color: "#f59e0b", label: "Идеально! Ты знаешь карту как профи." } :
    pct >= 75 ? { letter: "A", color: "#22c55e", label: "Отличный результат!" } :
    pct >= 55 ? { letter: "B", color: "#06b6d4", label: "Неплохо, но есть куда расти." } :
    pct >= 35 ? { letter: "C", color: "#f97316", label: "Нужно больше практики." } :
                { letter: "D", color: "#ef4444", label: "Продолжай учиться!" };

  const barColor = pct > 60 ? "#06b6d4" : pct > 30 ? "#f97316" : "#ef4444";

  return (
    <div style={{
      minHeight: "100dvh",
      background: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      overflowY: "auto",
    }}>
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(6,182,212,0.2)",
        borderRadius: "20px",
        padding: "28px 24px",
        maxWidth: "420px",
        width: "100%",
        textAlign: "center",
      }}>
        {/* Оценка */}
        <div style={{
          width: "72px", height: "72px",
          borderRadius: "50%",
          border: `3px solid ${grade.color}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 14px",
          fontSize: "32px", fontWeight: 900, color: grade.color,
          background: `${grade.color}18`,
        }}>
          {grade.letter}
        </div>

        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", margin: "0 0 5px 0" }}>
          Квиз завершён!
        </h2>
        <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 20px 0" }}>
          {grade.label}
        </p>

        {/* Итоговые очки */}
        <div style={{
          background: "linear-gradient(135deg,rgba(6,182,212,0.1),rgba(14,165,233,0.06))",
          border: "2px solid rgba(6,182,212,0.25)",
          borderRadius: "14px",
          padding: "14px",
          marginBottom: "16px",
        }}>
          <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 5px 0" }}>Итоговые очки</p>
          <p style={{ fontSize: "36px", fontWeight: 900, color: barColor, margin: "0 0 8px 0", lineHeight: 1 }}>
            {score.points}
            <span style={{ fontSize: "16px", color: "#475569", fontWeight: 400 }}> / {maxPoints}</span>
          </p>
          <div style={{ height: "7px", background: "rgba(255,255,255,0.08)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${pct}%`,
              background: barColor, borderRadius: "4px",
              transition: "width 0.6s ease",
            }} />
          </div>
          <p style={{ fontSize: "11px", color: "#64748b", margin: "5px 0 0 0" }}>{pct}% от максимума</p>
        </div>

        {/* Детальная статистика */}
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
              <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Слабые штаты */}
        {weakStates && weakStates.length > 0 && (
          <div style={{
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: "12px",
            padding: "12px 14px",
            marginBottom: "16px",
            textAlign: "left",
          }}>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#ef4444", margin: "0 0 8px 0" }}>
              📌 Повтори эти штаты:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {weakStates.map((s) => (
                <div key={s.id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ fontSize: "13px", color: "#e2e8f0" }}>{s.name}</span>
                  <span style={{
                    fontSize: "11px", color: "#ef4444",
                    background: "rgba(239,68,68,0.15)",
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
          <button
            onClick={onRestart}
            style={{
              padding: "13px",
              background: "linear-gradient(135deg,#06b6d4,#0284c7)",
              border: "none", borderRadius: "12px",
              color: "#fff", fontSize: "15px", fontWeight: 700,
              cursor: "pointer", minHeight: "48px", touchAction: "manipulation",
            }}
          >
            🔄 Играть снова
          </button>
          <button
            onClick={onChangeMode}
            style={{
              padding: "13px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "12px",
              color: "#e2e8f0", fontSize: "14px",
              cursor: "pointer", minHeight: "48px", touchAction: "manipulation",
            }}
          >
            ← Выбрать режим
          </button>
        </div>
      </div>
    </div>
  );
}
