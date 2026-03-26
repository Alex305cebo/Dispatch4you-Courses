# Requirements Document: Добавление 2 новых диалогов диспетчера с брокером

## Introduction

Данная спецификация описывает требования к созданию 2 новых интерактивных диалогов для симулятора обучения диспетчеров. Диалоги являются продолжением существующей системы (диалоги 1-4) и следуют плану создания 15 диалогов, охватывающих различные типы грузов, оборудования и сложности переговоров.

Новые диалоги будут созданы в файлах scenarios-data-v5.js и scenarios-data-v6.js, следуя улучшенной структуре NEW DIALOG SYSTEM V2.0 с 6 уровнями качества ответов на каждом шаге.

## Glossary

- **Dialogue_System**: Интерактивная система обучения диспетчеров через симуляцию телефонных переговоров с брокерами
- **Scenario**: Полный диалог с определенным маршрутом, грузом, оборудованием и условиями
- **Master_Path**: Основной путь успешных переговоров (8-12 шагов)
- **Reject_Path**: Альтернативный путь, ведущий к отказу брокера (reject1, reject2, reject3)
- **Quality_Level**: Уровень качества ответа диспетчера (excellent, good, normal, weak, aggressive, fail)
- **Outcome**: Результат диалога с детальным feedback и уроками для обучения
- **Broker**: Брокер грузоперевозок, с которым ведет переговоры диспетчер
- **Dispatcher**: Диспетчер транспортной компании, который звонит брокеру
- **MC_Number**: Motor Carrier Number - регистрационный номер перевозчика
- **Rate_Confirmation**: Документ с подтверждением ставки и условий перевозки
- **Detention_Pay**: Оплата за время ожидания при погрузке/разгрузке
- **Layover_Pay**: Оплата за вынужденную остановку в пути
- **Hazmat**: Hazardous Materials - опасные грузы, требующие специальной сертификации
- **Reefer**: Refrigerated trailer - рефрижераторный прицеп с температурным контролем
- **Flatbed**: Открытая платформа для перевозки негабаритных грузов
- **Dry_Van**: Закрытый фургон для стандартных грузов
- **Load_Locks**: Распорки для фиксации груза в прицепе
- **BOL**: Bill of Lading - транспортная накладная
- **POD**: Proof of Delivery - подтверждение доставки

## Requirements

### Requirement 1: Создание диалога #5 - Hazmat (Химические материалы)

**User Story:** Как пользователь симулятора, я хочу практиковать переговоры по перевозке опасных грузов (Hazmat), чтобы научиться работать с требованиями сертификации, безопасности и специальными маршрутами.

#### Acceptance Criteria

1. THE Dialogue_System SHALL create scenario with id 5, route "Houston TX → Chicago IL", distance 1100 miles, equipment "Tanker", cargo "Chemical materials (Class 3 Flammable)"
2. THE Dialogue_System SHALL set difficulty level to "hard"
3. THE Dialogue_System SHALL include initial message from Dispatcher calling Broker about Hazmat load posting
4. THE Dialogue_System SHALL create Master_Path with 8-12 conversation steps covering Hazmat certification verification, placarding requirements, routing restrictions, emergency response procedures, and rate negotiation
5. THE Dialogue_System SHALL provide 6 Quality_Level options (excellent, good, normal, weak, aggressive, fail) for each step in Master_Path
6. THE Dialogue_System SHALL create at least 2 Reject_Path scenarios (reject1, reject2) for common failure points such as missing Hazmat certification or refusing safety requirements
7. THE Dialogue_System SHALL include rate negotiation starting at $3,200 with potential to reach $3,500 ($3.18/mile)
8. THE Dialogue_System SHALL include questions about Hazmat endorsement, placard requirements, routing restrictions, emergency response kit, and safety protocols
9. THE Dialogue_System SHALL provide detailed Outcome object for each path completion with type, quality, rate, relationship status, dialogue time, questions asked, detail level, future opportunity, and comprehensive feedback
10. THE Dialogue_System SHALL include educational feedback explaining Hazmat compliance requirements, DOT regulations, and safety best practices

### Requirement 2: Создание диалога #6 - Auto Transport (Luxury vehicles)

