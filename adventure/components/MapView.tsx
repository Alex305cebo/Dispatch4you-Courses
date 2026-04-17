import { useEffect, useRef, useState, useCallback } from "react";
import { View, StyleSheet, Platform, Text } from "react-native";
import { useGameStore } from "../store/gameStore";
import { CITIES, CITY_STATE } from "../constants/config";
import { Colors } from "../constants/colors";
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5geodata_usaLow from "@amcharts/amcharts5-geodata/usaLow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

const STATUS_COLOR: Record<string, string> = {
  idle: "#94a3b8", driving: "#38bdf8", loaded: "#4ade80",
  at_pickup: "#fbbf24", at_delivery: "#c084fc",
  breakdown: "#f87171", waiting: "#fb923c",
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
const HUBS = [
  "Chicago","Los Angeles","New York","Houston","Dallas",
  "Atlanta","Seattle","Miami","Denver","Phoenix","Memphis",
  "Nashville","Indianapolis","Kansas City","Minneapolis",
  "Portland","San Francisco","Las Vegas","Salt Lake City",
];

// Штаты с высокими ставками (surge zones) — ротируются случайно при старте
const SURGE_STATES = ["TX","CA","FL","IL","GA","OH","PA","TN","NC","MO"];

function getTruckColor(truck: any): string {
  const outOfOrder = (truck as any).outOfOrderUntil;
  if (outOfOrder && typeof outOfOrder === 'number' && outOfOrder > 0) return "#ff0000";
  const warn = (truck as any).idleWarningLevel ?? 0;
  if (warn === 3) return "#ef4444";
  if (warn === 2) return "#f97316";
  if (warn === 1) return "#fbbf24";
  return STATUS_COLOR[truck.status] || "#94a3b8";
}

const STATE_NAMES: Record<string, string> = {
  AL:"Alabama", AK:"Alaska", AZ:"Arizona", AR:"Arkansas", CA:"California",
  CO:"Colorado", CT:"Connecticut", DE:"Delaware", FL:"Florida", GA:"Georgia",
  HI:"Hawaii", ID:"Idaho", IL:"Illinois", IN:"Indiana", IA:"Iowa",
  KS:"Kansas", KY:"Kentucky", LA:"Louisiana", ME:"Maine", MD:"Maryland",
  MA:"Massachusetts", MI:"Michigan", MN:"Minnesota", MS:"Mississippi", MO:"Missouri",
  MT:"Montana", NE:"Nebraska", NV:"Nevada", NH:"New Hampshire", NJ:"New Jersey",
  NM:"New Mexico", NY:"New York", NC:"North Carolina", ND:"North Dakota", OH:"Ohio",
  OK:"Oklahoma", OR:"Oregon", PA:"Pennsylvania", RI:"Rhode Island", SC:"South Carolina",
  SD:"South Dakota", TN:"Tennessee", TX:"Texas", UT:"Utah", VT:"Vermont",
  VA:"Virginia", WA:"Washington", WV:"West Virginia", WI:"Wisconsin", WY:"Wyoming",
};

// Случайные погодные/трафик события на маршрутах
const ROUTE_EVENTS = ["⛈","🌨","🚧","🌫","⚠️"];
function getRouteEvent(truckId: string): string | null {
  const hash = truckId.charCodeAt(truckId.length - 1);
  if (hash % 5 === 0) return ROUTE_EVENTS[hash % ROUTE_EVENTS.length];
  return null;
}

// История маршрутов трака за смену
const routeHistory: Record<string, Array<[number, number]>> = {};

export default function MapView({ onTruckInfo, onFindLoad }: {
  onTruckInfo?: (truckId: string) => void;
  onFindLoad?: (city: string) => void;
}) {
  if (Platform.OS !== "web") {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Карта доступна в веб-версии</Text>
      </View>
    );
  }
  return <MapAmCharts onTruckInfo={onTruckInfo} onFindLoad={onFindLoad} />;
}

