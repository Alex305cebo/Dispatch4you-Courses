import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useProgressStore } from '../../store/useProgressStore';
import { useUIStore } from '../../store/useUIStore';
import { LEVELS } from '../../logic/levels';

/**
 * Application layout wrapper — Premium design.
 * Provides a fixed glass-morphism header (Logo, Level badge, XP bar, Streak)
 * and a mobile-style bottom navigation bar.
 * Visible on ALL pages, plus a Toast notification layer.
 */
export default function AppLayout() {
  const { totalXP, level, currentStreak, lastActivityDate } = useProgressStore();
  const { toastMessage } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  const currentLevel = LEVELS.find(l => l.level === level) ?? LEVELS[0];
  const nextLevel = LEVELS.find(l => l.level === level + 1);
  const levelTitle = currentLevel?.title ?? 'Наблюдатель';

  // XP progress within current level
  const currentLevelXP = currentLevel?.xpThreshold ?? 0;
  const nextLevelXP = nextLevel?.xpThreshold ?? currentLevelXP + 500;
  const xpInLevel = totalXP - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  const xpPercent = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));

  // Daily goal: check if student completed at least 1 task today
  const today = new Date().toISOString().split('T')[0];
  const completedTaskToday = lastActivityDate === today;

  // Bottom nav always visible
  const hideBottomNav = false;

  // Bottom nav items
  const navItems = [
    { path: '/', icon: '🗺️', label: 'Карта' },
    { path: '/flashcards', icon: '📚', label: 'Карточки' },
    { path: '/settings', icon: '⚙️', label: 'Настройки' },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white particles-bg">
      {/* Fixed Premium Header — hidden on lesson/exam pages */}
      {!hideBottomNav && (
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-3">
          {/* Top row: Logo + Stats */}
          <div className="flex items-center justify-between">
            {/* Logo + Level */}
            <div className="flex items-center gap-3">
              <a
                href="https://dispatch4you.com/"
                className="flex flex-col"
                aria-label="Перейти на сайт dispatch4you.com"
              >
                <p className="text-sm font-bold text-gradient hover:opacity-80 transition-opacity">Dispatch Academy</p>
                <p className="text-xs text-slate-400">→ перейти на сайт</p>
              </a>
            </div>

            {/* Stats: Streak + Daily + XP */}
            <div className="flex items-center gap-3">
              {/* Streak */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <span className="text-sm">🔥</span>
                <span className="text-sm font-bold text-orange-400">{currentStreak}</span>
              </div>

              {/* Daily Goal */}
              <div
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                  completedTaskToday
                    ? 'bg-green-500/20 border-green-400 shadow-sm shadow-green-400/30'
                    : 'bg-transparent border-slate-600'
                }`}
                title={completedTaskToday ? 'Дневная цель выполнена' : 'Завершите 1+ задание сегодня'}
                aria-label={completedTaskToday ? 'Дневная цель выполнена' : 'Дневная цель не выполнена'}
              >
                {completedTaskToday && <span className="text-xs">✓</span>}
              </div>

              {/* XP counter */}
              <div className="text-right">
                <p className="text-sm font-bold text-cyan-400">{totalXP} XP</p>
              </div>
            </div>
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
        <div className="max-w-lg mx-auto flex items-center justify-center gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/map');
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all text-[12px] font-bold ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'bg-slate-800/60 text-slate-400 border border-slate-700/50 hover:text-white hover:bg-slate-700/60'
                }`}
                aria-label={item.label}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 glass-card rounded-xl shadow-2xl text-sm text-white max-w-xs text-center animate-fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
