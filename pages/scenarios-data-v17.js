// DIALOGUE #17 - Dry Van Electronics (FULL VERSION)
// Los Angeles CA → Dallas TX, 1,390 miles
// Posted: $2,800 ($2.01/mile), Target: $3,100-3,300
// Created: March 8, 2026

console.log('🔵 Loading scenarios-data-v17.js...');

const scenario17 = {
    id: 17,
    route: "Los Angeles CA → Dallas TX",
    distance: 1390,
    equipment: "Dry Van (53ft)",
    cargo: "Electronics (laptops, tablets)",
    weight: "38,000 lbs",
    postedRate: "$2,800 ($2.01/mile)",
    deadline: "Pickup tomorrow 8 AM, Delivery in 3 days",
    brokerStyle: "Professional high-value cargo broker - very careful",
    difficulty: "hard",
    initialMessage: "Good afternoon! This is David from TechFreight Logistics.\nI'm calling about your posted dry van load Los Angeles to Dallas with electronics.\nIs this load still available?",

    paths: {
        master: [
            {
                brokerQuestion: "Good afternoon! This is Jennifer from SecureLoad Brokers.\nYes, still available.\nWhat's your MC number, company name, and how many dry vans do you operate?",
                dispatcherPrompt: "💎 ВОПРОС 1/12: MC, компания, fleet size!",
                suggestions: [
                    { text: "Good afternoon Jennifer! MC 445566, TechFreight Logistics. We operate 25 dry vans, all 53ft with air-ride suspension. Specialized in high-value electronics for 4 years. What's the exact value of this electronics shipment?", quality: "excellent", analytics: "✨ ОТЛИЧНО! MC, компания, fleet 25, специализация, вопрос!", path: "master" },
                    { text: "Afternoon! MC 445566, TechFreight Logistics. We have 25 dry vans. What's the cargo value?", quality: "good", analytics: "✔️ Хорошо! MC, компания, fleet.", path: "master" },
                    { text: "MC 445566, TechFreight Logistics. We have dry vans.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "MC 445566... we have some vans...", quality: "weak", analytics: "⚠️ Слабо! Неуверенность!", path: "weak" },
                    { text: "Why need all details? Just tell me the rate!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning" },
                    { text: "Dry van available. What's the load?", quality: "fail", analytics: "❌ Провал! Нет MC!", path: "warning" }
                ]
            },
            {
                brokerQuestion: "Good! 1,390 miles LA to Dallas. Electronics - laptops and tablets, 38,000 lbs. Cargo value $850,000. Where is your dry van right now and does it have air-ride suspension?",
                dispatcherPrompt: "💎 ВОПРОС 2/12: Местоположение van + air-ride!",
                suggestions: [
                    { text: "Perfect! Van is in Los Angeles at secure warehouse in Vernon area, empty since yesterday. Yes, equipped with air-ride suspension - critical for electronics. Driver can be at pickup 8 AM sharp. What's the exact pickup address and any special loading requirements?", quality: "excellent", analytics: "✨ ОТЛИЧНО! Точное местоположение, air-ride, готовность, вопрос!", path: "master" },
                    { text: "Van in LA at warehouse, empty. Has air-ride suspension. Driver ready 8 AM. What's pickup address?", quality: "good", analytics: "✔️ Хорошо! Местоположение, air-ride, готовность.", path: "master" },
                    { text: "Van in LA. Has air-ride.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Should be in LA... has suspension...", quality: "weak", analytics: "⚠️ Слабо! Неуверенность!", path: "weak" },
                    { text: "Just tell me the rate first!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_attitude" },
                    { text: "Driver can't be there until 10 AM... 8 AM too early.", quality: "fail", analytics: "❌ Провал! Не может вовремя!", path: "reject_timing" }
                ]
            },
            {
                brokerQuestion: "Excellent! Now, electronics worth $850K require experienced drivers. What's your driver's experience with high-value cargo? And does your driver have a clean DOT inspection record?",
                dispatcherPrompt: "💎 ВОПРОС 3/12: Опыт водителя с high-value + DOT record!",
                suggestions: [
                    { text: "Our driver has 5 years experience specifically with high-value electronics - laptops, tablets, smartphones. He understands careful handling, no sudden stops, secure parking only. Clean DOT inspection record - last inspection 1 month ago, zero violations. Safety rating Satisfactory. He treats high-value cargo like gold.", quality: "excellent", analytics: "✨ ОТЛИЧНО! 5 лет electronics опыт, понимание handling, DOT clean, safety rating!", path: "master" },
                    { text: "Driver has 5 years high-value cargo experience. Clean DOT record, last inspection 1 month ago.", quality: "good", analytics: "✔️ Хорошо! Опыт, DOT clean.", path: "master" },
                    { text: "Driver experienced with electronics. DOT record clean.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Driver has some electronics experience... DOT should be okay...", quality: "weak", analytics: "⚠️ Слабо! Неуверенность!", path: "weak" },
                    { text: "Driver knows how to drive. That's enough!", quality: "aggressive", analytics: "🔴 Агрессивно! Пренебрежение!", path: "reject_attitude" },
                    { text: "Driver has regular license. Is that okay?", quality: "fail", analytics: "❌ Провал! Нет опыта!", path: "reject_experience" }
                ]
            },
            {
                brokerQuestion: "Good! Insurance question: Do you have $100K cargo coverage? And what's your liability coverage? I need current certificates for $850K cargo.",
                dispatcherPrompt: "💎 ВОПРОС 4/12: Insurance $100K cargo + liability!",
                suggestions: [
                    { text: "Yes! $100K cargo insurance through Progressive Commercial. $1M liability coverage. Both certificates current, expire December 2027. I'll email both certificates immediately after booking. Insurance agent is available if you need verification. For $850K cargo, we can add rider if needed. What's your email?", quality: "excellent", analytics: "✨ ОТЛИЧНО! $100K cargo, $1M liability, даты, готовность, rider option!", path: "master" },
                    { text: "Yes, $100K cargo, $1M liability through Progressive. Current certificates. I'll send after booking.", quality: "good", analytics: "✔️ Хорошо! Coverage детали, готовность.", path: "master" },
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
                    { text: "Excellent question! We provide GPS tracking link immediately after pickup. Updates every 4 hours via text/email with location. If any delay occurs, we notify you minimum 8 hours before appointment - never surprises. Driver available 24/7 by phone. After delivery, we send POD within 1 hour. For $850K cargo, we provide extra attention.", quality: "excellent", analytics: "✨ ОТЛИЧНО! GPS, updates 4 часа, delay 8 часов, 24/7, POD, extra attention!", path: "master" },
                    { text: "GPS tracking after pickup. Updates every 4 hours. Delay notification 8 hours before appointment. Driver available 24/7.", quality: "good", analytics: "✔️ Хорошо! Tracking, updates, notification.", path: "master" },
                    { text: "GPS tracking. Regular updates. Will notify about delays.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "We'll send updates... will call if problems...", quality: "weak", analytics: "⚠️ Слабо! Расплывчато!", path: "weak" },
                    { text: "Driver will call when he gets there.", quality: "aggressive", analytics: "🔴 Агрессивно! Минимум коммуникации!", path: "reject_communication" },
                    { text: "No tracking system. Driver has phone.", quality: "fail", analytics: "❌ Провал! Нет tracking!", path: "reject_communication" }
                ]
            },
            {
                brokerQuestion: "Excellent communication policy! Delivery question: This load has appointment Thursday 5 PM in Dallas. It's a major electronics retailer - they're strict. Can you commit to Thursday 5 PM? What's your plan if there's traffic or weather delay?",
                dispatcherPrompt: "💎 ВОПРОС 6/12: Appointment commitment + backup plan!",
                suggestions: [
                    { text: "Absolutely committed to Thursday 5 PM! Based on 1,390 miles and driver's HOS, we'll depart LA tomorrow 8 AM, arrive Dallas Thursday morning with 9-hour buffer. If traffic or weather delay, driver has backup route via I-40. We monitor weather constantly. If major delay expected, I'll call you 12 hours ahead to coordinate with retailer. Zero tolerance for late delivery.", quality: "excellent", analytics: "✨ ОТЛИЧНО! Commitment, расчет с buffer, backup route, weather, early notification!", path: "master" },
                    { text: "Yes, committed to Thursday 5 PM. We'll arrive Thursday morning with buffer. Have backup route if delays. Will notify early if problems.", quality: "good", analytics: "✔️ Хорошо! Commitment, buffer, backup.", path: "master" },
                    { text: "Yes, Thursday 5 PM works. We'll plan accordingly.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "We'll try for Thursday 5 PM... should be okay...", quality: "weak", analytics: "⚠️ Слабо! 'Try' не внушает уверенности!", path: "weak" },
                    { text: "Traffic is unpredictable. Can't guarantee.", quality: "aggressive", analytics: "🔴 Агрессивно! Отказ commitment!", path: "reject_commitment" },
                    { text: "Driver will get there when he gets there.", quality: "fail", analytics: "❌ Провал! Нет commitment!", path: "reject_commitment" }
                ]
            },
            {
                brokerQuestion: "Great planning! Loading procedure: Pickup is at warehouse, loading takes 1.5 hours. Do you have load locks and straps? And will your driver inspect the load before leaving to ensure proper securing?",
                dispatcherPrompt: "💎 ВОПРОС 7/12: Load locks/straps + inspection procedure!",
                suggestions: [
                    { text: "Yes! Van equipped with 10 load locks and 15 heavy-duty straps. Driver will inspect entire load before departure - check securing, weight distribution, and verify all pallets stable. He'll take photos of loaded cargo for documentation. If any securing issues, he'll request reload before leaving. We never leave with improperly secured electronics.", quality: "excellent", analytics: "✨ ОТЛИЧНО! Equipment детали, inspection procedure, photos, quality control!", path: "master" },
                    { text: "Yes, have 10 load locks and 15 straps. Driver will inspect load and take photos before leaving.", quality: "good", analytics: "✔️ Хорошо! Equipment, inspection.", path: "master" },
                    { text: "Yes, have load locks and straps. Driver will inspect.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Should have equipment... driver will check...", quality: "weak", analytics: "⚠️ Слабо! Неуверенность!", path: "weak" },
                    { text: "Driver knows what to do.", quality: "aggressive", analytics: "🔴 Агрессивно! Нет деталей!", path: "reject_equipment" },
                    { text: "Don't have load locks. Can we use rope?", quality: "fail", analytics: "❌ Провал! Нет equipment!", path: "reject_equipment" }
                ]
            },
            {
                brokerQuestion: "Perfect! Security: Does your driver understand secure parking requirements for high-value cargo? Where will he park overnight?",
                dispatcherPrompt: "💎 ВОПРОС 8/12: Secure parking для high-value cargo!",
                suggestions: [
                    { text: "Absolutely! Driver understands high-value cargo security. He'll park only at secure truck stops with 24/7 security cameras and lighting - TA, Petro, Love's. Never at rest areas or unsecured locations. He'll park in well-lit areas close to building. Van has additional padlock on doors. For $850K cargo, security is priority #1.", quality: "excellent", analytics: "✨ ОТЛИЧНО! Понимание security, конкретные места, дополнительная защита!", path: "master" },
                    { text: "Yes, driver parks only at secure truck stops with cameras - TA, Petro, Love's. Never rest areas. Van has padlock.", quality: "good", analytics: "✔️ Хорошо! Security awareness, конкретные места.", path: "master" },
                    { text: "Driver parks at secure truck stops.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Driver will find safe parking...", quality: "weak", analytics: "⚠️ Слабо! Расплывчато!", path: "weak" },
                    { text: "Driver parks wherever there's space.", quality: "aggressive", analytics: "🔴 Агрессивно! Нет понимания security!", path: "reject_security" },
                    { text: "Rest areas are fine for parking.", quality: "fail", analytics: "❌ Провал! Опасно для high-value!", path: "reject_security" }
                ]
            },
            {
                brokerQuestion: "Excellent! References: Can you provide 2-3 broker references who can confirm your reliability with high-value electronics loads? I like to verify new carriers.",
                dispatcherPrompt: "💎 ВОПРОС 9/12: Broker references для electronics!",
                suggestions: [
                    { text: "Absolutely! I can provide 3 broker references right now: 1) Steve Martinez at TechLoad (worked 2 years, 60+ electronics loads), 2) Rachel Kim at ElectroFreight (1.5 years, 40+ loads), 3) James Brown at HighValue Logistics (8 months, 20+ loads). All can confirm our reliability, on-time delivery, and zero cargo claims. I'll email their contact info with permission. Would you like to call them before booking?", quality: "excellent", analytics: "✨ ОТЛИЧНО! 3 references с именами, компаниями, длительностью, количеством loads!", path: "master" },
                    { text: "Yes! Can provide 3 broker references - Steve at TechLoad, Rachel at ElectroFreight, James at HighValue. All can confirm our electronics reliability. I'll send contacts.", quality: "good", analytics: "✔️ Хорошо! 3 references с именами.", path: "master" },
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
                    { text: "Fuel surcharge is included in our rate - no hidden fees, all-in pricing. For emergency contact: my direct cell is 555-0123, available 24/7. Also our dispatch manager Sarah at 555-0124. Driver's cell is 555-0125. You'll have all three numbers. If driver doesn't answer within 15 minutes, call me directly - I'll locate him immediately.", quality: "excellent", analytics: "✨ ОТЛИЧНО! FSC included, 3 contacts с номерами, 24/7, response time!", path: "master" },
                    { text: "FSC included in rate. Emergency contact: my cell 555-0123, dispatch 555-0124, driver 555-0125. All 24/7.", quality: "good", analytics: "✔️ Хорошо! FSC, contacts.", path: "master" },
                    { text: "FSC included. Have emergency contacts available.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "FSC should be included... can give contacts...", quality: "weak", analytics: "⚠️ Слабо! Неуверенность!", path: "weak" },
                    { text: "FSC is extra 15%. Take it or leave it.", quality: "aggressive", analytics: "🔴 Агрессивно! Скрытые fees!", path: "reject_fsc" },
                    { text: "Don't have emergency contacts. Driver has phone.", quality: "fail", analytics: "❌ Провал! Нет backup!", path: "reject_fsc" }
                ]
            },
            {
                brokerQuestion: "Perfect! Last questions: Do you have a backup van available if this truck breaks down? And what's your claims history - any cargo claims in last 2 years?",
                dispatcherPrompt: "💎 ВОПРОС 12/12: Backup truck + claims history!",
                suggestions: [
                    { text: "Yes! We have 3 backup vans in LA area - if primary truck has mechanical issue, backup can be there within 2 hours to transfer load and continue. Claims history: zero cargo claims in last 4 years. Clean record. We maintain trucks religiously to prevent breakdowns. Our reliability is 99.9% on-time delivery. You're in safe hands.", quality: "excellent", analytics: "✨ ОТЛИЧНО! Backup plan детально, zero claims, maintenance, reliability!", path: "master" },
                    { text: "Yes, have 3 backup vans in LA. Zero cargo claims in 4 years. 99.9% on-time.", quality: "good", analytics: "✔️ Хорошо! Backup, claims, reliability.", path: "master" },
                    { text: "Have backup trucks. No recent claims.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Should have backup... claims are minimal...", quality: "weak", analytics: "⚠️ Слабо! Неуверенность!", path: "weak" },
                    { text: "If truck breaks, we'll figure it out.", quality: "aggressive", analytics: "🔴 Агрессивно! Нет плана!", path: "reject_backup" },
                    { text: "No backup. Had 2 claims last year.", quality: "fail", analytics: "❌ Провал! Нет backup, есть claims!", path: "reject_backup" }
                ]
            },
            {
                brokerQuestion: "Excellent! You've answered everything perfectly. I'm impressed with your professionalism. Let's talk rate. What do you need for 1,390 miles LA-Dallas with electronics?",
                dispatcherPrompt: "💎 ТОРГ! Posted $2,800 ($2.01/mi) - просите $3,200-3,300!",
                suggestions: [
                    { text: "For 1,390 miles LA-Dallas with high-value electronics worth $850K, I'm looking at $3,300. That's $2.37/mile - fair rate for experienced driver, air-ride van, GPS tracking, secure parking, and all the professional service we discussed. We deliver value, not just transportation.", quality: "excellent", analytics: "✨ ОТЛИЧНО! $3,300 = $500 больше! С обоснованием!", path: "master" },
                    { text: "$3,200 for this load. $2.30/mile - fair for high-value electronics with all our services.", quality: "good", analytics: "✔️ Хорошо! $3,200 = $400 больше!", path: "master" },
                    { text: "$3,000 for 1,390 miles.", quality: "normal", analytics: "⚪ Нормально. $200 больше.", path: "master" },
                    { text: "$2,900 for this load?", quality: "weak", analytics: "⚠️ Слабо! Только $100 больше.", path: "weak" },
                    { text: "I need $3,600 minimum! Electronics are expensive to haul.", quality: "aggressive", analytics: "🔴 Агрессивно! $3,600 нереально!", path: "reject_rate" },
                    { text: "I'll take $2,800 posted rate.", quality: "fail", analytics: "❌ Провал! Без торга!", path: "master" }
                ]
            },
            {
                brokerQuestion: "That's high for this lane. I can do $3,000. That's $2.16/mile - already above posted.",
                dispatcherPrompt: "💎 Встречное $3,000. Просите $3,100 или примите!",
                suggestions: [
                    { text: "Can we meet at $3,100? Fair middle ground - you save $200 from my ask, I earn $300 above posted for professional service. Considering our backup vans, zero claims, and 24/7 support, it's worth the extra $100 for peace of mind with $850K cargo.", quality: "excellent", analytics: "✨ ОТЛИЧНО! Логичный компромисс с обоснованием!", path: "master" },
                    { text: "$3,000 works. Let's book it.", quality: "good", analytics: "✔️ Хорошо! Заработал $200!", path: "master" },
                    { text: "$3,000 confirmed.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Okay, $3,000 will work...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" },
                    { text: "$3,100 or I walk!", quality: "aggressive", analytics: "🔴 Агрессивно! Ультиматум!", path: "reject_ultimatum" },
                    { text: "No, I need $3,300!", quality: "fail", analytics: "❌ Провал! Отказ!", path: "reject_ultimatum" }
                ]
            },
            {
                brokerQuestion: "$3,050 final. That's $2.19/mile. You've proven you're professional - worth the extra. Deal?",
                dispatcherPrompt: "💎 ФИНАЛ! $3,050 - заработали $250 больше posted!",
                suggestions: [
                    { text: "$3,050 perfect! Deal! You won't regret working with us.", quality: "excellent", analytics: "✨ ОТЛИЧНО! Принял финальную ставку!", path: "master" },
                    { text: "$3,050 is a deal!", quality: "good", analytics: "✔️ Хорошо! Заработал $250!", path: "master" },
                    { text: "$3,050 confirmed.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Okay, $3,050...", quality: "weak", analytics: "⚠️ Слабо.", path: "weak" },
                    { text: "Can't you do $3,100?", quality: "aggressive", analytics: "🔴 Агрессивно! После final!", path: "reject_final" },
                    { text: "$3,075? Just $25 more?", quality: "fail", analytics: "❌ Провал! Торгуется!", path: "reject_final" }
                ]
            },
            {
                brokerQuestion: "Perfect! What's your email? I'll send rate confirmation now. Remember - air-ride van, GPS tracking, secure parking only, and Thursday 5 PM appointment. This retailer is our biggest client - make us look good!",
                dispatcherPrompt: "💎 Email для rate con! Подтвердите все требования!",
                suggestions: [
                    { text: "Perfect! dispatch@techfreightlogistics.com. I'll sign and return within 1 hour. Confirmed: air-ride van, GPS tracking link after pickup, secure parking only (TA/Petro/Love's), Thursday 5 PM appointment guaranteed. We'll make you and your retailer client very happy. After delivery, I'll call you personally to confirm everything went perfect. Looking forward to long partnership!", quality: "excellent", analytics: "✨ ОТЛИЧНО! Email, быстрая подпись, все требования, personal touch!", path: "master" },
                    { text: "dispatch@techfreightlogistics.com. I'll sign and return today. Air-ride, GPS tracking, secure parking, Thursday 5 PM confirmed. Will make you look good!", quality: "good", analytics: "✔️ Хорошо! Email, требования, commitment.", path: "master" },
                    { text: "dispatch@techfreightlogistics.com. Will handle everything properly.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Let me find email... will handle requirements...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" },
                    { text: "Send to any email. Driver knows what to do.", quality: "aggressive", analytics: "🔴 Агрессивно! Непрофессионально!", path: "reject_email" },
                    { text: "No email... can we do by phone?", quality: "fail", analytics: "❌ Провал! Нет email!", path: "reject_email" }
                ]
            },
            {
                brokerResponse: "Excellent! Rate confirmation sent to dispatch@techfreightlogistics.com. Sign and return ASAP. You answered every question professionally - that's rare! I'm adding you to my preferred electronics carriers list. If this goes well, I have 8-10 electronics loads weekly LA-Dallas and surrounding areas. Let's build something long-term. Good luck!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$3,050",
                    ratePerMile: "$2.19/mile",
                    relationship: "strengthened",
                    weeklyLoads: "8-10 electronics loads weekly ($24,400-30,500/week potential)",
                    feedback: `✅ ОТЛИЧНЫЕ ПЕРЕГОВОРЫ! Заработали $250 больше posted ($3,050 vs $2,800 = 8.9%).\n\n💰 ФИНАНСЫ:\n• Ставка: $3,050\n• Дизель: -$556 (220 gal × $3.90 CA→TX)\n• Чистая прибыль: $2,494 (82% от ставки)\n\n💡 УРОК: Детальные ответы на ВСЕ вопросы брокера = доверие = лучшие ставки! High-value electronics требует: air-ride, secure parking, GPS tracking, backup vans, references, emergency contacts.\n\n🎯 РЕАЛЬНОСТЬ: Профессионализм = preferred carrier status = 8-10 loads weekly ($97,600-122,000/месяц потенциал)! Один отличный звонок открывает двери к постоянным грузам!`
                }
            }
        ],

        weak: [
            {
                brokerQuestion: "You said 'we have some vans'? I need to know exactly - how many dry vans do you have and where is the one for this load right now?",
                dispatcherPrompt: "⚠️ Брокер требует точности! Ответьте уверенно!",
                suggestions: [
                    { text: "I apologize for being unclear. We have 25 dry vans. The one for this load is in Los Angeles at secure warehouse, empty and ready. Has air-ride suspension. Driver ready for 8 AM pickup.", quality: "good", analytics: "✔️ ИСПРАВИЛСЯ! Дал точную информацию!", path: "master" },
                    { text: "We have 25 vans. One is in LA, ready.", quality: "normal", analytics: "⚪ Нормально.", path: "weak" },
                    { text: "We have several vans... one should be available...", quality: "weak", analytics: "⚠️ СЛАБО! Снова неуверенность!", path: "weak" },
                    { text: "I need to check with dispatch...", quality: "fail", analytics: "❌ ПРОВАЛ! Не знает свой fleet!", path: "reject_weak_final" },
                    { text: "Why so many questions? Just give me the load!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_weak_final" },
                    { text: "I don't know exactly... maybe 20 vans?", quality: "fail", analytics: "❌ ПРОВАЛ! Не знает компанию!", path: "reject_weak_final" }
                ]
            },
            {
                brokerQuestion: "Okay. Now about the driver - does he have high-value cargo experience? And does your van have air-ride suspension?",
                dispatcherPrompt: "💎 Брокер проверяет опыт и equipment. Ответьте уверенно!",
                suggestions: [
                    { text: "Yes! Driver has 5 years high-value cargo experience, understands careful handling. Van has air-ride suspension - critical for electronics. Service report available.", quality: "good", analytics: "✔️ ХОРОШО! Показали опыт и equipment!", path: "master" },
                    { text: "Driver has high-value experience. Van has air-ride.", quality: "normal", analytics: "⚪ Нормально.", path: "weak" },
                    { text: "Driver has some experience... van should have air-ride...", quality: "weak", analytics: "⚠️ СЛАБО!", path: "weak" },
                    { text: "Driver can handle any load.", quality: "aggressive", analytics: "🔴 Агрессивно! Нет деталей!", path: "reject_weak" },
                    { text: "Not sure about air-ride...", quality: "fail", analytics: "❌ ПРОВАЛ! Не знает equipment!", path: "reject_weak" },
                    { text: "Driver is new but learns fast.", quality: "fail", analytics: "❌ ПРОВАЛ! Нет опыта!", path: "reject_weak" }
                ]
            },
            {
                brokerQuestion: "Do you have $100K cargo insurance? And what's your tracking policy for $850K cargo?",
                dispatcherPrompt: "💎 Insurance + tracking. Ответьте четко!",
                suggestions: [
                    { text: "Yes! $100K cargo insurance through Progressive. GPS tracking with updates every 6 hours. I'll send insurance cert after booking.", quality: "good", analytics: "✔️ ХОРОШО!", path: "master" },
                    { text: "$100K insurance. Have GPS tracking.", quality: "normal", analytics: "⚪ Нормально.", path: "weak" },
                    { text: "Should have insurance... tracking available...", quality: "weak", analytics: "⚠️ СЛАБО!", path: "weak" },
                    { text: "Insurance is standard. Don't worry.", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_weak" },
                    { text: "Have $50K insurance. Is that okay?", quality: "fail", analytics: "❌ ПРОВАЛ! Недостаточно!", path: "reject_insurance" },
                    { text: "No tracking system. Driver calls.", quality: "fail", analytics: "❌ ПРОВАЛ! Нет tracking!", path: "reject_weak" }
                ]
            },
            {
                brokerQuestion: "This load has appointment Thursday 5 PM in Dallas. It's a major electronics retailer - they're strict. Can you commit to Thursday 5 PM?",
                dispatcherPrompt: "💎 Appointment commitment. Дайте гарантию!",
                suggestions: [
                    { text: "Absolutely committed to Thursday 5 PM! Based on 1,390 miles, we'll depart tomorrow 8 AM, arrive Thursday morning with buffer. Zero tolerance for late delivery.", quality: "good", analytics: "✔️ ХОРОШО! Дали commitment!", path: "master" },
                    { text: "Yes, Thursday 5 PM works. We'll plan accordingly.", quality: "normal", analytics: "⚪ Нормально.", path: "weak" },
                    { text: "We'll try for Thursday 5 PM... should be okay...", quality: "weak", analytics: "⚠️ СЛАБО!", path: "weak" },
                    { text: "Traffic is unpredictable. Can't promise.", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_commitment" },
                    { text: "Driver will try his best.", quality: "fail", analytics: "❌ ПРОВАЛ! Нет гарантии!", path: "reject_commitment" },
                    { text: "Maybe Thursday, maybe Friday.", quality: "fail", analytics: "❌ ПРОВАЛ! Нет commitment!", path: "reject_commitment" }
                ]
            },
            {
                brokerQuestion: "Okay, I'll give you one chance. But rate is $2,800 - the posted rate. No premium for uncertainty. And I need you to text me every 6 hours with location. Deal?",
                dispatcherPrompt: "💎 Брокер дает шанс но без премии. Примите $2,800!",
                suggestions: [
                    { text: "Deal! $2,800 accepted. I'll text you every 6 hours with location. Thank you for the chance - we won't let you down. What's your cell number?", quality: "good", analytics: "✔️ ХОРОШО! Принял условия.", path: "weak_success" },
                    { text: "$2,800 works. Will send updates every 6 hours.", quality: "normal", analytics: "⚪ Нормально.", path: "weak_success" },
                    { text: "Okay, $2,800...", quality: "weak", analytics: "⚠️ Слабо.", path: "weak_success" },
                    { text: "Can you do $2,900 at least?", quality: "fail", analytics: "❌ ПРОВАЛ! Торгуется после слабости!", path: "reject_weak_final" },
                    { text: "Every 6 hours is too much...", quality: "aggressive", analytics: "🔴 Агрессивно! Отказ от условий!", path: "reject_weak_final" },
                    { text: "I need more than posted rate.", quality: "fail", analytics: "❌ ПРОВАЛ! Жадность!", path: "reject_weak_final" }
                ]
            },
            {
                brokerResponse: "Okay. $2,800 booked. My cell is 555-9999. Text me every 6 hours with location. Don't be late - this is your only shot with me.",
                outcome: {
                    type: "success",
                    quality: "normal",
                    rate: "$2,800",
                    ratePerMile: "$2.01/mile",
                    relationship: "neutral",
                    feedback: `✅ УСПЕХ, НО БЕЗ ПРЕМИИ. Заработали posted rate ($2,800).\n\n💰 ФИНАНСЫ:\n• Ставка: $2,800\n• Дизель: -$556 (220 gal × $3.90)\n• Чистая прибыль: $2,244\n\n⚠️ УРОК: Неуверенность стоит денег! Потеряли $250 премии из-за слабых ответов. Брокер дал шанс, но без доверия = без премиальной ставки.\n\n💡 ВЫВОД: Всегда отвечайте уверенно с первого раза! "We'll try" и "should be" = красные флаги для брокеров.`
                }
            }
        ],

        weak_success: [
            {
                brokerQuestion: "What's your email for rate confirmation?",
                dispatcherPrompt: "💎 Email для rate con.",
                suggestions: [
                    { text: "dispatch@techfreightlogistics.com. I'll sign and return within 2 hours.", quality: "good", analytics: "✔️ Хорошо!", path: "weak_success" },
                    { text: "dispatch@techfreightlogistics.com.", quality: "normal", analytics: "⚪ Нормально.", path: "weak_success" },
                    { text: "Let me find email...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak_success" },
                    { text: "Send to any email.", quality: "fail", analytics: "❌ Провал!", path: "reject_email" },
                    { text: "No email. Can we do phone?", quality: "fail", analytics: "❌ Провал!", path: "reject_email" },
                    { text: "I'll give you email later.", quality: "fail", analytics: "❌ Провал!", path: "reject_email" }
                ]
            }
        ],

        warning: [
            {
                brokerQuestion: "I understand you're busy, but electronics worth $850K require verification. I need to verify your company and van capability for insurance. This is standard for all high-value carriers. Can you provide MC number and confirm air-ride van? Critical for both of us.",
                dispatcherPrompt: "⚠️ ПРЕДУПРЕЖДЕНИЕ! Второй шанс!",
                suggestions: [
                    { text: "You're absolutely right, I apologize. MC 445566, TechFreight Logistics. 25 dry vans with air-ride, 4 years electronics experience. Van in LA, ready 8 AM. Where's pickup?", quality: "good", analytics: "✔️ ИСПРАВИЛСЯ!", path: "master" },
                    { text: "Sorry. MC 445566, TechFreight Logistics. Van in LA with air-ride.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "MC 445566... have vans...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" },
                    { text: "I don't have MC right now...", quality: "fail", analytics: "❌ ПРОВАЛ!", path: "reject_early" },
                    { text: "Just send load info!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_early" },
                    { text: "Why so difficult?", quality: "fail", analytics: "❌ ПРОВАЛ!", path: "reject_early" }
                ]
            }
        ],

        reject_early: [
            {
                brokerResponse: "I need professional carriers who understand high-value cargo requirements. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Непрофессионализм после предупреждения! Electronics loads требуют серьезного подхода с первых секунд."
                }
            }
        ],

        reject_weak: [
            {
                brokerQuestion: "I'm hearing too much uncertainty. Electronics worth $850K require professional carrier who knows their operation. Can you provide solid answers or should I move on?",
                dispatcherPrompt: "⚠️ ПОСЛЕДНИЙ ШАНС! Брокер теряет терпение!",
                suggestions: [
                    { text: "You're absolutely right, I apologize. Let me be clear: We have 25 dry vans with air-ride, driver has 5 years high-value experience, $100K insurance, GPS tracking. We're ready for this load.", quality: "good", analytics: "✔️ ИСПРАВИЛСЯ! Дал четкие ответы!", path: "master" },
                    { text: "I understand. We have proper equipment and experience for electronics.", quality: "normal", analytics: "⚪ Нормально.", path: "weak" },
                    { text: "We can handle it... probably...", quality: "weak", analytics: "⚠️ СЛАБО! Снова неуверенность!", path: "reject_weak_final" },
                    { text: "I need to check with my manager...", quality: "fail", analytics: "❌ ПРОВАЛ! Не знает свою компанию!", path: "reject_weak_final" },
                    { text: "Why so many questions? Just give me the load!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_weak_final" },
                    { text: "Find another carrier then.", quality: "fail", analytics: "❌ ПРОВАЛ! Сдался!", path: "reject_weak_final" }
                ]
            },
            {
                brokerResponse: "Sorry, I can't risk $850K cargo with uncertainty. I need a reliable carrier. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ! Продолжали показывать неуверенность. High-value electronics требуют ГАРАНТИЙ, не 'попыток'. Брокеры не рискуют с ненадежными перевозчиками."
                }
            }
        ],

        reject_weak_final: [
            {
                brokerResponse: "Sorry, I can't risk $850K cargo with uncertainty. I need a reliable carrier. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ! Продолжали показывать неуверенность. High-value electronics требуют ГАРАНТИЙ."
                }
            }
        ],

        reject_attitude: [
            {
                brokerResponse: "I need professional carrier for $850K electronics. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Electronics требует профессионализма! Грубость = потеря груза."
                }
            }
        ],

        reject_timing: [
            {
                brokerResponse: "8 AM pickup is critical for electronics schedule. I need carrier who can meet timing. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Не можете вовремя = нет груза."
                }
            }
        ],

        reject_experience: [
            {
                brokerResponse: "I need carrier with high-value cargo experience for $850K electronics. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет опыта с high-value = нет electronics груза!"
                }
            }
        ],

        reject_insurance: [
            {
                brokerResponse: "$100K cargo coverage required for $850K electronics. I need carrier with proper insurance. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Недостаточная страховка для electronics! $100K обязательна."
                }
            }
        ],

        reject_communication: [
            {
                brokerResponse: "GPS tracking required for $850K electronics. I need carrier with proper tracking. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет GPS tracking = нет electronics груза! Tracking обязателен для high-value."
                }
            }
        ],

        reject_commitment: [
            {
                brokerResponse: "I need carrier who can commit to appointment for electronics retailer. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет commitment = нет electronics груза! Retailers требуют точных appointments."
                }
            }
        ],

        reject_equipment: [
            {
                brokerResponse: "Load locks and straps required for electronics safety. I need carrier with proper equipment. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет load locks/straps = нет electronics груза! Proper equipment обязателен."
                }
            }
        ],

        reject_security: [
            {
                brokerResponse: "Secure parking required for $850K electronics. I need carrier who understands security. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет понимания security = нет high-value груза! Rest areas опасны для electronics."
                }
            }
        ],

        reject_references: [
            {
                brokerResponse: "I need carrier with verifiable references for electronics loads. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет references = нет доверия! Брокеры проверяют новых carriers для electronics."
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
                    feedback: "❌ ОТКАЗ: Скрытые fees или нет emergency contacts = красные флаги!"
                }
            }
        ],

        reject_backup: [
            {
                brokerResponse: "Backup plan and clean claims history required for electronics. I need reliable carrier. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет backup truck или есть claims = риск для electronics груза!"
                }
            }
        ],

        reject_rate: [
            {
                brokerResponse: "$3,600 is way too high for this lane. I need realistic carrier. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: $3,600 нереально! Posted $2,800, можно просить $3,200-3,300, но не $3,600!"
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

allScenarios.push(scenario17);
console.log('✅ Scenario 17 loaded: Dry Van Electronics (Los Angeles → Dallas)');
