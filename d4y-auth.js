/**
 * d4y-auth.js  —  Единый модуль авторизации для всех проектов dispatch4you.com
 * -----------------------------------------------------------------------------
 *  Источник правды для:
 *    • главного сайта (dispatch4you.com)
 *    • Map Trainer (dispatch4you.com/map-trainer/)
 *    • Adventure Game (dispatch4you.com/game/)
 *    • будущих React проектов
 *
 *  Что делает:
 *    1. Один раз инициализирует Firebase в рамках домена.
 *    2. Выставляет browserLocalPersistence — сессия переживает закрытие вкладки.
 *    3. Обрабатывает getRedirectResult на старте (возврат из OAuth redirect).
 *    4. signInWithGoogle() — popup; при блокировке/in-app браузере автоматом
 *       переключается на signInWithRedirect, которое работает везде.
 *    5. Сохраняет пользователя в localStorage (ключи: user, authToken, user_role)
 *       чтобы кеш был общий между старыми HTML страницами и новыми React проектами.
 *    6. Слушает onAuthStateChanged и рассылает подписчикам через onUserChange().
 *
 *  Все три проекта видят один и тот же Firebase auth state автоматически,
 *  потому что Firebase хранит сессию в IndexedDB, общей для всего домена.
 *
 *  Версия: 1.0  (2026-05-09)
 * ---------------------------------------------------------------------------*/

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signOut as fbSignOut,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// ── Константы ────────────────────────────────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyC505dhT1WjUPhXbinqLvEOTlEXWxYy8GI",
  authDomain:        "dispatch4you-80e0f.firebaseapp.com",
  projectId:         "dispatch4you-80e0f",
  storageBucket:     "dispatch4you-80e0f.appspot.com",
  messagingSenderId: "349235354473",
  appId:             "1:349235354473:web:488aeb29211b02bb153bf8",
};

const LS_USER_KEY  = "user";
const LS_TOKEN_KEY = "authToken";
const LS_ROLE_KEY  = "user_role";
const LS_XP_KEY    = "xp_data";

// Супер-юзеры — получают роль моментально, без ожидания Firestore
const SUPER_EMAILS = [
  "dersire.der@gmail.com",
  "cebotarigg@gmail.com",
  "mihail.ce89@gmail.com",
];

// ── Инициализация ────────────────────────────────────────────────────────────
const app  = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);
const db   = getFirestore(app);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

// Сразу включаем надёжный persistence
setPersistence(auth, browserLocalPersistence).catch((e) => {
  console.warn("[d4y-auth] setPersistence failed:", e?.code || e?.message);
});

// ── Детект in-app браузеров (Telegram, Instagram, Facebook, WhatsApp, Line) ─
function isInAppBrowser() {
  const ua = (navigator.userAgent || navigator.vendor || "").toLowerCase();
  return (
    /fban|fbav|instagram|telegram|line\/|whatsapp|wv\)/.test(ua) ||
    // Android WebView маркер
    (/android/.test(ua) && / wv\)/.test(ua))
  );
}

// ── Кеш подписчиков ──────────────────────────────────────────────────────────
const subscribers = new Set();
let lastUser = getUserFromCache();

// ── Утилиты ──────────────────────────────────────────────────────────────────
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

async function persistUser(fbUser) {
  const userData = makeUserData(fbUser);
  try { localStorage.setItem(LS_USER_KEY, JSON.stringify(userData)); } catch {}
  try {
    const token = await fbUser.getIdToken();
    localStorage.setItem(LS_TOKEN_KEY, token);
  } catch {}

  // Определяем роль: superuser моментально, остальные — из Firestore
  let role = "registered";
  if (SUPER_EMAILS.indexOf((fbUser.email || "").toLowerCase()) !== -1) {
    role = "superuser";
  } else {
    try {
      const snap = await getDoc(doc(db, "users", fbUser.uid));
      if (snap.exists()) {
        role = snap.data().accessRole || "registered";
        // XP для навбара
        const xp = snap.data().xp || 0;
        try { localStorage.setItem(LS_XP_KEY, JSON.stringify({ totalXP: xp })); } catch {}
      } else {
        // Новый пользователь — создаём запись
        await setDoc(doc(db, "users", fbUser.uid), {
          uid: fbUser.uid,
          firstName: userData.firstName,
          lastName:  userData.lastName,
          email:     userData.email,
          photoURL:  userData.photoURL || "",
          accessRole: "registered",
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          provider:  fbUser.providerData[0]?.providerId || "unknown",
        }, { merge: true });
      }
    } catch (e) {
      console.warn("[d4y-auth] Firestore read failed:", e?.code || e?.message);
    }
  }
  try { localStorage.setItem(LS_ROLE_KEY, role); } catch {}

  // Обновляем lastLogin в фоне (не блокируем)
  try {
    setDoc(doc(db, "users", fbUser.uid), {
      lastLogin: serverTimestamp(),
    }, { merge: true }).catch(() => {});
  } catch {}

  return { ...userData, role };
}

