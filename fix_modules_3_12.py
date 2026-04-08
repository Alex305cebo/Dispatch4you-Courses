#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re

# Correct module titles
titles = {
    3: "Модуль 3: Типы оборудования и грузов",
    4: "Модуль 4: Работа с Load Boards",
    5: "Модуль 5: Переговоры с брокерами",
    6: "Модуль 6: Планирование маршрутов",
    7: "Модуль 7: Документооборот и отчетность",
    8: "Модуль 8: Финансы и расчеты",
    9: "Модуль 9: Безопасность и страхование",
    10: "Модуль 10: Технологии и программное обеспечение",
    11: "Модуль 11: Кризисные ситуации и решение проблем",
    12: "Модуль 12: Практические навыки и карьера"
}

print("Fixing modules 3-12 titles...\n")

for num in range(3, 13):
    filepath = f'pages/doc-module-{num}.html'
    correct_title = titles[num]
    
    print(f"Module {num}: {correct_title}")
    
    try:
        # Read file
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find and replace the title tag
        # Pattern: <title>anything</title>
        pattern = r'<title>.*?\| DispatcherPro</title>'
        replacement = f'<title>{correct_title} | DispatcherPro</title>'
        
        new_content = re.sub(pattern, replacement, content, count=1)
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"  ✓ Title fixed\n")
        
    except Exception as e:
        print(f"  ✗ Error: {e}\n")

print("="*50)
print("Done! Titles fixed for modules 3-12")
print("="*50)
print("\nNote: Content inside modules may still have encoding issues.")
print("The titles in <title> tags are now correct.")
