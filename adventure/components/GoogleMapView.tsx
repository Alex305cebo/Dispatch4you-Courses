import { useEffect, useRef, useState, useCallback } from "react";
import { View, StyleSheet, Platform, Text } from "react-native";
import { useGameStore } from "../store/gameStore";
import { useThemeStore } from "../store/themeStore";
import { CITIES, CITY_STATE } from "../constants/config";
import { SERVICE_VEHICLE_CONFIGS } from "../types/serviceVehicle";
import { formatETA } from "../utils/serviceVehicleHelpers";

// ── GOOGLE MAPS API KEY ──────────────────────────────────────────────────────
// ВАЖНО: Добавьте ключ в .env файл как EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
// Временно используем ключ напрямую для тестирования
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyDmtGk4ivDi5nxKtLNok4WfZdIZa886EmI";

// Проверка наличия API ключа при загрузке модуля
if (typeof window !== 'undefined') {
  console.log('🔑 Google Maps API ключ:', GOOGLE_MAPS_API_KEY?.substring(0, 20) + '...');
  console.log('📦 process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY:', process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY);
}

// ── ТИПЫ ─────────────────────────────────────────────────────────────────────
declare global {
  interface Window {
    google: any;
    initGoogleMap: () => void;
  }
}

// ── КОНСТАНТЫ ────────────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  idle:        '#94a3b8', // серый — свободен
  driving:     '#818cf8', // индиго — едет к погрузке
  loaded:      '#4ade80', // зелёный — везёт груз
  at_pickup:   '#fbbf24', // жёлтый — на погрузке
  at_delivery: '#c084fc', // фиолетовый — на разгрузке
  breakdown:   '#f87171', // красный — поломка
  waiting:     '#fb923c', // оранжевый — detention
};

const STATUS_LABEL: Record<string, string> = {
  idle: "Свободен", driving: "Едет к погрузке", loaded: "Везёт груз",
  at_pickup: "На погрузке", at_delivery: "На разгрузке",
  breakdown: "Поломка", waiting: "Detention",
};

const STATUS_EMOJI: Record<string, string> = {
  idle: "⚪", driving: "🔵", loaded: "🟢",
  at_pickup: "🟡", at_delivery: "🟣",
  breakdown: "🔴", waiting: "🟠",
};

// ── ИКОНКА ТРАКА: точка + подпись (как city dot в amCharts) ─────────────────
function getTruckMarkerIcon(google: any, color: string, heading: number = 0) {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 14,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2.5,
  };
}
// ── ФУНКЦИИ УТИЛИТЫ ──────────────────────────────────────────────────────────
function getTruckColor(truck: any, gameMinute = 0): string {
  // Ночёвка / обязательный перерыв / detention — серо-синий
  if ((truck as any).onNightStop || (truck as any).onMandatoryBreak) return "#64748b";
  if (truck.status === 'waiting') return "#64748b";
  // breakdown
  if (truck.status === 'breakdown') return "#f87171";
  // outOfOrder
  const outOfOrder = (truck as any).outOfOrderUntil;
  if (gameMinute > 0 && outOfOrder && typeof outOfOrder === 'number' && outOfOrder > gameMinute) return "#ff0000";
  // idleWarning
  if (truck.status === 'idle') {
    const warn = (truck as any).idleWarningLevel ?? 0;
    if (warn === 3) return "#ef4444";
    if (warn === 2) return "#f97316";
    if (warn === 1) return "#fbbf24";
  }
  return STATUS_COLOR[truck.status] || "#94a3b8";
}

// ── ГЛОБАЛЬНЫЙ ЗАГРУЗЧИК GOOGLE MAPS ────────────────────────────────────────
// Регистрируем callback ДО добавления скрипта, чтобы избежать race condition
// когда скрипт загружается из кэша и вызывает callback синхронно
let _gmapsLoaded = false;
let _gmapsCallbacks: Array<() => void> = [];

if (typeof window !== 'undefined') {
  // Устанавливаем глобальный callback сразу при загрузке модуля
  window.initGoogleMap = () => {
    console.log('✅ Google Maps API загружен успешно (global callback)');
    _gmapsLoaded = true;
    _gmapsCallbacks.forEach(cb => cb());
    _gmapsCallbacks = [];
  };
}

function onGoogleMapsReady(cb: () => void) {
  if (_gmapsLoaded || (typeof window !== 'undefined' && window.google?.maps)) {
    cb();
  } else {
    _gmapsCallbacks.push(cb);
  }
}

// ── ГЛАВНЫЙ КОМПОНЕНТ ────────────────────────────────────────────────────────
export default function GoogleMapView({ onTruckInfo, onTruckSelect, onFindLoad }: {
  onTruckInfo?: (truckId: string) => void;
  onTruckSelect?: (truckId: string) => void;
  onFindLoad?: (city: string) => void;
}) {
  if (Platform.OS !== "web") {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Карта доступна в веб-версии</Text>
      </View>
    );
  }
  return <GoogleMapComponent onTruckInfo={onTruckInfo} onTruckSelect={onTruckSelect} onFindLoad={onFindLoad} />;
}

