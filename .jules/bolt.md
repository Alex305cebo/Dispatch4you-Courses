# Bolt's Performance Journal ⚡

## 2025-05-14 - Initialization
**Learning:** Performance optimizations should be measured and documented. In vanilla JS environments with canvas animations, minimizing object creation and avoiding expensive math functions in hot paths (like `requestAnimationFrame`) is key.
**Action:** Always prefer squared distance comparisons and simple loops over high-level abstractions in rendering loops.

## 2025-05-14 - Pre-existing Test Failures
**Learning:** The repository contains pre-existing test failures in the `Backup 30.04.26` folder and `adventure/` directory, mostly due to missing modules (`fast-check`) and syntax errors in TypeScript tests. These are unrelated to the performance optimizations in the main vanilla JS application.
**Action:** Focus on manual verification and ensuring no regressions in the targeted files when the test suite is unreliable or unrelated.
