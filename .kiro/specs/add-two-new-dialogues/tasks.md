# Implementation Plan: Add Two New Dialogues

## Overview

This plan implements two new interactive training dialogues for the dispatcher simulator system:
- Dialogue #5: Hazmat (Houston TX → Chicago IL) - Hard difficulty
- Dialogue #6: Auto Transport (Detroit MI → Phoenix AZ) - Medium-hard difficulty

Both dialogues follow the NEW DIALOG SYSTEM V2.0 architecture with 6 quality levels per step, multiple reject paths, and comprehensive educational feedback. Implementation uses JavaScript with the fast-check library for property-based testing.

## Tasks

- [x] 1. Set up project structure and testing framework
  - Create pages/scenarios-data-v5.js and pages/scenarios-data-v6.js files
  - Install fast-check library for property-based testing
  - Set up test file structure for unit and property tests
  - _Requirements: 3.1, 3.2_

- [x] 2. Implement Dialogue #5 (Hazmat) - Scenario metadata and structure
  - [x] 2.1 Create scenario5 object with metadata
    - Implement id, route, distance, equipment, cargo, weight, deadline, brokerStyle, difficulty, initialMessage fields
    - Add console.log statements for file loading confirmation
    - _Requirements: 1.1, 1.2, 1.3, 3.3, 3.4, 3.8_
  
  - [x] 2.2 Implement master path structure (8-10 steps)
    - Create paths.master array with conversation steps
    - Each step includes brokerQuestion, dispatcherPrompt, and suggestions array
    - _Requirements: 1.4, 3.5_
  
  - [ ]* 2.3 Write property test for master path length
    - **Property 1: Master path length validation**
    - **Validates: Requirements 1.4**

- [x] 3. Implement Dialogue #5 (Hazmat) - Master path conversation steps
  - [x] 3.1 Implement Step 1: MC verification + truck location
    - Create 6 quality-level suggestions (excellent, good, normal, weak, aggressive, fail)
    - Add analytics with appropriate emoji prefixes
    - Set path routing based on quality level
    - _Requirements: 1.5, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_
  
  - [x] 3.2 Implement Step 2: Hazmat endorsement verification
    - Create 6 quality-level suggestions covering CDL Hazmat endorsement questions
    - _Requirements: 1.5, 6.1_
  
  - [x] 3.3 Implement Step 3: Placard requirements discussion
    - Create 6 quality-level suggestions covering Class 3 Flammable placarding
    - _Requirements: 1.5, 6.2_
  
  - [x] 3.4 Implement Step 4: Routing restrictions and tunnel prohibitions
    - Create 6 quality-level suggestions covering Hazmat routing requirements
    - _Requirements: 1.5, 6.3_
  
  - [x] 3.5 Implement Step 5: Emergency response kit requirements
    - Create 6 quality-level suggestions covering safety equipment
    - _Requirements: 1.5, 6.4_
  
  - [x] 3.6 Implement Step 6: Rate negotiation ($3,200 → $3,500)
    - Create 6 quality-level suggestions with professional negotiation phrases
    - Include market rate references and equipment justification
    - _Requirements: 1.5, 1.7, 8.1, 8.2, 8.3, 8.7_
  
  - [x] 3.7 Implement Step 7: Detention/layover terms
    - Create 6 quality-level suggestions covering detention pay negotiation
    - _Requirements: 1.5, 9.5_
  
  - [x] 3.8 Implement Step 8: Pickup details + loading procedures
    - Create 6 quality-level suggestions gathering pickup information
    - _Requirements: 1.5, 9.1, 9.3, 9.4_
  
  - [x] 3.9 Implement Step 9: Delivery details + safety protocols
    - Create 6 quality-level suggestions gathering delivery information
    - _Requirements: 1.5, 9.2, 9.3_
  
  - [x] 3.10 Implement Step 10: Final confirmation + outcome
    - Create brokerResponse with complete load details
    - Implement outcome object with all required fields
    - _Requirements: 1.9, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 5.12, 9.6_
  
  - [ ]* 3.11 Write property test for six quality levels per step
    - **Property 2: Six quality levels per step**
    - **Validates: Requirements 1.5**
  
  - [ ]* 3.12 Write property test for analytics prefix matching
    - **Property 5: Analytics prefix matches quality level**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6**
  
  - [ ]* 3.13 Write property test for path routing
    - **Property 6: Path routing based on quality**
    - **Validates: Requirements 4.7, 4.8**

