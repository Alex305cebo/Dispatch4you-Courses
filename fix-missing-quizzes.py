#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Добавление недостающих квизов 6 и 7 в модуль 10
"""

import re

# Читаем файл
with open('pages/doc-module-10-complete.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Quiz 6 для сектора Budgeting
quiz_6 = '''
                <!-- Quiz -->
                <div class="quiz-container" id="quiz-10-6">
                    <h4>Проверь себя:</h4>
                    <p class="quiz-question">Какой процент дохода рекомендуется откладывать в emergency fund?</p>
                    <div class="quiz-options">
                        <div class="quiz-option" data-correct="false">1-3%</div>
                        <div class="quiz-option" data-correct="false">3-5%</div>
                        <div class="quiz-option" data-correct="true">5-10%</div>
                        <div class="quiz-option" data-correct="false">15-20%</div>
                    </div>
                    <div class="quiz-feedback"></div>
                </div>
'''

# Quiz 7 для сектора Taxes
quiz_7 = '''
                <!-- Quiz -->

                <div class="quiz-container" id="quiz-10-7">
                    <h4>Проверь себя:</h4>
                    <p class="quiz-question">Как часто нужно подавать IFTA отчеты?</p>
                    <div class="quiz-options">
                        <div class="quiz-option" data-correct="false">Ежемесячно</div>
                        <div class="quiz-option" data-correct="true">Ежеквартально</div>
                        <div class="quiz-option" data-correct="false">Раз в полгода</div>
                        <div class="quiz-option" data-correct="false">Ежегодно</div>
                    </div>
                    <div class="quiz-feedback"></div>
                </div>
'''

# Ищем место для вставки quiz-6 (после case study сектора 6, перед закрытием sector-content)
# Сектор 6 - это Budgeting, ищем его case study
pattern_6 = r'(<!-- Case Study -->\s*<div class="case-study">.*?</div>\s*)(</div>\s*</div>\s*<!-- Сектор 7)'
match_6 = re.search(pattern_6, content, re.DOTALL)

if match_6:
    content = content[:match_6.end(1)] + quiz_6 + '\n            ' + content[match_6.start(2):]
    print("✅ Quiz 6 добавлен")
else:
    print("❌ Не найдено место для quiz 6")

# Ищем место для вставки quiz-7 (после case study сектора 7, перед закрытием sector-content)
# Сектор 7 - это Taxes
pattern_7 = r'(<!-- Case Study -->\s*<div class="case-study">.*?</div>\s*)(</div>\s*</div>\s*<!-- Сектор 8)'
match_7 = re.search(pattern_7, content, re.DOTALL)

if match_7:
    content = content[:match_7.end(1)] + quiz_7 + '\n            ' + content[match_7.start(2):]
    print("✅ Quiz 7 добавлен")
else:
    print("❌ Не найдено место для quiz 7")

# Сохраняем
with open('pages/doc-module-10-complete.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Квизы 6 и 7 успешно добавлены!")
