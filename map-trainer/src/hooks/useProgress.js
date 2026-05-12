// ═══════════════════════════════════════════════════════════
//  useProgress.js
//  Прогресс хранится в localStorage (быстро) +
//  синхронизируется с Firestore (надёжно, между устройствами)
// ═══════════════════════════════════════════════════════════
import { useState, useCallback, useEffect, useRef } from "react";
import { LEVELS } from "../data/levels";
import {
  loadProgressFromFirestore,
  saveProgressToFirestore,
  syncXpToUserProfile,
  initUserInLeaderboard,
} from "../firebase/progressService";

const STORAGE_KEY = "usa_map_trainer_progress";

// XP-пороги для разблокировки уровней
// Уровни 1-2: открыты сразу
// После 4-го уровня — значительно сложнее
export const XP_THRESHOLDS = { 3: 350, 4: 450, 5: 600, 6: 1000, 7: 1500, 8: 2100, 9: 3000, 10: 4000 };

function unlockByXp(progress) {
  for (const [lvlId, threshold] of Object.entries(XP_THRESHOLDS)) {
    const id = Number(lvlId);
    if (progress.xp >= threshold && progress.levels[id]) {
      progress.levels[id].unlocked = true;
    }
  }
}

// ── Локальные утилиты ────────────────────────────────────────
function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocal(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function initProgress() {
  return {
    xp:           0,
    totalCorrect: 0,
    totalWrong:   0,
    streak:       0,
    lastPlayDate: null,
    levels: LEVELS.reduce((acc, l) => {
      acc[l.id] = {
        unlocked:  l.id <= 2, // Первые 2 уровня открыты сразу
        bestPct:   0,
        bestScore: 0,
        attempts:  0,
        completed: false,
      };
      return acc;
    }, {}),
  };
}

// ── Хук ─────────────────────────────────────────────────────
export function useProgress(uid = null, userData = null) {
  const [progress,  setProgress]  = useState(() => loadLocal() || initProgress());
  const [syncing,   setSyncing]   = useState(false);
  const saveTimerRef = useRef(null);

  // ── Админ-режим: localhost + ?admin=1 → всё открыто ──────────
  const isAdmin = typeof window !== "undefined"
    && window.location.hostname === "localhost"
    && new URLSearchParams(window.location.search).get("admin") === "1";

  // ── При смене uid — загружаем из Firestore ──────────────────
  useEffect(() => {
    if (!uid) return;

    setSyncing(true);
    
    // Инициализируем пользователя в рейтинге с текущим XP
    const currentProgress = loadLocal() || initProgress();
    initUserInLeaderboard(uid, userData, currentProgress.xp);
    
    loadProgressFromFirestore(uid).then((remote) => {
      if (remote) {
        // Мержим: берём лучшее из локального и удалённого
        const local = loadLocal() || initProgress();
        const merged = mergeProgress(local, remote);
        // Разблокируем уровни по XP
        unlockByXp(merged);
        saveLocal(merged);
        setProgress(merged);
        
        // Обновляем рейтинг с правильным XP
        initUserInLeaderboard(uid, userData, merged.xp);
      }
      setSyncing(false);
    });
  }, [uid, userData]);

  // ── Дебаунс сохранения в Firestore (не чаще раза в 3 сек) ──
  const scheduleSave = useCallback((data) => {
    if (!uid) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveProgressToFirestore(uid, data, userData);
    }, 3000);
  }, [uid, userData]);

  // ── Завершить уровень ────────────────────────────────────────
  const completeLevel = useCallback((levelId, pct, score, xpEarned) => {
    setProgress((prev) => {
      const levelData = prev.levels[levelId] || {};
      const isNewBest = pct > (levelData.bestPct || 0);
      const passed    = pct >= (LEVELS.find((l) => l.id === levelId)?.unlockPct || 0);

      const nextId    = levelId + 1;
      const nextLevel = prev.levels[nextId];

      const newLevels = {
        ...prev.levels,
        [levelId]: {
          ...levelData,
          unlocked:  true,
          bestPct:   isNewBest ? pct : levelData.bestPct,
          bestScore: isNewBest ? score : levelData.bestScore,
          attempts:  (levelData.attempts || 0) + 1,
          completed: passed || levelData.completed,
        },
      };

      if (passed && nextLevel && !nextLevel.unlocked) {
        newLevels[nextId] = { ...nextLevel, unlocked: true };
      }

      // Стрик
      const today     = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const lastDate  = prev.lastPlayDate;
      const newStreak =
        lastDate === yesterday ? prev.streak + 1 :
        lastDate === today     ? prev.streak     : 1;

      const newProgress = {
        ...prev,
        xp:           prev.xp + xpEarned,
        totalCorrect: prev.totalCorrect + Math.round(score),
        streak:       newStreak,
        lastPlayDate: today,
        levels:       newLevels,
      };

      // Разблокировка уровней по XP
      // Уровни 1-2: открыты сразу
      // Уровень 3: 100 XP, 4: 250 XP, 5: 500 XP, 6: 800 XP, 7: 1200 XP, 8: 1700 XP
      const XP_THRESHOLDS = { 3: 100, 4: 250, 5: 500, 6: 800, 7: 1200, 8: 1700, 9: 3000, 10: 4000 };
      for (const [lvlId, threshold] of Object.entries(XP_THRESHOLDS)) {
        const id = Number(lvlId);
        if (newProgress.xp >= threshold && newProgress.levels[id] && !newProgress.levels[id].unlocked) {
          newProgress.levels[id] = { ...newProgress.levels[id], unlocked: true };
        }
      }

      saveLocal(newProgress);
      scheduleSave(newProgress);

      // Синхронизируем XP с общим профилем пользователя
      if (uid && xpEarned > 0) {
        syncXpToUserProfile(uid, newProgress.xp);
      }

      return newProgress;
    });
  }, [uid, scheduleSave]);

  // ── Сброс прогресса ──────────────────────────────────────────
  const resetProgress = useCallback(() => {
    const fresh = initProgress();
    saveLocal(fresh);
    setProgress(fresh);
    if (uid) {
      saveProgressToFirestore(uid, fresh, userData);
    }
  }, [uid, userData]);

  return {
    progress: isAdmin ? makeAdminProgress(progress) : progress,
    syncing,
    completeLevel,
    resetProgress,
  };
}

