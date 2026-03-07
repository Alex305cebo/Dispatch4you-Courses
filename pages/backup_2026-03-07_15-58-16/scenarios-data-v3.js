// СИМУЛЬ - База диалогов для обучения диспетчеров
// Версия: 7.0 FINAL
// Дата: 2026-03-05
// ПРАВИЛО: 6 вариантов качества в каждом шаге!

console.log('🔵 Loading scenarios-data-v3.js...');

// Диалог #1: Dallas TX → Atlanta GA (Dry Van)
const scenario1 = {
    id: 1,
    route: "Dallas TX → Atlanta GA",
    distance: 780,
    equipment: "Dry Van (53ft)",
    brokerStyle: "Профессиональный",
    difficulty: "medium",

    initialMessage: "Good afternoon!\nThis is Tom Wilson from Reliable Carriers.\nMC 667788.\nI'm calling about your Dallas to Atlanta dry van load.\nIs this load still available?",

    paths: {
        master: [
            {
                brokerQuestion: "Good afternoon Tom!\nThis is Sarah from National Freight, MC 334455.\nYes, load is available.\nMC 667788 verified, good safety rating.\nWhere is your truck right now?",
                dispatcherPrompt: "💎 Брокер проверил MC. Дайте местоположение.",
                suggestions: [
                    {
                        text: "Perfect! My truck is in Dallas right now, just finished delivery at the warehouse district this morning around 9 AM. Driver is at the Pilot truck stop on I-35, exit 428. Empty and ready to load today or tomorrow. What are the load details?",
                        quality: "excellent",
                        analytics: "✨ Отлично! Точное местоположение, время, готовность.",
                        path: "master"
                    },
                    {
                        text: "Truck is in Dallas, empty since this morning. At a truck stop near I-35. Available to pick up today or tomorrow. What's the schedule?",
                        quality: "good",
                        analytics: "✔️ Хорошо! Местоположение и готовность.",
                        path: "master"
                    },
                    {
                        text: "Truck is in Dallas now, empty. We can pick up anytime.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовая информация.",
                        path: "master"
                    },
                    {
                        text: "Somewhere in Dallas area. Driver will be ready when you need him.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неточное местоположение.",
                        path: "master"
                    },
                    {
                        text: "Why do you need exact location? Just give me the pickup address!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Грубый тон.",
                        path: "master"
                    },
                    {
                        text: "Uh... let me call the driver and find out. Can I call you back?",
                        quality: "fail",
                        analytics: "❌ Провал. Не знает местоположение своего грузовика.",
                        path: "master"
                    }
                ]
            },
            // ШАГ 2: Детали оборудования
            {
                brokerQuestion: "Good, Dallas location works.\nWhat equipment do you have?\nI need trailer type, year, and condition.",
                dispatcherPrompt: "💎 Брокер спрашивает об оборудовании. Будьте конкретны.",
                suggestions: [
                    {
                        text: "It's a 2021 Freightliner Cascadia with 53-foot Great Dane dry van, swing doors, air ride suspension, logistics tracking. Trailer is 3 years old, well-maintained, clean interior. Last DOT inspection passed 2 weeks ago. Ready for any freight.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Полная информация об оборудовании.",
                        path: "master"
                    },
                    {
                        text: "2021 Freightliner with 53-foot dry van, swing doors, air ride. Equipment is in good condition, clean and ready.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Основная информация есть.",
                        path: "master"
                    },
                    {
                        text: "53-foot dry van with swing doors. Freightliner truck.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовая информация.",
                        path: "master"
                    },
                    {
                        text: "Dry van, 53 feet. I don't remember the exact year.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Нет конкретики.",
                        path: "master"
                    },
                    {
                        text: "It's a dry van! What else matters? It hauls freight!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Грубость.",
                        path: "master"
                    },
                    {
                        text: "Not sure about the brand. Let me check and call back.",
                        quality: "fail",
                        analytics: "❌ Провал. Не знает свое оборудование.",
                        path: "master"
                    }
                ]
            },
            // ШАГ 3: Детали груза и расписание
            {
                brokerQuestion: "Perfect equipment.\nLoad details: 38,000 lbs general freight, 16 pallets.\nPickup tomorrow 8 AM at Dallas Distribution Center.\nDelivery Thursday by 5 PM at Atlanta Warehouse.\nThat's 2 days for 780 miles.\nCan you make this schedule?",
                dispatcherPrompt: "💎 Брокер дал детали груза и дедлайн. Подтвердите способность.",
                suggestions: [
                    {
                        text: "Absolutely! 38,000 lbs, 16 pallets, tomorrow 8 AM Dallas pickup, Thursday 5 PM Atlanta delivery. 2 days for 780 miles - that's 390 miles per day, very comfortable. We handle general freight regularly. Driver will maintain steady pace with regular updates. This schedule works perfectly for us.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Подтверждение + математика + уверенность.",
                        path: "master"
                    },
                    {
                        text: "Yes, we can make that schedule. Tomorrow 8 AM pickup, Thursday 5 PM delivery. 780 miles in 2 days is no problem.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Четкое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "Yes, we can do it. Tomorrow pickup, Thursday delivery.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "We'll try our best. Traffic can be unpredictable though.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Нет уверенности.",
                        path: "master"
                    },
                    {
                        text: "2 days? That's tight! What if there's weather or traffic?",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Негатив вместо решения.",
                        path: "master"
                    },
                    {
                        text: "Can we have 3 days instead? 2 days seems really tight.",
                        quality: "fail",
                        analytics: "❌ Провал. Не может выполнить требования.",
                        path: "master"
                    }
                ]
            },
            // ШАГ 4: Обсуждение ставки
            {
                brokerQuestion: "Good. For this load, I'm offering $1,750 all-in.\nThat's $2.24 per mile for 780 miles.\nInterested?",
                dispatcherPrompt: "💎 Брокер предложил ставку. Оцените и ответьте.",
                suggestions: [
                    {
                        text: "Thank you for the offer. $1,750 all-in at $2.24/mile works for us. That's fair for this lane and the 2-day delivery window. Let's book it. Do you have detention pay if there are delays at shipper or receiver?",
                        quality: "excellent",
                        analytics: "✨ Отлично! Принятие + переход к деталям.",
                        path: "master"
                    },
                    {
                        text: "$1,750 works for us. What about detention and layover pay?",
                        quality: "good",
                        analytics: "✔️ Хорошо! Принятие и важный вопрос.",
                        path: "master"
                    },
                    {
                        text: "$1,750 is okay. Do you pay detention?",
                        quality: "normal",
                        analytics: "⚪ Нормально. Краткое принятие.",
                        path: "master"
                    },
                    {
                        text: "Hmm, $1,750... I was hoping for $1,900. Can you go higher?",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Торг без обоснования.",
                        path: "master"
                    },
                    {
                        text: "$1,750? That's way too low! I need at least $2,000!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Грубый отказ.",
                        path: "master"
                    },
                    {
                        text: "Let me think and call you back. Need to check with my boss.",
                        quality: "fail",
                        analytics: "❌ Провал. Нерешительность, потеря груза.",
                        path: "master"
                    }
                ]
            },
            // ШАГ 5: Detention и Layover
            {
                brokerQuestion: "Yes, detention is $75/hour after 2 hours free time.\nLayover is $250/day if needed.\nSound good?",
                dispatcherPrompt: "💎 Брокер дал условия detention/layover. Подтвердите.",
                suggestions: [
                    {
                        text: "Perfect! $75/hour detention after 2 hours, $250/day layover - that's fair. We'll track all times with timestamps. Now, how do you handle payment? We use factoring - do you work with factoring companies?",
                        quality: "excellent",
                        analytics: "✨ Отлично! Подтверждение + переход к payment.",
                        path: "master"
                    },
                    {
                        text: "Yes, those terms are good. What about payment? We use factoring.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Подтверждение и вопрос.",
                        path: "master"
                    },
                    {
                        text: "Okay, detention terms accepted. How do we get paid?",
                        quality: "normal",
                        analytics: "⚪ Нормально. Краткое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "Only $75/hour? Other brokers pay $100. Can you match?",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Ненужный торг.",
                        path: "master"
                    },
                    {
                        text: "2 hours free time? That's ridiculous! Should be 1 hour!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Конфликт.",
                        path: "master"
                    },
                    {
                        text: "What's detention? I don't understand that term.",
                        quality: "fail",
                        analytics: "❌ Провал. Не знает базовые термины.",
                        path: "master"
                    }
                ]
            },
            // ШАГ 6: Factoring
            {
                brokerQuestion: "Yes, we work with all major factoring companies.\nWhich one do you use?",
                dispatcherPrompt: "💎 Брокер работает с factoring. Назовите компанию.",
                suggestions: [
                    {
                        text: "We use RTS Financial. Please send rate confirmation to factoring@rtsfin.com with our MC 667788. They process within 24 hours. Do you need our W9 and insurance certificate now?",
                        quality: "excellent",
                        analytics: "✨ Отлично! Полная информация + проактивность.",
                        path: "master"
                    },
                    {
                        text: "We work with Triumph Business Capital. Can you send rate con to their email? Do you need insurance certificate?",
                        quality: "good",
                        analytics: "✔️ Хорошо! Четкая информация.",
                        path: "master"
                    },
                    {
                        text: "We use OTR Solutions. Should I give you their contact?",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовая информация.",
                        path: "master"
                    },
                    {
                        text: "I think it's RTS or Triumph. Let me check and get back.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Не знает свою компанию.",
                        path: "master"
                    },
                    {
                        text: "Why do you care? Just send us the paperwork!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Грубость.",
                        path: "master"
                    },
                    {
                        text: "We don't use factoring. Can you pay us directly?",
                        quality: "fail",
                        analytics: "❌ Провал. Нереалистичное требование.",
                        path: "master"
                    }
                ]
            },
            // ШАГ 7: Shipper детали
            {
                brokerQuestion: "Perfect! I'll send rate con to RTS.\nShipper details:\nDallas Distribution Center\n5500 Industrial Blvd, Dallas TX 75247\nContact: Mike Johnson 214-555-0100\nPickup tomorrow 8 AM - 10 AM\nAny questions about pickup?",
                dispatcherPrompt: "💎 Брокер дал shipper детали. Задайте вопросы.",
                suggestions: [
                    {
                        text: "Got it! Dallas Distribution, 5500 Industrial Blvd, Mike Johnson 214-555-0100, 8-10 AM window. Questions: How long does loading take? Do they provide load locks? Any special handling? Should driver call Mike tonight to confirm?",
                        quality: "excellent",
                        analytics: "✨ Отлично! Подтверждение + критические вопросы.",
                        path: "master"
                    },
                    {
                        text: "Understood. Mike 214-555-0100, 8-10 AM. How long is loading? Any special handling?",
                        quality: "good",
                        analytics: "✔️ Хорошо! Важные вопросы.",
                        path: "master"
                    },
                    {
                        text: "Got it. 8 AM tomorrow. What's the delivery address?",
                        quality: "normal",
                        analytics: "⚪ Нормально. Упущены детали.",
                        path: "master"
                    },
                    {
                        text: "5500 Industrial - is that easy to find?",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неважный вопрос.",
                        path: "master"
                    },
                    {
                        text: "Too much info! Just email it all!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Отказ записывать.",
                        path: "master"
                    },
                    {
                        text: "Wait, can you repeat the address?",
                        quality: "fail",
                        analytics: "❌ Провал. Не записывал.",
                        path: "master"
                    }
                ]
            },
            // ШАГ 8: Cargo handling
            {
                brokerQuestion: "Loading takes about 60 minutes.\nThey provide 6 load locks.\nStandard handling, nothing special.\nYes, have driver call Mike tonight between 6-8 PM.",
                dispatcherPrompt: "💎 Брокер дал cargo детали. Подтвердите.",
                suggestions: [
                    {
                        text: "Perfect! 60 min loading, 6 load locks provided. Standard handling, driver calls Mike tonight 6-8 PM. I'll brief driver on all details. What's the delivery address and receiver contact in Atlanta?",
                        quality: "excellent",
                        analytics: "✨ Отлично! Повторение + следующий вопрос.",
                        path: "master"
                    },
                    {
                        text: "Got it! 60 min load, driver calls tonight. What's delivery info?",
                        quality: "good",
                        analytics: "✔️ Хорошо! Краткое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "Understood. Driver calls tonight. Delivery address?",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "Okay, I think I got it. What's next?",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенность.",
                        path: "master"
                    },
                    {
                        text: "Yeah, yeah, we got it. Move on!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Грубость.",
                        path: "master"
                    },
                    {
                        text: "Wait, how many load locks? Can you repeat?",
                        quality: "fail",
                        analytics: "❌ Провал. Не слушал.",
                        path: "master"
                    }
                ]
            },
            // ШАГ 9: Consignee детали
            {
                brokerQuestion: "Delivery:\nAtlanta Warehouse\n3400 Peachtree Rd, Atlanta GA 30326\nContact: Jennifer Lee 404-555-0200\nDelivery Thursday 3 PM - 5 PM\nUnloading takes 90 minutes.\nCall Jennifer Wednesday evening to confirm ETA.",
                dispatcherPrompt: "💎 Брокер дал consignee детали. Задайте вопросы.",
                suggestions: [
                    {
                        text: "Perfect! Atlanta Warehouse, 3400 Peachtree Rd, Jennifer Lee 404-555-0200, Thursday 3-5 PM, 90 min unload. Driver calls Wednesday evening. Questions: Dock appointment needed? Parking restrictions? Any special unloading procedures?",
                        quality: "excellent",
                        analytics: "✨ Отлично! Подтверждение + проактивные вопросы.",
                        path: "master"
                    },
                    {
                        text: "Got it! Jennifer 404-555-0200, Thursday 3-5 PM. Do we need dock appointment? Any parking restrictions?",
                        quality: "good",
                        analytics: "✔️ Хорошо! Важные вопросы.",
                        path: "master"
                    },
                    {
                        text: "Understood. Thursday 3-5 PM in Atlanta. Anything else?",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "3400 Peachtree - is that downtown Atlanta?",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неважный вопрос.",
                        path: "master"
                    },
                    {
                        text: "90 minutes unload? That's too long!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Конфликт.",
                        path: "master"
                    },
                    {
                        text: "Can you text me all this info?",
                        quality: "fail",
                        analytics: "❌ Провал. Непрофессионально.",
                        path: "master"
                    }
                ]
            },
            // ШАГ 10: Delivery logistics
            {
                brokerQuestion: "No dock appointment needed, first come first served.\nParking available on-site.\nThey have forklifts, driver just supervises.\nMake sure cargo is secure when they open doors.",
                dispatcherPrompt: "💎 Брокер дал logistics детали. Подтвердите все.",
                suggestions: [
                    {
                        text: "Excellent! No appointment, on-site parking, they have forklifts. Let me confirm complete booking: Pickup tomorrow 8 AM Dallas, delivery Thursday 3-5 PM Atlanta. $1,750 all-in, detention $75/hr, layover $250/day. RTS Factoring. Driver calls Mike tonight, Jennifer Wednesday. We're 100% confirmed! Sending NOA now.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Полное резюме. МАСТЕР!",
                        path: "master"
                    },
                    {
                        text: "Confirmed! Tomorrow 8 AM Dallas, Thursday 3-5 PM Atlanta. $1,750 all-in. Driver calls both contacts. Sending NOA now. Thank you!",
                        quality: "good",
                        analytics: "✔️ Хорошо! Краткое резюме.",
                        path: "master"
                    },
                    {
                        text: "Confirmed. Tomorrow pickup, Thursday delivery. Sending NOA.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Минимальное подтверждение.",
                        path: "master"
                    },
                    {
                        text: "Okay, I think I got everything. We'll be there.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Нет резюме.",
                        path: "master"
                    },
                    {
                        text: "Yeah, we got it. Just send paperwork!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Грубость.",
                        path: "master"
                    },
                    {
                        text: "Wait, what was the pickup time again?",
                        quality: "fail",
                        analytics: "❌ Провал. Не запомнил детали.",
                        path: "master"
                    }
                ]
            },
            // ШАГ 11: Insurance Certificate
            {
                brokerQuestion: "Great! One last thing - insurance certificate.\nI need $1M auto liability and $100K cargo coverage.\nCan you email it right now to sarah@nationalfreight.com?",
                dispatcherPrompt: "💎 Брокер запрашивает insurance. Подтвердите и отправьте.",
                suggestions: [
                    {
                        text: "Absolutely! We have $1M auto liability with Progressive and $100K cargo with Great American. Certificate current, expires December 2026. Emailing to sarah@nationalfreight.com right now from dispatch@reliablecarriers.com. Also attaching W9. You'll have it in 30 seconds.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Полная информация + проактивность.",
                        path: "master"
                    },
                    {
                        text: "Yes! $1M liability and $100K cargo, current certificate. Emailing to sarah@nationalfreight.com now. You'll have it in a minute.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Быстрое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "Yes, we have insurance. Sending certificate now.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "I think we have that. Let me check and send later today.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Задержка.",
                        path: "master"
                    },
                    {
                        text: "Why do you need that? We're established company!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Отказ.",
                        path: "master"
                    },
                    {
                        text: "Insurance certificate? I don't have access to that.",
                        quality: "fail",
                        analytics: "❌ Провал. Нет доступа.",
                        path: "master"
                    }
                ]
            },
            // ШАГ 12: Driver contact
            {
                brokerQuestion: "Perfect, received!\nLast thing - driver's name and cell phone?\nI like to have direct contact for emergencies.",
                dispatcherPrompt: "💎 Брокер запрашивает контакт водителя. Дайте информацию.",
                suggestions: [
                    {
                        text: "Of course! Driver is James Rodriguez, cell 469-555-0188. He's been with us 5 years, very reliable. He has my dispatch number 214-555-0175 and will call every 12 hours with updates. I'll text you his contact right now. James knows to call immediately if any issues.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Полная информация + опыт.",
                        path: "master"
                    },
                    {
                        text: "Driver is James Rodriguez, 469-555-0188. He's experienced and will stay in touch. I'll text you his contact now.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Четкая информация.",
                        path: "master"
                    },
                    {
                        text: "Driver is James Rodriguez, 469-555-0188.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовая информация.",
                        path: "master"
                    },
                    {
                        text: "Not sure which driver yet. Can I send that tomorrow?",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Нет готовности.",
                        path: "master"
                    },
                    {
                        text: "Why do you need driver's personal number?",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Отказ.",
                        path: "master"
                    },
                    {
                        text: "I don't have driver info yet. We'll assign later.",
                        quality: "fail",
                        analytics: "❌ Провал. Нет плана.",
                        path: "master"
                    }
                ]
            },
            // ШАГ 13: Outcome - Результат диалога
            {
                brokerResponse: "Perfect! Thank you so much!\nYou're very professional and organized.\nRate con sent to RTS Factoring.\nLooking forward to working with you on this load.\nIf everything goes well, I have 2-3 Dallas to Atlanta loads weekly.\nGood luck!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$1,750",
                    ratePerMile: "$2.24/mile",
                    relationship: "Excellent - Weekly loads opportunity",
                    dialogueTime: "8-10 minutes",
                    questionsAsked: "12+ professional questions",
                    detailLevel: "very high",
                    futureOpportunity: "repeat",
                    weeklyLoads: "2-3 loads if perform well",
                    feedback: "🏆 МАСТЕР УРОВЕНЬ!\n\n✅ ЧТО СДЕЛАНО ПРАВИЛЬНО:\n- Представились профессионально с MC номером\n- Дали точное местоположение грузовика с деталями\n- Предоставили полную информацию об оборудовании\n- Подтвердили способность выполнить schedule с математикой\n- Приняли справедливую ставку без ненужного торга\n- Подтвердили detention/layover условия\n- Назвали factoring компанию и предложили документы\n- Задали все критические вопросы о pickup и delivery\n- Сделали полное резюме всех деталей перед подтверждением\n- Быстро отправили insurance certificate\n- Предоставили driver contact с деталями об опыте\n- Подтвердили что driver позвонит shipper и receiver\n\n💡 КЛЮЧЕВОЙ УРОК:\nПрофессиональный диалог = точные детали + проактивные вопросы + полное резюме в конце. Это показывает брокеру что вы надежный carrier и открывает дверь для weekly loads.\n\n🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:\nВсегда давайте точное местоположение, задавайте критические вопросы о cargo handling, подтверждайте все детали в конце. Это строит доверие и ведет к repeat business."
                }
            }
        ]
    }
};

