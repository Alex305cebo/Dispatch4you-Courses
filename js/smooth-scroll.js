/**
 * smooth-scroll.js — плавный (инерционный) скролл колесом мыши. ТОЛЬКО десктоп.
 *
 * Нативное колесо двигает страницу рывками по N пикселей за щелчок. Здесь мы
 * перехватываем событие wheel, копим цель и ведём страницу к ней с easing на
 * requestAnimationFrame — получается плавное «доезжание».
 *
 * НЕ трогаем: трекпад и тач (там прокрутка уже плавная/инерционная), zoom
 * (ctrl+wheel), reduced-motion и узкие экраны. Если страницу проскроллили иначе
 * (скроллбар, клавиши) — синхронизируем цель, чтобы не было отката.
 *
 * ponytail: свой мини-smooth-scroll вместо библиотеки (Lenis и т.п.) — нужд тут
 * на 40 строк. Потолок: эвристика трекпада по deltaMode/величине; если понадобится
 * ловить экзотические устройства точнее — тогда уже Lenis.
 */
(function () {
  'use strict';

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (matchMedia('(pointer: coarse)').matches) return;   // тач/трекпад-планшеты
  if (window.innerWidth <= 768) return;                   // мобилка — нативный скролл

  var EASE = 0.14;     // плавность: меньше = мягче и дольше доезжает
  var SPEED = 1.0;     // множитель шага колеса

  var target = window.scrollY || window.pageYOffset || 0;
  var running = false;

  function maxScroll() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  function tick() {
    var diff = target - window.scrollY;
    if (Math.abs(diff) < 0.5) { window.scrollTo(0, target); running = false; return; }
    window.scrollTo(0, window.scrollY + diff * EASE);
    requestAnimationFrame(tick);
  }

  function onWheel(e) {
    if (e.ctrlKey) return;                                 // ctrl+wheel = зум
    // Трекпады шлют мелкие пиксельные дельты и уже плавны — им не мешаем.
    if (e.deltaMode === 0 && Math.abs(e.deltaY) < 15) return;

    var dy = e.deltaY;
    if (e.deltaMode === 1) dy *= 16;                       // строки → ~px
    else if (e.deltaMode === 2) dy *= window.innerHeight;  // страницы → px

    e.preventDefault();
    target = Math.max(0, Math.min(maxScroll(), target + dy * SPEED));
    if (!running) { running = true; requestAnimationFrame(tick); }
  }

  // Скроллбар/клавиши двигают страницу сами — держим цель в синхроне (когда не анимируем).
  function resync() { if (!running) target = window.scrollY || window.pageYOffset || 0; }

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('scroll', resync, { passive: true });
  window.addEventListener('resize', resync);
})();
