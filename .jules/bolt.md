## 2025-05-23 - [Optimization: Global Event Delegation vs MutationObserver]
**Learning:** Using a MutationObserver to scan the entire DOM and attach listeners individually (O(N)) causes significant setup overhead and CPU spikes during DOM mutations. Replacing this with Global Event Delegation on the `document` achieves O(1) initialization and near-zero overhead for dynamic elements. In this codebase, setup time for 2000 elements dropped from ~50ms to <1ms.
**Action:** Always prefer global event delegation for generic UI feedback (clicks, hovers, touches) instead of individual listeners or observers.

## 2025-05-22 - [Optimization: Particle System Logic]
**Learning:** Hot paths in canvas rendering loops (like particle systems) benefit significantly from hoisting invariant calculations and using squared distances ($dx*dx + dy*dy$) instead of `Math.sqrt`. Replacing `forEach` with standard `for` loops also reduced overhead.
**Action:** Audit rendering loops for trigonometric functions or square roots that can be replaced with algebraic equivalents.
