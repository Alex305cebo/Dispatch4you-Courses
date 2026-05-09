// ═══════════════════════════════════════════════════════════
//  useAuth.js — signInWithRedirect (работает везде, включая мобильные)
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
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
  const [user,    setUser]    = useState(() => getUserFromCache());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let done = false;

    // 1. Сначала проверяем результат redirect (если вернулись от Google)
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          const userData = makeUserData(result.user);
          localStorage.setItem(LS_USER_KEY, JSON.stringify(userData));
          // Сохраняем токен
          result.user.getIdToken().then(t => localStorage.setItem(LS_TOKEN_KEY, t)).catch(() => {});
          setUser(userData);
          done = true;
        }
      })
      .catch(() => {})
      .finally(() => {
        // 2. Подписываемся на изменения состояния Firebase Auth
        const unsub = onAuthStateChanged(auth, (fbUser) => {
          if (fbUser) {
            const userData = makeUserData(fbUser);
            localStorage.setItem(LS_USER_KEY, JSON.stringify(userData));
            fbUser.getIdToken().then(t => localStorage.setItem(LS_TOKEN_KEY, t)).catch(() => {});
            setUser(userData);
          } else {
            // Firebase вернул null — проверяем localStorage как fallback
            const cached = getUserFromCache();
            const hasToken = !!localStorage.getItem(LS_TOKEN_KEY);
            if (cached && hasToken) {
              setUser(cached); // доверяем кешу
            } else {
              localStorage.removeItem(LS_USER_KEY);
              localStorage.removeItem(LS_TOKEN_KEY);
              setUser(null);
            }
          }
          setLoading(false);
        });
        return unsub;
      });
  }, []);

  const signIn = async () => {
    try {
      // Redirect — страница уходит на Google и возвращается обратно
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      console.error("[useAuth] signIn error:", err.code, err.message);
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
