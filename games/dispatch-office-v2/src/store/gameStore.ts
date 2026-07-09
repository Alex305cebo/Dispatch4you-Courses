// ═══════════════════════════════════════════════════════
//  gameStore.ts — главный store (Zustand)
//  Чистая архитектура: минимум логики в store,
//  вся бизнес-логика в game/*.ts
// ═══════════════════════════════════════════════════════
import { create } from 'zustand';
import type { GameSession, Truck, Load, Message, GameEvent } from '@/types';
import type { NegotiationState } from '@/game/negotiation';
import { INITIAL_NEGOTIATION } from '@/game/negotiation';
import type { DeliveryResult } from '@/game/delivery';
import type { WeatherZone } from '@/game/weather';

export type TimeSpeed = 1 | 2 | 5 | 10;
export type GamePhase = 'loading' | 'playing' | 'day_end' | 'paused';
export type ActivePanel = 'none' | 'loadboard' | 'chat' | 'finance';

interface GameState {
  // Core
  session: GameSession | null;
  phase: GamePhase;
  timeSpeed: TimeSpeed;
  activePanel: ActivePanel;

  // Selection
  selectedTruckId: string | null;

  // Negotiation
  negotiation: NegotiationState;

  // Delivery results (popup queue)
  deliveryResults: DeliveryResult[];

  // Weather
  weatherZones: WeatherZone[];

  // ─── ACTIONS ───

  // Session
  initSession: (truckCount: 3 | 4 | 5, name?: string) => void;
  loadSession: (session: GameSession) => void;
  clearSession: () => void;
  setPhase: (phase: GamePhase) => void;

  // Time
  setTimeSpeed: (speed: TimeSpeed) => void;
  tickGameTime: (minutes: number) => void;

  // UI
  setActivePanel: (panel: ActivePanel) => void;
  selectTruck: (id: string | null) => void;

  // Trucks
  updateTruck: (id: string, updater: (t: Truck) => Truck) => void;
  setTrucks: (trucks: Truck[]) => void;

  // Loads
  addLoads: (loads: Load[]) => void;
  removeLoad: (id: string) => void;
  updateLoad: (id: string, updater: (l: Load) => Load) => void;
  bookLoad: (loadId: string, truckId: string, agreedRate: number) => void;

  // Messages
  addMessage: (msg: Message) => void;
  markMessageRead: (id: string) => void;

  // Events
  addEvent: (event: GameEvent) => void;
  resolveEvent: (id: string) => void;

  // Finance
  adjustBalance: (delta: number) => void;

  // Negotiation
  openNegotiation: (loadId: string, postedRate: number, brokerName: string) => void;
  updateNegotiation: (update: Partial<NegotiationState>) => void;
  closeNegotiation: () => void;

  // Delivery
  addDeliveryResult: (result: DeliveryResult) => void;
  dismissDeliveryResult: () => void;

  // Weather
  setWeatherZones: (zones: WeatherZone[]) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  session: null,
  phase: 'loading',
  timeSpeed: 1,
  activePanel: 'none',
  selectedTruckId: null,
  negotiation: INITIAL_NEGOTIATION,
  deliveryResults: [],
  weatherZones: [],

  // ─── SESSION ───
  initSession: (truckCount, name) => {
    const now = Date.now();
    const session: GameSession = {
      id: `sess_${now}`,
      name: name || `Смена · ${truckCount} трака`,
      createdAt: now,
      lastPlayedAt: now,
      truckCount,
      day: 1,
      balance: 15000, // стартовый баланс из Game One
      totalEarned: 0,
      totalSpent: 0,
      trucks: [],
      loads: [],
      brokers: [],
      messages: [],
      events: [],
      finance: [],
      gameTime: 0, // начало в 06:00 (0 = начало смены)
    };
    set({ session, phase: 'playing', selectedTruckId: null });
  },

  loadSession: (session) => set({ session, phase: 'playing' }),
  clearSession: () => set({ session: null, phase: 'loading', selectedTruckId: null }),
  setPhase: (phase) => set({ phase }),

  // ─── TIME ───
  setTimeSpeed: (speed) => set({ timeSpeed: speed }),
  tickGameTime: (minutes) =>
    set((state) => {
      if (!state.session) return state;
      return {
        session: { ...state.session, gameTime: state.session.gameTime + minutes },
      };
    }),

