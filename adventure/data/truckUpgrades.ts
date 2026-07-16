/**
 * Единый источник апгрейдов трака — используется и стором (логика применения),
 * и UI гаража (иконка/цена/эффект). Раньше эти данные дублировались в двух местах.
 */
export type UpgradeStat = 'reliability' | 'comfort' | 'legalStatus' | 'performance';

export interface TruckUpgrade {
  id: string;
  icon: string;
  label: string;
  desc: string;
  cost: number;
  color: string;
  /** Какие бары характеристик подсвечивать при установке (для анимации). */
  affects: UpgradeStat[];
  /** Применение к траку — повышает характеристики. */
  apply: (t: any) => any;
}

const clamp = (v: number) => Math.min(100, v);

export const TRUCK_UPGRADES: TruckUpgrade[] = [
  {
    id: 'engine', icon: '⚡', label: 'Двигатель', desc: '+15 производительность · +0.5 MPG',
    cost: 3000, color: '#06b6d4', affects: ['performance'],
    apply: (t) => ({ ...t, performance: clamp((t.performance ?? 60) + 15), fuelEfficiency: Math.min(9, (t.fuelEfficiency ?? 6.5) + 0.5) }),
  },
  {
    id: 'brakes', icon: '🛑', label: 'Тормоза', desc: '+15 надёжность · +12 safety',
    cost: 2000, color: '#f87171', affects: ['reliability'],
    apply: (t) => ({ ...t, reliability: clamp((t.reliability ?? 40) + 15), safetyScore: clamp((t.safetyScore ?? 70) + 12) }),
  },
  {
    id: 'tires', icon: '🛞', label: 'Новые шины', desc: '+20 тех. состояние · +10 safety',
    cost: 1500, color: '#4ade80', affects: ['legalStatus'],
    apply: (t) => ({ ...t, legalStatus: clamp((t.legalStatus ?? 40) + 20), safetyScore: clamp((t.safetyScore ?? 70) + 10) }),
  },
  {
    id: 'sleeper', icon: '🛏️', label: 'Кабина', desc: '+25 комфорт · +15 настроение',
    cost: 2500, color: '#fb923c', affects: ['comfort'],
    apply: (t) => ({ ...t, comfort: clamp((t.comfort ?? 30) + 25), mood: clamp((t.mood ?? 60) + 15) }),
  },
  {
    id: 'apu', icon: '❄️', label: 'APU система', desc: '+10 комфорт · +0.8 MPG',
    cost: 4000, color: '#8b5cf6', affects: ['comfort'],
    apply: (t) => ({ ...t, comfort: clamp((t.comfort ?? 30) + 10), fuelEfficiency: Math.min(9, (t.fuelEfficiency ?? 6.5) + 0.8) }),
  },
  {
    id: 'gps', icon: '📡', label: 'GPS + ELD', desc: '+10 тех. состояние · +8 HOS',
    cost: 800, color: '#38bdf8', affects: ['legalStatus'],
    apply: (t) => ({ ...t, legalStatus: clamp((t.legalStatus ?? 40) + 10), complianceRate: clamp((t.complianceRate ?? 80) + 8) }),
  },
];

export const getUpgrade = (id: string) => TRUCK_UPGRADES.find(u => u.id === id);
