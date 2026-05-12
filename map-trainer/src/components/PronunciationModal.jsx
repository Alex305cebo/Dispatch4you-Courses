import { useEffect, useState } from "react";

export default function PronunciationModal({ stateName, pronunciation, isLocked = false, onClose }) {
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  // Загружаем голоса при монтировании
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => setVoicesLoaded(true);
      if (window.speechSynthesis.getVoices().length > 0) {
        setVoicesLoaded(true);
      } else {
        window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
        return () => window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      }
    }
  }, []);
  // Закрытие по ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Озвучка через Web Speech API — выбираем лучший голос
  const handleSpeak = () => {
    if (isLocked) return;
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(stateName);
      utterance.lang = 'en-US';
      utterance.rate = 0.75;   // Медленнее — профессиональнее
      utterance.pitch = 0.95;  // Чуть ниже — мягче, не резкий
      utterance.volume = 0.85; // Не на максимум — приятнее
      
      // Выбираем лучший голос из доступных
      const voices = window.speechSynthesis.getVoices();
      // Приоритет: Google US > Microsoft > Apple Samantha > любой en-US
      const preferred = [
        "Google US English",
        "Microsoft Aria Online (Natural)",
        "Microsoft Jenny Online (Natural)",
        "Samantha",
        "Karen",
        "Daniel",
      ];
      
      let bestVoice = null;
      for (const name of preferred) {
        bestVoice = voices.find(v => v.name.includes(name) && v.lang.startsWith("en"));
        if (bestVoice) break;
      }
      // Fallback: любой en-US голос
      if (!bestVoice) {
        bestVoice = voices.find(v => v.lang === "en-US") || voices.find(v => v.lang.startsWith("en"));
      }
      if (bestVoice) utterance.voice = bestVoice;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(135deg,rgba(15,23,42,0.98),rgba(26,16,64,0.98))",
          border: "2px solid rgba(6,182,212,0.3)",
          borderRadius: "20px",
          padding: "24px",
          maxWidth: "400px",
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          animation: "slideUp 0.3s ease",
        }}
      >
        {/* Заголовок */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "24px" }}>🔊</span>
            <h2 style={{
              fontSize: "18px",
              fontWeight: 800,
              color: "#fff",
              margin: 0,
            }}>
              Произношение
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#94a3b8",
              fontSize: "18px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.15)";
              e.currentTarget.style.borderColor = "#ef4444";
              e.currentTarget.style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "#94a3b8";
            }}
          >
            ×
          </button>
        </div>

        {/* Название */}
        <div style={{
          background: isLocked ? "rgba(100,116,139,0.1)" : "rgba(6,182,212,0.1)",
          border: isLocked ? "1px solid rgba(100,116,139,0.3)" : "1px solid rgba(6,182,212,0.3)",
          borderRadius: "14px",
          padding: "16px",
          marginBottom: "16px",
          textAlign: "center",
          position: "relative",
        }}>
          <p style={{
            fontSize: "28px",
            fontWeight: 900,
            color: isLocked ? "#64748b" : "#06b6d4",
            margin: "0 0 12px 0",
            letterSpacing: "0.5px",
          }}>
            {stateName}
          </p>
          
          {isLocked ? (
            // Заблокированное состояние
            <div style={{
              padding: "20px",
              background: "rgba(100,116,139,0.1)",
              border: "1px dashed rgba(100,116,139,0.3)",
              borderRadius: "10px",
            }}>
              <div style={{
                fontSize: "48px",
                marginBottom: "12px",
              }}>
                🔒
              </div>
              <p style={{
                fontSize: "14px",
                color: "#94a3b8",
                margin: "0 0 6px 0",
                fontWeight: 600,
              }}>
                Транскрипция заблокирована
              </p>
              <p style={{
                fontSize: "12px",
                color: "#64748b",
                margin: 0,
                lineHeight: 1.4,
              }}>
                Выберите ответ, чтобы увидеть правильное произношение
              </p>
            </div>
          ) : (
            <>
              {/* Английская транскрипция */}
              <div style={{ marginBottom: "8px" }}>
                <p style={{
                  fontSize: "11px",
                  color: "#64748b",
                  margin: "0 0 3px 0",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                  English
                </p>
                <p style={{
                  fontSize: "18px",
                  color: "#e2e8f0",
                  margin: 0,
                  fontFamily: "monospace",
                  letterSpacing: "1px",
                }}>
                  [{pronunciation.en}]
                </p>
              </div>

              {/* Русская транскрипция */}
              <div>
                <p style={{
                  fontSize: "11px",
                  color: "#64748b",
                  margin: "0 0 3px 0",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}>
                  Русский
                </p>
                <p style={{
                  fontSize: "18px",
                  color: "#e2e8f0",
                  margin: 0,
                  fontFamily: "monospace",
                  letterSpacing: "1px",
                }}>
                  [{pronunciation.ru}]
                </p>
              </div>
            </>
          )}
        </div>

        {/* Кнопка озвучки */}
        <button
          onClick={handleSpeak}
          disabled={isLocked}
          style={{
            width: "100%",
            padding: "14px",
            background: isLocked 
              ? "rgba(100,116,139,0.2)"
              : "linear-gradient(135deg,#06b6d4,#0284c7)",
            border: "none",
            borderRadius: "12px",
            color: isLocked ? "#64748b" : "#fff",
            fontSize: "15px",
            fontWeight: 700,
            cursor: isLocked ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.2s",
            boxShadow: isLocked ? "none" : "0 4px 12px rgba(6,182,212,0.3)",
            opacity: isLocked ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isLocked) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(6,182,212,0.4)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isLocked) {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(6,182,212,0.3)";
            }
          }}
        >
          <span style={{ fontSize: "20px" }}>{isLocked ? "🔒" : "🔊"}</span>
          {isLocked ? "Озвучка заблокирована" : "Прослушать произношение"}
        </button>

        {/* Подсказка */}
        <p style={{
          fontSize: "11px",
          color: "#64748b",
          textAlign: "center",
          margin: "12px 0 0 0",
        }}>
          Нажмите ESC или кликните вне окна для закрытия
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
