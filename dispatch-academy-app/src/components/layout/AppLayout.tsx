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
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-white/5">
        <div className="max-w-lg mx-auto px-3 py-2">
          {/* Row: Logo | XP + Progress | Avatar */}
          <div className="flex items-center gap-3">
            {/* Logo — clickable to site */}
            <a
              href="https://dispatch4you.com/"
              className="shrink-0 flex flex-col"
              aria-label="Перейти на сайт dispatch4you.com"
            >
              <p className="text-sm font-bold text-gradient hover:opacity-80 transition-opacity">Dispatch Academy</p>
              <p className="text-[10px] text-slate-400">→ перейти на сайт</p>
            </a>

            {/* Spacer */}
            <div className="flex-1" />

            {/* XP + map progress bar */}
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-xs font-bold text-cyan-400">{totalXP} XP</span>
                <div className="w-36 h-2.5 bg-transparent rounded-full overflow-hidden border border-white/50 relative">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-green-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round(((level - 1) / 11) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Avatar button (right) */}
            <button
              onClick={() => navigate('/settings')}
              className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold border-2 border-cyan-300/30 hover:scale-105 transition-transform"
              aria-label="Профиль"
            >
              👤
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
