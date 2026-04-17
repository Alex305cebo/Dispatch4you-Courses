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
  idle:        '#38bdf8', // голубой — свободен
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

  // Авто-fade кнопок управления картой
  const [mapBtnsVisible, setMapBtnsVisible] = useState(true);
  const mapBtnsTimerRef = useRef<any>(null);
  const resetMapBtnsTimer = () => {
    setMapBtnsVisible(true);
    clearTimeout(mapBtnsTimerRef.current);
    mapBtnsTimerRef.current = setTimeout(() => setMapBtnsVisible(false), 4000);
  };

  // Автозакрытие через 4 секунды после открытия
  useEffect(() => {
    if (legendVisible) {
      clearTimeout(legendTimerRef.current);
      legendTimerRef.current = setTimeout(() => setLegendVisible(false), 4000);
    }
    return () => clearTimeout(legendTimerRef.current);
  }, [legendVisible]);

  // Запускаем таймер fade кнопок при маунте
  useEffect(() => {
    mapBtnsTimerRef.current = setTimeout(() => setMapBtnsVisible(false), 4000);
    return () => clearTimeout(mapBtnsTimerRef.current);
  }, []);
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
  const selectedTruckRef = useRef<any>(null); // кликнутый трак (зафиксирован)
  const [selectedState, setSelectedState] = useState<any>(null);
  const [followTruck, setFollowTruck] = useState(false);
  const followTruckIdRef = useRef<string | null>(null); // id трака для авто-слежения после назначения
  const followIntervalRef = useRef<any>(null);
  const truckClickedRef = useRef(false);
  const [toasts, setToasts] = useState<Array<{ id: string; msg: string; color: string }>>([]);
  const zoomLevelRef = useRef(1);
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

  // Следование за траком
  useEffect(() => {
    if (followIntervalRef.current) clearInterval(followIntervalRef.current);
    if (!followTruck) return;
    followIntervalRef.current = setInterval(() => {
      const chart = chartRef.current;
      if (!chart) return;
      const trucks = trucksRef.current;
      // Приоритет: назначенный трак → кликнутый трак → первый активный (loaded/driving)
      const targetId = followTruckIdRef.current ?? selectedTruckRef.current?.truckId;
      const target = targetId
        ? trucks.find((t: any) => t.id === targetId)
        : trucks.find((t: any) => t.status === 'loaded' || t.status === 'driving') ?? trucks[0];
      if (target) {
        chart.zoomToGeoPoint({ longitude: target.position[0], latitude: target.position[1] }, 5, true);
      }
    }, 2000);
    return () => clearInterval(followIntervalRef.current);
  // selectedTruck намеренно убран из зависимостей — используем ref чтобы не перезапускать интервал
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followTruck]);

  // Слушаем событие назначения груза — включаем слежение за конкретным траком
  useEffect(() => {
    function handleFollowAssigned(e: Event) {
      const { truckId } = (e as CustomEvent).detail;
      followTruckIdRef.current = truckId;
      setFollowTruck(true);
      // Сохраняем в sessionStorage — на случай если MapView ещё не был смонтирован
      try { sessionStorage.setItem('followTruckId', truckId); } catch (_) {}
    }
    window.addEventListener('followAssignedTruck', handleFollowAssigned);

    // При монтировании проверяем — вдруг событие уже было до нашей подписки
    try {
      const pending = sessionStorage.getItem('followTruckId');
      if (pending) {
        followTruckIdRef.current = pending;
        setFollowTruck(true);
        sessionStorage.removeItem('followTruckId');
      }
    } catch (_) {}

    return () => window.removeEventListener('followAssignedTruck', handleFollowAssigned);
  }, []);

  // Синхронизируем данные закреплённой карточки при каждом обновлении траков
  useEffect(() => {
    if (!selectedTruckRef.current) return;
    const id = selectedTruckRef.current.truckId;
    const updated = activeTrucks.find((t: any) => t.id === id);
    if (!updated) return;
    const dest = updated.destinationCity ? CITIES[updated.destinationCity] : null;
    const milesLeft = dest
      ? Math.round(Math.hypot(dest[0] - updated.position[0], dest[1] - updated.position[1]) * 55)
      : 0;
    const colorHex = getTruckColor(updated);
    const colorInt = parseInt(colorHex.replace("#", ""), 16);
    const updatedCard = {
      ...selectedTruckRef.current,
      status: updated.status,
      statusLabel: STATUS_LABEL[updated.status] || updated.status,
      currentCity: updated.currentCity,
      destinationCity: updated.destinationCity || "",
      hoursLeft: updated.hoursLeft,
      milesLeft,
      colorHex,
      colorInt,
      currentLoad: updated.currentLoad,
    };
    selectedTruckRef.current = updatedCard;
    setSelectedTruck(updatedCard);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrucks]);
  const chartInitializedRef = useRef(false);
  useEffect(() => {
    // Пропускаем первый вызов — он совпадает с инициализацией карты
    if (!chartInitializedRef.current) return;
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

  // Серия траков — 3 варианта карточек через amCharts bullets
  // Плавная смена варианта карточек: fade out серии → rebuild → fade in
  function switchCardVariant(root: any, chart: any) {
    const oldSeries = truckSeriesRef.current;
    if (!oldSeries) {
      rebuildTruckSeries(root, chart);
      return;
    }
    // Fade out всей серии целиком — это работает надёжно в amCharts5
    oldSeries.animate({ key: "opacity" as any, to: 0, duration: 280 });
    setTimeout(() => {
      rebuildTruckSeries(root, chart);
      const newSeries = truckSeriesRef.current;
      if (!newSeries) return;
      // Стартуем с opacity=0 и плавно показываем
      newSeries.set("opacity" as any, 0);
      newSeries.animate({ key: "opacity" as any, from: 0, to: 1, duration: 350 });
    }, 290);
  }

  function rebuildTruckSeries(root: any, chart: any) {
    if (truckSeriesRef.current) {
      chart.series.removeIndex(chart.series.indexOf(truckSeriesRef.current));
      truckSeriesRef.current.dispose();
      truckSeriesRef.current = null;
    }
    const pointData = buildPointData();
    const zoom = zoomLevelRef.current;
    const variant = zoom < 2 ? 'micro' : zoom < 4 ? 'medium' : 'large';

    const truckSeries = chart.series.push(
      am5map.MapPointSeries.new(root, { latitudeField: "lat", longitudeField: "lng" })
    );

    truckSeries.bullets.push((_root: any, _s: any, dataItem: any) => {
      const d = dataItem.dataContext as any;
      const container = am5.Container.new(root, { cursorOverStyle: "pointer" });

      // Пульс для активных траков
      if (d.active) {
        const pulse = container.children.push(am5.Circle.new(root, {
          radius: 14, fill: am5.color(d.colorInt), fillOpacity: 0,
        }));
        pulse.animate({ key: "radius", from: 8, to: 20, duration: 1400, loops: Infinity });
        pulse.animate({ key: "fillOpacity", from: 0.35, to: 0, duration: 1400, loops: Infinity });
      }
      // Предупреждение idle
      if (d.idleWarning > 0) {
        const warnColor = d.idleWarning >= 3 ? 0xef4444 : d.idleWarning === 2 ? 0xf97316 : 0xfbbf24;
        const warnSpeed = d.idleWarning >= 3 ? 600 : d.idleWarning === 2 ? 800 : 1200;
        const alertPulse = container.children.push(am5.Circle.new(root, {
          radius: 16, fill: am5.color(warnColor), fillOpacity: 0,
        }));
        alertPulse.animate({ key: "radius", from: 10, to: 24, duration: warnSpeed, loops: Infinity });
        alertPulse.animate({ key: "fillOpacity", from: 0.5, to: 0, duration: warnSpeed, loops: Infinity });
      }

      // Точка трака
      container.children.push(am5.Circle.new(root, {
        radius: variant === 'micro' ? 5 : 6,
        fill: am5.color(d.colorInt),
        stroke: am5.color(0xffffff), strokeWidth: 2,
      }));

      // Текстовые строки
      const fromState = CITY_STATE[d.currentCity] || "";
      const toState   = CITY_STATE[d.destinationCity] || "";
      let routeShort  = fromState ? `${d.currentCity}, ${fromState}` : d.currentCity;
      if ((d.status === "loaded" || d.status === "driving") && d.destinationCity) {
        routeShort = `${d.currentCity.substring(0,3).toUpperCase()},${fromState}→${d.destinationCity.substring(0,3).toUpperCase()},${toState}`;
      } else if (d.status === "at_pickup")  { routeShort = "Погрузка"; }
      else if (d.status === "at_delivery")  { routeShort = "Разгрузка"; }
      else if (d.status === "waiting")      { routeShort = "Detention"; }
      else if (d.status === "breakdown")    { routeShort = "Поломка"; }

      const routeFull = d.destinationCity
        ? `${d.currentCity}, ${fromState} → ${d.destinationCity}, ${toState}`
        : routeShort;
      const hosRounded = Math.round(d.hoursLeft * 10) / 10;
      const hosLine = d.milesLeft > 0 ? `${d.milesLeft}mi · ${hosRounded}h HOS` : `${hosRounded}h HOS`;

      const onClick = () => {
        truckClickedRef.current = true;
        // Если кликнули на другой трак — сбрасываем авто-слежение за назначенным
        if (followTruckIdRef.current && followTruckIdRef.current !== d.truckId) {
          followTruckIdRef.current = null;
          setFollowTruck(false);
        }
        // Поднимаем карточку трака поверх всего
        setSelectedTruck(d);
        selectedTruckRef.current = d;
        onTruckInfoRef.current?.(d.truckId);
        const zl = variant === 'micro' ? 3 : 5;
        chartRef.current?.zoomToGeoPoint({ longitude: d.lng, latitude: d.lat }, zl, true);
        setTimeout(() => { truckClickedRef.current = false; }, 100);
      };

      const onHover = () => {
        // При наведении — показываем карточку, но не фиксируем (если уже есть кликнутая — не перебиваем)
        if (!selectedTruckRef.current) {
          setSelectedTruck(d);
        }
      };
      const onHoverOut = () => {
        // Убираем только если это hover-карточка (не кликнутая)
        if (!selectedTruckRef.current) {
          setSelectedTruck(null);
        }
      };

      // ── MICRO: только ID ──────────────────────────────────────────────
      if (variant === 'micro') {
        const W = 46, H = 22;
        const card = container.children.push(am5.Container.new(root, {
          width: W, height: H,
          dy: -(H + 8), dx: -(W / 2),
          interactive: true, cursorOverStyle: "pointer",
        }));
        // Фон
        card.children.push(am5.RoundedRectangle.new(root, {
          width: W, height: H,
          fill: am5.color(0x0d1f35), fillOpacity: 0.95,
          stroke: am5.color(d.colorInt), strokeWidth: 1.5,
          cornerRadiusTL: 5, cornerRadiusTR: 5, cornerRadiusBL: 5, cornerRadiusBR: 5,
        }));
        // Полоска
        card.children.push(am5.RoundedRectangle.new(root, {
          width: W, height: 4, y: 0,
          fill: am5.color(d.colorInt),
          cornerRadiusTL: 5, cornerRadiusTR: 5, cornerRadiusBL: 0, cornerRadiusBR: 0,
        }));
        // ID
        card.children.push(am5.Label.new(root, {
          text: d.truckName,
          fill: am5.color(0xffffff), fontSize: 9, fontWeight: "900",
          x: am5.percent(50), centerX: am5.percent(50),
          y: am5.percent(50), centerY: am5.percent(50),
          dy: 2,
        }));
        card.events.on("click", onClick);
        card.events.on("pointerover", onHover);
        card.events.on("pointerout", onHoverOut);

      // ── MEDIUM: ID + статус + маршрут + HOS ──────────────────────────
      } else if (variant === 'medium') {
        const W = 82, H = 60;
        const card = container.children.push(am5.Container.new(root, {
          width: W, height: H,
          dy: -(H + 10), dx: -(W / 2),
          interactive: true, cursorOverStyle: "pointer",
        }));
        card.children.push(am5.RoundedRectangle.new(root, {
          width: W, height: H,
          fill: am5.color(0x0d1f35), fillOpacity: 0.96,
          stroke: am5.color(d.colorInt), strokeWidth: 1.5,
          cornerRadiusTL: 7, cornerRadiusTR: 7, cornerRadiusBL: 7, cornerRadiusBR: 7,
        }));
        // Полоска
        card.children.push(am5.RoundedRectangle.new(root, {
          width: W, height: 6, y: 0,
          fill: am5.color(d.colorInt),
          cornerRadiusTL: 7, cornerRadiusTR: 7, cornerRadiusBL: 0, cornerRadiusBR: 0,
        }));
        // ID
        card.children.push(am5.Label.new(root, {
          text: d.truckName, fill: am5.color(0xffffff),
          fontSize: 11, fontWeight: "800",
          x: am5.percent(50), centerX: am5.percent(50), y: 10, centerY: 0,
        }));
        // Статус
        card.children.push(am5.Label.new(root, {
          text: `● ${STATUS_LABEL[d.status] || d.status}`,
          fill: am5.color(d.colorInt), fontSize: 8, fontWeight: "700",
          x: am5.percent(50), centerX: am5.percent(50), y: 24, centerY: 0,
        }));
        // Маршрут
        card.children.push(am5.Label.new(root, {
          text: routeShort, fill: am5.color(0xe2e8f0),
          fontSize: 8, fontWeight: "600",
          x: am5.percent(50), centerX: am5.percent(50), y: 36, centerY: 0,
          oversizedBehavior: "truncate", maxWidth: W - 8,
        }));
        // HOS
        card.children.push(am5.Label.new(root, {
          text: hosLine, fill: am5.color(0x94a3b8),
          fontSize: 7,
          x: am5.percent(50), centerX: am5.percent(50), y: 48, centerY: 0,
        }));
        card.events.on("click", onClick);
        card.events.on("pointerover", onHover);
        card.events.on("pointerout", onHoverOut);

      // ── LARGE: полная инфа + водитель ────────────────────────────────
      } else {
        const W = 140, H = 96;
        const card = container.children.push(am5.Container.new(root, {
          width: W, height: H,
          dy: -(H + 12), dx: -(W / 2),
          interactive: true, cursorOverStyle: "pointer",
        }));
        // Свечение
        card.children.push(am5.RoundedRectangle.new(root, {
          width: W + 6, height: H + 6, x: -3, y: -3,
          fill: am5.color(d.colorInt), fillOpacity: 0.15,
          cornerRadiusTL: 12, cornerRadiusTR: 12, cornerRadiusBL: 12, cornerRadiusBR: 12,
        }));
        // Фон
        card.children.push(am5.RoundedRectangle.new(root, {
          width: W, height: H,
          fill: am5.color(0x0d1f35), fillOpacity: 0.98,
          stroke: am5.color(d.colorInt), strokeWidth: 2,
          cornerRadiusTL: 9, cornerRadiusTR: 9, cornerRadiusBL: 9, cornerRadiusBR: 9,
        }));
        // Полоска
        card.children.push(am5.RoundedRectangle.new(root, {
          width: W, height: 8, y: 0,
          fill: am5.color(d.colorInt),
          cornerRadiusTL: 9, cornerRadiusTR: 9, cornerRadiusBL: 0, cornerRadiusBR: 0,
        }));
        // ID
        card.children.push(am5.Label.new(root, {
          text: d.truckName, fill: am5.color(0xffffff),
          fontSize: 15, fontWeight: "900",
          x: am5.percent(50), centerX: am5.percent(50), y: 12, centerY: 0,
        }));
        // Статус
        card.children.push(am5.Label.new(root, {
          text: `● ${STATUS_LABEL[d.status] || d.status}`,
          fill: am5.color(d.colorInt), fontSize: 11, fontWeight: "700",
          x: am5.percent(50), centerX: am5.percent(50), y: 30, centerY: 0,
        }));
        // Маршрут
        card.children.push(am5.Label.new(root, {
          text: routeFull, fill: am5.color(0xe2e8f0),
          fontSize: 10, fontWeight: "600",
          x: am5.percent(50), centerX: am5.percent(50), y: 46, centerY: 0,
          oversizedBehavior: "truncate", maxWidth: W - 12,
        }));
        // Водитель
        card.children.push(am5.Label.new(root, {
          text: `\u{1F464} ${d.driver}`, fill: am5.color(0x94a3b8),
          fontSize: 10, fontWeight: "600",
          x: am5.percent(50), centerX: am5.percent(50), y: 62, centerY: 0,
        }));
        // HOS
        card.children.push(am5.Label.new(root, {
          text: hosLine, fill: am5.color(0x64748b),
          fontSize: 10,
          x: am5.percent(50), centerX: am5.percent(50), y: 78, centerY: 0,
        }));
        card.events.on("click", onClick);
        card.events.on("pointerover", onHover);
        card.events.on("pointerout", onHoverOut);
      }

      container.events.on("click", onClick);
      container.events.on("pointerover", onHover);
      container.events.on("pointerout", onHoverOut);
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
      fill: am5.color(0x0f172a), fillOpacity: 1,
      interactive: true,
    }));

    // Клик по пустому месту карты — сбрасываем слежение и закреплённую карточку
    chart.get("background")?.events.on("click", () => {
      if (followTruckIdRef.current) {
        followTruckIdRef.current = null;
        setFollowTruck(false);
      }
      selectedTruckRef.current = null;
      setSelectedTruck(null);
    });

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
      // tooltipText убран — используем свой попап при клике, чтобы не перекрывал карточки траков
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
      // Клик по штату = клик не на трак → сбрасываем авто-слежение
      if (followTruckIdRef.current) {
        followTruckIdRef.current = null;
        setFollowTruck(false);
      }
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

    // Убираем дефолтный ZoomControl amCharts — используем свои кнопки
    const zoomControl = chart.set("zoomControl", am5map.ZoomControl.new(root, {}));
    zoomControl.homeButton.set("visible", false);
    zoomControl.plusButton.set("visible", false);
    zoomControl.minusButton.set("visible", false);
    zoomControl.set("forceHidden" as any, true);

    function handleZoomToTruck(e: Event) {
      const { lng, lat, slow, mobile } = (e as CustomEvent).detail;
      // Если координаты не переданы — зумим на центр всех траков
      const targetLng = lng ?? (trucksRef.current.length > 0
        ? trucksRef.current.reduce((s, t) => s + t.position[0], 0) / trucksRef.current.length
        : -83.9207);
      const targetLat = lat ?? (trucksRef.current.length > 0
        ? trucksRef.current.reduce((s, t) => s + t.position[1], 0) / trucksRef.current.length
        : 35.9606);

      if (mobile) {
        chart.zoomToGeoPoint({ longitude: targetLng, latitude: targetLat }, 6, true);
      } else if (slow) {
        chart.zoomToGeoPoint({ longitude: -90, latitude: 38 }, 1.2, true);
        setTimeout(() => {
          chart.zoomToGeoPoint({ longitude: targetLng, latitude: targetLat }, 4, true);
        }, 1200);
      } else {
        chart.zoomToGeoPoint({ longitude: targetLng, latitude: targetLat }, 5, true);
      }
    }
    window.addEventListener('zoomToTruck', handleZoomToTruck);

    // Первый рендер
    rebuildHistory(root, chart);
    rebuildRoutes(root, chart);
    rebuildTruckSeries(root, chart);
    setTimeout(() => updatePolygonColors(), 500);
    // Помечаем что инициализация завершена — теперь useEffect[activeTrucks.length] может работать
    setTimeout(() => { chartInitializedRef.current = true; }, 100);

    // Автозум на траки при открытии карты
    setTimeout(() => {
      const ts = trucksRef.current;
      if (ts.length === 0) return;

      const avgLng = ts.reduce((s, t) => s + t.position[0], 0) / ts.length;
      const avgLat = ts.reduce((s, t) => s + t.position[1], 0) / ts.length;

      // Считаем разброс траков чтобы подобрать уровень зума
      const maxDist = ts.reduce((max, t) => {
        const d = Math.hypot(t.position[0] - avgLng, t.position[1] - avgLat);
        return Math.max(max, d);
      }, 0);

      // Чем меньше разброс — тем сильнее зум (3–6)
      const zoomLevel = maxDist < 3 ? 6 : maxDist < 8 ? 4 : maxDist < 15 ? 3 : 2;

      chart.zoomToGeoPoint({ longitude: avgLng, latitude: avgLat }, zoomLevel, true);
    }, 800);

    // Анимация муравьёв — обновляем strokeDashoffset на живых линиях каждые 60ms
    let dashOffset = 0;
    const antInterval = window.setInterval(() => {
      dashOffset = (dashOffset - 2 + 10000) % 10000;
      antLinesRef.current.forEach(line => {
        try { line.set("strokeDashoffset", dashOffset); } catch (_) {}
      });
    }, 60);

    // Полное обновление каждые 2 секунды + отслеживание zoom для смены варианта карточек
    let lastVariant = 'medium';
    intervalRef.current = setInterval(() => {
      const newZoom = chartRef.current?.get("zoomLevel") ?? 1;
      const newVariant = newZoom < 2 ? 'micro' : newZoom < 4 ? 'medium' : 'large';
      zoomLevelRef.current = newZoom;
      rebuildHistory(root, chart);
      rebuildRoutes(root, chart);
      updatePolygonColors();
      if (newVariant !== lastVariant) {
        lastVariant = newVariant;
        switchCardVariant(root, chart);
      } else {
        rebuildTruckSeries(root, chart);
      }
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

  const mapBtnStyle = (active = false) => ({
    width: 44, height: 44, borderRadius: 12,
    background: active
      ? "linear-gradient(135deg, rgba(6,182,212,0.35), rgba(14,165,233,0.2))"
      : "linear-gradient(160deg, rgba(15,28,55,0.97), rgba(10,20,42,0.97))",
    border: active ? "1.5px solid rgba(6,182,212,0.8)" : "1.5px solid rgba(56,189,248,0.2)",
    boxShadow: active
      ? "0 0 14px rgba(6,182,212,0.6), inset 0 1px 0 rgba(255,255,255,0.08)"
      : "0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
    cursor: "pointer", fontSize: 20, fontWeight: 700, color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.15s", padding: 0,
    animation: active ? "follow-pulse 1.5s ease-in-out infinite" : "none",
  } as any);

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
        position: "absolute", bottom: 8, left: 8,
        background: "rgba(10,22,40,0.92)", borderRadius: 12,
        border: "1px solid rgba(45,106,79,0.4)",
        padding: legendVisible ? "8px 12px" : "5px 10px",
        display: "flex", flexDirection: "column", gap: 4,
        fontFamily: "sans-serif", pointerEvents: "auto",
        transition: "padding 0.2s, opacity 0.6s ease",
        opacity: legendVisible ? 1 : 0.85,
        maxWidth: 175,
        zIndex: 100,
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
            <div style={{ fontSize: 9, color: "#ff6b35", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } as any}>
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

      {/* Невидимая зона активации кнопок когда они прозрачные */}
      {!mapBtnsVisible && (
        <div
          onMouseEnter={resetMapBtnsTimer}
          onTouchStart={resetMapBtnsTimer}
          style={{
            position: "absolute", right: 10, bottom: 10,
            width: 56, height: 220,
            zIndex: 201, pointerEvents: "auto", cursor: "pointer",
          } as any}
        />
      )}
      {/* Кнопки управления картой — все 4 компактно внизу справа */}
      <div
        onMouseEnter={resetMapBtnsTimer}
        onMouseLeave={resetMapBtnsTimer}
        onTouchStart={resetMapBtnsTimer}
        style={{
          position: "absolute", right: 10, bottom: 10,
          zIndex: 200,
          pointerEvents: mapBtnsVisible ? "auto" : "none",
          display: "flex", flexDirection: "column", gap: 6,
          background: "rgba(8,16,32,0.7)",
          borderRadius: 16,
          border: "1px solid rgba(56,189,248,0.12)",
          padding: "8px 6px",
          backdropFilter: "blur(8px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
          opacity: mapBtnsVisible ? 1 : 0.12,
          transition: "opacity 0.6s ease",
        } as any}>
        {/* 🏠 Home */}
        <button onClick={() => { resetMapBtnsTimer(); chartRef.current?.goHome(); }} title="Обзор"
          style={mapBtnStyle()}>🏠</button>
        {/* + Zoom in */}
        <button onClick={() => { resetMapBtnsTimer(); chartRef.current?.zoomIn(); }} title="Приблизить"
          style={{ ...mapBtnStyle(), fontSize: 22, fontWeight: 900, color: "#38bdf8" }}>＋</button>
        {/* − Zoom out */}
        <button onClick={() => { resetMapBtnsTimer(); chartRef.current?.zoomOut(); }} title="Отдалить"
          style={{ ...mapBtnStyle(), fontSize: 22, fontWeight: 900, color: "#94a3b8" }}>－</button>
        {/* 🎯 Follow */}
        <button
          onClick={() => {
            resetMapBtnsTimer();
            const next = !followTruck;
            if (!next) followTruckIdRef.current = null; // сбрасываем только при выключении
            setFollowTruck(next);
          }}
          title={followTruck ? "Отключить слежение" : "Следить за траком"}
          style={mapBtnStyle(followTruck)}
        >🎯</button>
      </div>

      {/* Плашка трака — поверх всего при клике/hover */}
      {selectedTruck && (
        <div style={{
          position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
          background: "rgba(8,14,28,0.98)",
          border: `2px solid ${selectedTruck.colorHex}`,
          borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12,
          zIndex: 9999,
          boxShadow: `0 0 0 1px ${selectedTruck.colorHex}44, 0 8px 32px rgba(0,0,0,0.7), 0 0 24px ${selectedTruck.colorHex}33`,
          fontFamily: "sans-serif", whiteSpace: "nowrap",
          transition: "border-color 0.2s, box-shadow 0.2s",
        } as any} className="map-truck-card">
          {/* Индикатор "закреплено" */}
          {selectedTruckRef.current?.truckId === selectedTruck.truckId && (
            <div style={{
              position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)",
              background: selectedTruck.colorHex, borderRadius: 4,
              padding: "1px 8px", fontSize: 9, fontWeight: 800, color: "#000",
              letterSpacing: 0.5, whiteSpace: "nowrap",
            } as any}>📌 ЗАКРЕПЛЕНО</div>
          )}
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: selectedTruck.colorHex, flexShrink: 0, boxShadow: `0 0 8px ${selectedTruck.colorHex}` } as any} />
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
            <button onClick={() => { onFindLoad?.(selectedTruck.currentCity); setSelectedTruck(null); selectedTruckRef.current = null; chartRef.current?.goHome(); }} style={{
              background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.4)",
              borderRadius: 8, padding: "6px 12px", color: "#4ade80",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
            } as any}>🔍 Найти груз</button>
          )}
          <span onClick={() => { setSelectedTruck(null); selectedTruckRef.current = null; }}
            style={{ cursor: "pointer", fontSize: 18, color: "#64748b", paddingLeft: 4, lineHeight: 1 } as any}>✕</span>
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
        @keyframes follow-pulse {
          0%,100% { box-shadow: 0 0 14px rgba(6,182,212,0.6); }
          50% { box-shadow: 0 0 24px rgba(6,182,212,1), 0 0 40px rgba(6,182,212,0.4); }
        }
        /* Подгоняем ZoomControl под наш стиль */
        .am5-zoomtools-button {
          width: 32px !important;
          height: 32px !important;
          border-radius: 8px !important;
        }
        /* Скрываем дефолтные кнопки зума amCharts */
        .am5-zoomtools,
        [class*="am5-zoomtools"],
        .am5-zoom-control,
        [class*="am5-zoom"] {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
          visibility: hidden !important;
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
            bottom: 8px !important;
            left: 8px !important;
            padding: 6px 8px !important;
            border-radius: 8px !important;
            max-width: 160px !important;
          }
          .map-legend > div > div {
            font-size: 9px !important;
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
            bottom: 8px !important;
          }
        }

        /* Десктоп — легенда строго внизу */
        @media (min-width: 769px) {
          .map-legend {
            bottom: 12px !important;
            left: 12px !important;
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
