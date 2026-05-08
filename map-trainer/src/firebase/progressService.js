// ═══════════════════════════════════════════════════════════
//  progressService.js
//  Чтение и запись прогресса map-trainer в Firestore
//
//  Структура Firestore:
//  users/{uid}/
//    mapTrainer: {
//      xp, totalCorrect, streak, lastPlayDate,
//      levels: { "1": {completed, bestPct, bestScore, attempts}, ... }
//    }
// ═══════════════════════════════════════════════════════════
import { db } from "./config";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

const FIELD = "mapTrainer"; // поле внутри users/{uid}

// ── Загрузить прогресс из Firestore ──────────────────────────
export async function loadProgressFromFirestore(uid) {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      const data = snap.data();
      return data[FIELD] || null;
    }
    return null;
  } catch (err) {
    console.warn("[mapTrainer] Firestore load failed:", err.message);
    return null;
  }
}

// ── Инициализировать пользователя в рейтинге ──────────────────
export async function initUserInLeaderboard(uid, userData, currentXp = 0) {
  try {
    const progressRef = doc(db, "progress", uid);
    const snap = await getDoc(progressRef);
    
    // Создаём запись только если её нет
    if (!snap.exists()) {
      await setDoc(progressRef, {
        uid,
        xp: currentXp, // Используем текущий XP из localStorage
        firstName: userData?.firstName || "Player",
        lastName: userData?.lastName || "",
        photoURL: userData?.photoURL || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      // Если запись есть, но XP меньше текущего — обновляем
      const existingXp = snap.data().xp || 0;
      if (currentXp > existingXp) {
        await setDoc(progressRef, {
          uid,
          xp: currentXp,
          firstName: userData?.firstName || snap.data().firstName || "Player",
          lastName: userData?.lastName || snap.data().lastName || "",
          photoURL: userData?.photoURL || snap.data().photoURL || null,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
    }
  } catch (err) {
    console.warn("[mapTrainer] Init leaderboard failed:", err.message);
  }
}

// ── Сохранить весь прогресс в Firestore ──────────────────────
export async function saveProgressToFirestore(uid, progress, userData = null) {
  try {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);

    const payload = {
      [FIELD]: {
        xp:           progress.xp,
        totalCorrect: progress.totalCorrect,
        streak:       progress.streak,
        lastPlayDate: progress.lastPlayDate,
        levels:       progress.levels,
        updatedAt:    serverTimestamp(),
      },
    };

    // Добавляем данные пользователя для рейтинга
    if (userData) {
      payload.firstName = userData.firstName;
      payload.lastName = userData.lastName;
      payload.photoURL = userData.photoURL;
    }

    if (snap.exists()) {
      await updateDoc(userRef, payload);
    } else {
      // Создаём документ пользователя если его нет
      await setDoc(userRef, {
        uid,
        createdAt: serverTimestamp(),
        ...payload,
      });
    }

    // Также сохраняем в коллекцию progress для рейтинга
    const progressRef = doc(db, "progress", uid);
    await setDoc(progressRef, {
      uid,
      xp: progress.xp,
      firstName: userData?.firstName || "Player",
      lastName: userData?.lastName || "",
      photoURL: userData?.photoURL || null,
      updatedAt: serverTimestamp(),
    }, { merge: true });

  } catch (err) {
    console.warn("[mapTrainer] Firestore save failed:", err.message);
    // Не бросаем ошибку — localStorage остаётся как резервная копия
  }
}

// ── Обновить только XP в общем профиле пользователя ─────────
// Это синхронизирует XP с основным сайтом (nav-xp-badge)
export async function syncXpToUserProfile(uid, mapTrainerXp) {
  try {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const currentXp = snap.data().xp || 0;
      // Не перезаписываем общий XP — только добавляем разницу
      // Храним отдельно mapTrainerXp чтобы не дублировать
      const prevMapXp = snap.data()[FIELD]?.xp || 0;
      const delta = mapTrainerXp - prevMapXp;
      if (delta > 0) {
        await updateDoc(userRef, {
          xp: currentXp + delta,
        });
      }
    }
  } catch (err) {
    console.warn("[mapTrainer] XP sync failed:", err.message);
  }
}
