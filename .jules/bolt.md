# Bolt Journal - Critical Learnings Only

## 2025-05-20 - Global Event Delegation Optimization
**Learning:** Using `MutationObserver` to attach event listeners to every individual interactive element creates O(N) overhead during initialization and every time the DOM changes.
**Action:** Replace individual listeners with global event delegation on `document` to achieve O(1) initialization and eliminate `MutationObserver` overhead.
