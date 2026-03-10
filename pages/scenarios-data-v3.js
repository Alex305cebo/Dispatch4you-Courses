// DIALOGUE #3 - Reefer Frozen Food (PREMIUM QUALITY)
// Los Angeles CA → Dallas TX, 1,240 miles
// Posted: $3,720 ($3.00/mile), Target: $3,950-4,150
// Created: March 9, 2026
// STRUCTURE: 3-path (master, warning, warning_strict, reject_*_final)
// QUALITY: Premium - все исправления применены

console.log('🔵 Loading scenarios-data-v3.js...');

const scenario3 = {
    id: 3,
    route: "Los Angeles CA → Dallas TX",
    distance: 1240,
    equipment: "Reefer (53ft)",
    cargo: "Frozen food (ice cream, frozen meals)",
    weight: "40,000 lbs",
    postedRate: "$3,720 ($3.00/mile)",
    deadline: "Pickup today 4 PM, Delivery in 2 days",
    brokerStyle: "Professional frozen food broker - strict temp control",
    difficulty: "hard",
    initialMessage: "Good afternoon! This is David from FrozenExpress.\nI'm calling about your posted reefer load LA to Dallas with frozen food.\nIs this load still available?",

    paths: {
        master: [
            // ШАГ 1: MC, Company, Fleet
            {
                brokerQuestion: "Good afternoon! This is Rachel from ColdChain Brokers. Yes, available. What's your MC number, company name, and how many reefers do you run?",
                dispatcherPrompt: "💎 Брокер спрашивает MC, компанию и reefer fleet!",
                suggestions: [
                    { text: "Good afternoon Rachel! MC 334455, FrostLine Transport. We run 22 reefers, all 53ft with dual-temp zones. Specialized in frozen food for 9 years. What's the temp requirement?", quality: "excellent", analytics: "✨ MC, компания, 22 reefers, специализация, вопрос!", path: "master" },
                    { text: "Afternoon! MC 334455, FrostLine Transport. 22 reefers. What temp?", quality: "good", analytics: "✔️ MC, компания, fleet.", path: "master" },
                    { text: "MC 334455, FrostLine Transport.", quality: "normal", analytics: "⚪ Только MC и компания.", path: "warning" },
                    { text: "MC 334455... have reefers...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Just tell me the rate!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "Reefer available.", quality: "fail", analytics: "❌ Нет MC!", path: "warning_strict" }
                ]
            },
            // ШАГ 2: Location, Equipment
            {
                brokerQuestion: "Good! 1,240 miles LA to Dallas. Frozen food - ice cream and frozen meals, 40,000 lbs. Temp -10°F to 0°F. Where's your reefer and can you pick up today 4 PM?",
                dispatcherPrompt: "💎 Местоположение + pickup today 4 PM!",
                suggestions: [
                    { text: "Perfect! Reefer in LA at distribution center, empty since noon. Dual-temp capable, pre-cooled to -10°F. Driver ready 4 PM today. Reefer serviced 2 weeks ago. What's pickup address?", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Reefer in LA at distribution center, empty. Pre-cooled to -10°F. Driver ready 4 PM today.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Reefer in LA. Ready 4 PM.", quality: "normal", analytics: "⚪ Нормально.", path: "warning" },
                    { text: "Should be in LA... ready soon...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Tell me rate first!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "Can't be there until 6 PM.", quality: "fail", analytics: "❌ Не вовремя!", path: "warning_strict" }
                ]
            },
            // ШАГ 3: Experience, DOT
            {
                brokerQuestion: "Excellent! Driver's frozen food experience? Clean DOT? This is critical temp frozen cargo.",
                dispatcherPrompt: "💎 Опыт с frozen food + DOT!",
                suggestions: [
                    { text: "Driver has 10 years frozen food experience - ice cream, frozen meals, seafood. Understands -10°F critical. Clean DOT - last inspection 2 weeks ago, zero violations. Safety rating Satisfactory.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Driver has 10 years frozen food experience. Clean DOT, last inspection 2 weeks ago.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Driver experienced with frozen food. DOT clean.", quality: "normal", analytics: "⚪ Нормально.", path: "warning" },
                    { text: "Driver has some frozen experience...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Driver knows reefer!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "Driver has CDL.", quality: "fail", analytics: "❌ Нет опыта!", path: "warning_strict" }
                ]
            },
            // ШАГ 4: Insurance
            {
                brokerQuestion: "Good! Insurance: $100K cargo coverage for frozen food? Current certificates?",
                dispatcherPrompt: "💎 Insurance $100K для frozen food!",
                suggestions: [
                    { text: "Yes! $100K cargo coverage through Liberty Mutual. $1M liability. Certificates current, expire August 2028. Covers frozen food spoilage. I'll email after booking.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Yes, $100K cargo, $1M liability. Current certificates. Covers frozen food. Will send after booking.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "$100K cargo, $1M liability. Current.", quality: "normal", analytics: "⚪ Нормально.", path: "warning" },
                    { text: "Should have $100K...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Insurance is fine!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "$75K enough for frozen?", quality: "fail", analytics: "❌ Недостаточно!", path: "warning_strict" }
                ]
            },
            // ШАГ 5: Temp Monitoring
            {
                brokerQuestion: "Perfect! Temp monitoring: How often will you check? What if temp rises above 0°F?",
                dispatcherPrompt: "💎 Temp monitoring для frozen food!",
                suggestions: [
                    { text: "Temp monitoring every hour with digital recorder. If temp rises above 0°F, driver stops immediately, checks unit, calls me. I notify you within 15 minutes. Zero tolerance for temp issues with frozen food.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Temp check every hour. If rises, driver stops and calls. I notify you within 15 minutes.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Regular temp checks. Will notify if issues.", quality: "normal", analytics: "⚪ Нормально.", path: "warning" },
                    { text: "Driver will check temp...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Reefer works fine!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "Driver checks when he remembers.", quality: "fail", analytics: "❌ Провал!", path: "warning_strict" }
                ]
            },
            // ШАГ 6: Commitment
            {
                brokerQuestion: "Excellent! Delivery: Appointment Wednesday 6 AM Dallas cold storage. Strict timing for frozen food. Can you commit?",
                dispatcherPrompt: "💎 Wednesday 6 AM commitment!",
                suggestions: [
                    { text: "Absolutely committed Wednesday 6 AM! Based on 1,240 miles, depart today 4 PM, arrive Tuesday evening with 10-hour buffer. Backup route via I-20. Frozen timing critical - will call 12 hours ahead if any delay.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Yes, committed Wednesday 6 AM. Arrive Tuesday evening with buffer. Have backup route.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Yes, Wednesday 6 AM works.", quality: "normal", analytics: "⚪ Нормально.", path: "warning" },
                    { text: "We'll try for Wednesday 6 AM...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Traffic unpredictable with frozen.", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_strict" },
                    { text: "Driver gets there when possible.", quality: "fail", analytics: "❌ Провал!", path: "warning_strict" }
                ]
            },
            // ШАГ 7: ТОРГ - Rate Question
            {
                brokerQuestion: "Great! What rate are you looking for on this 1,240 miles LA-Dallas frozen food load?",
                dispatcherPrompt: "💎 ТОРГ! Posted $3,720 ($3.00/mi) - просите $3,950-4,150!",
                suggestions: [
                    { text: "For 1,240 miles LA-Dallas with frozen food, I'm looking at $4,150. That's $3.35/mile - fair for reefer, frozen experience, hourly temp monitoring, tight timing.", quality: "excellent", analytics: "✨ ОТЛИЧНО! $4,150 = $430 больше!", path: "master" },
                    { text: "$3,950 for this frozen load. $3.19/mile - fair with all services.", quality: "good", analytics: "✔️ Хорошо! $3,950 = $230 больше!", path: "master" },
                    { text: "$3,820 for 1,240 miles.", quality: "normal", analytics: "⚪ Нормально. $100 больше.", path: "warning" },
                    { text: "$3,770 for this load?", quality: "weak", analytics: "⚠️ Слабо! $50 больше.", path: "warning" },
                    { text: "I need $4,800 minimum! Frozen is risky!", quality: "aggressive", analytics: "🔴 Нереально!", path: "reject_rate_final" },
                    { text: "I'll take $3,720 posted.", quality: "fail", analytics: "❌ Без торга!", path: "reject_weak_final" }
                ]
            },
            // ШАГ 8: Counter Offer
            {
                brokerQuestion: "That's high. I can do $3,850. That's $3.10/mile - good for this lane.",
                dispatcherPrompt: "💎 Встречное $3,850. Просите $3,950 или примите!",
                suggestions: [
                    { text: "Can we meet at $3,950? Fair middle - you save $200 from my ask, I earn $230 above posted for professional frozen service.", quality: "excellent", analytics: "✨ ОТЛИЧНО! Компромисс!", path: "master" },
                    { text: "$3,850 works. Let's book it.", quality: "good", analytics: "✔️ Хорошо! $130 больше!", path: "master" },
                    { text: "$3,850 confirmed.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Okay, $3,850...", quality: "weak", analytics: "⚠️ Слабо.", path: "warning" },
                    { text: "$3,950 or I walk!", quality: "aggressive", analytics: "🔴 Ультиматум!", path: "reject_ultimatum_final" },
                    { text: "No, need $4,150!", quality: "fail", analytics: "❌ Отказ!", path: "reject_ultimatum_final" }
                ]
            },
            // ШАГ 9: Final Offer
            {
                brokerQuestion: "$3,900 final. That's $3.15/mile. You're professional with frozen - worth it. Deal?",
                dispatcherPrompt: "💎 ФИНАЛ! $3,900 - заработали $180!",
                suggestions: [
                    { text: "$3,900 perfect! Deal! Your frozen food will arrive perfect and on time.", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "$3,900 is a deal!", quality: "good", analytics: "✔️ Хорошо! $180 больше!", path: "master" },
                    { text: "$3,900 confirmed.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Okay, $3,900...", quality: "weak", analytics: "⚠️ Слабо.", path: "warning" },
                    { text: "Can't you do $3,950?", quality: "aggressive", analytics: "🔴 После final!", path: "reject_final_final" },
                    { text: "$3,925? Just $25 more?", quality: "fail", analytics: "❌ Торгуется!", path: "reject_final_final" }
                ]
            },
            // ШАГ 10: Email
            {
                brokerQuestion: "Perfect! Email? I'll send rate con now. Remember - temp -10°F to 0°F, Wednesday 6 AM Dallas.",
                dispatcherPrompt: "💎 Email! Подтвердите temp и timing!",
                suggestions: [
                    { text: "Perfect! dispatch@frostline.com. I'll sign in 30 minutes. Confirmed: temp -10°F to 0°F monitored hourly, Wednesday 6 AM guaranteed. Your frozen food is in good hands!", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "dispatch@frostline.com. Sign today. Temp -10°F to 0°F, Wednesday 6 AM confirmed.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "dispatch@frostline.com. Will handle properly.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Let me find email...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Send anywhere. Driver knows.", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_email_final" },
                    { text: "No email... text message?", quality: "fail", analytics: "❌ Провал!", path: "reject_email_final" }
                ]
            },
            // ШАГ 11: SUCCESS OUTCOME
            {
                brokerResponse: "Excellent! Rate con sent to dispatch@frostline.com. Sign ASAP. You handled every frozen question perfectly! Adding you to preferred reefer carriers. I have 12-15 frozen loads weekly LA-Dallas. Let's work together long-term. Good luck!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$3,900",
                    ratePerMile: "$3.15/mile",
                    relationship: "strengthened",
                    weeklyLoads: "12-15 frozen loads weekly ($46,800-58,500/week potential)",
                    feedback: `✅ ОТЛИЧНЫЕ ПЕРЕГОВОРЫ! Заработали $180 больше posted ($3,900 vs $3,720 = 4.8%).\n\n💰 ФИНАНСЫ:\n• Ставка: $3,900\n• Дизель: -$496 (155 gal × $3.20 CA→TX)\n• Чистая прибыль: $3,404 (87% от ставки)\n\n💡 УРОК: Frozen expertise = preferred carrier = 12-15 loads weekly ($187,200-234,000/месяц потенциал)!`
                }
            }
        ],

        // WARNING PATH (вежливое предупреждение)
        warning: [
            {
                brokerResponse: "⚠️ I need more confidence and details. This is critical temp frozen food. Can you provide clear information?",
                dispatcherPrompt: "💡 Брокер сомневается! Frozen food требует надежности!",
                suggestions: [
                    { text: "I apologize! MC 334455, FrostLine Transport, 22 reefers. Reefer in LA at distribution center, pre-cooled to -10°F. Driver 10 years frozen experience. Hourly temp monitoring. Committed Wednesday 6 AM. Ready to work professionally!", quality: "excellent", analytics: "✨ Исправился полностью!", path: "master" },
                    { text: "Sorry. MC 334455, FrostLine. Reefer in LA, pre-cooled. Driver experienced. Wednesday 6 AM ready.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "MC 334455. Reefer in LA. Ready Wednesday.", quality: "normal", analytics: "⚪ Минимально исправился.", path: "master" },
                    { text: "I think everything ready...", quality: "weak", analytics: "⚠️ Не исправился!", path: "reject_weak_final" },
                    { text: "Why so many questions?", quality: "aggressive", analytics: "🔴 Стало хуже!", path: "reject_attitude_final" },
                    { text: "Not sure about details.", quality: "fail", analytics: "❌ Провал!", path: "reject_weak_final" }
                ]
            }
        ],

        // WARNING_STRICT PATH (строгое предупреждение)
        warning_strict: [
            {
                brokerResponse: "⚠️ STOP! This is frozen food - temp control critical! If you want this load, answer professionally. Last chance!",
                dispatcherPrompt: "🚨 ПОСЛЕДНИЙ ШАНС! Frozen food не терпит ошибок!",
                suggestions: [
                    { text: "I sincerely apologize! MC 334455, FrostLine Transport, 22 reefers specialized in frozen. Reefer in LA at distribution center, pre-cooled to -10°F. Driver 10 years frozen experience. Hourly temp monitoring. Committed Wednesday 6 AM. Ready to work professionally!", quality: "excellent", analytics: "✨ Полностью исправился!", path: "master" },
                    { text: "I apologize. MC 334455, FrostLine. Reefer in LA, pre-cooled. Driver experienced. Wednesday 6 AM ready.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "Sorry. MC 334455. Reefer in LA. Wednesday ready.", quality: "normal", analytics: "⚪ Минимально исправился.", path: "master" },
                    { text: "I said it's ready...", quality: "weak", analytics: "⚠️ Не исправился!", path: "reject_attitude_final" },
                    { text: "Fine! Whatever!", quality: "aggressive", analytics: "🔴 Еще хуже!", path: "reject_attitude_final" },
                    { text: "Can't confirm everything.", quality: "fail", analytics: "❌ Провал!", path: "reject_weak_final" }
                ]
            }
        ],

        // REJECT PATHS
        reject_weak_final: [
            {
                brokerResponse: "Sorry, I can't risk frozen food with uncertainty. I need reliable reefer carrier. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Frozen food требует 100% надежности! Неуверенность = испорченный груз = потери!"
                }
            }
        ],

        reject_attitude_final: [
            {
                brokerResponse: "I don't work with unprofessional carriers on frozen food. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Грубость с frozen food грузом недопустима! Брокеры хотят профессионалов!"
                }
            }
        ],

        reject_timing_final: [
            {
                brokerResponse: "4 PM pickup critical for frozen schedule. I need carrier who can meet timing. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Frozen food timing критичен! Опоздание = испорченный груз!"
                }
            }
        ],

        reject_rate_final: [
            {
                brokerResponse: "$4,800 is way too high for this lane. I need realistic carrier. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: $4,800 нереально! Posted $3,720, можно $3,950-4,150, но не $4,800!"
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

allScenarios.push(scenario3);
console.log('✅ Scenario 3 loaded: Reefer Frozen Food (Los Angeles → Dallas) - PREMIUM QUALITY');
