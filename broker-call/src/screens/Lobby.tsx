import './shell.css'
import { SCENARIOS } from '../data/scenarios'
import { getBroker } from '../data/brokers'
import { useCallStore } from '../store/useCallStore'
import { useLangStore, useLocalized, useT } from '../i18n/useT'
import { loadProgress } from '../store/progress'
import { BUILD_ID } from '../fatal'
import type { Lang } from '../types'
import { useMemo } from 'react'

export function Lobby() {
  const t = useT()
  const localized = useLocalized()
  const openDial = useCallStore((s) => s.openDial)
  // Читаем при входе в список: пока идёт звонок, прогресс всё равно не меняется.
  const progress = useMemo(() => loadProgress(), [])

  return (
    <div className="shell">
      <header className="shell-head">
        <div>
          <div className="shell-title">{t('app.title')}</div>
          <div className="shell-sub">{t('app.subtitle')}</div>
        </div>
        <LangSwitch />
      </header>

      {/* Отпечаток сборки: вопрос «а ты точно обновил страницу» решается
          взглядом, а не перепиской. */}
      <div className="build-id mono">{BUILD_ID}</div>

      <div className="scroll">
        <div className="calls">
          {SCENARIOS.map((scenario, index) => {
            const broker = getBroker(scenario.brokerId)
            return (
              <button
                key={scenario.id}
                className="call-card"
                onClick={() => openDial(scenario.id)}
              >
                <span className="call-card-index mono">{String(index + 1).padStart(2, '0')}</span>
                <span>
                  <span className="call-card-title">{localized(scenario.title)}</span>
                  <span className="call-card-who">
                    {broker.name} · {broker.company}
                    {progress[scenario.id] ? (
                      <>
                        {' · '}
                        <span className="call-card-best mono">
                          {t('lobby.best')} {progress[scenario.id]!.bestScore}
                        </span>
                      </>
                    ) : null}
                  </span>
                </span>
                <Difficulty level={scenario.difficulty} />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Difficulty({ level }: { level: number }) {
  return (
    <span className="difficulty" aria-label={`difficulty ${level} of 4`}>
      {[1, 2, 3, 4].map((n) => (
        <span key={n} data-on={n <= level} />
      ))}
    </span>
  )
}

export function LangSwitch() {
  const { lang, setLang } = useLangStore()
  return (
    <div className="lang-switch">
      {(['ru', 'en'] as Lang[]).map((code) => (
        <button key={code} aria-pressed={lang === code} onClick={() => setLang(code)}>
          {code}
        </button>
      ))}
    </div>
  )
}
