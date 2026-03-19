/**
 * Telegram Widget - Navbar Integration
 * Desktop: в меню навигации
 * Mobile: рядом с логотипом
 */

(function () {
  'use strict';

  const TELEGRAM_BOT = 'dispatch4you_bot';
  const TELEGRAM_URL = `https://t.me/${TELEGRAM_BOT}`;

  // Создание виджета
  function createTelegramWidget() {
    // Проверка, не создан ли уже виджет
    if (document.getElementById('telegram-nav-widget')) {
      return;
    }

    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // МОБИЛЬНАЯ ВЕРСИЯ - рядом с логотипом
      const logo = document.querySelector('.logo, .nav-logo, .site-logo, .brand-logo, a[href="index.html"], a[href="/"]');

      if (logo) {
        const telegramBtn = document.createElement('a');
        telegramBtn.href = TELEGRAM_URL;
        telegramBtn.target = '_blank';
        telegramBtn.rel = 'noopener noreferrer';
        telegramBtn.className = 'telegram-nav-btn mobile-logo';
        telegramBtn.id = 'telegram-nav-widget';
        telegramBtn.title = 'Telegram';
        telegramBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.67-.52.36-.99.53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.48 1.02-.73 3.99-1.73 6.65-2.87 7.98-3.43 3.8-1.58 4.59-1.85 5.1-1.86.11 0 .37.03.53.17.14.11.17.26.19.37.01.08.03.29.01.45z" fill="currentColor"/>
          </svg>
        `;

        // Вставляем после логотипа
        logo.parentNode.insertBefore(telegramBtn, logo.nextSibling);
      }
    } else {
      // ДЕСКТОП ВЕРСИЯ - в меню навигации
      const navActions = document.querySelector('.nav-actions');

      if (navActions) {
        const telegramBtn = document.createElement('a');
        telegramBtn.href = TELEGRAM_URL;
        telegramBtn.target = '_blank';
        telegramBtn.rel = 'noopener noreferrer';
        telegramBtn.className = 'telegram-nav-btn desktop';
        telegramBtn.id = 'telegram-nav-widget';
        telegramBtn.title = 'Написать в Telegram';
        telegramBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.67-.52.36-.99.53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.48 1.02-.73 3.99-1.73 6.65-2.87 7.98-3.43 3.8-1.58 4.59-1.85 5.1-1.86.11 0 .37.03.53.17.14.11.17.26.19.37.01.08.03.29.01.45z" fill="currentColor"/>
          </svg>
        `;

        // Вставляем перед кнопками входа/регистрации
        navActions.insertBefore(telegramBtn, navActions.firstChild);
      }
    }

    // Добавление стилей
    const style = document.createElement('style');
    style.textContent = `
      .telegram-nav-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #0088cc 0%, #0077b5 100%);
        color: white;
        border-radius: 50%;
        text-decoration: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 2px 8px rgba(0, 136, 204, 0.3);
        position: relative;
        overflow: hidden;
      }

      /* Desktop версия - в меню */
      .telegram-nav-btn.desktop {
        margin-right: 12px;
      }

      /* Mobile версия - рядом с логотипом */
      .telegram-nav-btn.mobile-logo {
        margin-left: 12px;
        width: 36px;
        height: 36px;
      }

      .telegram-nav-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        transition: left 0.5s;
      }

      .telegram-nav-btn:hover::before {
        left: 100%;
      }

      .telegram-nav-btn:hover {
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 4px 12px rgba(0, 136, 204, 0.4);
      }

      .telegram-nav-btn:active {
        transform: translateY(0) scale(0.98);
      }

      .telegram-nav-btn svg {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }

      .telegram-nav-btn.mobile-logo svg {
        width: 18px;
        height: 18px;
      }

      /* Пульсирующая анимация при загрузке */
      @keyframes pulse-telegram {
        0%, 100% {
          box-shadow: 0 2px 8px rgba(0, 136, 204, 0.3);
        }
        50% {
          box-shadow: 0 2px 8px rgba(0, 136, 204, 0.6), 0 0 0 4px rgba(0, 136, 204, 0.2);
        }
      }

      .telegram-nav-btn {
        animation: pulse-telegram 2s ease-in-out 3;
      }

      /* Адаптация для темной темы */
      [data-theme="dark"] .telegram-nav-btn {
        box-shadow: 0 2px 8px rgba(0, 136, 204, 0.4);
      }

      [data-theme="dark"] .telegram-nav-btn:hover {
        box-shadow: 0 4px 12px rgba(0, 136, 204, 0.6);
      }

      /* Дополнительная адаптация для мобильных */
      @media (max-width: 768px) {
        .telegram-nav-btn.desktop {
          display: none;
        }
      }

      @media (min-width: 769px) {
        .telegram-nav-btn.mobile-logo {
          display: none;
        }
      }
    `;

    document.head.appendChild(style);
  }

  // Инициализация при загрузке страницы
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createTelegramWidget);
  } else {
    createTelegramWidget();
  }

  // Повторная попытка через 1 секунду (если меню загружается динамически)
  setTimeout(createTelegramWidget, 1000);

  // Пересоздание при изменении размера окна
  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      const existingWidget = document.getElementById('telegram-nav-widget');
      if (existingWidget) {
        existingWidget.remove();
      }
      createTelegramWidget();
    }, 250);
  });

})();
