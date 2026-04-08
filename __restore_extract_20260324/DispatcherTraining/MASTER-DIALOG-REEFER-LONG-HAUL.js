// САМЫЙ МОЩНЫЙ ДИАЛОГ - MASTER LEVEL
// Seattle WA → Miami FL, 3,300 miles, Reefer
// Брокер: Опытный профессионал 🎓 (детальный подход)
// Posted rate: $8,250 ($2.50/mile)
// Cargo: Fresh Produce (temperature-sensitive)
// Все возможные вопросы + максимум путей + все варианты отказа

const masterReeferDialog = {
    id: 100,
    route: "Seattle WA → Miami FL",
    distance: 3300,
    equipment: "Reefer",
    weight: 44000,
    temperature: "34-36°F",
    cargo: "Fresh Produce",
    rate: 8250,
    brokerStyle: "Опытный + Детальный",
    difficulty: "hard",

    // ШАГ 0: ПЕРВОЕ СООБЩЕНИЕ ДИСПЕТЧЕРА
    initialMessage: "Good morning!\nThis is Marcus from Cold Chain Express Logistics.\nI'm calling about your Seattle to Miami reefer load.\nIs this still available?",

    paths: {
        // ===== ПУТЬ МАСТЕР (15 шагов) - МАКСИМАЛЬНЫЙ РЕЗУЛЬТАТ =====
        master: [
            // ШАГ 1 - MC и местоположение
            {
                brokerQuestion: "Yes, still available.\nThis is a high-priority produce load.\nWhat's your MC number and where's your driver currently?",
                dispatcherPrompt: "💎 Брокер хочет услышать MC номер и точное местоположение водителя",
                suggestions: [
                    {
                        text: "MC 556789, we specialize in temperature-controlled produce for 15 years.\nDriver just delivered in Tacoma WA, about 30 miles from Seattle.\nTrailer is empty, pre-cooled, and sanitized.\n2024 Carrier reefer unit, 53ft with continuous monitoring system.",
                        quality: "master",
                        path: "master"
                    },
                    {
                        text: "We have 2024 reefer unit available in Seattle area.\nDriver finished delivery nearby, trailer is empty and ready.\nMC 556789, we handle produce loads regularly.\nEquipment has temperature monitoring and can maintain any temp range.",
                        quality: "good",
                        path: "good"
                    },
                    {
                        text: "Driver is currently near Seattle, trailer empty.\nWe have reefer equipment ready for temperature-controlled freight.\nOur MC number is 556789.\nEquipment is maintained and in good working condition.",
                        quality: "normal",
                        path: "normal"
                    }
                ],
                brokerResponse: "Excellent!\nVerified MC 556789 - 98% safety rating, very impressive.\nThis is 44,000 lbs fresh produce, must maintain 34-36°F constant.\n3,300 miles Seattle to Miami, pickup tomorrow 6 AM appointment.\nDelivery in 4 days maximum.\nCan your equipment handle this?"
            },

            // ШАГ 2 - Детали оборудования
            {
                brokerQuestion: "I need to verify your reefer capabilities.\nWhat year is the unit and do you have real-time temperature monitoring?",
                dispatcherPrompt: "💎 Брокер проверяет возможности вашего оборудования детально",
                suggestions: [
                    {
                        text: "2024 Carrier Transicold unit with less than 5,000 reefer hours.\nReal-time GPS tracking through Samsara with temperature alerts.\nContinuous monitoring, I can add you to portal for live updates.\nUnit was serviced last month, all maintenance records available.",
                        quality: "master"
                    },
                    {
                        text: "2024 Carrier reefer unit in excellent condition.\nWe have temperature monitoring system with GPS tracking.\nCan provide real-time updates throughout transit.\nUnit is well-maintained with recent service records.",
                        quality: "good"
                    },
                    {
                        text: "Reefer unit is 2024 model, well maintained.\nWe have temperature monitoring available.\nCan track temperature during the trip.\nEquipment is reliable for long haul.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Perfect!\nCarrier unit with Samsara tracking - that's exactly what we need.\nShipper requires temperature logs every 4 hours.\nThis is high-value produce, any temp deviation could spoil the load.\nPre-cool to 34°F required before loading.\nHow long do you need for pre-cool?"
            },

            // ШАГ 3 - Pre-cool и подготовка
            {
                brokerQuestion: "Can you have the trailer pre-cooled to 34°F by tomorrow 6 AM pickup?",
                dispatcherPrompt: "💎 Брокер спрашивает про pre-cool - покажите готовность",
                suggestions: [
                    {
                        text: "Absolutely, we'll start pre-cool tonight.\nUnit typically reaches 34°F in 3-4 hours.\nDriver will arrive at 5:30 AM to verify temp before loading.\nWe'll document pre-cool temp with timestamp for your records.",
                        quality: "master"
                    },
                    {
                        text: "Yes, we can pre-cool to 34°F before pickup.\nWill start the process tonight to be ready.\nDriver will be there early to ensure proper temperature.\nNo problem meeting the pre-cool requirement.",
                        quality: "good"
                    },
                    {
                        text: "We can pre-cool the trailer before pickup.\nShould be ready by 6 AM tomorrow.\nDriver will make sure temperature is correct.\nEquipment can handle the requirement.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Great preparation!\nNow let's talk about the rate.\nThis is 3,300 miles cross-country with strict temperature control.\nPosted rate is $8,250.\nWhat's your target rate for this run?"
            },

            // ШАГ 4 - Обоснование ставки
            {
                brokerQuestion: "What rate are you looking for on this load?",
                dispatcherPrompt: "💎 Брокер ждет вашу ставку - обоснуйте профессионально",
                suggestions: [
                    {
                        text: "For 3,300 miles with continuous temp monitoring and 4-day delivery, I'm at $9,500.\nThat's $2.88/mile which is fair for produce cross-country.\nCovers fuel, team operation, reefer fuel, and ensures zero temp violations.\nWe guarantee on-time delivery with perfect temp logs.",
                        quality: "master"
                    },
                    {
                        text: "I'm looking at $9,500 for this load.\nThat's about $2.88 per mile for the distance.\nCovers all operational costs including reefer fuel.\nWe can guarantee proper temperature control throughout.",
                        quality: "good"
                    },
                    {
                        text: "Looking at around $9,500 for this run.\nThat should cover the 3,300 miles adequately.\nIncludes reefer operation and monitoring.\nWhat do you think about that rate?",
                        quality: "normal"
                    }
                ],
                brokerResponse: "I appreciate the detailed breakdown.\n$9,500 is higher than shipper budgeted.\nPosted was $8,250, I can stretch to $8,800.\nThis shipper gives us 5-6 produce loads per week Seattle to East Coast.\nPotential for regular business.\nCan you work with $8,800?"
            },

            // ШАГ 5 - Переговоры
            {
                brokerQuestion: "How about we meet at $9,000?\nI can also fast-track your preferred carrier status.",
                dispatcherPrompt: "💎 Брокер предлагает компромисс с долгосрочными перспективами",
                suggestions: [
                    {
                        text: "$9,000 works for us on this one.\nWe work through RTS Pro Factoring, can send NOA immediately.\nOur team drivers have 20+ years combined produce experience.\nZero claims history on temperature-controlled freight.\nLet's book it - what's the exact pickup location?",
                        quality: "master"
                    },
                    {
                        text: "$9,000 is acceptable for this load.\nWe use RTS Pro for factoring, NOA ready to send.\nDrivers are experienced with produce and temperature control.\nReady to move forward with booking.",
                        quality: "good"
                    },
                    {
                        text: "OK, $9,000 will work for this trip.\nWe handle payments through factoring company.\nDrivers can manage the temperature requirements.\nSend over the paperwork when ready.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Excellent!\nWe work with RTS Pro regularly, no issues.\nPickup at Fresh Harvest Distribution, 8900 Pacific Hwy, Seattle.\nContact Sarah Chen at 206-555-0177 for appointment confirmation.\nDelivery to Miami Produce Terminal, full address in rate con.\nLet me get more details for you."
            },

            // ШАГ 6 - Детали pickup
            {
                brokerQuestion: "Pickup is appointment at 6 AM sharp tomorrow.\nAny questions about the pickup location or loading process?",
                dispatcherPrompt: "💎 Покажите проактивность - задайте важные вопросы",
                suggestions: [
                    {
                        text: "Yes, few questions for smooth operation.\nIs there a specific dock number or gate code?\nHow many hours typically for loading 44K lbs produce?\nAny special handling requirements or stacking restrictions?\nWho do we contact if we arrive early?",
                        quality: "master"
                    },
                    {
                        text: "I have some questions about pickup.\nWhat's the dock number and any gate access codes?\nHow long does loading usually take?\nAny special instructions we should know about?",
                        quality: "good"
                    },
                    {
                        text: "Do we need any special information for pickup?\nWhat dock should driver go to?\nHow long will loading take?\nAnything else we need to know?",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Great questions!\nDock 7, gate code 4521.\nLoading takes about 2-3 hours, they're very efficient.\nProduce is palletized, 22 pallets total, stackable.\nIf early, check in at main office.\nDriver must inspect for any damaged product before accepting.\nSarah will have BOL ready."
            },

            // ШАГ 7 - Детали delivery
            {
                brokerQuestion: "Delivery window is day 4 between 6 AM and 2 PM.\nMiami Produce Terminal operates FCFS.\nAny concerns about the delivery timeline?",
                dispatcherPrompt: "💎 Подтвердите возможность выполнения и уточните детали",
                suggestions: [
                    {
                        text: "Timeline is manageable with team drivers.\n3,300 miles in 4 days gives us good buffer.\nWe average 1,100 miles per day with teams.\nCan you confirm if there's detention pay after 2 hours?\nAlso, who pays lumper fee if required at delivery?",
                        quality: "master"
                    },
                    {
                        text: "Four days is doable with our team operation.\nWe can make the delivery window without issues.\nWhat's the detention policy if unloading takes long?\nAny lumper fees we should know about?",
                        quality: "good"
                    },
                    {
                        text: "We can make the 4-day delivery timeline.\nTeam drivers can handle the distance.\nWhat about detention time?\nAny fees at delivery?",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Good planning!\nDetention starts after 2 hours, $75/hour.\nLumper fee is typically $150-200, shipper covers it.\nYou'll get reimbursed with lumper receipt.\nReceiver contact is Miguel Rodriguez at 305-555-0198.\nCall him when you're 2 hours out for dock assignment."
            },

            // ШАГ 8 - Routing и требования
            {
                brokerQuestion: "Any preferred routing or should driver take I-90 to I-95?\nAlso, do you avoid any states or toll roads?",
                dispatcherPrompt: "💎 Обсудите маршрут и покажите знание логистики",
                suggestions: [
                    {
                        text: "I-90 to I-95 is our standard route for this lane.\nWe use toll roads for faster transit - time is critical for produce.\nDriver will avoid any weather delays by monitoring forecasts.\nWe'll provide check calls every 4 hours with temp readings.\nAny routing restrictions from shipper we should know?",
                        quality: "master"
                    },
                    {
                        text: "I-90 to I-95 route works well for us.\nWe're fine with toll roads for faster delivery.\nDriver will monitor weather and adjust if needed.\nWe'll keep you updated with regular check calls.",
                        quality: "good"
                    },
                    {
                        text: "Driver usually takes I-90 to I-95 route.\nToll roads are OK if needed.\nWill avoid bad weather if possible.\nWe'll call with updates.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Perfect routing!\nNo restrictions from shipper.\nToll roads are fine - speed matters for fresh produce.\nWeather is looking good for next 4 days.\nJust keep me posted if anything changes.\nI'll need check calls at loading, every 8 hours in transit, and when 2 hours from delivery."
            },

            // ШАГ 9 - Tracking и коммуникация
            {
                brokerQuestion: "You mentioned Samsara tracking.\nCan you add my email for temperature monitoring?\nAlso, what's your after-hours contact?",
                dispatcherPrompt: "💎 Подтвердите все системы мониторинга и контакты",
                suggestions: [
                    {
                        text: "Absolutely, I'll add your email to Samsara portal right after this call.\nYou'll get real-time GPS and temp alerts if it goes outside 34-36°F range.\nMy direct line is 24/7: 425-555-0123.\nDriver's cell will be on rate con for direct contact.\nWe also have dispatch available 24/7 at 425-555-0100.",
                        quality: "master"
                    },
                    {
                        text: "Yes, I'll add you to Samsara tracking immediately.\nYou'll see GPS location and temperature readings.\nMy cell is 425-555-0123 for after hours.\nDriver contact will be on the rate confirmation.",
                        quality: "good"
                    },
                    {
                        text: "I can add you to tracking system.\nYou'll be able to monitor location and temperature.\nHere's my contact: 425-555-0123.\nDriver info will be on paperwork.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Excellent communication setup!\nMy email is on the rate con I'm sending now.\nI really appreciate the proactive approach.\nThis is exactly the kind of carrier we want for our produce lanes.\nLet me confirm the factoring details."
            },

            // ШАГ 10 - Factoring и документы
            {
                brokerQuestion: "You said RTS Pro Factoring.\nCan you send NOA with signed rate con within the hour?\nWe need everything in place before pickup.",
                dispatcherPrompt: "💎 Подтвердите быструю обработку документов",
                suggestions: [
                    {
                        text: "Yes, I'll have signed rate con and NOA back to you within 30 minutes.\nOur RTS Pro account is active, they'll process immediately.\nI'll also send our insurance certificate showing $100K cargo coverage.\nDriver will have all documents in truck before pickup.\nAnything else you need from us?",
                        quality: "master"
                    },
                    {
                        text: "I'll send signed rate con and NOA within 30 minutes.\nRTS Pro is our factoring company, all set up.\nWill include insurance certificate as well.\nEverything will be ready before pickup tomorrow.",
                        quality: "good"
                    },
                    {
                        text: "Will send signed documents within an hour.\nRTS Pro handles our factoring.\nInsurance info will be included.\nEverything ready for tomorrow.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Perfect!\nRate con sent to your email now.\nIncludes all pickup/delivery details, temperature requirements, and contact info.\nNOA instructions are attached.\nOnce I receive your signed docs, we're all set.\nThis is going to be a smooth run!"
            },

            // ШАГ 11 - Дополнительные детали
            {
                brokerQuestion: "One more thing - do your drivers have TWIC cards?\nMiami terminal sometimes requires it for security.",
                dispatcherPrompt: "💎 Подтвердите все сертификации водителей",
                suggestions: [
                    {
                        text: "Yes, both team drivers have current TWIC cards.\nThey also have Hazmat endorsements though not needed for this load.\nBoth are HACCP certified for food transport.\nClean driving records, no violations in past 5 years.\nAnything else you need to verify?",
                        quality: "master"
                    },
                    {
                        text: "Yes, our drivers have TWIC cards.\nThey're also certified for food transport.\nClean driving records and experienced.\nShould be no issues at Miami terminal.",
                        quality: "good"
                    },
                    {
                        text: "Drivers have TWIC cards.\nThey're qualified for this type of load.\nNo problems with security clearance.\nAll set for Miami delivery.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Outstanding!\nTWIC cards will definitely help at Miami.\nYou guys are really well prepared.\nI'm adding you to our preferred carrier list right now.\nWe have 5-6 Seattle to East Coast produce loads every week.\nI'll be calling you first for future loads."
            },

            // ШАГ 12 - Contingency planning
            {
                brokerQuestion: "Last question - what's your breakdown protocol?\nGod forbid something happens, but I need to know the plan.",
                dispatcherPrompt: "💎 Покажите готовность к любым ситуациям",
                suggestions: [
                    {
                        text: "We have 24/7 roadside assistance through TA Truck Service.\nIf reefer unit fails, we have network of backup reefer trucks nationwide.\nWe'd transfer load within 4 hours to maintain temp.\nFull breakdown coverage and backup plan in place.\nWe've never had a temp failure, but we're prepared if it happens.\nYou'd be notified immediately of any issues.",
                        quality: "master"
                    },
                    {
                        text: "We have roadside assistance available 24/7.\nIf there's a reefer issue, we have backup options.\nWould transfer load to another reefer if needed.\nYou'd be contacted immediately about any problems.",
                        quality: "good"
                    },
                    {
                        text: "We have roadside assistance for breakdowns.\nCan arrange backup truck if needed.\nWould let you know right away if issues.\nHave plans in place for emergencies.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "That's exactly what I wanted to hear!\nBackup plan is crucial for produce.\nYou guys really know what you're doing.\nI feel very confident about this load.\nLooking forward to a perfect delivery!"
            },

            // ШАГ 13 - Backhaul возможность
            {
                brokerQuestion: "By the way, do you need a backhaul from Miami?\nWe might have something going back to West Coast.",
                dispatcherPrompt: "💎 Покажите интерес к долгосрочному сотрудничеству",
                suggestions: [
                    {
                        text: "Absolutely interested in backhaul!\nWe prefer not to deadhead 3,300 miles back.\nWhat lanes do you have from Miami?\nWe're flexible on destination - anywhere West Coast or Midwest works.\nCan wait 1-2 days if needed for the right load.",
                        quality: "master"
                    },
                    {
                        text: "Yes, definitely interested in backhaul.\nWe'd like to avoid empty miles back.\nWhat do you have available from Miami?\nWe're flexible on timing and destination.",
                        quality: "good"
                    },
                    {
                        text: "We're looking for backhaul from Miami.\nDon't want to run empty back.\nWhat loads do you have?\nWe can be flexible.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Great!\nI have Miami to Dallas produce, 1,300 miles.\nAlso Miami to Phoenix dry van, 2,400 miles.\nLet me check what's available when you deliver.\nI'll text you day 3 with options.\nThis could be a perfect round trip for you!"
            },

            // ШАГ 14 - Финальное подтверждение
            {
                brokerQuestion: "Alright, let me recap everything.\nSeattle pickup tomorrow 6 AM, Miami delivery day 4 by 2 PM.\n$9,000 rate, RTS Pro factoring.\nAnything I'm missing?",
                dispatcherPrompt: "💎 Подтвердите все детали профессионально",
                suggestions: [
                    {
                        text: "Perfect recap, all correct!\nI'll send signed rate con and NOA within 30 minutes.\nDriver will call Sarah at 206-555-0177 tonight to confirm appointment.\nWe'll start pre-cool tonight, arrive 5:30 AM tomorrow.\nI'll add you to Samsara tracking immediately.\nFirst check call will be right after loading with temp confirmation.\nLooking forward to a perfect run!",
                        quality: "master"
                    },
                    {
                        text: "Yes, everything is correct.\nI'll send documents within 30 minutes.\nDriver will confirm appointment tonight.\nWe'll be ready for 6 AM pickup.\nWill keep you updated throughout the trip.",
                        quality: "good"
                    },
                    {
                        text: "All correct, nothing missing.\nWill send paperwork soon.\nDriver will call to confirm.\nReady for tomorrow pickup.\nWill update you during transit.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Fantastic!\nThis is how professional carriers operate.\nI'm really impressed with your preparation and communication.\nYou're definitely going on my A-list.\nExpect more calls from me for future loads.\nLet's make this a great partnership!"
            },

            // ШАГ 15 - ФИНАЛ МАСТЕР
            {
                brokerQuestion: "Perfect!\nRate con sent, waiting for your signed docs.\nAnything else you need from me?",
                dispatcherPrompt: "💎 Завершите на высшем профессиональном уровне",
                suggestions: [
                    {
                        text: "Got the rate con, reviewing now.\nI'll have everything back to you in 20 minutes.\nDriver Marcus Johnson will be your contact, cell on rate con.\nHe'll call Sarah tonight and you after loading tomorrow.\nThank you for the detailed coordination - this is how smooth operations happen.\nLooking forward to many more loads together!",
                        quality: "master"
                    },
                    {
                        text: "Received rate con, will send back shortly.\nDriver will contact everyone as needed.\nThank you for all the details.\nLooking forward to working together!",
                        quality: "good"
                    },
                    {
                        text: "Got it, sending back soon.\nDriver will make the calls.\nThanks for the load.\nTalk soon!",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Excellent!\nThis has been one of the best booking calls I've had.\nYou asked all the right questions and have everything covered.\nI'll be watching this load closely and will definitely use you again.\nWe have 5-6 loads per week on this lane - you're my go-to carrier now.\nSafe travels and talk soon!",
                isSuccess: true,
                outcome: "🏆 МАСТЕР-КЛАСС ВЫСШЕГО УРОВНЯ!\n$9,000 (выше posted на $750) + preferred carrier status + 5-6 loads/week + backhaul opportunity + долгосрочное партнерство"
            }
        ],


        // ===== ПУТЬ ХОРОШИЙ (8 шагов) =====
        good: [
            // ШАГ 1
            {
                brokerQuestion: "Yes, available.\nMC number and is your trailer empty now?",
                dispatcherPrompt: "✅ Брокер хочет услышать MC и статус трейлера",
                suggestions: [
                    {
                        text: "MC 556789, we specialize in reefer produce loads.\nTrailer is empty, just finished delivery near Seattle.\n2024 Carrier reefer unit with temperature monitoring.\nDriver ready for pickup tomorrow morning.",
                        quality: "good"
                    },
                    {
                        text: "Our MC is 556789, trailer empty and available.\nDriver is in Seattle area right now.\nEquipment is 2024 reefer in excellent condition.\nCan pickup whenever you need.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Good!\nChecked MC 556789 - clean record.\nThis is 3,300 miles to Miami, 44K lbs fresh produce at 34-36°F.\nPickup tomorrow 6 AM appointment, delivery in 4 days.\nCan your reefer handle continuous temp control?"
            },

            // ШАГ 2
            {
                brokerQuestion: "What year is your reefer unit and do you have temperature monitoring?",
                dispatcherPrompt: "✅ Брокер проверяет оборудование",
                suggestions: [
                    {
                        text: "2024 Carrier unit with GPS and temperature tracking.\nWe have real-time monitoring through Samsara.\nCan provide temp logs every 4 hours.\nUnit is well-maintained and reliable for long haul.",
                        quality: "good"
                    },
                    {
                        text: "Reefer is 2024 model with monitoring system.\nWe track temperature during transit.\nCan send updates as needed.\nEquipment is maintained regularly.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Good equipment!\nShipper requires pre-cool to 34°F before loading.\nPickup is 6 AM sharp tomorrow.\nCan you have it pre-cooled by then?"
            },

            // ШАГ 3
            {
                brokerQuestion: "Pre-cool to 34°F by 6 AM tomorrow - can you do it?",
                dispatcherPrompt: "✅ Подтвердите готовность к pre-cool",
                suggestions: [
                    {
                        text: "Yes, we'll start pre-cool tonight.\nUnit reaches 34°F in about 3-4 hours.\nDriver will verify temperature before loading.\nNo problem meeting the requirement.",
                        quality: "good"
                    },
                    {
                        text: "We can pre-cool before pickup.\nWill be ready by 6 AM.\nDriver will check temperature.\nEquipment can handle it.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Perfect!\nNow let's discuss rate.\n3,300 miles cross-country reefer with produce.\nPosted rate is $8,250.\nWhat's your rate?"
            },

            // ШАГ 4
            {
                brokerQuestion: "What rate works for you on this?",
                dispatcherPrompt: "✅ Брокер ждет вашу ставку",
                suggestions: [
                    {
                        text: "For 3,300 miles with temp control I'm looking at $9,200.\nThat's reasonable for cross-country reefer produce.\nCovers fuel, reefer operation, and team drivers.\nCan you work with that rate?",
                        quality: "good"
                    },
                    {
                        text: "I'm thinking around $9,200 for this run.\nCovers the distance and temperature requirements.\nIncludes all operational costs.\nDoes that fit your budget?",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Posted was $8,250.\nI can go up to $8,700 max.\nThis shipper gives us regular produce loads.\nCan you do $8,700?"
            },

            // ШАГ 5
            {
                brokerQuestion: "$8,700 is my best offer.\nStill above posted rate.\nYes or no?",
                dispatcherPrompt: "✅ Брокер предлагает компромисс",
                suggestions: [
                    {
                        text: "$8,700 works for us.\nWe work through RTS Pro Factoring.\nCan send NOA right away.\nLet's book it, send the rate con?",
                        quality: "good"
                    },
                    {
                        text: "OK, $8,700 is acceptable.\nWe use factoring for payment.\nReady to move forward.\nSend over the paperwork.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Great!\nWe work with RTS Pro, no problem.\nSending rate con now.\nPickup at Fresh Harvest Distribution, 8900 Pacific Hwy, Seattle.\nContact Sarah Chen at 206-555-0177.\nDelivery details in rate con."
            },

            // ШАГ 6
            {
                brokerQuestion: "Do you have GPS tracking for this load?",
                dispatcherPrompt: "✅ Брокер спрашивает про tracking",
                suggestions: [
                    {
                        text: "Yes, we have GPS tracking through Samsara.\nCan provide access for monitoring.\nDriver does check calls regularly.\nYou'll have full visibility on location and temp.",
                        quality: "good"
                    },
                    {
                        text: "We have GPS tracking available.\nCan share tracking with you.\nDriver will call with updates.\nNo problem with monitoring.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Perfect!\nAdd my email from rate con to tracking.\nI'll need check calls at loading and every 8 hours.\nAppreciate it!"
            },

            // ШАГ 7
            {
                brokerQuestion: "Any questions about pickup or delivery?",
                dispatcherPrompt: "✅ Задайте важные вопросы",
                suggestions: [
                    {
                        text: "Yes, what's the dock number at pickup?\nHow long does loading typically take?\nAlso, what's the detention policy at delivery?\nAny lumper fees we should know about?",
                        quality: "good"
                    },
                    {
                        text: "Do we need dock number?\nHow long for loading?\nWhat about detention time?\nAny fees at delivery?",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Dock 7, loading takes 2-3 hours.\nDetention after 2 hours at $75/hour.\nLumper fee around $150-200, shipper covers it.\nReceiver is Miguel at 305-555-0198."
            },

            // ШАГ 8 - ФИНАЛ ХОРОШИЙ
            {
                brokerQuestion: "Rate con sent.\nAnything else needed?",
                dispatcherPrompt: "✅ Завершите профессионально",
                suggestions: [
                    {
                        text: "Received, will sign and return within 30 minutes.\nDriver will call Sarah tonight to confirm.\nWe'll keep you updated throughout transit.\nThanks for the load!",
                        quality: "good"
                    },
                    {
                        text: "Got it, sending back signed.\nDriver will contact pickup.\nWill update as needed.\nThank you!",
                        quality: "normal"
                    }
                ],
                brokerResponse: "Sounds good!\nLooking forward to working together.\nCall me if any issues.\nSafe travels!",
                isSuccess: true,
                outcome: "✅ ХОРОШИЙ РЕЗУЛЬТАТ!\n$8,700 (выше posted на $450) + хорошие отношения + возможность будущих грузов"
            }
        ],

        // ===== ПУТЬ НОРМАЛЬНЫЙ (5 шагов) =====
        normal: [
            // ШАГ 1
            {
                brokerQuestion: "Yes, available.\nMC number?",
                dispatcherPrompt: "⚪ Брокер хочет услышать MC",
                suggestions: [
                    {
                        text: "MC 556789.\nWe have reefer available.\nDriver in Seattle area.\nTrailer is empty.",
                        quality: "normal"
                    }
                ],
                brokerResponse: "OK, checking...\nMC 556789 verified.\n3,300 miles to Miami, 44K lbs produce at 34-36°F.\nPickup tomorrow 6 AM, delivery in 4 days.\nRate is $8,250.\nCan you do it?"
            },

            // ШАГ 2
            {
                brokerQuestion: "$8,250 for 3,300 miles.\nYes or no?",
                dispatcherPrompt: "⚪ Брокер предлагает ставку",
                suggestions: [
                    {
                        text: "Can you do $8,800?\nThat would work better for us.\nWe can guarantee proper temp control.\nWhat do you think?",
                        quality: "negotiate"
                    },
                    {
                        text: "Yes, $8,250 works.\nWe can take it.\nReady to book.\nSend rate con.",
                        quality: "accept"
                    }
                ],
                brokerResponse: "Best I can do is $8,500.\nFinal offer.\nTake it or leave it."
            },

            // ШАГ 3
            {
                brokerQuestion: "$8,500 final.\nYes or no?",
                dispatcherPrompt: "⚪ Финальное решение",
                suggestions: [
                    {
                        text: "OK, $8,500.\nLet's book it.\nSend the paperwork.\nWe use factoring.",
                        quality: "accept"
                    },
                    {
                        text: "No, I need $8,800 minimum.\nCan't go lower than that.\nSorry, won't work.\nThanks anyway.",
                        quality: "reject"
                    }
                ],
                brokerResponse: "Booked.\nRate con sent.\nPickup Fresh Harvest Distribution, 8900 Pacific Hwy, Seattle.\nSarah Chen 206-555-0177.\nCall when loaded.",
                isSuccess: true,
                outcome: "⚪ БАЗОВЫЙ УСПЕХ:\n$8,500 (выше posted на $250)"
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
                        text: "I need $10,500 minimum for this load.\nThat's my bottom line, non-negotiable.\nReefer cross-country rates are high right now.\nTake it or I'm moving on.",
                        quality: "aggressive",
                        path: "aggressive"
                    },
                    {
                        text: "For 3,300 miles with temp monitoring I'm at $9,500.\nThat's $2.88/mile which is fair for produce.\nCovers all costs and ensures perfect delivery.\nWe guarantee no temp violations.",
                        quality: "master",
                        path: "master"
                    }
                ],
                brokerResponse: "$10,500?\nThat's way over market for this lane!\nPosted rate was $8,250.\nI can't even get close to $10,500.\nAre you serious or just wasting my time?"
            },

            // ШАГ 2
            {
                brokerQuestion: "Look, best I can do is $8,700.\nThat's already $450 over posted.\nYes or no - I have other reefer carriers calling.",
                dispatcherPrompt: "⚠️ Брокер недоволен - примите или потеряете груз",
                suggestions: [
                    {
                        text: "Fine, $8,700 works.\nWe'll take it.\nMC 556789, send rate con.\nWe use RTS Pro Factoring.",
                        quality: "accept"
                    },
                    {
                        text: "No, $9,500 is my minimum.\nCan't go lower for reefer cross-country.\nGood luck finding someone.\nBye.",
                        quality: "reject"
                    }
                ],
                brokerResponse: "OK, $8,700 booked.\nBut that attitude doesn't work with me.\nYou're not getting on my preferred list.\nRate con sent.\nPickup details in email.",
                isSuccess: true,
                outcome: "⚠️ ПЛОХО:\n$8,700 но испорченные отношения + нет будущих грузов + потеря 5-6 loads/week"
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
                        text: "Um, what's your budget?\nI'm not sure what to charge for reefer cross-country.\nWhatever works for you probably.\nJust let me know.",
                        quality: "weak",
                        path: "weak"
                    },
                    {
                        text: "For 3,300 miles with temp control I'm at $9,500.\nThat's fair for produce cross-country.\nCovers all operational costs.\nDoes that work for you?",
                        quality: "master",
                        path: "master"
                    }
                ],
                brokerResponse: "My budget?\nYou should know your rates for reefer.\nI'll give you $7,800.\nTake it or leave it."
            },

            // ШАГ 2
            {
                brokerQuestion: "$7,800 final offer.\nYes or no?",
                dispatcherPrompt: "⚠️ Брокер дал низкую ставку из-за вашей слабости",
                suggestions: [
                    {
                        text: "OK, I guess $7,800...\nWe'll take it.\nSend the paperwork.\nMC 556789.",
                        quality: "weak"
                    },
                    {
                        text: "Can you do $8,250 at least?\nThat's the posted rate.\nWould really help us out.\nPlease?",
                        quality: "negotiate"
                    }
                ],
                brokerResponse: "Fine, $8,000 absolute final.\nBut next time know your numbers before calling.\nRate con sent."
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
                outcome: "⚠️ СЛАБО:\n$8,000 (ниже posted на $250!) - потеряли $1,000+ из-за неуверенности"
            }
        ],


        // ===== ПУТЬ ОТКАЗ ДИСПЕТЧЕРА #1 - НЕТ FACTORING (3 шага) =====
        dispatcherReject1: [
            // ШАГ 1-4 как в мастер пути, потом:
            {
                brokerQuestion: "Great, $9,000 works.\nHow do you handle payment - factoring or direct?",
                dispatcherPrompt: "❌ Брокер спрашивает про оплату - у вас только factoring!",
                suggestions: [
                    {
                        text: "We only work through factoring.\nRTS Pro is our company.\nCan you work with factoring?\nNeed to send NOA.",
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
                        text: "Unfortunately we can only accept loads through factoring.\nThat's our company policy for cash flow.\nSorry we couldn't work this out.\nThank you for your time and consideration.",
                        quality: "professional_reject"
                    },
                    {
                        text: "OK fine, we'll do direct payment.\n30 days is OK.\nLet's book it.\nSend rate con.",
                        quality: "wrong"
                    }
                ],
                brokerResponse: "No problem, I understand.\nMaybe we can work together in the future.\nGood luck!",
                isSuccess: false,
                outcome: "❌ ОТКАЗ ДИСПЕТЧЕРА:\nПотеря груза - брокер не работает с factoring (правильное решение)"
            }
        ],

        // ===== ПУТЬ ОТКАЗ ДИСПЕТЧЕРА #2 - ЦЕНА НЕ ПОДХОДИТ (3 шага) =====
        dispatcherReject2: [
            // ШАГ 1-2 как обычно, потом:
            {
                brokerQuestion: "Posted rate was $8,250.\nBest I can do is $8,500 final.\nYes or no?",
                dispatcherPrompt: "❌ Брокер предлагает низкую ставку - можете отказаться",
                suggestions: [
                    {
                        text: "I appreciate the offer but $8,500 doesn't work for us.\nOur minimum for 3,300 mile reefer is $8,800.\nI understand if that doesn't fit your budget.\nThank you for considering us.",
                        quality: "professional_reject",
                        path: "dispatcherReject2"
                    },
                    {
                        text: "OK, $8,500 works.\nLet's book it.\nSend rate con.\nMC 556789.",
                        quality: "accept",
                        path: "normal"
                    }
                ],
                brokerResponse: "I understand.\nMaybe we can work together on a better paying load next time.\nGood luck!",
                isSuccess: false,
                outcome: "❌ ОТКАЗ ДИСПЕТЧЕРА:\nПотеря груза - ставка слишком низкая (правильное решение если не подходит)"
            }
        ],

        // ===== ПУТЬ ОТКАЗ ДИСПЕТЧЕРА #3 - НЕТ TEMP MONITORING (3 шага) =====
        dispatcherReject3: [
            {
                brokerQuestion: "Do you have real-time temperature monitoring?\nShipper requires it for produce loads.",
                dispatcherPrompt: "❌ Брокер требует temp monitoring - если нет, нужно отказаться",
                suggestions: [
                    {
                        text: "We don't have real-time monitoring system.\nDriver can check temp manually every few hours.\nWe can call with updates.\nWill that work?",
                        quality: "wrong",
                        path: "dispatcherReject3"
                    },
                    {
                        text: "Yes, we have real-time monitoring through Samsara.\nContinuous tracking with temperature alerts.\nCan add you to portal for live updates.\nFull visibility throughout transit.",
                        quality: "correct",
                        path: "master"
                    }
                ],
                brokerResponse: "Sorry, shipper requires real-time automated monitoring.\nManual checks aren't sufficient for high-value produce.\nI can't use you on this load.\nMaybe on dry van loads in the future."
            },

            {
                brokerQuestion: "Do you have any reefer units with automated monitoring?",
                dispatcherPrompt: "❌ Последний шанс - если нет, груз потерян",
                suggestions: [
                    {
                        text: "Unfortunately all our reefers are manual monitoring only.\nWe're looking to upgrade soon.\nSorry we can't help with this one.\nThank you anyway.",
                        quality: "professional_reject"
                    }
                ],
                brokerResponse: "No worries, I understand.\nCall me when you get automated monitoring.\nGood luck!",
                isSuccess: false,
                outcome: "❌ ОТКАЗ ДИСПЕТЧЕРА:\nПотеря груза - нет требуемого оборудования (правильное решение)"
            }
        ],

        // ===== ПУТЬ ОТКАЗ БРОКЕРА #1 - НЕТ MC (2 шага) =====
        brokerReject1: [
            {
                brokerQuestion: "Yes, available.\nWhat's your MC number?",
                dispatcherPrompt: "❌ Брокер спрашивает MC - без него не работают",
                suggestions: [
                    {
                        text: "We're still getting our MC authority.\nShould have it in 3 weeks.\nCan we work without it?\nWe're reliable and have good equipment.",
                        quality: "wrong",
                        path: "brokerReject1"
                    },
                    {
                        text: "MC 556789.\nWe have reefer available.\nDriver in Seattle area.\nTrailer is empty.",
                        quality: "correct",
                        path: "normal"
                    }
                ],
                brokerResponse: "Sorry, I can only work with carriers who have active MC authority.\nThis is a high-value produce load, I need proper insurance and authority.\nCall me back when you get your MC.\nGood luck!",
                isSuccess: false,
                outcome: "❌ ОТКАЗ БРОКЕРА:\nПотеря груза - нет MC номера"
            }
        ],

        // ===== ПУТЬ ОТКАЗ БРОКЕРА #2 - ВОДИТЕЛЬ ДАЛЕКО (3 шага) =====
        brokerReject2: [
            {
                brokerQuestion: "Yes, available but need to cover it fast.\nMC and where's your driver right now?",
                dispatcherPrompt: "❌ Брокер торопится - если водитель далеко, может отказать",
                suggestions: [
                    {
                        text: "MC 556789, driver is currently in Phoenix AZ.\nCan be in Seattle in about 24 hours.\nWe can make the pickup window tomorrow.\nNo problem.",
                        quality: "risky",
                        path: "brokerReject2"
                    },
                    {
                        text: "MC 556789, driver just delivered in Tacoma WA.\nAbout 30 miles from Seattle, trailer empty.\nReady for pickup tomorrow morning.\nEquipment is 2024 Carrier reefer.",
                        quality: "correct",
                        path: "master"
                    }
                ],
                brokerResponse: "Phoenix?\nThat's 1,400 miles away and too risky.\nPickup is tomorrow 6 AM appointment.\nI need someone local who's ready now.\nSorry, can't use you on this one."
            },

            {
                brokerQuestion: "Do you have any other trucks closer to Seattle?",
                dispatcherPrompt: "❌ Последний шанс - если нет, груз потерян",
                suggestions: [
                    {
                        text: "Unfortunately that's our only available reefer right now.\nOur other trucks are committed to other loads.\nSorry we can't help with this one.\nMaybe next time.",
                        quality: "professional_reject"
                    }
                ],
                brokerResponse: "No problem, I understand.\nCall me when you have equipment in the area.\nGood luck!",
                isSuccess: false,
                outcome: "❌ ОТКАЗ БРОКЕРА:\nПотеря груза - водитель слишком далеко"
            }
        ],

        // ===== ПУТЬ ОТКАЗ БРОКЕРА #3 - СТАРОЕ ОБОРУДОВАНИЕ (3 шага) =====
        brokerReject3: [
            {
                brokerQuestion: "What year is your reefer unit?\nShipper requires 2020 or newer for produce.",
                dispatcherPrompt: "❌ Брокер проверяет год оборудования",
                suggestions: [
                    {
                        text: "Our reefer is 2018 model.\nBut it's very well maintained.\nWorks perfectly, no issues.\nCan we still use it?",
                        quality: "wrong",
                        path: "brokerReject3"
                    },
                    {
                        text: "2024 Carrier Transicold unit.\nLess than 5,000 reefer hours.\nRecent service, all maintenance current.\nPerfect condition for produce.",
                        quality: "correct",
                        path: "master"
                    }
                ],
                brokerResponse: "Sorry, 2018 doesn't meet shipper requirements.\nThey require 2020 or newer for insurance and reliability.\nI can't make exceptions on this.\nDo you have any newer reefer units?"
            },

            {
                brokerQuestion: "Any reefers 2020 or newer in your fleet?",
                dispatcherPrompt: "❌ Последний шанс - если нет, груз потерян",
                suggestions: [
                    {
                        text: "Unfortunately all our reefers are 2018-2019 models.\nWe're planning to upgrade next year.\nSorry we can't meet the requirement.\nThank you anyway.",
                        quality: "professional_reject"
                    }
                ],
                brokerResponse: "I understand.\nCall me when you upgrade your equipment.\nGood luck!",
                isSuccess: false,
                outcome: "❌ ОТКАЗ БРОКЕРА:\nПотеря груза - оборудование не соответствует требованиям"
            }
        ],

        // ===== ПУТЬ ОТКАЗ БРОКЕРА #4 - НЕТ TEAM DRIVERS (3 шага) =====
        brokerReject4: [
            {
                brokerQuestion: "This is 3,300 miles in 4 days.\nDo you have team drivers or solo?",
                dispatcherPrompt: "❌ Брокер проверяет возможность выполнения сроков",
                suggestions: [
                    {
                        text: "We have solo driver.\nHe can make it in 4 days with HOS breaks.\nWill drive 650 miles per day.\nShould be fine.",
                        quality: "risky",
                        path: "brokerReject4"
                    },
                    {
                        text: "We have team drivers available.\nThey can run 24/7, about 1,100 miles per day.\n3,300 miles in 3 days easily, 4 days with buffer.\nNo HOS issues.",
                        quality: "correct",
                        path: "master"
                    }
                ],
                brokerResponse: "Solo driver is too risky for this timeline.\n650 miles per day means 5+ days with HOS breaks.\nShipper needs delivery in 4 days maximum.\nI need team drivers for this load.\nSorry, can't use solo."
            },

            {
                brokerQuestion: "Can you get team drivers for this load?",
                dispatcherPrompt: "❌ Последний шанс - если нет team, груз потерян",
                suggestions: [
                    {
                        text: "Unfortunately we don't have team drivers available.\nAll our drivers are solo operators.\nSorry we can't help with this one.\nMaybe on shorter loads.",
                        quality: "professional_reject"
                    }
                ],
                brokerResponse: "No problem, I understand.\nCall me for shorter reefer loads under 1,500 miles.\nGood luck!",
                isSuccess: false,
                outcome: "❌ ОТКАЗ БРОКЕРА:\nПотеря груза - нет team drivers для long haul"
            }
        ],

        // ===== ПУТЬ ОТКАЗ БРОКЕРА #5 - АГРЕССИВНАЯ ЦЕНА (2 шага) =====
        brokerReject5: [
            {
                brokerQuestion: "What rate are you looking for?",
                dispatcherPrompt: "❌ Не требуйте нереальную цену - брокер откажет",
                suggestions: [
                    {
                        text: "I need $11,000 minimum.\nNon-negotiable.\nThat's market rate for reefer cross-country.\nTake it or leave it.",
                        quality: "aggressive",
                        path: "brokerReject5"
                    },
                    {
                        text: "For 3,300 miles with temp monitoring I'm at $9,500.\nThat's $2.88/mile which is fair.\nCovers all costs and ensures perfect delivery.\nDoes that work?",
                        quality: "correct",
                        path: "master"
                    }
                ],
                brokerResponse: "$11,000?\nThat's ridiculous for 3,300 miles!\nMarket rate is $2.50-2.80/mile for this lane.\nI'm not wasting my time with unrealistic rates.\nGood luck finding that!",
                isSuccess: false,
                outcome: "❌ ОТКАЗ БРОКЕРА:\nПотеря груза - нереальная агрессивная цена"
            }
        ]
    }
};

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { masterReeferDialog };
}
