// DIALOGUE #7 - Reefer Dairy Products (RULE-BREAKING VERSION)
// Denver CO → Boston MA, 1,990 miles
// Posted: $5,970 ($3.00/mile), Target: $6,200-6,400
// Created: March 9, 2026
// STRUCTURE: НАРУШАЕТ ПРАВИЛА - брокер называет цену первым, меньше шагов, агрессивный стиль
// QUALITY: Premium - реалистичный но непредсказуемый

console.log('🔵 Loading scenarios-data-v7.js...');

const scenario7 = {
    id: 7,
    route: "Denver CO → Boston MA",
    distance: 1990,
    equipment: "Reefer (53ft)",
    cargo: "Dairy products (milk, cheese, yogurt)",
    weight: "41,000 lbs",
    postedRate: "$5,970 ($3.00/mile)",
    deadline: "Pickup TODAY 2 PM, Delivery in 3 days (URGENT!)",
    brokerStyle: "Aggressive broker - time pressure, names price first",
    difficulty: "hard",
    initialMessage: "Good afternoon! This is Alex from MountainCold Transport.\nI'm calling about your posted reefer load Denver to Boston with dairy products.\nIs this load still available?",

    paths: {
        master: [
            // ШАГ 1: БРОКЕР АГРЕССИВНО ОТВЕЧАЕТ - URGENT!
            {
                brokerQuestion: "Yeah it's available but listen - this is URGENT! Shipper needs pickup TODAY 2 PM, not tomorrow! 1,990 miles Denver-Boston, dairy products 41,000 lbs, temp 34-38°F. You got reefer in Denver RIGHT NOW or you wasting my time?",
                dispatcherPrompt: "🔥 СРОЧНО! Брокер агрессивный! Есть ли reefer в Denver СЕЙЧАС?",
                suggestions: [
                    { text: "Yes! Reefer in Denver at distribution center, empty right now. Pre-cooled to 34°F. Driver ready for 2 PM pickup today. MC 667788, DairyHaul Transport. What's the rate?", quality: "excellent", analytics: "✨ Быстро и четко!", path: "master" },
                    { text: "Yes, reefer in Denver. Pre-cooled. Driver ready 2 PM today. What's rate?", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Reefer in Denver. Ready today.", quality: "normal", analytics: "⚪ Коротко.", path: "warning" },
                    { text: "I think we can make it...", quality: "weak", analytics: "⚠️ Неуверенно!", path: "warning" },
                    { text: "What's the rate first?", quality: "aggressive", analytics: "🔴 Встречная агрессия!", path: "warning_strict" },
                    { text: "Can't do 2 PM, maybe 4 PM?", quality: "fail", analytics: "❌ Не вовремя!", path: "reject_timing_final" }
                ]
            },
            // ШАГ 2: БРОКЕР НАЗЫВАЕТ ЦЕНУ ПЕРВЫМ! (нарушение правила)
            {
                brokerQuestion: "Okay good! Look, I'm gonna be straight with you - I can pay $6,100 all-in for this. That's $3.07/mile. Dairy is time-sensitive, I need reliable carrier. You in or out?",
                dispatcherPrompt: "💰 БРОКЕР НАЗВАЛ ЦЕНУ ПЕРВЫМ! $6,100. Можно попросить больше или взять!",
                suggestions: [
                    { text: "I appreciate the straight talk! For urgent dairy with 2 PM pickup today, I need $6,300. That's $3.17/mile - fair for rush timing and dairy expertise. Can you do that?", quality: "excellent", analytics: "✨ Попросил больше профессионально!", path: "master" },
                    { text: "$6,200 would work better for urgent timing. Can we do that?", quality: "good", analytics: "✔️ Попросил чуть больше!", path: "master" },
                    { text: "$6,100 works. Let's do it.", quality: "normal", analytics: "⚪ Принял сразу.", path: "master" },
                    { text: "I guess $6,100 is okay...", quality: "weak", analytics: "⚠️ Неуверенно!", path: "warning" },
                    { text: "I need $6,500 minimum for urgent!", quality: "aggressive", analytics: "🔴 Слишком много!", path: "reject_rate_final" },
                    { text: "That's too low for dairy.", quality: "fail", analytics: "❌ Отказ без контр-оффера!", path: "reject_weak_final" }
                ]
            },
            // ШАГ 3: БРОКЕР ТОРГУЕТСЯ (если попросили больше)
            {
                brokerQuestion: "Alright, I respect that. Tell you what - $6,150 final. That's my max budget. But I need your MC, insurance, and driver's dairy experience confirmed RIGHT NOW. Deal?",
                dispatcherPrompt: "💎 $6,150 final + нужны детали СЕЙЧАС! Дайте все сразу!",
                suggestions: [
                    { text: "$6,150 is a deal! MC 667788, DairyHaul Transport. $100K cargo coverage through Farmers, current. Driver 8 years dairy experience, knows temp control critical. Reefer serviced last week. Let's book it!", quality: "excellent", analytics: "✨ Все детали сразу!", path: "master" },
                    { text: "$6,150 works! MC 667788, DairyHaul. $100K cargo coverage. Driver 8 years dairy experience. Let's go!", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "$6,150 confirmed. MC 667788. Insurance current. Driver experienced.", quality: "normal", analytics: "⚪ Минимально.", path: "master" },
                    { text: "Okay $6,150... let me check details...", quality: "weak", analytics: "⚠️ Медленно!", path: "warning" },
                    { text: "Can you do $6,200? Just $50 more?", quality: "aggressive", analytics: "🔴 После final!", path: "reject_final_final" },
                    { text: "I need to check with my boss first.", quality: "fail", analytics: "❌ Нет решения!", path: "reject_weak_final" }
                ]
            },
            // ШАГ 4: НЕОЖИДАННЫЙ ПОВОРОТ - Груз увеличился!
            {
                brokerQuestion: "Perfect! Wait - shipper just called, they added 2 more pallets. Now 43,000 lbs total instead of 41,000. Still fits in 53ft reefer. Can you handle it or should I find someone else?",
                dispatcherPrompt: "⚠️ ГРУЗ УВЕЛИЧИЛСЯ! +2,000 lbs. Можете взять или откажетесь?",
                suggestions: [
                    { text: "No problem! 43,000 lbs fits perfectly in 53ft reefer. We're good to go. Same rate $6,150?", quality: "excellent", analytics: "✨ Гибкость!", path: "master" },
                    { text: "Yes, 43,000 lbs is fine. We can handle it.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "43,000 lbs okay.", quality: "normal", analytics: "⚪ Коротко.", path: "master" },
                    { text: "I think it's okay... maybe...", quality: "weak", analytics: "⚠️ Неуверенно!", path: "warning" },
                    { text: "Extra weight means extra $100!", quality: "aggressive", analytics: "🔴 Жадность!", path: "reject_rate_final" },
                    { text: "That's too heavy for us.", quality: "fail", analytics: "❌ Отказ!", path: "reject_weak_final" }
                ]
            },
            // ШАГ 5: БРОКЕР ПРОВЕРЯЕТ DOT (быстро)
            {
                brokerQuestion: "Good! DOT number? I'm running quick check right now while we talk.",
                dispatcherPrompt: "💎 DOT number! Быстро!",
                suggestions: [
                    { text: "DOT 123456. Clean record, last inspection 2 weeks ago, zero violations. Safety rating Satisfactory. Check away!", quality: "excellent", analytics: "✨ Уверенно!", path: "master" },
                    { text: "DOT 123456. Clean record, last inspection 2 weeks ago.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "DOT 123456. Clean.", quality: "normal", analytics: "⚪ Минимально.", path: "master" },
                    { text: "Let me find DOT number...", quality: "weak", analytics: "⚠️ Медленно!", path: "warning" },
                    { text: "Why you need DOT? You don't trust me?", quality: "aggressive", analytics: "🔴 Защита!", path: "reject_attitude_final" },
                    { text: "I don't have DOT handy.", quality: "fail", analytics: "❌ Нет DOT!", path: "reject_weak_final" }
                ]
            },
            // ШАГ 6: БРОКЕР ДАЕТ ДЕТАЛИ БЫСТРО
            {
                brokerQuestion: "DOT checks out, good. Pickup: Denver Cold Storage, 1234 Dairy Ave, TODAY 2 PM sharp. Delivery: Boston Dairy Hub, Wednesday 8 AM. Temp 34-38°F, check every 2 hours. Email for rate con?",
                dispatcherPrompt: "💎 Детали + email! Подтвердите все!",
                suggestions: [
                    { text: "Perfect! dispatch@dairyhau.com. Confirmed: Denver Cold Storage 2 PM today, Boston Wednesday 8 AM, temp 34-38°F monitored every 2 hours. Your dairy is in expert hands!", quality: "excellent", analytics: "✨ Все подтверждено!", path: "master" },
                    { text: "dispatch@dairyhaul.com. Denver 2 PM today, Boston Wednesday 8 AM, temp 34-38°F. Confirmed!", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "dispatch@dairyhaul.com. All confirmed.", quality: "normal", analytics: "⚪ Минимально.", path: "master" },
                    { text: "Let me write this down...", quality: "weak", analytics: "⚠️ Медленно!", path: "warning" },
                    { text: "Send details in text message.", quality: "aggressive", analytics: "🔴 Непрофессионально!", path: "reject_email_final" },
                    { text: "Wait, what was the address?", quality: "fail", analytics: "❌ Не слушал!", path: "reject_weak_final" }
                ]
            },
            // ШАГ 7: БОНУС - Брокер предлагает backhaul!
            {
                brokerResponse: "Excellent! Rate con sent to dispatch@dairyhaul.com. Sign in 15 minutes. Listen - you handled this perfectly under pressure. I got another load for you: Boston back to Denver, picks up Thursday. Interested?",
                dispatcherPrompt: "🎁 БОНУС! Брокер предлагает backhaul! Интересно?",
                suggestions: [
                    { text: "Absolutely interested! What's the cargo and rate? I love round trips - saves deadhead miles!", quality: "excellent", analytics: "✨ Энтузиазм!", path: "master" },
                    { text: "Yes, interested! What's the details?", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Maybe. What is it?", quality: "normal", analytics: "⚪ Нейтрально.", path: "master" },
                    { text: "I need to check schedule first...", quality: "weak", analytics: "⚠️ Неуверенно!", path: "warning" },
                    { text: "Depends on the rate!", quality: "aggressive", analytics: "🔴 Только деньги!", path: "master" },
                    { text: "No, I need to get home.", quality: "fail", analytics: "❌ Упущенная возможность!", path: "master" }
                ]
            },
            // ШАГ 8: BACKHAUL ДЕТАЛИ
            {
                brokerQuestion: "Boston to Denver, 1,990 miles, dry van load - medical supplies, 38,000 lbs. Picks up Thursday 2 PM, delivers Saturday. I can do $5,200 ($2.61/mile). Combined with your dairy run, that's $11,350 for round trip. You in?",
                dispatcherPrompt: "💰 BACKHAUL: $5,200. Итого $11,350 за round trip! Отличная сделка!",
                suggestions: [
                    { text: "That's perfect! $11,350 round trip is excellent! I'm in! Let's book both loads. This is exactly what I wanted!", quality: "excellent", analytics: "✨ Отличная сделка!", path: "master" },
                    { text: "Yes! $11,350 round trip works great. Let's do both loads!", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Okay, I'll take both.", quality: "normal", analytics: "⚪ Нейтрально.", path: "master" },
                    { text: "Can you do $5,300 on backhaul?", quality: "weak", analytics: "⚠️ Жадность!", path: "warning" },
                    { text: "I need $5,500 for backhaul!", quality: "aggressive", analytics: "🔴 Слишком много!", path: "reject_rate_final" },
                    { text: "Just the dairy load, not backhaul.", quality: "fail", analytics: "❌ Упущено!", path: "master" }
                ]
            },
            // ШАГ 9: SUCCESS OUTCOME
            {
                brokerResponse: "BOOM! Done deal! Both loads booked. You're a pro - fast decisions, no BS. I'm adding you to my preferred reefer AND dry van list. I got 15-20 loads weekly on this lane. You just became my go-to carrier. Rate cons sent. Let's make money together!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$11,350 (round trip)",
                    ratePerMile: "$2.85/mile average",
                    relationship: "preferred carrier",
                    weeklyLoads: "15-20 loads weekly Denver-Boston lane ($170,250-227,000/week potential)",
                    feedback: `🔥 НЕВЕРОЯТНО! Round trip за $11,350!\n\n💰 ФИНАНСЫ:\n• Dairy load: $6,150 (Denver→Boston)\n• Backhaul: $5,200 (Boston→Denver)\n• ИТОГО: $11,350\n• Дизель: -$1,584 (3,980 miles × 0.125 gal/mi × $3.20)\n• Чистая прибыль: $9,766 (86%)\n\n🎯 УРОК: Быстрые решения + гибкость = preferred carrier status! Брокер нарушил правила (назвал цену первым), но ты использовал это! Round trips = золото!\n\n⭐ БОНУС: 15-20 loads weekly = $681,000-908,000/месяц потенциал!`
                }
            }
        ],

        // WARNING PATH - короткий (3 шага)
        warning: [
            // WARNING ШАГ 1
            {
                brokerResponse: "⚠️ Hey! I need FAST answers for urgent load! Can you be more decisive? Time is money!",
                dispatcherPrompt: "💡 Брокер хочет скорость! Будьте решительнее!",
                suggestions: [
                    { text: "You're right! I apologize. Reefer in Denver, pre-cooled, driver ready 2 PM. MC 667788, DairyHaul. Let's move fast!", quality: "excellent", analytics: "✨ Исправился!", path: "master" },
                    { text: "Sorry! Reefer ready, driver ready 2 PM. Let's go!", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Reefer ready. 2 PM okay.", quality: "normal", analytics: "⚪ Минимально.", path: "master" },
                    { text: "I'm trying to be fast...", quality: "weak", analytics: "⚠️ Все еще медленно!", path: "reject_weak_final" },
                    { text: "Don't rush me!", quality: "aggressive", analytics: "🔴 Конфликт!", path: "reject_attitude_final" },
                    { text: "I need time to think.", quality: "fail", analytics: "❌ Нет срочности!", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 2
            {
                brokerResponse: "⚠️ Come on! I need clear confirmation - can you handle this or not?",
                dispatcherPrompt: "💡 Брокер теряет терпение! Четкий ответ!",
                suggestions: [
                    { text: "YES! I can handle it! 43,000 lbs, temp 34-38°F, Denver 2 PM to Boston Wednesday 8 AM. Confirmed!", quality: "excellent", analytics: "✨ Четко!", path: "master" },
                    { text: "Yes! I can handle it! All confirmed!", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Yes, confirmed.", quality: "normal", analytics: "⚪ Минимально.", path: "master" },
                    { text: "I think so...", quality: "weak", analytics: "⚠️ Неуверенно!", path: "reject_weak_final" },
                    { text: "Why so pushy?", quality: "aggressive", analytics: "🔴 Конфликт!", path: "reject_attitude_final" },
                    { text: "Maybe not for me.", quality: "fail", analytics: "❌ Отказ!", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 3
            {
                brokerResponse: "⚠️ Last chance - you want this load or should I call next carrier on my list?",
                dispatcherPrompt: "🚨 ПОСЛЕДНИЙ ШАНС! Да или нет!",
                suggestions: [
                    { text: "YES! I want it! dispatch@dairyhaul.com. Everything confirmed. Let's do this!", quality: "excellent", analytics: "✨ Решительно!", path: "master" },
                    { text: "Yes! I want it! Let's book it!", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Yes, I'll take it.", quality: "normal", analytics: "⚪ Минимально.", path: "master" },
                    { text: "Well, if you insist...", quality: "weak", analytics: "⚠️ Слабо!", path: "reject_weak_final" },
                    { text: "Fine! But don't rush me!", quality: "aggressive", analytics: "🔴 Конфликт!", path: "reject_attitude_final" },
                    { text: "I don't know...", quality: "fail", analytics: "❌ Нет решения!", path: "reject_weak_final" }
                ]
            }
        ],

        // WARNING_STRICT PATH
        warning_strict: [
            {
                brokerResponse: "⚠️ STOP! This is URGENT dairy load! I don't have time for games! You want it or not? YES or NO!",
                dispatcherPrompt: "🚨 БРОКЕР ВЗОРВАЛСЯ! Да или нет - СЕЙЧАС!",
                suggestions: [
                    { text: "YES! I sincerely apologize! Reefer in Denver ready 2 PM. MC 667788, DairyHaul, $100K insurance. Driver 8 years dairy experience. dispatch@dairyhaul.com. Let's do this professionally!", quality: "excellent", analytics: "✨ Полное исправление!", path: "master" },
                    { text: "YES! I apologize! Reefer ready, all confirmed. Let's go!", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "Yes. Ready.", quality: "normal", analytics: "⚪ Минимально.", path: "master" },
                    { text: "I said yes...", quality: "weak", analytics: "⚠️ Защита!", path: "reject_attitude_final" },
                    { text: "Don't yell at me!", quality: "aggressive", analytics: "🔴 Конфликт!", path: "reject_attitude_final" },
                    { text: "This is too stressful.", quality: "fail", analytics: "❌ Сдался!", path: "reject_weak_final" }
                ]
            }
        ],

        // REJECT PATHS
        reject_weak_final: [
            {
                brokerResponse: "Sorry, I need decisive carrier for urgent dairy. Can't risk it. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Urgent loads требуют быстрых решений! Медлительность = потерянный груз!"
                }
            }
        ],

        reject_attitude_final: [
            {
                brokerResponse: "I don't work with difficult carriers. Life's too short. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Агрессивный брокер + агрессивный диспетчер = конфликт! Нужна гибкость!"
                }
            }
        ],

        reject_timing_final: [
            {
                brokerResponse: "2 PM pickup is non-negotiable for dairy schedule. I need carrier who can meet timing. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Urgent dairy timing критичен! Не можешь 2 PM = не получишь груз!"
                }
            }
        ],

        reject_rate_final: [
            {
                brokerResponse: "That's way too high for my budget. I need realistic carrier. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Жадность убивает сделки! Брокер уже назвал хорошую цену первым!"
                }
            }
        ],

        reject_final_final: [
            {
                brokerResponse: "I said final. I don't negotiate after final. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Final = final! Торг после final = неуважение!"
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

allScenarios.push(scenario7);
console.log('✅ Scenario 7 loaded: Reefer Dairy Products (Denver → Boston) - RULE-BREAKING: aggressive broker, price first, backhaul bonus!');
