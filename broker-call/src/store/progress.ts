/**
 * Прогресс студента. Пока живёт в localStorage — приложение локальное.
 * При встройке в сайт переезжает в Firestore и в существующую XP-систему;
 * форма записи специально совпадает с тем, что там уже хранится.
 */

const KEY = 'broker-call:progress'

/**
 * Прогресс общий, а не по сценарию: сценариев больше нет, каждый звонок —
 * новый брокер и новый груз, и сравнивать их между собой не по чему.
 */
export const CALL_KEY = 'call'

export interface ScenarioProgress {
  attempts: number
  bestScore: number
  lastScore: number
  lastAt: number
}

export type Progress = Record<string, ScenarioProgress>

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Progress) : {}
  } catch {
    // Испорченная запись не должна мешать звонить.
    return {}
  }
}

export function recordAttempt(scenarioId: string, score: number): Progress {
  const progress = loadProgress()
  const previous = progress[scenarioId]
  progress[scenarioId] = {
    attempts: (previous?.attempts ?? 0) + 1,
    bestScore: Math.max(previous?.bestScore ?? 0, score),
    lastScore: score,
    lastAt: Date.now(),
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(progress))
  } catch {
    // Приватный режим — прогресс просто не сохранится, звонок от этого не ломается.
  }
  return progress
}
