# -*- coding: utf-8 -*-
"""
Добавление секторов 5-7
"""

with open('pages/doc-module-10-complete.html', 'r', encoding='utf-8') as f:
    content = f.read()

nav_marker = '        <!-- Navigation -->'
nav_pos = content.find(nav_marker)

sectors = '''
        <!-- СЕКТОР 5: Factoring и Quick Pay -->
        <div class="sector-wrapper">
            <div class="sector-number">05</div>
            <section class="content-block">
                <div class="block-header">
                    <h2 class="block-title">💳 Factoring и Quick Pay - Cash Flow</h2>
                    <div class="audio-container">
                        <svg class="progress-ring">
                            <circle class="progress-ring-bg" cx="35" cy="35" r="32"></circle>
                            <circle class="progress-ring-fill" cx="35" cy="35" r="32"></circle>
                        </svg>
                        <button class="audio-btn" onclick="toggleAudio(this, 'audio5')">
                            <span class="play-icon">▶</span>
                            <span class="pause-icon">⏸</span>
                        </button>
                        <div class="progress-ring-interactive seekable" onclick="seekAudio(event, 'audio5')"></div>
                        <div class="audio-duration">0:00 / 0:00</div>
                        <div class="mobile-progress-bar" onclick="seekAudioMobile(event, 'audio5')">
                            <div class="mobile-progress-fill"></div>
                        </div>
                    </div>
                </div>
                <div class="block-content">
                    <h3>💳 Что такое Factoring?</h3>
                    <p><strong>Factoring</strong> - продажа ваших invoices факторинговой компании для быстрой оплаты (1-2 дня вместо 30 дней).</p>

                    <div class="success-highlight">
                        <h4>✅ Как работает Factoring:</h4>
                        <ol>
                            <li>Вы доставляете груз и получаете POD</li>
                            <li>Отправляете POD + invoice факторинговой компании</li>
                            <li>Factoring company платит вам 95-99% в течение 24 часов</li>
                            <li>Factoring company собирает оплату от брокера (30 дней)</li>
                            <li>Вы получаете оставшиеся 1-5% после оплаты брокером</li>
                        </ol>
                        <p><strong>Комиссия:</strong> 1-5% от invoice (зависит от объема и кредита брокера)</p>
                    </div>

                    <h3>💰 Стоимость Factoring</h3>
                    <div class="info-highlight">
                        <h4>💡 Типичные ставки:</h4>
                        <ul>
                            <li><strong>High volume (10+ loads/week):</strong> 1-2%</li>
                            <li><strong>Medium volume (5-10 loads/week):</strong> 2-3%</li>
                            <li><strong>Low volume (<5 loads/week):</strong> 3-5%</li>
                            <li><strong>Risky brokers:</strong> +1-2% extra</li>
                        </ul>
                        <p><strong>Пример:</strong> Invoice $3,000, комиссия 3% = $90. Вы получаете $2,910 за 24 часа вместо ожидания 30 дней.</p>
                    </div>

                    <h3>🏦 Топ Factoring компании</h3>
                    <div class="success-highlight">
                        <h4>✅ Рекомендуемые:</h4>
                        <ul>
                            <li><strong>RTS Financial:</strong> 1-3%, отличный сервис, быстрая оплата</li>
                            <li><strong>Triumph Business Capital:</strong> 1.5-3.5%, хорошие отчеты</li>
                            <li><strong>OTR Capital:</strong> 2-4%, специализация на trucking</li>
                            <li><strong>TBS Factoring:</strong> 2-5%, работают с новыми компаниями</li>
                            <li><strong>Apex Capital:</strong> 1.5-3%, большая сеть брокеров</li>
                        </ul>
                    </div>

                    <h3>⚡ Quick Pay от брокеров</h3>
                    <p><strong>Quick Pay</strong> - опция быстрой оплаты напрямую от брокера (без factoring company).</p>

                    <div class="info-highlight">
                        <h4>💡 Как работает Quick Pay:</h4>
                        <ul>
                            <li><strong>Срок:</strong> 1-5 дней после delivery</li>
                            <li><strong>Комиссия:</strong> 3-5% от invoice</li>
                            <li><strong>Процесс:</strong> Отправляете POD → брокер платит через 1-5 дней</li>
                        </ul>
                        <p><strong>Пример:</strong> Invoice $2,500, Quick Pay 4% = $100 комиссия. Получаете $2,400 через 2-3 дня.</p>
                    </div>

                    <h3>📊 Net 30 vs Quick Pay vs Factoring</h3>
                    <div class="warning-highlight">
                        <h4>⚠️ Сравнение:</h4>
                        <p><strong>Net 30 (стандарт):</strong></p>
                        <ul>
                            <li>Срок: 30 дней</li>
                            <li>Комиссия: 0%</li>
                            <li>Плюсы: Нет комиссии</li>
                            <li>Минусы: Долгое ожидание, проблемы с cash flow</li>
                        </ul>
                        <p><strong>Quick Pay:</strong></p>
                        <ul>
                            <li>Срок: 1-5 дней</li>
                            <li>Комиссия: 3-5%</li>
                            <li>Плюсы: Быстро, работаете напрямую с брокером</li>
                            <li>Минусы: Дороже чем factoring</li>
                        </ul>
                        <p><strong>Factoring:</strong></p>
                        <ul>
                            <li>Срок: 24 часа</li>
                            <li>Комиссия: 1-5%</li>
                            <li>Плюсы: Самый быстрый, credit check брокеров, collections service</li>
                            <li>Минусы: Дополнительная компания в процессе</li>
                        </ul>
                    </div>

                    <h3>💡 Когда использовать Factoring</h3>
                    <ul>
                        <li><strong>Новая компания:</strong> Нет cash reserves для ожидания 30 дней</li>
                        <li><strong>Рост бизнеса:</strong> Нужны деньги для fuel, driver pay</li>
                        <li><strong>Плохой cash flow:</strong> Расходы превышают доходы</li>
                        <li><strong>Risky brokers:</strong> Factoring проверяет кредит брокера</li>
                        <li><strong>Collections:</strong> Factoring занимается сбором долгов</li>
                    </ul>

                    <h3>🚫 Когда НЕ нужен Factoring</h3>
                    <ul>
                        <li>✅ Хороший cash flow (можете ждать 30 дней)</li>
                        <li>✅ Работаете с direct shippers (платят быстрее)</li>
                        <li>✅ Большие cash reserves</li>
                        <li>✅ Низкий объем (комиссия 5% слишком дорого)</li>
                    </ul>
                </div>
            </section>

            <div class="case-study-block">
                <div class="case-study-header">
                    <span class="case-study-icon">💼</span>
                    <h3 class="case-study-title">Case Study: Factoring спас бизнес от банкротства</h3>
                </div>
                <div class="case-study-content">
                    <p><strong>Ситуация:</strong> Новая компания с 2 траками, работали на Net 30. Через 2 месяца - кризис cash flow.</p>
                    <p><strong>Проблемы:</strong></p>
                    <ul>
                        <li>$45,000 outstanding invoices (ждут оплаты)</li>
                        <li>Нет денег на fuel ($6,000 нужно)</li>
                        <li>Driver pay задержан на неделю</li>
                        <li>Insurance payment через 3 дня ($2,400)</li>
                        <li>Траки стоят - нет денег на топливо</li>
                    </ul>
                    <p><strong>Решение:</strong> Подписали контракт с RTS Financial (2.5% комиссия)</p>
                    <p><strong>Результаты:</strong></p>
                    <ul>
                        <li>Отправили все PODs → получили $43,875 за 24 часа (97.5%)</li>
                        <li>Заплатили fuel, driver pay, insurance</li>
                        <li>Траки вернулись на дорогу</li>
                        <li>Стабильный cash flow - деньги каждый день</li>
                        <li>Через 6 месяцев: накопили $20,000 reserves</li>
                    </ul>
                    <div class="case-study-highlight">
                        <strong>Итог:</strong> Factoring стоил $1,125 (2.5% от $45K), но спас бизнес от банкротства. Теперь работают на Net 30 с хорошим cash flow.
                    </div>
                </div>
            </div>

            <button class="audio-completion-btn" onclick="markAudioComplete(this, 'audio5', 'quiz-5')">
                🎧 Я закончил слушать этот блок
            </button>

            <div class="quick-check-block locked" id="quiz-5" data-quiz-id="quiz-10-5" data-correct-answer="b">
                <div class="quick-check-header">
                    <span class="quick-check-icon">✅</span>
                    <h3 class="quick-check-title">Быстрая проверка</h3>
                </div>
                <div class="quick-check-content">
                    <p class="quiz-question"><strong>Вопрос:</strong> Invoice $5,000, factoring комиссия 3%. Сколько получите за 24 часа?</p>
                    <div class="quiz-options">
                        <div class="quiz-option" data-answer="a">
                            <span class="option-letter">A</span>
                            <span class="option-text">$5,000</span>
                        </div>
                        <div class="quiz-option" data-answer="b">
                            <span class="option-letter">B</span>
                            <span class="option-text">$4,850</span>
                        </div>
                        <div class="quiz-option" data-answer="c">
                            <span class="option-letter">C</span>
                            <span class="option-text">$4,700</span>
                        </div>
                        <div class="quiz-option" data-answer="d">
                            <span class="option-letter">D</span>
                            <span class="option-text">$4,500</span>
                        </div>
                    </div>
                    <div class="quiz-feedback">
                        <strong>Правильно! ✓</strong> Factoring advance = $5,000 × 97% = $4,850 (3% комиссия = $150). Оставшиеся $150 получите после оплаты брокером.
                    </div>
                </div>
            </div>
        </div>

'''

new_content = content[:nav_pos] + sectors + content[nav_pos:]

with open('pages/doc-module-10-complete.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ Сектор 5 добавлен!")
print("Прогресс: 5/10 секторов (50%)")
