import { useState, useEffect } from 'react';
import { useProgressStore } from '../store/useProgressStore';
import { useAuth } from '../hooks/useAuth';
import { fetchLeaderboard } from '../services/firestore-progress';

interface LeaderEntry {
  uid: string;
  rank: number;
  displayName: string;
  firstName: string;
  photoURL: string | null;
  xp: number;
  level: number;
  accuracy: number;
  isLocal?: boolean;
}

export default function LeaderboardPage() {
  const { totalXP, level, taskScores } = useProgressStore();
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const scores = Object.values(taskScores);
    const correct = scores.filter((s: any) => s?.correct).length;
    const accuracy = scores.length > 0 ? Math.round((correct / scores.length) * 100) : 0;

    (async () => {
      setLoading(true);
      let entries: LeaderEntry[] = [];

      // Try to fetch from Firestore if Firebase is configured
      try {
        const firestoreData = await fetchLeaderboard();
        entries = firestoreData
          .filter(e => e.totalXP > 0)
          .map((e, i) => ({
            uid: e.uid,
            rank: i + 1,
            displayName: e.displayName || e.firstName || 'Player',
            firstName: e.firstName || 'Player',
            photoURL: e.photoURL || null,
            xp: e.totalXP,
            level: e.level,
            accuracy: e.accuracy,
            isLocal: e.uid === user?.uid,
          }));
      } catch {}

      // If not logged in or Firestore empty — show local player only
      if (entries.length === 0 && totalXP > 0) {
        entries = [{
          uid: 'local',
          rank: 1,
          displayName: user?.displayName || 'Вы',
          firstName: user?.firstName || 'Вы',
          photoURL: user?.photoURL || null,
          xp: totalXP,
          level,
          accuracy,
          isLocal: true,
        }];
      }

      setLeaders(entries);
      setLoading(false);
    })();
  }, [totalXP, level, taskScores, user]);

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">🏆 Рейтинг</h1>
        <p className="text-sm text-slate-400">Dispatch: Career Path — лучшие игроки</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : leaders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 text-sm">Пока нет игроков с очками</p>
          {!user && <p className="text-slate-500 text-xs mt-2">Войдите через Google чтобы попасть в рейтинг</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {leaders.map((entry) => {
            const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : '';
            return (
              <div
                key={entry.uid}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                  entry.isLocal
                    ? 'bg-cyan-500/10 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                    : entry.rank <= 3
                      ? 'bg-amber-500/5 border-amber-500/20'
                      : 'bg-white/3 border-white/8'
                }`}
              >
                <span className={`w-8 text-center font-bold text-sm ${entry.rank <= 3 ? 'text-amber-400' : 'text-slate-400'}`}>
                  {medal || `#${entry.rank}`}
                </span>
                {entry.photoURL ? (
                  <img src={entry.photoURL} alt="" className="w-8 h-8 rounded-full object-cover border border-white/10" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {entry.firstName[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${entry.isLocal ? 'text-cyan-300' : 'text-white'}`}>
                    {entry.displayName}
                  </p>
                  <p className="text-[11px] text-slate-400">Ур. {entry.level} · {entry.accuracy}%</p>
                </div>
                <span className={`text-sm font-bold ${entry.isLocal ? 'text-cyan-400' : 'text-slate-300'}`}>
                  {entry.xp} XP
                </span>
              </div>
            );
          })}
        </div>
      )}

      {!user && (
        <div className="mt-6 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20 text-center">
          <p className="text-xs text-cyan-400">Войдите через Google в Настройках чтобы попасть в рейтинг</p>
        </div>
      )}
    </div>
  );
}
