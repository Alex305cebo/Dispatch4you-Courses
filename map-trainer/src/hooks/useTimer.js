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
