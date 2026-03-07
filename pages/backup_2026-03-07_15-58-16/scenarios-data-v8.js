// СИМУЛЬ - База диалогов для обучения диспетчеров
// Версия: Dialogue #8 - Reefer Frozen Food (NEW DIALOG SYSTEM V2.0)
// Дата: 2026-03-07
// ПРАВИЛО: 14 шагов, 6 вариантов качества, ТОРГ ЗА ЦЕНУ!

console.log('🔵 Loading scenarios-data-v8.js...');

// Dialogue #8: Reefer - Seattle WA → Atlanta GA
// Medium-hard difficulty, frozen food transport
// Posted rate: $6,800 ($2.43/mile), Target: $7,200-7,800 ($2.57-2.79/mile)

const scenario8 = {
    id: 8,
    route: "Seattle WA → Atlanta GA",
    distance: 2800,
    equipment: "Reefer (53ft refrigerated)",
    cargo: "Frozen food (ice cream, frozen meals)",
    weight: "44,000 lbs",
    deadline: "Pickup tomorrow 6-10 AM, Delivery in 4 days",
    brokerStyle: "Professional food broker",
    difficulty: "medium-hard",

    initialMessage: "Good morning! This is calling from ColdChain Logistics.\nI saw your load posting for Seattle to Atlanta reefer load.\nIs this load still available?",

    paths: {
        master: [
            // ШАГ 1: Диспетчер звонит и представляется
            {
                brokerQuestion: "Good morning! This is Lisa from FreshMove Brokers.\nYes, load is available.\nWhat's your MC number and where is your reefer right now?",
                dispatcherPrompt: "💎 Брокер проверяет вашу компанию. Представьтесь профессионально.",
                suggestions: [
                    {
                        text: "Good morning Lisa! ColdChain Logistics, MC 334455. We're a 30-truck reefer fleet specializing in frozen food transport. Our reefer is in Seattle right now, just finished delivering at Costco warehouse this morning. Trailer is empty, pre-cooled to -10°F, and ready for frozen cargo. Thermo King unit serviced last week. Where's the pickup?",
                        quality: "excellent",
                        analytics: "✨ Отлично! MC, специализация, местоположение, температура, обслуживание - полная информация!",
                        path: "master"
                    },
                    {
                        text: "Good morning! MC 334455, ColdChain Logistics. Reefer is in Seattle, empty and pre-cooled to -10°F. We handle frozen food regularly.",
                        quality: "good",
                        analytics: "✔️ Хорошо! MC, местоположение, температура, опыт.",
                        path: "master"
                    },
                    {
                        text: "MC 334455, ColdChain Logistics. Reefer in Seattle, ready.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовая информация.",
                        path: "master"
                    },
                    {
                        text: "Uh... MC 334455. Reefer is somewhere in Seattle area.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неточная информация о местоположении.",
                        path: "master"
                    },
                    {
                        text: "Why all these questions? Just give me the rate!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Грубость с первых секунд!",
                        path: "reject1"
                    },
                    {
                        text: "Hi, is the reefer load available?",
                        quality: "fail",
                        analytics: "❌ Провал. Не представился, нет MC номера.",
                        path: "reject1"
                    }
                ]
            },

            // ШАГ 2: Брокер подтверждает + спрашивает о температуре
            {
                brokerQuestion: "MC verified, good rating. Is your reefer unit working properly? This is frozen food at -10°F.",
                dispatcherPrompt: "💎 Брокер проверяет оборудование. Подтвердите что reefer unit исправен.",
                suggestions: [
                    {
                        text: "Yes, Thermo King unit fully operational, serviced last week with maintenance records. Currently pre-cooled to -10°F, fuel tank full. We monitor temperature 24/7 with GPS tracking. Unit has backup battery and alarm system. Ready for frozen cargo.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Детали оборудования, обслуживание, мониторинг, готовность!",
                        path: "master"
                    },
                    {
                        text: "Yes, unit is working perfectly. Pre-cooled to -10°F, serviced recently. We have temperature monitoring.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Подтвердил работу unit и температуру.",
                        path: "master"
                    },
                    {
                        text: "Yes, reefer unit works fine. Ready for -10°F.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "I think the unit is working... should be fine.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенность в оборудовании!",
                        path: "master"
                    },
                    {
                        text: "It's a reefer, of course it works!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Пренебрежение важным вопросом!",
                        path: "reject1"
                    },
                    {
                        text: "The unit had some issues last week...",
                        quality: "fail",
                        analytics: "❌ Провал. Проблемы с оборудованием!",
                        path: "reject1"
                    }
                ]
            },

            // ШАГ 3: Диспетчер дает местоположение + спрашивает детали
            {
                brokerQuestion: "Perfect! 2,800 miles cross-country. Frozen food - ice cream and frozen meals. 44K lbs. Must maintain -10°F throughout transit. Pickup tomorrow 6-10 AM Seattle, delivery in 4 days Atlanta. Can you handle this?",
                dispatcherPrompt: "💎 Брокер дал детали груза. Подтвердите и дайте ETA.",
                suggestions: [
                    {
                        text: "Absolutely! Driver can be at pickup by 7 AM tomorrow, that's early in the window. 2,800 miles in 4 days is comfortable pace. We maintain -10°F with continuous monitoring and have backup plan if unit has issues. We transport frozen food weekly. What's the exact pickup location?",
                        quality: "excellent",
                        analytics: "✨ Отлично! ETA, расчет времени, температурный контроль, backup plan, опыт!",
                        path: "master"
                    },
                    {
                        text: "Yes, works for us. Driver can be there by 8 AM tomorrow. We maintain -10°F with monitoring. Handle frozen food regularly.",
                        quality: "good",
                        analytics: "✔️ Хорошо! ETA, температура, опыт.",
                        path: "master"
                    },
                    {
                        text: "We can do it. Driver will be on time, maintain temperature.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "I think we can make it... 4 days should be enough.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенность в сроках.",
                        path: "master"
                    },
                    {
                        text: "Yeah, we'll get it there. What's the rate?",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Спешка к цене, игнорирование деталей.",
                        path: "reject2"
                    },
                    {
                        text: "Driver won't be empty until tomorrow afternoon...",
                        quality: "fail",
                        analytics: "❌ Провал. Не может забрать в указанное время!",
                        path: "reject2"
                    }
                ]
            },

            // ШАГ 4: Брокер дает детали груза
            {
                brokerQuestion: "Pickup at FrozenFresh Warehouse, 12500 Aurora Ave N, Seattle. Contact: Tom Wilson 206-555-0189. They'll load palletized frozen food, takes about 2 hours. Must verify temperature before loading.",
                dispatcherPrompt: "💎 Брокер дал адрес загрузки. Подтвердите понимание.",
                suggestions: [
                    {
                        text: "Got it - FrozenFresh Warehouse, 12500 Aurora Ave N, Tom Wilson 206-555-0189. Driver will verify -10°F before loading and document with photos. 2-hour loading time, we'll be there by 7 AM. Any special loading procedures?",
                        quality: "excellent",
                        analytics: "✨ Отлично! Повторил детали, температурная проверка, документация, вопрос!",
                        path: "master"
                    },
                    {
                        text: "FrozenFresh Warehouse, Aurora Ave. Driver will verify temperature before loading. Any special requirements?",
                        quality: "good",
                        analytics: "✔️ Хорошо! Подтвердил адрес, температуру, задал вопрос.",
                        path: "master"
                    },
                    {
                        text: "Got the address. Driver will be there and check temperature.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "Okay... Aurora Ave somewhere in Seattle.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неточное понимание адреса.",
                        path: "master"
                    },
                    {
                        text: "I don't need all these details! Just the rate!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Игнорирование важной информации!",
                        path: "reject2"
                    },
                    {
                        text: "Can you text me the address?",
                        quality: "fail",
                        analytics: "❌ Провал. Не записывает информацию!",
                        path: "reject2"
                    }
                ]
            },

            // ШАГ 5: Диспетчер подтверждает + дает ETA
            {
                brokerQuestion: "Standard palletized loading with pallet jacks. Delivery in Atlanta at ColdStorage Depot, 5600 Fulton Industrial Blvd. Contact: Rachel Green 404-555-0176. Delivery window Friday 6 AM - 10 AM. Must maintain -10°F entire trip.",
                dispatcherPrompt: "💎 Брокер дал детали доставки. Подтвердите и спросите о requirements.",
                suggestions: [
                    {
                        text: "Perfect - ColdStorage Depot Atlanta, 5600 Fulton Industrial, Rachel Green 404-555-0176, Friday 6-10 AM. We'll maintain -10°F with continuous monitoring and send temperature logs every 6 hours. Driver will document temp at pickup, in-transit, and delivery. Any fuel stop restrictions?",
                        quality: "excellent",
                        analytics: "✨ Отлично! Повторил детали, температурный мониторинг, документация, важный вопрос!",
                        path: "master"
                    },
                    {
                        text: "Got it - Atlanta delivery Friday morning. We'll maintain -10°F and send temperature updates. Any special requirements?",
                        quality: "good",
                        analytics: "✔️ Хорошо! Подтвердил, температура, вопрос.",
                        path: "master"
                    },
                    {
                        text: "Understood. We'll maintain temperature and deliver on time.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "Okay, Atlanta on Friday. We'll keep it cold.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Слишком мало деталей.",
                        path: "master"
                    },
                    {
                        text: "Yeah, we'll get it there cold. Rate?",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Спешка к цене.",
                        path: "reject2"
                    },
                    {
                        text: "Wait, what was the Atlanta address?",
                        quality: "fail",
                        analytics: "❌ Провал. Не записал информацию!",
                        path: "reject2"
                    }
                ]
            },

            // ШАГ 6: Брокер спрашивает о requirements
            {
                brokerQuestion: "Minimize door openings during transit. No fuel stops longer than 30 minutes. If temperature rises above -5°F, call immediately. You have temperature monitoring system?",
                dispatcherPrompt: "💎 Брокер дал critical requirements. Подтвердите compliance.",
                suggestions: [
                    {
                        text: "Absolutely! We have 24/7 GPS temperature monitoring with real-time alerts. If temp rises above -8°F, system alerts us and driver immediately. Driver trained to minimize door openings and fuel stops under 20 minutes. We'll call you if any issues. This is standard for frozen food.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Детальное подтверждение системы мониторинга и процедур!",
                        path: "master"
                    },
                    {
                        text: "Yes, we have temperature monitoring with alerts. Driver knows to minimize door openings and quick fuel stops. We'll call if any issues.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Подтвердил мониторинг и процедуры.",
                        path: "master"
                    },
                    {
                        text: "Yes, we have monitoring. Driver will follow procedures.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "I think we have some monitoring system...",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенность в системе!",
                        path: "master"
                    },
                    {
                        text: "It's frozen food, it'll stay cold!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Пренебрежение critical requirements!",
                        path: "reject3"
                    },
                    {
                        text: "We don't have temperature monitoring...",
                        quality: "fail",
                        analytics: "❌ Провал. Нет необходимого оборудования!",
                        path: "reject3"
                    }
                ]
            },

            // ШАГ 7: Диспетчер подтверждает compliance
            {
                brokerQuestion: "Excellent! Insurance certificate current? We need $100K minimum cargo coverage for frozen food.",
                dispatcherPrompt: "💎 Брокер спрашивает о страховке. Подтвердите coverage.",
                suggestions: [
                    {
                        text: "Yes, we carry $300K cargo insurance through Northland Insurance. Certificate current, expires March 2027. Covers frozen food and temperature-related claims. I can email it right now to your rate con email.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Детали страховки, покрытие frozen food, готовность отправить!",
                        path: "master"
                    },
                    {
                        text: "Yes, $300K cargo coverage including frozen food. Certificate is current. I'll send it over.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Подтвердил coverage и frozen food.",
                        path: "master"
                    },
                    {
                        text: "Yes, we have cargo insurance for frozen food.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "I think we have enough coverage...",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенность в страховке!",
                        path: "master"
                    },
                    {
                        text: "Insurance is fine! Let's talk rate!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Избегает деталей страховки.",
                        path: "reject3"
                    },
                    {
                        text: "We only have $50K coverage...",
                        quality: "fail",
                        analytics: "❌ Провал. Недостаточная страховка!",
                        path: "reject3"
                    }
                ]
            },

            // ШАГ 8: Брокер спрашивает о rate (ТОРГ НАЧИНАЕТСЯ!)
            {
                brokerQuestion: "Perfect! You're well-equipped for frozen food transport. Let's talk rate. What do you need for 2,800 miles?",
                dispatcherPrompt: "💎 Брокер готов обсудить цену. Назовите ВАШУ цену первым! Чем больше просите - тем лучше!",
                suggestions: [
                    {
                        text: "For 2,800 miles cross-country with frozen food at -10°F, continuous temperature monitoring, 4-day delivery, specialized reefer equipment - I'm looking at $7,800. That's $2.79/mile, fair for the service level and temperature-critical cargo.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Просит $1,000 больше posted ($7,800 vs $6,800). Агрессивный торг с обоснованием!",
                        path: "master"
                    },
                    {
                        text: "$7,500 for this frozen food load. That's $2.68/mile for temperature-controlled cross-country.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Просит $700 больше posted. Хороший торг!",
                        path: "master"
                    },
                    {
                        text: "I'm looking at $7,200 for 2,800 miles.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Просит $400 больше posted. Базовый торг.",
                        path: "master"
                    },
                    {
                        text: "Can you do $7,000?",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Просит только $200 больше posted. Плохой торг!",
                        path: "master"
                    },
                    {
                        text: "I need $9,000 minimum or I'm not interested!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Просит $2,200 больше - нереалистично!",
                        path: "reject4"
                    },
                    {
                        text: "I'll take the $6,800 posted rate!",
                        quality: "fail",
                        analytics: "❌ ПРОВАЛ! Принял posted rate без торга. Потерял $400-1,000!",
                        path: "master"
                    }
                ]
            },

            // ШАГ 9: Брокер отвечает встречным предложением
            {
                brokerQuestion: "That's high, but I see you have proper equipment and monitoring. I can do $7,300. That's $2.61/mile for temperature-controlled cross-country.",
                dispatcherPrompt: "💎 Брокер дает встречное предложение. Решайте - принять или торговаться еще.",
                suggestions: [
                    {
                        text: "I appreciate that. Can we do $7,500? That's fair for both of us with 24/7 monitoring, specialized equipment, and temperature-critical cargo. We'll provide temp logs every 6 hours.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Продолжает торг профессионально, просит еще $200, добавляет value!",
                        path: "master"
                    },
                    {
                        text: "$7,300 works if detention is $100/hr after 2 hours and we get fuel advance.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Принимает с условиями detention и fuel.",
                        path: "master"
                    },
                    {
                        text: "$7,300 works. Let's book it.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Принимает предложение брокера.",
                        path: "master"
                    },
                    {
                        text: "Okay, I guess $7,300 is acceptable...",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенно принимает.",
                        path: "master"
                    },
                    {
                        text: "$7,500 or I walk! This is frozen food!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Ультиматум, риск отказа.",
                        path: "reject4"
                    },
                    {
                        text: "No, I need $7,800 minimum!",
                        quality: "fail",
                        analytics: "❌ Провал. Отказывается от разумного предложения.",
                        path: "reject4"
                    }
                ]
            },

            // ШАГ 10: Брокер финализирует rate
            {
                brokerQuestion: "You drive a hard bargain! I can do $7,400 final. That's $2.64/mile. Detention $100/hr after 2 hours, fuel advance $500. Deal?",
                dispatcherPrompt: "💎 Брокер дает финальное предложение. Это последний шанс!",
                suggestions: [
                    {
                        text: "$7,400 works! Detention $100/hr and $500 fuel advance is perfect. What's the exact pickup address and contact again? We'll take excellent care of this frozen food!",
                        quality: "excellent",
                        analytics: "✨ Отлично! Принимает и сразу к деталям. Заработал $600!",
                        path: "master"
                    },
                    {
                        text: "Perfect! $7,400 with detention and fuel advance. Let's get pickup details.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Четкое принятие. Заработал $600!",
                        path: "master"
                    },
                    {
                        text: "$7,400 confirmed. Pickup address?",
                        quality: "normal",
                        analytics: "⚪ Нормально. Принимает. Заработал $600.",
                        path: "master"
                    },
                    {
                        text: "Okay, $7,400. What's next?",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Заработал $600, но без энтузиазма.",
                        path: "master"
                    },
                    {
                        text: "Fine, $7,400. But I want $150/hr detention!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Новые требования после согласования.",
                        path: "reject4"
                    },
                    {
                        text: "Wait, can we do $7,600?",
                        quality: "fail",
                        analytics: "❌ Провал. Пытается пересмотреть после финала.",
                        path: "reject4"
                    }
                ]
            },

            // ШАГ 11: Брокер финализирует rate + спрашивает factoring
            {
                brokerQuestion: "Deal! $7,400 all-in, detention $100/hr after 2 hours, $500 fuel advance on Comdata. Which factoring company?",
                dispatcherPrompt: "💎 Брокер финализирует rate. Дайте factoring email.",
                suggestions: [
                    {
                        text: "RTS Factoring, factoring@rtsfin.com. I'll send insurance cert and W9 right now.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Factoring email, готовность отправить документы!",
                        path: "master"
                    },
                    {
                        text: "Triumph Factoring, triumph@factoring.com. I'll email insurance cert now.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Factoring email и документы.",
                        path: "master"
                    },
                    {
                        text: "OTR Solutions. I'll send documents.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовая информация.",
                        path: "master"
                    },
                    {
                        text: "Let me find factoring email...",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Не готов с информацией.",
                        path: "master"
                    },
                    {
                        text: "Just send the rate con!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Избегает деталей.",
                        path: "reject4"
                    },
                    {
                        text: "We don't use factoring.",
                        quality: "fail",
                        analytics: "❌ Провал. Проблема с payment!",
                        path: "reject4"
                    }
                ]
            },

            // ШАГ 12: Брокер отправляет Rate Con
            {
                brokerQuestion: "Perfect! Rate con sent to factoring@rtsfin.com with all pickup/delivery details. Sign and return it. After pickup, send BOL and photos to the email on rate con. Maintain -10°F and send temp logs every 6 hours. If this goes well, I have 5-6 frozen food loads weekly. Good luck!",
                dispatcherPrompt: "💎 Брокер отправил Rate Con. Поблагодарите профессионально.",
                suggestions: [
                    {
                        text: "Thank you Lisa! We'll sign and return rate con right away. Driver will maintain -10°F with continuous monitoring and send temp logs every 6 hours. Looking forward to working together on future frozen food loads!",
                        quality: "excellent",
                        analytics: "✨ Отлично! Подтверждение Rate Con, температура, интерес к будущим грузам!",
                        path: "master"
                    },
                    {
                        text: "Thank you! We'll sign rate con and send temp updates regularly. Looking forward to more loads!",
                        quality: "good",
                        analytics: "✔️ Хорошо! Подтверждение и интерес.",
                        path: "master"
                    },
                    {
                        text: "Thank you, we'll take care of it.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовая благодарность.",
                        path: "master"
                    },
                    {
                        text: "Okay, thanks.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Слишком короткая благодарность.",
                        path: "master"
                    },
                    {
                        text: "Yeah, we got it.",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Грубость в конце.",
                        path: "master"
                    },
                    {
                        text: "Wait, what was the pickup address?",
                        quality: "fail",
                        analytics: "❌ Провал. Не понял что все в Rate Con!",
                        path: "master"
                    }
                ]
            },

            // ШАГ 13: OUTCOME
            {
                brokerResponse: "Perfect! Rate con with all details sent to factoring@rtsfin.com. Sign and return. After pickup send BOL and photos. Keep me updated on temperature. Safe travels!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$7,400",
                    ratePerMile: "$2.64/mile",
                    relationship: "strengthened",
                    dialogueTime: "7-8 minutes",
                    questionsAsked: "Professional, detailed questions about temperature and monitoring",
                    detailLevel: "very high",
                    futureOpportunity: "repeat",
                    weeklyLoads: "5-6 frozen food loads weekly Seattle-East Coast",
                    feedback: `✅ ЧТО СДЕЛАНО ПРАВИЛЬНО:

Вы провели отличные переговоры по Reefer грузу с замороженными продуктами! Заработали $600 больше posted rate ($7,400 vs $6,800).

1. Профессиональное представление - MC, специализация на frozen food, детали оборудования
2. Подтвердили работу reefer unit с обслуживанием
3. Детали температурного мониторинга 24/7 с alerts
4. Записали все pickup/delivery детали
5. Подтвердили страховку $300K covering frozen food
6. ОТЛИЧНЫЙ ТОРГ - начали с $7,800, получили $7,400 ($2.64/mile)
7. Дали factoring и обещали temp logs каждые 6 часов

💡 КЛЮЧЕВОЙ УРОК:

Reefer грузы с frozen food требуют:
- Исправный reefer unit (Thermo King/Carrier)
- Maintain -10°F throughout transit (critical!)
- 24/7 temperature monitoring with alerts
- Minimize door openings (max 30 min fuel stops)
- High cargo insurance ($100K+ for frozen food)
- Temperature logs and documentation

Торг за цену:
- Posted: $6,800 ($2.43/mile)
- Вы просили: $7,800 ($2.79/mile) - агрессивно!
- Брокер предложил: $7,300 ($2.61/mile) - среднее
- Вы продолжили торг: $7,500
- Финал: $7,400 ($2.64/mile) + detention $100/hr + fuel $500

Заработали $600 больше = 9% прибавка!

🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:

Frozen food loads - это 35% всех Reefer грузов. Они платят premium rates ($2.50-2.80/mile) потому что:

1. Temperature-critical - если temp поднимется выше -5°F, весь груз испорчен
2. High-value cargo - ice cream стоит $50K-100K+
3. Specialized equipment - reefer unit должен работать идеально
4. Continuous monitoring - нужен 24/7 GPS temp tracking
5. Time-sensitive - frozen food не может ждать

Один temperature failure = $100K+ claim и вы в blacklist!

Всегда торгуйтесь агрессивно на frozen food! Начинайте с +15-20% от posted rate. Брокеры знают что это temperature-critical cargo и готовы платить premium.

Cross-country frozen loads (2,500+ miles) требуют:
- Team drivers или tight schedule
- Multiple fuel stops (quick, under 30 min)
- Backup plan if unit fails
- Temperature documentation at every stop

Ваш профессионализм и детальный план мониторинга принесли вам repeat business - 5-6 loads weekly! Это $30,000-37,000 дополнительного дохода в месяц!

Frozen food - это золотая жила для reefer carriers кто знает как правильно работать с temperature-critical cargo!`
                }
            }
        ],

        // REJECT PATH 1: Непрофессиональное поведение или проблемы с оборудованием
        reject1: [
            {},
            {
                brokerResponse: "I need a professional carrier with reliable reefer equipment. Let me call someone else. Thanks anyway.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    ratePerMile: "$0/mile",
                    relationship: "rejected",
                    dialogueTime: "1-2 minutes",
                    questionsAsked: "None - unprofessional or equipment issues",
                    detailLevel: "none",
                    futureOpportunity: "none",
                    weeklyLoads: "No loads",
                    feedback: `❌ ЧТО ПОШЛО НЕ ТАК:

Брокер отказал из-за непрофессионального поведения или проблем с reefer оборудованием.

Ошибки:
1. Не представились или не знали MC номер
2. Reefer unit имеет проблемы или не обслуживался
3. Неуверенность в работе оборудования
4. Грубость или агрессия с первых слов

💡 КЛЮЧЕВОЙ УРОК:

Frozen food loads требуют ИДЕАЛЬНОГО reefer оборудования!

Брокер проверяет:
- Reefer unit работает? (Thermo King/Carrier)
- Когда последнее обслуживание?
- Может поддерживать -10°F?
- Есть temperature monitoring?

Если вы говорите "The unit had some issues last week" - это instant reject! Брокер не будет рисковать $100K+ frozen food cargo с ненадежным оборудованием.

Также критически важно профессиональное представление:
- MC номер
- Специализация на frozen food
- Точное местоположение
- Детали оборудования

🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:

В реальности frozen food brokers очень строгие с equipment requirements. Один temperature failure = весь груз испорчен = $100K+ claim.

Они работают только с carriers кто:
1. Имеет исправный reefer unit с recent service
2. Может подтвердить temperature capability
3. Имеет monitoring system
4. Профессионально коммуницирует

Если ваш reefer unit имел проблемы - СНАЧАЛА почините, ПОТОМ звоните!

Правильный ответ:
"Thermo King unit fully operational, serviced last week. Currently pre-cooled to -10°F. We have 24/7 temperature monitoring with alerts."

Потеряли $7,400 груз и возможность 5-6 loads weekly ($30,000-37,000/месяц) из-за проблем с оборудованием или непрофессионализма!`
                }
            }
        ],

        // REJECT PATH 2: Не может забрать вовремя или не записывает детали
        reject2: [
            {},
            {
                brokerResponse: "I need a carrier who can meet the tight schedule and pay attention to temperature-critical details. Let me call someone more reliable. Thanks anyway.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    ratePerMile: "$0/mile",
                    relationship: "rejected",
                    dialogueTime: "2-3 minutes",
                    questionsAsked: "Minimal - didn't gather critical temperature information",
                    detailLevel: "low",
                    futureOpportunity: "none",
                    weeklyLoads: "No loads",
                    feedback: `❌ ЧТО ПОШЛО НЕ ТАК:

Брокер отказал из-за проблем со сроками или невнимательности к temperature-critical деталям.

Ошибки:
1. Водитель не может забрать вовремя (pickup tomorrow 6-10 AM)
2. Не записывали адреса, контакты, temperature requirements
3. Просили повторить critical information
4. Игнорировали temperature details

💡 КЛЮЧЕВОЙ УРОК:

Frozen food loads имеют STRICT deadlines и temperature requirements!

Pickup tomorrow 6-10 AM означает:
- Shipper начинает loading в 6 AM
- Груз должен быть в пути до 10 AM
- Каждый час delay = temperature risk

Если ваш водитель будет пустой только afternoon - вы опоздаете на 4-6 часов! Frozen food не может ждать.

Также критически важно записывать ВСЕ temperature details:
- Maintain -10°F entire trip
- Minimize door openings
- Fuel stops under 30 minutes
- Call if temp rises above -5°F

Если вы просите "What was the temperature requirement?" - это показывает что вы не понимаете серьезность frozen food transport!

🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:

В реальности frozen food shippers ОЧЕНЬ строгие:
- Missed pickup window = cancelled load
- Temperature failure = $100K+ claim
- Late delivery = spoiled product

Брокеры работают только с carriers кто:
1. Может забрать в strict time window
2. Записывает ВСЕ temperature requirements
3. Понимает critical nature of frozen food
4. Не просит повторять information

Один missed pickup или temperature failure = blacklist!

Правильный подход:
- Записывайте КАЖДУЮ деталь
- Повторяйте temperature requirements
- Подтверждайте time windows
- Задавайте вопросы о temperature monitoring

Потеряли $7,400 груз из-за того что не могли забрать вовремя или не записали temperature-critical details!`
                }
            }
        ],

        // REJECT PATH 3: Нет temperature monitoring или недостаточная страховка
        reject3: [
            {},
            {
                brokerResponse: "I need a carrier with proper temperature monitoring system and adequate insurance for frozen food. Let me find someone qualified. Thanks anyway.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    ratePerMile: "$0/mile",
                    relationship: "rejected",
                    dialogueTime: "3-4 minutes",
                    questionsAsked: "Some questions but failed on equipment/insurance requirements",
                    detailLevel: "medium",
                    futureOpportunity: "none",
                    weeklyLoads: "No loads",
                    feedback: `❌ ЧТО ПОШЛО НЕ ТАК:

Брокер отказал из-за отсутствия temperature monitoring system или недостаточной страховки.

Ошибки:
1. Нет 24/7 temperature monitoring system
2. Недостаточная cargo insurance (нужно $100K+, есть только $50K)
3. Пренебрежение temperature requirements
4. Неуверенность в monitoring capabilities

💡 КЛЮЧЕВОЙ УРОК:

Frozen food loads требуют ОБЯЗАТЕЛЬНОГО temperature monitoring!

Необходимое оборудование:
1. 24/7 GPS temperature monitoring
   - Real-time alerts if temp rises
   - Temperature logs every hour
   - Historical data tracking

2. High cargo insurance:
   - Minimum $100K for frozen food
   - $300K preferred
   - Must cover temperature-related claims
   - Certificate must be current

3. Backup procedures:
   - What if temp rises?
   - Emergency contact plan
   - Nearest reefer repair shops

Если вы говорите "We don't have temperature monitoring" - это instant reject! Брокер не будет рисковать $100K+ frozen food без visibility.

🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:

В реальности frozen food cargo стоит $100K-200K+. Если temperature поднимется выше -5°F даже на 2 часа - весь груз испорчен!

Ice cream melts at -5°F
Frozen meals spoil at 0°F
Bacteria grows rapidly above 32°F

Один temperature failure = total loss!

Брокеры требуют:
- 24/7 monitoring with alerts
- Temperature logs sent every 6 hours
- Immediate notification if issues
- High insurance coverage

Без monitoring system вы НЕ МОЖЕТЕ брать frozen food loads!

Investment в monitoring:
- GPS temp tracker: $500-1,000
- Monthly monitoring: $50-100
- High insurance: $200-300/month extra

Это окупается за 2-3 frozen loads!

Правильный ответ:
"We have 24/7 GPS temperature monitoring with real-time alerts. If temp rises above -8°F, system alerts us immediately. $300K cargo insurance covering temperature-related claims."

Потеряли $7,400 груз из-за отсутствия proper monitoring или insurance. Инвестируйте в equipment - это окупится!`
                }
            }
        ],

        // REJECT PATH 4: Нереалистичные требования по цене
        reject4: [
            {},
            {
                brokerResponse: "That rate is unrealistic for this market. I can't go that high. Let me call someone more reasonable. Thanks anyway.",
                outcome: {
                    type: "failure",
                    quality: "poor",
                    rate: "$0",
                    ratePerMile: "$0/mile",
                    relationship: "damaged",
                    dialogueTime: "5-6 minutes",
                    questionsAsked: "Good questions but failed on rate negotiation",
                    detailLevel: "high",
                    futureOpportunity: "unlikely",
                    weeklyLoads: "No loads",
                    feedback: `❌ ЧТО ПОШЛО НЕ ТАК:

Брокер отказал из-за нереалистичных требований по цене или агрессивного торга.

Ошибки:
1. Просили слишком много ($9,000 vs posted $6,800 = +32%)
2. Отказались от разумного предложения ($7,300-7,400)
3. Ультиматумы ("$7,500 or I walk!")
4. Новые требования после согласования

💡 КЛЮЧЕВОЙ УРОК:

Торг должен быть агрессивным но РЕАЛИСТИЧНЫМ!

Market rates для Reefer frozen food:
- Standard reefer: $2.30-2.50/mile
- Frozen food: $2.50-2.70/mile
- Cross-country premium: +$0.10-0.20/mile
- Temperature monitoring: +$0.05-0.10/mile

Posted rate: $6,800 ($2.43/mile)
Realistic ask: $7,200-7,800 ($2.57-2.79/mile) = +6-15%
Unrealistic ask: $9,000+ ($3.21/mile) = +32%

Брокер предложил $7,300 ($2.61/mile) - это ОТЛИЧНОЕ предложение! +$500 от posted rate + detention + fuel advance.

Если вы отказываетесь или требуете еще больше - брокер найдет другого reefer carrier за 5 минут.

🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:

В реальности рынок определяет цены. Reefer rates выше чем dry van, но не безгранично.

Правильная стратегия торга:
1. Начните агрессивно: +15-20% от posted
2. Брокер предложит среднее: +7-10%
3. Торгуйтесь еще раз: +10-12%
4. Принимайте разумное предложение

Пример:
- Posted: $6,800
- Вы просите: $7,800 (+15%)
- Брокер: $7,300 (+7%)
- Вы: $7,500 (+10%)
- Финал: $7,400 (+9%) + detention + fuel

Это win-win! Вы заработали $600 больше + detention + fuel advance, брокер получил надежного reefer carrier.

Frozen food loads платят premium потому что:
- Temperature-critical cargo
- Specialized equipment required
- 24/7 monitoring needed
- High insurance coverage
- Risk of total loss

Но premium имеет limits! $9,000 для 2,800 miles = $3.21/mile - это нереально для frozen food.

Потеряли $7,400 груз + detention + fuel advance из-за жадности. Лучше заработать $600 больше чем $0!

Также потеряли repeat business - 5-6 loads weekly = $30,000-37,000/месяц!`
                }
            }
        ]
    }
};

// Добавляем сценарий в глобальный массив
if (typeof allScenarios !== 'undefined') {
    allScenarios.push(scenario8);
    console.log('✅ Scenario 8 (Reefer Frozen Food) added to allScenarios');
} else {
    console.warn('⚠️ allScenarios array not found');
}
