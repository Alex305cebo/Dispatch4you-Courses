import { describe, expect, it } from 'vitest'
import { TOOL_SCHEMAS, TOOL_NAMES } from './toolSchemas'

/**
 * Схемы уходят провайдеру целиком, и он валидирует их СТРОГО: одна кривая
 * схема роняет весь запрос, а не отключает один инструмент. Из-за пустого
 * `properties: {}` брокер не отвечал вообще ничем — ни на одной модели.
 *
 * Проверять это в браузере дорого и поздно, поэтому проверяем здесь.
 */
describe('схемы инструментов', () => {
  it('ни у одного инструмента нет пустого списка параметров', () => {
    for (const tool of TOOL_SCHEMAS) {
      const props = tool.function.parameters.properties as Record<string, unknown>
      expect(
        Object.keys(props).length,
        `${tool.function.name}: пустой properties отвергается валидатором Groq и роняет весь запрос`,
      ).toBeGreaterThan(0)
    }
  })

  it('у каждого инструмента есть имя, описание и объектные параметры', () => {
    for (const tool of TOOL_SCHEMAS) {
      expect(tool.type).toBe('function')
      expect(tool.function.name).toMatch(/^[a-z_]+$/)
      expect(tool.function.description.length).toBeGreaterThan(20)
      expect(tool.function.parameters.type).toBe('object')
    }
  })

  it('каждый обязательный параметр объявлен в properties', () => {
    for (const tool of TOOL_SCHEMAS) {
      const params = tool.function.parameters as {
        properties: Record<string, unknown>
        required?: readonly string[]
      }
      for (const name of params.required ?? []) {
        expect(Object.keys(params.properties), `${tool.function.name}.${name}`).toContain(name)
      }
    }
  })

  it('имена инструментов уникальны', () => {
    expect(new Set(TOOL_NAMES).size).toBe(TOOL_NAMES.length)
  })

  it('схемы сериализуются в JSON без потерь — их отправляют по сети', () => {
    const json = JSON.stringify(TOOL_SCHEMAS)
    expect(JSON.parse(json)).toEqual(JSON.parse(JSON.stringify(TOOL_SCHEMAS)))
    expect(json).not.toContain('undefined')
  })
})
