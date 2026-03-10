// DIALOGUE #5 - Flatbed Steel Coils (PREMIUM QUALITY)
// Pittsburgh PA → Houston TX, 1,320 miles
// Posted: $4,620 ($3.50/mile), Target: $4,900-5,100
// Created: March 9, 2026
// STRUCTURE: 3-path (master, warning, warning_strict, reject_*_final)
// QUALITY: Premium - все исправления применены

console.log('🔵 Loading scenarios-data-v5.js...');

const scenario5 = {
    id: 5,
    route: "Pittsburgh PA → Houston TX",
    distance: 1320,
    equipment: "Flatbed (48ft)",
    cargo: "Steel coils (industrial grade)",
    weight: "44,000 lbs",
    postedRate: "$4,620 ($3.50/mile)",
    deadline: "Pickup tomorrow 7 AM, Delivery in 3 days",
    brokerStyle: "Professional flatbed broker - heavy cargo specialist",
    difficulty: "hard",
    initialMessage: "Good morning! This is Chris from SteelHaul Logistics.\nI'm calling about your posted flatbed load Pittsburgh to Houston with steel coils.\nIs this load still available?",

    paths: {
        master: [
            // ШАГ 1: MC, Company, Fleet
            {
                brokerQuestion: "Good morning! This is Amanda from HeavyLoad Brokers. Yes, available. What's your MC number, company name, and how many flatbeds do you run?",
                dispatcherPrompt: "💎 Брокер спрашивает MC, компанию и flatbed fleet!",
                suggestions: [
                    { text: "Good morning Amanda! MC 998877, IronHaul Transport. We run 15 flatbeds, all 48ft with chains, binders, and tarps. Specialized in steel for 11 years. What's the coil specs?", quality: "excellent", analytics: "✨ MC, компания, 15 flatbeds, специализация, вопрос!", path: "master" },
                    { text: "Morning! MC 998877, IronHaul Transport. 15 flatbeds. What specs?", quality: "good", analytics: "✔️ MC, компания, fleet.", path: "master" },
                    { text: "MC 998877, IronHaul Transport.", quality: "normal", analytics: "⚪ Только MC и компания.", path: "warning" },
                    { text: "MC 998877... have flatbeds...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Just tell me the rate!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "Flatbed available.", quality: "fail", analytics: "❌ Нет MC!", path: "warning_strict" }
                ]
            },
            // ШАГ 2: Location, Equipment
            {
                brokerQuestion: "Good! 1,320 miles Pittsburgh to Houston. Steel coils - 44,000 lbs, 6 coils. Need chains, binders, tarps. Where's your flatbed and can you pick up tomorrow 7 AM?",
                dispatcherPrompt: "💎 Местоположение + pickup tomorrow 7 AM!",
                suggestions: [
                    { text: "Perfect! Flatbed in Pittsburgh at steel mill, empty since yesterday. 20 chains, 10 binders, heavy-duty tarps. Driver ready 7 AM tomorrow. Flatbed inspected last week. What's pickup address?", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Flatbed in Pittsburgh at steel mill, empty. Chains, binders, tarps ready. Driver ready 7 AM tomorrow.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Flatbed in Pittsburgh. Ready 7 AM.", quality: "normal", analytics: "⚪ Нормально.", path: "warning" },
                    { text: "Should be in Pittsburgh... ready soon...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Tell me rate first!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "Can't be there until 9 AM.", quality: "fail", analytics: "❌ Не вовремя!", path: "warning_strict" }
                ]
            },
            // ШАГ 3: Experience, DOT
            {
                brokerQuestion: "Excellent! Driver's steel coil experience? Clean DOT? This is heavy cargo.",
                dispatcherPrompt: "💎 Опыт с steel coils + DOT!",
                suggestions: [
                    { text: "Driver has 12 years steel coil experience - knows proper chaining and weight distribution. Clean DOT - last inspection 2 weeks ago, zero violations. Safety rating Satisfactory.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Driver has 12 years steel coil experience. Clean DOT, last inspection 2 weeks ago.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Driver experienced with steel coils. DOT clean.", quality: "normal", analytics: "⚪ Нормально.", path: "warning" },
                    { text: "Driver has some steel experience...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Driver knows flatbed!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "Driver has CDL.", quality: "fail", analytics: "❌ Нет опыта!", path: "warning_strict" }
                ]
            },
            // ШАГ 4: Insurance
            {
                brokerQuestion: "Good! Insurance: $100K cargo coverage for steel? Current certificates?",
                dispatcherPrompt: "💎 Insurance $100K для steel!",
                suggestions: [
                    { text: "Yes! $100K cargo coverage through State Farm. $1M liability. Certificates current, expire October 2028. Covers steel damage. I'll email after booking.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Yes, $100K cargo, $1M liability. Current certificates. Covers steel. Will send after booking.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "$100K cargo, $1M liability. Current.", quality: "normal", analytics: "⚪ Нормально.", path: "warning" },
                    { text: "Should have $100K...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Insurance is fine!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "$75K enough for steel?", quality: "fail", analytics: "❌ Недостаточно!", path: "warning_strict" }
                ]
            },
            // ШАГ 5: Securement
            {
                brokerQuestion: "Perfect! Securement: How will you chain steel coils? What's your process?",
                dispatcherPrompt: "💎 Securement для steel coils!",
                suggestions: [
                    { text: "Steel coils secured with 4 chains per coil minimum, proper angle through eye. Binders tight, tarps over all. Driver checks chains every 50 miles. If any loosening, driver stops immediately, re-tightens, calls me. I notify you within 20 minutes.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "4 chains per coil, proper angle. Binders tight, tarps over. Driver checks every 50 miles. If loose, driver stops and calls. I notify you within 20 minutes.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Chains and binders. Will notify if issues.", quality: "normal", analytics: "⚪ Нормально.", path: "warning" },
                    { text: "Driver will chain properly...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Chains work fine!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "Driver chains when loading.", quality: "fail", analytics: "❌ Провал!", path: "warning_strict" }
                ]
            },
            // ШАГ 6: Commitment
            {
                brokerQuestion: "Excellent! Delivery: Appointment Thursday 10 AM Houston steel yard. Strict timing for steel. Can you commit?",
                dispatcherPrompt: "💎 Thursday 10 AM commitment!",
                suggestions: [
                    { text: "Absolutely committed Thursday 10 AM! Based on 1,320 miles, depart tomorrow 7 AM, arrive Wednesday evening with 15-hour buffer. Backup route via I-70/I-44. Steel timing critical - will call 12 hours ahead if any delay.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Yes, committed Thursday 10 AM. Arrive Wednesday evening with buffer. Have backup route.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Yes, Thursday 10 AM works.", quality: "normal", analytics: "⚪ Нормально.", path: "warning" },
                    { text: "We'll try for Thursday 10 AM...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Traffic unpredictable with steel.", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "Driver gets there when possible.", quality: "fail", analytics: "❌ Провал!", path: "warning_strict" }
                ]
            },
            // ШАГ 7: ТОРГ - Rate Question
            {
                brokerQuestion: "Great! What rate are you looking for on this 1,320 miles Pittsburgh-Houston steel load?",
                dispatcherPrompt: "💎 ТОРГ! Posted $4,620 ($3.50/mi) - просите $4,900-5,100!",
                suggestions: [
                    { text: "For 1,320 miles Pittsburgh-Houston with steel coils, I'm looking at $5,100. That's $3.86/mile - fair for flatbed, steel experience, proper securement, tight timing.", quality: "excellent", analytics: "✨ ОТЛИЧНО! $5,100 = $480 больше!", path: "master" },
                    { text: "$4,900 for this steel load. $3.71/mile - fair with all services.", quality: "good", analytics: "✔️ Хорошо! $4,900 = $280 больше!", path: "master" },
                    { text: "$4,720 for 1,320 miles.", quality: "normal", analytics: "⚪ Нормально. $100 больше.", path: "warning" },
                    { text: "$4,670 for this load?", quality: "weak", analytics: "⚠️ Слабо! $50 больше.", path: "warning" },
                    { text: "I need $6,000 minimum! Steel is risky!", quality: "aggressive", analytics: "🔴 Нереально!", path: "reject_rate_final" },
                    { text: "I'll take $4,620 posted.", quality: "fail", analytics: "❌ Без торга!", path: "reject_weak_final" }
                ]
            },
            // ШАГ 8: Counter Offer
            {
                brokerQuestion: "That's high. I can do $4,800. That's $3.64/mile - good for this lane.",
                dispatcherPrompt: "💎 Встречное $4,800. Просите $4,900 или примите!",
                suggestions: [
                    { text: "Can we meet at $4,900? Fair middle - you save $200 from my ask, I earn $280 above posted for professional steel service.", quality: "excellent", analytics: "✨ ОТЛИЧНО! Компромисс!", path: "master" },
                    { text: "$4,800 works. Let's book it.", quality: "good", analytics: "✔️ Хорошо! $180 больше!", path: "master" },
                    { text: "$4,800 confirmed.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Okay, $4,800...", quality: "weak", analytics: "⚠️ Слабо.", path: "warning" },
                    { text: "$4,900 or I walk!", quality: "aggressive", analytics: "🔴 Ультиматум!", path: "reject_ultimatum_final" },
                    { text: "No, need $5,100!", quality: "fail", analytics: "❌ Отказ!", path: "reject_ultimatum_final" }
                ]
            },
            // ШАГ 9: Final Offer
            {
                brokerQuestion: "$4,850 final. That's $3.67/mile. You're professional with steel - worth it. Deal?",
                dispatcherPrompt: "💎 ФИНАЛ! $4,850 - заработали $230!",
                suggestions: [
                    { text: "$4,850 perfect! Deal! Your steel will arrive safe and on time.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "$4,850 is a deal!", quality: "good", analytics: "✔️ Хорошо! $230 больше!", path: "master" },
                    { text: "$4,850 confirmed.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Okay, $4,850...", quality: "weak", analytics: "⚠️ Слабо.", path: "warning" },
                    { text: "Can't you do $4,900?", quality: "aggressive", analytics: "🔴 После final!", path: "reject_final_final" },
                    { text: "$4,875? Just $25 more?", quality: "fail", analytics: "❌ Торгуется!", path: "reject_final_final" }
                ]
            },
            // ШАГ 10: Email
            {
                brokerQuestion: "Perfect! Email? I'll send rate con now. Remember - 4 chains per coil, Thursday 10 AM Houston.",
                dispatcherPrompt: "💎 Email! Подтвердите securement и timing!",
                suggestions: [
                    { text: "Perfect! dispatch@ironhaul.com. I'll sign in 30 minutes. Confirmed: 4 chains per coil minimum, checks every 50 miles, Thursday 10 AM guaranteed. Your steel is in good hands!", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "dispatch@ironhaul.com. Sign today. 4 chains per coil, Thursday 10 AM confirmed.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "dispatch@ironhaul.com. Will handle properly.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Let me find email...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Send anywhere. Driver knows.", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_email_final" },
                    { text: "No email... text message?", quality: "fail", analytics: "❌ Провал!", path: "reject_email_final" }
                ]
            },
            // ШАГ 11: SUCCESS OUTCOME
            {
                brokerResponse: "Excellent! Rate con sent to dispatch@ironhaul.com. Sign ASAP. You handled every steel question perfectly! Adding you to preferred flatbed carriers. I have 8-10 steel loads weekly Pittsburgh-Houston. Let's work together long-term. Good luck!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$4,850",
                    ratePerMile: "$3.67/mile",
                    relationship: "strengthened",
                    weeklyLoads: "8-10 steel loads weekly ($38,800-48,500/week potential)",
                    feedback: `✅ ОТЛИЧНЫЕ ПЕРЕГОВОРЫ! Заработали $230 больше posted ($4,850 vs $4,620 = 5.0%).\n\n💰 ФИНАНСЫ:\n• Ставка: $4,850\n• Дизель: -$528 (165 gal × $3.20 PA→TX)\n• Чистая прибыль: $4,322 (89% от ставки)\n\n💡 УРОК: Steel expertise = preferred carrier = 8-10 loads weekly ($155,200-194,000/месяц потенциал)!`
                }
            }
        ],

        // WARNING PATH (вежливое предупреждение)
        warning: [
            {
                brokerResponse: "⚠️ I need more confidence and details. This is heavy steel cargo. Can you provide clear information?",
                dispatcherPrompt: "💡 Брокер сомневается! Steel требует надежности!",
                suggestions: [
                    { text: "I apologize! MC 998877, IronHaul Transport, 15 flatbeds. Flatbed in Pittsburgh at steel mill, chains and binders ready. Driver 12 years steel experience. Checks chains every 50 miles. Committed Thursday 10 AM. Ready to work professionally!", quality: "excellent", analytics: "✨ Исправился полностью!", path: "master" },
                    { text: "Sorry. MC 998877, IronHaul. Flatbed in Pittsburgh, chains ready. Driver experienced. Thursday 10 AM ready.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "MC 998877. Flatbed in Pittsburgh. Ready Thursday.", quality: "normal", analytics: "⚪ Минимально исправился.", path: "master" },
                    { text: "I think everything ready...", quality: "weak", analytics: "⚠️ Не исправился!", path: "reject_weak_final" },
                    { text: "Why so many questions?", quality: "aggressive", analytics: "🔴 Стало хуже!", path: "reject_attitude_final" },
                    { text: "Not sure about details.", quality: "fail", analytics: "❌ Провал!", path: "reject_weak_final" }
                ]
            }
        ],

        // WARNING_STRICT PATH (строгое предупреждение)
        warning_strict: [
            {
                brokerResponse: "⚠️ STOP! This is heavy steel - proper securement critical! If you want this load, answer professionally. Last chance!",
                dispatcherPrompt: "🚨 ПОСЛЕДНИЙ ШАНС! Steel не терпит ошибок!",
                suggestions: [
                    { text: "I sincerely apologize! MC 998877, IronHaul Transport, 15 flatbeds specialized in steel. Flatbed in Pittsburgh at steel mill, chains and binders ready. Driver 12 years steel experience. Checks chains every 50 miles. Committed Thursday 10 AM. Ready to work professionally!", quality: "excellent", analytics: "✨ Полностью исправился!", path: "master" },
                    { text: "I apologize. MC 998877, IronHaul. Flatbed in Pittsburgh, chains ready. Driver experienced. Thursday 10 AM ready.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "Sorry. MC 998877. Flatbed in Pittsburgh. Thursday ready.", quality: "normal", analytics: "⚪ Минимально исправился.", path: "master" },
                    { text: "I said it's ready...", quality: "weak", analytics: "⚠️ Не исправился!", path: "reject_attitude_final" },
                    { text: "Fine! Whatever!", quality: "aggressive", analytics: "🔴 Еще хуже!", path: "reject_attitude_final" },
                    { text: "Can't confirm everything.", quality: "fail", analytics: "❌ Провал!", path: "reject_weak_final" }
                ]
            }
        ],

        // REJECT PATHS
        reject_weak_final: [
            {
                brokerResponse: "Sorry, I can't risk heavy steel with uncertainty. I need reliable flatbed carrier. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Steel требует 100% надежности! Неуверенность = опасность на дороге!"
                }
            }
        ],

        reject_attitude_final: [
            {
                brokerResponse: "I don't work with unprofessional carriers on steel. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Грубость с steel грузом недопустима! Брокеры хотят профессионалов!"
                }
            }
        ],

        reject_timing_final: [
            {
                brokerResponse: "7 AM pickup critical for steel schedule. I need carrier who can meet timing. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Steel timing критичен! Опоздание = проблемы с производством!"
                }
            }
        ],

        reject_rate_final: [
            {
                brokerResponse: "$6,000 is way too high for this lane. I need realistic carrier. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: $6,000 нереально! Posted $4,620, можно $4,900-5,100, но не $6,000!"
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

allScenarios.push(scenario5);
console.log('✅ Scenario 5 loaded: Flatbed Steel Coils (Pittsburgh → Houston) - PREMIUM QUALITY');
