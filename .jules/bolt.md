## 2026-07-02 - [Event Delegation for Interactive Feedback]
**Learning:** Using `MutationObserver` to re-scan the DOM with `querySelectorAll` and re-attach listeners individually is an O(N) operation that causes significant main-thread jank (blocking for >500ms when adding just 100 elements) as the total number of elements grows.
**Action:** Always prefer global event delegation on `document` or a stable parent container for UI feedback systems that need to handle dynamic content. This achieves O(1) initialization and avoids the need for DOM observation entirely.
