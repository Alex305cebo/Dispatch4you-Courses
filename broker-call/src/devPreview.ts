import { useCallStore } from './store/useCallStore'
import { makeCallSetup } from './call/makeCall'
import { CallMachine } from './call/CallMachine'

/**
 * `?preview=call` — экран звонка с готовыми данными, без микрофона.
 *
 * Микрофон недоступен во встроенном браузере и в любой автоматике, а вёрстку
 * экрана звонка иначе не увидеть: он открывается только после того, как
 * сокет поднялся и звук пошёл. Только в дев-сборке — в бандл не попадает.
 */
export function installDevPreview(): void {
  if (!import.meta.env.DEV) return
  if (new URLSearchParams(location.search).get('preview') !== 'call') return

  const setup = makeCallSetup('call-044')
  const machine = new CallMachine(setup)
  machine.start()
  machine.execute('lookup_carrier', { mc_number: '445566' })
  machine.noteDispatcherTurn()

  useCallStore.setState({
    phase: 'call',
    setup,
    machine,
    callState: machine.getState(),
    startedAt: Date.now() - 47_000,
    line: 'listening',
    micLevel: 0.4,
    feed: [
      { kind: 'speech', id: 'b1', role: 'broker', text: `${setup.broker.company}, this is ${setup.broker.name.split(' ')[0]}.`, draft: false },
      { kind: 'speech', id: 'd1', role: 'dispatcher', text: `Hi, this is Alex with Star Transport, MC 445566. I'm calling on your load ${setup.load.ref}, is it still available?`, draft: false },
      { kind: 'tool', id: 't1', name: 'lookup_carrier', status: 'done', result: { ok: true } },
      { kind: 'speech', id: 'b2', role: 'broker', text: `Yeah, it's open. What are you running, and where's your driver right now?`, draft: false },
      { kind: 'speech', id: 'd2', role: 'dispatcher', text: "", draft: true },
    ],
  })
}
