## 2026-07-06 - [O(N) MutationObserver Bottleneck]
**Learning:** Using MutationObserver to scan the entire DOM and attach listeners individually (as seen in the legacy `interactive-feedback.js`) causes O(N) overhead during initialization and every subsequent DOM change. Replacing it with Global Event Delegation on the `document` achieves O(1) initialization and zero overhead on DOM mutations.
**Action:** Always prefer global event delegation for interactive visual states (hover, click, touch) especially when the page contains a large number of elements or dynamic content.
