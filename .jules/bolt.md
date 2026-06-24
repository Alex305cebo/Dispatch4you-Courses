## 2026-05-28 - Initializing Bolt Journal
**Learning:** Performance optimizations should be measurable and documented.
**Action:** Always measure impact before and after.

## 2026-05-28 - Event Delegation vs MutationObserver
**Learning:** Using `MutationObserver` to attach listeners to dynamic elements is an anti-pattern that leads to O(N*M) performance degradation and listener bloat. Event delegation on the `document` level provides O(1) listener management and is significantly more efficient for both static and dynamic content.
**Action:** Prefer global event delegation for generic UI feedback systems instead of monitoring the DOM for changes.
