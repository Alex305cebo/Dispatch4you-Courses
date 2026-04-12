// ========================================
// BENEFITS MODAL SYSTEM
// ========================================

const benefitData = {
  practice: {
    icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>',
    title: 'Реальная Практика',
    subtitle: 'AI-симулятор переговоров с брокерами',
    stats: [
      { value: '1,247', label: 'Диалогов отработано' },
      { value: '87%', label: 'Успешных сделок' },
      { value: '24/7', label: 'Доступность AI' }
    ],
    features: [
      {
        icon: '🤖',
        title: 'AI-симулятор',
        description: 'Интерактивные диалоги с брокерами различной сложности и характера'
      },
      {
        icon: '📈',
        title: 'Отслеживание прогресса',
        description: 'Детальная статистика ваших результатов и рекомендации'
      },
      {
        icon: '💡',
        title: 'Реальные кейсы',
        description: 'Сценарии основаны на настоящих ситуациях из индустрии'
      },
      {
        icon: '📚',
        title: 'Обратная связь',
        description: 'Мгновенный анализ ваших действий и советы по улучшению'
      }
    ],
    ctaText: 'Попробовать AI-симулятор',
    ctaLink: 'pages/ai-broker-chat.html'
  },
  mentor: {
    icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
    title: 'Менторская Поддержка',
    subtitle: 'Консультации с действующими диспетчерами',
    stats: [
      { value: '24/7', label: 'Поддержка' },
      { value: '15+', label: 'Менторов' },
      { value: '<2ч', label: 'Время ответа' }
    ],
    features: [
      {
        icon: '👨‍🏫',
        title: 'Опытные наставники',
        description: 'Менторы с опытом работы от 3 лет в индустрии грузоперевозок США'
      },
      {
        icon: '💬',
        title: 'Личные консультации',
        description: 'Индивидуальные сессии для разбора ваших вопросов и ситуаций'
      },
      {
        icon: '🎯',
        title: 'Разбор ошибок',
        description: 'Анализ ваших действий и рекомендации по улучшению навыков'
      },
      {
        icon: '🤝',
        title: 'Комьюнити',
        description: 'Доступ к закрытому чату с другими студентами и менторами'
      }
    ],
    ctaText: 'Связаться с ментором',
    ctaLink: 'contacts.html'
  },
  career: {
    icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>',
    title: 'Подготовка к Карьере',
    subtitle: 'Помощь в трудоустройстве и развитии',
    stats: [
      { value: '85%', label: 'Трудоустроены' },
      { value: '30+', label: 'Партнёров' },
      { value: '$3K+', label: 'Средний доход' }
    ],
    features: [
      {
        icon: '📝',
        title: 'Составление резюме',
        description: 'Помощь в создании профессионального резюме для рынка США'
      },
      {
        icon: '🎤',
        title: 'Подготовка к интервью',
        description: 'Тренировка ответов на типичные вопросы работодателей'
      },
      {
        icon: '🔍',
        title: 'Поиск вакансий',
        description: 'Доступ к базе проверенных компаний и актуальных вакансий'
      },
      {
        icon: '⭐',
        title: 'Рекомендации',
        description: 'Получите рекомендательные письма от наших менторов'
      }
    ],
    ctaText: 'Узнать больше о карьере',
    ctaLink: 'career.html'
  },
  docs: {
    icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    title: 'Полная Документация',
    subtitle: 'Все документы грузоперевозок с примерами',
    stats: [
      { value: '20+', label: 'Типов документов' },
      { value: '100+', label: 'Примеров' },
      { value: '∞', label: 'Доступ навсегда' }
    ],
    features: [
      {
        icon: '📄',
        title: 'Rate Confirmation',
        description: 'Подробный разбор контракта с брокером и всех его пунктов'
      },
      {
        icon: '📋',
        title: 'BOL & POD',
        description: 'Коносамент и подтверждение доставки с примерами заполнения'
      },
      {
        icon: '💰',
        title: 'Invoice & Payment',
        description: 'Счета, квитанции и документы для оплаты перевозок'
      },
      {
        icon: '📊',
        title: 'Carrier Packet',
        description: 'Полный пакет документов перевозчика для работы с брокерами'
      }
    ],
    ctaText: 'Смотреть документы',
    ctaLink: 'pages/docs.html'
  },
  audio: {
    icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/></svg>',
    title: 'Аудио-Обучение',
    subtitle: 'Все материалы в аудио-формате',
    stats: [
      { value: '50+', label: 'Аудио-уроков' },
      { value: '20ч', label: 'Контента' },
      { value: '🎧', label: 'Учитесь везде' }
    ],
    features: [
      {
        icon: '🎙️',
        title: 'Профессиональная озвучка',
        description: 'Все материалы озвучены профессиональными дикторами'
      },
      {
        icon: '📱',
        title: 'Мобильное приложение',
        description: 'Слушайте уроки в дороге, на прогулке или в спортзале'
      },
      {
        icon: '⚡',
        title: 'Скорость воспроизведения',
        description: 'Регулируйте скорость от 0.5x до 2x для удобства'
      },
      {
        icon: '💾',
        title: 'Офлайн доступ',
        description: 'Скачивайте уроки и слушайте без интернета'
      }
    ],
    ctaText: 'Послушать примеры',
    ctaLink: 'pages/documentation.html'
  },
  updates: {
    icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/></svg>',
    title: 'Постоянные Обновления',
    subtitle: 'Актуальная информация о правилах и трендах',
    stats: [
      { value: '2x', label: 'В месяц' },
      { value: '100%', label: 'Бесплатно' },
      { value: '🔔', label: 'Уведомления' }
    ],
    features: [
      {
        icon: '📰',
        title: 'Новости индустрии',
        description: 'Актуальные изменения в законодательстве и правилах перевозок'
      },
      {
        icon: '📊',
        title: 'Рыночные тренды',
        description: 'Анализ ставок, спроса и предложения на рынке грузоперевозок'
      },
      {
        icon: '🎓',
        title: 'Новые материалы',
        description: 'Регулярное добавление новых уроков и практических кейсов'
      },
      {
        icon: '🔧',
        title: 'Улучшения платформы',
        description: 'Постоянное развитие функционала и добавление новых инструментов'
      }
    ],
    ctaText: 'Смотреть обновления',
    ctaLink: 'course.html'
  }
};