  // ─── UI ───
  setActivePanel: (panel) => set((s) => ({ activePanel: s.activePanel === panel ? 'none' : panel })),
  selectTruck: (id) => set({ selectedTruckId: id }),

  // ─── TRUCKS ───
  setTrucks: (trucks) =>
    set((state) => {
      if (!state.session) return state;
      return { session: { ...state.session, trucks } };
    }),

  updateTruck: (id, updater) =>
    set((state) => {
      if (!state.session) return state;
      return {
        session: {
          ...state.session,
          trucks: state.session.trucks.map((t) => (t.id === id ? updater(t) : t)),
        },
      };
    }),

  // ─── LOADS ───
  addLoads: (loads) =>
    set((state) => {
      if (!state.session) return state;
      return { session: { ...state.session, loads: [...state.session.loads, ...loads] } };
    }),

  removeLoad: (id) =>
    set((state) => {
      if (!state.session) return state;
      return { session: { ...state.session, loads: state.session.loads.filter((l) => l.id !== id) } };
    }),

  updateLoad: (id, updater) =>
    set((state) => {
      if (!state.session) return state;
      return {
        session: {
          ...state.session,
          loads: state.session.loads.map((l) => (l.id === id ? updater(l) : l)),
        },
      };
    }),

  bookLoad: (loadId, truckId, agreedRate) =>
    set((state) => {
      if (!state.session) return state;
      return {
        session: {
          ...state.session,
          loads: state.session.loads.map((l) =>
            l.id === loadId ? { ...l, status: 'booked' as const, bookedByTruckId: truckId, rate: agreedRate } : l
          ),
          trucks: state.session.trucks.map((t) =>
            t.id === truckId
              ? { ...t, status: 'driving' as const, currentLoadId: loadId, routeProgress: 0 }
              : t
          ),
        },
      };
    }),

  // ─── MESSAGES ───
  addMessage: (msg) =>
    set((state) => {
      if (!state.session) return state;
      return { session: { ...state.session, messages: [msg, ...state.session.messages] } };
    }),

  markMessageRead: (id) =>
    set((state) => {
      if (!state.session) return state;
      return {
        session: {
          ...state.session,
          messages: state.session.messages.map((m) => (m.id === id ? { ...m, read: true } : m)),
        },
      };
    }),

  // ─── EVENTS ───
  addEvent: (event) =>
    set((state) => {
      if (!state.session) return state;
      return { session: { ...state.session, events: [event, ...state.session.events] } };
    }),

  resolveEvent: (id) =>
    set((state) => {
      if (!state.session) return state;
      return {
        session: {
          ...state.session,
          events: state.session.events.map((e) => (e.id === id ? { ...e, resolved: true } : e)),
        },
      };
    }),

  // ─── FINANCE ───
  adjustBalance: (delta) =>
    set((state) => {
      if (!state.session) return state;
      return {
        session: {
          ...state.session,
          balance: state.session.balance + delta,
          totalEarned: delta > 0 ? state.session.totalEarned + delta : state.session.totalEarned,
          totalSpent: delta < 0 ? state.session.totalSpent + Math.abs(delta) : state.session.totalSpent,
        },
      };
    }),

  // ─── NEGOTIATION ───
  openNegotiation: (loadId, postedRate, brokerName) =>
    set({
      negotiation: {
        ...INITIAL_NEGOTIATION,
        open: true,
        loadId,
        postedRate,
        currentOffer: postedRate,
        brokerName,
      },
    }),

  updateNegotiation: (update) =>
    set((state) => ({ negotiation: { ...state.negotiation, ...update } })),

  closeNegotiation: () => set({ negotiation: INITIAL_NEGOTIATION }),

  // ─── DELIVERY ───
  addDeliveryResult: (result) =>
    set((state) => ({ deliveryResults: [...state.deliveryResults, result] })),

  dismissDeliveryResult: () =>
    set((state) => ({ deliveryResults: state.deliveryResults.slice(1) })),

  // ─── WEATHER ───
  setWeatherZones: (zones) => set({ weatherZones: zones }),
}));
