import { useEffect, useMemo, useRef, useState } from 'react'
import './call.css'
import {
  useCallStore,
  type LineState,
  type SpeechItem,
  type ToolItem,
} from '../store/useCallStore'
import { getBroker } from '../data/brokers'
import { getLoad, laneLabel } from '../data/loads'
import { useT } from '../i18n/useT'
import type { TranslationKey } from '../i18n'
import { ToolCard } from '../components/ToolCard'

/**
 * Экран звонка.
 *
 * За весь разговор здесь нечего нажимать — в этом вся идея. Две зоны:
 * слева собеседник (живой индикатор, состояние линии, что он уже записал),
 * справа сам разговор. На узком экране левая сжимается в шапку.
 */
export function CallScreen() {
  const t = useT()
  const { scenario, callState, feed, line, micLevel, error, startedAt, endCall } = useCallStore()
  const feedRef = useRef<HTMLDivElement>(null)

  // Esc — единственная клавиша. Звонок и так закончится сам.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') endCall()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [endCall])

  useEffect(() => {
    const el = feedRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [feed])

  if (!scenario) return null
  const broker = getBroker(scenario.brokerId)
  const lastSpeechId = [...feed].reverse().find((i) => i.kind === 'speech')?.id

  return (
    <div className="call">
      <aside className="call-side">
        <Orb state={line} level={micLevel} />

        <div className="call-id">
          <div className="call-name">{broker.name}</div>
          <div className="call-company">{broker.company}</div>
        </div>

        <div className="call-status" data-state={line}>
          <span className="dot" />
          <span className="label-text">{t(LINE_LABEL[line])}</span>
          <CallTimer startedAt={startedAt} />
        </div>

        <CallFacts scenarioLoadId={scenario.loadId} />

        <div className="call-side-spacer" />

        <button className="call-end" onClick={endCall}>
          {t('call.end')}
        </button>
      </aside>

      <main className="call-main">
        <div className="scroll" ref={feedRef}>
          <div className="feed">
            {feed.map((entry) =>
              entry.kind === 'tool' ? (
                <ToolCard key={entry.id} item={entry as ToolItem} />
              ) : (
                <Turn key={entry.id} item={entry as SpeechItem} active={entry.id === lastSpeechId} />
              ),
            )}
          </div>
        </div>

        {error ? <ErrorBar raw={error} /> : null}

        <footer className="call-foot">
          <Waveform level={micLevel} live={line === 'listening'} />
          <span className="call-hint">{t(LINE_LABEL[line])}</span>
        </footer>
      </main>
    </div>
  )

  /** Факты, которые брокер уже записал. Пусто — пока ничего не выяснено. */
  function CallFacts({ scenarioLoadId }: { scenarioLoadId: string }) {
    const facts = callState?.facts
    if (!facts) return null

    const load = getLoad(scenarioLoadId)
    const rows: { key: string; value: string; tone?: 'good' | 'bad' }[] = []

    if (facts.carrier) {
      rows.push({
        key: 'MC',
        value: facts.carrier.mc,
        tone: facts.carrier.blocker ? 'bad' : 'good',
      })
    }
    if (facts.equipment) {
      rows.push({ key: 'Equipment', value: facts.equipment.replace('_', ' ') })
    }
    if (facts.loadPresented) {
      rows.push({ key: 'Load', value: load.ref })
      rows.push({ key: 'Lane', value: laneLabel(load) })
    }
    if (facts.agreedRate) {
      rows.push({ key: 'Rate', value: `$${facts.agreedRate.toLocaleString('en-US')}`, tone: 'good' })
    } else if (facts.currentBrokerOffer) {
      rows.push({ key: 'Offer', value: `$${facts.currentBrokerOffer.toLocaleString('en-US')}` })
    }
    if (facts.rateConSentTo) {
      rows.push({ key: 'Rate con', value: 'sent', tone: 'good' })
    }

    if (rows.length === 0) return null

    return (
      <div className="call-facts">
        {rows.map((row) => (
          <div className="call-fact" key={row.key}>
            <span className="call-fact-key">{row.key}</span>
            <span className="call-fact-val" data-tone={row.tone}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
}

const LINE_LABEL = {
  ringing: 'call.ringing',
  live: 'call.live',
  listening: 'call.listening',
  thinking: 'call.thinking',
  hold: 'call.hold',
  ended: 'call.ended',
} as const satisfies Record<LineState, TranslationKey>

/**
 * Присутствие собеседника. Дышит в тишине, ускоряется когда брокер думает,
 * раскрывается кольцами на твой голос. Единственная «картинка» на экране —
 * и та работает, а не украшает: по ней видно, слышат тебя или нет.
 */
function Orb({ state, level }: { state: LineState; level: number }) {
  const scale = 1 + Math.min(1, level) * 0.35
  return (
    <div className="orb" data-state={state} aria-hidden="true">
      <span
        className="orb-ring"
        style={{ transform: `scale(${0.75 + Math.min(1, level) * 0.5})` }}
      />
      <span
        className="orb-ring"
        style={{ transform: `scale(${0.6 + Math.min(1, level) * 0.75})`, opacity: 0.5 }}
      />
      <span
        className="orb-core"
        style={state === 'listening' ? { transform: `scale(${scale})` } : undefined}
      />
    </div>
  )
}

/**
 * Полоса ошибки. Студенту — понятная фраза, мне — техническая подробность
 * рядом мелким шрифтом. Раньше сюда попадало сырое `TTS 400`, что не говорило
 * ни тому, ни другому.
 */
function ErrorBar({ raw }: { raw: string }) {
  const t = useT()
  const separator = raw.indexOf(':')
  const code = separator === -1 ? raw : raw.slice(0, separator)
  const detail = separator === -1 ? '' : raw.slice(separator + 1).trim()
  const message = code.startsWith('error.') ? t(code as TranslationKey) : t('error.generic')

  return (
    <div className="call-error" role="status">
      <span className="call-error-text">{message}</span>
      {detail ? <span className="call-error-detail mono">{detail}</span> : null}
    </div>
  )
}

/**
 * Реплика. Слова брокера проявляются ровно за длительность его аудио —
 * поэтому текст на экране идёт в такт голосу, а не появляется куском.
 */
function Turn({ item, active }: { item: SpeechItem; active: boolean }) {
  const t = useT()
  const words = useMemo(() => item.text.split(/(\s+)/), [item.text])
  const wordCount = useMemo(() => words.filter((w) => w.trim()).length, [words])
  const revealed = useWordReveal(item, wordCount)

  let seen = 0
  return (
    <div
      className={[
        'turn',
        item.role === 'broker' ? 'turn-broker' : 'turn-dispatcher',
        active ? 'turn-active' : '',
        item.draft ? 'turn-draft' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="turn-who">{item.role === 'broker' ? 'Broker' : t('call.you')}</div>
      <p className="turn-text">
        {words.map((word, i) => {
          if (!word.trim()) return <span key={i}>{word}</span>
          seen++
          return (
            <span key={i} className={seen <= revealed ? 'word word-shown' : 'word'}>
              {word}
            </span>
          )
        })}
      </p>
      {item.interrupted ? <div className="turn-cut">{t('call.interrupted')}</div> : null}
    </div>
  )
}

/** Сколько слов уже прозвучало. Реплики диспетчера видны целиком сразу. */
function useWordReveal(item: SpeechItem, wordCount: number): number {
  const [revealed, setRevealed] = useState(item.durationMs ? 0 : wordCount)

  useEffect(() => {
    if (!item.durationMs || !item.startedAt) {
      setRevealed(wordCount)
      return
    }
    let frame = 0
    const tick = () => {
      const elapsed = performance.now() - item.startedAt!
      const ratio = Math.min(1, elapsed / item.durationMs!)
      setRevealed(Math.ceil(ratio * wordCount))
      if (ratio < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [item.durationMs, item.startedAt, wordCount])

  return revealed
}

/** Живая волна своего голоса. Смотреть можно, нажимать нечего. */
function Waveform({ level, live }: { level: number; live: boolean }) {
  const bars = 40
  const [history, setHistory] = useState<number[]>(() => new Array(bars).fill(0))

  useEffect(() => {
    setHistory((prev) => [...prev.slice(1), level])
  }, [level])

  return (
    <div className={live ? 'wave wave-live' : 'wave'} aria-hidden="true">
      {history.map((value, i) => (
        <span
          key={i}
          className="wave-bar"
          style={{ transform: `scaleY(${0.08 + Math.min(1, value) * 0.92})` }}
        />
      ))}
    </div>
  )
}

function CallTimer({ startedAt }: { startedAt: number | null }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  if (!startedAt) return null
  const seconds = Math.max(0, Math.floor((now - startedAt) / 1000))
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  return <span className="call-timer mono">{`${mm}:${ss}`}</span>
}
