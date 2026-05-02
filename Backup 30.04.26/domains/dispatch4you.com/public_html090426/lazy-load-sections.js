/**
 * Lazy Loading для секций модулей
 * Оптимизация производительности через Intersection Observer
 */

class LazyLoadSections {
    constructor(options = {}) {
        this.options = {
            rootMargin: options.rootMargin || '50px',
            threshold: options.threshold || 0.1,
            animationClass: options.animationClass || 'fade-in-up',
            ...options
        };

        this.observer = null;
        this.init();
    }

    init() {
        // Проверка поддержки Intersection Observer
        if (!('IntersectionObserver' in window)) {
            this.fallback();
            return;
        }

        // Создание observer
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            {
                rootMargin: this.options.rootMargin,
                threshold: this.options.threshold
            }
        );

        // Наблюдение за элементами
        this.observeElements();
    }

    observeElements() {
        // Основные секции для lazy load
        const selectors = [
            '.sector',
            '.case-study',
            '.quiz-container',
            '.module-card',
            '.progress-section',
            '.navigation-buttons'
        ];

        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                // Добавляем класс для скрытия
                el.classList.add('lazy-hidden');
                // Начинаем наблюдение
                this.observer.observe(el);
            });
        });
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Элемент появился в viewport
                const element = entry.target;

                // Добавляем анимацию
                element.classList.remove('lazy-hidden');
                element.classList.add(this.options.animationClass);

                // Прекращаем наблюдение за этим элементом
                this.observer.unobserve(element);

                // Триггер для дополнительной логики
                this.onElementVisible(element);
            }
        });
    }

    onElementVisible(element) {
        // Загрузка изображений
        const images = element.querySelectorAll('img[data-src]');
        images.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });

        // Инициализация аудио только когда видно
        const audioButtons = element.querySelectorAll('.audio-btn');
        audioButtons.forEach(btn => {
            if (!btn.dataset.initialized) {
                btn.dataset.initialized = 'true';
                // Аудио инициализируется по клику, здесь просто помечаем
            }
        });

        // Emit custom event
        element.dispatchEvent(new CustomEvent('lazyLoaded', {
            bubbles: true,
            detail: { element }
        }));
    }

    fallback() {
        // Для старых браузеров - показываем все сразу
        const elements = document.querySelectorAll('.lazy-hidden');
        elements.forEach(el => {
            el.classList.remove('lazy-hidden');
            el.classList.add('fade-in-up');
        });
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

// CSS стили для анимаций
const lazyLoadStyles = `
<style>
/* Скрытие элементов до загрузки */
.lazy-hidden {
    opacity: 0;
    transform: translateY(30px);
    transition: none;
}

/* Анимация появления */
.fade-in-up {
    animation: fadeInUp 0.6s ease-out forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Разные задержки для последовательного появления */
.sector:nth-child(1) { animation-delay: 0s; }
.sector:nth-child(2) { animation-delay: 0.1s; }
.sector:nth-child(3) { animation-delay: 0.2s; }
.sector:nth-child(4) { animation-delay: 0.3s; }
.sector:nth-child(5) { animation-delay: 0.4s; }
.sector:nth-child(6) { animation-delay: 0.5s; }

/* Оптимизация производительности */
.lazy-hidden * {
    pointer-events: none;
}

.fade-in-up * {
    pointer-events: auto;
}

/* Плавная загрузка изображений */
img[data-src] {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
}

@keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

/* Адаптивность */
@media (max-width: 768px) {
    .lazy-hidden {
        transform: translateY(20px);
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
}

/* Reduce motion для accessibility */
@media (prefers-reduced-motion: reduce) {
    .lazy-hidden,
    .fade-in-up {
        animation: none !important;
        transition: opacity 0.3s ease;
    }
    
    .fade-in-up {
        opacity: 1;
        transform: none;
    }
}
</style>
`;

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    // Добавляем стили
    document.head.insertAdjacentHTML('beforeend', lazyLoadStyles);

    // Инициализируем lazy loading
    window.lazyLoader = new LazyLoadSections({
        rootMargin: '100px',
        threshold: 0.1,
        animationClass: 'fade-in-up'
    });

    console.log('✅ Lazy loading initialized');
});

// Export для использования в других скриптах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LazyLoadSections;
}