// ── КОМПОНЕНТ GOOGLE MAPS ────────────────────────────────────────────────────
function GoogleMapComponent({ onTruckInfo, onTruckSelect, onFindLoad }: {
  onTruckInfo?: (truckId: string) => void;
  onTruckSelect?: (truckId: string) => void;
  onFindLoad?: (city: string) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const polylinesRef = useRef<Map<string, any>>(new Map());
  const infoWindowRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [followTruck, setFollowTruck] = useState(false);
  const followTruckIdRef = useRef<string | null>(null);
  const followServiceIdRef = useRef<string | null>(null);
  // Режим 2: простое центрирование (клик на объект) — без зума, без tilt
  const centerOnIdRef = useRef<string | null>(null); // truckId или 'service:xxx'
  const lastFollowPositionRef = useRef<{lat: number, lng: number} | null>(null);
  const returnToTruckTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userDraggedRef = useRef<boolean>(false);
  const [selectedTruck, setSelectedTruck] = useState<any>(null);
  const [mapTypeMenuOpen, setMapTypeMenuOpen] = useState(false);
  const [followMenuOpen, setFollowMenuOpen] = useState(false);

  // Сообщаем наружу об изменении followTruck через window event
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('followTruckChanged', { detail: { active: followTruck } }));
  }, [followTruck]);
  const [currentMapType, setCurrentMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('hybrid');
  const [followDragPulse, setFollowDragPulse] = useState(false);

  // ── CINEMATIC ZOOM-OUT: начинаем близко (17), медленно отдаляемся до 7 ──
  const cinematicZoomRef = useRef<{
    active: boolean;
    startTime: number;
    startZoom: number;
    endZoom: number;
    duration: number; // ms
  } | null>(null);
  const cinematicRafRef = useRef<number | null>(null);

  // ── SMOOTH RETURN: плавный возврат камеры к траку после drag ──
  const smoothReturnRef = useRef<{
    active: boolean;
    startTime: number;
    duration: number;
    fromLat: number;
    fromLng: number;
  } | null>(null);

  const { trucks, availableLoads, phase, gameMinute, serviceVehicles } = useGameStore();
  const { mode: themeMode, colors: T } = useThemeStore();
  // Показываем траки всегда кроме главного меню
  const activeTrucks = phase !== 'menu' ? trucks : [];
  const activeServiceVehicles = phase !== 'menu' ? (serviceVehicles || []) : [];

  // ── ЗАГРУЗКА GOOGLE MAPS API ─────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Проверяем, загружен ли уже Google Maps
    if (window.google && window.google.maps) {
      console.log('✅ Google Maps уже загружен');
      setMapLoaded(true);
      return;
    }

    // Проверяем, не загружается ли уже скрипт
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      console.log('⏳ Google Maps уже загружается...');
      // Ждём когда загрузится
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          console.log('✅ Google Maps загружен (ожидание)');
          setMapLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }

    console.log('🔄 Начинаем загрузку Google Maps API...');

    // Симулируем прогресс загрузки
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev; // Останавливаемся на 90%, ждём реальной загрузки
        return prev + 10;
      });
    }, 200);

    // Подписываемся на готовность через глобальный реестр (безопасно от race condition)
    onGoogleMapsReady(() => {
      clearInterval(progressInterval);
      setLoadingProgress(100);
      setTimeout(() => setMapLoaded(true), 300); // Небольшая задержка для плавности
    });

    // Загружаем скрипт Google Maps (только geometry, без лишних библиотек)
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initGoogleMap&libraries=geometry,marker&loading=async`;
    script.async = true;
    script.defer = true;
    
    // Обработка ошибок загрузки
    script.onerror = (error) => {
      console.error('❌ Ошибка загрузки Google Maps API:', error);
      console.error('Проверьте:');
      console.error('1. API ключ в .env файле');
      console.error('2. Включены ли Maps JavaScript API и Directions API в Google Cloud Console');
      console.error('3. Настроены ли ограничения API ключа (HTTP referrers)');
    };

    document.head.appendChild(script);
    console.log('📡 Скрипт Google Maps добавлен в DOM');

    return () => {
      // Очистка при размонтировании
      clearInterval(progressInterval);
    };
  }, []);

  // ── ИНИЦИАЛИЗАЦИЯ КАРТЫ ──────────────────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || googleMapRef.current) {
      console.log('⏸️ Ожидание инициализации карты:', { mapLoaded, hasMapRef: !!mapRef.current, hasGoogleMapRef: !!googleMapRef.current });
      return;
    }

    const google = window.google;
    if (!google || !google.maps) {
      console.error('❌ Google Maps API не доступен!');
      return;
    }

    console.log('🗺️ Инициализация Google Maps...');

    try {
      // Границы США (континентальная часть)
      const usaBounds = {
        north: 52.0,    // чуть выше Канады — можно скроллить вверх
        south: 18.0,    // ниже Мексики — можно скроллить вниз
        west: -130.0,
        east: -60.0,
      };

      // Определяем начальный центр карты
      let initialCenter = { lat: 39.8283, lng: -98.5795 }; // США по умолчанию
      let initialZoom = 5;
      
      // Если есть траки — центрируем на первом
      if (activeTrucks.length > 0) {
        const firstTruck = activeTrucks[0];
        initialCenter = { lat: firstTruck.position[1], lng: firstTruck.position[0] };
        initialZoom = 8; // Ближе чтобы видеть трак
      }

      // Создаём карту с центром на США и спутниковым видом
      // mapId нужен для WebGL/3D режима (tilt + moveCamera)
      // Используем публичный демо-ключ Google для Vector Maps
      const map = new google.maps.Map(mapRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        mapTypeId: 'hybrid',
        mapId: '67fdefb40270c0ad2edaab31', // Vector Map ID — поддерживает tilt/heading/moveCamera
        restriction: {
          latLngBounds: usaBounds,
          strictBounds: false,
        },
        minZoom: 4,
        maxZoom: 18,
        disableDefaultUI: true,
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false,
        gestureHandling: 'greedy', // один палец = pan, два пальца = zoom
        tilt: 0,
        heading: 0,
      });

      googleMapRef.current = map;

      // Создаём InfoWindow для показа информации о траке
      infoWindowRef.current = new google.maps.InfoWindow({ maxWidth: 360 });

      // При изменении zoom пользователем — сохраняем в ref с ограничениями при слежении
      map.addListener('zoom_changed', () => {
        let newZoom = map.getZoom() ?? 13;
        
        // Во время cinematic zoom-out не ограничиваем
        if (cinematicZoomRef.current?.active) {
          userZoomRef.current = newZoom;
          return;
        }
        
        // Если пользователь крутит колёсико — прерываем cinematic
        // (zoom_changed вызывается и программно, но active уже false после завершения)
        
        // Ограничиваем zoom при активном слежении: 5-18
        if (followTruckIdRef.current) {
          if (newZoom < 5) {
            newZoom = 5;
            map.setZoom(5);
          } else if (newZoom > 18) {
            newZoom = 18;
            map.setZoom(18);
          }
        }
        
        userZoomRef.current = newZoom;
      });

      // При попытке сдвинуть карту во время слежения — пульсируем кнопку и запускаем таймер возврата
      map.addListener('dragstart', () => {
        if (followTruckIdRef.current) {
          // Прерываем cinematic zoom при drag
          if (cinematicZoomRef.current?.active) {
            cinematicZoomRef.current = { ...cinematicZoomRef.current, active: false };
          }
          // Прерываем smooth return если был активен
          if (smoothReturnRef.current?.active) {
            smoothReturnRef.current = { ...smoothReturnRef.current, active: false };
          }
          setFollowDragPulse(true);
          setTimeout(() => setFollowDragPulse(false), 2000);
          
          // Отмечаем что пользователь сдвинул карту
          userDraggedRef.current = true;
          
          // Очищаем предыдущий таймер если есть
          if (returnToTruckTimerRef.current) {
            clearTimeout(returnToTruckTimerRef.current);
          }
        }
      });
      
      // После окончания перемещения — запускаем таймер возврата к траку
      map.addListener('dragend', () => {
        if (followTruckIdRef.current && userDraggedRef.current) {
          // Через 3 секунды плавно возвращаемся к траку
          returnToTruckTimerRef.current = setTimeout(() => {
            // Запоминаем текущую позицию камеры для плавного перехода
            const center = map.getCenter();
            if (center) {
              smoothReturnRef.current = {
                active: true,
                startTime: performance.now(),
                duration: 1500, // 1.5 секунды плавный возврат
                fromLat: center.lat(),
                fromLng: center.lng(),
              };
            }
            userDraggedRef.current = false;
          }, 3000);
        }
      });
      // Загружаем GeoJSON контур США и рисуем яркую границу поверх карты
      fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
        .then(r => r.json())
        .then(data => {
          // Фильтруем только США
          const usaFeature = data.features.find((f: any) =>
            f.properties?.ISO_A2 === 'US' || f.properties?.iso_a2 === 'US' || f.properties?.ADM0_A3 === 'USA'
          );
          if (!usaFeature) return;

          map.data.addGeoJson({ type: 'FeatureCollection', features: [usaFeature] });
          map.data.setStyle({
            fillColor: 'transparent',
            fillOpacity: 0,
            strokeColor: '#06b6d4',
            strokeWeight: 2.5,
            strokeOpacity: 0.85,
            clickable: false,
          });
        })
        .catch(() => {
          // Fallback: рисуем упрощённый прямоугольный контур континентальных США
          const usBorder = new google.maps.Polyline({
            path: [
              { lat: 49.0, lng: -125.0 }, { lat: 49.0, lng: -95.2 },
              { lat: 49.38, lng: -95.2 }, { lat: 49.38, lng: -66.9 },
              { lat: 44.8, lng: -66.9 }, { lat: 24.5, lng: -81.0 },
              { lat: 24.4, lng: -87.5 }, { lat: 29.0, lng: -89.5 },
              { lat: 25.8, lng: -97.4 }, { lat: 32.5, lng: -117.1 },
              { lat: 49.0, lng: -125.0 },
            ],
            geodesic: false,
            strokeColor: '#06b6d4',
            strokeOpacity: 0.85,
            strokeWeight: 2.5,
            map,
            clickable: false,
          });
        });

      console.log('✅ Google Maps инициализирована успешно (спутниковый вид, только США)');
    } catch (error) {
      console.error('❌ Ошибка при инициализации карты:', error);
    }
  }, [mapLoaded]);

  // ── ЦЕНТРИРОВАНИЕ НА ПЕРВОМ ТРАКЕ ПРИ ЗАГРУЗКЕ ──────────────────────────
  useEffect(() => {
    if (!googleMapRef.current || activeTrucks.length === 0) return;
    
    // Центрируем на первом траке только один раз при инициализации
    const firstTruck = activeTrucks[0];
    
    // Включаем слежение — effect [followTruck] запустит cinematic zoom
    followTruckIdRef.current = firstTruck.id;
    userDraggedRef.current = false;
    setFollowTruck(true);
    
    console.log('🎯 Карта: автоследование за первым траком:', firstTruck.id);
  }, [googleMapRef.current]); // Срабатывает только когда карта инициализирована

  // ── АНИМАЦИОННЫЙ ДВИЖОК: плавное движение маркеров ─────────────────────
  const animStateRef = useRef<Map<string, {
    fromLat: number; fromLng: number;
    toLat: number;   toLng: number;
    fromHeading: number; toHeading: number;
    startTime: number; duration: number;
    // Маршрут по дорогам для интерполяции вдоль пути
    routePoints: Array<{lat: number, lng: number}> | null;
    routeFromIdx: number; // индекс начальной точки в маршруте
    routeToIdx: number;   // индекс конечной точки в маршруте
  }>>(new Map());
  const rafRef = useRef<number | null>(null);
  const lastCameraUpdateRef = useRef<number>(0);
  const smoothHeadingRef = useRef<number>(0);
  const smoothCamLatRef = useRef<number>(0);
  const smoothCamLngRef = useRef<number>(0);
  const userZoomRef = useRef<number>(14); // кешируем zoom пользователя

  function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
  function easeInOut(t: number) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  // Находим ближайшую точку маршрута к позиции
  function findNearestRouteIdx(points: Array<{lat: number, lng: number}>, lat: number, lng: number): number {
    let best = 0, bestDist = Infinity;
    for (let i = 0; i < points.length; i++) {
      const d = Math.hypot(points[i].lat - lat, points[i].lng - lng);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    return best;
  }

  // Интерполяция вдоль маршрута: t=0 → fromIdx, t=1 → toIdx
  function interpolateRoute(
    points: Array<{lat: number, lng: number}>,
    fromIdx: number, toIdx: number, t: number
  ): {lat: number, lng: number, heading: number} {
    if (points.length === 0) return { lat: 0, lng: 0, heading: 0 };
    const start = Math.min(fromIdx, toIdx);
    const end = Math.max(fromIdx, toIdx);
    if (start === end) return { ...points[start], heading: 0 };

    const totalPts = end - start;
    const floatIdx = start + t * totalPts;
    const i = Math.min(Math.floor(floatIdx), end - 1);
    const frac = floatIdx - i;
    const p0 = points[i];
    const p1 = points[Math.min(i + 1, points.length - 1)];
    const lat = lerp(p0.lat, p1.lat, frac);
    const lng = lerp(p0.lng, p1.lng, frac);

    // Heading из направления сегмента
    const dLng = (p1.lng - p0.lng) * Math.PI / 180;
    const lat1r = p0.lat * Math.PI / 180;
    const lat2r = p1.lat * Math.PI / 180;
    const y = Math.sin(dLng) * Math.cos(lat2r);
    const x = Math.cos(lat1r) * Math.sin(lat2r) - Math.sin(lat1r) * Math.cos(lat2r) * Math.cos(dLng);
    const heading = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;

    return { lat, lng, heading };
  }

  // Запускаем анимационный цикл
  useEffect(() => {
    if (!mapLoaded) return;

    function animLoop() {
      const google = window.google;
      if (!google?.maps || !googleMapRef.current) {
        rafRef.current = requestAnimationFrame(animLoop);
        return;
      }

      const now = performance.now();

      animStateRef.current.forEach((state, truckId) => {
        const marker = markersRef.current.get(truckId);
        if (!marker) return;

        const elapsed = now - state.startTime;
        const t = Math.min(elapsed / state.duration, 1);
        const e = easeInOut(t);

        // Интерполяция: по маршруту если есть, иначе прямая
        let lat: number, lng: number, routeHeading: number;
        if (state.routePoints && state.routePoints.length > 1) {
          const r = interpolateRoute(state.routePoints, state.routeFromIdx, state.routeToIdx, e);
          lat = r.lat; lng = r.lng; routeHeading = r.heading;
        } else {
          lat = lerp(state.fromLat, state.toLat, e);
          lng = lerp(state.fromLng, state.toLng, e);
          routeHeading = state.toHeading;
        }
        marker.setPosition({ lat, lng });

        // Камера — Режим 1: Google Navigation (кнопка 🎯)
        if (followTruck && truckId === followTruckIdRef.current && !userDraggedRef.current) {
          // Cinematic zoom-out анимация
          const cz = cinematicZoomRef.current;
          if (cz?.active) {
            const czElapsed = now - cz.startTime;
            if (czElapsed > 0) {
              const czT = Math.min(czElapsed / cz.duration, 1);
              const czE = 1 - Math.pow(1 - czT, 3); // ease-out cubic
              const zoom = cz.startZoom + (cz.endZoom - cz.startZoom) * czE;
              userZoomRef.current = zoom;
              if (czT >= 1) {
                cinematicZoomRef.current = { ...cz, active: false };
              }
            }
          }

          // Плавный возврат к траку после drag
          let camLat = lat;
          let camLng = lng;
          const sr = smoothReturnRef.current;
          if (sr?.active) {
            const srElapsed = now - sr.startTime;
            const srT = Math.min(srElapsed / sr.duration, 1);
            const srE = srT < 0.5 ? 4 * srT * srT * srT : 1 - Math.pow(-2 * srT + 2, 3) / 2;
            camLat = sr.fromLat + (lat - sr.fromLat) * srE;
            camLng = sr.fromLng + (lng - sr.fromLng) * srE;
            if (srT >= 1) {
              smoothReturnRef.current = { ...sr, active: false };
            }
          }

          // ── Google Navigation Camera ──
          // Heading поворачивается по направлению движения — дорога всегда вертикально
          const targetHeading = routeHeading || 0;
          const headingDiff = ((targetHeading - smoothHeadingRef.current + 540) % 360) - 180;
          // Поворачиваем только если разница > 5° (игнорируем мелкие колебания)
          if (Math.abs(headingDiff) > 5) {
            smoothHeadingRef.current = (smoothHeadingRef.current + headingDiff * 0.003 + 360) % 360;
          }

          // Плавное сглаживание позиции камеры — камера "догоняет" трак
          const camSmooth = 0.08; // 0..1, чем меньше — тем плавнее
          if (smoothCamLatRef.current === 0 && smoothCamLngRef.current === 0) {
            smoothCamLatRef.current = camLat;
            smoothCamLngRef.current = camLng;
          } else {
            smoothCamLatRef.current += (camLat - smoothCamLatRef.current) * camSmooth;
            smoothCamLngRef.current += (camLng - smoothCamLngRef.current) * camSmooth;
          }

          // Смещаем центр камеры вперёд по heading — трак в нижней части экрана
          const headingRad = smoothHeadingRef.current * Math.PI / 180;
          const offsetDeg = 0.2 / Math.pow(2, userZoomRef.current - 10);
          const offsetLat = smoothCamLatRef.current + Math.cos(headingRad) * offsetDeg;
          const offsetLng = smoothCamLngRef.current + Math.sin(headingRad) * offsetDeg;

          googleMapRef.current.moveCamera({
            center: { lat: offsetLat, lng: offsetLng },
            heading: smoothHeadingRef.current,
            tilt: 65,
            zoom: userZoomRef.current,
          });
        }

        // Камера — Режим 2: простое центрирование (клик на трак)
        if (!followTruck && centerOnIdRef.current === truckId) {
          // Плавное сглаживание позиции камеры
          const camSmooth2 = 0.06;
          if (smoothCamLatRef.current === 0 && smoothCamLngRef.current === 0) {
            smoothCamLatRef.current = lat;
            smoothCamLngRef.current = lng;
          } else {
            smoothCamLatRef.current += (lat - smoothCamLatRef.current) * camSmooth2;
            smoothCamLngRef.current += (lng - smoothCamLngRef.current) * camSmooth2;
          }
          const lastPos = lastFollowPositionRef.current;
          if (!lastPos || Math.abs(smoothCamLatRef.current - lastPos.lat) > 0.00005 || Math.abs(smoothCamLngRef.current - lastPos.lng) > 0.00005) {
            lastFollowPositionRef.current = { lat: smoothCamLatRef.current, lng: smoothCamLngRef.current };
            googleMapRef.current.moveCamera({
              center: { lat: smoothCamLatRef.current, lng: smoothCamLngRef.current },
              heading: 0,
              tilt: 0,
              zoom: userZoomRef.current,
            });
          }
        }
      });

      // ── Анимация сервисных машин по маршруту ──────────────────────────
      serviceMarkersRef.current.forEach((marker, serviceId) => {
        const routePoints: Array<{lat: number, lng: number}> | null = (marker as any)._routePoints;
        if (!routePoints || routePoints.length < 2) return;

        const vehicles = useGameStore.getState().serviceVehicles || [];
        const vehicle = vehicles.find((v: any) => v.id === serviceId);
        if (!vehicle) return;

        const progress = Math.max(0, Math.min(1, vehicle.progress));
        const totalPts = routePoints.length - 1;
        const floatIdx = progress * totalPts;
        const i = Math.min(Math.floor(floatIdx), totalPts - 1);
        const frac = floatIdx - i;
        const p0 = routePoints[i];
        const p1 = routePoints[Math.min(i + 1, totalPts)];
        const lat = lerp(p0.lat, p1.lat, frac);
        const lng = lerp(p0.lng, p1.lng, frac);

        marker.setPosition({ lat, lng });

        // Двигаем мигалку вместе с маркером
        const sirenMarker = (marker as any)._sirenMarker;
        if (sirenMarker) sirenMarker.setPosition({ lat, lng });

        // Камера — Режим 2: простое центрирование за сервисной машиной
        if (followServiceIdRef.current && googleMapRef.current) {
          const isTarget = followServiceIdRef.current === serviceId || followServiceIdRef.current === '__service__';
          if (isTarget) {
            const camSmooth3 = 0.06;
            smoothCamLatRef.current += (lat - smoothCamLatRef.current) * camSmooth3;
            smoothCamLngRef.current += (lng - smoothCamLngRef.current) * camSmooth3;
            const lastPos = lastFollowPositionRef.current;
            if (!lastPos || Math.abs(smoothCamLatRef.current - lastPos.lat) > 0.00005 || Math.abs(smoothCamLngRef.current - lastPos.lng) > 0.00005) {
              lastFollowPositionRef.current = { lat: smoothCamLatRef.current, lng: smoothCamLngRef.current };
              googleMapRef.current.moveCamera({
                center: { lat: smoothCamLatRef.current, lng: smoothCamLngRef.current },
                heading: 0,
                tilt: 0,
                zoom: userZoomRef.current,
              });
            }
          }
        }
      });

      rafRef.current = requestAnimationFrame(animLoop);
    }

    rafRef.current = requestAnimationFrame(animLoop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [mapLoaded, followTruck]);

  // ── ОБНОВЛЕНИЕ ЦЕЛЕВЫХ ПОЗИЦИЙ (раз в секунду от gameStore) ─────────────
  useEffect(() => {
    if (!googleMapRef.current || !mapLoaded) return;

    const google = window.google;
    if (!google?.maps) return;

    activeTrucks.forEach((truck: any) => {
      const marker = markersRef.current.get(truck.id);
      if (!marker) return;

      // Если трак сломан или спит — не двигаем его
      if (truck.status === 'breakdown' || truck.status === 'sleeper') {
        return;
      }
      const newColor = getTruckColor(truck, gameMinute);
      marker.setIcon(getTruckMarkerIcon(google, newColor));

      const toLat = truck.position[1];
      const toLng = truck.position[0];

      // Вычисляем heading к пункту назначения
      let toHeading = 0;
      if (truck.destinationCity && CITIES[truck.destinationCity]) {
        const dest = CITIES[truck.destinationCity];
        const dLng = (dest[0] - toLng) * Math.PI / 180;
        const lat1 = toLat * Math.PI / 180;
        const lat2 = dest[1] * Math.PI / 180;
        const y = Math.sin(dLng) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
        toHeading = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
      }

      const prev = animStateRef.current.get(truck.id);

      // Берём fromLat/fromLng из текущей анимированной позиции
      let fromLat = toLat;
      let fromLng = toLng;
      if (prev) {
        const elapsed = performance.now() - prev.startTime;
        const t = Math.min(elapsed / prev.duration, 1);
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        if (prev.routePoints && prev.routePoints.length > 1) {
          const r = interpolateRoute(prev.routePoints, prev.routeFromIdx, prev.routeToIdx, e);
          fromLat = r.lat; fromLng = r.lng;
        } else {
          fromLat = prev.fromLat + (prev.toLat - prev.fromLat) * e;
          fromLng = prev.fromLng + (prev.toLng - prev.fromLng) * e;
        }
      }
      const fromHeading = prev ? prev.toHeading : toHeading;

      // Маршрут по дорогам из routePath трака
      let routePoints: Array<{lat: number, lng: number}> | null = null;
      let routeFromIdx = 0;
      let routeToIdx = 0;
      if (truck.routePath && truck.routePath.length > 1) {
        routePoints = truck.routePath.map(([lng, lat]: [number, number]) => ({ lat, lng }));
        routeFromIdx = findNearestRouteIdx(routePoints, fromLat, fromLng);
        routeToIdx = findNearestRouteIdx(routePoints, toLat, toLng);
        // Убеждаемся что движемся вперёд
        if (routeToIdx <= routeFromIdx) routeToIdx = Math.min(routeFromIdx + 1, routePoints.length - 1);
      }

      const speed = useGameStore.getState().timeSpeed || 1;
      animStateRef.current.set(truck.id, {
        fromLat, fromLng, toLat, toLng,
        fromHeading, toHeading,
        startTime: performance.now(),
        duration: 400 / speed,
        routePoints,
        routeFromIdx,
        routeToIdx,
      });
    });
  }, [activeTrucks, gameMinute, mapLoaded]);

  // ── СОЗДАНИЕ/УДАЛЕНИЕ/ОБНОВЛЕНИЕ МАРКЕРОВ ТРАКОВ ────────────────────────
  // Отслеживаем предыдущие статусы для toast при поломке
  const prevTruckStatusRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (!googleMapRef.current || !mapLoaded) return;

    const google = window.google;
    if (!google || !google.maps) return;

    const map = googleMapRef.current;

    // Удаляем старые маркеры траков, которых больше нет
    const currentTruckIds = new Set(activeTrucks.map((t: any) => t.id));
    markersRef.current.forEach((marker, truckId) => {
      if (!currentTruckIds.has(truckId)) {
        marker.setMap(null);
        markersRef.current.delete(truckId);
      }
    });

    activeTrucks.forEach((truck: any) => {
      const color = getTruckColor(truck, gameMinute);
      let marker = markersRef.current.get(truck.id);

      if (!marker) {
        // Создаём новый маркер
        const position = { lat: truck.position[1], lng: truck.position[0] };
        marker = new google.maps.Marker({
          position,
          map,
          title: `${truck.name} (${truck.id})`,
          icon: getTruckMarkerIcon(google, color),
          zIndex: truck.status === 'loaded' ? 1000 : 500,
          optimized: false,
        });
        marker.addListener('click', () => handleTruckClick(truck));
        markersRef.current.set(truck.id, marker);
      } else {
        // Обновляем иконку при изменении статуса/цвета
        marker.setIcon(getTruckMarkerIcon(google, color));
        marker.setZIndex(truck.status === 'loaded' ? 1000 : truck.status === 'breakdown' ? 2000 : 500);
      }

      // Toast при поломке — с truckId чтобы показывался в карточке, не внизу экрана
      const prevStatus = prevTruckStatusRef.current.get(truck.id);
      if (truck.status === 'breakdown' && prevStatus && prevStatus !== 'breakdown') {
        window.dispatchEvent(new CustomEvent('mapToast', {
          detail: {
            message: `🚨 ${truck.name} сломался! Нажми на карточку трака.`,
            color: '#ef4444',
            duration: 4000,
            truckId: truck.id,
          }
        }));
      }
      prevTruckStatusRef.current.set(truck.id, truck.status);
    });
  }, [
    activeTrucks.length,
    activeTrucks.map((t: any) => `${t.id}:${t.status}`).join('|'),
    gameMinute,
    mapLoaded,
  ]);

  // ── СОЗДАНИЕ/УДАЛЕНИЕ МАРКЕРОВ СЕРВИСНЫХ МАШИН ──────────────────────────
  const serviceMarkersRef = useRef<Map<string, any>>(new Map());
  const servicePolylinesRef = useRef<Map<string, any>>(new Map());

  // ── МИГАЮЩИЕ СИРЕНЫ НАД СЛОМАННЫМИ ТРАКАМИ ───────────────────────────────
  const sirenMarkersRef = useRef<Map<string, any>>(new Map());

  useEffect(() => {
    if (!googleMapRef.current || !mapLoaded) return;
    const google = window.google;
    if (!google?.maps) return;
    const map = googleMapRef.current;

    const brokenIds = new Set(activeTrucks.filter((t: any) => t.status === 'breakdown').map((t: any) => t.id));

    // Удаляем сирены для починенных траков
    sirenMarkersRef.current.forEach((marker, id) => {
      if (!brokenIds.has(id)) {
        marker.setMap(null);
        sirenMarkersRef.current.delete(id);
      }
    });

    // Добавляем сирены для сломанных
    activeTrucks.filter((t: any) => t.status === 'breakdown').forEach((truck: any) => {
      if (sirenMarkersRef.current.has(truck.id)) return; // уже есть

      const el = document.createElement('div');
      el.style.cssText = `
        font-size: 28px;
        line-height: 1;
        user-select: none;
        pointer-events: none;
        animation: sirenBlink 0.6s ease-in-out infinite alternate;
        filter: drop-shadow(0 0 6px rgba(239,68,68,0.9));
        transform-origin: bottom center;
      `;
      el.textContent = '🚨';

      // Инжектим CSS анимацию если ещё нет
      if (!document.getElementById('siren-style')) {
        const style = document.createElement('style');
        style.id = 'siren-style';
        style.textContent = `
          @keyframes sirenBlink {
            0%   { transform: scale(1.0) rotate(-8deg); opacity: 1; filter: drop-shadow(0 0 4px rgba(239,68,68,0.9)); }
            100% { transform: scale(1.3) rotate(8deg);  opacity: 0.7; filter: drop-shadow(0 0 12px rgba(239,68,68,1)); }
          }
        `;
        document.head.appendChild(style);
      }

      // Создаём обычный Marker с emoji через SVG data URL
      const sirenSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><text y="28" font-size="28">🚨</text></svg>`;
      const sirenIcon = {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(sirenSvg),
        scaledSize: new google.maps.Size(36, 36),
        anchor: new google.maps.Point(18, 36),
      };

      const marker = new google.maps.Marker({
        position: { lat: truck.position[1], lng: truck.position[0] },
        map,
        icon: sirenIcon,
        zIndex: 3000,
        optimized: false,
      });
      sirenMarkersRef.current.set(truck.id, marker);
    });

    // Обновляем позиции существующих сирен
    activeTrucks.filter((t: any) => t.status === 'breakdown').forEach((truck: any) => {
      const marker = sirenMarkersRef.current.get(truck.id);
      if (marker) {
        marker.setPosition({ lat: truck.position[1], lng: truck.position[0] });
      }
    });
  }, [
    activeTrucks.map((t: any) => `${t.id}:${t.status}:${t.position}`).join('|'),
    mapLoaded,
  ]);

  useEffect(() => {
    if (!googleMapRef.current || !mapLoaded) return;

    const google = window.google;
    if (!google || !google.maps) return;

    const map = googleMapRef.current;

    // Удаляем старые маркеры сервисных машин, которых больше нет
    const currentServiceIds = new Set(activeServiceVehicles.map((v: any) => v.id));
    serviceMarkersRef.current.forEach((marker, serviceId) => {
      if (!currentServiceIds.has(serviceId)) {
        marker.setMap(null);
        // Очищаем мигалку и интервал
        if ((marker as any)._sirenMarker) {
          (marker as any)._sirenMarker.setMap(null);
        }
        if ((marker as any)._sirenInterval) {
          clearInterval((marker as any)._sirenInterval);
        }
        serviceMarkersRef.current.delete(serviceId);
        console.log('🗑️ Удалён маркер сервисной машины:', serviceId);
      }
    });
    servicePolylinesRef.current.forEach((polyline, serviceId) => {
      if (!currentServiceIds.has(serviceId)) {
        polyline.setMap(null);
        servicePolylinesRef.current.delete(serviceId);
      }
    });

    // Создаём маркеры и маршруты для сервисных машин
    activeServiceVehicles.forEach((vehicle: any) => {
      const config = SERVICE_VEHICLE_CONFIGS[vehicle.type];

      // Создаём или обновляем маркер
      let marker = serviceMarkersRef.current.get(vehicle.id);
      const position = { lat: vehicle.position[1], lng: vehicle.position[0] };

      if (!marker) {
        // HTML элемент с эмодзи и анимацией движения
        const el = document.createElement('div');
        el.style.cssText = `
          font-size: 26px;
          line-height: 1;
          user-select: none;
          animation: serviceMove 0.8s ease-in-out infinite alternate;
          filter: drop-shadow(0 2px 6px rgba(6,182,212,0.8));
          transform-origin: bottom center;
        `;
        el.textContent = config.icon;

        if (!document.getElementById('service-style')) {
          const style = document.createElement('style');
          style.id = 'service-style';
          style.textContent = `
            @keyframes serviceMove {
              0%   { transform: translateY(0px) scale(1.0); }
              100% { transform: translateY(-5px) scale(1.1); }
            }
          `;
          document.head.appendChild(style);
        }

        // Создаём обычный Marker с emoji через SVG data URL
        const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><text y="28" font-size="26">${config.icon}</text></svg>`;
        const serviceIcon = {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgIcon),
          scaledSize: new google.maps.Size(36, 36),
          anchor: new google.maps.Point(18, 36),
        };

        marker = new google.maps.Marker({
          position,
          map,
          icon: serviceIcon,
          zIndex: 2500,
          optimized: false,
        });

        // InfoWindow с прогрессом при клике
        marker.addListener('click', () => {
          const truck = activeTrucks.find((t: any) => t.id === vehicle.targetTruckId);
          const remainingMinutes = Math.round(vehicle.eta * (1 - vehicle.progress));
          const progressPercent = Math.round(vehicle.progress * 100);
          const content = `
            <div style="display:flex;align-items:flex-end;gap:10px;padding:8px;background:#fff;border-radius:16px;box-shadow:0 4px 16px rgba(0,0,0,0.12);font-family:system-ui,sans-serif;max-width:280px;">
              <div style="font-size:40px;line-height:1;flex-shrink:0;">${config.icon}</div>
              <div style="flex:1;">
                <div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:2px;">${config.label}</div>
                <div style="font-size:11px;color:#64748b;margin-bottom:6px;">${vehicle.fromCity} → ${truck?.name || 'Truck'}</div>
                <div style="width:100%;height:5px;background:#e2e8f0;border-radius:3px;overflow:hidden;margin-bottom:4px;">
                  <div style="width:${progressPercent}%;height:100%;background:linear-gradient(90deg,#06b6d4,#0891b2);border-radius:3px;transition:width 0.3s;"></div>
                </div>
                <div style="font-size:12px;font-weight:700;color:#06b6d4;">ETA: ${formatETA(remainingMinutes)}</div>
              </div>
            </div>
          `;
          if (infoWindowRef.current) {
            infoWindowRef.current.setContent(content);
            infoWindowRef.current.open(map, marker);
          }
        });

        serviceMarkersRef.current.set(vehicle.id, marker);

        // Мигалка 🚨 над сервисной машиной
        const sirenSvg2 = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"><text y="22" font-size="22">🚨</text></svg>`;
        const sirenIcon2 = {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(sirenSvg2),
          scaledSize: new google.maps.Size(28, 28),
          anchor: new google.maps.Point(14, 42), // выше основного маркера
        };
        const sirenMarker = new google.maps.Marker({
          position,
          map,
          icon: sirenIcon2,
          zIndex: 2600,
          optimized: false,
        });
        (marker as any)._sirenMarker = sirenMarker;

        // Анимация мигания через setInterval
        let sirenVisible = true;
        const sirenInterval = setInterval(() => {
          sirenVisible = !sirenVisible;
          sirenMarker.setOpacity(sirenVisible ? 1 : 0.2);
        }, 500);
        (marker as any)._sirenInterval = sirenInterval;

        // Строим маршрут по дорогам через Directions API
        const targetTruck = activeTrucks.find((t: any) => t.id === vehicle.targetTruckId);
        if (targetTruck) {
          const directionsService = new google.maps.DirectionsService();
          const origin = { lat: vehicle.position[1], lng: vehicle.position[0] };
          const destination = { lat: targetTruck.position[1], lng: targetTruck.position[0] };
          directionsService.route({
            origin,
            destination,
            travelMode: google.maps.TravelMode.DRIVING,
          }, (result: any, status: any) => {
            if (status === 'OK' && result) {
              // Сохраняем точки маршрута для анимации
              const routePoints = result.routes[0].overview_path.map((p: any) => ({ lat: p.lat(), lng: p.lng() }));
              (marker as any)._routePoints = routePoints;
              (marker as any)._routeIdx = 0;

              // Рисуем polyline по дороге
              const existingPolyline = servicePolylinesRef.current.get(vehicle.id);
              if (existingPolyline) existingPolyline.setMap(null);

              const polyline = new google.maps.Polyline({
                path: routePoints,
                geodesic: true,
                strokeColor: '#06b6d4',
                strokeOpacity: 0,
                strokeWeight: 0,
                icons: [{
                  icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.8, scale: 3, strokeColor: '#06b6d4' },
                  offset: '0',
                  repeat: '12px',
                }],
                map,
                zIndex: 100,
              });
              servicePolylinesRef.current.set(vehicle.id, polyline);
            }
          });
        }
      } else {
        // Позиция обновляется в animLoop по routePoints — ничего не делаем
        // Но если маршрут ещё не построен — обновляем напрямую
        if (!(marker as any)._routePoints) {
          marker.setPosition(position);
          const sirenMarker = (marker as any)._sirenMarker;
          if (sirenMarker) sirenMarker.setPosition(position);
        }
      }

      // Рисуем маршрут (polyline) от текущей позиции к траку
      let polyline = servicePolylinesRef.current.get(vehicle.id);
      if (!polyline && vehicle.route && vehicle.route.length > 1) {
        // vehicle.route хранится как [[lng, lat], ...] (GeoJSON стандарт)
        const path = vehicle.route.map(([lng, lat]: [number, number]) => ({ lat, lng }));
        polyline = new google.maps.Polyline({
          path,
          geodesic: false,
          strokeColor: '#06b6d4',
          strokeOpacity: 0.6,
          strokeWeight: 3,
          map,
          zIndex: 100,
        });
        servicePolylinesRef.current.set(vehicle.id, polyline);
      }
    });
  }, [activeServiceVehicles.length, activeServiceVehicles.map((v: any) => `${v.id}:${v.progress}`).join('|'), mapLoaded]);

  const directionsRenderersRef = useRef<Map<string, any>>(new Map());
  const routeCacheRef = useRef<Map<string, string>>(new Map());

  // ── ОТРИСОВКА МАРШРУТОВ ПО ДОРОГАМ ──────────────────────────────────────
  useEffect(() => {
    if (!googleMapRef.current || !mapLoaded) return;

    const google = window.google;
    if (!google || !google.maps) return;

    const map = googleMapRef.current;

    // Удаляем маршруты которых больше нет
    const activeIds = new Set(
      activeTrucks
        .filter((t: any) => (t.status === 'loaded' || t.status === 'driving') && t.destinationCity)
        .map((t: any) => t.id)
    );
    directionsRenderersRef.current.forEach((renderer, truckId) => {
      if (!activeIds.has(truckId)) {
        renderer.setMap(null);
        directionsRenderersRef.current.delete(truckId);
        routeCacheRef.current.delete(truckId);
      }
    });

    // Рисуем маршруты
    activeTrucks.forEach((truck: any) => {
      if (truck.status !== 'loaded' && truck.status !== 'driving') return;
      if (!truck.destinationCity) return;

      const cacheKey = `${truck.id}:${truck.destinationCity}`;
      if (routeCacheRef.current.get(truck.id) === cacheKey) return; // уже нарисован
      routeCacheRef.current.set(truck.id, cacheKey);

      const color = getTruckColor(truck, gameMinute);

      // Удаляем старый
      const old = directionsRenderersRef.current.get(truck.id);
      if (old) old.setMap(null);

      // Если есть реальный маршрут из OSRM (routePath) — используем его
      if (truck.routePath && truck.routePath.length > 1) {
        const path = truck.routePath.map(([lng, lat]: [number, number]) => ({ lat, lng }));
        const polyline = new google.maps.Polyline({
          path,
          geodesic: false,
          strokeColor: color,
          strokeOpacity: 0.8,
          strokeWeight: 4,
          map,
        });
        directionsRenderersRef.current.set(truck.id, { setMap: (m: any) => polyline.setMap(m) });
        return;
      }

      // Нет OSRM маршрута — запрашиваем через Google Directions API
      const origin = { lat: truck.position[1], lng: truck.position[0] };
      const dest = CITIES[truck.destinationCity];
      if (!dest) return;
      const destination = { lat: dest[1], lng: dest[0] };

      const renderer = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true,
        preserveViewport: true,
        polylineOptions: {
          strokeColor: color,
          strokeOpacity: 0.85,
          strokeWeight: 5,
        },
      });
      directionsRenderersRef.current.set(truck.id, renderer);

      const service = new google.maps.DirectionsService();
      service.route({
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
        avoidFerries: true,
      }, (result: any, status: any) => {
        if (status === 'OK') {
          renderer.setDirections(result);
        } else {
          // Последний fallback — прямая линия
          renderer.setMap(null);
          const line = new google.maps.Polyline({
            path: [origin, destination],
            geodesic: true,
            strokeColor: color,
            strokeOpacity: 0.5,
            strokeWeight: 3,
            map,
          });
          directionsRenderersRef.current.set(truck.id, { setMap: (m: any) => line.setMap(m) });
        }
      });
    });
  }, [
    activeTrucks.map((t: any) => `${t.id}:${t.status}:${t.destinationCity}:${t.routePath?.length ?? 0}`).join('|'),
    mapLoaded
  ]);

  // ── ОБРАБОТЧИК КЛИКА НА ТРАК ─────────────────────────────────────────────
  const handleTruckClick = useCallback((truck: any) => {
    // Toggle — повторный клик на тот же трак снимает выделение
    if (selectedTruck?.id === truck.id) {
      setSelectedTruck(null);
      if (onTruckSelect) {
        onTruckSelect('');
      }
      // Закрываем InfoWindow если открыт (для сервисных машин)
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
      return;
    }

    setSelectedTruck(truck);
    
    if (onTruckSelect) {
      onTruckSelect(truck.id);
    }

    // Центрируем карту на трак (HUD теперь в TruckCardOverlay)
    if (googleMapRef.current) {
      const position = { lat: truck.position[1], lng: truck.position[0] };
      googleMapRef.current.panTo(position);
    }
  }, [onTruckSelect, selectedTruck]);

  // ── СЛЕДОВАНИЕ ЗА ТРАКОМ (НАЧАЛЬНАЯ ЦЕНТРОВКА) ──────────────────────────
  useEffect(() => {
    if (!followTruck || !googleMapRef.current || !mapLoaded) return;

    // Режим 1: Google Navigation — tilt, heading
    const targetId = followTruckIdRef.current || selectedTruck?.id;
    const truck = activeTrucks.find((t: any) => t.id === targetId) || activeTrucks[0];
    
    if (truck && googleMapRef.current) {
      const position = { lat: truck.position[1], lng: truck.position[0] };
      lastFollowPositionRef.current = null;
      smoothCamLatRef.current = position.lat;
      smoothCamLngRef.current = position.lng;
      centerOnIdRef.current = null;
      followServiceIdRef.current = null;
      // Google Navigation: центрируем с tilt, без изменения zoom
      googleMapRef.current.moveCamera({
        center: position,
        heading: 0,
        tilt: 65,
      });
      smoothHeadingRef.current = 0;

      // Ограничиваем zoom 5-12 в Navigation режиме
      googleMapRef.current.setOptions({ minZoom: 5, maxZoom: 13 });
      // Устанавливаем начальный zoom подальше
      const navZoom = 9;
      userZoomRef.current = navZoom;
      googleMapRef.current.setZoom(navZoom);
    }
  }, [followTruck]);


  // ── ЗАКРЫТИЕ МЕНЮ ПРИ КЛИКЕ ВНЕ ──────────────────────────────────────────
  useEffect(() => {
    if (!mapTypeMenuOpen && !followMenuOpen) return;
    
    const handleClickOutside = () => {
      setMapTypeMenuOpen(false);
      setFollowMenuOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mapTypeMenuOpen, followMenuOpen]);

  // ── FOLLOW TRUCK FROM CARD CLICK ──────────────────────────────────────────
  useEffect(() => {
    function handleFollowFromCard(e: Event) {
      const { truckId } = (e as CustomEvent).detail;
      // Снимаем слежение за сервисной машиной
      followServiceIdRef.current = null;
      if (!truckId) {
        // Снимаем все режимы слежения
        centerOnIdRef.current = null;
        lastFollowPositionRef.current = null;
        setSelectedTruck(null);
        return;
      }
      const truck = activeTrucks.find((t: any) => t.id === truckId);
      if (truck) setSelectedTruck(truck);
      
      // Режим 2: простое центрирование без зума
      centerOnIdRef.current = truckId;
      lastFollowPositionRef.current = null;
      
      // Центрируем камеру на траке без изменения зума
      if (truck && googleMapRef.current) {
        const position = { lat: truck.position[1], lng: truck.position[0] };
        smoothCamLatRef.current = position.lat;
        smoothCamLngRef.current = position.lng;
        googleMapRef.current.moveCamera({
          center: position,
          heading: 0,
          tilt: 0,
          zoom: userZoomRef.current,
        });
      }
    }
    window.addEventListener('followTruckFromCard', handleFollowFromCard);
    return () => window.removeEventListener('followTruckFromCard', handleFollowFromCard);
  }, [activeTrucks, followTruck]);

  // ── FOLLOW ASSIGNED TRUCK — с медленным zoom out ──
  useEffect(() => {
    function handleFollowAssigned(e: Event) {
      const { truckId, zoomOut } = (e as CustomEvent).detail || {};
      if (!truckId || !googleMapRef.current || !mapLoaded) return;
      
      const truck = activeTrucks.find((t: any) => t.id === truckId);
      if (!truck) return;
      
      // Центрируем на траке
      const position = { lat: truck.position[1], lng: truck.position[0] };
      smoothCamLatRef.current = position.lat;
      smoothCamLngRef.current = position.lng;
      centerOnIdRef.current = truckId;
      lastFollowPositionRef.current = null;
      setSelectedTruck(truck);
      
      // Медленный zoom out если указан параметр
      if (zoomOut && typeof zoomOut === 'number') {
        const currentZoom = userZoomRef.current;
        const targetZoom = Math.max(3, currentZoom * (1 - zoomOut)); // уменьшаем на zoomOut процентов
        
        // Запускаем плавную анимацию zoom out (3 секунды)
        const duration = 3000; // 3 секунды
        const startTime = Date.now();
        const startZoom = currentZoom;
        
        const animateZoom = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Ease-out cubic для плавности
          const eased = 1 - Math.pow(1 - progress, 3);
          const newZoom = startZoom + (targetZoom - startZoom) * eased;
          
          if (googleMapRef.current) {
            userZoomRef.current = newZoom;
            googleMapRef.current.moveCamera({
              center: position,
              heading: 0,
              tilt: 0,
              zoom: newZoom,
            });
          }
          
          if (progress < 1) {
            requestAnimationFrame(animateZoom);
          }
        };
        
        requestAnimationFrame(animateZoom);
      } else {
        // Без zoom out — просто центрируем
        googleMapRef.current.moveCamera({
          center: position,
          heading: 0,
          tilt: 0,
          zoom: userZoomRef.current,
        });
      }
    }
    
    window.addEventListener('followAssignedTruck', handleFollowAssigned);
    return () => window.removeEventListener('followAssignedTruck', handleFollowAssigned);
  }, [activeTrucks, mapLoaded]);

  // ── FOLLOW SERVICE VEHICLE — Режим 2: простое центрирование ──
  useEffect(() => {
    function handleFollowService(e: Event) {
      const { serviceId, lng, lat } = (e as CustomEvent).detail || {};
      if (!googleMapRef.current || !mapLoaded) return;
      // Отключаем Navigation режим (Режим 1)
      setFollowTruck(false);
      followTruckIdRef.current = null;
      cinematicZoomRef.current = null;
      userDraggedRef.current = false;
      // Снимаем ограничения zoom от Navigation режима
      googleMapRef.current.setOptions({ minZoom: 3, maxZoom: 21 });
      // Режим 2: простое центрирование за сервисной машиной
      centerOnIdRef.current = null;
      followServiceIdRef.current = serviceId || '__service__';
      lastFollowPositionRef.current = null;
      // Сбрасываем tilt/heading и центрируем
      if (lng && lat) {
        googleMapRef.current.moveCamera({
          center: { lat, lng }, heading: 0, tilt: 0, zoom: userZoomRef.current,
        });
      }
    }
    function handleStopFollowService() {
      followServiceIdRef.current = null;
    }
    window.addEventListener('followServiceVehicle', handleFollowService);
    window.addEventListener('stopFollowService', handleStopFollowService);
    return () => {
      window.removeEventListener('followServiceVehicle', handleFollowService);
      window.removeEventListener('stopFollowService', handleStopFollowService);
    };
  }, [mapLoaded]);

  // Единый стиль для всех 3 квадратных кнопок
  const btnStyle = (active = false): React.CSSProperties => ({
    width: 44,
    height: 44,
    borderRadius: 10,
    background: active ? 'rgba(6,182,212,0.95)' : 'rgba(15,23,42,0.92)',
    backdropFilter: 'blur(12px)',
    border: active ? '1px solid rgba(6,182,212,0.8)' : '1px solid rgba(255,255,255,0.12)',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
    flexShrink: 0,
    transition: 'all 0.15s',
  });

  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* CSS для скрытия элементов Google Maps */}
      <style>{`
        /* Разрешаем мультитач на карте */
        .gm-style, .gm-style * {
          touch-action: pan-x pan-y pinch-zoom !important;
        }

        /* Скрываем логотип Google */
        .gm-style a[href^="https://maps.google.com/maps"] {

        /* Пульс кнопки слежения при попытке сдвинуть карту */
        @keyframes followPulse {
          0%   { box-shadow: 0 0 0 0 rgba(6,182,212,0.8), 0 0 0 0 rgba(6,182,212,0.4); }
          50%  { box-shadow: 0 0 0 8px rgba(6,182,212,0.3), 0 0 0 16px rgba(6,182,212,0.1); }
          100% { box-shadow: 0 0 0 0 rgba(6,182,212,0), 0 0 0 0 rgba(6,182,212,0); }
        }
        .follow-pulse {
          animation: followPulse 0.6s ease-out 3;
          background: rgba(6,182,212,1) !important;
          border-color: #fff !important;
        }
          display: none !important;
        }
        
        /* Скрываем копирайты и ссылки внизу */
        .gm-style-cc {
          display: none !important;
        }
        
        /* Скрываем "Report a map error" но НЕ переключатель карты */
        .gmnoprint a[href^="https://maps.google.com/maps/api/js/error"] {
          display: none !important;
        }
        
        /* Скрываем Terms of Use */
        .gm-style .gm-style-cc a {
          display: none !important;
        }
        
        /* Показываем и стилизуем переключатель типа карты */
        .gm-style .gm-style-mtc {
          display: block !important;
          margin: 10px !important;
        }
        
        /* Стилизуем кнопки переключателя */
        .gm-style .gm-style-mtc button {
          background: rgba(15, 23, 42, 0.95) !important;
          color: #e2e8f0 !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 8px !important;
          padding: 8px 12px !important;
          font-size: 13px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
        }
        
        .gm-style .gm-style-mtc button:hover {
          background: rgba(6, 182, 212, 0.2) !important;
          border-color: rgba(6, 182, 212, 0.4) !important;
        }

        /* Подписи траков — под точкой как city label */
        .truck-label {
          margin-top: 18px !important;
          text-shadow: 0 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.7) !important;
          font-family: -apple-system, sans-serif !important;
        }
        .sv-active .gm-svpc { display: none !important; }
        .sv-active .gm-iv-close { display: none !important; }
        .sv-active .gm-iv-address { display: none !important; }
        .sv-active .gm-iv-marker { display: none !important; }
        .sv-active .gm-bundled-control { display: none !important; }
        .sv-active .gm-iv-back-button { display: none !important; }
        .sv-active .gm-iv-short-address { display: none !important; }
        .sv-active .gmnoprint { display: none !important; }
        .sv-active .gm-style-pbc { display: none !important; }
        .sv-active .gm-style-pbt { display: none !important; }
        .sv-active .gm-style-cc { display: none !important; }
        .sv-active .gm-control-active { display: none !important; }
        .sv-active [title="Zoom in"] { display: none !important; }
        .sv-active [title="Zoom out"] { display: none !important; }
        .sv-active button[draggable="false"] { display: none !important; }
        /* Верхний левый угол — логотип, стрелка назад, название */
        .sv-active .gm-style-mtc { display: none !important; }
        .sv-active .gm-style > div > div:first-child > div { display: none !important; }
        /* Все оверлеи поверх панорамы */
        .sv-active .gm-iv-container { display: none !important; }
        /* Ссылки Google внизу */
        .sv-active a[href*="google"] { display: none !important; }
        /* Любые кнопки внутри street view */
        .sv-active .gm-style button { display: none !important; }
      `}</style>

      {/* Контейнер карты */}
      <div
        ref={mapRef}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Кнопки zoom — слева снизу */}
      <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <button
            onTouchStart={(e) => { e.stopPropagation(); const z = (googleMapRef.current?.getZoom() ?? 10) + 1; googleMapRef.current?.setZoom(z); userZoomRef.current = z; }}
            onClick={() => { const z = (googleMapRef.current?.getZoom() ?? 10) + 1; googleMapRef.current?.setZoom(z); userZoomRef.current = z; }}
            style={btnStyle()}
          >
            <span style={{ fontSize: 22, lineHeight: 1 }}>+</span>
          </button>
          <button
            onTouchStart={(e) => { e.stopPropagation(); const z = (googleMapRef.current?.getZoom() ?? 10) - 1; googleMapRef.current?.setZoom(z); userZoomRef.current = z; }}
            onClick={() => { const z = (googleMapRef.current?.getZoom() ?? 10) - 1; googleMapRef.current?.setZoom(z); userZoomRef.current = z; }}
            style={btnStyle()}
          >
            <span style={{ fontSize: 22, lineHeight: 1 }}>−</span>
          </button>
        </div>

      {/* 3 квадратные кнопки — справа, снизу вверх */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column-reverse',
          gap: 8,
        }}
      >
        {/* 1. Переключатель карты (снизу) */}
        <div style={{ position: 'relative' }}>
            {mapTypeMenuOpen && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: '100%',
                marginRight: 8,
                background: 'rgba(15,23,42,0.97)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                overflow: 'hidden',
                minWidth: 130,
              }}>
                {[
                  { id: 'hybrid',   icon: '🌐', label: 'Гибрид'  },
                  { id: 'roadmap',  icon: '🗺️', label: 'Карта'   },
                  { id: 'satellite',icon: '🛰️', label: 'Спутник' },
                  { id: 'terrain',  icon: '⛰️', label: 'Рельеф'  },
                ].map(t => (
                  <button key={t.id} onClick={() => {
                    googleMapRef.current?.setMapTypeId(t.id);
                    setCurrentMapType(t.id as any);
                    setMapTypeMenuOpen(false);
                  }} style={{
                    width: '100%', padding: '9px 12px',
                    background: currentMapType === t.id ? 'rgba(6,182,212,0.2)' : 'transparent',
                    border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)',
                    color: currentMapType === t.id ? '#38bdf8' : '#e2e8f0',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => { setMapTypeMenuOpen(!mapTypeMenuOpen); setFollowMenuOpen(false); }} style={btnStyle()}>
              <span style={{ fontSize: 20 }}>
                {currentMapType === 'hybrid' ? '🌐' : currentMapType === 'roadmap' ? '🗺️' : currentMapType === 'satellite' ? '🛰️' : '⛰️'}
              </span>
            </button>
          </div>

        {/* 2. Слежение за траком */}
        <div style={{ position: 'relative' }}>
            {followMenuOpen && activeTrucks.length > 0 && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: '100%',
                marginRight: 8,
                background: 'rgba(15,23,42,0.97)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10,
                overflow: 'hidden',
                minWidth: 200,
                maxHeight: 280,
                overflowY: 'auto',
              }}>
                {activeTrucks.map((truck: any) => (
                  <button key={truck.id} onClick={() => {
                    // Режим 1: Google Navigation
                    centerOnIdRef.current = null;
                    followServiceIdRef.current = null;
                    followTruckIdRef.current = truck.id;
                    setFollowMenuOpen(false);
                    setSelectedTruck(truck);
                    userDraggedRef.current = false;
                    smoothReturnRef.current = null;
                    
                    if (googleMapRef.current) {
                      const position = { lat: truck.position[1], lng: truck.position[0] };
                      smoothHeadingRef.current = 0;
                      googleMapRef.current.moveCamera({
                        center: position,
                        heading: 0,
                        tilt: 65,
                      });
                    }
                    if (!followTruck) setFollowTruck(true);
                  }} style={{
                    width: '100%', padding: '9px 12px',
                    background: followTruckIdRef.current === truck.id && followTruck ? 'rgba(6,182,212,0.2)' : 'transparent',
                    border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)',
                    color: followTruckIdRef.current === truck.id && followTruck ? '#38bdf8' : '#e2e8f0',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: getTruckColor(truck, gameMinute), flexShrink: 0 }} />
                      <span style={{ fontWeight: 700 }}>{truck.name}</span>
                    </div>
                    <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2, paddingLeft: 16 }}>
                      {truck.currentCity} → {truck.destinationCity || 'Свободен'}
                    </div>
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => {
                if (followTruck) {
                  setFollowTruck(false);
                  followTruckIdRef.current = null;
                  setFollowMenuOpen(false);
                  lastFollowPositionRef.current = null;
                  userDraggedRef.current = false;
                  cinematicZoomRef.current = null;
                  smoothReturnRef.current = null;
                  
                  // Очищаем таймер возврата
                  if (returnToTruckTimerRef.current) {
                    clearTimeout(returnToTruckTimerRef.current);
                    returnToTruckTimerRef.current = null;
                  }
                  
                  if (googleMapRef.current) {
                    // Плавный сброс: tilt → 0, heading → 0, zoom остаётся
                    googleMapRef.current.moveCamera({ tilt: 0, heading: 0 });
                    // Снимаем ограничения zoom
                    googleMapRef.current.setOptions({ minZoom: 3, maxZoom: 21 });
                    userZoomRef.current = Math.max(6, userZoomRef.current);
                  }
                } else {
                  setFollowMenuOpen(!followMenuOpen);
                  setMapTypeMenuOpen(false);
                }
              }}
              style={btnStyle(followTruck)}
              className={followDragPulse ? 'follow-pulse' : ''}
            >
              <span style={{ fontSize: 20 }}>🎯</span>
            </button>
          </div>

      </div>

      {/* Сообщение о загрузке с прогресс-баром */}
      {!mapLoaded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
          border: '1px solid rgba(6,182,212,0.25)',
          borderRadius: 20,
          padding: '32px 40px',
          textAlign: 'center',
          zIndex: 2000,
          minWidth: 260,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(6,182,212,0.1)',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12, filter: 'drop-shadow(0 0 16px rgba(6,182,212,0.5))' }}>
            🚛
          </div>
          <p style={{ margin: '0 0 4px 0', fontSize: 18, fontWeight: 900, color: '#fff' }}>
            Dispatch Office
          </p>
          <p style={{ margin: '0 0 24px 0', fontSize: 12, color: '#38bdf8', fontWeight: 600 }}>
            Загружаем карту...
          </p>
          <div style={{
            width: '100%', height: 5,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 3, overflow: 'hidden', marginBottom: 10,
          }}>
            <div style={{
              width: `${loadingProgress}%`, height: '100%',
              background: 'linear-gradient(90deg, #06b6d4, #818cf8)',
              borderRadius: 3, transition: 'width 0.3s ease',
              boxShadow: '0 0 8px rgba(6,182,212,0.7)',
            }} />
          </div>
          <p style={{ margin: 0, fontSize: 12, color: '#475569', fontWeight: 700 }}>
            {loadingProgress < 100 ? `${loadingProgress}%` : '✓ Готово'}
          </p>
        </div>
      )}
    </View>
  );
}

// ── СТИЛИ ТЁМНОЙ ТЕМЫ ДЛЯ GOOGLE MAPS ───────────────────────────────────────
function getDarkMapStyles() {
  return [
    { elementType: "geometry", stylers: [{ color: "#1a1f2e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#1a1f2e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#e2e8f0" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#64748b" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#1e3a2f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#4ade80" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#2d3748" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1a202c" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#cbd5e0" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#3d4a5c" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1a202c" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#e2e8f0" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2d3748" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#94a3b8" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#0f172a" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#475569" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#0f172a" }],
    },
  ];
}

// ── СТИЛИ ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  text: {
    color: '#e2e8f0',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});
