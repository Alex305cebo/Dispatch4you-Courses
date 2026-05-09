// ═══════════════════════════════════════════════════════════
//  LoginScreen.jsx — вход в USA Map Trainer
//  build: 2026-05-09 (proper Telegram/in-app browser handling)
// ═══════════════════════════════════════════════════════════
import { useState } from "react";

const APP_URL            = "https://dispatch4you.com/map-trainer/";
const FALLBACK_LOGIN_URL = "https://dispatch4you.com/login.html";

// ── Детект in-app браузеров ────────────────────────────────
// Google OAuth с 2021 блокирует вход из embedded WebView Telegram/Instagram/
// Facebook/WhatsApp. Единственный способ — открыть в настоящем Safari/Chrome.
function detectBrowser() {
  const ua = (navigator.userAgent || navigator.vendor || "").toLowerCase();

  const isTelegram  = /telegram/.test(ua);
  const isInstagram = /instagram/.test(ua);
  const isFacebook  = /fban|fbav/.test(ua);
  const isWhatsApp  = /whatsapp/.test(ua);
  const isLine      = /line\//.test(ua);
  const isAndroidWV = /android/.test(ua) && / wv\)/.test(ua);

  const isInApp = isTelegram || isInstagram || isFacebook || isWhatsApp || isLine || isAndroidWV;

  // iOS или Android
  const isIOS     = /iphone|ipad|ipod/.test(ua);
  const isAndroid = /android/.test(ua);

  let which = null;
  if (isTelegram)  which = "Telegram";
  else if (isInstagram) which = "Instagram";
  else if (isFacebook)  which = "Facebook";
  else if (isWhatsApp)  which = "WhatsApp";
  else if (isLine)      which = "Line";
  else if (isAndroidWV) which = "WebView";

  return { isInApp, which, isIOS, isAndroid };
}

