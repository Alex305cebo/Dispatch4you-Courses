import { describe, expect, it } from 'vitest'
import { pickLiveModel, pickTextModel, pickChatModel, rankModels, type ModelInfo, pickTtsModel } from './geminiModels'

/**
 * Имя модели в коде — это то, на чём мы горели трижды: Groq снял
 * llama-3.3-70b-versatile с бесплатного тарифа, playai-tts объявили
 * устаревшим, голоса Orpheus у Groq назывались иначе. Каждый раз падало всё
 * сразу и молча.
 *
 * Поэтому имя модели не пишется в коде вообще. Пишется ПОЛИТИКА: какие
 * свойства нам нужны и какие лимиты приемлемы. Имя приходит из models.list в
 * момент запуска. Здесь проверяется, что политика выбирает то, что надо, на
 * списках, похожих на настоящие.
 */

const m = (name: string, methods: string[]): ModelInfo => ({
  name: `models/${name}`,
  supportedGenerationMethods: methods,
})

const BIDI = ['bidiGenerateContent', 'countTokens']
const TEXT = ['generateContent', 'countTokens']

// Список примерно того вида, что отдаёт models.list: живые модели вперемешку
// с текстовыми, устаревшими, эмбеддингами и озвучкой.
const CATALOG: ModelInfo[] = [
  m('gemini-1.5-flash', TEXT),
  m('gemini-2.0-flash-live-001', BIDI),
  m('gemini-2.5-flash', TEXT),
  m('gemini-2.5-flash-lite', TEXT),
  m('gemini-2.5-flash-native-audio-preview-09-2025', BIDI),
  m('gemini-2.5-flash-preview-tts', TEXT),
  m('gemini-2.5-pro', TEXT),
  m('gemini-3-flash-live-preview', BIDI),
  m('gemini-3.1-flash-lite', TEXT),
  m('gemini-3.5-flash-lite', TEXT),
  m('gemini-3.5-pro', TEXT),
  m('gemini-embedding-001', ['embedContent']),
  m('imagen-4.0-generate-001', ['predict']),
]

describe('выбор модели для разговора', () => {
  it('берёт поколение новее, а не модальность: 3.x обыгрывает native audio 2.5', () => {
    // Прежние веса давали native-audio +1000 против 10 за поколение, поэтому
    // всегда выигрывала 2.5 — самая слабая из доступных.
    expect(pickLiveModel(CATALOG)).toBe('gemini-3-flash-live-preview')
  })

  it('при равном поколении предпочитает native audio — у неё нет суточного лимита', () => {
    const same = [m('gemini-3-flash-live-preview', BIDI), m('gemini-3-flash-native-audio', BIDI)]
    expect(pickLiveModel(same)).toBe('gemini-3-flash-native-audio')
  })

  it('не пускает в разговор переводчик и робототехнику, хотя они умеют вебсокет', () => {
    const junk = [m('gemini-3.5-live-translate-preview', BIDI), m('gemini-robotics-er-2-streaming-preview', BIDI), m('gemini-2.5-flash-native-audio-preview-09-2025', BIDI)]
    expect(pickLiveModel(junk)).toBe('gemini-2.5-flash-native-audio-preview-09-2025')
  })

  it('транскрибирующая модель старшего поколения не обыгрывает говорящую младшего', () => {
    // Реальный каталог ключа 05.09.2026: transcribe-live 3.5 брала верх по
    // поколению, сокет закрывался 1007 «AUDIO not supported», Live не поднимался.
    const real = [m('gemini-3.5-transcribe-live', BIDI), m('gemini-3.1-flash-live-preview', BIDI), m('gemini-2.5-flash-native-audio-latest', BIDI)]
    expect(pickLiveModel(real)).toBe('gemini-3.1-flash-live-preview')
  })

  it('без native audio откатывается на flash live', () => {
    const without = CATALOG.filter((x) => !x.name.includes('native-audio'))
    expect(pickLiveModel(without)).toBe('gemini-3-flash-live-preview')
  })

  it('никогда не берёт модель без bidiGenerateContent — по вебсокету она не отвечает', () => {
    const textOnly = CATALOG.filter(
      (x) => !(x.supportedGenerationMethods ?? []).includes('bidiGenerateContent'),
    )
    expect(pickLiveModel(textOnly)).toBeNull()
  })

  it('на пустом списке возвращает null, а не выдуманное имя', () => {
    expect(pickLiveModel([])).toBeNull()
  })

  it('срезает префикс models/', () => {
    expect(pickLiveModel(CATALOG)?.startsWith('models/')).toBe(false)
  })

  it('из двух одинаковых по классу берёт версию новее', () => {
    const list = [m('gemini-2.0-flash-live-001', BIDI), m('gemini-3-flash-live-preview', BIDI)]
    expect(pickLiveModel(list)).toBe('gemini-3-flash-live-preview')
  })

  it('обходит стороной озвучку и картинки, даже если они как-то оказались в bidi', () => {
    const list = [
      m('gemini-2.5-flash-preview-tts', BIDI),
      m('gemini-2.5-flash-image', BIDI),
      m('gemini-2.0-flash-live-001', BIDI),
    ]
    expect(pickLiveModel(list)).toBe('gemini-2.0-flash-live-001')
  })
})

