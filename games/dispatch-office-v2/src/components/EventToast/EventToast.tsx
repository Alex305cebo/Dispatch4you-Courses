// ═══════════════════════════════════════════════════════
//  EventToast.tsx — всплывающие уведомления
//  Кликабельные, с крестиком, открывают popup с действиями
// ═══════════════════════════════════════════════════════
import { useState, useEffect, useRef } from 'react';
import { useNotificationStore, type Notification } from '@/store/notificationStore';
import { useGameStore } from '@/store/gameStore';
import styles from './EventToast.module.css';

const SHOW_DURATION = 6000;
const COOLDOWN = 10000;

export function EventToast() {
  const notifications = useNotificationStore((s) => s.notifications);
  const [current, setCurrent] = useState<Notification | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const shownIds = useRef(new Set<string>());
  const cooldownUntil = useRef(0);

  useEffect(() => {
    if (Date.now() < cooldownUntil.current) return;
    if (current) return;

    const important = notifications.find(
      (n) => !n.read && !shownIds.current.has(n.id) && (n.priority === 'high' || n.priority === 'critical')
    );

    if (important) {
      shownIds.current.add(important.id);
      setCurrent(important);

      const timer = setTimeout(() => {
        if (!showDetail) {
          setCurrent(null);
          cooldownUntil.current = Date.now() + COOLDOWN;
        }
      }, SHOW_DURATION);

      return () => clearTimeout(timer);
    }
  }, [notifications, current, showDetail]);

  if (shownIds.current.size > 100) {
    shownIds.current = new Set([...shownIds.current].slice(-50));
  }

  function handleClose(e: React.MouseEvent) {
    e.stopPropagation();
    setCurrent(null);
    setShowDetail(false);
    cooldownUntil.current = Date.now() + COOLDOWN;
  }

  function handleClick() {
    setShowDetail(true);
  }

  function handleAction(action: string) {
    if (action === 'repair' && current) {
      // Fix breakdown — restore truck to driving
      const store = useGameStore.getState();
      if (store.session && store.session.balance >= 350 && current.relatedTruckId) {
        store.adjustBalance(-350);
        store.updateTruck(current.relatedTruckId, (t) => ({
          ...t,
          status: t.route && t.route.length >= 2 ? 'driving' : 'idle',
        }));
      }
    }
    if (action === 'rest' && current?.relatedTruckId) {
      const store = useGameStore.getState();
      store.updateTruck(current.relatedTruckId, (t) => ({ ...t, status: 'hos_rest' }));
    }
    setCurrent(null);
    setShowDetail(false);
    cooldownUntil.current = Date.now() + COOLDOWN;
  }

  if (!current) return null;

  const color = current.priority === 'critical' ? '#ef4444' : '#f97316';
  const isBreakdown = current.subject.includes('поломка') || current.subject.includes('🔧');
  const isHOS = current.subject.includes('HOS');

  return (
    <>
      {/* Toast notification */}
      {!showDetail && (
        <div className={styles.toast} onClick={handleClick}>
          <div className={styles.bar} style={{ background: color }} />
          <div className={styles.body}>
            <div className={styles.subject}>{current.subject}</div>
            <div className={styles.message}>{current.message}</div>
          </div>
          <button className={styles.closeBtn} onClick={handleClose}>✕</button>
        </div>
      )}

      {/* Detail popup */}
      {showDetail && (
        <div className={styles.detailOverlay} onClick={handleClose}>
          <div className={styles.detailCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.detailHeader}>
              <span className={styles.detailIcon}>{isBreakdown ? '🔧' : isHOS ? '⏰' : '⚠️'}</span>
              <div>
                <div className={styles.detailTitle}>{current.subject}</div>
                <div className={styles.detailFrom}>{current.from}</div>
              </div>
              <button className={styles.detailClose} onClick={handleClose}>✕</button>
            </div>
            <div className={styles.detailBody}>
              <p>{current.message}</p>
            </div>
            <div className={styles.detailActions}>
              {isBreakdown && (
                <>
                  <button className={styles.actionBtn} onClick={() => handleAction('repair')}>
                    🛠️ Call Roadside Assist ($350)
                  </button>
                  <button className={styles.actionBtnSecondary} onClick={() => handleAction('wait')}>
                    ⏳ Wait for help
                  </button>
                </>
              )}
              {isHOS && (
                <>
                  <button className={styles.actionBtn} onClick={() => handleAction('rest')}>
                    🛑 Find Truck Stop
                  </button>
                  <button className={styles.actionBtnSecondary} onClick={() => handleAction('continue')}>
                    ⚠️ Continue (violation)
                  </button>
                </>
              )}
              {!isBreakdown && !isHOS && (
                <button className={styles.actionBtn} onClick={() => handleAction('ok')}>
                  OK, понял
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
