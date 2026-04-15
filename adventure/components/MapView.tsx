import { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Platform, Text } from "react-native";
import * as d3geo from "d3-geo";
import * as topojson from "topojson-client";
import { usStates } from "../data/usStates";
import { useGameStore } from "../store/gameStore";
import { CITIES } from "../constants/config";
import { Colors } from "../constants/colors";

const STATUS_COLOR: Record<string, string> = {
  idle: "#94a3b8",
  driving: "#38bdf8",
  loaded: "#4ade80",
  at_pickup: "#fbbf24",
  at_delivery: "#c084fc",
  breakdown: "#f87171",
  waiting: "#fb923c",
};

const STATUS_LABEL: Record<string, string> = {
  idle: "Свободен",
  driving: "Едет к погрузке",
  loaded: "Везёт груз",
  at_pickup: "На погрузке",
  at_delivery: "На разгрузке",
  breakdown: "Поломка",
  waiting: "Detention",
};

// Satellite palette — dark greens
const STATE_COLORS = [
  "#1a3a2a","#1e4030","#163325","#1f4535","#17382a",
  "#1b3d2f","#204838","#163020","#1c3f2d","#193628",
  "#1e4232","#152e22","#1a3d2c","#1d4133","#162f23",
];

const PROJ = d3geo.geoAlbersUsa().scale(900).translate([480, 300]);
const PATH_GEN = d3geo.geoPath().projection(PROJ);
const GEO_STATES = topojson.feature(usStates, usStates.objects.states);

export default function MapView() {
  if (Platform.OS === "web") return <MapCanvas />;
  return (
    <View style={[styles.container, { alignItems: "center", justifyContent: "center" }]}>
      <Text style={{ color: Colors.textMuted }}>Карта доступна в веб-версии</Text>
    </View>
  );
}

interface TooltipState {
  x: number;
  y: number;
  lines: string[];
}

function MapCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { trucks } = useGameStore();
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const animRef = useRef(0);
  const pulseRef = useRef(0);
  const trucksRef = useRef(trucks);
  trucksRef.current = trucks;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    function draw(pulse: number) {
      const W = wrap!.clientWidth || 600;
      const H = wrap!.clientHeight || 400;
      if (canvas!.width !== W || canvas!.height !== H) {
        canvas!.width = W;
        canvas!.height = H;
      }
      const ctx = canvas!.getContext("2d")!;
      ctx.clearRect(0, 0, W, H);
      const sc = Math.min(W / 960, H / 600);
      const offX = (W - 960 * sc) / 2;
      const offY = (H - 600 * sc) / 2;
      ctx.save();
      ctx.translate(offX, offY);
      ctx.scale(sc, sc);

      // Фон — тёмно-синий как ночное небо/океан
      ctx.fillStyle = "#0a1628";
      ctx.fillRect(-9999, -9999, 99999, 99999);

      // Штаты — satellite зелёный
      (GEO_STATES as any).features.forEach((feat: any, i: number) => {
        const p = new Path2D(PATH_GEN(feat) || "");
        ctx.fillStyle = STATE_COLORS[i % STATE_COLORS.length];
        ctx.globalAlpha = 0.9;
        ctx.shadowColor = "rgba(0,0,0,0.4)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 1;
        ctx.fill(p);
        ctx.globalAlpha = 1;
        ctx.shadowColor = "transparent";
        ctx.strokeStyle = "#2d6a4f";
        ctx.lineWidth = 0.8 / z;
        ctx.stroke(p);
      });

      const ts = trucksRef.current;

      // Маршруты
      ts.forEach((truck) => {
        if (!truck.destinationCity) return;
        const to = CITIES[truck.destinationCity];
        if (!to) return;
        const a = PROJ(truck.position);
        const b = PROJ(to);
        if (!a || !b) return;
        const color = STATUS_COLOR[truck.status] || "#94a3b8";
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.quadraticCurveTo((a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 30, b[0], b[1]);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5 / z;
        ctx.globalAlpha = 0.55;
        ctx.setLineDash([5 / z, 4 / z]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      });

      // Города
      Object.entries(CITIES).forEach(([name, coords]) => {
        const pt = PROJ(coords);
        if (!pt) return;
        const major = [
          "Chicago","Los Angeles","New York","Houston","Dallas",
          "Atlanta","Seattle","Miami","Denver","Phoenix","Memphis",
        ].includes(name);
        ctx.beginPath();
        ctx.arc(pt[0], pt[1], major ? 3 : 1.5, 0, Math.PI * 2);
        ctx.fillStyle = major ? "#fff" : "rgba(255,255,255,0.3)";
        ctx.fill();
        if (major) {
          ctx.strokeStyle = "#0a1628";
          ctx.lineWidth = 0.5;
          ctx.stroke();
          ctx.font = "bold 7px sans-serif";
          ctx.fillStyle = "#d1fae5";
          ctx.textAlign = "center";
          ctx.fillText(name, pt[0], pt[1] - 6);
        }
      });

      // Траки
      ts.forEach((truck) => {
        const pt = PROJ(truck.position);
        if (!pt) return;
        const color = STATUS_COLOR[truck.status] || "#94a3b8";
        const active = truck.status === "loaded" || truck.status === "driving";
        if (active) {
          const r = 8 + Math.sin(pulse * 0.08) * 5;
          ctx.beginPath();
          ctx.arc(pt[0], pt[1], r, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.15 + Math.abs(Math.sin(pulse * 0.08)) * 0.1;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        ctx.beginPath();
        ctx.arc(pt[0] + 1, pt[1] + 2, 7, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pt[0], pt[1], 7, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5 / z;
        ctx.stroke();
        ctx.font = "bold 7px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#fff";
        ctx.fillText(truck.status === "breakdown" ? "!" : "T", pt[0], pt[1]);
        ctx.textBaseline = "alphabetic";
      });

      ctx.restore();
    }

    function loop() {
      pulseRef.current += 1;
      draw(pulseRef.current);
      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const W = rect.width, H = rect.height;
    const sc = Math.min(W / 960, H / 600);
    const mapX = (mx - (W - 960 * sc) / 2) / sc;
    const mapY = (my - (H - 600 * sc) / 2) / sc;
    let found: any = null, minD = 14;
    trucksRef.current.forEach((t) => {
      const pt = PROJ(t.position);
      if (!pt) return;
      const d = Math.hypot(pt[0] - mapX, pt[1] - mapY);
      if (d < minD) { minD = d; found = t; }
    });
    if (found) {
      setTooltip({
        x: mx + 12,
        y: my - 40,
        lines: [
          found.name,
          found.driver,
          STATUS_LABEL[found.status] || found.status,
          found.destinationCity ? "-> " + found.destinationCity : "",
        ].filter(Boolean),
      });
    } else {
      setTooltip(null);
    }
  }

  return (
    <div ref={wrapRef} style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      />
      {tooltip && (
        <div style={{
          position: "absolute", left: tooltip.x, top: tooltip.y,
          background: "rgba(10,22,40,0.96)", border: "1px solid rgba(45,106,79,0.6)",
          borderRadius: 10, padding: "8px 12px", pointerEvents: "none", zIndex: 200,
          boxShadow: "0 4px 20px rgba(0,0,0,0.5)", minWidth: 140,
        }}>
          {tooltip.lines.map((l: string, i: number) => (
            <div key={i} style={{
              fontSize: i === 0 ? 13 : 11, fontWeight: i === 0 ? 800 : 400,
              color: i === 0 ? "#d1fae5" : "#94a3b8", lineHeight: "1.5", fontFamily: "sans-serif",
            }}>{l}</div>
          ))}
        </div>
      )}
      <div style={{
        position: "absolute", bottom: 12, left: 12,
        background: "rgba(10,22,40,0.88)", borderRadius: 12,
        border: "1px solid rgba(45,106,79,0.3)", padding: "8px 12px",
        display: "flex", flexDirection: "column", gap: 5,
      }}>
        {Object.entries(STATUS_LABEL).map(([s, l]) => {
          const n = trucksRef.current.filter((t) => t.status === s).length;
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: STATUS_COLOR[s], flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, fontFamily: "sans-serif" }}>{l}</span>
              {n > 0 && (
                <span style={{ fontSize: 10, fontWeight: 800, color: STATUS_COLOR[s], marginLeft: "auto", paddingLeft: 8, fontFamily: "sans-serif" }}>{n}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
});
