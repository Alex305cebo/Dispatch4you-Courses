// ═══════════════════════════════════════════════════════
//  TickEngine.tsx — игровой цикл V2
//
//  Полный цикл доставки:
//  idle → driving(to_pickup) → at_pickup → driving(to_delivery) → at_delivery → idle
// ═══════════════════════════════════════════════════════
import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useNotificationStore } from '@/store/notificationStore';
import { positionAlongRoute } from '@/utils/geo';
import { fetchRoute } from '@/utils/routeService';
import { isLoadExpired, generateLoads } from './loadGenerator';
import { generateRandomEvent, shouldTriggerEvent } from './events';
import { generateWeatherZones } from './weather';
import { calculateDeliveryResult } from './delivery';
import { CITIES } from '@/data/cities';
import type { LatLng } from '@/types';

// Найти ближайший город к координатам
function nearestCity(loc: LatLng): string {
  let best = CITIES[0].name;
  let bestDist = Infinity;
  for (const c of CITIES) {
    const d = (c.location.lat - loc.lat) ** 2 + (c.location.lng - loc.lng) ** 2;
    if (d < bestDist) { bestDist = d; best = c.name; }
  }
  return best;
}
import { autoSave } from '@/utils/saveSystem';
import { generateDriverMessage } from './driverMessages';

const TICK_MS = 250;
const BASE_MIN_PER_TICK = 0.25;
const MPH = 220; // Game speed
const MILES_PER_MIN = MPH / 60;
const HOS_MAX = 11 * 60;
const SHIFT_DURATION = 12 * 60;

function buildStraightRoute(from: LatLng, to: LatLng, n: number): LatLng[] {
  const r: LatLng[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    r.push({ lat: from.lat + (to.lat - from.lat) * t, lng: from.lng + (to.lng - from.lng) * t });
  }
  return r;
}

