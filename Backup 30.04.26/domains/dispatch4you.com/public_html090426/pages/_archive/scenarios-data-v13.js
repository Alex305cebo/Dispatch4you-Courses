// DIALOGUE #13 - Dry Van Furniture (HYBRID: Rules + Competitor + Weekly Contract)
// Atlanta GA → Denver CO, 1,400 miles
// Posted: $4,200 ($3.00/mile), Target: $4,400-4,700 + weekly contract
// Created: March 9, 2026
// STRUCTURE: ГИБРИД - следует правилам, но появляется конкурент + weekly contract
// QUALITY: Premium - профессиональный стиль с драматическим поворотом

console.log('🔵 Loading scenarios-data-v13.js...');

const scenario13 = {
    id: 13,
    route: "Atlanta GA → Denver CO",
    distance: 1400,
    equipment: "Dry Van (53ft)",
    cargo: "Furniture (sofas, tables, chairs)",
    weight: "32,000 lbs",
    postedRate: "$4,200 ($3.00/mile)",
    deadline: "Pickup tomorrow 8 AM, Delivery in 3 days",
    brokerStyle: "Professional standard broker - follows rules, but fights competitor with contract offer",
    difficulty: "medium",
    initialMessage: "Good morning! This is Robert from HomeFreight Logistics.\nI'm calling about your posted dry van load Atlanta GA to Denver CO with furniture.\nIs this load still available?",

    paths: {
        master: [
            // ШАГ 1: MC, Company, Fleet (ПРАВИЛО)
            {
                brokerQuestion: "Good morning! This is Robert from HomeFreight Logistics. Yes, it's available. What's your MC number, company name, and how many dry vans do you run?",
                dispatcherPrompt: "💎 Стандартный вопрос: MC, компания, fleet!",
                suggestions: [
                    { text: "Good morning Robert! MC 334455, FurnitureHaul Express. We run 12 dry vans, all 53ft with furniture pads and straps. Specialized in furniture for 5 years - sofas, bedroom sets, office furniture. What's the furniture type?", quality: "excellent", path: "master" },
                    { text: "Morning Robert! MC 334455, FurnitureHaul. 12 dry vans. Furniture specialty. What type?", quality: "good", path: "master" },
                    { text: "MC 334455, FurnitureHaul Express.", quality: "normal", path: "warning" },
                    { text: "MC 334455... have vans...", quality: "weak", path: "warning" },
                    { text: "What's the rate first?", quality: "aggressive", path: "warning_strict" },
                    { text: "Van available.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 2: Location, Equipment (ПРАВИЛО)
            {
                brokerQuestion: "Excellent! 1,400 miles Atlanta GA to Denver CO. Furniture - sofas, tables, chairs, 32,000 lbs. Need furniture pads and straps. Where's your van and can you pick up tomorrow 8 AM?",
                dispatcherPrompt: "💎 Местоположение + pickup 8 AM! Furniture pads!",
                suggestions: [
                    { text: "Perfect! Van in Atlanta GA at furniture warehouse, empty since yesterday. 200 furniture pads, heavy-duty straps, dollies for loading. Driver ready 8 AM tomorrow. Van inspected last week. What's pickup address?", quality: "excellent", path: "master" },
                    { text: "Van in Atlanta GA at furniture warehouse, empty. 200 pads, straps, dollies ready. Driver ready 8 AM tomorrow.", quality: "good", path: "master" },
                    { text: "Van in Atlanta GA. Ready 8 AM.", quality: "normal", path: "warning" },
                    { text: "Should be in Atlanta GA... ready soon...", quality: "weak", path: "warning" },
                    { text: "Tell me rate first!", quality: "aggressive", path: "warning_strict" },
                    { text: "Can't be there until 10 AM.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 3: Experience, DOT (ПРАВИЛО)
            {
                brokerQuestion: "Great! Driver's furniture experience? Clean DOT? Furniture needs careful handling.",
                dispatcherPrompt: "💎 Опыт с furniture + DOT!",
                suggestions: [
                    { text: "Driver Steve, 6 years furniture hauling - residential, office, antiques. Knows proper wrapping, no scratches. Clean DOT - last inspection 4 weeks ago, zero violations. Safety rating Satisfactory.", quality: "excellent", path: "master" },
                    { text: "Driver Steve, 6 years furniture experience. Knows proper handling. Clean DOT, last inspection 4 weeks ago.", quality: "good", path: "master" },
                    { text: "Driver experienced with furniture. DOT clean.", quality: "normal", path: "warning" },
                    { text: "Driver has some furniture experience...", quality: "weak", path: "warning" },
                    { text: "Driver knows dry van!", quality: "aggressive", path: "warning_strict" },
                    { text: "Driver has CDL.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 4: Insurance (ПРАВИЛО)
            {
                brokerQuestion: "Perfect! Insurance: $100K cargo coverage for furniture? Current certificates?",
                dispatcherPrompt: "💎 Insurance $100K для furniture!",
                suggestions: [
                    { text: "Yes! $100K cargo coverage through State Farm, $1M liability. Certificates current, expire December 2027. Covers furniture damage. I'll email after booking.", quality: "excellent", path: "master" },
                    { text: "Yes, $100K cargo, $1M liability. Current certificates. Will send after booking.", quality: "good", path: "master" },
                    { text: "$100K cargo, $1M liability. Current.", quality: "normal", path: "warning" },
                    { text: "Should have $100K...", quality: "weak", path: "warning" },
                    { text: "Insurance is fine!", quality: "aggressive", path: "warning_strict" },
                    { text: "$75K enough for furniture?", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 5: Handling (ПРАВИЛО)
            {
                brokerQuestion: "Excellent! Handling: How will you protect furniture? What about stairs and tight spaces?",
                dispatcherPrompt: "💎 Furniture handling! Stairs и tight spaces!",
                suggestions: [
                    { text: "Furniture protection: Each piece wrapped in pads, plastic wrap for upholstery. Dollies for heavy items. Driver experienced with stairs - uses shoulder straps, takes time. Tight spaces - measures first, disassembles if needed. Zero damage record.", quality: "excellent", path: "master" },
                    { text: "Each piece wrapped in pads, plastic wrap. Dollies for heavy items. Driver handles stairs carefully. Measures tight spaces first.", quality: "good", path: "master" },
                    { text: "Furniture pads and straps. Driver careful.", quality: "normal", path: "warning" },
                    { text: "Driver will handle carefully...", quality: "weak", path: "warning" },
                    { text: "Standard furniture handling!", quality: "aggressive", path: "warning_strict" },
                    { text: "Driver loads when pickup.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 6: Commitment (ПРАВИЛО)
            {
                brokerQuestion: "Perfect! Delivery: Appointment Thursday 2 PM Denver CO furniture store. Customer waiting for delivery. Can you commit?",
                dispatcherPrompt: "💎 Thursday 2 PM commitment! Customer waiting!",
                suggestions: [
                    { text: "Absolutely committed Thursday 2 PM! Based on 1,400 miles, depart tomorrow 8 AM, arrive Wednesday evening with 18-hour buffer. Customer satisfaction critical - will call 24 hours ahead if any delay.", quality: "excellent", path: "master" },
                    { text: "Yes, committed Thursday 2 PM. Arrive Wednesday evening with buffer. Customer satisfaction critical.", quality: "good", path: "master" },
                    { text: "Yes, Thursday 2 PM works.", quality: "normal", path: "warning" },
                    { text: "We'll try for Thursday 2 PM...", quality: "weak", path: "warning" },
                    { text: "Traffic unpredictable with furniture.", quality: "aggressive", path: "warning_strict" },
                    { text: "Driver gets there when possible.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 7: ТОРГ - Rate Question (ПРАВИЛО - диспетчер спрашивает первым!)
            {
                brokerQuestion: "Great! What rate are you looking for on this 1,400 miles Atlanta GA-Denver CO furniture load?",
                dispatcherPrompt: "💎 ТОРГ! Posted $4,200 ($3.00/mi) - просите $4,400-4,700!",
                suggestions: [
                    { text: "For 1,400 miles Atlanta GA-Denver CO with furniture, I'm looking at $4,600. That's $3.29/mile - fair for dry van, furniture expertise, careful handling, customer delivery.", quality: "excellent", path: "master" },
                    { text: "$4,400 for this furniture load. $3.14/mile - fair with all services.", quality: "good", path: "master" },
                    { text: "$4,300 for 1,400 miles.", quality: "normal", path: "warning" },
                    { text: "$4,250 for this load?", quality: "weak", path: "warning" },
                    { text: "I need $5,000 minimum! Furniture is risky!", quality: "aggressive", path: "reject_rate_final" },
                    { text: "I'll take $4,200 posted.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // ШАГ 8: ПОВОРОТ! Конкурент появляется! (ГИБРИД - драматический момент!)
            {
                brokerQuestion: "That's reasonable. But hold on - I just got call from another carrier offering $4,100. They're undercutting you by $500. I like working with you, but business is business. Can you match $4,100 or should I go with them?",
                dispatcherPrompt: "⚠️ КОНКУРЕНТ! Предложил $4,100 (меньше posted!). Match или держите цену?",
                suggestions: [
                    { text: "Robert, I understand business. But here's the difference: they're offering $4,100 - that's BELOW your posted $4,200. That tells me they'll cut corners. We're offering $4,600 because we deliver VALUE - zero damage, on-time delivery, customer satisfaction. Your choice: cheap or reliable?", quality: "excellent", path: "master" },
                    { text: "Robert, they're offering below posted rate. We deliver quality at $4,400. Your choice: cheap or reliable?", quality: "good", path: "master" },
                    { text: "I'll match $4,100.", quality: "normal", path: "warning" },
                    { text: "Well... maybe $4,200 then?", quality: "weak", path: "warning" },
                    { text: "Go with them then! I won't work for peanuts!", quality: "aggressive", path: "reject_rate_final" },
                    { text: "Okay, $4,100 works.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // ШАГ 9: WEEKLY CONTRACT! (ГИБРИД - брокер предлагает контракт чтобы удержать!)
            {
                brokerQuestion: "You know what? You're right about quality. I don't want cheap carriers damaging furniture. Here's what I'll do: $4,500 for this load, AND I'll offer you weekly contract - 8-10 furniture loads weekly Atlanta GA-Denver CO at $4,400-4,600 each. That's $35,200-46,000 weekly! You interested?",
                dispatcherPrompt: "🎁 WEEKLY CONTRACT! 8-10 loads/week, $35K-46K weekly! Интересно?",
                suggestions: [
                    { text: "Robert, absolutely interested! $4,500 for this load plus weekly contract is exactly what we're looking for! 8-10 loads weekly at $4,400-4,600 = $35K-46K weekly revenue. We have capacity - 12 vans, 8 drivers. Let's build this partnership!", quality: "excellent", path: "master" },
                    { text: "Yes, very interested! $4,500 plus weekly contract is perfect. We have capacity for 8-10 loads weekly.", quality: "good", path: "master" },
                    { text: "Interested. What are contract terms?", quality: "normal", path: "master" },
                    { text: "8-10 loads is a lot... I need to check capacity...", quality: "weak", path: "warning" },
                    { text: "Weekly contract needs $5,000 per load minimum!", quality: "aggressive", path: "reject_rate_final" },
                    { text: "Let's start with one load and see.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // ШАГ 10: Contract Terms (ГИБРИД)
            {
                brokerQuestion: "Perfect! Contract terms: 8 loads minimum weekly, 10 maximum. $4,400-4,600 per load depending on urgency. Payment NET 10 days. You get priority on all my furniture loads. Can you commit to that volume?",
                dispatcherPrompt: "💎 Contract terms! 8 minimum, NET 10, priority! Можете?",
                suggestions: [
                    { text: "Robert, yes we can commit! 8 loads minimum weekly is perfect for our capacity. $4,400-4,600 per load, NET 10 payment - all acceptable. Priority on furniture loads - exactly what we want. Let's put it in writing!", quality: "excellent", path: "master" },
                    { text: "Yes, we can commit! 8 loads minimum weekly, $4,400-4,600, NET 10 - all good. Let's do it!", quality: "good", path: "master" },
                    { text: "We can commit to those terms.", quality: "normal", path: "master" },
                    { text: "8 loads minimum is tight... but okay...", quality: "weak", path: "warning" },
                    { text: "NET 10 is too fast! Need NET 30!", quality: "aggressive", path: "reject_rate_final" },
                    { text: "I need to discuss with my boss first.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // ШАГ 11: SUCCESS OUTCOME
            {
                brokerResponse: "Excellent! Contract sent to your email. First load is this Atlanta GA-Denver CO at $4,500. You beat the competitor by showing VALUE, not just price. That's exactly the carrier I need for furniture. Welcome to weekly partnership - you just secured $1,830,400-2,392,000 annual revenue! Let's make money together!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$4,500 (first load) + $35,200-46,000/week contract",
                    ratePerMile: "$3.21/mile (first load)",
                    relationship: "weekly contract partner",
                    weeklyLoads: "8-10 furniture loads weekly ($35,200-46,000/week GUARANTEED)",
                    feedback: `🏆 WEEKLY CONTRACT! Победил конкурента качеством!\n\n💰 ПЕРВЫЙ ГРУЗ:\n• Ставка: $4,500 (posted $4,200 = +$300 = 7.1%!)\n• Дизель: -$560 (1,400 miles × 0.125 gal/mi × $3.20)\n• Чистая прибыль: $3,940 (87%)\n\n📋 WEEKLY CONTRACT:\n• 8-10 loads/week GUARANTEED\n• $4,400-4,600 per load\n• $35,200-46,000/week revenue\n• Годовой потенциал: $1,830,400-2,392,000!\n\n🎯 ЧТО СДЕЛАЛ ПРАВИЛЬНО:\n✅ Следовал всем правилам профессионально\n✅ Не сдался когда появился конкурент\n✅ Продал ЦЕННОСТЬ вместо цены\n✅ Показал furniture экспертизу\n✅ Принял weekly contract\n\n💡 УРОК: Конкуренты предлагают дешево - ты предлагай КАЧЕСТВО! Брокеры платят больше за надежность!\n\n⭐ Это один из лучших результатов - weekly contract на $1.8-2.4M/год!`
                }
            }
        ],
        // WARNING PATH - MULTI-STEP (11 шагов)
        warning: [
            // WARNING ШАГ 1: MC/Company
            {
                brokerResponse: "⚠️ I need your MC number and company name clearly. This is furniture business. Can you provide that?",
                dispatcherPrompt: "💡 Брокер хочет MC и компанию! Дайте четко!",
                suggestions: [
                    { text: "I apologize Robert! MC 334455, FurnitureHaul Express, 12 dry vans specialized in furniture. Van in Atlanta GA ready 8 AM. Driver 6 years furniture experience. Ready to work professionally!", quality: "excellent", path: "master" },
                    { text: "Sorry. MC 334455, FurnitureHaul. 12 vans. Furniture specialty.", quality: "good", path: "master" },
                    { text: "MC 334455, FurnitureHaul Express.", quality: "normal", path: "master" },
                    { text: "I think I said MC...", quality: "weak", path: "reject_weak_final" },
                    { text: "Why so many questions?", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Not sure about MC.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 2: Location/Equipment
            {
                brokerResponse: "⚠️ I need to know where your van is and furniture equipment. Do you have pads and straps ready?",
                dispatcherPrompt: "💡 Брокер хочет местоположение и furniture equipment!",
                suggestions: [
                    { text: "I apologize Robert! Van in Atlanta GA at furniture warehouse, empty. 200 furniture pads, heavy-duty straps, dollies ready. Driver ready 8 AM tomorrow sharp!", quality: "excellent", path: "master" },
                    { text: "Sorry! Van in Atlanta GA at furniture warehouse. Pads and straps ready. Driver ready 8 AM tomorrow.", quality: "good", path: "master" },
                    { text: "Van in Atlanta GA. Ready 8 AM.", quality: "normal", path: "master" },
                    { text: "I think van is ready...", quality: "weak", path: "reject_weak_final" },
                    { text: "Why so specific?", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Not sure about location.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 3: Experience/DOT
            {
                brokerResponse: "⚠️ Furniture needs careful handling. What's driver's furniture experience and DOT status?",
                dispatcherPrompt: "💡 Брокер хочет furniture опыт и DOT! Дайте детали!",
                suggestions: [
                    { text: "I apologize Robert! Driver Steve, 6 years furniture hauling - residential, office, antiques. Knows proper wrapping. Clean DOT - last inspection 4 weeks ago, zero violations!", quality: "excellent", path: "master" },
                    { text: "Sorry! Driver Steve, 6 years furniture experience. Clean DOT, last inspection 4 weeks ago.", quality: "good", path: "master" },
                    { text: "Driver experienced with furniture. DOT clean.", quality: "normal", path: "master" },
                    { text: "I think driver experienced...", quality: "weak", path: "reject_weak_final" },
                    { text: "Driver knows his job!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Not sure about experience.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 4: Insurance
            {
                brokerResponse: "⚠️ Furniture damage is expensive. Do you have $100K cargo coverage with current certificates?",
                dispatcherPrompt: "💡 Брокер хочет $100K insurance для furniture!",
                suggestions: [
                    { text: "I apologize Robert! $100K cargo coverage through State Farm, $1M liability. Certificates current, expire December 2027. Covers furniture damage. I'll email after booking!", quality: "excellent", path: "master" },
                    { text: "Sorry! $100K cargo, $1M liability. Current certificates. Will send after booking.", quality: "good", path: "master" },
                    { text: "$100K cargo, $1M liability. Current.", quality: "normal", path: "master" },
                    { text: "I think we have $100K...", quality: "weak", path: "reject_weak_final" },
                    { text: "Insurance is standard!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Not sure about coverage.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 5: Handling
            {
                brokerResponse: "⚠️ How will you protect furniture from scratches and damage? I need specific handling process.",
                dispatcherPrompt: "💡 Брокер хочет конкретный furniture handling process!",
                suggestions: [
                    { text: "I apologize Robert! Each piece wrapped in pads, plastic wrap for upholstery. Dollies for heavy items. Driver experienced with stairs - uses shoulder straps. Zero damage record!", quality: "excellent", path: "master" },
                    { text: "Sorry! Pads and plastic wrap. Dollies for heavy items. Driver careful with stairs.", quality: "good", path: "master" },
                    { text: "Furniture pads and straps. Driver careful.", quality: "normal", path: "master" },
                    { text: "Driver will handle carefully...", quality: "weak", path: "reject_weak_final" },
                    { text: "Standard handling!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Not sure about process.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 6: Commitment
            {
                brokerResponse: "⚠️ Customer is waiting for their furniture Thursday 2 PM. Can you guarantee on-time delivery?",
                dispatcherPrompt: "💡 Брокер хочет гарантию Thursday 2 PM для customer!",
                suggestions: [
                    { text: "I apologize Robert! Absolutely guaranteed Thursday 2 PM! Arrive Wednesday evening with 18-hour buffer. Customer satisfaction is our priority!", quality: "excellent", path: "master" },
                    { text: "Sorry! Yes, guaranteed Thursday 2 PM. Arrive Wednesday evening with buffer.", quality: "good", path: "master" },
                    { text: "Yes, Thursday 2 PM works.", quality: "normal", path: "master" },
                    { text: "We'll try for Thursday...", quality: "weak", path: "reject_weak_final" },
                    { text: "Traffic is unpredictable!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Not sure about timing.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 7: Rate
            {
                brokerResponse: "⚠️ What's your realistic rate for 1,400 miles furniture load? I need fair pricing.",
                dispatcherPrompt: "💡 Брокер хочет реальную цену для furniture!",
                suggestions: [
                    { text: "I apologize Robert! For 1,400 miles with furniture expertise, I'm looking at $4,400. That's $3.14/mile - fair for careful handling and customer delivery!", quality: "excellent", path: "master" },
                    { text: "Sorry! $4,400 for this furniture load. $3.14/mile - fair with all services.", quality: "good", path: "master" },
                    { text: "$4,300 for 1,400 miles.", quality: "normal", path: "master" },
                    { text: "I think $4,250 is fair...", quality: "weak", path: "reject_weak_final" },
                    { text: "Market rate is higher!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Not sure about rate.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 8: Competitor Response
            {
                brokerResponse: "⚠️ Another carrier offered $4,100 - that's below posted rate. Can you beat cheap competition with quality?",
                dispatcherPrompt: "💡 Конкурент предложил дешево! Продайте качество!",
                suggestions: [
                    { text: "I apologize Robert! They're offering below posted - that means corners cut. We deliver QUALITY at $4,400 - zero damage, happy customers. Your choice: cheap or reliable?", quality: "excellent", path: "master" },
                    { text: "Sorry! They're below posted. We deliver quality at $4,300. Cheap or reliable?", quality: "good", path: "master" },
                    { text: "I'll match $4,100.", quality: "normal", path: "warning" },
                    { text: "Maybe $4,200 then?", quality: "weak", path: "reject_rate_final" },
                    { text: "Go with them!", quality: "aggressive", path: "reject_rate_final" },
                    { text: "Okay, $4,100.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 9: Contract Interest
            {
                brokerResponse: "⚠️ I'm offering weekly contract - 8-10 furniture loads, $35K-46K weekly revenue! Are you serious about this opportunity?",
                dispatcherPrompt: "💡 Брокер предлагает weekly contract! Серьезно интересно?",
                suggestions: [
                    { text: "I apologize Robert! Yes, absolutely serious! Weekly contract is exactly what we need! We have 12 vans, 8 drivers - capacity for 8-10 loads weekly!", quality: "excellent", path: "master" },
                    { text: "Sorry! Yes, very serious! Weekly contract is perfect for us!", quality: "good", path: "master" },
                    { text: "Interested. What are terms?", quality: "normal", path: "master" },
                    { text: "I need to check capacity...", quality: "weak", path: "reject_weak_final" },
                    { text: "Contract needs higher rates!", quality: "aggressive", path: "reject_rate_final" },
                    { text: "Let's start with one load.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 10: Contract Terms
            {
                brokerResponse: "⚠️ Contract requires 8 loads minimum weekly, NET 10 payment terms. Can you handle this commitment level?",
                dispatcherPrompt: "💡 Брокер хочет commitment к contract terms!",
                suggestions: [
                    { text: "I apologize Robert! Yes, we can absolutely handle it! 8 loads minimum weekly, NET 10 payment - all acceptable. We're ready for this commitment level!", quality: "excellent", path: "master" },
                    { text: "Sorry! Yes, we can handle it! 8 loads minimum, NET 10 - all good!", quality: "good", path: "master" },
                    { text: "We can commit to those terms.", quality: "normal", path: "master" },
                    { text: "8 loads is tight... but okay...", quality: "weak", path: "reject_rate_final" },
                    { text: "NET 10 too fast!", quality: "aggressive", path: "reject_rate_final" },
                    { text: "Need to discuss with boss.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 11: Final Success (через warning)
            {
                brokerResponse: "Okay, contract sent. You improved your communication during our talk. Let's see how this first furniture load goes before we finalize weekly terms.",
                outcome: {
                    type: "success",
                    quality: "good",
                    rate: "$4,500 (first load) + trial contract",
                    ratePerMile: "$3.21/mile",
                    relationship: "trial period",
                    weeklyLoads: "First load trial, then maybe weekly contract if perfect",
                    feedback: `✅ ГРУЗ ПОЛУЧЕН! Но слабая коммуникация чуть не стоила weekly contract.\n\n💰 ФИНАНСЫ:\n• Ставка: $4,500 (+$300)\n• Дизель: -$560\n• Чистая прибыль: $3,940\n\n⚠️ CONTRACT: На испытательном сроке! Слабая коммуникация = сомнения брокера.\n\n💡 УРОК: Weekly contracts требуют уверенности с первого шага! Упущен потенциал $1.8-2.4M/год!`
                }
            }
        ],

        // WARNING_STRICT PATH
        warning_strict: [
            {
                brokerResponse: "⚠️ STOP! This is professional furniture business! If you want this load, answer professionally NOW. Last chance!",
                dispatcherPrompt: "🚨 ПОСЛЕДНИЙ ШАНС! Furniture не терпит ошибок!",
                suggestions: [
                    { text: "Robert, I sincerely apologize! MC 334455, FurnitureHaul Express, 12 dry vans specialized in furniture. Van in Atlanta GA ready 8 AM. Driver Steve, 6 years furniture experience. $100K insurance. Ready to work professionally!", quality: "excellent", path: "master" },
                    { text: "I apologize Robert! MC 334455, FurnitureHaul. Van ready 8 AM. Driver experienced. Ready!", quality: "good", path: "master" },
                    { text: "Sorry. MC 334455. Ready.", quality: "normal", path: "master" },
                    { text: "I didn't mean to be rude...", quality: "weak", path: "reject_attitude_final" },
                    { text: "You're too demanding!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "This is too stressful.", quality: "fail", path: "reject_weak_final" }
                ]
            }
        ],

        // REJECT PATHS
        reject_weak_final: [
            {
                brokerResponse: "Sorry, I need confident carrier for furniture. Can't risk customer satisfaction. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Furniture требует уверенности! Неуверенность = потерянный weekly contract + упущено $1.8-2.4M/год!"
                }
            }
        ],

        reject_attitude_final: [
            {
                brokerResponse: "I don't work with unprofessional carriers on furniture. Customer service is critical. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Грубость с furniture грузом недопустима! Упущен weekly contract!"
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
                    feedback: "❌ REJECT: Жадность! Брокер предложил хорошую цену + weekly contract!"
                }
            }
        ]
    }
};

allScenarios.push(scenario13);
console.log('✅ Scenario 13 loaded: Dry Van Furniture (Atlanta GA → Denver CO) - HYBRID: Rules + Competitor + Weekly Contract!');