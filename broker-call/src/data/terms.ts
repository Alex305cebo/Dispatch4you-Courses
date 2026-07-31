// Словарь отраслевых терминов. Две задачи:
//   1) подсказка Whisper — резко поднимает точность на жаргоне;
//   2) постобработка распознанного текста.
//
// Перенесено из fixTerms() старой страницы (~сотня правил, накопленных по живым
// ошибкам распознавания: «painful to drive in» → «53-foot dry van»).

export const WHISPER_PROMPT =
  'Freight dispatcher call with a broker. Terms: MC number, DOT number, dry van, 53-foot, ' +
  'reefer, flatbed, step deck, rate con, rate confirmation, BOL, POD, DAT, deadhead, detention, ' +
  'lumper, TONU, RPM, all-in, ETA, HOS, ELD, factoring, OTR Solutions, Triumph, RTS Financial, ' +
  'QuickPay, net 30, rate per mile, pickup, delivery, dock, appointment, shipper, receiver, ' +
  'broker, carrier, dispatcher, power only, drop and hook, layover, accessorials.'

type Rule = readonly [RegExp, string]

const RULES: readonly Rule[] = [
  // Оборудование — самые частые ошибки распознавания
  [/\bpainful\s*to\s*drive\s*in\b/gi, '53-foot dry van'],
  [/\bfifty[\s-]?three[\s-]?(foot|feet)\b/gi, '53-foot'],
  [/\b53\s*(foot|ft|feet)\b/gi, '53-foot'],
  [/\bdrive\s*van\b/gi, 'dry van'],
  [/\bdry\s*(band|man)\b/gi, 'dry van'],
  [/\bdriv(e|ing)[\s-]?in\b/gi, 'dry van'],
  [/\brefrigerated\b/gi, 'reefer'],
  [/\breefer?\s*trailer\b/gi, 'reefer'],
  [/\bflat\s*bed\b/gi, 'flatbed'],
  [/\bstep\s*deck\b/gi, 'step deck'],

  // MC / DOT
  [/\b(em|am)\s*[.\-]?\s*(see|sea|c)\s*(number|#)?\b/gi, 'MC number'],
  [/\bm\.?\s*c\.?\s*(number|#)\b/gi, 'MC number'],
  [/\bdot\s*(number|#)\b/gi, 'DOT number'],

  // Документы и деньги
  [/\brate\s*(con|com|khan|cone|conn)\b/gi, 'rate con'],
  [/\brate\s*confirmation\b/gi, 'rate con'],
  [/\bbee\s*o\s*el\b/gi, 'BOL'],
  [/\bbill\s*of\s*lading\b/gi, 'BOL'],
  [/\bpee\s*o\s*dee\b/gi, 'POD'],
  [/\bproof\s*of\s*delivery\b/gi, 'POD'],
  [/\bquick\s*pay\b/gi, 'QuickPay'],
  [/\bfactoring\s*compan(y|ies)\b/gi, 'factoring company'],
  [/\bo\.?\s*t\.?\s*r\.?\s*solutions\b/gi, 'OTR Solutions'],

  // Аксессориалы
  [/\bdead\s*head\b/gi, 'deadhead'],
  [/\bde\s*tension\b/gi, 'detention'],
  [/\blumber\s*fee\b/gi, 'lumper fee'],
  [/\blump\s*er\b/gi, 'lumper'],
  [/\bto\s*no\s*you\b/gi, 'TONU'],
  [/\btonight\s*fee\b/gi, 'TONU fee'],
  [/\blay\s*over\b/gi, 'layover'],

  // Ставка
  [/\ball\s*in\s*rate\b/gi, 'all-in rate'],
  [/\ball\s*in\b/gi, 'all-in'],
  [/\brate\s*per\s*mile\b/gi, 'rate per mile'],
  [/\bar\s*p\s*m\b/gi, 'RPM'],
  [/\bdat\s*(board|load\s*board)\b/gi, 'DAT loadboard'],
  [/\bthe\s*dat\b/gi, 'DAT'],

  // Операционное
  [/\bdrop\s*and\s*hook\b/gi, 'drop and hook'],
  [/\bpower\s*only\b/gi, 'power only'],
  [/\bh\.?\s*o\.?\s*s\.?\b/gi, 'HOS'],
  [/\be\.?\s*l\.?\s*d\.?\b/gi, 'ELD'],
  [/\be\.?\s*t\.?\s*a\.?\b/gi, 'ETA'],
]

/** Приводит распознанный текст к отраслевой норме перед отправкой в модель. */
export function normalizeTranscript(text: string): string {
  let out = text
  for (const [pattern, replacement] of RULES) out = out.replace(pattern, replacement)
  return out.replace(/\s{2,}/g, ' ').trim()
}

/**
 * Whisper иногда «слышит» русский там, где его нет, и возвращает кириллицу.
 * Такой результат бесполезен: разговор обязан идти по-английски.
 */
export function looksNonEnglish(text: string): boolean {
  if (!text) return false
  const nonLatin = text.match(/[^\x00-\x7F]/g)?.length ?? 0
  return nonLatin / text.length > 0.2
}
