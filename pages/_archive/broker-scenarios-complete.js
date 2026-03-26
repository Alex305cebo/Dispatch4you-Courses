// Complete 10 Scenarios Array - Ready to integrate into simulator.html
// Replace the allScenarios array (around line 2010-2090) with this content

const allScenarios = [
  // Scenario 1: Miami, FL → Atlanta, GA (650 miles, Dry Van, 26,000 lbs)
  [
    {
      dispatcherMessage: "Hello, my name is Alex from Swift Transport. I saw your load on DAT - Miami, FL to Atlanta, GA. Is it still available?",
      question: "Yes, it's available. What's your MC number?",
      expectedKeywords: ['mc', 'number', 'authority', '\\d{6}'],
      goodResponse: "Perfect! Let me pull up your info... All set. Miami, FL to Atlanta, GA - 650 miles, 26,000 lbs. Pickup tomorrow 7 AM-4 PM, delivery next day same window. What equipment do you have?",
      badResponse: "I need your MC number first.",
      suggestions: [
        { text: "My MC number is 123456, we're ready to go", quality: "good" },
        { text: "MC 789012", quality: "normal" },
        { text: "I don't have it with me right now", quality: "bad" }
      ]
    },
    {
      question: "What type of equipment do you have?",
      expectedKeywords: ['dry van', 'van', '53', 'trailer'],
      goodResponse: "Great! Can your driver make pickup tomorrow 7 AM-4 PM?",
      badResponse: "I need to know your equipment type.",
      suggestions: [
        { text: "53-foot dry van with air ride, clean and ready", quality: "good" },
        { text: "Dry van", quality: "normal" },
        { text: "I have a truck", quality: "bad" }
      ]
    },
    {
      question: "Can your driver pick up tomorrow between 7 AM and 4 PM?",
      expectedKeywords: ['yes', 'tomorrow', 'can', 'available'],
      goodResponse: "Perfect! Rate is $1,690 - that's $2.60/mile. Does that work?",
      badResponse: "I need confirmation on pickup timing.",
      suggestions: [
        { text: "Yes, driver will be there at 9 AM tomorrow", quality: "good" },
        { text: "Yes, tomorrow works", quality: "normal" },
        { text: "Maybe, I need to check", quality: "bad" },
        { text: "No, we can't make that window", quality: "reject" }
      ]
    },
    {
      question: "Rate is $1,690 for 650 miles. Can you do it?",
      expectedKeywords: ['yes', 'ok', 'deal', 'accept', 'book'],
      goodResponse: "Excellent! Sending rate con now. Please email W9 and insurance to dispatch@company.com",
      badResponse: "I need a yes or no on $1,690.",
      suggestions: [
        { text: "Yes, $1,690 works perfectly. Let's book it", quality: "good" },
        { text: "Can you do $1,800? That's our minimum", quality: "normal" },
        { text: "That's too low, need at least $2,000", quality: "bad" },
        { text: "No, we can't do this load", quality: "reject" }
      ]
    },
    {
      question: "Great! Rate con sent. Any questions about the load?",
      expectedKeywords: ['no', 'clear', 'good', 'thanks'],
      goodResponse: "Perfect! Call me when driver picks up. Safe travels!",
      badResponse: "Let me know if you need anything.",
      suggestions: [
        { text: "No questions, all clear. We'll update you at pickup", quality: "good" },
        { text: "All good, thanks", quality: "normal" },
        { text: "OK", quality: "bad" }
      ]
    }
  ],

  // Scenario 2: Los Angeles, CA → Chicago, IL (2,000 miles, Reefer, 42,000 lbs)
  [
    {
      dispatcherMessage: "Hi, this is Maria from Reliable Logistics. Calling about your reefer load LA, CA to Chicago, IL. Still open?",
      question: "Yes, still open. What's your MC number?",
      expectedKeywords: ['mc', 'number', 'authority', '\\d{6}'],
      goodResponse: "Thanks! Verified. LA, CA to Chicago, IL - 2,000 miles, 42,000 lbs, reefer at 35°F. Pickup tomorrow, delivery in 3 days. Do you have a reefer?",
      badResponse: "Need your MC first.",
      suggestions: [
        { text: "MC 234567, we specialize in reefer loads", quality: "good" },
        { text: "My MC is 890123", quality: "normal" },
        { text: "Let me find it", quality: "bad" }
      ]
    },
    {
      question: "Do you have a reefer trailer available?",
      expectedKeywords: ['reefer', 'yes', 'temperature', 'have'],
      goodResponse: "Perfect! Can your driver handle 3-day delivery?",
      badResponse: "This requires reefer equipment.",
      suggestions: [
        { text: "Yes, 53ft reefer ready, can maintain 35°F no problem", quality: "good" },
        { text: "We have a reefer available", quality: "normal" },
        { text: "We have a dry van", quality: "bad" },
        { text: "No reefer available", quality: "reject" }
      ]
    },
    {
      question: "Can you do pickup tomorrow and deliver in 3 days?",
      expectedKeywords: ['yes', 'can', 'sure', 'works'],
      goodResponse: "Great! Rate is $5,800 - $2.90/mile. How's that?",
      badResponse: "Need timeline confirmation.",
      suggestions: [
        { text: "Yes, driver can handle that schedule easily", quality: "good" },
        { text: "That works for us", quality: "normal" },
        { text: "Need 4 days minimum", quality: "bad" },
        { text: "Can't make that timeline", quality: "reject" }
      ]
    },
    {
      question: "Rate is $5,800 for 2,000 miles. Can you do it?",
      expectedKeywords: ['yes', 'ok', 'deal', 'accept'],
      goodResponse: "Excellent! Sending rate con and BOL. Email your docs.",
      badResponse: "Need answer on $5,800.",
      suggestions: [
        { text: "Yes, $5,800 is acceptable. Let's book it", quality: "good" },
        { text: "Can you do $6,000? That covers our costs better", quality: "normal" },
        { text: "Need $6,500 minimum", quality: "bad" },
        { text: "Rate is too low, can't do it", quality: "reject" }
      ]
    },
    {
      question: "Rate con sent. Questions about temp requirements?",
      expectedKeywords: ['no', 'clear', 'understand'],
      goodResponse: "Great! Keep at 35°F. Call when loaded!",
      badResponse: "Confirm you understand requirements.",
      suggestions: [
        { text: "No questions, we'll monitor temp throughout", quality: "good" },
        { text: "All clear", quality: "normal" },
        { text: "OK", quality: "bad" }
      ]
    }
  ],

  // Scenario 3: Dallas, TX → Houston, TX (240 miles, Dry Van, 18,000 lbs) - Negotiation
  [
    {
      dispatcherMessage: "Good morning, John from Express Carriers. Your load Dallas, TX to Houston, TX - is it available?",
      question: "Morning! Yes, available. MC number?",
      expectedKeywords: ['mc', 'number', 'authority', '\\d{6}'],
      goodResponse: "Got it. Dallas, TX to Houston, TX - 240 miles, 18,000 lbs. Pickup today 10 AM-2 PM, deliver tomorrow by 10 AM. Equipment?",
      badResponse: "Need MC number.",
      suggestions: [
        { text: "MC 345678, driver is nearby and ready", quality: "good" },
        { text: "MC 901234", quality: "normal" },
        { text: "Can I give it later?", quality: "bad" }
      ]
    },
    {
      question: "What equipment do you have?",
      expectedKeywords: ['dry van', 'van', '53'],
      goodResponse: "Good. Can you pick up today 10 AM-2 PM?",
      badResponse: "Need equipment type.",
      suggestions: [
        { text: "53-foot dry van, driver is 20 minutes away", quality: "good" },
        { text: "Dry van trailer", quality: "normal" },
        { text: "Van", quality: "bad" }
      ]
    },
    {
      question: "Can you pick up today between 10 AM and 2 PM?",
      expectedKeywords: ['yes', 'today', 'can', 'sure'],
      goodResponse: "Okay. Rate is $600 for 240 miles - $2.50/mile.",
      badResponse: "Need pickup confirmation.",
      suggestions: [
        { text: "Yes, driver can be there by noon today", quality: "good" },
        { text: "Yes, today works", quality: "normal" },
        { text: "Maybe later today", quality: "bad" },
        { text: "Can't do today", quality: "reject" }
      ]
    },
    {
      question: "Rate is $600 for 240 miles. Can you do it?",
      expectedKeywords: ['yes', 'ok', 'deal', 'higher', 'more', '\\d+'],
      goodResponse: "Alright, I can go to $650. That's my max. Deal?",
      badResponse: "Is $600 acceptable or not?",
      suggestions: [
        { text: "Can you do $700? That's fair for short notice", quality: "good" },
        { text: "$600 is low, can you do $650?", quality: "normal" },
        { text: "Yes, $600 works", quality: "normal" },
        { text: "Need $800 minimum", quality: "bad" },
        { text: "Can't do this rate", quality: "reject" }
      ]
    },
    {
      question: "Final offer $650. Can we book it?",
      expectedKeywords: ['yes', 'ok', 'deal', 'book'],
      goodResponse: "Great! Sending rate con now.",
      badResponse: "Need yes or no on $650.",
      suggestions: [
        { text: "Yes, $650 works. Let's book it", quality: "good" },
        { text: "OK, deal", quality: "normal" },
        { text: "Still need $700", quality: "bad" },
        { text: "Can't accept that", quality: "reject" }
      ]
    }
  ]
];
,

