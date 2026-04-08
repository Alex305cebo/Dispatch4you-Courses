// DIALOGUE #11 - Flatbed Steel Coils (URGENT + BONUS)
// Pittsburgh PA → Houston TX, 1,320 miles
// Posted: $4,620 ($3.50/mile), Target: $4,900-5,200 + $500 speed bonus
// Created: March 9, 2026
// STRUCTURE: Брокер торопится, предлагает $500 бонус за pickup сегодня
// QUALITY: Premium - urgent timing, bonus opportunity

console.log('🔵 Loading scenarios-data-v11.js...');

const scenario11 = {
    id: 11,
    route: "Pittsburgh PA → Houston TX",
    distance: 1320,
    equipment: "Flatbed (48ft)",
    cargo: "Steel coils (hot-rolled)",
    weight: "44,000 lbs",
    postedRate: "$4,620 ($3.50/mile)",
    deadline: "Pickup TODAY 3 PM (URGENT!), Delivery in 2 days",
    brokerStyle: "Rushed broker - needs pickup TODAY, offers speed bonus",
    difficulty: "medium",
    initialMessage: "Good afternoon! This is Lisa from SteelTrans Logistics.\nI'm calling about your posted flatbed load Pittsburgh PA to Houston TX with steel coils.\nIs this load still available?",

    paths: {
        master: [
            // ШАГ 1: URGENT + BONUS
            {
                brokerQuestion: "Hi! Lisa, SteelTrans. Listen, I'm in a bind - shipper needs pickup TODAY 3 PM, not tomorrow! Steel coils, 44,000 lbs Pittsburgh PA-Houston TX. If you can pick up TODAY, I'll add $500 speed bonus on top of rate. You got flatbed in Pittsburgh PA RIGHT NOW?",
                dispatcherPrompt: "🔥 URGENT! Pickup TODAY 3 PM + $500 bonus! Есть flatbed СЕЙЧАС?",
                suggestions: [
                    { text: "Hi Lisa! Yes, flatbed in Pittsburgh PA at steel mill, empty right now. Driver ready for 3 PM pickup today. MC 990011, SteelHaul Pro. 44,000 lbs steel coils - we specialize in steel. What's the rate with bonus?", quality: "excellent", path: "master" },
                    { text: "Yes! Flatbed in Pittsburgh PA. Driver ready 3 PM today. MC 990011, SteelHaul. What's rate?", quality: "good", path: "master" },
                    { text: "Flatbed in Pittsburgh PA. Ready today.", quality: "normal", path: "warning" },
                    { text: "I think we can make 3 PM...", quality: "weak", path: "warning" },
                    { text: "What's the rate first?", quality: "aggressive", path: "warning_strict" },
                    { text: "Can't do 3 PM, maybe 5 PM?", quality: "fail", path: "reject_timing_final" }
                ]
            },
            // ШАГ 2: RATE + BONUS
            {
                brokerQuestion: "Perfect! Okay, posted $4,620 but for TODAY pickup I can do $4,900 + $500 speed bonus = $5,400 total! That's $4.09/mile! But I need confirmation NOW - you in or out?",
                dispatcherPrompt: "💰 $5,400 total ($4,900 + $500 bonus)! Быстрое решение!",
                suggestions: [
                    { text: "$5,400 is excellent! Deal! We're in! Flatbed will be at pickup 3 PM sharp. Let's book it NOW!", quality: "excellent", path: "master" },
                    { text: "$5,400 works! We're in! Let's book it!", quality: "good", path: "master" },
                    { text: "$5,400 confirmed.", quality: "normal", path: "master" },
                    { text: "Can you do $5,500?", quality: "weak", path: "warning" },
                    { text: "I need $6,000 for urgent!", quality: "aggressive", path: "reject_rate_final" },
                    { text: "Let me think about it...", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // ШАГ 3: STEEL COILS HANDLING
            {
                brokerQuestion: "Great! Steel coils - you know how to secure them? They're 44,000 lbs, can roll and kill someone. What's your securement plan?",
                dispatcherPrompt: "💎 Steel coils securement! Как закрепите?",
                suggestions: [
                    { text: "Absolutely! Steel coils secured with: 4-inch nylon straps rated 5,400 lbs each, minimum 4 straps per coil, coil racks to prevent rolling, edge protectors, chains as backup. Driver certified in steel securement. DOT compliant.", quality: "excellent", path: "master" },
                    { text: "4-inch straps, coil racks, edge protectors, chains backup. Driver certified in steel.", quality: "good", path: "master" },
                    { text: "Straps and chains. Standard securement.", quality: "normal", path: "warning" },
                    { text: "Driver knows how to secure steel...", quality: "weak", path: "warning" },
                    { text: "We've done steel before!", quality: "aggressive", path: "warning_strict" },
                    { text: "Driver will secure when loading.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 4: INSURANCE
            {
                brokerQuestion: "Good! Insurance: $150K cargo for steel, $1M liability. Current certificates?",
                dispatcherPrompt: "💎 Insurance $150K для steel!",
                suggestions: [
                    { text: "$150K cargo through Nationwide, $1M liability. Certificates current, expire June 2027. Covers steel damage. I'll email after booking.", quality: "excellent", path: "master" },
                    { text: "$150K cargo, $1M liability. Current certificates. Will send after booking.", quality: "good", path: "master" },
                    { text: "$150K cargo, $1M liability. Current.", quality: "normal", path: "warning" },
                    { text: "Should have $150K...", quality: "weak", path: "warning" },
                    { text: "Insurance is fine!", quality: "aggressive", path: "warning_strict" },
                    { text: "$100K enough for steel?", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 5: DRIVER EXPERIENCE
            {
                brokerQuestion: "Perfect! Driver's steel experience? This is heavy cargo, needs experienced driver.",
                dispatcherPrompt: "💎 Опыт водителя со steel!",
                suggestions: [
                    { text: "Driver Mike, 9 years steel hauling - coils, beams, plates. Knows weight distribution critical. Clean DOT, last inspection 3 weeks ago. Safety rating Satisfactory.", quality: "excellent", path: "master" },
                    { text: "Driver Mike, 9 years steel experience. Clean DOT, last inspection 3 weeks ago.", quality: "good", path: "master" },
                    { text: "Driver experienced with steel. DOT clean.", quality: "normal", path: "warning" },
                    { text: "Driver has some steel experience...", quality: "weak", path: "warning" },
                    { text: "Driver knows flatbed!", quality: "aggressive", path: "warning_strict" },
                    { text: "Driver has CDL.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 6: PICKUP DETAILS
            {
                brokerQuestion: "Excellent! Pickup: Pittsburgh PA Steel Works, 789 Mill Road, TODAY 3 PM sharp. They close at 4 PM! Can driver be there 3 PM?",
                dispatcherPrompt: "💎 3 PM sharp! They close 4 PM!",
                suggestions: [
                    { text: "Absolutely! Driver Mike is 15 minutes from Pittsburgh PA Steel Works. He'll be there 2:45 PM - 15 minutes early buffer. If any delays, I call you immediately.", quality: "excellent", path: "master" },
                    { text: "Yes! Driver 15 minutes away. Will be there 2:45 PM, 15 minutes early.", quality: "good", path: "master" },
                    { text: "Yes, 3 PM works.", quality: "normal", path: "warning" },
                    { text: "Should make 3 PM...", quality: "weak", path: "warning" },
                    { text: "Driver will be there!", quality: "aggressive", path: "warning_strict" },
                    { text: "Maybe 3:15 PM?", quality: "fail", path: "reject_timing_final" }
                ]
            },
            // ШАГ 7: DELIVERY TIMING
            {
                brokerQuestion: "Great! Delivery: Houston TX Steel Depot, Wednesday 8 AM. 1,320 miles in 2 days - tight but doable. Can you commit?",
                dispatcherPrompt: "💎 Wednesday 8 AM Houston TX! 2 days для 1,320 miles!",
                suggestions: [
                    { text: "Absolutely committed! 1,320 miles = 20 hours driving. Depart today 3 PM, arrive Tuesday evening with 12-hour buffer. Backup route via I-40. Wednesday 8 AM guaranteed!", quality: "excellent", path: "master" },
                    { text: "Yes, committed! Arrive Tuesday evening with buffer. Wednesday 8 AM guaranteed!", quality: "good", path: "master" },
                    { text: "Yes, Wednesday 8 AM works.", quality: "normal", path: "warning" },
                    { text: "We'll try for Wednesday 8 AM...", quality: "weak", path: "warning" },
                    { text: "Traffic unpredictable with steel.", quality: "aggressive", path: "warning_strict" },
                    { text: "Driver gets there when possible.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 8: TARPS
            {
                brokerQuestion: "Perfect! Tarps: steel coils need tarps for weather protection. You have heavy-duty tarps?",
                dispatcherPrompt: "💎 Tarps для steel coils!",
                suggestions: [
                    { text: "Yes! Heavy-duty 18oz vinyl tarps, waterproof, UV-resistant. 2 tarps per load as backup. Bungees and straps to secure tarps. Steel stays dry!", quality: "excellent", path: "master" },
                    { text: "Yes! Heavy-duty 18oz tarps, waterproof. 2 tarps as backup. Steel stays dry!", quality: "good", path: "master" },
                    { text: "Have tarps. Steel covered.", quality: "normal", path: "warning" },
                    { text: "Driver has tarps...", quality: "weak", path: "warning" },
                    { text: "Standard tarps!", quality: "aggressive", path: "warning_strict" },
                    { text: "Do we need tarps for steel?", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 9: EMAIL
            {
                brokerQuestion: "Excellent! Email? I'll send rate con NOW. Remember - 3 PM pickup TODAY, $5,400 total with bonus!",
                dispatcherPrompt: "💎 Email! Подтвердите 3 PM + $5,400!",
                suggestions: [
                    { text: "Perfect! dispatch@steelhaul.com. I'll sign in 15 minutes. Confirmed: Pittsburgh PA Steel Works 3 PM TODAY, Houston TX Wednesday 8 AM, $5,400 total ($4,900 + $500 bonus). Your steel is in expert hands!", quality: "excellent", path: "master" },
                    { text: "dispatch@steelhaul.com. Sign today. 3 PM pickup, $5,400 total confirmed!", quality: "good", path: "master" },
                    { text: "dispatch@steelhaul.com. All confirmed.", quality: "normal", path: "warning" },
                    { text: "Let me find email...", quality: "weak", path: "warning" },
                    { text: "Send anywhere. Driver knows.", quality: "aggressive", path: "reject_email_final" },
                    { text: "No email... text message?", quality: "fail", path: "reject_email_final" }
                ]
            },
            // ШАГ 10: BONUS CONFIRMATION
            {
                brokerQuestion: "Perfect! Just to confirm - you're picking up TODAY 3 PM, so you GET the $500 speed bonus. Total $5,400. If you pick up tomorrow, no bonus - just $4,900. Still committed to TODAY?",
                dispatcherPrompt: "💎 Финальное подтверждение TODAY = $500 bonus!",
                suggestions: [
                    { text: "Absolutely committed to TODAY 3 PM! We want that $500 bonus! Driver Mike is ready, flatbed is ready, we're picking up 3 PM sharp. $5,400 total confirmed!", quality: "excellent", path: "master" },
                    { text: "Yes! Committed to TODAY 3 PM! $500 bonus confirmed. $5,400 total!", quality: "good", path: "master" },
                    { text: "Yes, today 3 PM.", quality: "normal", path: "master" },
                    { text: "We'll try for today...", quality: "weak", path: "warning" },
                    { text: "What if we're 30 minutes late?", quality: "aggressive", path: "reject_timing_final" },
                    { text: "Maybe tomorrow safer?", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // ШАГ 11: SUCCESS OUTCOME
            {
                brokerResponse: "BOOM! Done! Rate con sent to dispatch@steelhaul.com. You saved my day! $5,400 with bonus - you earned it! I have 15-20 steel loads monthly Pittsburgh PA-Houston TX. You're now my go-to steel carrier. Let's work together long-term!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$5,400 ($4,900 + $500 speed bonus)",
                    ratePerMile: "$4.09/mile",
                    relationship: "preferred steel carrier",
                    weeklyLoads: "15-20 steel loads monthly Pittsburgh PA-Houston TX ($73,500-108,000/month potential)",
                    feedback: `🔥 SPEED BONUS EARNED! $500 за срочность!\n\n💰 ФИНАНСЫ:\n• Ставка: $4,900\n• Speed bonus: +$500\n• ИТОГО: $5,400 (posted $4,620 = +$780 = 16.9%!)\n• Дизель: -$528 (1,320 miles × 0.125 gal/mi × $3.20)\n• Чистая прибыль: $4,872 (90%)\n\n🎯 УРОК: Срочность = возможность! Быстрое решение + готовность = бонусы!\n\nТы:\n✅ Был готов к pickup TODAY\n✅ Быстро принял решение\n✅ Знал steel securement\n✅ Подтвердил tight timing\n✅ Заработал $500 bonus!\n\n⭐ БОНУС: 15-20 loads/month = $882,000-1,296,000/год потенциал!\n\n💡 Urgent loads часто платят больше! Будь готов к срочным грузам!`
                }
            }
        ],

        // WARNING PATH - MULTI-STEP (11 шагов)
        warning: [
            // WARNING ШАГ 1
            {
                brokerResponse: "⚠️ You don't sound sure about 3 PM pickup. I need CONFIDENT answer - you got flatbed in Pittsburgh PA ready for 3 PM TODAY or not?",
                dispatcherPrompt: "💡 Брокер хочет уверенность! Flatbed готов 3 PM TODAY?",
                suggestions: [
                    { text: "I apologize Lisa! Yes, absolutely! Flatbed in Pittsburgh PA at steel mill, driver ready 3 PM TODAY sharp. MC 990011, SteelHaul Pro. We're ready!", quality: "excellent", path: "master" },
                    { text: "Sorry! Yes, flatbed ready 3 PM TODAY. MC 990011, SteelHaul!", quality: "good", path: "master" },
                    { text: "Yes, ready today.", quality: "normal", path: "master" },
                    { text: "I think we can make it...", quality: "weak", path: "reject_weak_final" },
                    { text: "Stop pressuring me!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Not sure about today.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 2
            {
                brokerResponse: "⚠️ I offered you $5,400 with bonus! Can you accept it or you need more? Quick answer - I have other carriers!",
                dispatcherPrompt: "💡 Брокер дал $5,400! Примите быстро!",
                suggestions: [
                    { text: "I apologize Lisa! $5,400 is excellent! Deal! We're in! Let's book it NOW!", quality: "excellent", path: "master" },
                    { text: "Sorry! $5,400 works! We're in!", quality: "good", path: "master" },
                    { text: "$5,400 confirmed.", quality: "normal", path: "master" },
                    { text: "Can you do $5,500?", quality: "weak", path: "reject_rate_final" },
                    { text: "I need $6,000!", quality: "aggressive", path: "reject_rate_final" },
                    { text: "Let me think...", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 3
            {
                brokerResponse: "⚠️ You don't sound confident about steel securement. Do you know how to secure 44,000 lbs steel coils or not?",
                dispatcherPrompt: "💡 Брокер сомневается! Знаете steel securement?",
                suggestions: [
                    { text: "I apologize Lisa! Yes! 4-inch straps, coil racks, edge protectors, chains backup. Driver certified in steel securement. DOT compliant!", quality: "excellent", path: "master" },
                    { text: "Sorry! Yes! Straps, coil racks, chains. Driver certified!", quality: "good", path: "master" },
                    { text: "Standard securement.", quality: "normal", path: "master" },
                    { text: "Driver knows how...", quality: "weak", path: "reject_weak_final" },
                    { text: "We've done steel!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Not sure about details.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 4
            {
                brokerResponse: "⚠️ I need clear confirmation on $150K cargo insurance for steel. Do you have it or not?",
                dispatcherPrompt: "💡 Брокер хочет подтверждение insurance!",
                suggestions: [
                    { text: "I apologize Lisa! Yes! $150K cargo through Nationwide, $1M liability. Certificates current, expire June 2027. I'll email after booking!", quality: "excellent", path: "master" },
                    { text: "Sorry! Yes! $150K cargo, $1M liability. Current certificates!", quality: "good", path: "master" },
                    { text: "$150K cargo, $1M liability.", quality: "normal", path: "master" },
                    { text: "Should have $150K...", quality: "weak", path: "reject_weak_final" },
                    { text: "Insurance is fine!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Not sure about coverage.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 5
            {
                brokerResponse: "⚠️ I need to know driver's steel experience clearly. Does he have steel experience or not?",
                dispatcherPrompt: "💡 Брокер хочет четко - есть steel опыт?",
                suggestions: [
                    { text: "I apologize Lisa! Yes! Driver Mike, 9 years steel hauling - coils, beams, plates. Clean DOT, last inspection 3 weeks ago!", quality: "excellent", path: "master" },
                    { text: "Sorry! Yes! Driver Mike, 9 years steel experience. Clean DOT!", quality: "good", path: "master" },
                    { text: "Driver experienced with steel.", quality: "normal", path: "master" },
                    { text: "Driver has some experience...", quality: "weak", path: "reject_weak_final" },
                    { text: "Driver knows flatbed!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Not sure about experience.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 6
            {
                brokerResponse: "⚠️ Can driver be at Pittsburgh PA Steel Works 3 PM TODAY or not? They close 4 PM! Yes or no!",
                dispatcherPrompt: "💡 Брокер хочет четко - 3 PM TODAY да или нет?",
                suggestions: [
                    { text: "I apologize Lisa! YES! Driver 15 minutes away. Will be there 2:45 PM - 15 minutes early!", quality: "excellent", path: "master" },
                    { text: "Sorry! YES! Driver will be there 2:45 PM!", quality: "good", path: "master" },
                    { text: "Yes, 3 PM works.", quality: "normal", path: "master" },
                    { text: "Should make 3 PM...", quality: "weak", path: "reject_timing_final" },
                    { text: "Driver will be there!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Maybe 3:15 PM?", quality: "fail", path: "reject_timing_final" }
                ]
            },
            // WARNING ШАГ 7
            {
                brokerResponse: "⚠️ Can you commit to Wednesday 8 AM Houston TX delivery or not? 2 days for 1,320 miles - yes or no!",
                dispatcherPrompt: "💡 Брокер хочет commitment Wednesday 8 AM!",
                suggestions: [
                    { text: "I apologize Lisa! YES! Absolutely committed! Arrive Tuesday evening with buffer. Wednesday 8 AM guaranteed!", quality: "excellent", path: "master" },
                    { text: "Sorry! YES! Committed Wednesday 8 AM!", quality: "good", path: "master" },
                    { text: "Yes, Wednesday 8 AM.", quality: "normal", path: "master" },
                    { text: "We'll try for Wednesday...", quality: "weak", path: "reject_weak_final" },
                    { text: "Traffic unpredictable!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Not sure about timing.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 8
            {
                brokerResponse: "⚠️ Do you have heavy-duty tarps for steel coils or not? Clear answer!",
                dispatcherPrompt: "💡 Брокер хочет четко - есть tarps?",
                suggestions: [
                    { text: "I apologize Lisa! Yes! Heavy-duty 18oz tarps, waterproof. 2 tarps as backup. Steel stays dry!", quality: "excellent", path: "master" },
                    { text: "Sorry! Yes! Heavy-duty tarps, waterproof. 2 as backup!", quality: "good", path: "master" },
                    { text: "Have tarps.", quality: "normal", path: "master" },
                    { text: "Driver has tarps...", quality: "weak", path: "reject_weak_final" },
                    { text: "Standard tarps!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Not sure about tarps.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 9
            {
                brokerResponse: "⚠️ I need your email RIGHT NOW! What's your dispatch email? Quick!",
                dispatcherPrompt: "💡 Брокер хочет email СЕЙЧАС!",
                suggestions: [
                    { text: "I apologize Lisa! dispatch@steelhaul.com. I'll sign in 15 minutes. 3 PM pickup, $5,400 confirmed!", quality: "excellent", path: "master" },
                    { text: "Sorry! dispatch@steelhaul.com. Sign today!", quality: "good", path: "master" },
                    { text: "dispatch@steelhaul.com.", quality: "normal", path: "master" },
                    { text: "Let me find email...", quality: "weak", path: "reject_email_final" },
                    { text: "Send anywhere!", quality: "aggressive", path: "reject_email_final" },
                    { text: "Not sure about email.", quality: "fail", path: "reject_email_final" }
                ]
            },
            // WARNING ШАГ 10
            {
                brokerResponse: "⚠️ Are you committed to TODAY 3 PM pickup for $500 bonus or not? Yes or no!",
                dispatcherPrompt: "💡 Брокер хочет commitment TODAY = bonus!",
                suggestions: [
                    { text: "I apologize Lisa! YES! Absolutely committed TODAY 3 PM! We want $500 bonus! $5,400 total confirmed!", quality: "excellent", path: "master" },
                    { text: "Sorry! YES! Committed TODAY 3 PM! $500 bonus!", quality: "good", path: "master" },
                    { text: "Yes, today 3 PM.", quality: "normal", path: "master" },
                    { text: "We'll try for today...", quality: "weak", path: "reject_timing_final" },
                    { text: "What if late?", quality: "aggressive", path: "reject_timing_final" },
                    { text: "Maybe tomorrow safer.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 11
            {
                brokerResponse: "Okay, rate con sent. You improved your speed. But you're on watch - one late pickup and no more bonuses.",
                outcome: {
                    type: "success",
                    quality: "good",
                    rate: "$5,400 ($4,900 + $500 bonus)",
                    ratePerMile: "$4.09/mile",
                    relationship: "trial period",
                    weeklyLoads: "First load trial, maybe more if on time",
                    feedback: `✅ ГРУЗ ПОЛУЧЕН! Но медлительность чуть не стоила bonus.\n\n💰 ФИНАНСЫ:\n• Ставка: $4,900\n• Bonus: +$500\n• ИТОГО: $5,400 (+$780)\n• Дизель: -$528\n• Чистая прибыль: $4,872\n\n⚠️ УРОК: Urgent loads требуют быстрых решений! Медлительность = потерянные бонусы!`
                }
            }
        ],

        // WARNING_STRICT PATH
        warning_strict: [
            {
                brokerResponse: "⚠️ STOP! This is URGENT steel load! I don't have time for attitude! You want $500 bonus or should I call next carrier? Last chance!",
                dispatcherPrompt: "🚨 ПОСЛЕДНИЙ ШАНС! $500 bonus или нет?",
                suggestions: [
                    { text: "Lisa, I sincerely apologize! YES! Flatbed in Pittsburgh PA ready 3 PM TODAY. MC 990011, SteelHaul Pro. Driver Mike, 9 years steel experience. $5,400 with bonus - we're ready!", quality: "excellent", path: "master" },
                    { text: "I apologize! Yes! Flatbed ready 3 PM. $5,400 confirmed!", quality: "good", path: "master" },
                    { text: "Sorry. Ready 3 PM.", quality: "normal", path: "master" },
                    { text: "I didn't mean attitude...", quality: "weak", path: "reject_attitude_final" },
                    { text: "You're too demanding!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "This is too stressful.", quality: "fail", path: "reject_weak_final" }
                ]
            }
        ],

        // REJECT PATHS
        reject_weak_final: [
            {
                brokerResponse: "Sorry, I need confident carrier for urgent steel. Can't risk it. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Urgent loads требуют уверенности! Неуверенность = потерянный $500 bonus + упущено $882K-1,296K/год!"
                }
            }
        ],

        reject_attitude_final: [
            {
                brokerResponse: "I don't work with difficult carriers on urgent loads. Good luck!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Грубость с urgent broker = потерянный груз! Упущено $500 bonus!"
                }
            }
        ],

        reject_timing_final: [
            {
                brokerResponse: "3 PM pickup TODAY is non-negotiable for bonus. I need carrier who can meet timing. Thanks!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Не можешь 3 PM TODAY = нет $500 bonus! Упущено $882K-1,296K/год!"
                }
            }
        ],

        reject_rate_final: [
            {
                brokerResponse: "I already offered $5,400 with bonus. That's my max. Thanks!",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Жадность! Брокер уже дал $5,400 с bonus!"
                }
            }
        ],

        reject_email_final: [
            {
                brokerResponse: "I need professional carrier with email for urgent documentation. Thanks!",
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

allScenarios.push(scenario11);
console.log('✅ Scenario 11 loaded: Flatbed Steel Coils (Pittsburgh PA → Houston TX) - URGENT + $500 SPEED BONUS!');
