import type { ToolItem } from '../store/useCallStore'
import { useT } from '../i18n/useT'
import type { TranslationKey } from '../i18n'

/**
 * Обращение брокера к системе, показанное прямо в ленте разговора.
 *
 * Это и есть «инструменты вживую»: студент своими глазами видит, что брокер
 * пробил его MC номер и что именно там увидел. Пока карточка бежит — на линии
 * играет музыка ожидания, то есть техническая задержка выглядит как реальный
 * hold, а не как зависший интерфейс.
 */
export function ToolCard({ item }: { item: ToolItem }) {
  const t = useT()
  const title = t(`tool.${item.name}` as TranslationKey) ?? item.name
  const body = item.status === 'done' ? render(item) : null

  // Инструменты без визуального результата не засоряют ленту.
  if (item.status === 'done' && !body) return null

  return (
    <div className="tool" data-status={item.status}>
      <div className="tool-head">
        <span className="tool-title">{title}</span>
      </div>
      {item.status === 'running' ? <div className="tool-progress" /> : null}
      {body ? <div className="tool-body">{body}</div> : null}
    </div>
  )
}

interface Row {
  key: string
  value: string
  tone?: 'good' | 'bad'
}

function render(item: ToolItem): React.ReactNode {
  const result = item.result as { ok?: boolean; data?: Record<string, unknown>; approved?: boolean } | undefined
  const data = result?.data
  if (!data) return null

  switch (item.name) {
    case 'lookup_carrier':
      return (
        <>
          <div className="tool-lead">{text(data.legal_name)}</div>
          {rows([
            { key: 'MC / DOT', value: `${text(data.mc)} · ${text(data.dot)}` },
            {
              key: 'Authority',
              value: text(data.authority),
              tone: data.authority === 'active' ? 'good' : 'bad',
            },
            {
              key: 'Safety rating',
              value: text(data.safety_rating),
              tone: data.safety_rating === 'satisfactory' ? 'good' : 'bad',
            },
            { key: 'Cargo insurance', value: money(data.cargo_insurance) },
            { key: 'Power units', value: text(data.power_units) },
            {
              key: 'Crashes (24 mo)',
              value: text(data.crashes_24mo),
              tone: Number(data.crashes_24mo) > 1 ? 'bad' : undefined,
            },
          ])}
          {result?.approved === false ? (
            <div className="tool-row">
              <span className="tool-val" data-tone="bad">
                Not approved for this load
              </span>
            </div>
          ) : null}
        </>
      )

    case 'pull_up_load':
      return (
        <>
          <div className="tool-lead">{text(data.lane)}</div>
          {rows([
            { key: 'Reference', value: text(data.reference) },
            { key: 'Miles', value: text(data.miles) },
            { key: 'Equipment', value: text(data.equipment) },
            { key: 'Commodity', value: text(data.commodity) },
            { key: 'Weight', value: `${Number(data.weight_lbs).toLocaleString('en-US')} lbs` },
            ...(data.value_usd ? [{ key: 'Cargo value', value: money(data.value_usd) }] : []),
            { key: 'Pickup', value: text(data.pickup) },
            { key: 'Delivery', value: text(data.delivery) },
            { key: 'Posted', value: money(data.posted_rate) },
            { key: 'Terms', value: text(data.payment_terms) },
          ])}
        </>
      )

    case 'check_market_rate':
      return (
        <>
          <div className="tool-lead">{`$${text(data.avgPerMile)}/mile`}</div>
          {rows([
            { key: 'Range', value: `$${text(data.lowPerMile)} – $${text(data.highPerMile)}` },
            {
              key: '7-day trend',
              value: `${Number(data.trendPct) > 0 ? '+' : ''}${text(data.trendPct)}%`,
              tone: Number(data.trendPct) > 0 ? 'good' : undefined,
            },
            { key: 'Load-to-truck', value: `${text(data.loadToTruckRatio)}:1` },
            { key: 'Market total', value: money(data.suggestedTotal) },
          ])}
        </>
      )

    case 'propose_rate':
      return (
        <>
          <div className="tool-lead">{money(data.broker_position)}</div>
          {rows([
            {
              key: 'Outcome',
              value: OUTCOME[String(data.outcome)] ?? String(data.outcome),
              tone: data.outcome === 'accept' ? 'good' : data.outcome === 'walk_away' ? 'bad' : undefined,
            },
            { key: 'Per mile', value: `$${text(data.rate_per_mile)}` },
            ...(data.is_final ? [{ key: 'Final', value: 'yes', tone: 'bad' as const }] : []),
          ])}
        </>
      )

    case 'record_booking_details': {
      const missing = data.still_missing as string[] | undefined
      if (data.complete) return rows([{ key: 'Booking', value: 'complete', tone: 'good' }])
      if (!missing?.length) return null
      return rows([{ key: 'Still needed', value: missing.join(', ') }])
    }

    case 'send_rate_con':
      return (
        <>
          <div className="tool-lead">{text(data.reference)}</div>
          {rows([
            { key: 'Lane', value: text(data.lane) },
            { key: 'Rate', value: money(data.rate) },
            { key: 'Sent to', value: text(data.sent_to), tone: 'good' },
          ])}
        </>
      )

    case 'record_driver_status':
      return rows([
        { key: 'Driver', value: text(data.location) },
        ...(data.can_make_pickup === false
          ? [{ key: 'Pickup window', value: 'cannot make it', tone: 'bad' as const }]
          : []),
      ])

    case 'record_equipment':
      return rows([
        { key: 'Equipment', value: String(text(data.equipment)).replace('_', ' ') },
        ...(data.matches_load === false
          ? [{ key: 'Load requires', value: String(text(data.load_requires)).replace('_', ' '), tone: 'bad' as const }]
          : []),
      ])

    default:
      return null
  }
}

const OUTCOME: Record<string, string> = {
  accept: 'agreed',
  counter: 'countered',
  final: 'final offer',
  walk_away: 'no deal',
}

function rows(items: Row[]): React.ReactNode {
  return items.map((row) => (
    <div className="tool-row" key={row.key}>
      <span className="tool-key">{row.key}</span>
      <span className="tool-val" data-tone={row.tone}>
        {row.value}
      </span>
    </div>
  ))
}

function text(value: unknown): string {
  return value === null || value === undefined ? '—' : String(value)
}

function money(value: unknown): string {
  const n = Number(value)
  return Number.isFinite(n) ? `$${n.toLocaleString('en-US')}` : '—'
}
