import { describe, expect, it } from 'vitest'
import {
  parseServerMessage,
  setupMessage,
  audioChunkMessage,
  textTurnMessage,
  toolResponseMessage,
  GEMINI_OUTPUT_RATE,
  GEMINI_INPUT_RATE,
} from './geminiProtocol'

/**
 * Ошибка формата в этом протоколе не даёт ни исключения, ни кода ответа:
 * разговор просто не начинается. Отличить «модель молчит» от «мы шлём не то»
 * и от «мы не поняли ответ» по виду экрана нельзя — поэтому проверяем здесь.
 */
describe('разбор сообщений Gemini Live', () => {
  it('ловит подтверждение настройки', () => {
    expect(parseServerMessage(JSON.stringify({ setupComplete: {} }))).toEqual([
      { kind: 'setup_complete' },
    ])
  })

  it('достаёт звук и частоту из mimeType', () => {
    const events = parseServerMessage(
      JSON.stringify({
        serverContent: {
          modelTurn: {
            parts: [{ inlineData: { mimeType: 'audio/pcm;rate=24000', data: 'AAEC' } }],
          },
        },
      }),
    )
    expect(events).toEqual([{ kind: 'audio', base64: 'AAEC', sampleRate: 24000 }])
  })

  it('без частоты в mimeType берёт документированную, а не ноль', () => {
    const events = parseServerMessage(
      JSON.stringify({
        serverContent: { modelTurn: { parts: [{ inlineData: { data: 'AAEC' } }] } },
      }),
    )
    expect(events[0]).toEqual({ kind: 'audio', base64: 'AAEC', sampleRate: GEMINI_OUTPUT_RATE })
  })

  it('пустой кусок звука не превращается в событие', () => {
    const events = parseServerMessage(
      JSON.stringify({
        serverContent: { modelTurn: { parts: [{ inlineData: { data: '' } }, { text: 'hi' }] } },
      }),
    )
    expect(events).toEqual([])
  })

  it('разбирает расшифровки обеих сторон', () => {
    const events = parseServerMessage(
      JSON.stringify({
        serverContent: {
          inputTranscription: { text: 'MC one two three' },
          outputTranscription: { text: 'Alright, hang on' },
        },
      }),
    )
    expect(events).toEqual([
      { kind: 'input_transcript', text: 'MC one two three' },
      { kind: 'output_transcript', text: 'Alright, hang on' },
    ])
  })

  it('одно сообщение может нести звук и расшифровку сразу', () => {
    const events = parseServerMessage(
      JSON.stringify({
        serverContent: {
          modelTurn: { parts: [{ inlineData: { mimeType: 'audio/pcm;rate=24000', data: 'AA' } }] },
          outputTranscription: { text: 'okay' },
          turnComplete: true,
        },
      }),
    )
    expect(events.map((e) => e.kind)).toEqual(['audio', 'output_transcript', 'turn_complete'])
  })

  it('ловит перебивание — по нему выбрасывается недоигранный звук', () => {
    expect(parseServerMessage(JSON.stringify({ serverContent: { interrupted: true } }))).toEqual([
      { kind: 'interrupted' },
    ])
  })

  it('разбирает вызовы инструментов вместе с аргументами', () => {
    const events = parseServerMessage(
      JSON.stringify({
        toolCall: {
          functionCalls: [
            { id: 'fc_1', name: 'lookup_carrier', args: { mc_number: '123456' } },
            { id: 'fc_2', name: 'pull_up_load', args: {} },
          ],
        },
      }),
    )
    expect(events).toEqual([
      {
        kind: 'tool_call',
        calls: [
          { id: 'fc_1', name: 'lookup_carrier', args: { mc_number: '123456' } },
          { id: 'fc_2', name: 'pull_up_load', args: {} },
        ],
      },
    ])
  })

  it('вызову без id придумывает свой — иначе ответу не на что лечь', () => {
    const events = parseServerMessage(
      JSON.stringify({ toolCall: { functionCalls: [{ name: 'end_call', args: {} }] } }),
    )
    expect(events[0]).toMatchObject({ kind: 'tool_call' })
    const call = (events[0] as { calls: { id: string }[] }).calls[0]
    expect(call?.id).toBeTruthy()
  })

  it('вызов без имени отбрасывается, а не уходит в CallMachine пустым', () => {
    const events = parseServerMessage(
      JSON.stringify({ toolCall: { functionCalls: [{ id: 'x', args: {} }] } }),
    )
    expect(events).toEqual([])
  })

  it('ловит отмену инструментов', () => {
    expect(
      parseServerMessage(JSON.stringify({ toolCallCancellation: { ids: ['fc_1', 'fc_2'] } })),
    ).toEqual([{ kind: 'tool_cancel', ids: ['fc_1', 'fc_2'] }])
  })

  it('детектор провайдера: начало и конец фразы студента', () => {
    // Реальные сообщения 3.1-flash-live-preview, 05.09.2026
    expect(parseServerMessage(JSON.stringify({ voiceActivity: { type: 'ACTIVITY_START', audioOffset: '0.360s' } }))).toEqual([
      { kind: 'activity', state: 'start' },
    ])
    expect(parseServerMessage(JSON.stringify({ voiceActivity: { type: 'ACTIVITY_END', audioOffset: '11.400s' } }))).toEqual([
      { kind: 'activity', state: 'end' },
    ])
  })

  it('переводит goAway из «10s» в миллисекунды', () => {
    expect(parseServerMessage(JSON.stringify({ goAway: { timeLeft: '10s' } }))).toEqual([
      { kind: 'go_away', leftMs: 10000 },
    ])
  })

  it('ошибку провайдера отдаёт текстом, а не проглатывает', () => {
    expect(
      parseServerMessage(JSON.stringify({ error: { code: 400, message: 'invalid setup' } })),
    ).toEqual([{ kind: 'error', message: 'invalid setup' }])
  })

  it('мусор и незнакомые сообщения не роняют разбор', () => {
    expect(parseServerMessage('не json')).toEqual([])
    expect(parseServerMessage('null')).toEqual([])
    expect(parseServerMessage('[]')).toEqual([])
    expect(parseServerMessage(JSON.stringify({ sessionResumptionUpdate: { newHandle: 'x' } }))).toEqual([])
    expect(parseServerMessage(JSON.stringify({ serverContent: { modelTurn: { parts: 'нет' } } }))).toEqual([])
  })
})

