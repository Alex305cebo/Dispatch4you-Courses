// DIALOGUE #6 - Reefer Seafood Fresh (HYBRID: Rules + Auction Urgency)
// Seattle WA → Boston MA, 3,020 miles
// Posted: $12,080 ($4.00/mile), Target: $13,500-15,000 + auction bonus
// Created: March 9, 2026
// STRUCTURE: ГИБРИД - следует правилам, но seafood auction emergency
// QUALITY: Premium - fresh seafood с auction timing critical

console.log('🔵 Loading scenarios-data-v6.js...');

const scenario6 = {
    id: 6,
    route: "Seattle WA → Boston MA",
    distance: 3020,
    equipment: "Reefer (53ft)",
    cargo: "Fresh seafood (king crab, lobster, salmon, halibut)",
    weight: "42,000 lbs",
    postedRate: "$12,080 ($4.00/mile)",
    deadline: "Pickup tomorrow 4 AM, Delivery in 3 days",
    brokerStyle: "Professional standard broker - follows rules, but seafood auction timing critical",
    difficulty: "hard",
    initialMessage: "Good morning! This is Captain Mike from Pacific Seafood Logistics.\nI'm calling about your posted reefer load Seattle WA to Boston MA with fresh seafood.\nIs this load still available?",

    paths: {
        master: [
            // ШАГ 1: MC, Company, Fleet (ПРАВИЛО)
            {
                brokerQuestion: "Good morning! This is Captain Mike from Pacific Seafood Logistics. Yes, it's available. What's your MC number, company name, and how many reefers do you run?",
                dispatcherPrompt: "💎 Стандартный вопрос: MC, компания, reefer fleet!",
                suggestions: [
                    { text: "Good morning Captain Mike! MC 445566, OceanHaul Transport. We run 20 reefers, all 53ft with multi-temp zones. Specialized in fresh seafood for 9 years - king crab, lobster, salmon, halibut. Understand ocean-to-table timing. What's the temp requirement?", quality: "excellent", path: "master" },
                    { text: "Morning Captain Mike! MC 445566, OceanHaul. 20 reefers. Seafood specialty. What temp?", quality: "good", path: "master" },
                    { text: "MC 445566, OceanHaul Transport.", quality: "normal", path: "warning" },
                    { text: "MC 445566... have reefers...", quality: "weak", path: "warning" },
                    { text: "What's the rate first?", quality: "aggressive", path: "warning_strict" },
                    { text: "Reefer available.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 2: Location, Equipment (ПРАВИЛО)
            {
                brokerQuestion: "Excellent! 3,020 miles Seattle WA to Boston MA. Fresh seafood - king crab, lobster, salmon, halibut, 42,000 lbs. Temp 28-32°F. Need multi-temp reefer. Where's your reefer and can you pick up tomorrow 4 AM?",
                dispatcherPrompt: "💎 Местоположение + pickup 4 AM! Multi-temp 28-32°F!",
                suggestions: [
                    { text: "Perfect! Reefer in Seattle WA at fish processing dock, empty since yesterday. Multi-temp zones: 28-32°F for seafood. Pre-cooled to 30°F ready for fresh catch. Driver ready 4 AM tomorrow. Reefer serviced last week. What's pickup address?", quality: "excellent", path: "master" },
                    { text: "Reefer in Seattle WA at fish dock, empty. Multi-temp zones, pre-cooled to 30°F. Driver ready 4 AM tomorrow.", quality: "good", path: "master" },
                    { text: "Reefer in Seattle WA. Ready 4 AM.", quality: "normal", path: "warning" },
                    { text: "Should be in Seattle WA... ready soon...", quality: "weak", path: "warning" },
                    { text: "Tell me rate first!", quality: "aggressive", path: "warning_strict" },
                    { text: "Can't be there until 6 AM.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 3: Experience, DOT (ПРАВИЛО)
            {
                brokerQuestion: "Great! Driver's fresh seafood experience? Clean DOT? Seafood spoils fast - timing is everything.",
                dispatcherPrompt: "💎 Опыт с fresh seafood + DOT! Timing critical!",
                suggestions: [
                    { text: "Driver Carlos, 11 years seafood hauling - king crab, lobster, salmon, halibut. Understands ocean-to-table timing, temp monitoring, ice management. Clean DOT - last inspection 6 weeks ago, zero violations. Safety rating Satisfactory.", quality: "excellent", path: "master" },
                    { text: "Driver Carlos, 11 years seafood experience. Ocean-to-table timing. Clean DOT, last inspection 6 weeks ago.", quality: "good", path: "master" },
                    { text: "Driver experienced with seafood. DOT clean.", quality: "normal", path: "warning" },
                    { text: "Driver has some seafood experience...", quality: "weak", path: "warning" },
                    { text: "Driver knows reefer!", quality: "aggressive", path: "warning_strict" },
                    { text: "Driver has CDL.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 4: Insurance (ПРАВИЛО)
            {
                brokerQuestion: "Perfect! Insurance: $200K cargo coverage for fresh seafood? Current certificates?",
                dispatcherPrompt: "💎 Insurance $200K для fresh seafood!",
                suggestions: [
                    { text: "Yes! $200K cargo coverage through Travelers, specifically for fresh seafood. $1M liability. Certificates current, expire September 2027. Covers seafood spoilage. I'll email after booking.", quality: "excellent", path: "master" },
                    { text: "Yes, $200K cargo for seafood, $1M liability. Current certificates. Will send after booking.", quality: "good", path: "master" },
                    { text: "$200K cargo, $1M liability. Current.", quality: "normal", path: "warning" },
                    { text: "Should have $200K...", quality: "weak", path: "warning" },
                    { text: "Insurance is fine!", quality: "aggressive", path: "warning_strict" },
                    { text: "$150K enough for seafood?", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 5: Seafood Handling (ПРАВИЛО)
            {
                brokerQuestion: "Excellent! Seafood handling: How will you maintain 28-32°F for 3,020 miles? What if temp rises?",
                dispatcherPrompt: "💎 Seafood handling для fresh catch!",
                suggestions: [
                    { text: "Seafood handling protocols: Multi-temp reefer maintains 28-32°F, driver checks temp every hour. If temp rises above 32°F, alarm sounds - driver stops immediately, calls me. I notify you within 5 minutes. We've never lost seafood to temp failure.", quality: "excellent", path: "master" },
                    { text: "Multi-temp reefer 28-32°F. Driver checks hourly. If alarm, driver stops and calls. I notify you within 5 minutes.", quality: "good", path: "master" },
                    { text: "Temp monitoring system. Will notify if issues.", quality: "normal", path: "warning" },
                    { text: "Driver will monitor temp...", quality: "weak", path: "warning" },
                    { text: "Reefer maintains temp automatically!", quality: "aggressive", path: "warning_strict" },
                    { text: "Driver checks when he remembers.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 6: Commitment (ПРАВИЛО)
            {
                brokerQuestion: "Perfect! Delivery: Appointment Thursday 5 AM Boston MA Fish Market. Auction starts 6 AM sharp. Can you commit?",
                dispatcherPrompt: "💎 Thursday 5 AM commitment! Auction 6 AM sharp!",
                suggestions: [
                    { text: "Absolutely committed Thursday 5 AM! Based on 3,020 miles, depart tomorrow 4 AM, arrive Wednesday evening with buffer. Auction timing is critical - will call 12 hours ahead if any delay.", quality: "excellent", path: "master" },
                    { text: "Yes, committed Thursday 5 AM. Arrive Wednesday evening with buffer. Auction timing priority.", quality: "good", path: "master" },
                    { text: "Yes, Thursday 5 AM works.", quality: "normal", path: "warning" },
                    { text: "We'll try for Thursday 5 AM...", quality: "weak", path: "warning" },
                    { text: "Auction timing is unpredictable.", quality: "aggressive", path: "warning_strict" },
                    { text: "Driver gets there when possible.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 7: ТОРГ - Rate Question (ПРАВИЛО - диспетчер спрашивает первым!)
            {
                brokerQuestion: "Great! What rate are you looking for on this 3,020 miles Seattle WA-Boston MA seafood load?",
                dispatcherPrompt: "💎 ТОРГ! Posted $12,080 ($4.00/mi) - просите $13,500-15,000!",
                suggestions: [
                    { text: "For 3,020 miles Seattle WA-Boston MA with fresh seafood, I'm looking at $14,500. That's $4.80/mile - fair for reefer, seafood expertise, temp monitoring, auction timing.", quality: "excellent", path: "master" },
                    { text: "$13,500 for this seafood load. $4.47/mile - fair with all services.", quality: "good", path: "master" },
                    { text: "$13,000 for 3,020 miles.", quality: "normal", path: "warning" },
                    { text: "$12,500 for this load?", quality: "weak", path: "warning" },
                    { text: "I need $16,000 minimum! Seafood is risky!", quality: "aggressive", path: "reject_rate_final" },
                    { text: "I'll take $12,080 posted.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // ШАГ 8: ПОВОРОТ! Auction Premium! (ГИБРИД - auction needs seafood 2 hours early!)
            {
                brokerQuestion: "That's reasonable. But wait - I just got call from Boston MA auction house. They want seafood 2 hours early for premium bidding slot - Thursday 3 AM instead of 5 AM. If you can deliver early, I'll add $1,000 auction bonus. Total $15,000! Premium slot = premium prices. Can you do it?",
                dispatcherPrompt: "🐟 AUCTION BONUS! Thursday 3 AM delivery + $1,000 = $15,000!",
                suggestions: [
                    { text: "Captain Mike, absolutely! Premium auction slot takes priority! Driver Carlos can push schedule, deliver Thursday 3 AM - 2 hours early for premium bidding. Seafood auction timing is everything. $15,000 with auction bonus - we understand market dynamics!", quality: "excellent", path: "master" },
                    { text: "Yes! Premium auction priority! Can deliver Thursday 3 AM. $15,000 confirmed!", quality: "good", path: "master" },
                    { text: "Thursday 3 AM delivery works. $15,000 confirmed.", quality: "normal", path: "master" },
                    { text: "3 AM is early... but for auction... okay...", quality: "weak", path: "warning" },
                    { text: "Auction needs $16,000 minimum!", quality: "aggressive", path: "reject_rate_final" },
                    { text: "Can't do 3 AM, 5 AM only.", quality: "fail", path: "reject_timing_final" }
                ]
            },
            // ШАГ 9: Seafood Market Insight (ГИБРИД)
            {
                brokerQuestion: "Excellent! Seafood market insight: King crab prices are up 40% this season. Premium auction slots get 20% higher bids. I have 12-15 seafood loads weekly Seattle WA-Boston MA, all paying premium for auction timing. Want to be my go-to seafood carrier?",
                dispatcherPrompt: "💎 Seafood market insight! 12-15 loads/week premium! Go-to carrier?",
                suggestions: [
                    { text: "Absolutely Captain Mike! King crab boom = opportunity for seafood carriers. 12-15 loads weekly at premium rates - we'll be your dedicated ocean-to-table specialists. Auction timing, temp control, fresh catch - we understand seafood market!", quality: "excellent", path: "master" },
                    { text: "Very interested! Want to be your go-to seafood carrier. 12-15 weekly loads at premium rates works perfectly.", quality: "good", path: "master" },
                    { text: "Interested in being go-to seafood carrier.", quality: "normal", path: "warning" },
                    { text: "12-15 weekly might be challenging...", quality: "weak", path: "warning" },
                    { text: "Seafood market is too volatile!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Let's see how this load goes first.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // ШАГ 10: Email + Seafood Partnership (ПРАВИЛО)
            {
                brokerQuestion: "Perfect! Email? I'll send auction rate con NOW. Also sending seafood carrier agreement - exclusive rates, priority booking, auction bonuses. Confirm: Seattle WA 4 AM tomorrow, Boston MA 3 AM Thursday, $15,000 total.",
                dispatcherPrompt: "💎 Email! Seafood carrier agreement! Подтвердите auction plan!",
                suggestions: [
                    { text: "Perfect! dispatch@oceanhaul.com. I'll sign both immediately. Confirmed: Seattle WA Fish Dock 4 AM tomorrow, Boston MA Fish Market 3 AM Thursday, $15,000 total. Your fresh seafood is in expert hands!", quality: "excellent", path: "master" },
                    { text: "dispatch@oceanhaul.com. Sign immediately. Seattle WA 4 AM tomorrow, Boston MA 3 AM Thursday, $15,000 confirmed!", quality: "good", path: "master" },
                    { text: "dispatch@oceanhaul.com. All confirmed.", quality: "normal", path: "warning" },
                    { text: "Let me find email...", quality: "weak", path: "warning" },
                    { text: "Send anywhere. Drivers know.", quality: "aggressive", path: "reject_email_final" },
                    { text: "No email... text message?", quality: "fail", path: "reject_email_final" }
                ]
            },
            // ШАГ 11: SUCCESS OUTCOME
            {
                brokerResponse: "Excellent! Auction rate con sent to dispatch@oceanhaul.com. You just became my seafood hero! Most carriers don't understand auction timing. You secured premium bidding slot! Adding you to priority seafood carrier list. Ocean-to-table market pays top dollar for auction reliability - you're now my #1 seafood specialist!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$15,000 (auction bonus)",
                    ratePerMile: "$4.97/mile",
                    relationship: "#1 seafood carrier",
                    weeklyLoads: "12-15 seafood loads weekly ($180,000-225,000/week potential)",
                    feedback: `🐟 SEAFOOD AUCTION HERO! Premium slot secured!\n\n💰 ФИНАНСЫ:\n• Ставка: $13,500\n• Auction bonus: +$1,000\n• ИТОГО: $15,000 (posted $12,080 = +$2,920 = 24.2%!)\n• Дизель: -$1,208 (3,020 miles × 0.125 gal/mi × $3.20)\n• Чистая прибыль: $13,792 (92%)\n\n🎯 УРОК: Seafood auction timing = premium money!\n\nТы:\n✅ Следовал всем правилам профессионально\n✅ Понял auction timing importance\n✅ Принял early delivery challenge\n✅ Показал seafood market expertise\n✅ Заработал +$2,920 больше posted!\n\n⭐ БОНУС: 12-15 loads/week = $9,360,000-11,700,000/год потенциал!\n\n💡 Seafood auction loads платят premium за timing reliability!`
                }
            }
        ],
        // WARNING PATH: 11 шагов с уникальными сообщениями
        warning: [
            {
                brokerResponse: "⚠️ I need your MC number and company name clearly for seafood. Can you provide that?", dispatcherPrompt: "💡 Брокер хочет MC и компанию!", suggestions: [
                    { text: "I apologize! MC 445566, OceanHaul Transport. Seafood specialists.", quality: "excellent", path: "master" },
                    { text: "Sorry. MC 445566, OceanHaul.", quality: "good", path: "master" },
                    { text: "MC 445566, OceanHaul.", quality: "normal", path: "master" },
                    { text: "I think I said MC...", quality: "weak", path: "reject_weak_final" },
                    { text: "Why so many questions?", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Not sure about MC.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            {
                brokerResponse: "⚠️ I need to know where your reefer is and if you can pick up tomorrow 4 AM for seafood. Can you confirm?", dispatcherPrompt: "💡 Брокер хочет местоположение и pickup 4 AM!", suggestions: [
                    { text: "Reefer in Seattle WA, empty and ready. Can pick up tomorrow 4 AM for seafood.", quality: "excellent", path: "master" },
                    { text: "Reefer in Seattle WA. Ready 4 AM tomorrow.", quality: "good", path: "master" },
                    { text: "Seattle WA area. Should be ready 4 AM.", quality: "normal", path: "master" },
                    { text: "I think reefer is in Seattle WA...", quality: "weak", path: "reject_weak_final" },
                    { text: "Seafood loads are demanding!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Maybe 5 or 6 AM pickup?", quality: "fail", path: "reject_timing_final" }
                ]
            },
            {
                brokerResponse: "⚠️ I need driver's seafood experience and clean DOT status. Fresh seafood spoils fast. Can you confirm?", dispatcherPrompt: "💡 Брокер хочет seafood experience и DOT!", suggestions: [
                    { text: "Driver has 11 years seafood experience. Clean DOT, last inspection 6 weeks ago.", quality: "excellent", path: "master" },
                    { text: "Driver experienced with seafood. Clean DOT.", quality: "good", path: "master" },
                    { text: "Driver has seafood experience. DOT is clean.", quality: "normal", path: "master" },
                    { text: "Driver has some seafood experience...", quality: "weak", path: "reject_weak_final" },
                    { text: "DOT inspections are harassment!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Driver knows reefer loads.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            {
                brokerResponse: "⚠️ I need confirmation of $200K cargo coverage for fresh seafood. Do you have current certificates?", dispatcherPrompt: "💡 Брокер хочет $200K insurance!", suggestions: [
                    { text: "$200K cargo coverage for seafood through Travelers. Current certificates, will email after booking.", quality: "excellent", path: "master" },
                    { text: "$200K cargo for seafood. Current certificates.", quality: "good", path: "master" },
                    { text: "$200K cargo coverage. Certificates current.", quality: "normal", path: "master" },
                    { text: "Should have $200K coverage...", quality: "weak", path: "reject_weak_final" },
                    { text: "Insurance companies overcharge seafood!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "$150K should be enough for seafood.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            {
                brokerResponse: "⚠️ I need to know how you'll maintain 28-32°F for seafood. What's your temp monitoring?", dispatcherPrompt: "💡 Брокер хочет temp monitoring details!", suggestions: [
                    { text: "Multi-temp reefer 28-32°F. Driver checks hourly. If alarm, driver stops and calls immediately.", quality: "excellent", path: "master" },
                    { text: "Temp monitoring system. Driver monitors regularly.", quality: "good", path: "master" },
                    { text: "Have temp monitoring. Driver will check.", quality: "normal", path: "master" },
                    { text: "Driver will monitor temperature...", quality: "weak", path: "reject_weak_final" },
                    { text: "Reefer maintains temp automatically!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Driver checks when he remembers.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            {
                brokerResponse: "⚠️ I need solid commitment for Thursday 5 AM delivery at Boston MA Fish Market. Auction depends on this. Can you commit?", dispatcherPrompt: "💡 Брокер хочет commitment для auction!", suggestions: [
                    { text: "Absolutely committed Thursday 5 AM! Auction timing is critical - will call ahead if any delay.", quality: "excellent", path: "master" },
                    { text: "Yes, committed Thursday 5 AM. Auction timing priority.", quality: "good", path: "master" },
                    { text: "Thursday 5 AM should work.", quality: "normal", path: "master" },
                    { text: "We'll try for Thursday 5 AM...", quality: "weak", path: "reject_weak_final" },
                    { text: "Auction timing is unpredictable!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Driver gets there when possible.", quality: "fail", path: "reject_timing_final" }
                ]
            },
            {
                brokerResponse: "⚠️ I asked for your rate on this seafood load. What are you looking for on 3,020 miles Seattle WA-Boston MA?", dispatcherPrompt: "💡 Брокер повторяет вопрос о ставке!", suggestions: [
                    { text: "$14,500 for seafood. $4.80/mile with all specialized services.", quality: "excellent", path: "master" },
                    { text: "$13,500 for this seafood load. Fair rate.", quality: "good", path: "master" },
                    { text: "$13,000 for 3,020 miles.", quality: "normal", path: "master" },
                    { text: "$12,500 maybe?", quality: "weak", path: "reject_weak_final" },
                    { text: "Seafood loads need $16,000 minimum!", quality: "aggressive", path: "reject_rate_final" },
                    { text: "I'll take posted $12,080.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            {
                brokerResponse: "⚠️ I offered auction bonus for Thursday 3 AM delivery with premium slot. Can you handle this or not?", dispatcherPrompt: "💡 Брокер повторяет auction offer!", suggestions: [
                    { text: "Yes! Premium auction priority! Can deliver Thursday 3 AM. $15,000 confirmed!", quality: "excellent", path: "master" },
                    { text: "Thursday 3 AM delivery works. $15,000 confirmed.", quality: "good", path: "master" },
                    { text: "3 AM is early but for auction... okay.", quality: "normal", path: "master" },
                    { text: "3 AM is very early... maybe...", quality: "weak", path: "reject_timing_final" },
                    { text: "Auction needs $16,000!", quality: "aggressive", path: "reject_rate_final" },
                    { text: "Can't do 3 AM, 5 AM only.", quality: "fail", path: "reject_timing_final" }
                ]
            },
            {
                brokerResponse: "⚠️ I offered to make you my go-to seafood carrier with 12-15 weekly loads. Are you interested or not?", dispatcherPrompt: "💡 Брокер хочет подтверждение seafood partnership!", suggestions: [
                    { text: "Very interested! Want to be your go-to seafood carrier. 12-15 weekly loads at premium rates.", quality: "excellent", path: "master" },
                    { text: "Interested in being go-to seafood carrier. Weekly loads work.", quality: "good", path: "master" },
                    { text: "Interested in seafood partnership.", quality: "normal", path: "master" },
                    { text: "12-15 weekly might be challenging...", quality: "weak", path: "reject_weak_final" },
                    { text: "Seafood market is volatile!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Let's see how this goes first.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            {
                brokerResponse: "⚠️ I need your email NOW to send auction rate confirmation. What's your email?", dispatcherPrompt: "💡 Брокер хочет email для auction rate con!", suggestions: [
                    { text: "dispatch@oceanhaul.com. I'll sign immediately. Auction confirmed!", quality: "excellent", path: "master" },
                    { text: "dispatch@oceanhaul.com. Will sign quickly.", quality: "good", path: "master" },
                    { text: "dispatch@oceanhaul.com", quality: "normal", path: "master" },
                    { text: "Let me find email address...", quality: "weak", path: "reject_email_final" },
                    { text: "Just send it anywhere, drivers know.", quality: "aggressive", path: "reject_email_final" },
                    { text: "No email... text message works?", quality: "fail", path: "reject_email_final" }
                ]
            },
            {
                brokerResponse: "⚠️ This is seafood auction! I need professional carrier who understands timing. Are you that carrier or should I call someone else?", dispatcherPrompt: "💡 Последний шанс! Seafood auction!", suggestions: [
                    { text: "Absolutely! We're the professional seafood carrier you need. Auction confirmed, timing comes first!", quality: "excellent", path: "master" },
                    { text: "Yes, we can handle seafood auction professionally.", quality: "good", path: "master" },
                    { text: "We can do this auction load.", quality: "normal", path: "master" },
                    { text: "I think we can handle it...", quality: "weak", path: "reject_weak_final" },
                    { text: "Find someone else then!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Maybe call someone else.", quality: "fail", path: "reject_weak_final" }
                ]
            }
        ],

        warning_strict: [{
            brokerResponse: "Listen, this is fresh seafood for auction. I need a professional carrier who takes timing seriously. Last chance - are you professional or should I hang up?", dispatcherPrompt: "🚨 ПОСЛЕДНИЙ ШАНС! Seafood auction!", suggestions: [
                { text: "I apologize Captain Mike! We're absolutely professional with seafood. MC 445566, OceanHaul Transport, 9 years seafood experience. Auction timing is our priority!", quality: "excellent", path: "master" },
                { text: "Sorry! We're professional seafood carrier. Auction timing priority.", quality: "good", path: "master" },
                { text: "We're professional with seafood.", quality: "normal", path: "warning" },
                { text: "I'm trying to be professional...", quality: "weak", path: "reject_attitude_final" },
                { text: "I am professional! You're demanding!", quality: "aggressive", path: "reject_attitude_final" },
                { text: "Whatever, just tell me the rate.", quality: "fail", path: "reject_attitude_final" }
            ]
        }],

        reject_weak_final: [{ brokerResponse: "I can't work with uncertain carriers on fresh seafood. Auction timing requires confidence. I'm going with someone more decisive. Good luck!", outcome: { type: "rejection", reason: "weak_responses", feedback: `❌ ОТКЛОНЕН: Слабые ответы на seafood load\n\n💔 ПРИЧИНА:\n• Неуверенные ответы\n• Нет четкости в seafood expertise\n• Брокер не доверяет с auction timing\n\n💡 УРОК: Seafood loads требуют 100% уверенности!` } }],
        reject_attitude_final: [{ brokerResponse: "Your attitude is unprofessional for seafood. I need carriers who respect auction timing. I'm hanging up and calling someone else.", outcome: { type: "rejection", reason: "bad_attitude", feedback: `❌ ОТКЛОНЕН: Плохое отношение к seafood load\n\n💔 ПРИЧИНА:\n• Агрессивные ответы\n• Нет уважения к auction timing\n• Непрофессиональное поведение\n\n💡 УРОК: Seafood loads = auction responsibility!` } }],
        reject_timing_final: [{ brokerResponse: "You can't commit to seafood auction timing. Fresh catch waits for no one. I'm calling a carrier who understands urgency. Goodbye!", outcome: { type: "rejection", reason: "timing_issues", feedback: `❌ ОТКЛОНЕН: Не можешь handle auction timing\n\n💔 ПРИЧИНА:\n• Не готов к early delivery\n• Не понимаешь auction urgency\n• Seafood не ждет delays\n\n💡 УРОК: Seafood auction = non-negotiable timing!` } }],
        reject_rate_final: [{ brokerResponse: "Your rate is unrealistic for seafood. I have auction budget constraints. Finding a more reasonable carrier. Good luck!", outcome: { type: "rejection", reason: "unrealistic_rate", feedback: `❌ ОТКЛОНЕН: Нереальная ставка для seafood\n\n💔 ПРИЧИНА:\n• Слишком высокая ставка\n• Не понимаешь seafood market\n• Жадность > auction opportunity\n\n💡 УРОК: Seafood loads имеют market limits!` } }],
        reject_ultimatum_final: [{ brokerResponse: "I don't respond to ultimatums on seafood! Auction timing requires cooperation. I'm calling a more collaborative carrier.", outcome: { type: "rejection", reason: "ultimatum_given", feedback: `❌ ОТКЛОНЕН: Ультиматум на seafood load\n\n💔 ПРИЧИНА:\n• Давление на seafood broker\n• Ультиматумы неуместны в auction\n• Нет понимания cooperation\n\n💡 УРОК: Seafood loads требуют collaboration!` } }],
        reject_final_final: [{ brokerResponse: "You rejected my final offer on seafood auction load. I can't negotiate further with auction deadlines. Calling another carrier now.", outcome: { type: "rejection", reason: "rejected_final_offer", feedback: `❌ ОТКЛОНЕН: Отклонил final offer на seafood\n\n💔 ПРИЧИНА:\n• Отказался от последнего предложения\n• Не понял критичность auction\n• Упустил seafood opportunity\n\n💡 УРОК: Seafood final offers часто справедливы!` } }],
        reject_email_final: [{ brokerResponse: "I can't send auction rate confirmation without proper email. Seafood loads require documentation. I'm calling a more organized carrier.", outcome: { type: "rejection", reason: "no_email_provided", feedback: `❌ ОТКЛОНЕН: Нет email для seafood documentation\n\n💔 ПРИЧИНА:\n• Нет proper email address\n• Seafood loads требуют documentation\n• Непрофессиональная организация\n\n💡 УРОК: Seafood = максимальная documentation!` } }]
    }
};

if (typeof allScenarios !== 'undefined') {
    allScenarios.push(scenario6);
}

console.log('✅ Scenario 6 loaded: Reefer Seafood Fresh (HYBRID: Rules + Auction Urgency)');