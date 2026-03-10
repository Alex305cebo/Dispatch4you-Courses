// DIALOGUE #2 - Dry Van Furniture (PREMIUM QUALITY)
// Chicago IL → Miami FL, 1,380 miles
// Posted: $3,450 ($2.50/mile), Target: $3,700-3,900
// Created: March 9, 2026
// STRUCTURE: 3-path (master, warning, warning_strict, reject_*_final)
// QUALITY: Premium - все исправления применены

console.log('🔵 Loading scenarios-data-v2.js...');

const scenario2 = {
    id: 2,
    route: "Chicago IL → Miami FL",
    distance: 1380,
    equipment: "Dry Van (53ft)",
    cargo: "Furniture (sofas, tables, chairs)",
    weight: "38,000 lbs",
    postedRate: "$3,450 ($2.50/mile)",
    deadline: "Pickup tomorrow 8 AM, Delivery in 3 days",
    brokerStyle: "Professional furniture broker - careful handling",
    difficulty: "medium",
    initialMessage: "Good morning! This is Mike from FurnitureFreight.\nI'm calling about your posted dry van load Chicago to Miami with furniture.\nIs this load still available?",

    paths: {
        master: [
            // ШАГ 1: MC, Company, Fleet
            {
                brokerQuestion: "Good morning! This is Lisa from HomeGoods Logistics. Yes, available. What's your MC number, company name, and how many dry vans do you run?",
                dispatcherPrompt: "💎 Брокер спрашивает MC, компанию и fleet!",
                suggestions: [
                    { text: "Good morning Lisa! MC 556677, Reliable Transport. We run 25 dry vans, all 53ft with E-track and straps. Specialized in furniture for 7 years. What's the furniture type?", quality: "excellent", analytics: "✨ MC, компания, 25 vans, специализация, вопрос!", path: "master" },
                    { text: "Morning! MC 556677, Reliable Transport. 25 dry vans. What furniture?", quality: "good", analytics: "✔️ MC, компания, fleet.", path: "master" },
                    { text: "MC 556677, Reliable Transport.", quality: "normal", analytics: "⚪ Только MC и компания.", path: "warning" },
                    { text: "MC 556677... have vans...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Just tell me the rate!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "Dry van available.", quality: "fail", analytics: "❌ Нет MC!", path: "warning_strict" }
                ]
            },
            // ШАГ 2: Location, Equipment
            {
                brokerQuestion: "Good! 1,380 miles Chicago to Miami. Furniture - sofas, tables, chairs, 38,000 lbs. Need E-track and straps. Where's your van and can you pick up tomorrow 8 AM?",
                dispatcherPrompt: "💎 Местоположение + pickup tomorrow 8 AM!",
                suggestions: [
                    { text: "Perfect! Van in Chicago at warehouse district, empty since yesterday. Full E-track system, 20 straps, furniture pads available. Driver ready 8 AM tomorrow. Van inspected last week. What's pickup address?", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Van in Chicago at warehouse, empty. E-track and straps ready. Driver ready 8 AM tomorrow.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Van in Chicago. Ready 8 AM.", quality: "normal", analytics: "⚪ Нормально.", path: "warning" },
                    { text: "Should be in Chicago... ready soon...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Tell me rate first!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "Can't be there until 10 AM.", quality: "fail", analytics: "❌ Не вовремя!", path: "warning_strict" }
                ]
            },
            // ШАГ 3: Experience, DOT
            {
                brokerQuestion: "Excellent! Driver's furniture experience? Clean DOT? This is high-value furniture.",
                dispatcherPrompt: "💎 Опыт с furniture + DOT!",
                suggestions: [
                    { text: "Driver has 8 years furniture experience - sofas, tables, antiques. Understands careful handling critical. Clean DOT - last inspection 3 weeks ago, zero violations. Safety rating Satisfactory.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Driver has 8 years furniture experience. Clean DOT, last inspection 3 weeks ago.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Driver experienced with furniture. DOT clean.", quality: "normal", analytics: "⚪ Нормально.", path: "warning" },
                    { text: "Driver has some furniture experience...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Driver knows dry van!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "Driver has CDL.", quality: "fail", analytics: "❌ Нет опыта!", path: "warning_strict" }
                ]
            },
            // ШАГ 4: Insurance
            {
                brokerQuestion: "Good! Insurance: $100K cargo coverage for furniture? Current certificates?",
                dispatcherPrompt: "💎 Insurance $100K для furniture!",
                suggestions: [
                    { text: "Yes! $100K cargo coverage through Progressive. $1M liability. Certificates current, expire July 2028. Covers furniture damage. I'll email after booking.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Yes, $100K cargo, $1M liability. Current certificates. Covers furniture. Will send after booking.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "$100K cargo, $1M liability. Current.", quality: "normal", analytics: "⚪ Нормально.", path: "warning" },
                    { text: "Should have $100K...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Insurance is fine!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "$75K enough for furniture?", quality: "fail", analytics: "❌ Недостаточно!", path: "warning_strict" }
                ]
            },
            // ШАГ 5: Handling
            {
                brokerQuestion: "Perfect! Handling: How will you secure furniture? What if something shifts?",
                dispatcherPrompt: "💎 Handling для furniture!",
                suggestions: [
                    { text: "Furniture secured with E-track straps every 6 feet. Pads between pieces. Heavy items on bottom. If shift detected, driver stops immediately, re-secures, calls me. I notify you within 30 minutes. Zero tolerance for damage.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "E-track straps every 6 feet. Pads between pieces. If shifts, driver stops and calls. I notify you within 30 minutes.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Regular straps. Will notify if issues.", quality: "normal", analytics: "⚪ Нормально.", path: "warning" },
                    { text: "Driver will secure properly...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Straps work fine!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "Driver secures when loading.", quality: "fail", analytics: "❌ Провал!", path: "warning_strict" }
                ]
            },
            // ШАГ 6: Commitment
            {
                brokerQuestion: "Excellent! Delivery: Appointment Thursday 2 PM Miami warehouse. Strict timing for furniture. Can you commit?",
                dispatcherPrompt: "💎 Thursday 2 PM commitment!",
                suggestions: [
                    { text: "Absolutely committed Thursday 2 PM! Based on 1,380 miles, depart tomorrow 8 AM, arrive Wednesday evening with 18-hour buffer. Backup route via I-75. Furniture timing critical - will call 12 hours ahead if any delay.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Yes, committed Thursday 2 PM. Arrive Wednesday evening with buffer. Have backup route.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Yes, Thursday 2 PM works.", quality: "normal", analytics: "⚪ Нормально.", path: "warning" },
                    { text: "We'll try for Thursday 2 PM...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Traffic unpredictable with furniture.", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "Driver gets there when possible.", quality: "fail", analytics: "❌ Провал!", path: "warning_strict" }
                ]
            },
            // ШАГ 7: ТОРГ - Rate Question
            {
                brokerQuestion: "Great! What rate are you looking for on this 1,380 miles Chicago-Miami furniture load?",
                dispatcherPrompt: "💎 ТОРГ! Posted $3,450 ($2.50/mi) - просите $3,700-3,900!",
                suggestions: [
                    { text: "For 1,380 miles Chicago-Miami with furniture, I'm looking at $3,900. That's $2.83/mile - fair for dry van, furniture experience, careful handling, tight timing.", quality: "excellent", analytics: "✨ ОТЛИЧНО! $3,900 = $450 больше!", path: "master" },
                    { text: "$3,700 for this furniture load. $2.68/mile - fair with all services.", quality: "good", analytics: "✔️ Хорошо! $3,700 = $250 больше!", path: "master" },
                    { text: "$3,550 for 1,380 miles.", quality: "normal", analytics: "⚪ Нормально. $100 больше.", path: "warning" },
                    { text: "$3,500 for this load?", quality: "weak", analytics: "⚠️ Слабо! $50 больше.", path: "warning" },
                    { text: "I need $4,500 minimum! Furniture is risky!", quality: "aggressive", analytics: "🔴 Нереально!", path: "reject_rate_final" },
                    { text: "I'll take $3,450 posted.", quality: "fail", analytics: "❌ Без торга!", path: "reject_weak_final" }
                ]
            },
            // ШАГ 8: Counter Offer
            {
                brokerQuestion: "That's high. I can do $3,600. That's $2.61/mile - good for this lane.",
                dispatcherPrompt: "💎 Встречное $3,600. Просите $3,700 или примите!",
                suggestions: [
                    { text: "Can we meet at $3,700? Fair middle - you save $200 from my ask, I earn $250 above posted for professional furniture service.", quality: "excellent", analytics: "✨ ОТЛИЧНО! Компромисс!", path: "master" },
                    { text: "$3,600 works. Let's book it.", quality: "good", analytics: "✔️ Хорошо! $150 больше!", path: "master" },
                    { text: "$3,600 confirmed.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Okay, $3,600...", quality: "weak", analytics: "⚠️ Слабо.", path: "warning" },
                    { text: "$3,700 or I walk!", quality: "aggressive", analytics: "🔴 Ультиматум!", path: "reject_ultimatum_final" },
                    { text: "No, need $3,900!", quality: "fail", analytics: "❌ Отказ!", path: "reject_ultimatum_final" }
                ]
            },
            // ШАГ 9: Final Offer
            {
                brokerQuestion: "$3,650 final. That's $2.64/mile. You're professional with furniture - worth it. Deal?",
                dispatcherPrompt: "💎 ФИНАЛ! $3,650 - заработали $200!",
                suggestions: [
                    { text: "$3,650 perfect! Deal! Your furniture will arrive safe and on time.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "$3,650 is a deal!", quality: "good", analytics: "✔️ Хорошо! $200 больше!", path: "master" },
                    { text: "$3,650 confirmed.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Okay, $3,650...", quality: "weak", analytics: "⚠️ Слабо.", path: "warning" },
                    { text: "Can't you do $3,700?", quality: "aggressive", analytics: "🔴 После final!", path: "reject_final_final" },
                    { text: "$3,675? Just $25 more?", quality: "fail", analytics: "❌ Торгуется!", path: "reject_final_final" }
                ]
            },
            // ШАГ 10: Email
            {
                brokerQuestion: "Perfect! Email? I'll send rate con now. Remember - careful handling, Thursday 2 PM Miami.",
                dispatcherPrompt: "💎 Email! Подтвердите handling и timing!",
                suggestions: [
                    { text: "Perfect! dispatch@reliable.com. I'll sign in 30 minutes. Confirmed: E-track straps every 6 feet, pads between pieces, Thursday 2 PM guaranteed. Your furniture is in good hands!", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "dispatch@reliable.com. Sign today. Careful handling, Thursday 2 PM confirmed.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "dispatch@reliable.com. Will handle properly.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Let me find email...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Send anywhere. Driver knows.", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_email_final" },
                    { text: "No email... text message?", quality: "fail", analytics: "❌ Провал!", path: "reject_email_final" }
                ]
            },
            // ШАГ 11: SUCCESS OUTCOME
            {
                brokerResponse: "Excellent! Rate con sent to dispatch@reliable.com. Sign ASAP. You handled every furniture question perfectly! Adding you to preferred dry van carriers. I have 8-12 furniture loads weekly Chicago-Miami. Let's work together long-term. Good luck!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$3,650",
                    ratePerMile: "$2.64/mile",
                    relationship: "strengthened",
                    weeklyLoads: "8-12 furniture loads weekly ($29,200-43,800/week potential)",
                    feedback: `✅ ОТЛИЧНЫЕ ПЕРЕГОВОРЫ! Заработали $200 больше posted ($3,650 vs $3,450 = 5.8%).\n\n💰 ФИНАНСЫ:\n• Ставка: $3,650\n• Дизель: -$552 (172 gal × $3.21 IL→FL)\n• Чистая прибыль: $3,098 (85% от ставки)\n\n💡 УРОК: Furniture expertise = preferred carrier = 8-12 loads weekly ($116,800-175,200/месяц потенциал)!`
                }
            }
        ],

        // WARNING PATH (вежливое предупреждение)
        warning: [
            {
                brokerResponse: "⚠️ I need more confidence and details. This is high-value furniture. Can you provide clear information?",
                dispatcherPrompt: "💡 Брокер сомневается! Furniture требует надежности!",
                suggestions: [
                    { text: "I apologize! MC 556677, Reliable Transport, 25 dry vans. Van in Chicago at warehouse, E-track and straps ready. Driver 8 years furniture experience. Careful handling guaranteed. Committed Thursday 2 PM. Ready to work professionally!", quality: "excellent", analytics: "✨ Исправился полностью!", path: "master" },
                    { text: "Sorry. MC 556677, Reliable. Van in Chicago, E-track ready. Driver experienced. Thursday 2 PM ready.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "MC 556677. Van in Chicago. Ready Thursday.", quality: "normal", analytics: "⚪ Минимально исправился.", path: "master" },
                    { text: "I think everything ready...", quality: "weak", analytics: "⚠️ Не исправился!", path: "reject_weak_final" },
                    { text: "Why so many questions?", quality: "aggressive", analytics: "🔴 Стало хуже!", path: "reject_attitude_final" },
                    { text: "Not sure about details.", quality: "fail", analytics: "❌ Провал!", path: "reject_weak_final" }
                ]
            }
        ],

        // WARNING_STRICT PATH (строгое предупреждение)
        warning_strict: [
            {
                brokerResponse: "⚠️ STOP! This is high-value furniture - careful handling critical! If you want this load, answer professionally. Last chance!",
                dispatcherPrompt: "🚨 ПОСЛЕДНИЙ ШАНС! Furniture не терпит ошибок!",
                suggestions: [
                    { text: "I sincerely apologize! MC 556677, Reliable Transport, 25 dry vans specialized in furniture. Van in Chicago at warehouse, E-track and straps ready. Driver 8 years furniture experience. Careful handling guaranteed. Committed Thursday 2 PM. Ready to work professionally!", quality: "excellent", analytics: "✨ Полностью исправился!", path: "master" },
                    { text: "I apologize. MC 556677, Reliable. Van in Chicago, E-track ready. Driver experienced. Thursday 2 PM ready.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "Sorry. MC 556677. Van in Chicago. Thursday ready.", quality: "normal", analytics: "⚪ Минимально исправился!", path: "master" },
                    { text: "I said it's ready...", quality: "weak", analytics: "⚠️ Не исправился!", path: "reject_attitude_final" },
                    { text: "Fine! Whatever!", quality: "aggressive", analytics: "🔴 Еще хуже!", path: "reject_attitude_final" },
                    { text: "Can't confirm everything.", quality: "fail", analytics: "❌ Провал!", path: "reject_weak_final" }
                ]
            }
        ],

        // REJECT PATHS
        reject_weak_final: [
            {
                brokerResponse: "Sorry, I can't risk high-value furniture with uncertainty. I need reliable carrier. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Furniture требует 100% надежности! Неуверенность = поврежденный груз = потери!"
                }
            }
        ],

        reject_attitude_final: [
            {
                brokerResponse: "I don't work with unprofessional carriers on furniture. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Грубость с furniture грузом недопустима! Брокеры хотят профессионалов!"
                }
            }
        ],

        reject_timing_final: [
            {
                brokerResponse: "8 AM pickup critical for furniture schedule. I need carrier who can meet timing. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Furniture timing критичен! Опоздание = проблемы с клиентом!"
                }
            }
        ],

        reject_rate_final: [
            {
                brokerResponse: "$4,500 is way too high for this lane. I need realistic carrier. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: $4,500 нереально! Posted $3,450, можно $3,700-3,900, но не $4,500!"
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

allScenarios.push(scenario2);
console.log('✅ Scenario 2 loaded: Dry Van Furniture (Chicago → Miami) - PREMIUM QUALITY');
