/**
 * Access Control System v1.0
 * Система контроля доступа к курсам
 */

// Правила доступа по подпискам
const ACCESS_RULES = {
    free: {
        modules: [1],
        features: {
            simulator: { limit: 0 },
            loadFinder: { limit: 5 },
            tests: false,
            certificates: false,
            dispatcherCards: false
        }
    },
    trial: {
        modules: [1, 2, 3],
        features: {
            simulator: { limit: 10 },
            loadFinder: { limit: 20 },
            tests: true,
            certificates: false,
            dispatcherCards: false
        }
    },
    basic: {
        modules: [1, 2, 3, 4, 5],
        features: {
            simulator: { limit: 50 },
            loadFinder: { limit: 100 },
            tests: true,
            certificates: false,
            dispatcherCards: false
        }
    },
    pro: {
        modules: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        features: {
            simulator: { limit: -1 }, // unlimited
            loadFinder: { limit: -1 },
            tests: true,
            certificates: true,
            dispatcherCards: { basic: true }
        }
    },
    premium: {
        modules: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        features: {
            simulator: { limit: -1 },
            loadFinder: { limit: -1 },
            tests: true,
            certificates: true,
            dispatcherCards: { full: true },
            mentor: true,
            jobAssistance: true
        }
    }
};

/**
 * Проверка доступа к модулю
 * @param {string} subscriptionType - Тип подписки (free, trial, basic, pro, premium)
 * @param {number} moduleNumber - Номер модуля (1-10)
 * @returns {boolean} - Есть ли доступ
 */
function hasModuleAccess(subscriptionType, moduleNumber) {
    const subscription = subscriptionType || 'free';
    const rules = ACCESS_RULES[subscription] || ACCESS_RULES.free;
    return rules.modules.includes(moduleNumber);
}

/**
 * Проверка доступа к сектору
 * @param {string} subscriptionType - Тип подписки
 * @param {number} moduleNumber - Номер модуля
 * @param {number} sectorNumber - Номер сектора
 * @returns {boolean} - Есть ли доступ
 */
function hasSectorAccess(subscriptionType, moduleNumber, sectorNumber) {
    // Первый сектор каждого модуля доступен всем (preview)
    if (sectorNumber === 1) {
        return true;
    }

    // Для остальных секторов проверяем доступ к модулю
    return hasModuleAccess(subscriptionType, moduleNumber);
}

/**
 * Проверка доступа к функции
 * @param {string} subscriptionType - Тип подписки
 * @param {string} featureName - Название функции
 * @returns {boolean|object} - Есть ли доступ или объект с лимитами
 */
function hasFeatureAccess(subscriptionType, featureName) {
    const subscription = subscriptionType || 'free';
    const rules = ACCESS_RULES[subscription] || ACCESS_RULES.free;
    return rules.features[featureName] || false;
}

/**
 * Получить список доступных модулей
 * @param {string} subscriptionType - Тип подписки
 * @returns {number[]} - Массив номеров доступных модулей
 */
function getAvailableModules(subscriptionType) {
    const subscription = subscriptionType || 'free';
    const rules = ACCESS_RULES[subscription] || ACCESS_RULES.free;
    return rules.modules;
}

/**
 * Получить требуемую подписку для модуля
 * @param {number} moduleNumber - Номер модуля
 * @returns {string} - Минимальная требуемая подписка
 */
function getRequiredSubscription(moduleNumber) {
    if (moduleNumber === 1) return 'free';
    if (moduleNumber <= 3) return 'trial';
    if (moduleNumber <= 5) return 'basic';
    return 'pro';
}

/**
 * Проверка истек ли trial период
 * @param {string} trialEndDate - Дата окончания trial (ISO string)
 * @returns {boolean} - Истек ли trial
 */
function isTrialExpired(trialEndDate) {
    if (!trialEndDate) return true;
    return new Date(trialEndDate) < new Date();
}

/**
 * Проверка активна ли подписка
 * @param {object} subscription - Объект подписки
 * @returns {boolean} - Активна ли подписка
 */
function isSubscriptionActive(subscription) {
    if (!subscription) return false;

    // Проверка статуса
    if (subscription.status !== 'active') return false;

    // Проверка даты окончания
    if (subscription.endDate) {
        return new Date(subscription.endDate) > new Date();
    }

    return true;
}

/**
 * Получить эффективный тип подписки с учетом trial
 * @param {object} userData - Данные пользователя из Firestore
 * @returns {string} - Эффективный тип подписки
 */
function getEffectiveSubscription(userData) {
    if (!userData) return 'free';

    // Проверяем активную подписку
    if (userData.subscription && isSubscriptionActive(userData.subscription)) {
        return userData.subscription.type;
    }

    // Проверяем trial
    if (userData.trial && userData.trial.active && !isTrialExpired(userData.trial.endDate)) {
        return 'trial';
    }

    // По умолчанию free
    return 'free';
}

/**
 * Показать paywall (блокировку контента)
 * @param {number} moduleNumber - Номер модуля
 * @param {string} currentSubscription - Текущая подписка
 */