function clearCache() {
  try {
    localStorage.removeItem(LS_USER_KEY);
    localStorage.removeItem(LS_TOKEN_KEY);
    localStorage.removeItem(LS_ROLE_KEY);
    localStorage.removeItem(LS_XP_KEY);
  } catch {}
}

function notify(user) {
  lastUser = user;
  for (const cb of subscribers) {
    try { cb(user); } catch (e) { console.error("[d4y-auth] subscriber error:", e); }
  }
}

// ── Старт: getRedirectResult + onAuthStateChanged ────────────────────────────
let initialized = false;

(async () => {
  // 1) Результат после возврата из signInWithRedirect
  try {
    const res = await getRedirectResult(auth);
    if (res?.user) {
      await persistUser(res.user);
    }
  } catch (e) {
    console.warn("[d4y-auth] getRedirectResult:", e?.code || e?.message);
  }

  // 2) Основной слушатель состояния
  onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      const userData = await persistUser(fbUser);
      initialized = true;
      notify(userData);
      // Совместимость со старым кодом
      try {
        document.dispatchEvent(new CustomEvent("roleReady", { detail: { role: userData.role } }));
      } catch {}
    } else {
      // Firebase сказал null.
      // Если ещё не было onAuthStateChanged — возможно просто восстанавливает сессию, подождём
      if (!initialized) {
        initialized = true;
        // Держим кеш — но уведомим подписчиков через 2 сек если ничего не прилетит
        const cached = getUserFromCache();
        if (cached) {
          notify(cached);
          // Параллельно проверяем что реально есть сессия — если нет, потом разлогиним
          setTimeout(() => {
            if (!auth.currentUser) {
              clearCache();
              notify(null);
              try { document.dispatchEvent(new CustomEvent("roleReady", { detail: { role: "guest" } })); } catch {}
            }
          }, 3000);
        } else {
          notify(null);
          try { document.dispatchEvent(new CustomEvent("roleReady", { detail: { role: "guest" } })); } catch {}
        }
      } else {
        // Явный logout
        clearCache();
        notify(null);
        try { document.dispatchEvent(new CustomEvent("roleReady", { detail: { role: "guest" } })); } catch {}
      }
    }
  });
})();

// ── Публичный API ────────────────────────────────────────────────────────────

/**
 * Подписаться на изменения состояния пользователя.
 * Коллбэк получит текущее значение сразу если оно уже известно.
 * Возвращает функцию отписки.
 */
export function onUserChange(callback) {
  subscribers.add(callback);
  // Синхронный callback с текущим значением
  if (lastUser !== undefined) {
    try { callback(lastUser); } catch {}
  }
  return () => subscribers.delete(callback);
}

/** Текущий пользователь (из кеша, синхронно). */
export function currentUser() {
  return lastUser;
}

/**
 * Вход через Google.
 *   • в нормальном браузере → popup
 *   • если popup заблокирован или в in-app браузере (Telegram/Instagram) → redirect
 *
 * Вернёт user сразу только если popup сработал. При redirect — страница
 * перезагрузится, и результат подхватит getRedirectResult при следующем старте.
 */
export async function signInWithGoogle(options = {}) {
  const { returnUrl } = options;
  if (returnUrl) {
    try { localStorage.setItem("returnUrl", returnUrl); } catch {}
  }

  // В in-app браузерах popup не работает — сразу redirect
  if (isInAppBrowser()) {
    try {
      await signInWithRedirect(auth, provider);
      return null;
    } catch (e) {
      console.error("[d4y-auth] redirect failed:", e?.code || e?.message);
      throw e;
    }
  }

  // Обычный браузер: popup → при ошибке fallback на redirect
  try {
    const res = await signInWithPopup(auth, provider);
    if (res?.user) {
      return await persistUser(res.user);
    }
    return null;
  } catch (err) {
    const code = err?.code || "";
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
      return null;
    }
    if (
      code === "auth/popup-blocked" ||
      code === "auth/operation-not-supported-in-this-environment" ||
      code === "auth/web-storage-unsupported"
    ) {
      await signInWithRedirect(auth, provider);
      return null;
    }
    console.error("[d4y-auth] signIn error:", code, err?.message);
    throw err;
  }
}

/** Выход. */
export async function signOut() {
  try { await fbSignOut(auth); } catch {}
  clearCache();
  notify(null);
}

// ── Совместимость со старыми скриптами (window.* API) ────────────────────────
try {
  window._fbAuth = auth;
  window.D4Y_AUTH = { signInWithGoogle, signOut, onUserChange, currentUser, isInAppBrowser };
  // Старые хэндлеры
  window.signInWithGoogle = signInWithGoogle;
  window.authLogout = async (e) => { if (e) e.preventDefault(); await signOut(); };
} catch {}

export { auth, db, isInAppBrowser };
