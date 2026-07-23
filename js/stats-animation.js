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
    title: 'Спот-ставка Dry Van',
    value: '$2.44/mi',
    icon: '🚚',
    color: '#9333ea',
    gradient: 'linear-gradient(135deg, #9333ea, #f97316)',
    description: 'Средняя спот-ставка за милю на рынке dry van, еженедельные данные',
    chartUnit: '/mi',
    chartData: [
      { year: '26 июня', value: 2.38 },
      { year: '1 июля', value: 2.43 },
      { year: '8 июля', value: 2.49 },
      { year: '16 июля', value: 2.50 },
      { year: '23 июля', value: 2.44 }
    ],
    facts: [
      { icon: '📈', text: 'Ставка выросла на 48% (+79¢) год к году' },
      { icon: '🏆', text: 'Пиковый уровень с 2022 года — carrier впервые за 3 года диктуют условия' },
      { icon: '❄️', text: 'Reefer растёт на 40%, Flatbed — на 42% год к году' },
      { icon: '🔮', text: 'DAT iQ прогнозирует ещё +12% по споту в течение 12 месяцев' }
    ],
    source: 'Trucking Dive — еженедельный трекер спот-ставок, 23 июля 2026'
  },
  {
    title: 'Спот-ставка Reefer',
    value: '$2.80/mi',
    icon: '❄️',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #0ea5e9)',
    description: 'Средняя спот-ставка за милю на рынке рефрижераторных перевозок',
    chartUnit: '/mi',
    chartData: [
      { year: '26 июня', value: 2.68 },
      { year: '1 июля', value: 2.74 },
      { year: '8 июля', value: 2.85 },
      { year: '16 июля', value: 2.83 },
      { year: '23 июля', value: 2.80 }
    ],
    facts: [
      { icon: '📈', text: 'Ставка выросла на 40% год к году' },
      { icon: '🥶', text: 'Скоропортящиеся грузы держат премию к dry van круглый год' },
      { icon: '🚚', text: 'Dry van в это же время — $2.44/mi, +48% год к году' },
      { icon: '🔮', text: 'DAT iQ прогнозирует дальнейший рост ставок в течение 12 месяцев' }
    ],
    source: 'Trucking Dive — еженедельный трекер спот-ставок, 23 июля 2026'
  },
  {
    title: 'Спот-ставка Flatbed',
    value: '$2.95/mi',
    icon: '🪵',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
    description: 'Средняя спот-ставка за милю на рынке flatbed-перевозок',
    chartUnit: '/mi',
    chartData: [
      { year: '26 июня', value: 2.94 },
      { year: '1 июля', value: 2.96 },
      { year: '8 июля', value: 3.00 },
      { year: '16 июля', value: 3.00 },
      { year: '23 июля', value: 2.95 }
    ],
    facts: [
      { icon: '📈', text: 'Ставка выросла на 42% год к году' },
      { icon: '🏗️', text: 'Стройматериалы и промышленные грузы держат ставки высокими' },
      { icon: '🚚', text: 'Самый высокий тариф из трёх основных типов кузова' },
      { icon: '🔮', text: 'DAT iQ прогнозирует дальнейший рост ставок в течение 12 месяцев' }
    ],
    source: 'Trucking Dive — еженедельный трекер спот-ставок, 23 июля 2026'
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
