import { useEffect, useRef, useState } from "react";
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

function getTruckColor(truck: any): string {
  if ((truck as any).outOfOrderUntil > 0) return "#ff0000";
  const warn = (truck as any).idleWarningLevel ?? 0;
  if (warn === 3) return "#ef4444";
  if (warn === 2) return "#f97316";
  if (warn === 1) return "#fbbf24";
  return STATUS_COLOR[truck.status] || "#94a3b8";
}

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
  const intervalRef = useRef<any>(null);

  const { trucks, availableLoads } = useGameStore();
  const trucksRef = useRef(trucks);
  const loadsRef = useRef(availableLoads);
  trucksRef.current = trucks;
  loadsRef.current = availableLoads;

  const [selectedTruck, setSelectedTruck] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<any>(null);

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
        colorHex,
        colorInt,
        idleWarning: (t as any).idleWarningLevel ?? 0,
        active: t.status === "loaded" || t.status === "driving",
        breakdown: t.status === "breakdown",
        waiting: t.status === "waiting",
        milesLeft,
        currentCity: t.currentCity,
        destinationCity: t.destinationCity || "",
        hoursLeft: t.hoursLeft,
        currentLoad: t.currentLoad,
      };
    });
  }

  // Пересоздаём серию маршрутов по routePath из store
  function rebuildRoutes(root: any, chart: any) {
    // Удаляем старую серию маршрутов
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

    trucksWithRoute.forEach(t => {
      const colorInt = parseInt(getTruckColor(t).replace("#", ""), 16);
      const path = t.routePath!;

      // Прогресс трака — показываем только оставшуюся часть маршрута
      const startIdx = Math.floor(t.progress * (path.length - 1));
      const remainingPath = path.slice(startIdx);

      if (remainingPath.length < 2) return;

      // Пройденная часть — тусклая
      const donePath = path.slice(0, startIdx + 1);
      if (donePath.length >= 2) {
        routeSeries.pushDataItem({
          geometry: { type: "LineString", coordinates: donePath },
          stroke: am5.color(colorInt),
          strokeOpacity: 0.2,
          strokeWidth: 2,
        } as any);
      }

      // Оставшаяся часть — яркая с градиентом
      routeSeries.pushDataItem({
        geometry: { type: "LineString", coordinates: remainingPath },
        stroke: am5.color(colorInt),
        strokeOpacity: 0.85,
        strokeWidth: 3,
      } as any);
    });

    // Стиль линий через template
    routeSeries.mapLines.template.setAll({
      strokeWidth: 3,
      strokeOpacity: 0.85,
      strokeDasharray: [0],
    });

    routeSeriesRef.current = routeSeries;
  }

  // Пересоздаём серию траков — единственный надёжный способ обновить цвета в amCharts5
  function rebuildTruckSeries(root: any, chart: any) {
    // Удаляем старую серию
    if (truckSeriesRef.current) {
      chart.series.removeIndex(chart.series.indexOf(truckSeriesRef.current));
      truckSeriesRef.current.dispose();
      truckSeriesRef.current = null;
    }

    const pointData = buildPointData();

    const truckSeries = chart.series.push(
      am5map.MapPointSeries.new(root, {
        latitudeField: "lat",
        longitudeField: "lng",
      })
    );

    truckSeries.bullets.push((_root: any, _s: any, dataItem: any) => {
      const d = dataItem.dataContext as any;
      const container = am5.Container.new(root, { cursorOverStyle: "pointer" });

      // Пульс для едущих траков
      if (d.active) {
        const pulse = container.children.push(am5.Circle.new(root, {
          radius: 14, fill: am5.color(d.colorInt), fillOpacity: 0,
        }));
        pulse.animate({ key: "radius", from: 8, to: 20, duration: 1400, loops: Infinity });
        pulse.animate({ key: "fillOpacity", from: 0.35, to: 0, duration: 1400, loops: Infinity });
      }

      // Пульс-тревога
      if (d.idleWarning > 0) {
        const warnColor = d.idleWarning >= 3 ? 0xef4444 : d.idleWarning === 2 ? 0xf97316 : 0xfbbf24;
        const warnSpeed = d.idleWarning >= 3 ? 600 : d.idleWarning === 2 ? 800 : 1200;
        const alertPulse = container.children.push(am5.Circle.new(root, {
          radius: 16, fill: am5.color(warnColor), fillOpacity: 0,
        }));
        alertPulse.animate({ key: "radius", from: 10, to: 24, duration: warnSpeed, loops: Infinity });
        alertPulse.animate({ key: "fillOpacity", from: 0.5, to: 0, duration: warnSpeed, loops: Infinity });
      }

      // Точка-якорь
      container.children.push(am5.Circle.new(root, {
        radius: 5,
        fill: am5.color(d.colorInt),
        stroke: am5.color(0xffffff),
        strokeWidth: 2,
      }));

      // Строка 1: имя трака
      const line1 = d.truckName;

      // Строка 2: маршрут (если едет) или город (если стоит)
      let line2 = d.currentCity;
      if ((d.status === "loaded" || d.status === "driving") && d.destinationCity) {
        // Сокращаем города до 3 букв
        const from = d.currentCity.substring(0, 3).toUpperCase();
        const to = d.destinationCity.substring(0, 3).toUpperCase();
        line2 = `${from}→${to}`;
      } else if (d.status === "at_pickup") {
        line2 = "📦 Погрузка";
      } else if (d.status === "at_delivery") {
        line2 = "🏁 Разгрузка";
      } else if (d.status === "waiting") {
        line2 = "⏱ Detention";
      } else if (d.status === "breakdown") {
        line2 = "⚠️ Поломка";
      }

      // Строка 3: прогресс или HOS
      let line3 = "";
      if (d.milesLeft > 0) {
        line3 = `${d.milesLeft}mi · ${d.hoursLeft}h HOS`;
      } else {
        line3 = `${d.hoursLeft}h HOS`;
      }

      // Карточка над точкой — центрирована по X над точкой
      const CARD_W = 76;
      const CARD_H = 56;
      const CX = CARD_W / 2; // центр карточки по X
      const card = container.children.push(am5.Container.new(root, {
        dy: -CARD_H - 10,
        dx: -(CARD_W / 2),
      }));

      // Фон карточки
      card.children.push(am5.RoundedRectangle.new(root, {
        width: CARD_W, height: CARD_H,
        fill: am5.color(0x0d1f35), fillOpacity: 0.96,
        stroke: am5.color(d.colorInt), strokeWidth: 1.5,
        cornerRadiusTL: 7, cornerRadiusTR: 7,
        cornerRadiusBL: 7, cornerRadiusBR: 7,
      }));

      // Цветная полоска сверху
      card.children.push(am5.RoundedRectangle.new(root, {
        width: CARD_W, height: 6,
        fill: am5.color(d.colorInt), fillOpacity: 1,
        cornerRadiusTL: 7, cornerRadiusTR: 7,
        cornerRadiusBL: 0, cornerRadiusBR: 0,
      }));

      // Имя трака — центр
      card.children.push(am5.Label.new(root, {
        text: line1,
        fill: am5.color(0xffffff),
        fontSize: 11, fontWeight: "800",
        centerX: am5.percent(50), x: CX,
        y: 9,
      }));

      // Статус
      const statusText = STATUS_LABEL[d.status] || d.status;
      card.children.push(am5.Label.new(root, {
        text: `● ${statusText}`,
        fill: am5.color(d.colorInt),
        fontSize: 8, fontWeight: "700",
        centerX: am5.percent(50), x: CX,
        y: 22,
      }));

      // Маршрут
      card.children.push(am5.Label.new(root, {
        text: line2,
        fill: am5.color(0xe2e8f0),
        fontSize: 9, fontWeight: "600",
        centerX: am5.percent(50), x: CX,
        y: 33,
      }));

      // Мили / HOS
      card.children.push(am5.Label.new(root, {
        text: line3,
        fill: am5.color(0x64748b),
        fontSize: 7,
        centerX: am5.percent(50), x: CX,
        y: 45,
      }));

      // Клик
      container.events.on("click", () => {
        setSelectedTruck(d);
        const c = chartRef.current;
        if (c) c.zoomToGeoPoint({ longitude: d.lng, latitude: d.lat }, 4, true);
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
      fill: am5.color(0x0a1628), fillOpacity: 1,
    }));

    // Штаты
    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, { geoJSON: am5geodata_usaLow })
    );
    polygonSeries.mapPolygons.template.setAll({
      fill: am5.color(0x1a3a2a), stroke: am5.color(0x2d6a4f),
      strokeWidth: 0.8, fillOpacity: 0.9, interactive: true,
    });
    polygonSeries.mapPolygons.template.states.create("hover", { fill: am5.color(0x2d6a4f) });
    polygonSeries.mapPolygons.template.events.on("click", (ev: any) => {
      const rawId = ev.target.dataItem?.get("id") as string;
      const stateName = ev.target.dataItem?.get("name");
      if (!rawId) return;
      const stateId = rawId.replace("US-", "");
      const ts = trucksRef.current;
      const ls = loadsRef.current;
      setSelectedState({
        id: stateId, name: stateName,
        trucks: ts.filter(t => CITY_STATE[t.currentCity] === stateId || CITY_STATE[t.destinationCity || ""] === stateId),
        loads: ls.filter(l => CITY_STATE[l.fromCity] === stateId),
      });
    });

    // Сетка
    const graticuleSeries = chart.series.push(am5map.GraticuleSeries.new(root, {}));
    graticuleSeries.mapLines.template.setAll({
      stroke: am5.color(0x2d6a4f), strokeOpacity: 0.06, strokeWidth: 0.5,
    });

    // Города
    const citySeries = chart.series.push(
      am5map.MapPointSeries.new(root, { latitudeField: "lat", longitudeField: "lng" })
    );
    citySeries.bullets.push((_root: any, _s: any, dataItem: any) => {
      const d = dataItem.dataContext as any;
      if (!d.major) return am5.Bullet.new(root, { sprite: am5.Circle.new(root, { radius: 0 }) });
      const label = am5.Label.new(root, {
        text: d.name,
        fill: am5.color(0xffffff),
        fillOpacity: 0.45,
        fontSize: 9,
        fontWeight: "400",
        centerX: am5.percent(50),
        centerY: am5.percent(50),
      });
      return am5.Bullet.new(root, { sprite: label });
    });
    citySeries.data.setAll(
      Object.entries(CITIES).map(([name, coords]) => ({
        name, lat: coords[1], lng: coords[0], major: HUBS.includes(name),
      }))
    );

    // Zoom controls
    const zoomControl = chart.set("zoomControl", am5map.ZoomControl.new(root, {}));
    zoomControl.homeButton.set("visible", true);

    // Первое создание серий
    rebuildRoutes(root, chart);
    rebuildTruckSeries(root, chart);

    // Обновление каждые 2 секунды
    intervalRef.current = setInterval(() => {
      rebuildRoutes(root, chart);
      rebuildTruckSeries(root, chart);
    }, 2000);

    return () => {
      clearInterval(intervalRef.current);
      root.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      <div ref={divRef} style={{ width: "100%", height: "100%", display: "block" } as any} />

      {/* Легенда */}
      <div style={{
        position: "absolute", bottom: 12, left: 12,
        background: "rgba(10,22,40,0.92)", borderRadius: 12,
        border: "1px solid rgba(45,106,79,0.4)", padding: "8px 12px",
        display: "flex", flexDirection: "column", gap: 4, pointerEvents: "none",
      } as any}>
        {Object.entries(STATUS_LABEL).map(([s, l]) => {
          const n = trucks.filter(t => t.status === s).length;
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 } as any}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLOR[s] } as any} />
              <span style={{ fontSize: 10, color: "#94a3b8", fontFamily: "sans-serif" } as any}>{STATUS_EMOJI[s]} {l}</span>
              {n > 0 && <span style={{ fontSize: 10, fontWeight: 800, color: STATUS_COLOR[s], marginLeft: "auto", paddingLeft: 8, fontFamily: "sans-serif" } as any}>{n}</span>}
            </div>
          );
        })}
      </div>

      {/* Плашка трака */}
      {selectedTruck && (
        <div style={{
          position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)",
          background: "rgba(8,14,28,0.96)", border: `1px solid ${selectedTruck.colorHex}`,
          borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12,
          zIndex: 1000, boxShadow: "0 4px 20px rgba(0,0,0,0.5)", fontFamily: "sans-serif", whiteSpace: "nowrap",
        } as any}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: selectedTruck.colorHex } as any} />
          <div style={{ display: "flex", flexDirection: "column", gap: 2 } as any}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#fff" } as any}>🚛 {selectedTruck.truckName}</span>
            <span style={{ fontSize: 11, color: selectedTruck.colorHex } as any}>{selectedTruck.statusLabel} · {selectedTruck.currentCity}</span>
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
          border: "2px solid rgba(6,182,212,0.4)",
          padding: "14px 18px", minWidth: 200, zIndex: 1000,
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        } as any}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 } as any}>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#06b6d4", fontFamily: "sans-serif" } as any}>
              {selectedState.id} — {selectedState.name}
            </span>
            <span onClick={() => setSelectedState(null)} style={{ cursor: "pointer", fontSize: 16, color: "#94a3b8", fontFamily: "sans-serif" } as any}>✕</span>
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "sans-serif", marginBottom: 6 } as any}>🚛 Траков: {selectedState.trucks.length}</div>
          <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "sans-serif" } as any}>📋 Грузов из штата: {selectedState.loads.length}</div>
          {selectedState.trucks.map((t: any) => (
            <div key={t.id} style={{ fontSize: 10, color: STATUS_COLOR[t.status], marginTop: 4, fontFamily: "sans-serif" } as any}>
              {STATUS_EMOJI[t.status]} {t.name} — {t.driver}
            </div>
          ))}
        </div>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, overflow: "hidden" as any },
  text: { color: Colors.textMuted, fontSize: 16 },
});
