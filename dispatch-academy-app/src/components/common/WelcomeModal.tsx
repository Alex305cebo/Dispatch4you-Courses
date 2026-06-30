import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useProgressStore } from '../../store/useProgressStore';

const SESSION_KEY = 'da_welcome_seen';

export default function WelcomeModal() {
  const { user, signIn, loading } = useAuth();
  const totalXP = useProgressStore((s) => s.totalXP);
  const level = useProgressStore((s) => s.level);
  const currentStreak = useProgressStore((s) => s.currentStreak);

  // Show until user is logged in; after login show once per session with a "Continue" button
  const [dismissed, setDismissed] = useState(
    () => !!sessionStorage.getItem(SESSION_KEY)
  );
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = async () => {
    setSigningIn(true);
    await signIn();
    setSigningIn(false);
  };

  const handleContinue = () => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setDismissed(true);
  };

  // Not signed in → always show (no dismiss without login)
  // Signed in + not dismissed → show welcome back
  // Signed in + dismissed → hide
  const show = !loading && (!user || !dismissed);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="w-full max-w-sm rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Top gradient bar */}
            <div className="h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500" />

            <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center gap-5">
              {/* Logo */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-5xl">🚛</span>
                <h1 className="text-2xl font-extrabold text-white tracking-tight mt-2">
                  Dispatch Academy
                </h1>
                <p className="text-sm text-slate-400">Стань профессиональным диспетчером</p>
              </div>

              {!user ? (
                /* ── NOT LOGGED IN ── */
                <>
                  <div className="w-full rounded-2xl bg-slate-800/50 border border-white/8 px-4 py-4 text-left space-y-2">
                    <p className="text-[13px] text-slate-300 font-medium">Для старта необходим аккаунт:</p>
                    <ul className="space-y-1.5">
                      {[
                        '☁️ Прогресс сохраняется в облаке',
                        '📱 Доступ с любого устройства',
                        '🏆 Место в таблице лидеров',
                      ].map((t) => (
                        <li key={t} className="text-[12px] text-slate-400">{t}</li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={handleSignIn}
                    disabled={signingIn}
                    className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-white text-slate-900 font-bold text-[15px] hover:bg-slate-100 active:scale-95 transition-all shadow-lg disabled:opacity-60"
                  >
                    {signingIn ? (
                      <span className="text-slate-500 text-sm">Подключение…</span>
                    ) : (
                      <>
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Войти через Google
                      </>
                    )}
                  </button>
                </>
              ) : (
                /* ── LOGGED IN — welcome back ── */
                <>
                  <div className="flex items-center gap-3 w-full rounded-2xl bg-slate-800/50 border border-white/8 px-4 py-3">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-full border-2 border-cyan-400/40 object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-lg font-bold text-white shrink-0">
                        {user.firstName[0]?.toUpperCase() ?? '?'}
                      </div>
                    )}
                    <div className="text-left">
                      <p className="text-white font-bold text-[15px] leading-tight">{user.firstName}</p>
                      <p className="text-slate-400 text-[12px]">{user.email}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 w-full">
                    {[
                      { label: 'Уровень', value: level, icon: '⭐' },
                      { label: 'XP', value: totalXP, icon: '💎' },
                      { label: 'Серия', value: `${currentStreak}д`, icon: '🔥' },
                    ].map((s) => (
                      <div key={s.label} className="flex flex-col items-center gap-0.5 rounded-xl bg-slate-800/60 border border-white/8 py-3">
                        <span className="text-xl">{s.icon}</span>
                        <span className="text-white font-extrabold text-[15px] leading-none">{s.value}</span>
                        <span className="text-slate-500 text-[10px]">{s.label}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleContinue}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-[15px] hover:shadow-lg hover:shadow-cyan-500/40 active:scale-95 transition-all"
                  >
                    Продолжить обучение →
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