export default function LoginScreen({ onSignIn, loading }) {
  const [busy,    setBusy]    = useState(false);
  const [error,   setError]   = useState(null);
  const [copied,  setCopied]  = useState(false);

  const browser = detectBrowser();

  const handleGoogle = async () => {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      if (typeof onSignIn === "function") {
        await onSignIn();
      } else {
        goToFallback();
      }
    } catch (e) {
      console.error("[LoginScreen] signIn failed:", e);
      setError("Не удалось войти через Google. Попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  };

  const goToFallback = () => {
    try { localStorage.setItem("returnUrl", APP_URL); } catch {}
    window.location.href = FALLBACK_LOGIN_URL;
  };

  const openInExternalBrowser = () => {
    // iOS: некоторые версии Telegram понимают x-safari-https:// для принудительного открытия в Safari
    // Android: пробуем intent:// схему для Chrome; если не сработает — предложим скопировать ссылку
    if (browser.isIOS && browser.which === "Telegram") {
      // Через iOS Shortcut / URL scheme не работает без разрешения.
      // Лучший вариант — открыть в обычном окне + подсказка пользователю.
      window.open(APP_URL, "_blank");
      return;
    }
    if (browser.isAndroid) {
      // Intent-схема заставляет Android открыть ссылку в Chrome / системном браузере
      window.location.href =
        "intent://dispatch4you.com/map-trainer/#Intent;scheme=https;package=com.android.chrome;end";
      return;
    }
    // Универсальный запасной вариант
    window.open(APP_URL, "_blank");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(APP_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // iOS до 13 может не поддерживать clipboard API — делаем старый трюк
      const ta = document.createElement("textarea");
      ta.value = APP_URL;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); setCopied(true); setTimeout(() => setCopied(false), 2000); }
      catch {}
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
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{ fontSize: "56px", marginBottom: "12px" }}>🇺🇸</div>
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
        {browser.isInApp ? (
          // ── Telegram / Instagram / Facebook / WhatsApp ─────────────
          <div>
            <div style={{
              background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(234,88,12,0.1))",
              border: "1px solid rgba(249,115,22,0.4)",
              borderRadius: "14px",
              padding: "14px 14px",
              marginBottom: "16px",
            }}>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#fed7aa", margin: "0 0 6px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "18px" }}>⚠️</span>
                Google не работает в {browser.which || "этом браузере"}
              </p>
              <p style={{ fontSize: "13px", color: "#fde5d2", margin: 0, lineHeight: 1.5 }}>
                Это ограничение со стороны Google. Откройте ссылку в <b>{browser.isIOS ? "Safari" : "Chrome"}</b> — и всё заработает.
              </p>
            </div>

            {/* Кнопка «Открыть во внешнем браузере» */}
            <button
              onClick={openInExternalBrowser}
              style={{
                width: "100%",
                padding: "14px 20px",
                background: "linear-gradient(135deg,#f97316,#ea580c)",
                border: "none",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 700,
                color: "#fff",
                cursor: "pointer",
                touchAction: "manipulation",
                boxShadow: "0 6px 18px rgba(249,115,22,0.35)",
                marginBottom: "10px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
            >
              <span style={{ fontSize: "16px" }}>🌐</span>
              Открыть в {browser.isIOS ? "Safari" : "Chrome"}
            </button>

            {/* Инструкция шагами на случай если кнопка не отработала */}
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              padding: "12px 14px",
              marginBottom: "12px",
            }}>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#e2e8f0", margin: "0 0 8px 0" }}>
                Если кнопка не сработала:
              </p>
              <p style={{ fontSize: "12px", color: "#cbd5e1", margin: 0, lineHeight: 1.6 }}>
                {browser.isIOS ? (
                  <>Нажми <b>⋯</b> сверху справа → <b>«Открыть в Safari»</b></>
                ) : (
                  <>Нажми <b>⋮</b> сверху справа → <b>«Открыть в браузере»</b></>
                )}
              </p>
            </div>

            {/* Копировать ссылку */}
            <button
              onClick={copyLink}
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "rgba(6,182,212,0.1)",
                border: "1px solid rgba(6,182,212,0.3)",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#06b6d4",
                cursor: "pointer",
                touchAction: "manipulation",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              }}
            >
              {copied ? "✅ Скопировано!" : "📋 Скопировать ссылку"}
            </button>

            <p style={{ fontSize: "11px", color: "#94a3b8", margin: "14px 0 0 0", textAlign: "center" }}>
              Если уже вошёл на dispatch4you.com — в Safari/Chrome сразу попадёшь в игру без повторного логина.
            </p>
          </div>
        ) : (
          // ── Обычный браузер ──────────────────────────────────────
          <div>
            <p style={{ fontSize: "16px", fontWeight: 700, color: "#e2e8f0", margin: "0 0 6px 0", textAlign: "center" }}>
              Войди чтобы сохранить прогресс
            </p>
            <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 20px 0", lineHeight: 1.5, textAlign: "center" }}>
              Прогресс синхронизируется между устройствами и с основным курсом
            </p>

            {/* Преимущества */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
              {[
                { icon: "☁️", text: "Прогресс сохраняется в облаке" },
                { icon: "📱", text: "Доступен на любом устройстве" },
                { icon: "🔗", text: "Единый аккаунт с курсом и игрой" },
                { icon: "⭐", text: "XP суммируется со всеми проектами" },
              ].map((item) => (
                <div key={item.text} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "16px", flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: "13px", color: "#e2e8f0" }}>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Ошибка */}
            {error && (
              <div style={{
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.35)",
                borderRadius: "10px",
                padding: "10px 12px",
                marginBottom: "14px",
                fontSize: "13px",
                color: "#fca5a5",
              }}>
                {error}
              </div>
            )}

            {/* Главная кнопка — Google */}
            <button
              onClick={handleGoogle}
              disabled={disabled}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "13px 20px",
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

            {/* Запасная кнопка */}
            <button
              onClick={goToFallback}
              disabled={disabled}
              style={{
                width: "100%",
                padding: "10px 14px",
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
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
