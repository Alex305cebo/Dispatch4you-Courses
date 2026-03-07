// СИМУЛЬ - База диалогов для обучения диспетчеров
// Версия: 10.0 (NEW DIALOG SYSTEM V2.0)
// Дата: 2026-03-06
// ПРАВИЛО: Диспетчер звонит первым! 6 вариантов качества в каждом шаге!

console.log('🔵 Loading scenarios-data-v4.js...');

// ДИАЛОГ 4: GENERAL FREIGHT - CONSUMER GOODS (MEDIUM VERSION - 8 STEPS)
const scenario4 = {
    id: 4,
    route: "Indianapolis IN → Charlotte NC",
    distance: 650,
    equipment: "Dry Van (53ft)",
    brokerStyle: "Professional regional broker",
    difficulty: "easy",
    cargo: "Consumer goods (mixed pallets)",
    weight: "42,000 lbs",
    deadline: "Pickup today 8 AM - 5 PM, Delivery tomorrow by 6 PM",

    initialMessage: "Good morning! I saw your load posting for Indianapolis to Charlotte.\nCan you tell me more about this load?",

    paths: {
        master: [
            // ШАГ 1: Брокер отвечает на звонок + MC verification
            {
                brokerQuestion: "Good morning! Yes, this is a dry van load.\nIndianapolis IN to Charlotte NC, 650 miles.\n42,000 lbs consumer goods, mixed pallets.\nPickup today 8 AM-5 PM, delivery tomorrow by 6 PM.\nWhat's your MC number?",
                dispatcherPrompt: "💎 Брокер дал информацию по грузу и спрашивает MC номер. Представьтесь профессионально.",
                suggestions: [
                    {
                        text: "My MC is 778899. We're a reliable carrier with excellent safety rating. Truck is in Indianapolis right now, empty and ready. What's your rate?",
                        quality: "excellent",
                        analytics: "✨ Отлично! MC + опыт + местоположение + вопрос о ставке.",
                        path: "master"
                    },
                    {
                        text: "MC 778899. We have a truck available in Indianapolis. What are you offering?",
                        quality: "good",
                        analytics: "✔️ Хорошо! MC + доступность + вопрос.",
                        path: "master"
                    },
                    {
                        text: "MC 778899. We can do this load. What's the rate?",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовая информация.",
                        path: "master"
                    },
                    {
                        text: "Uh, MC 778899. We might be able to do it.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенность.",
                        path: "master"
                    },
                    {
                        text: "MC 778899. Just tell me the rate already!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Грубость.",
                        path: "reject1"
                    },
                    {
                        text: "Let me find my MC number...",
                        quality: "fail",
                        analytics: "❌ Провал. Не знает MC.",
                        path: "reject1"
                    }
                ]
            },
            // ШАГ 2: Брокер предлагает ставку
            {
                brokerQuestion: "Great! MC verified. For this load, I'm offering $1,600 all-in. That's $2.46/mile. Interested?",
                dispatcherPrompt: "💎 Брокер предложил $1,600. Можете торговаться.",
                suggestions: [
                    {
                        text: "$1,600 is fair, but I have another offer at $1,700. Can you match it?",
                        quality: "excellent",
                        analytics: "✨ Отлично! Умный торг с обоснованием.",
                        path: "master"
                    },
                    {
                        text: "Market rate is $1,650-1,700. Can you do $1,700?",
                        quality: "good",
                        analytics: "✔️ Хорошо! Ссылка на market rates.",
                        path: "master"
                    },
                    {
                        text: "$1,600 is okay, but can you do $1,650?",
                        quality: "normal",
                        analytics: "⚪ Нормально. Простой торг.",
                        path: "master"
                    },
                    {
                        text: "Hmm, I was hoping for more. Maybe $1,650?",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенный торг.",
                        path: "master"
                    },
                    {
                        text: "$1,600? That's insulting! I need $2,000!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Нереальная цена.",
                        path: "reject2"
                    },
                    {
                        text: "Let me check with my boss and call back.",
                        quality: "fail",
                        analytics: "❌ Провал. Нерешительность.",
                        path: "reject2"
                    }
                ]
            },
            // ШАГ 3: Торг - брокер увеличивает ставку
            {
                brokerQuestion: "You make a good point. I can go up to $1,750 all-in. That's my final offer. Deal?",
                dispatcherPrompt: "💎 Брокер увеличил до $1,750. Принять?",
                suggestions: [
                    {
                        text: "$1,750 works! What about detention pay?",
                        quality: "excellent",
                        analytics: "✨ Отлично! Принятие + вопрос о detention.",
                        path: "master"
                    },
                    {
                        text: "$1,750 is good. Can we discuss detention?",
                        quality: "good",
                        analytics: "✔️ Хорошо! Принятие + вопрос.",
                        path: "master"
                    },
                    {
                        text: "$1,750 confirmed. What's next?",
                        quality: "normal",
                        analytics: "⚪ Нормально. Подтверждение.",
                        path: "master"
                    },
                    {
                        text: "Okay, I think that works.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенность.",
                        path: "master"
                    },
                    {
                        text: "$1,750 is still low! $1,900 or I walk!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Жадность.",
                        path: "reject3"
                    },
                    {
                        text: "Let me think about it.",
                        quality: "fail",
                        analytics: "❌ Провал. Нерешительность.",
                        path: "reject3"
                    }
                ]
            },
            // ШАГ 4: Detention + Pickup details
            {
                brokerQuestion: "Perfect! Detention is $50/hour after 2 hours free time.\nPickup details:\nABC Distribution Center, 5500 W 74th St, Indianapolis IN 46278\nContact: Mike Johnson 317-555-0188\nPickup today 8 AM - 5 PM. Call Mike 30 minutes before arrival.\nAny questions?",
                dispatcherPrompt: "💎 Брокер дал detention и pickup детали. Задайте вопросы.",
                suggestions: [
                    {
                        text: "Got it! ABC Distribution, 5500 W 74th St, Mike 317-555-0188, 8 AM-5 PM. Questions: How long does loading take? Do they provide load locks?",
                        quality: "excellent",
                        analytics: "✨ Отлично! Подтверждение + важные вопросы.",
                        path: "master"
                    },
                    {
                        text: "Understood. Mike 317-555-0188, 8 AM-5 PM. How long is loading?",
                        quality: "good",
                        analytics: "✔️ Хорошо! Подтверждение + вопрос.",
                        path: "master"
                    },
                    {
                        text: "Got it. Pickup today 8 AM-5 PM. What's the delivery address?",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "5500 W 74th - is that easy to find?",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неважный вопрос.",
                        path: "master"
                    },
                    {
                        text: "Too much info! Just email it all!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Отказ записывать.",
                        path: "reject4"
                    },
                    {
                        text: "Wait, can you repeat the address?",
                        quality: "fail",
                        analytics: "❌ Провал. Не слушал.",
                        path: "reject4"
                    }
                ]
            },
            // ШАГ 5: Loading details + Delivery info
            {
                brokerQuestion: "Loading takes about 60 minutes. They provide 6 load locks.\nDelivery details:\nCharlotte Distribution Hub, 2200 Statesville Ave, Charlotte NC 28206\nContact: Sarah Williams 704-555-0199\nDelivery tomorrow by 6 PM. Call Sarah in the morning to confirm ETA.\nAny questions about delivery?",
                dispatcherPrompt: "💎 Брокер дал loading и delivery детали. Задайте вопросы.",
                suggestions: [
                    {
                        text: "Perfect! 60 min loading, 6 load locks. Charlotte Hub, 2200 Statesville Ave, Sarah 704-555-0199, tomorrow by 6 PM. Questions: How long is unloading? Do they have a dock?",
                        quality: "excellent",
                        analytics: "✨ Отлично! Подтверждение + важные вопросы.",
                        path: "master"
                    },
                    {
                        text: "Got it! Sarah 704-555-0199, tomorrow by 6 PM. How long is unloading?",
                        quality: "good",
                        analytics: "✔️ Хорошо! Подтверждение + вопрос.",
                        path: "master"
                    },
                    {
                        text: "Understood. Delivery tomorrow by 6 PM. Anything else?",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "Charlotte tomorrow. What time exactly?",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Не слушал (время уже сказано).",
                        path: "master"
                    },
                    {
                        text: "Yeah, yeah, we got it. Move on!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Грубость.",
                        path: "reject5"
                    },
                    {
                        text: "Can you text me all this info?",
                        quality: "fail",
                        analytics: "❌ Провал. Непрофессионально.",
                        path: "reject5"
                    }
                ]
            },
            // ШАГ 6: Unloading details + Factoring
            {
                brokerQuestion: "Unloading takes 1-2 hours, they have 4 docks. You'll need signed BOL.\nHow do you handle payment? Do you use factoring?",
                dispatcherPrompt: "💎 Брокер спрашивает про payment. Назовите factoring компанию.",
                suggestions: [
                    {
                        text: "We use Triumph Business Capital. Please send rate confirmation to factoring@triumphpay.com with our MC 778899. Do you need our insurance certificate?",
                        quality: "excellent",
                        analytics: "✨ Отлично! Factoring + email + MC + вопрос.",
                        path: "master"
                    },
                    {
                        text: "We work with OTR Solutions. Can you send rate con to their email? Do you need insurance?",
                        quality: "good",
                        analytics: "✔️ Хорошо! Factoring + вопрос.",
                        path: "master"
                    },
                    {
                        text: "We use RTS Financial. Should I give you their contact?",
                        quality: "normal",
                        analytics: "⚪ Нормально. Название factoring.",
                        path: "master"
                    },
                    {
                        text: "I think it's Triumph or RTS. Let me check.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Не уверен.",
                        path: "master"
                    },
                    {
                        text: "Why do you care? Just pay us directly!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Не понимает industry standard.",
                        path: "reject6"
                    },
                    {
                        text: "We don't use factoring. Can you pay cash?",
                        quality: "fail",
                        analytics: "❌ Провал. Red flag.",
                        path: "reject6"
                    }
                ]
            },
            // ШАГ 7: Insurance + Final confirmation
            {
                brokerQuestion: "Perfect! I'll send rate con to Triumph.\nYes, please email insurance certificate to loads@regionalfreight.com\nLet me confirm all details:\n- Indianapolis to Charlotte, 650 miles, $1,750 all-in\n- Pickup today 8 AM-5 PM at ABC Distribution (Mike 317-555-0188)\n- Delivery tomorrow by 6 PM at Charlotte Hub (Sarah 704-555-0199)\n- Detention $50/hr after 2 hours\nEverything correct?",
                dispatcherPrompt: "💎 Брокер дал полное резюме. Подтвердите все детали.",
                suggestions: [
                    {
                        text: "Perfect! Let me confirm: Indianapolis to Charlotte, $1,750 all-in. Pickup today 8-5 PM (Mike 317-555-0188), delivery tomorrow by 6 PM (Sarah 704-555-0199). Detention $50/hr. We're 100% confirmed! Sending NOA and insurance now.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Полное резюме + подтверждение.",
                        path: "master"
                    },
                    {
                        text: "Confirmed! Indianapolis today, Charlotte tomorrow. $1,750 all-in. Sending NOA and insurance now. Thank you!",
                        quality: "good",
                        analytics: "✔️ Хорошо! Краткое резюме + подтверждение.",
                        path: "master"
                    },
                    {
                        text: "Yes, everything is correct. Confirmed. Sending documents.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Простое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "Okay, I think I got everything. We'll be there.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенное подтверждение.",
                        path: "master"
                    },
                    {
                        text: "Yeah, we got it. Just send paperwork!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Грубость.",
                        path: "reject7"
                    },
                    {
                        text: "Wait, what was the pickup time again?",
                        quality: "fail",
                        analytics: "❌ Провал. Не слушал.",
                        path: "reject7"
                    }
                ]
            },
            // ШАГ 8: Outcome - Результат диалога
            {
                brokerResponse: "Excellent! You're very professional and organized.\nRate con sent to Triumph.\nLooking forward to working with you on this load.\nIf everything goes well, I have 3-5 similar loads weekly.\nGood luck!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$1,750",
                    ratePerMile: "$2.69/mile",
                    relationship: "Excellent - Weekly loads opportunity",
                    dialogueTime: "6-8 minutes",
                    questionsAsked: "8+ questions",
                    detailLevel: "high",
                    futureOpportunity: "repeat",
                    weeklyLoads: "3-5 similar loads weekly",
                    feedback: "🏆 ОТЛИЧНО! Вы выбили максимальную ставку $1,750!\n\n✅ ЧТО СДЕЛАНО ПРАВИЛЬНО:\n- Профессионально инициировали звонок\n- Умный торг с обоснованием (market rates, другие offers)\n- Выбили +$150 ($1,600 → $1,750)\n- Задали все важные вопросы (loading, unloading, detention)\n- Сделали полное резюме перед подтверждением\n- Быстро закрыли сделку\n\n💰 РЕЗУЛЬТАТ: $1,750 ($2.69/mile) - premium rate!\n\n🎯 УРОК: Умный торг = обоснование + профессионализм. Это дополнительные $7,800/год при 52 подобных грузах. Профессиональный подход открывает доступ к weekly loads (3-5 грузов/неделю = $5,250-8,750/неделю)."
                }
            }
        ],

        reject1: [
            {},
            {
                brokerResponse: "I need a more professional carrier. Thanks anyway.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    ratePerMile: "$0/mile",
                    relationship: "Rejected - Unprofessional",
                    dialogueTime: "1-2 minutes",
                    questionsAsked: "1 question",
                    detailLevel: "very low",
                    futureOpportunity: "unlikely",
                    weeklyLoads: "No loads",
                    feedback: "❌ ОТКАЗ: Непрофессиональный подход.\n\n💡 УРОК: Первое впечатление критично. Знайте свой MC, будьте вежливы и готовы к разговору."
                }
            }
        ],

        reject2: [
            {},
            {},
            {
                brokerResponse: "$2,000 for 650 miles? That's unrealistic. I'll move on to other carriers.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    ratePerMile: "$0/mile",
                    relationship: "Rejected - Unrealistic pricing",
                    dialogueTime: "3-4 minutes",
                    questionsAsked: "2 questions",
                    detailLevel: "low",
                    futureOpportunity: "unlikely",
                    weeklyLoads: "No loads",
                    feedback: "❌ ОТКАЗ: Нереальная цена.\n\n💡 УРОК: $2,000 для 650 миль = $3.08/mile слишком высоко. Market rate: $2.30-2.70/mile. Агрессивный торг без обоснования отпугивает брокеров."
                }
            }
        ],

        reject3: [
            {},
            {},
            {},
            {
                brokerResponse: "$1,900 is unrealistic. I'm moving on. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    ratePerMile: "$0/mile",
                    relationship: "Rejected - Too greedy",
                    dialogueTime: "4-5 minutes",
                    questionsAsked: "3 questions",
                    detailLevel: "medium",
                    futureOpportunity: "unlikely",
                    weeklyLoads: "No loads",
                    feedback: "❌ ОТКАЗ: Слишком жадный торг.\n\n💡 УРОК: Брокер уже увеличил с $1,600 до $1,750 (+$150). Продолжать агрессивный торг = жадность. Баланс между настойчивостью и реализмом критичен."
                }
            }
        ],

        reject4: [
            {},
            {},
            {},
            {},
            {
                brokerResponse: "I need a carrier who pays attention to details. Thanks anyway.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    ratePerMile: "$0/mile",
                    relationship: "Rejected - Inattentive",
                    dialogueTime: "5-6 minutes",
                    questionsAsked: "4 questions",
                    detailLevel: "medium",
                    futureOpportunity: "unlikely",
                    weeklyLoads: "No loads",
                    feedback: "❌ ОТКАЗ: Невнимательность к деталям.\n\n💡 УРОК: Записывайте все детали во время разговора. 'Повторите адрес' или 'отправьте email' = непрофессионализм. Показывайте внимательность и организованность."
                }
            }
        ],

        reject5: [
            {},
            {},
            {},
            {},
            {},
            {
                brokerResponse: "I need a more professional carrier. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    ratePerMile: "$0/mile",
                    relationship: "Rejected - Unprofessional",
                    dialogueTime: "6-7 minutes",
                    questionsAsked: "5 questions",
                    detailLevel: "medium",
                    futureOpportunity: "unlikely",
                    weeklyLoads: "No loads",
                    feedback: "❌ ОТКАЗ: Грубость и непрофессионализм.\n\n💡 УРОК: 'Да-да, понятно' или 'отправьте SMS' показывает неуважение. Брокеры ищут вежливых, внимательных диспетчеров."
                }
            }
        ],

        reject6: [
            {},
            {},
            {},
            {},
            {},
            {},
            {
                brokerResponse: "We only work with carriers who use factoring. This is our standard process. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    ratePerMile: "$0/mile",
                    relationship: "Rejected - Payment issues",
                    dialogueTime: "7-8 minutes",
                    questionsAsked: "6 questions",
                    detailLevel: "high",
                    futureOpportunity: "possible after factoring setup",
                    weeklyLoads: "No loads",
                    feedback: "❌ ОТКАЗ: Проблемы с оплатой.\n\n💡 УРОК: 99% брокеров работают только через factoring. 'Платите напрямую' = red flag. Setup factoring account BEFORE calling brokers."
                }
            }
        ],

        reject7: [
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {
                brokerResponse: "I need a carrier who pays attention. You don't seem to have the information clear. I'll book with someone else.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    ratePerMile: "$0/mile",
                    relationship: "Rejected - Inattentive to details",
                    dialogueTime: "7-8 minutes",
                    questionsAsked: "7 questions",
                    detailLevel: "high",
                    futureOpportunity: "unlikely",
                    weeklyLoads: "No loads",
                    feedback: "❌ ОТКАЗ: Невнимательность к деталям в финале.\n\n💡 УРОК: Вы дошли до конца, но потеряли груз из-за невнимательности. 'Какое время?' после полного резюме = непрофессионализм. Используйте notes, CRM, dispatch software."
                }
            }
        ]
    }
};

// Добавляем сценарий в глобальный массив
if (typeof allScenarios !== 'undefined') {
    allScenarios.push(scenario4);
    console.log('✅ Scenario 4 added to allScenarios');
} else {
    console.warn('⚠️ allScenarios array not found');
}
