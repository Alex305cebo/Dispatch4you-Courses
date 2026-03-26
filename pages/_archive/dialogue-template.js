/**
 * DIALOGUE TEMPLATE - NO DEADLOCKS GUARANTEED!
 * 
 * Use this template to create new dialogues that follow the correct structure.
 * This template prevents deadlocks by ensuring all weak/aggressive/fail answers
 * lead directly to reject_*_final paths with single outcomes.
 * 
 * CRITICAL RULES:
 * 1. Only TWO path types: "master" (multi-step) and "reject_*_final" (single outcome)
 * 2. Variants 1-3 (excellent/good/normal) MUST lead to "master"
 * 3. Variants 4-6 (weak/aggressive/fail) MUST lead to "reject_*_final"
 * 4. All reject paths MUST end with "_final" suffix
 * 5. Each reject_*_final path MUST contain exactly 1 element with outcome
 * 6. Master path should have 15-17 steps
 * 
 * BEFORE USING THIS TEMPLATE:
 * - Run validation utility (validate-dialogue.js) on your completed dialogue
 * - Ensure zero errors before deploying
 * - Test manually in simulator
 */

console.log('🔵 Loading dialogue template...');

const scenarioTemplate = {
    // ============================================================================
    // DIALOGUE METADATA
    // ============================================================================
    id: XX,  // Unique dialogue number
    route: "City A State → City B State",  // Example: "Houston TX → Detroit MI"
    distance: XXXX,  // Miles
    equipment: "Type (size)",  // Example: "Dry Van (53ft)", "Flatbed (48ft)", "Reefer (53ft)"
    cargo: "Cargo description",  // Example: "Electronics (laptops, tablets)"
    weight: "XX,000 lbs",  // Example: "46,000 lbs"
    postedRate: "$X,XXX ($X.XX/mile)",  // Example: "$2,500 ($1.97/mile)"
    deadline: "Pickup time, Delivery time",  // Example: "Pickup tomorrow 6 AM, Delivery in 2 days"
    brokerStyle: "Broker personality description",  // Example: "Professional steel broker - safety focused"
    difficulty: "easy/medium/hard",  // Difficulty level
    initialMessage: "Greeting message from broker",  // First message dispatcher sees

    // ============================================================================
    // DIALOGUE PATHS
    // ============================================================================
    paths: {
        // ------------------------------------------------------------------------
        // MASTER PATH - The only multi-step path (15-17 steps)
        // ------------------------------------------------------------------------
        master: [
            // STEP 1: MC, Company, Fleet
            {
                brokerQuestion: "Broker's question about MC, company name, and fleet size",
                dispatcherPrompt: "💎 Hint for dispatcher about what broker is asking",
                suggestions: [
                    // VARIANT 1: EXCELLENT (leads to master)
                    {
                        text: "Detailed answer with MC, company, fleet size, specialization, and follow-up question",
                        quality: "excellent",
                        analytics: "✨ What dispatcher did well",
                        path: "master"
                    },
                    // VARIANT 2: GOOD (leads to master)
                    {
                        text: "Good answer with MC, company, fleet size",
                        quality: "good",
                        analytics: "✔️ What dispatcher did",
                        path: "master"
                    },
                    // VARIANT 3: NORMAL (leads to master)
                    {
                        text: "Basic answer with MC and company",
                        quality: "normal",
                        analytics: "⚪ What dispatcher did",
                        path: "master"
                    },
                    // VARIANT 4: WEAK (leads to reject_weak_final)
                    {
                        text: "Uncertain answer showing lack of confidence",
                        quality: "weak",
                        analytics: "⚠️ Why this is weak",
                        path: "reject_weak_final"
                    },
                    // VARIANT 5: AGGRESSIVE (leads to reject_attitude_final)
                    {
                        text: "Rude or aggressive response",
                        quality: "aggressive",
                        analytics: "🔴 Why this is bad",
                        path: "reject_attitude_final"
                    },
                    // VARIANT 6: FAIL (leads to specific reject_*_final)
                    {
                        text: "Critical mistake (e.g., no MC number)",
                        quality: "fail",
                        analytics: "❌ Why this fails",
                        path: "reject_nomc_final"  // Use appropriate reject type
                    }
                ]
            },

            // STEP 2: Location, Equipment
            {
                brokerQuestion: "Broker's question about truck location and equipment",
                dispatcherPrompt: "💎 Hint about location and equipment",
                suggestions: [
                    { text: "Excellent answer", quality: "excellent", analytics: "✨ Analysis", path: "master" },
                    { text: "Good answer", quality: "good", analytics: "✔️ Analysis", path: "master" },
                    { text: "Normal answer", quality: "normal", analytics: "⚪ Analysis", path: "master" },
                    { text: "Weak answer", quality: "weak", analytics: "⚠️ Analysis", path: "reject_weak_final" },
                    { text: "Aggressive answer", quality: "aggressive", analytics: "🔴 Analysis", path: "reject_attitude_final" },
                    { text: "Fail answer", quality: "fail", analytics: "❌ Analysis", path: "reject_timing_final" }
                ]
            },

            // STEP 3-12: Continue with similar structure
            // Each step should have 6 suggestions following the same pattern
            // ... (add more steps as needed)

            // STEP 13: Negotiation - First Offer
            {
                brokerQuestion: "Broker makes first rate offer",
                dispatcherPrompt: "💎 Hint about negotiation",
                suggestions: [
                    { text: "Counter with higher rate professionally", quality: "excellent", analytics: "✨ Analysis", path: "master" },
                    { text: "Counter with reasonable rate", quality: "good", analytics: "✔️ Analysis", path: "master" },
                    { text: "Accept offer or counter slightly", quality: "normal", analytics: "⚪ Analysis", path: "master" },
                    { text: "Weak negotiation", quality: "weak", analytics: "⚠️ Analysis", path: "reject_weak_final" },
                    { text: "Aggressive negotiation", quality: "aggressive", analytics: "🔴 Analysis", path: "reject_ultimatum_final" },
                    { text: "I'll take $X,XXX posted.", quality: "fail", analytics: "❌ Accepted without negotiation", path: "master" }  // SPECIAL CASE: Posted rate acceptance
                ]
            },

            // STEP 14: Negotiation - Counter Offer
            {
                brokerQuestion: "Broker counters your offer",
                dispatcherPrompt: "💎 Hint about counter offer",
                suggestions: [
                    { text: "Professional counter", quality: "excellent", analytics: "✨ Analysis", path: "master" },
                    { text: "Reasonable counter", quality: "good", analytics: "✔️ Analysis", path: "master" },
                    { text: "Accept or slight counter", quality: "normal", analytics: "⚪ Analysis", path: "master" },
                    { text: "Weak counter", quality: "weak", analytics: "⚠️ Analysis", path: "reject_weak_final" },
                    { text: "Aggressive counter", quality: "aggressive", analytics: "🔴 Analysis", path: "reject_ultimatum_final" },
                    { text: "I'll take $X,XXX posted.", quality: "fail", analytics: "❌ Accepted without negotiation", path: "master" }  // SPECIAL CASE
                ]
            },

            // STEP 15: Email Confirmation
            {
                brokerQuestion: "Broker asks for email to send rate confirmation",
                dispatcherPrompt: "💎 Hint about email",
                suggestions: [
                    { text: "Professional email with confirmation", quality: "excellent", analytics: "✨ Analysis", path: "master" },
                    { text: "Email address", quality: "good", analytics: "✔️ Analysis", path: "master" },
                    { text: "Basic email", quality: "normal", analytics: "⚪ Analysis", path: "master" },
                    { text: "Uncertain about email", quality: "weak", analytics: "⚠️ Analysis", path: "reject_weak_final" },
                    { text: "Rude response about email", quality: "aggressive", analytics: "🔴 Analysis", path: "reject_attitude_final" },
                    { text: "No email available", quality: "fail", analytics: "❌ Analysis", path: "reject_email_final" }
                ]
            },

            // STEP 16: SUCCESS OUTCOME (no suggestions needed)
            {
                brokerResponse: "Excellent! Rate confirmation sent. You answered every question professionally. I'm adding you to my preferred carriers list. Good luck!",
                outcome: {
                    type: "success",
                    quality: "excellent",
                    rate: "$X,XXX",  // Final negotiated rate
                    ratePerMile: "$X.XX/mile",
                    relationship: "strengthened",
                    feedback: "✅ SUCCESS: Professional communication, strong negotiation, all requirements met!"
                }
            }
        ],

        // ------------------------------------------------------------------------
        // REJECT PATHS - All must end with "_final" and contain exactly 1 element
        // ------------------------------------------------------------------------

        reject_weak_final: [
            {
                brokerResponse: "I appreciate your interest, but I need a more confident carrier for this load. Thanks anyway.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Lack of confidence showed inexperience or poor preparation."
                }
            }
        ],

        reject_attitude_final: [
            {
                brokerResponse: "I don't appreciate the attitude. I'll find another carrier. Good luck.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Unprofessional attitude. Brokers want respectful, cooperative carriers."
                }
            }
        ],

        reject_nomc_final: [
            {
                brokerResponse: "I need your MC number to verify your authority. Can't book without it. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: No MC number = no booking. This is basic requirement."
                }
            }
        ],

        reject_timing_final: [
            {
                brokerResponse: "This load requires pickup at specific time. I need carrier who can commit. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Can't meet pickup time. Timing is critical in logistics."
                }
            }
        ],

        reject_experience_final: [
            {
                brokerResponse: "This cargo requires experienced driver. I need carrier with proven track record. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Insufficient experience for this type of cargo."
                }
            }
        ],

        reject_insurance_final: [
            {
                brokerResponse: "Insurance requirements not met. I need proper coverage for this cargo. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Inadequate insurance coverage. High-value cargo requires proper protection."
                }
            }
        ],

        reject_communication_final: [
            {
                brokerResponse: "I need carrier with reliable tracking and communication. Can't risk this cargo. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Poor communication plan. Brokers need constant updates."
                }
            }
        ],

        reject_commitment_final: [
            {
                brokerResponse: "I need carrier who can commit to appointment time. This shipper is strict. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: No commitment to delivery time. Appointments are non-negotiable."
                }
            }
        ],

        reject_equipment_final: [
            {
                brokerResponse: "Equipment requirements not met. I need proper securing equipment for this cargo. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Missing required equipment. Cargo safety is priority."
                }
            }
        ],

        reject_references_final: [
            {
                brokerResponse: "I need verifiable references for new carriers. Can't book without them. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: No references. Brokers verify carrier reliability before booking."
                }
            }
        ],

        reject_terms_final: [
            {
                brokerResponse: "Payment terms don't work for this load. I need carrier who accepts standard terms. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Unacceptable payment terms. Standard terms are non-negotiable."
                }
            }
        ],

        reject_ultimatum_final: [
            {
                brokerResponse: "I don't respond well to ultimatums. I'll find another carrier. Good luck.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: Aggressive negotiation tactics backfired. Brokers want partnership, not confrontation."
                }
            }
        ],

        reject_email_final: [
            {
                brokerResponse: "I need professional carrier with email for documentation. Thanks.",
                outcome: {
                    type: "failure",
                    quality: "fail",
                    rate: "$0",
                    feedback: "❌ REJECT: No email = no professionalism. Rate confirmation requires email."
                }
            }
        }

    // Add more reject_*_final paths as needed for your specific dialogue
    // Examples: reject_fsc_final, reject_backup_final, reject_specific_final, etc.
}
};

// Export for validation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = scenarioTemplate;
}

console.log('✅ Dialogue template loaded - Use this structure for all new dialogues!');
