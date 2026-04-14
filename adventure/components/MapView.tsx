import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform, Text, TouchableOpacity } from 'react-native';
import { useGameStore, TruckStatus } from '../store/gameStore';
import { MAP_STYLE, CITIES, OSRM_URL } from '../constants/config';
import { Colors } from '../constants/colors';
import TruckDetailModal from './TruckDetailModal';
import CityDetailModal from './CityDetailModal';

// ─── РЕЖИМЫ КАРТЫ ────────────────────────────────────────────────────────────
type MapMode = 'overview' | 'city' | 'truck';
const MODE_LABELS: Record<MapMode, string> = {
  overview: '🗺️ США',
  city:     '🏙️ Город',
  truck:    '🚛 Трак',
};
const MODE_ZOOM: Record<MapMode, number> = {
  overview: 4,
  city:     8,
  truck:    14,
};

export default function MapView() {
  if (Platform.OS === 'web') return <MapViewWeb />;
  return (
    <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
      <Text style={{ color: Colors.textMuted }}>Карта доступна в веб-версии</Text>
    </View>
  );
}

// ─── ЦВЕТА ТРАКОВ ────────────────────────────────────────────────────────────
function getTruckColor(status: TruckStatus): string {
  const map: Record<TruckStatus, string> = {
    idle:        '#64748b',
    driving:     '#06b6d4',
    at_pickup:   '#fbbf24',
    loaded:      '#4ade80',
    at_delivery: '#a78bfa',
    breakdown:   '#f87171',
    waiting:     '#fb923c',
  };
  return map[status] || '#64748b';
}

// ─── ИСТОРИЯ ПОЗИЦИЙ (след) ──────────────────────────────────────────────────
// Хранит последние N позиций каждого трака
const trailHistory = new Map<string, [number,number][]>();
const TRAIL_LENGTH = 20; // точек в следе

function updateTrail(truckId: string, pos: [number,number]) {
  const trail = trailHistory.get(truckId) || [];
  trail.push([...pos] as [number,number]);
  if (trail.length > TRAIL_LENGTH) trail.shift();
  trailHistory.set(truckId, trail);
}

