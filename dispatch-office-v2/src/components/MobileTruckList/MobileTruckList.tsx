// ═══════════════════════════════════════════════════════
//  MobileTruckList.tsx — список траков для мобильного BottomSheet
// ═══════════════════════════════════════════════════════
import { useGameStore } from '@/store/gameStore';
import { formatHOS } from '@/utils/format';
import styles from './MobileTruckList.module.css';

const STATUS_LABELS: Record<string, string> = {
  idle: 'Свободен',
  driving: 'В пути',
  at_pickup: 'Погрузка',
  at_delivery: 'Разгрузка',
  breakdown: 'Поломка',
  detention: 'Задержка',
  hos_rest: 'HOS отдых',
};

const STATUS_COLOR: Record<string, string> = {
  idle: 'var(--text-muted)',
  driving: 'var(--accent-cyan)',
  at_pickup: 'var(--warning)',
  at_delivery: 'var(--success)',
  breakdown: 'var(--danger)',
  detention: '#eab308',
  hos_rest: '#6366f1',
};

export function MobileTruckList() {
  const session = useGameStore((s) => s.session);
  const selectedTruckId = useGameStore((s) => s.selectedTruckId);
  const selectTruck = useGameStore((s) => s.selectTruck);

  if (!session) return null;

  return (
    <div className={styles.list}>
      <h4 className={styles.title}>🚛 Флот · {session.trucks.length} траков</h4>
      {session.trucks.map((truck) => (
        <button
          key={truck.id}
          className={`${styles.card} ${selectedTruckId === truck.id ? styles.selected : ''}`}
          onClick={() => selectTruck(selectedTruckId === truck.id ? null : truck.id)}
        >
          <div className={styles.avatar}>
            {truck.driver.firstName[0]}{truck.driver.lastName[0]}
          </div>
          <div className={styles.info}>
            <div className={styles.row}>
              <span className={styles.truckNumber}>{truck.number}</span>
              <span
                className={styles.status}
                style={{ color: STATUS_COLOR[truck.status] }}
              >
                {truck.status === 'driving' && truck.deliveryPhase === 'to_pickup' ? '→ Pickup' :
                 truck.status === 'driving' && truck.deliveryPhase === 'to_delivery' ? '→ Delivery' :
                 STATUS_LABELS[truck.status]}
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.driver}>
                {truck.driver.firstName} {truck.driver.lastName}
              </span>
              <span className={styles.hos}>HOS: {formatHOS(truck.driver.hosRemaining)}</span>
            </div>
            {truck.currentCity && (
              <span className={styles.city}>📍 {truck.currentCity}</span>
            )}
          </div>
          <div
            className={styles.dot}
            style={{ background: STATUS_COLOR[truck.status] }}
          />
        </button>
      ))}
    </div>
  );
}
