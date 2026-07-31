import type { Load } from '../types'
import { ratePerMile } from './loads'

export interface MarketQuote {
  lane: string
  equipment: string
  avgPerMile: number
  lowPerMile: number
  highPerMile: number
  /** Куда двигался рынок за последние 7 дней, в процентах. */
  trendPct: number
  loadToTruckRatio: number
  /** Сколько «стоит» груз по рынку целиком — то, чем торгуется диспетчер. */
  suggestedTotal: number
}

/**
 * Мок DAT. Цифры выводятся из самого груза, а не из случайности: один и тот же
 * лейн всегда даёт одну и ту же котировку, иначе разбор звонка («ты согласился
 * на $200 ниже рынка») врал бы от запуска к запуску.
 */
export function getMarketQuote(load: Load): MarketQuote {
  const avg = load.marketRatePerMile
  const spread = Math.max(0.12, avg * 0.08)

  const seed = [...load.id].reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 11) >>> 0
  const trendPct = ((seed % 90) - 40) / 10 // −4.0 … +4.9 %
  const ratio = 1 + (seed % 70) / 10 // 1.0 … 7.9 загрузок на трак

  return {
    lane: `${load.origin.city}, ${load.origin.state} → ${load.destination.city}, ${load.destination.state}`,
    equipment: load.equipmentNote ?? load.equipment,
    avgPerMile: round2(avg),
    lowPerMile: round2(avg - spread),
    highPerMile: round2(avg + spread),
    trendPct: Math.round(trendPct * 10) / 10,
    loadToTruckRatio: Math.round(ratio * 10) / 10,
    suggestedTotal: Math.round((avg * load.miles) / 25) * 25,
  }
}

/** Насколько согласованная ставка отличается от рынка — для разбора звонка. */
export function rateVsMarket(agreed: number, load: Load) {
  const quote = getMarketQuote(load)
  const perMile = ratePerMile(agreed, load)
  return {
    perMile,
    deltaTotal: agreed - quote.suggestedTotal,
    deltaPerMile: round2(perMile - quote.avgPerMile),
    /** Сколько брокер был готов доплатить сверх согласованного. */
    leftOnTable: Math.max(0, load.maxRate - agreed),
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
