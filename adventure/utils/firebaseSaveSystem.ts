/**
 * Firebase Save System для Dispatcher Training Game
 * Сохраняет прогресс игры в Firestore с поддержкой:
 * - Автоматическое сохранение каждые 60 секунд
 * - Сохранение при критических событиях
 * - Загрузка последнего сохранения
 * - История сохранений (последние 5)
 * - Синхронизация между устройствами
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  Timestamp,
  Firestore
} from 'firebase/firestore';
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signOut,
  User,
  Auth
} from 'firebase/auth';

// Firebase конфигурация (единая для всех проектов dispatch4you.com)
const firebaseConfig = {
  apiKey: "AIzaSyC505dhT1WjUPhXbinqLvEOTlEXWxYy8GI",
  // authDomain = наш домен. Self-hosted sign-in helper в /__/auth/ убирает
  // Storage Partitioning issue в Safari 16+/Chrome 115+/Telegram WebView.
  // https://firebase.google.com/docs/auth/web/redirect-best-practices
  authDomain: "dispatch4you.com",
  projectId: "dispatch4you-80e0f",
  storageBucket: "dispatch4you-80e0f.appspot.com",
  messagingSenderId: "349235354473",
  appId: "1:349235354473:web:488aeb29211b02bb153bf8"
};

// Инициализация Firebase
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

try {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);

  // Надёжный persistence + настройка Google провайдера
  setPersistence(auth, browserLocalPersistence).catch((e) => {
    console.warn('[auth] setPersistence failed:', e?.code || e?.message);
  });

  // Ловим возврат из signInWithRedirect (Telegram/Instagram и т.п.)
  getRedirectResult(auth).catch((e) => {
    console.warn('[auth] getRedirectResult:', e?.code || e?.message);
  });

  // Автосинхронизация localStorage.user с Firebase Auth — общий кеш с главным сайтом
  onAuthStateChanged(auth, (fbUser) => {
    try {
      if (typeof localStorage === 'undefined') return;
      if (fbUser) {
        const parts = (fbUser.displayName || '').trim().split(' ');
        const userData = {
          uid: fbUser.uid,
          firstName: parts[0] || (fbUser.email || '').split('@')[0] || 'User',
          lastName:  parts.slice(1).join(' ') || '',
          email:     fbUser.email || '',
          photoURL:  fbUser.photoURL || null,
        };
        localStorage.setItem('user', JSON.stringify(userData));
        fbUser.getIdToken().then((t) => {
          try { localStorage.setItem('authToken', t); } catch {}
        }).catch(() => {});
      }
      // Если fbUser == null — не чистим кеш автоматически.
      // Пусть явный signOutUser это делает, иначе словим временный null
      // пока Firebase восстанавливает сессию.
    } catch {}
  });

  console.log('✅ Firebase initialized for game saves');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
}

// Детект in-app браузера (Telegram / Instagram / Facebook / WhatsApp / WebView)
function isInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = ((navigator.userAgent || navigator.vendor || '') as string).toLowerCase();
  return (
    /fban|fbav|instagram|telegram|line\/|whatsapp|wv\)/.test(ua) ||
    (/android/.test(ua) && / wv\)/.test(ua))
  );
}

// Интерфейс сохранения
export interface GameSaveData {
  version: number;
  phase: string;
  day: number;
  gameMinute: number;
  sessionName: string;
  balance: number;
  totalEarned: number;
  totalLost: number;
  financeLog: any[];
  reputation: number;
  trucks: any[];
  availableLoads: any[];
  activeLoads: any[];
  bookedLoads: any[];
  brokers: any[];
  activeEvents: any[];
  resolvedEvents: any[];
  notifications: any[];
  unreadCount: number;
  pendingEmailResponses: any[];
  activeWeatherZones: any[];
  driverCandidates: any[];
  pendingFactoringOffers: any[];
  savedAt: number;
  savedAtServer?: Timestamp;
  deviceInfo?: {
    platform: string;
    userAgent: string;
  };
}

// Метаданные сохранения для списка
export interface SaveMetadata {
  id: string;
  sessionName: string;
  savedAt: number;
  gameMinute: number;
  balance: number;
  trucksCount: number;
  phase: string;
}

/**
 * Получить текущего пользователя.
 * Ждёт первый callback onAuthStateChanged (который может прилететь через
 * несколько сотен мс — Firebase восстанавливает сессию из IndexedDB).
 * Дополнительно читает localStorage.user (общий с главным сайтом) как
 * мгновенный fallback, чтобы UI не моргал "войти → ой нет, уже залогинен".
 */
