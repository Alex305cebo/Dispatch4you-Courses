import { useGameStore } from '@/store/gameStore';
import { formatMiles, formatHOS } from '@/utils/format';
import styles from './TruckCard.module.css';

const STATUS_LABELS: Record<string, string> = {
  idle: 'Свободен',
  driving: 'В пути',
  at_pickup: 'Погрузка',
  at_delivery: 'Разгрузка',
  breakdown: 'Поломка',
  detention: 'Задержка',
  hos_rest: 'HOS отдых',
};

const TYPE_LABELS: Record<string, string> = {
  dry_van: 'Dry Van',
  reefer: 'Reefer',
  flatbed: 'Flatbed',
  step_deck: 'Step Deck',
};

export function TruckCard() {
  const session = useGameStore((s) => s.session);
  const selectedTruckId = useGameStore((s) => s.selectedTruckId);
  const selectTruck = useGameStore((s) => s.selectTruck);

  if (!session) return null;
  const truck = session.trucks.find((t) => t.id === selectedTruckId);
  if (!truck) return null;

  return (
    <div className={styles.card}>
      <button className={styles.closeBtn} onClick={() => selectTruck(null)}>
        ✕
      </button>

      <div className={styles.header}>
        <div className={styles.avatarWrap}>
          <div className={styles.avatar}>
            {truck.driver.firstName[0]}
            {truck.driver.lastName[0]}
          </div>
          <span className={`${styles.statusDot} ${styles[`dot_${truck.status}`]}`} />
        </div>
        <div className={styles.info}>
          <div className={styles.truckNumber}>{truck.number}</div>
          <div className={styles.driverName}>
            {truck.driver.firstName} {truck.driver.lastName}
          </div>
          <div className={styles.truckType}>{TYPE_LABELS[truck.type]}</div>
        </div>
      </div>

      <div className={styles.status}>
        <span className={styles.statusLabel}>
          {truck.status === 'driving' && truck.deliveryPhase === 'to_pickup' ? '→ К погрузке' :
           truck.status === 'driving' && truck.deliveryPhase === 'to_delivery' ? '→ К доставке' :
           STATUS_LABELS[truck.status]}
        </span>
        {truck.currentCity && <span className={styles.city}>📍 {truck.currentCity}</span>}
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>HOS</span>
          <span className={styles.statValue}>{formatHOS(truck.driver.hosRemaining)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Пробег</span>
          <span className={styles.statValue}>{formatMiles(truck.milesDriven)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Опыт</span>
          <span className={styles.statValue}>{truck.driver.experience}y</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.actionBtn}>
          <span>💬</span>
          <span>Связь</span>
        </button>
        <button className={styles.actionBtn}>
          <span>📦</span>
          <span>Груз</span>
        </button>
        <button className={styles.actionBtn}>
          <span>⛽</span>
          <span>Заправка</span>
        </button>
      </div>
    </div>
  );
}
