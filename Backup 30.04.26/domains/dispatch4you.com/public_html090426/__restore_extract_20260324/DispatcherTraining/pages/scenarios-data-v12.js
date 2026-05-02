// DIALOGUE #12 - Reefer Seafood (HYBRID: Rules + Multi-Stop Twist)
// Seattle WA → Boston MA, 3,020 miles
// Posted: $12,080 ($4.00/mile), Target: $12,500-13,000 + multi-stop bonus
// Created: March 9, 2026
// STRUCTURE: ГИБРИД - следует правилам, но груз меняется на multi-stop
// QUALITY: Premium - профессиональный стиль с неожиданным поворотом

console.log('🔵 Loading scenarios-data-v12.js...');

const scenario12 = {
    id: 12,
    route: "Seattle WA → Boston MA (+ Portland OR pickup)",
    distance: 3020,
    equipment: "Reefer (53ft)",
    cargo: "Seafood (salmon, crab, shrimp)",
    weight: "36,000 lbs",
    postedRate: "$12,080 ($4.00/mile)",
    deadline: "Pickup tomorrow 5 AM, Delivery in 5 days",
    brokerStyle: "Professional standard broker - follows rules, but adds multi-stop twist",
    difficulty: "medium",
    initialMessage: "Good morning! This is Jennifer from Pacific Freight Solutions.\nI'm calling about your posted reefer load Seattle WA to Boston MA with seafood.\nIs this load still available?",

    paths: {
        master: [
            // ШАГ 1: MC, Company, Fleet (ПРАВИЛО)
            {
                brokerQuestion: "Good morning! This is Jennifer from Pacific Freight Solutions. Yes, it's available. What's your MC number, company name, and how many reefers do you run?",
                dispatcherPrompt: "💎 Стандартный вопрос: MC, компания, fleet!",
                suggestions: [
                    { text: "Good morning Jennifer! MC 112233, OceanHaul Transport. We run 15 reefers, all 53ft with multi-temp zones. Specialized in seafood for 7 years - salmon, crab, shellfish. What's the temp requirement?", quality: "excellent", path: "master" },
                    { text: "Morning Jennifer! MC 112233, OceanHaul. 15 reefers. Seafood specialty. What temp?", quality: "good", path: "master" },
                    { text: "MC 112233, OceanHaul Transport.", quality: "normal", path: "warning" },
                    { text: "MC 112233... have reefers...", quality: "weak", path: "warning" },
                    { text: "What's the rate first?", quality: "aggressive", path: "warning_strict" },
                    { text: "Reefer available.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 2: Location, Equipment (ПРАВИЛО)
            {
                brokerQuestion: "Excellent! 3,020 miles Seattle WA to Boston MA. Seafood - salmon, crab, shrimp, 36,000 lbs. Temp 28-32°F. Need multi-temp reefer. Where's your reefer and can you pick up tomorrow 5 AM?",
                dispatcherPrompt: "💎 Местоположение + pickup 5 AM! Temp 28-32°F!",
                suggestions: [
                    { text: "Perfect! Reefer in Seattle WA at fish processing plant, empty since yesterday. Multi-temp zones: -10°F to 60°F range. Pre-cooled to 30°F ready for seafood. Driver ready 5 AM tomorrow. Reefer serviced last week. What's pickup address?", quality: "excellent", path: "master" },
                    { text: "Reefer in Seattle WA at fish plant, empty. Multi-temp zones, pre-cooled to 30°F. Driver ready 5 AM tomorrow.", quality: "good", path: "master" },
                    { text: "Reefer in Seattle WA. Ready 5 AM.", quality: "normal", path: "warning" },
                    { text: "Should be in Seattle WA... ready soon...", quality: "weak", path: "warning" },
                    { text: "Tell me rate first!", quality: "aggressive", path: "warning_strict" },
                    { text: "Can't be there until 7 AM.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 3: Experience, DOT (ПРАВИЛО)
            {
                brokerQuestion: "Great! Driver's seafood experience? Clean DOT? Seafood is time-sensitive and temperature-critical.",
                dispatcherPrompt: "💎 Опыт с seafood + DOT!",
                suggestions: [
                    { text: "Driver Tom, 9 years seafood hauling - salmon, crab, shellfish, live lobster. Understands temp critical - checks every 2 hours. Clean DOT - last inspection 2 weeks ago, zero violations. Safety rating Satisfactory. Seafood is his specialty!", quality: "excellent", path: "master" },
                    { text: "Driver Tom, 9 years seafood experience. Checks temp every 2 hours. Clean DOT, last inspection 2 weeks ago.", quality: "good", path: "master" },
                    { text: "Driver experienced with seafood. DOT clean.", quality: "normal", path: "warning" },
                    { text: "Driver has some seafood experience...", quality: "weak", path: "warning" },
                    { text: "Driver knows reefer!", quality: "aggressive", path: "warning_strict" },
                    { text: "Driver has CDL.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 4: Insurance (ПРАВИЛО)
            {
                brokerQuestion: "Perfect! Insurance: $200K cargo coverage for seafood? Current certificates?",
                dispatcherPrompt: "💎 Insurance $200K для seafood!",
                suggestions: [
                    { text: "Yes! $200K cargo coverage through Liberty Mutual, specifically for perishables. $1M liability. Certificates current, expire August 2027. Covers seafood spoilage. I'll email after booking.", quality: "excellent", path: "master" },
                    { text: "Yes, $200K cargo for perishables, $1M liability. Current certificates. Will send after booking.", quality: "good", path: "master" },
                    { text: "$200K cargo, $1M liability. Current.", quality: "normal", path: "warning" },
                    { text: "Should have $200K...", quality: "weak", path: "warning" },
                    { text: "Insurance is fine!", quality: "aggressive", path: "warning_strict" },
                    { text: "$150K enough for seafood?", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 5: Temp Monitoring (ПРАВИЛО)
            {
                brokerQuestion: "Excellent! Temperature monitoring: How will you maintain 28-32°F for 3,020 miles? What if temp goes outside range?",
                dispatcherPrompt: "💎 Temp monitoring для seafood!",
                suggestions: [
                    { text: "Seafood temp monitoring: Digital temp recorder logs every 15 minutes, driver checks display every 2 hours. If temp goes outside 28-32°F, alarm sounds - driver stops immediately, calls me. I notify you within 10 minutes. Reefer has backup compressor. We've never lost seafood to temp failure.", quality: "excellent", path: "master" },
                    { text: "Digital temp recorder every 15 minutes. Driver checks every 2 hours. If alarm, driver stops and calls. I notify you within 10 minutes.", quality: "good", path: "master" },
                    { text: "Temp monitoring system. Will notify if issues.", quality: "normal", path: "warning" },
                    { text: "Driver will monitor temp...", quality: "weak", path: "warning" },
                    { text: "Reefer maintains temp automatically!", quality: "aggressive", path: "warning_strict" },
                    { text: "Driver checks when he remembers.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 6: Commitment (ПРАВИЛО)
            {
                brokerQuestion: "Perfect! Delivery: Appointment Saturday 6 AM Boston MA seafood market. Strict timing for market opening. Can you commit?",
                dispatcherPrompt: "💎 Saturday 6 AM commitment!",
                suggestions: [
                    { text: "Absolutely committed Saturday 6 AM! Based on 3,020 miles, depart tomorrow 5 AM, arrive Friday evening with 12-hour buffer. Backup route via I-90. Market timing critical - will call 24 hours ahead if any delay.", quality: "excellent", path: "master" },
                    { text: "Yes, committed Saturday 6 AM. Arrive Friday evening with buffer. Have backup route.", quality: "good", path: "master" },
                    { text: "Yes, Saturday 6 AM works.", quality: "normal", path: "warning" },
                    { text: "We'll try for Saturday 6 AM...", quality: "weak", path: "warning" },
                    { text: "Traffic unpredictable with seafood.", quality: "aggressive", path: "warning_strict" },
                    { text: "Driver gets there when possible.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 7: ТОРГ - Rate Question (ПРАВИЛО - диспетчер спрашивает первым!)
            {
                brokerQuestion: "Great! What rate are you looking for on this 3,020 miles Seattle WA-Boston MA seafood load?",
                dispatcherPrompt: "💎 ТОРГ! Posted $12,080 ($4.00/mi) - просите $12,500-13,000!",
                suggestions: [
                    { text: "For 3,020 miles Seattle WA-Boston MA with seafood, I'm looking at $12,800. That's $4.24/mile - fair for reefer, seafood expertise, temp monitoring, tight market timing.", quality: "excellent", path: "master" },
                    { text: "$12,500 for this seafood load. $4.14/mile - fair with all services.", quality: "good", path: "master" },
                    { text: "$12,200 for 3,020 miles.", quality: "normal", path: "warning" },
                    { text: "$12,100 for this load?", quality: "weak", path: "warning" },
                    { text: "I need $14,000 minimum! Seafood is risky!", quality: "aggressive", path: "reject_rate_final" },
                    { text: "I'll take $12,080 posted.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // ШАГ 8: ПОВОРОТ! Multi-Stop Предложение (ГИБРИД - неожиданное изменение!)
            {
                brokerQuestion: "That's reasonable. But wait - I just got call from shipper. They want to add second pickup in Portland OR - 175 miles south of Seattle WA. Additional 8,000 lbs crab. Same delivery Boston MA. If you can do multi-stop, I'll pay $13,500 total instead of $12,800. Extra $700 for 175 extra miles. You interested?",
                dispatcherPrompt: "🎁 MULTI-STOP TWIST! +175 miles, +8,000 lbs, +$700! Интересно?",
                suggestions: [
                    { text: "Absolutely interested! Multi-stop works perfectly! Seattle WA pickup 5 AM, then Portland pickup same day, total 44,000 lbs fits in 53ft reefer. $13,500 for 3,195 miles total = $4.22/mile - excellent! Both seafood same temp 28-32°F. Let's do it!", quality: "excellent", path: "master" },
                    { text: "Yes, interested! Multi-stop works. 44,000 lbs total fits. $13,500 is great!", quality: "good", path: "master" },
                    { text: "Multi-stop okay. $13,500 works.", quality: "normal", path: "master" },
                    { text: "Multi-stop is more work... can you do $13,800?", quality: "weak", path: "warning" },
                    { text: "I need $14,500 for multi-stop!", quality: "aggressive", path: "reject_rate_final" },
                    { text: "No, just Seattle WA pickup. Too complicated.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // ШАГ 9: Multi-Stop Logistics (ГИБРИД - новые детали)
            {
                brokerQuestion: "Perfect! Portland pickup details: Portland Fish Co, 456 Harbor St, same day by 2 PM. 8,000 lbs crab, same temp 28-32°F. Can driver do Seattle WA 5 AM, drive 175 miles, Portland 2 PM same day?",
                dispatcherPrompt: "💎 Multi-stop timing! Seattle WA 5 AM → Portland 2 PM same day!",
                suggestions: [
                    { text: "Absolutely! Seattle WA 5 AM pickup, 175 miles to Portland = 3 hours drive. Arrive Portland 9 AM, 5 hours early buffer. Load crab by 2 PM, depart for Boston MA. Total 44,000 lbs, both seafood 28-32°F. Perfect plan!", quality: "excellent", path: "master" },
                    { text: "Yes! Seattle WA 5 AM, Portland by 9 AM - 5 hours early. Load by 2 PM, depart for Boston MA.", quality: "good", path: "master" },
                    { text: "Yes, can do both same day.", quality: "normal", path: "warning" },
                    { text: "Should be able to make it...", quality: "weak", path: "warning" },
                    { text: "That's tight timing!", quality: "aggressive", path: "warning_strict" },
                    { text: "Maybe next day Portland safer?", quality: "fail", path: "reject_timing_final" }
                ]
            },
            // ШАГ 10: Email + Final Confirmation (ПРАВИЛО)
            {
                brokerQuestion: "Excellent! Email? I'll send rate con now. Confirm: Seattle WA 5 AM, Portland 2 PM, Boston MA Saturday 6 AM, $13,500 total.",
                dispatcherPrompt: "💎 Email! Подтвердите multi-stop plan!",
                suggestions: [
                    { text: "Perfect! dispatch@oceanhaul.com. I'll sign in 30 minutes. Confirmed: Seattle WA 5 AM tomorrow, Portland 2 PM same day, Boston MA Saturday 6 AM, $13,500 total. Your seafood is in expert hands!", quality: "excellent", path: "master" },
                    { text: "dispatch@oceanhaul.com. Sign today. Seattle WA 5 AM, Portland 2 PM, Boston MA Saturday 6 AM, $13,500 confirmed!", quality: "good", path: "master" },
                    { text: "dispatch@oceanhaul.com. All confirmed.", quality: "normal", path: "warning" },
                    { text: "Let me find email...", quality: "weak", path: "warning" },
                    { text: "Send anywhere. Driver knows.", quality: "aggressive", path: "reject_email_final" },
                    { text: "No email... text message?", quality: "fail", path: "reject_email_final" }
                ]
            },
            // ШАГ 11: SUCCESS OUTCOME
            {
                brokerResponse: "Excellent! Rate con sent to dispatch@oceanhaul.com. You handled the multi-stop change perfectly! Most carriers panic when I add second pickup. You're flexible and professional. Adding you to preferred seafood carriers. I have 12-15 seafood loads monthly Seattle WA-Boston MA, many are multi-stop. Let's work together long-term!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$13,500 (multi-stop)",
                    ratePerMile: "$4.22/mile",
                    relationship: "preferred seafood carrier",
                    weeklyLoads: "12-15 seafood loads monthly ($162,000-202,500/month potential)",
                    feedback: `🎉 MULTI-STOP BONUS! Гибкость = +$700!\n\n💰 ФИНАНСЫ:\n• Ставка: $13,500 (posted $12,080 = +$1,420 = 11.8%!)\n• Дизель: -$1,278 (3,195 miles × 0.125 gal/mi × $3.20)\n• Чистая прибыль: $12,222 (90%)\n\n🎯 УРОК: Гибкость = больше денег! Multi-stop добавил $700 за 175 miles!\n\nТы:\n✅ Следовал всем правилам профессионально\n✅ Принял multi-stop изменение без паники\n✅ Спланировал timing для обоих pickups\n✅ Показал seafood экспертизу\n✅ Заработал +$1,420 больше posted!\n\n⭐ БОНУС: 12-15 loads/month = $1,944,000-2,430,000/год потенциал!\n\n💡 Брокеры любят гибких carriers! Multi-stop loads платят больше за mile!`
                }
            }
        ],

        // WARNING PATH - MULTI-STEP (11 шагов)
        warning: [
            // WARNING ШАГ 1: MC/Company
            {
                brokerResponse: "⚠️ I need your MC number and company name clearly. Can you provide that?",
                dispatcherPrompt: "💡 Брокер хочет MC и компанию! Дайте четко!",
                suggestions: [
                    { text: "I apologize Jennifer! MC 112233, OceanHaul Transport, 15 reefers specialized in seafood. Reefer in Seattle WA ready 5 AM. Driver 9 years seafood experience. Ready to work professionally!", quality: "excellent", path: "master" },
                    { text: "Sorry. MC 112233, OceanHaul. 15 reefers. Seafood specialty.", quality: "good", path: "master" },
                    { text: "MC 112233, OceanHaul Transport.", quality: "normal", path: "master" },
                    { text: "I think I said MC...", quality: "weak", path: "reject_weak_final" },
                    { text: "Why so many questions?", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Not sure about MC.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 2: Location/Equipment
            {
                brokerResponse: "⚠️ I need to know where your reefer is and if you can pick up tomorrow 5 AM. Can you confirm?",
                dispatcherPrompt: "💡 Брокер хочет местоположение и timing! Подтвердите!",
                suggestions: [
                    { text: "I apologize Jennifer! Reefer in Seattle WA at fish plant, empty. Multi-temp zones, pre-cooled to 30°F. Driver ready 5 AM tomorrow sharp!", quality: "excellent", path: "master" },
                    { text: "Sorry! Reefer in Seattle WA at fish plant. Pre-cooled. Driver ready 5 AM tomorrow.", quality: "good", path: "master" },
                    { text: "Reefer in Seattle WA. Ready 5 AM.", quality: "normal", path: "master" },
                    { text: "I think reefer is ready...", quality: "weak", path: "reject_weak_final" },
                    { text: "Why so specific?", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Not sure about location.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 3: Experience/DOT
            {
                brokerResponse: "⚠️ I need to know driver's seafood experience and DOT status. Can you provide details?",
                dispatcherPrompt: "💡 Брокер хочет опыт и DOT! Дайте детали!",
                suggestions: [
                    { text: "I apologize Jennifer! Driver Tom, 9 years seafood hauling. Checks temp every 2 hours. Clean DOT - last inspection 2 weeks ago, zero violations!", quality: "excellent", path: "master" },
                    { text: "Sorry! Driver Tom, 9 years seafood experience. Clean DOT, last inspection 2 weeks ago.", quality: "good", path: "master" },
                    { text: "Driver experienced with seafood. DOT clean.", quality: "normal", path: "master" },
                    { text: "I think driver experienced...", quality: "weak", path: "reject_weak_final" },
                    { text: "Driver knows his job!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Not sure about experience.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 4: Insurance
            {
                brokerResponse: "⚠️ I need confirmation of $200K cargo coverage for seafood. Can you provide insurance details?",
                dispatcherPrompt: "💡 Брокер хочет insurance $200K! Подтвердите!",
                suggestions: [
                    { text: "I apologize Jennifer! $200K cargo coverage through Liberty Mutual for perishables. $1M liability. Certificates current, expire August 2027. I'll email after booking!", quality: "excellent", path: "master" },
                    { text: "Sorry! $200K cargo for perishables, $1M liability. Current certificates. Will send after booking.", quality: "good", path: "master" },
                    { text: "$200K cargo, $1M liability. Current.", quality: "normal", path: "master" },
                    { text: "I think we have $200K...", quality: "weak", path: "reject_weak_final" },
                    { text: "Insurance is standard!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Not sure about coverage.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 5: Temp Monitoring
            {
                brokerResponse: "⚠️ I need to know how you'll maintain temp 28-32°F. Can you explain your monitoring process?",
                dispatcherPrompt: "💡 Брокер хочет temp monitoring детали! Объясните!",
                suggestions: [
                    { text: "I apologize Jennifer! Digital temp recorder every 15 minutes. Driver checks every 2 hours. If alarm, driver stops and calls. I notify you within 10 minutes!", quality: "excellent", path: "master" },
                    { text: "Sorry! Temp recorder every 15 minutes. Driver checks every 2 hours. If alarm, stops and calls.", quality: "good", path: "master" },
                    { text: "Temp monitoring system. Will notify if issues.", quality: "normal", path: "master" },
                    { text: "Driver will monitor...", quality: "weak", path: "reject_weak_final" },
                    { text: "Reefer maintains temp!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Not sure about monitoring.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 6: Commitment
            {
                brokerResponse: "⚠️ I need commitment for Saturday 6 AM delivery. Market timing is critical. Can you commit?",
                dispatcherPrompt: "💡 Брокер хочет commitment Saturday 6 AM! Подтвердите!",
                suggestions: [
                    { text: "I apologize Jennifer! Absolutely committed Saturday 6 AM! Arrive Friday evening with 12-hour buffer. Market timing critical!", quality: "excellent", path: "master" },
                    { text: "Sorry! Yes, committed Saturday 6 AM. Arrive Friday evening with buffer.", quality: "good", path: "master" },
                    { text: "Yes, Saturday 6 AM works.", quality: "normal", path: "master" },
                    { text: "We'll try for Saturday...", quality: "weak", path: "reject_weak_final" },
                    { text: "Traffic is unpredictable!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Not sure about timing.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 7: Rate
            {
                brokerResponse: "⚠️ I need a realistic rate for this load. What's your actual rate expectation?",
                dispatcherPrompt: "💡 Брокер хочет реальную цену! Назовите адекватную!",
                suggestions: [
                    { text: "I apologize Jennifer! For 3,020 miles with seafood, I'm looking at $12,500. That's $4.14/mile - fair for all services!", quality: "excellent", path: "master" },
                    { text: "Sorry! $12,500 for this load. $4.14/mile - fair.", quality: "good", path: "master" },
                    { text: "$12,200 for 3,020 miles.", quality: "normal", path: "master" },
                    { text: "I think $12,100 is fair...", quality: "weak", path: "reject_weak_final" },
                    { text: "Market rate is higher!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Not sure about rate.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 8: Multi-Stop Interest
            {
                brokerResponse: "⚠️ I'm offering multi-stop with extra $700! Are you interested or not? Quick decision!",
                dispatcherPrompt: "💡 Брокер предлагает multi-stop +$700! Интересно?",
                suggestions: [
                    { text: "I apologize Jennifer! Yes, absolutely interested! Multi-stop works perfectly! $13,500 is excellent!", quality: "excellent", path: "master" },
                    { text: "Sorry! Yes, interested! Multi-stop works. $13,500 is great!", quality: "good", path: "master" },
                    { text: "Multi-stop okay. $13,500 works.", quality: "normal", path: "master" },
                    { text: "Can you do $13,800?", quality: "weak", path: "reject_rate_final" },
                    { text: "I need $14,500!", quality: "aggressive", path: "reject_rate_final" },
                    { text: "Too complicated.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 9: Multi-Stop Timing
            {
                brokerResponse: "⚠️ Can driver do Seattle WA 5 AM, then Portland 2 PM same day? I need clear answer!",
                dispatcherPrompt: "💡 Брокер хочет подтверждение timing! Можете?",
                suggestions: [
                    { text: "I apologize Jennifer! Yes! Seattle WA 5 AM, Portland by 9 AM - 5 hours early. Load by 2 PM. Perfect plan!", quality: "excellent", path: "master" },
                    { text: "Sorry! Yes! Seattle WA 5 AM, Portland by 9 AM. Load by 2 PM!", quality: "good", path: "master" },
                    { text: "Yes, can do both same day.", quality: "normal", path: "master" },
                    { text: "Should be able to...", quality: "weak", path: "reject_timing_final" },
                    { text: "That's tight!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Maybe next day safer.", quality: "fail", path: "reject_timing_final" }
                ]
            },
            // WARNING ШАГ 10: Email
            {
                brokerResponse: "⚠️ I need your email RIGHT NOW! What's your dispatch email?",
                dispatcherPrompt: "💡 Брокер хочет email СЕЙЧАС! Дайте!",
                suggestions: [
                    { text: "I apologize Jennifer! dispatch@oceanhaul.com. I'll sign in 30 minutes. Seattle WA 5 AM, Portland 2 PM, Boston MA Saturday 6 AM, $13,500 confirmed!", quality: "excellent", path: "master" },
                    { text: "Sorry! dispatch@oceanhaul.com. Sign today. All confirmed!", quality: "good", path: "master" },
                    { text: "dispatch@oceanhaul.com. All confirmed.", quality: "normal", path: "master" },
                    { text: "Let me find email...", quality: "weak", path: "reject_email_final" },
                    { text: "Send anywhere!", quality: "aggressive", path: "reject_email_final" },
                    { text: "Not sure about email.", quality: "fail", path: "reject_email_final" }
                ]
            },
            // WARNING ШАГ 11: Final Success (через warning)
            {
                brokerResponse: "Okay, rate con sent. You improved your communication. Let's see how this multi-stop load goes.",
                outcome: {
                    type: "success",
                    quality: "good",
                    rate: "$13,500 (multi-stop)",
                    ratePerMile: "$4.22/mile",
                    relationship: "trial period",
                    weeklyLoads: "First load trial, maybe more if goes well",
                    feedback: `✅ ГРУЗ ПОЛУЧЕН! Но коммуникация была слабой.\n\n💰 ФИНАНСЫ:\n• Ставка: $13,500 (+$1,420)\n• Дизель: -$1,278\n• Чистая прибыль: $12,222\n\n⚠️ УРОК: Слабая коммуникация = нет preferred status! Multi-stop требует уверенности с первого шага!`
                }
            }
        ],

        // WARNING_STRICT PATH
        warning_strict: [
            {
                brokerResponse: "⚠️ STOP! This is professional seafood business! If you want this load, answer professionally NOW. Last chance!",
                dispatcherPrompt: "🚨 ПОСЛЕДНИЙ ШАНС! Seafood не терпит ошибок!",
                suggestions: [
                    { text: "Jennifer, I sincerely apologize! MC 112233, OceanHaul Transport, 15 reefers specialized in seafood. Reefer in Seattle WA ready 5 AM. Driver Tom, 9 years seafood experience. $200K insurance. Ready to work professionally!", quality: "excellent", path: "master" },
                    { text: "I apologize Jennifer! MC 112233, OceanHaul. Reefer ready 5 AM. Driver experienced. Ready!", quality: "good", path: "master" },
                    { text: "Sorry. MC 112233. Ready.", quality: "normal", path: "master" },
                    { text: "I didn't mean to be rude...", quality: "weak", path: "reject_attitude_final" },
                    { text: "You're too demanding!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "This is too stressful.", quality: "fail", path: "reject_weak_final" }
                ]
            }
        ],

        // REJECT PATHS
        reject_weak_final: [
            {
                brokerResponse: "Sorry, I need confident carrier for seafood. Can't risk it. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Seafood требует уверенности! Неуверенность = потерянный multi-stop + упущено $1,944K-2,430K/год!"
                }
            }
        ],

        reject_attitude_final: [
            {
                brokerResponse: "I don't work with unprofessional carriers on seafood. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Грубость с seafood грузом недопустима! Упущен multi-stop!"
                }
            }
        ],

        reject_timing_final: [
            {
                brokerResponse: "5 AM pickup and multi-stop timing critical for seafood. I need carrier who can meet timing. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Seafood timing критичен! Не можешь multi-stop = упущено +$700!"
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
                    feedback: "❌ REJECT: Жадность! Брокер предложил хорошую цену + multi-stop bonus!"
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

allScenarios.push(scenario12);
console.log('✅ Scenario 12 loaded: Reefer Seafood (Seattle WA → Boston MA) - HYBRID: Rules + Multi-Stop Twist!');
