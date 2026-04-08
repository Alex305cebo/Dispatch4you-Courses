// ============================================
// ДИАЛОГ #3: Phoenix AZ → Denver CO (DRY VAN)
// Стиль: 🏃 Торопливый + ⏰ Занятой брокер
// Расстояние: 820 миль (MEDIUM HAUL)
// ПРОБЛЕМНАЯ СИТУАЦИЯ: Водитель далеко + Брокер отказывается от Factoring
// 18+ ШАГОВ ДЛЯ МАСТЕР ПУТИ
// ============================================
{
    id: 3,
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
                brokerResponse: "Okay, you got my attention with the on-time record and deadhead absorption.\nVerified MC 889900 - 98% safety score, good.\nLoad is 40,000 lbs paper products, 18 pallets, food grade trailer required.\nPickup tomorrow 6 AM Phoenix Paper Mill, delivery Denver in 2 days.\nRate is $1,800 all-in, that's $2.20/mile.\nYes or no? Got other calls waiting.",
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
                brokerResponse: "Look, I get the deadhead math, but that's your problem, not mine.\nPosted rate is $1,800, market rate for this lane is $2.15-$2.25/mile.\nI can go to $1,900, that's $2.32/mile - fair for the lane.\nTake it or I'm calling next carrier, decide now.",
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
                brokerResponse: "Fine, $1,975, but only because of your on-time record.\nFactoring or quick pay? I can do quick pay 2% fee, money in 2 days.\nOr standard NET 30 days. Choose fast.",
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
                brokerResponse: "Factoring? Ugh, I hate dealing with factoring companies.\nThey take forever to process, always asking for extra documents.\nCan't you just take quick pay this one time? 2% is nothing.",
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
                brokerResponse: "Alright, fine! I'll work with TBS Factoring this time.\nBut if they give me any problems, I'm not using you again.\nSend NOA now, I need it in 2 minutes like you said.\nWhat's shipper info so I can send rate con?",
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
                brokerResponse: "Phoenix Paper Mill, 3456 Industrial Way, Phoenix AZ 85001.\nContact Steve, 602-555-0145, dock 8.\nPickup window 6 AM - 8 AM, loading takes 2 hours.\nNo gate code, just check in at office.\nAny other questions? Need to move fast.",
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
                brokerResponse: "Palletized, 18 pallets, they provide 6 load locks.\nPaper is heavy, secure it well, no special handling.\nDelivery: Denver Distribution Center, 5678 Warehouse Road, Denver CO 80201.\nReceiver Lisa, 303-555-0167, dock 12.\nDelivery in 2 days, call 4 hours ahead for appointment.\nAnything else?",
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
                brokerResponse: "Detention $75/hour after 2 hours free time.\nMy cell 602-555-9999, text only, don't call unless emergency.\nNo routing restrictions, I-17 to I-40 to I-25 is fastest.\nWe done? I got 5 other loads to book.",
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
                    feedback: `🏆 МАСТЕР УРОВЕНЬ!

✅ ЧТО СДЕЛАНО ПРАВИЛЬНО:
- Решили проблему с deadhead (420 миль) - объяснили план прибытия вечером
- Предложили абсорбировать $100 deadhead cost - показали гибкость
- Быстро обосновали ставку через математику deadhead - получили $175 больше posted rate
- СТОЯЛИ НА СВОЕМ с factoring - не нарушили правило компании несмотря на давление
- Объяснили преимущества TBS Factoring - убедили брокера работать с factoring
- Работали в темпе брокера - быстрые ответы, критические вопросы только
- Заверили брокера что TBS не создаст проблем - построили доверие
- Показали интерес к будущим грузам - открыли дверь для 2-3 weekly loads

⚠️ ЧТО МОЖНО УЛУЧШИТЬ:
- Можно было спросить про lumper fee
- Можно было уточнить про weight distribution для тяжелой бумаги

💡 КЛЮЧЕВОЙ УРОК:
Даже с проблемами (deadhead, factoring resistance) можно получить груз через быстрое решение проблем и твердость в правилах компании

🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:
Когда водитель далеко - объясните план прибытия и предложите компромисс на deadhead. Когда брокер отказывается от factoring - будьте вежливы но тверды, объясните преимущества. Работайте в темпе брокера - торопливые брокеры ценят скорость и четкость.`
                }
            }
        ]
    }
}
