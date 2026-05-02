// ДИАЛОГ: СРОЧНАЯ ДОСТАВКА ФАРМАЦЕВТИКИ
// Miami FL → Boston MA, 1,500 miles, Reefer
// Брокер: Строгий профессионал 😠
// Posted rate: $3,200 ($2.13/mile)
// Market rate: $4,500 ($3.00/mile)

const pharmaMiamiBostonDialog = {
    id: 21,
    route: "Miami FL → Boston MA",
    distance: 1500,
    equipment: "Reefer",
    weight: 28000,
    rate: 3200,
    brokerStyle: "Строгий профессионал",
    cargo: "Pharmaceutical products (vaccines)",
    temperature: "2-8°C",
    deadline: "36 hours",

    // ШАГ 0: ПЕРВОЕ СООБЩЕНИЕ ДИСПЕТЧЕРА
    initialMessage: "Good morning!\nThis is Sarah from MedTrans Logistics.\nI'm calling about your Miami to Boston reefer load.\nIs this pharmaceutical shipment still available?",

    paths: {
        // ===== ПУТЬ МАСТЕР (10 шагов) =====
        master: [
            // ШАГ 1
            {
                brokerQuestion: "Yes, still available but this is time-sensitive pharma.\nWhat's your MC and do you have pharmaceutical certification?",
                dispatcherPrompt: "💎 Брокер сразу проверяет квалификацию - покажите опыт с pharma",
                suggestions: [
                    {
                        text: "MC 889234, we specialize in pharmaceutical transport.\nWe're FDA registered and have VAWD accreditation.\nOur reefer units have continuous temperature monitoring with real-time alerts.\nDriver has 6 years experience with pharma loads, never had a temperature deviation.\nWe understand this is vaccines - 2-8°C strict control.",
                        quality: "master",
                        path: "master"
                    },
                    {
                        text: "MC 889234, we have experience with temperature-controlled freight.\nOur reefer equipment is well-maintained with monitoring systems.\nDriver is experienced and reliable with sensitive cargo.\nWe can handle the temperature requirements for this load.",
                        quality: "good",
                        path: "good"
                    },
                    {
                        text: "MC 889234, we have reefer trailer available.\nDriver knows how to maintain temperature.\nWe've done cold freight before.\nEquipment is in good condition.",
                        quality: "normal",
                        path: "normal"
                    }
                ],
                brokerResponse: "Excellent credentials!\nVerified MC 889234 - FDA registration confirmed.\nThis is 28,000 lbs vaccines, must maintain 2-8°C throughout transit.\nPickup tomorrow 6 AM sharp at Miami Pharma Distribution.\nDelivery to Boston Medical Center within 36 hours - no exceptions.\nTemperature logs required every 2 hours.\n$5,000 penalty for late delivery or temp deviation.\nWhat's your rate?"
            },

            // ШАГ 2
            {
                brokerQuestion: "What rate do you need for this critical pharma run?",
                dispatcherPrompt: "💎 Брокер ждет ставку - обоснуйте цену профессионально",
                suggestions: [
                    {
                        text: "For 1,500 miles pharma with 36-hour deadline, I'm at $4,500.\nThat's $3.00/mile which reflects the specialized equipment, continuous monitoring, and expedited timeline.\nIncludes dedicated driver team, real-time GPS tracking, and temperature data logging.\nWe guarantee on-time delivery with full compliance documentation.",
                        quality: "master"
                    },
                    {
                        text: "I'm looking at $4,200 for this load.\nThat's about $2.80/mile for the specialized pharma transport.\nCovers the monitoring requirements and tight deadline.\nWe can provide all necessary documentation and tracking.",
                        quality: "good"
                    },
                    {
                        text: "I need around $4,000 for this run.\nThat should cover the distance and requirements.\nWe can handle the temperature monitoring.\nWhat do you think about that rate?",
                        quality: "normal"
                    }
                ],
                brokerResponse: "$4,500 is above our budget.\nPosted rate was $3,200, I can go to $3,800 max.\nThis is a regular customer with weekly pharma shipments.\nIf you perform well, you'll get priority on future loads.\nCan you work with $3,800?"
            },

            // ШАГ 3
            {
                brokerQuestion: "My best offer is $4,000 final.\nThat's $800 over posted rate.\nYes or no?",
                dispatcherPrompt: "💎 Брокер предлагает компромисс - решайте стратегически",
                suggestions: [
                    {
                        text: "$4,000 works for us on this load.\nWe use TriumphPay factoring with quick setup.\nCan send NOA and insurance certificate immediately.\nOur driver will arrive at Miami Pharma Distribution at 5:45 AM for 6 AM pickup.\nWe'll provide temperature logs every 2 hours via email and text.\nPlease send rate con with all pickup/delivery contacts and special handling instructions.",
                        quality: "master"
                    },
                    {
                        text: "$4,000 is acceptable for this shipment.\nWe work through factoring company for payment.\nDriver will be on time for 6 AM pickup.\nWe'll maintain temperature logs as required.\nPlease send the rate confirmation.",
                        quality: "good"
                    },
                    {
                        text: "OK, $4,000 works.\nWe use factoring for payment.\nDriver will be there on time.\nSend the paperwork.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Perfect!\nWe work with TriumphPay regularly, no issues.\nSending rate con now with detailed instructions.\nPickup: Miami Pharma Distribution, 8900 NW 36th St, Miami FL.\nContact: Dr. Rodriguez 305-555-0188 - call 30 min before arrival.\nDelivery: Boston Medical Center, 1 Boston Medical Center Pl, Boston MA.\nContact: Receiving Manager 617-555-0244.\nTemp must stay 2-8°C - any deviation, call me immediately at 954-555-0177."
            },

            // ШАГ 4
            {
                brokerQuestion: "Do you have the Samsara or similar real-time temperature monitoring?\nShipper requires live access to temp data.",
                dispatcherPrompt: "💎 Брокер проверяет технологию - подтвердите возможности",
                suggestions: [
                    {
                        text: "Yes, we use Samsara TempTrac with real-time monitoring.\nI'll add your email and shipper's email to the monitoring portal.\nYou'll get instant alerts if temperature goes outside 2-8°C range.\nSystem also tracks GPS location, door openings, and generates compliance reports.\nI'll send you the tracking link as soon as trailer is loaded.\nIs there a specific contact at the shipper who needs portal access?",
                        quality: "master"
                    },
                    {
                        text: "Yes, we have Samsara temperature monitoring system.\nCan provide you and shipper with portal access.\nYou'll see real-time temperature data throughout transit.\nWill send tracking link once we're loaded.",
                        quality: "good"
                    },
                    {
                        text: "We have temperature monitoring equipment.\nCan share data with you and shipper.\nYou'll be able to track the temperature.\nWill set that up after loading.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Excellent!\nAdd monitoring access for:\n- Me: james.mitchell@pharmalogistics.com\n- Shipper QA: quality@miamipharma.com\nThey're very strict about monitoring - appreciate your setup.\nThis is why we pay premium rates for professional carriers like you."
            },

            // ШАГ 5
            {
                brokerQuestion: "What's your driver's name and phone?\nShipper requires driver info 24 hours before pickup.",
                dispatcherPrompt: "💎 Брокер запрашивает информацию о водителе - будьте детальны",
                suggestions: [
                    {
                        text: "Driver is Michael Chen, direct cell 786-555-0156.\n15 years CDL-A experience, specialized in pharma transport for last 6 years.\nHe's currently in Fort Lauderdale, about 45 minutes from pickup location.\nMichael will pre-cool the trailer to 4°C tonight and verify all monitoring systems.\nHe'll call Dr. Rodriguez tomorrow at 5:30 AM to confirm arrival time.\nMichael also has your direct number for any issues during transit.",
                        quality: "master"
                    },
                    {
                        text: "Driver is Michael Chen, phone 786-555-0156.\nExperienced with temperature-controlled freight.\nCurrently near Miami, ready for tomorrow's pickup.\nHe'll contact the shipper before arrival.\nHas your contact info for updates.",
                        quality: "good"
                    },
                    {
                        text: "Driver name is Michael Chen, 786-555-0156.\nHe's in the Miami area.\nWill be ready for 6 AM pickup.\nWill call if any issues.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Perfect!\nMichael Chen - got it.\nI'll send his info to Dr. Rodriguez now.\nAppreciate the detail about pre-cooling and verification.\nThat's exactly the level of professionalism we need for pharma.\nYou're definitely going on our preferred carrier list."
            },

            // ШАГ 6
            {
                brokerQuestion: "One more thing - do you have cargo insurance minimum $250K?\nRequired for pharma loads.",
                dispatcherPrompt: "💎 Брокер проверяет страховку - подтвердите покрытие",
                suggestions: [
                    {
                        text: "Yes, we carry $500K cargo insurance through Progressive Commercial.\nPolicy includes temperature deviation coverage for pharma.\nI'll email certificate of insurance with our signed rate con.\nPolicy number PC-8892341, expires 12/2026.\nCan also provide additional insured endorsement if needed.\nAnything else required for compliance?",
                        quality: "master"
                    },
                    {
                        text: "Yes, we have $500K cargo insurance.\nCan send certificate of insurance with rate con.\nPolicy covers temperature-controlled freight.\nLet me know if you need additional documentation.",
                        quality: "good"
                    },
                    {
                        text: "We have cargo insurance coverage.\nCan send certificate if needed.\nMeets the requirements.\nAnything else?",
                        quality: "normal"
                    }
                ],
                brokerResponse: "$500K - excellent, that's above minimum.\nYes, please send COI with signed rate con.\nNo additional insured needed for this one.\nYou're all set - everything is in order.\nLooking forward to a smooth delivery!"
            },

            // ШАГ 7 - ФИНАЛ МАСТЕР
            {
                brokerQuestion: "All documents received and approved.\nAnything else you need from me before pickup?",
                dispatcherPrompt: "💎 Последние детали - закройте профессионально",
                suggestions: [
                    {
                        text: "Everything looks good on our end.\nMichael will arrive at 5:45 AM, call Dr. Rodriguez at 5:30 AM.\nWe'll send you:\n- Loaded confirmation with seal number by 8:30 AM\n- Temperature logs every 2 hours via email\n- ETA updates at 500 miles and 200 miles from delivery\n- POD within 1 hour of delivery\nYour direct line 954-555-0177 is programmed in Michael's phone.\nThanks for the smooth booking - excited to start this partnership!",
                        quality: "master"
                    },
                    {
                        text: "We're all set, thank you.\nDriver will be on time and follow all procedures.\nWe'll keep you updated throughout transit.\nLooking forward to working together.",
                        quality: "good"
                    },
                    {
                        text: "All good, we're ready.\nWill update you as we go.\nThanks for the load.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Outstanding!\nThis is exactly the level of communication we need.\nI can already tell this will go smoothly.\nYou've earned a spot on our preferred list - expect calls for our weekly Miami-Boston pharma runs.\nUsually 2-3 loads per week at similar rates.\nGood luck with the delivery!",
                isSuccess: true,
                outcome: "🏆 МАСТЕР-КЛАСС!\n$4,000 (выше posted на $800) + preferred carrier status + 2-3 pharma loads/week"
            }
        ],

        // ===== ПУТЬ ХОРОШИЙ (5 шагов) =====
        good: [
            // ШАГ 1
            {
                brokerQuestion: "Yes, available.\nMC and pharma certification?",
                dispatcherPrompt: "✅ Брокер проверяет квалификацию",
                suggestions: [
                    {
                        text: "MC 889234, we have experience with temperature-controlled pharma.\nEquipment has monitoring systems and driver is experienced.\nWe can maintain 2-8°C requirements.\nReady for tomorrow's pickup.",
                        quality: "good"
                    },
                    {
                        text: "MC 889234, we do reefer loads regularly.\nHave temperature monitoring.\nDriver is reliable.\nCan handle the requirements.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "OK, MC verified.\n28,000 lbs vaccines, 2-8°C strict.\nPickup tomorrow 6 AM Miami, delivery Boston within 36 hours.\nTemp logs every 2 hours required.\n$5K penalty for issues.\nWhat's your rate?"
            },

            // ШАГ 2
            {
                brokerQuestion: "What rate for this pharma load?",
                dispatcherPrompt: "✅ Брокер ждет ставку",
                suggestions: [
                    {
                        text: "For 1,500 miles pharma I'm at $4,200.\nThat's about $2.80/mile for specialized transport.\nCovers monitoring and tight timeline.\nCan provide tracking and documentation.",
                        quality: "good"
                    },
                    {
                        text: "Looking at around $4,000.\nShould cover the requirements.\nWe can handle the monitoring.\nDoes that work?",
                        quality: "normal"
                    }
                ],
                brokerResponse: "$4,200 is high.\nPosted was $3,200.\nI can do $3,700 max.\nThis customer has weekly loads.\nCan you work with $3,700?"
            },

            // ШАГ 3
            {
                brokerQuestion: "$3,700 final offer.\nYes or no?",
                dispatcherPrompt: "✅ Брокер предлагает компромисс",
                suggestions: [
                    {
                        text: "$3,700 works for us.\nWe use factoring for payment.\nDriver will be on time for pickup.\nWe'll maintain temp logs as required.\nSend the rate con.",
                        quality: "good"
                    },
                    {
                        text: "OK, $3,700.\nWe use factoring.\nDriver ready.\nSend paperwork.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Good.\nSending rate con with pickup/delivery details.\nNeed temp monitoring access and driver info.\nSend COI with signed rate con."
            },

            // ШАГ 4
            {
                brokerQuestion: "Do you have real-time temp monitoring?",
                dispatcherPrompt: "✅ Брокер проверяет технологию",
                suggestions: [
                    {
                        text: "Yes, we have Samsara monitoring.\nCan provide portal access.\nYou'll see real-time temp data.\nWill send link after loading.",
                        quality: "good"
                    },
                    {
                        text: "We have temp monitoring.\nCan share data.\nYou'll be able to track.\nWill set up.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "OK, send access to james.mitchell@pharmalogistics.com.\nDriver name and phone?\nNeed it for shipper."
            },

            // ШАГ 5 - ФИНАЛ ХОРОШИЙ
            {
                brokerQuestion: "All set.\nAnything else?",
                dispatcherPrompt: "✅ Завершите профессионально",
                suggestions: [
                    {
                        text: "Driver is Michael Chen, 786-555-0156.\nWill be on time and follow procedures.\nWe'll keep you updated.\nThanks for the load!",
                        quality: "good"
                    },
                    {
                        text: "Driver Michael Chen, 786-555-0156.\nReady to go.\nWill update you.\nThanks.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Got it.\nGood luck with delivery.",
                isSuccess: true,
                outcome: "✅ ХОРОШИЙ РЕЗУЛЬТАТ!\n$3,700 (выше posted на $500)"
            }
        ],

        // ===== ПУТЬ НОРМАЛЬНЫЙ (3 шага) =====
        normal: [
            // ШАГ 1
            {
                brokerQuestion: "Yes, available.\nMC?",
                dispatcherPrompt: "⚪ Брокер хочет MC",
                suggestions: [
                    {
                        text: "MC 889234.\nWe have reefer available.\nDriver can handle temp requirements.\nReady for pickup.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "MC verified.\n1,500 miles pharma, 2-8°C.\nPickup tomorrow 6 AM, delivery 36 hours.\nRate $3,200.\nYes or no?"
            },

            // ШАГ 2
            {
                brokerQuestion: "$3,200 for this load.\nCan you do it?",
                dispatcherPrompt: "⚪ Брокер предлагает низкую ставку",
                suggestions: [
                    {
                        text: "Can you do $3,600?\nThat would work better.\nWe can guarantee delivery.\nWhat do you think?",
                        quality: "negotiate"
                    },
                    {
                        text: "Yes, $3,200 works.\nWe'll take it.\nSend rate con.",
                        quality: "accept"
                    }
                ],
                brokerResponse: "Best I can do is $3,400.\nFinal.\nYes or no?"
            },

            // ШАГ 3 - ФИНАЛ НОРМАЛЬНЫЙ
            {
                brokerQuestion: "$3,400 final.\nTake it?",
                dispatcherPrompt: "⚪ Финальное решение",
                suggestions: [
                    {
                        text: "OK, $3,400.\nLet's book it.\nWe use factoring.\nSend paperwork.",
                        quality: "accept"
                    },
                    {
                        text: "No, need $3,600 minimum.\nCan't go lower.\nSorry.",
                        quality: "reject"
                    }
                ],
                brokerResponse: "Booked.\nRate con sent.\nNeed temp monitoring and driver info.\nSend COI.",
                isSuccess: true,
                outcome: "⚪ БАЗОВЫЙ УСПЕХ:\n$3,400 (выше posted на $200)"
            }
        ],

        // ===== ПУТЬ ОТКАЗ - НЕТ PHARMA СЕРТИФИКАЦИИ =====
        brokerReject1: [
            {
                brokerQuestion: "MC and pharma certification?",
                dispatcherPrompt: "❌ Брокер требует pharma сертификацию",
                suggestions: [
                    {
                        text: "MC 889234.\nWe don't have pharma certification yet.\nBut we have good reefer equipment.\nDriver is experienced.\nCan we still do this load?",
                        quality: "wrong",
                        path: "brokerReject1"
                    },
                    {
                        text: "MC 889234, we're FDA registered with VAWD accreditation.\nSpecialize in pharmaceutical transport.\nEquipment has continuous temp monitoring.\nDriver has 6 years pharma experience.",
                        quality: "correct",
                        path: "master"
                    }
                ],
                brokerResponse: "Sorry, pharma certification is mandatory for vaccine transport.\nFDA and insurance requirements.\nCall me when you get certified.\nGood luck!",
                isSuccess: false,
                outcome: "❌ ОТКАЗ БРОКЕРА:\nПотеря груза - нет pharma сертификации"
            }
        ],

        // ===== ПУТЬ ОТКАЗ - НЕТ TEMP MONITORING =====
        brokerReject2: [
            {
                brokerQuestion: "Do you have real-time temperature monitoring?",
                dispatcherPrompt: "❌ Брокер требует real-time monitoring",
                suggestions: [
                    {
                        text: "We have basic temp recorder.\nDriver can check temperature manually.\nWe'll send logs.\nShould be fine.",
                        quality: "wrong",
                        path: "brokerReject2"
                    },
                    {
                        text: "Yes, we use Samsara TempTrac with real-time monitoring.\nI'll add you to portal for live temp data.\nInstant alerts if temp goes outside range.\nFull compliance reporting.",
                        quality: "correct",
                        path: "master"
                    }
                ],
                brokerResponse: "Manual monitoring doesn't meet shipper requirements.\nThey need real-time automated system.\nSorry, can't use you on this one.\nUpgrade your equipment and call me back.",
                isSuccess: false,
                outcome: "❌ ОТКАЗ БРОКЕРА:\nПотеря груза - нет real-time temp monitoring"
            }
        ],

        // ===== ПУТЬ ОТКАЗ - АГРЕССИВНАЯ ЦЕНА =====
        brokerReject3: [
            {
                brokerQuestion: "What rate for this pharma load?",
                dispatcherPrompt: "❌ Не требуйте нереальную цену",
                suggestions: [
                    {
                        text: "I need $5,500 minimum.\nNon-negotiable.\nThat's market rate for pharma.\nTake it or leave it.",
                        quality: "aggressive",
                        path: "brokerReject3"
                    },
                    {
                        text: "For 1,500 miles pharma I'm at $4,500.\nThat's $3.00/mile for specialized transport.\nIncludes monitoring and expedited timeline.\nWe guarantee compliance.",
                        quality: "correct",
                        path: "master"
                    }
                ],
                brokerResponse: "$5,500?\nThat's ridiculous even for pharma.\nI can't justify that to the customer.\nGood luck finding that rate!",
                isSuccess: false,
                outcome: "❌ ОТКАЗ БРОКЕРА:\nПотеря груза - нереальная агрессивная цена"
            }
        ]
    }
};

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { pharmaMiamiBostonDialog };
}
