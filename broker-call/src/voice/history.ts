/** Сколько последних сообщений уходит в модель. */
export const HISTORY_LIMIT = 14

export interface HistoryMessage {
  role: string
}

/**
 * Обрезает историю разговора.
 *
 * Она уходит в модель ЦЕЛИКОМ на каждом ходу вместе с промптом и схемами
 * инструментов, и без ограничения к середине звонка ход перестаёт влезать в
 * лимит провайдера.
 *
 * Обрезаем с начала, но так, чтобы история осталась валидной: ответ
 * инструмента (`tool`) обязан идти следом за вызвавшим его `assistant`.
 * Начать обрезанную историю с осиротевшего `tool` — это 400 от любого
 * провайдера: Groq пишет про messages[0], Gemini — «function response turn
 * must come immediately after a function call».
 */
export function trimHistory<T extends HistoryMessage>(messages: T[]): T[] {
  if (messages.length <= HISTORY_LIMIT) return messages
  // Окно начинается с реплики ДИСПЕТЧЕРА, а не просто не с `tool`. Если оно
  // начиналось с ответа брокера, вызвавшего инструмент, конвертер в формат
  // Gemini отбрасывал этот ведущий ход модели — и ответы инструментов за ним
  // оставались сиротами: «function response must come immediately after a
  // function call», 400 на весь запрос.
  const from = messages.length - HISTORY_LIMIT
  let start = from
  while (start < messages.length && messages[start]?.role !== 'user') start++
  if (start < messages.length) return messages.slice(start)

  // В окне нет ни одной реплики диспетчера — хотя бы не начинать с сироты.
  start = from
  while (start < messages.length && messages[start]?.role === 'tool') start++
  return messages.slice(start)
}