// ── Админский прогресс: все уровни открыты и пройдены ──────
function makeAdminProgress(real) {
  return {
    ...real,
    xp: Math.max(real.xp, 2400),
    levels: LEVELS.reduce((acc, l) => {
      acc[l.id] = {
        unlocked: true,
        bestPct: Math.max(real.levels?.[l.id]?.bestPct || 0, 85),
        bestScore: 17,
        attempts: Math.max(real.levels?.[l.id]?.attempts || 0, 1),
        completed: true,
      };
      return acc;
    }, {}),
  };
}

// ── Мерж локального и удалённого прогресса ──────────────────
// Берём лучший результат по каждому уровню
function mergeProgress(local, remote) {
  const merged = {
    xp:           Math.max(local.xp || 0, remote.xp || 0),
    totalCorrect: Math.max(local.totalCorrect || 0, remote.totalCorrect || 0),
    totalWrong:   Math.max(local.totalWrong || 0, remote.totalWrong || 0),
    streak:       Math.max(local.streak || 0, remote.streak || 0),
    lastPlayDate: local.lastPlayDate || remote.lastPlayDate,
    levels:       {},
  };

  const allIds = new Set([
    ...Object.keys(local.levels || {}),
    ...Object.keys(remote.levels || {}),
  ]);

  for (const id of allIds) {
    const l = local.levels?.[id]  || {};
    const r = remote.levels?.[id] || {};
    merged.levels[id] = {
      unlocked:  l.unlocked  || r.unlocked  || false,
      bestPct:   Math.max(l.bestPct  || 0, r.bestPct  || 0),
      bestScore: Math.max(l.bestScore || 0, r.bestScore || 0),
      attempts:  Math.max(l.attempts  || 0, r.attempts  || 0),
      completed: l.completed || r.completed || false,
    };
  }

  return merged;
}
