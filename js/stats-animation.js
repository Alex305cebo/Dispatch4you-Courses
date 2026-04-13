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
  
  // Параллакс эффект при скролле
  let ticking = false;
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        applyParallax();
        ticking = false;
      });
      ticking = true;
    }
  });
  
  function applyParallax() {
    const statsSection = document.querySelector('.profession-stats');
    if (!statsSection) return;
    
    const rect = statsSection.getBoundingClientRect();
    const scrollPercent = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
    
    if (scrollPercent > 0 && scrollPercent < 1) {
      const statItems = statsSection.querySelectorAll('.stat-item');
      statItems.forEach((item, index) => {
        const offset = (scrollPercent - 0.5) * 20 * (index % 2 === 0 ? 1 : -1);
        item.style.transform = `translateY(${offset}px)`;
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
  
  console.log('Stats grid found, setting up delegation');
  
  // Используем делегирование событий
  statsGrid.addEventListener('click', function(e) {
    const statItem = e.target.closest('.stat-item');
    
    if (!statItem) {
      console.log('Click not on stat-item');
      return;
    }
    
    const allStatItems = Array.from(statsGrid.querySelectorAll('.stat-item'));
    const index = allStatItems.indexOf(statItem);
    
    console.log(`Clicked on stat item ${index}`);
    
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
    console.log(`Opening modal for index ${index}`);
    openStatsModal(index);
  });
});

// ========================================
// STATS MODAL SYSTEM
// ========================================

const statsData = [
  {
    title: 'Объём рынка грузоперевозок',
    value: '$875B',
    icon: '💰',
    color: '#9333ea',
    gradient: 'linear-gradient(135deg, #9333ea, #f97316)',
    description: 'Годовой оборот индустрии грузоперевозок США',
    chartData: [
      { year: '2020', value: 732 },
      { year: '2021', value: 796 },
      { year: '2022', value: 823 },
      { year: '2023', value: 850 },
      { year: '2024', value: 875 }
    ],
    facts: [
      { icon: '📈', text: 'Рост на 12% за последний год' },
      { icon: '🌍', text: 'Крупнейший рынок в мире' },
      { icon: '💼', text: '7.4 млн рабочих мест в индустрии' },
      { icon: '🚛', text: '70% всех грузов перевозится автотранспортом' }
    ],
    source: 'American Trucking Associations, 2024'
  },
  {
    title: 'Грузовики на дорогах',
    value: '3.5M+',
    icon: '🚛',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #0ea5e9)',
    description: 'Количество активных грузовиков в США',
    chartData: [
      { year: '2020', value: 3.1 },
      { year: '2021', value: 3.2 },
      { year: '2022', value: 3.3 },
      { year: '2023', value: 3.4 },
      { year: '2024', value: 3.5 }
    ],
    facts: [
      { icon: '📊', text: 'Постоянный рост парка на 3-4% в год' },
      { icon: '🔧', text: 'Средний возраст грузовика: 7.2 года' },
      { icon: '⚡', text: '15% парка — электрические и гибридные' },
      { icon: '🛣️', text: 'Средний пробег: 45,000 миль в год' }
    ],
    source: 'Federal Motor Carrier Safety Administration, 2024'
  },
  {
    title: 'Доля грузовых перевозок',
    value: '70%',
    icon: '📦',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
    description: 'Процент грузов, перевозимых автотранспортом',
    chartData: [
      { year: '2020', value: 68 },
      { year: '2021', value: 68.5 },
      { year: '2022', value: 69 },
      { year: '2023', value: 69.5 },
      { year: '2024', value: 70 }
    ],
    facts: [
      { icon: '🏭', text: 'Основной способ доставки товаров' },
      { icon: '📱', text: 'E-commerce увеличивает спрос на 15% ежегодно' },
      { icon: '⏱️', text: 'Средняя скорость доставки: 2-3 дня' },
      { icon: '🌐', text: 'Покрывает 100% территории США' }
    ],
    source: 'U.S. Department of Transportation, 2024'
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
          <span class="chart-value">${item.value}${data.value.includes('%') ? '%' : 'B'}</span>
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
      <h3>Динамика роста</h3>
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
