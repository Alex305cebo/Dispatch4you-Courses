import { useProgressStore } from '../store/useProgressStore';
import { useUIStore } from '../store/useUIStore';
import { useAuth } from '../hooks/useAuth';
import { ACHIEVEMENTS } from '../logic/achievements';

export default function SettingsPage() {
  const { totalXP, taskScores, currentStreak } = useProgressStore();
  const unlockedAchievements = useProgressStore((s) => s.unlockedAchievements);
  const { soundEnabled, toggleSound } = useUIStore();
  const { user, loading: authLoading, signIn, signOut } = useAuth();

  const unlockedSet = new Set(unlockedAchievements);
  const unlockedCount = ACHIEVEMENTS.filter((a) => unlockedSet.has(a.id)).length;

  const scores = Object.values(taskScores);
  const totalAnswered = scores.length;
  const totalCorrect = scores.filter((s: any) => s?.correct).length;
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const levelsCompleted = Object.keys(taskScores)
    .filter(k => k.startsWith('d'))
    .map(k => parseInt(k.split('-')[0]!.slice(1)))
    .filter((n, i, a) => !isNaN(n) && a.indexOf(n) === i).length;

  const handleResetProgress = () => {
    if (confirm('Вы уверены? Весь прогресс будет сброшен. Это действие нельзя отменить.')) {
      localStorage.removeItem('dispatch-academy-progress');
      useProgressStore.setState({ taskScores: {}, totalXP: 0, level: 1, currentStreak: 0, dayStatuses: { 1: 'available' }, unlockedAchievements: [] });
      window.location.reload();
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Profile */}
      <div className="flex items-center gap-4 mb-6">
        {user?.photoURL ? (
          <img src={user.photoURL} alt="avatar" className="w-16 h-16 rounded-full border-2 border-cyan-400/40 object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl border-2 border-cyan-300/30">
            {user ? user.firstName[0]?.toUpperCase() : '👤'}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-white">
            {user ? user.displayName : 'Студент'}
          </h1>
          <p className="text-sm text-slate-400">
            {user ? user.email : 'Dispatch Academy'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-cyan-400">{totalXP}</p>
          <p className="text-[11px] text-slate-400">Всего XP</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-400">{accuracy}%</p>
          <p className="text-[11px] text-slate-400">Точность</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-400">🔥 {currentStreak}</p>
          <p className="text-[11px] text-slate-400">Дни подряд</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-purple-400">{levelsCompleted}</p>
          <p className="text-[11px] text-slate-400">Уровней</p>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white">🏅 Достижения</h2>
          <span className="text-[11px] font-semibold text-cyan-300">
            {unlockedCount} / {ACHIEVEMENTS.length}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = unlockedSet.has(a.id);
            return (
              <div
                key={a.id}
                title={`${a.title} — ${a.description}`}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all ${
                  unlocked
                    ? 'bg-cyan-500/10 border-cyan-500/30'
                    : 'bg-slate-800/40 border-slate-700/40'
                }`}
              >
                <span
                  className="text-2xl leading-none"
                  style={unlocked ? undefined : { filter: 'grayscale(1)', opacity: 0.35 }}
                >
                  {a.icon}
                </span>
                <span
                  className={`text-[9px] leading-tight font-medium ${
                    unlocked ? 'text-slate-200' : 'text-slate-500'
                  }`}
                >
                  {a.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Account */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
        <h2 className="text-sm font-bold text-white mb-3">👤 Аккаунт</h2>

        {authLoading ? (
          <div className="text-center py-3">
            <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
              <span className="text-green-400 text-xs">✓</span>
              <span className="text-xs text-green-300">Аккаунт подключён</span>
            </div>
            <p className="text-xs text-slate-400">
              Прогресс автоматически синхронизируется и сохраняется в рейтинге.
            </p>
            <button
              onClick={signOut}
              className="w-full py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Выйти из аккаунта
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Войдите чтобы синхронизировать прогресс между устройствами и участвовать в рейтинге.
            </p>
            <button
              onClick={signIn}
              className="w-full py-2.5 rounded-lg bg-white border border-white/20 text-slate-900 text-sm font-bold hover:bg-white/90 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Войти через Google
            </button>
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
        <h2 className="text-sm font-bold text-white mb-3">⚙️ Настройки</h2>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Звуки</span>
          <button
            onClick={toggleSound}
            className={`relative w-12 h-6 rounded-full transition-colors ${soundEnabled ? 'bg-cyan-500' : 'bg-slate-600'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${soundEnabled ? 'left-6' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
        <h2 className="text-sm font-bold text-red-400 mb-3">⚠️ Опасная зона</h2>
        <button
          onClick={handleResetProgress}
          className="w-full py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500/20 transition-colors"
        >
          Сбросить весь прогресс
        </button>
      </div>
    </div>
  );
}
