// DIALOGUE #1 - Reefer Fresh Produce (PREMIUM QUALITY)
// Miami FL → New York NY, 1,280 miles
// Posted: $3,850 ($3.01/mile), Target: $4,100-4,300
// Created: March 9, 2026
// STRUCTURE: 3-path (master, warning, warning_strict, reject_*_final)
// QUALITY: Premium - все исправления применены

console.log('🔵 Loading scenarios-data-v1.js...');

const scenario1 = {
    id: 1,
    route: "Miami FL → New York NY",
    distance: 1280,
    equipment: "Reefer (53ft)",
    cargo: "Fresh produce (lettuce, tomatoes)",
    weight: "42,000 lbs",
    postedRate: "$3,850 ($3.01/mile)",
    deadline: "Pickup today 6 PM, Delivery in 2 days",
    brokerStyle: "Professional produce broker - time sensitive",
    difficulty: "hard",
    initialMessage: "Good afternoon! This is Sarah from FreshLoad Logistics.\nI'm calling about your posted reefer load Miami to New York with fresh produce.\nIs this load still available?",

    paths: {
        master: [
            // ШАГ 1: MC, Company, Fleet
            {
                brokerQuestion: "Good afternoon! This is Tom from ProduceDirect. Yes, available. What's your MC number, company name, and how many reefers do you run?",
                dispatcherPrompt: "💎 Брокер спрашивает MC, компанию и reefer fleet!",
                suggestions: [
                    { text: "Good afternoon Tom! MC 778899, ColdChain Express. We run 18 reefers, all 53ft with multi-temp zones. Specialized in produce for 5 years. What's the temp requirement?", quality: "excellent", analytics: "✨ MC, компания, 18 reefers, специализация, вопрос!", path: "master" },
                    { text: "Afternoon! MC 778899, ColdChain Express. 18 reefers. What's temp?", quality: "good", analytics: "✔️ MC, компания, fleet.", path: "master" },
                    { text: "MC 778899, ColdChain Express.", quality: "normal", analytics: "⚪ Только MC и компания.", path: "warning" },
                    { text: "MC 778899... have reefers...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Just tell me the rate!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "Reefer available.", quality: "fail", analytics: "❌ Нет MC!", path: "warning_strict" }
                ]
            },
            // ШАГ 2: Location, Equipment
            {
                brokerQuestion: "Good! 1,280 miles Miami to NY. Fresh produce - lettuce and tomatoes, 42,000 lbs. Temp 34-36°F. Where's your reefer and can you pick up today 6 PM?",
                dispatcherPrompt: "💎 Местоположение + pickup today 6 PM!",
                suggestions: [
                    { text: "Perfect! Reefer in Miami at Port, empty since this morning. Multi-temp capable, pre-cooled to 34°F. Driver ready 6 PM today. Reefer serviced last week. What's pickup address?", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Reefer in Miami at Port, empty. Pre-cooled to 34°F. Driver ready 6 PM today.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Reefer in Miami. Ready 6 PM.", quality: "normal", analytics: "⚪ Нормально.", path: "warning" },
                    { text: "Should be in Miami... ready soon...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Tell me rate first!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "Can't be there until 8 PM.", quality: "fail", analytics: "❌ Не вовремя!", path: "warning_strict" }
                ]
            },
            // ШАГ 3: Experience, DOT
            {
                brokerQuestion: "Excellent! Driver's produce experience? Clean DOT? This is time-sensitive fresh produce.",
                dispatcherPrompt: "💎 Опыт с produce + DOT!",
                suggestions: [
                    { text: "Driver has 6 years produce experience - lettuce, tomatoes, berries. Understands temp control critical. Clean DOT - last inspection 2 weeks ago, zero violations. Safety rating Satisfactory.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Driver has 6 years produce experience. Clean DOT, last inspection 2 weeks ago.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Driver experienced with produce. DOT clean.", quality: "normal", analytics: "⚪ Нормально.", path: "warning" },
                    { text: "Driver has some produce experience...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Driver knows reefer!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "Driver has CDL.", quality: "fail", analytics: "❌ Нет опыта!", path: "warning_strict" }
                ]
            },
            // ШАГ 4: Insurance
            {
                brokerQuestion: "Good! Insurance: $100K cargo coverage for produce? Current certificates?",
                dispatcherPrompt: "💎 Insurance $100K для produce!",
                suggestions: [
                    { text: "Yes! $100K cargo coverage through Nationwide. $1M liability. Certificates current, expire June 2028. Covers produce spoilage. I'll email after booking.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Yes, $100K cargo, $1M liability. Current certificates. Covers produce. Will send after booking.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "$100K cargo, $1M liability. Current.", quality: "normal", analytics: "⚪ Нормально.", path: "warning" },
                    { text: "Should have $100K...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Insurance is fine!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "$75K enough for produce?", quality: "fail", analytics: "❌ Недостаточно!", path: "warning_strict" }
                ]
            },
            // ШАГ 5: Temp Monitoring
            {
                brokerQuestion: "Perfect! Temp monitoring: How often will you check? What if temp rises?",
                dispatcherPrompt: "💎 Temp monitoring для produce!",
                suggestions: [
                    { text: "Temp monitoring every 2 hours with digital recorder. If temp rises above 36°F, driver stops immediately, checks unit, calls me. I notify you within 30 minutes. Zero tolerance for temp issues with produce.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Temp check every 2 hours. If rises, driver stops and calls. I notify you within 30 minutes.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Regular temp checks. Will notify if issues.", quality: "normal", analytics: "⚪ Нормально.", path: "warning" },
                    { text: "Driver will check temp...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Reefer works fine!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "Driver checks when he remembers.", quality: "fail", analytics: "❌ Провал!", path: "warning_strict" }
                ]
            },
            // ШАГ 6: Commitment
            {
                brokerQuestion: "Excellent! Delivery: Appointment Friday 8 AM Hunts Point Market NY. Strict timing for produce. Can you commit?",
                dispatcherPrompt: "💎 Friday 8 AM commitment!",
                suggestions: [
                    { text: "Absolutely committed Friday 8 AM! Based on 1,280 miles, depart today 6 PM, arrive Thursday evening with 12-hour buffer. Backup route via I-95. Produce timing critical - will call 12 hours ahead if any delay.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Yes, committed Friday 8 AM. Arrive Thursday evening with buffer. Have backup route.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Yes, Friday 8 AM works.", quality: "normal", analytics: "⚪ Нормально.", path: "warning" },
                    { text: "We'll try for Friday 8 AM...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Traffic unpredictable with produce.", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "Driver gets there when possible.", quality: "fail", analytics: "❌ Провал!", path: "warning_strict" }
                ]
            },
            // ШАГ 7: ТОРГ - Rate Question
            {
                brokerQuestion: "Great! What rate are you looking for on this 1,280 miles Miami-NY produce load?",
                dispatcherPrompt: "💎 ТОРГ! Posted $3,850 ($3.01/mi) - просите $4,100-4,300!",
                suggestions: [
                    { text: "For 1,280 miles Miami-NY with fresh produce, I'm looking at $4,300. That's $3.36/mile - fair for reefer, produce experience, temp monitoring, tight timing.", quality: "excellent", analytics: "✨ ОТЛИЧНО! $4,300 = $450 больше!", path: "master" },
                    { text: "$4,100 for this produce load. $3.20/mile - fair with all services.", quality: "good", analytics: "✔️ Хорошо! $4,100 = $250 больше!", path: "master" },
                    { text: "$3,950 for 1,280 miles.", quality: "normal", analytics: "⚪ Нормально. $100 больше.", path: "warning" },
                    { text: "$3,900 for this load?", quality: "weak", analytics: "⚠️ Слабо! $50 больше.", path: "warning" },
                    { text: "I need $5,000 minimum! Produce is risky!", quality: "aggressive", analytics: "🔴 Нереально!", path: "reject_rate_final" },
                    { text: "I'll take $3,850 posted.", quality: "fail", analytics: "❌ Без торга!", path: "reject_weak_final" }
                ]
            },
            // ШАГ 8: Counter Offer
            {
                brokerQuestion: "That's high. I can do $4,000. That's $3.13/mile - good for this lane.",
                dispatcherPrompt: "💎 Встречное $4,000. Просите $4,100 или примите!",
                suggestions: [
                    { text: "Can we meet at $4,100? Fair middle - you save $200 from my ask, I earn $250 above posted for professional produce service.", quality: "excellent", analytics: "✨ ОТЛИЧНО! Компромисс!", path: "master" },
                    { text: "$4,000 works. Let's book it.", quality: "good", analytics: "✔️ Хорошо! $150 больше!", path: "master" },
                    { text: "$4,000 confirmed.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Okay, $4,000...", quality: "weak", analytics: "⚠️ Слабо.", path: "warning" },
                    { text: "$4,100 or I walk!", quality: "aggressive", analytics: "🔴 Ультиматум!", path: "reject_ultimatum_final" },
                    { text: "No, need $4,300!", quality: "fail", analytics: "❌ Отказ!", path: "reject_ultimatum_final" }
                ]
            },
            // ШАГ 9: Final Offer
            {
                brokerQuestion: "$4,050 final. That's $3.16/mile. You're professional with produce - worth it. Deal?",
                dispatcherPrompt: "💎 ФИНАЛ! $4,050 - заработали $200!",
                suggestions: [
                    { text: "$4,050 perfect! Deal! Your produce will arrive fresh and on time.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "$4,050 is a deal!", quality: "good", analytics: "✔️ Хорошо! $200 больше!", path: "master" },
                    { text: "$4,050 confirmed.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Okay, $4,050...", quality: "weak", analytics: "⚠️ Слабо.", path: "warning" },
                    { text: "Can't you do $4,100?", quality: "aggressive", analytics: "🔴 После final!", path: "reject_final_final" },
                    { text: "$4,075? Just $25 more?", quality: "fail", analytics: "❌ Торгуется!", path: "reject_final_final" }
                ]
            },
            // ШАГ 10: Email
            {
                brokerQuestion: "Perfect! Email? I'll send rate con now. Remember - temp 34-36°F, Friday 8 AM Hunts Point.",
                dispatcherPrompt: "💎 Email! Подтвердите temp и timing!",
                suggestions: [
                    { text: "Perfect! dispatch@coldchain.com. I'll sign in 30 minutes. Confirmed: temp 34-36°F monitored every 2 hours, Friday 8 AM Hunts Point guaranteed. Your produce is in good hands!", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "dispatch@coldchain.com. Sign today. Temp 34-36°F, Friday 8 AM confirmed.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "dispatch@coldchain.com. Will handle properly.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Let me find email...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Send anywhere. Driver knows.", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_email_final" },
                    { text: "No email... text message?", quality: "fail", analytics: "❌ Провал!", path: "reject_email_final" }
                ]
            },
            // ШАГ 11: SUCCESS OUTCOME
            {
                brokerResponse: "Excellent! Rate con sent to dispatch@coldchain.com. Sign ASAP. You handled every produce question perfectly! Adding you to preferred reefer carriers. I have 10-15 produce loads weekly Miami-NY. Let's work together long-term. Good luck!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$4,050",
                    ratePerMile: "$3.16/mile",
                    relationship: "strengthened",
                    weeklyLoads: "10-15 produce loads weekly ($40,500-60,750/week potential)",
                    feedback: `✅ ОТЛИЧНЫЕ ПЕРЕГОВОРЫ! Заработали $200 больше posted ($4,050 vs $3,850 = 5.2%).\n\n💰 ФИНАНСЫ:\n• Ставка: $4,050\n• Дизель: -$512 (160 gal × $3.20 FL→NY)\n• Чистая прибыль: $3,538 (87% от ставки)\n\n💡 УРОК: Produce expertise = preferred carrier = 10-15 loads weekly ($162,000-243,000/месяц потенциал)!`
                }
            }
        ],

        // WARNING PATH (вежливое предупреждение)
        warning: [
            {
                brokerResponse: "⚠️ I need more confidence and details. This is time-sensitive fresh produce. Can you provide clear information?",
                dispatcherPrompt: "💡 Брокер сомневается! Produce требует надежности!",
                suggestions: [
                    { text: "I apologize! MC 778899, ColdChain Express, 18 reefers. Reefer in Miami at Port, pre-cooled to 34°F. Driver 6 years produce experience. Temp monitoring every 2 hours. Committed Friday 8 AM. Ready to work professionally!", quality: "excellent", analytics: "✨ Исправился полностью!", path: "master" },
                    { text: "Sorry. MC 778899, ColdChain. Reefer in Miami, pre-cooled. Driver experienced. Friday 8 AM ready.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "MC 778899. Reefer in Miami. Ready Friday.", quality: "normal", analytics: "⚪ Минимально исправился.", path: "master" },
                    { text: "I think everything ready...", quality: "weak", analytics: "⚠️ Не исправился!", path: "reject_weak_final" },
                    { text: "Why so many questions?", quality: "aggressive", analytics: "🔴 Стало хуже!", path: "reject_attitude_final" },
                    { text: "Not sure about details.", quality: "fail", analytics: "❌ Провал!", path: "reject_weak_final" }
                ]
            }
        ],

        // WARNING_STRICT PATH (строгое предупреждение)
        warning_strict: [
            {
                brokerResponse: "⚠️ STOP! This is fresh produce - time and temp critical! If you want this load, answer professionally. Last chance!",
                dispatcherPrompt: "🚨 ПОСЛЕДНИЙ ШАНС! Produce не терпит ошибок!",
                suggestions: [
                    { text: "I sincerely apologize! MC 778899, ColdChain Express, 18 reefers specialized in produce. Reefer in Miami at Port, pre-cooled to 34°F. Driver 6 years produce experience. Temp monitoring every 2 hours. Committed Friday 8 AM. Ready to work professionally!", quality: "excellent", analytics: "✨ Полностью исправился!", path: "master" },
                    { text: "I apologize. MC 778899, ColdChain. Reefer in Miami, pre-cooled. Driver experienced. Friday 8 AM ready.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "Sorry. MC 778899. Reefer in Miami. Friday ready.", quality: "normal", analytics: "⚪ Минимально исправился.", path: "master" },
                    { text: "I said it's ready...", quality: "weak", analytics: "⚠️ Не исправился!", path: "reject_attitude_final" },
                    { text: "Fine! Whatever!", quality: "aggressive", analytics: "🔴 Еще хуже!", path: "reject_attitude_final" },
                    { text: "Can't confirm everything.", quality: "fail", analytics: "❌ Провал!", path: "reject_weak_final" }
                ]
            }
        ],

        // REJECT PATHS
        reject_weak_final: [
            {
                brokerResponse: "Sorry, I can't risk fresh produce with uncertainty. I need reliable reefer carrier. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Produce требует 100% надежности! Неуверенность = испорченный груз = потери!"
                }
            }
        ],

        reject_attitude_final: [
            {
                brokerResponse: "I don't work with unprofessional carriers on produce. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Грубость с produce грузом недопустима! Брокеры хотят профессионалов!"
                }
            }
        ],

        reject_timing_final: [
            {
                brokerResponse: "6 PM pickup critical for produce schedule. I need carrier who can meet timing. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Produce timing критичен! Опоздание = испорченный груз!"
                }
            }
        ],

        reject_rate_final: [
            {
                brokerResponse: "$5,000 is way too high for this lane. I need realistic carrier. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: $5,000 нереально! Posted $3,850, можно $4,100-4,300, но не $5,000!"
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

allScenarios.push(scenario1);
console.log('✅ Scenario 1 loaded: Reefer Fresh Produce (Miami → New York) - PREMIUM QUALITY');
