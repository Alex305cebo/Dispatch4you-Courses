// ═══════════════════════════════════════════════════════════════════════════
// EVENT DIALOG SYSTEM — Интерактивные диалоги для игровых событий
// Каждое событие = мини-чат с персонажами + выбор ответов диспетчера
// ═══════════════════════════════════════════════════════════════════════════

const FLUENT_PEOPLE = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions';
const FLUENT_PPL = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People';

// ── ПЕРСОНАЖИ ──────────────────────────────────────────────────────────────

export interface DialogCharacter {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string; // accent color для пузыря
}

export const CHARACTERS: Record<string, DialogCharacter> = {
  driver_john: {
    id: 'driver_john', name: 'John', role: 'Водитель',
    avatar: `${FLUENT_PEOPLE}/Man%20Light%20Skin%20Tone%2C%20Blond%20Hair.png`,
    color: '#38bdf8',
  },
  driver_carlos: {
    id: 'driver_carlos', name: 'Carlos', role: 'Водитель',
    avatar: `${FLUENT_PEOPLE}/Man%20Medium%20Skin%20Tone%2C%20Curly%20Hair.png`,
    color: '#fb923c',
  },
  mechanic: {
    id: 'mechanic', name: 'Mike', role: 'Механик',
    avatar: `${FLUENT_PEOPLE}/Man%20Mechanic%20Medium-Light%20Skin%20Tone.png`,
    color: '#f87171',
  },
  owner: {
    id: 'owner', name: 'Steve', role: 'Владелец',
    avatar: `${FLUENT_PEOPLE}/Man%20Office%20Worker%20Medium%20Skin%20Tone.png`,
    color: '#a78bfa',
  },
  accountant: {
    id: 'accountant', name: 'Anna', role: 'Бухгалтер',
    avatar: `${FLUENT_PEOPLE}/Woman%20Office%20Worker%20Medium-Light%20Skin%20Tone.png`,
    color: '#4ade80',
  },
  broker: {
    id: 'broker', name: 'Sarah', role: 'Брокер',
    avatar: `${FLUENT_PEOPLE}/Woman%20Technologist%20Medium%20Skin%20Tone.png`,
    color: '#06b6d4',
  },
  dot_inspector: {
    id: 'dot_inspector', name: 'Officer Davis', role: 'DOT Inspector',
    avatar: `${FLUENT_PEOPLE}/Police%20Officer%20Medium%20Skin%20Tone.png`,
    color: '#ef4444',
  },
  dispatcher: {
    id: 'dispatcher', name: 'Ты', role: 'Диспетчер',
    avatar: `${FLUENT_PPL}/Bust%20in%20Silhouette.png`,
    color: '#06b6d4',
  },
};

// ── ТИПЫ ───────────────────────────────────────────────────────────────────

export interface DialogMessage {
  characterId: string;
  text: string;
  delay?: number; // ms задержка перед показом (эффект печатания)
}

export interface DialogChoice {
  text: string;
  isCorrect: boolean;
  feedback: string; // подсказка при выборе
  scoreImpact?: number; // влияние на очки (-10 за ошибку, +20 за правильный)
  moodImpact?: number; // влияние на mood водителя
  moneyImpact?: number; // влияние на баланс
  courseLink?: string; // ссылка на раздел курса
}

export interface DialogStep {
  messages: DialogMessage[]; // сообщения перед выбором
  choices?: DialogChoice[]; // 4 варианта (если нет — просто сообщения)
  afterCorrect?: DialogMessage[]; // сообщения после правильного ответа
}

export interface EventDialogScenario {
  id: string;
  type: string; // breakdown, detention, inspection, weather, etc.
  title: string;
  icon: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  steps: DialogStep[];
  totalStars: number; // макс звёзд (= кол-во шагов с выбором)
  rewards: {
    xp: number;
    money?: number;
  };
}

// ── СЦЕНАРИИ ───────────────────────────────────────────────────────────────

