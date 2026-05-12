import { useState, useCallback } from "react";
import USAMap from "./USAMap";
import { STATES } from "../data/states";
import { STATE_INFO } from "../data/stateInfo";
import { getPronunciation } from "../data/pronunciations";

export default function StateReference({ onBack }) {
  const [selectedState, setSelectedState] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleStateClick = useCallback((stateId) => {
    const state = STATES.find(s => s.id === stateId);
    if (state) setSelectedState(state);
  }, []);

  const handleSpeak = useCallback((text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.75;
    utterance.pitch = 0.95;
    const voices = window.speechSynthesis.getVoices();
    const preferred = ["Google US English", "Microsoft Aria", "Microsoft Jenny", "Samantha"];
    let bestVoice = null;
    for (const name of preferred) {
      bestVoice = voices.find(v => v.name.includes(name) && v.lang.startsWith("en"));
      if (bestVoice) break;
    }
    if (!bestVoice) bestVoice = voices.find(v => v.lang === "en-US");
    if (bestVoice) utterance.voice = bestVoice;
    window.speechSynthesis.speak(utterance);
  }, []);

  const filteredStates = searchQuery
    ? STATES.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.capital.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : STATES;

  return (
    <div style={{
      height: "100dvh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      background: "linear-gradient(160deg,#060d1a 0%,#0f172a 40%,#1a1040 100%)",
      overflow: "hidden",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "680px",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        padding: "8px 10px",
      }}>
        {/* Шапка */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: "6px", flexShrink: 0,
        }}>
          <button
            onClick={onBack}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#94a3b8", fontSize: "13px",
              padding: "7px 14px", cursor: "pointer",
              touchAction: "manipulation",
            }}
          >
            ← Уровни
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "18px" }}>📖</span>
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#f5e6c8" }}>Справочник штатов</span>
          </div>
          <div style={{ width: "80px" }} />
        </div>

        {/* Карта */}
        <div style={{
          flex: "0 0 auto",
          height: "38dvh",
          minHeight: "200px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(212,168,83,0.2)",
          borderRadius: "12px",
          overflow: "hidden",
          marginBottom: "8px",
        }}>
          <USAMap
            highlightedState={selectedState?.id || null}
            markedState={null}
            selectedState={null}
            onStateClick={handleStateClick}
            mode="find-state"
            levelColor="#d4a853"
            answeredStates={{}}
          />
        </div>

        {/* Поиск */}
        <div style={{ flexShrink: 0, marginBottom: "6px" }}>
          <input
            type="text"
            placeholder="🔍 Поиск штата..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(212,168,83,0.2)",
              borderRadius: "10px",
              color: "#e2e8f0",
              fontSize: "14px",
              outline: "none",
            }}
          />
        </div>

        {/* Список штатов */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "6px",
          alignContent: "start",
          paddingBottom: "20px",
        }}>
          {filteredStates.map(state => {
            const info = STATE_INFO[state.id];
            return (
              <button
                key={state.id}
                onClick={() => setSelectedState(state)}
                style={{
                  padding: "10px 12px",
                  background: state.freightHub
                    ? "rgba(212,168,83,0.08)"
                    : "rgba(255,255,255,0.04)",
                  border: state.freightHub
                    ? "1px solid rgba(212,168,83,0.25)"
                    : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  cursor: "pointer",
                  textAlign: "left",
                  touchAction: "manipulation",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#e2e8f0" }}>
                    {state.name}
                  </span>
                  <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                    {state.id}
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: "#8b7355", marginTop: "2px" }}>
                  {state.region} · {state.tz}
                  {state.freightHub && <span style={{ color: "#d4a853" }}> · 🚛</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Popup штата */}
      {selectedState && (
        <StatePopup
          state={selectedState}
          info={STATE_INFO[selectedState.id]}
          onClose={() => setSelectedState(null)}
          onSpeak={handleSpeak}
        />
      )}
    </div>
  );
}

// ── Popup с полной информацией о штате ──
function StatePopup({ state, info, onClose, onSpeak }) {
  const pron = getPronunciation(state.name);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(6px)",
        padding: "16px",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(160deg, #0f172a 0%, #1a1040 100%)",
          border: "2px solid rgba(212,168,83,0.35)",
          borderRadius: "20px",
          padding: "20px",
          maxWidth: "460px",
          width: "100%",
          maxHeight: "85dvh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(212,168,83,0.1)",
          animation: "slideUp 0.3s ease",
        }}
      >
        {/* Заголовок */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#f5e6c8", margin: "0 0 2px 0" }}>
              {state.name}
            </h2>
            <p style={{ fontSize: "12px", color: "#8b7355", margin: 0 }}>
              {state.id} · {state.capital} · {state.region} · {state.tz} Time
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#94a3b8", fontSize: "16px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >×</button>
        </div>

        {/* Произношение */}
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          background: "rgba(34,197,94,0.08)",
          border: "1px solid rgba(34,197,94,0.25)",
          borderRadius: "12px",
          padding: "10px 14px",
          marginBottom: "12px",
        }}>
          <button
            onClick={() => onSpeak(state.name)}
            style={{
              width: "36px", height: "36px", borderRadius: "50%",
              background: "rgba(34,197,94,0.2)",
              border: "2px solid rgba(34,197,94,0.5)",
              color: "#22c55e", fontSize: "16px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, touchAction: "manipulation",
            }}
          >🔊</button>
          <div>
            {pron ? (
              <div style={{ display: "flex", gap: "16px" }}>
                <div>
                  <p style={{ fontSize: "9px", color: "#64748b", margin: "0 0 1px 0", textTransform: "uppercase" }}>English</p>
                  <p style={{ fontSize: "14px", color: "#e2e8f0", margin: 0, fontFamily: "monospace" }}>[{pron.en}]</p>
                </div>
                <div>
                  <p style={{ fontSize: "9px", color: "#64748b", margin: "0 0 1px 0", textTransform: "uppercase" }}>Кириллица</p>
                  <p style={{ fontSize: "14px", color: "#e2e8f0", margin: 0, fontFamily: "monospace" }}>[{pron.ru}]</p>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: "14px", color: "#e2e8f0", margin: 0 }}>{state.name}</p>
            )}
          </div>
        </div>

        {/* Freight Hubs */}
        {info?.hubs && (
          <InfoSection icon="🏙️" title="Грузовые хабы" color="#06b6d4">
            <p style={{ fontSize: "13px", color: "#e2e8f0", margin: 0 }}>
              {info.hubs.join(" · ")}
            </p>
          </InfoSection>
        )}

        {/* Типичные грузы */}
        {info?.freight && (
          <InfoSection icon="📦" title="Типичные грузы" color="#f59e0b">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
              {info.freight.map((f, i) => (
                <span key={i} style={{
                  fontSize: "11px", color: "#fcd34d",
                  background: "rgba(245,158,11,0.12)",
                  border: "1px solid rgba(245,158,11,0.25)",
                  borderRadius: "6px", padding: "3px 8px",
                }}>{f}</span>
              ))}
            </div>
          </InfoSection>
        )}

        {/* Produce Season */}
        {info?.produce && (
          <InfoSection icon="🌾" title="Сезон продуктов" color="#22c55e">
            <p style={{ fontSize: "13px", color: "#e2e8f0", margin: 0 }}>{info.produce}</p>
          </InfoSection>
        )}

        {/* Interstates */}
        {info?.interstates && info.interstates.length > 0 && (
          <InfoSection icon="🛣️" title="Основные хайвеи" color="#8b5cf6">
            <p style={{ fontSize: "13px", color: "#e2e8f0", margin: 0 }}>
              {info.interstates.join(" · ")}
            </p>
          </InfoSection>
        )}

        {/* Заметки для диспетчера */}
        {info?.notes && (
          <InfoSection icon="💡" title="Для диспетчера" color="#d4a853">
            <p style={{ fontSize: "13px", color: "#e2e8f0", margin: 0, lineHeight: 1.5 }}>
              {info.notes}
            </p>
          </InfoSection>
        )}

        {/* Соседние штаты */}
        {info?.neighbors && info.neighbors.length > 0 && (
          <InfoSection icon="🗺️" title="Соседние штаты" color="#94a3b8">
            <p style={{ fontSize: "13px", color: "#e2e8f0", margin: 0 }}>
              {info.neighbors.map(id => {
                const s = STATES.find(st => st.id === id);
                return s ? s.name : id;
              }).join(" · ")}
            </p>
          </InfoSection>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

// ── Секция информации ──
function InfoSection({ icon, title, color, children }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: `1px solid ${color}33`,
      borderRadius: "10px",
      padding: "10px 12px",
      marginBottom: "8px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
        <span style={{ fontSize: "14px" }}>{icon}</span>
        <span style={{ fontSize: "12px", fontWeight: 700, color }}>{title}</span>
      </div>
      {children}
    </div>
  );
}