export function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    // Фоллбэк из общего кеша главного сайта — сразу отдаём, но продолжаем ждать Firebase
    // (однако если Firebase сам всё подтвердит через подписку, мы возьмём именно его ответ)
    let settled = false;
    const finish = (u: User | null) => {
      if (settled) return;
      settled = true;
      resolve(u);
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      finish(user);
    });

    // Страховка: если onAuthStateChanged молчит > 4 сек — отдаём что есть
    setTimeout(() => {
      if (!settled) {
        unsubscribe();
        // Если в кеше главного сайта есть юзер — хотя бы частично считаем залогиненным
        // (полный User объект вернуть не можем, поэтому null)
        finish(auth.currentUser);
      }
    }, 4000);
  });
}

/**
 * Быстрая синхронная проверка — залогинен ли пользователь.
 * Читает общий localStorage.user (ключ совпадает с главным сайтом и Map Trainer).
 * Полезно чтобы не показывать экран "войти" когда пользователь уже залогинен на главном сайте.
 */
export function isLoggedInFromCache(): boolean {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('user') : null;
    if (!raw) return false;
    const data = JSON.parse(raw);
    return !!data?.uid;
  } catch { return false; }
}

/**
 * Прочитать кешированные данные пользователя (имя/email/фото).
 * Для быстрого рендера UI до того как Firebase подтвердит сессию.
 */
export function getCachedUser(): { uid: string; firstName: string; lastName: string; email: string; photoURL: string | null } | null {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('user') : null;
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data?.uid ? data : null;
  } catch { return null; }
}

/**
 * Войти через Google.
 *   • Обычный браузер → popup.
 *   • In-app (Telegram/Instagram/FB) или popup заблокирован → redirect.
 *   При redirect страница перезагрузится, результат подхватит
 *   getRedirectResult на следующем старте (уже вызван при инициализации).
 */
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    // Внутри Telegram / Instagram / Facebook / WebView — только redirect
    if (isInAppBrowser()) {
      try {
        await signInWithRedirect(auth, provider);
      } catch (e: any) {
        console.error('❌ Redirect sign-in failed:', e?.code, e?.message);
      }
      return null; // страница уйдёт на Google, результат придёт при возврате
    }

    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return null;
      }
      if (
        code === 'auth/popup-blocked' ||
        code === 'auth/operation-not-supported-in-this-environment' ||
        code === 'auth/web-storage-unsupported'
      ) {
        await signInWithRedirect(auth, provider);
        return null;
      }
      throw err;
    }
  } catch (error) {
    console.error('❌ Google sign-in failed:', error);
    return null;
  }
}

// Детект in-app доступен снаружи для UI (предупреждения пользователю)
export { isInAppBrowser };

/**
 * Выйти из аккаунта — разлогиниваемся из Firebase И чистим общий кеш,
 * чтобы пользователь вышел и на главном сайте / Map Trainer одновременно.
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('❌ Sign out failed:', error);
  }
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user_role');
      localStorage.removeItem('xp_data');
    }
  } catch {}
}

/**
 * Сохранить игру в Firebase
 */
export async function saveGameToFirebase(saveData: GameSaveData): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      console.warn('⚠️ User not logged in - saving to localStorage only');
      return false;
    }

    // Сериализуем данные в JSON строку для Firebase
    // Firestore не поддерживает сложные вложенные структуры
    const serializedData = {
      version: saveData.version,
      savedAt: saveData.savedAt,
      savedAtServer: Timestamp.now(),
      sessionName: saveData.sessionName,
      gameMinute: saveData.gameMinute,
      balance: saveData.balance,
      phase: saveData.phase,
      // Сохраняем всё остальное как JSON строку
      gameData: JSON.stringify(saveData),
      deviceInfo: {
        platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 100) : 'unknown',
      }
    };

    // Сохраняем в основной документ (последнее сохранение)
    const userDocRef = doc(db, 'gameSaves', user.uid);
    await setDoc(userDocRef, serializedData);

    // Сохраняем в историю (последние 5 сохранений)
    const historyRef = doc(collection(db, 'gameSaves', user.uid, 'history'));
    await setDoc(historyRef, serializedData);

    console.log('✅ Game saved to Firebase');
    return true;
  } catch (error) {
    console.error('❌ Failed to save game to Firebase:', error);
    return false;
  }
}

/**
 * Загрузить последнее сохранение из Firebase
 */
export async function loadGameFromFirebase(): Promise<GameSaveData | null> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      console.warn('⚠️ User not logged in - loading from localStorage only');
      return null;
    }

    const userDocRef = doc(db, 'gameSaves', user.uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Десериализуем JSON строку обратно в объект
      if (data.gameData) {
        const gameData = JSON.parse(data.gameData) as GameSaveData;
        console.log('✅ Game loaded from Firebase');
        return gameData;
      }
      console.log('ℹ️ No game data found in Firebase save');
      return null;
    } else {
      console.log('ℹ️ No save found in Firebase');
      return null;
    }
  } catch (error) {
    console.error('❌ Failed to load game from Firebase:', error);
    return null;
  }
}

/**
 * Получить список всех сохранений (история)
 */
