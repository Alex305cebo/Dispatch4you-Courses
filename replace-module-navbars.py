#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт для замены navbar на nav-placeholder в модулях 3-12
"""

import re
import os

# Список файлов для обработки
files = [
    'pages/module-3.html',
    'pages/module-4.html',
    'pages/module-5.html',
    'pages/module-6.html',
    'pages/module-7.html',
    'pages/module-8.html',
    'pages/module-9.html',
    'pages/module-10.html',
    'pages/module-11.html',
    'pages/module-12.html',
    'pages/modules.html',
]

# Паттерн для поиска navbar (от <body> до <div class="container">)
pattern = r'<body>\s*\n\s*\n\s*<!-- Navigation -->.*?</div>\s*</div>\s*\n\s*<div class="container">'

# Замена
replacement = '''<body>

  <div id="nav-placeholder"></div>
  <script src="../nav-loader.js"></script>

  <div class="container">'''

count = 0

for filepath in files:
    if not os.path.exists(filepath):
        print(f"⚠️  Файл не найден: {filepath}")
        continue
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Заменяем navbar
        new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
        
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
