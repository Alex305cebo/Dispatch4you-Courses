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
        unlocked:  l.id === 1,
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

  return { progress, syncing, completeLevel, resetProgress };
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