export async function getSaveHistory(): Promise<SaveMetadata[]> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return [];
    }

    const historyRef = collection(db, 'gameSaves', user.uid, 'history');
    const q = query(historyRef, orderBy('savedAt', 'desc'), limit(5));
    const querySnapshot = await getDocs(q);

    const saves: SaveMetadata[] = [];
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      // Парсим gameData если есть
      if (data.gameData) {
        const gameData = JSON.parse(data.gameData) as GameSaveData;
        saves.push({
          id: docSnapshot.id,
          sessionName: gameData.sessionName || data.sessionName,
          savedAt: gameData.savedAt || data.savedAt,
          gameMinute: gameData.gameMinute || data.gameMinute,
          balance: gameData.balance || data.balance,
          trucksCount: gameData.trucks?.length || 0,
          phase: gameData.phase || data.phase,
        });
      } else {
        // Старый формат (для обратной совместимости)
        saves.push({
          id: docSnapshot.id,
          sessionName: data.sessionName,
          savedAt: data.savedAt,
          gameMinute: data.gameMinute,
          balance: data.balance,
          trucksCount: 0,
          phase: data.phase,
        });
      }
    });

    return saves;
  } catch (error) {
    console.error('❌ Failed to get save history:', error);
    return [];
  }
}

/**
 * Загрузить конкретное сохранение из истории
 */
export async function loadSaveFromHistory(saveId: string): Promise<GameSaveData | null> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return null;
    }

    const saveRef = doc(db, 'gameSaves', user.uid, 'history', saveId);
    const docSnap = await getDoc(saveRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Десериализуем JSON строку
      if (data.gameData) {
        return JSON.parse(data.gameData) as GameSaveData;
      }
      // Старый формат (для обратной совместимости)
      return data as GameSaveData;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Failed to load save from history:', error);
    return null;
  }
}

/**
 * Удалить все сохранения пользователя
 */
export async function clearAllSaves(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return false;
    }

    // Удаляем основное сохранение
    const userDocRef = doc(db, 'gameSaves', user.uid);
    await setDoc(userDocRef, { deleted: true, deletedAt: Timestamp.now() });

    console.log('✅ All saves cleared from Firebase');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear saves:', error);
    return false;
  }
}

/**
 * Проверить доступность Firebase
 */
export function isFirebaseAvailable(): boolean {
  return !!db && !!auth;
}

/**
 * Гибридная система сохранения: localStorage + Firebase
 * Сохраняет локально для быстрого доступа и в Firebase для синхронизации
 */
export async function hybridSave(saveData: GameSaveData): Promise<void> {
  // 1. Сохраняем в localStorage (быстро, всегда работает)
  try {
    localStorage.setItem('dispatcher-game-save', JSON.stringify(saveData));
    console.log('✅ Game saved to localStorage');
  } catch (error) {
    console.error('❌ Failed to save to localStorage:', error);
  }

  // 2. Сохраняем в Firebase (медленнее, требует авторизации)
  if (isFirebaseAvailable()) {
    await saveGameToFirebase(saveData);
  }
}

/**
 * Гибридная загрузка: сначала Firebase, потом localStorage
 * Firebase имеет приоритет для синхронизации между устройствами
 */
export async function hybridLoad(): Promise<GameSaveData | null> {
  // 1. Пытаемся загрузить из Firebase (самое свежее, синхронизировано)
  if (isFirebaseAvailable()) {
    const firebaseData = await loadGameFromFirebase();
    if (firebaseData) {
      console.log('✅ Loaded from Firebase (synced)');
      // Сохраняем в localStorage для оффлайн доступа
      try {
        localStorage.setItem('dispatcher-game-save', JSON.stringify(firebaseData));
      } catch (e) {}
      return firebaseData;
    }
  }

  // 2. Если Firebase недоступен или нет сохранения - загружаем из localStorage
  try {
    const localData = localStorage.getItem('dispatcher-game-save');
    if (localData) {
      console.log('✅ Loaded from localStorage (offline)');
      return JSON.parse(localData);
    }
  } catch (error) {
    console.error('❌ Failed to load from localStorage:', error);
  }

  return null;
}

/**
 * Автосохранение с интервалом
 */
let autoSaveInterval: NodeJS.Timeout | null = null;

export function startAutoSave(getSaveData: () => GameSaveData, intervalMs: number = 60000): void {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
  }

  autoSaveInterval = setInterval(async () => {
    const saveData = getSaveData();
    await hybridSave(saveData);
    console.log('🔄 Auto-save completed');
  }, intervalMs);

  console.log(`✅ Auto-save started (every ${intervalMs / 1000}s)`);
}

export function stopAutoSave(): void {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
    console.log('⏹️ Auto-save stopped');
  }
}

// Экспорт для удобства
export default {
  saveGameToFirebase,
  loadGameFromFirebase,
  getSaveHistory,
  loadSaveFromHistory,
  clearAllSaves,
  isFirebaseAvailable,
  hybridSave,
  hybridLoad,
  startAutoSave,
  stopAutoSave,
  getCurrentUser,
};
