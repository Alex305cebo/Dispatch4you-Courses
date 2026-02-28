// База данных практических кейсов
const casesDatabase = [
    {
        id: 1,
        title: "Задержка доставки",
        description: "Водитель в пробке, опоздание на 3 часа. Склад закрывается в 17:00",
        difficulty: "easy",
        category: "Логистика",
        icon: "⏰",
        solution: "Связаться с получателем немедленно, предложить альтернативы (утро/вечер), уведомить брокера о ситуации",
        tags: ["Коммуникация", "Планирование"],
        priority: "Высокий",
        metrics: {
            cost: "$0-200",
            successRate: "85%",
            timeToSolve: "15-20 мин",
            frequency: "Часто",
            impact: "Средний",
            riskLevel: "Низкий"
        },
        tips: "Всегда держите контакты получателя под рукой. Уведомляйте о задержках заранее.",
        consequences: "Возможные штрафы за опоздание, недовольство клиента"
    },
    {
        id: 2,
        title: "Торг со ставкой",
        description: "1,400 миль LA→Dallas. Брокер: $1.50/миля. Рынок: $2.80/миля",
        difficulty: "medium",
        category: "Переговоры",
        icon: "💰",
        solution: "Показать рыночные данные DAT, обосновать расходы на топливо, встречное предложение: $2.50/миля",
        tags: ["Торг", "Анализ рынка"],
        priority: "Критический",
        metrics: {
            cost: "$0-1,820",
            successRate: "70%",
            timeToSolve: "30-45 мин",
            frequency: "Ежедневно",
            impact: "Высокий",
            riskLevel: "Средний"
        },
        tips: "Используйте DAT для подтверждения рыночных ставок. Будьте готовы отказаться от невыгодных грузов.",
        consequences: "Потеря прибыли при согласии на низкую ставку"
    },
    {
        id: 3,
        title: "Поломка трака",
        description: "Двигатель сломался. До пункта 600 миль. Срок доставки: 18 часов",
        difficulty: "hard",
        category: "Кризис",
        icon: "🔧",
        solution: "Оценить время ремонта, срочно уведомить брокера, рассмотреть power-only или перегрузку",
        tags: ["Кризис", "Решения"],
        priority: "Критический",
        metrics: {
            cost: "$500-3,000",
            successRate: "60%",
            timeToSolve: "1-2 часа",
            frequency: "Редко",
            impact: "Критический",
            riskLevel: "Высокий"
        },
        tips: "Имейте список проверенных механиков по маршруту. Страхование breakdown важно.",
        consequences: "Срыв сроков, штрафы, потеря репутации"
    },
    {
        id: 4,
        title: "Отказ приемки",
        description: "Получатель отказывается принять груз. Документы в порядке",
        difficulty: "hard",
        category: "Документация",
        icon: "📋",
        solution: "Фото: адрес, BOL, груз. Связь с брокером и shipper. Refused delivery form",
        tags: ["Документы", "Защита"],
        priority: "Критический",
        metrics: {
            cost: "$200-1,000",
            successRate: "75%",
            timeToSolve: "45-60 мин",
            frequency: "Иногда",
            impact: "Критический",
            riskLevel: "Высокий"
        },
        tips: "Документируйте всё: фото, видео, подписи свидетелей. Не покидайте место без инструкций.",
        consequences: "Дополнительные расходы на хранение, простой"
    },
    {
        id: 5,
        title: "Неверный адрес",
        description: "Водитель приехал по адресу, но склада нет. Контакт не отвечает",
        difficulty: "medium",
        category: "Логистика",
        icon: "📍",
        solution: "Проверить все документы, связаться с брокером, использовать Google Maps для поиска альтернатив",
        tags: ["Навигация", "Проблемы"],
        priority: "Высокий",
        metrics: {
            cost: "$50-300",
            successRate: "80%",
            timeToSolve: "20-30 мин",
            frequency: "Иногда",
            impact: "Средний",
            riskLevel: "Низкий"
        },
        tips: "Всегда проверяйте адрес перед отправкой. Звоните получателю за день до доставки.",
        consequences: "Потеря времени, возможные штрафы за опоздание"
    },
    {
        id: 6,
        title: "Перегруз трака",
        description: "На весах обнаружен перегруз 2,000 lbs. Штраф $500+",
        difficulty: "medium",
        category: "Безопасность",
        icon: "⚖️",
        solution: "Немедленно остановить движение, связаться с shipper для перегрузки, документировать все",
        tags: ["Безопасность", "Штрафы"],
        priority: "Критический",
        metrics: {
            cost: "$500-2,000",
            successRate: "90%",
            timeToSolve: "2-4 часа",
            frequency: "Редко",
            impact: "Высокий",
            riskLevel: "Критический"
        },
        tips: "Всегда взвешивайте груз перед отправкой. Знайте лимиты по штатам.",
        consequences: "Штрафы DOT, возможная остановка операций"
    },
    {
        id: 7,
        title: "Повреждение груза",
        description: "При разгрузке обнаружены повреждения 3 паллет из 20",
        difficulty: "hard",
        category: "Страхование",
        icon: "📦",
        solution: "Фото повреждений, подписи свидетелей, немедленный claim report, уведомление страховой",
        tags: ["Страхование", "Документация"],
        priority: "Высокий",
        metrics: {
            cost: "$1,000-10,000",
            successRate: "65%",
            timeToSolve: "1-2 часа",
            frequency: "Иногда",
            impact: "Высокий",
            riskLevel: "Высокий"
        },
        tips: "Фотографируйте груз при погрузке и разгрузке. Отмечайте повреждения в BOL.",
        consequences: "Финансовые потери, страховые выплаты, судебные иски"
    },
    {
        id: 8,
        title: "Нехватка часов HOS",
        description: "Водителю осталось 2 часа, до доставки 4 часа езды",
        difficulty: "medium",
        category: "Регуляции",
        icon: "⏱️",
        solution: "Найти ближайший rest area, согласовать задержку с получателем, не нарушать HOS",
        tags: ["HOS", "Планирование"],
        priority: "Критический",
        metrics: {
            cost: "$0-100",
            successRate: "95%",
            timeToSolve: "30 мин",
            frequency: "Часто",
            impact: "Средний",
            riskLevel: "Критический"
        },
        tips: "Планируйте маршруты с учетом HOS. Используйте ELD для отслеживания часов.",
        consequences: "Штрафы DOT до $16,000, out-of-service order"
    },
    {
        id: 9,
        title: "Двойной букинг",
        description: "Два брокера забукировали один и тот же трак на одно время",
        difficulty: "hard",
        category: "Организация",
        icon: "🔄",
        solution: "Проверить все подтверждения, выбрать более выгодный груз, извиниться перед вторым брокером",
        tags: ["Организация", "Этика"],
        priority: "Высокий",
        metrics: {
            cost: "$0-500",
            successRate: "70%",
            timeToSolve: "15-20 мин",
            frequency: "Редко",
            impact: "Высокий",
            riskLevel: "Средний"
        },
        tips: "Используйте систему управления грузами. Подтверждайте букинги письменно.",
        consequences: "Потеря репутации, возможные штрафы, потеря клиента"
    },
    {
        id: 10,
        title: "Низкая ставка на обратный путь",
        description: "Доставили груз в удаленный район. Обратно только $1.20/миля",
        difficulty: "easy",
        category: "Планирование",
        icon: "🔙",
        solution: "Искать частичные грузы, проверить соседние города, рассмотреть deadhead если выгоднее",
        tags: ["Маршруты", "Оптимизация"],
        priority: "Средний",
        metrics: {
            cost: "$0-400",
            successRate: "75%",
            timeToSolve: "30-60 мин",
            frequency: "Часто",
            impact: "Средний",
            riskLevel: "Низкий"
        },
        tips: "Планируйте обратные грузы заранее. Используйте load boards для поиска.",
        consequences: "Снижение прибыли, пустой пробег"
    },
    {
        id: 11,
        title: "Требование предоплаты",
        description: "Новый брокер требует работать без rate confirmation",
        difficulty: "medium",
        category: "Безопасность",
        icon: "⚠️",
        solution: "Проверить MC number, отказаться без rate con, требовать стандартные документы",
        tags: ["Безопасность", "Мошенничество"],
        priority: "Критический",
        metrics: {
            cost: "$0-5,000",
            successRate: "100%",
            timeToSolve: "10-15 мин",
            frequency: "Иногда",
            impact: "Критический",
            riskLevel: "Критический"
        },
        tips: "Всегда проверяйте брокеров через FMCSA. Никогда не работайте без документов.",
        consequences: "Риск мошенничества, неоплата за груз"
    },
    {
        id: 12,
        title: "Задержка оплаты",
        description: "Брокер не платит 45 дней. Сумма $3,500",
        difficulty: "hard",
        category: "Финансы",
        icon: "💵",
        solution: "Проверить контракт, отправить formal notice, рассмотреть factoring или коллекторов",
        tags: ["Финансы", "Права"],
        priority: "Критический",
        metrics: {
            cost: "$100-1,000",
            successRate: "80%",
            timeToSolve: "Недели",
            frequency: "Иногда",
            impact: "Критический",
            riskLevel: "Высокий"
        },
        tips: "Используйте factoring для быстрых выплат. Проверяйте payment terms перед работой.",
        consequences: "Проблемы с cash flow, возможные судебные издержки"
    }
];

// Функция для получения случайных кейсов
function getRandomCases(count = 4) {
    const shuffled = [...casesDatabase].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Функция для получения кейса по ID
function getCaseById(id) {
    return casesDatabase.find(c => c.id === id);
}

// Экспорт для использования
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { casesDatabase, getRandomCases, getCaseById };
}
