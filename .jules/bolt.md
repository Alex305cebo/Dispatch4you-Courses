## 2026-06-24 - [Event Delegation for Interactive Feedback]
**Learning:** Using MutationObserver with querySelectorAll and individual event listeners creates O(N) overhead on every DOM change and risk of duplicate listeners.
**Action:** Use global event delegation on the document for better performance and simpler code.
