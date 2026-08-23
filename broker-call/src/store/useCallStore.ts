import { create } from 'zustand'
import { CallMachine } from '../call/CallMachine'
import { PipelineTransport } from '../voice/PipelineTransport'
import { RealtimeTransport } from '../voice/RealtimeTransport'
import { GeminiLiveTransport } from '../voice/GeminiLiveTransport'
import type { TransportDeps, VoiceEvent, VoiceTransport } from '../voice/types'
import { makeCallSetup, type CallSetup } from '../call/makeCall'
import { knownFacts } from '../call/knownFacts'
import type { CallState } from '../types'
import { endpoint } from '../api'
import { directionForStyle } from '../voice/voices'

export type Phase = 'lobby' | 'dialing' | 'call' | 'debrief'

/** Что показывает индикатор линии. Не то же самое, что стадия звонка. */
export type LineState = 'ringing' | 'live' | 'listening' | 'thinking' | 'hold' | 'ended'

export interface SpeechItem {
  kind: 'speech'
  id: string
  role: 'broker' | 'dispatcher'
  text: string
  /** Черновик от Web Speech — заменится точным текстом Whisper. */
  draft: boolean
  /** Реплику брокера раскрываем по словам за это время. */
  durationMs?: number
  startedAt?: number
  interrupted?: boolean
  /** Какая доля реплики прозвучала до перебивания. */
  spokenRatio?: number
}

export interface ToolItem {
  kind: 'tool'
  id: string
  name: string
  status: 'running' | 'done'
  result?: unknown
}

export type FeedEntry = SpeechItem | ToolItem

interface CallStore {
  phase: Phase
  setup: CallSetup | null
  machine: CallMachine | null
  transport: VoiceTransport | null
  callState: CallState | null
  feed: FeedEntry[]
  line: LineState
  micLevel: number
  error: string | null
  startedAt: number | null
  /** Средняя пауза брокера за звонок — показывается в разборе. */
  avgLatencyMs: number

  openDial(): void
  /** Набрать номер. Звонит диспетчер — брокер снимает трубку на той стороне. */
  placeCall(): Promise<void>
  endCall(): void
  backToLobby(): void
}

let draftId = 0

export const useCallStore = create<CallStore>((set, get) => ({
  phase: 'lobby',
  setup: null,
  machine: null,
  transport: null,
  callState: null,
  feed: [],
  line: 'ringing',
  micLevel: 0,
  error: null,
  startedAt: null,
  avgLatencyMs: 0,

  openDial() {
    // Новый набор на каждый заход: другой брокер, другая компания, другой
    // груз и другие цифры. Одинаковых звонков больше нет.
    set({ phase: 'dialing', setup: makeCallSetup(), feed: [], error: null, line: 'ringing' })
  },

  async placeCall() {
    const setup = get().setup
    if (!setup) return

    const machine = new CallMachine(setup)
    machine.start()
    const broker = setup.broker

    // Какой транспорт использовать, решает сервер — из клиента платный режим
    // не включить, даже подменив запрос.
    const config = await fetchConfig()

    const deps: TransportDeps = {
      seed: setup.id,
      voice: setup.voice,
      sttModel: config.sttModel,
      direction: directionForStyle(broker.style),
      style: broker.style,
      knownFacts: () => knownFacts(machine.getState(), setup.load),
      runTool: (name, args) => {
        const result = machine.execute(name, args)
        set({ callState: machine.getState() })
        // Брокер сам решил закончить — экран уходит в разбор без нажатий.
        if (machine.getState().stage === 'ended') {
          window.setTimeout(() => get().endCall(), 2600)
        }
        return result
      },
      emit: (event) => applyEvent(set, get, event),
    }

    set({
      phase: 'call',
      machine,
      callState: machine.getState(),
      startedAt: Date.now(),
      line: 'ringing',
    })

    // Список, а не один транспорт: если предпочтительный не поднялся, звонок
    // всё равно состоится. Ровно ради этого и заводился VoiceTransport.
    const candidates = buildCandidates(config, deps)

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i]
      if (!candidate) continue

      const transport = candidate.make()
      transport.onLevel = (level) => set({ micLevel: level })
      set({ transport })

      try {
        await transport.connect()
        return
      } catch (e) {
        const error = e as Error

        // Отказ в микрофоне запасной транспорт не починит — он спросит второй
        // раз и получит тот же отказ. Тут откат только раздражает.
        if (error.name === 'NotAllowedError') {
          standDown(transport)
          set({ error: 'error.micDenied', transport: null })
          return
        }

        const last = i === candidates.length - 1
        if (last) {
          set({ error: `error.generic:${error.message}` })
          return
        }

        // Тихо сворачиваемся и пробуем следующий: студент услышит гудки один
        // раз, а не отбой и гудки заново.
        standDown(transport)
        // Причина не пропадает: без неё «почему опять пайплайн» выясняется
        // чтением исходников. Красную полосу не показываем — звонок сейчас
        // пойдёт, и пугать ею нечестно. Живое состояние провайдера всегда
        // видно в ?action=health.
        console.warn(
          `[broker-call] транспорт ${candidate.name} не поднялся, откат: ${error.message}`,
        )
      }
    }
  },

  endCall() {
    const { transport, phase } = get()
    if (phase === 'debrief') return
    // Замер снимаем ДО disconnect: после него транспорт уже разобран.
    const avgLatencyMs = transport?.getAverageLatencyMs?.() ?? 0
    transport?.disconnect()
    set({ phase: 'debrief', line: 'ended', avgLatencyMs })
  },

  backToLobby() {
    get().transport?.disconnect()
    set({
      phase: 'lobby',
      machine: null,
      transport: null,
      callState: null,
      feed: [],
      micLevel: 0,
      error: null,
      startedAt: null,
      avgLatencyMs: 0,
    })
  },
}))

