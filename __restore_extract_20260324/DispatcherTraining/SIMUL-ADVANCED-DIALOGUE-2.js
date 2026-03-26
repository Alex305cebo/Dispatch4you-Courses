// ============================================
// ADVANCED DIALOGUE #2 - "THE PERFECT STORM"
// Создан AI ассистентом Kiro
// Сложный сценарий с множественными вызовами
// ============================================

// 🎯 UNIQUE SCENARIO RULES:
// 1. Broker is experienced but under pressure (tight deadline)
// 2. Load has multiple complications (weather, special requirements, tight timeline)
// 3. Dispatcher must show problem-solving skills
// 4. Rate negotiation involves value-added services
// 5. Success requires proactive thinking and flexibility

const advancedDialogue2 = {
    id: 1000,
    route: "Seattle WA → Miami FL",
    distance: 3334,
    equipment: "Reefer",
    brokerStyle: "Experienced but Pressured",
    difficulty: "expert",

    specialRules: {
        complications: [
            "Weather alert - snow in mountain passes",
            "Tight delivery window - only 4 days for 3,334 miles",
            "High-value pharmaceutical load - requires extra documentation",
            "Broker needs proof of temperature monitoring system"
        ],
        successCriteria: "Must address all complications proactively",
        rateBonus: "Extra $500 for guaranteed on-time delivery with team drivers"
    },

    initialMessage: "Good morning!\nThis is Sarah from MedLogistics Express.\nI'm calling about your Seattle to Miami reefer load.\nIs this still available?",

    paths: {
        master: [
            {
                brokerQuestion: "Morning Sarah! Yes, still available but I need to move fast.\nThis is time-sensitive pharmaceutical shipment.\nMC number and current driver location?",
                dispatcherPrompt: "💎 Брокер торопится. Дайте полную информацию быстро и профессионально.",
                suggestions: [
                    {
                        text: "MC 334455, pharmaceutical specialist, 8 years experience.\nTeam drivers currently empty in Portland OR, 175 miles from Seattle.\nBoth drivers HAZMAT certified, TSA approved.\n2023 Volvo with 2022 Carrier reefer, real-time temp monitoring.",
                        quality: "master",
                        path: "master",
                        analytics: "Отлично! Показали специализацию и team drivers для tight timeline."
                    },
                    {
                        text: "MC 334455, reefer team in Portland area.\nCan pickup today, experienced with pharma loads.",
                        quality: "good",
                        path: "master",
                        analytics: "Хорошо, но мало деталей про сертификаты."
                    },
                    {
                        text: "MC 334455, driver available in Oregon.",
                        quality: "weak",
                        path: "master",
                        analytics: "Слишком мало информации для срочного груза."
                    }
                ]
            },
            {
                brokerResponse: "Perfect! Verified MC 334455 - excellent record.\nThis is 38,000 lbs pharmaceuticals, must maintain 2-8°C constant.\nPickup tomorrow 6 AM Seattle, delivery Miami in 4 days max.\nWeather alert: snow expected in Rockies next 48 hours.",
                brokerQuestion: "Can your team handle this timeline with weather issues?",
                dispatcherPrompt: "🚨 Tight timeline + погода! Покажите что у вас есть план.",
                suggestions: [
                    {
                        text: "Absolutely, we can handle this.\nTeam drivers can run 1,100+ miles per day continuously.\n3,334 miles in 4 days is 834 miles/day - very manageable.\nFor weather: we monitor forecasts real-time, have chains ready.\nIf I-90 closes, we reroute via I-84 south through Nevada.\nWe'll maintain 2-8°C regardless of outside temperature.",
                        quality: "master",
                        analytics: "🎯 ОТЛИЧНО! Показали математику, план B для погоды, уверенность."
                    },
                    {
                        text: "Yes, team drivers can make it in 4 days.\nWe have experience with winter driving.",
                        quality: "good",
                        analytics: "Хорошо, но нет конкретного плана."
                    },
                    {
                        text: "Should be fine, we'll try our best.",
                        quality: "weak",
                        analytics: "Слишком неуверенно для критического груза."
                    }
                ]
            },
            {
                brokerResponse: "Excellent planning! I like the backup route idea.\nNow, this is high-value cargo, $2.5 million worth.\nI need proof of temperature monitoring system.\nWhat system do you use?",
                dispatcherPrompt: "💎 Брокер проверяет технологии. Покажите профессиональную систему.",
                suggestions: [
                    {
                        text: "We use Carrier Lynx Fleet system with real-time monitoring.\nYou'll get automated alerts if temp goes outside 2-8°C range.\nData logs every 5 minutes, accessible via web portal 24/7.\nI'll add you to monitoring system immediately after booking.\nAlso provide PDF reports every 6 hours via email.",
                        quality: "master",
                        analytics: "Отлично! Конкретная система + проактивное предложение доступа."
                    },
                    {
                        text: "We have digital temp monitoring on the reefer unit.\nCan send you temperature logs during transit.",
                        quality: "good",
                        analytics: "Хорошо, но не назвали конкретную систему."
                    },
                    {
                        text: "Yes, we monitor temperature, no problem.",
                        quality: "weak",
                        analytics: "Слишком расплывчато для $2.5M груза."
                    }
                ]
            },
            {
                brokerResponse: "Perfect! Carrier Lynx is exactly what we need.\nNow let's talk rate. This is premium load with tight timeline.\nWhat's your rate for this?",
                dispatcherPrompt: "💎 Премиум груз + срочность. Обоснуйте высокую ставку.",
                suggestions: [
                    {
                        text: "For 3,509 total miles including deadhead, pharma-grade service:\n$10,500 all-in, that's $2.99/mile.\nThis includes: team drivers for continuous transit,\nreal-time temp monitoring with 24/7 access,\nguaranteed on-time delivery with weather contingency,\nand $2.5M cargo insurance coverage.\nConsidering timeline and value, this is competitive.",
                        quality: "master",
                        analytics: "Отлично! Высокая ставка с полным обоснованием."
                    },
                    {
                        text: "$9,800 all-in for the load.\nTeam drivers, temp monitoring included.",
                        quality: "good",
                        analytics: "Хорошо, но можно было обосновать лучше."
                    },
                    {
                        text: "$11,000 for cross-country reefer.",
                        quality: "weak",
                        analytics: "Слишком высоко без объяснения."
                    }
                ]
            },
            {
                brokerResponse: "$10,500 is higher than budget.\nI was thinking $9,200, that's $2.76/mile.\nStill good money for cross-country.",
                brokerQuestion: "Can you work with $9,200?",
                dispatcherPrompt: "💎 Первый раунд. Ставка низкая для премиум сервиса. Торгуйтесь.",
                suggestions: [
                    {
                        text: "I understand budget concerns, but let me explain the value:\nStandard solo driver would take 6-7 days for this distance.\nTeam drivers save you 2-3 days, preventing potential spoilage.\nOur pharma-grade monitoring prevents $2.5M claim risk.\nWeather routing expertise ensures on-time delivery.\n$9,200 doesn't cover team driver costs ($400/day extra).\nI can do $10,000 - that's $2.85/mile for premium service.",
                        quality: "master",
                        analytics: "Отлично! Показали ценность через risk mitigation."
                    },
                    {
                        text: "$9,200 is too low for team drivers and pharma load.\nNeed at least $9,800 to make it work.",
                        quality: "good",
                        analytics: "Хорошо, но без детального объяснения."
                    },
                    {
                        text: "No, $10,500 is my final offer.",
                        quality: "weak",
                        analytics: "Слишком жестко, нет гибкости."
                    }
                ]
            },
            {
                brokerResponse: "You make excellent points about risk mitigation.\nLet me check with customer... Okay, they approved $9,600.\nBut I need absolute guarantee on 4-day delivery.",
                brokerQuestion: "Can you guarantee delivery by day 4, or I need backup plan?",
                dispatcherPrompt: "💎 Второй раунд. Брокер нужна гарантия. Предложите компромисс с гарантией.",
                suggestions: [
                    {
                        text: "Here's my proposal: $9,800 with performance guarantee.\nIf we deliver on time (within 4 days): $9,800 as agreed.\nIf we're late without weather force majeure: you pay only $9,200.\nThis shows I'm confident in our team's ability.\nPlus, I'll give you my personal cell for 24/7 updates.\nDeal?",
                        quality: "master",
                        analytics: "🎯 ГЕНИАЛЬНО! Предложили гарантию с финансовым риском на себя."
                    },
                    {
                        text: "I guarantee 4-day delivery, $9,700 final.\nWe've never missed a pharma deadline.",
                        quality: "good",
                        analytics: "Хорошо, но нет финансовой гарантии."
                    },
                    {
                        text: "Can't guarantee with weather, but we'll try. $9,800.",
                        quality: "weak",
                        analytics: "Неуверенность убивает доверие."
                    }
                ]
            },
            {
                brokerResponse: "Wow, that's a bold guarantee! I respect that.\nYou know what? $9,800 with your performance guarantee is fair.\nYou're clearly confident and professional.\nLet's book it!",
                brokerQuestion: "I need your cargo insurance details and factoring info.",
                dispatcherPrompt: "💎 Груз забукирован! Дайте все документы быстро.",
                suggestions: [
                    {
                        text: "Excellent! Here are the details:\nCargo insurance: $250,000 through Northland Insurance.\nPolicy NL-334455-2026, expires November 2026.\nFactoring: RTS Financial, can send NOA immediately.\nAlso sending: Certificate of Insurance, W9, signed broker agreement.\nEmail everything to you in next 10 minutes.\nWhat's your email and what's the shipper contact?",
                        quality: "master",
                        analytics: "Отлично! Все документы + проактивность."
                    },
                    {
                        text: "$250K cargo insurance, factoring through RTS.\nCan send documents. What's shipper info?",
                        quality: "good",
                        analytics: "Хорошо, базовая информация."
                    },
                    {
                        text: "Have insurance and factoring, will send later.",
                        quality: "weak",
                        analytics: "Слишком расплывчато и не срочно."
                    }
                ]
            },
            {
                brokerResponse: "Perfect! Send everything to sarah@medlogistics.com.\nShipper: PharmaCold Storage, 2345 Harbor Ave, Seattle WA 98101.\nContact: David Chen, 206-555-0188, dock 3.\nPickup window: 6 AM - 8 AM tomorrow, appointment required.",
                brokerQuestion: "What time should I schedule the appointment?",
                dispatcherPrompt: "💎 Получили shipper детали. Выберите оптимальное время и задайте вопросы.",
                suggestions: [
                    {
                        text: "Schedule for 6 AM sharp - we want maximum daylight for first day.\nTeam will depart Portland tonight, arrive Seattle 5:45 AM.\nQuestions: Gate code? Loading time estimate?\nAny special handling or documentation at pickup?\nPre-cool reefer to 2-8°C before arrival?\nWhat's the delivery address and receiver contact in Miami?",
                        quality: "master",
                        analytics: "Отлично! Стратегическое время + все критические вопросы."
                    },
                    {
                        text: "6 AM appointment works.\nHow long is loading? What's delivery address?",
                        quality: "good",
                        analytics: "Хорошо, базовые вопросы."
                    },
                    {
                        text: "6 AM is fine. Send me delivery info.",
                        quality: "weak",
                        analytics: "Упустили важные детали."
                    }
                ]
            },
            {
                brokerResponse: "Gate code 4782, loading takes 2 hours (careful handling).\nYes, pre-cool to 5°C before arrival.\nSpecial: Need photos of seal, temp display, and BOL.\nDelivery: Miami MedCenter, 7890 Medical Plaza, Miami FL 33101.\nReceiver: Dr. Rodriguez, 305-555-0199, receiving dock B.\nDelivery window: Day 4, 8 AM - 6 PM, appointment required.",
                brokerQuestion: "Your team will call receiver 4 hours before arrival, correct?",
                dispatcherPrompt: "💎 Все детали получены. Подтвердите процедуры и финализируйте.",
                suggestions: [
                    {
                        text: "Absolutely! Complete protocol:\n- Call Dr. Rodriguez 4 hours before arrival at 305-555-0199\n- Send you GPS tracking link and temp monitoring access today\n- Photo documentation: seal, temp display, BOL at pickup\n- Temperature reports every 6 hours via email\n- Immediate alert if any temp deviation\nConfirming all details:\nPickup: Tomorrow 6 AM, PharmaCold Seattle, David 206-555-0188, dock 3\nDelivery: Day 4 8AM-6PM, Miami MedCenter, Dr. Rodriguez 305-555-0199, dock B\nTemp: 2-8°C, 38,000 lbs pharma, rate $9,800 with on-time guarantee\nSending all documents to sarah@medlogistics.com in 10 minutes.",
                        quality: "master",
                        analytics: "🏆 ИДЕАЛЬНО! Полный протокол + резюме всех деталей."
                    },
                    {
                        text: "Yes, will call 4 hours before.\nWill send tracking and temp monitoring.\nSend rate con to my email.",
                        quality: "good",
                        analytics: "Хорошо, но не подтвердили все детали."
                    },
                    {
                        text: "Sure, driver will call. Send paperwork.",
                        quality: "weak",
                        analytics: "Слишком коротко для критического груза."
                    }
                ]
            },
            {
                brokerResponse: "Sarah, you are EXCEPTIONAL! This is the most professional setup I've had.\nSending rate con and BOL to your email right now.\nI'm adding you to our preferred pharma carrier list.\nWe have 2-3 similar loads per week on various lanes.\nYou just earned yourself a long-term partnership!",
                outcome: {
                    type: "success",
                    quality: "master",
                    rate: "$9,800",
                    ratePerMile: "$2.79/mile",
                    relationship: "Preferred Pharma Carrier - Partnership Level",
                    dialogueTime: "10-12 minutes",
                    questionsAsked: "15+ questions",
                    detailLevel: "exceptional",
                    futureOpportunity: "2-3 pharma loads per week",
                    weeklyLoads: "2-3 high-value loads/week",
                    feedback: "🏆 МАСТЕР - ИСКЛЮЧИТЕЛЬНЫЙ ДИАЛОГ!\n\n✅ ЧТО СДЕЛАНО ПРАВИЛЬНО:\n- Показали специализацию в pharma с первого ответа (team drivers, HAZMAT, TSA)\n- Проактивно предложили план для погодных условий (backup route)\n- Назвали конкретную систему мониторинга (Carrier Lynx Fleet)\n- Обосновали высокую ставку через risk mitigation ($2.5M груз)\n- Предложили ГЕНИАЛЬНУЮ гарантию с финансовым риском на себя\n- Дали все документы быстро и проактивно\n- Подтвердили ВСЕ детали с полным протоколом\n- Показали исключительный профессионализм на каждом шаге\n\n💡 КЛЮЧЕВОЙ УРОК:\nДля премиум грузов (pharma, high-value) важны не только возможности, но и УВЕРЕННОСТЬ.\nПредложение performance guarantee показывает что вы не просто говорите - вы ГАРАНТИРУЕТЕ.\n\n🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:\nPharma loads требуют:\n- Temperature range 2-8°C (36-46°F)\n- Real-time monitoring systems\n- Team drivers для tight timelines\n- Higher insurance ($250K+)\n- Photo documentation\n- Proactive communication\n\nЭти грузы платят $2.50-$3.50/mile, но требуют exceptional service.\nОдин успешный pharma load = долгосрочный контракт на 2-3 груза в неделю!"
                }
            }
        ]
    }
};
