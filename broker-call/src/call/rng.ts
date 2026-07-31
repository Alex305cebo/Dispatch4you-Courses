/**
 * Детерминированный генератор. Звонок должен воспроизводиться: если разбор
 * говорит «брокер был готов дать ещё $150», это обязано быть правдой и при
 * повторном прогоне той же записи. Math.random() такого не даёт.
 */
export interface Rng {
  next(): number
  int(min: number, max: number): number
  pick<T>(items: readonly T[]): T
  chance(probability: number): boolean
}

export function createRng(seed: string | number): Rng {
  let state =
    typeof seed === 'number'
      ? seed >>> 0
      : ([...seed].reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 17) >>> 0)

  // mulberry32 — короткий, быстрый, с достаточным для нас периодом
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    pick: (items) => {
      if (items.length === 0) throw new Error('pick() from an empty list')
      return items[Math.floor(next() * items.length)]!
    },
    chance: (probability) => next() < probability,
  }
}
