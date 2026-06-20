// ═══════════════════════════════════════════════════════
//  RightPanel.tsx — правая панель (desktop)
//  Содержимое зависит от activePanel: loadboard / chat / finance
// ═══════════════════════════════════════════════════════
import { useGameStore } from '@/store/gameStore';
import { distanceMiles } from '@/utils/geo';
import { FinancePanel } from '@/components/FinancePanel/FinancePanel';
import type { Load, Truck } from '@/types';
import styles from './RightPanel.module.css';

export function RightPanel() {
  const activePanel = useGameStore((s) => s.activePanel);
  const setActivePanel = useGameStore((s) => s.setActivePanel);

  if (activePanel === 'none') return null;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          {activePanel === 'loadboard' && '📦 Load Board'}
          {activePanel === 'chat' && '💬 Сообщения'}
          {activePanel === 'finance' && '📊 Финансы'}
        </h3>
        <button
          className={styles.closeBtn}
          onClick={() => setActivePanel('none')}
        >
          ✕
        </button>
      </div>

      <div className={styles.body}>
        {activePanel === 'loadboard' && <LoadBoardContent />}
        {activePanel === 'chat' && <ChatPlaceholder />}
        {activePanel === 'finance' && <FinancePanel />}
      </div>
    </div>
  );
}

// ─── LOAD BOARD с секцией траков и deadhead ───
function LoadBoardContent() {
  const session = useGameStore((s) => s.session);
  const openNegotiation = useGameStore((s) => s.openNegotiation);
  const selectedTruckId = useGameStore((s) => s.selectedTruckId);
  const selectTruck = useGameStore((s) => s.selectTruck);
  if (!session) return null;

  const availableLoads = session.loads.filter((l) => l.status === 'available');
  const trucks = session.trucks;

  // Выбранный трак (или первый idle)
  const activeTruck = trucks.find((t) => t.id === selectedTruckId)
    || trucks.find((t) => t.status === 'idle')
    || trucks[0];

  // Показываем только грузы из города трака (или в радиусе 100 миль deadhead)
  const MAX_DEADHEAD = 100;
  const localLoads = availableLoads.filter((load) => {
    if (!activeTruck) return true;
    // Точное совпадение города
    if (load.origin.city === activeTruck.currentCity) return true;
    // Или в радиусе 100 миль
    const dh = distanceMiles(activeTruck.location, load.origin.location);
    return dh <= MAX_DEADHEAD;
  });

  // Рассчитываем deadhead для каждого груза от активного трака
  const loadsWithDeadhead = localLoads.map((load) => {
    const dh = activeTruck
      ? Math.round(distanceMiles(activeTruck.location, load.origin.location))
      : 0;
    return { load, deadhead: dh };
  });

  // Сортируем: сначала ближайшие к траку
  loadsWithDeadhead.sort((a, b) => a.deadhead - b.deadhead);

  function handleNegotiate(loadId: string, rate: number, brokerName: string) {
    openNegotiation(loadId, rate, brokerName);
  }

  return (
    <div className={styles.loadBoardWrap}>
      {/* Секция траков */}
      <div className={styles.truckSection}>
        <div className={styles.truckSectionTitle}>🚛 Твои траки</div>
        <div className={styles.truckChips}>
          {trucks.map((truck) => (
            <button
              key={truck.id}
              className={`${styles.truckChip} ${truck.id === activeTruck?.id ? styles.truckChipActive : ''}`}
              onClick={() => selectTruck(truck.id)}
            >
              <span className={styles.truckChipDot} style={{ background: getStatusColor(truck.status) }} />
              <span className={styles.truckChipName}>{truck.number}</span>
              <span className={styles.truckChipCity}>{truck.currentCity || '—'}</span>
              <span className={styles.truckChipStatus}>{getStatusLabel(truck.status)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Список грузов */}
      <div className={styles.loadSectionTitle}>
        Грузы рядом с {activeTruck?.number || 'траком'}
        {activeTruck?.currentCity && <span className={styles.loadSectionCity}> · 📍 {activeTruck.currentCity}</span>}
      </div>

      {loadsWithDeadhead.length === 0 ? (
        <div className={styles.empty}>
          <p>Нет доступных грузов</p>
          <p className={styles.emptyHint}>Новые грузы появятся через 1-2 минуты</p>
        </div>
      ) : (
        <div className={styles.loadList}>
          {loadsWithDeadhead.map(({ load, deadhead }) => (
            <div key={load.id} className={styles.loadCard}>
              <div className={styles.loadRoute}>
                <span>{load.origin.city}, {load.origin.state}</span>
                <span className={styles.loadArrow}>→</span>
                <span>{load.destination.city}, {load.destination.state}</span>
              </div>
              <div className={styles.loadMeta}>
                <span className={styles.loadEquip}>
                  {load.equipment === 'dry_van' ? 'DV' : load.equipment === 'reefer' ? 'RF' : 'FB'}
                </span>
                <span className={styles.loadMiles}>{load.miles} mi</span>
                <span className={styles.loadRpm}>${load.ratePerMile}/mi</span>
                {deadhead > 0 && (
                  <span className={styles.loadDeadhead} title="Deadhead — пустой пробег до погрузки">
                    🔄 {deadhead} mi DH
                  </span>
                )}
              </div>
              <div className={styles.loadBottom}>
                <span className={styles.loadRate}>${load.rate.toLocaleString()}</span>
                <button
                  className={styles.dispatchBtn}
                  onClick={() => handleNegotiate(load.id, load.rate, load.brokerName)}
                >
                  Торговаться →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'idle': return 'var(--text-muted)';
    case 'driving': return 'var(--accent-cyan)';
    case 'at_pickup': return 'var(--warning)';
    case 'at_delivery': return 'var(--success)';
    case 'breakdown': return 'var(--danger)';
    case 'hos_rest': return '#6366f1';
    default: return 'var(--text-muted)';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'idle': return 'Свободен';
    case 'driving': return 'В пути';
    case 'at_pickup': return 'Погрузка';
    case 'at_delivery': return 'Разгрузка';
    case 'breakdown': return 'Поломка';
    case 'hos_rest': return 'Отдых';
    default: return status;
  }
}

function ChatPlaceholder() {
  return (
    <div className={styles.empty}>
      <span style={{ fontSize: 32 }}>💬</span>
      <p>Сообщения</p>
      <p className={styles.emptyHint}>Здесь будут SMS, email и звонки от водителей и брокеров</p>
    </div>
  );
}

function FinancePlaceholder() {
  const session = useGameStore((s) => s.session);
  if (!session) return null;

  return (
    <div className={styles.financeWrap}>
      <div className={styles.financeCard}>
        <span className={styles.financeLabel}>Баланс</span>
        <span className={styles.financeValue} style={{ color: 'var(--accent-cyan)' }}>
          ${session.balance.toLocaleString()}
        </span>
      </div>
      <div className={styles.financeCard}>
        <span className={styles.financeLabel}>Заработано</span>
        <span className={styles.financeValue} style={{ color: 'var(--success)' }}>
          +${session.totalEarned.toLocaleString()}
        </span>
      </div>
      <div className={styles.financeCard}>
        <span className={styles.financeLabel}>Потрачено</span>
        <span className={styles.financeValue} style={{ color: 'var(--danger)' }}>
          -${session.totalSpent.toLocaleString()}
        </span>
      </div>
      <div className={styles.empty}>
        <p className={styles.emptyHint}>Полный P&L отчёт появится после первой доставки</p>
      </div>
    </div>
  );
}