function openBenefitModal(benefitType) {
  const modal = document.getElementById('benefitModal');
  const modalContent = document.getElementById('modalContent');
  const data = benefitData[benefitType];

  if (!data) return;

  // Generate stats HTML
  const statsHTML = data.stats.map(stat => `
    <div class="modal-stat">
      <div class="modal-stat-value">${stat.value}</div>
      <div class="modal-stat-label">${stat.label}</div>
    </div>
  `).join('');

  // Generate features HTML
  const featuresHTML = data.features.map(feature => `
    <div class="modal-feature">
      <div class="modal-feature-icon">${feature.icon}</div>
      <div class="modal-feature-content">
        <h4>${feature.title}</h4>
        <p>${feature.description}</p>
      </div>
    </div>
  `).join('');

  // Build modal content
  modalContent.innerHTML = `
    <div class="modal-header">
      <div class="modal-icon">${data.icon}</div>
      <h2 class="modal-title">${data.title}</h2>
      <p class="modal-subtitle">${data.subtitle}</p>
    </div>

    <div class="modal-stats">
      ${statsHTML}
    </div>

    <div class="modal-features">
      ${featuresHTML}
    </div>

    <div class="modal-cta">
      <a href="${data.ctaLink}" class="modal-btn">
        <span>${data.ctaText}</span>
        <span>→</span>
      </a>
    </div>
  `;

  // Show modal
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeBenefitModal() {
  const modal = document.getElementById('benefitModal');
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// Close on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeBenefitModal();
  }
});
