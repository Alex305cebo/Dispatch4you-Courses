// DIALOGUE #14 - Reefer Medical Supplies (HYBRID: Rules + Emergency Twist)
// Dallas TX → Chicago IL, 1,290 miles
// Posted: $5,160 ($4.00/mile), Target: $5,400-5,700 + emergency bonus
// Created: March 9, 2026
// STRUCTURE: ГИБРИД - следует правилам, но груз становится emergency с bonus
// QUALITY: Premium - профессиональный стиль с urgent поворотом

console.log('🔵 Loading scenarios-data-v14.js...');

const scenario14 = {
    id: 14,
    route: "Dallas TX → Chicago IL",
    distance: 1290,
    equipment: "Reefer (53ft)",
    cargo: "Medical supplies (vaccines, insulin, blood products)",
    weight: "25,000 lbs",
    postedRate: "$5,160 ($4.00/mile)",
    deadline: "Pickup tomorrow 7 AM, Delivery in 2 days",
    brokerStyle: "Professional standard broker - follows rules, but load becomes emergency",
    difficulty: "medium",
    initialMessage: "Good morning! This is Dr. Patricia from MedTrans Logistics.\nI'm calling about your posted reefer load Dallas TX to Chicago IL with medical supplies.\nIs this load still available?",

    paths: {
        master: [
            // ШАГ 1: MC, Company, Fleet (ПРАВИЛО)
            {
                brokerQuestion: "Good morning! This is Dr. Patricia from MedTrans Logistics. Yes, it's available. What's your MC number, company name, and how many reefers do you run?",
                dispatcherPrompt: "💎 Стандартный вопрос: MC, компания, reefer fleet!",
                suggestions: [
                    { text: "Good morning Dr. Patricia! MC 445566, MedHaul Transport. We run 18 reefers, all 53ft with pharmaceutical-grade temp control. Specialized in medical supplies for 8 years - vaccines, insulin, blood products. What's the temp requirement?", quality: "excellent", path: "master" },
                    { text: "Morning Dr. Patricia! MC 445566, MedHaul. 18 reefers. Medical specialty. What temp?", quality: "good", path: "master" },
                    { text: "MC 445566, MedHaul Transport.", quality: "normal", path: "warning" },
                    { text: "MC 445566... have reefers...", quality: "weak", path: "warning" },
                    { text: "What's the rate first?", quality: "aggressive", path: "warning_strict" },
                    { text: "Reefer available.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 2: Location, Equipment (ПРАВИЛО)
            {
                brokerQuestion: "Excellent! 1,290 miles Dallas TX to Chicago IL. Medical supplies - vaccines, insulin, blood products, 25,000 lbs. Temp 2-8°C (36-46°F). Need pharmaceutical-grade reefer. Where's your reefer and can you pick up tomorrow 7 AM?",
                dispatcherPrompt: "💎 Местоположение + pickup 7 AM! Pharma-grade temp 2-8°C!",
                suggestions: [
                    { text: "Perfect! Reefer in Dallas TX at medical facility, empty since yesterday. Pharmaceutical-grade temp control: 2-8°C validated, digital monitoring, backup systems. Pre-cooled to 4°C ready for medical supplies. Driver ready 7 AM tomorrow. What's pickup address?", quality: "excellent", path: "master" },
                    { text: "Reefer in Dallas TX at medical facility, empty. Pharma-grade temp control, pre-cooled to 4°C. Driver ready 7 AM tomorrow.", quality: "good", path: "master" },
                    { text: "Reefer in Dallas TX. Ready 7 AM.", quality: "normal", path: "warning" },
                    { text: "Should be in Dallas TX... ready soon...", quality: "weak", path: "warning" },
                    { text: "Tell me rate first!", quality: "aggressive", path: "warning_strict" },
                    { text: "Can't be there until 9 AM.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 3: Experience, DOT (ПРАВИЛО)
            {
                brokerQuestion: "Great! Driver's medical supplies experience? Clean DOT? Medical cargo is highly regulated.",
                dispatcherPrompt: "💎 Опыт с medical supplies + DOT!",
                suggestions: [
                    { text: "Driver Maria, 7 years medical hauling - vaccines, insulin, blood products, clinical trials. FDA-compliant training, understands cold chain critical. Clean DOT - last inspection 3 weeks ago, zero violations. Safety rating Satisfactory.", quality: "excellent", path: "master" },
                    { text: "Driver Maria, 7 years medical experience. FDA-compliant training. Clean DOT, last inspection 3 weeks ago.", quality: "good", path: "master" },
                    { text: "Driver experienced with medical. DOT clean.", quality: "normal", path: "warning" },
                    { text: "Driver has some medical experience...", quality: "weak", path: "warning" },
                    { text: "Driver knows reefer!", quality: "aggressive", path: "warning_strict" },
                    { text: "Driver has CDL.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 4: Insurance (ПРАВИЛО)
            {
                brokerQuestion: "Perfect! Insurance: $300K cargo coverage for medical supplies? Current certificates?",
                dispatcherPrompt: "💎 Insurance $300K для medical supplies!",
                suggestions: [
                    { text: "Yes! $300K cargo coverage through Chubb, specifically for pharmaceuticals. $1M liability. Certificates current, expire October 2027. Covers medical spoilage. I'll email after booking.", quality: "excellent", path: "master" },
                    { text: "Yes, $300K cargo for pharmaceuticals, $1M liability. Current certificates. Will send after booking.", quality: "good", path: "master" },
                    { text: "$300K cargo, $1M liability. Current.", quality: "normal", path: "warning" },
                    { text: "Should have $300K...", quality: "weak", path: "warning" },
                    { text: "Insurance is fine!", quality: "aggressive", path: "warning_strict" },
                    { text: "$200K enough for medical?", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 5: Cold Chain Monitoring (ПРАВИЛО)
            {
                brokerQuestion: "Excellent! Cold chain monitoring: How will you maintain 2-8°C for 1,290 miles? What if temp deviates?",
                dispatcherPrompt: "💎 Cold chain monitoring для medical!",
                suggestions: [
                    { text: "Medical cold chain monitoring: Digital temp recorder logs every 5 minutes, driver checks every hour. If temp goes outside 2-8°C, alarm sounds - driver stops immediately, calls me. I notify you within 5 minutes. Reefer has dual compressors. We've never lost medical cargo to temp failure.", quality: "excellent", path: "master" },
                    { text: "Digital temp recorder every 5 minutes. Driver checks hourly. If alarm, driver stops and calls. I notify you within 5 minutes.", quality: "good", path: "master" },
                    { text: "Temp monitoring system. Will notify if issues.", quality: "normal", path: "warning" },
                    { text: "Driver will monitor temp...", quality: "weak", path: "warning" },
                    { text: "Reefer maintains temp automatically!", quality: "aggressive", path: "warning_strict" },
                    { text: "Driver checks when he remembers.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 6: Commitment (ПРАВИЛО)
            {
                brokerQuestion: "Perfect! Delivery: Appointment Wednesday 6 AM Chicago IL Medical Center. Critical for patient care. Can you commit?",
                dispatcherPrompt: "💎 Wednesday 6 AM commitment! Patient care critical!",
                suggestions: [
                    { text: "Absolutely committed Wednesday 6 AM! Based on 1,290 miles, depart tomorrow 7 AM, arrive Tuesday evening with 10-hour buffer. Patient care is life-critical - will call 12 hours ahead if any delay.", quality: "excellent", path: "master" },
                    { text: "Yes, committed Wednesday 6 AM. Arrive Tuesday evening with buffer. Patient care critical.", quality: "good", path: "master" },
                    { text: "Yes, Wednesday 6 AM works.", quality: "normal", path: "warning" },
                    { text: "We'll try for Wednesday 6 AM...", quality: "weak", path: "warning" },
                    { text: "Traffic unpredictable with medical.", quality: "aggressive", path: "warning_strict" },
                    { text: "Driver gets there when possible.", quality: "fail", path: "warning_strict" }
                ]
            },
            // ШАГ 7: ТОРГ - Rate Question (ПРАВИЛО - диспетчер спрашивает первым!)
            {
                brokerQuestion: "Great! What rate are you looking for on this 1,290 miles Dallas TX-Chicago IL medical load?",
                dispatcherPrompt: "💎 ТОРГ! Posted $5,160 ($4.00/mi) - просите $5,400-5,700!",
                suggestions: [
                    { text: "For 1,290 miles Dallas TX-Chicago IL with medical supplies, I'm looking at $5,600. That's $4.34/mile - fair for reefer, medical expertise, cold chain monitoring, patient-critical timing.", quality: "excellent", path: "master" },
                    { text: "$5,400 for this medical load. $4.19/mile - fair with all services.", quality: "good", path: "master" },
                    { text: "$5,300 for 1,290 miles.", quality: "normal", path: "warning" },
                    { text: "$5,200 for this load?", quality: "weak", path: "warning" },
                    { text: "I need $6,500 minimum! Medical is risky!", quality: "aggressive", path: "reject_rate_final" },
                    { text: "I'll take $5,160 posted.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // ШАГ 8: ПОВОРОТ! Emergency Status! (ГИБРИД - груз становится emergency!)
            {
                brokerQuestion: "That's reasonable. But hold on - I just got urgent call from hospital. They need this medical supply TONIGHT, not tomorrow! Patient emergency situation. If you can pick up TODAY 2 PM and deliver by midnight tonight, I'll add $800 emergency bonus. Total $6,200! Can you do it?",
                dispatcherPrompt: "🚨 EMERGENCY! Pickup TODAY 2 PM, delivery midnight + $800 bonus = $6,200!",
                suggestions: [
                    { text: "Dr. Patricia, absolutely! Patient emergency takes priority! Driver Maria can pick up TODAY 2 PM, drive straight through with co-driver if needed. Deliver by midnight tonight. $6,200 with emergency bonus - we're ready to save lives!", quality: "excellent", path: "master" },
                    { text: "Yes! Patient emergency priority! Can pick up TODAY 2 PM, deliver midnight. $6,200 confirmed!", quality: "good", path: "master" },
                    { text: "Emergency pickup today works. $6,200 confirmed.", quality: "normal", path: "master" },
                    { text: "Today is tight... but for emergency... okay...", quality: "weak", path: "warning" },
                    { text: "Emergency needs $7,000 minimum!", quality: "aggressive", path: "reject_rate_final" },
                    { text: "Can't do today, tomorrow only.", quality: "fail", path: "reject_timing_final" }
                ]
            },
            // ШАG 9: Emergency Logistics (ГИБРИД)
            {
                brokerQuestion: "Excellent! Emergency logistics: Pickup Dallas TX Medical Supply, 789 Hospital Rd, TODAY 2 PM. Deliver Chicago IL Medical Center by midnight. 10 hours for 1,290 miles - tight but doable with team drivers. Can you arrange co-driver?",
                dispatcherPrompt: "💎 Emergency logistics! 10 hours для 1,290 miles! Co-driver?",
                suggestions: [
                    { text: "Absolutely! Maria + co-driver Tom ready. 1,290 miles = 10 hours driving non-stop. Pickup Dallas TX 2 PM, arrive Chicago IL 11 PM - 1 hour early buffer. Both drivers medical-certified. Patient lives depend on this!", quality: "excellent", path: "master" },
                    { text: "Yes! Maria + co-driver ready. 10 hours non-stop. Pickup 2 PM, arrive 11 PM with buffer.", quality: "good", path: "master" },
                    { text: "Can arrange co-driver. Will make midnight.", quality: "normal", path: "warning" },
                    { text: "I think we can get co-driver...", quality: "weak", path: "warning" },
                    { text: "10 hours is impossible!", quality: "aggressive", path: "reject_timing_final" },
                    { text: "Single driver only, maybe 1 AM?", quality: "fail", path: "reject_timing_final" }
                ]
            },
            // ШАГ 10: Email + Final Confirmation (ПРАВИЛО)
            {
                brokerQuestion: "Perfect! Email? I'll send emergency rate con NOW. Confirm: Dallas TX 2 PM TODAY, Chicago IL midnight, $6,200 total with emergency bonus.",
                dispatcherPrompt: "💎 Email! Подтвердите emergency plan!",
                suggestions: [
                    { text: "Perfect! dispatch@medhaul.com. I'll sign in 10 minutes. Confirmed: Dallas TX Medical Supply 2 PM TODAY, Chicago IL Medical Center midnight, $6,200 total. Your patients' medical supplies are in expert hands!", quality: "excellent", path: "master" },
                    { text: "dispatch@medhaul.com. Sign immediately. Dallas TX 2 PM TODAY, Chicago IL midnight, $6,200 confirmed!", quality: "good", path: "master" },
                    { text: "dispatch@medhaul.com. All confirmed.", quality: "normal", path: "warning" },
                    { text: "Let me find email...", quality: "weak", path: "warning" },
                    { text: "Send anywhere. Drivers know.", quality: "aggressive", path: "reject_email_final" },
                    { text: "No email... text message?", quality: "fail", path: "reject_email_final" }
                ]
            },
            // ШАГ 11: SUCCESS OUTCOME
            {
                brokerResponse: "Excellent! Emergency rate con sent to dispatch@medhaul.com. You just became a hero! Most carriers can't handle emergency medical. You saved patient lives today. Adding you to emergency medical carrier list. I have 20-25 medical loads monthly, many are emergencies with bonuses. You're now my go-to medical carrier!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$6,200 (emergency bonus)",
                    ratePerMile: "$4.81/mile",
                    relationship: "emergency medical carrier",
                    weeklyLoads: "20-25 medical loads monthly ($108,000-155,000/month potential)",
                    feedback: `🚨 EMERGENCY HERO! Спас жизни пациентов!\n\n💰 ФИНАНСЫ:\n• Ставка: $5,400\n• Emergency bonus: +$800\n• ИТОГО: $6,200 (posted $5,160 = +$1,040 = 20.2%!)\n• Дизель: -$516 (1,290 miles × 0.125 gal/mi × $3.20)\n• Чистая прибыль: $5,684 (92%)\n\n🎯 УРОК: Emergency medical = hero status + максимальные деньги!\n\nТы:\n✅ Следовал всем правилам профессионально\n✅ Принял emergency challenge без колебаний\n✅ Организовал team drivers для tight timing\n✅ Показал medical экспертизу\n✅ Заработал +$1,040 больше posted!\n\n⭐ БОНУС: 20-25 loads/month = $1,296,000-1,860,000/год потенциал!\n\n💡 Emergency medical loads платят больше всех! Будь готов спасать жизни!`
                }
            }
        ],
        // WARNING PATH: 11 шагов с уникальными сообщениями
        warning: [
            // WARNING ШАГ 1: MC/Company
            {
                brokerResponse: "⚠️ I need your MC number and company name clearly for medical supplies. Can you provide that?",
                dispatcherPrompt: "💡 Брокер хочет MC и компанию для medical! Дайте четко!",
                suggestions: [
                    { text: "I apologize! MC 445566, MedHaul Transport. We specialize in medical supplies.", quality: "excellent", path: "master" },
                    { text: "Sorry. MC 445566, MedHaul Transport.", quality: "good", path: "master" },
                    { text: "MC 445566, MedHaul.", quality: "normal", path: "master" },
                    { text: "I think I said MC 445566...", quality: "weak", path: "reject_weak_final" },
                    { text: "Why so many questions for medical?", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Not sure about MC number.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 2: Location/Equipment
            {
                brokerResponse: "⚠️ I need to know where your reefer is and if you can pick up tomorrow 7 AM for medical supplies. Can you confirm?",
                dispatcherPrompt: "💡 Брокер хочет местоположение reefer и pickup 7 AM для medical!",
                suggestions: [
                    { text: "Reefer in Dallas TX, empty and ready. Can pick up tomorrow 7 AM for medical supplies.", quality: "excellent", path: "master" },
                    { text: "Reefer in Dallas TX. Ready 7 AM tomorrow.", quality: "good", path: "master" },
                    { text: "Dallas TX area. Should be ready 7 AM.", quality: "normal", path: "master" },
                    { text: "I think reefer is in Dallas TX...", quality: "weak", path: "reject_weak_final" },
                    { text: "Medical loads are demanding!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Maybe 8 or 9 AM pickup?", quality: "fail", path: "reject_timing_final" }
                ]
            },
            // WARNING ШАГ 3: Experience/DOT
            {
                brokerResponse: "⚠️ I need driver's medical supplies experience and clean DOT status. Medical cargo is highly regulated. Can you confirm?",
                dispatcherPrompt: "💡 Брокер хочет опыт с medical supplies и DOT статус!",
                suggestions: [
                    { text: "Driver has 7 years medical experience - vaccines, insulin. Clean DOT, last inspection 3 weeks ago.", quality: "excellent", path: "master" },
                    { text: "Driver experienced with medical supplies. Clean DOT.", quality: "good", path: "master" },
                    { text: "Driver has medical experience. DOT is clean.", quality: "normal", path: "master" },
                    { text: "Driver has some medical experience...", quality: "weak", path: "reject_weak_final" },
                    { text: "DOT inspections are harassment!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Driver knows reefer loads.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 4: Insurance
            {
                brokerResponse: "⚠️ I need confirmation of $300K cargo coverage specifically for medical supplies. Do you have current certificates?",
                dispatcherPrompt: "💡 Брокер хочет подтверждение $300K insurance для medical!",
                suggestions: [
                    { text: "$300K cargo coverage for pharmaceuticals through Chubb. Current certificates, will email after booking.", quality: "excellent", path: "master" },
                    { text: "$300K cargo for medical supplies. Current certificates.", quality: "good", path: "master" },
                    { text: "$300K cargo coverage. Certificates current.", quality: "normal", path: "master" },
                    { text: "Should have $300K coverage...", quality: "weak", path: "reject_weak_final" },
                    { text: "Insurance companies overcharge medical!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "$200K should be enough for medical.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 5: Cold Chain Monitoring
            {
                brokerResponse: "⚠️ I need to know how you'll maintain 2-8°C cold chain for medical supplies. What's your monitoring system?",
                dispatcherPrompt: "💡 Брокер хочет детали cold chain monitoring для medical!",
                suggestions: [
                    { text: "Digital temp recorder logs every 5 minutes. Driver checks hourly. If alarm, driver stops and calls immediately.", quality: "excellent", path: "master" },
                    { text: "Temp monitoring system logs continuously. Driver monitors regularly.", quality: "good", path: "master" },
                    { text: "Have temp monitoring. Driver will check.", quality: "normal", path: "master" },
                    { text: "Driver will monitor temperature...", quality: "weak", path: "reject_weak_final" },
                    { text: "Reefer maintains temp automatically!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Driver checks when he remembers.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 6: Commitment
            {
                brokerResponse: "⚠️ I need solid commitment for Wednesday 6 AM delivery at Chicago IL Medical Center. Patient care depends on this. Can you commit?",
                dispatcherPrompt: "💡 Брокер хочет твердое commitment для patient care!",
                suggestions: [
                    { text: "Absolutely committed Wednesday 6 AM! Patient care is critical - will call ahead if any delay.", quality: "excellent", path: "master" },
                    { text: "Yes, committed Wednesday 6 AM. Patient care priority.", quality: "good", path: "master" },
                    { text: "Wednesday 6 AM should work.", quality: "normal", path: "master" },
                    { text: "We'll try for Wednesday 6 AM...", quality: "weak", path: "reject_weak_final" },
                    { text: "Traffic is unpredictable with medical!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Driver gets there when possible.", quality: "fail", path: "reject_timing_final" }
                ]
            },
            // WARNING ШАГ 7: Rate Question
            {
                brokerResponse: "⚠️ I asked for your rate on this medical load. What are you looking for on 1,290 miles Dallas TX-Chicago IL?",
                dispatcherPrompt: "💡 Брокер повторяет вопрос о ставке! Posted $5,160!",
                suggestions: [
                    { text: "$5,600 for medical supplies. $4.34/mile with all specialized services.", quality: "excellent", path: "master" },
                    { text: "$5,400 for this medical load. Fair rate.", quality: "good", path: "master" },
                    { text: "$5,300 for 1,290 miles.", quality: "normal", path: "master" },
                    { text: "$5,200 maybe?", quality: "weak", path: "reject_weak_final" },
                    { text: "Medical loads need $6,500 minimum!", quality: "aggressive", path: "reject_rate_final" },
                    { text: "I'll take posted $5,160.", quality: "fail", path: "reject_weak_final" }
                ]
            },
            // WARNING ШАГ 8: Emergency Response
            {
                brokerResponse: "⚠️ I offered emergency pickup TODAY with $800 bonus for patient emergency. Can you handle this or not?",
                dispatcherPrompt: "💡 Брокер повторяет emergency offer! $6,200 total!",
                suggestions: [
                    { text: "Yes! Patient emergency takes priority! Can pick up TODAY 2 PM, deliver midnight. $6,200 confirmed!", quality: "excellent", path: "master" },
                    { text: "Emergency pickup today works. $6,200 confirmed.", quality: "good", path: "master" },
                    { text: "Today is tight but for emergency... okay.", quality: "normal", path: "master" },
                    { text: "Today is very tight... maybe...", quality: "weak", path: "reject_timing_final" },
                    { text: "Emergency needs $7,000!", quality: "aggressive", path: "reject_rate_final" },
                    { text: "Can't do today, tomorrow only.", quality: "fail", path: "reject_timing_final" }
                ]
            },
            // WARNING ШАГ 9: Emergency Logistics
            {
                brokerResponse: "⚠️ I need confirmation you can arrange co-driver for 10-hour emergency run. Can you or can't you?",
                dispatcherPrompt: "💡 Брокер хочет подтверждение co-driver для emergency!",
                suggestions: [
                    { text: "Yes! Maria + co-driver ready. 10 hours non-stop. Pickup 2 PM, arrive 11 PM with buffer.", quality: "excellent", path: "master" },
                    { text: "Can arrange co-driver. Will make midnight delivery.", quality: "good", path: "master" },
                    { text: "I think we can get co-driver.", quality: "normal", path: "master" },
                    { text: "Co-driver might be available...", quality: "weak", path: "reject_timing_final" },
                    { text: "10 hours is impossible for safety!", quality: "aggressive", path: "reject_timing_final" },
                    { text: "Single driver only, maybe 1 AM?", quality: "fail", path: "reject_timing_final" }
                ]
            },
            // WARNING ШАГ 10: Email Confirmation
            {
                brokerResponse: "⚠️ I need your email NOW to send emergency rate confirmation. What's your email?",
                dispatcherPrompt: "💡 Брокер хочет email для emergency rate con!",
                suggestions: [
                    { text: "dispatch@medhaul.com. I'll sign immediately. Emergency confirmed!", quality: "excellent", path: "master" },
                    { text: "dispatch@medhaul.com. Will sign quickly.", quality: "good", path: "master" },
                    { text: "dispatch@medhaul.com", quality: "normal", path: "master" },
                    { text: "Let me find email address...", quality: "weak", path: "reject_email_final" },
                    { text: "Just send it anywhere, drivers know.", quality: "aggressive", path: "reject_email_final" },
                    { text: "No email... text message works?", quality: "fail", path: "reject_email_final" }
                ]
            },
            // WARNING ШАГ 11: Final Warning
            {
                brokerResponse: "⚠️ This is patient emergency! I need professional carrier who can handle this. Are you that carrier or should I call someone else?",
                dispatcherPrompt: "💡 Последний шанс! Emergency medical load!",
                suggestions: [
                    { text: "Absolutely! We're the professional medical carrier you need. Emergency confirmed, patients come first!", quality: "excellent", path: "master" },
                    { text: "Yes, we can handle this emergency professionally.", quality: "good", path: "master" },
                    { text: "We can do this emergency load.", quality: "normal", path: "master" },
                    { text: "I think we can handle it...", quality: "weak", path: "reject_weak_final" },
                    { text: "Find someone else then!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Maybe call someone else.", quality: "fail", path: "reject_weak_final" }
                ]
            }
        ],

        // WARNING_STRICT PATH: 1 шаг
        warning_strict: [
            {
                brokerResponse: "Listen, this is medical supplies for patient care. I need a professional carrier who takes this seriously. Last chance - are you professional or should I hang up?",
                dispatcherPrompt: "🚨 ПОСЛЕДНИЙ ШАНС! Medical supplies для пациентов!",
                suggestions: [
                    { text: "I apologize Dr. Patricia! We're absolutely professional with medical supplies. MC 445566, MedHaul Transport, 8 years medical experience. Patient care is our priority!", quality: "excellent", path: "master" },
                    { text: "Sorry! We're professional medical carrier. Patient care priority.", quality: "good", path: "master" },
                    { text: "We're professional with medical supplies.", quality: "normal", path: "warning" },
                    { text: "I'm trying to be professional...", quality: "weak", path: "reject_attitude_final" },
                    { text: "I am professional! You're demanding!", quality: "aggressive", path: "reject_attitude_final" },
                    { text: "Whatever, just tell me the rate.", quality: "fail", path: "reject_attitude_final" }
                ]
            }
        ],

        // REJECT PATHS: 7 путей
        reject_weak_final: [
            {
                brokerResponse: "I can't work with uncertain carriers on medical supplies. Patient lives depend on reliability. I'm going with someone more confident. Good luck!",
                outcome: {
                    type: "rejection",
                    reason: "weak_responses",
                    feedback: `❌ ОТКЛОНЕН: Слабые ответы на medical load\n\n💔 ПРИЧИНА:\n• Неуверенные ответы ("I think...", "maybe...")\n• Нет четкости в medical expertise\n• Брокер не доверяет с patient care\n\n💡 УРОК: Medical loads требуют 100% уверенности!\n\nЧто делать:\n✅ Четкие, уверенные ответы\n✅ Подчеркивать medical experience\n✅ Показывать commitment к patient care\n✅ Никаких "maybe" или "I think"\n\n🎯 Medical supplies = жизни пациентов = максимальная ответственность!`
                }
            }
        ],

        reject_attitude_final: [
            {
                brokerResponse: "Your attitude is unprofessional for medical supplies. I need carriers who respect patient care. I'm hanging up and calling someone else.",
                outcome: {
                    type: "rejection",
                    reason: "bad_attitude",
                    feedback: `❌ ОТКЛОНЕН: Плохое отношение к medical load\n\n💔 ПРИЧИНА:\n• Агрессивные или грубые ответы\n• Нет уважения к patient care\n• Непрофессиональное поведение\n\n💡 УРОК: Medical loads = священная ответственность!\n\nЧто делать:\n✅ Максимальное уважение к medical cargo\n✅ Понимание важности patient care\n✅ Профессиональный тон всегда\n✅ Никогда не спорить с medical brokers\n\n🎯 Medical supplies спасают жизни - будь достоин этой миссии!`
                }
            }
        ],

        reject_timing_final: [
            {
                brokerResponse: "You can't commit to emergency medical timing. Patient lives are at stake. I'm calling a carrier who can handle emergencies. Goodbye!",
                outcome: {
                    type: "rejection",
                    reason: "timing_issues",
                    feedback: `❌ ОТКЛОНЕН: Не можешь handle emergency timing\n\n💔 ПРИЧИНА:\n• Не готов к emergency pickup\n• Нет co-driver для tight timing\n• Не понимаешь критичность patient care\n\n💡 УРОК: Emergency medical = hero or zero!\n\nЧто делать:\n✅ Всегда готов к emergency calls\n✅ Иметь backup drivers\n✅ Понимать: patient lives > convenience\n✅ Team drivers для long emergency runs\n\n🎯 Emergency medical платит больше всех, но требует героизма!`
                }
            }
        ],

        reject_rate_final: [
            {
                brokerResponse: "Your rate is unrealistic for medical supplies. I have budget constraints for patient care. Finding a more reasonable carrier. Good luck!",
                outcome: {
                    type: "rejection",
                    reason: "unrealistic_rate",
                    feedback: `❌ ОТКЛОНЕН: Нереальная ставка для medical\n\n💔 ПРИЧИНА:\n• Слишком высокая ставка\n• Не понимаешь medical market\n• Жадность > patient care\n\n💡 УРОК: Medical loads имеют budget limits!\n\nЧто делать:\n✅ Разумные ставки для medical\n✅ Понимать healthcare economics\n✅ Качество service > максимальная цена\n✅ Строить long-term medical relationships\n\n🎯 Medical brokers помнят fair carriers и дают больше loads!`
                }
            }
        ],

        reject_ultimatum_final: [
            {
                brokerResponse: "I don't respond to ultimatums on medical supplies. Patient care requires cooperation, not demands. I'm calling a more collaborative carrier.",
                outcome: {
                    type: "rejection",
                    reason: "ultimatum_given",
                    feedback: `❌ ОТКЛОНЕН: Ультиматум на medical load\n\n💔 ПРИЧИНА:\n• Давление на medical broker\n• Ультиматумы неуместны в healthcare\n• Нет понимания patient care priority\n\n💡 УРОК: Medical loads требуют collaboration!\n\nЧто делать:\n✅ Сотрудничество, не давление\n✅ Понимать healthcare constraints\n✅ Patient care > твои demands\n✅ Гибкость в medical situations\n\n🎯 Medical brokers ценят partners, не dictators!`
                }
            }
        ],

        reject_final_final: [
            {
                brokerResponse: "You rejected my final offer on medical supplies. I can't negotiate further with patient care deadlines. Calling another carrier now.",
                outcome: {
                    type: "rejection",
                    reason: "rejected_final_offer",
                    feedback: `❌ ОТКЛОНЕН: Отклонил final offer на medical\n\n💔 ПРИЧИНА:\n• Отказался от последнего предложения\n• Не понял критичность patient care\n• Упустил medical opportunity\n\n💡 УРОК: Medical final offers часто справедливы!\n\nЧто делать:\n✅ Серьезно рассматривать medical final offers\n✅ Понимать patient care urgency\n✅ Иногда принимать fair rates для relationships\n✅ Medical brokers помнят flexible carriers\n\n🎯 Один medical load ведет к 20+ future loads!`
                }
            }
        ],

        reject_email_final: [
            {
                brokerResponse: "I can't send rate confirmation without proper email. Medical loads require documentation. I'm calling a more organized carrier.",
                outcome: {
                    type: "rejection",
                    reason: "no_email_provided",
                    feedback: `❌ ОТКЛОНЕН: Нет email для medical documentation\n\n💔 ПРИЧИНА:\n• Нет proper email address\n• Medical loads требуют documentation\n• Непрофессиональная организация\n\n💡 УРОК: Medical = максимальная документация!\n\nЧто делать:\n✅ Всегда иметь professional email ready\n✅ Понимать medical documentation requirements\n✅ Быть организованным с paperwork\n✅ Medical brokers ценят organized carriers\n\n🎯 Medical loads = больше paperwork, но больше денег!`
                }
            }
        ]
    }
};

// Добавляем в глобальный массив
if (typeof allScenarios !== 'undefined') {
    allScenarios.push(scenario14);
}

console.log('✅ Scenario 14 loaded: Reefer Medical Supplies (HYBRID: Rules + Emergency)');