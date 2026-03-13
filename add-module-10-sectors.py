# -*- coding: utf-8 -*-
"""
Скрипт для добавления секторов 2-10 в Модуль 10
"""

# Читаем текущий файл
with open('pages/doc-module-10-complete.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Найдем маркер навигации (перед ним вставим новые секторы)
nav_marker = '        <!-- Navigation -->'
nav_pos = content.find(nav_marker)

if nav_pos == -1:
    print("Ошибка: не найден маркер навигации")
    exit(1)

# Контент для секторов 2-10
sectors_content = '''
        <!-- СЕКТОР 2: Fuel Costs -->
        <div class="sector-wrapper">
            <div class="sector-number">02</div>
            <section class="content-block">
                <div class="block-header">
                    <h2 class="block-title">⛽ Fuel Costs - Топливные расходы</h2>
                    <div class="audio-container">
                        <svg class="progress-ring">
                            <circle class="progress-ring-bg" cx="35" cy="35" r="32"></circle>
                            <circle class="progress-ring-fill" cx="35" cy="35" r="32"></circle>
                        </svg>
                        <button class="audio-btn" onclick="toggleAudio(this, 'audio2')">
                            <span class="play-icon">▶</span>
                            <span class="pause-icon">⏸</span>
                        </button>
                        <div class="progress-ring-interactive seekable" onclick="seekAudio(event, 'audio2')"></div>
                        <div class="audio-duration">0:00 / 0:00</div>
                        <div class="mobile-progress-bar" onclick="seekAudioMobile(event, 'audio2')">
                            <div class="mobile-progress-fill"></div>
                        </div>
                    </div>
                </div>
                <div class="block-content">
                    <h3>⛽ Почему топливо - самый большой расход?</h3>
                    <p><strong>Fuel costs</strong> составляют 30-40% всех операционных расходов в trucking. Это САМАЯ большая переменная стоимость.</p>

                    <div class="warning-highlight">
                        <h4>⚠️ Статистика топливных расходов:</h4>
                        <ul>
                            <li><strong>Средняя цена дизеля:</strong> $3.50-4.50/галлон (зависит от штата и сезона)</li>
                            <li><strong>Средний расход:</strong> 6.0-7.0 MPG (Miles Per Gallon)</li>
                            <li><strong>Стоимость на милю:</strong> $0.50-0.75/миля</li>
                            <li><strong>Месячные расходы:</strong> $5,000-7,500 при 10,000 миль/месяц</li>
                            <li><strong>Годовые расходы:</strong> $60,000-90,000 на один трак!</li>
                        </ul>
                    </div>

                    <h3>📊 Формула расчета fuel cost</h3>
                    <div class="success-highlight">
                        <h4>✅ Fuel Cost Per Mile = Fuel Price ÷ MPG</h4>
                        <p><strong>Пример 1:</strong></p>
                        <ul>
                            <li>Цена дизеля: $4.00/галлон</li>
                            <li>MPG: 6.5</li>
                            <li>Fuel cost: $4.00 ÷ 6.5 = <strong>$0.62/миля</strong></li>
                        </ul>
                        <p><strong>Пример 2 (плохой MPG):</strong></p>
                        <ul>
                            <li>Цена дизеля: $4.00/галлон</li>
                            <li>MPG: 5.5 (плохое обслуживание, высокая скорость)</li>
                            <li>Fuel cost: $4.00 ÷ 5.5 = <strong>$0.73/миля</strong></li>
                            <li><strong>Разница:</strong> $0.11/миля × 10,000 миль = $1,100/месяц убытка!</li>
                        </ul>
                    </div>

                    <h3>🚀 Как улучшить MPG</h3>
                    <div class="success-highlight">
                        <h4>✅ Топ-10 способов экономии топлива:</h4>
                        <ol>
                            <li><strong>Снизить скорость:</strong> 70 mph → 62-65 mph = +1.0 MPG (экономия $150-200/месяц)</li>
                            <li><strong>Minimize idle time:</strong> Выключать двигатель при остановках 10+ минут</li>
                            <li><strong>Proper tire pressure:</strong> Проверять давление еженедельно (недокачанные шины = -0.5 MPG)</li>
                            <li><strong>Aerodynamics:</strong> Использовать side skirts, trailer tails (+0.3-0.5 MPG)</li>
                            <li><strong>Smooth driving:</strong> Избегать резких ускорений и торможений</li>
                            <li><strong>Route planning:</strong> Избегать горных маршрутов когда возможно</li>
                            <li><strong>Weight management:</strong> Не возить лишний вес (каждые 1,000 lbs = -0.1 MPG)</li>
                            <li><strong>Regular maintenance:</strong> Чистые фильтры, свежее масло</li>
                            <li><strong>Cruise control:</strong> Использовать на highway для постоянной скорости</li>
                            <li><strong>Engine tuning:</strong> Профессиональная настройка двигателя</li>
                        </ol>
                    </div>

                    <h3>💳 Fuel Surcharge (FSC)</h3>
                    <p><strong>FSC</strong> - дополнительная плата от брокера для компенсации топливных расходов.</p>

                    <div class="info-highlight">
                        <h4>💡 Как работает FSC:</h4>
                        <ul>
                            <li><strong>Базовая цена:</strong> Обычно $1.20-1.50/галлон (baseline)</li>
                            <li><strong>Текущая цена:</strong> Например, $4.00/галлон</li>
                            <li><strong>Разница:</strong> $4.00 - $1.20 = $2.80</li>
                            <li><strong>FSC rate:</strong> $2.80 ÷ 6.0 MPG = $0.47/миля</li>
                            <li><strong>Пример груза:</strong> 1,000 миль × $0.47 = $470 FSC</li>
                        </ul>
                        <p><strong>Важно:</strong> Не все брокеры платят FSC! Всегда спрашивайте: "Is FSC included in the rate?"</p>
                    </div>

                    <h3>💳 Fuel Cards и Discounts</h3>
                    <div class="success-highlight">
                        <h4>✅ Популярные fuel cards:</h4>
                        <ul>
                            <li><strong>Comdata:</strong> 3-5 cents/галлон discount, широкая сеть</li>
                            <li><strong>EFS (WEX):</strong> 2-4 cents/галлон, хорошие отчеты</li>
                            <li><strong>TCS Fuel Card:</strong> До 50 cents/галлон discount на некоторых станциях</li>
                            <li><strong>Pilot Flying J:</strong> Loyalty program, накопление points</li>
                            <li><strong>Love's:</strong> Fuel rewards program</li>
                        </ul>
                        <p><strong>Экономия:</strong> 5 cents/галлон × 1,500 галлонов/месяц = <strong>$75/месяц = $900/год!</strong></p>
                    </div>

                    <h3>📊 Tracking Fuel Expenses</h3>
                    <p><strong>Что отслеживать:</strong></p>
                    <ul>
                        <li><strong>MPG по неделям:</strong> Видеть тренды и проблемы</li>
                        <li><strong>Fuel cost per mile:</strong> Сравнивать с целевым показателем</li>
                        <li><strong>Цены по штатам:</strong> Заправляться в дешевых штатах (TX, OK, LA)</li>
                        <li><strong>Idle time:</strong> Минимизировать простой с включенным двигателем</li>
                        <li><strong>Driver behavior:</strong> Кто из водителей экономит топливо лучше</li>
                    </ul>

                    <div class="warning-highlight">
                        <h4>⚠️ Дорогие штаты для топлива (избегать заправки):</h4>
                        <ul>
                            <li>California: $5.00-5.50/галлон</li>
                            <li>Washington: $4.50-5.00/галлон</li>
                            <li>Oregon: $4.30-4.80/галлон</li>
                            <li>Nevada: $4.20-4.70/галлон</li>
                        </ul>
                        <h4>✅ Дешевые штаты (заправляться здесь):</h4>
                        <ul>
                            <li>Texas: $3.20-3.70/галлон</li>
                            <li>Oklahoma: $3.10-3.60/галлон</li>
                            <li>Louisiana: $3.00-3.50/галлон</li>
                            <li>Mississippi: $3.00-3.50/галлон</li>
                        </ul>
                    </div>
                </div>
            </section>

            <div class="case-study-block">
                <div class="case-study-header">
                    <span class="case-study-icon">💼</span>
                    <h3 class="case-study-title">Case Study: Экономия $18,000/год на топливе</h3>
                </div>
                <div class="case-study-content">
                    <p><strong>Ситуация:</strong> Owner-operator с 1 траком, MPG = 5.8, fuel cost = $0.69/миля при цене $4.00/галлон.</p>
                    <p><strong>Проблемы:</strong></p>
                    <ul>
                        <li>Водитель ездил 70-75 mph (экономия времени)</li>
                        <li>Idle time 3-4 часа/день (кондиционер, обогрев)</li>
                        <li>Давление в шинах не проверялось месяцами</li>
                        <li>Заправка где попало (не искал дешевые станции)</li>
                    </ul>
                    <p><strong>Действия для улучшения:</strong></p>
                    <ul>
                        <li><strong>Снизил скорость:</strong> 70 mph → 63 mph</li>
                        <li><strong>Minimize idle:</strong> APU установка ($8,000) для кондиционера без двигателя</li>
                        <li><strong>Tire pressure:</strong> Еженедельная проверка</li>
                        <li><strong>Fuel card:</strong> TCS Fuel Card с 30-50 cents discount</li>
                        <li><strong>Route planning:</strong> Заправка в TX, OK, LA (дешевые штаты)</li>
                    </ul>
                    <p><strong>Результаты через 3 месяца:</strong></p>
                    <ul>
                        <li>MPG: 5.8 → 6.7 (+0.9 MPG)</li>
                        <li>Fuel cost: $0.69/миля → $0.60/миля</li>
                        <li>Экономия: $0.09/миля × 10,000 миль/месяц = $900/месяц</li>
                        <li>Годовая экономия: $900 × 12 = <strong>$10,800/год</strong></li>
                        <li>Fuel card discounts: $75/месяц = $900/год</li>
                        <li>Заправка в дешевых штатах: $50/месяц = $600/год</li>
                    </ul>
                    <div class="case-study-highlight">
                        <strong>Total экономия:</strong> $10,800 + $900 + $600 = <strong>$12,300/год!</strong> APU окупился за 8 месяцев.
                    </div>
                </div>
            </div>

            <button class="audio-completion-btn" onclick="markAudioComplete(this, 'audio2', 'quiz-2')">
                🎧 Я закончил слушать этот блок
            </button>

            <div class="quick-check-block locked" id="quiz-2" data-quiz-id="quiz-10-2" data-correct-answer="c">
                <div class="quick-check-header">
                    <span class="quick-check-icon">✅</span>
                    <h3 class="quick-check-title">Быстрая проверка</h3>
                </div>
                <div class="quick-check-content">
                    <p class="quiz-question"><strong>Вопрос:</strong> Цена дизеля $4.00/галлон, MPG = 6.0. Какой fuel cost per mile?</p>
                    <div class="quiz-options">
                        <div class="quiz-option" data-answer="a">
                            <span class="option-letter">A</span>
                            <span class="option-text">$0.50/миля</span>
                        </div>
                        <div class="quiz-option" data-answer="b">
                            <span class="option-letter">B</span>
                            <span class="option-text">$0.60/миля</span>
                        </div>
                        <div class="quiz-option" data-answer="c">
                            <span class="option-letter">C</span>
                            <span class="option-text">$0.67/миля</span>
                        </div>
                        <div class="quiz-option" data-answer="d">
                            <span class="option-letter">D</span>
                            <span class="option-text">$0.75/миля</span>
                        </div>
                    </div>
                    <div class="quiz-feedback">
                        <strong>Правильно! ✓</strong> Fuel Cost = Price ÷ MPG = $4.00 ÷ 6.0 = $0.67/миля. Это 30-40% от total operating costs!
                    </div>
                </div>
            </div>
        </div>

'''

# Вставляем новый контент перед навигацией
new_content = content[:nav_pos] + sectors_content + content[nav_pos:]

# Записываем обратно
with open('pages/doc-module-10-complete.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ Сектор 2 добавлен успешно!")
print("Файл обновлен: pages/doc-module-10-complete.html")
