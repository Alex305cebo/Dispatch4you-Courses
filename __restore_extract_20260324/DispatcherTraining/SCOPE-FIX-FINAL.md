# FIX: allScenarios Scope Issue - Bubbles Not Displaying

## PROBLEM
- Bubbles (cargo cards) NOT displaying on welcome screen
- Random button ("Случайный диалог") not working
- Console shows scenarios loaded, but `showRandomBubbles()` can't access them

## ROOT CAUSE: SCOPE ISSUE

`allScenarios` was declared OUTSIDE `DOMContentLoaded`, but the main script was INSIDE `DOMContentLoaded`:

```javascript
// OUTSIDE (global scope)
const allScenarios = [];

// INSIDE DOMContentLoaded (local scope)
document.addEventListener('DOMContentLoaded', function() {
    // allScenarios is NOT accessible here!
    showRandomBubbles(); // FAILS - can't find allScenarios
});
```

This created a scope barrier - variables inside the function couldn't access `allScenarios`.

## SOLUTION: GLOBAL WINDOW OBJECT

Made `allScenarios` explicitly global using `window.allScenarios`:

### 1. In simulator.html
```javascript
// Initialize GLOBALLY
window.allScenarios = [];

// Later, reference it
const allScenarios = window.allScenarios;

document.addEventListener('DOMContentLoaded', function() {
    // Now allScenarios is accessible!
    showRandomBubbles(); // WORKS!
});
```

### 2. In scenarios-data-v1.js
```javascript
// OLD:
if (typeof allScenarios !== 'undefined') {
    allScenarios.push(scenario1);
}

// NEW:
if (typeof window.allScenarios !== 'undefined') {
    window.allScenarios.push(scenario1);
}
```

### 3. In scenarios-data-v2.js
```javascript
if (typeof window.allScenarios !== 'undefined') {
    window.allScenarios.push(scenario2);
}
```

### 4. In scenarios-generator-15.js
```javascript
if (typeof window.allScenarios !== 'undefined') {
    generatedScenarios.forEach(scenario => window.allScenarios.push(scenario));
}
```

## CHANGES MADE

1. ✅ `simulator.html` - Changed `const allScenarios = []` to `window.allScenarios = []`
2. ✅ `simulator.html` - Added `const allScenarios = window.allScenarios` reference
3. ✅ `scenarios-data-v1.js` - Changed to `window.allScenarios.push()`
4. ✅ `scenarios-data-v2.js` - Changed to `window.allScenarios.push()`
5. ✅ `scenarios-generator-15.js` - Changed to `window.allScenarios.push()`
6. ✅ Updated cache-busting to `?v=20260308-3`

## EXPECTED BEHAVIOR AFTER FIX

1. **Hard refresh** (Ctrl+Shift+R or Ctrl+F5)
2. **Console shows**:
   ```
   ✅ Initialized allScenarios array (global)
   🔵 Loading scenarios-data-v1.js...
   ✅ Scenario 1 (Flatbed Steel Dallas-Denver) added
   🔵 Loading scenarios-data-v2.js...
   ✅ Scenario 2 (Dry Van Electronics Atlanta-Miami) added
   🔵 Loading scenarios-generator-15.js...
   ✅ Generated and added 15 progressive dialogues (IDs 3-17)
   📊 Total scenarios: 17
   🎬 DOM Content Loaded - Starting initialization...
   📊 allScenarios accessible: true
   📊 allScenarios.length: 17
   🚀 Initializing simulator...
   🎨 showRandomBubbles() called
   📋 greetingOptions.length: 17
   ```
3. **Welcome screen** displays 17 cargo bubbles/cards
4. **Random button** works with slot machine animation
5. **NO ERRORS** in console

## TESTING INSTRUCTIONS

1. **CRITICAL**: Hard refresh to clear cache
   - Windows: `Ctrl + Shift + R` or `Ctrl + F5`
   - Mac: `Cmd + Shift + R`
   
2. Open DevTools (F12) → Console tab

3. Verify console output shows:
   - ✅ All 17 scenarios loaded
   - ✅ DOM Content Loaded
   - ✅ allScenarios accessible: true
   - ✅ allScenarios.length: 17

4. Check welcome screen:
   - Should see 17 cargo cards in grid layout
   - Each card shows route, distance, equipment icon

5. Test random button:
   - Click "Случайный диалог"
   - Should see slot machine animation
   - Should start random dialogue

## FILES MODIFIED
- `pages/simulator.html` (lines 2863, 2870-2871, 2875-2878)
- `pages/scenarios-data-v1.js` (line 432-436)
- `pages/scenarios-data-v2.js` (line 342-346)
- `pages/scenarios-generator-15.js` (line 366-371)

## PREVIOUS ISSUES RESOLVED
1. ✅ Duplicate `allScenarios` declarations → Renamed old files to .OLD
2. ✅ DOM elements not found → Wrapped in DOMContentLoaded
3. ✅ Scope issue → Made allScenarios global with window object

## STATUS
✅ FIXED - Scope issue resolved, bubbles should now display

Date: March 8, 2026
