// ═══════════════════════════════════════════════════════
//  FinancePanel.tsx — панель финансов (P&L, история)
// ═══════════════════════════════════════════════════════
import { useGameStore } from '@/store/gameStore';
import { formatMoney } from '@/utils/format';
import styles from './FinancePanel.module.css';

export function FinancePanel() {
  const session = useGameStore((s) => s.session);
  if (!session) return null;

  const profit = session.totalEarned - session.totalSpent;
  const deliveredLoads = session.loads.filter((l) => l.status === 'delivered').length;
  const activeLoads = session.loads.filter((l) => l.status === 'booked').length;

  // Средний RPM
  const avgRpm = deliveredLoads > 0 && session.totalEarned > 0
    ? (session.totalEarned / (deliveredLoads * 300)).toFixed(2) // примерная оценка
    : '—';

  return (
    <div className={styles.wrap}>
      {/* Summary cards */}
      <div className={styles.grid}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Баланс</span>
          <span className={styles.cardValue} style={{ color: 'var(--accent-cyan)' }}>
            {formatMoney(session.balance)}
          </span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Прибыль</span>
          <span className={styles.cardValue} style={{ color: profit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {formatMoney(profit)}
          </span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Доход</span>
          <span className={styles.cardValue} style={{ color: 'var(--success)' }}>
            +{formatMoney(session.totalEarned)}
          </span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Расходы</span>
          <span className={styles.cardValue} style={{ color: 'var(--danger)' }}>
            -{formatMoney(session.totalSpent)}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statRow}>
          <span>📦 Доставлено</span>
          <span className={styles.statVal}>{deliveredLoads}</span>
        </div>
        <div className={styles.statRow}>
          <span>🚛 В работе</span>
          <span className={styles.statVal}>{activeLoads}</span>
        </div>
        <div className={styles.statRow}>
          <span>🚛 Флот</span>
          <span className={styles.statVal}>{session.trucks.length} траков</span>
        </div>
        <div className={styles.statRow}>
          <span>📅 День</span>
          <span className={styles.statVal}>{session.day}</span>
        </div>
        <div className={styles.statRow}>
          <span>🎯 Цель смены</span>
          <span className={styles.statVal}>{formatMoney(session.truckCount * 2500)}</span>
        </div>
      </div>

      {/* Progress bar to goal */}
      <div className={styles.goalSection}>
        <div className={styles.goalLabel}>
          Прогресс к цели: {Math.min(100, Math.round((profit / (session.truckCount * 2500)) * 100))}%
        </div>
        <div className={styles.goalBar}>
          <div
            className={styles.goalFill}
            style={{ width: `${Math.min(100, Math.max(0, (profit / (session.truckCount * 2500)) * 100))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
