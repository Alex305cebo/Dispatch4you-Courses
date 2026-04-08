# Requirements Document

## Введение

Функция "Общение с Брокером" представляет собой интерактивный ИИ-бот для тренировки навыков общения диспетчеров с брокерами в индустрии грузоперевозок. Система предоставляет реалистичные сценарии переговоров с голосовым интерфейсом, позволяя студентам практиковать профессиональную коммуникацию в безопасной учебной среде.

## Глоссарий

- **AI_Bot**: Искусственный интеллект, симулирующий поведение и речь брокера грузоперевозок
- **Voice_Interface**: Голосовой интерфейс для естественного общения между студентом и AI_Bot
- **Training_Session**: Одна сессия тренировки общения с заданным сценарием
- **Scenario**: Предопределённый контекст переговоров (например, обсуждение ставки, изменение условий доставки)
- **Student**: Пользователь системы, проходящий обучение навыкам диспетчера
- **Feedback_System**: Система оценки и предоставления обратной связи по результатам общения
- **Communication_Page**: Веб-страница для взаимодействия с AI_Bot
- **Speech_Recognition**: Система распознавания речи студента
- **Speech_Synthesis**: Система синтеза речи AI_Bot
- **Conversation_History**: История диалога в рамках одной Training_Session
- **Performance_Metrics**: Метрики оценки качества общения (тон, профессионализм, результативность)

## Требования

### Requirement 1: Голосовой интерфейс

**User Story:** Как студент, я хочу общаться с ИИ-ботом голосом, чтобы практиковать реальные телефонные переговоры с брокерами.

#### Acceptance Criteria

1. THE Voice_Interface SHALL поддерживать распознавание русской речи
2. THE Voice_Interface SHALL поддерживать распознавание английской речи
3. WHEN Student активирует микрофон, THE Speech_Recognition SHALL начать захват аудио
4. WHEN Student говорит, THE Speech_Recognition SHALL преобразовывать речь в текст в реальном времени
5. THE AI_Bot SHALL отвечать синтезированной речью через Speech_Synthesis
6. THE Speech_Synthesis SHALL воспроизводить речь с естественной интонацией
7. THE Voice_Interface SHALL отображать визуальный индикатор активности микрофона
8. WHEN происходит ошибка распознавания речи, THE Voice_Interface SHALL отобразить сообщение об ошибке

### Requirement 2: Сценарии переговоров

**User Story:** Как студент, я хочу тренироваться на разных сценариях переговоров, чтобы подготовиться к различным ситуациям в работе.

#### Acceptance Criteria

1. THE AI_Bot SHALL поддерживать минимум 5 различных Scenario
2. THE Scenario SHALL включать: обсуждение ставки за перевозку
3. THE Scenario SHALL включать: изменение условий pickup или delivery
4. THE Scenario SHALL включать: решение проблемы с документами
5. THE Scenario SHALL включать: переговоры о дополнительных услугах
6. THE Scenario SHALL включать: урегулирование конфликтной ситуации
7. WHEN Student выбирает Scenario, THE AI_Bot SHALL инициализировать контекст переговоров
8. THE AI_Bot SHALL начинать диалог первым согласно выбранному Scenario

### Requirement 3: Реалистичное поведение брокера

**User Story:** Как студент, я хочу, чтобы ИИ-бот вёл себя как настоящий брокер, чтобы тренировка была максимально приближена к реальности.

#### Acceptance Criteria

1. THE AI_Bot SHALL использовать профессиональную терминологию индустрии грузоперевозок
2. THE AI_Bot SHALL демонстрировать различные стили общения (дружелюбный, деловой, требовательный)
3. WHEN Student использует непрофессиональный язык, THE AI_Bot SHALL реагировать соответствующим образом
4. THE AI_Bot SHALL задавать релевантные вопросы согласно контексту Scenario
5. THE AI_Bot SHALL возражать на неразумные предложения Student
6. THE AI_Bot SHALL соглашаться на разумные компромиссы
7. THE AI_Bot SHALL завершать диалог при достижении договорённости или тупика

### Requirement 4: Страница общения

**User Story:** Как студент, я хочу иметь удобную страницу для общения с ботом, чтобы сосредоточиться на тренировке без технических сложностей.

#### Acceptance Criteria

1. THE Communication_Page SHALL быть доступна по адресу pages/communication.html
2. THE Communication_Page SHALL отображать интерфейс выбора Scenario
3. THE Communication_Page SHALL отображать кнопку активации/деактивации микрофона
4. THE Communication_Page SHALL отображать Conversation_History в текстовом виде
5. THE Communication_Page SHALL отображать статус соединения с AI_Bot
6. THE Communication_Page SHALL отображать визуальную индикацию, когда AI_Bot говорит
7. THE Communication_Page SHALL интегрироваться с существующей навигацией сайта
8. THE Communication_Page SHALL использовать существующую систему аутентификации Firebase

### Requirement 5: История диалога

**User Story:** Как студент, я хочу видеть историю моего диалога с ботом, чтобы анализировать свои ответы и учиться на ошибках.

#### Acceptance Criteria

1. THE Conversation_History SHALL сохранять все реплики Student
2. THE Conversation_History SHALL сохранять все реплики AI_Bot
3. THE Conversation_History SHALL отображать временные метки для каждой реплики
4. THE Conversation_History SHALL различать визуально реплики Student и AI_Bot
5. WHEN Training_Session завершается, THE Conversation_History SHALL сохраняться в профиле Student
6. THE Student SHALL иметь возможность просмотреть историю предыдущих Training_Session
7. THE Conversation_History SHALL поддерживать автоматическую прокрутку к последней реплике

