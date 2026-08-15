import { describe, expect, it } from 'vitest'
import { equipmentLabel } from './loads'
import { makeCallSetup } from '../call/makeCall'
import { CALL_SEEDS } from '../call/seeds'
import type { Load } from '../types'

const load = (equipment: Load['equipment'], equipmentNote?: string) =>
  ({ equipment, equipmentNote }) as Load

describe('трейлер на карточке борда', () => {
  it('не повторяет тип, когда пометка с него и начинается', () => {
    // На экране было «reefer · reefer, continuous -10°F».
    expect(equipmentLabel(load('reefer', 'reefer, continuous -10°F'))).toBe(
      'reefer, continuous -10°F',
    )
  })

  it('дописывает пометку, когда она про другое', () => {
    expect(equipmentLabel(load('flatbed', 'tarps required'))).toBe('flatbed · tarps required')
  })

  it('без пометки отдаёт тип человеческим написанием', () => {
    expect(equipmentLabel(load('dry_van'))).toBe('dry van')
    expect(equipmentLabel(load('step_deck'))).toBe('step deck')
  })

  it('ни в одном звонке из набора тип не задваивается', () => {
    for (const seed of CALL_SEEDS) {
      const value = equipmentLabel(makeCallSetup(seed).load)
      expect(value).not.toMatch(/\b(\w+)\b.*·\s*\1\b/)
    }
  })
})
