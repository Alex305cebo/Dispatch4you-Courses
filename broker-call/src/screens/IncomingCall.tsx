import { useState } from 'react'
import './shell.css'
import { useCallStore } from '../store/useCallStore'
import { getBroker } from '../data/brokers'
import { useLocalized, useT } from '../i18n/useT'
import { unlockAudio } from '../voice/audioUnlock'

/**
 * Входящий вызов — единственный экран, где студент что-то нажимает.
 *
 * Убрать это касание нельзя технически: браузеры не отдают микрофон и не
 * разрешают воспроизведение звука без жеста пользователя. Зато оно честно
 * притворяется тем, чем является в жизни — снятой трубкой.
 */
export function IncomingCall() {
  const t = useT()
  const localized = useLocalized()
  const { scenario, answer } = useCallStore()
  const [answering, setAnswering] = useState(false)

  if (!scenario) return null
  const broker = getBroker(scenario.brokerId)

  return (
    <div className="incoming">
      <div className="incoming-inner">
        <div className="incoming-label">{t('incoming.incoming')}</div>

        <div>
          <div className="incoming-name">{broker.name}</div>
          <div className="incoming-company">{broker.company}</div>
        </div>

        <p className="incoming-objective">{localized(scenario.objective)}</p>

        <button
          className="answer"
          disabled={answering}
          onClick={() => {
            // Первым делом и строго синхронно: iOS отдаёт звук только тому,
            // что стартовало внутри жеста. Всё, что после первого await, —
            // уже поздно, и брокер остался бы немым без единой ошибки.
            unlockAudio()
            setAnswering(true)
            void answer()
          }}
        >
          {t('incoming.answer')}
        </button>

        <div>
          <div className="incoming-hint">{t('incoming.hint')}</div>
          <div className="incoming-mic">{t('incoming.mic')}</div>
        </div>
      </div>
    </div>
  )
}
