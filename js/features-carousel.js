// ========================================
// FEATURES CAROUSEL — прокрутка + точки-пагинация
// Кроссфейд idle→hover у карточек — чистый CSS (:hover на десктопе,
// .is-active на активной карточке при тач-скролле). JS ведёт только навигацию.
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

  // Прокрутка так, чтобы карточка i встала ведущей (к левому краю; snap докрутит)
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

  // ---- Точки-пагинация: по одной на карточку ----
  const dots = [];
  if (dotsWrap) {
    cards.forEach((_, i) => {
      const b = document.createElement('button');
      b.className = 'dot';
      b.type = 'button';
      b.setAttribute('aria-label', 'Карточка ' + (i + 1));
      b.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(b);
      dots.push(b);
    });
  }

  // Индекс ведущей карточки: первая, что видна слева хотя бы наполовину
  function leadingIndex() {
    const sLeft = slider.getBoundingClientRect().left;
    for (let i = 0; i < total; i++) {
      const r = cards[i].getBoundingClientRect();
      if (r.left - sLeft >= -r.width * 0.5) return i;
    }
    return total - 1;
  }

  // Активная точка + (на тач) класс .is-active на центральной карточке → CSS-кроссфейд
  function syncUI(idx) {
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    if (!canHover) {
      cards.forEach((c, i) => c.classList.toggle('is-active', i === idx));
    }
  }

  // Пересчёт при ручном скролле/свайпе (последняя точка — на самом правом крае)
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

  // Клик по карточке → переход на страницу
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const link = card.getAttribute('data-link');
      if (link) window.location.href = link;
    });
  });

  // Клавиатурная навигация
  document.addEventListener('keydown', (e) => {
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
  });

  // Ресайз — пересчитать активную
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(onScroll, 250);
  });

  // Свайп на тач-устройствах (в дополнение к нативному скроллу)
  let touchStartX = 0;
  slider.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  slider.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); }
  }, { passive: true });

  // Стартовое состояние (после того как snap выставит первую карточку)
  requestAnimationFrame(onScroll);
});
