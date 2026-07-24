// ========================================
// STATS ANIMATION SYSTEM
// ========================================

// Анимация счётчика
function animateCounter(element) {
  const target = parseFloat(element.getAttribute('data-target'));
  const suffix = element.getAttribute('data-suffix') || '';
  const prefix = element.getAttribute('data-prefix') || '';
  const decimal = parseInt(element.getAttribute('data-decimal')) || 0;
  const duration = 2000; // 2 секунды
  const steps = 60;
  const increment = target / steps;
  let current = 0;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }

    const displayValue = decimal > 0 ? current.toFixed(decimal) : Math.floor(current);
    element.textContent = prefix + displayValue + suffix;
  }, duration / steps);
}

// ========================================
// WAVE CHART (SVG line/area, draw-in animation)
// ========================================

// Сглаженная кривая через точки — простое S-образное сопряжение
// горизонтальными контрольными точками (без Catmull-Rom, для 5-7 точек
// этого достаточно и выглядит как ровная волна).
function buildSmoothPath(points) {
  if (points.length < 2) return '';
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i], p1 = points[i + 1];
    const dx = (p1.x - p0.x) / 2;
    d += ` C ${p0.x + dx},${p0.y} ${p1.x - dx},${p1.y} ${p1.x},${p1.y}`;
  }
  return d;
}

let activeChartIndex = 0;

