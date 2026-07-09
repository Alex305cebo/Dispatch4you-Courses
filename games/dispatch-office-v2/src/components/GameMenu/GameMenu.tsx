// ═══════════════════════════════════════════════════════
//  GameMenu.tsx — внутриигровое меню (popup)
//  Новая игра, сброс, информация
// ═══════════════════════════════════════════════════════
import { useGameStore } from '@/store/gameStore';
import { clearLocalSave } from '@/utils/saveSystem';
import { generateLoads } from '@/game/loadGenerator';
import { getCityByName } from '@/data/cities';
import { generateDriver } from '@/data/drivers';
import type { Truck } from '@/types';
import styles from './GameMenu.module.css';

interface Props {
  visible: boolean;
  onClose: () => void;
  onOpenShop?: () => void;
}

export function GameMenu({ visible, onClose, onOpenShop }: Props) {
  if (!visible) return null;

  function handleNewGame() {
    if (!confirm('Начать новую игру? Текущий прогресс будет потерян.')) return;

    clearLocalSave();
    const store = useGameStore.getState();
    store.clearSession();

    // Создаём новую сессию
    store.initSession(3, 'Dispatch Office');

    // Новый трак
    const knoxville = getCityByName('Knoxville')!;
    const driver = generateDriver();
    const truck: Truck = {
      id: 'truck_1',
      number: 'T-101',
      type: 'dry_van',
      driver,
      status: 'idle',
      location: knoxville.location,
      currentCity: 'Knoxville',
      route: undefined,
      routeProgress: 0,
      eta: undefined,
      milesDriven: 0,
      revenue: 0,
      expenses: 0,
    };
    store.setTrucks([truck]);
    store.addLoads(generateLoads(0, 12, 'Knoxville'));
    onClose();
  }

  function handleSpeedInfo() {
    alert('Скорость игры:\n×1 = 1 мин/сек\n×2 = 2 мин/сек\n×5 = 5 мин/сек\n×10 = 10 мин/сек\n\nСмена длится 12 игровых часов.');
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.menu} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>⚙️ Меню</h3>

        <button className={styles.item} onClick={handleNewGame}>
          🎮 Новая игра
        </button>
        <button className={styles.item} onClick={() => { onClose(); onOpenShop?.(); }}>
          🏪 Купить трак
        </button>
        <button className={styles.item} onClick={handleSpeedInfo}>
          ⏱️ Скорость игры
        </button>
        <button className={styles.item} onClick={onClose}>
          ← Закрыть
        </button>

        <div className={styles.footer}>
          Dispatch Office v2.0 · Vite + React
        </div>
      </div>
    </div>
  );
}
