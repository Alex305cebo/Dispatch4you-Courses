#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Полное создание модуля 11 с 6 секторами о кризисных ситуациях
"""

import re

# Читаем базовый файл модуля 8 как шаблон
with open('pages/doc-module-8-complete.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Заменяем базовую информацию
content = content.replace('Модуль 8 из 12', 'Модуль 11 из 12')
content = content.replace('Управление водителями', 'Кризисные ситуации и решение проблем')
content = content.replace('67%', '92%')
content = content.replace('doc-module-7-complete.html', 'doc-module-10-complete.html')
content = content.replace('doc-module-9-complete.html', 'doc-module-12-complete.html')
content = content.replace('Модуль 8: Управление водителями', 'Модуль 11: Кризисные ситуации')

# Заменяем аудио файлы
for i in range(1, 7):
    content = content.replace(f'module-8-sector-{i}.mp3', f'module-11-sector-{i}.mp3')

# Заменяем quiz ID
content = re.sub(r'quiz-8-(\d)', r'quiz-11-\1', content)
content = re.sub(r'data-quiz-id="quiz-11-', r'data-quiz-id="quiz-11-', content)

print("✅ Базовые замены выполнены")
print("⏳ Создаю контент для 6 секторов...")

# Сохраняем промежуточный результат
with open('pages/doc-module-11-complete.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Модуль 11 базовая структура создана")
print("📝 Файл: pages/doc-module-11-complete.html")
