## 2025-05-22 - Global Event Delegation Optimization
**Learning:** Using MutationObserver to scan the DOM and attach individual listeners is an O(N) operation that scales poorly with page size. Global Event Delegation on `document` provides O(1) initialization and automatically handles dynamic elements without additional overhead.
**Action:** Use Event Delegation for broad UI feedback systems. Implement robust state management (e.g., `activeFeedbackElement`) and `mouseout` with `relatedTarget` checks to replicate exact `mouseleave` behavior in a delegated context.
