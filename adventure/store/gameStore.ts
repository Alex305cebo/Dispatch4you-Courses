import { create } from 'zustand';
import { SHIFT_DURATION, SHIFT_START_HOUR, SHIFT_START_MINUTE, CITIES, TIME_SCALE } from '../constants/config';

// ─── ТИПЫ ───────────────────────────────────────────────────────────────────

export type TruckStatus =
  | 'idle'        // свободен, ждёт груза
  | 'driving'     // едет к pickup
  | 'at_pickup'   // на погрузке
  | 'loaded'      // едет к delivery
  | 'at_delivery' // на разгрузке
  | 'breakdown'   // поломка
  | 'waiting';    // ждёт (detention)

export interface Truck {
  id: string;
  name: string;
  driver: string;
  status: TruckStatus;
  position: [number, number]; // [lng, lat]
  currentCity: string;
  destinationCity: string | null;
  progress: number; // 0-1 прогресс по маршруту
  currentLoad: ActiveLoad | null;
  hoursLeft: number; // HOS часов осталось
  mood: number; // 0-100 настроение водителя
  routePath: Array<[number, number]> | null; // реальный маршрут по Interstate
  
  // Performance metrics (ZigZag-style)
  safetyScore: number; // 0-100 безопасность вождения
  fuelEfficiency: number; // MPG (miles per gallon)
  onTimeRate: number; // 0-100% доставок вовремя
  complianceRate: number; // 0-100% соблюдение HOS
  totalMiles: number; // всего миль проехано
  totalDeliveries: number; // всего доставок
  hosViolations: number; // количество нарушений HOS
  lastInspection: number; // минута последней инспекции
}

export interface LoadOffer {
  id: string;
  brokerId: string;
  brokerName: string;
  brokerCompany: string;
  fromCity: string;
  toCity: string;
  commodity: string;
  weight: number;
  equipment: 'Dry Van' | 'Reefer' | 'Flatbed';
  postedRate: number;   // ставка брокера
  marketRate: number;   // рыночная ставка (скрыта от игрока)
  minRate: number;      // минимум брокера (скрыт)
  miles: number;
  pickupTime: string;   // "08:00 AM"
  deliveryTime: string; // "Tomorrow 14:00"
  expiresAt: number;    // игровая минута когда истекает
  isUrgent: boolean;
  equipment_notes?: string;
}

export interface ActiveLoad extends LoadOffer {
  agreedRate: number;
  truckId: string;
  phase: 'to_pickup' | 'loading' | 'to_delivery' | 'unloading' | 'done';
  detentionMinutes: number;
  detentionPaid: boolean;
}

export interface Broker {
  id: string;
  name: string;
  company: string;
  relationship: number; // 0-100
  callsAnswered: number;
  loadsCompleted: number;
  avatar: string;
}

export interface GameEvent {
  id: string;
  type: 'breakdown' | 'detention' | 'tonu' | 'cargo_theft' | 'hos_violation' | 'weather' | 'rate_dispute' | 'pod_issue';
  truckId: string;
  title: string;
  message: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  options: EventOption[];
  triggeredAt: number; // игровая минута
  resolved: boolean;
}

export interface EventOption {
  id: string;
  text: string;
  outcome: {
    moneyDelta: number;
    reputationDelta: number;
    relationshipDelta: number;
    brokerId?: string;
    description: string;
    isCorrect: boolean;
  };
}

export interface FinanceEntry {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  minute: number;
}

export interface Notification {
  id: string;
  type: 'missed_call' | 'email' | 'voicemail' | 'text' | 'urgent' | 'detention' | 'pod_ready' | 'rate_con';
  from: string; // кто отправил (брокер, водитель)
  subject: string;
  message: string;
  minute: number; // когда пришло
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionRequired?: boolean;
  relatedTruckId?: string;
  relatedLoadId?: string;
}

// ─── СТОР ───────────────────────────────────────────────────────────────────

interface PendingEmailResponse {
  triggerAt: number;
  from: string;
  subject: string;
  isDetention: boolean;
  isPOD: boolean;
  isRateCon: boolean;
  isIssue: boolean;
}

interface GameState {
  // Мета
  phase: 'menu' | 'playing' | 'shift_end';
  day: number;
  gameMinute: number; // 0 = 06:00, 480 = 14:00

  // Финансы
  balance: number;
  totalEarned: number;
  totalLost: number;
  financeLog: FinanceEntry[];

  // Репутация
  reputation: number;

  // Траки
  trucks: Truck[];

  // Load Board
  availableLoads: LoadOffer[];
  activeLoads: ActiveLoad[];
  bookedLoads: ActiveLoad[]; // забуканы но не назначены

  // Брокеры
  brokers: Broker[];

  // События
  activeEvents: GameEvent[];
  resolvedEvents: GameEvent[];

  // Уведомления
  notifications: Notification[];
  unreadCount: number;
  
  // Отложенные email ответы
  pendingEmailResponses: PendingEmailResponse[];

  // Переговоры
  negotiation: {
    open: boolean;
    load: LoadOffer | null;
    currentOffer: number;
    round: number;
    brokerMood: 'happy' | 'neutral' | 'annoyed' | 'angry';
  };

  // Выбранный трак/событие
  selectedTruckId: string | null;
  selectedEventId: string | null;
  selectedLoadId: string | null; // выбранный груз на карте

  // ─── ACTIONS ───

  startShift: () => void;
  tickClock: () => void;

  openNegotiation: (load: LoadOffer) => void;
  makeOffer: (amount: number) => 'accepted' | 'counter' | 'rejected';
  closeNegotiation: () => void;
  bookLoad: (load: ActiveLoad) => void; // сохранить забуканный груз
  assignLoadToTruck: (load: ActiveLoad, truckId: string) => Promise<void>;
  cancelLoad: (loadId: string, params: { reason: string; tonuFee: number; reputationHit: number }) => void;

  resolveEvent: (eventId: string, optionId: string) => void;
  addEvent: (event: GameEvent) => void;

  addMoney: (amount: number, description: string) => void;
  removeMoney: (amount: number, description: string) => void;

  selectTruck: (id: string | null) => void;
  selectEvent: (id: string | null) => void;
  selectLoad: (id: string | null) => void;
  updateTruckRoute: (truckId: string, routePath: Array<[number, number]>) => void;

