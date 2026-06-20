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
  getDocFromServer,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  getDocsFromServer,
  increment,
  serverTimestamp,
} from "firebase/firestore";

const FIELD = "mapTrainer"; // поле внутри users/{uid}

// ── Загрузить прогресс из Firestore ──────────────────────────
export async function loadProgressFromFirestore(uid) {
  try {
    const snap = await getDocFromServer(doc(db, "users", uid));
    if (snap.exists()) {
      return snap.data()[FIELD] || null;
    }
    return null;
  } catch (err) {
    console.warn("[mapTrainer] Firestore load failed:", err.message);
    return null;
  }
}

// ── Инициализировать пользователя в рейтинге ──────────────────
const _leaderboardCache = {}; // uid → last written xp
export async function initUserInLeaderboard(uid, userData, currentXp = 0) {
  try {
    if (!currentXp || currentXp <= 100) return;
    // Не пишем если XP не изменился с прошлого раза
    if (_leaderboardCache[uid] === currentXp) return;

    const progressRef = doc(db, "progress", uid);
    const snap = await getDocFromServer(progressRef);
    const existingXp = snap.exists() ? (snap.data().xp || 0) : 0;

    if (currentXp > existingXp) {
      await setDoc(progressRef, {
        uid,
        xp:        currentXp,
        firstName: userData?.firstName || snap.data()?.firstName || "Player",
        lastName:  userData?.lastName  || snap.data()?.lastName  || "",
        photoURL:  userData?.photoURL  || snap.data()?.photoURL  || null,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      _leaderboardCache[uid] = currentXp;
    } else {
      _leaderboardCache[uid] = existingXp;
    }
  } catch (err) {
    console.warn("[mapTrainer] Init leaderboard failed:", err.message);
  }
}

// ── Сохранить весь прогресс в Firestore ──────────────────────
export async function saveProgressToFirestore(uid, progress, userData = null) {
  try {
    const userRef = doc(db, "users", uid);

    const payload = {
      [FIELD]: {
        xp:           progress.xp,
        totalCorrect: progress.totalCorrect,
        streak:       progress.streak,
        lastPlayDate: progress.lastPlayDate,
        levels:       progress.levels,
        updatedAt:    serverTimestamp(),
      },
      ...(userData ? {
        firstName: userData.firstName,
        lastName:  userData.lastName,
        photoURL:  userData.photoURL,
      } : {}),
    };

    // setDoc с merge — не нужен getDoc перед записью
    await setDoc(userRef, { uid, ...payload }, { merge: true });

    // Зеркало в progress/ для рейтинга — только если XP > 100
    if ((progress.xp || 0) > 100) {
      const progressRef = doc(db, "progress", uid);
      await setDoc(progressRef, {
        uid,
        xp:        progress.xp,
        firstName: userData?.firstName || "Player",
        lastName:  userData?.lastName  || "",
        photoURL:  userData?.photoURL  || null,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }

  } catch (err) {
    console.warn("[mapTrainer] Firestore save failed:", err.message);
  }
}

// ── Обновить только XP в общем профиле пользователя ─────────
// Использует increment — не нужен getDoc, одна операция
let _lastSyncXp = 0;
export async function syncXpToUserProfile(uid, mapTrainerXp) {
  try {
    // Не синхронизируем если XP не изменился
    if (mapTrainerXp <= _lastSyncXp) return;
    const delta = mapTrainerXp - _lastSyncXp;
    _lastSyncXp = mapTrainerXp;
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, {
      xp: increment(delta),
    }, { merge: true });
  } catch (err) {
    console.warn("[mapTrainer] XP sync failed:", err.message);
  }
}

// ── Сохранить рекорд уровня по сложности ────────────────────
// levelRecords/{levelId}_{questionCount} → { uid, name, photoURL, time, updatedAt }
export async function saveLevelRecord(uid, userData, levelId, questionCount, timeSeconds) {
  try {
    const key = `${levelId}_${questionCount}`;
    const recordRef = doc(db, "levelRecords", key);
    const snap = await getDocFromServer(recordRef);

    const name = [userData?.firstName, userData?.lastName].filter(Boolean).join(" ") || "Player";
    const existing = snap.exists() ? snap.data() : null;

    if (!existing || timeSeconds < (existing.time || Infinity)) {
      await setDoc(recordRef, {
        uid, name,
        photoURL: userData?.photoURL || null,
        time: timeSeconds,
        levelId, questionCount,
        updatedAt: serverTimestamp(),
      });
      return true;
    }
    return false;
  } catch (err) {
    console.warn("[mapTrainer] Save level record failed:", err.message);
    return false;
  }
}

// ── Удалить все рекорды (сброс при смене логики) ─────────────
export async function clearAllLevelRecords() {
  try {
    const snap = await getDocsFromServer(collection(db, "levelRecords"));
    const deletes = [];
    snap.forEach((d) => deletes.push(deleteDoc(d.ref)));
    await Promise.all(deletes);
    console.log(`[mapTrainer] Очищено ${deletes.length} рекордов`);
    return true;
  } catch (err) {
    console.warn("[mapTrainer] Clear records failed:", err.message);
    return false;
  }
}

// Возвращает { [levelId_count]: { uid, name, photoURL, time } }
export async function getAllLevelRecords() {
  try {
    const snap = await getDocsFromServer(collection(db, "levelRecords"));
    const records = {};
    snap.forEach((d) => { records[d.id] = d.data(); });
    return records;
  } catch (err) {
    console.warn("[mapTrainer] Load level records failed:", err.message);
    return {};
  }
}
