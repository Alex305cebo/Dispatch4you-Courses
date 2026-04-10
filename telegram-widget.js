/**
 * Telegram Widget - Disabled
 * Кнопка Телеграм отключена
 */

(function () {
  'use strict';

  // Удаляем кнопку Телеграм из навигации
  function removeTelegramButton() {
    const telegramBtns = document.querySelectorAll('.telegram-nav-btn, #telegram-nav-widget, #telegram-footer-widget');
    telegramBtns.forEach(btn => {
      if (btn) {
        btn.remove();
        console.log('Telegram button removed');
      }
    });

    // Добавляем стили для скрытия кнопки
    const style = document.createElement('style');
    style.textContent = `
      .telegram-nav-btn,
      #telegram-nav-widget,
      #telegram-footer-widget {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Инициализация при загрузке страницы
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeTelegramButton);
  } else {
    removeTelegramButton();
  }

  // Повторная попытка через 1 секунду
  setTimeout(removeTelegramButton, 1000);
  
  // Ещё одна попытка через 2 секунды
  setTimeout(removeTelegramButton, 2000);

})();
