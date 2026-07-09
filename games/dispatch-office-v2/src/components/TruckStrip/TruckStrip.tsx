// TruckStrip — compact truck cards (left sidebar on map)
import { useGameStore } from '@/store/gameStore';
import { formatHOS } from '@/utils/format';
import styles from './TruckStrip.module.css';

const STATUS_COLOR: Record<string, string> = {
  idle: '#94a3b8',
  driving: '#06b6d4',
  at_pickup: '#f59e0b',
  at_delivery: '#10b981',
  breakdown: '#ef4444',
  detention: '#fb923c',
  hos_rest: '#6366f1',
};

const STATUS_LABEL: Record<string, string> = {
  idle: 'Свободен',
  driving: 'В пути',
  at_pickup: 'Погрузка',
  at_delivery: 'Разгрузка',
  breakdown: 'Поломка',
  detention: 'Задержка',
  hos_rest: 'Отдых',
};

export function TruckStrip() {
  const session = useGameStore((s) => s.session);
  const selectedTruckId = useGameStore((s) => s.selectedTruckId);
  const selectTruck = useGameStore((s) => s.selectTruck);
  const updateTruck = useGameStore((s) => s.updateTruck);
  const adjustBalance = useGameStore((s) => s.adjustBalance);

  if (!session) return null;

  function handleRepair(truckId: string) {
    if (session!.balance < 350) return;
    adjustBalance(-350);
    updateTruck(truckId, (t) => ({
      ...t,
      status: t.route && t.route.length >= 2 ? 'driving' : 'idle',
    }));
  }

  function handleRest(truckId: string) {
    updateTruck(truckId, (t) => ({ ...t, status: 'hos_rest' }));
  }

  return (
    <div className={styles.strip}>
      {session.trucks.map((truck) => {
        const isSelected = selectedTruckId === truck.id;
        const color = STATUS_COLOR[truck.status] || '#94a3b8';
        const load = session.loads.find((l) => l.id === truck.currentLoadId);
        const hosPercent = Math.round((truck.driver.hosRemaining / (11 * 60)) * 100);
        const hosLow = truck.driver.hosRemaining < 120;
        const isMoving = truck.status === 'driving';
        const progress = truck.routeProgress ?? 0;
        const progressPct = Math.round(progress * 100);

        return (
          <div
            key={truck.id}
            className={`${styles.card} ${isSelected ? styles.selected : ''}`}
            style={{ '--truck-color': color } as React.CSSProperties}
            onClick={() => selectTruck(isSelected ? null : truck.id)}
          >
            {/* ═══ COMPACT CARD ═══ */}
            <div className={styles.compact}>
              {/* Avatar + status */}
              <div className={styles.left}>
                <div className={styles.avatar} style={{ background: color }}>
                  {truck.driver.firstName[0]}{truck.driver.lastName[0]}
                </div>
                <span className={styles.statusTag} style={{ color, borderColor: `${color}66` }}>
                  {STATUS_LABEL[truck.status]}
                </span>
              </div>

              {/* Info */}
              <div className={styles.right}>
                {/* Name + number */}
                <div className={styles.row1}>
                  <span className={styles.name}>{truck.driver.firstName}</span>
                  <span className={styles.number}>{truck.number}</span>
                </div>

                {/* Route or city */}
                <div className={styles.route}>
                  {load ? (
                    <>{load.origin.city} <span className={styles.arrow}>→</span> <span className={styles.dest}>{load.destination.city}</span></>
                  ) : (
                    <span className={styles.city}>{truck.currentCity || '—'}</span>
                  )}
                </div>

                {/* Progress (if driving) */}
                {isMoving && (
                  <div className={styles.progress}>
                    <div className={styles.bar}><div className={styles.fill} style={{ width: `${progressPct}%`, background: color }} /></div>
                    <span className={styles.pct} style={{ color }}>{progressPct}%</span>
                  </div>
                )}

                {/* Rate (if has load and not driving) */}
                {!isMoving && load && (
                  <span className={styles.rate}>${load.rate.toLocaleString()}</span>
                )}

                {/* HOS mini */}
                <div className={styles.hos}>
                  <span className={styles.hosLbl}>HOS</span>
                  <div className={styles.hosBar}><div className={styles.hosFill} style={{ width: `${hosPercent}%`, background: hosLow ? '#ef4444' : '#06b6d4' }} /></div>
                  <span className={`${styles.hosVal} ${hosLow ? styles.danger : ''}`}>{formatHOS(truck.driver.hosRemaining)}</span>
                </div>
              </div>
            </div>

            {/* ═══ EXPANDED ═══ */}
            {isSelected && (
              <div className={styles.details} onClick={(e) => e.stopPropagation()}>
                {isMoving && load && (
                  <div className={styles.detRow}>
                    <span className={styles.detLbl}>Ставка</span>
                    <span className={styles.detGreen}>${load.rate.toLocaleString()}</span>
                  </div>
                )}
                <div className={styles.tags}>
                  <span className={styles.tag}>{truck.type === 'dry_van' ? 'Dry Van' : truck.type === 'reefer' ? 'Reefer' : 'Flatbed'}</span>
                  <span className={styles.tag}>{truck.driver.experience}y</span>
                  {load && <span className={styles.tagAcc}>{load.miles} mi</span>}
                </div>
                <div className={styles.actions}>
                  {truck.status === 'breakdown' && (
                    <button className={styles.btn} onClick={(e) => { e.stopPropagation(); handleRepair(truck.id); }}>🛠 Ремонт ($350)</button>
                  )}
                  {truck.status === 'driving' && hosLow && (
                    <button className={styles.btnWarn} onClick={(e) => { e.stopPropagation(); handleRest(truck.id); }}>🛑 Остановка</button>
                  )}
                  {truck.status === 'idle' && (
                    <button className={styles.btnMain} onClick={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('open-loadboard')); }}>📦 Найти груз</button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