### Requirement 6: Система обратной связи

**User Story:** Как студент, я хочу получать оценку моего общения, чтобы понимать, что я делаю правильно и над чем нужно работать.

#### Acceptance Criteria

1. WHEN Training_Session завершается, THE Feedback_System SHALL предоставить оценку Performance_Metrics
2. THE Performance_Metrics SHALL включать оценку профессионализма речи (1-10)
3. THE Performance_Metrics SHALL включать оценку результативности переговоров (1-10)
4. THE Performance_Metrics SHALL включать оценку использования терминологии (1-10)
5. THE Feedback_System SHALL предоставить текстовые рекомендации по улучшению
6. THE Feedback_System SHALL выделить ключевые моменты диалога (успешные и неуспешные)
7. THE Feedback_System SHALL сохранять Performance_Metrics в профиле Student для отслеживания прогресса

### Requirement 7: Интеграция с системой XP

**User Story:** Как студент, я хочу получать XP за успешные тренировки, чтобы отслеживать свой прогресс в обучении.

#### Acceptance Criteria

1. WHEN Training_Session завершается успешно, THE System SHALL начислить XP студенту
2. THE System SHALL начислять 50 XP за завершение любого Scenario
3. THE System SHALL начислять бонусные 25 XP, если средняя оценка Performance_Metrics >= 8
4. THE System SHALL начислять бонусные 50 XP, если средняя оценка Performance_Metrics >= 9
5. THE System SHALL использовать существующую систему XP (xp-system.js)
6. THE System SHALL обновлять отображение XP в навигации после начисления
7. THE System SHALL сохранять информацию о начисленных XP в Firestore

### Requirement 8: Текстовый режим (fallback)

**User Story:** Как студент, я хочу иметь возможность общаться текстом, если голосовой интерфейс недоступен или неудобен.

#### Acceptance Criteria

1. WHERE голосовой интерфейс недоступен, THE Communication_Page SHALL предоставить текстовый интерфейс
2. THE Communication_Page SHALL отображать кнопку переключения между голосовым и текстовым режимом
3. WHEN Student использует текстовый режим, THE AI_Bot SHALL отвечать текстом
4. THE Communication_Page SHALL отображать поле ввода текста в текстовом режиме
5. THE Communication_Page SHALL отображать кнопку отправки сообщения в текстовом режиме
6. THE Feedback_System SHALL работать одинаково в обоих режимах

### Requirement 9: Адаптивный дизайн

**User Story:** Как студент, я хочу использовать тренировку на любом устройстве, чтобы практиковаться в удобное время и месте.

#### Acceptance Criteria

1. THE Communication_Page SHALL корректно отображаться на экранах шириной >= 320px
2. THE Communication_Page SHALL адаптировать интерфейс для мобильных устройств (< 768px)
3. THE Communication_Page SHALL адаптировать интерфейс для планшетов (768px - 1024px)
4. THE Communication_Page SHALL адаптировать интерфейс для десктопов (> 1024px)
5. THE Voice_Interface SHALL работать на мобильных устройствах с поддержкой Web Speech API
6. THE Conversation_History SHALL быть читаемой на всех размерах экранов

### Requirement 10: Контроль доступа

**User Story:** Как администратор, я хочу, чтобы только авторизованные пользователи имели доступ к тренировке, чтобы контролировать использование ресурсов.

#### Acceptance Criteria

1. WHEN неавторизованный пользователь открывает Communication_Page, THE System SHALL перенаправить на страницу входа
2. THE System SHALL использовать существующую систему Firebase Authentication
3. THE System SHALL использовать существующий role-guard.js для проверки авторизации
4. THE System SHALL сохранять данные Training_Session только для авторизованных пользователей
5. THE System SHALL связывать Conversation_History с uid пользователя в Firestore

### Requirement 11: Обработка ошибок

**User Story:** Как студент, я хочу получать понятные сообщения об ошибках, чтобы знать, что делать при возникновении проблем.

#### Acceptance Criteria

1. WHEN Speech_Recognition недоступен в браузере, THE System SHALL отобразить сообщение с предложением использовать текстовый режим
2. WHEN происходит ошибка соединения с AI_Bot, THE System SHALL отобразить сообщение об ошибке и предложить повторить попытку
3. WHEN микрофон заблокирован браузером, THE System SHALL отобразить инструкцию по разрешению доступа
4. WHEN происходит ошибка сохранения данных в Firestore, THE System SHALL отобразить предупреждение
5. THE System SHALL логировать все ошибки в консоль для отладки
6. THE System SHALL предоставлять кнопку "Начать заново" при критических ошибках

### Requirement 12: Производительность

**User Story:** Как студент, я хочу, чтобы система работала быстро и плавно, чтобы тренировка была комфортной.

#### Acceptance Criteria

1. WHEN Student отправляет сообщение, THE AI_Bot SHALL начать ответ в течение 3 секунд
2. THE Speech_Recognition SHALL иметь задержку распознавания не более 1 секунды
3. THE Communication_Page SHALL загружаться полностью в течение 2 секунд при стандартном соединении
4. THE Conversation_History SHALL отображать новые сообщения без задержки
5. THE System SHALL оптимизировать запросы к AI API для минимизации задержек