  addNotification: (notification: Omit<Notification, 'id' | 'minute' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  sendEmail: (params: { to: string; subject: string; body: string; isReply: boolean; replyToId?: string }) => void;

  refreshLoadBoard: () => void;
  endShift: () => void;
  
  // Сохранение и загрузка
  saveGame: () => void;
  loadGame: () => boolean;
  clearSave: () => void;
}

// ─── НАЧАЛЬНЫЕ ДАННЫЕ ────────────────────────────────────────────────────────

// Начальные грузы для траков в пути
const INITIAL_LOAD_1: ActiveLoad = {
  id: 'INIT-L1',
  brokerId: 'B1',
  brokerName: 'Tom',
  brokerCompany: 'FastFreight LLC',
  fromCity: 'Chicago',
  toCity: 'Houston',
  commodity: 'Электроника',
  weight: 42000,
  equipment: 'Dry Van',
  postedRate: 2500,
  marketRate: 2800,
  minRate: 2400,
  miles: 1092,
  pickupTime: 'Yesterday 14:00',
  deliveryTime: 'Tomorrow 08:00',
  expiresAt: 0,
  isUrgent: false,
  agreedRate: 2700,
  truckId: 'T1',
  phase: 'to_delivery',
  detentionMinutes: 0,
  detentionPaid: false,
};

const INITIAL_LOAD_2: ActiveLoad = {
  id: 'INIT-L2',
  brokerId: 'B2',
  brokerName: 'Sarah',
  brokerCompany: 'QuickLoad Inc',
  fromCity: 'Los Angeles',
  toCity: 'Dallas',
  commodity: 'Автозапчасти',
  weight: 38000,
  equipment: 'Dry Van',
  postedRate: 3000,
  marketRate: 3400,
  minRate: 2900,
  miles: 1435,
  pickupTime: '2 days ago 10:00',
  deliveryTime: 'Day after tomorrow 06:00',
  expiresAt: 0,
  isUrgent: false,
  agreedRate: 3200,
  truckId: 'T2',
  phase: 'to_delivery',
  detentionMinutes: 0,
  detentionPaid: false,
};

const INITIAL_LOAD_3: ActiveLoad = {
  id: 'INIT-L3',
  brokerId: 'B3',
  brokerName: 'Mike',
  brokerCompany: 'EastFreight Co',
  fromCity: 'New York',
  toCity: 'Atlanta',
  commodity: 'Медицинское оборудование',
  weight: 35000,
  equipment: 'Dry Van',
  postedRate: 1900,
  marketRate: 2200,
  minRate: 1800,
  miles: 881,
  pickupTime: 'Yesterday 06:00',
  deliveryTime: 'Today 08:00',
  expiresAt: 0,
  isUrgent: false,
  agreedRate: 2100,
  truckId: 'T3',
  phase: 'unloading',
  detentionMinutes: 0,
  detentionPaid: false,
};

const INITIAL_LOAD_4: ActiveLoad = {
  id: 'INIT-L4',
  brokerId: 'B4',
  brokerName: 'Lisa',
  brokerCompany: 'PrimeHaul',
  fromCity: 'Portland',
  toCity: 'Seattle',
  commodity: 'Продукты питания',
  weight: 28000,
  equipment: 'Reefer',
  postedRate: 700,
  marketRate: 850,
  minRate: 650,
  miles: 175,
  pickupTime: 'Yesterday 18:00',
  deliveryTime: 'Today 07:00',
  expiresAt: 0,
  isUrgent: false,
  agreedRate: 800,
  truckId: 'T4',
  phase: 'unloading',
  detentionMinutes: 0,
  detentionPaid: false,
};

const INITIAL_LOAD_5: ActiveLoad = {
  id: 'INIT-L5',
  brokerId: 'B5',
  brokerName: 'Dave',
  brokerCompany: 'CrossCountry',
  fromCity: 'Salt Lake City',
  toCity: 'Denver',
  commodity: 'Строительные материалы',
  weight: 40000,
  equipment: 'Flatbed',
  postedRate: 1200,
  marketRate: 1500,
  minRate: 1100,
  miles: 525,
  pickupTime: 'Yesterday 12:00',
  deliveryTime: 'Today 06:00',
  expiresAt: 0,
  isUrgent: false,
  agreedRate: 1400,
  truckId: 'T5',
  phase: 'unloading',
  detentionMinutes: 0,
  detentionPaid: false,
};

const INITIAL_LOAD_6: ActiveLoad = {
  id: 'INIT-L6',
  brokerId: 'B1',
  brokerName: 'Tom',
  brokerCompany: 'FastFreight LLC',
  fromCity: 'Savannah',
  toCity: 'Miami',
  commodity: 'Фармацевтика',
  weight: 32000,
  equipment: 'Reefer',
  postedRate: 850,
  marketRate: 1000,
  minRate: 800,
  miles: 380,
  pickupTime: 'Yesterday 20:00',
  deliveryTime: 'Today 14:00',
  expiresAt: 0,
  isUrgent: false,
  agreedRate: 950,
  truckId: 'T6',
  phase: 'to_delivery',
  detentionMinutes: 0,
  detentionPaid: false,
};

const INITIAL_TRUCKS: Truck[] = [
  // 2 трака в пути на доставку
  {
    id: 'T1',
    name: 'Truck 1047',
    driver: 'John Martinez',
    status: 'loaded', // едет с грузом
    position: CITIES['Memphis'], // между Chicago и Houston
    currentCity: 'Memphis',
    destinationCity: 'Houston',
    progress: 0.6, // 60% пути
    currentLoad: INITIAL_LOAD_1,
    hoursLeft: 8,
    mood: 90,
    routePath: null, // будет загружен при старте
    safetyScore: 95,
    fuelEfficiency: 6.8,
    onTimeRate: 98,
    complianceRate: 100,
    totalMiles: 45230,
    totalDeliveries: 156,
    hosViolations: 0,
    lastInspection: 0,
  },
  {
    id: 'T2',
    name: 'Truck 2023',
    driver: 'Carlos Rivera',
    status: 'loaded',
    position: CITIES['Phoenix'], // между LA и Dallas
    currentCity: 'Phoenix',
    destinationCity: 'Dallas',
    progress: 0.5,
    currentLoad: INITIAL_LOAD_2,
    hoursLeft: 9,
    mood: 85,
    routePath: null,
    safetyScore: 92,
    fuelEfficiency: 7.1,
    onTimeRate: 96,
    complianceRate: 98,
    totalMiles: 38450,
    totalDeliveries: 142,
    hosViolations: 1,
    lastInspection: 0,
  },
  // 3 трака на разгрузке (at_delivery)
  {
    id: 'T3',
    name: 'Truck 3012',
    driver: 'Mike Chen',
    status: 'at_delivery',
    position: CITIES['Atlanta'],
    currentCity: 'Atlanta',
    destinationCity: null,
    progress: 1,
    currentLoad: INITIAL_LOAD_3,
    hoursLeft: 11,
    mood: 95,
    routePath: null,
    safetyScore: 98,
    fuelEfficiency: 7.3,
    onTimeRate: 99,
    complianceRate: 100,
    totalMiles: 52100,
    totalDeliveries: 178,
    hosViolations: 0,
    lastInspection: 0,
  },
  {
    id: 'T4',
    name: 'Truck 4034',
    driver: 'Tom Wilson',
    status: 'at_delivery',
    position: CITIES['Seattle'],
    currentCity: 'Seattle',
    destinationCity: null,
    progress: 1,
    currentLoad: INITIAL_LOAD_4,
    hoursLeft: 10,
    mood: 100,
    routePath: null,
    safetyScore: 88,
    fuelEfficiency: 6.5,
    onTimeRate: 94,
    complianceRate: 96,
    totalMiles: 41200,
    totalDeliveries: 135,
    hosViolations: 2,
    lastInspection: 0,
  },
  {
    id: 'T5',
    name: 'Truck 5056',
    driver: 'Lisa Brown',
    status: 'at_delivery',
    position: CITIES['Denver'],
    currentCity: 'Denver',
    destinationCity: null,
    progress: 1,
    currentLoad: INITIAL_LOAD_5,
    hoursLeft: 11,
    mood: 92,
    routePath: null,
    safetyScore: 97,
    fuelEfficiency: 7.0,
    onTimeRate: 97,
    complianceRate: 100,
    totalMiles: 48900,
    totalDeliveries: 165,
    hosViolations: 0,
    lastInspection: 0,
  },
  // 1 трак в пути на доставку в Майами
  {
    id: 'T6',
    name: 'Truck 6078',
    driver: 'David Martinez',
    status: 'loaded',
    position: CITIES['Jacksonville'], // между Savannah и Miami
    currentCity: 'Jacksonville',
    destinationCity: 'Miami',
    progress: 0.7,
    currentLoad: INITIAL_LOAD_6,
    hoursLeft: 7,
    mood: 88,
    routePath: null,
    safetyScore: 90,
    fuelEfficiency: 6.9,
    onTimeRate: 95,
    complianceRate: 97,
    totalMiles: 39800,
    totalDeliveries: 148,
    hosViolations: 1,
    lastInspection: 0,
  },
  // 3 свободных трака готовых к работе
  {
    id: 'T7',
    name: 'Truck 7089',
    driver: 'James Anderson',
    status: 'idle',
    position: CITIES['Chicago'],
    currentCity: 'Chicago',
    destinationCity: null,
    progress: 0,
    currentLoad: null,
    hoursLeft: 11,
    mood: 95,
    routePath: null,
    safetyScore: 96,
    fuelEfficiency: 7.2,
    onTimeRate: 98,
    complianceRate: 100,
    totalMiles: 44500,
    totalDeliveries: 152,
    hosViolations: 0,
    lastInspection: 0,
  },
  {
    id: 'T8',
    name: 'Truck 8091',
    driver: 'Maria Garcia',
    status: 'idle',
    position: CITIES['Dallas'],
    currentCity: 'Dallas',
    destinationCity: null,
    progress: 0,
    currentLoad: null,
    hoursLeft: 11,
    mood: 100,
    routePath: null,
    safetyScore: 99,
    fuelEfficiency: 7.4,
    onTimeRate: 99,
    complianceRate: 100,
    totalMiles: 51200,
    totalDeliveries: 171,
    hosViolations: 0,
    lastInspection: 0,
  },
  {
    id: 'T9',
    name: 'Truck 9102',
    driver: 'Robert Johnson',
    status: 'idle',
    position: CITIES['Los Angeles'],
    currentCity: 'Los Angeles',
    destinationCity: null,
    progress: 0,
    currentLoad: null,
    hoursLeft: 10,
    mood: 90,
    routePath: null,
    safetyScore: 93,
    fuelEfficiency: 6.8,
    onTimeRate: 96,
    complianceRate: 98,
    totalMiles: 42300,
    totalDeliveries: 145,
    hosViolations: 1,
    lastInspection: 0,
  },
];

const INITIAL_BROKERS: Broker[] = [
  { id: 'B1', name: 'Tom', company: 'FastFreight LLC', relationship: 50, callsAnswered: 0, loadsCompleted: 0, avatar: '👨‍💼' },
  { id: 'B2', name: 'Sarah', company: 'QuickLoad Inc', relationship: 40, callsAnswered: 0, loadsCompleted: 0, avatar: '👩‍💼' },
  { id: 'B3', name: 'Mike', company: 'EastFreight Co', relationship: 60, callsAnswered: 0, loadsCompleted: 0, avatar: '🧑‍💼' },
  { id: 'B4', name: 'Lisa', company: 'PrimeHaul', relationship: 30, callsAnswered: 0, loadsCompleted: 0, avatar: '👩‍💼' },
  { id: 'B5', name: 'Dave', company: 'CrossCountry', relationship: 55, callsAnswered: 0, loadsCompleted: 0, avatar: '👨‍💼' },
];

function generateLoads(minute: number): LoadOffer[] {
  // Расширенный список маршрутов - покрываем все основные города
  const routes = [
    // Из Chicago
    { from: 'Chicago', to: 'Houston', miles: 1092, base: 3200 },
    { from: 'Chicago', to: 'Miami', miles: 1377, base: 3800 },
    { from: 'Chicago', to: 'Denver', miles: 1003, base: 2900 },
    { from: 'Chicago', to: 'Los Angeles', miles: 2015, base: 5500 },
    { from: 'Chicago', to: 'Atlanta', miles: 716, base: 2200 },
    
    // Из Dallas
    { from: 'Dallas', to: 'Atlanta', miles: 781, base: 2400 },
    { from: 'Dallas', to: 'Los Angeles', miles: 1435, base: 3900 },
    { from: 'Dallas', to: 'Chicago', miles: 967, base: 2800 },
    { from: 'Dallas', to: 'Miami', miles: 1308, base: 3600 },
    
    // Из Atlanta
    { from: 'Atlanta', to: 'New York', miles: 881, base: 2800 },
    { from: 'Atlanta', to: 'Dallas', miles: 781, base: 2200 },
    { from: 'Atlanta', to: 'Miami', miles: 662, base: 2000 },
    { from: 'Atlanta', to: 'Chicago', miles: 716, base: 2100 },
    
    // Из Los Angeles
    { from: 'Los Angeles', to: 'Dallas', miles: 1435, base: 4100 },
    { from: 'Los Angeles', to: 'Phoenix', miles: 373, base: 1100 },
    { from: 'Los Angeles', to: 'Seattle', miles: 1135, base: 3300 },
    { from: 'Los Angeles', to: 'Denver', miles: 1016, base: 2900 },
    
    // Из Houston
    { from: 'Houston', to: 'Chicago', miles: 1092, base: 3000 },
    { from: 'Houston', to: 'Atlanta', miles: 789, base: 2300 },
    { from: 'Houston', to: 'Miami', miles: 1190, base: 3300 },
    
    // Из New York
    { from: 'New York', to: 'Chicago', miles: 790, base: 2600 },
    { from: 'New York', to: 'Atlanta', miles: 881, base: 2700 },
    { from: 'New York', to: 'Miami', miles: 1280, base: 3500 },
    
    // Из Seattle
    { from: 'Seattle', to: 'Los Angeles', miles: 1135, base: 3300 },
    { from: 'Seattle', to: 'Portland', miles: 175, base: 600 },
    { from: 'Seattle', to: 'Denver', miles: 1306, base: 3600 },
    
    // Из Miami
    { from: 'Miami', to: 'Atlanta', miles: 662, base: 2000 },
    { from: 'Miami', to: 'Jacksonville', miles: 345, base: 1000 },
    { from: 'Miami', to: 'New York', miles: 1280, base: 3500 },
    
    // Из Denver
    { from: 'Denver', to: 'Chicago', miles: 1003, base: 2900 },
    { from: 'Denver', to: 'Salt Lake City', miles: 525, base: 1500 },
    { from: 'Denver', to: 'Dallas', miles: 781, base: 2200 },
    
    // Из Phoenix
    { from: 'Phoenix', to: 'Los Angeles', miles: 373, base: 1100 },
    { from: 'Phoenix', to: 'Dallas', miles: 1071, base: 3000 },
    
    // Из Portland
    { from: 'Portland', to: 'Seattle', miles: 175, base: 600 },
    { from: 'Portland', to: 'Los Angeles', miles: 964, base: 2800 },
    
    // Из Jacksonville
    { from: 'Jacksonville', to: 'Miami', miles: 345, base: 1000 },
    { from: 'Jacksonville', to: 'Atlanta', miles: 346, base: 1000 },
    
    // Из Salt Lake City
    { from: 'Salt Lake City', to: 'Denver', miles: 525, base: 1500 },
    { from: 'Salt Lake City', to: 'Los Angeles', miles: 689, base: 2000 },
  ];

  const commodities = [
    'Медицинское оборудование', 'Электроника', 'Продукты питания',
    'Автозапчасти', 'Строительные материалы', 'Одежда', 'Химикаты',
    'Мебель', 'Промышленное оборудование', 'Фармацевтика',
    'Бытовая техника', 'Косметика', 'Игрушки', 'Книги', 'Спортивные товары',
  ];

  const equipment: Array<'Dry Van' | 'Reefer' | 'Flatbed'> = ['Dry Van', 'Dry Van', 'Dry Van', 'Reefer', 'Flatbed'];

  // Генерируем 20-25 грузов случайным образом
  const numLoads = 20 + Math.floor(Math.random() * 6);
  const loads: LoadOffer[] = [];
  
  for (let i = 0; i < numLoads; i++) {
    const route = routes[Math.floor(Math.random() * routes.length)];
    const eq = equipment[Math.floor(Math.random() * equipment.length)];
    const market = route.base + Math.floor(Math.random() * 400 - 200);
    const posted = Math.floor(market * (0.75 + Math.random() * 0.1)); // брокер занижает на 15-25%
    const min = Math.floor(market * 0.85);
    
    loads.push({
      id: `L${minute}-${i}-${Math.random().toString(36).substr(2, 9)}`,
      brokerId: INITIAL_BROKERS[i % INITIAL_BROKERS.length].id,
      brokerName: INITIAL_BROKERS[i % INITIAL_BROKERS.length].name,
      brokerCompany: INITIAL_BROKERS[i % INITIAL_BROKERS.length].company,
      fromCity: route.from,
      toCity: route.to,
      commodity: commodities[Math.floor(Math.random() * commodities.length)],
      weight: 35000 + Math.floor(Math.random() * 10000),
      equipment: eq,
      postedRate: posted,
      marketRate: market,
      minRate: min,
      miles: route.miles,
      pickupTime: '08:00 AM',
      deliveryTime: 'Tomorrow 14:00',
      expiresAt: minute + 60 + Math.floor(Math.random() * 120),
      isUrgent: Math.random() > 0.85,
    });
  }
  
  return loads;
}

// ─── STORE ───────────────────────────────────────────────────────────────────

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'menu',
  day: 1,
  gameMinute: 0,
  balance: 0,
  totalEarned: 0,
  totalLost: 0,
  financeLog: [],
  reputation: 100,
  trucks: INITIAL_TRUCKS,
  availableLoads: [],
  activeLoads: [],
  bookedLoads: [],
  brokers: INITIAL_BROKERS,
  activeEvents: [],
  resolvedEvents: [],
  negotiation: { open: false, load: null, currentOffer: 0, round: 0, brokerMood: 'neutral' },
  selectedTruckId: null,
  selectedEventId: null,
  selectedLoadId: null,
  notifications: [],
  unreadCount: 0,
  pendingEmailResponses: [],

