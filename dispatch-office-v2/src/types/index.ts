// ═══════════════════════════════════════════════════════
//  Dispatch Office V2 — Core Type Definitions
// ═══════════════════════════════════════════════════════

export type TruckStatus =
  | 'idle'           // свободный, без груза
  | 'driving'        // едет к pickup или к delivery
  | 'at_pickup'      // на загрузке
  | 'at_delivery'    // на разгрузке
  | 'breakdown'      // поломка
  | 'detention'      // задержка
  | 'hos_rest';      // обязательный отдых HOS

export type TruckType = 'dry_van' | 'reefer' | 'flatbed' | 'step_deck';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  experience: number;       // годы
  hosRemaining: number;     // минут до обязательного отдыха
  mood: 'happy' | 'normal' | 'tired' | 'angry';
  phone: string;
}

export interface Truck {
  id: string;
  number: string;           // номер трака (напр. "T-101")
  type: TruckType;
  driver: Driver;
  status: TruckStatus;

  // Фаза доставки
  deliveryPhase?: 'to_pickup' | 'to_delivery';

  // Положение
  location: LatLng;
  currentCity?: string;

  // Текущий груз (если есть)
  currentLoadId?: string;

  // Маршрут (массив координат)
  route?: LatLng[];
  routeProgress?: number;   // 0..1
  eta?: number;             // timestamp прибытия

  // Статистика
  milesDriven: number;
  revenue: number;
  expenses: number;
}

export interface Load {
  id: string;
  origin: { city: string; state: string; location: LatLng };
  destination: { city: string; state: string; location: LatLng };
  miles: number;
  rate: number;             // $ за весь груз
  ratePerMile: number;
  equipment: TruckType;
  weight: number;           // lbs
  pickupDate: number;       // timestamp
  deliveryDate: number;
  brokerId: string;
  brokerName: string;

  // Статус груза
  status: 'available' | 'booked' | 'in_transit' | 'delivered' | 'cancelled';
  bookedByTruckId?: string;
}

export interface Broker {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  rating: number;           // 1..5
  avatarUrl?: string;
}

export interface Message {
  id: string;
  type: 'sms' | 'email' | 'call';
  from: 'driver' | 'broker' | 'system';
  fromId?: string;          // truck.id или broker.id
  fromName: string;
  subject?: string;
  body: string;
  timestamp: number;
  read: boolean;
  responseOptions?: string[];
}

export interface GameEvent {
  id: string;
  type: 'breakdown' | 'detention' | 'tonu' | 'weather' | 'inspection' | 'hos';
  truckId?: string;
  loadId?: string;
  timestamp: number;
  resolved: boolean;
  description: string;
  impact: { money?: number; reputation?: number };
}

export interface FinanceRecord {
  id: string;
  timestamp: number;
  type: 'income' | 'expense';
  category: 'load_revenue' | 'fuel' | 'repair' | 'detention' | 'tonu' | 'other';
  amount: number;
  truckId?: string;
  description: string;
}

export interface GameSession {
  id: string;
  name: string;
  createdAt: number;
  lastPlayedAt: number;
  truckCount: 3 | 4 | 5;
  day: number;

  balance: number;
  totalEarned: number;
  totalSpent: number;

  trucks: Truck[];
  loads: Load[];
  brokers: Broker[];
  messages: Message[];
  events: GameEvent[];
  finance: FinanceRecord[];

  // Игровое время (отдельное от реального)
  gameTime: number;         // minutes since session start
}

export type GameGrade = 'S' | 'A' | 'B' | 'C' | 'D';

export interface ShiftSummary {
  grade: GameGrade;
  revenue: number;
  expenses: number;
  profit: number;
  loadsDelivered: number;
  trucksCount: number;
  goalMet: boolean;
  target: number;
}
