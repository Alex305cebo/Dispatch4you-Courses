// ═══════════════════════════════════════════════════════
//  ShiftEnd.tsx — еженедельный отчёт (каждые 7 дней)
//  Обычные дни переключаются автоматически без popup
// ═══════════════════════════════════════════════════════
import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { calculateShiftGrade } from '@/game/delivery';
import { formatMoney } from '@/utils/format';
import styles from './ShiftEnd.module.css';

const GRADE_EMOJI: Record<string, string> = {
  S: '🏆', A: '⭐', B: '👍', C: '😐', D: '👎',
};

const GRADE_COLOR: Record<string, string> = {
  S: '#fbbf24', A: '#4ade80', B: '#06b6d4', C: '#94a3b8', D: '#f87171',
};

export function ShiftEnd() {
  const phase = useGameStore((s) => s.phase);
  const session = useGameStore((s) => s.session);
  const setPhase = useGameStore((s) => s.setPhase);

  // Обычные дни (не кратные 7) — автоматически переходим на следующий день
  useEffect(() => {
    if (phase !== 'day_end' || !session) return;

    const isWeekEnd = session.day % 7 === 0;
    if (!isWeekEnd) {
      // Автоматический переход без popup
      const timer = setTimeout(() => advanceDay(), 500);
      return () => clearTimeout(timer);
    }
  }, [phase, session?.day]);

  function advanceDay() {
    const store = useGameStore.getState();
    if (!store.session) return;
    store.session.trucks.forEach((truck) => {
      store.updateTruck(truck.id, (t) => ({
        ...t,
        driver: { ...t.driver, hosRemaining: 11 * 60 },
        status: t.status === 'hos_rest' ? 'idle' : t.status,
      }));
    });
    store.loadSession({
      ...store.session,
      day: store.session.day + 1,
      gameTime: 0,
      lastPlayedAt: Date.now(),
    });
    setPhase('playing');
  }

  // Показываем popup только каждые 7 дней
  if (phase !== 'day_end' || !session) return null;
  if (session.day % 7 !== 0) return null;

  const profit = session.totalEarned - session.totalSpent;
  const { grade, target, percentage } = calculateShiftGrade(profit, session.truckCount);
  const deliveredLoads = session.loads.filter((l) => l.status === 'delivered').length;
  const weekNum = Math.floor(session.day / 7);

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.gradeSection}>
          <span className={styles.gradeEmoji}>{GRADE_EMOJI[grade]}</span>
          <span className={styles.gradeLabel} style={{ color: GRADE_COLOR[grade] }}>
            {grade}
          </span>
          <span className={styles.gradeText}>
            {grade === 'S' ? 'Превосходно!' : grade === 'A' ? 'Отлично!' : grade === 'B' ? 'Хорошо' : grade === 'C' ? 'Нормально' : 'Слабо'}
          </span>
        </div>

        <h2 className={styles.title}>📊 Неделя {weekNum} завершена</h2>
        <p className={styles.subtitle}>Итоги за 7 дней работы</p>

        <div className={styles.stats}>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Заработано за неделю</span>
            <span className={styles.statValue} style={{ color: 'var(--success)' }}>
              {formatMoney(session.totalEarned)}
            </span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Расходы за неделю</span>
            <span className={styles.statValue} style={{ color: 'var(--danger)' }}>
              {formatMoney(session.totalSpent)}
            </span>
          </div>
          <div className={`${styles.statRow} ${styles.statRowHighlight}`}>
            <span className={styles.statLabel}>Чистая прибыль</span>
            <span className={styles.statValue} style={{ color: profit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {formatMoney(profit)}
            </span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Всего доставок</span>
            <span className={styles.statValue}>{deliveredLoads}</span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Флот</span>
            <span className={styles.statValue}>{session.trucks.length} траков</span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Средняя прибыль/день</span>
            <span className={styles.statValue} style={{ color: 'var(--accent-cyan)' }}>
              {formatMoney(Math.round(profit / 7))}
            </span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Цель недели</span>
            <span className={styles.statValue}>{formatMoney(target * 7)} ({percentage}%)</span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Баланс</span>
            <span className={styles.statValue} style={{ color: 'var(--accent-cyan)' }}>
              {formatMoney(session.balance)}
            </span>
          </div>
        </div>

        <button className={styles.nextBtn} onClick={advanceDay}>
          Новая неделя →
        </button>
      </div>
    </div>
  );
}
