## 2025-05-15 - Global Event Delegation for Interactive Feedback
**Learning:** Using MutationObserver to scan the entire DOM and attach listeners individually (as seen in the legacy `interactive-feedback.js`) causes O(N) overhead during initialization and dynamic updates, taking ~22-30ms for 2,000 elements. Replacing it with Global Event Delegation on the `document` object achieves O(1) initialization (~0ms) and eliminates mutation overhead.
**Action:** Prioritize event delegation over individual listener attachment for systems that target many similar elements or elements added dynamically.
