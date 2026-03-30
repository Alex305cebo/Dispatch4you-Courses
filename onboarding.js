/**
 * onboarding.js — Пошаговый тур для новых пользователей
 * Запускается один раз после первого входа (флаг в localStorage)
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'onboarding_done_v1';

  const STEPS = [
    {
      target: '.navbar',
      title: '👋 Добро пожаловать!',
      text: 'Это главное меню сайта. Здесь ты найдёшь все разделы — курсы, инструменты и информацию.',
      position: 'bottom'
    },
    {
      target: '.nav-btn',
      title: '📚 Курс обучения',
      text: 'Нажми "Курс обучения" чтобы открыть базу знаний — 15 страниц курса, глоссарий и материалы диспетчера.',
      position: 'bottom'
    },
    {
      target: '[href*="modules-index"], [href*="modules"]',
      title: '✍️ Тесты знаний — 12 Модулей',
      text: 'После изучения материала проверь себя — 12 модулей с тестами. Каждый тест даёт XP и подтверждает твои знания.',
      position: 'bottom'
    },
    {
      target: '[href*="simulator"], .candy-btn',
      title: '🤖 Симулятор переговоров',
      text: 'Практикуй реальные звонки с AI-брокером. Это самый важный инструмент для отработки навыков.',
      position: 'bottom'
    },
    {
      target: '#nav-xp-badge, .mob-xp-badge, .nav-actions',
      title: '⚡ Система XP',
      text: 'За каждый пройденный тест и активность ты получаешь XP. Следи за своим прогрессом в личном кабинете.',
      position: 'bottom'
    },
    {
      target: '.btn-primary, [href*="modules-index"]',
      title: '🚀 Начни прямо сейчас!',
      text: 'Нажми "Начать обучение" и открой первый модуль. Удачи в обучении!',
      position: 'top'
    }
  ];

  // CSS стили тура
  const CSS = `
    #onb-overlay {
      position: fixed;
      inset: 0;
      z-index: 999990;
      pointer-events: none;
    }
    #onb-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.65);
      z-index: 999991;
      pointer-events: all;
    }
    #onb-highlight {
      position: fixed;
      z-index: 999992;
      border-radius: 12px;
      box-shadow: 0 0 0 4px rgba(6,182,212,0.8), 0 0 0 9999px rgba(0,0,0,0.65);
      pointer-events: none;
      transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
    }
    #onb-tooltip {
      position: fixed;
      z-index: 999993;
      background: rgba(15,23,42,0.97);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(6,182,212,0.35);
      border-radius: 16px;
      padding: 20px 24px;
      max-width: 320px;
      min-width: 260px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) inset;
      transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
      pointer-events: all;
    }
    #onb-tooltip::before {
      content: '';
      position: absolute;
      width: 10px;
      height: 10px;
      background: rgba(15,23,42,0.97);
      border: 1px solid rgba(6,182,212,0.35);
      transform: rotate(45deg);
    }
    #onb-tooltip.pos-bottom::before {
      top: -6px; left: 24px;
      border-bottom: none; border-right: none;
    }
    #onb-tooltip.pos-top::before {
      bottom: -6px; left: 24px;
      border-top: none; border-left: none;
    }
    #onb-step-badge {
      font-size: 11px;
      font-weight: 700;
      color: #06b6d4;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }
    #onb-title {
      font-size: 16px;
      font-weight: 800;
      color: #f1f5f9;
      margin-bottom: 8px;
      line-height: 1.3;
    }
    #onb-text {
      font-size: 14px;
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    #onb-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    #onb-dots {
      display: flex;
      gap: 5px;
    }
    .onb-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      transition: all 0.2s;
    }
    .onb-dot.active {
      background: #06b6d4;
      width: 18px;
      border-radius: 3px;
    }
    #onb-actions {
      display: flex;
      gap: 8px;
    }
    #onb-skip {
      padding: 8px 14px;
      font-size: 13px;
      font-weight: 600;
      color: #64748b;
      background: transparent;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
    }
    #onb-skip:hover { color: #94a3b8; border-color: rgba(255,255,255,0.2); }
    #onb-next {
      padding: 8px 18px;
      font-size: 13px;
      font-weight: 700;
      color: #fff;
      background: linear-gradient(135deg, #06b6d4, #0ea5e9);
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(6,182,212,0.35);
    }
    #onb-next:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(6,182,212,0.5); }
  `;

  let currentStep = 0;
  let highlightEl, tooltipEl, backdropEl;

  function shouldRun() {
    if (localStorage.getItem(STORAGE_KEY)) return false;
    // Запускаем только если пользователь залогинен
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      return !!user;
    } catch (e) { return false; }
  }

  function init() {
    if (!shouldRun()) return;

    // Инжектим стили
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    // Создаём элементы
    backdropEl = document.createElement('div');
    backdropEl.id = 'onb-backdrop';
    backdropEl.addEventListener('click', nextStep);

    highlightEl = document.createElement('div');
    highlightEl.id = 'onb-highlight';

    tooltipEl = document.createElement('div');
    tooltipEl.id = 'onb-tooltip';
    tooltipEl.innerHTML = `
      <div id="onb-step-badge"></div>
      <div id="onb-title"></div>
      <div id="onb-text"></div>
      <div id="onb-footer">
        <div id="onb-dots"></div>
        <div id="onb-actions">
          <button id="onb-skip">Пропустить</button>
          <button id="onb-next">Далее →</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdropEl);
    document.body.appendChild(highlightEl);
    document.body.appendChild(tooltipEl);

    tooltipEl.querySelector('#onb-skip').addEventListener('click', finish);
    tooltipEl.querySelector('#onb-next').addEventListener('click', nextStep);

    showStep(0);
  }

  function findTarget(selector) {
    const selectors = selector.split(', ');
    for (const s of selectors) {
      const el = document.querySelector(s.trim());
      if (el) return el;
    }
    return null;
  }

  function showStep(index) {
    if (index >= STEPS.length) { finish(); return; }
    currentStep = index;
    const step = STEPS[index];
    const target = findTarget(step.target);

    // Обновляем контент
    tooltipEl.querySelector('#onb-step-badge').textContent = `Шаг ${index + 1} из ${STEPS.length}`;
    tooltipEl.querySelector('#onb-title').textContent = step.title;
    tooltipEl.querySelector('#onb-text').textContent = step.text;

    // Кнопка последнего шага
    const nextBtn = tooltipEl.querySelector('#onb-next');
    nextBtn.textContent = index === STEPS.length - 1 ? '🚀 Начать!' : 'Далее →';

    // Dots
    const dotsEl = tooltipEl.querySelector('#onb-dots');
    dotsEl.innerHTML = STEPS.map((_, i) =>
      `<div class="onb-dot ${i === index ? 'active' : ''}"></div>`
    ).join('');

    // Позиционируем highlight
    if (target) {
      const rect = target.getBoundingClientRect();
      const pad = 6;
      highlightEl.style.cssText = `
        position: fixed;
        top: ${rect.top - pad}px;
        left: ${rect.left - pad}px;
        width: ${rect.width + pad * 2}px;
        height: ${rect.height + pad * 2}px;
        border-radius: 12px;
        box-shadow: 0 0 0 4px rgba(6,182,212,0.8), 0 0 0 9999px rgba(0,0,0,0.65);
        pointer-events: none;
        transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
        z-index: 999992;
      `;
      highlightEl.style.display = 'block';
      positionTooltip(rect, step.position);
    } else {
      highlightEl.style.display = 'none';
      centerTooltip();
    }
  }

  function positionTooltip(targetRect, position) {
    tooltipEl.className = `pos-${position}`;
    const tw = 320;
    const th = 200;
    const margin = 16;

    let top, left;

    if (position === 'bottom') {
      top = targetRect.bottom + 14;
      left = targetRect.left;
    } else {
      top = targetRect.top - th - 14;
      left = targetRect.left;
    }

    // Не выходим за края экрана
    left = Math.max(margin, Math.min(left, window.innerWidth - tw - margin));
    top = Math.max(margin, Math.min(top, window.innerHeight - th - margin));

    tooltipEl.style.top = top + 'px';
    tooltipEl.style.left = left + 'px';
    tooltipEl.style.display = 'block';
  }

  function centerTooltip() {
    tooltipEl.className = '';
    tooltipEl.style.top = '50%';
    tooltipEl.style.left = '50%';
    tooltipEl.style.transform = 'translate(-50%, -50%)';
  }

  function nextStep() {
    showStep(currentStep + 1);
  }

  function finish() {
    localStorage.setItem(STORAGE_KEY, '1');
    if (backdropEl) backdropEl.remove();
    if (highlightEl) highlightEl.remove();
    if (tooltipEl) tooltipEl.remove();
  }

  // Запускаем после загрузки страницы и nav
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
