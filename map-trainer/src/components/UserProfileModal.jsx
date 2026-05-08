import { useEffect } from "react";

export default function UserProfileModal({ user, rank, progress, onClose, onLogOut }) {
  // Закрытие по ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(135deg,rgba(15,23,42,0.98),rgba(26,16,64,0.98))",
          border: `2px solid ${rank.color}55`,
          borderRadius: "20px",
          padding: "24px",
          maxWidth: "400px",
          width: "100%",
          boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${rank.color}22`,
          animation: "slideUp 0.3s ease",
        }}
      >
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#94a3b8",
            fontSize: "18px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.15)";
            e.currentTarget.style.borderColor = "#ef4444";
            e.currentTarget.style.color = "#ef4444";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = "#94a3b8";
          }}
        >
          ×
        </button>

        {/* Аватар и имя */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            margin: "0 auto 12px",
            ...(user.photoURL
              ? {
                  backgroundImage: `url(${user.photoURL})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {
                  background: "linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  fontWeight: 800,
                  color: "#fff",
                }),
            border: `3px solid ${rank.color}`,
            boxShadow: `0 4px 20px ${rank.color}44`,
          }}>
            {!user.photoURL && (user.firstName?.[0] || "U")}
          </div>

          <h2 style={{
            fontSize: "20px",
            fontWeight: 800,
            color: "#fff",
            margin: "0 0 4px 0",
          }}>
            {user.firstName} {user.lastName}
          </h2>

          <p style={{
            fontSize: "13px",
            color: "#94a3b8",
            margin: "0 0 8px 0",
          }}>
            {user.email}
          </p>

          {/* Ранг */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: `rgba(${rank.colorRgb},0.15)`,
            border: `1px solid ${rank.color}55`,
            borderRadius: "10px",
            padding: "6px 12px",
          }}>
            <span style={{ fontSize: "16px" }}>{rank.icon}</span>
            <span style={{
              fontSize: "14px",
              fontWeight: 700,
              color: rank.color,
            }}>
              {rank.title}
            </span>
          </div>
        </div>

        {/* Статистика */}
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "14px",
          padding: "16px",
          marginBottom: "16px",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}>
            <div style={{ textAlign: "center" }}>
              <p style={{
                fontSize: "24px",
                fontWeight: 900,
                color: rank.color,
                margin: "0 0 2px 0",
              }}>
                {progress.xp}
              </p>
              <p style={{
                fontSize: "11px",
                color: "#64748b",
                margin: 0,
              }}>
                Total XP
              </p>
            </div>

            <div style={{ textAlign: "center" }}>
              <p style={{
                fontSize: "24px",
                fontWeight: 900,
                color: "#22c55e",
                margin: "0 0 2px 0",
              }}>
                {Object.values(progress.levels).filter(l => l?.completed).length}
              </p>
              <p style={{
                fontSize: "11px",
                color: "#64748b",
                margin: 0,
              }}>
                Levels Completed
              </p>
            </div>
          </div>
        </div>

        {/* Кнопка выхода */}
        <button
          onClick={() => {
            onLogOut();
            onClose();
          }}
          style={{
            width: "100%",
            padding: "12px",
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "12px",
            color: "#ef4444",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.2)";
            e.currentTarget.style.borderColor = "#ef4444";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.12)";
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
          }}
        >
          🚪 Выйти из аккаунта
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
