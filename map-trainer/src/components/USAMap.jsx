import { useRef, useState, useCallback, useEffect } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { STATES } from "../data/states";
import { TZ_COLORS, REGION_COLORS } from "../data/quizConfig";

// Центры штатов (lon, lat) для отображения аббревиатур
const STATE_CENTERS = {
  AL: [-86.8, 32.8], AK: [-153.5, 64.2], AZ: [-111.9, 34.2], AR: [-92.4, 34.8],
  CA: [-119.7, 37.3], CO: [-105.5, 39.0], CT: [-72.7, 41.6], DE: [-75.5, 39.0],
  FL: [-81.7, 28.7], GA: [-83.5, 32.7], HI: [-155.5, 20.0], ID: [-114.7, 44.4],
  IL: [-89.4, 40.0], IN: [-86.3, 39.8], IA: [-93.5, 42.0], KS: [-98.3, 38.5],
  KY: [-85.3, 37.8], LA: [-92.0, 31.0], ME: [-69.2, 45.4], MD: [-76.6, 39.0],
  MA: [-71.8, 42.3], MI: [-84.7, 44.3], MN: [-94.3, 46.3], MS: [-89.7, 32.7],
  MO: [-92.5, 38.4], MT: [-109.6, 47.0], NE: [-99.8, 41.5], NV: [-116.6, 39.3],
  NH: [-71.6, 43.7], NJ: [-74.7, 40.1], NM: [-106.0, 34.5], NY: [-75.5, 43.0],
  NC: [-79.4, 35.5], ND: [-100.5, 47.5], OH: [-82.8, 40.4], OK: [-97.5, 35.5],
  OR: [-120.5, 44.0], PA: [-77.6, 41.0], RI: [-71.5, 41.7], SC: [-80.9, 33.9],
  SD: [-100.2, 44.4], TN: [-86.3, 35.8], TX: [-99.0, 31.5], UT: [-111.7, 39.3],
  VT: [-72.6, 44.1], VA: [-79.4, 37.5], WA: [-120.5, 47.4], WV: [-80.6, 38.9],
  WI: [-89.8, 44.6], WY: [-107.5, 43.0],
};

// Маппинг FIPS-кодов (числовые ID из us-atlas GeoJSON) → двухбуквенные ID штатов
const FIPS_TO_STATE = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA",
  "08": "CO", "09": "CT", "10": "DE", "12": "FL", "13": "GA",
  "15": "HI", "16": "ID", "17": "IL", "18": "IN", "19": "IA",
  "20": "KS", "21": "KY", "22": "LA", "23": "ME", "24": "MD",
  "25": "MA", "26": "MI", "27": "MN", "28": "MS", "29": "MO",
  "30": "MT", "31": "NE", "32": "NV", "33": "NH", "34": "NJ",
  "35": "NM", "36": "NY", "37": "NC", "38": "ND", "39": "OH",
  "40": "OK", "41": "OR", "42": "PA", "44": "RI", "45": "SC",
  "46": "SD", "47": "TN", "48": "TX", "49": "UT", "50": "VT",
  "51": "VA", "53": "WA", "54": "WV", "55": "WI", "56": "WY",
};

// Локальный файл — лежит в public/, после билда доступен по /map-trainer/states-10m.json.
// Не используем CDN чтобы не упираться в CSP главного сайта (connect-src 'self' + whitelist).
const GEO_URL = `${import.meta.env.BASE_URL}states-10m.json`;

const MIN_ZOOM = 1;
const MAX_ZOOM = 2.5;

function clampTranslate(tx, ty, zoom, w, h) {
  // Разрешаем двигать на 30% больше по горизонтали чтобы видеть края карты
  const extraX = w * 0.15;
  const maxTx = (w * (zoom - 1)) / 2 + extraX;
  const maxTy = (h * (zoom - 1)) / 2;
  return [
    Math.max(-maxTx, Math.min(maxTx, tx)),
    Math.max(-maxTy, Math.min(maxTy, ty)),
  ];
}

