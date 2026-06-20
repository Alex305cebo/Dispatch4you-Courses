// ═══════════════════════════════════════════════════════
//  RateConfirmation.tsx — Rate Con popup после бронирования
//  Показывает детали груза как документ
// ═══════════════════════════════════════════════════════
import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { formatMoney } from '@/utils/format';
import styles from './RateConfirmation.module.css';

export function RateConfirmation() {
  const [loadId, setLoadId] = useState<string | null>(null);
  const session = useGameStore((s) => s.session);

  // Listen for rate-con event
  useEffect(() => {
    function handler(e: Event) {
      setLoadId((e as CustomEvent).detail.loadId);
    }
    window.addEventListener('show-rate-con', handler);
    return () => window.removeEventListener('show-rate-con', handler);
  }, []);

  if (!loadId || !session) return null;
  const load = session.loads.find((l) => l.id === loadId);
  if (!load) return null;

  const truck = session.trucks.find((t) => t.currentLoadId === loadId);

  function handleConfirm() {
    setLoadId(null);
  }

  return (
    <div className={styles.overlay} onClick={handleConfirm}>
      <div className={styles.doc} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.docTitle}>RATE CONFIRMATION</div>
            <div className={styles.docId}>RC-{loadId.slice(-5).toUpperCase()}</div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.status}>✅ CONFIRMED</div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>SHIPPER (PICKUP)</div>
          <div className={styles.sectionContent}>
            <div className={styles.city}>{load.origin.city}, {load.origin.state}</div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>CONSIGNEE (DELIVERY)</div>
          <div className={styles.sectionContent}>
            <div className={styles.city}>{load.destination.city}, {load.destination.state}</div>
          </div>
        </div>

        <div className={styles.details}>
          <div className={styles.detailRow}>
            <span>Equipment</span>
            <span>{load.equipment === 'dry_van' ? 'Dry Van' : load.equipment === 'reefer' ? 'Reefer' : 'Flatbed'}</span>
          </div>
          <div className={styles.detailRow}>
            <span>Miles</span>
            <span>{load.miles} mi</span>
          </div>
          <div className={styles.detailRow}>
            <span>Weight</span>
            <span>{load.weight.toLocaleString()} lbs</span>
          </div>
          <div className={styles.detailRow}>
            <span>Broker</span>
            <span>{load.brokerName.split('(')[0].trim()}</span>
          </div>
          <div className={`${styles.detailRow} ${styles.rateRow}`}>
            <span>AGREED RATE</span>
            <span>{formatMoney(load.rate)}</span>
          </div>
          <div className={styles.detailRow}>
            <span>Rate/Mile</span>
            <span>${load.ratePerMile}/mi</span>
          </div>
          {truck && (
            <div className={styles.detailRow}>
              <span>Assigned Truck</span>
              <span>{truck.number} · {truck.driver.firstName}</span>
            </div>
          )}
        </div>

        <button className={styles.confirmBtn} onClick={handleConfirm}>
          ✓ Confirm & Close
        </button>
      </div>
    </div>
  );
}

// Helper to trigger Rate Con popup
export function showRateConfirmation(loadId: string) {
  window.dispatchEvent(new CustomEvent('show-rate-con', { detail: { loadId } }));
}
