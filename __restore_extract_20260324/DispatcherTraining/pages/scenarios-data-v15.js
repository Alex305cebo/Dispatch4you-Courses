// DIALOGUE #15 - Flatbed Machinery (RULE-BREAKING: Experienced Veteran Broker)
// Phoenix AZ → New York NY, 2,410 miles
// Posted: $9,640 ($4.00/mile), Target: $10,500-11,200
// Created: March 9, 2026
// STRUCTURE: RULE-BREAKING - veteran broker, names price first, knows everything
// QUALITY: Premium - experienced broker who breaks all rules except dispatcher calls first

console.log('🔵 Loading scenarios-data-v15.js...');

const scenario15 = {
    id: 15,
    route: "Phoenix AZ → New York NY",
    distance: 2410,
    equipment: "Flatbed (48ft)",
    cargo: "Industrial machinery (CNC machines, lathes, milling equipment)",
    weight: "47,000 lbs",
    postedRate: "$9,640 ($4.00/mile)",
    deadline: "Pickup tomorrow 8 AM, Delivery in 4 days",
    brokerStyle: "RULE-BREAKING: Veteran broker - experienced, direct, names price first, knows everything",
    difficulty: "hard",
    initialMessage: "Good morning! This is Big Mike from Heavy Haul Masters.\nI'm calling about your posted flatbed load Phoenix AZ to New York NY with machinery.\nIs this load still available?",

    paths: {
        master: [
            // ШАГ 1: RULE-BREAKING - Broker names price FIRST!
            {
                brokerQuestion: "Good morning! This is Big Mike from Heavy Haul Masters. Yeah, it's available. Listen, I've been doing this 25 years - I'll pay $10,800 for this Phoenix AZ-NY machinery haul. 2,410 miles, 47,000 lbs CNC machines. You interested or not?",
                dispatcherPrompt: "🔥 VETERAN BROKER! Сразу предложил $10,800! Posted $9,640 = +$1,160!",
                suggestions: [
                    { text: "Big Mike! $10,800 sounds great! MC 445566, SteelHaul Express. We specialize in heavy machinery - CNC, lathes, milling equipment. 15 flatbeds, all with tarps and chains. Been hauling industrial equipment for 12 years. When's pickup?", quality: "excellent", path: "master" },
                    { text: "Mike! $10,800 works! MC 445566, SteelHaul. Machinery specialists. When's pickup?", quality: "good", path: "master" },
                    { text: "$10,800 is good. MC 445566, SteelHaul.", quality: "normal", path: "warning" },
                    { text: "$10,800... let me think...", quality: "weak", path: "warning" },
                    { text: "I need $12,000 for machinery!", quality: "aggressive", path: "warning_strict" },
                    { text: "What about $11,500?", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 2: RULE-BREAKING - Broker knows everything, no questions!
            {
                brokerQuestion: "Good! Pickup tomorrow 8 AM Phoenix AZ Industrial, 456 Factory Blvd. Deliver Friday by noon NY Machinery Import, 789 Industrial Ave. I already know you got flatbeds - I checked your SAFER profile. You got tarps, chains, corner protectors for CNC machines?",
                dispatcherPrompt: "🔥 Veteran знает все! Проверил SAFER! Tarps, chains, corner protectors?",
                suggestions: [
                    { text: "Impressive Mike! Yes, full tarp system, grade 70 chains, corner protectors, edge protectors. CNC machines need special care - we pad all sharp edges, secure every axis. Driver Jake has 10 years machinery experience. Ready 8 AM tomorrow!", quality: "excellent", path: "master" },
                    { text: "Yes Mike! Full tarps, chains, corner protectors. Driver experienced with CNC machines. Ready 8 AM!", quality: "good", path: "master" },
                    { text: "Have tarps and chains. Ready tomorrow.", quality: "normal", path: "warning" },
                    { text: "Should have equipment...", quality: "weak", path: "warning" },
                    { text: "Why check my SAFER without asking?", quality: "aggressive", path: "warning_strict" },
                    { text: "Basic tarps and chains.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 3: RULE-BREAKING - Broker already knows insurance!
            {
                brokerQuestion: "Perfect! I see your insurance is current - $500K cargo, $1M liability through Progressive. Expires next March. CNC machines are $2M+ value, but my shipper accepts $500K. Your driver Jake - clean DOT, right?",
                dispatcherPrompt: "🔥 Знает insurance details! Driver Jake DOT статус?",
                suggestions: [
                    { text: "You did your homework Mike! Jake's DOT spotless - last inspection 2 months ago, zero violations. 10 years flatbed, specializes in precision machinery. Understands CNC calibration sensitivity. Safety rating Satisfactory.", quality: "excellent", path: "master" },
                    { text: "Jake's DOT clean. Last inspection 2 months ago, zero violations. Machinery specialist.", quality: "good", path: "master" },
                    { text: "Jake has clean DOT. Experienced driver.", quality: "normal", path: "warning" },
                    { text: "Jake should be clean...", quality: "weak", path: "warning" },
                    { text: "Stop investigating my drivers!", quality: "aggressive", path: "warning_strict" },
                    { text: "Driver has CDL.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 4: RULE-BREAKING - Broker gives detailed instructions without asking!
            {
                brokerQuestion: "Excellent! Here's the deal: CNC machines MUST stay level - no more than 5° tilt. Shipper will provide wooden cribbing. Your driver secures with 4 chains minimum per machine, corner protectors mandatory. Route: I-10 to I-20 to I-95 - avoid low bridges. You copy?",
                dispatcherPrompt: "🔥 Детальные инструкции! Level transport, 4 chains, specific route!",
                suggestions: [
                    { text: "Copy Mike! Level transport critical - Jake has precision machinery training. 4 chains minimum per CNC, corner protectors, wooden cribbing. Route I-10→I-20→I-95, avoid low bridges. Jake knows all bridge heights. Machinery arrives factory-perfect!", quality: "excellent", path: "master" },
                    { text: "Copy! Level transport, 4 chains per machine, corner protectors. Route I-10→I-20→I-95. Jake knows bridges.", quality: "good", path: "master" },
                    { text: "Understood. Level transport, chains, route noted.", quality: "normal", path: "warning" },
                    { text: "I think we can handle that...", quality: "weak", path: "warning" },
                    { text: "Too many restrictions for machinery!", quality: "aggressive", path: "warning_strict" },
                    { text: "Driver will figure it out.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 5: RULE-BREAKING - Broker has backup plan ready!
            {
                brokerQuestion: "Good! Weather forecast shows possible rain in Texas. If it rains, STOP and tarp immediately - CNC machines rust fast. I got backup delivery Saturday if weather delays you. But I prefer Friday delivery. You confident about timing?",
                dispatcherPrompt: "🔥 Weather backup plan! Rain = stop and tarp! Friday preferred!",
                suggestions: [
                    { text: "Absolutely confident Mike! 2,410 miles = 4 days comfortable pace. If rain hits Texas, Jake stops immediately, full tarp coverage. CNC machines stay bone dry. Prefer Friday delivery too - Saturday backup appreciated but won't need it!", quality: "excellent", path: "master" },
                    { text: "Confident about Friday! If rain, immediate tarp coverage. Jake knows weather protocols.", quality: "good", path: "master" },
                    { text: "Friday should work. Will tarp if rain.", quality: "normal", path: "warning" },
                    { text: "Weather is unpredictable...", quality: "weak", path: "warning" },
                    { text: "Can't control weather delays!", quality: "aggressive", path: "warning_strict" },
                    { text: "Driver drives in any weather.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 6: RULE-BREAKING - Broker offers BONUS without negotiation!
            {
                brokerQuestion: "Perfect! You know what? You sound professional. I'll add $300 bonus if delivered Friday before noon. Makes it $11,100 total. Most carriers I call are amateurs - you're different. Deal?",
                dispatcherPrompt: "🔥 BONUS! +$300 for Friday noon = $11,100 total! Deal?",
                suggestions: [
                    { text: "Deal Mike! $11,100 for Friday before noon delivery! You recognize quality carriers - that's why you've been successful 25 years. Jake will deliver Thursday evening, ready for Friday 10 AM unload. Professional to professional!", quality: "excellent", path: "master" },
                    { text: "Deal! $11,100 Friday before noon. Jake will be early, ready for 10 AM unload.", quality: "good", path: "master" },
                    { text: "Deal. $11,100 Friday before noon.", quality: "normal", path: "master" },
                    { text: "Friday before noon is tight...", quality: "weak", path: "warning" },
                    { text: "Make it $400 bonus!", quality: "aggressive", path: "warning_strict" },
                    { text: "I'll take the $10,800 original.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // ШАГ 7: RULE-BREAKING - Broker offers WEEKLY CONTRACT!
            {
                brokerQuestion: "Excellent! You know what? I like your style. I got 8-12 machinery loads monthly Phoenix AZ-NY corridor. $10,000-12,000 each. Want weekly contract? Same professional service, guaranteed loads, priority booking. You interested?",
                dispatcherPrompt: "🔥 WEEKLY CONTRACT! 8-12 loads/month, $10K-12K each! Guaranteed!",
                suggestions: [
                    { text: "Absolutely interested Mike! 8-12 loads monthly = $80K-144K guaranteed revenue! We'll be your dedicated Phoenix AZ-NY machinery specialists. Professional service, on-time delivery, zero damage. Let's build long-term partnership!", quality: "excellent", path: "master" },
                    { text: "Very interested! 8-12 monthly loads, guaranteed revenue. We'll be your go-to machinery carrier.", quality: "good", path: "master" },
                    { text: "Interested in weekly contract.", quality: "normal", path: "warning" },
                    { text: "Weekly might be challenging...", quality: "weak", path: "warning" },
                    { text: "I need higher rates for contract!", quality: "aggressive", path: "reject_rate_final" },
                    { text: "Let's see how this load goes first.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // ШАГ 8: RULE-BREAKING - Broker sends contract immediately!
            {
                brokerQuestion: "Perfect! I'm sending weekly contract to your email right now. Standard terms: 8-12 loads monthly, $10K-12K range, 48-hour booking notice, same quality standards. What's your email? I want this locked in today!",
                dispatcherPrompt: "🔥 Contract отправляется сейчас! Email для weekly deal!",
                suggestions: [
                    { text: "contracts@steelhaul.com! Lock it in Mike! This is exactly what we need - consistent high-value machinery loads with professional broker. 25 years experience shows - you know quality when you see it!", quality: "excellent", path: "master" },
                    { text: "contracts@steelhaul.com! Ready to lock in weekly contract today.", quality: "good", path: "master" },
                    { text: "contracts@steelhaul.com", quality: "normal", path: "master" },
                    { text: "Let me find email address...", quality: "weak", path: "warning" },
                    { text: "Send it anywhere, I'll find it.", quality: "aggressive", path: "reject_email_final" },
                    { text: "No email, just call me.", quality: "fail", path: "reject_email_final" }
                ]
            },
            // ШАГ 9: RULE-BREAKING - Broker gives industry insider info!
            {
                brokerQuestion: "Sent! Listen, insider tip: machinery market is exploding. Manufacturing coming back to US. I got 3 more brokers calling me for carriers like you. Rates going up 15% next quarter. You stick with me, you'll be making $150K+ monthly. Sound good?",
                dispatcherPrompt: "🔥 Insider info! Market exploding, rates +15%, $150K+ monthly potential!",
                suggestions: [
                    { text: "Sounds incredible Mike! Manufacturing renaissance means machinery boom. Your 25 years experience + our professional service = perfect timing. $150K+ monthly changes everything. We're committed to this partnership!", quality: "excellent", path: "master" },
                    { text: "Sounds great! Market timing perfect. Committed to partnership with you.", quality: "good", path: "master" },
                    { text: "Good market information. Appreciate the insight.", quality: "normal", path: "warning" },
                    { text: "Market predictions are uncertain...", quality: "weak", path: "warning" },
                    { text: "I'll believe it when I see it!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Let's focus on this one load.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // ШАГ 10: RULE-BREAKING - Broker gives final instructions + personal number!
            {
                brokerQuestion: "Perfect! Final details: Pickup 8 AM sharp Phoenix AZ Industrial. My personal cell 555-BIGMIKE for any issues. Jake calls me direct if problems. Friday noon delivery, $11,100 + weekly contract. You're now my #1 machinery carrier. Ready to roll?",
                dispatcherPrompt: "🔥 Final details! Personal cell, #1 carrier status! Ready?",
                suggestions: [
                    { text: "Ready to roll Mike! Jake has your personal cell 555-BIGMIKE. Pickup 8 AM sharp, delivery Friday noon, $11,100 confirmed. Weekly contract signed. You just gained the most reliable machinery carrier in the business!", quality: "excellent", path: "master" },
                    { text: "Ready! Jake has your cell. 8 AM pickup, Friday noon delivery, $11,100. Contract signed.", quality: "good", path: "master" },
                    { text: "Ready. All details confirmed.", quality: "normal", path: "master" },
                    { text: "I think we're ready...", quality: "weak", path: "warning" },
                    { text: "Too much pressure for one load!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Just send the rate confirmation.", quality: "fail", path: "reject_email_final" }
                ]
            },
            // ШАГ 11: SUCCESS OUTCOME
            {
                brokerResponse: "Outstanding! You just hit the jackpot! Most carriers can't handle my direct style - you embraced it. Jake's rolling 8 AM, delivering Friday noon, $11,100 in your pocket. Weekly contract starts next week - 8-12 loads monthly guaranteed. You're now Big Mike's #1 machinery specialist. Welcome to the big leagues!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$11,100 (with bonus)",
                    ratePerMile: "$4.61/mile",
                    relationship: "#1 machinery carrier",
                    weeklyLoads: "8-12 machinery loads monthly ($80,000-144,000/month guaranteed)",
                    feedback: `🔥 VETERAN BROKER JACKPOT! Big Mike's #1 carrier!\n\n💰 ФИНАНСЫ:\n• Ставка: $10,800\n• Friday bonus: +$300\n• ИТОГО: $11,100 (posted $9,640 = +$1,460 = 15.1%!)\n• Дизель: -$965 (2,410 miles × 0.125 gal/mi × $3.20)\n• Чистая прибыль: $10,135 (91%)\n\n🎯 УРОК: Veteran brokers = максимальные возможности!\n\nТы:\n✅ Принял direct style veteran broker\n✅ Показал machinery expertise\n✅ Заработал bonus за профессионализм\n✅ Получил weekly contract!\n✅ Заработал +$1,460 больше posted!\n\n⭐ БОНУС: 8-12 loads/month = $960,000-1,728,000/год потенциал!\n\n💡 Veteran brokers ломают правила, но платят больше всех!`
                }
            }
        ],
        // WARNING PATH: 11 шагов с уникальными сообщениями
        warning: [
            // WARNING ШАГ 1: Price Response
            {
                brokerResponse: "⚠️ I offered you $10,800 for 2,410 miles machinery. That's $1,160 over posted. You taking it or not?",
                dispatcherPrompt: "💡 Veteran предложил $10,800! +$1,160 over posted! Принимаешь?",
                suggestions: [
                    { text: "$10,800 works great Mike! MC 445566, SteelHaul Express. Machinery specialists.", quality: "excellent", path: "master" },
                    { text: "$10,800 is good. MC 445566, SteelHaul.", quality: "good", path: "master" },
                    { text: "Yes, $10,800 works.", quality: "normal", path: "master" },
                    { text: "$10,800 seems fair...", quality: "weak", path: "reject_weak_final" },
                    { text: "I need more for machinery!", quality: "aggressive", path: "reject_rate_final" },
                    { text: "Let me think about it.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 2: Equipment Check
            {
                brokerResponse: "⚠️ I asked about tarps, chains, corner protectors for CNC machines. You got proper flatbed equipment or not?",
                dispatcherPrompt: "💡 Veteran хочет подтверждение flatbed equipment для CNC!",
                suggestions: [
                    { text: "Yes Mike! Full tarp system, grade 70 chains, corner protectors. CNC machinery specialists.", quality: "excellent", path: "master" },
                    { text: "Yes, full tarps, chains, corner protectors for machinery.", quality: "good", path: "master" },
                    { text: "Have tarps and chains for flatbed.", quality: "normal", path: "master" },
                    { text: "Should have the equipment...", quality: "weak", path: "reject_weak_final" },
                    { text: "Basic equipment should work!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Driver will bring what's needed.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 3: DOT Status
            {
                brokerResponse: "⚠️ I need confirmation your driver Jake has clean DOT for machinery hauling. Clean or not?",
                dispatcherPrompt: "💡 Veteran хочет подтверждение clean DOT для machinery!",
                suggestions: [
                    { text: "Jake's DOT spotless Mike! Last inspection 2 months ago, zero violations. Machinery specialist.", quality: "excellent", path: "master" },
                    { text: "Jake has clean DOT. Zero violations, machinery experience.", quality: "good", path: "master" },
                    { text: "Jake's DOT is clean.", quality: "normal", path: "master" },
                    { text: "Jake should have clean DOT...", quality: "weak", path: "reject_weak_final" },
                    { text: "DOT inspections are harassment!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Driver has CDL license.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 4: Transport Instructions
            {
                brokerResponse: "⚠️ I gave you specific instructions: level transport, 4 chains per CNC, route I-10→I-20→I-95. You understand or not?",
                dispatcherPrompt: "💡 Veteran дал specific instructions! Понимаешь или нет?",
                suggestions: [
                    { text: "Understood Mike! Level transport critical, 4 chains per CNC, route I-10→I-20→I-95. Jake knows all requirements.", quality: "excellent", path: "master" },
                    { text: "Understood. Level transport, 4 chains, specific route noted.", quality: "good", path: "master" },
                    { text: "Got the instructions.", quality: "normal", path: "master" },
                    { text: "I think we can handle that...", quality: "weak", path: "reject_weak_final" },
                    { text: "Too many restrictions!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Driver will figure it out.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 5: Weather Protocols
            {
                brokerResponse: "⚠️ I told you about rain protocols - stop and tarp immediately if weather hits. You confident about Friday delivery or not?",
                dispatcherPrompt: "💡 Veteran хочет confidence о Friday delivery с weather protocols!",
                suggestions: [
                    { text: "Confident about Friday Mike! If rain hits, Jake stops immediately for full tarp coverage. CNC stays dry.", quality: "excellent", path: "master" },
                    { text: "Confident about Friday. Rain protocols understood.", quality: "good", path: "master" },
                    { text: "Friday should work with weather protocols.", quality: "normal", path: "master" },
                    { text: "Weather is unpredictable...", quality: "weak", path: "reject_timing_final" },
                    { text: "Can't guarantee weather delays!", quality: "aggressive", path: "reject_timing_final" },
                    { text: "Driver drives in any weather.", quality: "fail", path: "reject_timing_final" }
                ]
            },
            // WARNING ШАГ 6: Bonus Offer
            {
                brokerResponse: "⚠️ I offered $300 bonus for Friday noon delivery. Makes it $11,100 total. You want the bonus or not?",
                dispatcherPrompt: "💡 Veteran предлагает $300 bonus! $11,100 total! Хочешь или нет?",
                suggestions: [
                    { text: "Want the bonus Mike! $11,100 Friday before noon. Jake will deliver Thursday evening, ready for Friday 10 AM.", quality: "excellent", path: "master" },
                    { text: "Yes, want the bonus. $11,100 Friday before noon.", quality: "good", path: "master" },
                    { text: "$11,100 Friday noon works.", quality: "normal", path: "master" },
                    { text: "Friday noon is tight...", quality: "weak", path: "reject_timing_final" },
                    { text: "Make it $400 bonus!", quality: "aggressive", path: "reject_rate_final" },
                    { text: "I'll take original $10,800.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 7: Weekly Contract
            {
                brokerResponse: "⚠️ I offered weekly contract - 8-12 machinery loads monthly, $10K-12K each. You interested in guaranteed revenue or not?",
                dispatcherPrompt: "💡 Veteran предлагает weekly contract! 8-12 loads/month! Interested?",
                suggestions: [
                    { text: "Very interested Mike! 8-12 monthly loads = guaranteed revenue. We'll be your machinery specialists.", quality: "excellent", path: "master" },
                    { text: "Interested in weekly contract. Guaranteed loads work for us.", quality: "good", path: "master" },
                    { text: "Weekly contract sounds good.", quality: "normal", path: "master" },
                    { text: "Weekly might be challenging...", quality: "weak", path: "reject_weak_final" },
                    { text: "Need higher contract rates!", quality: "aggressive", path: "reject_rate_final" },
                    { text: "Let's see how this load goes.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 8: Email for Contract
            {
                brokerResponse: "⚠️ I need your email to send weekly contract NOW. What's your email address?",
                dispatcherPrompt: "💡 Veteran хочет email для contract! Давай email!",
                suggestions: [
                    { text: "contracts@steelhaul.com! Send the weekly contract Mike!", quality: "excellent", path: "master" },
                    { text: "contracts@steelhaul.com for the weekly contract.", quality: "good", path: "master" },
                    { text: "contracts@steelhaul.com", quality: "normal", path: "master" },
                    { text: "Let me find email address...", quality: "weak", path: "reject_email_final" },
                    { text: "Send it anywhere, I'll find it.", quality: "aggressive", path: "reject_email_final" },
                    { text: "No email, just call me.", quality: "fail", path: "reject_email_final" }
                ]
            },
            // WARNING ШАГ 9: Market Insight
            {
                brokerResponse: "⚠️ I'm giving you insider market info - machinery rates going up 15%, $150K+ monthly potential. You listening or not?",
                dispatcherPrompt: "💡 Veteran дает insider info! Rates +15%, $150K+ potential!",
                suggestions: [
                    { text: "Listening Mike! Market timing perfect. Your experience + our service = great partnership.", quality: "excellent", path: "master" },
                    { text: "Good market information. Appreciate the insider insight.", quality: "good", path: "master" },
                    { text: "Market info noted.", quality: "normal", path: "master" },
                    { text: "Market predictions are uncertain...", quality: "weak", path: "reject_attitude_final" },
                    { text: "I'll believe it when I see it!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Focus on this one load.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 10: Final Instructions
            {
                brokerResponse: "⚠️ Final details: 8 AM pickup, my cell 555-BIGMIKE, Friday noon delivery, $11,100. You ready to be my #1 carrier or not?",
                dispatcherPrompt: "💡 Veteran дает final details! #1 carrier status! Ready?",
                suggestions: [
                    { text: "Ready Mike! Jake has your cell. 8 AM pickup, Friday noon, $11,100. We're your #1 machinery carrier!", quality: "excellent", path: "master" },
                    { text: "Ready! All details confirmed. We're your #1 carrier.", quality: "good", path: "master" },
                    { text: "Ready. Details confirmed.", quality: "normal", path: "master" },
                    { text: "I think we're ready...", quality: "weak", path: "reject_weak_final" },
                    { text: "Too much pressure!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Just send rate confirmation.", quality: "fail", path: "reject_email_final" }
                ]
            },
            // WARNING ШАГ 11: Final Commitment
            {
                brokerResponse: "⚠️ Last chance! I'm offering you the deal of a lifetime - $11,100 load + weekly contract + insider market position. You in or out?",
                dispatcherPrompt: "💡 Последний шанс! Deal of lifetime! In or out?",
                suggestions: [
                    { text: "IN Mike! Deal of a lifetime accepted! $11,100 + weekly contract + market position. Let's build this partnership!", quality: "excellent", path: "master" },
                    { text: "IN! Accepting the deal. Ready for partnership.", quality: "good", path: "master" },
                    { text: "I'm in. Deal accepted.", quality: "normal", path: "master" },
                    { text: "I think I'm in...", quality: "weak", path: "reject_weak_final" },
                    { text: "Deal needs better terms!", quality: "aggressive", path: "reject_rate_final" },
                    { text: "Let me think about it.", quality: "fail", path: "reject_weak_final" }
                ]
            }
        ],

        // WARNING_STRICT PATH: 1 шаг
        warning_strict: [
            {
                brokerResponse: "Listen! I've been doing this 25 years. I don't have time for games. I offered you $10,800 - that's $1,160 over posted. You want it or I'm calling the next carrier in 30 seconds?",
                dispatcherPrompt: "🚨 УЛЬТИМАТУМ! 30 seconds! $10,800 или next carrier!",
                suggestions: [
                    { text: "I want it Mike! $10,800 accepted! MC 445566, SteelHaul Express. Professional machinery carrier ready to work with veteran broker!", quality: "excellent", path: "master" },
                    { text: "I want it! $10,800 accepted. Ready to work professionally.", quality: "good", path: "master" },
                    { text: "$10,800 accepted.", quality: "normal", path: "warning" },
                    { text: "Okay, I'll take $10,800...", quality: "weak", path: "reject_attitude_final" },
                    { text: "Don't threaten me with 30 seconds!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Call whoever you want.", quality: "fail", path: "reject_attitude_final" }
                ]
            }
        ],

        // REJECT PATHS: 7 путей
        reject_weak_final: [
            {
                brokerResponse: "You're too wishy-washy for my machinery loads. I need decisive carriers who can handle $2M+ equipment. I'm calling someone with confidence. Good luck!",
                outcome: {
                    type: "rejection",
                    reason: "weak_responses",
                    feedback: `❌ ОТКЛОНЕН: Слабые ответы с veteran broker\n\n💔 ПРИЧИНА:\n• Неуверенные ответы ("I think...", "maybe...")\n• Нет решительности с machinery loads\n• Veteran broker не терпит слабость\n\n💡 УРОК: Veteran brokers требуют confidence!\n\nЧто делать:\n✅ Решительные, уверенные ответы\n✅ Показывать machinery expertise\n✅ Принимать good offers быстро\n✅ Veteran brokers ценят decisiveness\n\n🎯 Veteran brokers = biggest opportunities, но только для strong carriers!`
                }
            }
        ],

        reject_attitude_final: [
            {
                brokerResponse: "Your attitude stinks! I've been successful 25 years because I work with professionals, not complainers. Find another broker who tolerates your whining. I'm done!",
                outcome: {
                    type: "rejection",
                    reason: "bad_attitude",
                    feedback: `❌ ОТКЛОНЕН: Плохое отношение к veteran broker\n\n💔 ПРИЧИНА:\n• Агрессивные или жалующиеся ответы\n• Не уважаешь 25-year experience\n• Veteran brokers не терпят attitude\n\n💡 УРОК: Veteran brokers заслуживают respect!\n\nЧто делать:\n✅ Уважать experience и expertise\n✅ Принимать direct communication style\n✅ Никогда не спорить с veterans\n✅ Показывать appreciation за opportunities\n\n🎯 Veteran brokers дают biggest deals, но требуют respect!`
                }
            }
        ],

        reject_timing_final: [
            {
                brokerResponse: "You can't commit to my delivery schedules. Machinery loads are time-sensitive - factories wait for nothing. I'm calling a carrier who understands urgency. Bye!",
                outcome: {
                    type: "rejection",
                    reason: "timing_issues",
                    feedback: `❌ ОТКЛОНЕН: Не можешь commit к timing\n\n💔 ПРИЧИНА:\n• Неуверенность в delivery schedules\n• Не понимаешь machinery urgency\n• Factories не ждут delayed equipment\n\n💡 УРОК: Machinery timing = factory production!\n\nЧто делать:\n✅ Твердые commitments к delivery\n✅ Понимать factory dependencies\n✅ Weather protocols для protection\n✅ Early delivery лучше late delivery\n\n🎯 Machinery loads платят premium за reliability!`
                }
            }
        ],

        reject_rate_final: [
            {
                brokerResponse: "You're too greedy! I offered $1,160 over posted and you want more? I work with reasonable carriers, not rate gougers. Finding someone realistic now!",
                outcome: {
                    type: "rejection",
                    reason: "unrealistic_rate",
                    feedback: `❌ ОТКЛОНЕН: Жадность с veteran broker\n\n💔 ПРИЧИНА:\n• Требуешь больше чем fair offer\n• $1,160 over posted не достаточно\n• Veteran brokers знают fair rates\n\n💡 УРОК: Veteran brokers дают fair deals!\n\nЧто делать:\n✅ Принимать good offers от veterans\n✅ $1,160 over posted = excellent deal\n✅ Long-term relationship > one load greed\n✅ Veteran brokers помнят reasonable carriers\n\n🎯 Veteran relationships = consistent high-paying loads!`
                }
            }
        ],

        reject_ultimatum_final: [
            {
                brokerResponse: "I don't respond to ultimatums! I'm the one with 25 years experience and the loads. You don't dictate terms to Big Mike. I'm calling a carrier who knows their place!",
                outcome: {
                    type: "rejection",
                    reason: "ultimatum_given",
                    feedback: `❌ ОТКЛОНЕН: Ультиматум veteran broker\n\n💔 ПРИЧИНА:\n• Пытался диктовать terms veteran broker\n• Не понимаешь hierarchy в industry\n• Big Mike не терпит ultimatums\n\n💡 УРОК: Veteran brokers = industry leaders!\n\nЧто делать:\n✅ Уважать veteran broker authority\n✅ Они имеют loads и experience\n✅ Работать с их terms\n✅ Earn respect через performance\n\n🎯 Veteran brokers control best opportunities!`
                }
            }
        ],

        reject_final_final: [
            {
                brokerResponse: "You rejected my final offer on premium machinery load. I don't negotiate with carriers who don't recognize good deals. I'm calling someone who appreciates opportunities!",
                outcome: {
                    type: "rejection",
                    reason: "rejected_final_offer",
                    feedback: `❌ ОТКЛОНЕН: Отклонил final offer от veteran\n\n💔 ПРИЧИНА:\n• Не принял final offer от Big Mike\n• Не понял value of veteran relationship\n• Упустил machinery opportunity\n\n💡 УРОК: Veteran final offers обычно fair!\n\nЧто делать:\n✅ Серьезно рассматривать veteran final offers\n✅ Понимать их market knowledge\n✅ Long-term relationship thinking\n✅ Veteran brokers дают best opportunities\n\n🎯 One "no" to veteran = потеря future goldmine!`
                }
            }
        ],

        reject_email_final: [
            {
                brokerResponse: "I can't send contracts without proper email! I run a professional operation with documentation. I'm calling an organized carrier who has their business together!",
                outcome: {
                    type: "rejection",
                    reason: "no_email_provided",
                    feedback: `❌ ОТКЛОНЕН: Нет email для veteran contract\n\n💔 ПРИЧИНА:\n• Нет professional email ready\n• Veteran operations требуют documentation\n• Disorganized carriers не получают contracts\n\n💡 УРОК: Veteran brokers = professional standards!\n\nЧто делать:\n✅ Всегда иметь professional email ready\n✅ Понимать documentation requirements\n✅ Быть organized для opportunities\n✅ Veteran brokers ценят professional carriers\n\n🎯 Professional presentation = veteran broker trust!`
                }
            }
        ]
    }
};

// Добавляем в глобальный массив
if (typeof allScenarios !== 'undefined') {
    allScenarios.push(scenario15);
}

console.log('✅ Scenario 15 loaded: Flatbed Machinery (RULE-BREAKING: Veteran Broker)');