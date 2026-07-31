import './design/base.css'
import { useCallStore } from './store/useCallStore'
import { Lobby } from './screens/Lobby'
import { IncomingCall } from './screens/IncomingCall'
import { CallScreen } from './screens/CallScreen'
import { Debrief } from './screens/Debrief'

export function App() {
  const phase = useCallStore((s) => s.phase)

  switch (phase) {
    case 'incoming':
      return <IncomingCall />
    case 'call':
      return <CallScreen />
    case 'debrief':
      return <Debrief />
    default:
      return <Lobby />
  }
}
