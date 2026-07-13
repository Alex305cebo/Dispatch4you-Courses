/**
 * map-trainer-video.js — атмосферное видео рядом с баннером тренажёра карты:
 * играет, когда попадает во вьюпорт при скролле, останавливается, когда уходит.
 * reduced-motion: не трогаем — остаётся статичный poster-кадр.
 */
(function () {
  'use strict';

  var video = document.querySelector('.map-trainer-video');
  if (!video || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) video.play().catch(function () {});
      else video.pause();
    });
  }, { threshold: 0.35 });

  io.observe(video);
})();
