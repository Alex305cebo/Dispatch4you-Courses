// СИМУЛЬ - База диалогов для обучения диспетчеров
// Версия: Dialogue #12 - Reefer Produce (NEW DIALOG SYSTEM V2.0)
// Дата: 2026-03-07

console.log('🔵 Loading scenarios-data-v12.js...');

const scenario12 = {
    id: 12,
    route: "Fresno CA → New York NY",
    distance: 2900,
    equipment: "Reefer (53ft refrigerated)",
    cargo: "Produce (lettuce, tomatoes, peppers)",
    weight: "43,000 lbs",
    deadline: "Pickup tomorrow 6-10 AM, Delivery in 4 days",
    brokerStyle: "Professional produce broker",
    difficulty: "medium-hard",

    initialMessage: "Good morning! This is Sarah Chen from Pacific Reefer.\nI saw your load posting for Fresno to New York produce.\nIs this load still available?",

    paths: {
        master: [
            {
                brokerQuestion: "Good morning! This is Amanda from ProduceDirect Brokers.\nYes, available.\nWhat's your MC and where is your reefer?",
                dispatcherPrompt: "💎 Брокер проверяет вашу компанию. Представьтесь: MC номер, название компании, размер флота, специализация (reefer/produce). Укажите где reefer, температуру unit. Чем больше деталей - тем профессиональнее!",
                suggestions: [
                    { text: "Good morning Amanda! Pacific Reefer, MC 889900. We're a 35-truck reefer fleet specializing in produce transport. Reefer is in Fresno, empty at produce terminal. Unit pre-cooled to 34°F. Ready tomorrow. Where's pickup?", quality: "excellent", analytics: "✨ Отлично! MC, специализация, температура!", path: "master" },
                    { text: "Good morning! MC 889900, Pacific Reefer. Reefer in Fresno, pre-cooled to 34°F. We handle produce regularly.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "MC 889900, Pacific Reefer. Reefer in Fresno, ready.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "MC 889900. Reefer somewhere in Fresno.", quality: "weak", analytics: "⚠️ Слабо.", path: "master" },
                    { text: "Why all questions? Just rate!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject1" },
                    { text: "Hi, is produce load available?", quality: "fail", analytics: "❌ Провал!", path: "reject1" }
                ]
            },
            {
                brokerQuestion: "MC verified. Is your reefer unit working? This is produce at 34-36°F.",
                dispatcherPrompt: "💎 Брокер проверяет reefer unit для produce. Подтвердите: unit работает, температура 34-36°F достижима, когда обслуживался, есть GPS monitoring. Produce требует точного temp control!",
                suggestions: [
                    { text: "Yes, Thermo King unit fully operational, serviced last week. Currently at 34°F, fuel full. We monitor temp 24/7 with GPS. Ready for produce.", quality: "excellent", analytics: "✨ Отлично! Детали unit!", path: "master" },
                    { text: "Yes, unit working perfectly. At 34°F, serviced recently. We have temp monitoring.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Yes, reefer unit works. Ready for 34°F.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "I think unit is working...", quality: "weak", analytics: "⚠️ Слабо.", path: "master" },
                    { text: "It's a reefer, of course it works!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject1" },
                    { text: "Unit had issues last week...", quality: "fail", analytics: "❌ Провал!", path: "reject1" }
                ]
            },
            {
                brokerQuestion: "Perfect! 2,900 miles cross-country. Produce - lettuce, tomatoes, peppers. 43K lbs. Must maintain 34-36°F. Pickup tomorrow 6-10 AM, delivery in 4 days. Can you handle?",
                dispatcherPrompt: "💎 Брокер дал детали груза. Подтвердите: расстояние (2,900 mi), температура (34-36°F), pickup (tomorrow 6-10 AM), delivery (4 days). Дайте ETA. Упомяните team drivers для long haul. Спросите о temp monitoring requirements. Вопросы = профессионализм!",
                suggestions: [
                    { text: "Absolutely! Driver can be at pickup by 7 AM tomorrow. 2,900 miles in 4 days is doable with team. We maintain 34-36°F with continuous monitoring. We transport produce weekly. Any special requirements?", quality: "excellent", analytics: "✨ Отлично! ETA, team, температура, опыт!", path: "master" },
                    { text: "Yes, works. Driver can be there by 8 AM. We maintain 34-36°F with monitoring.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "We can do it. Driver will maintain temperature.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "I think we can make it...", quality: "weak", analytics: "⚠️ Слабо.", path: "master" },
                    { text: "Yeah, we'll get it there. Rate?", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject2" },
                    { text: "Driver won't be empty until afternoon...", quality: "fail", analytics: "❌ Провал!", path: "reject2" }
                ]
            },
            {
                brokerQuestion: "Minimize door openings. No fuel stops longer than 20 minutes. If temp rises above 38°F, call immediately. All details in rate con.",
                dispatcherPrompt: "💎 Брокер дал КРИТИЧЕСКИЕ требования для produce: минимум door openings, fuel stops max 20 min, звонить если temp >38°F. Подтвердите понимание КАЖДОГО требования. Produce очень чувствителен к температуре!",
                suggestions: [
                    { text: "Absolutely! GPS temp monitoring with alerts. Driver trained to minimize door openings and quick fuel stops. We'll call if any issues. Standard for produce.", quality: "excellent", analytics: "✨ Отлично!", path: "master" },
                    { text: "Yes, temp monitoring with alerts. Driver knows procedures. We'll call if issues.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Yes, we have monitoring. Driver will follow procedures.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "I think we have monitoring...", quality: "weak", analytics: "⚠️ Слабо.", path: "master" },
                    { text: "It's produce, it'll stay cold!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject3" },
                    { text: "We don't have temp monitoring...", quality: "fail", analytics: "❌ Провал!", path: "reject3" }
                ]
            },
            {
                brokerQuestion: "Good! Insurance current? We need $100K cargo coverage for produce.",
                dispatcherPrompt: "💎 Брокер проверяет страховку для produce. Назовите: сумму покрытия ($100K+), страховую компанию, срок действия, покрывает ли temp claims. Предложите отправить certificate. Страховка = доверие!",
                suggestions: [
                    { text: "Yes, $150K cargo insurance through Northland. Certificate current, covers produce and temp claims. I can email it now.", quality: "excellent", analytics: "✨ Отлично!", path: "master" },
                    { text: "Yes, $150K cargo coverage including produce. Certificate current. I'll send it.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Yes, we have cargo insurance for produce.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "I think we have enough...", quality: "weak", analytics: "⚠️ Слабо.", path: "master" },
                    { text: "Insurance is fine! Rate?", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject3" },
                    { text: "We only have $50K...", quality: "fail", analytics: "❌ Провал!", path: "reject3" }
                ]
            },
            {
                brokerQuestion: "Perfect! You're well-equipped for produce. Let's talk rate. What do you need for 2,900 miles?",
                dispatcherPrompt: "💎 ТОРГ ЗА ЦЕНУ! Брокер спрашивает ВАШУ цену. Назовите цену ПЕРВЫМ! Posted rate $7,500 - просите $8,300-8,500 ($2.86-2.93/mile). Produce cross-country платит больше! Обоснуйте: temp control, monitoring, team drivers, 4 days.",
                suggestions: [
                    { text: "For 2,900 miles cross-country with produce at 34-36°F, continuous monitoring, team drivers, 4-day delivery - I'm looking at $8,500. That's $2.93/mile for temperature-critical cargo.", quality: "excellent", analytics: "✨ Отлично! Просит $1,000 больше posted ($8,500 vs $7,500)!", path: "master" },
                    { text: "$8,200 for this produce load. That's $2.83/mile for temp-controlled cross-country.", quality: "good", analytics: "✔️ Хорошо! Просит $700 больше!", path: "master" },
                    { text: "I'm looking at $8,000 for 2,900 miles.", quality: "normal", analytics: "⚪ Нормально. Просит $500 больше.", path: "master" },
                    { text: "Can you do $7,700?", quality: "weak", analytics: "⚠️ Слабо. Только $200 больше!", path: "master" },
                    { text: "I need $9,500 minimum!", quality: "aggressive", analytics: "🔴 Агрессивно. Нереалистично!", path: "reject4" },
                    { text: "I'll take $7,500 posted!", quality: "fail", analytics: "❌ ПРОВАЛ! Без торга!", path: "master" }
                ]
            },
            {
                brokerQuestion: "That's high. I can do $8,000. That's $2.76/mile for temp-controlled.",
                dispatcherPrompt: "💎 Брокер дал встречное предложение $8,000 (вы просили $8,500). Варианты: 1) Встречное $8,200-8,300, 2) Принять $8,000 + добавить условие (fuel advance $500), 3) Принять $8,000. НЕ стойте на $8,500 - потеряете груз!",
                suggestions: [
                    { text: "Can we meet at $8,200? Fair for both with 24/7 monitoring, team drivers, and produce expertise.", quality: "excellent", analytics: "✨ Отлично! Продолжает торг!", path: "master" },
                    { text: "$8,000 works if detention is $100/hr after 2 hours and fuel advance $500.", quality: "good", analytics: "✔️ Хорошо! С условиями.", path: "master" },
                    { text: "$8,000 works. Let's book it.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Okay, $8,000 I guess...", quality: "weak", analytics: "⚠️ Слабо.", path: "master" },
                    { text: "$8,200 or I walk!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject4" },
                    { text: "No, I need $8,500!", quality: "fail", analytics: "❌ Провал!", path: "reject4" }
                ]
            },
            {
                brokerQuestion: "$8,100 final. That's $2.79/mile. Detention $100/hr, fuel advance $500. Deal?",
                dispatcherPrompt: "💎 ФИНАЛЬНОЕ ПРЕДЛОЖЕНИЕ! Брокер дал $8,100 (вы просили $8,500, posted $7,500). Вы заработали $600 больше! Плюс fuel advance $500! Это ПОСЛЕДНИЙ шанс - принимайте! Скажите 'Deal!' и спросите про factoring. НЕ торгуйтесь дальше!",
                suggestions: [
                    { text: "$8,100 works! Detention and fuel advance perfect. Which factoring?", quality: "excellent", analytics: "✨ Отлично! Заработал $600!", path: "master" },
                    { text: "Perfect! $8,100 with detention and fuel.", quality: "good", analytics: "✔️ Хорошо! Заработал $600!", path: "master" },
                    { text: "$8,100 confirmed.", quality: "normal", analytics: "⚪ Нормально. Заработал $600.", path: "master" },
                    { text: "Okay, $8,100.", quality: "weak", analytics: "⚠️ Слабо.", path: "master" },
                    { text: "I want $150/hr detention!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject4" },
                    { text: "Can we do $8,200?", quality: "fail", analytics: "❌ Провал!", path: "reject4" }
                ]
            },
            {
                brokerQuestion: "Deal! $8,100 all-in, detention $100/hr, fuel $500. Which factoring?",
                dispatcherPrompt: "💎 Брокер финализирует rate и спрашивает про factoring. Дайте: название factoring компании + email адрес. Предложите отправить insurance certificate сразу. Быстрый ответ = профессионализм!",
                suggestions: [
                    { text: "RTS Factoring, factoring@rtsfin.com. Sending insurance cert now.", quality: "excellent", analytics: "✨ Отлично!", path: "master" },
                    { text: "Triumph Factoring, triumph@factoring.com.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "OTR Solutions.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Let me find email...", quality: "weak", analytics: "⚠️ Слабо.", path: "master" },
                    { text: "Just send rate con!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject4" },
                    { text: "We don't use factoring.", quality: "fail", analytics: "❌ Провал!", path: "reject4" }
                ]
            },
            {
                brokerQuestion: "Perfect! Rate con sent to factoring@rtsfin.com with all details. Sign and return. After pickup send BOL and photos. Maintain 34-36°F and send temp logs every 6 hours. If this goes well, I have 4-5 produce loads weekly Fresno-East Coast. Good luck!",
                dispatcherPrompt: "💎 УСПЕХ! Брокер отправил Rate Con и предлагает 4-5 produce loads weekly! Поблагодарите профессионально, подтвердите что подпишете rate con, будете отправлять temp logs каждые 6 часов. Выразите интерес к будущим produce грузам. Хорошие отношения = постоянные грузы!",
                suggestions: [
                    { text: "Thank you Amanda! We'll sign rate con right away. Driver will maintain 34-36°F and send temp logs every 6 hours. Looking forward to more produce loads!", quality: "excellent", analytics: "✨ Отлично!", path: "master" },
                    { text: "Thank you! We'll sign and send temp updates. Looking forward to more loads!", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Thank you, we'll take care of it.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Okay, thanks.", quality: "weak", analytics: "⚠️ Слабо.", path: "master" },
                    { text: "Yeah, got it.", quality: "aggressive", analytics: "🔴 Агрессивно.", path: "master" },
                    { text: "What was temp requirement?", quality: "fail", analytics: "❌ Провал!", path: "master" }
                ]
            },
            {
                brokerResponse: "Perfect! Rate con sent. Maintain 34-36°F. Safe travels!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$8,100",
                    ratePerMile: "$2.79/mile",
                    relationship: "strengthened",
                    dialogueTime: "6-7 minutes",
                    questionsAsked: "Professional produce questions",
                    detailLevel: "very high",
                    futureOpportunity: "repeat",
                    weeklyLoads: "4-5 produce loads weekly Fresno-East Coast",
                    feedback: `✅ Отличные переговоры по Reefer produce! Заработали $600 больше ($8,100 vs $7,500).

💡 УРОК: Produce требует 34-36°F, temp monitoring, quick fuel stops, team drivers для cross-country. Торг: Posted $7,500 → Вы $8,500 → Финал $8,100 ($2.79/mile). Заработали $600 = 8% прибавка!

🎯 РЕАЛЬНОСТЬ: Produce loads платят premium ($2.60-2.90/mile) за temp-critical cargo. Ваш профессионализм = 4-5 loads weekly ($32,000-40,000/месяц)!`
                }
            }
        ],
        reject1: [{}, { brokerResponse: "I need professional carrier. Thanks.", outcome: { type: "failure", quality: "fail", rate: "$0", ratePerMile: "$0/mile", relationship: "rejected", dialogueTime: "1-2 min", questionsAsked: "None", detailLevel: "none", futureOpportunity: "none", weeklyLoads: "No loads", feedback: "❌ Непрофессионализм или проблемы с reefer!" } }],
        reject2: [{}, { brokerResponse: "I need carrier who can meet schedule. Thanks.", outcome: { type: "failure", quality: "fail", rate: "$0", ratePerMile: "$0/mile", relationship: "rejected", dialogueTime: "2-3 min", questionsAsked: "Minimal", detailLevel: "low", futureOpportunity: "none", weeklyLoads: "No loads", feedback: "❌ Не может забрать вовремя!" } }],
        reject3: [{}, { brokerResponse: "I need carrier with proper monitoring. Thanks.", outcome: { type: "failure", quality: "fail", rate: "$0", ratePerMile: "$0/mile", relationship: "rejected", dialogueTime: "3-4 min", questionsAsked: "Some", detailLevel: "medium", futureOpportunity: "none", weeklyLoads: "No loads", feedback: "❌ Нет temp monitoring или страховки!" } }],
        reject4: [{}, { brokerResponse: "That rate is unrealistic. Thanks.", outcome: { type: "failure", quality: "poor", rate: "$0", ratePerMile: "$0/mile", relationship: "damaged", dialogueTime: "4-5 min", questionsAsked: "Good", detailLevel: "high", futureOpportunity: "unlikely", weeklyLoads: "No loads", feedback: "❌ Нереалистичные требования!" } }]
    }
};

if (typeof allScenarios !== 'undefined') {
    allScenarios.push(scenario12);
    console.log('✅ Scenario 12 (Reefer Produce) added');
} else {
    console.warn('⚠️ allScenarios not found');
}
