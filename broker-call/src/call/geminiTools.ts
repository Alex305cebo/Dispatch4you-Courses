// Перевод схем инструментов из формата OpenAI/Groq в формат Gemini.
//
// Один и тот же список TOOL_SCHEMAS должен уходить обоим провайдерам, иначе
// брокер в одном транспорте умеет то, чего не умеет в другом, и разбор звонка
// начинает врать. Поэтому источник правды остаётся один, а разница форматов
// живёт здесь.
//
// Чем формат Gemini отличается:
// - нет обёртки {type:'function', function:{…}} — плоский список объявлений
//   внутри одного объекта tools;
// - типы в верхнем регистре: STRING, NUMBER, INTEGER, BOOLEAN, ARRAY, OBJECT;
// - схема понимает ограниченный набор ключей (подмножество OpenAPI), а лишние
//   вроде `default`, `pattern`, `additionalProperties` запрос ломают;
// - у функции без аргументов `parameters` не должен передаваться вовсе;
// - enum разрешён только на строковом поле.
//
// Всё, что не укладывается в этот список, здесь бросает исключение, а не
// молча пропадает. Пустой `properties: {}` уже однажды положил разговор на
// стороне Groq: провайдер валидирует схемы строго и роняет ЗАПРОС ЦЕЛИКОМ, а
// в интерфейсе это выглядит как молчащий брокер без единой строки в логе.
// Лучше упасть на сборке.

export type GeminiType = 'STRING' | 'NUMBER' | 'INTEGER' | 'BOOLEAN' | 'ARRAY' | 'OBJECT'

export interface GeminiSchema {
  type: GeminiType
  description?: string
  format?: string
  nullable?: boolean
  enum?: string[]
  items?: GeminiSchema
  properties?: Record<string, GeminiSchema>
  required?: string[]
  minItems?: number
  maxItems?: number
}

export interface GeminiFunctionDeclaration {
  name: string
  description: string
  parameters?: GeminiSchema
}

export interface GeminiTool {
  functionDeclarations: GeminiFunctionDeclaration[]
}

const TYPES: Record<string, GeminiType> = {
  string: 'STRING',
  number: 'NUMBER',
  integer: 'INTEGER',
  boolean: 'BOOLEAN',
  array: 'ARRAY',
  object: 'OBJECT',
}

/** Ключи, которые Gemini понимает. Всё остальное отбрасывается. */
const KEPT = ['description', 'format', 'nullable', 'minItems', 'maxItems'] as const

/**
 * Готовый блок tools для запроса к Gemini.
 *
 * Все объявления кладутся в ОДИН объект: несколько объектов tools Gemini
 * принимает не везде, а один — везде.
 */
export function toGeminiTools(tools: readonly unknown[]): GeminiTool[] {
  return [{ functionDeclarations: toGeminiFunctionDeclarations(tools) }]
}

export function toGeminiFunctionDeclarations(
  tools: readonly unknown[],
): GeminiFunctionDeclaration[] {
  return tools.map((tool, i) => convertTool(tool, i))
}

function convertTool(tool: unknown, index: number): GeminiFunctionDeclaration {
  const fn = obj(obj(tool, `tools[${index}]`).function, `tools[${index}].function`)
  const name = fn.name
  const description = fn.description
  if (typeof name !== 'string' || !name) {
    throw new Error(`gemini tools: у инструмента tools[${index}] нет имени`)
  }
  if (typeof description !== 'string' || !description) {
    throw new Error(`gemini tools: у инструмента ${name} нет описания — модель не поймёт, когда его звать`)
  }

  const decl: GeminiFunctionDeclaration = { name, description }
  const parameters = convertSchema(fn.parameters, name)
  // Функция без аргументов: `parameters` не ставим вообще. Пустой объект
  // отвергают оба провайдера, каждый по-своему.
  if (parameters && parameters.properties && Object.keys(parameters.properties).length > 0) {
    decl.parameters = parameters
  }
  return decl
}

function convertSchema(input: unknown, path: string): GeminiSchema | undefined {
  if (input == null) return undefined
  const src = obj(input, path)

  const rawType = src.type
  if (typeof rawType !== 'string') {
    throw new Error(`gemini tools: ${path} — не указан type`)
  }
  const type = TYPES[rawType]
  if (!type) {
    throw new Error(
      `gemini tools: ${path} — тип "${rawType}" не имеет соответствия в схеме Gemini`,
    )
  }

  const out: GeminiSchema = { type }

  for (const key of KEPT) {
    const value = src[key]
    if (value !== undefined) (out as Record<string, unknown>)[key] = value
  }

  if (src.enum !== undefined) {
    if (!Array.isArray(src.enum)) {
      throw new Error(`gemini tools: ${path}.enum — ожидался список`)
    }
    if (type !== 'STRING') {
      throw new Error(
        `gemini tools: ${path} — enum у Gemini разрешён только на строковом поле, а здесь ${type}`,
      )
    }
    out.enum = src.enum.map(String)
  }

  if (src.items !== undefined) {
    out.items = convertSchema(src.items, `${path}.items`)
  }
  if (type === 'ARRAY' && !out.items) {
    throw new Error(`gemini tools: ${path} — у массива нет items`)
  }

  const properties = src.properties
  if (properties !== undefined) {
    const props = obj(properties, `${path}.properties`)
    const converted: Record<string, GeminiSchema> = {}
    for (const [key, value] of Object.entries(props)) {
      const child = convertSchema(value, `${path}.${key}`)
      if (child) converted[key] = child
    }
    out.properties = converted
  }

  if (src.required !== undefined) {
    if (!Array.isArray(src.required)) {
      throw new Error(`gemini tools: ${path}.required — ожидался список`)
    }
    const required = src.required.map(String)
    for (const key of required) {
      if (!out.properties || !(key in out.properties)) {
        throw new Error(
          `gemini tools: ${path}.required содержит "${key}", которого нет в properties`,
        )
      }
    }
    if (required.length > 0) out.required = required
  }

  return out
}

function obj(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`gemini tools: ${path} — ожидался объект`)
  }
  return value as Record<string, unknown>
}
