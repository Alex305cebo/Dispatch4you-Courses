import { create } from 'zustand';
import { SHIFT_DURATION, SHIFT_START_HOUR, SHIFT_START_MINUTE, CITIES, TIME_SCALE } from '../constants/config';
import { findNearestTruckStop } from '../constants/truckStops';

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
  tripExpenses: Array<{ label: string; amount: number; minute: number }>; // доп. расходы за поездку
  lastInspection: number; // минута последней инспекции
  idleSinceMinute?: number; // минута когда трак встал (для idle warning)
  outOfOrderUntil?: number; // минута до которой трак out of order (police inspection)
  idleWarningLevel?: 0 | 1 | 2 | 3; // 0=ok, 1=yellow, 2=orange, 3=red

  // ── HOS STOP SYSTEM ──
  hosStopId?: string;           // ID truck stop где трак отдыхает
  hosStopName?: string;         // Название truck stop
  hosStopType?: 'truck_stop' | 'rest_area'; // тип остановки
  hosStopPosition?: [number, number]; // координаты truck stop
  hosRestUntilMinute?: number;  // до какой игровой минуты трак отдыхает
  drivingToHosStop?: boolean;   // трак едет к truck stop (HOS заканчивается)
  hosStopDestination?: [number, number]; // куда едет на truck stop
  hosStopDestName?: string;     // название truck stop куда едет
  resumeAfterRest?: boolean;    // после отдыха продолжить маршрут
  preRestStatus?: string;       // статус до отдыха (чтобы восстановить)
  preRestDestCity?: string;     // город назначения до отдыха
  preRestProgress?: number;     // прогресс маршрута до отдыха
  preRestRoutePath?: Array<[number, number]> | null; // маршрут до отдыха
  // ── 30-MIN BREAK ──
  onMandatoryBreak?: boolean;
  mandatoryBreakDone?: boolean;
  mandatoryBreakStartMinute?: number;
  mandatoryBreakDuration?: number;
  // ── NIGHT STOP ──
  onNightStop?: boolean;
  nightStopDone?: boolean;
  nightStopStartMinute?: number;
  nightStopDuration?: number;
  nightStopName?: string;
  hadNightStop?: boolean;
  nightStopDelayMinutes?: number; // суммарная задержка из-за ночёвок
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
  replyToNotifId?: string; // id уведомления-треда куда добавить ответ
}

// Итоговый расчёт доставки
export interface DeliveryResult {
  truckId: string;
  truckName: string;
  driverName: string;
  loadId: string;
  fromCity: string;
  toCity: string;
  miles: number;
  agreedRate: number;
  // Расходы
  fuelCost: number;       // ~$0.45/mile дизель
  driverPay: number;      // ~$0.55/mile
  dispatchFee: number;    // 8% от rate
  factoringFee: number;   // 3% от rate
  lumperCost: number;     // случайно 0 или $150-300
  detentionPay: number;   // если было detention
  roadsideCost: number;    // roadside assistance
  tireCost: number;        // замена шин
  otherRepairCost: number; // прочие ремонты
  lateDeliveryFine: number; // штраф за опоздание
  tripExtraExpenses: number; // сумма всех доп. расходов
  truckPayment: number;   // выплата за трак ~8% от гросса
  trailerPayment: number; // выплата за трейлер ~5% от гросса
  // Итог
  grossRevenue: number;
  totalExpenses: number;
  netProfit: number;
  ratePerMile: number;
  profitPerMile: number;
  minute: number;
}

interface GameState {
  // Мета
  phase: 'menu' | 'playing' | 'shift_end';
  day: number;
  gameMinute: number; // 0 = 08:43
  timeSpeed: 1 | 2 | 5;
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

  // Итоги доставок — показываем попап
  deliveryResults: DeliveryResult[];
  dismissDeliveryResult: (loadId: string) => void;

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
  setTimeSpeed: (speed: 1 | 2 | 5) => void;

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
  addReplyToNotification: (notifId: string, reply: NotificationReply) => void;
  sendEmail: (params: { to: string; subject: string; body: string; isReply: boolean; replyToId?: string }) => void;

  refreshLoadBoard: () => void;
  endShift: () => void;
  setLoadBoardSearch: (city: string) => void;
  
  // Сохранение и загрузка
  saveGame: () => void;
  loadGame: () => boolean;
  clearSave: () => void;
  testDeliveryPopup: () => void;
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
  fromCity: 'Houston',
  toCity: 'Chicago',
  commodity: 'Промышленное оборудование',
  weight: 41000,
  equipment: 'Flatbed',
  postedRate: 2800,
  marketRate: 3100,
  minRate: 2600,
  miles: 1092,
  pickupTime: 'Yesterday 08:00',
  deliveryTime: 'Tomorrow 10:00',
  expiresAt: 0,
  isUrgent: false,
  agreedRate: 3000,
  truckId: 'T4',
  phase: 'to_delivery',
  detentionMinutes: 0,
  detentionPaid: false,
};

const INITIAL_LOAD_9: ActiveLoad = {
  id: 'INIT-L9',
  brokerId: 'B3',
  brokerName: 'Mike',
  brokerCompany: 'EastFreight Co',
  fromCity: 'Indianapolis',
  toCity: 'Atlanta',
  commodity: 'Автозапчасти',
  weight: 36000,
  equipment: 'Dry Van',
  postedRate: 1600,
  marketRate: 1900,
  minRate: 1500,
  miles: 490,
  pickupTime: 'Yesterday 14:00',
  deliveryTime: 'Today 18:00',
  expiresAt: 0,
  isUrgent: false,
  agreedRate: 1800,
  truckId: 'T9',
  phase: 'to_delivery',
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
    id: 'T1', name: 'Truck 1047', driver: 'John Martinez',
    status: 'idle', position: CITIES['Knoxville'],
    currentCity: 'Knoxville', destinationCity: null,
    progress: 0, currentLoad: null, hoursLeft: 11, mood: 65, routePath: null,
    safetyScore: 95, fuelEfficiency: 6.8, onTimeRate: 98, complianceRate: 100,
    totalMiles: 45230, totalDeliveries: 156, hosViolations: 0, lastInspection: 0,
    idleSinceMinute: 0,
  } as any,
  {
    id: 'T2', name: 'Truck 2023', driver: 'Carlos Rivera',
    status: 'idle', position: CITIES['Knoxville'],
    currentCity: 'Knoxville', destinationCity: null,
    progress: 0, currentLoad: null, hoursLeft: 11, mood: 68, routePath: null,
    safetyScore: 92, fuelEfficiency: 7.1, onTimeRate: 96, complianceRate: 98,
    totalMiles: 38450, totalDeliveries: 142, hosViolations: 0, lastInspection: 0,
    idleSinceMinute: 0,
  } as any,
  {
    id: 'T3', name: 'Truck 3012', driver: 'Mike Chen',
    status: 'idle', position: CITIES['Knoxville'],
    currentCity: 'Knoxville', destinationCity: null,
    progress: 0, currentLoad: null, hoursLeft: 11, mood: 63, routePath: null,
    safetyScore: 98, fuelEfficiency: 7.3, onTimeRate: 99, complianceRate: 100,
    totalMiles: 52100, totalDeliveries: 178, hosViolations: 0, lastInspection: 0,
    idleSinceMinute: 0,
  } as any,
  {
    // T4 — едет с грузом к delivery
    id: 'T4', name: 'Truck 4034', driver: 'Tom Wilson',
    status: 'loaded', position: CITIES['Houston'],
    currentCity: 'Houston', destinationCity: 'Chicago',
    progress: 0.25, currentLoad: INITIAL_LOAD_4, hoursLeft: 10, mood: 67, routePath: null,
    safetyScore: 88, fuelEfficiency: 6.5, onTimeRate: 94, complianceRate: 96,
    totalMiles: 41200, totalDeliveries: 135, hosViolations: 2, lastInspection: 0,
  },
  {
    // T5 — свободен, только что разгрузился
    id: 'T5', name: 'Truck 5056', driver: 'Lisa Brown',
    status: 'idle', position: CITIES['Miami'],
    currentCity: 'Miami', destinationCity: null,
    progress: 0, currentLoad: null, hoursLeft: 11, mood: 64, routePath: null,
    safetyScore: 97, fuelEfficiency: 7.0, onTimeRate: 97, complianceRate: 100,
    totalMiles: 48900, totalDeliveries: 165, hosViolations: 0, lastInspection: 0,
    idleSinceMinute: 0,
  } as any,
  {
    // T6 — едет с грузом к delivery
    id: 'T6', name: 'Truck 6078', driver: 'David Martinez',
    status: 'loaded', position: CITIES['Seattle'],
    currentCity: 'Seattle', destinationCity: 'Phoenix',
    progress: 0.3, currentLoad: INITIAL_LOAD_6, hoursLeft: 7, mood: 66, routePath: null,
    safetyScore: 90, fuelEfficiency: 6.9, onTimeRate: 95, complianceRate: 97,
    totalMiles: 39800, totalDeliveries: 148, hosViolations: 1, lastInspection: 0,
  },
  {
    // T7 — едет к pickup (deadhead)
    id: 'T7', name: 'Truck 7089', driver: 'James Anderson',
    status: 'driving', position: CITIES['Kansas City'],
    currentCity: 'Kansas City', destinationCity: 'Memphis',
    progress: 0.4, currentLoad: null, hoursLeft: 11, mood: 70, routePath: null,
    safetyScore: 96, fuelEfficiency: 7.2, onTimeRate: 98, complianceRate: 100,
    totalMiles: 44500, totalDeliveries: 152, hosViolations: 0, lastInspection: 0,
  },
  {
    // T8 — свободен, только что разгрузился
    id: 'T8', name: 'Truck 8091', driver: 'Maria Garcia',
    status: 'idle', position: CITIES['Las Vegas'],
    currentCity: 'Las Vegas', destinationCity: null,
    progress: 0, currentLoad: null, hoursLeft: 11, mood: 65, routePath: null,
    safetyScore: 99, fuelEfficiency: 7.4, onTimeRate: 99, complianceRate: 100,
    totalMiles: 51200, totalDeliveries: 171, hosViolations: 0, lastInspection: 0,
    idleSinceMinute: 0,
  } as any,
  {
    // T9 — едет с грузом к delivery
    id: 'T9', name: 'Truck 9102', driver: 'Robert Johnson',
    status: 'loaded', position: CITIES['Indianapolis'],
    currentCity: 'Indianapolis', destinationCity: 'Atlanta',
    progress: 0.2, currentLoad: INITIAL_LOAD_9, hoursLeft: 10, mood: 62, routePath: null,
    safetyScore: 93, fuelEfficiency: 6.8, onTimeRate: 96, complianceRate: 98,
    totalMiles: 42300, totalDeliveries: 145, hosViolations: 1, lastInspection: 0,
  },
];

