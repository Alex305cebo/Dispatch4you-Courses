// СИМУЛЬ - База диалогов для обучения диспетчеров
// Версия: Dialogue #7 - Dry Van Electronics (NEW DIALOG SYSTEM V2.0)
// Дата: 2026-03-07
// ПРАВИЛО: 14 шагов, 6 вариантов качества, ТОРГ ЗА ЦЕНУ!

console.log('🔵 Loading scenarios-data-v7.js...');

// Dialogue #7: Dry Van - Phoenix AZ → Miami FL
// Medium difficulty, electronics transport
// Posted rate: $5,500 ($2.29/mile), Target: $6,000-6,500 ($2.50-2.71/mile)

const scenario7 = {
    id: 7,
    route: "Phoenix AZ → Miami FL",
    distance: 2400,
    equipment: "Dry Van (53ft)",
    cargo: "Electronics (laptops, tablets, smartphones)",
    weight: "42,000 lbs",
    deadline: "Pickup today 2-6 PM, Delivery Thursday noon",
    brokerStyle: "Professional electronics broker",
    difficulty: "medium",

    initialMessage: "Good morning! This is calling from FastTrack Logistics.\nI saw your load posting for Phoenix to Miami electronics.\nIs this load still available?",

    paths: {
        master: [
            // ШАГ 1: Диспетчер звонит и представляется
            {
                brokerQuestion: "Good morning! This is Mike from TechFreight Brokers.\nYes, load is available.\nWhat's your MC number and company name?",
                dispatcherPrompt: "💎 Брокер проверяет вашу компанию. Представьтесь профессионально.",
                suggestions: [
                    {
                        text: "Good morning Mike! FastTrack Logistics, MC 445566. We're a 50-truck fleet specializing in high-value electronics with full cargo insurance and real-time tracking. Safety rating Satisfactory, 5 years in business. Where's your truck right now?",
                        quality: "excellent",
                        analytics: "✨ Отлично! MC, компания, специализация, страховка, опыт - полная информация!",
                        path: "master"
                    },
                    {
                        text: "Good morning! MC 445566, FastTrack Logistics. We handle electronics regularly with full insurance coverage. Good safety rating.",
                        quality: "good",
                        analytics: "✔️ Хорошо! MC, компания, опыт с электроникой.",
                        path: "master"
                    },
                    {
                        text: "MC 445566, FastTrack Logistics.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Минимальная информация.",
                        path: "master"
                    },
                    {
                        text: "Uh... let me find the MC number... 445566 I think.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенность, непрофессионально.",
                        path: "master"
                    },
                    {
                        text: "Why do you need all this info? Just tell me the rate!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Грубость с первых секунд!",
                        path: "reject1"
                    },
                    {
                        text: "Hi, is the load available?",
                        quality: "fail",
                        analytics: "❌ Провал. Не представился, нет MC номера.",
                        path: "reject1"
                    }
                ]
            },

            // ШАГ 2: Брокер подтверждает + спрашивает MC
            {
                brokerQuestion: "MC verified, good rating. Where's your truck right now?",
                dispatcherPrompt: "💎 Брокер хочет знать местоположение. Дайте точную информацию.",
                suggestions: [
                    {
                        text: "Truck's in Phoenix, empty at distribution center on West Buckeye Road. Driver just finished delivery 2 hours ago, did post-trip inspection. Ready to load today. What's the pickup time?",
                        quality: "excellent",
                        analytics: "✨ Отлично! Точное местоположение, статус, готовность.",
                        path: "master"
                    },
                    {
                        text: "In Phoenix, empty since this morning. Ready for pickup today.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Местоположение и готовность.",
                        path: "master"
                    },
                    {
                        text: "Phoenix area, empty and ready.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовая информация.",
                        path: "master"
                    },
                    {
                        text: "Somewhere in Phoenix... I think.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неточная информация.",
                        path: "master"
                    },
                    {
                        text: "Just tell me the pickup address and rate!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Нетерпеливость.",
                        path: "reject1"
                    },
                    {
                        text: "Let me check where the driver is...",
                        quality: "fail",
                        analytics: "❌ Провал. Не знает местоположение своего водителя!",
                        path: "reject1"
                    }
                ]
            },

            // ШАГ 3: Диспетчер дает местоположение + спрашивает детали
            {
                brokerQuestion: "Perfect! 2,400 miles cross-country. High-value electronics - laptops, tablets, smartphones. 42K lbs. Pickup today 2-6 PM Phoenix, delivery Thursday noon Miami. Works for you?",
                dispatcherPrompt: "💎 Брокер дал детали груза. Подтвердите и дайте ETA.",
                suggestions: [
                    {
                        text: "Perfect! Driver can be at pickup by 3 PM today, that's middle of the window. Cross-country 2,400 miles in 3.5 days is doable with team drivers. We run electronics regularly with climate-controlled trailers. What's the exact pickup address?",
                        quality: "excellent",
                        analytics: "✨ Отлично! ETA, расчет времени, опыт, вопрос о деталях.",
                        path: "master"
                    },
                    {
                        text: "Yes, works for us. Driver can be there by 4 PM today. We handle electronics shipments regularly.",
                        quality: "good",
                        analytics: "✔️ Хорошо! ETA и опыт.",
                        path: "master"
                    },
                    {
                        text: "We can do it. Driver will be on time.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "I think we can make it... maybe.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенность в сроках.",
                        path: "master"
                    },
                    {
                        text: "Yeah, whatever. What's the rate?",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Пренебрежение деталями.",
                        path: "reject2"
                    },
                    {
                        text: "Driver won't be empty until tomorrow morning...",
                        quality: "fail",
                        analytics: "❌ Провал. Не может забрать вовремя!",
                        path: "reject2"
                    }
                ]
            },

            // ШАГ 4: Брокер дает основные детали груза
            {
                brokerQuestion: "2,400 miles cross-country. High-value electronics - laptops, tablets, smartphones. 42K lbs. Pickup today 2-6 PM Phoenix, delivery Thursday noon Miami. Works for you?",
                dispatcherPrompt: "💎 Брокер дал основные детали. Подтвердите и спросите о requirements.",
                suggestions: [
                    {
                        text: "Got it - TechHub Distribution, 4500 E Van Buren, James Rodriguez 602-555-0147. 2-hour loading, we'll have driver there by 3 PM. Do we need any special equipment besides load locks?",
                        quality: "excellent",
                        analytics: "✨ Отлично! Повторил детали, подтвердил время, задал вопрос.",
                        path: "master"
                    },
                    {
                        text: "TechHub Distribution, Van Buren St. Driver will be there by 3 PM. Any special requirements?",
                        quality: "good",
                        analytics: "✔️ Хорошо! Подтвердил и задал вопрос.",
                        path: "master"
                    },
                    {
                        text: "Got the address. Driver will be there.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "Okay... Van Buren street somewhere.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неточное понимание адреса.",
                        path: "master"
                    },
                    {
                        text: "I don't need all these details! Rate?",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Игнорирование важной информации.",
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
                brokerQuestion: "Just standard load locks and straps. Cargo is palletized and shrink-wrapped. Delivery in Miami at Electronics Depot, 8900 NW 23rd St. Contact: Maria Santos 305-555-0198. Delivery window Thursday 8 AM - 12 PM.",
                dispatcherPrompt: "💎 Брокер дал детали доставки. Подтвердите и спросите о requirements.",
                suggestions: [
                    {
                        text: "Perfect - Electronics Depot Miami, 8900 NW 23rd St, Maria Santos 305-555-0198, Thursday 8-12. We'll have load locks ready. Any temperature requirements or special handling for the electronics?",
                        quality: "excellent",
                        analytics: "✨ Отлично! Повторил детали, задал важный вопрос о температуре.",
                        path: "master"
                    },
                    {
                        text: "Got it - Miami delivery Thursday morning. Any special handling requirements?",
                        quality: "good",
                        analytics: "✔️ Хорошо! Подтвердил и задал вопрос.",
                        path: "master"
                    },
                    {
                        text: "Understood. We'll deliver on time.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "Okay, Miami on Thursday.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Слишком мало деталей записал.",
                        path: "master"
                    },
                    {
                        text: "Yeah, we'll get it there. Rate?",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Спешка к цене.",
                        path: "reject2"
                    },
                    {
                        text: "Wait, what was the Miami address again?",
                        quality: "fail",
                        analytics: "❌ Провал. Не записал информацию!",
                        path: "reject2"
                    }
                ]
            },

            // ШАГ 6: Брокер спрашивает о requirements
            {
                brokerQuestion: "Keep trailer climate-controlled, avoid extreme heat. Electronics are sensitive. No temperature extremes. You good with that?",
                dispatcherPrompt: "💎 Брокер дал requirements. Подтвердите compliance.",
                suggestions: [
                    {
                        text: "Absolutely! Our trailers have climate control, we'll maintain 65-75°F throughout transit. Driver will monitor temperature and avoid parking in direct sun. We transport electronics weekly.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Детальное подтверждение с опытом.",
                        path: "master"
                    },
                    {
                        text: "Yes, we have climate-controlled trailers. Driver knows to avoid heat exposure.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Четкое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "Yes, we can do that.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "I think our trailer has climate control...",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенность в оборудовании!",
                        path: "master"
                    },
                    {
                        text: "It's just electronics, they'll be fine!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Пренебрежение требованиями!",
                        path: "reject3"
                    },
                    {
                        text: "We don't have climate control...",
                        quality: "fail",
                        analytics: "❌ Провал. Нет необходимого оборудования!",
                        path: "reject3"
                    }
                ]
            },

            // ШАГ 7: Диспетчер подтверждает compliance
            {
                brokerQuestion: "Good! Insurance certificate current? We need $100K minimum cargo coverage for electronics.",
                dispatcherPrompt: "💎 Брокер спрашивает о страховке. Подтвердите coverage.",
                suggestions: [
                    {
                        text: "Yes, we carry $250K cargo insurance through Progressive Commercial. Certificate is current, expires December 2026. I can email it right now to your rate con email.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Детали страховки, готовность отправить.",
                        path: "master"
                    },
                    {
                        text: "Yes, $250K cargo coverage, certificate is current. I'll send it over.",
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
                brokerQuestion: "Perfect! You're well-prepared for this electronics load. Let's talk rate. What do you need for 2,400 miles?",
                dispatcherPrompt: "💎 Брокер готов обсудить цену. Назовите ВАШУ цену первым! Чем больше просите - тем лучше!",
                suggestions: [
                    {
                        text: "For 2,400 miles cross-country with high-value electronics, climate control, team drivers, 3-day delivery - I'm looking at $6,500. That's $2.71/mile, fair for the service level and equipment requirements.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Просит $1,000 больше posted ($6,500 vs $5,500). Агрессивный торг с обоснованием!",
                        path: "master"
                    },
                    {
                        text: "$6,200 for this load. That's $2.58/mile for cross-country electronics with climate control.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Просит $700 больше posted. Хороший торг!",
                        path: "master"
                    },
                    {
                        text: "I'm looking at $6,000 for 2,400 miles.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Просит $500 больше posted. Базовый торг.",
                        path: "master"
                    },
                    {
                        text: "Can you do $5,700?",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Просит только $200 больше posted. Плохой торг!",
                        path: "master"
                    },
                    {
                        text: "I need $7,500 minimum or I'm not interested!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Просит $2,000 больше - нереалистично!",
                        path: "reject4"
                    },
                    {
                        text: "I'll take the $5,500 posted rate!",
                        quality: "fail",
                        analytics: "❌ ПРОВАЛ! Принял posted rate без торга. Потерял $500-1,000!",
                        path: "master"
                    }
                ]
            },

            // ШАГ 9: Брокер отвечает встречным предложением
            {
                brokerQuestion: "That's high, but I see you're professional. I can do $6,000. That's $2.50/mile for cross-country with climate control.",
                dispatcherPrompt: "💎 Брокер дает встречное предложение. Решайте - принять или торговаться еще.",
                suggestions: [
                    {
                        text: "I appreciate that. Can we do $6,200? That's fair for both of us with team drivers, climate control, and tight schedule.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Продолжает торг профессионально, просит еще $200.",
                        path: "master"
                    },
                    {
                        text: "$6,000 works if detention is $75/hr after 2 hours.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Принимает с условием detention.",
                        path: "master"
                    },
                    {
                        text: "$6,000 works. Let's book it.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Принимает предложение брокера.",
                        path: "master"
                    },
                    {
                        text: "Okay, I guess $6,000 is acceptable...",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенно принимает.",
                        path: "master"
                    },
                    {
                        text: "$6,200 or I walk! This is high-value cargo!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Ультиматум, риск отказа.",
                        path: "reject4"
                    },
                    {
                        text: "No, I need $6,500 minimum!",
                        quality: "fail",
                        analytics: "❌ Провал. Отказывается от разумного предложения.",
                        path: "reject4"
                    }
                ]
            },

            // ШАГ 10: Брокер финализирует rate
            {
                brokerQuestion: "You drive a hard bargain! I can do $6,100 final. That's $2.54/mile. Detention $75/hr after 2 hours. Deal?",
                dispatcherPrompt: "💎 Брокер дает финальное предложение. Это последний шанс!",
                suggestions: [
                    {
                        text: "$6,100 works! Detention $75/hr is fair. What's the exact pickup address and contact again?",
                        quality: "excellent",
                        analytics: "✨ Отлично! Принимает и сразу к деталям. Заработал $600!",
                        path: "master"
                    },
                    {
                        text: "Perfect! $6,100 with detention. Let's get pickup details.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Четкое принятие. Заработал $600!",
                        path: "master"
                    },
                    {
                        text: "$6,100 confirmed. Pickup address?",
                        quality: "normal",
                        analytics: "⚪ Нормально. Принимает. Заработал $600.",
                        path: "master"
                    },
                    {
                        text: "Okay, $6,100. What's next?",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Заработал $600, но без энтузиазма.",
                        path: "master"
                    },
                    {
                        text: "Fine, $6,100. But I want $100/hr detention!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Новые требования после согласования.",
                        path: "reject4"
                    },
                    {
                        text: "Wait, can we do $6,300?",
                        quality: "fail",
                        analytics: "❌ Провал. Пытается пересмотреть после финала.",
                        path: "reject4"
                    }
                ]
            },

            // ШАГ 11: Брокер финализирует rate + спрашивает factoring
            {
                brokerQuestion: "Deal! $6,100 all-in, detention $75/hr after 2 hours. Which factoring company?",
                dispatcherPrompt: "💎 Брокер финализирует rate. Дайте factoring email.",
                suggestions: [
                    {
                        text: "RTS Factoring, factoring@rtsfin.com. Sending insurance cert and W9 now.",
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
                        text: "Let me find factoring info...",
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
                brokerQuestion: "Perfect! Rate con sent to factoring@rtsfin.com with all pickup/delivery details. Sign and return it. After pickup, send BOL and photos to the email on rate con. Keep cargo climate-controlled. If this goes well, I have 4-5 electronics loads weekly. Good luck!",
                dispatcherPrompt: "💎 Брокер отправил Rate Con. Поблагодарите профессионально.",
                suggestions: [
                    {
                        text: "Thank you Mike! We'll sign and return rate con right away. Driver will maintain climate control and send regular updates. Looking forward to working together on future electronics loads!",
                        quality: "excellent",
                        analytics: "✨ Отлично! Подтверждение Rate Con, climate control, интерес к будущим грузам!",
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
                        text: "Wait, what was the pickup time again?",
                        quality: "fail",
                        analytics: "❌ Провал. Не понял что все в Rate Con!",
                        path: "master"
                    }
                ]
            },

            // ШАГ 13: OUTCOME
            {
                brokerResponse: "Perfect! Rate con with all details sent to factoring@rtsfin.com. Sign and return. After pickup send BOL and photos. Safe travels!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$6,100",
                    ratePerMile: "$2.54/mile",
                    relationship: "strengthened",
                    dialogueTime: "6-7 minutes",
                    questionsAsked: "Professional, focused questions about requirements and details",
                    detailLevel: "high",
                    futureOpportunity: "repeat",
                    weeklyLoads: "4-5 electronics loads weekly Phoenix-Florida",
                    feedback: `✅ ЧТО СДЕЛАНО ПРАВИЛЬНО:

Вы провели отличные переговоры по Dry Van грузу с электроникой! Заработали $600 больше posted rate ($6,100 vs $5,500).

1. Профессиональное представление - дали MC, компанию, специализацию, опыт
2. Точная информация о местоположении и готовности
3. Записали все детали pickup и delivery
4. Подтвердили climate control и страховку $250K
5. ОТЛИЧНЫЙ ТОРГ - начали с $6,500, получили $6,100 ($2.54/mile)
6. Дали factoring и обещали updates

💡 КЛЮЧЕВОЙ УРОК:

Dry Van грузы с электроникой требуют:
- Climate control (65-75°F) - избегать жары
- Высокая страховка ($100K+ cargo coverage)
- Аккуратная погрузка с load locks
- Regular updates для high-value cargo

Торг за цену:
- Posted: $5,500 ($2.29/mile)
- Вы просили: $6,500 ($2.71/mile) - агрессивно!
- Брокер предложил: $6,000 ($2.50/mile) - среднее
- Вы продолжили торг: $6,200
- Финал: $6,100 ($2.54/mile) + detention $75/hr

Заработали $600 больше = 11% прибавка!

🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:

Electronics loads (laptops, tablets, phones) - это 50% всех Dry Van грузов. Они платят premium rates ($2.50-2.70/mile) потому что:

1. High-value cargo - нужна высокая страховка
2. Climate-sensitive - нужен temperature control
3. Theft risk - нужна безопасность и tracking
4. Tight delivery windows - нужна надежность

Всегда торгуйтесь агрессивно на electronics! Начинайте с +15-20% от posted rate. Брокеры знают что это ценный груз и готовы платить больше.

Если груз идет cross-country (2,000+ miles) - просите еще больше! Team drivers, fuel costs, time - все это оправдывает высокую ставку.

Ваш профессионализм принес вам repeat business - 4-5 loads weekly! Это $24,000-30,000 дополнительного дохода в месяц!`
                }
            }
        ],

        // REJECT PATH 1: Непрофессиональное поведение с начала
        reject1: [
            {},
            {
                brokerResponse: "I need a professional carrier who can communicate clearly. Let me call someone else. Thanks anyway.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    ratePerMile: "$0/mile",
                    relationship: "rejected",
                    dialogueTime: "1-2 minutes",
                    questionsAsked: "None - unprofessional from start",
                    detailLevel: "none",
                    futureOpportunity: "none",
                    weeklyLoads: "No loads",
                    feedback: `❌ ЧТО ПОШЛО НЕ ТАК:

Брокер отказал из-за непрофессионального поведения с первых секунд разговора.

Ошибки:
1. Не представились или представились неуверенно
2. Не знали MC номер или местоположение водителя
3. Грубость или агрессия с первых слов
4. Нетерпеливость - сразу к цене

💡 КЛЮЧЕВОЙ УРОК:

Первые 30 секунд разговора определяют весь диалог!

Брокер оценивает:
- Профессионализм (MC номер, название компании)
- Организованность (знаете где водитель)
- Коммуникацию (четкая речь, вежливость)
- Готовность (водитель пустой и готов)

Если вы не можете дать базовую информацию - брокер не будет рисковать $42,000 грузом электроники!

🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:

В реальности брокеры получают 20-30 звонков на один груз. Они выбирают самых профессиональных диспетчеров.

Правильное начало:
"Good morning! [Company name], MC [number]. We have a [equipment] in [location], empty and ready. Calling about your [route] load. Is it still available?"

Это занимает 10 секунд, но показывает что вы:
- Знаете свой бизнес
- Организованы
- Готовы к работе
- Профессионал

Потеряли $6,100 груз и возможность 4-5 loads weekly ($24,000-30,000/месяц) из-за плохого первого впечатления!`
                }
            }
        ],

        // REJECT PATH 2: Не может забрать вовремя или не записывает детали
        reject2: [
            {},
            {
                brokerResponse: "I need a carrier who can meet the schedule and pay attention to details. Let me call someone more reliable. Thanks anyway.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    ratePerMile: "$0/mile",
                    relationship: "rejected",
                    dialogueTime: "2-3 minutes",
                    questionsAsked: "Minimal - didn't gather critical information",
                    detailLevel: "low",
                    futureOpportunity: "none",
                    weeklyLoads: "No loads",
                    feedback: `❌ ЧТО ПОШЛО НЕ ТАК:

Брокер отказал из-за проблем со сроками или невнимательности к деталям.

Ошибки:
1. Водитель не может забрать вовремя (pickup today 2-6 PM)
2. Не записывали адреса и контакты
3. Просили повторить информацию
4. Игнорировали важные детали

💡 КЛЮЧЕВОЙ УРОК:

Electronics loads имеют strict deadlines! Pickup today 2-6 PM означает что:
- Shipper закрывается в 6 PM
- Груз должен быть в пути сегодня
- Delivery Thursday noon - tight schedule

Если ваш водитель будет пустой только завтра - вы опоздаете на 12+ часов!

Также критически важно записывать ВСЕ детали:
- Точные адреса (не "Van Buren street somewhere")
- Контакты с телефонами
- Time windows
- Special requirements

🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:

В реальности electronics shippers очень строгие:
- Missed pickup = cancelled load
- Late delivery = detention charges
- Damaged cargo = insurance claim

Брокеры работают только с надежными carriers кто:
1. Может забрать в указанное время
2. Записывает все детали точно
3. Не просит повторять информацию
4. Выполняет обещания

Один missed pickup = вы в blacklist у этого брокера!

Потеряли $6,100 груз из-за того что не могли забрать вовремя или не записали детали. Это показывает ненадежность!`
                }
            }
        ],

        // REJECT PATH 3: Нет необходимого оборудования или страховки
        reject3: [
            {},
            {
                brokerResponse: "I need a carrier with proper equipment and insurance for high-value electronics. Let me find someone qualified. Thanks anyway.",
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
                    feedback: `❌ ЧТО ПОШЛО НЕ ТАК:

Брокер отказал из-за отсутствия необходимого оборудования или страховки.

Ошибки:
1. Нет climate control в trailer
2. Недостаточная cargo insurance (нужно $100K+, есть только $50K)
3. Пренебрежение temperature requirements
4. Неуверенность в оборудовании

💡 КЛЮЧЕВОЙ УРОК:

Electronics loads требуют специального оборудования:

1. Climate-controlled trailer:
   - Maintain 65-75°F
   - Avoid extreme heat/cold
   - Monitor temperature

2. High cargo insurance:
   - Minimum $100K for electronics
   - $250K preferred for high-value
   - Certificate must be current

3. Proper securement:
   - Load locks and straps
   - Avoid shifting during transit
   - Palletized cargo handling

Если у вас нет этого - НЕ берите electronics loads!

🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:

Electronics cargo стоит $500K-1M+. Один damaged laptop = $2,000 loss. Если в trailer 200 laptops и они перегреются = $400,000 claim!

Брокеры проверяют:
- Insurance certificate (current and sufficient)
- Equipment capabilities (climate control)
- Experience with electronics

Если вы говорите "It's just electronics, they'll be fine!" - это red flag! Показывает что вы не понимаете риски.

Правильный ответ:
"We have climate-controlled trailers, $250K cargo insurance, and transport electronics weekly. We'll maintain 65-75°F and avoid heat exposure."

Потеряли $6,100 груз из-за отсутствия proper equipment. Инвестируйте в climate control и высокую страховку - это окупится!`
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
                    dialogueTime: "4-5 minutes",
                    questionsAsked: "Good questions but failed on rate negotiation",
                    detailLevel: "high",
                    futureOpportunity: "unlikely",
                    weeklyLoads: "No loads",
                    feedback: `❌ ЧТО ПОШЛО НЕ ТАК:

Брокер отказал из-за нереалистичных требований по цене или агрессивного торга.

Ошибки:
1. Просили слишком много ($7,500 vs posted $5,500 = +36%)
2. Отказались от разумного предложения ($6,000-6,100)
3. Ультиматумы ("$6,200 or I walk!")
4. Новые требования после согласования

💡 КЛЮЧЕВОЙ УРОК:

Торг должен быть агрессивным но РЕАЛИСТИЧНЫМ!

Market rates для Dry Van electronics:
- Standard: $2.30-2.50/mile
- With climate control: $2.50-2.70/mile
- Cross-country premium: +$0.10-0.20/mile

Posted rate: $5,500 ($2.29/mile)
Realistic ask: $6,000-6,500 ($2.50-2.71/mile) = +9-18%
Unrealistic ask: $7,500+ ($3.13/mile) = +36%

Брокер предложил $6,000 ($2.50/mile) - это ОТЛИЧНОЕ предложение! +$500 от posted rate.

Если вы отказываетесь или требуете еще больше - брокер найдет другого carrier за 5 минут.

🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:

В реальности рынок определяет цены. Брокеры знают market rates и не будут переплачивать.

Правильная стратегия торга:
1. Начните агрессивно: +15-20% от posted
2. Брокер предложит среднее: +7-10%
3. Торгуйтесь еще раз: +10-12%
4. Принимайте разумное предложение

Пример:
- Posted: $5,500
- Вы просите: $6,500 (+18%)
- Брокер: $6,000 (+9%)
- Вы: $6,200 (+13%)
- Финал: $6,100 (+11%)

Это win-win! Вы заработали $600 больше, брокер получил надежного carrier.

Потеряли $6,100 груз из-за жадности. Лучше заработать $500-600 больше чем $0!`
                }
            }
        ]
    }
};

// Добавляем сценарий в глобальный массив
if (typeof allScenarios !== 'undefined') {
    allScenarios.push(scenario7);
    console.log('✅ Scenario 7 (Dry Van Electronics) added to allScenarios');
} else {
    console.warn('⚠️ allScenarios array not found');
}
