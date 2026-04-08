# Implementation Tasks

## Task 1: Create validation utility
Create `pages/validate-dialogue.js` with functions to validate dialogue structure and detect deadlocks.

### Sub-tasks:
- [x] 1.1 Create validateDialogue() function that checks all validation rules
- [x] 1.2 Add check: master path exists and has 15-17 steps
- [x] 1.3 Add check: all suggestions in master lead to existing paths
- [x] 1.4 Add check: variants 1-3 (excellent/good/normal) lead to "master"
- [x] 1.5 Add check: variants 4-6 (weak/aggressive/fail) lead to "reject_*_final"
- [x] 1.6 Add check: all reject paths have "_final" suffix (except master)
- [x] 1.7 Add check: all reject_*_final paths contain exactly 1 element with outcome
- [x] 1.8 Add function to generate validation report with errors list

## Task 2: Test validation on v20 (known good)
Verify that validation utility correctly identifies v20 as valid.

### Sub-tasks:
- [x] 2.1 Run validateDialogue(scenario20) and verify it returns valid: true
- [x] 2.2 Verify no false positive errors on v20
- [x] 2.3 Document v20 as reference example

## Task 3: Run validation on v17, v18, v19
Identify all deadlock issues in existing dialogues.

### Sub-tasks:
- [x] 3.1 Run validation on scenarios-data-v17.js and document all errors
- [x] 3.2 Run validation on scenarios-data-v18.js and document all errors
- [x] 3.3 Run validation on scenarios-data-v19.js and document all errors
- [x] 3.4 Create summary report of all found issues

## Task 4: Fix dialogue #17 (create v21)
Fix all deadlock issues in dialogue #17 by creating corrected version.

### Sub-tasks:
- [x] 4.1 Create scenarios-data-v21.js based on v17
- [x] 4.2 Remove intermediate paths: weak, warning
- [x] 4.3 Convert all reject_* paths to reject_*_final with single outcome
- [x] 4.4 Update all path references in suggestions to use reject_*_final
- [x] 4.5 Verify all variants 1-3 lead to "master"
- [x] 4.6 Verify all variants 4-6 lead to "reject_*_final"
- [x] 4.7 Run validation and confirm zero errors
- [x] 4.8 Test manually in simulator - verify no deadlocks

## Task 5: Fix dialogue #18 (create v22)
Fix all deadlock issues in dialogue #18 by creating corrected version.

### Sub-tasks:
- [x] 5.1 Create scenarios-data-v22.js based on v18
- [x] 5.2 Remove intermediate paths: weak, warning
- [x] 5.3 Update all path references in suggestions to use reject_*_final
- [x] 5.4 Run validation and confirm zero errors
- [x] 5.5 Test manually in simulator - verify no deadlocks

## Task 6: Fix dialogue #19 (create v23)
Fix all deadlock issues in dialogue #19 by creating corrected version.

### Sub-tasks:
- [x] 6.1 Create scenarios-data-v23.js based on v19
- [x] 6.2 Remove intermediate paths: weak, warning
- [x] 6.3 Update all path references in suggestions to use reject_*_final
- [x] 6.4 Run validation and confirm zero errors
- [x] 6.5 Test manually in simulator - verify no deadlocks

## Task 7: Create dialogue template
Create template file for future dialogues to prevent deadlocks.

### Sub-tasks:
- [x] 7.1 Create pages/dialogue-template.js with correct structure
- [x] 7.2 Include all standard reject_*_final paths
- [x] 7.3 Add comments explaining each section
- [x] 7.4 Add example step with 6 suggestion variants
- [x] 7.5 Document how to use template

## Task 8: Create specification document
Document the rules for creating dialogues without deadlocks.

### Sub-tasks:
- [x] 8.1 Create pages/DIALOGUE-CREATION-SPEC.md
- [x] 8.2 Document RULE #1: Only two path types (master and reject_*_final)
- [x] 8.3 Document RULE #2: Structure of master path step with 6 variants
- [x] 8.4 Document RULE #3: Structure of reject_*_final path (single outcome)
- [x] 8.5 Document RULE #4: Forbidden patterns (intermediate paths)
- [x] 8.6 Document RULE #5: Pre-creation checklist
- [x] 8.7 Add examples of correct and incorrect structures
- [x] 8.8 Add troubleshooting section

## Task 9: Update simulator.html
Update simulator to load corrected dialogue versions.

### Sub-tasks:
- [x] 9.1 Update script tags to load v21, v22, v23 instead of v17, v18, v19
- [x] 9.2 Keep v20 as-is (already correct)
- [x] 9.3 Test that all dialogues load correctly
- [x] 9.4 Verify dialogue selection dropdown shows correct versions

## Task 10: Manual testing
Test all dialogues in simulator to confirm no deadlocks.

### Sub-tasks:
- [x] 10.1 Test v20: Select variant 4 on step 1 → verify final outcome shown
- [x] 10.2 Test v20: Select variant 5 on step 5 → verify final outcome shown
- [x] 10.3 Test v20: Select variant 6 on step 10 → verify final outcome shown
- [x] 10.4 Test v20: Complete full master path → verify success outcome
- [x] 10.5 Test v21: Select variant 4 on step 1 → verify final outcome shown
- [x] 10.6 Test v21: Select variant 5 on step 5 → verify final outcome shown
- [x] 10.7 Test v21: Complete full master path → verify success outcome
- [x] 10.8 Test v22: Select variant 4 on step 1 → verify final outcome shown
- [x] 10.9 Test v22: Select variant 5 on step 5 → verify final outcome shown
- [x] 10.10 Test v22: Complete full master path → verify success outcome
- [x] 10.11 Test v23: Select variant 4 on step 1 → verify final outcome shown
- [x] 10.12 Test v23: Select variant 5 on step 5 → verify final outcome shown
- [x] 10.13 Test v23: Complete full master path → verify success outcome
- [x] 10.14 Confirm zero deadlocks across all dialogues
