// ========================================
// FEATURES CAROUSEL SYSTEM - Simplified
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('.features-grid');
  const firstBtn = document.querySelector('[data-action="first"]');
  const lastBtn = document.querySelector('[data-action="last"]');
  const cards = document.querySelectorAll('.feature-card');
  
  if (!slider || !firstBtn || !lastBtn || !cards.length) return;
  
  // Переход к первой карточке
  function goToFirst() {
    slider.scrollTo({
      left: 0,
      behavior: 'smooth'
    });
  }
  
  // Переход к последней карточке
  function goToLast() {
    const lastCard = cards[cards.length - 1];
    const scrollPos = lastCard.offsetLeft - slider.offsetLeft;
    
    slider.scrollTo({
      left: scrollPos,
      behavior: 'smooth'
    });
  }
  
  // Обработчики кнопок
  firstBtn.addEventListener('click', goToFirst);
  lastBtn.addEventListener('click', goToLast);
  
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
    if (e.key === 'Home') {
      e.preventDefault();
      goToFirst();
    } else if (e.key === 'End') {
      e.preventDefault();
      goToLast();
    }
  });
});
