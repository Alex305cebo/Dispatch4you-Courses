export default function TimerBar({ timeLeft, pct, color, totalSeconds }) {
  if (!totalSeconds) return null;

  const urgent = pct <= 25;

  return (
    <div style={{ marginBottom: "10px", flexShrink: 0 }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "4px",
      }}>
        <span style={{ fontSize: "11px", color: "#94a3b8" }}>⏱ Время</span>
        <span style={{
          fontSize: "13px",
          fontWeight: 700,
          color,
          animation: urgent ? "pulse 0.6s ease-in-out infinite" : "none",
        }}>
          {timeLeft}s
        </span>
      </div>
      <div style={{
        height: "5px",
        background: "rgba(255,255,255,0.08)",
        borderRadius: "3px",
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: color,
          borderRadius: "3px",
          transition: "width 1s linear, background 0.5s ease",
        }} />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
