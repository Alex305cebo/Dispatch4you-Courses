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

  const dotsSVG = points.map((p, i) => {
    const isEnd = i === points.length - 1;
    return `<circle class="wave-dot${isEnd ? ' end' : ''}" cx="${p.x}" cy="${p.y}" r="${isEnd ? 5 : 4}" style="animation-delay:${0.9 + i * 0.15}s"></circle>`;
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
      const counters = entry.target.querySelectorAll('.stat-value');
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

    const counters = statsSection.querySelectorAll('.stat-value');
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
    title: 'Dry Van Spot Rate',
    value: '$2.44/mi',
    changeLabel: '+48% year over year',
    icon: '🚚',
    color: '#9333ea',
    gradient: 'linear-gradient(135deg, #9333ea, #f97316)',
    description: 'Average per-mile spot rate for dry van freight, by month in 2026',
    chartUnit: '/mi',
    chartData: [
      { year: 'Jan', value: 2.32 },
      { year: 'Feb', value: 2.41 },
      { year: 'Mar', value: 2.52 },
      { year: 'Apr', value: 2.67 },
      { year: 'May', value: 2.89 },
      { year: 'Jun', value: 3.00 },
      { year: 'Jul', value: 2.44 }
    ],
    facts: [
      { icon: '📈', text: 'June 2026 hit a record $3.00/mi — seven straight months of gains' },
      { icon: '📉', text: 'July brought a seasonal cool-down to $2.44/mi, still up 48% year over year' },
      { icon: '🏆', text: 'The highest level since 2022 — carriers have real leverage for the first time in 3 years' },
      { icon: '🔮', text: 'DAT iQ forecasts another +12% on spot over the next 12 months' }
    ],
    source: 'DAT Freight & Analytics — monthly spot rates, January–July 2026'
  },
  {
    title: 'Reefer Spot Rate',
    value: '$2.80/mi',
    changeLabel: '+40% year over year',
    icon: '❄️',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #0ea5e9)',
    description: 'Average per-mile spot rate for refrigerated freight, by month in 2026',
    chartUnit: '/mi',
    chartData: [
      { year: 'Jan', value: 2.81 },
      { year: 'Feb', value: 2.88 },
      { year: 'Mar', value: 2.97 },
      { year: 'Apr', value: 3.12 },
      { year: 'May', value: 3.11 },
      { year: 'Jun', value: 3.39 },
      { year: 'Jul', value: 2.80 }
    ],
    facts: [
      { icon: '📈', text: 'June 2026 hit $3.39/mi — a multi-year high' },
      { icon: '📉', text: 'July brought a correction to $2.80/mi, still up 40% year over year' },
      { icon: '🥶', text: 'Perishable freight keeps a premium over dry van year-round' },
      { icon: '🔮', text: 'DAT iQ forecasts continued rate growth over the next 12 months' }
    ],
    source: 'DAT Freight & Analytics — monthly spot rates, January–July 2026'
  },
  {
    title: 'Flatbed Spot Rate',
    value: '$2.95/mi',
    changeLabel: '+42% year over year',
    icon: '🪵',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
    description: 'Average per-mile spot rate for flatbed freight, by month in 2026',
    chartUnit: '/mi',
    chartData: [
      { year: 'Jan', value: 2.85 },
      { year: 'Feb', value: 2.72 },
      { year: 'Mar', value: 3.09 },
      { year: 'Apr', value: 3.44 },
      { year: 'May', value: 3.65 },
      { year: 'Jun', value: 3.69 },
      { year: 'Jul', value: 2.95 }
    ],
    facts: [
      { icon: '📈', text: 'June 2026 hit $3.69/mi — an all-time high' },
      { icon: '📉', text: 'July brought a correction to $2.95/mi, still up 42% year over year' },
      { icon: '🏗️', text: 'Construction materials and industrial freight keep rates elevated' },
      { icon: '🚚', text: 'The highest rate of the three main equipment types all year' }
    ],
    source: 'DAT Freight & Analytics — monthly spot rates, January–July 2026'
  },
  {
    title: 'ATA Truck Tonnage Index',
    value: '+1.4%',
    icon: '📊',
    color: '#9333ea',
    gradient: 'linear-gradient(135deg, #9333ea, #f97316)',
    description: 'US freight tonnage index, year over year, by month in 2026',
    chartUnit: '%',
    chartData: [
      { year: 'Feb', value: 1.8 },
      { year: 'Mar', value: 3.0 },
      { year: 'Apr', value: 3.5 },
      { year: 'May', value: -0.7 },
      { year: 'Jun', value: -0.1 }
    ],
    facts: [
      { icon: '📈', text: 'March 2026 rose 3% — the largest y/y gain since October 2022' },
      { icon: '📉', text: 'April–May 2026 combined for a 4.1% contraction' },
      { icon: '📊', text: 'First half of 2026 is up 1.4% year over year overall' },
      { icon: '💬', text: '"The decrease in capacity over the last year probably has fleets feeling a little better" — Bob Costello, ATA Chief Economist' }
    ],
    source: 'American Trucking Associations — ATA Truck Tonnage Index, June 2026'
  },
  {
    title: 'DAT iQ Rate Forecast',
    value: '+12%',
    icon: '📈',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #0ea5e9)',
    description: 'Forecast rate growth over the next 12 months',
    chartUnit: '%',
    chartData: [
      { year: 'Contract', value: 8 },
      { year: 'Spot', value: 12 }
    ],
    facts: [
      { icon: '📈', text: 'DAT iQ expects dry van spot rates to rise ~12% over 12 months' },
      { icon: '📋', text: 'Contract rates are expected to rise more modestly, ~8%' },
      { icon: '🔀', text: 'ACT Research expects a more meaningful contract-rate increase in H2 2026' },
      { icon: '⚖️', text: 'Spot is finally outpacing contract — a rare setup for this market' }
    ],
    source: 'DAT iQ / ACT Research, 2026 forecast'
  },
  {
    title: 'Rate Growth, Past 12 Months',
    value: '+23%',
    icon: '🔓',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
    description: 'Actual spot rate growth over the trailing 12 months',
    chartUnit: '%',
    chartData: [
      { year: 'Contract growth', value: 5 },
      { year: 'Spot growth', value: 23 }
    ],
    facts: [
      { icon: '📈', text: 'Spot rates rose 23%+ from March 2025 through February 2026' },
      { icon: '📋', text: 'Contract rates over the same period rose only 5%' },
      { icon: '🤝', text: 'Tender rejection rates sit in the low-to-mid teens — carriers have real leverage for the first time in 3 years' },
      { icon: '🔮', text: 'DAT iQ expects another +12% spot and +8% contract over the next 12 months' }
    ],
    source: 'U.S. Bank Freight Payment Index / Trucking Dive, March 2025 – February 2026'
  }
];

function openStatsModal(index) {
  const modal = document.getElementById('statsModal');
  const modalContent = document.getElementById('statsModalContent');
  const data = statsData[index];

  if (!data) return;

  // Генерируем HTML для графика
  const maxValue = Math.max(...data.chartData.map(d => d.value));
  const chartBars = data.chartData.map(item => {
    const height = (item.value / maxValue) * 100;
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
      <h3>By the Numbers</h3>
      <div class="stats-chart">
        ${chartBars}
      </div>

      <h3>Interesting Facts</h3>
      <div class="stats-facts">
        ${factsHTML}
      </div>

      <div class="stats-modal-source">
        <p>📊 Source: ${data.source}</p>
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
