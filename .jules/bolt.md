## 2025-05-15 - Canvas Animation Optimization
**Learning:** High-frequency canvas animations can be major performance bottlenecks, especially when using expensive operations like `Math.sqrt`, `createLinearGradient`, and `shadowBlur` inside the render loop.
**Action:** Always prioritize squared distance checks ($dx*dx + dy*dy$) to avoid `Math.sqrt`. Avoid creating objects like gradients or setting expensive properties like `shadowBlur` in the per-frame loop. Use standard `for` loops for large arrays instead of `forEach` for better performance on hot paths.
