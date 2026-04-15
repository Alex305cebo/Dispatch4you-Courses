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

export interface NotificationReply {
  from: string;
  message: string;
  minute: number;
  isMe?: boolean;
}

export interface Notification {
  id: string;
  type: 'missed_call' | 'email' | 'voicemail' | 'text' | 'urgent' | 'detention' | 'pod_ready' | 'rate_con';
  from: string;
  subject: string;
  message: string;
  minute: number;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionRequired?: boolean;
  relatedTruckId?: string;
  relatedLoadId?: string;
  // Thread support
  threadId?: string; // группировка по отправителю+теме
  replies?: NotificationReply[]; // история переписки
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
  gameMinute: number; // 0 = 08:43
  sessionName: string;

  // Финансы
  balance: number;
  totalEarned: number;
  totalLost: number;
  financeLog: FinanceEntry[];
  score: number; // очки за смену

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
  selectedLoadId: string | null;
  loadBoardSearchFrom: string;

  // ─── ACTIONS ───

  startShift: (truckCount?: number, sessionName?: string) => void;
  tickClock: () => void;
  triggerRandomEvent: () => void;

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
  setLoadBoardSearch: (city: string) => void;
  
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
  {
    id: 'T1',
    name: 'Truck 1047',
    driver: 'John Martinez',
    status: 'idle',
    position: CITIES['Nashville'],
    currentCity: 'Nashville',
    destinationCity: null,
    progress: 0,
    currentLoad: null,
    hoursLeft: 11,
    mood: 90,
    routePath: null,
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
    status: 'idle',
    position: CITIES['Nashville'],
    currentCity: 'Nashville',
    destinationCity: null,
    progress: 0,
    currentLoad: null,
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
  {
    id: 'T3',
    name: 'Truck 3012',
    driver: 'Mike Chen',
    status: 'idle',
    position: CITIES['Nashville'],
    currentCity: 'Nashville',
    destinationCity: null,
    progress: 0,
    currentLoad: null,
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
    status: 'idle',
    position: CITIES['Nashville'],
    currentCity: 'Nashville',
    destinationCity: null,
    progress: 0,
    currentLoad: null,
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
    status: 'idle',
    position: CITIES['Nashville'],
    currentCity: 'Nashville',
    destinationCity: null,
    progress: 0,
    currentLoad: null,
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
  {
    id: 'T6',
    name: 'Truck 6078',
    driver: 'David Martinez',
    status: 'idle',
    position: CITIES['Nashville'],
    currentCity: 'Nashville',
    destinationCity: null,
    progress: 0,
    currentLoad: null,
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
  {
    id: 'T7',
    name: 'Truck 7089',
    driver: 'James Anderson',
    status: 'idle',
    position: CITIES['Nashville'],
    currentCity: 'Nashville',
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
    position: CITIES['Nashville'],
    currentCity: 'Nashville',
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
    position: CITIES['Nashville'],
    currentCity: 'Nashville',
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

    // Nashville (стартовый город) → все направления
    { from: 'Nashville', to: 'Atlanta', miles: 250, base: 800 },
    { from: 'Nashville', to: 'Chicago', miles: 476, base: 1500 },
    { from: 'Nashville', to: 'Dallas', miles: 663, base: 2000 },
    { from: 'Nashville', to: 'Charlotte', miles: 409, base: 1300 },
    { from: 'Nashville', to: 'Indianapolis', miles: 286, base: 900 },
    { from: 'Nashville', to: 'Louisville', miles: 175, base: 600 },
    { from: 'Nashville', to: 'Memphis', miles: 210, base: 700 },
    { from: 'Nashville', to: 'Birmingham', miles: 191, base: 650 },
    { from: 'Nashville', to: 'Knoxville', miles: 180, base: 600 },
    { from: 'Nashville', to: 'St. Louis', miles: 309, base: 1000 },
    { from: 'Nashville', to: 'Cincinnati', miles: 270, base: 900 },
    { from: 'Nashville', to: 'Columbus', miles: 330, base: 1050 },
    { from: 'Nashville', to: 'New York', miles: 900, base: 2700 },
    { from: 'Nashville', to: 'Miami', miles: 1000, base: 2900 },
    { from: 'Nashville', to: 'Houston', miles: 790, base: 2300 },
    { from: 'Nashville', to: 'Kansas City', miles: 550, base: 1700 },
    { from: 'Nashville', to: 'Denver', miles: 1200, base: 3400 },

    // Юго-восток
    { from: 'Atlanta', to: 'Charlotte', miles: 245, base: 800 },
    { from: 'Atlanta', to: 'Birmingham', miles: 147, base: 500 },
    { from: 'Atlanta', to: 'Savannah', miles: 250, base: 800 },
    { from: 'Atlanta', to: 'Jacksonville', miles: 346, base: 1100 },
    { from: 'Atlanta', to: 'Knoxville', miles: 180, base: 600 },
    { from: 'Atlanta', to: 'Chattanooga', miles: 118, base: 400 },
    { from: 'Charlotte', to: 'Raleigh', miles: 170, base: 580 },
    { from: 'Charlotte', to: 'Richmond', miles: 334, base: 1050 },
    { from: 'Charlotte', to: 'Washington DC', miles: 390, base: 1200 },
    { from: 'Raleigh', to: 'New York', miles: 530, base: 1650 },
    { from: 'Raleigh', to: 'Atlanta', miles: 420, base: 1300 },
    { from: 'Savannah', to: 'Miami', miles: 660, base: 2000 },
    { from: 'Savannah', to: 'Charlotte', miles: 380, base: 1200 },
    { from: 'Jacksonville', to: 'Tampa', miles: 200, base: 680 },
    { from: 'Tampa', to: 'Miami', miles: 280, base: 900 },
    { from: 'Tampa', to: 'Atlanta', miles: 460, base: 1450 },
    { from: 'Orlando', to: 'Miami', miles: 235, base: 780 },
    { from: 'Orlando', to: 'Atlanta', miles: 440, base: 1380 },
    { from: 'Orlando', to: 'Charlotte', miles: 620, base: 1900 },
    { from: 'Fort Lauderdale', to: 'Atlanta', miles: 660, base: 2000 },
    { from: 'Pensacola', to: 'Atlanta', miles: 320, base: 1000 },
    { from: 'Pensacola', to: 'New Orleans', miles: 200, base: 680 },
    { from: 'Montgomery', to: 'Atlanta', miles: 160, base: 550 },
    { from: 'Montgomery', to: 'Nashville', miles: 290, base: 930 },
    { from: 'Gulfport', to: 'New Orleans', miles: 80, base: 300 },
    { from: 'Gulfport', to: 'Atlanta', miles: 380, base: 1200 },
    { from: 'Jackson', to: 'Memphis', miles: 210, base: 700 },
    { from: 'Jackson', to: 'New Orleans', miles: 185, base: 620 },
    { from: 'Jackson', to: 'Dallas', miles: 440, base: 1380 },

    // Северо-восток
    { from: 'New York', to: 'Boston', miles: 215, base: 720 },
    { from: 'New York', to: 'Philadelphia', miles: 95, base: 350 },
    { from: 'New York', to: 'Baltimore', miles: 190, base: 640 },
    { from: 'New York', to: 'Pittsburgh', miles: 370, base: 1150 },
    { from: 'New York', to: 'Buffalo', miles: 370, base: 1150 },
    { from: 'Boston', to: 'New York', miles: 215, base: 720 },
    { from: 'Boston', to: 'Philadelphia', miles: 300, base: 960 },
    { from: 'Boston', to: 'Providence', miles: 50, base: 200 },
    { from: 'Philadelphia', to: 'Baltimore', miles: 100, base: 360 },
    { from: 'Philadelphia', to: 'Pittsburgh', miles: 305, base: 970 },
    { from: 'Philadelphia', to: 'New York', miles: 95, base: 350 },
    { from: 'Baltimore', to: 'Pittsburgh', miles: 245, base: 800 },
    { from: 'Baltimore', to: 'Richmond', miles: 150, base: 520 },
    { from: 'Pittsburgh', to: 'Cleveland', miles: 130, base: 460 },
    { from: 'Pittsburgh', to: 'Columbus', miles: 185, base: 620 },
    { from: 'Pittsburgh', to: 'Detroit', miles: 290, base: 930 },
    { from: 'Buffalo', to: 'Cleveland', miles: 185, base: 620 },
    { from: 'Buffalo', to: 'Detroit', miles: 290, base: 930 },
    { from: 'Albany', to: 'Boston', miles: 170, base: 580 },
    { from: 'Albany', to: 'New York', miles: 150, base: 520 },
    { from: 'Newark', to: 'Philadelphia', miles: 90, base: 330 },
    { from: 'Trenton', to: 'Philadelphia', miles: 35, base: 160 },
    { from: 'Richmond', to: 'Charlotte', miles: 334, base: 1050 },
    { from: 'Richmond', to: 'Washington DC', miles: 110, base: 390 },
    { from: 'Norfolk', to: 'Richmond', miles: 95, base: 350 },
    { from: 'Norfolk', to: 'Charlotte', miles: 380, base: 1200 },
    { from: 'Virginia Beach', to: 'Richmond', miles: 100, base: 360 },
    { from: 'Roanoke', to: 'Charlotte', miles: 200, base: 670 },
    { from: 'Roanoke', to: 'Richmond', miles: 180, base: 610 },
    { from: 'Charleston WV', to: 'Pittsburgh', miles: 165, base: 560 },
    { from: 'Charleston WV', to: 'Columbus', miles: 165, base: 560 },
    { from: 'Huntington', to: 'Columbus', miles: 150, base: 520 },

    // Средний Запад
    { from: 'Chicago', to: 'Detroit', miles: 280, base: 900 },
    { from: 'Chicago', to: 'Indianapolis', miles: 180, base: 610 },
    { from: 'Chicago', to: 'Milwaukee', miles: 92, base: 340 },
    { from: 'Chicago', to: 'Minneapolis', miles: 410, base: 1280 },
    { from: 'Chicago', to: 'Kansas City', miles: 500, base: 1560 },
    { from: 'Chicago', to: 'Columbus', miles: 355, base: 1110 },
    { from: 'Chicago', to: 'Cleveland', miles: 345, base: 1080 },
    { from: 'Detroit', to: 'Cleveland', miles: 170, base: 580 },
    { from: 'Detroit', to: 'Columbus', miles: 200, base: 670 },
    { from: 'Detroit', to: 'Indianapolis', miles: 280, base: 900 },
    { from: 'Detroit', to: 'Grand Rapids', miles: 150, base: 520 },
    { from: 'Grand Rapids', to: 'Chicago', miles: 180, base: 610 },
    { from: 'Lansing', to: 'Detroit', miles: 90, base: 330 },
    { from: 'Cleveland', to: 'Columbus', miles: 145, base: 510 },
    { from: 'Cleveland', to: 'Cincinnati', miles: 245, base: 800 },
    { from: 'Columbus', to: 'Cincinnati', miles: 110, base: 390 },
    { from: 'Columbus', to: 'Indianapolis', miles: 175, base: 590 },
    { from: 'Cincinnati', to: 'Louisville', miles: 100, base: 360 },
    { from: 'Cincinnati', to: 'Indianapolis', miles: 110, base: 390 },
    { from: 'Indianapolis', to: 'Louisville', miles: 115, base: 410 },
    { from: 'Indianapolis', to: 'St. Louis', miles: 240, base: 790 },
    { from: 'Indianapolis', to: 'Kansas City', miles: 480, base: 1500 },
    { from: 'Louisville', to: 'Nashville', miles: 175, base: 600 },
    { from: 'Louisville', to: 'St. Louis', miles: 265, base: 860 },
    { from: 'St. Louis', to: 'Kansas City', miles: 250, base: 820 },
    { from: 'St. Louis', to: 'Memphis', miles: 285, base: 920 },
    { from: 'St. Louis', to: 'Chicago', miles: 300, base: 960 },
    { from: 'Kansas City', to: 'Omaha', miles: 185, base: 620 },
    { from: 'Kansas City', to: 'Wichita', miles: 200, base: 670 },
    { from: 'Kansas City', to: 'Des Moines', miles: 195, base: 650 },
    { from: 'Minneapolis', to: 'Chicago', miles: 410, base: 1280 },
    { from: 'Minneapolis', to: 'Omaha', miles: 370, base: 1160 },
    { from: 'Minneapolis', to: 'Fargo', miles: 235, base: 780 },
    { from: 'Minneapolis', to: 'Milwaukee', miles: 335, base: 1060 },
    { from: 'Milwaukee', to: 'Chicago', miles: 92, base: 340 },
    { from: 'Madison', to: 'Chicago', miles: 148, base: 520 },
    { from: 'Madison', to: 'Milwaukee', miles: 78, base: 290 },
    { from: 'Des Moines', to: 'Chicago', miles: 330, base: 1040 },
    { from: 'Des Moines', to: 'Omaha', miles: 135, base: 480 },
    { from: 'Cedar Rapids', to: 'Chicago', miles: 220, base: 740 },
    { from: 'Omaha', to: 'Kansas City', miles: 185, base: 620 },
    { from: 'Omaha', to: 'Denver', miles: 540, base: 1680 },
    { from: 'Lincoln', to: 'Omaha', miles: 55, base: 220 },
    { from: 'Sioux Falls', to: 'Minneapolis', miles: 245, base: 800 },
    { from: 'Sioux Falls', to: 'Omaha', miles: 360, base: 1130 },
    { from: 'Fargo', to: 'Minneapolis', miles: 235, base: 780 },
    { from: 'Bismarck', to: 'Fargo', miles: 195, base: 650 },
    { from: 'Duluth', to: 'Minneapolis', miles: 155, base: 540 },
    { from: 'Wichita', to: 'Oklahoma City', miles: 160, base: 550 },
    { from: 'Wichita', to: 'Kansas City', miles: 200, base: 670 },
    { from: 'Topeka', to: 'Kansas City', miles: 65, base: 250 },

    // Юг / Техас
    { from: 'Dallas', to: 'Houston', miles: 239, base: 800 },
    { from: 'Dallas', to: 'San Antonio', miles: 275, base: 890 },
    { from: 'Dallas', to: 'Austin', miles: 195, base: 660 },
    { from: 'Dallas', to: 'Fort Worth', miles: 35, base: 160 },
    { from: 'Dallas', to: 'Oklahoma City', miles: 205, base: 690 },
    { from: 'Dallas', to: 'Lubbock', miles: 320, base: 1020 },
    { from: 'Dallas', to: 'Amarillo', miles: 360, base: 1130 },
    { from: 'Houston', to: 'San Antonio', miles: 200, base: 670 },
    { from: 'Houston', to: 'Austin', miles: 165, base: 570 },
    { from: 'Houston', to: 'Baton Rouge', miles: 270, base: 880 },
    { from: 'Houston', to: 'New Orleans', miles: 350, base: 1100 },
    { from: 'Houston', to: 'Corpus Christi', miles: 210, base: 710 },
    { from: 'Houston', to: 'Laredo', miles: 340, base: 1070 },
    { from: 'San Antonio', to: 'Austin', miles: 80, base: 300 },
    { from: 'San Antonio', to: 'El Paso', miles: 550, base: 1710 },
    { from: 'San Antonio', to: 'Laredo', miles: 155, base: 540 },
    { from: 'Austin', to: 'Dallas', miles: 195, base: 660 },
    { from: 'Austin', to: 'Houston', miles: 165, base: 570 },
    { from: 'El Paso', to: 'Albuquerque', miles: 265, base: 860 },
    { from: 'El Paso', to: 'Phoenix', miles: 430, base: 1350 },
    { from: 'Amarillo', to: 'Albuquerque', miles: 290, base: 930 },
    { from: 'Amarillo', to: 'Oklahoma City', miles: 260, base: 850 },
    { from: 'Oklahoma City', to: 'Tulsa', miles: 100, base: 360 },
    { from: 'Oklahoma City', to: 'Dallas', miles: 205, base: 690 },
    { from: 'Oklahoma City', to: 'Kansas City', miles: 340, base: 1070 },
    { from: 'Tulsa', to: 'Kansas City', miles: 250, base: 820 },
    { from: 'Tulsa', to: 'Dallas', miles: 260, base: 850 },
    { from: 'Little Rock', to: 'Memphis', miles: 137, base: 480 },
    { from: 'Little Rock', to: 'Dallas', miles: 320, base: 1020 },
    { from: 'Little Rock', to: 'Nashville', miles: 360, base: 1130 },
    { from: 'Shreveport', to: 'Dallas', miles: 190, base: 640 },
    { from: 'Shreveport', to: 'New Orleans', miles: 335, base: 1060 },
    { from: 'Lafayette', to: 'New Orleans', miles: 135, base: 480 },
    { from: 'Baton Rouge', to: 'New Orleans', miles: 80, base: 300 },
    { from: 'New Orleans', to: 'Houston', miles: 350, base: 1100 },
    { from: 'New Orleans', to: 'Atlanta', miles: 470, base: 1470 },

    // Запад
    { from: 'Los Angeles', to: 'San Francisco', miles: 380, base: 1190 },
    { from: 'Los Angeles', to: 'San Diego', miles: 120, base: 430 },
    { from: 'Los Angeles', to: 'Las Vegas', miles: 270, base: 880 },
    { from: 'Los Angeles', to: 'Sacramento', miles: 385, base: 1200 },
    { from: 'Los Angeles', to: 'Fresno', miles: 220, base: 740 },
    { from: 'San Francisco', to: 'Sacramento', miles: 90, base: 330 },
    { from: 'San Francisco', to: 'Portland', miles: 640, base: 1980 },
    { from: 'San Francisco', to: 'Seattle', miles: 810, base: 2480 },
    { from: 'San Francisco', to: 'Las Vegas', miles: 570, base: 1770 },
    { from: 'Sacramento', to: 'Portland', miles: 580, base: 1800 },
    { from: 'Sacramento', to: 'Reno', miles: 135, base: 480 },
    { from: 'San Diego', to: 'Phoenix', miles: 355, base: 1110 },
    { from: 'San Diego', to: 'Los Angeles', miles: 120, base: 430 },
    { from: 'Las Vegas', to: 'Phoenix', miles: 295, base: 950 },
    { from: 'Las Vegas', to: 'Salt Lake City', miles: 420, base: 1320 },
    { from: 'Las Vegas', to: 'Denver', miles: 750, base: 2300 },
    { from: 'Reno', to: 'Las Vegas', miles: 450, base: 1410 },
    { from: 'Reno', to: 'Sacramento', miles: 135, base: 480 },
    { from: 'Phoenix', to: 'Tucson', miles: 115, base: 410 },
    { from: 'Phoenix', to: 'Albuquerque', miles: 465, base: 1450 },
    { from: 'Tucson', to: 'El Paso', miles: 265, base: 860 },
    { from: 'Tucson', to: 'Phoenix', miles: 115, base: 410 },
    { from: 'Flagstaff', to: 'Phoenix', miles: 145, base: 510 },
    { from: 'Flagstaff', to: 'Albuquerque', miles: 325, base: 1030 },
    { from: 'Albuquerque', to: 'Denver', miles: 450, base: 1410 },
    { from: 'Albuquerque', to: 'Oklahoma City', miles: 540, base: 1680 },
    { from: 'Santa Fe', to: 'Albuquerque', miles: 65, base: 250 },
    { from: 'Las Cruces', to: 'El Paso', miles: 45, base: 190 },
    { from: 'Salt Lake City', to: 'Boise', miles: 340, base: 1070 },
    { from: 'Salt Lake City', to: 'Las Vegas', miles: 420, base: 1320 },
    { from: 'Salt Lake City', to: 'Cheyenne', miles: 440, base: 1380 },
    { from: 'Provo', to: 'Salt Lake City', miles: 45, base: 190 },
    { from: 'Ogden', to: 'Salt Lake City', miles: 40, base: 170 },
    { from: 'Boise', to: 'Portland', miles: 430, base: 1350 },
    { from: 'Boise', to: 'Seattle', miles: 500, base: 1560 },
    { from: 'Pocatello', to: 'Boise', miles: 155, base: 540 },
    { from: 'Portland', to: 'Eugene', miles: 110, base: 390 },
    { from: 'Portland', to: 'Spokane', miles: 350, base: 1100 },
    { from: 'Eugene', to: 'Portland', miles: 110, base: 390 },
    { from: 'Salem', to: 'Portland', miles: 50, base: 200 },
    { from: 'Seattle', to: 'Spokane', miles: 280, base: 900 },
    { from: 'Seattle', to: 'Tacoma', miles: 35, base: 160 },
    { from: 'Seattle', to: 'Yakima', miles: 145, base: 510 },
    { from: 'Spokane', to: 'Boise', miles: 300, base: 960 },
    { from: 'Tacoma', to: 'Seattle', miles: 35, base: 160 },

    // Горный запад
    { from: 'Denver', to: 'Cheyenne', miles: 100, base: 360 },
    { from: 'Denver', to: 'Colorado Springs', miles: 70, base: 270 },
    { from: 'Denver', to: 'Albuquerque', miles: 450, base: 1410 },
    { from: 'Denver', to: 'Boise', miles: 830, base: 2540 },
    { from: 'Colorado Springs', to: 'Denver', miles: 70, base: 270 },
    { from: 'Pueblo', to: 'Denver', miles: 110, base: 390 },
    { from: 'Cheyenne', to: 'Denver', miles: 100, base: 360 },
    { from: 'Cheyenne', to: 'Salt Lake City', miles: 440, base: 1380 },
    { from: 'Casper', to: 'Cheyenne', miles: 180, base: 610 },
    { from: 'Billings', to: 'Denver', miles: 540, base: 1680 },
    { from: 'Billings', to: 'Boise', miles: 530, base: 1650 },
    { from: 'Great Falls', to: 'Billings', miles: 225, base: 750 },
    { from: 'Great Falls', to: 'Boise', miles: 490, base: 1530 },
    { from: 'Rapid City', to: 'Denver', miles: 390, base: 1220 },
    { from: 'Rapid City', to: 'Sioux Falls', miles: 350, base: 1100 },

    // Новая Англия
    { from: 'Boston', to: 'Providence', miles: 50, base: 200 },
    { from: 'Boston', to: 'Worcester', miles: 45, base: 190 },
    { from: 'Boston', to: 'Manchester', miles: 55, base: 220 },
    { from: 'Providence', to: 'Boston', miles: 50, base: 200 },
    { from: 'Hartford', to: 'New York', miles: 115, base: 410 },
    { from: 'Hartford', to: 'Boston', miles: 100, base: 360 },
    { from: 'Bridgeport', to: 'New York', miles: 60, base: 240 },
    { from: 'Manchester', to: 'Boston', miles: 55, base: 220 },
    { from: 'Burlington', to: 'Boston', miles: 220, base: 740 },
    { from: 'Albany', to: 'Buffalo', miles: 300, base: 960 },
    { from: 'Rochester NY', to: 'Buffalo', miles: 75, base: 280 },
    { from: 'Rochester NY', to: 'Syracuse', miles: 85, base: 310 },
    { from: 'Annapolis', to: 'Baltimore', miles: 30, base: 140 },
    { from: 'Wilmington', to: 'Philadelphia', miles: 30, base: 140 },
    { from: 'Allentown', to: 'Philadelphia', miles: 60, base: 240 },
    { from: 'Erie', to: 'Pittsburgh', miles: 130, base: 460 },
    { from: 'Erie', to: 'Cleveland', miles: 95, base: 350 },

    // Каролины
    { from: 'Columbia', to: 'Charlotte', miles: 95, base: 350 },
    { from: 'Columbia', to: 'Atlanta', miles: 215, base: 720 },
    { from: 'Charleston SC', to: 'Columbia', miles: 115, base: 410 },
    { from: 'Charleston SC', to: 'Savannah', miles: 105, base: 380 },
    { from: 'Greensboro', to: 'Charlotte', miles: 90, base: 330 },
    { from: 'Greensboro', to: 'Raleigh', miles: 80, base: 300 },

    // Кентукки / Теннесси
    { from: 'Lexington', to: 'Louisville', miles: 80, base: 300 },
    { from: 'Lexington', to: 'Cincinnati', miles: 85, base: 310 },
    { from: 'Lexington', to: 'Nashville', miles: 175, base: 590 },
    { from: 'Bowling Green', to: 'Nashville', miles: 65, base: 250 },
    { from: 'Bowling Green', to: 'Louisville', miles: 110, base: 390 },
    { from: 'Knoxville', to: 'Nashville', miles: 180, base: 610 },
    { from: 'Knoxville', to: 'Charlotte', miles: 185, base: 620 },
    { from: 'Chattanooga', to: 'Nashville', miles: 135, base: 480 },
    { from: 'Chattanooga', to: 'Atlanta', miles: 118, base: 420 },
    { from: 'Chattanooga', to: 'Birmingham', miles: 148, base: 520 },

    // Мичиган / Висконсин
    { from: 'Milwaukee', to: 'Minneapolis', miles: 335, base: 1060 },
    { from: 'Milwaukee', to: 'Detroit', miles: 330, base: 1040 },
    { from: 'Madison', to: 'Minneapolis', miles: 275, base: 890 },
    { from: 'Grand Rapids', to: 'Detroit', miles: 150, base: 520 },
    { from: 'Grand Rapids', to: 'Chicago', miles: 180, base: 610 },
  ];

  const commodities = [
    'Медицинское оборудование', 'Электроника', 'Продукты питания',
    'Автозапчасти', 'Строительные материалы', 'Одежда', 'Химикаты',
    'Мебель', 'Промышленное оборудование', 'Фармацевтика',
    'Бытовая техника', 'Косметика', 'Игрушки', 'Книги', 'Спортивные товары',
  ];

  const equipment: Array<'Dry Van' | 'Reefer' | 'Flatbed'> = ['Dry Van', 'Dry Van', 'Dry Van', 'Reefer', 'Flatbed'];

  // Генерируем 40-50 грузов случайным образом
  const numLoads = 40 + Math.floor(Math.random() * 11);
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
  score: 0,
  reputation: 100,
  sessionName: '',
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
  loadBoardSearchFrom: '',
  notifications: [],
  unreadCount: 0,
  pendingEmailResponses: [],

  startShift: async (truckCount: number = 3, sessionName: string = '') => {
    console.log(`🎮 Starting shift with ${truckCount} trucks, session: "${sessionName}"`);
    
    // Всегда сбрасываем старое сохранение и начинаем заново
    get().clearSave();
    
    // Все траки стартуют idle в Nashville TN — игрок сам находит грузы
    const allTrucks = INITIAL_TRUCKS.slice(0, truckCount).map((truck) => ({
      ...truck,
      status: 'idle' as TruckStatus,
      destinationCity: null,
      currentLoad: null,
      progress: 0,
      routePath: null,
    }));

    const selectedActiveLoads: any[] = [];
    
    // Маршруты не нужны — все idle
    const trucksWithRoutes = allTrucks;

    console.log('✅ All trucks initialized, starting game...');

    set({
      phase: 'playing',
      gameMinute: 0,
      balance: 0,
      totalEarned: 0,
      totalLost: 0,
      financeLog: [],
      reputation: 100,
      sessionName: sessionName || `Смена · ${truckCount} трака`,
      trucks: trucksWithRoutes,
      availableLoads: generateLoads(0),
      activeLoads: selectedActiveLoads,
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
    // 1 день = 20 реальных минут = 1200 тиков
    // 1 тик = 1440/1200 = 1.2 игровых минуты
    const TICK_MINUTES = 1.2;
    const newMinute = Math.round((gameMinute + TICK_MINUTES) * 10) / 10;

    if (newMinute >= SHIFT_DURATION) {
      get().endShift();
      return;
    }

    // Скорость: 10 миль/игровую минуту × 1.2 мин/тик = 12 миль/тик, делим на 3 для плавности
    const MILES_PER_TICK = (10 * TICK_MINUTES) / 3;

    // HOS: 11 часов = 660 игровых минут вождения
    const HOS_MAX_DRIVE = 660;
    const HOS_REST = 600; // 10 часов отдыха

    // Обновляем прогресс траков
    const updatedTrucks = await Promise.all(trucks.map(async (truck) => {

      // ── HOS: трак исчерпал лимит вождения — принудительный отдых ──
      if ((truck.status === 'driving' || truck.status === 'loaded') && truck.hoursLeft <= 0) {
        get().addNotification({
          type: 'urgent', priority: 'critical',
          from: `${truck.driver} (ELD)`,
          subject: `🚨 HOS нарушение — ${truck.name} остановлен`,
          message: `${truck.driver} исчерпал 11-часовой лимит вождения. Трак остановлен по требованию ELD. Обязательный отдых 10 часов.`,
          actionRequired: true,
          relatedTruckId: truck.id,
        });
        return {
          ...truck,
          status: 'waiting' as TruckStatus,
          hosRestStartMinute: newMinute,
        } as any;
      }

      // ── HOS: трак на отдыхе — ждём 10 часов (600 игровых минут) ──
      if (truck.status === 'waiting') {
        const restStart = (truck as any).hosRestStartMinute ?? newMinute;
        const restDone = newMinute - restStart >= HOS_REST;
        if (restDone) {
          get().addNotification({
            type: 'email', priority: 'medium',
            from: `${truck.driver}`,
            subject: `✅ ${truck.name} отдохнул — готов к работе`,
            message: `${truck.driver} завершил обязательный отдых (10 часов). HOS сброшен. Трак готов к движению.`,
            actionRequired: false,
            relatedTruckId: truck.id,
          });
          return {
            ...truck,
            status: truck.currentLoad ? 'loaded' as TruckStatus : 'idle' as TruckStatus,
            hoursLeft: 11,
            hosRestStartMinute: undefined,
          } as any;
        }
        return truck;
      }

      // ── at_pickup: автоматически начинаем ехать на delivery через 5 минут ──
      if (truck.status === 'at_pickup' && truck.currentLoad) {
        const pickupArrivalMinute = (truck as any).pickupArrivalMinute ?? newMinute;
        const waitTime = newMinute - pickupArrivalMinute;
        if (waitTime >= 5) {
          // Загружаем маршрут до delivery
          const deliveryCity = CITIES[truck.currentLoad.toCity];
          let routePath: Array<[number, number]> | null = null;
          if (deliveryCity) {
            try {
              const url = `https://router.project-osrm.org/route/v1/driving/${truck.position[0]},${truck.position[1]};${deliveryCity[0]},${deliveryCity[1]}?overview=full&geometries=geojson`;
              const res = await fetch(url);
              const data = await res.json();
              if (data.routes && data.routes[0]) {
                routePath = data.routes[0].geometry.coordinates;
              }
            } catch {}
          }
          get().addNotification({
            type: 'email', priority: 'low',
            from: truck.currentLoad.brokerName,
            subject: `🚛 ${truck.name} загружен, едет на delivery`,
            message: `${truck.name} загружен в ${truck.currentLoad.fromCity} и едет в ${truck.currentLoad.toCity}`,
            actionRequired: false,
            relatedTruckId: truck.id,
          });
          return {
            ...truck,
            status: 'loaded' as TruckStatus,
            destinationCity: truck.currentLoad.toCity,
            progress: 0,
            routePath,
            currentLoad: { ...truck.currentLoad, phase: 'to_delivery' as any },
          };
        }
        // Ещё ждём — сохраняем время прибытия
        return { ...truck, pickupArrivalMinute } as any;
      }

      // ── at_delivery: автоматически освобождаем трак через 10 минут ──
      if (truck.status === 'at_delivery' && truck.currentLoad) {
        const deliveryArrivalMinute = (truck as any).deliveryArrivalMinute ?? newMinute;
        const waitTime = newMinute - deliveryArrivalMinute;
        if (waitTime >= 10) {
          get().addNotification({
            type: 'email', priority: 'low',
            from: truck.currentLoad.brokerName,
            subject: `✅ ${truck.name} разгружен — свободен`,
            message: `${truck.name} разгружен в ${truck.currentLoad.toCity}. Трак свободен, ищи следующий груз!`,
            actionRequired: false,
            relatedTruckId: truck.id,
          });
          // Убираем груз из activeLoads
          const activeLoads = get().activeLoads.filter(l => l.id !== truck.currentLoad!.id);
          set({ activeLoads });
          return {
            ...truck,
            status: 'idle' as TruckStatus,
            currentLoad: null,
            destinationCity: null,
            progress: 0,
            routePath: null,
            currentCity: truck.currentLoad.toCity,
          };
        }
        return { ...truck, deliveryArrivalMinute } as any;
      }

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
        const to = CITIES[truck.destinationCity];
        if (!to) return truck;

        // Расстояние маршрута
        let totalMiles = 500;
        if (truck.currentLoad) {
          totalMiles = truck.currentLoad.miles;
        } else {
          const from = CITIES[truck.currentCity] || truck.position;
          const dx = to[0] - from[0];
          const dy = to[1] - from[1];
          totalMiles = Math.round(Math.sqrt(dx * dx + dy * dy) * 69);
        }

        // 10 миль/игровую минуту × 1.2 мин/тик = 12 миль/тик
        const progressPerTick = MILES_PER_TICK / totalMiles;
        const newProgress = Math.min(1, truck.progress + progressPerTick);

        // Уменьшаем HOS: 1.2 игровых минуты = 1.2/60 часа
        const newHoursLeft = Math.round(Math.max(0, truck.hoursLeft - TICK_MINUTES / 60) * 10) / 10;

        if (newProgress >= 1) {
          // Трак приехал в пункт назначения
          const newStatus = truck.status === 'driving' ? 'at_pickup' as TruckStatus : 'at_delivery' as TruckStatus;

          // 💰 Оплата при доставке
          if (newStatus === 'at_delivery' && truck.currentLoad) {
            const load = truck.currentLoad;
            get().addMoney(load.agreedRate, `Доставка: ${load.fromCity} → ${load.toCity} (${truck.name})`);
            // Очки: базовые за доставку + бонус за RPM
            const rpm = load.agreedRate / load.miles;
            const bonus = rpm >= 3.0 ? 50 : rpm >= 2.5 ? 30 : 10;
            set({ score: get().score + 100 + bonus });
            get().addNotification({
              type: 'email',
              priority: 'medium',
              from: `${load.brokerName} - ${load.brokerCompany}`,
              subject: `✅ Доставка подтверждена — $${load.agreedRate.toLocaleString()}`,
              message: `Груз доставлен! ${load.fromCity} → ${load.toCity}\n${load.commodity} · ${load.miles} mi\nОплата: $${load.agreedRate.toLocaleString()}\n\nОтправь POD для закрытия.`,
              actionRequired: true,
              relatedTruckId: truck.id,
              relatedLoadId: load.id,
            });
          }
          
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
            routePath: nextRoutePath,
            hoursLeft: newHoursLeft,
            pickupArrivalMinute: newStatus === 'at_pickup' ? newMinute : undefined,
            deliveryArrivalMinute: newStatus === 'at_delivery' ? newMinute : undefined,
          };
        }
        
        // Двигаемся по routePath
        if (truck.routePath && truck.routePath.length > 1) {
          const totalPoints = truck.routePath.length;
          const pointIndex = Math.floor(newProgress * (totalPoints - 1));
          const nextIndex = Math.min(pointIndex + 1, totalPoints - 1);
          const segmentProgress = (newProgress * (totalPoints - 1)) - pointIndex;
          
          const p1 = truck.routePath[pointIndex];
          const p2 = truck.routePath[nextIndex];
          const lng = p1[0] + (p2[0] - p1[0]) * segmentProgress;
          const lat = p1[1] + (p2[1] - p1[1]) * segmentProgress;
          
          return { ...truck, progress: newProgress, position: [lng, lat] as [number, number], hoursLeft: newHoursLeft };
        } else {
          return truck;
        }
      }
      return truck;
    }));

    // Убираем истёкшие грузы
    const freshLoads = availableLoads.filter(l => l.expiresAt > newMinute);

    // Добавляем новые грузы каждые 12 минут (≈ 10 реальных секунд)
    const shouldAddLoads = Math.floor(newMinute / 12) > Math.floor(gameMinute / 12);
    const newLoads = shouldAddLoads ? generateLoads(newMinute).slice(0, 5) : [];

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

    // Случайные события каждые 32 игровых минуты (50% шанс)
    if (newMinute % 32 === 0 && newMinute > 0 && Math.random() < 0.5) {
      setTimeout(() => get().triggerRandomEvent(), 500);
    }

    set({
      gameMinute: newMinute,
      trucks: updatedTrucks,
      availableLoads: [...freshLoads, ...newLoads],
    });
    
    // Автосохранение каждые 60 игровых минут (≈ 50 реальных секунд)
    if (Math.floor(newMinute / 60) > Math.floor(gameMinute / 60)) {
      get().saveGame();
    }
  },

  triggerRandomEvent: () => {
    const { trucks, activeLoads } = get();
    const drivingTrucks = trucks.filter(t => t.status === 'driving' || t.status === 'loaded');
    
    if (drivingTrucks.length === 0) return; // Нет траков в пути — нечего ломать
    
    const eventTypes = [
      'breakdown', 'detention', 'driver_question', 'weather_delay', 
      'inspection', 'fuel_issue', 'broker_call', 'rate_increase'
    ];
    
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const truck = drivingTrucks[Math.floor(Math.random() * drivingTrucks.length)];
    
    switch (eventType) {
      case 'breakdown':
        get().addNotification({
          type: 'text',
          priority: 'critical',
          from: truck.driver,
          subject: '🚨 Поломка трака',
          message: `${truck.name} сломался! Двигатель перегрелся. Нужна техпомощь или ремонт. Что делать?`,
          actionRequired: true,
          relatedTruckId: truck.id,
        });
        break;
        
      case 'detention':
        get().addNotification({
          type: 'text',
          priority: 'high',
          from: truck.driver,
          subject: '⏰ Задержка на погрузке',
          message: `Жду на ${truck.currentLoad?.fromCity || truck.currentCity} уже 3 часа. Detention начался. Требовать оплату?`,
          actionRequired: true,
          relatedTruckId: truck.id,
        });
        break;
        
      case 'driver_question':
        const questions = [
          'Где остановиться на ночь? HOS заканчивается через 2 часа.',
          'Груз тяжелее чем в BOL. Везти или отказаться?',
          'На весах показали перегруз 500 фунтов. Что делать?',
          'Шиппер просит подписать дополнительные документы. Подписывать?',
        ];
        get().addNotification({
          type: 'text',
          priority: 'medium',
          from: truck.driver,
          subject: '❓ Вопрос водителя',
          message: questions[Math.floor(Math.random() * questions.length)],
          actionRequired: true,
          relatedTruckId: truck.id,
        });
        break;
        
      case 'weather_delay':
        get().addNotification({
          type: 'text',
          priority: 'medium',
          from: truck.driver,
          subject: '🌨️ Погода',
          message: 'Сильный снегопад. Дорога закрыта. Жду когда откроют. Задержка ~2 часа.',
          actionRequired: false,
          relatedTruckId: truck.id,
        });
        break;
        
      case 'inspection':
        get().addNotification({
          type: 'text',
          priority: 'high',
          from: truck.driver,
          subject: '🚔 DOT инспекция',
          message: 'Остановили на весах. Проверяют документы и трак. Жду результата.',
          actionRequired: false,
          relatedTruckId: truck.id,
        });
        break;
        
      case 'fuel_issue':
        get().addNotification({
          type: 'text',
          priority: 'medium',
          from: truck.driver,
          subject: '⛽ Топливо',
          message: 'Топливная карта не работает. Заправиться за наличные или ждать?',
          actionRequired: true,
          relatedTruckId: truck.id,
        });
        break;
        
      case 'broker_call':
        const brokerNames = ['Tom (FastFreight)', 'Sarah (LoadMax)', 'Mike (FreightPro)', 'Lisa (CargoLink)'];
        get().addNotification({
          type: 'missed_call',
          priority: 'medium',
          from: brokerNames[Math.floor(Math.random() * brokerNames.length)],
          subject: '📞 Пропущенный звонок',
          message: 'Брокер звонил 2 раза. Возможно срочный груз или вопрос по текущей доставке.',
          actionRequired: true,
        });
        break;
        
      case 'rate_increase':
        if (truck.currentLoad) {
          const bonus = 100 + Math.floor(Math.random() * 200);
          get().addNotification({
            type: 'email',
            priority: 'high',
            from: `${truck.currentLoad.brokerName} - ${truck.currentLoad.brokerCompany}`,
            subject: '💰 Повышение ставки!',
            message: `Good news! Shipper increased the rate by ${bonus}. Your new total: ${(truck.currentLoad.agreedRate + bonus).toLocaleString()}`,
            actionRequired: false,
            relatedTruckId: truck.id,
            relatedLoadId: truck.currentLoad.id,
          });
          // Обновляем ставку груза
          const updatedTrucks = trucks.map(t => {
            if (t.id === truck.id && t.currentLoad) {
              return {
                ...t,
                currentLoad: {
                  ...t.currentLoad,
                  agreedRate: t.currentLoad.agreedRate + bonus,
                },
              };
            }
            return t;
          });
          set({ trucks: updatedTrucks });
        }
        break;
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
      // Сохраняем сразу после назначения
      setTimeout(() => get().saveGame(), 100);
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
      // Сохраняем сразу после назначения
      setTimeout(() => get().saveGame(), 100);
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

  setLoadBoardSearch: (city: string) => {
    set({ loadBoardSearchFrom: city });
  },

  endShift: () => {
    // Вместо завершения игры — начинаем новый день
    const state = get();
    const newDay = (state.day || 1) + 1;
    // Сбрасываем время на начало нового дня, обновляем HOS всех траков
    const updatedTrucks = state.trucks.map(truck => ({
      ...truck,
      hoursLeft: 11, // HOS сброшен — новый день
      // Если трак был на отдыхе — освобождаем
      status: truck.status === 'waiting' ? 'idle' as any : truck.status,
    }));
    set({
      phase: 'new_day',  // специальная фаза для popup
      day: newDay,
      gameMinute: 0,     // время сбрасывается на 08:00
      trucks: updatedTrucks,
    });
    get().saveGame();
  },

  saveGame: () => {
    try {
      const state = get();
      const saveData = {
        version: 2,
        phase: state.phase,
        day: state.day,
        gameMinute: state.gameMinute,
        sessionName: state.sessionName,
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

      // Сбрасываем старые сохранения без версии или с устаревшей версией
      if (!saveData.version || saveData.version < 2) {
        localStorage.removeItem('dispatcher-game-save');
        console.log('🔄 Old save detected, resetting...');
        return false;
      }

      // Восстанавливаем маршруты для едущих траков у которых routePath = null
      const trucksToRestore = saveData.trucks as any[];
      const restoreRoutes = async () => {
        const restored = await Promise.all(trucksToRestore.map(async (truck: any) => {
          if ((truck.status === 'driving' || truck.status === 'loaded') && truck.destinationCity && !truck.routePath) {
            const dest = CITIES[truck.destinationCity];
            if (dest) {
              try {
                const url = `https://router.project-osrm.org/route/v1/driving/${truck.position[0]},${truck.position[1]};${dest[0]},${dest[1]}?overview=full&geometries=geojson`;
                const res = await fetch(url);
                const data = await res.json();
                if (data.routes && data.routes[0]) {
                  console.log(`✅ Restored route for ${truck.id}`);
                  return { ...truck, routePath: data.routes[0].geometry.coordinates };
                }
              } catch {}
            }
          }
          return truck;
        }));
        set({ trucks: restored });
      };
      restoreRoutes();

      set({
        phase: saveData.phase,
        day: saveData.day,
        gameMinute: saveData.gameMinute,
        sessionName: saveData.sessionName || '',
        balance: saveData.balance,
        totalEarned: saveData.totalEarned,
        totalLost: saveData.totalLost,
        financeLog: saveData.financeLog,
        reputation: saveData.reputation,
        trucks: saveData.trucks,
        availableLoads: saveData.availableLoads.length > 0 
          ? saveData.availableLoads.filter((l: any) => l.expiresAt > saveData.gameMinute)
          : generateLoads(saveData.gameMinute),
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
    const existing = get().notifications;
    const gameMinute = get().gameMinute;

    // Ищем существующий тред от того же отправителя
    const threadMatch = existing.find(n =>
      n.from === notification.from &&
      !n.read &&
      n.type === (notification.type || 'email')
    );

    if (threadMatch) {
      // Добавляем как reply в существующий тред
      const reply: NotificationReply = {
        from: notification.from,
        message: notification.message,
        minute: gameMinute,
      };
      const updated = existing.map(n =>
        n.id === threadMatch.id
          ? { ...n, read: false, message: notification.message, minute: gameMinute, replies: [...(n.replies || []), reply] }
          : n
      );
      const unreadCount = updated.filter(n => !n.read).length;
      set({ notifications: updated, unreadCount });
      return;
    }

    // Лимит: максимум 7 писем — удаляем самое старое прочитанное если превышен
    let list = [...existing];
    if (list.length >= 7) {
      const oldestRead = list.findIndex(n => n.read);
      if (oldestRead !== -1) list.splice(oldestRead, 1);
      else list.pop(); // если все непрочитанные — удаляем последнее
    }

    const newNotif: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random()}`,
      minute: gameMinute,
      read: false,
      threadId: `${notification.from}-${notification.type}`,
      replies: [],
    };
    const updated = [newNotif, ...list];
    set({
      notifications: updated,
      unreadCount: updated.filter(n => !n.read).length,
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



