## 2025-05-14 - [Event Delegation for Interactive Feedback]
**Learning:** Using `MutationObserver` to attach event listeners to thousands of DOM elements causes O(N) initialization overhead (~205ms for 10k elements). Global event delegation on `document` reduces this to O(1) (~0ms).
**Action:** Prefer global event delegation for generic UI feedback. When delegating mouse exit events to mimic `mouseleave`, use `mouseout` and verify that `relatedTarget` is not contained within the target element to avoid flickering when moving between child nodes.
