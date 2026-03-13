#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Добавление секторов 8-10 в модуль 10
"""

import re

# Читаем файл
with open('pages/doc-module-10-complete.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Сектор 8: Financial KPIs
sector_8 = '''
        <!-- Сектор 8: Financial KPIs -->
        <div class="sector" id="sector-8">
            <div class="sector-header">
                <div class="sector-number">08</div>
                <h2>📊 Financial KPIs</h2>
            </div>
            
            <div class="sector-content">
                <div class="audio-section">
                    <button class="audio-btn" onclick="toggleAudio('audio8')">
                        <span class="audio-icon">🎵</span>
                        <span class="audio-text">Слушать раздел</span>
                    </button>
                </div>

                <h3>🎯 Ключевые показатели эффективности</h3>

                <p><strong>Revenue per Truck:</strong></p>
                <ul>
                    <li>Средний доход на единицу техники</li>
                    <li>Цель: $8,000-12,000/неделя</li>
                    <li>Показатель эффективности использования</li>
                    <li>Учитывает все источники дохода</li>
                </ul>

                <p><strong>Profit per Mile:</strong></p>
                <ul>
                    <li>Чистая прибыль на милю</li>
                    <li>Цель: $0.30-0.50/миля</li>
                    <li>После всех расходов</li>
                    <li>Ключевой показатель рентабельности</li>
                </ul>

                <p><strong>Operating Ratio:</strong></p>
                <ul>
                    <li>Отношение расходов к доходам</li>
                    <li>Формула: (Expenses / Revenue) × 100</li>
                    <li>Цель: 85-90% (ниже = лучше)</li>
                    <li>Индикатор операционной эффективности</li>
                </ul>

                <p><strong>Deadhead Percentage:</strong></p>

                <ul>
                    <li>Процент пустых миль</li>
                    <li>Цель: менее 10%</li>
                    <li>Влияет на прибыльность</li>
                    <li>Требует оптимизации маршрутов</li>
                </ul>

                <p><strong>Utilization Rate:</strong></p>
                <ul>
                    <li>Процент времени в работе</li>
                    <li>Цель: 85-90%</li>
                    <li>Показатель загрузки</li>
                    <li>Влияет на доходность</li>
                </ul>

                <p><strong>Dashboard Metrics:</strong></p>
                <ul>
                    <li>Ежедневный мониторинг KPIs</li>
                    <li>Еженедельные отчеты</li>
                    <li>Месячный анализ трендов</li>
                    <li>Сравнение с целевыми показателями</li>
                </ul>

                <!-- Case Study -->
                <div class="case-study">
                    <h4>📈 Case Study: KPI Dashboard</h4>

                    <p><strong>Ситуация:</strong> Carrier внедрил систему мониторинга KPIs</p>
                    <p><strong>Показатели до внедрения:</strong></p>
                    <ul>
                        <li>Operating Ratio: 95%</li>
                        <li>Deadhead: 15%</li>
                        <li>Utilization: 75%</li>
                        <li>Profit/mile: $0.15</li>
                    </ul>
                    <p><strong>Действия:</strong></p>
                    <ul>
                        <li>Ежедневный мониторинг показателей</li>
                        <li>Оптимизация маршрутов</li>
                        <li>Контроль расходов</li>
                        <li>Улучшение загрузки</li>
                    </ul>
                    <p><strong>Результат через 6 месяцев:</strong></p>
                    <ul>
                        <li>Operating Ratio: 88%</li>
                        <li>Deadhead: 8%</li>
                        <li>Utilization: 87%</li>
                        <li>Profit/mile: $0.42</li>
                    </ul>
                </div>

                <!-- Quiz -->

                <div class="quiz-container" id="quiz-10-8">
                    <h4>Проверь себя:</h4>
                    <p class="quiz-question">Какой целевой Operating Ratio для эффективного carrier?</p>
                    <div class="quiz-options">
                        <div class="quiz-option" data-correct="false">95-100%</div>
                        <div class="quiz-option" data-correct="true">85-90%</div>
                        <div class="quiz-option" data-correct="false">70-75%</div>
                        <div class="quiz-option" data-correct="false">60-65%</div>
                    </div>
                    <div class="quiz-feedback"></div>
                </div>
            </div>
        </div>

'''

# Сектор 9: Driver Settlements
sector_9 = '''
        <!-- Сектор 9: Driver Settlements -->
        <div class="sector" id="sector-9">
            <div class="sector-header">
                <div class="sector-number">09</div>
                <h2>💰 Driver Settlements</h2>
            </div>
            
            <div class="sector-content">
                <div class="audio-section">
                    <button class="audio-btn" onclick="toggleAudio('audio9')">
                        <span class="audio-icon">🎵</span>
                        <span class="audio-text">Слушать раздел</span>
                    </button>
                </div>

                <h3>💵 Расчеты с водителями</h3>

                <p><strong>Payment Types:</strong></p>
                <ul>
                    <li>Percentage of load (25-30%)</li>
                    <li>Per mile rate ($0.40-0.60/mile)</li>
                    <li>Salary + bonus</li>
                    <li>Hybrid models</li>
                </ul>

                <p><strong>Common Deductions:</strong></p>
                <ul>
                    <li>Fuel advances</li>
                    <li>Insurance premiums</li>
                    <li>Equipment damage</li>
                    <li>Permits and violations</li>
                    <li>Escrow deposits</li>
                </ul>

                <p><strong>Settlement Statement Components:</strong></p>

                <ul>
                    <li>Gross revenue earned</li>
                    <li>Itemized deductions</li>
                    <li>Net pay calculation</li>
                    <li>YTD totals</li>
                    <li>Escrow balance</li>
                </ul>

                <p><strong>Escrow Management:</strong></p>
                <ul>
                    <li>Initial deposit: $1,000-2,000</li>
                    <li>Purpose: damage/violation coverage</li>
                    <li>Refund policy при увольнении</li>
                    <li>Interest accrual (если применимо)</li>
                </ul>

                <p><strong>Settlement Frequency:</strong></p>
                <ul>
                    <li>Weekly settlements (стандарт)</li>
                    <li>Bi-weekly опции</li>
                    <li>Quick pay services</li>
                    <li>Direct deposit timing</li>
                </ul>

                <p><strong>Documentation:</strong></p>
                <ul>
                    <li>Detailed settlement statements</li>
                    <li>Load confirmations</li>
                    <li>Expense receipts</li>
                    <li>Tax documents (1099)</li>
                </ul>


                <!-- Case Study -->
                <div class="case-study">
                    <h4>💼 Case Study: Settlement Dispute</h4>
                    <p><strong>Ситуация:</strong> Водитель оспаривает удержания в settlement</p>
                    <p><strong>Проблема:</strong></p>
                    <ul>
                        <li>Неожиданные удержания $800</li>
                        <li>Нет детализации расходов</li>
                        <li>Водитель угрожает уйти</li>
                    </ul>
                    <p><strong>Решение:</strong></p>
                    <ul>
                        <li>Детальный разбор каждого удержания</li>
                        <li>Предоставление всех документов</li>
                        <li>Объяснение политики компании</li>
                        <li>Внедрение прозрачной системы</li>
                    </ul>
                    <p><strong>Результат:</strong></p>
                    <ul>
                        <li>Конфликт разрешен</li>
                        <li>Водитель остался в компании</li>
                        <li>Улучшена система отчетности</li>
                        <li>Снижение споров на 70%</li>
                    </ul>
                </div>

                <!-- Quiz -->

                <div class="quiz-container" id="quiz-10-9">
                    <h4>Проверь себя:</h4>
                    <p class="quiz-question">Какой стандартный процент оплаты водителя от загрузки?</p>
                    <div class="quiz-options">
                        <div class="quiz-option" data-correct="false">15-20%</div>
                        <div class="quiz-option" data-correct="true">25-30%</div>
                        <div class="quiz-option" data-correct="false">35-40%</div>
                        <div class="quiz-option" data-correct="false">45-50%</div>
                    </div>
                    <div class="quiz-feedback"></div>
                </div>
            </div>
        </div>

'''

# Сектор 10: Financial Planning
sector_10 = '''
        <!-- Сектор 10: Financial Planning -->
        <div class="sector" id="sector-10">
            <div class="sector-header">
                <div class="sector-number">10</div>
                <h2>📈 Financial Planning</h2>
            </div>
            
            <div class="sector-content">
                <div class="audio-section">

                    <button class="audio-btn" onclick="toggleAudio('audio10')">
                        <span class="audio-icon">🎵</span>
                        <span class="audio-text">Слушать раздел</span>
                    </button>
                </div>

                <h3>🎯 Стратегическое финансовое планирование</h3>

                <p><strong>Quarterly Financial Reviews:</strong></p>
                <ul>
                    <li>Анализ P&L statements</li>
                    <li>Сравнение с бюджетом</li>
                    <li>Выявление трендов</li>
                    <li>Корректировка стратегии</li>
                    <li>Forecast на следующий квартал</li>
                </ul>

                <p><strong>Tax Planning Strategies:</strong></p>
                <ul>
                    <li>Quarterly estimated tax payments</li>
                    <li>Depreciation planning (Section 179)</li>
                    <li>Expense timing optimization</li>
                    <li>Retirement account contributions</li>
                    <li>Work with CPA quarterly</li>
                </ul>

                <p><strong>Growth Planning:</strong></p>

                <ul>
                    <li>Expansion timeline (1, 3, 5 years)</li>
                    <li>Equipment acquisition plan</li>
                    <li>Financing strategy</li>
                    <li>Market analysis</li>
                    <li>Risk assessment</li>
                </ul>

                <p><strong>ROI Calculations:</strong></p>
                <ul>
                    <li>New truck ROI: 18-24 months</li>
                    <li>Technology investments</li>
                    <li>Training programs ROI</li>
                    <li>Marketing spend effectiveness</li>
                    <li>Process improvement returns</li>
                </ul>

                <p><strong>Cash Reserve Strategy:</strong></p>
                <ul>
                    <li>Emergency fund: 3-6 months expenses</li>
                    <li>Equipment replacement fund</li>
                    <li>Opportunity fund для роста</li>
                    <li>Seasonal fluctuation buffer</li>
                </ul>

                <p><strong>Financial Goals Setting:</strong></p>
                <ul>
                    <li>Revenue targets по кварталам</li>
                    <li>Profit margin goals</li>
                    <li>Fleet expansion milestones</li>

                    <li>Debt reduction timeline</li>
                    <li>Personal income objectives</li>
                </ul>

                <!-- Case Study -->
                <div class="case-study">
                    <h4>🚀 Case Study: 5-Year Growth Plan</h4>
                    <p><strong>Starting Point (Year 0):</strong></p>
                    <ul>
                        <li>3 trucks, $1.2M revenue</li>
                        <li>10% profit margin</li>
                        <li>$50K cash reserves</li>
                    </ul>
                    <p><strong>5-Year Plan:</strong></p>
                    <ul>
                        <li>Year 1: Add 2 trucks, improve margins to 12%</li>
                        <li>Year 2: Add 3 trucks, build $200K reserves</li>
                        <li>Year 3: Add 4 trucks, 15% margins</li>
                        <li>Year 4: Add 5 trucks, diversify services</li>
                        <li>Year 5: 20 trucks total, $8M revenue</li>
                    </ul>
                    <p><strong>Результат:</strong></p>
                    <ul>
                        <li>Достигнуто: 18 trucks, $7.2M revenue</li>
                        <li>Profit margin: 14%</li>
                        <li>Cash reserves: $500K</li>
                        <li>Stable, profitable operation</li>
                    </ul>
                </div>


                <!-- Quiz -->
                <div class="quiz-container" id="quiz-10-10">
                    <h4>Проверь себя:</h4>
                    <p class="quiz-question">Какой рекомендуемый размер emergency fund для carrier?</p>
                    <div class="quiz-options">
                        <div class="quiz-option" data-correct="false">1-2 месяца расходов</div>
                        <div class="quiz-option" data-correct="true">3-6 месяцев расходов</div>
                        <div class="quiz-option" data-correct="false">6-12 месяцев расходов</div>
                        <div class="quiz-option" data-correct="false">12-24 месяца расходов</div>
                    </div>
                    <div class="quiz-feedback"></div>
                </div>
            </div>
        </div>
'''

# Находим место для вставки (перед закрывающим тегом main)
insert_position = content.find('</main>')

if insert_position == -1:
    print("❌ Не найден тег </main>")
    exit(1)

# Вставляем секторы
new_content = content[:insert_position] + sector_8 + sector_9 + sector_10 + content[insert_position:]

# Сохраняем
with open('pages/doc-module-10-complete.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ Секторы 8-10 успешно добавлены!")
