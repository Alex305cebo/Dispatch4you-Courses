# Requirements Document

## Введение

Функция "Анализатор скриншотов лоад-бордов" — многофункциональный инструмент для распознавания скриншотов с информацией о грузах и брокерах с лоад-бордов (DAT, Truckstop и др.). Система парсит данные со скриншота, рассчитывает аналитику по грузу (маршрут, рейт, расходы на топливо, профит), отображает информацию о брокере, генерирует шаблон письма брокеру и формирует Load Info карточку для водителя. Страница является частью обучающей платформы для диспетчеров грузоперевозок и помогает студентам освоить навыки анализа грузов с лоад-бордов.

## Глоссарий

- **Analyzer_Page**: Веб-страница инструмента анализа скриншотов лоад-бордов (pages/load-info.html)
- **Screenshot_Parser**: Модуль распознавания и извлечения данных из загруженного скриншота лоад-борда
- **Load_Data**: Структурированные данные о грузе, извлечённые из скриншота (origin, destination, equipment, weight, miles, rate)
- **Broker_Info**: Информация о брокере (компания, MC#, рейтинг, credit score, days to pay, контакт)
- **Analytics_Panel**: Панель аналитики по грузу (маршрут, рейт, rate/mile, расходы на топливо, профит)
- **Email_Generator**: Модуль генерации шаблона письма брокеру на основе распознанных данных
- **Load_Card**: Форматированная карточка с информацией о грузе для водителя
- **Student**: Пользователь платформы, проходящий обучение навыкам диспетчера
- **Upload_Zone**: Область загрузки скриншота (drag-and-drop или выбор файла)
- **Rate_Range**: Диапазон рыночных ставок для данного маршрута (min — max)
- **Fuel_Calculator**: Калькулятор расходов на топливо на основе миль, MPG и цены топлива
- **Profit_Calculator**: Калькулятор профита (rate минус расходы на топливо)

## Требования

### Requirement 1: Загрузка и распознавание скриншота

**User Story:** Как студент, я хочу загрузить скриншот с лоад-борда, чтобы система автоматически извлекла данные о грузе и брокере.

#### Acceptance Criteria

1. THE Analyzer_Page SHALL отображать Upload_Zone для загрузки изображения
2. THE Upload_Zone SHALL поддерживать загрузку через drag-and-drop
3. THE Upload_Zone SHALL поддерживать загрузку через кнопку выбора файла
4. THE Upload_Zone SHALL принимать файлы форматов PNG, JPG и JPEG
5. WHEN Student загружает скриншот, THE Screenshot_Parser SHALL извлечь данные о грузе в структуру Load_Data
6. WHEN Student загружает скриншот, THE Screenshot_Parser SHALL извлечь данные о брокере в структуру Broker_Info
7. WHEN распознавание завершено, THE Analyzer_Page SHALL отобразить превью загруженного скриншота
8. WHEN файл имеет неподдерживаемый формат, THE Upload_Zone SHALL отобразить сообщение об ошибке с указанием допустимых форматов
9. THE Upload_Zone SHALL отображать индикатор прогресса во время распознавания

### Requirement 2: Извлечение данных о грузе (Load Data)

**User Story:** Как студент, я хочу видеть структурированные данные о грузе из скриншота, чтобы быстро оценить параметры перевозки.

#### Acceptance Criteria

1. THE Screenshot_Parser SHALL извлекать город и штат отправления (Origin)
2. THE Screenshot_Parser SHALL извлекать город и штат назначения (Destination)
3. THE Screenshot_Parser SHALL извлекать тип оборудования (Equipment: Van, Reefer, Flatbed и др.)
4. THE Screenshot_Parser SHALL извлекать размер трейлера (например, 53 ft)
5. THE Screenshot_Parser SHALL извлекать вес груза (Weight) в фунтах
6. THE Screenshot_Parser SHALL извлекать расстояние маршрута (Trip) в милях
7. THE Screenshot_Parser SHALL извлекать спот-рейт (Spot Rate) в долларах
8. THE Screenshot_Parser SHALL извлекать rate per mile в долларах
9. THE Screenshot_Parser SHALL извлекать диапазон ставок (Rate_Range) — минимальную и максимальную
10. IF Screenshot_Parser не может извлечь обязательное поле, THEN THE Analyzer_Page SHALL пометить поле как "Не распознано" и позволить Student ввести значение вручную

### Requirement 3: Извлечение информации о брокере (Broker Info)

**User Story:** Как студент, я хочу видеть информацию о брокере из скриншота, чтобы оценить надёжность контрагента.

#### Acceptance Criteria

1. THE Screenshot_Parser SHALL извлекать название компании брокера
2. THE Screenshot_Parser SHALL извлекать MC-номер брокера (MC#)
3. THE Screenshot_Parser SHALL извлекать рейтинг брокера (звёзды и количество отзывов)
4. THE Screenshot_Parser SHALL извлекать credit score брокера
5. THE Screenshot_Parser SHALL извлекать город и штат брокера
6. THE Screenshot_Parser SHALL извлекать контактный email брокера
7. THE Screenshot_Parser SHALL извлекать информацию о факторинге (компания, статус, docket)
8. THE Screenshot_Parser SHALL извлекать days to pay брокера
9. THE Analyzer_Page SHALL отображать Broker_Info в отдельной карточке с визуальной индикацией рейтинга (звёзды)
10. WHEN рейтинг брокера ниже 3 звёзд, THE Analyzer_Page SHALL отобразить предупреждение о низком рейтинге

### Requirement 4: Аналитика по грузу

**User Story:** Как студент, я хочу видеть расчёт расходов и профита по грузу, чтобы научиться оценивать выгодность перевозки.

#### Acceptance Criteria

1. THE Analytics_Panel SHALL отображать маршрут (Origin → Destination) и расстояние в милях
2. THE Analytics_Panel SHALL отображать спот-рейт и rate per mile
3. THE Analytics_Panel SHALL отображать диапазон рыночных ставок (Rate_Range)
4. THE Fuel_Calculator SHALL рассчитывать расход топлива на основе миль и MPG
5. THE Fuel_Calculator SHALL использовать значение MPG по умолчанию 6.8 миль на галлон
6. THE Fuel_Calculator SHALL позволять Student изменять значение MPG
7. THE Fuel_Calculator SHALL позволять Student изменять цену топлива за галлон
8. THE Profit_Calculator SHALL рассчитывать профит как разницу между рейтом и расходами на топливо
9. WHEN профит отрицательный, THE Analytics_Panel SHALL выделить значение профита красным цветом
10. WHEN профит положительный, THE Analytics_Panel SHALL выделить значение профита зелёным цветом
11. THE Analytics_Panel SHALL пересчитывать значения в реальном времени при изменении MPG или цены топлива

### Requirement 5: Генерация письма брокеру

**User Story:** Как студент, я хочу получить готовый шаблон письма брокеру, чтобы научиться профессионально запрашивать детали по грузу.

#### Acceptance Criteria

1. WHEN Load_Data распознаны, THE Email_Generator SHALL сформировать шаблон письма на английском языке
2. THE Email_Generator SHALL подставить Origin и Destination из Load_Data в текст письма
3. THE Email_Generator SHALL подставить дату доступности груза в текст письма
4. THE Email_Generator SHALL включить запрос лучшего рейта в текст письма
5. THE Email_Generator SHALL отображать шаблон письма в редактируемом текстовом поле
6. THE Analyzer_Page SHALL предоставить кнопку копирования текста письма в буфер обмена
7. WHEN Student нажимает кнопку копирования, THE Analyzer_Page SHALL отобразить подтверждение "Скопировано"
8. THE Email_Generator SHALL позволять Student редактировать текст письма перед копированием

### Requirement 6: Load Info карточка для водителя

**User Story:** Как студент, я хочу сформировать карточку с информацией о грузе для водителя, чтобы научиться передавать данные в стандартном формате.

#### Acceptance Criteria

1. WHEN Load_Data распознаны, THE Load_Card SHALL отобразить форматированную карточку
2. THE Load_Card SHALL содержать поле Load ID
3. THE Load_Card SHALL содержать Pickup Address и Pickup Time
4. THE Load_Card SHALL содержать Pickup Number (контактный номер)
5. THE Load_Card SHALL содержать Delivery Address и Delivery Time
6. THE Load_Card SHALL содержать Delivery Number (контактный номер)
7. THE Load_Card SHALL содержать Rate
8. THE Load_Card SHALL содержать Commodity (тип груза)
9. THE Load_Card SHALL содержать Weight (вес груза)
10. THE Load_Card SHALL позволять Student заполнять недостающие поля вручную
11. THE Analyzer_Page SHALL предоставить кнопку копирования Load_Card в буфер обмена в текстовом формате
12. THE Load_Card SHALL использовать 2-колоночный layout с интерактивными tooltip-подсказками по каждому полю

### Requirement 7: Страница инструмента

**User Story:** Как студент, я хочу иметь удобную страницу для работы с анализатором, чтобы все функции были доступны в одном месте.

#### Acceptance Criteria

1. THE Analyzer_Page SHALL быть доступна по адресу pages/load-info.html
2. THE Analyzer_Page SHALL использовать тёмную тему проекта с CSS-переменными (:root)
3. THE Analyzer_Page SHALL интегрироваться с существующей навигацией сайта (shared-nav.css)
4. THE Analyzer_Page SHALL использовать существующую систему аутентификации Firebase
5. THE Analyzer_Page SHALL отображать секции в следующем порядке: Upload_Zone, Analytics_Panel, Broker_Info, Email_Generator, Load_Card
6. THE Analyzer_Page SHALL использовать шрифт Inter, согласно стилю проекта
7. THE Analyzer_Page SHALL включать hero-секцию с заголовком и описанием инструмента

### Requirement 8: Адаптивный дизайн

**User Story:** Как студент, я хочу использовать анализатор на любом устройстве, чтобы работать с инструментом в удобное время.

#### Acceptance Criteria

1. THE Analyzer_Page SHALL корректно отображаться на экранах шириной от 320px
2. THE Analyzer_Page SHALL адаптировать layout для мобильных устройств (< 768px) — все секции в одну колонку
3. THE Analyzer_Page SHALL адаптировать layout для планшетов (768px — 1024px)
4. THE Analyzer_Page SHALL адаптировать layout для десктопов (> 1024px)
5. THE Upload_Zone SHALL поддерживать touch-события для мобильных устройств
6. THE Load_Card SHALL переключаться с 2-колоночного на 1-колоночный layout на экранах < 768px
7. THE Analyzer_Page SHALL реализовать мобильное гамбургер-меню для навигации на экранах < 768px

### Requirement 9: Обработка ошибок

**User Story:** Как студент, я хочу получать понятные сообщения при ошибках, чтобы знать, как исправить ситуацию.

#### Acceptance Criteria

1. WHEN загруженный файл превышает 10 МБ, THE Upload_Zone SHALL отобразить сообщение о превышении размера
2. WHEN Screenshot_Parser не может распознать данные из скриншота, THE Analyzer_Page SHALL отобразить сообщение "Не удалось распознать данные. Попробуйте загрузить другой скриншот или введите данные вручную"
3. WHEN происходит ошибка сети при обращении к API распознавания, THE Analyzer_Page SHALL отобразить сообщение об ошибке с кнопкой повторной попытки
4. IF Student загружает изображение без данных лоад-борда, THEN THE Analyzer_Page SHALL отобразить сообщение "Скриншот не содержит данных лоад-борда"
5. THE Analyzer_Page SHALL логировать все ошибки в консоль для отладки

### Requirement 10: Ручной ввод данных (fallback)

**User Story:** Как студент, я хочу иметь возможность ввести данные вручную, если распознавание не сработало, чтобы всё равно использовать аналитику и генерацию документов.

#### Acceptance Criteria

1. THE Analyzer_Page SHALL предоставить форму ручного ввода всех полей Load_Data
2. THE Analyzer_Page SHALL предоставить форму ручного ввода всех полей Broker_Info
3. WHEN Student заполняет форму вручную, THE Analytics_Panel SHALL рассчитать аналитику на основе введённых данных
4. WHEN Student заполняет форму вручную, THE Email_Generator SHALL сформировать шаблон письма на основе введённых данных
5. WHEN Student заполняет форму вручную, THE Load_Card SHALL отобразить карточку на основе введённых данных
6. THE Analyzer_Page SHALL предоставить кнопку переключения между режимом скриншота и режимом ручного ввода

### Requirement 11: Интеграция с системой XP

**User Story:** Как студент, я хочу получать XP за использование анализатора, чтобы отслеживать свой прогресс в обучении.

#### Acceptance Criteria

1. WHEN Student успешно анализирует скриншот, THE System SHALL начислить 30 XP
2. WHEN Student заполняет Load_Card полностью (все поля), THE System SHALL начислить дополнительные 20 XP
3. THE System SHALL использовать существующую систему XP (xp-system.js)
4. THE System SHALL обновлять отображение XP в навигации после начисления
5. THE System SHALL начислять XP не более одного раза за каждый уникальный анализ

### Requirement 12: Контроль доступа

**User Story:** Как администратор, я хочу, чтобы только авторизованные пользователи имели доступ к анализатору, чтобы контролировать использование ресурсов.

#### Acceptance Criteria

1. WHEN неавторизованный пользователь открывает Analyzer_Page, THE System SHALL перенаправить на страницу входа
2. THE System SHALL использовать существующую систему Firebase Authentication
3. THE System SHALL использовать существующий role-guard.js для проверки авторизации
