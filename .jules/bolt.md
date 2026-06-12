## 2025-03-24 - [Initial Journal]
**Learning:** Initializing Bolt's journal.
**Action:** Follow the Bolt philosophy for all future optimizations.

## 2025-05-14 - [Event Delegation vs Individual Listeners]
**Learning:** Attaching individual event listeners to thousands of DOM elements (O(N)) is significantly slower than global event delegation (O(1)). MutationObserver further compounds this overhead by re-scanning the DOM.
**Action:** Prefer global event delegation for site-wide interactive effects.
