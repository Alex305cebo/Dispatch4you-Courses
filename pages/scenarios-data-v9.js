// СИМУЛЬ - База диалогов для обучения диспетчеров
// Версия: Dialogue #9 - Dry Van Retail Products (NEW DIALOG SYSTEM V2.0)
// Дата: 2026-03-07
// ПРАВИЛО: 14 шагов, 6 вариантов качества, ТОРГ ЗА ЦЕНУ, Rate Con!

console.log('🔵 Loading scenarios-data-v9.js...');

// Dialogue #9: Dry Van - Chicago IL → Dallas TX
// Medium difficulty, retail products
// Posted rate: $1,800 ($2.31/mile), Target: $1,950-2,100 ($2.50-2.69/mile)

const scenario9 = {
    id: 9,
    route: "Chicago IL → Dallas TX",
    distance: 780,
    equipment: "Dry Van (53ft)",
    cargo: "Retail products (clothing, home goods)",
    weight: "38,000 lbs",
    deadline: "Pickup tomorrow 8-12 AM, Delivery in 2 days",
    brokerStyle: "Professional retail broker",
    difficulty: "medium",

    initialMessage: "Good afternoon! This is Robert Johnson from Midwest Carriers.\nI saw your load posting for Chicago to Dallas dry van.\nIs this load still available?",

    paths: {
        master: [
            // ШАГ 1: Диспетчер звонит и представляется
            {
                brokerQuestion: "Good afternoon! This is Jennifer from RetailFreight Brokers.\nYes, load is available.\nWhat's your MC number?",
                dispatcherPrompt: "💎 Брокер проверяет вашу компанию. Представьтесь: MC номер, название компании, размер флота, специализация (retail freight). Чем больше деталей - тем профессиональнее!",
                suggestions: [
                    {
                        text: "Good afternoon Jennifer! Midwest Carriers, MC 223344. We're a 40-truck fleet specializing in retail freight with good safety rating. Where's your truck right now?",
                        quality: "excellent",
                        analytics: "✨ Отлично! MC, компания, размер флота, специализация, safety rating - полная информация!",
                        path: "master"
                    },
                    {
                        text: "Good afternoon! MC 223344, Midwest Carriers. We handle retail loads regularly.",
                        quality: "good",
                        analytics: "✔️ Хорошо! MC, компания, опыт.",
                        path: "master"
                    },
                    {
                        text: "MC 223344, Midwest Carriers.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовая информация, но нет деталей о специализации.",
                        path: "master"
                    },
                    {
                        text: "Uh... MC 223344 I think.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенность в собственном MC номере!",
                        path: "master"
                    },
                    {
                        text: "Why do you need MC? Just tell me the rate!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно! Грубость, нет профессионализма.",
                        path: "reject1"
                    },
                    {
                        text: "Hi, is the load available?",
                        quality: "fail",
                        analytics: "❌ Провал! Не представился, не дал MC номер.",
                        path: "reject1"
                    }
                ]
            },

            // ШАГ 2: Брокер подтверждает + спрашивает местоположение
            {
                brokerQuestion: "MC verified, good rating. Where's your truck right now?",
                dispatcherPrompt: "💎 Брокер хочет знать местоположение водителя. Дайте ТОЧНЫЙ адрес или landmark (distribution center, truck stop), статус (empty/loaded), когда освободился. Точность = профессионализм!",
                suggestions: [
                    {
                        text: "Truck's in Chicago, empty at distribution center near O'Hare. Driver just finished delivery this morning. Ready to load tomorrow.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Точное местоположение (O'Hare), статус (empty), время, готовность!",
                        path: "master"
                    },
                    {
                        text: "In Chicago, empty since this morning. Ready for pickup tomorrow.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Местоположение и готовность.",
                        path: "master"
                    },
                    {
                        text: "Chicago area, empty and ready.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовая информация, но неточное местоположение.",
                        path: "master"
                    },
                    {
                        text: "Somewhere in Chicago...",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Очень неточное местоположение, нет уверенности.",
                        path: "master"
                    },
                    {
                        text: "Just tell me pickup address and rate!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно! Не отвечает на вопрос, грубость.",
                        path: "reject1"
                    },
                    {
                        text: "Let me check where the driver is...",
                        quality: "fail",
                        analytics: "❌ Провал! Не знает где его водитель!",
                        path: "reject1"
                    }
                ]
            },

            // ШАГ 3: Диспетчер дает местоположение + спрашивает детали
            {
                brokerQuestion: "Perfect! 780 miles Chicago to Dallas. Retail products - clothing and home goods. 38K lbs. Pickup tomorrow 8-12 AM, delivery in 2 days. Works for you?",
                dispatcherPrompt: "💎 Брокер дал основные детали груза. Подтвердите: расстояние (780 mi), время pickup (8-12 AM), delivery (2 days). Дайте ETA. Спросите о special requirements (handling, equipment). Вопросы = профессионализм!",
                suggestions: [
                    {
                        text: "Perfect! Driver can be at pickup by 9 AM tomorrow. 780 miles in 2 days is comfortable. We handle retail freight regularly. Any special handling requirements?",
                        quality: "excellent",
                        analytics: "✨ Отлично! Конкретный ETA (9 AM), расчет времени (2 days comfortable), опыт с retail, важный вопрос!",
                        path: "master"
                    },
                    {
                        text: "Yes, works for us. Driver can be there by 10 AM tomorrow. Any special requirements?",
                        quality: "good",
                        analytics: "✔️ Хорошо! ETA и вопрос.",
                        path: "master"
                    },
                    {
                        text: "We can do it. Driver will be on time.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение, но нет ETA и вопросов.",
                        path: "master"
                    },
                    {
                        text: "I think we can make it...",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенность в возможности выполнить в срок!",
                        path: "master"
                    },
                    {
                        text: "Yeah, whatever. What's the rate?",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Пренебрежение деталями.",
                        path: "reject2"
                    },
                    {
                        text: "Driver won't be empty until tomorrow afternoon...",
                        quality: "fail",
                        analytics: "❌ Провал. Не может забрать вовремя!",
                        path: "reject2"
                    }
                ]
            },

            // ШАГ 4: Брокер дает requirements
            {
                brokerQuestion: "Standard dry van freight. Load locks required. Cargo is palletized and shrink-wrapped. No special handling needed. All details in rate con.",
                dispatcherPrompt: "💎 Брокер назвал requirements: load locks, palletized cargo. Подтвердите что у вас есть load locks. Упомяните опыт водителя с retail freight. Готовность оборудования = получите груз!",
                suggestions: [
                    {
                        text: "Perfect! We have load locks ready. Driver experienced with retail freight. Trailer is clean and dry. Ready to go!",
                        quality: "excellent",
                        analytics: "✨ Отлично! Подтверждение оборудования, опыт, готовность!",
                        path: "master"
                    },
                    {
                        text: "Yes, we have load locks. Driver knows retail freight procedures.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Подтвердил оборудование и опыт.",
                        path: "master"
                    },
                    {
                        text: "Yes, we have load locks.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "I think we have load locks...",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенность в оборудовании!",
                        path: "master"
                    },
                    {
                        text: "It's just retail stuff, we'll handle it!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Пренебрежение!",
                        path: "reject3"
                    },
                    {
                        text: "We don't have load locks...",
                        quality: "fail",
                        analytics: "❌ Провал. Нет необходимого оборудования!",
                        path: "reject3"
                    }
                ]
            },

            // ШАГ 5: Брокер спрашивает о страховке
            {
                brokerQuestion: "Good! Insurance certificate current? We need $100K cargo coverage.",
                dispatcherPrompt: "💎 Брокер проверяет страховку. Назовите: сумму покрытия ($100K+), страховую компанию, срок действия. Предложите отправить certificate сразу. Страховка = доверие!",
                suggestions: [
                    {
                        text: "Yes, $100K cargo insurance through Northland. Certificate current, expires June 2027. I can email it right now.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Детали страховки, готовность отправить!",
                        path: "master"
                    },
                    {
                        text: "Yes, $100K cargo coverage. Certificate is current. I'll send it over.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Подтвердил coverage.",
                        path: "master"
                    },
                    {
                        text: "Yes, we have cargo insurance.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "I think we have enough coverage...",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенность!",
                        path: "master"
                    },
                    {
                        text: "Insurance is fine! Let's talk rate!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Избегает деталей.",
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

            // ШАГ 6: Брокер спрашивает о rate (ТОРГ НАЧИНАЕТСЯ!)
            {
                brokerQuestion: "Perfect! You're well-prepared. Let's talk rate. What do you need for 780 miles?",
                dispatcherPrompt: "💎 ТОРГ ЗА ЦЕНУ! Брокер спрашивает ВАШУ цену. Назовите цену ПЕРВЫМ! Posted rate $1,800 - просите $2,000-2,100 ($2.56-2.69/mile). Чем больше просите - тем больше заработаете! Обоснуйте: retail handling, equipment, service.",
                suggestions: [
                    {
                        text: "For 780 miles with retail freight, I'm looking at $2,100. That's $2.69/mile, fair for the service level.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Просит $300 больше posted ($2,100 vs $1,800). Агрессивный торг!",
                        path: "master"
                    },
                    {
                        text: "$2,000 for this load. That's $2.56/mile.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Просит $200 больше posted. Хороший торг!",
                        path: "master"
                    },
                    {
                        text: "I'm looking at $1,950 for 780 miles.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Просит $150 больше posted. Базовый торг.",
                        path: "master"
                    },
                    {
                        text: "Can you do $1,850?",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Просит только $50 больше posted. Плохой торг!",
                        path: "master"
                    },
                    {
                        text: "I need $2,500 minimum or I'm not interested!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Просит $700 больше - нереалистично!",
                        path: "reject4"
                    },
                    {
                        text: "I'll take the $1,800 posted rate!",
                        quality: "fail",
                        analytics: "❌ ПРОВАЛ! Принял posted rate без торга. Потерял $150-300!",
                        path: "master"
                    }
                ]
            },

            // ШАГ 7: Брокер отвечает встречным предложением
            {
                brokerQuestion: "That's a bit high. I can do $1,950. That's $2.50/mile.",
                dispatcherPrompt: "💎 Брокер дал встречное предложение $1,950 (вы просили $2,100). Варианты: 1) Встречное $2,000, 2) Принять $1,950 + добавить условие (detention), 3) Принять $1,950. НЕ стойте на $2,100 - потеряете груз!",
                suggestions: [
                    {
                        text: "Can we meet at $2,000? That's fair for both of us.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Встречное предложение посередине, профессиональное обоснование!",
                        path: "master"
                    },
                    {
                        text: "$1,950 works if detention is $75/hr after 2 hours.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Принимает, но добавляет условие detention - умная тактика!",
                        path: "master"
                    },
                    {
                        text: "$1,950 works. Let's book it.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Принимает без дополнительных условий.",
                        path: "master"
                    },
                    {
                        text: "Okay, I guess $1,950 is acceptable...",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенность, нет энтузиазма.",
                        path: "master"
                    },
                    {
                        text: "$2,000 or I walk!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно! Ультиматум вместо переговоров, риск потерять груз.",
                        path: "reject4"
                    },
                    {
                        text: "No, I need $2,100 minimum!",
                        quality: "fail",
                        analytics: "❌ Провал! Не гибкий в переговорах, потеряет груз.",
                        path: "reject4"
                    }
                ]
            },

            // ШАГ 8: Брокер финализирует rate
            {
                brokerQuestion: "You drive a hard bargain! $1,975 final. That's $2.53/mile. Detention $75/hr after 2 hours. Deal?",
                dispatcherPrompt: "💎 ФИНАЛЬНОЕ ПРЕДЛОЖЕНИЕ! Брокер дал $1,975 (вы просили $2,100, posted $1,800). Вы заработали $175 больше! Это ПОСЛЕДНИЙ шанс - принимайте! Скажите 'Deal!' и спросите про factoring. НЕ торгуйтесь дальше!",
                suggestions: [
                    {
                        text: "$1,975 works! Detention $75/hr is fair. Which factoring?",
                        quality: "excellent",
                        analytics: "✨ Отлично! Принимает и сразу к деталям. Заработал $175!",
                        path: "master"
                    },
                    {
                        text: "Perfect! $1,975 with detention. Let's finalize.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Четкое принятие. Заработал $175!",
                        path: "master"
                    },
                    {
                        text: "$1,975 confirmed.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Принимает. Заработал $175.",
                        path: "master"
                    },
                    {
                        text: "Okay, $1,975.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Заработал $175, но без энтузиазма.",
                        path: "master"
                    },
                    {
                        text: "Fine, but I want $100/hr detention!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Новые требования после согласования.",
                        path: "reject4"
                    },
                    {
                        text: "Can we do $2,000?",
                        quality: "fail",
                        analytics: "❌ Провал. Пытается пересмотреть после финала.",
                        path: "reject4"
                    }
                ]
            },

            // ШАГ 9: Брокер спрашивает factoring
            {
                brokerQuestion: "Deal! $1,975 all-in, detention $75/hr after 2 hours. Which factoring company?",
                dispatcherPrompt: "💎 Брокер финализирует rate и спрашивает про factoring. Дайте: название factoring компании + email адрес. Предложите отправить insurance certificate сразу. Быстрый ответ = профессионализм!",
                suggestions: [
                    {
                        text: "RTS Factoring, factoring@rtsfin.com. Sending insurance cert now.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Factoring email, готовность отправить документы!",
                        path: "master"
                    },
                    {
                        text: "Triumph Factoring, triumph@factoring.com. I'll email cert.",
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

            // ШАГ 10: Брокер отправляет Rate Con
            {
                brokerQuestion: "Perfect! Rate con sent to factoring@rtsfin.com with all pickup/delivery details. Sign and return it. After pickup, send BOL and photos. If this goes well, I have 8-10 retail loads weekly Chicago-Texas. Good luck!",
                dispatcherPrompt: "💎 УСПЕХ! Брокер отправил Rate Con и предлагает 8-10 loads weekly! Поблагодарите профессионально, подтвердите что подпишете rate con, отправите BOL/photos. Выразите интерес к будущим грузам. Хорошие отношения = постоянные грузы!",
                suggestions: [
                    {
                        text: "Thank you Jennifer! We'll sign and return rate con right away. Driver will send updates and photos. Looking forward to working together on future retail loads!",
                        quality: "excellent",
                        analytics: "✨ Отлично! Подтверждение Rate Con, updates, интерес к будущим грузам!",
                        path: "master"
                    },
                    {
                        text: "Thank you! We'll sign rate con and keep you updated. Looking forward to more loads!",
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
                        text: "Wait, what was the pickup time?",
                        quality: "fail",
                        analytics: "❌ Провал. Не понял что все в Rate Con!",
                        path: "master"
                    }
                ]
            },

            // ШАГ 11: OUTCOME
            {
                brokerResponse: "Perfect! Rate con with all details sent. Sign and return. After pickup send BOL and photos. Safe travels!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$1,975",
                    ratePerMile: "$2.53/mile",
                    relationship: "strengthened",
                    dialogueTime: "5-6 minutes",
                    questionsAsked: "Professional, focused questions",
                    detailLevel: "high",
                    futureOpportunity: "repeat",
                    weeklyLoads: "8-10 retail loads weekly Chicago-Texas",
                    feedback: `✅ ЧТО СДЕЛАНО ПРАВИЛЬНО:

Отличные переговоры по Dry Van retail freight! Заработали $175 больше posted rate ($1,975 vs $1,800).

1. Профессиональное представление - MC, специализация
2. Точная информация о местоположении
3. Подтвердили load locks и страховку
4. ХОРОШИЙ ТОРГ - начали с $2,100, получили $1,975 ($2.53/mile)
5. Дали factoring и обещали updates

💡 КЛЮЧЕВОЙ УРОК:

Retail freight - это стандартные Dry Van грузы:
- Load locks required
- Palletized cargo
- Standard handling
- $100K cargo insurance

Торг за цену:
- Posted: $1,800 ($2.31/mile)
- Вы просили: $2,100 ($2.69/mile) - агрессивно!
- Брокер предложил: $1,950 ($2.50/mile)
- Вы продолжили: $2,000
- Финал: $1,975 ($2.53/mile)

Заработали $175 больше = 10% прибавка!

🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:

Retail loads - это 50% всех Dry Van грузов. Они платят standard rates ($2.30-2.60/mile).

Всегда торгуйтесь! Начинайте с +15-20% от posted. Брокеры готовы платить больше за надежных carriers.

Ваш профессионализм принес repeat business - 8-10 loads weekly! Это $15,000-20,000 дополнительного дохода в месяц!`
                }
            }
        ],

        // REJECT PATHS
        reject1: [
            {},
            {
                brokerResponse: "I need a professional carrier. Let me call someone else. Thanks anyway.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    ratePerMile: "$0/mile",
                    relationship: "rejected",
                    dialogueTime: "1-2 minutes",
                    questionsAsked: "None",
                    detailLevel: "none",
                    futureOpportunity: "none",
                    weeklyLoads: "No loads",
                    feedback: "❌ Брокер отказал из-за непрофессионального поведения с первых секунд. Потеряли $1,975 груз и 8-10 loads weekly ($15,000-20,000/месяц)!"
                }
            }
        ],

        reject2: [
            {},
            {
                brokerResponse: "I need a carrier who can meet the schedule. Let me call someone more reliable. Thanks anyway.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    ratePerMile: "$0/mile",
                    relationship: "rejected",
                    dialogueTime: "2-3 minutes",
                    questionsAsked: "Minimal",
                    detailLevel: "low",
                    futureOpportunity: "none",
                    weeklyLoads: "No loads",
                    feedback: "❌ Брокер отказал из-за проблем со сроками. Pickup tomorrow 8-12 AM - strict deadline! Потеряли $1,975 груз!"
                }
            }
        ],

        reject3: [
            {},
            {
                brokerResponse: "I need a carrier with proper equipment and insurance. Let me find someone qualified. Thanks anyway.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    ratePerMile: "$0/mile",
                    relationship: "rejected",
                    dialogueTime: "3-4 minutes",
                    questionsAsked: "Some questions but failed on requirements",
                    detailLevel: "medium",
                    futureOpportunity: "none",
                    weeklyLoads: "No loads",
                    feedback: "❌ Брокер отказал из-за отсутствия load locks или недостаточной страховки. Retail freight требует $100K cargo insurance!"
                }
            }
        ],

        reject4: [
            {},
            {
                brokerResponse: "That rate is unrealistic. I can't go that high. Let me call someone more reasonable. Thanks anyway.",
                outcome: {
                    type: "failure",
                    quality: "poor",
                    rate: "$0",
                    ratePerMile: "$0/mile",
                    relationship: "damaged",
                    dialogueTime: "4-5 minutes",
                    questionsAsked: "Good questions but failed on rate",
                    detailLevel: "high",
                    futureOpportunity: "unlikely",
                    weeklyLoads: "No loads",
                    feedback: "❌ Брокер отказал из-за нереалистичных требований. Market rate для retail: $2.30-2.60/mile. $2,500 ($3.21/mile) = нереально!"
                }
            }
        ]
    }
};

// Добавляем сценарий в глобальный массив
if (typeof allScenarios !== 'undefined') {
    allScenarios.push(scenario9);
    console.log('✅ Scenario 9 (Dry Van Retail) added to allScenarios');
} else {
    console.warn('⚠️ allScenarios array not found');
}
