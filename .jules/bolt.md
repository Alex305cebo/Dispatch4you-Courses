## 2025-05-15 - Global Event Delegation Optimization
**Learning:** Using `MutationObserver` to attach event listeners individually to every interactive element creates O(N) initialization overhead. This is particularly slow on pages with many elements (e.g., dashboard, card grids). Replacing this with Global Event Delegation on `document` reduces initialization to O(1).
**Action:** Always prefer Event Delegation for interactive feedback systems that apply to many elements or dynamic content.

## 2025-05-15 - Simulating mouseleave with Delegation
**Learning:** `mouseleave` and `mouseenter` events do not bubble, making them unsuitable for standard event delegation.
**Action:** Use `mouseout` and `mouseover` with `event.target.closest()` and a `relatedTarget` check to correctly identify when the pointer has truly exited the boundaries of the target element.
