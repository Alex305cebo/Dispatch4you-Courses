import { describe, expect, it } from 'vitest'
import { TOOL_SCHEMAS, TOOL_NAMES } from './toolSchemas'
import {
  toGeminiTools,
  toGeminiFunctionDeclarations,
  type GeminiFunctionDeclaration,
} from './geminiTools'

/** В тестах ниже конвертеру всегда даётся один инструмент — вот он. */
function only(tools: readonly unknown[]): GeminiFunctionDeclaration {
  const [decl] = toGeminiFunctionDeclarations(tools)
  if (!decl) throw new Error('конвертер не вернул ни одного объявления')
  return decl
}

/**
 * Тесты написаны ДО конвертера намеренно.
 *
 * Ровно этот класс ошибки уже клал разговор: пустой `properties: {}` в схеме
 * Groq валидатор отвергал и ронял ЗАПРОС ЦЕЛИКОМ — брокер молчал, а причина
 * была не видна ни в одном логе. У Gemini свой формат объявлений функций и
 * свой валидатор, значит и свои способы упасть тем же самым образом.
 *
 * Что важно у Gemini иначе, чем у OpenAI/Groq:
 * - нет обёртки `{type:'function', function:{…}}` — плоский список внутри
 *   `functionDeclarations`;
 * - типы в верхнем регистре (STRING, NUMBER…), это подмножество OpenAPI;
 * - схема понимает ограниченный набор ключей, лишние ломают запрос;
 * - у функции без аргументов `parameters` надо НЕ слать вовсе.
 */
describe('конвертер инструментов в формат Gemini', () => {
  const tools = toGeminiTools(TOOL_SCHEMAS)
  const decls = toGeminiFunctionDeclarations(TOOL_SCHEMAS)

  it('отдаёт ровно один tool-объект со списком объявлений', () => {
    expect(tools).toHaveLength(1)
    expect(tools[0]?.functionDeclarations).toHaveLength(TOOL_SCHEMAS.length)
  })

  it('сохраняет все имена инструментов один в один', () => {
    expect(decls.map((d) => d.name)).toEqual(TOOL_NAMES)
  })

  it('сохраняет описания — по ним модель решает, когда звать инструмент', () => {
    for (const [i, decl] of decls.entries()) {
      expect(decl.description).toBe(TOOL_SCHEMAS[i]?.function.description)
    }
  })

  it('не оставляет обёртку OpenAI', () => {
    for (const decl of decls) {
      expect(decl).not.toHaveProperty('type')
      expect(decl).not.toHaveProperty('function')
    }
  })

  it('переводит типы в верхний регистр', () => {
    for (const decl of decls) {
      if (!decl.parameters) continue
      expect(decl.parameters.type).toBe('OBJECT')
      for (const prop of Object.values(decl.parameters.properties ?? {})) {
        expect(prop.type).toMatch(/^(STRING|NUMBER|INTEGER|BOOLEAN|ARRAY|OBJECT)$/)
      }
    }
  })

  it('сохраняет required там, где он был', () => {
    const byName = new Map(decls.map((d) => [d.name, d]))
    expect(byName.get('lookup_carrier')?.parameters?.required).toEqual(['mc_number'])
    expect(byName.get('propose_rate')?.parameters?.required).toEqual(['amount'])
    expect(byName.get('record_driver_status')?.parameters?.required).toEqual(['location'])
  })

  it('не выдумывает required там, где его не было', () => {
    const byName = new Map(decls.map((d) => [d.name, d]))
    expect(byName.get('record_booking_details')?.parameters?.required).toBeUndefined()
    expect(byName.get('pull_up_load')?.parameters?.required).toBeUndefined()
  })

  it('переносит enum как есть', () => {
    const endCall = decls.find((d) => d.name === 'end_call')
    expect(endCall?.parameters?.properties?.reason?.enum).toEqual([
      'booked',
      'no_deal',
      'broker_hung_up',
      'carrier_rejected',
    ])
  })

  it('enum ставит только на строковые поля — на других Gemini ругается', () => {
    for (const decl of decls) {
      for (const prop of Object.values(decl.parameters?.properties ?? {})) {
        if (prop.enum) expect(prop.type).toBe('STRING')
      }
    }
  })

  it('у функции без параметров parameters отсутствует, а не пустой объект', () => {
    const decl = only([
      {
        type: 'function',
        function: {
          name: 'no_args',
          description: 'A tool that takes nothing at all and needs no arguments.',
          parameters: { type: 'object', properties: {} },
        },
      },
    ])
    expect(decl.parameters).toBeUndefined()
    expect(Object.keys(decl)).toEqual(['name', 'description'])
  })

  it('выбрасывает ключи, которых нет в схеме Gemini', () => {
    const decl = only([
      {
        type: 'function',
        function: {
          name: 'noisy',
          description: 'Tool carrying JSON Schema keywords Gemini does not understand.',
          parameters: {
            type: 'object',
            properties: {
              x: {
                type: 'string',
                description: 'ok',
                default: 'nope',
                additionalProperties: false,
                pattern: '^a+$',
                $schema: 'http://json-schema.org/draft-07/schema#',
              },
            },
            additionalProperties: false,
          },
        },
      },
    ])
    const x = decl.parameters?.properties?.x as unknown as Record<string, unknown>
    expect(Object.keys(x).sort()).toEqual(['description', 'type'])
    expect(decl.parameters).not.toHaveProperty('additionalProperties')
  })

  it('разбирает вложенные объекты и массивы рекурсивно', () => {
    const decl = only([
      {
        type: 'function',
        function: {
          name: 'nested',
          description: 'Tool with a nested object and an array of objects inside it.',
          parameters: {
            type: 'object',
            properties: {
              stops: {
                type: 'array',
                description: 'Stops on the route',
                items: {
                  type: 'object',
                  properties: {
                    city: { type: 'string' },
                    appointment: { type: 'boolean' },
                  },
                  required: ['city'],
                },
              },
            },
            required: ['stops'],
          },
        },
      },
    ])
    const stops = decl.parameters?.properties?.stops
    expect(stops?.type).toBe('ARRAY')
    expect(stops?.items?.type).toBe('OBJECT')
    expect(stops?.items?.properties?.city?.type).toBe('STRING')
    expect(stops?.items?.properties?.appointment?.type).toBe('BOOLEAN')
    expect(stops?.items?.required).toEqual(['city'])
  })

  it('неизвестный тип не проглатывается молча — падаем на сборке, а не в звонке', () => {
    expect(() =>
      only([
        {
          type: 'function',
          function: {
            name: 'weird',
            description: 'Tool whose parameter type Gemini has no equivalent for at all.',
            parameters: { type: 'object', properties: { x: { type: 'null' } } },
          },
        },
      ]),
    ).toThrow(/null/)
  })

  it('результат сериализуется в JSON без потерь — он уходит по вебсокету', () => {
    const json = JSON.stringify(tools)
    expect(json).not.toContain('undefined')
    expect(JSON.parse(json)).toEqual(JSON.parse(JSON.stringify(tools)))
  })
})
