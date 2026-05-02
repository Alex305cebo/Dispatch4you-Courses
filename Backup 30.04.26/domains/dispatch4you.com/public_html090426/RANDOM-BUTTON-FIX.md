# FIX: Random Button and Bubbles Not Working

## PROBLEM
User reported: "ничего не происходит!" - Random button ("Случайный диалог") not responding to clicks AND cargo bubbles not displaying on welcome screen.

## ROOT CAUSE FOUND
**Browser console error: "Uncaught SyntaxError: Identifier 'allScenarios' has already been declared"**

The problem was NOT timing - it was **duplicate declarations**:
1. `simulator.html` declares `const allScenarios = []`
2. OLD files `scenarios-data.js`, `scenarios-data-test.js`, etc. ALSO declared `const allScenarios = []`
3. Browser loaded old cached files, causing syntax error
4. JavaScript execution stopped, preventing initialization

## SOLUTION

### 1. Removed Old Conflicting Files
Renamed old scenario files to prevent conflicts:
- `scenarios-data.js` → `scenarios-data.js.OLD`
- `scenarios-data-test.js` → `scenarios-data-test.js.OLD`
- `scenarios-data-all-15.js` → `scenarios-data-all-15.js.OLD`
- `scenarios-data-v3.js` → `scenarios-data-v3.js.OLD`

### 2. Updated Cache-Busting Parameters
Changed version from `?v=2` to `?v=20260308` (timestamp) to force browser reload:

```html
<script src="scenarios-data-v1.js?v=20260308"></script>
<script src="scenarios-data-v2.js?v=20260308"></script>
<script src="scenarios-generator-15.js?v=20260308"></script>
```

### 3. Kept Timing Improvements
Previous timing fixes are still in place:
- Delayed initialization with `setTimeout(init, 100)`
- Retry logic if scenarios not loaded
- Enhanced debug logging

## ACTIVE FILES NOW
Only these 3 scenario files should load:
1. `scenarios-data-v1.js` - Dialogue #1 (Flatbed Dallas-Denver)
2. `scenarios-data-v2.js` - Dialogue #2 (Dry Van Atlanta-Miami)
3. `scenarios-generator-15.js` - Dialogues #3-17 (auto-generated)

## EXPECTED BEHAVIOR AFTER FIX

1. **Hard refresh browser** (Ctrl+Shift+R or Ctrl+F5)
2. **Console shows**:
   - ✅ "Initialized allScenarios array"
   - ✅ "Scenario 1 added"
   - ✅ "Scenario 2 added"
   - ✅ "Generated and added 15 progressive dialogues"
   - ✅ "Total scenarios: 17"
   - ✅ "🚀 Initializing simulator..."
   - NO ERRORS!
3. **Welcome screen shows** 17 cargo bubbles
4. **Random button works** with slot machine animation

## TESTING INSTRUCTIONS

1. Open browser DevTools (F12)
2. Go to Network tab → Check "Disable cache"
3. Hard refresh page (Ctrl+Shift+R)
4. Check Console for errors
5. Verify 17 bubbles appear
6. Click "Случайный диалог" button

## FILES MODIFIED
- `pages/simulator.html` (cache-busting version updated)
- Renamed 4 old scenario files to `.OLD`

## STATUS
✅ FIXED - Duplicate declaration conflict resolved

Date: March 8, 2026
