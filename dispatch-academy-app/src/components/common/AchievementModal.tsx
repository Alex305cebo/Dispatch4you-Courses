import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/useUIStore';

/**
 * Celebratory modal shown when the student unlocks an achievement.
 * Driven by the UI store. Defers while the level-up modal is on screen so the
 * two celebrations never overlap — it reappears once the level-up is dismissed.
 */
export default function AchievementModal() {
  const achievement = useUIStore((s) => s.achievementModal);
  const dismissAchievement = useUIStore((s) => s.dismissAchievement);
  const showLevelUpModal = useUIStore((s) => s.showLevelUpModal);
  const soundEnabled = useUIStore((s) => s.soundEnabled);

  const visible = !!achievement && !showLevelUpModal;

  useEffect(() => {
    if (!visible || !soundEnabled) return;
    try {
      const audio = new Audio('/dispatch-academy-app/sounds/success.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch {
      /* ignore */
    }
  }, [visible, soundEnabled]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismissAchievement();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, dismissAchievement]);

  return (
    <AnimatePresence>
      {visible && achievement && (
        <motion.div
          className="fixed inset-0 z-[9990] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismissAchievement}
          role="dialog"
          aria-modal="true"
          aria-label={`Достижение получено: ${achievement.title}`}
          style={{ background: 'rgba(2,6,23,0.75)', backdropFilter: 'blur(6px)' }}
        >
          <motion.div
            className="relative w-full max-w-xs rounded-3xl overflow-hidden text-center"
            initial={{ scale: 0.7, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(160deg, rgba(15,23,42,0.98), rgba(30,41,59,0.96))',
              border: '1px solid rgba(251,191,36,0.4)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.55), 0 0 40px rgba(251,191,36,0.18)',
            }}
          >
            <div className="h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />

            <div className="px-6 pt-6 pb-6 flex flex-col items-center">
              <p className="text-[12px] font-bold tracking-[0.2em] text-amber-300 uppercase mb-4">
                Достижение получено
              </p>

              {/* Badge with pulsing halo */}
              <div className="relative w-24 h-24 flex items-center justify-center mb-4">
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.35), transparent 70%)' }}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.span
                  className="relative leading-none"
                  style={{ fontSize: '52px' }}
                  initial={{ rotate: -12, scale: 0.6 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.05 }}
                >
                  {achievement.icon}
                </motion.span>
              </div>

              <h2 className="text-[20px] font-extrabold text-white mb-1">{achievement.title}</h2>
              <p className="text-[13px] text-slate-400 leading-relaxed mb-5">
                {achievement.description}
              </p>

              <button
                onClick={dismissAchievement}
                className="w-full px-4 py-3 rounded-xl text-[15px] font-bold text-slate-900 transition-all active:scale-[0.98] hover:shadow-lg"
                style={{
                  background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                  boxShadow: '0 8px 20px rgba(251,191,36,0.35)',
                }}
              >
                Отлично!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
