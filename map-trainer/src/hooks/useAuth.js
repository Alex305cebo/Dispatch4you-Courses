// ═══════════════════════════════════════════════════════════
//  useAuth.js
//  Хук аутентификации через Firebase Google OAuth
//  Синхронизирован с основным сайтом (тот же localStorage ключ)
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase/config";

// Тот же ключ что использует основной сайт
const LS_USER_KEY = "user";

function getUserFromCache() {
  try {
    return JSON.parse(localStorage.getItem(LS_USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function useAuth() {
  // Сразу показываем из кеша — нет мигания
  const [user,    setUser]    = useState(() => getUserFromCache());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const parts = (fbUser.displayName || "").trim().split(" ");
        const userData = {
          uid:       fbUser.uid,
          firstName: parts[0] || fbUser.email.split("@")[0],
          lastName:  parts.slice(1).join(" ") || "",
          email:     fbUser.email,
          photoURL:  fbUser.photoURL || null,
        };
        // Сохраняем в тот же localStorage что и основной сайт
        localStorage.setItem(LS_USER_KEY, JSON.stringify(userData));
        setUser(userData);
      } else {
        // Firebase вернул null — пользователь не залогинен
        localStorage.removeItem(LS_USER_KEY);
        setUser(null);
      }
      setLoading(false);
    });

    return unsub;
  }, []);

  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged сам обновит user
    } catch (err) {
      if (
        err.code !== "auth/popup-closed-by-user" &&
        err.code !== "auth/cancelled-popup-request"
      ) {
        console.error("[useAuth] signIn error:", err.code);
      }
    }
  };

  const logOut = async () => {
    await signOut(auth).catch(() => {});
    localStorage.removeItem(LS_USER_KEY);
    localStorage.removeItem("xp_data");
    setUser(null);
  };

  return { user, loading, signIn, logOut };
}
