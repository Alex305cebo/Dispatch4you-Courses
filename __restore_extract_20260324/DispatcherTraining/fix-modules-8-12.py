#!/usr/bin/env python3
import re

modules = [8, 9, 10, 11, 12]

for mod_num in modules:
    filepath = f'pages/doc-module-{mod_num}-complete.html'
    print(f"Исправляю модуль {mod_num}...")
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Паттерн: quiz-feedback с кнопкой внутри + лишние закрывающие теги
    pattern = r'(<div class="quiz-feedback">.*?)</div>\s*</div>\s*</div>\s*</div>\s*</div>\s*\n\s*<!-- СЕКТОР'
    
    def fix_quiz(match):
        feedback = match.group(1)
        # Извлекаем кнопку
        button_pattern = r'<button class="audio-completion-btn"[^>]*>.*?</button>'
        button_match = re.search(button_pattern, feedback, re.DOTALL)
        
        if button_match:
            button = button_match.group(0)
            # Убираем кнопку из feedback
            feedback_clean = re.sub(button_pattern, '', feedback, flags=re.DOTALL).strip()
            # Правильная структура
            return f'{feedback_clean}</div>\n            </div>\n\n            {button}\n        </div>\n\n        <!-- СЕКТОР'
        return match.group(0)
    
    fixed = re.sub(pattern, fix_quiz, content, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(fixed)
    
    print(f"✅ Модуль {mod_num} исправлен")

print("\n🎉 Все модули 8-12 исправлены!")
