// ========================================
// PROFESSION MODAL & ACCORDION SYSTEM
// ========================================

const professionData = {
  income: {
    icon: '💰',
    title: 'Высокий доход',
    subtitle: 'Стабильный заработок в долларах',
    content: `
      <h4>Потенциал заработка диспетчера</h4>
      <div class="profession-modal-list">
        <div class="profession-modal-item">
          <span class="item-icon">🌱</span>
          <div>
            <strong>Начальный уровень (0-3 месяца)</strong>
            <p>$2,000-$3,000/мес — период обучения и адаптации</p>
          </div>
        </div>
        <div class="profession-modal-item">
          <span class="item-icon">📈</span>
          <div>
            <strong>Средний уровень (6-12 месяцев)</strong>
            <p>$4,000-$6,000/мес — уверенная работа с клиентами</p>
          </div>
        </div>
        <div class="profession-modal-item">
          <span class="item-icon">⭐</span>
          <div>
            <strong>Опытный диспетчер (2+ года)</strong>
            <p>$8,000-$12,000+/мес — управление флотом грузовиков</p>
          </div>
        </div>
        <div class="profession-modal-item">
          <span class="item-icon">💎</span>
          <div>
            <strong>Дополнительные бонусы</strong>
            <p>Комиссии за эффективность, премии за объёмы</p>
          </div>
        </div>
      </div>
      <div class="profession-modal-note">
        <p>💡 <strong>Важно:</strong> Доход зависит от количества грузовиков под управлением и вашей эффективности в поиске грузов.</p>
      </div>
    `
  },
  remote: {
    icon: '🌍',
    title: 'Работа Из любой точки',
    subtitle: 'Полная свобода локации',
    content: `
      <h4>Работайте откуда угодно</h4>
      <div class="profession-modal-list">
        <div class="profession-modal-item">
          <span class="item-icon">🏠</span>
          <div>
            <strong>Из дома</strong>
            <p>Комфортная работа в домашней обстановке без траты времени на дорогу</p>
          </div>
        </div>
        <div class="profession-modal-item">
          <span class="item-icon">✈️</span>
          <div>
            <strong>Путешествия</strong>
            <p>Работайте из любой страны мира — нужен только интернет</p>
          </div>
        </div>
        <div class="profession-modal-item">
          <span class="item-icon">☕</span>
          <div>
            <strong>Коворкинг</strong>
            <p>Выбирайте удобное рабочее пространство по настроению</p>
          </div>
        </div>
        <div class="profession-modal-item">
          <span class="item-icon">💻</span>
          <div>
            <strong>Минимум требований</strong>
            <p>Ноутбук, стабильный интернет, телефон — это всё что нужно</p>
          </div>
        </div>
      </div>
      <div class="profession-modal-note">
        <p>🌐 <strong>Свобода:</strong> Офис не нужен — работайте там, где вам комфортно и продуктивно.</p>
      </div>
    `
  },
  schedule: {
    icon: '⏰',
    title: 'Гибкий график',
    subtitle: 'Управляйте своим временем',
    content: `
      <h4>Выбирайте удобный график</h4>
      <div class="profession-modal-list">
        <div class="profession-modal-item">
          <span class="item-icon">🌅</span>
          <div>
            <strong>Частичная занятость</strong>
            <p>4-6 часов в день — идеально для начала или совмещения</p>
          </div>
        </div>
        <div class="profession-modal-item">
          <span class="item-icon">☀️</span>
          <div>
            <strong>Полный день</strong>
            <p>8-10 часов для максимального дохода и карьерного роста</p>
          </div>
        </div>
        <div class="profession-modal-item">
          <span class="item-icon">🕐</span>
          <div>
            <strong>Выбор смены</strong>
            <p>Утренняя, дневная или вечерняя — под ваш ритм жизни</p>
          </div>
        </div>
        <div class="profession-modal-item">
          <span class="item-icon">📅</span>
          <div>
            <strong>Выходные</strong>
            <p>Работайте по своему графику, планируйте отдых заранее</p>
          </div>
        </div>
      </div>
      <div class="profession-modal-note">
        <p>⏱️ <strong>Баланс:</strong> Вы сами решаете, когда и сколько работать — никаких жёстких рамок.</p>
      </div>
    `
  },
  demand: {
    icon: '📊',
    title: 'Растущий спрос',
    subtitle: 'Стабильная индустрия',
    content: `
      <h4>Профессия с перспективами</h4>
      <div class="profession-modal-list">
        <div class="profession-modal-item">
          <span class="item-icon">📦</span>
          <div>
            <strong>Рост рынка</strong>
            <p>E-commerce увеличивает спрос на грузоперевозки ежегодно</p>
          </div>
        </div>
        <div class="profession-modal-item">
          <span class="item-icon">👥</span>
          <div>
            <strong>Дефицит кадров</strong>
            <p>Постоянная потребность в квалифицированных диспетчерах</p>
          </div>
        </div>
        <div class="profession-modal-item">
          <span class="item-icon">🇺🇸</span>
          <div>
            <strong>Стабильность</strong>
            <p>Грузоперевозки — основа экономики США ($875B в год)</p>
          </div>
        </div>
        <div class="profession-modal-item">
          <span class="item-icon">🚀</span>
          <div>
            <strong>Перспективы</strong>
            <p>Карьерный рост до старшего диспетчера или менеджера</p>
          </div>
        </div>
      </div>
      <div class="profession-modal-note">
        <p>📈 <strong>Будущее:</strong> Профессия с долгосрочными перспективами и стабильным спросом.</p>
      </div>
    `
  }
};

// Определяем мобильное устройство
function isMobile() {
  return window.innerWidth <= 768;
}

// Открытие модального окна или аккордеона
function openProfessionModal(type) {
  const data = professionData[type];
  if (!data) return;

  if (isMobile()) {
    // На мобильных — аккордеон
    const card = event.currentTarget;
    const accordion = card.querySelector('.profession-accordion-content');
    const allAccordions = document.querySelectorAll('.profession-accordion-content');
    const allCards = document.querySelectorAll('.profession-card');
    
    // Закрываем все остальные аккордеоны
    allAccordions.forEach(acc => {
      if (acc !== accordion) {
        acc.classList.remove('active');
      }
    });
    
    allCards.forEach(c => {
      if (c !== card) {
        c.classList.remove('accordion-open');
      }
    });
    
    // Переключаем текущий
    accordion.classList.toggle('active');
    card.classList.toggle('accordion-open');
  } else {
    // На десктопе — модальное окно
    const modal = document.getElementById('professionModal');
    const modalContent = document.getElementById('professionModalContent');
    
    modalContent.innerHTML = `
      <div class="profession-modal-header">
        <div class="profession-modal-icon">${data.icon}</div>
        <h2>${data.title}</h2>
        <p class="profession-modal-subtitle">${data.subtitle}</p>
      </div>
      <div class="profession-modal-body">
        ${data.content}
      </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

// Закрытие модального окна
function closeProfessionModal() {
  const modal = document.getElementById('professionModal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// Закрытие по Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeProfessionModal();
  }
});

// Закрытие аккордеонов при изменении размера окна
window.addEventListener('resize', function() {
  if (!isMobile()) {
    const allAccordions = document.querySelectorAll('.profession-accordion-content');
    const allCards = document.querySelectorAll('.profession-card');
    
    allAccordions.forEach(acc => acc.classList.remove('active'));
    allCards.forEach(card => card.classList.remove('accordion-open'));
  }
});
