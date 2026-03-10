// DIALOGUE #8 - Flatbed Construction Equipment (MAXIMUM RULE-BREAKING)
// Phoenix AZ → New York NY, 2,410 miles
// Posted: $10,850 ($4.50/mile), Target: ???
// Created: March 9, 2026
// STRUCTURE: НАРУШАЕТ ВСЕ ПРАВИЛА - дружелюбный болтливый брокер, груз меняется, конкурент появляется
// QUALITY: Premium - хаотичный но реалистичный

console.log('🔵 Loading scenarios-data-v8.js...');

const scenario8 = {
    id: 8,
    route: "Phoenix AZ → New York NY",
    distance: 2410,
    equipment: "Flatbed (48ft)",
    cargo: "Construction equipment (excavator)",
    weight: "45,000 lbs (MAX!)",
    postedRate: "$10,850 ($4.50/mile)",
    deadline: "Pickup tomorrow 6 AM, Delivery in 5 days",
    brokerStyle: "Friendly chatty broker - tells stories, jokes, but shrewd negotiator",
    difficulty: "hard",
    initialMessage: "Good morning! This is Jake from HeavyHaul Brokers.\nI'm calling about your posted flatbed load Phoenix to New York with construction equipment.\nIs this load still available?",

    paths: {
        master: [
            // ШАГ 1: БРОКЕР ДРУЖЕЛЮБНЫЙ И БОЛТЛИВЫЙ
            {
                brokerQuestion: "Hey there! This is Mike from BigRig Logistics. Yeah it's available! Man, beautiful day in Phoenix, right? Anyway - this is a sweet load, excavator going to NYC construction site. 45,000 lbs, that's max weight baby! You run flatbeds? What's your setup?",
                dispatcherPrompt: "💎 Брокер дружелюбный! Excavator 45,000 lbs (MAX вес!). Расскажите про flatbed!",
                suggestions: [
                    { text: "Good morning Mike! Beautiful day indeed! Yes, we run flatbeds - MC 889900, SteelHorse Transport. 12 flatbeds, all 48ft with heavy-duty chains and tarps. Specialized in construction equipment for 10 years. Excavator sounds perfect for us!", quality: "excellent", analytics: "✨ Дружелюбно и профессионально!", path: "master" },
                    { text: "Morning Mike! Yes, flatbeds. MC 889900, SteelHorse. 12 flatbeds. Construction equipment our specialty.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "MC 889900, SteelHorse. Flatbeds available.", quality: "normal", analytics: "⚪ Сухо.", path: "warning" },
                    { text: "We have flatbeds...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Skip the small talk, what's the rate?", quality: "aggressive", analytics: "🔴 Грубо!", path: "warning_strict" },
                    { text: "Flatbed here.", quality: "fail", analytics: "❌ Нет MC!", path: "warning_strict" }
                ]
            },
            // ШАГ 2: БРОКЕР РАССКАЗЫВАЕТ ИСТОРИЮ (нарушение - слишком болтливый)
            {
                brokerQuestion: "SteelHorse! I like that name! You know, I worked with a carrier called IronHorse once - totally different company but similar vibe. Good people. Anyway, this excavator - it's a Caterpillar 320, about 22 tons. Customer is building new hotel in Manhattan. Where's your flatbed at? Can you grab it tomorrow 6 AM Phoenix?",
                dispatcherPrompt: "💎 Брокер болтает! Cat 320 excavator. Местоположение + pickup 6 AM?",
                suggestions: [
                    { text: "Ha! IronHorse and SteelHorse - we should team up! Flatbed in Phoenix at equipment yard, empty since yesterday. Heavy-duty chains rated for 25 tons, tarps ready. Driver experienced with Cat equipment. 6 AM tomorrow works perfect. Manhattan hotel project sounds exciting!", quality: "excellent", analytics: "✨ Поддержал разговор!", path: "master" },
                    { text: "Nice! Flatbed in Phoenix at equipment yard. Chains for 25 tons, tarps ready. Driver ready 6 AM tomorrow.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Flatbed in Phoenix. Ready 6 AM.", quality: "normal", analytics: "⚪ Коротко.", path: "warning" },
                    { text: "Should be in Phoenix...", quality: "weak", analytics: "⚠️ Неуверенно!", path: "warning" },
                    { text: "Can we focus on business?", quality: "aggressive", analytics: "🔴 Нетерпеливо!", path: "warning_strict" },
                    { text: "Maybe 8 AM better?", quality: "fail", analytics: "❌ Не вовремя!", path: "reject_timing_final" }
                ]
            },
            // ШАГ 3: БРОКЕР НАЗЫВАЕТ ЦЕНУ ПЕРВЫМ! (нарушение)
            {
                brokerQuestion: "Perfect! Look, I'm gonna level with you - I got budget of $11,200 for this. That's $4.65/mile. Posted was $10,850 but shipper added $350 for good carrier. You seem solid. But before we shake on it - insurance? I need $200K for construction equipment.",
                dispatcherPrompt: "💰 БРОКЕР НАЗВАЛ $11,200 ПЕРВЫМ! Можно попросить больше! Insurance $200K?",
                suggestions: [
                    { text: "I appreciate the honesty Mike! $11,200 is good but for 45,000 lbs max weight excavator cross-country, I'm thinking $11,500. That's $4.77/mile - fair for heavy equipment expertise. Insurance: $200K cargo through Hartford, $1M liability, current certificates. What do you say?", quality: "excellent", analytics: "✨ Попросил больше профессионально!", path: "master" },
                    { text: "$11,350 would work better for max weight. Insurance: $200K cargo, $1M liability, current.", quality: "good", analytics: "✔️ Попросил чуть больше!", path: "master" },
                    { text: "$11,200 works. $200K cargo, $1M liability.", quality: "normal", analytics: "⚪ Принял сразу.", path: "master" },
                    { text: "I guess $11,200 okay... have insurance...", quality: "weak", analytics: "⚠️ Неуверенно!", path: "warning" },
                    { text: "I need $12,000 minimum for excavator!", quality: "aggressive", analytics: "🔴 Слишком много!", path: "reject_rate_final" },
                    { text: "$11,200 too low.", quality: "fail", analytics: "❌ Отказ без контр-оффера!", path: "reject_weak_final" }
                ]
            },
            // ШАГ 4: НЕОЖИДАННО - КОНКУРЕНТ! (нарушение - появляется другой carrier)
            {
                brokerQuestion: "You know what? You're right. $11,500 is fair. But hold on - I just got call from another carrier offering $11,100. They're good too. Can you match $11,100 or should I go with them? I like you better but... you know, business is business.",
                dispatcherPrompt: "⚠️ КОНКУРЕНТ! Предложил $11,100. Match или держите $11,500?",
                suggestions: [
                    { text: "Mike, I respect the honesty. But here's the thing - we're not just cheaper, we're BETTER. 10 years construction equipment experience, zero damage claims, preferred carrier for 3 major construction companies. $11,500 gets you peace of mind. Your call - save $400 or guarantee safe delivery?", quality: "excellent", analytics: "✨ Продал ценность!", path: "master" },
                    { text: "I understand business. But our experience with excavators is worth $400. Your choice - cheap or reliable?", quality: "good", analytics: "✔️ Уверенно!", path: "master" },
                    { text: "Okay, I'll match $11,100.", quality: "normal", analytics: "⚪ Сдался.", path: "master" },
                    { text: "Well... if you think they're better...", quality: "weak", analytics: "⚠️ Слабо!", path: "warning" },
                    { text: "Fine! $11,100 but that's my final!", quality: "aggressive", analytics: "🔴 Обиженно!", path: "master" },
                    { text: "Go with them then.", quality: "fail", analytics: "❌ Сдался!", path: "reject_weak_final" }
                ]
            },
            // ШАГ 5: БРОКЕР ПЕРЕДУМАЛ - ВЫБРАЛ ВАС! (если держали цену)
            {
                brokerQuestion: "You know what? You sold me! That confidence, that experience - that's what I need for $200K excavator. $11,500 it is! Other guy was cheaper but you're RIGHT - peace of mind is worth it. Okay, DOT number? And tell me about your driver's heavy equipment experience.",
                dispatcherPrompt: "🎉 БРОКЕР ВЫБРАЛ ВАС! $11,500! DOT + опыт водителя!",
                suggestions: [
                    { text: "That's the right choice Mike! DOT 234567, clean record, last inspection 2 weeks ago. Driver has 12 years heavy equipment experience - excavators, bulldozers, cranes. Knows proper chaining for Cat 320. This excavator is in expert hands!", quality: "excellent", analytics: "✨ ОТЛИЧНО!", path: "master" },
                    { text: "Great choice! DOT 234567, clean record. Driver 12 years heavy equipment experience. Knows Cat equipment well.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "DOT 234567. Driver experienced with excavators.", quality: "normal", analytics: "⚪ Минимально.", path: "master" },
                    { text: "Let me find DOT...", quality: "weak", analytics: "⚠️ Медленно!", path: "warning" },
                    { text: "See? I told you we're better!", quality: "aggressive", analytics: "🔴 Хвастается!", path: "warning" },
                    { text: "DOT... somewhere...", quality: "fail", analytics: "❌ Нет DOT!", path: "reject_weak_final" }
                ]
            },
            // ШАГ 6: БРОКЕР ШУТИТ И ДАЕТ ДЕТАЛИ
            {
                brokerQuestion: "12 years! This guy's been chaining excavators since I was in college! Love it. Okay - pickup: Phoenix Heavy Equipment, 5678 Industrial Blvd, tomorrow 6 AM. Delivery: Manhattan Construction Site, 42nd Street, Friday 10 AM. They're building 50-story hotel - your excavator is the star! Email for paperwork?",
                dispatcherPrompt: "💎 Детали + email! Подтвердите все!",
                suggestions: [
                    { text: "Ha! Your driver probably has more experience than both of us combined! dispatch@steelhorse.com. Confirmed: Phoenix 6 AM tomorrow, Manhattan Friday 10 AM. 50-story hotel - that excavator will be famous! We'll take good care of the star!", quality: "excellent", analytics: "✨ Поддержал шутку!", path: "master" },
                    { text: "dispatch@steelhorse.com. Phoenix 6 AM tomorrow, Manhattan Friday 10 AM confirmed. We'll handle it professionally!", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "dispatch@steelhorse.com. All confirmed.", quality: "normal", analytics: "⚪ Сухо.", path: "master" },
                    { text: "Let me write this down...", quality: "weak", analytics: "⚠️ Медленно!", path: "warning" },
                    { text: "Just send the paperwork.", quality: "aggressive", analytics: "🔴 Нетерпеливо!", path: "warning" },
                    { text: "What was the address again?", quality: "fail", analytics: "❌ Не слушал!", path: "reject_weak_final" }
                ]
            },
            // ШАГ 7: НЕОЖИДАННЫЙ ПОВОРОТ - Груз изменился! (нарушение)
            {
                brokerQuestion: "Perfect! Paperwork sent. Oh man - shipper just texted me. They want to add small generator on same flatbed, 2,000 lbs. Total now 47,000 lbs. That's OVER max! Can your flatbed handle 47K or we got problem? I can add $200 for the trouble.",
                dispatcherPrompt: "⚠️ ГРУЗ УВЕЛИЧИЛСЯ! 47,000 lbs = OVERWEIGHT! Можете взять + $200?",
                suggestions: [
                    { text: "Mike, 47,000 lbs is overweight - legal max is 45,000 lbs for flatbed without permits. BUT - I can get overweight permit for Arizona and cross-country. Takes 2 hours, costs $150. With your $200, that's $50 profit for me. Let's do it - I'll handle permits!", quality: "excellent", analytics: "✨ Решение проблемы!", path: "master" },
                    { text: "47K is overweight but I can get permits. With your $200 it works. Let's do it!", quality: "good", analytics: "✔️ Гибкость!", path: "master" },
                    { text: "Okay, 47K with $200 works.", quality: "normal", analytics: "⚪ Согласился.", path: "master" },
                    { text: "47K is overweight... I don't know...", quality: "weak", analytics: "⚠️ Неуверенно!", path: "warning" },
                    { text: "Overweight needs $500 more, not $200!", quality: "aggressive", analytics: "🔴 Жадность!", path: "reject_rate_final" },
                    { text: "Can't do overweight.", quality: "fail", analytics: "❌ Негибкость!", path: "reject_weak_final" }
                ]
            },
            // ШАГ 8: БРОКЕР В ВОСТОРГЕ - ПРЕДЛАГАЕТ ДОЛГОСРОЧНЫЙ КОНТРАКТ! (нарушение - обычно не предлагают контракт сразу)
            {
                brokerResponse: "YOU'RE A ROCKSTAR! Permits, problem-solving, positive attitude - this is EXACTLY what I need! Listen - I got 20-25 heavy equipment loads monthly on this lane. Hotels, construction, infrastructure. How about we do monthly contract? $11,000-12,000 per load depending on equipment. Guaranteed 20 loads minimum. That's $220,000-240,000/month! You interested?",
                dispatcherPrompt: "🎁 КОНТРАКТ! 20-25 loads/month, $220K-240K! Интересно?",
                suggestions: [
                    { text: "Mike, you just made my day! ABSOLUTELY interested! Monthly contract with 20 loads minimum is exactly what we're looking for! Let's build long-term partnership. Send me contract details and let's make this official!", quality: "excellent", analytics: "✨ Энтузиазм!", path: "master" },
                    { text: "Yes! Very interested! 20 loads monthly is perfect. Let's do contract!", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Interested. Send contract details.", quality: "normal", analytics: "⚪ Нейтрально.", path: "master" },
                    { text: "I need to discuss with my boss first...", quality: "weak", analytics: "⚠️ Нерешительно!", path: "warning" },
                    { text: "Contract needs $12,500 per load minimum!", quality: "aggressive", analytics: "🔴 Жадность!", path: "reject_rate_final" },
                    { text: "Not interested in contracts.", quality: "fail", analytics: "❌ Упущено!", path: "reject_weak_final" }
                ]
            },
            // ШАГ 9: SUCCESS OUTCOME
            {
                brokerResponse: "DONE! Contract sent to dispatch@steelhorse.com. You're now my preferred heavy equipment carrier! First load is this excavator at $11,700 ($11,500 + $200 for generator). Then 19 more loads this month. You just hit the jackpot my friend! Let's make millions together! Safe travels!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$11,700 (first load) + $220,000-240,000/month contract",
                    ratePerMile: "$4.85/mile (first load)",
                    relationship: "monthly contract - preferred carrier",
                    weeklyLoads: "20-25 heavy equipment loads monthly ($220,000-240,000/month GUARANTEED)",
                    feedback: `🏆 ДЖЕКПОТ! Месячный контракт на $220K-240K!\n\n💰 ПЕРВЫЙ ГРУЗ:\n• Ставка: $11,700 ($11,500 + $200 за generator)\n• Дизель: -$964 (2,410 miles × 0.125 gal/mi × $3.20)\n• Чистая прибыль: $10,736 (92%)\n\n📋 МЕСЯЧНЫЙ КОНТРАКТ:\n• 20-25 loads/month\n• $11,000-12,000 per load\n• ГАРАНТИЯ: $220,000-240,000/month\n• Годовой потенциал: $2,640,000-2,880,000!\n\n🎯 УРОК: Уверенность + гибкость + позитив = КОНТРАКТ! Ты:\n✅ Держал цену против конкурента\n✅ Решил проблему с overweight\n✅ Поддержал дружелюбный стиль брокера\n✅ Показал энтузиазм к контракту\n\n⭐ Это ЛУЧШИЙ результат из всех диалогов!`
                }
            }
        ],

        // WARNING PATH - короткий (2 шага)
        warning: [
            {
                brokerResponse: "⚠️ Hey, you seem unsure. I need confident carrier for $200K excavator. Can you handle this professionally or should I call someone else?",
                dispatcherPrompt: "💡 Брокер сомневается! Покажите уверенность!",
                suggestions: [
                    { text: "You're absolutely right Mike! I apologize for uncertainty. We CAN handle this! MC 889900, SteelHorse, 12 flatbeds, 10 years construction equipment. Flatbed in Phoenix ready 6 AM. $200K insurance. Driver 12 years experience. Let's do this professionally!", quality: "excellent", analytics: "✨ Исправился!", path: "master" },
                    { text: "Sorry! We can handle it! Flatbed ready, insurance good, driver experienced. Let's go!", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Yes, we can handle it.", quality: "normal", analytics: "⚪ Минимально.", path: "master" },
                    { text: "I think we can...", quality: "weak", analytics: "⚠️ Все еще неуверенно!", path: "reject_weak_final" },
                    { text: "Stop pressuring me!", quality: "aggressive", analytics: "🔴 Конфликт!", path: "reject_attitude_final" },
                    { text: "Maybe not for us.", quality: "fail", analytics: "❌ Сдался!", path: "reject_weak_final" }
                ]
            },
            {
                brokerResponse: "⚠️ Okay, I'm giving you one more chance. Are you IN or OUT? I need YES or NO right now!",
                dispatcherPrompt: "🚨 ПОСЛЕДНИЙ ШАНС! Да или нет!",
                suggestions: [
                    { text: "YES! I'm IN! 100% committed! dispatch@steelhorse.com. Everything confirmed. Let's make this happen!", quality: "excellent", analytics: "✨ Решительно!", path: "master" },
                    { text: "YES! I'm in! Let's do it!", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Yes, in.", quality: "normal", analytics: "⚪ Минимально.", path: "master" },
                    { text: "Well, okay...", quality: "weak", analytics: "⚠️ Слабо!", path: "reject_weak_final" },
                    { text: "Don't rush me!", quality: "aggressive", analytics: "🔴 Конфликт!", path: "reject_attitude_final" },
                    { text: "I don't know...", quality: "fail", analytics: "❌ Нет решения!", path: "reject_weak_final" }
                ]
            }
        ],

        // WARNING_STRICT PATH
        warning_strict: [
            {
                brokerResponse: "⚠️ WHOA! I'm trying to be friendly here but you're being difficult! This is $200K excavator, not a joke! You want this load or should I move on? Last chance!",
                dispatcherPrompt: "🚨 БРОКЕР ОБИДЕЛСЯ! Извинитесь и покажите профессионализм!",
                suggestions: [
                    { text: "Mike, I sincerely apologize! You're being great and I'm being unprofessional. Let me start over: MC 889900, SteelHorse Transport, 12 flatbeds specialized in construction equipment. Flatbed in Phoenix ready 6 AM. $200K insurance. Driver 12 years experience. I WANT this load. Let's work together professionally!", quality: "excellent", analytics: "✨ Полное исправление!", path: "master" },
                    { text: "I apologize Mike! MC 889900, SteelHorse. Flatbed ready, insurance good. I want this load!", quality: "good", analytics: "✔️ Исправился!", path: "master" },
                    { text: "Sorry. MC 889900. Ready.", quality: "normal", analytics: "⚪ Минимально.", path: "master" },
                    { text: "I didn't mean to be difficult...", quality: "weak", analytics: "⚠️ Защита!", path: "reject_attitude_final" },
                    { text: "You're too sensitive!", quality: "aggressive", analytics: "🔴 Еще хуже!", path: "reject_attitude_final" },
                    { text: "This is too stressful.", quality: "fail", analytics: "❌ Сдался!", path: "reject_weak_final" }
                ]
            }
        ],

        // REJECT PATHS
        reject_weak_final: [
            {
                brokerResponse: "Sorry man, I need confident carrier for heavy equipment. Can't risk $200K excavator with uncertainty. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Heavy equipment требует уверенности! Неуверенность = потерянный контракт на $220K/месяц!"
                }
            }
        ],

        reject_attitude_final: [
            {
                brokerResponse: "You know what? Life's too short to work with difficult people. I got 100 other carriers. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Дружелюбный брокер + грубый диспетчер = конфликт! Упущен контракт на $220K/месяц!"
                }
            }
        ],

        reject_timing_final: [
            {
                brokerResponse: "6 AM pickup is critical for construction schedule. I need carrier who can meet timing. Thanks!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Construction timing критичен! Не можешь 6 AM = не получишь контракт!"
                }
            }
        ],

        reject_rate_final: [
            {
                brokerResponse: "That's way too high for my budget. I need realistic carrier. Thanks!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Жадность убивает контракты! Брокер предложил хорошую цену + контракт!"
                }
            }
        ]
    }
};

allScenarios.push(scenario8);
console.log('✅ Scenario 8 loaded: Flatbed Construction Equipment (Phoenix → New York) - MAXIMUM RULE-BREAKING: chatty broker, competitor appears, contract offer!');
