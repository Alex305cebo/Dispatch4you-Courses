# Design Document: Добавление 2 новых диалогов диспетчера с брокером

## Overview

This design describes the technical implementation of two new interactive training dialogues for the dispatcher simulator system. The dialogues follow the NEW DIALOG SYSTEM V2.0 architecture with 6 quality levels per step, multiple reject paths, and comprehensive educational feedback.

The two dialogues are:
1. Dialogue #5: Hazmat (Houston TX → Chicago IL) - Hard difficulty, chemical materials transport
2. Dialogue #6: Auto Transport (Detroit MI → Phoenix AZ) - Medium-hard difficulty, luxury vehicle transport

Both dialogues will be implemented as standalone JavaScript files that export scenario data structures compatible with the existing dialogue rendering system. The implementation follows established patterns from scenarios-data-v3.js and scenarios-data-v4.js.

## Architecture

### System Context

The dialogue system is a browser-based interactive training simulator where users practice negotiating freight loads with brokers. The architecture consists of:

- **Scenario Data Files**: JavaScript modules that export dialogue data structures
- **Dialogue Renderer**: Existing UI component that displays broker questions and dispatcher response options
- **State Manager**: Tracks user progress through dialogue paths (master, reject1-3)
- **Outcome Evaluator**: Displays final results with educational feedback

### File Structure

```
pages/
├── scenarios-data-v5.js  (Dialogue #5: Hazmat)
└── scenarios-data-v6.js  (Dialogue #6: Auto Transport)
```

Each file is self-contained and follows the module pattern:
- Console log statement for loading confirmation
- Scenario data constant declaration
- Push to global `allScenarios` array
- Confirmation logging

### Integration Points

The new dialogues integrate with the existing system through:
1. **Global Array**: Appending to `allScenarios` array
2. **Property Contract**: Matching exact property names and structure
3. **Quality System**: Using 6-level quality ratings (excellent, good, normal, weak, aggressive, fail)
4. **Path Routing**: Supporting master path and multiple reject paths

## Components and Interfaces

### Scenario Data Structure

Each scenario object contains the following top-level properties:

```javascript
{
  id: number,                    // Unique identifier (5 or 6)
  route: string,                 // "Origin → Destination"
  distance: number,              // Miles
  equipment: string,             // Equipment type description
  cargo: string,                 // Cargo description
  weight: string,                // Weight with units
  deadline: string,              // Pickup and delivery timeframes
  brokerStyle: string,           // Broker personality description
  difficulty: string,            // "hard" or "medium-hard"
  initialMessage: string,        // Dispatcher's opening call
  paths: {                       // Conversation paths object
    master: Step[],              // Main success path (8-12 steps)
    reject1: Step[],             // First reject path
    reject2: Step[],             // Second reject path
    reject3: Step[]              // Third reject path (optional)
  }
}
```

### Step Data Structure

Each conversation step contains:

```javascript
{
  brokerQuestion: string,        // Broker's question/response
  dispatcherPrompt: string,      // UI prompt with 💎 emoji
  suggestions: Suggestion[]      // 6 response options
}
```

Final steps in each path contain:

```javascript
{
  brokerResponse: string,        // Broker's final message
  outcome: Outcome               // Detailed outcome object
}
```

### Suggestion Data Structure

Each suggestion represents a dispatcher response option:

```javascript
{
  text: string,                  // Response text
  quality: string,               // "excellent" | "good" | "normal" | "weak" | "aggressive" | "fail"
  analytics: string,             // Feedback with emoji prefix
  path: string                   // "master" | "reject1" | "reject2" | "reject3"
}
```

### Outcome Data Structure

The outcome object provides comprehensive feedback:

```javascript
{
  type: string,                  // "success" | "failure"
  quality: string,               // Overall quality rating
  rate: string,                  // Final rate (e.g., "$3,500" or "$0")
  ratePerMile: string,           // Rate per mile (e.g., "$3.18/mile")
  relationship: string,          // Broker relationship status
  dialogueTime: string,          // Estimated conversation duration
  questionsAsked: string,        // Number/quality of questions
  detailLevel: string,           // Information gathering level
  futureOpportunity: string,     // "repeat" | "possible" | "unlikely" | "none"
  weeklyLoads: string,           // Potential weekly volume
  feedback: string               // Multi-paragraph educational feedback
}
```

## Data Models

