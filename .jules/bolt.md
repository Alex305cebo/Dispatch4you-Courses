# Bolt's Journal - Critical Performance Learnings

## 2025-05-15 - Global Event Delegation vs MutationObserver
**Learning:** Using `MutationObserver` to watch for DOM changes and re-bind event listeners to thousands of elements is highly inefficient ($O(N)$ setup + observer overhead). Global event delegation on `document` using `e.target.closest()` provides $O(1)$ setup and handles dynamic elements natively.
**Action:** Prefer global event delegation for UI feedback patterns (clicking, loading states, hovers) to eliminate script execution time during page load and dynamic content updates.
