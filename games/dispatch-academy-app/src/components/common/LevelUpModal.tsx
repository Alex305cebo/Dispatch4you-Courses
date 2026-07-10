import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/useUIStore';

/**
 * Celebratory modal shown when the student reaches a new level.
 * Driven entirely by the UI store (showLevelUpModal / levelUpData) so any
 * code path that awards XP and crosses a level threshold will surface it.
 */

const CONFETTI_COLORS = ['#22d3ee', '#34d399', '#fbbf24', '#a78bfa', '#f472b6'];

export default function LevelUpModal() {
  const showLevelUpModal = useUIStore((s) => s.showLevelUpModal);
  const levelUpData = useUIStore((s) => s.levelUpData);
  const dismissLevelUp = useUIStore((s) => s.dismissLevelUp);
  const soundEnabled = useUIStore((s) => s.soundEnabled);

  // Pre-compute confetti pieces once per open so their motion stays stable.
  const confetti = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 320,
        delay: Math.random() * 0.25,
        rotate: Math.random() * 360,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + Math.random() * 6,
      })),
    // Re-roll whenever a new level-up appears.
    [levelUpData?.level, showLevelUpModal]
  );

  // Play the celebration sound when the modal opens (if sound is enabled).
  useEffect(() => {
    if (!showLevelUpModal || !soundEnabled) return;
    try {
      const audio = new Audio('/games/dispatch-academy-app/sounds/success.mp3');
      audio.volume = 0.6;
      audio.play().catch(() => {
        /* autoplay may be blocked — ignore */
      });
    } catch {
      /* Audio API not available — ignore */
    }
  }, [showLevelUpModal, soundEnabled]);

  // Allow closing with Escape for keyboard users.
  useEffect(() => {
    if (!showLevelUpModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismissLevelUp();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showLevelUpModal, dismissLevelUp]);

  return (
    <AnimatePresence>
      {showLevelUpModal && levelUpData && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismissLevelUp}
          role="dialog"
          aria-modal="true"
          aria-label={`Новый уровень ${levelUpData.level}: ${levelUpData.title}`}
          style={{ background: 'rgba(2,6,23,0.78)', backdropFilter: 'blur(8px)' }}
        >
          {/* Confetti burst */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden flex items-start justify-center">
            {confetti.map((c) => (
              <motion.span
                key={c.id}
                className="absolute top-1/3 rounded-sm"
                style={{ width: c.size, height: c.size, background: c.color }}
                initial={{ opacity: 0, y: 0, x: 0, rotate: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: [0, -40, 220],
                  x: [0, c.x * 0.5, c.x],
                  rotate: c.rotate,
                }}
                transition={{ duration: 1.6, delay: c.delay, ease: 'easeOut' }}
              />
            ))}
          </div>

          {/* Card */}
          <motion.div
            className="relative w-full max-w-xs rounded-3xl overflow-hidden text-center"
            initial={{ scale: 0.7, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(160deg, rgba(15,23,42,0.98), rgba(30,41,59,0.96))',
              border: '1px solid rgba(34,211,238,0.35)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.55), 0 0 40px rgba(34,211,238,0.15)',
            }}
          >
            {/* Top gradient ribbon */}
            <div className="h-1.5 bg-gradient-to-r from-cyan-400 via-purple-500 to-amber-400" />

            <div className="px-6 pt-6 pb-6 flex flex-col items-center">
              <p className="text-[12px] font-bold tracking-[0.2em] text-cyan-300 uppercase mb-4">
                Новый уровень!
              </p>

              {/* Animated badge with rotating glow rays */}
              <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      'conic-gradient(from 0deg, rgba(34,211,238,0.0), rgba(34,211,238,0.5), rgba(34,211,238,0.0), rgba(168,85,247,0.5), rgba(34,211,238,0.0))',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="absolute inset-2 rounded-full"
                  style={{ background: 'rgba(15,23,42,0.95)' }}
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="relative flex flex-col items-center justify-center">
                  <span className="text-[10px] font-semibold text-slate-400 leading-none mb-0.5">
                    УР.
                  </span>
                  <span
                    className="font-extrabold leading-none text-transparent bg-clip-text"
                    style={{
                      fontSize: '40px',
                      backgroundImage: 'linear-gradient(180deg, #67e8f9, #22d3ee, #34d399)',
                    }}
                  >
                    {levelUpData.level}
                  </span>
                </div>
              </div>

              <h2 className="text-[20px] font-extrabold text-white mb-1">{levelUpData.title}</h2>
              <p className="text-[13px] text-slate-400 leading-relaxed mb-5">
                Вы достигли нового звания. Так держать!
              </p>

              <button
                onClick={dismissLevelUp}
                className="w-full px-4 py-3 rounded-xl text-[15px] font-bold text-white transition-all active:scale-[0.98] hover:shadow-lg"
                style={{
                  background: 'linear-gradient(90deg, #06b6d4, #2563eb)',
                  boxShadow: '0 8px 20px rgba(6,182,212,0.35)',
                }}
              >
                Продолжить
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
