// EXTENDED SCENARIO EXAMPLE - More conversation steps and details
// This shows the structure with 8 conversation steps instead of 4

const extendedScenario = {
  id: 1,
  route: "Los Angeles CA → Phoenix AZ",
  distance: 373,
  equipment: "Dry Van",
  weight: "42,000 lbs",
  baseRate: 1.85,
  baseTotalRate: 690,
  successRateMin: 2.13, // +15%
  successRateMax: 2.31, // +25%
  
  conversation: [
    {
      // Step 1: Initial greeting and inquiry
      dispatcherPrompt: "Greet the broker and ask if the load is available",
      dispatcherSuggestions: [
        { text: "Good morning! I'm calling about your Los Angeles CA to Phoenix AZ load. Is it still available?", quality: "good" },
        { text: "Hi, this is [Name] from [Company]. I saw your posting for LA-Phoenix. Still open?", quality: "good" },
        { text: "Hello, I'm interested in the LA to Phoenix run. Can you tell me about it?", quality: "good" },
        { text: "Hey, you got that LA load?", quality: "bad" },
        { text: "Load available?", quality: "bad" }
      ],
      brokerResponse: "Good morning! Yes, it's still available. It's a 373-mile run from Los Angeles CA to Phoenix AZ. 42,000 lbs of dry van freight. Pickup is tomorrow morning at 8 AM, delivery same day by 6 PM. Are you interested in this load?"
    },
    
    {
      // Step 2: Ask about equipment and freight details
      dispatcherPrompt: "Ask about equipment requirements and freight type",
      dispatcherSuggestions: [
        { text: "Yes, I'm interested. What type of trailer do you need? Any special requirements?", quality: "good" },
        { text: "What equipment is required? Is it a standard dry van?", quality: "good" },
        { text: "Tell me more about the freight. What am I hauling?", quality: "good" },
        { text: "What kind of truck?", quality: "normal" },
        { text: "Equipment?", quality: "bad" }
      ],
      brokerResponse: "It's a standard 53-foot dry van, no special equipment needed. The freight is general cargo - packaged goods, nothing hazardous or temperature-sensitive. Weight is 42,000 lbs, so well within limits. The shipper loads efficiently, usually takes about 45 minutes to an hour."
    },
    
    {
      // Step 3: Ask about pickup and delivery details
      dispatcherPrompt: "Ask about pickup and delivery locations and times",
      dispatcherSuggestions: [
        { text: "What are the exact pickup and delivery addresses? Any appointment times?", quality: "good" },
        { text: "Can you give me the shipper and receiver information?", quality: "good" },
        { text: "What time is pickup and delivery? Any specific windows?", quality: "good" },
        { text: "Where exactly?", quality: "normal" },
        { text: "Address?", quality: "bad" }
      ],
      brokerResponse: "Pickup is at 1250 Industrial Way, Los Angeles CA 90001, tomorrow at 8 AM. There's a 2-hour window, so 8-10 AM works. Contact there is Mike at 555-0100. Delivery is at 3400 Warehouse Blvd, Phoenix AZ 85001, same day by 6 PM. Receiver is open until 7 PM, so you have some flexibility. Contact is Sarah at 555-0200."
    },
    
    {
      // Step 4: Ask about the rate
      dispatcherPrompt: "Ask about the rate for this load",
      dispatcherSuggestions: [
        { text: "Sounds good. What's your rate on this load?", quality: "good" },
        { text: "What are you offering per mile?", quality: "good" },
        { text: "Can you tell me the rate? All-in or per mile?", quality: "good" },
        { text: "How much you paying?", quality: "normal" },
        { text: "Rate?", quality: "bad" }
      ],
      brokerResponse: "I'm offering $1.85 per mile, so that's $690 total for the 373 miles. It's a straightforward run on I-10, should take about 6 hours of driving time. The shipper is very reliable - we work with them regularly. They're professional and respect driver time."
    },
    
    {
      // Step 5: Ask about factoring company
      dispatcherPrompt: "Ask which factoring company the broker works with",
      dispatcherSuggestions: [
        { text: "What factoring company do you work with? We only work through factoring.", quality: "good" },
        { text: "Which factoring company are you set up with? That's how we get paid.", quality: "good" },
        { text: "Do you work with factoring companies? We need to verify that first.", quality: "good" },
        { text: "What factoring?", quality: "normal" },
        { text: "Factoring?", quality: "bad" }
      ],
      brokerResponse: "We work with several factoring companies - RTS Financial, RTS Pro, Triumph Business Capital, and Saint John Capital. Which one do you use? I can verify we're in their system and get you set up for same-day payment once you deliver."
    },
    
    {
      // Step 6: Confirm factoring and negotiate the rate
      dispatcherPrompt: "Confirm factoring company and negotiate for a better rate",
      dispatcherSuggestions: [
        { text: "The rate is a bit low for me. Can you do $2.20 per mile? That's $820 total.", quality: "good" }, // +19% - SUCCESS
        { text: "I need at least $2.25 per mile to make this work. That's $839 total.", quality: "good" }, // +22% - SUCCESS
        { text: "Can you bump it up to $2.30 per mile? That would be $858 total.", quality: "good" }, // +24% - SUCCESS
        { text: "That's too low. I need $2.50 per mile minimum.", quality: "bad" }, // +35% - REJECT
        { text: "Can you do $2.00 per mile?", quality: "normal" }, // +8% - COUNTER
        { text: "How about $1.95 per mile?", quality: "normal" } // +5% - COUNTER
      ],
      brokerResponses: {
        success: "I hear you. Let me talk to my manager real quick... Okay, I got approval for $[RATE] per mile. That's $[TOTAL] total. It's a fair rate for both of us, and I think you'll be happy with how smooth this shipper and receiver are. Can we book it?",
        counter: "I appreciate the counteroffer. $2.00 is close, but I can't quite get there. How about we meet at $2.10 per mile? That's $784 total. It's the best I can do on this one, but it's still a good rate for a straightforward run. What do you think?",
        reject: "I understand you need to make money, but $2.50 per mile is significantly above market rate for this lane. The absolute maximum I can offer is $2.05 per mile, which is $765 total. If that doesn't work for you, I'll need to move on to other carriers. Let me know quickly."
      }
    },
    
    {
      // Step 7: Counter-negotiation or acceptance
      dispatcherPrompt: "Respond to broker's counter-offer or accept",
      dispatcherSuggestions: [
        { text: "Perfect! We use RTS Financial. Rate works for me. Let's book it!", quality: "good" },
        { text: "Good, we're with Triumph. That rate is acceptable. What do you need from me?", quality: "good" },
        { text: "We use OTR Solutions. Deal. Let's get this booked.", quality: "good" },
        { text: "We're with TBS. Can you go just a bit higher? Maybe $2.15 per mile?", quality: "normal" },
        { text: "We use different factoring. I'll have to pass.", quality: "normal" },
        { text: "Nah, not worth it.", quality: "bad" }
      ],
      brokerResponses: {
        accept: "Excellent! I'm glad we could work it out. Let me get your information and we'll get this booked right away.",
        finalCounter: "Let me check one more time... Okay, I can stretch to $2.15 per mile. That's $803 total and that's absolutely my final offer. Can we book it at that rate?",
        decline: "No problem, I understand. Thanks for your time and for considering it. If you're looking for other loads or if your situation changes, feel free to give me a call back. Have a great day!"
      }
    },
    
    {
      // Step 8: Provide booking information
      dispatcherPrompt: "Provide your MC number and contact information",
      dispatcherSuggestions: [
        { text: "Perfect! My MC number is 123456. Email is dispatch@company.com", quality: "good" },
        { text: "Great! MC# 123456, driver name is John Smith, phone 555-9999", quality: "good" },
        { text: "Sounds good. MC 123456, email: ops@transport.com, phone 555-8888", quality: "good" },
        { text: "MC 123456", quality: "normal" },
        { text: "123456", quality: "bad" }
      ],
      brokerResponses: {
        accept: "Perfect! I've got MC 123456. I'm sending the rate confirmation to your email right now - you should see it in the next few minutes. Make sure your driver is at 1250 Industrial Way, Los Angeles CA 90001 tomorrow between 8-10 AM. Contact Mike at 555-0100 if there are any issues. Delivery is at 3400 Warehouse Blvd, Phoenix AZ 85001 by 6 PM. Contact Sarah at 555-0200. Have a safe trip and let me know if you need anything!",
        needMore: "Great! I have your MC number. Can you also provide your email address and a phone number where I can reach you or your driver? I want to make sure the rate confirmation gets to you and we have good communication."
      }
    }
  ]
};

// This extended format provides:
// - 8 conversation steps instead of 4
// - More dispatcher suggestion options (4-6 per step)
// - More detailed broker responses
// - Additional topics: equipment, pickup/delivery details, payment terms
// - More realistic negotiation with counter-offers
// - Better quality gradation (good/normal/bad)

module.exports = extendedScenario;
