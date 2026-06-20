// ═══════════════════════════════════════════════════════
//  TruckPopup.tsx — popup при нажатии на трак
//  Показывает статус, HOS, кнопки действий (ремонт и т.д.)
// ═══════════════════════════════════════════════════════
import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { formatHOS } from '@/utils/format';
import styles from './TruckPopup.module.css';

export function TruckPopup() {
  const [truckId, setTruckId] = useState<string | null>(null);
  const session = useGameStore((s) => s.session);
  const updateTruck = useGameStore((s) => s.updateTruck);
  const adjustBalance = useGameStore((s) => s.adjustBalance);

  // Listen for truck-clicked event from map
  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent).detail;
      setTruckId(detail.truckId);
    }
    window.addEventListener('truck-clicked', handler);
    return () => window.removeEventListener('truck-clicked', handler);
  }, []);

  if (!truckId || !session) return null;
  const truck = session.trucks.find((t) => t.id === truckId);
  if (!truck) return null;

  const isBreakdown = truck.status === 'breakdown';
  const isHosRest = truck.status === 'hos_rest';
  const hosLow = truck.driver.hosRemaining < 90;

  function handleRepair() {
    if (session!.balance < 350) return;
    adjustBalance(-350);
    // Restore to driving (continue route)
    updateTruck(truckId!, (t) => ({
      ...t,
      status: t.route && t.route.length >= 2 ? 'driving' : 'idle',
    }));
    setTruckId(null);
  }

  function handleForceRest() {
    updateTruck(truckId!, (t) => ({ ...t, status: 'hos_rest' }));
    setTruckId(null);
  }

  function close() {
    setTruckId(null);
  }

  return (
    <div className={styles.overlay} onClick={close}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.avatar}>🚛</div>
          <div className={styles.info}>
            <div className={styles.name}>{truck.number} · {truck.driver.firstName} {truck.driver.lastName}</div>
            <div className={styles.status}>{truck.currentCity || '—'} · {truck.status}</div>
          </div>
          <button className={styles.closeBtn} onClick={close}>✕</button>
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>HOS</span>
            <span className={`${styles.statValue} ${hosLow ? styles.danger : ''}`}>{formatHOS(truck.driver.hosRemaining)}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Status</span>
            <span className={styles.statValue}>{truck.status}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Type</span>
            <span className={styles.statValue}>{truck.type}</span>
          </div>
        </div>

        {/* Actions based on status */}
        <div className={styles.actions}>
          {isBreakdown && (
            <button className={styles.actionBtn} onClick={handleRepair}>
              🛠️ Roadside Repair — $350
            </button>
          )}
          {hosLow && !isHosRest && truck.status === 'driving' && (
            <button className={styles.actionBtnWarn} onClick={handleForceRest}>
              🛑 Stop for HOS Rest
            </button>
          )}
          {isHosRest && (
            <div className={styles.restMsg}>😴 Resting... HOS will reset automatically</div>
          )}
          <button className={styles.actionBtnGhost} onClick={close}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
