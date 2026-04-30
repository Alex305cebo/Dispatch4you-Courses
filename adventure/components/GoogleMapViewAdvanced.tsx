import { useEffect, useRef, useState, useCallback } from "react";
import { View, StyleSheet, Platform, Text } from "react-native";
import { useGameStore } from "../store/gameStore";
import { useThemeStore } from "../store/themeStore";
import { CITIES, CITY_STATE } from "../constants/config";

// ── GOOGLE MAPS API KEY ──────────────────────────────────────────────────────
// ВАЖНО: Добавьте ключ в .env файл как EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY_HERE";

// ── ТИПЫ ─────────────────────────────────────────────────────────────────────
declare global {
  interface Window {
    google: any;
    initGoogleMapAdvanced: () => void;
  }
}

// ── КОНСТАНТЫ ────────────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  idle:        '#94a3b8',
  driving:     '#818cf8',
  loaded:      '#4ade80',
  at_pickup:   '#fbbf24',
  at_delivery: '#c084fc',
  breakdown:   '#f87171',
  waiting:     '#fb923c',
};

const STATUS_LABEL: Record<string, string> = {
  idle: "Свободен", driving: "Едет к погрузке", loaded: "Везёт груз",
  at_pickup: "На погрузке", at_delivery: "На разгрузке",
  breakdown: "Поломка", waiting: "Detention",
};

// ── ФУНКЦИИ УТИЛИТЫ ──────────────────────────────────────────────────────────
function getTruckColor(truck: any, gameMinute = 0): string {
  if ((truck as any).onNightStop || (truck as any).onMandatoryBreak) return "#64748b";
  if (truck.status === 'waiting') return "#64748b";
  if (truck.status === 'breakdown') return "#f87171";
  const outOfOrder = (truck as any).outOfOrderUntil;
  if (gameMinute > 0 && outOfOrder && typeof outOfOrder === 'number' && outOfOrder > gameMinute) return "#ff0000";
  if (truck.status === 'idle') {
    const warn = (truck as any).idleWarningLevel ?? 0;
    if (warn === 3) return "#ef4444";
    if (warn === 2) return "#f97316";
    if (warn === 1) return "#fbbf24";
  }
  return STATUS_COLOR[truck.status] || "#94a3b8";
}

// Создать иконку трака с направлением
function createTruckIcon(color: string, rotation: number = 0): any {
  return {
    path: 'M 0,-2 L 1.5,2 L 0,1.5 L -1.5,2 Z', // Стрелка вверх
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2,
    scale: 4,
    rotation: rotation,
    anchor: { x: 0, y: 0 },
  };
}

// Рассчитать угол поворота между двумя точками
function calculateBearing(start: {lat: number, lng: number}, end: {lat: number, lng: number}): number {
  const startLat = start.lat * Math.PI / 180;
  const startLng = start.lng * Math.PI / 180;
  const endLat = end.lat * Math.PI / 180;
  const endLng = end.lng * Math.PI / 180;

  const dLng = endLng - startLng;
  const y = Math.sin(dLng) * Math.cos(endLat);
  const x = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);
  
  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  return (bearing + 360) % 360;
}

// Плавное перемещение камеры с интерполяцией
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

