## 2025-05-15 - [Global Event Delegation for Interactive Feedback]
**Learning:** Using `MutationObserver` to scan the entire DOM and attach listeners individually to interactive elements causes O(N) initialization and significant overhead on dynamic DOM updates. Replacing this with Global Event Delegation on `document` with `event.target.closest()` achieves O(1) initialization and zero overhead for dynamic elements.
**Action:** Always prefer global event delegation for generic UI feedback/behaviors that apply to many elements, especially in apps with dynamic content.
