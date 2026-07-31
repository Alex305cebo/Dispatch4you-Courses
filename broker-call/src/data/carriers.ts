import type { CarrierRecord } from '../types'

// Мок FMCSA. Брокер пробивает названный MC номер и видит ровно это.
//
// Часть записей намеренно проблемные: студент должен на своей шкуре узнать,
// что бывает, когда называешь номер с отозванной авторитетностью или
// conditional-рейтингом. Такому в лекции не научишь.

const RECORDS: readonly CarrierRecord[] = [
  {
    mc: '445566',
    dot: '1284410',
    legalName: 'STAR TRANSPORT LLC',
    authority: 'active',
    safetyRating: 'satisfactory',
    insuranceCargoUsd: 250000,
    insuranceLiabilityUsd: 1000000,
    yearsInBusiness: 8,
    powerUnits: 25,
    crashesLast24mo: 0,
  },
  {
    mc: '1234567',
    dot: '3891204',
    legalName: 'SWIFT DISPATCH CARRIERS INC',
    authority: 'active',
    safetyRating: 'satisfactory',
    insuranceCargoUsd: 100000,
    insuranceLiabilityUsd: 1000000,
    yearsInBusiness: 4,
    powerUnits: 6,
    crashesLast24mo: 1,
  },
  {
    mc: '998877',
    dot: '2210559',
    legalName: 'REDLINE HAULING LLC',
    authority: 'active',
    safetyRating: 'conditional',
    insuranceCargoUsd: 100000,
    insuranceLiabilityUsd: 750000,
    yearsInBusiness: 2,
    powerUnits: 3,
    crashesLast24mo: 4,
    blocker:
      'Conditional safety rating with four recordable crashes in 24 months — this shipper does not allow conditional carriers.',
  },
  {
    mc: '771100',
    dot: '1902884',
    legalName: 'GATEWAY FREIGHT SYSTEMS',
    authority: 'revoked',
    safetyRating: 'unrated',
    insuranceCargoUsd: 0,
    insuranceLiabilityUsd: 0,
    yearsInBusiness: 11,
    powerUnits: 14,
    crashesLast24mo: 2,
    blocker: 'Operating authority is revoked — the carrier cannot legally haul this load.',
  },
  {
    mc: '660044',
    dot: '3455120',
    legalName: 'NORTHBOUND LOGISTICS LLC',
    authority: 'pending',
    safetyRating: 'unrated',
    insuranceCargoUsd: 100000,
    insuranceLiabilityUsd: 1000000,
    yearsInBusiness: 0,
    powerUnits: 2,
    crashesLast24mo: 0,
    blocker:
      'Authority is still pending and the carrier has no safety history — needs 90 days of active authority before this broker can use them.',
  },
]

const BY_MC = new Map(RECORDS.map((r) => [r.mc, r]))

/** Только цифры: студент может сказать «MC 44-55-66» или «эм-си 445566». */
export function normalizeMc(raw: string): string {
  return raw.replace(/\D/g, '')
}

/**
 * Неизвестный MC — не ошибка. В реальности брокер видит незнакомого, но
 * законного перевозчика, и решает по цифрам. Собираем правдоподобную запись
 * детерминированно из самого номера, чтобы один и тот же MC всегда давал
 * один и тот же результат — иначе разбор звонка врал бы.
 */
export function lookupCarrier(rawMc: string): CarrierRecord | null {
  const mc = normalizeMc(rawMc)
  if (mc.length < 4 || mc.length > 8) return null

  const known = BY_MC.get(mc)
  if (known) return known

  const seed = [...mc].reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7) >>> 0
  const years = 1 + (seed % 12)
  const units = 1 + ((seed >> 3) % 40)
  const crashes = (seed >> 7) % 3

  return {
    mc,
    dot: String(1000000 + (seed % 8999999)),
    legalName: 'CARRIER ON FILE',
    authority: 'active',
    safetyRating: crashes >= 2 ? 'conditional' : 'satisfactory',
    insuranceCargoUsd: crashes >= 2 ? 100000 : 100000 + ((seed >> 11) % 3) * 50000,
    insuranceLiabilityUsd: 1000000,
    yearsInBusiness: years,
    powerUnits: units,
    crashesLast24mo: crashes,
    ...(crashes >= 2
      ? {
          blocker:
            'Conditional safety rating — this broker requires a satisfactory rating for high-value freight.',
        }
      : {}),
  }
}
