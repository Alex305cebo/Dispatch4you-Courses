import { useEffect, useMemo, useState } from 'react'
import './debrief.css'
import { useCallStore } from '../store/useCallStore'
import { scoreCall, type CallMetrics, type MetricKey } from '../call/scoring'
import { useT } from '../i18n/useT'
import type { TranslationKey } from '../i18n'
import { recordAttempt } from '../store/progress'

interface Analysis {
  summary?: string
  moments?: { type: 'win' | 'miss'; text: string }[]
  next_call?: string
}

/**
 * Разбор звонка.
 *
 * Числа — из CallMachine через scoreCall: они одинаковы при каждом прогоне
 * одного и того же разговора. Модель добавляет только объяснение поверх уже
 * посчитанного, поэтому не может ни переврать сумму, ни похвалить за то, чего
 * не было.
 */
export function Debrief() {
  const t = useT()
  const { scenario, machine, feed, backToLobby, openIncoming } = useCallStore()
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [failed, setFailed] = useState(false)

  const transcript = useMemo(
    () =>
      feed
        .filter((i): i is Extract<typeof i, { kind: 'speech' }> => i.kind === 'speech' && !i.draft)
        .map((i) => ({ role: i.role, text: i.text })),
    [feed],
  )

  const metrics: CallMetrics | null = useMemo(() => {
    if (!scenario || !machine) return null
    const dispatcherText = transcript
      .filter((l) => l.role === 'dispatcher')
      .map((l) => l.text)
      .join(' ')
    return scoreCall({ scenario, state: machine.getState(), dispatcherText })
  }, [scenario, machine, transcript])

  useEffect(() => {
    if (!scenario || !metrics || !machine) return
    recordAttempt(scenario.id, metrics.overall)

    let cancelled = false
    fetch('/api/debrief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenarioId: scenario.id,
        transcript,
        facts: machine.getState().facts,
        metrics,
      }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: Analysis) => {
        if (!cancelled) setAnalysis(data)
      })
      .catch(() => {
        // Числа уже посчитаны — разбор без слов модели всё равно полезен.
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [scenario, metrics, machine, transcript])

  if (!scenario || !metrics) return null

  return (
    <div className="debrief">
      <div className="scroll">
        <div className="debrief-body">
          <div className="verdict">
            <div>
              <span className="verdict-score">{metrics.overall}</span>
              <span className="verdict-of">/10</span>
            </div>
            <p className="verdict-summary">
              {analysis?.summary ??
                (failed ? '' : <span className="loading">{t('debrief.analyzing')}…</span>)}
            </p>
          </div>

          <div className="stats">
            <Stat label={t('debrief.duration')} value={formatDuration(metrics.durationSec)} />
            <Stat label={t('debrief.turns')} value={String(metrics.dispatcherTurns)} />
            <Stat
              label={t('debrief.money')}
              value={metrics.leftOnTable > 0 ? `$${metrics.leftOnTable.toLocaleString('en-US')}` : '$0'}
              tone={metrics.leftOnTable > 0 ? 'bad' : undefined}
            />
          </div>

          <div>
            <div className="section-title">{t('debrief.score')}</div>
            <div className="metrics">
              {(Object.keys(metrics.scores) as MetricKey[]).map((key) => (
                <div className="metric-row" key={key}>
                  <span className="metric-name">{t(`metric.${key}` as TranslationKey)}</span>
                  <span className="metric-track">
                    <span
                      className="metric-fill"
                      style={{ transform: `scaleX(${(metrics.scores[key] ?? 0) / 10})` }}
                    />
                  </span>
                  <span className="metric-val">{metrics.scores[key]}</span>
                </div>
              ))}
            </div>
          </div>

          {analysis?.moments?.length ? (
            <div>
              <div className="section-title">{t('debrief.moments')}</div>
              <div className="moments">
                {analysis.moments.map((moment, i) => (
                  <div className="moment" key={i} data-type={moment.type}>
                    <span className="moment-mark" />
                    <span>{moment.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {analysis?.next_call ? (
            <div>
              <div className="section-title">{t('debrief.next')}</div>
              <div className="next-call">{analysis.next_call}</div>
            </div>
          ) : null}

          <div className="transcript">
            {transcript.map((line, i) => (
              <p className="transcript-line" data-role={line.role} key={i}>
                {line.text}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="debrief-actions">
        <button
          className="btn btn-primary"
          onClick={() => {
            backToLobby()
            openIncoming(scenario.id)
          }}
        >
          {t('debrief.again')}
        </button>
        <button className="btn" onClick={backToLobby}>
          {t('debrief.back')}
        </button>
      </div>
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'bad' }) {
  return (
    <div>
      <div className="stat-key">{label}</div>
      <div className="stat-val" data-tone={tone}>
        {value}
      </div>
    </div>
  )
}

function formatDuration(seconds: number): string {
  const mm = Math.floor(seconds / 60)
  const ss = seconds % 60
  return `${mm}:${String(ss).padStart(2, '0')}`
}
