// ═══════════════════════════════════════════════════════
//  SpeedControl.tsx — одна кнопка из двух частей:
//  Левая: пауза/play | Правая: скорость (циклически)
// ═══════════════════════════════════════════════════════
import { useGameStore, type TimeSpeed } from '@/store/gameStore';
import styles from './SpeedControl.module.css';

const SPEEDS: TimeSpeed[] = [1, 2, 5, 10];

const SPEED_LABELS: Record<TimeSpeed, string> = {
  1: 'Speed ×1',
  2: 'Speed ×2',
  5: 'Speed ×5',
  10: 'Speed ×10',
};

export function SpeedControl() {
  const timeSpeed = useGameStore((s) => s.timeSpeed);
  const phase = useGameStore((s) => s.phase);
  const setTimeSpeed = useGameStore((s) => s.setTimeSpeed);
  const setPhase = useGameStore((s) => s.setPhase);

  const isPaused = phase === 'paused';

  function togglePause() {
    if (isPaused) {
      setPhase('playing');
    } else {
      setPhase('paused');
    }
  }

  function cycleSpeed() {
    if (isPaused) setPhase('playing');
    const idx = SPEEDS.indexOf(timeSpeed);
    const next = SPEEDS[(idx + 1) % SPEEDS.length];
    setTimeSpeed(next);
  }

  return (
    <div className={styles.pill}>
      <button
        className={`${styles.pauseBtn} ${isPaused ? styles.paused : ''}`}
        onClick={togglePause}
      >
        {isPaused ? '▶' : '⏸'}
      </button>
      <div className={styles.divider} />
      <button className={styles.speedBtn} onClick={cycleSpeed}>
        {SPEED_LABELS[timeSpeed]}
      </button>
    </div>
  );
}
