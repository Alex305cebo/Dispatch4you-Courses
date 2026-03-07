// СИМУЛЬ - База диалогов для обучения диспетчеров
// Версия: Dialogue #6 - Auto Transport (NEW DIALOG SYSTEM V2.0)
// Дата: 2026-03-07
// ПРАВИЛО: Диспетчер звонит первым! 6 вариантов качества в каждом шаге!

console.log('🔵 Loading scenarios-data-v6.js...');

// Dialogue #6: Auto Transport - Detroit MI → Phoenix AZ
// Medium-hard difficulty, luxury vehicles transport
// NEW DIALOG SYSTEM V2.0

const scenario6 = {
    id: 6,
    route: "Detroit MI → Phoenix AZ",
    distance: 1900,
    equipment: "Car Carrier (9-car capacity)",
    cargo: "Luxury vehicles (Tesla, BMW, Mercedes)",
    weight: "65,000 lbs (9 vehicles)",
    deadline: "Pickup tomorrow 8 AM - 12 PM, Delivery in 4 days",
    brokerStyle: "Professional auto transport broker",
    difficulty: "medium-hard",

    initialMessage: "Good morning! This is calling from Premier Auto Transport.\nI saw your load posting for Detroit to Phoenix car carrier load.\nCan you tell me more about this shipment?",

    paths: {
        master: [
            // ШАГ 1: MC verification + equipment availability
            {
                brokerQuestion: "Good morning! This is Sarah from AutoLink Brokers.\nYes, the load is available.\nWhat's your MC number and do you have a car carrier available right now?",
                dispatcherPrompt: "💎 Брокер проверяет MC и наличие оборудования. Дайте точную информацию.",
                suggestions: [
                    {
                        text: "Good morning Sarah! This is Premier Auto Transport, MC 776655. We have a 9-car enclosed carrier available right now in Detroit area. Just finished delivering 8 vehicles to a dealership in Dearborn this morning. Carrier is empty, inspected, and ready for luxury vehicles. We specialize in high-value auto transport with full insurance coverage. Can pick up tomorrow morning. What are the vehicle details?",
                        quality: "excellent",
                        analytics: "✨ Отлично! MC номер, точное местоположение, enclosed carrier, специализация, профессионализм.",
                        path: "master"
                    },
                    {
                        text: "Good morning! MC 776655, Premier Auto Transport. We have a 9-car enclosed carrier in Detroit, empty and ready. Just finished a delivery this morning. Available for pickup tomorrow. What vehicles are we transporting?",
                        quality: "good",
                        analytics: "✔️ Хорошо! MC, оборудование, готовность.",
                        path: "master"
                    },
                    {
                        text: "MC 776655. We have a car carrier in Detroit, empty and ready for pickup tomorrow.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовая информация.",
                        path: "master"
                    },
                    {
                        text: "MC 776655. We have a carrier somewhere in Michigan. Should be available.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неточное местоположение, неуверенность.",
                        path: "master"
                    },
                    {
                        text: "Why all these questions? Just tell me the rate and pickup address!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Грубый тон, нет профессионализма.",
                        path: "reject1"
                    },
                    {
                        text: "Uh... let me find the MC number. And I need to check if we have a carrier available. Can I call you back?",
                        quality: "fail",
                        analytics: "❌ Провал. Не знает базовую информацию о компании и оборудовании.",
                        path: "reject1"
                    }
                ]
            },
            // ШАГ 2: Cargo insurance verification
            {
                brokerQuestion: "MC verified, excellent safety rating.\nThese are luxury vehicles - Tesla Model S, BMW 7 Series, Mercedes S-Class.\nTotal value around $900,000.\nWhat's your cargo insurance coverage limit?",
                dispatcherPrompt: "💎 Брокер проверяет страховку. Подтвердите достаточное покрытие.",
                suggestions: [
                    {
                        text: "We carry $1 million cargo insurance for high-value auto transport. Policy covers luxury vehicles up to $150K per vehicle. We can provide certificate of insurance immediately. Insurance is with Progressive Commercial - A+ rated carrier.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Детальное покрытие, per-vehicle limit, готовность предоставить сертификат.",
                        path: "master"
                    },
                    {
                        text: "We have $1 million cargo insurance for luxury vehicles, up to $150K per vehicle. Can provide certificate of insurance right away. Coverage designed for high-value transport.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Достаточное покрытие и готовность документов.",
                        path: "master"
                    },
                    {
                        text: "We have $1 million cargo insurance. Can send certificate if needed.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "We have insurance. I think it's $500K or maybe $1 million. Let me check.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенность в критической информации.",
                        path: "master"
                    },
                    {
                        text: "Insurance is insurance! We're covered! Why does it matter how much?",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Пренебрежение важными требованиями.",
                        path: "reject1"
                    },
                    {
                        text: "We have $300K cargo insurance. That should be enough, right?",
                        quality: "fail",
                        analytics: "❌ Провал. Недостаточное покрытие для $900K груза.",
                        path: "reject1"
                    }
                ]
            },
            // ШАГ 3: Vehicle inspection procedures
            {
                brokerQuestion: "Perfect insurance coverage.\nFor luxury vehicles, inspection and documentation are critical.\nWhat's your process for vehicle inspection and damage documentation?",
                dispatcherPrompt: "💎 Брокер спрашивает о процедурах осмотра. Покажите профессиональный подход.",
                suggestions: [
                    {
                        text: "We do comprehensive 360-degree inspection. Driver takes 20-30 photos of each vehicle from all angles. We document every scratch or dent on detailed condition report. Customer signs at pickup. We use mobile app with timestamps and GPS tags. Same process at delivery.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Детальный процесс, количество фото, технология, track record.",
                        path: "master"
                    },
                    {
                        text: "We do complete vehicle inspection with 20+ photos from all angles. Document every existing damage on condition report, customer signs at pickup and delivery. We use timestamped photos and detailed paperwork.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Хороший процесс документации.",
                        path: "master"
                    },
                    {
                        text: "We take photos of each vehicle and document condition. Customer signs at pickup and delivery.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовый процесс.",
                        path: "master"
                    },
                    {
                        text: "Driver takes some photos and notes any damage. Standard procedure.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неконкретный процесс.",
                        path: "master"
                    },
                    {
                        text: "We'll take a few photos. If there's damage, customer can file a claim!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Минимальная ответственность.",
                        path: "reject2"
                    },
                    {
                        text: "Do we really need to take photos? These are new cars from dealerships, they're in perfect condition!",
                        quality: "fail",
                        analytics: "❌ Провал. Не понимает важность документации.",
                        path: "reject2"
                    }
                ]
            },
            // ШАГ 4: Enclosed vs open transport discussion
            {
                brokerQuestion: "Excellent documentation process.\nFor these luxury vehicles, the customer is requesting enclosed transport.\nYou mentioned enclosed carrier - can you confirm it's fully enclosed, not open?",
                dispatcherPrompt: "💎 Брокер уточняет тип транспорта. Подтвердите enclosed carrier.",
                suggestions: [
                    {
                        text: "Absolutely! Our carrier is fully enclosed - hard-sided walls, roof, and rear door. Not a soft-side or tarp. Vehicles completely protected from weather and road debris. We use hydraulic lift system for loading. Perfect for luxury vehicles.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Детальное описание enclosed carrier, защита, loading system.",
                        path: "master"
                    },
                    {
                        text: "Yes, fully enclosed carrier with hard sides, roof, and door. Complete protection from weather and road debris. Hydraulic lift system for safe loading. Designed for luxury vehicles.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Подтверждение enclosed и ключевых features.",
                        path: "master"
                    },
                    {
                        text: "Yes, it's fully enclosed carrier. Vehicles are protected inside.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "It's enclosed. Well, it has a cover. Should be fine for these cars.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенность в типе оборудования.",
                        path: "master"
                    },
                    {
                        text: "Enclosed, open - what's the difference? Cars will be fine either way!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Не понимает требования клиента.",
                        path: "reject2"
                    },
                    {
                        text: "Actually, we have an open carrier. But we can cover the cars with tarps if it rains!",
                        quality: "fail",
                        analytics: "❌ Провал. Не имеет требуемого enclosed оборудования.",
                        path: "reject2"
                    }
                ]
            },
            // ШАГ 5: Luxury vehicle experience
            {
                brokerQuestion: "Perfect equipment for luxury transport.\nHow much experience does your company have with high-value vehicles?\nAny references or track record you can share?",
                dispatcherPrompt: "💎 Брокер проверяет опыт. Продемонстрируйте квалификацию.",
                suggestions: [
                    {
                        text: "We specialize in luxury vehicle transport. Been in business 7 years, transported over 3,000 high-value vehicles. Regular contracts with BMW, Mercedes, and Tesla dealerships. Zero damage claims. A+ BBB rating. Can provide references.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Годы опыта, количество перевозок, клиенты, track record, references.",
                        path: "master"
                    },
                    {
                        text: "We've been transporting luxury vehicles for 7 years. Over 3,000 high-value cars delivered. Work regularly with BMW, Mercedes, and Tesla dealerships. Zero damage claims. Can provide references if needed.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Опыт и track record.",
                        path: "master"
                    },
                    {
                        text: "We have several years of experience with luxury vehicles. Transported many high-value cars.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение опыта.",
                        path: "master"
                    },
                    {
                        text: "We've done some luxury car transport. Driver is experienced.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неконкретный опыт.",
                        path: "master"
                    },
                    {
                        text: "A car is a car! We've been hauling vehicles for years! These aren't that special!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Пренебрежение ценностью груза.",
                        path: "reject2"
                    },
                    {
                        text: "This would be our first luxury vehicle load. But we're good drivers! How hard can it be?",
                        quality: "fail",
                        analytics: "❌ Провал. Нет опыта с high-value cargo.",
                        path: "reject2"
                    }
                ]
            },
            // ШАГ 6: Rate negotiation
            {
                brokerQuestion: "Impressive track record and experience.\nFor this load: 1900 miles, Detroit to Phoenix, 9 luxury vehicles.\nPickup tomorrow 8 AM - 12 PM, delivery in 4 days.\nI'm offering $5,000 all-in. That's $2.63 per mile.\nWhat do you think?",
                dispatcherPrompt: "💎 Брокер предложил ставку. Оцените и ответьте профессионально.",
                suggestions: [
                    {
                        text: "I appreciate the offer, Sarah. $5,000 is a starting point, but for enclosed car carrier with 9 luxury vehicles totaling $900K value, considering the specialized equipment, $1 million insurance, comprehensive inspection process, and our 7-year track record with zero claims, the market rate for enclosed luxury transport is typically $2.75-$3.00 per mile. Could we do $5,500? That's $2.89/mile, which reflects the enclosed transport premium and high-value cargo handling. We guarantee on-time delivery with white-glove service and complete documentation.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Профессиональные переговоры с обоснованием, рыночные ставки, ценность.",
                        path: "master"
                    },
                    {
                        text: "Thank you for the offer. For enclosed luxury vehicle transport with $900K cargo value and our experience, could we do $5,500? That's $2.89/mile, which is fair for this specialized service. We're ready to move immediately.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Вежливые переговоры с обоснованием.",
                        path: "master"
                    },
                    {
                        text: "Can we do $5,500? That would work better for enclosed transport of luxury vehicles.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовая попытка переговоров.",
                        path: "master"
                    },
                    {
                        text: "I don't know... $5,000 seems low for luxury cars. Maybe $5,400?",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенность, нет обоснования.",
                        path: "master"
                    },
                    {
                        text: "$5,000? That's insulting for $900K worth of vehicles! I need at least $6,500 or I'm not interested!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Грубость, нереалистичные требования.",
                        path: "reject3"
                    },
                    {
                        text: "I'll take it! $5,000 works! When can we pick up?",
                        quality: "fail",
                        analytics: "❌ Провал. Принял первое предложение без переговоров, потерял $500.",
                        path: "master"
                    }
                ]
            },
            // ШАГ 7: Detention/layover terms
            {
                brokerQuestion: "I can do $5,500 final. That's $2.89/mile for enclosed luxury transport.\nDetention is $75/hour after 2 hours free time at pickup and delivery.\nLayover $250/day if needed.\nSound good?",
                dispatcherPrompt: "💎 Брокер дал финальную ставку и условия. Подтвердите.",
                suggestions: [
                    {
                        text: "Perfect! $5,500 at $2.89/mile works great for us. Detention $75/hour after 2 hours free time - that's fair for both pickup and delivery. Layover $250/day if needed - understood. Just to confirm: the 2 hours free time applies to loading all 9 vehicles at pickup, and unloading at delivery, correct? And we'll document all wait times with signed timestamps on the BOL. This all sounds good, let's move forward with the pickup details.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Подтверждение, уточнение деталей, документация.",
                        path: "master"
                    },
                    {
                        text: "Great! $5,500 works. Detention $75/hour after 2 hours, layover $250/day - understood. Let's get the pickup details.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Четкое подтверждение условий.",
                        path: "master"
                    },
                    {
                        text: "Yes, that works. $5,500, detention and layover terms are fine.",
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
                        text: "Only 2 hours free time for loading 9 luxury vehicles? That's not enough! I need at least 4 hours!",
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
            // ШАГ 8: Pickup details + vehicle condition documentation
            {
                brokerQuestion: "Perfect! Pickup details:\nPrestige Auto Group\n15500 Michigan Ave, Dearborn MI 48126\nContact: Fleet Manager Tom Rodriguez 313-555-0188\nPickup tomorrow 8 AM - 12 PM\nWhat questions do you have about pickup?",
                dispatcherPrompt: "💎 Брокер дал pickup детали. Задайте важные вопросы.",
                suggestions: [
                    {
                        text: "Great! I have the address: 15500 Michigan Ave, Dearborn MI 48126. Contact Tom Rodriguez at 313-555-0188, tomorrow 8 AM-12 PM. Few questions: How long does loading typically take for 9 vehicles? Are all vehicles ready and keys available? Do we need any special access codes or gate procedures? Should driver call Tom before arrival or just show up during the window? Will someone be available to sign condition reports for each vehicle? Are the vehicles fueled or do we need to add fuel? Any special handling instructions for the Tesla?",
                        quality: "excellent",
                        analytics: "✨ Отлично! Подтверждение деталей + 7 важных вопросов о процедурах.",
                        path: "master"
                    },
                    {
                        text: "Got it. 15500 Michigan Ave, Tom Rodriguez 313-555-0188, tomorrow 8 AM-12 PM. How long does loading take? Are all vehicles ready? Should driver call ahead? Any special procedures?",
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
            // ШАГ 9: Delivery details + customer communication
            {
                brokerQuestion: "Loading takes about 90 minutes for 9 vehicles.\nAll vehicles are ready, detailed, and keys available.\nTom will meet driver and sign all condition reports.\nVehicles are fueled. Tesla needs to stay charged - don't let battery drain below 20%.\nNow for delivery - any questions about the delivery location?",
                dispatcherPrompt: "💎 Брокер дал loading информацию. Спросите о delivery.",
                suggestions: [
                    {
                        text: "Perfect! 90 minutes loading, vehicles ready and detailed, Tom signs condition reports, vehicles fueled, Tesla battery above 20% - all clear. For delivery: What's the complete address and contact? What's the delivery time window? How long does unloading take? Should driver call ahead and how far in advance? Will there be someone to sign condition reports for each vehicle? Are there any special delivery instructions or customer communication requirements? Should we provide delivery updates to the customer or dealership? Any gate codes or special access at delivery location?",
                        quality: "excellent",
                        analytics: "✨ Отлично! Подтверждение loading + 8 детальных вопросов о delivery.",
                        path: "master"
                    },
                    {
                        text: "Understood on loading and Tesla battery. For delivery: What's the address and contact? What's the time window? Should driver call ahead and when? How long is unloading? Any special customer communication needed?",
                        quality: "good",
                        analytics: "✔️ Хорошо! Важные вопросы о delivery и коммуникации.",
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
                        analytics: "🔴 Агрессивно. Жалобы на процедуры.",
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
                brokerQuestion: "Delivery:\nDesert Luxury Motors\n8800 E Indian School Rd, Scottsdale AZ 85251\nContact: General Manager Jennifer Park 480-555-0277\nDelivery window: 4 days from pickup, 9 AM - 5 PM\nUnloading takes 90 minutes with inspection.\nCall Jennifer 24 hours before arrival to schedule exact time.\nShe'll want updates during transport - text her daily with location.\nAny final questions?",
                dispatcherPrompt: "💎 Брокер дал delivery детали. Подтвердите все и резюмируйте.",
                suggestions: [
                    {
                        text: "Perfect! Let me confirm everything: Pickup tomorrow 8 AM-12 PM at Prestige Auto Group, 15500 Michigan Ave Dearborn, Tom Rodriguez 313-555-0188. Loading 90 minutes, all vehicles ready, Tesla battery above 20%. Delivery in 4 days, 9 AM-5 PM at Desert Luxury Motors, 8800 E Indian School Rd Scottsdale, Jennifer Park 480-555-0277. Call 24 hours ahead, text daily updates. Unloading 90 minutes. 1900 miles, $5,500 at $2.89/mile, detention $75/hr after 2 hours, layover $250/day. 9 luxury vehicles, enclosed transport, full documentation. We're 100% confirmed! Sending NOA and insurance certificate now.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Полное профессиональное резюме всех деталей. МАСТЕР!",
                        path: "master"
                    },
                    {
                        text: "Confirmed! Desert Luxury Motors, Jennifer 480-555-0277, 4 days, 9 AM-5 PM, call 24 hours ahead, daily text updates. Pickup tomorrow Dearborn, delivery Scottsdale, $5,500 all-in. Enclosed transport, full inspection documentation, Tesla battery maintenance. Sending NOA and insurance certificate now. Thank you!",
                        quality: "good",
                        analytics: "✔️ Хорошо! Хорошее резюме ключевых деталей.",
                        path: "master"
                    },
                    {
                        text: "Got it. Jennifer 480-555-0277, 4 days, 9-5 PM, call ahead, daily updates. Pickup tomorrow, delivery in 4 days. $5,500. Sending NOA.",
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
                brokerResponse: "Excellent! You're extremely professional and well-prepared for luxury vehicle transport.\nRate confirmation sent to Premier Auto Transport MC 776655.\nI'm impressed with your enclosed equipment, insurance coverage, and inspection process.\nYour track record with zero claims gives me complete confidence.\nIf this delivery goes smoothly, I have 2-3 luxury auto transport loads weekly on various lanes.\nLooking forward to a long partnership!\nGood luck with the transport!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$5,500",
                    ratePerMile: "$2.89/mile",
                    relationship: "Excellent - Weekly luxury auto loads opportunity",
                    dialogueTime: "10-12 minutes",
                    questionsAsked: "15+ professional questions about vehicles and procedures",
                    detailLevel: "very high",
                    futureOpportunity: "repeat",
                    weeklyLoads: "2-3 luxury auto loads if perform well",
                    feedback: "🏆 МАСТЕР УРОВЕНЬ AUTO TRANSPORT!\n\n✅ ЧТО СДЕЛАНО ПРАВИЛЬНО:\n- Представились профессионально с MC номером и enclosed carrier availability\n- Подтвердили $1 million cargo insurance с per-vehicle limits\n- Описали детальный 360-degree inspection process с фото документацией\n- Подтвердили fully enclosed carrier с hydraulic lift system\n- Продемонстрировали 7 лет опыта с luxury vehicles и zero claims track record\n- Провели профессиональные переговоры о ставке с обоснованием\n- Подтвердили detention/layover условия с уточнениями\n- Задали все критические вопросы о loading procedures и vehicle readiness\n- Собрали полную информацию о delivery с customer communication requirements\n- Сделали детальное резюме всех деталей перед финальным подтверждением\n\n💡 КЛЮЧЕВОЙ УРОК:\nLuxury vehicle transport требует демонстрации специализированного оборудования, высокого insurance coverage, и детальных inspection procedures. Брокеры платят premium rates ($2.89/mile vs стандартные $2.00/mile для open carrier) за enclosed transport с proven track record. Детальное знание vehicle documentation, enclosed equipment benefits, и customer communication открывает доступ к высокооплачиваемым weekly luxury auto loads.\n\n🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:\nПри работе с luxury auto transport всегда подчеркивайте: 1) Enclosed carrier с hard sides (не soft-side или tarp), 2) High cargo insurance ($1M+) с per-vehicle limits, 3) Comprehensive inspection process с 20+ photos и timestamped documentation, 4) Track record с zero claims и dealership references, 5) Customer communication plan с delivery updates. Это строит репутацию reliable luxury carrier и ведет к premium rates ($2.75-$3.00/mile) и repeat business с dealerships и high-end customers."
                }
            }
        ],
        reject1: [
            {},
            {
                brokerResponse: "I appreciate you calling, but I need to be honest with you.\n\nFor luxury vehicle transport with $900K cargo value, I need carriers who are fully prepared and professional. Based on our conversation, I have concerns about either your insurance coverage or your company's readiness for high-value auto transport.\n\nLuxury auto transport requires:\n- Minimum $500K cargo insurance, preferably $1M+ (not $300K or 'I think we have coverage')\n- Immediate knowledge of your MC number and equipment availability\n- Professional communication without aggressive or defensive responses\n- Understanding of basic industry terminology\n\nI'm going to pass on this one. I'd recommend:\n1. Upgrade your cargo insurance to at least $500K, ideally $1M for luxury vehicles\n2. Get familiar with enclosed vs open transport requirements\n3. Ensure you know your company's MC number and equipment status at all times\n4. Practice professional communication - brokers ask questions for risk management, not to annoy you\n\nOnce you're better prepared for luxury vehicle transport, feel free to call back. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    ratePerMile: "$0/mile",
                    relationship: "Rejected - Insufficient insurance or unprepared",
                    dialogueTime: "2-3 minutes",
                    questionsAsked: "Few or defensive responses",
                    detailLevel: "none",
                    futureOpportunity: "none",
                    weeklyLoads: "No loads",
                    feedback: "❌ ОТКАЗ: НЕДОСТАТОЧНАЯ СТРАХОВКА ИЛИ НЕ ГОТОВ\n\n✅ ЧТО НУЖНО БЫЛО СДЕЛАТЬ:\n- Иметь минимум $500K cargo insurance, лучше $1M для luxury vehicles\n- Знать свой MC номер наизусть - это базовая информация о вашей компании\n- Точно знать тип и местоположение своего оборудования (enclosed vs open)\n- Отвечать профессионально на вопросы брокера о страховке и квалификации\n- Понимать базовую терминологию индустрии (detention, enclosed, cargo insurance)\n- Никогда не быть агрессивным когда брокер проверяет insurance coverage\n\n💡 КЛЮЧЕВОЙ УРОК:\nLuxury auto transport - это высокооплачиваемые грузы ($2.89/mile vs $2.00/mile стандарт), но они требуют высокого insurance coverage. Если вы перевозите $900K worth of vehicles с только $300K insurance, один accident может bankrupt вашу компанию. Брокеры несут юридическую ответственность за выбор adequately insured carriers. Если вы не можете подтвердить достаточную страховку, не знаете свой MC номер, или реагируете агрессивно - брокер ОБЯЗАН отказать.\n\n🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:\nПеред звонком по luxury auto load: 1) Проверьте что у вас есть минимум $500K cargo insurance, лучше $1M, 2) Имейте certificate of insurance готовым для отправки, 3) Знайте per-vehicle limits вашей страховки, 4) Понимайте разницу между cargo, liability, и physical damage insurance, 5) Будьте готовы назвать вашу insurance company и policy number. High-value cargo требует high-value insurance. Это не опция - это requirement. Один uninsured claim может закрыть вашу компанию и разрушить вашу репутацию в индустрии."
                }
            }
        ],
        reject2: [
            {},
            {
                brokerResponse: "I'm going to stop you right there.\n\nYour attitude toward vehicle inspection and documentation is a major red flag. When you say things like 'do we really need photos?' or 'cars will be fine either way' or dismiss the importance of enclosed transport, you're telling me you don't take high-value cargo seriously.\n\nThis isn't about being picky - this is about protecting $900K worth of luxury vehicles and maintaining customer relationships. One scratch on a $120K Mercedes can cost thousands in repairs and damage our reputation.\n\nI cannot and will not book a carrier who:\n- Dismisses vehicle inspection requirements (photos protect both you and us)\n- Doesn't understand enclosed vs open transport (luxury customers demand enclosed)\n- Shows impatience with documentation procedures (condition reports prevent disputes)\n- Lacks experience with high-value vehicles (this isn't your first load to learn on)\n\nOne damage claim on luxury vehicles can result in:\n- Insurance claims up to $150K per vehicle\n- Loss of dealership contracts\n- Destroyed reputation in luxury auto transport\n- Legal disputes over pre-existing damage\n- Loss of your insurance coverage\n\nI'm passing on this load. I'd strongly recommend you gain experience with standard vehicles before attempting luxury transport. This is not the lane for learning on the job.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    ratePerMile: "$0/mile",
                    relationship: "Rejected - Lack of experience or professionalism",
                    dialogueTime: "3-4 minutes",
                    questionsAsked: "Dismissive responses to documentation questions",
                    detailLevel: "none",
                    futureOpportunity: "none",
                    weeklyLoads: "No loads",
                    feedback: "❌ ОТКАЗ: ОТСУТСТВИЕ ОПЫТА ИЛИ ПРЕНЕБРЕЖЕНИЕ ДОКУМЕНТАЦИЕЙ\n\n✅ ЧТО НУЖНО БЫЛО СДЕЛАТЬ:\n- Относиться к vehicle inspection серьезно - это защита для всех сторон\n- Понимать что enclosed transport - это requirement для luxury vehicles, не опция\n- Иметь детальный process для photo documentation (20+ photos per vehicle)\n- Демонстрировать опыт с high-value vehicles, не говорить 'это наш первый раз'\n- Никогда не говорить что documentation 'не нужна' или 'waste of time'\n- Показывать что вы понимаете ценность груза и customer expectations\n\n💡 КЛЮЧЕВОЙ УРОК:\nLuxury vehicle documentation - это не бюрократия. Это единственная защита от disputes о pre-existing damage. Когда вы доставляете $120K Mercedes с новой царапиной, кто платит? Если у вас нет detailed photos from pickup showing scratch wasn't there - ВЫ платите. Enclosed transport - это не 'nice to have' для luxury cars - это customer requirement. Open carrier означает road debris, weather exposure, и visibility to thieves. Dealerships и luxury customers ТРЕБУЮТ enclosed.\n\n🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:\nБрокеры НЕМЕДЛЕННО отказывают carriers которые показывают inexperience с luxury vehicles. Почему? Потому что: 1) One damage claim может стоить $50K-$150K, 2) Luxury customers очень demanding и один complaint может потерять dealership contract, 3) Insurance rates растут после claims, 4) Reputation в luxury auto transport строится годами и разрушается одним incident. Если вы хотите возить luxury vehicles и получать premium rates ($2.75-$3.00/mile), вы ОБЯЗАНЫ: иметь enclosed carrier, comprehensive inspection process, proven track record, и professional attitude. Нет shortcuts. Начните с standard vehicles, постройте experience, потом переходите к luxury transport."
                }
            }
        ],
        reject3: [
            {},
            {
                brokerResponse: "I understand you want a higher rate, but let me be straight with you.\n\nYou're asking for $6,500+ on a 1900-mile load. That's $3.42/mile. For context:\n- Current market rate for enclosed luxury auto transport: $2.60-$2.90/mile\n- My offer of $5,500 ($2.89/mile) is already at the TOP of the market\n- Even with enclosed transport premium, $3.42/mile is 18-20% above market\n\nI appreciate that you have the enclosed equipment and experience, but I have a budget from my customer. I can't pay rates that are significantly above market just because you demand them.\n\nIf you had said 'Could we do $5,700?' with some justification, we might have found middle ground. But demanding $6,500 or saying my offer is 'insulting' shows you're either:\n1. Not familiar with current market rates for auto transport\n2. Trying to take advantage\n3. Not serious about the load\n\nI'm going to move on to other carriers. Here's some advice:\n- Research current market rates before negotiating (Central Dispatch, uShip show $2.60-$2.90/mile)\n- Negotiate professionally with justification, not demands\n- Understand that enclosed premium is already built into $2.89/mile\n- Know when a rate is fair and accept it\n\nGood luck finding loads at your target rate. I'll keep your info if rates change significantly.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    ratePerMile: "$0/mile",
                    relationship: "Rejected - Unrealistic rate expectations",
                    dialogueTime: "5-6 minutes",
                    questionsAsked: "Some questions, but failed at negotiation",
                    detailLevel: "medium",
                    futureOpportunity: "unlikely",
                    weeklyLoads: "No loads",
                    feedback: "❌ ОТКАЗ: НЕРЕАЛИСТИЧНЫЕ ТРЕБОВАНИЯ ПО СТАВКЕ\n\n✅ ЧТО НУЖНО БЫЛО СДЕЛАТЬ:\n- Исследовать рыночные ставки ПЕРЕД переговорами (Central Dispatch, uShip показывают $2.60-$2.90/mile для enclosed)\n- Понимать что $5,500 ($2.89/mile) уже включает enclosed transport premium над open carrier $2.00/mile\n- Вести переговоры профессионально: 'Could we do $5,700?' вместо 'I need $6,500!'\n- Обосновывать запрос: 'We have zero claims in 7 years' вместо 'That's insulting!'\n- Знать когда принять fair offer - $5,500 это TOP of market для этого lane\n- Не быть агрессивным когда broker объясняет budget constraints\n\n💡 КЛЮЧЕВОЙ УРОК:\nЗнание рыночных ставок для auto transport - это КРИТИЧЕСКИЙ навык. Enclosed luxury transport платит $2.60-$2.90/mile, что уже на 30-45% выше чем open carrier ($2.00/mile). Если вы требуете $6,500 ($3.42/mile) когда market rate $2.60-$2.90/mile, вы показываете что: 1) Не знаете рынок auto transport, 2) Не уважаете broker's budget, 3) Не серьезны о получении load. Auto transport brokers работают с tight margins. Они не могут платить на 20% выше рынка.\n\n🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ:\nПеред каждым звонком по auto transport: 1) Проверьте текущие ставки на lane в Central Dispatch или uShip, 2) Поймите разницу между open ($1.80-$2.20/mile) и enclosed ($2.60-$2.90/mile) rates, 3) Определите вашу minimum acceptable rate, 4) Определите вашу target rate (5-8% выше fair rate), 5) Подготовьте обоснование (enclosed equipment, zero claims, dealership references). Во время переговоров: используйте фразы 'Based on current enclosed transport rates...' или 'Considering our track record...' вместо 'I need...' или 'That's too low!'. Если broker предлагает fair rate на top of market - БЕРИТЕ ЕГО. Жадность = $0. Профессионализм = $5,500 + weekly repeat business."
                }
            }
        ]
    }
};

// Add to global scenarios array
if (typeof allScenarios !== 'undefined') {
    allScenarios.push(scenario6);
    console.log('✅ Scenario #6 loaded: Auto Transport - Detroit MI → Phoenix AZ');
    console.log('📊 Total scenarios:', allScenarios.length);
} else {
    // For testing environment
    if (typeof module !== 'undefined' && module.exports) {
        global.allScenarios = global.allScenarios || [];
        global.allScenarios.push(scenario6);
    }
}
