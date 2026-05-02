// СИМУЛЬ - База диалогов для обучения диспетчеров
// Версия: 3.0
// Дата: 2026-03-03
// ПРАВИЛО: ВСЕГДА 3 варианта ответа в каждом шаге!

const allScenarios = [
    // ============================================
    // ДИАЛОГ #0: Phoenix AZ → Denver CO (DRY VAN)
    // Стиль: 🏃 Торопливый + ⏰ Занятой брокер
    // Расстояние: 820 миль (MEDIUM HAUL)
    // ПРОБЛЕМНАЯ СИТУАЦИЯ: Водитель далеко + Брокер отказывается от Factoring
    // 18 ШАГОВ ДЛЯ МАСТЕР ПУТИ
    // ============================================
    {
        id: 0,
        route: "Phoenix AZ → Denver CO",
        distance: 820,
        equipment: "Dry Van",
        brokerStyle: "Торопливый + Занятой",
        difficulty: "hard",

        initialMessage: "Good morning!\nThis is Carlos from Southwest Transport Solutions.\nI'm calling about your Phoenix to Denver dry van load.\nIs this still available?",

        paths: {
            // МАСТЕР ПУТЬ (18 шагов) - с проблемной ситуацией
            master: [
                {
                    brokerQuestion: "Yeah, available.\nMC? Location? Equipment?\nNeed to book fast, got 3 other carriers calling.",
                    dispatcherPrompt: "💎 Брокер очень торопится. Дайте всю информацию быстро и четко.",
                    suggestions: [
                        {
                            text: "MC 889900, driver currently in Albuquerque NM finishing delivery.\nEmpty by 2 PM today, 420 miles from Phoenix, can deadhead overnight.\n2023 Kenworth with 53ft Utility dry van, swing doors, air ride, food grade clean.\nDriver has 10 hours available after reset tonight.",
                            quality: "master",
                            analytics: "Отлично! Вся информация сразу, показали решение проблемы с расстоянием."
                        },
                        {
                            text: "MC 889900, driver in Albuquerque area with 53ft dry van.\nCan be in Phoenix tomorrow morning for pickup, truck is ready.",
                            quality: "good",
                            analytics: "Хорошо, но не указали точное расстояние и HOS."
                        },
                        {
                            text: "MC 889900, dry van available, can pickup tomorrow.",
                            quality: "weak",
                            analytics: "Слишком мало информации для торопливого брокера."
                        }
                    ]
                },
                {
                    brokerResponse: "Albuquerque? That's 420 miles deadhead!\nLoad picks up tomorrow 6 AM Phoenix, can't wait for long deadhead.\nOther carriers are closer, why should I wait for you?",
                    dispatcherPrompt: "💎 Брокер сомневается из-за расстояния. Убедите его что вы стоите ожидания.",
                    suggestions: [
                        {
                            text: "I understand the concern, but here's why we're worth it:\nDriver leaves Albuquerque today at 2 PM, arrives Phoenix by 8 PM tonight.\nThat's 10 hours before your 6 AM pickup - plenty of time.\nWe're food grade specialists, 98% on-time record, never missed a pickup.\nPlus, I'm willing to absorb $100 of deadhead cost to make this work.\nYou get experienced carrier, guaranteed on-time, for competitive rate.",
                            quality: "master",
                            analytics: "Отлично! Решили проблему, показали ценность, предложили компромисс."
                        },
                        {
                            text: "Driver can be there tonight, plenty of time before 6 AM pickup.\nWe're reliable carrier, never late, and willing to work on rate.\nWe really want this load.",
                            quality: "good",
                            analytics: "Хорошо, но не так убедительно."
                        },
                        {
                            text: "We can make it on time, no problem with deadhead.",
                            quality: "weak",
                            analytics: "Не убедили брокера."
                        }
                    ]
                },
                {
                    brokerResponse: "Okay, you got my attention with the on-time record and deadhead absorption.\nVerified MC 889900 - 98% safety score, good.\nLoad is 40,000 lbs paper products, 18 pallets, food grade trailer required.\nPickup tomorrow 6 AM Phoenix Paper Mill, delivery Denver in 2 days.",
                    brokerQuestion: "Rate is $1,800 all-in, that's $2.20/mile.\nYes or no? Got other calls waiting.",
                    dispatcherPrompt: "💎 Брокер торопится с решением. Ставка низкая, но нужно торговаться быстро.",
                    suggestions: [
                        {
                            text: "I appreciate the quick decision, but let's be fair on rate.\n820 miles with 420 deadhead = 1,240 total miles for us.\n$1,800 means we're at $1.45/mile actual - that's below operating costs.\nI need $2,050 to make this work, that's $2.50/mile on loaded miles.\nStill competitive, and you get guaranteed on-time delivery from proven carrier.\nCan you do $2,050?",
                            quality: "master",
                            analytics: "Отлично! Быстро объяснили математику и обосновали ставку."
                        },
                        {
                            text: "$1,800 is too low with our deadhead situation.\nI need at least $2,000 to cover expenses and deadhead.\nCan you do $2,000?",
                            quality: "good",
                            analytics: "Хорошо, но не так детально."
                        },
                        {
                            text: "$1,800 works, let's book it now.",
                            quality: "weak",
                            analytics: "Потеряли деньги, не учли deadhead."
                        }
                    ]
                },
                {
                    brokerResponse: "Look, I get the deadhead math, but that's your problem, not mine.\nPosted rate is $1,800, market rate for this lane is $2.15-$2.25/mile.\nI can go to $1,900, that's $2.32/mile - fair for the lane.",
                    brokerQuestion: "Take it or I'm calling next carrier, decide now.",
                    dispatcherPrompt: "💎 Брокер давит на решение. Торгуйтесь умно но быстро.",
                    suggestions: [
                        {
                            text: "I understand the pressure, let's meet in the middle.\n$1,975 and we have a deal right now - that's $2.41/mile.\nYou get food grade specialist, 98% on-time record, guaranteed 6 AM pickup.\nI'll send NOA in 5 minutes, driver confirmed for tonight arrival.\nDeal?",
                            quality: "master",
                            analytics: "Отлично! Быстрый компромисс с подтверждением ценности."
                        },
                        {
                            text: "Can you do $1,950? That's my bottom line.\nWe'll guarantee on-time pickup and delivery.",
                            quality: "good",
                            analytics: "Хорошо, но можно было получить больше."
                        },
                        {
                            text: "$1,900 works, let's book it.",
                            quality: "weak",
                            analytics: "Сдались слишком быстро."
                        }
                    ]
                },
                {
                    brokerResponse: "Fine, $1,975, but only because of your on-time record.",
                    brokerQuestion: "Factoring or quick pay? I can do quick pay 2% fee, money in 2 days.\nOr standard NET 30 days. Choose fast.",
                    dispatcherPrompt: "💎 ПРОБЛЕМА! Брокер не предложил factoring. Объясните что работаете только через factoring.",
                    suggestions: [
                        {
                            text: "I appreciate the offer, but we work exclusively through factoring company.\nOur factoring is TBS Factoring, they handle all our payments.\nDo you work with factoring companies?\nIf yes, I can send NOA immediately and we're all set.\nIf not, unfortunately we can't take the load - company policy, no exceptions.",
                            quality: "master",
                            analytics: "Отлично! Четко объяснили политику и дали выбор."
                        },
                        {
                            text: "We only work through factoring, company policy.\nOur factoring is TBS Factoring.\nCan you work with factoring?",
                            quality: "good",
                            analytics: "Хорошо, но коротко."
                        },
                        {
                            text: "Quick pay works for us, 2% fee is fine.",
                            quality: "weak",
                            analytics: "ОШИБКА! Нарушили правило - только factoring!"
                        }
                    ]
                },
                {
                    brokerResponse: "Factoring? Ugh, I hate dealing with factoring companies.\nThey take forever to process, always asking for extra documents.",
                    brokerQuestion: "Can't you just take quick pay this one time? 2% is nothing.",
                    dispatcherPrompt: "💎 Брокер сопротивляется factoring. Стойте на своем, но будьте вежливы.",
                    suggestions: [
                        {
                            text: "I completely understand your frustration with factoring companies.\nBut our company policy is strict - all payments through factoring, no exceptions.\nGood news: TBS Factoring is very efficient, they process in 24 hours.\nI'll send NOA right now, you'll have it in 2 minutes.\nThey rarely ask for extra documents if rate con is complete.\nI've worked with hundreds of brokers through TBS, never had issues.\nCan you work with this, or should I pass on the load?",
                            quality: "master",
                            analytics: "Отлично! Понимание + твердость + решение проблемы."
                        },
                        {
                            text: "I understand, but company policy is factoring only.\nTBS Factoring is fast and efficient, no problems.\nCan you work with factoring or not?",
                            quality: "good",
                            analytics: "Хорошо, твердо."
                        },
                        {
                            text: "Sorry, only factoring, company policy.",
                            quality: "weak",
                            analytics: "Слишком коротко, не убедили."
                        }
                    ]
                },
                {
                    brokerResponse: "Alright, fine! I'll work with TBS Factoring this time.\nBut if they give me any problems, I'm not using you again.\nSend NOA now, I need it in 2 minutes like you said.",
                    brokerQuestion: "Email and phone number with extension if you have?\nNeed to send rate con.",
                    dispatcherPrompt: "💎 Брокер согласился! Быстро дайте factoring и запросите детали.",
                    suggestions: [
                        {
                            text: "Perfect! Sending NOA to your email right now, you'll have it in 90 seconds.\nTBS Factoring contact: 800-555-0100 if you need anything.\nFor shipper info: what's the exact address, contact name and phone?\nAlso dock number and any gate code?\nI'll have driver call shipper tonight to confirm 6 AM pickup.",
                            quality: "master",
                            analytics: "Отлично! Быстро и проактивно."
                        },
                        {
                            text: "Sending NOA now to your email.\nWhat's shipper address and contact info?",
                            quality: "good",
                            analytics: "Хорошо."
                        },
                        {
                            text: "NOA coming now, send me shipper info.",
                            quality: "weak",
                            analytics: "Слишком коротко."
                        }
                    ]
                },
                {
                    brokerResponse: "Phoenix Paper Mill, 3456 Industrial Way, Phoenix AZ 85001.\nContact Steve, 602-555-0145, dock 8.\nPickup window 6 AM - 8 AM, loading takes 2 hours.\nNo gate code, just check in at office.",
                    brokerQuestion: "Any other questions? Need to move fast.",
                    dispatcherPrompt: "💎 Брокер дал pickup детали и торопится. Задайте критические вопросы быстро.",
                    suggestions: [
                        {
                            text: "Got it! Steve 602-555-0145, dock 8, 6-8 AM window.\nQuick questions: is cargo palletized? Do they provide load locks?\nAny special handling for paper products?\nWhat's delivery address and receiver contact?",
                            quality: "master",
                            analytics: "Отлично! Быстрые критические вопросы."
                        },
                        {
                            text: "Understood, dock 8, 6-8 AM.\nHow is cargo packaged?\nWhat's delivery info?",
                            quality: "good",
                            analytics: "Хорошо, базовые вопросы."
                        },
                        {
                            text: "Got it, 6 AM at dock 8.",
                            quality: "weak",
                            analytics: "Упущены важные вопросы."
                        }
                    ]
                },
                {
                    brokerResponse: "Palletized, 18 pallets, they provide 6 load locks.\nPaper is heavy, secure it well, no special handling.\nDelivery: Denver Distribution Center, 5678 Warehouse Road, Denver CO 80201.\nReceiver Lisa, 303-555-0167, dock 12.\nDelivery in 2 days, call 4 hours ahead for appointment.",
                    brokerQuestion: "Anything else?",
                    dispatcherPrompt: "💎 Брокер дал delivery детали. Уточните последние важные моменты быстро.",
                    suggestions: [
                        {
                            text: "Perfect! Lisa 303-555-0167, dock 12, call 4 hours ahead.\nLast questions: detention policy? Your 24/7 contact?\nAny routing restrictions or preferred route?\nThat's all I need, we're ready to roll!",
                            quality: "master",
                            analytics: "Отлично! Быстрые финальные вопросы."
                        },
                        {
                            text: "Got it, will call 4 hours ahead.\nDetention policy? Your contact number?",
                            quality: "good",
                            analytics: "Хорошо."
                        },
                        {
                            text: "All clear, we're ready.",
                            quality: "weak",
                            analytics: "Упущены важные детали."
                        }
                    ]
                },
                {
                    brokerResponse: "Detention $75/hour after 2 hours free time.\nMy cell 602-555-9999, text only, don't call unless emergency.\nNo routing restrictions, I-17 to I-40 to I-25 is fastest.",
                    brokerQuestion: "We done? I got 5 other loads to book.",
                    dispatcherPrompt: "💎 Брокер очень торопится закончить. Подтвердите все и завершите быстро.",
                    suggestions: [
                        {
                            text: "We're done! Quick summary:\nDriver arrives Phoenix tonight, pickup 6 AM dock 8 tomorrow.\nDelivery Denver in 2 days, call Lisa 4 hours ahead.\n$1,975 rate, TBS Factoring, NOA sent.\nI'll text you when driver picks up tomorrow.\nThanks for working with factoring!",
                            quality: "master",
                            analytics: "Отлично! Быстрое подтверждение всех деталей."
                        },
                        {
                            text: "All set! Pickup tomorrow 6 AM, delivery in 2 days.\nWill text you at pickup, thanks!",
                            quality: "good",
                            analytics: "Хорошо."
                        },
                        {
                            text: "Done, thanks.",
                            quality: "weak",
                            analytics: "Слишком коротко."
                        }
                    ]
                },
                {
                    brokerResponse: "Good. Text me at pickup, don't forget.\nIf TBS Factoring gives me problems, you're off my list.\nOtherwise, I got more Phoenix to Denver loads weekly.\nGotta go, other line ringing.",
                    dispatcherPrompt: "💎 Брокер предупредил о factoring и упомянул будущие грузы. Заверьте его.",
                    suggestions: [
                        {
                            text: "Understood! TBS won't give you problems, I guarantee it.\nIf any issues, call me directly and I'll handle it.\nWe'd love those weekly Phoenix-Denver lanes.\nYou won't regret working with us - we'll prove it on this load.\nTalk to you tomorrow at pickup!",
                            quality: "master",
                            analytics: "Отлично! Заверили и показали интерес к будущему."
                        },
                        {
                            text: "No problems with TBS, I promise.\nLooking forward to more loads, talk tomorrow!",
                            quality: "good",
                            analytics: "Хорошо."
                        },
                        {
                            text: "Okay, talk tomorrow.",
                            quality: "weak",
                            analytics: "Слишком коротко."
                        }
                    ]
                },
                {
                    brokerResponse: "Alright, we'll see how it goes. Later.",
                    outcome: {
                        type: "success",
                        quality: "master",
                        rate: "$1,975",
                        ratePerMile: "$2.41/mile",
                        relationship: "Conditional - Prove yourself, then weekly loads possible",
                        dialogueTime: "8-10 minutes",
                        questionsAsked: "10+ quick critical questions",
                        detailLevel: "high",
                        futureOpportunity: "repeat",
                        weeklyLoads: "2-3 loads if perform well",
                        feedback: "🏆 МАСТЕР УРОВЕНЬ!\n\n✅ ЧТО СДЕЛАНО ПРАВИЛЬНО:\n- Решили проблему с deadhead (420 миль) - объяснили план прибытия вечером\n- Предложили абсорбировать $100 deadhead cost - показали гибкость\n- Быстро обосновали ставку через математику deadhead - получили $175 больше posted rate\n- СТОЯЛИ НА СВОЕМ с factoring - не нарушили правило компании несмотря на давление\n- Объяснили преимущества TBS Factoring - убедили брокера работать с factoring\n- Работали в темпе брокера - быстрые ответы, критические вопросы только\n- Заверили брокера что TBS не создаст проблем - построили доверие\n- Показали интерес к будущим грузам - открыли дверь для 2-3 weekly loads\n\n⚠️ ЧТО МОЖНО УЛУЧШИТЬ:\n- Можно было спросить про lumper fee\n- Можно было уточнить про weight distribution для тяжелой бумаги\n\n💡 КЛЮЧЕВОЙ УРОК:\nДаже с проблемами (deadhead, factoring resistance) можно получить груз через быстрое решение проблем и твердость в правилах компании\n\n🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:\nКогда водитель далеко - объясните план прибытия и предложите компромисс на deadhead. Когда брокер отказывается от factoring - будьте вежливы но тверды, объясните преимущества. Работайте в темпе брокера - торопливые брокеры ценят скорость и четкость."
                    }
                }
            ],

            // GOOD ПУТЬ (14-16 шагов) - профессиональный подход
            good: [
                {
                    brokerQuestion: "Yeah, available.\nMC? Location? Equipment?\nNeed to book fast, got 3 other carriers calling.",
                    dispatcherPrompt: "✅ Брокер торопится. Дайте основную информацию четко.",
                    suggestions: [
                        {
                            text: "MC 889900, driver in Albuquerque area with 53ft dry van.\nCan be in Phoenix tomorrow morning for pickup, truck is ready.",
                            quality: "good",
                            analytics: "Хорошо для good пути - основная информация без лишних деталей."
                        },
                        {
                            text: "MC 889900, driver in Albuquerque with 53ft dry van.\nWe can make the pickup time.",
                            quality: "normal",
                            analytics: "Слишком мало информации."
                        },
                        {
                            text: "MC 889900, dry van available, can pickup tomorrow.",
                            quality: "weak",
                            analytics: "Очень мало информации."
                        }
                    ]
                },
                {
                    brokerResponse: "Albuquerque? How far is that?\nLoad picks up tomorrow 6 AM Phoenix.\nCan you make it on time?",
                    dispatcherPrompt: "✅ Брокер спрашивает о расстоянии. Подтвердите возможность.",
                    suggestions: [
                        {
                            text: "About 420 miles, driver leaves today and arrives tonight.\nPlenty of time before 6 AM pickup.\nWe're reliable carrier, never late.",
                            quality: "good",
                            analytics: "Хорошо - дали расстояние и подтвердили надежность."
                        },
                        {
                            text: "Driver can be there tonight, no problem.\nWe're reliable, never late.",
                            quality: "normal",
                            analytics: "Базовое подтверждение."
                        },
                        {
                            text: "We can make it on time, no problem.",
                            quality: "weak",
                            analytics: "Не убедили."
                        }
                    ]
                },
                {
                    brokerResponse: "Okay, sounds good.\nVerified MC 889900 - 98% safety score, good.\nLoad is 40,000 lbs paper products, 18 pallets, food grade trailer required.\nPickup tomorrow 6 AM Phoenix Paper Mill, delivery Denver in 2 days.\nRate is $1,800 all-in, that's $2.20/mile.\nWhat do you think?",
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
                            text: "MC 889900, driver in Albuquerque with 53ft dry van.\nCan be in Phoenix tomorrow morning for pickup.",
                            quality: "normal",
                            analytics: "Базовая информация для normal пути."
                        },
                        {
                            text: "MC 889900, dry van available, can pickup tomorrow.",
                            quality: "weak",
                            analytics: "Слишком мало информации."
                        },
                        {
                            text: "MC 889900, driver in Albuquerque area with 53ft dry van.\nEmpty tonight, ready for 6 AM pickup tomorrow.",
                            quality: "good",
                            analytics: "Чуть больше деталей."
                        }
                    ]
                },
                {
                    brokerResponse: "Albuquerque? That's far.\nOther carriers are closer.\nWhy should I wait?",
                    dispatcherPrompt: "⚪ Брокер сомневается. Убедите его коротко.",
                    suggestions: [
                        {
                            text: "Driver can be there tonight, plenty of time before 6 AM.\nWe're reliable, never late.",
                            quality: "normal",
                            analytics: "Базовое убеждение для normal пути."
                        },
                        {
                            text: "We can make it on time, no problem.",
                            quality: "weak",
                            analytics: "Не убедили брокера."
                        },
                        {
                            text: "About 420 miles, driver leaves today and arrives tonight.\nWe're 98% on-time record, never missed a pickup.",
                            quality: "good",
                            analytics: "Больше деталей."
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
            ],

            // WEAK ПУТЬ (8-10 шагов) - неуверенный подход, низкая ставка
            weak: [
                {
                    brokerQuestion: "Yeah, available.\nMC? Location? Equipment?\nNeed to book fast, got 3 other carriers calling.",
                    dispatcherPrompt: "⚠️ Брокер торопится. Дайте минимальную информацию.",
                    suggestions: [
                        {
                            text: "MC 889900, dry van available, can pickup tomorrow.",
                            quality: "weak",
                            analytics: "Слишком мало информации - не сказали где водитель."
                        },
                        {
                            text: "MC 889900, 53ft dry van, ready for pickup.",
                            quality: "weak",
                            analytics: "Тоже мало - не сказали местоположение."
                        },
                        {
                            text: "MC 889900, driver with dry van, can make pickup time.",
                            quality: "weak",
                            analytics: "Минимум информации."
                        }
                    ]
                },
                {
                    brokerResponse: "Where is your driver now?\nHow far from Phoenix?",
                    dispatcherPrompt: "⚠️ Брокер спрашивает местоположение. Вы не дали эту информацию в первом ответе.",
                    suggestions: [
                        {
                            text: "Driver in Albuquerque, can be there tomorrow morning.\nWe really need this load, please.",
                            quality: "weak",
                            analytics: "Звучите отчаянно, не сказали расстояние."
                        },
                        {
                            text: "In Albuquerque, about 420 miles.\nDriver can make it tonight.",
                            quality: "normal",
                            analytics: "Дали информацию без отчаяния."
                        },
                        {
                            text: "Driver in Albuquerque NM, 420 miles away.\nLeaves today at 2 PM, arrives Phoenix by 8 PM tonight.\nPlenty of time for 6 AM pickup.",
                            quality: "good",
                            analytics: "Слишком детально для weak пути."
                        }
                    ]
                },
                {
                    brokerResponse: "Albuquerque? That's 420 miles deadhead!\nI need someone closer.\nWhy should I wait for you?",
                    dispatcherPrompt: "⚠️ Брокер сомневается из-за расстояния. Вы в слабой позиции.",
                    suggestions: [
                        {
                            text: "We can make it, please give us a chance.\nWe really need this load.",
                            quality: "weak",
                            analytics: "Звучите отчаянно - это слабая позиция."
                        },
                        {
                            text: "Driver can be there tonight, no problem.\nWe're reliable carrier.",
                            quality: "normal",
                            analytics: "Лучше, но все еще слабо."
                        },
                        {
                            text: "Driver leaves today, arrives tonight.\nWe're 98% on-time record, never late.",
                            quality: "good",
                            analytics: "Слишком уверенно для weak."
                        }
                    ]
                },
                {
                    brokerResponse: "I don't know... other carriers are calling.\nLoad is 40,000 lbs paper, pickup tomorrow 6 AM Phoenix, delivery Denver in 2 days.\nRate is $1,800.\nYou want it or not?",
                    dispatcherPrompt: "⚠️ Брокер сомневается и давит. Вы в слабой позиции.",
                    suggestions: [
                        {
                            text: "Yes! $1,800 works, we'll take it!\nThank you for the opportunity!",
                            quality: "weak",
                            analytics: "Сдались без торговли, звучите отчаянно."
                        },
                        {
                            text: "$1,800 is a bit low.\nCan you do $1,850?",
                            quality: "normal",
                            analytics: "Слабая попытка торговаться."
                        },
                        {
                            text: "$1,800 is too low with deadhead.\nI need at least $1,950.",
                            quality: "good",
                            analytics: "Слишком агрессивно для weak позиции."
                        }
                    ]
                },
                {
                    brokerResponse: "$1,800 is the rate, take it or leave it.\nI got other carriers waiting.",
                    dispatcherPrompt: "⚠️ Брокер не двигается. Примите или потеряете груз.",
                    suggestions: [
                        {
                            text: "Okay, $1,800 works.\nLet's book it, please.",
                            quality: "weak",
                            analytics: "Приняли низкую ставку."
                        },
                        {
                            text: "Can you at least do $1,825?\nThat would help with deadhead.",
                            quality: "normal",
                            analytics: "Последняя попытка."
                        },
                        {
                            text: "I can't do $1,800, sorry.\nThanks anyway.",
                            quality: "fail",
                            analytics: "Потеряли груз."
                        }
                    ]
                },
                {
                    brokerResponse: "Fine, $1,800.\nQuick pay or NET 30?",
                    dispatcherPrompt: "⚠️ Брокер не упомянул factoring. Что скажете?",
                    suggestions: [
                        {
                            text: "Quick pay works, 2% fee is okay.",
                            quality: "weak",
                            analytics: "ОШИБКА! Нарушили правило о factoring!"
                        },
                        {
                            text: "We work through factoring only.\nTBS Factoring.",
                            quality: "normal",
                            analytics: "Правильно, но коротко."
                        },
                        {
                            text: "We only work through factoring, company policy.\nOur factoring is TBS Factoring.\nCan you work with that?",
                            quality: "good",
                            analytics: "Детально."
                        }
                    ]
                },
                {
                    brokerResponse: "Factoring? Ugh, fine.\nSend NOA.\nShipper: Phoenix Paper Mill, dock 8, 6 AM.\nDelivery: Denver Distribution, dock 12.\nThat's it.",
                    dispatcherPrompt: "⚠️ Брокер дал минимум информации. Спросите детали или примите как есть.",
                    suggestions: [
                        {
                            text: "Okay, sending NOA now.\nThank you!",
                            quality: "weak",
                            analytics: "Не спросили важные детали."
                        },
                        {
                            text: "Sending NOA.\nShipper contact? Delivery contact?",
                            quality: "normal",
                            analytics: "Базовые вопросы."
                        },
                        {
                            text: "Sending NOA now.\nWhat's shipper contact name and phone?\nDelivery receiver contact?\nYour 24/7 number?",
                            quality: "good",
                            analytics: "Много вопросов."
                        }
                    ]
                },
                {
                    brokerResponse: "Steve 602-555-0145, Lisa 303-555-0167.\nMy cell 602-555-9999.\nText me at pickup.",
                    outcome: {
                        type: "success",
                        quality: "weak",
                        rate: "$1,800",
                        ratePerMile: "$2.20/mile",
                        relationship: "Poor - Unlikely to call again",
                        dialogueTime: "3-5 minutes",
                        questionsAsked: "1-3 questions",
                        detailLevel: "very low",
                        futureOpportunity: "one-time",
                        weeklyLoads: "0 loads",
                        feedback: "⚠️ СЛАБЫЙ УРОВЕНЬ\n\n✅ ЧТО СДЕЛАНО ПРАВИЛЬНО:\n- Получили груз (это лучше чем ничего)\n- В конце вспомнили про factoring правило\n\n❌ ЧТО СДЕЛАНО НЕПРАВИЛЬНО:\n- Потеряли $150-175 из-за отсутствия торговли\n- Звучали отчаянно и неуверенно\n- Не задали важные вопросы о cargo, detention, routing\n- Не показали профессионализм\n- Не построили отношения\n- Брокер не будет звонить снова\n\n💡 КЛЮЧЕВОЙ УРОК:\nНеуверенность и отчаяние = низкие ставки и плохая репутация. Брокеры не уважают слабых диспетчеров.\n\n🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:\nНикогда не звучите отчаянно. Даже если нужен груз, показывайте уверенность и профессионализм. Брокеры платят больше уверенным диспетчерам."
                    }
                }
            ],

            // AGGRESSIVE ПУТЬ (6-8 шагов) - слишком агрессивный, испорченные отношения
            aggressive: [
                {
                    brokerQuestion: "Yeah, available.\nMC? Location? Equipment?\nNeed to book fast, got 3 other carriers calling.",
                    dispatcherPrompt: "⚠️ Брокер торопится. Не будьте слишком агрессивны.",
                    suggestions: [
                        {
                            text: "MC 889900, but before we talk details, what's your rate?\nI don't want to waste time if rate is too low.",
                            quality: "aggressive",
                            analytics: "Слишком агрессивно с первого сообщения - требуете вместо того чтобы отвечать."
                        },
                        {
                            text: "What's the rate first?\nI need to know if it's worth my time.",
                            quality: "aggressive",
                            analytics: "Агрессивно - не ответили на вопросы брокера."
                        },
                        {
                            text: "MC 889900, driver with dry van.\nBut I need to know your rate before we continue.",
                            quality: "aggressive",
                            analytics: "Агрессивно - ставите условия."
                        }
                    ]
                },
                {
                    brokerResponse: "Excuse me? I ask the questions here.\nYou want the load or not?\nAnswer my questions first - MC, location, equipment.",
                    dispatcherPrompt: "⚠️ Брокер раздражен вашей агрессивностью. Исправьте ситуацию или потеряете груз.",
                    suggestions: [
                        {
                            text: "Look, I'm busy too.\nEither give me good rate or I'm moving on.\nI got other brokers calling.",
                            quality: "aggressive",
                            analytics: "Еще хуже! Полностью испортили отношения."
                        },
                        {
                            text: "Sorry, didn't mean to be rude.\nDriver in Albuquerque, 53ft dry van, can be there tomorrow.",
                            quality: "normal",
                            analytics: "Попытка исправить."
                        },
                        {
                            text: "My apologies. MC 889900, driver in Albuquerque NM.\n2023 Kenworth with 53ft dry van, food grade.\nCan be in Phoenix tonight, ready for 6 AM pickup.",
                            quality: "good",
                            analytics: "Хорошее восстановление."
                        }
                    ]
                },
                {
                    brokerResponse: "You know what, I don't have time for this attitude.\nI'll call someone else.\nGood luck finding a load.",
                    dispatcherPrompt: "⚠️ Брокер отказывается работать с вами из-за агрессивности. Попытайтесь спасти ситуацию.",
                    suggestions: [
                        {
                            text: "Your loss! I'm the best carrier you'll find.\nYou'll regret this!",
                            quality: "aggressive",
                            analytics: "КАТАСТРОФА! Полностью испортили репутацию и попали в blacklist."
                        },
                        {
                            text: "Wait, I'm sorry! Driver in Albuquerque, can be there tonight.\nWe're reliable, 98% on-time record.\nPlease give us a chance!",
                            quality: "normal",
                            analytics: "Попытка спасти, но уже поздно - звучите отчаянно."
                        },
                        {
                            text: "I apologize for my attitude.\nDriver in Albuquerque, 420 miles away, but leaves today at 2 PM.\nArrives Phoenix by 8 PM - 10 hours before pickup.\n98% on-time record.\nCan we discuss this professionally?",
                            quality: "good",
                            analytics: "Профессиональная попытка спасти ситуацию."
                        }
                    ]
                },
                {
                    brokerResponse: "Fine, ONE last chance.\nLoad is 40,000 lbs paper, pickup tomorrow 6 AM, delivery Denver in 2 days.\nRate is $1,800.\nYes or no, decide now.",
                    dispatcherPrompt: "⚠️ Брокер дал последний шанс. Не испортите снова агрессивностью.",
                    suggestions: [
                        {
                            text: "$1,800? That's insulting!\nI need at least $2,200 for this.\nYou're trying to lowball me!",
                            quality: "aggressive",
                            analytics: "Испортили последний шанс!"
                        },
                        {
                            text: "$1,800 is low with deadhead.\nCan you do $1,900?",
                            quality: "normal",
                            analytics: "Нормальная торговля."
                        },
                        {
                            text: "$1,800 works, let's book it.\nThank you for the opportunity.",
                            quality: "weak",
                            analytics: "Сдались."
                        }
                    ]
                },
                {
                    brokerResponse: "You know what, forget it.\nI don't need this attitude.\nI'm calling next carrier.\nDon't call me again.",
                    outcome: {
                        type: "fail",
                        quality: "aggressive",
                        rate: "$0",
                        ratePerMile: "$0/mile",
                        relationship: "Blacklisted - Will never work with you",
                        dialogueTime: "2-3 minutes",
                        questionsAsked: "0-1 questions",
                        detailLevel: "none",
                        futureOpportunity: "blacklisted",
                        weeklyLoads: "0 loads ever",
                        feedback: "❌ ПРОВАЛ - АГРЕССИВНЫЙ ПОДХОД\n\n❌ ЧТО СДЕЛАНО НЕПРАВИЛЬНО:\n- Были агрессивны с первого сообщения\n- Не уважали брокера\n- Требовали информацию вместо того чтобы отвечать на вопросы\n- Испортили отношения полностью\n- Потеряли груз\n- Попали в blacklist брокера\n\n💡 КЛЮЧЕВОЙ УРОК:\nАгрессивность и неуважение = потеря грузов и плохая репутация. Брокеры запоминают агрессивных диспетчеров и больше не звонят.\n\n🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:\nНИКОГДА не будьте агрессивны с брокерами. Даже если брокер неправ, оставайтесь профессиональны и вежливы. Репутация в индустрии - это все. Один агрессивный разговор может закрыть двери ко многим грузам.\n\n⚠️ ВАЖНО:\nБрокеры общаются между собой. Если вы попали в blacklist одного брокера за агрессивность, другие брокеры могут узнать об этом. Всегда оставайтесь профессиональны!"
                    }
                }
            ]
        }
    },

    // ============================================
    // ДИАЛОГ #1: Los Angeles CA → Chicago IL (REEFER)
    // KIRO'S EXPERIMENTAL DIALOGUE
    // Стиль: 🧪 Тестирующий брокер (меняет личность)
    // Расстояние: 2,015 миль (LONG HAUL)
    // ОСОБЕННОСТЬ: Скрытые вызовы - брокер делает ошибки, диспетчер должен их ловить
    // 8 ШАГОВ - КОМПАКТНЫЙ ЭКСПЕРТНЫЙ ДИАЛОГ
    // ============================================
    {
        id: 1,
        route: "Los Angeles CA → Chicago IL",
        distance: 2015,
        equipment: "Reefer",
        brokerStyle: "Тестирующий (меняет личность)",
        difficulty: "expert",

        initialMessage: "Good afternoon!\nThis is Marcus from Reliable Transport Group.\nI'm calling about your Los Angeles to Chicago reefer load.\nIs this still available?",

        paths: {
            master: [
                {
                    brokerQuestion: "Hey Marcus! Yeah, it's available.\nGreat timing, just posted 10 minutes ago.\nWhat's your MC and where's your driver at?",
                    dispatcherPrompt: "💎 Брокер дружелюбный. Дайте MC и точное местоположение водителя.",
                    suggestions: [
                        {
                            text: "MC 778899, we're a reefer specialist with 5 years experience.\nDriver currently empty in Bakersfield CA, about 110 miles from LA.\nCan be at pickup location within 2 hours.\n2022 Freightliner Cascadia with 2021 Thermo King reefer unit, fully serviced last week.",
                            quality: "master",
                            path: "master",
                            analytics: "Отлично! Полная информация + показали специализацию."
                        },
                        {
                            text: "MC 778899, driver in Bakersfield area with reefer trailer.\nCan pickup today or tomorrow.",
                            quality: "good",
                            path: "master",
                            analytics: "Хорошо, но мало деталей про оборудование."
                        },
                        {
                            text: "MC 778899, reefer available in California.",
                            quality: "weak",
                            path: "master",
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
    }
];
