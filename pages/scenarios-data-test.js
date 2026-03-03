const allScenarios = [
    {
        id: 1,
        route: "Los Angeles CA → Dallas TX",
        distance: 1435,
        equipment: "Reefer",
        weight: 44000,
        rate: 4200,
        initialMessage: "Good morning! I'm calling about the LA to Dallas reefer load, #LAX-7823. Is this still available?",
        paths: {
            good: [
                {
                    brokerQuestion: "Yes, it's still available. What's your MC number and can you tell me about your equipment?",
                    suggestions: [
                        { text: "MC 567890. We're a temperature-controlled specialist with 15 years in the business. I have a 2022 Thermo King reefer unit, 53-foot trailer with multi-temp zones. My driver is HACCP certified and currently in LA, ready to load tomorrow morning. We run this lane 3-4 times per month.", quality: "good" },
                        { text: "MC 567890. We have a reefer trailer available with temperature control.", quality: "normal" },
                        { text: "Uh... MC 567890. We have a reefer... I think it works fine.", quality: "bad" }
                    ],
                    brokerResponse: [
                        "Excellent! Let me pull up your information.",
                        "OK, MC 567890 verified. I see you have a 99% safety rating and excellent on-time delivery record.",
                        "This is a high-value pharmaceutical shipment - 44,000 pounds that needs to maintain 2-8°C throughout transit.",
                        "Pickup is tomorrow at 6 AM at PharmaCorp Distribution in LA.",
                        "Delivery must be completed within 48 hours at MedSupply Warehouse in Dallas.",
                        "The shipper requires real-time temperature monitoring and will need data logs upon delivery.",
                        "Can your equipment handle these requirements?"
                    ]
                },
                {
                    brokerQuestion: "Perfect. This is a premium load with strict requirements. What rate are you looking for?",
                    suggestions: [
                        { text: "Given the 1,435 miles, pharmaceutical cargo requiring constant 2-8°C, 48-hour delivery window, and team driver operation, I'm looking at $4,500. That's $3.14 per mile. With fuel costs, insurance for high-value pharma, and the need for continuous monitoring, this is a fair rate for the risk and responsibility involved.", quality: "good" },
                        { text: "I'm thinking $4,500 for this load.", quality: "normal" },
                        { text: "What's your budget? I need at least $5,000 for pharma.", quality: "bad" }
                    ],
                    brokerResponse: [
                        "I understand the complexity and risk with pharmaceutical freight.",
                        "The shipper has budgeted $4,200 for this load.",
                        "However, this is a weekly contract - we move 4-6 pharmaceutical loads per week on this lane.",
                        "If you perform well, I can guarantee you 2-3 loads per week at similar rates.",
                        "Plus, the shipper pays a $500 bonus for perfect temperature compliance.",
                        "Can you work with $4,200 plus the potential bonus?"
                    ]
                },
                {
                    brokerQuestion: "How about we do $4,350 for this first load? If temperature logs are perfect and delivery is on time, you'll get the $500 bonus, making it $4,850 total. Plus, I'll put you on our preferred carrier list for all LA-Dallas pharma runs.",
                    suggestions: [
                        { text: "You know what, $4,350 plus the $500 bonus opportunity works for me. That's $4,850 if we execute perfectly, which we will. My driver has 8 years of pharma experience and we've never had a temperature deviation. Let's book it. Can you send the rate confirmation with the bonus terms clearly stated?", quality: "good" },
                        { text: "OK, $4,350 plus bonus is acceptable. Let's proceed.", quality: "normal" },
                        { text: "I guess $4,350 will have to do... but I really wanted $4,500.", quality: "bad" }
                    ],
                    brokerResponse: [
                        "Fantastic! I really appreciate your professionalism and understanding.",
                        "I'm sending the rate confirmation now with the $500 bonus clause included.",
                        "Pickup is at PharmaCorp Distribution, 8900 Wilshire Blvd, LA. Contact is Dr. Sarah Chen, her number is on the rate con.",
                        "You'll need to arrive 30 minutes early for equipment inspection and seal verification.",
                        "Delivery is at MedSupply Warehouse, 4500 Commerce St, Dallas. Ask for Mike Rodriguez at receiving.",
                        "They'll download your temperature data logs and inspect the seals.",
                        "I'm adding you to our pharma preferred list. You'll be my first call for these high-value loads.",
                        "Thanks for being a true professional!"
                    ],
                    isSuccess: true
                }
            ],
            normal: [
                {
                    brokerQuestion: "Yes, it's available. What's your MC number?",
                    suggestions: [
                        { text: "MC 567890. We have reefer equipment and run this route regularly.", quality: "good" },
                        { text: "MC 567890. We have a reefer available.", quality: "normal" },
                        { text: "Let me find it... MC 567890.", quality: "bad" }
                    ],
                    brokerResponse: [
                        "OK, let me verify you in the system.",
                        "Alright, I see your MC 567890.",
                        "This is pharmaceutical freight requiring 2-8°C constant temperature.",
                        "Do you have temperature monitoring equipment?",
                        "And can you provide data logs upon delivery?"
                    ]
                },
                {
                    brokerQuestion: "Good. This is 1,435 miles, 44,000 pounds of pharmaceuticals. Pickup tomorrow at 6 AM, delivery within 48 hours. What rate are you looking for?",
                    suggestions: [
                        { text: "For pharmaceutical freight with strict temperature control over 1,435 miles, I'm looking at $4,400. That accounts for the specialized equipment and monitoring required.", quality: "good" },
                        { text: "I was thinking around $4,400.", quality: "normal" },
                        { text: "What can you pay? I need to cover my costs.", quality: "bad" }
                    ],
                    brokerResponse: [
                        "I appreciate the quote.",
                        "The shipper has budgeted $4,200 for this load.",
                        "I might be able to go up to $4,250, but that's really pushing it.",
                        "This is a regular customer with weekly loads.",
                        "Can you do $4,250?"
                    ]
                },
                {
                    brokerQuestion: "So $4,250 is my final offer. There's also a $500 bonus for perfect temperature compliance. Take it or leave it.",
                    suggestions: [
                        { text: "Alright, $4,250 plus the bonus works. Let's book it. Send me the rate confirmation with bonus terms.", quality: "good" },
                        { text: "OK, $4,250 is fine. Let's proceed.", quality: "normal" },
                        { text: "Can't you do $4,300? But fine, $4,250.", quality: "bad" }
                    ],
                    brokerResponse: [
                        "Great, I'll send the rate confirmation right now.",
                        "Pickup is at PharmaCorp Distribution in LA tomorrow at 6 AM.",
                        "Delivery is at MedSupply Warehouse in Dallas within 48 hours.",
                        "Make sure your temperature monitoring is working properly.",
                        "If this goes well, I'll call you for more pharma loads."
                    ],
                    isSuccess: true
                }
            ],
            bad: [
                {
                    brokerQuestion: "Yes, it's available. What's your MC number?",
                    suggestions: [
                        { text: "MC 567890. We have reefer equipment.", quality: "good" },
                        { text: "MC 567890.", quality: "normal" },
                        { text: "Uh... I think it's... wait... 567890? Let me check...", quality: "bad" }
                    ],
                    brokerResponse: [
                        "OK... let me look you up.",
                        "Hmm, I'm seeing some concerns here.",
                        "Your safety score is only 78%.",
                        "And I see you had a temperature deviation incident 3 months ago.",
                        "This is high-value pharmaceuticals - I need carriers with perfect records.",
                        "I'm not comfortable with this..."
                    ]
                },
                {
                    brokerQuestion: "What rate are you looking for? And can you guarantee perfect temperature control?",
                    suggestions: [
                        { text: "I'm looking at $4,600, and yes, we can maintain temperature. We've improved our processes since that incident.", quality: "good" },
                        { text: "Around $4,600. We'll do our best with temperature.", quality: "normal" },
                        { text: "I need at least $5,000. And I can't guarantee anything - equipment fails sometimes, you know?", quality: "bad" }
                    ],
                    brokerResponse: [
                        "$5,000 is way too high, and 'can't guarantee anything' is unacceptable.",
                        "This shipper has zero tolerance for temperature deviations.",
                        "One mistake could cost them millions in spoiled product.",
                        "I need carriers who are confident in their equipment and processes.",
                        "I'm going to go with another carrier. Thanks for calling."
                    ],
                    isSuccess: false
                }
            ]
        }
    },
    {
        id: 2,
        route: "Seattle WA → Miami FL",
        distance: 3334,
        equipment: "Dry Van",
        weight: 42000,
        rate: 8500,
        initialMessage: "Good afternoon! I'm calling about the Seattle to Miami cross-country load, #SEA-4429. Is this still open?",
        paths: {
            good: [
                {
                    brokerQuestion: "Yes, it's open. This is a long haul - what's your MC number and tell me about your operation?",
                    suggestions: [
                        { text: "MC 234567. We're a long-haul specialist with a team driver operation. Both drivers are DOT certified with clean records, and we have a 2023 Freightliner with a 53-foot dry van, air ride suspension, and GPS tracking. We run coast-to-coast regularly and average 600 miles per day with our team. Currently in Seattle area, ready to load day after tomorrow.", quality: "good" },
                        { text: "MC 234567. We have team drivers and run long distances.", quality: "normal" },
                        { text: "MC 234567. We can do long hauls.", quality: "bad" }
                    ],
                    brokerResponse: [
                        "Excellent! Let me verify your information.",
                        "OK, MC 234567 confirmed. I see you have a 97% safety rating and strong on-time performance.",
                        "This is a 3,334-mile cross-country haul with 42,000 pounds of consumer electronics.",
                        "Pickup is day after tomorrow at 5 AM at TechHub Warehouse in Seattle.",
                        "Delivery must be completed within 6 days at Electronics Depot in Miami.",
                        "The shipper requires daily check-in calls and GPS tracking throughout transit.",
                        "Can your team handle this timeline and the communication requirements?"
                    ]
                },
                {
                    brokerQuestion: "Great. This is a premium cross-country load with high-value cargo. What rate are you looking for?",
                    suggestions: [
                        { text: "For 3,334 miles cross-country with team drivers, high-value electronics, 6-day delivery window, and daily reporting requirements, I'm looking at $9,000. That's $2.70 per mile. When you factor in team driver wages, fuel costs across multiple states, tolls, and the coordination required, this is a competitive rate for the service level you're getting.", quality: "good" },
                        { text: "I'm thinking $9,000 for this load.", quality: "normal" },
                        { text: "What's your budget? I need to make sure it's worth the trip.", quality: "bad" }
                    ],
                    brokerResponse: [
                        "I understand the complexity of a cross-country team operation.",
                        "The shipper has budgeted $8,500 for this load.",
                        "However, this is a monthly contract - we move 8-10 cross-country loads per month.",
                        "If you perform well, I can guarantee you 2 loads per month at similar rates.",
                        "Plus, I have a backhaul from Miami to Atlanta, 660 miles at $1,800 that picks up the day after you deliver.",
                        "Can you work with $8,500 plus the backhaul opportunity?"
                    ]
                },
                {
                    brokerQuestion: "How about we do $8,750 for this load? Plus the Miami to Atlanta backhaul at $1,800. That's $10,550 total for the round trip. And I'll put you on our preferred carrier list for all cross-country runs.",
                    suggestions: [
                        { text: "You know what, $8,750 plus the $1,800 backhaul works perfectly. That's $10,550 total, which makes the economics work well for a team operation. My drivers prefer having loads both ways rather than deadheading back. Let's book both loads. Can you send both rate confirmations with all the check-in requirements clearly outlined?", quality: "good" },
                        { text: "OK, $8,750 plus backhaul is acceptable. Let's proceed.", quality: "normal" },
                        { text: "I really wanted $9,000... but I guess $8,750 plus backhaul is OK.", quality: "bad" }
                    ],
                    brokerResponse: [
                        "Perfect! I really appreciate your flexibility and professionalism.",
                        "I'm sending both rate confirmations now with all requirements detailed.",
                        "Pickup is at TechHub Warehouse, 12500 Aurora Ave N, Seattle. Contact is Tom Williams, his number is on the rate con.",
                        "You'll need to arrive 1 hour early for load inspection and securement verification.",
                        "Delivery is at Electronics Depot, 8800 NW 36th St, Miami. Ask for Carlos Martinez at receiving.",
                        "Please call me daily at 2 PM Eastern with your location and ETA updates.",
                        "The Miami to Atlanta backhaul picks up at Import Distributors, details on the second rate con.",
                        "I'm adding you to our cross-country preferred list. You'll be my go-to for these premium long hauls.",
                        "Thanks for being a true professional partner!"
                    ],
                    isSuccess: true
                }
            ],
            normal: [
                {
                    brokerQuestion: "Yes, it's open. What's your MC number?",
                    suggestions: [
                        { text: "MC 234567. We run long-haul routes with team drivers.", quality: "good" },
                        { text: "MC 234567. We can handle long distances.", quality: "normal" },
                        { text: "Let me find it... MC 234567.", quality: "bad" }
                    ],
                    brokerResponse: [
                        "OK, let me verify you in the system.",
                        "Alright, I see your MC 234567.",
                        "This is 3,334 miles cross-country with electronics.",
                        "Do you have team drivers for this?",
                        "And can you deliver within 6 days?"
                    ]
                },
                {
                    brokerQuestion: "Good. This is 3,334 miles, 42,000 pounds. Pickup day after tomorrow at 5 AM, delivery within 6 days. What rate are you looking for?",
                    suggestions: [
                        { text: "For a cross-country team operation over 3,334 miles, I'm looking at $8,800. That's fair for the distance and timeline.", quality: "good" },
                        { text: "I was thinking around $8,800.", quality: "normal" },
                        { text: "What can you pay? I need to cover costs.", quality: "bad" }
                    ],
                    brokerResponse: [
                        "I appreciate the quote.",
                        "The shipper has budgeted $8,500 for this load.",
                        "I might be able to go up to $8,600, but that's really my limit.",
                        "This is a regular customer with monthly loads.",
                        "Can you do $8,600?"
                    ]
                },
                {
                    brokerQuestion: "So $8,600 is my final offer. Plus there's a backhaul from Miami to Atlanta at $1,800. Take it or leave it.",
                    suggestions: [
                        { text: "Alright, $8,600 plus the backhaul works. Let's book both. Send me the rate confirmations.", quality: "good" },
                        { text: "OK, $8,600 is fine. Let's proceed.", quality: "normal" },
                        { text: "Can't you do $8,700? But fine, $8,600.", quality: "bad" }
                    ],
                    brokerResponse: [
                        "Great, I'll send both rate confirmations right now.",
                        "Pickup is at TechHub Warehouse in Seattle day after tomorrow at 5 AM.",
                        "Delivery is at Electronics Depot in Miami within 6 days.",
                        "Call me daily with location updates.",
                        "If this goes well, I'll call you for more cross-country loads."
                    ],
                    isSuccess: true
                }
            ],
            bad: [
                {
                    brokerQuestion: "Yes, it's open. What's your MC number?",
                    suggestions: [
                        { text: "MC 234567. We can do long hauls.", quality: "good" },
                        { text: "MC 234567.", quality: "normal" },
                        { text: "Uh... I think it's... wait... 234567? Let me double check...", quality: "bad" }
                    ],
                    brokerResponse: [
                        "OK... let me look you up.",
                        "Hmm, I'm seeing some issues.",
                        "Your safety score is only 82%.",
                        "And I see you had two late deliveries in the past 3 months.",
                        "This is high-value electronics with a strict delivery window.",
                        "I'm not sure you're the right fit..."
                    ]
                },
                {
                    brokerQuestion: "What rate are you looking for? And can you guarantee on-time delivery?",
                    suggestions: [
                        { text: "I'm looking at $9,200, and yes, we can deliver on time. We've improved our processes.", quality: "good" },
                        { text: "Around $9,200. We'll try our best to be on time.", quality: "normal" },
                        { text: "I need at least $10,000. And I can't guarantee anything - traffic, weather, breakdowns happen.", quality: "bad" }
                    ],
                    brokerResponse: [
                        "$10,000 is way too high, and 'can't guarantee anything' is unacceptable.",
                        "This shipper has zero tolerance for late deliveries.",
                        "One late delivery could cost them thousands in penalties.",
                        "I need carriers who are confident and reliable.",
                        "I'm going to go with another carrier. Thanks for calling."
                    ],
                    isSuccess: false
                }
            ]
        }
    },
    {
        id: 3,
        route: "Chicago IL → New York NY",
        distance: 790,
        equipment: "Flatbed",
        weight: 48000,
        rate: 2400,
        initialMessage: "Good morning! I'm calling about the Chicago to New York flatbed load, #CHI-8834. Is this still available?",
        paths: {
            good: [
                {
                    brokerQuestion: "Yes, it's available. What's your MC number and what flatbed equipment do you have?",
                    suggestions: [
                        { text: "MC 890123. We specialize in heavy equipment and oversized loads. I have a 53-foot flatbed with 20 chains, 10 straps, 8 corner protectors, and tarps. My driver is certified in load securement and has 12 years of flatbed experience. We're currently in Chicago, ready to load tomorrow morning. We run this lane twice a month.", quality: "good" },
                        { text: "MC 890123. We have a flatbed with chains and straps.", quality: "normal" },
                        { text: "MC 890123. We have a flatbed trailer.", quality: "bad" }
                    ],
                    brokerResponse: [
                        "Excellent! Let me verify your information.",
                        "OK, MC 890123 confirmed. I see you have a 98% safety rating and excellent securement records.",
                        "This is a 790-mile haul with 48,000 pounds of steel construction beams.",
                        "Pickup is tomorrow at 7 AM at Industrial Steel in Chicago.",
                        "Delivery must be completed within 2 days at Metro Construction in New York.",
                        "The load requires tarping and will need 16 chains minimum for proper securement.",
                        "The shipper will inspect your securement before you leave and at delivery.",
                        "Can you handle these requirements?"
                    ]
                },
                {
                    brokerQuestion: "Perfect. This is a heavy flatbed load with strict securement requirements. What rate are you looking for?",
                    suggestions: [
                        { text: "For 790 miles with 48,000 pounds of steel beams, requiring tarping and extensive securement, I'm looking at $2,600. That's $3.29 per mile. When you factor in the time for proper securement, tarping, the weight, and the liability of hauling steel, this is a fair rate. Plus, I-80 tolls through Pennsylvania add up significantly.", quality: "good" },
                        { text: "I'm thinking $2,600 for this load.", quality: "normal" },
                        { text: "What's your budget? I need to make sure it covers my costs.", quality: "bad" }
                    ],
                    brokerResponse: [
                        "I understand the complexity and time involved with proper flatbed securement.",
                        "The shipper has budgeted $2,400 for this load.",
                        "However, this is a bi-weekly contract - we move 6-8 flatbed loads per month on this lane.",
                        "If you perform well, I can guarantee you 2-3 loads per month at similar rates.",
                        "Plus, the shipper pays a $300 bonus for perfect securement with no violations.",
                        "Can you work with $2,400 plus the potential bonus?"
                    ]
                },
                {
                    brokerQuestion: "How about we do $2,500 for this first load? If securement is perfect and delivery is on time, you'll get the $300 bonus, making it $2,800 total. Plus, I'll put you on our preferred flatbed carrier list.",
                    suggestions: [
                        { text: "You know what, $2,500 plus the $300 bonus opportunity works for me. That's $2,800 if we execute perfectly, which we will. My driver takes pride in his securement - we've never had a violation in 12 years. Let's book it. Can you send the rate confirmation with the bonus terms and securement requirements clearly stated?", quality: "good" },
                        { text: "OK, $2,500 plus bonus is acceptable. Let's proceed.", quality: "normal" },
                        { text: "I guess $2,500 will have to do... but I really wanted $2,600.", quality: "bad" }
                    ],
                    brokerResponse: [
                        "Fantastic! I really appreciate your professionalism and confidence.",
                        "I'm sending the rate confirmation now with the $300 bonus clause and securement specs included.",
                        "Pickup is at Industrial Steel, 5600 W 65th St, Chicago. Contact is Frank Johnson, his number is on the rate con.",
                        "You'll need to arrive 1 hour early for load securement and inspection.",
                        "The shipper will take photos of your securement before you leave.",
                        "Delivery is at Metro Construction, 450 W 33rd St, New York. Ask for Tony Russo at receiving.",
                        "They'll inspect securement upon arrival and take photos for documentation.",
                        "I'm adding you to our flatbed preferred list. You'll be my first call for heavy loads.",
                        "Thanks for being a true professional!"
                    ],
                    isSuccess: true
                }
            ],
            normal: [
                {
                    brokerQuestion: "Yes, it's available. What's your MC number?",
                    suggestions: [
                        { text: "MC 890123. We have flatbed equipment and run this route.", quality: "good" },
                        { text: "MC 890123. We have a flatbed available.", quality: "normal" },
                        { text: "Let me find it... MC 890123.", quality: "bad" }
                    ],
                    brokerResponse: [
                        "OK, let me verify you in the system.",
                        "Alright, I see your MC 890123.",
                        "This is steel beams requiring tarping and heavy securement.",
                        "Do you have enough chains and straps?",
                        "And is your driver experienced with load securement?"
                    ]
                },
                {
                    brokerQuestion: "Good. This is 790 miles, 48,000 pounds of steel beams. Pickup tomorrow at 7 AM, delivery within 2 days. What rate are you looking for?",
                    suggestions: [
                        { text: "For flatbed with heavy steel and tarping over 790 miles, I'm looking at $2,550. That's fair for the securement work required.", quality: "good" },
                        { text: "I was thinking around $2,550.", quality: "normal" },
                        { text: "What can you pay? I need to cover costs.", quality: "bad" }
                    ],
                    brokerResponse: [
                        "I appreciate the quote.",
                        "The shipper has budgeted $2,400 for this load.",
                        "I might be able to go up to $2,450, but that's really my limit.",
                        "This is a regular customer with bi-weekly loads.",
                        "Can you do $2,450?"
                    ]
                },
                {
                    brokerQuestion: "So $2,450 is my final offer. There's also a $300 bonus for perfect securement. Take it or leave it.",
                    suggestions: [
                        { text: "Alright, $2,450 plus the bonus works. Let's book it. Send me the rate confirmation with securement requirements.", quality: "good" },
                        { text: "OK, $2,450 is fine. Let's proceed.", quality: "normal" },
                        { text: "Can't you do $2,500? But fine, $2,450.", quality: "bad" }
                    ],
                    brokerResponse: [
                        "Great, I'll send the rate confirmation right now.",
                        "Pickup is at Industrial Steel in Chicago tomorrow at 7 AM.",
                        "Delivery is at Metro Construction in New York within 2 days.",
                        "Make sure your securement meets DOT standards.",
                        "If this goes well, I'll call you for more flatbed loads."
                    ],
                    isSuccess: true
                }
            ],
            bad: [
                {
                    brokerQuestion: "Yes, it's available. What's your MC number?",
                    suggestions: [
                        { text: "MC 890123. We have flatbed equipment.", quality: "good" },
                        { text: "MC 890123.", quality: "normal" },
                        { text: "Uh... I think it's... wait... 890123? Let me check...", quality: "bad" }
                    ],
                    brokerResponse: [
                        "OK... let me look you up.",
                        "Hmm, I'm seeing some concerns here.",
                        "Your safety score is only 79%.",
                        "And I see you had a securement violation 2 months ago.",
                        "This is heavy steel with strict securement requirements.",
                        "I'm not comfortable with this..."
                    ]
                },
                {
                    brokerQuestion: "What rate are you looking for? And can you guarantee proper securement?",
                    suggestions: [
                        { text: "I'm looking at $2,700, and yes, we can secure it properly. We've improved since that violation.", quality: "good" },
                        { text: "Around $2,700. We'll do our best with securement.", quality: "normal" },
                        { text: "I need at least $3,000. And I can't guarantee anything - securement is tricky, you know?", quality: "bad" }
                    ],
                    brokerResponse: [
                        "$3,000 is way too high, and 'can't guarantee anything' is unacceptable.",
                        "This shipper has zero tolerance for securement violations.",
                        "One violation could shut down the entire job site.",
                        "I need carriers who are confident in their securement skills.",
                        "I'm going to go with another carrier. Thanks for calling."
                    ],
                    isSuccess: false
                }
            ]
        }
    }
];
