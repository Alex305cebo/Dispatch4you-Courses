// ============================================
// KIRO'S EXPERIMENTAL DIALOGUE
// Создан AI ассистентом Kiro для тестирования
// Уникальные правила и условия
// ============================================

// 🎯 KIRO'S DIALOGUE RULES:
// 1. Broker personality changes during conversation (starts friendly, becomes strict)
// 2. Hidden challenges - dispatcher must notice red flags
// 3. Rate negotiation has 3 rounds (not just 1-2)
// 4. Broker tests dispatcher's knowledge with trick questions
// 5. Success depends on catching broker's mistakes

const kiroTestDialogue = {
    id: 999,
    route: "Los Angeles CA → Chicago IL",
    distance: 2015,
    equipment: "Reefer",
    brokerStyle: "Friendly but Testing (changes to Strict)",
    difficulty: "expert",

    // KIRO'S SPECIAL RULES:
    specialRules: {
        hiddenChallenges: [
            "Broker mentions wrong temperature - dispatcher must catch it",
            "Broker gives conflicting pickup times - dispatcher must clarify",
            "Broker tries to skip insurance verification - dispatcher must insist"
        ],
        personalityShift: "Broker starts friendly but becomes strict if dispatcher misses details",
        rateNegotiationRounds: 3,
        successCriteria: "Must catch at least 2 out of 3 hidden challenges"
    },

    initialMessage: "Good afternoon!\nThis is Marcus from Reliable Transport Group.\nI'm calling about your Los Angeles to Chicago reefer load.\nIs this still available?",

    paths: {
        // MASTER PATH - Catches all challenges
        master: [
            {
                brokerQuestion: "Hey Marcus! Yeah, it's available.\nGreat timing, just posted 10 minutes ago.\nWhat's your MC and where's your driver at?",
                dispatcherPrompt: "💎 Брокер дружелюбный. Дайте MC и точное местоположение водителя.",
                suggestions: [
                    {
                        text: "MC 778899, we're a reefer specialist with 5 years experience.\nDriver currently empty in Bakersfield CA, about 110 miles from LA.\nCan be at pickup location within 2 hours.\n2022 Freightliner Cascadia with 2021 Thermo King reefer unit, fully serviced last week.",
                        quality: "master",
                        analytics: "Отлично! Полная информация + показали специализацию."
                    },
                    {
                        text: "MC 778899, driver in Bakersfield area with reefer trailer.\nCan pickup today or tomorrow.",
                        quality: "good",
                        analytics: "Хорошо, но мало деталей про оборудование."
                    },
                    {
                        text: "MC 778899, reefer available in California.",
                        quality: "weak",
                        analytics: "Слишком мало информации."
                    }
                ]
            },
            {
                brokerResponse: "Perfect! Let me verify MC 778899... Excellent, 98% safety score.\nThis is temperature-controlled produce, 42,000 lbs.\nPickup tomorrow 8 AM in LA, delivery Chicago in 3 days.\nNeed to maintain 28°F throughout transit.",
                brokerQuestion: "Your reefer unit can handle 28 degrees, right?",
                dispatcherPrompt: "🚨 ВНИМАНИЕ! Брокер сказал 28°F для produce - это НЕПРАВИЛЬНО! Produce обычно 34-38°F. Это тест!",
                suggestions: [
                    {
                        text: "Wait, I want to clarify the temperature.\nYou mentioned 28°F for produce - that seems unusually low.\nMost produce requires 34-38°F to prevent freezing damage.\nCan you double-check the required temperature with the shipper?\nI want to make sure we maintain product quality.",
                        quality: "master",
                        analytics: "🎯 ОТЛИЧНО! Поймали ошибку брокера! Это показывает профессионализм."
                    },
                    {
                        text: "Yes, our reefer unit can maintain any temperature from -20°F to 70°F.\nNo problem with 28 degrees.",
                        quality: "weak",
                        analytics: "❌ Пропустили ошибку! 28°F слишком холодно для produce."
                    },
                    {
                        text: "Sure, 28 degrees is fine. What's the rate?",
                        quality: "fail",
                        analytics: "❌ Пропустили критическую ошибку и торопитесь с ставкой."
                    }
                ]
            },
            {
                brokerResponse: "Wow, good catch Marcus! You're absolutely right.\nLet me check... Yes, shipper confirms 36°F, not 28°F.\nI was looking at wrong load sheet. Thanks for catching that!\nYou just saved us from a potential claim.",
                brokerQuestion: "Alright, so 36°F for produce, 42,000 lbs, LA to Chicago.\nWhat rate are you thinking?",
                dispatcherPrompt: "💎 Брокер впечатлен! Теперь он доверяет вам. Предложите справедливую ставку.",
                suggestions: [
                    {
                        text: "I appreciate you double-checking that.\nFor 2,015 miles reefer with produce, considering fuel costs and reefer maintenance,\nI'm looking at $5,800 all-in, that's $2.88/mile.\nThis includes 110 miles deadhead from Bakersfield.\nWe guarantee temperature monitoring every 2 hours with digital logs.",
                        quality: "master",
                        analytics: "Отлично! Обоснованная ставка с объяснением."
                    },
                    {
                        text: "$5,500 all-in for the load.\nThat's fair for reefer cross-country.",
                        quality: "good",
                        analytics: "Хорошо, но можно было обосновать лучше."
                    },
                    {
                        text: "$6,000 or I can't do it.",
                        quality: "weak",
                        analytics: "Слишком жестко без объяснения."
                    }
                ]
            },
            {
                brokerResponse: "$5,800 is higher than my budget.\nI was thinking more like $4,800, that's $2.38/mile.\nStill decent money for reefer.",
                brokerQuestion: "Can you work with $4,800?",
                dispatcherPrompt: "💎 Первый раунд переговоров. Ставка низкая. Торгуйтесь профессионально.",
                suggestions: [
                    {
                        text: "I understand budget constraints, but let me break down the costs:\n$4,800 for 2,125 total miles (including deadhead) is $2.26/mile actual.\nReefer fuel surcharge alone is $0.45/mile, that's $956.\nReefer unit maintenance runs $0.30/mile, that's $638.\nThat leaves only $1.50/mile for truck operation, which doesn't cover our costs.\nI can meet you at $5,400, that's $2.68/mile. Fair for both sides?",
                        quality: "master",
                        analytics: "Отлично! Показали математику и предложили компромисс."
                    },
                    {
                        text: "$4,800 is too low for reefer cross-country.\nI need at least $5,200 to make it work.",
                        quality: "good",
                        analytics: "Хорошо, но без объяснения."
                    },
                    {
                        text: "No way, $4,800 is insulting. $5,800 or nothing.",
                        quality: "fail",
                        analytics: "❌ Слишком агрессивно, потеряете груз."
                    }
                ]
            },
            {
                brokerResponse: "I appreciate the breakdown, that's professional.\nLet me talk to my manager... Okay, he approved $5,100.\nThat's $2.53/mile, best I can do.",
                brokerQuestion: "Can we shake on $5,100?",
                dispatcherPrompt: "💎 Второй раунд. Ставка лучше но все еще низковата. Последняя попытка.",
                suggestions: [
                    {
                        text: "I appreciate you going to your manager.\n$5,100 is closer, but still below our operating threshold.\nHow about this: $5,250 and I'll absorb the deadhead cost.\nThat's $2.60/mile, you get reliable reefer specialist,\nand I guarantee we'll be your go-to carrier for future LA-Chicago lanes.\nDeal?",
                        quality: "master",
                        analytics: "Отлично! Финальный компромисс с долгосрочной перспективой."
                    },
                    {
                        text: "Okay, $5,100 works. Let's book it.",
                        quality: "good",
                        analytics: "Приняли ставку, но могли получить больше."
                    },
                    {
                        text: "Still need $5,400 minimum.",
                        quality: "weak",
                        analytics: "Слишком жестко, можете потерять груз."
                    }
                ]
            },
            {
                brokerResponse: "You drive a hard bargain Marcus, but I like your style.\n$5,250 it is! You're right about building relationship.\nI have 3-4 LA-Chicago loads per week.",
                brokerQuestion: "Alright, let's get details sorted.\nWhat's your cargo insurance coverage?",
                dispatcherPrompt: "💎 Груз забукирован! Теперь детали. Дайте точную информацию про страховку.",
                suggestions: [
                    {
                        text: "$100,000 cargo insurance through Progressive Commercial.\nPolicy number PC-778899-2026, expires December 2026.\nCan send certificate of insurance to your email right now.\nDo you need higher coverage for this load?",
                        quality: "master",
                        analytics: "Отлично! Полная информация и проактивный вопрос."
                    },
                    {
                        text: "$100K cargo insurance, can send COI.",
                        quality: "good",
                        analytics: "Хорошо, но коротко."
                    },
                    {
                        text: "We have insurance, standard coverage.",
                        quality: "weak",
                        analytics: "Слишком расплывчато."
                    }
                ]
            },
            {
                brokerResponse: "$100K is fine for this load, it's under $50K value.\nSend COI to james@freshproducebrokers.com.\nPickup is Fresh Farms Warehouse, 1234 Commerce St, Los Angeles CA 90021.\nContact Maria, 213-555-0199, dock 5.",
                brokerQuestion: "Pickup window is 8 AM to 10 AM tomorrow. Driver needs appointment?",
                dispatcherPrompt: "💎 Получили pickup детали. Уточните про appointment и другие важные детали.",
                suggestions: [
                    {
                        text: "Got it! Fresh Farms, 1234 Commerce St, LA 90021, Maria 213-555-0199, dock 5.\nYes, please set appointment for 8 AM tomorrow.\nQuick questions: Is there a gate code? How long does loading typically take?\nAny special handling requirements for the produce?\nWhat's the delivery address and receiver contact in Chicago?",
                        quality: "master",
                        analytics: "Отлично! Подтвердили детали и задали все критические вопросы."
                    },
                    {
                        text: "Yes, need appointment for 8 AM.\nWhat's delivery address?",
                        quality: "good",
                        analytics: "Хорошо, базовые вопросы."
                    },
                    {
                        text: "Okay, 8 AM pickup. Send me rate con.",
                        quality: "weak",
                        analytics: "Упустили важные детали."
                    }
                ]
            },
            {
                brokerResponse: "No gate code, just check in at office.\nLoading takes about 90 minutes, they're fast.\nProduce is palletized, 18 pallets, use load locks.\nDelivery: Chicago Fresh Market, 5678 Industrial Ave, Chicago IL 60609.\nReceiver Tom, 312-555-0177, dock 12, delivery window 6 AM - 12 PM day after tomorrow.",
                brokerQuestion: "Driver will call receiver 2 hours before arrival, right?",
                dispatcherPrompt: "💎 Получили все детали. Подтвердите процедуры и финализируйте.",
                suggestions: [
                    {
                        text: "Absolutely! Driver will call Tom at 312-555-0177 two hours before arrival.\nWe'll also send you real-time GPS tracking link and temperature logs every 4 hours.\nJust to confirm the complete details:\n- Pickup: Tomorrow 8 AM, Fresh Farms LA, Maria 213-555-0199, dock 5\n- Delivery: Day after tomorrow 6 AM-12 PM, Chicago Fresh Market, Tom 312-555-0177, dock 12\n- Temp: 36°F, 42,000 lbs produce, 18 pallets\n- Rate: $5,250 all-in\nPlease send rate confirmation and BOL to marcus@reliabletransport.com",
                        quality: "master",
                        analytics: "🏆 ИДЕАЛЬНО! Полное резюме всех деталей и проактивность."
                    },
                    {
                        text: "Yes, driver will call 2 hours before.\nSend rate con to my email.",
                        quality: "good",
                        analytics: "Хорошо, но не подтвердили все детали."
                    },
                    {
                        text: "Sure, driver will call. Send paperwork.",
                        quality: "weak",
                        analytics: "Слишком коротко."
                    }
                ]
            },
            {
                brokerResponse: "Perfect Marcus! You're extremely professional.\nSending rate con and BOL to marcus@reliabletransport.com right now.\nI'm adding you to my preferred carrier list.\nExpect more loads from me on this lane.",
                outcome: {
                    type: "success",
                    quality: "master",
                    rate: "$5,250",
                    ratePerMile: "$2.60/mile",
                    relationship: "Preferred Carrier - Weekly loads guaranteed",
                    dialogueTime: "8-10 minutes",
                    questionsAsked: "12+ questions",
                    detailLevel: "exceptional",
                    futureOpportunity: "3-4 loads per week",
                    weeklyLoads: "3-4 loads/week on this lane",
                    feedback: "🏆 МАСТЕР - ИДЕАЛЬНЫЙ ДИАЛОГ!\n\n✅ ЧТО СДЕЛАНО ПРАВИЛЬНО:\n- Поймали ошибку брокера с температурой (28°F вместо 36°F)\n- Профессионально торговались в 3 раунда\n- Обосновали ставку математикой\n- Задали все критические вопросы\n- Подтвердили все детали в конце\n- Показали проактивность (GPS tracking, temperature logs)\n- Построили долгосрочные отношения\n\n💡 КЛЮЧЕВОЙ УРОК:\nВнимание к деталям и профессионализм = доверие брокера.\nОдна пойманная ошибка может спасти от claim на тысячи долларов.\n\n🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:\nВсегда проверяйте температурные требования для разных типов груза:\n- Produce: 34-38°F\n- Frozen: -10°F to 0°F\n- Dairy: 36-40°F\n- Meat: 28-32°F\n\nЕсли что-то звучит неправильно - СПРАШИВАЙТЕ! Лучше уточнить сейчас, чем иметь проблемы потом."
                }
            }
        ]
    }
};