// ─── МАРКЕР ТРАКА — простая светящаяся точка ─────────────────────────────────
function buildTruckEl(id: string, status: TruckStatus, name: string): HTMLElement {
  const color = getTruckColor(status);
  const isMoving = status === 'driving' || status === 'loaded';
  const isDocked = status === 'at_pickup' || status === 'at_delivery';
  const isBroken = status === 'breakdown';

  if (!document.getElementById(`kf_truck_${id}`)) {
    const s = document.createElement('style');
    s.id = `kf_truck_${id}`;
    s.textContent = `
      @keyframes truckPulse_${id} {
        0%,100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.8); opacity: 0; }
      }
      @keyframes truckBlink_${id} {
        0%,100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
    `;
    document.head.appendChild(s);
  }

  const wrap = document.createElement('div');
  wrap.style.cssText = `
    position: relative;
    width: 24px; height: 24px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    z-index: 100;
    pointer-events: auto;
  `;
  
  // Невидимая кликабельная область (больше чем визуальная точка)
  const clickArea = document.createElement('div');
  clickArea.style.cssText = `
    position: absolute;
    width: 40px; height: 40px;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    cursor: pointer;
    z-index: 101;
  `;
  wrap.appendChild(clickArea);

  // Внешнее кольцо-пульс (скрыто по умолчанию)
  const ring = document.createElement('div');
  ring.className = 'truck-pulse-ring';
  ring.style.cssText = `
    position: absolute;
    width: 20px; height: 20px; border-radius: 50%;
    border: 1.5px solid ${color};
    opacity: 0;
    animation: truckPulse_${id} ${isDocked ? '1s' : '2s'} ease infinite;
    pointer-events: none;
    transition: opacity 0.3s ease;
  `;
  wrap.appendChild(ring);

  // Второе кольцо с задержкой (скрыто по умолчанию)
  const ring2 = ring.cloneNode() as HTMLElement;
  ring2.className = 'truck-pulse-ring';
  ring2.style.animationDelay = isDocked ? '0.5s' : '1s';
  wrap.appendChild(ring2);

  // Центральная точка (стеклянная по умолчанию)
  const dot = document.createElement('div');
  dot.style.cssText = `
    width: 14px; height: 14px; border-radius: 50%;
    background: rgba(255,255,255,0.35);
    backdrop-filter: blur(8px);
    border: 2px solid rgba(255,255,255,0.6);
    box-shadow: 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 3px rgba(255,255,255,0.4), 0 0 12px rgba(255,255,255,0.2);
    position: relative; z-index: 102;
    ${isBroken ? `animation: truckBlink_${id} 0.5s ease infinite;` : ''}
    transition: all 0.3s ease;
    pointer-events: none;
  `;
  wrap.appendChild(dot);
  
  // Hover эффект - показываем цвет и кольца
  wrap.addEventListener('mouseenter', () => {
    dot.style.background = color;
    dot.style.borderColor = color;
    dot.style.boxShadow = `0 0 8px ${color}, 0 0 16px ${color}66, 0 0 24px ${color}33`;
    // Показываем кольца
    ring.style.opacity = '1';
    ring2.style.opacity = '1';
  });
  
  wrap.addEventListener('mouseleave', () => {
    dot.style.background = 'rgba(255,255,255,0.35)';
    dot.style.borderColor = 'rgba(255,255,255,0.6)';
    dot.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 3px rgba(255,255,255,0.4), 0 0 12px rgba(255,255,255,0.2)';
    // Скрываем кольца
    ring.style.opacity = '0';
    ring2.style.opacity = '0';
  });

  // Иконка статуса
  if (isDocked || isBroken) {
    const icon = document.createElement('div');
    icon.textContent = isBroken ? '⚠️' : isDocked ? '🏭' : '';
    icon.style.cssText = `
      position: absolute; top: -16px; left: 50%; transform: translateX(-50%);
      font-size: 12px; pointer-events: none;
    `;
    wrap.appendChild(icon);
  }

  // Tooltip
  const tip = document.createElement('div');
  tip.textContent = name;
  tip.style.cssText = `
    position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%);
    background: rgba(8,14,28,.95); color: #e2e8f0; font-size: 10px; font-weight: 700;
    padding: 3px 8px; border-radius: 6px; white-space: nowrap; pointer-events: none;
    opacity: 0; transition: opacity .15s;
    border: 1px solid ${color}66; font-family: sans-serif;
    box-shadow: 0 2px 8px rgba(0,0,0,.4);
  `;
  wrap.addEventListener('mouseenter', () => { tip.style.opacity = '1'; });
  wrap.addEventListener('mouseleave', () => { tip.style.opacity = '0'; });
  wrap.appendChild(tip);

  return wrap;
}

