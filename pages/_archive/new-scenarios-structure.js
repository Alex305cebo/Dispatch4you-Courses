// NEW SCENARIO STRUCTURE - Professional Dispatcher-Broker Conversations
// Dispatcher initiates, Broker responds and tries to sell the load

const newScenarios = [
  // SCENARIO 1: Los Angeles CA в†’ Phoenix AZ (373 miles, Dry Van)
  // Base rate: $1.85/mile = $690 total
  // Success range: $2.13-2.31/mile ($795-$862) = +15-25%
  {
    id: 1,
    route: "Los Angeles CA в†’ Phoenix AZ",
    distance: 373,
    equipment: "Dry Van",
    weight: "42,000 lbs",
    baseRate: 1.85,
    baseTotalRate: 690,
    successRateMin: 2.13, // +15%
    successRateMax: 2.31, // +25%
    
    conversation: [
      {
        // Step 1: Dispatcher greeting and inquiry
        dispatcherPrompt: "Greet the broker and ask if the load is available",
        dispatcherSuggestions: [
          { text: "Hi! I'm calling about your LA to Phoenix load. Is it still available?", quality: "good" },
          { text: "Hello, this is [Name] from [Company]. I saw your posting for LA-Phoenix. Still open?", quality: "good" },
          { text: "Hey, you got that LA load?", quality: "bad" }
        ],
        brokerResponse: "Yes, it's still available! It's a 373-mile run from Los Angeles to Phoenix. 42,000 lbs dry van freight. Pickup tomorrow morning, delivery same day by 6 PM. Are you interested?"
      },
      
      {
        // Step 2: Ask about rate
        dispatcherPrompt: "Ask about the rate for this load",
        dispatcherSuggestions: [
          { text: "What's your rate on this?", quality: "good" },
          { text: "Can you tell me the rate and any additional details?", quality: "good" },
          { text: "How much you paying?", quality: "normal" }
        ],
        brokerResponse: "I'm offering $1.85 per mile, so that's $690 total for the 373 miles. It's a straightforward run on I-10, should take about 6 hours. The shipper is reliable, and we have a good relationship with them."
      },
      
      {
        // Step 3: Ask about factoring
        dispatcherPrompt: "Ask which factoring company the broker works with",
        dispatcherSuggestions: [
          { text: "What factoring company do you work with? We only work through factoring.", quality: "good" },
          { text: "Which factoring are you set up with? That's how we get paid.", quality: "good" },
          { text: "Do you work with factoring? We need to verify that first.", quality: "good" },
          { text: "What factoring?", quality: "normal" },
          { text: "Factoring?", quality: "bad" }
        ],
        brokerResponse: "We work with RTS Financial, RTS Pro, Triumph Business Capital, and Saint John Capital. Which one do you use? I can verify we're in their system right now."
      },
      
      {
        // Step 4: Negotiate rate
        dispatcherPrompt: "Confirm factoring and negotiate for a better rate",
        dispatcherSuggestions: [
          { text: "Can you do $2.20 per mile? That's $820 total.", quality: "good" }, // +19% - SUCCESS
          { text: "I need at least $2.30 per mile to make this work.", quality: "good" }, // +24% - SUCCESS
          { text: "That's too low. I need $2.50 per mile.", quality: "bad" }, // +35% - REJECT
          { text: "Can you bump it up to $2.00 per mile?", quality: "normal" } // +8% - COUNTER
        ],
        brokerResponses: {
          success: "You know what, I can work with that. Let me check with my manager... Okay, approved! I can do $[RATE] per mile. That's a fair rate for both of us. Let's book it! What's your MC number?",
          counter: "I appreciate the offer, but $2.00 is below what I can do. How about we meet in the middle at $2.10 per mile? That's $784 total. It's the best I can offer on this one.",
          reject: "I understand you need to make money, but $2.50 per mile is way above market rate for this lane. The highest I can go is $2.05 per mile. If that doesn't work, I'll need to move on to other carriers."
        }
      },
      
      {
        // Step 5: Booking or decline
        dispatcherPrompt: "Accept the rate and provide MC number, or decline",
        dispatcherSuggestions: [
          { text: "Perfect! We use RTS Financial. Deal! MC is 123456. Email: dispatch@company.com", quality: "good" },
          { text: "Good, we're with Triumph. MC# 123456, driver will be ready tomorrow.", quality: "good" },
          { text: "We use OTR Solutions. Sounds good. MC 123456, email: ops@transport.com", quality: "good" },
          { text: "Sorry, I'll have to pass on this one. Thanks anyway!", quality: "normal" },
          { text: "Nah, too low for me.", quality: "bad" }
        ],
        brokerResponses: {
          accept: "Perfect! I'm sending the rate confirmation to your email right now. Pickup is at 123 Industrial Way, LA, CA 90001 tomorrow at 8 AM. Contact is Mike at 555-0100. Delivery at 456 Warehouse Blvd, Phoenix AZ 85001 by 6 PM. Safe travels!",
          decline: "No problem, I understand. Thanks for your time! If you're looking for other loads in the future, feel free to reach out. Have a great day!"
        }
      }
    ]
  },

  // SCENARIO 2: Chicago IL в†’ Atlanta GA (716 miles, Reefer, Temperature Controlled)
  // Base rate: $2.40/mile = $1,718 total
  // Success range: $2.76-3.00/mile ($1,976-$2,148) = +15-25%
  {
    id: 2,
    route: "Chicago IL в†’ Atlanta GA",
    distance: 716,
    equipment: "Reefer (Temperature Controlled)",
    weight: "38,000 lbs",
    temperature: "34-38В°F",
    baseRate: 2.40,
    baseTotalRate: 1718,
    successRateMin: 2.76,
    successRateMax: 3.00,
    
    conversation: [
      {
        dispatcherPrompt: "Greet and ask about the reefer load",
        dispatcherSuggestions: [
          { text: "Good morning! Calling about your Chicago to Atlanta reefer load. Is it available?", quality: "good" },
          { text: "Hi, I have a reefer truck available. Tell me about the Chicago-Atlanta run.", quality: "good" },
          { text: "Got a reefer load?", quality: "bad" }
        ],
        brokerResponse: "Good morning! Yes, the load is available. It's 716 miles from Chicago to Atlanta, temperature-controlled freight at 34-38В°F. 38,000 lbs of produce. Pickup is tomorrow at 6 AM, delivery in 2 days by noon. Do you have a reefer unit available?"
      },
      
      {
        dispatcherPrompt: "Confirm equipment and ask about rate",
        dispatcherSuggestions: [
          { text: "Yes, I have a reefer with temp control. What's the rate?", quality: "good" },
          { text: "My reefer is ready. What are you offering for this run?", quality: "good" },
          { text: "Yeah got reefer. How much?", quality: "normal" }
        ],
        brokerResponse: "Great! I'm offering $2.40 per mile, which comes to $1,718 total. This is produce, so it's time-sensitive. The shipper is very reliable - they load fast, usually within 30 minutes. The receiver in Atlanta is also good, no detention issues."
      },
      
      {
        dispatcherPrompt: "Negotiate the rate",
        dispatcherSuggestions: [
          { text: "Can you do $2.85 per mile? That's $2,041 for the run.", quality: "good" }, // +19%
          { text: "I need $2.95 per mile for reefer. That's $2,112 total.", quality: "good" }, // +23%
          { text: "Reefer rates are higher. I need $3.20 per mile minimum.", quality: "bad" }, // +33%
          { text: "Can we do $2.60 per mile?", quality: "normal" } // +8%
        ],
        brokerResponses: {
          success: "I hear you on reefer costs - fuel and maintenance aren't cheap. Let me see what I can do... Alright, I got approval for $[RATE] per mile. That's $[TOTAL] total. It's a good rate for this lane. Can we book it?",
          counter: "$2.60 is a bit low for what I can offer. How about $2.70 per mile? That's $1,933 total. It's fair considering the quick load time and reliable shipper. What do you think?",
          reject: "I understand reefer costs more, but $3.20 per mile is above our budget for this lane. The absolute maximum I can do is $2.75 per mile. If that doesn't work, I'll need to find another carrier."
        }
      },
      
      {
        dispatcherPrompt: "Accept or decline the offer",
        dispatcherSuggestions: [
          { text: "Let's do it! MC 789012, email: dispatch@logistics.com", quality: "good" },
          { text: "Sounds fair. Book it. MC# 789012", quality: "good" },
          { text: "I'll pass, thanks.", quality: "normal" },
          { text: "Nope, too low.", quality: "bad" }
        ],
        brokerResponses: {
          accept: "Excellent! Rate con is on its way to dispatch@logistics.com. Pickup: 789 Cold Storage Dr, Chicago IL 60601, tomorrow 6 AM. Contact: Sarah 555-0200. Delivery: 321 Distribution Center, Atlanta GA 30301, day after tomorrow by noon. Keep that temp at 34-38В°F!",
          decline: "No worries, I appreciate you taking the time. If you need loads in the future, give me a call. Good luck out there!"
        }
      }
    ]
  }
];

