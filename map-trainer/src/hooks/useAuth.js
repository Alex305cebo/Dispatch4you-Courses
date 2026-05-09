// ═══════════════════════════════════════════════════════════
//  useAuth.js — unified login with main site
//  build: 2026-05-08 (fixed Google login)
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
      // 1) Включаем localStorage persistence — сессия переживёт перезагрузку
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

      // 3) Подписываемся на изменения Firebase Auth
      unsub = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          const userData = persistUser(fbUser);
          setUser(userData);
        } else {
          // Firebase вернул null.
          // Если в кэше остался юзер от главного сайта (same Firebase project) —
          // даём ему шанс: не сносим кэш, но и не считаем залогиненным.
          // Сайт выше нас уже проверяет токен, так что полный релог неизбежен если
          // сессии реально нет.
          const cached = getUserFromCache();
          if (!cached) {
            localStorage.removeItem(LS_USER_KEY);
            localStorage.removeItem(LS_TOKEN_KEY);
            setUser(null);
          } else {
            // Кэш есть, но Firebase не видит сессию — доверяем кэшу.
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
      // На мобильном Chrome/Safari и в in-app браузерах popup часто не открывается.
      // Пробуем popup → fallback на redirect.
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
          return; // юзер сам закрыл — ничего не делаем
        }
        if (
          code === "auth/popup-blocked" ||
          code === "auth/operation-not-supported-in-this-environment" ||
          code === "auth/web-storage-unsupported"
        ) {
          // Fallback на redirect
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

  return { user, loading, signIn, logOut };
}
