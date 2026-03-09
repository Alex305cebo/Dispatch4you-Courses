// DIALOGUE #21 - Dry Van Electronics (FIXED VERSION - NO DEADLOCKS!)
// Los Angeles CA → Dallas TX, 1,390 miles
// Posted: $2,800 ($2.01/mile), Target: $3,100-3,300
// Created: March 8, 2026
// FIXED: All weak/aggressive/fail answers lead DIRECTLY to reject_*_final paths!
// NO INTERMEDIATE PATHS - NO DEADLOCKS!

console.log('🔵 Loading scenarios-data-v21.js...');

const scenario21 = {
    id: 21,
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
                    { text: "MC 445566... we have some vans...", quality: "weak", analytics: "⚠️ Слабо! Неуверенность!", path: "reject_weak_final" },
                    { text: "Why need all details? Just tell me the rate!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_attitude_final" },
                    { text: "Dry van available. What's the load?", quality: "fail", analytics: "❌ Провал! Нет MC!", path: "reject_attitude_final" }
                ]
            },
            {
                brokerQuestion: "Good! 1,390 miles LA to Dallas. Electronics - laptops and tablets, 38,000 lbs. Cargo value $850,000. Where is your dry van right now and does it have air-ride suspension?",
                dispatcherPrompt: "💎 ВОПРОС 2/12: Местоположение van + air-ride!",
                suggestions: [
                    { text: "Perfect! Van is in Los Angeles at secure warehouse in Vernon area, empty since yesterday. Yes, equipped with air-ride suspension - critical for electronics. Driver can be at pickup 8 AM sharp. What's the exact pickup address and any special loading requirements?", quality: "excellent", analytics: "✨ ОТЛИЧНО! Точное местоположение, air-ride, готовность, вопрос!", path: "master" },
                    { text: "Van in LA at warehouse, empty. Has air-ride suspension. Driver ready 8 AM. What's pickup address?", quality: "good", analytics: "✔️ Хорошо! Местоположение, air-ride, готовность.", path: "master" },
                    { text: "Van in LA. Has air-ride.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Should be in LA... has suspension...", quality: "weak", analytics: "⚠️ Слабо! Неуверенность!", path: "reject_weak_final" },
                    { text: "Just tell me the rate first!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_attitude_final" },
                    { text: "Driver can't be there until 10 AM... 8 AM too early.", quality: "fail", analytics: "❌ Провал! Не может вовремя!", path: "reject_timing_final" }
                ]
            },
            {
                brokerQuestion: "Excellent! Now, electronics worth $850K require experienced drivers. What's your driver's experience with high-value cargo? And does your driver have a clean DOT inspection record?",
                dispatcherPrompt: "💎 ВОПРОС 3/12: Опыт водителя с high-value + DOT record!",
                suggestions: [
                    { text: "Our driver has 5 years experience specifically with high-value electronics - laptops, tablets, smartphones. He understands careful handling, no sudden stops, secure parking only. Clean DOT inspection record - last inspection 1 month ago, zero violations. Safety rating Satisfactory. He treats high-value cargo like gold.", quality: "excellent", analytics: "✨ ОТЛИЧНО! 5 лет electronics опыт, понимание handling, DOT clean, safety rating!", path: "master" },
                    { text: "Driver has 5 years high-value cargo experience. Clean DOT record, last inspection 1 month ago.", quality: "good", analytics: "✔️ Хорошо! Опыт, DOT clean.", path: "master" },
                    { text: "Driver experienced with electronics. DOT record clean.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Driver has some electronics experience... DOT should be okay...", quality: "weak", analytics: "⚠️ Слабо! Неуверенность!", path: "reject_weak_final" },
                    { text: "Driver knows how to drive. That's enough!", quality: "aggressive", analytics: "🔴 Агрессивно! Пренебрежение!", path: "reject_attitude_final" },
                    { text: "Driver has regular license. Is that okay?", quality: "fail", analytics: "❌ Провал! Нет опыта!", path: "reject_experience_final" }
                ]
            },
            {
                brokerQuestion: "Good! Insurance question: Do you have $100K cargo coverage? And what's your liability coverage? I need current certificates for $850K cargo.",
                dispatcherPrompt: "💎 ВОПРОС 4/12: Insurance $100K cargo + liability!",
                suggestions: [
                    { text: "Yes! $100K cargo insurance through Progressive Commercial. $1M liability coverage. Both certificates current, expire December 2027. I'll email both certificates immediately after booking. Insurance agent is available if you need verification. For $850K cargo, we can add rider if needed. What's your email?", quality: "excellent", analytics: "✨ ОТЛИЧНО! $100K cargo, $1M liability, даты, готовность, rider option!", path: "master" },
                    { text: "Yes, $100K cargo, $1M liability through Progressive. Current certificates. I'll send after booking.", quality: "good", analytics: "✔️ Хорошо! Coverage детали, готовность.", path: "master" },
                    { text: "$100K cargo, $1M liability. Certificates current.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Should have $100K... liability is good...", quality: "weak", analytics: "⚠️ Слабо! Неуверенность!", path: "reject_weak_final" },
                    { text: "Insurance is fine! Let's talk rate.", quality: "aggressive", analytics: "🔴 Агрессивно! Отказ обсуждать!", path: "reject_insurance_final" },
                    { text: "We have $50K coverage... is that enough?", quality: "fail", analytics: "❌ Провал! Недостаточная страховка!", path: "reject_insurance_final" }
                ]
            },
            {
                brokerQuestion: "Perfect! Now communication: What's your tracking and communication policy? How often will you update me during transit? And if there's a delay, when will you notify me?",
                dispatcherPrompt: "💎 ВОПРОС 5/12: Tracking policy + communication + delay notification!",
                suggestions: [
                    { text: "Excellent question! We provide GPS tracking link immediately after pickup. Updates every 4 hours via text/email with location. If any delay occurs, we notify you minimum 8 hours before appointment - never surprises. Driver available 24/7 by phone. After delivery, we send POD within 1 hour. For $850K cargo, we provide extra attention.", quality: "excellent", analytics: "✨ ОТЛИЧНО! GPS, updates 4 часа, delay 8 часов, 24/7, POD, extra attention!", path: "master" },
                    { text: "GPS tracking after pickup. Updates every 4 hours. Delay notification 8 hours before appointment. Driver available 24/7.", quality: "good", analytics: "✔️ Хорошо! Tracking, updates, notification.", path: "master" },
                    { text: "GPS tracking. Regular updates. Will notify about delays.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "We'll send updates... will call if problems...", quality: "weak", analytics: "⚠️ Слабо! Расплывчато!", path: "reject_weak_final" },
                    { text: "Driver will call when he gets there.", quality: "aggressive", analytics: "🔴 Агрессивно! Минимум коммуникации!", path: "reject_communication_final" },
                    { text: "No tracking system. Driver has phone.", quality: "fail", analytics: "❌ Провал! Нет tracking!", path: "reject_communication_final" }
                ]
            },
            {
                brokerQuestion: "Excellent communication policy! Delivery question: This load has appointment Thursday 5 PM in Dallas. It's a major electronics retailer - they're strict. Can you commit to Thursday 5 PM? What's your plan if there's traffic or weather delay?",
                dispatcherPrompt: "💎 ВОПРОС 6/12: Appointment commitment + backup plan!",
                suggestions: [
                    { text: "Absolutely committed to Thursday 5 PM! Based on 1,390 miles and driver's HOS, we'll depart LA tomorrow 8 AM, arrive Dallas Thursday morning with 9-hour buffer. If traffic or weather delay, driver has backup route via I-40. We monitor weather constantly. If major delay expected, I'll call you 12 hours ahead to coordinate with retailer. Zero tolerance for late delivery.", quality: "excellent", analytics: "✨ ОТЛИЧНО! Commitment, расчет с buffer, backup route, weather, early notification!", path: "master" },
                    { text: "Yes, committed to Thursday 5 PM. We'll arrive Thursday morning with buffer. Have backup route if delays. Will notify early if problems.", quality: "good", analytics: "✔️ Хорошо! Commitment, buffer, backup.", path: "master" },
                    { text: "Yes, Thursday 5 PM works. We'll plan accordingly.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "We'll try for Thursday 5 PM... should be okay...", quality: "weak", analytics: "⚠️ Слабо! 'Try' не внушает уверенности!", path: "reject_weak_final" },
                    { text: "Traffic is unpredictable. Can't guarantee.", quality: "aggressive", analytics: "🔴 Агрессивно! Отказ commitment!", path: "reject_commitment_final" },
                    { text: "Driver will get there when he gets there.", quality: "fail", analytics: "❌ Провал! Нет commitment!", path: "reject_commitment_final" }
                ]
            },
            {
                brokerQuestion: "Great planning! Loading procedure: Pickup is at warehouse, loading takes 1.5 hours. Do you have load locks and straps? And will your driver inspect the load before leaving to ensure proper securing?",
                dispatcherPrompt: "💎 ВОПРОС 7/12: Load locks/straps + inspection procedure!",
                suggestions: [
                    { text: "Yes! Van equipped with 10 load locks and 15 heavy-duty straps. Driver will inspect entire load before departure - check securing, weight distribution, and verify all pallets stable. He'll take photos of loaded cargo for documentation. If any securing issues, he'll request reload before leaving. We never leave with improperly secured electronics.", quality: "excellent", analytics: "✨ ОТЛИЧНО! Equipment детали, inspection procedure, photos, quality control!", path: "master" },
                    { text: "Yes, have 10 load locks and 15 straps. Driver will inspect load and take photos before leaving.", quality: "good", analytics: "✔️ Хорошо! Equipment, inspection.", path: "master" },
                    { text: "Yes, have load locks and straps. Driver will inspect.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Should have equipment... driver will check...", quality: "weak", analytics: "⚠️ Слабо! Неуверенность!", path: "reject_weak_final" },
                    { text: "Driver knows what to do.", quality: "aggressive", analytics: "🔴 Агрессивно! Нет деталей!", path: "reject_equipment_final" },
                    { text: "Don't have load locks. Can we use rope?", quality: "fail", analytics: "❌ Провал! Нет equipment!", path: "reject_equipment_final" }
                ]
            },
            {
                brokerQuestion: "Perfect! Security: Does your driver understand secure parking requirements for high-value cargo? Where will he park overnight?",
                dispatcherPrompt: "💎 ВОПРОС 8/12: Secure parking для high-value cargo!",
                suggestions: [
                    { text: "Absolutely! Driver understands high-value cargo security. He'll park only at secure truck stops with 24/7 security cameras and lighting - TA, Petro, Love's. Never at rest areas or unsecured locations. He'll park in well-lit areas close to building. Van has additional padlock on doors. For $850K cargo, security is priority #1.", quality: "excellent", analytics: "✨ ОТЛИЧНО! Понимание security, конкретные места, дополнительная защита!", path: "master" },
                    { text: "Yes, driver parks only at secure truck stops with cameras - TA, Petro, Love's. Never rest areas. Van has padlock.", quality: "good", analytics: "✔️ Хорошо! Security awareness, конкретные места.", path: "master" },
                    { text: "Driver parks at secure truck stops.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Driver will find safe parking...", quality: "weak", analytics: "⚠️ Слабо! Расплывчато!", path: "reject_weak_final" },
                    { text: "Driver parks wherever there's space.", quality: "aggressive", analytics: "🔴 Агрессивно! Нет понимания security!", path: "reject_security_final" },
                    { text: "Rest areas are fine for parking.", quality: "fail", analytics: "❌ Провал! Опасно для high-value!", path: "reject_security_final" }
                ]
            },
            {
                brokerQuestion: "Excellent! References: Can you provide 2-3 broker references who can confirm your reliability with high-value electronics loads? I like to verify new carriers.",
                dispatcherPrompt: "💎 ВОПРОС 9/12: Broker references для electronics!",
                suggestions: [
                    { text: "Absolutely! I can provide 3 broker references right now: 1) Steve Martinez at TechLoad (worked 2 years, 60+ electronics loads), 2) Rachel Kim at ElectroFreight (1.5 years, 40+ loads), 3) James Brown at HighValue Logistics (8 months, 20+ loads). All can confirm our reliability, on-time delivery, and zero cargo claims. I'll email their contact info with permission. Would you like to call them before booking?", quality: "excellent", analytics: "✨ ОТЛИЧНО! 3 references с именами, компаниями, длительностью, количеством loads!", path: "master" },
                    { text: "Yes! Can provide 3 broker references - Steve at TechLoad, Rachel at ElectroFreight, James at HighValue. All can confirm our electronics reliability. I'll send contacts.", quality: "good", analytics: "✔️ Хорошо! 3 references с именами.", path: "master" },
                    { text: "Yes, can provide broker references.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "I think I can find some references...", quality: "weak", analytics: "⚠️ Слабо! Неуверенность!", path: "reject_weak_final" },
                    { text: "Why need references? We're good!", quality: "aggressive", analytics: "🔴 Агрессивно! Оборонительно!", path: "reject_references_final" },
                    { text: "We're new. No references yet.", quality: "fail", analytics: "❌ Провал! Нет references!", path: "reject_references_final" }
                ]
            },
            {
                brokerQuestion: "Great! Detention policy: If loading or unloading takes longer than 2 hours, what's your detention rate? And payment terms: do you accept QuickPay or standard 30 days?",
                dispatcherPrompt: "💎 ВОПРОС 10/12: Detention rate + payment terms!",
                suggestions: [
                    { text: "Detention after 2 hours free time is $50/hour - industry standard. We're flexible on payment: QuickPay available at 3% fee (paid in 24 hours), or standard NET 30 days at full rate. Your choice. For long-term partnership, we can discuss better terms. What works for you?", quality: "excellent", analytics: "✨ ОТЛИЧНО! Detention rate, free time, payment options, flexibility!", path: "master" },
                    { text: "Detention $50/hour after 2 hours. QuickPay 3% or NET 30. Your choice.", quality: "good", analytics: "✔️ Хорошо! Detention, payment options.", path: "master" },
                    { text: "Detention $50/hour. NET 30 payment.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Standard detention... payment terms flexible...", quality: "weak", analytics: "⚠️ Слабо! Расплывчато!", path: "reject_weak_final" },
                    { text: "Detention $100/hour. QuickPay only.", quality: "aggressive", analytics: "🔴 Агрессивно! Завышено!", path: "reject_terms_final" },
                    { text: "Need payment upfront before pickup.", quality: "fail", analytics: "❌ Провал! Нереальные условия!", path: "reject_terms_final" }
                ]
            },
            {
                brokerQuestion: "Good! Fuel surcharge: Do you charge fuel surcharge on top of rate, or is it included? And what's your emergency contact number if I can't reach driver during transit?",
                dispatcherPrompt: "💎 ВОПРОС 11/12: Fuel surcharge + emergency contact!",
                suggestions: [
                    { text: "Fuel surcharge is included in our rate - no hidden fees, all-in pricing. For emergency contact: my direct cell is 555-0123, available 24/7. Also our dispatch manager Sarah at 555-0124. Driver's cell is 555-0125. You'll have all three numbers. If driver doesn't answer within 15 minutes, call me directly - I'll locate him immediately.", quality: "excellent", analytics: "✨ ОТЛИЧНО! FSC included, 3 contacts с номерами, 24/7, response time!", path: "master" },
                    { text: "FSC included in rate. Emergency contact: my cell 555-0123, dispatch 555-0124, driver 555-0125. All 24/7.", quality: "good", analytics: "✔️ Хорошо! FSC, contacts.", path: "master" },
                    { text: "FSC included. Have emergency contacts available.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "FSC should be included... can give contacts...", quality: "weak", analytics: "⚠️ Слабо! Неуверенность!", path: "reject_weak_final" },
                    { text: "FSC is extra 15%. Take it or leave it.", quality: "aggressive", analytics: "🔴 Агрессивно! Скрытые fees!", path: "reject_fsc_final" },
                    { text: "Don't have emergency contacts. Driver has phone.", quality: "fail", analytics: "❌ Провал! Нет backup!", path: "reject_fsc_final" }
                ]
            },
            {
                brokerQuestion: "Perfect! Last questions: Do you have a backup van available if this truck breaks down? And what's your claims history - any cargo claims in last 2 years?",
                dispatcherPrompt: "💎 ВОПРОС 12/12: Backup truck + claims history!",
                suggestions: [
                    { text: "Yes! We have 3 backup vans in LA area - if primary truck has mechanical issue, backup can be there within 2 hours to transfer load and continue. Claims history: zero cargo claims in last 4 years. Clean record. We maintain trucks religiously to prevent breakdowns. Our reliability is 99.9% on-time delivery. You're in safe hands.", quality: "excellent", analytics: "✨ ОТЛИЧНО! Backup plan детально, zero claims, maintenance, reliability!", path: "master" },
                    { text: "Yes, have 3 backup vans in LA. Zero cargo claims in 4 years. 99.9% on-time.", quality: "good", analytics: "✔️ Хорошо! Backup, claims, reliability.", path: "master" },
                    { text: "Have backup trucks. No recent claims.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Should have backup... claims are minimal...", quality: "weak", analytics: "⚠️ Слабо! Неуверенность!", path: "reject_weak_final" },
                    { text: "If truck breaks, we'll figure it out.", quality: "aggressive", analytics: "🔴 Агрессивно! Нет плана!", path: "reject_backup_final" },
                    { text: "No backup. Had 2 claims last year.", quality: "fail", analytics: "❌ Провал! Нет backup, есть claims!", path: "reject_backup_final" }
                ]
            },
            {
                brokerQuestion: "Excellent! You've answered everything perfectly. I'm impressed with your professionalism. Let's talk rate. What do you need for 1,390 miles LA-Dallas with electronics?",
                dispatcherPrompt: "💎 ТОРГ! Posted $2,800 ($2.01/mi) - просите $3,200-3,300!",
                suggestions: [
                    { text: "For 1,390 miles LA-Dallas with high-value electronics worth $850K, I'm looking at $3,300. That's $2.37/mile - fair rate for experienced driver, air-ride van, GPS tracking, secure parking, and all the professional service we discussed. We deliver value, not just transportation.", quality: "excellent", analytics: "✨ ОТЛИЧНО! $3,300 = $500 больше! С обоснованием!", path: "master" },
                    { text: "$3,200 for this load. $2.30/mile - fair for high-value electronics with all our services.", quality: "good", analytics: "✔️ Хорошо! $3,200 = $400 больше!", path: "master" },
                    { text: "$3,000 for 1,390 miles.", quality: "normal", analytics: "⚪ Нормально. $200 больше.", path: "master" },
                    { text: "$2,900 for this load?", quality: "weak", analytics: "⚠️ Слабо! Только $100 больше.", path: "reject_weak_final" },
                    { text: "I need $3,600 minimum! Electronics are expensive to haul.", quality: "aggressive", analytics: "🔴 Агрессивно! $3,600 нереально!", path: "reject_rate_final" },
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
                    { text: "Okay, $3,000 will work...", quality: "weak", analytics: "⚠️ Слабо!", path: "reject_weak_final" },
                    { text: "$3,100 or I walk!", quality: "aggressive", analytics: "🔴 Агрессивно! Ультиматум!", path: "reject_ultimatum_final" },
                    { text: "No, I need $3,300!", quality: "fail", analytics: "❌ Провал! Отказ!", path: "reject_ultimatum_final" }
                ]
            },
            {
                brokerQuestion: "$3,050 final. That's $2.19/mile. You've proven you're professional - worth the extra. Deal?",
                dispatcherPrompt: "💎 ФИНАЛ! $3,050 - заработали $250 больше posted!",
                suggestions: [
                    { text: "$3,050 perfect! Deal! You won't regret working with us.", quality: "excellent", analytics: "✨ ОТЛИЧНО! Принял финальную ставку!", path: "master" },
                    { text: "$3,050 is a deal!", quality: "good", analytics: "✔️ Хорошо! Заработал $250!", path: "master" },
                    { text: "$3,050 confirmed.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Okay, $3,050...", quality: "weak", analytics: "⚠️ Слабо.", path: "reject_weak_final" },
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
                    { text: "Let me find email... will handle requirements...", quality: "weak", analytics: "⚠️ Слабо!", path: "reject_weak_final" },
                    { text: "Send to any email. Driver knows what to do.", quality: "aggressive", analytics: "🔴 Агрессивно! Непрофессионально!", path: "reject_email_final" },
                    { text: "No email... can we do by phone?", quality: "fail", analytics: "❌ Провал! Нет email!", path: "reject_email_final" }
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

        
        
        
        reject_early_final: [
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

        reject_weak_final: [
            {
                brokerQuestion: "I'm hearing too much uncertainty. Electronics worth $850K require professional carrier who knows their operation. Can you provide solid answers or should I move on?",
                dispatcherPrompt: "⚠️ ПОСЛЕДНИЙ ШАНС! Брокер теряет терпение!",
                suggestions: [
                    { text: "You're absolutely right, I apologize. Let me be clear: We have 25 dry vans with air-ride, driver has 5 years high-value experience, $100K insurance, GPS tracking. We're ready for this load.", quality: "good", analytics: "✔️ ИСПРАВИЛСЯ! Дал четкие ответы!", path: "master" },
                    { text: "I understand. We have proper equipment and experience for electronics.", quality: "normal", analytics: "⚪ Нормально.", path: "reject_weak_final" },
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

        reject_attitude_final: [
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

        reject_timing_final: [
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

        reject_experience_final: [
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

        reject_insurance_final: [
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

        reject_communication_final: [
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

        reject_commitment_final: [
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

        reject_equipment_final: [
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

        reject_security_final: [
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

        reject_references_final: [
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
                    feedback: "❌ ОТКАЗ: Скрытые fees или нет emergency contacts = красные флаги!"
                }
            }
        ],

        reject_backup_final: [
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

        reject_rate_final: [
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

allScenarios.push(scenario21);
console.log('✅ Scenario 21 loaded: Dry Van Electronics (Los Angeles → Dallas)');
