import { MODES } from "../data/quizConfig";

const COLOR_RGBA = {
  "#06b6d4": "6,182,212",
  "#8b5cf6": "139,92,246",
  "#22c55e": "34,197,94",
  "#f59e0b": "245,158,11",
  "#f97316": "249,115,22",
};

export default function ModeSelect({ onSelect }) {
  return (
    <div style={{
      minHeight: "100dvh",
      background: "linear-gradient(135deg,#0f172a 0%,#1e293b 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}>
      {/* Заголовок */}
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <div style={{ fontSize: "44px", marginBottom: "10px" }}>🇺🇸</div>
        <h1 style={{ fontSize: "26px", fontWeight: 900, color: "#fff", margin: "0 0 6px 0" }}>
          USA Map Trainer
        </h1>
        <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>
          Тренажёр географии для диспетчеров
        </p>
      </div>

      {/* Режимы */}
      <div style={{ width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {MODES.map((mode) => {
          const rgba = COLOR_RGBA[mode.color] || "6,182,212";
          return (
            <button
              key={mode.id}
              onClick={() => onSelect(mode.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "14px 18px",
                background: "rgba(255,255,255,0.05)",
                border: `1px solid rgba(${rgba},0.25)`,
                borderRadius: "14px",
                cursor: "pointer",
                textAlign: "left",
                touchAction: "manipulation",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `rgba(${rgba},0.1)`;
                e.currentTarget.style.borderColor = `rgba(${rgba},0.5)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.borderColor = `rgba(${rgba},0.25)`;
              }}
            >
              <span style={{ fontSize: "26px" }}>{mode.icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "15px", fontWeight: 700, color: "#fff", margin: "0 0 2px 0" }}>
                  {mode.title}
                </p>
                <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>
                  {mode.desc}
                </p>
              </div>
              <span style={{ fontSize: "16px", color: mode.color }}>→</span>
            </button>
          );
        })}
      </div>

      <p style={{ fontSize: "11px", color: "#334155", marginTop: "20px", textAlign: "center" }}>
        Dispatcher Training · USA Geography
      </p>
    </div>
  );
}
