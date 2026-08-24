import type { Lang } from '../types'

// Одна сборка на два языка. У старой страницы были две копии файла, и они
// успели разъехаться — здесь расходиться нечему.
// Разговор с брокером всегда идёт на английском: в этом весь смысл тренажёра.

const RU = {
  'app.title': 'Broker Call',
  'app.subtitle': 'Тренажёр звонка фрахт-брокеру',

  'lobby.lead': 'Позвоните брокеру',
  'lobby.about':
    'На том конце каждый раз другой человек: другое имя, другая компания, другой характер и другой груз. Разговор идёт по-английски и нигде не записан заранее.',
  'lobby.start': 'Позвонить брокеру',
  'lobby.first': 'Первый звонок',
  'lobby.best': 'Лучший результат',
  'lobby.attempts': 'Звонков',

  // Звоним мы. Входящих в сторону диспетчера в тренажёре не бывает.
  'dial.label': 'Исходящий звонок',
  'dial.call': 'Позвонить',
  'dial.objective':
    'Представиться, назвать MC, забрать груз и договориться о ставке.',
  'dial.hint': 'Дальше ни одной кнопки — просто говорите',
  'dial.mic': 'Понадобится доступ к микрофону',

  'call.connecting': 'Соединение',
  'call.ringing': 'Идёт вызов',
  'call.live': 'На линии',
  'call.hold': 'Ожидание',
  'call.ended': 'Звонок завершён',
  'call.you': 'Вы',
  'call.listening': 'Слушаю',
  'call.thinking': 'Брокер думает',
  'call.speaking': 'Брокер говорит',
  'call.end': 'Завершить',
  'call.interrupted': 'перебито',
  'board.title': 'Груз на борде',
  'board.lane': 'Маршрут',
  'board.miles': 'Мили',
  'board.equipment': 'Трейлер',
  'board.weight': 'Вес',
  'board.pickup': 'Погрузка',
  'board.posted': 'Ставка на борде',
  'board.market': 'Рынок DAT',
  'hints.title': 'Что сказать сейчас',
  'hints.allDone': 'Всё названо — дожимайте ставку и закрывайте',
  'call.notEnglish': 'Говорите по-английски',
  'call.tooShort': 'Не расслышал',

  'tool.lookup_carrier': 'Проверка перевозчика',
  'tool.pull_up_load': 'Карточка груза',
  'tool.record_equipment': 'Оборудование',
  'tool.record_driver_status': 'Статус водителя',
  'tool.check_market_rate': 'Рынок по лейну',
  'tool.propose_rate': 'Ставка',
  'tool.record_booking_details': 'Данные для букинга',
  'tool.send_rate_con': 'Rate confirmation',
  'tool.end_call': 'Завершение',

  'debrief.title': 'Разбор звонка',
  'debrief.score': 'Общий балл',
  'debrief.duration': 'Длительность',
  'debrief.turns': 'Ваших реплик',
  'debrief.money': 'Оставлено на столе',
  'debrief.latency': 'Пауза брокера',
  'debrief.moments': 'Что произошло',
  'debrief.next': 'На следующий звонок',
  'debrief.again': 'Позвонить снова',
  'debrief.back': 'К списку звонков',
  'debrief.analyzing': 'Разбираю звонок',

  'metric.opening': 'Открытие',
  'metric.qualifying': 'Квалификация',
  'metric.negotiation': 'Торг',
  'metric.closing': 'Закрытие',
  'metric.terminology': 'Терминология',

  'error.micDenied':
    'Браузер не дал доступ к микрофону. Разрешите его в адресной строке и обновите страницу.',
  'error.noKeys':
    'Не настроены ключи. Скопируйте .env.example в .env.local и подставьте ключ Groq.',
  'error.ttsFailed': 'Голос брокера недоступен — реплики идут текстом',
  'error.sttFailed': 'Не удалось распознать речь. Повторите фразу.',
  'error.llmFailed': 'Брокер не отвечает. Попробуйте сказать ещё раз.',
  'error.generic': 'Что-то пошло не так',
} as const

type Key = keyof typeof RU

