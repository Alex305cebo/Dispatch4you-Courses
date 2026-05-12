import { useCallback, useRef } from "react";

// ── Генерация звуков через Web Audio API (без внешних файлов) ──

const AudioCtx = window.AudioContext || window.webkitAudioContext;

function getCtx() {
  if (!getCtx._ctx) {
    getCtx._ctx = new AudioCtx();
  }
  return getCtx._ctx;
}

function playTone(freq, duration, type = "sine", volume = 0.3) {
  try {
    const ctx = getCtx();
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    // Мягкий fade-in чтобы убрать щелчок
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Silently fail — звук не критичен
  }
}

function playCorrect() {
  // Мягкий восходящий "дзинь" — тихий и приятный
  playTone(520, 0.15, "sine", 0.12);
  setTimeout(() => playTone(660, 0.2, "sine", 0.1), 100);
}

function playWrong() {
  // Мягкий низкий тон — не раздражающий
  playTone(280, 0.25, "sine", 0.1);
  setTimeout(() => playTone(220, 0.3, "sine", 0.08), 120);
}

function playLevelComplete() {
  // Спокойная мелодия из 4 нот
  const notes = [440, 523, 587, 659]; // A4, C5, D5, E5
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.35, "sine", 0.1), i * 150);
  });
}

function playClick() {
  playTone(480, 0.04, "sine", 0.06);
}

// ── Вибрация (мобильные устройства) ──
function vibrateShort() {
  try { navigator?.vibrate?.(40); } catch {}
}

function vibrateDouble() {
  try { navigator?.vibrate?.([50, 30, 50]); } catch {}
}

function vibrateLevelUp() {
  try { navigator?.vibrate?.([30, 20, 30, 20, 60]); } catch {}
}

// ── Хук ──
export function useSounds() {
  const enabledRef = useRef(
    localStorage.getItem("map-trainer-sound") !== "off"
  );

  const setEnabled = useCallback((val) => {
    enabledRef.current = val;
    localStorage.setItem("map-trainer-sound", val ? "on" : "off");
  }, []);

  const correct = useCallback(() => {
    vibrateShort();
    if (enabledRef.current) playCorrect();
  }, []);

  const wrong = useCallback(() => {
    vibrateDouble();
    if (enabledRef.current) playWrong();
  }, []);

  const levelComplete = useCallback(() => {
    vibrateLevelUp();
    if (enabledRef.current) playLevelComplete();
  }, []);

  const click = useCallback(() => {
    if (enabledRef.current) playClick();
  }, []);

  return {
    correct,
    wrong,
    levelComplete,
    click,
    enabled: enabledRef.current,
    setEnabled,
  };
}
