// ========================================
// FEATURES CAROUSEL SYSTEM - Two Buttons
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('.features-grid');
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');
  const cards = document.querySelectorAll('.feature-card');
  
  if (!slider || !prevBtn || !nextBtn || !cards.length) return;
  
  // Переход к первой карточке
  function goToFirst() {
    slider.scrollTo({
      left: 0,
      behavior: 'smooth'
    });
  }
  
  // Переход к последней карточке
  function goToLast() {
    // Вычисляем позицию последней карточки
    const lastCard = cards[cards.length - 1];
    const containerWidth = slider.offsetWidth;
    const cardRight = lastCard.offsetLeft + lastCard.offsetWidth;
    const scrollPos = Math.max(0, cardRight - containerWidth);
    
    slider.scrollTo({
      left: scrollPos,
      behavior: 'smooth'
    });
  }
  
  // Обработчики кнопок
  prevBtn.addEventListener('click', (e) => {
    e.preventDefault();
    goToFirst();
  });
  
  nextBtn.addEventListener('click', (e) => {
    e.preventDefault();
    goToLast();
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
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    // Проверяем что фокус не в input/textarea
    if (document.activeElement.tagName === 'INPUT' || 
        document.activeElement.tagName === 'TEXTAREA') {
      return;
    }
    
    if (e.key === 'ArrowLeft' || e.key === 'Home') {
      e.preventDefault();
      goToFirst();
    } else if (e.key === 'ArrowRight' || e.key === 'End') {
      e.preventDefault();
      goToLast();
    }
  });
});
