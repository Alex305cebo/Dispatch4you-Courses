// ═══════════════════════════════════════════════════════
//  DeliveryPopup.tsx — результат доставки (P&L)
// ═══════════════════════════════════════════════════════
import { useGameStore } from '@/store/gameStore';
import { formatMoney } from '@/utils/format';
import styles from './DeliveryPopup.module.css';

export function DeliveryPopup() {
  const deliveryResults = useGameStore((s) => s.deliveryResults);
  const dismissDeliveryResult = useGameStore((s) => s.dismissDeliveryResult);

  if (deliveryResults.length === 0) return null;
  const result = deliveryResults[0];

  const profitPositive = result.netProfit >= 0;

  return (
    <div className={styles.overlay} onClick={dismissDeliveryResult}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span>{profitPositive ? '🎉' : '😬'}</span>
          <div>
            <h3 className={styles.title}>Доставка завершена!</h3>
            <p className={styles.sub}>{result.fromCity} → {result.toCity} · {result.miles} mi</p>
          </div>
        </div>

        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span>Gross</span>
            <span style={{ color: 'var(--accent-cyan)' }}>{formatMoney(result.grossRevenue)}</span>
          </div>
          <div className={styles.summaryItem}>
            <span>Расходы</span>
            <span style={{ color: 'var(--danger)' }}>-{formatMoney(result.totalExpenses)}</span>
          </div>
          <div className={`${styles.summaryItem} ${styles.profit}`}>
            <span>Net Profit</span>
            <span style={{ color: profitPositive ? 'var(--success)' : 'var(--danger)' }}>
              {formatMoney(result.netProfit)}
            </span>
          </div>
          <div className={styles.summaryItem}>
            <span>$/mile</span>
            <span>${result.ratePerMile.toFixed(2)}</span>
          </div>
        </div>

        <div className={styles.info}>🚛 {result.truckNumber} · {result.driverName}</div>

        <button className={styles.btn} onClick={dismissDeliveryResult}>
          OK →
        </button>
      </div>
    </div>
  );
}
