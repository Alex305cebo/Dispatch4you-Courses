// ═══════════════════════════════════════════════════════════
//  useAuth.js — unified login with main site
//  build: 2026-05-09 (mobile = always redirect, no popup)
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase/config";

const LS_USER_KEY  = "user";
const LS_TOKEN_KEY = "authToken";

/**
 * На мобильных устройствах signInWithPopup НЕ РАБОТАЕТ надёжно:
 *   • iOS Safari/WKWebView + Intelligent Tracking Prevention изолирует storage
 *     между popup и opener → токен не передаётся обратно → popup закрывается
 *     с null user.
 *   • iOS Telegram/Instagram/FB используют WKWebView → та же проблема.
 *   • Android тоже имеет нестабильное поведение popup в in-app браузерах.
 *
 * Решение: на любом мобильном устройстве всегда используем signInWithRedirect.
 * Он навигирует страницу → Google → обратно. Сессия сохраняется через
 * storage нашего же домена (до ухода и после возврата).
 */
function isMobile() {
  if (typeof navigator === "undefined") return false;
  const ua = (navigator.userAgent || navigator.vendor || "").toLowerCase();
  return /iphone|ipad|ipod|android/.test(ua);
}

/**
 * Детект in-app браузера — сейчас используется только для UI-подсказок.
 * На iOS UA не всегда содержит "Telegram", поэтому это вспомогательная
 * эвристика, а не основа для выбора auth flow.
 */
function isInAppBrowser() {
  if (typeof navigator === "undefined") return false;
  const ua = (navigator.userAgent || navigator.vendor || "").toLowerCase();
  return (
    /fban|fbav|instagram|telegram|line\/|whatsapp|wv\)/.test(ua) ||
    (/android/.test(ua) && / wv\)/.test(ua))
  );
}

function getUserFromCache() {
  try { return JSON.parse(localStorage.getItem(LS_USER_KEY) || "null"); }
  catch { return null; }
}

function makeUserData(fbUser) {
  const parts = (fbUser.displayName || "").trim().split(" ");
  return {
    uid:       fbUser.uid,
    firstName: parts[0] || (fbUser.email || "").split("@")[0] || "User",
    lastName:  parts.slice(1).join(" ") || "",
    email:     fbUser.email || "",
    photoURL:  fbUser.photoURL || null,
  };
}

function persistUser(fbUser) {
  const userData = makeUserData(fbUser);
  localStorage.setItem(LS_USER_KEY, JSON.stringify(userData));
  fbUser.getIdToken().then((t) => {
    localStorage.setItem(LS_TOKEN_KEY, t);
  }).catch(() => {});
  return userData;
}

export function useAuth() {
  const cachedOnInit = getUserFromCache();
  const [user,    setUser]    = useState(cachedOnInit);
  const [loading, setLoading] = useState(!cachedOnInit);

  useEffect(() => {
    let unsub = () => {};

    (async () => {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (e) {
        console.warn("[useAuth] setPersistence failed:", e?.code || e?.message);
      }

      // КРИТИЧНО: getRedirectResult должен отработать ДО onAuthStateChanged,
      // иначе результат redirect-логина потеряется.
      try {
        const res = await getRedirectResult(auth);
        if (res?.user) {
          console.log("[useAuth] redirect login success:", res.user.email);
          const userData = persistUser(res.user);
          setUser(userData);
          setLoading(false);
        }
      } catch (e) {
        console.warn("[useAuth] getRedirectResult error:", e?.code || e?.message);
      }

      unsub = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          const userData = persistUser(fbUser);
          setUser(userData);
        } else {
          const cached = getUserFromCache();
          if (!cached) {
            localStorage.removeItem(LS_USER_KEY);
            localStorage.removeItem(LS_TOKEN_KEY);
            setUser(null);
          }
        }
        setLoading(false);
      });

      setTimeout(() => {
        setLoading((l) => (l ? false : l));
      }, 4000);
    })();

    return () => { try { unsub(); } catch {} };
  }, []);

  // ── Вход через Google ──
  const signIn = async () => {
    try {
      // ГЛАВНОЕ ПРАВИЛО:
      //   Мобильное устройство → ВСЕГДА redirect.
      //   Десктоп → popup (быстрее, UX лучше) + fallback на redirect.
      if (isMobile()) {
        console.log("[useAuth] mobile detected → signInWithRedirect");
        await signInWithRedirect(auth, googleProvider);
        return;
      }

      try {
        const res = await signInWithPopup(auth, googleProvider);
        if (res?.user) {
          const userData = persistUser(res.user);
          setUser(userData);
          setLoading(false);
        }
      } catch (err) {
        const code = err?.code || "";
        if (
          code === "auth/popup-closed-by-user" ||
          code === "auth/cancelled-popup-request"
        ) {
          return;
        }
        if (
          code === "auth/popup-blocked" ||
          code === "auth/operation-not-supported-in-this-environment" ||
          code === "auth/web-storage-unsupported"
        ) {
          await signInWithRedirect(auth, googleProvider);
          return;
        }
        throw err;
      }
    } catch (err) {
      console.error("[useAuth] signIn error:", err?.code, err?.message);
    }
  };

  const logOut = async () => {
    try { await signOut(auth); } catch {}
    localStorage.removeItem(LS_USER_KEY);
    localStorage.removeItem(LS_TOKEN_KEY);
    localStorage.removeItem("xp_data");
    setUser(null);
  };

  return {
    user,
    loading,
    signIn,
    logOut,
    isMobile:       isMobile(),
    isInAppBrowser: isInAppBrowser(),
  };
}
