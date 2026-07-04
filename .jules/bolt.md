## 2026-07-02 - [O(N) vs O(1) Interactive Feedback]
**Learning:** Using MutationObserver to scan the entire DOM and attach listeners individually (as seen in the legacy interactive-feedback.js) causes O(N) overhead on every DOM mutation. Replacing this pattern with Global Event Delegation on the document achieves O(1) initialization and automatic handling of dynamic elements.
**Action:** Always prefer global event delegation for generic UI feedback systems that target many elements or dynamic content.
