// Выбор модели Gemini в момент запуска, а не в момент написания кода.
//
// Имя модели, вписанное в исходник, — самая частая причина, по которой
// тренажёр замолкал целиком. Groq снял llama-3.3-70b-versatile с бесплатного
// тарифа, playai-tts объявили устаревшим, голоса Orpheus назывались не так,
// как в оригинальном Orpheus. Каждый раз это выглядело одинаково: всё
// перестало работать, в интерфейсе ничего, причина — в чужом changelog.
//
// Поэтому здесь нет ни одного имени модели. Здесь записана ПОЛИТИКА:
// - разговор идёт только по моделям, умеющим bidiGenerateContent (вебсокет);
// - предпочитаем native audio — у неё нет суточного лимита, а разговор самое
//   расходное место;
// - разбор звонка идёт по flash-lite: 500 запросов в сутки против 20 у pro,
//   а разбор занимает ровно один запрос на звонок;
// - модели с суточным лимитом уровня pro не берём вовсе — группа студентов
//   выест его за утро.
//
// Имена приходят из models.list. Если подходящего нет — возвращается null, и
// вызывающая сторона откатывается на текущий пайплайн. Выдуманное имя не
// возвращается никогда.

export interface ModelInfo {
  name: string
  supportedGenerationMethods?: string[]
}

export type ModelKind = 'live' | 'text' | 'tts'

export interface RankedModel {
  id: string
  score: number
}

/**
 * Модальности, которые нам не нужны ни в одной роли.
 *
 * `translate` и `robotics` отвергаются, хотя формально умеют вебсокет:
 * live-translate переводит речь вместо того, чтобы вести разговор, а robotics
 * обучена под управление механикой. Обе прошли бы по методу и по номеру
 * поколения — и обе сломали бы звонок.
 */
const NEVER = [
  'tts',
  'image',
  'imagen',
  'embedding',
  'veo',
  'vision',
  'aqa',
  'translate',
  'robotics',
]

export interface ModelRule {
  /** Метод, без которого модель нам не подходит вообще. */
  method: string
  /** Подстроки в имени, при которых модель отвергается. */
  reject: string[]
  /** Подстрока, без которой модель не подходит. Для озвучки это `tts`. */
  require?: string
  /** Подстрока → прибавка к очкам. */
  bonus: [string, number][]
}

/**
 * Политика выгружается в серверный конфиг вместе с промптами: боевому PHP
 * нужен тот же выбор, а вторая копия таблицы разъехалась бы с первой. В PHP
 * повторяется только цикл подсчёта — сама политика живёт здесь и тут же
 * покрыта тестами.
 */
export const MODEL_RULES: Record<ModelKind, ModelRule> = {
  live: {
    method: 'bidiGenerateContent',
    reject: NEVER,
    // Поколение важнее модальности. Прежние веса (native-audio +1000 против
    // 10 за поколение) означали, что 2.5 всегда обыгрывает 3.1: на живом
    // звонке брокер отвечал односложно и путал, кто кому предлагает груз.
    // Теперь решает номер поколения, а native-audio — только при равенстве.
    bonus: [
      ['native-audio', 30],
      ['live', 20],
    ],
  },
  /**
   * Озвучка через Gemini. Нужна потому, что Orpheus у Groq требует однократного
   * принятия условий в консоли, и до тех пор брокер на боевом сайте молчит —
   * тренажёр голоса без голоса. Gemini TTS работает по обычному HTTP, поэтому
   * доступен и боевому PHP, в отличие от Live-вебсокета.
   */
  tts: {
    method: 'generateContent',
    require: 'tts',
    // pro — суточный лимит меньше, чем нам нужно: озвучка идёт на каждую реплику.
    reject: [...NEVER.filter((n) => n !== 'tts'), 'pro'],
    bonus: [['flash', 100]],
  },
  text: {
    method: 'generateContent',
    // pro отвергаем осознанно: суточный лимит там меньше, чем нам нужно,
    // и падение на него означает «разбор перестал открываться к обеду».
    reject: [...NEVER, 'pro', 'live', 'native-audio'],
    bonus: [
      ['flash-lite', 1000],
      ['flash', 100],
    ],
  },
}

/** Кандидаты по убыванию пригодности. Уходит в health, чтобы выбор было видно. */
export function rankModels(models: readonly ModelInfo[], kind: ModelKind): RankedModel[] {
  const rule = MODEL_RULES[kind]
  const ranked: RankedModel[] = []

  for (const model of models ?? []) {
    const id = shortName(model?.name)
    if (!id) continue
    const methods = Array.isArray(model.supportedGenerationMethods)
      ? model.supportedGenerationMethods
      : []
    // Метод не заявлен — считаем, что модель не подходит. Проверить это
    // дешевле, чем ловить молчащий вебсокет.
    if (!methods.includes(rule.method)) continue
    if (rule.require && !id.includes(rule.require)) continue
    if (rule.reject.some((bad) => id.includes(bad))) continue

    // Поколение — старший разряд: 3.1 обязана обыгрывать 2.5 при любых
    // бонусах. Бонусы разводят модели одного поколения между собой.
    let score = version(id) * 100
    for (const [needle, points] of rule.bonus) {
      if (id.includes(needle)) score += points
    }
    ranked.push({ id, score })
  }

  return ranked.sort((a, b) => b.score - a.score || (a.id < b.id ? 1 : -1))
}

/** Модель для разговора по вебсокету. null — значит откатываемся на пайплайн. */
export function pickLiveModel(models: readonly ModelInfo[]): string | null {
  return rankModels(models, 'live')[0]?.id ?? null
}

/** Модель для разбора звонка. null — значит разбор идёт прежним провайдером. */
export function pickTextModel(models: readonly ModelInfo[]): string | null {
  return rankModels(models, 'text')[0]?.id ?? null
}

function shortName(raw: unknown): string {
  if (typeof raw !== 'string') return ''
  return raw.replace(/^models\//, '').trim().toLowerCase()
}

/** «gemini-3.1-flash-lite» → 3.1. Нет номера — 0, такая модель проиграет любой пронумерованной. */
function version(id: string): number {
  const match = id.match(/gemini-(\d+(?:\.\d+)?)/)
  return match ? Number(match[1]) : 0
}

/** Модель озвучки. null — значит озвучиваем прежним провайдером. */
export function pickTtsModel(models: readonly ModelInfo[]): string | null {
  return rankModels(models, 'tts')[0]?.id ?? null
}
