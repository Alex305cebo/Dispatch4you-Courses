# Implementation Plan: Dispatcher-Broker Dialog System

## Overview

Реализация системы диалога между Диспетчером и Брокером на TypeScript. Система включает управление диалогами, обмен сообщениями, валидацию данных, уведомления, поиск и экспорт. Архитектура построена на трёхуровневой модели с разделением на слои представления, бизнес-логики и данных.

## Tasks

- [x] 1. Настройка проекта и базовых типов
  - Создать структуру проекта TypeScript
  - Настроить tsconfig.json с строгими проверками типов
  - Установить зависимости (express, websocket, database client, validation library)
  - Определить все TypeScript интерфейсы и типы из дизайна (DialogSession, Message, CargoInfo, TariffProposal, Notification, ValidationResult, SearchQuery, SearchResult)
  - Настроить тестовое окружение (Jest или Vitest) с поддержкой property-based testing (fast-check)
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 8.1_

- [ ] 2. Реализация Validation Service
  - [x] 2.1 Создать ValidationService с методами валидации
    - Реализовать validateMessage для проверки текстовых сообщений (длина до 5000 символов)
    - Реализовать validateCargoInfo для проверки обязательных полей (weight, volume, route)
    - Реализовать validateTariffProposal для проверки price и deliveryTerms
    - Реализовать sanitizeText для защиты от XSS-атак
    - Добавить проверку числовых значений на положительность и разумные пределы
    - _Requirements: 2.5, 3.1, 3.2, 4.1, 8.1, 8.2, 8.3, 8.4_
  
  - [ ]* 2.2 Написать property-based тесты для ValidationService
    - **Property 6: Cargo Info Validation** - валидация отклоняет cargo info без обязательных полей
    - **Property 7: Validation Error Format** - ошибки валидации содержат информацию о проблемных полях
    - **Property 9: Tariff Proposal Validation** - валидация отклоняет tariff proposal без обязательных полей
    - **Property 23: Type Validation** - валидация отклоняет данные с неверными типами
    - **Property 24: XSS Sanitization** - санитизация удаляет опасные HTML/script теги
    - **Validates: Requirements 3.1, 3.2, 4.1, 8.1, 8.2, 8.3**
  
  - [ ]* 2.3 Написать unit-тесты для граничных случаев
    - Тест сообщения длиной ровно 5000 символов
    - Тест отрицательных значений weight и volume
    - Тест известных XSS-векторов атак
    - _Requirements: 2.5, 8.3, 8.4_

- [ ] 3. Реализация Dialog Service
  - [x] 3.1 Создать DialogService с управлением диалогами
    - Реализовать createDialog для создания новой сессии с уникальным ID
    - Установить начальное состояние negotiationState = "initiated"
    - Реализовать getDialog для получения диалога по ID
    - Реализовать updateNegotiationState для изменения состояния переговоров
    - Добавить проверку запрета изменений в финальных состояниях ("agreed", "rejected")
    - Реализовать listDialogs с фильтрацией по дате, статусу и участникам
    - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.2, 5.3, 6.2, 9.4_
  
  - [ ]* 3.2 Написать property-based тесты для DialogService
    - **Property 1: Dialog Creation Round-Trip** - созданный диалог содержит корректную информацию об участниках
    - **Property 2: Initial State Invariant** - новый диалог всегда в состоянии "initiated"
    - **Property 11: State Transition on Proposal** - отправка tariff proposal переводит состояние в "discussing"
    - **Property 12: State Transition on Acceptance** - принятие предложения переводит состояние в "agreed"
    - **Property 13: State Transition on Rejection** - отклонение предложения переводит состояние в "rejected"
    - **Property 14: Final State Immutability** - в финальных состояниях нельзя отправить новые предложения
    - **Property 17: Dialog Filtering Correctness** - фильтрация возвращает только диалоги, соответствующие критериям
    - **Validates: Requirements 1.1, 1.2, 4.3, 5.1, 5.2, 5.3, 6.2**

- [ ] 4. Реализация Message Service
  - [x] 4.1 Создать MessageService с обработкой сообщений
    - Реализовать sendMessage для отправки текстовых сообщений с временной меткой
    - Реализовать sendCargoInfo для отправки информации о грузе
    - Реализовать sendTariffProposal для отправки предложений тарифа
    - Реализовать getMessages с пагинацией и сохранением хронологического порядка
    - Реализовать markAsRead для пометки сообщений как прочитанных
    - Интегрировать ValidationService для проверки данных перед сохранением
    - Связать TariffProposal с CargoInfo в рамках диалога
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 3.1, 3.3, 4.1, 4.2, 7.4_
  
  - [ ]* 4.2 Написать property-based тесты для MessageService
    - **Property 4: Message Persistence Round-Trip** - сохранённое сообщение возвращается с теми же данными
    - **Property 5: Message Ordering Invariant** - сообщения возвращаются в хронологическом порядке
    - **Property 8: Cargo Info Persistence Round-Trip** - сохранённая cargo info возвращается без изменений
    - **Property 10: Tariff-Cargo Association** - tariff proposal корректно связан с cargo info
    - **Property 19: Message History Completeness** - получение диалога возвращает все отправленные сообщения
    - **Property 22: Mark as Read Idempotence** - повторное открытие диалога сохраняет статус "прочитано"
    - **Validates: Requirements 2.1, 2.3, 2.4, 3.3, 4.2, 6.4, 7.4**

