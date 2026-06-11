## 2025-06-11 - Global Event Delegation for Interactive Feedback
**Learning:** Using `MutationObserver` to scan the entire DOM and attach listeners individually to interactive elements causes O(N) overhead during initialization and every DOM mutation. Replacing this with Global Event Delegation on `document` achieves O(1) initialization and automatic support for dynamic elements with near-zero overhead.
**Action:** Always prefer global event delegation for generic interactive behaviors (clicks, hover states, haptics) instead of per-element listeners or DOM observers.
