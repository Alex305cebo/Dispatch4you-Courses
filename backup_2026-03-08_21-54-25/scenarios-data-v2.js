// DIALOGUE #2 - Dry Van Electronics
// Atlanta GA → Miami FL, 650 miles
// Posted: $1,750 ($2.69/mile), Target: $1,900-2,000
// Created: March 8, 2026

console.log('🔵 Loading scenarios-data-v2.js...');

const scenario2 = {
    id: 2,
    route: "Atlanta GA → Miami FL",
    distance: 650,
    equipment: "Dry Van (53ft)",
    cargo: "Electronics (laptops, monitors)",
    weight: "35,000 lbs",
    postedRate: "$1,750 ($2.69/mile)",
    deadline: "Pickup tomorrow 9 AM, Delivery in 2 days",
    brokerStyle: "Professional electronics freight broker",
    difficulty: "medium",
    initialMessage: "Good afternoon! This is Jessica from TechHaul Express.\nI'm calling about your posted dry van load Atlanta to Miami with electronics.\nIs this load still available?",

    paths: {
        master: [
            {
                brokerQuestion: "Good afternoon! This is Rachel from ElectroFreight Brokers.\nYes, still available.\nWhat's your MC number and do you have experience with high-value electronics?",
                dispatcherPrompt: "💎 Брокер проверяет компанию и опыт с electronics. Дайте: MC, компания, опыт, местоположение!",
                suggestions: [
                    { text: "Good afternoon Rachel! MC 334455, TechHaul Express. We specialize in electronics - 18 dry vans with air-ride suspension and climate control. Van in Atlanta at distribution center, empty since this morning. Driver has 3 years experience with high-value electronics, understands careful handling. Van equipped with load bars and blankets for protection. Ready for 9 AM pickup. What's the exact cargo value and any special handling requirements?", quality: "excellent", analytics: "✨ ОТЛИЧНО! MC, компания, специализация, fleet с air-ride, местоположение, опыт водителя, equipment для защиты, готовность, вопросы!", path: "master" },
                    { text: "Afternoon! MC 334455, TechHaul Express. Dry van with air-ride in Atlanta. Driver experienced with electronics. Van has load bars and blankets. Ready 9 AM. What's the cargo details?", quality: "good", analytics: "✔️ Хорошо! MC, компания, air-ride, опыт, equipment, вопрос.", path: "master" },
                    { text: "MC 334455, TechHaul Express. Dry van in Atlanta. Ready tomorrow.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "MC 334455... van should be in Atlanta... driver has some experience...", quality: "weak", analytics: "⚠️ Слабо! Неуверенность!", path: "weak" },
                    { text: "Why need electronics experience? Just tell me the rate!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_path" },
                    { text: "Van available. What's the load?", quality: "fail", analytics: "❌ Провал! Нет MC и опыта!", path: "warning_path" }
                ]
            },
            {
                brokerQuestion: "MC verified, good. Perfect!\n\n650 miles Atlanta to Miami. Electronics - laptops and monitors, 35,000 lbs, cargo value $250K. Pickup tomorrow 9 AM, delivery in 2 days. Requires careful handling, no rough roads. Can you handle high-value electronics safely?",
                dispatcherPrompt: "💎 High-value electronics! Подтвердите: 650 mi, 35K lbs, $250K value, careful handling!",
                suggestions: [
                    { text: "Perfect! 650 miles in 2 days with electronics - absolutely no problem. We handle high-value electronics regularly, understand fragility. Our van has air-ride suspension for smooth transport, climate control to prevent damage. Driver will avoid rough roads, secure cargo with load bars and blankets. Ready 9 AM sharp. What's the loading time? Any specific delivery window in Miami?", quality: "excellent", analytics: "✨ ОТЛИЧНО! Подтверждение, опыт с electronics, понимание fragility, air-ride, climate control, careful handling, готовность, вопросы!", path: "master" },
                    { text: "Yes, 650 miles in 2 days works. We handle electronics regularly. Van has air-ride and climate control. Driver will handle carefully. Ready 9 AM. What's delivery window?", quality: "good", analytics: "✔️ Хорошо! Подтверждение, опыт, equipment, вопрос.", path: "master" },
                    { text: "We can handle it. Van ready for electronics. Ready 9 AM.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "I think we can do electronics... van should be okay...", quality: "weak", analytics: "⚠️ Слабо! Неуверенность!", path: "weak" },
                    { text: "Just electronics? Easy. What's your rate?", quality: "aggressive", analytics: "🔴 Агрессивно! Пренебрежение electronics требованиями!", path: "reject_attitude" },
                    { text: "Driver can't be there until 11 AM... 9 AM too early.", quality: "fail", analytics: "❌ Провал! Не может вовремя!", path: "reject_timing" }
                ]
            },
            {
                brokerQuestion: "Loading 2 hours, unloading 2 hours. Electronics require careful handling. Is your insurance current? Need $250K cargo coverage for high-value electronics. Also, does your van have air-ride suspension?",
                dispatcherPrompt: "💎 Insurance + air-ride. Дайте: insurance $250K, air-ride confirmation!",
                suggestions: [
                    { text: "Perfect! 2 hours loading/unloading - standard for electronics, no problem. Yes, $250K cargo insurance through Progressive Commercial with electronics coverage. Certificate current, expires October 2027. Van has air-ride suspension, serviced last month. I'll email insurance cert and van specs after booking. What's your email?", quality: "excellent", analytics: "✨ ОТЛИЧНО! Подтверждение времени, insurance $250K с electronics coverage, air-ride с service, готовность отправить!", path: "master" },
                    { text: "2 hours confirmed. Yes, $250K cargo insurance with electronics coverage through Progressive. Current and valid. Van has air-ride suspension. I'll send certificates.", quality: "good", analytics: "✔️ Хорошо! Insurance, air-ride, готовность.", path: "master" },
                    { text: "Yes, $250K insurance with electronics coverage. Van has air-ride.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "I think insurance covers electronics... van should have air-ride...", quality: "weak", analytics: "⚠️ Слабо! Неуверенность!", path: "weak" },
                    { text: "Insurance is fine! Let's talk rate.", quality: "aggressive", analytics: "🔴 Агрессивно! Отказ обсуждать!", path: "reject_insurance" },
                    { text: "We have $100K coverage... is that enough for electronics?", quality: "fail", analytics: "❌ Провал! Недостаточная страховка!", path: "reject_insurance" }
                ]
            },
            {
                brokerQuestion: "Excellent! Everything checks out. Let's talk rate. What do you need for 650 miles with high-value electronics?",
                dispatcherPrompt: "💎 ТОРГ! Posted $1,750 ($2.69/mi) - просите $1,900-2,000 для electronics!",
                suggestions: [
                    { text: "For 650 miles Atlanta-Miami with high-value electronics, I'm looking at $2,000. That's $3.08/mile - fair rate for air-ride van, careful handling, and electronics expertise.", quality: "excellent", analytics: "✨ ОТЛИЧНО! $2,000 = $250 больше posted! С обоснованием!", path: "master" },
                    { text: "$1,900 for this load. $2.92/mile - fair for electronics.", quality: "good", analytics: "✔️ Хорошо! $1,900 = $150 больше!", path: "master" },
                    { text: "$1,850 for 650 miles.", quality: "normal", analytics: "⚪ Нормально. $100 больше.", path: "master" },
                    { text: "$1,800 for this load?", quality: "weak", analytics: "⚠️ Слабо! Только $50 больше.", path: "weak" },
                    { text: "I need $2,200 minimum! Electronics are valuable.", quality: "aggressive", analytics: "🔴 Агрессивно! $2,200 нереально!", path: "reject_rate" },
                    { text: "I'll take $1,750 posted rate.", quality: "fail", analytics: "❌ Провал! Без торга!", path: "master" }
                ]
            },
            {
                brokerQuestion: "That's high for this lane. I can do $1,850. That's $2.85/mile.",
                dispatcherPrompt: "💎 Встречное $1,850. Просите $1,900 или примите!",
                suggestions: [
                    { text: "Can we meet at $1,900? Fair middle ground - you save from my ask, I earn above posted for air-ride service and electronics expertise.", quality: "excellent", analytics: "✨ ОТЛИЧНО! Логичный компромисс!", path: "master" },
                    { text: "$1,850 works. Let's book it.", quality: "good", analytics: "✔️ Хорошо! Заработал $100!", path: "master" },
                    { text: "$1,850 confirmed.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Okay, $1,850 will work...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" },
                    { text: "$1,900 or I walk!", quality: "aggressive", analytics: "🔴 Агрессивно! Ультиматум!", path: "reject_ultimatum" },
                    { text: "No, I need $2,000!", quality: "fail", analytics: "❌ Провал! Отказ!", path: "reject_ultimatum" }
                ]
            },
            {
                brokerQuestion: "$1,875 final. That's $2.88/mile. Deal?",
                dispatcherPrompt: "💎 ФИНАЛ! $1,875 - заработали $125 больше posted!",
                suggestions: [
                    { text: "$1,875 perfect! Deal!", quality: "excellent", analytics: "✨ ОТЛИЧНО! Принял финальную ставку!", path: "master" },
                    { text: "$1,875 is a deal!", quality: "good", analytics: "✔️ Хорошо! Заработал $125!", path: "master" },
                    { text: "$1,875 confirmed.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Okay, $1,875...", quality: "weak", analytics: "⚠️ Слабо.", path: "weak" },
                    { text: "Can't you do $1,900?", quality: "aggressive", analytics: "🔴 Агрессивно! После final!", path: "reject_final" },
                    { text: "$1,890? Just $15 more?", quality: "fail", analytics: "❌ Провал! Торгуется!", path: "reject_final" }
                ]
            },
            {
                brokerQuestion: "Deal! What's your email? I'll send rate confirmation now. Remember - careful handling, air-ride suspension, avoid rough roads.",
                dispatcherPrompt: "💎 Email для rate con! Подтвердите careful handling!",
                suggestions: [
                    { text: "Perfect! dispatch@techhaulexpress.com. I'll sign and return today. Careful handling with air-ride, avoiding rough roads. After pickup, I'll send BOL and photos of secured electronics. We take high-value cargo seriously. Looking forward to working together!", quality: "excellent", analytics: "✨ ОТЛИЧНО! Email, готовность, handling подтверждение, документы, профессионализм!", path: "master" },
                    { text: "dispatch@techhaulexpress.com. I'll sign and return. Will handle carefully with air-ride. Will send BOL and photos after pickup.", quality: "good", analytics: "✔️ Хорошо! Email, handling, документы.", path: "master" },
                    { text: "dispatch@techhaulexpress.com. Will handle carefully.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Let me find email... will handle carefully...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" },
                    { text: "Send to any email. Driver knows about electronics.", quality: "aggressive", analytics: "🔴 Агрессивно! Непрофессионально!", path: "reject_email" },
                    { text: "No email... can we do by phone?", quality: "fail", analytics: "❌ Провал! Нет email!", path: "reject_email" }
                ]
            },
            {
                brokerResponse: "Perfect! Rate confirmation sent to dispatch@techhaulexpress.com. Sign and return by email. Handle carefully with air-ride, avoid rough roads. After pickup, send BOL and photos of secured electronics. Let's continue by email. If this goes well, I have 4-6 electronics loads weekly Atlanta-Miami. Good luck!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$1,875",
                    ratePerMile: "$2.88/mile",
                    relationship: "strengthened",
                    weeklyLoads: "4-6 electronics loads weekly ($7,500-11,250/week)",
                    feedback: `✅ ОТЛИЧНЫЕ ПЕРЕГОВОРЫ! Заработали $125 больше posted ($1,875 vs $1,750 = 7.1%).\n\n💰 ФИНАНСЫ:\n• Ставка: $1,875\n• Дизель: -$254 (100 gal × $3.90 GA→FL)\n• Чистая прибыль: $1,621 (86% от ставки)\n\n💡 УРОК: Electronics требует air-ride, $250K insurance, careful handling. Юго-восток = средний дизель ($3.90/gal). High-value cargo = хорошие ставки.\n\n🎯 РЕАЛЬНОСТЬ: Electronics loads - premium rates ($2.70-3.10/mile). Профессионализм = 4-6 loads weekly ($30,000-45,000/месяц потенциал)!`
                }
            }
        ],

        warning_path: [
            {},
            {
                brokerQuestion: "I understand you're busy, but electronics are high-value cargo. I need to verify your company and van capability for insurance and safety. This is standard for all electronics carriers. Can you provide MC number and confirm you have air-ride suspension? Critical for both of us.",
                dispatcherPrompt: "⚠️ ПРЕДУПРЕЖДЕНИЕ! Второй шанс. Electronics требует профессионализма!",
                suggestions: [
                    { text: "You're absolutely right, I apologize. MC 334455, TechHaul Express. Dry van with air-ride in Atlanta at distribution center. Driver experienced with electronics. Ready 9 AM. Where's pickup?", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "Sorry. MC 334455, TechHaul Express. Van with air-ride in Atlanta.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "I don't have MC right now...", quality: "fail", analytics: "❌ ПРОВАЛ!", path: "reject_early" },
                    { text: "Just send load info!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_early" }
                ]
            }
        ],

        weak: [
            {},
            {
                brokerQuestion: "650 miles Atlanta-Miami. Electronics, 35K lbs, $250K value. Can you confirm?", dispatcherPrompt: "💎 Подтвердите!", suggestions: [
                    { text: "Yes! 650 miles in 2 days. Van with air-ride. Driver ready 9 AM.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "Yes, we can do it.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "I think so...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" }
                ]
            },
            {
                brokerQuestion: "You think so? I need confirmation. 650 miles, 35K lbs electronics, $250K value. Can your van handle this safely or not?", dispatcherPrompt: "💎 Брокер требует уверенности!", suggestions: [
                    { text: "Yes, absolutely! Van has air-ride and climate control. We handle electronics regularly.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "Yes, we can handle it.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Should be okay...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" }
                ]
            },
            {
                brokerQuestion: "Insurance $250K? Van has air-ride?", dispatcherPrompt: "💎 Подтвердите!", suggestions: [
                    { text: "Yes, $250K insurance with electronics coverage. Van has air-ride.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Yes, $250K insurance. Air-ride.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "I think we have it...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" }
                ]
            },
            {
                brokerQuestion: "You think? I need to know for sure. Do you have $250K cargo insurance with electronics coverage and air-ride suspension or not?", dispatcherPrompt: "💎 Брокер требует точности!", suggestions: [
                    { text: "Yes, confirmed. $250K insurance with electronics coverage and air-ride.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "Yes, we have both.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "I believe so...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" }
                ]
            },
            {
                brokerQuestion: "What rate?", dispatcherPrompt: "💎 Просите $1,850!", suggestions: [
                    { text: "$1,850 for 650 miles.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Whatever you're offering...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" }
                ]
            },
            {
                brokerQuestion: "Whatever I'm offering? That's not how negotiation works. What rate do you need?", dispatcherPrompt: "💎 Брокер требует ставку!", suggestions: [
                    { text: "$1,850 for this load.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "What can you pay?", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" }
                ]
            },
            {
                brokerQuestion: "$1,800. Deal?", dispatcherPrompt: "💎 Примите.", suggestions: [
                    { text: "$1,800 works. Deal.", quality: "normal", analytics: "⚪ Нормально.", path: "weak" },
                    { text: "Okay...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" }
                ]
            },
            {
                brokerQuestion: "Okay? Is that a yes or no?", dispatcherPrompt: "💎 Брокер требует четкого ответа!", suggestions: [
                    { text: "Yes, $1,800 is a deal.", quality: "normal", analytics: "⚪ Нормально.", path: "weak" },
                    { text: "I guess...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" }
                ]
            },
            {
                brokerQuestion: "Email?", dispatcherPrompt: "💎 Email.", suggestions: [
                    { text: "dispatch@techhaulexpress.com.", quality: "normal", analytics: "⚪ Нормально.", path: "weak" },
                    { text: "Let me find it...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" }
                ]
            },
            {
                brokerQuestion: "You need to find your email? That's concerning. Do you have a business email or not?", dispatcherPrompt: "💎 Брокер сомневается!", suggestions: [
                    { text: "Sorry, dispatch@techhaulexpress.com.", quality: "normal", analytics: "⚪ Нормально.", path: "weak" },
                    { text: "I'll get back to you...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" }
                ]
            },
            { brokerResponse: "Thanks, but I need more confident carrier for electronics. Good luck!", outcome: { type: "failure", quality: "weak", rate: "$0", feedback: "⚠️ ОТКАЗ: Electronics требует уверенности. Брокеры ищут надежных партнеров!" } }
        ],

        reject_early: [{}, {}, { brokerResponse: "I need professional electronics carriers. Thanks.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ ОТКАЗ: Непрофессионализм после предупреждения!" } }],

        reject_attitude: [
            {},
            {},
            {
                brokerQuestion: "Hold on. This is high-value electronics - 9 AM pickup required. I need professional attitude and confirmation. Can your driver be there 9 AM with air-ride van? Yes or no?",
                dispatcherPrompt: "⚠️ ШАНС ИСПРАВИТЬСЯ! Electronics требует профессионализма!",
                suggestions: [
                    { text: "You're right, I apologize. Yes, driver will be at pickup 9 AM sharp with air-ride van. We understand electronics are valuable.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "Yes, 9 AM confirmed with air-ride.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Driver can't make 9 AM...", quality: "fail", analytics: "❌ ФИНАЛ!", path: "reject_attitude_final" },
                    { text: "Why such big deal?", quality: "aggressive", analytics: "🔴 ФИНАЛ!", path: "reject_attitude_final" }
                ]
            }
        ],

        reject_attitude_final: [{}, {}, {}, { brokerResponse: "I need professional carrier for electronics. Thanks.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ ОТКАЗ: Electronics требует профессионализма!" } }],

        reject_timing: [
            {},
            {},
            {
                brokerQuestion: "9 AM pickup is required - warehouse schedule. Can you get driver there by 9 AM or have another van available?",
                dispatcherPrompt: "⚠️ ШАНС ИСПРАВИТЬСЯ! Electronics требует пунктуальности!",
                suggestions: [
                    { text: "Let me check... actually yes, driver can be there 9 AM. I'll make sure of it.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "Yes, 9 AM works.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Earliest is 11 AM...", quality: "fail", analytics: "❌ ФИНАЛ!", path: "reject_timing_final" },
                    { text: "Can they load later?", quality: "aggressive", analytics: "🔴 ФИНАЛ!", path: "reject_timing_final" }
                ]
            }
        ],

        reject_timing_final: [{}, {}, {}, { brokerResponse: "I need carrier who can meet pickup time. Thanks.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ ОТКАЗ: Не может забрать вовремя!" } }],

        reject_insurance: [
            {},
            {},
            {},
            {
                brokerQuestion: "$250K cargo coverage required for electronics. Standard requirement. Can you get additional coverage or have another van with proper insurance?",
                dispatcherPrompt: "⚠️ ШАНС ИСПРАВИТЬСЯ! Electronics требует $250K!",
                suggestions: [
                    { text: "Actually, I checked - we do have $250K with electronics coverage. Certificate current. I'll send it.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "Yes, $250K coverage available.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Can't get additional coverage...", quality: "fail", analytics: "❌ ФИНАЛ!", path: "reject_insurance_final" },
                    { text: "$100K should be enough!", quality: "aggressive", analytics: "🔴 ФИНАЛ!", path: "reject_insurance_final" }
                ]
            }
        ],

        reject_insurance_final: [{}, {}, {}, {}, { brokerResponse: "I need carrier with $250K coverage for electronics. Thanks.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ ОТКАЗ: Недостаточная страховка для electronics!" } }],

        reject_rate: [
            {},
            {},
            {},
            {},
            {
                brokerQuestion: "$2,200 too high. Market rate Atlanta-Miami is $2.70-2.90/mile. I can offer $1,875 as best rate. Can we work with that?",
                dispatcherPrompt: "⚠️ ШАНС ИСПРАВИТЬСЯ! Примите разумную ставку!",
                suggestions: [
                    { text: "You're right. $1,875 works. Fair for electronics. Deal!", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "$1,875 acceptable. Deal.", quality: "normal", analytics: "⚪ Принял.", path: "master" },
                    { text: "I need $2,200 minimum.", quality: "aggressive", analytics: "🔴 ФИНАЛ!", path: "reject_rate_final" },
                    { text: "I'll find better broker.", quality: "fail", analytics: "❌ ФИНАЛ!", path: "reject_rate_final" }
                ]
            }
        ],

        reject_rate_final: [{}, {}, {}, {}, {}, { brokerResponse: "That rate doesn't work. Good luck.", outcome: { type: "failure", quality: "poor", rate: "$0", feedback: "❌ ОТКАЗ: Нереалистичная ставка!" } }],

        reject_ultimatum: [
            {},
            {},
            {},
            {},
            {},
            {
                brokerQuestion: "Ultimatums don't work in electronics business. My best offer is $1,875 - $125 above posted. Can we work professionally?",
                dispatcherPrompt: "⚠️ ПОСЛЕДНИЙ ШАНС! Примите $1,875!",
                suggestions: [
                    { text: "You're right, I apologize. $1,875 works. Deal!", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "$1,875 acceptable. Deal.", quality: "normal", analytics: "⚪ Принял.", path: "master" },
                    { text: "$1,900 or I'm out!", quality: "aggressive", analytics: "🔴 ФИНАЛ!", path: "reject_ultimatum_final" },
                    { text: "No deal.", quality: "fail", analytics: "❌ ФИНАЛ!", path: "reject_ultimatum_final" }
                ]
            }
        ],

        reject_ultimatum_final: [{}, {}, {}, {}, {}, {}, { brokerResponse: "I don't work with ultimatums. Good luck.", outcome: { type: "failure", quality: "poor", rate: "$0", feedback: "❌ ОТКАЗ: Ультиматумы не работают!" } }],

        reject_final: [
            {},
            {},
            {},
            {},
            {},
            {},
            {
                brokerQuestion: "$1,875 is final. I can't go higher. Fair rate - $125 above posted for electronics. Do you want this load?",
                dispatcherPrompt: "⚠️ ПОСЛЕДНИЙ ШАНС! Примите СЕЙЧАС!",
                suggestions: [
                    { text: "You're right. $1,875 fair. Deal! What's your email?", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "$1,875. Deal.", quality: "normal", analytics: "⚪ Принял.", path: "master" },
                    { text: "I want more...", quality: "fail", analytics: "❌ ФИНАЛ!", path: "reject_final_final" },
                    { text: "This is ridiculous!", quality: "aggressive", analytics: "🔴 ФИНАЛ!", path: "reject_final_final" }
                ]
            }
        ],

        reject_final_final: [{}, {}, {}, {}, {}, {}, {}, { brokerResponse: "No time for this. Electronics going to another carrier.", outcome: { type: "failure", quality: "poor", rate: "$0", feedback: "❌ ОТКАЗ: Торг после final = потеря груза!" } }],

        reject_email: [
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {
                brokerQuestion: "I need professional email for rate confirmation and cargo photos. Standard for electronics. Can you provide valid business email?",
                dispatcherPrompt: "⚠️ ПОСЛЕДНИЙ ШАНС! Electronics требует email!",
                suggestions: [
                    { text: "Sorry, dispatch@techhaulexpress.com. I'll check regularly.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "dispatch@techhaulexpress.com.", quality: "normal", analytics: "⚪ Дал email.", path: "master" },
                    { text: "Really don't have email...", quality: "fail", analytics: "❌ ФИНАЛ!", path: "reject_email_final" },
                    { text: "Why need email? Call me!", quality: "aggressive", analytics: "🔴 ФИНАЛ!", path: "reject_email_final" }
                ]
            }
        ],

        reject_email_final: [{}, {}, {}, {}, {}, {}, {}, {}, { brokerResponse: "Can't work without email for electronics. Thanks.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ ОТКАЗ: Нет email = невозможно работать!" } }]
    }
};

if (typeof allScenarios !== 'undefined') {
    allScenarios.push(scenario2);
    console.log('✅ Scenario 2 (Dry Van Electronics Atlanta-Miami) added');
} else {
    console.warn('⚠️ allScenarios not found');
}