describe('выбор модели для разбора звонка', () => {
  it('берёт flash lite — 500 запросов в сутки, а разбор занимает один', () => {
    expect(pickTextModel(CATALOG)).toBe('gemini-3.5-flash-lite')
  })

  it('не берёт pro: там суточный лимит меньше, чем студентов в группе', () => {
    expect(pickTextModel(CATALOG)).not.toContain('pro')
  })

  it('не берёт живые и озвучивающие модели', () => {
    const picked = pickTextModel(CATALOG) ?? ''
    expect(picked).not.toContain('live')
    expect(picked).not.toContain('native-audio')
    expect(picked).not.toContain('tts')
  })

  it('без flash-lite соглашается на обычный flash', () => {
    const without = CATALOG.filter((x) => !x.name.includes('flash-lite'))
    expect(pickTextModel(without)).toBe('gemini-2.5-flash')
  })

  it('если ничего подходящего нет — null, а не pro втихую', () => {
    expect(pickTextModel([m('gemini-3.5-pro', TEXT)])).toBeNull()
  })

  it('на пустом списке возвращает null', () => {
    expect(pickTextModel([])).toBeNull()
  })
})

describe('rankModels', () => {
  it('отдаёт кандидатов по убыванию — это уходит в health, чтобы выбор был видно', () => {
    const ranked = rankModels(CATALOG, 'live')
    expect(ranked[0]?.id).toBe('gemini-3-flash-live-preview')
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1]?.score ?? 0).toBeGreaterThanOrEqual(ranked[i]?.score ?? 0)
    }
  })

  it('не тащит в кандидаты отвергнутое', () => {
    const ids = rankModels(CATALOG, 'text').map((r) => r.id)
    expect(ids).not.toContain('gemini-3.5-pro')
    expect(ids).not.toContain('gemini-embedding-001')
  })

  it('переживает мусор в ответе провайдера, не падая', () => {
    const junk = [
      { name: '', supportedGenerationMethods: [] },
      { name: 'models/gemini-2.5-flash' } as ModelInfo,
      m('gemini-2.5-flash-lite', TEXT),
    ]
    expect(() => rankModels(junk, 'text')).not.toThrow()
    expect(pickTextModel(junk)).toBe('gemini-2.5-flash-lite')
  })
})

describe('выбор модели озвучки', () => {
  const TTS = ['generateContent', 'countTokens']
  const CATALOG_TTS = [
    m('gemini-2.5-flash-preview-tts', TTS),
    m('gemini-2.5-pro-preview-tts', TTS),
    m('gemini-3.1-flash-tts-preview', TTS),
    m('gemini-3.5-flash-lite', TEXT),
  ]

  it('берёт поколение новее среди моделей озвучки', () => {
    expect(pickTtsModel(CATALOG_TTS)).toBe('gemini-3.1-flash-tts-preview')
  })

  it('не берёт pro — суточный лимит меньше, а озвучка идёт на каждую реплику', () => {
    const ids = rankModels(CATALOG_TTS, 'tts').map((r) => r.id)
    expect(ids).not.toContain('gemini-2.5-pro-preview-tts')
  })

  it('не выдаёт за озвучку обычную текстовую модель', () => {
    // Без require сюда попадал бы flash-lite: метод у них один и тот же.
    const ids = rankModels(CATALOG_TTS, 'tts').map((r) => r.id)
    expect(ids).not.toContain('gemini-3.5-flash-lite')
  })

  it('без моделей озвучки возвращает null, а не выдуманное имя', () => {
    expect(pickTtsModel([m('gemini-3.5-flash-lite', TEXT)])).toBeNull()
  })
})

describe('модель диалога', () => {
  it('flash-lite первой: рассуждающий полный flash даёт 20–57 с на ход и 20 запросов в сутки', () => {
    // Живой звонок с сайта 06.09.2026: gemini-3.6-flash — «брокер думает…» на минуту.
    const real = [m('gemini-3.6-flash', TEXT), m('gemini-3.5-flash-lite', TEXT), m('gemini-3.5-pro', TEXT)]
    expect(pickChatModel(real)).toBe('gemini-3.5-flash-lite')
  })
})
