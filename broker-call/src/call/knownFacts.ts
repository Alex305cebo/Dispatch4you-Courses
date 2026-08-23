import type { CallState, Load } from '../types'

/**
 * Что брокер уже знает — одной строкой для системного промпта.
 *
 * История разговора уходит в модель обрезанной (последние 14 сообщений), и к
 * пятому ходу проверка MC из окна выпадает. На живом прогоне брокер дважды
 * переспросил номер, названный первой же фразой, — он его честно забыл.
 * Эта сводка идёт с каждым ходом и от обрезки не зависит: факты берутся из
 * CallMachine, а не из текста.
 *
 * Сюда же — ставка с борда: на «what are you paying» модель называла рынок,
 * потому что цифра с борда осталась где-то в обрезанном результате инструмента.
 */
export function knownFacts(state: CallState | null, load: Load): string {
  const f = state?.facts
  const lines: string[] = []

  lines.push(`Your posted rate on this load: $${load.postedRate.toLocaleString('en-US')}. That is the number you quote when asked what it pays.`)

  if (f?.carrier) {
    lines.push(
      `Their MC ${f.carrier.mc} (${f.carrier.legalName}) is already given and already run${
        f.carrier.blocker ? ' — NOT approved' : ' — checks out'
      }. Do not ask for it again.`,
    )
  }
  if (f?.equipment) lines.push(`Their equipment: ${f.equipment.replace('_', ' ')}. Already given.`)
  if (f?.driverLocation) {
    lines.push(
      `Their driver: ${f.driverLocation}${
        f.driverCanMakePickup === true
          ? ', makes the pickup'
          : f.driverCanMakePickup === false
            ? ', does NOT make the pickup'
            : ''
      }. Already given.`,
    )
  }
  if (f?.loadPresented) lines.push('You have already given them the load details.')

  if (f?.agreedRate) {
    lines.push(`Rate AGREED at $${f.agreedRate.toLocaleString('en-US')}. Closed — do not reopen.`)
  } else if (f?.currentBrokerOffer) {
    lines.push(`Rate NOT agreed yet. Your current position: $${f.currentBrokerOffer.toLocaleString('en-US')}.`)
  }

  const b = f?.booking ?? {}
  const have = [
    b.driverName && `driver ${b.driverName}`,
    b.truckNumber && `truck ${b.truckNumber}`,
    b.trailerNumber && `trailer ${b.trailerNumber}`,
    b.driverPhone && `cell ${b.driverPhone}`,
    b.email && `email ${b.email}`,
  ].filter(Boolean)
  if (have.length) lines.push(`Booking details already given: ${have.join(', ')}.`)
  if (f?.rateConSentTo) lines.push(`Rate con already sent to ${f.rateConSentTo}.`)

  return `WHAT YOU ALREADY HAVE (from your own screen — never ask for any of it again):\n- ${lines.join('\n- ')}`
}