type Set = (partial: Partial<CallStore> | ((s: CallStore) => Partial<CallStore>)) => void
type Get = () => CallStore

interface ServerConfig {
  transport: 'pipeline' | 'realtime'
  ready: { llm: boolean; stt: boolean; tts: boolean; realtime: boolean; gemini?: boolean }
  sttModel?: string
}

async function fetchConfig(): Promise<ServerConfig> {
  try {
    const r = await fetch(endpoint('config'))
    if (r.ok) return (await r.json()) as ServerConfig
  } catch {
    // Сервер молчит — идём бесплатным путём и покажем ошибку на первом запросе.
  }
  return { transport: 'pipeline', ready: { llm: false, stt: false, tts: false, realtime: false } }
}

interface Candidate {
  name: string
  make(): VoiceTransport
}

/**
 * Свернуть транспорт, который не поднялся.
 *
 * Именно `if`, а не `transport.abandon?.() ?? transport.disconnect()`: тихий
 * уход возвращает undefined, и `??` следом позвал бы ещё и disconnect — то
 * есть отбой в трубку ровно там, где мы его и убирали.
 */
function standDown(transport: VoiceTransport): void {
  if (transport.abandon) transport.abandon()
  else transport.disconnect()
}

/**
 * Кого пробовать и в каком порядке.
 *
 * Решает сервер: из браузера платный или новый режим не включить, даже
 * подменив запрос. Gemini появляется в списке только когда на сервере лежит
 * ключ — до тех пор всё идёт ровно так, как шло, и ни одна строка прежнего
 * пути не меняется.
 *
 * Пайплайн стоит последним всегда: он работает на ключах, которые у проекта
 * уже есть, и его задача — чтобы звонок состоялся даже когда всё новое легло.
 */
function buildCandidates(config: ServerConfig, deps: TransportDeps): Candidate[] {
  const candidates: Candidate[] = []

  if (config.ready.gemini) {
    candidates.push({ name: 'gemini-live', make: () => new GeminiLiveTransport(deps) })
  }
  if (config.transport === 'realtime' && config.ready.realtime) {
    candidates.push({ name: 'realtime', make: () => new RealtimeTransport(deps) })
  }
  candidates.push({ name: 'pipeline', make: () => new PipelineTransport(deps) })

  return candidates
}