// Scenario 4: Phoenix, AZ → Denver, CO (600 miles, Dry Van, 32,000 lbs) - URGENT
[
  {
    dispatcherMessage: "Hi! Sarah from Quick Dispatch. URGENT load Phoenix, AZ to Denver, CO. Can you help?",
    question: "Urgent? Let me check. MC number?",
    expectedKeywords: ['mc', 'number', 'authority', '\\d{6}'],
    goodResponse: "Thanks! Phoenix, AZ to Denver, CO - 600 miles, 32,000 lbs. URGENT - pickup in 2 hours, deliver tomorrow noon. Equipment ready?",
    badResponse: "Need MC for urgent loads.",
    suggestions: [
      { text: "MC 456789, driver is ready now for urgent pickup", quality: "good" },
      { text: "My MC is 012345", quality: "normal" },
      { text: "Let me get it", quality: "bad" }
    ]
  },
  {
    question: "This is urgent - 2 hour pickup. Dry van ready NOW?",
    expectedKeywords: ['yes', 'ready', 'now', 'available', 'dry van'],
    goodResponse: "Perfect! Driver can be in Phoenix in 2 hours?",
    badResponse: "Need immediate equipment confirmation.",
    suggestions: [
      { text: "Yes, driver is 30 minutes from Phoenix, ready now", quality: "good" },
      { text: "We have a van ready", quality: "normal" },
      { text: "Driver is 3 hours away", quality: "bad" },
      { text: "Can't make 2 hour pickup", quality: "reject" }
    ]
  },
  {
    question: "Can driver be at pickup in Phoenix in 2 hours?",
    expectedKeywords: ['yes', 'can', 'sure', 'ready'],
    goodResponse: "Excellent! Urgent rate is $1,800 - $3.00/mile premium. Deal?",
    badResponse: "This is time-critical. Can you make it?",
    suggestions: [
      { text: "Yes, driver will be there in 90 minutes", quality: "good" },
      { text: "Yes, we can make it", quality: "normal" },
      { text: "Maybe in 3 hours", quality: "bad" },
      { text: "Can't make that timing", quality: "reject" }
    ]
  },
  {
    question: "Urgent rate $1,800. Can you commit NOW?",
    expectedKeywords: ['yes', 'deal', 'book', 'commit'],
    goodResponse: "Perfect! Sending rate con NOW. Driver must call shipper at 602-555-0199 immediately!",
    badResponse: "Need immediate yes or no.",
    suggestions: [
      { text: "Yes, committed. Driver will call shipper right away", quality: "good" },
      { text: "Yes, book it", quality: "normal" },
      { text: "Need $2,000 for urgent", quality: "bad" },
      { text: "Can't commit to urgent", quality: "reject" }
    ]
  },
  {
    question: "Rate con sent! Driver calling shipper at 602-555-0199 now?",
    expectedKeywords: ['yes', 'calling', 'will call', 'ok'],
    goodResponse: "Great! This is time-critical. Update me every step!",
    badResponse: "Confirm driver will call immediately.",
    suggestions: [
      { text: "Yes, driver is calling them right now", quality: "good" },
      { text: "Will call", quality: "normal" },
      { text: "OK", quality: "bad" }
    ]
  }
],

  // Scenario 5: Seattle, WA → Portland, OR (175 miles, Reefer, 28,000 lbs, Frozen -10°F)
  [
    {
      dispatcherMessage: "Hello, Mike from Cold Chain Logistics. Your reefer load Seattle, WA to Portland, OR - available?",
      question: "Yes, available. MC number please?",
      expectedKeywords: ['mc', 'number', 'authority', '\\d{6}'],
      goodResponse: "Thank you. Seattle, WA to Portland, OR - 175 miles, 28,000 lbs frozen at -10°F. Pickup tomorrow 7-11 AM, deliver same day by 6 PM. Reefer available?",
      badResponse: "Need MC first.",
      suggestions: [
        { text: "MC 567890, we handle frozen loads regularly", quality: "good" },
        { text: "My MC is 123456", quality: "normal" },
        { text: "One moment", quality: "bad" }
      ]
    },
    {
      question: "Do you have reefer that can maintain -10°F?",
      expectedKeywords: ['yes', 'reefer', 'frozen', 'temperature', '-10'],
      goodResponse: "Good. Can you do same-day? Pickup 7-11 AM, deliver by 6 PM?",
      badResponse: "This requires frozen-capable reefer.",
      suggestions: [
        { text: "Yes, reefer can maintain -10°F, pre-cool ready", quality: "good" },
        { text: "We have a reefer", quality: "normal" },
        { text: "We have temperature control", quality: "bad" },
        { text: "No frozen capability", quality: "reject" }
      ]
    },
    {
      question: "Can you do same-day? Pickup morning, deliver by 6 PM?",
      expectedKeywords: ['yes', 'can', 'same day', 'sure'],
      goodResponse: "Perfect! Rate is $525 - $3.00/mile for reefer. Works?",
      badResponse: "Need same-day delivery confirmation.",
      suggestions: [
        { text: "Yes, same-day delivery is no problem for us", quality: "good" },
        { text: "Yes, we can do that", quality: "normal" },
        { text: "Need next day", quality: "bad" },
        { text: "Can't do same-day", quality: "reject" }
      ]
    },
    {
      question: "Rate is $525 for 175 miles reefer. Good?",
      expectedKeywords: ['yes', 'good', 'ok', 'deal'],
      goodResponse: "Excellent! Sending rate con. IMPORTANT: Pre-cool to -10°F before loading!",
      badResponse: "Need answer on $525.",
      suggestions: [
        { text: "Yes, $525 works. We'll pre-cool trailer", quality: "good" },
        { text: "That's good", quality: "normal" },
        { text: "Need $600", quality: "bad" },
        { text: "Rate too low", quality: "reject" }
      ]
    },
    {
      question: "Rate con sent. Remember: pre-cool to -10°F. Questions?",
      expectedKeywords: ['no', 'clear', 'understand'],
      goodResponse: "Perfect! Monitor temp throughout. Call if issues!",
      badResponse: "Confirm you understand temp requirements.",
      suggestions: [
        { text: "No questions, will pre-cool and monitor temp", quality: "good" },
        { text: "All clear", quality: "normal" },
        { text: "OK", quality: "bad" }
      ]
    }
  ],

  // Scenario 6: New York, NY → Boston, MA (215 miles, Dry Van, 22,000 lbs)
  [
    {
      dispatcherMessage: "Hi, Tom from Northeast Freight. Load New York, NY to Boston, MA. Still open?",
      question: "Yes, open. What's your MC?",
      expectedKeywords: ['mc', 'number', 'authority', '\\d{6}'],
      goodResponse: "Got it. New York, NY to Boston, MA - 215 miles, 22,000 lbs. Pickup tomorrow 6 AM-12 PM, deliver same day by 8 PM. Equipment?",
      badResponse: "MC number needed.",
      suggestions: [
        { text: "MC 678901, we run this lane regularly", quality: "good" },
        { text: "MC 234567", quality: "normal" },
        { text: "I'll find it", quality: "bad" }
      ]
    },
    {
      question: "What equipment available?",
      expectedKeywords: ['dry van', 'van', '53'],
      goodResponse: "Great! Can you do same-day delivery?",
      badResponse: "Need equipment info.",
      suggestions: [
        { text: "53ft dry van, familiar with NYC pickups", quality: "good" },
        { text: "Dry van ready", quality: "normal" },
        { text: "Truck", quality: "bad" }
      ]
    },
    {
      question: "Pickup tomorrow 6 AM-12 PM, deliver by 8 PM same day?",
      expectedKeywords: ['yes', 'can', 'sure', 'works'],
      goodResponse: "Perfect! Rate is $645 - $3.00/mile. Works?",
      badResponse: "Need timing confirmation.",
      suggestions: [
        { text: "Yes, driver knows the route, no problem", quality: "good" },
        { text: "Yes, that works", quality: "normal" },
        { text: "Maybe", quality: "bad" },
        { text: "Can't make same-day", quality: "reject" }
      ]
    },
    {
      question: "Rate $645 for 215 miles. Can you do it?",
      expectedKeywords: ['yes', 'ok', 'deal', 'accept'],
      goodResponse: "Excellent! Sending rate con. NYC pickup can be tricky - allow extra time.",
      badResponse: "Need answer on $645.",
      suggestions: [
        { text: "Yes, $645 is good. Driver knows NYC well", quality: "good" },
        { text: "Can you do $700?", quality: "normal" },
        { text: "Yes, $645 works", quality: "normal" },
        { text: "Need $800", quality: "bad" },
        { text: "Can't do it", quality: "reject" }
      ]
    },
    {
      question: "Rate con sent. Questions about NYC pickup?",
      expectedKeywords: ['no', 'clear', 'good'],
      goodResponse: "Great! Call if any issues. Safe travels!",
      badResponse: "Let me know if questions.",
      suggestions: [
        { text: "No questions, we're experienced with NYC", quality: "good" },
        { text: "All good", quality: "normal" },
        { text: "OK", quality: "bad" }
      ]
    }
  ],

  // Scenario 7: Atlanta, GA → Nashville, TN (250 miles, Dry Van, 35,000 lbs)
  [
    {
      dispatcherMessage: "Good afternoon, Lisa from Southern Logistics. Load Atlanta, GA to Nashville, TN. Available?",
      question: "Afternoon! Yes, available. MC?",
      expectedKeywords: ['mc', 'number', 'authority', '\\d{6}'],
      goodResponse: "Thanks. Atlanta, GA to Nashville, TN - 250 miles, 35,000 lbs. Pickup today 2-6 PM, deliver tomorrow by noon. Equipment?",
      badResponse: "Need MC.",
      suggestions: [
        { text: "MC 789012, driver is in Atlanta now", quality: "good" },
        { text: "MC 345678", quality: "normal" },
        { text: "Let me check", quality: "bad" }
      ]
    },
    {
      question: "Equipment type?",
      expectedKeywords: ['dry van', 'van', '53'],
      goodResponse: "Good. Can you pick up today 2-6 PM?",
      badResponse: "Need equipment.",
      suggestions: [
        { text: "53ft dry van, can pick up at 3 PM today", quality: "good" },
        { text: "Dry van", quality: "normal" },
        { text: "Van", quality: "bad" }
      ]
    },
    {
      question: "Pickup today 2-6 PM, deliver tomorrow by noon?",
      expectedKeywords: ['yes', 'today', 'can', 'sure'],
      goodResponse: "Perfect! Rate is $750 - $3.00/mile. Works?",
      badResponse: "Need pickup confirmation.",
      suggestions: [
        { text: "Yes, driver will pick up at 3 PM today", quality: "good" },
        { text: "Yes, works", quality: "normal" },
        { text: "Maybe later", quality: "bad" },
        { text: "Can't do today", quality: "reject" }
      ]
    },
    {
      question: "Rate $750 for 250 miles. Good?",
      expectedKeywords: ['yes', 'ok', 'deal', 'accept'],
      goodResponse: "Great! Sending rate con now.",
      badResponse: "Is $750 acceptable?",
      suggestions: [
        { text: "Yes, $750 is perfect. Let's book it", quality: "good" },
        { text: "Can you do $800?", quality: "normal" },
        { text: "Yes, $750 works", quality: "normal" },
        { text: "Need $900", quality: "bad" },
        { text: "Can't accept", quality: "reject" }
      ]
    },
    {
      question: "Rate con sent. Any questions?",
      expectedKeywords: ['no', 'clear', 'good'],
      goodResponse: "Perfect! Safe travels!",
      badResponse: "Let me know if questions.",
      suggestions: [
        { text: "No questions, we'll update you at pickup", quality: "good" },
        { text: "All clear", quality: "normal" },
        { text: "OK", quality: "bad" }
      ]
    }
  ],

  // Scenario 8: Memphis, TN → St. Louis, MO (285 miles, Dry Van, 38,000 lbs)
  [
    {
      dispatcherMessage: "Hello, David from Midwest Transport. Your load Memphis, TN to St. Louis, MO - open?",
      question: "Yes, open. MC number?",
      expectedKeywords: ['mc', 'number', 'authority', '\\d{6}'],
      goodResponse: "Got it. Memphis, TN to St. Louis, MO - 285 miles, 38,000 lbs. Pickup tomorrow 8 AM-2 PM, deliver next day by 5 PM. Equipment?",
      badResponse: "MC needed.",
      suggestions: [
        { text: "MC 890123, we service this route weekly", quality: "good" },
        { text: "MC 456789", quality: "normal" },
        { text: "One sec", quality: "bad" }
      ]
    },
    {
      question: "What equipment?",
      expectedKeywords: ['dry van', 'van', '53'],
      goodResponse: "Good. Pickup tomorrow 8 AM-2 PM works?",
      badResponse: "Equipment type?",
      suggestions: [
        { text: "53ft dry van with air ride, ready to go", quality: "good" },
        { text: "Dry van available", quality: "normal" },
        { text: "Van", quality: "bad" }
      ]
    },
    {
      question: "Pickup tomorrow 8 AM-2 PM, deliver next day by 5 PM?",
      expectedKeywords: ['yes', 'tomorrow', 'can', 'works'],
      goodResponse: "Perfect! Rate is $855 - $3.00/mile. Works?",
      badResponse: "Confirm timing.",
      suggestions: [
        { text: "Yes, driver will pick up at 10 AM tomorrow", quality: "good" },
        { text: "Yes, that works", quality: "normal" },
        { text: "Maybe", quality: "bad" },
        { text: "Can't make it", quality: "reject" }
      ]
    },
    {
      question: "Rate $855 for 285 miles. Can you do it?",
      expectedKeywords: ['yes', 'ok', 'deal', 'accept'],
      goodResponse: "Excellent! Sending rate con.",
      badResponse: "Need answer on $855.",
      suggestions: [
        { text: "Yes, $855 works great. Let's book it", quality: "good" },
        { text: "Can you do $900?", quality: "normal" },
        { text: "Yes, $855 is fine", quality: "normal" },
        { text: "Need $1,000", quality: "bad" },
        { text: "Can't do it", quality: "reject" }
      ]
    },
    {
      question: "Rate con sent. Questions?",
      expectedKeywords: ['no', 'clear', 'good'],
      goodResponse: "Great! Safe travels!",
      badResponse: "Any questions?",
      suggestions: [
        { text: "No questions, all set", quality: "good" },
        { text: "All clear", quality: "normal" },
        { text: "OK", quality: "bad" }
      ]
    }
  ],

  // Scenario 9: San Francisco, CA → Las Vegas, NV (570 miles, Dry Van, 30,000 lbs)
  [
    {
      dispatcherMessage: "Hi, Rachel from West Coast Freight. Load San Francisco, CA to Las Vegas, NV. Available?",
      question: "Yes, available. MC?",
      expectedKeywords: ['mc', 'number', 'authority', '\\d{6}'],
      goodResponse: "Thanks. San Francisco, CA to Las Vegas, NV - 570 miles, 30,000 lbs. Pickup tomorrow 7 AM-3 PM, deliver next day by 6 PM. Equipment?",
      badResponse: "MC first.",
      suggestions: [
        { text: "MC 901234, driver knows this route well", quality: "good" },
        { text: "MC 567890", quality: "normal" },
        { text: "Hold on", quality: "bad" }
      ]
    },
    {
      question: "Equipment available?",
      expectedKeywords: ['dry van', 'van', '53'],
      goodResponse: "Good. Pickup tomorrow 7 AM-3 PM?",
      badResponse: "Equipment?",
      suggestions: [
        { text: "53ft dry van, clean and ready", quality: "good" },
        { text: "Dry van", quality: "normal" },
        { text: "Truck", quality: "bad" }
      ]
    },
    {
      question: "Pickup tomorrow 7 AM-3 PM, deliver next day by 6 PM?",
      expectedKeywords: ['yes', 'tomorrow', 'can', 'works'],
      goodResponse: "Perfect! Rate is $1,710 - $3.00/mile. Works?",
      badResponse: "Timing works?",
      suggestions: [
        { text: "Yes, driver will pick up at 9 AM tomorrow", quality: "good" },
        { text: "Yes, works", quality: "normal" },
        { text: "Maybe", quality: "bad" },
        { text: "Can't do it", quality: "reject" }
      ]
    },
    {
      question: "Rate $1,710 for 570 miles. Good?",
      expectedKeywords: ['yes', 'ok', 'deal', 'accept'],
      goodResponse: "Excellent! Sending rate con.",
      badResponse: "Is $1,710 good?",
      suggestions: [
        { text: "Yes, $1,710 is perfect. Book it", quality: "good" },
        { text: "Can you do $1,800?", quality: "normal" },
        { text: "Yes, $1,710 works", quality: "normal" },
        { text: "Need $2,000", quality: "bad" },
        { text: "Can't accept", quality: "reject" }
      ]
    },
    {
      question: "Rate con sent. Questions?",
      expectedKeywords: ['no', 'clear', 'good'],
      goodResponse: "Great! Safe travels!",
      badResponse: "Any questions?",
      suggestions: [
        { text: "No questions, we're all set", quality: "good" },
        { text: "All clear", quality: "normal" },
        { text: "OK", quality: "bad" }
      ]
    }
  ],

  // Scenario 10: Detroit, MI → Cleveland, OH (170 miles, Dry Van, 25,000 lbs)
  [
    {
      dispatcherMessage: "Good morning, Chris from Great Lakes Logistics. Load Detroit, MI to Cleveland, OH. Open?",
      question: "Morning! Yes, open. MC?",
      expectedKeywords: ['mc', 'number', 'authority', '\\d{6}'],
      goodResponse: "Got it. Detroit, MI to Cleveland, OH - 170 miles, 25,000 lbs. Pickup today 1-5 PM, deliver tomorrow by 10 AM. Equipment?",
      badResponse: "MC needed.",
      suggestions: [
        { text: "MC 012345, driver is in Detroit area now", quality: "good" },
        { text: "MC 678901", quality: "normal" },
        { text: "Let me find it", quality: "bad" }
      ]
    },
    {
      question: "Equipment type?",
      expectedKeywords: ['dry van', 'van', '53'],
      goodResponse: "Good. Pickup today 1-5 PM?",
      badResponse: "Equipment?",
      suggestions: [
        { text: "53ft dry van, can pick up at 2 PM today", quality: "good" },
        { text: "Dry van", quality: "normal" },
        { text: "Van", quality: "bad" }
      ]
    },
    {
      question: "Pickup today 1-5 PM, deliver tomorrow by 10 AM?",
      expectedKeywords: ['yes', 'today', 'can', 'works'],
      goodResponse: "Perfect! Rate is $510 - $3.00/mile. Works?",
      badResponse: "Timing good?",
      suggestions: [
        { text: "Yes, driver will pick up at 2 PM today", quality: "good" },
        { text: "Yes, works", quality: "normal" },
        { text: "Maybe later", quality: "bad" },
        { text: "Can't do today", quality: "reject" }
      ]
    },
    {
      question: "Rate $510 for 170 miles. Good?",
      expectedKeywords: ['yes', 'ok', 'deal', 'accept'],
      goodResponse: "Excellent! Sending rate con.",
      badResponse: "Is $510 acceptable?",
      suggestions: [
        { text: "Yes, $510 works perfectly. Let's book it", quality: "good" },
        { text: "Can you do $550?", quality: "normal" },
        { text: "Yes, $510 is fine", quality: "normal" },
        { text: "Need $600", quality: "bad" },
        { text: "Can't accept", quality: "reject" }
      ]
    },
    {
      question: "Rate con sent. Questions?",
      expectedKeywords: ['no', 'clear', 'good'],
      goodResponse: "Great! Safe travels!",
      badResponse: "Any questions?",
      suggestions: [
        { text: "No questions, all set", quality: "good" },
        { text: "All clear", quality: "normal" },
        { text: "OK", quality: "bad" }
      ]
    }
  ]
];
