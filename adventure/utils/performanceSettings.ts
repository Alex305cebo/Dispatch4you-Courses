/**
 * Performance Settings - Настройки производительности
 * Автоматически определяет возможности устройства и настраивает качество графики
 */

import { Platform } from 'react-native';

export type GraphicsQuality = 'low' | 'medium' | 'high' | 'auto';

export interface PerformanceSettings {
  tickInterval: number;           // Частота обновления игры (ms)
  mapQuality: 'low' | 'medium' | 'high';
  animationsEnabled: boolean;     // Включить анимации
  shadowsEnabled: boolean;        // Включить тени
  particlesEnabled: boolean;      // Включить частицы/эффекты
  maxVisibleTrucks: number;       // Максимум траков на карте одновременно
  mapUpdateThrottle: number;      // Задержка обновления карты (ms)
}

// Предустановки качества
const QUALITY_PRESETS: Record<Exclude<GraphicsQuality, 'auto'>, PerformanceSettings> = {
  low: {
    tickInterval: 1000,           // 1 обновление в секунду
    mapQuality: 'low',
    animationsEnabled: false,
    shadowsEnabled: false,
    particlesEnabled: false,
    maxVisibleTrucks: 3,
    mapUpdateThrottle: 1000,
  },
  medium: {
    tickInterval: 500,            // 2 обновления в секунду
    mapQuality: 'medium',
    animationsEnabled: true,
    shadowsEnabled: false,
    particlesEnabled: false,
    maxVisibleTrucks: 5,
    mapUpdateThrottle: 500,
  },
  high: {
    tickInterval: 250,            // 4 обновления в секунду
    mapQuality: 'high',
    animationsEnabled: true,
    shadowsEnabled: true,
    particlesEnabled: true,
    maxVisibleTrucks: 10,
    mapUpdateThrottle: 250,
  },
};

/**
 * Определить является ли устройство слабым
 */
export function isLowEndDevice(): boolean {
  if (Platform.OS === 'web') {
    // Проверяем количество ядер процессора
    const cores = (navigator as any).hardwareConcurrency || 2;
    if (cores < 4) return true;
    
    // Проверяем память (если доступно)
    const memory = (navigator as any).deviceMemory;
    if (memory && memory < 4) return true;
    
    // Проверяем connection (если медленный интернет)
    const connection = (navigator as any).connection;
    if (connection && connection.effectiveType === 'slow-2g') return true;
    if (connection && connection.effectiveType === '2g') return true;
    
    return false;
  }
  
  // Для мобильных - считаем что все устройства средней мощности
  // (точное определение требует нативных модулей)
  return false;
}

/**
 * Определить является ли устройство мощным
 */
export function isHighEndDevice(): boolean {
  if (Platform.OS === 'web') {
    const cores = (navigator as any).hardwareConcurrency || 2;
    const memory = (navigator as any).deviceMemory;
    
    // 8+ ядер и 8+ GB RAM = мощное устройство
    return cores >= 8 && (!memory || memory >= 8);
  }
  
  return false;
}

/**
 * Автоматически определить оптимальное качество графики
 */
export function detectOptimalQuality(): Exclude<GraphicsQuality, 'auto'> {
  if (isLowEndDevice()) {
    console.log('🐌 Обнаружено слабое устройство - используем LOW качество');
    return 'low';
  }
  
  if (isHighEndDevice()) {
    console.log('🚀 Обнаружено мощное устройство - используем HIGH качество');
    return 'high';
  }
  
  console.log('⚡ Обнаружено среднее устройство - используем MEDIUM качество');
  return 'medium';
}

/**
 * Получить настройки производительности для заданного качества
 */
export function getPerformanceSettings(quality: GraphicsQuality = 'auto'): PerformanceSettings {
  const actualQuality = quality === 'auto' ? detectOptimalQuality() : quality;
  return QUALITY_PRESETS[actualQuality];
}

/**
 * Сохранить выбранное качество в localStorage
 */
export function saveQualitySetting(quality: GraphicsQuality): void {
  try {
    localStorage.setItem('dispatch-graphics-quality', quality);
    console.log(`💾 Сохранено качество графики: ${quality}`);
  } catch (e) {
    console.warn('Не удалось сохранить настройки качества', e);
  }
}

/**
 * Загрузить сохранённое качество из localStorage
 */
export function loadQualitySetting(): GraphicsQuality {
  try {
    const saved = localStorage.getItem('dispatch-graphics-quality') as GraphicsQuality;
    if (saved && ['low', 'medium', 'high', 'auto'].includes(saved)) {
      console.log(`📂 Загружено качество графики: ${saved}`);
      return saved;
    }
  } catch (e) {
    console.warn('Не удалось загрузить настройки качества', e);
  }
  
  return 'auto';
}

/**
 * Получить текущие настройки производительности (с учётом сохранённых)
 */
export function getCurrentPerformanceSettings(): PerformanceSettings {
  const quality = loadQualitySetting();
  return getPerformanceSettings(quality);
}

/**
 * Получить описание качества для UI
 */
export function getQualityLabel(quality: GraphicsQuality): string {
  switch (quality) {
    case 'low': return '🐌 Низкое (для слабых устройств)';
    case 'medium': return '⚡ Среднее (рекомендуется)';
    case 'high': return '🚀 Высокое (для мощных устройств)';
    case 'auto': return '🤖 Авто (определить автоматически)';
  }
}

/**
 * Получить описание что даёт каждое качество
 */
export function getQualityDescription(quality: Exclude<GraphicsQuality, 'auto'>): string {
  const settings = QUALITY_PRESETS[quality];
  return `
Обновление: ${1000 / settings.tickInterval} раз/сек
Анимации: ${settings.animationsEnabled ? 'Вкл' : 'Выкл'}
Тени: ${settings.shadowsEnabled ? 'Вкл' : 'Выкл'}
Макс. траков: ${settings.maxVisibleTrucks}
  `.trim();
}

// Экспортируем для использования в компонентах
export default {
  isLowEndDevice,
  isHighEndDevice,
  detectOptimalQuality,
  getPerformanceSettings,
  getCurrentPerformanceSettings,
  saveQualitySetting,
  loadQualitySetting,
  getQualityLabel,
  getQualityDescription,
};
