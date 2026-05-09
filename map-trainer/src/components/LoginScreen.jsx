// ═══════════════════════════════════════════════════════════
//  LoginScreen.jsx — вход в USA Map Trainer
//  build: 2026-05-09 (simple + reliable — mobile always does redirect)
// ═══════════════════════════════════════════════════════════
import { useState } from "react";

const APP_URL            = "https://dispatch4you.com/map-trainer/";
const FALLBACK_LOGIN_URL = "https://dispatch4you.com/login.html";

function detectPlatform() {
  if (typeof navigator === "undefined") return { isIOS: false, isAndroid: false };
  const ua = (navigator.userAgent || navigator.vendor || "").toLowerCase();
  return {
    isIOS:     /iphone|ipad|ipod/.test(ua),
    isAndroid: /android/.test(ua),
  };
}

export default function LoginScreen({ onSignIn, loading }) {
  const [busy,   setBusy]   = useState(false);
  const [error,  setError]  = useState(null);
  const [copied, setCopied] = useState(false);
  const platform = detectPlatform();
  const isMobile = platform.isIOS || platform.isAndroid;

  const handleGoogle = async () => {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      if (typeof onSignIn === "function") {
        await onSignIn();
        // На мобильном useAuth.signIn не резолвится сразу — идёт redirect,
        // страница уйдёт на Google и вернётся уже авторизованной.
        // На десктопе popup должен вернуть user и компонент перерисуется.
      } else {
        goToFallback();
      }
    } catch (e) {
      console.error("[LoginScreen] signIn failed:", e);
      setError("Не удалось войти через Google. Попробуйте ещё раз.");
      setBusy(false);
      return;
    }
    // Если через 8 секунд мы всё ещё на этой странице — убираем спиннер,
    // значит redirect не пошёл или popup закрылся без результата.
    setTimeout(() => setBusy(false), 8000);
  };

  const goToFallback = () => {
    try { localStorage.setItem("returnUrl", APP_URL); } catch {}
    window.location.href = FALLBACK_LOGIN_URL;
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(APP_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = APP_URL;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch {}
      document.body.removeChild(ta);
    }
  };

  const disabled = busy || loading;

  return (
    <div style={{
      minHeight: "100dvh",
      background: "linear-gradient(160deg,#060d1a 0%,#0f172a 50%,#1a1040 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 20px",
    }}>
      {/* Логотип */}
      <div style={{ textAlign: "center", marginBottom: "28px" }}>
        <div style={{ fontSize: "56px", marginBottom: "10px" }}>🇺🇸</div>
        <h1 style={{
          fontSize: "26px", fontWeight: 900, color: "#fff",
          margin: "0 0 6px 0", letterSpacing: "-0.5px",
        }}>
          USA Map Trainer
        </h1>
        <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0 }}>
          Тренажёр географии для диспетчеров
        </p>
      </div>

      {/* Карточка */}
      <div style={{
        width: "100%",
        maxWidth: "380px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "20px",
        padding: "24px 22px",
      }}>
        <p style={{ fontSize: "16px", fontWeight: 700, color: "#e2e8f0", margin: "0 0 6px 0", textAlign: "center" }}>
          Войди чтобы сохранить прогресс
        </p>
        <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 16px 0", lineHeight: 1.5, textAlign: "center" }}>
          Прогресс синхронизируется между устройствами и с основным курсом
        </p>

        {/* Ошибка */}
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.35)",
            borderRadius: "10px",
            padding: "10px 12px",
            marginBottom: "12px",
            fontSize: "13px",
            color: "#fca5a5",
          }}>
            {error}
          </div>
        )}

        {/* Главная Google кнопка. На мобильном она делает redirect, на десктопе popup. */}
        <button
          onClick={handleGoogle}
          disabled={disabled}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            padding: "14px 20px",
            background: disabled ? "rgba(255,255,255,0.1)" : "#fff",
            border: "none",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: 700,
            color: disabled ? "#94a3b8" : "#1f2937",
            cursor: disabled ? "default" : "pointer",
            touchAction: "manipulation",
            boxShadow: disabled ? "none" : "0 4px 16px rgba(0,0,0,0.3)",
            marginBottom: "10px",
          }}
        >
          {busy || loading ? (
            <>
              <div style={{
                width: "18px", height: "18px",
                border: "2px solid rgba(0,0,0,0.15)",
                borderTopColor: "#1f2937",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }} />
              Входим...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Войти через Google
            </>
          )}
        </button>

        {/* На мобильном показываем подсказку что иногда надо открыть во внешнем браузере */}
        {isMobile && (
          <div style={{
            background: "rgba(6,182,212,0.08)",
            border: "1px solid rgba(6,182,212,0.25)",
            borderRadius: "10px",
            padding: "10px 12px",
            marginTop: "10px",
            fontSize: "12px",
            color: "#cbd5e1",
            lineHeight: 1.5,
          }}>
            <div style={{ marginBottom: "6px", fontWeight: 600, color: "#67e8f9" }}>
              💡 Если кнопка выше не работает
            </div>
            {platform.isIOS ? (
              <>Открой эту страницу в <b>Safari</b>: в Telegram нажми <b>⋯</b> сверху → <b>Открыть в Safari</b>. Или скопируй ссылку и вставь в Safari.</>
            ) : (
              <>Открой эту страницу в <b>Chrome</b>: в Telegram нажми <b>⋮</b> сверху → <b>Открыть в браузере</b>. Или скопируй ссылку и вставь в Chrome.</>
            )}
            <button
              onClick={copyLink}
              style={{
                marginTop: "10px",
                width: "100%",
                padding: "8px 12px",
                background: "rgba(6,182,212,0.15)",
                border: "1px solid rgba(6,182,212,0.4)",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#06b6d4",
                cursor: "pointer",
                touchAction: "manipulation",
              }}
            >
              {copied ? "✅ Скопировано!" : "📋 Скопировать ссылку"}
            </button>
          </div>
        )}

        {/* Запасная кнопка — редирект на главный сайт */}
        <button
          onClick={goToFallback}
          disabled={disabled}
          style={{
            width: "100%",
            padding: "10px 14px",
            marginTop: "12px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: 600,
            color: "#94a3b8",
            cursor: disabled ? "default" : "pointer",
            touchAction: "manipulation",
          }}
        >
          Войти на основном сайте →
        </button>

        <p style={{ fontSize: "11px", color: "#94a3b8", margin: "14px 0 0 0", textAlign: "center" }}>
          Тот же аккаунт что и на dispatch4you.com
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