export function TickEngine() {
  useEffect(() => {
    const interval = setInterval(() => {
      const state = useGameStore.getState();
      if (!state.session || state.phase !== 'playing') return;

      const { timeSpeed, session } = state;
      const tickMin = BASE_MIN_PER_TICK * timeSpeed;
      const now = session.gameTime;
      const next = now + tickMin;
      const notifs = useNotificationStore.getState();

      // ═══ 1. ДВИЖЕНИЕ (driving) ═══
      for (const truck of session.trucks) {
        if (truck.status !== 'driving') continue;
        if (!truck.route || truck.route.length < 2) continue;

        const load = session.loads.find((l) => l.id === truck.currentLoadId);
        const isToPickup = truck.deliveryPhase === 'to_pickup';
        
        // Расстояние: используем количество точек маршрута как оценку
        // OSRM даёт ~1 точку на 1-3 мили, fallback = 15 точек
        const routePoints = truck.route.length;
        const miles = isToPickup
          ? Math.max(30, routePoints * 2) // deadhead по точкам маршрута
          : (load?.miles || 200);          // delivery = load miles

        const progress = Math.min(1, (truck.routeProgress || 0) + (MILES_PER_MIN * tickMin) / miles);
        const hos = Math.max(0, truck.driver.hosRemaining - tickMin);

        if (progress >= 1) {
          // ПРИБЫЛ
          const dest = truck.route[truck.route.length - 1];
          if (isToPickup) {
            // → at_pickup
            state.updateTruck(truck.id, (t) => ({
              ...t, status: 'at_pickup', location: dest, routeProgress: 1,
              currentCity: load?.origin.city || t.currentCity,
              route: undefined, deliveryPhase: undefined,
              driver: { ...t.driver, hosRemaining: hos },
            }));
            notifs.addNotification({ type: 'sms', from: `${truck.driver.firstName} (${truck.number})`,
              subject: '📦 На погрузке', message: `Прибыл в ${load?.origin.city}. Жду док.`,
              timestamp: next, priority: 'low', relatedTruckId: truck.id });
          } else {
            // → at_delivery
            state.updateTruck(truck.id, (t) => ({
              ...t, status: 'at_delivery', location: dest, routeProgress: 1,
              currentCity: load?.destination.city || t.currentCity,
              route: undefined, deliveryPhase: undefined,
              driver: { ...t.driver, hosRemaining: hos },
            }));
            notifs.addNotification({ type: 'sms', from: `${truck.driver.firstName} (${truck.number})`,
              subject: '📍 На разгрузке', message: `Прибыл в ${load?.destination.city}. Захожу на ресивер.`,
              timestamp: next, priority: 'low', relatedTruckId: truck.id });
          }
        } else {
          // Движение — обновляем позицию и ближайший город
          const loc = positionAlongRoute(truck.route, progress);
          const city = nearestCity(loc);
          state.updateTruck(truck.id, (t) => ({
            ...t, routeProgress: progress, location: loc, currentCity: city,
            driver: { ...t.driver, hosRemaining: hos },
          }));
        }

        // HOS warn — отображается в карточке трака, без отдельного уведомления
        if (hos <= 0) {
          state.updateTruck(truck.id, (t) => ({ ...t, status: 'hos_rest', driver: { ...t.driver, hosRemaining: 0 } }));
        }
      }

      // ═══ 2. ЗАГРУЗКА (at_pickup → driving to_delivery) ═══
      for (const truck of session.trucks) {
        if (truck.status !== 'at_pickup') continue;
        // ~1.5% за тик ≈ 30-50 мин загрузки
        if (Math.random() > 0.015 * timeSpeed) continue;

        const load = session.loads.find((l) => l.id === truck.currentLoadId);
        if (!load) continue;

        // Сразу ставим fallback route чтобы трак начал двигаться
        const fallback = buildStraightRoute(load.origin.location, load.destination.location, 15);
        state.updateTruck(truck.id, (t) => ({
          ...t, status: 'driving', deliveryPhase: 'to_delivery', route: fallback, routeProgress: 0,
        }));
        notifs.addNotification({ type: 'sms', from: `${truck.driver.firstName} (${truck.number})`,
          subject: '✅ Загружен', message: `Еду в ${load.destination.city}. ${load.miles} mi.`,
          timestamp: next, priority: 'low', relatedTruckId: truck.id });

        // OSRM маршрут по дорогам (заменяет fallback)
        fetchRoute(load.origin.location, load.destination.location).then((r) => {
          if (r && r.path.length > 3) {
            const cur = useGameStore.getState().session?.trucks.find((t) => t.id === truck.id);
            if (cur?.status === 'driving' && cur.deliveryPhase === 'to_delivery') {
              useGameStore.getState().updateTruck(truck.id, (t) => ({
                ...t, route: r.path, routeProgress: 0,
              }));
              console.log('[TickEngine] OSRM route set:', truck.number, r.path.length, 'points');
            }
          }
        }).catch(() => {});
      }

      // ═══ 3. РАЗГРУЗКА (at_delivery → idle + P&L) ═══
      for (const truck of session.trucks) {
        if (truck.status !== 'at_delivery') continue;
        if (Math.random() > 0.02 * timeSpeed) continue;

        const load = session.loads.find((l) => l.id === truck.currentLoadId);
        if (load) {
          const result = calculateDeliveryResult({
            truckId: truck.id, truckNumber: truck.number,
            driverName: `${truck.driver.firstName} ${truck.driver.lastName}`,
            loadId: load.id, fromCity: load.origin.city, toCity: load.destination.city,
            miles: load.miles, agreedRate: load.rate, detentionMinutes: 0,
          });
          state.addDeliveryResult(result);
          state.adjustBalance(result.netProfit);
          notifs.addNotification({ type: 'email', from: load.brokerName.split('(')[0].trim(),
            subject: `✅ ${load.origin.city} → ${load.destination.city}`,
            message: `Доставлено. Net: $${result.netProfit.toLocaleString()}`,
            timestamp: next, priority: 'low', relatedTruckId: truck.id });
        }

        const city = load?.destination.city || truck.currentCity;
        state.updateTruck(truck.id, (t) => ({
          ...t, status: 'idle', currentLoadId: undefined, currentCity: city,
          route: undefined, routeProgress: 0, deliveryPhase: undefined,
        }));
        if (truck.currentLoadId) state.updateLoad(truck.currentLoadId, (l) => ({ ...l, status: 'delivered' }));
      }

      // ═══ 4. HOS ОТДЫХ ═══
      for (const truck of session.trucks) {
        if (truck.status !== 'hos_rest') continue;
        if (Math.random() > 0.01 * timeSpeed) continue;
        state.updateTruck(truck.id, (t) => ({
          ...t, status: 'idle', driver: { ...t.driver, hosRemaining: HOS_MAX },
        }));
        notifs.addNotification({ type: 'sms', from: truck.driver.firstName,
          subject: `${truck.number} готов`, message: 'Отдохнул. HOS полный.',
          timestamp: next, priority: 'low', relatedTruckId: truck.id });
      }

      // ═══ 5. СОБЫТИЯ ═══
      if (shouldTriggerEvent(next) && !shouldTriggerEvent(now)) {
        const ev = generateRandomEvent(session.trucks);
        if (ev) {
          state.addEvent(ev);
          // Уведомления не показываем — статус виден в карточке трака

          // BREAKDOWN: stop the truck immediately
          if (ev.type === 'breakdown' && ev.truckId) {
            state.updateTruck(ev.truckId, (t) => ({
              ...t,
              status: 'breakdown',
            }));
          }
        }
      }

      // ═══ 6. ГРУЗЫ ═══
      const expired = session.loads.filter((l) => l.status === 'available' && isLoadExpired(l.id, next));
      expired.forEach((l) => state.removeLoad(l.id));

      if (Math.floor(next / 15) > Math.floor(now / 15)) {
        if (session.loads.filter((l) => l.status === 'available').length < 15) {
          const t = session.trucks.find((x) => x.status === 'idle') || session.trucks[0];
          state.addLoads(generateLoads(next, 4 + Math.floor(Math.random() * 4), t?.currentCity, t?.location));
        }
      }

      // ═══ 7. ПОГОДА ═══
      if (Math.floor(next / 120) > Math.floor(now / 120) && Math.random() < 0.4) {
        state.setWeatherZones(generateWeatherZones(next));
      }

      // ═══ 8. КОНЕЦ СМЕНЫ ═══
      if (next >= SHIFT_DURATION && now < SHIFT_DURATION) state.setPhase('day_end');

      // ═══ 8.5. IDLE WARNING (трак без груза > 60 мин) ═══
      for (const truck of session.trucks) {
        if (truck.status !== 'idle') continue;
        // Проверяем сколько трак idle (грубо: если gameTime > 60 и трак idle)
        // Предупреждение раз в ~60 мин
        if (Math.floor(next / 60) > Math.floor(now / 60) && next > 60) {
          if (Math.random() < 0.3) { // 30% шанс каждые 60 мин
            notifs.addNotification({
              type: 'system', from: 'Dispatch',
              subject: `⚠️ ${truck.number} простаивает`,
              message: `${truck.driver.firstName} ждёт груз в ${truck.currentCity || 'неизвестно'}. Найди ему работу!`,
              timestamp: next, priority: 'medium', relatedTruckId: truck.id,
            });
          }
        }
      }

      // ═══ 9. ВРЕМЯ ═══
      state.tickGameTime(tickMin);

      // ═══ 10. SMS ВОДИТЕЛЕЙ (реже при высокой скорости) ═══
      // Шанс фиксирован по реальному времени, не по игровому
      if (Math.random() < 0.005) { // ~0.5% за тик = ~2 за минуту реального времени
        const active = session.trucks.filter((t) => ['driving', 'at_pickup', 'at_delivery'].includes(t.status));
        if (active.length > 0) {
          const t = active[Math.floor(Math.random() * active.length)];
          const m = generateDriverMessage(t);
          if (m) notifs.addNotification({ type: 'sms', from: `${t.driver.firstName} (${t.number})`,
            subject: m.subject, message: m.message, timestamp: next, priority: m.priority, relatedTruckId: t.id });
        }
      }

      // ═══ 11. АВТОСОХРАНЕНИЕ ═══
      autoSave();
    }, TICK_MS);

    return () => clearInterval(interval);
  }, []);

  return null;
}
