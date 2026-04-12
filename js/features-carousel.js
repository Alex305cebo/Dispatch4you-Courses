// ========================================
// FEATURES CAROUSEL SYSTEM
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('.features-grid');
  const indicators = document.querySelectorAll('.carousel-indicator');
  const pauseBtn = document.querySelector('.carousel-pause-btn');
  const cards = document.querySelectorAll('.feature-card');
  
  if (!slider || !indicators.length) return;
  
  let currentPosition = 0;
  let isPaused = false;
  let autoScrollInterval;
  
  // Определяем количество карточек видимых одновременно
  function getVisibleCards() {
    const width = window.innerWidth;
    if (width >= 1200) return 3;
    if (width >= 768) return 2;
    return 1;
  }
  
  // Вычисляем позицию для скролла
  function getScrollPosition(index) {
    const cardWidth = cards[0].offsetWidth;
    const gap = 20;
    return index * (cardWidth + gap);
  }
  
  // Переход к позиции
  function goToPosition(index) {
    currentPosition = index;
    const scrollPos = getScrollPosition(index);
    slider.scrollTo({
      left: scrollPos,
      behavior: 'smooth'
    });
    
    // Обновляем индикаторы
    indicators.forEach((indicator, i) => {
      indicator.classList.toggle('active', i === index);
    });
  }
  
  // Автопрокрутка
  function startAutoScroll() {
    if (isPaused) return;
    
    autoScrollInterval = setInterval(() => {
      if (!isPaused) {
        currentPosition = (currentPosition + 1) % indicators.length;
        goToPosition(currentPosition);
      }
    }, 4000); // Каждые 4 секунды
  }
  
  function stopAutoScroll() {
    clearInterval(autoScrollInterval);
  }
  
  // Обработчики индикаторов
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      stopAutoScroll();
      goToPosition(index);
      if (!isPaused) {
        startAutoScroll();
      }
    });
  });
  
  // Обработчик кнопки паузы
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      isPaused = !isPaused;
      pauseBtn.classList.toggle('paused', isPaused);
      
      if (isPaused) {
        stopAutoScroll();
        // Меняем иконку на play
        pauseBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M8 5v14l11-7z"/>
          </svg>
        `;
      } else {
        startAutoScroll();
        // Меняем иконку на pause
        pauseBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <rect x="6" y="4" width="4" height="16" rx="1"/>
            <rect x="14" y="4" width="4" height="16" rx="1"/>
          </svg>
        `;
      }
    });
  }
  
  // Обработчик клика на карточки
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const link = card.getAttribute('data-link');
      if (link) {
        window.location.href = link;
      }
    });
  });
  
  // Обработчик скролла для обновления индикаторов
  let scrollTimeout;
  slider.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const scrollLeft = slider.scrollLeft;
      const cardWidth = cards[0].offsetWidth;
      const gap = 20;
      const newPosition = Math.round(scrollLeft / (cardWidth + gap));
      
      if (newPosition !== currentPosition && newPosition < indicators.length) {
        currentPosition = newPosition;
        indicators.forEach((indicator, i) => {
          indicator.classList.toggle('active', i === newPosition);
        });
      }
    }, 100);
  });
  
  // Пауза при наведении на карусель
  slider.addEventListener('mouseenter', () => {
    if (!isPaused) {
      stopAutoScroll();
    }
  });
  
  slider.addEventListener('mouseleave', () => {
    if (!isPaused) {
      startAutoScroll();
    }
  });
  
  // Запуск автопрокрутки
  startAutoScroll();
  
  // Остановка при изменении размера окна
  window.addEventListener('resize', () => {
    stopAutoScroll();
    goToPosition(0);
    if (!isPaused) {
      startAutoScroll();
    }
  });
});
