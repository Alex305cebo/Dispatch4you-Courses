import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { getRank } from "../data/levels";

// Список email суперюзеров
const SUPER_USERS = ["dersire.der@gmail.com"];

export default function LeaderboardModal({ currentUserId, currentUserEmail, onClose }) {
  const isAdmin = SUPER_USERS.includes(currentUserEmail);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const q = query(
        collection(db, "progress"),
        orderBy("xp", "desc"),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs
        .map((doc) => ({ uid: doc.id, ...doc.data() }))
        .filter((p) => (p.xp || 0) > 0 && !p.hidden);
      console.log("[Leaderboard] Loaded players:", data.length);
      setPlayers(data);
    } catch (err) {
      console.error("[Leaderboard] Failed to load:", err);
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  // Админ: скрыть игрока из рейтинга
  const hidePlayer = async (uid) => {
    if (!confirm("Скрыть этого игрока из рейтинга?")) return;
    try {
      await updateDoc(doc(db, "progress", uid), { hidden: true });
      setPlayers((prev) => prev.filter((p) => p.uid !== uid));
    } catch (err) {
      console.error("[Admin] Failed to hide player:", err);
    }
  };

  // Админ: удалить игрока полностью
  const deletePlayer = async (uid) => {
    if (!confirm("УДАЛИТЬ этого игрока из базы? Это необратимо!")) return;
    try {
      await deleteDoc(doc(db, "progress", uid));
      setPlayers((prev) => prev.filter((p) => p.uid !== uid));
    } catch (err) {
      console.error("[Admin] Failed to delete player:", err);
    }
  };

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
          border: "2px solid rgba(6,182,212,0.3)",
          borderRadius: "20px",
          padding: "24px",
          maxWidth: "500px",
          width: "100%",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          animation: "slideUp 0.3s ease",
        }}
      >
        {/* Заголовок */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "24px" }}>🏆</span>
            <h2 style={{
              fontSize: "20px",
              fontWeight: 800,
              color: "#fff",
              margin: 0,
            }}>
              Рейтинг игроков
            </h2>
            {isAdmin && (
              <span style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#f59e0b",
                background: "rgba(245,158,11,0.15)",
                border: "1px solid rgba(245,158,11,0.3)",
                borderRadius: "6px",
                padding: "3px 8px",
              }}>
                ADMIN
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            style={{
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
        </div>

        {/* Список игроков */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{
                width: "32px",
                height: "32px",
                border: "3px solid rgba(255,255,255,0.1)",
                borderTopColor: "#06b6d4",
                borderRadius: "50%",
                margin: "0 auto",
                animation: "spin 0.8s linear infinite",
              }} />
              <p style={{ fontSize: "13px", color: "#64748b", marginTop: "12px" }}>
                Загрузка рейтинга...
              </p>
            </div>
          ) : players.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: "14px", color: "#64748b" }}>
                Пока нет игроков в рейтинге
              </p>
            </div>
          ) : (
            players.map((player, index) => {
              const rank = getRank(player.xp || 0);
              const isCurrentUser = player.uid === currentUserId;
              const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : null;

              return (
                <div
                  key={player.uid}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 12px",
                    background: isCurrentUser
                      ? "rgba(6,182,212,0.12)"
                      : "rgba(255,255,255,0.04)",
                    border: isCurrentUser
                      ? "1px solid rgba(6,182,212,0.4)"
                      : "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    transition: "all 0.2s",
                  }}
                >
                  {/* Место */}
                  <div style={{
                    width: "32px",
                    textAlign: "center",
                    fontSize: medal ? "20px" : "14px",
                    fontWeight: 700,
                    color: medal ? "#fff" : "#64748b",
                  }}>
                    {medal || `#${index + 1}`}
                  </div>

                  {/* Аватар */}
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    ...(player.photoURL
                      ? {
                          backgroundImage: `url(${player.photoURL})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : {
                          background: "linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "16px",
                          fontWeight: 800,
                          color: "#fff",
                        }),
                    border: `2px solid ${rank.color}`,
                    flexShrink: 0,
                  }}>
                    {!player.photoURL && (player.firstName?.[0] || "P")}
                  </div>

                  {/* Имя и ранг */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: isCurrentUser ? "#06b6d4" : "#e2e8f0",
                      margin: "0 0 2px 0",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {player.firstName || "Player"} {player.lastName || ""}
                      {isCurrentUser && " (Вы)"}
                    </p>
                    <p style={{
                      fontSize: "11px",
                      color: rank.color,
                      margin: 0,
                    }}>
                      {rank.icon} {rank.title}
                    </p>
                  </div>

                  {/* XP */}
                  <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: "6px" }}>
                    <div>
                      <p style={{
                        fontSize: "16px",
                        fontWeight: 900,
                        color: rank.color,
                        margin: 0,
                      }}>
                        {player.xp || 0}
                      </p>
                      <p style={{
                        fontSize: "10px",
                        color: "#64748b",
                        margin: 0,
                      }}>
                        XP
                      </p>
                    </div>

                    {/* Админ-кнопки */}
                    {isAdmin && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); hidePlayer(player.uid); }}
                          title="Скрыть из рейтинга"
                          style={{
                            width: "22px", height: "22px", borderRadius: "4px",
                            background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)",
                            color: "#f59e0b", fontSize: "11px", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            padding: 0,
                          }}
                        >
                          👁
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deletePlayer(player.uid); }}
                          title="Удалить из базы"
                          style={{
                            width: "22px", height: "22px", borderRadius: "4px",
                            background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
                            color: "#ef4444", fontSize: "11px", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            padding: 0,
                          }}
                        >
                          🗑
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
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
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