- [x] 5. Checkpoint - Базовая функциональность
  - Убедиться, что все тесты проходят
  - Проверить, что валидация работает корректно
  - Проверить, что диалоги создаются и сообщения сохраняются
  - Спросить пользователя, если возникли вопросы

- [ ] 6. Реализация Notification Service
  - [x] 6.1 Создать NotificationService с управлением уведомлениями
    - Реализовать sendNotification для отправки уведомлений пользователям
    - Реализовать getUnreadNotifications для получения непрочитанных уведомлений
    - Реализовать getUnreadCount для подсчёта непрочитанных сообщений по диалогу
    - Добавить сохранение уведомлений для офлайн-пользователей
    - Интегрировать с Message Queue для надёжной доставки
    - _Requirements: 1.4, 7.1, 7.2, 7.3_
  
  - [ ]* 6.2 Написать property-based тесты для NotificationService
    - **Property 3: Event Notification Consistency** - создание диалога/сообщения генерирует уведомления
    - **Property 15: Completion Notification** - завершение переговоров отправляет уведомления обоим участникам
    - **Property 20: Offline Notification Persistence** - уведомления для офлайн-пользователей сохраняются
    - **Property 21: Unread Counter Accuracy** - счётчик непрочитанных соответствует количеству непрочитанных сообщений
    - **Validates: Requirements 1.4, 5.4, 7.1, 7.2, 7.3**

- [ ] 7. Реализация Search Service
  - [x] 7.1 Создать SearchService с функциональностью поиска
    - Реализовать search для поиска по содержимому диалогов
    - Реализовать indexMessage для индексации новых сообщений
    - Добавить поиск по тексту сообщений и полям CargoInfo
    - Добавить фильтрацию по датам, участникам и статусу переговоров
    - Реализовать выделение найденных фрагментов в результатах (snippet)
    - Оптимизировать для выполнения за < 2 секунд
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [ ]* 7.2 Написать property-based тесты для SearchService
    - **Property 25: Search Result Accuracy** - результаты поиска содержат искомый текст
    - **Property 26: Search Result Highlighting** - snippet содержит найденный текст из сообщения
    - **Validates: Requirements 9.1, 9.3**
  
  - [ ]* 7.3 Написать unit-тесты для производительности
    - Тест времени отклика поиска (< 2 секунд)
    - Тест поиска по различным комбинациям фильтров
    - _Requirements: 9.2_

- [ ] 8. Реализация Export Service
  - [~] 8.1 Создать функциональность экспорта диалогов
    - Реализовать exportDialog в DialogService для генерации PDF и JSON
    - Включить в экспорт все сообщения, CargoInfo и TariffProposal
    - Добавить метаданные (дата создания экспорта, участники, статус)
    - Реализовать генерацию ссылки для скачивания файла
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  
  - [ ]* 8.2 Написать property-based тесты для Export
    - **Property 27: Export Format Validity** - экспорт генерирует валидный документ в указанном формате
    - **Property 28: Export Completeness** - экспорт содержит все сообщения, cargo info, proposals и метаданные
    - **Property 29: Export Result Availability** - результат экспорта содержит валидную ссылку для скачивания
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4**

- [ ] 9. Реализация Data Layer
  - [~] 9.1 Настроить подключение к базе данных
    - Настроить подключение к PostgreSQL или MongoDB
    - Создать схемы/коллекции для DialogSession, Message, Notification
    - Настроить индексы для оптимизации запросов (по dialogId, userId, timestamp)
    - Реализовать транзакции для многошаговых операций
    - _Requirements: 6.1_
  
  - [~] 9.2 Настроить Message Queue
    - Настроить подключение к RabbitMQ или Redis
    - Создать очереди для уведомлений и доставки сообщений
    - Реализовать retry-логику с экспоненциальной задержкой (3 попытки)
    - _Requirements: 2.2, 7.1_
  
  - [~] 9.3 Настроить Cache
    - Настроить Redis для кэширования часто запрашиваемых данных
    - Реализовать кэширование списков диалогов и счётчиков непрочитанных
    - _Requirements: 6.2, 7.3_