function applyEvent(set: Set, get: Get, event: VoiceEvent): void {
  switch (event.type) {
    case 'user_speech_start':
      set({ line: 'listening' })
      break

    case 'user_partial':
      // Черновик живёт ровно один — он переписывается на каждом слове.
      set((s) => ({ feed: upsertDraft(s.feed, event.text) }))
      break

    case 'user_final': {
      set((s) => ({ feed: commitDraft(s.feed, event.text), line: 'thinking' }))
      get().machine?.noteDispatcherTurn()
      set({ callState: get().machine?.getState() ?? null })
      break
    }

    case 'user_dropped':
      set((s) => ({ feed: dropDraft(s.feed), line: 'live' }))
      break

    case 'agent_thinking':
      set({ line: event.active ? 'thinking' : 'live' })
      break

    case 'agent_utterance_start':
      set((s) => ({
        line: 'live',
        feed: [
          ...s.feed,
          {
            kind: 'speech',
            id: event.id,
            role: 'broker',
            text: event.text,
            draft: false,
            durationMs: event.durationMs,
            startedAt: performance.now(),
          },
        ],
      }))
      break

    case 'agent_text_delta':
      // Поток сам по себе и есть проявление слов — дорисовывать нечего.
      set((s) => ({
        feed: s.feed.map((item) =>
          item.kind === 'speech' && item.id === event.id
            ? { ...item, text: item.text + event.delta }
            : item,
        ),
      }))
      break

    case 'agent_utterance_end':
      set((s) => ({
        feed: s.feed.map((item) =>
          item.kind === 'speech' && item.id === event.id
            ? {
                ...item,
                interrupted: event.interrupted,
                spokenRatio: event.spokenRatio,
                // Перебили — в стенограмме остаётся только то, что успело
                // прозвучать. Так студент видит, что именно он оборвал.
                text: event.interrupted
                  ? truncateToRatio(item.text, event.spokenRatio)
                  : item.text,
                durationMs: event.interrupted ? 0 : item.durationMs,
              }
            : item,
        ),
      }))
      break

    case 'tool_start':
      set((s) => ({
        line: 'hold',
        feed: [...s.feed, { kind: 'tool', id: event.id, name: event.name, status: 'running' }],
      }))
      break

    case 'tool_end':
      set((s) => ({
        line: 'live',
        feed: s.feed.map((item) =>
          item.kind === 'tool' && item.id === event.id
            ? { ...item, status: 'done' as const, result: event.result }
            : item,
        ),
      }))
      break

    case 'error':
      set({ error: event.message })
      break
  }
}

function upsertDraft(feed: FeedEntry[], text: string): FeedEntry[] {
  const index = feed.findIndex((i) => i.kind === 'speech' && i.draft)
  if (index === -1) {
    return [
      ...feed,
      { kind: 'speech', id: `d${++draftId}`, role: 'dispatcher', text, draft: true },
    ]
  }
  return feed.map((item, i) => (i === index ? { ...item, text } : item))
}

function commitDraft(feed: FeedEntry[], text: string): FeedEntry[] {
  const index = feed.findIndex((i) => i.kind === 'speech' && i.draft)
  if (index === -1) {
    return [
      ...feed,
      { kind: 'speech', id: `d${++draftId}`, role: 'dispatcher', text, draft: false },
    ]
  }
  return feed.map((item, i) => (i === index ? { ...item, text, draft: false } : item))
}

function dropDraft(feed: FeedEntry[]): FeedEntry[] {
  return feed.filter((i) => !(i.kind === 'speech' && i.draft))
}

/** Режем по словам, а не по символам — обрубленное слово читается как ошибка. */
function truncateToRatio(text: string, ratio: number): string {
  const words = text.split(/\s+/)
  const keep = Math.max(1, Math.round(words.length * Math.min(1, Math.max(0, ratio))))
  if (keep >= words.length) return text
  return words.slice(0, keep).join(' ') + '…'
}

// Голоса живут в src/voice/voices.ts — там же белый список, по которому
// сервер подменяет неизвестное имя вместо того, чтобы получить 400 и онеметь.
