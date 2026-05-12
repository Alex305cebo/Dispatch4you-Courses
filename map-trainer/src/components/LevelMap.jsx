import { useState, useEffect } from "react";
import { LEVELS, getRank, MAX_XP } from "../data/levels";
import { XP_THRESHOLDS } from "../hooks/useProgress";
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

export default function LevelMap({ progress, user, onSelectLevel, onOpenReference, onReset, onLogOut, onSignIn, isGuest = false }) {
  const rank = getRank(progress.xp);
  const xpPct = Math.min(100, Math.round((progress.xp / MAX_XP) * 100));
  const completedCount = LEVELS.filter((l) => progress.levels[l.id]?.completed).length;

  const [showProfile, setShowProfile] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [unlockedLevel, setUnlockedLevel] = useState(null);
  const [difficultyLevel, setDifficultyLevel] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Показываем onboarding только при первом входе
  useEffect(() => {
    const key = `onboarding_done_${user?.uid || "anon"}`;
    if (!localStorage.getItem(key)) {
      setShowOnboarding(true);
    }
  }, [user]);

  // Проверяем, открылся ли новый уровень
  useEffect(() => {
    const shownKey = `unlocked_shown_${user?.uid || "anon"}`;
    const alreadyShown = JSON.parse(localStorage.getItem(shownKey) || "[]");
    
    for (const [lvlId, threshold] of Object.entries(XP_THRESHOLDS)) {
      const id = Number(lvlId);
      if (progress.xp >= threshold && !alreadyShown.includes(id)) {
        const lvl = LEVELS.find(l => l.id === id);
        if (lvl) {
          setUnlockedLevel(lvl);
          localStorage.setItem(shownKey, JSON.stringify([...alreadyShown, id]));
          break;
        }
      }
    }
  }, [progress.xp, user]);

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
        {/* ── Шапка + Справочник в одну строку ── */}
        <div className="header-row" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginBottom: "12px",
        }}>
          {/* Левая: шапка */}
          <div style={{
            background: "linear-gradient(135deg, #1a1208 0%, #2a1f10 50%, #1a1208 100%)",
            border: "2px solid #5c4a2a",
            borderRadius: "14px",
            padding: "10px 14px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,215,0,0.1)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}>
            {/* Строка 1: Home + Заголовок + Аватар */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: "8px",
            }}>
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
                    fontSize: "18px", fontWeight: 900, color: "#f5e6c8",
                    margin: 0, lineHeight: 1.1,
                    textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                    fontFamily: "'Georgia', serif",
                  }}>
                    USA Map Trainer
                  </p>
                  <p style={{ fontSize: "11px", color: "#8b7355", margin: "2px 0 0 0", fontStyle: "italic" }}>
                    Тренажёр для диспетчеров
                  </p>
                </div>
              </div>

              <button
                onClick={() => isGuest ? setShowLoginPrompt(true) : setShowProfile(true)}
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
              <div style={{ flex: 1, marginRight: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "14px", color: "#8b7355", fontWeight: 600 }}>
                    {user?.firstName || "Player"}
                  </span>
                  <span style={{ fontSize: "14px", color: "#d4a853", fontWeight: 700 }}>
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

              <button
                onClick={() => setShowLeaderboard(true)}
                style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  padding: "7px 12px",
                  background: "linear-gradient(135deg, #3d2e14, #2a1f0e)",
                  border: "1px solid #8b6914",
                  borderRadius: "8px",
                  color: "#d4a853", fontSize: "12px", fontWeight: 700,
                  cursor: "pointer", touchAction: "manipulation",
                  flexShrink: 0,
                }}
              >
                🏆 Рейтинг
              </button>
            </div>
          </div>

          {/* Правая: справочник штатов */}
          <button
            onClick={() => isGuest ? setShowLoginPrompt(true) : onOpenReference()}
            style={{
              display: "block",
              padding: 0,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              touchAction: "manipulation",
              borderRadius: "14px",
              overflow: "hidden",
              transition: "transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease",
              boxShadow: "0 4px 16px rgba(0,0,0,0.4), 0 0 12px rgba(212,168,83,0.08)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.5), 0 0 20px rgba(212,168,83,0.2)";
              e.currentTarget.style.filter = "brightness(1.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.4), 0 0 12px rgba(212,168,83,0.08)";
              e.currentTarget.style.filter = "brightness(1)";
            }}
          >
            <img
              src={`${import.meta.env.BASE_URL}level-cards/reference.webp`}
              alt="Справочник штатов"
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "14px",
              }}
            />
          </button>
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
                onSelect={() => isUnlocked && (isGuest ? setShowLoginPrompt(true) : setDifficultyLevel(level))}
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
          onManageLeaderboard={() => {
            setShowProfile(false);
            setShowLeaderboard(true);
          }}
        />
      )}

      {showLeaderboard && (
        <LeaderboardModal
          currentUserId={user?.uid}
          currentUserEmail={user?.email}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {/* Popup: требуется вход */}
      {showLoginPrompt && (
        <div
          onClick={() => setShowLoginPrompt(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1003,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            padding: "20px",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1a1040 100%)",
              border: "2px solid rgba(6,182,212,0.3)",
              borderRadius: "20px",
              padding: "28px 24px",
              maxWidth: "360px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              animation: "slideUp 0.3s ease",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔒</div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#fff", margin: "0 0 8px 0" }}>
              Войди чтобы начать
            </h2>
            <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 20px 0", lineHeight: 1.5 }}>
              Прогресс сохраняется и синхронизируется между устройствами
            </p>

            <button
              onClick={() => { setShowLoginPrompt(false); onSignIn?.(); }}
              style={{
                width: "100%",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                padding: "14px 20px",
                background: "#fff",
                border: "none",
                borderRadius: "12px",
                fontSize: "15px", fontWeight: 700,
                color: "#1f2937",
                cursor: "pointer",
                touchAction: "manipulation",
                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                marginBottom: "12px",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Войти через Google
            </button>

            <button
              onClick={() => setShowLoginPrompt(false)}
              style={{
                padding: "10px 20px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                color: "#64748b", fontSize: "13px",
                cursor: "pointer", touchAction: "manipulation",
              }}
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}

      {/* Popup: выбор сложности */}
      {difficultyLevel && (
        <div
          onClick={() => setDifficultyLevel(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 1002,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            padding: "20px",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(135deg, #1a1510 0%, #12100c 50%, #1a1510 100%)",
              border: `2px solid ${difficultyLevel.color}`,
              borderRadius: "20px",
              padding: "24px 20px",
              maxWidth: "340px",
              width: "100%",
              textAlign: "center",
              boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 30px ${difficultyLevel.color}33`,
              animation: "slideUp 0.3s ease",
            }}
          >
            {/* Заголовок */}
            <div style={{ marginBottom: "16px" }}>
              <span style={{ fontSize: "28px" }}>{difficultyLevel.icon}</span>
              <p style={{ fontSize: "18px", fontWeight: 800, color: "#f5e6c8", margin: "8px 0 2px 0" }}>
                {difficultyLevel.id}. {difficultyLevel.title}
              </p>
              <p style={{ fontSize: "12px", color: "#8b7355", margin: "0 0 10px 0" }}>
                {difficultyLevel.subtitle}
              </p>
              {/* Описание уровня */}
              <div style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                padding: "10px 12px",
                textAlign: "left",
              }}>
                <p style={{ fontSize: "12px", color: "#e2e8f0", margin: 0, lineHeight: 1.5 }}>
                  {difficultyLevel.description}
                </p>
              </div>
            </div>

            {/* Кнопки режимов */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
              {/* Быстрый */}
              <button
                onClick={() => { onSelectLevel(difficultyLevel, 15); setDifficultyLevel(null); }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  borderRadius: "12px",
                  cursor: "pointer", touchAction: "manipulation",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(34,197,94,0.2)"; e.currentTarget.style.borderColor = "#22c55e"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(34,197,94,0.1)"; e.currentTarget.style.borderColor = "rgba(34,197,94,0.3)"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "18px" }}>🟢</span>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#22c55e", margin: 0 }}>Быстрый</p>
                    <p style={{ fontSize: "11px", color: "#8b7355", margin: "2px 0 0 0" }}>~3 минуты</p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "#e2e8f0", margin: 0 }}>15</p>
                  <p style={{ fontSize: "10px", color: "#64748b", margin: 0 }}>вопросов</p>
                </div>
              </button>

              {/* Стандарт */}
              <button
                onClick={() => { onSelectLevel(difficultyLevel, 30); setDifficultyLevel(null); }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "rgba(245,158,11,0.1)",
                  border: "2px solid rgba(245,158,11,0.4)",
                  borderRadius: "12px",
                  cursor: "pointer", touchAction: "manipulation",
                  transition: "all 0.15s ease",
                  boxShadow: "0 0 12px rgba(245,158,11,0.1)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(245,158,11,0.2)"; e.currentTarget.style.borderColor = "#f59e0b"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(245,158,11,0.1)"; e.currentTarget.style.borderColor = "rgba(245,158,11,0.4)"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "18px" }}>🟡</span>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#f59e0b", margin: 0 }}>Стандарт</p>
                    <p style={{ fontSize: "11px", color: "#8b7355", margin: "2px 0 0 0" }}>~7 минут</p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "#e2e8f0", margin: 0 }}>30</p>
                  <p style={{ fontSize: "10px", color: "#64748b", margin: 0 }}>вопросов</p>
                </div>
              </button>

              {/* Все штаты */}
              <button
                onClick={() => { onSelectLevel(difficultyLevel, 50); setDifficultyLevel(null); }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: "12px",
                  cursor: "pointer", touchAction: "manipulation",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.2)"; e.currentTarget.style.borderColor = "#ef4444"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "18px" }}>🔴</span>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#ef4444", margin: 0 }}>Все штаты</p>
                    <p style={{ fontSize: "11px", color: "#8b7355", margin: "2px 0 0 0" }}>~12 минут · ×1.5 XP</p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "#e2e8f0", margin: 0 }}>50</p>
                  <p style={{ fontSize: "10px", color: "#64748b", margin: 0 }}>вопросов</p>
                </div>
              </button>
            </div>

            {/* Отмена */}
            <button
              onClick={() => setDifficultyLevel(null)}
              style={{
                padding: "10px 24px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                color: "#94a3b8", fontSize: "13px", fontWeight: 600,
                cursor: "pointer", touchAction: "manipulation",
              }}
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Popup: новый уровень разблокирован */}
      {unlockedLevel && (
        <div
          onClick={() => setUnlockedLevel(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 1001,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            padding: "20px",
            animation: "fadeIn 0.3s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(135deg, #1a1510 0%, #12100c 50%, #1a1510 100%)",
              border: `2px solid ${unlockedLevel.color}`,
              borderRadius: "20px",
              padding: "28px 24px",
              maxWidth: "340px",
              width: "100%",
              textAlign: "center",
              boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 30px ${unlockedLevel.color}33`,
              animation: "slideUp 0.4s ease",
            }}
          >
            {/* Иконка */}
            <div style={{
              width: "64px", height: "64px", borderRadius: "50%",
              background: `rgba(${unlockedLevel.colorRgb},0.15)`,
              border: `3px solid ${unlockedLevel.color}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 14px",
              fontSize: "28px",
              boxShadow: `0 0 20px ${unlockedLevel.color}44`,
              animation: "resultPulse 2s ease-in-out infinite",
            }}>
              🔓
            </div>

            <p style={{ fontSize: "14px", color: "#d4a853", margin: "0 0 4px 0", fontWeight: 600 }}>
              🎉 Поздравляем!
            </p>
            <p style={{ fontSize: "20px", fontWeight: 900, color: "#f5e6c8", margin: "0 0 6px 0" }}>
              Новый уровень открыт!
            </p>
            <p style={{ fontSize: "14px", color: "#8b7355", margin: "0 0 16px 0" }}>
              Ты набрал достаточно XP
            </p>

            {/* Карточка уровня */}
            <div style={{
              background: `rgba(${unlockedLevel.colorRgb},0.1)`,
              border: `1px solid rgba(${unlockedLevel.colorRgb},0.3)`,
              borderRadius: "12px",
              padding: "14px",
              marginBottom: "16px",
            }}>
              <p style={{ fontSize: "24px", margin: "0 0 4px 0" }}>{unlockedLevel.icon}</p>
              <p style={{ fontSize: "17px", fontWeight: 800, color: "#fff", margin: "0 0 2px 0" }}>
                Уровень {unlockedLevel.id}: {unlockedLevel.title}
              </p>
              <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>
                {unlockedLevel.subtitle}
              </p>
            </div>

            {/* Кнопки */}
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setUnlockedLevel(null)}
                style={{
                  flex: 1, padding: "12px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  color: "#94a3b8", fontSize: "13px", fontWeight: 600,
                  cursor: "pointer", touchAction: "manipulation",
                }}
              >
                Позже
              </button>
              <button
                onClick={() => { setUnlockedLevel(null); onSelectLevel(unlockedLevel); }}
                style={{
                  flex: 1, padding: "12px",
                  background: `linear-gradient(135deg, ${unlockedLevel.color}, ${unlockedLevel.color}bb)`,
                  border: "none", borderRadius: "10px",
                  color: "#fff", fontSize: "13px", fontWeight: 700,
                  cursor: "pointer", touchAction: "manipulation",
                  boxShadow: `0 4px 12px rgba(${unlockedLevel.colorRgb},0.3)`,
                }}
              >
                Начать! →
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .level-grid {
          grid-template-columns: 1fr 1fr;
        }
        .header-row {
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 600px) {
          .level-grid {
            grid-template-columns: 1fr !important;
          }
          .header-row {
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
      ? "Начать"
      : "Повторить";

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
          ? "linear-gradient(145deg, #1a1510 0%, #12100c 100%)"
          : "linear-gradient(145deg, #1a1510 0%, #12100c 50%, #1a1510 100%)",
        border: isLocked
          ? "2px solid rgba(74,56,32,0.4)"
          : "2px solid #4a3820",
        borderRadius: "14px",
        cursor: isLocked ? "default" : "pointer",
        textAlign: "left",
        touchAction: "manipulation",
        opacity: 1,
        position: "relative",
        overflow: "visible",
        width: "100%",
        minHeight: "110px",
        transition: "all 0.25s ease, transform 0.2s ease",
        boxShadow: isLocked
          ? "0 2px 10px rgba(0,0,0,0.4)"
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
              ? "saturate(0.6) brightness(0.7)"
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
            fontSize: "17px", fontWeight: 800,
            color: isLocked ? "#8b7355" : "#f5e6c8",
            margin: "0 0 3px 0", lineHeight: 1.2,
            textShadow: isLocked ? "none" : "0 1px 2px rgba(0,0,0,0.5)",
          }}>
            {level.id}. {level.title}
          </p>
          <p style={{
            fontSize: "13px",
            color: isLocked ? "#8b7355" : "#8b7355",
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
              padding: "7px 18px",
              background: btnColors[level.id],
              borderRadius: "18px",
              color: "#fff",
              fontSize: "13px", fontWeight: 700,
              boxShadow: `0 3px 10px rgba(${level.colorRgb},0.4)`,
              letterSpacing: "0.3px",
              border: "1px solid rgba(255,255,255,0.15)",
            }}>
              {btnLabel}
            </div>

            <span style={{
              fontSize: "13px",
              color: "#d4a853",
              fontWeight: 700,
              textShadow: "0 0 6px rgba(212,168,83,0.4)",
            }}>
              +{level.xpReward} XP
            </span>
          </div>
        )}
        {isLocked && XP_THRESHOLDS[level.id] && (
          <div style={{
            fontSize: "13px", color: "#d4a853", fontWeight: 700,
            display: "flex", alignItems: "center", gap: "6px",
          }}>
            <span style={{ fontSize: "18px" }}>🔒</span> Нужно {XP_THRESHOLDS[level.id]} XP
          </div>
        )}
      </div>
    </button>
  );
}
