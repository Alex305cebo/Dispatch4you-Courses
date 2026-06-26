## 2026-06-26 - [Global Event Delegation Optimization]
**Learning:** In codebases with dynamic content and many interactive elements (e.g., buttons, cards), using `MutationObserver` to attach individual event listeners creates O(N) initialization and maintenance overhead. Switching to Global Event Delegation on `document` reduces initialization to O(1) and eliminates the need for DOM monitoring.
**Action:** Always prefer Global Event Delegation for interactive feedback systems in large-scale frontend projects. Use `event.target.closest(selectors)` to handle nested children correctly.
