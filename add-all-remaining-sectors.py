# -*- coding: utf-8 -*-
"""
Скрипт для добавления секторов 3-10 в Модуль 10
"""

# Читаем текущий файл
with open('pages/doc-module-10-complete.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Найдем маркер навигации
nav_marker = '        <!-- Navigation -->'
nav_pos = content.find(nav_marker)

if nav_pos == -1:
    print("Ошибка: не найден маркер навигации")
    exit(1)

# Контент для секторов 3-10 (все сразу)
sectors_content = '''
        <!-- СЕКТОР 3: Revenue Per Mile (RPM) -->
        <div class="sector-wrapper">
            <div class="sector-number">03</div>
            <section class="content-block">
                <div class="block-header">
                    <h2 class="block-title">💵 Revenue Per Mile (RPM) - Доходность</h2>
                    <div class="audio-container">
                        <svg class="progress-ring">
                            <circle class="progress-ring-bg" cx="35" cy="35" r="32"></circle>
                            <circle class="progress-ring-fill" cx="35" cy="35" r="32"></circle>
                        </svg>
                        <button class="audio-btn" onclick="toggleAudio(this, 'audio3')">
                            <span class="play-icon">▶</span>
                            <span class="pause-icon">⏸</span>
                        </button>
                        <div class="progress-ring-interactive seekable" onclick="seekAudio(event, 'audio3')"></div>
                        <div class="audio-duration">0:00 / 0:00</div>
                        <div class="mobile-progress-bar" onclick="seekAudioMobile(event, 'audio3')">
                            <div class="mobile-progress-fill"></div>
                        </div>
                    </div>
                </div>
                <div class="block-content">
                    <h3>💵 Что такое Revenue Per Mile (RPM)?</h3>
                    <p><strong>RPM</strong> - это доход на одну милю. Показывает сколько вы зарабатываете с каждой мили.</p>

                    <div class="success-highlight">
                        <h4>✅ Формула RPM:</h4>
                        <p><strong>RPM = Total Revenue ÷ Total Miles</strong></p>
                        <p><strong>Пример:</strong></p>
                        <ul>
                            <li>Груз: $2,500</li>
                            <li>Total miles: 1,200</li>
                            <li>RPM = $2,500 ÷ 1,200 = <strong>$2.08/миля</strong></li>
                        </ul>
                    </div>

                    <h3>📊 Loaded Miles vs Total Miles</h3>
                    <div class="warning-highlight">
                        <h4>⚠️ Критическая разница:</h4>
                        <ul>
                            <li><strong>Loaded Miles:</strong> Мили с грузом (платные)</li>
                            <li><strong>Deadhead Miles:</strong> Пустые мили (неоплачиваемые)</li>
                            <li><strong>Total Miles:</strong> Loaded + Deadhead</li>
                        </ul>
                        <p><strong>Пример:</strong></p>
                        <ul>
                            <li>Груз Chicago → Dallas: $2,400 за 1,000 loaded miles</li>
                            <li>Deadhead к pickup: 100 миль</li>
                            <li>Total miles: 1,100</li>
                            <li><strong>RPM (loaded):</strong> $2,400 ÷ 1,000 = $2.40/миля</li>
                            <li><strong>RPM (total):</strong> $2,400 ÷ 1,100 = $2.18/миля</li>
                            <li><strong>Реальная прибыль ниже на $0.22/миля!</strong></li>
                        </ul>
                    </div>

                    <h3>🎯 Целевые показатели RPM</h3>
                    <div class="success-highlight">
                        <h4>✅ Минимальные RPM для прибыльности:</h4>
                        <ul>
                            <li><strong>Dry Van:</strong> $2.00-2.50/миля (total miles)</li>
                            <li><strong>Reefer:</strong> $2.50-3.00/миля</li>
                            <li><strong>Flatbed:</strong> $2.50-3.50/миля</li>
                            <li><strong>Specialized:</strong> $3.00-5.00/миля</li>
                        </ul>
                        <p><strong>Правило:</strong> RPM должен быть минимум на $0.50-0.80 выше чем CPM для прибыли!</p>
                    </div>

                    <h3>📉 Deadhead Impact на RPM</h3>
                    <p><strong>Deadhead убивает прибыль!</strong> Каждая пустая миля снижает ваш RPM.</p>

                    <div class="info-highlight">
                        <h4>💡 Пример влияния deadhead:</h4>
                        <p><strong>Груз:</strong> $3,000 за 1,000 loaded miles</p>
                        <ul>
                            <li><strong>0% deadhead:</strong> RPM = $3,000 ÷ 1,000 = $3.00/миля</li>
                            <li><strong>10% deadhead (100 миль):</strong> RPM = $3,000 ÷ 1,100 = $2.73/миля (-$0.27)</li>
                            <li><strong>20% deadhead (200 миль):</strong> RPM = $3,000 ÷ 1,200 = $2.50/миля (-$0.50)</li>
                            <li><strong>30% deadhead (300 миль):</strong> RPM = $3,000 ÷ 1,300 = $2.31/миля (-$0.69)</li>
                        </ul>
                        <p><strong>Вывод:</strong> Держите deadhead ниже 10% для максимальной прибыли!</p>
                    </div>

                    <h3>🚀 Как увеличить RPM</h3>
                    <ol>
                        <li><strong>Negotiate higher rates:</strong> Не соглашайтесь на первое предложение</li>
                        <li><strong>Minimize deadhead:</strong> Ищите backhaul грузы</li>
                        <li><strong>Target high-paying lanes:</strong> CA, TX, FL обычно платят больше</li>
                        <li><strong>Specialized equipment:</strong> Reefer, flatbed платят на 20-30% больше</li>
                        <li><strong>Direct shippers:</strong> Работайте напрямую, избегайте брокеров когда возможно</li>
                        <li><strong>Seasonal demand:</strong> Используйте peak seasons (produce season, holidays)</li>
                        <li><strong>Accessorial charges:</strong> Detention, layover, TONU - всегда требуйте оплату</li>
                    </ol>

                    <h3>📊 RPM Benchmarks по регионам</h3>
                    <div class="success-highlight">
                        <h4>✅ Средний RPM по популярным lanes (Dry Van):</h4>
                        <ul>
                            <li><strong>CA → TX:</strong> $2.80-3.20/миля</li>
                            <li><strong>TX → CA:</strong> $2.20-2.60/миля (backhaul)</li>
                            <li><strong>Midwest → East Coast:</strong> $2.40-2.80/миля</li>
                            <li><strong>FL → Northeast:</strong> $2.60-3.00/миля</li>
                            <li><strong>Short hauls (<250 миль):</strong> $3.00-4.00/миля</li>
                        </ul>
                    </div>
                </div>
            </section>

            <div class="case-study-block">
                <div class="case-study-header">
                    <span class="case-study-icon">💼</span>
                    <h3 class="case-study-title">Case Study: Увеличение RPM с $2.10 до $2.65</h3>
                </div>
                <div class="case-study-content">
                    <p><strong>Ситуация:</strong> Dispatcher принимал любые грузы, средний RPM = $2.10/миля (total miles). При CPM $1.80 прибыль только $0.30/миля.</p>
                    <p><strong>Проблемы:</strong></p>
                    <ul>
                        <li>Deadhead 20-25% (плохое планирование)</li>
                        <li>Соглашался на первую ставку брокера</li>
                        <li>Не требовал detention pay</li>
                        <li>Работал только с брокерами (no direct shippers)</li>
                    </ul>
                    <p><strong>Изменения:</strong></p>
                    <ul>
                        <li><strong>Снизил deadhead:</strong> 25% → 8% (лучшее планирование, backhaul search)</li>
                        <li><strong>Negotiation:</strong> Начал торговаться, +$0.10-0.20/миля в среднем</li>
                        <li><strong>Detention pay:</strong> Требует $50-75/час после 2 часов ожидания</li>
                        <li><strong>Direct shippers:</strong> Нашел 3 постоянных клиентов (на 15% выше ставки)</li>
                        <li><strong>High-paying lanes:</strong> Фокус на CA, TX, FL</li>
                    </ul>
                    <p><strong>Результаты через 2 месяца:</strong></p>
                    <ul>
                        <li>RPM: $2.10 → $2.65/миля (+$0.55)</li>
                        <li>Deadhead: 25% → 8%</li>
                        <li>Detention pay: +$200-300/месяц</li>
                        <li>Прибыль: $0.30/миля → $0.85/миля</li>
                        <li>При 10,000 миль/месяц: $0.55 × 10,000 = <strong>$5,500/месяц дополнительного дохода!</strong></li>
                    </ul>
                    <div class="case-study-highlight">
                        <strong>Годовая прибыль:</strong> $5,500 × 12 = <strong>$66,000/год!</strong> Просто за лучшее планирование и переговоры.
                    </div>
                </div>
            </div>

            <button class="audio-completion-btn" onclick="markAudioComplete(this, 'audio3', 'quiz-3')">
                🎧 Я закончил слушать этот блок
            </button>

            <div class="quick-check-block locked" id="quiz-3" data-quiz-id="quiz-10-3" data-correct-answer="b">
                <div class="quick-check-header">
                    <span class="quick-check-icon">✅</span>
                    <h3 class="quick-check-title">Быстрая проверка</h3>
                </div>
                <div class="quick-check-content">
                    <p class="quiz-question"><strong>Вопрос:</strong> Груз $2,800 за 1,000 loaded miles + 200 deadhead miles. Какой RPM (total)?</p>
                    <div class="quiz-options">
                        <div class="quiz-option" data-answer="a">
                            <span class="option-letter">A</span>
                            <span class="option-text">$2.80/миля</span>
                        </div>
                        <div class="quiz-option" data-answer="b">
                            <span class="option-letter">B</span>
                            <span class="option-text">$2.33/миля</span>
                        </div>
                        <div class="quiz-option" data-answer="c">
                            <span class="option-letter">C</span>
                            <span class="option-text">$2.50/миля</span>
                        </div>
                        <div class="quiz-option" data-answer="d">
                            <span class="option-letter">D</span>
                            <span class="option-text">$3.00/миля</span>
                        </div>
                    </div>
                    <div class="quiz-feedback">
                        <strong>Правильно! ✓</strong> RPM = Revenue ÷ Total Miles = $2,800 ÷ (1,000 + 200) = $2,800 ÷ 1,200 = $2.33/миля. Deadhead снизил RPM на $0.47!
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

print("✅ Сектор 3 добавлен успешно!")
print("Прогресс: 3/10 секторов (30%)")
