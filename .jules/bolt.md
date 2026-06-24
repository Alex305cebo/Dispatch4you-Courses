## 2025-05-15 - Particle System Optimization
**Learning:** Found significant bottlenecks in the 2D canvas animation loop due to O(N^2) distance calculations using `Math.sqrt` and expensive rendering state changes (`shadowBlur`, `createLinearGradient`).
**Action:** Use squared distance comparisons (`distSq < thresholdSq`) to avoid `sqrt`. Replace trigonometric functions with vector normalization (`1 / distance`). Avoid shadows and complex gradients in high-frequency animation loops for measurable performance gains. Hoist constant drawing states like `lineWidth` outside of loops.
