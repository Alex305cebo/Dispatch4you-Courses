## 2025-05-14 - [Canvas Animation Optimization]
**Learning:** In high-frequency canvas animation loops (60fps), `createLinearGradient` and `shadowBlur` are extremely expensive. Creating hundreds of gradient objects per frame triggers frequent garbage collection and slows down the rendering pipeline significantly. Additionally, replacing `Math.atan2`, `Math.cos`, and `Math.sin` with vector normalization reduces computational overhead in interaction logic.
**Action:** Always prefer solid strokes over gradients and avoid shadows in hot paths. Use squared distance checks to skip expensive `Math.sqrt` calls whenever possible.

## 2025-05-14 - [Squared Distance for Hot Paths]
**Learning:** For $O(N^2)$ particle connections, a simple squared distance check (`dx*dx + dy*dy < dist*dist`) is the most effective first-line optimization before reaching for complex spatial partitioning like Quadtrees.
**Action:** Implement squared distance checks in all proximity-based loops.
