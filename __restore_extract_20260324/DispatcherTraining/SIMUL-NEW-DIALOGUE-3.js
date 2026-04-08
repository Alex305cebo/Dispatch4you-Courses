// ============================================
// ДИАЛОГ #2: Dallas TX → Atlanta GA (DRY VAN)
// Стиль: 📋 Детальный + 👔 Профессиональный брокер
// Расстояние: 780 миль (MEDIUM HAUL)
// ДЕТАЛЬНЫЙ ДИАЛОГ С 20+ ШАГАМИ
// ============================================
{
    id: 2,
        route: "Dallas TX → Atlanta GA",
            distance: 780,
                equipment: "Dry Van",
                    brokerStyle: "Детальный + Профессиональный",
                        difficulty: "medium",

                            initialMessage: "Good afternoon!\nThis is David from Lone Star Logistics.\nI'm calling about your Dallas to Atlanta dry van load.\nIs this still available?",

                                paths: {
        // МАСТЕР ПУТЬ (20 шагов)
        master: [
            {
                brokerQuestion: "Good afternoon! Yes, load is available.\nThis is automotive parts load, requires experienced carrier with good safety record.\nWhat's your MC number and where is your driver currently located?",
                dispatcherPrompt: "💎 Брокер профессиональный и детальный. Дайте полную информацию о MC и местоположении.",
                suggestions: [
                    {
                        text: "MC 556677, we're based in Dallas and specialize in automotive freight.\nDriver just delivered in Fort Worth, empty trailer ready, 25 miles from Dallas.\nWe can pickup today or tomorrow morning, whatever works best.",
                        quality: "master",
                        analytics: "Отлично! Показали специализацию, близость и гибкость."
                    },
                    {
                        text: "MC 556677, driver is in Dallas area with empty dry van.\nWe're ready for pickup, can be there within an hour if needed.",
                        quality: "good",
                        analytics: "Хорошо, но не показали специализацию."
                    },
                    {
                        text: "MC 556677, we have a truck available in Dallas.",
                        quality: "weak",
                        analytics: "Слишком мало информации."
                    }
                ]
            },
            {
                brokerResponse: "Excellent! Just verified MC 556677 - 98% safety score, very good.\nAutomotive parts specialist, that's exactly what I need for this customer.\nTell me about your trailer - year, type of doors, and is it food grade or automotive dedicated?",
                dispatcherPrompt: "💎 Брокер проверил MC и хочет детали трейлера. Покажите что оборудование подходит.",
                suggestions: [
                    {
                        text: "2023 Great Dane 53ft dry van, swing doors for easy loading.\nAutomotive dedicated trailer, never hauls food or chemicals, always clean and swept.\nAir ride suspension to protect delicate parts during transit.",
                        quality: "master",
                        analytics: "Отлично! Детали трейлера и защита груза."
                    },
                    {
                        text: "2023 Great Dane 53ft with swing doors, clean trailer ready to go.\nWe keep our trailers in excellent condition, regular maintenance.",
                        quality: "good",
                        analytics: "Хорошо, но не указали automotive dedicated."
                    },
                    {
                        text: "53ft dry van, 2023 model, swing doors.",
                        quality: "weak",
                        analytics: "Слишком коротко."
                    }
                ]
            },
            {
                brokerResponse: "Perfect! Automotive dedicated with air ride - customer will love that.\nNow tell me about your truck and driver experience.\nWhat year is the truck, and how long has your driver been hauling automotive parts?",
                dispatcherPrompt: "💎 Брокер хочет знать о траке и опыте водителя. Покажите надежность.",
                suggestions: [
                    {
                        text: "2022 Freightliner Cascadia, well-maintained, all DOT requirements current.\nDriver has 10 years OTR experience, last 5 years exclusively automotive parts.\nClean driving record, no accidents, understands importance of careful handling.",
                        quality: "master",
                        analytics: "Отлично! Опыт водителя и безопасность."
                    },
                    {
                        text: "2022 Freightliner, driver has 10 years experience in trucking.\nClean record, professional driver, always on time with deliveries.",
                        quality: "good",
                        analytics: "Хорошо, но не указали automotive опыт."
                    },
                    {
                        text: "2022 Freightliner, experienced driver.",
                        quality: "weak",
                        analytics: "Слишком мало деталей."
                    }
                ]
            },
            {
                brokerResponse: "Excellent credentials! 10 years with 5 in automotive - that's the experience level I need.\nLet me give you the load details: 38,000 lbs automotive transmission parts, 12 pallets.\nPickup tomorrow 7 AM at Dallas Auto Parts Distribution, delivery Atlanta in 2 days.\nThis is JIT delivery - customer's production line depends on it, so timing is critical.\nCan you handle this timeline?",
                dispatcherPrompt: "💎 Брокер дал детали груза и подчеркнул важность времени. Подтвердите возможности.",
                suggestions: [
                    {
                        text: "Absolutely! 780 miles in 2 days is very manageable for us.\nDriver has 11 hours available on HOS, can make Atlanta in 12-13 hours driving time.\nWe understand JIT requirements - we've handled Toyota, Ford, GM parts before.\nNo delays, guaranteed on-time delivery.",
                        quality: "master",
                        analytics: "Отлично! HOS, опыт с JIT, гарантии."
                    },
                    {
                        text: "Yes, we can definitely handle 2-day delivery to Atlanta.\nDriver is ready to go, we'll make sure it arrives on time.\n780 miles is no problem for us.",
                        quality: "good",
                        analytics: "Хорошо, но не показали понимание JIT."
                    },
                    {
                        text: "Yes, we can do 2 days to Atlanta.",
                        quality: "weak",
                        analytics: "Слишком коротко."
                    }
                ]
            },
            {
                brokerResponse: "Great! You clearly understand JIT logistics, that's reassuring.\nNow let's talk rate - this is 780 miles, automotive parts, time-critical delivery.\nPosted rate is $2,100, that's $2.69/mile.\nWhat are your thoughts on this rate?",
                dispatcherPrompt: "💎 Брокер назвал posted rate. Обоснуйте свою ставку выше рынка.",
                suggestions: [
                    {
                        text: "For 780 miles with JIT automotive parts, I'm looking at $2,350 all-in.\nThat's $3.01/mile covering fuel, experienced automotive driver, air ride protection.\nMarket rate for automotive JIT is $2.90-$3.10/mile due to strict timing requirements.\nYou get guaranteed on-time delivery and 5 years automotive experience.",
                        quality: "master",
                        analytics: "Отлично! Обоснование через JIT и опыт."
                    },
                    {
                        text: "I'm at $2,250 for this load, that's $2.88/mile.\nCovers all expenses and guarantees on-time delivery for your customer.",
                        quality: "good",
                        analytics: "Хорошо, но можно было выше."
                    },
                    {
                        text: "$2,100 works for us, let's book it.",
                        quality: "weak",
                        analytics: "Сдались без торговли."
                    }
                ]
            },
            {
                brokerResponse: "I appreciate the detailed breakdown and you're right about JIT premium.\nLet me be transparent - customer's budget is tight at $2,100 posted.\nBut I see your value with automotive experience and air ride.\nCan you meet me at $2,250? That's $2.88/mile, fair compromise?",
                dispatcherPrompt: "💎 Брокер предложил компромисс. Торгуйтесь умно, покажите дополнительную ценность.",
                suggestions: [
                    {
                        text: "I understand budget constraints, let's find middle ground.\nI can do $2,300 and here's what you get for that extra $50:\nGPS tracking with hourly updates, photos at pickup and delivery.\nDirect driver cell phone for real-time communication.\nIf we're even 1 hour late, I'll refund $100 - that's my guarantee.\nThat's $2.95/mile for premium service and peace of mind.",
                        quality: "master",
                        analytics: "Отлично! Добавили ценность и гарантию."
                    },
                    {
                        text: "Can you do $2,275? That's $2.92/mile, my bottom line.\nWe'll provide GPS tracking and guarantee on-time delivery.",
                        quality: "good",
                        analytics: "Хорошо, но можно было держаться $2,300."
                    },
                    {
                        text: "$2,250 works, let's book it now.",
                        quality: "weak",
                        analytics: "Сдались слишком быстро."
                    }
                ]
            },
            {
                brokerResponse: "You know what, I really like your confidence and the guarantee you're offering.\nLet me call the customer about $2,300 with your premium service package.\nThe hourly updates and on-time guarantee might justify the extra cost to them.\nIf they approve, we have a deal with GPS tracking and your $100 late guarantee, correct?",
                dispatcherPrompt: "💎 Брокер продает вашу ценность клиенту! Подтвердите все обязательства.",
                suggestions: [
                    {
                        text: "Absolutely, $2,300 and you have my word! Here's exactly what you'll get:\nGPS tracking link sent to you and customer within 1 hour of pickup.\nHourly text updates with location and ETA during transit.\nPhotos of cargo at pickup (securement) and delivery (condition).\nDirect driver cell: he'll answer 24/7 for any questions.\nIf we're late, $100 refund automatically - no questions asked.",
                        quality: "master",
                        analytics: "Отлично! Детальный план сервиса."
                    },
                    {
                        text: "Yes, $2,300 confirmed with GPS tracking and on-time guarantee.\nWe'll provide all updates and photos as discussed, guaranteed delivery.",
                        quality: "good",
                        analytics: "Хорошо, подтвердили."
                    },
                    {
                        text: "Yes, deal at $2,300 with tracking and guarantee.",
                        quality: "weak",
                        analytics: "Слишком коротко."
                    }
                ]
            },
            {
                brokerResponse: "Perfect! Customer approved $2,300 - they loved the service package and guarantee.\nYou just earned preferred carrier status for their automotive lanes!\nSending rate con now, what's your factoring company?",
                dispatcherPrompt: "💎 Отлично! Груз ваш. Дайте factoring быстро и проактивно.",
                suggestions: [
                    {
                        text: "Fantastic! We work with Saint Johns Capital for factoring.\nSending NOA to your email right now, you'll have it in 2 minutes.\nDriver will call shipper tonight to confirm 7 AM pickup tomorrow.\nWhat's shipper contact name and phone number?",
                        quality: "master",
                        analytics: "Отлично! Проактивность."
                    },
                    {
                        text: "Great! Saint Johns Capital is our factoring, NOA coming now.\nWhat's the shipper contact information for tomorrow?",
                        quality: "good",
                        analytics: "Хорошо."
                    },
                    {
                        text: "Saint Johns Capital, sending NOA now.",
                        quality: "weak",
                        analytics: "Слишком коротко."
                    }
                ]
            },
            {
                brokerResponse: "Excellent! Shipper is Dallas Auto Parts Distribution, contact James at 214-555-0123.\nAddress: 4567 Industrial Boulevard, Dallas TX 75201, dock 5.\nPickup window 7 AM - 9 AM, loading takes 1-2 hours.\nThey're very organized, usually done in 90 minutes.\nAny questions about pickup location or process?",
                dispatcherPrompt: "💎 Брокер дал pickup детали. Задайте важные вопросы о процессе и грузе.",
                suggestions: [
                    {
                        text: "Got it, dock 5, 7-9 AM window! Few questions:\nIs there gate code or special check-in procedure?\nHow is cargo packaged - palletized or crated?\nDo they provide load locks or should we bring our own?\nAny special securement requirements for transmission parts?",
                        quality: "master",
                        analytics: "Отлично! Детальные вопросы."
                    },
                    {
                        text: "Understood, dock 5, 7-9 AM! Quick questions:\nAny gate code? How is cargo packaged?\nDo we need to bring load locks?",
                        quality: "good",
                        analytics: "Хорошо, базовые вопросы."
                    },
                    {
                        text: "Got it, 7 AM at dock 5.",
                        quality: "weak",
                        analytics: "Упущена возможность."
                    }
                ]
            },
            {
                brokerResponse: "Great questions! No gate code, just check in at guard shack with BOL.\nCargo is palletized, 12 pallets, each about 3,000 lbs, shrink-wrapped.\nThey provide 4 load locks, but bring 2 extra for safety - transmission parts are heavy.\nSecurement: load locks every 8 feet, no special requirements beyond that.\nIs there lumper fee or do they load?",
                dispatcherPrompt: "💎 Брокер ответил на вопросы. Уточните про lumper и спросите о delivery.",
                suggestions: [
                    {
                        text: "Perfect, all clear! We'll bring 2 extra load locks for total 6.\nUnderstood on securement every 8 feet for heavy transmission parts.\nNow for delivery: what's receiver info, delivery window, and appointment requirements?\nAlso, is there detention policy if they're backed up?",
                        quality: "master",
                        analytics: "Отлично! Подтвердили и планируют delivery."
                    },
                    {
                        text: "Got it, we'll bring extra load locks and secure properly.\nWhat's the delivery address and receiver contact?\nAny appointment needed?",
                        quality: "good",
                        analytics: "Хорошо, основные вопросы."
                    },
                    {
                        text: "Understood, we'll handle the securement.",
                        quality: "weak",
                        analytics: "Не спросили о delivery."
                    }
                ]
            },
            {
                brokerResponse: "No lumper fee, shipper loads with forklift, but driver should supervise.\nDelivery is Atlanta Automotive Assembly, receiver Mike at 404-555-0189.\nAddress: 7890 Assembly Drive, Atlanta GA 30301, dock 3.\nDelivery window is 2 days from pickup, but earlier is better - they prefer morning.\nAppointment required, call Mike 4 hours before arrival.\nDetention: $75/hour after 2 hours free time.",
                dispatcherPrompt: "💎 Все детали delivery получены. Уточните последние важные моменты.",
                suggestions: [
                    {
                        text: "Perfect, all noted! Atlanta Automotive Assembly, Mike 404-555-0189, dock 3.\nWe'll call 4 hours ahead, aim for morning delivery day after tomorrow.\nLast questions: any routing restrictions or preferred route?\nWhat's your 24/7 contact for updates or issues?\nAny special requirements at delivery - photos, paperwork, scale ticket?",
                        quality: "master",
                        analytics: "Отлично! Планирование всех деталей."
                    },
                    {
                        text: "Got it, will call Mike 4 hours before arrival.\nAny routing restrictions?\nWho to contact if any issues during transit?",
                        quality: "good",
                        analytics: "Хорошо, важные вопросы."
                    },
                    {
                        text: "Understood, will call 4 hours ahead.",
                        quality: "weak",
                        analytics: "Упущены важные вопросы."
                    }
                ]
            },
            {
                brokerResponse: "Excellent questions! No routing restrictions, I-20 East is fastest route.\nMy cell 24/7: 214-555-9999, text or call anytime.\nAt delivery: yes, they require photos of cargo condition before unloading.\nNo scale ticket needed, but keep your pickup weight ticket just in case.\nAlso, they're very strict about appointment time - if you're going to be late, call immediately.",
                dispatcherPrompt: "💎 Брокер дал все детали. Подтвердите понимание и спросите про оборудование.",
                suggestions: [
                    {
                        text: "Perfect, I-20 East route, your cell saved as priority contact.\nWe'll take photos before unloading and keep weight ticket.\nUnderstood on appointment strictness - we'll call if any delays.\nOne more question: do they require any special equipment at delivery?\nLiftgate, pallet jack, or anything else we should have ready?",
                        quality: "master",
                        analytics: "Отлично! Детальное планирование."
                    },
                    {
                        text: "Got it, I-20 route, will take photos and keep weight ticket.\nWe'll call if any delays, all clear on our end.\nAny special equipment needed at delivery?",
                        quality: "good",
                        analytics: "Хорошо."
                    },
                    {
                        text: "Understood, I-20 route, will take photos.",
                        quality: "weak",
                        analytics: "Слишком коротко."
                    }
                ]
            },
            {
                brokerResponse: "No special equipment needed, they have forklift for unloading.\nJust make sure driver has his own straps and load locks for securement.\nOh, and one important thing - customer requires GPS tracking link.\nCan you send me Macropoint or your tracking system link after pickup?",
                dispatcherPrompt: "💎 Брокер спросил про GPS tracking. Подтвердите и предложите дополнительный сервис.",
                suggestions: [
                    {
                        text: "Absolutely! We use Samsara GPS tracking system.\nI'll send you tracking link within 30 minutes of pickup.\nYou'll see real-time location, speed, and ETA updates automatically.\nAlso, I'll text you personally when driver leaves Dallas, crosses into Louisiana, and arrives in Atlanta.\nWant me to add customer to tracking link too?",
                        quality: "master",
                        analytics: "Отлично! Проактивный сервис."
                    },
                    {
                        text: "Yes, we have GPS tracking, I'll send link after pickup.\nYou'll get real-time updates throughout the trip.",
                        quality: "good",
                        analytics: "Хорошо."
                    },
                    {
                        text: "Yes, I'll send tracking link after pickup.",
                        quality: "weak",
                        analytics: "Слишком коротко."
                    }
                ]
            },
            {
                brokerResponse: "That would be perfect! Yes, please add customer to tracking link.\nThey love seeing real-time updates, makes them feel secure about their parts.\nYour proactive communication is exactly why I approved the higher rate.\nAnything else you need from me, or are we all set?",
                dispatcherPrompt: "💎 Брокер очень доволен. Подтвердите все детали и спросите про будущие возможности.",
                suggestions: [
                    {
                        text: "We're all set! Let me confirm everything:\nPickup tomorrow 7 AM dock 5, Dallas Auto Parts, James 214-555-0123.\nDelivery Atlanta Automotive Assembly dock 3, Mike 404-555-0189, call 4 hours ahead.\n$2,300 rate, Saint Johns factoring, NOA sent.\nGPS tracking link to you and customer within 30 minutes of pickup.\nOne last question: you mentioned this customer has multiple automotive lanes.\nIf we perform well, are there opportunities for regular weekly loads?",
                        quality: "master",
                        analytics: "Отлично! Подтвердили все и планируют будущее."
                    },
                    {
                        text: "All set on our end! Pickup tomorrow 7 AM, delivery in 2 days.\nWe'll send tracking link and keep you updated throughout.\nLooking forward to working with you!",
                        quality: "good",
                        analytics: "Хорошо."
                    },
                    {
                        text: "All set, we're ready to go.",
                        quality: "weak",
                        analytics: "Слишком коротко."
                    }
                ]
            },
            {
                brokerResponse: "Perfect summary! Yes, this customer has 3-4 Dallas to Atlanta lanes weekly.\nIf you deliver on time with good communication, you'll be my first call.\nThey also have Dallas to Detroit, Dallas to Charlotte routes.\nI'm adding you to my preferred carrier list right now.\nSafe travels and text me when driver picks up tomorrow!",
                dispatcherPrompt: "💎 Отличные новости о будущих грузах! Завершите профессионально.",
                suggestions: [
                    {
                        text: "That's fantastic! 3-4 weekly lanes is exactly what we're looking for.\nWe run Dallas to Southeast regularly, so Detroit and Charlotte work perfect for us.\nYou'll get first text tomorrow at pickup with photos.\nThank you for the opportunity and trust - we won't let you down!\nFeel free to call anytime, we're here 24/7 to make your job easier.",
                        quality: "master",
                        analytics: "Отлично! Построение партнерства."
                    },
                    {
                        text: "Excellent! We'd love to handle those regular lanes.\nWill text you tomorrow at pickup, looking forward to working together!",
                        quality: "good",
                        analytics: "Хорошо."
                    },
                    {
                        text: "Great, will text you tomorrow.",
                        quality: "weak",
                        analytics: "Слишком коротко."
                    }
                ]
            },
            {
                brokerResponse: "I really appreciate your professionalism and attention to detail.\nThis is exactly the kind of carrier I need for my automotive customers.\nTalk to you tomorrow, looking forward to a great partnership!",
                outcome: {
                    type: "success",
                    quality: "master",
                    rate: "$2,300",
                    ratePerMile: "$2.95/mile",
                    relationship: "Preferred carrier - 3-4 weekly loads guaranteed",
                    dialogueTime: "12-15 minutes",
                    questionsAsked: "15+ detailed questions",
                    detailLevel: "very high",
                    futureOpportunity: "partnership",
                    weeklyLoads: "3-4 loads",
                    feedback: `🏆 МАСТЕР УРОВЕНЬ!

✅ ЧТО СДЕЛАНО ПРАВИЛЬНО:
- Показали специализацию в automotive с первого ответа - повысило доверие брокера
- Обосновали ставку через JIT требования и market rate - получили $200 больше posted rate
- Добавили ценность через GPS tracking, hourly updates, и on-time guarantee - выделились среди конкурентов
- Задали ВСЕ критические вопросы о pickup, delivery, securement, equipment - показали профессионализм
- Проактивно предложили добавить customer к tracking link - дополнительный сервис
- Подтвердили все детали в конце - избежали недопонимания
- Спросили про будущие возможности - обеспечили 3-4 груза в неделю

⚠️ ЧТО МОЖНО УЛУЧШИТЬ:
- Можно было спросить про backhaul возможности из Atlanta
- Можно было уточнить про insurance requirements заранее

💡 КЛЮЧЕВОЙ УРОК:
Детальная коммуникация + добавленная ценность (GPS, гарантии) = высокие ставки и долгосрочные отношения

🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:
Всегда показывайте специализацию, добавляйте ценность через сервис, задавайте детальные вопросы, и планируйте будущее сотрудничество. Брокеры платят больше за надежность и коммуникацию.`
                }
            }
        ]
    }
}
