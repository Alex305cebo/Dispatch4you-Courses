# TESTING INSTRUCTIONS - WARNING PATH FIX

## WHAT WAS FIXED
The simulator now correctly handles warning paths. When a user chooses a weak answer, goes to warning, then chooses a good answer to return to master, the dialogue continues from the correct position instead of restarting from the first question.

## FILES MODIFIED
- `pages/simulator.html` - Added `savedMasterStep` variable and path switching logic (lines 2980, 5330-5350)

## DIALOGUES WITH NEW STRUCTURE
✅ v24 - Reefer Frozen Seafood (Miami → Boston) - HAS warning + warning_strict
✅ v25 - Dry Van General Freight (Chicago → Atlanta) - HAS warning + warning_strict

## DIALOGUES WITH OLD STRUCTURE
⚠️ v18, v19, v20, v21, v22, v23 - Have warning but missing warning_strict (still work, just not complete)

## HOW TO TEST

### Test 1: Basic Warning Path (v25)
1. Open `pages/simulator.html` in browser
2. Select dialogue #25 (Chicago → Atlanta, Dry Van)
3. Start dialogue
4. On Step 1 (MC question), choose variant 3: "MC 556677, FreightLink Carriers."
   - Expected: Path changes to "warning"
   - Expected: See warning message: "⚠️ I need more confidence and details..."
5. Choose variant 1: "I apologize! Let me clarify: MC 556677..."
   - Expected: Path changes back to "master"
   - Expected: See Step 2 question (Location): "Good! 715 miles Chicago to Atlanta..."
   - ✅ SUCCESS if you see Step 2, NOT Step 1

### Test 2: Warning Strict Path (v25)
1. Start dialogue #25
2. On Step 1, choose variant 5: "Why all questions? Tell me rate!"
   - Expected: Path changes to "warning_strict"
   - Expected: See strict warning: "⚠️ STOP! I don't appreciate that attitude..."
3. Choose variant 1: "I sincerely apologize! MC 556677..."
   - Expected: Path changes back to "master"
   - Expected: See Step 2 question (Location)
   - ✅ SUCCESS if you see Step 2, NOT Step 1

### Test 3: Warning to Reject (v25)
1. Start dialogue #25
2. On Step 1, choose variant 3 (goes to warning)
3. On warning, choose variant 4: "I think everything is ready..."
   - Expected: Path changes to "reject_weak_final"
   - Expected: See reject message and outcome card
   - ✅ SUCCESS if dialogue ends with reject outcome

### Test 4: Multiple Warning Cycles (v25)
1. Start dialogue #25
2. On Step 1, choose variant 3 (warning)
3. On warning, choose variant 3 (returns to master)
4. On Step 2, choose variant 3 (warning again)
5. On warning, choose variant 1 (returns to master)
   - Expected: See Step 3 question (Experience)
   - ✅ SUCCESS if you see Step 3, NOT Step 1 or Step 2

### Test 5: Warning on Later Steps (v25)
1. Start dialogue #25
2. Choose excellent answers (variant 1) for steps 1-5
3. On Step 6 (Commitment), choose variant 3 (warning)
4. On warning, choose variant 1 (returns to master)
   - Expected: See Step 7 question (Rate)
   - ✅ SUCCESS if you see Step 7, NOT Step 1

## CONSOLE OUTPUT TO CHECK

Open browser console (F12) and look for these messages:

### When going to warning:
```
🔄 Path changed: master → warning (saved master step: X, starting warning from 0)
```

### When returning to master:
```
🔄 Path changed: warning → master (restored master step: X)
➡️ Moving to step Y, pathSteps.length=11
```

Where Y should be X+1 (the next step after the saved position).

## EXPECTED BEHAVIOR

### ✅ CORRECT:
- User on master step 2 → chooses weak → warning → chooses good → master step 3
- User on master step 5 → chooses weak → warning → chooses good → master step 6
- savedMasterStep is preserved across multiple warning cycles

### ❌ INCORRECT (OLD BUG):
- User on master step 2 → chooses weak → warning → chooses good → master step 1 (WRONG!)
- Dialogue restarts from beginning after warning

## VALIDATION

All dialogues pass deadlock checker:
```bash
node pages/check-deadlocks.js pages/scenarios-data-v25.js
# Expected: ✅ ОТЛИЧНО! Тупиков не найдено!
```

## NEXT STEPS IF TESTS PASS
1. ✅ Mark warning path fix as COMPLETE
2. Consider updating v18-v23 to add warning_strict paths (optional)
3. Create more dialogues with new structure
4. Document the new 3-path structure in rules

## NEXT STEPS IF TESTS FAIL
1. Check console for error messages
2. Verify conversationStep values in console logs
3. Check if savedMasterStep is being saved/restored correctly
4. Review path switching logic in simulator.html lines 5330-5350
