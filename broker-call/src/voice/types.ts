/**
 * Один интерфейс на два транспорта.
 *
 * PipelineTransport (бесплатный: VAD → Whisper → LLM → Orpheus) и
 * RealtimeTransport (OpenAI по WebRTC) отдают наружу одни и те же события,
 * поэтому экран звонка и автомат не знают, какой из них работает. Переключение
 * стоит одну строку в конфиге.
 */
export interface VoiceTransport {
  connect(): Promise<void>
  disconnect(): void
  /**
   * Свернуться тихо: отпустить микрофон, но не играть отбой.
   *
   * Нужно на откате. Если connect() не удался и мы переходим к запасному
   * транспорту, студент не должен услышать сигнал «занято» перед новыми
   * гудками — для него это выглядит как сломанный звонок, хотя звонок сейчас
   * пойдёт. Транспорт без отката может не реализовывать.
   */
  abandon?(): void
  /** Текущая громкость микрофона 0..1 — для живой волны на экране. */
  onLevel?: ((level: number) => void) | null
  /** Заглушить брокера немедленно — студент заговорил поверх. */
  interrupt(): void
  /** Поток микрофона для визуализации волны. */
  getMicStream(): MediaStream | null
  /**
   * Средняя пауза между «студент договорил» и «брокер заговорил», в мс.
   * Уходит в разбор звонка: без числа «стало живее» остаётся ощущением.
   */
  getAverageLatencyMs?(): number
}

export type VoiceEvent =
  /** Студент начал говорить. Повод оборвать брокера. */
  | { type: 'user_speech_start' }
  /** Черновой текст по ходу речи — то, что видно на экране мгновенно. */
  | { type: 'user_partial'; text: string }
  /** Точный текст после распознавания. Заменяет черновик. */
  | { type: 'user_final'; text: string }
  /** Речь распознать не удалось — на экране ничего не остаётся. */
  | { type: 'user_dropped'; reason: 'too_short' | 'not_english' | 'empty' | 'error' }
  /**
   * Брокер начинает говорить. В пайплайне текст известен целиком и есть
   * длительность аудио — экран раскрывает слова синхронно с голосом.
   * В Realtime текст приходит потоком: durationMs = 0, а слова добавляются
   * событиями agent_text_delta по мере произнесения.
   */
  | { type: 'agent_utterance_start'; id: string; text: string; durationMs: number }
  /** Очередной кусок реплики брокера — только для потокового транспорта. */
  | { type: 'agent_text_delta'; id: string; delta: string }
  /** Брокер закончил или был оборван на доле spokenRatio от реплики. */
  | { type: 'agent_utterance_end'; id: string; interrupted: boolean; spokenRatio: number }
  /** Брокер «думает» — в пайплайне это ожидание модели, на экране это пауза в трубке. */
  | { type: 'agent_thinking'; active: boolean }
  /** Брокер полез в систему. Пока идёт — на линии hold. */
  | { type: 'tool_start'; id: string; name: string; args: unknown }
  | { type: 'tool_end'; id: string; name: string; result: unknown }
  | { type: 'error'; message: string; fatal: boolean }

export type VoiceListener = (event: VoiceEvent) => void

import type { BrokerStyle } from '../types'

/**
 * Чем толкают брокера снять трубку.
 *
 * Это повод заговорить, а не текст реплики: звонит диспетчер, на том конце
 * берут трубку и представляются так, как этот человек делает это всегда.
 * Дословную строку отсюда убрали намеренно — она делала начало всех звонков
 * одинаковым.
 */
export const PICKUP_CUE =
  '[Your desk phone just rang and you picked up. A dispatcher is on the line — you do not know yet what they want. Answer the phone the way you always do, in your own words, and keep it short.]'

export interface TransportDeps {
  scenarioId: string
  /** Голос брокера у провайдера озвучки. */
  voice: string
  /** Вокальная ремарка Orpheus под характер брокера: cheerful, serious… */
  direction?: string
  /** Характер брокера — от него зависят короткие отклики в паузах. */
  style: BrokerStyle
  /** Выполнить инструмент и вернуть результат для модели. */
  runTool(name: string, args: unknown): unknown
  emit: VoiceListener
}
