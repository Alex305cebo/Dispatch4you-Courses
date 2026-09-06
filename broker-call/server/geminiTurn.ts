import { TOOL_SCHEMAS } from '../src/call/toolSchemas'
import { toGeminiTools } from '../src/call/geminiTools'
import { rankModels, type ModelInfo } from '../src/call/geminiModels'

/**
 * Один ход разговора через Gemini по обычному HTTP.
 *
 * Основной путь диалога и локально, и на боевом. Клиент хранит историю в
 * формате OpenAI (роли user/assistant/tool, tool_calls с id) — так её понимают
 * и Groq, и Cerebras, и этот же формат повторяет PHP. Здесь история
 * переводится в формат Gemini на входе и обратно на выходе, чтобы клиенту не
 * знать, кто отвечал.
 *
 * Модель не вписана: список по политике `chat` из живого каталога. Превью у
 * Google регулярно отвечают «503 high demand», поэтому перебор, а не одно имя.
 */

const GEMINI_API = 'https://generativelanguage.googleapis.com'

export interface ChatMessage {
  role: string
  content?: string | null
  tool_call_id?: string
  tool_calls?: ToolCall[]
}

export interface ToolCall {
  id: string
  function: { name: string; arguments: string }
  /**
   * Подпись размышления Gemini 3. Приходит вместе с вызовом инструмента и
   * обязана вернуться с ним в следующем ходу — без неё модель теряет нить
   * своего решения. Клиент её не трогает: хранит сообщение как есть.
   */
  thought_signature?: string
}

export interface TurnReply {
  provider: string
  model: string
  message: ChatMessage
  content: string
  toolCalls: { id: string; name: string; arguments: unknown }[]
}

export async function geminiTurn(
  key: string,
  systemPrompt: string,
  messages: ChatMessage[],
  models: readonly ModelInfo[],
): Promise<TurnReply> {
  const candidates = rankModels(models, 'chat').map((m) => m.id)
  if (candidates.length === 0) throw new Error('на этом ключе нет модели для диалога')

  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: toGeminiContents(messages),
    tools: toGeminiTools(TOOL_SCHEMAS),
    generationConfig: {
      temperature: 0.85,
      // Щедро: у рассуждающих поколений размышление может списываться отсюда,
      // и тесный лимит даёт пустой ответ без ошибки. Краткость держит промпт.
      maxOutputTokens: 1024,
    },
  }

  const errors: string[] = []
  for (const model of candidates) {
    if (isCoolingDown(model)) continue

    // 429 на бесплатном тарифе — квота, и она СВОЯ у каждой модели: у новейших
    // flash это 20 запросов В СУТКИ, у lite — на порядок больше. Ждать
    // бессмысленно: следующая в списке отвечает сразу, со своим счётчиком.
    // Так десяток моделей в каталоге складывается в один запас.
    let r: Response
    try {
      r = await post(key, model, body)
    } catch (e) {
      // Таймаут или сеть: модель зависла — к следующей, эту остужаем.
      coolDown(model)
      errors.push(`${model}: ${(e as Error).name === 'TimeoutError' ? `нет ответа за ${TURN_TIMEOUT_MS} мс` : (e as Error).message}`)
      continue
    }
    if (!r.ok) {
      // 503 «high demand» — та же история, что 429: модель сейчас не отвечает,
      // и стучаться в неё на следующей реплике бессмысленно.
      if (r.status === 429 || r.status === 503) coolDown(model)
      errors.push(`${model} ${r.status}: ${(await r.text()).replace(/\s+/g, ' ').slice(0, 120)}`)
      continue
    }

    const data = (await r.json()) as GeminiResponse
    const parts = data.candidates?.[0]?.content?.parts ?? []
    const text = parts.map((p) => p.text ?? '').join('').trim()
    const calls = parts
      .filter((p) => p.functionCall)
      .map((p, i) => ({
        id: `call_${Date.now().toString(36)}_${i}`,
        name: p.functionCall!.name,
        arguments: p.functionCall!.args ?? {},
        signature: p.thoughtSignature,
      }))

    if (!text && calls.length === 0) {
      errors.push(`${model}: пустой ответ (${data.candidates?.[0]?.finishReason ?? 'без причины'})`)
      continue
    }

    const message: ChatMessage = { role: 'assistant', content: text }
    if (calls.length) {
      message.tool_calls = calls.map((c) => ({
        id: c.id,
        function: { name: c.name, arguments: JSON.stringify(c.arguments) },
        ...(c.signature ? { thought_signature: c.signature } : {}),
      }))
    }
    return {
      provider: 'gemini',
      model,
      message,
      content: text,
      toolCalls: calls.map(({ id, name, arguments: args }) => ({ id, name, arguments: args })),
    }
  }
  throw new Error(errors.join(' | ') || 'все модели диалога отказали')
}

