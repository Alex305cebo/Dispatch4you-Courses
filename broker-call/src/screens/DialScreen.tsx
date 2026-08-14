import { useState } from 'react'
import './shell.css'
import { useCallStore } from '../store/useCallStore'
import { getBroker } from '../data/brokers'
import { useLocalized, useT } from '../i18n/useT'
import { unlockAudio } from '../voice/audioUnlock'

/**
 * Набор номера — единственный экран, где студент что-то нажимает.
 *
 * Звонит диспетчер, а не ему: он набирает брокера, слышит гудки и ждёт, пока
 * там снимут трубку. Раньше здесь стоял «Входящий вызов» с кнопкой «Ответить» —
 * это переворачивало роли с ног на голову ещё до первого слова.
 *
 * Убрать касание нельзя технически: браузеры не отдают микрофон и не разрешают
 * воспроизведение звука без жеста пользователя.
 */
export function DialScreen() {
  const t = useT()
  const localized = useLocalized()
  const { scenario, placeCall } = useCallStore()
  const [dialing, setDialing] = useState(false)

  if (!scenario) return null
  const broker = getBroker(scenario.brokerId)

  return (
    <div className="dial">
      <div className="dial-inner">
        <div className="dial-label">{t('dial.label')}</div>

        <div>
          <div className="dial-name">{broker.name}</div>
          <div className="dial-company">{broker.company}</div>
        </div>

        <p className="dial-objective">{localized(scenario.objective)}</p>

        <button
          className="call-out"
          disabled={dialing}
          onClick={() => {
            // Первым делом и строго синхронно: iOS отдаёт звук только тому,
            // что стартовало внутри жеста. Всё, что после первого await, —
            // уже поздно, и брокер остался бы немым без единой ошибки.
            unlockAudio()
            setDialing(true)
            void placeCall()
          }}
        >
          {t('dial.call')}
        </button>

        <div>
          <div className="dial-hint">{t('dial.hint')}</div>
          <div className="dial-mic">{t('dial.mic')}</div>
        </div>
      </div>
    </div>
  )
}