  startShift: async () => {
    console.log('🎮 Starting shift initialization...');
    
    // Проверяем есть ли сохранение
    const hasSave = get().loadGame();
    if (hasSave) {
      console.log('✅ Loaded saved game');
      return; // Если загрузили сохранение - не инициализируем заново
    }
    
    // Загружаем маршруты для траков которые в пути
    const trucksWithRoutes = await Promise.all(INITIAL_TRUCKS.map(async (truck) => {
      // Если трак едет - загружаем маршрут
      if ((truck.status === 'driving' || truck.status === 'loaded') && truck.destinationCity) {
        const to = CITIES[truck.destinationCity];
        if (to) {
          try {
            const url = `https://router.project-osrm.org/route/v1/driving/${truck.position[0]},${truck.position[1]};${to[0]},${to[1]}?overview=full&geometries=geojson`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.routes && data.routes[0]) {
              const routePath = data.routes[0].geometry.coordinates;
              console.log(`✅ Loaded route for ${truck.id}: ${routePath.length} points`);
              // Вычисляем реальную позицию по progress
              const totalPoints = routePath.length;
              const pointIndex = Math.floor(truck.progress * (totalPoints - 1));
              const nextIndex = Math.min(pointIndex + 1, totalPoints - 1);
              const segmentProgress = (truck.progress * (totalPoints - 1)) - pointIndex;
              const p1 = routePath[pointIndex];
              const p2 = routePath[nextIndex];
              const position: [number, number] = [
                p1[0] + (p2[0] - p1[0]) * segmentProgress,
                p1[1] + (p2[1] - p1[1]) * segmentProgress,
              ];
              return { ...truck, routePath, position };
            }
          } catch (err) {
            console.warn(`Failed to load route for ${truck.id}`);
          }
        }
      }
      return { ...truck, routePath: null };
    }));

