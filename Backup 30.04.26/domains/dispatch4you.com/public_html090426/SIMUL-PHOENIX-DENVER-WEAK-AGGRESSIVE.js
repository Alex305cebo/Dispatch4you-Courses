// ============================================
// ДОПОЛНИТЕЛЬНЫЕ ПУТИ: WEAK и AGGRESSIVE
// Phoenix AZ → Denver CO
// ============================================

// WEAK ПУТЬ (8-10 шагов) - неуверенный подход, низкая ставка
weak: [
    {
        brokerQuestion: "Yeah, available.\nMC? Location? Equipment?\nNeed to book fast, got 3 other carriers calling.",
        dispatcherPrompt: "⚠️ Брокер торопится. Дайте минимальную информацию.",
        suggestions: [
            {
                text: "MC 889900, dry van available, can pickup tomorrow.",
                quality: "weak",
                analytics: "Слишком мало информации."
            },
            {
                text: "MC 889900, driver in Albuquerque with dry van.\nCan be there tomorrow morning.",
                quality: "normal",
                analytics: "Чуть лучше."
            },
            {
                text: "MC 889900, driver in Albuquerque NM, 420 miles away.\nEmpty by 2 PM today, can deadhead overnight.\n2023 Kenworth with 53ft dry van.",
                quality: "good",
                analytics: "Слишком детально для weak."
            }
        ]
    },
    {
        brokerResponse: "Albuquerque? That's 420 miles away!\nI need someone closer.\nWhy should I wait for you?",
        dispatcherPrompt: "⚠️ Брокер не уверен. Вы не убедили его.",
        suggestions: [
            {
                text: "We can make it, please give us a chance.\nWe really need this load.",
                quality: "weak",
                analytics: "Звучите отчаянно."
            },
            {
                text: "Driver can be there tonight, no problem.\nWe're reliable carrier.",
                quality: "normal",
                analytics: "Лучше."
            },
            {
                text: "Driver leaves today at 2 PM, arrives by 8 PM.\n10 hours before pickup, plenty of time.\n98% on-time record.",
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
                    analytics: "Слишком агрессивно с первого сообщения."
                },
                {
                    text: "MC 889900, driver in Albuquerque with 53ft dry van.\nCan be in Phoenix tomorrow morning.",
                    quality: "normal",
                    analytics: "Нормально."
                },
                {
                    text: "MC 889900, driver currently in Albuquerque NM.\nEmpty by 2 PM today, 420 miles from Phoenix.\n2023 Kenworth with 53ft dry van, ready to go.",
                    quality: "good",
                    analytics: "Профессионально."
                }
            ]
        },
        {
            brokerResponse: "Excuse me? I ask the questions here.\nYou want the load or not?\nTell me about your equipment first.",
            dispatcherPrompt: "⚠️ Брокер раздражен вашей агрессивностью. Исправьте ситуацию.",
            suggestions: [
                {
                    text: "Look, I'm busy too.\nEither give me good rate or I'm moving on.\nI got other brokers calling.",
                    quality: "aggressive",
                    analytics: "Еще хуже! Испортили отношения."
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
            brokerResponse: "Albuquerque? That's 420 miles away!\nYou know what, I don't have time for this.\nI'll call someone closer.\nGood luck.",
            dispatcherPrompt: "⚠️ Брокер отказывается работать с вами. Попытайтесь спасти ситуацию.",
            suggestions: [
                {
                    text: "Your loss! I'm the best carrier you'll find.\nYou'll regret this!",
                    quality: "aggressive",
                    analytics: "КАТАСТРОФА! Полностью испортили репутацию."
                },
                {
                    text: "Wait, please! Driver can be there tonight.\nWe're reliable, 98% on-time record.\nGive us a chance!",
                    quality: "normal",
                    analytics: "Попытка спасти, но звучите отчаянно."
                },
                {
                    text: "I understand your concern about distance.\nBut driver leaves today at 2 PM, arrives Phoenix by 8 PM.\n10 hours before pickup - plenty of time.\n98% on-time record, never missed a pickup.\nCan we discuss rate?",
                    quality: "good",
                    analytics: "Профессиональная попытка спасти."
                }
            ]
        },
        {
            brokerResponse: "Fine, I'll give you one chance.\nLoad is 40,000 lbs paper, pickup tomorrow 6 AM, delivery Denver in 2 days.\nRate is $1,800.\nYes or no, decide now.",
            dispatcherPrompt: "⚠️ Брокер дал последний шанс. Не испортите снова.",
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