// This is just 2 scenarios as example. I'll create 8 more with:
// - Different routes and distances
// - Various equipment types (Dry Van, Reefer, Flatbed)
// - Different negotiation scenarios
// - Success and failure paths
// - Realistic market rates by region

  // SCENARIO 3: Dallas TX в†’ Houston TX (239 miles, Dry Van, Short Haul)
  // Base rate: $2.10/mile = $502 total
  // Success range: $2.42-2.63/mile ($578-$628) = +15-25%
  {
    id: 3,
    route: "Dallas TX в†’ Houston TX",
    distance: 239,
    equipment: "Dry Van",
    weight: "28,000 lbs",
    baseRate: 2.10,
    baseTotalRate: 502,
    successRateMin: 2.42,
    successRateMax: 2.63,
    
    conversation: [
      {
        dispatcherPrompt: "Call about the short haul Dallas-Houston load",
        dispatcherSuggestions: [
          { text: "Hi! I'm interested in your Dallas to Houston run. Is it still open?", quality: "good" },
          { text: "Hello, calling about the DFW-Houston load. What are the details?", quality: "good" },
          { text: "You got Dallas load?", quality: "bad" }
        ],
        brokerResponse: "Yes, it's available! Short haul, 239 miles from Dallas to Houston. 28,000 lbs dry van. Pickup this afternoon at 2 PM, delivery tomorrow morning by 8 AM. It's a quick turnaround. Interested?"
      },
      
      {
        dispatcherPrompt: "Ask about the rate",
        dispatcherSuggestions: [
          { text: "What's the rate for this short haul?", quality: "good" },
          { text: "Sounds good. What are you paying?", quality: "good" },
          { text: "Rate?", quality: "bad" }
        ],
        brokerResponse: "I'm offering $2.10 per mile, so $502 total. I know it's a short run, but it's a reliable shipper and the receiver unloads fast - usually under an hour. Plus you can get another load out of Houston right after."
      },
      
      {
        dispatcherPrompt: "Negotiate for better rate",
        dispatcherSuggestions: [
          { text: "Can you do $2.50 per mile? That's $598 total.", quality: "good" }, // +19%
          { text: "I need $2.60 per mile for short hauls. That's $622.", quality: "good" }, // +24%
          { text: "Short hauls cost more. I need $3.00 per mile.", quality: "bad" }, // +43%
          { text: "How about $2.30 per mile?", quality: "normal" } // +10%
        ],
        brokerResponses: {
          success: "You make a good point about short haul economics. Let me talk to my manager... Okay, I can do $[RATE] per mile, so $[TOTAL] total. That's fair for a quick run. Let's book it!",
          counter: "$2.30 is close, but I can go to $2.40 per mile - that's $574 total. It's the best I can do, but you'll be done by tomorrow morning and can grab another load. Deal?",
          reject: "I understand short hauls have different economics, but $3.00 per mile is too high for this lane. Maximum I can offer is $2.45 per mile. If that doesn't work, I'll need to call the next carrier on my list."
        }
      },
      
      {
        dispatcherPrompt: "Accept or decline",
        dispatcherSuggestions: [
          { text: "Deal! MC 345678, email: ops@transport.com", quality: "good" },
          { text: "Let's do it. MC# 345678", quality: "good" },
          { text: "I'll pass, thanks.", quality: "normal" }
        ],
        brokerResponses: {
          accept: "Perfect! Rate con coming to ops@transport.com. Pickup: 555 Distribution Pkwy, Dallas TX 75201, today 2 PM. Contact: Tom 555-0300. Delivery: 888 Logistics Ln, Houston TX 77001, tomorrow by 8 AM. Quick and easy!",
          decline: "No problem! Thanks for your time. Hit me up if you need loads in Texas. Have a good one!"
        }
      }
    ]
  },

  // SCENARIO 4: Seattle WA в†’ Portland OR (173 miles, Reefer, Frozen)
  // Base rate: $2.80/mile = $484 total
  // Success range: $3.22-3.50/mile ($557-$606) = +15-25%
  {
    id: 4,
    route: "Seattle WA в†’ Portland OR",
    distance: 173,
    equipment: "Reefer (Frozen)",
    weight: "44,000 lbs",
    temperature: "-10В°F",
    baseRate: 2.80,
    baseTotalRate: 484,
    successRateMin: 3.22,
    successRateMax: 3.50,
    
    conversation: [
      {
        dispatcherPrompt: "Inquire about the frozen reefer load",
        dispatcherSuggestions: [
          { text: "Good afternoon! I have a reefer for your Seattle-Portland frozen load. Available?", quality: "good" },
          { text: "Hi, calling about the frozen freight to Portland. Still need a truck?", quality: "good" },
          { text: "Got frozen load?", quality: "bad" }
        ],
        brokerResponse: "Good afternoon! Yes, definitely still need a truck. It's 173 miles Seattle to Portland, frozen freight at -10В°F. 44,000 lbs of frozen food products. Pickup tonight at 10 PM, delivery tomorrow by 6 AM. Can your reefer handle -10В°F?"
      },
      
      {
        dispatcherPrompt: "Confirm capability and ask rate",
        dispatcherSuggestions: [
          { text: "Yes, my reefer goes down to -20В°F. What's your rate?", quality: "good" },
          { text: "No problem with -10В°F. What are you offering?", quality: "good" },
          { text: "Yeah. How much?", quality: "normal" }
        ],
        brokerResponse: "Excellent! I'm offering $2.80 per mile, which is $484 total. I know it's a short run, but it's frozen freight with tight temperature control. The shipper is very particular about temp logs, so make sure your unit is calibrated. They're fast loaders though."
      },
      
      {
        dispatcherPrompt: "Negotiate the rate",
        dispatcherSuggestions: [
          { text: "Frozen freight costs more. Can you do $3.30 per mile? That's $571.", quality: "good" }, // +18%
          { text: "I need $3.45 per mile for frozen. That's $597 total.", quality: "good" }, // +23%
          { text: "Frozen loads are $4.00 per mile minimum.", quality: "bad" }, // +43%
          { text: "Can we do $3.00 per mile?", quality: "normal" } // +7%
        ],
        brokerResponses: {
          success: "You're right, frozen freight has higher operating costs. Let me check... Alright, I can do $[RATE] per mile, so $[TOTAL] total. That's a good rate for overnight frozen. Can we book it?",
          counter: "$3.00 is close but not quite there. How about $3.15 per mile? That's $545 total. It's fair for a short frozen run, and you'll be done by morning. What do you say?",
          reject: "I understand frozen costs more, but $4.00 per mile is way above market for this short distance. The highest I can go is $3.20 per mile. If that doesn't work, I have other carriers interested."
        }
      },
      
      {
        dispatcherPrompt: "Accept or decline the offer",
        dispatcherSuggestions: [
          { text: "Sounds good! MC 456789, email: frozen@logistics.com", quality: "good" },
          { text: "Let's book it. MC# 456789", quality: "good" },
          { text: "I'll pass.", quality: "normal" }
        ],
        brokerResponses: {
          accept: "Great! Rate con going to frozen@logistics.com. Pickup: 222 Cold Storage Way, Seattle WA 98101, tonight 10 PM. Contact: Lisa 555-0400. Delivery: 777 Frozen Foods Dr, Portland OR 97201, tomorrow by 6 AM. Keep it at -10В°F!",
          decline: "No worries! If you need frozen loads in the Pacific Northwest, give me a call. Stay safe!"
        }
      }
    ]
  },

  // SCENARIO 5: Miami FL в†’ Jacksonville FL (345 miles, Dry Van)
  // Base rate: $1.95/mile = $673 total
  // Success range: $2.24-2.44/mile ($773-$842) = +15-25%
  {
    id: 5,
    route: "Miami FL в†’ Jacksonville FL",
    distance: 345,
    equipment: "Dry Van",
    weight: "35,000 lbs",
    baseRate: 1.95,
    baseTotalRate: 673,
    successRateMin: 2.24,
    successRateMax: 2.44,
    
    conversation: [
      {
        dispatcherPrompt: "Call about the Florida run",
        dispatcherSuggestions: [
          { text: "Hello! I'm interested in your Miami to Jacksonville load. Is it available?", quality: "good" },
          { text: "Hi, calling about the Florida run. What are the details?", quality: "good" },
          { text: "Miami load available?", quality: "bad" }
        ],
        brokerResponse: "Yes, it's available! 345 miles from Miami to Jacksonville, dry van, 35,000 lbs. Pickup tomorrow at 7 AM, delivery same day by 5 PM. Straight shot up I-95. Are you in the area?"
      },
      
      {
        dispatcherPrompt: "Ask about rate and details",
        dispatcherSuggestions: [
          { text: "Yes, I have a truck in Miami. What's the rate?", quality: "good" },
          { text: "I can cover it. What are you paying?", quality: "good" },
          { text: "Rate?", quality: "bad" }
        ],
        brokerResponse: "I'm offering $1.95 per mile, so $673 total. It's general freight, nothing special. The shipper is in Hialeah, loads in about 45 minutes. Receiver in Jacksonville is also quick. Should be an easy day for your driver."
      },
      
      {
        dispatcherPrompt: "Negotiate for better rate",
        dispatcherSuggestions: [
          { text: "Can you do $2.30 per mile? That's $794 total.", quality: "good" }, // +18%
          { text: "I need $2.40 per mile. That's $828 total.", quality: "good" }, // +23%
          { text: "Florida rates are higher. I need $2.70 per mile.", quality: "bad" }, // +38%
          { text: "How about $2.10 per mile?", quality: "normal" } // +8%
        ],
        brokerResponses: {
          success: "Let me see what I can do... Okay, I talked to my manager and we can do $[RATE] per mile. That's $[TOTAL] total. It's a fair rate for this lane. Let's get it booked!",
          counter: "$2.10 is a bit low. I can go to $2.20 per mile - that's $759 total. It's the best I can offer for this run. Sound good?",
          reject: "I understand you need to make money, but $2.70 per mile is too high for Miami-Jacksonville. The maximum I can do is $2.25 per mile. If that doesn't work, I'll move on to the next carrier."
        }
      },
      
      {
        dispatcherPrompt: "Accept or decline",
        dispatcherSuggestions: [
          { text: "Deal! MC 567890, email: dispatch@florida.com", quality: "good" },
          { text: "Let's do it. MC# 567890", quality: "good" },
          { text: "I'll pass, thanks.", quality: "normal" }
        ],
        brokerResponses: {
          accept: "Perfect! Rate con on the way to dispatch@florida.com. Pickup: 999 Industrial Blvd, Hialeah, FL 33010, tomorrow 7 AM. Contact: Carlos 555-0500. Delivery: 111 Commerce St, Jacksonville FL 32099, same day by 5 PM. Easy run!",
          decline: "No problem! Thanks for calling. If you need Florida loads, reach out anytime. Take care!"
        }
      }
    ]
  }
];

  // SCENARIO 6: Denver CO в†’ Salt Lake City UT (525 miles, Dry Van, Mountain Route)
  // Base rate: $2.20/mile = $1,155 total
  // Success range: $2.53-2.75/mile ($1,328-$1,444) = +15-25%
  {
    id: 6,
    route: "Denver CO в†’ Salt Lake City UT",
    distance: 525,
    equipment: "Dry Van",
    weight: "40,000 lbs",
    baseRate: 2.20,
    baseTotalRate: 1155,
    successRateMin: 2.53,
    successRateMax: 2.75,
    
    conversation: [
      {
        dispatcherPrompt: "Inquire about the mountain route load",
        dispatcherSuggestions: [
          { text: "Hi! I'm calling about your Denver to Salt Lake City load. Still available?", quality: "good" },
          { text: "Hello, interested in the Denver-SLC run. What are the details?", quality: "good" },
          { text: "Got Denver load?", quality: "bad" }
        ],
        brokerResponse: "Yes, it's available! 525 miles from Denver to Salt Lake City, dry van, 40,000 lbs. Pickup day after tomorrow at 6 AM, delivery next day by 4 PM. It's a mountain route through I-70 and I-80, so make sure your truck can handle the grades. Interested?"
      },
      
      {
        dispatcherPrompt: "Ask about rate",
        dispatcherSuggestions: [
          { text: "My truck handles mountains fine. What's the rate?", quality: "good" },
          { text: "No problem with mountain driving. What are you offering?", quality: "good" },
          { text: "How much?", quality: "bad" }
        ],
        brokerResponse: "I'm offering $2.20 per mile, so $1,155 total. I know it's a mountain route with some challenging passes, but the shipper and receiver are both excellent. The freight is secure and well-packaged. It's a solid run if you're experienced with mountain driving."
      },
      
      {
        dispatcherPrompt: "Negotiate considering mountain route",
        dispatcherSuggestions: [
          { text: "Mountain routes cost more in fuel. Can you do $2.60 per mile? That's $1,365.", quality: "good" }, // +18%
          { text: "I need $2.70 per mile for mountain driving. That's $1,418.", quality: "good" }, // +23%
          { text: "Mountains are tough. I need $3.00 per mile minimum.", quality: "bad" }, // +36%
          { text: "Can we do $2.40 per mile?", quality: "normal" } // +9%
        ],
        brokerResponses: {
          success: "You're absolutely right about mountain fuel costs. Let me check with my manager... Okay, approved! I can do $[RATE] per mile, so $[TOTAL] total. That's fair for the mountain route. Let's book it!",
          counter: "$2.40 is close. How about $2.50 per mile? That's $1,313 total. It's a good rate considering the route, and both ends are reliable. Deal?",
          reject: "I understand mountains are challenging, but $3.00 per mile is above our budget. The highest I can go is $2.55 per mile. If that doesn't work, I'll need to find another carrier."
        }
      },
      
      {
        dispatcherPrompt: "Accept or decline",
        dispatcherSuggestions: [
          { text: "Sounds good! MC 678901, email: mountain@freight.com", quality: "good" },
          { text: "Let's book it. MC# 678901", quality: "good" },
          { text: "I'll pass.", quality: "normal" }
        ],
        brokerResponses: {
          accept: "Excellent! Rate con going to mountain@freight.com. Pickup: 444 Mountain View Dr, Denver CO 80201, day after tomorrow 6 AM. Contact: Mike 555-0600. Delivery: 666 Valley Rd, Salt Lake City UT 84101, next day by 4 PM. Drive safe in the mountains!",
          decline: "No worries! If you need mountain routes in the future, give me a call. Stay safe out there!"
        }
      }
    ]
  },

  // SCENARIO 7: Boston MA в†’ New York NY (215 miles, Dry Van, Northeast Corridor)
  // Base rate: $2.50/mile = $538 total
  // Success range: $2.88-3.13/mile ($619-$673) = +15-25%
  {
    id: 7,
    route: "Boston MA в†’ New York NY",
    distance: 215,
    equipment: "Dry Van",
    weight: "32,000 lbs",
    baseRate: 2.50,
    baseTotalRate: 538,
    successRateMin: 2.88,
    successRateMax: 3.13,
    
    conversation: [
      {
        dispatcherPrompt: "Call about Northeast corridor load",
        dispatcherSuggestions: [
          { text: "Good morning! Calling about your Boston to NYC load. Is it available?", quality: "good" },
          { text: "Hi, interested in the Boston-New York run. What are the details?", quality: "good" },
          { text: "Boston load?", quality: "bad" }
        ],
        brokerResponse: "Good morning! Yes, it's available. 215 miles from Boston to New York, dry van, 32,000 lbs. Pickup tomorrow at 5 AM, delivery same day by 2 PM. It's the I-95 corridor, so expect some traffic. Do you run the Northeast regularly?"
      },
      
      {
        dispatcherPrompt: "Confirm and ask about rate",
        dispatcherSuggestions: [
          { text: "Yes, I run the Northeast all the time. What's the rate?", quality: "good" },
          { text: "Traffic is no problem. What are you paying?", quality: "good" },
          { text: "Rate?", quality: "bad" }
        ],
        brokerResponse: "I'm offering $2.50 per mile, so $538 total. I know Northeast rates are typically higher due to traffic and tolls. This shipper is in Waltham, loads fast. Receiver is in the Bronx - they have a dock appointment system, so no waiting around. It's a smooth operation."
      },
      
      {
        dispatcherPrompt: "Negotiate considering Northeast costs",
        dispatcherSuggestions: [
          { text: "Northeast tolls are expensive. Can you do $2.95 per mile? That's $634.", quality: "good" }, // +18%
          { text: "I need $3.10 per mile for Northeast runs. That's $667.", quality: "good" }, // +24%
          { text: "Northeast is $3.50 per mile minimum with tolls.", quality: "bad" }, // +40%
          { text: "How about $2.70 per mile?", quality: "normal" } // +8%
        ],
        brokerResponses: {
          success: "You make a good point about Northeast tolls and traffic. Let me talk to my manager... Alright, I can do $[RATE] per mile, so $[TOTAL] total. That's a fair rate for the corridor. Let's book it!",
          counter: "$2.70 is a bit low for what I can offer. How about $2.80 per mile? That's $602 total. It covers your tolls and it's a quick turnaround. Deal?",
          reject: "I understand Northeast costs are higher, but $3.50 per mile is too much for this distance. Maximum I can do is $2.85 per mile. If that doesn't work, I have other carriers ready."
        }
      },
      
      {
        dispatcherPrompt: "Accept or decline",
        dispatcherSuggestions: [
          { text: "Deal! MC 789012, email: northeast@dispatch.com", quality: "good" },
          { text: "Let's do it. MC# 789012", quality: "good" },
          { text: "I'll pass.", quality: "normal" }
        ],
        brokerResponses: {
          accept: "Perfect! Rate con coming to northeast@dispatch.com. Pickup: 333 Tech Park, Waltham, MA 02451, tomorrow 5 AM. Contact: Jennifer 555-0700. Delivery: 888 Industrial Ave, Bronx, NY 10451, same day by 2 PM. Watch for traffic!",
          decline: "No problem! Thanks for your time. If you need Northeast loads, reach out. Have a good one!"
        }
      }
    ]
  },

  // SCENARIO 8: Phoenix AZ в†’ Las Vegas NV (297 miles, Dry Van)
  // Base rate: $2.00/mile = $594 total
  // Success range: $2.30-2.50/mile ($683-$743) = +15-25%
  {
    id: 8,
    route: "Phoenix AZ в†’ Las Vegas NV",
    distance: 297,
    equipment: "Dry Van",
    weight: "36,000 lbs",
    baseRate: 2.00,
    baseTotalRate: 594,
    successRateMin: 2.30,
    successRateMax: 2.50,
    
    conversation: [
      {
        dispatcherPrompt: "Inquire about Phoenix-Vegas load",
        dispatcherSuggestions: [
          { text: "Hi! I'm calling about your Phoenix to Las Vegas load. Still open?", quality: "good" },
          { text: "Hello, interested in the Phoenix-Vegas run. What are the details?", quality: "good" },
          { text: "Vegas load?", quality: "bad" }
        ],
        brokerResponse: "Yes, it's open! 297 miles from Phoenix to Las Vegas, dry van, 36,000 lbs. Pickup tonight at 8 PM, delivery tomorrow by noon. It's mostly night driving through the desert on US-93. Are you comfortable with night runs?"
      },
      
      {
        dispatcherPrompt: "Confirm and ask rate",
        dispatcherSuggestions: [
          { text: "Night driving is fine. What's the rate?", quality: "good" },
          { text: "No problem with night runs. What are you offering?", quality: "good" },
          { text: "How much?", quality: "bad" }
        ],
        brokerResponse: "I'm offering $2.00 per mile, so $594 total. It's a straightforward desert run. The shipper in Phoenix is reliable, and the Vegas receiver is used to night deliveries. You'll avoid all the daytime heat too, which is nice for the truck."
      },
      
      {
        dispatcherPrompt: "Negotiate the rate",
        dispatcherSuggestions: [
          { text: "Can you do $2.35 per mile? That's $698 total.", quality: "good" }, // +18%
          { text: "I need $2.45 per mile. That's $728 total.", quality: "good" }, // +23%
          { text: "Night runs are $2.80 per mile minimum.", quality: "bad" }, // +40%
          { text: "How about $2.20 per mile?", quality: "normal" } // +10%
        ],
        brokerResponses: {
          success: "Let me check on that... Okay, I can make $[RATE] per mile work. That's $[TOTAL] total. It's a good rate for a night run. Can we book it?",
          counter: "$2.20 is close. I can do $2.30 per mile - that's $683 total. It's fair for the run, and you'll be done by noon tomorrow. What do you say?",
          reject: "I understand night runs have different considerations, but $2.80 per mile is too high. The maximum I can offer is $2.35 per mile. If that doesn't work, I'll call the next carrier."
        }
      },
      
      {
        dispatcherPrompt: "Accept or decline",
        dispatcherSuggestions: [
          { text: "Sounds good! MC 890123, email: desert@transport.com", quality: "good" },
          { text: "Let's book it. MC# 890123", quality: "good" },
          { text: "I'll pass.", quality: "normal" }
        ],
        brokerResponses: {
          accept: "Great! Rate con going to desert@transport.com. Pickup: 555 Desert Dr, Phoenix AZ 85001, tonight 8 PM. Contact: Steve 555-0800. Delivery: 999 Strip Blvd, Las Vegas NV 89101, tomorrow by noon. Safe travels through the desert!",
          decline: "No worries! If you need Southwest loads, give me a call. Take care!"
        }
      }
    ]
  }
];

  // SCENARIO 9: Memphis TN в†’ Nashville TN (211 miles, Dry Van, Music City Run)
  // Base rate: $2.15/mile = $454 total
  // Success range: $2.47-2.69/mile ($521-$568) = +15-25%
  {
    id: 9,
    route: "Memphis TN в†’ Nashville TN",
    distance: 211,
    equipment: "Dry Van",
    weight: "30,000 lbs",
    baseRate: 2.15,
    baseTotalRate: 454,
    successRateMin: 2.47,
    successRateMax: 2.69,
    
    conversation: [
      {
        dispatcherPrompt: "Call about Tennessee intrastate load",
        dispatcherSuggestions: [
          { text: "Good afternoon! Calling about your Memphis to Nashville load. Is it available?", quality: "good" },
          { text: "Hi, interested in the Memphis-Nashville run. What are the details?", quality: "good" },
          { text: "Memphis load?", quality: "bad" }
        ],
        brokerResponse: "Good afternoon! Yes, it's available. 211 miles from Memphis to Nashville, dry van, 30,000 lbs. Pickup tomorrow at 10 AM, delivery same day by 6 PM. It's a straight shot on I-40. Pretty easy run. Are you in Tennessee?"
      },
      
      {
        dispatcherPrompt: "Confirm location and ask rate",
        dispatcherSuggestions: [
          { text: "Yes, I'm based in Tennessee. What's the rate?", quality: "good" },
          { text: "I can cover it. What are you paying?", quality: "good" },
          { text: "Rate?", quality: "bad" }
        ],
        brokerResponse: "Perfect! I'm offering $2.15 per mile, so $454 total. It's general freight, nothing complicated. The shipper in Memphis is a distribution center - they load efficiently. Nashville receiver is also professional. Should be a smooth day for your driver."
      },
      
      {
        dispatcherPrompt: "Negotiate for better rate",
        dispatcherSuggestions: [
          { text: "Can you do $2.55 per mile? That's $538 total.", quality: "good" }, // +19%
          { text: "I need $2.65 per mile. That's $559 total.", quality: "good" }, // +23%
          { text: "Tennessee runs are $3.00 per mile minimum.", quality: "bad" }, // +40%
          { text: "How about $2.35 per mile?", quality: "normal" } // +9%
        ],
        brokerResponses: {
          success: "Let me see what I can do... Talked to my manager, and we can do $[RATE] per mile. That's $[TOTAL] total. It's a fair rate for this lane. Let's get it booked!",
          counter: "$2.35 is a bit low. I can go to $2.45 per mile - that's $517 total. It's the best I can offer for this run. Sound good?",
          reject: "I understand you need to make money, but $3.00 per mile is too high for Memphis-Nashville. Maximum I can do is $2.50 per mile. If that doesn't work, I'll move on."
        }
      },
      
      {
        dispatcherPrompt: "Accept or decline",
        dispatcherSuggestions: [
          { text: "Deal! MC 901234, email: tennessee@freight.com", quality: "good" },
          { text: "Let's do it. MC# 901234", quality: "good" },
          { text: "I'll pass.", quality: "normal" }
        ],
        brokerResponses: {
          accept: "Excellent! Rate con on the way to tennessee@freight.com. Pickup: 777 Distribution Way, Memphis TN 38101, tomorrow 10 AM. Contact: Robert 555-0900. Delivery: 222 Music Row, Nashville TN 37201, same day by 6 PM. Easy run!",
          decline: "No problem! Thanks for calling. If you need Tennessee loads, reach out anytime. Take care!"
        }
      }
    ]
  },

  // SCENARIO 10: San Antonio TX в†’ El Paso TX (550 miles, Dry Van, Long Texas Haul)
  // Base rate: $1.90/mile = $1,045 total
  // Success range: $2.19-2.38/mile ($1,205-$1,309) = +15-25%
  {
    id: 10,
    route: "San Antonio TX в†’ El Paso TX",
    distance: 550,
    equipment: "Dry Van",
    weight: "45,000 lbs",
    baseRate: 1.90,
    baseTotalRate: 1045,
    successRateMin: 2.19,
    successRateMax: 2.38,
    
    conversation: [
      {
        dispatcherPrompt: "Inquire about long Texas haul",
        dispatcherSuggestions: [
          { text: "Hello! I'm calling about your San Antonio to El Paso load. Still available?", quality: "good" },
          { text: "Hi, interested in the San Antonio-El Paso run. What are the details?", quality: "good" },
          { text: "Texas load?", quality: "bad" }
        ],
        brokerResponse: "Hello! Yes, it's available. 550 miles from San Antonio to El Paso, dry van, 45,000 lbs. Pickup day after tomorrow at 7 AM, delivery next day by 5 PM. It's a long haul across West Texas on I-10. Are you comfortable with long Texas runs?"
      },
      
      {
        dispatcherPrompt: "Confirm and ask about rate",
        dispatcherSuggestions: [
          { text: "Yes, I run Texas regularly. What's the rate?", quality: "good" },
          { text: "Long hauls are fine. What are you offering?", quality: "good" },
          { text: "How much?", quality: "bad" }
        ],
        brokerResponse: "I'm offering $1.90 per mile, so $1,045 total. I know it's a long haul through some remote areas, but it's a reliable shipper and the receiver in El Paso is excellent. The freight is secure and well-packaged. It's a solid run if you're experienced with West Texas."
      },
      
      {
        dispatcherPrompt: "Negotiate considering distance",
        dispatcherSuggestions: [
          { text: "Long hauls need better rates. Can you do $2.25 per mile? That's $1,238.", quality: "good" }, // +18%
          { text: "I need $2.35 per mile for this distance. That's $1,293.", quality: "good" }, // +24%
          { text: "West Texas runs are $2.70 per mile minimum.", quality: "bad" }, // +42%
          { text: "How about $2.10 per mile?", quality: "normal" } // +11%
        ],
        brokerResponses: {
          success: "You're right about long haul economics. Let me check with my manager... Okay, I can do $[RATE] per mile, so $[TOTAL] total. That's a good rate for this distance. Let's book it!",
          counter: "$2.10 is close. How about $2.20 per mile? That's $1,210 total. It's fair for the distance, and both ends are reliable. Deal?",
          reject: "I understand long hauls have different costs, but $2.70 per mile is above our budget. The highest I can go is $2.25 per mile. If that doesn't work, I'll need to find another carrier."
        }
      },
      
      {
        dispatcherPrompt: "Accept or decline",
        dispatcherSuggestions: [
          { text: "Sounds good! MC 012345, email: texas@logistics.com", quality: "good" },
          { text: "Let's book it. MC# 012345", quality: "good" },
          { text: "I'll pass.", quality: "normal" }
        ],
        brokerResponses: {
          accept: "Perfect! Rate con going to texas@logistics.com. Pickup: 111 Alamo Plaza, San Antonio TX 78201, day after tomorrow 7 AM. Contact: Maria 555-1000. Delivery: 888 Border Rd, El Paso TX 79901, next day by 5 PM. Safe travels across West Texas!",
          decline: "No worries! If you need Texas loads in the future, give me a call. Stay safe!"
        }
      }
    ]
  }
];

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = newScenarios;
}

