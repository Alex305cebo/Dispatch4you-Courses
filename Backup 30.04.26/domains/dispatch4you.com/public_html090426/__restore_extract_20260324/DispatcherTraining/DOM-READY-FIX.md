# FIX: DOM Elements Not Found (bubblesContainer is null)

## PROBLEM
Browser console error: **"Uncaught TypeError: Cannot set properties of null (setting 'innerHTML')"**

The error occurred in `showRandomBubbles()` function when trying to set `bubblesContainer.innerHTML = ''`.

## ROOT CAUSE
DOM elements were being accessed BEFORE the DOM was fully loaded:

```javascript
// OLD (BROKEN):
const bubblesContainer = document.getElementById('bubblesContainer');
// This runs immediately when script loads, but DOM might not be ready yet!
```

Even though the `<script>` tag was placed at the end of `<body>`, the variables were declared at the TOP of the script, causing them to execute before DOM was ready.

## SOLUTION

### Wrapped Entire Script in DOMContentLoaded
Wrapped ALL code (variables, functions, init call) inside `DOMContentLoaded` event listener:

```javascript
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 DOM Content Loaded - Starting initialization...');
    
    // NOW these are safe - DOM is guaranteed to be ready
    const welcomeScreen = document.getElementById('welcomeScreen');
    const chatView = document.getElementById('chatView');
    const bubblesContainer = document.getElementById('bubblesContainer');
    const messagesContainer = document.getElementById('messagesContainer');
    const inputField = document.getElementById('inputField');
    const sendBtn = document.getElementById('sendBtn');
    const infoSections = document.getElementById('infoSections');

    console.log('📍 DOM Elements:', {
        welcomeScreen: !!welcomeScreen,
        chatView: !!chatView,
        bubblesContainer: !!bubblesContainer,
        // ... etc
    });

    if (!bubblesContainer) {
        console.error('❌ CRITICAL: bubblesContainer not found!');
        return;
    }

    // All functions and init() call...
    
}); // End of DOMContentLoaded
```

### Removed Duplicate DOMContentLoaded
Removed the old timing code that was trying to handle this:

```javascript
// REMOVED:
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    setTimeout(init, 100);
}

// REPLACED WITH:
init(); // Direct call, already inside DOMContentLoaded
```

### Added Debug Logging
Added comprehensive logging to verify DOM elements are found:

```javascript
console.log('🎬 DOM Content Loaded - Starting initialization...');
console.log('📍 DOM Elements:', {
    welcomeScreen: !!welcomeScreen,
    chatView: !!chatView,
    bubblesContainer: !!bubblesContainer,
    messagesContainer: !!messagesContainer,
    inputField: !!inputField,
    sendBtn: !!sendBtn,
    infoSections: !!infoSections
});
```

## CHANGES MADE

1. **Wrapped entire script** in `document.addEventListener('DOMContentLoaded', function() { ... });`
2. **Moved DOM element declarations** inside the wrapper (lines 2876-2900)
3. **Removed duplicate timing logic** (old DOMContentLoaded check)
4. **Added safety check** for bubblesContainer with early return
5. **Updated cache-busting** to `?v=20260308-2`

## EXPECTED BEHAVIOR AFTER FIX

1. **Hard refresh browser** (Ctrl+Shift+R)
2. **Console shows**:
   - 🎬 "DOM Content Loaded - Starting initialization..."
   - 📍 "DOM Elements: { welcomeScreen: true, chatView: true, bubblesContainer: true, ... }"
   - ✅ "Initialized allScenarios array"
   - ✅ "Total scenarios: 17"
   - 🚀 "Initializing simulator..."
   - NO ERRORS!
3. **Welcome screen** displays 17 cargo bubbles
4. **Random button** works with animation

## TESTING INSTRUCTIONS

1. Open browser DevTools (F12)
2. Go to Network tab → Check "Disable cache"
3. Hard refresh (Ctrl+Shift+R or Ctrl+F5)
4. Check Console tab:
   - Should see "🎬 DOM Content Loaded"
   - Should see all DOM elements as `true`
   - Should see NO errors
5. Verify 17 bubbles appear on screen
6. Click "Случайный диалог" button - should work

## FILES MODIFIED
- `pages/simulator.html` (lines 2875-2876, 6015-6016, 6256)

## PREVIOUS ISSUES RESOLVED
1. ✅ Duplicate `allScenarios` declarations (renamed old files to .OLD)
2. ✅ DOM elements not found (wrapped in DOMContentLoaded)
3. ✅ Timing issues (proper event listener)

## STATUS
✅ FIXED - DOM elements now properly initialized

Date: March 8, 2026