// ── ГЛАВНЫЙ КОМПОНЕНТ ────────────────────────────────────────────────────────
export default function GoogleMapViewAdvanced({ onTruckInfo, onTruckSelect, onFindLoad }: {
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

// ── КОМПОНЕНТ GOOGLE MAPS С DIRECTIONS API ──────────────────────────────────
function GoogleMapComponent({ onTruckInfo, onTruckSelect, onFindLoad }: {
  onTruckInfo?: (truckId: string) => void;
  onTruckSelect?: (truckId: string) => void;
  onFindLoad?: (city: string) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const directionsRenderersRef = useRef<Map<string, any>>(new Map());
  const infoWindowRef = useRef<any>(null);
  const trafficLayerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [followTruck, setFollowTruck] = useState(false);
  const [showTraffic, setShowTraffic] = useState(false);
  const followTruckIdRef = useRef<string | null>(null);
  const lastFollowPositionRef = useRef<{lat: number, lng: number} | null>(null);
  const [selectedTruck, setSelectedTruck] = useState<any>(null);
  const [legendVisible, setLegendVisible] = useState(true);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [followMenuOpen, setFollowMenuOpen] = useState(false);

  const { trucks, availableLoads, phase, gameMinute } = useGameStore();
  const { mode: themeMode } = useThemeStore();
  const activeTrucks = phase !== 'menu' ? trucks : [];

  // ── ЗАГРУЗКА GOOGLE MAPS API ─────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }

    window.initGoogleMapAdvanced = () => {
      setMapLoaded(true);
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initGoogleMapAdvanced&libraries=geometry,visualization`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      delete window.initGoogleMapAdvanced;
    };
  }, []);

  // ── ИНИЦИАЛИЗАЦИЯ КАРТЫ ──────────────────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || googleMapRef.current) return;

    const google = window.google;
    if (!google || !google.maps) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 39.8283, lng: -98.5795 },
      zoom: 5,
      mapTypeId: mapType,
      styles: themeMode === 'dark' ? getDarkMapStyles() : [],
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: true,
    });

    googleMapRef.current = map;
    infoWindowRef.current = new google.maps.InfoWindow();

    // Создаём Traffic Layer (но не показываем сразу)
    trafficLayerRef.current = new google.maps.TrafficLayer();

    console.log('✅ Google Maps Advanced инициализирована');
  }, [mapLoaded, themeMode, mapType]);

  // ── ПЕРЕКЛЮЧЕНИЕ TRAFFIC LAYER ───────────────────────────────────────────
  useEffect(() => {
    if (!trafficLayerRef.current || !googleMapRef.current) return;
    
    if (showTraffic) {
      trafficLayerRef.current.setMap(googleMapRef.current);
    } else {
      trafficLayerRef.current.setMap(null);
    }
  }, [showTraffic]);

  // ── ОБНОВЛЕНИЕ МАРКЕРОВ ТРАКОВ С НАПРАВЛЕНИЕМ ────────────────────────────
  useEffect(() => {
    if (!googleMapRef.current || !mapLoaded) return;

    const google = window.google;
    if (!google || !google.maps) return;

    const map = googleMapRef.current;

    // Удаляем старые маркеры
    const currentTruckIds = new Set(activeTrucks.map((t: any) => t.id));
    markersRef.current.forEach((marker, truckId) => {
      if (!currentTruckIds.has(truckId)) {
        marker.setMap(null);
        markersRef.current.delete(truckId);
      }
    });

    // Обновляем маркеры
    activeTrucks.forEach((truck: any) => {
      const position = { lat: truck.position[1], lng: truck.position[0] };
      const color = getTruckColor(truck, gameMinute);
      
      // Рассчитываем направление трака
      let rotation = 0;
      if (truck.destination && CITIES[truck.destination]) {
        const destination = { lat: CITIES[truck.destination][1], lng: CITIES[truck.destination][0] };
        rotation = calculateBearing(position, destination);
      }
      
      let marker = markersRef.current.get(truck.id);

      if (!marker) {
        marker = new google.maps.Marker({
          position,
          map,
          title: `${truck.name} (${truck.id})`,
          icon: createTruckIcon(color, rotation),
          zIndex: truck.status === 'loaded' ? 1000 : 500,
        });

        marker.addListener('click', () => {
          handleTruckClick(truck);
        });

        markersRef.current.set(truck.id, marker);
      } else {
        marker.setPosition(position);
        marker.setIcon(createTruckIcon(color, rotation));
        marker.setZIndex(truck.status === 'loaded' ? 1000 : 500);
      }

      // Если включено слежение за этим траком — плавно центрируем карту
      if (followTruck) {
        const targetId = followTruckIdRef.current || selectedTruck?.id;
        if (truck.id === targetId || (!targetId && activeTrucks[0]?.id === truck.id)) {
          const lastPos = lastFollowPositionRef.current;
          
          // Проверяем, изменилась ли позиция достаточно сильно
          if (!lastPos || 
              Math.abs(lastPos.lat - position.lat) > 0.0001 || 
              Math.abs(lastPos.lng - position.lng) > 0.0001) {
            
            // Очень плавное перемещение камеры (2 секунды)
            smoothPanTo(googleMapRef.current, position.lat, position.lng, 2000);
            lastFollowPositionRef.current = position;
            
            // Устанавливаем zoom только если он слишком далёкий
            const currentZoom = googleMapRef.current.getZoom();
            if (currentZoom < 10) {
              googleMapRef.current.setZoom(10);
            }
          }
        }
      }
    });
  }, [activeTrucks, gameMinute, mapLoaded, followTruck, selectedTruck]);

  // ── ОТРИСОВКА МАРШРУТОВ С DIRECTIONS API ─────────────────────────────────
  useEffect(() => {
    if (!googleMapRef.current || !mapLoaded) return;

    const google = window.google;
    if (!google || !google.maps) return;

    const map = googleMapRef.current;
    const directionsService = new google.maps.DirectionsService();

    // Удаляем старые маршруты
    const currentTruckIds = new Set(
      activeTrucks
        .filter((t: any) => t.status === 'loaded' || t.status === 'driving')
        .map((t: any) => t.id)
    );
    
    directionsRenderersRef.current.forEach((renderer, truckId) => {
      if (!currentTruckIds.has(truckId)) {
        renderer.setMap(null);
        directionsRenderersRef.current.delete(truckId);
      }
    });

    // Рисуем новые маршруты
    activeTrucks.forEach((truck: any) => {
      if (truck.status === 'loaded' || truck.status === 'driving') {
        const origin = truck.currentCity;
        const destination = truck.status === 'loaded' ? truck.destination : truck.nextPickup;

        if (origin && destination && CITIES[origin] && CITIES[destination]) {
          // Проверяем, есть ли уже маршрут для этого трака
          if (!directionsRenderersRef.current.has(truck.id)) {
            const renderer = new google.maps.DirectionsRenderer({
              map,
              suppressMarkers: true,
              preserveViewport: true,
              polylineOptions: {
                strokeColor: getTruckColor(truck, gameMinute),
                strokeOpacity: 0.7,
                strokeWeight: 4,
              },
            });

            directionsService.route(
              {
                origin: new google.maps.LatLng(CITIES[origin][1], CITIES[origin][0]),
                destination: new google.maps.LatLng(CITIES[destination][1], CITIES[destination][0]),
                travelMode: google.maps.TravelMode.DRIVING,
              },
              (result: any, status: any) => {
                if (status === 'OK' && result) {
                  renderer.setDirections(result);
                  directionsRenderersRef.current.set(truck.id, renderer);
                  
                  // Логируем расстояние и время
                  const route = result.routes[0];
                  if (route && route.legs && route.legs[0]) {
                    const distance = route.legs[0].distance.text;
                    const duration = route.legs[0].duration.text;
                    console.log(`🛣️ Маршрут ${truck.id}: ${distance}, ${duration}`);
                  }
                } else {
                  console.warn(`⚠️ Не удалось построить маршрут для ${truck.id}:`, status);
                }
              }
            );
          }
        }
      }
    });
  }, [activeTrucks, gameMinute, mapLoaded]);

  // ── ОБРАБОТЧИК КЛИКА НА ТРАК ─────────────────────────────────────────────
  const handleTruckClick = useCallback((truck: any) => {
    setSelectedTruck(truck);
    
    if (onTruckSelect) {
      onTruckSelect(truck.id);
    }

    if (infoWindowRef.current && googleMapRef.current) {
      const marker = markersRef.current.get(truck.id);
      if (marker) {
        const statusColor = getTruckColor(truck, gameMinute);
        const hos = (truck.hoursOfService || truck.hoursLeft || 0).toFixed(1);
        const hosPercent = ((parseFloat(hos) / 11) * 100).toFixed(0);
        
        const content = `
          <div style="
            padding:0;
            min-width:260px;
            max-width:280px;
            font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
            background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            border-radius:12px;
            overflow:hidden;
            box-shadow:0 8px 24px rgba(0,0,0,0.4);
          ">
            <!-- Заголовок с цветной полосой статуса -->
            <div style="
              background:${statusColor};
              padding:12px 16px;
              border-bottom:1px solid rgba(255,255,255,0.1);
            ">
              <h3 style="
                margin:0;
                font-size:18px;
                font-weight:800;
                color:#fff;
                text-shadow:0 2px 4px rgba(0,0,0,0.3);
              ">${truck.name}</h3>
              <p style="
                margin:4px 0 0 0;
                font-size:13px;
                font-weight:600;
                color:rgba(255,255,255,0.9);
                text-transform:uppercase;
                letter-spacing:0.5px;
              ">${STATUS_LABEL[truck.status]}</p>
            </div>

            <!-- Основная информация -->
            <div style="padding:14px 16px;display:flex;flex-direction:column;gap:10px;">
              
              <!-- ID трака -->
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:16px;">🚛</span>
                <div style="flex:1;">
                  <p style="margin:0;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">ID</p>
                  <p style="margin:2px 0 0 0;font-size:14px;font-weight:700;color:#e2e8f0;">${truck.id}</p>
                </div>
              </div>

              <!-- Местоположение -->
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:16px;">📍</span>
                <div style="flex:1;">
                  <p style="margin:0;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Текущий город</p>
                  <p style="margin:2px 0 0 0;font-size:14px;font-weight:700;color:#e2e8f0;">${truck.currentCity}</p>
                </div>
              </div>

              ${truck.destination ? `
              <!-- Пункт назначения -->
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:16px;">🎯</span>
                <div style="flex:1;">
                  <p style="margin:0;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Пункт назначения</p>
                  <p style="margin:2px 0 0 0;font-size:14px;font-weight:700;color:#06b6d4;">${truck.destination}</p>
                </div>
              </div>
              ` : ''}

              <!-- HOS с прогресс-баром -->
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:16px;">⏱️</span>
                <div style="flex:1;">
                  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                    <p style="margin:0;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Hours of Service</p>
                    <p style="margin:0;font-size:13px;font-weight:700;color:#e2e8f0;">${hos} / 11 ч</p>
                  </div>
                  <div style="
                    width:100%;
                    height:6px;
                    background:rgba(255,255,255,0.1);
                    border-radius:3px;
                    overflow:hidden;
                  ">
                    <div style="
                      width:${hosPercent}%;
                      height:100%;
                      background:${parseFloat(hos) > 8 ? '#4ade80' : parseFloat(hos) > 4 ? '#fbbf24' : '#f87171'};
                      border-radius:3px;
                      transition:width 0.3s ease;
                    "></div>
                  </div>
                </div>
              </div>

              <!-- Пробег -->
              <div style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:16px;">📊</span>
                <div style="flex:1;">
                  <p style="margin:0;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;">Пробег</p>
                  <p style="margin:2px 0 0 0;font-size:14px;font-weight:700;color:#e2e8f0;">${truck.mileage.toLocaleString()} миль</p>
                </div>
              </div>

            </div>
          </div>
        `;
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(googleMapRef.current, marker);
      }
    }
  }, [onTruckSelect, gameMinute]);

  // ── СЛЕДОВАНИЕ ЗА ТРАКОМ (НАЧАЛЬНАЯ ЦЕНТРОВКА) ──────────────────────────
  useEffect(() => {
    if (!followTruck || !googleMapRef.current || !mapLoaded) return;

    // При включении слежения — плавно центрируем на траке
    const targetId = followTruckIdRef.current || selectedTruck?.id;
    const truck = activeTrucks.find((t: any) => t.id === targetId) || activeTrucks[0];
    
    if (truck && googleMapRef.current) {
      const position = { lat: truck.position[1], lng: truck.position[0] };
      smoothPanTo(googleMapRef.current, position.lat, position.lng, 1500);
      lastFollowPositionRef.current = position;
      googleMapRef.current.setZoom(10);
    }
  }, [followTruck]); // Срабатывает только при включении/выключении слежения

  // ── АВТОЗАКРЫТИЕ ЛЕГЕНДЫ ─────────────────────────────────────────────────
  useEffect(() => {
    if (legendVisible) {
      const timer = setTimeout(() => setLegendVisible(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [legendVisible]);

  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Контейнер карты */}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Панель управления */}
      <div style={{
        position: 'absolute',
        top: 16,
        left: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 1000,
      }}>
        {/* Переключение типа карты */}
        <button
          onClick={() => setMapType(mapType === 'roadmap' ? 'satellite' : 'roadmap')}
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            padding: '10px 16px',
            color: '#e2e8f0',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {mapType === 'roadmap' ? '🛰️ Спутник' : '🗺️ Карта'}
        </button>

        {/* Переключение пробок */}
        <button
          onClick={() => setShowTraffic(!showTraffic)}
          style={{
            background: showTraffic ? 'rgba(239, 68, 68, 0.95)' : 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            padding: '10px 16px',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {showTraffic ? '🚦 Пробки ВКЛ' : '🚦 Пробки'}
        </button>
      </div>

      {/* Легенда */}
      {legendVisible && (
        <div style={{
          position: 'absolute',
          top: 16,
          right: 16,
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 12,
          padding: 16,
          minWidth: 200,
          zIndex: 1000,
        }}>
          <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>
            Статусы траков
          </h4>
          {Object.entries(STATUS_LABEL).map(([status, label]) => (
            <div key={status} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <div style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: STATUS_COLOR[status],
                marginRight: 8,
              }} />
              <span style={{ fontSize: 12, color: '#e2e8f0' }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Кнопка показа легенды */}
      {!legendVisible && (
        <button
          onClick={() => setLegendVisible(true)}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 8,
            padding: '8px 12px',
            color: '#e2e8f0',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            zIndex: 1000,
          }}
        >
          📊 Легенда
        </button>
      )}

      {/* Кнопка следования */}
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
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
                  {truck.currentCity} → {truck.destination || 'Свободен'}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* СКРЫТО: Кнопка слежения */}
        {/* <button
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
              🎯 Следить
              <span style={{ fontSize: 10 }}>▲</span>
            </>
          )}
        </button> */}
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
            <strong>Статус:</strong> {STATUS_LABEL[selectedTruck.status]}
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

      {/* Загрузка */}
      {!mapLoaded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 12,
          padding: 24,
          textAlign: 'center',
          zIndex: 2000,
        }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#e2e8f0' }}>
            🗺️ Загрузка Google Maps...
          </p>
        </div>
      )}
    </View>
  );
}

// ── СТИЛИ ТЁМНОЙ ТЕМЫ ────────────────────────────────────────────────────────
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
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#2d3748" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#3d4a5c" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
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