**User Story:** Как пользователь симулятора, я хочу практиковать переговоры по перевозке дорогих автомобилей, чтобы научиться работать с высокой стоимостью груза, требованиями к осмотру и страхованию.

#### Acceptance Criteria

1. THE Dialogue_System SHALL create scenario with id 6, route "Detroit MI → Phoenix AZ", distance 1900 miles, equipment "Car Carrier (9-car capacity)", cargo "Luxury vehicles (Tesla, BMW, Mercedes)"
2. THE Dialogue_System SHALL set difficulty level to "medium-hard"
3. THE Dialogue_System SHALL include initial message from Dispatcher calling Broker about auto transport load posting
4. THE Dialogue_System SHALL create Master_Path with 8-12 conversation steps covering vehicle inspection procedures, enclosed transport requirements, high-value cargo insurance, damage documentation, and rate negotiation
5. THE Dialogue_System SHALL provide 6 Quality_Level options (excellent, good, normal, weak, aggressive, fail) for each step in Master_Path
6. THE Dialogue_System SHALL create at least 2 Reject_Path scenarios (reject1, reject2) for common failure points such as insufficient insurance coverage or lack of vehicle transport experience
7. THE Dialogue_System SHALL include rate negotiation starting at $5,000 with potential to reach $5,500 ($2.89/mile)
8. THE Dialogue_System SHALL include questions about cargo insurance limits, vehicle inspection process, enclosed vs open transport, damage documentation procedures, and delivery timeframes
9. THE Dialogue_System SHALL provide detailed Outcome object for each path completion with type, quality, rate, relationship status, dialogue time, questions asked, detail level, future opportunity, and comprehensive feedback
10. THE Dialogue_System SHALL include educational feedback explaining auto transport best practices, insurance requirements, and high-value cargo handling

### Requirement 3: Структура файлов и совместимость

**User Story:** Как разработчик, я хочу чтобы новые диалоги были созданы в отдельных файлах с правильной структурой, чтобы обеспечить модульность и совместимость с существующей системой.

#### Acceptance Criteria

1. THE Dialogue_System SHALL create file "pages/scenarios-data-v5.js" containing scenario #5 (Hazmat)
2. THE Dialogue_System SHALL create file "pages/scenarios-data-v6.js" containing scenario #6 (Auto Transport)
3. THE Dialogue_System SHALL include console.log statement at file start indicating file loading
4. THE Dialogue_System SHALL export scenario data as constant (e.g., "const scenario5 = {...}")
5. THE Dialogue_System SHALL follow NEW DIALOG SYSTEM V2.0 structure with paths object containing master, reject1, reject2, reject3 arrays
6. THE Dialogue_System SHALL include empty first step in each reject path for system compatibility
7. THE Dialogue_System SHALL maintain consistent property naming with existing scenarios (brokerQuestion, dispatcherPrompt, suggestions, quality, analytics, path)
8. THE Dialogue_System SHALL include all required metadata fields (id, route, distance, equipment, cargo, difficulty, brokerStyle, weight, deadline)

### Requirement 4: Качество ответов и аналитика

**User Story:** Как пользователь симулятора, я хочу получать детальную аналитику по каждому выбранному ответу, чтобы понимать качество моих переговоров и учиться на ошибках.

#### Acceptance Criteria

1. WHEN Dispatcher selects "excellent" quality response, THE Dialogue_System SHALL provide analytics with "✨ Отлично!" prefix and detailed explanation of why response is excellent
2. WHEN Dispatcher selects "good" quality response, THE Dialogue_System SHALL provide analytics with "✔️ Хорошо!" prefix and explanation of strengths
3. WHEN Dispatcher selects "normal" quality response, THE Dialogue_System SHALL provide analytics with "⚪ Нормально." prefix and indication of basic adequacy
4. WHEN Dispatcher selects "weak" quality response, THE Dialogue_System SHALL provide analytics with "⚠️ Слабо." prefix and explanation of weaknesses
5. WHEN Dispatcher selects "aggressive" quality response, THE Dialogue_System SHALL provide analytics with "🔴 Агрессивно." prefix and warning about negative tone
6. WHEN Dispatcher selects "fail" quality response, THE Dialogue_System SHALL provide analytics with "❌ Провал." prefix and explanation of critical error
7. THE Dialogue_System SHALL route "aggressive" and "fail" quality responses to appropriate Reject_Path
8. THE Dialogue_System SHALL maintain "master" path value for excellent, good, normal, and weak quality responses

