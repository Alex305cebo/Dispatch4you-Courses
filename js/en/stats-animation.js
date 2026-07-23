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

// Анимация прогресс-бара
function animateProgressBar(element) {
  const targetWidth = element.getAttribute('data-width');
  setTimeout(() => {
    element.style.width = targetWidth;
  }, 300);
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

      // Анимация прогресс-баров
      const progressBars = entry.target.querySelectorAll('.stat-progress-bar');
      progressBars.forEach(bar => {
        animateProgressBar(bar);
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

    const progressBars = statsSection.querySelectorAll('.stat-progress-bar');
    progressBars.forEach(bar => {
      const targetWidth = bar.getAttribute('data-width');
      bar.style.width = targetWidth;
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

  // Параллакс эффект при скролле — ТОЛЬКО на десктопе. Раньше слушатель вешался
  // безусловно, в том числе на мобильных, где анимации выше сознательно
  // отключены: на каждый кадр скролла карточки получали новый inline-transform,
  // а transition: all в profession-section.css заставлял браузер непрерывно
  // доигрывать анимацию — отсюда «желейный» лаг.
  let ticking = false;

  if (!isMobileOrBot) {
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          applyParallax();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  function applyParallax() {
    const statsSection = document.querySelector('.profession-stats');
    if (!statsSection) return;

    const rect = statsSection.getBoundingClientRect();
    const scrollPercent = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);

    if (scrollPercent > 0 && scrollPercent < 1) {
      const statItems = statsSection.querySelectorAll('.stat-item');
      statItems.forEach((item, index) => {
        const offset = (scrollPercent - 0.5) * 20 * (index % 2 === 0 ? 1 : -1);
        // Пишем переменную, а не inline-transform: иначе inline перебивает
        // таблицу стилей и :hover у карточки перестаёт работать.
        item.style.setProperty('--stat-parallax-y', offset + 'px');
      });
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
  const statsGrid = document.querySelector('.stats-grid');

  if (!statsGrid) {
    console.error('Stats grid not found!');
    return;
  }


  // Используем делегирование событий
  statsGrid.addEventListener('click', function(e) {
    const statItem = e.target.closest('.stat-item');

    if (!statItem) {
      return;
    }

    const allStatItems = Array.from(statsGrid.querySelectorAll('.stat-item'));
    const index = allStatItems.indexOf(statItem);


    // Эффект "взрыва"
    statItem.style.transform = 'scale(1.05)';
    setTimeout(() => {
      statItem.style.transform = '';
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

    const rect = statItem.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.transform = 'translate(-50%, -50%) scale(0)';
    ripple.style.transition = 'transform 0.6s ease-out, opacity 0.6s ease-out';
    ripple.style.opacity = '1';

    statItem.appendChild(ripple);

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
    title: 'Freight Market Revenue',
    value: '$906B',
    icon: '💰',
    color: '#9333ea',
    gradient: 'linear-gradient(135deg, #9333ea, #f97316)',
    description: 'Gross annual revenue of the US trucking industry',
    chartUnit: 'B',
    chartData: [
      { year: '2021', value: 875.5 },
      { year: '2022', value: 940.8 },
      { year: '2023', value: 1004 },
      { year: '2024', value: 906 }
    ],
    facts: [
      { icon: '📈', text: '2023 was the peak year: $1.004 trillion in revenue' },
      { icon: '📉', text: 'In 2024 the market cooled to $906 billion — a freight recession' },
      { icon: '🌍', text: 'Still the largest freight market in the world' },
      { icon: '🏢', text: '91.5% of carriers in this market are small businesses with 10 trucks or fewer' }
    ],
    source: 'American Trucking Associations — Trucking Trends 2025'
  },
  {
    title: 'Freight Moved by Truck',
    value: '72.7%',
    icon: '🛣️',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #0ea5e9)',
    description: 'Share of US freight tonnage moved by truck',
    chartUnit: '%',
    chartData: [
      { year: '2024', value: 72.7 }
    ],
    facts: [
      { icon: '⚖️', text: '72.7% of all US freight weight moves by truck' },
      { icon: '🚆', text: "That's more than rail, air, and barge combined" },
      { icon: '🇨🇦', text: 'Trucks carry 67% of US-Canada surface trade' },
      { icon: '🇲🇽', text: 'And 85% of goods crossing the Mexican border' }
    ],
    source: 'American Trucking Associations — Trucking Trends 2025'
  },
  {
    title: 'Freight Tonnage Hauled',
    value: '11.27B',
    icon: '⚖️',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
    description: 'Total tons of freight trucks moved in a year',
    chartUnit: 'B',
    chartData: [
      { year: '2023', value: 11.41 },
      { year: '2024', value: 11.27 }
    ],
    facts: [
      { icon: '📦', text: 'Trucks hauled 11.27 billion tons of freight in 2024' },
      { icon: '📉', text: 'Down slightly from 11.41 billion tons the year before' },
      { icon: '🛣️', text: 'Trucks logged 329.86 billion miles in 2023' },
      { icon: '🔍', text: 'Every ton is a load someone had to find first' }
    ],
    source: 'American Trucking Associations — Trucking Trends 2025'
  },
  {
    title: 'Active Motor Carriers',
    value: '580K+',
    icon: '🏢',
    color: '#9333ea',
    gradient: 'linear-gradient(135deg, #9333ea, #f97316)',
    description: 'Companies and owner-operators registered with FMCSA',
    chartUnit: 'K',
    chartData: [
      { year: 'Total', value: 580 },
      { year: '≤10 trucks', value: 531 }
    ],
    facts: [
      { icon: '🏢', text: '580,000+ active carriers are registered with the FMCSA (June 2025)' },
      { icon: '🚚', text: '91.5% run a fleet of 10 trucks or fewer' },
      { icon: '📋', text: '99.3% run fewer than 100 trucks' },
      { icon: '🤝', text: 'These are your future clients — they need a dispatcher' }
    ],
    source: 'American Trucking Associations, FMCSA — as of June 2025'
  },
  {
    title: 'Small Business Industry',
    value: '91.5%',
    icon: '🧩',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #0ea5e9)',
    description: 'Share of US carriers that are small businesses',
    chartUnit: '%',
    chartData: [
      { year: '≤10 trucks', value: 91.5 },
      { year: '≤100 trucks', value: 99.3 }
    ],
    facts: [
      { icon: '🚚', text: '91.5% of US carriers run a fleet of 10 trucks or fewer' },
      { icon: '📋', text: '99.3% run fewer than 100 trucks' },
      { icon: '👤', text: 'Owner-operators and small fleets rarely have an in-house dispatcher' },
      { icon: '🤝', text: "They're exactly who outsources dispatching" }
    ],
    source: 'American Trucking Associations — Trucking Trends 2025'
  },
  {
    title: 'People in the Industry',
    value: '3.58M',
    icon: '👷',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
    description: 'Professional drivers and jobs in trucking',
    chartUnit: 'M',
    chartData: [
      { year: 'Drivers', value: 3.58 },
      { year: 'Industry total', value: 8.4 }
    ],
    facts: [
      { icon: '🚛', text: '3.58 million professional drivers work in the US (2024)' },
      { icon: '💼', text: 'The industry supports 8.4 million jobs overall' },
      { icon: '📉', text: 'Driver count dipped 0.8% year over year' },
      { icon: '📞', text: 'A dispatcher is who finds the load and negotiates with the broker' }
    ],
    source: 'American Trucking Associations — Trucking Trends 2025'
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
