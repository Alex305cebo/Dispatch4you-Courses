/**
 * Адреса серверной стороны.
 *
 * Локально запросы обслуживает дев-плагин Vite (server/devProxy.ts) по чистым
 * путям вида /api/turn. На боевом сервере тот же контракт закрывает один
 * PHP-файл, который выбирает действие через ?action= — на Hostinger нет
 * маршрутизатора, а трогать общий .htaccess сайта ради красивых URL значит
 * рисковать всеми остальными страницами.
 *
 * Разница живёт здесь и больше нигде.
 */
export type ApiAction = 'config' | 'turn' | 'stt' | 'tts' | 'debrief' | 'realtime-session'

export function endpoint(action: ApiAction): string {
  return import.meta.env.DEV ? `/api/${action}` : `/api/broker-call.php?action=${action}`
}
