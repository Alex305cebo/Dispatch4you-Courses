import { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Platform, Text, TouchableOpacity } from "react-native";
import { useGameStore } from "../store/gameStore";
import { CITIES, CITY_STATE } from "../constants/config";
import { Colors } from "../constants/colors";

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
  at_pickup: "🟡", at_delivery: "��",
  breakdown: "🔴", waiting: "🟠",
};

// Крупные хабы для отображения на карте
const HUBS = [
  "Chicago","Los Angeles","New York","Houston","Dallas",
  "Atlanta","Seattle","Miami","Denver","Phoenix","Memphis",
  "Nashville","Indianapolis","Kansas City","Minneapolis",
  "Portland","San Francisco","Las Vegas","Salt Lake City",
];

export default function MapView() {
  if (Platform.OS !== "web") {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Карта доступна в веб-версии</Text>
      </View>
    );
  }
  return <MapAmCharts />;
}

function MapAmCharts() {
  const divRef = useRef<any>(null);
  const chartRef = useRef<any>(null);
  const rootRef = useRef<any>(null);
  const polygonSeriesRef = useRef<any>(null);
  const truckSeriesRef = useRef<any>(null);
  const lineSeriesRef = useRef<any>(null);
  const citySeriesRef = useRef<any>(null);
  const am5Ref = useRef<any>(null);
  const intervalRef = useRef<any>(null);

  const { trucks, availableLoads } = useGameStore();
  const trucksRef = useRef(trucks);
  const loadsRef = useRef(availableLoads);
  trucksRef.current = trucks;
  loadsRef.current = availableLoads;

  const [selectedTruck, setSelectedTruck] = useState<any>(null);
  const [selectedState, setSelectedState] = useState<any>(null);

  useEffect(() => {
    if (!divRef.current) return;

    async function init() {
      const am5 = await import("@amcharts/amcharts5");
      const am5map = await import("@amcharts/amcharts5/map");
      const am5geodata = await import("@amcharts/amcharts5-geodata/usaLow");
      const am5themes = await import("@amcharts/amcharts5/themes/Animated");
      am5Ref.current = am5;

      const root = am5.Root.new(divRef.current);
      root.setThemes([am5themes.default.new(root)]);
      rootRef.current = root;

      const chart = root.container.children.push(
        am5map.MapChart.new(root, {
          panX: "translateX",
          panY: "translateY",
          projection: am5map.geoAlbersUsa(),
          homeZoomLevel: 1,
          wheelY: "zoom",
          maxZoomLevel: 8,
        })
      );
      chartRef.current = chart;

      chart.set("background", am5.Rectangle.new(root, {
        fill: am5.color(0x0a1628), fillOpacity: 1,
      }));

      // ── Штаты ──────────────────────────────────────────────────────
      const polygonSeries = chart.series.push(
        am5map.MapPolygonSeries.new(root, { geoJSON: am5geodata.default })
      );
      polygonSeriesRef.current = polygonSeries;

      polygonSeries.mapPolygons.template.setAll({
        fill: am5.color(0x1a3a2a),
        stroke: am5.color(0x2d6a4f),
        strokeWidth: 0.8,
        fillOpacity: 0.9,
        interactive: true,
        tooltipText: "{id} — {name}",
      });
      polygonSeries.mapPolygons.template.states.create("hover", {
        fill: am5.color(0x2d6a4f),
      });
      polygonSeries.mapPolygons.template.states.create("active", {
        fill: am5.color(0x06b6d4),
        fillOpacity: 0.4,
      });

      // Клик на штат
      polygonSeries.mapPolygons.template.events.on("click", (ev: any) => {
        const stateId = ev.target.dataItem?.get("id");
        const stateName = ev.target.dataItem?.get("name");
        if (!stateId) return;
        const ts = trucksRef.current;
        const ls = loadsRef.current;
        const trucksInState = ts.filter(t => CITY_STATE[t.currentCity] === stateId || CITY_STATE[t.destinationCity || ""] === stateId);
        const loadsFromState = ls.filter(l => CITY_STATE[l.fromCity] === stateId);
        setSelectedState({ id: stateId, name: stateName, trucks: trucksInState, loads: loadsFromState });
      });

      // Лейблы штатов при hover
      polygonSeries.bullets.push(() =>
        am5.Bullet.new(root, {
          sprite: am5.Label.new(root, {
            text: "{id}",
            fill: am5.color(0x4ade80),
            fontSize: 9,
            fontWeight: "700",
            centerX: am5.percent(50),
            centerY: am5.percent(50),
            populateText: true,
            visible: false,
          }),
        })
      );
      polygonSeries.mapPolygons.template.events.on("pointerover", (ev: any) => {
        const b = ev.target.dataItem?.bullets?.[0]?.get("sprite");
        if (b) b.set("visible", true);
      });
      polygonSeries.mapPolygons.template.events.on("pointerout", (ev: any) => {
        const b = ev.target.dataItem?.bullets?.[0]?.get("sprite");
        if (b) b.set("visible", false);
      });

      // ── Линии маршрутов ────────────────────────────────────────────
      const lineSeries = chart.series.push(am5map.MapLineSeries.new(root, {}));
      lineSeries.mapLines.template.setAll({
        strokeOpacity: 0.6,
        strokeWidth: 2,
        strokeDasharray: [6, 4],
      });
      lineSeriesRef.current = lineSeries;

      // ── Города ────────────────────────────────────────────────────
      const citySeries = chart.series.push(
        am5map.MapPointSeries.new(root, {
          latitudeField: "lat",
          longitudeField: "lng",
        })
      );
      citySeries.bullets.push((_root: any, _s: any, dataItem: any) => {
        const d = dataItem.dataContext as any;
        const container = am5.Container.new(root, {});
        container.children.push(am5.Circle.new(root, {
          radius: d.major ? 4 : 2,
          fill: am5.color(d.major ? 0xffffff : 0x4ade80),
          fillOpacity: d.major ? 1 : 0.5,
          stroke: am5.color(0x0a1628),
          strokeWidth: 1,
        }));
        if (d.major) {
          container.children.push(am5.Label.new(root, {
            text: d.name,
            fill: am5.color(0xd1fae5),
            fontSize: 9,
            fontWeight: "600",
            centerX: am5.percent(50),
            dy: -14,
            background: am5.Rectangle.new(root, {
              fill: am5.color(0x0a1628),
              fillOpacity: 0.7,
            }),
          }));
        }
        return am5.Bullet.new(root, { sprite: container });
      });
      citySeriesRef.current = citySeries;

      // Заполняем города
      const cityData = Object.entries(CITIES).map(([name, coords]) => ({
        name,
        lat: coords[1],
        lng: coords[0],
        major: HUBS.includes(name),
      }));
      citySeries.data.setAll(cityData);

      // ── Траки ──────────────────────────────────────────────────────
      const truckSeries = chart.series.push(
        am5map.MapPointSeries.new(root, {
          latitudeField: "lat",
          longitudeField: "lng",
        })
      );
      truckSeriesRef.current = truckSeries;

      truckSeries.bullets.push((_root: any, _s: any, dataItem: any) => {
        const d = dataItem.dataContext as any;
        const container = am5.Container.new(root, { cursorOverStyle: "pointer" });

        // Пульс для активных
        if (d.active) {
          const pulse = container.children.push(am5.Circle.new(root, {
            radius: 16, fill: am5.color(d.color), fillOpacity: 0.15,
          }));
          pulse.animate({ key: "radius", from: 10, to: 22, duration: 1200, loops: Infinity });
          pulse.animate({ key: "fillOpacity", from: 0.25, to: 0, duration: 1200, loops: Infinity });
        }

        // Тень
        container.children.push(am5.Circle.new(root, {
          radius: 10, fill: am5.color(0x000000), fillOpacity: 0.3, dy: 3, dx: 2,
        }));

        // Основной круг
        container.children.push(am5.Circle.new(root, {
          radius: 10, fill: am5.color(d.color),
          stroke: am5.color(0xffffff), strokeWidth: 2,
        }));

        // Иконка статуса
        const icon = d.breakdown ? "⚠️" : d.waiting ? "⏱" : "🚛";
        container.children.push(am5.Label.new(root, {
          text: icon,
          fontSize: 10,
          centerX: am5.percent(50),
          centerY: am5.percent(50),
        }));

        // Имя трака над иконкой
        container.children.push(am5.Label.new(root, {
          text: d.truckName,
          fill: am5.color(0xffffff),
          fontSize: 8,
          fontWeight: "700",
          centerX: am5.percent(50),
          dy: -20,
          background: am5.Rectangle.new(root, {
            fill: am5.color(d.color),
            fillOpacity: 0.85,
            cornerRadiusTL: 4, cornerRadiusTR: 4,
            cornerRadiusBL: 4, cornerRadiusBR: 4,
          }),
        }));

        // Миль до доставки
        if (d.milesLeft > 0) {
          container.children.push(am5.Label.new(root, {
            text: `${d.milesLeft}mi`,
            fill: am5.color(0xd1fae5),
            fontSize: 7,
            centerX: am5.percent(50),
            dy: 22,
          }));
        }

        // Клик на трак
        container.events.on("click", () => {
          setSelectedTruck(d);
        });

        return am5.Bullet.new(root, { sprite: container });
      });

      // ── Кнопки zoom ────────────────────────────────────────────────
      const zoomControl = chart.set("zoomControl", am5map.ZoomControl.new(root, {}));
      zoomControl.homeButton.set("visible", true);

      // ── Обновление данных ──────────────────────────────────────────
      function updateMap() {
        const ts = trucksRef.current;
        const am5c = am5Ref.current;
        if (!am5c) return;

        // Обновляем цвет штатов по активности
        const activeStates = new Set<string>();
        ts.forEach(t => {
          if (CITY_STATE[t.currentCity]) activeStates.add(CITY_STATE[t.currentCity]);
          if (t.destinationCity && CITY_STATE[t.destinationCity]) activeStates.add(CITY_STATE[t.destinationCity]);
        });
        polygonSeries.mapPolygons.each((polygon: any) => {
          const stateId = polygon.dataItem?.get("id");
          if (activeStates.has(stateId)) {
            polygon.set("fill", am5c.color(0x1e5c3a));
            polygon.set("fillOpacity", 1);
          } else {
            polygon.set("fill", am5c.color(0x1a3a2a));
            polygon.set("fillOpacity", 0.9);
          }
        });

        // Обновляем траки — разделяем стакнутые маркеры
        // Группируем по округлённым координатам чтобы найти совпадения
        const positionCount: Record<string, number> = {};
        const positionIndex: Record<string, number> = {};
        ts.forEach(t => {
          const key = `${t.position[0].toFixed(2)},${t.position[1].toFixed(2)}`;
          positionCount[key] = (positionCount[key] || 0) + 1;
        });

        const pointData = ts.map(t => {
          const dest = t.destinationCity ? CITIES[t.destinationCity] : null;
          const milesLeft = dest ? Math.round(
            Math.hypot(dest[0] - t.position[0], dest[1] - t.position[1]) * 55
          ) : 0;

          // Jitter: если несколько траков на одной позиции — раскладываем по кругу
          const key = `${t.position[0].toFixed(2)},${t.position[1].toFixed(2)}`;
          const total = positionCount[key] || 1;
          positionIndex[key] = (positionIndex[key] || 0);
          const idx = positionIndex[key];
          positionIndex[key]++;

          let jitterLng = 0;
          let jitterLat = 0;
          if (total > 1) {
            const angle = (2 * Math.PI * idx) / total;
            const radius = 0.8; // градусы — ~50-80 миль разброс
            jitterLng = Math.cos(angle) * radius;
            jitterLat = Math.sin(angle) * radius;
          }

          return {
            lat: t.position[1] + jitterLat,
            lng: t.position[0] + jitterLng,
            truckName: t.name.replace("Truck ", "T"),
            driver: t.driver,
            status: t.status,
            statusLabel: STATUS_LABEL[t.status] || t.status,
            color: parseInt((STATUS_COLOR[t.status] || "#94a3b8").replace("#", ""), 16),
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
        truckSeries.data.setAll(pointData);

        // Обновляем линии маршрутов
        const lineData = ts
          .filter(t => t.destinationCity && CITIES[t.destinationCity])
          .map(t => {
            const dest = CITIES[t.destinationCity!];
            const color = parseInt((STATUS_COLOR[t.status] || "#94a3b8").replace("#", ""), 16);
            return {
              geometry: { type: "LineString", coordinates: [[t.position[0], t.position[1]], [dest[0], dest[1]]] },
              stroke: am5c.color(color),
            };
          });
        lineSeries.data.setAll(lineData);
        lineSeries.mapLines.each((line: any, i: number) => {
          if (lineData[i]) line.set("stroke", am5c.color(lineData[i].stroke));
        });
      }

      updateMap();
      intervalRef.current = setInterval(updateMap, 1000);

      return () => {
        clearInterval(intervalRef.current);
        root.dispose();
      };
    }

    const cleanup = init();
    return () => { cleanup.then(fn => fn && fn()); };
  }, []);

  return (
    <View style={styles.container}>
      <div ref={divRef} style={{ width: "100%", height: "100%" } as any} />

      {/* Легенда */}
      <div style={{
        position: "absolute", bottom: 12, left: 12,
        background: "rgba(10,22,40,0.92)", borderRadius: 12,
        border: "1px solid rgba(45,106,79,0.4)", padding: "8px 12px",
        display: "flex", flexDirection: "column", gap: 4,
        pointerEvents: "none",
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

      {/* Попап трака */}
      {selectedTruck && (
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          background: "rgba(8,14,28,0.97)", borderRadius: 16,
          border: `2px solid ${STATUS_COLOR[selectedTruck.status]}`,
          padding: "16px 20px", minWidth: 240, zIndex: 1000,
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        } as any}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 } as any}>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: "sans-serif" } as any}>
              🚛 {selectedTruck.truckName}
            </span>
            <span onClick={() => setSelectedTruck(null)} style={{ cursor: "pointer", fontSize: 18, color: "#94a3b8", fontFamily: "sans-serif" } as any}>✕</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 } as any}>
            <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "sans-serif" } as any}>👤 {selectedTruck.driver}</div>
            <div style={{ fontSize: 12, color: STATUS_COLOR[selectedTruck.status], fontWeight: 700, fontFamily: "sans-serif" } as any}>
              {STATUS_EMOJI[selectedTruck.status]} {selectedTruck.statusLabel}
            </div>
            <div style={{ fontSize: 12, color: "#e2e8f0", fontFamily: "sans-serif" } as any}>📍 {selectedTruck.currentCity}</div>
            {selectedTruck.destinationCity && (
              <div style={{ fontSize: 12, color: "#e2e8f0", fontFamily: "sans-serif" } as any}>
                🎯 → {selectedTruck.destinationCity} ({selectedTruck.milesLeft} mi)
              </div>
            )}
            {selectedTruck.currentLoad && (
              <div style={{ fontSize: 12, color: "#4ade80", fontWeight: 700, fontFamily: "sans-serif" } as any}>
                📦 {selectedTruck.currentLoad.commodity} · ${selectedTruck.currentLoad.agreedRate?.toLocaleString()}
              </div>
            )}
            <div style={{ fontSize: 12, color: selectedTruck.hoursLeft < 4 ? "#f87171" : "#94a3b8", fontFamily: "sans-serif" } as any}>
              ⏰ HOS: {selectedTruck.hoursLeft}h
            </div>
          </div>
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
          <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "sans-serif", marginBottom: 6 } as any}>
            🚛 Траков: {selectedState.trucks.length}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "sans-serif" } as any}>
            📋 Грузов из штата: {selectedState.loads.length}
          </div>
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
  container: { flex: 1, backgroundColor: Colors.bg },
  text: { color: Colors.textMuted, fontSize: 16 },
});

