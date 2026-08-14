import type { BrokerStyle } from '../types'
import { synthesize } from './tts'

/**
 * Короткие отклики брокера — «угу», «так», «понял».
 *
 * Самое дешёвое средство против главной беды бесплатного пути: между «ты
 * договорил» и «брокер ответил» проходит около полутора секунд, и разговор
 * звучит как общение с автоответчиком.
 *
 * Живой человек в этой паузе не молчит. Услышав конец фразы, он отзывается
 * звуком раньше, чем успевает придумать ответ. Полсекунды такого отклика
 * съедают всё время на распознавание и обдумывание — собеседник просто не
 * успевает заметить паузу, потому что линия не молчала.
 *
 * Всё синтезируется ЗАРАНЕЕ, пока идут гудки вызова: там три секунды простоя,
 * которых с запасом хватает. В самом разговоре отклик стоит ноль — он уже
 * лежит в памяти готовым куском аудио.
 */

/** Отклик на конец фразы: брокер показывает, что услышал. */
const ACKS: Record<BrokerStyle, string[]> = {
  friendly: ['Mm-hmm.', 'Okay, sure.', 'Right.'],
  bureaucratic: ['Understood.', 'Okay.', 'Noted.'],
  rushed: ['Uh-huh.', 'Yep.', 'Got it.'],
  tough: ['Uh-huh.', 'Right.', 'Mm.'],
  stressed: ['Okay.', 'Right, right.', 'Go on.'],
}

/** Реплика перед обращением к системе — вместо мгновенной музыки ожидания. */
const FILLERS: Record<BrokerStyle, string[]> = {
  friendly: ['Alright, let me pull that up.', 'Give me one second here.'],
  bureaucratic: ['Let me check the system.', 'One moment, pulling it up.'],
  rushed: ['Hang on.', 'One sec.'],
  tough: ['Hold on.', 'Let me look.'],
  stressed: ['Hang on, checking now.', 'One second.'],
}

export class Backchannel {
  private acks: AudioBuffer[] = []
  private fillers: AudioBuffer[] = []
  // Перебор круговой, но начинается с произвольного места: с нуля «Mm-hmm →
  // Okay, sure → Right» звучало в одном и том же порядке в каждом звонке.
  private ackIndex = Math.floor(Math.random() * 3)
  private fillerIndex = Math.floor(Math.random() * 2)
  /** Отклик через раз: на каждой реплике он превратился бы в тик робота. */
  private turnsSinceAck = 99
  private ready = false

  constructor(
    private readonly ctx: AudioContext,
    private readonly voice: string,
    private readonly style: BrokerStyle,
    private readonly direction?: string,
  ) {}

  /**
   * Готовит отклики. Вызывать БЕЗ await — если синтез не успел за гудки или
   * провайдер недоступен, звонок просто идёт без откликов. Задерживать из-за
   * них начало разговора нельзя.
   */
  async prepare(): Promise<void> {
    const acks = ACKS[this.style] ?? ACKS.friendly
    const fillers = FILLERS[this.style] ?? FILLERS.friendly

    const [ackBuffers, fillerBuffers] = await Promise.all([
      this.synthAll(acks),
      this.synthAll(fillers),
    ])

    this.acks = ackBuffers
    this.fillers = fillerBuffers
    this.ready = this.acks.length > 0
  }

  /**
   * Отклик на конец фразы студента. Возвращает длительность в мс — на это
   * время можно смело считать линию занятой. Ноль означает «не прозвучал».
   */
  ack(destination: AudioNode): number {
    if (!this.ready) return 0
    // Подряд не повторяем: два «угу» кряду звучат хуже, чем ни одного.
    if (this.turnsSinceAck < 1) {
      this.turnsSinceAck++
      return 0
    }
    this.turnsSinceAck = 0
    return this.play(this.acks, this.ackIndex++, destination)
  }

  /** Реплика перед обращением к системе. */
  filler(destination: AudioNode): number {
    return this.play(this.fillers, this.fillerIndex++, destination)
  }

  private play(buffers: AudioBuffer[], index: number, destination: AudioNode): number {
    if (buffers.length === 0) return 0
    const buffer = buffers[index % buffers.length]!
    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.connect(destination)
    source.start()
    return buffer.duration * 1000
  }

  private async synthAll(lines: string[]): Promise<AudioBuffer[]> {
    const results = await Promise.all(
      lines.map(async (line) => {
        try {
          const audio = await synthesize(line, this.voice, this.direction)
          return await this.ctx.decodeAudioData(audio)
        } catch {
          // Один неудавшийся отклик не должен лишать остальных.
          return null
        }
      }),
    )
    return results.filter((b): b is AudioBuffer => b !== null)
  }
}
