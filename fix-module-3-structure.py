#!/usr/bin/env python3
"""
Исправление структуры quiz блоков в модуле 3
Кнопки должны быть внутри quiz блока, но вне quiz-content
"""

with open('pages/doc-module-3-complete.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Исправление quiz-2: переместить кнопку внутрь quiz блока
old_quiz2 = '''            </div>

            <button class="audio-completion-btn" onclick="markAudioComplete(this, 'audio2', 'quiz-2')">
                🎧 Я закончил слушать этот блок
            </button>

            <div class="quick-check-block locked" id="quiz-2" data-quiz-id="quiz-3-2" data-correct-answer="b">
                <div class="quick-check-header">
                    <span class="quick-check-icon">✅</span>
                    <h3 class="quick-check-title">Быстрая проверка</h3>
                </div>
                <div class="quick-check-content">
                    <p class="quiz-question"><strong>Вопрос:</strong> Какая максимальная высота груза для Step Deck без
                        oversized permit?</p>
                    <div class="quiz-options">
                        <div class="quiz-option" data-answer="a">
                            <span class="option-letter">A</span>
                            <span class="option-text">8-9 футов</span>
                        </div>
                        <div class="quiz-option" data-answer="b">
                            <span class="option-letter">B</span>
                            <span class="option-text">10-11 футов</span>
                        </div>
                        <div class="quiz-option" data-answer="c">
                            <span class="option-letter">C</span>
                            <span class="option-text">13-14 футов</span>
                        </div>
                    </div>
                    <div class="quiz-feedback">
                        <strong>Правильно! ✓</strong> Step Deck позволяет перевозить грузы высотой 10-11 футов без
                        oversized permits благодаря низкой платформе.
                    </div>
                </div>
            </div>'''

new_quiz2 = '''            </div>

            <div class="quick-check-block locked" id="quiz-2" data-quiz-id="quiz-3-2" data-correct-answer="b">
                <div class="quick-check-header">
                    <span class="quick-check-icon">✅</span>
                    <h3 class="quick-check-title">Быстрая проверка</h3>
                </div>
                <div class="quick-check-content">
                    <p class="quiz-question"><strong>Вопрос:</strong> Какая максимальная высота груза для Step Deck без
                        oversized permit?</p>
                    <div class="quiz-options">
                        <div class="quiz-option" data-answer="a">
                            <span class="option-letter">A</span>
                            <span class="option-text">8-9 футов</span>
                        </div>
                        <div class="quiz-option" data-answer="b">
                            <span class="option-letter">B</span>
                            <span class="option-text">10-11 футов</span>
                        </div>
                        <div class="quiz-option" data-answer="c">
                            <span class="option-letter">C</span>
                            <span class="option-text">13-14 футов</span>
                        </div>
                    </div>
                    <div class="quiz-feedback">
                        <strong>Правильно! ✓</strong> Step Deck позволяет перевозить грузы высотой 10-11 футов без
                        oversized permits благодаря низкой платформе.
                    </div>
                </div>

                <button class="audio-completion-btn" onclick="markAudioComplete(this, 'audio2', 'quiz-2')">
                    🎧 Я закончил слушать этот блок
                </button>
            </div>'''

content = content.replace(old_quiz2, new_quiz2)

with open('pages/doc-module-3-complete.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Модуль 3 исправлен!")
print("- Quiz-1: Кнопка перемещена внутрь quiz блока (уже исправлено)")
print("- Quiz-2: Кнопка перемещена внутрь quiz блока")