### Requirement 5: Outcome и обратная связь

**User Story:** Как пользователь симулятора, я хочу получать детальную обратную связь по завершении диалога, чтобы понимать результаты переговоров и ключевые уроки.

#### Acceptance Criteria

1. THE Dialogue_System SHALL include outcome object in final step of each path (master and all reject paths)
2. THE Dialogue_System SHALL include outcome.type field with value "success" for Master_Path completion or "failure" for Reject_Path completion
3. THE Dialogue_System SHALL include outcome.quality field with values "excellent", "good", "normal", "poor", or "fail" based on overall performance
4. THE Dialogue_System SHALL include outcome.rate field showing final agreed rate (e.g., "$3,500") or "$0" for rejected loads
5. THE Dialogue_System SHALL include outcome.ratePerMile field showing rate per mile (e.g., "$3.18/mile") or "$0/mile" for rejected loads
6. THE Dialogue_System SHALL include outcome.relationship field describing broker relationship status ("strengthened", "maintained", "damaged", "rejected")
7. THE Dialogue_System SHALL include outcome.dialogueTime field estimating conversation duration (e.g., "8-10 minutes")
8. THE Dialogue_System SHALL include outcome.questionsAsked field describing number and quality of questions asked
9. THE Dialogue_System SHALL include outcome.detailLevel field rating information gathering ("very high", "high", "medium", "low", "very low", "none")
10. THE Dialogue_System SHALL include outcome.futureOpportunity field indicating potential for repeat business ("repeat", "possible", "unlikely", "none")
11. THE Dialogue_System SHALL include outcome.weeklyLoads field describing potential weekly load volume or "No loads" for failures
12. THE Dialogue_System SHALL include outcome.feedback field with comprehensive multi-paragraph feedback including: success/failure summary, what was done correctly (✅ ЧТО СДЕЛАНО ПРАВИЛЬНО), key lesson (💡 КЛЮЧЕВОЙ УРОК), and real-world application (🎯 ПРИМЕНЕНИЕ В РЕАЛЬНОСТИ)

### Requirement 6: Специфические требования для Hazmat диалога

**User Story:** Как пользователь симулятора, я хочу чтобы Hazmat диалог включал реалистичные требования по безопасности и сертификации, чтобы подготовиться к работе с опасными грузами.

#### Acceptance Criteria

1. THE Dialogue_System SHALL include broker question about Hazmat endorsement on driver's CDL
2. THE Dialogue_System SHALL include broker question about placard requirements for Class 3 Flammable materials
3. THE Dialogue_System SHALL include broker question about routing restrictions and tunnel prohibitions
4. THE Dialogue_System SHALL include broker question about emergency response kit and spill containment equipment
5. THE Dialogue_System SHALL include broker question about tanker endorsement and experience
6. THE Dialogue_System SHALL create reject path when Dispatcher lacks Hazmat certification
7. THE Dialogue_System SHALL create reject path when Dispatcher refuses safety protocol requirements
8. THE Dialogue_System SHALL include feedback explaining DOT Hazmat regulations, placarding requirements, and emergency response procedures
9. THE Dialogue_System SHALL include feedback explaining why Hazmat loads command premium rates ($3.18/mile vs standard $2.50/mile)

### Requirement 7: Специфические требования для Auto Transport диалога

**User Story:** Как пользователь симулятора, я хочу чтобы Auto Transport диалог включал реалистичные требования по осмотру и страхованию дорогих автомобилей, чтобы подготовиться к работе с высокой стоимостью груза.

#### Acceptance Criteria

1. THE Dialogue_System SHALL include broker question about cargo insurance coverage limits (minimum $500K for luxury vehicles)
2. THE Dialogue_System SHALL include broker question about vehicle inspection procedures and damage documentation
3. THE Dialogue_System SHALL include broker question about enclosed vs open transport capability
4. THE Dialogue_System SHALL include broker question about experience with luxury vehicle transport
5. THE Dialogue_System SHALL include broker question about delivery timeframe and customer communication
6. THE Dialogue_System SHALL create reject path when Dispatcher has insufficient insurance coverage
7. THE Dialogue_System SHALL create reject path when Dispatcher lacks luxury vehicle transport experience
8. THE Dialogue_System SHALL include feedback explaining importance of pre-trip inspection, photo documentation, and enclosed transport for high-value vehicles
9. THE Dialogue_System SHALL include feedback explaining why auto transport commands premium rates ($2.89/mile) and requires specialized equipment