export const SCENARIOS: EventDialogScenario[] = [

  // ═══ СЦЕНАРИЙ 1: Спущенные колёса ═══
  {
    id: 'flat_tire',
    type: 'breakdown',
    title: 'Спущенные колёса на трейлере',
    icon: '🛞',
    urgency: 'high',
    totalStars: 3,
    rewards: { xp: 150, money: 0 },
    steps: [
      {
        messages: [
          { characterId: 'driver_john', text: 'Dispatch, у меня проблема. Два колеса на трейлере спустили на I-40 возле Oklahoma City. Трак стоит на обочине, аварийка включена. Что делать?', delay: 800 },
        ],
        choices: [
          {
            text: 'John, понял тебя. Оставайся в кабине, включи аварийку и выстави треугольники. Сейчас вызову Road Side Assist.',
            isCorrect: true,
            feedback: '✅ Отлично! Безопасность водителя — приоритет №1. Треугольники обязательны по FMCSA §392.22.',
            scoreImpact: 20, moodImpact: 5,
          },
          {
            text: 'Попробуй поменять колёса сам, у тебя же есть инструменты.',
            isCorrect: false,
            feedback: '⚠️ Водитель НЕ должен менять колёса на обочине Interstate — это крайне опасно. Нарушение OSHA. Только сертифицированный механик с Road Side Assist.',
            scoreImpact: -10, moodImpact: -15, courseLink: 'problems.html',
          },
          {
            text: 'Продолжай ехать потихоньку до ближайшего truck stop.',
            isCorrect: false,
            feedback: '⚠️ Езда на спущенных колёсах повредит диски, ось и тормозной барабан. Ремонт $3,000+ вместо $500. Плюс штраф DOT за небезопасное оборудование.',
            scoreImpact: -15, moodImpact: -10, moneyImpact: -2500,
          },
          {
            text: 'Подожди, я перезвоню через час — сейчас занят другим траком.',
            isCorrect: false,
            feedback: '⚠️ Водитель стоит на обочине Interstate — каждая минута опасна. DOT может выписать штраф за стоянку. Приоритет — безопасность!',
            scoreImpact: -20, moodImpact: -25,
          },
        ],
        afterCorrect: [
          { characterId: 'driver_john', text: 'Понял, треугольники выставил. Жду механика.', delay: 600 },
        ],
      },
      {
        messages: [
          { characterId: 'mechanic', text: 'Принял заявку. Два колеса на трейлере — стандартная замена. Стоимость: $380 за шины + $120 выезд механика. Итого: $500. ETA: 45 минут. Отправляю Invoice #INV-2847.', delay: 1000 },
        ],
        choices: [
          {
            text: 'Mike, подтверждаю. Invoice принят, передаю в бухгалтерию для оплаты. John, механик будет через 45 минут.',
            isCorrect: true,
            feedback: '✅ Правильно! Быстрое подтверждение = быстрый ремонт. Всегда информируй водителя о ETA.',
            scoreImpact: 20, moodImpact: 5,
          },
          {
            text: 'Слишком дорого. Найди механика подешевле.',
            isCorrect: false,
            feedback: '⚠️ Road Side Assist на Interstate — фиксированные цены. Пока ищешь дешевле — трак стоит, водитель теряет HOS, груз опаздывает. Потери от простоя > $500.',
            scoreImpact: -10, moodImpact: -10,
          },
          {
            text: 'Можно оплатить потом, через 30 дней?',
            isCorrect: false,
            feedback: '⚠️ Road Side Assist не работает в кредит. Оплата до начала работ — стандарт индустрии. Задержка оплаты = задержка ремонта.',
            scoreImpact: -5, moodImpact: -5,
          },
          {
            text: 'Пусть водитель заплатит из своих, потом возместим.',
            isCorrect: false,
            feedback: '⚠️ Расходы на ремонт — ответственность компании, не водителя. Это нарушение трудового договора и подрывает доверие.',
            scoreImpact: -15, moodImpact: -20,
          },
        ],
        afterCorrect: [
          { characterId: 'owner', text: '$500 за два колеса — нормальная цена. Одобряю расход.', delay: 500 },
          { characterId: 'driver_john', text: 'Спасибо, dispatch. Жду механика.', delay: 400 },
        ],
      },
      {
        messages: [
          { characterId: 'accountant', text: 'Invoice #INV-2847 от Mike\'s Truck Service получен. Сумма: $500.00. Готова провести оплату.', delay: 800 },
        ],
        choices: [
          {
            text: 'Anna, проведи оплату и запиши расход на Truck 517. Категория: Road Side Repair.',
            isCorrect: true,
            feedback: '✅ Правильно! Каждый расход должен быть привязан к конкретному траку и категории — это важно для P&L отчёта.',
            scoreImpact: 20, moodImpact: 0,
          },
          {
            text: 'Подожди с оплатой, сначала проверим Invoice детально.',
            isCorrect: false,
            feedback: '⚠️ Invoice уже проверен механиком и одобрен владельцем. Задержка оплаты = задержка ремонта = потеря денег на простое.',
            scoreImpact: -5,
          },
          {
            text: 'Спиши с зарплаты водителя.',
            isCorrect: false,
            feedback: '⚠️ Незаконно! Ремонт оборудования — расход компании. Удержание из зарплаты за ремонт трака нарушает трудовое законодательство.',
            scoreImpact: -20, moodImpact: -30,
          },
          {
            text: 'Оплати из petty cash, без записи.',
            isCorrect: false,
            feedback: '⚠️ Все расходы должны быть задокументированы! Без записи — нет вычета из налогов, нет контроля расходов, проблемы при аудите.',
            scoreImpact: -10,
          },
        ],
        afterCorrect: [
          { characterId: 'accountant', text: 'Оплата проведена. $500.00 записано на Truck 517, категория Road Side Repair. Жду Receipt после завершения работ.', delay: 600 },
          { characterId: 'mechanic', text: 'Механик на месте, начинаем замену. Receipt #RCT-2847 будет после завершения.', delay: 800 },
          { characterId: 'mechanic', text: 'Работа завершена. Оба колеса заменены, давление проверено. Receipt #RCT-2847 отправлен в бухгалтерию.', delay: 1200 },
          { characterId: 'accountant', text: 'Receipt #RCT-2847 получен. Расход $500.00 закрыт. Дело завершено. ✅', delay: 600 },
          { characterId: 'driver_john', text: 'Спасибо, dispatch! Колёса новые, всё работает. Продолжаю маршрут. 👍', delay: 500 },
        ],
      },
    ],
  },

  // ═══ СЦЕНАРИЙ 2: Detention на разгрузке ═══
  {
    id: 'detention_delivery',
    type: 'detention',
    title: 'Detention — задержка на разгрузке',
    icon: '⏱️',
    urgency: 'medium',
    totalStars: 3,
    rewards: { xp: 200, money: 150 },
    steps: [
      {
        messages: [
          { characterId: 'driver_john', text: 'Dispatch, я на разгрузке в Walmart DC в Memphis уже 2 часа 15 минут. Dock door до сих пор не назначили. Что делать?', delay: 800 },
        ],
        choices: [
          {
            text: 'John, зафиксируй время прибытия и начала ожидания. Сфотографируй check-in sheet. Я звоню брокеру для detention claim.',
            isCorrect: true,
            feedback: '✅ Отлично! Документация — ключ к получению detention pay. Фото check-in sheet — доказательство времени прибытия.',
            scoreImpact: 20, moodImpact: 5,
          },
          {
            text: 'Просто подожди ещё, они скоро разгрузят.',
            isCorrect: false,
            feedback: '⚠️ После 2 часов ожидания нужно НЕМЕДЛЕННО начать процесс detention claim. Каждый час без документации — потерянные $75.',
            scoreImpact: -15, moodImpact: -10, moneyImpact: -75,
          },
          {
            text: 'Уезжай оттуда, найдём другой receiver.',
            isCorrect: false,
            feedback: '⚠️ Нельзя уехать с грузом без разрешения брокера! Это breach of contract. Груз должен быть доставлен по Rate Con.',
            scoreImpact: -25, moodImpact: -5,
          },
          {
            text: 'Скажи им что мы больше не будем с ними работать.',
            isCorrect: false,
            feedback: '⚠️ Конфликт с receiver не решит проблему. Профессиональный подход: документируй, claim через брокера, получи оплату.',
            scoreImpact: -10, moodImpact: -5,
          },
        ],
        afterCorrect: [
          { characterId: 'driver_john', text: 'Понял. Время прибытия 08:00 AM, check-in в 08:15. Фото отправил. Уже 2ч 15мин жду.', delay: 600 },
        ],
      },
      {
        messages: [
          { characterId: 'broker', text: 'Привет, да, я вижу что ваш трак ждёт. К сожалению, у Walmart сегодня задержки на всех доках. Что вы хотите?', delay: 800 },
        ],
        choices: [
          {
            text: 'Sarah, согласно Rate Con, detention начинается после 2 часов free time. Мой водитель ждёт уже 2ч 15мин. Прошу подтвердить detention rate $75/час начиная с 10:00 AM.',
            isCorrect: true,
            feedback: '✅ Профессионально! Ссылка на Rate Con, точное время, конкретная ставка. Так и нужно вести переговоры по detention.',
            scoreImpact: 20, moodImpact: 5, moneyImpact: 75,
          },
          {
            text: 'Это неприемлемо! Мы требуем компенсацию $500!',
            isCorrect: false,
            feedback: '⚠️ Агрессия не работает. Detention rate прописан в Rate Con — обычно $75/час. Требовать больше без основания — непрофессионально.',
            scoreImpact: -10, moodImpact: 0,
          },
          {
            text: 'Ладно, ничего страшного, подождём.',
            isCorrect: false,
            feedback: '⚠️ Отказ от detention claim = потеря $75+ за каждый час. Это деньги компании! Всегда подавай claim если ожидание > 2 часов.',
            scoreImpact: -15, moneyImpact: -150,
          },
          {
            text: 'Мы уедем если через 30 минут не разгрузят.',
            isCorrect: false,
            feedback: '⚠️ Угрозы уехать с грузом — breach of contract. Это может привести к потере груза, штрафу и испорченным отношениям с брокером.',
            scoreImpact: -20, moodImpact: -10,
          },
        ],
        afterCorrect: [
          { characterId: 'broker', text: 'Подтверждаю detention rate $75/час с 10:00 AM. Отправлю подтверждение по email.', delay: 600 },
        ],
      },
      {
        messages: [
          { characterId: 'driver_john', text: 'Dispatch, разгрузили! Итого ждал 3 часа 40 минут. BOL подписан.', delay: 800 },
          { characterId: 'accountant', text: 'Detention claim: 3ч 40мин - 2ч free time = 1ч 40мин billable. При $75/час = $125. Отправляю claim брокеру с документацией.', delay: 600 },
        ],
        choices: [
          {
            text: 'Anna, верно. Приложи к claim: фото check-in sheet, время прибытия, подписанный BOL с временем разгрузки. John, отличная работа с документацией!',
            isCorrect: true,
            feedback: '✅ Полный пакет документов = 95% шанс получить detention pay. Без документов — шанс падает до 20%.',
            scoreImpact: 20, moodImpact: 10, moneyImpact: 125,
          },
          {
            text: 'Забудь про detention, главное что разгрузились.',
            isCorrect: false,
            feedback: '⚠️ $125 — это реальные деньги! За год такие "забытые" detention claims складываются в $5,000-12,000 потерь на трак.',
            scoreImpact: -15, moneyImpact: -125,
          },
          {
            text: 'Потребуй $300 вместо $125.',
            isCorrect: false,
            feedback: '⚠️ Detention rate прописан в Rate Con — $75/час. Завышать сумму = потерять доверие брокера и получить отказ по claim.',
            scoreImpact: -10,
          },
          {
            text: 'Отправь claim без документов, и так заплатят.',
            isCorrect: false,
            feedback: '⚠️ Без документации (check-in sheet, BOL) брокер откажет в 80% случаев. Документы — основа любого claim!',
            scoreImpact: -10, moneyImpact: -125,
          },
        ],
        afterCorrect: [
          { characterId: 'accountant', text: 'Claim отправлен с полным пакетом документов. Ожидаем оплату в течение 30 дней. Дело закрыто. ✅', delay: 600 },
          { characterId: 'driver_john', text: 'Спасибо, dispatch. Еду дальше. BOL и фото отправил.', delay: 400 },
        ],
      },
    ],
  },

  // ═══ СЦЕНАРИЙ 3: DOT Roadside Inspection ═══
  {
    id: 'dot_inspection',
    type: 'inspection',
    title: 'DOT Roadside Inspection',
    icon: '👮',
    urgency: 'critical',
    totalStars: 3,
    rewards: { xp: 250, money: 0 },
    steps: [
      {
        messages: [
          { characterId: 'driver_carlos', text: 'Dispatch! Меня остановил DOT inspector на I-65 возле Nashville. Говорит Level 1 inspection. Я нервничаю, что делать?!', delay: 800 },
        ],
        choices: [
          {
            text: 'Carlos, спокойно. Level 1 — это стандартная проверка. Покажи CDL, Medical Card, Registration, Insurance. ELD должен быть включён. Будь вежлив и сотрудничай.',
            isCorrect: true,
            feedback: '✅ Правильно! Спокойствие и сотрудничество — лучшая стратегия. Level 1 проверяет документы + состояние трака. Обычно 30-45 минут.',
            scoreImpact: 20, moodImpact: 10,
          },
          {
            text: 'Скажи что торопишься и попроси отпустить.',
            isCorrect: false,
            feedback: '⚠️ НИКОГДА не торопи DOT inspector! Это вызовет подозрение и более тщательную проверку. Сотрудничество = быстрее отпустят.',
            scoreImpact: -15, moodImpact: -10,
          },
          {
            text: 'Не показывай ELD, скажи что сломался.',
            isCorrect: false,
            feedback: '⚠️ Ложь DOT inspector — серьёзное нарушение! Штраф до $16,000 за отсутствие ELD. Плюс Out of Service на 24 часа.',
            scoreImpact: -25, moodImpact: -20, moneyImpact: -5000,
          },
          {
            text: 'Позвони адвокату прежде чем что-то показывать.',
            isCorrect: false,
            feedback: '⚠️ DOT inspection — законная процедура. Отказ сотрудничать = Out of Service + штраф. Адвокат нужен ПОСЛЕ, если есть нарушения.',
            scoreImpact: -10, moodImpact: -5,
          },
        ],
        afterCorrect: [
          { characterId: 'driver_carlos', text: 'Понял, успокоился. Показываю документы. ELD включён, всё в порядке.', delay: 600 },
        ],
      },
      {
        messages: [
          { characterId: 'dot_inspector', text: 'Inspection complete. Обнаружено нарушение: левая задняя фара трейлера не работает. Violation code §393.11. Выписываю warning.', delay: 1000 },
          { characterId: 'driver_carlos', text: 'Dispatch, инспектор нашёл нерабочую фару. Выписал warning. Что теперь?', delay: 600 },
        ],
        choices: [
          {
            text: 'Carlos, warning — это не штраф, но нарушение записано в CSA Score. Заедь на ближайший truck stop и замени лампочку. Я запишу в maintenance log.',
            isCorrect: true,
            feedback: '✅ Правильно! Warning нужно устранить как можно скорее. CSA Score влияет на страховку и доступ к грузам. Лампочка — $15, замена 10 минут.',
            scoreImpact: 20, moodImpact: 5,
          },
          {
            text: 'Забей, это просто warning, не штраф.',
            isCorrect: false,
            feedback: '⚠️ Warning записывается в CSA Score! Накопление нарушений = повышение страховки, потеря контрактов, следующая инспекция будет строже.',
            scoreImpact: -15,
          },
          {
            text: 'Поедем в гараж на полный ремонт.',
            isCorrect: false,
            feedback: '⚠️ Перебор! Нерабочая фара — замена лампочки за $15 на любом truck stop. Гараж = потеря целого дня и денег.',
            scoreImpact: -5, moneyImpact: -200,
          },
          {
            text: 'Обжалуй warning, это несправедливо.',
            isCorrect: false,
            feedback: '⚠️ Фара действительно не работает — нарушение реальное. Обжалование без оснований = потеря времени и денег на адвоката.',
            scoreImpact: -10,
          },
        ],
        afterCorrect: [
          { characterId: 'driver_carlos', text: 'Заехал на Pilot, купил лампочку за $12. Заменил за 10 минут. Фара работает!', delay: 800 },
        ],
      },
      {
        messages: [
          { characterId: 'owner', text: 'Я видел отчёт об инспекции. CSA Score немного вырос. Что делаем?', delay: 600 },
          { characterId: 'accountant', text: 'Расход на лампочку: $12. Записать на Truck 834?', delay: 400 },
        ],
        choices: [
          {
            text: 'Steve, нарушение устранено. Я добавлю pre-trip inspection reminder для Carlos — чтобы проверял фары перед каждым рейсом. Anna, да, запиши $12 на Truck 834, категория Maintenance.',
            isCorrect: true,
            feedback: '✅ Отлично! Превентивные меры + документация расходов. Pre-trip inspection обязателен по FMCSA §396.13 и предотвращает 90% таких нарушений.',
            scoreImpact: 20, moodImpact: 5,
          },
          {
            text: 'Ничего не делаем, проблема решена.',
            isCorrect: false,
            feedback: '⚠️ Без превентивных мер — та же проблема повторится. Pre-trip inspection обязателен по закону!',
            scoreImpact: -10,
          },
          {
            text: 'Вычтем $12 из зарплаты Carlos.',
            isCorrect: false,
            feedback: '⚠️ $12 за лампочку — расход компании на maintenance. Вычитать из зарплаты водителя за износ оборудования незаконно.',
            scoreImpact: -15, moodImpact: -25,
          },
          {
            text: 'Уволим Carlos за нарушение.',
            isCorrect: false,
            feedback: '⚠️ Нерабочая фара — minor violation. Увольнение за это = потеря водителя, расходы на найм нового ($5,000+). Непропорциональная реакция.',
            scoreImpact: -25, moodImpact: -50,
          },
        ],
        afterCorrect: [
          { characterId: 'accountant', text: '$12 записано на Truck 834, категория Maintenance. Дело закрыто. ✅', delay: 400 },
          { characterId: 'owner', text: 'Хорошо. Напомни всем водителям про pre-trip inspection.', delay: 500 },
          { characterId: 'driver_carlos', text: 'Понял, буду проверять фары каждое утро. Спасибо за поддержку, dispatch! 👍', delay: 600 },
        ],
      },
    ],
  },

  // ═══ СЦЕНАРИЙ 4: Трансмиссия ═══
  {
    id: 'transmission',
    type: 'breakdown',
    title: 'Проблема с трансмиссией',
    icon: '⚙️',
    urgency: 'critical',
    totalStars: 2,
    rewards: { xp: 180, money: 0 },
    steps: [
      {
        messages: [
          { characterId: 'driver_john', text: 'Dispatch, у меня проблема! Трансмиссия начала буксовать, слышу странные звуки. Трак теряет мощность. Что делать?', delay: 800 },
        ],
        choices: [
          {
            text: 'John, немедленно останови трак на безопасной обочине. Включи аварийку. Вызываю Tow Truck — ехать дальше нельзя!',
            isCorrect: true,
            feedback: '✅ Правильно! Проблемы с трансмиссией могут привести к полной остановке на дороге. Tow Truck — единственный безопасный вариант.',
            scoreImpact: 20, moodImpact: 5,
          },
          {
            text: 'Попробуй доехать до ближайшего truck stop.',
            isCorrect: false,
            feedback: '⚠️ Езда с неисправной трансмиссией может привести к полному отказу на дороге и ремонту $15,000+. Остановись немедленно!',
            scoreImpact: -15, moodImpact: -10, moneyImpact: -5000,
          },
          {
            text: 'Проверь уровень масла в трансмиссии.',
            isCorrect: false,
            feedback: '⚠️ Если трансмиссия уже буксует — проверка масла не поможет. Нужна диагностика в сервисе. Остановись и вызови Tow Truck.',
            scoreImpact: -10, moodImpact: -5,
          },
          {
            text: 'Продолжай ехать, но медленно.',
            isCorrect: false,
            feedback: '⚠️ Езда с неисправной трансмиссией = риск полного отказа, аварии и ремонта $15,000+. Остановись немедленно!',
            scoreImpact: -20, moodImpact: -15, moneyImpact: -10000,
          },
        ],
        afterCorrect: [
          { characterId: 'driver_john', text: 'Понял, остановился на обочине. Аварийка включена. Жду Tow Truck.', delay: 600 },
        ],
      },
      {
        messages: [
          { characterId: 'mechanic', text: 'Tow Truck выезжает. ETA: 60 минут. Стоимость: $450 буксировка + $150 диагностика. Итого: $600. Отправляю Invoice.', delay: 1000 },
        ],
        choices: [
          {
            text: 'Mike, подтверждаю. Invoice принят. John, Tow Truck будет через час. Держись!',
            isCorrect: true,
            feedback: '✅ Быстрое подтверждение = быстрая помощь. Всегда информируй водителя о ETA.',
            scoreImpact: 20, moodImpact: 10,
          },
          {
            text: 'Слишком дорого. Найди дешевле.',
            isCorrect: false,
            feedback: '⚠️ Tow Truck на Interstate — фиксированные цены. Пока ищешь дешевле — трак стоит, водитель в опасности.',
            scoreImpact: -10, moodImpact: -10,
          },
          {
            text: 'Пусть водитель заплатит сам.',
            isCorrect: false,
            feedback: '⚠️ Расходы на ремонт — ответственность компании, не водителя. Это нарушение трудового договора.',
            scoreImpact: -15, moodImpact: -20,
          },
          {
            text: 'Подождём до завтра, может само пройдёт.',
            isCorrect: false,
            feedback: '⚠️ Трансмиссия не "проходит сама". Водитель стоит на обочине Interstate — каждая минута опасна!',
            scoreImpact: -20, moodImpact: -25,
          },
        ],
        afterCorrect: [
          { characterId: 'mechanic', text: 'Tow Truck прибыл. Буксируем трак в сервис. Диагностика займёт 2-3 часа.', delay: 1200 },
          { characterId: 'accountant', text: '$600 записано на Truck 517, категория Tow & Repair. Дело закрыто. ✅', delay: 600 },
          { characterId: 'driver_john', text: 'Спасибо, dispatch! Трак в сервисе, жду результатов диагностики.', delay: 500 },
        ],
      },
    ],
  },

  // ═══ СЦЕНАРИЙ 5: Перегрев двигателя ═══
  {
    id: 'engine_overheat',
    type: 'breakdown',
    title: 'Перегрев двигателя',
    icon: '🌡️',
    urgency: 'high',
    totalStars: 2,
    rewards: { xp: 160, money: 0 },
    steps: [
      {
        messages: [
          { characterId: 'driver_carlos', text: 'Dispatch! Температура двигателя в красной зоне! Что делать?!', delay: 800 },
        ],
        choices: [
          {
            text: 'Carlos, немедленно останови трак! Выключи двигатель и дай остыть 30 минут. Не открывай радиатор пока горячий!',
            isCorrect: true,
            feedback: '✅ Правильно! Перегрев может привести к повреждению двигателя. Остановка и охлаждение — первый шаг.',
            scoreImpact: 20, moodImpact: 5,
          },
          {
            text: 'Продолжай ехать, включи печку на максимум.',
            isCorrect: false,
            feedback: '⚠️ Печка помогает только при небольшом перегреве. Если температура в красной зоне — останови двигатель немедленно!',
            scoreImpact: -15, moodImpact: -10, moneyImpact: -3000,
          },
          {
            text: 'Открой радиатор и долей воды.',
            isCorrect: false,
            feedback: '⚠️ НИКОГДА не открывай радиатор пока двигатель горячий! Кипящая жидкость под давлением может вызвать ожоги!',
            scoreImpact: -20, moodImpact: -15,
          },
          {
            text: 'Продолжай ехать медленно.',
            isCorrect: false,
            feedback: '⚠️ Езда с перегретым двигателем = риск повреждения головки блока цилиндров. Ремонт $8,000+. Останови немедленно!',
            scoreImpact: -25, moodImpact: -20, moneyImpact: -8000,
          },
        ],
        afterCorrect: [
          { characterId: 'driver_carlos', text: 'Остановился, двигатель выключен. Жду 30 минут.', delay: 600 },
        ],
      },
      {
        messages: [
          { characterId: 'driver_carlos', text: 'Двигатель остыл. Проверил уровень охлаждающей жидкости — низкий. Что дальше?', delay: 800 },
        ],
        choices: [
          {
            text: 'Долей охлаждающую жидкость или воду. Заведи двигатель и следи за температурой. Если снова перегреется — вызываю Roadside Assist.',
            isCorrect: true,
            feedback: '✅ Правильно! Низкий уровень жидкости — частая причина перегрева. Доливка + мониторинг = безопасное решение.',
            scoreImpact: 20, moodImpact: 10,
          },
          {
            text: 'Вызываю Tow Truck сразу.',
            isCorrect: false,
            feedback: '⚠️ Перебор! Если причина — низкий уровень жидкости, доливка решит проблему за 10 минут. Tow Truck = $600 и потеря времени.',
            scoreImpact: -5, moneyImpact: -600,
          },
          {
            text: 'Заведи двигатель без доливки.',
            isCorrect: false,
            feedback: '⚠️ Запуск двигателя без охлаждающей жидкости = гарантированное повреждение. Ремонт $5,000+.',
            scoreImpact: -20, moneyImpact: -5000,
          },
          {
            text: 'Подожди ещё час, может само пройдёт.',
            isCorrect: false,
            feedback: '⚠️ Низкий уровень жидкости не "проходит сам". Нужно долить и проверить на утечки.',
            scoreImpact: -10,
          },
        ],
        afterCorrect: [
          { characterId: 'driver_carlos', text: 'Долил жидкость. Завёл двигатель — температура нормальная! Продолжаю маршрут.', delay: 800 },
          { characterId: 'accountant', text: '$15 за охлаждающую жидкость записано на Truck 834. Дело закрыто. ✅', delay: 600 },
        ],
      },
    ],
  },

  // ═══ СЦЕНАРИЙ 6: Электрическая неисправность ═══
  {
    id: 'electrical_failure',
    type: 'breakdown',
    title: 'Электрическая неисправность',
    icon: '⚡',
    urgency: 'high',
    totalStars: 2,
    rewards: { xp: 150, money: 0 },
    steps: [
      {
        messages: [
          { characterId: 'driver_john', text: 'Dispatch, у меня проблема! Фары мигают, приборная панель глючит. Что это может быть?', delay: 800 },
        ],
        choices: [
          {
            text: 'John, похоже на проблему с аккумулятором или генератором. Останови трак на безопасном месте. Вызываю Roadside Assist для диагностики.',
            isCorrect: true,
            feedback: '✅ Правильно! Электрические проблемы могут привести к полной остановке. Roadside Assist проверит аккумулятор и генератор.',
            scoreImpact: 20, moodImpact: 5,
          },
          {
            text: 'Продолжай ехать, может само пройдёт.',
            isCorrect: false,
            feedback: '⚠️ Электрические проблемы не "проходят сами". Риск полной остановки на дороге. Останови и вызови помощь!',
            scoreImpact: -15, moodImpact: -10,
          },
          {
            text: 'Попробуй перезагрузить трак — выключи и включи зажигание.',
            isCorrect: false,
            feedback: '⚠️ "Перезагрузка" не решит проблему с аккумулятором или генератором. Нужна диагностика специалистом.',
            scoreImpact: -10,
          },
          {
            text: 'Отключи все электроприборы и продолжай ехать.',
            isCorrect: false,
            feedback: '⚠️ Отключение приборов не решит проблему. Если генератор не заряжает — аккумулятор сядет и трак встанет.',
            scoreImpact: -12, moodImpact: -8,
          },
        ],
        afterCorrect: [
          { characterId: 'driver_john', text: 'Остановился на truck stop. Жду механика.', delay: 600 },
        ],
      },
      {
        messages: [
          { characterId: 'mechanic', text: 'Проверил систему. Генератор не заряжает — нужна замена. Стоимость: $450 генератор + $150 работа. Итого: $600. ETA: 2 часа.', delay: 1000 },
        ],
        choices: [
          {
            text: 'Mike, подтверждаю. Меняй генератор. John, ремонт займёт 2 часа.',
            isCorrect: true,
            feedback: '✅ Быстрое решение! Генератор — критически важная деталь. Без него трак не поедет.',
            scoreImpact: 20, moodImpact: 5,
          },
          {
            text: 'Слишком дорого. Найди б/у генератор.',
            isCorrect: false,
            feedback: '⚠️ Б/у генератор может выйти из строя через неделю. Новый = гарантия и надёжность. Экономия $100 = риск $1,000.',
            scoreImpact: -10, moneyImpact: -500,
          },
          {
            text: 'Попробуй просто зарядить аккумулятор.',
            isCorrect: false,
            feedback: '⚠️ Если генератор не работает — зарядка аккумулятора даст 1-2 часа езды, потом трак встанет снова.',
            scoreImpact: -15,
          },
          {
            text: 'Подождём до завтра.',
            isCorrect: false,
            feedback: '⚠️ Груз опаздывает, водитель теряет HOS. Каждый час простоя = потеря денег. Ремонтируй сейчас!',
            scoreImpact: -12,
          },
        ],
        afterCorrect: [
          { characterId: 'mechanic', text: 'Генератор заменён. Система работает отлично. Receipt отправлен.', delay: 1200 },
          { characterId: 'accountant', text: '$600 записано на Truck 517, категория Electrical Repair. Дело закрыто. ✅', delay: 600 },
          { characterId: 'driver_john', text: 'Спасибо! Всё работает, продолжаю маршрут. 👍', delay: 500 },
        ],
      },
    ],
  },

  // ═══ СЦЕНАРИЙ 7: Закончилось топливо ═══
  {
    id: 'out_of_fuel',
    type: 'breakdown',
    title: 'Закончилось топливо',
    icon: '⛽',
    urgency: 'high',
    totalStars: 2,
    rewards: { xp: 120, money: 0 },
    steps: [
      {
        messages: [
          { characterId: 'driver_carlos', text: 'Dispatch... у меня закончилось топливо. Трак встал на обочине I-40. Я думал доеду до следующей заправки...', delay: 800 },
        ],
        choices: [
          {
            text: 'Carlos, включи аварийку и оставайся в кабине. Вызываю Fuel Delivery Service. В будущем — заправляйся при 1/4 бака!',
            isCorrect: true,
            feedback: '✅ Правильно! Fuel Delivery привезёт топливо за 30-60 минут. Правило: заправка при 1/4 бака предотвращает такие ситуации.',
            scoreImpact: 20, moodImpact: 0,
          },
          {
            text: 'Это твоя вина! Вычту стоимость доставки из зарплаты.',
            isCorrect: false,
            feedback: '⚠️ Агрессия не решит проблему. Fuel Delivery — расход компании. Обучи водителя правилу 1/4 бака вместо наказания.',
            scoreImpact: -15, moodImpact: -25,
          },
          {
            text: 'Попроси другого водителя привезти канистру.',
            isCorrect: false,
            feedback: '⚠️ Другой водитель тоже работает! Fuel Delivery Service — профессиональное решение за $150. Не отвлекай других водителей.',
            scoreImpact: -10,
          },
          {
            text: 'Иди пешком до заправки с канистрой.',
            isCorrect: false,
            feedback: '⚠️ Опасно! Ходить пешком по Interstate запрещено. Fuel Delivery Service — безопасное решение.',
            scoreImpact: -20, moodImpact: -15,
          },
        ],
        afterCorrect: [
          { characterId: 'driver_carlos', text: 'Понял, аварийка включена. Жду Fuel Delivery. Извини, больше не допущу.', delay: 600 },
        ],
      },
      {
        messages: [
          { characterId: 'mechanic', text: 'Fuel Delivery выезжает. 50 галлонов дизеля. Стоимость: $200 топливо + $150 доставка. Итого: $350. ETA: 45 минут.', delay: 1000 },
        ],
        choices: [
          {
            text: 'Mike, подтверждаю. Carlos, топливо будет через 45 минут. В будущем — заправка при 1/4 бака обязательна!',
            isCorrect: true,
            feedback: '✅ Быстрое решение + обучение водителя. Правило 1/4 бака предотвращает 99% таких ситуаций.',
            scoreImpact: 20, moodImpact: 5,
          },
          {
            text: 'Слишком дорого. Пусть ждёт до завтра.',
            isCorrect: false,
            feedback: '⚠️ Водитель стоит на обочине Interstate — опасно! Каждый час простоя = потеря денег. $350 < потери от простоя.',
            scoreImpact: -15, moodImpact: -20,
          },
          {
            text: 'Закажи только 20 галлонов, дешевле.',
            isCorrect: false,
            feedback: '⚠️ 20 галлонов = 100 миль. Если следующая заправка дальше — снова встанет. 50 галлонов = безопасный запас.',
            scoreImpact: -10,
          },
          {
            text: 'Вычти $350 из зарплаты Carlos.',
            isCorrect: false,
            feedback: '⚠️ Fuel Delivery — расход компании. Вычитать из зарплаты незаконно. Обучи водителя вместо наказания.',
            scoreImpact: -20, moodImpact: -30,
          },
        ],
        afterCorrect: [
          { characterId: 'mechanic', text: 'Топливо доставлено. 50 галлонов залито. Receipt отправлен.', delay: 1200 },
          { characterId: 'accountant', text: '$350 записано на Truck 834, категория Fuel Delivery. Дело закрыто. ✅', delay: 600 },
          { characterId: 'driver_carlos', text: 'Спасибо, dispatch! Понял правило 1/4 бака. Больше не допущу! 👍', delay: 500 },
        ],
      },
    ],
  },

  // ═══ СЦЕНАРИЙ 8: Утечка масла ═══
  {
    id: 'oil_leak',
    type: 'breakdown',
    title: 'Утечка масла',
    icon: '🛢️',
    urgency: 'high',
    totalStars: 2,
    rewards: { xp: 140, money: 0 },
    steps: [
      {
        messages: [
          { characterId: 'driver_john', text: 'Dispatch, я заметил лужу масла под траком на парковке. Уровень масла низкий. Что делать?', delay: 800 },
        ],
        choices: [
          {
            text: 'John, не заводи двигатель! Утечка масла = риск повреждения двигателя. Вызываю Roadside Assist для диагностики.',
            isCorrect: true,
            feedback: '✅ Правильно! Езда с низким уровнем масла может привести к заклиниванию двигателя. Ремонт $20,000+.',
            scoreImpact: 20, moodImpact: 5,
          },
          {
            text: 'Долей масло и продолжай ехать.',
            isCorrect: false,
            feedback: '⚠️ Если есть утечка — доливка не поможет. Масло вытечет снова. Нужно найти и устранить утечку!',
            scoreImpact: -15, moodImpact: -10, moneyImpact: -5000,
          },
          {
            text: 'Поезжай в ближайший гараж медленно.',
            isCorrect: false,
            feedback: '⚠️ Езда с утечкой масла = риск заклинивания двигателя на дороге. Ремонт $20,000+. Вызови Roadside Assist!',
            scoreImpact: -20, moodImpact: -15, moneyImpact: -10000,
          },
          {
            text: 'Подожди, может утечка остановится сама.',
            isCorrect: false,
            feedback: '⚠️ Утечка масла не "останавливается сама". Нужна диагностика и ремонт. Каждая минута — риск повреждения двигателя.',
            scoreImpact: -12,
          },
        ],
        afterCorrect: [
          { characterId: 'driver_john', text: 'Понял, двигатель не завожу. Жду механика.', delay: 600 },
        ],
      },
      {
        messages: [
          { characterId: 'mechanic', text: 'Нашёл утечку — прокладка масляного поддона. Замена: $280 прокладка + $120 работа + $50 масло. Итого: $450. ETA: 2 часа.', delay: 1000 },
        ],
        choices: [
          {
            text: 'Mike, подтверждаю. Меняй прокладку. John, ремонт займёт 2 часа.',
            isCorrect: true,
            feedback: '✅ Быстрое решение! Прокладка — недорогой ремонт. Без неё — риск заклинивания двигателя за $20,000.',
            scoreImpact: 20, moodImpact: 5,
          },
          {
            text: 'Слишком дорого. Найди дешевле.',
            isCorrect: false,
            feedback: '⚠️ $450 — стандартная цена. Пока ищешь дешевле — трак стоит, груз опаздывает. Потери > $450.',
            scoreImpact: -10,
          },
          {
            text: 'Попробуй просто долить масло.',
            isCorrect: false,
            feedback: '⚠️ Доливка без замены прокладки = масло вытечет снова через 50 миль. Нужен ремонт!',
            scoreImpact: -15, moneyImpact: -200,
          },
          {
            text: 'Используй герметик вместо новой прокладки.',
            isCorrect: false,
            feedback: '⚠️ Герметик — временное решение на 100-200 миль. Новая прокладка = надёжность на 50,000+ миль.',
            scoreImpact: -8,
          },
        ],
        afterCorrect: [
          { characterId: 'mechanic', text: 'Прокладка заменена, масло долито. Утечка устранена. Receipt отправлен.', delay: 1200 },
          { characterId: 'accountant', text: '$450 записано на Truck 517, категория Engine Repair. Дело закрыто. ✅', delay: 600 },
          { characterId: 'driver_john', text: 'Спасибо! Утечки нет, продолжаю маршрут. 👍', delay: 500 },
        ],
      },
    ],
  },
];

