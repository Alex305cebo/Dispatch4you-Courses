# Bolt Journal - Critical Performance Learnings

This journal records critical performance bottlenecks, surprising optimization results, and codebase-specific patterns discovered by Bolt.

## 2025-05-14 - Optimization of Interactive Feedback
**Learning:** Using `MutationObserver` to attach individual event listeners to O(N) elements causes linear initialization overhead and memory pressure.
**Action:** Prefer global event delegation on `document` for O(1) initialization and automatic handling of dynamic elements.
