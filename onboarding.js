/**
 * onboarding.js v2 — Пошаговый тур для новых пользователей
 * Desktop: открывает dropdown в навбаре и указывает на элементы
 * Mobile: открывает гамбургер-меню и указывает на разделы внутри
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'onboarding_done_v4';
  var isMobile = function () { return window.innerWidth <= 768; };

  // ── Утилиты для desktop dropdown ─────────────────────────────
  function openNavDropdown(index) {
    closeAllDropdowns();
    var items = document.querySelectorAll('.nav-item');
    var item = items[index];
    if (!item) return;
    item.classList.add('open', 'onb-forced-open');
    var btn = item.querySelector('.nav-btn');
    var dd = item.querySelector('.dropdown');
    if (btn && dd) {
      var r = btn.getBoundingClientRect();
      dd.style.position = 'fixed';
      dd.style.top = (r.bottom + 6) + 'px';
      dd.style.left = r.left + 'px';
      dd.style.right = 'auto';
    }
  }
  function closeAllDropdowns() {
    document.querySelectorAll('.nav-item.onb-forced-open').forEach(function (i) {
      i.classList.remove('open', 'onb-forced-open');
    });
  }

  // ── Утилиты для mobile гамбургер-меню ────────────────────────
  function openMobMenu() {
    var menu = document.getElementById('mobMenu');
    var overlay = document.getElementById('mobOverlay');
    if (menu) { menu.classList.add('active'); menu.style.zIndex = '999994'; }
    if (overlay) { overlay.classList.add('active'); overlay.style.zIndex = '999990'; }
    document.body.style.overflow = 'hidden';
  }
  function openMobAccordion(index) {
    var accs = document.querySelectorAll('.mob-acc');
    if (accs[index] && !accs[index].classList.contains('open')) {
      accs[index].classList.add('open');
    }
  }
  function closeMobMenu() {
    var menu = document.getElementById('mobMenu');
    var overlay = document.getElementById('mobOverlay');
    if (menu) { menu.classList.remove('active'); menu.style.zIndex = ''; }
    if (overlay) { overlay.classList.remove('active'); overlay.style.zIndex = ''; }
    document.body.style.overflow = '';
  }
  function closeMobAccordions() {
    document.querySelectorAll('.mob-acc.open').forEach(function (a) { a.classList.remove('open'); });
  }

  // ── Шаги тура ────────────────────────────────────────────────
  var STEPS = [
    // 1. Приветствие — навбар
    {
      desktopTarget: '.navbar',
      mobileTarget: '.navbar',
      title: '👋 Добро пожаловать!',
      text: 'Это главное меню сайта. Здесь ты найдёшь все разделы — курсы, инструменты и информацию.',
      position: 'bottom',
      prepare: null,
      cleanup: null
    },
    // 2. Курс обучения — кнопка в навбаре / раздел в mob-menu
    {
      desktopTarget: '.nav-item .nav-btn',
      mobileTarget: '.mob-acc:nth-child(1) .mob-acc-title',
      title: '📚 Курс обучения',
      text: 'Нажми чтобы открыть базу знаний — 15 страниц курса, глоссарий и материалы диспетчера.',
      position: 'bottom',
      prepare: function () {
        if (isMobile()) { openMobMenu(); openMobAccordion(0); }
        else { openNavDropdown(0); }
      },
      cleanup: null
    },
    // 3. Тесты знаний — 12 Модулей
    {
      desktopTarget: '.nav-item .dropdown [href*="modules-index"]',
      mobileTarget: '.mob-acc:nth-child(1) [href*="modules-index"]',
      title: '✍️ Тесты знаний — 12 Модулей',
      text: 'Проверь себя — 12 модулей с тестами. Каждый тест даёт XP и подтверждает твои знания.',
      position: 'bottom',
      prepare: function () {
        if (isMobile()) { openMobMenu(); openMobAccordion(0); }
        else { openNavDropdown(0); }
      },
      cleanup: null
    },
    // 4. Симулятор
    {
      desktopTarget: '.nav-item:nth-child(2) .dropdown [href*="simulator"]',
      mobileTarget: '.mob-acc:nth-child(2) [href*="simulator"]',
      title: '🤖 Симулятор переговоров',
      text: 'Практикуй реальные звонки с AI-брокером. Самый важный инструмент для отработки навыков.',
      position: 'bottom',
      prepare: function () {
        if (isMobile()) { openMobMenu(); openMobAccordion(1); }
        else { openNavDropdown(1); }
      },
      cleanup: null
    },
    // 5. Тестирование
    {
      desktopTarget: '.nav-item:nth-child(2) .dropdown [href*="testing"]',
      mobileTarget: '.mob-acc:nth-child(2) [href*="testing"]',
      title: '✍️ Тестирование',
      text: 'Пройди тесты по всем темам курса. Проверяй знания и зарабатывай XP.',
      position: 'bottom',
      prepare: function () {
        if (isMobile()) { openMobMenu(); openMobAccordion(1); }
        else { openNavDropdown(1); }
      },
      cleanup: null
    },
    // 6. Тренировка
    {
      desktopTarget: '.nav-item:nth-child(2) .dropdown [href*="Trainer-Quiz"]',
      mobileTarget: '.mob-acc:nth-child(2) [href*="Trainer-Quiz"]',
      title: '⚡ Тренировка',
      text: 'Быстрые блиц-вопросы для закрепления материала. Тренируйся каждый день.',
      position: 'bottom',
      prepare: function () {
        if (isMobile()) { openMobMenu(); openMobAccordion(1); }
        else { openNavDropdown(1); }
      },
      cleanup: null
    },
    // 7. Load Finder
    {
      desktopTarget: '.nav-item:nth-child(2) .dropdown [href*="load-finder"]',
      mobileTarget: '.mob-acc:nth-child(2) [href*="load-finder"]',
      title: '🔍 Load Finder',
      text: 'Ищи грузы как настоящий диспетчер. Практика работы с лоадбордами.',
      position: 'bottom',
      prepare: function () {
        if (isMobile()) { openMobMenu(); openMobAccordion(1); }
        else { openNavDropdown(1); }
      },
      cleanup: null
    },
    // 8. Система XP
    {
      desktopTarget: '#nav-xp-badge, .mob-xp-badge, .nav-actions',
      mobileTarget: '#mob-xp-badge, .mob-xp-badge, .nav-actions',
      title: '⚡ Система XP',
      text: 'За каждый тест и активность ты получаешь XP. Следи за прогрессом в личном кабинете.',
      position: 'bottom',
      prepare: function () {
        if (isMobile()) { closeMobMenu(); }
        else { closeAllDropdowns(); }
      },
      cleanup: null
    },
    // 9. Финал — по центру
    {
      desktopTarget: null,
      mobileTarget: null,
      title: '🚀 Начни прямо сейчас!',
      text: 'Ты готов! Открой первый модуль и начни обучение. Удачи!',
      position: 'center',
      prepare: function () {
        if (isMobile()) { closeMobMenu(); }
        else { closeAllDropdowns(); }
      },
      cleanup: null
    }
  ];

  // ── CSS ───────────────────────────────────────────────────────
  var CSS = '\
    #onb-backdrop{position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:999991;pointer-events:all}\
    #onb-highlight{position:fixed;z-index:999992;border-radius:10px;box-shadow:0 0 0 4px rgba(6,182,212,0.8),0 0 0 9999px rgba(0,0,0,0.6);pointer-events:none;transition:all .35s cubic-bezier(.4,0,.2,1)}\
    #onb-tooltip{position:fixed;z-index:999995;background:rgba(15,23,42,0.97);backdrop-filter:blur(20px);border:1px solid rgba(6,182,212,0.35);border-radius:14px;padding:14px 16px;max-width:280px;min-width:200px;box-shadow:0 8px 40px rgba(0,0,0,0.5);pointer-events:all;transition:all .3s cubic-bezier(.4,0,.2,1)}\
    #onb-tooltip::before{content:"";position:absolute;width:10px;height:10px;background:rgba(15,23,42,0.97);border:1px solid rgba(6,182,212,0.35);transform:rotate(45deg)}\
    #onb-tooltip.pos-bottom::before{top:-6px;left:var(--arrow-left,24px);border-bottom:none;border-right:none}\
    #onb-tooltip.pos-top::before{bottom:-6px;left:var(--arrow-left,24px);border-top:none;border-left:none}\
    #onb-tooltip.pos-center::before{display:none}\
    #onb-step-badge{font-size:10px;font-weight:700;color:#06b6d4;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px}\
    #onb-title{font-size:14px;font-weight:800;color:#f1f5f9;margin-bottom:5px;line-height:1.3}\
    #onb-text{font-size:12px;color:#94a3b8;line-height:1.5;margin-bottom:12px}\
    #onb-footer{display:flex;flex-direction:column;gap:8px}\
    #onb-dots{display:flex;gap:4px;justify-content:center}\
    .onb-dot{width:5px;height:5px;border-radius:50%;background:rgba(255,255,255,0.2);transition:all .2s}\
    .onb-dot.active{background:#06b6d4;width:16px;border-radius:3px}\
    #onb-actions{display:flex;gap:6px;justify-content:flex-end}\
    #onb-back{padding:5px 10px;font-size:11px;font-weight:600;color:#94a3b8;background:transparent;border:1px solid rgba(255,255,255,0.15);border-radius:8px;cursor:pointer;transition:all .2s}\
    #onb-back:hover{color:#e2e8f0;border-color:rgba(255,255,255,0.3)}\
    #onb-back.hidden{display:none}\
    #onb-next{padding:5px 14px;font-size:11px;font-weight:700;color:#fff;background:linear-gradient(135deg,#06b6d4,#0ea5e9);border:none;border-radius:8px;cursor:pointer;transition:all .2s;box-shadow:0 2px 8px rgba(6,182,212,0.35)}\
    #onb-next:hover{transform:translateY(-1px);box-shadow:0 4px 12px rgba(6,182,212,0.5)}\
    .nav-item.onb-forced-open{z-index:999994!important;position:relative}\
    .nav-item.onb-forced-open .dropdown{display:flex!important;flex-direction:column!important;z-index:999994!important}\
    #mobMenu.active{z-index:999994!important}\
    @media(max-width:768px){\
      #onb-tooltip{padding:18px 20px;max-width:88vw;min-width:260px;border-radius:16px}\
      #onb-step-badge{font-size:12px;margin-bottom:8px}\
      #onb-title{font-size:18px;margin-bottom:8px}\
      #onb-text{font-size:14px;line-height:1.6;margin-bottom:16px}\
      .onb-dot{width:7px;height:7px}\
      .onb-dot.active{width:20px;border-radius:4px}\
      #onb-dots{gap:5px;margin-bottom:4px}\
      #onb-back{padding:8px 14px;font-size:13px;border-radius:10px}\
      #onb-next{padding:8px 18px;font-size:13px;border-radius:10px}\
      #onb-actions{gap:8px}\
    }\
  ';

  var currentStep = 0;
  var highlightEl, tooltipEl, backdropEl;

  function shouldRun() {
    if (localStorage.getItem(STORAGE_KEY)) return false;
    try {
      var user = JSON.parse(localStorage.getItem('user') || 'null');
      return !!user;
    } catch (e) { return false; }
  }

  function init() {
    if (!shouldRun()) return;

    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    backdropEl = document.createElement('div');
    backdropEl.id = 'onb-backdrop';
    backdropEl.addEventListener('click', nextStep);

    highlightEl = document.createElement('div');
    highlightEl.id = 'onb-highlight';

    tooltipEl = document.createElement('div');
    tooltipEl.id = 'onb-tooltip';
    tooltipEl.innerHTML = '<div id="onb-step-badge"></div><div id="onb-title"></div><div id="onb-text"></div><div id="onb-footer"><div id="onb-dots"></div><div id="onb-actions"><button id="onb-back">\u2190 Назад</button><button id="onb-next">Далее \u2192</button></div></div>';

    document.body.appendChild(backdropEl);
    document.body.appendChild(highlightEl);
    document.body.appendChild(tooltipEl);

    tooltipEl.querySelector('#onb-back').addEventListener('click', prevStep);
    tooltipEl.querySelector('#onb-next').addEventListener('click', nextStep);

    showStep(0);
  }

  function findTarget(selector) {
    if (!selector) return null;
    var parts = selector.split(', ');
    for (var i = 0; i < parts.length; i++) {
      var el = document.querySelector(parts[i].trim());
      if (el && el.offsetParent !== null) return el;
    }
    // Fallback: return even hidden element
    for (var j = 0; j < parts.length; j++) {
      var el2 = document.querySelector(parts[j].trim());
      if (el2) return el2;
    }
    return null;
  }

  function showStep(index) {
    if (index >= STEPS.length) { finish(); return; }

    // Cleanup предыдущего шага
    if (currentStep !== index && STEPS[currentStep] && typeof STEPS[currentStep].cleanup === 'function') {
      STEPS[currentStep].cleanup();
    }

    currentStep = index;
    var step = STEPS[index];

    // Prepare
    if (typeof step.prepare === 'function') step.prepare();

    // Задержка для DOM
    setTimeout(function () {
      var selector = isMobile() ? step.mobileTarget : step.desktopTarget;
      var target = findTarget(selector);

      // Контент
      tooltipEl.querySelector('#onb-step-badge').textContent = 'Шаг ' + (index + 1) + ' из ' + STEPS.length;
      tooltipEl.querySelector('#onb-title').textContent = step.title;
      tooltipEl.querySelector('#onb-text').textContent = step.text;

      var nextBtn = tooltipEl.querySelector('#onb-next');
      nextBtn.textContent = index === STEPS.length - 1 ? '\uD83D\uDE80 Начать!' : 'Далее \u2192';

      var backBtn = tooltipEl.querySelector('#onb-back');
      backBtn.classList.toggle('hidden', index === 0);

      // Dots
      var dotsHTML = '';
      for (var i = 0; i < STEPS.length; i++) {
        dotsHTML += '<div class="onb-dot' + (i === index ? ' active' : '') + '"></div>';
      }
      tooltipEl.querySelector('#onb-dots').innerHTML = dotsHTML;

      // Позиционирование
      if (step.position === 'center' || !target) {
        highlightEl.style.display = 'none';
        centerTooltip();
      } else if (isMobile() && target) {
        // На мобильном: сначала скроллим к элементу, потом позиционируем
        var mobBody = document.querySelector('.mob-body');
        if (mobBody && mobBody.contains(target)) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        // Ждём завершения скролла, потом позиционируем
        setTimeout(function () {
          var rect = target.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) {
            highlightEl.style.display = 'none';
            centerTooltip();
            return;
          }
          var pad = 6;
          highlightEl.style.cssText = 'position:fixed;top:' + (rect.top - pad) + 'px;left:' + (rect.left - pad) + 'px;width:' + (rect.width + pad * 2) + 'px;height:' + (rect.height + pad * 2) + 'px;border-radius:10px;box-shadow:0 0 0 4px rgba(6,182,212,0.8),0 0 0 9999px rgba(0,0,0,0.6);pointer-events:none;transition:all .35s cubic-bezier(.4,0,.2,1);z-index:999992;display:block';
          positionTooltip(rect, step.position);
        }, 400);
      } else {
        var rect = target.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
          highlightEl.style.display = 'none';
          centerTooltip();
          return;
        }
        var pad = 6;
        highlightEl.style.cssText = 'position:fixed;top:' + (rect.top - pad) + 'px;left:' + (rect.left - pad) + 'px;width:' + (rect.width + pad * 2) + 'px;height:' + (rect.height + pad * 2) + 'px;border-radius:10px;box-shadow:0 0 0 4px rgba(6,182,212,0.8),0 0 0 9999px rgba(0,0,0,0.6);pointer-events:none;transition:all .35s cubic-bezier(.4,0,.2,1);z-index:999992;display:block';
        positionTooltip(rect, step.position);
      }
    }, 100);
  }

  function positionTooltip(targetRect, position) {
    tooltipEl.className = 'pos-' + position;
    tooltipEl.style.top = '0';
    tooltipEl.style.left = '0';
    tooltipEl.style.display = 'block';
    tooltipEl.style.transform = '';

    var tw = tooltipEl.offsetWidth;
    var th = tooltipEl.offsetHeight;
    var margin = 10;
    var gap = 12;

    var targetCenterX = targetRect.left + targetRect.width / 2;
    var left = targetCenterX - tw / 2;
    var top;

    if (position === 'bottom') {
      top = targetRect.bottom + gap;
    } else {
      top = targetRect.top - th - gap;
    }

    left = Math.max(margin, Math.min(left, window.innerWidth - tw - margin));
    top = Math.max(margin, Math.min(top, window.innerHeight - th - margin));

    var arrowLeft = targetCenterX - left;
    arrowLeft = Math.max(16, Math.min(arrowLeft, tw - 16));
    tooltipEl.style.setProperty('--arrow-left', arrowLeft + 'px');

    tooltipEl.style.top = top + 'px';
    tooltipEl.style.left = left + 'px';
  }

  function centerTooltip() {
    tooltipEl.className = 'pos-center';
    tooltipEl.style.display = 'block';
    tooltipEl.style.top = '50%';
    tooltipEl.style.left = '50%';
    tooltipEl.style.transform = 'translate(-50%, -50%)';
  }

  function nextStep() { showStep(currentStep + 1); }
  function prevStep() { if (currentStep > 0) showStep(currentStep - 1); }

  function finish() {
    closeAllDropdowns();
    closeMobMenu();
    localStorage.setItem(STORAGE_KEY, '1');
    if (backdropEl) backdropEl.remove();
    if (highlightEl) highlightEl.remove();
    if (tooltipEl) tooltipEl.remove();
  }

  function tryStart() {
    if (document.querySelector('.navbar')) {
      setTimeout(init, 800);
    } else {
      document.addEventListener('navLoaded', function () {
        setTimeout(init, 800);
      }, { once: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryStart);
  } else {
    tryStart();
  }

})();
