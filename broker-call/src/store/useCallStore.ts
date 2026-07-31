import { create } from 'zustand'
import { CallMachine } from '../call/CallMachine'
import { PipelineTransport } from '../voice/PipelineTransport'
import { RealtimeTransport } from '../voice/RealtimeTransport'
import type { TransportDeps, VoiceEvent, VoiceTransport } from '../voice/types'
import { getScenario } from '../data/scenarios'
import { getBroker } from '../data/brokers'
import type { CallState, Scenario } from '../types'
import { endpoint } from '../api'
import { directionForStyle, voiceForBroker } from '../voice/voices'

export type Phase = 'lobby' | 'incoming' | 'call' | 'debrief'

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
  scenario: Scenario | null
  machine: CallMachine | null
  transport: VoiceTransport | null
  callState: CallState | null
  feed: FeedEntry[]
  line: LineState
  micLevel: number
  error: string | null
  startedAt: number | null

  openIncoming(scenarioId: string): void
  answer(): Promise<void>
  endCall(): void
  backToLobby(): void
}

let draftId = 0

export const useCallStore = create<CallStore>((set, get) => ({
  phase: 'lobby',
  scenario: null,
  machine: null,
  transport: null,
  callState: null,
  feed: [],
  line: 'ringing',
  micLevel: 0,
  error: null,
  startedAt: null,

  openIncoming(scenarioId) {
    const scenario = getScenario(scenarioId)
    set({ phase: 'incoming', scenario, feed: [], error: null, line: 'ringing' })
  },

  async answer() {
    const scenario = get().scenario
    if (!scenario) return

    const machine = new CallMachine(scenario)
    machine.start()
    const broker = getBroker(scenario.brokerId)

    // Какой транспорт использовать, решает сервер — из клиента платный режим
    // не включить, даже подменив запрос.
    const config = await fetchConfig()

    const deps: TransportDeps = {
      scenarioId: scenario.id,
      voice: voiceForBroker(broker.id),
      direction: directionForStyle(broker.style),
      opening: scenario.opening,
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

    const useRealtime = config.transport === 'realtime' && config.ready.realtime
    const transport = useRealtime ? new RealtimeTransport(deps) : new PipelineTransport(deps)
    transport.onLevel = (level) => set({ micLevel: level })

    set({
      phase: 'call',
      machine,
      transport,
      callState: machine.getState(),
      startedAt: Date.now(),
      line: 'ringing',
    })

    try {
      await transport.connect()
    } catch (e) {
      const message =
        (e as Error).name === 'NotAllowedError'
          ? 'error.micDenied'
          : `error.generic:${(e as Error).message}`
      set({ error: message })
    }
  },

  endCall() {
    const { transport, phase } = get()
    if (phase === 'debrief') return
    transport?.disconnect()
    set({ phase: 'debrief', line: 'ended' })
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
    })
  },
}))

type Set = (partial: Partial<CallStore> | ((s: CallStore) => Partial<CallStore>)) => void
type Get = () => CallStore

interface ServerConfig {
  transport: 'pipeline' | 'realtime'
  ready: { llm: boolean; stt: boolean; tts: boolean; realtime: boolean }
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