function showPaywall(moduleNumber, currentSubscription) {
    const requiredSubscription = getRequiredSubscription(moduleNumber);

    const paywallHTML = `
    <div class="paywall-overlay" id="paywallOverlay">
      <div class="paywall-modal">
        <button class="paywall-close" onclick="closePaywall()">✕</button>
        <div class="paywall-icon">🔒</div>
        <h2>Этот модуль доступен в ${requiredSubscription.toUpperCase()}</h2>
        <p>Модуль ${moduleNumber} требует подписку <strong>${requiredSubscription.toUpperCase()}</strong> или выше.</p>
        <p>Ваша текущая подписка: <strong>${currentSubscription.toUpperCase()}</strong></p>
        <div class="paywall-actions">
          <a href="pricing.html" class="btn-upgrade">Обновить подписку</a>
          <button onclick="closePaywall()" class="btn-cancel">Отмена</button>
        </div>
      </div>
    </div>
  `;

    // Добавляем paywall в body если его еще нет
    if (!document.getElementById('paywallOverlay')) {
        document.body.insertAdjacentHTML('beforeend', paywallHTML);
    }
}

/**
 * Закрыть paywall
 */
function closePaywall() {
    const paywall = document.getElementById('paywallOverlay');
    if (paywall) {
        paywall.remove();
    }
}

/**
 * Добавить locked badge к элементу
 * @param {HTMLElement} element - Элемент для блокировки
 * @param {string} requiredPlan - Требуемая подписка
 */
function addLockedBadge(element, requiredPlan) {
    const badge = document.createElement('div');
    badge.className = 'locked-badge';
    badge.innerHTML = `🔒 ${requiredPlan.toUpperCase()}`;
    element.style.position = 'relative';
    element.appendChild(badge);

    // Добавляем blur эффект
    element.style.filter = 'blur(3px)';
    element.style.pointerEvents = 'none';
    element.style.userSelect = 'none';
}

/**
 * Защитить страницу модуля
 * @param {number} moduleNumber - Номер модуля
 * @param {object} userData - Данные пользователя
 */
async function protectModulePage(moduleNumber, userData) {
    const subscription = getEffectiveSubscription(userData);

    if (!hasModuleAccess(subscription, moduleNumber)) {
        // Показываем paywall
        showPaywall(moduleNumber, subscription);

        // Блокируем контент
        const content = document.querySelector('.module-content');
        if (content) {
            content.style.filter = 'blur(5px)';
            content.style.pointerEvents = 'none';
        }

        return false;
    }

    return true;
}

/**
 * Инициализация системы контроля доступа
 */
async function initAccessControl() {
    console.log('🔐 Access Control System initialized');

    // Добавляем CSS для paywall
    const style = document.createElement('style');
    style.textContent = `
    .paywall-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .paywall-modal {
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 24px;
      padding: 48px;
      max-width: 500px;
      text-align: center;
      position: relative;
      animation: slideUp 0.3s ease;
    }
    
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    .paywall-close {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 24px;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      transition: all 0.2s;
    }
    
    .paywall-close:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #f1f5f9;
    }
    
    .paywall-icon {
      font-size: 64px;
      margin-bottom: 24px;
    }
    
    .paywall-modal h2 {
      color: #f1f5f9;
      margin-bottom: 16px;
      font-size: 28px;
    }
    
    .paywall-modal p {
      color: #94a3b8;
      margin-bottom: 12px;
      font-size: 16px;
    }
    
    .paywall-actions {
      display: flex;
      gap: 12px;
      margin-top: 32px;
      justify-content: center;
    }
    
    .btn-upgrade {
      padding: 14px 32px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      text-decoration: none;
      border-radius: 12px;
      font-weight: 700;
      transition: all 0.3s;
    }
    
    .btn-upgrade:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 24px rgba(99, 102, 241, 0.4);
    }
    
    .btn-cancel {
      padding: 14px 32px;
      background: rgba(255, 255, 255, 0.05);
      color: #94a3b8;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .btn-cancel:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #f1f5f9;
    }
    
    .locked-badge {
      position: absolute;
      top: 16px;
      right: 16px;
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #fca5a5;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      z-index: 10;
    }
  `;
    document.head.appendChild(style);
}

// Экспорт функций
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        hasModuleAccess,
        hasSectorAccess,
        hasFeatureAccess,
        getAvailableModules,
        getRequiredSubscription,
        getEffectiveSubscription,
        isTrialExpired,
        isSubscriptionActive,
        showPaywall,
        closePaywall,
        addLockedBadge,
        protectModulePage,
        initAccessControl,
        ACCESS_RULES
    };
}

// Инициализация при загрузке
if (typeof window !== 'undefined') {
    window.AccessControl = {
        hasModuleAccess,
        hasSectorAccess,
        hasFeatureAccess,
        getAvailableModules,
        getRequiredSubscription,
        getEffectiveSubscription,
        isTrialExpired,
        isSubscriptionActive,
        showPaywall,
        closePaywall,
        addLockedBadge,
        protectModulePage,
        initAccessControl,
        ACCESS_RULES
    };

    // Автоматическая инициализация
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAccessControl);
    } else {
        initAccessControl();
    }
}
