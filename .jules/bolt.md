## 2025-05-15 - Global Event Delegation vs. MutationObserver
**Learning:** Using a `MutationObserver` to attach listeners to thousands of elements is an $O(N)$ operation that blocks the main thread during initialization. Global event delegation on the `document` using `event.target.closest()` provides $O(1)$ setup and automatically handles dynamic content.
**Action:** Always prefer delegation for repeated elements or systems requiring visual feedback across many UI components.

## 2025-05-15 - Squared Distance in Hot Paths
**Learning:** In $O(N^2)$ particle animation loops, `Math.sqrt` is a significant bottleneck. Comparing squared distance ($dx*dx + dy*dy < threshold^2$) avoids thousands of square root operations per frame.
**Action:** Use squared distance for proximity checks in all canvas or physics-based rendering loops.