export default function USAMap({
  highlightedState,
  markedState,
  selectedState,
  onStateClick,
  mode,
  hoveredTz = null,
  hoveredRegion = null,
  correctTz = null,
  correctRegion = null,
  levelColor = "#06b6d4",
  answeredStates = {},
}) {
  const containerRef = useRef(null);
  const [zoom, setZoom]           = useState(1);
  const [translate, setTranslate] = useState([0, 0]);
  const [tilt, setTilt]           = useState({ x: 0, y: 0 });
  const [hoveredGeo, setHoveredGeo] = useState(null);

  const touchRef = useRef({
    lastTap:   0,
    pinchDist: null,
    pinchZoom: null,
    panStart:  null,
    isPanning: false,
  });

  // Состояние mouse-drag для десктопа
  const mouseRef = useRef({
    isDragging: false,
    didMove:    false,   // отличаем drag от клика
    startX:     0,
    startY:     0,
    startTx:    0,
    startTy:    0,
  });

  // Показывать tooltip при наведении в режиме timezone
  const tooltipEnabled = mode === "timezone";

  const getStateData = (stateId) => STATES.find((s) => s.id === stateId);

  const getStateColor = (geoId) => {
    const stateId = FIPS_TO_STATE[geoId];
    if (!stateId) return "#1e293b";
    const data = getStateData(stateId);

    // После ответа в режиме timezone — подсвечиваем весь часовой пояс
    if (selectedState && correctTz) {
      if (data?.tz === correctTz) {
        return TZ_COLORS[correctTz] || "#22c55e";
      }
      return "#0f1f35";
    }

    // После ответа в режиме region/regions-intro — подсвечиваем весь регион
    if (selectedState && correctRegion) {
      if (data?.region === correctRegion) {
        return REGION_COLORS[correctRegion] || "#22c55e";
      }
      return "#0f1f35";
    }

    // После ответа — правильный зелёный, неправильный красный
    if (highlightedState === stateId && selectedState) return "#22c55e";
    if (selectedState === stateId && highlightedState !== stateId) return "#ef4444";

    // Вопросный штат — яркий белый/жёлтый, выделяется от зелёных/красных
    if (markedState === stateId && !selectedState) return "#fef08a";

    // Подсветка пояса при наведении на вариант ответа
    if (hoveredTz) {
      if (data?.tz === hoveredTz) return TZ_COLORS[hoveredTz] || "#06b6d4";
      return "#0f1f35";
    }

    // Подсветка региона при наведении на вариант ответа
    if (hoveredRegion) {
      if (data?.region === hoveredRegion) return REGION_COLORS[hoveredRegion] || "#06b6d4";
      return "#0f1f35";
    }

    // Цвет по умолчанию — с учётом ранее отвеченных (яркие, заметные)
    if (answeredStates[stateId] === "correct") return "#166534";
    if (answeredStates[stateId] === "wrong") return "#7f1d1d";
    // Freight hubs — ярче, обычные — темнее
    if (data?.freightHub) return "#264a73";
    return "#1e3a5f";
  };

  const getSize = () => {
    const el = containerRef.current;
    return el ? [el.clientWidth, el.clientHeight] : [800, 500];
  };

  const applyZoom = useCallback((newZoom, currentTranslate) => {
    const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newZoom));
    const [w, h] = getSize();
    const [tx, ty] = clampTranslate(currentTranslate[0], currentTranslate[1], z, w, h);
    setZoom(z);
    setTranslate([tx, ty]);
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setTranslate([0, 0]);
  }, []);

  // ── TOUCH ──
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchRef.current.pinchDist = Math.hypot(dx, dy);
      touchRef.current.pinchZoom = zoom;
      touchRef.current.isPanning = false;
      e.preventDefault();
    } else if (e.touches.length === 1) {
      const now = Date.now();
      const t = e.touches[0];
      if (now - touchRef.current.lastTap < 280) {
        e.preventDefault();
        zoom > 1.1 ? handleReset() : applyZoom(zoom * 1.8, translate);
        touchRef.current.lastTap = 0;
        return;
      }
      touchRef.current.lastTap = now;
      if (zoom > 1.05) {
        touchRef.current.isPanning = true;
        touchRef.current.panStart = { x: t.clientX, y: t.clientY, tx: translate[0], ty: translate[1] };
      }
    }
  }, [zoom, translate, applyZoom, handleReset]);

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2 && touchRef.current.pinchDist !== null) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.hypot(dx, dy);
      applyZoom(touchRef.current.pinchZoom * (newDist / touchRef.current.pinchDist), translate);
    } else if (e.touches.length === 1 && touchRef.current.isPanning) {
      e.preventDefault();
      const t = e.touches[0];
      const ps = touchRef.current.panStart;
      const [w, h] = getSize();
      const [tx, ty] = clampTranslate(ps.tx + t.clientX - ps.x, ps.ty + t.clientY - ps.y, zoom, w, h);
      setTranslate([tx, ty]);
    }
  }, [zoom, translate, applyZoom]);

  const handleTouchEnd = useCallback((e) => {
    if (e.touches.length < 2) { touchRef.current.pinchDist = null; touchRef.current.pinchZoom = null; }
    if (e.touches.length === 0) touchRef.current.isPanning = false;
  }, []);

  // ── WHEEL ──
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    applyZoom(zoom * (e.deltaY > 0 ? 0.85 : 1.18), translate);
  }, [zoom, translate, applyZoom]);

  // ── MOUSE DRAG (десктоп) ──
  const handleMouseDown = useCallback((e) => {
    // Только левая кнопка
    if (e.button !== 0) return;
    mouseRef.current.isDragging = true;
    mouseRef.current.didMove    = false;
    mouseRef.current.startX     = e.clientX;
    mouseRef.current.startY     = e.clientY;
    mouseRef.current.startTx    = translate[0];
    mouseRef.current.startTy    = translate[1];
    e.preventDefault();
  }, [translate]);

  const handleMouseMoveDesktop = useCallback((e) => {
    if (!mouseRef.current.isDragging) return;
    const dx = e.clientX - mouseRef.current.startX;
    const dy = e.clientY - mouseRef.current.startY;
    // Считаем движением если сдвинулись больше 4px
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      mouseRef.current.didMove = true;
    }
    if (!mouseRef.current.didMove) return;
    const [w, h] = getSize();
    const [tx, ty] = clampTranslate(
      mouseRef.current.startTx + dx,
      mouseRef.current.startTy + dy,
      zoom, w, h
    );
    setTranslate([tx, ty]);
  }, [zoom]);

  const handleMouseUp = useCallback(() => {
    mouseRef.current.isDragging = false;
  }, []);

  // ── CLICK ──
  const handleStateClick = useCallback((stateId) => {
    // Не регистрируем клик если это был drag
    if (mouseRef.current.didMove) return;
    if (touchRef.current.isPanning) return;
    onStateClick && onStateClick(stateId);
  }, [onStateClick]);

  // ── HOVER tooltip ──
  const handleMouseMove = useCallback(() => {}, []);
  const handleMouseLeave = useCallback(() => {}, []);

  // ── 3D TILT (десктоп) ──
  const handleTiltMove = useCallback((e) => {
    if (zoom > 1.05) { setTilt({ x: 0, y: 0 }); return; }
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -4, y: x * 4 }); // subtle 4deg max
  }, [zoom]);

  const handleTiltLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  const transform = `translate(${translate[0]}px, ${translate[1]}px) scale(${zoom})`;
  const tiltTransform = `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`;
  const isDragging = mouseRef.current.isDragging;

  return (
    <div
      ref={containerRef}
      onMouseMove={(e) => { handleMouseMoveDesktop(e); handleTiltMove(e); }}
      style={{
        width: "100%", height: "100%", position: "relative",
        userSelect: "none", overflow: "hidden",
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none",
        transform: tiltTransform,
        transition: "transform 0.15s ease-out",
        willChange: "transform",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={(e) => { handleMouseUp(); handleTiltLeave(); }}
    >
      {/* SVG фильтр для glow */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="state-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <div style={{
        width: "100%", height: "100%",
        transform,
        transformOrigin: "center center",
        transition: zoom === 1 ? "transform 0.3s ease" : "none",
        willChange: "transform",
      }}>
        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{ scale: 1120 }}
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const stateId = FIPS_TO_STATE[geo.id];
                const stateData = stateId ? getStateData(stateId) : null;
                const isMarked = markedState === stateId;
                const isHighlighted = highlightedState === stateId;
                const isFreightHub = stateData?.freightHub;
                const baseColor = getStateColor(geo.id);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => stateId && handleStateClick(stateId)}
                    onMouseEnter={() => setHoveredGeo(stateId)}
                    onMouseLeave={() => setHoveredGeo(null)}
                    style={{
                      default: {
                        fill: baseColor,
                        stroke: isMarked ? levelColor : isFreightHub ? "#1a3a5f" : "#0a1628",
                        strokeWidth: isMarked ? 1.5 : isFreightHub ? 0.7 : 0.4,
                        outline: "none",
                        filter: isMarked ? "url(#state-glow)" : "none",
                        opacity: isMarked ? 1 : isFreightHub ? 1 : 0.92,
                        transition: "fill 0.2s ease, stroke 0.2s ease, opacity 0.2s ease",
                      },
                      hover: {
                        fill: selectedState
                          ? baseColor
                          : levelColor,
                        stroke: levelColor,
                        strokeWidth: 1.2,
                        outline: "none",
                        cursor: "pointer",
                        filter: "brightness(1.2)",
                        transition: "fill 0.15s ease",
                      },
                      pressed: { fill: "#0284c7", outline: "none", strokeWidth: 1.5 },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {/* Аббревиатуры на отвеченных штатах */}
          {Object.entries(answeredStates).map(([stateId, result]) => {
            const coords = STATE_CENTERS[stateId];
            if (!coords) return null;
            return (
              <Marker key={`label-${stateId}`} coordinates={coords}>
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontSize: "11px",
                    fontWeight: 900,
                    fill: "#fff",
                    pointerEvents: "none",
                    textShadow: "0 0 4px rgba(0,0,0,1), 0 0 2px rgba(0,0,0,0.8)",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    letterSpacing: "0.5px",
                  }}
                >
                  {stateId}
                </text>
              </Marker>
            );
          })}
        </ComposableMap>
      </div>

      {/* Tooltip при наведении */}
      {false && tooltipData && tooltip && (
        <div style={{ display: "none" }} />
      )}

      {/* Кнопки зума: + / - / сброс */}
      <div style={{
        position: "absolute", bottom: "6px", right: "4px",
        display: "flex", flexDirection: "column", gap: "3px",
        zIndex: 10,
      }}>
        <button
          onClick={() => applyZoom(zoom * 1.4, translate)}
          style={{
            width: "26px", height: "26px",
            background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)",
            borderRadius: "6px", color: "rgba(6,182,212,0.6)", fontSize: "14px", fontWeight: 700,
            cursor: "pointer", touchAction: "manipulation",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          +
        </button>
        <button
          onClick={() => applyZoom(zoom * 0.7, translate)}
          style={{
            width: "26px", height: "26px",
            background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)",
            borderRadius: "6px", color: "rgba(6,182,212,0.6)", fontSize: "14px", fontWeight: 700,
            cursor: "pointer", touchAction: "manipulation",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          −
        </button>
        {zoom > 1.05 && (
          <button
            onClick={handleReset}
            style={{
              width: "26px", height: "26px",
              background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)",
              borderRadius: "6px", color: "rgba(6,182,212,0.6)", fontSize: "11px", fontWeight: 700,
              cursor: "pointer", touchAction: "manipulation",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ↺
          </button>
        )}
      </div>
    </div>
  );
}
