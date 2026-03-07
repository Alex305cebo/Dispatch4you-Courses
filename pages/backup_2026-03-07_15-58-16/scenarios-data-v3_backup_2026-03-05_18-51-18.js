// СИМУЛЬ - База диалогов для обучения диспетчеров
// Версия: 4.0
// Дата: 2026-03-05
// ПРАВИЛО: 6 вариантов качества в каждом шаге!

const allScenarios = [
    // ============================================
    // ДИАЛОГ #1: Los Angeles CA → Chicago IL (DRY VAN)
    // Стиль: 💼 Профессиональный + ⚡ Быстрый + 🎯 Требовательный
    // Расстояние: 2,015 миль (LONG HAUL)
    // СИТУАЦИЯ: Срочный груз + Factoring обязателен + Tight delivery window
    // 15 ШАГОВ ПОЛНОГО ПРОФЕССИОНАЛЬНОГО ДИАЛОГА
    // ============================================
    {
        id: 1,
        route: "Los Angeles CA → Chicago IL",
        distance: 2015,
        equipment: "Dry Van",
        brokerStyle: "Профессиональный + Быстрый + Требовательный",
        difficulty: "hard",

        initialMessage: "Good morning!\nThis is Alex Martinez from Nationwide Logistics.\nMC 556789.\nI'm calling about your Los Angeles to Chicago dry van load.\nIs this still available?",

        paths: {
            master: [
                // ШАГ 1: Первый контакт - местоположение грузовика
                {
                    brokerQuestion: "Yes, available.\nMC 556789 - checking now... okay, verified.\nWhere's your truck located right now?",
                    dispatcherPrompt: "💎 Брокер проверил ваш MC. Дайте точное местоположение грузовика.",
                    suggestions: [
                        {
                            text: "My truck is empty in Los Angeles right now, just finished delivery at the port this morning at 8 AM. Driver is currently at the TA truck stop on I-10, exit 58, about 20 minutes from downtown LA. Ready to load today.",
                            quality: "excellent",
                            analytics: "✨ Отлично! Точное местоположение, время, готовность.",
                            path: "master"
                        },
                        {
                            text: "The truck is currently in Los Angeles, empty since this morning. We're at a truck stop near the port area. Available to pick up today or tomorrow.",
                            quality: "good",
                            analytics: "✔️ Хорошо! Местоположение и готовность указаны.",
                            path: "master"
                        },
                        {
                            text: "Truck is in LA now, empty. We can pick up today or tomorrow.",
                            quality: "normal",
                            analytics: "⚪ Нормально. Базовая информация, но не детально.",
                            path: "master"
                        },
                        {
                            text: "Somewhere in LA area. I think near the port. Driver will be ready whenever you need.",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Неточное местоположение, нет деталей.",
                            path: "master"
                        },
                        {
                            text: "Why do you need to know exactly where? The truck is in LA, that's all that matters! Just give me the pickup address!",
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
                // ШАГ 2: Детали оборудования
                {
                    brokerQuestion: "Good. What type of dry van equipment do you have?\nI need specifics - trailer brand, year, features.",
                    dispatcherPrompt: "💎 Брокер запрашивает детали оборудования. Будьте конкретны.",
                    suggestions: [
                        {
                            text: "It's a 2022 Freightliner Cascadia with a 53-foot Great Dane dry van, swing doors, air ride suspension, logistics tracking equipped. Trailer is only 2 years old, well-maintained, clean interior. Last DOT inspection passed 3 weeks ago.",
                            quality: "excellent",
                            analytics: "✨ Отлично! Полная информация об оборудовании.",
                            path: "master"
                        },
                        {
                            text: "We have a 2021 Freightliner with 53-foot dry van, swing doors, air ride. Equipment is in good condition, clean and ready.",
                            quality: "good",
                            analytics: "✔️ Хорошо! Основная информация есть.",
                            path: "master"
                        },
                        {
                            text: "It's a 53-foot dry van with swing doors. The truck is a Freightliner.",
                            quality: "normal",
                            analytics: "⚪ Нормально. Базовая информация без деталей.",
                            path: "master"
                        },
                        {
                            text: "It's a dry van, 53 feet. I don't remember the exact year of the trailer.",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Нет конкретики, непрофессионально.",
                            path: "master"
                        },
                        {
                            text: "It's a dry van! What else do you need to know? It hauls freight, that's what matters!",
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
                // ШАГ 3: Детали груза
                {
                    brokerQuestion: "Okay. This load is 42,000 lbs electronics - computers and monitors. 20 pallets, high value cargo.\nPickup tomorrow 6 AM at Tech Distribution Center in LA.\nDelivery must be Friday morning 8-10 AM in Chicago.\nThat's 3 days transit time for 2,015 miles.",
                    dispatcherPrompt: "💎 Брокер описал груз и жесткий дедлайн. Подтвердите способность выполнить.",
                    suggestions: [
                        {
                            text: "Understood. 42,000 lbs electronics, 20 pallets, high value. Tomorrow 6 AM pickup LA, Friday 8-10 AM delivery Chicago. 3 days for 2,015 miles - that's about 670 miles per day, very realistic. We handle high-value electronics regularly, have $100k cargo insurance. Driver will run team-style if needed. We'll send location updates every 12 hours.",
                            quality: "excellent",
                            analytics: "✨ Отлично! Подтверждение + математика + опыт + план.",
                            path: "master"
                        },
                        {
                            text: "Yes, we can make that schedule work. Tomorrow 6 AM pickup, Friday morning delivery. We handle electronics often, have proper insurance. We'll keep you updated during the trip.",
                            quality: "good",
                            analytics: "✔️ Хорошо! Четкое подтверждение и опыт.",
                            path: "master"
                        },
                        {
                            text: "Yeah, we can do it. Tomorrow 6 AM, Friday delivery. We've done electronics before.",
                            quality: "normal",
                            analytics: "⚪ Нормально. Базовое подтверждение.",
                            path: "master"
                        },
                        {
                            text: "We'll try our best. Traffic can be unpredictable, but we should make it. Electronics are fragile, right?",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Нет уверенности, нет плана.",
                            path: "master"
                        },
                        {
                            text: "Don't threaten me with tight deadlines! Things happen on the road! We'll get there when we get there!",
                            quality: "aggressive",
                            analytics: "🔴 Агрессивно. Конфликт вместо профессионализма.",
                            path: "master"
                        },
                        {
                            text: "3 days seems really tight. Can we have 4 days just in case? I'm not sure about electronics.",
                            quality: "fail",
                            analytics: "❌ Провал. Не может выполнить требования.",
                            path: "master"
                        }
                    ]
                },
                // ШАГ 4: Обсуждение ставки
                {
                    brokerQuestion: "Alright. For this load, I'm at $4,500 all-in.\nThat's $2.23 per mile for 2,015 miles.\nInterested?",
                    dispatcherPrompt: "💎 Брокер предложил ставку. Оцените и ответьте профессионально.",
                    suggestions: [
                        {
                            text: "Thank you for the offer. $4,500 all-in works for us. That's fair for this lane and the tight delivery window. High-value electronics with 3-day transit at $2.23/mile is reasonable. Let's book it. Do you have detention pay if there are delays at shipper or receiver?",
                            quality: "excellent",
                            analytics: "✨ Отлично! Принятие + анализ + переход к деталям.",
                            path: "master"
                        },
                        {
                            text: "$4,500 works for us. Let's confirm it. What about detention and layover pay?",
                            quality: "good",
                            analytics: "✔️ Хорошо! Принятие и важный вопрос.",
                            path: "master"
                        },
                        {
                            text: "$4,500 is okay. Do you pay detention?",
                            quality: "normal",
                            analytics: "⚪ Нормально. Краткое принятие.",
                            path: "master"
                        },
                        {
                            text: "Hmm, $4,500... I was hoping for more. Can you do $5,000?",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Торг без обоснования.",
                            path: "master"
                        },
                        {
                            text: "$4,500? That's way too low! I need at least $5,500 or I'm not interested!",
                            quality: "aggressive",
                            analytics: "🔴 Агрессивно. Грубый отказ, нереалистичные требования.",
                            path: "master"
                        },
                        {
                            text: "Let me think about it and call you back. I need to check with my boss first.",
                            quality: "fail",
                            analytics: "❌ Провал. Нерешительность, потеря груза.",
                            path: "master"
                        }
                    ]
                },
                // ШАГ 5: Detention и Layover
                {
                    brokerQuestion: "Yes, detention is $75/hour after 2 hours free time at both ends.\nLayover is $250/day if needed.\nSound good?",
                    dispatcherPrompt: "💎 Брокер дал условия detention/layover. Подтвердите.",
                    suggestions: [
                        {
                            text: "Perfect! $75/hour detention after 2 hours free time, $250/day layover. That's standard and fair. We'll track all times carefully with timestamps and photos. Now, how do you handle payment? Do you work with factoring companies?",
                            quality: "excellent",
                            analytics: "✨ Отлично! Подтверждение + переход к payment.",
                            path: "master"
                        },
                        {
                            text: "Okay, detention and layover terms are good. What about payment? We use factoring.",
                            quality: "good",
                            analytics: "✔️ Хорошо! Подтверждение и важный вопрос.",
                            path: "master"
                        },
                        {
                            text: "That's fine. How do we get paid?",
                            quality: "normal",
                            analytics: "⚪ Нормально. Краткое подтверждение.",
                            path: "master"
                        },
                        {
                            text: "Only $75/hour? Other brokers pay $100. Can you match that?",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Ненужный торг по стандартным условиям.",
                            path: "master"
                        },
                        {
                            text: "2 hours free time? That's ridiculous! Should be 1 hour max!",
                            quality: "aggressive",
                            analytics: "🔴 Агрессивно. Конфликт по стандартным условиям.",
                            path: "master"
                        },
                        {
                            text: "What's detention? I don't understand these terms.",
                            quality: "fail",
                            analytics: "❌ Провал. Не знает базовые термины индустрии.",
                            path: "master"
                        }
                    ]
                },
                // ШАГ 6: Factoring
                {
                    brokerQuestion: "Yes, we work with all major factoring companies.\nWho do you use?",
                    dispatcherPrompt: "💎 Брокер работает с factoring. Назовите свою компанию.",
                    suggestions: [
                        {
                            text: "We work with RTS Financial for factoring. Can you send the rate confirmation to factoring@rtsfin.com? They'll handle all the paperwork and payment. Do you work with RTS? They usually pay brokers in 24 hours, so you'll get your money fast too.",
                            quality: "excellent",
                            analytics: "✨ Отлично! Полная информация + выгода для брокера.",
                            path: "master"
                        },
                        {
                            text: "We use Triumph Business Capital. Can you send the rate con to their email? Do you work with Triumph?",
                            quality: "good",
                            analytics: "✔️ Хорошо! Четкая информация.",
                            path: "master"
                        },
                        {
                            text: "We have factoring with OTR Solutions. Should I give you their contact info?",
                            quality: "normal",
                            analytics: "⚪ Нормально. Базовая информация.",
                            path: "master"
                        },
                        {
                            text: "I think it's RTS or maybe Triumph. Let me check and get back to you.",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Не знает свою factoring компанию.",
                            path: "master"
                        },
                        {
                            text: "Why do you care who we use? Just send us the rate con!",
                            quality: "aggressive",
                            analytics: "🔴 Агрессивно. Грубость, не понимает процесс.",
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
                    brokerQuestion: "Okay, good. I'll send rate con to your factoring company.\nNow, shipper details:\nTech Distribution Center, 5678 Industrial Blvd, Los Angeles CA 90058.\nContact: Mike Johnson 323-555-0100.\nPickup window 6 AM - 8 AM tomorrow.\nAny questions about pickup?",
                    dispatcherPrompt: "💎 Брокер дал shipper детали. Задайте важные вопросы о pickup.",
                    suggestions: [
                        {
                            text: "Got it! Tech Distribution Center, 5678 Industrial Blvd, Mike Johnson 323-555-0100, 6-8 AM window. Quick questions: is cargo palletized? How many pallets exactly? Do they provide load locks and straps? Any special handling instructions for electronics? Should driver call Mike tonight to confirm arrival time?",
                            quality: "excellent",
                            analytics: "✨ Отлично! Подтверждение + критические вопросы.",
                            path: "master"
                        },
                        {
                            text: "Understood. Mike Johnson 323-555-0100, 6-8 AM window. How is cargo packaged? Any special handling for electronics?",
                            quality: "good",
                            analytics: "✔️ Хорошо! Базовые важные вопросы.",
                            path: "master"
                        },
                        {
                            text: "Got it, 6 AM at Tech Distribution. What's the delivery address?",
                            quality: "normal",
                            analytics: "⚪ Нормально. Упущены важные детали.",
                            path: "master"
                        },
                        {
                            text: "Okay, 5678 Industrial Blvd. Is that near the highway?",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Неважный вопрос, упущены критические детали.",
                            path: "master"
                        },
                        {
                            text: "That's a lot of information! Can you just email it all to me?",
                            quality: "aggressive",
                            analytics: "🔴 Агрессивно. Отказ записывать информацию.",
                            path: "master"
                        },
                        {
                            text: "Wait, can you repeat all that? I didn't write it down.",
                            quality: "fail",
                            analytics: "❌ Провал. Не записывал важную информацию.",
                            path: "master"
                        }
                    ]
                },
                // ШАГ 8: Cargo детали
                {
                    brokerQuestion: "Okay. Yes, cargo is palletized - 20 pallets total.\nShipper provides 8 load locks, but bring extra straps just in case.\nElectronics are in boxes on pallets, handle carefully - no rough handling, no stacking over 5 high.\nYes, have driver call Mike tonight between 6-8 PM to confirm.",
                    dispatcherPrompt: "💎 Брокер дал детали cargo. Подтвердите понимание.",
                    suggestions: [
                        {
                            text: "Perfect! 20 pallets, 8 load locks provided, extra straps on hand. Electronics in boxes, careful handling, max 5 high stacking. Driver will call Mike tonight 6-8 PM to confirm 6 AM arrival. I'll note all this in our dispatch system. What's the delivery address and receiver contact in Chicago?",
                            quality: "excellent",
                            analytics: "✨ Отлично! Повторение + подтверждение + следующий вопрос.",
                            path: "master"
                        },
                        {
                            text: "Got it! 20 pallets, load locks provided, max 5 high, driver calls tonight. What's delivery info?",
                            quality: "good",
                            analytics: "✔️ Хорошо! Краткое подтверждение.",
                            path: "master"
                        },
                        {
                            text: "Understood. 20 pallets, careful handling. Delivery address?",
                            quality: "normal",
                            analytics: "⚪ Нормально. Базовое подтверждение.",
                            path: "master"
                        },
                        {
                            text: "Okay, 20 pallets. I think I got it. What's next?",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Неуверенность, упущены детали.",
                            path: "master"
                        },
                        {
                            text: "5 high? That's too restrictive! We stack however we want!",
                            quality: "aggressive",
                            analytics: "🔴 Агрессивно. Отказ следовать инструкциям.",
                            path: "master"
                        },
                        {
                            text: "Wait, how many pallets? Can you repeat everything?",
                            quality: "fail",
                            analytics: "❌ Провал. Не слушал, не записывал.",
                            path: "master"
                        }
                    ]
                },
                // ШАГ 9: Consignee детали
                {
                    brokerQuestion: "Alright. Delivery: Chicago Electronics Warehouse, 1234 Warehouse Drive, Chicago IL 60601.\nContact: Sarah Williams 312-555-0200.\nDelivery window Friday 8 AM - 10 AM.\nUnloading takes about 2 hours.\nCall Sarah Thursday evening to confirm ETA.",
                    dispatcherPrompt: "💎 Брокер дал consignee детали. Задайте финальные вопросы.",
                    suggestions: [
                        {
                            text: "Perfect! Chicago Electronics Warehouse, 1234 Warehouse Drive, Sarah Williams 312-555-0200, Friday 8-10 AM, 2 hour unload. Driver calls Sarah Thursday evening. Quick questions: any dock appointment needed? Parking restrictions in Chicago? Any special unloading requirements? Should driver bring pallet jack or they have equipment?",
                            quality: "excellent",
                            analytics: "✨ Отлично! Подтверждение + проактивные вопросы.",
                            path: "master"
                        },
                        {
                            text: "Got it! Sarah Williams 312-555-0200, Friday 8-10 AM. Do we need dock appointment? Any parking restrictions?",
                            quality: "good",
                            analytics: "✔️ Хорошо! Важные вопросы.",
                            path: "master"
                        },
                        {
                            text: "Understood. Friday 8-10 AM in Chicago. Anything else?",
                            quality: "normal",
                            analytics: "⚪ Нормально. Базовое подтверждение.",
                            path: "master"
                        },
                        {
                            text: "Okay, Chicago. 1234 Warehouse Drive. Got it.",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Упущены важные детали.",
                            path: "master"
                        },
                        {
                            text: "2 hours unload? That's too long! We can't wait that long!",
                            quality: "aggressive",
                            analytics: "🔴 Агрессивно. Конфликт по стандартным условиям.",
                            path: "master"
                        },
                        {
                            text: "Can you text me all this info? I can't write that fast.",
                            quality: "fail",
                            analytics: "❌ Провал. Непрофессионально, не готов.",
                            path: "master"
                        }
                    ]
                },
                // ШАГ 10: Финальные детали
                {
                    brokerQuestion: "No dock appointment needed, first come first served.\nParking is available on-site, but arrive early to avoid delays.\nThey have forklifts and pallet jacks, driver just needs to supervise unloading.\nMake sure cargo is secure and undamaged when they open doors.",
                    dispatcherPrompt: "💎 Брокер дал финальные детали. Подтвердите все.",
                    suggestions: [
                        {
                            text: "Excellent! No appointment needed, on-site parking, they have equipment. Driver supervises unloading and ensures cargo is secure. Let me confirm the complete booking:\n• Pickup: Tomorrow 6 AM, Tech Distribution LA, Mike 323-555-0100\n• Delivery: Friday 8-10 AM, Chicago Electronics, Sarah 312-555-0200\n• Rate: $4,500 all-in, detention $75/hr after 2hrs, layover $250/day\n• Cargo: 42,000 lbs electronics, 20 pallets, max 5 high\n• Payment: RTS Factoring\n• Driver: Will call Mike tonight 6-8 PM, Sarah Thursday evening\nWe're 100% confirmed! Sending NOA in 2 minutes. Thank you!",
                            quality: "excellent",
                            analytics: "✨ Отлично! Полное резюме всех деталей. МАСТЕР УРОВЕНЬ!",
                            path: "master"
                        },
                        {
                            text: "Yes, confirmed! Tomorrow 6 AM pickup LA, Friday 8-10 AM delivery Chicago. $4,500 all-in. Driver will call both contacts. Sending NOA now. Thank you!",
                            quality: "good",
                            analytics: "✔️ Хорошо! Краткое резюме ключевых пунктов.",
                            path: "master"
                        },
                        {
                            text: "Confirmed. Tomorrow 6 AM pickup, Friday delivery. Sending NOA.",
                            quality: "normal",
                            analytics: "⚪ Нормально. Минимальное подтверждение.",
                            path: "master"
                        },
                        {
                            text: "Okay, I think I got everything. We'll be there tomorrow.",
                            quality: "weak",
                            analytics: "⚠️ Слабо. Нет резюме, нет уверенности.",
                            path: "master"
                        },
                        {
                            text: "Yeah, yeah, we got it. Just send the paperwork already!",
                            quality: "aggressive",
                            analytics: "🔴 Агрессивно. Грубость в финале.",
                            path: "master"
                        },
                        {
                            text: "Wait, what was the pickup time again? And the delivery day?",
                            quality: "fail",
                            analytics: "❌ Провал. Не запомнил критические детали.",
                            path: "master"
                        }
                    ]
                },
                // ШАГ 11: Outcome - Результат диалога
                {
                    brokerResponse: "Perfect! You're very professional. Rate con sent to RTS Factoring.\nLooking forward to working with you on this load.\nIf everything goes well, I have 3-4 LA to Chicago loads weekly.\nGood luck!",
                    outcome: {
                        type: "success",
                        quality: "excellent",
                        rate: "$4,500",
                        ratePerMile: "$2.23/mile",
                        relationship: "Excellent - Weekly loads opportunity",
                        dialogueTime: "8-10 minutes",
                        questionsAsked: "12+ professional questions",
                        detailLevel: "very high",
                        futureOpportunity: "repeat",
                        weeklyLoads: "3-4 loads if perform well",
                        feedback: "🏆 МАСТЕР УРОВЕНЬ!\n\n✅ ЧТО СДЕЛАНО ПРАВИЛЬНО:\n- Дали точное местоположение грузовика с деталями (TA truck stop, I-10 exit 58)\n- Предоставили полную информацию об оборудовании (2022 Freightliner, Great Dane, air ride)\n- Подтвердили способность выполнить tight delivery window с математикой (670 миль/день)\n- Показали опыт с high-value electronics и наличие $100k cargo insurance\n- Приняли справедливую ставку $4,500 ($2.23/mile) без ненужного торга\n- Подтвердили detention/layover условия профессионально\n- Назвали factoring компанию (RTS Financial) и объяснили преимущества для брокера\n- Задали все критические вопросы о pickup (palletized, load locks, handling)\n- Подтвердили понимание cargo деталей (20 pallets, max 5 high, careful handling)\n- Задали проактивные вопросы о delivery (dock appointment, parking, equipment)\n- Сделали полное резюме всех деталей в конце диалога\n- Подтвердили что driver позвонит shipper и receiver для координации\n\n⚠️ ЧТО МОЖНО УЛУЧШИТЬ:\n- Можно было спросить про preferred route или routing restrictions\n- Можно было уточнить про insurance certificate requirements\n\n💡 КЛЮЧЕВОЙ УРОК:\nПрофессиональный диалог = точные детали + проактивные вопросы + полное резюме в конце. Это показывает брокеру что вы надежный carrier и открывает дверь для weekly loads.\n\n🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:\nВсегда давайте точное местоположение грузовика, задавайте критические вопросы о cargo handling, подтверждайте все детали в конце диалога. Это строит доверие и ведет к repeat business."
                    }
                }
            ]
        }
    }
];
