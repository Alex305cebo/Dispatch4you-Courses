// ============================================
// REALISTIC BROKER SCENARIOS - IMPROVED VERSION
// ============================================
// Created with realistic distances, rates, and natural dialogue variations

const realisticScenarios = [
  
  // ========================================
  // SHORT HAULS (550-750 miles, 1 day) - DRY VAN
  // ========================================
  
  // Scenario 1: Atlanta, GA → Charlotte, NC (650 miles, Dry Van, 28,000 lbs)
  // Rate: $2.70/mile = $1,755
  [
    { 
      dispatcherMessage: "Good morning! This is Jake from Apex Logistics. Calling about your Atlanta to Charlotte load. Is it still available?",
      dispatcherSuggestions: [
        "Good morning! This is Jake from Apex Logistics. Calling about your Atlanta to Charlotte load. Is it still available?",
        "Hi, Jake with Apex Logistics here. Saw your Atlanta, GA to Charlotte, NC posting. Still open?",
        "Hey there! Jake from Apex Logistics. Your Atlanta to Charlotte run - can we talk about it?",
        "Morning! This is Jake, Apex Logistics. Interested in the Atlanta to Charlotte load. Available?",
        "Hello! Jake from Apex Logistics calling. I'm looking at your ATL to CLT load. Is it still there?",
        "Hi! Jake with Apex Logistics. Calling about the Atlanta, GA to Charlotte, NC freight. Still open?",
        "Good day! This is Jake from Apex Logistics. Your Atlanta to Charlotte posting - can we discuss?",
        "Hey! Jake, Apex Logistics here. Saw your load Atlanta to Charlotte. Still available?",
        "Morning! Jake from Apex Logistics. I'm interested in your Atlanta, GA to Charlotte, NC load. Open?",
        "Hi there! This is Jake with Apex Logistics. Calling about the ATL-CLT run. Still available?"
      ],
      question: "Morning! Yeah, it's open. What's your MC?",
      expectedKeywords: ['mc', 'number', 'authority', '\\d{6}'],
      goodResponse: "Got it, checking you now... Alright, you're good. So it's Atlanta to Charlotte - 650 miles, 28,000 pounds. Pickup today between 2-6 PM, deliver tomorrow by noon. What equipment you running?",
      badResponse: "Need your MC number to proceed.",
      suggestions: [
        { text: "MC 445566, we run this lane weekly", quality: "good" },
        { text: "MC 778899", quality: "normal" },
        { text: "Let me grab that real quick", quality: "bad" }
      ]
    },
    { 
      question: "What kind of trailer you got?",
      expectedKeywords: ['dry van', 'van', '53', 'trailer', 'dry'],
      goodResponse: "Perfect, that'll work. Can your driver be there today between 2 and 6?",
      badResponse: "I need to know what equipment you have.",
      suggestions: [
        { text: "53-foot dry van, air ride, driver's 30 minutes out", quality: "good" },
        { text: "Dry van, 53 footer", quality: "normal" },
        { text: "Van", quality: "bad" }
      ]
    },
    { 
      question: "Can you make pickup today 2-6 PM?",
      expectedKeywords: ['yes', 'today', 'can', 'sure', 'available'],
      goodResponse: "Excellent. Rate is $1,755 - that's $2.70 per mile. Work for you?",
      badResponse: "Need to confirm pickup time.",
      suggestions: [
        { text: "Yes, driver can be there by 3 PM today", quality: "good" },
        { text: "Yeah, today works", quality: "normal" },
        { text: "Probably, need to check", quality: "bad" },
        { text: "Can't do today", quality: "reject" }
      ]
    },
    { 
      question: "$1,755 for 650 miles. That work?",
      expectedKeywords: ['yes', 'ok', 'deal', 'book', 'accept', 'good'],
      goodResponse: "Great! Sending rate con right now. Email me your insurance cert and we're set.",
      badResponse: "So is that a yes on $1,755?",
      suggestions: [
        { text: "Yes, $1,755 works. Let's book it", quality: "good" },
        { text: "Can you do $1,850? That's our target", quality: "normal" },
        { text: "Need $2,000 minimum", quality: "bad" },
        { text: "Too low, can't do it", quality: "reject" }
      ]
    },
    { 
      question: "Perfect! Rate con sent. Shipper contact is Mike at 404-555-0123. Any questions?",
      expectedKeywords: ['no', 'good', 'clear', 'thanks', 'all set'],
      goodResponse: "Awesome! Have your driver call me when loaded. Safe travels!",
      badResponse: "Let me know if you need anything else.",
      suggestions: [
        { text: "All clear, we'll call you at pickup. Thanks!", quality: "good" },
        { text: "No questions, thanks", quality: "normal" },
        { text: "OK", quality: "bad" }
      ]
    }
  ],

  // Scenario 2: Dallas, TX → Memphis, TN (750 miles, Dry Van, 32,000 lbs)
  // Rate: $2.60/mile = $1,950
  [
    { 
      dispatcherMessage: "Hi! Sarah from Quick Dispatch. Your Dallas to Memphis load - is it still open?",
      dispatcherSuggestions: [
        "Hi! Sarah from Quick Dispatch. Your Dallas to Memphis load - is it still open?",
        "Hello, this is Sarah with Quick Dispatch. Calling about the Dallas, TX to Memphis, TN load. Available?",
        "Good afternoon! Sarah from Quick Dispatch here. I saw your Dallas to Memphis posting. Still there?",
        "Hey! Sarah, Quick Dispatch. Interested in your Dallas, TX to Memphis, TN run. Open?",
        "Hi there! This is Sarah from Quick Dispatch. Your Dallas to Memphis freight - still available?",
        "Morning! Sarah with Quick Dispatch calling. Dallas to Memphis load - can we discuss it?",
        "Hello! Sarah from Quick Dispatch. I'm looking at your DAL to MEM load. Still open?",
        "Hi! This is Sarah, Quick Dispatch. Calling about the Dallas to Memphis shipment. Available?",
        "Good day! Sarah from Quick Dispatch here. Your Dallas, TX to Memphis, TN load - is it there?",
        "Hey there! Sarah with Quick Dispatch. Saw your Dallas to Memphis posting. Can we talk?"
      ],
      question: "Hey! Yeah, still available. MC number?",
      expectedKeywords: ['mc', 'number', 'authority', '\\d{6}'],
      goodResponse: "Thanks, pulling you up... Okay, all good. Dallas to Memphis - 750 miles, 32,000 lbs. Pickup tomorrow morning 6-10 AM, deliver next day by 5 PM. You got a dry van?",
      badResponse: "I'll need your MC first.",
      suggestions: [
        { text: "MC 556677, driver is in Dallas now", quality: "good" },
        { text: "MC 889900", quality: "normal" },
        { text: "One sec, finding it", quality: "bad" }
      ]
    },
    { 
      question: "You have a 53-foot dry van available?",
      expectedKeywords: ['yes', 'dry van', 'van', '53', 'have', 'got'],
      goodResponse: "Good deal. Can you do pickup tomorrow 6-10 AM?",
      badResponse: "Need to confirm equipment type.",
      suggestions: [
        { text: "Yes, 53' dry van ready to roll", quality: "good" },
        { text: "We have a dry van", quality: "normal" },
        { text: "Have a trailer", quality: "bad" }
      ]
    },
    { 
      question: "Pickup tomorrow morning 6-10 AM work?",
      expectedKeywords: ['yes', 'tomorrow', 'morning', 'can', 'works'],
      goodResponse: "Perfect. I'm at $1,950 for the 750 miles. That's $2.60 per mile. Good?",
      badResponse: "I need confirmation on tomorrow morning.",
      suggestions: [
        { text: "Yes, driver will be there at 7 AM sharp", quality: "good" },
        { text: "Tomorrow morning works", quality: "normal" },
        { text: "Maybe, I'll check", quality: "bad" },
        { text: "Can't do tomorrow", quality: "reject" }
      ]
    },
    { 
      question: "$1,950 total. Can you do it?",
      expectedKeywords: ['yes', 'ok', 'deal', 'book', 'accept'],
      goodResponse: "Awesome! Sending rate con now. I'll need your W9 and COI emailed over.",
      badResponse: "Need a yes or no on $1,950.",
      suggestions: [
        { text: "Yes, $1,950 is good. Book it", quality: "good" },
        { text: "Can you bump it to $2,100?", quality: "normal" },
        { text: "Need $2,300 minimum", quality: "bad" },
        { text: "Can't work with that rate", quality: "reject" }
      ]
    },
    { 
      question: "Rate con sent! Shipper is John at 214-555-0199. All clear?",
      expectedKeywords: ['yes', 'clear', 'good', 'thanks'],
      goodResponse: "Great! Call me when your driver's loaded. Good luck!",
      badResponse: "Let me know if you have questions.",
      suggestions: [
        { text: "All clear, we'll update you at pickup", quality: "good" },
        { text: "Looks good, thanks", quality: "normal" },
        { text: "OK", quality: "bad" }
      ]
    }
  ],

  // ========================================
  // MEDIUM HAULS (800-1500 miles, 2 days) - DRY VAN
  // ========================================

  // Scenario 3: Chicago, IL → Nashville, TN (850 miles, Dry Van, 35,000 lbs)
  // Rate: $2.50/mile = $2,125
  [
    { 
      dispatcherMessage: "Good morning! Mike from Midwest Freight. Calling about your Chicago to Nashville load. Still open?",
      dispatcherSuggestions: [
        "Good morning! Mike from Midwest Freight. Calling about your Chicago to Nashville load. Still open?",
        "Hi! This is Mike with Midwest Freight. Your Chicago, IL to Nashville, TN load - available?",
        "Hey there! Mike from Midwest Freight. Saw your Chicago to Nashville posting. Can we discuss?",
        "Morning! Mike, Midwest Freight here. Interested in the Chicago to Nashville run. Open?",
        "Hello! Mike from Midwest Freight calling. I'm looking at your CHI to NSH load. Still there?",
        "Hi! This is Mike with Midwest Freight. Calling about the Chicago to Nashville freight. Available?",
        "Good day! Mike from Midwest Freight. Your Chicago, IL to Nashville, TN posting - still open?",
        "Hey! Mike, Midwest Freight. Your Chicago to Nashville load - can we talk about it?",
        "Morning! This is Mike from Midwest Freight. Chicago to Nashville run - is it available?",
        "Hi there! Mike with Midwest Freight. Saw your Chicago to Nashville load. Still open?"
      ],
      question: "Morning! Yes, it's open. What's your MC?",
      expectedKeywords: ['mc', 'number', 'authority', '\\d{6}'],
      goodResponse: "Got it, verifying... All set. Chicago to Nashville - 850 miles, 35,000 pounds. Pickup tomorrow 8 AM-2 PM, deliver day after by 4 PM. What equipment you got?",
      badResponse: "Need MC number.",
      suggestions: [
        { text: "MC 667788, we run Midwest lanes regularly", quality: "good" },
        { text: "MC 990011", quality: "normal" },
        { text: "Let me find it", quality: "bad" }
      ]
    },
    { 
      question: "What type of trailer?",
      expectedKeywords: ['dry van', 'van', '53', 'trailer'],
      goodResponse: "Perfect. Can you do pickup tomorrow 8 AM to 2 PM?",
      badResponse: "I need equipment type.",
      suggestions: [
        { text: "53-foot dry van with air ride, clean", quality: "good" },
        { text: "Dry van", quality: "normal" },
        { text: "Trailer", quality: "bad" }
      ]
    },
    { 
      question: "Pickup tomorrow 8-2, deliver day after by 4 PM. Work?",
      expectedKeywords: ['yes', 'works', 'can', 'sure'],
      goodResponse: "Great. Rate is $2,125 - $2.50 per mile. That work for you?",
      badResponse: "Need timeline confirmation.",
      suggestions: [
        { text: "Yes, driver can handle that schedule", quality: "good" },
        { text: "That works", quality: "normal" },
        { text: "Need to check", quality: "bad" },
        { text: "Can't make that", quality: "reject" }
      ]
    },
    { 
      question: "$2,125 for 850 miles. Good?",
      expectedKeywords: ['yes', 'ok', 'deal', 'book'],
      goodResponse: "Excellent! Sending rate con. Email your docs to dispatch@company.com",
      badResponse: "Is $2,125 acceptable?",
      suggestions: [
        { text: "Yes, $2,125 works. Let's book it", quality: "good" },
        { text: "Can you do $2,300?", quality: "normal" },
        { text: "Need $2,500 minimum", quality: "bad" },
        { text: "Rate too low", quality: "reject" }
      ]
    },
    { 
      question: "Rate con sent! Contact is Lisa at 312-555-0145. Questions?",
      expectedKeywords: ['no', 'clear', 'good'],
      goodResponse: "Perfect! Call when loaded. Safe travels!",
      badResponse: "Let me know if you need anything.",
      suggestions: [
        { text: "No questions, all clear. Thanks!", quality: "good" },
        { text: "All good", quality: "normal" },
        { text: "OK", quality: "bad" }
      ]
    }
  ],

  // Scenario 4: Phoenix, AZ → Denver, CO (1,200 miles, Dry Van, 38,000 lbs)
  // Rate: $2.40/mile = $2,880
  [
    { 
      dispatcherMessage: "Hi! Lisa from Desert Logistics. Your Phoenix to Denver load - still available?",
      dispatcherSuggestions: [
        "Hi! Lisa from Desert Logistics. Your Phoenix to Denver load - still available?",
        "Hello, this is Lisa with Desert Logistics. Calling about the Phoenix, AZ to Denver, CO load. Open?",
        "Good morning! Lisa from Desert Logistics here. Saw your Phoenix to Denver posting. Available?",
        "Hey! Lisa, Desert Logistics. Interested in your Phoenix, AZ to Denver, CO run. Still there?",
        "Hi there! This is Lisa from Desert Logistics. Your Phoenix to Denver freight - is it open?",
        "Morning! Lisa with Desert Logistics calling. Phoenix to Denver load - can we discuss?",
        "Hello! Lisa from Desert Logistics. I'm looking at your PHX to DEN load. Still available?",
        "Hi! This is Lisa, Desert Logistics. Calling about the Phoenix to Denver shipment. Open?",
        "Good day! Lisa from Desert Logistics here. Your Phoenix, AZ to Denver, CO load - still there?",
        "Hey there! Lisa with Desert Logistics. Saw your Phoenix to Denver posting. Can we talk?"
      ],
      question: "Hey! Yeah, still open. MC?",
      expectedKeywords: ['mc', 'number', 'authority', '\\d{6}'],
      goodResponse: "Thanks, checking... Okay, good. Phoenix to Denver - 1,200 miles, 38,000 lbs. Pickup today 4-8 PM, deliver in 2 days by 6 PM. Dry van?",
      badResponse: "Need your MC.",
      suggestions: [
        { text: "MC 778899, driver is in Phoenix area", quality: "good" },
        { text: "MC 112233", quality: "normal" },
        { text: "Hold on", quality: "bad" }
      ]
    },
    { 
      question: "You got a 53' dry van ready?",
      expectedKeywords: ['yes', 'dry van', 'van', '53', 'have'],
      goodResponse: "Good. Pickup today 4-8 PM work?",
      badResponse: "Need equipment confirmation.",
      suggestions: [
        { text: "Yes, 53-foot dry van ready to go", quality: "good" },
        { text: "We have dry van", quality: "normal" },
        { text: "Have trailer", quality: "bad" }
      ]
    },
    { 
      question: "Can you pick up today 4-8 PM, deliver in 2 days?",
      expectedKeywords: ['yes', 'today', 'can', 'works'],
      goodResponse: "Perfect. I'm at $2,880 for 1,200 miles. That's $2.40/mile. Work?",
      badResponse: "Need timing confirmation.",
      suggestions: [
        { text: "Yes, driver can be there by 5 PM today", quality: "good" },
        { text: "Today works", quality: "normal" },
        { text: "Maybe", quality: "bad" },
        { text: "Can't do today", quality: "reject" }
      ]
    },
    { 
      question: "$2,880 total. Can you do it?",
      expectedKeywords: ['yes', 'ok', 'deal', 'book'],
      goodResponse: "Great! Sending rate con now. Need your insurance and W9.",
      badResponse: "Yes or no on $2,880?",
      suggestions: [
        { text: "Yes, $2,880 works. Book it", quality: "good" },
        { text: "Can you do $3,000?", quality: "normal" },
        { text: "Need $3,200", quality: "bad" },
        { text: "Too low", quality: "reject" }
      ]
    },
    { 
      question: "Rate con sent! Shipper is Tom at 602-555-0177. Clear?",
      expectedKeywords: ['yes', 'clear', 'good'],
      goodResponse: "Awesome! Call when loaded. Good luck!",
      badResponse: "Questions?",
      suggestions: [
        { text: "All clear, thanks!", quality: "good" },
        { text: "Good", quality: "normal" },
        { text: "OK", quality: "bad" }
      ]
    }
  ],

  // ========================================
  // REEFER SHORT (500-750 miles)
  // ========================================

  // Scenario 5: Seattle, WA → Portland, OR (600 miles, Reefer, 30,000 lbs, 34°F)
  // Rate: $3.20/mile = $1,920
  [
    { 
      dispatcherMessage: "Good morning! Tom from Cold Chain Express. Your Seattle to Portland reefer load - still open?",
      dispatcherSuggestions: [
        "Good morning! Tom from Cold Chain Express. Your Seattle to Portland reefer load - still open?",
        "Hi! This is Tom with Cold Chain Express. Calling about the Seattle, WA to Portland, OR reefer. Available?",
        "Hey there! Tom from Cold Chain Express. Saw your Seattle to Portland reefer posting. Still there?",
        "Morning! Tom, Cold Chain Express here. Interested in the Seattle to Portland reefer run. Open?",
        "Hello! Tom from Cold Chain Express calling. I'm looking at your SEA to PDX reefer load. Available?",
        "Hi! This is Tom with Cold Chain Express. Your Seattle to Portland reefer freight - still open?",
        "Good day! Tom from Cold Chain Express. Seattle, WA to Portland, OR reefer - can we discuss?",
        "Hey! Tom, Cold Chain Express. Your Seattle to Portland reefer load - is it there?",
        "Morning! This is Tom from Cold Chain Express. Seattle to Portland reefer - available?",
        "Hi there! Tom with Cold Chain Express. Saw your Seattle to Portland reefer. Still open?"
      ],
      question: "Morning! Yes, it's available. MC number?",
      expectedKeywords: ['mc', 'number', 'authority', '\\d{6}'],
      goodResponse: "Got it, checking... All good. Seattle to Portland - 600 miles, 30,000 lbs, reefer at 34°F. Pickup tomorrow 6 AM-12 PM, deliver same day by 8 PM. You have reefer?",
      badResponse: "Need MC first.",
      suggestions: [
        { text: "MC 889900, we specialize in reefer", quality: "good" },
        { text: "MC 223344", quality: "normal" },
        { text: "Let me get it", quality: "bad" }
      ]
    },
    { 
      question: "You got a reefer trailer that can maintain 34°F?",
      expectedKeywords: ['yes', 'reefer', 'temperature', 'have', '34'],
      goodResponse: "Perfect. Pickup tomorrow 6 AM-12 PM work?",
      badResponse: "This requires reefer equipment.",
      suggestions: [
        { text: "Yes, 53' reefer ready, can maintain 34°F no problem", quality: "good" },
        { text: "We have reefer", quality: "normal" },
        { text: "Have dry van", quality: "bad" },
        { text: "No reefer", quality: "reject" }
      ]
    },
    { 
      question: "Can you pick up tomorrow morning 6-12, deliver same day by 8 PM?",
      expectedKeywords: ['yes', 'tomorrow', 'can', 'works'],
      goodResponse: "Great. Rate is $1,920 - $3.20 per mile. That work?",
      badResponse: "Need timing confirmation.",
      suggestions: [
        { text: "Yes, driver can be there at 8 AM", quality: "good" },
        { text: "Tomorrow works", quality: "normal" },
        { text: "Maybe", quality: "bad" },
        { text: "Can't do tomorrow", quality: "reject" }
      ]
    },
    { 
      question: "$1,920 for 600 miles. Good?",
      expectedKeywords: ['yes', 'ok', 'deal', 'book'],
      goodResponse: "Excellent! Sending rate con. Keep temp at 34°F throughout.",
      badResponse: "Is $1,920 acceptable?",
      suggestions: [
        { text: "Yes, $1,920 works. Let's book it", quality: "good" },
        { text: "Can you do $2,000?", quality: "normal" },
        { text: "Need $2,200", quality: "bad" },
        { text: "Too low", quality: "reject" }
      ]
    },
    { 
      question: "Rate con sent! Monitor temp closely. Shipper is Dave at 206-555-0188. Questions?",
      expectedKeywords: ['no', 'clear', 'good'],
      goodResponse: "Perfect! Call when loaded. Safe travels!",
      badResponse: "Let me know if you need anything.",
      suggestions: [
        { text: "All clear, we'll monitor temp. Thanks!", quality: "good" },
        { text: "No questions", quality: "normal" },
        { text: "OK", quality: "bad" }
      ]
    }
  ],

  // ========================================
  // REEFER LONG (1000-2000 miles)
  // ========================================

  // Scenario 6: Los Angeles, CA → Chicago, IL (1,800 miles, Reefer, 40,000 lbs, 36°F)
  // Rate: $2.80/mile = $5,040
  [
    { 
      dispatcherMessage: "Hi! Maria from West Coast Reefer. Your LA to Chicago reefer load - still available?",
      dispatcherSuggestions: [
        "Hi! Maria from West Coast Reefer. Your LA to Chicago reefer load - still available?",
        "Hello, this is Maria with West Coast Reefer. Calling about the Los Angeles to Chicago reefer. Open?",
        "Good morning! Maria from West Coast Reefer here. Saw your LA to Chicago reefer posting. Available?",
        "Hey! Maria, West Coast Reefer. Interested in your Los Angeles, CA to Chicago, IL reefer. Still there?",
        "Hi there! This is Maria from West Coast Reefer. Your LA to Chicago reefer freight - is it open?",
        "Morning! Maria with West Coast Reefer calling. LA to Chicago reefer load - can we discuss?",
        "Hello! Maria from West Coast Reefer. I'm looking at your LAX to ORD reefer load. Available?",
        "Hi! This is Maria, West Coast Reefer. Calling about the LA to Chicago reefer shipment. Open?",
        "Good day! Maria from West Coast Reefer here. Your Los Angeles to Chicago reefer - still there?",
        "Hey there! Maria with West Coast Reefer. Saw your LA to Chicago reefer posting. Can we talk?"
      ],
      question: "Hey! Yeah, still open. What's your MC?",
      expectedKeywords: ['mc', 'number', 'authority', '\\d{6}'],
      goodResponse: "Thanks, verifying... Okay, all set. LA to Chicago - 1,800 miles, 40,000 lbs, reefer at 36°F. Pickup tomorrow 8 AM-4 PM, deliver in 3 days by 6 PM. You have reefer?",
      badResponse: "Need MC number.",
      suggestions: [
        { text: "MC 334455, we run reefer cross-country", quality: "good" },
        { text: "MC 556677", quality: "normal" },
        { text: "One sec", quality: "bad" }
      ]
    },
    { 
      question: "You got a reefer that can maintain 36°F for 3 days?",
      expectedKeywords: ['yes', 'reefer', 'temperature', 'have', '36'],
      goodResponse: "Good. Can you do pickup tomorrow 8-4, deliver in 3 days?",
      badResponse: "This requires reefer equipment.",
      suggestions: [
        { text: "Yes, 53' reefer ready, can maintain 36°F throughout", quality: "good" },
        { text: "We have reefer available", quality: "normal" },
        { text: "Have dry van", quality: "bad" },
        { text: "No reefer", quality: "reject" }
      ]
    },
    { 
      question: "Pickup tomorrow, deliver in 3 days. Work?",
      expectedKeywords: ['yes', 'works', 'can', 'sure'],
      goodResponse: "Perfect. Rate is $5,040 - $2.80 per mile. That work for you?",
      badResponse: "Need timeline confirmation.",
      suggestions: [
        { text: "Yes, driver can handle that schedule", quality: "good" },
        { text: "That works", quality: "normal" },
        { text: "Need 4 days", quality: "bad" },
        { text: "Can't make it", quality: "reject" }
      ]
    },
    { 
      question: "$5,040 for 1,800 miles. Good?",
      expectedKeywords: ['yes', 'ok', 'deal', 'book'],
      goodResponse: "Excellent! Sending rate con. Keep temp at 36°F. Email your docs.",
      badResponse: "Is $5,040 acceptable?",
      suggestions: [
        { text: "Yes, $5,040 works. Let's book it", quality: "good" },
        { text: "Can you do $5,400?", quality: "normal" },
        { text: "Need $5,800", quality: "bad" },
        { text: "Rate too low", quality: "reject" }
      ]
    },
    { 
      question: "Rate con sent! Monitor temp closely. Shipper is Carlos at 213-555-0166. Questions?",
      expectedKeywords: ['no', 'clear', 'good'],
      goodResponse: "Great! Call when loaded. Safe travels!",
      badResponse: "Let me know if you need anything.",
      suggestions: [
        { text: "All clear, we'll monitor temp throughout. Thanks!", quality: "good" },
        { text: "No questions", quality: "normal" },
        { text: "OK", quality: "bad" }
      ]
    }
  ],

  // ========================================
  // MORE SHORT HAULS (550-750 miles)
  // ========================================

  // Scenario 7: Houston, TX → New Orleans, LA (550 miles, Dry Van, 25,000 lbs)
  // Rate: $2.80/mile = $1,540
  [
    { 
      dispatcherMessage: "Good afternoon! Carlos from Gulf Coast Transport. Your Houston to New Orleans load - is it open?",
      dispatcherSuggestions: [
        "Good afternoon! Carlos from Gulf Coast Transport. Your Houston to New Orleans load - is it open?",
        "Hi! This is Carlos with Gulf Coast Transport. Calling about the Houston, TX to New Orleans, LA load. Available?",
        "Hey there! Carlos from Gulf Coast Transport. Saw your Houston to New Orleans posting. Still there?",
        "Afternoon! Carlos, Gulf Coast Transport here. Interested in the Houston to New Orleans run. Open?",
        "Hello! Carlos from Gulf Coast Transport calling. I'm looking at your HOU to MSY load. Available?",
        "Hi! This is Carlos with Gulf Coast Transport. Your Houston to New Orleans freight - still open?",
        "Good day! Carlos from Gulf Coast Transport. Houston, TX to New Orleans, LA - can we discuss?",
        "Hey! Carlos, Gulf Coast Transport. Your Houston to New Orleans load - is it there?",
        "Afternoon! This is Carlos from Gulf Coast Transport. Houston to New Orleans - available?",
        "Hi there! Carlos with Gulf Coast Transport. Saw your Houston to New Orleans load. Still open?"
      ],
      question: "Afternoon! Yes, it's open. MC?",
      expectedKeywords: ['mc', 'number', 'authority', '\\d{6}'],
      goodResponse: "Got it, checking... All good. Houston to New Orleans - 550 miles, 25,000 lbs. Pickup today 6-10 PM, deliver tomorrow by 4 PM. Dry van?",
      badResponse: "Need MC number.",
      suggestions: [
        { text: "MC 445566, driver is in Houston now", quality: "good" },
        { text: "MC 778899", quality: "normal" },
        { text: "Let me find it", quality: "bad" }
      ]
    },
    { 
      question: "You got a dry van ready?",
      expectedKeywords: ['yes', 'dry van', 'van', '53', 'have'],
      goodResponse: "Perfect. Can you pick up tonight 6-10 PM?",
      badResponse: "Need equipment type.",
      suggestions: [
        { text: "Yes, 53-foot dry van ready", quality: "good" },
        { text: "Dry van", quality: "normal" },
        { text: "Van", quality: "bad" }
      ]
    },
    { 
      question: "Pickup tonight 6-10 PM, deliver tomorrow by 4. Work?",
      expectedKeywords: ['yes', 'tonight', 'can', 'works'],
      goodResponse: "Great. Rate is $1,540 - $2.80 per mile. That work?",
      badResponse: "Need timing confirmation.",
      suggestions: [
        { text: "Yes, driver can be there by 7 PM tonight", quality: "good" },
        { text: "Tonight works", quality: "normal" },
        { text: "Maybe", quality: "bad" },
        { text: "Can't do tonight", quality: "reject" }
      ]
    },
    { 
      question: "$1,540 for 550 miles. Good?",
      expectedKeywords: ['yes', 'ok', 'deal', 'book'],
      goodResponse: "Excellent! Sending rate con now. Email your docs.",
      badResponse: "Is $1,540 acceptable?",
      suggestions: [
        { text: "Yes, $1,540 works. Book it", quality: "good" },
        { text: "Can you do $1,650?", quality: "normal" },
        { text: "Need $1,800", quality: "bad" },
        { text: "Too low", quality: "reject" }
      ]
    },
    { 
      question: "Rate con sent! Shipper is Jose at 713-555-0155. Questions?",
      expectedKeywords: ['no', 'clear', 'good'],
      goodResponse: "Perfect! Call when loaded. Safe travels!",
      badResponse: "Let me know if you need anything.",
      suggestions: [
        { text: "All clear, thanks!", quality: "good" },
        { text: "No questions", quality: "normal" },
        { text: "OK", quality: "bad" }
      ]
    }
  ],

  // Scenario 8: Indianapolis, IN → Columbus, OH (700 miles, Dry Van, 30,000 lbs)
  // Rate: $2.65/mile = $1,855
  [
    { 
      dispatcherMessage: "Morning! David from Midwest Express. Your Indianapolis to Columbus load - still available?",
      dispatcherSuggestions: [
        "Morning! David from Midwest Express. Your Indianapolis to Columbus load - still available?",
        "Hi! This is David with Midwest Express. Calling about the Indianapolis, IN to Columbus, OH load. Open?",
        "Good morning! David from Midwest Express here. Saw your Indianapolis to Columbus posting. Available?",
        "Hey! David, Midwest Express. Interested in your Indianapolis, IN to Columbus, OH run. Still there?",
        "Hi there! This is David from Midwest Express. Your Indianapolis to Columbus freight - is it open?",
        "Morning! David with Midwest Express calling. Indianapolis to Columbus load - can we discuss?",
        "Hello! David from Midwest Express. I'm looking at your IND to CMH load. Available?",
        "Hi! This is David, Midwest Express. Calling about the Indianapolis to Columbus shipment. Open?",
        "Good day! David from Midwest Express here. Your Indianapolis to Columbus load - still there?",
        "Hey there! David with Midwest Express. Saw your Indianapolis to Columbus posting. Can we talk?"
      ],
      question: "Morning! Yeah, it's open. MC number?",
      expectedKeywords: ['mc', 'number', 'authority', '\\d{6}'],
      goodResponse: "Thanks, verifying... Okay, good. Indianapolis to Columbus - 700 miles, 30,000 lbs. Pickup tomorrow 7 AM-1 PM, deliver next day by 5 PM. Dry van?",
      badResponse: "Need your MC.",
      suggestions: [
        { text: "MC 556677, we run this route weekly", quality: "good" },
        { text: "MC 889900", quality: "normal" },
        { text: "Hold on", quality: "bad" }
      ]
    },
    { 
      question: "You have a 53' dry van?",
      expectedKeywords: ['yes', 'dry van', 'van', '53', 'have'],
      goodResponse: "Good. Pickup tomorrow 7 AM-1 PM work?",
      badResponse: "Need equipment confirmation.",
      suggestions: [
        { text: "Yes, 53-foot dry van ready to go", quality: "good" },
        { text: "We have dry van", quality: "normal" },
        { text: "Have trailer", quality: "bad" }
      ]
    },
    { 
      question: "Can you pick up tomorrow morning 7-1, deliver next day by 5?",
      expectedKeywords: ['yes', 'tomorrow', 'can', 'works'],
      goodResponse: "Perfect. I'm at $1,855 for 700 miles. That's $2.65/mile. Work?",
      badResponse: "Need timing confirmation.",
      suggestions: [
        { text: "Yes, driver can be there at 9 AM tomorrow", quality: "good" },
        { text: "Tomorrow works", quality: "normal" },
        { text: "Maybe", quality: "bad" },
        { text: "Can't do tomorrow", quality: "reject" }
      ]
    },
    { 
      question: "$1,855 total. Can you do it?",
      expectedKeywords: ['yes', 'ok', 'deal', 'book'],
      goodResponse: "Great! Sending rate con now. Need your insurance and W9.",
      badResponse: "Yes or no on $1,855?",
      suggestions: [
        { text: "Yes, $1,855 works. Book it", quality: "good" },
        { text: "Can you do $1,950?", quality: "normal" },
        { text: "Need $2,100", quality: "bad" },
        { text: "Too low", quality: "reject" }
      ]
    },
    { 
      question: "Rate con sent! Shipper is Mark at 317-555-0144. Clear?",
      expectedKeywords: ['yes', 'clear', 'good'],
      goodResponse: "Awesome! Call when loaded. Good luck!",
      badResponse: "Questions?",
      suggestions: [
        { text: "All clear, thanks!", quality: "good" },
        { text: "Good", quality: "normal" },
        { text: "OK", quality: "bad" }
      ]
    }
  ],

  // ========================================
  // MORE MEDIUM HAULS (800-1500 miles)
  // ========================================

  // Scenario 9: Miami, FL → Atlanta, GA → Nashville, TN (1,100 miles, Dry Van, 36,000 lbs)
  // Rate: $2.45/mile = $2,695
  [
    { 
      dispatcherMessage: "Hi! Rachel from Southeast Freight. Your Miami to Nashville load - is it still open?",
      dispatcherSuggestions: [
        "Hi! Rachel from Southeast Freight. Your Miami to Nashville load - is it still open?",
        "Hello, this is Rachel with Southeast Freight. Calling about the Miami, FL to Nashville, TN load. Available?",
        "Good morning! Rachel from Southeast Freight here. Saw your Miami to Nashville posting. Still there?",
        "Hey! Rachel, Southeast Freight. Interested in your Miami, FL to Nashville, TN run. Open?",
        "Hi there! This is Rachel from Southeast Freight. Your Miami to Nashville freight - is it open?",
        "Morning! Rachel with Southeast Freight calling. Miami to Nashville load - can we discuss?",
        "Hello! Rachel from Southeast Freight. I'm looking at your MIA to BNA load. Available?",
        "Hi! This is Rachel, Southeast Freight. Calling about the Miami to Nashville shipment. Open?",
        "Good day! Rachel from Southeast Freight here. Your Miami to Nashville load - still there?",
        "Hey there! Rachel with Southeast Freight. Saw your Miami to Nashville posting. Can we talk?"
      ],
      question: "Hey! Yes, still available. MC?",
      expectedKeywords: ['mc', 'number', 'authority', '\\d{6}'],
      goodResponse: "Thanks, checking... All set. Miami to Nashville - 1,100 miles, 36,000 lbs. Pickup tomorrow 6 AM-12 PM, deliver in 2 days by 6 PM. Dry van?",
      badResponse: "Need MC first.",
      suggestions: [
        { text: "MC 667788, driver is in Miami area", quality: "good" },
        { text: "MC 990011", quality: "normal" },
        { text: "Let me get it", quality: "bad" }
      ]
    },
    { 
      question: "You got a 53-foot dry van available?",
      expectedKeywords: ['yes', 'dry van', 'van', '53', 'have'],
      goodResponse: "Perfect. Can you do pickup tomorrow morning 6-12?",
      badResponse: "Need equipment type.",
      suggestions: [
        { text: "Yes, 53' dry van ready", quality: "good" },
        { text: "Dry van", quality: "normal" },
        { text: "Van", quality: "bad" }
      ]
    },
    { 
      question: "Pickup tomorrow 6-12, deliver in 2 days by 6 PM. Work?",
      expectedKeywords: ['yes', 'tomorrow', 'can', 'works'],
      goodResponse: "Great. Rate is $2,695 - $2.45 per mile. That work?",
      badResponse: "Need timing confirmation.",
      suggestions: [
        { text: "Yes, driver can handle that schedule", quality: "good" },
        { text: "That works", quality: "normal" },
        { text: "Need to check", quality: "bad" },
        { text: "Can't make it", quality: "reject" }
      ]
    },
    { 
      question: "$2,695 for 1,100 miles. Good?",
      expectedKeywords: ['yes', 'ok', 'deal', 'book'],
      goodResponse: "Excellent! Sending rate con. Email your docs to dispatch@company.com",
      badResponse: "Is $2,695 acceptable?",
      suggestions: [
        { text: "Yes, $2,695 works. Let's book it", quality: "good" },
        { text: "Can you do $2,850?", quality: "normal" },
        { text: "Need $3,000", quality: "bad" },
        { text: "Rate too low", quality: "reject" }
      ]
    },
    { 
      question: "Rate con sent! Contact is Steve at 305-555-0133. Questions?",
      expectedKeywords: ['no', 'clear', 'good'],
      goodResponse: "Perfect! Call when loaded. Safe travels!",
      badResponse: "Let me know if you need anything.",
      suggestions: [
        { text: "No questions, all clear. Thanks!", quality: "good" },
        { text: "All good", quality: "normal" },
        { text: "OK", quality: "bad" }
      ]
    }
  ],

  // Scenario 10: Boston, MA → Charlotte, NC (1,400 miles, Dry Van, 38,000 lbs)
  // Rate: $2.35/mile = $3,290
  [
    { 
      dispatcherMessage: "Good morning! Kevin from Northeast Logistics. Your Boston to Charlotte load - still available?",
      dispatcherSuggestions: [
        "Good morning! Kevin from Northeast Logistics. Your Boston to Charlotte load - still available?",
        "Hi! This is Kevin with Northeast Logistics. Calling about the Boston, MA to Charlotte, NC load. Open?",
        "Hey there! Kevin from Northeast Logistics. Saw your Boston to Charlotte posting. Available?",
        "Morning! Kevin, Northeast Logistics here. Interested in the Boston to Charlotte run. Still there?",
        "Hello! Kevin from Northeast Logistics calling. I'm looking at your BOS to CLT load. Available?",
        "Hi! This is Kevin with Northeast Logistics. Your Boston to Charlotte freight - is it open?",
        "Good day! Kevin from Northeast Logistics. Boston, MA to Charlotte, NC - can we discuss?",
        "Hey! Kevin, Northeast Logistics. Your Boston to Charlotte load - is it there?",
        "Morning! This is Kevin from Northeast Logistics. Boston to Charlotte - available?",
        "Hi there! Kevin with Northeast Logistics. Saw your Boston to Charlotte load. Still open?"
      ],
      question: "Morning! Yes, it's open. What's your MC?",
      expectedKeywords: ['mc', 'number', 'authority', '\\d{6}'],
      goodResponse: "Got it, verifying... All good. Boston to Charlotte - 1,400 miles, 38,000 lbs. Pickup today 4-8 PM, deliver in 2 days by 5 PM. Dry van?",
      badResponse: "Need MC number.",
      suggestions: [
        { text: "MC 778899, we run East Coast regularly", quality: "good" },
        { text: "MC 112233", quality: "normal" },
        { text: "Let me find it", quality: "bad" }
      ]
    },
    { 
      question: "You have a 53' dry van ready?",
      expectedKeywords: ['yes', 'dry van', 'van', '53', 'have'],
      goodResponse: "Good. Can you pick up today 4-8 PM?",
      badResponse: "Need equipment confirmation.",
      suggestions: [
        { text: "Yes, 53-foot dry van ready to go", quality: "good" },
        { text: "We have dry van", quality: "normal" },
        { text: "Have trailer", quality: "bad" }
      ]
    },
    { 
      question: "Pickup today 4-8 PM, deliver in 2 days by 5. Work?",
      expectedKeywords: ['yes', 'today', 'can', 'works'],
      goodResponse: "Perfect. I'm at $3,290 for 1,400 miles. That's $2.35/mile. Work?",
      badResponse: "Need timing confirmation.",
      suggestions: [
        { text: "Yes, driver can be there by 5 PM today", quality: "good" },
        { text: "Today works", quality: "normal" },
        { text: "Maybe", quality: "bad" },
        { text: "Can't do today", quality: "reject" }
      ]
    },
    { 
      question: "$3,290 total. Can you do it?",
      expectedKeywords: ['yes', 'ok', 'deal', 'book'],
      goodResponse: "Great! Sending rate con now. Need your insurance and W9.",
      badResponse: "Yes or no on $3,290?",
      suggestions: [
        { text: "Yes, $3,290 works. Book it", quality: "good" },
        { text: "Can you do $3,500?", quality: "normal" },
        { text: "Need $3,700", quality: "bad" },
        { text: "Too low", quality: "reject" }
      ]
    },
    { 
      question: "Rate con sent! Shipper is Paul at 617-555-0122. Clear?",
      expectedKeywords: ['yes', 'clear', 'good'],
      goodResponse: "Awesome! Call when loaded. Good luck!",
      badResponse: "Questions?",
      suggestions: [
        { text: "All clear, thanks!", quality: "good" },
        { text: "Good", quality: "normal" },
        { text: "OK", quality: "bad" }
      ]
    }
  ]
];
