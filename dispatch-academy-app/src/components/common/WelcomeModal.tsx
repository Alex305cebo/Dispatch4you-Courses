import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useProgressStore } from '../../store/useProgressStore';

const SESSION_KEY = 'da_welcome_seen';

const CAREER_STEPS = [
  { icon: '📋', label: 'Стажёр' },
  { icon: '📞', label: 'Диспетчер' },
  { icon: '🚛', label: 'Старший' },
  { icon: '🏆', label: 'Эксперт' },
];

export default function WelcomeModal() {
  const { user, signIn, loading } = useAuth();
  const totalXP = useProgressStore((s) => s.totalXP);
  const level = useProgressStore((s) => s.level);
  const currentStreak = useProgressStore((s) => s.currentStreak);

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

  const show = !loading && (!user || !dismissed);

  // Career progress indicator (level 1–10 → step 0–3)
  const careerStep = Math.min(3, Math.floor((level - 1) / 3));

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-5"
          style={{ background: 'rgba(2, 6, 23, 0.97)' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.05 }}
            className="w-full max-w-sm flex flex-col gap-0 overflow-hidden rounded-3xl"
            style={{ border: '1px solid rgba(255,255,255,0.1)', background: '#0f172a' }}
          >
            {/* Hero band */}
            <div
              className="relative flex flex-col items-center pt-10 pb-8 px-6"
              style={{
                background: 'linear-gradient(160deg, #0f2744 0%, #0f172a 60%)',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {/* Accent line top */}
              <div className="absolute top-0 inset-x-0 h-[3px] rounded-t-3xl"
                style={{ background: 'linear-gradient(90deg, #06b6d4, #6366f1, #06b6d4)' }} />

              <div className="text-5xl mb-4 select-none">🚛</div>

              <h1 className="text-white font-extrabold tracking-tight text-center leading-tight"
                style={{ fontSize: 26 }}>
                Dispatch
              </h1>
              <p className="font-bold text-center mt-0.5 mb-4"
                style={{ fontSize: 17, color: '#38bdf8' }}>
                Career Path
              </p>

              {/* Career ladder */}
              <div className="flex items-center gap-0 w-full max-w-[260px]">
                {CAREER_STEPS.map((step, i) => {
                  const done = user ? i <= careerStep : false;
                  const active = user ? i === careerStep : false;
                  return (
                    <div key={i} className="flex items-center flex-1">
                      <div className="flex flex-col items-center gap-1 flex-1">
                        <div
                          className="flex items-center justify-center rounded-full transition-all"
                          style={{
                            width: active ? 40 : 32,
                            height: active ? 40 : 32,
                            background: done
                              ? active ? 'rgba(6,182,212,0.25)' : 'rgba(6,182,212,0.12)'
                              : 'rgba(255,255,255,0.05)',
                            border: active
                              ? '2px solid #06b6d4'
                              : done
                              ? '1px solid rgba(6,182,212,0.4)'
                              : '1px solid rgba(255,255,255,0.1)',
                            fontSize: active ? 20 : 16,
                          }}
                        >
                          {step.icon}
                        </div>
                        <span style={{
                          fontSize: 9,
                          fontWeight: 600,
                          color: done ? '#38bdf8' : 'rgba(255,255,255,0.3)',
                          letterSpacing: '0.02em',
                        }}>
                          {step.label}
                        </span>
                      </div>
                      {i < CAREER_STEPS.length - 1 && (
                        <div style={{
                          height: 2,
                          width: 16,
                          borderRadius: 2,
                          background: i < careerStep && user
                            ? 'rgba(6,182,212,0.5)'
                            : 'rgba(255,255,255,0.08)',
                          marginBottom: 14,
                          flexShrink: 0,
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-4 px-6 pt-6 pb-6">
              {!user ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <p className="font-bold text-white" style={{ fontSize: 18 }}>
                      Начни карьеру с нуля
                    </p>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                      Пройди 30 уровней и стань профессиональным диспетчером грузоперевозок в США
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    {[
                      ['☁️', 'Прогресс сохраняется в облаке'],
                      ['📱', 'Доступ с любого устройства'],
                      ['🏆', 'Таблица лидеров карьеристов'],
                    ].map(([icon, text]) => (
                      <div key={text} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <span style={{ fontSize: 16 }}>{icon}</span>
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{text}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSignIn}
                    disabled={signingIn}
                    className="w-full flex items-center justify-center gap-3 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-60"
                    style={{
                      paddingTop: 14,
                      paddingBottom: 14,
                      fontSize: 15,
                      background: '#ffffff',
                      color: '#0f172a',
                    }}
                  >
                    {signingIn ? (
                      <span style={{ color: '#475569' }}>Подключение…</span>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
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
                <>
                  {/* Logged in — welcome back */}
                  <div className="flex items-center gap-3">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt=""
                        referrerPolicy="no-referrer"
                        style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid rgba(6,182,212,0.4)', objectFit: 'cover', flexShrink: 0 }}
                      />
                    ) : (
                      <div style={{
                        width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, fontWeight: 700, color: '#fff',
                      }}>
                        {user.firstName[0]?.toUpperCase() ?? '?'}
                      </div>
                    )}
                    <div>
                      <p style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                        {user.firstName}
                      </p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                        {CAREER_STEPS[careerStep]?.label ?? 'Диспетчер'}
                      </p>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {[
                      { icon: '⭐', val: `Ур. ${level}`, sub: 'Уровень' },
                      { icon: '💎', val: totalXP, sub: 'XP' },
                      { icon: '🔥', val: `${currentStreak}д`, sub: 'Серия' },
                    ].map((s) => (
                      <div key={s.sub} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                        padding: '12px 8px', borderRadius: 14,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.07)',
                      }}>
                        <span style={{ fontSize: 20 }}>{s.icon}</span>
                        <span style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.val}</span>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>{s.sub}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleContinue}
                    className="w-full rounded-2xl font-bold transition-all active:scale-95"
                    style={{
                      paddingTop: 14,
                      paddingBottom: 14,
                      fontSize: 16,
                      background: 'linear-gradient(90deg, #0891b2, #4f46e5)',
                      color: '#fff',
                    }}
                  >
                    Продолжить карьеру →
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
