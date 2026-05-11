import { useState, useEffect } from "react";
import { LEVELS, getRank, MAX_XP } from "../data/levels";
import UserProfileModal from "./UserProfileModal";
import LeaderboardModal from "./LeaderboardModal";
import OnboardingModal from "./OnboardingModal";
import ParticlesBackground from "./ParticlesBackground";

// Изображения для каждого уровня
const LEVEL_IMAGES = {
  1: "level-cards/1.webp",  // Рельефная карта США
  2: "level-cards/2.webp",  // Горы, штаты
  3: "level-cards/5.webp",  // Капитолий → для Регионов США
  4: "level-cards/4.webp",  // Часы + EST/CST/MST/PST
  5: "level-cards/3.webp",  // Глобус → для Столиц штатов
  6: "level-cards/6.webp",  // Изометрический город
  7: "level-cards/7.webp",  // Контейнеры с глобусом
  8: "level-cards/8.webp",  // Трак
};

export default function LevelMap({ progress, user, onSelectLevel, onReset, onLogOut }) {
  const rank = getRank(progress.xp);
  const xpPct = Math.min(100, Math.round((progress.xp / MAX_XP) * 100));
  const completedCount = LEVELS.filter((l) => progress.levels[l.id]?.completed).length;

  const [showProfile, setShowProfile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Показываем onboarding только при первом входе
  useEffect(() => {
    const key = `onboarding_done_${user?.uid || "anon"}`;
    if (!localStorage.getItem(key)) {
      setShowOnboarding(true);
    }
  }, [user]);

  const handleOnboardingComplete = () => {
    const key = `onboarding_done_${user?.uid || "anon"}`;
    localStorage.setItem(key, "1");
    setShowOnboarding(false);
  };

  return (
    <div className="level-map-root" style={{
      minHeight: "100dvh",
      background: "#0a0e17",
      position: "relative",
      overflowY: "auto",
      overflowX: "hidden",
      WebkitOverflowScrolling: "touch",
      padding: "16px 16px 32px",
      boxSizing: "border-box",
    }}>
      {/* Анимированные частицы на фоне */}
      <ParticlesBackground />

      <div style={{ maxWidth: "900px", margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* ── Шапка в стиле Legacy ── */}
        <div style={{
          background: "linear-gradient(135deg, #1a1208 0%, #2a1f10 50%, #1a1208 100%)",
          border: "2px solid #5c4a2a",
          borderRadius: "14px",
          padding: "10px 14px",
          marginBottom: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,215,0,0.1)",
        }}>
          {/* Строка 1: Home + Заголовок + Аватар */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: "8px",
          }}>
            {/* Левая часть: домой + заголовок */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <a
                href="https://dispatch4you.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  width: "30px", height: "30px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #3d2e14, #2a1f0e)",
                  border: "2px solid #8b6914",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  textDecoration: "none",
                  fontSize: "13px", color: "#d4a853", flexShrink: 0,
                }}
                title="Dispatch For You — Главная"
              >
                🏠
              </a>
              <div>
                <p style={{
                  fontSize: "20px", fontWeight: 900, color: "#f5e6c8",
                  margin: 0, lineHeight: 1.1,
                  textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                  fontFamily: "'Georgia', serif",
                }}>
                  USA Map Trainer
                </p>
                <p style={{ fontSize: "12px", color: "#8b7355", margin: "3px 0 0 0", fontStyle: "italic" }}>
                  Тренажёр для диспетчеров
                </p>
              </div>
            </div>

            {/* Аватар */}
            <button
              onClick={() => setShowProfile(true)}
              style={{
                width: "34px", height: "34px", borderRadius: "50%",
                border: "2px solid #d4a853",
                overflow: "hidden",
                cursor: "pointer",
                padding: 0,
                ...(user?.photoURL
                  ? { backgroundImage: `url(${user.photoURL})`, backgroundSize: "cover", backgroundPosition: "center" }
                  : { background: "linear-gradient(135deg, #5c4a2a, #3d2e14)" }),
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "14px", flexShrink: 0,
                boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
              }}
            >
              {!user?.photoURL && rank.icon}
            </button>
          </div>

          {/* Строка 2: XP + Рейтинг */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            {/* XP бар */}
            <div style={{ flex: 1, marginRight: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "15px", color: "#8b7355", fontWeight: 600 }}>
                  {user?.firstName || "Player"}
                </span>
                <span style={{ fontSize: "15px", color: "#d4a853", fontWeight: 700 }}>
                  ⭐ {progress.xp} / {MAX_XP} XP
                </span>
              </div>
              <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${xpPct}%`,
                  background: "linear-gradient(90deg, #d4a853, #8b6914)",
                  borderRadius: "2px",
                }} />
              </div>
            </div>

            {/* Кнопка Рейтинг */}
            <button
              onClick={() => setShowLeaderboard(true)}
              style={{
                display: "flex", alignItems: "center", gap: "5px",
                padding: "7px 14px",
                background: "linear-gradient(135deg, #3d2e14, #2a1f0e)",
                border: "1px solid #8b6914",
                borderRadius: "8px",
                color: "#d4a853", fontSize: "13px", fontWeight: 700,
                cursor: "pointer", touchAction: "manipulation",
                flexShrink: 0,
              }}
            >
              🏆 Рейтинг
            </button>
          </div>
        </div>

        {/* ── Grid карточек уровней ── */}
        <div className="level-grid" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginBottom: "16px",
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
        </div>

        {/* Нижняя панель */}
        <div style={{
          display: "flex", justifyContent: "center", alignItems: "center",
          padding: "12px 0 24px",
        }}>
          <button
            onClick={onReset}
            style={{
              padding: "8px 14px",
              background: "transparent",
              border: "1px solid rgba(92,74,42,0.3)",
              borderRadius: "8px",
              color: "#5c4a2a", fontSize: "12px",
              cursor: "pointer", touchAction: "manipulation",
            }}
          >
            Сбросить прогресс
          </button>
        </div>
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

      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      <style>{`
        .level-grid {
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 600px) {
          .level-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

// ── Карточка уровня — Legacy Edition ───────────────────
function LevelCard({ level, levelProgress, isUnlocked, isCompleted, isCurrent, isLocked, onSelect }) {
  const bestPct = levelProgress?.bestPct || 0;
  const imgSrc = `${import.meta.env.BASE_URL}${LEVEL_IMAGES[level.id]}`;

  // Цвета кнопок — яркие на тёмном фоне
  const btnColors = {
    1: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
    2: "linear-gradient(135deg, #f97316, #ea580c)",
    3: "linear-gradient(135deg, #06b6d4, #0891b2)",
    4: "linear-gradient(135deg, #22c55e, #16a34a)",
    5: "linear-gradient(135deg, #f59e0b, #d97706)",
    6: "linear-gradient(135deg, #ec4899, #db2777)",
    7: "linear-gradient(135deg, #14b8a6, #0d9488)",
    8: "linear-gradient(135deg, #ef4444, #dc2626)",
  };

  const btnLabel = isLocked
    ? "🔒"
    : isCurrent
      ? "Играть"
      : "Пройти";

  return (
    <button
      className="level-card-big"
      onClick={onSelect}
      disabled={isLocked}
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        padding: 0,
        // Деревянный/кожаный фон
        background: isLocked
          ? "linear-gradient(145deg, #0d1117 0%, #0a0e14 100%)"
          : "linear-gradient(145deg, #1a1510 0%, #12100c 50%, #1a1510 100%)",
        border: isLocked
          ? "1px solid rgba(255,255,255,0.03)"
          : "2px solid #4a3820",
        borderRadius: "14px",
        cursor: isLocked ? "default" : "pointer",
        textAlign: "left",
        touchAction: "manipulation",
        opacity: isLocked ? 0.3 : 1,
        position: "relative",
        overflow: "visible",
        width: "100%",
        minHeight: "110px",
        transition: "all 0.25s ease, transform 0.2s ease",
        boxShadow: isLocked
          ? "none"
          : "0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,215,0,0.05)",
      }}
      onMouseEnter={(e) => {
        if (!isLocked) {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = `0 8px 28px rgba(0,0,0,0.6), 0 0 12px rgba(${level.colorRgb},0.15)`;
          e.currentTarget.style.borderColor = "#6b5030";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,215,0,0.05)";
        e.currentTarget.style.borderColor = "#4a3820";
      }}
    >
      {/* Цветная полоска-прогресс внизу */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: "4px",
        background: "rgba(255,255,255,0.05)",
        borderRadius: "0 0 14px 14px",
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: isLocked ? "0%" : `${bestPct}%`,
          background: level.color,
          borderRadius: "0 0 14px 14px",
          boxShadow: bestPct > 0 ? `0 0 8px ${level.color}88` : "none",
          transition: "width 0.6s ease",
        }} />
      </div>

      {/* Левая часть: изображение */}
      <div style={{
        width: "35%",
        height: "100px",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "visible",
        padding: "8px",
      }}>
        <img
          src={imgSrc}
          alt={level.title}
          loading="lazy"
          style={{
            maxWidth: "105%",
            maxHeight: "115%",
            objectFit: "contain",
            filter: isLocked
              ? "grayscale(1) brightness(0.2)"
              : "drop-shadow(0 3px 8px rgba(0,0,0,0.5))",
          }}
        />
      </div>

      {/* Правая часть: текст + кнопка */}
      <div style={{
        flex: 1,
        padding: "12px 12px 12px 0",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "8px",
        minWidth: 0,
        position: "relative",
      }}>
        {/* Бейдж процента — золотая рамка */}
        {isCompleted && (
          <div style={{
            position: "absolute", top: "6px", right: "8px",
            background: "linear-gradient(135deg, #2a1f0e, #1a1208)",
            border: "2px solid #d4a853",
            borderRadius: "50%",
            width: "32px", height: "32px",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(212,168,83,0.3)",
          }}>
            <span style={{ fontSize: "9px", fontWeight: 900, color: "#d4a853" }}>
              {bestPct}%
            </span>
          </div>
        )}

        {/* Название */}
        <div>
          <p style={{
            fontSize: "14px", fontWeight: 800,
            color: isLocked ? "#3d3530" : "#f5e6c8",
            margin: "0 0 2px 0", lineHeight: 1.2,
            textShadow: isLocked ? "none" : "0 1px 2px rgba(0,0,0,0.5)",
          }}>
            {level.title}
          </p>
          <p style={{
            fontSize: "11px",
            color: isLocked ? "#2a2520" : "#8b7355",
            margin: 0, lineHeight: 1.3,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            paddingRight: isCompleted ? "38px" : 0,
          }}>
            {level.subtitle}
          </p>
        </div>

        {/* Кнопка + XP */}
        {!isLocked && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              padding: "6px 16px",
              background: btnColors[level.id],
              borderRadius: "18px",
              color: "#fff",
              fontSize: "11px", fontWeight: 700,
              boxShadow: `0 3px 10px rgba(${level.colorRgb},0.4)`,
              letterSpacing: "0.3px",
              border: "1px solid rgba(255,255,255,0.15)",
            }}>
              {btnLabel}
            </div>

            <span style={{
              fontSize: "11px",
              color: "#d4a853",
              fontWeight: 700,
              textShadow: "0 0 6px rgba(212,168,83,0.4)",
            }}>
              +{level.xpReward} XP
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
