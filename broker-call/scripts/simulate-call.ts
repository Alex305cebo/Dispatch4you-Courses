/**
 * Прогон звонка текстом через /api/turn — тот же путь, что на боевом сайте.
 *
 * Диспетчер здесь заскриптован реалистичными фразами. Инструменты исполняет
 * тот же CallMachine, что в браузере. На выходе — транскрипт, по которому
 * видно, где брокер говорит не как человек.
 *
 * Запуск: дев-сервер на 5180, затем
 *   npx esbuild scripts/simulate-call.ts --bundle --platform=node --format=esm --outfile=.tmp/sim.mjs && node .tmp/sim.mjs [seed]
 */
import { CallMachine } from '../src/call/CallMachine'
import { makeCallSetup } from '../src/call/makeCall'
import { PICKUP_CUE } from '../src/voice/types'
import { trimHistory } from '../src/voice/history'
import { knownFacts } from '../src/call/knownFacts'

const BASE = 'http://localhost:5180'
const seed = process.argv[2] ?? 'call-007'
const setup = makeCallSetup(seed)
const machine = new CallMachine(setup)
machine.start()

const { broker, load } = setup
console.log(`=== ${broker.name} · ${broker.company} · ${broker.style} ===`)
console.log(`груз ${load.ref}: ${load.origin.city} → ${load.destination.city}, ${load.equipment}, posted $${load.postedRate}, max $${load.maxRate}\n`)

type Msg = { role: string; content?: string; tool_call_id?: string; tool_calls?: unknown[] }
const history: Msg[] = [{ role: 'user', content: PICKUP_CUE }]

async function turn(): Promise<string> {
  for (let hop = 0; hop < 5; hop++) {
    const r = await fetch(`${BASE}/api/turn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seed, messages: trimHistory(history), known: knownFacts(machine.getState(), load) }),
    })
    if (!r.ok) return `[ОШИБКА ${r.status}: ${(await r.text()).slice(0, 200)}]`
    const reply = (await r.json()) as {
      message: Msg
      content: string
      toolCalls: { id: string; name: string; arguments: unknown }[]
    }
    history.push(reply.message)
    if (reply.toolCalls.length) {
      for (const c of reply.toolCalls) {
        const result = machine.execute(c.name, c.arguments)
        console.log(`      ⚙ ${c.name}(${JSON.stringify(c.arguments)}) → ${JSON.stringify(result).slice(0, 110)}`)
        history.push({ role: 'tool', tool_call_id: c.id, content: JSON.stringify(result) })
      }
      continue
    }
    return reply.content.trim()
  }
  return '[цикл инструментов]'
}

const dispatcher = [
  `Hi, this is Alex with Star Transport, MC 445566. I'm calling on your load ${load.ref}, ${load.origin.city} to ${load.destination.city}. Is it still available?`,
  `We run a 53 foot ${load.equipment.replace('_', ' ')}. What's the commodity and the weight on it?`,
  `Okay. And what are the pickup and delivery windows?`,
  `My driver is unloading about 40 miles from ${load.origin.city} right now, he'll be empty in two hours. He makes that pickup no problem.`,
  `What are you paying on it?`,
  `That's a little light for this lane. DAT is showing $${load.marketRatePerMile.toFixed(2)} a mile. I'd need $${Math.round((load.maxRate + 300) / 50) * 50} to make it work.`,
  `I hear you. Meet me in the middle — $${Math.round((load.postedRate + load.maxRate) / 2 / 25) * 25} and he's rolling right now.`,
  `Alright, let's do it. Driver is Juan Lopez, truck 1705, trailer 1184, his cell is 864-555-0142.`,
  `Send the rate con to dispatch@startransport.com.`,
  `Perfect, thank you. Have a good one.`,
]

const opening = await turn()
console.log(`BROKER: ${opening}\n`)
for (const line of dispatcher) {
  console.log(`YOU:    ${line}`)
  machine.noteDispatcherTurn()
  history.push({ role: 'user', content: line })
  const said = await turn()
  console.log(`BROKER: ${said}\n`)
  if (machine.getState().stage === 'ended') break
}
const f = machine.getState().facts
console.log('=== итог ===')
console.log(`MC: ${f.mcNumber} | трейлер: ${f.equipment} | груз показан: ${f.loadPresented} | водитель: ${f.driverLocation}`)
console.log(`ставка: ${f.agreedRate ?? '—'} (последний оффер брокера ${f.currentBrokerOffer ?? '—'}) | букинг: ${JSON.stringify(f.booking)} | rate con: ${f.rateConSentTo ?? '—'} | конец: ${f.endReason ?? '—'}`)
