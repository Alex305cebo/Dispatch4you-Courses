import { describe, expect, it } from 'vitest'
import { trimHistory } from './PipelineTransport'

type M = { role: string; content?: string; tool_call_id?: string }

describe('обрезка истории разговора', () => {
  it('короткую историю не трогает', () => {
    const short = Array.from({ length: 5 }, (_, i) => ({ role: 'user', content: `${i}` }))
    expect(trimHistory(short as never)).toHaveLength(5)
  })

  it('длинную обрезает — иначе один ход перестаёт влезать в лимит провайдера', () => {
    const long = Array.from({ length: 40 }, (_, i) => ({ role: 'user', content: `${i}` }))
    expect(trimHistory(long as never).length).toBeLessThan(20)
  })

  it('никогда не начинает историю с осиротевшего tool-сообщения', () => {
    // `tool` обязан идти следом за assistant с tool_calls; иначе провайдер
    // отвечает 400 на весь запрос.
    const messages: M[] = []
    for (let i = 0; i < 20; i++) {
      messages.push({ role: 'assistant', content: '' })
      messages.push({ role: 'tool', tool_call_id: `c${i}`, content: '{}' })
      messages.push({ role: 'tool', tool_call_id: `d${i}`, content: '{}' })
    }
    const trimmed = trimHistory(messages as never) as M[]
    expect(trimmed[0]?.role).not.toBe('tool')
  })
})