const INITIAL_BROKERS: Broker[] = [
  { id: 'B1', name: 'Tom', company: 'FastFreight LLC', relationship: 50, callsAnswered: 0, loadsCompleted: 0, avatar: '👨‍💼' },
  { id: 'B2', name: 'Sarah', company: 'QuickLoad Inc', relationship: 40, callsAnswered: 0, loadsCompleted: 0, avatar: '👩‍💼' },
  { id: 'B3', name: 'Mike', company: 'EastFreight Co', relationship: 60, callsAnswered: 0, loadsCompleted: 0, avatar: '🧑‍💼' },
  { id: 'B4', name: 'Lisa', company: 'PrimeHaul', relationship: 30, callsAnswered: 0, loadsCompleted: 0, avatar: '👩‍💼' },
  { id: 'B5', name: 'Dave', company: 'CrossCountry', relationship: 55, callsAnswered: 0, loadsCompleted: 0, avatar: '👨‍💼' },
];

// Находим ближайший город к позиции [lng, lat]
function getNearestCity(lng: number, lat: number): string {
  let nearest = '';
  let minDist = Infinity;
  for (const [name, coords] of Object.entries(CITIES)) {
    const d = Math.hypot(coords[0] - lng, coords[1] - lat);
    if (d < minDist) { minDist = d; nearest = name; }
  }
  return nearest;
}

