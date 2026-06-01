## 2025-05-15 - Event Delegation for Tactile Feedback
**Learning:** Implementing global event delegation for interactive states (hover/active) significantly reduces setup overhead (from O(N) to O(1)) and memory consumption. However, delegating `mouseleave` behavior requires using `mouseout` with a `relatedTarget` check, as `mouseleave` does not bubble.
**Action:** Use `document.addEventListener('mouseout', ...)` and verify `!target.contains(e.relatedTarget)` to correctly detect when the pointer has left the delegated interactive element.
