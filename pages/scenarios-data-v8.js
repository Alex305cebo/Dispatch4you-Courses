// СИМУЛЯТОР - База диалогов для обучения диспетчеров
// Версия: Dialogue #8 - Oversized Equipment (NEW DIALOG SYSTEM V2.0)
// Дата: 2026-03-07
// ПРАВИЛО: Диспетчер звонит первым! 6 вариантов качества в каждом шаге!

console.log('🔵 Loading scenarios-data-v8.js...');

// Dialogue #8: Oversized Equipment - Seattle WA → Miami FL
// Hard difficulty, multi-state permits, heavy equipment
// NEW DIALOG SYSTEM V2.0

const scenario8 = {
    id: 8,
    route: "Seattle WA → Miami FL",
    distance: 3300,
    equipment: "Step Deck (53ft) with permits",
    cargo: "Industrial excavator (Caterpillar 320)",
    weight: "48,000 lbs",
    dimensions: "32ft L x 12ft W x 14ft H",
    deadline: "Pickup in 5 days (after permits), Delivery in 7 days from pickup",
    brokerStyle: "Experienced heavy haul broker, detail-oriented",
    difficulty: "hard",

    initialMessage: "Good afternoon! This is calling from Pacific Northwest Transport.\nI saw your load posting for Seattle to Miami oversized equipment.\nCan you tell me more about this shipment?",

    paths: {
        master: [
            // ШАГ 1: MC verification + equipment availability
            {
                brokerQuestion: "Good afternoon! This is Mike from Heavy Haul Logistics.\nYes, the load is available.\nWhat's your MC number and do you have a step deck with permit capability available?",
                dispatcherPrompt: "💎 Брокер проверяет MC и наличие специализированного оборудования. Дайте точную информацию.",
                suggestions: [
                    {
                        text: "Good afternoon Mike! This is Pacific Northwest Transport, MC 889944. We have a 53-foot step deck available right now in Seattle area. Just delivered construction equipment to Tacoma yesterday. Trailer is empty, inspected, and ready for oversized loads. We specialize in heavy equipment transport with full permit service - we handle all state permits, route planning, and escort coordination. Can haul up to 48,000 lbs with dimensions up to 14ft height, 12ft width. What are the exact dimensions and weight of this excavator?",
                        quality: "excellent",
                        analytics: "✨ Отлично! MC номер, точное местоположение, step deck, специализация на oversized, permit capability.",
                        path: "master"
                    },
                    {
                        text: "Good afternoon! MC 889944, Pacific Northwest Transport. We have a 53ft step deck in Seattle, empty and ready. We handle oversized loads with permits. Available for pickup tomorrow. What are the dimensions and weight?",
                        quality: "good",
                        analytics: "✔️ Хорошо! MC, оборудование, permit capability, готовность.",
                        path: "master"
                    },
                    {
                        text: "MC 889944. We have a step deck in Seattle, empty and ready for pickup tomorrow.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовая информация.",
                        path: "master"
                    },
                    {
                        text: "MC 889944. We have a step deck somewhere in Washington state. Should be available.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неточное местоположение, неуверенность.",
                        path: "master"
                    },
                    {
                        text: "Why all these questions? Just tell me the rate and pickup address!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Грубый тон, нет профессионализма.",
                        path: "reject1"
                    },
                    {
                        text: "Uh... let me find the MC number. And I need to check if we have a step deck. Can I call you back?",
                        quality: "fail",
                        analytics: "❌ Провал. Не знает базовую информацию о компании и оборудовании.",
                        path: "reject1"
                    }
                ]
            },
            // ШАГ 2: Permit experience verification
            {
                brokerQuestion: "MC verified, good safety rating.\nThis is a 48,000 lbs excavator, 14 feet high, 12 feet wide.\nIt's oversized and requires permits in multiple states.\nWhat's your experience with multi-state permit coordination?",
                dispatcherPrompt: "💎 Брокер проверяет опыт с permits. Продемонстрируйте знание процесса.",
                suggestions: [
                    {
                        text: "We handle multi-state permits regularly. For Seattle to Miami, we'll need permits in Washington, Idaho, Montana, Wyoming, South Dakota, Iowa, Illinois, Indiana, Ohio, Kentucky, Tennessee, Georgia, and Florida - 13 states total. We work with permit service that processes all states simultaneously. Typical processing time 3-5 business days. We'll need exact dimensions, weight, and VIN for permit applications. Our driver is trained for oversized loads - knows height restrictions, bridge clearances, and restricted routes. We also coordinate pilot cars when required. Cost is typically $2,500-$3,500 for this route depending on state fees.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Знание всех штатов, процесс, timing, costs, pilot cars, driver training.",
                        path: "master"
                    },
                    {
                        text: "We handle multi-state permits regularly. For this route we'll need permits in 13 states from Washington to Florida. We work with permit service, processing takes 3-5 days. Driver is trained for oversized loads. We coordinate pilot cars if needed. Permit costs typically $2,500-$3,500 for this distance.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Знание процесса, timing, costs.",
                        path: "master"
                    },
                    {
                        text: "We handle permits. We work with a permit service. Takes a few days to process.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "We've done some permit loads. I think we can get permits. How long do we have?",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенность в критическом процессе.",
                        path: "master"
                    },
                    {
                        text: "Permits? That's your job as the broker! We just haul the load!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Не понимает ответственность carrier за permits.",
                        path: "reject2"
                    },
                    {
                        text: "Do we really need permits for every state? Can't we just drive through?",
                        quality: "fail",
                        analytics: "❌ Провал. Не понимает legal requirements для oversized loads.",
                        path: "reject2"
                    }
                ]
            },
            // ШАГ 3-5: Сокращенные для экономии места
            // ШАГ 6: Rate negotiation
            {
                brokerQuestion: "Impressive capabilities.\nFor this load: 3,300 miles, Seattle to Miami, 48,000 lbs excavator, oversized 14ft x 12ft.\nPickup in 5 days (after permits processed), delivery in 7 days from pickup.\nI'm offering $11,000 all-in. That's $3.33 per mile.\nWhat do you think?",
                dispatcherPrompt: "💎 Брокер предложил ставку. Оцените и ответьте профессионально.",
                suggestions: [
                    {
                        text: "I appreciate the offer, Mike. $11,000 is a starting point, but for oversized heavy equipment with 14ft height and 12ft width, considering the specialized step deck equipment, multi-state permit coordination ($2,500-$3,500), route planning complexity, potential pilot car requirements, and our 8-year track record with zero claims on heavy equipment, the market rate for oversized loads this size is typically $3.60-$4.00 per mile. Could we do $12,500? That's $3.79/mile, which reflects the oversized premium, permit costs, and specialized handling. We guarantee on-time delivery with complete documentation and real-time tracking.",
                        quality: "excellent",
                        analytics: "✨ Отлично! Профессиональные переговоры с детальным обоснованием, рыночные ставки.",
                        path: "master"
                    },
                    {
                        text: "Thank you for the offer. For oversized heavy equipment with permit coordination and specialized handling, could we do $12,500? That's $3.79/mile, which is fair for this specialized service including permit costs. We're ready to start permit process immediately.",
                        quality: "good",
                        analytics: "✔️ Хорошо! Вежливые переговоры с обоснованием.",
                        path: "master"
                    },
                    {
                        text: "Can we do $12,500? That would work better for oversized transport with permits.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовая попытка переговоров.",
                        path: "master"
                    },
                    {
                        text: "I don't know... $11,000 seems low for oversized. Maybe $12,000?",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенность, нет обоснования.",
                        path: "master"
                    },
                    {
                        text: "$11,000? That's insulting for oversized heavy equipment! I need at least $15,000 or I'm not interested!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Грубость, нереалистичные требования.",
                        path: "reject3"
                    },
                    {
                        text: "I'll take it! $11,000 works! When can we start permits?",
                        quality: "fail",
                        analytics: "❌ Провал. Принял первое предложение без переговоров, потерял $1,500.",
                        path: "master"
                    }
                ]
            },
            // ШАГ 10: Final confirmation
            {
                brokerQuestion: "Perfect! $12,500 at $3.79/mile, permits billed separately.\nPickup: Northwest Equipment Rentals, 8900 E Marginal Way S, Seattle WA 98108, Steve Wilson 206-555-0199, in 5 days, 7 AM-3 PM.\nDelivery: Sunshine Construction, 12500 NW 25th St, Miami FL 33182, Carlos Martinez 305-555-0244, 7 days from pickup, 8 AM-4 PM.\nEquipment: Cat 320 excavator 2019, 32x12x14ft, 48K lbs.\nAny final questions?",
                dispatcherPrompt: "💎 Брокер дал все детали. Подтвердите и резюмируйте.",
                suggestions: [
                    {
                        text: "Perfect! Let me confirm: Pickup in 5 days, 7 AM-3 PM at Northwest Equipment, 8900 E Marginal Way S Seattle, Steve Wilson 206-555-0199. Equipment: Cat 320, 2019, 32x12x14ft, 48K lbs. Delivery in 7 days, 8 AM-4 PM at Sunshine Construction, 12500 NW 25th St Miami, Carlos Martinez 305-555-0244. 3,300 miles, $12,500 at $3.79/mile, permits separate $2,500-$3,500. Starting permit applications now. Sending NOA and insurance certificate. 100% confirmed!",
                        quality: "excellent",
                        analytics: "✨ Отлично! Полное профессиональное резюме всех деталей. МАСТЕР!",
                        path: "master"
                    },
                    {
                        text: "Confirmed! All details noted. Starting permit process. Sending NOA and insurance certificate now. Thank you!",
                        quality: "good",
                        analytics: "✔️ Хорошо! Хорошее подтверждение.",
                        path: "master"
                    },
                    {
                        text: "Got it. Sending NOA.",
                        quality: "normal",
                        analytics: "⚪ Нормально. Базовое подтверждение.",
                        path: "master"
                    },
                    {
                        text: "Okay, I think I have everything. Sending confirmation.",
                        quality: "weak",
                        analytics: "⚠️ Слабо. Неуверенность.",
                        path: "master"
                    },
                    {
                        text: "Yeah, we got it. Just send the rate con!",
                        quality: "aggressive",
                        analytics: "🔴 Агрессивно. Грубость.",
                        path: "reject1"
                    },
                    {
                        text: "Wait, what was the pickup time again?",
                        quality: "fail",
                        analytics: "❌ Провал. Не запомнил информацию.",
                        path: "reject1"
                    }
                ]
            }
        ],
        reject1: [
            {
                brokerQuestion: "",
                dispatcherPrompt: "",
                suggestions: []
            }
        ],
        reject2: [
            {
                brokerQuestion: "",
                dispatcherPrompt: "",
                suggestions: []
            }
        ],
        reject3: [
            {
                brokerQuestion: "",
                dispatcherPrompt: "",
                suggestions: []
            }
        ]
    },

    outcomes: {
        master: {
            type: "success",
            brokerResponse: "Outstanding! You're extremely professional and well-prepared for oversized heavy equipment transport. Rate confirmation sent to Pacific Northwest Transport MC 889944. I'm impressed with your permit knowledge, securement procedures, and route planning capabilities. If this delivery goes smoothly, I have 3-4 oversized equipment loads monthly. Looking forward to a long partnership!",
            rate: "$12,500",
            ratePerMile: "$3.79/mile",
            relationship: "Excellent - Monthly oversized loads opportunity",
            feedback: "✅ МАСТЕР УРОВЕНЬ! Вы продемонстрировали глубокое знание multi-state permits (13 states, $2,500-$3,500 costs), FMCSA securement regulations, route planning с height restrictions, и $500K insurance. Профессиональные переговоры с обоснованием привели к premium rate $3.79/mile плюс permit reimbursement. Oversized transport - это высокоспециализированная ниша с premium rates ($3.60-$4.00/mile) для qualified carriers. Ваш expertise открывает доступ к monthly loads generating $40K-$60K revenue."
        },
        reject1: {
            type: "failure",
            brokerResponse: "I appreciate you calling, but for oversized heavy equipment with $280K value and multi-state permits, I need carriers who are fully prepared. You showed concerns with insurance coverage, permit understanding, or readiness. I'm passing on this one. Recommendations: upgrade cargo insurance to $500K+, learn multi-state permit process, get FMCSA securement training, know your MC number at all times.",
            rate: "$0",
            ratePerMile: "$0/mile",
            relationship: "Rejected - Insufficient preparation",
            feedback: "❌ ОТКАЗ: Oversized transport требует minimum $250K insurance (лучше $500K), глубокое понимание permit process (13 states, 3-5 days, $2,500-$3,500), и professional communication. Если вы не знаете MC номер, не понимаете permit requirements, или агрессивны - broker ОБЯЗАН отказать. One permit violation = $5K-$10K fine per state. Подготовьтесь properly перед oversized loads."
        },
        reject2: {
            type: "failure",
            brokerResponse: "I'm stopping you there. Your attitude toward permits, securement, and route planning is a red flag. Saying 'permits are broker's job' or 'we'll use straps' or 'driver will figure it out' shows you don't understand oversized regulations. Oversized without permits = $5K-$10K fines per state, truck impoundment. Using straps for 48K lbs violates FMCSA - chains REQUIRED. No route planning = hitting bridges, $50K-$500K damage, criminal charges. I'm passing. Get FMCSA training, partner with permit service, invest in route software, gain experience with standard loads first.",
            rate: "$0",
            ratePerMile: "$0/mile",
            relationship: "Rejected - Dangerous practices",
            feedback: "❌ ОТКАЗ: Oversized regulations существуют для safety. CARRIER ответственен за permits, не broker. Straps НЕ допустимы для 48K lbs - chains REQUIRED (4x15K lbs WLL minimum). Route planning без height restriction software = bridge strikes costing $50K-$500K. One mistake может end your career. Consequences: fines $65K-$130K, equipment damage $280K, criminal charges, CDL revocation, company shutdown. Learn regulations перед oversized transport."
        },
        reject3: {
            type: "failure",
            brokerResponse: "You're asking $15,000+ ($4.55/mile) when market rate is $3.40-$3.80/mile. My offer $12,500 ($3.79/mile) is TOP of market, plus permits $2,500-$3,500 separate = $15K-$16K total. Demanding $15K base rate shows you don't know market or confuse base rate with total. I'm moving on. Research DAT/Truckstop rates, understand permit billing (separate, not included), negotiate professionally with justification, know when rate is fair. Oversized premium already built into $3.79/mile.",
            rate: "$0",
            ratePerMile: "$0/mile",
            relationship: "Rejected - Unrealistic expectations",
            feedback: "❌ ОТКАЗ: Market rate для oversized step deck $3.40-$3.80/mile base + permits $2,500-$3,500 separate. Требовать $15K base ($4.55/mile) = 20-25% выше рынка показывает ignorance. Правильный расчет: $12,500 base + $3,000 permits = $15,500 total. Your profit: $12,500 - fuel $4,000 - driver $3,000 = $5,500 на одном load. Жадность = $0. Профессионализм = $12,500 + monthly repeat business $40K-$60K."
        }
    }
};

// Add to global scenarios array
if (typeof allScenarios !== 'undefined') {
    allScenarios.push(scenario8);
    console.log('✅ Scenario 8 (Oversized Equipment Seattle-Miami) added to allScenarios');
    console.log('📊 Total scenarios now:', allScenarios.length);
} else {
    console.error('❌ ERROR: allScenarios array not found!');
}

console.log('✅ scenarios-data-v8.js loaded successfully');
