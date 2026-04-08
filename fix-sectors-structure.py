#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Исправление структуры секторов 6-10 в модуле 10
Меняем <div class="sector"> на правильную структуру sector-wrapper
"""

import re

# Читаем файл
with open('pages/doc-module-10-complete.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Паттерн для поиска неправильной структуры сектора
# <!-- Сектор X: Title -->
# <div class="sector" id="sector-X">
#     <div class="sector-header">
#         <div class="sector-number">0X</div>
#         <h2>Icon Title</h2>
#     </div>
#     <div class="sector-content">

# Заменяем на правильную структуру:
# <!-- СЕКТОР X: Title -->
# <div class="sector-wrapper">
#     <div class="sector-number">0X</div>
#     <section class="content-block">

def fix_sector_structure(content, sector_num, title, icon):
    """Исправляет структуру одного сектора"""
    
    # Старая структура
    old_pattern = rf'''<!-- Сектор {sector_num}: {title} -->
            <div class="sector" id="sector-{sector_num}">
                <div class="sector-header">
                    <div class="sector-number">0{sector_num}</div>
                    <h2>{icon} {title}</h2>
                </div>
                
                <div class="sector-content">'''

    
    # Новая структура
    new_structure = f'''<!-- СЕКТОР {sector_num}: {title} -->
            <div class="sector-wrapper">
                <div class="sector-number">0{sector_num}</div>
                <section class="content-block">
                    <h2>{icon} {title}</h2>'''
    
    if old_pattern in content:
        content = content.replace(old_pattern, new_structure)
        print(f"✅ Сектор {sector_num} исправлен")
    else:
        print(f"⚠️ Сектор {sector_num} не найден или уже исправлен")
    
    return content

# Исправляем секторы 6-10
content = fix_sector_structure(content, 6, "Budgeting", "📊")
content = fix_sector_structure(content, 7, "Taxes (IFTA, IRP, UCR, 2290)", "💼")
content = fix_sector_structure(content, 8, "Financial KPIs", "📊")
content = fix_sector_structure(content, 9, "Driver Settlements", "💰")
content = fix_sector_structure(content, 10, "Financial Planning", "📈")

# Теперь нужно закрыть теги правильно
# Заменяем закрывающие теги </div></div> на </section></div>
# для секторов 6-10

# Ищем паттерн закрытия quiz + закрытие sector-content + sector
for sector_num in range(6, 11):
    # Паттерн: quiz закрывается, потом </div></div> (sector-content и sector)
    old_close = r'</div>\s*</div>\s*</div>\s*<!-- (Сектор|Navigation)'
    
content = re.sub(
    r'(quiz-10-[6-9]">.*?</div>\s*</div>\s*</div>)\s*</div>\s*</div>',
    r'\1\n                </section>\n            </div>',
    content,
    flags=re.DOTALL
)

content = re.sub(
    r'(quiz-10-10">.*?</div>\s*</div>\s*</div>)\s*</div>\s*</div>',
    r'\1\n                </section>\n            </div>',
    content,
    flags=re.DOTALL
)

# Сохраняем
with open('pages/doc-module-10-complete.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ Структура секторов 6-10 исправлена!")
