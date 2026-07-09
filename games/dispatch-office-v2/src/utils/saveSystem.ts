// ═══════════════════════════════════════════════════════
//  saveSystem.ts — сохранение/загрузка прогресса
//  localStorage (всегда) + Firestore (если авторизован)
// ═══════════════════════════════════════════════════════
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import { useGameStore } from '@/store/gameStore';
import type { GameSession } from '@/types';

const LOCAL_KEY = 'dispatch-office-v2-save';
const SAVE_VERSION = 5; // reset: dark map, no rotation, old project style

interface SaveData {
  version: number;
  session: GameSession;
  savedAt: number;
}

// ─── LOCAL STORAGE ───

export function saveToLocal(): boolean {
  const session = useGameStore.getState().session;
  if (!session) return false;

  try {
    const data: SaveData = {
      version: SAVE_VERSION,
      session: { ...session, lastPlayedAt: Date.now() },
      savedAt: Date.now(),
    };
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.warn('[Save] localStorage failed:', e);
    return false;
  }
}

export function loadFromLocal(): GameSession | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    const data: SaveData = JSON.parse(raw);
    if (data.version !== SAVE_VERSION) return null;
    return data.session;
  } catch {
    return null;
  }
}

export function hasSaveLocal(): boolean {
  try {
    return localStorage.getItem(LOCAL_KEY) !== null;
  } catch {
    return false;
  }
}

export function clearLocalSave(): void {
  try {
    localStorage.removeItem(LOCAL_KEY);
  } catch {}
}

// ─── FIREBASE (Firestore) ───

export async function saveToCloud(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;

  const session = useGameStore.getState().session;
  if (!session) return false;

  try {
    // Firestore не принимает undefined — очищаем
    const cleanSession = JSON.parse(JSON.stringify(session));
    const data: SaveData = {
      version: SAVE_VERSION,
      session: { ...cleanSession, lastPlayedAt: Date.now() },
      savedAt: Date.now(),
    };
    await setDoc(doc(db, 'dispatch-v2-saves', user.uid), data);
    return true;
  } catch (e) {
    console.warn('[Save] Firestore failed:', e);
    return false;
  }
}

export async function loadFromCloud(): Promise<GameSession | null> {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const snap = await getDoc(doc(db, 'dispatch-v2-saves', user.uid));
    if (!snap.exists()) return null;
    const data = snap.data() as SaveData;
    if (data.version !== SAVE_VERSION) return null;
    return data.session;
  } catch (e) {
    console.warn('[Save] Firestore load failed:', e);
    return null;
  }
}

// ─── AUTO-SAVE (вызывается из TickEngine) ───

let lastAutoSave = 0;
const AUTO_SAVE_INTERVAL = 60000; // 60 секунд реального времени

export function autoSave(): void {
  const now = Date.now();
  if (now - lastAutoSave < AUTO_SAVE_INTERVAL) return;
  lastAutoSave = now;

  saveToLocal();

  // Cloud save если авторизован (не блокирует)
  if (auth.currentUser) {
    saveToCloud().catch(() => {});
  }
}

// ─── LOAD BEST SAVE (local vs cloud) ───

export async function loadBestSave(): Promise<GameSession | null> {
  const local = loadFromLocal();
  const cloud = await loadFromCloud();

  if (!local && !cloud) return null;
  if (!cloud) return local;
  if (!local) return cloud;

  // Берём более свежее
  return local.lastPlayedAt >= cloud.lastPlayedAt ? local : cloud;
}
