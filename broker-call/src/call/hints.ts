import type { CallStage, CallState, Equipment, Load } from '../types'
import type { CallSetup } from './makeCall'
import { laneLabel } from '../data/loads'
import { createRng } from './rng'

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

/**
 * Кто такой студент на этом звонке — одна карточка, из которой берут и
 * подсказки, и панель «Ваши данные» на экране. Брокер спрашивает MC, водителя,
 * номера трака и трейлера, телефон и почту — отвечать по памяти на первом
 * звонке нечем, а искать это по подсказкам, пока брокер ждёт, некогда.
 */
export const TRAINEE = {
  name: 'Alex',
  company: 'Star Transport',
  mc: TRAINEE_MC,
  driver: 'Juan Lopez',
  truck: '1705',
  trailer: '1184',
  cell: '864-555-0142',
  email: 'dispatch@startransport.com',
} as const

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

  // Формулировку выбираем по сиду звонка: она постоянна внутри одного разговора
  // (иначе строка прыгала бы на каждой перерисовке) и разная между звонками.
  // Одна и та же заученная фраза во всех звонках — это заучивание, а не навык.
  const rng = createRng(`hints-${setup.id}`)
  const ask = openingAsk(load).toLocaleString('en-US')
  const equipment = EQUIPMENT_SAID[load.equipment]

  return [
    {
      id: 'intro',
      done: Boolean(f?.carrier),
      title: 'Представьтесь и назовите MC',
      say: rng.pick([
        `Hi, this is dispatch with ${TRAINEE.company}, MC ${TRAINEE.mc} — calling on load ${load.ref}.`,
        `Hey, ${TRAINEE.company} here, MC ${TRAINEE.mc}. I'm calling on ${load.ref}, is it still available?`,
        `Good morning — ${TRAINEE.company}, MC ${TRAINEE.mc}. Calling about your ${laneLabel(load)} load.`,
        `This is ${TRAINEE.name} at ${TRAINEE.company}, MC ${TRAINEE.mc}. Got a truck for load ${load.ref}.`,
      ]),
    },
    {
      id: 'equipment',
      done: Boolean(f?.equipment),
      title: 'Скажите, какой у вас трейлер',
      say: rng.pick([
        `We're running a ${equipment}.`,
        `${equipment}, 53-foot.`,
        `I've got a ${equipment} sitting empty for it.`,
      ]),
    },
    {
      id: 'details',
      done: Boolean(f?.loadPresented),
      title: 'Спросите про груз',
      say: rng.pick([
        `What's the weight, and what are the pickup and delivery windows?`,
        `Can you give me the commodity, the weight and the appointment times?`,
        `What am I picking up, how heavy, and when does it need to deliver?`,
      ]),
    },
    {
      id: 'driver',
      done: Boolean(f?.driverLocation),
      title: 'Где водитель и когда освободится',
      say: rng.pick([
        `My driver empties in ${load.origin.city} tonight — he can make your pickup window.`,
        `Truck goes empty about an hour from ${load.origin.city}, so he makes that pickup easily.`,
        `He's unloading near ${load.origin.city} right now and he's clear after that.`,
      ]),
    },
    {
      id: 'rate',
      done: Boolean(f?.agreedRate),
      title: 'Торгуйтесь: назовите свою цифру',
      say: rng.pick([
        `DAT's at $${load.marketRatePerMile.toFixed(2)} a mile on ${laneLabel(load)} — I need $${ask} to make it work.`,
        `I need $${ask} all-in on this one. Market's sitting at $${load.marketRatePerMile.toFixed(2)} a mile.`,
        `For ${load.miles} miles I'm looking for $${ask}. What can you do?`,
      ]),
    },
    {
      id: 'booking',
      done: bookingDone,
      title: 'Данные для букинга и почта под rate con',
      say: rng.pick([
        `Driver is ${TRAINEE.driver}, truck ${TRAINEE.truck}, trailer ${TRAINEE.trailer}, cell ${TRAINEE.cell} — send the rate con to ${TRAINEE.email}.`,
        `${TRAINEE.driver} driving, truck ${TRAINEE.truck}, trailer ${TRAINEE.trailer}. His cell is ${TRAINEE.cell}, rate con to ${TRAINEE.email}.`,
      ]),
    },
  ]
}

/** Куда звонок дошёл по мнению машины. Нужен, чтобы подсказка не отставала. */
const STAGE_HINT: Partial<Record<CallStage, HintId>> = {
  qualifying: 'equipment',
  load_details: 'details',
  capacity: 'driver',
  negotiation: 'rate',
  booking: 'booking',
  wrap_up: 'booking',
}

/**
 * Что показать крупно прямо сейчас.
 *
 * Обычно это первый невыполненный шаг. Но брокер ведёт разговор сам и может
 * перескочить: на живом звонке он уже просил данные водителя, а на панели
 * висело «торгуйтесь» — потому что ставка формально не записана. Подсказка,
 * отставшая от разговора, хуже, чем её отсутствие: студент отвечает не на тот
 * вопрос. Поэтому если звонок ушёл дальше, показываем шаг по стадии.
 */
export function currentHint(hints: Hint[], stage?: CallStage): Hint | null {
  const pending = hints.filter((h) => !h.done)
  if (pending.length === 0) return null

  const byStage = stage ? STAGE_HINT[stage] : undefined
  if (byStage) {
    const atStage = pending.find((h) => h.id === byStage)
    if (atStage) return atStage
    // Шаг стадии уже закрыт — значит разговор ушёл ещё дальше.
    const order = hints.map((h) => h.id)
    const from = order.indexOf(byStage)
    const ahead = pending.find((h) => order.indexOf(h.id) > from)
    if (ahead) return ahead
  }

  return pending[0] ?? null
}
