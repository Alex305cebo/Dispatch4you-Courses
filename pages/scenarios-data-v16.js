// DIALOGUE #16 - Reefer Dairy Products (FULL VERSION - 1000+ lines)
// Chicago IL → Atlanta GA, 710 miles
// Posted: $2,100 ($2.96/mile), Target: $2,300-2,400
// Created: March 8, 2026

console.log('🔵 Loading scenarios-data-v16.js...');

const scenario16 = {
    id: 16,
    route: "Chicago IL → Atlanta GA",
    distance: 710,
    equipment: "Reefer (53ft)",
    cargo: "Dairy products (milk, cheese)",
    weight: "42,000 lbs",
    postedRate: "$2,100 ($2.96/mile)",
    deadline: "Pickup tomorrow 6 AM, Delivery in 2 days",
    brokerStyle: "Professional cold chain broker - very detailed",
    difficulty: "hard",
    initialMessage: "Good morning! This is Richard from FastLoad Logistics.\nI'm calling about your posted reefer load Chicago to Atlanta with dairy products.\nIs this load still available?",

    paths: {
        master: [
            {
                brokerQuestion: "Good morning! This is Sarah from ColdChain Brokers.\nYes, still available.\nWhat's your MC number, company name, and how many reefer trucks do you operate?",
                dispatcherPrompt: "💎 ВОПРОС 1/12: MC, компания, fleet size!",
                suggestions: [
                    { text: "Good morning Sarah! MC 445566, FastLoad Logistics. We operate 15 reefer trucks, all 53ft with multi-temp capability. Specialized in cold chain for 3 years. What's the temperature requirement for this dairy load?", quality: "excellent", analytics: "✨ ОТЛИЧНО! MC, компания, fleet 15, специализация, вопрос!", path: "master" },
                    { text: "Morning! MC 445566, FastLoad Logistics. We have 15 reefer trucks. What's the temp?", quality: "good", analytics: "✔️ Хорошо! MC, компания, fleet.", path: "master" },
                    { text: "MC 445566, FastLoad Logistics. We have reefers.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "MC 445566... we have some reefers...", quality: "weak", analytics: "⚠️ Слабо! Неуверенность!", path: "weak" },
                    { text: "Why need all details? Just tell me the rate!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning" },
                    { text: "Reefer available. What's the load?", quality: "fail", analytics: "❌ Провал! Нет MC!", path: "warning" }
                ]
            },
            {
                brokerQuestion: "Good! 710 miles Chicago to Atlanta. Dairy products - milk and cheese, 42,000 lbs. Temperature must stay 34-38°F constantly. Where is your reefer right now and when was the last time the unit was serviced?",
                dispatcherPrompt: "💎 ВОПРОС 2/12: Местоположение reefer + последний service!",
                suggestions: [
                    { text: "Perfect! Reefer is in Chicago at cold storage facility on West Side, empty since yesterday evening. Unit was serviced last week - full maintenance including compressor check, refrigerant levels, and fuel system. Service report available. Driver can be at pickup 6 AM sharp. What's the exact pickup address?", quality: "excellent", analytics: "✨ ОТЛИЧНО! Точное местоположение, статус, детали service, готовность, вопрос!", path: "master" },
                    { text: "Reefer in Chicago at cold storage, empty. Serviced last week. Driver ready 6 AM. What's pickup address?", quality: "good", analytics: "✔️ Хорошо! Местоположение, service, готовность.", path: "master" },
                    { text: "Reefer in Chicago. Serviced recently.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Should be in Chicago... serviced sometime...", quality: "weak", analytics: "⚠️ Слабо! Неуверенность!", path: "weak" },
                    { text: "Just tell me the rate first!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_attitude" },
                    { text: "Driver can't be there until 9 AM... 6 AM too early.", quality: "fail", analytics: "❌ Провал! Не может вовремя!", path: "reject_timing" }
                ]
            },
            {
                brokerQuestion: "Excellent! Now, dairy is very sensitive. What's your driver's experience with temperature-controlled dairy? How many years? And does your driver have a clean DOT inspection record?",
                dispatcherPrompt: "💎 ВОПРОС 3/12: Опыт водителя с dairy + DOT record!",
                suggestions: [
                    { text: "Our driver has 4 years experience specifically with dairy products - milk, cheese, yogurt. He understands critical temperature control and checks temp every 2 hours. Clean DOT inspection record - last inspection 2 months ago, zero violations. Safety rating Satisfactory. He takes dairy very seriously.", quality: "excellent", analytics: "✨ ОТЛИЧНО! 4 года dairy опыт, понимание контроля, DOT clean, safety rating!", path: "master" },
                    { text: "Driver has 4 years dairy experience. Clean DOT record, last inspection 2 months ago.", quality: "good", analytics: "✔️ Хорошо! Опыт, DOT clean.", path: "master" },
                    { text: "Driver experienced with dairy. DOT record clean.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Driver has some dairy experience... DOT should be okay...", quality: "weak", analytics: "⚠️ Слабо! Неуверенность!", path: "weak" },
                    { text: "Driver knows how to drive. That's enough!", quality: "aggressive", analytics: "🔴 Агрессивно! Пренебрежение!", path: "reject_attitude" },
                    { text: "Driver has regular license. Is that okay?", quality: "fail", analytics: "❌ Провал! Нет опыта!", path: "reject_experience" }
                ]
            },
            {
                brokerQuestion: "Good! Insurance question: Do you have $100K cargo coverage specifically for perishable goods? And what's your liability coverage? I need current certificates.",
                dispatcherPrompt: "💎 ВОПРОС 4/12: Insurance $100K perishable + liability!",
                suggestions: [
                    { text: "Yes! $100K cargo insurance through Progressive Commercial with specific perishable goods coverage including dairy. $1M liability coverage. Both certificates current, expire November 2027. I'll email both certificates immediately after booking. Insurance agent is available if you need verification. What's your email?", quality: "excellent", analytics: "✨ ОТЛИЧНО! $100K perishable, $1M liability, даты, готовность, agent!", path: "master" },
                    { text: "Yes, $100K cargo with perishable coverage, $1M liability through Progressive. Current certificates. I'll send after booking.", quality: "good", analytics: "✔️ Хорошо! Coverage детали, готовность.", path: "master" },
                    { text: "$100K cargo, $1M liability. Certificates current.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Should have $100K... liability is good...", quality: "weak", analytics: "⚠️ Слабо! Неуверенность!", path: "weak" },
                    { text: "Insurance is fine! Let's talk rate.", quality: "aggressive", analytics: "🔴 Агрессивно! Отказ обсуждать!", path: "reject_insurance" },
                    { text: "We have $50K coverage... is that enough?", quality: "fail", analytics: "❌ Провал! Недостаточная страховка!", path: "reject_insurance" }
                ]
            },
            {
                brokerQuestion: "Perfect! Now communication: What's your tracking and communication policy? How often will you update me during transit? And if there's a delay, when will you notify me?",
                dispatcherPrompt: "💎 ВОПРОС 5/12: Tracking policy + communication + delay notification!",
                suggestions: [
                    { text: "Excellent question! We provide GPS tracking link immediately after pickup. Updates every 4 hours via text/email with location and temp reading. If any delay occurs, we notify you minimum 6 hours before appointment - never surprises. Driver available 24/7 by phone. After delivery, we send POD within 2 hours. Our goal is complete transparency.", quality: "excellent", analytics: "✨ ОТЛИЧНО! GPS, updates 4 часа, delay 6 часов, 24/7, POD!", path: "master" },
                    { text: "GPS tracking after pickup. Updates every 4 hours with temp. Delay notification 6 hours before appointment. Driver available 24/7.", quality: "good", analytics: "✔️ Хорошо! Tracking, updates, notification.", path: "master" },
                    { text: "GPS tracking. Regular updates. Will notify about delays.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "We'll send updates... will call if problems...", quality: "weak", analytics: "⚠️ Слабо! Расплывчато!", path: "weak" },
                    { text: "Driver will call when he gets there.", quality: "aggressive", analytics: "🔴 Агрессивно! Минимум коммуникации!", path: "reject_communication" },
                    { text: "No tracking system. Driver has phone.", quality: "fail", analytics: "❌ Провал! Нет tracking!", path: "reject_communication" }
                ]
            },
            {
                brokerQuestion: "Excellent communication policy! Delivery question: This load has appointment Tuesday 2 PM in Atlanta. It's a major grocery chain - they're strict. Can you commit to Tuesday 2 PM? What's your plan if there's traffic or weather delay?",
                dispatcherPrompt: "💎 ВОПРОС 6/12: Appointment commitment + backup plan!",
                suggestions: [
                    { text: "Absolutely committed to Tuesday 2 PM! Based on 710 miles and driver's HOS, we'll depart Chicago tomorrow 6 AM, arrive Atlanta Monday evening with 18-hour buffer. If traffic or weather delay, driver has backup route via I-65. We monitor weather constantly. If major delay expected, I'll call you 12 hours ahead to coordinate with grocery chain. Zero tolerance for late delivery.", quality: "excellent", analytics: "✨ ОТЛИЧНО! Commitment, расчет с buffer, backup route, weather, early notification!", path: "master" },
                    { text: "Yes, committed to Tuesday 2 PM. We'll arrive Monday evening with buffer. Have backup route if delays. Will notify early if problems.", quality: "good", analytics: "✔️ Хорошо! Commitment, buffer, backup.", path: "master" },
                    { text: "Yes, Tuesday 2 PM works. We'll plan accordingly.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "We'll try for Tuesday 2 PM... should be okay...", quality: "weak", analytics: "⚠️ Слабо! 'Try' не внушает уверенности!", path: "weak" },
                    { text: "Traffic is unpredictable. Can't guarantee.", quality: "aggressive", analytics: "🔴 Агрессивно! Отказ commitment!", path: "reject_commitment" },
                    { text: "Driver will get there when he gets there.", quality: "fail", analytics: "❌ Провал! Нет commitment!", path: "reject_commitment" }
                ]
            },
            {
                brokerQuestion: "Great planning! Loading procedure: Pickup is at cold storage, loading takes 2 hours. Do you have load locks and straps? And will your driver inspect the load before leaving to ensure proper stacking?",
                dispatcherPrompt: "💎 ВОПРОС 7/12: Load locks/straps + inspection procedure!",
                suggestions: [
                    { text: "Yes! Reefer equipped with 8 load locks and 12 heavy-duty straps. Driver will inspect entire load before departure - check stacking, weight distribution, and secure all pallets. He'll take photos of loaded cargo for documentation. If any stacking issues, he'll request reload before leaving. We never leave with improperly loaded dairy.", quality: "excellent", analytics: "✨ ОТЛИЧНО! Equipment детали, inspection procedure, photos, quality control!", path: "master" },
                    { text: "Yes, have 8 load locks and 12 straps. Driver will inspect load and take photos before leaving.", quality: "good", analytics: "✔️ Хорошо! Equipment, inspection.", path: "master" },
                    { text: "Yes, have load locks and straps. Driver will inspect.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Should have equipment... driver will check...", quality: "weak", analytics: "⚠️ Слабо! Неуверенность!", path: "weak" },
                    { text: "Driver knows what to do.", quality: "aggressive", analytics: "🔴 Агрессивно! Нет деталей!", path: "reject_equipment" },
                    { text: "Don't have load locks. Can we use rope?", quality: "fail", analytics: "❌ Провал! Нет equipment!", path: "reject_equipment" }
                ]
            },
            {
                brokerQuestion: "Perfect! Temperature monitoring: Does your reefer have continuous temperature monitoring with data logger? Can you provide temperature records after delivery?",
                dispatcherPrompt: "💎 ВОПРОС 8/12: Temp monitoring system + data logger!",
                suggestions: [
                    { text: "Absolutely! Reefer equipped with Thermo King SB-400 with continuous temp monitoring and data logger. Records temp every 15 minutes throughout transit. After delivery, I'll email complete temperature log showing 34-38°F maintained constantly. Data logger report is standard for all our dairy loads. Grocery chain will have proof of proper cold chain.", quality: "excellent", analytics: "✨ ОТЛИЧНО! Конкретная система, data logger, частота, готовность отправить!", path: "master" },
                    { text: "Yes, reefer has continuous monitoring with data logger. Records every 15 minutes. Will send temp log after delivery.", quality: "good", analytics: "✔️ Хорошо! Monitoring, data logger, отчет.", path: "master" },
                    { text: "Yes, has temp monitoring and data logger.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Should have monitoring... can probably get records...", quality: "weak", analytics: "⚠️ Слабо! Неуверенность!", path: "weak" },
                    { text: "Driver checks temp manually.", quality: "aggressive", analytics: "🔴 Агрессивно! Нет автоматики!", path: "reject_monitoring" },
                    { text: "No data logger. Driver has thermometer.", quality: "fail", analytics: "❌ Провал! Нет monitoring!", path: "reject_monitoring" }
                ]
            },
            {
                brokerQuestion: "Excellent! References: Can you provide 2-3 broker references who can confirm your reliability with temperature-controlled loads? I like to verify new carriers.",
                dispatcherPrompt: "💎 ВОПРОС 9/12: Broker references для reefer loads!",
                suggestions: [
                    { text: "Absolutely! I can provide 3 broker references right now: 1) Mike Johnson at ColdFreight (worked 2 years, 50+ reefer loads), 2) Lisa Chen at FreshChain Logistics (1 year, 30+ loads), 3) Tom Williams at DairyExpress (6 months, 15+ loads). All can confirm our reliability, on-time delivery, and proper temp control. I'll email their contact info with permission. Would you like to call them before booking?", quality: "excellent", analytics: "✨ ОТЛИЧНО! 3 references с именами, компаниями, длительностью, количеством loads!", path: "master" },
                    { text: "Yes! Can provide 3 broker references - Mike at ColdFreight, Lisa at FreshChain, Tom at DairyExpress. All can confirm our reefer reliability. I'll send contacts.", quality: "good", analytics: "✔️ Хорошо! 3 references с именами.", path: "master" },
                    { text: "Yes, can provide broker references.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "I think I can find some references...", quality: "weak", analytics: "⚠️ Слабо! Неуверенность!", path: "weak" },
                    { text: "Why need references? We're good!", quality: "aggressive", analytics: "🔴 Агрессивно! Оборонительно!", path: "reject_references" },
                    { text: "We're new. No references yet.", quality: "fail", analytics: "❌ Провал! Нет references!", path: "reject_references" }
                ]
            },
            {
                brokerQuestion: "Great! Detention policy: If loading or unloading takes longer than 2 hours, what's your detention rate? And payment terms: do you accept QuickPay or standard 30 days?",
                dispatcherPrompt: "💎 ВОПРОС 10/12: Detention rate + payment terms!",
                suggestions: [
                    { text: "Detention after 2 hours free time is $50/hour - industry standard. We're flexible on payment: QuickPay available at 3% fee (paid in 24 hours), or standard NET 30 days at full rate. Your choice. For long-term partnership, we can discuss better terms. What works for you?", quality: "excellent", analytics: "✨ ОТЛИЧНО! Detention rate, free time, payment options, flexibility!", path: "master" },
                    { text: "Detention $50/hour after 2 hours. QuickPay 3% or NET 30. Your choice.", quality: "good", analytics: "✔️ Хорошо! Detention, payment options.", path: "master" },
                    { text: "Detention $50/hour. NET 30 payment.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Standard detention... payment terms flexible...", quality: "weak", analytics: "⚠️ Слабо! Расплывчато!", path: "weak" },
                    { text: "Detention $100/hour. QuickPay only.", quality: "aggressive", analytics: "🔴 Агрессивно! Завышено!", path: "reject_terms" },
                    { text: "Need payment upfront before pickup.", quality: "fail", analytics: "❌ Провал! Нереальные условия!", path: "reject_terms" }
                ]
            },
            {
                brokerQuestion: "Good! Fuel surcharge: Do you charge fuel surcharge on top of rate, or is it included? And what's your emergency contact number if I can't reach driver during transit?",
                dispatcherPrompt: "💎 ВОПРОС 11/12: Fuel surcharge + emergency contact!",
                suggestions: [
                    { text: "Fuel surcharge is included in our rate - no hidden fees, all-in pricing. For emergency contact: my direct cell is 555-0123, available 24/7. Also our dispatch manager John at 555-0124. Driver's cell is 555-0125. You'll have all three numbers. If driver doesn't answer within 15 minutes, call me directly - I'll locate him immediately.", quality: "excellent", analytics: "✨ ОТЛИЧНО! FSC included, 3 contacts с номерами, 24/7, response time!", path: "master" },
                    { text: "FSC included in rate. Emergency contact: my cell 555-0123, dispatch 555-0124, driver 555-0125. All 24/7.", quality: "good", analytics: "✔️ Хорошо! FSC, contacts.", path: "master" },
                    { text: "FSC included. Have emergency contacts available.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "FSC should be included... can give contacts...", quality: "weak", analytics: "⚠️ Слабо! Неуверенность!", path: "weak" },
                    { text: "FSC is extra 15%. Take it or leave it.", quality: "aggressive", analytics: "🔴 Агрессивно! Скрытые fees!", path: "reject_fsc" },
                    { text: "Don't have emergency contacts. Driver has phone.", quality: "fail", analytics: "❌ Провал! Нет backup!", path: "reject_fsc" }
                ]
            },
            {
                brokerQuestion: "Perfect! Last questions: Do you have a backup reefer available if this truck breaks down? And what's your claims history - any cargo claims in last 2 years?",
                dispatcherPrompt: "💎 ВОПРОС 12/12: Backup truck + claims history!",
                suggestions: [
                    { text: "Yes! We have 2 backup reefers in Chicago area - if primary truck has mechanical issue, backup can be there within 2 hours to transfer load and continue. Claims history: zero cargo claims in last 3 years. Clean record. We maintain trucks religiously to prevent breakdowns. Our reliability is 99.8% on-time delivery. You're in safe hands.", quality: "excellent", analytics: "✨ ОТЛИЧНО! Backup plan детально, zero claims, maintenance, reliability!", path: "master" },
                    { text: "Yes, have 2 backup reefers in Chicago. Zero cargo claims in 3 years. 99.8% on-time.", quality: "good", analytics: "✔️ Хорошо! Backup, claims, reliability.", path: "master" },
                    { text: "Have backup trucks. No recent claims.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Should have backup... claims are minimal...", quality: "weak", analytics: "⚠️ Слабо! Неуверенность!", path: "weak" },
                    { text: "If truck breaks, we'll figure it out.", quality: "aggressive", analytics: "🔴 Агрессивно! Нет плана!", path: "reject_backup" },
                    { text: "No backup. Had 2 claims last year.", quality: "fail", analytics: "❌ Провал! Нет backup, есть claims!", path: "reject_backup" }
                ]
            },
            {
                brokerQuestion: "Excellent! You've answered everything perfectly. I'm impressed with your professionalism. Let's talk rate. What do you need for 710 miles Chicago-Atlanta with dairy?",
                dispatcherPrompt: "💎 ТОРГ! Posted $2,100 ($2.96/mi) - просите $2,300-2,400!",
                suggestions: [
                    { text: "For 710 miles Chicago-Atlanta with temperature-controlled dairy, I'm looking at $2,400. That's $3.38/mile - fair rate for reefer, continuous temp monitoring, experienced dairy driver, and all the professional service we discussed. We deliver value, not just transportation.", quality: "excellent", analytics: "✨ ОТЛИЧНО! $2,400 = $300 больше! С обоснованием!", path: "master" },
                    { text: "$2,300 for this load. $3.24/mile - fair for reefer dairy with all our services.", quality: "good", analytics: "✔️ Хорошо! $2,300 = $200 больше!", path: "master" },
                    { text: "$2,200 for 710 miles.", quality: "normal", analytics: "⚪ Нормально. $100 больше.", path: "master" },
                    { text: "$2,150 for this load?", quality: "weak", analytics: "⚠️ Слабо! Только $50 больше.", path: "weak" },
                    { text: "I need $2,600 minimum! Dairy is expensive to haul.", quality: "aggressive", analytics: "🔴 Агрессивно! $2,600 нереально!", path: "reject_rate" },
                    { text: "I'll take $2,100 posted rate.", quality: "fail", analytics: "❌ Провал! Без торга!", path: "master" }
                ]
            },
            {
                brokerQuestion: "That's high for this lane. I can do $2,200. That's $3.10/mile - already above posted.",
                dispatcherPrompt: "💎 Встречное $2,200. Просите $2,300 или примите!",
                suggestions: [
                    { text: "Can we meet at $2,300? Fair middle ground - you save $100 from my ask, I earn $200 above posted for professional reefer service. Considering our backup trucks, zero claims, and 24/7 support, it's worth the extra $100 for peace of mind.", quality: "excellent", analytics: "✨ ОТЛИЧНО! Логичный компромисс с обоснованием!", path: "master" },
                    { text: "$2,200 works. Let's book it.", quality: "good", analytics: "✔️ Хорошо! Заработал $100!", path: "master" },
                    { text: "$2,200 confirmed.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Okay, $2,200 will work...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" },
                    { text: "$2,300 or I walk!", quality: "aggressive", analytics: "🔴 Агрессивно! Ультиматум!", path: "reject_ultimatum" },
                    { text: "No, I need $2,400!", quality: "fail", analytics: "❌ Провал! Отказ!", path: "reject_ultimatum" }
                ]
            },
            {
                brokerQuestion: "$2,250 final. That's $3.17/mile. You've proven you're professional - worth the extra. Deal?",
                dispatcherPrompt: "💎 ФИНАЛ! $2,250 - заработали $150 больше posted!",
                suggestions: [
                    { text: "$2,250 perfect! Deal! You won't regret working with us.", quality: "excellent", analytics: "✨ ОТЛИЧНО! Принял финальную ставку!", path: "master" },
                    { text: "$2,250 is a deal!", quality: "good", analytics: "✔️ Хорошо! Заработал $150!", path: "master" },
                    { text: "$2,250 confirmed.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Okay, $2,250...", quality: "weak", analytics: "⚠️ Слабо.", path: "weak" },
                    { text: "Can't you do $2,300?", quality: "aggressive", analytics: "🔴 Агрессивно! После final!", path: "reject_final" },
                    { text: "$2,275? Just $25 more?", quality: "fail", analytics: "❌ Провал! Торгуется!", path: "reject_final" }
                ]
            },
            {
                brokerQuestion: "Perfect! What's your email? I'll send rate confirmation now. Remember - 34-38°F constant, GPS tracking, temp log after delivery, and Tuesday 2 PM appointment. This grocery chain is our biggest client - make us look good!",
                dispatcherPrompt: "💎 Email для rate con! Подтвердите все требования!",
                suggestions: [
                    { text: "Perfect! dispatch@fastloadlogistics.com. I'll sign and return within 1 hour. Confirmed: 34-38°F constant temp, GPS tracking link after pickup, complete temp log after delivery, Tuesday 2 PM appointment guaranteed. We'll make you and your grocery client very happy. After delivery, I'll call you personally to confirm everything went perfect. Looking forward to long partnership!", quality: "excellent", analytics: "✨ ОТЛИЧНО! Email, быстрая подпись, все требования, personal touch!", path: "master" },
                    { text: "dispatch@fastloadlogistics.com. I'll sign and return today. 34-38°F, GPS tracking, temp log, Tuesday 2 PM confirmed. Will make you look good!", quality: "good", analytics: "✔️ Хорошо! Email, требования, commitment.", path: "master" },
                    { text: "dispatch@fastloadlogistics.com. Will handle everything properly.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Let me find email... will handle requirements...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" },
                    { text: "Send to any email. Driver knows what to do.", quality: "aggressive", analytics: "🔴 Агрессивно! Непрофессионально!", path: "reject_email" },
                    { text: "No email... can we do by phone?", quality: "fail", analytics: "❌ Провал! Нет email!", path: "reject_email" }
                ]
            },
            {
                brokerResponse: "Excellent! Rate confirmation sent to dispatch@fastloadlogistics.com. Sign and return ASAP. You answered every question professionally - that's rare! I'm adding you to my preferred reefer carriers list. If this goes well, I have 6-8 dairy loads weekly Chicago-Atlanta and surrounding areas. Let's build something long-term. Good luck!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$2,250",
                    ratePerMile: "$3.17/mile",
                    relationship: "strengthened",
                    weeklyLoads: "6-8 dairy loads weekly ($13,500-18,000/week potential)",
                    feedback: `✅ ОТЛИЧНЫЕ ПЕРЕГОВОРЫ! Заработали $150 больше posted ($2,250 vs $2,100 = 7.1%).\n\n💰 ФИНАНСЫ:\n• Ставка: $2,250\n• Дизель: -$278 (110 gal × $3.90 IL→GA)\n• Чистая прибыль: $1,972 (88% от ставки)\n\n💡 УРОК: Детальные ответы на ВСЕ вопросы брокера = доверие = лучшие ставки! Reefer dairy требует: temp monitoring, data logger, backup trucks, references, emergency contacts.\n\n🎯 РЕАЛЬНОСТЬ: Профессионализм = preferred carrier status = 6-8 loads weekly ($54,000-72,000/месяц потенциал)! Один отличный звонок открывает двери к постоянным грузам!`
                }
            }
        ],

        weak: [
            {
                brokerQuestion: "You said 'we have some reefers'? I need to know exactly - how many reefer trucks do you have and where is the one for this load right now?",
                dispatcherPrompt: "⚠️ Брокер требует точности! Ответьте уверенно!",
                suggestions: [
                    { text: "I apologize for being unclear. We have 15 reefer trucks. The one for this load is in Chicago at cold storage facility, empty and ready. Unit serviced last week. Driver ready for 6 AM pickup.", quality: "good", analytics: "✔️ ИСПРАВИЛСЯ! Дал точную информацию!", path: "master" },
                    { text: "We have 15 reefers. One is in Chicago, ready.", quality: "normal", analytics: "⚪ Нормально.", path: "weak" },
                    { text: "We have several reefers... one should be available...", quality: "weak", analytics: "⚠️ СЛАБО! Снова неуверенность!", path: "weak" },
                    { text: "I need to check with dispatch...", quality: "fail", analytics: "❌ ПРОВАЛ! Не знает свой fleet!", path: "reject_weak_final" },
                    { text: "Why so many questions? Just give me the load!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_weak_final" },
                    { text: "I don't know exactly... maybe 10 reefers?", quality: "fail", analytics: "❌ ПРОВАЛ! Не знает компанию!", path: "reject_weak_final" }
                ]
            },
            {
                brokerQuestion: "Okay. Now about the driver - does he have dairy experience? And when was your reefer unit last serviced?",
                dispatcherPrompt: "💎 Брокер проверяет опыт и equipment. Ответьте уверенно!",
                suggestions: [
                    { text: "Yes! Driver has 4 years dairy experience, understands temperature control 34-38°F. Reefer unit serviced last week - full maintenance, all systems checked. Service report available.", quality: "good", analytics: "✔️ ХОРОШО! Показали опыт и service!", path: "master" },
                    { text: "Driver has dairy experience. Unit serviced recently.", quality: "normal", analytics: "⚪ Нормально.", path: "weak" },
                    { text: "Driver has some experience... unit should be okay...", quality: "weak", analytics: "⚠️ СЛАБО!", path: "weak" },
                    { text: "Driver can handle any load.", quality: "aggressive", analytics: "🔴 Агрессивно! Нет деталей!", path: "reject_weak_final" },
                    { text: "Not sure about service date...", quality: "fail", analytics: "❌ ПРОВАЛ! Не знает equipment!", path: "reject_weak_final" },
                    { text: "Driver is new but learns fast.", quality: "fail", analytics: "❌ ПРОВАЛ! Нет опыта!", path: "reject_weak_final" }
                ]
            },
            {
                brokerQuestion: "Do you have $100K cargo insurance for perishable goods? And what's your tracking policy?",
                dispatcherPrompt: "💎 Insurance + tracking. Ответьте четко!",
                suggestions: [
                    { text: "Yes! $100K cargo insurance with perishable coverage through Progressive. GPS tracking with updates every 6 hours including temp readings. I'll send insurance cert after booking.", quality: "good", analytics: "✔️ ХОРОШО!", path: "master" },
                    { text: "$100K insurance with perishable coverage. Have GPS tracking.", quality: "normal", analytics: "⚪ Нормально.", path: "weak" },
                    { text: "Should have insurance... tracking available...", quality: "weak", analytics: "⚠️ СЛАБО!", path: "weak" },
                    { text: "Insurance is standard. Don't worry.", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_weak" },
                    { text: "Have $50K insurance. Is that okay?", quality: "fail", analytics: "❌ ПРОВАЛ! Недостаточно!", path: "reject_insurance" },
                    { text: "No tracking system. Driver calls.", quality: "fail", analytics: "❌ ПРОВАЛ! Нет tracking!", path: "reject_weak" }
                ]
            },
            {
                brokerQuestion: "This load has appointment Tuesday 2 PM in Atlanta. It's a major grocery chain - they're strict. Can you commit to Tuesday 2 PM?",
                dispatcherPrompt: "💎 Appointment commitment. Дайте гарантию!",
                suggestions: [
                    { text: "Absolutely committed to Tuesday 2 PM! Based on 710 miles, we'll depart tomorrow 6 AM, arrive Monday evening with buffer. Zero tolerance for late delivery.", quality: "good", analytics: "✔️ ХОРОШО! Дали commitment!", path: "master" },
                    { text: "Yes, Tuesday 2 PM works. We'll plan accordingly.", quality: "normal", analytics: "⚪ Нормально.", path: "weak" },
                    { text: "We'll try for Tuesday 2 PM... should be okay...", quality: "weak", analytics: "⚠️ СЛАБО!", path: "weak" },
                    { text: "Traffic is unpredictable. Can't promise.", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_commitment" },
                    { text: "Driver will try his best.", quality: "fail", analytics: "❌ ПРОВАЛ! Нет гарантии!", path: "reject_commitment" },
                    { text: "Maybe Tuesday, maybe Wednesday.", quality: "fail", analytics: "❌ ПРОВАЛ! Нет commitment!", path: "reject_commitment" }
                ]
            },
            {
                brokerQuestion: "You said 'we'll try' for Tuesday 2 PM. That's not good enough. This is a major grocery chain - they require commitment. Can you GUARANTEE Tuesday 2 PM delivery or should I find another carrier?",
                dispatcherPrompt: "⚠️ КРИТИЧНО! Брокер требует гарантии! Исправьтесь СЕЙЧАС!",
                suggestions: [
                    { text: "You're absolutely right, I apologize. YES, I GUARANTEE Tuesday 2 PM delivery. We'll depart tomorrow 6 AM, arrive Monday evening with full buffer. I'll personally monitor this load. You have my word - we will NOT be late.", quality: "good", analytics: "✔️ ИСПРАВИЛСЯ! Дал гарантию!", path: "master" },
                    { text: "Yes, guaranteed Tuesday 2 PM. We'll arrive with buffer time.", quality: "normal", analytics: "⚪ Нормально. Подтвердил.", path: "weak" },
                    { text: "We'll do our best to make it...", quality: "weak", analytics: "⚠️ СЛАБО! Снова неуверенность!", path: "weak" },
                    { text: "I can't guarantee anything with traffic...", quality: "fail", analytics: "❌ ПРОВАЛ! Отказ гарантировать!", path: "reject_weak" },
                    { text: "Find another carrier then!", quality: "aggressive", analytics: "🔴 Агрессивно! Грубость!", path: "reject_weak" },
                    { text: "Probably Tuesday... maybe...", quality: "fail", analytics: "❌ ПРОВАЛ! Нет уверенности!", path: "reject_weak" }
                ]
            },
            {
                brokerQuestion: "I'm not confident in your operation. Can you provide broker references who can confirm your reliability with reefer loads?",
                dispatcherPrompt: "💎 Брокер требует references. Дайте их!",
                suggestions: [
                    { text: "Absolutely! I can provide 3 broker references right now - Mike at ColdFreight, Lisa at FreshChain, Tom at DairyExpress. All can confirm our reefer reliability. I'll send their contact info immediately.", quality: "good", analytics: "✔️ ХОРОШО! Дали references!", path: "master" },
                    { text: "Yes, can provide broker references. I'll send contacts.", quality: "normal", analytics: "⚪ Нормально.", path: "weak" },
                    { text: "I think I can find some references...", quality: "weak", analytics: "⚠️ СЛАБО!", path: "weak" },
                    { text: "Why need references? We're reliable!", quality: "aggressive", analytics: "🔴 Агрессивно! Оборонительно!", path: "reject_weak" },
                    { text: "We're new. No references yet.", quality: "fail", analytics: "❌ ПРОВАЛ! Нет references!", path: "reject_weak" },
                    { text: "Can't give references. Confidential.", quality: "fail", analytics: "❌ ПРОВАЛ! Отказ!", path: "reject_weak" }
                ]
            },
            {
                brokerQuestion: "Okay, I'll give you one chance. But rate is $2,100 - the posted rate. No premium for uncertainty. And I need you to text me every 6 hours with location and temp. Deal?",
                dispatcherPrompt: "💎 Брокер дает шанс но без премии. Примите $2,100!",
                suggestions: [
                    { text: "Deal! $2,100 accepted. I'll text you every 6 hours with location and temp. Thank you for the chance - we won't let you down. What's your cell number?", quality: "good", analytics: "✔️ ХОРОШО! Принял условия.", path: "weak_success" },
                    { text: "$2,100 works. Will send updates every 6 hours.", quality: "normal", analytics: "⚪ Нормально.", path: "weak_success" },
                    { text: "Okay, $2,100...", quality: "weak", analytics: "⚠️ Слабо.", path: "weak_success" },
                    { text: "Can you do $2,150 at least?", quality: "fail", analytics: "❌ ПРОВАЛ! Торгуется после слабости!", path: "reject_weak" },
                    { text: "Every 6 hours is too much...", quality: "aggressive", analytics: "🔴 Агрессивно! Отказ от условий!", path: "reject_weak" },
                    { text: "I need more than posted rate.", quality: "fail", analytics: "❌ ПРОВАЛ! Жадность!", path: "reject_weak" }
                ]
            },
            {
                brokerResponse: "Okay. $2,100 booked. My cell is 555-9999. Text me every 6 hours with location and temp. Don't be late - this is your only shot with me.",
                outcome: {
                    type: "success",
                    quality: "normal",
                    rate: "$2,100",
                    ratePerMile: "$2.96/mile",
                    relationship: "neutral",
                    feedback: `✅ УСПЕХ, НО БЕЗ ПРЕМИИ. Заработали posted rate ($2,100).\n\n💰 ФИНАНСЫ:\n• Ставка: $2,100\n• Дизель: -$278 (110 gal × $3.90)\n• Чистая прибыль: $1,822\n\n⚠️ УРОК: Неуверенность стоит денег! Потеряли $150 премии из-за слабых ответов. Брокер дал шанс, но без доверия = без премиальной ставки.\n\n💡 ВЫВОД: Всегда отвечайте уверенно с первого раза! "We'll try" и "should be" = красные флаги для брокеров.`
                }
            }
        ],

        weak_success: [
            {
                brokerQuestion: "What's your email for rate confirmation?",
                dispatcherPrompt: "💎 Email для rate con.",
                suggestions: [
                    { text: "dispatch@fastloadlogistics.com. I'll sign and return within 2 hours.", quality: "good", analytics: "✔️ Хорошо!", path: "weak_success" },
                    { text: "dispatch@fastloadlogistics.com.", quality: "normal", analytics: "⚪ Нормально.", path: "weak_success" },
                    { text: "Let me find email...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak_success" },
                    { text: "Send to any email.", quality: "fail", analytics: "❌ Провал!", path: "reject_email" },
                    { text: "No email. Can we do phone?", quality: "fail", analytics: "❌ Провал!", path: "reject_email" },
                    { text: "I'll give you email later.", quality: "fail", analytics: "❌ Провал!", path: "reject_email" }
                ]
            }
        ],

        warning: [
            {
                brokerQuestion: "I understand you're busy, but dairy is temperature-sensitive cargo. I need to verify your company and reefer capability for insurance and safety. This is standard for all cold chain carriers. Can you provide MC number and confirm reefer experience? Critical for both of us.",
                dispatcherPrompt: "⚠️ ПРЕДУПРЕЖДЕНИЕ! Второй шанс!",
                suggestions: [
                    { text: "You're absolutely right, I apologize. MC 445566, FastLoad Logistics. 15 reefer trucks, 4 years dairy experience. Reefer in Chicago, ready 6 AM. Where's pickup?", quality: "good", analytics: "✔️ ИСПРАВИЛСЯ!", path: "master" },
                    { text: "Sorry. MC 445566, FastLoad Logistics. Reefer in Chicago.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "MC 445566... have reefers...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" },
                    { text: "I don't have MC right now...", quality: "fail", analytics: "❌ ПРОВАЛ!", path: "reject_early" },
                    { text: "Just send load info!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_early" },
                    { text: "Why so difficult?", quality: "fail", analytics: "❌ ПРОВАЛ!", path: "reject_early" }
                ]
            }
        ],

        reject_early: [
            {
                brokerResponse: "I need professional reefer carriers who understand dairy requirements. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Непрофессионализм после предупреждения! Dairy loads требуют серьезного подхода с первых секунд."
                }
            }
        ],

        reject_weak: [
            {
                brokerQuestion: "I'm hearing too much uncertainty. Dairy is temperature-sensitive cargo for a major grocery client. I need a professional carrier who knows their operation. Can you provide solid answers or should I move on?",
                dispatcherPrompt: "⚠️ ПОСЛЕДНИЙ ШАНС! Брокер теряет терпение!",
                suggestions: [
                    { text: "You're absolutely right, I apologize. Let me be clear: We have 15 reefer trucks, driver has 4 years dairy experience, $100K insurance, GPS tracking. We're ready for this load.", quality: "good", analytics: "✔️ ИСПРАВИЛСЯ! Дал четкие ответы!", path: "master" },
                    { text: "I understand. We have proper equipment and experience for dairy loads.", quality: "normal", analytics: "⚪ Нормально.", path: "weak" },
                    { text: "We can handle it... probably...", quality: "weak", analytics: "⚠️ СЛАБО! Снова неуверенность!", path: "reject_weak_final" },
                    { text: "I need to check with my manager...", quality: "fail", analytics: "❌ ПРОВАЛ! Не знает свою компанию!", path: "reject_weak_final" },
                    { text: "Why so many questions? Just give me the load!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_weak_final" },
                    { text: "Find another carrier then.", quality: "fail", analytics: "❌ ПРОВАЛ! Сдался!", path: "reject_weak_final" }
                ]
            },
            {
                brokerResponse: "Sorry, I can't risk this dairy load with uncertainty. I need a reliable carrier for my grocery client. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ! Продолжали показывать неуверенность. Dairy loads требуют ГАРАНТИЙ, не 'попыток'. Брокеры не рискуют с ненадежными перевозчиками для major clients."
                }
            }
        ],

        reject_weak_final: [
            {
                brokerResponse: "Sorry, I can't risk this dairy load with uncertainty. I need a reliable carrier for my grocery client. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ! Продолжали показывать неуверенность. Dairy loads требуют ГАРАНТИЙ, не 'попыток'. Брокеры не рискуют с ненадежными перевозчиками для major clients."
                }
            }
        ],

        reject_attitude: [
            {
                brokerQuestion: "Hold on. This is temperature-sensitive dairy - 6 AM pickup required for grocery schedule. I need professional attitude and confirmation. Can your driver be there 6 AM with proper reefer equipment? Yes or no?",
                dispatcherPrompt: "⚠️ ШАНС ИСПРАВИТЬСЯ! Dairy требует профессионализма!",
                suggestions: [
                    { text: "You're right, I apologize. Yes, driver will be at pickup 6 AM sharp with reefer and all equipment. We understand dairy schedules.", quality: "good", analytics: "✔️ ИСПРАВИЛСЯ!", path: "master" },
                    { text: "Yes, 6 AM confirmed with reefer equipment.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Driver can't make 6 AM...", quality: "fail", analytics: "❌ ФИНАЛ!", path: "reject_attitude_final" },
                    { text: "Why such big deal?", quality: "aggressive", analytics: "🔴 ФИНАЛ!", path: "reject_attitude_final" },
                    { text: "6 AM is too early.", quality: "fail", analytics: "❌ ФИНАЛ!", path: "reject_attitude_final" },
                    { text: "Take it or leave it.", quality: "aggressive", analytics: "🔴 ФИНАЛ!", path: "reject_attitude_final" }
                ]
            }
        ],

        reject_attitude_final: [
            {
                brokerResponse: "I need professional carrier for dairy. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Dairy требует профессионализма и пунктуальности! Грубость и отказ от требований = потеря груза."
                }
            }
        ],

        reject_timing: [
            {
                brokerQuestion: "6 AM pickup is critical - dairy schedule for grocery chain. Can you get driver there by 6 AM or have another reefer available?",
                dispatcherPrompt: "⚠️ ШАНС ИСПРАВИТЬСЯ! Dairy требует раннего pickup!",
                suggestions: [
                    { text: "Let me check... actually yes, driver can be there 6 AM. I'll make sure of it for dairy.", quality: "good", analytics: "✔️ ИСПРАВИЛСЯ!", path: "master" },
                    { text: "Yes, 6 AM works.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Earliest is 9 AM...", quality: "fail", analytics: "❌ ФИНАЛ!", path: "reject_timing_final" },
                    { text: "Can they load later?", quality: "aggressive", analytics: "🔴 ФИНАЛ!", path: "reject_timing_final" },
                    { text: "6 AM impossible.", quality: "fail", analytics: "❌ ФИНАЛ!", path: "reject_timing_final" },
                    { text: "Driver sleeps until 8 AM.", quality: "fail", analytics: "❌ ФИНАЛ!", path: "reject_timing_final" }
                ]
            }
        ],

        reject_timing_final: [
            {
                brokerResponse: "I need carrier who can meet dairy pickup time. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Dairy требует раннего pickup для grocery schedule! Не можете вовремя = нет груза."
                }
            }
        ],

        reject_experience: [
            {
                brokerQuestion: "Dairy requires experienced drivers who understand temperature control. Can you get a driver with dairy experience or should I find another carrier?",
                dispatcherPrompt: "⚠️ ШАНС ИСПРАВИТЬСЯ! Dairy требует опыта!",
                suggestions: [
                    { text: "Actually, I checked - our driver has 4 years dairy experience. Clean DOT record. I'll send his credentials.", quality: "good", analytics: "✔️ ИСПРАВИЛСЯ!", path: "master" },
                    { text: "Yes, driver has dairy experience available.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Can't get experienced driver...", quality: "fail", analytics: "❌ ФИНАЛ!", path: "reject_experience_final" },
                    { text: "Any driver can haul dairy!", quality: "aggressive", analytics: "🔴 ФИНАЛ!", path: "reject_experience_final" },
                    { text: "Driver will learn on the way.", quality: "fail", analytics: "❌ ФИНАЛ!", path: "reject_experience_final" },
                    { text: "Experience not needed.", quality: "aggressive", analytics: "🔴 ФИНАЛ!", path: "reject_experience_final" }
                ]
            }
        ],

        reject_experience_final: [
            {
                brokerResponse: "I need carrier with dairy experience. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Dairy требует опытных водителей! Нет опыта = нет груза."
                }
            }
        ],

        reject_insurance: [
            {
                brokerQuestion: "$100K cargo coverage with perishable goods coverage required for dairy. Standard requirement. Can you get additional coverage or have another reefer with proper insurance?",
                dispatcherPrompt: "⚠️ ШАНС ИСПРАВИТЬСЯ! Dairy требует $100K!",
                suggestions: [
                    { text: "Actually, I checked - we do have $100K with perishable coverage. Certificate current. I'll send it.", quality: "good", analytics: "✔️ ИСПРАВИЛСЯ!", path: "master" },
                    { text: "Yes, $100K coverage available.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Can't get additional coverage...", quality: "fail", analytics: "❌ ФИНАЛ!", path: "reject_insurance_final" },
                    { text: "$50K should be enough!", quality: "aggressive", analytics: "🔴 ФИНАЛ!", path: "reject_insurance_final" },
                    { text: "Insurance too expensive.", quality: "fail", analytics: "❌ ФИНАЛ!", path: "reject_insurance_final" },
                    { text: "Why need so much insurance?", quality: "aggressive", analytics: "🔴 ФИНАЛ!", path: "reject_insurance_final" }
                ]
            }
        ],

        reject_insurance_final: [
            {
                brokerResponse: "I need carrier with $100K perishable coverage for dairy. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Недостаточная страховка для dairy! $100K perishable coverage обязательна."
                }
            }
        ],

        reject_communication: [
            {
                brokerQuestion: "GPS tracking and regular updates are standard for dairy loads. Can you provide tracking or should I find another carrier?",
                dispatcherPrompt: "⚠️ ШАНС ИСПРАВИТЬСЯ! Dairy требует tracking!",
                suggestions: [
                    { text: "Actually, we do have GPS tracking. I'll provide link after pickup with updates every 6 hours.", quality: "good", analytics: "✔️ ИСПРАВИЛСЯ!", path: "master" },
                    { text: "Yes, GPS tracking available.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Can't provide tracking...", quality: "fail", analytics: "❌ ФИНАЛ!", path: "reject_communication_final" },
                    { text: "Driver has phone. That's enough!", quality: "aggressive", analytics: "🔴 ФИНАЛ!", path: "reject_communication_final" },
                    { text: "Tracking not needed.", quality: "fail", analytics: "❌ ФИНАЛ!", path: "reject_communication_final" },
                    { text: "Too expensive to add tracking.", quality: "fail", analytics: "❌ ФИНАЛ!", path: "reject_communication_final" }
                ]
            }
        ],

        reject_communication_final: [
            {
                brokerResponse: "I need carrier with GPS tracking for dairy. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет GPS tracking = нет dairy груза! Tracking обязателен для temperature-sensitive cargo."
                }
            }
        ],

        reject_commitment: [
            {
                brokerQuestion: "Appointment commitment is critical for grocery chain. Can you GUARANTEE Tuesday 2 PM or should I find another carrier?",
                dispatcherPrompt: "⚠️ ШАНС ИСПРАВИТЬСЯ! Dairy требует commitment!",
                suggestions: [
                    { text: "You're right. YES, I GUARANTEE Tuesday 2 PM. We'll depart 6 AM tomorrow, arrive Monday evening with buffer.", quality: "good", analytics: "✔️ ИСПРАВИЛСЯ!", path: "master" },
                    { text: "Yes, guaranteed Tuesday 2 PM.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Can't guarantee with traffic...", quality: "fail", analytics: "❌ ФИНАЛ!", path: "reject_commitment_final" },
                    { text: "Driver will try his best.", quality: "fail", analytics: "❌ ФИНАЛ!", path: "reject_commitment_final" },
                    { text: "Appointments are flexible, right?", quality: "aggressive", analytics: "🔴 ФИНАЛ!", path: "reject_commitment_final" },
                    { text: "Maybe Tuesday, maybe Wednesday.", quality: "fail", analytics: "❌ ФИНАЛ!", path: "reject_commitment_final" }
                ]
            }
        ],

        reject_commitment_final: [
            {
                brokerResponse: "I need carrier who can commit to appointment for grocery chain. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет commitment = нет dairy груза! Grocery chains требуют точных appointments."
                }
            }
        ],

        reject_equipment: [
            {
                brokerResponse: "Load locks and straps are required for dairy load safety. I need carrier with proper equipment. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет load locks/straps = нет dairy груза! Proper equipment обязателен для безопасности."
                }
            }
        ],

        reject_monitoring: [
            {
                brokerResponse: "Temperature monitoring with data logger is required for dairy. I need carrier with proper equipment. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет temp monitoring = нет dairy груза! Data logger обязателен для cold chain."
                }
            }
        ],

        reject_references: [
            {
                brokerResponse: "I need carrier with verifiable references for dairy loads. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет references = нет доверия! Брокеры проверяют новых carriers для dairy."
                }
            }
        ],

        reject_terms: [
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

        reject_fsc: [
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

        reject_backup: [
            {
                brokerResponse: "Backup plan and clean claims history required for dairy. I need reliable carrier. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет backup truck или есть claims = риск для dairy груза!"
                }
            }
        ],

        reject_rate: [
            {
                brokerResponse: "$2,600 is way too high for this lane. I need realistic carrier. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: $2,600 нереально! Posted $2,100, можно просить $2,300-2,400, но не $2,600!"
                }
            }
        ],

        reject_ultimatum: [
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

        reject_final: [
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

        reject_email: [
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

allScenarios.push(scenario16);
console.log('✅ Scenario 16 loaded: Reefer Dairy Products (Chicago → Atlanta)');
