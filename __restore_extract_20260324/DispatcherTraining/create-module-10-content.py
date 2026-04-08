# -*- coding: utf-8 -*-
"""
Скрипт для создания контента Модуля 10: Финансы и расчеты
"""

# Читаем базовый файл
with open('pages/doc-module-10-complete.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Заменяем старый контент модуля 8 на новый контент модуля 10
# Находим начало первого сектора и заменяем все до навигации

# Найдем маркер начала контента
start_marker = '    <main class="main">'
end_marker = '        <!-- Navigation -->'

# Найдем позиции
start_pos = content.find(start_marker)
end_pos = content.find(end_marker)

if start_pos == -1 or end_pos == -1:
    print("Ошибка: не найдены маркеры")
    exit(1)

# Новый контент для 10 секторов
new_content = '''    <main class="main">

        <!-- СЕКТОР 1: Cost Per Mile (CPM) -->
        <div class="sector-wrapper">
            <div class="sector-number">01</div>
            <section class="content-block">
                <div class="block-header">
                    <h2 class="block-title">💰 Cost Per Mile (CPM) - Себестоимость</h2>
                    <div class="audio-container">
                        <svg class="progress-ring">
                            <circle class="progress-ring-bg" cx="35" cy="35" r="32"></circle>
                            <circle class="progress-ring-fill" cx="35" cy="35" r="32"></circle>
                        </svg>
                        <button class="audio-btn" onclick="toggleAudio(this, 'audio1')">
                            <span class="play-icon">▶</span>
                            <span class="pause-icon">⏸</span>
                        </button>
                        <div class="progress-ring-interactive seekable" onclick="seekAudio(event, 'audio1')"></div>
                        <div class="audio-duration">0:00 / 0:00</div>
                        <div class="mobile-progress-bar" onclick="seekAudioMobile(event, 'audio1')">
                            <div class="mobile-progress-fill"></div>
                        </div>
                    </div>
                </div>
                <div class="block-content">
                    <h3>💰 Что такое Cost Per Mile (CPM)?</h3>
                    <p><strong>CPM (Cost Per Mile)</strong> - это себестоимость одной мили работы трака. Это КРИТИЧЕСКИ важная метрика для понимания прибыльности бизнеса.</p>

                    <div class="warning-highlight">
                        <h4>⚠️ Почему CPM важен:</h4>
                        <ul>
                            <li><strong>Определяет минимальную ставку:</strong> Если CPM = $1.80, то ставка ниже $1.80/миля = убыток</li>
                            <li><strong>Показывает эффективность:</strong> Низкий CPM = больше прибыли при той же ставке</li>
                            <li><strong>Помогает в переговорах:</strong> Знаете свой break-even point</li>
                            <li><strong>Планирование бюджета:</strong> Прогнозирование расходов на месяц/год</li>
                        </ul>
                    </div>

                    <h3>📊 Формула расчета CPM</h3>
                    <div class="success-highlight">
                        <h4>✅ CPM = Total Operating Costs ÷ Total Miles</h4>
                        <p><strong>Пример:</strong></p>
                        <ul>
                            <li>Месячные расходы: $18,000</li>
                            <li>Мили за месяц: 10,000</li>
                            <li>CPM = $18,000 ÷ 10,000 = <strong>$1.80/миля</strong></li>
                        </ul>
                    </div>

                    <h3>🔧 Fixed Costs (Фиксированные расходы)</h3>
                    <p><strong>Не зависят от пробега</strong> - платите даже если трак стоит:</p>

                    <div class="info-highlight">
                        <h4>💡 Основные Fixed Costs:</h4>
                        <ul>
                            <li><strong>Truck Payment:</strong> $1,500-2,500/месяц (lease или loan)</li>
                            <li><strong>Trailer Payment:</strong> $400-800/месяц</li>
                            <li><strong>Insurance:</strong> $800-1,500/месяц (liability + cargo + physical damage)</li>
                            <li><strong>Permits:</strong> $200-400/месяц (IRP, IFTA, UCR, 2290 amortized)</li>
                            <li><strong>Dispatcher Fee:</strong> 5-10% от gross (если используете)</li>
                            <li><strong>Office/Admin:</strong> $100-300/месяц (phone, internet, software)</li>
                        </ul>
                        <p><strong>Total Fixed Costs:</strong> $3,000-5,500/месяц</p>
                    </div>

                    <h3>⛽ Variable Costs (Переменные расходы)</h3>
                    <p><strong>Зависят от пробега</strong> - чем больше едете, тем больше платите:</p>

                    <div class="info-highlight">
                        <h4>💡 Основные Variable Costs:</h4>
                        <ul>
                            <li><strong>Fuel:</strong> $0.40-0.60/миля (зависит от цены топлива и MPG)</li>
                            <li><strong>Maintenance:</strong> $0.15-0.25/миля (oil changes, repairs, PM)</li>
                            <li><strong>Tires:</strong> $0.03-0.05/миля (замена каждые 100K-150K миль)</li>
                            <li><strong>Tolls:</strong> $0.02-0.10/миля (зависит от маршрута)</li>
                            <li><strong>Driver Pay:</strong> $0.40-0.60/миля (если платите per mile)</li>
                        </ul>
                        <p><strong>Total Variable Costs:</strong> $1.00-1.60/миля</p>
                    </div>

                    <h3>📈 Расчет Total CPM</h3>
                    <div class="success-highlight">
                        <h4>✅ Пример расчета для owner-operator:</h4>
                        <p><strong>Fixed Costs (месяц):</strong></p>
                        <ul>
                            <li>Truck payment: $2,000</li>
                            <li>Insurance: $1,200</li>
                            <li>Permits: $300</li>
                            <li>Admin: $200</li>
                            <li><strong>Total Fixed: $3,700/месяц</strong></li>
                        </ul>
                        <p><strong>Variable Costs (per mile):</strong></p>
                        <ul>
                            <li>Fuel: $0.50</li>
                            <li>Maintenance: $0.20</li>
                            <li>Tires: $0.04</li>
                            <li>Tolls: $0.05</li>
                            <li><strong>Total Variable: $0.79/миля</strong></li>
                        </ul>
                        <p><strong>Расчет CPM (10,000 миль/месяц):</strong></p>
                        <ul>
                            <li>Fixed per mile: $3,700 ÷ 10,000 = $0.37/миля</li>
                            <li>Variable: $0.79/миля</li>
                            <li><strong>Total CPM: $0.37 + $0.79 = $1.16/миля</strong></li>
                        </ul>
                    </div>

                    <h3>🎯 Целевые показатели CPM</h3>
                    <ul>
                        <li><strong>Owner-Operator (no driver):</strong> $1.00-1.30/миля</li>
                        <li><strong>Owner-Operator (with driver):</strong> $1.50-1.80/миля</li>
                        <li><strong>Small Fleet (2-5 trucks):</strong> $1.60-2.00/миля</li>
                        <li><strong>Medium Fleet (10+ trucks):</strong> $1.80-2.20/миля</li>
                    </ul>

                    <div class="warning-highlight">
                        <h4>⚠️ Как снизить CPM:</h4>
                        <ul>
                            <li><strong>Увеличить мили:</strong> Fixed costs распределяются на больше миль</li>
                            <li><strong>Улучшить MPG:</strong> Снизить скорость до 62-65 mph</li>
                            <li><strong>Preventive maintenance:</strong> Избежать дорогих поломок</li>
                            <li><strong>Negotiate insurance:</strong> Shop around каждый год</li>
                            <li><strong>Minimize deadhead:</strong> Меньше пустых миль</li>
                        </ul>
                    </div>
                </div>
            </section>

            <div class="case-study-block">
                <div class="case-study-header">
                    <span class="case-study-icon">💼</span>
                    <h3 class="case-study-title">Case Study: Снижение CPM с $1.95 до $1.65</h3>
                </div>
                <div class="case-study-content">
                    <p><strong>Ситуация:</strong> Owner-operator с 1 траком, CPM = $1.95/миля. При средней ставке $2.20/миля прибыль только $0.25/миля.</p>
                    <p><strong>Анализ расходов:</strong></p>
                    <ul>
                        <li><strong>Fixed costs:</strong> $4,200/месяц</li>
                        <li><strong>Variable costs:</strong> $0.95/миля</li>
                        <li><strong>Мили:</strong> 8,000/месяц</li>
                        <li><strong>CPM:</strong> ($4,200 ÷ 8,000) + $0.95 = $1.48 + $0.95 = $1.95/миля</li>
                    </ul>
                    <p><strong>Действия для снижения CPM:</strong></p>
                    <ul>
                        <li><strong>Увеличил мили:</strong> 8,000 → 10,000/месяц (лучшее планирование, меньше downtime)</li>
                        <li><strong>Улучшил MPG:</strong> 6.0 → 6.5 (снизил скорость, preventive maintenance)</li>
                        <li><strong>Снизил insurance:</strong> $1,500 → $1,200/месяц (нашел лучшую ставку)</li>
                        <li><strong>Preventive maintenance:</strong> Избежал 2 дорогих поломок ($3,000 экономии)</li>
                    </ul>
                    <p><strong>Новый CPM:</strong></p>
                    <ul>
                        <li>Fixed: $3,900/месяц (снизили insurance)</li>
                        <li>Variable: $0.82/миля (улучшили MPG)</li>
                        <li>Мили: 10,000/месяц</li>
                        <li>CPM: ($3,900 ÷ 10,000) + $0.82 = $0.39 + $0.82 = <strong>$1.21/миля</strong></li>
                    </ul>
                    <div class="case-study-highlight">
                        <strong>Результат:</strong> CPM снизился с $1.95 до $1.21 (экономия $0.74/миля). При 10,000 миль/месяц = <strong>$7,400/месяц дополнительной прибыли!</strong>
                    </div>
                </div>
            </div>

            <button class="audio-completion-btn" onclick="markAudioComplete(this, 'audio1', 'quiz-1')">
                🎧 Я закончил слушать этот блок
            </button>

            <div class="quick-check-block locked" id="quiz-1" data-quiz-id="quiz-10-1" data-correct-answer="b">
                <div class="quick-check-header">
                    <span class="quick-check-icon">✅</span>
                    <h3 class="quick-check-title">Быстрая проверка</h3>
                </div>
                <div class="quick-check-content">
                    <p class="quiz-question"><strong>Вопрос:</strong> Компания имеет fixed costs $4,000/месяц, variable costs $0.80/миля, и делает 10,000 миль/месяц. Какой CPM?</p>
                    <div class="quiz-options">
                        <div class="quiz-option" data-answer="a">
                            <span class="option-letter">A</span>
                            <span class="option-text">$1.00/миля</span>
                        </div>
                        <div class="quiz-option" data-answer="b">
                            <span class="option-letter">B</span>
                            <span class="option-text">$1.20/миля</span>
                        </div>
                        <div class="quiz-option" data-answer="c">
                            <span class="option-letter">C</span>
                            <span class="option-text">$1.60/миля</span>
                        </div>
                        <div class="quiz-option" data-answer="d">
                            <span class="option-letter">D</span>
                            <span class="option-text">$2.00/миля</span>
                        </div>
                    </div>
                    <div class="quiz-feedback">
                        <strong>Правильно! ✓</strong> CPM = (Fixed ÷ Miles) + Variable = ($4,000 ÷ 10,000) + $0.80 = $0.40 + $0.80 = $1.20/миля. Это минимальная ставка для break-even!
                    </div>
                </div>
            </div>
        </div>

'''

# Заменяем контент
new_full_content = content[:start_pos + len(start_marker)] + new_content + content[end_pos:]

# Записываем обратно
with open('pages/doc-module-10-complete.html', 'w', encoding='utf-8') as f:
    f.write(new_full_content)

print("✅ Сектор 1 создан успешно!")
print("Файл обновлен: pages/doc-module-10-complete.html")
