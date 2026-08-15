import './shell.css'
import { useCallStore } from '../store/useCallStore'
import { useLangStore, useT } from '../i18n/useT'
import { loadProgress, CALL_KEY } from '../store/progress'
import { BUILD_ID } from '../fatal'
import type { Lang } from '../types'
import { useMemo } from 'react'

/**
 * Начало. Раньше здесь лежал список из восьми сценариев, и каждый из них
 * означал один и тот же разговор при каждом заходе. Сценариев больше нет:
 * есть кнопка «позвонить», и на том конце каждый раз другой человек с другим
 * грузом.
 */
export function Lobby() {
  const t = useT()
  const openDial = useCallStore((s) => s.openDial)
  // Читаем при входе: пока идёт звонок, прогресс всё равно не меняется.
  const progress = useMemo(() => loadProgress()[CALL_KEY], [])

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

      <div className="start">
        <div className="start-inner">
          <div className="start-lead">{t('lobby.lead')}</div>
          <p className="start-about">{t('lobby.about')}</p>

          <button className="call-out" onClick={openDial}>
            {t('lobby.start')}
          </button>

          {progress ? (
            <div className="start-stats">
              <span>
                {t('lobby.attempts')}: <b className="mono">{progress.attempts}</b>
              </span>
              <span>
                {t('lobby.best')}: <b className="mono">{progress.bestScore}</b>
              </span>
            </div>
          ) : (
            <div className="start-stats">{t('lobby.first')}</div>
          )}
        </div>
      </div>
    </div>
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
