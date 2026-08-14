import './design/base.css'
import { useCallStore } from './store/useCallStore'
import { Lobby } from './screens/Lobby'
import { DialScreen } from './screens/DialScreen'
import { CallScreen } from './screens/CallScreen'
import { Debrief } from './screens/Debrief'

export function App() {
  const phase = useCallStore((s) => s.phase)

  switch (phase) {
    case 'dialing':
      return <DialScreen />
    case 'call':
      return <CallScreen />
    case 'debrief':
      return <Debrief />
    default:
      return <Lobby />
  }
}