### Dialogue #5: Hazmat (Chemical Materials)

**Scenario Metadata:**
- ID: 5
- Route: Houston TX → Chicago IL
- Distance: 1100 miles
- Equipment: Tanker
- Cargo: Chemical materials (Class 3 Flammable)
- Weight: 44,000 lbs
- Difficulty: hard
- Initial Rate: $3,200 ($2.91/mile)
- Target Rate: $3,500 ($3.18/mile)

**Master Path Structure (8-10 steps):**
1. MC verification + truck location
2. Hazmat endorsement verification
3. Placard requirements discussion
4. Routing restrictions and tunnel prohibitions
5. Emergency response kit requirements
6. Rate negotiation ($3,200 → $3,500)
7. Detention/layover terms
8. Pickup details + loading procedures
9. Delivery details + safety protocols
10. Final confirmation + outcome

**Reject Paths:**
- Reject1: Missing Hazmat certification
- Reject2: Refusing safety requirements
- Reject3: Unrealistic rate demands

**Key Educational Topics:**
- DOT Hazmat regulations (49 CFR)
- Class 3 Flammable placarding
- Tunnel restrictions (Hazmat routing)
- Emergency response procedures
- Tanker endorsement requirements
- Premium rate justification

### Dialogue #6: Auto Transport (Luxury Vehicles)

**Scenario Metadata:**
- ID: 6
- Route: Detroit MI → Phoenix AZ
- Distance: 1900 miles
- Equipment: Car Carrier (9-car capacity)
- Cargo: Luxury vehicles (Tesla, BMW, Mercedes)
- Weight: 65,000 lbs (9 vehicles)
- Difficulty: medium-hard
- Initial Rate: $5,000 ($2.63/mile)
- Target Rate: $5,500 ($2.89/mile)

**Master Path Structure (8-10 steps):**
1. MC verification + equipment availability
2. Cargo insurance verification ($500K minimum)
3. Vehicle inspection procedures
4. Enclosed vs open transport discussion
5. Damage documentation protocols
6. Rate negotiation ($5,000 → $5,500)
7. Detention/layover terms
8. Pickup details + vehicle condition documentation
9. Delivery details + customer communication
10. Final confirmation + outcome

**Reject Paths:**
- Reject1: Insufficient insurance coverage
- Reject2: Lack of luxury vehicle experience
- Reject3: Unrealistic rate demands

**Key Educational Topics:**
- High-value cargo insurance requirements
- Pre-trip inspection procedures
- Photo documentation best practices
- Enclosed transport benefits
- Customer communication protocols
- Premium rate justification for specialized equipment

### Quality Level Mapping

Each step provides 6 response options mapped to quality levels:

| Quality | Analytics Prefix | Path Routing | Description |
|---------|-----------------|--------------|-------------|
| excellent | ✨ Отлично! | master | Comprehensive, professional, proactive |
| good | ✔️ Хорошо! | master | Solid, professional, adequate |
| normal | ⚪ Нормально. | master | Basic, acceptable, minimal |
| weak | ⚠️ Слабо. | master | Uncertain, incomplete, unprofessional |
| aggressive | 🔴 Агрессивно. | reject path | Rude, confrontational, unreasonable |
| fail | ❌ Провал. | reject path | Critical error, incompetence, red flag |

### Rate Negotiation Model

Both dialogues follow a structured negotiation pattern:

**Hazmat Dialogue:**
- Initial offer: $3,200 ($2.91/mile)
- Professional negotiation: $3,350 ($3.05/mile)
- Excellent negotiation: $3,500 ($3.18/mile)
- Unrealistic demand: $4,000+ → reject

**Auto Transport Dialogue:**
- Initial offer: $5,000 ($2.63/mile)
- Professional negotiation: $5,250 ($2.76/mile)
- Excellent negotiation: $5,500 ($2.89/mile)
- Unrealistic demand: $6,500+ → reject

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property Reflection

After analyzing all acceptance criteria, I've identified the following redundancies and consolidations:

**Redundancies to eliminate:**
- Properties 1.5, 2.5 can be combined into one property about 6 quality levels per step
- Properties 1.9, 2.9, 5.1 all test outcome object presence - combine into one
- Properties 4.1-4.6 test analytics prefixes - can be combined into one comprehensive property
- Properties 4.7-4.8 test path routing based on quality - combine into one
- Properties 5.2-5.12 test outcome fields - combine related fields into fewer properties
- Properties 3.7, 10.2 are identical - use one
- Properties 9.1-9.6 test broker response details - combine into one comprehensive property
- Properties 10.4-10.6 test language and emoji usage - combine into one

