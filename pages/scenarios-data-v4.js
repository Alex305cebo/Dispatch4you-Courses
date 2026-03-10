// DIALOGUE #4 - Dry Van Electronics (PREMIUM QUALITY)
// Seattle WA → Atlanta GA, 2,620 miles
// Posted: $6,540 ($2.50/mile), Target: $6,900-7,200
// Created: March 9, 2026
// STRUCTURE: 3-path (master, warning, warning_strict, reject_*_final)
// QUALITY: Premium - все исправления применены

console.log('🔵 Loading scenarios-data-v4.js...');

const scenario4 = {
    id: 4,
    route: "Seattle WA → Atlanta GA",
    distance: 2620,
    equipment: "Dry Van (53ft)",
    cargo: "Electronics (laptops, monitors, tablets)",
    weight: "35,000 lbs",
    postedRate: "$6,540 ($2.50/mile)",
    deadline: "Pickup tomorrow 10 AM, Delivery in 4 days",
    brokerStyle: "Professional electronics broker - high value cargo",
    difficulty: "hard",
    initialMessage: "Good morning! This is Jennifer from TechFreight.\nI'm calling about your posted dry van load Seattle to Atlanta with electronics.\nIs this load still available?",

    paths: {
        master: [
            // ШАГ 1: MC, Company, Fleet
            {
                brokerQuestion: "Good morning! This is Mark from ElectroLogistics. Yes, available. What's your MC number, company name, and how many dry vans do you run?",
                dispatcherPrompt: "💎 Брокер спрашивает MC, компанию и fleet!",
                suggestions: [
                    { text: "Good morning Mark! MC 112233, SecureHaul Transport. We run 30 dry vans, all 53ft with air-ride suspension and GPS tracking. Specialized in electronics for 8 years. What's the electronics type?", quality: "excellent", analytics: "✨ MC, компания, 30 vans, специализация, вопрос!", path: "master" },
                    { text: "Morning! MC 112233, SecureHaul Transport. 30 dry vans. What electronics?", quality: "good", analytics: "✔️ MC, компания, fleet.", path: "master" },
                    { text: "MC 112233, SecureHaul Transport.", quality: "normal", analytics: "⚪ Только MC и компания.", path: "warning" },
                    { text: "MC 112233... have vans...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Just tell me the rate!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "Dry van available.", quality: "fail", analytics: "❌ Нет MC!", path: "warning_strict" }
                ]
            },
            // ШАГ 2: Location, Equipment
            {
                brokerQuestion: "Good! 2,620 miles Seattle to Atlanta. Electronics - laptops, monitors, tablets, 35,000 lbs. Need air-ride and GPS. Where's your van and can you pick up tomorrow 10 AM?",
                dispatcherPrompt: "💎 Местоположение + pickup tomorrow 10 AM!",
                suggestions: [
                    { text: "Perfect! Van in Seattle at tech district, empty since yesterday. Air-ride suspension, real-time GPS tracking, climate controlled. Driver ready 10 AM tomorrow. Van inspected last week. What's pickup address?", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Van in Seattle at tech district, empty. Air-ride and GPS ready. Driver ready 10 AM tomorrow.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Van in Seattle. Ready 10 AM.", quality: "normal", analytics: "⚪ Нормально.", path: "warning" },
                    { text: "Should be in Seattle... ready soon...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Tell me rate first!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "Can't be there until noon.", quality: "fail", analytics: "❌ Не вовремя!", path: "warning_strict" }
                ]
            },
            // ШАГ 3: Experience, DOT
            {
                brokerQuestion: "Excellent! Driver's electronics experience? Clean DOT? This is high-value cargo.",
                dispatcherPrompt: "💎 Опыт с electronics + DOT!",
                suggestions: [
                    { text: "Driver has 9 years electronics experience - laptops, monitors, servers. Understands careful handling critical. Clean DOT - last inspection 3 weeks ago, zero violations. Safety rating Satisfactory.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Driver has 9 years electronics experience. Clean DOT, last inspection 3 weeks ago.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Driver experienced with electronics. DOT clean.", quality: "normal", analytics: "⚪ Нормально.", path: "warning" },
                    { text: "Driver has some electronics experience...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Driver knows dry van!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "Driver has CDL.", quality: "fail", analytics: "❌ Нет опыта!", path: "warning_strict" }
                ]
            },
            // ШАГ 4: Insurance
            {
                brokerQuestion: "Good! Insurance: $250K cargo coverage for electronics? Current certificates?",
                dispatcherPrompt: "💎 Insurance $250K для electronics!",
                suggestions: [
                    { text: "Yes! $250K cargo coverage through Travelers. $1M liability. Certificates current, expire September 2028. Covers electronics damage. I'll email after booking.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Yes, $250K cargo, $1M liability. Current certificates. Covers electronics. Will send after booking.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "$250K cargo, $1M liability. Current.", quality: "normal", analytics: "⚪ Нормально.", path: "warning" },
                    { text: "Should have $250K...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Insurance is fine!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "$100K enough for electronics?", quality: "fail", analytics: "❌ Недостаточно!", path: "warning_strict" }
                ]
            },
            // ШАГ 5: Security
            {
                brokerQuestion: "Perfect! Security: How will you secure electronics? GPS tracking updates?",
                dispatcherPrompt: "💎 Security для electronics!",
                suggestions: [
                    { text: "Electronics secured with air-ride suspension, no hard braking. Real-time GPS updates every 30 minutes. Driver checks cargo every fuel stop. If any issues, driver stops immediately, calls me. I notify you within 20 minutes.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Air-ride suspension, GPS every 30 minutes. Driver checks at fuel stops. If issues, driver stops and calls. I notify you within 20 minutes.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Air-ride and GPS tracking. Will notify if issues.", quality: "normal", analytics: "⚪ Нормально.", path: "warning" },
                    { text: "Driver will secure properly...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "GPS works fine!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "Driver checks when loading.", quality: "fail", analytics: "❌ Провал!", path: "warning_strict" }
                ]
            },
            // ШАГ 6: Commitment
            {
                brokerQuestion: "Excellent! Delivery: Appointment Friday 2 PM Atlanta tech center. Strict timing for electronics. Can you commit?",
                dispatcherPrompt: "💎 Friday 2 PM commitment!",
                suggestions: [
                    { text: "Absolutely committed Friday 2 PM! Based on 2,620 miles, depart tomorrow 10 AM, arrive Thursday evening with 20-hour buffer. Backup route via I-90/I-80. Electronics timing critical - will call 12 hours ahead if any delay.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Yes, committed Friday 2 PM. Arrive Thursday evening with buffer. Have backup route.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Yes, Friday 2 PM works.", quality: "normal", analytics: "⚪ Нормально.", path: "warning" },
                    { text: "We'll try for Friday 2 PM...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Traffic unpredictable with electronics.", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "Driver gets there when possible.", quality: "fail", analytics: "❌ Провал!", path: "warning_strict" }
                ]
            },
            // ШАГ 7: ТОРГ - Rate Question
            {
                brokerQuestion: "Great! What rate are you looking for on this 2,620 miles Seattle-Atlanta electronics load?",
                dispatcherPrompt: "💎 ТОРГ! Posted $6,540 ($2.50/mi) - просите $6,900-7,200!",
                suggestions: [
                    { text: "For 2,620 miles Seattle-Atlanta with electronics, I'm looking at $7,200. That's $2.75/mile - fair for dry van, electronics experience, GPS tracking, tight timing.", quality: "excellent", analytics: "✨ ОТЛИЧНО! $7,200 = $660 больше!", path: "master" },
                    { text: "$6,900 for this electronics load. $2.63/mile - fair with all services.", quality: "good", analytics: "✔️ Хорошо! $6,900 = $360 больше!", path: "master" },
                    { text: "$6,640 for 2,620 miles.", quality: "normal", analytics: "⚪ Нормально. $100 больше.", path: "warning" },
                    { text: "$6,590 for this load?", quality: "weak", analytics: "⚠️ Слабо! $50 больше.", path: "warning" },
                    { text: "I need $8,500 minimum! Electronics is risky!", quality: "aggressive", analytics: "🔴 Нереально!", path: "reject_rate_final" },
                    { text: "I'll take $6,540 posted.", quality: "fail", analytics: "❌ Без торга!", path: "reject_weak_final" }
                ]
            },
            // ШАГ 8: Counter Offer
            {
                brokerQuestion: "That's high. I can do $6,800. That's $2.60/mile - good for this lane.",
                dispatcherPrompt: "💎 Встречное $6,800. Просите $6,900 или примите!",
                suggestions: [
                    { text: "Can we meet at $6,900? Fair middle - you save $300 from my ask, I earn $360 above posted for professional electronics service.", quality: "excellent", analytics: "✨ ОТЛИЧНО! Компромисс!", path: "master" },
                    { text: "$6,800 works. Let's book it.", quality: "good", analytics: "✔️ Хорошо! $260 больше!", path: "master" },
                    { text: "$6,800 confirmed.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Okay, $6,800...", quality: "weak", analytics: "⚠️ Слабо.", path: "warning" },
                    { text: "$6,900 or I walk!", quality: "aggressive", analytics: "🔴 Ультиматум!", path: "reject_ultimatum_final" },
                    { text: "No, need $7,200!", quality: "fail", analytics: "❌ Отказ!", path: "reject_ultimatum_final" }
                ]
            },
            // ШАГ 9: Final Offer
            {
                brokerQuestion: "$6,850 final. That's $2.61/mile. You're professional with electronics - worth it. Deal?",
                dispatcherPrompt: "💎 ФИНАЛ! $6,850 - заработали $310!",
                suggestions: [
                    { text: "$6,850 perfect! Deal! Your electronics will arrive safe and on time.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "$6,850 is a deal!", quality: "good", analytics: "✔️ Хорошо! $310 больше!", path: "master" },
                    { text: "$6,850 confirmed.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Okay, $6,850...", quality: "weak", analytics: "⚠️ Слабо.", path: "warning" },
                    { text: "Can't you do $6,900?", quality: "aggressive", analytics: "🔴 После final!", path: "reject_final_final" },
                    { text: "$6,875? Just $25 more?", quality: "fail", analytics: "❌ Торгуется!", path: "reject_final_final" }
                ]
            },
            // ШАГ 10: Email
            {
                brokerQuestion: "Perfect! Email? I'll send rate con now. Remember - air-ride, GPS tracking, Friday 2 PM Atlanta.",
                dispatcherPrompt: "💎 Email! Подтвердите security и timing!",
                suggestions: [
                    { text: "Perfect! dispatch@securehaul.com. I'll sign in 30 minutes. Confirmed: air-ride suspension, GPS updates every 30 minutes, Friday 2 PM guaranteed. Your electronics are in good hands!", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "dispatch@securehaul.com. Sign today. Air-ride and GPS, Friday 2 PM confirmed.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "dispatch@securehaul.com. Will handle properly.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Let me find email...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Send anywhere. Driver knows.", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_email_final" },
                    { text: "No email... text message?", quality: "fail", analytics: "❌ Провал!", path: "reject_email_final" }
                ]
            },
            // ШАГ 11: SUCCESS OUTCOME
            {
                brokerResponse: "Excellent! Rate con sent to dispatch@securehaul.com. Sign ASAP. You handled every electronics question perfectly! Adding you to preferred dry van carriers. I have 10-12 electronics loads weekly Seattle-Atlanta. Let's work together long-term. Good luck!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$6,850",
                    ratePerMile: "$2.61/mile",
                    relationship: "strengthened",
                    weeklyLoads: "10-12 electronics loads weekly ($68,500-82,200/week potential)",
                    feedback: `✅ ОТЛИЧНЫЕ ПЕРЕГОВОРЫ! Заработали $310 больше posted ($6,850 vs $6,540 = 4.7%).\n\n💰 ФИНАНСЫ:\n• Ставка: $6,850\n• Дизель: -$1,048 (328 gal × $3.20 WA→GA)\n• Чистая прибыль: $5,802 (85% от ставки)\n\n💡 УРОК: Electronics expertise = preferred carrier = 10-12 loads weekly ($274,000-328,800/месяц потенциал)!`
                }
            }
        ],

        // WARNING PATH (вежливое предупреждение)
        warning: [
            {
                brokerResponse: "⚠️ I need more confidence and details. This is high-value electronics. Can you provide clear information?",
                dispatcherPrompt: "💡 Брокер сомневается! Electronics требует надежности!",
                suggestions: [
                    { text: "I apologize! MC 112233, SecureHaul Transport, 30 dry vans. Van in Seattle at tech district, air-ride and GPS ready. Driver 9 years electronics experience. GPS updates every 30 minutes. Committed Friday 2 PM. Ready to work professionally!", quality: "excellent", analytics: "✨ Исправился полностью!", path: "master" },
                    { text: "Sorry. MC 112233, SecureHaul. Van in Seattle, air-ride ready. Driver experienced. Friday 2 PM ready.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "MC 112233. Van in Seattle. Ready Friday.", quality: "normal", analytics: "⚪ Минимально исправился.", path: "master" },
                    { text: "I think everything ready...", quality: "weak", analytics: "⚠️ Не исправился!", path: "reject_weak_final" },
                    { text: "Why so many questions?", quality: "aggressive", analytics: "🔴 Стало хуже!", path: "reject_attitude_final" },
                    { text: "Not sure about details.", quality: "fail", analytics: "❌ Провал!", path: "reject_weak_final" }
                ]
            }
        ],

        // WARNING_STRICT PATH (строгое предупреждение)
        warning_strict: [
            {
                brokerResponse: "⚠️ STOP! This is high-value electronics - security critical! If you want this load, answer professionally. Last chance!",
                dispatcherPrompt: "🚨 ПОСЛЕДНИЙ ШАНС! Electronics не терпит ошибок!",
                suggestions: [
                    { text: "I sincerely apologize! MC 112233, SecureHaul Transport, 30 dry vans specialized in electronics. Van in Seattle at tech district, air-ride and GPS ready. Driver 9 years electronics experience. GPS updates every 30 minutes. Committed Friday 2 PM. Ready to work professionally!", quality: "excellent", analytics: "✨ Полностью исправился!", path: "master" },
                    { text: "I apologize. MC 112233, SecureHaul. Van in Seattle, air-ride ready. Driver experienced. Friday 2 PM ready.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "Sorry. MC 112233. Van in Seattle. Friday ready.", quality: "normal", analytics: "⚪ Минимально исправился.", path: "master" },
                    { text: "I said it's ready...", quality: "weak", analytics: "⚠️ Не исправился!", path: "reject_attitude_final" },
                    { text: "Fine! Whatever!", quality: "aggressive", analytics: "🔴 Еще хуже!", path: "reject_attitude_final" },
                    { text: "Can't confirm everything.", quality: "fail", analytics: "❌ Провал!", path: "reject_weak_final" }
                ]
            }
        ],

        // REJECT PATHS
        reject_weak_final: [
            {
                brokerResponse: "Sorry, I can't risk high-value electronics with uncertainty. I need reliable carrier. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Electronics требует 100% надежности! Неуверенность = поврежденный груз = потери!"
                }
            }
        ],

        reject_attitude_final: [
            {
                brokerResponse: "I don't work with unprofessional carriers on electronics. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Грубость с electronics грузом недопустима! Брокеры хотят профессионалов!"
                }
            }
        ],

        reject_timing_final: [
            {
                brokerResponse: "10 AM pickup critical for electronics schedule. I need carrier who can meet timing. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Electronics timing критичен! Опоздание = проблемы с клиентом!"
                }
            }
        ],

        reject_rate_final: [
            {
                brokerResponse: "$8,500 is way too high for this lane. I need realistic carrier. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: $8,500 нереально! Posted $6,540, можно $6,900-7,200, но не $8,500!"
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

allScenarios.push(scenario4);
console.log('✅ Scenario 4 loaded: Dry Van Electronics (Seattle → Atlanta) - PREMIUM QUALITY');
