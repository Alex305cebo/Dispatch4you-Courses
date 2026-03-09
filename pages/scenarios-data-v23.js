// DIALOGUE #23 - Dry Van Furniture (ПРАВИЛЬНЫЙ ФОРМАТ!)
// Miami FL → New York NY, 1,280 miles
// Posted: $2,600 ($2.03/mile), Target: $2,900-3,100
// Created: March 8, 2026

console.log('🔵 Loading scenarios-data-v23.js...');

const scenario23 = {
    id: 23,
    route: "Miami FL → New York NY",
    distance: 1280,
    equipment: "Dry Van (53ft)",
    cargo: "Furniture (sofas, tables, chairs)",
    weight: "44,000 lbs",
    postedRate: "$2,600 ($2.03/mile)",
    deadline: "Pickup tomorrow 9 AM, Delivery in 3 days",
    brokerStyle: "Professional furniture broker - careful handling required",
    difficulty: "medium",
    initialMessage: "Good afternoon! This is Robert from HomeFreight Logistics.\nI'm calling about your posted dry van load Miami to New York with furniture.\nIs this load still available?",

    paths: {
        master: [
            {
                brokerQuestion: "Good afternoon! This is Lisa from FurnitureDirect Brokers.\nYes, still available.\nWhat's your MC number, company name, and how many dry vans do you operate?",
                dispatcherPrompt: "💎 Брокер проверяет вашу компанию - дайте MC, название, размер fleet!",
                suggestions: [
                    { text: "Good afternoon Lisa! MC 445566, HomeFreight Logistics. We operate 30 dry vans, all 53ft with air-ride suspension and lift gates. Specialized in furniture for 3 years. What's the exact furniture type and any special handling requirements?", quality: "excellent", analytics: "✨ Дал MC, компанию, fleet 30 vans, air-ride + lift gates, специализацию 3 года, задал встречный вопрос о cargo!", path: "master" },
                    { text: "Afternoon! MC 445566, HomeFreight Logistics. 30 dry vans with air-ride. What furniture exactly?", quality: "good", analytics: "✔️ Дал MC, компанию, fleet с air-ride, задал вопрос.", path: "master" },
                    { text: "MC 445566, HomeFreight Logistics. Have dry vans.", quality: "normal", analytics: "⚪ Дал только MC и компанию, без деталей fleet.", path: "master" },
                    { text: "MC 445566... we have some vans...", quality: "weak", analytics: "⚠️ Неуверенный ответ, нет конкретики!", path: "reject_weak_final" },
                    { text: "Why all these questions? Tell me the rate!", quality: "aggressive", analytics: "🔴 Грубость! Отказ отвечать на вопросы!", path: "reject_attitude_final" },
                    { text: "Dry van available. What's the load?", quality: "fail", analytics: "❌ Не дал MC number - критическая ошибка!", path: "reject_attitude_final" }
                ]
            },
            {
                brokerQuestion: "Good! 1,280 miles Miami to New York. Furniture - sofas, tables, chairs, 44,000 lbs. High-value cargo, needs careful handling. Where is your van now and does it have lift gate and air-ride?",
                dispatcherPrompt: "💎 Брокер спрашивает местоположение van и наличие lift gate + air-ride для мебели!",
                suggestions: [
                    { text: "Perfect! Van in Miami at furniture warehouse, empty since yesterday. Yes, equipped with lift gate and air-ride suspension - both critical for furniture. Driver can be at pickup 9 AM sharp. What's the exact pickup address and loading dock type?", quality: "excellent", analytics: "✨ Точное местоположение (Miami warehouse), статус (empty), lift gate + air-ride, готовность 9 AM, встречный вопрос о dock!", path: "master" },
                    { text: "Van in Miami at warehouse, empty. Has lift gate and air-ride. Driver ready 9 AM. What's pickup address?", quality: "good", analytics: "✔️ Местоположение, equipment, готовность, вопрос.", path: "master" },
                    { text: "Van in Miami. Has lift gate and air-ride.", quality: "normal", analytics: "⚪ Только местоположение и equipment, без деталей.", path: "master" },
                    { text: "Should be in Miami... has equipment...", quality: "weak", analytics: "⚠️ Неуверенность в местоположении и equipment!", path: "reject_weak_final" },
                    { text: "Just tell me the rate first!", quality: "aggressive", analytics: "🔴 Отказ обсуждать детали груза!", path: "reject_attitude_final" },
                    { text: "Driver can't be there until 11 AM... 9 AM too early.", quality: "fail", analytics: "❌ Не может вовремя на pickup!", path: "reject_timing_final" }
                ]
            },
            {
                brokerQuestion: "Excellent! Furniture requires experienced drivers who understand careful handling. What's your driver's experience with furniture loads? Clean DOT record?",
                dispatcherPrompt: "💎 Брокер проверяет опыт водителя с мебелью и DOT record!",
                suggestions: [
                    { text: "Our driver has 4 years experience specifically with furniture - sofas, tables, bedroom sets. He understands careful handling, proper strapping, no sudden stops. Clean DOT inspection record - last inspection 2 months ago, zero violations. Safety rating Satisfactory. He treats furniture like it's his own.", quality: "excellent", analytics: "✨ 4 года опыта с мебелью, понимание careful handling, DOT clean (2 месяца назад, 0 violations), Safety rating!", path: "master" },
                    { text: "Driver has 4 years furniture experience. Clean DOT record, last inspection 2 months ago, zero violations.", quality: "good", analytics: "✔️ Опыт 4 года, DOT clean с деталями.", path: "master" },
                    { text: "Driver experienced with furniture. DOT record clean.", quality: "normal", analytics: "⚪ Опыт есть, DOT clean, но без деталей.", path: "master" },
                    { text: "Driver has some furniture experience... DOT should be okay...", quality: "weak", analytics: "⚠️ Неуверенность в опыте и DOT!", path: "reject_weak_final" },
                    { text: "Driver knows how to drive. That's enough!", quality: "aggressive", analytics: "🔴 Пренебрежение важностью опыта!", path: "reject_attitude_final" },
                    { text: "Driver has regular license. Is that okay?", quality: "fail", analytics: "❌ Нет опыта с furniture!", path: "reject_experience_final" }
                ]
            },
            {
                brokerQuestion: "Good! Insurance: Do you have $100K cargo coverage? Liability coverage? I need current certificates for furniture.",
                dispatcherPrompt: "💎 Брокер требует подтверждение страховки $100K cargo + liability!",
                suggestions: [
                    { text: "Yes! $100K cargo insurance through Progressive Commercial. $1M liability coverage. Both certificates current, expire March 2028. I'll email both certificates immediately after booking. Insurance agent is available if you need verification. What's your email for certificates?", quality: "excellent", analytics: "✨ $100K cargo, $1M liability, компания (Progressive), даты (March 2028), готовность отправить, agent доступен, встречный вопрос!", path: "master" },
                    { text: "Yes, $100K cargo, $1M liability through Progressive. Current certificates, expire March 2028. I'll send after booking.", quality: "good", analytics: "✔️ Coverage детали, компания, даты, готовность.", path: "master" },
                    { text: "$100K cargo, $1M liability. Certificates current.", quality: "normal", analytics: "⚪ Только суммы coverage, без деталей.", path: "master" },
                    { text: "Should have $100K... liability is good...", quality: "weak", analytics: "⚠️ Неуверенность в страховке!", path: "reject_weak_final" },
                    { text: "Insurance is fine! Let's talk rate.", quality: "aggressive", analytics: "🔴 Отказ обсуждать insurance!", path: "reject_insurance_final" },
                    { text: "We have $50K coverage... is that enough?", quality: "fail", analytics: "❌ Недостаточная страховка для furniture!", path: "reject_insurance_final" }
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
                    { text: "Driver will call when he gets there.", quality: "aggressive", analytics: "🔴 Минимум коммуникации, нет tracking!", path: "reject_communication_final" },
                    { text: "No tracking system. Driver has phone.", quality: "fail", analytics: "❌ Нет GPS tracking!", path: "reject_communication_final" }
                ]
            },
            {
                brokerQuestion: "Excellent! Delivery: This load has appointment Wednesday 2 PM in New York. It's a furniture store - they're strict about timing. Can you commit to Wednesday 2 PM? What's your backup plan for delays?",
                dispatcherPrompt: "💎 Брокер требует commitment на appointment Wednesday 2 PM и backup plan!",
                suggestions: [
                    { text: "Absolutely committed to Wednesday 2 PM! Based on 1,280 miles and driver's HOS, we'll depart Miami tomorrow 9 AM, arrive New York Wednesday morning with 4-hour buffer. If traffic or weather delay, driver has backup route via I-95. We monitor traffic constantly. If major delay expected, I'll call you 10 hours ahead to coordinate with furniture store. Zero tolerance for late delivery.", quality: "excellent", analytics: "✨ Commitment на 2 PM, расчет времени с 4-hour buffer, backup route (I-95), мониторинг traffic, early notification (10 часов), zero tolerance!", path: "master" },
                    { text: "Yes, committed to Wednesday 2 PM. We'll arrive Wednesday morning with buffer. Have backup route if delays. Will notify early if problems.", quality: "good", analytics: "✔️ Commitment, buffer time, backup route, early notification.", path: "master" },
                    { text: "Yes, Wednesday 2 PM works. We'll plan accordingly.", quality: "normal", analytics: "⚪ Только commitment, без деталей плана.", path: "master" },
                    { text: "We'll try for Wednesday 2 PM... should be okay...", quality: "weak", analytics: "⚠️ 'Try' вместо commitment - красный флаг!", path: "reject_weak_final" },
                    { text: "Traffic is unpredictable. Can't guarantee.", quality: "aggressive", analytics: "🔴 Отказ дать commitment!", path: "reject_commitment_final" },
                    { text: "Driver will get there when he gets there.", quality: "fail", analytics: "❌ Нет commitment вообще!", path: "reject_commitment_final" }
                ]
            },
            {
                brokerQuestion: "Great planning! Loading procedure: Pickup at furniture warehouse, loading takes 2 hours. Do you have load locks, straps, and furniture pads? Will your driver inspect the load?",
                dispatcherPrompt: "💎 Брокер проверяет наличие equipment (load locks, straps, pads) и inspection procedure!",
                suggestions: [
                    { text: "Yes! Van equipped with 10 load locks, 15 heavy-duty straps, and 20 furniture pads. Driver will inspect entire load before departure - check securing, weight distribution, verify all furniture properly padded and strapped. He'll take photos for documentation. If any securing issues, he'll request reload before leaving. We never leave with improperly secured furniture.", quality: "excellent", analytics: "✨ 10 load locks, 15 straps, 20 pads, полная inspection procedure, photos, quality control, never leave improperly!", path: "master" },
                    { text: "Yes, have 10 load locks, 15 straps, and 20 furniture pads. Driver will inspect load and take photos before leaving.", quality: "good", analytics: "✔️ Все equipment с количеством, inspection, photos.", path: "master" },
                    { text: "Yes, have load locks, straps, and furniture pads. Driver will inspect.", quality: "normal", analytics: "⚪ Equipment есть, inspection будет, но без деталей.", path: "master" },
                    { text: "Should have equipment... driver will check...", quality: "weak", analytics: "⚠️ Неуверенность в наличии equipment!", path: "reject_weak_final" },
                    { text: "Driver knows what to do.", quality: "aggressive", analytics: "🔴 Нет конкретики по equipment!", path: "reject_equipment_final" },
                    { text: "Don't have furniture pads. Can we use blankets?", quality: "fail", analytics: "❌ Нет proper equipment для furniture!", path: "reject_equipment_final" }
                ]
            },
            {
                brokerQuestion: "Perfect! References: Can you provide 2-3 broker references who can confirm your reliability with furniture loads? I like to verify new carriers.",
                dispatcherPrompt: "💎 Брокер хочет 2-3 references от других брокеров для проверки надежности!",
                suggestions: [
                    { text: "Absolutely! I can provide 3 broker references right now: 1) Mark Johnson at FurnitureFreight (worked 2 years, 50+ furniture loads), 2) Sarah Lee at HomeHaul Logistics (1 year, 35+ loads), 3) Tom Davis at MovingExpress (6 months, 20+ loads). All can confirm our reliability, on-time delivery, and zero damage claims. I'll email their contact info with permission. Would you like to call them before booking?", quality: "excellent", analytics: "✨ 3 references с именами, компаниями, длительностью работы, количеством loads, zero damage claims, готовность дать contacts!", path: "master" },
                    { text: "Yes! Can provide 3 broker references - Mark at FurnitureFreight, Sarah at HomeHaul, Tom at MovingExpress. All can confirm our furniture reliability. I'll send contacts.", quality: "good", analytics: "✔️ 3 references с именами и компаниями, готовность отправить.", path: "master" },
                    { text: "Yes, can provide broker references.", quality: "normal", analytics: "⚪ Согласие дать references, но без деталей.", path: "master" },
                    { text: "I think I can find some references...", quality: "weak", analytics: "⚠️ Неуверенность, нет готовых references!", path: "reject_weak_final" },
                    { text: "Why need references? We're good!", quality: "aggressive", analytics: "🔴 Оборонительная позиция, отказ!", path: "reject_references_final" },
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
                    { text: "Detention $100/hour. QuickPay only.", quality: "aggressive", analytics: "🔴 Завышенная detention, нет flexibility!", path: "reject_terms_final" },
                    { text: "Need payment upfront before pickup.", quality: "fail", analytics: "❌ Нереальные payment terms!", path: "reject_terms_final" }
                ]
            },
            {
                brokerQuestion: "Good! Fuel surcharge: Do you charge fuel surcharge on top of rate, or is it included? And what's your emergency contact number if I can't reach driver during transit?",
                dispatcherPrompt: "💎 Брокер уточняет FSC (included или extra) и emergency contacts!",
                suggestions: [
                    { text: "Fuel surcharge is included in our rate - no hidden fees, all-in pricing. For emergency contact: my direct cell is 555-0123, available 24/7. Also our dispatch manager John at 555-0124. Driver's cell is 555-0125. You'll have all three numbers. If driver doesn't answer within 15 minutes, call me directly - I'll locate him immediately.", quality: "excellent", analytics: "✨ FSC included (no hidden fees), 3 emergency contacts (dispatcher, manager, driver), все 24/7, response time 15 min!", path: "master" },
                    { text: "FSC included in rate. Emergency contact: my cell 555-0123, dispatch 555-0124, driver 555-0125. All 24/7.", quality: "good", analytics: "✔️ FSC included, 3 contacts, 24/7 availability.", path: "master" },
                    { text: "FSC included. Have emergency contacts available.", quality: "normal", analytics: "⚪ FSC included, contacts есть, но без деталей.", path: "master" },
                    { text: "FSC should be included... can give contacts...", quality: "weak", analytics: "⚠️ Неуверенность в FSC и contacts!", path: "reject_weak_final" },
                    { text: "FSC is extra 15%. Take it or leave it.", quality: "aggressive", analytics: "🔴 Скрытые fees, ультиматум!", path: "reject_fsc_final" },
                    { text: "Don't have emergency contacts. Driver has phone.", quality: "fail", analytics: "❌ Нет backup contacts!", path: "reject_fsc_final" }
                ]
            },
            {
                brokerQuestion: "Perfect! Last questions: Do you have a backup van available if this truck breaks down? And what's your claims history - any cargo damage claims in last 2 years?",
                dispatcherPrompt: "💎 Брокер проверяет наличие backup van и claims history за 2 года!",
                suggestions: [
                    { text: "Yes! We have 3 backup vans in Miami area - if primary truck has mechanical issue, backup can be there within 2 hours to transfer load and continue. Claims history: zero cargo damage claims in last 4 years. Clean record. We maintain trucks religiously to prevent breakdowns. Our reliability is 99.8% on-time delivery. You're in safe hands.", quality: "excellent", analytics: "✨ 3 backup vans в Miami, 2 hours response, zero claims за 4 года, maintenance program, 99.8% on-time!", path: "master" },
                    { text: "Yes, have 3 backup vans in Miami. Zero cargo claims in 4 years. 99.8% on-time.", quality: "good", analytics: "✔️ Backup vans, zero claims, reliability metric.", path: "master" },
                    { text: "Have backup trucks. No recent claims.", quality: "normal", analytics: "⚪ Backup есть, claims нет, без деталей.", path: "master" },
                    { text: "Should have backup... claims are minimal...", quality: "weak", analytics: "⚠️ Неуверенность в backup и claims!", path: "reject_weak_final" },
                    { text: "If truck breaks, we'll figure it out.", quality: "aggressive", analytics: "🔴 Нет backup plan!", path: "reject_backup_final" },
                    { text: "No backup. Had 2 claims last year.", quality: "fail", analytics: "❌ Нет backup, есть claims!", path: "reject_backup_final" }
                ]
            },
            {
                brokerQuestion: "Excellent! You've answered everything perfectly. I'm impressed with your professionalism. Let's talk rate. What do you need for 1,280 miles Miami-New York with furniture?",
                dispatcherPrompt: "💎 ТОРГ! Posted $2,600 ($2.03/mi) - просите $2,900-3,100!",
                suggestions: [
                    { text: "For 1,280 miles Miami-New York with furniture requiring careful handling, I'm looking at $3,100. That's $2.42/mile - fair rate for experienced driver, lift gate, furniture pads, air-ride van, and all the professional service we discussed. We deliver value, not just transportation.", quality: "excellent", analytics: "✨ Запросил $3,100 ($500 выше posted), обосновал rate (equipment, service, experience)!", path: "master" },
                    { text: "$2,900 for this load. $2.27/mile - fair for furniture with all our services.", quality: "good", analytics: "✔️ Запросил $2,900 ($300 выше), упомянул services.", path: "master" },
                    { text: "$2,800 for 1,280 miles.", quality: "normal", analytics: "⚪ Запросил $2,800 ($200 выше), без обоснования.", path: "master" },
                    { text: "$2,700 for this load?", quality: "weak", analytics: "⚠️ Только $100 выше posted, слабый торг!", path: "reject_weak_final" },
                    { text: "I need $3,400 minimum! Furniture is expensive to haul.", quality: "aggressive", analytics: "🔴 $3,400 нереально высоко!", path: "reject_rate_final" },
                    { text: "I'll take $2,600 posted rate.", quality: "fail", analytics: "❌ Принял posted без торга!", path: "master" }
                ]
            },
            {
                brokerQuestion: "That's high for this lane. I can do $2,800. That's $2.19/mile - already above posted.",
                dispatcherPrompt: "💎 Брокер предложил $2,800. Можете попросить $2,900 или принять!",
                suggestions: [
                    { text: "Can we meet at $2,900? Fair middle ground - you save $200 from my ask, I earn $300 above posted for professional service. Considering our backup vans, zero claims, and 24/7 support, it's worth the extra $100 for peace of mind with furniture.", quality: "excellent", analytics: "✨ Предложил компромисс $2,900, логичное обоснование (save $200, earn $300), упомянул value (backup, claims, support)!", path: "master" },
                    { text: "$2,800 works. Let's book it.", quality: "good", analytics: "✔️ Принял $2,800 ($200 выше posted).", path: "master" },
                    { text: "$2,800 confirmed.", quality: "normal", analytics: "⚪ Принял offer без обсуждения.", path: "master" },
                    { text: "Okay, $2,800 will work...", quality: "weak", analytics: "⚠️ Неуверенное принятие.", path: "reject_weak_final" },
                    { text: "$2,900 or I walk!", quality: "aggressive", analytics: "🔴 Ультиматум после предложения!", path: "reject_ultimatum_final" },
                    { text: "No, I need $3,100!", quality: "fail", analytics: "❌ Отказ от разумного offer!", path: "reject_ultimatum_final" }
                ]
            },
            {
                brokerQuestion: "$2,850 final. That's $2.23/mile. You've proven you're professional - worth the extra. Deal?",
                dispatcherPrompt: "💎 ФИНАЛ! Брокер предложил $2,850 - это $250 выше posted!",
                suggestions: [
                    { text: "$2,850 perfect! Deal! You won't regret working with us.", quality: "excellent", analytics: "✨ Принял final offer $2,850 с энтузиазмом!", path: "master" },
                    { text: "$2,850 is a deal!", quality: "good", analytics: "✔️ Принял $2,850 ($250 выше posted).", path: "master" },
                    { text: "$2,850 confirmed.", quality: "normal", analytics: "⚪ Подтвердил без эмоций.", path: "master" },
                    { text: "Okay, $2,850...", quality: "weak", analytics: "⚠️ Неуверенное принятие final.", path: "reject_weak_final" },
                    { text: "Can't you do $2,900?", quality: "aggressive", analytics: "🔴 Торгуется после 'final offer'!", path: "reject_final_final" },
                    { text: "$2,875? Just $25 more?", quality: "fail", analytics: "❌ Продолжает торговаться!", path: "reject_final_final" }
                ]
            },
            {
                brokerQuestion: "Perfect! What's your email? I'll send rate confirmation now. Remember - lift gate, furniture pads, careful handling, and Wednesday 2 PM appointment. This furniture store is our biggest client - make us look good!",
                dispatcherPrompt: "💎 Брокер просит email и напоминает все требования!",
                suggestions: [
                    { text: "Perfect! dispatch@homefreight.com. I'll sign and return within 1 hour. Confirmed: lift gate, furniture pads, careful handling, Wednesday 2 PM appointment guaranteed. We'll make you and your furniture store client very happy. After delivery, I'll call you personally to confirm everything went perfect. Looking forward to long partnership!", quality: "excellent", analytics: "✨ Дал email, обещал подписать за 1 час, подтвердил ВСЕ требования, personal touch, long-term vision!", path: "master" },
                    { text: "dispatch@homefreight.com. I'll sign and return today. Lift gate, pads, careful handling, Wednesday 2 PM confirmed. Will make you look good!", quality: "good", analytics: "✔️ Email, timing подписания, все требования, commitment.", path: "master" },
                    { text: "dispatch@homefreight.com. Will handle everything properly.", quality: "normal", analytics: "⚪ Только email, общее обещание.", path: "master" },
                    { text: "Let me find email... will handle requirements...", quality: "weak", analytics: "⚠️ Не знает email сразу!", path: "reject_weak_final" },
                    { text: "Send to any email. Driver knows what to do.", quality: "aggressive", analytics: "🔴 Непрофессионально, нет конкретики!", path: "reject_email_final" },
                    { text: "No email... can we do by phone?", quality: "fail", analytics: "❌ Нет email для rate con!", path: "reject_email_final" }
                ]
            },
            {
                brokerResponse: "Excellent! Rate confirmation sent to dispatch@homefreight.com. Sign and return ASAP. You answered every question professionally - that's rare! I'm adding you to my preferred furniture carriers list. If this goes well, I have 8-10 furniture loads weekly Miami-New York and surrounding areas. Let's build something long-term. Good luck!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$2,850",
                    ratePerMile: "$2.23/mile",
                    relationship: "strengthened",
                    weeklyLoads: "8-10 furniture loads weekly ($22,800-28,500/week potential)",
                    feedback: `✅ ОТЛИЧНЫЕ ПЕРЕГОВОРЫ! Заработали $250 больше posted ($2,850 vs $2,600 = 9.6%).\n\n💰 ФИНАНСЫ:\n• Ставка: $2,850\n• Дизель: -$512 (203 gal × $3.90 FL→NY)\n• Чистая прибыль: $2,338 (82% от ставки)\n\n💡 УРОК: Детальные ответы на ВСЕ вопросы = доверие = лучшие ставки! Furniture требует: lift gate, furniture pads, air-ride, careful handling, backup vans, references.\n\n🎯 РЕАЛЬНОСТЬ: Профессионализм = preferred carrier status = 8-10 loads weekly ($91,200-114,000/месяц потенциал)! Один отличный звонок открывает двери к постоянным грузам!`
                }
            }
        ],

        
        
        
        reject_weak_final: [
            {
                brokerResponse: "Sorry, I can't risk furniture load with uncertainty. I need reliable carrier. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ! Продолжали показывать неуверенность. Furniture требует ГАРАНТИЙ, не 'попыток'. Брокеры не рискуют с ненадежными перевозчиками."
                }
            }
        ],

        reject_attitude_final: [
            {
                brokerResponse: "I need professional carrier for furniture. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Furniture требует профессионализма! Грубость и отказ от требований = потеря груза."
                }
            }
        ],

        reject_timing_final: [
            {
                brokerResponse: "9 AM pickup critical for furniture schedule. I need carrier who can meet timing. Thanks.",
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
                brokerResponse: "I need carrier with furniture experience. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет опыта с furniture = нет груза!"
                }
            }
        ],

        reject_insurance_final: [
            {
                brokerResponse: "$100K cargo coverage required for furniture. I need carrier with proper insurance. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Недостаточная страховка для furniture! $100K обязательна."
                }
            }
        ],

        reject_communication_final: [
            {
                brokerResponse: "GPS tracking required for furniture. I need carrier with proper tracking. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет GPS tracking = нет furniture груза! Tracking обязателен."
                }
            }
        ],

        reject_commitment_final: [
            {
                brokerResponse: "I need carrier who can commit to appointment for furniture store. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет commitment = нет furniture груза! Stores требуют точных appointments."
                }
            }
        ],

        reject_equipment_final: [
            {
                brokerResponse: "Lift gate, load locks, straps, and furniture pads required. I need carrier with proper equipment. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет proper equipment = нет furniture груза! Lift gate и pads обязательны."
                }
            }
        ],

        reject_references_final: [
            {
                brokerResponse: "I need carrier with verifiable references for furniture loads. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет references = нет доверия! Брокеры проверяют новых carriers для furniture."
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

        reject_fsc_final: [
            {
                brokerResponse: "Hidden fees and lack of emergency contacts are red flags. I need transparent carrier. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Скрытые fees или нет emergency contacts = красные флаги для брокера!"
                }
            }
        ],

        reject_backup_final: [
            {
                brokerResponse: "Backup plan and clean claims history required for furniture. I need reliable carrier. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет backup truck или есть claims = риск для furniture груза!"
                }
            }
        ],

        reject_rate_final: [
            {
                brokerResponse: "$3,400 is way too high for this lane. I need realistic carrier. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: $3,400 нереально! Posted $2,600, можно просить $2,900-3,100, но не $3,400!"
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

        reject_final_final: [
            {
                brokerResponse: "I gave you my final offer. I need carrier who respects negotiation. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Продолжали торговаться после 'final offer'! Брокеры не любят жадность."
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

allScenarios.push(scenario23);
console.log('✅ Scenario 23 loaded: Dry Van Furniture (Miami → New York) - ПРАВИЛЬНЫЙ ФОРМАТ!');