**Properties to keep as examples (specific content validation):**
- Scenario metadata (1.1-1.3, 2.1-2.3)
- Specific dialogue content (6.1-6.9, 7.1-7.9, 8.1-8.8)
- File structure (3.1-3.4)

**Final property set after consolidation:**
- Property 1: Master path length validation (8-12 steps)
- Property 2: Six quality levels per step
- Property 3: Reject path structure (empty first step)
- Property 4: Required metadata fields
- Property 5: Analytics prefix matches quality level
- Property 6: Path routing based on quality
- Property 7: Outcome object completeness
- Property 8: Outcome type matches path type
- Property 9: Outcome rate format validation
- Property 10: Broker response completeness
- Property 11: Language and emoji consistency
- Property 12: Property naming consistency

### Property 1: Master Path Length Validation

*For any* scenario in the dialogue system, the master path SHALL contain between 8 and 12 conversation steps (excluding the final outcome step).

**Validates: Requirements 1.4, 2.4**

### Property 2: Six Quality Levels Per Step

*For any* conversation step in the master path (excluding the final outcome step), the suggestions array SHALL contain exactly 6 options with quality values: "excellent", "good", "normal", "weak", "aggressive", and "fail" (one of each).

**Validates: Requirements 1.5, 2.5**

### Property 3: Reject Path Structure

*For any* reject path (reject1, reject2, reject3) in a scenario, the first element SHALL be an empty object {} for system compatibility.

**Validates: Requirements 3.6**

### Property 4: Required Metadata Fields

*For any* scenario object, it SHALL include all required metadata fields: id, route, distance, equipment, cargo, difficulty, brokerStyle, weight, deadline, and initialMessage.

**Validates: Requirements 3.8**

### Property 5: Analytics Prefix Matches Quality Level

*For any* suggestion in a conversation step, the analytics field SHALL start with the correct emoji prefix based on quality: "✨ Отлично!" for excellent, "✔️ Хорошо!" for good, "⚪ Нормально." for normal, "⚠️ Слабо." for weak, "🔴 Агрессивно." for aggressive, and "❌ Провал." for fail.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6**

### Property 6: Path Routing Based on Quality

*For any* suggestion in a conversation step, if the quality is "excellent", "good", "normal", or "weak", the path SHALL be "master"; if the quality is "aggressive" or "fail", the path SHALL be a reject path (reject1, reject2, or reject3).

**Validates: Requirements 4.7, 4.8**

### Property 7: Outcome Object Completeness

*For any* path (master or reject) in a scenario, the final step SHALL contain an outcome object with all required fields: type, quality, rate, ratePerMile, relationship, dialogueTime, questionsAsked, detailLevel, futureOpportunity, weeklyLoads, and feedback.

**Validates: Requirements 1.9, 2.9, 5.1, 5.3, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11**

### Property 8: Outcome Type Matches Path Type

*For any* completed path, if the path is "master", the outcome.type SHALL be "success"; if the path is a reject path (reject1, reject2, reject3), the outcome.type SHALL be "failure".

**Validates: Requirements 5.2**

### Property 9: Outcome Rate Format Validation

*For any* outcome object, if the type is "success", the rate SHALL be a non-zero dollar amount (e.g., "$3,500") and ratePerMile SHALL be a non-zero rate (e.g., "$3.18/mile"); if the type is "failure", the rate SHALL be "$0" and ratePerMile SHALL be "$0/mile".

**Validates: Requirements 5.4, 5.5**

### Property 10: Broker Response Completeness

*For any* scenario's master path, broker responses SHALL include all critical load details: pickup location (address, contact, phone, time window), delivery location (address, contact, phone, time window), cargo details (weight, handling requirements), loading/unloading procedures, detention pay terms, and required documentation.

**Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6**

### Property 11: Language and Emoji Consistency

*For any* conversation step, the dispatcherPrompt SHALL start with 💎 emoji and contain Russian text, the analytics SHALL contain Russian text with appropriate emoji prefix, broker text (brokerQuestion, brokerResponse, suggestion text) SHALL be in English, and outcome feedback SHALL contain Russian text with emoji markers (✅, 💡, 🎯).