- [x] 4. Implement Dialogue #5 (Hazmat) - Reject paths
  - [x] 4.1 Implement reject1 path (missing Hazmat certification)
    - Create empty first step for system compatibility
    - Implement failure outcome with educational feedback
    - _Requirements: 1.6, 3.6, 6.6_
  
  - [x] 4.2 Implement reject2 path (refusing safety requirements)
    - Create empty first step for system compatibility
    - Implement failure outcome with educational feedback
    - _Requirements: 1.6, 3.6, 6.7_
  
  - [x] 4.3 Implement reject3 path (unrealistic rate demands)
    - Create empty first step for system compatibility
    - Implement failure outcome with market rate feedback
    - _Requirements: 1.6, 3.6, 8.3_
  
  - [ ]* 4.4 Write property test for reject path structure
    - **Property 3: Reject path structure**
    - **Validates: Requirements 3.6**
  
  - [ ]* 4.5 Write property test for outcome type matching path type
    - **Property 8: Outcome type matches path type**
    - **Validates: Requirements 5.2**

- [x] 5. Implement Dialogue #5 (Hazmat) - Educational feedback and finalization
  - [x] 5.1 Add comprehensive feedback to all outcomes
    - Include DOT Hazmat regulations explanation
    - Include placarding requirements and emergency response procedures
    - Include premium rate justification ($3.18/mile)
    - Use emoji markers (✅, 💡, 🎯) for feedback sections
    - _Requirements: 1.10, 6.8, 6.9, 8.8_
  
  - [x] 5.2 Add scenario5 to allScenarios array
    - Append scenario5 to global allScenarios array
    - Add console.log confirmation statement
    - _Requirements: 3.3, 10.7_
  
  - [ ]* 5.3 Write unit tests for Hazmat scenario metadata
    - Test id=5, route, distance, equipment, cargo, difficulty
    - Test rate values ($3,200, $3,500)
    - Test Hazmat-specific keywords in content
    - _Requirements: 1.1, 1.2, 1.7_
  
  - [ ]* 5.4 Write property test for required metadata fields
    - **Property 4: Required metadata fields**
    - **Validates: Requirements 3.8**

- [x] 6. Checkpoint - Verify Dialogue #5 implementation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement Dialogue #6 (Auto Transport) - Scenario metadata and structure
  - [x] 7.1 Create scenario6 object with metadata
    - Implement id, route, distance, equipment, cargo, weight, deadline, brokerStyle, difficulty, initialMessage fields
    - Add console.log statements for file loading confirmation
    - _Requirements: 2.1, 2.2, 2.3, 3.3, 3.4, 3.8_
  
  - [x] 7.2 Implement master path structure (8-10 steps)
    - Create paths.master array with conversation steps
    - Each step includes brokerQuestion, dispatcherPrompt, and suggestions array
    - _Requirements: 2.4, 3.5_
  
  - [ ]* 7.3 Write property test for master path length
    - **Property 1: Master path length validation**
    - **Validates: Requirements 2.4**

- [x] 8. Implement Dialogue #6 (Auto Transport) - Master path conversation steps
  - [x] 8.1 Implement Step 1: MC verification + equipment availability
    - Create 6 quality-level suggestions (excellent, good, normal, weak, aggressive, fail)
    - Add analytics with appropriate emoji prefixes
    - Set path routing based on quality level
    - _Requirements: 2.5, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_
  
  - [x] 8.2 Implement Step 2: Cargo insurance verification
    - Create 6 quality-level suggestions covering $500K minimum insurance
    - _Requirements: 2.5, 7.1_
  
  - [x] 8.3 Implement Step 3: Vehicle inspection procedures
    - Create 6 quality-level suggestions covering inspection and damage documentation
    - _Requirements: 2.5, 7.2_
  
  - [x] 8.4 Implement Step 4: Enclosed vs open transport discussion
    - Create 6 quality-level suggestions covering transport options
    - _Requirements: 2.5, 7.3_
  
  - [x] 8.5 Implement Step 5: Luxury vehicle experience
    - Create 6 quality-level suggestions demonstrating experience
    - _Requirements: 2.5, 7.4_
  
  - [x] 8.6 Implement Step 6: Rate negotiation ($5,000 → $5,500)
    - Create 6 quality-level suggestions with professional negotiation phrases
    - Include market rate references and specialized equipment justification
    - _Requirements: 2.5, 2.7, 8.4, 8.5, 8.6, 8.7_
  
  - [x] 8.7 Implement Step 7: Detention/layover terms
    - Create 6 quality-level suggestions covering detention pay negotiation
    - _Requirements: 2.5, 9.5_
  
  - [x] 8.8 Implement Step 8: Pickup details + vehicle condition documentation
    - Create 6 quality-level suggestions gathering pickup information
    - _Requirements: 2.5, 9.1, 9.3, 9.4_
  
  - [x] 8.9 Implement Step 9: Delivery details + customer communication
    - Create 6 quality-level suggestions covering delivery and communication
    - _Requirements: 2.5, 7.5, 9.2, 9.3_
  
  - [x] 8.10 Implement Step 10: Final confirmation + outcome
    - Create brokerResponse with complete load details
    - Implement outcome object with all required fields
    - _Requirements: 2.9, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 5.12, 9.6_
  
  - [ ]* 8.11 Write property test for six quality levels per step
    - **Property 2: Six quality levels per step**
    - **Validates: Requirements 2.5**

