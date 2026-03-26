#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Полная перестройка секторов 6-10 с правильной структурой
"""

import re

# Читаем файл
with open('pages/doc-module-10-complete.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Удаляем все секторы 6-10 (от начала сектора 6 до начала Navigation после сектора 10)
# Находим начало сектора 6
start_marker = '<!-- СЕКТОР 6: Budgeting -->'
# Находим конец сектора 10 (перед </main>)
end_marker = '</section>\n            </div>\n        </main>'

start_pos = content.find(start_marker)
end_pos = content.find(end_marker)

if start_pos == -1 or end_pos == -1:
    print("❌ Не найдены маркеры для замены")
    exit(1)

# Вырезаем старые секторы 6-10
before_sectors = content[:start_pos]
after_sectors = content[end_pos + len(end_marker):]

print(f"✅ Найдены позиции: start={start_pos}, end={end_pos}")
print("✅ Старые секторы 6-10 будут заменены")

# Сохраняем для проверки
with open('pages/doc-module-10-complete.html', 'w', encoding='utf-8') as f:
    f.write(before_sectors)
    f.write('\n<!-- PLACEHOLDER FOR SECTORS 6-10 -->\n')
    f.write(after_sectors)

print("✅ Файл подготовлен для вставки новых секторов")
print("⚠️ Теперь нужно вручную добавить секторы 6-10 с правильной структурой")
