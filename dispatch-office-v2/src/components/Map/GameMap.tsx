// ═══════════════════════════════════════════════════════
//  GameMap.tsx — Navigation-style map (Leaflet + ESRI Satellite)
//  Трак всегда по центру, карта вращается по направлению движения
// ═══════════════════════════════════════════════════════
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useGameStore } from '@/store/gameStore';
import { positionAlongRoute } from '@/utils/geo';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './GameMap.module.css';

// ESRI Satellite base + labels
const TILE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const LABELS_URL = 'https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png';
const NAV_ZOOM = 6;

// Рассчитать bearing (угол направления) между двумя точками
function calcBearing(from: [number, number], to: [number, number]): number {
  const [lat1, lng1] = from.map((v) => (v * Math.PI) / 180);
  const [lat2, lng2] = to.map((v) => (v * Math.PI) / 180);
  const dLng = lng2 - lng1;
  const x = Math.sin(dLng) * Math.cos(lat2);
  const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(x, y) * 180) / Math.PI + 360) % 360;
}

// Плавная интерполяция угла (shortest path)
function lerpAngle(from: number, to: number, t: number): number {
  let diff = ((to - from + 540) % 360) - 180;
  return from + diff * t;
}

function statusColor(status: string): string {
  switch (status) {
    case 'driving': return '#4285f4';
    case 'at_pickup': return '#fbbc04';
    case 'at_delivery': return '#34a853';
    case 'breakdown': return '#ea4335';
    case 'hos_rest': return '#9334e6';
    default: return '#5f6368';
  }
}

// Inject truck animation CSS once
if (typeof document !== 'undefined' && !document.getElementById('truck-anim-css')) {
  const style = document.createElement('style');
  style.id = 'truck-anim-css';
  style.textContent = `
    .truck-marker { transition: none !important; }
    @keyframes markerPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  `;
  document.head.appendChild(style);
}

