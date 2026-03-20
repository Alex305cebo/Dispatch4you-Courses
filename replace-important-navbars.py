#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для замены navbar на важных активных страницах
"""

import re
import os

# Список важных файлов (не backup, не old)
files = [
    'pages/module-1-introduction.html',
    'pages/module-2-regulations.html',
    'pages/module-3-equipment.html',
    'pages/module-4-loadboards.html',
    'pages/module-5-negotiations.html',
    'pages/test-1.html',
    'pages/test-2.html',
    'pages/test-3.html',
    'pages/test-4.html',
    'pages/test-5.html',
    'pages/test-6.html',
    'pages/test-7.html',
    'pages/test-8.html',
    'pages/test-9.html',
    'pages/test-10.html',
    'pages/test-11.html',
    'pages/test-12.html',
]

# Паттерн для поиска navbar
pattern1 = r'<header class="header">\s*<!-- Navigation -->\s*<nav class="navbar">.*?</div>\s*</div>'
pattern2 = r'<!-- Navigation -->\s*<nav class="navbar">.*?</div>\s*</div>'

# Замена
replacement = '''<div id="nav-placeholder"></div>
  <script src="../nav-loader.js"></script>'''

count = 0

for filepath in files:
    if not os.path.exists(filepath):
        print(f"⚠️  Файл не найден: {filepath}")
        continue
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Пробуем первый паттерн (с header)
        new_content = re.sub(pattern1, replacement, content, flags=re.DOTALL, count=1)
        
        # Если не сработало, пробуем второй паттерн (без header)
        if new_content == content:
            new_content = re.sub(pattern2, replacement, content, flags=re.DOTALL, count=1)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"✅ Обработан: {filepath}")
            count += 1
        else:
            print(f"⏭️  Пропущен (нет изменений): {filepath}")
    
    except Exception as e:
        print(f"❌ Ошибка в {filepath}: {e}")

print(f"\n🎉 Готово! Обработано файлов: {count}")
