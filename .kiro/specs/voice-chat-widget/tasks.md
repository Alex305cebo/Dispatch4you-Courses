# Задачи: Voice Chat Widget

## Целевой файл: `DispatcherTraining/pages/ai-broker-chat.html`

- [x] 1. Добавить CSS для Voice Chat Widget и App Layout
  - [x] 1.1 Добавить стили `.app-layout` (CSS Grid контейнер с transition для переключения single/dual panel)
  - [x] 1.2 Добавить стили `.voice-chat-widget` (карточка с backdrop-filter blur, border-radius 20px, центрирование)
  - [x] 1.3 Добавить стили `.vcw-mic-container`, `.pulse-ring` (CSS-only анимация зелёного/красного кольца с keyframes)
  - [x] 1.4 Добавить стили `.vcw-title`, `.vcw-subtitle`, `.vcw-features` (Feature_List с эмодзи-иконками)
  - [x] 1.5 Добавить стили `.vcw-status` (индикатор состояния: ожидание, запись, обработка, говорит)
  - [x] 1.6 Добавить стили `.transcript-panel`, `.transcript-panel-header`, `.transcript-panel-messages` (боковая панель с прокруткой)
  - [x] 1.7 Обновить `.app` max-width с 800px на 1200px для двухпанельного layout
  - [x] 1.8 Добавить media queries для адаптивности: <768px (вертикальный layout), <480px (уменьшенные размеры)
- [x] 2. Обновить HTML-разметку
  - [x] 2.1 Заменить `.chat`, `.typing`, `.speaking-indicator`, `.transcript-display`, `.input-area` на новую структуру `.app-layout`
  - [x] 2.2 Добавить HTML для `.voice-chat-widget` (заголовок, подзаголовок, mic-container с pulse-ring, status, feature-list)
  - [x] 2.3 Добавить HTML для `.transcript-panel` с role="log", aria-live="polite" и контейнером сообщений
  - [x] 2.4 Добавить ARIA-атрибуты на Mic_Button: aria-label="Начать запись", aria-pressed="false", role="button"
- [x] 3. Обновить JavaScript-логику
  - [x] 3.1 Добавить переменные `widgetState` и `dialogActive`, функцию `updateWidgetState(newState)` для управления визуальным состоянием виджета
  - [x] 3.2 Модифицировать `addMsg()` — перенаправить вывод сообщений в `.transcript-panel-messages` вместо `.chat`, сохранить лимит 50 сообщений
  - [x] 3.3 Модифицировать `startScenario()` — добавить `dialogActive=true`, класс `dialog-active` на `.app-layout`, показать Transcript_Panel
  - [x] 3.4 Модифицировать `resetChat()` — убрать `dialog-active`, очистить Transcript_Panel, вернуть `dialogActive=false`, `widgetState='idle'`
  - [x] 3.5 Модифицировать `toggleMic()`, `startRec()`, `stopRec()` — обновлять `widgetState` и ARIA-атрибуты при смене состояния
  - [x] 3.6 Модифицировать `processMsg()` — обновлять `widgetState` на 'processing' при отправке, 'speaking' при озвучке, 'idle' после завершения
  - [x] 3.7 Модифицировать `TranscriptDisplay` — показывать interim-текст внутри Transcript_Panel (внизу панели сообщений)
  - [x] 3.8 Обновить обработку ошибок Speech Recognition — при ошибках возвращать `widgetState` в 'idle'
- [x] 4. Проверить интеграцию с существующей функциональностью
  - [x] 4.1 Проверить работу Scenario_Bar (выбор сценария → Prep Screen → startCall → двухпанельный layout)
  - [x] 4.2 Проверить работу кнопок header (💡 подсказки, 📜 история, 📊 анализ, 🏁 завершить, 🔄 сброс)
  - [x] 4.3 Проверить работу Feedback Modal и History Modal поверх нового layout
  - [x] 4.4 Проверить сохранение сессий в Firebase через SessionManager
