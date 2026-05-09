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
const LS_TOKEN_KEY = "authToken";

function getUserFromCache() {
  try {
    return JSON.parse(localStorage.getItem(LS_USER_KEY) || "null");
  } catch {
    return null;
  }
}

function hasAuthToken() {
  return !!localStorage.getItem(LS_TOKEN_KEY);
}

export function useAuth() {
  // Сразу показываем из кеша — нет мигания
  const [user,    setUser]    = useState(() => getUserFromCache());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔵 [useAuth] Инициализация...');
    
    // Проверяем кеш при старте
    const cachedUser = getUserFromCache();
    const hasToken = hasAuthToken();
    
    console.log('🔵 [useAuth] Кеш:', { 
      hasCachedUser: !!cachedUser, 
      hasToken,
      email: cachedUser?.email 
    });

    // Если есть данные в localStorage — используем их пока Firebase проверяет
    if (cachedUser && hasToken) {
      console.log('✅ [useAuth] Найдены данные в localStorage, используем их');
      setUser(cachedUser);
    }

    // Даём Firebase время на инициализацию
    let authCheckTimeout;
    
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      // Очищаем предыдущий таймаут
      if (authCheckTimeout) {
        clearTimeout(authCheckTimeout);
      }

      // Задержка для завершения процесса авторизации
      authCheckTimeout = setTimeout(() => {
        console.log('🔵 [useAuth] Firebase Auth состояние:', { 
          isAuthenticated: !!fbUser,
          email: fbUser?.email 
        });

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
          console.log('✅ [useAuth] Пользователь авторизован через Firebase');
          setUser(userData);
        } else {
          // Firebase вернул null — проверяем localStorage как fallback
          const cachedUser = getUserFromCache();
          const hasToken = hasAuthToken();
          
          if (cachedUser && hasToken) {
            // Есть данные в localStorage — доверяем им
            console.log('✅ [useAuth] Firebase вернул null, но есть данные в localStorage');
            setUser(cachedUser);
          } else {
            // Нет ни Firebase ни localStorage — пользователь не залогинен
            console.log('❌ [useAuth] Пользователь не авторизован');
            localStorage.removeItem(LS_USER_KEY);
            localStorage.removeItem(LS_TOKEN_KEY);
            setUser(null);
          }
        }
        setLoading(false);
      }, 300); // Задержка 300мс для завершения процесса
    });

    return () => {
      unsub();
      if (authCheckTimeout) {
        clearTimeout(authCheckTimeout);
      }
    };
  }, []);

  const signIn = async () => {
    console.log('🔵 [useAuth] Начало входа через Google...');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ [useAuth] Успешный вход:', result.user.email);
      
      // Сохраняем токен
      try {
        const token = await result.user.getIdToken();
        localStorage.setItem(LS_TOKEN_KEY, token);
        console.log('✅ [useAuth] Токен сохранён');
      } catch (e) {
        console.error('❌ [useAuth] Ошибка получения токена:', e);
      }
      
      // onAuthStateChanged сам обновит user
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
    console.log('🔵 [useAuth] Выход из аккаунта...');
    await signOut(auth).catch(() => {});
    localStorage.removeItem(LS_USER_KEY);
    localStorage.removeItem(LS_TOKEN_KEY);
    localStorage.removeItem("xp_data");
    setUser(null);
    console.log('✅ [useAuth] Выход выполнен');
  };

  return { user, loading, signIn, logOut };
}