function generateLoads(minute: number): LoadOffer[] {
  // Только реальные дальние рейсы 400-1500 миль, $2.50-$3.50+/mile
  const routes = [
    // ── MIDWEST HUB: Chicago ──
    { from: 'Chicago', to: 'Houston',       miles: 1092 },
    { from: 'Chicago', to: 'Dallas',        miles: 967  },
    { from: 'Chicago', to: 'Atlanta',       miles: 716  },
    { from: 'Chicago', to: 'Miami',         miles: 1377 },
    { from: 'Chicago', to: 'Denver',        miles: 1003 },
    { from: 'Chicago', to: 'Los Angeles',   miles: 2015 },
    { from: 'Chicago', to: 'Seattle',       miles: 2065 },
    { from: 'Chicago', to: 'Phoenix',       miles: 1750 },
    { from: 'Chicago', to: 'New York',      miles: 790  },
    { from: 'Chicago', to: 'Nashville',     miles: 476  },
    { from: 'Chicago', to: 'Memphis',       miles: 530  },
    { from: 'Chicago', to: 'Kansas City',   miles: 500  },
    { from: 'Chicago', to: 'Minneapolis',   miles: 410  },
    { from: 'Chicago', to: 'Detroit',       miles: 280  },
    { from: 'Chicago', to: 'Columbus',      miles: 355  },
    { from: 'Chicago', to: 'Indianapolis',  miles: 180  },
    { from: 'Chicago', to: 'St. Louis',     miles: 300  },
    // ── SOUTH: Dallas / Houston ──
    { from: 'Dallas', to: 'Chicago',        miles: 967  },
    { from: 'Dallas', to: 'Atlanta',        miles: 781  },
    { from: 'Dallas', to: 'Los Angeles',    miles: 1435 },
    { from: 'Dallas', to: 'Miami',          miles: 1308 },
    { from: 'Dallas', to: 'Denver',         miles: 781  },
    { from: 'Dallas', to: 'Phoenix',        miles: 1071 },
    { from: 'Dallas', to: 'Nashville',      miles: 663  },
    { from: 'Dallas', to: 'Kansas City',    miles: 500  },
    { from: 'Dallas', to: 'New York',       miles: 1550 },
    { from: 'Dallas', to: 'Seattle',        miles: 2100 },
    { from: 'Dallas', to: 'Memphis',        miles: 470  },
    { from: 'Dallas', to: 'New Orleans',    miles: 505  },
    { from: 'Houston', to: 'Chicago',       miles: 1092 },
    { from: 'Houston', to: 'Atlanta',       miles: 789  },
    { from: 'Houston', to: 'Miami',         miles: 1190 },
    { from: 'Houston', to: 'Los Angeles',   miles: 1550 },
    { from: 'Houston', to: 'Denver',        miles: 1020 },
    { from: 'Houston', to: 'Nashville',     miles: 790  },
    { from: 'Houston', to: 'New York',      miles: 1630 },
    { from: 'Houston', to: 'Phoenix',       miles: 1175 },
    { from: 'Houston', to: 'Seattle',       miles: 2340 },
    { from: 'Houston', to: 'Kansas City',   miles: 740  },
    // ── SOUTHEAST: Atlanta ──
    { from: 'Atlanta', to: 'Chicago',       miles: 716  },
    { from: 'Atlanta', to: 'Dallas',        miles: 781  },
    { from: 'Atlanta', to: 'New York',      miles: 881  },
    { from: 'Atlanta', to: 'Miami',         miles: 662  },
    { from: 'Atlanta', to: 'Houston',       miles: 789  },
    { from: 'Atlanta', to: 'Los Angeles',   miles: 1940 },
    { from: 'Atlanta', to: 'Denver',        miles: 1400 },
    { from: 'Atlanta', to: 'Nashville',     miles: 250  },
    { from: 'Atlanta', to: 'Memphis',       miles: 395  },
    { from: 'Atlanta', to: 'Charlotte',     miles: 245  },
    { from: 'Atlanta', to: 'Philadelphia',  miles: 1000 },
    { from: 'Atlanta', to: 'Boston',        miles: 1100 },
    { from: 'Atlanta', to: 'Kansas City',   miles: 800  },
    { from: 'Atlanta', to: 'Seattle',       miles: 2620 },
    // ── NORTHEAST: New York / Philadelphia / Boston ──
    { from: 'New York', to: 'Chicago',      miles: 790  },
    { from: 'New York', to: 'Atlanta',      miles: 881  },
    { from: 'New York', to: 'Miami',        miles: 1280 },
    { from: 'New York', to: 'Dallas',       miles: 1550 },
    { from: 'New York', to: 'Houston',      miles: 1630 },
    { from: 'New York', to: 'Los Angeles',  miles: 2800 },
    { from: 'New York', to: 'Denver',       miles: 1780 },
    { from: 'New York', to: 'Nashville',    miles: 900  },
    { from: 'New York', to: 'Charlotte',    miles: 630  },
    { from: 'New York', to: 'Columbus',     miles: 530  },
    { from: 'New York', to: 'Detroit',      miles: 600  },
    { from: 'New York', to: 'Kansas City',  miles: 1200 },
    { from: 'Philadelphia', to: 'Chicago',  miles: 760  },
    { from: 'Philadelphia', to: 'Atlanta',  miles: 1000 },
    { from: 'Philadelphia', to: 'Miami',    miles: 1250 },
    { from: 'Philadelphia', to: 'Dallas',   miles: 1500 },
    { from: 'Philadelphia', to: 'Nashville',miles: 870  },
    { from: 'Philadelphia', to: 'Columbus', miles: 460  },
    { from: 'Boston', to: 'Chicago',        miles: 980  },
    { from: 'Boston', to: 'Atlanta',        miles: 1100 },
    { from: 'Boston', to: 'Miami',          miles: 1500 },
    { from: 'Boston', to: 'Dallas',         miles: 1750 },
    { from: 'Boston', to: 'Nashville',      miles: 1050 },
    // ── WEST: Los Angeles / San Francisco / Seattle ──
    { from: 'Los Angeles', to: 'Chicago',   miles: 2015 },
    { from: 'Los Angeles', to: 'Dallas',    miles: 1435 },
    { from: 'Los Angeles', to: 'Houston',   miles: 1550 },
    { from: 'Los Angeles', to: 'Atlanta',   miles: 1940 },
    { from: 'Los Angeles', to: 'New York',  miles: 2800 },
    { from: 'Los Angeles', to: 'Denver',    miles: 1016 },
    { from: 'Los Angeles', to: 'Seattle',   miles: 1135 },
    { from: 'Los Angeles', to: 'Phoenix',   miles: 373  },
    { from: 'Los Angeles', to: 'Las Vegas', miles: 270  },
    { from: 'Los Angeles', to: 'Salt Lake City', miles: 689 },
    { from: 'Los Angeles', to: 'Kansas City',    miles: 1630 },
    { from: 'Los Angeles', to: 'Nashville',      miles: 1980 },
    { from: 'Los Angeles', to: 'Miami',          miles: 2750 },
    { from: 'San Francisco', to: 'Los Angeles',  miles: 380  },
    { from: 'San Francisco', to: 'Seattle',      miles: 810  },
    { from: 'San Francisco', to: 'Denver',       miles: 1240 },
    { from: 'San Francisco', to: 'Dallas',       miles: 1770 },
    { from: 'San Francisco', to: 'Chicago',      miles: 2130 },
    { from: 'San Francisco', to: 'Phoenix',      miles: 750  },
    { from: 'San Francisco', to: 'Las Vegas',    miles: 570  },
    { from: 'San Francisco', to: 'Salt Lake City', miles: 750 },
    { from: 'San Francisco', to: 'Atlanta',      miles: 2490 },
    { from: 'San Francisco', to: 'New York',     miles: 2900 },
    { from: 'Seattle', to: 'Los Angeles',        miles: 1135 },
    { from: 'Seattle', to: 'Denver',             miles: 1306 },
    { from: 'Seattle', to: 'Chicago',            miles: 2065 },
    { from: 'Seattle', to: 'Dallas',             miles: 2100 },
    { from: 'Seattle', to: 'Phoenix',            miles: 1420 },
    { from: 'Seattle', to: 'Salt Lake City',     miles: 840  },
    { from: 'Seattle', to: 'Las Vegas',          miles: 1120 },
    { from: 'Seattle', to: 'Atlanta',            miles: 2620 },
    { from: 'Seattle', to: 'New York',           miles: 2850 },
    { from: 'Seattle', to: 'Houston',            miles: 2340 },
    // ── MOUNTAIN: Denver / Phoenix / Las Vegas ──
    { from: 'Denver', to: 'Chicago',             miles: 1003 },
    { from: 'Denver', to: 'Dallas',              miles: 781  },
    { from: 'Denver', to: 'Los Angeles',         miles: 1016 },
    { from: 'Denver', to: 'Seattle',             miles: 1306 },
    { from: 'Denver', to: 'Atlanta',             miles: 1400 },
    { from: 'Denver', to: 'Houston',             miles: 1020 },
    { from: 'Denver', to: 'Kansas City',         miles: 600  },
    { from: 'Denver', to: 'Salt Lake City',      miles: 525  },
    { from: 'Denver', to: 'Phoenix',             miles: 600  },
    { from: 'Denver', to: 'New York',            miles: 1780 },
    { from: 'Denver', to: 'Nashville',           miles: 1200 },
    { from: 'Denver', to: 'Minneapolis',         miles: 920  },
    { from: 'Phoenix', to: 'Los Angeles',        miles: 373  },
    { from: 'Phoenix', to: 'Dallas',             miles: 1071 },
    { from: 'Phoenix', to: 'Denver',             miles: 600  },
    { from: 'Phoenix', to: 'Las Vegas',          miles: 295  },
    { from: 'Phoenix', to: 'Chicago',            miles: 1750 },
    { from: 'Phoenix', to: 'Houston',            miles: 1175 },
    { from: 'Phoenix', to: 'Atlanta',            miles: 1800 },
    { from: 'Phoenix', to: 'Seattle',            miles: 1420 },
    { from: 'Phoenix', to: 'Salt Lake City',     miles: 680  },
    { from: 'Las Vegas', to: 'Los Angeles',      miles: 270  },
    { from: 'Las Vegas', to: 'Denver',           miles: 750  },
    { from: 'Las Vegas', to: 'Phoenix',          miles: 295  },
    { from: 'Las Vegas', to: 'Salt Lake City',   miles: 420  },
    { from: 'Las Vegas', to: 'Seattle',          miles: 1120 },
    { from: 'Las Vegas', to: 'Dallas',           miles: 1230 },
    { from: 'Las Vegas', to: 'Chicago',          miles: 1760 },
    { from: 'Salt Lake City', to: 'Los Angeles', miles: 689  },
    { from: 'Salt Lake City', to: 'Denver',      miles: 525  },
    { from: 'Salt Lake City', to: 'Seattle',     miles: 840  },
    { from: 'Salt Lake City', to: 'Las Vegas',   miles: 420  },
    { from: 'Salt Lake City', to: 'Phoenix',     miles: 680  },
    { from: 'Salt Lake City', to: 'Chicago',     miles: 1400 },
    { from: 'Salt Lake City', to: 'Dallas',      miles: 1230 },
    // ── MIDWEST: Kansas City / Minneapolis / St. Louis ──
    { from: 'Kansas City', to: 'Chicago',        miles: 500  },
    { from: 'Kansas City', to: 'Dallas',         miles: 500  },
    { from: 'Kansas City', to: 'Denver',         miles: 600  },
    { from: 'Kansas City', to: 'Atlanta',        miles: 800  },
    { from: 'Kansas City', to: 'Los Angeles',    miles: 1630 },
    { from: 'Kansas City', to: 'Nashville',      miles: 550  },
    { from: 'Kansas City', to: 'Houston',        miles: 740  },
    { from: 'Kansas City', to: 'Minneapolis',    miles: 440  },
    { from: 'Kansas City', to: 'New York',       miles: 1200 },
    { from: 'Minneapolis', to: 'Chicago',        miles: 410  },
    { from: 'Minneapolis', to: 'Denver',         miles: 920  },
    { from: 'Minneapolis', to: 'Dallas',         miles: 1100 },
    { from: 'Minneapolis', to: 'Atlanta',        miles: 1100 },
    { from: 'Minneapolis', to: 'Kansas City',    miles: 440  },
    { from: 'Minneapolis', to: 'Detroit',        miles: 700  },
    { from: 'Minneapolis', to: 'Seattle',        miles: 1650 },
    { from: 'Minneapolis', to: 'Los Angeles',    miles: 1940 },
    { from: 'St. Louis', to: 'Chicago',          miles: 300  },
    { from: 'St. Louis', to: 'Dallas',           miles: 630  },
    { from: 'St. Louis', to: 'Atlanta',          miles: 560  },
    { from: 'St. Louis', to: 'Nashville',        miles: 309  },
    { from: 'St. Louis', to: 'Kansas City',      miles: 250  },
    { from: 'St. Louis', to: 'Memphis',          miles: 285  },
    { from: 'St. Louis', to: 'Denver',           miles: 860  },
    { from: 'St. Louis', to: 'Houston',          miles: 800  },
    // ── SOUTHEAST: Nashville / Memphis / Charlotte ──
    { from: 'Nashville', to: 'Chicago',          miles: 476  },
    { from: 'Nashville', to: 'Atlanta',          miles: 250  },
    { from: 'Nashville', to: 'Dallas',           miles: 663  },
    { from: 'Nashville', to: 'Houston',          miles: 790  },
    { from: 'Nashville', to: 'New York',         miles: 900  },
    { from: 'Nashville', to: 'Miami',            miles: 1000 },
    { from: 'Nashville', to: 'Los Angeles',      miles: 1980 },
    { from: 'Nashville', to: 'Denver',           miles: 1200 },
    { from: 'Nashville', to: 'Kansas City',      miles: 550  },
    { from: 'Nashville', to: 'Charlotte',        miles: 409  },
    { from: 'Nashville', to: 'Memphis',          miles: 210  },
    { from: 'Nashville', to: 'Indianapolis',     miles: 286  },
    { from: 'Nashville', to: 'Columbus',         miles: 330  },
    { from: 'Nashville', to: 'Philadelphia',     miles: 870  },
    { from: 'Memphis', to: 'Chicago',            miles: 530  },
    { from: 'Memphis', to: 'Atlanta',            miles: 395  },
    { from: 'Memphis', to: 'Dallas',             miles: 470  },
    { from: 'Memphis', to: 'Houston',            miles: 570  },
    { from: 'Memphis', to: 'Nashville',          miles: 210  },
    { from: 'Memphis', to: 'New Orleans',        miles: 395  },
    { from: 'Memphis', to: 'Kansas City',        miles: 450  },
    { from: 'Memphis', to: 'St. Louis',          miles: 285  },
    { from: 'Memphis', to: 'Los Angeles',        miles: 1820 },
    { from: 'Charlotte', to: 'Atlanta',          miles: 245  },
    { from: 'Charlotte', to: 'New York',         miles: 630  },
    { from: 'Charlotte', to: 'Chicago',          miles: 780  },
    { from: 'Charlotte', to: 'Nashville',        miles: 409  },
    { from: 'Charlotte', to: 'Miami',            miles: 650  },
    { from: 'Charlotte', to: 'Dallas',           miles: 1100 },
    { from: 'Charlotte', to: 'Houston',          miles: 1100 },
    { from: 'Charlotte', to: 'Philadelphia',     miles: 480  },
    // ── GREAT LAKES: Detroit / Columbus / Indianapolis ──
    { from: 'Detroit', to: 'Chicago',            miles: 280  },
    { from: 'Detroit', to: 'Atlanta',            miles: 730  },
    { from: 'Detroit', to: 'Dallas',             miles: 1200 },
    { from: 'Detroit', to: 'New York',           miles: 600  },
    { from: 'Detroit', to: 'Nashville',          miles: 480  },
    { from: 'Detroit', to: 'Columbus',           miles: 200  },
    { from: 'Detroit', to: 'Indianapolis',       miles: 280  },
    { from: 'Detroit', to: 'Houston',            miles: 1300 },
    { from: 'Detroit', to: 'Miami',              miles: 1380 },
    { from: 'Columbus', to: 'Chicago',           miles: 355  },
    { from: 'Columbus', to: 'Atlanta',           miles: 590  },
    { from: 'Columbus', to: 'New York',          miles: 530  },
    { from: 'Columbus', to: 'Nashville',         miles: 330  },
    { from: 'Columbus', to: 'Dallas',            miles: 1100 },
    { from: 'Columbus', to: 'Houston',           miles: 1200 },
    { from: 'Columbus', to: 'Miami',             miles: 1200 },
    { from: 'Indianapolis', to: 'Chicago',       miles: 180  },
    { from: 'Indianapolis', to: 'Atlanta',       miles: 490  },
    { from: 'Indianapolis', to: 'Nashville',     miles: 286  },
    { from: 'Indianapolis', to: 'Dallas',        miles: 900  },
    { from: 'Indianapolis', to: 'Houston',       miles: 1000 },
    { from: 'Indianapolis', to: 'New York',      miles: 730  },
    { from: 'Indianapolis', to: 'Miami',         miles: 1200 },
    // ── FLORIDA: Miami / Jacksonville / Tampa ──
    { from: 'Miami', to: 'Atlanta',              miles: 662  },
    { from: 'Miami', to: 'New York',             miles: 1280 },
    { from: 'Miami', to: 'Chicago',              miles: 1377 },
    { from: 'Miami', to: 'Dallas',               miles: 1308 },
    { from: 'Miami', to: 'Houston',              miles: 1190 },
    { from: 'Miami', to: 'Nashville',            miles: 1000 },
    { from: 'Miami', to: 'Charlotte',            miles: 650  },
    { from: 'Miami', to: 'Los Angeles',          miles: 2750 },
    { from: 'Miami', to: 'Denver',               miles: 2000 },
    { from: 'Jacksonville', to: 'Atlanta',       miles: 346  },
    { from: 'Jacksonville', to: 'New York',      miles: 1000 },
    { from: 'Jacksonville', to: 'Chicago',       miles: 1050 },
    { from: 'Jacksonville', to: 'Dallas',        miles: 1000 },
    { from: 'Jacksonville', to: 'Houston',       miles: 870  },
    { from: 'Jacksonville', to: 'Nashville',     miles: 600  },
    { from: 'Tampa', to: 'Atlanta',              miles: 460  },
    { from: 'Tampa', to: 'New York',             miles: 1200 },
    { from: 'Tampa', to: 'Chicago',              miles: 1250 },
    { from: 'Tampa', to: 'Dallas',               miles: 1100 },
    { from: 'Tampa', to: 'Houston',              miles: 1000 },
    // ── NEW ORLEANS / BATON ROUGE ──
    { from: 'New Orleans', to: 'Atlanta',        miles: 470  },
    { from: 'New Orleans', to: 'Houston',        miles: 350  },
    { from: 'New Orleans', to: 'Dallas',         miles: 505  },
    { from: 'New Orleans', to: 'Chicago',        miles: 920  },
    { from: 'New Orleans', to: 'Nashville',      miles: 530  },
    { from: 'New Orleans', to: 'Miami',          miles: 860  },
    { from: 'New Orleans', to: 'Los Angeles',    miles: 1900 },
    { from: 'New Orleans', to: 'Memphis',        miles: 395  },
  ];


  const commodities = [
    'Медицинское оборудование', 'Электроника', 'Продукты питания',
    'Автозапчасти', 'Строительные материалы', 'Одежда', 'Химикаты',
    'Мебель', 'Промышленное оборудование', 'Фармацевтика',
    'Бытовая техника', 'Косметика', 'Игрушки', 'Книги', 'Спортивные товары',
  ];

  const equipment: Array<'Dry Van' | 'Reefer' | 'Flatbed'> = ['Dry Van', 'Dry Van', 'Dry Van', 'Reefer', 'Flatbed'];

  // Генерируем 60-80 грузов случайным образом
  const numLoads = 60 + Math.floor(Math.random() * 21);
  const loads: LoadOffer[] = [];
  
  for (let i = 0; i < numLoads; i++) {
    const route = routes[Math.floor(Math.random() * routes.length)];
    const eq = equipment[Math.floor(Math.random() * equipment.length)];
    // $2.50 - $3.50/mile рыночная ставка, Reefer/Flatbed дороже
    const ratePerMile = eq === 'Dry Van'
      ? 2.50 + Math.random() * 1.00          // $2.50–$3.50
      : eq === 'Reefer'
      ? 3.00 + Math.random() * 1.00          // $3.00–$4.00
      : 3.20 + Math.random() * 1.20;         // $3.20–$4.40 Flatbed
    const market = Math.round(route.miles * ratePerMile / 50) * 50; // округляем до $50
    const posted = Math.round(market * (0.78 + Math.random() * 0.08) / 50) * 50; // брокер занижает на 14-22%
    const min = Math.round(market * 0.88 / 50) * 50;
    
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
      expiresAt: minute + 120 + Math.floor(Math.random() * 180), // живут 2-5 часов
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
  timeSpeed: 1,
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
  deliveryResults: [],

  dismissDeliveryResult: (loadId: string) => {
    set(s => ({ deliveryResults: s.deliveryResults.filter(r => r.loadId !== loadId) }));
  },

  startShift: async (truckCount: number = 3, sessionName: string = '') => {
    console.log(`🎮 Starting shift with ${truckCount} trucks, session: "${sessionName}"`);
    
    // Всегда сбрасываем старое сохранение и начинаем заново
    get().clearSave();

    // ── Начальные активные грузы (только едущие траки) ──
    const allInitialLoads = [INITIAL_LOAD_1, INITIAL_LOAD_2, INITIAL_LOAD_4, INITIAL_LOAD_6, INITIAL_LOAD_9];
    const selectedActiveLoads = allInitialLoads
      .filter(l => parseInt(l.truckId.replace('T','')) <= truckCount)
      .filter(l => l.phase === 'to_delivery'); // только те кто едет, не разгружается

    // ── Начальные письма ──
    const initialEmails: Notification[] = [
      {
        id: 'INIT-EMAIL-1',
        type: 'email',
        from: 'Tom (FastFreight LLC)',
        subject: '👋 Привет! Есть груз из Knoxville',
        message: `Привет!\n\nЯ Tom из FastFreight. Слышал, у тебя траки в Knoxville, TN?\n\nЕсть отличный груз:\nKnoxville, TN → Atlanta, GA\n$1,850 · 180 mi · Dry Van\nPickup сегодня 9:00 AM\n\nЕсли интересует — открой Load Board, найди груз и назначь трак. Работаем!`,
        minute: -5,
        read: false,
        priority: 'high',
        actionRequired: true,
      },
      {
        id: 'INIT-EMAIL-2',
        type: 'email',
        from: 'Sarah (QuickLoad Inc)',
        subject: '📋 Добро пожаловать в смену!',
        message: `Доброе утро!\n\nЯ Sarah, твой брокер из QuickLoad.\n\nСегодня хороший рынок в Tennessee и Georgia — ставки выше нормы на 10-15%.\n\nЕсли нужна помощь с грузом — пиши. Удачной смены! 🚛`,
        minute: -2,
        read: false,
        priority: 'low',
        actionRequired: false,
      },
    ];
    
    // Берём траки из INITIAL_TRUCKS с их реальными позициями и маршрутами
    const allTrucks = INITIAL_TRUCKS.slice(0, truckCount).map(truck => ({
      ...truck,
      // Новая смена — водители отдохнули, настроение хорошее
      mood: 75 + Math.floor(Math.random() * 15), // 75–90
      hoursLeft: 11,
      idleWarningLevel: 0 as 0 | 1 | 2 | 3,
      outOfOrderUntil: 0,
      status: truck.status === 'breakdown' ? 'idle' as const : truck.status,
      // Рандомная скорость 0.75–1.25 для каждого трака
      speedMultiplier: 0.75 + Math.random() * 0.5,
    }));

    // Загружаем OSRM маршруты для траков у которых есть destinationCity
    const trucksWithRoutes = await Promise.all(allTrucks.map(async (truck) => {
      if ((truck.status === 'driving' || truck.status === 'loaded') && truck.destinationCity && CITIES[truck.destinationCity]) {
        const dest = CITIES[truck.destinationCity];
        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${truck.position[0]},${truck.position[1]};${dest[0]},${dest[1]}?overview=full&geometries=geojson`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.routes && data.routes[0]) {
            console.log(`✅ Route loaded for ${truck.id}: ${truck.currentCity} → ${truck.destinationCity}`);
            return { ...truck, routePath: data.routes[0].geometry.coordinates };
          }
        } catch (e) {
          console.warn(`⚠️ Route failed for ${truck.id}, using linear movement`);
        }
      }
      return truck;
    }));

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
      availableLoads: [
        ...generateLoads(0),
        ...generateLoads(1),
        ...generateLoads(2),
      ],
      activeLoads: selectedActiveLoads,
      bookedLoads: [],
      activeEvents: [],
      resolvedEvents: [],
      notifications: initialEmails,
      unreadCount: initialEmails.filter(e => !e.read).length,
      pendingEmailResponses: [],
      deliveryResults: [],
    });
  },

  tickClock: async () => {
    if (get().phase !== 'playing') return; // не тикаем если смена завершена
    const { gameMinute, trucks, availableLoads, activeLoads, timeSpeed } = get();
    // 1 день = 20 реальных минут = 1200 тиков
    // 1 тик = 1440/1200 = 1.2 игровых минуты
    const TICK_MINUTES = 1.2 * (timeSpeed ?? 1);
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
    const newDeliveryResults: DeliveryResult[] = [];
    const updatedTrucks = await Promise.all(trucks.map(async (truck) => {

      // ── HOS: трак едет к Truck Stop (HOS ≤ 1.5ч) ──
      if ((truck as any).drivingToHosStop && truck.status !== 'waiting') {
        const stopPos = (truck as any).hosStopDestination as [number, number] | undefined;
        if (stopPos) {
          const dx = truck.position[0] - stopPos[0];
          const dy = truck.position[1] - stopPos[1];
          const distDeg = Math.sqrt(dx * dx + dy * dy);
          // Прибыл на Truck Stop (< 0.15 градуса ≈ ~10 миль)
          if (distDeg < 0.15 || truck.hoursLeft <= 0) {
            const stopName = (truck as any).hosStopDestName ?? 'Truck Stop';
            const stopType = (truck as any).hosStopType ?? 'truck_stop';
            get().addNotification({
              type: 'urgent', priority: 'high',
              from: `${truck.driver}`,
              subject: `🛑 ${truck.name} на отдыхе — ${stopName}`,
              message: `${truck.driver} припарковался на ${stopType === 'truck_stop' ? 'Truck Stop' : 'Rest Area'} "${stopName}". Обязательный отдых 10 часов. HOS будет сброшен.`,
              actionRequired: false,
              relatedTruckId: truck.id,
            });
            return {
              ...truck,
              status: 'waiting' as TruckStatus,
              position: stopPos,
              hosRestStartMinute: newMinute,
              hosStopPosition: stopPos,
              hosStopName: stopName,
              hosStopType: stopType,
              drivingToHosStop: false,
              destinationCity: null,
              routePath: null,
            } as any;
          }
          // Продолжаем движение к Truck Stop
          const speedMult = (truck as any).speedMultiplier ?? 1.0;
          const MILES_PER_TICK_HOS = (10 * TICK_MINUTES) / 3;
          const totalMilesDeg = Math.sqrt(
            Math.pow((stopPos[0] - truck.position[0]) * 69, 2) +
            Math.pow((stopPos[1] - truck.position[1]) * 69, 2)
          );
          const totalMiles = Math.max(totalMilesDeg, 10);
          const progressPerTick = (MILES_PER_TICK_HOS / totalMiles) * speedMult;
          const t = Math.min(1, progressPerTick);
          const newLng = truck.position[0] + (stopPos[0] - truck.position[0]) * t;
          const newLat = truck.position[1] + (stopPos[1] - truck.position[1]) * t;
          const newHoursLeft = Math.max(0, truck.hoursLeft - TICK_MINUTES / 60);
          return {
            ...truck,
            position: [newLng, newLat] as [number, number],
            hoursLeft: Math.round(newHoursLeft * 10) / 10,
          } as any;
        }
      }

      // ── HOS: предупреждение при 1.5ч — трак едет на ближайший Truck Stop ──
      if ((truck.status === 'driving' || truck.status === 'loaded') &&
          truck.hoursLeft <= 1.5 && truck.hoursLeft > 0 &&
          !(truck as any).drivingToHosStop) {
        const nearestStop = findNearestTruckStop(truck.position[0], truck.position[1], 'truck_stop');
        get().addNotification({
          type: 'urgent', priority: 'high',
          from: `${truck.driver} (ELD)`,
          subject: `⚠️ HOS — ${truck.name} едет на Truck Stop`,
          message: `${truck.driver} — осталось ${truck.hoursLeft.toFixed(1)}ч HOS. Трак направляется на "${nearestStop.name}" (${nearestStop.highway}, ${nearestStop.nearCity}). Обязательный отдых 10 часов.`,
          actionRequired: false,
          relatedTruckId: truck.id,
        });
        return {
          ...truck,
          drivingToHosStop: true,
          hosStopDestination: nearestStop.position,
          hosStopDestName: nearestStop.name,
          hosStopType: nearestStop.type,
          // Сохраняем текущий маршрут чтобы восстановить после отдыха
          preRestStatus: truck.status,
          preRestDestCity: truck.destinationCity,
          preRestProgress: truck.progress,
          preRestRoutePath: truck.routePath,
          resumeAfterRest: !!truck.currentLoad,
        } as any;
      }

      // ── 30-MIN MANDATORY BREAK: после 8ч вождения (FMCSA §395.3) ──
      // hoursLeft начинается с 11 → после 8ч вождения = hoursLeft ≤ 3.0
      if ((truck.status === 'driving' || truck.status === 'loaded') &&
          truck.hoursLeft <= 3.0 && truck.hoursLeft > 1.5 &&
          !(truck as any).mandatoryBreakDone &&
          !(truck as any).drivingToHosStop &&
          !(truck as any).onMandatoryBreak) {
        const nearestStop = findNearestTruckStop(truck.position[0], truck.position[1], 'rest_area');
        // Только один раз за смену — случайный шанс 40% за тик чтобы не все разом
        if (Math.random() < 0.4) {
          get().addNotification({
            type: 'email', priority: 'medium',
            from: `${truck.driver}`,
            subject: `☕ ${truck.name} — обязательный 30-мин перерыв`,
            message: `${truck.driver} остановился на "${nearestStop.name}" для обязательного 30-минутного перерыва (FMCSA §395.3 — после 8ч вождения). Продолжит через 30 минут.`,
            actionRequired: false,
            relatedTruckId: truck.id,
          });
          return {
            ...truck,
            onMandatoryBreak: true,
            mandatoryBreakStartMinute: newMinute,
            mandatoryBreakDuration: 30, // 30 игровых минут
            position: nearestStop.position,
            preRestStatus: truck.status,
            preRestDestCity: truck.destinationCity,
            preRestProgress: truck.progress,
            preRestRoutePath: truck.routePath,
            resumeAfterRest: !!truck.currentLoad,
          } as any;
        }
      }

      // ── 30-MIN BREAK: ждём пока закончится ──
      if ((truck as any).onMandatoryBreak) {
        const breakStart = (truck as any).mandatoryBreakStartMinute ?? newMinute;
        const breakDuration = (truck as any).mandatoryBreakDuration ?? 30;
        const elapsed = newMinute - breakStart;
        if (elapsed >= breakDuration) {
          // Перерыв закончен — продолжаем маршрут
          const preRestDest = (truck as any).preRestDestCity;
          const preRestPath = (truck as any).preRestRoutePath;
          const preRestProg = (truck as any).preRestProgress ?? truck.progress;
          get().addNotification({
            type: 'email', priority: 'low',
            from: `${truck.driver}`,
            subject: `✅ ${truck.name} продолжает маршрут`,
            message: `${truck.driver} завершил 30-минутный перерыв. Продолжает движение${preRestDest ? ` в ${preRestDest}` : ''}.`,
            actionRequired: false,
            relatedTruckId: truck.id,
          });
          return {
            ...truck,
            onMandatoryBreak: false,
            mandatoryBreakDone: true, // больше не останавливаем за эту смену
            mandatoryBreakStartMinute: undefined,
            status: ((truck as any).preRestStatus ?? truck.status) as TruckStatus,
            destinationCity: preRestDest ?? truck.destinationCity,
            progress: preRestProg,
            routePath: preRestPath ?? truck.routePath,
            preRestStatus: undefined,
            preRestDestCity: undefined,
            preRestProgress: undefined,
            preRestRoutePath: undefined,
          } as any;
        }
        return truck; // ждём
      }

      // ── НОЧНАЯ ОСТАНОВКА: 22:00-06:00 (игровое время) ──
      // Игровое время: gameMinute 0 = 08:43, 1 мин = 1 игровая минута
      // 22:00 = 08:43 + 13ч17мин = 797 мин от старта
      // 06:00 = 08:43 + 21ч17мин = 1277 мин (следующий день)
      const NIGHT_START = 797;  // ~22:00
      const NIGHT_END   = 1277; // ~06:00 следующего дня
      const isNightTime = newMinute >= NIGHT_START && newMinute <= NIGHT_END;
      if ((truck.status === 'driving' || truck.status === 'loaded') &&
          isNightTime &&
          !(truck as any).nightStopDone &&
          !(truck as any).onNightStop &&
          !(truck as any).drivingToHosStop &&
          !(truck as any).onMandatoryBreak) {
        // Шанс остановки на ночь: 25% за тик в ночное время (не все водители останавливаются)
        if (Math.random() < 0.25) {
          const nearestStop = findNearestTruckStop(truck.position[0], truck.position[1], 'truck_stop');
          const nightRestMinutes = 480 + Math.floor(Math.random() * 120); // 8-10 часов
          const hasLoad = !!truck.currentLoad;
          // Проверяем — может ли опоздать на доставку?
          const estimatedDelay = nightRestMinutes; // минут задержки
          const willBeLate = hasLoad && estimatedDelay > 120; // если задержка > 2ч — риск опоздания
          get().addNotification({
            type: 'email', priority: willBeLate ? 'high' : 'medium',
            from: `${truck.driver}`,
            subject: `🌙 ${truck.name} — ночёвка на ${nearestStop.name}`,
            message: `${truck.driver} остановился на ночёвку на "${nearestStop.name}". Отдых ~${Math.round(nightRestMinutes/60)}ч.${willBeLate ? `\n\n⚠️ ВНИМАНИЕ: Возможное опоздание на доставку в ${truck.destinationCity}! Свяжись с брокером.` : ''}`,
            actionRequired: willBeLate,
            relatedTruckId: truck.id,
          });
          return {
            ...truck,
            onNightStop: true,
            nightStopStartMinute: newMinute,
            nightStopDuration: nightRestMinutes,
            nightStopName: nearestStop.name,
            position: nearestStop.position,
            preRestStatus: truck.status,
            preRestDestCity: truck.destinationCity,
            preRestProgress: truck.progress,
            preRestRoutePath: truck.routePath,
            resumeAfterRest: hasLoad,
            // Помечаем что была ночёвка — для расчёта штрафа при доставке
            hadNightStop: true,
            nightStopDelayMinutes: ((truck as any).nightStopDelayMinutes ?? 0) + nightRestMinutes,
          } as any;
        }
      }

      // ── НОЧНАЯ ОСТАНОВКА: ждём пока закончится ──
      if ((truck as any).onNightStop) {
        const nightStart = (truck as any).nightStopStartMinute ?? newMinute;
        const nightDuration = (truck as any).nightStopDuration ?? 480;
        const elapsed = newMinute - nightStart;
        if (elapsed >= nightDuration) {
          const stopName = (truck as any).nightStopName ?? 'Truck Stop';
          const preRestDest = (truck as any).preRestDestCity;
          const preRestPath = (truck as any).preRestRoutePath;
          const preRestProg = (truck as any).preRestProgress ?? truck.progress;
          const shouldResume = (truck as any).resumeAfterRest && preRestDest;
          // Сбрасываем HOS после ночёвки (≥8ч = полный сброс)
          const newHoursLeft = nightDuration >= 480 ? 11 : truck.hoursLeft;
          get().addNotification({
            type: 'email', priority: 'low',
            from: `${truck.driver}`,
            subject: `☀️ ${truck.name} выезжает с ${stopName}`,
            message: `${truck.driver} отдохнул на "${stopName}" (${Math.round(nightDuration/60)}ч). HOS ${nightDuration >= 480 ? 'сброшен до 11ч' : `осталось ${newHoursLeft.toFixed(1)}ч`}. ${shouldResume ? `Продолжает маршрут в ${preRestDest}.` : 'Ждёт груз.'}`,
            actionRequired: false,
            relatedTruckId: truck.id,
          });
          if (shouldResume) {
            return {
              ...truck,
              onNightStop: false,
              nightStopDone: true,
              nightStopStartMinute: undefined,
              nightStopDuration: undefined,
              nightStopName: undefined,
              hoursLeft: newHoursLeft,
              status: ((truck as any).preRestStatus ?? 'loaded') as TruckStatus,
              destinationCity: preRestDest,
              progress: preRestProg,
              routePath: preRestPath ?? truck.routePath,
              preRestStatus: undefined,
              preRestDestCity: undefined,
              preRestProgress: undefined,
              preRestRoutePath: undefined,
            } as any;
          }
          return {
            ...truck,
            onNightStop: false,
            nightStopDone: true,
            nightStopStartMinute: undefined,
            nightStopDuration: undefined,
            nightStopName: undefined,
            hoursLeft: newHoursLeft,
            status: 'idle' as TruckStatus,
            idleSinceMinute: newMinute,
            idleWarningLevel: 0,
            preRestStatus: undefined,
            preRestDestCity: undefined,
            preRestProgress: undefined,
            preRestRoutePath: undefined,
          } as any;
        }
        return truck; // ждём
      }

      // ── HOS: трак исчерпал лимит — экстренная остановка ──
      if ((truck.status === 'driving' || truck.status === 'loaded') && truck.hoursLeft <= 0) {
        const nearestStop = findNearestTruckStop(truck.position[0], truck.position[1]);
        get().addNotification({
          type: 'urgent', priority: 'critical',
          from: `${truck.driver} (ELD)`,
          subject: `🚨 HOS нарушение — ${truck.name} остановлен`,
          message: `${truck.driver} исчерпал 11-часовой лимит вождения. ELD заблокировал трак. Остановился на "${nearestStop.name}" (${nearestStop.highway}). Обязательный отдых 10 часов. Нарушение записано!`,
          actionRequired: true,
          relatedTruckId: truck.id,
        });
        return {
          ...truck,
          status: 'waiting' as TruckStatus,
          position: nearestStop.position,
          hosRestStartMinute: newMinute,
          hosStopPosition: nearestStop.position,
          hosStopName: nearestStop.name,
          hosStopType: nearestStop.type,
          drivingToHosStop: false,
          hosViolations: truck.hosViolations + 1,
          complianceRate: Math.max(0, truck.complianceRate - 15),
        } as any;
      }

      // ── HOS: трак на отдыхе на Truck Stop — ждём 10 часов ──
      if (truck.status === 'waiting') {
        const restStart = (truck as any).hosRestStartMinute ?? newMinute;
        const restElapsed = newMinute - restStart;
        const restDone = restElapsed >= HOS_REST;
        if (restDone) {
          const stopName = (truck as any).hosStopName ?? 'Truck Stop';
          const shouldResume = (truck as any).resumeAfterRest && truck.currentLoad;
          const preRestDest = (truck as any).preRestDestCity;
          const preRestPath = (truck as any).preRestRoutePath;

          get().addNotification({
            type: 'email', priority: 'medium',
            from: `${truck.driver}`,
            subject: `✅ ${truck.name} отдохнул — выезжает с ${stopName}`,
            message: `${truck.driver} завершил 10-часовой отдых на "${stopName}". HOS сброшен до 11 часов. ${shouldResume ? `Продолжает маршрут в ${preRestDest}.` : 'Ждёт новый груз.'}`,
            actionRequired: false,
            relatedTruckId: truck.id,
          });

          if (shouldResume && preRestDest) {
            // Восстанавливаем маршрут после отдыха
            return {
              ...truck,
              status: (truck as any).preRestStatus ?? 'loaded' as TruckStatus,
              hoursLeft: 11,
              hosRestStartMinute: undefined,
              hosStopPosition: undefined,
              hosStopName: undefined,
              hosStopType: undefined,
              resumeAfterRest: undefined,
              preRestStatus: undefined,
              preRestDestCity: undefined,
              preRestProgress: undefined,
              preRestRoutePath: undefined,
              destinationCity: preRestDest,
              progress: (truck as any).preRestProgress ?? 0,
              routePath: preRestPath ?? null,
            } as any;
          }

          return {
            ...truck,
            status: 'idle' as TruckStatus,
            hoursLeft: 11,
            hosRestStartMinute: undefined,
            hosStopPosition: undefined,
            hosStopName: undefined,
            hosStopType: undefined,
            resumeAfterRest: undefined,
            preRestStatus: undefined,
            preRestDestCity: undefined,
            preRestProgress: undefined,
            preRestRoutePath: undefined,
            idleSinceMinute: newMinute,
            idleWarningLevel: 0,
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

      // ── at_delivery: разгрузка длится 30-120 игровых минут, detention после 120 мин ──
      if (truck.status === 'at_delivery' && truck.currentLoad) {
        const deliveryArrivalMinute = (truck as any).deliveryArrivalMinute ?? newMinute;
        // Случайная длительность разгрузки: 30-120 мин (задаётся при первом тике)
        const unloadDuration = (truck as any).unloadDuration ?? (5 + Math.floor(Math.random() * 11));
        const waitTime = newMinute - deliveryArrivalMinute;

        // Detention: после 120 игровых минут (2 часа) — уведомление
        if (waitTime >= 120 && !(truck as any).detentionNotified) {
          get().addNotification({
            type: 'detention', priority: 'high',
            from: truck.currentLoad.brokerName,
            subject: `⏰ Detention — ${truck.name} ждёт уже 2 часа`,
            message: `${truck.driver} на разгрузке в ${truck.currentLoad.toCity} уже 2 часа. Detention $75/час начался. Зафиксируй время и уведоми брокера!`,
            actionRequired: true,
            relatedTruckId: truck.id,
          });
          return { ...truck, deliveryArrivalMinute, unloadDuration, detentionNotified: true } as any;
        }

        
        // Разгрузка завершена
        if (waitTime >= unloadDuration) {
          const detentionHours = Math.max(0, Math.floor((waitTime - 120) / 60));
          const detentionPay = detentionHours * 75;
          const load = truck.currentLoad!;
          const miles = load.miles || 0;
          const agreedRate = load.agreedRate || 0;
          const fuelCost = Math.round(miles * 0.45);
          const driverPay = Math.round(miles * 0.55);
          const dispatchFee = Math.round(agreedRate * 0.08);
          const factoringFee = Math.round(agreedRate * 0.03);
          const lumperCost = Math.random() > 0.7 ? (Math.random() > 0.5 ? 300 : 150) : 0;
          // Выплаты за трак (~8%) и трейлер (~5%) от гросса — итого ~13%
          const truckPayment = Math.round(agreedRate * 0.08);
          const trailerPayment = Math.round(agreedRate * 0.05);
          const grossRevenue = agreedRate + detentionPay;
          const totalExpenses = fuelCost + driverPay + dispatchFee + factoringFee + lumperCost + truckPayment + trailerPayment;
          const netProfit = grossRevenue - totalExpenses;
          // Доп. расходы за поездку (поломки, шины, roadside)
          const tripExpArr = (truck as any).tripExpenses as Array<{ label: string; amount: number; minute: number }> ?? [];
          const roadsideCost = tripExpArr.filter((e: any) => e.label.includes('Roadside')).reduce((s: number, e: any) => s + e.amount, 0);
          const tireCost = tripExpArr.filter((e: any) => e.label.includes('шин') || e.label.includes('колес')).reduce((s: number, e: any) => s + e.amount, 0);
          const otherRepairCost = tripExpArr.filter((e: any) => !e.label.includes('Roadside') && !e.label.includes('шин') && !e.label.includes('колес')).reduce((s: number, e: any) => s + e.amount, 0);
          const tripExtraExpenses = tripExpArr.reduce((s: number, e: any) => s + e.amount, 0);
          // Штраф за опоздание: если была ночёвка которая сдвинула доставку
          const nightDelay = (truck as any).nightStopDelayMinutes ?? 0;
          // Считаем опоздание только если ночёвка добавила > 2ч задержки
          const lateDeliveryFine = nightDelay > 120 ? Math.round((nightDelay - 120) / 60) * 150 : 0;
          const adjustedNetProfit = netProfit - tripExtraExpenses - lateDeliveryFine;
          const deliveryResult: DeliveryResult = {
            truckId: truck.id, truckName: truck.name, driverName: truck.driver,
            loadId: load.id, fromCity: load.fromCity, toCity: load.toCity,
            miles, agreedRate, fuelCost, driverPay, dispatchFee, factoringFee,
            lumperCost, detentionPay, truckPayment, trailerPayment, grossRevenue,
            roadsideCost, tireCost, otherRepairCost, lateDeliveryFine, tripExtraExpenses,
            totalExpenses: totalExpenses + tripExtraExpenses + lateDeliveryFine,
            netProfit: adjustedNetProfit,
            ratePerMile: miles > 0 ? Math.round((agreedRate / miles) * 100) / 100 : 0,
            profitPerMile: miles > 0 ? Math.round((adjustedNetProfit / miles) * 100) / 100 : 0,
            minute: newMinute,
          };
          console.log('🎉 DeliveryResult created:', deliveryResult.loadId, deliveryResult.netProfit);
          newDeliveryResults.push(deliveryResult);
          get().addMoney(adjustedNetProfit, `Доставка ${load.fromCity}→${load.toCity}`);
          get().addNotification({
            type: 'email', priority: 'low',
            from: load.brokerName,
            subject: `✅ ${truck.name} доставил — ${load.fromCity}→${load.toCity}`,
            message: `${truck.driver}: разгрузился в ${load.toCity}, BOL подписан. Net: $${netProfit.toLocaleString()}${detentionPay > 0 ? ` + detention $${detentionPay}` : ''}`,
            actionRequired: false,
            relatedTruckId: truck.id,
          });
          const activeLoads = get().activeLoads.filter((l: any) => l.id !== load.id);
          set({ activeLoads });
          return {
            ...truck,
            status: 'idle' as TruckStatus,
            currentLoad: null,
            destinationCity: null,
            progress: 0,
            routePath: null,
            currentCity: load.toCity,
            idleSinceMinute: newMinute,
            idleWarningLevel: 0,
            deliveryArrivalMinute: undefined,
            unloadDuration: undefined,
            detentionNotified: undefined,
          };
        }
        return { ...truck, deliveryArrivalMinute, unloadDuration } as any;
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
      
      // ── IDLE WARNING: трак стоит слишком долго ──────────────────────
      if (truck.status === 'idle') {
        const idleSince = (truck as any).idleSinceMinute ?? newMinute;
        const idleMinutes = newMinute - idleSince;
        const idleHours = idleMinutes / 60;

        // Уровни предупреждения: 3ч=1(жёлтый), 4ч=2(оранжевый), 5ч=3(красный)
        let idleWarningLevel: 0|1|2|3 = 0;
        if (idleHours >= 5) idleWarningLevel = 3;
        else if (idleHours >= 4) idleWarningLevel = 2;
        else if (idleHours >= 3) idleWarningLevel = 1;

        // Уведомления при достижении порогов
        if (idleHours >= 3 && idleHours < 3.1 && (truck as any).idleWarningLevel < 1) {
          get().addNotification({
            type: 'urgent', priority: 'high',
            from: `${truck.driver} (${truck.name})`,
            subject: `⚠️ ${truck.name} стоит уже 3 часа`,
            message: `${truck.driver} ждёт груз уже 3 часа в ${truck.currentCity}. Трак выделен жёлтым на карте. Найди груз!`,
            actionRequired: true, relatedTruckId: truck.id,
          });
        }
        if (idleHours >= 5 && (truck as any).idleWarningLevel < 3) {
          get().addNotification({
            type: 'urgent', priority: 'critical',
            from: `${truck.driver} (${truck.name})`,
            subject: `🚨 ${truck.name} стоит уже 5 часов — критично!`,
            message: `${truck.driver} простаивает 5 часов! Трак красный на карте. Настроение падает, водитель может уйти. Срочно найди груз!`,
            actionRequired: true, relatedTruckId: truck.id,
          });
        }

        // Шанс полицейской инспекции для долго стоящего трака (раз в 30 мин)
        const outOfOrderUntil = (truck as any).outOfOrderUntil;
        if (outOfOrderUntil && newMinute < outOfOrderUntil) {
          // Трак на принудительном простое — ничего не делаем
          return { ...truck, idleSinceMinute: idleSince, idleWarningLevel } as any;
        }

        if (idleHours >= 3 && Math.floor(newMinute / 30) > Math.floor((newMinute - TICK_MINUTES) / 30)) {
          const inspectionChance = idleHours >= 5 ? 0.15 : 0.05;
          if (Math.random() < inspectionChance) {
            const violations = ['превышение HOS', 'неисправность тормозов', 'нарушение весового контроля', 'просроченные документы'];
            const violation = violations[Math.floor(Math.random() * violations.length)];
            const outUntil = newMinute + 1440; // 24 игровых часа = 1440 минут
            get().addNotification({
              type: 'urgent', priority: 'critical',
              from: 'DOT Inspector',
              subject: `🚔 ${truck.name} остановлен полицией — Violation!`,
              message: `Инспектор DOT остановил ${truck.name} в ${truck.currentCity}.\n\nНарушение: ${violation}\n\nТрак поставлен OUT OF SERVICE на 24 часа. Необходимо устранить нарушение и пройти повторную инспекцию.\n\nДействия: свяжись с водителем и реши проблему!`,
              actionRequired: true, relatedTruckId: truck.id,
            });
            return {
              ...truck,
              idleSinceMinute: idleSince,
              idleWarningLevel: 3,
              outOfOrderUntil: outUntil,
              hosViolations: truck.hosViolations + 1,
              complianceRate: Math.max(0, truck.complianceRate - 10),
            } as any;
          }
        }

        // Mood дрейф: при простое падает медленно, стремится к 65 как норме
        const TARGET_MOOD = 65;
        let newMood = truck.mood ?? 65;
        if (idleHours > 1) {
          // Простой > 1 часа — mood падает (0.5 за тик ~каждые 5 мин)
          newMood = Math.max(20, newMood - 0.3);
        } else if (newMood > TARGET_MOOD) {
          // Выше нормы — медленно возвращается к 65
          newMood = Math.max(TARGET_MOOD, newMood - 0.5);
        } else if (newMood < TARGET_MOOD) {
          // Ниже нормы — медленно восстанавливается
          newMood = Math.min(TARGET_MOOD, newMood + 0.2);
        }

        return { ...truck, idleSinceMinute: idleSince, idleWarningLevel, mood: Math.round(newMood) } as any;
      }

      // Сбрасываем idle счётчик когда трак начинает ехать
      if ((truck as any).idleSinceMinute !== undefined) {
        // В пути — mood чуть растёт (водитель доволен что едет)
        const drivingMood = Math.min(72, (truck.mood ?? 65) + 0.1);
        return { ...truck, idleSinceMinute: undefined, idleWarningLevel: 0, mood: Math.round(drivingMood) } as any;
      }

      // Двигаем трак только если он реально едет с грузом
      if ((truck.status === 'driving' || truck.status === 'loaded') && truck.destinationCity) {
        const to = CITIES[truck.destinationCity];
        if (!to) return truck;

        // Защита: loaded без груза — переводим в idle
        if (truck.status === 'loaded' && !truck.currentLoad) {
          return {
            ...truck,
            status: 'idle' as TruckStatus,
            destinationCity: null,
            progress: 0,
            routePath: null,
            idleSinceMinute: newMinute,
            idleWarningLevel: 0,
          } as any;
        }

        // Расстояние маршрута
        let totalMiles = 500;
        if (truck.status === 'loaded' && truck.currentLoad) {
          // Едет к delivery — используем мили груза
          totalMiles = truck.currentLoad.miles;
        } else if (truck.status === 'driving') {
          // Едет к pickup (deadhead) — считаем по координатам
          const from = CITIES[truck.currentCity] || truck.position;
          const dx = to[0] - from[0];
          const dy = to[1] - from[1];
          const calcMiles = Math.round(Math.sqrt(dx * dx + dy * dy) * 69);
          totalMiles = Math.max(calcMiles, 50); // минимум 50 миль чтобы не зависнуть
        } else if (truck.currentLoad) {
          totalMiles = truck.currentLoad.miles;
        } else {
          const from = CITIES[truck.currentCity] || truck.position;
          const dx = to[0] - from[0];
          const dy = to[1] - from[1];
          totalMiles = Math.max(Math.round(Math.sqrt(dx * dx + dy * dy) * 69), 50);
        }

        // 10 миль/игровую минуту × 1.2 мин/тик = 12 миль/тик
        // Каждый трак имеет свой speedMultiplier для рандомизации
        const speedMult = (truck as any).speedMultiplier ?? 1.0;
        const progressPerTick = (MILES_PER_TICK / totalMiles) * speedMult;
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
          
          return { ...truck, progress: newProgress, position: [lng, lat] as [number, number], hoursLeft: newHoursLeft, currentCity: getNearestCity(lng, lat) };
        } else if (truck.destinationCity && CITIES[truck.destinationCity]) {
          // Fallback: линейное движение если нет routePath
          const dest = CITIES[truck.destinationCity];
          const startPos = truck.routePath ? truck.position : (CITIES[truck.currentCity] || truck.position);
          const totalProgress = truck.progress + progressPerTick;
          const t = Math.min(totalProgress, 1);
          const lng = startPos[0] + (dest[0] - startPos[0]) * t;
          const lat = startPos[1] + (dest[1] - startPos[1]) * t;
          return { ...truck, progress: Math.min(newProgress, 0.99), position: [lng, lat] as [number, number], hoursLeft: newHoursLeft, currentCity: getNearestCity(lng, lat) };
        } else {
          return truck;
        }
      }
      return truck;
    }));

    // Убираем истёкшие грузы (но не добавляем новые автоматически)
    const freshLoads = availableLoads.filter(l => l.expiresAt > newMinute);
    const newLoads: any[] = [];

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
          message: 'Разгрузился, BOL подписан. Свободен. Куда дальше?',
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
      
      // Если есть replyToNotifId — добавляем ответ брокера в тот же тред
      if (response.replyToNotifId) {
        get().addReplyToNotification(response.replyToNotifId, {
          from: response.from,
          message,
          minute: newMinute,
          isMe: false,
        });
        // Помечаем тред как непрочитанный (новый ответ)
        const notifications = get().notifications.map(n =>
          n.id === response.replyToNotifId ? { ...n, read: false } : n
        );
        set({ notifications, unreadCount: notifications.filter(n => !n.read).length });
      } else {
        // Нет треда — создаём новое уведомление (старое поведение для случайных событий)
        get().addNotification({
          type: 'email',
          priority,
          from: response.from,
          subject: response.subject,
          message,
          actionRequired: false,
        });
      }
    });
    
    // Обновляем список отложенных ответов
    if (triggeredResponses.length > 0) {
      set({ pendingEmailResponses: remainingResponses });
    }

    // Случайные события каждые 32 игровых минуты (50% шанс)
    if (newMinute % 32 === 0 && newMinute > 0 && Math.random() < 0.5) {
      setTimeout(() => get().triggerRandomEvent(), 500);
    }

    set((s: any) => ({
      gameMinute: newMinute,
      trucks: updatedTrucks,
      availableLoads: [...freshLoads, ...newLoads],
      ...(newDeliveryResults.length > 0 ? { deliveryResults: [...(s.deliveryResults || []), ...newDeliveryResults] } : {}),
    }));
    
    // Автосохранение каждые 60 игровых минут (≈ 50 реальных секунд)
    if (Math.floor(newMinute / 60) > Math.floor(gameMinute / 60)) {
      get().saveGame();
    }
  },

  triggerRandomEvent: () => {
    const { trucks, activeLoads, gameMinute } = get();
    const drivingTrucks = trucks.filter(t => t.status === 'driving' || t.status === 'loaded');
    const allActiveTrucks = trucks.filter(t => t.status !== 'idle');
    
    if (allActiveTrucks.length === 0) return;
    
    // Взвешенные вероятности — частые события чаще
    const eventPool = [
      'driver_question', 'driver_question', 'driver_question',
      'broker_call', 'broker_call',
      'detention', 'detention',
      'weather_delay', 'weather_delay',
      'inspection',
      'fuel_issue',
      'breakdown',
      'rate_increase',
      'tire_blowout',
      'traffic_jam',
      'shipper_closed',
    ];
    
    const eventType = eventPool[Math.floor(Math.random() * eventPool.length)];
    const truck = drivingTrucks.length > 0
      ? drivingTrucks[Math.floor(Math.random() * drivingTrucks.length)]
      : allActiveTrucks[Math.floor(Math.random() * allActiveTrucks.length)];
    
    switch (eventType) {
      case 'breakdown': {
        // Реальная поломка — трак останавливается
        const repairCost = 300 + Math.floor(Math.random() * 700);
        const updatedTrucks = trucks.map(t =>
          t.id === truck.id ? { ...t, status: 'breakdown' as any, outOfOrderUntil: gameMinute + 60 + Math.floor(Math.random() * 120) } : t
        );
        set({ trucks: updatedTrucks });
        get().removeMoney(repairCost, `Ремонт ${truck.name} — поломка двигателя`);
        get().addNotification({
          type: 'text', priority: 'critical', from: truck.driver,
          subject: '🚨 Поломка трака!',
          message: `${truck.name} сломался возле ${truck.currentCity}! Двигатель перегрелся. Вызвал техпомощь, ремонт ~$${repairCost}. Простой 1-3 часа.`,
          actionRequired: true, relatedTruckId: truck.id,
        });
        window.dispatchEvent(new CustomEvent('mapToast', { detail: { message: `🚨 ${truck.name} сломался!`, color: '#ef4444' } }));
        break;
      }
        
      case 'tire_blowout': {
        const cost = 200 + Math.floor(Math.random() * 300);
        get().removeMoney(cost, `Замена шины ${truck.name}`);
        get().addNotification({
          type: 'text', priority: 'high', from: truck.driver,
          subject: '💥 Пробило колесо',
          message: `Пробило шину на трассе. Уже меняю, задержка ~40 минут. Стоимость: $${cost}.`,
          actionRequired: false, relatedTruckId: truck.id,
        });
        window.dispatchEvent(new CustomEvent('mapToast', { detail: { message: `💥 ${truck.name} — пробило колесо`, color: '#f97316' } }));
        break;
      }
        
      case 'detention': {
        const hours = 2 + Math.floor(Math.random() * 3);
        const detentionPay = hours * 50;
        get().addNotification({
          type: 'text', priority: 'high', from: truck.driver,
          subject: '⏰ Detention',
          message: `Жду на ${truck.currentLoad?.fromCity || truck.currentCity} уже ${hours} часов. Detention $${detentionPay}. Требовать оплату у брокера?`,
          actionRequired: true, relatedTruckId: truck.id,
        });
        break;
      }
        
      case 'driver_question': {
        const questions = [
          'Где остановиться на ночь? HOS заканчивается через 2 часа.',
          'Груз тяжелее чем в BOL на 800 lbs. Везти или отказаться?',
          'На весах показали перегруз 500 фунтов. Что делать?',
          'Шиппер просит подписать дополнительные документы. Подписывать?',
          'Ресивер закрыт, охранник говорит приезжать завтра. Что делать?',
          'Lumper fee $250 — шиппер говорит мы платим. Правда?',
          'GPS показывает объезд +40 миль. Ехать по GPS или по старому маршруту?',
        ];
        get().addNotification({
          type: 'text', priority: 'medium', from: truck.driver,
          subject: '❓ Вопрос водителя',
          message: questions[Math.floor(Math.random() * questions.length)],
          actionRequired: true, relatedTruckId: truck.id,
        });
        break;
      }
        
      case 'weather_delay': {
        const delays = [
          { weather: 'Сильный снегопад', hours: 2 },
          { weather: 'Ледяной дождь', hours: 3 },
          { weather: 'Торнадо предупреждение', hours: 1 },
          { weather: 'Густой туман', hours: 1 },
        ];
        const d = delays[Math.floor(Math.random() * delays.length)];
        get().addNotification({
          type: 'text', priority: 'medium', from: truck.driver,
          subject: `🌨️ ${d.weather}`,
          message: `${d.weather} на маршруте. Дорога опасна. Задержка ~${d.hours} часа.`,
          actionRequired: false, relatedTruckId: truck.id,
        });
        window.dispatchEvent(new CustomEvent('mapToast', { detail: { message: `🌨️ ${truck.name} — ${d.weather}`, color: '#5ac8fa' } }));
        break;
      }
        
      case 'inspection': {
        const passed = Math.random() > 0.3;
        const fine = passed ? 0 : 250 + Math.floor(Math.random() * 500);
        if (!passed) {
          get().removeMoney(fine, `Штраф DOT инспекция — ${truck.name}`);
          const updatedTrucks = trucks.map(t =>
            t.id === truck.id ? { ...t, safetyScore: Math.max(50, (t.safetyScore || 100) - 5), hosViolations: (t.hosViolations || 0) + 1 } : t
          );
          set({ trucks: updatedTrucks });
        }
        get().addNotification({
          type: 'text', priority: 'high', from: truck.driver,
          subject: passed ? '🚔 DOT инспекция — ОК' : '🚔 DOT инспекция — ШТРАФ!',
          message: passed
            ? 'Остановили на весах. Всё чисто, отпустили через 20 минут.'
            : `Инспекция нашла нарушение. Штраф $${fine}. Safety score снижен.`,
          actionRequired: false, relatedTruckId: truck.id,
        });
        break;
      }
        
      case 'fuel_issue':
        get().addNotification({
          type: 'text', priority: 'medium', from: truck.driver,
          subject: '⛽ Топливо',
          message: 'Топливная карта не работает на этой заправке. Заправиться за наличные ($180) или искать другую?',
          actionRequired: true, relatedTruckId: truck.id,
        });
        break;
        
      case 'traffic_jam':
        get().addNotification({
          type: 'text', priority: 'low', from: truck.driver,
          subject: '🚗 Пробка',
          message: `Пробка на I-${Math.floor(Math.random() * 95) + 5}. Задержка ~45 минут. Навигатор ищет объезд.`,
          actionRequired: false, relatedTruckId: truck.id,
        });
        break;
        
      case 'shipper_closed':
        get().addNotification({
          type: 'text', priority: 'high', from: truck.driver,
          subject: '🔒 Шиппер закрыт',
          message: `Приехал на ${truck.currentLoad?.fromCity || truck.currentCity} — ворота закрыты, никого нет. Звоню брокеру. Что делать?`,
          actionRequired: true, relatedTruckId: truck.id,
        });
        break;
        
      case 'broker_call': {
        const brokerNames = ['Tom (FastFreight)', 'Sarah (LoadMax)', 'Mike (FreightPro)', 'Lisa (CargoLink)'];
        get().addNotification({
          type: 'missed_call', priority: 'medium',
          from: brokerNames[Math.floor(Math.random() * brokerNames.length)],
          subject: '📞 Пропущенный звонок',
          message: 'Брокер звонил 2 раза. Возможно срочный груз или вопрос по текущей доставке.',
          actionRequired: true,
        });
        break;
      }
        
      case 'rate_increase':
        if (truck.currentLoad) {
          const bonus = 100 + Math.floor(Math.random() * 200);
          get().addNotification({
            type: 'email', priority: 'high',
            from: `${truck.currentLoad.brokerName} - ${truck.currentLoad.brokerCompany}`,
            subject: '💰 Повышение ставки!',
            message: `Good news! Shipper increased the rate by $${bonus}. Your new total: $${(truck.currentLoad.agreedRate + bonus).toLocaleString()}`,
            actionRequired: false, relatedTruckId: truck.id, relatedLoadId: truck.currentLoad.id,
          });
          const updatedTrucks = trucks.map(t => {
            if (t.id === truck.id && t.currentLoad) {
              return { ...t, currentLoad: { ...t.currentLoad, agreedRate: t.currentLoad.agreedRate + bonus } };
            }
            return t;
          });
          set({ trucks: updatedTrucks });
          get().addMoney(bonus, `Rate increase — ${truck.name}`);
          window.dispatchEvent(new CustomEvent('mapToast', { detail: { message: `💰 ${truck.name} +$${bonus} rate increase!`, color: '#30d158' } }));
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
          idleSinceMinute: undefined,
          idleWarningLevel: 0 as 0,
          // Сбрасываем флаги перерывов для нового рейса
          mandatoryBreakDone: false,
          nightStopDone: false,
          hadNightStop: false,
          nightStopDelayMinutes: 0,
          onMandatoryBreak: false,
          onNightStop: false,
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
    const minute = get().gameMinute;
    set({ availableLoads: [
      ...generateLoads(minute),
      ...generateLoads(minute + 1),
    ]});
  },

  setLoadBoardSearch: (city: string) => {
    set({ loadBoardSearchFrom: city });
  },

  setTimeSpeed: (speed: 1 | 2 | 5) => {
    set({ timeSpeed: speed });
  },

  endShift: () => {
    const state = get();
    // Если мы уже на экране shift_end — значит нажали "Новая смена"
    if (state.phase === 'shift_end') {
      const newDay = (state.day || 1) + 1;
      const updatedTrucks = state.trucks.map(truck => ({
        ...truck,
        hoursLeft: 11,
        status: truck.status === 'waiting' ? 'idle' as any : truck.status,
      }));
      set({
        phase: 'playing',
        day: newDay,
        gameMinute: 0,
        trucks: updatedTrucks,
      });
      get().saveGame();
      return;
    }
    // Первый вызов — показываем попап итогов
    set({ phase: 'shift_end' });
  },

  saveGame: () => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('⚠️ localStorage not available');
        return;
      }
      const state = get();
      const saveData = {
        version: 4,
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
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('⚠️ localStorage not available');
        return false;
      }
      const saved = localStorage.getItem('dispatcher-game-save');
      if (!saved) return false;
      
      const saveData = JSON.parse(saved);

      // Сбрасываем старые сохранения без версии или с устаревшей версией
      if (!saveData.version || saveData.version < 4) {
        localStorage.removeItem('dispatcher-game-save');
        console.log('🔄 Old save detected, resetting...');
        return false;
      }

      // Сбрасываем сохранения со старым количеством траков (> 5)
      if (saveData.trucks && saveData.trucks.length > 5) {
        localStorage.removeItem('dispatcher-game-save');
        console.log('🔄 Old save with too many trucks, resetting...');
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
        trucks: saveData.trucks.map((t: any) => ({
          ...t,
          // Сбрасываем outOfOrderUntil если оно устарело или некорректно
          outOfOrderUntil: (t.outOfOrderUntil && t.outOfOrderUntil > saveData.gameMinute) ? t.outOfOrderUntil : 0,
          // Если трак был в поломке — восстанавливаем в idle (новая смена = свежий старт)
          status: t.status === 'breakdown' ? 'idle' : t.status,
          // Восстанавливаем HOS и настроение до нормы
          hoursLeft: Math.max(t.hoursLeft ?? 11, 8),
          mood: Math.max(t.mood ?? 75, 70),
          // Сбрасываем idle счётчик — чтобы не было красного с первой секунды
          idleSinceMinute: saveData.gameMinute,
          idleWarningLevel: 0,
        })),
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
        deliveryResults: [],
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
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('⚠️ localStorage not available');
        return;
      }
      localStorage.removeItem('dispatcher-game-save');
      console.log('✅ Save cleared');
    } catch (error) {
      console.error('❌ Failed to clear save:', error);
    }
  },

  dismissDeliveryResult: (loadId: string) => {
    set((s: any) => ({
      deliveryResults: (s.deliveryResults || []).filter((r: DeliveryResult) => r.loadId !== loadId),
    }));
  },

  testDeliveryPopup: () => {
    const testResult: DeliveryResult = {
      truckId: 'T1', truckName: 'Truck 1047', driverName: 'John Martinez',
      loadId: `TEST-${Date.now()}`, fromCity: 'Chicago', toCity: 'Houston',
      miles: 1092, agreedRate: 2700,
      fuelCost: 491, driverPay: 601, dispatchFee: 216, factoringFee: 81, lumperCost: 0,
      detentionPay: 0, grossRevenue: 2700, totalExpenses: 1389, netProfit: 1311,
      ratePerMile: 2.47, profitPerMile: 1.20, minute: get().gameMinute,
    };
    set((s: any) => ({ deliveryResults: [...(s.deliveryResults || []), testResult] }));
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

  addReplyToNotification: (notifId: string, reply: NotificationReply) => {
    const notifications = get().notifications.map(n =>
      n.id === notifId
        ? { ...n, replies: [...(n.replies || []), reply] }
        : n
    );
    set({ notifications });
  },

  sendEmail: (params: { to: string; subject: string; body: string; isReply: boolean; replyToId?: string }) => {
    const { to, subject, body, isReply, replyToId } = params;
    
    console.log(`📧 Email sent to ${to}: ${subject}`);
    
    // Если это ответ — добавляем сообщение игрока в тред (не создаём новое уведомление)
    if (replyToId) {
      get().markNotificationRead(replyToId);
      get().addReplyToNotification(replyToId, {
        from: 'Я',
        message: body,
        minute: get().gameMinute,
        isMe: true,
      });
    }
    
    // Определяем тип запроса по теме письма
    const isDetentionRequest = subject.toLowerCase().includes('detention');
    const isPODRequest = subject.toLowerCase().includes('pod');
    const isRateConRequest = subject.toLowerCase().includes('rate con');
    const isIssueReport = subject.toLowerCase().includes('issue') || subject.toLowerCase().includes('problem');
    
    // Планируем ответ брокера через игровое время (2-5 минут)
    const responseTime = get().gameMinute + Math.floor(Math.random() * 3) + 2;
    
    // Создаём отложенный ответ — привязываем к тому же треду
    const pendingResponse: PendingEmailResponse = {
      triggerAt: responseTime,
      from: to,
      subject: isReply ? subject : `Re: ${subject}`,
      isDetention: isDetentionRequest,
      isPOD: isPODRequest,
      isRateCon: isRateConRequest,
      isIssue: isIssueReport,
      replyToNotifId: replyToId, // ответ брокера идёт в тот же тред
    };
    
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
  
  // Формат: 14:00 (2:00 PM)
  return `${h24}:${m} (${h12}:${m} ${ampm})`;
}

export function formatTimeShort(minute: number): string {
  const roundedMinute = Math.round(minute);
  const totalMinutes = SHIFT_START_HOUR * 60 + SHIFT_START_MINUTE + roundedMinute;
  const hours = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 || 12;
  const m = mins.toString().padStart(2, '0');
  return `${h12}:${m} ${ampm}`;
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