// ─── OSRM МАРШРУТ ────────────────────────────────────────────────────────────
async function fetchRoute(from: [number,number], to: [number,number]): Promise<[number,number][]> {
  try {
    const url = `${OSRM_URL}/${from[0]},${from[1]};${to[0]},${to[1]}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes?.[0]?.geometry?.coordinates) {
      return data.routes[0].geometry.coordinates as [number,number][];
    }
  } catch (_) {}
  // Fallback — bezier
  return bezierCoords(from, to);
}

function bezierCoords(from: [number,number], to: [number,number], steps = 40): [number,number][] {
  const midLng = (from[0]+to[0])/2, midLat = (from[1]+to[1])/2;
  const dx = to[0]-from[0], dy = to[1]-from[1];
  const len = Math.sqrt(dx*dx+dy*dy);
  const c = len*0.18;
  const cpLng = midLng-(dy/len)*c, cpLat = midLat+(dx/len)*c;
  const pts: [number,number][] = [];
  for (let i=0;i<=steps;i++) {
    const t=i/steps, mt=1-t;
    pts.push([mt*mt*from[0]+2*mt*t*cpLng+t*t*to[0], mt*mt*from[1]+2*mt*t*cpLat+t*t*to[1]]);
  }
  return pts;
}

function loadLineColor(rpm: number) {
  if (rpm>=2.5) return '#22c55e';
  if (rpm>=2.0) return '#f59e0b';
  return '#ef4444';
}

// ─── WEB MAP ─────────────────────────────────────────────────────────────────
function MapViewWeb() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string,any>>(new Map());
  const initRef = useRef(false);
  const [mode, setMode] = useState<MapMode>('overview');
  const modeRef = useRef<MapMode>('overview');
  const selectedTruckRef = useRef<string|null>(null);
  const routeCacheRef = useRef<Map<string,[number,number][]>>(new Map());
  const [truckDetailModal, setTruckDetailModal] = useState<any>(null);
  const [cityDetailModal, setCityDetailModal] = useState<string | null>(null);

  const { selectTruck, selectLoad, trucks, updateTruckRoute } = useGameStore();

  // Функция подсветки маршрута выбранного трака
  async function highlightTruckRoute(truckId: string) {
    const map = mapInstanceRef.current;
    if (!map || !map.loaded || !map.loaded()) return;

    const truck = useGameStore.getState().trucks.find(t => t.id === truckId);
    if (!truck) return;

    const highlightId = 'selected_truck_route';
    
    // Удаляем предыдущую подсветку
    try {
      if (map.getLayer(`${highlightId}_flow`)) map.removeLayer(`${highlightId}_flow`);
      if (map.getLayer(`${highlightId}_glow`)) map.removeLayer(`${highlightId}_glow`);
      if (map.getLayer(highlightId)) map.removeLayer(highlightId);
      if (map.getSource(highlightId)) map.removeSource(highlightId);
    } catch (_) {}

    // Если трак едет - показываем его маршрут
    if ((truck.status === 'driving' || truck.status === 'loaded') && truck.destinationCity) {
      const to = CITIES[truck.destinationCity];
      if (!to) return;

      const cacheKey = `${truck.currentCity}-${truck.destinationCity}`;
      let coords: [number,number][];

      if (routeCacheRef.current.has(cacheKey)) {
        coords = routeCacheRef.current.get(cacheKey)!;
      } else {
        coords = await fetchRoute(truck.position, to);
        routeCacheRef.current.set(cacheKey, coords);
      }

      try {
        map.addSource(highlightId, {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'LineString', coordinates: coords } }
        });

        // Яркая подсветка
        map.addLayer({
          id: `${highlightId}_glow`,
          type: 'line',
          source: highlightId,
          paint: {
            'line-color': '#06b6d4',
            'line-width': 12,
            'line-opacity': 0.3,
            'line-blur': 8
          }
        });

        map.addLayer({
          id: highlightId,
          type: 'line',
          source: highlightId,
          paint: {
            'line-color': '#06b6d4',
            'line-width': 4,
            'line-opacity': 0.95
          }
        });

        map.addLayer({
          id: `${highlightId}_flow`,
          type: 'line',
          source: highlightId,
          paint: {
            'line-color': '#fff',
            'line-width': 2,
            'line-opacity': 0.8,
            'line-dasharray': [2, 8]
          }
        });

        // Центрируем карту на маршруте
        if (coords.length > 0) {
          const bounds = coords.reduce((b, coord) => {
            return b.extend(coord as [number, number]);
          }, new (mapInstanceRef.current.constructor as any).LngLatBounds(coords[0], coords[0]));
          
          map.fitBounds(bounds, { padding: 80, duration: 800 });
        }
      } catch (err) {
        console.warn('Error highlighting route:', err);
      }
    }
  }

  // Переключение режима
  function switchMode(newMode: MapMode) {
    console.log('🔄 Switching mode to:', newMode);
    modeRef.current = newMode;
    setMode(newMode);
    
    const map = mapInstanceRef.current;
    if (!map) {
      console.warn('⚠️ Map instance not found');
      return;
    }
    
    try {
      const trucks = useGameStore.getState().trucks;
      
      // Находим трак ближайший к центру экрана
      const mapCenter = map.getCenter();
      const centerLng = mapCenter.lng;
      const centerLat = mapCenter.lat;
      
      // Вычисляем расстояние от каждого трака до центра
      const trucksWithDistance = trucks.map(t => {
        const dx = t.position[0] - centerLng;
        const dy = t.position[1] - centerLat;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return { truck: t, distance };
      });
      
      // Сортируем по расстоянию и берем ближайший
      trucksWithDistance.sort((a, b) => a.distance - b.distance);
      const truck = trucksWithDistance[0]?.truck || trucks[0];
      
      console.log(`🎯 Selected closest truck: ${truck.name} at distance ${trucksWithDistance[0]?.distance.toFixed(2)}`);

      // ВАЖНО: Сначала сбрасываем все ограничения
      map.setMinZoom(0);
      map.setMaxZoom(24);
      map.setMaxBounds(undefined);
      
      // Включаем все контролы
      map.scrollZoom?.enable();
      map.doubleClickZoom?.enable();
      map.touchZoomRotate?.enable();
      map.dragRotate?.disable(); // вращение всегда выключено

      if (newMode === 'overview') {
        // Режим США - зум зафиксирован на 4
        console.log('📍 Setting overview mode');
        map.setMaxBounds([[-125, 24], [-66, 50]]);
        map.flyTo({ center: [-96, 38], zoom: 4, duration: 800 });
        
        // После анимации блокируем зум
        setTimeout(() => {
          map.setMinZoom(4);
          map.setMaxZoom(4);
          map.scrollZoom?.disable();
          map.doubleClickZoom?.disable();
          map.touchZoomRotate?.disable();
        }, 850);
        
      } else if (newMode === 'city' && truck) {
        // Режим Город - зум 7-9
        console.log('🏙️ Setting city mode for truck:', truck.name);
        
        // Выбираем ближайший трак
        selectedTruckRef.current = truck.id;
        selectTruck(truck.id);
        
        const bounds: [[number, number], [number, number]] = [
          [truck.position[0] - 3, truck.position[1] - 2],
          [truck.position[0] + 3, truck.position[1] + 2]
        ];
        map.setMaxBounds(bounds);
        map.flyTo({ center: truck.position, zoom: 8, duration: 800 });
        
        // После анимации устанавливаем ограничения
        setTimeout(() => {
          map.setMinZoom(7);
          map.setMaxZoom(9);
        }, 850);
        
      } else if (newMode === 'truck' && truck) {
        // Режим Трак - зум 10-14
        console.log('🚛 Setting truck mode for truck:', truck.name);
        
        // Выбираем ближайший трак
        selectedTruckRef.current = truck.id;
        selectTruck(truck.id);
        
        const bounds: [[number, number], [number, number]] = [
          [truck.position[0] - 1, truck.position[1] - 0.7],
          [truck.position[0] + 1, truck.position[1] + 0.7]
        ];
        map.setMaxBounds(bounds);
        map.flyTo({ center: truck.position, zoom: 12, duration: 800 });
        
        // После анимации устанавливаем ограничения
        setTimeout(() => {
          map.setMinZoom(10);
          map.setMaxZoom(14);
        }, 850);
      }
    } catch (error) {
      console.error('❌ Error switching mode:', error);
    }
  }

  useEffect(() => {
    if (!mapRef.current || initRef.current) return;
    initRef.current = true;

    import('maplibre-gl').then(({ default: maplibregl }) => {
      if (!document.querySelector('link[href*="maplibre-gl"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';
        document.head.appendChild(link);
      }

      // Добавляем CSS анимацию для кнопок
      if (!document.getElementById('map-mode-animations')) {
        const style = document.createElement('style');
        style.id = 'map-mode-animations';
        style.textContent = `
          @keyframes shimmer {
            0%, 100% { opacity: 0.4; transform: translateX(-100%); }
            50% { opacity: 1; transform: translateX(100%); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 0.8; }
          }
          
          /* Адаптивные стили для кнопок режимов карты */
          .map-mode-buttons {
            position: absolute;
            top: 16px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 10px;
            z-index: 1000;
          }
          
          .map-mode-btn {
            padding: 12px 24px;
            border-radius: 14px;
            cursor: pointer;
            font-size: 15px;
            font-weight: 900;
            font-family: sans-serif;
            transition: all .3s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(12px);
            position: relative;
            overflow: hidden;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }
          
          /* Мобильные устройства */
          @media (max-width: 600px) {
            .map-mode-buttons {
              top: 8px;
              gap: 6px;
            }
            
            .map-mode-btn {
              padding: 8px 12px;
              font-size: 11px;
              border-radius: 10px;
              letter-spacing: 0.3px;
            }
          }
          
          /* Очень маленькие экраны */
          @media (max-width: 400px) {
            .map-mode-buttons {
              gap: 4px;
            }
            
            .map-mode-btn {
              padding: 6px 10px;
              font-size: 10px;
              border-radius: 8px;
            }
          }
          
          /* Легенда - адаптивная */
          .map-legend {
            position: absolute;
            bottom: 12px;
            left: 12px;
            background: rgba(8,14,28,.88);
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,.08);
            padding: 8px 12px;
            display: flex;
            flex-direction: column;
            gap: 5px;
            backdrop-filter: blur(8px);
            z-index: 1000;
          }
          
          @media (max-width: 600px) {
            .map-legend {
              bottom: 8px;
              left: 8px;
              padding: 6px 8px;
              gap: 3px;
              border-radius: 8px;
            }
            
            .map-legend-item {
              gap: 5px !important;
            }
            
            .map-legend-dot {
              width: 7px !important;
              height: 7px !important;
            }
            
            .map-legend-label {
              font-size: 9px !important;
            }
          }
        `;
        document.head.appendChild(style);
      }

      const map = new maplibregl.Map({
        container: mapRef.current!,
        style: MAP_STYLE,
        center: [-96, 38],
        zoom: 4,
        minZoom: 4,
        maxZoom: 4,
        maxBounds: [[-125, 24], [-66, 50]], // Ограничение: West Coast → East Coast
        dragRotate: false, // Отключаем вращение
        pitchWithRotate: false,
        touchZoomRotate: false, // Отключаем зум пальцами на мобильных
        doubleClickZoom: false, // Отключаем зум двойным кликом
        scrollZoom: false, // Отключаем зум колесом мыши
        attributionControl: false, // Скрываем attribution
      });
      mapInstanceRef.current = map;

      map.on('load', async () => {
        // Города - ОТКЛЮЧЕНО
        // Object.entries(CITIES).forEach(([city, coords]) => {
        //   ...
        // });

        // Линии грузов с реальными маршрутами
        // ВРЕМЕННО ОТКЛЮЧЕНО - будем переделывать
        // const loads = useGameStore.getState().availableLoads;
        // await drawLoadLines(map, loads, routeCacheRef.current);

        // Траки
        const trucks = useGameStore.getState().trucks;
        trucks.forEach(truck => {
          const el = buildTruckEl(truck.id, truck.status, truck.name);
          el.addEventListener('click', () => {
            selectedTruckRef.current = truck.id;
            selectTruck(truck.id);
            setTruckDetailModal(truck); // Открываем модалку
            // highlightTruckRoute(truck.id); // ВРЕМЕННО ОТКЛЮЧЕНО - будем переделывать
            if (modeRef.current !== 'overview') {
              map.flyTo({ center: truck.position, zoom: MODE_ZOOM[modeRef.current], duration: 600 });
            }
          });
          const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
            .setLngLat(truck.position).addTo(map);
          markersRef.current.set(truck.id, marker);
        });
      });
    });

    // Подписка на стор
    const unsub = useGameStore.subscribe(async (state) => {
      const map = mapInstanceRef.current;
      if (!map || !map.loaded || !map.loaded()) return;

      // Если изменился выбранный трак - подсвечиваем его маршрут
      // ВРЕМЕННО ОТКЛЮЧЕНО - будем переделывать
      /*
      if (state.selectedTruckId && state.selectedTruckId !== selectedTruckRef.current) {
        selectedTruckRef.current = state.selectedTruckId;
        await highlightTruckRoute(state.selectedTruckId);
      } else if (!state.selectedTruckId && selectedTruckRef.current) {
        // Убираем подсветку если трак отменили
        selectedTruckRef.current = null;
        try {
          const highlightId = 'selected_truck_route';
          if (map.getLayer(`${highlightId}_flow`)) map.removeLayer(`${highlightId}_flow`);
          if (map.getLayer(`${highlightId}_glow`)) map.removeLayer(`${highlightId}_glow`);
          if (map.getLayer(highlightId)) map.removeLayer(highlightId);
          if (map.getSource(highlightId)) map.removeSource(highlightId);
        } catch (_) {}
      }
      */

      // Удаляем старые линии грузов
      // ВРЕМЕННО ОТКЛЮЧЕНО - будем переделывать
      /*
      try {
        const style = map.getStyle();
        if (style) {
          (style.layers || []).forEach((l: any) => {
            if (l.id.startsWith('load_')) { try { map.removeLayer(l.id); } catch (_) {} }
          });
          Object.keys(style.sources || {}).forEach(id => {
            if (id.startsWith('load_src_')) { try { map.removeSource(id); } catch (_) {} }
          });
        }
      } catch (err) {
        console.warn('Error cleaning load lines:', err);
      }

      // Убираем маркеры pickup/delivery
      markersRef.current.forEach((marker, key) => {
        if (key.startsWith('load_mark_')) { marker.remove(); markersRef.current.delete(key); }
      });

      // Рисуем ВСЕ доступные грузы
      await drawLoadLines(map, state.availableLoads.slice(0, 12), routeCacheRef.current);
      */

      state.trucks.forEach(truck => {
        const marker = markersRef.current.get(truck.id);
        if (!marker) return;
        
        // Плавное обновление позиции маркера
        const currentPos = marker.getLngLat();
        const newPos = truck.position;
        
        // Если позиция изменилась - обновляем
        if (currentPos.lng !== newPos[0] || currentPos.lat !== newPos[1]) {
          marker.setLngLat(newPos);
        }

        // Маршрутная линия активного трака
        // ВРЕМЕННО ОТКЛЮЧЕНО - будем переделывать
        /*
        const lineId = `truck_route_${truck.id}`;
        if ((truck.status==='driving'||truck.status==='loaded') && truck.destinationCity) {
          const to = CITIES[truck.destinationCity];
          if (!to) return;
          
          // Используем routePath из store если есть
          if (truck.routePath && truck.routePath.length > 1) {
            const coords = truck.routePath;
            
            if (map.getSource(lineId)) {
              (map.getSource(lineId) as any).setData({ type:'Feature', geometry:{ type:'LineString', coordinates:coords } });
            } else {
              map.addSource(lineId, { type:'geojson', data:{ type:'Feature', geometry:{ type:'LineString', coordinates:coords } } });
              const color = truck.status==='driving' ? '#06b6d4' : '#22c55e';
              // Glow
              map.addLayer({ id:`${lineId}_glow`, type:'line', source:lineId,
                paint:{ 'line-color':color, 'line-width':8, 'line-opacity':0.15, 'line-blur':6 } });
              // Main
              map.addLayer({ id:lineId, type:'line', source:lineId,
                paint:{ 'line-color':color, 'line-width':3, 'line-opacity':0.85 } });
              // Flow dots
              map.addLayer({ id:`${lineId}_flow`, type:'line', source:lineId,
                paint:{ 'line-color':'#fff', 'line-width':2, 'line-opacity':0.6, 'line-dasharray':[2,8] } });
            }
          } else {
            // Если routePath нет - загружаем маршрут
            const cacheKey = `${truck.currentCity}-${truck.destinationCity}`;
            
            if (routeCacheRef.current.has(cacheKey)) {
              const coords = routeCacheRef.current.get(cacheKey)!;
              updateTruckRoute(truck.id, coords);
            } else {
              fetchRoute(truck.position, to).then(coords => {
                routeCacheRef.current.set(cacheKey, coords);
                updateTruckRoute(truck.id, coords);
              });
            }
          }

          // Следим за траком в режиме truck/city
          if (modeRef.current === 'truck') {
            map.easeTo({ center: truck.position, duration: 200 });
          }
        } else {
          try {
            if (map.getLayer(`${lineId}_flow`)) map.removeLayer(`${lineId}_flow`);
            if (map.getLayer(`${lineId}_glow`)) map.removeLayer(`${lineId}_glow`);
            if (map.getLayer(lineId)) map.removeLayer(lineId);
            if (map.getSource(lineId)) map.removeSource(lineId);
          } catch (_) {}
        }
        */

        // Следим за выбранным траком в режиме truck
        if (modeRef.current === 'truck' && selectedTruckRef.current === truck.id && (truck.status==='driving'||truck.status==='loaded')) {
          map.easeTo({ center: truck.position, duration: 200 });
        }
      });
    });

    return () => {
      unsub();
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      initRef.current = false;
    };
  }, []);

  return (
    <View style={styles.container}>
      <div ref={mapRef} style={{ width:'100%', height:'100%' }} />

      {/* ── ПЕРЕКЛЮЧАТЕЛЬ РЕЖИМОВ ── */}
      <div className="map-mode-buttons">
        {(['overview','city','truck'] as MapMode[]).map(m => (
          <button key={m} onClick={() => switchMode(m)} className="map-mode-btn" style={{ 
            border: mode===m ? '2px solid #06b6d4' : '2px solid rgba(255,255,255,.08)',
            background: mode===m 
              ? 'linear-gradient(135deg, rgba(6,182,212,.3), rgba(14,165,233,.2))' 
              : 'rgba(8,14,28,.92)',
            color: mode===m ? '#fff' : '#64748b',
            boxShadow: mode===m 
              ? '0 4px 16px rgba(6,182,212,.4), 0 0 24px rgba(6,182,212,.2), inset 0 1px 0 rgba(255,255,255,.2)' 
              : '0 2px 8px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.03)',
            textShadow: mode===m ? '0 0 12px rgba(6,182,212,.8), 0 2px 4px rgba(0,0,0,.5)' : 'none',
          }}
          onMouseEnter={(e) => {
            if (mode !== m) {
              e.currentTarget.style.background = 'rgba(6,182,212,.12)';
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.borderColor = 'rgba(6,182,212,.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(6,182,212,.2), inset 0 1px 0 rgba(255,255,255,.05)';
            }
          }}
          onMouseLeave={(e) => {
            if (mode !== m) {
              e.currentTarget.style.background = 'rgba(8,14,28,.92)';
              e.currentTarget.style.color = '#64748b';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.03)';
            }
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(1px) scale(0.98)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = mode===m ? 'translateY(0)' : 'translateY(-2px)';
          }}
          >
            <span style={{position:'relative', zIndex:2}}>{MODE_LABELS[m]}</span>
            {mode===m && (
              <>
                <div style={{
                  position:'absolute',
                  top:0, left:0, right:0, bottom:0,
                  background:'linear-gradient(135deg, rgba(6,182,212,.15), transparent)',
                  animation:'pulse 2s ease-in-out infinite',
                  zIndex:1,
                }} />
                <div style={{
                  position:'absolute',
                  bottom:0, left:'10%', right:'10%',
                  height:'3px',
                  background:'linear-gradient(90deg, transparent, #06b6d4, transparent)',
                  boxShadow:'0 0 8px #06b6d4',
                  animation:'shimmer 2s ease-in-out infinite',
                  zIndex:1,
                }} />
              </>
            )}
          </button>
        ))}
      </div>

      {/* ── ЛЕГЕНДА ── */}
      <div className="map-legend">
        {[
          { color:'#475569', label:'Свободен' },
          { color:'#0ea5e9', label:'Едет к погрузке' },
          { color:'#22c55e', label:'Везёт груз' },
          { color:'#f59e0b', label:'На погрузке' },
          { color:'#8b5cf6', label:'На разгрузке' },
          { color:'#ef4444', label:'Поломка' },
        ].map(item => (
          <div key={item.label} className="map-legend-item" style={{ display:'flex', alignItems:'center', gap:7 }}>
            <div className="map-legend-dot" style={{ width:9, height:9, borderRadius:'50%', background:item.color, boxShadow:`0 0 5px ${item.color}` }}/>
            <span className="map-legend-label" style={{ fontSize:10, color:'#94a3b8', fontFamily:'sans-serif', fontWeight:600 }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* МОДАЛКИ */}
      <TruckDetailModal
        truck={truckDetailModal}
        onClose={() => setTruckDetailModal(null)}
        onFindLoad={() => {
          setTruckDetailModal(null);
          // TODO: открыть Load Board с фильтром по городу трака
        }}
      />
      <CityDetailModal
        cityName={cityDetailModal}
        onClose={() => setCityDetailModal(null)}
        onShowLoads={() => {
          setCityDetailModal(null);
          selectLoad(null); // TODO: фильтр Load Board
        }}
      />
    </View>
  );
}

// ─── ЛИНИИ ГРУЗОВ ────────────────────────────────────────────────────────────
async function drawLoadLines(map: any, loads: any[], cache: Map<string,[number,number][]>) {
  // Проверяем что карта загружена
  if (!map || !map.loaded || !map.loaded()) return;
  
  // Удаляем старые
  try {
    const style = map.getStyle();
    if (!style) return;
    (style.layers || []).forEach((l: any) => {
      if (l.id.startsWith('load_')) { try { map.removeLayer(l.id); } catch (_) {} }
    });
    Object.keys(style.sources || {}).forEach(id => {
      if (id.startsWith('load_src_')) { try { map.removeSource(id); } catch (_) {} }
    });
  } catch (err) {
    console.warn('Error cleaning old load lines:', err);
    return;
  }

  // Рисуем новые с реальными маршрутами
  for (const load of loads.slice(0, 8)) {
    const from = CITIES[load.fromCity];
    const to = CITIES[load.toCity];
    if (!from || !to) continue;

    const cacheKey = `${load.fromCity}-${load.toCity}`;
    let coords: [number,number][];

    if (cache.has(cacheKey)) {
      coords = cache.get(cacheKey)!;
    } else {
      coords = await fetchRoute(from, to);
      cache.set(cacheKey, coords);
    }

    const rpm = load.postedRate / load.miles;
    const color = loadLineColor(rpm);
    const srcId = `load_src_${load.id}`;

    // Проверяем существует ли источник, если да - пропускаем этот груз
    try {
      if (map.getSource && map.getSource(srcId)) {
        continue;
      }
    } catch (_) {
      // Игнорируем ошибки проверки
    }

    try {
      map.addSource(srcId, {
        type:'geojson',
        data:{ type:'Feature', geometry:{ type:'LineString', coordinates:coords } },
      });

      // Glow
      map.addLayer({ id:`load_glow_${load.id}`, type:'line', source:srcId,
        paint:{ 'line-color':color, 'line-width':7, 'line-opacity':0.1, 'line-blur':5 } });
      // Main dashed
      map.addLayer({ id:`load_line_${load.id}`, type:'line', source:srcId,
        paint:{ 'line-color':color, 'line-width':2, 'line-opacity':0.5, 'line-dasharray':[6,4] } });
      // Flow
      map.addLayer({ id:`load_flow_${load.id}`, type:'line', source:srcId,
        paint:{ 'line-color':color, 'line-width':3, 'line-opacity':0.85, 'line-dasharray':[2,12] } });
    } catch (err) {
      console.warn(`Error adding load line for ${load.id}:`, err);
    }
  }
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#050a14', position:'relative' },
});
