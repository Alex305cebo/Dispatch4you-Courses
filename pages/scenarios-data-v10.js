// СИМУЛЬ - База диалогов для обучения диспетчеров
// Версия: Dialogue #10 - Reefer Dairy Products (NEW DIALOG SYSTEM V2.0)
// Дата: 2026-03-07
// ПРАВИЛО: 14 шагов, 6 вариантов качества, ТОРГ ЗА ЦЕНУ, Rate Con!

console.log('🔵 Loading scenarios-data-v10.js...');

// Dialogue #10: Reefer - Los Angeles CA → Denver CO
// Medium difficulty, dairy products
// Posted rate: $2,200 ($2.68/mile), Target: $2,400-2,600 ($2.93-3.17/mile)

const scenario10 = {
    id: 10,
    route: "Los Angeles CA → Denver CO",
    distance: 820,
    equipment: "Reefer (53ft refrigerated)",
    cargo: "Dairy products (milk, cheese, yogurt)",
    weight: "42,000 lbs",
    deadline: "Pickup today 4-8 PM, Delivery tomorrow by 6 PM",
    brokerStyle: "Professional dairy broker",
    difficulty: "medium",

    initialMessage: "Good morning! This is James Rodriguez from WestCoast Reefer.\nI saw your load posting for LA to Denver reefer load.\nIs this load still available?",

    paths: {
        master: [
            // ШАГ 1
            {
                brokerQuestion: "Good morning! This is Mark from DairyFreight Brokers.\nYes, load is available.\nWhat's your MC number and where is your reefer?",
                dispatcherPrompt: "💎 Брокер проверяет вашу компанию. Представьтесь: MC номер, название компании, размер флота, специализация (reefer/dairy). Укажите где reefer сейчас. Чем больше деталей - тем профессиональнее!",
                suggestions: [
                    {
                        text: "Good morning Mark! WestCoast Reefer, MC 556677. We're a 25-truck reefer fleet specializing in dairy transport. Reefer is in LA, empty at dairy terminal. Unit pre-cooled to 36°F. Where's the pickup?",
                        quality: "excellent",
                        analytics: "✨ Отлично! MC, специализация, местоположение, температура!",
                        path: "master"
                    },
                    {
                        text: "Good morning! MC 556677, WestCoast Reefer. Reefer in LA, pre-cooled to 36°F. We handle dairy regularly.",
                        quality: "good",
                        analytics: "✔️ Хорошо! MC, местоположение, температура.",
                        path: "master"
                    },
                    {
                        text: "MC 556677, WestCoast Reefer. Reefer in LA, ready.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовая информация.",
                        path: "master"
                    },
                    {
                        text: "MC 556677. Reefer somewhere in LA area.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неточная информация.",
                        path: "master"
                    },
                    {
                        text: "Why all these questions? Just the rate!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Грубость!",
                        path: "reject1"
                    },
                    {
                        text: "Hi, is the reefer load available?",
                        quality: "fail",
                        analytics: "❌ Провал. Не представился!",
                        path: "reject1"
                    }
                ]
            },

            // ШАГ 2
            {
                brokerQuestion: "MC verified. Is your reefer unit working properly? This is dairy at 36-38°F.",
                dispatcherPrompt: "💎 Брокер проверяет reefer unit. Подтвердите: unit работает, температура 36-38°F достижима, когда последний раз обслуживался, есть ли temperature monitoring. Исправное оборудование = получите груз!",
                suggestions: [
                    {
                        text: "Yes, Carrier unit fully operational, serviced 2 weeks ago. Currently at 36°F, fuel tank full. We monitor temperature 24/7. Ready for dairy.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Детали unit, обслуживание, мониторинг!",
                        path: "master"
                    },
                    {
                        text: "Yes, unit working perfectly. At 36°F, serviced recently. We have temp monitoring.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Подтвердил работу unit.",
                        path: "master"
                    },
                    {
                        text: "Yes, reefer unit works fine. Ready for 36°F.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "I think the unit is working...",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенность!",
                        path: "master"
                    },
                    {
                        text: "It's a reefer, of course it works!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Пренебрежение!",
                        path: "reject1"
                    },
                    {
                        text: "The unit had issues yesterday...",
                        quality: "fail",
                        analytics: "❌ Провал. Проблемы с оборудованием!",
                        path: "reject1"
                    }
                ]
            },

            // ШАГ 3
            {
                brokerQuestion: "Perfect! 820 miles LA to Denver. Dairy products - milk, cheese, yogurt. 42K lbs. Must maintain 36-38°F. Pickup today 4-8 PM, delivery tomorrow by 6 PM. Can you handle this?",
                dispatcherPrompt: "💎 Брокер дал детали груза. Подтвердите: расстояние (820 mi), температура (36-38°F), pickup (today 4-8 PM), delivery (tomorrow 6 PM). Дайте ETA. Спросите о temperature monitoring requirements. Вопросы = профессионализм!",
                suggestions: [
                    {
                        text: "Absolutely! Driver can be at pickup by 5 PM today. 820 miles overnight is doable. We maintain 36-38°F with continuous monitoring. We transport dairy weekly. Any special requirements?",
                        quality: "excellent",
                        analytics: "✨ Отлично! ETA, расчет, температура, опыт, вопрос!",
                        path: "master"
                    },
                    {
                        text: "Yes, works for us. Driver can be there by 6 PM today. We maintain 36-38°F with monitoring.",
                        quality: "good",
                        analytics: "✔️ Хорошо! ETA и температура.",
                        path: "master"
                    },
                    {
                        text: "We can do it. Driver will maintain temperature.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "I think we can make it...",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенность.",
                        path: "master"
                    },
                    {
                        text: "Yeah, we'll get it there. Rate?",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Спешка к цене.",
                        path: "reject2"
                    },
                    {
                        text: "Driver won't be empty until tonight...",
                        quality: "fail",
                        analytics: "❌ Провал. Не может забрать вовремя!",
                        path: "reject2"
                    }
                ]
            },

            // ШАГ 4
            {
                brokerQuestion: "Minimize door openings. No fuel stops longer than 20 minutes. If temp rises above 40°F, call immediately. All details in rate con.",
                dispatcherPrompt: "💎 Брокер дал КРИТИЧЕСКИЕ требования для dairy: минимум door openings, fuel stops max 20 min, звонить если temp >40°F. Подтвердите понимание КАЖДОГО требования. Compliance = безопасность груза!",
                suggestions: [
                    {
                        text: "Absolutely! We have GPS temp monitoring with alerts. Driver trained to minimize door openings and quick fuel stops. We'll call if any issues. Standard for dairy.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Детальное подтверждение процедур!",
                        path: "master"
                    },
                    {
                        text: "Yes, we have temp monitoring with alerts. Driver knows procedures. We'll call if issues.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Подтвердил мониторинг.",
                        path: "master"
                    },
                    {
                        text: "Yes, we have monitoring. Driver will follow procedures.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "I think we have monitoring...",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенность!",
                        path: "master"
                    },
                    {
                        text: "It's dairy, it'll stay cold!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Пренебрежение!",
                        path: "reject3"
                    },
                    {
                        text: "We don't have temp monitoring...",
                        quality: "fail",
                        analytics: "❌ Провал. Нет оборудования!",
                        path: "reject3"
                    }
                ]
            },

            // ШАГ 5
            {
                brokerQuestion: "Good! Insurance certificate current? We need $100K cargo coverage for dairy.",
                dispatcherPrompt: "💎 Брокер проверяет страховку для dairy. Назовите: сумму покрытия ($100K+), страховую компанию, срок действия. Предложите отправить certificate сразу. Страховка = доверие!",
                suggestions: [
                    {
                        text: "Yes, $150K cargo insurance through Progressive. Certificate current, covers dairy and temp claims. I can email it now.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Детали страховки, покрытие dairy!",
                        path: "master"
                    },
                    {
                        text: "Yes, $150K cargo coverage including dairy. Certificate current. I'll send it.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Подтвердил coverage.",
                        path: "master"
                    },
                    {
                        text: "Yes, we have cargo insurance for dairy.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "I think we have enough...",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенность!",
                        path: "master"
                    },
                    {
                        text: "Insurance is fine! Rate?",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Избегает деталей.",
                        path: "reject3"
                    },
                    {
                        text: "We only have $50K...",
                        quality: "fail",
                        analytics: "❌ Провал. Недостаточная страховка!",
                        path: "reject3"
                    }
                ]
            },

            // ШАГ 6: ТОРГ
            {
                brokerQuestion: "Perfect! You're well-equipped for dairy. Let's talk rate. What do you need for 820 miles?",
                dispatcherPrompt: "💎 ТОРГ ЗА ЦЕНУ! Брокер спрашивает ВАШУ цену. Назовите цену ПЕРВЫМ! Posted rate $2,300 - просите $2,550-2,650 ($3.11-3.23/mile). Reefer dairy платит больше! Обоснуйте: temperature control, monitoring, dairy experience.",
                suggestions: [
                    {
                        text: "For 820 miles with dairy at 36-38°F, continuous monitoring, overnight delivery - I'm looking at $2,600. That's $3.17/mile for temperature-critical cargo.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Просит $400 больше posted!",
                        path: "master"
                    },
                    {
                        text: "$2,500 for this dairy load. That's $3.05/mile.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Просит $300 больше!",
                        path: "master"
                    },
                    {
                        text: "I'm looking at $2,400 for 820 miles.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Просит $200 больше.",
                        path: "master"
                    },
                    {
                        text: "Can you do $2,300?",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Только $100 больше!",
                        path: "master"
                    },
                    {
                        text: "I need $3,000 minimum!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Нереалистично!",
                        path: "reject4"
                    },
                    {
                        text: "I'll take $2,200 posted!",
                        quality: "fail",
                        analytics: "❌ ПРОВАЛ! Без торга!",
                        path: "master"
                    }
                ]
            },

            // ШАГ 7
            {
                brokerQuestion: "That's high. I can do $2,450. That's $2.99/mile for temp-controlled.",
                dispatcherPrompt: "💎 Брокер дал встречное предложение $2,450 (вы просили $2,650). Варианты: 1) Встречное $2,500-2,550, 2) Принять $2,450 + добавить условие (detention $100/hr), 3) Принять $2,450. НЕ стойте на $2,650 - потеряете груз!",
                suggestions: [
                    {
                        text: "Can we meet at $2,500? Fair for both with 24/7 monitoring and overnight delivery.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Продолжает торг!",
                        path: "master"
                    },
                    {
                        text: "$2,450 works if detention is $100/hr after 2 hours.",
                        quality: "good",
                        analytics: "✔️ Хорошо! С условием detention.",
                        path: "master"
                    },
                    {
                        text: "$2,450 works. Let's book it.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Принимает.",
                        path: "master"
                    },
                    {
                        text: "Okay, $2,450 I guess...",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенно.",
                        path: "master"
                    },
                    {
                        text: "$2,500 or I walk!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Ультиматум.",
                        path: "reject4"
                    },
                    {
                        text: "No, I need $2,600!",
                        quality: "fail",
                        analytics: "❌ Провал. Отказывается.",
                        path: "reject4"
                    }
                ]
            },

            // ШАГ 8
            {
                brokerQuestion: "$2,475 final. That's $3.02/mile. Detention $100/hr after 2 hours. Deal?",
                dispatcherPrompt: "💎 ФИНАЛЬНОЕ ПРЕДЛОЖЕНИЕ! Брокер дал $2,475 (вы просили $2,650, posted $2,300). Вы заработали $175 больше! Это ПОСЛЕДНИЙ шанс - принимайте! Скажите 'Deal!' и спросите про factoring. НЕ торгуйтесь дальше!",
                suggestions: [
                    {
                        text: "$2,475 works! Which factoring?",
                        quality: "excellent",
                        analytics: "✨ Отлично! Заработал $275!",
                        path: "master"
                    },
                    {
                        text: "Perfect! $2,475 with detention.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Заработал $275!",
                        path: "master"
                    },
                    {
                        text: "$2,475 confirmed.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Заработал $275.",
                        path: "master"
                    },
                    {
                        text: "Okay, $2,475.",
                        quality: "weak",
                        analytics: "⚠️ Слабо.",
                        path: "master"
                    },
                    {
                        text: "I want $150/hr detention!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Новые требования.",
                        path: "reject4"
                    },
                    {
                        text: "Can we do $2,500?",
                        quality: "fail",
                        analytics: "❌ Провал. Пересмотр после финала.",
                        path: "reject4"
                    }
                ]
            },

            // ШАГ 9
            {
                brokerQuestion: "Deal! $2,475 all-in, detention $100/hr. Which factoring?",
                dispatcherPrompt: "💎 Брокер финализирует rate и спрашивает про factoring. Дайте: название factoring компании + email адрес. Предложите отправить insurance certificate сразу. Быстрый ответ = профессионализм!",
                suggestions: [
                    {
                        text: "RTS Factoring, factoring@rtsfin.com. Sending insurance cert now.",
                        quality: "excellent",
                        analytics: "✨ Отлично!",
                        path: "master"
                    },
                    {
                        text: "Triumph Factoring, triumph@factoring.com.",
                        quality: "good",
                        analytics: "✔️ Хорошо!",
                        path: "master"
                    },
                    {
                        text: "OTR Solutions.",
                        quality: "normal",
                        analytics: "⚪ Нормально.",
                        path: "master"
                    },
                    {
                        text: "Let me find email...",
                        quality: "weak",
                        analytics: "⚠️ Слабо.",
                        path: "master"
                    },
                    {
                        text: "Just send rate con!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно.",
                        path: "reject4"
                    },
                    {
                        text: "We don't use factoring.",
                        quality: "fail",
                        analytics: "❌ Провал!",
                        path: "reject4"
                    }
                ]
            },

            // ШАГ 10
            {
                brokerQuestion: "Perfect! Rate con sent to factoring@rtsfin.com with all details. Sign and return. After pickup send BOL and photos. Maintain 36-38°F and send temp logs. If this goes well, I have 6-8 dairy loads weekly LA-Denver. Good luck!",
                dispatcherPrompt: "💎 УСПЕХ! Брокер отправил Rate Con и предлагает 6-8 dairy loads weekly! Поблагодарите профессионально, подтвердите что подпишете rate con, будете отправлять temp logs. Выразите интерес к будущим dairy грузам. Хорошие отношения = постоянные грузы!",
                suggestions: [
                    {
                        text: "Thank you Mark! We'll sign rate con right away. Driver will maintain 36-38°F and send temp logs. Looking forward to more dairy loads!",
                        quality: "excellent",
                        analytics: "✨ Отлично!",
                        path: "master"
                    },
                    {
                        text: "Thank you! We'll sign and send updates. Looking forward to more loads!",
                        quality: "good",
                        analytics: "✔️ Хорошо!",
                        path: "master"
                    },
                    {
                        text: "Thank you, we'll take care of it.",
                        quality: "normal",
                        analytics: "⚪ Нормально.",
                        path: "master"
                    },
                    {
                        text: "Okay, thanks.",
                        quality: "weak",
                        analytics: "⚠️ Слабо.",
                        path: "master"
                    },
                    {
                        text: "Yeah, got it.",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно.",
                        path: "master"
                    },
                    {
                        text: "What was the temp requirement?",
                        quality: "fail",
                        analytics: "❌ Провал!",
                        path: "master"
                    }
                ]
            },

            // ШАГ 11: OUTCOME
            {
                brokerResponse: "Perfect! Rate con sent. Sign and return. Maintain 36-38°F. Safe travels!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$2,475",
                    ratePerMile: "$3.02/mile",
                    relationship: "strengthened",
                    dialogueTime: "6-7 minutes",
                    questionsAsked: "Professional dairy questions",
                    detailLevel: "very high",
                    futureOpportunity: "repeat",
                    weeklyLoads: "6-8 dairy loads weekly LA-Denver",
                    feedback: `✅ Отличные переговоры по Reefer dairy! Заработали $275 больше ($2,475 vs $2,200).

💡 УРОК: Dairy требует 36-38°F, temp monitoring, quick fuel stops. Торг: Posted $2,200 → Вы $2,600 → Финал $2,475 ($3.02/mile). Заработали $275 = 13% прибавка!

🎯 РЕАЛЬНОСТЬ: Dairy loads платят premium ($2.80-3.20/mile) за temp-critical cargo. Ваш профессионализм = 6-8 loads weekly ($14,000-20,000/месяц)!`
                }
            }
        ],

        reject1: [{}, { brokerResponse: "I need professional carrier. Thanks anyway.", outcome: { type: "failure", quality: "fail", rate: "$0", ratePerMile: "$0/mile", relationship: "rejected", dialogueTime: "1-2 min", questionsAsked: "None", detailLevel: "none", futureOpportunity: "none", weeklyLoads: "No loads", feedback: "❌ Непрофессионализм или проблемы с reefer unit!" } }],
        reject2: [{}, { brokerResponse: "I need carrier who can meet schedule. Thanks anyway.", outcome: { type: "failure", quality: "fail", rate: "$0", ratePerMile: "$0/mile", relationship: "rejected", dialogueTime: "2-3 min", questionsAsked: "Minimal", detailLevel: "low", futureOpportunity: "none", weeklyLoads: "No loads", feedback: "❌ Не может забрать вовремя!" } }],
        reject3: [{}, { brokerResponse: "I need carrier with proper monitoring and insurance. Thanks anyway.", outcome: { type: "failure", quality: "fail", rate: "$0", ratePerMile: "$0/mile", relationship: "rejected", dialogueTime: "3-4 min", questionsAsked: "Some", detailLevel: "medium", futureOpportunity: "none", weeklyLoads: "No loads", feedback: "❌ Нет temp monitoring или недостаточная страховка!" } }],
        reject4: [{}, { brokerResponse: "That rate is unrealistic. Thanks anyway.", outcome: { type: "failure", quality: "poor", rate: "$0", ratePerMile: "$0/mile", relationship: "damaged", dialogueTime: "4-5 min", questionsAsked: "Good", detailLevel: "high", futureOpportunity: "unlikely", weeklyLoads: "No loads", feedback: "❌ Нереалистичные требования по цене!" } }]
    }
};

if (typeof allScenarios !== 'undefined') {
    allScenarios.push(scenario10);
    console.log('✅ Scenario 10 (Reefer Dairy) added');
} else {
    console.warn('⚠️ allScenarios not found');
}
