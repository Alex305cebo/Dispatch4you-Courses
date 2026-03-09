// DIALOGUE #18 - Reefer Produce (ПРОВЕРЕНО - БЕЗ ТУПИКОВ!)
// Phoenix AZ → Seattle WA, 1,420 miles  
// Posted: $3,200 ($2.25/mile), Target: $3,500-3,700
// Created: March 8, 2026
// ПРАВИЛО: КАЖДЫЙ путь имеет либо вопрос с 6 ответами, либо outcome!

console.log('🔵 Loading scenarios-data-v18.js...');

const scenario18 = {
    id: 18,
    route: "Phoenix AZ → Seattle WA",
    distance: 1420,
    equipment: "Reefer (53ft)",
    cargo: "Fresh produce (lettuce, tomatoes)",
    weight: "40,000 lbs",
    postedRate: "$3,200 ($2.25/mile)",
    deadline: "Pickup tomorrow 5 AM, Delivery in 2 days",
    brokerStyle: "Professional produce broker - time-sensitive",
    difficulty: "hard",
    initialMessage: "Good morning! This is Carlos from FreshHaul Logistics.\nI'm calling about your posted reefer load Phoenix to Seattle with fresh produce.\nIs this load still available?",

    paths: {
        master: [
            {
                brokerQuestion: "Good morning! This is Maria from ProduceDirect Brokers.\nYes, still available.\nWhat's your MC number, company name, and how many reefer trucks do you operate?",
                dispatcherPrompt: "💎 Брокер спрашивает MC number, название компании и размер fleet!",
                suggestions: [
                    { text: "Good morning Maria! MC 445566, FreshHaul Logistics. We operate 20 reefer trucks, all 53ft with multi-temp capability. Specialized in fresh produce for 5 years. What's the temperature requirement?", quality: "excellent", analytics: "✨ Дал MC, компанию, fleet 20 trucks, специализацию 5 лет, задал встречный вопрос!", path: "master" },
                    { text: "Morning! MC 445566, FreshHaul Logistics. 20 reefer trucks. What's temp?", quality: "good", analytics: "✔️ Дал MC, компанию, fleet, задал вопрос.", path: "master" },
                    { text: "MC 445566, FreshHaul Logistics. Have reefers.", quality: "normal", analytics: "⚪ Дал MC и компанию, но без деталей.", path: "master" },
                    { text: "MC 445566... some reefers...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" },
                    { text: "Why all details? Tell me rate!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning" },
                    { text: "Reefer available.", quality: "fail", analytics: "❌ Провал!", path: "warning" }
                ]
            },
            {
                brokerQuestion: "Good! 1,420 miles Phoenix to Seattle. Fresh produce - lettuce and tomatoes, 40,000 lbs. Temperature must stay 34-36°F. Where is your reefer now and when was last service?",
                dispatcherPrompt: "💎 ВОПРОС 2/12: Местоположение + service!",
                suggestions: [
                    { text: "Perfect! Reefer in Phoenix at produce terminal, empty. Unit serviced last week - full maintenance. Service report available. Driver ready 5 AM. What's pickup address?", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Reefer in Phoenix at terminal, empty. Serviced last week. Driver ready 5 AM.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Reefer in Phoenix. Serviced recently.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Should be in Phoenix... serviced...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" },
                    { text: "Just tell rate first!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_attitude_final" },
                    { text: "Driver can't be there until 7 AM.", quality: "fail", analytics: "❌ Провал!", path: "reject_timing_final" }
                ]
            },
            {
                brokerQuestion: "Excellent! Produce is very time-sensitive. Driver's experience with fresh produce? How many years? Clean DOT record?",
                dispatcherPrompt: "💎 ВОПРОС 3/12: Опыт с produce + DOT!",
                suggestions: [
                    { text: "Driver has 6 years fresh produce experience - lettuce, tomatoes, berries. Understands critical temp control and speed. Clean DOT - last inspection 1 month ago, zero violations. Safety rating Satisfactory.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Driver has 6 years produce experience. Clean DOT, last inspection 1 month ago.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Driver experienced with produce. DOT clean.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Driver has some produce experience...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" },
                    { text: "Driver knows how to drive!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_attitude_final" },
                    { text: "Driver has regular license.", quality: "fail", analytics: "❌ Провал!", path: "reject_experience_final" }
                ]
            },
            {
                brokerQuestion: "Good! Insurance: $100K cargo coverage for perishable? Liability coverage? Need current certificates.",
                dispatcherPrompt: "💎 ВОПРОС 4/12: Insurance $100K perishable!",
                suggestions: [
                    { text: "Yes! $100K cargo with perishable coverage through Progressive. $1M liability. Certificates current, expire January 2028. I'll email after booking. Agent available for verification.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Yes, $100K perishable, $1M liability. Current certificates. Will send after booking.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "$100K cargo, $1M liability. Current.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Should have $100K...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" },
                    { text: "Insurance fine! Let's talk rate.", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_insurance_final" },
                    { text: "$50K coverage enough?", quality: "fail", analytics: "❌ Провал!", path: "reject_insurance_final" }
                ]
            },
            {
                brokerQuestion: "Perfect! Communication: Tracking policy? Update frequency? Delay notification timing?",
                dispatcherPrompt: "💎 ВОПРОС 5/12: Tracking + communication!",
                suggestions: [
                    { text: "GPS tracking link after pickup. Updates every 3 hours with location and temp. Delay notification minimum 8 hours before appointment. Driver 24/7. POD within 1 hour. Complete transparency for produce.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "GPS tracking. Updates every 3 hours with temp. Delay notification 8 hours ahead. Driver 24/7.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "GPS tracking. Regular updates. Will notify delays.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "We'll send updates...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" },
                    { text: "Driver will call when arrives.", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_communication_final" },
                    { text: "No tracking. Driver has phone.", quality: "fail", analytics: "❌ Провал!", path: "reject_communication_final" }
                ]
            },
            {
                brokerQuestion: "Excellent! Delivery: Appointment Saturday 8 AM Seattle. Major grocery chain - strict timing. Can you commit? Backup plan for delays?",
                dispatcherPrompt: "💎 ВОПРОС 6/12: Appointment commitment!",
                suggestions: [
                    { text: "Absolutely committed to Saturday 8 AM! Based on 1,420 miles, depart tomorrow 5 AM, arrive Friday evening with 11-hour buffer. Backup route via I-5. Monitor weather constantly. Will call 12 hours ahead if major delay. Zero tolerance for late produce delivery.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Yes, committed Saturday 8 AM. Arrive Friday evening with buffer. Have backup route. Will notify early if problems.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Yes, Saturday 8 AM works. Will plan accordingly.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "We'll try for Saturday 8 AM...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" },
                    { text: "Traffic unpredictable. Can't guarantee.", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_commitment_final" },
                    { text: "Driver gets there when he gets there.", quality: "fail", analytics: "❌ Провал!", path: "reject_commitment_final" }
                ]
            },
            {
                brokerQuestion: "Great! Loading: Pickup at produce terminal, loading 2 hours. Load locks and straps? Driver inspect before leaving?",
                dispatcherPrompt: "💎 ВОПРОС 7/12: Equipment + inspection!",
                suggestions: [
                    { text: "Yes! Reefer has 8 load locks and 12 straps. Driver inspects entire load - check stacking, weight distribution, secure pallets. Takes photos for documentation. If stacking issues, requests reload. Never leave with improperly loaded produce.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Yes, 8 load locks and 12 straps. Driver inspects and takes photos before leaving.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Yes, have load locks and straps. Driver inspects.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Should have equipment...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" },
                    { text: "Driver knows what to do.", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_equipment_final" },
                    { text: "Don't have load locks. Use rope?", quality: "fail", analytics: "❌ Провал!", path: "reject_equipment_final" }
                ]
            },
            {
                brokerQuestion: "Perfect! Temperature monitoring: Continuous monitoring with data logger? Can provide temp records after delivery?",
                dispatcherPrompt: "💎 ВОПРОС 8/12: Temp monitoring system!",
                suggestions: [
                    { text: "Absolutely! Reefer has Thermo King with continuous monitoring and data logger. Records temp every 10 minutes. After delivery, I'll email complete temp log showing 34-36°F maintained. Data logger standard for all produce loads. Grocery chain gets proof.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Yes, continuous monitoring with data logger. Records every 10 minutes. Will send temp log after delivery.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Yes, has temp monitoring and data logger.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Should have monitoring...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" },
                    { text: "Driver checks temp manually.", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_monitoring_final" },
                    { text: "No data logger. Driver has thermometer.", quality: "fail", analytics: "❌ Провал!", path: "reject_monitoring_final" }
                ]
            },
            {
                brokerQuestion: "Excellent! References: 2-3 broker references for produce loads? I verify new carriers.",
                dispatcherPrompt: "💎 ВОПРОС 9/12: Broker references!",
                suggestions: [
                    { text: "Absolutely! 3 references: 1) John Davis at FreshFreight (2 years, 70+ produce loads), 2) Amy Chen at ProduceExpress (1.5 years, 50+ loads), 3) Mike Wilson at GreenHaul (8 months, 25+ loads). All confirm reliability, on-time, proper temp. I'll email contacts with permission.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Yes! 3 references - John at FreshFreight, Amy at ProduceExpress, Mike at GreenHaul. All confirm produce reliability. Will send contacts.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Yes, can provide broker references.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "I think can find references...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" },
                    { text: "Why need references? We're good!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_references_final" },
                    { text: "We're new. No references.", quality: "fail", analytics: "❌ Провал!", path: "reject_references_final" }
                ]
            },
            {
                brokerQuestion: "Great! Detention: Rate after 2 hours? Payment terms: QuickPay or NET 30?",
                dispatcherPrompt: "💎 ВОПРОС 10/12: Detention + payment!",
                suggestions: [
                    { text: "Detention after 2 hours free time is $50/hour - standard. Flexible payment: QuickPay 3% (24 hours), or NET 30 full rate. Your choice. For long-term partnership, can discuss better terms.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Detention $50/hour after 2 hours. QuickPay 3% or NET 30. Your choice.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Detention $50/hour. NET 30 payment.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Standard detention... flexible payment...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" },
                    { text: "Detention $100/hour. QuickPay only.", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_terms_final" },
                    { text: "Need payment upfront before pickup.", quality: "fail", analytics: "❌ Провал!", path: "reject_terms_final" }
                ]
            },
            {
                brokerQuestion: "Good! Fuel surcharge: Included or extra? Emergency contact if can't reach driver?",
                dispatcherPrompt: "💎 ВОПРОС 11/12: FSC + emergency contact!",
                suggestions: [
                    { text: "FSC included - no hidden fees, all-in pricing. Emergency: my cell 555-0123 24/7, dispatch manager 555-0124, driver 555-0125. All three numbers. If driver doesn't answer in 15 minutes, call me - I'll locate immediately.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "FSC included. Emergency: my cell 555-0123, dispatch 555-0124, driver 555-0125. All 24/7.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "FSC included. Have emergency contacts.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "FSC should be included...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" },
                    { text: "FSC extra 15%. Take or leave.", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_fsc_final" },
                    { text: "No emergency contacts. Driver has phone.", quality: "fail", analytics: "❌ Провал!", path: "reject_fsc_final" }
                ]
            },
            {
                brokerQuestion: "Perfect! Last: Backup reefer if truck breaks? Claims history last 2 years?",
                dispatcherPrompt: "💎 ВОПРОС 12/12: Backup + claims!",
                suggestions: [
                    { text: "Yes! 2 backup reefers in Phoenix - if primary breaks, backup there in 2 hours to transfer and continue. Claims: zero cargo claims in 5 years. Clean record. Maintain trucks religiously. 99.9% on-time. You're in safe hands.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Yes, 2 backup reefers in Phoenix. Zero claims in 5 years. 99.9% on-time.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Have backup trucks. No recent claims.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Should have backup...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" },
                    { text: "If breaks, we'll figure it out.", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_backup_final" },
                    { text: "No backup. Had 2 claims last year.", quality: "fail", analytics: "❌ Провал!", path: "reject_backup_final" }
                ]
            },
            {
                brokerQuestion: "Excellent! Perfect answers. I'm impressed. Let's talk rate. What do you need for 1,420 miles Phoenix-Seattle with produce?",
                dispatcherPrompt: "💎 ТОРГ! Posted $3,200 ($2.25/mi) - просите $3,600-3,700!",
                suggestions: [
                    { text: "For 1,420 miles Phoenix-Seattle with time-sensitive fresh produce, I'm looking at $3,700. That's $2.61/mile - fair for reefer, experienced produce driver, continuous temp monitoring, and all professional service we discussed.", quality: "excellent", analytics: "✨ ОТЛИЧНО! $3,700 = $500 больше!", path: "master" },
                    { text: "$3,600 for this load. $2.54/mile - fair for produce with all our services.", quality: "good", analytics: "✔️ Хорошо! $3,600 = $400 больше!", path: "master" },
                    { text: "$3,400 for 1,420 miles.", quality: "normal", analytics: "⚪ Нормально. $200 больше.", path: "master" },
                    { text: "$3,300 for this load?", quality: "weak", analytics: "⚠️ Слабо! $100 больше.", path: "weak" },
                    { text: "I need $4,000 minimum! Produce expensive to haul.", quality: "aggressive", analytics: "🔴 Агрессивно! Нереально!", path: "reject_rate_final" },
                    { text: "I'll take $3,200 posted.", quality: "fail", analytics: "❌ Провал! Без торга!", path: "master" }
                ]
            },
            {
                brokerQuestion: "That's high. I can do $3,400. That's $2.39/mile - already above posted.",
                dispatcherPrompt: "💎 Встречное $3,400. Просите $3,500 или примите!",
                suggestions: [
                    { text: "Can we meet at $3,500? Fair middle - you save $200 from my ask, I earn $300 above posted for professional reefer service. Considering backup trucks, zero claims, 24/7 support, worth extra $100 for peace of mind with produce.", quality: "excellent", analytics: "✨ ОТЛИЧНО! Компромисс!", path: "master" },
                    { text: "$3,400 works. Let's book it.", quality: "good", analytics: "✔️ Хорошо! $200 больше!", path: "master" },
                    { text: "$3,400 confirmed.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Okay, $3,400...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" },
                    { text: "$3,500 or I walk!", quality: "aggressive", analytics: "🔴 Ультиматум!", path: "reject_ultimatum_final" },
                    { text: "No, need $3,700!", quality: "fail", analytics: "❌ Отказ!", path: "reject_ultimatum_final" }
                ]
            },
            {
                brokerQuestion: "$3,450 final. That's $2.43/mile. You're professional - worth extra. Deal?",
                dispatcherPrompt: "💎 ФИНАЛ! $3,450 - заработали $250!",
                suggestions: [
                    { text: "$3,450 perfect! Deal! You won't regret working with us.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "$3,450 is a deal!", quality: "good", analytics: "✔️ Хорошо! $250 больше!", path: "master" },
                    { text: "$3,450 confirmed.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Okay, $3,450...", quality: "weak", analytics: "⚠️ Слабо.", path: "weak" },
                    { text: "Can't you do $3,500?", quality: "aggressive", analytics: "🔴 После final!", path: "reject_final_final" },
                    { text: "$3,475? Just $25 more?", quality: "fail", analytics: "❌ Торгуется!", path: "reject_final_final" }
                ]
            },
            {
                brokerQuestion: "Perfect! Email? I'll send rate con now. Remember - 34-36°F constant, GPS tracking, data logger, Saturday 8 AM appointment. This grocery chain is our biggest client - make us look good!",
                dispatcherPrompt: "💎 Email! Подтвердите требования!",
                suggestions: [
                    { text: "Perfect! dispatch@freshhaul.com. I'll sign in 1 hour. Confirmed: 34-36°F constant, GPS tracking after pickup, complete temp log after delivery, Saturday 8 AM guaranteed. We'll make you and grocery client very happy. After delivery, I'll call personally. Looking forward to partnership!", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "dispatch@freshhaul.com. Sign today. 34-36°F, GPS, temp log, Saturday 8 AM confirmed. Will make you look good!", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "dispatch@freshhaul.com. Will handle properly.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Let me find email...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" },
                    { text: "Send to any email. Driver knows.", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_email_final" },
                    { text: "No email... by phone?", quality: "fail", analytics: "❌ Провал!", path: "reject_email_final" }
                ]
            },
            {
                brokerResponse: "Excellent! Rate con sent to dispatch@freshhaul.com. Sign ASAP. You answered every question professionally - rare! Adding you to preferred produce carriers. If this goes well, I have 10-12 produce loads weekly Phoenix-Seattle and surrounding. Let's build long-term. Good luck!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$3,450",
                    ratePerMile: "$2.43/mile",
                    relationship: "strengthened",
                    weeklyLoads: "10-12 produce loads weekly ($34,500-41,400/week potential)",
                    feedback: `✅ ОТЛИЧНЫЕ ПЕРЕГОВОРЫ! Заработали $250 больше posted ($3,450 vs $3,200 = 7.8%).\n\n💰 ФИНАНСЫ:\n• Ставка: $3,450\n• Дизель: -$568 (225 gal × $3.90 AZ→WA)\n• Чистая прибыль: $2,882 (84% от ставки)\n\n💡 УРОК: Детальные ответы на ВСЕ вопросы = доверие = лучшие ставки! Fresh produce требует: temp monitoring, data logger, backup trucks, references, speed.\n\n🎯 РЕАЛЬНОСТЬ: Профессионализм = preferred carrier = 10-12 loads weekly ($138,000-165,600/месяц потенциал)! Один отличный звонок открывает двери!`
                }
            }
        ],

        weak: [
            {
                brokerQuestion: "You said 'some reefers'? I need exact numbers - how many reefer trucks and where is one for this load?",
                dispatcherPrompt: "⚠️ Брокер требует точности!",
                suggestions: [
                    { text: "I apologize. We have 20 reefer trucks. One in Phoenix at produce terminal, empty and ready. Has multi-temp. Driver ready 5 AM.", quality: "good", analytics: "✔️ ИСПРАВИЛСЯ!", path: "master" },
                    { text: "We have 20 reefers. One in Phoenix, ready.", quality: "normal", analytics: "⚪ Нормально.", path: "weak" },
                    { text: "We have several reefers... one available...", quality: "weak", analytics: "⚠️ СЛАБО!", path: "weak" },
                    { text: "I need to check with dispatch...", quality: "fail", analytics: "❌ ПРОВАЛ!", path: "reject_weak_final" },
                    { text: "Why so many questions?", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_weak_final" },
                    { text: "I don't know exactly... maybe 15?", quality: "fail", analytics: "❌ ПРОВАЛ!", path: "reject_weak_final" }
                ]
            },
            {
                brokerQuestion: "Okay. Driver produce experience? Reefer last service?",
                dispatcherPrompt: "💎 Опыт + service!",
                suggestions: [
                    { text: "Yes! Driver has 6 years produce experience, understands temp control 34-36°F. Reefer serviced last week - full maintenance. Report available.", quality: "good", analytics: "✔️ ХОРОШО!", path: "master" },
                    { text: "Driver has produce experience. Serviced recently.", quality: "normal", analytics: "⚪ Нормально.", path: "weak" },
                    { text: "Driver has some experience...", quality: "weak", analytics: "⚠️ СЛАБО!", path: "weak" },
                    { text: "Driver can handle any load.", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_weak_final" },
                    { text: "Not sure about service date...", quality: "fail", analytics: "❌ ПРОВАЛ!", path: "reject_weak_final" },
                    { text: "Driver is new but learns fast.", quality: "fail", analytics: "❌ ПРОВАЛ!", path: "reject_weak_final" }
                ]
            },
            {
                brokerQuestion: "$100K cargo insurance for perishable? Tracking policy?",
                dispatcherPrompt: "💎 Insurance + tracking!",
                suggestions: [
                    { text: "Yes! $100K perishable coverage through Progressive. GPS tracking with updates every 4 hours. I'll send cert after booking.", quality: "good", analytics: "✔️ ХОРОШО!", path: "master" },
                    { text: "$100K perishable coverage. Have GPS tracking.", quality: "normal", analytics: "⚪ Нормально.", path: "weak" },
                    { text: "Should have insurance... tracking available...", quality: "weak", analytics: "⚠️ СЛАБО!", path: "weak" },
                    { text: "Insurance is standard. Don't worry.", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_weak_final" },
                    { text: "Have $50K insurance. Okay?", quality: "fail", analytics: "❌ ПРОВАЛ!", path: "reject_insurance_final" },
                    { text: "No tracking. Driver calls.", quality: "fail", analytics: "❌ ПРОВАЛ!", path: "reject_weak_final" }
                ]
            },
            {
                brokerQuestion: "Appointment Saturday 8 AM Seattle. Major grocery chain - strict. Can you commit?",
                dispatcherPrompt: "💎 Commitment!",
                suggestions: [
                    { text: "Absolutely committed Saturday 8 AM! Based on 1,420 miles, depart tomorrow 5 AM, arrive Friday evening with buffer. Zero tolerance for late.", quality: "good", analytics: "✔️ ХОРОШО!", path: "master" },
                    { text: "Yes, Saturday 8 AM works. Will plan accordingly.", quality: "normal", analytics: "⚪ Нормально.", path: "weak" },
                    { text: "We'll try for Saturday 8 AM...", quality: "weak", analytics: "⚠️ СЛАБО!", path: "weak" },
                    { text: "Traffic unpredictable. Can't promise.", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_commitment_final" },
                    { text: "Driver will try his best.", quality: "fail", analytics: "❌ ПРОВАЛ!", path: "reject_commitment_final" },
                    { text: "Maybe Saturday, maybe Sunday.", quality: "fail", analytics: "❌ ПРОВАЛ!", path: "reject_commitment_final" }
                ]
            },
            {
                brokerQuestion: "Okay, I'll give you one chance. Rate is $3,200 - posted. No premium for uncertainty. Text me every 6 hours with location and temp. Deal?",
                dispatcherPrompt: "💎 Шанс без премии. Примите $3,200!",
                suggestions: [
                    { text: "Deal! $3,200 accepted. I'll text every 6 hours with location and temp. Thank you - we won't let you down. What's your cell?", quality: "good", analytics: "✔️ ХОРОШО!", path: "weak_success" },
                    { text: "$3,200 works. Will send updates every 6 hours.", quality: "normal", analytics: "⚪ Нормально.", path: "weak_success" },
                    { text: "Okay, $3,200...", quality: "weak", analytics: "⚠️ Слабо.", path: "weak_success" },
                    { text: "Can you do $3,300 at least?", quality: "fail", analytics: "❌ ПРОВАЛ!", path: "reject_weak_final" },
                    { text: "Every 6 hours is too much...", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_weak_final" },
                    { text: "I need more than posted.", quality: "fail", analytics: "❌ ПРОВАЛ!", path: "reject_weak_final" }
                ]
            },
            {
                brokerResponse: "Okay. $3,200 booked. My cell 555-9999. Text every 6 hours with location and temp. Don't be late - this is your only shot.",
                outcome: {
                    type: "success",
                    quality: "normal",
                    rate: "$3,200",
                    ratePerMile: "$2.25/mile",
                    relationship: "neutral",
                    feedback: `✅ УСПЕХ БЕЗ ПРЕМИИ. Заработали posted rate ($3,200).\n\n💰 ФИНАНСЫ:\n• Ставка: $3,200\n• Дизель: -$568\n• Чистая прибыль: $2,632\n\n⚠️ УРОК: Неуверенность стоит денег! Потеряли $250 премии. Брокер дал шанс, но без доверия = без премии.\n\n💡 ВЫВОД: Отвечайте уверенно с первого раза!`
                }
            }
        ],

        weak_success: [
            {
                brokerQuestion: "Email for rate con?",
                dispatcherPrompt: "💎 Email!",
                suggestions: [
                    { text: "dispatch@freshhaul.com. I'll sign in 2 hours.", quality: "good", analytics: "✔️ Хорошо!", path: "weak_success" },
                    { text: "dispatch@freshhaul.com.", quality: "normal", analytics: "⚪ Нормально.", path: "weak_success" },
                    { text: "Let me find email...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak_success" },
                    { text: "Send to any email.", quality: "fail", analytics: "❌ Провал!", path: "reject_email_final" },
                    { text: "No email. By phone?", quality: "fail", analytics: "❌ Провал!", path: "reject_email_final" },
                    { text: "I'll give email later.", quality: "fail", analytics: "❌ Провал!", path: "reject_email_final" }
                ]
            }
        ],

        warning: [
            {
                brokerQuestion: "I understand you're busy, but produce is time-sensitive. I need to verify your company and reefer for insurance. Standard for all produce carriers. Can you provide MC and confirm reefer capability? Critical for both of us.",
                dispatcherPrompt: "⚠️ ПРЕДУПРЕЖДЕНИЕ! Второй шанс!",
                suggestions: [
                    { text: "You're right, I apologize. MC 445566, FreshHaul Logistics. 20 reefer trucks, 5 years produce experience. Reefer in Phoenix, ready 5 AM. Where's pickup?", quality: "good", analytics: "✔️ ИСПРАВИЛСЯ!", path: "master" },
                    { text: "Sorry. MC 445566, FreshHaul Logistics. Reefer in Phoenix.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "MC 445566... have reefers...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" },
                    { text: "I don't have MC right now...", quality: "fail", analytics: "❌ ПРОВАЛ!", path: "reject_early_final" },
                    { text: "Just send load info!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_early_final" },
                    { text: "Why so difficult?", quality: "fail", analytics: "❌ ПРОВАЛ!", path: "reject_early_final" }
                ]
            }
        ],

        // ВСЕ REJECT ПУТИ - ТОЛЬКО ФИНАЛЬНЫЕ OUTCOMES, БЕЗ ПРОМЕЖУТОЧНЫХ ШАГОВ!

        reject_early_final: [
            {
                brokerResponse: "I need professional reefer carriers who understand produce requirements. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Непрофессионализм после предупреждения! Produce loads требуют серьезного подхода."
                }
            }
        ],

        reject_weak_final: [
            {
                brokerResponse: "Sorry, I can't risk produce load with uncertainty. I need reliable carrier. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ! Продолжали показывать неуверенность. Produce требует ГАРАНТИЙ, не 'попыток'."
                }
            }
        ],

        reject_attitude_final: [
            {
                brokerResponse: "I need professional carrier for produce. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Produce требует профессионализма! Грубость = потеря груза."
                }
            }
        ],

        reject_timing_final: [
            {
                brokerResponse: "5 AM pickup critical for produce schedule. I need carrier who can meet timing. Thanks.",
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
                brokerResponse: "I need carrier with produce experience. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет опыта с produce = нет груза!"
                }
            }
        ],

        reject_insurance_final: [
            {
                brokerResponse: "$100K perishable coverage required for produce. I need carrier with proper insurance. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Недостаточная страховка для produce! $100K perishable обязательна."
                }
            }
        ],

        reject_communication_final: [
            {
                brokerResponse: "GPS tracking required for produce. I need carrier with proper tracking. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет GPS tracking = нет produce груза!"
                }
            }
        ],

        reject_commitment_final: [
            {
                brokerResponse: "I need carrier who can commit to appointment for grocery chain. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет commitment = нет produce груза! Grocery chains требуют точных appointments."
                }
            }
        ],

        reject_equipment_final: [
            {
                brokerResponse: "Load locks and straps required for produce safety. I need carrier with proper equipment. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет load locks/straps = нет produce груза!"
                }
            }
        ],

        reject_monitoring_final: [
            {
                brokerResponse: "Temperature monitoring with data logger required for produce. I need carrier with proper equipment. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет temp monitoring = нет produce груза! Data logger обязателен."
                }
            }
        ],

        reject_references_final: [
            {
                brokerResponse: "I need carrier with verifiable references for produce loads. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет references = нет доверия!"
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
                    feedback: "❌ ОТКАЗ: Нереальные условия!"
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
                    feedback: "❌ ОТКАЗ: Скрытые fees или нет emergency contacts!"
                }
            }
        ],

        reject_backup_final: [
            {
                brokerResponse: "Backup plan and clean claims history required for produce. I need reliable carrier. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: Нет backup truck или есть claims!"
                }
            }
        ],

        reject_rate_final: [
            {
                brokerResponse: "$4,000 is way too high for this lane. I need realistic carrier. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ ОТКАЗ: $4,000 нереально! Posted $3,200, можно просить $3,600-3,700, но не $4,000!"
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
                    feedback: "❌ ОТКАЗ: Ультиматумы не работают!"
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
                    feedback: "❌ ОТКАЗ: Продолжали торговаться после 'final offer'!"
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
                    feedback: "❌ ОТКАЗ: Нет email = нет профессионализма!"
                }
            }
        ]
    }
};

allScenarios.push(scenario18);
console.log('✅ Scenario 18 loaded: Reefer Produce (Phoenix → Seattle) - NO DEAD ENDS!');
