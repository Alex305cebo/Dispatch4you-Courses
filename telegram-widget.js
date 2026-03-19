/**
 * Telegram Web Widget Integration
 * Плавающая кнопка чата с Telegram ботом
 */

(function () {
    'use strict';

    const TELEGRAM_BOT = 'dispatch4you_bot';
    const TELEGRAM_URL = `https://t.me/${TELEGRAM_BOT}`;

    // Создание виджета
    function createTelegramWidget() {
        // Проверка, не создан ли уже виджет
        if (document.getElementById('telegram-widget')) {
            return;
        }

        // Создание контейнера
        const widget = document.createElement('div');
        widget.id = 'telegram-widget';
        widget.innerHTML = `
      <a href="${TELEGRAM_URL}" target="_blank" rel="noopener noreferrer" class="telegram-button" id="telegramBtn">
        <svg class="telegram-icon" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.67-.52.36-.99.53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.48 1.02-.73 3.99-1.73 6.65-2.87 7.98-3.43 3.8-1.58 4.59-1.85 5.1-1.86.11 0 .37.03.53.17.14.11.17.26.19.37.01.08.03.29.01.45z" fill="currentColor"/>
        </svg>
        <span class="telegram-text">Написать в Telegram</span>
        <span class="telegram-badge" id="telegramBadge">1</span>
      </a>
    `;

        // Добавление стилей
        const style = document.createElement('style');
        style.textContent = `
      #telegram-widget {
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 9999;
        animation: slideInUp 0.5s ease-out;
      }

      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(50px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .telegram-button {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 24px;
        background: linear-gradient(135deg, #0088cc 0%, #0077b5 100%);
        color: white;
        text-decoration: none;
        border-radius: 50px;
        box-shadow: 0 8px 24px rgba(0, 136, 204, 0.4);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 15px;
        font-weight: 600;
        position: relative;
        overflow: hidden;
      }

      .telegram-button::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        transition: left 0.5s;
      }

      .telegram-button:hover::before {
        left: 100%;
      }

      .telegram-button:hover {
        transform: translateY(-4px) scale(1.05);
        box-shadow: 0 12px 32px rgba(0, 136, 204, 0.5);
      }

      .telegram-button:active {
        transform: translateY(-2px) scale(1.02);
      }

      .telegram-icon {
        width: 24px;
        height: 24px;
        flex-shrink: 0;
      }

      .telegram-text {
        white-space: nowrap;
      }

      .telegram-badge {
        position: absolute;
        top: -6px;
        right: -6px;
        background: #ff3b30;
        color: white;
        font-size: 11px;
        font-weight: 700;
        padding: 4px 7px;
        border-radius: 12px;
        min-width: 20px;
        text-align: center;
        box-shadow: 0 2px 8px rgba(255, 59, 48, 0.4);
        animation: pulse 2s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.1);
        }
      }

      /* Мобильная версия */
      @media (max-width: 768px) {
        #telegram-widget {
          bottom: 20px;
          right: 20px;
        }

        .telegram-button {
          padding: 14px 20px;
          font-size: 14px;
        }

        .telegram-text {
          display: none;
        }

        .telegram-button {
          width: 56px;
          height: 56px;
          padding: 0;
          justify-content: center;
          border-radius: 50%;
        }

        .telegram-icon {
          width: 28px;
          height: 28px;
        }
      }

      /* Анимация при скролле */
      #telegram-widget.hidden {
        opacity: 0;
        transform: translateY(100px);
        pointer-events: none;
      }
    `;

        document.head.appendChild(style);
        document.body.appendChild(widget);

        // Скрытие при скролле вверх (опционально)
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > lastScroll && currentScroll > 100) {
                // Скролл вниз
                widget.classList.remove('hidden');
            }

            lastScroll = currentScroll;
        });

        // Анимация бейджа
        const badge = document.getElementById('telegramBadge');
        if (badge) {
            // Скрыть бейдж через 5 секунд
            setTimeout(() => {
                badge.style.animation = 'fadeOut 0.3s ease-out forwards';
                setTimeout(() => {
                    badge.style.display = 'none';
                }, 300);
            }, 5000);
        }

        // Добавление CSS для fadeOut
        const fadeOutStyle = document.createElement('style');
        fadeOutStyle.textContent = `
      @keyframes fadeOut {
        to {
          opacity: 0;
          transform: scale(0);
        }
      }
    `;
        document.head.appendChild(fadeOutStyle);
    }

    // Инициализация при загрузке страницы
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createTelegramWidget);
    } else {
        createTelegramWidget();
    }

})();