- [ ] 10. Реализация Presentation Layer
  - [~] 10.1 Создать WebSocket Handler
    - Настроить WebSocket-сервер для real-time коммуникации
    - Реализовать обработку подключений и аутентификации
    - Реализовать доставку сообщений в течение 1 секунды
    - Интегрировать с MessageService и NotificationService
    - _Requirements: 2.2_
  
  - [~] 10.2 Создать REST API endpoints
    - POST /dialogs - создание диалога
    - GET /dialogs/:id - получение диалога
    - GET /dialogs - список диалогов с фильтрацией
    - POST /dialogs/:id/messages - отправка сообщения
    - GET /dialogs/:id/messages - получение истории сообщений
    - PUT /dialogs/:id/state - обновление состояния переговоров
    - POST /dialogs/:id/export - экспорт диалога
    - GET /search - поиск по диалогам
    - GET /notifications - получение уведомлений
    - _Requirements: 1.1, 2.1, 5.1, 5.2, 6.2, 6.4, 9.1, 10.1_
  
  - [ ]* 10.3 Написать integration-тесты для API
    - Тест полного flow создания диалога и обмена сообщениями
    - Тест flow согласования тарифа (proposal → acceptance → agreed state)
    - Тест flow отклонения тарифа (proposal → rejection → rejected state)
    - Тест обработки ошибок валидации
    - _Requirements: 1.1, 2.1, 4.3, 5.1, 5.2_

- [ ] 11. Реализация Error Handling
  - [~] 11.1 Создать централизованную обработку ошибок
    - Реализовать ErrorResponse интерфейс с кодами ошибок
    - Добавить обработку validation errors (400)
    - Добавить обработку authorization errors (403)
    - Добавить обработку not found errors (404)
    - Добавить обработку conflict errors (409)
    - Добавить обработку server errors (500)
    - Реализовать логирование ошибок с requestId для отладки
    - _Requirements: 3.2, 8.2_
  
  - [ ]* 11.2 Написать unit-тесты для обработки ошибок
    - Тест возврата детальных ошибок валидации
    - Тест обработки попыток изменить финальное состояние диалога
    - Тест обработки несуществующих ресурсов
    - _Requirements: 3.2, 5.3_

- [ ] 12. Реализация сохранения финальных условий
  - [~] 12.1 Добавить сохранение finalAgreement в DialogSession
    - При принятии TariffProposal сохранить его в поле finalAgreement
    - Обеспечить доступность finalAgreement при получении диалога
    - _Requirements: 5.5_
  
  - [ ]* 12.2 Написать property-based тест для finalAgreement
    - **Property 16: Final Agreement Persistence** - принятое предложение сохраняется и доступно для получения
    - **Validates: Requirements 5.5**

- [ ] 13. Реализация отображения структурированных данных
  - [~] 13.1 Создать форматтеры для CargoInfo и TariffProposal
    - Реализовать форматирование CargoInfo для отображения
    - Реализовать форматирование TariffProposal с выделением ключевых параметров
    - _Requirements: 3.4, 4.4_
  
  - [~] 13.2 Добавить форматирование в API responses
    - Включить структурированное отображение в GET /dialogs/:id/messages
    - Включить краткую информацию в GET /dialogs
    - _Requirements: 3.4, 4.4, 6.3_

- [~] 14. Checkpoint - Интеграция и тестирование
  - Убедиться, что все компоненты интегрированы
  - Запустить все property-based тесты (минимум 100 итераций каждый)
  - Запустить все unit и integration тесты
  - Проверить покрытие кода (цель: минимум 80%)
  - Спросить пользователя, если возникли вопросы

- [ ] 15. Оптимизация и финальная проверка
  - [~] 15.1 Оптимизация производительности
    - Проверить время доставки сообщений (< 1 секунды)
    - Проверить время отклика поиска (< 2 секунд)
    - Оптимизировать запросы к базе данных
    - Настроить индексы для часто используемых запросов
    - _Requirements: 2.2, 9.2_
  
  - [~] 15.2 Проверка требований к хранению данных
    - Настроить политику хранения диалогов (минимум 12 месяцев)
    - Реализовать архивацию старых диалогов
    - _Requirements: 6.1_
  
  - [ ]* 15.3 Написать load-тесты
    - Тест одновременной работы нескольких пользователей
    - Тест производительности при большом количестве диалогов
    - _Requirements: 2.2, 9.2_

- [~] 16. Финальный checkpoint
  - Убедиться, что все тесты проходят
  - Проверить, что все 10 требований покрыты реализацией
  - Проверить, что все 29 correctness properties протестированы
  - Подготовить документацию по API
  - Спросить пользователя о готовности к развёртыванию

## Notes

- Задачи, отмеченные `*`, являются опциональными и могут быть пропущены для более быстрого MVP
- Каждая задача ссылается на конкретные требования для отслеживаемости
- Checkpoints обеспечивают инкрементальную валидацию
- Property-based тесты валидируют универсальные свойства корректности (29 properties)
- Unit-тесты валидируют конкретные примеры и граничные случаи
- Integration-тесты проверяют end-to-end workflows
- Все property-based тесты должны выполняться минимум 100 итераций
- Используется библиотека fast-check для property-based testing в TypeScript
