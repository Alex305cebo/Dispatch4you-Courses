## 2025-05-14 - [Event Delegation vs MutationObserver]
**Learning:** Using `MutationObserver` to re-scan the DOM with `querySelectorAll` and attach individual listeners is an anti-pattern for global UI feedback. It causes O(N) initialization overhead and risks memory leaks if listeners are not carefully managed.
**Action:** Always prefer Global Event Delegation on the `document` or a high-level container for generic UI interactions (clicks, touches, hovers). It provides O(1) initialization and automatically handles dynamic elements without additional overhead.
