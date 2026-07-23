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
  // безусловно, в том числе на мобильных, где анимации выше (строка 71)
  // сознательно отключены: на каждый кадр скролла карточки получали новый
  // inline-transform, а transition: all в profession-section.css заставлял
  // браузер непрерывно доигрывать анимацию — отсюда «желейный» лаг.
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
    title: 'Оборот рынка грузоперевозок',
    value: '$906B',
    icon: '💰',
    color: '#9333ea',
    gradient: 'linear-gradient(135deg, #9333ea, #f97316)',
    description: 'Валовая выручка индустрии грузоперевозок США',
    chartUnit: 'B',
    chartData: [
      { year: '2021', value: 875.5 },
      { year: '2022', value: 940.8 },
      { year: '2023', value: 1004 },
      { year: '2024', value: 906 }
    ],
    facts: [
      { icon: '📈', text: '2023 год был пиковым: $1.004 трлн выручки' },
      { icon: '📉', text: 'В 2024-м рынок «остыл» до $906 млрд — фрахтовая рецессия' },
      { icon: '🌍', text: 'Всё равно крупнейший грузовой рынок в мире' },
      { icon: '🏢', text: '91.5% перевозчиков на этом рынке — малый бизнес до 10 траков' }
    ],
    source: 'American Trucking Associations — Trucking Trends 2025'
  },
  {
    title: 'Грузы на траках',
    value: '72.7%',
    icon: '🛣️',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #0ea5e9)',
    description: 'Доля веса грузов США, перевозимых автотранспортом',
    chartUnit: '%',
    chartData: [
      { year: '2024', value: 72.7 }
    ],
    facts: [
      { icon: '⚖️', text: '72.7% веса всех грузов США едет именно на траках' },
      { icon: '🚆', text: 'Это больше, чем поезда, самолёты и баржи вместе взятые' },
      { icon: '🇨🇦', text: '67% сухопутной торговли с Канадой везут траки' },
      { icon: '🇲🇽', text: '85% товаров через границу с Мексикой — тоже на траках' }
    ],
    source: 'American Trucking Associations — Trucking Trends 2025'
  },
  {
    title: 'Вес перевезённых грузов',
    value: '11.27B',
    icon: '⚖️',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
    description: 'Сколько тонн грузов перевезли траки США за год',
    chartUnit: 'B',
    chartData: [
      { year: '2023', value: 11.41 },
      { year: '2024', value: 11.27 }
    ],
    facts: [
      { icon: '📦', text: '11.27 млрд тонн грузов перевезли траки США в 2024 году' },
      { icon: '📉', text: 'Годом ранее было 11.41 млрд тонн — небольшое снижение' },
      { icon: '🛣️', text: '329.86 млрд миль проехали траки США в 2023 году' },
      { icon: '🔍', text: 'Каждая тонна — груз, который кто-то должен был найти' }
    ],
    source: 'American Trucking Associations — Trucking Trends 2025'
  },
  {
    title: 'Активные перевозчики',
    value: '580K+',
    icon: '🏢',
    color: '#9333ea',
    gradient: 'linear-gradient(135deg, #9333ea, #f97316)',
    description: 'Компании и owner-operators, зарегистрированные в FMCSA',
    chartUnit: 'K',
    chartData: [
      { year: 'Всего', value: 580 },
      { year: '≤10 траков', value: 531 }
    ],
    facts: [
      { icon: '🏢', text: '580,000+ активных перевозчиков зарегистрировано в FMCSA (июнь 2025)' },
      { icon: '🚚', text: '91.5% из них управляют парком из 10 траков или меньше' },
      { icon: '📋', text: '99.3% — парком меньше 100 траков' },
      { icon: '🤝', text: 'Это ваши будущие клиенты — им нужен диспетчер' }
    ],
    source: 'American Trucking Associations, FMCSA — данные на июнь 2025'
  },
  {
    title: 'Малый бизнес индустрии',
    value: '91.5%',
    icon: '🧩',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #0ea5e9)',
    description: 'Какая часть перевозчиков США — небольшие компании',
    chartUnit: '%',
    chartData: [
      { year: '≤10 траков', value: 91.5 },
      { year: '≤100 траков', value: 99.3 }
    ],
    facts: [
      { icon: '🚚', text: '91.5% перевозчиков США — парк из 10 траков или меньше' },
      { icon: '📋', text: '99.3% перевозчиков управляют парком меньше 100 траков' },
      { icon: '👤', text: 'У owner-operator и малых компаний обычно нет своего диспетчера' },
      { icon: '🤝', text: 'Именно такие перевозчики чаще всего нанимают диспетчера на аутсорсе' }
    ],
    source: 'American Trucking Associations — Trucking Trends 2025'
  },
  {
    title: 'Люди в индустрии',
    value: '3.58M',
    icon: '👷',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
    description: 'Профессиональные водители и рабочие места в грузоперевозках',
    chartUnit: 'M',
    chartData: [
      { year: 'Водители', value: 3.58 },
      { year: 'Всего в отрасли', value: 8.4 }
    ],
    facts: [
      { icon: '🚛', text: '3.58 млн профессиональных водителей работают в США (2024)' },
      { icon: '💼', text: 'Всего индустрия создаёт 8.4 млн рабочих мест' },
      { icon: '📉', text: 'Число водителей снизилось на 0.8% за год' },
      { icon: '📞', text: 'Диспетчер — тот, кто находит груз и договаривается с брокером' }
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
