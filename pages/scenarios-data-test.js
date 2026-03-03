// СИМУЛЬ - База диалогов для обучения диспетчеров
// Версия: 2.2
// Дата: 2026-03-03

const allScenarios = [
    // ============================================
    // ДИАЛОГ #0: Chicago IL → Miami FL (REEFER)
    // Стиль: 🎓 Опытный брокер
    // Расстояние: 1,380 миль
    // ============================================
    {
        id: 0,
        route: "Chicago IL → Miami FL",
        distance: 1380,
        equipment: "Reefer",
        brokerStyle: "Опытный",
        difficulty: "medium",

        paths: {
            // МАСТЕР ПУТЬ (10 шагов)
            master: [
                {
                    brokerQuestion: "Yes, still available!\nThis is high-value produce load, needs experienced reefer carrier.\nWhat's your MC number and tell me about your reefer equipment?",
                    dispatcherPrompt: "💎 Брокер ищет опытного перевозчика. Покажите свою экспертизу.",
                    suggestions: [
                        {
                            text: "MC 445566, we specialize in temperature-controlled produce with 12 years experience.\n2023 Carrier reefer unit with multi-temp zones and real-time monitoring.\nDriver HACCP certified, currently empty in Chicago ready to load.",
                            quality: "master",
                            analytics: "Отлично! Показали специализацию, опыт и готовность."
                        },
                        {
                            text: "MC 445566, we have 2023 Carrier reefer, 53ft trailer.\nDriver is in Chicago now, ready for pickup.",
                            quality: "good",
                            analytics: "Хорошо, но не показали опыт с produce."
                        },
                        {
                            text: "MC 445566, reefer trailer available in Chicago area.",
                            quality: "weak",
                            analytics: "Слишком мало информации."
                        }
                    ]
                },
                {
                    brokerResponse: "Perfect! I just verified MC 445566 - 99% safety score, excellent produce history.\nThis is 44,000 lbs fresh strawberries, must maintain 34-36°F constant.\nPickup tomorrow 6 AM Chicago cold storage, delivery Miami in 48 hours.\nWith your experience, what rate are you looking at for this lane?",
                    dispatcherPrompt: "💎 Брокер впечатлен и дал детали груза. Назовите обоснованную ставку.",
                    suggestions: [
                        {
                            text: "For 1,380 miles with fresh produce and strict temperature control, I'm at $3,900 all-in.\nThat covers fuel, experienced driver, continuous temp monitoring, and guaranteed delivery.\nMarket rate for this lane is $2.75-$3.00/mile.",
                            quality: "master",
                            analytics: "Отлично! Обоснованная ставка."
                        },
                        {
                            text: "I'm looking at $3,750 for this load, that's $2.72/mile.\nWe can handle the tight timeline and temperature requirements.",
                            quality: "good",
                            analytics: "Хорошо, но ниже рынка."
                        },
                        {
                            text: "I need $4,200 for this distance with reefer equipment.",
                            quality: "aggressive",
                            analytics: "Слишком высоко без обоснования."
                        }
                    ]
                },
                {
                    brokerResponse: "I appreciate the detailed breakdown - that's exactly what I need to hear.\nPosted rate is $3,450, but I have budget flexibility for reliable carrier.\nStrawberries are time-sensitive, shipper is very strict about temperature.\nCan you meet me at $3,700?",
                    dispatcherPrompt: "💎 Брокер ценит профессионализм и идет навстречу. Торгуйтесь умно.",
                    suggestions: [
                        {
                            text: "I understand the urgency and shipper requirements, meet me at $3,850.\nYou get 12 years produce experience, temp logs every 2 hours, my personal guarantee.\nThat's $2.79/mile - fair for the service level you need.",
                            quality: "master",
                            analytics: "Отлично! Обоснование ценности."
                        },
                        {
                            text: "Can you do $3,800? That's my bottom line for this distance.\nWe'll provide all temp logs and updates you need.",
                            quality: "good",
                            analytics: "Хорошо, но можно было лучше."
                        },
                        {
                            text: "$3,700 works for us, let's book it and send rate confirmation.",
                            quality: "weak",
                            analytics: "Сдались слишком быстро."
                        }
                    ]
                },
                {
                    brokerResponse: "You make a strong case and I can see you understand produce logistics.\nLet me call shipper about budget increase for $3,850.\nIf approved, do we have a deal with temp logs every 2 hours as you mentioned?",
                    dispatcherPrompt: "💎 Брокер почти согласен. Подтвердите обязательства и двигайте процесс.",
                    suggestions: [
                        {
                            text: "Absolutely, $3,850 and it's yours! You'll get temp logs every 2 hours via email.\nGPS tracking link and check calls every 6 hours included.\nI'll send NOA immediately, driver will pre-cool unit tonight to 34°F.",
                            quality: "master",
                            analytics: "Отлично! Подтвердили и проактивны."
                        },
                        {
                            text: "$3,850 works, yes we'll provide temp logs every 2 hours.\nSend rate confirmation when ready, we'll handle the rest.",
                            quality: "good",
                            analytics: "Хорошо, подтвердили."
                        },
                        {
                            text: "Deal at $3,850, send the paperwork over.",
                            quality: "weak",
                            analytics: "Слишком коротко."
                        }
                    ]
                },
                {
                    brokerResponse: "Excellent! Shipper approved $3,850 based on your service commitment.\nSending rate con now to your email, what's your factoring company?",
                    dispatcherPrompt: "💎 Груз ваш! Дайте factoring информацию быстро.",
                    suggestions: [
                        {
                            text: "Perfect! We work with RTS Financial, sending NOA to your email right now.\nDriver will contact shipper tonight to confirm 6 AM pickup.\nWhat's shipper contact number and exact address?",
                            quality: "master",
                            analytics: "Отлично! Проактивность."
                        },
                        {
                            text: "Great! RTS Financial is our factoring company.\nSending NOA now, should arrive in a few minutes.",
                            quality: "good",
                            analytics: "Хорошо."
                        },
                        {
                            text: "RTS Financial, sending NOA.",
                            quality: "weak",
                            analytics: "Слишком коротко."
                        }
                    ]
                },
                {
                    brokerResponse: "Love the proactive approach! Shipper: Mike at 312-555-0145.\nAddress: 1234 Industrial Way, Chicago IL 60601, dock 7.\nThey're very particular - driver must arrive exactly at 6 AM, no delays.\nPre-cool confirmation required before arrival, any questions about pickup?",
                    dispatcherPrompt: "💎 Брокер дал важные детали. Покажите что понимаете серьезность.",
                    suggestions: [
                        {
                            text: "Understood - 6 AM sharp, no delays! Driver will pre-cool tonight, send temp confirmation by 10 PM.\nWill call Mike at 5:30 AM to confirm arrival at dock 7.\nHow long does loading typically take? Any special handling requirements?",
                            quality: "master",
                            analytics: "Отлично! Понимание требований."
                        },
                        {
                            text: "Got it, 6 AM sharp at dock 7, will pre-cool tonight.\nHow long for loading? Any special instructions for strawberries?",
                            quality: "good",
                            analytics: "Хорошо."
                        },
                        {
                            text: "Ok, 6 AM at dock 7, will pre-cool the unit.",
                            quality: "weak",
                            analytics: "Слишком коротко."
                        }
                    ]
                },
                {
                    brokerResponse: "Perfect! You clearly understand produce logistics, that's why I wanted experienced carrier.\nLoading takes 2-3 hours, they're very careful with strawberries, shipper covers $200 lumper.\nDelivery: Miami Fresh Distribution, 8901 Ocean Drive, Miami FL, receiver Carlos 305-555-0198.\nDelivery window 48 hours from pickup, FCFS, what else do you need from me?",
                    dispatcherPrompt: "💎 Все основные детали получены. Уточните последние важные моменты.",
                    suggestions: [
                        {
                            text: "Excellent, all noted! Two quick questions: any routing restrictions or preferred route?\nWhat's detention policy at delivery if they're backed up?\nAlso your 24/7 contact in case any issues on the road?",
                            quality: "master",
                            analytics: "Отлично! Планирование проблем."
                        },
                        {
                            text: "Got it, all clear! Any routing restrictions I should know about?\nAnd who to call if any issues during transit?",
                            quality: "good",
                            analytics: "Хорошо, базовые вопросы."
                        },
                        {
                            text: "All clear, thank you for the information.",
                            quality: "weak",
                            analytics: "Упущена возможность."
                        }
                    ]
                },
                {
                    brokerResponse: "Great questions - this is why I wanted experienced carrier!\nAvoid I-10 through Louisiana if possible - construction delays, take I-75 instead.\nDetention at delivery: $75/hour after 2 hours free time.\nMy cell 24/7: 312-555-9876, also shipper requires seal number photo before leaving.",
                    dispatcherPrompt: "💎 Брокер дал все детали. Подтвердите возможности и завершите профессионально.",
                    suggestions: [
                        {
                            text: "Absolutely! Driver will take seal photo and text it immediately after loading.\nWe'll route through I-75 to avoid I-10 construction as you suggested.\nI'll add your cell to driver's priority contact list, anything else or we're all set?",
                            quality: "master",
                            analytics: "Отлично! Подтвердили все."
                        },
                        {
                            text: "Yes, driver can send seal photo right after loading.\nWe'll avoid I-10 and take I-75, all set on our end.",
                            quality: "good",
                            analytics: "Хорошо."
                        },
                        {
                            text: "Yes, we can do seal photo and avoid I-10.",
                            quality: "weak",
                            analytics: "Слишком коротко."
                        }
                    ]
                },
                {
                    brokerResponse: "Perfect! We're all set then, I'm really impressed with your professionalism.\nThis is exactly the kind of carrier I need for my produce loads.\nI'll be sending you more opportunities - I have 3-4 Chicago to Florida lanes weekly.\nSafe travels and keep me posted!",
                    outcome: {
                        type: "success",
                        quality: "master",
                        rate: "$3,850",
                        ratePerMile: "$2.79/mile",
                        relationship: "Excellent - Preferred carrier, future loads guaranteed",
                        feedback: "🏆 МАСТЕР УРОВЕНЬ!\n\n✅ Показали экспертизу с первого ответа\n✅ Получили на $400 больше posted rate\n✅ Обосновали ценность сервиса\n✅ Задали все правильные вопросы\n✅ Проактивная коммуникация\n✅ Построили долгосрочные отношения\n\nБрокер будет звонить вам первым!"
                    }
                }
            ],

            // ХОРОШИЙ ПУТЬ (7 шагов) - начинается с good ответа
            good: [
                {
                    brokerQuestion: "Yes, still available!\nThis is high-value produce load, needs experienced reefer carrier.\nWhat's your MC number and tell me about your reefer equipment?",
                    dispatcherPrompt: "💎 Брокер ищет опытного перевозчика.",
                    suggestions: [
                        {
                            text: "MC 445566, we have 2023 Carrier reefer, 53ft trailer.\nDriver is in Chicago now, ready for pickup.",
                            quality: "good",
                            analytics: "Хорошо, но не показали опыт с produce."
                        }
                    ]
                },
                {
                    brokerResponse: "Good, verified MC 445566 - clean record.\nThis is 44,000 lbs fresh strawberries, must maintain 34-36°F constant.\nPickup tomorrow 6 AM Chicago, delivery Miami in 48 hours, what's your rate?",
                    dispatcherPrompt: "💎 Брокер дал детали. Назовите ставку.",
                    suggestions: [
                        {
                            text: "I'm looking at $3,750 for this load, that's $2.72/mile.\nWe can handle the tight timeline and temperature requirements.",
                            quality: "good",
                            analytics: "Хорошо."
                        }
                    ]
                },
                {
                    brokerResponse: "Posted rate is $3,450, I can go up to $3,600 for reliable carrier.\nFinal offer, yes or no?",
                    dispatcherPrompt: "💎 Финальное предложение брокера.",
                    suggestions: [
                        {
                            text: "$3,600 works for us, let's book it.\nSend rate confirmation and we'll handle the rest.",
                            quality: "good",
                            analytics: "Приняли предложение."
                        }
                    ]
                },
                {
                    brokerResponse: "Great! Sending rate con now, what's your factoring company?",
                    dispatcherPrompt: "💎 Дайте factoring.",
                    suggestions: [
                        {
                            text: "RTS Financial is our factoring company.\nSending NOA now, should arrive in a few minutes.",
                            quality: "good",
                            analytics: "Хорошо."
                        }
                    ]
                },
                {
                    brokerResponse: "Perfect! Pickup: Chicago Cold Storage, 1234 Industrial Way, dock 7, 6 AM sharp.\nDelivery: Miami Fresh Distribution, 8901 Ocean Drive.\nShipper: Mike 312-555-0145, pre-cool to 34°F before arrival.",
                    dispatcherPrompt: "💎 Подтвердите детали.",
                    suggestions: [
                        {
                            text: "Understood, driver will pre-cool tonight and arrive at 6 AM.\nWe'll keep you updated throughout, thank you for the load!",
                            quality: "good",
                            analytics: "Хорошо."
                        }
                    ]
                },
                {
                    brokerResponse: "Good, call if issues.",
                    outcome: {
                        type: "success",
                        quality: "good",
                        rate: "$3,600",
                        ratePerMile: "$2.61/mile",
                        relationship: "Good - Will call again",
                        feedback: "✅ ХОРОШИЙ РЕЗУЛЬТАТ!\n\n✅ Груз получен\n✅ Получили на $150 больше posted rate\n✅ Профессиональная коммуникация\n\nМогли получить еще $250 с лучшим обоснованием ставки."
                    }
                }
            ],

            // СЛАБЫЙ ПУТЬ (5 шагов) - начинается с weak ответа
            weak: [
                {
                    brokerQuestion: "Yes, still available!\nThis is high-value produce load, needs experienced reefer carrier.\nWhat's your MC number and tell me about your reefer equipment?",
                    dispatcherPrompt: "💎 Брокер ищет опытного перевозчика.",
                    suggestions: [
                        {
                            text: "MC 445566, reefer trailer available in Chicago area.",
                            quality: "weak",
                            analytics: "Слишком мало информации."
                        }
                    ]
                },
                {
                    brokerResponse: "I need more details for high-value produce load.\nWhat year is your reefer unit? Exact driver location?\nAny produce hauling experience or certifications?",
                    dispatcherPrompt: "💎 Брокер не впечатлен, нужно больше информации. Исправляйте ситуацию.",
                    suggestions: [
                        {
                            text: "2023 Carrier reefer unit, driver is empty in Chicago downtown.\nWe haul produce regularly, can handle temperature-controlled freight.",
                            quality: "normal",
                            analytics: "Лучше, но поздно."
                        }
                    ]
                },
                {
                    brokerResponse: "Ok, verified MC. 44,000 lbs strawberries, 34-36°F, pickup tomorrow 6 AM, delivery 48 hours.\nPosted rate $3,450, yes or no?",
                    dispatcherPrompt: "💎 Брокер торопится, предлагает только posted rate.",
                    suggestions: [
                        {
                            text: "Yes, we'll take it at $3,450.\nSend rate confirmation, we're ready to go.",
                            quality: "weak",
                            analytics: "Приняли posted rate."
                        }
                    ]
                },
                {
                    brokerResponse: "Sending rate con, factoring company to my email.\nPickup details inside, pre-cool to 34°F.",
                    dispatcherPrompt: "💎 Дайте factoring быстро.",
                    suggestions: [
                        {
                            text: "RTS Financial, sending NOA.",
                            quality: "weak",
                            analytics: "Слишком коротко."
                        }
                    ]
                },
                {
                    brokerResponse: "Got it, good luck.",
                    outcome: {
                        type: "success",
                        quality: "weak",
                        rate: "$3,450",
                        ratePerMile: "$2.50/mile",
                        relationship: "Neutral - Backup carrier only",
                        feedback: "⚪ СЛАБЫЙ РЕЗУЛЬТАТ\n\n✅ Груз получен\n⚠️ Приняли posted rate без переговоров\n⚠️ Не показали экспертизу\n⚠️ Минимальная коммуникация\n⚠️ Не уточнили важные детали\n\nВы могли получить на $200-400 больше!"
                    }
                }
            ]
        }
    }
];
