## 2026-05-09 - [Particle System Optimization]
**Learning:** Standard performance patterns in canvas animations for this codebase include replacing squared distance checks to avoid `Math.sqrt` in hot paths, using standard `for` loops instead of `forEach`, and minimizing per-frame rendering overhead by removing `shadowBlur` and `createLinearGradient`.
**Action:** Apply these patterns consistently to all canvas-based animations.