- [x] 9. Implement Dialogue #6 (Auto Transport) - Reject paths
  - [x] 9.1 Implement reject1 path (insufficient insurance coverage)
    - Create empty first step for system compatibility
    - Implement failure outcome with insurance requirement feedback
    - _Requirements: 2.6, 3.6, 7.6_
  
  - [x] 9.2 Implement reject2 path (lack of luxury vehicle experience)
    - Create empty first step for system compatibility
    - Implement failure outcome with experience requirement feedback
    - _Requirements: 2.6, 3.6, 7.7_
  
  - [x] 9.3 Implement reject3 path (unrealistic rate demands)
    - Create empty first step for system compatibility
    - Implement failure outcome with market rate feedback
    - _Requirements: 2.6, 3.6, 8.6_
  
  - [ ]* 9.4 Write property test for outcome rate format validation
    - **Property 9: Outcome rate format validation**
    - **Validates: Requirements 5.4, 5.5**

- [x] 10. Implement Dialogue #6 (Auto Transport) - Educational feedback and finalization
  - [x] 10.1 Add comprehensive feedback to all outcomes
    - Include auto transport best practices explanation
    - Include insurance requirements and high-value cargo handling
    - Include premium rate justification ($2.89/mile)
    - Use emoji markers (✅, 💡, 🎯) for feedback sections
    - _Requirements: 2.10, 7.8, 7.9, 8.8_
  
  - [x] 10.2 Add scenario6 to allScenarios array
    - Append scenario6 to global allScenarios array
    - Add console.log confirmation statement
    - _Requirements: 3.3, 10.7_
  
  - [ ]* 10.3 Write unit tests for Auto Transport scenario metadata
    - Test id=6, route, distance, equipment, cargo, difficulty
    - Test rate values ($5,000, $5,500)
    - Test auto transport-specific keywords in content
    - _Requirements: 2.1, 2.2, 2.7_

- [x] 11. Implement comprehensive property-based tests
  - [ ]* 11.1 Write property test for outcome object completeness
    - **Property 7: Outcome object completeness**
    - **Validates: Requirements 1.9, 2.9, 5.1, 5.3, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11**
  
  - [ ]* 11.2 Write property test for broker response completeness
    - **Property 10: Broker response completeness**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6**
  
  - [ ]* 11.3 Write property test for language and emoji consistency
    - **Property 11: Language and emoji consistency**
    - **Validates: Requirements 10.4, 10.5, 10.6**
  
  - [ ]* 11.4 Write property test for property naming consistency
    - **Property 12: Property naming consistency**
    - **Validates: Requirements 3.7, 10.2**

- [x] 12. Integration and compatibility testing
  - [ ]* 12.1 Write integration tests for file loading
    - Test scenarios-data-v5.js loads and exports scenario5
    - Test scenarios-data-v6.js loads and exports scenario6
    - Test scenarios are appended to allScenarios array
    - _Requirements: 3.1, 3.2, 3.3, 10.7_
  
  - [ ]* 12.2 Write compatibility tests with existing system
    - Test property naming matches existing scenarios (v3, v4)
    - Test structure compatibility with dialogue renderer
    - Test formatting and indentation consistency
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [ ]* 12.3 Write unit tests for reject path outcomes
    - Test all reject paths end with failure outcomes
    - Test failure outcomes have rate="$0" and ratePerMile="$0/mile"
    - Test educational feedback is present in all reject outcomes
    - _Requirements: 5.2, 5.4, 5.5_

- [x] 13. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties across both dialogues
- Unit tests validate specific examples and edge cases for each dialogue
- All code uses JavaScript following existing file patterns (scenarios-data-v3.js, scenarios-data-v4.js)
- Testing uses fast-check library with minimum 100 iterations per property test
- Russian text for user-facing content (dispatcherPrompt, analytics, feedback)
- English text for broker dialogue (brokerQuestion, brokerResponse, suggestion text)
- Emoji indicators used consistently throughout (💎, ✨, ✔️, ⚪, ⚠️, 🔴, ❌, ✅, 💡, 🎯)
