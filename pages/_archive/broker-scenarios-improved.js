// УЛУЧШЕННАЯ СИСТЕМА ДИАЛОГОВ С БРОКЕРОМ
// Динамичные ответы, без тупиков, реалистичные переговоры

const improvedBrokerScenarios = [
  {
    id: 1,
    route: "Chicago IL → Dallas TX",
    distance: 967,
    equipment: "Dry Van",
    weight: "42,000 lbs",
    baseRate: 2.20,
    baseTotalRate: 2127,
    
    // Шаг 1: Приветствие диспетчера
    step1: {
      dispatcherPrompt: "Поздоровайтесь с брокером и спросите о грузе",
      dispatcherOptions: [
        { text: "Good morning! I'm calling about your Chicago to Dallas load. Is it still available?", quality: "good" },
        { text: "Hi, this is [Name] from [Company]. I saw your posting for Chicago-Dallas. Still open?", quality: "good" },
        { text: "Hello! Interested in the Chicago to Dallas run. Can you tell me about it?", quality: "good" },
        { text: "Hey, you got that Chicago load?", quality: "normal" },
        { text: "Load available?", quality: "bad" }
      ],
      brokerResponses: [
        "Good morning! Yes, it's still available. It's a 967-mile run from Chicago IL to Dallas TX. 42,000 lbs dry van freight. Pickup tomorrow at 8 AM, delivery in 2 days by 5 PM. Are you interested?",
        "Hi there! Yes, the load is open. Chicago to Dallas, 967 miles, dry van, 42,000 lbs. Pickup is tomorrow morning, delivery day after tomorrow by end of day. Does that work for your schedule?",
        "Hello! Yes, we still need a truck for this one. It's Chicago IL to Dallas TX, 967 miles, standard dry van, 42,000 lbs. Pickup tomorrow 8 AM, delivery in 2 days. Interested?"
      ]
    },
    
    // Шаг 2: Детали груза и оборудования
    step2: {
      dispatcherPrompt: "Узнайте детали о грузе и оборудовании",
      dispatcherOptions: [
        { text: "Yes, I'm interested. What type of freight is it? Any special requirements for the trailer?", quality: "good" },
        { text: "Sounds good. What exactly am I hauling? Standard dry van okay?", quality: "good" },
        { text: "I can cover it. Tell me more about the freight and equipment needed.", quality: "good" },
        { text: "What kind of trailer?", quality: "normal" },
        { text: "Equipment?", quality: "bad" }
      ],
      brokerResponses: [
        "It's general cargo - packaged goods, nothing hazardous. Standard 53-foot dry van is perfect. No special equipment needed. The shipper loads efficiently, usually takes about an hour. Weight is well distributed at 42,000 lbs.",
        "You'll be hauling packaged consumer goods. Any standard dry van works - 53 footer is ideal. Nothing temperature-sensitive or hazardous. The shipper is professional, loads fast. 42,000 lbs, so you're well under weight limits.",
        "It's packaged freight, general merchandise. Standard dry van, 53 feet. No special requirements - no lift gate, no side doors needed. Shipper is reliable, loads in about 45 minutes to an hour. 42,000 lbs total weight."
      ]
    },
    
    // Шаг 3: Адреса и время
    step3: {
      dispatcherPrompt: "Спросите точные адреса и время погрузки/разгрузки",
      dispatcherOptions: [
        { text: "Perfect. Can you give me the exact pickup and delivery addresses? Any appointment times?", quality: "good" },
        { text: "What are the shipper and receiver addresses? Do I need appointments?", quality: "good" },
        { text: "I need the full addresses and appointment windows for both ends.", quality: "good" },
        { text: "Where exactly?", quality: "normal" },
        { text: "Address?", quality: "bad" }
      ],
      brokerResponses: [
        "Pickup: 1250 Industrial Parkway, Chicago IL 60601, tomorrow at 8 AM. Contact is Mike at 555-0100. Delivery: 3400 Distribution Center Dr, Dallas TX 75201, day after tomorrow by 5 PM. Contact Sarah at 555-0200. Both have 2-hour windows.",
        "Sure! Shipper: 1250 Industrial Pkwy, Chicago IL 60601, tomorrow 8-10 AM window. Mike 555-0100. Receiver: 3400 Distribution Dr, Dallas TX 75201, delivery by 5 PM day after tomorrow. Sarah 555-0200. Both are flexible with the windows.",
        "Pickup address: 1250 Industrial Parkway, Chicago IL 60601. Tomorrow between 8-10 AM. Contact Mike 555-0100. Delivery: 3400 Distribution Center Drive, Dallas TX 75201. Day after tomorrow, must arrive by 5 PM. Contact Sarah 555-0200."
      ]
    },
    
    // Шаг 4: Вопрос о ставке
    step4: {
      dispatcherPrompt: "Спросите о ставке за груз",
      dispatcherOptions: [
        { text: "Sounds good. What's your rate for this load?", quality: "good" },
        { text: "Alright. What are you offering per mile or total?", quality: "good" },
        { text: "What's the rate? All-in or per mile?", quality: "good" },
        { text: "How much you paying?", quality: "normal" },
        { text: "Rate?", quality: "bad" }
      ],
      brokerResponses: [
        "I'm offering $2.20 per mile, which comes to $2,127 total for the 967 miles. It's a solid rate for this lane. The shipper and receiver are both reliable - no detention issues. What do you think?",
        "The rate is $2.20 per mile, so $2,127 all-in for 967 miles. It's competitive for Chicago-Dallas. Both ends are professional, so it should be a smooth run. Does that work for you?",
        "I can offer $2.20 per mile on this one. That's $2,127 total. It's a fair rate for the distance, and you'll have no problems at either end. They're both good facilities. Interested at that rate?"
      ]
    },
    
    // Шаг 5: Факторинг
    step5: {
      dispatcherPrompt: "Спросите о факторинговой компании",
      dispatcherOptions: [
        { text: "What factoring company do you work with? We only get paid through factoring.", quality: "good" },
        { text: "Which factoring companies are you set up with? That's how we handle payment.", quality: "good" },
        { text: "Do you work with factoring? We need to verify that first.", quality: "good" },
        { text: "What factoring?", quality: "normal" },
        { text: "Factoring?", quality: "bad" }
      ],
      brokerResponses: [
        "We work with RTS Financial, RTS Pro, Triumph Business Capital, and Saint John Capital. Which one do you use? I can verify we're in their system right now and get you set up for quick payment.",
        "We're set up with several - RTS Financial, RTS Pro, Triumph, and Saint John Capital. What factoring company do you work with? I'll confirm we're approved with them.",
        "Yes, we work with factoring. We're approved with RTS Financial, RTS Pro, Triumph Business Capital, and Saint John Capital. Which one are you with? I can check our status with them immediately."
      ]
    },
    
    // Шаг 6: Переговоры о ставке
    step6: {
      dispatcherPrompt: "Договоритесь о ставке или предложите свою",
      dispatcherOptions: [
        { text: "We use RTS Financial. The rate is a bit low for me. Can you do $2.55 per mile? That's $2,466 total.", quality: "good", offerRate: 2.55 }, // +16%
        { text: "I'm with Triumph. Can you bump it up to $2.65 per mile? That would be $2,562.", quality: "good", offerRate: 2.65 }, // +20%
        { text: "We work with Saint John. I need $2.75 per mile to make this work. That's $2,659 total.", quality: "good", offerRate: 2.75 }, // +25%
        { text: "Can you do $2.40 per mile? That's $2,321 total.", quality: "normal", offerRate: 2.40 }, // +9%
        { text: "I need at least $3.00 per mile.", quality: "bad", offerRate: 3.00 }, // +36%
        { text: "$2.20 works for me. Let's book it.", quality: "good", offerRate: 2.20 } // Accept
      ],
      brokerResponseLogic: function(offerRate, baseRate) {
        const increase = ((offerRate - baseRate) / baseRate) * 100;
        
        if (offerRate === baseRate) {
          // Accepted original rate
          return [
            "Perfect! I'm glad we could work together. Let me get your information and we'll get this booked right away.",
            "Excellent! I appreciate you working with me on this. Let's get your details and book this load.",
            "Great! I'm happy we could agree. Let me grab your MC number and we'll get the paperwork started."
          ];
        } else if (increase >= 15 && increase <= 25) {
          // Success range
          return [
            `You know what, let me talk to my manager... Okay, I got approval for $${offerRate.toFixed(2)} per mile. That's $${(offerRate * 967).toFixed(0)} total. It's a fair rate for both of us. Let's book it!`,
            `I hear you on the costs. Give me one second... Alright, my manager approved $${offerRate.toFixed(2)} per mile, so $${(offerRate * 967).toFixed(0)} total. That works for us. Can we book it?`,
            `Let me see what I can do... Okay, I can make $${offerRate.toFixed(2)} per mile work. That's $${(offerRate * 967).toFixed(0)} all-in. It's a good rate for this lane. Deal?`
          ];
        } else if (increase > 0 && increase < 15) {
          // Counter-offer
          const counterRate = baseRate + ((offerRate - baseRate) * 0.6);
          return [
            `$${offerRate.toFixed(2)} is a bit high for me. How about we meet at $${counterRate.toFixed(2)} per mile? That's $${(counterRate * 967).toFixed(0)} total. It's the best I can do on this one.`,
            `I appreciate the counter, but $${offerRate.toFixed(2)} is above my budget. Can we do $${counterRate.toFixed(2)} per mile instead? That's $${(counterRate * 967).toFixed(0)}. It's fair for the distance.`,
            `$${offerRate.toFixed(2)} is tough for me. What if we split the difference at $${counterRate.toFixed(2)} per mile? That's $${(counterRate * 967).toFixed(0)} total. That's my best offer.`
          ];
        } else {
          // Reject - too high
          const maxRate = baseRate * 1.15;
          return [
            `I understand you need to make money, but $${offerRate.toFixed(2)} per mile is way above market rate for this lane. The absolute maximum I can offer is $${maxRate.toFixed(2)} per mile. If that doesn't work, I'll need to call the next carrier.`,
            `$${offerRate.toFixed(2)} is too high for our budget on this load. The highest I can go is $${maxRate.toFixed(2)} per mile, which is $${(maxRate * 967).toFixed(0)} total. If that doesn't work, I understand.`,
            `I wish I could do $${offerRate.toFixed(2)}, but it's just not in the budget. My ceiling is $${maxRate.toFixed(2)} per mile. If you can't do that, no hard feelings - I'll keep looking.`
          ];
        }
      }
    },
    
    // Шаг 7: Финальное согласование или контр-предложение
    step7: {
      dispatcherPrompt: "Примите предложение брокера или сделайте финальное предложение",
      dispatcherOptions: [
        { text: "Perfect! We use RTS Financial. That rate works for me. Let's book it!", quality: "good" },
        { text: "Good, we're with Triumph. Deal! What do you need from me?", quality: "good" },
        { text: "We work with Saint John Capital. Sounds good. Let's get this booked.", quality: "good" },
        { text: "Can you go just a bit higher? Maybe $2.70 per mile?", quality: "normal" },
        { text: "I'll have to pass. Thanks anyway.", quality: "bad" }
      ],
      brokerResponses: [
        "Excellent! I'm glad we could work it out. Let me get your MC number and contact information.",
        "Great! I appreciate you working with me. What's your MC number and email for the rate confirmation?",
        "Perfect! Let's get this booked. I need your MC number, driver name, and contact info."
      ]
    },
    
    // Шаг 8: MC номер и подтверждение
    step8: {
      dispatcherPrompt: "Предоставьте MC номер и контактную информацию",
      dispatcherOptions: [
        { text: "MC number is 123456. Email: dispatch@company.com, phone: 555-1234", quality: "good" },
        { text: "Sure! MC# 123456, driver John Smith, phone 555-9999, email ops@transport.com", quality: "good" },
        { text: "MC 123456, contact: dispatch@logistics.com, driver will call from 555-8888", quality: "good" },
        { text: "MC 123456", quality: "normal" },
        { text: "123456", quality: "bad" }
      ],
      brokerResponses: [
        "Perfect! I've got MC 123456. Rate confirmation is going to your email right now. Pickup: 1250 Industrial Pkwy, Chicago IL 60601, tomorrow 8 AM, contact Mike 555-0100. Delivery: 3400 Distribution Dr, Dallas TX 75201, day after tomorrow by 5 PM, contact Sarah 555-0200. Safe travels!",
        "Excellent! MC 123456 confirmed. I'm sending the rate con to your email now. You should see it in a few minutes. Pickup tomorrow at 8 AM in Chicago, delivery day after tomorrow by 5 PM in Dallas. Call me if you need anything!",
        "Great! Got your MC 123456. Rate confirmation is on its way to your email. Make sure your driver contacts Mike at 555-0100 for pickup tomorrow at 8 AM. Delivery contact is Sarah at 555-0200. Have a safe trip!"
      ]
    }
  }
];

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = improvedBrokerScenarios;
}