### Requirement 8: Переговоры о ставке

**User Story:** Как пользователь симулятора, я хочу практиковать реалистичные переговоры о ставке, чтобы научиться получать справедливую цену за перевозку.

#### Acceptance Criteria

1. WHEN Broker makes initial rate offer in Hazmat scenario, THE Dialogue_System SHALL offer $3,200 all-in ($2.91/mile)
2. WHEN Dispatcher negotiates professionally in Hazmat scenario, THE Dialogue_System SHALL allow rate increase to $3,500 ($3.18/mile)
3. WHEN Dispatcher demands unrealistic rate in Hazmat scenario (e.g., $4,000+), THE Dialogue_System SHALL route to reject path with feedback about market rates
4. WHEN Broker makes initial rate offer in Auto Transport scenario, THE Dialogue_System SHALL offer $5,000 all-in ($2.63/mile)
5. WHEN Dispatcher negotiates professionally in Auto Transport scenario, THE Dialogue_System SHALL allow rate increase to $5,500 ($2.89/mile)
6. WHEN Dispatcher demands unrealistic rate in Auto Transport scenario (e.g., $6,500+), THE Dialogue_System SHALL route to reject path with feedback about market rates
7. THE Dialogue_System SHALL include suggestions for professional negotiation phrases referencing market rates, equipment requirements, and experience
8. THE Dialogue_System SHALL include feedback explaining fair market rates for specialized loads and factors affecting pricing

### Requirement 9: Документация и детали перевозки

**User Story:** Как пользователь симулятора, я хочу практиковать сбор всех необходимых деталей перевозки, чтобы избежать проблем при выполнении груза.

#### Acceptance Criteria

1. THE Dialogue_System SHALL include broker responses with pickup location details (full address, contact name, phone number, time window)
2. THE Dialogue_System SHALL include broker responses with delivery location details (full address, contact name, phone number, time window)
3. THE Dialogue_System SHALL include broker responses with cargo details (weight, dimensions, special handling requirements)
4. THE Dialogue_System SHALL include broker responses with loading/unloading procedures and estimated time
5. THE Dialogue_System SHALL include broker responses with detention pay terms (rate per hour, free time)
6. THE Dialogue_System SHALL include broker responses with required documentation (insurance certificate, W9, permits)
7. THE Dialogue_System SHALL reward Dispatcher for asking detailed questions with "excellent" quality rating
8. THE Dialogue_System SHALL penalize Dispatcher for not gathering critical information with "weak" or "fail" quality rating
9. THE Dialogue_System SHALL include feedback explaining importance of thorough information gathering before accepting load

### Requirement 10: Совместимость с существующей системой

**User Story:** Как разработчик, я хочу чтобы новые диалоги были полностью совместимы с существующей системой симулятора, чтобы они корректно отображались и работали.

#### Acceptance Criteria

1. THE Dialogue_System SHALL follow exact structure of scenarios-data-v3.js and scenarios-data-v4.js
2. THE Dialogue_System SHALL use identical property names for all fields (id, route, distance, equipment, brokerStyle, difficulty, initialMessage, paths, master, reject1, reject2, reject3, brokerQuestion, dispatcherPrompt, suggestions, text, quality, analytics, path, brokerResponse, outcome)
3. THE Dialogue_System SHALL maintain consistent formatting and indentation with existing files
4. THE Dialogue_System SHALL include Russian language for all user-facing text (dispatcherPrompt, analytics, feedback)
5. THE Dialogue_System SHALL include English language for all broker dialogue (brokerQuestion, brokerResponse, suggestion text)
6. THE Dialogue_System SHALL use emoji indicators consistently (💎 for dispatcherPrompt, ✨✔️⚪⚠️🔴❌ for analytics, ✅💡🎯 for feedback sections)
7. THE Dialogue_System SHALL export scenario data in format compatible with existing import system
8. THE Dialogue_System SHALL maintain backward compatibility with existing dialogue rendering logic

