// ═══════════════════════════════════════════════════════════
//  useAuth.js — unified login with main site
//  build: 2026-05-08
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase/config";

const LS_USER_KEY = "user";
const LS_TOKEN_KEY = "authToken";

function getUserFromCache() {
  try { return JSON.parse(localStorage.getItem(LS_USER_KEY) || "null"); }
  catch { return null; }
}

function makeUserData(fbUser) {
  const parts = (fbUser.displayName || "").trim().split(" ");
  return {
    uid:       fbUser.uid,
    firstName: parts[0] || fbUser.email.split("@")[0],
    lastName:  parts.slice(1).join(" ") || "",
    email:     fbUser.email,
    photoURL:  fbUser.photoURL || null,
  };
}

export function useAuth() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем есть ли user и token в localStorage (после логина на главном сайте)
    const checkCachedAuth = () => {
      const cached = getUserFromCache();
      const hasToken = !!localStorage.getItem(LS_TOKEN_KEY);
      
      if (cached && hasToken) {
        // Есть кэш — используем его сразу
        setUser(cached);
        setLoading(false);
        return true;
      }
      return false;
    };

    // Сначала проверяем кэш
    if (checkCachedAuth()) {
      return;
    }

    // Если кэша нет — слушаем Firebase
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const userData = makeUserData(fbUser);
        localStorage.setItem(LS_USER_KEY, JSON.stringify(userData));
        fbUser.getIdToken().then(t => localStorage.setItem(LS_TOKEN_KEY, t)).catch(() => {});
        setUser(userData);
      } else {
        // Firebase вернул null — последняя проверка кэша
        if (!checkCachedAuth()) {
          localStorage.removeItem(LS_USER_KEY);
          localStorage.removeItem(LS_TOKEN_KEY);
          setUser(null);
        }
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      if (
        err.code !== "auth/popup-closed-by-user" &&
        err.code !== "auth/cancelled-popup-request"
      ) {
        console.error("[useAuth] signIn error:", err.code, err.message);
      }
    }
  };

  const logOut = async () => {
    await signOut(auth).catch(() => {});
    localStorage.removeItem(LS_USER_KEY);
    localStorage.removeItem(LS_TOKEN_KEY);
    localStorage.removeItem("xp_data");
    setUser(null);
  };

  return { user, loading, signIn, logOut };
}