    console.log('✅ All trucks initialized, starting game...');

    // Начальные email-уведомления от брокеров
    const initialEmails: Notification[] = [
      // ═══ ПРОШЛЫЕ ГРУЗЫ - ЗАВЕРШЁННЫЕ ═══
      
      // Email 1: Подтверждение Rate Con от Tom (INIT-L1 - Chicago → Houston)
      {
        id: 'email-init-1',
        type: 'rate_con',
        from: 'Tom - FastFreight LLC',
        subject: 'Rate Confirmation #CHI-HOU-2847',
        message: 'Hi there!\n\nRate Con attached for your load from Chicago to Houston. Electronics, 42k lbs.\n\nPick up: Yesterday 14:00\nDelivery: Tomorrow 08:00\nRate: $2,700\n\nDriver should be on the way. Let me know when delivered!\n\nTom',
        minute: -480, // вчера утром
        read: false,
        priority: 'medium',
        actionRequired: false,
        relatedLoadId: 'INIT-L1',
      },
      
      // Email 2: Подтверждение от Sarah (INIT-L2 - LA → Dallas)
      {
        id: 'email-init-2',
        type: 'email',
        from: 'Sarah - QuickLoad Inc',
        subject: 'Re: LA-Dallas Auto Parts Load',
        message: 'Perfect! Confirmed at $3,200.\n\nPU: 2 days ago 10:00 AM - Los Angeles\nDEL: Day after tomorrow 06:00 AM - Dallas\n\nAuto parts, 38k lbs, Dry Van. Shipper info in Rate Con.\n\nThanks for working with us!\nSarah',
        minute: -1200, // 2 дня назад
        read: true,
        priority: 'low',
        actionRequired: false,
        relatedLoadId: 'INIT-L2',
      },
      
      // Email 3: Urgent от Mike про медоборудование (INIT-L3 - NY → Atlanta)
      {
        id: 'email-init-3',
        type: 'pod_ready',
        from: 'Mike - EastFreight Co',
        subject: 'URGENT: POD needed for NY-ATL medical equipment',
        message: 'Hey,\n\nYour driver should be unloading in Atlanta right now. I need the POD ASAP - customer is asking.\n\nLoad #NY-ATL-1847\nMedical equipment, delivered today 08:00\n\nCan you send POD within the hour?\n\nMike',
        minute: -30, // 30 минут назад
        read: false,
        priority: 'high',
        actionRequired: true,
        relatedLoadId: 'INIT-L3',
      },
      
      // Email 4: Благодарность от Lisa (INIT-L4 - Portland → Seattle)
      {
        id: 'email-init-4',
        type: 'email',
        from: 'Lisa - PrimeHaul',
        subject: 'Thanks for the quick turnaround!',
        message: 'Hi!\n\nJust wanted to say thanks for taking that Portland-Seattle reefer load on short notice. $800 for 175 miles - good rate for both of us.\n\nDriver should be delivering soon. Send POD when ready.\n\nLooking forward to more loads together!\nLisa',
        minute: -120, // 2 часа назад
        read: true,
        priority: 'low',
        actionRequired: false,
        relatedLoadId: 'INIT-L4',
      },
      
      // Email 5: Вопрос от Dave про detention (INIT-L5 - Salt Lake → Denver)
      {
        id: 'email-init-5',
        type: 'detention',
        from: 'Dave - CrossCountry',
        subject: 'Re: Detention claim SLC-DEN',
        message: 'Hey,\n\nI saw your driver was delayed at pickup yesterday. How long was the wait? If it was over 2 hours, send me the detention request and I\'ll get it approved.\n\nLoad is delivering today, right? Flatbed with construction materials.\n\nLet me know.\nDave',
        minute: -90, // 1.5 часа назад
        read: false,
        priority: 'medium',
        actionRequired: true,
        relatedLoadId: 'INIT-L5',
      },
      
      // ═══ ТЕКУЩИЕ АКТИВНЫЕ ГРУЗЫ ═══
      
      // Email 6: Напоминание от Tom про Miami delivery (INIT-L6)
      {
        id: 'email-init-6',
        type: 'email',
        from: 'Tom - FastFreight LLC',
        subject: 'Reminder: Miami delivery today 14:00',
        message: 'Good morning!\n\nJust a reminder - your reefer with pharmaceuticals needs to deliver in Miami today by 14:00.\n\nLoad #SAV-MIA-3921\nPicked up yesterday 20:00 from Savannah\nRate: $950\n\nReceiver is strict about temp - make sure driver checks reefer unit!\n\nTom',
        minute: -15, // 15 минут назад
        read: false,
        priority: 'medium',
        actionRequired: false,
        relatedLoadId: 'INIT-L6',
      },
      
      // ═══ НОВЫЕ ВОЗМОЖНОСТИ ═══
      
      // Email 7: Новый груз от Sarah
      {
        id: 'email-init-7',
        type: 'email',
        from: 'Sarah - QuickLoad Inc',
        subject: 'Hot load: Phoenix to Chicago - $4,200',
        message: 'Hey!\n\nGot a great load if you have a truck available:\n\nPhoenix, AZ → Chicago, IL\nDry Van, 44k lbs\nElectronics\n1,750 miles\nPick up: Today 16:00\nDeliver: Day after tomorrow 10:00\n\nPosting at $3,800 but I can do $4,200 for you. Let me know ASAP!\n\nSarah',
        minute: -45, // 45 минут назад
        read: false,
        priority: 'high',
        actionRequired: false,
      },
      
      // Email 8: Вопрос от нового брокера
      {
        id: 'email-init-8',
        type: 'email',
        from: 'Jennifer - NationWide Logistics',
        subject: 'New carrier setup - interested in working together?',
        message: 'Hi,\n\nI found your company on the load board. We\'re always looking for reliable carriers.\n\nDo you run Dry Vans? We have consistent freight in the Midwest and Southeast.\n\nWhat lanes do you prefer? What\'s your typical rate per mile?\n\nLooking forward to hearing from you!\n\nJennifer\nNationWide Logistics\n(555) 234-5678',
        minute: -180, // 3 часа назад
        read: true,
        priority: 'low',
        actionRequired: false,
      },
      
      // Email 9: Проблема с прошлым грузом
      {
        id: 'email-init-9',
        type: 'email',
        from: 'Robert - MegaFreight Corp',
        subject: 'Issue with last week\'s delivery',
        message: 'Hello,\n\nWe had a complaint from the receiver about the Dallas delivery last week. They said the driver arrived 3 hours late and didn\'t call ahead.\n\nCan you explain what happened? This affects our relationship with the customer.\n\nI need a response today.\n\nRobert',
        minute: -240, // 4 часа назад
        read: false,
        priority: 'critical',
        actionRequired: true,
      },
      
      // Email 10: Благодарность и новое предложение
      {
        id: 'email-init-10',
        type: 'email',
        from: 'Tom - FastFreight LLC',
        subject: 'Great job on recent loads + new opportunity',
        message: 'Hey!\n\nYou guys have been crushing it lately. Both Chicago and Miami loads went smooth.\n\nI have another one if you\'re interested:\n\nHouston → Atlanta\nDry Van, 40k lbs\nPackaged goods\n800 miles\nPick up: Tomorrow 08:00\nDeliver: Day after tomorrow 18:00\n\nCan offer $2,400. You in?\n\nTom',
        minute: -60, // 1 час назад
        read: false,
        priority: 'medium',
        actionRequired: false,
      },
      
      // Email 11: Rate Con request
      {
        id: 'email-init-11',
        type: 'rate_con',
        from: 'Mike - EastFreight Co',
        subject: 'Rate Con for Boston-Miami load',
        message: 'Hi,\n\nAttached is the Rate Con for the load we discussed:\n\nBoston, MA → Miami, FL\nDry Van, 38k lbs\nTextiles\n1,500 miles\nRate: $3,600\n\nPick up: Tomorrow 14:00\nDeliver: 3 days from now 10:00\n\nPlease sign and return. Also send me your insurance cert if I don\'t have it on file.\n\nMike',
        minute: -150, // 2.5 часа назад
        read: true,
        priority: 'medium',
        actionRequired: false,
      },
      
      // Email 12: Срочный запрос
      {
        id: 'email-init-12',
        type: 'email',
        from: 'Lisa - PrimeHaul',
        subject: 'URGENT: Need truck for Seattle pickup TODAY',
        message: 'URGENT!\n\nCustomer just called - their original carrier fell through.\n\nSeattle → Los Angeles\nReefer, 35k lbs\nFrozen food\n1,135 miles\nPick up: TODAY 18:00 (yes, tonight!)\nDeliver: Day after tomorrow 06:00\n\nWilling to pay $3,000 for the rush. Do you have a reefer available?\n\nNeed answer in next 30 minutes!\n\nLisa\n(555) 789-0123',
        minute: -20, // 20 минут назад
        read: false,
        priority: 'critical',
        actionRequired: true,
      },
      
      // ═══ ГОЛОСОВЫЕ СООБЩЕНИЯ ОТ ВОДИТЕЛЕЙ ═══
      
      // Voicemail 1: Mike (водитель) сообщает о задержке
      {
        id: 'voicemail-init-1',
        type: 'voicemail',
        from: 'Mike (водитель)',
        subject: 'Голосовое сообщение',
        message: 'Привет, я на погрузке. Говорят будет задержка 2 часа. Что делать?',
        minute: -10, // 10 минут назад
        read: false,
        priority: 'high',
        actionRequired: true,
        relatedTruckId: 'T3',
      },
    ];

