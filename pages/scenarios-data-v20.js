// DIALOGUE #20 - Flatbed Steel (БЕЗ ТУПИКОВ - ГАРАНТИЯ!)
// Houston TX → Detroit MI, 1,270 miles
// Posted: $2,500 ($1.97/mile), Target: $2,800-3,000
// Created: March 8, 2026
// ПРАВИЛО: Все слабые/плохие ответы ведут СРАЗУ в финальный outcome!

console.log('🔵 Loading scenarios-data-v20.js...');

const scenario20 = {
    id: 20,
    route: "Houston TX → Detroit MI",
    distance: 1270,
    equipment: "Flatbed (48ft)",
    cargo: "Steel coils",
    weight: "46,000 lbs",
    postedRate: "$2,500 ($1.97/mile)",
    deadline: "Pickup tomorrow 6 AM, Delivery in 2 days",
    brokerStyle: "Professional steel broker - safety focused",
    difficulty: "hard",
    initialMessage: "Good morning! This is Mike from SteelHaul Logistics.\nI'm calling about your posted flatbed load Houston to Detroit with steel coils.\nIs this load still available?",

    paths: {
        master: [
            {
                brokerQuestion: "Good morning! This is Tom from SteelFreight Brokers.\nYes, still available.\nWhat's your MC number, company name, and how many flatbed trucks do you operate?",
                dispatcherPrompt: "💎 Брокер проверяет вашу компанию - дайте MC, название, размер fleet!",
                suggestions: [
                    { text: "Good morning Tom! MC 445566, SteelHaul Logistics. We operate 25 flatbed trucks, all 48ft with tarps, chains, and binders. Specialized in steel for 4 years. What's the exact steel type and any special securing requirements?", quality: "excellent", analytics: "✨ Дал MC, компанию, fleet 25 flatbeds, equipment (tarps/chains/binders), специализацию 4 года, встречный вопрос!", path: "master" },
                    { text: "Morning! MC 445566, SteelHaul Logistics. 25 flatbed trucks with tarps and chains. What steel exactly?", quality: "good", analytics: "✔️ Дал MC, компанию, fleet с equipment, задал вопрос.", path: "master" },
                    { text: "MC 445566, SteelHaul Logistics. Have flatbeds.", quality: "normal", analytics: "⚪ Дал только MC и компанию, без деталей fleet.", path: "master" },
                    { text: "MC 445566... we have some flatbeds...", quality: "weak", analytics: "⚠️ Неуверенный ответ, нет конкретики!", path: "reject_weak_final" },
                    { text: "Why all these questions? Tell me the rate!", quality: "aggressive", analytics: "🔴 Грубость! Отказ отвечать на вопросы!", path: "reject_attitude_final" },
                    { text: "Flatbed available. What's the load?", quality: "fail", analytics: "❌ Не дал MC number - критическая ошибка!", path: "reject_nomc_final" }
                ]
            },
            {
                brokerQuestion: "Good! 1,270 miles Houston to Detroit. Steel coils - 46,000 lbs. Heavy cargo, needs proper securing. Where is your flatbed now and do you have tarps, chains, and binders?",
                dispatcherPrompt: "💎 Брокер спрашивает местоположение flatbed и наличие securing equipment!",
                suggestions: [
                    { text: "Perfect! Flatbed in Houston at steel yard, empty since yesterday. Yes, equipped with 4 tarps, 8 chains, and 12 binders - all rated for steel coils. Driver can be at pickup 6 AM sharp. What's the exact pickup address and coil dimensions?", quality: "excellent", analytics: "✨ Точное местоположение (Houston steel yard), статус (empty), equipment с количеством (4 tarps, 8 chains, 12 binders), rated for steel, готовность 6 AM, встречный вопрос!", path: "master" },
                    { text: "Flatbed in Houston at steel yard, empty. Has 4 tarps, 8 chains, 12 binders. Driver ready 6 AM. What's pickup address?", quality: "good", analytics: "✔️ Местоположение, equipment с количеством, готовность, вопрос.", path: "master" },
                    { text: "Flatbed in Houston. Has tarps, chains, and binders.", quality: "normal", analytics: "⚪ Местоположение и equipment, но без деталей количества.", path: "master" },
                    { text: "Should be in Houston... has equipment...", quality: "weak", analytics: "⚠️ Неуверенность в местоположении и equipment!", path: "reject_weak_final" },
                    { text: "Just tell me the rate first!", quality: "aggressive", analytics: "🔴 Отказ обсуждать детали груза!", path: "reject_attitude_final" },
                    { text: "Driver can't be there until 8 AM... 6 AM too early.", quality: "fail", analytics: "❌ Не может вовремя на pickup!", path: "reject_timing_final" }
                ]
            },
            {
                brokerQuestion: "Excellent! Steel coils require experienced drivers who understand proper securing. What's your driver's experience with steel loads? Clean DOT record?",
                dispatcherPrompt: "💎 Брокер проверяет опыт водителя со steel и DOT record!",
                suggestions: [
                    { text: "Our driver has 5 years experience specifically with steel coils - understands proper chaining, weight distribution, no sudden stops. Clean DOT inspection record - last inspection 1 month ago, zero violations. Safety rating Satisfactory. He's certified in steel load securing.", quality: "excellent", analytics: "✨ 5 лет опыта со steel coils, понимание securing/distribution, DOT clean (1 месяц назад, 0 violations), Safety rating, certification!", path: "master" },
                    { text: "Driver has 5 years steel experience. Clean DOT record, last inspection 1 month ago, zero violations. Certified in steel securing.", quality: "good", analytics: "✔️ Опыт 5 лет, DOT clean с деталями, certification.", path: "master" },
                    { text: "Driver experienced with steel. DOT record clean.", quality: "normal", analytics: "⚪ Опыт есть, DOT clean, но без деталей.", path: "master" },
                    { text: "Driver has some steel experience... DOT should be okay...", quality: "weak", analytics: "⚠️ Неуверенность в опыте и DOT!", path: "reject_weak_final" },
                    { text: "Driver knows how to drive. That's enough!", quality: "aggressive", analytics: "🔴 Пренебрежение важностью опыта со steel!", path: "reject_attitude_final" },
                    { text: "Driver has regular license. Is that okay?", quality: "fail", analytics: "❌ Нет опыта со steel!", path: "reject_experience_final" }
                ]
            },
            {
                brokerQuestion: "Good! Insurance: Do you have $100K cargo coverage? Liability coverage? I need current certificates for steel.",
                dispatcherPrompt: "💎 Брокер требует подтверждение страховки $100K cargo + liability!",
                suggestions: [
                    { text: "Yes! $100K cargo insurance through Progressive Commercial. $1M liability coverage. Both certificates current, expire April 2028. I'll email both certificates immediately after booking. Insurance agent is available if you need verification. What's your email for certificates?", quality: "excellent", analytics: "✨ $100K cargo, $1M liability, компания (Progressive), даты (April 2028), готовность отправить, agent доступен, встречный вопрос!", path: "master" },
                    { text: "Yes, $100K cargo, $1M liability through Progressive. Current certificates, expire April 2028. I'll send after booking.", quality: "good", analytics: "✔️ Coverage детали, компания, даты, готовность.", path: "master" },
                    { text: "$100K cargo, $1M liability. Certificates current.", quality: "normal", analytics: "⚪ Только суммы coverage, без деталей.", path: "master" },
                    { text: "Should have $100K... liability is good...", quality: "weak", analytics: "⚠️ Неуверенность в страховке!", path: "reject_weak_final" },
                    { text: "Insurance is fine! Let's talk rate.", quality: "aggressive", analytics: "🔴 Отказ обсуждать insurance!", path: "reject_attitude_final" },
                    { text: "We have $50K coverage... is that enough?", quality: "fail", analytics: "❌ Недостаточная страховка для steel!", path: "reject_insurance_final" }
                ]
            },
            {
                brokerQuestion: "Perfect! Communication: What's your tracking and communication policy? How often will you update me? Delay notification timing?",
                dispatcherPrompt: "💎 Брокер хочет знать tracking policy, частоту updates и когда уведомите о задержках!",
                suggestions: [
                    { text: "Excellent question! We provide GPS tracking link immediately after pickup. Updates every 4 hours via text/email with location. If any delay occurs, we notify you minimum 8 hours before appointment - never surprises. Driver available 24/7 by phone. After delivery, we send POD within 2 hours. Complete transparency.", quality: "excellent", analytics: "✨ GPS tracking, updates каждые 4 часа (text/email), delay notification 8 часов заранее, driver 24/7, POD в 2 часа!", path: "master" },
                    { text: "GPS tracking after pickup. Updates every 4 hours. Delay notification 8 hours before appointment. Driver available 24/7.", quality: "good", analytics: "✔️ Tracking, частота updates, timing notification, доступность.", path: "master" },
                    { text: "GPS tracking. Regular updates. Will notify about delays.", quality: "normal", analytics: "⚪ Tracking есть, updates будут, но без конкретики.", path: "master" },
                    { text: "We'll send updates... will call if problems...", quality: "weak", analytics: "⚠️ Расплывчато, нет конкретных обязательств!", path: "reject_weak_final" },
                    { text: "Driver will call when he gets there.", quality: "aggressive", analytics: "🔴 Минимум коммуникации, нет tracking!", path: "reject_attitude_final" },
                    { text: "No tracking system. Driver has phone.", quality: "fail", analytics: "❌ Нет GPS tracking!", path: "reject_communication_final" }
                ]
            },
            {
                brokerQuestion: "Excellent! Delivery: This load has appointment Wednesday 3 PM in Detroit. It's a steel mill - they're strict about timing. Can you commit to Wednesday 3 PM? What's your backup plan for delays?",
                dispatcherPrompt: "💎 Брокер требует commitment на appointment Wednesday 3 PM и backup plan!",
                suggestions: [
                    { text: "Absolutely committed to Wednesday 3 PM! Based on 1,270 miles and driver's HOS, we'll depart Houston tomorrow 6 AM, arrive Detroit Wednesday morning with 5-hour buffer. If traffic or weather delay, driver has backup route via I-35/I-69. We monitor traffic constantly. If major delay expected, I'll call you 10 hours ahead to coordinate with steel mill. Zero tolerance for late delivery.", quality: "excellent", analytics: "✨ Commitment на 3 PM, расчет времени с 5-hour buffer, backup route (I-35/I-69), мониторинг traffic, early notification (10 часов), zero tolerance!", path: "master" },
                    { text: "Yes, committed to Wednesday 3 PM. We'll arrive Wednesday morning with buffer. Have backup route if delays. Will notify early if problems.", quality: "good", analytics: "✔️ Commitment, buffer time, backup route, early notification.", path: "master" },
                    { text: "Yes, Wednesday 3 PM works. We'll plan accordingly.", quality: "normal", analytics: "⚪ Только commitment, без деталей плана.", path: "master" },
                    { text: "We'll try for Wednesday 3 PM... should be okay...", quality: "weak", analytics: "⚠️ 'Try' вместо commitment - красный флаг!", path: "reject_weak_final" },
                    { text: "Traffic is unpredictable. Can't guarantee.", quality: "aggressive", analytics: "🔴 Отказ дать commitment!", path: "reject_attitude_final" },
                    { text: "Driver will get there when he gets there.", quality: "fail", analytics: "❌ Нет commitment вообще!", path: "reject_commitment_final" }
                ]
            },
            {
                brokerQuestion: "Great planning! Loading procedure: Pickup at steel yard, loading takes 2 hours. Do you have tarps, chains, and binders? Will your driver inspect the securing?",
                dispatcherPrompt: "💎 Брокер проверяет наличие equipment (tarps, chains, binders) и inspection procedure!",
                suggestions: [
                    { text: "Yes! Flatbed equipped with 4 heavy-duty tarps, 8 chains rated 5,400 lbs each, and 12 binders. Driver will inspect entire securing before departure - check chain tension, binder tightness, tarp coverage. He'll take photos for documentation. If any securing issues, he'll request re-securing before leaving. We never leave with improperly secured steel.", quality: "excellent", analytics: "✨ 4 tarps, 8 chains (rated 5,400 lbs), 12 binders, полная inspection procedure (tension/tightness/coverage), photos, quality control, never leave improperly!", path: "master" },
                    { text: "Yes, have 4 tarps, 8 chains rated 5,400 lbs, and 12 binders. Driver will inspect securing and take photos before leaving.", quality: "good", analytics: "✔️ Все equipment с количеством и rating, inspection, photos.", path: "master" },
                    { text: "Yes, have tarps, chains, and binders. Driver will inspect.", quality: "normal", analytics: "⚪ Equipment есть, inspection будет, но без деталей.", path: "master" },
                    { text: "Should have equipment... driver will check...", quality: "weak", analytics: "⚠️ Неуверенность в наличии equipment!", path: "reject_weak_final" },
                    { text: "Driver knows what to do.", quality: "aggressive", analytics: "🔴 Нет конкретики по equipment!", path: "reject_attitude_final" },
                    { text: "Don't have chains. Can we use straps?", quality: "fail", analytics: "❌ Нет proper equipment для steel!", path: "reject_equipment_final" }
                ]
            },
            {
                brokerQuestion: "Perfect! Weight distribution: Steel coils are 46,000 lbs. Does your driver understand proper weight distribution on flatbed? This is critical for safety.",
                dispatcherPrompt: "💎 Брокер проверяет понимание weight distribution для steel coils!",
                suggestions: [
                    { text: "Absolutely! Driver fully understands weight distribution for steel coils - coils positioned over axles, never at rear. He'll verify weight with scale ticket before departure. Knows how to adjust if needed. Safety is priority #1 with heavy steel.", quality: "excellent", analytics: "✨ Понимание distribution (over axles, not rear), scale ticket verification, adjustment capability, safety priority!", path: "master" },
                    { text: "Yes, driver understands weight distribution - coils over axles. Will verify with scale ticket.", quality: "good", analytics: "✔️ Понимание distribution, verification.", path: "master" },
                    { text: "Driver understands weight distribution.", quality: "normal", analytics: "⚪ Понимание есть, без деталей.", path: "master" },
                    { text: "Driver will figure it out...", quality: "weak", analytics: "⚠️ Нет понимания важности!", path: "reject_weak_final" },
                    { text: "Just load it and go!", quality: "aggressive", analytics: "🔴 Опасное пренебрежение safety!", path: "reject_attitude_final" },
                    { text: "What's weight distribution?", quality: "fail", analytics: "❌ Не знает basics!", path: "reject_experience_final" }
                ]
            },
            {
                brokerQuestion: "Excellent! References: Can you provide 2-3 broker references who can confirm your reliability with steel loads? I like to verify new carriers.",
                dispatcherPrompt: "💎 Брокер хочет 2-3 references от других брокеров для проверки надежности!",
                suggestions: [
                    { text: "Absolutely! I can provide 3 broker references right now: 1) Steve Martinez at SteelFreight (worked 2 years, 60+ steel loads), 2) Rachel Kim at MetalHaul Logistics (1.5 years, 45+ loads), 3) James Brown at HeavyLoad Express (8 months, 25+ loads). All can confirm our reliability, on-time delivery, and zero damage claims. I'll email their contact info with permission. Would you like to call them before booking?", quality: "excellent", analytics: "✨ 3 references с именами, компаниями, длительностью работы, количеством loads, zero damage claims, готовность дать contacts!", path: "master" },
                    { text: "Yes! Can provide 3 broker references - Steve at SteelFreight, Rachel at MetalHaul, James at HeavyLoad. All can confirm our steel reliability. I'll send contacts.", quality: "good", analytics: "✔️ 3 references с именами и компаниями, готовность отправить.", path: "master" },
                    { text: "Yes, can provide broker references.", quality: "normal", analytics: "⚪ Согласие дать references, но без деталей.", path: "master" },
                    { text: "I think I can find some references...", quality: "weak", analytics: "⚠️ Неуверенность, нет готовых references!", path: "reject_weak_final" },
                    { text: "Why need references? We're good!", quality: "aggressive", analytics: "🔴 Оборонительная позиция, отказ!", path: "reject_attitude_final" },
                    { text: "We're new. No references yet.", quality: "fail", analytics: "❌ Нет references для проверки!", path: "reject_references_final" }
                ]
            },
            {
                brokerQuestion: "Great! Detention policy: If loading or unloading takes longer than 2 hours, what's your detention rate? And payment terms: do you accept QuickPay or standard 30 days?",
                dispatcherPrompt: "💎 Брокер спрашивает detention rate после 2 часов и payment terms (QuickPay или NET 30)!",
                suggestions: [
                    { text: "Detention after 2 hours free time is $50/hour - industry standard. We're flexible on payment: QuickPay available at 3% fee (paid in 24 hours), or standard NET 30 days at full rate. Your choice. For long-term partnership, we can discuss better terms. What works for you?", quality: "excellent", analytics: "✨ Detention $50/hour после 2 free hours, QuickPay 3% (24h) или NET 30, flexibility, long-term discussion!", path: "master" },
                    { text: "Detention $50/hour after 2 hours. QuickPay 3% or NET 30. Your choice.", quality: "good", analytics: "✔️ Detention rate, free time, payment options.", path: "master" },
                    { text: "Detention $50/hour. NET 30 payment.", quality: "normal", analytics: "⚪ Только detention и payment, без деталей.", path: "master" },
                    { text: "Standard detention... payment terms flexible...", quality: "weak", analytics: "⚠️ Расплывчато, нет конкретных цифр!", path: "reject_weak_final" },
                    { text: "Detention $100/hour. QuickPay only.", quality: "aggressive", analytics: "🔴 Завышенная detention, нет flexibility!", path: "reject_attitude_final" },
                    { text: "Need payment upfront before pickup.", quality: "fail", analytics: "❌ Нереальные payment terms!", path: "reject_terms_final" }
                ]
            },
            {
                brokerQuestion: "Good! Last questions: Do you have a backup flatbed available if this truck breaks down? And what's your claims history - any cargo damage claims in last 2 years?",
                dispatcherPrompt: "💎 Брокер проверяет наличие backup flatbed и claims history за 2 года!",
                suggestions: [
                    { text: "Yes! We have 3 backup flatbeds in Houston area - if primary truck has mechanical issue, backup can be there within 2 hours to transfer load and continue. Claims history: zero cargo damage claims in last 5 years. Clean record. We maintain trucks religiously to prevent breakdowns. Our reliability is 99.9% on-time delivery. You're in safe hands.", quality: "excellent", analytics: "✨ 3 backup flatbeds в Houston, 2 hours response, zero claims за 5 лет, maintenance program, 99.9% on-time!", path: "master" },
                    { text: "Yes, have 3 backup flatbeds in Houston. Zero cargo claims in 5 years. 99.9% on-time.", quality: "good", analytics: "✔️ Backup flatbeds, zero claims, reliability metric.", path: "master" },
                    { text: "Have backup trucks. No recent claims.", quality: "normal", analytics: "⚪ Backup есть, claims нет, без деталей.", path: "master" },
                    { text: "Should have backup... claims are minimal...", quality: "weak", analytics: "⚠️ Неуверенность в backup и claims!", path: "reject_weak_final" },
                    { text: "If truck breaks, we'll figure it out.", quality: "aggressive", analytics: "🔴 Нет backup plan!", path: "reject_attitude_final" },
                    { text: "No backup. Had 2 claims last year.", quality: "fail", analytics: "❌ Нет backup, есть claims!", path: "reject_backup_final" }
                ]
            },
            {
                brokerQuestion: "Excellent! You've answered everything perfectly. I'm impressed with your professionalism. Let's talk rate. What do you need for 1,270 miles Houston-Detroit with steel coils?",
                dispatcherPrompt: "💎 ТОРГ! Posted $2,500 ($1.97/mi) - просите $2,800-3,000!",
                suggestions: [
                    { text: "For 1,270 miles Houston-Detroit with heavy steel coils requiring proper securing, I'm looking at $3,000. That's $2.36/mile - fair rate for experienced driver, proper equipment (tarps/chains/binders), weight distribution expertise, and all the professional service we discussed. We deliver value, not just transportation.", quality: "excellent", analytics: "✨ Запросил $3,000 ($500 выше posted), обосновал rate (equipment, expertise, service)!", path: "master" },
                    { text: "$2,800 for this load. $2.20/mile - fair for steel with all our services.", quality: "good", analytics: "✔️ Запросил $2,800 ($300 выше), упомянул services.", path: "master" },
                    { text: "$2,700 for 1,270 miles.", quality: "normal", analytics: "⚪ Запросил $2,700 ($200 выше), без обоснования.", path: "master" },
                    { text: "$2,600 for this load?", quality: "weak", analytics: "⚠️ Только $100 выше posted, слабый торг!", path: "reject_weak_final" },
                    { text: "I need $3,300 minimum! Steel is expensive to haul.", quality: "aggressive", analytics: "🔴 $3,300 нереально высоко!", path: "reject_attitude_final" },
                    { text: "I'll take $2,500 posted rate.", quality: "fail", analytics: "❌ Принял posted без торга!", path: "master" }
                ]
            },
            {
                brokerQuestion: "That's high for this lane. I can do $2,700. That's $2.13/mile - already above posted.",
                dispatcherPrompt: "💎 Брокер предложил $2,700. Можете попросить $2,800 или принять!",
                suggestions: [
                    { text: "Can we meet at $2,800? Fair middle ground - you save $200 from my ask, I earn $300 above posted for professional service. Considering our backup flatbeds, zero claims, and 24/7 support, it's worth the extra $100 for peace of mind with heavy steel.", quality: "excellent", analytics: "✨ Предложил компромисс $2,800, логичное обоснование (save $200, earn $300), упомянул value (backup, claims, support)!", path: "master" },
                    { text: "$2,700 works. Let's book it.", quality: "good", analytics: "✔️ Принял $2,700 ($200 выше posted).", path: "master" },
                    { text: "$2,700 confirmed.", quality: "normal", analytics: "⚪ Принял offer без обсуждения.", path: "master" },
                    { text: "Okay, $2,700 will work...", quality: "weak", analytics: "⚠️ Неуверенное принятие.", path: "reject_weak_final" },
                    { text: "$2,800 or I walk!", quality: "aggressive", analytics: "🔴 Ультиматум после предложения!", path: "reject_attitude_final" },
                    { text: "No, I need $3,000!", quality: "fail", analytics: "❌ Отказ от разумного offer!", path: "reject_ultimatum_final" }
                ]
            },
            {
                brokerQuestion: "$2,750 final. That's $2.17/mile. You've proven you're professional - worth the extra. Deal?",
                dispatcherPrompt: "💎 ФИНАЛ! Брокер предложил $2,750 - это $250 выше posted!",
                suggestions: [
                    { text: "$2,750 perfect! Deal! You won't regret working with us.", quality: "excellent", analytics: "✨ Принял final offer $2,750 с энтузиазмом!", path: "master" },
                    { text: "$2,750 is a deal!", quality: "good", analytics: "✔️ Принял $2,750 ($250 выше posted).", path: "master" },
                    { text: "$2,750 confirmed.", quality: "normal", analytics: "⚪ Подтвердил без эмоций.", path: "master" },
                    { text: "Okay, $2,750...", quality: "weak", analytics: "⚠️ Неуверенное принятие final.", path: "reject_weak_final" },
                    { text: "Can't you do $2,800?", quality: "aggressive", analytics: "🔴 Торгуется после 'final offer'!", path: "reject_attitude_final" },
                    { text: "$2,775? Just $25 more?", quality: "fail", analytics: "❌ Продолжает торговаться!", path: "reject_ultimatum_final" }
                ]
            },
            {
                brokerQuestion: "Perfect! What's your email? I'll send rate confirmation now. Remember - tarps, chains, binders, proper weight distribution, and Wednesday 3 PM appointment. This steel mill is our biggest client - make us look good!",
                dispatcherPrompt: "💎 Брокер просит email и напоминает все требования!",
                suggestions: [
                    { text: "Perfect! dispatch@steelhaul.com. I'll sign and return within 1 hour. Confirmed: tarps, chains, binders, proper weight distribution, Wednesday 3 PM appointment guaranteed. We'll make you and your steel mill client very happy. After delivery, I'll call you personally to confirm everything went perfect. Looking forward to long partnership!", quality: "excellent", analytics: "✨ Дал email, обещал подписать за 1 час, подтвердил ВСЕ требования, personal touch, long-term vision!", path: "master" },
                    { text: "dispatch@steelhaul.com. I'll sign and return today. Tarps, chains, binders, weight distribution, Wednesday 3 PM confirmed. Will make you look good!", quality: "good", analytics: "✔️ Email, timing подписания, все требования, commitment.", path: "master" },
                    { text: "dispatch@steelhaul.com. Will handle everything properly.", quality: "normal", analytics: "⚪ Только email, общее обещание.", path: "master" },
                    { text: "Let me find email... will handle requirements...", quality: "weak", analytics: "⚠️ Не знает email сразу!", path: "reject_weak_final" },
                    { text: "Send to any email. Driver knows what to do.", quality: "aggressive", analytics: "🔴 Непрофессионально, нет конкретики!", path: "reject_attitude_final" },
                    { text: "No email... can we do by phone?", quality: "fail", analytics: "❌ Нет email для rate con!", path: "reject_email_final" }
                ]
            },
            {
                brokerResponse: "Excellent! Rate confirmation sent to dispatch@steelhaul.com. Sign and return ASAP. You answered every question professionally - that's rare! I'm adding you to my preferred steel carriers list. If this goes well, I have 10-12 steel loads weekly Houston-Detroit and surrounding areas. Let's build something long-term. Good luck!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$2,750",
                    ratePerMile: "$2.17/mile",
                    relationship: "strengthened",
                    weeklyLoads: "10-12 steel loads weekly ($27,500-33,000/week potential)",
                    feedback: `✅ ОТЛИЧНЫЕ ПЕРЕГОВОРЫ! Заработали $250 больше posted ($2,750 vs $2,500 = 10%).\n\n💰 ФИНАНСЫ:\n• Ставка: $2,750\n• Дизель: -$508 (201 gal × $3.90 TX→MI)\n• Чистая прибыль: $2,242 (82% от ставки)\n\n💡 УРОК: Детальные ответы на ВСЕ вопросы = доверие = лучшие ставки! Steel требует: tarps, chains, binders, weight distribution, backup flatbeds, references.\n\n🎯 РЕАЛЬНОСТЬ: Профессионализм = preferred carrier status = 10-12 loads weekly ($110,000-132,000/месяц потенциал)! Один отличный звонок открывает двери к постоянным грузам!`
                }
            }
        ],

        // ВСЕ REJECT ПУТИ - ТОЛЬКО ФИНАЛЬНЫЕ OUTCOMES, БЕЗ ПРОМЕЖУТОЧНЫХ ШАГОВ!
        // ЭТО ГАРАНТИРУЕТ НОЛЬ ТУПИКОВ!

        reject_weak_final: [
            {
                brokerResponse: "Sorry, I can't risk steel load with uncertainty. I need reliable carrier. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ! Показали неуверенность. Steel требует ГАРАНТИЙ, не 'попыток'. Брокеры не рискуют с ненадежными перевозчиками для heavy cargo."
                }
            }
        ],

        reject_attitude_final: [
            {
                brokerResponse: "I need professional carrier for steel. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Steel требует профессионализма! Грубость и отказ от требований = потеря груза."
                }
            }
        ],

        reject_nomc_final: [
            {
                brokerResponse: "I need MC number to verify carrier. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Не дали MC number - невозможно проверить carrier!"
                }
            }
        ],

        reject_timing_final: [
            {
                brokerResponse: "6 AM pickup critical for steel schedule. I need carrier who can meet timing. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Не можете вовремя = нет груза."
                }
            }
        ],

        reject_experience_final: [
            {
                brokerResponse: "I need carrier with steel experience. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет опыта со steel = нет груза! Steel coils требуют специальных знаний."
                }
            }
        ],

        reject_insurance_final: [
            {
                brokerResponse: "$100K cargo coverage required for steel. I need carrier with proper insurance. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Недостаточная страховка для steel! $100K обязательна."
                }
            }
        ],

        reject_communication_final: [
            {
                brokerResponse: "GPS tracking required for steel. I need carrier with proper tracking. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет GPS tracking = нет steel груза! Tracking обязателен."
                }
            }
        ],

        reject_commitment_final: [
            {
                brokerResponse: "I need carrier who can commit to appointment for steel mill. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет commitment = нет steel груза! Mills требуют точных appointments."
                }
            }
        ],

        reject_equipment_final: [
            {
                brokerResponse: "Tarps, chains, and binders required for steel safety. I need carrier with proper equipment. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет proper equipment = нет steel груза! Chains обязательны для coils."
                }
            }
        ],

        reject_references_final: [
            {
                brokerResponse: "I need carrier with verifiable references for steel loads. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет references = нет доверия! Брокеры проверяют новых carriers для steel."
                }
            }
        ],

        reject_terms_final: [
            {
                brokerResponse: "Your terms are unreasonable. I need professional carrier with standard terms. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нереальные условия! Завышенная detention или требование upfront payment = отказ."
                }
            }
        ],

        reject_backup_final: [
            {
                brokerResponse: "Backup plan and clean claims history required for steel. I need reliable carrier. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет backup truck или есть claims = риск для steel груза!"
                }
            }
        ],

        reject_ultimatum_final: [
            {
                brokerResponse: "I don't respond to ultimatums. I need professional carrier. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Ультиматумы не работают! Брокеры ценят гибкость и профессионализм."
                }
            }
        ],

        reject_email_final: [
            {
                brokerResponse: "I need professional carrier with email for documentation. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет email = нет профессионализма! Rate confirmation требует email."
                }
            }
        ]
    }
};

allScenarios.push(scenario20);
console.log('✅ Scenario 20 loaded: Flatbed Steel (Houston → Detroit) - БЕЗ ТУПИКОВ ГАРАНТИЯ!');
