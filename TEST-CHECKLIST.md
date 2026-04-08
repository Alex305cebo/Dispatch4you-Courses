# WARNING PATH FIX - TEST CHECKLIST

## QUICK TEST (5 minutes)

### Setup
- [ ] Open `pages/simulator.html` in browser
- [ ] Open browser console (F12)
- [ ] Select dialogue #25 (Chicago → Atlanta, Dry Van)

### Test 1: Basic Warning Path
- [ ] Start dialogue
- [ ] Step 1: Choose variant 2 "Morning! MC 556677, FreightLink Carriers. 25 dry vans. What's cargo?"
- [ ] ✅ PASS: See Step 2 "Good! 715 miles Chicago to Atlanta..."
- [ ] ❌ FAIL: See Step 1 again (MC question)
- [ ] Step 1: Choose variant 3 "MC 556677, FreightLink Carriers."
- [ ] Verify: See warning message "⚠️ I need more confidence..."
- [ ] Choose variant 1 "I apologize! Let me clarify..."
- [ ] ✅ PASS: See Step 2 "Good! 715 miles Chicago to Atlanta..."
- [ ] ❌ FAIL: See Step 1 again (MC question)

### Console Check
- [ ] See: `🔄 Path changed: master → warning (saved master step: 0, starting warning from 0)`
- [ ] See: `🔄 Path changed: warning → master (restored master step: 0)`
- [ ] See: `➡️ Moving to step 1, pathSteps.length=11`

## FULL TEST (15 minutes)

### Test 2: Warning Strict Path
- [ ] Start dialogue #25
- [ ] Step 1: Choose variant 5 "Why all questions? Tell me rate!"
- [ ] Verify: See strict warning "⚠️ STOP! I don't appreciate..."
- [ ] Choose variant 1 "I sincerely apologize..."
- [ ] ✅ PASS: See Step 2 (Location question)

### Test 3: Warning to Reject
- [ ] Start dialogue #25
- [ ] Step 1: Choose variant 3 (warning)
- [ ] Warning: Choose variant 4 "I think everything is ready..."
- [ ] ✅ PASS: See reject outcome card

### Test 4: Multiple Warning Cycles
- [ ] Start dialogue #25
- [ ] Step 1: Choose variant 3 → warning → variant 3 → Step 2
- [ ] Step 2: Choose variant 3 → warning → variant 1 → Step 3
- [ ] ✅ PASS: See Step 3 (Experience question)

### Test 5: Warning on Later Steps
- [ ] Start dialogue #25
- [ ] Steps 1-5: Choose variant 1 (excellent)
- [ ] Step 6: Choose variant 3 → warning → variant 1
- [ ] ✅ PASS: See Step 7 (Rate question)

## RESULTS

### If All Tests Pass ✅
- Mark warning path fix as COMPLETE
- Update CURRENT-STATUS.md
- Ready to create more dialogues

### If Any Test Fails ❌
- Note which test failed
- Check console for errors
- Review simulator.html lines 5330-5350
- Check savedMasterStep values in console

## QUICK VERIFICATION

Run this in browser console after each test:
```javascript
console.log('Current step:', conversationStep);
console.log('Current path:', currentPath);
console.log('Saved master step:', savedMasterStep);
```

Expected values after warning → master:
- conversationStep: Should be savedMasterStep + 1
- currentPath: Should be "master"
- savedMasterStep: Should be the step where warning was triggered

## NOTES

- Test with v25 (Chicago → Atlanta) - has complete warning structure
- Test with v24 (Miami → Boston) - also has complete warning structure
- v18-v23 have warning but missing warning_strict (still work)

## SIGN-OFF

- [ ] All 5 tests passed
- [ ] Console logs show correct behavior
- [ ] No errors in console
- [ ] Ready to mark as COMPLETE

Tested by: _______________
Date: _______________
