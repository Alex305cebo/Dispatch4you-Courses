// ========================================
// FEATURES CAROUSEL — infinite (looped) scroll + pagination dots
// The idle→hover crossfade is pure CSS (:hover on desktop, .is-active on the
// centered card during touch scroll). JS drives navigation and a seamless
// loop via clone buffers on both ends of the track.
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('.features-grid');
  const prevBtn = document.querySelector('.carousel-btn-prev');
  const nextBtn = document.querySelector('.carousel-btn-next');
  const dotsWrap = document.querySelector('.carousel-dots');
  const realCards = Array.from(document.querySelectorAll('.feature-card'));

  if (!slider || !prevBtn || !nextBtn || !realCards.length) {
    console.error('Carousel elements not found');
    return;
  }

  const total = realCards.length;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ---- Clone buffers for a seamless ring: [set][real][set] ----
  // Scrolling past an edge reveals a clone of the neighbouring card; once
  // scrolling settles, scrollLeft jumps by one whole set back into the real
  // zone — clones are identical, so the jump is invisible.
  function makeClone(card) {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.setAttribute('tabindex', '-1');
    clone.classList.add('feature-card--clone');
    return clone;
  }
  realCards.forEach((card) => slider.insertBefore(makeClone(card), realCards[0]));
  realCards.forEach((card) => slider.appendChild(makeClone(card)));
  const allCards = Array.from(slider.querySelectorAll('.feature-card'));
  // allCards: [clones 0..total-1][real 0..total-1][clones 0..total-1]
  // index i → real card i % total; the real set starts at index total

  // ---- Geometry ----
  let step = 0; // card width + gap
  let pad = 0;  // left inner padding of the track (snap edge)
  function measure() {
    pad = parseFloat(getComputedStyle(slider).paddingLeft) || 0;
    step = allCards[1].getBoundingClientRect().left - allCards[0].getBoundingClientRect().left;
  }
  function leadEdge() {
    return slider.getBoundingClientRect().left + pad;
  }
  // Instant scrollLeft shift, bypassing CSS scroll-behavior: smooth
  function jumpTo(left) {
    const prev = slider.style.scrollBehavior;
    slider.style.scrollBehavior = 'auto';
    slider.scrollLeft = left;
    slider.style.scrollBehavior = prev;
  }
  // Index of the card (among all, incl. clones) sitting at the left edge
  function leadingAll() {
    const lead = leadEdge();
    let best = 0, bestDist = Infinity;
    for (let i = 0; i < allCards.length; i++) {
      const d = Math.abs(allCards[i].getBoundingClientRect().left - lead);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    return best;
  }

  // Put the first real card at the left edge (instant, no page scroll)
  function centerReal() {
    const real0 = allCards[total];
    jumpTo(slider.scrollLeft + real0.getBoundingClientRect().left - leadEdge());
  }

  // After scrolling settles, bring the leading card back into the real zone —
  // if a clone is currently leading, shift by one whole set to its real copy
  function normalize() {
    const li = leadingAll();
    if (li < total || li >= total * 2) {
      const shift = (total + (li % total)) - li; // in cards
      jumpTo(slider.scrollLeft + shift * step);
    }
  }

  // ---- Pagination dots: one per real card ----
  const dots = [];
  if (dotsWrap) {
    for (let i = 0; i < total; i++) {
      const b = document.createElement('button');
      b.className = 'dot';
      b.type = 'button';
      b.setAttribute('aria-label', 'Card ' + (i + 1));
      b.addEventListener('click', () => goToReal(i));
      dotsWrap.appendChild(b);
      dots.push(b);
    }
  }

  // Active dot (by modulo) + (on touch) .is-active on the centered card → CSS crossfade
  function syncUI(li) {
    const r = li % total;
    dots.forEach((d, i) => d.classList.toggle('active', i === r));
    if (!canHover) {
      allCards.forEach((c, i) => c.classList.toggle('is-active', i === li));
    }
  }

  // ---- Navigation ---- (measure() before each step: the CSS loads lazily,
  // so on DOMContentLoaded the card geometry may still be zero)
  function next() { measure(); slider.scrollBy({ left: step, behavior: 'smooth' }); }
  function prev() { measure(); slider.scrollBy({ left: -step, behavior: 'smooth' }); }
  // To real card i by the shortest path (through clones, no dead-end)
  function goToReal(i) {
    measure();
    const cur = leadingAll() % total;
    let d = (i - cur) % total;
    if (d > total / 2) d -= total;
    if (d < -total / 2) d += total;
    slider.scrollBy({ left: d * step, behavior: 'smooth' });
  }

  prevBtn.addEventListener('click', (e) => { e.preventDefault(); prev(); });
  nextBtn.addEventListener('click', (e) => { e.preventDefault(); next(); });

  // Live dot/crossfade update while scrolling + deferred seamless shift
  let rafId = 0;
  function onScroll() { rafId = 0; syncUI(leadingAll()); }
  let settleTimer = 0;
  function scheduleSettle() {
    clearTimeout(settleTimer);
    // 140ms after the last scroll event = scroll and snap have settled
    // (during a smooth arrow animation events keep firing and the timer waits)
    settleTimer = setTimeout(() => { normalize(); onScroll(); }, 140);
  }
  slider.addEventListener('scroll', () => {
    if (!rafId) rafId = requestAnimationFrame(onScroll);
    scheduleSettle();
  }, { passive: true });

  // Keyboard navigation
  // Only while the carousel is on screen. This listener used to be global and
  // unconditional: arrow keys anywhere on the page drove the carousel and were
  // swallowed by preventDefault — the page could not be scrolled from the
  // keyboard, and <select>/contenteditable were hijacked too.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

    const el = document.activeElement;
    const t = el ? el.tagName : '';
    if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || (el && el.isContentEditable)) return;

    const r = slider.getBoundingClientRect();
    if (r.bottom <= 0 || r.top >= window.innerHeight) return;  // out of view

    e.preventDefault();
    if (e.key === 'ArrowLeft') prev(); else next();
  });

  // Resize — recompute geometry and return to the real zone
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { measure(); normalize(); onScroll(); }, 200);
  });

  // ---- Start ----
  measure();
  centerReal();
  onScroll();
  // The CSS loads lazily (media=print→all) — on DOMContentLoaded geometry
  // may be zero; re-center once all stylesheets have loaded
  window.addEventListener('load', () => { measure(); centerReal(); onScroll(); });
});
