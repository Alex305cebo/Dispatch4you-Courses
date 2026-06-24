## 2025-05-15 - [Canvas Optimization in Neural Background]
**Learning:** In vanilla Canvas animations, using `ctx.shadowBlur` and `ctx.createLinearGradient` inside an $O(N^2)$ particle connection loop is a massive performance bottleneck. These operations trigger expensive drawing passes and object creation on every frame.
**Action:** Always prefer solid `rgba` strokes with dynamic opacity for connections. Use squared distance comparisons (`distSq < maxDistSq`) to avoid `Math.sqrt` in hot paths until the condition is met. Hoist invariant calculations (like `mouseRadiusSq`) outside the loop.

## 2025-05-15 - [Isolated Logic Benchmarking]
**Learning:** While rendering is the primary bottleneck in Canvas, logic optimization (like removing `Math.sqrt`) still provides measurable gains (~3-5%) in high-frequency loops (200+ particles).
**Action:** Use micro-benchmarks like `benchmark_particles.js` to quantify pure JS logic improvements separately from browser-dependent rendering performance.
