// NEW SCENARIO STRUCTURE - Professional Dispatcher-Broker Conversations
// Updated with 4 most popular factoring companies:
// 1. RTS Financial
// 2. RTS Pro
// 3. Triumph Business Capital
// 4. Saint John Capital

const newScenariosWithFactoring = [
  // SCENARIO 1: Los Angeles CA → Phoenix AZ (373 miles, Dry Van)
  {
    id: 1,
    route: "Los Angeles CA → Phoenix AZ",
    distance: 373,
    equipment: "Dry Van",
    weight: "42,000 lbs",
    baseRate: 1.85,
    baseTotalRate: 690,
    successRateMin: 2.13,
    successRateMax: 2.31,
    
    conversation: [
      {
        dispatcherPrompt: "Greet the broker and ask if the load is available",
        dispatcherSuggestions: [
          { text: "Hi! I'm calling about your LA to Phoenix load. Is it still available?", quality: "good" },
          { text: "Hello, this is [Name] from [Company]. I saw your posting for LA-Phoenix. Still open?", quality: "good" },
          { text: "Hey, you got that LA load?", quality: "bad" }
        ],
        brokerResponse: "Yes, it's still available! It's a 373-mile run from Los Angeles to Phoenix. 42,000 lbs dry van freight. Pickup tomorrow morning, delivery same day by 6 PM. Are you interested?"
      },
      
      {
        dispatcherPrompt: "Ask about the rate for this load",
        dispatcherSuggestions: [
          { text: "What's your rate on this?", quality: "good" },
          { text: "Can you tell me the rate and any additional details?", quality: "good" },
          { text: "How much you paying?", quality: "normal" }
        ],
        brokerResponse: "I'm offering $1.85 per mile, so that's $690 total for the 373 miles. It's a straightforward run on I-10, should take about 6 hours. The shipper is reliable, and we have a good relationship with them."
      },
      
      {
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
        dispatcherPrompt: "Confirm factoring and negotiate for a better rate",
        dispatcherSuggestions: [
          { text: "Can you do $2.20 per mile? That's $820 total.", quality: "good" },
          { text: "I need at least $2.30 per mile to make this work.", quality: "good" },
          { text: "That's too low. I need $2.50 per mile.", quality: "bad" },
          { text: "Can you bump it up to $2.00 per mile?", quality: "normal" }
        ],
        brokerResponses: {
          success: "You know what, I can work with that. Let me check with my manager... Okay, approved! I can do $[RATE] per mile. That's a fair rate for both of us. Let's book it! What's your MC number?",
          counter: "I appreciate the offer, but $2.00 is below what I can do. How about we meet in the middle at $2.10 per mile? That's $784 total. It's the best I can offer on this one.",
          reject: "I understand you need to make money, but $2.50 per mile is way above market rate for this lane. The highest I can go is $2.05 per mile. If that doesn't work, I'll need to move on to other carriers."
        }
      },
      
      {
        dispatcherPrompt: "Accept the rate and provide MC number, or decline",
        dispatcherSuggestions: [
          { text: "Perfect! We use RTS Financial. Deal! MC is 123456. Email: dispatch@company.com", quality: "good" },
          { text: "Good, we're with Triumph. MC# 123456, driver will be ready tomorrow.", quality: "good" },
          { text: "We use Apex Capital. Sounds good. MC 123456, email: ops@transport.com", quality: "good" },
          { text: "Sorry, I'll have to pass on this one. Thanks anyway!", quality: "normal" },
          { text: "Nah, too low for me.", quality: "bad" }
        ],
        brokerResponses: {
          accept: "Perfect! I'm sending the rate confirmation to your email right now. Pickup is at 123 Industrial Way, LA CA 90001 tomorrow at 8 AM. Contact is Mike at 555-0100. Delivery at 456 Warehouse Blvd, Phoenix AZ 85001 by 6 PM. Safe travels!",
          decline: "No problem, I understand. Thanks for your time! If you're looking for other loads in the future, feel free to reach out. Have a great day!"
        }
      }
    ]
  }
];

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = newScenariosWithFactoring;
}

  // SCENARIO 6: Denver CO → Salt Lake City UT (525 miles, Dry Van, Mountain Route)
  // Base rate: $2.20/mile = $1,155 total
  // Success range: $2.53-2.75/mile ($1,328-$1,444) = +15-25%
  {
    id: 6,
    route: "Denver CO → Salt Lake City UT",
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
          { text: "Hi! I'm calling about your Denver CO to Salt Lake City UT load. Still available?", quality: "good" },
          { text: "Hello, interested in the Denver-SLC run. What are the details?", quality: "good" },
          { text: "Good afternoon! I saw your mountain route posting. Still open?", quality: "good" },
          { text: "Got Denver load?", quality: "bad" }
        ],
        brokerResponse: "Yes, it's available! 525 miles from Denver CO to Salt Lake City UT, dry van, 40,000 lbs. Pickup day after tomorrow at 6 AM, delivery next day by 4 PM. It's a mountain route through I-70 and I-80, so make sure your truck can handle the grades. Interested?"
      },
      
      {
        dispatcherPrompt: "Ask about rate",
        dispatcherSuggestions: [
          { text: "My truck handles mountains fine. What's the rate?", quality: "good" },
          { text: "No problem with mountain driving. What are you offering?", quality: "good" },
          { text: "I run mountains regularly. What's the pay?", quality: "good" },
          { text: "How much?", quality: "bad" }
        ],
        brokerResponse: "I'm offering $2.20 per mile, so $1,155 total. I know it's a mountain route with some challenging passes, but the shipper and receiver are both excellent. The freight is secure and well-packaged. It's a solid run if you're experienced with mountain driving."
      },
      
      {
        dispatcherPrompt: "Ask about factoring",
        dispatcherSuggestions: [
          { text: "What factoring company do you work with? We only work through factoring.", quality: "good" },
          { text: "Which factoring are you set up with? That's how we process payment.", quality: "good" },
          { text: "Do you work with factoring? Need to check that first.", quality: "good" },
          { text: "Factoring?", quality: "bad" }
        ],
        brokerResponse: "Yes, we work with all major factoring companies - RTS Financial, Triumph, OTR Solutions, TBS Factoring, and eCapital. Which one do you use? I'll verify right now."
      },
      
      {
        dispatcherPrompt: "Confirm factoring and negotiate considering mountain route",
        dispatcherSuggestions: [
          { text: "We use RTS. Mountain routes cost more in fuel. Can you do $2.60 per mile? That's $1,365.", quality: "good" }, // +18%
          { text: "We're with Triumph. I need $2.65 per mile for mountain driving. That's $1,391.", quality: "good" }, // +20%
          { text: "We use OTR. Can you do $2.70 per mile? That's $1,418.", quality: "good" }, // +23%
          { text: "We're with TBS. Mountains are tough. I need $3.00 per mile minimum.", quality: "bad" }, // +36%
          { text: "We use eCapital. Can we do $2.40 per mile?", quality: "normal" } // +9%
        ],
        brokerResponses: {
          success: "Perfect! We're set up with [FACTORING]. You're absolutely right about mountain fuel costs. Let me check with my manager... Okay, approved! I can do $[RATE] per mile, so $[TOTAL] total. That's fair for the mountain route. Let's book it!",
          counter: "Good, we work with [FACTORING]. On the rate - $2.40 is close. How about $2.50 per mile? That's $1,313 total. It's a good rate considering the route, and both ends are reliable. Deal?",
          reject: "Yes, we're with [FACTORING]. I understand mountains are challenging, but $3.00 per mile is above our budget. The highest I can go is $2.55 per mile. If that doesn't work, I'll need to find another carrier."
        }
      },
      
      {
        dispatcherPrompt: "Accept or decline",
        dispatcherSuggestions: [
          { text: "Sounds good! MC 678901, email: mountain@freight.com", quality: "good" },
          { text: "Let's book it. MC# 678901, driver: Robert Wilson", quality: "good" },
          { text: "Deal! MC 678901, email: denver@transport.com", quality: "good" },
          { text: "I'll pass.", quality: "normal" }
        ],
        brokerResponses: {
          accept: "Excellent! Rate con going to your email. Pickup: 444 Mountain View Dr, Denver CO 80201, day after tomorrow 6 AM. Contact: Mike 555-0600. Delivery: 666 Valley Rd, Salt Lake City UT 84101, next day by 4 PM. Drive safe in the mountains! Your factoring will process payment after POD.",
          decline: "No worries! If you need mountain routes in the future, give me a call. Stay safe out there!"
        }
      }
    ]
  },

  // SCENARIO 7: Boston MA → New York NY (215 miles, Dry Van, Northeast Corridor)
  // Base rate: $2.50/mile = $538 total
  // Success range: $2.88-3.13/mile ($619-$673) = +15-25%
  {
    id: 7,
    route: "Boston MA → New York NY",
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
          { text: "Good morning! Calling about your Boston MA to New York NY load. Is it available?", quality: "good" },
          { text: "Hi, interested in the Boston-New York run. What are the details?", quality: "good" },
          { text: "Hello! I saw your Northeast corridor posting. Still open?", quality: "good" },
          { text: "Boston load?", quality: "bad" }
        ],
        brokerResponse: "Good morning! Yes, it's available. 215 miles from Boston MA to New York NY, dry van, 32,000 lbs. Pickup tomorrow at 5 AM, delivery same day by 2 PM. It's the I-95 corridor, so expect some traffic. Do you run the Northeast regularly?"
      },
      
      {
        dispatcherPrompt: "Confirm and ask about rate",
        dispatcherSuggestions: [
          { text: "Yes, I run the Northeast all the time. What's the rate?", quality: "good" },
          { text: "Traffic is no problem for me. What are you paying?", quality: "good" },
          { text: "I'm familiar with the route. What's the rate?", quality: "good" },
          { text: "Rate?", quality: "bad" }
        ],
        brokerResponse: "I'm offering $2.50 per mile, so $538 total. I know Northeast rates are typically higher due to traffic and tolls. This shipper is in Waltham, loads fast. Receiver is in the Bronx - they have a dock appointment system, so no waiting around. It's a smooth operation."
      },
      
      {
        dispatcherPrompt: "Ask about factoring",
        dispatcherSuggestions: [
          { text: "What factoring company do you work with? We only work through factoring.", quality: "good" },
          { text: "Which factoring are you set up with? That's required for us.", quality: "good" },
          { text: "Do you work with factoring? Need to verify that.", quality: "good" },
          { text: "Factoring?", quality: "bad" }
        ],
        brokerResponse: "Absolutely! We work with RTS Financial, Triumph, OTR Solutions, TBS Factoring, and eCapital. Which one do you use? I'll verify we're set up."
      },
      
      {
        dispatcherPrompt: "Confirm factoring and negotiate considering Northeast costs",
        dispatcherSuggestions: [
          { text: "We use RTS. Northeast tolls are expensive. Can you do $2.95 per mile? That's $634.", quality: "good" }, // +18%
          { text: "We're with Triumph. I need $3.05 per mile for Northeast runs. That's $656.", quality: "good" }, // +22%
          { text: "We use OTR. Can you do $3.10 per mile? That's $667.", quality: "good" }, // +24%
          { text: "We're with TBS. Northeast is $3.50 per mile minimum with tolls.", quality: "bad" }, // +40%
          { text: "We use eCapital. How about $2.70 per mile?", quality: "normal" } // +8%
        ],
        brokerResponses: {
          success: "Perfect! We're set up with [FACTORING]. You make a good point about Northeast tolls and traffic. Let me talk to my manager... Alright, I can do $[RATE] per mile, so $[TOTAL] total. That's a fair rate for the corridor. Let's book it!",
          counter: "Good, we work with [FACTORING]. On the rate - $2.70 is a bit low for what I can offer. How about $2.80 per mile? That's $602 total. It covers your tolls and it's a quick turnaround. Deal?",
          reject: "Yes, we're with [FACTORING]. I understand Northeast costs are higher, but $3.50 per mile is too much for this distance. Maximum I can do is $2.85 per mile. If that doesn't work, I have other carriers ready."
        }
      },
      
      {
        dispatcherPrompt: "Accept or decline",
        dispatcherSuggestions: [
          { text: "Deal! MC 789012, email: northeast@dispatch.com", quality: "good" },
          { text: "Let's do it. MC# 789012, driver: James Brown", quality: "good" },
          { text: "Sounds good! MC 789012, email: boston@freight.com", quality: "good" },
          { text: "I'll pass.", quality: "normal" }
        ],
        brokerResponses: {
          accept: "Perfect! Rate con coming to your email. Pickup: 333 Tech Park, Waltham MA 02451, tomorrow 5 AM. Contact: Jennifer 555-0700. Delivery: 888 Industrial Ave, Bronx NY 10451, same day by 2 PM. Watch for traffic! Your factoring will process payment after delivery.",
          decline: "No problem! Thanks for your time. If you need Northeast loads, reach out. Have a good one!"
        }
      }
    ]
  },

  // SCENARIO 8: Phoenix AZ → Las Vegas NV (297 miles, Dry Van)
  // Base rate: $2.00/mile = $594 total
  // Success range: $2.30-2.50/mile ($683-$743) = +15-25%
  {
    id: 8,
    route: "Phoenix AZ → Las Vegas NV",
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
          { text: "Hi! I'm calling about your Phoenix AZ to Las Vegas NV load. Still open?", quality: "good" },
          { text: "Hello, interested in the Phoenix-Vegas run. What are the details?", quality: "good" },
          { text: "Good evening! I saw your Phoenix-Las Vegas posting. Available?", quality: "good" },
          { text: "Vegas load?", quality: "bad" }
        ],
        brokerResponse: "Yes, it's open! 297 miles from Phoenix AZ to Las Vegas NV, dry van, 36,000 lbs. Pickup tonight at 8 PM, delivery tomorrow by noon. It's mostly night driving through the desert on US-93. Are you comfortable with night runs?"
      },
      
      {
        dispatcherPrompt: "Confirm and ask rate",
        dispatcherSuggestions: [
          { text: "Night driving is fine for me. What's the rate?", quality: "good" },
          { text: "No problem with night runs. What are you offering?", quality: "good" },
          { text: "I prefer night driving. What's the pay?", quality: "good" },
          { text: "How much?", quality: "bad" }
        ],
        brokerResponse: "I'm offering $2.00 per mile, so $594 total. It's a straightforward desert run. The shipper in Phoenix is reliable, and the Vegas receiver is used to night deliveries. You'll avoid all the daytime heat too, which is nice for the truck."
      },
      
      {
        dispatcherPrompt: "Ask about factoring",
        dispatcherSuggestions: [
          { text: "What factoring company do you work with? We only work through factoring.", quality: "good" },
          { text: "Which factoring are you set up with? That's how we get paid.", quality: "good" },
          { text: "Do you work with factoring? Need to check that.", quality: "good" },
          { text: "Factoring?", quality: "bad" }
        ],
        brokerResponse: "Yes, we work with RTS Financial, Triumph, OTR Solutions, TBS Factoring, and eCapital. Which one do you use? I'll confirm right now."
      },
      
      {
        dispatcherPrompt: "Confirm factoring and negotiate the rate",
        dispatcherSuggestions: [
          { text: "We use RTS. Can you do $2.35 per mile? That's $698 total.", quality: "good" }, // +18%
          { text: "We're with Triumph. I need $2.40 per mile. That's $713 total.", quality: "good" }, // +20%
          { text: "We use OTR. Can you do $2.45 per mile? That's $728 total.", quality: "good" }, // +23%
          { text: "We're with TBS. Night runs are $2.80 per mile minimum.", quality: "bad" }, // +40%
          { text: "We use eCapital. How about $2.20 per mile?", quality: "normal" } // +10%
        ],
        brokerResponses: {
          success: "Perfect! We're set up with [FACTORING]. Let me check on that rate... Okay, I can make $[RATE] per mile work. That's $[TOTAL] total. It's a good rate for a night run. Can we book it?",
          counter: "Good, we work with [FACTORING]. On the rate - $2.20 is close. I can do $2.30 per mile - that's $683 total. It's fair for the run, and you'll be done by noon tomorrow. What do you say?",
          reject: "Yes, we're with [FACTORING]. I understand night runs have different considerations, but $2.80 per mile is too high. The maximum I can offer is $2.35 per mile. If that doesn't work, I'll call the next carrier."
        }
      },
      
      {
        dispatcherPrompt: "Accept or decline",
        dispatcherSuggestions: [
          { text: "Sounds good! MC 890123, email: desert@transport.com", quality: "good" },
          { text: "Let's book it. MC# 890123, driver: Michael Davis", quality: "good" },
          { text: "Deal! MC 890123, email: phoenix@freight.com", quality: "good" },
          { text: "I'll pass.", quality: "normal" }
        ],
        brokerResponses: {
          accept: "Great! Rate con going to your email. Pickup: 555 Desert Dr, Phoenix AZ 85001, tonight 8 PM. Contact: Steve 555-0800. Delivery: 999 Strip Blvd, Las Vegas NV 89101, tomorrow by noon. Safe travels through the desert! Your factoring will process payment after POD.",
          decline: "No worries! If you need Southwest loads, give me a call. Take care!"
        }
      }
    ]
  },

  // SCENARIO 9: Memphis TN → Nashville TN (211 miles, Dry Van, Music City Run)
  // Base rate: $2.15/mile = $454 total
  // Success range: $2.47-2.69/mile ($521-$568) = +15-25%
  {
    id: 9,
    route: "Memphis TN → Nashville TN",
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
          { text: "Good afternoon! Calling about your Memphis TN to Nashville TN load. Is it available?", quality: "good" },
          { text: "Hi, interested in the Memphis-Nashville run. What are the details?", quality: "good" },
          { text: "Hello! I saw your Tennessee posting. Still open?", quality: "good" },
          { text: "Memphis load?", quality: "bad" }
        ],
        brokerResponse: "Good afternoon! Yes, it's available. 211 miles from Memphis TN to Nashville TN, dry van, 30,000 lbs. Pickup tomorrow at 10 AM, delivery same day by 6 PM. It's a straight shot on I-40. Pretty easy run. Are you in Tennessee?"
      },
      
      {
        dispatcherPrompt: "Confirm location and ask rate",
        dispatcherSuggestions: [
          { text: "Yes, I'm based in Tennessee. What's the rate?", quality: "good" },
          { text: "I can cover it. What are you paying?", quality: "good" },
          { text: "I'm in the area. What's the rate?", quality: "good" },
          { text: "Rate?", quality: "bad" }
        ],
        brokerResponse: "Perfect! I'm offering $2.15 per mile, so $454 total. It's general freight, nothing complicated. The shipper in Memphis is a distribution center - they load efficiently. Nashville receiver is also professional. Should be a smooth day for your driver."
      },
      
      {
        dispatcherPrompt: "Ask about factoring",
        dispatcherSuggestions: [
          { text: "What factoring company do you work with? We only work through factoring.", quality: "good" },
          { text: "Which factoring are you set up with? That's how we process payment.", quality: "good" },
          { text: "Do you work with factoring? Need to verify that.", quality: "good" },
          { text: "Factoring?", quality: "bad" }
        ],
        brokerResponse: "Yes, we work with RTS Financial, Triumph, OTR Solutions, TBS Factoring, and eCapital. Which one do you use? I'll verify right now."
      },
      
      {
        dispatcherPrompt: "Confirm factoring and negotiate for better rate",
        dispatcherSuggestions: [
          { text: "We use RTS. Can you do $2.55 per mile? That's $538 total.", quality: "good" }, // +19%
          { text: "We're with Triumph. I need $2.60 per mile. That's $549 total.", quality: "good" }, // +21%
          { text: "We use OTR. Can you do $2.65 per mile? That's $559 total.", quality: "good" }, // +23%
          { text: "We're with TBS. Tennessee runs are $3.00 per mile minimum.", quality: "bad" }, // +40%
          { text: "We use eCapital. How about $2.35 per mile?", quality: "normal" } // +9%
        ],
        brokerResponses: {
          success: "Perfect! We're set up with [FACTORING]. Let me see what I can do... Talked to my manager, and we can do $[RATE] per mile. That's $[TOTAL] total. It's a fair rate for this lane. Let's get it booked!",
          counter: "Good, we work with [FACTORING]. On the rate - $2.35 is a bit low. I can go to $2.45 per mile - that's $517 total. It's the best I can offer for this run. Sound good?",
          reject: "Yes, we're with [FACTORING]. I understand you need to make money, but $3.00 per mile is too high for Memphis-Nashville. Maximum I can do is $2.50 per mile. If that doesn't work, I'll move on."
        }
      },
      
      {
        dispatcherPrompt: "Accept or decline",
        dispatcherSuggestions: [
          { text: "Deal! MC 901234, email: tennessee@freight.com", quality: "good" },
          { text: "Let's do it. MC# 901234, driver: William Taylor", quality: "good" },
          { text: "Sounds good! MC 901234, email: memphis@transport.com", quality: "good" },
          { text: "I'll pass.", quality: "normal" }
        ],
        brokerResponses: {
          accept: "Excellent! Rate con on the way to your email. Pickup: 777 Distribution Way, Memphis TN 38101, tomorrow 10 AM. Contact: Robert 555-0900. Delivery: 222 Music Row, Nashville TN 37201, same day by 6 PM. Easy run! Your factoring will process payment after delivery.",
          decline: "No problem! Thanks for calling. If you need Tennessee loads, reach out anytime. Take care!"
        }
      }
    ]
  },

  // SCENARIO 10: San Antonio TX → El Paso TX (550 miles, Dry Van, Long Texas Haul)
  // Base rate: $1.90/mile = $1,045 total
  // Success range: $2.19-2.38/mile ($1,205-$1,309) = +15-25%
  {
    id: 10,
    route: "San Antonio TX → El Paso TX",
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
          { text: "Hello! I'm calling about your San Antonio TX to El Paso TX load. Still available?", quality: "good" },
          { text: "Hi, interested in the San Antonio-El Paso run. What are the details?", quality: "good" },
          { text: "Good morning! I saw your West Texas posting. Still open?", quality: "good" },
          { text: "Texas load?", quality: "bad" }
        ],
        brokerResponse: "Hello! Yes, it's available. 550 miles from San Antonio TX to El Paso TX, dry van, 45,000 lbs. Pickup day after tomorrow at 7 AM, delivery next day by 5 PM. It's a long haul across West Texas on I-10. Are you comfortable with long Texas runs?"
      },
      
      {
        dispatcherPrompt: "Confirm and ask about rate",
        dispatcherSuggestions: [
          { text: "Yes, I run Texas regularly. What's the rate?", quality: "good" },
          { text: "Long hauls are fine for me. What are you offering?", quality: "good" },
          { text: "I'm experienced with West Texas. What's the pay?", quality: "good" },
          { text: "How much?", quality: "bad" }
        ],
        brokerResponse: "I'm offering $1.90 per mile, so $1,045 total. I know it's a long haul through some remote areas, but it's a reliable shipper and the receiver in El Paso is excellent. The freight is secure and well-packaged. It's a solid run if you're experienced with West Texas."
      },
      
      {
        dispatcherPrompt: "Ask about factoring",
        dispatcherSuggestions: [
          { text: "What factoring company do you work with? We only work through factoring.", quality: "good" },
          { text: "Which factoring are you set up with? That's required for us.", quality: "good" },
          { text: "Do you work with factoring? Need to verify that first.", quality: "good" },
          { text: "Factoring?", quality: "bad" }
        ],
        brokerResponse: "Absolutely! We work with RTS Financial, Triumph, OTR Solutions, TBS Factoring, and eCapital. Which one do you use? I'll verify we're set up."
      },
      
      {
        dispatcherPrompt: "Confirm factoring and negotiate considering distance",
        dispatcherSuggestions: [
          { text: "We use RTS. Long hauls need better rates. Can you do $2.25 per mile? That's $1,238.", quality: "good" }, // +18%
          { text: "We're with Triumph. I need $2.30 per mile for this distance. That's $1,265.", quality: "good" }, // +21%
          { text: "We use OTR. Can you do $2.35 per mile? That's $1,293.", quality: "good" }, // +24%
          { text: "We're with TBS. West Texas runs are $2.70 per mile minimum.", quality: "bad" }, // +42%
          { text: "We use eCapital. How about $2.10 per mile?", quality: "normal" } // +11%
        ],
        brokerResponses: {
          success: "Perfect! We're set up with [FACTORING]. You're right about long haul economics. Let me check with my manager... Okay, I can do $[RATE] per mile, so $[TOTAL] total. That's a good rate for this distance. Let's book it!",
          counter: "Good, we work with [FACTORING]. On the rate - $2.10 is close. How about $2.20 per mile? That's $1,210 total. It's fair for the distance, and both ends are reliable. Deal?",
          reject: "Yes, we're with [FACTORING]. I understand long hauls have different costs, but $2.70 per mile is above our budget. The highest I can go is $2.25 per mile. If that doesn't work, I'll need to find another carrier."
        }
      },
      
      {
        dispatcherPrompt: "Accept or decline",
        dispatcherSuggestions: [
          { text: "Sounds good! MC 012345, email: texas@logistics.com", quality: "good" },
          { text: "Let's book it. MC# 012345, driver: Daniel Garcia", quality: "good" },
          { text: "Deal! MC 012345, email: sanantonio@freight.com", quality: "good" },
          { text: "I'll pass.", quality: "normal" }
        ],
        brokerResponses: {
          accept: "Perfect! Rate con going to your email. Pickup: 111 Alamo Plaza, San Antonio TX 78201, day after tomorrow 7 AM. Contact: Maria 555-1000. Delivery: 888 Border Rd, El Paso TX 79901, next day by 5 PM. Safe travels across West Texas! Your factoring will process payment after POD.",
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
