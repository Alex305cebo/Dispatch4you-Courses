import { useGameStore } from '@/store/gameStore';
import { useNotificationStore } from '@/store/notificationStore';
import { formatMoney, formatGameTime } from '@/utils/format';
import { SpeedControl } from '@/components/SpeedControl/SpeedControl';
import { ProfileButton } from '@/components/ProfileButton/ProfileButton';
import { useBreakpoint } from '@/utils/useBreakpoint';
import styles from './Header.module.css';

interface HeaderProps {
  onShowNotifications?: () => void;
  onShowMenu?: () => void;
}

export function Header({ onShowNotifications, onShowMenu }: HeaderProps) {
  const session = useGameStore((s) => s.session);
  const activePanel = useGameStore((s) => s.activePanel);
  const setActivePanel = useGameStore((s) => s.setActivePanel);
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'mobile';
  const unreadNotifs = useNotificationStore((s) => s.unreadCount);

  const gameTimeMinutes = useGameStore((s) => s.session ? Math.floor(s.session.gameTime) : 0);

  if (!session) return null;

  const availableLoads = session.loads.filter((l) => l.status === 'available').length;
  const displayTime = formatGameTime(gameTimeMinutes + 360);

  return (
    <header className={styles.header}>
      {/* Left: Logo */}
      <div className={styles.left}>
        <img src="/game2/favicon.svg" alt="" className={styles.logoImg} />
        {!isMobile && <span className={styles.logoText}>Dispatch Office</span>}
      </div>

      {/* Center: Speed + Stats */}
      <div className={styles.center}>
        <SpeedControl />
        <div className={styles.stat}>
          <span className={styles.statLabel}>БАЛАНС</span>
          <span className={`${styles.statValue} ${styles.balance}`}>
            {formatMoney(session.balance)}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>ВРЕМЯ</span>
          <span className={styles.statValue}>{displayTime}</span>
        </div>
      </div>

      {/* Right */}
      <div className={styles.right}>
        {/* Desktop buttons */}
        {!isMobile && (
          <>
            <button
              className={`${styles.iconBtn} ${activePanel === 'loadboard' ? styles.iconBtnActive : ''}`}
              title="Load Board"
              onClick={() => setActivePanel('loadboard')}
            >
              <span>📦</span>
              {availableLoads > 0 && <span className={styles.badge}>{availableLoads}</span>}
            </button>
            <button
              className={styles.iconBtn}
              title="Уведомления"
              onClick={onShowNotifications}
            >
              <span>🔔</span>
              {unreadNotifs > 0 && <span className={styles.badge}>{unreadNotifs}</span>}
            </button>
            <button
              className={`${styles.iconBtn} ${activePanel === 'finance' ? styles.iconBtnActive : ''}`}
              title="Финансы"
              onClick={() => setActivePanel('finance')}
            >
              <span>📊</span>
            </button>
          </>
        )}

        {/* Menu button (both mobile and desktop) */}
        <button className={styles.iconBtn} title="Меню" onClick={onShowMenu}>
          <span>☰</span>
        </button>

        <ProfileButton />
      </div>
    </header>
  );
}
