// ========================================
// FEATURES CAROUSEL — бесконечная (закольцованная) прокрутка + точки-пагинация
// Кроссфейд idle→hover у карточек — чистый CSS (:hover на десктопе,
// .is-active на активной карточке при тач-скролле). JS ведёт навигацию и
// бесшовный loop через клоны-буферы по краям ленты.
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

  // ---- Клоны-буферы для бесшовного кольца: [набор][реальные][набор] ----
  // Прокрутка за край показывает клон соседней карточки; после остановки
  // scrollLeft мгновенно сдвигается на целый набор обратно в реальную зону —
  // содержимое клонов идентично, поэтому сдвиг незаметен.
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
  // allCards: [клоны 0..total-1][реальные 0..total-1][клоны 0..total-1]
  // индекс i → реальная карточка i % total; реальный набор начинается с total

  // ---- Геометрия ----
  let step = 0; // ширина карточки + gap
  let pad = 0;  // левый внутренний отступ ленты (край снапа)
  function measure() {
    pad = parseFloat(getComputedStyle(slider).paddingLeft) || 0;
    step = allCards[1].getBoundingClientRect().left - allCards[0].getBoundingClientRect().left;
  }
  function leadEdge() {
    return slider.getBoundingClientRect().left + pad;
  }
  // Мгновенный сдвиг scrollLeft в обход CSS scroll-behavior: smooth
  function jumpTo(left) {
    const prev = slider.style.scrollBehavior;
    slider.style.scrollBehavior = 'auto';
    slider.scrollLeft = left;
    slider.style.scrollBehavior = prev;
  }
  // Индекс карточки (среди всех, включая клоны), стоящей у левого края
  function leadingAll() {
    const lead = leadEdge();
    let best = 0, bestDist = Infinity;
    for (let i = 0; i < allCards.length; i++) {
      const d = Math.abs(allCards[i].getBoundingClientRect().left - lead);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    return best;
  }

  // Поставить первую реальную карточку к левому краю (мгновенно, без прокрутки страницы)
  function centerReal() {
    const real0 = allCards[total];
    jumpTo(slider.scrollLeft + real0.getBoundingClientRect().left - leadEdge());
  }

  // После остановки прокрутки вернуть ведущую карточку в реальную зону —
  // если сейчас у края стоит клон, сдвинуть на целый набор к его реальной копии
  function normalize() {
    const li = leadingAll();
    if (li < total || li >= total * 2) {
      const shift = (total + (li % total)) - li; // в карточках
      jumpTo(slider.scrollLeft + shift * step);
    }
  }

  // ---- Точки-пагинация: по одной на реальную карточку ----
  const dots = [];
  if (dotsWrap) {
    for (let i = 0; i < total; i++) {
      const b = document.createElement('button');
      b.className = 'dot';
      b.type = 'button';
      b.setAttribute('aria-label', 'Карточка ' + (i + 1));
      b.addEventListener('click', () => goToReal(i));
      dotsWrap.appendChild(b);
      dots.push(b);
    }
  }

  // Активная точка (по модулю) + (на тач) класс .is-active на центральной карточке → CSS-кроссфейд
  function syncUI(li) {
    const r = li % total;
    dots.forEach((d, i) => d.classList.toggle('active', i === r));
    if (!canHover) {
      allCards.forEach((c, i) => c.classList.toggle('is-active', i === li));
    }
  }

  // ---- Навигация ---- (measure() перед каждым шагом: CSS грузится лениво,
  // и на DOMContentLoaded геометрия карточек ещё может быть нулевой)
  function next() { measure(); slider.scrollBy({ left: step, behavior: 'smooth' }); }
  function prev() { measure(); slider.scrollBy({ left: -step, behavior: 'smooth' }); }
  // К реальной карточке i по кратчайшему пути (через клоны, без упора)
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

  // Живое обновление точек/крессфейда при прокрутке + отложенный бесшовный сдвиг
  let rafId = 0;
  function onScroll() { rafId = 0; syncUI(leadingAll()); }
  let settleTimer = 0;
  function scheduleSettle() {
    clearTimeout(settleTimer);
    // 140мс после последнего события скролла = прокрутка и снап устоялись
    // (во время smooth-анимации стрелок события идут подряд и таймер ждёт её конца)
    settleTimer = setTimeout(() => { normalize(); onScroll(); }, 140);
  }
  slider.addEventListener('scroll', () => {
    if (!rafId) rafId = requestAnimationFrame(onScroll);
    scheduleSettle();
  }, { passive: true });

  // Клавиатурная навигация — только когда карусель на экране.
  // Раньше слушатель был глобальным и безусловным: стрелки в ЛЮБОМ месте
  // страницы крутили карусель и глушились preventDefault — страницу нельзя
  // было прокрутить с клавиатуры, а <select> и contenteditable перехватывались.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;

    const el = document.activeElement;
    const t = el ? el.tagName : '';
    if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || (el && el.isContentEditable)) return;

    const r = slider.getBoundingClientRect();
    if (r.bottom <= 0 || r.top >= window.innerHeight) return;  // карусель не видна

    e.preventDefault();
    if (e.key === 'ArrowLeft') prev(); else next();
  });

  // Ресайз — пересчитать геометрию и вернуть в реальную зону
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { measure(); normalize(); onScroll(); }, 200);
  });

  // ---- Старт ----
  measure();
  centerReal();
  onScroll();
  // CSS грузится лениво (media=print→all) — на DOMContentLoaded геометрия
  // может быть нулевой; перецентрируем после полной загрузки стилей
  window.addEventListener('load', () => { measure(); centerReal(); onScroll(); });
});
