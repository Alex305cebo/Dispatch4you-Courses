// ========================================
// FEATURES CAROUSEL - Циклическое переключение
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('.features-grid');
  const prevBtn = document.querySelector('.carousel-btn-prev');
  const nextBtn = document.querySelector('.carousel-btn-next');
  const cards = document.querySelectorAll('.feature-card');
  
  if (!slider || !prevBtn || !nextBtn || !cards.length) {
    console.error('Carousel elements not found');
    return;
  }
  
  let currentIndex = 0;
  const totalCards = cards.length;
  
  // Получаем количество видимых карточек
  function getVisibleCount() {
    const width = window.innerWidth;
    if (width >= 1200) return 3;
    if (width >= 768) return 2;
    return 1;
  }
  
  // Вычисляем максимальный индекс
  function getMaxIndex() {
    return Math.max(0, totalCards - getVisibleCount());
  }
  
  // Прокрутка к карточке по индексу
  function scrollToCard(index) {
    const card = cards[index];
    if (!card) return;
    
    const cardWidth = card.offsetWidth;
    const gap = 20; // gap между карточками
    const scrollPosition = index * (cardWidth + gap);
    
    slider.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
    
    currentIndex = index;
  }
  
  // Следующая карточка (циклически)
  function nextCard() {
    const maxIndex = getMaxIndex();
    
    if (currentIndex >= maxIndex) {
      // Если на последней позиции - возвращаемся к началу
      currentIndex = 0;
    } else {
      currentIndex++;
    }
    
    scrollToCard(currentIndex);
  }
  
  // Предыдущая карточка (циклически)
  function prevCard() {
    const maxIndex = getMaxIndex();
    
    if (currentIndex <= 0) {
      // Если на первой позиции - переходим к концу
      currentIndex = maxIndex;
    } else {
      currentIndex--;
    }
    
    scrollToCard(currentIndex);
  }
  
  // Обработчики кнопок
  prevBtn.addEventListener('click', (e) => {
    e.preventDefault();
    prevCard();
  });
  
  nextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    nextCard();
  });
  
  // Обработчик клика на карточки
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const link = card.getAttribute('data-link');
      if (link) {
        window.location.href = link;
      }
    });
  });
  
  // Клавиатурная навигация
  document.addEventListener('keydown', (e) => {
    // Игнорируем если фокус в input/textarea
    if (document.activeElement.tagName === 'INPUT' || 
        document.activeElement.tagName === 'TEXTAREA') {
      return;
    }
    
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevCard();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextCard();
    }
  });
  
  // Обновление при изменении размера окна
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Корректируем текущий индекс если нужно
      const maxIndex = getMaxIndex();
      if (currentIndex > maxIndex) {
        currentIndex = maxIndex;
      }
      scrollToCard(currentIndex);
    }, 250);
  });
  
  // Touch swipe support
  let touchStartX = 0;
  let touchEndX = 0;
  
  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  slider.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swipe left - next
        nextCard();
      } else {
        // Swipe right - prev
        prevCard();
      }
    }
  }
  
  console.log('Carousel initialized:', {
    totalCards,
    currentIndex,
    visibleCount: getVisibleCount()
  });
});
