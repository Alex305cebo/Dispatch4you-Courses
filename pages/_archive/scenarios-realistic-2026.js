// ============================================================
// REALISTIC DISPATCHER-BROKER SCENARIOS 2026
// Based on real industry practices and negotiations
// 18-20 step dialogues with unique questions per scenario
// ============================================================

console.log('🟢 Loading realistic scenarios 2026...');

// ─────────────────────────────────────────────────────────────
// SCENARIO 1 — Dry Van | Chicago → Dallas | 1,000 miles
// Focus: Payment terms, factoring, broker credit, high-value cargo
// Unique questions: Claims history, factoring company, TONU, layover, lumpers, broker credit
// ─────────────────────────────────────────────────────────────
const scenario_chicago_dallas = {
    id: 101,
    title: "Electronics — Chicago to Dallas (High Value)",
    route: "Chicago IL → Dallas TX",
    distance: 1000,
    equipment: "Dry Van (53ft)",
    cargo: "Packaged electronics ($180K value)",
    weight: "42,000 lbs (24 pallets)",
    postedRate: "$2,400 ($2.40/mile)",
    deadline: "Pickup tomorrow 8 AM-12 PM, Delivery Thursday 2 PM",
    brokerStyle: "Professional, thorough, asks about payment and claims",
    difficulty: "standard",
    brokerName: "Sarah",
    brokerCompany: "Midwest Freight Solutions",
    initialMessage: "Good morning, this is Sarah from Midwest Freight Solutions. I'm calling about load reference CH-2847, Chicago to Dallas. Is this still available?",

    paths: {
        master: [
            {
                brokerQuestion: "Yes, it's available. Can you confirm your company name and MC number?",
                dispatcherPrompt: "💡 Представьтесь профессионально с MC номером",
                suggestions: [
                    { text: "Sure, this is Alex from Star Transport, MC 445566. We run 25 dry vans in the Midwest region, been in business 8 years with excellent safety rating.", quality: "excellent", path: "master" },
                    { text: "Star Transport, MC 445566.", quality: "good", path: "master" }
                ]
            },
            {
                brokerQuestion: "Great. Pickup is at 2450 West Fulton Street, Chicago, tomorrow between 8 AM and 12 PM. Delivery to Dallas at 3500 Maple Avenue, Thursday at 2 PM. Can you make that schedule?",
                dispatcherPrompt: "💡 Подтвердите график и спросите о грузе",
                suggestions: [
                    { text: "Yes, my driver is in Chicago with zero deadhead. Can be there at 8 AM. What's the commodity and any special requirements?", quality: "excellent", path: "master" },
                    { text: "Yes, driver in Chicago, zero deadhead. What's the cargo?", quality: "good", path: "master" }
                ]
            },
            {
                brokerQuestion: "It's packaged electronics, 42,000 pounds, 24 pallets. High value cargo - about $180,000 worth. Do you have experience hauling electronics? Any claims history I should know about?",
                dispatcherPrompt: "💡 ВАЖНО! Брокер спрашивает об опыте и claims",
                suggestions: [
                    { text: "Yes, we haul electronics regularly. My driver has 12 years experience with high-value cargo. We've had zero cargo claims in the past 5 years. Our drivers are trained on proper securement and we have $250K cargo insurance for high-value loads.", quality: "excellent", path: "master" },
                    { text: "Yes, electronics experience. Zero claims in 5 years. $250K insurance.", quality: "good", path: "master" }
                ]
            },
            {
                brokerQuestion: "Good. Have you hauled for us before? What's your payment preference - factoring or NET terms?",
                dispatcherPrompt: "💡 Брокер проверяет payment history",
                suggestions: [
                    { text: "First time working together. We use TBS Factoring - they're one of the big ones, so verification should be quick. Do you offer QuickPay?", quality: "excellent", path: "master" },
                    { text: "First time. We use TBS Factoring. QuickPay available?", quality: "good", path: "master" }
                ]
            },
            {
                brokerQuestion: "We work with TBS. QuickPay is 3% fee, paid in 24 hours. Or through your factor at no fee. What rate are you looking for?",
                dispatcherPrompt: "💡 ТОРГ! $2,400 posted. Просите $2,800",
                suggestions: [
                    { text: "For 1,000 miles with high-value electronics and zero deadhead, I'm looking at $2,800. That's $2.80/mile. With our zero claims history and experienced driver, that's fair.", quality: "excellent", path: "master" },
                    { text: "$2,700 for this load. $2.70/mile with our experience.", quality: "good", path: "master" }
                ]
            },
            {
                brokerQuestion: "Market is soft. I can do $2,500, but that's pushing my margin.",
                dispatcherPrompt: "💡 Обоснуйте свою ставку",
                suggestions: [
                    { text: "I understand, but zero deadhead means immediate pickup. High-value cargo with zero claims. Experienced driver. How about $2,700? Only $200 more for peace of mind on a $180K load.", quality: "excellent", path: "master" },
                    { text: "Zero deadhead, zero claims, experienced. Can we do $2,650?", quality: "good", path: "master" }
                ]
            },
            {
                brokerQuestion: "Let me check with my manager... Okay, $2,600 is my max.",
                dispatcherPrompt: "💡 Добавьте условия detention",
                suggestions: [
                    { text: "$2,600 works if we lock in detention pay. What's your policy? I want my driver protected if there are delays.", quality: "excellent", path: "master" },
                    { text: "$2,600 works. Detention policy?", quality: "good", path: "master" }
                ]
            },
            {
                brokerQuestion: "$50 per hour after 2 hours free time at both ends.",
                dispatcherPrompt: "💡 Спросите о TONU",
                suggestions: [
                    { text: "Good. What about TONU? If shipper cancels after dispatch, what's the compensation?", quality: "excellent", path: "master" },
                    { text: "TONU policy?", quality: "good", path: "master" }
                ]
            },
            {
                brokerQuestion: "TONU is $300 after dispatch, $500 after arrival at shipper.",
                dispatcherPrompt: "💡 Спросите о layover",
                suggestions: [
                    { text: "Fair. What about layover? If driver gets stuck overnight, what's the compensation?", quality: "excellent", path: "master" },
                    { text: "Layover pay?", quality: "good", path: "master" }
                ]
            },
            {
                brokerQuestion: "Layover is $200 per day. Rarely happens with this shipper though.",
                dispatcherPrompt: "💡 Спросите про lumper fees",
                suggestions: [
                    { text: "Good. Are there lumper fees at either location? Who covers those?", quality: "excellent", path: "master" },
                    { text: "Lumper fees?", quality: "good", path: "master" }
                ]
            },
            {
                brokerQuestion: "No lumpers - both use their own staff. Driver just needs to be present for count.",
                dispatcherPrompt: "💡 Дополнительные остановки?",
                suggestions: [
                    { text: "Perfect. Is this direct or any additional stops?", quality: "excellent", path: "master" },
                    { text: "Any stops?", quality: "good", path: "master" }
                ]
            },
            {
                brokerQuestion: "Direct load. Call receiver 2 hours before delivery for dock assignment. They're strict about that.",
                dispatcherPrompt: "💡 Документы и фото",
                suggestions: [
                    { text: "Understood. What documents and photos? BOL, POD, seal photos?", quality: "excellent", path: "master" },
                    { text: "What documents needed?", quality: "good", path: "master" }
                ]
            },
            {
                brokerQuestion: "Signed BOL, POD with stamp, seal photos both ends. Also photos of trailer interior before loading - it's high-value.",
                dispatcherPrompt: "💡 Страховка и сертификаты",
                suggestions: [
                    { text: "$250K cargo insurance through Progressive, covers electronics. Can email certificate in 10 minutes. Need W9 and carrier packet?", quality: "excellent", path: "master" },
                    { text: "$250K insurance. Can send cert right away. Need W9?", quality: "good", path: "master" }
                ]
            },
            {
                brokerQuestion: "Yes, send W9, insurance, and carrier packet. I'll set you up as new carrier, takes 15 minutes.",
                dispatcherPrompt: "💡 Проверьте broker credit",
                suggestions: [
                    { text: "Perfect. Before we finalize, can you tell me about your payment history? How long in business and credit rating? Want to make sure my factoring company won't have issues.", quality: "excellent", path: "master" },
                    { text: "Will do. Your payment history? Any issues with factors?", quality: "good", path: "master" }
                ]
            },
            {
                brokerQuestion: "12 years in business, A-rated with TBS and major factors. We pay on time - check our RMIS score. Your factor won't have issues.",
                dispatcherPrompt: "💡 Финальное подтверждение",
                suggestions: [
                    { text: "Excellent. Confirming: $2,600 all-in, detention $50/hr after 2hrs, TONU $300/$500, layover $200/day, no lumpers, direct load, call 2hrs ahead. Payment through TBS. Sending MC, insurance, W9, packet now.", quality: "excellent", path: "master" },
                    { text: "Great. $2,600, detention $50/hr, TONU $300/$500. Sending docs.", quality: "good", path: "master" }
                ]
            },
            {
                brokerQuestion: "Perfect. Truck number, driver name, and cell phone?",
                dispatcherPrompt: "💡 Детали водителя",
                suggestions: [
                    { text: "Truck 2847, 2021 Freightliner. Driver John Smith, 12 years experience, clean MVR, 555-0123. John specializes in high-value cargo, hauled for Best Buy and Samsung. Will be there 8 AM sharp.", quality: "excellent", path: "master" },
                    { text: "Truck 2847, John Smith, 555-0123. 12 years experience, 8 AM pickup.", quality: "good", path: "master" }
                ]
            },
            {
                brokerQuestion: "Great. Rate con coming in 2 minutes. Have John call when loaded with seal number and photos.",
                dispatcherPrompt: "💡 Подтверждение и следующие шаги",
                suggestions: [
                    { text: "Perfect Sarah. John will call when loaded with seal and photos. Thanks for working with me on the rate. Looking forward to building a relationship with Midwest Freight.", quality: "excellent", path: "master" },
                    { text: "Will do. John will call when loaded. Thanks Sarah.", quality: "good", path: "master" }
                ]
            },
            {
                brokerQuestion: "Sounds good. One more thing - any trucks running back from Dallas? I might have a backhaul.",
                dispatcherPrompt: "💡 БОНУС! Backhaul opportunity",
                suggestions: [
                    { text: "Actually yes! John will be empty in Dallas after delivery. What do you have? Always looking for good backhauls.", quality: "excellent", path: "success_booked" },
                    { text: "Yes, empty in Dallas. What's the backhaul?", quality: "good", path: "success_booked" }
                ]
            },
            {
                brokerQuestion: "I'll send details after this one rolls. Talk soon!",
                dispatcherPrompt: "✅ ОТЛИЧНО! Груз + backhaul opportunity",
                suggestions: [
                    { text: "Perfect! Looking forward to it. Have a great day!", quality: "excellent", path: "end" }
                ]
            }
        ],
        warning: [
            {
                brokerQuestion: "I need more details. This is high-value and I need professional carriers.",
                dispatcherPrompt: "💡 Будьте профессиональнее",
                suggestions: [
                    { text: "I apologize. Star Transport, MC 445566, 25 vans, 8 years, excellent safety. Driver John Smith, 12 years, truck 2847, 2021 Freightliner, current DOT. $250K insurance, zero claims 5 years. TBS Factoring. How can I help you feel confident?", quality: "excellent", path: "master" },
                    { text: "Sorry. MC 445566, experienced driver, $250K insurance, zero claims. What else?", quality: "good", path: "master" }
                ]
            }
        ],
        success_booked: [
            {
                brokerQuestion: "Perfect. Looking forward to working with you!",
                dispatcherPrompt: "✅ УСПЕХ! Груз забронирован",
                suggestions: [
                    { text: "Same here! Thanks!", quality: "excellent", path: "end" }
                ]
            }
        ]
    }
};

// Add to allScenarios
if (typeof allScenarios !== 'undefined') {
    allScenarios.push(scenario_chicago_dallas);
    console.log('✅ Added: Chicago → Dallas (18 steps, unique questions)');
}

console.log('✅ Realistic scenarios 2026 loaded');