/**
 * Исчерпанные модели. Без этого каждый ход звонка сперва стучался бы во все
 * модели с выбранной суточной квотой и только потом доходил до рабочей —
 * по лишнему кругу сетевых походов на каждую реплику.
 */
const coolingDown = new Map<string, number>()
const COOLDOWN_MS = 60_000

function isCoolingDown(model: string): boolean {
  const until = coolingDown.get(model) ?? 0
  return until > Date.now()
}

function coolDown(model: string): void {
  coolingDown.set(model, Date.now() + COOLDOWN_MS)
}

/**
 * Потолок ожидания одного запроса. Перегруженная модель (3.6-flash под
 * «high demand») отвечала по 20–57 секунд — для звонка это зависание. Лучше
 * через 8 секунд уйти к следующей модели, чем ждать.
 */
export const TURN_TIMEOUT_MS = 8000

function post(key: string, model: string, body: unknown): Promise<Response> {
  return fetch(
    `${GEMINI_API}/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TURN_TIMEOUT_MS),
    },
  )
}

/**
 * OpenAI-история → contents Gemini.
 *
 * Ответы инструментов у Gemini идут functionResponse с ИМЕНЕМ функции, а у
 * нас tool-сообщение несёт только id вызова — имя восстанавливается по
 * предыдущему assistant с tool_calls. Несколько ответов подряд складываются в
 * один user-ход: Gemini ждёт их все вместе, а не по одному.
 */
export function toGeminiContents(messages: ChatMessage[]): GeminiContent[] {
  const nameById = new Map<string, string>()
  const out: GeminiContent[] = []

  for (const m of messages) {
    if (m.role === 'system') continue

    if (m.role === 'tool') {
      const name = nameById.get(m.tool_call_id ?? '') ?? 'unknown_tool'
      const part: GeminiPart = { functionResponse: { name, response: parseResult(m.content) } }
      const last = out[out.length - 1]
      if (last && last.role === 'user' && last.parts.every((p) => p.functionResponse)) {
        last.parts.push(part)
      } else {
        out.push({ role: 'user', parts: [part] })
      }
      continue
    }

    if (m.role === 'assistant') {
      const parts: GeminiPart[] = []
      if (m.content) parts.push({ text: m.content })
      for (const c of m.tool_calls ?? []) {
        nameById.set(c.id, c.function.name)
        parts.push({
          functionCall: { name: c.function.name, args: safeArgs(c.function.arguments) },
          ...(c.thought_signature ? { thoughtSignature: c.thought_signature } : {}),
        })
      }
      if (parts.length) out.push({ role: 'model', parts })
      continue
    }

    const text = (m.content ?? '').trim()
    if (text) out.push({ role: 'user', parts: [{ text }] })
  }

  // Gemini требует, чтобы история начиналась с user-хода.
  while (out.length && out[0]!.role !== 'user') out.shift()
  return out
}

function parseResult(content: string | null | undefined): Record<string, unknown> {
  try {
    const v = JSON.parse(content ?? '')
    return typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : { result: v }
  } catch {
    return { result: content ?? '' }
  }
}

function safeArgs(raw: string): Record<string, unknown> {
  try {
    const v = JSON.parse(raw)
    return typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

interface GeminiPart {
  text?: string
  thoughtSignature?: string
  functionCall?: { name: string; args?: Record<string, unknown> }
  functionResponse?: { name: string; response: Record<string, unknown> }
}
interface GeminiContent {
  role: 'user' | 'model'
  parts: GeminiPart[]
}
interface GeminiResponse {
  candidates?: { content?: { parts?: GeminiPart[] }; finishReason?: string }[]
}