function MapAmCharts({ onTruckInfo, onFindLoad }: {
  onTruckInfo?: (truckId: string) => void;
  onFindLoad?: (city: string) => void;
}) {
  const divRef = useRef<any>(null);
  const rootRef = useRef<any>(null);
  const chartRef = useRef<any>(null);
  const truckSeriesRef = useRef<any>(null);
  const routeSeriesRef = useRef<any>(null);
  const historySeriesRef = useRef<any>(null);
  const polygonSeriesRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);
  const antLinesRef = useRef<any[]>([]); // ссылки на анимированные линии
  const extraSeriesRef = useRef<any[]>([]); // серии миль и погоды — удаляем при rebuild

  const { trucks, availableLoads, phase, gameMinute } = useGameStore();
  const activeTrucks = phase !== 'menu' ? trucks : [];
  const [legendVisible, setLegendVisible] = useState(true);
  const legendTimerRef = useRef<any>(null);

  // Автозакрытие через 4 секунды после открытия
  useEffect(() => {
    if (legendVisible) {
      clearTimeout(legendTimerRef.current);
      legendTimerRef.current = setTimeout(() => setLegendVisible(false), 4000);
    }
    return () => clearTimeout(legendTimerRef.current);
  }, [legendVisible]);
  const trucksRef = useRef(activeTrucks);
  const loadsRef = useRef(availableLoads);
  const gameMinuteRef = useRef(gameMinute);
  const onTruckInfoRef = useRef(onTruckInfo);
  const onFindLoadRef = useRef(onFindLoad);
  trucksRef.current = activeTrucks;
  loadsRef.current = availableLoads;
  gameMinuteRef.current = gameMinute;
  onTruckInfoRef.current = onTruckInfo;
  onFindLoadRef.current = onFindLoad;

  const [selectedTruck, setSelectedTruck] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<any>(null);
  const truckClickedRef = useRef(false); // флаг: клик был на траке, не на штате
  const [toasts, setToasts] = useState<Array<{ id: string; msg: string; color: string }>>([]);
  // Surge zones — 3 случайных штата
  const [surgeStates] = useState<string[]>(() => {
    const shuffled = [...SURGE_STATES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  });

  // Добавить тост-уведомление
  const addToast = useCallback((msg: string, color = "#06b6d4") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev.slice(-3), { id, msg, color }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  // Слушаем события из store для тостов
  useEffect(() => {
    function handleMapToast(e: Event) {
      const { message, color } = (e as CustomEvent).detail;
      addToast(message, color);
    }
    window.addEventListener('mapToast', handleMapToast);
    return () => window.removeEventListener('mapToast', handleMapToast);
  }, [addToast]);

  // Форсируем обновление карты когда траки появляются/меняются
  useEffect(() => {
    if (activeTrucks.length > 0 && chartRef.current && rootRef.current) {
      rebuildTruckSeries(rootRef.current, chartRef.current);
      rebuildRoutes(rootRef.current, chartRef.current);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrucks.length]);
  useEffect(() => {
    activeTrucks.forEach(t => {
      if (t.status === "loaded" || t.status === "driving") {
        if (!routeHistory[t.id]) routeHistory[t.id] = [];
        const last = routeHistory[t.id].at(-1);
        const [lng, lat] = t.position;
        if (!last || Math.hypot(last[0] - lng, last[1] - lat) > 0.3) {
          routeHistory[t.id].push([lng, lat]);
          if (routeHistory[t.id].length > 200) routeHistory[t.id].shift();
        }
      }
    });
  }, [activeTrucks]);

  // Строим pointData из текущих траков
  function buildPointData() {
    const ts = trucksRef.current;
    const posCount: Record<string, number> = {};
    const posIdx: Record<string, number> = {};
    ts.forEach(t => {
      const k = `${t.position[0].toFixed(2)},${t.position[1].toFixed(2)}`;
      posCount[k] = (posCount[k] || 0) + 1;
    });
    return ts.map(t => {
      const k = `${t.position[0].toFixed(2)},${t.position[1].toFixed(2)}`;
      const total = posCount[k] || 1;
      posIdx[k] = posIdx[k] ?? 0;
      const idx = posIdx[k]++;
      let jLng = 0, jLat = 0;
      if (total > 1) {
        const angle = (2 * Math.PI * idx) / total;
        jLng = Math.cos(angle) * 0.8;
        jLat = Math.sin(angle) * 0.8;
      }
      const dest = t.destinationCity ? CITIES[t.destinationCity] : null;
      const milesLeft = dest
        ? Math.round(Math.hypot(dest[0] - t.position[0], dest[1] - t.position[1]) * 55)
        : 0;
      const colorHex = getTruckColor(t);
      const colorInt = parseInt(colorHex.replace("#", ""), 16);
      return {
        lat: t.position[1] + jLat,
        lng: t.position[0] + jLng,
        truckId: t.id,
        truckName: t.name.replace("Truck ", "T"),
        driver: t.driver,
        status: t.status,
        statusLabel: STATUS_LABEL[t.status] || t.status,
        colorHex, colorInt,
        idleWarning: (t as any).idleWarningLevel ?? 0,
        active: t.status === "loaded" || t.status === "driving",
        breakdown: t.status === "breakdown",
        waiting: t.status === "waiting",
        milesLeft,
        currentCity: t.currentCity,
        destinationCity: t.destinationCity || "",
        hoursLeft: t.hoursLeft,
        currentLoad: t.currentLoad,
        routeEvent: getRouteEvent(t.id),
      };
    });
  }

  // История маршрутов — полупрозрачный след
  function rebuildHistory(root: any, chart: any) {
    if (historySeriesRef.current) {
      const idx = chart.series.indexOf(historySeriesRef.current);
      if (idx >= 0) chart.series.removeIndex(idx);
      historySeriesRef.current.dispose();
      historySeriesRef.current = null;
    }
    const ts = trucksRef.current;
    const trucksWithHistory = ts.filter(t => routeHistory[t.id]?.length >= 2);
    if (trucksWithHistory.length === 0) return;

    const historySeries = chart.series.push(am5map.MapLineSeries.new(root, {}));
    historySeries.mapLines.template.setAll({ strokeWidth: 1, strokeOpacity: 0.2 });

    trucksWithHistory.forEach(t => {
      const colorInt = parseInt(getTruckColor(t).replace("#", ""), 16);
      const item = historySeries.pushDataItem({
        geometry: { type: "LineString", coordinates: routeHistory[t.id] },
      });
      item.get("mapLine")?.setAll({
        stroke: am5.color(colorInt),
        strokeOpacity: 0.22,
        strokeWidth: 1.5,
        strokeDasharray: [2, 6],
      });
    });
    historySeriesRef.current = historySeries;
  }

  // Маршруты с анимацией "муравьи"
  function rebuildRoutes(root: any, chart: any) {
    antLinesRef.current = []; // сбрасываем список анимируемых линий

    // Удаляем старые серии миль и погоды
    extraSeriesRef.current.forEach(s => {
      try {
        const idx = chart.series.indexOf(s);
        if (idx >= 0) chart.series.removeIndex(idx);
        s.dispose();
      } catch (_) {}
    });
    extraSeriesRef.current = [];
    if (routeSeriesRef.current) {
      const idx = chart.series.indexOf(routeSeriesRef.current);
      if (idx >= 0) chart.series.removeIndex(idx);
      routeSeriesRef.current.dispose();
      routeSeriesRef.current = null;
    }
    const ts = trucksRef.current;
    const trucksWithRoute = ts.filter(t =>
      (t.status === "loaded" || t.status === "driving") &&
      t.routePath && t.routePath.length > 1
    );
    if (trucksWithRoute.length === 0) return;

    const routeSeries = chart.series.push(am5map.MapLineSeries.new(root, {}));
    routeSeries.mapLines.template.setAll({ strokeWidth: 2.5, strokeOpacity: 0.7 });

    trucksWithRoute.forEach(t => {
      const colorInt = parseInt(getTruckColor(t).replace("#", ""), 16);
      const path = t.routePath!;
      const startIdx = Math.max(0, Math.floor(t.progress * (path.length - 1)) - 1);

      // Пройденная часть — тусклая
      if (startIdx >= 2) {
        const doneItem = routeSeries.pushDataItem({
          geometry: { type: "LineString", coordinates: path.slice(0, startIdx + 1) },
        });
        doneItem.get("mapLine")?.setAll({
          stroke: am5.color(colorInt), strokeOpacity: 0.15,
          strokeWidth: 1.5, strokeDasharray: [4, 4],
        });
      }

      // Оставшаяся часть — анимированные "муравьи"
      const remainingPath = path.slice(startIdx);
      if (remainingPath.length >= 2) {
        // Фоновая линия
        const bgItem = routeSeries.pushDataItem({
          geometry: { type: "LineString", coordinates: remainingPath },
        });
        bgItem.get("mapLine")?.setAll({
          stroke: am5.color(colorInt), strokeOpacity: 0.25, strokeWidth: 3,
        });
        // Анимированный пунктир поверх — сохраняем ссылку
        const antItem = routeSeries.pushDataItem({
          geometry: { type: "LineString", coordinates: remainingPath },
        });
        const antLine = antItem.get("mapLine");
        if (antLine) {
          antLine.setAll({
            stroke: am5.color(colorInt), strokeOpacity: 0.9,
            strokeWidth: 3, strokeDasharray: [8, 8],
            strokeDashoffset: 0,
          });
          antLinesRef.current.push(antLine);
        }


      }
    });

    routeSeriesRef.current = routeSeries;
  }

  // Обновляем цвета штатов (тепловая карта + surge zones)
  function updatePolygonColors() {
    const ps = polygonSeriesRef.current;
    if (!ps) return;
    const ls = loadsRef.current;
    const ts = trucksRef.current;

    // Считаем активность по штатам
    const stateActivity: Record<string, number> = {};
    ls.forEach(l => {
      const s = CITY_STATE[l.fromCity];
      if (s) stateActivity[s] = (stateActivity[s] || 0) + 1;
    });
    ts.forEach(t => {
      const s = CITY_STATE[t.currentCity];
      if (s) stateActivity[s] = (stateActivity[s] || 0) + 0.5;
    });
    const maxActivity = Math.max(1, ...Object.values(stateActivity));

    ps.mapPolygons.each((polygon: any) => {
      const rawId = polygon.dataItem?.get("id") as string ?? "";
      const stateId = rawId.replace("US-", "");
      const activity = stateActivity[stateId] || 0;
      const isSurge = surgeStates.includes(stateId);

      if (isSurge) {
        // Surge zone — ЯРКИЙ оранжево-красный, ВСЕГДА ВИДИМЫЙ
        polygon.setAll({ 
          fill: am5.color(0xff6b35), 
          fillOpacity: 0.85,
          stroke: am5.color(0xffa500),
          strokeWidth: 2,
          strokeOpacity: 1,
        });
      } else if (activity > 0) {
        // Тепловая карта — ЯРКИЕ цвета от зелёного к голубому
        const t = activity / maxActivity;
        // Используем более яркую палитру: от зелёного (#10b981) к голубому (#06b6d4)
        const r = Math.round(16 + t * (6 - 16));
        const g = Math.round(185 + t * (182 - 185));
        const b = Math.round(129 + t * (212 - 129));
        const hex = (r << 16) | (g << 8) | b;
        polygon.setAll({ 
          fill: am5.color(hex), 
          fillOpacity: 0.7,
          stroke: am5.color(0x64748b),
          strokeWidth: 1.5,
          strokeOpacity: 1,
        });
      } else {
        // Неактивные штаты — ВИДИМЫЙ серо-синий
        polygon.setAll({ 
          fill: am5.color(0x334155), // Светлее чем было!
          fillOpacity: 0.9,
          stroke: am5.color(0x64748b),
          strokeWidth: 1.5,
          strokeOpacity: 0.9,
        });
      }
    });
  }

  // Серия траков
  function rebuildTruckSeries(root: any, chart: any) {
    if (truckSeriesRef.current) {
      chart.series.removeIndex(chart.series.indexOf(truckSeriesRef.current));
      truckSeriesRef.current.dispose();
      truckSeriesRef.current = null;
    }
    const pointData = buildPointData();
    const truckSeries = chart.series.push(
      am5map.MapPointSeries.new(root, { latitudeField: "lat", longitudeField: "lng" })
    );

    truckSeries.bullets.push((_root: any, _s: any, dataItem: any) => {
      const d = dataItem.dataContext as any;
      const container = am5.Container.new(root, { cursorOverStyle: "pointer" });

      if (d.active) {
        const pulse = container.children.push(am5.Circle.new(root, {
          radius: 14, fill: am5.color(d.colorInt), fillOpacity: 0,
        }));
        pulse.animate({ key: "radius", from: 8, to: 20, duration: 1400, loops: Infinity });
        pulse.animate({ key: "fillOpacity", from: 0.35, to: 0, duration: 1400, loops: Infinity });
      }
      if (d.idleWarning > 0) {
        const warnColor = d.idleWarning >= 3 ? 0xef4444 : d.idleWarning === 2 ? 0xf97316 : 0xfbbf24;
        const warnSpeed = d.idleWarning >= 3 ? 600 : d.idleWarning === 2 ? 800 : 1200;
        const alertPulse = container.children.push(am5.Circle.new(root, {
          radius: 16, fill: am5.color(warnColor), fillOpacity: 0,
        }));
        alertPulse.animate({ key: "radius", from: 10, to: 24, duration: warnSpeed, loops: Infinity });
        alertPulse.animate({ key: "fillOpacity", from: 0.5, to: 0, duration: warnSpeed, loops: Infinity });
      }

      container.children.push(am5.Circle.new(root, {
        radius: 5, fill: am5.color(d.colorInt),
        stroke: am5.color(0xffffff), strokeWidth: 2,
      }));

      let line2 = d.currentCity;
      if ((d.status === "loaded" || d.status === "driving") && d.destinationCity) {
        const fromState = CITY_STATE[d.currentCity] || "";
        const toState = CITY_STATE[d.destinationCity] || "";
        line2 = `${d.currentCity.substring(0,3).toUpperCase()}, ${fromState}→${d.destinationCity.substring(0,3).toUpperCase()}, ${toState}`;
      } else if (d.status === "at_pickup") { line2 = "📦 Погрузка"; }
      else if (d.status === "at_delivery") { line2 = "🏁 Разгрузка"; }
      else if (d.status === "waiting") { line2 = "⏱ Detention"; }
      else if (d.status === "breakdown") { line2 = "⚠️ Поломка"; }
      else {
        const state = CITY_STATE[d.currentCity] || "";
        line2 = state ? `${d.currentCity}, ${state}` : d.currentCity;
      }

      const hosRounded = Math.round(d.hoursLeft * 10) / 10;
      const line3 = d.milesLeft > 0 ? `${d.milesLeft}mi · ${hosRounded}h HOS` : `${hosRounded}h HOS`;

      const CARD_W = 76, CARD_H = 56, CX = CARD_W / 2;
      const card = container.children.push(am5.Container.new(root, {
        dy: -CARD_H - 10, dx: -(CARD_W / 2),
        interactive: true, cursorOverStyle: "pointer",
      }));
      card.children.push(am5.RoundedRectangle.new(root, {
        width: CARD_W, height: CARD_H,
        fill: am5.color(0x0d1f35), fillOpacity: 0.96,
        stroke: am5.color(d.colorInt), strokeWidth: 1.5,
        cornerRadiusTL: 7, cornerRadiusTR: 7, cornerRadiusBL: 7, cornerRadiusBR: 7,
        interactive: true, cursorOverStyle: "pointer",
      }));
      card.children.push(am5.RoundedRectangle.new(root, {
        width: CARD_W, height: 6, fill: am5.color(d.colorInt), fillOpacity: 1,
        cornerRadiusTL: 7, cornerRadiusTR: 7, cornerRadiusBL: 0, cornerRadiusBR: 0,
      }));
      card.children.push(am5.Label.new(root, {
        text: d.truckName, fill: am5.color(0xffffff),
        fontSize: 11, fontWeight: "800", centerX: am5.percent(50), x: CX, y: 9,
      }));
      card.children.push(am5.Label.new(root, {
        text: `● ${STATUS_LABEL[d.status] || d.status}`,
        fill: am5.color(d.colorInt), fontSize: 8, fontWeight: "700",
        centerX: am5.percent(50), x: CX, y: 22,
      }));
      card.children.push(am5.Label.new(root, {
        text: line2, fill: am5.color(0xe2e8f0),
        fontSize: 9, fontWeight: "600", centerX: am5.percent(50), x: CX, y: 33,
      }));
      card.children.push(am5.Label.new(root, {
        text: line3, fill: am5.color(0x94a3b8),
        fontSize: 7, centerX: am5.percent(50), x: CX, y: 45,
      }));

      // Клик на карточку тоже открывает инфо
      card.events.on("click", (ev: any) => {
        truckClickedRef.current = true;
        onTruckInfoRef.current?.(d.truckId);
        chartRef.current?.zoomToGeoPoint({ longitude: d.lng, latitude: d.lat }, 4, true);
        setTimeout(() => { truckClickedRef.current = false; }, 100);
      });

      container.events.on("click", (ev: any) => {
        truckClickedRef.current = true;
        onTruckInfoRef.current?.(d.truckId);
        chartRef.current?.zoomToGeoPoint({ longitude: d.lng, latitude: d.lat }, 4, true);
        setTimeout(() => { truckClickedRef.current = false; }, 100);
      });
      return am5.Bullet.new(root, { sprite: container });
    });

    truckSeries.data.setAll(pointData);
    truckSeriesRef.current = truckSeries;
  }

  useEffect(() => {
    if (!divRef.current) return;

    const root = am5.Root.new(divRef.current);
    root.setThemes([am5themes_Animated.new(root)]);
    // Скрываем логотип amCharts
    root._logo?.dispose();
    rootRef.current = root;

    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "translateX", panY: "translateY",
        projection: am5map.geoAlbersUsa(),
        homeZoomLevel: 1, wheelY: "zoom", maxZoomLevel: 8,
      })
    );
    chartRef.current = chart;

    chart.set("background", am5.Rectangle.new(root, {
      fill: am5.color(0x0f172a), fillOpacity: 1, // Немного светлее чем было 0x0a1628
    }));

    // Штаты — ОСНОВНОЙ СЛОЙ КАРТЫ
    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, { geoJSON: am5geodata_usaLow })
    );
    polygonSeriesRef.current = polygonSeries;
    
    // Базовые настройки для всех штатов — СВЕТЛЕЕ!
    polygonSeries.mapPolygons.template.setAll({
      fill: am5.color(0x334155), // Светло-серый синий (было 0x1e3a5f)
      fillOpacity: 0.9,
      stroke: am5.color(0x64748b), // Серые границы
      strokeWidth: 1.5,
      strokeOpacity: 1,
      interactive: true,
      tooltipText: "{name}",
    });
    
    // Hover эффект
    polygonSeries.mapPolygons.template.states.create("hover", { 
      fill: am5.color(0x2563eb), // Ярко-синий при наведении
      fillOpacity: 1,
      strokeWidth: 2.5,
      stroke: am5.color(0x06b6d4),
      strokeOpacity: 1,
    });

    // Двойной клик — зум + попап штата
    polygonSeries.mapPolygons.template.events.on("dblclick", (ev: any) => {
      const rawId = ev.target.dataItem?.get("id") as string;
      const stateName = ev.target.dataItem?.get("name");
      if (!rawId) return;
      const stateId = rawId.replace("US-", "");
      const ts = trucksRef.current;
      const ls = loadsRef.current;
      // Зум на штат через goHome + небольшой зум
      chart.zoomToGeoPoint({ longitude: -98, latitude: 38 }, 3, true);
      setSelectedState({
        id: stateId, name: stateName,
        trucks: ts.filter(t => CITY_STATE[t.currentCity] === stateId || CITY_STATE[t.destinationCity || ""] === stateId),
        inboundTrucks: ts.filter(t => CITY_STATE[t.destinationCity || ""] === stateId && CITY_STATE[t.currentCity] !== stateId),
        loads: ls.filter(l => CITY_STATE[l.fromCity] === stateId),
        isSurge: surgeStates.includes(stateId),
      });
    });

    // Одиночный клик — попап без зума
    polygonSeries.mapPolygons.template.events.on("click", (ev: any) => {
      // Если клик был на карточке трака — не открываем попап штата
      if (truckClickedRef.current) return;
      const rawId = ev.target.dataItem?.get("id") as string;
      const stateName = ev.target.dataItem?.get("name");
      if (!rawId) return;
      const stateId = rawId.replace("US-", "");
      const ts = trucksRef.current;
      const ls = loadsRef.current;
      setSelectedState({
        id: stateId, name: stateName,
        trucks: ts.filter(t => CITY_STATE[t.currentCity] === stateId || CITY_STATE[t.destinationCity || ""] === stateId),
        inboundTrucks: ts.filter(t => CITY_STATE[t.destinationCity || ""] === stateId && CITY_STATE[t.currentCity] !== stateId),
        loads: ls.filter(l => CITY_STATE[l.fromCity] === stateId),
        isSurge: surgeStates.includes(stateId),
      });
    });

    // Подписи штатов
    const stateLabelSeries = chart.series.push(
      am5map.MapPointSeries.new(root, { polygonIdField: "id" })
    );
    stateLabelSeries.bullets.push((_root: any, _s: any, dataItem: any) => {
      const rawId = (dataItem.dataContext as any)?.id as string ?? "";
      const stateCode = rawId.replace("US-", "");
      return am5.Bullet.new(root, {
        sprite: am5.Label.new(root, {
          text: stateCode, fill: am5.color(0xe2e8f0), fillOpacity: 0.7,
          fontSize: 10, fontWeight: "700",
          centerX: am5.percent(50), centerY: am5.percent(50),
        }),
      });
    });
    stateLabelSeries.data.setAll(
      am5geodata_usaLow.features.map((f: any) => ({ id: f.id ?? "" }))
    );

    // Сетка — делаем более заметной
    const graticuleSeries = chart.series.push(am5map.GraticuleSeries.new(root, {}));
    graticuleSeries.mapLines.template.setAll({
      stroke: am5.color(0x64748b), strokeOpacity: 0.25, strokeWidth: 0.8,
    });

    // Города
    const citySeries = chart.series.push(
      am5map.MapPointSeries.new(root, { latitudeField: "lat", longitudeField: "lng" })
    );
    citySeries.bullets.push((_root: any, _s: any, dataItem: any) => {
      const d = dataItem.dataContext as any;
      if (!d.major) return am5.Bullet.new(root, { sprite: am5.Circle.new(root, { radius: 0 }) });
      
      const container = am5.Container.new(root, {});
      
      // Точка города
      container.children.push(am5.Circle.new(root, {
        radius: 2.5,
        fill: am5.color(0x94a3b8),
        fillOpacity: 0.8,
      }));
      
      // Название города
      container.children.push(am5.Label.new(root, {
        text: d.name, 
        fill: am5.color(0x94a3b8), 
        fillOpacity: 0.6,
        fontSize: 9, 
        fontWeight: "500",
        centerX: am5.percent(50), 
        centerY: am5.percent(50),
        dy: 12,
      }));
      
      return am5.Bullet.new(root, { sprite: container });
    });
    citySeries.data.setAll(
      Object.entries(CITIES).map(([name, coords]) => ({
        name, lat: coords[1], lng: coords[0], major: HUBS.includes(name),
      }))
    );

    const zoomControl = chart.set("zoomControl", am5map.ZoomControl.new(root, {}));
    zoomControl.homeButton.set("visible", true);

    function handleZoomToTruck(e: Event) {
      const { lng, lat } = (e as CustomEvent).detail;
      chart.zoomToGeoPoint({ longitude: lng, latitude: lat }, 5, true);
    }
    window.addEventListener('zoomToTruck', handleZoomToTruck);

    // Первый рендер
    rebuildHistory(root, chart);
    rebuildRoutes(root, chart);
    rebuildTruckSeries(root, chart);
    setTimeout(() => updatePolygonColors(), 500);

    // Анимация муравьёв — обновляем strokeDashoffset на живых линиях каждые 60ms
    let dashOffset = 0;
    const antInterval = window.setInterval(() => {
      dashOffset = (dashOffset - 2 + 10000) % 10000;
      antLinesRef.current.forEach(line => {
        try { line.set("strokeDashoffset", dashOffset); } catch (_) {}
      });
    }, 60);

    // Полное обновление каждые 2 секунды
    intervalRef.current = setInterval(() => {
      rebuildHistory(root, chart);
      rebuildRoutes(root, chart);
      rebuildTruckSeries(root, chart);
      updatePolygonColors();
    }, 2000);

    return () => {
      clearInterval(intervalRef.current);
      clearInterval(antInterval);
      window.removeEventListener('zoomToTruck', handleZoomToTruck);
      root.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Статистика для мини-легенды
  const totalMilesInFlight = activeTrucks.reduce((sum, t) => {
    if ((t.status === "loaded" || t.status === "driving") && t.currentLoad) {
      const dest = t.destinationCity ? CITIES[t.destinationCity] : null;
      const ml = dest ? Math.round(Math.hypot(dest[0] - t.position[0], dest[1] - t.position[1]) * 55) : 0;
      return sum + ml;
    }
    return sum;
  }, 0);
  const expectedRevenue = activeTrucks.reduce((sum, t) => {
    return sum + (t.currentLoad?.agreedRate || 0);
  }, 0);

  // Таймер смены: SHIFT_DURATION = 1440 минут
  const minutesLeft = Math.max(0, Math.floor(1440 - gameMinute));
  const hoursLeft = Math.floor(minutesLeft / 60);
  const minsLeft = Math.floor(minutesLeft % 60);
  const shiftProgress = Math.min(1, Math.max(0, gameMinute / 1440));
  const timerColor = minutesLeft < 60 ? "#ef4444" : minutesLeft < 120 ? "#f97316" : "#06b6d4";

  return (
    <View style={styles.container}>
      <div ref={divRef} style={{ width: "100%", height: "100%", display: "block" } as any} />

      {/* Мини-таймер смены — верхний центр */}
      {phase === 'playing' && (
        <div style={{
          position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
          background: "rgba(10,22,40,0.92)", borderRadius: 20,
          border: `1px solid ${timerColor}55`, padding: "5px 14px",
          display: "flex", alignItems: "center", gap: 8,
          fontFamily: "sans-serif", pointerEvents: "none", zIndex: 10,
        } as any} className="map-timer">
          <span style={{ fontSize: 11, color: timerColor, fontWeight: 800 } as any}>
            ⏰ {hoursLeft}h {minsLeft.toString().padStart(2,"0")}m до конца смены
          </span>
          <div style={{ width: 60, height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2 } as any}>
            <div style={{
              width: `${shiftProgress * 100}%`, height: "100%",
              background: timerColor, borderRadius: 2, transition: "width 0.5s",
            } as any} />
          </div>
        </div>
      )}

      {/* Мини-легенда со статистикой — левый нижний угол */}
      <div style={{
        position: "absolute", bottom: 12, left: 12,
        background: "rgba(10,22,40,0.92)", borderRadius: 12,
        border: "1px solid rgba(45,106,79,0.4)", padding: legendVisible ? "8px 12px" : "5px 10px",
        display: "flex", flexDirection: "column", gap: 4,
        fontFamily: "sans-serif", pointerEvents: "auto",
        transition: "padding 0.2s, opacity 0.6s ease",
        opacity: legendVisible ? 1 : 0.85,
      } as any} className="map-legend">
        {/* Toggle кнопка */}
        <div
          onClick={() => setLegendVisible(v => !v)}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
            cursor: "pointer", userSelect: "none",
            background: legendVisible
              ? "transparent"
              : "linear-gradient(135deg, rgba(6,182,212,0.25), rgba(99,102,241,0.2))",
            borderRadius: legendVisible ? 0 : 8,
            padding: legendVisible ? "0" : "4px 6px",
            margin: legendVisible ? "0" : "-2px",
            border: legendVisible ? "none" : "1px solid rgba(6,182,212,0.4)",
            transition: "all 0.2s",
          } as any}
        >
          <span style={{
            fontSize: legendVisible ? 10 : 12,
            fontWeight: 800,
            background: "linear-gradient(90deg, #06b6d4, #818cf8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: 0.8,
          } as any}>
            {legendVisible ? "ЛЕГЕНДА" : "🗺 ЛЕГЕНДА"}
          </span>
          <span style={{
            fontSize: legendVisible ? 10 : 14,
            background: "linear-gradient(135deg, #06b6d4, #818cf8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 900,
            lineHeight: 1,
            filter: legendVisible ? "none" : "drop-shadow(0 0 4px rgba(6,182,212,0.8))",
          } as any}>{legendVisible ? "▲" : "▼"}</span>
        </div>
        {legendVisible && (<>
        {Object.entries(STATUS_LABEL).map(([s, l]) => {
          const n = activeTrucks.filter(t => t.status === s).length;
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 } as any}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLOR[s] } as any} />
              <span style={{ fontSize: 10, color: "#94a3b8" } as any}>{STATUS_EMOJI[s]} {l}</span>
              {n > 0 && <span style={{ fontSize: 10, fontWeight: 800, color: STATUS_COLOR[s], marginLeft: "auto", paddingLeft: 8 } as any}>{n}</span>}
            </div>
          );
        })}
        {/* Статистика */}
        {phase === 'playing' && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 4, paddingTop: 6, display: "flex", flexDirection: "column", gap: 3 } as any}>
            <div style={{ fontSize: 10, color: "#38bdf8" } as any}>
              🛣 В пути: <span style={{ fontWeight: 700 } as any}>{totalMilesInFlight.toLocaleString()} mi</span>
            </div>
            <div style={{ fontSize: 10, color: "#4ade80" } as any}>
              💰 Ожидается: <span style={{ fontWeight: 700 } as any}>${expectedRevenue.toLocaleString()}</span>
            </div>
          </div>
        )}
        {/* Surge legend */}
        {surgeStates.length > 0 && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: 4, paddingTop: 6 } as any}>
            <div style={{ fontSize: 9, color: "#ff6b35", fontWeight: 700 } as any}>
              🔥 Surge: {surgeStates.join(", ")}
            </div>
          </div>
        )}
        </>)}
      </div>

      {/* Тосты — правый верхний угол (если нет попапа штата) */}
      {!selectedState && (
        <div style={{
          position: "absolute", top: 12, right: 12,
          display: "flex", flexDirection: "column", gap: 6,
          zIndex: 1001, fontFamily: "sans-serif", pointerEvents: "none",
        } as any} className="map-toasts">
          {toasts.map(t => (
            <div key={t.id} style={{
              background: "rgba(8,14,28,0.95)", border: `1px solid ${t.color}55`,
              borderLeft: `3px solid ${t.color}`, borderRadius: 8,
              padding: "7px 12px", fontSize: 12, color: "#e2e8f0",
              boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
              animation: "fadeInSlide 0.3s ease",
            } as any}>
              {t.msg}
            </div>
          ))}
        </div>
      )}

      {/* Плашка трака */}
      {selectedTruck && (
        <div style={{
          position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
          background: "rgba(8,14,28,0.96)", border: `1px solid ${selectedTruck.colorHex}`,
          borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12,
          zIndex: 1000, boxShadow: "0 4px 20px rgba(0,0,0,0.5)", fontFamily: "sans-serif", whiteSpace: "nowrap",
        } as any} className="map-truck-card">
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: selectedTruck.colorHex } as any} />
          <div style={{ display: "flex", flexDirection: "column", gap: 2 } as any}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" } as any}>🚛 {selectedTruck.truckName}</span>
            <span style={{ fontSize: 11, color: selectedTruck.colorHex } as any}>
              {selectedTruck.statusLabel} · {selectedTruck.currentCity}{CITY_STATE[selectedTruck.currentCity] ? `, ${CITY_STATE[selectedTruck.currentCity]}` : ""}
            </span>
            {selectedTruck.routeEvent && (
              <span style={{ fontSize: 10, color: "#fbbf24" } as any}>{selectedTruck.routeEvent} На маршруте</span>
            )}
          </div>
          <button onClick={() => onTruckInfo?.(selectedTruck.truckId)} style={{
            background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.4)",
            borderRadius: 8, padding: "6px 12px", color: "#06b6d4",
            fontSize: 12, fontWeight: 700, cursor: "pointer",
          } as any}>📋 Инфо</button>
          {(selectedTruck.status === "idle" || selectedTruck.status === "at_delivery") && (
            <button onClick={() => { onFindLoad?.(selectedTruck.currentCity); setSelectedTruck(null); chartRef.current?.goHome(); }} style={{
              background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.4)",
              borderRadius: 8, padding: "6px 12px", color: "#4ade80",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
            } as any}>🔍 Найти груз</button>
          )}
          <span onClick={() => { setSelectedTruck(null); chartRef.current?.goHome(); }}
            style={{ cursor: "pointer", fontSize: 16, color: "#64748b", paddingLeft: 4 } as any}>✕</span>
        </div>
      )}

      {/* Попап штата */}
      {selectedState && (
        <div style={{
          position: "absolute", top: 12, right: 12,
          background: "rgba(8,14,28,0.97)", borderRadius: 16,
          border: `2px solid ${selectedState.isSurge ? "rgba(255,107,53,0.5)" : "rgba(6,182,212,0.35)"}`,
          padding: "14px 16px", width: 280, zIndex: 1000,
          boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
          fontFamily: "sans-serif", maxHeight: "80vh", overflowY: "auto",
        } as any} className="map-state-popup">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 } as any}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 } as any}>
              <span style={{ fontSize: 20, fontWeight: 900, color: selectedState.isSurge ? "#ff6b35" : "#06b6d4" } as any}>
                {selectedState.id}
              </span>
              <span style={{ fontSize: 13, color: "#94a3b8" } as any}>{STATE_NAMES[selectedState.id] || selectedState.name}</span>
              {selectedState.isSurge && (
                <span style={{ fontSize: 10, fontWeight: 700, color: "#ff6b35", background: "rgba(255,107,53,0.15)", padding: "2px 6px", borderRadius: 4 } as any}>
                  🔥 SURGE
                </span>
              )}
            </div>
            <span onClick={() => setSelectedState(null)} style={{ cursor: "pointer", fontSize: 18, color: "#64748b" } as any}>✕</span>
          </div>

          {selectedState.trucks.length > 0 && (
            <div style={{ marginBottom: 12 } as any}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 } as any}>
                🚛 ТРАКИ В ШТАТЕ ({selectedState.trucks.length})
              </div>
              {selectedState.trucks.map((t: any) => {
                const color = getTruckColor(t);
                const isIdle = t.status === "idle";
                return (
                  <div key={t.id}
                    onClick={() => { onTruckInfo?.(t.id); setSelectedState(null); }}
                    style={{
                      background: "rgba(255,255,255,0.04)", borderRadius: 8,
                      padding: "7px 10px", marginBottom: 5,
                      border: `1px solid ${color}33`,
                      display: "flex", flexDirection: "column", gap: 3,
                      cursor: "pointer",
                    } as any}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" } as any}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: "#fff" } as any}>{t.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color, background: `${color}22`, padding: "1px 6px", borderRadius: 4 } as any}>
                        {STATUS_LABEL[t.status] || t.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 10, color: "#94a3b8" } as any}>👤 {t.driver} · ⏱ {t.hoursLeft}h HOS</div>
                    {t.currentLoad && (
                      <div style={{ fontSize: 10, color: "#4ade80" } as any}>
                        📦 {t.currentLoad.fromCity}, {CITY_STATE[t.currentLoad.fromCity] || ""} → {t.currentLoad.toCity}, {CITY_STATE[t.currentLoad.toCity] || ""} · ${t.currentLoad.agreedRate?.toLocaleString()}
                      </div>
                    )}
                    {!t.currentLoad && t.currentCity && (
                      <div style={{ fontSize: 10, color: "#94a3b8" } as any}>📍 {t.currentCity}{CITY_STATE[t.currentCity] ? `, ${CITY_STATE[t.currentCity]}` : ""}</div>
                    )}
                    {isIdle && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onFindLoad?.(t.currentCity); setSelectedState(null); }}
                        style={{
                          marginTop: 3, background: "rgba(74,222,128,0.15)",
                          border: "1px solid rgba(74,222,128,0.4)", borderRadius: 6,
                          padding: "3px 8px", color: "#4ade80", fontSize: 10,
                          fontWeight: 700, cursor: "pointer", alignSelf: "flex-start",
                        } as any}
                      >🔍 Найти груз</button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {selectedState.inboundTrucks?.length > 0 && (
            <div style={{ marginBottom: 12 } as any}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 } as any}>
                ➡️ ЕДУТ В ШТАТ ({selectedState.inboundTrucks.length})
              </div>
              {selectedState.inboundTrucks.map((t: any) => (
                <div key={t.id} style={{ fontSize: 10, color: "#38bdf8", marginBottom: 3 } as any}>
                  🚛 {t.name} · {t.driver} → {t.destinationCity}{CITY_STATE[t.destinationCity] ? `, ${CITY_STATE[t.destinationCity]}` : ""}
                </div>
              ))}
            </div>
          )}

          {selectedState.loads.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 } as any}>
                📋 ГРУЗЫ ИЗ ШТАТА ({selectedState.loads.length})
                {selectedState.isSurge && <span style={{ color: "#ff6b35", marginLeft: 4 } as any}>🔥 +15% ставки</span>}
              </div>
              {selectedState.loads.slice(0, 4).map((l: any) => (
                <div key={l.id}
                  onClick={() => { onFindLoad?.(l.fromCity); setSelectedState(null); }}
                  style={{
                    background: "rgba(255,255,255,0.04)", borderRadius: 8,
                    padding: "6px 10px", marginBottom: 5,
                    border: "1px solid rgba(255,255,255,0.07)",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    cursor: "pointer",
                  } as any}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.09)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 } as any}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#e2e8f0" } as any}>
                      {l.fromCity}, {CITY_STATE[l.fromCity] || ""} → {l.toCity}, {CITY_STATE[l.toCity] || ""}
                    </span>
                    <span style={{ fontSize: 9, color: "#64748b" } as any}>
                      {l.miles}mi · {l.equipment} · {l.commodity}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: selectedState.isSurge ? "#ff6b35" : "#4ade80" } as any}>
                    ${l.postedRate?.toLocaleString()}
                  </span>
                </div>
              ))}
              {selectedState.loads.length > 4 && (
                <div style={{ fontSize: 10, color: "#64748b", textAlign: "center", marginTop: 4 } as any}>
                  +{selectedState.loads.length - 4} ещё грузов
                </div>
              )}
            </div>
          )}

          {selectedState.trucks.length === 0 && selectedState.loads.length === 0 && (
            <div style={{ fontSize: 12, color: "#64748b", textAlign: "center", padding: "12px 0" } as any}>
              Нет траков и грузов в этом штате
            </div>
          )}
        </div>
      )}

      {/* CSS для анимации тостов */}
      <style>{`
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        /* Скрываем логотип amCharts */
        [class*="am5-logo"],
        [class*="amcharts-logo"],
        a[href*="amcharts.com"],
        div[class*="am5-credits"],
        .am5-credits,
        .am5-logo {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        
        /* Адаптивность для мобильных */
        @media (max-width: 768px) {
          .map-timer {
            top: 6px !important;
            padding: 4px 10px !important;
            border-radius: 14px !important;
          }
          .map-timer span {
            font-size: 9px !important;
          }
          .map-timer > div {
            width: 40px !important;
            height: 3px !important;
          }
          
          .map-legend {
            bottom: 76px !important;
            left: 8px !important;
            padding: 6px 8px !important;
            border-radius: 8px !important;
            max-width: calc(100vw - 16px);
          }
          .map-legend > div {
            font-size: 9px !important;
          }
          .map-legend > div > div {
            width: 6px !important;
            height: 6px !important;
          }
          
          .map-toasts {
            top: 8px !important;
            right: 8px !important;
            left: 8px !important;
            max-width: calc(100vw - 16px);
          }
          .map-toasts > div {
            font-size: 11px !important;
            padding: 6px 10px !important;
          }
          
          .map-truck-card {
            bottom: 76px !important;
            left: 8px !important;
            right: 8px !important;
            transform: none !important;
            width: calc(100vw - 16px) !important;
            padding: 8px 10px !important;
            gap: 8px !important;
            flex-wrap: wrap;
          }
          .map-truck-card > div > span:first-child {
            font-size: 12px !important;
          }
          .map-truck-card > div > span:nth-child(2) {
            font-size: 10px !important;
          }
          .map-truck-card button {
            font-size: 11px !important;
            padding: 5px 10px !important;
          }
          
          .map-state-popup {
            top: 8px !important;
            right: 8px !important;
            left: 8px !important;
            width: calc(100vw - 16px) !important;
            max-width: none !important;
            padding: 12px !important;
            max-height: calc(100vh - 80px) !important;
          }
        }
        
        @media (max-width: 480px) {
          .map-timer span {
            font-size: 8px !important;
          }
          .map-legend {
            font-size: 8px !important;
          }
        }
      `}</style>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, overflow: "hidden" as any },
  text: { color: Colors.textMuted, fontSize: 16 },
});
