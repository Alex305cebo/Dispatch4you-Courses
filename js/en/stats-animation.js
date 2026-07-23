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
    }
  });
}, observerOptions);

// Функция для немедленной инициализации статистики (для SEO/ботов)
function initStatsImmediately() {
  const statsSection = document.querySelector('.profession-stats');
  if (!statsSection) return;

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

  // Добавляем эффект при наведении на карточки профессии
  const professionCards = document.querySelectorAll('.profession-card');
  professionCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-6px) scale(1.01)';
    });

    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });
});

// Дополнительная анимация для статистики при клике
document.addEventListener('DOMContentLoaded', () => {
  const statsTicker = document.querySelector('.stats-ticker');

  if (!statsTicker) {
    console.error('Stats ticker not found!');
    return;
  }

  // Используем делегирование событий
  statsTicker.addEventListener('click', function(e) {
    const row = e.target.closest('.ticker-row');

    if (!row) {
      return;
    }

    const allRows = Array.from(statsTicker.querySelectorAll('.ticker-row'));
    const index = allRows.indexOf(row);

    // Эффект "взрыва"
    row.style.transform = 'scale(1.02)';
    setTimeout(() => {
      row.style.transform = '';
    }, 200);

    // Создаём ripple эффект
    const ripple = document.createElement('div');
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(147, 51, 234, 0.3)';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.pointerEvents = 'none';
    ripple.style.zIndex = '1000';

    const rect = row.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.transform = 'translate(-50%, -50%) scale(0)';
    ripple.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
    ripple.style.opacity = '1';

    row.style.position = row.style.position || 'relative';
    row.appendChild(ripple);

    setTimeout(() => {
      ripple.style.transform = 'translate(-50%, -50%) scale(20)';
      ripple.style.opacity = '0';
    }, 10);

    setTimeout(() => {
      ripple.remove();
    }, 600);

    // Открываем модал с детальной информацией
    openStatsModal(index);
  });
});

// ========================================
// STATS MODAL SYSTEM
// ========================================

const statsData = [
  {
    title: 'Dry Van Spot Rate',
    value: '$2.44/mi',
    icon: '🚚',
    color: '#9333ea',
    gradient: 'linear-gradient(135deg, #9333ea, #f97316)',
    description: 'Average per-mile spot rate for dry van freight, weekly data',
    chartUnit: '/mi',
    chartData: [
      { year: 'Jun 26', value: 2.38 },
      { year: 'Jul 1', value: 2.43 },
      { year: 'Jul 8', value: 2.49 },
      { year: 'Jul 16', value: 2.50 },
      { year: 'Jul 23', value: 2.44 }
    ],
    facts: [
      { icon: '📈', text: 'Up 48% (+79¢) year over year' },
      { icon: '🏆', text: 'The highest level since 2022 — carriers have real leverage for the first time in 3 years' },
      { icon: '❄️', text: 'Reefer is up 40%, flatbed up 42% year over year' },
      { icon: '🔮', text: 'DAT iQ forecasts another +12% on spot over the next 12 months' }
    ],
    source: 'Trucking Dive — weekly spot rate tracker, July 23, 2026'
  },
  {
    title: 'Reefer Spot Rate',
    value: '$2.80/mi',
    icon: '❄️',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #0ea5e9)',
    description: 'Average per-mile spot rate for refrigerated freight',
    chartUnit: '/mi',
    chartData: [
      { year: 'Jun 26', value: 2.68 },
      { year: 'Jul 1', value: 2.74 },
      { year: 'Jul 8', value: 2.85 },
      { year: 'Jul 16', value: 2.83 },
      { year: 'Jul 23', value: 2.80 }
    ],
    facts: [
      { icon: '📈', text: 'Up 40% year over year' },
      { icon: '🥶', text: 'Perishable freight keeps a premium over dry van year-round' },
      { icon: '🚚', text: 'Dry van is running $2.44/mi in the same period, up 48% y/y' },
      { icon: '🔮', text: 'DAT iQ forecasts continued rate growth over the next 12 months' }
    ],
    source: 'Trucking Dive — weekly spot rate tracker, July 23, 2026'
  },
  {
    title: 'Flatbed Spot Rate',
    value: '$2.95/mi',
    icon: '🪵',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
    description: 'Average per-mile spot rate for flatbed freight',
    chartUnit: '/mi',
    chartData: [
      { year: 'Jun 26', value: 2.94 },
      { year: 'Jul 1', value: 2.96 },
      { year: 'Jul 8', value: 3.00 },
      { year: 'Jul 16', value: 3.00 },
      { year: 'Jul 23', value: 2.95 }
    ],
    facts: [
      { icon: '📈', text: 'Up 42% year over year' },
      { icon: '🏗️', text: 'Construction materials and industrial freight keep rates elevated' },
      { icon: '🚚', text: 'The highest rate of the three main equipment types' },
      { icon: '🔮', text: 'DAT iQ forecasts continued rate growth over the next 12 months' }
    ],
    source: 'Trucking Dive — weekly spot rate tracker, July 23, 2026'
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
