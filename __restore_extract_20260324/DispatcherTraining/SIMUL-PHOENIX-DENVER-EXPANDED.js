// ============================================
// РАСШИРЕННЫЙ ДИАЛОГ: Phoenix AZ → Denver CO (DRY VAN)
// Добавлены пути: GOOD, NORMAL, WEAK, AGGRESSIVE
// ============================================

// GOOD ПУТЬ (14-16 шагов) - профессиональный подход
good: [
    {
        brokerQuestion: "Yeah, available.\nMC? Location? Equipment?\nNeed to book fast, got 3 other carriers calling.",
        dispatcherPrompt: "✅ Брокер торопится. Дайте основную информацию четко.",
        suggestions: [
            {
                text: "MC 889900, driver in Albuquerque area with 53ft dry van.\nCan be in Phoenix tomorrow morning for pickup, truck is ready.",
                quality: "good",
                analytics: "Хорошо, но не показали точное расстояние и HOS."
            },
            {
                text: "MC 889900, driver currently in Albuquerque NM finishing delivery.\nEmpty by 2 PM today, 420 miles from Phoenix, can deadhead overnight.\n2023 Kenworth with 53ft Utility dry van, swing doors, air ride, food grade clean.\nDriver has 10 hours available after reset tonight.",
                quality: "master",
                analytics: "Слишком детально для good пути."
            },
            {
                text: "MC 889900, dry van available, can pickup tomorrow.",
                quality: "weak",
                analytics: "Слишком мало информации."
            }
        ]
    },
    {
        brokerResponse: "Albuquerque? How far is that?\nLoad picks up tomorrow 6 AM Phoenix.\nCan you make it on time?",
        dispatcherPrompt: "✅ Брокер спрашивает о расстоянии. Подтвердите возможность.",
        suggestions: [
            {
                text: "Driver can be there tonight, plenty of time before 6 AM pickup.\nWe're reliable carrier, never late, and willing to work on rate.\nWe really want this load.",
                quality: "good",
                analytics: "Хорошо, но не так убедительно как master."
            },
            {
                text: "420 miles, driver leaves today at 2 PM, arrives Phoenix by 8 PM.\nThat's 10 hours before pickup - plenty of time.\nWe're 98% on-time record, never missed a pickup.",
                quality: "master",
                analytics: "Слишком детально."
            },
            {
                text: "We can make it on time, no problem.",
                quality: "weak",
                analytics: "Не убедили."
            }
        ]
    },
    {
        brokerResponse: "Okay, I'll take your word for it.\nVerified MC 889900 - 98% safety score, good.\nLoad is 40,000 lbs paper products, 18 pallets, food grade trailer required.\nPickup tomorrow 6 AM Phoenix Paper Mill, delivery Denver in 2 days.\nRate is $1,800 all-in, that's $2.20/mile.\nWhat do you think?",
        dispatcherPrompt: "✅ Брокер дал детали и ставку. Торгуйтесь профессионально.",
        suggestions: [
            {
                text: "$1,800 is too low with our deadhead situation.\nI need at least $2,000 to cover expenses and deadhead.\nCan you do $2,000?",
                quality: "good",
                analytics: "Хорошо, но не так детально как master."
            },
            {
                text: "820 miles with 420 deadhead = 1,240 total miles.\n$1,800 means $1.45/mile actual - below costs.\nI need $2,050, that's $2.50/mile on loaded miles.\nCan you do $2,050?",
                quality: "master",
                analytics: "Слишком детально."
            },
            {
                text: "$1,800 works, let's book it.",
                quality: "weak",
                analytics: "Потеряли деньги."
            }
        ]
    },
    {
        brokerResponse: "I can go to $1,900, that's $2.32/mile.\nThat's my best offer, take it or leave it.",
        dispatcherPrompt: "✅ Брокер предложил компромисс. Примите или торгуйтесь еще раз.",
        suggestions: [
            {
                text: "Can you do $1,950? That's my bottom line.\nWe'll guarantee on-time pickup and delivery.",
                quality: "good",
                analytics: "Хорошо, но можно было получить больше."
            },
            {
                text: "$1,975 and we have a deal right now.\nYou get 98% on-time record, guaranteed 6 AM pickup.\nI'll send NOA in 5 minutes. Deal?",
                quality: "master",
                analytics: "Слишком агрессивно для good."
            },
            {
                text: "$1,900 works, let's book it.",
                quality: "weak",
                analytics: "Сдались быстро."
            }
        ]
    },
    {
        brokerResponse: "Alright, $1,950 works.\nFactoring or quick pay? I can do quick pay 2% fee.",
        dispatcherPrompt: "✅ Брокер не предложил factoring. Объясните политику.",
        suggestions: [
            {
                text: "We only work through factoring, company policy.\nOur factoring is TBS Factoring.\nCan you work with factoring?",
                quality: "good",
                analytics: "Хорошо, твердо но коротко."
            },
            {
                text: "I appreciate the offer, but we work exclusively through factoring.\nOur factoring is TBS Factoring.\nDo you work with factoring companies?\nIf yes, I can send NOA immediately.",
                quality: "master",
                analytics: "Слишком детально."
            },
            {
                text: "Quick pay works, 2% is fine.",
                quality: "weak",
                analytics: "ОШИБКА! Нарушили правило."
            }
        ]
    },
    {
        brokerResponse: "Factoring? Fine, I'll work with TBS.\nSend NOA now.\nWhat's your email for rate con?",
        dispatcherPrompt: "✅ Брокер согласился. Дайте информацию быстро.",
        suggestions: [
            {
                text: "Sending NOA now to your email.\nWhat's shipper address and contact info?",
                quality: "good",
                analytics: "Хорошо, быстро."
            },
            {
                text: "Perfect! Sending NOA right now, you'll have it in 90 seconds.\nTBS Factoring contact: 800-555-0100 if needed.\nWhat's shipper exact address, contact name and phone?",
                quality: "master",
                analytics: "Слишком детально."
            },
            {
                text: "NOA coming, send shipper info.",
                quality: "weak",
                analytics: "Слишком коротко."
            }
        ]
    },
    {
        brokerResponse: "Phoenix Paper Mill, 3456 Industrial Way, Phoenix AZ 85001.\nContact Steve, 602-555-0145, dock 8.\nPickup 6 AM - 8 AM, loading takes 2 hours.",
        dispatcherPrompt: "✅ Брокер дал pickup детали. Задайте важные вопросы.",
        suggestions: [
            {
                text: "Understood, dock 8, 6-8 AM.\nHow is cargo packaged?\nWhat's delivery info?",
                quality: "good",
                analytics: "Хорошо, базовые вопросы."
            },
            {
                text: "Got it! Steve 602-555-0145, dock 8.\nQuick questions: is cargo palletized? Load locks provided?\nAny special handling?\nWhat's delivery address and receiver contact?",
                quality: "master",
                analytics: "Слишком много вопросов."
            },
            {
                text: "Got it, 6 AM at dock 8.",
                quality: "weak",
                analytics: "Упущены вопросы."
            }
        ]
    },
    {
        brokerResponse: "Palletized, 18 pallets, they provide 6 load locks.\nDelivery: Denver Distribution Center, 5678 Warehouse Road, Denver CO 80201.\nReceiver Lisa, 303-555-0167, dock 12.\nCall 4 hours ahead for appointment.",
        dispatcherPrompt: "✅ Все детали получены. Подтвердите и завершите.",
        suggestions: [
            {
                text: "Got it, will call 4 hours ahead.\nDetention policy? Your contact number?",
                quality: "good",
                analytics: "Хорошо, важные вопросы."
            },
            {
                text: "Perfect! Lisa 303-555-0167, dock 12, call 4 hours ahead.\nLast questions: detention policy? Your 24/7 contact?\nRouting restrictions?\nThat's all I need!",
                quality: "master",
                analytics: "Слишком много."
            },
            {
                text: "All clear, we're ready.",
                quality: "weak",
                analytics: "Упущены детали."
            }
        ]
    },
    {
        brokerResponse: "Detention $75/hour after 2 hours.\nMy cell 602-555-9999, text only.\nNo routing restrictions, I-17 to I-40 to I-25.\nWe good?",
        dispatcherPrompt: "✅ Брокер дал финальные детали. Подтвердите все.",
        suggestions: [
            {
                text: "All set! Pickup tomorrow 6 AM, delivery in 2 days.\nWill text you at pickup, thanks!",
                quality: "good",
                analytics: "Хорошо, профессионально."
            },
            {
                text: "We're done! Quick summary:\nDriver arrives Phoenix tonight, pickup 6 AM dock 8.\nDelivery Denver in 2 days, call Lisa 4 hours ahead.\n$1,950 rate, TBS Factoring, NOA sent.\nI'll text you at pickup!",
                quality: "master",
                analytics: "Слишком детально."
            },
            {
                text: "Done, thanks.",
                quality: "weak",
                analytics: "Слишком коротко."
            }
        ]
    },
    {
        brokerResponse: "Good. Text me at pickup.\nIf everything goes well, I got more loads for you.",
        outcome: {
            type: "success",
            quality: "good",
            rate: "$1,950",
            ratePerMile: "$2.37/mile",
            relationship: "Good - Possible repeat loads",
            dialogueTime: "6-8 minutes",
            questionsAsked: "6-8 questions",
            detailLevel: "medium",
            futureOpportunity: "repeat",
            weeklyLoads: "1-2 loads possible",
            feedback: "✅ ХОРОШИЙ УРОВЕНЬ!\n\n✅ ЧТО СДЕЛАНО ПРАВИЛЬНО:\n- Подтвердили возможность прибытия вовремя\n- Торговались и получили $150 больше posted rate\n- Стояли на правиле о factoring\n- Задали основные вопросы о pickup и delivery\n- Профессиональная коммуникация\n\n⚠️ ЧТО МОЖНО УЛУЧШИТЬ:\n- Можно было получить $1,975 вместо $1,950 с лучшим обоснованием\n- Можно было задать больше деталей о cargo handling\n- Можно было показать больше проактивности\n\n💡 КЛЮЧЕВОЙ УРОК:\nПрофессиональный подход работает, но детали и проактивность дают лучшие результаты\n\n🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:\nХороший базовый уровень для получения грузов, но для лучших ставок и долгосрочных отношений нужно больше деталей."
        }
    }
],

    // NORMAL ПУТЬ (12-14 шагов) - базовый подход
    normal: [
        {
            brokerQuestion: "Yeah, available.\nMC? Location? Equipment?\nNeed to book fast, got 3 other carriers calling.",
            dispatcherPrompt: "⚪ Брокер торопится. Дайте базовую информацию.",
            suggestions: [
                {
                    text: "MC 889900, dry van available, can pickup tomorrow.",
                    quality: "weak",
                    analytics: "Слишком мало информации для торопливого брокера."
                },
                {
                    text: "MC 889900, driver in Albuquerque area with 53ft dry van.\nCan be in Phoenix tomorrow morning for pickup.",
                    quality: "good",
                    analytics: "Лучше, но все еще мало."
                },
                {
                    text: "MC 889900, driver currently in Albuquerque NM.\nEmpty by 2 PM today, 420 miles from Phoenix.\n2023 Kenworth with 53ft dry van, ready for pickup.",
                    quality: "master",
                    analytics: "Слишком детально для normal."
                }
            ]
        },
        {
            brokerResponse: "Albuquerque? That's far.\nOther carriers are closer.\nWhy should I wait?",
            dispatcherPrompt: "⚪ Брокер сомневается. Убедите его коротко.",
            suggestions: [
                {
                    text: "We can make it on time, no problem with deadhead.",
                    quality: "weak",
                    analytics: "Не убедили брокера."
                },
                {
                    text: "Driver can be there tonight, plenty of time before 6 AM.\nWe're reliable, never late.",
                    quality: "normal",
                    analytics: "Базовое убеждение."
                },
                {
                    text: "Driver leaves today at 2 PM, arrives Phoenix by 8 PM.\n10 hours before pickup - plenty of time.\n98% on-time record.",
                    quality: "good",
                    analytics: "Слишком детально."
                }
            ]
        },
        {
            brokerResponse: "Okay, I'll give you a shot.\nMC 889900 checks out.\nLoad is 40,000 lbs paper products, pickup tomorrow 6 AM Phoenix, delivery Denver in 2 days.\nRate is $1,800.\nYes or no?",
            dispatcherPrompt: "⚪ Брокер дал базовые детали и ставку. Торгуйтесь или принимайте.",
            suggestions: [
                {
                    text: "$1,800 works, let's book it.",
                    quality: "weak",
                    analytics: "Потеряли возможность торговаться."
                },
                {
                    text: "$1,800 is low with deadhead.\nCan you do $1,900?",
                    quality: "normal",
                    analytics: "Базовая торговля."
                },
                {
                    text: "$1,800 is too low with 420 miles deadhead.\nI need at least $2,000 to cover expenses.",
                    quality: "good",
                    analytics: "Слишком агрессивно."
                }
            ]
        },
        {
            brokerResponse: "I can do $1,850, that's it.\nTake it or I'm calling next carrier.",
            dispatcherPrompt: "⚪ Брокер предложил небольшое повышение. Решайте быстро.",
            suggestions: [
                {
                    text: "$1,850 works, let's do it.",
                    quality: "normal",
                    analytics: "Приняли компромисс."
                },
                {
                    text: "Can you do $1,900? That's my bottom line.",
                    quality: "good",
                    analytics: "Еще одна попытка."
                },
                {
                    text: "$1,800 is fine, book it.",
                    quality: "weak",
                    analytics: "Сдались."
                }
            ]
        },
        {
            brokerResponse: "Fine, $1,850.\nQuick pay 2% or NET 30?",
            dispatcherPrompt: "⚪ Брокер не упомянул factoring. Скажите что работаете через factoring.",
            suggestions: [
                {
                    text: "We work through factoring only.\nTBS Factoring. Can you work with that?",
                    quality: "normal",
                    analytics: "Базовое объяснение."
                },
                {
                    text: "Quick pay works, 2% is fine.",
                    quality: "weak",
                    analytics: "ОШИБКА! Нарушили правило."
                },
                {
                    text: "We only work through factoring, company policy.\nOur factoring is TBS Factoring.\nCan you work with factoring?",
                    quality: "good",
                    analytics: "Более детально."
                }
            ]
        },
        {
            brokerResponse: "Factoring? Okay, fine.\nSend NOA.\nShipper is Phoenix Paper Mill, 3456 Industrial Way, dock 8.\nPickup 6 AM.",
            dispatcherPrompt: "⚪ Брокер дал базовую информацию. Спросите что нужно.",
            suggestions: [
                {
                    text: "Sending NOA now.\nWhat's delivery info?",
                    quality: "normal",
                    analytics: "Базовый вопрос."
                },
                {
                    text: "NOA coming.\nShipper contact? Delivery address?",
                    quality: "good",
                    analytics: "Больше вопросов."
                },
                {
                    text: "Got it, sending NOA.",
                    quality: "weak",
                    analytics: "Не спросили детали."
                }
            ]
        },
        {
            brokerResponse: "Shipper contact Steve 602-555-0145.\nDelivery: Denver Distribution Center, 5678 Warehouse Road, dock 12.\nReceiver Lisa 303-555-0167.\nCall 4 hours ahead.",
            dispatcherPrompt: "⚪ Все основные детали получены. Подтвердите.",
            suggestions: [
                {
                    text: "Got it, all clear.\nWe'll be there 6 AM tomorrow.",
                    quality: "normal",
                    analytics: "Базовое подтверждение."
                },
                {
                    text: "Understood. Your contact number for updates?",
                    quality: "good",
                    analytics: "Дополнительный вопрос."
                },
                {
                    text: "Okay, thanks.",
                    quality: "weak",
                    analytics: "Слишком коротко."
                }
            ]
        },
        {
            brokerResponse: "My cell 602-555-9999.\nText me at pickup.",
            outcome: {
                type: "success",
                quality: "normal",
                rate: "$1,850",
                ratePerMile: "$2.26/mile",
                relationship: "Neutral - One-time load",
                dialogueTime: "4-6 minutes",
                questionsAsked: "3-5 questions",
                detailLevel: "low",
                futureOpportunity: "one-time",
                weeklyLoads: "0-1 loads maybe",
                feedback: "⚪ НОРМАЛЬНЫЙ УРОВЕНЬ\n\n✅ ЧТО СДЕЛАНО ПРАВИЛЬНО:\n- Получили груз\n- Стояли на правиле о factoring\n- Немного поторговались ($50 больше)\n- Базовая профессиональная коммуникация\n\n⚠️ ЧТО МОЖНО УЛУЧШИТЬ:\n- Потеряли $100-125 из-за слабой торговли\n- Не задали важные вопросы о cargo, detention, routing\n- Не показали проактивность\n- Не построили отношения для будущих грузов\n\n💡 КЛЮЧЕВОЙ УРОК:\nБазовый подход дает базовые результаты - груз получен, но ставка низкая и нет будущих возможностей\n\n🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:\nЭто минимум для получения груза, но для роста бизнеса нужно больше деталей и проактивности."
            }
        }
    ]
