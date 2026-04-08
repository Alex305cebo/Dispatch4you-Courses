# Requirements Document

## Introduction

Система диалога между Диспетчером и Брокером для обсуждения деталей груза, согласования условий перевозки и заключения сделок. Диалог обеспечивает структурированное взаимодействие между участниками логистического процесса с возможностью обмена информацией о грузе, тарифах и условиях доставки.

## Glossary

- **Dialog_System**: Система управления диалогом между Диспетчером и Брокером
- **Dispatcher**: Диспетчер, представляющий грузоотправителя
- **Broker**: Брокер, представляющий перевозчика
- **Cargo_Info**: Информация о грузе (вес, объём, тип, маршрут)
- **Message**: Сообщение в диалоге
- **Dialog_Session**: Сессия диалога от начала до завершения переговоров
- **Tariff_Proposal**: Предложение тарифа от Брокера
- **Negotiation_State**: Состояние переговоров (initiated, discussing, agreed, rejected)

## Requirements

### Requirement 1: Инициация диалога

**User Story:** Как Диспетчер, я хочу начать диалог с Брокером о грузе, чтобы получить предложения по перевозке

#### Acceptance Criteria

1. WHEN Dispatcher создаёт новый диалог, THE Dialog_System SHALL создать Dialog_Session с уникальным идентификатором
2. WHEN диалог создан, THE Dialog_System SHALL установить Negotiation_State в значение "initiated"
3. THE Dialog_System SHALL сохранить информацию об участниках диалога (Dispatcher и Broker)
4. WHEN диалог инициирован, THE Dialog_System SHALL отправить уведомление Broker о новом диалоге

### Requirement 2: Обмен сообщениями

**User Story:** Как участник диалога, я хочу отправлять и получать сообщения, чтобы обсуждать детали груза

#### Acceptance Criteria

1. WHEN участник отправляет Message, THE Dialog_System SHALL сохранить сообщение с временной меткой и идентификатором отправителя
2. WHEN Message сохранено, THE Dialog_System SHALL доставить сообщение получателю в течение 1 секунды
3. THE Dialog_System SHALL сохранять порядок сообщений в хронологической последовательности
4. WHEN участник просматривает диалог, THE Dialog_System SHALL отобразить все сообщения в порядке отправки
5. THE Dialog_System SHALL поддерживать текстовые сообщения длиной до 5000 символов

### Requirement 3: Передача информации о грузе

**User Story:** Как Диспетчер, я хочу передать детали груза Брокеру, чтобы он мог оценить стоимость перевозки

#### Acceptance Criteria

1. WHEN Dispatcher отправляет Cargo_Info, THE Dialog_System SHALL валидировать обязательные поля (вес, объём, маршрут)
2. IF Cargo_Info содержит некорректные данные, THEN THE Dialog_System SHALL вернуть сообщение об ошибке с указанием проблемных полей
3. WHEN Cargo_Info валидна, THE Dialog_System SHALL сохранить информацию в Dialog_Session
4. THE Dialog_System SHALL отобразить Cargo_Info в структурированном формате для обоих участников

### Requirement 4: Предложение тарифа

**User Story:** Как Брокер, я хочу предложить тариф на перевозку, чтобы Диспетчер мог принять решение

#### Acceptance Criteria

1. WHEN Broker создаёт Tariff_Proposal, THE Dialog_System SHALL валидировать наличие цены и условий доставки
2. THE Dialog_System SHALL связать Tariff_Proposal с соответствующей Cargo_Info
3. WHEN Tariff_Proposal отправлено, THE Dialog_System SHALL изменить Negotiation_State на "discussing"
4. THE Dialog_System SHALL отобразить Tariff_Proposal в структурированном формате с выделением ключевых параметров

### Requirement 5: Согласование условий

**User Story:** Как Диспетчер, я хочу принять или отклонить предложение Брокера, чтобы завершить переговоры

#### Acceptance Criteria

1. WHEN Dispatcher принимает Tariff_Proposal, THE Dialog_System SHALL изменить Negotiation_State на "agreed"
2. WHEN Dispatcher отклоняет Tariff_Proposal, THE Dialog_System SHALL изменить Negotiation_State на "rejected"
3. WHILE Negotiation_State равен "agreed" или "rejected", THE Dialog_System SHALL запретить отправку новых Tariff_Proposal
4. WHEN переговоры завершены, THE Dialog_System SHALL отправить уведомления обоим участникам
5. WHEN Negotiation_State изменён на "agreed", THE Dialog_System SHALL сохранить финальные условия сделки

### Requirement 6: История диалогов

**User Story:** Как участник, я хочу просматривать историю моих диалогов, чтобы отслеживать все переговоры

#### Acceptance Criteria

1. THE Dialog_System SHALL сохранять все Dialog_Session в течение минимум 12 месяцев
2. WHEN участник запрашивает список диалогов, THE Dialog_System SHALL вернуть диалоги с фильтрацией по дате и статусу
3. THE Dialog_System SHALL отображать краткую информацию о каждом диалоге (дата, участники, статус, груз)
4. WHEN участник выбирает диалог, THE Dialog_System SHALL загрузить полную историю сообщений

### Requirement 7: Уведомления

**User Story:** Как участник, я хочу получать уведомления о новых сообщениях, чтобы оперативно реагировать

#### Acceptance Criteria

1. WHEN участник получает новое Message, THE Dialog_System SHALL отправить уведомление получателю
2. WHEN участник не в сети, THE Dialog_System SHALL сохранить уведомление для доставки при следующем подключении
3. THE Dialog_System SHALL отображать счётчик непрочитанных сообщений для каждого Dialog_Session
4. WHEN участник открывает диалог, THE Dialog_System SHALL пометить все сообщения как прочитанные

### Requirement 8: Валидация данных

**User Story:** Как система, я хочу валидировать все входящие данные, чтобы обеспечить корректность информации

#### Acceptance Criteria

1. WHEN участник отправляет данные, THE Dialog_System SHALL проверить формат и типы данных
2. IF данные не соответствуют схеме, THEN THE Dialog_System SHALL вернуть ошибку с описанием проблемы
3. THE Dialog_System SHALL санитизировать текстовые сообщения для предотвращения XSS-атак
4. WHEN Cargo_Info содержит числовые значения, THE Dialog_System SHALL проверить их на положительность и разумные пределы

### Requirement 9: Поиск по диалогам

**User Story:** Как участник, я хочу искать по содержимому диалогов, чтобы быстро находить нужную информацию

#### Acceptance Criteria

1. WHEN участник вводит поисковый запрос, THE Dialog_System SHALL искать совпадения в тексте сообщений и Cargo_Info
2. THE Dialog_System SHALL возвращать результаты поиска в течение 2 секунд
3. THE Dialog_System SHALL выделять найденные фрагменты в результатах поиска
4. THE Dialog_System SHALL поддерживать поиск по датам, участникам и статусу переговоров

### Requirement 10: Экспорт диалога

**User Story:** Как участник, я хочу экспортировать диалог, чтобы сохранить документацию о переговорах

#### Acceptance Criteria

1. WHEN участник запрашивает экспорт Dialog_Session, THE Dialog_System SHALL сгенерировать документ в формате PDF или JSON
2. THE Dialog_System SHALL включить в экспорт все сообщения, Cargo_Info и Tariff_Proposal
3. THE Dialog_System SHALL добавить метаданные (дата создания экспорта, участники, статус)
4. WHEN экспорт завершён, THE Dialog_System SHALL предоставить ссылку для скачивания файла
