import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useProgressStore } from '../../store/useProgressStore';
import { useUIStore } from '../../store/useUIStore';
import { useFirestoreSync } from '../../hooks/useFirestoreSync';
import { shouldRemindStreak } from '../../logic/streak-reminder';
import { showLocalNotification } from '../../services/notifications';
import { ACHIEVEMENTS, getAchievementById } from '../../logic/achievements';
import LevelUpModal from '../common/LevelUpModal';
import AchievementModal from '../common/AchievementModal';

/**
 * Application layout wrapper — Premium design.
 * Provides a fixed glass-morphism header (Logo, Level badge, XP bar, Streak)
 * and a mobile-style bottom navigation bar.
 * Visible on ALL pages, plus a Toast notification layer.
 */
export default function AppLayout() {
  const { totalXP, level, taskScores } = useProgressStore();
  const currentStreak = useProgressStore((s) => s.currentStreak);
  const finalExamPassed = useProgressStore((s) => s.finalExamPassed);
  const miniExamPassed = useProgressStore((s) => s.miniExamPassed);
  const flashcardStates = useProgressStore((s) => s.flashcardStates);
  const dayStatuses = useProgressStore((s) => s.dayStatuses);
  const lastActivityDate = useProgressStore((s) => s.lastActivityDate);
  const checkAchievements = useProgressStore((s) => s.checkAchievements);
  const unlockedAchievements = useProgressStore((s) => s.unlockedAchievements);
  const { toastMessage } = useUIStore();
  const showToast = useUIStore((s) => s.showToast);
  const navigate = useNavigate();
  const location = useLocation();
  const [showAchievementsPanel, setShowAchievementsPanel] = useState(false);
  const [showSiteConfirm, setShowSiteConfirm] = useState(false);
  useFirestoreSync();

  // Re-evaluate achievements whenever any contributing progress changes.
  // New badges surface a toast and persist via the store.
  useEffect(() => {
    checkAchievements();
  }, [
    checkAchievements,
    totalXP,
    level,
    currentStreak,
    finalExamPassed,
    Object.keys(taskScores).length,
    Object.values(miniExamPassed).filter(Boolean).length,
    Object.keys(flashcardStates).length,
    Object.values(dayStatuses).filter((s) => s === 'completed').length,
  ]);

  // Remind the learner to keep their streak — once per day, on app open.
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0] ?? '';
    if (!shouldRemindStreak(currentStreak, lastActivityDate, today)) return;
    const key = `streak-reminded-${today}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      /* sessionStorage unavailable — still show the in-app reminder */
    }
    showToast(`🔥 Серия ${currentStreak} дн.! Пройди урок сегодня, чтобы не потерять её.`);
    showLocalNotification(
      'Не теряй серию! 🔥',
      `Твоя серия — ${currentStreak} дн. Пройди урок сегодня, чтобы сохранить её.`
    );
  }, [currentStreak, lastActivityDate, showToast]);

  // Bottom nav always visible
  const hideBottomNav = false;

  // Bottom nav items
  const navItems = [
    { path: '/', icon: '🗺️', label: 'Карта' },
    { path: '/flashcards', icon: '📚', label: 'Карточки' },
    { path: '/glossary', icon: '📖', label: 'Словарь' },
    { path: '/settings', icon: '⚙️', label: 'Настройки' },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white particles-bg">
      {/* Fixed Premium Header — hidden on lesson/exam pages */}
      {!hideBottomNav && (
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/5">
        <div className="max-w-lg mx-auto px-3 py-2">
          {/* Row: Logo | XP + Progress | Avatar */}
          <div className="flex items-center gap-3">
            {/* Logo — clickable to site with confirmation */}
            <button
              onClick={() => setShowSiteConfirm(true)}
              className="shrink-0 flex flex-col hover:opacity-80 transition-opacity cursor-pointer"
              aria-label="Перейти на сайт dispatch4you.com"
            >
              <p className="text-sm font-bold text-gradient">Dispatch Academy</p>
              <p className="text-[10px] text-slate-400">→ перейти на сайт</p>
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* XP + map progress bar */}
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-xs font-bold text-cyan-400">{totalXP} XP</span>
                <div className="w-36 h-2.5 bg-transparent rounded-full overflow-hidden border border-white/50 relative">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-green-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round(((level - 1) / 11) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Achievements chip (right) — shows unlocked count, opens panel */}
            <button
              onClick={() => setShowAchievementsPanel(true)}
              className="shrink-0 flex items-center gap-1 pl-1.5 pr-2 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 hover:bg-amber-500/25 active:scale-95 transition-all"
              aria-label="Достижения и рейтинг"
            >
              {unlockedAchievements.length === 0 ? (
                <span className="text-sm leading-none">🏆</span>
              ) : (
                <span className="text-sm leading-none">
                  {getAchievementById(unlockedAchievements[unlockedAchievements.length - 1]!)?.icon ?? '🏅'}
                </span>
              )}
              <span className="text-[10px] font-bold text-amber-300 leading-none">
                {unlockedAchievements.length}/{ACHIEVEMENTS.length}
              </span>
            </button>
          </div>
        </div>
      </header>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10" style={{ WebkitOverflowScrolling: 'touch' }}>
        <Outlet />
      </main>

      {/* Bottom Navigation Bar */}
      {!hideBottomNav && (
      <nav className="shrink-0 z-50 px-3 py-1.5 bg-slate-950">
        {/* Gradient divider line */}
        <div className="h-[2px] mb-2 bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />
        <div className="max-w-lg mx-auto flex items-stretch justify-center gap-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/map');
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex-1 max-w-[88px] flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-2xl transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:text-white hover:bg-slate-700/60'
                }`}
                aria-label={item.label}
              >
                <span className="text-lg leading-none">{item.icon}</span>
                <span className="text-[11px] font-bold leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      )}

      {/* Achievements + Leaderboard Panel */}
      {showAchievementsPanel && (() => {
        const scores = Object.values(taskScores);
        const correct = scores.filter((s: any) => s?.correct).length;
        const accuracy = scores.length > 0 ? Math.round((correct / scores.length) * 100) : 0;
        const leaders = [
          ...(totalXP > 0 ? [{ name: 'Вы', xp: totalXP, level, accuracy, isLocal: true }] : []),
        ].sort((a, b) => b.xp - a.xp).map((e, i) => ({ ...e, rank: i + 1 }));
        const unlockedSet = new Set(unlockedAchievements);

        return (
          <div
            className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAchievementsPanel(false)}
          >
            <div
              className="w-full max-w-lg max-h-[82vh] rounded-t-3xl bg-slate-900 border-t border-white/10 shadow-2xl flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag handle + header */}
              <div className="flex flex-col items-center pt-3 pb-2 border-b border-white/8">
                <div className="w-10 h-1 rounded-full bg-white/20 mb-3" />
                <div className="flex items-center justify-between w-full px-4">
                  <h2 className="text-base font-bold text-white">
                    🏅 Достижения
                    <span className="ml-2 text-sm font-normal text-amber-400">
                      {unlockedAchievements.length}/{ACHIEVEMENTS.length}
                    </span>
                  </h2>
                  <button
                    onClick={() => setShowAchievementsPanel(false)}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white text-sm transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* Achievements grid — 4 columns */}
                <div className="px-3 pt-3 pb-1">
                  <div className="grid grid-cols-4 gap-2">
                    {ACHIEVEMENTS.map((ach) => {
                      const unlocked = unlockedSet.has(ach.id);
                      return (
                        <div
                          key={ach.id}
                          className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                            unlocked
                              ? 'bg-amber-500/10 border-amber-400/30'
                              : 'bg-slate-800/50 border-slate-700/30 opacity-40'
                          }`}
                          title={ach.description}
                        >
                          <span className={`text-2xl leading-none ${unlocked ? '' : 'grayscale'}`}>
                            {ach.icon}
                          </span>
                          <p className="text-[9px] font-semibold text-center leading-tight text-slate-200 line-clamp-2">
                            {ach.title}
                          </p>
                          {!unlocked && (
                            <p className="text-[8px] text-slate-500 text-center leading-tight line-clamp-2">
                              {ach.description}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Leaderboard section */}
                <div className="px-3 pt-3 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-px flex-1 bg-white/8" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">🏆 Рейтинг</p>
                    <div className="h-px flex-1 bg-white/8" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {leaders.length === 0 && (
                      <p className="text-center text-slate-500 text-xs py-4">Пока нет игроков с очками</p>
                    )}
                    {leaders.map((entry) => {
                      const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : '';
                      return (
                        <div
                          key={entry.rank}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${
                            entry.isLocal
                              ? 'bg-cyan-500/10 border-cyan-500/30'
                              : 'bg-white/3 border-white/8'
                          }`}
                        >
                          <span className="w-7 text-center font-bold text-sm text-slate-300">
                            {medal || `#${entry.rank}`}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold truncate ${entry.isLocal ? 'text-cyan-300' : 'text-white'}`}>
                              {entry.name}
                            </p>
                            <p className="text-[10px] text-slate-400">Ур. {entry.level} · {entry.accuracy}%</p>
                          </div>
                          <span className={`text-xs font-bold ${entry.isLocal ? 'text-cyan-400' : 'text-slate-300'}`}>
                            {entry.xp} XP
                          </span>
                        </div>
                      );
                    })}
                    <p className="text-[9px] text-slate-600 text-center pt-1">Данные обновятся с Firebase</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Level-Up Celebration Modal */}
      <LevelUpModal />

      {/* Achievement Unlocked Modal */}
      <AchievementModal />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 glass-card rounded-xl shadow-2xl text-sm text-white max-w-xs text-center animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* Site Confirmation Modal */}
      {showSiteConfirm && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowSiteConfirm(false)}
        >
          <div
            className="w-full max-w-xs rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient line */}
            <div className="h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500" />
             
            <div className="px-4 py-4">
              <h3 className="text-base font-bold text-white mb-2">Перейти на сайт?</h3>
              <p className="text-sm text-slate-400 mb-3">Вы будете перенаправлены на dispatch4you.com</p>
              <p className="text-xs text-slate-500 p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40">💡 Внизу экрана находятся три кнопки для перехода на <strong>Карту</strong>, <strong>Карточки</strong> и <strong>Настройки</strong></p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 px-4 pb-4">
              <button
                onClick={() => setShowSiteConfirm(false)}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm font-semibold text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  setShowSiteConfirm(false);
                  window.location.href = 'https://dispatch4you.com/';
                }}
                className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 border border-cyan-400/30 text-sm font-semibold text-white hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
              >
                Перейти
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
