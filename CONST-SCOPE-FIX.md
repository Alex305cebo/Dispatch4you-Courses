# FIX: Duplicate const allScenarios Declaration

## PROBLEM
Browser console error: **"Uncaught SyntaxError: Identifier 'allScenarios' has already been declared (at simulator.html:2876)"**

## ROOT CAUSE
`const allScenarios = window.allScenarios` was declared in GLOBAL scope (outside DOMContentLoaded), creating a conflict with the global `window.allScenarios`.

```javascript
// BROKEN CODE:
<script>
    // This is in GLOBAL scope
    const allScenarios = window.allScenarios; // ❌ CONFLICT!
    
    document.addEventListener('DOMContentLoaded', function() {
        // Code here...
    });
</script>
```

JavaScript saw TWO declarations in global scope:
1. `window.allScenarios` (property of window object)
2. `const allScenarios` (constant variable)

This caused a syntax error because `const` cannot be redeclared.

## SOLUTION
Moved `const allScenarios = window.allScenarios` INSIDE the DOMContentLoaded function:

```javascript
// FIXED CODE:
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Now this is in LOCAL scope (inside function)
        const allScenarios = window.allScenarios; // ✅ NO CONFLICT!
        
        // All code here can use allScenarios...
    });
</script>
```

Now `allScenarios` is a LOCAL variable inside the function, not global, so no conflict.

## CODE STRUCTURE

```
GLOBAL SCOPE:
├── window.allScenarios = []                    (line 2863)
├── <script src="scenarios-data-v1.js">         (loads, pushes to window.allScenarios)
├── <script src="scenarios-data-v2.js">         (loads, pushes to window.allScenarios)
├── <script src="scenarios-generator-15.js">    (loads, pushes to window.allScenarios)
└── DOMContentLoaded event listener
    └── LOCAL SCOPE (inside function):
        ├── const allScenarios = window.allScenarios  (line 2880 - LOCAL reference)
        ├── const bubblesContainer = ...
        ├── function init() { ... }
        ├── function showRandomBubbles() { ... }
        └── init() call
```

## CHANGES MADE

**Before (BROKEN):**
```javascript
<script>
    const allScenarios = window.allScenarios;  // ❌ Global scope
    
    document.addEventListener('DOMContentLoaded', function() {
        // ...
    });
</script>
```

**After (FIXED):**
```javascript
<script>
    document.addEventListener('DOMContentLoaded', function() {
        const allScenarios = window.allScenarios;  // ✅ Local scope
        // ...
    });
</script>
```

## FILES MODIFIED
- `pages/simulator.html` (moved line 2876 inside DOMContentLoaded, now line 2880)
- Updated cache-busting to `?v=20260308-5`

## EXPECTED BEHAVIOR AFTER FIX

1. **Hard refresh** (Ctrl+Shift+R or Ctrl+F5)
2. **NO syntax errors** in console
3. **Console shows**:
   ```
   ✅ Initialized allScenarios array (global)
   🔵 Loading scenarios-data-v1.js...
   ✅ Scenario 1 added
   🔵 Loading scenarios-data-v2.js...
   ✅ Scenario 2 added
   🔵 Loading scenarios-generator-15.js...
   ✅ Generated and added 15 progressive dialogues
   📊 Total scenarios loaded: 17
   🎬 DOM Content Loaded - Starting initialization...
   📊 allScenarios accessible: true
   📊 allScenarios.length: 17
   📍 DOM Elements: { bubblesContainer: true, ... }
   ⏰ Delayed init call - checking scenarios...
   🚀 Initializing simulator...
   🎨 showRandomBubbles() called
   📋 greetingOptions.length: 17
   ```
4. **17 cargo bubbles** display on welcome screen
5. **Random button** works

## TESTING INSTRUCTIONS

1. **CRITICAL**: Hard refresh to clear cache
   - Windows: `Ctrl + Shift + R` or `Ctrl + F5`
   - Mac: `Cmd + Shift + R`

2. Open DevTools (F12) → Console tab

3. Verify NO syntax errors

4. Check for success messages in console

5. Verify 17 bubbles appear on screen

6. Click "Случайный диалог" button

## PREVIOUS ISSUES RESOLVED
1. ✅ Duplicate `allScenarios` in old files → Renamed to .OLD
2. ✅ DOM elements not found → Wrapped in DOMContentLoaded
3. ✅ Scope issue with window.allScenarios → Made global
4. ✅ Duplicate const declaration → Moved inside function

## STATUS
✅ FIXED - const declaration moved to local scope

Date: March 8, 2026
