// 10 Advanced Broker Scenarios with Quality Grading
// This file is included in ai-chat.html

const allScenarios = [
  // Scenario 1: Miami, FL → Atlanta, GA
  [
    { dispatcherMessage: "Hello, my name is Alex from Swift Transport. I saw your load on DAT - Miami, FL to Atlanta, GA. Is it still available?",
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
    { question: "What type of equipment do you have?",
      expectedKeywords: ['dry van', 'van', '53', 'trailer'],
      goodResponse: "Great! Can your driver make pickup tomorrow 7 AM-4 PM?",
      badResponse: "I need to know your equipment type.",
      suggestions: [
        { text: "53-foot dry van with air ride, clean and ready", quality: "good" },
        { text: "Dry van", quality: "normal" },
        { text: "I have a truck", quality: "bad" }
      ]
    },
    { question: "Can your driver pick up tomorrow between 7 AM and 4 PM?",
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
    { question: "Rate is $1,690 for 650 miles. Can you do it?",
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
    { question: "Great! Rate con sent. Any questions about the load?",
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

  // Scenario 2: Los Angeles, CA → Chicago, IL
  [
    { dispatcherMessage: "Hi, this is Maria from Reliable Logistics. Calling about your reefer load LA, CA to Chicago, IL. Still open?",
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
    { question: "Do you have a reefer trailer available?",
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
    { question: "Can you do pickup tomorrow and deliver in 3 days?",
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
    { question: "Rate is $5,800 for 2,000 miles. Can you do it?",
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
    { question: "Rate con sent. Questions about temp requirements?",
      expectedKeywords: ['no', 'clear', 'understand'],
      goodResponse: "Great! Keep at 35°F. Call when loaded!",
      badResponse: "Confirm you understand requirements.",
      suggestions: [
        { text: "No questions, we'll monitor temp throughout", quality: "good" },
        { text: "All clear", quality: "normal" },
        { text: "OK", quality: "bad" }
      ]
    }
  ]
];
