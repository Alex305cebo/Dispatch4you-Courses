// Конфигурация для frontend
// Автоматически определяет API URL в зависимости от окружения

const CONFIG = {
  // API Base URL
  API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : window.location.origin,
  
  // Google OAuth Client ID
  // Замените на ваш Client ID после настройки в Google Cloud Console
  GOOGLE_CLIENT_ID: '1234567890-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com',
  
  // Настройки приложения
  APP_NAME: 'Курсы Диспетчера',
  APP_VERSION: '1.0.0',
  
  // Таймауты
  REQUEST_TIMEOUT: 30000, // 30 секунд
  
  // Локальное хранилище
  STORAGE_KEYS: {
    AUTH_TOKEN: 'authToken',
    USER: 'user',
    THEME: 'theme'
  }
};

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