const EN: Record<Key, string> = {
  'app.title': 'Broker Call',
  'app.subtitle': 'Freight broker call trainer',

  'lobby.lead': 'Call a broker',
  'lobby.about':
    'A different person every time: different name, different company, different temper, different load. The call runs in English and none of it is scripted.',
  'lobby.start': 'Call a broker',
  'lobby.first': 'First call',
  'lobby.best': 'Best score',
  'lobby.attempts': 'Calls',

  'dial.label': 'Outgoing call',
  'dial.call': 'Call',
  'dial.objective':
    'Introduce yourself, give your MC, take the load and agree on a rate.',
  'dial.hint': 'No buttons after this — just talk',
  'dial.mic': 'Microphone access required',

  'call.connecting': 'Connecting',
  'call.ringing': 'Ringing',
  'call.live': 'On the line',
  'call.hold': 'On hold',
  'call.ended': 'Call ended',
  'call.you': 'You',
  'call.listening': 'Listening',
  'call.thinking': 'Broker is thinking',
  'call.speaking': 'Broker is speaking',
  'call.end': 'End call',
  'call.interrupted': 'cut off',
  'board.title': 'Load on the board',
  'board.lane': 'Lane',
  'board.miles': 'Miles',
  'board.equipment': 'Equipment',
  'board.weight': 'Weight',
  'board.pickup': 'Pickup',
  'board.posted': 'Posted rate',
  'board.market': 'DAT market',
  'hints.title': 'What to say now',
  'hints.allDone': 'Everything is on the table — close the rate',
  'call.notEnglish': 'Speak English',
  'call.tooShort': "Didn't catch that",

  'tool.lookup_carrier': 'Carrier lookup',
  'tool.pull_up_load': 'Load record',
  'tool.record_equipment': 'Equipment',
  'tool.record_driver_status': 'Driver status',
  'tool.check_market_rate': 'Lane market',
  'tool.propose_rate': 'Rate',
  'tool.record_booking_details': 'Booking details',
  'tool.send_rate_con': 'Rate confirmation',
  'tool.end_call': 'Wrap up',

  'debrief.title': 'Call debrief',
  'debrief.score': 'Overall',
  'debrief.duration': 'Duration',
  'debrief.turns': 'Your turns',
  'debrief.money': 'Left on the table',
  'debrief.latency': 'Broker delay',
  'debrief.moments': 'What happened',
  'debrief.next': 'Next call',
  'debrief.again': 'Call again',
  'debrief.back': 'Back to calls',
  'debrief.analyzing': 'Reviewing the call',

  'metric.opening': 'Opening',
  'metric.qualifying': 'Qualifying',
  'metric.negotiation': 'Negotiation',
  'metric.closing': 'Closing',
  'metric.terminology': 'Terminology',

  'error.micDenied':
    'The browser blocked microphone access. Allow it in the address bar and reload.',
  'error.noKeys': 'No API keys configured. Copy .env.example to .env.local and add a Groq key.',
  'error.ttsFailed': 'Broker voice is unavailable — replies continue as text',
  'error.sttFailed': 'Could not transcribe that. Say it again.',
  'error.llmFailed': 'The broker is not responding. Try saying it again.',
  'error.generic': 'Something went wrong',
}

const DICTS: Record<Lang, Record<Key, string>> = { ru: RU, en: EN }

const STORAGE_KEY = 'broker-call:lang'

/**
 * Safari при строгих настройках приватности бросает исключение на самом
 * обращении к localStorage — не возвращает null, а падает. Вызов стоит на
 * старте модуля, поэтому непойманная ошибка роняла приложение до первой
 * отрисовки: белый экран вместо тренажёра.
 */
export function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'ru' || saved === 'en') return saved
  } catch {
    // Хранилище недоступно — язык определим по браузеру.
  }
  try {
    return navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en'
  } catch {
    return 'ru'
  }
}

export function saveLang(lang: Lang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // Приватный режим: язык не запомнится, но переключение сработает.
  }
}

export function translator(lang: Lang) {
  const dict = DICTS[lang]
  return (key: Key): string => dict[key]
}

export type { Key as TranslationKey }
