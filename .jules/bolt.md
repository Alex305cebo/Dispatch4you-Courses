## 2025-05-15 - [Event Delegation vs MutationObserver]
**Learning:** Using MutationObserver to re-scan the entire DOM and attach listeners individually (O(N) overhead) is a major performance bottleneck in this application. Global Event Delegation on `document` achieves O(1) initialization and handles dynamic elements automatically.
**Action:** Always prefer Global Event Delegation for site-wide interactive effects to avoid O(N) setup costs and memory leaks from redundant listeners.
