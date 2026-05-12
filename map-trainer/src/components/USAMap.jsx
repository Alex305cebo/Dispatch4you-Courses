import { useRef, useState, useCallback } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { STATES } from "../data/states";
import { TZ_COLORS, REGION_COLORS } from "../data/quizConfig";

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
  const maxTx = (w * (zoom - 1)) / 2;
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

    // Вопросный штат — жёлтый
    if (markedState === stateId && !selectedState) return "#f59e0b";

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

    // Цвет по умолчанию — с учётом ранее отвеченных
    if (answeredStates[stateId] === "correct") return "rgba(34,197,94,0.25)";
    if (answeredStates[stateId] === "wrong") return "rgba(239,68,68,0.2)";
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

  const transform = `translate(${translate[0]}px, ${translate[1]}px) scale(${zoom})`;
  const isDragging = mouseRef.current.isDragging;

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%", height: "100%", position: "relative",
        userSelect: "none", overflow: "hidden",
        cursor: isDragging ? "grabbing" : "grab",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMoveDesktop}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div style={{
        width: "100%", height: "100%",
        transform,
        transformOrigin: "center center",
        transition: zoom === 1 ? "transform 0.3s ease" : "none",
        willChange: "transform",
      }}>
        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{ scale: 900 }}
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const stateId = FIPS_TO_STATE[geo.id];
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => stateId && handleStateClick(stateId)}
                    onMouseMove={(e) => handleMouseMove(e, stateId)}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      default: {
                        fill: getStateColor(geo.id),
                        stroke: "#0f172a",
                        strokeWidth: 0.5,
                        outline: "none",
                      },
                      hover: {
                        fill: selectedState
                          ? getStateColor(geo.id)
                          : levelColor,
                        stroke: "#0f172a",
                        strokeWidth: 0.8,
                        outline: "none",
                        cursor: "pointer",
                      },
                      pressed: { fill: "#0284c7", outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      {/* Tooltip при наведении */}
      {false && tooltipData && tooltip && (
        <div style={{ display: "none" }} />
      )}

      {/* Кнопки зума: + / - / сброс */}
      <div style={{
        position: "absolute", bottom: "10px", right: "10px",
        display: "flex", flexDirection: "column", gap: "4px",
        zIndex: 10,
      }}>
        <button
          onClick={() => applyZoom(zoom * 1.4, translate)}
          style={{
            width: "32px", height: "32px",
            background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)",
            borderRadius: "8px", color: "#06b6d4", fontSize: "16px", fontWeight: 700,
            cursor: "pointer", touchAction: "manipulation",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(4px)",
          }}
        >
          +
        </button>
        <button
          onClick={() => applyZoom(zoom * 0.7, translate)}
          style={{
            width: "32px", height: "32px",
            background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)",
            borderRadius: "8px", color: "#06b6d4", fontSize: "16px", fontWeight: 700,
            cursor: "pointer", touchAction: "manipulation",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(4px)",
          }}
        >
          −
        </button>
        {zoom > 1.05 && (
          <button
            onClick={handleReset}
            style={{
              width: "32px", height: "32px",
              background: "rgba(6,182,212,0.15)", border: "1px solid rgba(6,182,212,0.3)",
              borderRadius: "8px", color: "#06b6d4", fontSize: "12px", fontWeight: 700,
              cursor: "pointer", touchAction: "manipulation",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(4px)",
            }}
          >
            ↺
          </button>
        )}
      </div>
    </div>
  );
}
