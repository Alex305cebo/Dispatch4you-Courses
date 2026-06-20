// ═══════════════════════════════════════════════════════
//  TruckShop.tsx — покупка новых траков
//  Игрок начинает с 1 трака, может купить до 5
// ═══════════════════════════════════════════════════════
import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { generateDriver } from '@/data/drivers';
import { formatMoney } from '@/utils/format';
import type { Truck, TruckType } from '@/types';
import styles from './TruckShop.module.css';

interface TruckOffer {
  type: TruckType;
  name: string;
  price: number;
  description: string;
  emoji: string;
  stats: { reliability: number; speed: number; capacity: string };
}

const TRUCK_OFFERS: TruckOffer[] = [
  {
    type: 'dry_van', name: 'Dry Van (Used)', price: 8000,
    description: 'Подержанный, но рабочий. Подходит для большинства грузов.',
    emoji: '🚛', stats: { reliability: 60, speed: 55, capacity: '45,000 lbs' },
  },
  {
    type: 'dry_van', name: 'Dry Van (New)', price: 15000,
    description: 'Новый трак. Надёжный, быстрый, меньше поломок.',
    emoji: '🚛', stats: { reliability: 90, speed: 60, capacity: '45,000 lbs' },
  },
  {
    type: 'reefer', name: 'Reefer', price: 20000,
    description: 'Рефрижератор. Перевозит продукты, фарму. Высокие ставки.',
    emoji: '❄️', stats: { reliability: 75, speed: 53, capacity: '42,000 lbs' },
  },
  {
    type: 'flatbed', name: 'Flatbed', price: 12000,
    description: 'Открытая платформа. Стройматериалы, оборудование.',
    emoji: '🏗️', stats: { reliability: 80, speed: 50, capacity: '48,000 lbs' },
  },
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function TruckShop({ visible, onClose }: Props) {
  const session = useGameStore((s) => s.session);
  const setTrucks = useGameStore((s) => s.setTrucks);
  const adjustBalance = useGameStore((s) => s.adjustBalance);
  const [bought, setBought] = useState<string | null>(null);

  if (!visible || !session) return null;

  const truckCount = session.trucks.length;
  const maxTrucks = 5;
  const canBuy = truckCount < maxTrucks;

  function buyTruck(offer: TruckOffer) {
    if (!canBuy || session!.balance < offer.price) return;

    const driver = generateDriver();
    const existingTruck = session!.trucks[0]; // spawn в том же городе

    const newTruck: Truck = {
      id: `truck_${truckCount + 1}`,
      number: `T-${100 + truckCount + 1}`,
      type: offer.type,
      driver,
      status: 'idle',
      location: { ...existingTruck.location },
      currentCity: existingTruck.currentCity,
      route: undefined,
      routeProgress: 0,
      eta: undefined,
      milesDriven: 0,
      revenue: 0,
      expenses: 0,
    };

    setTrucks([...session!.trucks, newTruck]);
    adjustBalance(-offer.price);
    setBought(offer.name);
    setTimeout(() => setBought(null), 2000);
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>🏪 Truck Shop</h3>
          <span className={styles.count}>{truckCount}/{maxTrucks} траков</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.balance}>
          Баланс: <span>{formatMoney(session.balance)}</span>
        </div>

        {!canBuy && (
          <div className={styles.maxReached}>Максимум 5 траков. Продай старый чтобы купить новый.</div>
        )}

        {bought && (
          <div className={styles.boughtMsg}>✅ Куплен: {bought}</div>
        )}

        <div className={styles.list}>
          {TRUCK_OFFERS.map((offer, i) => {
            const canAfford = session.balance >= offer.price;
            return (
              <div key={i} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardEmoji}>{offer.emoji}</span>
                  <div>
                    <div className={styles.cardName}>{offer.name}</div>
                    <div className={styles.cardDesc}>{offer.description}</div>
                  </div>
                </div>
                <div className={styles.cardStats}>
                  <span>⚙️ {offer.stats.reliability}%</span>
                  <span>🏎️ {offer.stats.speed} mph</span>
                  <span>📦 {offer.stats.capacity}</span>
                </div>
                <div className={styles.cardBottom}>
                  <span className={styles.cardPrice}>{formatMoney(offer.price)}</span>
                  <button
                    className={styles.buyBtn}
                    onClick={() => buyTruck(offer)}
                    disabled={!canBuy || !canAfford}
                  >
                    {!canAfford ? 'Нет денег' : !canBuy ? 'Макс' : 'Купить'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
