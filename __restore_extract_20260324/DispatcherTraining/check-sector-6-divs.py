#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Check if all divs are properly closed in sector 6 block-content
"""

with open('pages/doc-module-9-complete.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find sector 6 block-content
import re
pattern = r'<!-- СЕКТОР 6:.*?<div class="block-content">(.*?)</div>\s*</section>'
match = re.search(pattern, content, re.DOTALL)

if match:
    block_content = match.group(1)
    
    # Count opening and closing divs
    open_divs = block_content.count('<div')
    close_divs = block_content.count('</div>')
    
    print(f"Сектор 6 block-content:")
    print(f"  Открывающих <div>: {open_divs}")
    print(f"  Закрывающих </div>: {close_divs}")
    print(f"  Разница: {open_divs - close_divs}")
    
    if open_divs != close_divs:
        print(f"\n⚠️ ПРОБЛЕМА: Не хватает {open_divs - close_divs} закрывающих </div>!")
else:
    print("Не найден block-content в секторе 6")
