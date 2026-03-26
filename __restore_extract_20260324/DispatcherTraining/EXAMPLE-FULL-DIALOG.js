// ПРИМЕР ПОЛНОГО РЕАЛИСТИЧНОГО ДИАЛОГА
// Chicago IL → Atlanta GA, 715 miles, Dry Van
// Брокер: Опытный профессионал 🎓
// Posted rate: $2,100 ($2.94/mile)

const exampleDialog = {
    id: 1,
    route: "Chicago IL → Atlanta GA",
    distance: 715,
    equipment: "Dry Van",
    weight: 38000,
    rate: 2100,
    brokerStyle: "Опытный",

    // ШАГ 0: ПЕРВОЕ СООБЩЕНИЕ ДИСПЕТЧЕРА
    initialMessage: "Good afternoon!\nThis is Alex from TransLogix Solutions.\nI'm calling about your Chicago to Atlanta dry van load.\nIs this still available?",

    paths: {
        // ===== ПУТЬ МАСТЕР (12 шагов) =====
        master: [
            // ШАГ 1
            {
                brokerQuestion: "Yes, still available but getting several calls.\nWhat's your MC and where's your driver right now?",
                dispatcherPrompt: "💎 Брокер хочет услышать MC номер и точное местоположение водителя",
                suggestions: [
                    {
                        text: "MC 778945, we've been running Midwest to Southeast lanes for 8 years.\nDriver just delivered in Joliet IL, about 45 minutes from Chicago.\nTrailer is empty and clean, 2023 Great Dane 53ft dry van with swing doors.\nReady to pickup today if needed.",
                        quality: "master",
                        path: "master"
                    },
                    {
                        text: "We have 2023 dry van available, driver near Chicago area.\nTrailer is empty and ready to go.\nMC 778945, we run this lane regularly.\nCan be at pickup location within an hour.",
                        quality: "good",
                        path: "good"
                    },
                    {
                        text: "Driver is currently in Chicago suburbs, trailer empty.\nWe have dry van equipment ready for pickup.\nOur MC number is 778945.\nEquipment is in good working condition.",
                        quality: "normal",
                        path: "normal"
                    }
                ],
                brokerResponse: "Perfect timing!\nVerified MC 778945 - clean record, good to go.\nThis is 38,000 lbs general freight, 715 miles to Atlanta.\nPickup window tomorrow 8 AM to 3 PM, FCFS.\nDelivery day after tomorrow by 5 PM.\nWhat rate are you thinking?"
            },

            // ШАГ 2
            {
                brokerQuestion: "Alright, what's your target rate for this run?",
                dispatcherPrompt: "💎 Брокер ждет вашу ставку - обоснуйте цену профессионально",
                suggestions: [
                    {
                        text: "For 715 miles with next-day delivery, I'm looking at $2,500.\nThat's $3.50/mile which is fair for this lane right now.\nCovers fuel, driver time, and ensures on-time delivery.\nWe guarantee no delays on our end.",
                        quality: "master"
                    },
                    {
                        text: "I'm at $2,500 for this load.\nThat's about $3.50 per mile for the distance.\nIt covers our operational costs and delivery timeline.\nWe can guarantee timely pickup and delivery.",
                        quality: "good"
                    },
                    {
                        text: "Looking at around $2,500 for this run.\nThat should cover the 715 miles adequately.\nOur driver can handle the delivery schedule.\nWhat do you think about that rate?",
                        quality: "normal"
                    }
                ],
                brokerResponse: "I appreciate the breakdown.\n$2,500 is higher than what shipper budgeted.\nPosted rate was $2,100, I can stretch to $2,250.\nThis is a regular customer, potential for weekly loads on this lane.\nCan you work with $2,250?"
            },

            // ШАГ 3
            {
                brokerQuestion: "How about we meet in the middle at $2,350?\nI can also fast-track your setup if you're new with us.",
                dispatcherPrompt: "💎 Брокер предлагает компромисс - решайте стратегически",
                suggestions: [
                    {
                        text: "$2,350 works for us on this one.\nWe work through RTS Factoring, can send NOA immediately.\nMy driver has 12 years experience, never had a late delivery.\nLet's book it - send rate con with all pickup details?",
                        quality: "master"
                    },
                    {
                        text: "$2,350 is acceptable for this load.\nWe use RTS Factoring for payment processing.\nDriver is experienced and reliable with deliveries.\nPlease send the rate confirmation when ready.",
                        quality: "good"
                    },
                    {
                        text: "OK, $2,350 will work for this trip.\nWe handle payments through factoring company.\nDriver can manage the delivery requirements.\nSend over the paperwork when you can.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Excellent!\nWe work with RTS all the time, no problem.\nSending rate con now with NOA instructions.\nPickup at Midwest Distribution, 4500 Industrial Pkwy, Chicago.\nContact Tom Wilson at 312-555-0199 for appointment.\nDelivery to Atlanta Logistics Center, I'll send full address in rate con."
            },

            // ШАГ 4
            {
                brokerQuestion: "Quick question - what's the pickup window again?\nMy driver wants to know if he can pickup early morning.",
                dispatcherPrompt: "💎 Уточните детали - покажите проактивность",
                suggestions: [
                    {
                        text: "Pickup window is 8 AM to 3 PM tomorrow, FCFS.\nIf your driver wants to be first in line, I'd suggest arriving around 7:45 AM.\nThey usually start loading right at 8.\nAlso, any special requirements for the trailer - food grade or specific door type?",
                        quality: "master"
                    },
                    {
                        text: "The pickup window you mentioned is 8 AM to 3 PM, first come first served.\nDriver can arrive early to be first in queue.\nShould be straightforward loading process.\nAny other details I should know about?",
                        quality: "good"
                    },
                    {
                        text: "You said 8 AM to 3 PM pickup window tomorrow.\nDriver can come early if he wants.\nIt's first come first served basis.\nAnything else needed for this load?",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Good thinking!\n8 AM start is correct, FCFS.\nNo special requirements - just standard dry van, any door type is fine.\nLoad is palletized, should take about 2 hours.\nDriver needs to call me when loaded with seal number."
            },

            // ШАГ 5
            {
                brokerQuestion: "One more thing - do you have GPS tracking?\nShipper likes to monitor high-value loads.",
                dispatcherPrompt: "💎 Брокер спрашивает про tracking - подтвердите возможности",
                suggestions: [
                    {
                        text: "Yes, we have real-time GPS tracking through Samsara.\nI can add you to tracking portal for live updates.\nDriver also sends check calls every 4 hours.\nWe provide ETA updates if anything changes.\nIs there a specific contact for tracking notifications?",
                        quality: "master"
                    },
                    {
                        text: "Yes, we have GPS tracking available through Samsara system.\nCan provide you access to monitor the load.\nDriver will also do regular check calls.\nWe keep you updated on any status changes.",
                        quality: "good"
                    },
                    {
                        text: "We have GPS tracking on all our trucks.\nCan share tracking information with you.\nDriver will call with updates as needed.\nYou'll know where the load is at all times.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Perfect!\nSamsara works great, we use it with many carriers.\nAdd my email to tracking - it's on the rate con.\nAppreciate the proactive communication.\nLooking forward to working with you on this and future loads!"
            },

            // ШАГ 6 - ФИНАЛ МАСТЕР
            {
                brokerQuestion: "All set!\nRate con sent to your email.\nAnything else you need from me?",
                dispatcherPrompt: "💎 Последние детали - будьте профессиональны до конца",
                suggestions: [
                    {
                        text: "Got the rate con, reviewing now.\nI'll send back signed copy with NOA within 30 minutes.\nDriver will call Tom at 312-555-0199 to confirm appointment.\nI'll update you once loaded tomorrow.\nThanks for the smooth booking!",
                        quality: "master"
                    },
                    {
                        text: "Received the rate confirmation, thank you.\nWill send signed documents back shortly.\nDriver will contact pickup location for appointment.\nWe'll keep you posted on progress.",
                        quality: "good"
                    },
                    {
                        text: "Got it, will sign and send back.\nDriver will call for pickup appointment.\nWe'll update you as we go.\nThanks for the load.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Excellent!\nLooking forward to receiving the signed docs.\nThis went smoothly - I'll definitely keep you in mind for future Chicago-Atlanta runs.\nWe have 2-3 loads per week on this lane.\nTalk soon!",
                isSuccess: true,
                outcome: "🏆 МАСТЕР-КЛАСС!\n$2,350 (выше posted на $250) + отличные отношения + потенциал 2-3 загрузки/неделю"
            }
        ],


        // ===== ПУТЬ ХОРОШИЙ (7 шагов) =====
        good: [
            // ШАГ 1
            {
                brokerQuestion: "Yes, available.\nMC number and is your trailer empty now?",
                dispatcherPrompt: "✅ Брокер хочет услышать MC и статус трейлера",
                suggestions: [
                    {
                        text: "MC 778945, we run Midwest lanes regularly.\nTrailer is empty, just finished delivery near Chicago.\n2023 dry van, 53ft with good condition.\nDriver ready for pickup today or tomorrow.",
                        quality: "good"
                    },
                    {
                        text: "Our MC is 778945, trailer empty and available.\nDriver is in Chicago area right now.\nEquipment is 2023 dry van in good shape.\nCan pickup whenever you need.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Good!\nChecked MC 778945 - you're clear.\nThis is 715 miles to Atlanta, 38K lbs general freight.\nPickup tomorrow 8 AM to 3 PM, delivery day after by 5 PM.\nWhat's your rate?"
            },

            // ШАГ 2
            {
                brokerQuestion: "What rate works for you on this?",
                dispatcherPrompt: "✅ Брокер ждет вашу ставку",
                suggestions: [
                    {
                        text: "For 715 miles I'm looking at $2,400.\nThat's reasonable for the distance and timeline.\nWe can guarantee on-time delivery.\nDoes that work with your budget?",
                        quality: "good"
                    },
                    {
                        text: "I'm thinking around $2,400 for this run.\nCovers the miles and delivery requirements.\nWe're reliable with our deliveries.\nCan you work with that rate?",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Posted rate was $2,100.\nI can go up to $2,200 max.\nThis customer gives us regular freight.\nCan you do $2,200?"
            },

            // ШАГ 3
            {
                brokerQuestion: "$2,200 is my best offer.\nIt's still above posted rate.\nYes or no?",
                dispatcherPrompt: "✅ Брокер предлагает компромисс",
                suggestions: [
                    {
                        text: "$2,200 works for us.\nWe work through factoring - RTS Financial.\nCan send NOA right away.\nLet's book it, send the rate con?",
                        quality: "good"
                    },
                    {
                        text: "OK, $2,200 is acceptable.\nWe use factoring for payment.\nReady to move forward.\nSend over the paperwork.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Great!\nWe work with RTS, no problem.\nSending rate con now.\nPickup at Midwest Distribution, 4500 Industrial Pkwy, Chicago.\nContact Tom at 312-555-0199.\nDelivery details in rate con."
            },

            // ШАГ 4
            {
                brokerQuestion: "Do you have tracking available?",
                dispatcherPrompt: "✅ Брокер спрашивает про GPS tracking",
                suggestions: [
                    {
                        text: "Yes, we have GPS tracking through Samsara.\nCan provide access for monitoring.\nDriver does check calls regularly.\nYou'll have full visibility.",
                        quality: "good"
                    },
                    {
                        text: "We have GPS tracking on the truck.\nCan share tracking with you.\nDriver will call with updates.\nNo problem with monitoring.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Perfect!\nAdd my email from rate con to tracking.\nAppreciate it.\nLooking forward to working together!"
            },

            // ШАГ 5 - ФИНАЛ ХОРОШИЙ
            {
                brokerQuestion: "Rate con sent.\nAnything else needed?",
                dispatcherPrompt: "✅ Завершите профессионально",
                suggestions: [
                    {
                        text: "Received, will sign and return shortly.\nDriver will call for pickup appointment.\nWe'll keep you updated.\nThanks for the load!",
                        quality: "good"
                    },
                    {
                        text: "Got it, sending back signed.\nDriver will contact pickup.\nWill update as needed.\nThank you!",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Sounds good!\nTalk to you soon.",
                isSuccess: true,
                outcome: "✅ ХОРОШИЙ РЕЗУЛЬТАТ!\n$2,200 (выше posted на $100) + хорошие отношения"
            }
        ],


        // ===== ПУТЬ НОРМАЛЬНЫЙ (4 шага) =====
        normal: [
            // ШАГ 1
            {
                brokerQuestion: "Yes, available.\nMC number?",
                dispatcherPrompt: "⚪ Брокер хочет услышать MC",
                suggestions: [
                    {
                        text: "MC 778945.\nWe have dry van available.\nDriver in Chicago area.\nTrailer is empty.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "OK, checking...\nMC 778945 verified.\n715 miles to Atlanta, 38K lbs.\nPickup tomorrow, delivery day after.\nRate is $2,100.\nCan you do it?"
            },

            // ШАГ 2
            {
                brokerQuestion: "$2,100 for 715 miles.\nYes or no?",
                dispatcherPrompt: "⚪ Брокер предлагает ставку",
                suggestions: [
                    {
                        text: "Can you do $2,300?\nThat would work better for us.\nWe can guarantee delivery.\nWhat do you think?",
                        quality: "negotiate"
                    },
                    {
                        text: "Yes, $2,100 works.\nWe can take it.\nReady to book.\nSend rate con.",
                        quality: "accept"
                    }
                ],
                brokerResponse: "Best I can do is $2,150.\nFinal offer.\nTake it or leave it."
            },

            // ШАГ 3
            {
                brokerQuestion: "$2,150 final.\nYes or no?",
                dispatcherPrompt: "⚪ Финальное решение",
                suggestions: [
                    {
                        text: "OK, $2,150.\nLet's book it.\nSend the paperwork.\nWe use factoring.",
                        quality: "accept"
                    },
                    {
                        text: "No, I need $2,250 minimum.\nCan't go lower than that.\nSorry, won't work.\nThanks anyway.",
                        quality: "reject"
                    }
                ],
                brokerResponse: "Booked.\nRate con sent.\nPickup Midwest Distribution, 4500 Industrial Pkwy, Chicago.\nTom Wilson 312-555-0199.\nCall when loaded.",
                isSuccess: true,
                outcome: "⚪ БАЗОВЫЙ УСПЕХ:\n$2,150 (выше posted на $50)"
            }
        ],


        // ===== ПУТЬ АГРЕССИВНЫЙ (4 шага) =====
        aggressive: [
            // ШАГ 1 (из мастер пути - агрессивный ответ)
            {
                brokerQuestion: "What's your target rate for this run?",
                dispatcherPrompt: "⚠️ Брокер ждет ставку - не будьте слишком агрессивны",
                suggestions: [
                    {
                        text: "I need $2,800 minimum for this load.\nThat's my bottom line, non-negotiable.\nMarket is hot right now.\nTake it or I'm moving on.",
                        quality: "aggressive",
                        path: "aggressive"
                    },
                    {
                        text: "For 715 miles with next-day delivery, I'm looking at $2,500.\nThat's $3.50/mile which is fair for this lane.\nCovers fuel and ensures on-time delivery.\nWe guarantee no delays.",
                        quality: "master",
                        path: "master"
                    }
                ],
                brokerResponse: "$2,800?\nThat's way over market!\nPosted rate was $2,100.\nI can't even get close to $2,800.\nAre you serious or just wasting my time?"
            },

            // ШАГ 2
            {
                brokerQuestion: "Look, best I can do is $2,200.\nThat's already $100 over posted.\nYes or no - I have other carriers calling.",
                dispatcherPrompt: "⚠️ Брокер недоволен - примите или потеряете груз",
                suggestions: [
                    {
                        text: "Fine, $2,200 works.\nWe'll take it.\nMC 778945, send rate con.\nWe use RTS Factoring.",
                        quality: "accept"
                    },
                    {
                        text: "No, $2,500 is my minimum.\nCan't go lower.\nGood luck finding someone.\nBye.",
                        quality: "reject"
                    }
                ],
                brokerResponse: "OK, $2,200 booked.\nBut that attitude doesn't fly with me.\nYou're not getting on my preferred list.\nRate con sent.\nPickup details in email.",
                isSuccess: true,
                outcome: "⚠️ ПЛОХО:\n$2,200 но испорченные отношения + нет будущих грузов"
            }
        ],


        // ===== ПУТЬ СЛАБЫЙ (4 шага) =====
        weak: [
            // ШАГ 1 (из мастер пути - слабый ответ)
            {
                brokerQuestion: "What's your target rate for this run?",
                dispatcherPrompt: "⚠️ Брокер ждет ставку - не показывайте слабость",
                suggestions: [
                    {
                        text: "Um, what's your budget?\nI'm not sure what to charge.\nWhatever works for you probably.\nJust let me know.",
                        quality: "weak",
                        path: "weak"
                    },
                    {
                        text: "For 715 miles I'm looking at $2,500.\nThat's fair for this lane and timeline.\nCovers our costs and delivery.\nDoes that work for you?",
                        quality: "master",
                        path: "master"
                    }
                ],
                brokerResponse: "My budget?\nYou should know your numbers.\nI'll give you $1,950.\nTake it or leave it."
            },

            // ШАГ 2
            {
                brokerQuestion: "$1,950 final offer.\nYes or no?",
                dispatcherPrompt: "⚠️ Брокер дал низкую ставку из-за вашей слабости",
                suggestions: [
                    {
                        text: "OK, I guess $1,950...\nWe'll take it.\nSend the paperwork.\nMC 778945.",
                        quality: "weak"
                    },
                    {
                        text: "Can you do $2,100 at least?\nThat's the posted rate.\nWould help us out.\nPlease?",
                        quality: "negotiate"
                    }
                ],
                brokerResponse: "Fine, $2,000 absolute final.\nBut next time know your rates before calling.\nRate con sent."
            },

            // ШАГ 3 - ФИНАЛ СЛАБЫЙ
            {
                brokerQuestion: "Anything else?",
                dispatcherPrompt: "⚠️ Завершите хоть как-то профессионально",
                suggestions: [
                    {
                        text: "No, that's all.\nWe'll handle it.\nThanks I guess.\nBye.",
                        quality: "weak"
                    }
                ],
                brokerResponse: "OK, bye.",
                isSuccess: true,
                outcome: "⚠️ СЛАБО:\n$2,000 (ниже posted на $100!) - потеряли $350+ из-за неуверенности"
            }
        ],


        // ===== ПУТЬ ОТКАЗ ДИСПЕТЧЕРА - НЕТ FACTORING (3 шага) =====
        dispatcherReject1: [
            // ШАГ 1-2 как в мастер пути, потом:
            {
                brokerQuestion: "Great, $2,350 works.\nHow do you handle payment - factoring or direct?",
                dispatcherPrompt: "❌ Брокер спрашивает про оплату - у вас только factoring!",
                suggestions: [
                    {
                        text: "We only work through factoring.\nRTS Financial is our company.\nCan you work with factoring?\nNeed to send NOA.",
                        quality: "correct",
                        path: "continue"
                    },
                    {
                        text: "We can do direct payment.\nWhatever works for you.\n30 days NET is fine.\nNo problem.",
                        quality: "wrong",
                        path: "dispatcherReject1"
                    }
                ],
                brokerResponse: "Sorry, we don't work with factoring companies.\nOnly direct payment, 30 days NET.\nIf you can't do that, I'll have to pass.\nLet me know."
            },

            // ШАГ 2
            {
                brokerQuestion: "Can you work without factoring or not?",
                dispatcherPrompt: "❌ Брокер не работает с factoring - нужно отказаться",
                suggestions: [
                    {
                        text: "Unfortunately we can only accept loads through factoring.\nThat's our company policy.\nSorry we couldn't work this out.\nThank you for your time.",
                        quality: "professional_reject"
                    },
                    {
                        text: "OK fine, we'll do direct payment.\n30 days is OK.\nLet's book it.\nSend rate con.",
                        quality: "wrong"
                    }
                ],
                brokerResponse: "No problem, I understand.\nMaybe next time.\nGood luck!",
                isSuccess: false,
                outcome: "❌ ОТКАЗ ДИСПЕТЧЕРА:\nПотеря груза - брокер не работает с factoring (правильное решение)"
            }
        ],

        // ===== ПУТЬ ОТКАЗ ДИСПЕТЧЕРА - ЦЕНА НЕ ПОДХОДИТ (3 шага) =====
        dispatcherReject2: [
            // ШАГ 1 как обычно, потом:
            {
                brokerQuestion: "Posted rate was $2,100.\nBest I can do is $2,150 final.\nYes or no?",
                dispatcherPrompt: "❌ Брокер предлагает низкую ставку - можете отказаться",
                suggestions: [
                    {
                        text: "I appreciate the offer but $2,150 doesn't work for us.\nOur minimum for this lane is $2,300.\nI understand if that doesn't fit your budget.\nThank you for considering us.",
                        quality: "professional_reject",
                        path: "dispatcherReject2"
                    },
                    {
                        text: "OK, $2,150 works.\nLet's book it.\nSend rate con.\nMC 778945.",
                        quality: "accept",
                        path: "normal"
                    }
                ],
                brokerResponse: "I understand.\nMaybe we can work together on a better paying load next time.\nGood luck!",
                isSuccess: false,
                outcome: "❌ ОТКАЗ ДИСПЕТЧЕРА:\nПотеря груза - ставка слишком низкая (правильное решение если не подходит)"
            }
        ],

        // ===== ПУТЬ ОТКАЗ БРОКЕРА - НЕТ MC (2 шага) =====
        brokerReject1: [
            {
                brokerQuestion: "Yes, available.\nWhat's your MC number?",
                dispatcherPrompt: "❌ Брокер спрашивает MC - без него не работают",
                suggestions: [
                    {
                        text: "We're still getting our MC authority.\nShould have it in 2 weeks.\nCan we work without it?\nWe're reliable.",
                        quality: "wrong",
                        path: "brokerReject1"
                    },
                    {
                        text: "MC 778945.\nWe have dry van available.\nDriver in Chicago area.\nTrailer is empty.",
                        quality: "correct",
                        path: "normal"
                    }
                ],
                brokerResponse: "Sorry, I can only work with carriers who have active MC authority.\nCall me back when you get your MC.\nGood luck!",
                isSuccess: false,
                outcome: "❌ ОТКАЗ БРОКЕРА:\nПотеря груза - нет MC номера"
            }
        ],

        // ===== ПУТЬ ОТКАЗ БРОКЕРА - ВОДИТЕЛЬ ДАЛЕКО (3 шага) =====
        brokerReject2: [
            {
                brokerQuestion: "Yes, available but need to cover it fast.\nMC and where's your driver?",
                dispatcherPrompt: "❌ Брокер торопится - если водитель далеко, может отказать",
                suggestions: [
                    {
                        text: "MC 778945, driver is currently in Denver.\nCan be in Chicago in about 18 hours.\nWe can make the pickup window.\nNo problem.",
                        quality: "risky",
                        path: "brokerReject2"
                    },
                    {
                        text: "MC 778945, driver just delivered near Chicago.\nAbout 45 minutes away, trailer empty.\nReady for pickup today if needed.\nEquipment is 2023 dry van.",
                        quality: "correct",
                        path: "master"
                    }
                ],
                brokerResponse: "Denver?\nThat's too far and too risky.\nPickup is tomorrow morning.\nI need someone local.\nSorry, can't use you on this one.",
                isSuccess: false,
                outcome: "❌ ОТКАЗ БРОКЕРА:\nПотеря груза - водитель слишком далеко"
            }
        ],

        // ===== ПУТЬ ОТКАЗ БРОКЕРА - АГРЕССИВНАЯ ЦЕНА (2 шага) =====
        brokerReject3: [
            {
                brokerQuestion: "What rate are you looking for?",
                dispatcherPrompt: "❌ Не требуйте нереальную цену - брокер откажет",
                suggestions: [
                    {
                        text: "I need $3,200 minimum.\nNon-negotiable.\nThat's market rate.\nTake it or leave it.",
                        quality: "aggressive",
                        path: "brokerReject3"
                    },
                    {
                        text: "For 715 miles I'm looking at $2,500.\nThat's fair for the distance.\nCovers our costs.\nDoes that work?",
                        quality: "correct",
                        path: "master"
                    }
                ],
                brokerResponse: "$3,200?\nThat's ridiculous for 715 miles.\nI'm not wasting my time.\nGood luck finding that rate!",
                isSuccess: false,
                outcome: "❌ ОТКАЗ БРОКЕРА:\nПотеря груза - нереальная агрессивная цена"
            }
        ]
    }
};

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { exampleDialog };
}
