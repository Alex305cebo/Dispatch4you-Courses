import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Таймер обратного отсчёта.
 * @param {number|null} seconds — начальное время (null = выключен)
 * @param {function} onExpire — вызывается когда время вышло
 */
export function useTimer(seconds, onExpire) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [running, setRunning]   = useState(false);
  const [paused, setPaused]     = useState(false);
  const intervalRef = useRef(null);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const clear = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const start = useCallback(() => {
    if (!seconds) return;
    setTimeLeft(seconds);
    setRunning(true);
    setPaused(false);
  }, [seconds]);

  const stop = useCallback(() => {
    clear();
    setRunning(false);
    setPaused(false);
  }, []);

  const pause = useCallback(() => {
    if (running && !paused) {
      clear();
      setPaused(true);
    }
  }, [running, paused]);

  const resume = useCallback(() => {
    if (running && paused) {
      setPaused(false);
    }
  }, [running, paused]);

  const reset = useCallback(() => {
    clear();
    setTimeLeft(seconds);
    setRunning(false);
    setPaused(false);
  }, [seconds]);

  useEffect(() => {
    if (!running || !seconds || paused) return;
    clear();
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clear();
          setRunning(false);
          setPaused(false);
          onExpireRef.current?.();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return clear;
  }, [running, seconds, paused]);

  // Процент оставшегося времени
  const pct = seconds ? (timeLeft / seconds) * 100 : 100;
  const color = pct > 50 ? "#22c55e" : pct > 25 ? "#f97316" : "#ef4444";

  return { timeLeft, pct, color, start, stop, reset, pause, resume, running, paused };
}

// ── Секундомер сессии (считает вверх) ─────────────────────────
// Запускается при старте квиза, останавливается при завершении.
// Возвращает elapsed seconds.
export function useSessionTimer() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const start = useCallback(() => {
    startTimeRef.current = Date.now() - elapsed * 1000;
    setRunning(true);
  }, [elapsed]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setElapsed(0);
    setRunning(false);
    startTimeRef.current = null;
  }, []);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  return { elapsed, running, start, stop, reset };
}