**Validates: Requirements 10.4, 10.5, 10.6**

### Property 12: Property Naming Consistency

*For any* scenario object and its nested structures, all property names SHALL match the established naming convention: id, route, distance, equipment, cargo, weight, deadline, brokerStyle, difficulty, initialMessage, paths, master, reject1, reject2, reject3, brokerQuestion, dispatcherPrompt, suggestions, text, quality, analytics, path, brokerResponse, outcome.

**Validates: Requirements 3.7, 10.2**

## Error Handling

### Input Validation

The dialogue system is data-driven and does not accept runtime user input beyond selecting predefined suggestions. Error handling focuses on data structure validation:

**Missing Required Fields:**
- If a scenario lacks required metadata fields, the renderer should display an error message
- If a step lacks required properties (brokerQuestion, dispatcherPrompt, suggestions), skip the step and log a warning

**Invalid Quality Values:**
- If a suggestion has an invalid quality value, default to "normal" quality
- Log a warning for debugging

**Path Routing Errors:**
- If a suggestion's path value doesn't match an existing path, default to "master"
- Log a warning for debugging

**Outcome Validation:**
- If the final step lacks an outcome object, display a generic completion message
- Log an error for debugging

### Data Structure Errors

**Empty Paths:**
- If master path is empty, display error: "Dialogue configuration error"
- If all reject paths are empty, allow dialogue to proceed (reject paths are optional)

**Circular References:**
- The data structure is a tree (no circular references possible)
- Each step leads to the next step or a reject path

**Missing Translations:**
- If Russian text is missing, fall back to English
- If English text is missing, display placeholder text

### Runtime Errors

**Rendering Errors:**
- If a step fails to render, log the error and skip to the next step
- If the outcome fails to render, display a generic completion message

**State Management Errors:**
- If path tracking fails, reset to master path
- If step index becomes invalid, reset to step 0

## Testing Strategy

### Dual Testing Approach

The implementation will use both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests** focus on:
- Specific example scenarios (Hazmat and Auto Transport metadata)
- Edge cases (empty paths, missing fields)
- Integration points (file loading, array appending)
- Specific content validation (rate values, educational topics)

**Property-Based Tests** focus on:
- Universal properties that hold for all dialogues
- Structure validation across all steps
- Quality level consistency
- Path routing logic
- Outcome object completeness

### Property-Based Testing Configuration

**Library Selection:**
- JavaScript: fast-check (recommended for browser-based testing)
- Alternative: jsverify

**Test Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number
- Tag format: `// Feature: add-two-new-dialogues, Property {number}: {property_text}`

**Generator Strategy:**

For testing the dialogue structure, we'll create generators for:
- Scenario objects with random metadata
- Conversation steps with 6 quality levels
- Outcome objects with all required fields
- Path arrays with varying lengths

Example property test structure:

```javascript
// Feature: add-two-new-dialogues, Property 2: Six quality levels per step
fc.assert(
  fc.property(
    scenarioGenerator(),
    (scenario) => {
      const masterPath = scenario.paths.master;
      // Exclude final outcome step
      const conversationSteps = masterPath.slice(0, -1);
      
      return conversationSteps.every(step => {
        if (!step.suggestions) return true; // Skip empty steps
        
        const qualities = step.suggestions.map(s => s.quality);
        const expectedQualities = ['excellent', 'good', 'normal', 'weak', 'aggressive', 'fail'];
        
        return qualities.length === 6 &&
               expectedQualities.every(q => qualities.includes(q));
      });
    }
  ),
  { numRuns: 100 }
);
```

### Unit Test Coverage

**File Structure Tests:**
- Verify scenarios-data-v5.js exists and exports scenario5
- Verify scenarios-data-v6.js exists and exports scenario6
- Verify console.log statements are present
- Verify scenarios are appended to allScenarios array

**Scenario Metadata Tests:**
- Verify scenario 5 has id=5, route="Houston TX → Chicago IL", distance=1100
- Verify scenario 6 has id=6, route="Detroit MI → Phoenix AZ", distance=1900
- Verify difficulty levels are correct ("hard" and "medium-hard")

**Content Validation Tests:**
- Verify Hazmat dialogue includes keywords: "Hazmat", "placard", "Class 3", "emergency"
- Verify Auto Transport dialogue includes keywords: "insurance", "luxury", "inspection", "enclosed"
- Verify rate values appear: $3,200, $3,500 (scenario 5); $5,000, $5,500 (scenario 6)

