#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для замены navbar на главных страницах сайта
"""

import re
import os

# Список файлов в корне
files = [
    'faq.html',
    'contacts.html',
]

# Паттерн для поиска navbar
pattern = r'<!-- Navigation -->\s*<nav class="navbar">.*?</div>\s*</div>'

# Замена (для корневых файлов путь к nav-loader.js без ../)
replacement = '''<div id="nav-placeholder"></div>
  <script src="nav-loader.js"></script>'''

count = 0

for filepath in files:
    if not os.path.exists(filepath):
        print(f"⚠️  Файл не найден: {filepath}")
        continue
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Заменяем navbar
        new_content = re.sub(pattern, replacement, content, flags=re.DOTALL, count=1)
        
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
