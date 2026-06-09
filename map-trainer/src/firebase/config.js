// ═══════════════════════════════════════════════════════════
//  Firebase конфиг — тот же проект что и основной сайт
//  dispatch4you-80e0f
// ═══════════════════════════════════════════════════════════
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED, persistentLocalCache, memoryLocalCache } from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "AIzaSyC505dhT1WjUPhXbinqLvEOTlEXWxYy8GI",
  authDomain:        window.location.hostname === "localhost"
                       ? "dispatch4you-80e0f.firebaseapp.com"
                       : "dispatch4you.com",
  projectId:         "dispatch4you-80e0f",
  storageBucket:     "dispatch4you-80e0f.appspot.com",
  messagingSenderId: "349235354473",
  appId:             "1:349235354473:web:488aeb29211b02bb153bf8",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Отключаем offline persistence — используем memory cache
// Это предотвращает открытие постоянного Listen/channel соединения
// и устраняет ошибку "Too many requests"
export const db = getApps().length > 1
  ? getFirestore(app)
  : initializeFirestore(app, {
      localCache: memoryLocalCache(),
    });

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
