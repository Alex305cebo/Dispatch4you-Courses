## 2025-05-15 - Canvas Animation Optimization
**Learning:** Significant performance gains in canvas animations can be achieved by:
- Replacing `Math.sqrt` with squared distance checks for collision and proximity detection.
- Removing `shadowBlur` which requires expensive filtering operations.
- Replacing per-stroke `createLinearGradient` calls with solid color strokes to reduce object creation and draw complexity.
**Action:** Always check hot loops in canvas animations for these patterns. Use a Node.js-based mock benchmark to quantify improvements when browser-based profiling is unavailable.
