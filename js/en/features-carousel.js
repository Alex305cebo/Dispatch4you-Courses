// ========================================
// FEATURES CAROUSEL — scroll + pagination dots
// The idle→hover crossfade is pure CSS (:hover on desktop, .is-active on the
// centered card during touch scroll). JS only drives navigation.
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('.features-grid');
  const prevBtn = document.querySelector('.carousel-btn-prev');
  const nextBtn = document.querySelector('.carousel-btn-next');
  const dotsWrap = document.querySelector('.carousel-dots');
  const cards = Array.from(document.querySelectorAll('.feature-card'));

  if (!slider || !prevBtn || !nextBtn || !cards.length) {
    console.error('Carousel elements not found');
    return;
  }

  const total = cards.length;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function goTo(i) {
    i = Math.max(0, Math.min(total - 1, i));
    const card = cards[i];
    if (!card) return;
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    activeIndex = i;
    syncUI(i);
  }
  let activeIndex = 0;
  function next() { goTo(activeIndex >= total - 1 ? 0 : activeIndex + 1); }
  function prev() { goTo(activeIndex <= 0 ? total - 1 : activeIndex - 1); }

  prevBtn.addEventListener('click', (e) => { e.preventDefault(); prev(); });
  nextBtn.addEventListener('click', (e) => { e.preventDefault(); next(); });

  // ---- Pagination dots: one per card ----
  const dots = [];
  if (dotsWrap) {
    cards.forEach((_, i) => {
      const b = document.createElement('button');
      b.className = 'dot';
      b.type = 'button';
      b.setAttribute('aria-label', 'Card ' + (i + 1));
      b.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(b);
      dots.push(b);
    });
  }

  // Leading card index: first card at least half-visible from the left
  function leadingIndex() {
    const sLeft = slider.getBoundingClientRect().left;
    for (let i = 0; i < total; i++) {
      const r = cards[i].getBoundingClientRect();
      if (r.left - sLeft >= -r.width * 0.5) return i;
    }
    return total - 1;
  }

  // Active dot + (on touch) .is-active on the centered card → CSS crossfade
  function syncUI(idx) {
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    if (!canHover) {
      cards.forEach((c, i) => c.classList.toggle('is-active', i === idx));
    }
  }

  let rafId = 0;
  function onScroll() {
    rafId = 0;
    const maxLeft = slider.scrollWidth - slider.clientWidth;
    const idx = slider.scrollLeft >= maxLeft - 4 ? total - 1 : leadingIndex();
    activeIndex = idx;
    syncUI(idx);
  }
  slider.addEventListener('scroll', () => {
    if (!rafId) rafId = requestAnimationFrame(onScroll);
  }, { passive: true });

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const link = card.getAttribute('data-link');
      if (link) window.location.href = link;
    });
  });

  document.addEventListener('keydown', (e) => {
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
  });

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(onScroll, 250);
  });

  let touchStartX = 0;
  slider.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  slider.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); }
  }, { passive: true });

  requestAnimationFrame(onScroll);
});