export function GameMap({ sheetOpen = false, children }: { sheetOpen?: boolean; children?: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const linesRef = useRef<Map<string, L.Polyline>>(new Map());
  const prevPos = useRef<Map<string, [number, number]>>(new Map());
  const truckBearings = useRef<Map<string, number>>(new Map());
  const trailerBearings = useRef<Map<string, number>>(new Map());
  const bearingRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [overviewMode, setOverviewMode] = useState(false);

  // Init
  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const map = L.map(el, {
      center: [35.9606, -83.9207],
      zoom: NAV_ZOOM,
      zoomControl: false,
      attributionControl: false,
      rotate: true,
    } as any);

    L.tileLayer(TILE_URL, { maxZoom: 19 }).addTo(map);
    L.tileLayer(LABELS_URL, { maxZoom: 19, pane: 'overlayPane' }).addTo(map);
    mapRef.current = map;
    setReady(true);
    setTimeout(() => map.invalidateSize(), 150);

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Update loop
  useEffect(() => {
    if (!ready) return;

    const interval = setInterval(() => {
      const map = mapRef.current;
      const state = useGameStore.getState();
      if (!map || !state.session) return;

      const trucks = state.session.trucks;
      const selId = state.selectedTruckId;
      const currentIds = new Set<string>();

      const followTruck = trucks.find((t) => t.id === selId)
        || trucks.find((t) => t.status === 'driving')
        || trucks[0];

      let followPos: [number, number] | null = null;
      let followBearing = bearingRef.current;

      trucks.forEach((truck) => {
        currentIds.add(truck.id);

        let lat = truck.location.lat;
        let lng = truck.location.lng;
        if (truck.route && truck.route.length >= 2 && truck.routeProgress !== undefined) {
          const p = positionAlongRoute(truck.route, truck.routeProgress);
          lat = p.lat;
          lng = p.lng;
        }
        const pos: [number, number] = [lat, lng];

        // Calculate bearing
        const prev = prevPos.current.get(truck.id);
        const prevBearing = truckBearings.current.get(truck.id) || 0;
        let newBearing = prevBearing;
        if (prev) {
          const dLat = pos[0] - prev[0];
          const dLng = pos[1] - prev[1];
          if (Math.abs(dLat) > 0.00005 || Math.abs(dLng) > 0.00005) {
            newBearing = calcBearing(prev, pos);
          }
        }
        prevPos.current.set(truck.id, pos);

        // Smooth truck bearing
        const smoothBearing = lerpAngle(prevBearing, newBearing, 0.4);
        truckBearings.current.set(truck.id, smoothBearing);

        // Trailer bearing follows with delay (snake effect)
        const prevTrailer = trailerBearings.current.get(truck.id) || smoothBearing;
        const trailerBearing = lerpAngle(prevTrailer, smoothBearing, 0.2);
        trailerBearings.current.set(truck.id, trailerBearing);

        const isFollow = truck.id === followTruck?.id;
        if (isFollow) {
          followPos = pos;
          followBearing = smoothBearing;
        }

        const selected = truck.id === selId;
        const color = statusColor(truck.status);
        const isMoving = truck.status === 'driving';
        const size = isFollow ? 60 : 48;
        const html = makeTruckRig(color, smoothBearing, trailerBearing, isMoving, isFollow, selected);

        // Marker
        let marker = markersRef.current.get(truck.id);
        if (!marker) {
          const icon = L.divIcon({ className: 'truck-marker', iconSize: [size, size], iconAnchor: [size / 2, size / 2], html });
          marker = L.marker(pos, { icon }).addTo(map);
          marker.on('click', () => {
            const store = useGameStore.getState();
            store.selectTruck(truck.id);
            window.dispatchEvent(new CustomEvent('truck-clicked', { detail: { truckId: truck.id } }));
          });
          markersRef.current.set(truck.id, marker);
        } else {
          marker.setLatLng(pos);
          const el = marker.getElement();
          if (el) el.innerHTML = html;
        }

        // Route polyline
        let line = linesRef.current.get(truck.id);
        let border = linesRef.current.get(truck.id + '_b');
        if (truck.route && truck.route.length >= 2 && truck.status === 'driving') {
          const path = truck.route.map((p) => [p.lat, p.lng] as [number, number]);
          if (!border) {
            border = L.polyline(path, { color: '#fff', weight: 7, opacity: 0.7, lineCap: 'round' }).addTo(map);
            line = L.polyline(path, { color: '#4285f4', weight: 4, opacity: 1, lineCap: 'round' }).addTo(map);
            linesRef.current.set(truck.id + '_b', border);
            linesRef.current.set(truck.id, line);
          } else {
            border.setLatLngs(path);
            line?.setLatLngs(path);
          }
        } else {
          if (line) { line.remove(); linesRef.current.delete(truck.id); }
          if (border) { border.remove(); linesRef.current.delete(truck.id + '_b'); }
        }
      });

      // Cleanup
      markersRef.current.forEach((m, id) => { if (!currentIds.has(id)) { m.remove(); markersRef.current.delete(id); } });
      linesRef.current.forEach((l, id) => { const base = id.replace('_b', ''); if (!currentIds.has(base)) { l.remove(); linesRef.current.delete(id); } });

      // Camera
      if (!overviewMode && followPos) {
        bearingRef.current = followBearing;
        const center = map.getCenter();
        const dist = Math.abs(center.lat - followPos[0]) + Math.abs(center.lng - followPos[1]);
        if (dist > 0.0003) {
          map.panTo(followPos, { animate: true, duration: 0.6 });
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [ready, overviewMode, sheetOpen]);

  function toggleOverview() {
    const map = mapRef.current;
    if (!map) return;

    if (!overviewMode) {
      setOverviewMode(true);
      if (containerRef.current) {
        containerRef.current.style.transform = 'rotate(0deg)';
      }
      map.setView([39.5, -98.5], 4, { animate: true });
    } else {
      setOverviewMode(false);
    }
  }

  return (
    <div className={styles.mapContainer}>
      <div ref={containerRef} className={styles.leafletMap} />
      {children}
      <button className={styles.viewBtn} onClick={toggleOverview}>
        {overviewMode ? '🎯' : '🗺️'}
      </button>
    </div>
  );
}

// ═══ CLEAN TRUCK MARKER ═══
// Профессиональный маркер: цветной круг с иконкой трака + стрелка направления
// Стиль как в Google Fleet Tracking / Uber / Waze
function makeTruckRig(
  color: string,
  cabBearing: number,
  _trailerBearing: number,
  isMoving: boolean,
  isMain: boolean,
  selected: boolean,
): string {
  const size = isMain ? 44 : 34;
  const borderW = selected ? 3 : 2;
  const shadow = selected
    ? `box-shadow:0 0 0 3px ${color}44, 0 3px 12px rgba(0,0,0,0.5);`
    : `box-shadow:0 2px 8px rgba(0,0,0,0.4);`;
  const pulse = isMoving && isMain ? 'animation:markerPulse 2s ease-in-out infinite;' : '';

  // Direction arrow (shows bearing)
  const arrow = isMoving
    ? `<div style="
        position:absolute;top:-8px;left:50%;
        transform:translateX(-50%) rotate(${cabBearing}deg);
        width:0;height:0;
        border-left:5px solid transparent;
        border-right:5px solid transparent;
        border-bottom:8px solid ${color};
        filter:drop-shadow(0 -1px 2px rgba(0,0,0,0.3));
      "></div>`
    : '';

  return `<div style="
    width:${size}px;height:${size}px;
    position:relative;
    display:flex;align-items:center;justify-content:center;
  ">
    ${arrow}
    <div style="
      width:${size}px;height:${size}px;
      background:rgba(10,15,30,0.9);
      border:${borderW}px solid ${color};
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      ${shadow}
      ${pulse}
      transition:border-color 0.3s, box-shadow 0.3s;
    ">
      <svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="none">
        <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" fill="${color}"/>
      </svg>
    </div>
  </div>`;
}
