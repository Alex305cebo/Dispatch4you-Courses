// DIALOGUE #6 - Dry Van Automotive Parts (PREMIUM QUALITY V2)
// Detroit MI → Phoenix AZ, 1,980 miles
// Posted: $4,950 ($2.50/mile), Target: $5,200-5,400
// Created: March 9, 2026
// STRUCTURE: 3-path with MULTI-STEP WARNING (11 warning steps - one per master step)
// QUALITY: Premium V2 - улучшенная версия с индивидуальными warning на каждом шаге

console.log('🔵 Loading scenarios-data-v6.js...');

const scenario6 = {
    id: 6,
    route: "Detroit MI → Phoenix AZ",
    distance: 1980,
    equipment: "Dry Van (53ft)",
    cargo: "Automotive parts (engines, transmissions)",
    weight: "43,000 lbs",
    postedRate: "$4,950 ($2.50/mile)",
    deadline: "Pickup tomorrow 9 AM, Delivery in 4 days",
    brokerStyle: "Professional automotive broker - precision timing",
    difficulty: "medium",
    initialMessage: "Good morning! This is Alex from AutoFreight.\nI'm calling about your posted dry van load Detroit to Phoenix with automotive parts.\nIs this load still available?",

    paths: {
        master: [
            // ШАГ 1: MC, Company, Fleet
            {
                brokerQuestion: "Good morning! This is Kelly from MotorParts Logistics. Yes, available. What's your MC number, company name, and how many dry vans do you run?",
                dispatcherPrompt: "💎 Брокер спрашивает MC, компанию и fleet!",
                suggestions: [
                    { text: "Good morning Kelly! MC 445566, AutoHaul Express. We run 28 dry vans, all 53ft with air-ride and lift gates. Specialized in automotive parts for 6 years. What's the parts type?", quality: "excellent", analytics: "✨ MC, компания, 28 vans, специализация, вопрос!", path: "master" },
                    { text: "Morning! MC 445566, AutoHaul Express. 28 dry vans. What parts?", quality: "good", analytics: "✔️ MC, компания, fleet.", path: "master" },
                    { text: "MC 445566, AutoHaul Express.", quality: "normal", analytics: "⚪ Только MC и компания.", path: "warning" },
                    { text: "MC 445566... have vans...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Just tell me the rate!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "Dry van available.", quality: "fail", analytics: "❌ Нет MC!", path: "warning_strict" }
                ]
            },
            // ШАГ 2: Location, Equipment
            {
                brokerQuestion: "Good! 1,980 miles Detroit to Phoenix. Automotive parts - engines and transmissions, 43,000 lbs. Need air-ride and lift gate. Where's your van and can you pick up tomorrow 9 AM?",
                dispatcherPrompt: "💎 Местоположение + pickup tomorrow 9 AM!",
                suggestions: [
                    { text: "Perfect! Van in Detroit at auto plant, empty since yesterday. Air-ride suspension, hydraulic lift gate. Driver ready 9 AM tomorrow. Van inspected last week. What's pickup address?", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Van in Detroit at auto plant, empty. Air-ride and lift gate ready. Driver ready 9 AM tomorrow.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Van in Detroit. Ready 9 AM.", quality: "normal", analytics: "⚪ Нормально.", path: "warning" },
                    { text: "Should be in Detroit... ready soon...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Tell me rate first!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "Can't be there until 11 AM.", quality: "fail", analytics: "❌ Не вовремя!", path: "warning_strict" }
                ]
            },
            // ШАГ 3: Experience, DOT
            {
                brokerQuestion: "Excellent! Driver's automotive parts experience? Clean DOT? This is precision cargo.",
                dispatcherPrompt: "💎 Опыт с automotive parts + DOT!",
                suggestions: [
                    { text: "Driver has 7 years automotive parts experience - engines, transmissions, delicate components. Understands careful handling critical. Clean DOT - last inspection 3 weeks ago, zero violations. Safety rating Satisfactory.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Driver has 7 years automotive parts experience. Clean DOT, last inspection 3 weeks ago.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Driver experienced with automotive parts. DOT clean.", quality: "normal", analytics: "⚪ Нормально.", path: "warning" },
                    { text: "Driver has some auto experience...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Driver knows dry van!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "Driver has CDL.", quality: "fail", analytics: "❌ Нет опыта!", path: "warning_strict" }
                ]
            },
            // ШАГ 4: Insurance
            {
                brokerQuestion: "Good! Insurance: $150K cargo coverage for automotive parts? Current certificates?",
                dispatcherPrompt: "💎 Insurance $150K для automotive parts!",
                suggestions: [
                    { text: "Yes! $150K cargo coverage through Allstate. $1M liability. Certificates current, expire November 2028. Covers automotive parts damage. I'll email after booking.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Yes, $150K cargo, $1M liability. Current certificates. Covers auto parts. Will send after booking.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "$150K cargo, $1M liability. Current.", quality: "normal", analytics: "⚪ Нормально.", path: "warning" },
                    { text: "Should have $150K...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Insurance is fine!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "$100K enough for auto parts?", quality: "fail", analytics: "❌ Недостаточно!", path: "warning_strict" }
                ]
            },
            // ШАГ 5: Handling
            {
                brokerQuestion: "Perfect! Handling: How will you secure automotive parts? What about lift gate operation?",
                dispatcherPrompt: "💎 Handling для automotive parts!",
                suggestions: [
                    { text: "Automotive parts secured with straps and load bars. Heavy engines on bottom, transmissions properly braced. Lift gate certified, driver trained. If any issues, driver stops immediately, calls me. I notify you within 20 minutes.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Parts secured with straps and load bars. Engines on bottom. Lift gate certified. If issues, driver stops and calls. I notify you within 20 minutes.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Straps and load bars. Will notify if issues.", quality: "normal", analytics: "⚪ Нормально.", path: "warning" },
                    { text: "Driver will secure properly...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Lift gate works fine!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "Driver secures when loading.", quality: "fail", analytics: "❌ Провал!", path: "warning_strict" }
                ]
            },
            // ШАГ 6: Commitment
            {
                brokerQuestion: "Excellent! Delivery: Appointment Friday 3 PM Phoenix auto warehouse. Strict timing for production line. Can you commit?",
                dispatcherPrompt: "💎 Friday 3 PM commitment!",
                suggestions: [
                    { text: "Absolutely committed Friday 3 PM! Based on 1,980 miles, depart tomorrow 9 AM, arrive Thursday evening with 20-hour buffer. Backup route via I-40. Production timing critical - will call 12 hours ahead if any delay.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Yes, committed Friday 3 PM. Arrive Thursday evening with buffer. Have backup route.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Yes, Friday 3 PM works.", quality: "normal", analytics: "⚪ Нормально.", path: "warning" },
                    { text: "We'll try for Friday 3 PM...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Traffic unpredictable with auto parts.", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "Driver gets there when possible.", quality: "fail", analytics: "❌ Провал!", path: "warning_strict" }
                ]
            },
            // ШАГ 7: ТОРГ - Rate Question
            {
                brokerQuestion: "Great! What rate are you looking for on this 1,980 miles Detroit-Phoenix automotive load?",
                dispatcherPrompt: "💎 ТОРГ! Posted $4,950 ($2.50/mi) - просите $5,200-5,400!",
                suggestions: [
                    { text: "For 1,980 miles Detroit-Phoenix with automotive parts, I'm looking at $5,400. That's $2.73/mile - fair for dry van, auto parts experience, lift gate, tight timing.", quality: "excellent", analytics: "✨ ОТЛИЧНО! $5,400 = $450 больше!", path: "master" },
                    { text: "$5,200 for this auto parts load. $2.63/mile - fair with all services.", quality: "good", analytics: "✔️ Хорошо! $5,200 = $250 больше!", path: "master" },
                    { text: "$5,050 for 1,980 miles.", quality: "normal", analytics: "⚪ Нормально. $100 больше.", path: "warning" },
                    { text: "$5,000 for this load?", quality: "weak", analytics: "⚠️ Слабо! $50 больше.", path: "warning" },
                    { text: "I need $6,500 minimum! Auto parts is risky!", quality: "aggressive", analytics: "🔴 Нереально!", path: "reject_rate_final" },
                    { text: "I'll take $4,950 posted.", quality: "fail", analytics: "❌ Без торга!", path: "reject_weak_final" }
                ]
            },
            // ШАГ 8: Counter Offer
            {
                brokerQuestion: "That's high. I can do $5,100. That's $2.58/mile - good for this lane.",
                dispatcherPrompt: "💎 Встречное $5,100. Просите $5,200 или примите!",
                suggestions: [
                    { text: "Can we meet at $5,200? Fair middle - you save $200 from my ask, I earn $250 above posted for professional auto parts service.", quality: "excellent", analytics: "✨ ОТЛИЧНО! Компромисс!", path: "master" },
                    { text: "$5,100 works. Let's book it.", quality: "good", analytics: "✔️ Хорошо! $150 больше!", path: "master" },
                    { text: "$5,100 confirmed.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Okay, $5,100...", quality: "weak", analytics: "⚠️ Слабо.", path: "warning" },
                    { text: "$5,200 or I walk!", quality: "aggressive", analytics: "🔴 Ультиматум!", path: "reject_ultimatum_final" },
                    { text: "No, need $5,400!", quality: "fail", analytics: "❌ Отказ!", path: "reject_ultimatum_final" }
                ]
            },
            // ШАГ 9: Final Offer
            {
                brokerQuestion: "$5,150 final. That's $2.60/mile. You're professional with auto parts - worth it. Deal?",
                dispatcherPrompt: "💎 ФИНАЛ! $5,150 - заработали $200!",
                suggestions: [
                    { text: "$5,150 perfect! Deal! Your auto parts will arrive safe and on time.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "$5,150 is a deal!", quality: "good", analytics: "✔️ Хорошо! $200 больше!", path: "master" },
                    { text: "$5,150 confirmed.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Okay, $5,150...", quality: "weak", analytics: "⚠️ Слабо.", path: "warning" },
                    { text: "Can't you do $5,200?", quality: "aggressive", analytics: "🔴 После final!", path: "reject_final_final" },
                    { text: "$5,175? Just $25 more?", quality: "fail", analytics: "❌ Торгуется!", path: "reject_final_final" }
                ]
            },
            // ШАГ 10: Email
            {
                brokerQuestion: "Perfect! Email? I'll send rate con now. Remember - air-ride, lift gate, Friday 3 PM Phoenix.",
                dispatcherPrompt: "💎 Email! Подтвердите handling и timing!",
                suggestions: [
                    { text: "Perfect! dispatch@autohaul.com. I'll sign in 30 minutes. Confirmed: air-ride suspension, certified lift gate, Friday 3 PM guaranteed. Your auto parts are in good hands!", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "dispatch@autohaul.com. Sign today. Air-ride and lift gate, Friday 3 PM confirmed.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "dispatch@autohaul.com. Will handle properly.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Let me find email...", quality: "weak", analytics: "⚠️ Слабо.", path: "warning" },
                    { text: "Send anywhere. Driver knows.", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_email_final" },
                    { text: "No email... text message?", quality: "fail", analytics: "❌ Провал!", path: "reject_email_final" }
                ]
            },
            // ШАГ 11: SUCCESS OUTCOME
            {
                brokerResponse: "Excellent! Rate con sent to dispatch@autohaul.com. Sign ASAP. You handled every auto parts question perfectly! Adding you to preferred dry van carriers. I have 9-11 automotive loads weekly Detroit-Phoenix. Let's work together long-term. Good luck!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$5,150",
                    ratePerMile: "$2.60/mile",
                    relationship: "strengthened",
                    weeklyLoads: "9-11 automotive loads weekly ($46,350-56,650/week potential)",
                    feedback: `✅ ОТЛИЧНЫЕ ПЕРЕГОВОРЫ! Заработали $200 больше posted ($5,150 vs $4,950 = 4.0%).\n\n💰 ФИНАНСЫ:\n• Ставка: $5,150\n• Дизель: -$792 (248 gal × $3.20 MI→AZ)\n• Чистая прибыль: $4,358 (85% от ставки)\n\n💡 УРОК: Automotive expertise = preferred carrier = 9-11 loads weekly ($185,400-226,600/месяц потенциал)!`
                }
            }
        ],

        // WARNING PATH - MULTI-STEP (11 шагов, по одному для каждого шага master)
        warning: [
            // WARNING ШАГ 1: MC/Company
            {
                brokerResponse: "⚠️ I need your MC number and company name clearly. This is professional business. Can you provide that?",
                dispatcherPrompt: "💡 Брокер хочет MC и компанию! Дайте четко!",
                suggestions: [
                    { text: "I apologize! MC 445566, AutoHaul Express, 28 dry vans specialized in automotive. Van in Detroit ready 9 AM. Driver 7 years auto parts experience. Ready to work professionally!", quality: "excellent", analytics: "✨ Исправился полностью!", path: "master" },
                    { text: "Sorry. MC 445566, AutoHaul Express. 28 vans. Van in Detroit ready.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "MC 445566, AutoHaul Express.", quality: "normal", analytics: "⚪ Минимально исправился.", path: "master" },
                    { text: "I think I said MC...", quality: "weak", analytics: "⚠️ Не исправился!", path: "reject_weak_final" },
                    { text: "Why so many questions?", quality: "aggressive", analytics: "🔴 Стало хуже!", path: "reject_attitude_final" },
                    { text: "Not sure about MC.", quality: "fail", analytics: "❌ Провал!", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 2: Location/Equipment
            {
                brokerResponse: "⚠️ I need to know where your van is and if you can pick up tomorrow 9 AM. Can you confirm location and timing?",
                dispatcherPrompt: "💡 Брокер хочет местоположение и timing! Подтвердите!",
                suggestions: [
                    { text: "I apologize! Van in Detroit at auto plant, empty. Air-ride and lift gate ready. Driver ready 9 AM tomorrow sharp. Ready to work professionally!", quality: "excellent", analytics: "✨ Исправился полностью!", path: "master" },
                    { text: "Sorry. Van in Detroit at auto plant. Air-ride ready. Driver ready 9 AM tomorrow.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "Van in Detroit. Ready 9 AM.", quality: "normal", analytics: "⚪ Минимально исправился.", path: "master" },
                    { text: "I think van is ready...", quality: "weak", analytics: "⚠️ Не исправился!", path: "reject_weak_final" },
                    { text: "Why so specific?", quality: "aggressive", analytics: "🔴 Стало хуже!", path: "reject_attitude_final" },
                    { text: "Not sure about location.", quality: "fail", analytics: "❌ Провал!", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 3: Experience/DOT
            {
                brokerResponse: "⚠️ I need to know driver's automotive parts experience and DOT status. This is precision cargo. Can you provide details?",
                dispatcherPrompt: "💡 Брокер хочет опыт и DOT! Дайте детали!",
                suggestions: [
                    { text: "I apologize! Driver has 7 years automotive parts experience - engines, transmissions. Clean DOT - last inspection 3 weeks ago, zero violations. Ready to work professionally!", quality: "excellent", analytics: "✨ Исправился полностью!", path: "master" },
                    { text: "Sorry. Driver 7 years auto parts experience. Clean DOT, last inspection 3 weeks ago.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "Driver experienced with auto parts. DOT clean.", quality: "normal", analytics: "⚪ Минимально исправился.", path: "master" },
                    { text: "I think driver experienced...", quality: "weak", analytics: "⚠️ Не исправился!", path: "reject_weak_final" },
                    { text: "Driver knows his job!", quality: "aggressive", analytics: "🔴 Стало хуже!", path: "reject_attitude_final" },
                    { text: "Not sure about experience.", quality: "fail", analytics: "❌ Провал!", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 4: Insurance
            {
                brokerResponse: "⚠️ I need confirmation of $150K cargo coverage for automotive parts. Can you provide insurance details?",
                dispatcherPrompt: "💡 Брокер хочет insurance $150K! Подтвердите!",
                suggestions: [
                    { text: "I apologize! $150K cargo coverage through Allstate. $1M liability. Certificates current, expire November 2028. I'll email after booking. Ready to work professionally!", quality: "excellent", analytics: "✨ Исправился полностью!", path: "master" },
                    { text: "Sorry. $150K cargo, $1M liability. Current certificates. Will send after booking.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "$150K cargo, $1M liability. Current.", quality: "normal", analytics: "⚪ Минимально исправился.", path: "master" },
                    { text: "I think we have $150K...", quality: "weak", analytics: "⚠️ Не исправился!", path: "reject_weak_final" },
                    { text: "Insurance is standard!", quality: "aggressive", analytics: "🔴 Стало хуже!", path: "reject_attitude_final" },
                    { text: "Not sure about coverage.", quality: "fail", analytics: "❌ Провал!", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 5: Handling
            {
                brokerResponse: "⚠️ I need to know how you'll secure automotive parts and operate lift gate. Can you explain your process?",
                dispatcherPrompt: "💡 Брокер хочет handling детали! Объясните процесс!",
                suggestions: [
                    { text: "I apologize! Parts secured with straps and load bars. Heavy engines on bottom. Lift gate certified, driver trained. If issues, driver stops and calls. Ready to work professionally!", quality: "excellent", analytics: "✨ Исправился полностью!", path: "master" },
                    { text: "Sorry. Straps and load bars. Engines on bottom. Lift gate certified. Driver stops if issues.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "Straps and load bars. Will notify if issues.", quality: "normal", analytics: "⚪ Минимально исправился.", path: "master" },
                    { text: "I think we secure properly...", quality: "weak", analytics: "⚠️ Не исправился!", path: "reject_weak_final" },
                    { text: "Standard securement!", quality: "aggressive", analytics: "🔴 Стало хуже!", path: "reject_attitude_final" },
                    { text: "Not sure about process.", quality: "fail", analytics: "❌ Провал!", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 6: Commitment
            {
                brokerResponse: "⚠️ I need commitment for Friday 3 PM delivery. Production line depends on this. Can you commit?",
                dispatcherPrompt: "💡 Брокер хочет commitment Friday 3 PM! Подтвердите!",
                suggestions: [
                    { text: "I apologize! Absolutely committed Friday 3 PM! Depart tomorrow 9 AM, arrive Thursday evening with 20-hour buffer. Production timing critical. Ready to work professionally!", quality: "excellent", analytics: "✨ Исправился полностью!", path: "master" },
                    { text: "Sorry. Yes, committed Friday 3 PM. Arrive Thursday evening with buffer.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "Yes, Friday 3 PM works.", quality: "normal", analytics: "⚪ Минимально исправился.", path: "master" },
                    { text: "I think we can make it...", quality: "weak", analytics: "⚠️ Не исправился!", path: "reject_weak_final" },
                    { text: "Traffic is unpredictable!", quality: "aggressive", analytics: "🔴 Стало хуже!", path: "reject_attitude_final" },
                    { text: "Not sure about timing.", quality: "fail", analytics: "❌ Провал!", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 7: Rate Question
            {
                brokerResponse: "⚠️ I need a realistic rate for this load. What's your actual rate expectation?",
                dispatcherPrompt: "💡 Брокер хочет реальную цену! Назовите адекватную!",
                suggestions: [
                    { text: "I apologize! For 1,980 miles with automotive parts, I'm looking at $5,200. That's $2.63/mile - fair for all services. Ready to work professionally!", quality: "excellent", analytics: "✨ Исправился полностью!", path: "master" },
                    { text: "Sorry. $5,100 for this load. $2.58/mile - fair with all services.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "$5,050 for 1,980 miles.", quality: "normal", analytics: "⚪ Минимально исправился.", path: "master" },
                    { text: "I think $5,000 is fair...", quality: "weak", analytics: "⚠️ Не исправился!", path: "reject_weak_final" },
                    { text: "Market rate is higher!", quality: "aggressive", analytics: "🔴 Стало хуже!", path: "reject_attitude_final" },
                    { text: "Not sure about rate.", quality: "fail", analytics: "❌ Провал!", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 8: Counter Offer
            {
                brokerResponse: "⚠️ I gave you my counter offer. Can you work with $5,100 or do you need more?",
                dispatcherPrompt: "💡 Брокер дал $5,100! Примите или попросите чуть больше!",
                suggestions: [
                    { text: "I apologize! Can we meet at $5,150? Fair middle ground. Ready to work professionally!", quality: "excellent", analytics: "✨ Исправился полностью!", path: "master" },
                    { text: "Sorry. $5,100 works. Let's book it.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "$5,100 confirmed.", quality: "normal", analytics: "⚪ Минимально исправился.", path: "master" },
                    { text: "I think $5,100 is low...", quality: "weak", analytics: "⚠️ Не исправился!", path: "reject_weak_final" },
                    { text: "That's not enough!", quality: "aggressive", analytics: "🔴 Стало хуже!", path: "reject_attitude_final" },
                    { text: "Not sure about that.", quality: "fail", analytics: "❌ Провал!", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 9: Final Offer
            {
                brokerResponse: "⚠️ This is my final offer - $5,150. Can you accept this or not?",
                dispatcherPrompt: "💡 Брокер дал final $5,150! Примите или потеряете груз!",
                suggestions: [
                    { text: "I apologize! $5,150 is perfect! Deal! Ready to work professionally!", quality: "excellent", analytics: "✨ Исправился полностью!", path: "master" },
                    { text: "Sorry. $5,150 is a deal!", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "$5,150 confirmed.", quality: "normal", analytics: "⚪ Минимально исправился.", path: "master" },
                    { text: "I think we need more...", quality: "weak", analytics: "⚠️ Не исправился!", path: "reject_final_final" },
                    { text: "Can't you do better?", quality: "aggressive", analytics: "🔴 Стало хуже!", path: "reject_final_final" },
                    { text: "Not sure about final.", quality: "fail", analytics: "❌ Провал!", path: "reject_final_final" }
                ]
            },
            // WARNING ШАГ 10: Email
            {
                brokerResponse: "⚠️ I need your email to send rate confirmation. What's your dispatch email?",
                dispatcherPrompt: "💡 Брокер хочет email! Дайте четко!",
                suggestions: [
                    { text: "I apologize! dispatch@autohaul.com. I'll sign in 30 minutes. Air-ride and lift gate confirmed. Ready to work professionally!", quality: "excellent", analytics: "✨ Исправился полностью!", path: "master" },
                    { text: "Sorry. dispatch@autohaul.com. Sign today. Friday 3 PM confirmed.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "dispatch@autohaul.com. Will handle properly.", quality: "normal", analytics: "⚪ Минимально исправился.", path: "master" },
                    { text: "I think it's dispatch@...", quality: "weak", analytics: "⚠️ Не исправился!", path: "reject_email_final" },
                    { text: "Just send it anywhere!", quality: "aggressive", analytics: "🔴 Стало хуже!", path: "reject_email_final" },
                    { text: "Not sure about email.", quality: "fail", analytics: "❌ Провал!", path: "reject_email_final" }
                ]
            },
            // WARNING ШАГ 11: Final Success (если дошли сюда через warning)
            {
                brokerResponse: "Okay, rate con sent to dispatch@autohaul.com. Sign ASAP. You improved your communication. Let's see how this load goes.",
                outcome: {
                    type: "success",
                    quality: "good",
                    rate: "$5,150",
                    ratePerMile: "$2.60/mile",
                    relationship: "neutral",
                    weeklyLoads: "Maybe more loads if this goes well",
                    feedback: `✅ ГРУЗ ПОЛУЧЕН! Но коммуникация была слабой. Заработали $200 больше posted ($5,150 vs $4,950 = 4.0%).\n\n💰 ФИНАНСЫ:\n• Ставка: $5,150\n• Дизель: -$792\n• Чистая прибыль: $4,358\n\n⚠️ УРОК: Слабая коммуникация = нет preferred status! Брокер сомневается. Нужно быть увереннее с первого шага!`
                }
            }
        ],

        // WARNING_STRICT PATH (строгое предупреждение - только 1 шаг)
        warning_strict: [
            {
                brokerResponse: "⚠️ STOP! This is professional business with automotive parts! If you want this load, answer professionally NOW. Last chance!",
                dispatcherPrompt: "🚨 ПОСЛЕДНИЙ ШАНС! Automotive parts не терпит ошибок!",
                suggestions: [
                    { text: "I sincerely apologize! MC 445566, AutoHaul Express, 28 dry vans specialized in automotive. Van in Detroit at auto plant, air-ride and lift gate ready. Driver 7 years auto parts experience. Committed Friday 3 PM. Ready to work professionally!", quality: "excellent", analytics: "✨ Полностью исправился!", path: "master" },
                    { text: "I apologize. MC 445566, AutoHaul. Van in Detroit, air-ride ready. Driver experienced. Friday 3 PM ready.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "Sorry. MC 445566. Van in Detroit. Friday ready.", quality: "normal", analytics: "⚪ Минимально исправился.", path: "master" },
                    { text: "I said it's ready...", quality: "weak", analytics: "⚠️ Не исправился!", path: "reject_attitude_final" },
                    { text: "Fine! Whatever!", quality: "aggressive", analytics: "🔴 Еще хуже!", path: "reject_attitude_final" },
                    { text: "Can't confirm everything.", quality: "fail", analytics: "❌ Провал!", path: "reject_weak_final" }
                ]
            }
        ],

        // REJECT PATHS
        reject_weak_final: [
            {
                brokerResponse: "Sorry, I can't risk automotive parts with uncertainty. I need reliable carrier. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Automotive parts требует 100% надежности! Неуверенность = поврежденный груз = потери!"
                }
            }
        ],

        reject_attitude_final: [
            {
                brokerResponse: "I don't work with unprofessional carriers on automotive parts. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Грубость с automotive parts грузом недопустима! Брокеры хотят профессионалов!"
                }
            }
        ],

        reject_timing_final: [
            {
                brokerResponse: "9 AM pickup critical for automotive schedule. I need carrier who can meet timing. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Automotive timing критичен! Опоздание = остановка производства!"
                }
            }
        ],

        reject_rate_final: [
            {
                brokerResponse: "$6,500 is way too high for this lane. I need realistic carrier. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: $6,500 нереально! Posted $4,950, можно $5,200-5,400, но не $6,500!"
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
                    feedback: "❌ REJECT: Ультиматумы не работают! Брокеры хотят партнерства, не конфронтации."
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
                    feedback: "❌ REJECT: Торг после 'final offer' = неуважение!"
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
                    feedback: "❌ REJECT: Нет email = нет профессионализма!"
                }
            }
        ]
    }
};

allScenarios.push(scenario6);
console.log('✅ Scenario 6 loaded: Dry Van Automotive Parts (Detroit → Phoenix) - PREMIUM QUALITY V2 with MULTI-STEP WARNING');
