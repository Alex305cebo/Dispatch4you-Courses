import { useState } from "react";
import { LEVELS, getRank, MAX_XP } from "../data/levels";
import UserProfileModal from "./UserProfileModal";
import LeaderboardModal from "./LeaderboardModal";

export default function LevelMap({ progress, user, onSelectLevel, onReset, onLogOut }) {
  const rank = getRank(progress.xp);
  const xpPct = Math.min(100, Math.round((progress.xp / MAX_XP) * 100));
  const completedCount = LEVELS.filter((l) => progress.levels[l.id]?.completed).length;

  const [showProfile, setShowProfile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  return (
    <div className="level-map-root" style={{
      minHeight: "100dvh",
      maxHeight: "100dvh",
      background: "linear-gradient(160deg,#060d1a 0%,#0f172a 50%,#1a1040 100%)",
      display: "flex",
      flexDirection: "column",
      overflowY: "auto",
      overflowX: "hidden",
      WebkitOverflowScrolling: "touch",
      padding: "14px",
      boxSizing: "border-box",
      maxWidth: "800px",
      margin: "0 auto",
    }}>

      {/* ── Шапка ── */}
      <div style={{ flexShrink: 0, marginBottom: "10px" }}>

        {/* Верхняя строка: Заголовок + Пользователь */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "8px",
        }}>
          {/* Заголовок */}
          <div style={{
            flex: 1,
            minWidth: 0,
          }}>
            <p style={{
              fontSize: "18px",
              fontWeight: 900,
              color: "#fff",
              margin: 0,
              letterSpacing: "-0.5px",
              lineHeight: 1.1,
            }}>
              USA Map Trainer
            </p>
            <p style={{
              fontSize: "11px",
              color: "#64748b",
              margin: "2px 0 0 0",
            }}>
              Тренажёр для диспетчеров
            </p>
          </div>

          {/* Карточка пользователя */}
          <button
            onClick={() => setShowProfile(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(255,255,255,0.06)",
              border: `1px solid ${rank.color}55`,
              borderRadius: "10px",
              padding: "4px 8px 4px 4px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              e.currentTarget.style.borderColor = rank.color;
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = `0 4px 12px ${rank.color}44`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
              e.currentTarget.style.borderColor = `${rank.color}55`;
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {/* Аватар */}
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              ...(user?.photoURL
                ? {
                    backgroundImage: `url(${user.photoURL})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : {
                    background: "linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)",
                  }),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(167,139,250,0.3)",
            }}>
              {!user?.photoURL && rank.icon}
            </div>

            {/* Имя и XP */}
            <div style={{ textAlign: "left", minWidth: 0 }}>
              <p style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#e2e8f0",
                margin: 0,
                lineHeight: 1.1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "100px",
              }}>
                {user?.firstName || "Player"}
              </p>
              <p style={{
                fontSize: "11px",
                fontWeight: 700,
                color: rank.color,
                margin: "2px 0 0 0",
                lineHeight: 1,
              }}>
                ⭐ {progress.xp} XP
              </p>
            </div>
          </button>
        </div>

        {/* Прогресс-бар XP */}
        <div style={{ marginBottom: "8px" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "3px",
          }}>
            <span style={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>
              Прогресс
            </span>
            <span style={{ fontSize: "10px", color: "#e2e8f0", fontWeight: 700 }}>
              {progress.xp} / {MAX_XP} XP
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
              width: `${xpPct}%`,
              background: `linear-gradient(90deg, ${rank.color}, ${rank.color}bb)`,
              borderRadius: "3px",
              transition: "width 0.6s ease",
              boxShadow: `0 0 6px ${rank.color}66`,
            }} />
          </div>
        </div>

        {/* Нижняя строка: Dispatch4You + Рейтинг */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "6px",
          marginBottom: "8px",
        }}>
          {/* Кнопка Dispatch4You */}
          <a
            href="https://dispatch4you.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "7px 10px",
              borderRadius: "8px",
              background: "rgba(6,182,212,0.1)",
              border: "1px solid rgba(6,182,212,0.3)",
              textDecoration: "none",
              transition: "all 0.2s ease",
              boxShadow: "0 0 12px rgba(6,182,212,0.2)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(6,182,212,0.15)";
              e.currentTarget.style.borderColor = "rgba(6,182,212,0.5)";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(6,182,212,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(6,182,212,0.1)";
              e.currentTarget.style.borderColor = "rgba(6,182,212,0.3)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 0 12px rgba(6,182,212,0.2)";
            }}
            title="Dispatch For You"
          >
            <span style={{
              fontSize: "13px",
              fontWeight: 800,
              color: "#06b6d4",
              textShadow: "0 0 8px rgba(6,182,212,0.6)",
              letterSpacing: "0.2px",
            }}>
              Dispatch4You
            </span>
          </a>

          {/* Кнопка Рейтинга */}
          <button
            onClick={() => setShowLeaderboard(true)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              padding: "7px 10px",
              background: "rgba(245,158,11,0.1)",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: "8px",
              color: "#fbbf24",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(245,158,11,0.15)";
              e.currentTarget.style.borderColor = "#f59e0b";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(245,158,11,0.1)";
              e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span style={{ fontSize: "14px" }}>🏆</span>
            <span>Рейтинг</span>
          </button>
        </div>

        {/* Уровни прогресс */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: "6px",
        }}>
          <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>
            Уровни пройдены
          </span>
          <span style={{ fontSize: "11px", color: "#e2e8f0", fontWeight: 700 }}>
            {completedCount}/8
          </span>
        </div>

        {/* Точки прогресса уровней */}
        <div style={{ display: "flex", gap: "4px" }}>
          {LEVELS.map((level) => {
            const lp = progress.levels[level.id];
            const isCompleted = lp?.completed;
            const isUnlocked = lp?.unlocked;
            return (
              <div key={level.id} style={{
                flex: 1,
                height: "6px",
                borderRadius: "4px",
                background: isCompleted
                  ? level.color
                  : isUnlocked
                    ? `${level.color}44`
                    : "rgba(255,255,255,0.07)",
                transition: "background 0.3s",
                boxShadow: isCompleted ? `0 0 6px ${level.color}66` : "none",
              }} />
            );
          })}
        </div>
      </div>

      {/* ── Список уровней ── */}
      <div className="level-list" style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}>
        {LEVELS.map((level) => {
          const lp = progress.levels[level.id];
          const isUnlocked = lp?.unlocked;
          const isCompleted = lp?.completed;
          const isCurrent = isUnlocked && !isCompleted;
          const isLocked = !isUnlocked;

          return (
            <LevelCard
              key={level.id}
              level={level}
              levelProgress={lp}
              isUnlocked={isUnlocked}
              isCompleted={isCompleted}
              isCurrent={isCurrent}
              isLocked={isLocked}
              onSelect={() => isUnlocked && onSelectLevel(level)}
            />
          );
        })}

        {/* Сброс */}
        <button
          onClick={onReset}
          style={{
            padding: "6px",
            background: "transparent",
            border: "none",
            color: "#334155",
            fontSize: "12px",
            cursor: "pointer",
            touchAction: "manipulation",
            flexShrink: 0,
          }}
        >
          Сбросить прогресс
        </button>
      </div>

      {/* Модальные окна */}
      {showProfile && (
        <UserProfileModal
          user={user}
          rank={rank}
          progress={progress}
          onClose={() => setShowProfile(false)}
          onLogOut={onLogOut}
        />
      )}

      {showLeaderboard && (
        <LeaderboardModal
          currentUserId={user?.uid}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      <style>{`
        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(6,182,212,0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(6,182,212,0.6);
          }
        }
      `}</style>
    </div>
  );
}

// ── Карточка уровня ───────────────────────────────
function LevelCard({ level, levelProgress, isUnlocked, isCompleted, isCurrent, isLocked, onSelect }) {
  const bestPct = levelProgress?.bestPct || 0;

  return (
    <button
      className="level-card"
      onClick={onSelect}
      disabled={isLocked}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "9px 12px",
        background: isLocked
          ? "rgba(255,255,255,0.02)"
          : isCurrent
            ? `linear-gradient(135deg,rgba(${level.colorRgb},0.16),rgba(${level.colorRgb},0.05))`
            : isCompleted
              ? `linear-gradient(135deg,rgba(${level.colorRgb},0.1),rgba(${level.colorRgb},0.03))`
              : "rgba(255,255,255,0.03)",
        border: isLocked
          ? "1px solid rgba(255,255,255,0.05)"
          : isCurrent
            ? `1px solid rgba(${level.colorRgb},0.5)`
            : `1px solid rgba(${level.colorRgb},0.22)`,
        borderRadius: "14px",
        cursor: isLocked ? "default" : "pointer",
        textAlign: "left",
        touchAction: "manipulation",
        opacity: isLocked ? 0.45 : 1,
        position: "relative",
        overflow: "hidden",
        width: "100%",
        flexShrink: 0,
      }}
    >
      {/* Свечение для текущего */}
      {isCurrent && (
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 15% 50%, rgba(${level.colorRgb},0.08) 0%, transparent 65%)`,
          pointerEvents: "none",
        }} />
      )}

      {/* Иконка */}
      <div style={{
        width: "38px", height: "38px",
        borderRadius: "11px",
        background: isLocked ? "rgba(255,255,255,0.04)" : `rgba(${level.colorRgb},0.14)`,
        border: isLocked ? "1px solid rgba(255,255,255,0.07)" : `1px solid rgba(${level.colorRgb},0.3)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "18px", flexShrink: 0, position: "relative",
      }}>
        {isLocked ? "🔒" : level.icon}
        {/* Номер */}
        <div style={{
          position: "absolute", bottom: "-4px", right: "-4px",
          width: "15px", height: "15px", borderRadius: "50%",
          background: isLocked ? "#1e293b" : level.color,
          border: "2px solid #0a0f1e",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "8px", fontWeight: 900,
          color: isLocked ? "#475569" : "#fff",
        }}>
          {level.id}
        </div>
      </div>

      {/* Текст */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
          <p style={{
            fontSize: "14px", fontWeight: 700,
            color: isLocked ? "#475569" : "#e2e8f0",
            margin: 0, lineHeight: 1,
          }}>
            {level.title}
          </p>
          {isCompleted && (
            <span style={{
              fontSize: "10px", fontWeight: 700, color: level.color,
              background: `rgba(${level.colorRgb},0.18)`,
              padding: "2px 6px", borderRadius: "4px", flexShrink: 0,
            }}>
              ✓ {bestPct}%
            </span>
          )}
          {isCurrent && (
            <span style={{
              fontSize: "10px", fontWeight: 700, color: level.color,
              background: `rgba(${level.colorRgb},0.18)`,
              padding: "2px 6px", borderRadius: "4px", flexShrink: 0,
            }}>
              ▶ ИГРАТЬ
            </span>
          )}
        </div>
        <p style={{
          fontSize: "12px",
          color: isLocked ? "#334155" : "#94a3b8",
          margin: 0,
          lineHeight: 1.3,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {level.subtitle}
        </p>
        {/* Мини прогресс-полоска */}
        {isUnlocked && bestPct > 0 && (
          <div style={{
            height: "3px", background: "rgba(255,255,255,0.07)",
            borderRadius: "2px", overflow: "hidden", marginTop: "4px",
          }}>
            <div style={{
              height: "100%", width: `${bestPct}%`,
              background: level.color, borderRadius: "2px",
            }} />
          </div>
        )}
      </div>

      {/* Правая часть */}
      <div style={{ flexShrink: 0, textAlign: "right" }}>
        {isLocked ? (
          <span style={{ fontSize: "11px", color: "#475569" }}>ур.{level.id - 1}</span>
        ) : (
          <div>
            <div style={{ fontSize: "12px", color: level.color, fontWeight: 700 }}>
              +{level.xpReward}XP
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8" }}>
              {level.questions}q {level.timePerQ ? `⏱${level.timePerQ}s` : "∞"}
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
