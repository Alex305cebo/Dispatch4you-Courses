# Dialogue Creation Specification

## Purpose

This document defines the rules and structure for creating broker-dispatcher negotiation dialogues in the simulator. Following these rules **guarantees no deadlocks** and ensures smooth user experience.

## Table of Contents

1. [Core Rules](#core-rules)
2. [Path Structure](#path-structure)
3. [Suggestion Variants](#suggestion-variants)
4. [Reject Paths](#reject-paths)
5. [Validation](#validation)
6. [Examples](#examples)
7. [Troubleshooting](#troubleshooting)

---

## Core Rules

### RULE #1: Only Two Path Types

A dialogue can have **only two types of paths**:

1. **`master`** - The main conversation path with 15-17 steps
2. **`reject_*_final`** - Final rejection outcomes (one element each)

**❌ FORBIDDEN:**
- Intermediate paths like `weak`, `warning`, `reject_attitude` (without `_final`)
- Multi-step reject paths
- Any path name without `_final` suffix (except `master`)

**✅ CORRECT:**
```javascript
paths: {
    master: [ /* 15-17 steps */ ],
    reject_weak_final: [ /* 1 element */ ],
    reject_attitude_final: [ /* 1 element */ ],
    reject_nomc_final: [ /* 1 element */ ]
}
```

---

### RULE #2: Master Path Structure

The `master` path contains **15-17 steps** representing the full negotiation flow.

**Each step must have:**
- `brokerQuestion` - What the broker asks
- `dispatcherPrompt` - Hint for the dispatcher (💎 emoji)
- `suggestions` - Array of 6 answer variants

**Final step (success outcome):**
- `brokerResponse` - Broker's final message
- `outcome` - Success outcome object

**Example:**
```javascript
master: [
    {
        brokerQuestion: "What's your MC number and company name?",
        dispatcherPrompt: "💎 Broker wants MC and company info!",
        suggestions: [ /* 6 variants */ ]
    },
    // ... steps 2-15
    {
        brokerResponse: "Excellent! Rate confirmation sent.",
        outcome: {
            type: "success",
            quality: "excellent",
            rate: "$2,750",
            ratePerMile: "$2.17/mile",
            relationship: "strengthened",
            feedback: "✅ SUCCESS: Professional communication!"
        }
    }
]
```

---

### RULE #3: Six Suggestion Variants

Each step must have **exactly 6 suggestion variants**:

| # | Quality | Path | Description |
|---|---------|------|-------------|
| 1 | `excellent` | `master` | Detailed, professional answer with follow-up question |
| 2 | `good` | `master` | Good answer with key information |
| 3 | `normal` | `master` | Basic acceptable answer |
| 4 | `weak` | `reject_weak_final` | Uncertain, unprepared answer |
| 5 | `aggressive` | `reject_attitude_final` | Rude, unprofessional answer |
| 6 | `fail` | `reject_*_final` | Critical mistake (context-specific) |

**✅ CORRECT:**
```javascript
suggestions: [
    { 
        text: "MC 445566, TechFreight Logistics. 25 dry vans, specialized in electronics for 4 years. What's the cargo value?", 
        quality: "excellent", 
        analytics: "✨ MC, company, fleet, specialization, question!", 
        path: "master" 
    },
    { 
        text: "MC 445566, TechFreight Logistics. 25 dry vans.", 
        quality: "good", 
        analytics: "✔️ MC, company, fleet.", 
        path: "master" 
    },
    { 
        text: "MC 445566, TechFreight Logistics.", 
        quality: "normal", 
        analytics: "⚪ Basic info.", 
        path: "master" 
    },
    { 
        text: "MC 445566... we have some vans...", 
        quality: "weak", 
        analytics: "⚠️ Uncertain!", 
        path: "reject_weak_final" 
    },
    { 
        text: "Why all these questions? Just tell me the rate!", 
        quality: "aggressive", 
        analytics: "🔴 Rude!", 
        path: "reject_attitude_final" 
    },
    { 
        text: "Dry van available. What's the load?", 
        quality: "fail", 
        analytics: "❌ No MC number!", 
        path: "reject_nomc_final" 
    }
]
```

---

### RULE #4: Variants 1-3 Lead to Master

**Variants 1-3** (excellent/good/normal) **MUST** lead to `path: "master"`.

These represent acceptable answers that allow the conversation to continue.

**❌ WRONG:**
```javascript
{ text: "Good answer", quality: "good", path: "reject_weak_final" }  // NO!
```

**✅ CORRECT:**
```javascript
{ text: "Good answer", quality: "good", path: "master" }  // YES!
```

---

### RULE #5: Variants 4-6 Lead to Reject Final

**Variants 4-6** (weak/aggressive/fail) **MUST** lead to `path: "reject_*_final"`.

These represent unacceptable answers that end the conversation immediately.

**Mapping:**
- Variant 4 (weak) → `reject_weak_final`
- Variant 5 (aggressive) → `reject_attitude_final`
- Variant 6 (fail) → Context-specific reject path

**❌ WRONG:**
```javascript
{ text: "Weak answer", quality: "weak", path: "weak" }  // NO! Missing _final
{ text: "Rude answer", quality: "aggressive", path: "warning" }  // NO! Wrong path
```

**✅ CORRECT:**
```javascript
{ text: "Weak answer", quality: "weak", path: "reject_weak_final" }  // YES!
{ text: "Rude answer", quality: "aggressive", path: "reject_attitude_final" }  // YES!
```

---

### RULE #6: Special Case - Posted Rate Acceptance

**EXCEPTION:** On negotiation steps, variant 6 with text "I'll take posted rate" or "I'll take $X posted" can lead to `master`.

This represents accepting the broker's terms, not a failure.

**✅ CORRECT:**
```javascript
{
    text: "I'll take $2,500 posted rate.",
    quality: "fail",
    analytics: "❌ Accepted without negotiation!",
    path: "master"  // ALLOWED on negotiation steps
}
```

---

## Path Structure

### Master Path Flow

```
Step 1: MC, Company, Fleet
Step 2: Location, Equipment
Step 3: Driver Experience, DOT
Step 4: Insurance
Step 5: Tracking, Communication
Step 6: Appointment, Backup Plan
Step 7: Equipment, Inspection
Step 8: Specific Cargo Question
Step 9: References
Step 10: Detention, Payment
Step 11: FSC, Emergency Contacts
Step 12: Backup Truck, Claims
Step 13: Negotiation - First Offer
Step 14: Negotiation - Counter Offer
Step 15: Email Confirmation
Step 16: SUCCESS Outcome
```

---

## Reject Paths

### Standard Reject Paths

Every dialogue should include these standard reject paths:

| Path Name | When Used | Broker Response |
|-----------|-----------|-----------------|
| `reject_weak_final` | Uncertain, unprepared answers | "I need a more confident carrier." |
| `reject_attitude_final` | Rude, aggressive behavior | "I don't appreciate the attitude." |
| `reject_nomc_final` | Missing MC number | "I need your MC number to verify." |
| `reject_timing_final` | Can't meet pickup/delivery time | "I need carrier who can commit to timing." |
| `reject_experience_final` | Insufficient driver experience | "This cargo requires experienced driver." |
| `reject_insurance_final` | Inadequate insurance coverage | "Insurance requirements not met." |
| `reject_communication_final` | Poor tracking/communication plan | "I need reliable tracking and communication." |
| `reject_commitment_final` | Won't commit to appointment | "I need carrier who can commit to appointment." |
| `reject_equipment_final` | Missing required equipment | "Equipment requirements not met." |
| `reject_references_final` | No verifiable references | "I need verifiable references." |
| `reject_terms_final` | Unacceptable payment terms | "Payment terms don't work for this load." |
| `reject_ultimatum_final` | Aggressive negotiation tactics | "I don't respond well to ultimatums." |
| `reject_email_final` | No email for documentation | "I need professional carrier with email." |

### Reject Path Structure

Each reject path **MUST** contain exactly **1 element** with:
- `brokerResponse` - Broker's rejection message
- `outcome` - Failure outcome object

**✅ CORRECT:**
```javascript
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
]
```

**❌ WRONG:**
```javascript
reject_weak: [  // Missing _final suffix!
    {
        brokerQuestion: "Are you sure?",  // NO! This creates intermediate step
        suggestions: [ /* ... */ ]
    },
    {
        brokerResponse: "I'll pass.",
        outcome: { /* ... */ }
    }
]
```

---

## Validation

### Pre-Creation Checklist

Before deploying a new dialogue, verify:

- [ ] Master path has 15-17 steps
- [ ] Each step has exactly 6 suggestions
- [ ] Variants 1-3 lead to `"master"`
- [ ] Variants 4-6 lead to `"reject_*_final"`
- [ ] All reject paths end with `"_final"` suffix
- [ ] Each reject path has exactly 1 element
- [ ] Each reject path has `outcome` property
- [ ] No intermediate paths exist
- [ ] All path references in suggestions exist in `paths` object

### Running Validation

Use the validation utility to check your dialogue:

```javascript
// Load validation utility
const { validateDialogue, generateValidationReport } = require('./validate-dialogue.js');

// Validate your scenario
const result = validateDialogue(yourScenario);

if (!result.valid) {
    console.log(generateValidationReport(yourScenario));
}
```

**Expected output for valid dialogue:**
```
✅ PASSED
Total Errors: 0
```

---

## Examples

### Example 1: Correct Dialogue Structure

See `scenarios-data-v20.js` for a complete example of correct structure.

### Example 2: Common Mistakes

**❌ MISTAKE #1: Intermediate "weak" path**
```javascript
paths: {
    master: [ /* ... */ ],
    weak: [  // WRONG! Should be reject_weak_final
        { brokerQuestion: "...", suggestions: [...] },
        { brokerQuestion: "...", suggestions: [...] }
    ]
}
```

**✅ FIX:**
```javascript
paths: {
    master: [ /* ... */ ],
    reject_weak_final: [  // CORRECT!
        {
            brokerResponse: "I need a more confident carrier.",
            outcome: { type: "failure", quality: "fail", rate: "$0", feedback: "..." }
        }
    ]
}
```

**❌ MISTAKE #2: Variant 4 leads to intermediate path**
```javascript
{ 
    text: "Weak answer", 
    quality: "weak", 
    path: "weak"  // WRONG! Should be reject_weak_final
}
```

**✅ FIX:**
```javascript
{ 
    text: "Weak answer", 
    quality: "weak", 
    path: "reject_weak_final"  // CORRECT!
}
```

**❌ MISTAKE #3: Missing _final suffix**
```javascript
paths: {
    master: [ /* ... */ ],
    reject_attitude: [  // WRONG! Missing _final
        { brokerResponse: "...", outcome: {...} }
    ]
}
```

**✅ FIX:**
```javascript
paths: {
    master: [ /* ... */ ],
    reject_attitude_final: [  // CORRECT!
        { brokerResponse: "...", outcome: {...} }
    ]
}
```

---

## Troubleshooting

### Problem: Deadlock in Simulator

**Symptom:** Dispatcher selects variant 4 (weak) on step 5, but broker asks a question from step 1 instead of giving final rejection.

**Cause:** Variant 4 leads to intermediate "weak" path with multiple steps.

**Solution:** 
1. Change `path: "weak"` to `path: "reject_weak_final"`
2. Ensure `reject_weak_final` path has only 1 element with outcome
3. Run validation to confirm fix

### Problem: Validation Error - "Path should end with _final"

**Symptom:** Validation reports: `ERROR: Path "reject_attitude" should end with "_final" suffix`

**Cause:** Reject path missing `_final` suffix.

**Solution:**
1. Rename path from `reject_attitude` to `reject_attitude_final`
2. Update all references in suggestions
3. Run validation again

### Problem: Validation Error - "Should lead to reject_*_final"

**Symptom:** Validation reports: `ERROR: Step 3, suggestion 4 (weak): should lead to "reject_*_final" path, got "weak"`

**Cause:** Variant 4 leads to intermediate path instead of final reject path.

**Solution:**
1. Change `path: "weak"` to `path: "reject_weak_final"`
2. Ensure `reject_weak_final` path exists in `paths` object
3. Run validation again

### Problem: Validation Error - "Path should have exactly 1 element"

**Symptom:** Validation reports: `ERROR: Path "reject_weak_final" should have exactly 1 element, got 3`

**Cause:** Reject path has multiple steps instead of single outcome.

**Solution:**
1. Remove all intermediate steps from reject path
2. Keep only the final element with `brokerResponse` and `outcome`
3. Run validation again

---

## Quick Reference

### Dialogue Creation Workflow

1. **Copy template** from `dialogue-template.js`
2. **Fill in metadata** (id, route, distance, etc.)
3. **Create 15-17 master steps** with 6 suggestions each
4. **Create reject_*_final paths** (1 element each)
5. **Run validation** using `validate-dialogue.js`
6. **Fix any errors** reported by validation
7. **Test manually** in simulator
8. **Deploy** to production

### Path Naming Convention

- Master path: `master`
- Reject paths: `reject_[reason]_final`
  - Examples: `reject_weak_final`, `reject_attitude_final`, `reject_nomc_final`

### Quality Mapping

| Quality | Emoji | Path Type | Description |
|---------|-------|-----------|-------------|
| excellent | ✨ | master | Detailed, professional |
| good | ✔️ | master | Good, complete |
| normal | ⚪ | master | Basic, acceptable |
| weak | ⚠️ | reject_weak_final | Uncertain, unprepared |
| aggressive | 🔴 | reject_attitude_final | Rude, unprofessional |
| fail | ❌ | reject_*_final | Critical mistake |

---

## Resources

- **Template:** `pages/dialogue-template.js`
- **Validation Utility:** `pages/validate-dialogue.js`
- **Reference Example:** `pages/scenarios-data-v20.js`
- **Fixed Examples:** `pages/scenarios-data-v21.js`, `v22.js`, `v23.js`

---

## Version History

- **v1.0** (March 8, 2026) - Initial specification
  - Defined core rules
  - Created validation utility
  - Fixed dialogues #17, #18, #19
  - Created template and documentation

---

## Support

If you encounter issues not covered in this document:

1. Run validation utility to identify specific errors
2. Check examples in `scenarios-data-v20.js`
3. Review troubleshooting section
4. Verify all rules are followed

**Remember:** Following these rules **guarantees no deadlocks**. Every error caught by validation prevents a potential deadlock in production.
