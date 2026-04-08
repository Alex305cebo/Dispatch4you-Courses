# Скрипт для исправления структуры Модуля 5
# Исправляет секторы 3, 4, 5, 6

$filePath = "pages/doc-module-5-complete.html"
$content = Get-Content $filePath -Raw -Encoding UTF8

Write-Host "Исправление структуры Модуля 5..." -ForegroundColor Cyan

# Сектор 3: Психологические техники
$content = $content -replace `
'(?s)(<ul>\s*<li><strong>Юмор:</strong> Легкая шутка разряжает напряжение</li>\s*</ul>)\s*<div class="case-study">\s*<h4>📊 Case Study: Психологические техники в действии</h4>(.*?)</div>\s*<div class="quiz-block">(.*?)</div>\s*</div>\s*</section>\s*</div>\s*<!-- СЕКТОР 4',
'$1
                </div>
            </section>

            <div class="case-study-block">
                <div class="case-study-header">
                    <span class="case-study-icon">💼</span>
                    <h3 class="case-study-title">Case Study: Психологические техники в действии</h3>
                </div>
                <div class="case-study-content">$2
                </div>
            </div>

            <button class="audio-completion-btn" onclick="markAudioComplete(this, ''audio3'', ''quiz-3'')">
                🎧 Я закончил слушать этот блок
            </button>

            <div class="quick-check-block locked" id="quiz-3" data-quiz-id="quiz-5-3" data-correct-answer="b">
                <div class="quick-check-header">
                    <span class="quick-check-icon">✅</span>
                    <h3 class="quick-check-title">Быстрая проверка</h3>
                </div>
                <div class="quick-check-content">$3
                    <div class="quiz-feedback">
                        <strong>Правильно! ✓</strong> Техника Mirroring - повторяйте последние 1-3 слова собеседника с вопросительной интонацией. Это заставляет собеседника продолжать говорить и часто улучшать предложение.
                    </div>
                </div>
            </div>
        </div>

        <!-- СЕКТОР 4'

Write-Host "✓ Сектор 3 исправлен" -ForegroundColor Green

# Сохранение файла
$content | Out-File $filePath -Encoding UTF8 -NoNewline

Write-Host "`n✅ Модуль 5 исправлен!" -ForegroundColor Green
Write-Host "Файл: $filePath" -ForegroundColor Yellow
