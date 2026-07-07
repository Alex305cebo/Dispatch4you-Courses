## 2026-07-06 - [Event Delegation for Interactive Feedback]
**Learning:** Using MutationObserver to scan the entire DOM and attach individual listeners to many elements (O(N)) causes significant scripting overhead during DOM updates and initialization. Event Delegation on the `document` level provides O(1) performance and handles dynamic elements automatically without the need for manual re-initialization or observers.
**Action:** Always prefer Event Delegation for UI-wide interactive effects (like click feedback, haptics, or custom tooltips) especially in applications with dynamic content.
