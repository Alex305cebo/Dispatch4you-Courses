// DIALOGUE #1 - Flatbed Construction Materials
// Dallas TX → Denver CO, 780 miles
// Posted: $2,100 ($2.69/mile), Target: $2,300-2,400
// Created: March 8, 2026

console.log('🔵 Loading scenarios-data-v1.js...');

const scenario1 = {
    id: 1,
    route: "Dallas TX → Denver CO",
    distance: 780,
    equipment: "Flatbed (48ft)",
    cargo: "Construction materials (steel beams)",
    weight: "45,000 lbs",
    postedRate: "$2,100 ($2.69/mile)",
    deadline: "Pickup tomorrow 7 AM, Delivery in 2 days",
    brokerStyle: "Professional construction freight broker",
    difficulty: "medium",
    initialMessage: "Good morning! This is Marcus from SteelRoad Logistics.\nI'm calling about your posted flatbed load Dallas to Denver with construction materials.\nIs this load still available?",

    paths: {
        master: [
            {
                brokerQuestion: "Good morning! This is Tom from BuildFreight Brokers.\nYes, still available.\nWhat's your MC number and do you have tarps, straps, and chains for steel beams?",
                dispatcherPrompt: "💎 Брокер проверяет компанию и flatbed equipment. Дайте: MC, компания, equipment, опыт!",
                suggestions: [
                    { text: "Good morning Tom! MC 445566, SteelRoad Logistics. We specialize in construction freight - 12 flatbed trucks. Flatbed in Dallas at construction yard, fully equipped with heavy-duty tarps, 20 straps, and chains for steel. Driver has 5 years flatbed experience, DOT certified for securement. Ready for 7 AM pickup. What's the exact weight and beam length?", quality: "excellent", analytics: "✨ ОТЛИЧНО! MC, компания, специализация, fleet, местоположение, полное equipment, опыт водителя, DOT, готовность, вопросы!", path: "master" },
                    { text: "Morning! MC 445566, SteelRoad Logistics. Flatbed in Dallas with tarps, straps, and chains. Driver experienced with steel loads. Ready 7 AM. What's the beam specs?", quality: "good", analytics: "✔️ Хорошо! MC, компания, equipment, опыт, вопрос.", path: "master" },
                    { text: "MC 445566, SteelRoad Logistics. Flatbed with equipment in Dallas. Ready tomorrow.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "MC 445566... flatbed should have tarps and straps... somewhere in Dallas...", quality: "weak", analytics: "⚠️ Слабо! Неуверенность в equipment!", path: "weak" },
                    { text: "Why need all equipment details? Just tell me the rate!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "warning_path" },
                    { text: "Flatbed available. What's the load?", quality: "fail", analytics: "❌ Провал! Нет MC и equipment!", path: "warning_path" }
                ]
            },
            {
                brokerQuestion: "MC verified, good. Perfect!\n\n780 miles Dallas to Denver. Steel beams for construction site, 45,000 lbs, 40-foot beams. Pickup tomorrow 7 AM, delivery in 2 days. Requires proper securement and tarping. Can you handle heavy steel?",
                dispatcherPrompt: "💎 Steel beams! Подтвердите: 780 mi, 45K lbs, 40ft beams, securement!",
                suggestions: [
                    { text: "Perfect! 780 miles in 2 days with 40-foot steel beams - absolutely no problem. We handle construction steel regularly, understand DOT securement requirements. Our flatbed is 48ft, perfect for 40ft beams. Driver will secure with chains and edge protectors, tarp for weather protection. Ready 7 AM sharp. What's the loading time? Any specific delivery instructions at construction site?", quality: "excellent", analytics: "✨ ОТЛИЧНО! Подтверждение, опыт со steel, DOT знание, размер flatbed, securement детали, tarping, готовность, вопросы!", path: "master" },
                    { text: "Yes, 780 miles in 2 days works. We handle steel beams regularly. 48ft flatbed, proper securement with chains. Driver ready 7 AM. What's delivery window?", quality: "good", analytics: "✔️ Хорошо! Подтверждение, опыт, equipment, вопрос.", path: "master" },
                    { text: "We can handle it. Flatbed ready for steel. Ready 7 AM.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "I think we can do steel beams... flatbed should fit...", quality: "weak", analytics: "⚠️ Слабо! Неуверенность!", path: "weak" },
                    { text: "Just steel? Easy. What's your rate?", quality: "aggressive", analytics: "🔴 Агрессивно! Пренебрежение steel требованиями!", path: "reject_attitude" },
                    { text: "Driver can't be there until 9 AM... 7 AM too early.", quality: "fail", analytics: "❌ Провал! Не может вовремя!", path: "reject_timing" }
                ]
            },
            {
                brokerQuestion: "Loading 3 hours, unloading 3 hours with crane. Steel requires careful handling. Is your insurance current? Need $100K cargo coverage. Also, is your driver DOT certified for flatbed securement?",
                dispatcherPrompt: "💎 Insurance + DOT certification. Дайте: insurance детали, DOT cert!",
                suggestions: [
                    { text: "Perfect! 3 hours loading/unloading - standard for steel with crane, no problem. Yes, $100K cargo insurance through Progressive Commercial. Certificate current, expires September 2027. Driver is DOT certified for flatbed securement, completed training last year. I'll email insurance cert and DOT certification after booking. What's your email?", quality: "excellent", analytics: "✨ ОТЛИЧНО! Подтверждение времени, insurance детали, DOT cert с датой, готовность отправить!", path: "master" },
                    { text: "3 hours confirmed. Yes, $100K cargo insurance through Progressive. Current and valid. Driver DOT certified for flatbed. I'll send certificates.", quality: "good", analytics: "✔️ Хорошо! Insurance, DOT cert, готовность.", path: "master" },
                    { text: "Yes, $100K insurance. Driver DOT certified.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "I think insurance is current... driver should be certified...", quality: "weak", analytics: "⚠️ Слабо! Неуверенность!", path: "weak" },
                    { text: "Insurance is fine! Let's talk rate.", quality: "aggressive", analytics: "🔴 Агрессивно! Отказ обсуждать!", path: "reject_insurance" },
                    { text: "We have $100K but driver not DOT certified... is that required?", quality: "fail", analytics: "❌ Провал! Нет DOT cert!", path: "reject_insurance" }
                ]
            },
            {
                brokerQuestion: "Excellent! Everything checks out. Let's talk rate. What do you need for 780 miles with steel beams?",
                dispatcherPrompt: "💎 ТОРГ! Posted $2,100 ($2.69/mi) - просите $2,300-2,400 для flatbed steel!",
                suggestions: [
                    { text: "For 780 miles Dallas-Denver with steel beams, I'm looking at $2,400. That's $3.08/mile - fair rate for flatbed, heavy steel, proper securement, and construction site delivery.", quality: "excellent", analytics: "✨ ОТЛИЧНО! $2,400 = $300 больше posted! С обоснованием!", path: "master" },
                    { text: "$2,300 for this load. $2.95/mile - fair for flatbed steel.", quality: "good", analytics: "✔️ Хорошо! $2,300 = $200 больше!", path: "master" },
                    { text: "$2,200 for 780 miles.", quality: "normal", analytics: "⚪ Нормально. $100 больше.", path: "master" },
                    { text: "$2,150 for this load?", quality: "weak", analytics: "⚠️ Слабо! Только $50 больше.", path: "weak" },
                    { text: "I need $2,600 minimum! Steel is heavy to haul.", quality: "aggressive", analytics: "🔴 Агрессивно! $2,600 нереально!", path: "reject_rate" },
                    { text: "I'll take $2,100 posted rate.", quality: "fail", analytics: "❌ Провал! Без торга!", path: "master" }
                ]
            },
            {
                brokerQuestion: "That's high for this lane. I can do $2,200. That's $2.82/mile.",
                dispatcherPrompt: "💎 Встречное $2,200. Просите $2,300 или примите!",
                suggestions: [
                    { text: "Can we meet at $2,300? Fair middle ground - you save from my ask, I earn above posted for flatbed service and steel expertise.", quality: "excellent", analytics: "✨ ОТЛИЧНО! Логичный компромисс!", path: "master" },
                    { text: "$2,200 works. Let's book it.", quality: "good", analytics: "✔️ Хорошо! Заработал $100!", path: "master" },
                    { text: "$2,200 confirmed.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Okay, $2,200 will work...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" },
                    { text: "$2,300 or I walk!", quality: "aggressive", analytics: "🔴 Агрессивно! Ультиматум!", path: "reject_ultimatum" },
                    { text: "No, I need $2,400!", quality: "fail", analytics: "❌ Провал! Отказ!", path: "reject_ultimatum" }
                ]
            },
            {
                brokerQuestion: "$2,250 final. That's $2.88/mile. Deal?",
                dispatcherPrompt: "💎 ФИНАЛ! $2,250 - заработали $150 больше posted!",
                suggestions: [
                    { text: "$2,250 perfect! Deal!", quality: "excellent", analytics: "✨ ОТЛИЧНО! Принял финальную ставку!", path: "master" },
                    { text: "$2,250 is a deal!", quality: "good", analytics: "✔️ Хорошо! Заработал $150!", path: "master" },
                    { text: "$2,250 confirmed.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Okay, $2,250...", quality: "weak", analytics: "⚠️ Слабо.", path: "weak" },
                    { text: "Can't you do $2,300?", quality: "aggressive", analytics: "🔴 Агрессивно! После final!", path: "reject_final" },
                    { text: "$2,275? Just $25 more?", quality: "fail", analytics: "❌ Провал! Торгуется!", path: "reject_final" }
                ]
            },
            {
                brokerQuestion: "Deal! What's your email? I'll send rate confirmation now. Remember - proper securement with chains, edge protectors, and tarps for weather.",
                dispatcherPrompt: "💎 Email для rate con! Подтвердите securement!",
                suggestions: [
                    { text: "Perfect! dispatch@steelroadlogistics.com. I'll sign and return today. Proper securement with chains and edge protectors, tarps for weather protection. After pickup, I'll send BOL and photos of secured load. We take steel seriously. Looking forward to working together!", quality: "excellent", analytics: "✨ ОТЛИЧНО! Email, готовность, securement подтверждение, документы, профессионализм!", path: "master" },
                    { text: "dispatch@steelroadlogistics.com. I'll sign and return. Will secure properly with chains and tarps. Will send BOL and photos after pickup.", quality: "good", analytics: "✔️ Хорошо! Email, securement, документы.", path: "master" },
                    { text: "dispatch@steelroadlogistics.com. Will secure properly.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Let me find email... will secure load...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" },
                    { text: "Send to any email. Driver knows about securement.", quality: "aggressive", analytics: "🔴 Агрессивно! Непрофессионально!", path: "reject_email" },
                    { text: "No email... can we do by phone?", quality: "fail", analytics: "❌ Провал! Нет email!", path: "reject_email" }
                ]
            },
            {
                brokerResponse: "Perfect! Rate confirmation sent to dispatch@steelroadlogistics.com. Sign and return by email. Secure with chains and edge protectors, tarp for weather. After pickup, send BOL and photos of secured load. Let's continue by email. If this goes well, I have 5-7 construction loads weekly Dallas-Denver. Good luck!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$2,250",
                    ratePerMile: "$2.88/mile",
                    relationship: "strengthened",
                    weeklyLoads: "5-7 construction loads weekly ($11,250-15,750/week)",
                    feedback: `✅ ОТЛИЧНЫЕ ПЕРЕГОВОРЫ! Заработали $150 больше posted ($2,250 vs $2,100 = 7.1%).\n\n💰 ФИНАНСЫ:\n• Ставка: $2,250\n• Дизель: -$296 (120 gal × $3.80 TX→CO)\n• Чистая прибыль: $1,954 (87% от ставки)\n\n💡 УРОК: Flatbed требует tarps, chains, DOT securement cert. Юг = дешевый дизель ($3.80/gal)! Steel beams - хорошие ставки для flatbed.\n\n🎯 РЕАЛЬНОСТЬ: Construction loads - стабильные ставки ($2.50-3.00/mile). Профессионализм = 5-7 loads weekly ($45,000-63,000/месяц потенциал)!`
                }
            }
        ],

        warning_path: [
            {},
            {
                brokerQuestion: "I understand you're busy, but construction materials require proper equipment verification. I need to verify your company and flatbed capability for insurance and safety. This is standard for all flatbed carriers. Can you provide MC number and confirm you have tarps, straps, and chains? Critical for both of us.",
                dispatcherPrompt: "⚠️ ПРЕДУПРЕЖДЕНИЕ! Второй шанс. Flatbed требует профессионализма!",
                suggestions: [
                    { text: "You're absolutely right, I apologize. MC 445566, SteelRoad Logistics. Flatbed in Dallas at construction yard, fully equipped with tarps, straps, and chains. Driver DOT certified. Ready 7 AM. Where's pickup?", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "Sorry. MC 445566, SteelRoad Logistics. Flatbed with equipment in Dallas.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "I don't have MC right now...", quality: "fail", analytics: "❌ ПРОВАЛ!", path: "reject_early" },
                    { text: "Just send load info!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject_early" }
                ]
            }
        ],

        weak: [
            {},
            {
                brokerQuestion: "780 miles Dallas-Denver. Steel beams, 45K lbs. Can you confirm?", dispatcherPrompt: "💎 Подтвердите!", suggestions: [
                    { text: "Yes! 780 miles in 2 days. Flatbed with proper equipment. Driver ready 7 AM.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "Yes, we can do it.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "I think so...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" }
                ]
            },
            {
                brokerQuestion: "You think so? I need confirmation. 780 miles, 45K lbs steel beams, 40ft length. Can your flatbed handle this or not?", dispatcherPrompt: "💎 Брокер требует уверенности!", suggestions: [
                    { text: "Yes, absolutely! 48ft flatbed, perfect for 40ft beams. We handle steel regularly.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "Yes, we can handle it.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Should be okay...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" }
                ]
            },
            {
                brokerQuestion: "Insurance current? Driver DOT certified?", dispatcherPrompt: "💎 Подтвердите!", suggestions: [
                    { text: "Yes, $100K insurance through Progressive. Driver DOT certified.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Yes, $100K insurance. DOT certified.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "I think we have it...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" }
                ]
            },
            {
                brokerQuestion: "You think? I need to know for sure. Do you have $100K cargo insurance and DOT flatbed certification or not?", dispatcherPrompt: "💎 Брокер требует точности!", suggestions: [
                    { text: "Yes, confirmed. $100K insurance and DOT certified.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "Yes, we have both.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "I believe so...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" }
                ]
            },
            {
                brokerQuestion: "What rate?", dispatcherPrompt: "💎 Просите $2,200!", suggestions: [
                    { text: "$2,200 for 780 miles.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Whatever you're offering...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" }
                ]
            },
            {
                brokerQuestion: "Whatever I'm offering? That's not how negotiation works. What rate do you need?", dispatcherPrompt: "💎 Брокер требует ставку!", suggestions: [
                    { text: "$2,200 for this load.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "What can you pay?", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" }
                ]
            },
            {
                brokerQuestion: "$2,150. Deal?", dispatcherPrompt: "💎 Примите.", suggestions: [
                    { text: "$2,150 works. Deal.", quality: "normal", analytics: "⚪ Нормально.", path: "weak" },
                    { text: "Okay...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" }
                ]
            },
            {
                brokerQuestion: "Okay? Is that a yes or no?", dispatcherPrompt: "💎 Брокер требует четкого ответа!", suggestions: [
                    { text: "Yes, $2,150 is a deal.", quality: "normal", analytics: "⚪ Нормально.", path: "weak" },
                    { text: "I guess...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" }
                ]
            },
            {
                brokerQuestion: "Email?", dispatcherPrompt: "💎 Email.", suggestions: [
                    { text: "dispatch@steelroadlogistics.com.", quality: "normal", analytics: "⚪ Нормально.", path: "weak" },
                    { text: "Let me find it...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" }
                ]
            },
            {
                brokerQuestion: "You need to find your email? That's concerning. Do you have a business email or not?", dispatcherPrompt: "💎 Брокер сомневается!", suggestions: [
                    { text: "Sorry, dispatch@steelroadlogistics.com.", quality: "normal", analytics: "⚪ Нормально.", path: "weak" },
                    { text: "I'll get back to you...", quality: "weak", analytics: "⚠️ Слабо!", path: "weak" }
                ]
            },
            { brokerResponse: "Thanks, but I need more confident carrier for construction. Good luck!", outcome: { type: "failure", quality: "weak", rate: "$0", feedback: "⚠️ ОТКАЗ: Construction требует уверенности. Брокеры ищут надежных партнеров!" } }
        ],

        reject_early: [{}, {}, { brokerResponse: "I need professional flatbed carriers. Thanks.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ ОТКАЗ: Непрофессионализм после предупреждения!" } }],

        reject_attitude: [
            {},
            {},
            {
                brokerQuestion: "Hold on. This is heavy steel - 7 AM pickup required for construction schedule. I need professional attitude and confirmation. Can your driver be there 7 AM with proper equipment? Yes or no?",
                dispatcherPrompt: "⚠️ ШАНС ИСПРАВИТЬСЯ! Steel требует профессионализма!",
                suggestions: [
                    { text: "You're right, I apologize. Yes, driver will be at pickup 7 AM sharp with flatbed and all equipment. We understand construction schedules.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "Yes, 7 AM confirmed with equipment.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Driver can't make 7 AM...", quality: "fail", analytics: "❌ ФИНАЛ!", path: "reject_attitude_final" },
                    { text: "Why such big deal?", quality: "aggressive", analytics: "🔴 ФИНАЛ!", path: "reject_attitude_final" }
                ]
            }
        ],

        reject_attitude_final: [{}, {}, {}, { brokerResponse: "I need professional carrier for construction. Thanks.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ ОТКАЗ: Construction требует профессионализма и пунктуальности!" } }],

        reject_timing: [
            {},
            {},
            {
                brokerQuestion: "7 AM pickup is critical - construction site schedule. Can you get driver there by 7 AM or have another flatbed available?",
                dispatcherPrompt: "⚠️ ШАНС ИСПРАВИТЬСЯ! Construction требует раннего pickup!",
                suggestions: [
                    { text: "Let me check... actually yes, driver can be there 7 AM. I'll make sure of it for construction.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "Yes, 7 AM works.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Earliest is 9 AM...", quality: "fail", analytics: "❌ ФИНАЛ!", path: "reject_timing_final" },
                    { text: "Can they load later?", quality: "aggressive", analytics: "🔴 ФИНАЛ!", path: "reject_timing_final" }
                ]
            }
        ],

        reject_timing_final: [{}, {}, {}, { brokerResponse: "I need carrier who can meet construction pickup time. Thanks.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ ОТКАЗ: Construction требует раннего pickup для schedule!" } }],

        reject_insurance: [
            {},
            {},
            {},
            {
                brokerQuestion: "$100K cargo coverage and DOT flatbed certification required for steel. Standard requirement. Can you get DOT cert or have another driver with proper certification?",
                dispatcherPrompt: "⚠️ ШАНС ИСПРАВИТЬСЯ! Steel требует DOT cert!",
                suggestions: [
                    { text: "Actually, I checked - driver is DOT certified for flatbed. Certificate current. I'll send it.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "Yes, DOT certified available.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Can't get DOT cert...", quality: "fail", analytics: "❌ ФИНАЛ!", path: "reject_insurance_final" },
                    { text: "Regular license should be enough!", quality: "aggressive", analytics: "🔴 ФИНАЛ!", path: "reject_insurance_final" }
                ]
            }
        ],

        reject_insurance_final: [{}, {}, {}, {}, { brokerResponse: "I need carrier with DOT flatbed certification for steel. Thanks.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ ОТКАЗ: Steel требует DOT flatbed certification!" } }],

        reject_rate: [
            {},
            {},
            {},
            {},
            {
                brokerQuestion: "$2,600 too high. Market rate Dallas-Denver flatbed is $2.60-2.90/mile. I can offer $2,250 as best rate. Can we work with that?",
                dispatcherPrompt: "⚠️ ШАНС ИСПРАВИТЬСЯ! Примите разумную ставку для flatbed!",
                suggestions: [
                    { text: "You're right. $2,250 works. Fair for flatbed steel. Deal!", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "$2,250 acceptable. Deal.", quality: "normal", analytics: "⚪ Принял.", path: "master" },
                    { text: "I need $2,600 minimum.", quality: "aggressive", analytics: "🔴 ФИНАЛ!", path: "reject_rate_final" },
                    { text: "I'll find better broker.", quality: "fail", analytics: "❌ ФИНАЛ!", path: "reject_rate_final" }
                ]
            }
        ],

        reject_rate_final: [{}, {}, {}, {}, {}, { brokerResponse: "That rate doesn't work. Good luck.", outcome: { type: "failure", quality: "poor", rate: "$0", feedback: "❌ ОТКАЗ: Нереалистичная ставка для flatbed!" } }],

        reject_ultimatum: [
            {},
            {},
            {},
            {},
            {},
            {
                brokerQuestion: "Ultimatums don't work in construction business. My best offer is $2,250 - $150 above posted. Can we work professionally?",
                dispatcherPrompt: "⚠️ ПОСЛЕДНИЙ ШАНС! Примите $2,250!",
                suggestions: [
                    { text: "You're right, I apologize. $2,250 works. Deal!", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "$2,250 acceptable. Deal.", quality: "normal", analytics: "⚪ Принял.", path: "master" },
                    { text: "$2,300 or I'm out!", quality: "aggressive", analytics: "🔴 ФИНАЛ!", path: "reject_ultimatum_final" },
                    { text: "No deal.", quality: "fail", analytics: "❌ ФИНАЛ!", path: "reject_ultimatum_final" }
                ]
            }
        ],

        reject_ultimatum_final: [{}, {}, {}, {}, {}, {}, { brokerResponse: "I don't work with ultimatums. Good luck.", outcome: { type: "failure", quality: "poor", rate: "$0", feedback: "❌ ОТКАЗ: Ультиматумы не работают в construction бизнесе!" } }],

        reject_final: [
            {},
            {},
            {},
            {},
            {},
            {},
            {
                brokerQuestion: "$2,250 is final. I can't go higher. Fair rate - $150 above posted for flatbed steel. Do you want this load?",
                dispatcherPrompt: "⚠️ ПОСЛЕДНИЙ ШАНС! Примите СЕЙЧАС!",
                suggestions: [
                    { text: "You're right. $2,250 fair. Deal! What's your email?", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "$2,250. Deal.", quality: "normal", analytics: "⚪ Принял.", path: "master" },
                    { text: "I want more...", quality: "fail", analytics: "❌ ФИНАЛ!", path: "reject_final_final" },
                    { text: "This is ridiculous!", quality: "aggressive", analytics: "🔴 ФИНАЛ!", path: "reject_final_final" }
                ]
            }
        ],

        reject_final_final: [{}, {}, {}, {}, {}, {}, {}, { brokerResponse: "No time for this. Steel going to another carrier.", outcome: { type: "failure", quality: "poor", rate: "$0", feedback: "❌ ОТКАЗ: Торг после final = потеря steel груза!" } }],

        reject_email: [
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {
                brokerQuestion: "I need professional email for rate confirmation and load photos. Standard for construction. Can you provide valid business email?",
                dispatcherPrompt: "⚠️ ПОСЛЕДНИЙ ШАНС! Construction требует email для photos!",
                suggestions: [
                    { text: "Sorry, dispatch@steelroadlogistics.com. I'll check regularly for updates.", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "dispatch@steelroadlogistics.com.", quality: "normal", analytics: "⚪ Дал email.", path: "master" },
                    { text: "Really don't have email...", quality: "fail", analytics: "❌ ФИНАЛ!", path: "reject_email_final" },
                    { text: "Why need email? Call me!", quality: "aggressive", analytics: "🔴 ФИНАЛ!", path: "reject_email_final" }
                ]
            }
        ],

        reject_email_final: [{}, {}, {}, {}, {}, {}, {}, {}, { brokerResponse: "Can't work without email for construction. Need load photos. Thanks.", outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "❌ ОТКАЗ: Construction требует email для photos и документов!" } }]
    }
};

if (typeof allScenarios !== 'undefined') {
    allScenarios.push(scenario1);
    console.log('✅ Scenario 1 (Flatbed Steel Dallas-Denver) added');
} else {
    console.warn('⚠️ allScenarios not found');
}
