// ПРОФЕССИОНАЛЬНАЯ СИСТЕМА ДИАЛОГОВ ДИСПЕТЧЕР-БРОКЕР
// Реалистичные переговоры на основе реальной практики грузоперевозок в США

const professionalScenarios = [
  {
    id: 1,
    route: "Chicago IL → Dallas TX",
    distance: 967,
    equipment: "53' Dry Van",
    weight: "44,000 lbs",
    commodity: "General Freight",
    baseRate: 2.15,
    baseTotalRate: 2079,
    
    conversation: [
      // ШАГ 1: Приветствие и запрос о грузе
      {
        step: 1,
        stage: "greeting",
        dispatcherPrompt: "Представьтесь и спросите о доступности груза",
        dispatcherOptions: [
          { 
            text: "Good morning, this is Alex from Swift Logistics. I'm calling about your Chicago to Dallas posting on DAT. Is the load still available?", 
            quality: "excellent",
            points: 10
          },
          { 
            text: "Hi, my name is Mike with ABC Transport. I saw your load from Chicago to Dallas. Is it still open?", 
            quality: "good",
            points: 8
          },
          { 
            text: "Hello, I'm interested in the Chicago-Dallas load. Still available?", 
            quality: "acceptable",
            points: 6
          },
          { 
            text: "Hey, got a load Chicago to Dallas?", 
            quality: "poor",
            points: 3
          }
        ],
        brokerResponses: [
          "Good morning! Yes, the load is still available. It's 967 miles from Chicago Illinois to Dallas Texas. We need a 53-foot dry van for 44,000 pounds of general freight. Pickup is scheduled for tomorrow at 0800 hours, delivery is due day after tomorrow by 1700. Does this fit your schedule?",
          "Hi there! Yes, it's open. Chicago to Dallas, 967 miles, dry van freight, 44,000 pounds. We're looking at pickup tomorrow morning at 8 AM, delivery the following day by 5 PM. Can you cover this?",
          "Good morning! The load is available. Origin is Chicago IL, destination Dallas TX, 967 miles total. Standard dry van, 44,000 lbs. Pickup tomorrow 0800, delivery day after by 1700. Are you interested?"
        ]
      },
      
      // ШАГ 2: Детали груза и требования
      {
        step: 2,
        stage: "details",
        dispatcherPrompt: "Уточните детали груза и требования к оборудованию",
        dispatcherOptions: [
          { 
            text: "Yes, I can cover it. Can you provide more details on the commodity? Any special handling requirements or equipment specifications?", 
            quality: "excellent",
            points: 10
          },
          { 
            text: "I'm interested. What exactly am I hauling? Standard dry van with air ride okay?", 
            quality: "good",
            points: 8
          },
          { 
            text: "What kind of freight is it? Any special requirements?", 
            quality: "acceptable",
            points: 6
          },
          { 
            text: "What am I hauling?", 
            quality: "poor",
            points: 3
          }
        ],
        brokerResponses: [
          "It's palletized general merchandise - consumer goods, non-hazmat. Standard 53-foot dry van with air ride suspension is perfect. No special endorsements needed. The shipper is very efficient, typically loads in 45 minutes to an hour. They're professional and respect appointment times.",
          "You'll be hauling packaged consumer products, all palletized. Any standard dry van works - air ride preferred but not required. Nothing hazardous, no special permits needed. Shipper loads quickly, usually under an hour. They're a regular customer of ours.",
          "General freight, packaged goods on pallets. Standard dry van equipment, 53 footer. No hazmat, no special requirements. The shipper is reliable and loads efficiently. Weight is well distributed at 44,000 pounds."
        ]
      },
      
      // ШАГ 3: Адреса и контакты
      {
        step: 3,
        stage: "locations",
        dispatcherPrompt: "Запросите точные адреса и контактную информацию",
        dispatcherOptions: [
          { 
            text: "Perfect. I'll need the complete shipper and consignee information - addresses, contact names, phone numbers, and any appointment requirements.", 
            quality: "excellent",
            points: 10
          },
          { 
            text: "Can you give me the pickup and delivery addresses with contact information?", 
            quality: "good",
            points: 8
          },
          { 
            text: "What are the addresses and contacts?", 
            quality: "acceptable",
            points: 6
          },
          { 
            text: "Where exactly?", 
            quality: "poor",
            points: 3
          }
        ],
        brokerResponses: [
          "Shipper: ABC Distribution Center, 2450 Industrial Boulevard, Chicago IL 60608. Contact is Robert Martinez, phone 312-555-0147. Appointment window is 0800-1000 tomorrow. Consignee: XYZ Warehouse, 5800 Logistics Drive, Dallas TX 75212. Contact is Jennifer Williams, 214-555-0293. Delivery window is 1500-1700 day after tomorrow. Both facilities have dock scheduling systems.",
          "Pickup location: ABC Distribution, 2450 Industrial Blvd, Chicago IL 60608. Contact Robert at 312-555-0147, appointment 8-10 AM tomorrow. Delivery: XYZ Warehouse, 5800 Logistics Dr, Dallas TX 75212. Contact Jennifer 214-555-0293, delivery by 5 PM day after tomorrow. Both are professional facilities.",
          "Origin: 2450 Industrial Boulevard, Chicago Illinois 60608, ABC Distribution Center. Robert Martinez 312-555-0147. Tomorrow 0800-1000. Destination: 5800 Logistics Drive, Dallas Texas 75212, XYZ Warehouse. Jennifer Williams 214-555-0293. Day after tomorrow by 1700."
        ]
      },
      
      // ШАГ 4: Обсуждение ставки
      {
        step: 4,
        stage: "rate_inquiry",
        dispatcherPrompt: "Спросите о ставке за перевозку",
        dispatcherOptions: [
          { 
            text: "Everything sounds good. What's your rate for this shipment? Are we talking all-in or per mile?", 
            quality: "excellent",
            points: 10
          },
          { 
            text: "Alright. What rate are you offering on this load?", 
            quality: "good",
            points: 8
          },
          { 
            text: "What's the rate?", 
            quality: "acceptable",
            points: 6
          },
          { 
            text: "How much?", 
            quality: "poor",
            points: 3
          }
        ],
        brokerResponses: [
          "I'm offering $2.15 per mile, which comes to $2,079 all-in for the 967 miles. This is a competitive rate for the Chicago-Dallas lane. Both the shipper and consignee are top-tier facilities with no detention history. The load is ready to go, and we can have you booked within the hour. What are your thoughts on this rate?",
          "The rate is $2.15 per mile, total of $2,079 for 967 miles. It's a fair market rate for this lane. You'll have no issues at either end - both facilities are professional and efficient. We work with them regularly. Does this rate work for you?",
          "I can offer $2.15 per mile on this load. That's $2,079 total for the 967-mile run. It's competitive for the Chicago-Dallas corridor. The shipper and receiver are both reliable - you won't have any problems. Interested at this rate?"
        ]
      },
      
      // ШАГ 5: Условия оплаты
      {
        step: 5,
        stage: "payment_terms",
        dispatcherPrompt: "Уточните условия оплаты",
        dispatcherOptions: [
          { 
            text: "The rate is in the ballpark. Before we discuss numbers further, what are your payment terms? We work exclusively through factoring companies.", 
            quality: "excellent",
            points: 10
          },
          { 
            text: "What factoring companies do you work with? We need to verify payment terms first.", 
            quality: "good",
            points: 8
          },
          { 
            text: "Do you work with factoring companies?", 
            quality: "acceptable",
            points: 6
          },
          { 
            text: "Payment terms?", 
            quality: "poor",
            points: 3
          }
        ],
        brokerResponses: [
          "We work with all major factoring companies. We're approved with RTS Financial, Triumph Business Capital, OTR Solutions, and TBS Factoring. We also work with eCapital, Apex Capital, and several others. Which factoring company do you use? I can verify our status with them right now and confirm the advance rate.",
          "Yes, we're set up with factoring. We work with RTS, Triumph, OTR Solutions, TBS, and most of the major ones. What company are you with? I'll confirm we're approved and get you the details on advance rates and timing.",
          "We work with factoring companies - RTS Financial, Triumph, OTR, TBS, and others. Which one do you use? I can check our approval status with them immediately."
        ]
      },
      
      // ШАГ 6: Переговоры о ставке
      {
        step: 6,
        stage: "negotiation",
        dispatcherPrompt: "Договоритесь о ставке или предложите контр-оффер",
        dispatcherOptions: [
          { 
            text: "We use Triumph Business Capital. Regarding the rate - I need to be at $2.50 per mile to make this work with our operating costs. That would be $2,418 total. Can you work with that?", 
            quality: "excellent",
            points: 10,
            counterRate: 2.50
          },
          { 
            text: "We're with RTS Financial. I need $2.45 per mile, which is $2,369 total. Can you approve that rate?", 
            quality: "good",
            points: 8,
            counterRate: 2.45
          },
          { 
            text: "We work with OTR Solutions. Can you do $2.35 per mile? That's $2,272 total.", 
            quality: "acceptable",
            points: 6,
            counterRate: 2.35
          },
          { 
            text: "I need $2.80 per mile minimum.", 
            quality: "poor",
            points: 2,
            counterRate: 2.80
          },
          { 
            text: "We use TBS Factoring. Your rate of $2.15 works for us. Let's book it.", 
            quality: "excellent",
            points: 10,
            counterRate: 2.15
          }
        ],
        brokerResponseLogic: function(counterRate, baseRate) {
          const percentIncrease = ((counterRate - baseRate) / baseRate) * 100;
          
          if (counterRate === baseRate) {
            return [
              "Excellent! I'm glad we're on the same page. Let me get your MC number and we'll get the paperwork started immediately. I'll have the rate confirmation in your email within 15 minutes.",
              "Perfect! I appreciate you working with us on this. What's your MC number? I'll get the rate con sent over right away and we'll get this load covered.",
              "Great! Let's get this booked. I need your MC number, DOT number, and the best email for the rate confirmation. We'll have everything processed quickly."
            ];
          }
          
          if (percentIncrease >= 8 && percentIncrease <= 18) {
            const approvedRate = baseRate + ((counterRate - baseRate) * 0.7);
            return [
              `I understand your position on operating costs. Let me reach out to my manager... Okay, I got approval for $${approvedRate.toFixed(2)} per mile. That's $${(approvedRate * 967).toFixed(0)} total. This is the best I can do while keeping the load profitable for both of us. Can we move forward at this rate?`,
              `$${counterRate.toFixed(2)} is higher than I initially budgeted, but let me see what I can do... Alright, my manager approved $${approvedRate.toFixed(2)} per mile, which is $${(approvedRate * 967).toFixed(0)} all-in. That's my absolute maximum. Does that work for you?`,
              `I hear you on the operating costs. Give me a moment to check with management... Okay, I can go up to $${approvedRate.toFixed(2)} per mile. That's $${(approvedRate * 967).toFixed(0)} total. That's the highest I can offer on this load. Can we agree on that?`
            ];
          }
          
          if (percentIncrease > 18 && percentIncrease <= 30) {
            const maxRate = baseRate * 1.12;
            return [
              `$${counterRate.toFixed(2)} per mile is significantly above market rate for this lane. I've checked with my manager, and the absolute maximum we can offer is $${maxRate.toFixed(2)} per mile, which is $${(maxRate * 967).toFixed(0)} total. This is our final offer. If this doesn't work, I'll need to move on to other carriers. Let me know quickly.`,
              `I understand you need to cover your costs, but $${counterRate.toFixed(2)} is beyond our budget for this shipment. The highest I'm authorized to go is $${maxRate.toFixed(2)} per mile - that's $${(maxRate * 967).toFixed(0)} all-in. That's my ceiling. Can you work with that, or should I keep looking?`,
              `$${counterRate.toFixed(2)} per mile is too high for this load. I've pushed as hard as I can, and $${maxRate.toFixed(2)} per mile is the maximum - $${(maxRate * 967).toFixed(0)} total. That's my final number. Yes or no?`
            ];
          }
          
          return [
            `I appreciate your interest, but $${counterRate.toFixed(2)} per mile is well above market rate for Chicago-Dallas. I can't justify that to my customer. My maximum is $${(baseRate * 1.10).toFixed(2)} per mile. If that doesn't work, I understand, and I wish you the best. I need to keep moving on this load.`,
            `$${counterRate.toFixed(2)} is too far from where I need to be. The highest I can possibly go is $${(baseRate * 1.10).toFixed(2)} per mile. If you can't do that, no hard feelings - I'll call the next carrier on my list. Let me know right now.`
          ];
        }
      },
      
      // ШАГ 7: Финальное подтверждение
      {
        step: 7,
        stage: "final_confirmation",
        dispatcherPrompt: "Подтвердите согласие или сделайте финальное предложение",
        dispatcherOptions: [
          { 
            text: "That works for me. Let's get this booked. I'm ready to provide all necessary information.", 
            quality: "excellent",
            points: 10
          },
          { 
            text: "Agreed. Let's move forward with the booking.", 
            quality: "good",
            points: 8
          },
          { 
            text: "Okay, deal. What do you need from me?", 
            quality: "acceptable",
            points: 6
          },
          { 
            text: "Can you go just a little higher? Maybe $2.60 per mile?", 
            quality: "negotiating",
            points: 5
          },
          { 
            text: "I'll have to pass. Thank you for your time.", 
            quality: "declining",
            points: 0
          }
        ],
        brokerResponses: [
          "Perfect! I'm glad we could reach an agreement. Let's get this load covered. I'll need your MC number, DOT number, your company's legal name, and the best email address for the rate confirmation. Also, please provide your driver's name and cell phone number.",
          "Excellent! Let's get the paperwork started. I need your MC and DOT numbers, company name, email for the rate con, and your driver's contact information. I'll have everything sent over within 15 minutes.",
          "Great! To book this, I need: MC number, DOT number, company legal name, email for rate confirmation, and driver details. Once I have that, I'll send the rate con immediately."
        ],
        declineResponse: [
          "I understand. Thank you for your time and for considering the load. If your situation changes or you're looking for other opportunities, feel free to reach out. Good luck with your search, and have a great day!",
          "No problem at all. I appreciate you taking the time to discuss this with me. If you need anything in the future, don't hesitate to call. Safe travels!"
        ]
      },
      
      // ШАГ 8: Предоставление информации и завершение
      {
        step: 8,
        stage: "booking",
        dispatcherPrompt: "Предоставьте всю необходимую информацию для бронирования",
        dispatcherOptions: [
          { 
            text: "MC number: 123456, DOT: 789012, Company: Swift Logistics LLC. Email: dispatch@swiftlogistics.com. Driver: John Smith, phone: 555-0199. We're ready to roll.", 
            quality: "excellent",
            points: 10
          },
          { 
            text: "MC 123456, DOT 789012, Swift Logistics LLC, dispatch@swiftlogistics.com, driver John Smith 555-0199", 
            quality: "good",
            points: 8
          },
          { 
            text: "MC 123456, email dispatch@swiftlogistics.com, driver John Smith", 
            quality: "acceptable",
            points: 6
          },
          { 
            text: "MC 123456", 
            quality: "poor",
            points: 3
          }
        ],
        brokerResponses: [
          "Perfect! I have all your information: MC 123456, DOT 789012, Swift Logistics LLC. Rate confirmation is being sent to dispatch@swiftlogistics.com right now - you should receive it within 5 minutes. Driver John Smith should contact Robert Martinez at 312-555-0147 upon arrival at ABC Distribution Center, 2450 Industrial Boulevard, Chicago IL 60608, tomorrow between 0800-1000. Delivery is at XYZ Warehouse, 5800 Logistics Drive, Dallas TX 75212, contact Jennifer Williams 214-555-0293, day after tomorrow by 1700. Please have your driver call if there are any issues. Safe travels, and thank you for your business!",
          "Excellent! Got everything: MC 123456, DOT 789012, Swift Logistics. Rate con is going out to dispatch@swiftlogistics.com now. Make sure John Smith contacts the shipper at 312-555-0147 before arrival tomorrow. Pickup at 2450 Industrial Blvd, Chicago, 8-10 AM. Delivery at 5800 Logistics Dr, Dallas, by 5 PM day after tomorrow. Call me if you need anything. Thanks!",
          "Great! MC 123456 confirmed. Rate confirmation sent to dispatch@swiftlogistics.com. Pickup: ABC Distribution, 2450 Industrial Boulevard, Chicago IL 60608, tomorrow 0800-1000, contact Robert 312-555-0147. Delivery: XYZ Warehouse, 5800 Logistics Drive, Dallas TX 75212, day after tomorrow by 1700, contact Jennifer 214-555-0293. Have a safe trip!"
        ]
      }
    ]
  },

  // SCENARIO 2: Los Angeles CA → Phoenix AZ (373 miles, Reefer, 40,000 lbs)
  {
    id: 2,
    route: "Los Angeles CA → Phoenix AZ",
    distance: 373,
    equipment: "53' Reefer",
    weight: "40,000 lbs",
    commodity: "Produce",
    baseRate: 2.85,
    baseTotalRate: 1063,
    
    conversation: [
      {
        step: 1,
        stage: "greeting",
        dispatcherPrompt: "Представьтесь и спросите о доступности груза",
        dispatcherOptions: [
          { text: "Good afternoon, this is Carlos from Pacific Freight Solutions. I'm calling about your Los Angeles to Phoenix reefer load. Is it still available?", quality: "excellent", points: 10 },
          { text: "Hi, Carlos with Pacific Freight. I saw your LA to Phoenix reefer posting. Still open?", quality: "good", points: 8 },
          { text: "Hello, interested in the LA-Phoenix reefer load. Available?", quality: "acceptable", points: 6 },
          { text: "Hey, got a reefer load to Phoenix?", quality: "poor", points: 3 }
        ],
        brokerResponses: [
          "Good afternoon Carlos! Yes, the load is available. It's 373 miles from Los Angeles California to Phoenix Arizona. We need a 53-foot reefer for 40,000 pounds of produce at 34°F. Pickup is tomorrow at 0600 hours, delivery same day by 1800. Can you handle temperature-controlled freight?",
          "Hi Carlos! Yes, it's open. LA to Phoenix, 373 miles, reefer load, 40,000 lbs produce. Temperature needs to be maintained at 34°F. Pickup tomorrow 6 AM, delivery same day by 6 PM. Do you have a reefer available?",
          "Good afternoon! The load is available. Origin Los Angeles CA, destination Phoenix AZ, 373 miles. Reefer required for produce, 40,000 pounds, 34 degrees. Pickup 0600 tomorrow, delivery 1800 same day. Interested?"
        ]
      },
      {
        step: 2,
        stage: "details",
        dispatcherPrompt: "Уточните детали груза и требования к оборудованию",
        dispatcherOptions: [
          { text: "Yes, we specialize in produce. I have a 53-foot reefer ready. Can you confirm the exact temperature requirements and any pre-cool specifications?", quality: "excellent", points: 10 },
          { text: "We have a reefer available. What's the exact temperature needed? Any special handling?", quality: "good", points: 8 },
          { text: "We can do reefer loads. What temperature?", quality: "acceptable", points: 6 },
          { text: "Got a reefer. What else?", quality: "poor", points: 3 }
        ],
        brokerResponses: [
          "Perfect! Temperature must be maintained at 34°F throughout transit - this is fresh produce, very temperature-sensitive. Trailer must be pre-cooled to 34°F before loading. The load is palletized lettuce and tomatoes. Shipper will inspect trailer temperature before loading. No stops allowed during transit to maintain cold chain integrity.",
          "Great! You'll need to maintain 34 degrees Fahrenheit the entire trip. Pre-cool your trailer before arrival. It's palletized produce - lettuce and tomatoes. The shipper is strict about temperature, so make sure your reefer is working perfectly. Direct route, no stops.",
          "Temperature is 34°F constant. Pre-cool required before loading. Palletized produce, temperature-critical. Shipper will check your reefer unit before loading. This is a direct run, no stops permitted."
        ]
      },
      {
        step: 3,
        stage: "locations",
        dispatcherPrompt: "Запросите точные адреса и контактную информацию",
        dispatcherOptions: [
          { text: "Understood. I'll need the complete shipper and receiver information - addresses, contact names, phone numbers, and dock appointment procedures.", quality: "excellent", points: 10 },
          { text: "Can you provide the pickup and delivery addresses with contact information?", quality: "good", points: 8 },
          { text: "What are the addresses?", quality: "acceptable", points: 6 },
          { text: "Where?", quality: "poor", points: 3 }
        ],
        brokerResponses: [
          "Shipper: Fresh Harvest Distribution, 8900 Produce Avenue, Los Angeles CA 90058. Contact is Miguel Rodriguez, phone 213-555-0188. Appointment is 0600-0700 tomorrow - must be on time. Receiver: Desert Fresh Markets, 4200 Distribution Way, Phoenix AZ 85043. Contact is Amanda Chen, 602-555-0277. Delivery window 1600-1800 same day. Both facilities have strict appointment policies.",
          "Pickup: Fresh Harvest Distribution, 8900 Produce Ave, Los Angeles CA 90058. Miguel Rodriguez 213-555-0188, appointment 6-7 AM tomorrow sharp. Delivery: Desert Fresh Markets, 4200 Distribution Way, Phoenix AZ 85043. Amanda Chen 602-555-0277, delivery 4-6 PM same day. Don't be late to either location.",
          "Origin: 8900 Produce Avenue, Los Angeles California 90058, Fresh Harvest Distribution. Miguel Rodriguez 213-555-0188. Tomorrow 0600-0700 sharp. Destination: 4200 Distribution Way, Phoenix Arizona 85043, Desert Fresh Markets. Amanda Chen 602-555-0277. Same day 1600-1800."
        ]
      },
      {
        step: 4,
        stage: "rate_inquiry",
        dispatcherPrompt: "Спросите о ставке за перевозку",
        dispatcherOptions: [
          { text: "Everything is clear. What's your rate for this temperature-controlled shipment?", quality: "excellent", points: 10 },
          { text: "What rate are you offering for this reefer load?", quality: "good", points: 8 },
          { text: "What's the rate?", quality: "acceptable", points: 6 },
          { text: "How much?", quality: "poor", points: 3 }
        ],
        brokerResponses: [
          "I'm offering $2.85 per mile for this reefer load, which comes to $1,063 all-in for 373 miles. This is a premium rate for temperature-controlled produce. The shipper and receiver are both top-tier facilities with excellent loading/unloading efficiency. This is a same-day turnaround, so you can get another load quickly. How does this rate work for you?",
          "The rate is $2.85 per mile, total of $1,063 for 373 miles. It's a good reefer rate for this short haul. Both facilities are professional - no detention issues. Same-day delivery means quick turnaround for your next load. Does this work?",
          "I can offer $2.85 per mile on this reefer load. That's $1,063 total for the 373-mile run. Premium rate for temperature-controlled. Fast turnaround, professional facilities. Interested?"
        ]
      },
      {
        step: 5,
        stage: "payment_terms",
        dispatcherPrompt: "Уточните условия оплаты",
        dispatcherOptions: [
          { text: "The rate is competitive. Before we proceed, what are your payment terms? We work with factoring companies for immediate payment.", quality: "excellent", points: 10 },
          { text: "What factoring companies do you work with? We need quick payment on produce loads.", quality: "good", points: 8 },
          { text: "Do you work with factoring?", quality: "acceptable", points: 6 },
          { text: "Payment?", quality: "poor", points: 3 }
        ],
        brokerResponses: [
          "We work with all major factoring companies. We're approved with RTS Financial, Triumph Business Capital, OTR Solutions, TBS Factoring, eCapital, and Apex Capital. For produce loads, we understand the importance of quick payment. Which factoring company do you use? I can verify our approval status and advance rate immediately.",
          "Yes, we work with factoring. We're set up with RTS, Triumph, OTR, TBS, eCapital, Apex, and others. We know produce carriers need fast payment. What company are you with? I'll confirm we're approved.",
          "We work with factoring - RTS Financial, Triumph, OTR Solutions, TBS, and most major ones. Which one do you use? I'll check our status right now."
        ]
      },
      {
        step: 6,
        stage: "negotiation",
        dispatcherPrompt: "Договоритесь о ставке или предложите контр-оффер",
        dispatcherOptions: [
          { text: "We use RTS Financial. Regarding the rate - with fuel costs and the tight delivery window, I need $3.10 per mile. That would be $1,156 total. Can you approve that?", quality: "excellent", points: 10, counterRate: 3.10 },
          { text: "We're with Triumph. Can you do $3.00 per mile? That's $1,119 total.", quality: "good", points: 8, counterRate: 3.00 },
          { text: "We work with OTR Solutions. Can you do $2.95 per mile? That's $1,100.", quality: "acceptable", points: 6, counterRate: 2.95 },
          { text: "Need $3.50 per mile minimum.", quality: "poor", points: 2, counterRate: 3.50 },
          { text: "We use TBS Factoring. Your rate of $2.85 works for us. Let's book it.", quality: "excellent", points: 10, counterRate: 2.85 }
        ],
        brokerResponseLogic: function(counterRate, baseRate) {
          const percentIncrease = ((counterRate - baseRate) / baseRate) * 100;
          
          if (counterRate === baseRate) {
            return [
              "Excellent! I'm glad we're aligned. Let me get your MC number and we'll process this immediately. Rate confirmation will be in your email within 10 minutes.",
              "Perfect! I appreciate your professionalism. What's your MC number? I'll get the paperwork sent over right away.",
              "Great! Let's get this booked. I need your MC number, DOT number, and email for the rate confirmation."
            ];
          }
          
          if (percentIncrease >= 5 && percentIncrease <= 12) {
            const approvedRate = baseRate + ((counterRate - baseRate) * 0.75);
            return [
              `I understand the fuel costs on this route. Let me check with my manager... Okay, I got approval for ${approvedRate.toFixed(2)} per mile. That's ${(approvedRate * 373).toFixed(0)} total. This is the best I can do on this load. Can we move forward?`,
              `${counterRate.toFixed(2)} is higher than budgeted, but let me see what I can do... My manager approved ${approvedRate.toFixed(2)} per mile, which is ${(approvedRate * 373).toFixed(0)} all-in. That's my maximum. Does that work?`,
              `I hear you on the tight window. Give me a moment... Okay, I can go up to ${approvedRate.toFixed(2)} per mile. That's ${(approvedRate * 373).toFixed(0)} total. That's the highest I can offer. Can we agree on that?`
            ];
          }
          
          if (percentIncrease > 12 && percentIncrease <= 20) {
            const maxRate = baseRate * 1.08;
            return [
              `${counterRate.toFixed(2)} per mile is above market rate for this lane, even for reefer. I've checked with management, and the absolute maximum we can offer is ${maxRate.toFixed(2)} per mile, which is ${(maxRate * 373).toFixed(0)} total. This is our final offer. Can you work with that?`,
              `I understand your position, but ${counterRate.toFixed(2)} is beyond our budget. The highest I'm authorized to go is ${maxRate.toFixed(2)} per mile - that's ${(maxRate * 373).toFixed(0)} all-in. That's my ceiling. Yes or no?`,
              `${counterRate.toFixed(2)} per mile is too high for this shipment. I've pushed as hard as I can, and ${maxRate.toFixed(2)} per mile is the maximum - ${(maxRate * 373).toFixed(0)} total. That's my final number. Can you do it?`
            ];
          }
          
          return [
            `I appreciate your interest, but ${counterRate.toFixed(2)} per mile is well above market rate for LA-Phoenix reefer. My maximum is ${(baseRate * 1.06).toFixed(2)} per mile. If that doesn't work, I understand, and I need to move on to other carriers.`,
            `${counterRate.toFixed(2)} is too far from where I need to be. The highest I can go is ${(baseRate * 1.06).toFixed(2)} per mile. If you can't do that, no hard feelings - I'll call the next carrier. Let me know right now.`
          ];
        }
      },
      {
        step: 7,
        stage: "final_confirmation",
        dispatcherPrompt: "Подтвердите согласие или сделайте финальное предложение",
        dispatcherOptions: [
          { text: "That works for me. Let's book this load. I'm ready to provide all necessary information.", quality: "excellent", points: 10 },
          { text: "Agreed. Let's move forward.", quality: "good", points: 8 },
          { text: "Okay, deal. What do you need?", quality: "acceptable", points: 6 },
          { text: "Can you go just a bit higher? Maybe $3.15 per mile?", quality: "negotiating", points: 5 },
          { text: "I'll have to pass. Thank you for your time.", quality: "declining", points: 0 }
        ],
        brokerResponses: [
          "Perfect! Let's get this covered. I'll need your MC number, DOT number, your company's legal name, and the best email address for the rate confirmation. Also, please provide your driver's name and cell phone number. Remember - trailer must be pre-cooled to 34°F before arrival.",
          "Excellent! To book this, I need: MC number, DOT number, company name, email for rate con, and driver details. Make sure your driver pre-cools the trailer to 34°F before pickup.",
          "Great! I need your MC and DOT numbers, company legal name, email for rate confirmation, and driver contact info. Critical: pre-cool trailer to 34°F before loading."
        ],
        declineResponse: [
          "I understand. Thank you for considering the load. If your situation changes or you're looking for other reefer opportunities, feel free to reach out. Good luck and safe travels!",
          "No problem at all. I appreciate your time. If you need anything in the future, don't hesitate to call. Have a great day!"
        ]
      },
      {
        step: 8,
        stage: "booking",
        dispatcherPrompt: "Предоставьте всю необходимую информацию для бронирования",
        dispatcherOptions: [
          { text: "MC number: 234567, DOT: 890123, Company: Pacific Freight Solutions LLC. Email: dispatch@pacificfreight.com. Driver: Roberto Martinez, phone: 555-0288. Trailer will be pre-cooled to 34°F.", quality: "excellent", points: 10 },
          { text: "MC 234567, DOT 890123, Pacific Freight Solutions, dispatch@pacificfreight.com, driver Roberto Martinez 555-0288", quality: "good", points: 8 },
          { text: "MC 234567, email dispatch@pacificfreight.com, driver Roberto Martinez", quality: "acceptable", points: 6 },
          { text: "MC 234567", quality: "poor", points: 3 }
        ],
        brokerResponses: [
          "Perfect! I have all your information: MC 234567, DOT 890123, Pacific Freight Solutions LLC. Rate confirmation is being sent to dispatch@pacificfreight.com right now. Driver Roberto Martinez must contact Miguel Rodriguez at 213-555-0188 before arrival tomorrow at 0600. CRITICAL: Trailer must be pre-cooled to 34°F - shipper will verify before loading. Pickup at Fresh Harvest Distribution, 8900 Produce Avenue, Los Angeles CA 90058. Delivery at Desert Fresh Markets, 4200 Distribution Way, Phoenix AZ 85043, contact Amanda Chen 602-555-0277, same day by 1800. Monitor temperature throughout transit. Call me immediately if any issues. Safe travels!",
          "Excellent! Got everything: MC 234567, DOT 890123, Pacific Freight Solutions. Rate con going to dispatch@pacificfreight.com now. Roberto must call Miguel at 213-555-0188 before arrival. MUST pre-cool to 34°F! Pickup at 8900 Produce Ave, LA, 6-7 AM. Delivery at 4200 Distribution Way, Phoenix, by 6 PM same day. Watch that temperature!",
          "Great! MC 234567 confirmed. Rate confirmation sent to dispatch@pacificfreight.com. Pickup: Fresh Harvest, 8900 Produce Avenue, Los Angeles CA 90058, tomorrow 0600-0700, contact Miguel 213-555-0188. PRE-COOL TO 34°F! Delivery: Desert Fresh, 4200 Distribution Way, Phoenix AZ 85043, same day by 1800, contact Amanda 602-555-0277. Safe trip!"
        ]
      }
    ]
  }
];

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
  module.exports = professionalScenarios;
}


  // SCENARIO 3: Miami FL → Atlanta GA (665 miles, Dry Van, 38,000 lbs)
  {
    id: 3,
    route: "Miami FL → Atlanta GA",
    distance: 665,
    equipment: "53' Dry Van",
    weight: "38,000 lbs",
    commodity: "Electronics",
    baseRate: 2.40,
    baseTotalRate: 1596,
    
    conversation: [
      {
        step: 1,
        stage: "greeting",
        dispatcherPrompt: "Представьтесь и спросите о доступности груза",
        dispatcherOptions: [
          { text: "Good morning, this is Jennifer from Southeast Transport Group. I'm calling about your Miami to Atlanta load posted on the board. Is it still available?", quality: "excellent", points: 10 },
          { text: "Hi, Jennifer with Southeast Transport. I saw your Miami-Atlanta posting. Still open?", quality: "good", points: 8 },
          { text: "Hello, interested in Miami to Atlanta load. Available?", quality: "acceptable", points: 6 },
          { text: "Hey, Miami load still there?", quality: "poor", points: 3 }
        ],
        brokerResponses: [
          "Good morning Jennifer! Yes, the load is available. It's 665 miles from Miami Florida to Atlanta Georgia. We need a 53-foot dry van for 38,000 pounds of electronics. Pickup is tomorrow at 0800 hours, delivery in two days by 1700. This is high-value freight requiring extra security. Can you handle this type of shipment?",
          "Hi Jennifer! Yes, it's open. Miami to Atlanta, 665 miles, dry van, 38,000 lbs electronics. Pickup tomorrow 8 AM, delivery day after by 5 PM. This is valuable cargo - need secure transport. Can you do it?",
          "Good morning! Load is available. Origin Miami FL, destination Atlanta GA, 665 miles. Dry van, 38,000 pounds electronics. Pickup 0800 tomorrow, delivery two days 1700. High-value freight. Interested?"
        ]
      },
      {
        step: 2,
        stage: "details",
        dispatcherPrompt: "Уточните детали груза и требования к оборудованию",
        dispatcherOptions: [
          { text: "Yes, we handle high-value electronics regularly. I have a 53-foot dry van with air ride and cargo insurance up to $250,000. Can you confirm the security requirements and any special handling instructions?", quality: "excellent", points: 10 },
          { text: "We can handle electronics. What are the security requirements? Any special handling?", quality: "good", points: 8 },
          { text: "We do electronics loads. What's required?", quality: "acceptable", points: 6 },
          { text: "Got a van. What else?", quality: "poor", points: 3 }
        ],
        brokerResponses: [
          "Excellent! This is palletized electronics - laptops and tablets, total value $180,000. You'll need cargo insurance minimum $100,000 per occurrence. No team drivers required, but driver must not leave truck unattended at any time during transit. Overnight parking must be at secure truck stops only - no rest areas. Trailer must have working door seals. Any stops must be reported to dispatch immediately.",
          "Great! It's palletized electronics, valued at $180,000. Need minimum $100,000 cargo insurance. Driver cannot leave truck unattended - secure parking only, no rest areas. Door seals required. Report any stops to us immediately. Standard dry van with air ride is fine.",
          "Perfect! Palletized electronics, $180,000 value. Minimum $100K cargo insurance required. No unattended parking, secure locations only. Door seals mandatory. Driver must report all stops. Air ride dry van needed."
        ]
      },
      {
        step: 3,
        stage: "locations",
        dispatcherPrompt: "Запросите точные адреса и контактную информацию",
        dispatcherOptions: [
          { text: "Understood on security protocols. I'll need the complete shipper and receiver information - full addresses, contact names, phone numbers, and appointment procedures.", quality: "excellent", points: 10 },
          { text: "Can you provide the pickup and delivery addresses with contacts?", quality: "good", points: 8 },
          { text: "What are the addresses?", quality: "acceptable", points: 6 },
          { text: "Where?", quality: "poor", points: 3 }
        ],
        brokerResponses: [
          "Shipper: TechDirect Warehouse, 5500 Northwest 36th Street, Miami FL 33166. Contact is David Kim, phone 305-555-0199. Appointment tomorrow 0800-1000 - must arrive on time for security clearance. Receiver: Southern Electronics Distribution, 2800 Greenbriar Parkway, Atlanta GA 30331. Contact is Lisa Thompson, 404-555-0244. Delivery window day after tomorrow 1500-1700. Both facilities require driver ID and will inspect trailer seals.",
          "Pickup: TechDirect Warehouse, 5500 NW 36th St, Miami FL 33166. David Kim 305-555-0199, appointment 8-10 AM tomorrow - security clearance required. Delivery: Southern Electronics Distribution, 2800 Greenbriar Pkwy, Atlanta GA 30331. Lisa Thompson 404-555-0244, delivery day after 3-5 PM. Both check driver ID and seals.",
          "Origin: 5500 Northwest 36th Street, Miami Florida 33166, TechDirect Warehouse. David Kim 305-555-0199. Tomorrow 0800-1000, security clearance needed. Destination: 2800 Greenbriar Parkway, Atlanta Georgia 30331, Southern Electronics Distribution. Lisa Thompson 404-555-0244. Day after tomorrow 1500-1700."
        ]
      },
      {
        step: 4,
        stage: "rate_inquiry",
        dispatcherPrompt: "Спросите о ставке за перевозку",
        dispatcherOptions: [
          { text: "All clear on security requirements. What's your rate for this high-value shipment?", quality: "excellent", points: 10 },
          { text: "What rate are you offering for this electronics load?", quality: "good", points: 8 },
          { text: "What's the rate?", quality: "acceptable", points: 6 },
          { text: "How much?", quality: "poor", points: 3 }
        ],
        brokerResponses: [
          "I'm offering $2.40 per mile for this load, which comes to $1,596 all-in for 665 miles. This is a solid rate for the Miami-Atlanta lane with high-value cargo. Both facilities are professional with efficient loading and unloading. The shipper and receiver work with us regularly, so you won't have any detention issues. How does this rate work for you?",
          "The rate is $2.40 per mile, total of $1,596 for 665 miles. It's a good rate for electronics freight on this route. Both ends are professional - no detention problems. Does this work?",
          "I can offer $2.40 per mile on this load. That's $1,596 total for the 665-mile run. Fair rate for high-value freight. Professional facilities both ends. Interested?"
        ]
      },
      {
        step: 5,
        stage: "payment_terms",
        dispatcherPrompt: "Уточните условия оплаты",
        dispatcherOptions: [
          { text: "The rate is reasonable. Before we finalize, what are your payment terms? We work with factoring companies for immediate payment.", quality: "excellent", points: 10 },
          { text: "What factoring companies do you work with? We need quick payment.", quality: "good", points: 8 },
          { text: "Do you work with factoring?", quality: "acceptable", points: 6 },
          { text: "Payment?", quality: "poor", points: 3 }
        ],
        brokerResponses: [
          "We work with all major factoring companies. We're approved with RTS Financial, Triumph Business Capital, OTR Solutions, TBS Factoring, eCapital, Apex Capital, and Saint John Capital. Which factoring company do you use? I can verify our approval status and advance rate right now.",
          "Yes, we work with factoring. We're set up with RTS, Triumph, OTR, TBS, eCapital, Apex, Saint John, and others. What company are you with? I'll confirm we're approved.",
          "We work with factoring - RTS Financial, Triumph, OTR Solutions, TBS, Saint John Capital, and most major ones. Which one do you use?"
        ]
      },
      {
        step: 6,
        stage: "negotiation",
        dispatcherPrompt: "Договоритесь о ставке или предложите контр-оффер",
        dispatcherOptions: [
          { text: "We use Triumph Business Capital. Regarding the rate - with the security requirements and high-value cargo, I need $2.65 per mile. That would be $1,762 total. Can you approve that?", quality: "excellent", points: 10, counterRate: 2.65 },
          { text: "We're with RTS Financial. Can you do $2.55 per mile? That's $1,696 total.", quality: "good", points: 8, counterRate: 2.55 },
          { text: "We work with Saint John Capital. Can you do $2.50 per mile? That's $1,663.", quality: "acceptable", points: 6, counterRate: 2.50 },
          { text: "Need $2.90 per mile minimum.", quality: "poor", points: 2, counterRate: 2.90 },
          { text: "We use OTR Solutions. Your rate of $2.40 works for us. Let's book it.", quality: "excellent", points: 10, counterRate: 2.40 }
        ],
        brokerResponseLogic: function(counterRate, baseRate) {
          const percentIncrease = ((counterRate - baseRate) / baseRate) * 100;
          
          if (counterRate === baseRate) {
            return [
              "Excellent! I appreciate your professionalism. Let me get your MC number and we'll get this processed immediately. Rate confirmation will be in your email within 15 minutes.",
              "Perfect! I'm glad we could agree. What's your MC number? I'll get the paperwork sent over right away.",
              "Great! Let's get this booked. I need your MC number, DOT number, and email for the rate confirmation."
            ];
          }
          
          if (percentIncrease >= 6 && percentIncrease <= 14) {
            const approvedRate = baseRate + ((counterRate - baseRate) * 0.7);
            return [
              `I understand the security requirements add complexity. Let me check with my manager... Okay, I got approval for ${approvedRate.toFixed(2)} per mile. That's ${(approvedRate * 665).toFixed(0)} total. This is the best I can do on this high-value load. Can we move forward?`,
              `${counterRate.toFixed(2)} is higher than budgeted, but let me see what I can do... My manager approved ${approvedRate.toFixed(2)} per mile, which is ${(approvedRate * 665).toFixed(0)} all-in. That's my maximum. Does that work?`,
              `I hear you on the security requirements. Give me a moment... Okay, I can go up to ${approvedRate.toFixed(2)} per mile. That's ${(approvedRate * 665).toFixed(0)} total. That's the highest I can offer. Can we agree on that?`
            ];
          }
          
          if (percentIncrease > 14 && percentIncrease <= 22) {
            const maxRate = baseRate * 1.10;
            return [
              `${counterRate.toFixed(2)} per mile is above market rate for this lane, even with high-value cargo. I've checked with management, and the absolute maximum we can offer is ${maxRate.toFixed(2)} per mile, which is ${(maxRate * 665).toFixed(0)} total. This is our final offer. Can you work with that?`,
              `I understand your position, but ${counterRate.toFixed(2)} is beyond our budget. The highest I'm authorized to go is ${maxRate.toFixed(2)} per mile - that's ${(maxRate * 665).toFixed(0)} all-in. That's my ceiling. Yes or no?`,
              `${counterRate.toFixed(2)} per mile is too high for this shipment. I've pushed as hard as I can, and ${maxRate.toFixed(2)} per mile is the maximum - ${(maxRate * 665).toFixed(0)} total. That's my final number. Can you do it?`
            ];
          }
          
          return [
            `I appreciate your interest, but ${counterRate.toFixed(2)} per mile is well above market rate for Miami-Atlanta. My maximum is ${(baseRate * 1.08).toFixed(2)} per mile. If that doesn't work, I understand, and I need to move on to other carriers.`,
            `${counterRate.toFixed(2)} is too far from where I need to be. The highest I can go is ${(baseRate * 1.08).toFixed(2)} per mile. If you can't do that, no hard feelings - I'll call the next carrier.`
          ];
        }
      },
      {
        step: 7,
        stage: "final_confirmation",
        dispatcherPrompt: "Подтвердите согласие или сделайте финальное предложение",
        dispatcherOptions: [
          { text: "That works for me. Let's book this load. I'm ready to provide all necessary information and insurance certificates.", quality: "excellent", points: 10 },
          { text: "Agreed. Let's move forward.", quality: "good", points: 8 },
          { text: "Okay, deal. What do you need?", quality: "acceptable", points: 6 },
          { text: "Can you go just a bit higher? Maybe $2.70 per mile?", quality: "negotiating", points: 5 },
          { text: "I'll have to pass. Thank you for your time.", quality: "declining", points: 0 }
        ],
        brokerResponses: [
          "Perfect! Let's get this covered. I'll need your MC number, DOT number, your company's legal name, and the best email address for the rate confirmation. Also, please provide your driver's name, cell phone number, and a copy of your cargo insurance certificate showing minimum $100,000 coverage. Remember - secure parking only, no unattended stops.",
          "Excellent! To book this, I need: MC number, DOT number, company name, email for rate con, driver details, and cargo insurance certificate. Make sure driver understands security requirements - no unattended parking.",
          "Great! I need your MC and DOT numbers, company legal name, email for rate confirmation, driver contact info, and insurance certificate. Critical: secure parking only, report all stops."
        ],
        declineResponse: [
          "I understand. Thank you for considering the load. If your situation changes or you're looking for other high-value opportunities, feel free to reach out. Good luck and safe travels!",
          "No problem at all. I appreciate your time. If you need anything in the future, don't hesitate to call. Have a great day!"
        ]
      },
      {
        step: 8,
        stage: "booking",
        dispatcherPrompt: "Предоставьте всю необходимую информацию для бронирования",
        dispatcherOptions: [
          { text: "MC number: 345678, DOT: 901234, Company: Southeast Transport Group LLC. Email: dispatch@setransport.com. Driver: Marcus Johnson, phone: 555-0377. Insurance certificate will be emailed within 5 minutes.", quality: "excellent", points: 10 },
          { text: "MC 345678, DOT 901234, Southeast Transport Group, dispatch@setransport.com, driver Marcus Johnson 555-0377", quality: "good", points: 8 },
          { text: "MC 345678, email dispatch@setransport.com, driver Marcus Johnson", quality: "acceptable", points: 6 },
          { text: "MC 345678", quality: "poor", points: 3 }
        ],
        brokerResponses: [
          "Perfect! I have all your information: MC 345678, DOT 901234, Southeast Transport Group LLC. Rate confirmation is being sent to dispatch@setransport.com right now. Driver Marcus Johnson must contact David Kim at 305-555-0199 before arrival tomorrow at 0800 for security clearance. Pickup at TechDirect Warehouse, 5500 Northwest 36th Street, Miami FL 33166. Delivery at Southern Electronics Distribution, 2800 Greenbriar Parkway, Atlanta GA 30331, contact Lisa Thompson 404-555-0244, day after tomorrow 1500-1700. CRITICAL: Secure parking only, no unattended stops, report all stops to dispatch. Trailer seals will be inspected at both ends. Safe travels!",
          "Excellent! Got everything: MC 345678, DOT 901234, Southeast Transport Group. Rate con going to dispatch@setransport.com now. Marcus must call David at 305-555-0199 before arrival for security clearance. Pickup at 5500 NW 36th St, Miami, 8-10 AM tomorrow. Delivery at 2800 Greenbriar Pkwy, Atlanta, day after 3-5 PM. SECURE PARKING ONLY! Report all stops!",
          "Great! MC 345678 confirmed. Rate confirmation sent to dispatch@setransport.com. Pickup: TechDirect, 5500 Northwest 36th Street, Miami FL 33166, tomorrow 0800-1000, contact David 305-555-0199, security clearance required. Delivery: Southern Electronics, 2800 Greenbriar Parkway, Atlanta GA 30331, day after 1500-1700, contact Lisa 404-555-0244. Secure parking only! Safe trip!"
        ]
      }
    ]
  },
