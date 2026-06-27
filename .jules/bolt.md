## 2026-06-27 - [Event Delegation for Interactive Feedback]
**Learning:** Using `MutationObserver` to re-scan the DOM and attach individual event listeners to thousands of elements results in O(N) initialization overhead. Global event delegation on the `document` achieves O(1) initialization and automatically handles dynamically added elements without any observers or re-initialization logic.
**Action:** Always prefer global event delegation for generic UI feedback systems (like click ripples or haptic responses) that target many elements across the application.
