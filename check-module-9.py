#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re

with open('pages/doc-module-9-complete.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

sector_starts = []
for i, line in enumerate(lines, 1):
    if 'СЕКТОР' in line and '<!--' in line:
        sector_starts.append((i, line.strip()))

print("Секторы найдены на строках:")
for line_num, text in sector_starts:
    print(f"  Строка {line_num}: {text}")

# Check each sector for proper closing
for i in range(len(sector_starts)):
    start_line = sector_starts[i][0]
    end_line = sector_starts[i+1][0] if i+1 < len(sector_starts) else len(lines)
    
    sector_text = ''.join(lines[start_line:end_line])
    
    # Count tags in this sector
    div_open = sector_text.count('<div class="sector-wrapper">')
    section_open = sector_text.count('<section class="content-block">')
    section_close = sector_text.count('</section>')
    
    print(f"\nСектор {i+1} (строки {start_line}-{end_line}):")
    print(f"  <div class='sector-wrapper'>: {div_open}")
    print(f"  <section>: {section_open}")
    print(f"  </section>: {section_close}")
    
    if section_open != section_close:
        print(f"  ⚠️ ПРОБЛЕМА: section не закрыт!")
