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
    },

    // ============================================
    // ДИАЛОГ #1000: Seattle WA → Miami FL (REEFER)
    // Стиль: 🎓 Опытный но под давлением
    // Расстояние: 3,334 миль (LONG HAUL)
    // СЛОЖНАЯ СИТУАЦИЯ: Погода + Tight timeline + High-value pharma + Множественные требования
    // 10 ШАГОВ ДЛЯ МАСТЕР ПУТИ
    // ============================================
    {
        id: 1000,
        route: "Seattle WA → Miami FL",
        distance: 3334,
        equipment: "Reefer",
        brokerStyle: "Опытный но под давлением",
        difficulty: "expert",

        initialMessage: "Good morning!\nThis is Sarah from MedLogistics Express.\nI'm calling about your Seattle to Miami reefer load.\nIs this still available?",

        paths: {
            master: [
                {
                    brokerQuestion: "Morning Sarah! Yes, still available but I need to move fast.\nThis is time-sensitive pharmaceutical shipment.\nMC number and current driver location?",
                    dispatcherPrompt: "💎 Брокер торопится. Дайте полную информацию быстро и профессионально.",
                    suggestions: [
                        {
                            text: "MC 334455, pharmaceutical specialist, 8 years experience.\nTeam drivers empty in Portland OR, 175 miles from Seattle.\nBoth HAZMAT certified, TSA approved.\n2023 Volvo with 2022 Carrier reefer, real-time monitoring.",
                            quality: "master",
                            path: "master",
                            analytics: "Отлично! Показали специализацию и team drivers."
                        },
                        {
                            text: "MC 334455, reefer specialist, 5 years in business.\nTeam drivers in Portland area, 175 miles away.\nExperienced with pharma loads.\n2023 Volvo with 2022 Carrier reefer unit.",
                            quality: "good",
                            path: "master",
                            analytics: "Хорошо, но нет сертификатов."
                        },
                        {
                            text: "MC 334455, reefer team available in Oregon.\nCurrently in Portland, can be there tomorrow.\nExperienced drivers, equipment ready.\nTruck and reefer in good condition.",
                            quality: "weak",
                            path: "master",
                            analytics: "Мало информации для срочного груза."
                        }
                    ]
                },
                {
                    brokerResponse: "Perfect! Verified MC 334455 - excellent record.\nThis is 38,000 lbs pharmaceuticals, must maintain 2-8°C constant.\nPickup tomorrow 6 AM Seattle, delivery Miami in 4 days max.\nWeather alert: snow expected in Rockies next 48 hours.",
                    brokerQuestion: "Can your team handle this timeline with weather issues?",
                    dispatcherPrompt: "🚨 Tight timeline + погода! Покажите что у вас есть план.",
                    suggestions: [
                        {
                            text: "Absolutely, we can handle this.\nTeam runs 1,100+ miles/day, 3,334 in 4 days is manageable.\nWe monitor weather real-time, have chains ready.\nIf I-90 closes, reroute via I-84 through Nevada.",
                            quality: "master",
                            analytics: "Отлично! Математика + план B для погоды."
                        },
                        {
                            text: "Yes, team drivers can make it in 4 days.\nWe have winter driving experience.\nMonitor weather and adjust routes as needed.\nTemperature maintained regardless of conditions.",
                            quality: "good",
                            analytics: "Хорошо, но нет конкретного плана."
                        },
                        {
                            text: "Should be fine, we'll do our best.\nDrivers are experienced with routes.\nWe'll watch weather and drive carefully.\nTemperature will be maintained.",
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
                            text: "Carrier Lynx Fleet with real-time monitoring.\nAutomated alerts if temp goes outside 2-8°C.\nData logs every 5 minutes, web portal 24/7.\nI'll add you after booking, PDF reports every 6 hours.",
                            quality: "master",
                            analytics: "Отлично! Конкретная система + доступ."
                        },
                        {
                            text: "Digital temperature monitoring on reefer unit.\nTracks temp continuously, sends alerts if issues.\nCan send temperature logs via email.\nFull visibility throughout journey.",
                            quality: "good",
                            analytics: "Хорошо, но нет конкретной системы."
                        },
                        {
                            text: "Yes, we monitor temperature constantly.\nReefer has digital display and tracking.\nCheck temperature regularly, report issues.\nYou'll get updates during transit.",
                            quality: "weak",
                            analytics: "Расплывчато для $2.5M груза."
                        }
                    ]
                },
                {
                    brokerResponse: "Perfect! Carrier Lynx is exactly what we need.\nNow let's talk rate. This is premium load with tight timeline.\nWhat's your rate for this?",
                    dispatcherPrompt: "💎 Премиум груз + срочность. Обоснуйте высокую ставку.",
                    suggestions: [
                        {
                            text: "For 3,509 miles including deadhead: $10,500 all-in.\nThat's $2.99/mile for pharma-grade service.\nIncludes team drivers, real-time monitoring,\nguaranteed on-time delivery, $2.5M insurance.",
                            quality: "master",
                            analytics: "Отлично! Высокая ставка с обоснованием."
                        },
                        {
                            text: "$9,800 all-in, that's $2.79/mile.\nIncludes team drivers for fast delivery,\ntemperature monitoring throughout,\nfull insurance for high-value cargo.",
                            quality: "good",
                            analytics: "Хорошо, но можно лучше обосновать."
                        },
                        {
                            text: "$11,000 all-in for cross-country reefer.\nThat's what we need for team and pharma.\nIncludes monitoring and insurance.\nOur standard rate for this distance.",
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
                            text: "I understand budget, let me explain value:\nSolo takes 6-7 days, team saves 2-3 days.\nPharma monitoring prevents $2.5M claim risk.\n$9,200 doesn't cover team costs ($400/day).\nI can do $10,000 - $2.85/mile premium service.",
                            quality: "master",
                            analytics: "Отлично! Показали ценность через риски."
                        },
                        {
                            text: "$9,200 too low for team and pharma load.\nTeam costs significantly more than solo.\nNeed at least $9,800 to cover costs.\nIncludes monitoring and insurance.",
                            quality: "good",
                            analytics: "Хорошо, но без детального объяснения."
                        },
                        {
                            text: "No, can't accept $9,200 for this.\n$10,500 is my final offer.\nPremium pharma service with team.\nCan't go lower for this distance.",
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
                            text: "Here's my proposal: $9,800 with guarantee.\nOn time (4 days): $9,800 as agreed.\nLate without weather: you pay only $9,200.\nShows confidence in our team.\nPlus my personal cell for 24/7 updates.",
                            quality: "master",
                            analytics: "Гениально! Гарантия с финансовым риском."
                        },
                        {
                            text: "I guarantee 4-day delivery, $9,700 final.\nNever missed pharma deadline in 8 years.\nYou can count on us for on-time.\nWe'll update you throughout journey.",
                            quality: "good",
                            analytics: "Хорошо, но нет финансовой гарантии."
                        },
                        {
                            text: "Can't guarantee with weather, but we'll try.\n$9,800 is what I need for this.\nWe'll do best for 4-day timeline.\nWeather might cause delays though.",
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
                            text: "Excellent! Here are details:\nCargo: $250K through Northland Insurance.\nPolicy NL-334455-2026, expires Nov 2026.\nFactoring: RTS Financial, NOA ready.\nSending COI, W9, agreement in 10 minutes.",
                            quality: "master",
                            analytics: "Отлично! Все документы + проактивность."
                        },
                        {
                            text: "$250K cargo through Northland, current.\nFactoring through RTS, NOA ready.\nCan email all documents today.\nWhat's shipper contact and pickup details?",
                            quality: "good",
                            analytics: "Хорошо, базовая информация."
                        },
                        {
                            text: "Have insurance and factoring, all current.\nWill send documents later today.\nWhat's the shipper information?\nNeed pickup and delivery details.",
                            quality: "weak",
                            analytics: "Расплывчато и не срочно."
                        }
                    ]
                },
                {
                    brokerResponse: "Perfect! Send everything to sarah@medlogistics.com.\nShipper: PharmaCold Storage, 2345 Harbor Ave, Seattle WA 98101.\nContact: David Chen, 206-555-0188, dock 3.\nPickup window: 6 AM - 8 AM tomorrow, appointment required.",
                    brokerQuestion: "What time should I schedule the appointment?",
                    dispatcherPrompt: "💎 Получили shipper детали. Выберите оптимальное время и задайте вопросы.",
                    suggestions: [
                        {
                            text: "Schedule 6 AM - maximum daylight first day.\nTeam departs Portland tonight, arrives 5:45 AM.\nGate code? Loading time? Special handling?\nPre-cool to 2-8°C before arrival?\nDelivery address and receiver in Miami?",
                            quality: "master",
                            analytics: "Отлично! Стратегия + все вопросы."
                        },
                        {
                            text: "6 AM appointment works perfectly.\nHow long does loading take?\nAny special requirements or gate codes?\nWhat's delivery address and receiver?\nNeed to plan route and timeline.",
                            quality: "good",
                            analytics: "Хорошо, базовые вопросы."
                        },
                        {
                            text: "6 AM is fine, we'll be on time.\nSend delivery information and address.\nWhat's receiver contact number?\nAny other details I should know?",
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
                            text: "Absolutely! Complete protocol:\nCall Dr. Rodriguez 4hrs before: 305-555-0199\nGPS tracking + temp monitoring access today\nPhotos: seal, temp, BOL at pickup\nTemp reports every 6hrs, immediate alerts\nConfirming all: Pickup 6AM Seattle, Delivery Day 4 Miami\nRate $9,800 with guarantee",
                            quality: "master",
                            analytics: "Идеально! Полный протокол + резюме."
                        },
                        {
                            text: "Yes, call receiver 4 hours before.\nSend GPS tracking and temp monitoring.\nPhotos of seal and BOL at pickup.\nSend rate confirmation to my email.\nReady to start tomorrow morning.",
                            quality: "good",
                            analytics: "Хорошо, но не подтвердили детали."
                        },
                        {
                            text: "Sure, driver calls 4 hours before.\nWe'll send tracking and temp updates.\nSend rate confirmation and paperwork.\nReady to pickup tomorrow morning.",
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
    },

    // ============================================
    // ДИАЛОГ #12: Miami FL → Seattle WA (REEFER)
    // Стиль: 🚀 Быстрый + 💼 Деловой + 🎯 Требовательный
    // Расстояние: 3,334 миль (LONG HAUL)
    // Оборудование: Refrigerated Van (Reefer)
    // СИТУАЦИЯ: Температурно-чувствительный груз + Factoring обязателен
    // 12 ШАГОВ ДЛЯ МАСТЕР ПУТИ
    // ============================================
    {
        id: 12,
        route: "Miami FL → Seattle WA",
        distance: 3334,
        equipment: "Refrigerated Van (Reefer)",
        brokerStyle: "Быстрый + Деловой + Требовательный",
        difficulty: "hard",

        initialMessage: "Good morning!\nThis is Maria Rodriguez from Pacific Freight Solutions.\nMC 778899.\nI'm calling about your Miami to Seattle reefer load.\nIs this still available?",

        paths: {
            master: [
                // ШАГ 1
                {
                    brokerQuestion: "Yes, available.\nMC 778899 - checking now... okay, found you.\nWhere's your truck located right now?",
                    dispatcherPrompt: "💎 Брокер проверил ваш MC. Дайте точное местоположение грузовика.",
                    suggestions: [
                        {
                            text: "My truck is empty in Miami right now, just finished unloading at the port this morning at 9 AM. Driver is currently at the truck stop on NW 25th Street, about 15 minutes from downtown Miami. Ready to load today.",
                            quality: "excellent",
                            analytics: "✨ Отлично! Точное местоположение, время, готовность.",
                            path: "master"
                        },
                        {
                            text: "The truck is currently in Miami, empty since this morning. We're at a truck stop near the port area. Available to pick up today or tomorrow.",
                            quality: "good",
                            analytics: "✔️ Хорошо! Местоположение и готовность указаны.",
                            path: "master"
                        },
                        {
                            text: "Truck is in Miami now, empty. We can pick up today or tomorrow. What equipment do you need?",
                            quality: "normal",
                            analytics: "⚪ Нормально. Базовая информация, но не детально.",
                            path: "master"
                        },
                        {
                            text: "Somewhere in Miami area. I think near the port. Driver will be ready whenever you need.",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Неточное местоположение, нет деталей.",
                            path: "master"
                        },
                        {
                            text: "Why do you need to know exactly where? The truck is in Miami, that's all that matters! Just give me the pickup address!",
                            quality: "aggressive",
                            analytics: "🔴 Агрессивно. Грубый тон, отказ давать информацию.",
                            path: "master"
                        },
                        {
                            text: "Uh... I'm not sure exactly. Let me call the driver and get back to you later.",
                            quality: "fail",
                            analytics: "❌ Провал. Нет информации, непрофессионально.",
                            path: "master"
                        }
                    ]
                },
                // ШАГ 2
                {
                    brokerQuestion: "Okay. What type of reefer equipment do you have?\nI need specifics - brand, model, year.",
                    dispatcherPrompt: "💎 Брокер запрашивает детали оборудования. Будьте конкретны.",
                    suggestions: [
                        {
                            text: "It's a 2022 Freightliner Cascadia with a 53-foot Great Dane reefer trailer, Thermo King SB-400 unit. Trailer is only 2 years old, well-maintained, no issues. Last service was 3 weeks ago.",
                            quality: "excellent",
                            analytics: "✨ Отлично! Полная информация об оборудовании.",
                            path: "master"
                        },
                        {
                            text: "We have a 2021 Freightliner with 53-foot reefer trailer, Thermo King unit. Equipment is in good condition.",
                            quality: "good",
                            analytics: "✔️ Хорошо! Основная информация есть.",
                            path: "master"
                        },
                        {
                            text: "It's a 53-foot reefer trailer with Thermo King. The truck is a Freightliner.",
                            quality: "normal",
                            analytics: "⚪ Нормально. Базовая информация без деталей.",
                            path: "master"
                        },
                        {
                            text: "It's a reefer trailer, 53 feet. I don't remember the exact model of the unit.",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Нет конкретики, непрофессионально.",
                            path: "master"
                        },
                        {
                            text: "It's a reefer! What else do you need to know? It keeps things cold, that's what matters!",
                            quality: "aggressive",
                            analytics: "🔴 Агрессивно. Грубость, отказ давать детали.",
                            path: "master"
                        },
                        {
                            text: "I'm not sure about the brand. Let me check and call you back.",
                            quality: "fail",
                            analytics: "❌ Провал. Нет базовой информации о своем оборудовании.",
                            path: "master"
                        }
                    ]
                },
                // ШАГ 3
                {
                    brokerResponse: "Okay, Thermo King is good.\nWhat temperature range can you maintain?\nI need exact specs, this is a sensitive load.",
                    dispatcherPrompt: "💎 Брокер спрашивает о температурных возможностях. Дайте точные характеристики.",
                    suggestions: [
                        {
                            text: "Thermo King SB-400, temperature range -20°F to +70°F. We have current CARB compliance, last reefer inspection was 2 weeks ago, all certificates valid. Can run continuous or cycle mode, multi-temp if needed.",
                            quality: "excellent",
                            analytics: "✨ Отлично! Полные технические характеристики и сертификаты."
                        },
                        {
                            text: "It's an SB-400, temp range -20°F to +70°F. Reefer inspection is current, all paperwork in order. We can maintain any temp you need.",
                            quality: "good",
                            analytics: "✔️ Хорошо! Основные характеристики указаны."
                        },
                        {
                            text: "It's a Thermo King, can do cold temps. We have the inspection papers. What temperature do you need?",
                            quality: "normal",
                            analytics: "⚪ Нормально. Недостаточно конкретики."
                        },
                        {
                            text: "It can go pretty cold, I think down to zero or something. The unit works fine.",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Неточная информация, нет уверенности."
                        },
                        {
                            text: "Look, it's a reefer unit! It does cold! Why are you asking so many questions?",
                            quality: "aggressive",
                            analytics: "🔴 Агрессивно. Раздражение, нет профессионализма."
                        },
                        {
                            text: "I don't know the exact specs. What temp do you need? Maybe we can do it.",
                            quality: "fail",
                            analytics: "❌ Провал. Не знает характеристики своего оборудования."
                        }
                    ]
                },
                // ШАГ 4
                {
                    brokerResponse: "Okay, good. This load requires 34-38°F constant temp.\nIt's fresh produce - berries and leafy greens. Total weight 42,000 lbs.\nVery temperature-sensitive, can't have any temp spikes.",
                    brokerQuestion: "Can you maintain 34-38°F for 4 days cross-country without issues?",
                    dispatcherPrompt: "💎 Брокер описал груз и требования. Подтвердите способность выполнить.",
                    suggestions: [
                        {
                            text: "Absolutely, 34-38°F for 4 days is no problem. We'll monitor temp every 2 hours and log it. Fresh produce is our specialty - we handle berries and greens regularly. Driver has reefer training and knows how to prevent temp spikes. We'll pre-cool trailer to 36°F before loading.",
                            quality: "excellent",
                            analytics: "✨ Отлично! Уверенность + опыт + конкретный план."
                        },
                        {
                            text: "Yes, we can maintain 34-38°F for the entire trip. Driver will check temp regularly. We handle produce loads often, no issues.",
                            quality: "good",
                            analytics: "✔️ Хорошо! Подтверждение и опыт."
                        },
                        {
                            text: "Yeah, we can do that temperature. We've done reefer loads before.",
                            quality: "normal",
                            analytics: "⚪ Нормально. Базовое подтверждение."
                        },
                        {
                            text: "I think we can do it. The driver will try to keep it cold. Should be okay.",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Нет уверенности, нет плана."
                        },
                        {
                            text: "Of course we can! What kind of question is that? We're professionals!",
                            quality: "aggressive",
                            analytics: "🔴 Агрессивно. Защитная реакция вместо деталей."
                        },
                        {
                            text: "Hmm, 4 days is a long time. I'm not sure if the unit can hold temp that long.",
                            quality: "fail",
                            analytics: "❌ Провал. Сомнения в своем оборудовании."
                        }
                    ]
                },
                // ШАГ 5
                {
                    brokerResponse: "Alright. Pickup is tomorrow 8 AM at Fresh Foods Inc in Miami.\nDelivery must be Thursday morning 6-10 AM in Seattle.\nThat's 4 days transit time.",
                    brokerQuestion: "Can you commit to that schedule? No excuses if you're late.",
                    dispatcherPrompt: "💎 Брокер дал жесткий дедлайн. Подтвердите или обсудите реалистичность.",
                    suggestions: [
                        {
                            text: "Yes, we can absolutely commit to that schedule. Tomorrow 8 AM pickup, Thursday 6-10 AM delivery in Seattle. 4 days transit is realistic for 3,334 miles - that's about 830 miles per day with proper rest breaks. Driver will run team-style hours if needed. We'll send you location updates every 12 hours during transit.",
                            quality: "excellent",
                            analytics: "✨ Отлично! Подтверждение + математика + план коммуникации."
                        },
                        {
                            text: "Yes, we can make that schedule work. Tomorrow 8 AM pickup, Thursday morning delivery. We'll keep you updated during the trip.",
                            quality: "good",
                            analytics: "✔️ Хорошо! Четкое подтверждение."
                        },
                        {
                            text: "Yeah, we can do it. Tomorrow 8 AM, Thursday delivery.",
                            quality: "normal",
                            analytics: "⚪ Нормально. Краткое подтверждение."
                        },
                        {
                            text: "We'll try our best. Traffic can be unpredictable, but we should make it.",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Нет твердого commitment, отговорки."
                        },
                        {
                            text: "Don't threaten me with 'no excuses'! Things happen on the road!",
                            quality: "aggressive",
                            analytics: "🔴 Агрессивно. Конфликт вместо профессионализма."
                        },
                        {
                            text: "4 days seems tight. Can we have 5 days just in case?",
                            quality: "fail",
                            analytics: "❌ Провал. Не может выполнить требования."
                        }
                    ]
                },
                // ШАГ 6
                {
                    brokerResponse: "Okay. For this load, I'm at $7,200 all-in.\nThat's $2.16 per mile for 3,334 miles.",
                    brokerQuestion: "Interested? I have other carriers calling.",
                    dispatcherPrompt: "💎 Брокер предложил ставку. Оцените и ответьте профессионально.",
                    suggestions: [
                        {
                            text: "Thank you for the offer. $7,200 all-in works for us. That's fair for this lane and the tight delivery window. Let's book it. Do you have detention pay if there are delays at shipper or receiver?",
                            quality: "excellent",
                            analytics: "✨ Отлично! Принятие + переход к следующим деталям."
                        },
                        {
                            text: "$7,200 works for us. Let's confirm it. What about detention and layover pay?",
                            quality: "good",
                            analytics: "✔️ Хорошо! Принятие и важный вопрос."
                        },
                        {
                            text: "$7,200 is okay. Do you pay detention?",
                            quality: "normal",
                            analytics: "⚪ Нормально. Краткое принятие."
                        },
                        {
                            text: "Hmm, $7,200... I was hoping for more. Can you do $7,500?",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Торг без обоснования."
                        },
                        {
                            text: "$7,200? That's way too low! I need at least $8,000 or I'm not interested!",
                            quality: "aggressive",
                            analytics: "🔴 Агрессивно. Грубый отказ, нереалистичные требования."
                        },
                        {
                            text: "Let me think about it and call you back. I need to check with my boss.",
                            quality: "fail",
                            analytics: "❌ Провал. Нерешительность, потеря груза."
                        }
                    ]
                },
                // ШАГ 7
                {
                    brokerResponse: "Smart question. Yes, detention is $50/hour after 2 hours free time at both ends.\nLayover is $200/day if needed.",
                    brokerQuestion: "Sound good?",
                    dispatcherPrompt: "💎 Брокер дал условия detention/layover. Подтвердите или уточните.",
                    suggestions: [
                        {
                            text: "Perfect! $50/hour detention after 2 hours free time, $200/day layover. That's standard and fair. We'll track all times carefully with timestamps. Now, how do you handle payment? Do you work with factoring companies?",
                            quality: "excellent",
                            analytics: "✨ Отлично! Подтверждение + переход к payment."
                        },
                        {
                            text: "Okay, detention and layover terms are good. What about payment? We use factoring.",
                            quality: "good",
                            analytics: "✔️ Хорошо! Подтверждение и важный вопрос."
                        },
                        {
                            text: "That's fine. How do we get paid?",
                            quality: "normal",
                            analytics: "⚪ Нормально. Краткое подтверждение."
                        },
                        {
                            text: "Only $50/hour? Other brokers pay $75. Can you match that?",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Ненужный торг по стандартным условиям."
                        },
                        {
                            text: "2 hours free time? That's ridiculous! Should be 1 hour max!",
                            quality: "aggressive",
                            analytics: "🔴 Агрессивно. Конфликт по стандартным условиям."
                        },
                        {
                            text: "What's detention? I don't understand these terms.",
                            quality: "fail",
                            analytics: "❌ Провал. Не знает базовые термины индустрии."
                        }
                    ]
                },
                // ШАГ 8
                {
                    brokerResponse: "Yes, we work with all major factoring companies.",
                    brokerQuestion: "Who do you use?",
                    dispatcherPrompt: "💎 Брокер работает с factoring. Назовите свою компанию.",
                    suggestions: [
                        {
                            text: "We work with RTS Financial for factoring. Can you send the rate confirmation to factoring@rtsfin.com? They'll handle all the paperwork and payment. Do you work with RTS? They usually pay brokers in 24 hours, so you'll get your money fast too.",
                            quality: "excellent",
                            analytics: "✨ Отлично! Полная информация + выгода для брокера."
                        },
                        {
                            text: "We use Triumph Business Capital. Can you send the rate con to their email? Do you work with Triumph?",
                            quality: "good",
                            analytics: "✔️ Хорошо! Четкая информация."
                        },
                        {
                            text: "We have factoring with OTR Solutions. Should I give you their contact info?",
                            quality: "normal",
                            analytics: "⚪ Нормально. Базовая информация."
                        },
                        {
                            text: "I think it's RTS or maybe Triumph. Let me check and get back to you.",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Не знает свою factoring компанию."
                        },
                        {
                            text: "Why do you care who we use? Just send us the rate con!",
                            quality: "aggressive",
                            analytics: "🔴 Агрессивно. Грубость, не понимает процесс."
                        },
                        {
                            text: "We don't use factoring. Can you pay us directly?",
                            quality: "fail",
                            analytics: "❌ Провал. Нереалистичное требование."
                        }
                    ]
                },
                // ШАГ 9
                {
                    brokerResponse: "Okay, good. I'll send rate con to your factoring company and copy you.",
                    brokerQuestion: "Now, shipper details:\nFresh Foods Inc, 1234 NW 25th Ave, Miami FL 33142.\nContact: John Martinez 305-555-0100.\nPickup window 8 AM - 10 AM tomorrow.\nAny questions about pickup?",
                    dispatcherPrompt: "💎 Брокер дал shipper детали. Задайте важные вопросы о pickup.",
                    suggestions: [
                        {
                            text: "Got it! Fresh Foods Inc, 1234 NW 25th Ave, John Martinez 305-555-0100, 8-10 AM window. Quick questions: is cargo palletized? How many pallets? Do they provide load locks and straps? Any special handling instructions for berries? Should driver call John tonight to confirm arrival time?",
                            quality: "excellent",
                            analytics: "✨ Отлично! Подтверждение + критические вопросы."
                        },
                        {
                            text: "Understood. John Martinez 305-555-0100, 8-10 AM window. How is cargo packaged? Any special handling?",
                            quality: "good",
                            analytics: "✔️ Хорошо! Базовые важные вопросы."
                        },
                        {
                            text: "Got it, 8 AM at Fresh Foods. What's the delivery address?",
                            quality: "normal",
                            analytics: "⚪ Нормально. Упущены важные детали."
                        },
                        {
                            text: "Okay, 1234 NW 25th Ave. Is that near the highway?",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Неважный вопрос, упущены критические детали."
                        },
                        {
                            text: "That's a lot of information! Can you just email it all to me?",
                            quality: "aggressive",
                            analytics: "🔴 Агрессивно. Отказ записывать информацию."
                        },
                        {
                            text: "Wait, can you repeat all that? I didn't write it down.",
                            quality: "fail",
                            analytics: "❌ Провал. Не записывал важную информацию."
                        }
                    ]
                },
                // ШАГ 10
                {
                    brokerResponse: "Okay. Yes, cargo is palletized - 18 pallets total.\nShipper provides load locks, but bring extra straps just in case.\nBerries are in refrigerated boxes, handle gently - no stacking over 6 high.\nYes, have driver call John tonight between 6-8 PM to confirm.",
                    brokerQuestion: "Got all that?",
                    dispatcherPrompt: "💎 Брокер дал детали cargo. Подтвердите понимание.",
                    suggestions: [
                        {
                            text: "Perfect! 18 pallets, load locks provided, extra straps on hand. Berries in refrigerated boxes, max 6 high stacking, gentle handling. Driver will call John tonight 6-8 PM to confirm 8 AM arrival. I'll note all this in our dispatch system. What's the delivery address and receiver contact in Seattle?",
                            quality: "excellent",
                            analytics: "✨ Отлично! Повторение + подтверждение + следующий вопрос."
                        },
                        {
                            text: "Got it! 18 pallets, load locks provided, max 6 high, driver calls tonight. What's delivery info?",
                            quality: "good",
                            analytics: "✔️ Хорошо! Краткое подтверждение."
                        },
                        {
                            text: "Understood. 18 pallets, gentle handling. Delivery address?",
                            quality: "normal",
                            analytics: "⚪ Нормально. Базовое подтверждение."
                        },
                        {
                            text: "Okay, 18 pallets. I think I got it. What's next?",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Неуверенность, упущены детали."
                        },
                        {
                            text: "6 high? That's too restrictive! We stack however we want!",
                            quality: "aggressive",
                            analytics: "🔴 Агрессивно. Отказ следовать инструкциям."
                        },
                        {
                            text: "Wait, how many pallets? Can you repeat everything?",
                            quality: "fail",
                            analytics: "❌ Провал. Не слушал, не записывал."
                        }
                    ]
                },
                // ШАГ 11
                {
                    brokerResponse: "Alright. Delivery: Seattle Fresh Market, 456 Pike Street, Seattle WA 98101.\nContact: Sarah Chen 206-555-0200.\nDelivery window Thursday 6 AM - 10 AM.\nUnloading takes about 90 minutes.\nCall Sarah Wednesday evening to confirm ETA.",
                    brokerQuestion: "Any questions about delivery?",
                    dispatcherPrompt: "💎 Брокер дал consignee детали. Задайте финальные вопросы.",
                    suggestions: [
                        {
                            text: "Perfect! Seattle Fresh Market, 456 Pike St, Sarah Chen 206-555-0200, Thursday 6-10 AM, 90 min unload. Driver calls Sarah Wednesday evening. Quick questions: any dock appointment needed? Parking restrictions in Seattle? Any special unloading requirements? Should driver bring pallet jack or they have equipment?",
                            quality: "excellent",
                            analytics: "✨ Отлично! Подтверждение + проактивные вопросы."
                        },
                        {
                            text: "Got it! Sarah Chen 206-555-0200, Thursday 6-10 AM. Do we need dock appointment? Any parking restrictions?",
                            quality: "good",
                            analytics: "✔️ Хорошо! Важные вопросы."
                        },
                        {
                            text: "Understood. Thursday 6-10 AM in Seattle. Anything else?",
                            quality: "normal",
                            analytics: "⚪ Нормально. Базовое подтверждение."
                        },
                        {
                            text: "Okay, Seattle. 456 Pike Street. Got it.",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Упущены важные детали."
                        },
                        {
                            text: "90 minutes unload? That's too long! We can't wait that long!",
                            quality: "aggressive",
                            analytics: "🔴 Агрессивно. Конфликт по стандартным условиям."
                        },
                        {
                            text: "Can you text me all this info? I can't write that fast.",
                            quality: "fail",
                            analytics: "❌ Провал. Непрофессионально, не готов."
                        }
                    ]
                },
                // ШАГ 12
                {
                    brokerResponse: "No dock appointment needed, first come first served.\nParking is tight in Pike Place area - arrive early to find spot.\nThey have pallet jacks and forklifts, driver just needs to supervise unloading.\nMake sure temp is still 34-38°F when they open doors.",
                    brokerQuestion: "We're all set then?\nI'll send rate con to your factoring company in 5 minutes.\nYou'll get copy too.\nConfirmed?",
                    dispatcherPrompt: "💎 Финальное подтверждение. Резюмируйте все детали.",
                    suggestions: [
                        {
                            text: "Perfect! Everything is clear. Let me confirm the complete booking:\n• Pickup: Tomorrow 8 AM, Fresh Foods Inc Miami, John 305-555-0100\n• Delivery: Thursday 6-10 AM, Seattle Fresh Market, Sarah 206-555-0200\n• Rate: $7,200 all-in, detention $50/hr after 2hrs, layover $200/day\n• Temp: 34-38°F constant, 18 pallets, max 6 high\n• Payment: RTS Factoring factoring@rtsfin.com\n• Driver: Will call John tonight 6-8 PM, Sarah Wednesday evening\nWe're 100% confirmed! Thank you for the business. You'll have NOA in your email in 2 minutes.",
                            quality: "excellent",
                            analytics: "✨ Отлично! Полное резюме всех деталей. МАСТЕР УРОВЕНЬ!"
                        },
                        {
                            text: "Yes, confirmed! Tomorrow 8 AM pickup Miami, Thursday 6-10 AM delivery Seattle. $7,200 all-in, 34-38°F temp. RTS Factoring. Driver will call both contacts. Sending NOA now. Thank you!",
                            quality: "good",
                            analytics: "✔️ Хорошо! Краткое резюме ключевых пунктов."
                        },
                        {
                            text: "Yes, we're confirmed. Tomorrow pickup, Thursday delivery. $7,200. Thanks!",
                            quality: "normal",
                            analytics: "⚪ Нормально. Минимальное подтверждение."
                        },
                        {
                            text: "Yeah, I think we're good. Send the rate con.",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Нет резюме, неуверенность."
                        },
                        {
                            text: "Just send the paperwork already! I have other calls to make!",
                            quality: "aggressive",
                            analytics: "🔴 Агрессивно. Грубость в конце диалога."
                        },
                        {
                            text: "Wait, can you go over everything one more time? I'm confused.",
                            quality: "fail",
                            analytics: "❌ Провал. Не следил за диалогом."
                        }
                    ]
                },
                {
                    brokerResponse: "Maria, you are EXCELLENT! This is exactly how professional dispatchers should work.\nSending rate con and BOL to RTS and your email right now.\nI'm adding you to our preferred reefer carrier list.\nWe have 3-4 produce loads per week on various lanes.\nYou just earned yourself regular business!",
                    outcome: {
                        type: "success",
                        quality: "master",
                        rate: "$7,200",
                        ratePerMile: "$2.16/mile",
                        relationship: "Preferred Reefer Carrier - Regular Business",
                        dialogueTime: "8-10 minutes",
                        questionsAsked: "12+ questions",
                        detailLevel: "exceptional",
                        futureOpportunity: "3-4 produce loads per week",
                        weeklyLoads: "3-4 reefer loads/week",
                        feedback: "🏆 МАСТЕР - ПРОФЕССИОНАЛЬНЫЙ ДИАЛОГ!\n\n✅ ЧТО СДЕЛАНО ПРАВИЛЬНО:\n- Дали точное местоположение с деталями (порт, время, truck stop)\n- Назвали конкретное оборудование (Thermo King SB-400, Great Dane)\n- Показали опыт с produce loads (berries, greens)\n- Подтвердили реалистичный timeline с математикой (830 миль/день)\n- Приняли справедливую ставку без торга\n- Работали через factoring (RTS Financial)\n- Задали ВСЕ критические вопросы (pallets, stacking, contacts)\n- Дали полное резюме в конце\n- Показали исключительный профессионализм\n\n💡 КЛЮЧЕВОЙ УРОК:\nReefer loads требуют ДЕТАЛЬНОГО внимания к температуре и cargo handling.\nПравильные вопросы о stacking, packaging, и temp monitoring показывают опыт.\n\n🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:\nProduce loads (berries, greens, vegetables) требуют:\n- Temperature 34-38°F constant\n- Gentle handling (no rough loading)\n- Pre-cooling trailer before loading\n- Temp monitoring every 2 hours\n- Quick transit (produce spoils fast)\n- Clean, food-grade trailers\n\nЭти грузы платят $2.00-$2.50/mile и дают регулярный бизнес (3-4 loads/week)!"
                    }
                }
            ]
        }
    }
];