    set({
      phase: 'playing',
      gameMinute: 0,
      balance: 0,
      totalEarned: 0,
      totalLost: 0,
      financeLog: [],
      reputation: 100,
      trucks: trucksWithRoutes,
      availableLoads: generateLoads(0),
      activeLoads: [INITIAL_LOAD_1, INITIAL_LOAD_2, INITIAL_LOAD_3, INITIAL_LOAD_4, INITIAL_LOAD_5, INITIAL_LOAD_6],
      bookedLoads: [],
      activeEvents: [],
      resolvedEvents: [],
      notifications: initialEmails,
      unreadCount: initialEmails.filter(e => !e.read).length,
      pendingEmailResponses: [],
    });
  },

  tickClock: async () => {
    const { gameMinute, trucks, availableLoads, activeLoads } = get();
    // Увеличиваем на 1 минуту за один тик (TIME_SCALE = 60 секунд)
    const newMinute = gameMinute + 1;

    if (newMinute >= SHIFT_DURATION) {
      get().endShift();
      return;
    }

    // Обновляем прогресс траков (скорость 180 миль/час = 3 мили/минуту)
    const updatedTrucks = await Promise.all(trucks.map(async (truck) => {
      // Если трак на разгрузке/погрузке и у него уже есть следующий груз - автоматически начинаем движение
      if ((truck.status === 'at_delivery' || truck.status === 'at_pickup') && truck.currentLoad) {
        // Проверяем что это pre-planned груз (phase должна быть 'to_pickup')
        if (truck.currentLoad.phase === 'to_pickup') {
          // Трак закончил разгрузку/погрузку - начинаем движение к следующему pickup
          const pickupCity = CITIES[truck.currentLoad.fromCity];
          let routePath: Array<[number, number]> | null = null;
          
          if (pickupCity) {
            try {
              const url = `https://router.project-osrm.org/route/v1/driving/${truck.position[0]},${truck.position[1]};${pickupCity[0]},${pickupCity[1]}?overview=full&geometries=geojson`;
              const res = await fetch(url);
              const data = await res.json();
              if (data.routes && data.routes[0]) {
                routePath = data.routes[0].geometry.coordinates;
                if (routePath) {
                  console.log(`✅ Pre-planned load activated for ${truck.id}: ${routePath.length} points`);
                }
              }
            } catch (err) {
              console.warn('Failed to load route for pre-planned load');
            }
          }
          
          // Уведомление о начале движения
          get().addNotification({
            type: 'email',
            priority: 'low',
            from: 'Система',
            subject: '🚛 Трак в пути',
            message: `${truck.name} закончил операцию и начал движение к ${truck.currentLoad.fromCity}`,
            actionRequired: false,
            relatedTruckId: truck.id,
          });
          
          return {
            ...truck,
            status: 'driving' as TruckStatus,
            destinationCity: truck.currentLoad.fromCity,
            progress: 0,
            routePath,
          };
        }
      }
      
      // Двигаем трак только если он реально едет с грузом
      if ((truck.status === 'driving' || truck.status === 'loaded') && truck.destinationCity) {
        // Ускоренная скорость для игры: 180 миль/час = 3 мили/минуту
        // Рассчитываем прогресс на основе реального расстояния
        const to = CITIES[truck.destinationCity];
        if (!to) return truck;

        // Получаем расстояние маршрута
        let totalMiles = 1000; // дефолт если не знаем
        if (truck.currentLoad) {
          totalMiles = truck.currentLoad.miles;
        } else {
          // Примерное расстояние между городами
          const from = CITIES[truck.currentCity] || truck.position;
          const dx = to[0] - from[0];
          const dy = to[1] - from[1];
          const degreeDistance = Math.sqrt(dx * dx + dy * dy);
          totalMiles = Math.round(degreeDistance * 69); // 1 градус ≈ 69 миль
        }

        // Реалистичная скорость: 180 миль/час (ускорено в 3 раза для игры)
        // За 1 минуту трак проезжает: 180 миль/час * 1 мин / 60 мин = 3 мили
        // Прогресс за один тик = 3 мили / totalMiles
        const progressPerTick = 3 / totalMiles;
        const newProgress = Math.min(1, truck.progress + progressPerTick);

        if (newProgress >= 1) {
          // Трак приехал в пункт назначения
          const newStatus = truck.status === 'driving' ? 'at_pickup' as TruckStatus : 'at_delivery' as TruckStatus;
          
          // Если приехал на pickup - нужно загрузить маршрут до delivery
          let nextRoutePath: Array<[number, number]> | null = null;
          if (newStatus === 'at_pickup' && truck.currentLoad) {
            const deliveryCity = CITIES[truck.currentLoad.toCity];
            if (deliveryCity) {
              try {
                const url = `https://router.project-osrm.org/route/v1/driving/${to[0]},${to[1]};${deliveryCity[0]},${deliveryCity[1]}?overview=full&geometries=geojson`;
                const res = await fetch(url);
                const data = await res.json();
                if (data.routes && data.routes[0]) {
                  nextRoutePath = data.routes[0].geometry.coordinates;
                  if (nextRoutePath) {
                    console.log(`✅ Loaded delivery route for ${truck.id}: ${nextRoutePath.length} points`);
                  }
                }
              } catch (err) {
                console.warn('Failed to load delivery route');
              }
            }
          }
          
          return {
            ...truck,
            progress: 1,
            status: newStatus,
            position: to,
            currentCity: truck.destinationCity,
            destinationCity: null,
            routePath: nextRoutePath, // Сохраняем следующий маршрут если есть
          };
        }
        
        // ВСЕГДА двигаемся по routePath если он есть
        if (truck.routePath && truck.routePath.length > 1) {
          const totalPoints = truck.routePath.length;
          const pointIndex = Math.floor(newProgress * (totalPoints - 1));
          const nextIndex = Math.min(pointIndex + 1, totalPoints - 1);
          const segmentProgress = (newProgress * (totalPoints - 1)) - pointIndex;
          
          const p1 = truck.routePath[pointIndex];
          const p2 = truck.routePath[nextIndex];
          const lng = p1[0] + (p2[0] - p1[0]) * segmentProgress;
          const lat = p1[1] + (p2[1] - p1[1]) * segmentProgress;
          
          return { ...truck, progress: newProgress, position: [lng, lat] as [number, number] };
        } else {
          // Если routePath нет - НЕ ДВИГАЕМ трак, ждём загрузки маршрута
          return truck;
        }
      }
      return truck;
    }));

    // Убираем истёкшие грузы
    const freshLoads = availableLoads.filter(l => l.expiresAt > newMinute);

    // Добавляем новые грузы каждые 10 минут
    const shouldAddLoads = newMinute % 10 === 0 && newMinute > 0;
    const newLoads = shouldAddLoads ? generateLoads(newMinute).slice(0, 5) : []; // добавляем 5 новых грузов

    // Генерация случайных уведомлений
    if (Math.random() < 0.02) { // 2% шанс каждую минуту
      const notifTypes = [
        {
          type: 'missed_call' as const,
          from: 'Tom (FastFreight)',
          subject: 'Пропущенный звонок',
          message: 'Брокер звонил 2 раза. Возможно есть срочный груз.',
          priority: 'medium' as const,
        },
        {
          type: 'email' as const,
          from: 'Sarah (QuickLoad)',
          subject: 'Rate Con готов',
          message: 'Rate Con на груз Chicago → Houston подписан. Проверь детали.',
          priority: 'low' as const,
        },
        {
          type: 'voicemail' as const,
          from: 'Mike (водитель)',
          subject: 'Голосовое сообщение',
          message: 'Привет, я на погрузке. Говорят будет задержка 2 часа. Что делать?',
          priority: 'high' as const,
          actionRequired: true,
        },
        {
          type: 'text' as const,
          from: 'Carlos (водитель)',
          subject: 'SMS',
          message: 'Разгрузился. Жду следующий груз. Где едем?',
          priority: 'medium' as const,
        },
        {
          type: 'detention' as const,
          from: 'Система',
          subject: 'Detention Alert',
          message: 'Unit 47 ждёт на погрузке уже 3 часа. Требуй оплату detention!',
          priority: 'critical' as const,
          actionRequired: true,
        },
        {
          type: 'pod_ready' as const,
          from: 'Система',
          subject: 'POD получен',
          message: 'Proof of Delivery для груза #L123 получен. Можно выставлять invoice.',
          priority: 'low' as const,
        },
      ];
      const randomNotif = notifTypes[Math.floor(Math.random() * notifTypes.length)];
      get().addNotification(randomNotif);
    }
    
    // Обработка отложенных email ответов
    const pendingResponses = get().pendingEmailResponses || [];
    const triggeredResponses = pendingResponses.filter(r => r.triggerAt <= newMinute);
    const remainingResponses = pendingResponses.filter(r => r.triggerAt > newMinute);
    
    // Отправляем ответы которые пришло время
    triggeredResponses.forEach(response => {
      let message = '';
      let priority: 'low' | 'medium' | 'high' | 'critical' = 'low';
      
      if (response.isDetention) {
        // Ответ на detention request
        const approved = Math.random() > 0.3; // 70% шанс одобрения
        if (approved) {
          const detentionPay = 50 + Math.floor(Math.random() * 100); // $50-$150
          message = `Detention approved! We'll add $${detentionPay} to your payment. Thanks for your patience.`;
          get().addMoney(detentionPay, 'Detention Payment');
          priority = 'medium';
        } else {
          message = 'Sorry, detention was not approved. Per our agreement, detention starts after 2 hours. Your driver arrived on time.';
          priority = 'low';
        }
      } else if (response.isPOD) {
        // Ответ на POD request
        message = 'POD received, thank you! Invoice will be processed within 24-48 hours. Payment on NET 30 terms.';
        priority = 'low';
      } else if (response.isRateCon) {
        // Ответ на Rate Con
        message = 'Rate Con signed and filed. Driver can proceed to pickup. Call if any issues!';
        priority = 'medium';
      } else if (response.isIssue) {
        // Ответ на issue/problem
        message = 'Thanks for letting me know. I\'ll look into this and get back to you ASAP. In the meantime, have your driver proceed as planned.';
        priority = 'medium';
      } else {
        // Обычный ответ
        const responses = [
          'Got it, thanks for the update!',
          'Received. Will process shortly.',
          'Thank you! Will handle this today.',
          'Confirmed. Driver can proceed.',
          'Approved. Will send updated documents.',
          'Perfect, thanks for staying on top of this!',
        ];
        message = responses[Math.floor(Math.random() * responses.length)];
        priority = 'low';
      }
      
      get().addNotification({
        type: 'email',
        priority,
        from: response.from,
        subject: response.subject,
        message,
        actionRequired: false,
      });
    });
    
    // Обновляем список отложенных ответов
    if (triggeredResponses.length > 0) {
      set({ pendingEmailResponses: remainingResponses });
    }

    set({
      gameMinute: newMinute,
      trucks: updatedTrucks,
      availableLoads: [...freshLoads, ...newLoads],
    });
    
    // Автосохранение каждые 5 минут
    if (newMinute % 5 === 0) {
      get().saveGame();
    }
  },

  openNegotiation: (load) => {
    set({
      negotiation: {
        open: true,
        load,
        currentOffer: load.postedRate,
        round: 0,
        brokerMood: 'neutral',
      },
    });
  },

  makeOffer: (amount) => {
    const { negotiation, brokers } = get();
    if (!negotiation.load) return 'rejected';

    const load = negotiation.load;
    const broker = brokers.find(b => b.id === load.brokerId);
    const relationship = broker?.relationship ?? 50;
    const round = negotiation.round + 1;

    // Брокер принимает если: сумма >= minRate + бонус за отношения
    const acceptThreshold = load.minRate - (relationship * 2);
    // Брокер злится если торгуемся слишком агрессивно
    const aggressionFactor = (amount - load.postedRate) / load.postedRate;

    let brokerMood: 'happy' | 'neutral' | 'annoyed' | 'angry' = 'neutral';
    if (aggressionFactor > 0.3) brokerMood = 'angry';
    else if (aggressionFactor > 0.15) brokerMood = 'annoyed';
    else if (aggressionFactor < 0.05) brokerMood = 'happy';

    if (amount >= acceptThreshold || round >= 3) {
      // Принято
      const agreedRate = Math.min(amount, load.marketRate + 100);
      const activeLoad: ActiveLoad = {
        ...load,
        agreedRate,
        truckId: '',
        phase: 'to_pickup',
        detentionMinutes: 0,
        detentionPaid: false,
      };
      
      // Добавляем груз в bookedLoads
      set({
        negotiation: { open: false, load: null, currentOffer: 0, round: 0, brokerMood: 'neutral' },
        availableLoads: get().availableLoads.filter(l => l.id !== load.id),
        bookedLoads: [...get().bookedLoads, activeLoad], // Добавляем забуканный груз
      });
      
      // Обновляем отношения с брокером
      const updatedBrokers = get().brokers.map(b =>
        b.id === load.brokerId ? { ...b, relationship: Math.min(100, b.relationship + 3), loadsCompleted: b.loadsCompleted + 1 } : b
      );
      set({ brokers: updatedBrokers });
      
      return 'accepted';
    } else {
      // Контр-оффер
      const counter = Math.floor(load.postedRate + (amount - load.postedRate) * 0.4);
      set({
        negotiation: {
          ...negotiation,
          currentOffer: counter,
          round,
          brokerMood,
        },
      });
      return 'counter';
    }
  },

  closeNegotiation: () => {
    set({ negotiation: { open: false, load: null, currentOffer: 0, round: 0, brokerMood: 'neutral' } });
  },

  bookLoad: (load) => {
    set({ bookedLoads: [...get().bookedLoads, load] });
  },

  assignLoadToTruck: async (load, truckId) => {
    const truck = get().trucks.find(t => t.id === truckId);
    if (!truck) return;

    // Если трак на разгрузке или погрузке - груз будет назначен как "следующий"
    // Трак автоматически начнёт движение когда закончит текущую операцию
    const isPrePlanning = truck.status === 'at_delivery' || truck.status === 'at_pickup';

    // Snap текущую позицию трака к дороге
    let snappedPosition = truck.position;
    try {
      const url = `https://router.project-osrm.org/nearest/v1/driving/${truck.position[0]},${truck.position[1]}?number=1`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.waypoints && data.waypoints[0]) {
        snappedPosition = data.waypoints[0].location as [number, number];
      }
    } catch (err) {
      console.warn('Failed to snap truck to road');
    }

    // Загружаем маршрут до pickup
    const pickupCity = CITIES[load.fromCity];
    let routePath: Array<[number, number]> | null = null;
    if (pickupCity && !isPrePlanning) {
      // Загружаем маршрут только если трак свободен (не pre-planning)
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${snappedPosition[0]},${snappedPosition[1]};${pickupCity[0]},${pickupCity[1]}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes && data.routes[0]) {
          routePath = data.routes[0].geometry.coordinates;
          if (routePath) {
            console.log(`✅ Loaded route for ${truckId} to pickup: ${routePath.length} points`);
          }
        }
      } catch (err) {
        console.warn('Failed to load route to pickup');
      }
    }

    const activeLoad = { ...load, truckId };
    
    if (isPrePlanning) {
      // Pre-planning: груз назначен но трак ещё не начал движение
      // Добавляем уведомление
      get().addNotification({
        type: 'email',
        priority: 'medium',
        from: 'Система',
        subject: '✓ Груз запланирован',
        message: `${truck.name} начнёт движение к ${load.fromCity} после завершения текущей операции`,
        actionRequired: false,
        relatedTruckId: truckId,
        relatedLoadId: load.id,
      });
      
      // Трак остаётся в текущем статусе, но груз уже назначен
      const updatedTrucks = get().trucks.map(t =>
        t.id === truckId ? {
          ...t,
          currentLoad: activeLoad, // Назначаем груз
          // Статус и позиция не меняются - трак продолжает текущую операцию
        } : t
      );
      
      const bookedLoads = get().bookedLoads.filter(l => l.id !== load.id);
      set({
        trucks: updatedTrucks,
        activeLoads: [...get().activeLoads, activeLoad],
        bookedLoads,
      });
    } else {
      // Обычное назначение - трак свободен и сразу начинает движение
      const updatedTrucks = get().trucks.map(t =>
        t.id === truckId ? {
          ...t,
          status: 'driving' as TruckStatus,
          destinationCity: load.fromCity,
          progress: 0,
          currentLoad: activeLoad,
          position: snappedPosition,
          routePath,
        } : t
      );
      
      const bookedLoads = get().bookedLoads.filter(l => l.id !== load.id);
      set({
        trucks: updatedTrucks,
        activeLoads: [...get().activeLoads, activeLoad],
        bookedLoads,
      });
    }
  },

  cancelLoad: (loadId, params) => {
    const load = get().activeLoads.find(l => l.id === loadId) || get().bookedLoads.find(l => l.id === loadId);
    if (!load) return;

    const broker = get().brokers.find(b => b.name === load.brokerName);
    
    // Снимаем TONU fee
    get().removeMoney(params.tonuFee, `TONU Fee - ${load.fromCity} → ${load.toCity}`);
    
    // Обновляем репутацию с брокером
    if (broker) {
      const updatedBrokers = get().brokers.map(b =>
        b.id === broker.id
          ? { ...b, relationship: Math.max(0, Math.min(100, b.relationship + params.reputationHit)) }
          : b
      );
      set({ brokers: updatedBrokers });
    }
    
    // Освобождаем трак если был назначен
    if (load.truckId) {
      const updatedTrucks = get().trucks.map(t =>
        t.id === load.truckId ? {
          ...t,
          status: 'idle' as TruckStatus,
          destinationCity: null,
          progress: 0,
          currentLoad: null,
          routePath: null,
        } : t
      );
      set({ trucks: updatedTrucks });
    }
    
    // Удаляем груз из списков
    set({
      activeLoads: get().activeLoads.filter(l => l.id !== loadId),
      bookedLoads: get().bookedLoads.filter(l => l.id !== loadId),
    });
    
    // Добавляем уведомление
    get().addNotification({
      type: 'urgent',
      priority: 'high',
      from: load.brokerName,
      subject: 'Груз отменён',
      message: `Груз ${load.fromCity} → ${load.toCity} отменён. TONU Fee: $${params.tonuFee}. Репутация: ${params.reputationHit}`,
      actionRequired: false,
    });
  },

  resolveEvent: (eventId, optionId) => {
    const event = get().activeEvents.find(e => e.id === eventId);
    if (!event) return;
    const option = event.options.find(o => o.id === optionId);
    if (!option) return;

    const { outcome } = option;
    if (outcome.moneyDelta > 0) get().addMoney(outcome.moneyDelta, outcome.description);
    if (outcome.moneyDelta < 0) get().removeMoney(Math.abs(outcome.moneyDelta), outcome.description);

    const updatedBrokers = get().brokers.map(b =>
      b.id === outcome.brokerId
        ? { ...b, relationship: Math.max(0, Math.min(100, b.relationship + outcome.relationshipDelta)) }
        : b
    );

    set({
      reputation: Math.max(0, Math.min(100, get().reputation + outcome.reputationDelta)),
      brokers: updatedBrokers,
      activeEvents: get().activeEvents.filter(e => e.id !== eventId),
      resolvedEvents: [...get().resolvedEvents, { ...event, resolved: true }],
      selectedEventId: null,
    });
  },

  addEvent: (event) => {
    set({ activeEvents: [...get().activeEvents, event] });
  },

  addMoney: (amount, description) => {
    set({
      balance: get().balance + amount,
      totalEarned: get().totalEarned + amount,
      financeLog: [...get().financeLog, { type: 'income', amount, description, minute: get().gameMinute }],
    });
  },

  removeMoney: (amount, description) => {
    set({
      balance: get().balance - amount,
      totalLost: get().totalLost + amount,
      financeLog: [...get().financeLog, { type: 'expense', amount, description, minute: get().gameMinute }],
    });
  },

  selectTruck: (id) => set({ selectedTruckId: id }),
  selectEvent: (id) => set({ selectedEventId: id }),
  selectLoad: (id) => set({ selectedLoadId: id }),

  updateTruckRoute: (truckId, routePath) => {
    set({
      trucks: get().trucks.map(t =>
        t.id === truckId ? { ...t, routePath } : t
      ),
    });
  },

  refreshLoadBoard: () => {
    set({ availableLoads: generateLoads(get().gameMinute) });
  },

  endShift: () => {
    set({ phase: 'shift_end' });
  },

  saveGame: () => {
    try {
      const state = get();
      const saveData = {
        phase: state.phase,
        day: state.day,
        gameMinute: state.gameMinute,
        balance: state.balance,
        totalEarned: state.totalEarned,
        totalLost: state.totalLost,
        financeLog: state.financeLog,
        reputation: state.reputation,
        trucks: state.trucks,
        availableLoads: state.availableLoads,
        activeLoads: state.activeLoads,
        bookedLoads: state.bookedLoads,
        brokers: state.brokers,
        activeEvents: state.activeEvents,
        resolvedEvents: state.resolvedEvents,
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        pendingEmailResponses: state.pendingEmailResponses,
        savedAt: Date.now(),
      };
      localStorage.setItem('dispatcher-game-save', JSON.stringify(saveData));
      console.log('✅ Game saved');
    } catch (error) {
      console.error('❌ Failed to save game:', error);
    }
  },

  loadGame: () => {
    try {
      const saved = localStorage.getItem('dispatcher-game-save');
      if (!saved) return false;
      
      const saveData = JSON.parse(saved);
      set({
        phase: saveData.phase,
        day: saveData.day,
        gameMinute: saveData.gameMinute,
        balance: saveData.balance,
        totalEarned: saveData.totalEarned,
        totalLost: saveData.totalLost,
        financeLog: saveData.financeLog,
        reputation: saveData.reputation,
        trucks: saveData.trucks,
        availableLoads: saveData.availableLoads.length > 0 ? saveData.availableLoads : generateLoads(saveData.gameMinute),
        activeLoads: saveData.activeLoads,
        bookedLoads: saveData.bookedLoads,
        brokers: saveData.brokers,
        activeEvents: saveData.activeEvents,
        resolvedEvents: saveData.resolvedEvents,
        notifications: saveData.notifications,
        unreadCount: saveData.unreadCount,
        pendingEmailResponses: saveData.pendingEmailResponses || [],
      });
      console.log('✅ Game loaded');
      return true;
    } catch (error) {
      console.error('❌ Failed to load game:', error);
      return false;
    }
  },

  clearSave: () => {
    try {
      localStorage.removeItem('dispatcher-game-save');
      console.log('✅ Save cleared');
    } catch (error) {
      console.error('❌ Failed to clear save:', error);
    }
  },

  addNotification: (notification) => {
    const newNotif: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random()}`,
      minute: get().gameMinute,
      read: false,
    };
    set({
      notifications: [newNotif, ...get().notifications],
      unreadCount: get().unreadCount + 1,
    });
  },

  markNotificationRead: (id) => {
    const notifications = get().notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    const unreadCount = notifications.filter(n => !n.read).length;
    set({ notifications, unreadCount });
  },

  markAllNotificationsRead: () => {
    set({
      notifications: get().notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    });
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },

  sendEmail: (params: { to: string; subject: string; body: string; isReply: boolean; replyToId?: string }) => {
    const { to, subject, body, isReply, replyToId } = params;
    
    console.log(`📧 Email sent to ${to}: ${subject}`);
    
    // Если это ответ на уведомление - отмечаем исходное уведомление как прочитанное
    if (replyToId) {
      get().markNotificationRead(replyToId);
    }
    
    // Определяем тип запроса по теме письма
    const isDetentionRequest = subject.toLowerCase().includes('detention');
    const isPODRequest = subject.toLowerCase().includes('pod');
    const isRateConRequest = subject.toLowerCase().includes('rate con');
    const isIssueReport = subject.toLowerCase().includes('issue') || subject.toLowerCase().includes('problem');
    
    // Добавляем уведомление об отправке
    get().addNotification({
      type: 'email',
      priority: 'low',
      from: 'Система',
      subject: '✓ Письмо отправлено',
      message: `Ваше письмо "${subject}" отправлено ${to}`,
      actionRequired: false,
    });
    
    // Планируем ответ брокера через игровое время (2-5 минут)
    const responseTime = get().gameMinute + Math.floor(Math.random() * 3) + 2;
    
    // Создаём отложенный ответ
    const pendingResponse: PendingEmailResponse = {
      triggerAt: responseTime,
      from: to,
      subject: isReply ? subject : `Re: ${subject}`,
      isDetention: isDetentionRequest,
      isPOD: isPODRequest,
      isRateCon: isRateConRequest,
      isIssue: isIssueReport,
    };
    
    // Добавляем в список отложенных ответов
    set({ 
      pendingEmailResponses: [...get().pendingEmailResponses, pendingResponse] 
    });
  },
}));

// Форматирование игрового времени
export function formatGameTime(minute: number): string {
  // Округляем до целых минут для отображения
  const roundedMinute = Math.round(minute);
  const totalMinutes = SHIFT_START_HOUR * 60 + SHIFT_START_MINUTE + roundedMinute;
  const hours = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h}:${mins.toString().padStart(2, '0')} ${ampm}`;
}