// ── УТИЛИТЫ ────────────────────────────────────────────────────────────────

/** Получить случайный сценарий по типу события */
export function getScenarioByType(type: string): EventDialogScenario | null {
  const matching = SCENARIOS.filter(s => s.type === type);
  if (matching.length === 0) return null;
  return matching[Math.floor(Math.random() * matching.length)];
}

/** Получить сценарий для конкретного типа поломки */
export function getScenarioForBreakdown(breakdownLabel: string): EventDialogScenario {
  // Маппинг реальных типов поломок на сценарии
  const label = breakdownLabel.toLowerCase();
  if (label.includes('колес') || label.includes('шин') || label.includes('tire') || label.includes('flat')) {
    return SCENARIOS.find(s => s.id === 'flat_tire') ?? SCENARIOS[0];
  }
  if (label.includes('двигател') || label.includes('перегрел') || label.includes('engine')) {
    return SCENARIOS.find(s => s.id === 'engine_overheat') ?? SCENARIOS[0];
  }
  if (label.includes('электрик') || label.includes('electrical')) {
    return SCENARIOS.find(s => s.id === 'electrical_failure') ?? SCENARIOS[0];
  }
  if (label.includes('топлив') || label.includes('fuel') || label.includes('закончилось')) {
    return SCENARIOS.find(s => s.id === 'out_of_fuel') ?? SCENARIOS[0];
  }
  if (label.includes('масл') || label.includes('oil')) {
    return SCENARIOS.find(s => s.id === 'oil_leak') ?? SCENARIOS[0];
  }
  if (label.includes('трансмисс') || label.includes('transmission')) {
    return SCENARIOS.find(s => s.id === 'transmission') ?? SCENARIOS[0];
  }
  // Fallback — первый подходящий breakdown сценарий
  return SCENARIOS.find(s => s.type === 'breakdown') ?? SCENARIOS[0];
}

/** Получить сценарий по ID */
export function getScenarioById(id: string): EventDialogScenario | null {
  return SCENARIOS.find(s => s.id === id) ?? null;
}

/** Получить персонажа по ID */
export function getCharacter(id: string): DialogCharacter {
  return CHARACTERS[id] ?? CHARACTERS.dispatcher;
}
