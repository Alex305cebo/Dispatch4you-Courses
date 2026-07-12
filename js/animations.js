// ========================================
// ANIMATIONS & INTERACTIONS
// ========================================

// Scroll restoration
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// Плавный скролл по якорям делает CSS (html { scroll-behavior: smooth } в
// main.css) — прежний JS-перехват дублировал его и ломал обновление #hash.
