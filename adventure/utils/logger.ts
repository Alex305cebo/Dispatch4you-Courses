/**
 * Утилита для условного логирования
 * В production режиме логи отключены для производительности
 */

const IS_DEV = process.env.NODE_ENV === 'development' || typeof window !== 'undefined' && window.location.hostname === 'localhost';

export const logger = {
  log: (...args: any[]) => {
    if (IS_DEV) console.log(...args);
  },
  warn: (...args: any[]) => {
    if (IS_DEV) console.warn(...args);
  },
  error: (...args: any[]) => {
    // Ошибки показываем всегда
    console.error(...args);
  },
  info: (...args: any[]) => {
    if (IS_DEV) console.info(...args);
  },
};