// Строит SVG-график из statsData[index].chartData — единый источник данных
// с модалкой (openStatsModal), никаких отдельных чисел в разметке.
function renderWaveChart(index) {
  const mount = document.getElementById('waveChartMount');
  const data = statsData[index] && statsData[index].chartData;
  if (!mount || !data || !data.length) return null;

  const W = 400, H = 110, padX = 12, padTop = 16, padBottom = 14;
  const values = data.map(d => d.value);
  const min = Math.min(...values), max = Math.max(...values);
  const range = (max - min) || 1;
  const points = data.map((d, i) => ({
    x: padX + i * (W - padX * 2) / (data.length - 1),
    y: H - padBottom - ((d.value - min) / range) * (H - padTop - padBottom)
  }));

  const linePath = buildSmoothPath(points);
  const last = points[points.length - 1];
  const areaPath = `${linePath} L ${last.x},${H} L ${points[0].x},${H} Z`;

  const unit = statsData[index].chartUnit || '';
  const dotsSVG = points.map((p, i) => {
    const isEnd = i === points.length - 1;
    const label = `${data[i].year}: ${data[i].value}${unit}`;
    return `
      <circle class="wave-dot${isEnd ? ' end' : ''}" cx="${p.x}" cy="${p.y}" r="${isEnd ? 5 : 4}" style="animation-delay:${0.9 + i * 0.15}s"></circle>
      <circle class="wave-dot-hit" cx="${p.x}" cy="${p.y}" r="12"><title>${label}</title></circle>
    `;
  }).join('');

  mount.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${statsData[index].title}">
      <defs>
        <linearGradient id="waveStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#8b5cf6"/>
          <stop offset="100%" stop-color="#06b6d4"/>
        </linearGradient>
        <linearGradient id="waveFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#06b6d4" stop-opacity=".35"/>
          <stop offset="100%" stop-color="#06b6d4" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path class="wave-area" d="${areaPath}"></path>
      <path class="wave-path" d="${linePath}"></path>
      ${dotsSVG}
      <circle class="end-pulse" cx="${last.x}" cy="${last.y}" r="5"></circle>
    </svg>
  `;

  const linePathEl = mount.querySelector('.wave-path');
  const len = linePathEl.getTotalLength();
  linePathEl.style.strokeDasharray = len;
  linePathEl.style.strokeDashoffset = len;
  return linePathEl;
}

function updateChartHeader(index) {
  const data = statsData[index];
  if (!data) return;
  const valueEl = document.getElementById('chartValueDisplay');
  const changeEl = document.getElementById('chartChangeDisplay');
  if (valueEl) valueEl.textContent = data.value;
  if (changeEl) changeEl.textContent = '▲ ' + data.changeLabel;
}

// Переключение вкладки типа трака — перестраивает график на месте,
// анимация "рисования" запускается сразу (секция уже в зоне видимости,
// раз пользователь successfully кликнул по вкладке).
function switchChartTab(index) {
  activeChartIndex = index;
  document.querySelectorAll('.chart-tab').forEach(btn => {
    const isActive = Number(btn.dataset.statIndex) === index;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  updateChartHeader(index);
  const linePathEl = renderWaveChart(index);
  requestAnimationFrame(() => {
    if (linePathEl) linePathEl.style.strokeDashoffset = '0';
  });
}

// Intersection Observer для запуска анимаций
const observerOptions = {
  threshold: 0.3,
  rootMargin: '0px'
};

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
      entry.target.classList.add('animated');

      // Анимация счётчиков
      const counters = entry.target.querySelectorAll('.stat-value[data-target]');
      counters.forEach(counter => {
        animateCounter(counter);
      });

      // Анимация графика (draw-in)
      const linePathEl = entry.target.querySelector('.wave-path');
      if (linePathEl) linePathEl.style.strokeDashoffset = '0';
    }
  });
}, observerOptions);

// Функция для немедленной инициализации статистики (для SEO/ботов)
function initStatsImmediately() {
  const statsSection = document.querySelector('.profession-stats');
  if (!statsSection) return;

  updateChartHeader(activeChartIndex);
  const linePathEl = renderWaveChart(activeChartIndex);

  // Проверяем, является ли это бот или мобильное устройство
  const isMobileOrBot = /bot|crawler|spider|crawling|googlebot|bingbot|yandex|baidu/i.test(navigator.userAgent) ||
                        window.innerWidth <= 1024;

  if (isMobileOrBot) {
    // Немедленно показываем финальные значения без анимации
    statsSection.classList.add('animated');

    const counters = statsSection.querySelectorAll('.stat-value[data-target]');
    counters.forEach(counter => {
      const target = parseFloat(counter.getAttribute('data-target'));
      const suffix = counter.getAttribute('data-suffix') || '';
      const prefix = counter.getAttribute('data-prefix') || '';
      const decimal = parseInt(counter.getAttribute('data-decimal')) || 0;
      const displayValue = decimal > 0 ? target.toFixed(decimal) : Math.floor(target);
      counter.textContent = prefix + displayValue + suffix;
    });

    if (linePathEl) {
      linePathEl.style.transition = 'none';
      linePathEl.style.strokeDashoffset = '0';
    }
  }
}

// Запуск наблюдателя
document.addEventListener('DOMContentLoaded', () => {
  // Сначала инициализируем статистику немедленно для ботов и мобильных
  initStatsImmediately();

  // Затем настраиваем observer для десктопа (для анимации при скролле)
  const isMobileOrBot = /bot|crawler|spider|crawling|googlebot|bingbot|yandex|baidu/i.test(navigator.userAgent) ||
                        window.innerWidth <= 1024;

  if (!isMobileOrBot) {
    const statsSection = document.querySelector('.profession-stats');
    if (statsSection) {
      statsObserver.observe(statsSection);
    }
  }

  // Вкладки типов трака — переключают график, не открывают модалку
  document.querySelectorAll('.chart-tab').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      switchChartTab(Number(btn.dataset.statIndex));
    });
  });

  // Клик по самому графику — открывает модалку активного типа трака
  const chartCard = document.querySelector('[data-chart-card]');
  if (chartCard) {
    chartCard.addEventListener('click', () => {
      openStatsModal(activeChartIndex);
    });
  }

  // Клик по чипам (ATA Tonnage / прогноз / рост за год) — своя модалка
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const index = Number(chip.dataset.statIndex);
      openStatsModal(index);
    });
  });

  // Добавляем эффект при наведении на карточки профессии
  const professionCards = document.querySelectorAll('.profession-card');
  professionCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-6px) scale(1.015)';
    });

    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });
});

// ========================================
// STATS MODAL SYSTEM
// ========================================

const statsData = [
  {
    title: 'Спот-ставка Dry Van',
    value: '$2.44/mi',
    changeLabel: '+48% год к году',
    icon: '🚚',
    color: '#9333ea',
    gradient: 'linear-gradient(135deg, #9333ea, #f97316)',
    description: 'Средняя спот-ставка за милю на рынке dry van, по месяцам 2026 года',
    chartUnit: '/mi',
    chartData: [
      { year: 'Янв', value: 2.32 },
      { year: 'Фев', value: 2.41 },
      { year: 'Мар', value: 2.52 },
      { year: 'Апр', value: 2.67 },
      { year: 'Май', value: 2.89 },
      { year: 'Июн', value: 3.00 },
      { year: 'Июл', value: 2.44 }
    ],
    facts: [
      { icon: '📈', text: 'В июне 2026 ставка достигла рекордных $3.00/mi — семь месяцев роста подряд' },
      { icon: '📉', text: 'В июле — сезонное охлаждение до $2.44/mi, но это всё равно +48% год к году' },
      { icon: '🏆', text: 'Пиковый уровень с 2022 года — carrier впервые за 3 года диктуют условия' },
      { icon: '🔮', text: 'DAT iQ прогнозирует ещё +12% по споту в течение 12 месяцев' }
    ],
    source: 'DAT Freight & Analytics — месячные спот-ставки, январь–июль 2026'
  },
  {
    title: 'Спот-ставка Reefer',
    value: '$2.80/mi',
    changeLabel: '+40% год к году',
    icon: '❄️',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #0ea5e9)',
    description: 'Средняя спот-ставка за милю на рынке рефрижераторных перевозок, по месяцам 2026 года',
    chartUnit: '/mi',
    chartData: [
      { year: 'Янв', value: 2.81 },
      { year: 'Фев', value: 2.88 },
      { year: 'Мар', value: 2.97 },
      { year: 'Апр', value: 3.12 },
      { year: 'Май', value: 3.11 },
      { year: 'Июн', value: 3.39 },
      { year: 'Июл', value: 2.80 }
    ],
    facts: [
      { icon: '📈', text: 'В июне 2026 ставка достигла $3.39/mi — максимум за много лет' },
      { icon: '📉', text: 'В июле — коррекция до $2.80/mi, всё равно +40% год к году' },
      { icon: '🥶', text: 'Скоропортящиеся грузы держат премию к dry van круглый год' },
      { icon: '🔮', text: 'DAT iQ прогнозирует дальнейший рост ставок в течение 12 месяцев' }
    ],
    source: 'DAT Freight & Analytics — месячные спот-ставки, январь–июль 2026'
  },
  {
    title: 'Спот-ставка Flatbed',
    value: '$2.95/mi',
    changeLabel: '+42% год к году',
    icon: '🪵',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
    description: 'Средняя спот-ставка за милю на рынке flatbed-перевозок, по месяцам 2026 года',
    chartUnit: '/mi',
    chartData: [
      { year: 'Янв', value: 2.85 },
      { year: 'Фев', value: 2.72 },
      { year: 'Мар', value: 3.09 },
      { year: 'Апр', value: 3.44 },
      { year: 'Май', value: 3.65 },
      { year: 'Июн', value: 3.69 },
      { year: 'Июл', value: 2.95 }
    ],
    facts: [
      { icon: '📈', text: 'В июне 2026 ставка достигла $3.69/mi — исторический максимум' },
      { icon: '📉', text: 'В июле — коррекция до $2.95/mi, всё равно +42% год к году' },
      { icon: '🏗️', text: 'Стройматериалы и промышленные грузы держат ставки высокими' },
      { icon: '🚚', text: 'Самый высокий тариф из трёх основных типов кузова весь год' }
    ],
    source: 'DAT Freight & Analytics — месячные спот-ставки, январь–июль 2026'
  },
  {
    title: 'ATA Truck Tonnage Index',
    value: '+1.4%',
    icon: '📊',
    color: '#9333ea',
    gradient: 'linear-gradient(135deg, #9333ea, #f97316)',
    description: 'Индекс тоннажа грузоперевозок США, год к году, по месяцам 2026 года',
    chartUnit: '%',
    chartData: [
      { year: 'Фев', value: 1.8 },
      { year: 'Мар', value: 3.0 },
      { year: 'Апр', value: 3.5 },
      { year: 'Май', value: -0.7 },
      { year: 'Июн', value: -0.1 }
    ],
    facts: [
      { icon: '📈', text: 'Март 2026 — рост на 3%, максимум с октября 2022 года' },
      { icon: '📉', text: 'Апрель–май 2026 — суммарное падение индекса на 4.1%' },
      { icon: '📊', text: 'Итог за 1-е полугодие 2026 — рост на 1.4% год к году' },
      { icon: '💬', text: '«Снижение мощностей за год, вероятно, помогает перевозчикам чувствовать себя увереннее» — Bob Costello, главный экономист ATA' }
    ],
    source: 'American Trucking Associations — ATA Truck Tonnage Index, июнь 2026'
  },
  {
    title: 'Прогноз ставок DAT iQ',
    value: '+12%',
    icon: '📈',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #0ea5e9)',
    description: 'Прогноз роста ставок на ближайшие 12 месяцев',
    chartUnit: '%',
    chartData: [
      { year: 'Contract', value: 8 },
      { year: 'Spot', value: 12 }
    ],
    facts: [
      { icon: '📈', text: 'DAT iQ ожидает рост спот-ставок dry van на ~12% за 12 месяцев' },
      { icon: '📋', text: 'Контрактные ставки при этом вырастут скромнее — на ~8%' },
      { icon: '🔀', text: 'ACT Research ожидает более заметный рост контрактных ставок во 2-м полугодии 2026' },
      { icon: '⚖️', text: 'Спот наконец обгоняет контракт — редкая ситуация для рынка' }
    ],
    source: 'DAT iQ / ACT Research, прогноз на 2026 год'
  },
  {
    title: 'Рост ставок за 12 месяцев',
    value: '+23%',
    icon: '🔓',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
    description: 'Фактический рост спот-ставок за последние 12 месяцев',
    chartUnit: '%',
    chartData: [
      { year: 'Contract рост', value: 5 },
      { year: 'Spot рост', value: 23 }
    ],
    facts: [
      { icon: '📈', text: 'Спот-ставки выросли на 23%+ с марта 2025 по февраль 2026' },
      { icon: '📋', text: 'Контрактные ставки за тот же период — только +5%' },
      { icon: '🤝', text: 'Tender rejection держится на уровне low-to-mid teens % — у перевозчиков впервые за 3 года есть реальный рычаг в переговорах' },
      { icon: '🔮', text: 'DAT iQ ожидает ещё +12% по споту и +8% по контракту в следующие 12 месяцев' }
    ],
    source: 'U.S. Bank Freight Payment Index / Trucking Dive, март 2025 – февраль 2026'
  }
];

function openStatsModal(index) {
  const modal = document.getElementById('statsModal');
  const modalContent = document.getElementById('statsModalContent');
  const data = statsData[index];

  if (!data) return;

  // Генерируем HTML для графика
  // Шкала от минимума, а не от нуля/максимума: у значений в узком диапазоне
  // (2.32..3.00) высота от maxValue почти не отличалась (77%..100%) — бары
  // выглядели одинаковыми. От min до max + пол 20% — разница видна, и
  // отрицательные значения (ATA Tonnage: -0.7 и т.п.) больше не дают
  // invalid отрицательную высоту.
  const values = data.chartData.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = (maxValue - minValue) || 1;
  const chartBars = data.chartData.map(item => {
    const height = 20 + ((item.value - minValue) / range) * 80;
    return `
      <div class="chart-bar-wrapper">
        <div class="chart-bar" style="height: ${height}%; background: ${data.gradient};">
          <span class="chart-value">${item.value}${data.chartUnit}</span>
        </div>
        <span class="chart-year">${item.year}</span>
      </div>
    `;
  }).join('');

  // Генерируем HTML для фактов
  const factsHTML = data.facts.map(fact => `
    <div class="stats-fact">
      <span class="fact-icon">${fact.icon}</span>
      <p>${fact.text}</p>
    </div>
  `).join('');

  modalContent.innerHTML = `
    <div class="stats-modal-header">
      <div class="stats-modal-icon" style="background: ${data.gradient};">${data.icon}</div>
      <h2>${data.title}</h2>
      <p class="stats-modal-subtitle">${data.description}</p>
      <div class="stats-modal-value" style="background: ${data.gradient}; -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">${data.value}</div>
    </div>

    <div class="stats-modal-body">
      <h3>В цифрах</h3>
      <div class="stats-chart">
        ${chartBars}
      </div>

      <h3>Интересные факты</h3>
      <div class="stats-facts">
        ${factsHTML}
      </div>

      <div class="stats-modal-source">
        <p>📊 Источник: ${data.source}</p>
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Анимация появления графика
  setTimeout(() => {
    const bars = modal.querySelectorAll('.chart-bar');
    bars.forEach((bar, i) => {
      setTimeout(() => {
        bar.style.transform = 'scaleY(1)';
      }, i * 100);
    });
  }, 300);
}

function closeStatsModal() {
  const modal = document.getElementById('statsModal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// Закрытие по Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeStatsModal();
  }
});
