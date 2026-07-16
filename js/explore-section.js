/**
 * explore-section.js — секция «Что внутри курса»: 5 всегда-открытых
 * карточек-кнопок, у каждой своё фоновое видео (лениво грузится, играет в
 * цикле, пауза вне экрана). Клик по карточке открывает pop-up по центру с
 * заголовком и описанием раздела (описание берётся из скрытого .explore-item-desc).
 */
(function () {
  'use strict';

  var section = document.querySelector('.explore-section');
  if (!section) return;
  var items = [].slice.call(section.querySelectorAll('.explore-item'));
  if (!items.length) return;

  var narrow = window.matchMedia('(max-width: 768px)');

  function play(video) {
    if (video.ended) { try { video.currentTime = 0; } catch (e) {} }
    var p = video.play(); if (p && p.catch) p.catch(function () {});
  }

  // ── Модалка ──
  var modal = section.querySelector('.explore-modal');
  var modalTitle = section.querySelector('.explore-modal-title');
  var modalText = section.querySelector('.explore-modal-text');
  var lastFocus = null;

  function openModal(title, text) {
    if (!modal) return;
    if (modalTitle) modalTitle.textContent = title;
    if (modalText) modalText.innerHTML = text;   // описание — своя статичная разметка (лид + список)
    modal.hidden = false;
    document.body.style.overflow = 'hidden';           // блок прокрутки фона
    var closeBtn = modal.querySelector('.explore-modal-close');
    if (closeBtn) closeBtn.focus();
  }
  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) { try { lastFocus.focus(); } catch (e) {} }
  }
  if (modal) {
    var closeBtn = modal.querySelector('.explore-modal-close');
    var overlay = modal.querySelector('.explore-modal-overlay');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });
  }

  // ── Карточки ──
  items.forEach(function (el) {
    var video = el.querySelector('.explore-item-video');
    var nameEl = el.querySelector('.explore-item-name');
    var descEl = el.querySelector('.explore-item-desc');
    var title = nameEl ? nameEl.textContent.trim() : '';
    var desc = descEl ? descEl.innerHTML.trim() : '';

    // Ленивая загрузка + пауза вне экрана
    if (video) {
      var loaded = false;
      var ensureLoaded = function () {
        if (loaded) return;
        loaded = true;
        var src = el.getAttribute(narrow.matches ? 'data-mobile' : 'data-desktop') || el.getAttribute('data-desktop');
        var poster = el.getAttribute('data-poster');
        if (poster) video.setAttribute('poster', poster);
        if (src) video.src = src;
      };
      if (window.IntersectionObserver) {
        new IntersectionObserver(function (entries) {
          if (entries[0].isIntersecting) { ensureLoaded(); play(video); }
          else video.pause();
        }, { threshold: 0, rootMargin: '200px 0px' }).observe(el);
      } else {
        ensureLoaded();
      }

      // Видео играет ОДИН раз и застывает на последнем кадре (без loop). Доиграв,
      // при наведении курсора или нажатии — проигрывается заново с начала.
      var replay = function () {
        ensureLoaded();
        try { if (video.ended) video.currentTime = 0; } catch (e) {}
        var p = video.play(); if (p && p.catch) p.catch(function () {});
      };
      el.addEventListener('mouseenter', replay);
      el.addEventListener('pointerdown', replay);
    }

    // Клик по карточке → pop-up
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    var open = function () { lastFocus = el; openModal(title, desc); };
    el.addEventListener('click', open);
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });
})();
