## 2026-05-04 - [Canvas Animation Optimization]
**Learning:** In vanilla JS canvas animations, the three biggest silent killers of FPS are `shadowBlur`, per-frame `createLinearGradient` calls, and $O(N^2)$ `Math.sqrt` operations.
**Action:** Always use squared distance comparison ($dx*dx + dy*dy < radius*radius$) for proximity checks. Replace `shadowBlur` with secondary transparent shapes and gradients with solid strokes in high-frequency loops.
