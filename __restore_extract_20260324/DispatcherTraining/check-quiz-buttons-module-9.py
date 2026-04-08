#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Check if all quizzes in module 9 have buttons
"""

import re

with open('pages/doc-module-9-complete.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all quizzes
quizzes = re.findall(r'<div class="quick-check-block[^"]*" id="(quiz-\d+)".*?(?=<div class="quick-check-block|<!-- СЕКТОР|</div>\s*</div>\s*<!-- Navigation)', content, re.DOTALL)

print(f"Найдено квизов: {len(quizzes)}")

# Check each quiz for button
for i in range(1, 8):  # Module 9 has 7 sectors
    quiz_id = f'quiz-{i}'
    
    # Find quiz content
    pattern = rf'<div class="quick-check-block[^"]*" id="{quiz_id}".*?(?=<div class="quick-check-block|<!-- СЕКТОР|</div>\s*</div>\s*<!-- Navigation)'
    match = re.search(pattern, content, re.DOTALL)
    
    if match:
        quiz_content = match.group(0)
        
        # Check for button
        has_button = 'audio-completion-btn' in quiz_content
        button_inside_feedback = False
        
        if has_button:
            # Check if button is inside quiz-feedback (wrong) or outside (correct)
            feedback_pattern = r'<div class="quiz-feedback">(.*?)</div>'
            feedback_match = re.search(feedback_pattern, quiz_content, re.DOTALL)
            if feedback_match:
                feedback_content = feedback_match.group(1)
                button_inside_feedback = 'audio-completion-btn' in feedback_content
        
        status = "✓" if has_button and not button_inside_feedback else "⚠️"
        print(f"\n{status} Quiz {i}:")
        print(f"  Кнопка есть: {'Да' if has_button else 'НЕТ'}")
        if has_button:
            print(f"  Кнопка внутри feedback: {'Да (НЕПРАВИЛЬНО!)' if button_inside_feedback else 'Нет (правильно)'}")
    else:
        print(f"\n❌ Quiz {i}: НЕ НАЙДЕН")
