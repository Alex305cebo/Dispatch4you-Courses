#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Check all tags in sector 3 block-content
"""

with open('pages/doc-module-9-complete.html', 'r', encoding='utf-8') as f:
    content = f.read()

import re
pattern = r'<!-- СЕКТОР 3:.*?<div class="block-content">(.*?)</div>\s*</section>'
match = re.search(pattern, content, re.DOTALL)

if match:
    block_content = match.group(1)
    
    # Check various tags
    tags_to_check = ['ul', 'ol', 'h3', 'h4', 'p', 'div']
    
    print("Сектор 3 block-content - проверка тегов:")
    for tag in tags_to_check:
        open_tags = len(re.findall(f'<{tag}[\\s>]', block_content))
        close_tags = block_content.count(f'</{tag}>')
        
        status = "✓" if open_tags == close_tags else "⚠️"
        print(f"  {status} <{tag}>: {open_tags} открывающих, {close_tags} закрывающих")
        
        if open_tags != close_tags:
            print(f"      ПРОБЛЕМА: Разница {open_tags - close_tags}")
else:
    print("Не найден block-content в секторе 3")
