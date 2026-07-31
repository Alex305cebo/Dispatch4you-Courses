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

  return `You are a dispatcher coach with fifteen years on the desk. You have just listened to a student's call with a freight broker and you are about to tell them how it went.

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

/** Динамическая часть: транскрипт и уже посчитанные кодом числа. */
export function buildDebriefUserMessage(input: DebriefInput): string {
  const transcript = input.transcript
    .map((m) => `${m.role === 'dispatcher' ? 'Dispatcher' : 'Broker'}: ${m.text}`)
    .join('\n')

  return `Scores already calculated:
${JSON.stringify(input.metrics, null, 2)}

Facts recorded during the call:
${JSON.stringify(input.facts, null, 2)}

Transcript:
${transcript}`
}