**Reject Path Tests:**
- Verify each scenario has at least 2 reject paths
- Verify first element of each reject path is empty object {}
- Verify reject paths end with failure outcomes

**Outcome Tests:**
- Verify master path outcome has type="success"
- Verify reject path outcomes have type="failure"
- Verify success outcomes have non-zero rates
- Verify failure outcomes have rate="$0"

### Integration Testing

**Compatibility Tests:**
- Load new scenarios alongside existing scenarios (v1-v4)
- Verify allScenarios array contains all scenarios
- Verify no property name conflicts
- Verify dialogue renderer can display new scenarios

**End-to-End Tests:**
- Simulate complete dialogue flow through master path
- Simulate dialogue flow through each reject path
- Verify outcomes display correctly
- Verify educational feedback is shown

### Test Execution

**Unit Tests:**
- Run with Jest or Mocha
- Target: 100% coverage of new files
- Run on every commit

**Property Tests:**
- Run with fast-check
- Target: 100 iterations per property
- Run on every commit

**Integration Tests:**
- Run in browser environment
- Test with actual dialogue renderer
- Run before release

### Quality Metrics

**Code Coverage:**
- Target: 95%+ line coverage
- Target: 100% branch coverage for path routing logic

**Property Test Success:**
- All 12 properties must pass 100 iterations
- Zero failures allowed

**Content Validation:**
- All required educational topics must be present
- All rate values must be accurate
- All Russian/English text must be in correct fields

## Implementation Notes

### Development Workflow

1. Create scenarios-data-v5.js with Hazmat dialogue structure
2. Implement master path (8-10 steps) with 6 quality levels each
3. Implement reject paths (2-3 paths) with appropriate outcomes
4. Write unit tests for scenario 5
5. Create scenarios-data-v6.js with Auto Transport dialogue structure
6. Implement master path (8-10 steps) with 6 quality levels each
7. Implement reject paths (2-3 paths) with appropriate outcomes
8. Write unit tests for scenario 6
9. Write property-based tests for universal properties
10. Run all tests and verify coverage
11. Manual testing with dialogue renderer
12. Code review and refinement

### Code Style Guidelines

**Formatting:**
- Use 4-space indentation (matching existing files)
- Use double quotes for strings
- Add blank lines between steps for readability
- Align object properties vertically when possible

**Naming:**
- Use exact property names from existing scenarios
- Use descriptive variable names in test files
- Follow camelCase for JavaScript identifiers

**Comments:**
- Add step number comments (// ШАГ 1:, // ШАГ 2:, etc.)
- Add descriptive comments for each step's purpose
- Document any deviations from standard structure

**Content Guidelines:**
- Keep broker dialogue professional and realistic
- Use industry-standard terminology
- Include specific numbers (addresses, phone numbers, rates)
- Make educational feedback actionable and specific
- Use emoji consistently for visual clarity

### Performance Considerations

**File Size:**
- Each scenario file will be approximately 15-20 KB
- Total addition: ~35-40 KB to application bundle
- No performance impact expected (static data)

**Loading Time:**
- Files load synchronously on page load
- Console.log statements help track loading progress
- No lazy loading needed for 2 additional scenarios

**Memory Usage:**
- Scenario data stored in memory as JavaScript objects
- Estimated memory footprint: ~50-100 KB per scenario
- No memory leaks (static data, no event listeners)

### Maintenance Considerations

**Extensibility:**
- Structure supports adding more scenarios (v7, v8, etc.)
- Each file is independent and self-contained
- Easy to modify individual dialogues without affecting others

**Localization:**
- Russian text in user-facing fields (dispatcherPrompt, analytics, feedback)
- English text in broker dialogue (brokerQuestion, brokerResponse)
- Easy to add translations by modifying text fields

**Content Updates:**
- Rate values can be updated to reflect market changes
- Educational content can be enhanced over time
- New reject paths can be added without breaking existing paths

### Dependencies

**External Dependencies:**
- None (pure JavaScript data structures)
- Compatible with ES5+ browsers

**Internal Dependencies:**
- Requires allScenarios global array to exist
- Requires dialogue renderer component (existing)
- Requires state management system (existing)

**Testing Dependencies:**
- fast-check for property-based testing
- Jest or Mocha for unit testing
- Browser environment for integration testing
