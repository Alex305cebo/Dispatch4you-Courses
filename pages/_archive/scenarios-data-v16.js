// DIALOGUE #16 - Dry Van Textiles (HYBRID: Rules + Seasonal Bonus)
// Atlanta GA → Denver CO, 1,398 miles
// Posted: $4,194 ($3.00/mile), Target: $4,600-5,000 + seasonal bonus
// Created: March 9, 2026
// STRUCTURE: ГИБРИД - следует правилам, но добавляет seasonal fashion bonus
// QUALITY: Premium - professional broker с seasonal fashion industry twist

console.log('🔵 Loading scenarios-data-v16.js...');

const scenario16 = {
    id: 16,
    route: "Atlanta GA → Denver CO",
    distance: 1398,
    equipment: "Dry Van (53ft)",
    cargo: "Fashion textiles (spring collection, designer fabrics, clothing)",
    weight: "32,000 lbs",
    postedRate: "$4,194 ($3.00/mile)",
    deadline: "Pickup tomorrow 10 AM, Delivery in 3 days",
    brokerStyle: "Professional standard broker - follows rules, but fashion industry seasonal urgency",
    difficulty: "medium",
    initialMessage: "Good morning! This is Sarah from Fashion Forward Logistics.\nI'm calling about your posted dry van load Atlanta GA to Denver CO with fashion textiles.\nIs this load still available?",

    paths: {
        master: [
            // ШАГ 1: MC, Company, Fleet (ПРАВИЛО)
            {
                brokerQuestion: "Good morning! This is Sarah from Fashion Forward Logistics. Yes, it's available. What's your MC number, company name, and how many dry vans do you run?",
                dispatcherPrompt: "💎 Стандартный вопрос: MC, компания, dry van fleet!",
                suggestions: [
                    { text: "Good morning Sarah! MC 445566, StyleHaul Transport. We run 25 dry vans, all 53ft with climate control. Specialized in fashion and retail for 6 years - textiles, clothing, seasonal collections. What's the delivery timeline?", quality: "excellent", path: "master" },
                    { text: "Morning Sarah! MC 445566, StyleHaul. 25 dry vans. Fashion specialty. Timeline?", quality: "good", path: "master" },
                    { text: "MC 445566, StyleHaul Transport.", quality: "normal", path: "warning" },
                    { text: "MC 445566... have dry vans...", quality: "weak", path: "warning" },
                    { text: "What's the rate first?", quality: "aggressive", path: "warning_strict" },
                    { text: "Dry van available.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 2: Location, Equipment (ПРАВИЛО)
            {
                brokerQuestion: "Excellent! 1,398 miles Atlanta GA to Denver CO. Fashion textiles - spring collection, designer fabrics, clothing, 32,000 lbs. Need climate-controlled dry van. Where's your van and can you pick up tomorrow 10 AM?",
                dispatcherPrompt: "💎 Местоположение + pickup 10 AM! Climate control для fashion!",
                suggestions: [
                    { text: "Perfect! Van in Atlanta GA at fashion district, empty since yesterday. Climate-controlled dry van: temp/humidity control, air ride suspension for delicate fabrics. Pre-conditioned to 68°F, 45% humidity for textiles. Driver ready 10 AM tomorrow. What's pickup address?", quality: "excellent", path: "master" },
                    { text: "Van in Atlanta GA fashion district, empty. Climate-controlled, pre-conditioned for textiles. Driver ready 10 AM tomorrow.", quality: "good", path: "master" },
                    { text: "Van in Atlanta GA. Ready 10 AM.", quality: "normal", path: "warning" },
                    { text: "Should be in Atlanta GA... ready soon...", quality: "weak", path: "warning" },
                    { text: "Tell me rate first!", quality: "aggressive", path: "warning_strict" },
                    { text: "Can't be there until noon.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 3: Experience, DOT (ПРАВИЛО)
            {
                brokerQuestion: "Great! Driver's fashion/textile experience? Clean DOT? Fashion cargo requires careful handling.",
                dispatcherPrompt: "💎 Опыт с fashion/textiles + DOT!",
                suggestions: [
                    { text: "Driver Lisa, 8 years fashion hauling - textiles, designer clothing, seasonal collections. Understands fabric care, no smoking, clean environment. Clean DOT - last inspection 4 weeks ago, zero violations. Safety rating Satisfactory.", quality: "excellent", path: "master" },
                    { text: "Driver Lisa, 8 years fashion experience. Fabric care training. Clean DOT, last inspection 4 weeks ago.", quality: "good", path: "master" },
                    { text: "Driver experienced with fashion. DOT clean.", quality: "normal", path: "warning" },
                    { text: "Driver has some fashion experience...", quality: "weak", path: "warning" },
                    { text: "Driver knows dry van!", quality: "aggressive", path: "warning_strict" },
                    { text: "Driver has CDL.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 4: Insurance (ПРАВИЛО)
            {
                brokerQuestion: "Perfect! Insurance: $150K cargo coverage for fashion textiles? Current certificates?",
                dispatcherPrompt: "💎 Insurance $150K для fashion textiles!",
                suggestions: [
                    { text: "Yes! $150K cargo coverage through Liberty Mutual, specifically for fashion/textiles. $1M liability. Certificates current, expire December 2027. Covers fashion damage. I'll email after booking.", quality: "excellent", path: "master" },
                    { text: "Yes, $150K cargo for fashion, $1M liability. Current certificates. Will send after booking.", quality: "good", path: "master" },
                    { text: "$150K cargo, $1M liability. Current.", quality: "normal", path: "warning" },
                    { text: "Should have $150K...", quality: "weak", path: "warning" },
                    { text: "Insurance is fine!", quality: "aggressive", path: "warning_strict" },
                    { text: "$100K enough for textiles?", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 5: Fashion Handling (ПРАВИЛО)
            {
                brokerQuestion: "Excellent! Fashion handling: How will you protect designer fabrics and clothing during transport? Any special protocols?",
                dispatcherPrompt: "💎 Fashion handling protocols для designer fabrics!",
                suggestions: [
                    { text: "Fashion handling protocols: Climate control maintains 68°F, 45% humidity. No smoking, clean environment, air ride suspension prevents fabric damage. Driver wears gloves when handling. We've never damaged fashion cargo - understand seasonal value.", quality: "excellent", path: "master" },
                    { text: "Climate control, clean environment, air ride suspension. Driver wears gloves. No smoking policy for fashion.", quality: "good", path: "master" },
                    { text: "Climate control and clean handling. No smoking.", quality: "normal", path: "warning" },
                    { text: "Driver will handle carefully...", quality: "weak", path: "warning" },
                    { text: "It's just clothing in boxes!", quality: "aggressive", path: "warning_strict" },
                    { text: "Driver loads and delivers.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 6: Commitment (ПРАВИЛО)
            {
                brokerQuestion: "Perfect! Delivery: Appointment Thursday 8 AM Denver CO Fashion Center. Spring season launch depends on this. Can you commit?",
                dispatcherPrompt: "💎 Thursday 8 AM commitment! Spring season launch!",
                suggestions: [
                    { text: "Absolutely committed Thursday 8 AM! Based on 1,398 miles, depart tomorrow 10 AM, arrive Wednesday evening with buffer. Spring season is critical - will call 12 hours ahead if any delay.", quality: "excellent", path: "master" },
                    { text: "Yes, committed Thursday 8 AM. Arrive Wednesday evening with buffer. Spring season priority.", quality: "good", path: "master" },
                    { text: "Yes, Thursday 8 AM works.", quality: "normal", path: "warning" },
                    { text: "We'll try for Thursday 8 AM...", quality: "weak", path: "warning" },
                    { text: "Fashion seasons are unpredictable.", quality: "aggressive", path: "warning_strict" },
                    { text: "Driver gets there when possible.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 7: ТОРГ - Rate Question (ПРАВИЛО - диспетчер спрашивает первым!)
            {
                brokerQuestion: "Great! What rate are you looking for on this 1,398 miles Atlanta GA-Denver CO fashion load?",
                dispatcherPrompt: "💎 ТОРГ! Posted $4,194 ($3.00/mi) - просите $4,600-5,000!",
                suggestions: [
                    { text: "For 1,398 miles Atlanta GA-Denver CO with fashion textiles, I'm looking at $4,800. That's $3.43/mile - fair for dry van, climate control, fashion expertise, seasonal timing.", quality: "excellent", path: "master" },
                    { text: "$4,600 for this fashion load. $3.29/mile - fair with all services.", quality: "good", path: "master" },
                    { text: "$4,500 for 1,398 miles.", quality: "normal", path: "warning" },
                    { text: "$4,400 for this load?", quality: "weak", path: "warning" },
                    { text: "I need $5,500 minimum! Fashion is risky!", quality: "aggressive", path: "reject_rate_final" },
                    { text: "I'll take $4,194 posted.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // ШАГ 8: ПОВОРОТ! Seasonal Bonus! (ГИБРИД - seasonal fashion urgency!)
            {
                brokerQuestion: "That's reasonable. But wait - I just realized this is our spring collection launch shipment! Fashion retail is crazy right now. If you can guarantee Thursday 6 AM delivery (2 hours early), I'll add $400 seasonal bonus. Total $5,000! Spring season waits for no one. Can you do it?",
                dispatcherPrompt: "🌸 SEASONAL BONUS! Thursday 6 AM delivery + $400 = $5,000!",
                suggestions: [
                    { text: "Sarah, absolutely! Spring season takes priority! Driver Lisa can deliver Thursday 6 AM - arrive Wednesday afternoon, rest overnight. Fashion retail timing is everything. $5,000 with seasonal bonus - we understand fashion urgency!", quality: "excellent", path: "master" },
                    { text: "Yes! Spring season priority! Can deliver Thursday 6 AM. $5,000 confirmed!", quality: "good", path: "master" },
                    { text: "Thursday 6 AM delivery works. $5,000 confirmed.", quality: "normal", path: "master" },
                    { text: "6 AM is early... but for seasonal... okay...", quality: "weak", path: "warning" },
                    { text: "Seasonal needs $5,500 minimum!", quality: "aggressive", path: "reject_rate_final" },
                    { text: "Can't do 6 AM, 8 AM only.", quality: "fail", path: "reject_timing_final" }
                ]
            },
            // ШАГ 9: Fashion Industry Insight (ГИБРИД)
            {
                brokerQuestion: "Excellent! Fashion industry insight: Spring collections are 3 weeks late this year due to supply chain. Retailers are desperate. I have 15-20 fashion loads weekly, all paying premium for reliable carriers. Want to be my go-to fashion carrier?",
                dispatcherPrompt: "💎 Fashion industry insight! 15-20 loads/week premium! Go-to carrier?",
                suggestions: [
                    { text: "Absolutely Sarah! Fashion supply chain challenges = opportunity for reliable carriers. 15-20 loads weekly at premium rates - we'll be your dedicated fashion specialists. Spring, summer, fall collections - we understand seasonal urgency!", quality: "excellent", path: "master" },
                    { text: "Yes! Want to be your go-to fashion carrier. 15-20 weekly loads at premium rates works perfectly.", quality: "good", path: "master" },
                    { text: "Interested in being go-to fashion carrier.", quality: "normal", path: "warning" },
                    { text: "15-20 weekly might be challenging...", quality: "weak", path: "warning" },
                    { text: "Fashion industry is too unpredictable!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Let's see how this load goes first.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // ШАГ 10: Email + Fashion Partnership (ПРАВИЛО)
            {
                brokerQuestion: "Perfect! Email? I'll send seasonal rate con NOW. Also sending fashion carrier agreement - exclusive rates, priority booking, seasonal bonuses. Confirm: Atlanta GA 10 AM tomorrow, Denver CO 6 AM Thursday, $5,000 total.",
                dispatcherPrompt: "💎 Email! Fashion carrier agreement! Подтвердите seasonal plan!",
                suggestions: [
                    { text: "Perfect! dispatch@stylehual.com. I'll sign both immediately. Confirmed: Atlanta GA Fashion District 10 AM tomorrow, Denver CO Fashion Center 6 AM Thursday, $5,000 total. Your spring collections are in expert hands!", quality: "excellent", path: "master" },
                    { text: "dispatch@stylehual.com. Sign immediately. Atlanta GA 10 AM tomorrow, Denver CO 6 AM Thursday, $5,000 confirmed!", quality: "good", path: "master" },
                    { text: "dispatch@stylehual.com. All confirmed.", quality: "normal", path: "warning" },
                    { text: "Let me find email...", quality: "weak", path: "warning" },
                    { text: "Send anywhere. Drivers know.", quality: "aggressive", path: "reject_email_final" },
                    { text: "No email... text message?", quality: "fail", path: "reject_email_final" }
                ]
            },
            // ШАГ 11: SUCCESS OUTCOME
            {
                brokerResponse: "Excellent! Seasonal rate con sent to dispatch@stylehual.com. You just became my fashion hero! Most carriers don't understand seasonal urgency. You saved our spring launch! Adding you to premium fashion carrier list. Fashion industry pays top dollar for reliability - you're now my #1 fashion specialist!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$5,000 (seasonal bonus)",
                    ratePerMile: "$3.58/mile",
                    relationship: "#1 fashion carrier",
                    weeklyLoads: "15-20 fashion loads weekly ($75,000-100,000/week potential)",
                    feedback: `🌸 SEASONAL FASHION HERO! Spring launch спасен!\n\n💰 ФИНАНСЫ:\n• Ставка: $4,600\n• Seasonal bonus: +$400\n• ИТОГО: $5,000 (posted $4,194 = +$806 = 19.2%!)\n• Дизель: -$559 (1,398 miles × 0.125 gal/mi × $3.20)\n• Чистая прибыль: $4,441 (89%)\n\n🎯 УРОК: Fashion seasonal urgency = premium money!\n\nТы:\n✅ Следовал всем правилам профессионально\n✅ Понял seasonal fashion urgency\n✅ Принял early delivery challenge\n✅ Показал fashion industry expertise\n✅ Заработал +$806 больше posted!\n\n⭐ БОНУС: 15-20 loads/week = $3,900,000-5,200,000/год потенциал!\n\n💡 Fashion industry платит premium за seasonal reliability!`
                }
            }
        ],
        // WARNING PATH: 11 шагов с уникальными сообщениями
        warning: [
            // WARNING ШАГ 1: MC/Company
            {
                brokerResponse: "⚠️ I need your MC number and company name clearly for fashion textiles. Can you provide that?",
                dispatcherPrompt: "💡 Брокер хочет MC и компанию для fashion! Дайте четко!",
                suggestions: [
                    { text: "I apologize! MC 445566, StyleHaul Transport. We specialize in fashion textiles.", quality: "excellent", path: "master" },
                    { text: "Sorry. MC 445566, StyleHaul Transport.", quality: "good", path: "master" },
                    { text: "MC 445566, StyleHaul.", quality: "normal", path: "master" },
                    { text: "I think I said MC 445566...", quality: "weak", path: "reject_weak_final" },
                    { text: "Why so many questions for fashion?", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Not sure about MC number.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 2: Location/Equipment
            {
                brokerResponse: "⚠️ I need to know where your dry van is and if you can pick up tomorrow 10 AM for fashion textiles. Can you confirm?",
                dispatcherPrompt: "💡 Брокер хочет местоположение van и pickup 10 AM для fashion!",
                suggestions: [
                    { text: "Van in Atlanta GA fashion district, empty and ready. Can pick up tomorrow 10 AM for fashion textiles.", quality: "excellent", path: "master" },
                    { text: "Van in Atlanta GA. Ready 10 AM tomorrow.", quality: "good", path: "master" },
                    { text: "Atlanta GA area. Should be ready 10 AM.", quality: "normal", path: "master" },
                    { text: "I think van is in Atlanta GA...", quality: "weak", path: "reject_weak_final" },
                    { text: "Fashion loads are demanding!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Maybe 11 AM or noon pickup?", quality: "fail", path: "reject_timing_final" }
                ]
            },
            // WARNING ШАГ 3: Experience/DOT
            {
                brokerResponse: "⚠️ I need driver's fashion/textile experience and clean DOT status. Fashion cargo requires careful handling. Can you confirm?",
                dispatcherPrompt: "💡 Брокер хочет опыт с fashion/textiles и DOT статус!",
                suggestions: [
                    { text: "Driver has 8 years fashion experience - textiles, clothing. Clean DOT, last inspection 4 weeks ago.", quality: "excellent", path: "master" },
                    { text: "Driver experienced with fashion textiles. Clean DOT.", quality: "good", path: "master" },
                    { text: "Driver has fashion experience. DOT is clean.", quality: "normal", path: "master" },
                    { text: "Driver has some fashion experience...", quality: "weak", path: "reject_weak_final" },
                    { text: "DOT inspections are harassment!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Driver knows dry van loads.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 4: Insurance
            {
                brokerResponse: "⚠️ I need confirmation of $150K cargo coverage specifically for fashion textiles. Do you have current certificates?",
                dispatcherPrompt: "💡 Брокер хочет подтверждение $150K insurance для fashion!",
                suggestions: [
                    { text: "$150K cargo coverage for fashion through Liberty Mutual. Current certificates, will email after booking.", quality: "excellent", path: "master" },
                    { text: "$150K cargo for fashion textiles. Current certificates.", quality: "good", path: "master" },
                    { text: "$150K cargo coverage. Certificates current.", quality: "normal", path: "master" },
                    { text: "Should have $150K coverage...", quality: "weak", path: "reject_weak_final" },
                    { text: "Insurance companies overcharge fashion!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "$100K should be enough for textiles.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 5: Fashion Handling
            {
                brokerResponse: "⚠️ I need to know how you'll protect designer fabrics during transport. What are your fashion handling protocols?",
                dispatcherPrompt: "💡 Брокер хочет детали fashion handling protocols!",
                suggestions: [
                    { text: "Climate control maintains 68°F, 45% humidity. Clean environment, air ride suspension. Driver wears gloves.", quality: "excellent", path: "master" },
                    { text: "Climate control, clean environment, air ride suspension. No smoking policy for fashion.", quality: "good", path: "master" },
                    { text: "Have climate control. Driver will handle carefully.", quality: "normal", path: "master" },
                    { text: "Driver will handle textiles carefully...", quality: "weak", path: "reject_weak_final" },
                    { text: "It's just clothing in boxes!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Driver loads and delivers.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 6: Commitment
            {
                brokerResponse: "⚠️ I need solid commitment for Thursday 8 AM delivery at Denver CO Fashion Center. Spring season depends on this. Can you commit?",
                dispatcherPrompt: "💡 Брокер хочет твердое commitment для spring season!",
                suggestions: [
                    { text: "Absolutely committed Thursday 8 AM! Spring season is critical - will call ahead if any delay.", quality: "excellent", path: "master" },
                    { text: "Yes, committed Thursday 8 AM. Spring season priority.", quality: "good", path: "master" },
                    { text: "Thursday 8 AM should work.", quality: "normal", path: "master" },
                    { text: "We'll try for Thursday 8 AM...", quality: "weak", path: "reject_weak_final" },
                    { text: "Fashion seasons are unpredictable!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Driver gets there when possible.", quality: "fail", path: "reject_timing_final" }
                ]
            },
            // WARNING ШАГ 7: Rate Question
            {
                brokerResponse: "⚠️ I asked for your rate on this fashion load. What are you looking for on 1,398 miles Atlanta GA-Denver CO?",
                dispatcherPrompt: "💡 Брокер повторяет вопрос о ставке! Posted $4,194!",
                suggestions: [
                    { text: "$4,800 for fashion textiles. $3.43/mile with all specialized services.", quality: "excellent", path: "master" },
                    { text: "$4,600 for this fashion load. Fair rate.", quality: "good", path: "master" },
                    { text: "$4,500 for 1,398 miles.", quality: "normal", path: "master" },
                    { text: "$4,400 maybe?", quality: "weak", path: "reject_weak_final" },
                    { text: "Fashion loads need $5,500 minimum!", quality: "aggressive", path: "reject_rate_final" },
                    { text: "I'll take posted $4,194.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 8: Seasonal Response
            {
                brokerResponse: "⚠️ I offered seasonal bonus for Thursday 6 AM delivery with spring collection urgency. Can you handle this or not?",
                dispatcherPrompt: "💡 Брокер повторяет seasonal offer! $5,000 total!",
                suggestions: [
                    { text: "Yes! Spring season takes priority! Can deliver Thursday 6 AM. $5,000 confirmed!", quality: "excellent", path: "master" },
                    { text: "Thursday 6 AM delivery works. $5,000 confirmed.", quality: "good", path: "master" },
                    { text: "6 AM is early but for seasonal... okay.", quality: "normal", path: "master" },
                    { text: "6 AM is very early... maybe...", quality: "weak", path: "reject_timing_final" },
                    { text: "Seasonal needs $5,500!", quality: "aggressive", path: "reject_rate_final" },
                    { text: "Can't do 6 AM, 8 AM only.", quality: "fail", path: "reject_timing_final" }
                ]
            },
            // WARNING ШАГ 9: Fashion Partnership
            {
                brokerResponse: "⚠️ I offered to make you my go-to fashion carrier with 15-20 weekly loads. Are you interested or not?",
                dispatcherPrompt: "💡 Брокер хочет подтверждение fashion partnership!",
                suggestions: [
                    { text: "Very interested! Want to be your go-to fashion carrier. 15-20 weekly loads at premium rates.", quality: "excellent", path: "master" },
                    { text: "Interested in being go-to fashion carrier. Weekly loads work.", quality: "good", path: "master" },
                    { text: "Interested in fashion partnership.", quality: "normal", path: "master" },
                    { text: "15-20 weekly might be challenging...", quality: "weak", path: "reject_weak_final" },
                    { text: "Fashion industry is unpredictable!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Let's see how this goes first.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 10: Email Confirmation
            {
                brokerResponse: "⚠️ I need your email NOW to send seasonal rate confirmation and fashion carrier agreement. What's your email?",
                dispatcherPrompt: "💡 Брокер хочет email для seasonal rate con!",
                suggestions: [
                    { text: "dispatch@stylehual.com. I'll sign immediately. Seasonal confirmed!", quality: "excellent", path: "master" },
                    { text: "dispatch@stylehual.com. Will sign quickly.", quality: "good", path: "master" },
                    { text: "dispatch@stylehual.com", quality: "normal", path: "master" },
                    { text: "Let me find email address...", quality: "weak", path: "reject_email_final" },
                    { text: "Just send it anywhere, drivers know.", quality: "aggressive", path: "reject_email_final" },
                    { text: "No email... text message works?", quality: "fail", path: "reject_email_final" }
                ]
            },
            // WARNING ШАГ 11: Final Warning
            {
                brokerResponse: "⚠️ This is spring season launch! I need professional fashion carrier who understands seasonal urgency. Are you that carrier or should I call someone else?",
                dispatcherPrompt: "💡 Последний шанс! Spring season launch!",
                suggestions: [
                    { text: "Absolutely! We're the professional fashion carrier you need. Spring season confirmed, fashion comes first!", quality: "excellent", path: "master" },
                    { text: "Yes, we can handle spring season professionally.", quality: "good", path: "master" },
                    { text: "We can do this seasonal load.", quality: "normal", path: "master" },
                    { text: "I think we can handle it...", quality: "weak", path: "reject_weak_final" },
                    { text: "Find someone else then!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Maybe call someone else.", quality: "fail", path: "reject_weak_final" }
                ]
            }
        ],

        // WARNING_STRICT PATH: 1 шаг
        warning_strict: [
            {
                brokerResponse: "Listen, this is fashion textiles for spring season launch. I need a professional carrier who takes seasonal urgency seriously. Last chance - are you professional or should I hang up?",
                dispatcherPrompt: "🚨 ПОСЛЕДНИЙ ШАНС! Fashion textiles для spring season!",
                suggestions: [
                    { text: "I apologize Sarah! We're absolutely professional with fashion textiles. MC 445566, StyleHaul Transport, 6 years fashion experience. Spring season is our priority!", quality: "excellent", path: "master" },
                    { text: "Sorry! We're professional fashion carrier. Spring season priority.", quality: "good", path: "master" },
                    { text: "We're professional with fashion textiles.", quality: "normal", path: "warning" },
                    { text: "I'm trying to be professional...", quality: "weak", path: "reject_attitude_final" },
                    { text: "I am professional! You're demanding!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Whatever, just tell me the rate.", quality: "fail", path: "reject_attitude_final" }
                ]
            }
        ],

        // REJECT PATHS: 7 путей
        reject_weak_final: [
            {
                brokerResponse: "I can't work with uncertain carriers on fashion textiles. Spring season launch requires confidence and reliability. I'm going with someone more decisive. Good luck!",
                outcome: {
                    type: "rejection",
                    reason: "weak_responses",
                    feedback: `❌ ОТКЛОНЕН: Слабые ответы на fashion load\n\n💔 ПРИЧИНА:\n• Неуверенные ответы ("I think...", "maybe...")\n• Нет четкости в fashion expertise\n• Брокер не доверяет с spring season\n\n💡 УРОК: Fashion loads требуют 100% confidence!\n\nЧто делать:\n✅ Четкие, уверенные ответы\n✅ Подчеркивать fashion experience\n✅ Показывать commitment к seasonal urgency\n✅ Никаких "maybe" или "I think"\n\n🎯 Fashion industry = seasonal deadlines = максимальная ответственность!`
                }
            }
        ],

        reject_attitude_final: [
            {
                brokerResponse: "Your attitude is unprofessional for fashion textiles. I need carriers who respect seasonal urgency and fashion industry standards. I'm hanging up and calling someone else.",
                outcome: {
                    type: "rejection",
                    reason: "bad_attitude",
                    feedback: `❌ ОТКЛОНЕН: Плохое отношение к fashion load\n\n💔 ПРИЧИНА:\n• Агрессивные или грубые ответы\n• Нет уважения к seasonal urgency\n• Непрофессиональное поведение\n\n💡 УРОК: Fashion industry = высокие standards!\n\nЧто делать:\n✅ Максимальное уважение к fashion cargo\n✅ Понимание seasonal importance\n✅ Профессиональный тон всегда\n✅ Никогда не спорить с fashion brokers\n\n🎯 Fashion industry платит premium за professionalism!`
                }
            }
        ],

        reject_timing_final: [
            {
                brokerResponse: "You can't commit to seasonal fashion timing. Spring collections wait for no one. I'm calling a carrier who understands fashion urgency. Goodbye!",
                outcome: {
                    type: "rejection",
                    reason: "timing_issues",
                    feedback: `❌ ОТКЛОНЕН: Не можешь handle seasonal timing\n\n💔 ПРИЧИНА:\n• Не готов к early delivery\n• Не понимаешь fashion season urgency\n• Spring collections не ждут delays\n\n💡 УРОК: Fashion seasons = non-negotiable deadlines!\n\nЧто делать:\n✅ Всегда готов к seasonal urgency\n✅ Понимать fashion retail timing\n✅ Early delivery лучше late delivery\n✅ Seasonal bonuses за early delivery\n\n🎯 Fashion industry платит premium за seasonal reliability!`
                }
            }
        ],

        reject_rate_final: [
            {
                brokerResponse: "Your rate is unrealistic for fashion textiles. I have seasonal budget constraints. Finding a more reasonable carrier who understands fashion market. Good luck!",
                outcome: {
                    type: "rejection",
                    reason: "unrealistic_rate",
                    feedback: `❌ ОТКЛОНЕН: Нереальная ставка для fashion\n\n💔 ПРИЧИНА:\n• Слишком высокая ставка\n• Не понимаешь fashion market\n• Жадность > seasonal opportunity\n\n💡 УРОК: Fashion loads имеют seasonal budgets!\n\nЧто делать:\n✅ Разумные ставки для fashion\n✅ Понимать seasonal economics\n✅ Quality service > максимальная цена\n✅ Строить long-term fashion relationships\n\n🎯 Fashion brokers помнят reasonable carriers и дают seasonal bonuses!`
                }
            }
        ],

        reject_ultimatum_final: [
            {
                brokerResponse: "I don't respond to ultimatums on fashion textiles. Seasonal launches require cooperation, not demands. I'm calling a more collaborative carrier.",
                outcome: {
                    type: "rejection",
                    reason: "ultimatum_given",
                    feedback: `❌ ОТКЛОНЕН: Ультиматум на fashion load\n\n💔 ПРИЧИНА:\n• Давление на fashion broker\n• Ультиматумы неуместны в fashion industry\n• Нет понимания seasonal cooperation\n\n💡 УРОК: Fashion loads требуют collaboration!\n\nЧто делать:\n✅ Сотрудничество, не давление\n✅ Понимать seasonal constraints\n✅ Fashion success > твои demands\n✅ Гибкость в seasonal situations\n\n🎯 Fashion brokers ценят partners, не dictators!`
                }
            }
        ],

        reject_final_final: [
            {
                brokerResponse: "You rejected my final offer on seasonal fashion load. I can't negotiate further with spring launch deadlines. Calling another carrier now.",
                outcome: {
                    type: "rejection",
                    reason: "rejected_final_offer",
                    feedback: `❌ ОТКЛОНЕН: Отклонил final offer на fashion\n\n💔 ПРИЧИНА:\n• Отказался от последнего предложения\n• Не понял критичность spring season\n• Упустил fashion opportunity\n\n💡 УРОК: Fashion final offers часто справедливы!\n\nЧто делать:\n✅ Серьезно рассматривать fashion final offers\n✅ Понимать seasonal urgency\n✅ Иногда принимать fair rates для relationships\n✅ Fashion brokers помнят flexible carriers\n\n🎯 Один fashion load ведет к seasonal partnerships!`
                }
            }
        ],

        reject_email_final: [
            {
                brokerResponse: "I can't send seasonal rate confirmation without proper email. Fashion loads require documentation for spring launch. I'm calling a more organized carrier.",
                outcome: {
                    type: "rejection",
                    reason: "no_email_provided",
                    feedback: `❌ ОТКЛОНЕН: Нет email для fashion documentation\n\n💔 ПРИЧИНА:\n• Нет proper email address\n• Fashion loads требуют seasonal documentation\n• Непрофессиональная организация\n\n💡 УРОК: Fashion = максимальная documentation!\n\nЧто делать:\n✅ Всегда иметь professional email ready\n✅ Понимать fashion documentation requirements\n✅ Быть организованным с seasonal paperwork\n✅ Fashion brokers ценят organized carriers\n\n🎯 Fashion loads = больше paperwork, но seasonal bonuses!`
                }
            }
        ]
    }
};

// Добавляем в глобальный массив
if (typeof allScenarios !== 'undefined') {
    allScenarios.push(scenario16);
}

console.log('✅ Scenario 16 loaded: Dry Van Textiles (HYBRID: Rules + Seasonal Bonus)');