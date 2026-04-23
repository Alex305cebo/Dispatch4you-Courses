import { useEffect, useRef, useState, useCallback } from "react";
import { View, StyleSheet, Platform, Text } from "react-native";
import { useGameStore } from "../store/gameStore";
import { useThemeStore } from "../store/themeStore";
import { CITIES, CITY_STATE } from "../constants/config";

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

// ── ИКОНКА ТРАКА: Google Maps SymbolPath стрелка с направлением ──────────────
function getTruckMarkerIcon(google: any, color: string, heading: number = 0) {
  return {
    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
    scale: 7,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2,
    rotation: heading, // направление движения в градусах (0 = север, 90 = восток)
  };
}

// Вычисляем угол направления от точки A к точке B (в градусах, 0 = север)
function computeHeading(fromLat: number, fromLng: number, toLat: number, toLng: number): number {
  const dLng = (toLng - fromLng) * Math.PI / 180;
  const lat1 = fromLat * Math.PI / 180;
  const lat2 = toLat * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const heading = Math.atan2(y, x) * 180 / Math.PI;
  return (heading + 360) % 360;
}
function smoothPanTo(map: any, targetLat: number, targetLng: number, duration: number = 1000) {
  const start = map.getCenter();
  const startLat = start.lat();
  const startLng = start.lng();
  
  const startTime = Date.now();
  
  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (ease-out cubic)
    const eased = 1 - Math.pow(1 - progress, 3);
    
    const currentLat = startLat + (targetLat - startLat) * eased;
    const currentLng = startLng + (targetLng - startLng) * eased;
    
    map.setCenter({ lat: currentLat, lng: currentLng });
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }
  
  animate();
}

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
  const lastFollowPositionRef = useRef<{lat: number, lng: number} | null>(null);
  const [selectedTruck, setSelectedTruck] = useState<any>(null);
  const [mapTypeMenuOpen, setMapTypeMenuOpen] = useState(false);
  const [followMenuOpen, setFollowMenuOpen] = useState(false);
  const [currentMapType, setCurrentMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('hybrid');
  const [streetViewActive, setStreetViewActive] = useState(false);

  const { trucks, availableLoads, phase, gameMinute } = useGameStore();
  const { mode: themeMode, colors: T } = useThemeStore();
  const activeTrucks = phase !== 'menu' ? trucks : [];

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

    // Создаём callback для инициализации
    window.initGoogleMap = () => {
      console.log('✅ Google Maps API загружен успешно');
      clearInterval(progressInterval);
      setLoadingProgress(100);
      setTimeout(() => setMapLoaded(true), 300); // Небольшая задержка для плавности
    };

    // Загружаем скрипт Google Maps (только geometry, без лишних библиотек)
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initGoogleMap&libraries=geometry&loading=async`;
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
      delete window.initGoogleMap;
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
        north: 49.384358,  // Северная граница (Канада)
        south: 24.396308,  // Южная граница (Мексика)
        west: -125.0,      // Западная граница (Тихий океан)
        east: -66.93457,   // Восточная граница (Атлантика)
      };

      // Создаём карту с центром на США и спутниковым видом
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 39.8283, lng: -98.5795 }, // Центр США
        zoom: 5,
        mapTypeId: 'hybrid', // Спутниковый вид с дорогами
        restriction: {
          latLngBounds: usaBounds,
          strictBounds: false,
        },
        minZoom: 4,
        maxZoom: 18,
        disableDefaultUI: true, // Отключаем все стандартные контролы
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false, // Сделаем кастомный
        rotateControl: false,
        fullscreenControl: false,
        gestureHandling: 'greedy',
      });

      googleMapRef.current = map;

      // Создаём InfoWindow для показа информации о траке
      infoWindowRef.current = new google.maps.InfoWindow();

      // Слушаем Street View — скрываем/показываем наши кнопки
      const panorama = map.getStreetView();
      panorama.setOptions({
        zoomControl: false,
        panControl: false,
        fullscreenControl: false,
        addressControl: false,
        enableCloseButton: false,
        motionTracking: false,
        motionTrackingControl: false,
      });
      panorama.addListener('visible_changed', () => {
        const isVisible = panorama.getVisible();
        setStreetViewActive(isVisible);
        // Шлём событие наружу чтобы game.tsx мог скрыть TruckCardOverlay
        window.dispatchEvent(new CustomEvent('streetViewChanged', { detail: { active: isVisible } }));
      });

      console.log('✅ Google Maps инициализирована успешно (спутниковый вид, только США)');
    } catch (error) {
      console.error('❌ Ошибка при инициализации карты:', error);
    }
  }, [mapLoaded]);

  // ── ОБНОВЛЕНИЕ МАРКЕРОВ ТРАКОВ (РЕАКТИВНОЕ) ──────────────────────────────
  useEffect(() => {
    if (!googleMapRef.current || !mapLoaded) return;

    const google = window.google;
    if (!google || !google.maps) return;

    console.log('🔄 Обновление позиций маркеров:', activeTrucks.length, 'траков');

    // Обновляем позиции и цвета всех существующих маркеров
    activeTrucks.forEach((truck: any) => {
      const marker = markersRef.current.get(truck.id);
      if (marker) {
        const newPosition = { lat: truck.position[1], lng: truck.position[0] };
        const newColor = getTruckColor(truck, gameMinute);
        
        // Обновляем позицию
        marker.setPosition(newPosition);
        
        // Обновляем иконку (стрелка по цвету и направлению)
        let heading = 0;
        if (truck.destinationCity && CITIES[truck.destinationCity]) {
          const dest = CITIES[truck.destinationCity];
          heading = computeHeading(newPosition.lat, newPosition.lng, dest[1], dest[0]);
        }
        marker.setIcon(getTruckMarkerIcon(google, newColor, heading));

        console.log(`📍 Обновлён маркер ${truck.id}:`, {
          position: newPosition,
          color: newColor,
          status: truck.status,
        });

        // Если включено слежение за этим траком — плавно центрируем карту
        if (followTruck) {
          const targetId = followTruckIdRef.current || selectedTruck?.id;
          if (truck.id === targetId || (!targetId && activeTrucks[0]?.id === truck.id)) {
            const lastPos = lastFollowPositionRef.current;
            
            // Проверяем, изменилась ли позиция достаточно сильно
            if (!lastPos || 
                Math.abs(lastPos.lat - newPosition.lat) > 0.0001 || 
                Math.abs(lastPos.lng - newPosition.lng) > 0.0001) {
              
              // Очень плавное перемещение камеры (2 секунды)
              smoothPanTo(googleMapRef.current, newPosition.lat, newPosition.lng, 2000);
              lastFollowPositionRef.current = newPosition;
              
              // Устанавливаем zoom только если он слишком далёкий
              const currentZoom = googleMapRef.current.getZoom();
              if (currentZoom < 8) {
                googleMapRef.current.setZoom(8);
              }
            }
          }
        }
      }
    });
  }, [activeTrucks, gameMinute, mapLoaded, followTruck, selectedTruck]);

  // ── СОЗДАНИЕ/УДАЛЕНИЕ МАРКЕРОВ ТРАКОВ ────────────────────────────────────
  useEffect(() => {
    if (!googleMapRef.current || !mapLoaded) {
      console.log('⏸️ Ожидание карты для маркеров:', { hasMap: !!googleMapRef.current, mapLoaded });
      return;
    }

    const google = window.google;
    if (!google || !google.maps) {
      console.error('❌ Google Maps API не доступен для маркеров');
      return;
    }

    const map = googleMapRef.current;

    console.log('🔄 Обновление маркеров траков:', activeTrucks.length, 'траков');

    // Удаляем старые маркеры траков, которых больше нет
    const currentTruckIds = new Set(activeTrucks.map((t: any) => t.id));
    markersRef.current.forEach((marker, truckId) => {
      if (!currentTruckIds.has(truckId)) {
        marker.setMap(null);
        markersRef.current.delete(truckId);
        console.log('🗑️ Удалён маркер трака:', truckId);
      }
    });

    // Создаём маркеры для новых траков
    activeTrucks.forEach((truck: any) => {
      let marker = markersRef.current.get(truck.id);

      if (!marker) {
        const position = { lat: truck.position[1], lng: truck.position[0] };
        const color = getTruckColor(truck, gameMinute);
        
        console.log(`➕ Создаём новый маркер для ${truck.id}:`, {
          name: truck.name,
          position,
          color,
          status: truck.status,
        });
        
        // Вычисляем направление движения
        let heading = 0;
        if (truck.destinationCity && CITIES[truck.destinationCity]) {
          const dest = CITIES[truck.destinationCity];
          heading = computeHeading(position.lat, position.lng, dest[1], dest[0]);
        }

        // Стрелка Google Maps по цвету статуса и направлению
        marker = new google.maps.Marker({
          position,
          map,
          title: `${truck.name} (${truck.id})`,
          icon: getTruckMarkerIcon(google, color, heading),
          zIndex: truck.status === 'loaded' ? 1000 : 500,
          optimized: false,
        });

        // Добавляем обработчик клика
        marker.addListener('click', () => {
          handleTruckClick(truck);
        });

        markersRef.current.set(truck.id, marker);
        console.log(`✅ Маркер создан для ${truck.id}`);
      }
    });

    console.log(`📍 Всего маркеров: ${markersRef.current.size}`);
  }, [activeTrucks.length, mapLoaded]); // Только когда количество траков меняется

  // ── ОТРИСОВКА МАРШРУТОВ ──────────────────────────────────────────────────
  useEffect(() => {
    if (!googleMapRef.current || !mapLoaded) return;

    const google = window.google;
    if (!google || !google.maps) return;

    const map = googleMapRef.current;

    // Удаляем старые маршруты
    polylinesRef.current.forEach((polyline) => {
      polyline.setMap(null);
    });
    polylinesRef.current.clear();

    // Рисуем маршруты для траков с грузом или едущих к погрузке
    activeTrucks.forEach((truck: any) => {
      if (truck.status === 'loaded' || truck.status === 'driving') {
        const origin = truck.currentCity;
        const destination = truck.status === 'loaded' ? truck.destination : truck.nextPickup;

        if (origin && destination && CITIES[origin] && CITIES[destination]) {
          const path = [
            { lat: CITIES[origin][1], lng: CITIES[origin][0] },
            { lat: CITIES[destination][1], lng: CITIES[destination][0] },
          ];

          const polyline = new google.maps.Polyline({
            path,
            geodesic: true,
            strokeColor: getTruckColor(truck, gameMinute),
            strokeOpacity: 0.6,
            strokeWeight: 3,
            map,
          });

          polylinesRef.current.set(truck.id, polyline);
        }
      }
    });

    console.log(`🛣️ Отрисовано ${polylinesRef.current.size} маршрутов`);
  }, [activeTrucks, gameMinute, mapLoaded]);

  // ── ОБРАБОТЧИК КЛИКА НА ТРАК ─────────────────────────────────────────────
  const handleTruckClick = useCallback((truck: any) => {
    setSelectedTruck(truck);
    
    if (onTruckSelect) {
      onTruckSelect(truck.id);
    }

    // Показываем InfoWindow с информацией о траке
    if (infoWindowRef.current && googleMapRef.current) {
      const marker = markersRef.current.get(truck.id);
      if (marker) {
        const content = `
          <div style="padding:8px;min-width:200px;color:#000;">
            <h3 style="margin:0 0 8px 0;font-size:16px;font-weight:700;">${truck.name}</h3>
            <p style="margin:4px 0;font-size:13px;"><strong>Водитель:</strong> ${truck.driver}</p>
            <p style="margin:4px 0;font-size:13px;"><strong>Статус:</strong> ${STATUS_EMOJI[truck.status]} ${STATUS_LABEL[truck.status]}</p>
            <p style="margin:4px 0;font-size:13px;"><strong>Город:</strong> ${truck.currentCity}</p>
            ${truck.destinationCity ? `<p style="margin:4px 0;font-size:13px;"><strong>Пункт назначения:</strong> ${truck.destinationCity}</p>` : ''}
            <p style="margin:4px 0;font-size:13px;"><strong>HOS:</strong> ${truck.hoursLeft.toFixed(1)} / 11 ч</p>
            <p style="margin:4px 0;font-size:13px;"><strong>Пробег:</strong> ${truck.totalMiles.toLocaleString()} миль</p>
          </div>
        `;
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(googleMapRef.current, marker);
      }
    }
  }, [onTruckSelect]);

  // ── СЛЕДОВАНИЕ ЗА ТРАКОМ (НАЧАЛЬНАЯ ЦЕНТРОВКА) ──────────────────────────
  useEffect(() => {
    if (!followTruck || !googleMapRef.current || !mapLoaded) return;

    // При включении слежения — сразу центрируем на траке
    const targetId = followTruckIdRef.current || selectedTruck?.id;
    const truck = activeTrucks.find((t: any) => t.id === targetId) || activeTrucks[0];
    
    if (truck && googleMapRef.current) {
      const position = { lat: truck.position[1], lng: truck.position[0] };
      googleMapRef.current.panTo(position);
      googleMapRef.current.setZoom(8);
    }
  }, [followTruck]); // Срабатывает только при включении/выключении слежения

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

  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* CSS для скрытия элементов Google Maps */}
      <style>{`
        /* Скрываем логотип Google */
        .gm-style a[href^="https://maps.google.com/maps"] {
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

        /* ── STREET VIEW: скрываем ВСЁ ── */
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
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} className={streetViewActive ? 'sv-active' : ''} />

      {/* Кастомный переключатель типа карты (внизу слева, открывается вверх) */}
      {!streetViewActive && (
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          zIndex: 1000,
        }}
      >
        {/* Меню (открывается вверх) */}
        {mapTypeMenuOpen && (
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            marginBottom: 8,
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            overflow: 'hidden',
            minWidth: 140,
          }}>
            {[
              { id: 'hybrid', label: '🌐 Гибрид', name: 'Гибрид' },
              { id: 'roadmap', label: '🗺️ Карта', name: 'Карта' },
              { id: 'satellite', label: '🛰️ Спутник', name: 'Спутник' },
              { id: 'terrain', label: '⛰️ Рельеф', name: 'Рельеф' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  if (googleMapRef.current) {
                    googleMapRef.current.setMapTypeId(type.id);
                    setCurrentMapType(type.id as any);
                    setMapTypeMenuOpen(false);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: currentMapType === type.id ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                  border: 'none',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  color: currentMapType === type.id ? '#38bdf8' : '#e2e8f0',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (currentMapType !== type.id) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentMapType !== type.id) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {type.label}
              </button>
            ))}
          </div>
        )}

        {/* Кнопка переключателя */}
        <button
          onClick={() => setMapTypeMenuOpen(!mapTypeMenuOpen)}
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            padding: '10px 14px',
            color: '#e2e8f0',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {currentMapType === 'hybrid' && '🌐 Гибрид'}
          {currentMapType === 'roadmap' && '🗺️ Карта'}
          {currentMapType === 'satellite' && '🛰️ Спутник'}
          {currentMapType === 'terrain' && '⛰️ Рельеф'}
          <span style={{ fontSize: 10 }}>▲</span>
        </button>
      </div>
      )}

      {/* Кнопки управления (справа снизу) */}
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'row',
          gap: 8,
          alignItems: 'flex-end',
        }}
      >
        {/* Кнопка следования за траком — скрыта в Street View */}
        {!streetViewActive && (
        <div style={{ position: 'relative' }}>
          {/* Меню выбора трака (открывается вверх) */}
          {followMenuOpen && activeTrucks.length > 0 && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              right: 0,
              marginBottom: 8,
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              overflow: 'hidden',
              minWidth: 200,
              maxHeight: 300,
              overflowY: 'auto',
            }}>
              {activeTrucks.map((truck: any) => (
                <button
                  key={truck.id}
                  onClick={() => {
                    followTruckIdRef.current = truck.id;
                    setFollowTruck(true);
                    setFollowMenuOpen(false);
                    setSelectedTruck(truck);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: followTruckIdRef.current === truck.id && followTruck ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    color: followTruckIdRef.current === truck.id && followTruck ? '#38bdf8' : '#e2e8f0',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (!(followTruckIdRef.current === truck.id && followTruck)) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(followTruckIdRef.current === truck.id && followTruck)) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: getTruckColor(truck, gameMinute),
                    }} />
                    <span>{truck.name}</span>
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                    {truck.currentCity} → {truck.destinationCity || 'Свободен'}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Кнопка слежения */}
          <button
            onClick={() => {
              if (followTruck) {
                // Выключаем слежение
                setFollowTruck(false);
                followTruckIdRef.current = null;
                setFollowMenuOpen(false);
              } else {
                // Открываем меню выбора трака
                setFollowMenuOpen(!followMenuOpen);
              }
            }}
            style={{
              background: followTruck ? 'rgba(6, 182, 212, 0.95)' : 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 8,
              padding: '10px 16px',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {followTruck ? (
              <>
                🎯 Слежение ВКЛ
                {followTruckIdRef.current && (
                  <span style={{ fontSize: 11, opacity: 0.8 }}>
                    ({activeTrucks.find((t: any) => t.id === followTruckIdRef.current)?.name})
                  </span>
                )}
              </>
            ) : (
              <>
                🎯 Следить за траком
                <span style={{ fontSize: 10 }}>▲</span>
              </>
            )}
          </button>
        </div>
        )}

        {/* Кнопка Street View (компактная, справа от слежения) */}
        <button
          onClick={() => {
            if (!googleMapRef.current) return;
            const google = window.google;
            if (!google || !google.maps) return;

            const panorama = googleMapRef.current.getStreetView();

            if (streetViewActive) {
              // Закрываем Street View
              panorama.setVisible(false);
            } else {
              // Определяем позицию
              let position: {lat: number, lng: number};
              if (selectedTruck) {
                position = { lat: selectedTruck.position[1], lng: selectedTruck.position[0] };
              } else if (followTruckIdRef.current) {
                const truck = activeTrucks.find((t: any) => t.id === followTruckIdRef.current);
                if (truck) {
                  position = { lat: truck.position[1], lng: truck.position[0] };
                } else {
                  position = googleMapRef.current.getCenter().toJSON();
                }
              } else {
                position = googleMapRef.current.getCenter().toJSON();
              }

              // Ищем ближайшую доступную панораму (радиус 50км)
              const sv = new google.maps.StreetViewService();
              sv.getPanorama(
                { location: position, radius: 50000, preference: google.maps.StreetViewPreference.NEAREST },
                (data: any, status: any) => {
                  if (status === google.maps.StreetViewStatus.OK) {
                    panorama.setPosition(data.location.latLng);
                    panorama.setOptions({
                      zoomControl: false,
                      panControl: false,
                      fullscreenControl: false,
                      addressControl: false,
                      linksControl: true,
                      enableCloseButton: false,
                      motionTracking: false,
                      motionTrackingControl: false,
                    });
                    panorama.setVisible(true);
                    // Скрываем оставшиеся DOM элементы
                    setTimeout(() => {
                      document.querySelectorAll('.gm-iv-back-button, .gm-iv-address, .gm-iv-short-address, .gm-svpc').forEach((el: any) => {
                        el.style.display = 'none';
                      });
                      if (mapRef.current) {
                        mapRef.current.querySelectorAll('.gmnoprint, .gm-style-cc, .gm-style-pbc, .gm-style-pbt').forEach((el: any) => {
                          el.style.display = 'none';
                        });
                      }
                    }, 400);
                  } else {
                    console.warn('Street View недоступен в этом месте:', status);
                    // Показываем уведомление
                    alert('Street View недоступен в этом районе');
                  }
                }
              );
            }
          }}
          style={{
            background: streetViewActive ? 'rgba(6, 182, 212, 0.95)' : 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(12px)',
            border: streetViewActive ? '1px solid rgba(6, 182, 212, 0.8)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            padding: '10px',
            color: '#fff',
            fontSize: 18,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            transition: 'all 0.2s',
          }}
          title={streetViewActive ? 'Закрыть Street View' : 'Street View'}
        >
          🚶
        </button>
      </div>

      {/* Информация о выбранном траке */}
      {selectedTruck && (
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 12,
          padding: 16,
          minWidth: 250,
          zIndex: 1000,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>
              {selectedTruck.name}
            </h4>
            <button
              onClick={() => setSelectedTruck(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                fontSize: 18,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              ×
            </button>
          </div>
          <p style={{ margin: '4px 0', fontSize: 13, color: '#e2e8f0' }}>
            <strong>Статус:</strong> {STATUS_EMOJI[selectedTruck.status]} {STATUS_LABEL[selectedTruck.status]}
          </p>
          <p style={{ margin: '4px 0', fontSize: 13, color: '#e2e8f0' }}>
            <strong>Город:</strong> {selectedTruck.currentCity}
          </p>
          {selectedTruck.destination && (
            <p style={{ margin: '4px 0', fontSize: 13, color: '#e2e8f0' }}>
              <strong>Пункт назначения:</strong> {selectedTruck.destination}
            </p>
          )}
          <p style={{ margin: '4px 0', fontSize: 13, color: '#e2e8f0' }}>
            <strong>HOS:</strong> {(selectedTruck.hoursOfService || selectedTruck.hoursLeft || 0).toFixed(1)} / 11 ч
          </p>
          {onTruckInfo && (
            <button
              onClick={() => onTruckInfo(selectedTruck.id)}
              style={{
                marginTop: 12,
                width: '100%',
                background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(14,165,233,0.15))',
                border: '1px solid rgba(6,182,212,0.3)',
                borderRadius: 8,
                padding: '8px 12px',
                color: '#06b6d4',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              📊 Подробнее
            </button>
          )}
        </div>
      )}

      {/* Сообщение о загрузке с прогресс-баром */}
      {!mapLoaded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(15, 23, 42, 0.98)',
          backdropFilter: 'blur(16px)',
          border: '2px solid rgba(6, 182, 212, 0.3)',
          borderRadius: 16,
          padding: 32,
          textAlign: 'center',
          zIndex: 2000,
          minWidth: 320,
          maxWidth: '90%',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        }}>
          <div style={{ marginBottom: 20 }}>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>
              🗺️ Загрузка карты
            </p>
            <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>
              Подключение к Google Maps...
            </p>
          </div>

          {/* Прогресс-бар */}
          <div style={{
            width: '100%',
            height: 8,
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 4,
            overflow: 'hidden',
            marginBottom: 16,
          }}>
            <div style={{
              width: `${loadingProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #06b6d4, #0ea5e9)',
              borderRadius: 4,
              transition: 'width 0.3s ease',
            }} />
          </div>

          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#06b6d4', marginBottom: 16 }}>
            {loadingProgress}%
          </p>

          {loadingProgress >= 90 && (
            <p style={{ margin: 0, fontSize: 11, color: '#64748b', fontStyle: 'italic' }}>
              Почти готово...
            </p>
          )}

          {/* Кнопка диагностики (только если долго грузится) */}
          {loadingProgress >= 50 && (
            <button
              onClick={() => {
                console.log('=== ДИАГНОСТИКА GOOGLE MAPS ===');
                console.log('API Key:', GOOGLE_MAPS_API_KEY?.substring(0, 20) + '...');
                console.log('window.google:', window.google ? 'Есть' : 'Нет');
                console.log('window.google.maps:', window.google?.maps ? 'Есть' : 'Нет');
                console.log('mapLoaded:', mapLoaded);
                console.log('loadingProgress:', loadingProgress);
                console.log('Скрипт в DOM:', document.querySelector('script[src*="maps.googleapis.com"]') ? 'Да' : 'Нет');
                const mapDiv = document.querySelector('[style*="width: 100%"][style*="height: 100%"]');
                console.log('Map container:', mapDiv ? `${mapDiv.offsetWidth}x${mapDiv.offsetHeight}px` : 'Не найден');
              }}
              style={{
                marginTop: 16,
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                borderRadius: 8,
                padding: '8px 16px',
                color: '#38bdf8',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🔍 Диагностика (F12 → Console)
            </button>
          )}
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
