// ============================================================
// DISPATCHER TRAINING - REWRITTEN SCENARIOS v2.0
// Realistic, varied, natural broker dialogues
// Each scenario has unique broker personality and situation
// ============================================================

console.log('🟢 Loading scenarios v2.0...');

// ─────────────────────────────────────────────────────────────
// SCENARIO 1 — Tom | Reefer Produce | Seattle→Miami
// Experienced broker, direct, knows market, fair negotiator
// ─────────────────────────────────────────────────────────────
const scenario_tom = {
    id: 6,
    title: "Fresh Produce — Seattle to Miami",
    route: "Seattle WA → Miami FL",
    distance: 3110,
    equipment: "Reefer (53ft)",
    cargo: "Fresh produce (berries, leafy greens)",
    weight: "44,000 lbs",
    postedRate: "$11,800 ($3.80/mile)",
    deadline: "Pickup tomorrow 6 AM, Delivery in 4 days",
    brokerStyle: "Experienced, direct, knows market rates",
    difficulty: "standard",
    brokerName: "Tom",
    brokerCompany: "FreshRoute Logistics",
    initialMessage: "Hey, this is Tom with FreshRoute Logistics. Calling about the reefer load Seattle to Miami — fresh produce, 44,000 lbs. You guys available?",
    paths: {
        master: [
            {
                brokerQuestion: "Alright. Give me your MC number and company name.",
                dispatcherPrompt: "💡 Стандартный первый вопрос — MC и компания",
                suggestions: [
                    { text: "Sure Tom. MC 334477, Apex Reefer Transport. We run 18 reefers out of the Pacific Northwest, specialize in fresh produce. Been doing Seattle-Miami corridor for 6 years.", quality: "excellent", path: "master" },
                    { text: "MC 334477, Apex Reefer Transport. 18 reefers, produce specialists.", quality: "good", path: "master" },
                    { text: "MC 334477, Apex Transport.", quality: "normal", path: "warning" },
                    { text: "Hold on... MC is 334477...", quality: "weak", path: "warning" },
                    { text: "What's the rate before I give you anything?", quality: "aggressive", path: "warning_strict" },
                    { text: "We have trucks available.", quality: "fail", path: "warning_strict" }
                ]
            },
            {
                brokerQuestion: "Okay, Apex. Where's your reefer right now? Can you make 6 AM pickup tomorrow in Seattle?",
                dispatcherPrompt: "💡 Местоположение трака и готовность к пикапу",
                suggestions: [
                    { text: "Reefer is sitting empty at our yard in Tacoma, about 35 minutes from the pickup. Driver's rested, pre-trip done. We can be there at 5:45 AM if needed. What's the shipper address?", quality: "excellent", path: "master" },
                    { text: "Reefer in Tacoma, 35 min from Seattle. Driver ready, can make 6 AM no problem.", quality: "good", path: "master" },
                    { text: "Reefer near Seattle. Should make 6 AM.", quality: "normal", path: "warning" },
                    { text: "Reefer is somewhere in the Seattle area...", quality: "weak", path: "warning" },
                    { text: "Depends on the rate.", quality: "aggressive", path: "warning_strict" },
                    { text: "Earliest we can do is 8 AM.", quality: "fail", path: "warning_strict" }
                ]
            },
            {
                brokerQuestion: "Good. Temp requirement is 34-38°F the whole run. Driver ever hauled fresh berries before? They bruise easy.",
                dispatcherPrompt: "💡 Температурный режим и опыт водителя с деликатным грузом",
                suggestions: [
                    { text: "Yes, driver Mike has 8 years on produce — berries, leafy greens, stone fruit. Knows not to stack heavy, keeps airflow clear, checks temp every 2 hours. 34-38°F is standard for us. We've never had a produce claim.", quality: "excellent", path: "master" },
                    { text: "Driver has 8 years produce experience, knows berry handling. 34-38°F no problem, checks temp every 2 hours.", quality: "good", path: "master" },
                    { text: "Driver has produce experience. Can maintain 34-38°F.", quality: "normal", path: "warning" },
                    { text: "Driver has done reefer loads before...", quality: "weak", path: "warning" },
                    { text: "Reefer holds temp automatically.", quality: "aggressive", path: "warning_strict" },
                    { text: "Driver has CDL, that's what matters.", quality: "fail", path: "warning_strict" }
                ]
            },
            {
                brokerQuestion: "What's your cargo insurance? I need at least $150K for this load.",
                dispatcherPrompt: "💡 Страховка груза — минимум $150K",
                suggestions: [
                    { text: "We carry $250K cargo through Nationwide, specifically covers fresh produce including spoilage. $1M liability. Certificates current through December 2027. Can email them within 10 minutes of booking.", quality: "excellent", path: "master" },
                    { text: "$250K cargo coverage, $1M liability. Current certs, will send after booking.", quality: "good", path: "master" },
                    { text: "$200K cargo, $1M liability. Certificates current.", quality: "normal", path: "warning" },
                    { text: "I think we have $150K... need to check.", quality: "weak", path: "warning" },
                    { text: "Insurance is fine, don't worry about it.", quality: "aggressive", path: "warning_strict" },
                    { text: "We have $100K, is that enough?", quality: "fail", path: "warning_strict" }
                ]
            },
            {
                brokerQuestion: "Okay. What rate are you looking for?",
                dispatcherPrompt: "💡 ТОРГ! Posted $11,800 — просите $13,200-14,000",
                suggestions: [
                    { text: "Tom, for 3,110 miles with fresh produce, temp-sensitive cargo and a 4-day window, I'm at $13,500. That's $4.34 a mile — fair for a reefer specialist with produce experience and zero claims history.", quality: "excellent", path: "master" },
                    { text: "$13,200 for this run. $4.25/mile with produce expertise and clean record.", quality: "good", path: "master" },
                    { text: "$12,500 for the load.", quality: "normal", path: "warning" },
                    { text: "$12,000 works for us.", quality: "weak", path: "warning" },
                    { text: "Minimum $16,000 or we're not interested.", quality: "aggressive", path: "reject_rate_final" },
                    { text: "I'll take the posted $11,800.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            {
                brokerQuestion: "I can do $12,800. That's my ceiling on this one — shipper's locked in the rate.",
                dispatcherPrompt: "💡 Брокер предлагает $12,800 — торгуйтесь",
                suggestions: [
                    { text: "Tom, I hear you on the shipper side. Meet me at $13,100 and we've got a deal. That's only $300 more and you get a carrier who's done this lane 6 years with zero produce claims. Worth it for the reliability.", quality: "excellent", path: "master" },
                    { text: "Can we do $13,000? Split the difference — you get reliability, I get fair rate.", quality: "good", path: "master" },
                    { text: "Okay, $12,800 works.", quality: "normal", path: "master" },
                    { text: "Fine, whatever you say.", quality: "weak", path: "warning" },
                    { text: "That's too low, not worth our time.", quality: "aggressive", path: "reject_rate_final" },
                    { text: "Okay, $12,800 is fine.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            {
                brokerQuestion: "Alright, $13,000 — done. Send me your email and I'll get the rate con over.",
                dispatcherPrompt: "💡 Сделка! Дайте email для rate confirmation",
                suggestions: [
                    { text: "Great working with you Tom. dispatch@apexreefer.com — send it over. I'll have driver confirmation and insurance certs back to you within 15 minutes.", quality: "excellent", path: "master" },
                    { text: "dispatch@apexreefer.com. Will confirm driver and send certs right after.", quality: "good", path: "master" },
                    { text: "dispatch@apexreefer.com. Thanks Tom.", quality: "normal", path: "master" },
                    { text: "Let me find the email...", quality: "weak", path: "warning" },
                    { text: "Just text it to me.", quality: "aggressive", path: "reject_email_final" },
                    { text: "We don't use email.", quality: "fail", path: "reject_email_final" }
                ]
            },
            {
                brokerResponse: "Rate con sent to dispatch@apexreefer.com. Pickup tomorrow 6 AM at Pacific Fresh Farms, 1240 Harbor Ave Seattle. Delivery Thursday 7 AM Miami Produce Terminal. You're good to go — appreciate the professionalism.",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$13,000",
                    ratePerMile: "$4.18/mile",
                    feedback: `✅ ОТЛИЧНАЯ РАБОТА!\n\n💰 ФИНАНСЫ:\n• Ставка: $13,000\n• Posted: $11,800\n• Выше posted на: +$1,200 (+10.2%)\n• Дизель: ~$1,244\n• Чистая прибыль: ~$11,756\n\n🎯 ЧТО СРАБОТАЛО:\n✅ Чёткий MC и компания с первого раза\n✅ Показал опыт с produce\n✅ Не принял первое предложение $12,800\n✅ Торговался с аргументами (6 лет на лейне)\n✅ Закрыл сделку профессионально\n\n💡 УРОК: "Это мой потолок" — не всегда правда. Уверенный контраргумент с ценностью принёс +$200.`
                }
            }
        ],
        warning: [
            {
                brokerResponse: "Hey, I need your MC number and company name. Can you give me that clearly?", dispatcherPrompt: "💡 Брокер переспрашивает MC и компанию", suggestions: [
                    { text: "Sorry about that. MC 334477, Apex Reefer Transport. Produce specialists, 18 reefers.", quality: "excellent", path: "master" },
                    { text: "MC 334477, Apex Reefer Transport.", quality: "good", path: "master" },
                    { text: "MC 334477, Apex Transport.", quality: "normal", path: "master" },
                    { text: "I already told you...", quality: "weak", path: "reject_weak_final" },
                    { text: "Why do you need all this?", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "I don't have it handy.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            {
                brokerResponse: "Where exactly is your reefer? I need to know it can make 6 AM.", dispatcherPrompt: "💡 Брокер хочет точное местоположение", suggestions: [
                    { text: "Reefer is in Tacoma, 35 minutes from Seattle. Driver rested and ready. 6 AM is no problem.", quality: "excellent", path: "master" },
                    { text: "Tacoma, 35 min out. Can make 6 AM.", quality: "good", path: "master" },
                    { text: "Near Seattle. Can make 6 AM.", quality: "normal", path: "master" },
                    { text: "Somewhere in the area...", quality: "weak", path: "reject_weak_final" },
                    { text: "Traffic is unpredictable.", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Earliest is 8 AM.", quality: "fail", path: "reject_timing_final" }
                ]
            },
            {
                brokerResponse: "I need to know your driver has produce experience. Fresh berries bruise.", dispatcherPrompt: "💡 Брокер настаивает на опыте с produce", suggestions: [
                    { text: "Driver Mike, 8 years produce. Berries, leafy greens, stone fruit. Knows airflow, temp monitoring. Zero produce claims.", quality: "excellent", path: "master" },
                    { text: "8 years produce experience. Knows berry handling. Zero claims.", quality: "good", path: "master" },
                    { text: "Driver has produce experience.", quality: "normal", path: "master" },
                    { text: "Driver has done reefer before...", quality: "weak", path: "reject_weak_final" },
                    { text: "Produce is produce, driver knows reefer.", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Driver has CDL.", quality: "fail", path: "reject_weak_final" }
                ]
            }
        ],
        warning_strict: [{
            brokerResponse: "Look, I need MC and company name before we go any further.", dispatcherPrompt: "⚠️ Последний шанс", suggestions: [
                { text: "Sorry. MC 334477, Apex Reefer Transport.", quality: "good", path: "master" },
                { text: "MC 334477, Apex Transport.", quality: "normal", path: "master" },
                { text: "Fine. MC 334477.", quality: "weak", path: "reject_weak_final" },
                { text: "This is ridiculous.", quality: "aggressive", path: "reject_attitude_final" },
                { text: "I'll call back.", quality: "fail", path: "reject_weak_final" }
            ]
        }],
        reject_weak_final: [{ brokerResponse: "I'm going to pass. Need a carrier who's more prepared. Good luck.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: неподготовленный диспетчер.\n\n💡 Всегда знай MC, местоположение трака и детали компании наизусть." } }],
        reject_attitude_final: [{ brokerResponse: "Not going to work with that attitude. Moving on.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: плохое отношение.\n\n💡 Даже если вопросы кажутся лишними — отвечай профессионально." } }],
        reject_timing_final: [{ brokerResponse: "Can't use you if you can't make the pickup window. Thanks anyway.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: не можешь сделать пикап вовремя.\n\n💡 Никогда не соглашайся на груз если не уверен в тайминге." } }],
        reject_rate_final: [{ brokerResponse: "That rate doesn't work. I'll find someone else.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: нереальная ставка.\n\n💡 Торгуйся в разумных пределах — $1-2/mile выше posted." } }],
        reject_email_final: [{ brokerResponse: "I need an email to send the rate con. Can't book without it.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: нет email.\n\n💡 Всегда имей рабочий dispatch email готовый." } }]
    }
};


// ─────────────────────────────────────────────────────────────
// SCENARIO 2 — Dave | Flatbed Steel | Chicago→Houston
// Pressure broker, urgent load, tries to lowball, tests patience
// ─────────────────────────────────────────────────────────────
const scenario_dave = {
    id: 11,
    title: "Steel Coils — Chicago to Houston",
    route: "Chicago IL → Houston TX",
    distance: 1090,
    equipment: "Flatbed (48ft)",
    cargo: "Steel coils, 44,000 lbs",
    weight: "44,000 lbs",
    postedRate: "$3,200 ($2.94/mile)",
    deadline: "Pickup TODAY by 3 PM, Delivery tomorrow by noon",
    brokerStyle: "Urgent, pushy, tries to rush and lowball",
    difficulty: "hard",
    brokerName: "Dave",
    brokerCompany: "Midwest Steel Transport",
    initialMessage: "Dave here, Midwest Steel Transport. Got a flatbed load Chicago to Houston, steel coils, needs to go TODAY. You got a flatbed available?",
    paths: {
        master: [
            {
                brokerQuestion: "Good. MC number and company — quick, I got three carriers calling me right now.",
                dispatcherPrompt: "💡 Брокер давит на срочность — отвечай чётко и быстро",
                suggestions: [
                    { text: "MC 556688, Iron Road Carriers. We run 12 flatbeds, specialize in steel and heavy freight. Driver is in Chicago right now, available immediately. What's the pickup address?", quality: "excellent", path: "master" },
                    { text: "MC 556688, Iron Road Carriers. Flatbed in Chicago, available now.", quality: "good", path: "master" },
                    { text: "MC 556688, Iron Road Carriers.", quality: "normal", path: "warning" },
                    { text: "One second, let me get that...", quality: "weak", path: "warning" },
                    { text: "How many carriers are you calling? What's the rate?", quality: "aggressive", path: "warning_strict" },
                    { text: "We might have something available...", quality: "fail", path: "warning_strict" }
                ]
            },
            {
                brokerQuestion: "Steel coils, 44,000 lbs. Driver have coil experience? These need proper blocking and bracing — I've had loads shift before.",
                dispatcherPrompt: "💡 Опыт с steel coils — blocking, bracing, безопасность",
                suggestions: [
                    { text: "Driver James has 9 years flatbed, hauled steel coils hundreds of times. Knows coil cradles, proper chaining, blocking and bracing to DOT spec. He's never had a load shift. What's the coil diameter and are they on cradles?", quality: "excellent", path: "master" },
                    { text: "Driver has 9 years flatbed, steel coil specialist. Proper blocking and bracing, never had a shift.", quality: "good", path: "master" },
                    { text: "Driver has flatbed experience with steel.", quality: "normal", path: "warning" },
                    { text: "Driver has done flatbed loads...", quality: "weak", path: "warning" },
                    { text: "All drivers know how to secure loads.", quality: "aggressive", path: "warning_strict" },
                    { text: "Driver has CDL and flatbed experience.", quality: "fail", path: "warning_strict" }
                ]
            },
            {
                brokerQuestion: "Okay. Pickup is 3 PM today at Chicago Steel Works, 4400 S Halsted. Can your driver be there?",
                dispatcherPrompt: "💡 Пикап сегодня в 3 PM — подтверди реалистично",
                suggestions: [
                    { text: "Driver James is 20 minutes from that address right now. He can be there by 2:30 PM, gives him time to inspect the coils and get paperwork done before 3 PM. I'll text him the address now.", quality: "excellent", path: "master" },
                    { text: "Driver is nearby, can be there by 2:45 PM. 3 PM pickup confirmed.", quality: "good", path: "master" },
                    { text: "Driver can make 3 PM pickup.", quality: "normal", path: "warning" },
                    { text: "Driver should be able to make it...", quality: "weak", path: "warning" },
                    { text: "Depends on traffic.", quality: "aggressive", path: "warning_strict" },
                    { text: "Earliest is 5 PM.", quality: "fail", path: "reject_timing_final" }
                ]
            },
            {
                brokerQuestion: "Rate. I've got posted $3,200 and that's what I'm paying. Take it or leave it — I got other carriers.",
                dispatcherPrompt: "💡 Брокер давит — не принимай posted сразу! Торгуйся",
                suggestions: [
                    { text: "Dave, I hear you on the urgency, but $3,200 on 1,090 miles with steel coils and same-day pickup doesn't work for us. I'm at $3,800. That's $3.49/mile — fair for specialized flatbed with steel experience and immediate availability.", quality: "excellent", path: "master" },
                    { text: "$3,600 for this one. Same-day pickup with steel specialist — that's worth the premium.", quality: "good", path: "master" },
                    { text: "$3,400 — a little above posted for same-day service.", quality: "normal", path: "warning" },
                    { text: "Okay, $3,200 is fine.", quality: "weak", path: "reject_weak_final" },
                    { text: "Minimum $5,000 for same-day.", quality: "aggressive", path: "reject_rate_final" },
                    { text: "Sure, $3,200 works.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            {
                brokerQuestion: "Fine, $3,500. But I need driver there by 2:45 PM, not 3. And I need insurance certs before I send the rate con.",
                dispatcherPrompt: "💡 Брокер принял $3,500 — подтверди тайминг и страховку",
                suggestions: [
                    { text: "Deal at $3,500. Driver James will be there at 2:30 PM — I'm texting him right now. Insurance certs: $1M liability, $100K cargo through Progressive. I'll email them to you in 5 minutes. What's your email?", quality: "excellent", path: "master" },
                    { text: "$3,500 confirmed. Driver at 2:30 PM. Sending insurance certs now — what's your email?", quality: "good", path: "master" },
                    { text: "$3,500 works. Driver will be there. What's your email for certs?", quality: "normal", path: "master" },
                    { text: "Okay... I'll try to get driver there by 2:45...", quality: "weak", path: "warning" },
                    { text: "2:45 is tight, might be 3:15.", quality: "aggressive", path: "reject_timing_final" },
                    { text: "I'll send certs later.", quality: "fail", path: "reject_email_final" }
                ]
            },
            {
                brokerQuestion: "dispatch@midweststeel.com. Rate con coming. Delivery is tomorrow noon at Houston Steel Depot, 8800 Almeda Rd. Any issues, call me directly — not the shipper.",
                dispatcherPrompt: "💡 Финальные детали — подтверди всё чётко",
                suggestions: [
                    { text: "Got it Dave. Certs going to dispatch@midweststeel.com now. Driver James confirmed: Chicago Steel Works 2:30 PM today, Houston Steel Depot tomorrow noon. I'll call you directly if anything comes up — not the shipper. Thanks for the load.", quality: "excellent", path: "master" },
                    { text: "Sending certs now. Driver confirmed both locations and times. Will call you directly if any issues.", quality: "good", path: "master" },
                    { text: "Confirmed. Sending certs. Driver knows the plan.", quality: "normal", path: "master" },
                    { text: "Okay, I'll pass it to the driver.", quality: "weak", path: "warning" },
                    { text: "Driver will figure it out.", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "I'll have driver call the shipper if needed.", quality: "fail", path: "reject_attitude_final" }
                ]
            },
            {
                brokerResponse: "Rate con sent. Good doing business — you were fast and knew your stuff. Driver better be there at 2:30.",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$3,500",
                    ratePerMile: "$3.21/mile",
                    feedback: `✅ ОТЛИЧНАЯ РАБОТА!\n\n💰 ФИНАНСЫ:\n• Ставка: $3,500\n• Posted: $3,200\n• Выше posted на: +$300 (+9.4%)\n• Дизель: ~$436 (1,090 mi)\n• Чистая прибыль: ~$3,064\n\n🎯 ЧТО СРАБОТАЛО:\n✅ Быстро ответил под давлением\n✅ Не принял posted $3,200 сразу\n✅ Аргументировал: same-day + steel specialist\n✅ Подтвердил тайминг реалистично\n✅ Имел страховку готовую\n\n💡 УРОК: "У меня три других перевозчика" — классический блеф. Уверенный диспетчер не паникует и торгуется.`
                }
            }
        ],
        warning: [
            {
                brokerResponse: "I need your MC and company name — fast.", dispatcherPrompt: "💡 Брокер переспрашивает", suggestions: [
                    { text: "MC 556688, Iron Road Carriers. Flatbed in Chicago, available now.", quality: "excellent", path: "master" },
                    { text: "MC 556688, Iron Road Carriers.", quality: "good", path: "master" },
                    { text: "MC 556688.", quality: "normal", path: "master" },
                    { text: "I'm looking for it...", quality: "weak", path: "reject_weak_final" },
                    { text: "Why so many questions?", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "I'll call back.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            {
                brokerResponse: "Does your driver actually have steel coil experience or not?", dispatcherPrompt: "💡 Брокер настаивает на опыте с coils", suggestions: [
                    { text: "Yes — 9 years flatbed, steel coils specifically. Knows blocking, bracing, coil cradles. Never had a shift.", quality: "excellent", path: "master" },
                    { text: "9 years flatbed, steel coil experience. Proper securing.", quality: "good", path: "master" },
                    { text: "Driver has flatbed and steel experience.", quality: "normal", path: "master" },
                    { text: "Driver has done heavy loads...", quality: "weak", path: "reject_weak_final" },
                    { text: "All flatbed drivers know steel.", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Driver has CDL.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            {
                brokerResponse: "Can your driver actually make 3 PM or not? I need a straight answer.", dispatcherPrompt: "💡 Брокер хочет чёткий ответ по таймингу", suggestions: [
                    { text: "Driver is 20 minutes away. He'll be there at 2:30 PM. Confirmed.", quality: "excellent", path: "master" },
                    { text: "Driver nearby, confirmed 3 PM pickup.", quality: "good", path: "master" },
                    { text: "Yes, driver can make 3 PM.", quality: "normal", path: "master" },
                    { text: "Should be able to...", quality: "weak", path: "reject_weak_final" },
                    { text: "Traffic is unpredictable.", quality: "aggressive", path: "reject_timing_final" },
                    { text: "Earliest is 5 PM.", quality: "fail", path: "reject_timing_final" }
                ]
            }
        ],
        warning_strict: [{
            brokerResponse: "MC and company name. Now.", dispatcherPrompt: "⚠️ Последний шанс", suggestions: [
                { text: "MC 556688, Iron Road Carriers.", quality: "good", path: "master" },
                { text: "MC 556688.", quality: "normal", path: "master" },
                { text: "Fine, MC 556688.", quality: "weak", path: "reject_weak_final" },
                { text: "This is too much.", quality: "aggressive", path: "reject_attitude_final" },
                { text: "I'll call back.", quality: "fail", path: "reject_weak_final" }
            ]
        }],
        reject_weak_final: [{ brokerResponse: "I don't have time for this. Moving on.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: неподготовленный диспетчер.\n\n💡 Под давлением нужно отвечать быстро и чётко. Знай MC наизусть." } }],
        reject_attitude_final: [{ brokerResponse: "Not dealing with this attitude. Next carrier.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: плохое отношение.\n\n💡 Срочный брокер давит — это нормально. Оставайся профессиональным." } }],
        reject_timing_final: [{ brokerResponse: "Can't wait. Found another carrier. Thanks.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: не можешь сделать пикап вовремя.\n\n💡 Никогда не берись за груз если не уверен в тайминге." } }],
        reject_rate_final: [{ brokerResponse: "That rate is way off. I'll find someone else.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: нереальная ставка.\n\n💡 На срочных грузах можно просить 10-20% выше posted, не 50%." } }],
        reject_email_final: [{ brokerResponse: "I need certs before I send the rate con. That's non-negotiable.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: нет страховки.\n\n💡 Всегда имей страховые сертификаты готовые к отправке." } }]
    }
};


// ─────────────────────────────────────────────────────────────
// SCENARIO 3 — Kevin | Dry Van Electronics | LA→Dallas
// Friendly, relationship-focused, lots of questions about company
// Tests if dispatcher can build rapport while staying professional
// ─────────────────────────────────────────────────────────────
const scenario_kevin = {
    id: 12,
    title: "Electronics — Los Angeles to Dallas",
    route: "Los Angeles CA → Dallas TX",
    distance: 1430,
    equipment: "Dry Van (53ft)",
    cargo: "Consumer electronics (TVs, laptops)",
    weight: "38,000 lbs",
    postedRate: "$4,100 ($2.87/mile)",
    deadline: "Pickup tomorrow 8 AM, Delivery in 2 days",
    brokerStyle: "Friendly, relationship-focused, thorough vetting",
    difficulty: "standard",
    brokerName: "Kevin",
    brokerCompany: "TechFreight Solutions",
    initialMessage: "Hey there! Kevin here from TechFreight Solutions. How's your day going? I've got a dry van load, electronics, LA to Dallas. You guys running that lane?",
    paths: {
        master: [
            {
                brokerQuestion: "Great! So tell me about your company — how long have you been in business, how many trucks?",
                dispatcherPrompt: "💡 Брокер хочет узнать о компании — расскажи уверенно",
                suggestions: [
                    { text: "We're FastLane Logistics, been operating 7 years out of Los Angeles. Run 22 dry vans, mostly West Coast to Texas and Southeast. We do a lot of electronics and high-value freight — have the security protocols for it. MC 778899.", quality: "excellent", path: "master" },
                    { text: "FastLane Logistics, 7 years, 22 dry vans. Specialize in electronics and high-value freight. MC 778899.", quality: "good", path: "master" },
                    { text: "FastLane Logistics, MC 778899. We run dry vans.", quality: "normal", path: "warning" },
                    { text: "We're a carrier... MC 778899...", quality: "weak", path: "warning" },
                    { text: "Why do you need company history?", quality: "aggressive", path: "warning_strict" },
                    { text: "We have trucks available.", quality: "fail", path: "warning_strict" }
                ]
            },
            {
                brokerQuestion: "Nice! Electronics are high-value — we're talking $800K worth of TVs and laptops. Do you have any security measures? Cargo theft is a real issue on this lane.",
                dispatcherPrompt: "💡 Безопасность груза — $800K electronics, cargo theft на LA-Dallas",
                suggestions: [
                    { text: "Absolutely. Our drivers don't stop within 200 miles of pickup — standard security protocol for high-value electronics. GPS tracking on all trucks, real-time updates every 30 minutes. Driver parks only at secured truck stops. We've hauled electronics on this lane 50+ times without incident.", quality: "excellent", path: "master" },
                    { text: "Standard security: no stops within 200 miles of pickup, GPS tracking, secured truck stops only. Done this lane many times.", quality: "good", path: "master" },
                    { text: "Driver follows security protocols for high-value freight.", quality: "normal", path: "warning" },
                    { text: "Driver is experienced...", quality: "weak", path: "warning" },
                    { text: "Electronics are just boxes, driver knows what to do.", quality: "aggressive", path: "warning_strict" },
                    { text: "We have standard insurance.", quality: "fail", path: "warning_strict" }
                ]
            },
            {
                brokerQuestion: "That's exactly what I need to hear. What's your cargo insurance? For $800K load I need at least $250K coverage.",
                dispatcherPrompt: "💡 Страховка — минимум $250K для $800K груза",
                suggestions: [
                    { text: "We carry $500K cargo coverage through Liberty Mutual — specifically covers electronics and high-value freight. $1M liability. Certificates current through March 2028. I can have them in your inbox in 10 minutes.", quality: "excellent", path: "master" },
                    { text: "$500K cargo, $1M liability. Current certs, will send immediately after booking.", quality: "good", path: "master" },
                    { text: "$300K cargo coverage, $1M liability. Certificates current.", quality: "normal", path: "warning" },
                    { text: "I think we have $250K... let me check.", quality: "weak", path: "warning" },
                    { text: "Insurance is fine.", quality: "aggressive", path: "warning_strict" },
                    { text: "We have $100K, is that okay?", quality: "fail", path: "warning_strict" }
                ]
            },
            {
                brokerQuestion: "Perfect. Driver's name and how long has he been with you? I like to know who's handling my freight.",
                dispatcherPrompt: "💡 Брокер хочет знать водителя — это нормально для high-value",
                suggestions: [
                    { text: "Driver is Carlos Mendez, been with us 5 years. Clean MVR, no accidents, no violations. He's done this LA-Dallas run probably 30 times. I'll send you his CDL and MVR with the insurance certs if you'd like.", quality: "excellent", path: "master" },
                    { text: "Driver Carlos Mendez, 5 years with us. Clean record, done this lane many times.", quality: "good", path: "master" },
                    { text: "Driver Carlos, 5 years experience. Clean record.", quality: "normal", path: "master" },
                    { text: "Driver is experienced...", quality: "weak", path: "warning" },
                    { text: "Driver info is private.", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "I don't know the driver's name.", quality: "fail", path: "warning" }
                ]
            },
            {
                brokerQuestion: "I like that. Okay, rate — I've got $4,100 posted. What are you thinking?",
                dispatcherPrompt: "💡 ТОРГ! Posted $4,100 — просите $4,600-5,000",
                suggestions: [
                    { text: "Kevin, for 1,430 miles with $800K electronics, security protocols, GPS tracking and a driver who knows this lane — I'm at $4,800. That's $3.36/mile. You're getting a carrier who treats your freight like it's their own.", quality: "excellent", path: "master" },
                    { text: "$4,600 for this one. High-value electronics with security protocols — worth the premium.", quality: "good", path: "master" },
                    { text: "$4,400 — a bit above posted for the security and experience.", quality: "normal", path: "warning" },
                    { text: "$4,100 is fine.", quality: "weak", path: "reject_weak_final" },
                    { text: "Minimum $6,000 for electronics.", quality: "aggressive", path: "reject_rate_final" },
                    { text: "I'll take posted.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            {
                brokerQuestion: "You know what, I like how you operate. $4,500 — and I want to talk about a regular lane after this. We move 3-4 electronics loads a week LA to Texas.",
                dispatcherPrompt: "💡 Брокер предлагает $4,500 + регулярные грузы — отличная возможность!",
                suggestions: [
                    { text: "Kevin, $4,500 works and I'm very interested in the regular lane. 3-4 loads a week LA to Texas is exactly what we're built for. Let's do this load right and build from there. What's your email for the rate con?", quality: "excellent", path: "master" },
                    { text: "$4,500 confirmed. Very interested in regular lane — let's start with this load and build the relationship.", quality: "good", path: "master" },
                    { text: "$4,500 works. Open to regular loads.", quality: "normal", path: "master" },
                    { text: "Okay, $4,500 is fine.", quality: "weak", path: "warning" },
                    { text: "Regular loads need better rates.", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Let's see how this one goes.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            {
                brokerQuestion: "dispatch@techfreight.com. Rate con coming. Pickup tomorrow 8 AM at Sony Distribution Center, 19600 S Alameda St, Compton CA. Delivery Thursday 10 AM at Best Buy DC, 2455 Regent Blvd, Dallas.",
                dispatcherPrompt: "💡 Финальные детали — подтверди всё",
                suggestions: [
                    { text: "Perfect Kevin. dispatch@techfreight.com received. Sending insurance certs and driver info now. Confirmed: Sony Distribution Compton 8 AM tomorrow, Best Buy DC Dallas Thursday 10 AM. Carlos will be there at 7:30 AM. Looking forward to the regular lane.", quality: "excellent", path: "master" },
                    { text: "Got it. Sending certs and driver info now. Both locations confirmed. Driver will be early.", quality: "good", path: "master" },
                    { text: "Confirmed both locations. Sending certs now.", quality: "normal", path: "master" },
                    { text: "Okay, I'll pass to driver.", quality: "weak", path: "warning" },
                    { text: "Driver will figure out the details.", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "I'll send certs later.", quality: "fail", path: "reject_email_final" }
                ]
            },
            {
                brokerResponse: "Rate con sent. Certs received — everything looks great. You know, most carriers can't answer half the questions you just answered. I'm adding you to our preferred carrier list. Expect a call Monday for next week's loads.",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$4,500",
                    ratePerMile: "$3.15/mile",
                    feedback: `✅ ОТЛИЧНАЯ РАБОТА!\n\n💰 ФИНАНСЫ:\n• Ставка: $4,500\n• Posted: $4,100\n• Выше posted на: +$400 (+9.8%)\n• Дизель: ~$572 (1,430 mi)\n• Чистая прибыль: ~$3,928\n\n🎯 ЧТО СРАБОТАЛО:\n✅ Рассказал о компании уверенно\n✅ Знал протоколы безопасности для electronics\n✅ Предложил имя водителя и его историю\n✅ Торговался и получил +$400\n✅ Принял предложение о регулярных грузах\n\n💡 УРОК: Дружелюбный брокер — не значит лёгкий. Kevin проверял каждую деталь. Зато теперь 3-4 груза в неделю!`
                }
            }
        ],
        warning: [
            {
                brokerResponse: "Tell me more about your company — how long, how many trucks?", dispatcherPrompt: "💡 Брокер хочет детали о компании", suggestions: [
                    { text: "FastLane Logistics, 7 years, 22 dry vans. Electronics and high-value freight specialists. MC 778899.", quality: "excellent", path: "master" },
                    { text: "FastLane Logistics, MC 778899. 7 years, 22 trucks.", quality: "good", path: "master" },
                    { text: "FastLane Logistics, MC 778899.", quality: "normal", path: "master" },
                    { text: "We're a carrier...", quality: "weak", path: "reject_weak_final" },
                    { text: "Why does that matter?", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "I don't know those details.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            {
                brokerResponse: "What security measures do you have for high-value electronics?", dispatcherPrompt: "💡 Брокер настаивает на безопасности", suggestions: [
                    { text: "No stops within 200 miles of pickup, GPS tracking every 30 min, secured truck stops only. Done this lane 50+ times.", quality: "excellent", path: "master" },
                    { text: "GPS tracking, no stops near pickup, secured parking only.", quality: "good", path: "master" },
                    { text: "Driver follows high-value security protocols.", quality: "normal", path: "master" },
                    { text: "Driver is careful...", quality: "weak", path: "reject_weak_final" },
                    { text: "Electronics are just boxes.", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "We have insurance.", quality: "fail", path: "reject_weak_final" }
                ]
            }
        ],
        warning_strict: [{
            brokerResponse: "I need to know about your company before we go further.", dispatcherPrompt: "⚠️ Последний шанс", suggestions: [
                { text: "FastLane Logistics, MC 778899, 7 years, 22 dry vans.", quality: "good", path: "master" },
                { text: "FastLane Logistics, MC 778899.", quality: "normal", path: "master" },
                { text: "MC 778899.", quality: "weak", path: "reject_weak_final" },
                { text: "This is too many questions.", quality: "aggressive", path: "reject_attitude_final" },
                { text: "I'll call back.", quality: "fail", path: "reject_weak_final" }
            ]
        }],
        reject_weak_final: [{ brokerResponse: "I need a carrier who knows their business. Good luck.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: не знаешь свою компанию.\n\n💡 Знай детали компании наизусть: MC, сколько лет, сколько траков, специализация." } }],
        reject_attitude_final: [{ brokerResponse: "Not the right fit. Moving on.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: плохое отношение.\n\n💡 Дружелюбный брокер ожидает дружелюбного ответа. Строй отношения." } }],
        reject_rate_final: [{ brokerResponse: "That rate is unrealistic for this lane. Thanks anyway.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: нереальная ставка.\n\n💡 На electronics можно просить 10-15% выше posted, не 50%." } }],
        reject_email_final: [{ brokerResponse: "I need certs before booking. That's standard for high-value freight.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: нет страховки.\n\n💡 Для high-value freight страховые сертификаты — обязательны немедленно." } }]
    }
};


// ─────────────────────────────────────────────────────────────
// SCENARIO 4 — Mark | Flatbed Machinery | Atlanta→Denver
// Technical broker, tests equipment knowledge, no-nonsense
// ─────────────────────────────────────────────────────────────
const scenario_mark = {
    id: 13,
    title: "Heavy Machinery — Atlanta to Denver",
    route: "Atlanta GA → Denver CO",
    distance: 1400,
    equipment: "Flatbed (48ft) or RGN",
    cargo: "CNC machine, 38,000 lbs, 14ft tall",
    weight: "38,000 lbs",
    postedRate: "$5,800 ($4.14/mile)",
    deadline: "Pickup Wednesday 7 AM, Delivery Friday by 5 PM",
    brokerStyle: "Technical, no-nonsense, tests equipment knowledge",
    difficulty: "hard",
    brokerName: "Mark",
    brokerCompany: "Industrial Freight Group",
    initialMessage: "Mark here, Industrial Freight Group. Got a flatbed load, Atlanta to Denver — CNC machine, 38,000 lbs, 14 feet tall. You run flatbed or RGN?",
    paths: {
        master: [
            {
                brokerQuestion: "MC and company. And tell me — 14 feet tall, do you need a permit for that in Georgia and Colorado?",
                dispatcherPrompt: "💡 MC + технический вопрос про permits для 14ft cargo",
                suggestions: [
                    { text: "MC 667799, Titan Flatbed. Yes — 14ft requires oversize permit in both Georgia and Colorado. Georgia limit is 13'6\", Colorado is 14'6\" so we're fine there but need GA permit. We handle all permits in-house, usually 24-48 hours. Driver has oversize experience.", quality: "excellent", path: "master" },
                    { text: "MC 667799, Titan Flatbed. 14ft needs oversize permit in Georgia — we handle permits in-house.", quality: "good", path: "master" },
                    { text: "MC 667799, Titan Flatbed. We can handle oversize loads.", quality: "normal", path: "warning" },
                    { text: "MC 667799... not sure about permits...", quality: "weak", path: "warning" },
                    { text: "Permits are the shipper's problem.", quality: "aggressive", path: "warning_strict" },
                    { text: "We have flatbed trucks.", quality: "fail", path: "warning_strict" }
                ]
            },
            {
                brokerQuestion: "Good. What's your flatbed — 48ft or step deck? And does your driver have oversize experience? CNC machines are expensive.",
                dispatcherPrompt: "💡 Тип трака и опыт водителя с oversized/machinery",
                suggestions: [
                    { text: "48ft flatbed, 80,000 lb capacity. Driver Ray has 12 years flatbed, 6 years specifically on machinery and oversize. He knows how to read load plans, proper tie-down for CNC machines — they're sensitive to vibration. What are the machine dimensions exactly?", quality: "excellent", path: "master" },
                    { text: "48ft flatbed. Driver Ray, 12 years flatbed, 6 years machinery and oversize. Knows CNC handling.", quality: "good", path: "master" },
                    { text: "48ft flatbed. Driver has oversize experience.", quality: "normal", path: "warning" },
                    { text: "We have flatbed, driver has experience...", quality: "weak", path: "warning" },
                    { text: "Driver knows how to drive flatbed.", quality: "aggressive", path: "warning_strict" },
                    { text: "48ft flatbed available.", quality: "fail", path: "warning_strict" }
                ]
            },
            {
                brokerQuestion: "14ft x 8ft x 12ft, 38,000 lbs. Shipper will provide load plan. How many straps and chains?",
                dispatcherPrompt: "💡 Технический вопрос — количество straps и chains для 38,000 lbs",
                suggestions: [
                    { text: "For 38,000 lbs machinery we'd use minimum 8 chains with binders plus 4 corner protectors, and 6 straps for stabilization. Driver will follow the shipper's load plan exactly — if they want more, we add more. Safety is non-negotiable on machinery.", quality: "excellent", path: "master" },
                    { text: "8 chains minimum plus straps per load plan. Driver follows shipper specs exactly.", quality: "good", path: "master" },
                    { text: "Driver will follow the load plan from shipper.", quality: "normal", path: "warning" },
                    { text: "Driver knows how to secure loads...", quality: "weak", path: "warning" },
                    { text: "Standard flatbed securing.", quality: "aggressive", path: "warning_strict" },
                    { text: "Driver will figure it out.", quality: "fail", path: "warning_strict" }
                ]
            },
            {
                brokerQuestion: "Okay. Insurance — I need $500K cargo for this machine. It's worth $1.2 million.",
                dispatcherPrompt: "💡 Страховка $500K для $1.2M машины",
                suggestions: [
                    { text: "We carry $750K cargo coverage through Travelers, specifically covers machinery and oversize freight. $1M liability. Certificates current. I'll email them with the permit documentation as soon as we book.", quality: "excellent", path: "master" },
                    { text: "$750K cargo, $1M liability. Current certs, will send with permit docs after booking.", quality: "good", path: "master" },
                    { text: "$500K cargo coverage, $1M liability. Certificates current.", quality: "normal", path: "warning" },
                    { text: "I think we have $500K...", quality: "weak", path: "warning" },
                    { text: "Insurance is fine.", quality: "aggressive", path: "warning_strict" },
                    { text: "We have $250K, is that enough?", quality: "fail", path: "warning_strict" }
                ]
            },
            {
                brokerQuestion: "Rate. Posted is $5,800. What do you need?",
                dispatcherPrompt: "💡 ТОРГ! Posted $5,800 — просите $6,500-7,000",
                suggestions: [
                    { text: "Mark, for 1,400 miles with a $1.2M CNC machine, oversize permits, specialized driver and machinery expertise — I'm at $6,800. That's $4.86/mile. You're not just paying for miles, you're paying for the machine to arrive intact.", quality: "excellent", path: "master" },
                    { text: "$6,500 for this load. Oversize permits, machinery specialist, $750K coverage — worth the premium.", quality: "good", path: "master" },
                    { text: "$6,200 — above posted for the specialized service.", quality: "normal", path: "warning" },
                    { text: "$5,800 posted is fine.", quality: "weak", path: "reject_weak_final" },
                    { text: "Minimum $9,000 for machinery.", quality: "aggressive", path: "reject_rate_final" },
                    { text: "I'll take posted.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            {
                brokerQuestion: "$6,400 — and I need permits pulled before Wednesday. Can you confirm that timeline?",
                dispatcherPrompt: "💡 $6,400 принято — подтверди permits до среды",
                suggestions: [
                    { text: "Mark, $6,400 works. Permits for Georgia — I'll have them pulled by tomorrow afternoon, well before Wednesday pickup. I'll send you copies along with insurance certs. What's your email?", quality: "excellent", path: "master" },
                    { text: "$6,400 confirmed. Permits pulled by tomorrow, will send copies with certs. Email?", quality: "good", path: "master" },
                    { text: "$6,400 works. Will get permits done. Email?", quality: "normal", path: "master" },
                    { text: "I'll try to get permits in time...", quality: "weak", path: "warning" },
                    { text: "Permits take time, can't promise.", quality: "aggressive", path: "reject_timing_final" },
                    { text: "Shipper should handle permits.", quality: "fail", path: "reject_attitude_final" }
                ]
            },
            {
                brokerResponse: "ops@industrialfreight.com. Rate con coming. Pickup Wednesday 7 AM at Atlanta Manufacturing, 3300 Fulton Industrial Blvd. Delivery Friday 5 PM at Denver Tech Center, 5600 Greenwood Plaza. Send permits and certs when ready.",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$6,400",
                    ratePerMile: "$4.57/mile",
                    feedback: `✅ ОТЛИЧНАЯ РАБОТА!\n\n💰 ФИНАНСЫ:\n• Ставка: $6,400\n• Posted: $5,800\n• Выше posted на: +$600 (+10.3%)\n• Дизель: ~$560 (1,400 mi)\n• Чистая прибыль: ~$5,840\n\n🎯 ЧТО СРАБОТАЛО:\n✅ Знал про permits для 14ft cargo\n✅ Назвал конкретные детали: chains, straps\n✅ Имел $750K страховку для $1.2M машины\n✅ Торговался уверенно с аргументами\n✅ Подтвердил permits timeline реалистично\n\n💡 УРОК: Технический брокер проверяет знания. Конкретные ответы (8 chains, 14ft permit) = доверие = лучшая ставка.`
                }
            }
        ],
        warning: [
            {
                brokerResponse: "Do you know if 14ft cargo needs a permit in Georgia?", dispatcherPrompt: "💡 Брокер переспрашивает про permits", suggestions: [
                    { text: "Yes — 14ft needs oversize permit in Georgia, limit is 13'6\". We handle permits in-house, 24-48 hours.", quality: "excellent", path: "master" },
                    { text: "Yes, needs permit in Georgia. We handle it.", quality: "good", path: "master" },
                    { text: "Yes, oversize permit needed. We can get it.", quality: "normal", path: "master" },
                    { text: "I'll need to check on permits...", quality: "weak", path: "reject_weak_final" },
                    { text: "Permits are the shipper's job.", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "I don't know about permits.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            {
                brokerResponse: "How many chains for 38,000 lbs machinery?", dispatcherPrompt: "💡 Технический вопрос про securing", suggestions: [
                    { text: "Minimum 8 chains with binders plus straps per load plan. Driver follows shipper specs.", quality: "excellent", path: "master" },
                    { text: "8 chains minimum, follow load plan.", quality: "good", path: "master" },
                    { text: "Driver follows the load plan from shipper.", quality: "normal", path: "master" },
                    { text: "Standard securing...", quality: "weak", path: "reject_weak_final" },
                    { text: "Driver knows how to secure.", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "I'm not sure.", quality: "fail", path: "reject_weak_final" }
                ]
            }
        ],
        warning_strict: [{
            brokerResponse: "MC and company — and do you actually know oversize freight?", dispatcherPrompt: "⚠️ Последний шанс", suggestions: [
                { text: "MC 667799, Titan Flatbed. Yes — oversize specialists, handle permits in-house.", quality: "good", path: "master" },
                { text: "MC 667799, Titan Flatbed. We do oversize.", quality: "normal", path: "master" },
                { text: "MC 667799.", quality: "weak", path: "reject_weak_final" },
                { text: "Too many questions.", quality: "aggressive", path: "reject_attitude_final" },
                { text: "I'll call back.", quality: "fail", path: "reject_weak_final" }
            ]
        }],
        reject_weak_final: [{ brokerResponse: "I need someone who knows oversize freight. Thanks.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: не знаешь технических деталей.\n\n💡 Для oversize/machinery нужно знать: permits, chains, load plans." } }],
        reject_attitude_final: [{ brokerResponse: "Not the right carrier. Moving on.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: плохое отношение.\n\n💡 Технический брокер ценит знания и профессионализм." } }],
        reject_timing_final: [{ brokerResponse: "Can't use you if permits aren't ready in time.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: permits не готовы вовремя.\n\n💡 Permits — твоя ответственность. Знай сроки." } }],
        reject_rate_final: [{ brokerResponse: "That rate is way off market. Thanks anyway.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: нереальная ставка.\n\n💡 На machinery 10-20% выше posted — разумно. 50%+ — нет." } }]
    }
};


// ─────────────────────────────────────────────────────────────
// SCENARIO 5 — Chris | Reefer Pharma | Dallas→New York
// Strict compliance broker, pharma load, GDP requirements
// ─────────────────────────────────────────────────────────────
const scenario_chris = {
    id: 14,
    title: "Pharmaceutical Load — Dallas to New York",
    route: "Dallas TX → New York NY",
    distance: 1550,
    equipment: "Reefer (53ft) — GDP compliant",
    cargo: "Pharmaceutical products (temperature-sensitive)",
    weight: "28,000 lbs",
    postedRate: "$6,200 ($4.00/mile)",
    deadline: "Pickup Thursday 5 AM, Delivery Saturday 8 AM",
    brokerStyle: "Strict, compliance-focused, no shortcuts",
    difficulty: "hard",
    brokerName: "Chris",
    brokerCompany: "MedFreight Solutions",
    initialMessage: "Chris here, MedFreight Solutions. Pharmaceutical load, Dallas to New York, 28,000 lbs. Temperature-sensitive, GDP requirements. You have experience with pharma freight?",
    paths: {
        master: [
            {
                brokerQuestion: "MC and company. And what does GDP mean to you — do you actually know?",
                dispatcherPrompt: "💡 MC + GDP знания — Good Distribution Practice для pharma",
                suggestions: [
                    { text: "MC 889900, ColdChain Express. GDP — Good Distribution Practice. Means continuous temp monitoring with data logger, no temp excursions, chain of custody documentation, qualified driver training. We're GDP-compliant, have done pharma runs for 4 years.", quality: "excellent", path: "master" },
                    { text: "MC 889900, ColdChain Express. GDP — Good Distribution Practice, continuous temp monitoring, documentation, qualified drivers. 4 years pharma experience.", quality: "good", path: "master" },
                    { text: "MC 889900, ColdChain Express. We have pharma experience.", quality: "normal", path: "warning" },
                    { text: "MC 889900... GDP is temperature control?", quality: "weak", path: "warning" },
                    { text: "GDP is just a temperature requirement.", quality: "aggressive", path: "warning_strict" },
                    { text: "We have reefer trucks.", quality: "fail", path: "warning_strict" }
                ]
            },
            {
                brokerQuestion: "Good. Temp range is 2-8°C — cold chain. Do you have a calibrated data logger and can you provide temp reports at delivery?",
                dispatcherPrompt: "💡 2-8°C cold chain + data logger + temp reports",
                suggestions: [
                    { text: "Yes — we use Sensitech TempTale data loggers, calibrated every 6 months, certificate available. Continuous recording every 15 minutes. At delivery we provide full temp report showing entire transit. If there's any excursion above 8°C, we call you immediately.", quality: "excellent", path: "master" },
                    { text: "Sensitech data loggers, calibrated, 15-min recording. Full temp report at delivery. Immediate notification if excursion.", quality: "good", path: "master" },
                    { text: "We have data loggers and provide temp reports.", quality: "normal", path: "warning" },
                    { text: "We monitor temperature...", quality: "weak", path: "warning" },
                    { text: "Reefer maintains temp automatically.", quality: "aggressive", path: "warning_strict" },
                    { text: "We can check temp at delivery.", quality: "fail", path: "warning_strict" }
                ]
            },
            {
                brokerQuestion: "Driver — is he GDP-trained? I need documentation.",
                dispatcherPrompt: "💡 GDP training certificate для водителя",
                suggestions: [
                    { text: "Driver Sarah completed GDP training through IATA, certificate from 2024, valid through 2026. She's done 40+ pharma runs. I can email her training certificate with the insurance docs. She also has HAZMAT endorsement though this load doesn't require it.", quality: "excellent", path: "master" },
                    { text: "Driver GDP-certified, IATA training 2024. 40+ pharma runs. Certificate available to email.", quality: "good", path: "master" },
                    { text: "Driver has GDP training, certificate available.", quality: "normal", path: "warning" },
                    { text: "Driver has pharma experience...", quality: "weak", path: "warning" },
                    { text: "Driver knows how to drive reefer.", quality: "aggressive", path: "warning_strict" },
                    { text: "Driver has CDL.", quality: "fail", path: "warning_strict" }
                ]
            },
            {
                brokerQuestion: "Insurance — pharma requires $300K cargo minimum. And I need to know your claims history.",
                dispatcherPrompt: "💡 $300K страховка + claims history для pharma",
                suggestions: [
                    { text: "We carry $500K cargo through Chubb, specifically covers pharmaceutical freight including temp excursion liability. $1M liability. Zero cargo claims in 4 years of pharma hauling — clean record. Certificates and claims history available immediately.", quality: "excellent", path: "master" },
                    { text: "$500K cargo, Chubb, pharma-specific. Zero claims in 4 years. Certs and claims history ready to send.", quality: "good", path: "master" },
                    { text: "$400K cargo coverage, $1M liability. Clean claims history.", quality: "normal", path: "warning" },
                    { text: "I think we have $300K... need to check claims...", quality: "weak", path: "warning" },
                    { text: "Insurance is fine.", quality: "aggressive", path: "warning_strict" },
                    { text: "We have $150K coverage.", quality: "fail", path: "warning_strict" }
                ]
            },
            {
                brokerQuestion: "Alright. Rate?",
                dispatcherPrompt: "💡 ТОРГ! Posted $6,200 — просите $7,000-7,500",
                suggestions: [
                    { text: "Chris, for 1,550 miles with pharma GDP compliance, calibrated data loggers, certified driver, $500K pharma-specific coverage and zero claims — I'm at $7,200. That's $4.65/mile. Pharma freight demands pharma-grade service.", quality: "excellent", path: "master" },
                    { text: "$7,000 for this load. GDP compliance, certified driver, pharma insurance — premium service.", quality: "good", path: "master" },
                    { text: "$6,600 — above posted for the compliance requirements.", quality: "normal", path: "warning" },
                    { text: "$6,200 posted is fine.", quality: "weak", path: "reject_weak_final" },
                    { text: "Minimum $10,000 for pharma.", quality: "aggressive", path: "reject_rate_final" },
                    { text: "I'll take posted.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            {
                brokerQuestion: "$6,800 — and I need all documentation before I send the rate con. Certs, driver GDP certificate, data logger calibration cert.",
                dispatcherPrompt: "💡 $6,800 принято — отправь все документы сразу",
                suggestions: [
                    { text: "Chris, $6,800 works. I'm sending everything right now to your email: insurance certs, driver GDP certificate, data logger calibration cert. What's your email? You'll have it all in 10 minutes.", quality: "excellent", path: "master" },
                    { text: "$6,800 confirmed. Sending all docs now — insurance, GDP cert, data logger cert. Email?", quality: "good", path: "master" },
                    { text: "$6,800 works. Will send all documents. Email?", quality: "normal", path: "master" },
                    { text: "I'll try to get all docs together...", quality: "weak", path: "warning" },
                    { text: "That's a lot of paperwork.", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "I'll send docs after booking.", quality: "fail", path: "reject_email_final" }
                ]
            },
            {
                brokerResponse: "compliance@medfreight.com. Rate con coming once I receive docs. Pickup Thursday 5 AM at Pfizer Distribution, 2800 N Stemmons Fwy Dallas. Delivery Saturday 8 AM at NYC Medical Supply, 450 W 33rd St. No exceptions on timing.",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$6,800",
                    ratePerMile: "$4.39/mile",
                    feedback: `✅ ОТЛИЧНАЯ РАБОТА!\n\n💰 ФИНАНСЫ:\n• Ставка: $6,800\n• Posted: $6,200\n• Выше posted на: +$600 (+9.7%)\n• Дизель: ~$620 (1,550 mi)\n• Чистая прибыль: ~$6,180\n\n🎯 ЧТО СРАБОТАЛО:\n✅ Знал что такое GDP\n✅ Назвал конкретный data logger (Sensitech)\n✅ Водитель с GDP сертификатом\n✅ Pharma-specific страховка\n✅ Готов отправить все документы сразу\n\n💡 УРОК: Pharma брокеры не торгуются на документах. Знание GDP и готовность к compliance = доверие = лучшая ставка.`
                }
            }
        ],
        warning: [
            {
                brokerResponse: "What exactly is GDP? I need to know you understand this.", dispatcherPrompt: "💡 Брокер проверяет знание GDP", suggestions: [
                    { text: "Good Distribution Practice — continuous temp monitoring, data logger, chain of custody, qualified driver. We're GDP-compliant.", quality: "excellent", path: "master" },
                    { text: "GDP — temp monitoring, documentation, qualified drivers. We comply.", quality: "good", path: "master" },
                    { text: "GDP is pharmaceutical distribution standards. We follow them.", quality: "normal", path: "master" },
                    { text: "It's temperature requirements...", quality: "weak", path: "reject_weak_final" },
                    { text: "It's just a reefer load.", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "I'm not sure exactly.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            {
                brokerResponse: "Do you have a calibrated data logger?", dispatcherPrompt: "💡 Брокер настаивает на data logger", suggestions: [
                    { text: "Yes — Sensitech TempTale, calibrated every 6 months. Full temp report at delivery.", quality: "excellent", path: "master" },
                    { text: "Yes, calibrated data logger. Full report at delivery.", quality: "good", path: "master" },
                    { text: "Yes, we have data loggers.", quality: "normal", path: "master" },
                    { text: "We monitor temperature...", quality: "weak", path: "reject_weak_final" },
                    { text: "Reefer has built-in monitoring.", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "We can get one.", quality: "fail", path: "reject_weak_final" }
                ]
            }
        ],
        warning_strict: [{
            brokerResponse: "Do you actually have pharma experience or not?", dispatcherPrompt: "⚠️ Последний шанс", suggestions: [
                { text: "Yes — 4 years pharma, GDP-compliant, data loggers, certified driver. MC 889900, ColdChain Express.", quality: "good", path: "master" },
                { text: "Yes, pharma experience. MC 889900, ColdChain Express.", quality: "normal", path: "master" },
                { text: "We have reefer experience.", quality: "weak", path: "reject_weak_final" },
                { text: "Pharma is just cold freight.", quality: "aggressive", path: "reject_attitude_final" },
                { text: "I'll call back.", quality: "fail", path: "reject_weak_final" }
            ]
        }],
        reject_weak_final: [{ brokerResponse: "I can't risk pharma freight with a carrier who doesn't know GDP. Thanks.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: не знаешь pharma требований.\n\n💡 GDP, data loggers, certified drivers — обязательные знания для pharma freight." } }],
        reject_attitude_final: [{ brokerResponse: "Pharma freight is not for everyone. Moving on.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: плохое отношение к compliance.\n\n💡 Pharma брокеры — самые строгие. Compliance — не опция." } }],
        reject_rate_final: [{ brokerResponse: "That rate is unrealistic. Thanks anyway.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: нереальная ставка.\n\n💡 Pharma платит хорошо, но не в 2 раза выше рынка." } }],
        reject_email_final: [{ brokerResponse: "I need all docs before rate con. That's non-negotiable for pharma.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: нет документов.\n\n💡 Для pharma все документы должны быть готовы немедленно." } }]
    }
};


// ─────────────────────────────────────────────────────────────
// SCENARIO 6 — Steve | Dry Van Retail | Phoenix→Chicago
// Repeat broker, wants volume discount, tests loyalty vs profit
// ─────────────────────────────────────────────────────────────
const scenario_steve = {
    id: 15,
    title: "Retail Goods — Phoenix to Chicago",
    route: "Phoenix AZ → Chicago IL",
    distance: 1750,
    equipment: "Dry Van (53ft)",
    cargo: "Retail merchandise (clothing, home goods)",
    weight: "42,000 lbs",
    postedRate: "$4,400 ($2.51/mile)",
    deadline: "Pickup Monday 9 AM, Delivery Wednesday by 6 PM",
    brokerStyle: "Repeat broker, friendly but pushes for volume discount",
    difficulty: "standard",
    brokerName: "Steve",
    brokerCompany: "RetailLink Transport",
    initialMessage: "Hey, Steve from RetailLink. We've used you guys before — good experience. Got a dry van Phoenix to Chicago, retail goods. You available Monday?",
    paths: {
        master: [
            {
                brokerQuestion: "Good to hear from you again. MC 778899, right? FastLane? Confirm for me.",
                dispatcherPrompt: "💡 Брокер помнит тебя — подтверди и укрепи отношения",
                suggestions: [
                    { text: "That's us, Steve — MC 778899, FastLane Logistics. Good to work with you again. We've got a 53ft dry van available Monday, driver ready. What are the load details?", quality: "excellent", path: "master" },
                    { text: "Yes, MC 778899, FastLane. Good to hear from you Steve. Available Monday.", quality: "good", path: "master" },
                    { text: "Yes, MC 778899, FastLane Logistics.", quality: "normal", path: "master" },
                    { text: "Yes, that's us...", quality: "weak", path: "warning" },
                    { text: "What's the rate first?", quality: "aggressive", path: "warning_strict" },
                    { text: "I'm not sure which MC...", quality: "fail", path: "warning_strict" }
                ]
            },
            {
                brokerQuestion: "Great. 42,000 lbs retail goods — clothing and home goods. No special requirements. Driver available Monday 9 AM in Phoenix?",
                dispatcherPrompt: "💡 Стандартный груз — подтверди наличие трака в Phoenix",
                suggestions: [
                    { text: "Driver is in Tucson right now, 2 hours from Phoenix. He'll be at your shipper Monday 8:45 AM — 15 minutes early. Empty since Friday, pre-trip done. What's the pickup address?", quality: "excellent", path: "master" },
                    { text: "Driver in Tucson, 2 hours out. Can be there 8:45 AM Monday. What's the address?", quality: "good", path: "master" },
                    { text: "Driver available Monday 9 AM in Phoenix area.", quality: "normal", path: "master" },
                    { text: "Driver should be available...", quality: "weak", path: "warning" },
                    { text: "Depends on the rate.", quality: "aggressive", path: "warning_strict" },
                    { text: "I'll need to check driver availability.", quality: "fail", path: "warning" }
                ]
            },
            {
                brokerQuestion: "Perfect. Now look — we move 8-10 loads a week on this lane. I want to give you regular business, but I need a better rate than one-off. What's your best number?",
                dispatcherPrompt: "💡 Брокер предлагает объём — не продавайся слишком дёшево!",
                suggestions: [
                    { text: "Steve, I appreciate the volume offer — 8-10 loads a week is serious business. For regular committed volume I can do $4,200 per load. That's a $200 discount from what I'd normally ask. But I need a written commitment — minimum 6 loads a week for 90 days.", quality: "excellent", path: "master" },
                    { text: "$4,300 for regular volume. I need at least 6 loads/week commitment in writing.", quality: "good", path: "master" },
                    { text: "$4,200 for regular business.", quality: "normal", path: "warning" },
                    { text: "$3,800 for volume.", quality: "weak", path: "reject_weak_final" },
                    { text: "Volume doesn't change our rates.", quality: "aggressive", path: "reject_rate_final" },
                    { text: "I'll take posted $4,400.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            {
                brokerQuestion: "I can do $4,000 per load and I'll send you 6 loads minimum per week. That's $24,000 a week guaranteed. Deal?",
                dispatcherPrompt: "💡 $4,000 x 6 loads = $24K/week — хорошая сделка, но торгуйся",
                suggestions: [
                    { text: "Steve, $4,000 works if we put it in a carrier agreement — 6 loads minimum per week, 90-day term, 30-day notice to cancel. That protects both of us. $24K a week is great business and I want to make it official. Can you send a carrier agreement?", quality: "excellent", path: "master" },
                    { text: "$4,000 per load, 6 minimum per week — I want that in writing. Carrier agreement?", quality: "good", path: "master" },
                    { text: "$4,000 works. Let's do it.", quality: "normal", path: "master" },
                    { text: "Okay, $4,000 is fine.", quality: "weak", path: "warning" },
                    { text: "$4,000 is too low for this lane.", quality: "aggressive", path: "reject_rate_final" },
                    { text: "Sure, whatever you say.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            {
                brokerQuestion: "I'll send a carrier agreement this week. For now, let's do this load at $4,000 and start the relationship. Email?",
                dispatcherPrompt: "💡 Сделка! Email для rate con + начало долгосрочных отношений",
                suggestions: [
                    { text: "dispatch@fastlanelogistics.com. Rate con and carrier agreement both welcome. Steve, this is exactly the kind of partnership we're looking for — consistent volume, fair rates, professional relationship. Driver confirmed Monday 8:45 AM.", quality: "excellent", path: "master" },
                    { text: "dispatch@fastlanelogistics.com. Looking forward to the carrier agreement. Driver confirmed Monday.", quality: "good", path: "master" },
                    { text: "dispatch@fastlanelogistics.com. Confirmed Monday 9 AM.", quality: "normal", path: "master" },
                    { text: "Let me find the email...", quality: "weak", path: "warning" },
                    { text: "Just text it.", quality: "aggressive", path: "reject_email_final" },
                    { text: "We don't use email.", quality: "fail", path: "reject_email_final" }
                ]
            },
            {
                brokerResponse: "Rate con sent. Carrier agreement coming Thursday. Pickup Monday 9 AM at Target Distribution, 4800 W Van Buren Phoenix. Delivery Wednesday 6 PM at Chicago DC, 2200 S Halsted. Welcome to the team.",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$4,000 (+ 6 loads/week)",
                    ratePerMile: "$2.29/mile",
                    feedback: `✅ ОТЛИЧНАЯ РАБОТА!\n\n💰 ФИНАНСЫ (один груз):\n• Ставка: $4,000\n• Posted: $4,400\n• Ниже posted на: -$400 (но...)\n• Дизель: ~$700 (1,750 mi)\n• Чистая прибыль: ~$3,300\n\n📈 РЕАЛЬНАЯ КАРТИНА:\n• 6 грузов/неделю × $4,000 = $24,000/неделю\n• $24,000 × 52 недели = $1,248,000/год\n• Стабильность важнее $400 на одном грузе!\n\n🎯 ЧТО СРАБОТАЛО:\n✅ Не продался за $3,800 — держал $4,000\n✅ Потребовал письменное соглашение\n✅ Понял ценность долгосрочных отношений\n✅ Профессионально закрыл сделку\n\n💡 УРОК: Объём = стабильность. Небольшая скидка за гарантированные 6 грузов/неделю — умный бизнес.`
                }
            }
        ],
        warning: [
            {
                brokerResponse: "Can you confirm your MC and company name?", dispatcherPrompt: "💡 Брокер переспрашивает", suggestions: [
                    { text: "MC 778899, FastLane Logistics. Good to work with you again Steve.", quality: "excellent", path: "master" },
                    { text: "MC 778899, FastLane Logistics.", quality: "good", path: "master" },
                    { text: "MC 778899.", quality: "normal", path: "master" },
                    { text: "I'll need to check...", quality: "weak", path: "reject_weak_final" },
                    { text: "You should have it on file.", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "I don't have it handy.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            {
                brokerResponse: "Is your driver actually available Monday 9 AM in Phoenix?", dispatcherPrompt: "💡 Брокер хочет подтверждение", suggestions: [
                    { text: "Driver in Tucson, 2 hours out. Confirmed Monday 8:45 AM.", quality: "excellent", path: "master" },
                    { text: "Yes, driver available Monday 9 AM Phoenix.", quality: "good", path: "master" },
                    { text: "Driver available Monday.", quality: "normal", path: "master" },
                    { text: "Should be available...", quality: "weak", path: "reject_weak_final" },
                    { text: "Depends on traffic.", quality: "aggressive", path: "reject_timing_final" },
                    { text: "I'll need to check.", quality: "fail", path: "reject_weak_final" }
                ]
            }
        ],
        warning_strict: [{
            brokerResponse: "I need to confirm your MC before we go further.", dispatcherPrompt: "⚠️ Последний шанс", suggestions: [
                { text: "MC 778899, FastLane Logistics.", quality: "good", path: "master" },
                { text: "MC 778899.", quality: "normal", path: "master" },
                { text: "I'll find it.", quality: "weak", path: "reject_weak_final" },
                { text: "You have it on file.", quality: "aggressive", path: "reject_attitude_final" },
                { text: "I'll call back.", quality: "fail", path: "reject_weak_final" }
            ]
        }],
        reject_weak_final: [{ brokerResponse: "I need a carrier who's prepared. Thanks.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: неподготовленный диспетчер.\n\n💡 Даже с repeat broker — знай свои данные наизусть." } }],
        reject_attitude_final: [{ brokerResponse: "Not the right attitude for a long-term partner. Moving on.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: плохое отношение.\n\n💡 Repeat broker — это партнёр. Относись соответственно." } }],
        reject_timing_final: [{ brokerResponse: "Can't use you if you can't confirm the pickup. Thanks.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: не можешь подтвердить тайминг.\n\n💡 Всегда знай где твой трак и когда он свободен." } }],
        reject_rate_final: [{ brokerResponse: "Volume discount is standard in this business. If you can't work with that, I'll find someone who can.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: не смог договориться о ставке.\n\n💡 Объём = скидка. Это нормально. Главное — не уходить ниже себестоимости." } }],
        reject_email_final: [{ brokerResponse: "I need email for the rate con and carrier agreement. Can't proceed without it.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: нет email.\n\n💡 Email — основа документооборота. Всегда имей рабочий адрес." } }]
    }
};


// ─────────────────────────────────────────────────────────────
// SCENARIO 7 — Brian | Dry Van Auto Parts | Detroit→Atlanta
// Aggressive broker, tries every trick, tests composure
// ─────────────────────────────────────────────────────────────
const scenario_brian = {
    id: 16,
    title: "Auto Parts — Detroit to Atlanta",
    route: "Detroit MI → Atlanta GA",
    distance: 730,
    equipment: "Dry Van (53ft)",
    cargo: "Auto parts (engine components)",
    weight: "36,000 lbs",
    postedRate: "$2,100 ($2.88/mile)",
    deadline: "Pickup tomorrow 7 AM, Delivery tomorrow by 8 PM",
    brokerStyle: "Aggressive, uses pressure tactics, tries to lowball",
    difficulty: "hard",
    brokerName: "Brian",
    brokerCompany: "AutoFreight Direct",
    initialMessage: "Brian, AutoFreight Direct. Detroit to Atlanta, auto parts, 36,000 lbs, tomorrow. I've got 10 carriers calling me right now. You want this load or not?",
    paths: {
        master: [
            {
                brokerQuestion: "MC and company. Fast.",
                dispatcherPrompt: "💡 Агрессивный брокер давит — отвечай быстро и уверенно",
                suggestions: [
                    { text: "MC 445566, Midwest Auto Carriers. Dry van in Detroit, available tomorrow 7 AM. We specialize in auto parts — done this Detroit-Atlanta lane 100+ times. What's the pickup address?", quality: "excellent", path: "master" },
                    { text: "MC 445566, Midwest Auto Carriers. Detroit, available tomorrow 7 AM.", quality: "good", path: "master" },
                    { text: "MC 445566, Midwest Auto Carriers.", quality: "normal", path: "warning" },
                    { text: "One second...", quality: "weak", path: "warning" },
                    { text: "How many carriers are you actually calling?", quality: "aggressive", path: "warning_strict" },
                    { text: "We might have something...", quality: "fail", path: "warning_strict" }
                ]
            },
            {
                brokerQuestion: "I've got posted $2,100. That's what I'm paying. Take it or I'm calling the next carrier.",
                dispatcherPrompt: "💡 Брокер сразу давит posted — НЕ принимай! Торгуйся уверенно",
                suggestions: [
                    { text: "Brian, $2,100 on 730 miles with same-day delivery doesn't work. I'm at $2,600. That's $3.56/mile — fair for auto parts with a driver who knows this lane. If your other carriers are taking $2,100 on a same-day run, good luck with that.", quality: "excellent", path: "master" },
                    { text: "$2,500 for this one. Same-day delivery, auto parts specialist. That's my number.", quality: "good", path: "master" },
                    { text: "$2,300 — a bit above posted for same-day service.", quality: "normal", path: "warning" },
                    { text: "Okay, $2,100 is fine.", quality: "weak", path: "reject_weak_final" },
                    { text: "Minimum $4,000 for same-day.", quality: "aggressive", path: "reject_rate_final" },
                    { text: "Sure, I'll take posted.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            {
                brokerQuestion: "Fine, $2,300. But I need driver there at 6:30 AM, not 7. And no detention — driver loads and goes.",
                dispatcherPrompt: "💡 Брокер принял $2,300 но добавил условия — оцени реалистично",
                suggestions: [
                    { text: "Brian, 6:30 AM works — driver can be there. But on detention: if shipper isn't ready and driver waits more than 2 hours, detention applies at $50/hour. That's standard. If shipper is ready, driver loads and goes — no problem.", quality: "excellent", path: "master" },
                    { text: "$2,300, 6:30 AM confirmed. Detention after 2 hours at $50/hour — standard policy.", quality: "good", path: "master" },
                    { text: "$2,300, 6:30 AM works. Detention policy applies if needed.", quality: "normal", path: "master" },
                    { text: "Okay, 6:30 AM, no detention...", quality: "weak", path: "warning" },
                    { text: "Detention is always charged.", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "6:30 AM might be tight.", quality: "fail", path: "reject_timing_final" }
                ]
            },
            {
                brokerQuestion: "Fine. Insurance certs — send them now, before I send rate con.",
                dispatcherPrompt: "💡 Страховка нужна сразу — имей готовую",
                suggestions: [
                    { text: "Sending right now. $1M liability, $100K cargo through Progressive. What's your email? You'll have them in 3 minutes.", quality: "excellent", path: "master" },
                    { text: "$1M liability, $100K cargo. Sending now — email?", quality: "good", path: "master" },
                    { text: "$1M liability, $100K cargo. Will send. Email?", quality: "normal", path: "master" },
                    { text: "I'll send them later...", quality: "weak", path: "reject_email_final" },
                    { text: "You'll get them after booking.", quality: "aggressive", path: "reject_email_final" },
                    { text: "I need to request them from our agent.", quality: "fail", path: "reject_email_final" }
                ]
            },
            {
                brokerQuestion: "dispatch@autofreightdirect.com. Rate con coming. Ford Assembly Plant, 1 American Rd Dearborn MI, 6:30 AM. Delivery Atlanta Auto Depot, 3300 Peachtree Rd, 8 PM tomorrow. Any issues, call me — not the shipper, not the receiver.",
                dispatcherPrompt: "💡 Финальные детали — подтверди всё чётко",
                suggestions: [
                    { text: "Got it Brian. Certs going to dispatch@autofreightdirect.com now. Driver confirmed: Ford Assembly Dearborn 6:30 AM tomorrow, Atlanta Auto Depot 8 PM. I'll call you directly if anything comes up. Thanks for the load.", quality: "excellent", path: "master" },
                    { text: "Sending certs now. Both locations confirmed. Will call you directly if any issues.", quality: "good", path: "master" },
                    { text: "Confirmed. Sending certs. Driver knows the plan.", quality: "normal", path: "master" },
                    { text: "Okay, I'll tell the driver.", quality: "weak", path: "warning" },
                    { text: "Driver will handle it.", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "I'll have driver call if needed.", quality: "fail", path: "reject_attitude_final" }
                ]
            },
            {
                brokerResponse: "Rate con sent. Certs received. Don't be late.",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$2,300",
                    ratePerMile: "$3.15/mile",
                    feedback: `✅ ОТЛИЧНАЯ РАБОТА!\n\n💰 ФИНАНСЫ:\n• Ставка: $2,300\n• Posted: $2,100\n• Выше posted на: +$200 (+9.5%)\n• Дизель: ~$292 (730 mi)\n• Чистая прибыль: ~$2,008\n\n🎯 ЧТО СРАБОТАЛО:\n✅ Не испугался агрессии — ответил быстро\n✅ Не принял posted $2,100\n✅ Отстоял detention policy\n✅ Имел страховку готовую немедленно\n✅ Закрыл сделку чётко\n\n💡 УРОК: "У меня 10 перевозчиков" — классический блеф. Агрессивный брокер уважает уверенность. Паника и уступки — слабость.`
                }
            }
        ],
        warning: [
            {
                brokerResponse: "MC and company — I don't have all day.", dispatcherPrompt: "💡 Брокер переспрашивает", suggestions: [
                    { text: "MC 445566, Midwest Auto Carriers. Detroit, available tomorrow 7 AM.", quality: "excellent", path: "master" },
                    { text: "MC 445566, Midwest Auto Carriers.", quality: "good", path: "master" },
                    { text: "MC 445566.", quality: "normal", path: "master" },
                    { text: "I'm looking for it...", quality: "weak", path: "reject_weak_final" },
                    { text: "Why so many questions?", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "I'll call back.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            {
                brokerResponse: "Can you make 6:30 AM or not? Straight answer.", dispatcherPrompt: "💡 Брокер хочет чёткий ответ", suggestions: [
                    { text: "Yes — driver is in Detroit, 20 minutes from Dearborn. 6:30 AM confirmed.", quality: "excellent", path: "master" },
                    { text: "Yes, 6:30 AM confirmed.", quality: "good", path: "master" },
                    { text: "Yes, driver can make 6:30 AM.", quality: "normal", path: "master" },
                    { text: "Should be able to...", quality: "weak", path: "reject_weak_final" },
                    { text: "Traffic is unpredictable.", quality: "aggressive", path: "reject_timing_final" },
                    { text: "Earliest is 8 AM.", quality: "fail", path: "reject_timing_final" }
                ]
            }
        ],
        warning_strict: [{
            brokerResponse: "MC. Now.", dispatcherPrompt: "⚠️ Последний шанс", suggestions: [
                { text: "MC 445566, Midwest Auto Carriers.", quality: "good", path: "master" },
                { text: "MC 445566.", quality: "normal", path: "master" },
                { text: "Fine, 445566.", quality: "weak", path: "reject_weak_final" },
                { text: "This is ridiculous.", quality: "aggressive", path: "reject_attitude_final" },
                { text: "I'll call back.", quality: "fail", path: "reject_weak_final" }
            ]
        }],
        reject_weak_final: [{ brokerResponse: "Moving on. Next carrier.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: неподготовленный диспетчер.\n\n💡 Агрессивный брокер не ждёт. Знай MC наизусть, отвечай мгновенно." } }],
        reject_attitude_final: [{ brokerResponse: "Don't need that attitude. Next.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: плохое отношение.\n\n💡 Агрессия в ответ на агрессию — проигрыш. Оставайся профессиональным." } }],
        reject_timing_final: [{ brokerResponse: "Can't use you. Need someone who can make the window.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: не можешь сделать пикап вовремя.\n\n💡 Никогда не берись за груз если не уверен в тайминге." } }],
        reject_rate_final: [{ brokerResponse: "Way off market. Next carrier.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: нереальная ставка.\n\n💡 На коротких рейсах (730 mi) нельзя просить в 2 раза выше posted." } }],
        reject_email_final: [{ brokerResponse: "I need certs before rate con. That's how it works.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ Брокер отказал: нет страховки.\n\n💡 Страховые сертификаты должны быть готовы к отправке в любой момент." } }]
    }
};


// ─────────────────────────────────────────────────────────────
// EXPORT — combine all scenarios into allScenarios array
// ─────────────────────────────────────────────────────────────
const allScenarios = [
    scenario_tom,
    scenario_dave,
    scenario_kevin,
    scenario_mark,
    scenario_chris,
    scenario_steve,
    scenario_brian
];

console.log('✅ Scenarios v2.0 loaded:', allScenarios.length, 'scenarios');