// Диалог #2: Miami FL → Boston MA (Reefer - Produce)
const scenario2 = {
    id: 2,
    route: "Miami FL → Boston MA",
    distance: 1500,
    equipment: "Reefer (53ft)",
    brokerStyle: "Строгий профессионал",
    difficulty: "hard",
    cargo: "Pharmaceutical products (vaccines)",
    temperature: "2-8°C",
    deadline: "36 hours",

    initialMessage: "Good morning!\nThis is Sarah from MedTrans Logistics.\nI'm calling about your Miami to Boston reefer load.\nIs this pharmaceutical shipment still available?",

    paths: {
        master: [
            {
                brokerQuestion: "Yes, still available but this is time-sensitive pharma.\nWhat's your MC and do you have pharmaceutical certification?",
                dispatcherPrompt: "💎 Брокер сразу проверяет квалификацию - покажите опыт с pharma",
                suggestions: [
                    {
                        text: "MC 889234, we specialize in pharmaceutical transport. We're FDA registered and have VAWD accreditation. Our reefer units have continuous temperature monitoring with real-time alerts. Driver has 6 years experience with pharma loads, never had a temperature deviation. We understand this is vaccines - 2-8°C strict control.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Полная pharma квалификация.",
                        path: "master"
                    },
                    {
                        text: "MC 889234, we have experience with temperature-controlled pharma. Equipment has monitoring systems and driver is experienced. We can maintain 2-8°C requirements. Ready for tomorrow's pickup.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Подтверждена квалификация.",
                        path: "master"
                    },
                    {
                        text: "MC 889234. We have reefer trailer available. Driver knows how to maintain temperature. We've done cold freight before. Equipment is in good condition.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовая информация.",
                        path: "master"
                    },
                    {
                        text: "MC 889234. We don't have pharma certification yet. But we have good reefer equipment. Driver is experienced. Can we still do this load?",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Нет pharma сертификации.",
                        path: "reject1"
                    },
                    {
                        text: "Why do you need all these certifications? We have reefer, that's enough!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Не понимает требования.",
                        path: "reject1"
                    },
                    {
                        text: "Um, what certifications do you need? We have a reefer trailer...",
                        quality: "fail",
                        analytics: "❌ Провал. Не готов к pharma.",
                        path: "reject1"
                    }
                ]
            },
            {
                brokerResponse: "Excellent credentials! Verified MC 889234 - FDA registration confirmed. This is 28,000 lbs vaccines, must maintain 2-8°C throughout transit. Pickup tomorrow 6 AM sharp at Miami Pharma Distribution. Delivery to Boston Medical Center within 36 hours - no exceptions. Temperature logs required every 2 hours. $5,000 penalty for late delivery or temp deviation. What's your rate?",
                brokerQuestion: "What rate do you need for this critical pharma run?",
                dispatcherPrompt: "💎 Брокер ждет ставку - обоснуйте цену профессионально",
                suggestions: [
                    {
                        text: "For 1,500 miles pharma with 36-hour deadline, I'm at $4,500. That's $3.00/mile which reflects the specialized equipment, continuous monitoring, and expedited timeline. Includes dedicated driver team, real-time GPS tracking, and temperature data logging. We guarantee on-time delivery with full compliance documentation.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Обоснованная pharma ставка.",
                        path: "master"
                    },
                    {
                        text: "I'm looking at $4,200 for this load. That's about $2.80/mile for the specialized pharma transport. Covers the monitoring requirements and tight deadline. We can provide all necessary documentation and tracking.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Разумная ставка.",
                        path: "master"
                    },
                    {
                        text: "I need around $4,000 for this run. That should cover the distance and requirements. We can handle the temperature monitoring. What do you think about that rate?",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовая ставка.",
                        path: "master"
                    },
                    {
                        text: "I need $5,500 minimum. Non-negotiable. That's market rate for pharma. Take it or leave it.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Слишком агрессивная цена.",
                        path: "master"
                    },
                    {
                        text: "Um, what's your budget? I'm not sure what to charge. Whatever works for you probably. Just let me know.",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Показывает слабость.",
                        path: "master"
                    },
                    {
                        text: "I don't know pharma rates. What do you usually pay?",
                        quality: "fail",
                        analytics: "❌ Провал. Не знает рынок.",
                        path: "master"
                    }
                ]
            },
            {
                brokerResponse: "$4,500 is above our budget. Posted rate was $3,200, I can go to $3,800 max. This is a regular customer with weekly pharma shipments. If you perform well, you'll get priority on future loads. Can you work with $3,800?",
                brokerQuestion: "My best offer is $4,000 final. That's $800 over posted rate. Yes or no?",
                dispatcherPrompt: "💎 Брокер предлагает компромисс - решайте стратегически",
                suggestions: [
                    {
                        text: "$4,000 works for us on this load. We use TriumphPay factoring with quick setup. Can send NOA and insurance certificate immediately. Our driver will arrive at Miami Pharma Distribution at 5:45 AM for 6 AM pickup. We'll provide temperature logs every 2 hours via email and text. Please send rate con with all pickup/delivery contacts and special handling instructions.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Принятие с деталями.",
                        path: "master"
                    },
                    {
                        text: "$4,000 is acceptable for this shipment. We work through factoring company for payment. Driver will be on time for 6 AM pickup. We'll maintain temperature logs as required. Please send the rate confirmation.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Профессиональное принятие.",
                        path: "master"
                    },
                    {
                        text: "OK, $4,000 works. We use factoring for payment. Driver will be there on time. Send the paperwork.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое принятие.",
                        path: "master"
                    },
                    {
                        text: "No, I need $4,500 minimum. Can't go lower than that. Sorry, won't work. Thanks anyway.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Потеря хорошего груза.",
                        path: "master"
                    },
                    {
                        text: "Fine, $4,000 but this is my last offer to you!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Плохой тон.",
                        path: "master"
                    },
                    {
                        text: "I guess $4,000 is OK... if that's all you can do...",
                        quality: "fail",
                        analytics: "❌ Провал. Неуверенность.",
                        path: "master"
                    }
                ]
            },
            {
                brokerResponse: "Perfect! We work with TriumphPay regularly, no issues. Sending rate con now with detailed instructions. Pickup: Miami Pharma Distribution, 8900 NW 36th St, Miami FL. Contact: Dr. Rodriguez 305-555-0188 - call 30 min before arrival. Delivery: Boston Medical Center, 1 Boston Medical Center Pl, Boston MA. Contact: Receiving Manager 617-555-0244. Temp must stay 2-8°C - any deviation, call me immediately at 954-555-0177.",
                brokerQuestion: "Do you have the Samsara or similar real-time temperature monitoring? Shipper requires live access to temp data.",
                dispatcherPrompt: "💎 Брокер проверяет технологию - подтвердите возможности",
                suggestions: [
                    {
                        text: "Yes, we use Samsara TempTrac with real-time monitoring. I'll add your email and shipper's email to the monitoring portal. You'll get instant alerts if temperature goes outside 2-8°C range. System also tracks GPS location, door openings, and generates compliance reports. I'll send you the tracking link as soon as trailer is loaded. Is there a specific contact at the shipper who needs portal access?",
                        quality: "excellent",
                        analytics: "✨ Отлично! Полная tech готовность.",
                        path: "master"
                    },
                    {
                        text: "Yes, we have Samsara temperature monitoring system. Can provide you and shipper with portal access. You'll see real-time temperature data throughout transit. Will send tracking link once we're loaded.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Подтверждение tech.",
                        path: "master"
                    },
                    {
                        text: "We have temperature monitoring equipment. Can share data with you and shipper. You'll be able to track the temperature. Will set that up after loading.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "We have basic temp recorder. Driver can check temperature manually. We'll send logs. Should be fine.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Недостаточная tech.",
                        path: "reject2"
                    },
                    {
                        text: "Why do you need all this tech? Driver will watch the temperature!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Не понимает требования.",
                        path: "reject2"
                    },
                    {
                        text: "I don't know what Samsara is. We just have a reefer...",
                        quality: "fail",
                        analytics: "❌ Провал. Нет tech готовности.",
                        path: "reject2"
                    }
                ]
            },
            {
                brokerResponse: "Excellent! Samsara works great, we use it with many carriers. Add monitoring access for: Me: james.mitchell@pharmalogistics.com and Shipper QA: quality@miamipharma.com. They're very strict about monitoring - appreciate your setup. This is why we pay premium rates for professional carriers like you.",
                brokerQuestion: "What's your driver's name and phone? Shipper requires driver info 24 hours before pickup.",
                dispatcherPrompt: "💎 Брокер запрашивает информацию о водителе - будьте детальны",
                suggestions: [
                    {
                        text: "Driver is Michael Chen, direct cell 786-555-0156. 15 years CDL-A experience, specialized in pharma transport for last 6 years. He's currently in Fort Lauderdale, about 45 minutes from pickup location. Michael will pre-cool the trailer to 4°C tonight and verify all monitoring systems. He'll call Dr. Rodriguez tomorrow at 5:30 AM to confirm arrival time. Michael also has your direct number for any issues during transit.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Полная driver информация.",
                        path: "master"
                    },
                    {
                        text: "Driver is Michael Chen, phone 786-555-0156. Experienced with temperature-controlled freight. Currently near Miami, ready for tomorrow's pickup. He'll contact the shipper before arrival. Has your contact info for updates.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Достаточная информация.",
                        path: "master"
                    },
                    {
                        text: "Driver name is Michael Chen, 786-555-0156. He's in the Miami area. Will be ready for 6 AM pickup. Will call if any issues.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовая информация.",
                        path: "master"
                    },
                    {
                        text: "I'll assign a driver later. Will send info tomorrow morning.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Нет готовности.",
                        path: "master"
                    },
                    {
                        text: "Why do you need driver info so early? We'll figure it out!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Не понимает процесс.",
                        path: "master"
                    },
                    {
                        text: "I don't have driver info yet. We'll assign later.",
                        quality: "fail",
                        analytics: "❌ Провал. Нет плана.",
                        path: "master"
                    }
                ]
            },
            {
                brokerResponse: "Perfect! Michael Chen - got it. I'll send his info to Dr. Rodriguez now. Appreciate the detail about pre-cooling and verification. That's exactly the level of professionalism we need for pharma. You're definitely going on our preferred carrier list.",
                brokerQuestion: "One more thing - do you have cargo insurance minimum $250K? Required for pharma loads.",
                dispatcherPrompt: "💎 Брокер проверяет страховку - подтвердите покрытие",
                suggestions: [
                    {
                        text: "Yes, we carry $500K cargo insurance through Progressive Commercial. Policy includes temperature deviation coverage for pharma. I'll email certificate of insurance with our signed rate con. Policy number PC-8892341, expires 12/2026. Can also provide additional insured endorsement if needed. Anything else required for compliance?",
                        quality: "excellent",
                        analytics: "✨ Отлично! Полная insurance информация.",
                        path: "master"
                    },
                    {
                        text: "Yes, we have $500K cargo insurance. Can send certificate of insurance with rate con. Policy covers temperature-controlled freight. Let me know if you need additional documentation.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Подтверждение insurance.",
                        path: "master"
                    },
                    {
                        text: "We have cargo insurance coverage. Can send certificate if needed. Meets the requirements. Anything else?",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "I think we have insurance. Let me check and get back to you.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенность.",
                        path: "master"
                    },
                    {
                        text: "Insurance is expensive! Can we skip it for this one load?",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Не понимает требования.",
                        path: "master"
                    },
                    {
                        text: "I don't know our insurance details. Someone else handles that.",
                        quality: "fail",
                        analytics: "❌ Провал. Нет готовности.",
                        path: "master"
                    }
                ]
            },
            {
                brokerResponse: "$500K - excellent, that's above minimum. Yes, please send COI with signed rate con. No additional insured needed for this one. You're all set - everything is in order. Looking forward to a smooth delivery!",
                brokerQuestion: "All documents received and approved. Anything else you need from me before pickup?",
                dispatcherPrompt: "💎 Последние детали - закройте профессионально",
                suggestions: [
                    {
                        text: "Everything looks good on our end. Michael will arrive at 5:45 AM, call Dr. Rodriguez at 5:30 AM. We'll send you: Loaded confirmation with seal number by 8:30 AM, Temperature logs every 2 hours via email, ETA updates at 500 miles and 200 miles from delivery, POD within 1 hour of delivery. Your direct line 954-555-0177 is programmed in Michael's phone. Thanks for the smooth booking - excited to start this partnership!",
                        quality: "excellent",
                        analytics: "✨ Отлично! Полное профессиональное закрытие.",
                        path: "master"
                    },
                    {
                        text: "We're all set, thank you. Driver will be on time and follow all procedures. We'll keep you updated throughout transit. Looking forward to working together.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Профессиональное закрытие.",
                        path: "master"
                    },
                    {
                        text: "All good, we're ready. Will update you as we go. Thanks for the load.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое закрытие.",
                        path: "master"
                    },
                    {
                        text: "Yeah, we're good. Driver will show up. Bye.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Непрофессиональное закрытие.",
                        path: "master"
                    },
                    {
                        text: "Just send the rate con already! We know what to do!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Плохое впечатление.",
                        path: "master"
                    },
                    {
                        text: "I guess we're done? Let me know if you need anything...",
                        quality: "fail",
                        analytics: "❌ Провал. Неуверенность.",
                        path: "master"
                    }
                ]
            },
            {
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$4,000",
                    ratePerMile: "$2.67/mile",
                    relationship: "Excellent - Preferred carrier status + weekly pharma loads",
                    dialogueTime: "12-15 minutes",
                    questionsAsked: "8+ professional pharma questions",
                    detailLevel: "very high",
                    futureOpportunity: "repeat",
                    weeklyLoads: "2-3 pharma loads if perform well",
                    feedback: "🏆 МАСТЕР УРОВЕНЬ!\n\n✅ ЧТО СДЕЛАНО ПРАВИЛЬНО:\n- Подтвердили pharma сертификацию (FDA, VAWD)\n- Показали опыт с temperature-controlled freight\n- Обосновали premium ставку профессионально\n- Приняли справедливый компромисс $4,000\n- Подтвердили real-time temp monitoring (Samsara)\n- Предоставили полную driver информацию\n- Подтвердили cargo insurance $500K\n- Дали детальный план коммуникации\n\n💡 КЛЮЧЕВОЙ УРОК:\nPharma loads требуют специальной квалификации, технологии и профессионализма. Это окупается premium ставками ($2.67/mile vs $2.13 posted) и долгосрочными контрактами. Всегда показывайте compliance готовность.\n\n🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:\nДля pharma грузов критично: FDA регистрация, real-time monitoring, insurance coverage, детальная коммуникация. Это строит доверие и ведет к preferred carrier status с weekly loads."
                }
            }
        ],
        reject1: [
            {
                // Пустой первый шаг для совместимости со структурой
            },
            {
                brokerResponse: "Sorry, pharma certification is mandatory for vaccine transport. FDA and insurance requirements. Call me when you get certified. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    ratePerMile: "$0/mile",
                    relationship: "Rejected - No pharma certification",
                    dialogueTime: "1-2 minutes",
                    questionsAsked: "1 question",
                    detailLevel: "none",
                    futureOpportunity: "none",
                    weeklyLoads: "No loads - rejected",
                    feedback: "❌ ОТКАЗ БРОКЕРА: Потеря груза - нет pharma сертификации.\n\nДля vaccine transport требуется FDA регистрация и VAWD accreditation.\n\n💡 УРОК: Pharma loads требуют специальной сертификации. Без FDA/VAWD регистрации брокер не может работать с вами на pharmaceutical грузах."
                }
            }
        ],
        reject2: [
            {
                // Пустой первый шаг для совместимости со структурой
            },
            {
                brokerResponse: "Manual monitoring doesn't meet shipper requirements. They need real-time automated system. Sorry, can't use you on this one. Upgrade your equipment and call me back.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    ratePerMile: "$0/mile",
                    relationship: "Rejected - No real-time monitoring",
                    dialogueTime: "3-5 minutes",
                    questionsAsked: "3-4 questions",
                    detailLevel: "medium",
                    futureOpportunity: "possible after upgrade",
                    weeklyLoads: "No loads - equipment upgrade needed",
                    feedback: "❌ ОТКАЗ БРОКЕРА: Потеря груза - нет real-time temperature monitoring.\n\nPharma loads требуют автоматизированные системы типа Samsara для continuous temp monitoring.\n\n💡 УРОК: Manual temperature checks не подходят для pharmaceutical transport. Инвестируйте в real-time monitoring системы для доступа к premium pharma loads."
                }
            }
        ],
        reject3: [
            {
                // Пустой первый шаг для совместимости со структурой
            },
            {
                brokerResponse: "$5,500? That's ridiculous even for pharma. I can't justify that to the customer. Good luck finding that rate!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    ratePerMile: "$0/mile",
                    relationship: "Rejected - Unrealistic pricing",
                    dialogueTime: "2-3 minutes",
                    questionsAsked: "2 questions",
                    detailLevel: "low",
                    futureOpportunity: "unlikely",
                    weeklyLoads: "No loads - damaged relationship",
                    feedback: "❌ ОТКАЗ БРОКЕРА: Потеря груза - нереальная агрессивная цена.\n\n$5,500 ($3.67/mile) слишком высоко даже для pharma. Рыночная ставка для pharma: $3.00-3.20/mile.\n\n💡 УРОК: Даже для premium pharma loads есть рыночные пределы. Агрессивная цена отпугивает брокеров и портит репутацию. Изучайте рыночные ставки перед переговорами."
                }
            }
        ]
    }
},
    // ДИАЛОГ 3: СКОРОПОРТЯЩИЕСЯ ПРОДУКТЫ (PRODUCE REEFER)
    {
        id: 3,
        route: "Fresno CA → New York NY",
        distance: 2900,
        equipment: "Reefer (53ft)",
        brokerStyle: "Опытный produce broker",
        difficulty: "medium",
        cargo: "Fresh produce (strawberries, grapes)",
        temperature: "34-36°F",
        deadline: "4 days cross-country",

        initialMessage: "Good morning!\nThis is David from Fresh Express Logistics.\nMC 445566.\nI'm calling about your Fresno to New York reefer load.\nFresh produce - strawberries and grapes.\nDo you have experience with produce transport?",

        paths: {
            master: [
                // ШАГ 1: Produce Experience
                {
                    brokerQuestion: "Good morning! This is Maria from Coast to Coast Produce.\nYes, load is available but this is time-sensitive produce.\nDo you have produce transport experience?\nWhat's your MC number?",
                    dispatcherPrompt: "💎 Брокер сразу проверяет produce опыт - покажите квалификацию",
                    suggestions: [
                        {
                            text: "Good morning Maria! MC 445566, we specialize in produce transport. We've been hauling fresh fruits and vegetables for 8 years - strawberries, grapes, lettuce, tomatoes. Our drivers understand produce handling, pre-cooling requirements, and USDA inspection procedures. Equipment has continuous airflow systems and precise temperature control. We know produce is time-sensitive and handle it accordingly.",
                            quality: "excellent",
                            analytics: "✨ Отлично! Полный produce опыт.",
                            path: "master"
                        },
                        {
                            text: "Yes, we have produce experience. MC 445566. We've done reefer loads with fruits and vegetables before. Equipment maintains proper temperature. Drivers know to be careful with produce. We're ready for this load.",
                            quality: "good",
                            analytics: "✔️ Хорошо! Подтверждение опыта.",
                            path: "master"
                        },
                        {
                            text: "MC 445566. We have reefer trailer and have done some produce loads. Can maintain temperature. Driver is experienced with cold freight.",
                            quality: "normal",
                            analytics: "⚪ Нормально. Базовая информация.",
                            path: "master"
                        },
                        {
                            text: "MC 445566. We don't have much produce experience, but we have good reefer equipment. We can learn. Can you give us a chance?",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Нет produce опыта.",
                            path: "reject1"
                        },
                        {
                            text: "Why does produce matter? Reefer is reefer! We can haul anything cold!",
                            quality: "aggressive",
                            analytics: "🔴 Агрессивно. Не понимает специфику.",
                            path: "reject1"
                        },
                        {
                            text: "Um, what's special about produce? We just keep it cold, right?",
                            quality: "fail",
                            analytics: "❌ Провал. Нет понимания produce.",
                            path: "reject1"
                        }
                    ]
                },
                // ШАГ 2: Equipment и Pre-cooling
                {
                    brokerQuestion: "Good! MC 445566 verified, clean safety record.\nThis is 42,000 lbs fresh strawberries and grapes.\nMust maintain 34-36°F throughout transit.\nCan your trailer pre-cool to 34°F before loading?\nDo you have continuous airflow system?",
                    dispatcherPrompt: "💎 Брокер проверяет equipment capabilities - будьте конкретны",
                    suggestions: [
                        {
                            text: "Absolutely! We have 2020 Thermo King SB-400 reefer unit with continuous run capability. Trailer can pre-cool to 34°F in 2-3 hours. We have T-floor for continuous airflow circulation - critical for produce. Unit was serviced last month, fuel tank full. Driver will start pre-cooling tonight so trailer is ready at 34°F for tomorrow's loading. We understand produce needs constant airflow to prevent hot spots.",
                            quality: "excellent",
                            analytics: "✨ Отлично! Полная equipment информация.",
                            path: "master"
                        },
                        {
                            text: "Yes, we have Thermo King reefer unit that can pre-cool to 34°F. Equipment has continuous airflow system. Unit is well-maintained and ready. Driver will pre-cool trailer before loading tomorrow. We can maintain 34-36°F throughout transit.",
                            quality: "good",
                            analytics: "✔️ Хорошо! Подтверждение capabilities.",
                            path: "master"
                        },
                        {
                            text: "We have reefer unit that can maintain 34-36°F. Can pre-cool before loading. Equipment is in good condition. Ready for produce transport.",
                            quality: "normal",
                            analytics: "⚪ Нормально. Базовое подтверждение.",
                            path: "master"
                        },
                        {
                            text: "We can cool the trailer down. Not sure about pre-cooling time. Equipment should work fine. We'll figure it out.",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Неуверенность в pre-cooling.",
                            path: "reject2"
                        },
                        {
                            text: "Pre-cooling? Just load it and turn on the reefer! That's how it works!",
                            quality: "aggressive",
                            analytics: "🔴 Агрессивно. Не понимает produce требования.",
                            path: "reject2"
                        },
                        {
                            text: "What's pre-cooling? Can't we just cool it during transport?",
                            quality: "fail",
                            analytics: "❌ Провал. Нет produce знаний.",
                            path: "reject2"
                        }
                    ]
                },
                // ШАГ 3: Route и Timeline
                {
                    brokerQuestion: "Perfect equipment! T-floor is exactly what we need.\nThis is 2,900 miles Fresno to New York.\nPickup tomorrow 6 AM at Fresno Cold Storage.\nDelivery must be Friday morning by 8 AM at Hunts Point Market.\nThat's 4 days for cross-country.\nCan you make this tight schedule?",
                    dispatcherPrompt: "💎 Брокер дал tight timeline - подтвердите способность",
                    suggestions: [
                        {
                            text: "Yes, we can make that schedule! 2,900 miles in 4 days - that's 725 miles per day average. We'll run team drivers for this load. Tomorrow 6 AM Fresno pickup, Friday 8 AM Hunts Point delivery. We understand produce shelf life is critical. Team will drive 11 hours each, minimal stops. We'll provide ETA updates every 12 hours. Route: I-80 through Nevada, Wyoming, Nebraska, Iowa, Illinois, Indiana, Ohio, Pennsylvania to New York. This schedule is tight but doable with team.",
                            quality: "excellent",
                            analytics: "✨ Отлично! Детальный план с team drivers.",
                            path: "master"
                        },
                        {
                            text: "Yes, we can do 2,900 miles in 4 days. We'll use team drivers for this cross-country run. Tomorrow 6 AM pickup, Friday 8 AM delivery at Hunts Point. We understand the tight timeline for produce. Will provide regular updates.",
                            quality: "good",
                            analytics: "✔️ Хорошо! Подтверждение с team.",
                            path: "master"
                        },
                        {
                            text: "We can make that schedule. Team drivers available. Tomorrow pickup, Friday delivery. 2,900 miles in 4 days is doable.",
                            quality: "normal",
                            analytics: "⚪ Нормально. Базовое подтверждение.",
                            path: "master"
                        },
                        {
                            text: "4 days is really tight for 2,900 miles. We'll try our best. Traffic and weather can be unpredictable. Can we have 5 days?",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Нет уверенности.",
                            path: "master"
                        },
                        {
                            text: "4 days cross-country? That's crazy! What if there's delays?",
                            quality: "aggressive",
                            analytics: "🔴 Агрессивно. Негатив.",
                            path: "master"
                        },
                        {
                            text: "Can we do 5 days instead? 4 days seems impossible.",
                            quality: "fail",
                            analytics: "❌ Провал. Не может выполнить.",
                            path: "master"
                        }
                    ]
                },
                // ШАГ 4: Rate Discussion
                {
                    brokerQuestion: "Team drivers - smart! That's what we need.\nFor this load, I'm offering $7,800 all-in.\nThat's $2.69 per mile for 2,900 miles.\nFair rate for produce cross-country with team.\nWhat do you think?",
                    dispatcherPrompt: "💎 Брокер предложил ставку - оцените и ответьте",
                    suggestions: [
                        {
                            text: "Thank you for the offer. $7,800 at $2.69/mile works for us. That's fair for cross-country produce with team drivers and tight timeline. The rate covers fuel, team driver costs, and the time-sensitive nature of fresh produce. Let's book it. What about detention pay at pickup and delivery? Produce facilities can have delays.",
                            quality: "excellent",
                            analytics: "✨ Отлично! Принятие + важный вопрос.",
                            path: "master"
                        },
                        {
                            text: "$7,800 works for us. Fair rate for team drivers and produce. What about detention pay if there are delays at shipper or receiver?",
                            quality: "good",
                            analytics: "✔️ Хорошо! Принятие и вопрос.",
                            path: "master"
                        },
                        {
                            text: "$7,800 is acceptable. Do you pay detention at produce facilities?",
                            quality: "normal",
                            analytics: "⚪ Нормально. Краткое принятие.",
                            path: "master"
                        },
                        {
                            text: "Hmm, $7,800... I was hoping for $8,500. Can you go higher?",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Торг без обоснования.",
                            path: "master"
                        },
                        {
                            text: "$7,800? That's too low for team drivers! I need $9,000 minimum!",
                            quality: "aggressive",
                            analytics: "🔴 Агрессивно. Нереальная цена.",
                            path: "reject3"
                        },
                        {
                            text: "Let me check with my boss and call back. Need to calculate costs.",
                            quality: "fail",
                            analytics: "❌ Провал. Потеря груза.",
                            path: "master"
                        }
                    ]
                },
                // ШАГ 5: Detention и USDA
                {
                    brokerQuestion: "Yes, detention is $100/hour after 2 hours free time.\nBoth pickup and delivery.\nProduce facilities can be slow, I understand.\nAlso - USDA inspection required at pickup.\nDriver needs to wait for USDA inspector approval.\nUsually takes 30-45 minutes.\nAny issues with that?",
                    dispatcherPrompt: "💎 Брокер упомянул USDA inspection - подтвердите понимание",
                    suggestions: [
                        {
                            text: "Perfect! $100/hour detention after 2 hours - that's fair. We're familiar with USDA produce inspections. Driver will arrive early, wait for inspector, and ensure all paperwork is completed. Inspector checks temperature, quality, and packaging. We'll get USDA certificate and include it with BOL. Driver knows not to leave until inspection is complete and approved. This is standard for produce shipments.",
                            quality: "excellent",
                            analytics: "✨ Отлично! Полное понимание USDA процесса.",
                            path: "master"
                        },
                        {
                            text: "Understood. $100/hour detention works. We're familiar with USDA inspections at produce facilities. Driver will wait for inspector approval before leaving. We'll get the USDA certificate with the load.",
                            quality: "good",
                            analytics: "✔️ Хорошо! Подтверждение USDA знаний.",
                            path: "master"
                        },
                        {
                            text: "OK, detention terms accepted. Driver will wait for USDA inspection. We've done this before.",
                            quality: "normal",
                            analytics: "⚪ Нормально. Базовое подтверждение.",
                            path: "master"
                        },
                        {
                            text: "USDA inspection? How long does that usually take? Will it delay us?",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Неуверенность в процессе.",
                            path: "master"
                        },
                        {
                            text: "Why do we need USDA inspection? That's shipper's problem!",
                            quality: "aggressive",
                            analytics: "🔴 Агрессивно. Не понимает процесс.",
                            path: "master"
                        },
                        {
                            text: "What's USDA inspection? Never heard of that.",
                            quality: "fail",
                            analytics: "❌ Провал. Нет produce знаний.",
                            path: "master"
                        }
                    ]
                },
                // ШАГ 6: Shipper Details
                {
                    brokerQuestion: "Excellent! You clearly know produce.\nShipper details:\nFresno Cold Storage\n4455 S Elm Ave, Fresno CA 93706\nContact: Robert Martinez 559-555-0199\nPickup tomorrow 6 AM - must be pre-cooled to 34°F\nCall Robert tonight to confirm arrival time.\nAny questions about pickup?",
                    dispatcherPrompt: "💎 Брокер дал shipper детали - задайте важные вопросы",
                    suggestions: [
                        {
                            text: "Got it! Fresno Cold Storage, 4455 S Elm Ave, Robert Martinez 559-555-0199, 6 AM pickup. Trailer will be pre-cooled to 34°F. Questions: How long does loading take? Do they load palletized or floor-loaded? Any special stacking requirements for strawberries? Should we bring our own pallets or load locks? Driver will call Robert tonight between 6-8 PM to confirm.",
                            quality: "excellent",
                            analytics: "✨ Отлично! Критические produce вопросы.",
                            path: "master"
                        },
                        {
                            text: "Understood. Robert 559-555-0199, 6 AM, pre-cooled to 34°F. How long is loading? Any special handling for strawberries? Driver calls tonight to confirm.",
                            quality: "good",
                            analytics: "✔️ Хорошо! Важные вопросы.",
                            path: "master"
                        },
                        {
                            text: "Got it. 6 AM tomorrow, pre-cooled. Driver will call Robert tonight. What's the delivery address?",
                            quality: "normal",
                            analytics: "⚪ Нормально. Упущены детали.",
                            path: "master"
                        },
                        {
                            text: "4455 S Elm - is that easy to find in Fresno?",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Неважный вопрос.",
                            path: "master"
                        },
                        {
                            text: "Too much info! Just email everything!",
                            quality: "aggressive",
                            analytics: "🔴 Агрессивно. Отказ записывать.",
                            path: "master"
                        },
                        {
                            text: "Wait, can you repeat the address and phone?",
                            quality: "fail",
                            analytics: "❌ Провал. Не записывал.",
                            path: "master"
                        }
                    ]
                },
                // ШАГ 7: Loading Details
                {
                    brokerQuestion: "Great questions! Loading takes 90-120 minutes.\nPalletized - 20 pallets strawberries, 18 pallets grapes.\nStrawberries on bottom (heavier), grapes on top.\nThey provide load locks and corner protectors.\nDon't stack more than 5 high - berries are fragile.\nDriver must verify temperature is 34°F before loading starts.",
                    dispatcherPrompt: "💎 Брокер дал loading детали - подтвердите понимание",
                    suggestions: [
                        {
                            text: "Perfect! 90-120 min loading, 38 pallets total. Strawberries bottom (20 pallets), grapes top (18 pallets). Max 5 high stacking. Load locks and corner protectors provided. Driver will verify 34°F before loading and monitor temp during loading. We'll document pre-load temp with photos. What's the delivery location and receiver contact in New York?",
                            quality: "excellent",
                            analytics: "✨ Отлично! Полное понимание + документация.",
                            path: "master"
                        },
                        {
                            text: "Got it! 90-120 min, strawberries bottom, grapes top, max 5 high. Driver verifies 34°F before loading. What's delivery info in New York?",
                            quality: "good",
                            analytics: "✔️ Хорошо! Краткое подтверждение.",
                            path: "master"
                        },
                        {
                            text: "Understood. Strawberries bottom, grapes top. Driver checks temp. Delivery address?",
                            quality: "normal",
                            analytics: "⚪ Нормально. Базовое подтверждение.",
                            path: "master"
                        },
                        {
                            text: "OK, I think I got it. What's next?",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Неуверенность.",
                            path: "master"
                        },
                        {
                            text: "Yeah, yeah, we know how to load. Move on!",
                            quality: "aggressive",
                            analytics: "🔴 Агрессивно. Грубость.",
                            path: "master"
                        },
                        {
                            text: "Wait, how many pallets total? Can you repeat?",
                            quality: "fail",
                            analytics: "❌ Провал. Не слушал.",
                            path: "master"
                        }
                    ]
                },
                // ШАГ 8: Delivery Details
                {
                    brokerQuestion: "Delivery:\nHunts Point Produce Market\n800 Food Center Dr, Bronx NY 10474\nContact: Tony Russo 718-555-0233\nDelivery Friday 6 AM - 8 AM (early morning window)\nUnloading takes 60 minutes.\nCall Tony Thursday evening with ETA.\nHunts Point is busy - arrive early for dock space.",
                    dispatcherPrompt: "💎 Брокер дал delivery детали - задайте вопросы",
                    suggestions: [
                        {
                            text: "Perfect! Hunts Point Market, 800 Food Center Dr, Bronx, Tony Russo 718-555-0233, Friday 6-8 AM, 60 min unload. Driver calls Thursday evening with ETA. Questions: Do we need dock appointment or first-come-first-served? Any parking restrictions at Hunts Point? Should driver arrive at 5:30 AM to secure dock space? Any special unloading procedures for produce?",
                            quality: "excellent",
                            analytics: "✨ Отлично! Проактивные Hunts Point вопросы.",
                            path: "master"
                        },
                        {
                            text: "Got it! Tony 718-555-0233, Friday 6-8 AM at Hunts Point. Do we need dock appointment? Should driver arrive early for dock space? Any parking restrictions?",
                            quality: "good",
                            analytics: "✔️ Хорошо! Важные вопросы.",
                            path: "master"
                        },
                        {
                            text: "Understood. Friday 6-8 AM at Hunts Point. Driver calls Thursday. Anything else?",
                            quality: "normal",
                            analytics: "⚪ Нормально. Базовое подтверждение.",
                            path: "master"
                        },
                        {
                            text: "Hunts Point - is that in Manhattan or Bronx?",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Неважный вопрос.",
                            path: "master"
                        },
                        {
                            text: "6 AM delivery? That's too early!",
                            quality: "aggressive",
                            analytics: "🔴 Агрессивно. Конфликт.",
                            path: "master"
                        },
                        {
                            text: "Can you text me all this info?",
                            quality: "fail",
                            analytics: "❌ Провал. Непрофессионально.",
                            path: "master"
                        }
                    ]
                },
                // ШАГ 9: Hunts Point Logistics
                {
                    brokerQuestion: "Good questions! No appointment needed - first come first served.\nYes, arrive at 5:30 AM to get dock space.\nParking is tight at Hunts Point - don't be late.\nThey have forklifts, driver supervises.\nKeep reefer running during unload - don't let temp rise.\nTony is strict about temperature - he'll check it.",
                    dispatcherPrompt: "💎 Брокер дал Hunts Point детали - подтвердите все",
                    suggestions: [
                        {
                            text: "Excellent! First-come-first-served, arrive 5:30 AM for dock space. Reefer stays running during unload to maintain 34-36°F. Driver will monitor temp throughout unloading. Let me confirm complete booking: Pickup tomorrow 6 AM Fresno (pre-cooled to 34°F), delivery Friday 6-8 AM Hunts Point. $7,800 all-in, detention $100/hr. Team drivers, USDA inspection at pickup. Driver calls Robert tonight, Tony Thursday. We're 100% confirmed!",
                            quality: "excellent",
                            analytics: "✨ Отлично! Полное резюме. МАСТЕР!",
                            path: "master"
                        },
                        {
                            text: "Confirmed! Arrive 5:30 AM, reefer running during unload. Tomorrow 6 AM Fresno, Friday 6-8 AM Hunts Point. $7,800 all-in. Team drivers. Driver calls both contacts. Thank you!",
                            quality: "good",
                            analytics: "✔️ Хорошо! Краткое резюме.",
                            path: "master"
                        },
                        {
                            text: "Confirmed. Tomorrow pickup, Friday delivery. Reefer stays on. Sending NOA.",
                            quality: "normal",
                            analytics: "⚪ Нормально. Минимальное подтверждение.",
                            path: "master"
                        },
                        {
                            text: "OK, I think I got everything. We'll be there.",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Нет резюме.",
                            path: "master"
                        },
                        {
                            text: "Yeah, we got it. Just send paperwork!",
                            quality: "aggressive",
                            analytics: "🔴 Агрессивно. Грубость.",
                            path: "master"
                        },
                        {
                            text: "Wait, what was the pickup time again?",
                            quality: "fail",
                            analytics: "❌ Провал. Не запомнил детали.",
                            path: "master"
                        }
                    ]
                },
                // ШАГ 10: Final Details и Outcome
                {
                    brokerResponse: "Perfect! You're very professional and know produce well.\nSending rate con to your factoring company now.\nWhich factoring company do you use?\nAlso need insurance certificate - $1M liability, $100K cargo.\nAnd team driver names and phone numbers for shipper.",
                    brokerQuestion: "What's your factoring company and can you send insurance cert right now?",
                    dispatcherPrompt: "💎 Последние детали - закройте профессионально",
                    suggestions: [
                        {
                            text: "We use OTR Capital factoring - please send rate con to dispatch@otr-capital.com with our MC 445566. Emailing insurance certificate now to maria@coastproduce.com - $1M liability with Nationwide, $100K cargo with Liberty Mutual, expires 11/2026. Team drivers: Lead driver Carlos Mendez 559-555-0177, co-driver James Wilson 559-555-0188. Both have 10+ years produce experience. I'll text you their contacts now. Anything else needed?",
                            quality: "excellent",
                            analytics: "✨ Отлично! Полная информация + проактивность.",
                            path: "master"
                        },
                        {
                            text: "OTR Capital factoring. Sending insurance cert now - $1M liability, $100K cargo. Team drivers: Carlos Mendez 559-555-0177, James Wilson 559-555-0188. Texting you their contacts. Ready to go!",
                            quality: "good",
                            analytics: "✔️ Хорошо! Быстрое закрытие.",
                            path: "master"
                        },
                        {
                            text: "We use OTR Capital. Sending insurance now. Driver info: Carlos 559-555-0177, James 559-555-0188.",
                            quality: "normal",
                            analytics: "⚪ Нормально. Базовое закрытие.",
                            path: "master"
                        },
                        {
                            text: "Let me check factoring company name. Will send insurance later today. Driver names coming soon.",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Задержка.",
                            path: "master"
                        },
                        {
                            text: "Why do you need all this now? We'll send it later!",
                            quality: "aggressive",
                            analytics: "🔴 Агрессивно. Отказ.",
                            path: "master"
                        },
                        {
                            text: "I don't have access to that info right now.",
                            quality: "fail",
                            analytics: "❌ Провал. Нет готовности.",
                            path: "master"
                        }
                    ]
                },
                // OUTCOME - Success
                {
                    brokerResponse: "Excellent! Everything received.\nYou're very organized and professional.\nI can tell you really know produce transport.\nThis is exactly the kind of carrier we need.\nIf this load goes well, I have 3-4 Fresno to East Coast loads weekly.\nLooking forward to a great partnership!\nGood luck and safe travels!",
                    outcome: {
                        type: "success",
                        quality: "excellent",
                        rate: "$7,800",
                        ratePerMile: "$2.69/mile",
                        relationship: "Excellent - Weekly produce loads opportunity",
                        dialogueTime: "10-12 minutes",
                        questionsAsked: "10+ professional produce questions",
                        detailLevel: "very high",
                        futureOpportunity: "repeat",
                        weeklyLoads: "3-4 produce loads if perform well",
                        feedback: "🏆 МАСТЕР УРОВЕНЬ!\n\n✅ ЧТО СДЕЛАНО ПРАВИЛЬНО:\n- Показали produce transport опыт (8 лет)\n- Подтвердили pre-cooling capability и T-floor\n- Предложили team drivers для tight timeline\n- Приняли справедливую ставку $7,800 ($2.69/mile)\n- Показали понимание USDA inspection процесса\n- Задали критические вопросы о loading (stacking, pallets)\n- Спросили про Hunts Point logistics (dock space, timing)\n- Подтвердили reefer running during unload\n- Сделали полное резюме всех деталей\n- Быстро предоставили factoring, insurance, driver info\n\n💡 КЛЮЧЕВОЙ УРОК:\nProduce transport требует специальных знаний: pre-cooling, airflow, USDA inspection, temperature monitoring, fragile handling. Показывая этот опыт, вы получаете premium ставки и weekly loads.\n\n🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:\nДля produce грузов критично: pre-cooling trailer, понимание USDA процесса, знание produce facilities (Hunts Point), team drivers для cross-country. Это строит доверие и ведет к repeat business с produce brokers."
                    }
                }
            ],
            // REJECT PATH 1: No Produce Experience
            reject1: [
                {
                    // Пустой первый шаг для совместимости со структурой
                },
                {
                    brokerResponse: "Sorry, this is time-sensitive produce worth $150K.\nI need carriers with proven produce experience.\nStrawberries and grapes are very fragile.\nOne temperature mistake and entire load is ruined.\nGet some produce experience and call me back.\nGood luck!",
                    outcome: {
                        type: "failure",
                        quality: "fail",
                        rate: "$0",
                        ratePerMile: "$0/mile",
                        relationship: "Rejected - No produce experience",
                        dialogueTime: "1-2 minutes",
                        questionsAsked: "1 question",
                        detailLevel: "none",
                        futureOpportunity: "possible after gaining experience",
                        weeklyLoads: "No loads - need produce experience first",
                        feedback: "❌ ОТКАЗ БРОКЕРА: Потеря груза - нет produce transport опыта.\n\nProduce loads (особенно berries) требуют специального опыта: temperature control, handling procedures, USDA compliance.\n\n💡 УРОК: Produce brokers не рискуют с неопытными carriers на fragile freight. Начните с менее чувствительных produce loads (lettuce, potatoes) чтобы набрать опыт, потом переходите на berries и grapes."
                    }
                }
            ],
            // REJECT PATH 2: No Pre-cooling Capability
            reject2: [
                {
                    // Пустой первый шаг для совместимости со структурой
                },
                {
                    brokerResponse: "Pre-cooling is mandatory for produce loads.\nShipper won't load into warm trailer - it damages the fruit.\nTrailer must be 34°F before loading starts.\nThis is non-negotiable for strawberries and grapes.\nUpgrade your equipment and procedures.\nCall me when you can pre-cool properly.",
                    outcome: {
                        type: "failure",
                        quality: "fail",
                        rate: "$0",
                        ratePerMile: "$0/mile",
                        relationship: "Rejected - No pre-cooling capability",
                        dialogueTime: "2-3 minutes",
                        questionsAsked: "2-3 questions",
                        detailLevel: "low",
                        futureOpportunity: "possible after equipment upgrade",
                        weeklyLoads: "No loads - need pre-cooling capability",
                        feedback: "❌ ОТКАЗ БРОКЕРА: Потеря груза - нет pre-cooling capability.\n\nProduce shippers требуют pre-cooled trailers. Loading produce в warm trailer вызывает condensation и портит фрукты.\n\n💡 УРОК: Pre-cooling - это базовое требование для produce transport. Trailer должен быть охлажден до target temperature ДО начала loading. Без этой capability вы не можете возить produce."
                    }
                }
            ],
            // REJECT PATH 3: Unrealistic Rate
            reject3: [
                {
                    // Пустой первый шаг для совместимости со структурой
                },
                {
                    brokerResponse: "$9,000? That's $3.10 per mile!\nMarket rate for produce cross-country is $2.60-2.80/mile.\nI can't justify $3.10 to my customer.\nYou're pricing yourself out of the market.\nGood luck finding that rate!",
                    outcome: {
                        type: "failure",
                        quality: "fail",
                        rate: "$0",
                        ratePerMile: "$0/mile",
                        relationship: "Rejected - Unrealistic pricing",
                        dialogueTime: "3-4 minutes",
                        questionsAsked: "3-4 questions",
                        detailLevel: "medium",
                        futureOpportunity: "unlikely",
                        weeklyLoads: "No loads - damaged relationship",
                        feedback: "❌ ОТКАЗ БРОКЕРА: Потеря груза - нереальная агрессивная цена.\n\n$9,000 ($3.10/mile) слишком высоко для produce cross-country. Рыночная ставка: $2.60-2.80/mile даже с team drivers.\n\n💡 УРОК: Изучайте рыночные ставки для produce lanes. Агрессивная цена отпугивает brokers и портит репутацию. $7,800 ($2.69/mile) была справедливая ставка для этого load."
                    }
                }
            ]
        }
    }
};

// Добавляем сценарии в глобальный массив
if (typeof allScenarios !== 'undefined') {
    allScenarios.push(scenario1);
    allScenarios.push(scenario2);
    console.log('✅ Scenarios 1-2 added to allScenarios');
} else {
    console.warn('⚠️ allScenarios array not found');
}

