// СИМУЛЬ - База диалогов для обучения диспетчеров
// Версия: Dialogue #5 - Hazmat (NEW DIALOG SYSTEM V2.0)
// Дата: 2026-03-07
// ПРАВИЛО: Диспетчер звонит первым! 6 вариантов качества в каждом шаге!

console.log('🔵 Loading scenarios-data-v5.js...');

// Dialogue #5: Hazmat - Houston TX → Chicago IL
// Hard difficulty, chemical materials transport
// NEW DIALOG SYSTEM V2.0

const scenario5 = {
    id: 5,
    route: "Houston TX → Chicago IL",
    distance: 1100,
    equipment: "Tanker",
    cargo: "Chemical materials (Class 3 Flammable)",
    weight: "44,000 lbs",
    deadline: "Pickup tomorrow 6 AM - 10 AM, Delivery in 2 days",
    brokerStyle: "Professional Hazmat broker",
    difficulty: "hard",

    initialMessage: "Good morning! This is calling from SafeHaul Logistics.\nI saw your load posting for Houston to Chicago Hazmat tanker load.\nCan you tell me more about this load?",

    paths: {
        master: [
            // ШАГ 1: MC verification + truck location
            {
                brokerQuestion: "Good morning! This is David from ChemTrans Brokers.\nYes, load is available.\nWhat's your MC number and where is your tanker right now?",
                dispatcherPrompt: "💎 Брокер проверяет MC и местоположение. Дайте точную информацию.",
                suggestions: [
                    {
                        text: "Good morning David! This is SafeHaul Logistics, MC 889944. Our tanker is in Houston right now, just finished unloading at the Port of Houston this morning around 7 AM. Driver is at the Love's truck stop on I-10, exit 770. Tank is cleaned, inspected, and ready for Class 3 Flammable. We can pick up tomorrow morning. What are the load details?",
                        quality: "excellent",
                        analytics: "✨ Отлично! MC номер, точное местоположение, время, готовность оборудования, профессионализм.",
                        path: "master"
                    },
                    {
                        text: "Good morning! MC 889944, SafeHaul Logistics. Tanker is in Houston, empty since this morning. At a truck stop near I-10. Tank is clean and ready for Hazmat. Available for pickup tomorrow. What's the schedule?",
                        quality: "good",
                        analytics: "✔️ Хорошо! MC, местоположение, готовность оборудования.",
                        path: "master"
                    },
                    {
                        text: "MC 889944. Tanker is in Houston now, empty and clean. We can pick up tomorrow.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовая информация, но достаточно.",
                        path: "master"
                    },
                    {
                        text: "MC 889944. Truck is somewhere in Houston area. Driver will be ready when you need him.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неточное местоположение, нет уверенности.",
                        path: "master"
                    },
                    {
                        text: "Why do you need all these details? Just give me the pickup address and rate!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Грубый тон, нет профессионализма.",
                        path: "reject1"
                    },
                    {
                        text: "Uh... let me find the MC number. And I need to call the driver to see where he is. Can I call you back?",
                        quality: "fail",
                        analytics: "❌ Провал. Не знает базовую информацию о своей компании и грузовике.",
                        path: "reject1"
                    }
                ]
            },
            // ШАГ 2: Hazmat endorsement verification
            {
                brokerQuestion: "MC verified, good safety rating.\nThis is Class 3 Flammable chemicals - does your driver have Hazmat endorsement on CDL?\nAnd tanker endorsement?",
                dispatcherPrompt: "💎 Брокер проверяет Hazmat сертификацию. Подтвердите квалификацию.",
                suggestions: [
                    {
                        text: "Absolutely! Our driver has both Hazmat and Tanker endorsements on his CDL. He's been hauling Class 3 Flammable materials for 8 years, over 500 Hazmat loads. His endorsements are current, renewed last year. He also completed the TSA background check. Very experienced with chemical transport and safety protocols.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Подтверждение обоих endorsements, опыт, детали сертификации.",
                        path: "master"
                    },
                    {
                        text: "Yes, driver has both Hazmat and Tanker endorsements on his CDL. Current and valid. He's been hauling Hazmat for several years. Very experienced with Class 3 materials.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Подтверждение endorsements и опыта.",
                        path: "master"
                    },
                    {
                        text: "Yes, he has Hazmat and Tanker endorsements. All current.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "I think he has Hazmat endorsement. Let me double-check the tanker one.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенность в квалификации водителя.",
                        path: "master"
                    },
                    {
                        text: "He's a professional driver! Of course he has all the endorsements!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Защитная реакция вместо конкретного ответа.",
                        path: "reject1"
                    },
                    {
                        text: "Actually, he only has the regular CDL. But he's a great driver! Can he get the Hazmat endorsement quickly?",
                        quality: "fail",
                        analytics: "❌ Провал. Нет требуемой сертификации для Hazmat груза.",
                        path: "reject1"
                    }
                ]
            },
            // ШАГ 3: Placard requirements discussion
            {
                brokerQuestion: "Good. For Class 3 Flammable, you'll need specific placards.\nDo you have Class 3 placards and understand the placarding requirements?",
                dispatcherPrompt: "💎 Брокер спрашивает о placards. Покажите знание требований.",
                suggestions: [
                    {
                        text: "Yes, we have Class 3 Flammable placards - the red diamond with flame symbol. We know they must be placed on all four sides of the tanker, visible from 50 feet. We also carry the UN identification number placards. Driver will display them immediately after loading and remove only after complete unloading and tank cleaning. We follow 49 CFR 172 placarding regulations.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Детальное знание placards, правил размещения, регуляций DOT.",
                        path: "master"
                    },
                    {
                        text: "Yes, we have Class 3 Flammable placards - red with flame symbol. We'll place them on all four sides of the tanker as required. Driver knows the proper placement procedures.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Знание placards и правил размещения.",
                        path: "master"
                    },
                    {
                        text: "Yes, we have Class 3 placards. Driver will put them on the tanker.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "We have some placards. I think they're the right ones for flammable materials.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенность в требованиях безопасности.",
                        path: "master"
                    },
                    {
                        text: "Placards are just stickers! We'll figure it out at pickup!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Пренебрежение требованиями безопасности.",
                        path: "reject2"
                    },
                    {
                        text: "Actually, we don't have Class 3 placards. Can the shipper provide them?",
                        quality: "fail",
                        analytics: "❌ Провал. Не готов к Hazmat перевозке, нет базового оборудования.",
                        path: "reject2"
                    }
                ]
            },
            // ШАГ 4: Routing restrictions and tunnel prohibitions
            {
                brokerQuestion: "Perfect. This route goes through several states.\nAre you aware of Hazmat routing restrictions and tunnel prohibitions?\nSome tunnels don't allow Class 3 materials.",
                dispatcherPrompt: "💎 Брокер проверяет знание маршрутных ограничений. Покажите понимание.",
                suggestions: [
                    {
                        text: "Absolutely! We're very familiar with Hazmat routing. Houston to Chicago goes through Louisiana, Mississippi, Tennessee, Kentucky, and Illinois. We'll avoid restricted tunnels - no Fort McHenry Tunnel, no tunnels in major cities. We use the Hazmat-approved routes on I-10, I-55, and I-57. Driver has the latest Hazmat routing guide and will check state-specific restrictions. We also have GPS with Hazmat routing mode.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Детальное знание маршрута, конкретные туннели, штаты, GPS.",
                        path: "master"
                    },
                    {
                        text: "Yes, we're aware of Hazmat routing restrictions. Driver will avoid prohibited tunnels and use approved Hazmat routes. We have GPS with Hazmat routing and the driver knows the major restrictions on this route.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Знание ограничений и инструментов навигации.",
                        path: "master"
                    },
                    {
                        text: "Yes, we know about tunnel restrictions. Driver will use Hazmat-approved routes.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое понимание.",
                        path: "master"
                    },
                    {
                        text: "I think there are some tunnel restrictions. Driver will figure it out on the road.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Нет конкретного плана, надежда на удачу.",
                        path: "master"
                    },
                    {
                        text: "Tunnel restrictions are overblown! Driver will take the fastest route!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Игнорирование требований безопасности и закона.",
                        path: "reject2"
                    },
                    {
                        text: "I didn't know about tunnel restrictions. Can you send me a list of which tunnels to avoid?",
                        quality: "fail",
                        analytics: "❌ Провал. Не знает базовых требований Hazmat перевозки.",
                        path: "reject2"
                    }
                ]
            },
            // ШАГ 5: Emergency response kit requirements
            {
                brokerQuestion: "Excellent knowledge.\nDo you have emergency response kit, spill containment equipment, and emergency contact numbers?\nThis is required for Hazmat transport.",
                dispatcherPrompt: "💎 Брокер спрашивает о safety equipment. Подтвердите готовность.",
                suggestions: [
                    {
                        text: "Yes, we're fully equipped! Our tanker has complete emergency response kit: fire extinguisher (20-lb ABC type), spill containment kit with absorbent pads and booms, emergency triangles, first aid kit. Driver has emergency response guidebook (ERG), CHEMTREC emergency number (1-800-424-9300), and shipper's 24-hour emergency contact. He's trained in spill response procedures and knows to call 911 and CHEMTREC immediately if incident occurs.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Полный список оборудования, номера экстренных служб, процедуры.",
                        path: "master"
                    },
                    {
                        text: "Yes, we have complete emergency response kit: fire extinguisher, spill containment equipment, emergency triangles. Driver has emergency response guidebook and CHEMTREC number. He's trained in emergency procedures.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Оборудование и знание процедур.",
                        path: "master"
                    },
                    {
                        text: "Yes, we have emergency response kit and spill containment equipment. Driver has emergency numbers.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "We have fire extinguisher and some emergency equipment. Driver will get emergency numbers from shipper.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неполная готовность, надежда на shipper.",
                        path: "master"
                    },
                    {
                        text: "We have basic safety equipment. If something happens, driver will call 911!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Минимальная подготовка, пренебрежение требованиями.",
                        path: "reject2"
                    },
                    {
                        text: "What kind of emergency equipment do we need? Can the shipper provide it?",
                        quality: "fail",
                        analytics: "❌ Провал. Не готов к Hazmat перевозке, не знает требований.",
                        path: "reject2"
                    }
                ]
            },
            // ШАГ 6: Rate negotiation
            {
                brokerQuestion: "Great, you're well-prepared.\nFor this load: 1100 miles, Houston to Chicago, 44,000 lbs Class 3 Flammable.\nPickup tomorrow 6-10 AM, delivery in 2 days.\nI'm offering $3,200 all-in. That's $2.91 per mile.\nWhat do you think?",
                dispatcherPrompt: "💎 Брокер предложил ставку. Оцените и ответьте профессионально.",
                suggestions: [
                    {
                        text: "I appreciate the offer, David. $3,200 is reasonable, but for Class 3 Flammable Hazmat with tanker, considering the specialized endorsements required, routing restrictions, and safety compliance, the market rate is typically $3.00-$3.20 per mile. Could we do $3,500? That's $3.18/mile, which reflects the Hazmat premium and our experience. We're ready to move immediately and guarantee on-time delivery with full compliance.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Профессиональные переговоры с обоснованием, рыночные ставки, ценность.",
                        path: "master"
                    },
                    {
                        text: "Thank you for the offer. For Hazmat tanker load with all the special requirements, could we do $3,500? That's $3.18/mile, which is fair for Class 3 Flammable. We're experienced and ready to go.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Вежливые переговоры с обоснованием.",
                        path: "master"
                    },
                    {
                        text: "Can we do $3,500? That would work better for us on this Hazmat load.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовая попытка переговоров.",
                        path: "master"
                    },
                    {
                        text: "I don't know... $3,200 seems a bit low for Hazmat. Maybe $3,400?",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенность, нет обоснования.",
                        path: "master"
                    },
                    {
                        text: "$3,200? That's insulting for Hazmat! I need at least $4,000 or I'm not interested!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Грубость, нереалистичные требования.",
                        path: "reject3"
                    },
                    {
                        text: "I'll take it! $3,200 works! When can we pick up?",
                        quality: "fail",
                        analytics: "❌ Провал. Принял первое предложение без переговоров, потерял $300.",
                        path: "master"
                    }
                ]
            },
            // ШАГ 7: Detention/layover terms
            {
                brokerQuestion: "I can do $3,500 final. That's $3.18/mile for Hazmat.\nDetention is $100/hour after 2 hours free time.\nLayover $300/day if needed.\nSound good?",
                dispatcherPrompt: "💎 Брокер дал финальную ставку и условия. Подтвердите.",
                suggestions: [
                    {
                        text: "Perfect! $3,500 at $3.18/mile works great. Detention $100/hour after 2 hours free time - that's fair. Layover $300/day if needed - understood. Just to confirm: detention starts after 2 hours at both pickup and delivery, correct? And we'll document all wait times with signed BOL timestamps. This all sounds good, let's move forward with pickup details.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Подтверждение, уточнение деталей, документация.",
                        path: "master"
                    },
                    {
                        text: "Great! $3,500 works. Detention $100/hour after 2 hours, layover $300/day - understood. Let's get the pickup details.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Четкое подтверждение условий.",
                        path: "master"
                    },
                    {
                        text: "Yes, that works. $3,500, detention and layover terms are fine.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое согласие.",
                        path: "master"
                    },
                    {
                        text: "Okay, I guess that's acceptable. What's the pickup address?",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенность, нет энтузиазма.",
                        path: "master"
                    },
                    {
                        text: "Only 2 hours free time? That's not enough for Hazmat loading! I need at least 4 hours!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Нереалистичные требования после согласования ставки.",
                        path: "reject3"
                    },
                    {
                        text: "Wait, what's detention pay? Can you explain all these terms?",
                        quality: "fail",
                        analytics: "❌ Провал. Не знает базовую терминологию индустрии.",
                        path: "reject1"
                    }
                ]
            },
            // ШАГ 8: Pickup details + loading procedures
            {
                brokerQuestion: "Perfect! Pickup details:\nChemical Solutions Inc\n7800 Port of Houston Blvd, Houston TX 77029\nContact: Safety Manager Mike Chen 713-555-0199\nPickup tomorrow 6 AM - 10 AM\nWhat questions do you have about pickup?",
                dispatcherPrompt: "💎 Брокер дал pickup детали. Задайте важные вопросы.",
                suggestions: [
                    {
                        text: "Great! I have the address: 7800 Port of Houston Blvd, Houston TX 77029. Contact Mike Chen at 713-555-0199, tomorrow 6-10 AM. Few questions: What's the loading time estimate? Do we need any special permits or documentation? Is there a specific gate or entrance for tanker trucks? Should driver call Mike before arrival or just show up during the window? Any special safety procedures at this facility?",
                        quality: "excellent",
                        analytics: "✨ Отлично! Подтверждение деталей + 5 важных вопросов о процедурах.",
                        path: "master"
                    },
                    {
                        text: "Got it. 7800 Port of Houston Blvd, Mike Chen 713-555-0199, tomorrow 6-10 AM. How long does loading take? Should driver call ahead? Any special procedures?",
                        quality: "good",
                        analytics: "✔️ Хорошо! Подтверждение + важные вопросы.",
                        path: "master"
                    },
                    {
                        text: "Okay, I have the address and contact. How long is loading?",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовый вопрос.",
                        path: "master"
                    },
                    {
                        text: "Got the address. We'll figure out the rest when driver gets there.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Не собирает важную информацию.",
                        path: "master"
                    },
                    {
                        text: "Just send me the rate confirmation! Driver will handle everything at pickup!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Нет интереса к деталям, непрофессионально.",
                        path: "reject1"
                    },
                    {
                        text: "Okay, we'll be there. What's next?",
                        quality: "fail",
                        analytics: "❌ Провал. Не задал ни одного вопроса о процедурах.",
                        path: "master"
                    }
                ]
            },
            // ШАГ 9: Delivery details + safety protocols
            {
                brokerQuestion: "Loading takes 90 minutes with safety checks.\nThey provide all placards and emergency response documentation.\nDriver must attend safety briefing before loading.\nNow for delivery - any questions about the delivery location?",
                dispatcherPrompt: "💎 Брокер дал loading информацию. Спросите о delivery.",
                suggestions: [
                    {
                        text: "Perfect! 90 minutes loading, safety briefing required, they provide placards and emergency docs - all clear. For delivery: What's the complete address and contact? What's the delivery time window? How long does unloading take? Should driver call ahead? Are there any special unloading procedures or safety requirements at delivery? Any gate codes or special instructions?",
                        quality: "excellent",
                        analytics: "✨ Отлично! Подтверждение loading + 6 детальных вопросов о delivery.",
                        path: "master"
                    },
                    {
                        text: "Understood on loading. For delivery: What's the address and contact? What's the time window? Should driver call ahead? How long is unloading?",
                        quality: "good",
                        analytics: "✔️ Хорошо! Важные вопросы о delivery.",
                        path: "master"
                    },
                    {
                        text: "Got it on loading. What's the delivery address and time window?",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовые вопросы.",
                        path: "master"
                    },
                    {
                        text: "Okay. Where do we deliver?",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Минимальный интерес к деталям.",
                        path: "master"
                    },
                    {
                        text: "90 minutes loading? That's too long! We need to get on the road faster!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Жалобы на safety procedures.",
                        path: "reject2"
                    },
                    {
                        text: "Just give me the delivery address. Driver will figure it out.",
                        quality: "fail",
                        analytics: "❌ Провал. Не собирает критическую информацию.",
                        path: "master"
                    }
                ]
            },
            // ШАГ 10: Final confirmation + outcome
            {
                brokerQuestion: "Delivery:\nChicago Chemical Depot\n5500 S Cicero Ave, Chicago IL 60638\nContact: Receiving Supervisor Lisa Martinez 773-555-0244\nDelivery window: Day after tomorrow 8 AM - 6 PM\nUnloading takes 2 hours with safety inspection.\nCall Lisa 4 hours before arrival.\nAny final questions?",
                dispatcherPrompt: "💎 Брокер дал delivery детали. Подтвердите все и резюмируйте.",
                suggestions: [
                    {
                        text: "Perfect! Let me confirm everything: Pickup tomorrow 6-10 AM at Chemical Solutions Inc, 7800 Port of Houston Blvd, Mike Chen 713-555-0199. Loading 90 minutes with safety briefing. Delivery day after tomorrow 8 AM-6 PM at Chicago Chemical Depot, 5500 S Cicero Ave, Lisa Martinez 773-555-0244. Unloading 2 hours, call 4 hours ahead. 1100 miles, $3,500 at $3.18/mile, detention $100/hr after 2 hours, layover $300/day. Class 3 Flammable, Hazmat routing, all safety equipment ready. We're 100% confirmed! Sending NOA now.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Полное профессиональное резюме всех деталей. МАСТЕР!",
                        path: "master"
                    },
                    {
                        text: "Confirmed! Chicago Chemical Depot, Lisa 773-555-0244, day after tomorrow 8 AM-6 PM, call 4 hours ahead. Pickup tomorrow Houston, delivery Chicago, $3,500 all-in. Driver has all safety equipment and will follow Hazmat routing. Sending NOA now. Thank you!",
                        quality: "good",
                        analytics: "✔️ Хорошо! Хорошее резюме ключевых деталей.",
                        path: "master"
                    },
                    {
                        text: "Got it. Lisa 773-555-0244, day after tomorrow 8-6 PM, call ahead. Pickup tomorrow, delivery in 2 days. $3,500. Sending NOA.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "Okay, I think I have everything. We'll be there. Sending confirmation.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Нет резюме, неуверенность.",
                        path: "master"
                    },
                    {
                        text: "Yeah, we got it all. Just send the rate con already!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Грубость в конце диалога.",
                        path: "reject1"
                    },
                    {
                        text: "Wait, what was the pickup time again? And the rate?",
                        quality: "fail",
                        analytics: "❌ Провал. Не запомнил критические детали.",
                        path: "reject1"
                    }
                ]
            },
            // OUTCOME: Final result
            {
                brokerResponse: "Excellent! You're extremely professional and well-prepared for Hazmat transport.\nRate confirmation sent to SafeHaul Logistics MC 889944.\nI'm impressed with your knowledge of DOT regulations and safety protocols.\nIf this load goes smoothly, I have 3-4 Hazmat loads weekly on this lane.\nLooking forward to a long partnership!\nGood luck and stay safe!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$3,500",
                    ratePerMile: "$3.18/mile",
                    relationship: "Excellent - Weekly Hazmat loads opportunity",
                    dialogueTime: "10-12 minutes",
                    questionsAsked: "15+ professional questions about safety and procedures",
                    detailLevel: "very high",
                    futureOpportunity: "repeat",
                    weeklyLoads: "3-4 Hazmat loads if perform well",
                    feedback: "🏆 МАСТЕР УРОВЕНЬ HAZMAT!\n\n✅ ЧТО СДЕЛАНО ПРАВИЛЬНО:\n- Представились профессионально с MC номером и точным местоположением\n- Подтвердили Hazmat и Tanker endorsements с деталями опыта\n- Показали глубокое знание Class 3 Flammable placarding требований\n- Продемонстрировали понимание Hazmat routing и tunnel restrictions\n- Подтвердили полную готовность emergency response equipment\n- Провели профессиональные переговоры о ставке с обоснованием\n- Подтвердили detention/layover условия с уточнениями\n- Задали все критические вопросы о loading и unloading procedures\n- Собрали полную информацию о pickup и delivery с safety protocols\n- Сделали детальное резюме всех деталей перед финальным подтверждением\n\n💡 КЛЮЧЕВОЙ УРОК:\nHazmat перевозки требуют демонстрации глубоких знаний DOT regulations, safety protocols, и emergency procedures. Брокеры платят premium rates ($3.18/mile vs стандартные $2.50/mile) за carriers которые показывают профессионализм и compliance. Детальное знание placarding, routing restrictions, и emergency response открывает доступ к высокооплачиваемым weekly Hazmat loads.\n\n🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:\nПри работе с Hazmat loads всегда подчеркивайте: 1) Current endorsements и TSA background check, 2) Знание 49 CFR regulations, 3) Emergency response equipment и CHEMTREC number, 4) Hazmat routing GPS и tunnel restrictions, 5) Temperature monitoring для reactive materials. Это строит репутацию reliable Hazmat carrier и ведет к premium rates и repeat business."
                }
            }
        ],
        reject1: [
            {},
            {
                brokerResponse: "I appreciate you calling, but I need to be honest with you.\n\nFor Class 3 Flammable Hazmat loads, I need carriers who are fully prepared and professional. Based on our conversation, I have concerns about either your driver's qualifications or your company's readiness for Hazmat transport.\n\nHazmat loads require:\n- Current Hazmat and Tanker endorsements (not 'I think' or 'let me check')\n- Immediate knowledge of your MC number and truck location\n- Professional communication without aggressive or defensive responses\n- Understanding of basic industry terminology\n\nI'm going to pass on this one. I'd recommend:\n1. Verify your driver has current Hazmat endorsement with TSA background check\n2. Get familiar with 49 CFR Hazmat regulations\n3. Ensure you know your company's MC number and equipment status at all times\n4. Practice professional communication - brokers ask questions for safety and compliance, not to annoy you\n\nOnce you're better prepared for Hazmat transport, feel free to call back. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    ratePerMile: "$0/mile",
                    relationship: "Rejected - Unprepared for Hazmat",
                    dialogueTime: "2-3 minutes",
                    questionsAsked: "Few or defensive responses",
                    detailLevel: "none",
                    futureOpportunity: "none",
                    weeklyLoads: "No loads",
                    feedback: "❌ ОТКАЗ: НЕ ГОТОВ К HAZMAT ПЕРЕВОЗКАМ\n\n✅ ЧТО НУЖНО БЫЛО СДЕЛАТЬ:\n- Знать свой MC номер наизусть - это базовая информация о вашей компании\n- Точно знать местоположение и статус своих грузовиков в любой момент\n- Подтвердить Hazmat и Tanker endorsements с уверенностью и деталями\n- Отвечать профессионально на вопросы брокера о квалификации\n- Понимать базовую терминологию индустрии (detention, layover, placards)\n- Никогда не быть агрессивным или защитным когда брокер проверяет compliance\n\n💡 КЛЮЧЕВОЙ УРОК:\nHazmat loads - это высокооплачиваемые грузы ($3.18/mile vs $2.50/mile стандарт), но они требуют строгого compliance с DOT regulations. Брокеры несут юридическую ответственность за выбор qualified carriers. Если вы не можете подтвердить Hazmat endorsement, не знаете свой MC номер, или реагируете агрессивно на вопросы о безопасности - брокер ОБЯЗАН отказать. Это не личное - это закон и страховка.\n\n🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:\nПеред звонком по Hazmat load: 1) Проверьте что driver имеет current Hazmat endorsement и TSA background check, 2) Знайте точное местоположение truck и статус equipment, 3) Имейте список emergency response equipment, 4) Будьте готовы обсудить placarding, routing restrictions, и safety protocols, 5) Отвечайте на вопросы о compliance спокойно и профессионально. Hazmat certification - это не формальность, это серьезная ответственность. Один incident может закрыть вашу компанию."
                }
            }
        ],
        reject2: [
            {},
            {
                brokerResponse: "I'm going to stop you right there.\n\nYour attitude toward safety requirements is a major red flag. When you say things like 'placards are just stickers' or 'tunnel restrictions are overblown' or dismiss emergency equipment requirements, you're telling me you don't take Hazmat safety seriously.\n\nThis isn't about being picky - this is about DOT regulations, public safety, and legal liability. Class 3 Flammable materials can cause catastrophic accidents if not handled properly.\n\nI cannot and will not book a carrier who:\n- Dismisses placarding requirements (49 CFR 172 - federal law, not suggestions)\n- Ignores Hazmat routing restrictions (tunnels prohibit Class 3 for public safety)\n- Doesn't have proper emergency response equipment (required by law)\n- Shows impatience with safety briefings and loading procedures\n\nOne Hazmat incident can result in:\n- Fines up to $75,000 per violation\n- Criminal charges for the driver and carrier\n- Shutdown of your company by FMCSA\n- Environmental cleanup costs in millions\n- Loss of life\n\nI'm passing on this load. I'd strongly recommend you take Hazmat training seriously before attempting these loads. This is not the lane for shortcuts.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    ratePerMile: "$0/mile",
                    relationship: "Rejected - Safety concerns",
                    dialogueTime: "3-4 minutes",
                    questionsAsked: "Dismissive responses to safety questions",
                    detailLevel: "none",
                    futureOpportunity: "none",
                    weeklyLoads: "No loads",
                    feedback: "❌ ОТКАЗ: ПРЕНЕБРЕЖЕНИЕ ТРЕБОВАНИЯМИ БЕЗОПАСНОСТИ\n\n✅ ЧТО НУЖНО БЫЛО СДЕЛАТЬ:\n- Относиться к placarding requirements серьезно - это федеральный закон 49 CFR 172\n- Понимать что Hazmat routing restrictions существуют для защиты населения\n- Иметь полный emergency response kit - это не опция, это требование\n- Принимать safety briefings и loading procedures как необходимую часть работы\n- Никогда не говорить что safety requirements 'overblown' или 'just formalities'\n- Показывать что вы понимаете серьезность перевозки опасных материалов\n\n💡 КЛЮЧЕВОЙ УРОК:\nHazmat safety requirements - это не бюрократия для раздражения водителей. Это результат десятилетий accidents, injuries, и deaths. Каждое правило написано кровью. Когда вы перевозите Class 3 Flammable chemicals, вы везете материалы которые могут взорваться, вызвать пожар, или отравить целый район. Placards предупреждают emergency responders. Routing restrictions защищают тысячи людей в туннелях. Emergency equipment может спасти жизни при spill.\n\n🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:\nБрокеры и shippers НЕМЕДЛЕННО отказывают carriers которые показывают пренебрежение к safety. Почему? Потому что: 1) Broker несет legal liability если происходит incident, 2) Insurance может отказать в покрытии если carrier нарушил safety protocols, 3) FMCSA может оштрафовать всех участников цепочки, 4) Один serious incident может закрыть broker и carrier навсегда. Если вы хотите возить Hazmat и получать premium rates ($3.18/mile), вы ОБЯЗАНЫ относиться к safety как к приоритету #1. Нет исключений. Нет shortcuts. Жизни людей зависят от вашего профессионализма."
                }
            }
        ],
        reject3: [
            {},
            {
                brokerResponse: "I understand you want a higher rate, but let me be straight with you.\n\nYou're asking for $4,000+ on a 1100-mile load. That's $3.64/mile. For context:\n- Current market rate for Hazmat tanker: $2.90-$3.20/mile\n- My offer of $3,500 ($3.18/mile) is already at the TOP of the market\n- Even with Hazmat premium, $3.64/mile is 15-20% above market\n\nI appreciate that you have the qualifications and equipment, but I have a budget from my customer. I can't pay rates that are significantly above market just because you demand them.\n\nIf you had said 'Could we do $3,600?' with some justification, we might have found middle ground. But demanding $4,000 or saying my offer is 'insulting' shows you're either:\n1. Not familiar with current market rates\n2. Trying to take advantage\n3. Not serious about the load\n\nI'm going to move on to other carriers. Here's some advice:\n- Research current market rates before negotiating (DAT, Truckstop.com)\n- Negotiate professionally with justification, not demands\n- Understand that Hazmat premium is already built into $3.18/mile\n- Know when a rate is fair and accept it\n\nGood luck finding loads at your target rate. I'll keep your info if rates change significantly.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    ratePerMile: "$0/mile",
                    relationship: "Rejected - Unrealistic expectations",
                    dialogueTime: "5-6 minutes",
                    questionsAsked: "Some questions, but failed at negotiation",
                    detailLevel: "medium",
                    futureOpportunity: "unlikely",
                    weeklyLoads: "No loads",
                    feedback: "❌ ОТКАЗ: НЕРЕАЛИСТИЧНЫЕ ТРЕБОВАНИЯ ПО СТАВКЕ\n\n✅ ЧТО НУЖНО БЫЛО СДЕЛАТЬ:\n- Исследовать рыночные ставки ПЕРЕД переговорами (DAT, Truckstop.com показывают $2.90-$3.20/mile для Hazmat)\n- Понимать что $3,500 ($3.18/mile) уже включает Hazmat premium над стандартными $2.50/mile\n- Вести переговоры профессионально: 'Could we do $3,600?' вместо 'I need $4,000!'\n- Обосновывать запрос: 'We have 8 years Hazmat experience' вместо 'That's insulting!'\n- Знать когда принять fair offer - $3,500 это TOP of market для этого lane\n- Не быть агрессивным когда broker объясняет budget constraints\n\n💡 КЛЮЧЕВОЙ УРОК:\nЗнание рыночных ставок - это КРИТИЧЕСКИЙ навык диспетчера. Если вы требуете $4,000 ($3.64/mile) когда market rate $2.90-$3.20/mile, вы показываете что: 1) Не знаете рынок, 2) Не уважаете broker's budget, 3) Не серьезны о получении load. Brokers работают с margins 10-15%. Они не могут платить на 20% выше рынка. Aggressive negotiation без обоснования = instant rejection.\n\n🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:\nПеред каждым звонком: 1) Проверьте текущие ставки на lane в DAT или Truckstop.com, 2) Поймите что 'fair rate' для данного equipment и cargo, 3) Определите вашу minimum acceptable rate, 4) Определите вашу target rate (5-10% выше fair rate), 5) Подготовьте обоснование (experience, equipment, service). Во время переговоров: используйте фразы 'Based on current market rates...' или 'Considering the Hazmat requirements...' вместо 'I need...' или 'That's too low!'. Если broker предлагает fair rate на top of market - БЕРИТЕ ЕГО. Жадность = $0. Профессионализм = $3,500 + repeat business."
                }
            }
        ]
    }
};

// Add to global scenarios array
if (typeof allScenarios !== 'undefined') {
    allScenarios.push(scenario5);
    console.log('✅ Scenario #5 loaded: Hazmat - Houston TX → Chicago IL');
    console.log('📊 Total scenarios:', allScenarios.length);
} else {
    // For testing environment
    if (typeof module !== 'undefined' && module.exports) {
        global.allScenarios = global.allScenarios || [];
        global.allScenarios.push(scenario5);
    }
}
