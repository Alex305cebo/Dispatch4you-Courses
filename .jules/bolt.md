## 2025-05-14 - [Optimize Particle System in js/main.js]
**Learning:** Significant performance gains in canvas animations can be achieved by:
1. Replacing `Math.sqrt` with squared distance comparisons for threshold checks.
2. Avoiding expensive canvas state changes like `shadowBlur` and complex operations like `createLinearGradient` inside tight loops (especially nested loops).
3. Hoisting invariant calculations (like `radiusSq`) out of the animation frame or loops.
**Action:** Always check for `Math.sqrt`, `shadowBlur`, and `createLinearGradient` in animation loops and replace them with more efficient alternatives when possible. Establish a baseline with a benchmark script before and after.
