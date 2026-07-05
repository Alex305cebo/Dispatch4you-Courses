## 2026-07-02 - [Event Delegation for Interactive Feedback]
**Learning:** Using MutationObserver to scan the entire DOM and attach listeners individually (as seen in the legacy `interactive-feedback.js`) causes O(N) overhead during initialization and subsequent DOM mutations. Replacing this with Global Event Delegation on `document` achieving O(1) initialization and zero mutation overhead.
**Action:** Prefer event delegation for interactive visual states (like `.clicking` classes) across many elements.

## 2026-07-02 - [Safety in Closest Selection]
**Learning:** When using event delegation, `event.target.closest(selector)` should be used with optional chaining `?.` if the target might not have a `closest` method (e.g., text nodes in some environments, though usually not an issue in modern browsers). More importantly, ensure the `activeFeedbackElement` is cleared during mouseout to avoid stuck UI states.
**Action:** Use a robust `mouseout` listener paired with a `relatedTarget` check to ensure the pointer has actually exited the element boundary before clearing active state.