// Новая функция: Форматирование времени в двух форматах
export function formatTimeDual(minute: number): string {
  const roundedMinute = Math.round(minute);
  const totalMinutes = SHIFT_START_HOUR * 60 + SHIFT_START_MINUTE + roundedMinute;
  const hours = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  const h24 = hours.toString().padStart(2, '0');
  const m = mins.toString().padStart(2, '0');
  
  // Формат: 14:00 (2 PM)
  return `${h24}:${m} (${h12}:${m} ${ampm})`;
}

// Форматирование времени с датой (для pickup/delivery)
export function formatTimeWithDate(timeString: string): string {
  // Входные форматы: "08:00 AM", "Tomorrow 14:00", "Yesterday 10:00"
  
  // Если уже есть день недели/дата
  if (timeString.includes('Tomorrow') || timeString.includes('Today') || timeString.includes('Yesterday')) {
    const parts = timeString.split(' ');
    const day = parts[0]; // Tomorrow, Today, Yesterday
    const time = parts[1]; // 14:00 или 14:00:00
    
    // Парсим время
    const [hoursStr, minsStr] = time.split(':');
    const hours = parseInt(hoursStr);
    const mins = parseInt(minsStr || '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    const h24 = hours.toString().padStart(2, '0');
    const m = mins.toString().padStart(2, '0');
    
    // Переводим день
    const dayRu = day === 'Tomorrow' ? 'Завтра' : day === 'Today' ? 'Сегодня' : 'Вчера';
    
    // Формат: Завтра 14:00 (2 PM)
    return `${dayRu} ${h24}:${m} (${h12}:${m} ${ampm})`;
  }
  
  // Если просто время "08:00 AM"
  const match = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (match) {
    let hours = parseInt(match[1]);
    const mins = parseInt(match[2]);
    const ampm = match[3].toUpperCase();
    
    // Конвертируем в 24-часовой формат
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    
    const h24 = hours.toString().padStart(2, '0');
    const m = mins.toString().padStart(2, '0');
    const h12 = (hours % 12 || 12).toString();
    
    // Формат: 08:00 (8 AM)
    return `${h24}:${m} (${h12}:${m} ${ampm})`;
  }
  
  // Если не распознали - возвращаем как есть
  return timeString;
}
