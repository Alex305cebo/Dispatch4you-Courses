# FIX: Suggestion Card Selection Bug
## Date: March 8, 2026

## PROBLEM
After implementing the "show 4 cards from 6" feature, suggestion cards stopped responding to clicks. Users could see the cards but couldn't select them.

## ROOT CAUSE
The code created a filtered array `displaySuggestions` (4 cards) but the click handler tried to reference `allSuggestions[idx]` which didn't exist. This caused a mismatch between displayed cards and the data structure used in the click handler.

### Before (Broken):
```javascript
// Created displaySuggestions with 4 cards
const displaySuggestions = [guaranteedOne, ...selectedOthers].sort(() => Math.random() - 0.5);

displaySuggestions.forEach((suggestion, index) => {
    const btn = document.createElement('button');
    // ... button setup
    
    btn.onclick = () => {
        // ... selection logic
        allButtons.forEach((button, idx) => {
            const btnSuggestion = allSuggestions[idx];  // ❌ allSuggestions doesn't exist!
            // ...
        });
    };
});
```

## SOLUTION
Store a reference to the original suggestion index in each button's dataset, then retrieve it in the click handler.

### After (Fixed):
```javascript
displaySuggestions.forEach((suggestion, index) => {
    const btn = document.createElement('button');
    
    // ✅ Store reference to original suggestion
    btn.dataset.suggestionIndex = suggestions.indexOf(suggestion);
    
    // ... button setup
    
    btn.onclick = () => {
        // ... selection logic
        allButtons.forEach((button) => {
            // ✅ Get original suggestion by stored index
            const originalIndex = parseInt(button.dataset.suggestionIndex);
            const btnSuggestion = suggestions[originalIndex];
            // ...
        });
    };
});
```

## CHANGES MADE

### File: `pages/simulator.html`

**Change 1: Store original index in button dataset**
- Line ~4930
- Added: `btn.dataset.suggestionIndex = suggestions.indexOf(suggestion);`
- Purpose: Store reference to original suggestion for later retrieval

**Change 2: Retrieve suggestion by stored index**
- Line ~5070
- Changed: `const btnSuggestion = allSuggestions[idx];`
- To: `const originalIndex = parseInt(button.dataset.suggestionIndex); const btnSuggestion = suggestions[originalIndex];`
- Purpose: Correctly map displayed button back to original suggestion data

## TESTING
- ✅ No syntax errors (getDiagnostics passed)
- ✅ Buttons now have proper data reference
- ✅ Click handler can access correct suggestion data

## NEXT STEPS
1. Test in browser that cards are clickable
2. Verify all 4 cards display correctly
3. Confirm quality badges show after selection
4. Complete first dialogue (v1) with all reject paths
5. Create remaining 5 dialogues

## TECHNICAL NOTES
- Used `dataset` API for clean data storage on DOM elements
- `suggestions.indexOf(suggestion)` finds original position in full 6-item array
- `parseInt()` converts string dataset value back to number
- This approach maintains data integrity while showing filtered view
