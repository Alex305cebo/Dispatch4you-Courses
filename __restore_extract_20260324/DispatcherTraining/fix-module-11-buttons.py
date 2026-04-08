#!/usr/bin/env python3
"""
Исправление кнопок в модуле 11
"""

with open('pages/doc-module-11-complete.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Исправление 1: Закрыть quiz-3 правильно и добавить кнопку
old_quiz3 = '''                    <div class="quiz-feedback">
                        <strong>Правильно! ✓</strong> Detention pay обычно $50-75/час после 2 часов free time. Это
                        компенсация за потерянное время и упущенную прибыль!
                    
                </div>
            </div>
                </div>
            </div>
            <div class="quiz-options">'''

new_quiz3 = '''                    <div class="quiz-feedback">
                        <strong>Правильно! ✓</strong> Detention pay обычно $50-75/час после 2 часов free time. Это
                        компенсация за потерянное время и упущенную прибыль!
                    </div>
                </div>

                <button class="audio-completion-btn" onclick="markAudioComplete(this, 'audio3', 'quiz-3')">
                    🎧 Я закончил слушать этот блок
                </button>
            </div>

        </div>

        <!-- СЕКТОР 4: Планирование маршрутов -->
        <div class="sector-wrapper">
            <div class="sector-number">04</div>
            <section class="content-block">
                <div class="block-header">
                    <h2 class="block-title">🗺️ Планирование маршрутов</h2>
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
                    <h3>🗺️ Планирование маршрутов</h3>
                    <p><strong>Вопрос:</strong> Сколько миль в неделю должен проезжать OTR водитель?</p>

            <div class="quick-check-block locked" id="quiz-4" data-quiz-id="quiz-11-4" data-correct-answer="a">
                <div class="quick-check-header">
                    <span class="quick-check-icon">✅</span>
                    <h3 class="quick-check-title">Быстрая проверка</h3>
                </div>
                <div class="quick-check-content">
                    <p class="quiz-question"><strong>Вопрос:</strong> Сколько миль в неделю должен проезжать OTR водитель?</p>
                    <div class="quiz-options">'''

content = content.replace(old_quiz3, new_quiz3)

# Исправление 2: Заменить неправильную кнопку audio2 на audio4
old_button = '''                    <div class="quiz-feedback">
                        <strong>Правильно! ✓</strong> Breakdown - легитимная причина для отказа (форс-мажор). Но нужно
                        немедленно уведомить брокера и предложить решение. Отказ из-за более высокой ставки - blacklist!</div>
            </div>

            <button class="audio-completion-btn" onclick="markAudioComplete(this, 'audio2', 'quiz-2')">
                🎧 Я закончил слушать этот блок
            </button>'''

new_button = '''                    <div class="quiz-feedback">
                        <strong>Правильно! ✓</strong> Breakdown - легитимная причина для отказа (форс-мажор). Но нужно
                        немедленно уведомить брокера и предложить решение. Отказ из-за более высокой ставки - blacklist!
                    </div>
                </div>

                <button class="audio-completion-btn" onclick="markAudioComplete(this, 'audio4', 'quiz-4')">
                    🎧 Я закончил слушать этот блок
                </button>
            </div>'''

content = content.replace(old_button, new_button)

# Исправление 3: Убрать дублирующиеся quiz-options для quiz-4
old_duplicate = '''                <div class="quiz-option" data-answer="a">
                    <span class="option-letter">A</span>
                    <span class="option-text">2,000-2,500 миль</span>
                </div>
                <div class="quiz-option" data-answer="b">
                    <span class="option-letter">B</span>
                    <span class="option-text">1,000-1,500 миль</span>
                </div>
                <div class="quiz-option" data-answer="c">
                    <span class="option-letter">C</span>
                    <span class="option-text">3,000-3,500 миль</span>
                </div>
                <div class="quiz-option" data-answer="d">
                    <span class="option-letter">D</span>
                    <span class="option-text">500-1,000 миль</span>
                </div>
            </div>
            <div class="quiz-feedback">
                <strong>Правильно! ✓</strong> 2,000-2,500 миль/неделю - реалистичный и прибыльный показатель для
                OTR водителя. Это позволяет водителю зарабатывать $1,000-1,500/неделю при ставке
                $0.50-0.60/миля.
            </div>
        </div>

        <!-- СЕКТОР 4: Планирование маршрутов -->
        <div class="sector-wrapper">
            <div class="sector-number">04</div>
            <section class="content-block">
                <div class="block-header">
                    <h2 class="block-title">🗺️ Планирование маршрутов</h2>
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
                    <h3>🗺️ Планирование маршрутов</h3>
                    <p><strong>Вопрос:</strong> Сколько миль в неделю должен проезжать OTR водитель?</p>

            <div class="quick-check-block locked" id="quiz-4" data-quiz-id="quiz-11-4" data-correct-answer="a">
                <div class="quick-check-header">
                    <span class="quick-check-icon">✅</span>
                    <h3 class="quick-check-title">Быстрая проверка</h3>
                </div>
                <div class="quick-check-content">
                    <p class="quiz-question"><strong>Вопрос:</strong> Когда можно легитимно отказаться от груза?</p>
                    <div class="quiz-options">
                        <div class="quiz-option" data-answer="a">
                            <span class="option-letter">A</span>
                            <span class="option-text">Трак сломался (breakdown)</span>
                        </div>
                        <div class="quiz-option" data-answer="b">
                            <span class="option-letter">B</span>
                            <span class="option-text">Нашли груз дороже</span>
                        </div>
                        <div class="quiz-option" data-answer="c">
                            <span class="option-letter">C</span>
                            <span class="option-text">Водитель не хочет ехать туда</span>
                        </div>
                        <div class="quiz-option" data-answer="d">
                            <span class="option-letter">D</span>
                            <span class="option-text">Ставка кажется низкой</span>
                        </div>
                    </div>'''

new_duplicate = '''                <div class="quiz-option" data-answer="a">
                    <span class="option-letter">A</span>
                    <span class="option-text">Трак сломался (breakdown)</span>
                </div>
                <div class="quiz-option" data-answer="b">
                    <span class="option-letter">B</span>
                    <span class="option-text">Нашли груз дороже</span>
                </div>
                <div class="quiz-option" data-answer="c">
                    <span class="option-letter">C</span>
                    <span class="option-text">Водитель не хочет ехать туда</span>
                </div>
                <div class="quiz-option" data-answer="d">
                    <span class="option-letter">D</span>
                    <span class="option-text">Ставка кажется низкой</span>
                </div>'''

content = content.replace(old_duplicate, new_duplicate)

with open('pages/doc-module-11-complete.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Модуль 11 исправлен!")
print("- Добавлена кнопка для quiz-3")
print("- Исправлена кнопка для quiz-4 (audio2 → audio4)")
print("- Удалены дублирующиеся элементы")
