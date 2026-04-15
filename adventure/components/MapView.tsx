import { useEffect, useRef } from "react";
import { View, StyleSheet, Platform, Text } from "react-native";
import { useGameStore } from "../store/gameStore";
import { CITIES } from "../constants/config";
import { Colors } from "../constants/colors";

const STATUS_COLOR: Record<string, string> = {
  idle: "#94a3b8", driving: "#38bdf8", loaded: "#4ade80",
  at_pickup: "#fbbf24", at_delivery: "#c084fc",
  breakdown: "#f87171", waiting: "#fb923c",
};

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
  const rootRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const { trucks } = useGameStore();
  const trucksRef = useRef(trucks);
  trucksRef.current = trucks;

  useEffect(() => {
    if (!divRef.current) return;
    let root: any, chart: any, series: any, bubbleSeries: any;

    async function init() {
      const am5 = await import("@amcharts/amcharts5");
      const am5map = await import("@amcharts/amcharts5/map");
      const am5geodata = await import("@amcharts/amcharts5-geodata/usaLow");
      const am5themes = await import("@amcharts/amcharts5/themes/Animated");

      root = am5.Root.new(divRef.current);
      root.setThemes([am5themes.default.new(root)]);
      rootRef.current = root;

      chart = root.container.children.push(
        am5map.MapChart.new(root, {
          panX: "rotateX",
          panY: "translateY",
          projection: am5map.geoAlbersUsa(),
          homeZoomLevel: 1,
        })
      );

      // Тёмный фон
      chart.set("background", am5.Rectangle.new(root, {
        fill: am5.color(0x0a1628),
        fillOpacity: 1,
      }));

      // Полигоны штатов
      series = chart.series.push(
        am5map.MapPolygonSeries.new(root, {
          geoJSON: am5geodata.default,
        })
      );
      series.mapPolygons.template.setAll({
        fill: am5.color(0x1a3a2a),
        stroke: am5.color(0x2d6a4f),
        strokeWidth: 0.8,
        fillOpacity: 0.9,
        tooltipText: "{name}",
      });
      series.mapPolygons.template.states.create("hover", {
        fill: am5.color(0x2d6a4f),
      });
      seriesRef.current = series;

      // Серия точек для траков
      bubbleSeries = chart.series.push(
        am5map.MapPointSeries.new(root, {
          latitudeField: "lat",
          longitudeField: "lng",
        })
      );

      bubbleSeries.bullets.push(function (_root: any, _series: any, dataItem: any) {
        const d = dataItem.dataContext as any;
        const container = am5.Container.new(root, {});

        // Пульс для активных
        if (d.active) {
          container.children.push(am5.Circle.new(root, {
            radius: 14,
            fill: am5.color(d.color),
            fillOpacity: 0.2,
          }));
        }

        // Основной круг
        container.children.push(am5.Circle.new(root, {
          radius: 8,
          fill: am5.color(d.color),
          stroke: am5.color(0xffffff),
          strokeWidth: 1.5,
          tooltipText: `{name}\n{driver}\n{status}`,
        }));

        // Буква T
        container.children.push(am5.Label.new(root, {
          text: d.breakdown ? "!" : "T",
          fill: am5.color(0xffffff),
          fontSize: 8,
          fontWeight: "700",
          centerX: am5.percent(50),
          centerY: am5.percent(50),
        }));

        return am5.Bullet.new(root, { sprite: container });
      });

      // Линии маршрутов
      const lineSeries = chart.series.push(
        am5map.MapLineSeries.new(root, {})
      );
      lineSeries.mapLines.template.setAll({
        strokeOpacity: 0.5,
        strokeWidth: 1.5,
        strokeDasharray: [5, 4],
      });

      function updateTrucks() {
        const ts = trucksRef.current;

        // Обновляем точки
        const pointData = ts.map((t) => ({
          lat: t.position[1],
          lng: t.position[0],
          name: t.name,
          driver: t.driver,
          status: t.status,
          color: parseInt((STATUS_COLOR[t.status] || "#94a3b8").replace("#", ""), 16),
          active: t.status === "loaded" || t.status === "driving",
          breakdown: t.status === "breakdown",
        }));
        bubbleSeries.data.setAll(pointData);

        // Обновляем линии маршрутов
        const lineData = ts
          .filter((t) => t.destinationCity && CITIES[t.destinationCity])
          .map((t) => {
            const dest = CITIES[t.destinationCity!];
            const color = parseInt((STATUS_COLOR[t.status] || "#94a3b8").replace("#", ""), 16);
            return {
              geometry: {
                type: "LineString",
                coordinates: [
                  [t.position[0], t.position[1]],
                  [dest[0], dest[1]],
                ],
              },
              stroke: am5.color(color),
            };
          });
        lineSeries.data.setAll(lineData);
        lineSeries.mapLines.each((line: any, i: number) => {
          if (lineData[i]) line.set("stroke", am5.color(lineData[i].stroke));
        });
      }

      updateTrucks();

      // Обновляем каждую секунду
      const interval = setInterval(updateTrucks, 1000);

      return () => {
        clearInterval(interval);
        root.dispose();
      };
    }

    const cleanup = init();
    return () => { cleanup.then((fn) => fn && fn()); };
  }, []);

  return (
    <View style={styles.container}>
      <div ref={divRef} style={{ width: "100%", height: "100%" } as any} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  text: { color: Colors.textMuted, fontSize: 16 },
});