describe('сборка исходящих сообщений', () => {
  it('первое сообщение — пустая настройка: всё уже заперто токеном', () => {
    expect(JSON.parse(setupMessage())).toEqual({ setup: {} })
  })

  it('кусок микрофона уходит с частотой, которую ждёт провайдер', () => {
    const sent = JSON.parse(audioChunkMessage('AAEC')) as {
      realtimeInput: { audio: { mimeType: string; data: string } }
    }
    expect(sent.realtimeInput.audio.mimeType).toBe(`audio/pcm;rate=${GEMINI_INPUT_RATE}`)
    expect(sent.realtimeInput.audio.data).toBe('AAEC')
  })

  it('текстовая реплика закрывает ход — иначе брокер ждёт продолжения', () => {
    expect(JSON.parse(textTurnMessage('pick up'))).toEqual({
      clientContent: { turns: [{ role: 'user', parts: [{ text: 'pick up' }] }], turnComplete: true },
    })
  })

  it('результат инструмента уходит объектом с тем же id', () => {
    const sent = JSON.parse(
      toolResponseMessage([{ id: 'fc_1', name: 'propose_rate', result: { outcome: 'counter' } }]),
    ) as { toolResponse: { functionResponses: { id: string; name: string; response: unknown }[] } }
    expect(sent.toolResponse.functionResponses[0]).toEqual({
      id: 'fc_1',
      name: 'propose_rate',
      response: { outcome: 'counter' },
    })
  })

  it('не-объектный результат заворачивается — иначе провайдер отвечает отказом', () => {
    const sent = JSON.parse(
      toolResponseMessage([{ id: 'a', name: 'x', result: 'готово' }]),
    ) as { toolResponse: { functionResponses: { response: unknown }[] } }
    expect(sent.toolResponse.functionResponses[0]?.response).toEqual({ result: 'готово' })
  })

  it('несколько результатов уходят одним сообщением', () => {
    const sent = JSON.parse(
      toolResponseMessage([
        { id: 'a', name: 'x', result: {} },
        { id: 'b', name: 'y', result: {} },
      ]),
    ) as { toolResponse: { functionResponses: unknown[] } }
    expect(sent.toolResponse.functionResponses).toHaveLength(2)
  })
})
