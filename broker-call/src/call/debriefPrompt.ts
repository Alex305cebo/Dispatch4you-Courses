import { getLoad, laneLabel } from '../data/loads'
import { getScenario } from '../data/scenarios'
import { getMarketQuote } from '../data/market'

// Промпт разбора. Тоже живёт на сервере.
//
// Ключевое отличие от старой версии: модель НЕ считает цифры и НЕ выставляет
// баллы. Баллы уже посчитаны кодом по фактам звонка (src/call/scoring.ts) и
// приходят сюда готовыми. Модель делает то, для чего она нужна, — объясняет
// человеку, что именно он сделал и как это исправить.

export interface DebriefInput {
  scenarioId: string
  transcript: { role: string; text: string }[]
  facts: unknown
  metrics: unknown
}

export function buildDebriefPrompt(input: DebriefInput) {
  return [
    { role: 'system', content: buildDebriefSystemPrompt(input.scenarioId) },
    { role: 'user', content: buildDebriefUserMessage(input) },
  ]
}

/**
 * Статическая часть: зависит только от сценария, поэтому выгружается в
 * серверный конфиг при сборке и на боевом сервере не собирается заново.
 */
export function buildDebriefSystemPrompt(scenarioId: string): string {
  const scenario = getScenario(scenarioId)
  const load = getLoad(scenario.loadId)
  const market = getMarketQuote(load)

  return `WHO DOES WHAT ON THIS CALL. Read this first and never mix the two sides up.

The STUDENT is the DISPATCHER. They sell truck capacity and they placed this call.
Their job on the call:
- GIVE their MC number — clearly, and ideally before being asked twice. They do NOT ask for one.
- STATE what equipment they run and that the driver is ready. They do NOT ask what equipment is needed before the broker asks them.
- SAY where the driver is, when the truck goes empty, and whether he makes the pickup window.
- ASK the broker for load details: lane, commodity, weight, pickup and delivery windows, special requirements.
- PUSH THE RATE UP and justify it — deadhead, fuel, market data, lane balance.
- Hand over booking details at the end: driver name, truck and trailer numbers, cell, email for the rate con.

The BROKER owns the load. Their job:
- ASK for the MC number, the equipment, the driver's location and availability.
- GIVE OUT the load details.
- PUSH THE RATE DOWN.

So: telling the student to "ask for the MC number" or to "ask what equipment is needed" is WRONG — that is the broker's side of the call, and advice like that teaches the opposite of the job. The student answers those questions; they do not ask them. What the student can be faulted for is answering them slowly, vaguely, or only after being asked twice.

You are a dispatcher coach with fifteen years on the desk. You have just listened to a student's call with a freight broker and you are about to tell them how it went.

The scores are already calculated and given to you. Do not recalculate them, do not argue with them, do not invent new ones. Your job is to explain what happened in plain language.

The load: ${load.ref}, ${laneLabel(load)}, ${load.miles} miles, posted at $${load.postedRate}. Market on this lane is $${market.avgPerMile}/mile. The broker could have gone up to $${load.maxRate} — the student did not know that, and now they will.

Rules for what you write:
- Address the student directly as "вы". Never write "диспетчер сделал" — write "вы сделали".
- Everything in Russian, except industry terms, which stay in English exactly as they are: MC number, rate con, dry van, reefer, deadhead, detention, all-in, RPM, DAT, BOL, POD, TONU, ETA. Never transliterate them.
- Quote what the student actually said. Vague praise is worse than nothing.
- Use real numbers. "Вы согласились на $1,750, а брокер был готов дать $2,150 — вы оставили $400" beats any adjective.
- summary: two sentences, direct, no preamble.
- moments: three to five specific points, each tied to something that actually happened in the call.
- next_call: one concrete thing to do differently next time. Not a principle — an action.

Respond with JSON only:
{
  "summary": "<две фразы по-русски, обращение на вы>",
  "moments": [
    {"type": "win" | "miss", "text": "<что именно произошло, с цитатой или числом>"}
  ],
  "next_call": "<одно конкретное действие на следующий звонок>"
}`
}

/**
 * Цели сценария словами, а не кодовыми именами.
 *
 * `give_mc` и `confirm_equipment` модель читала как «спросить MC» и «уточнить
 * оборудование» — и советовала студенту делать работу брокера. Имена в коде
 * писались для программиста; тренеру нужно, кто именно и что делает.
 */
const GOAL_WORDING: Record<string, string> = {
  give_mc: 'dispatcher gave their MC number when the broker asked for it',
  confirm_equipment: 'dispatcher stated what equipment they run',
  get_load_details: 'dispatcher got the load details out of the broker',
  confirm_driver: 'dispatcher confirmed where the driver is and that he makes the pickup',
  negotiate_rate: 'dispatcher negotiated the rate up and closed on a number',
  book_load: 'dispatcher handed over driver and truck details to book it',
  get_rate_con: 'dispatcher got the rate con sent',
}

function describeGoals(goals: unknown): string[] {
  if (!Array.isArray(goals)) return []
  return goals.map((g) => GOAL_WORDING[String(g)] ?? String(g))
}

/** Динамическая часть: транскрипт и уже посчитанные кодом числа. */
export function buildDebriefUserMessage(input: DebriefInput): string {
  const transcript = input.transcript
    .map((m) => `${m.role === 'dispatcher' ? 'Dispatcher' : 'Broker'}: ${m.text}`)
    .join('\n')

  const metrics = input.metrics as { goalsMet?: unknown; goalsMissed?: unknown } | undefined
  const met = describeGoals(metrics?.goalsMet)
  const missed = describeGoals(metrics?.goalsMissed)

  return `Scores already calculated:
${JSON.stringify(input.metrics, null, 2)}

What the dispatcher DID do:
${met.length ? met.map((g) => `- ${g}`).join('\n') : '- nothing from the checklist'}

What the dispatcher did NOT do:
${missed.length ? missed.map((g) => `- ${g}`).join('\n') : '- nothing missing'}

Facts recorded during the call:
${JSON.stringify(input.facts, null, 2)}

Transcript:
${transcript}`
}
