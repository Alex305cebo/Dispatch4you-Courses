import { useEffect, useMemo, useRef, useState } from 'react'
import './call.css'
import { useCallStore, type FeedEntry, type LineState, type SpeechItem, type ToolItem } from '../store/useCallStore'
import { getBroker } from '../data/brokers'
import { useT } from '../i18n/useT'
import { ToolCard } from '../components/ToolCard'

/**
 * Экран звонка. За весь разговор здесь нечего нажимать — в этом вся идея.
 * Всё, что происходит, происходит в одной ленте: реплики, обращения брокера к
 * системе, результаты. Никаких боковых панелей и никаких подсказок с готовой
 * фразой для зачитывания — студент говорит сам.
 */
export function CallScreen() {
  const t = useT()
  const { scenario, feed, line, micLevel, error, startedAt, endCall } = useCallStore()
  const feedRef = useRef<HTMLDivElement>(null)

  // Esc — единственная клавиша. Звонок и так закончится сам.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') endCall()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [endCall])

  // Лента всегда держит последнюю реплику в поле зрения.
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
      <header className="call-head">
        <div className="call-who">
          <span className="call-name">{broker.name}</span>
          <span className="call-company">{broker.company}</span>
        </div>
        <div className="call-meta">
          <CallTimer startedAt={startedAt} />
          <span className="line-state" data-state={line}>
            <span className="line-dot" />
            {t(LINE_LABEL[line])}
          </span>
        </div>
      </header>

      <div className="scroll" ref={feedRef}>
        <div className="feed">
          {feed.map((entry) =>
            entry.kind === 'tool' ? (
              <ToolCard key={entry.id} item={entry as ToolItem} />
            ) : (
              <Turn
                key={entry.id}
                item={entry as SpeechItem}
                active={entry.id === lastSpeechId}
              />
            ),
          )}
        </div>
      </div>

      <footer className="call-foot">
        {error ? <div className="call-error">{error}</div> : null}
        <Waveform level={micLevel} live={line === 'listening'} />
        <span className="call-hint">{t(LINE_LABEL[line])}</span>
        <button className="call-end" onClick={endCall}>
          {t('call.end')}
        </button>
      </footer>
    </div>
  )
}

const LINE_LABEL = {
  ringing: 'call.ringing',
  live: 'call.live',
  listening: 'call.listening',
  thinking: 'call.thinking',
  hold: 'call.hold',
  ended: 'call.ended',
} as const satisfies Record<LineState, Parameters<ReturnType<typeof useT>>[0]>

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
  const bars = 32
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

export type { FeedEntry }
