import type { CallState, Equipment, Load } from '../types'
import type { CallSetup } from './makeCall'
import { laneLabel } from '../data/loads'

/**
 * Подсказки на левой панели во время разговора.
 *
 * Зачем. Тренажёр молчал о том, ЧТО вообще надо говорить брокеру, и первый
 * звонок начинался с растерянности: человек снимает трубку, а диспетчер не
 * знает даже, что представиться и назвать MC нужно первой же фразой. Учебник
 * рядом не решает — читать его во время живого разговора некогда.
 *
 * Чем это НЕ является. Это не сценарий и не проверочный список, по которому
 * звонок обязан идти. Брокер по-прежнему ведёт разговор куда хочет, порядок
 * шагов свободный, и ни одна подсказка не мешает сказать что-то своё. Панель
 * только отвечает на вопрос «что от меня сейчас нужно» — и гаснет, как только
 * факт оказался у брокера.
 *
 * Состояние берётся из тех же фактов CallMachine, что и всё остальное: ни одной
 * регулярки по транскрипту, ни одного собственного счётчика.
 */

/** MC, который студент называет брокеру. Живой номер из мока FMCSA: чистая
 * авторитетность и нормальная страховка, так что первый звонок не упирается в
 * отказ по причинам, которых студент ещё не понимает. */
export const TRAINEE_MC = '445566'

export interface Hint {
  id: HintId
  /** Уже сделано — брокер это записал. */
  done: boolean
  /** Заголовок по-русски: что от диспетчера нужно. */
  title: string
  /** Готовая фраза по-английски — то, что можно сказать вслух прямо сейчас. */
  say: string
}

export type HintId = 'intro' | 'equipment' | 'driver' | 'details' | 'rate' | 'booking'

const EQUIPMENT_SAID: Record<Equipment, string> = {
  dry_van: 'dry van',
  reefer: 'reefer',
  flatbed: 'flatbed',
  step_deck: 'step deck',
}

/** Ставка, с которой имеет смысл начинать торг: рынок по лейну плюс запас,
 * округлённый до полусотни. Диспетчер всегда просит выше того, на что готов. */
export function openingAsk(load: Load): number {
  const market = load.marketRatePerMile * load.miles
  const ask = Math.max(load.postedRate, market) * 1.12
  return Math.round(ask / 50) * 50
}

/**
 * Полный список шагов, каждый со своим `done`. Порядок — тот, в котором
 * разговор идёт чаще всего, но выполнять их можно в любом.
 */
export function callHints(setup: CallSetup, state: CallState | null): Hint[] {
  const { load } = setup
  const f = state?.facts
  const booking = f?.booking ?? {}
  const bookingDone = Boolean(
    booking.driverName && booking.truckNumber && booking.driverPhone && booking.email,
  )

  return [
    {
      id: 'intro',
      done: Boolean(f?.carrier),
      title: 'Представьтесь и назовите MC',
      say: `Hi, this is dispatch with Star Transport, MC ${TRAINEE_MC} — calling on load ${load.ref}.`,
    },
    {
      id: 'equipment',
      done: Boolean(f?.equipment),
      title: 'Скажите, какой у вас трейлер',
      say: `We're running a ${EQUIPMENT_SAID[load.equipment]}.`,
    },
    {
      id: 'details',
      done: Boolean(f?.loadPresented),
      title: 'Спросите про груз',
      say: `What's the weight, and what are the pickup and delivery windows?`,
    },
    {
      id: 'driver',
      done: Boolean(f?.driverLocation),
      title: 'Где водитель и когда освободится',
      say: `My driver empties in ${load.origin.city} tonight — he can make your pickup window.`,
    },
    {
      id: 'rate',
      done: Boolean(f?.agreedRate),
      title: 'Торгуйтесь: назовите свою цифру',
      say: `DAT's at $${load.marketRatePerMile.toFixed(2)} a mile on ${laneLabel(load)} — I need $${openingAsk(
        load,
      ).toLocaleString('en-US')} to make it work.`,
    },
    {
      id: 'booking',
      done: bookingDone,
      title: 'Данные для букинга и почта под rate con',
      say: `Driver is Juan Lopez, truck 1705, trailer 1184, cell 864-555-0142 — send the rate con to dispatch@startransport.com.`,
    },
  ]
}

/**
 * Что показать крупно прямо сейчас: первый невыполненный шаг. Всё сделано —
 * null, и панель показывает только историю галочек.
 */
export function currentHint(hints: Hint[]): Hint | null {
  return hints.find((h) => !h.done) ?? null
}
