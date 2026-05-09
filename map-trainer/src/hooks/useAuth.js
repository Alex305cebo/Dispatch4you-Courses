// ═══════════════════════════════════════════════════════════
//  useAuth.js — unified login with main site
//  build: 2026-05-09 (In-app browser detect + shared cache)
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

// Детект встроенных браузеров Telegram/Instagram/Facebook/WhatsApp.
// В них popup для Google OAuth не работает — нужен redirect.
function isInAppBrowser() {
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
  const [user,    setUser]    = useState(() => getUserFromCache());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub = () => {};

    (async () => {
      // 1) localStorage persistence — сессия переживёт закрытие вкладки
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (e) {
        console.warn("[useAuth] setPersistence failed:", e?.code || e?.message);
      }

      // 2) Забираем результат, если вернулись с signInWithRedirect
      try {
        const res = await getRedirectResult(auth);
        if (res?.user) {
          const userData = persistUser(res.user);
          setUser(userData);
        }
      } catch (e) {
        console.warn("[useAuth] getRedirectResult error:", e?.code || e?.message);
      }

      // 3) Основная подписка — Firebase сам видит сессию из другого проекта
      //    в рамках того же домена через IndexedDB.
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
          } else {
            // В рамках одного Firebase project кеш можно считать валидным
            // короткое время — дальше Firebase его подтвердит или сбросит.
            setUser(cached);
          }
        }
        setLoading(false);
      });
    })();

    return () => { try { unsub(); } catch {} };
  }, []);

  // ── Вход через Google ──
  const signIn = async () => {
    try {
      // В in-app браузерах (Telegram/Instagram/FB) popup не открывается —
      // используем signInWithRedirect: страница перезагрузится и Firebase
      // сам обработает возврат через getRedirectResult на старте.
      if (isInAppBrowser()) {
        await signInWithRedirect(auth, googleProvider);
        return;
      }

      try {
        const res = await signInWithPopup(auth, googleProvider);
        if (res?.user) {
          const userData = persistUser(res.user);
          setUser(userData);
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
      // Последний шанс — редирект на login.html главного сайта
      try {
        localStorage.setItem(
          "returnUrl",
          window.location.origin + "/map-trainer/"
        );
      } catch {}
      window.location.href = "https://dispatch4you.com/login.html";
    }
  };

  const logOut = async () => {
    try { await signOut(auth); } catch {}
    localStorage.removeItem(LS_USER_KEY);
    localStorage.removeItem(LS_TOKEN_KEY);
    localStorage.removeItem("xp_data");
    setUser(null);
  };

  return { user, loading, signIn, logOut, isInAppBrowser: isInAppBrowser() };
}
