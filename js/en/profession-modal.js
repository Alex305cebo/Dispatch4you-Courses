// ========================================
// PROFESSION MODAL & ACCORDION SYSTEM
// ========================================

const professionData = {
  income: {
    icon: '💰',
    title: 'High Income',
    subtitle: 'Stable earnings in dollars',
    content: `
      <h4>A dispatcher's earning potential</h4>
      <div class="profession-modal-list">
        <div class="profession-modal-item">
          <span class="item-icon">🌱</span>
          <div>
            <strong>Entry level (0-3 months)</strong>
            <p>$2,000-$3,000/mo — training and onboarding period</p>
          </div>
        </div>
        <div class="profession-modal-item">
          <span class="item-icon">📈</span>
          <div>
            <strong>Intermediate level (6-12 months)</strong>
            <p>$4,000-$6,000/mo — confident work with clients</p>
          </div>
        </div>
        <div class="profession-modal-item">
          <span class="item-icon">⭐</span>
          <div>
            <strong>Experienced dispatcher (2+ years)</strong>
            <p>$8,000-$12,000+/mo — managing a fleet of trucks</p>
          </div>
        </div>
        <div class="profession-modal-item">
          <span class="item-icon">💎</span>
          <div>
            <strong>Additional bonuses</strong>
            <p>Performance commissions, volume bonuses</p>
          </div>
        </div>
      </div>
      <div class="profession-modal-note">
        <p>💡 <strong>Important:</strong> Income depends on the number of trucks under management and your effectiveness at finding loads.</p>
      </div>
    `
  },
  remote: {
    icon: '🌍',
    title: 'Work From Anywhere',
    subtitle: 'Complete location freedom',
    content: `
      <h4>Work from wherever you want</h4>
      <div class="profession-modal-list">
        <div class="profession-modal-item">
          <span class="item-icon">🏠</span>
          <div>
            <strong>From home</strong>
            <p>Comfortable work in a home setting with no time wasted commuting</p>
          </div>
        </div>
        <div class="profession-modal-item">
          <span class="item-icon">✈️</span>
          <div>
            <strong>Travel</strong>
            <p>Work from any country in the world — all you need is internet</p>
          </div>
        </div>
        <div class="profession-modal-item">
          <span class="item-icon">☕</span>
          <div>
            <strong>Coworking</strong>
            <p>Choose a workspace that suits your mood</p>
          </div>
        </div>
        <div class="profession-modal-item">
          <span class="item-icon">💻</span>
          <div>
            <strong>Minimal requirements</strong>
            <p>A laptop, stable internet, and a phone — that's all you need</p>
          </div>
        </div>
      </div>
      <div class="profession-modal-note">
        <p>🌐 <strong>Freedom:</strong> No office required — work wherever you're comfortable and productive.</p>
      </div>
    `
  },
  schedule: {
    icon: '⏰',
    title: 'Flexible Schedule',
    subtitle: 'Manage your own time',
    content: `
      <h4>Choose a schedule that works for you</h4>
      <div class="profession-modal-list">
        <div class="profession-modal-item">
          <span class="item-icon">🌅</span>
          <div>
            <strong>Part-time</strong>
            <p>4-6 hours a day — perfect for getting started or combining with other work</p>
          </div>
        </div>
        <div class="profession-modal-item">
          <span class="item-icon">☀️</span>
          <div>
            <strong>Full-time</strong>
            <p>8-10 hours for maximum income and career growth</p>
          </div>
        </div>
        <div class="profession-modal-item">
          <span class="item-icon">🕐</span>
          <div>
            <strong>Choose your shift</strong>
            <p>Morning, afternoon, or evening — to fit your rhythm of life</p>
          </div>
        </div>
        <div class="profession-modal-item">
          <span class="item-icon">📅</span>
          <div>
            <strong>Weekends</strong>
            <p>Work on your own schedule and plan your time off in advance</p>
          </div>
        </div>
      </div>
      <div class="profession-modal-note">
        <p>⏱️ <strong>Balance:</strong> You decide when and how much to work — no rigid constraints.</p>
      </div>
    `
  },
  demand: {
    icon: '📊',
    title: 'Growing Demand',
    subtitle: 'A stable industry',
    content: `
      <h4>A profession with prospects</h4>
      <div class="profession-modal-list">
        <div class="profession-modal-item">
          <span class="item-icon">📦</span>
          <div>
            <strong>Market growth</strong>
            <p>E-commerce increases demand for freight every year</p>
          </div>
        </div>
        <div class="profession-modal-item">
          <span class="item-icon">👥</span>
          <div>
            <strong>Talent shortage</strong>
            <p>A constant need for qualified dispatchers</p>
          </div>
        </div>
        <div class="profession-modal-item">
          <span class="item-icon">🇺🇸</span>
          <div>
            <strong>Stability</strong>
            <p>Freight is the backbone of the US economy ($875B per year)</p>
          </div>
        </div>
        <div class="profession-modal-item">
          <span class="item-icon">🚀</span>
          <div>
            <strong>Prospects</strong>
            <p>Career growth to senior dispatcher or manager</p>
          </div>
        </div>
      </div>
      <div class="profession-modal-note">
        <p>📈 <strong>Future:</strong> A profession with long-term prospects and stable demand.</p>
      </div>
    `
  }
};

// Определяем мобильное устройство
function isMobile() {
  return window.innerWidth <= 768;
}

// Открытие модального окна или аккордеона
function openProfessionModal(type, evt) {
  const data = professionData[type];
  if (!data) return;

  if (isMobile()) {
    // На мобильных — аккордеон
    const card = (evt && evt.currentTarget) || document.querySelector(`.profession-card[onclick*="'${type}'"]`);
    if (!card) return;
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
