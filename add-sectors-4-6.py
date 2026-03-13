# -*- coding: utf-8 -*-
"""
Добавление секторов 4-6
"""

with open('pages/doc-module-10-complete.html', 'r', encoding='utf-8') as f:
    content = f.read()

nav_marker = '        <!-- Navigation -->'
nav_pos = content.find(nav_marker)

sectors = '''
        <!-- СЕКТОР 4: Profit Margins -->
        <div class="sector-wrapper">
            <div class="sector-number">04</div>
            <section class="content-block">
                <div class="block-header">
                    <h2 class="block-title">📊 Profit Margins - Прибыльность</h2>
                    <div class="audio-container">
                        <svg class="progress-ring">
                            <circle class="progress-ring-bg" cx="35" cy="35" r="32"></circle>
                            <circle class="progress-ring-fill" cx="35" cy="35" r="32"></circle>
                        </svg>
                        <button class="audio-btn" onclick="toggleAudio(this, 'audio4')">
                            <span class="play-icon">▶</span>
                            <span class="pause-icon">⏸</span>
                        </button>
                        <div class="progress-ring-interactive seekable" onclick="seekAudio(event, 'audio4')"></div>
                        <div class="audio-duration">0:00 / 0:00</div>
                        <div class="mobile-progress-bar" onclick="seekAudioMobile(event, 'audio4')">
                            <div class="mobile-progress-fill"></div>
                        </div>
                    </div>
                </div>
                <div class="block-content">
                    <h3>📊 Gross Profit vs Net Profit</h3>
                    <div class="success-highlight">
                        <h4>✅ Gross Profit:</h4>
                        <p><strong>Gross Profit = Revenue - Direct Costs</strong></p>
                        <p>Direct costs: fuel, driver pay, tolls</p>
                        <p><strong>Пример:</strong> Revenue $3,000 - Fuel $700 - Driver $600 - Tolls $50 = <strong>$1,650 gross profit</strong></p>
                    </div>

                    <div class="info-highlight">
                        <h4>💡 Net Profit:</h4>
                        <p><strong>Net Profit = Gross Profit - Fixed Costs</strong></p>
                        <p>Fixed costs: insurance, permits, truck payment, admin</p>
                        <p><strong>Пример:</strong> Gross $1,650 - Fixed $400 = <strong>$1,250 net profit</strong></p>
                    </div>

                    <h3>📈 Profit Margin формулы</h3>
                    <div class="success-highlight">
                        <h4>✅ Profit Margin % = (Net Profit ÷ Revenue) × 100</h4>
                        <p><strong>Пример:</strong></p>
                        <ul>
                            <li>Revenue: $3,000</li>
                            <li>Net Profit: $1,250</li>
                            <li>Margin: ($1,250 ÷ $3,000) × 100 = <strong>41.7%</strong></li>
                        </ul>
                        <p><strong>Целевой margin:</strong> 25-35% для здорового бизнеса</p>
                    </div>

                    <h3>🎯 Break-Even Point</h3>
                    <p><strong>Break-even</strong> - точка где доход = расходы (нет прибыли, нет убытка)</p>

                    <div class="warning-highlight">
                        <h4>⚠️ Расчет break-even rate:</h4>
                        <p><strong>Break-Even Rate = CPM</strong></p>
                        <p>Если ваш CPM = $1.80/миля, то минимальная ставка для break-even = $1.80/миля</p>
                        <p><strong>Для прибыли нужно:</strong> Rate > CPM + желаемая прибыль</p>
                        <p><strong>Пример:</strong> CPM $1.80 + $0.50 прибыль = минимум $2.30/миля</p>
                    </div>

                    <h3>💰 Минимальная прибыльная ставка</h3>
                    <div class="success-highlight">
                        <h4>✅ Формула минимальной ставки:</h4>
                        <p><strong>Min Rate = CPM + Desired Profit Per Mile</strong></p>
                        <p><strong>Примеры:</strong></p>
                        <ul>
                            <li>CPM $1.60 + $0.40 profit = <strong>$2.00/миля minimum</strong></li>
                            <li>CPM $1.80 + $0.50 profit = <strong>$2.30/миля minimum</strong></li>
                            <li>CPM $2.00 + $0.60 profit = <strong>$2.60/миля minimum</strong></li>
                        </ul>
                    </div>

                    <h3>📊 Анализ прибыльности грузов</h3>
                    <p><strong>Перед принятием груза проверяйте:</strong></p>
                    <ol>
                        <li><strong>Total miles:</strong> Loaded + deadhead</li>
                        <li><strong>RPM:</strong> Revenue ÷ total miles</li>
                        <li><strong>Profit per mile:</strong> RPM - CPM</li>
                        <li><strong>Total profit:</strong> Profit per mile × total miles</li>
                        <li><strong>Time value:</strong> Profit ÷ days on road</li>
                    </ol>

                    <div class="info-highlight">
                        <h4>💡 Пример анализа груза:</h4>
                        <p><strong>Груз:</strong> Chicago → LA, $3,500, 2,000 loaded miles, 100 deadhead</p>
                        <ul>
                            <li>Total miles: 2,100</li>
                            <li>RPM: $3,500 ÷ 2,100 = $1.67/миля</li>
                            <li>CPM: $1.50/миля</li>
                            <li>Profit per mile: $1.67 - $1.50 = $0.17/миля</li>
                            <li>Total profit: $0.17 × 2,100 = $357</li>
                            <li>Time: 3 дня</li>
                            <li>Profit per day: $357 ÷ 3 = $119/день</li>
                        </ul>
                        <p><strong>Вердикт:</strong> ❌ Слишком низкая прибыль! Ищите лучший груз или negotiate higher rate.</p>
                    </div>
                </div>
            </section>

            <div class="case-study-block">
                <div class="case-study-header">
                    <span class="case-study-icon">💼</span>
                    <h3 class="case-study-title">Case Study: Увеличение profit margin с 15% до 32%</h3>
                </div>
                <div class="case-study-content">
                    <p><strong>Ситуация:</strong> Компания с 3 траками, profit margin = 15% (ниже целевого 25-35%)</p>
                    <p><strong>Анализ показал:</strong></p>
                    <ul>
                        <li>Принимали грузы с profit $0.20-0.30/миля</li>
                        <li>Не анализировали прибыльность перед принятием</li>
                        <li>Высокий deadhead (18%)</li>
                        <li>Не требовали accessorial charges</li>
                    </ul>
                    <p><strong>Изменения:</strong></p>
                    <ul>
                        <li><strong>Минимальная прибыль:</strong> Установили правило - минимум $0.50/миля profit</li>
                        <li><strong>Анализ каждого груза:</strong> Калькулятор прибыльности перед принятием</li>
                        <li><strong>Снизили deadhead:</strong> 18% → 9%</li>
                        <li><strong>Accessorial charges:</strong> Detention, layover, TONU - всегда требуют</li>
                        <li><strong>Отказ от убыточных:</strong> Научились говорить "нет" низким ставкам</li>
                    </ul>
                    <p><strong>Результаты через квартал:</strong></p>
                    <ul>
                        <li>Profit margin: 15% → 32%</li>
                        <li>Средняя прибыль: $0.25/миля → $0.65/миля</li>
                        <li>Месячная прибыль: $7,500 → $19,500 (на 3 трака)</li>
                        <li>Годовая прибыль: $90,000 → $234,000</li>
                    </ul>
                    <div class="case-study-highlight">
                        <strong>Результат:</strong> Дополнительно $144,000/год прибыли! Просто за правильный анализ и отказ от убыточных грузов.
                    </div>
                </div>
            </div>

            <button class="audio-completion-btn" onclick="markAudioComplete(this, 'audio4', 'quiz-4')">
                🎧 Я закончил слушать этот блок
            </button>

            <div class="quick-check-block locked" id="quiz-4" data-quiz-id="quiz-10-4" data-correct-answer="c">
                <div class="quick-check-header">
                    <span class="quick-check-icon">✅</span>
                    <h3 class="quick-check-title">Быстрая проверка</h3>
                </div>
                <div class="quick-check-content">
                    <p class="quiz-question"><strong>Вопрос:</strong> Revenue $4,000, Net Profit $1,200. Какой profit margin?</p>
                    <div class="quiz-options">
                        <div class="quiz-option" data-answer="a">
                            <span class="option-letter">A</span>
                            <span class="option-text">20%</span>
                        </div>
                        <div class="quiz-option" data-answer="b">
                            <span class="option-letter">B</span>
                            <span class="option-text">25%</span>
                        </div>
                        <div class="quiz-option" data-answer="c">
                            <span class="option-letter">C</span>
                            <span class="option-text">30%</span>
                        </div>
                        <div class="quiz-option" data-answer="d">
                            <span class="option-letter">D</span>
                            <span class="option-text">35%</span>
                        </div>
                    </div>
                    <div class="quiz-feedback">
                        <strong>Правильно! ✓</strong> Profit Margin = (Net Profit ÷ Revenue) × 100 = ($1,200 ÷ $4,000) × 100 = 30%. Это здоровый margin!
                    </div>
                </div>
            </div>
        </div>

'''

new_content = content[:nav_pos] + sectors + content[nav_pos:]

with open('pages/doc-module-10-complete.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ Сектор 4 добавлен!")
print("Прогресс: 4/10 секторов (40%)")
