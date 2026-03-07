// СИМУЛЬ - База диалогов для обучения диспетчеров
// Версия: Dialogue #11 - Dry Van Building Materials (NEW DIALOG SYSTEM V2.0)
// Дата: 2026-03-07

console.log('🔵 Loading scenarios-data-v11.js...');

const scenario11 = {
    id: 11,
    route: "Atlanta GA → Miami FL",
    distance: 650,
    equipment: "Dry Van (53ft)",
    cargo: "Building materials (drywall, lumber)",
    weight: "44,000 lbs",
    deadline: "Pickup tomorrow 6-10 AM, Delivery in 2 days",
    brokerStyle: "Professional construction broker",
    difficulty: "easy",

    initialMessage: "Good afternoon! This is Michael Brown from Southern Freight.\nI saw your load posting for Atlanta to Miami dry van.\nIs this load still available?",

    paths: {
        master: [
            {
                brokerQuestion: "Good afternoon! This is Carlos from BuildFreight Brokers.\nYes, available.\nWhat's your MC number?",
                dispatcherPrompt: "💎 Брокер проверяет вашу компанию. Представьтесь: MC номер, название компании, размер флота, специализация (construction materials). Укажите где truck сейчас. Чем больше деталей - тем профессиональнее!",
                suggestions: [
                    { text: "Good afternoon Carlos! Southern Freight, MC 778899. We're a 30-truck fleet handling construction materials regularly. Truck's in Atlanta, empty at warehouse district. Ready tomorrow. Where's pickup?", quality: "excellent", analytics: "✨ Отлично! MC, специализация, местоположение!", path: "master" },
                    { text: "Good afternoon! MC 778899, Southern Freight. We handle building materials regularly.", quality: "good", analytics: "✔️ Хорошо! MC и опыт.", path: "master" },
                    { text: "MC 778899, Southern Freight.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "MC 778899 I think.", quality: "weak", analytics: "⚠️ Слабо. Неуверенность.", path: "master" },
                    { text: "Why MC? Just the rate!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject1" },
                    { text: "Hi, is it available?", quality: "fail", analytics: "❌ Провал! Не представился!", path: "reject1" }
                ]
            },
            {
                brokerQuestion: "MC verified. Where's your truck?",
                dispatcherPrompt: "💎 Брокер хочет знать местоположение водителя. Дайте ТОЧНЫЙ адрес или landmark (warehouse, construction yard), статус (empty/loaded), когда освободился. Точность = профессионализм!",
                suggestions: [
                    { text: "Truck's in Atlanta, empty at construction supply yard near I-75. Driver finished delivery this morning. Ready to load tomorrow.", quality: "excellent", analytics: "✨ Отлично! Точное местоположение!", path: "master" },
                    { text: "In Atlanta, empty since morning. Ready tomorrow.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Atlanta area, empty and ready.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Somewhere in Atlanta...", quality: "weak", analytics: "⚠️ Слабо.", path: "master" },
                    { text: "Just tell me pickup and rate!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject1" },
                    { text: "Let me check...", quality: "fail", analytics: "❌ Провал!", path: "reject1" }
                ]
            },
            {
                brokerQuestion: "Perfect! 650 miles Atlanta to Miami. Building materials - drywall and lumber. 44K lbs. Pickup tomorrow 6-10 AM, delivery in 2 days. Works?",
                dispatcherPrompt: "💎 Брокер дал детали груза. Подтвердите: расстояние (650 mi), cargo (drywall/lumber), pickup (tomorrow 6-10 AM), delivery (2 days). Дайте ETA. Спросите о special handling. Вопросы = профессионализм!",
                suggestions: [
                    { text: "Perfect! Driver can be at pickup by 7 AM tomorrow. 650 miles in 2 days is comfortable. We handle construction materials regularly. Any special handling?", quality: "excellent", analytics: "✨ Отлично! ETA, расчет, опыт!", path: "master" },
                    { text: "Yes, works. Driver can be there by 8 AM. Any special requirements?", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "We can do it. Driver will be on time.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "I think we can make it...", quality: "weak", analytics: "⚠️ Слабо.", path: "master" },
                    { text: "Yeah, whatever. Rate?", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject2" },
                    { text: "Driver won't be empty until afternoon...", quality: "fail", analytics: "❌ Провал!", path: "reject2" }
                ]
            },
            {
                brokerQuestion: "Standard dry van. Load locks and straps required. Cargo is bundled and palletized. All details in rate con.",
                dispatcherPrompt: "💎 Брокер назвал requirements: load locks, straps для construction materials. Подтвердите что у вас есть оборудование. Упомяните опыт с building materials. Готовность = получите груз!",
                suggestions: [
                    { text: "Perfect! We have load locks and straps ready. Driver experienced with construction materials. Trailer is clean and dry. Ready to go!", quality: "excellent", analytics: "✨ Отлично!", path: "master" },
                    { text: "Yes, we have load locks and straps. Driver knows construction freight.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Yes, we have load locks and straps.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "I think we have them...", quality: "weak", analytics: "⚠️ Слабо.", path: "master" },
                    { text: "It's just building materials!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject3" },
                    { text: "We don't have straps...", quality: "fail", analytics: "❌ Провал!", path: "reject3" }
                ]
            },
            {
                brokerQuestion: "Good! Insurance current? We need $100K cargo coverage.",
                dispatcherPrompt: "💎 Брокер проверяет страховку. Назовите: сумму покрытия ($100K+), страховую компанию, срок действия. Предложите отправить certificate сразу. Страховка = доверие!",
                suggestions: [
                    { text: "Yes, $100K cargo insurance through Progressive. Certificate current, expires August 2027. I can email it now.", quality: "excellent", analytics: "✨ Отлично!", path: "master" },
                    { text: "Yes, $100K cargo coverage. Certificate current. I'll send it.", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Yes, we have cargo insurance.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "I think we have enough...", quality: "weak", analytics: "⚠️ Слабо.", path: "master" },
                    { text: "Insurance is fine! Rate?", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject3" },
                    { text: "We only have $50K...", quality: "fail", analytics: "❌ Провал!", path: "reject3" }
                ]
            },
            {
                brokerQuestion: "Perfect! You're well-prepared. Let's talk rate. What do you need for 650 miles?",
                dispatcherPrompt: "💎 ТОРГ ЗА ЦЕНУ! Брокер спрашивает ВАШУ цену. Назовите цену ПЕРВЫМ! Posted rate $1,450 - просите $1,650-1,700 ($2.54-2.62/mile). Чем больше просите - тем больше заработаете! Обоснуйте: construction materials handling, equipment.",
                suggestions: [
                    { text: "For 650 miles with building materials, I'm looking at $1,700. That's $2.62/mile, fair for construction freight.", quality: "excellent", analytics: "✨ Отлично! Просит $250 больше posted ($1,700 vs $1,450)!", path: "master" },
                    { text: "$1,650 for this load. That's $2.54/mile.", quality: "good", analytics: "✔️ Хорошо! Просит $200 больше!", path: "master" },
                    { text: "I'm looking at $1,600 for 650 miles.", quality: "normal", analytics: "⚪ Нормально. Просит $150 больше.", path: "master" },
                    { text: "Can you do $1,500?", quality: "weak", analytics: "⚠️ Слабо. Только $50 больше!", path: "master" },
                    { text: "I need $2,000 minimum!", quality: "aggressive", analytics: "🔴 Агрессивно. Нереалистично!", path: "reject4" },
                    { text: "I'll take $1,450 posted!", quality: "fail", analytics: "❌ ПРОВАЛ! Без торга!", path: "master" }
                ]
            },
            {
                brokerQuestion: "That's a bit high. I can do $1,575. That's $2.42/mile.",
                dispatcherPrompt: "💎 Брокер дал встречное предложение $1,575 (вы просили $1,700). Варианты: 1) Встречное $1,625, 2) Принять $1,575 + добавить условие (detention), 3) Принять $1,575. НЕ стойте на $1,700 - потеряете груз!",
                suggestions: [
                    { text: "Can we meet at $1,625? Fair for both.", quality: "excellent", analytics: "✨ Отлично! Продолжает торг!", path: "master" },
                    { text: "$1,575 works if detention is $75/hr after 2 hours.", quality: "good", analytics: "✔️ Хорошо! С условием.", path: "master" },
                    { text: "$1,575 works. Let's book it.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Okay, $1,575 I guess...", quality: "weak", analytics: "⚠️ Слабо.", path: "master" },
                    { text: "$1,625 or I walk!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject4" },
                    { text: "No, I need $1,700!", quality: "fail", analytics: "❌ Провал!", path: "reject4" }
                ]
            },
            {
                brokerQuestion: "$1,600 final. That's $2.46/mile. Detention $75/hr. Deal?",
                dispatcherPrompt: "💎 ФИНАЛЬНОЕ ПРЕДЛОЖЕНИЕ! Брокер дал $1,600 (вы просили $1,700, posted $1,450). Вы заработали $150 больше! Это ПОСЛЕДНИЙ шанс - принимайте! Скажите 'Deal!' и спросите про factoring. НЕ торгуйтесь дальше!",
                suggestions: [
                    { text: "$1,600 works! Which factoring?", quality: "excellent", analytics: "✨ Отлично! Заработал $150!", path: "master" },
                    { text: "Perfect! $1,600 with detention.", quality: "good", analytics: "✔️ Хорошо! Заработал $150!", path: "master" },
                    { text: "$1,600 confirmed.", quality: "normal", analytics: "⚪ Нормально. Заработал $150.", path: "master" },
                    { text: "Okay, $1,600.", quality: "weak", analytics: "⚠️ Слабо.", path: "master" },
                    { text: "I want $100/hr detention!", quality: "aggressive", analytics: "🔴 Агрессивно!", path: "reject4" },
                    { text: "Can we do $1,625?", quality: "fail", analytics: "❌ Провал!", path: "reject4" }
                ]
            },
            {
                brokerQuestion: "Deal! $1,600 all-in, detention $75/hr. Which factoring?",
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
                brokerQuestion: "Perfect! Rate con sent to factoring@rtsfin.com with all details. Sign and return. After pickup send BOL and photos. If this goes well, I have 10-12 construction loads weekly Atlanta-Florida. Good luck!",
                dispatcherPrompt: "💎 УСПЕХ! Брокер отправил Rate Con и предлагает 10-12 construction loads weekly! Поблагодарите профессионально, подтвердите что подпишете rate con, отправите BOL/photos. Выразите интерес к будущим грузам. Хорошие отношения = постоянные грузы!",
                suggestions: [
                    { text: "Thank you Carlos! We'll sign rate con right away. Driver will send updates and photos. Looking forward to more construction loads!", quality: "excellent", analytics: "✨ Отлично!", path: "master" },
                    { text: "Thank you! We'll sign and keep you updated. Looking forward to more loads!", quality: "good", analytics: "✔️ Хорошо!", path: "master" },
                    { text: "Thank you, we'll take care of it.", quality: "normal", analytics: "⚪ Нормально.", path: "master" },
                    { text: "Okay, thanks.", quality: "weak", analytics: "⚠️ Слабо.", path: "master" },
                    { text: "Yeah, got it.", quality: "aggressive", analytics: "🔴 Агрессивно.", path: "master" },
                    { text: "What was pickup time?", quality: "fail", analytics: "❌ Провал!", path: "master" }
                ]
            },
            {
                brokerResponse: "Perfect! Rate con sent. Sign and return. Safe travels!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$1,600",
                    ratePerMile: "$2.46/mile",
                    relationship: "strengthened",
                    dialogueTime: "5-6 minutes",
                    questionsAsked: "Professional questions",
                    detailLevel: "high",
                    futureOpportunity: "repeat",
                    weeklyLoads: "10-12 construction loads weekly Atlanta-Florida",
                    feedback: `✅ Отличные переговоры! Заработали $150 больше ($1,600 vs $1,450).

💡 УРОК: Building materials - standard dry van с load locks и straps. Торг: Posted $1,450 → Вы $1,700 → Финал $1,600 ($2.46/mile). Заработали $150 = 10% прибавка!

🎯 РЕАЛЬНОСТЬ: Construction loads платят standard rates ($2.30-2.60/mile). Ваш профессионализм = 10-12 loads weekly ($16,000-19,000/месяц)!`
                }
            }
        ],
        reject1: [{}, { brokerResponse: "I need professional carrier. Thanks.", outcome: { type: "failure", quality: "fail", rate: "$0", ratePerMile: "$0/mile", relationship: "rejected", dialogueTime: "1-2 min", questionsAsked: "None", detailLevel: "none", futureOpportunity: "none", weeklyLoads: "No loads", feedback: "❌ Непрофессионализм!" } }],
        reject2: [{}, { brokerResponse: "I need carrier who can meet schedule. Thanks.", outcome: { type: "failure", quality: "fail", rate: "$0", ratePerMile: "$0/mile", relationship: "rejected", dialogueTime: "2-3 min", questionsAsked: "Minimal", detailLevel: "low", futureOpportunity: "none", weeklyLoads: "No loads", feedback: "❌ Не может забрать вовремя!" } }],
        reject3: [{}, { brokerResponse: "I need carrier with proper equipment. Thanks.", outcome: { type: "failure", quality: "fail", rate: "$0", ratePerMile: "$0/mile", relationship: "rejected", dialogueTime: "3-4 min", questionsAsked: "Some", detailLevel: "medium", futureOpportunity: "none", weeklyLoads: "No loads", feedback: "❌ Нет оборудования или страховки!" } }],
        reject4: [{}, { brokerResponse: "That rate is unrealistic. Thanks.", outcome: { type: "failure", quality: "poor", rate: "$0", ratePerMile: "$0/mile", relationship: "damaged", dialogueTime: "4-5 min", questionsAsked: "Good", detailLevel: "high", futureOpportunity: "unlikely", weeklyLoads: "No loads", feedback: "❌ Нереалистичные требования!" } }]
    }
};

if (typeof allScenarios !== 'undefined') {
    allScenarios.push(scenario11);
    console.log('✅ Scenario 11 (Dry Van Building) added');
} else {
    console.warn('⚠️ allScenarios not found');
}
