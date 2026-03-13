# -*- coding: utf-8 -*-
"""
Завершение модуля 10 - добавление секторов 6-10
"""

with open('pages/doc-module-10-complete.html', 'r', encoding='utf-8') as f:
    content = f.read()

nav_marker = '        <!-- Navigation -->'
nav_pos = content.find(nav_marker)

# Секторы 6-10 (все оставшиеся)
final_sectors = '''
        <!-- СЕКТОР 6: Budgeting -->
        <div class="sector-wrapper">
            <div class="sector-number">06</div>
            <section class="content-block">
                <div class="block-header">
                    <h2 class="block-title">📋 Budgeting - Бюджетирование</h2>
                    <div class="audio-container">
                        <svg class="progress-ring">
                            <circle class="progress-ring-bg" cx="35" cy="35" r="32"></circle>
                            <circle class="progress-ring-fill" cx="35" cy="35" r="32"></circle>
                        </svg>
                        <button class="audio-btn" onclick="toggleAudio(this, 'audio6')">
                            <span class="play-icon">▶</span>
                            <span class="pause-icon">⏸</span>
                        </button>
                        <div class="progress-ring-interactive seekable" onclick="seekAudio(event, 'audio6')"></div>
                        <div class="audio-duration">0:00 / 0:00</div>
                        <div class="mobile-progress-bar" onclick="seekAudioMobile(event, 'audio6')">
                            <div class="mobile-progress-fill"></div>
                        </div>
                    </div>
                </div>
                <div class="block-content">
                    <h3>📋 Зачем нужен бюджет?</h3>
                    <p><strong>Бюджет</strong> - план доходов и расходов на месяц/квартал/год. Без бюджета вы летите вслепую!</p>

                    <div class="success-highlight">
                        <h4>✅ Месячный бюджет (пример для 1 трака):</h4>
                        <p><strong>Доходы:</strong></p>
                        <ul>
                            <li>10,000 миль × $2.50/миля = $25,000</li>
                        </ul>
                        <p><strong>Расходы:</strong></p>
                        <ul>
                            <li>Fuel: $6,500</li>
                            <li>Driver pay: $6,000</li>
                            <li>Truck payment: $2,000</li>
                            <li>Insurance: $1,200</li>
                            <li>Maintenance: $800</li>
                            <li>Permits: $300</li>
                            <li>Admin: $200</li>
                            <li><strong>Total: $17,000</strong></li>
                        </ul>
                        <p><strong>Net Profit: $25,000 - $17,000 = $8,000/месяц</strong></p>
                    </div>

                    <h3>💰 Emergency Fund</h3>
                    <p><strong>Emergency fund</strong> - резервный фонд на 3-6 месяцев расходов.</p>

                    <div class="warning-highlight">
                        <h4>⚠️ Зачем нужен emergency fund:</h4>
                        <ul>
                            <li><strong>Поломки:</strong> Engine rebuild = $15,000-25,000</li>
                            <li><strong>Медленные месяцы:</strong> Зима, праздники - меньше грузов</li>
                            <li><strong>Accidents:</strong> Deductible $5,000-10,000</li>
                            <li><strong>Болезнь водителя:</strong> Трак стоит, расходы продолжаются</li>
                        </ul>
                        <p><strong>Целевой размер:</strong> $15,000-30,000 для 1 трака</p>
                    </div>

                    <h3>📊 Cash Flow Management</h3>
                    <p><strong>Cash flow</strong> - движение денег (когда приходят и уходят).</p>

                    <div class="info-highlight">
                        <h4>💡 Правила cash flow:</h4>
                        <ol>
                            <li><strong>Track daily:</strong> Знайте баланс каждый день</li>
                            <li><strong>Plan ahead:</strong> Знайте когда придут деньги и когда нужно платить</li>
                            <li><strong>Buffer:</strong> Держите минимум $5,000 на счету всегда</li>
                            <li><strong>Separate accounts:</strong> Business и personal - разные счета</li>
                            <li><strong>Pay yourself:</strong> Установите зарплату себе (не берите все)</li>
                        </ol>
                    </div>

                    <h3>🎯 Финансовые цели</h3>
                    <p><strong>Ставьте SMART цели:</strong></p>
                    <ul>
                        <li><strong>Specific:</strong> "Накопить $20,000 emergency fund"</li>
                        <li><strong>Measurable:</strong> Можно измерить прогресс</li>
                        <li><strong>Achievable:</strong> Реалистично ($2,000/месяц)</li>
                        <li><strong>Relevant:</strong> Важно для бизнеса</li>
                        <li><strong>Time-bound:</strong> "За 10 месяцев"</li>
                    </ul>

                    <div class="success-highlight">
                        <h4>✅ Примеры финансовых целей:</h4>
                        <ul>
                            <li>Накопить $20,000 emergency fund за 12 месяцев</li>
                            <li>Купить второй трак через 18 месяцев ($40,000 down payment)</li>
                            <li>Выплатить truck loan за 3 года вместо 5</li>
                            <li>Увеличить profit margin с 25% до 35% за 6 месяцев</li>
                        </ul>
                    </div>
                </div>
            </section>

            <div class="case-study-block">
                <div class="case-study-header">
                    <span class="case-study-icon">💼</span>
                    <h3 class="case-study-title">Case Study: Emergency fund спас от банкротства</h3>
                </div>
                <div class="case-study-content">
                    <p><strong>Ситуация:</strong> Owner-operator, engine failure - нужно $18,000 на rebuild. Нет emergency fund.</p>
                    <p><strong>Последствия без emergency fund:</strong></p>
                    <ul>
                        <li>Взял кредит под 18% годовых</li>
                        <li>Ремонт занял 3 недели - нет дохода</li>
                        <li>Не смог платить insurance - полис отменен</li>
                        <li>Пропустил truck payment - штраф $500</li>
                        <li>Total убыток: $18,000 + $3,000 проценты + $6,000 потерянный доход = $27,000</li>
                    </ul>
                    <p><strong>Сравнение с emergency fund:</strong></p>
                    <ul>
                        <li>Заплатил $18,000 из emergency fund</li>
                        <li>Ремонт 3 недели - жил на savings</li>
                        <li>Вернулся на дорогу без долгов</li>
                        <li>Восстановил emergency fund за 6 месяцев</li>
                    </ul>
                    <div class="case-study-highlight">
                        <strong>Итог:</strong> Emergency fund сэкономил $9,000 (проценты + штрафы + стресс). Урок: ВСЕГДА имейте 3-6 месяцев расходов в резерве!
                    </div>
                </div>
            </div>

            <button class="audio-completion-btn" onclick="markAudioComplete(this, 'audio6', 'quiz-6')">
                🎧 Я закончил слушать этот блок
            </button>

            <div class="quick-check-block locked" id="quiz-6" data-quiz-id="quiz-10-6" data-correct-answer="c">
                <div class="quick-check-header">
                    <span class="quick-check-icon">✅</span>
                    <h3 class="quick-check-title">Быстрая проверка</h3>
                </div>
                <div class="quick-check-content">
                    <p class="quiz-question"><strong>Вопрос:</strong> Какой размер emergency fund рекомендуется для 1 трака?</p>
                    <div class="quiz-options">
                        <div class="quiz-option" data-answer="a">
                            <span class="option-letter">A</span>
                            <span class="option-text">$5,000</span>
                        </div>
                        <div class="quiz-option" data-answer="b">
                            <span class="option-letter">B</span>
                            <span class="option-text">$10,000</span>
                        </div>
                        <div class="quiz-option" data-answer="c">
                            <span class="option-letter">C</span>
                            <span class="option-text">$15,000-30,000</span>
                        </div>
                        <div class="quiz-option" data-answer="d">
                            <span class="option-letter">D</span>
                            <span class="option-text">$50,000+</span>
                        </div>
                    </div>
                    <div class="quiz-feedback">
                        <strong>Правильно! ✓</strong> Emergency fund должен покрывать 3-6 месяцев расходов = $15,000-30,000 для 1 трака. Это защита от поломок, медленных месяцев, accidents!
                    </div>
                </div>
            </div>
        </div>

        <!-- СЕКТОР 7: Налоги -->
        <div class="sector-wrapper">
            <div class="sector-number">07</div>
            <section class="content-block">
                <div class="block-header">
                    <h2 class="block-title">🧾 Налоги - IFTA, IRP, UCR, 2290</h2>
                    <div class="audio-container">
                        <svg class="progress-ring">
                            <circle class="progress-ring-bg" cx="35" cy="35" r="32"></circle>
                            <circle class="progress-ring-fill" cx="35" cy="35" r="32"></circle>
                        </svg>
                        <button class="audio-btn" onclick="toggleAudio(this, 'audio7')">
                            <span class="play-icon">▶</span>
                            <span class="pause-icon">⏸</span>
                        </button>
                        <div class="progress-ring-interactive seekable" onclick="seekAudio(event, 'audio7')"></div>
                        <div class="audio-duration">0:00 / 0:00</div>
                        <div class="mobile-progress-bar" onclick="seekAudioMobile(event, 'audio7')">
                            <div class="mobile-progress-fill"></div>
                        </div>
                    </div>
                </div>
                <div class="block-content">
                    <h3>🧾 IFTA (International Fuel Tax Agreement)</h3>
                    <p><strong>IFTA</strong> - система налогообложения топлива для траков работающих в нескольких штатах.</p>

                    <div class="success-highlight">
                        <h4>✅ Как работает IFTA:</h4>
                        <ul>
                            <li><strong>Отчеты:</strong> Ежеквартально (Jan-Mar, Apr-Jun, Jul-Sep, Oct-Dec)</li>
                            <li><strong>Дедлайны:</strong> Последний день месяца после квартала (Apr 30, Jul 31, Oct 31, Jan 31)</li>
                            <li><strong>Что отчитывать:</strong> Мили по каждому штату, галлоны купленные, налог уплаченный</li>
                            <li><strong>Расчет:</strong> Налог должен = налог уплачен. Разницу доплачиваете или возвращают</li>
                        </ul>
                        <p><strong>Стоимость:</strong> $10-50/квартал (регистрация + decals)</p>
                    </div>

                    <h3>📋 IRP (International Registration Plan)</h3>
                    <p><strong>IRP</strong> - регистрация трака для работы в нескольких штатах.</p>

                    <div class="info-highlight">
                        <h4>💡 IRP детали:</h4>
                        <ul>
                            <li><strong>Срок:</strong> Ежегодно (renewal каждый год)</li>
                            <li><strong>Стоимость:</strong> $1,500-3,000/год (зависит от штатов и веса)</li>
                            <li><strong>Apportioned plates:</strong> Платите пропорционально милям в каждом штате</li>
                            <li><strong>Base jurisdiction:</strong> Штат где зарегистрирована компания</li>
                        </ul>
                    </div>

                    <h3>💼 UCR (Unified Carrier Registration)</h3>
                    <p><strong>UCR</strong> - ежегодный федеральный fee для interstate carriers.</p>

                    <div class="success-highlight">
                        <h4>✅ UCR стоимость (2024):</h4>
                        <ul>
                            <li><strong>1-2 trucks:</strong> $76/год</li>
                            <li><strong>3-5 trucks:</strong> $230/год</li>
                            <li><strong>6-20 trucks:</strong> $460/год</li>
                            <li><strong>21-100 trucks:</strong> $2,301/год</li>
                        </ul>
                        <p><strong>Дедлайн:</strong> 31 декабря каждого года</p>
                    </div>

                    <h3>🚛 Form 2290 (Heavy Vehicle Use Tax)</h3>
                    <p><strong>Form 2290</strong> - федеральный налог на тяжелые траки (55,000+ lbs).</p>

                    <div class="warning-highlight">
                        <h4>⚠️ Form 2290 детали:</h4>
                        <ul>
                            <li><strong>Стоимость:</strong> $550/год для траков 55,000-75,000 lbs</li>
                            <li><strong>Срок:</strong> Ежегодно (July 1 - June 30)</li>
                            <li><strong>Дедлайн:</strong> 31 августа (для траков в use с July 1)</li>
                            <li><strong>Штраф:</strong> $100-1,000 за late filing</li>
                            <li><strong>Важно:</strong> Нужен для renewal registration!</li>
                        </ul>
                    </div>

                    <h3>📊 Налоговый календарь</h3>
                    <div class="info-highlight">
                        <h4>💡 Важные даты:</h4>
                        <ul>
                            <li><strong>Январь 31:</strong> IFTA Q4 (Oct-Dec)</li>
                            <li><strong>Апрель 30:</strong> IFTA Q1 (Jan-Mar)</li>
                            <li><strong>Июль 31:</strong> IFTA Q2 (Apr-Jun)</li>
                            <li><strong>Август 31:</strong> Form 2290 (new tax year)</li>
                            <li><strong>Октябрь 31:</strong> IFTA Q3 (Jul-Sep)</li>
                            <li><strong>Декабрь 31:</strong> UCR renewal</li>
                        </ul>
                    </div>

                    <h3>💰 Общая стоимость налогов/permits</h3>
                    <p><strong>Годовые расходы на 1 трак:</strong></p>
                    <ul>
                        <li>IFTA: $50-200/год (filing fees)</li>
                        <li>IRP: $1,500-3,000/год</li>
                        <li>UCR: $76-230/год</li>
                        <li>Form 2290: $550/год</li>
                        <li>MC Authority: $300/год (renewal)</li>
                        <li><strong>Total: $2,500-4,300/год = $200-360/месяц</strong></li>
                    </ul>
                </div>
            </section>

            <div class="case-study-block">
                <div class="case-study-header">
                    <span class="case-study-icon">💼</span>
                    <h3 class="case-study-title">Case Study: Пропущенный IFTA стоил $5,000</h3>
                </div>
                <div class="case-study-content">
                    <p><strong>Ситуация:</strong> Owner-operator забыл подать IFTA отчет за Q2 (дедлайн July 31).</p>
                    <p><strong>Последствия:</strong></p>
                    <ul>
                        <li>Late filing penalty: $50/месяц × 3 месяца = $150</li>
                        <li>Audit triggered: IFTA проверили все 4 квартала</li>
                        <li>Нашли ошибки в других отчетах (неточные мили)</li>
                        <li>Доначислили налог: $2,800</li>
                        <li>Пени 15%: $420</li>
                        <li>Административные расходы: $500</li>
                        <li>Accountant для исправления: $1,200</li>
                    </ul>
                    <div class="case-study-highlight">
                        <strong>Total убыток:</strong> $5,070! Урок: ВСЕГДА подавайте IFTA вовремя и ведите точные records (ELD помогает)!
                    </div>
                </div>
            </div>

            <button class="audio-completion-btn" onclick="markAudioComplete(this, 'audio7', 'quiz-7')">
                🎧 Я закончил слушать этот блок
            </button>

            <div class="quick-check-block locked" id="quiz-7" data-quiz-id="quiz-10-7" data-correct-answer="b">
                <div class="quick-check-header">
                    <span class="quick-check-icon">✅</span>
                    <h3 class="quick-check-title">Быстрая проверка</h3>
                </div>
                <div class="quick-check-content">
                    <p class="quiz-question"><strong>Вопрос:</strong> Как часто нужно подавать IFTA отчеты?</p>
                    <div class="quiz-options">
                        <div class="quiz-option" data-answer="a">
                            <span class="option-letter">A</span>
                            <span class="option-text">Ежемесячно</span>
                        </div>
                        <div class="quiz-option" data-answer="b">
                            <span class="option-letter">B</span>
                            <span class="option-text">Ежеквартально (каждые 3 месяца)</span>
                        </div>
                        <div class="quiz-option" data-answer="c">
                            <span class="option-letter">C</span>
                            <span class="option-text">Раз в полгода</span>
                        </div>
                        <div class="quiz-option" data-answer="d">
                            <span class="option-letter">D</span>
                            <span class="option-text">Ежегодно</span>
                        </div>
                    </div>
                    <div class="quiz-feedback">
                        <strong>Правильно! ✓</strong> IFTA отчеты подаются ежеквартально. Дедлайны: Apr 30, Jul 31, Oct 31, Jan 31. Late filing = штрафы + audit risk!
                    </div>
                </div>
            </div>
        </div>

'''

new_content = content[:nav_pos] + final_sectors + content[nav_pos:]

with open('pages/doc-module-10-complete.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ Секторы 6-7 добавлены!")
print("Прогресс: 7/10 секторов (70%)")
print("Осталось: 3 сектора (KPIs, Driver Settlements, Financial Planning)")
