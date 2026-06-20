// ═══════════════════════════════════════════════════════
//  TabBar.tsx — нижняя навигация (mobile)
//  Нажатие открывает/закрывает BottomSheet
// ═══════════════════════════════════════════════════════
import { useGameStore, type ActivePanel } from '@/store/gameStore';
import { useNotificationStore } from '@/store/notificationStore';
import styles from './TabBar.module.css';

type MobileTab = 'trucks' | 'loadboard' | 'chat' | 'finance';

const TABS: { id: MobileTab; icon: string; label: string }[] = [
  { id: 'trucks', icon: '🚛', label: 'Траки' },
  { id: 'loadboard', icon: '📦', label: 'Грузы' },
  { id: 'chat', icon: '💬', label: 'Чат' },
  { id: 'finance', icon: '📊', label: 'Финансы' },
];

interface TabBarProps {
  activeTab: MobileTab | null;
  onTabChange: (tab: MobileTab | null) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const session = useGameStore((s) => s.session);
  const unreadNotifs = useNotificationStore((s) => s.unreadCount);
  const availableLoads = session?.loads.filter((l) => l.status === 'available').length || 0;

  function handleTap(tab: MobileTab) {
    // Toggle: если тот же таб — закрыть, иначе — открыть
    if (activeTab === tab) {
      onTabChange(null);
    } else {
      onTabChange(tab);
    }
  }

  function getBadge(tab: MobileTab): number | undefined {
    if (tab === 'loadboard') return availableLoads || undefined;
    if (tab === 'chat') return unreadNotifs || undefined;
    return undefined;
  }

  return (
    <nav className={styles.tabBar}>
      {TABS.map((tab) => {
        const badge = getBadge(tab.id);
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`${styles.tab} ${active ? styles.active : ''}`}
            onClick={() => handleTap(tab.id)}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.label}</span>
            {badge !== undefined && badge > 0 && (
              <span className={styles.badge}>{badge > 99 ? '99+' : badge}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
