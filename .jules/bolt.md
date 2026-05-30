## 2026-05-30 - Event Delegation for Interactive Feedback
**Learning:** Using `MutationObserver` on `document.body` to attach event listeners to new elements introduces $O(N^2)$ overhead during DOM updates and wastes memory with redundant listeners. Event delegation on `document` is significantly more efficient for global tactile feedback.
**Action:** Use global event delegation for interactive states (clicking, loading, haptic) instead of per-element listeners or observers.

**Learning:** When delegating 'exit' events (like `mouseleave`) to `document`, `mouseleave` (which doesn't bubble) requires the capture phase. A better alternative is using `mouseout` and checking `e.relatedTarget` to ensure the pointer has actually left the target element's boundary.
**Action:** Use `mouseout` with `relatedTarget` check for delegated hover/active state cancellation.
