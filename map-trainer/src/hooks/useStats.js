import { useState, useCallback } from "react";

/**
 * Статистика по штатам — запоминает ошибки для показа в ResultScreen.
 */
export function useStats() {
  // { stateId: { name, wrong: number, correct: number } }
  const [stateStats, setStateStats] = useState({});

  const recordResult = useCallback((stateId, stateName, correct) => {
    setStateStats((prev) => {
      const cur = prev[stateId] || { name: stateName, wrong: 0, correct: 0 };
      return {
        ...prev,
        [stateId]: {
          ...cur,
          wrong:   cur.wrong   + (correct ? 0 : 1),
          correct: cur.correct + (correct ? 1 : 0),
        },
      };
    });
  }, []);

  const reset = useCallback(() => setStateStats({}), []);

  // Топ-5 проблемных штатов (по количеству ошибок)
  const weakStates = Object.entries(stateStats)
    .filter(([, v]) => v.wrong > 0)
    .sort((a, b) => b[1].wrong - a[1].wrong)
    .slice(0, 5)
    .map(([id, v]) => ({ id, ...v }));

  return { stateStats, weakStates, recordResult, reset };
}
