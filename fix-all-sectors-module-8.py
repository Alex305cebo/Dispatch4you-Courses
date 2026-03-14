#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix ALL sectors in Module 8 - ensure proper structure without nesting
"""

import re

# Read the file
with open('pages/doc-module-8-complete.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix sector 3 ending
content = re.sub(
    r'(onclick="markAudioComplete\(this, \'audio3\', \'quiz-3\'\)">\s*🎧 Я закончил слушать этот блок\s*</button>\s*</div>\s*)\s*</section>\s*</div>\s*(<!-- СЕКТОР 4)',
    r'\1\n    </section>\n</div>\n\n\2',
    content
)

# Fix sector 4 structure
content = re.sub(
    r'(<!-- СЕКТОР 4: Решение конфликтов -->\s*)        <div class="sector-wrapper">\s*<div class="sector-number">04</div>',
    r'\1<div class="sector-wrapper">\n    <div class="sector-number">04</div>',
    content
)

# Fix sector 4 ending
content = re.sub(
    r'(onclick="markAudioComplete\(this, \'audio4\', \'quiz-4\'\)">\s*🎧 Я закончил слушать этот блок\s*</button>\s*</div>\s*)\s*</section>\s*</div>\s*(<!-- СЕКТОР 5)',
    r'\1\n    </section>\n</div>\n\n\2',
    content
)

# Fix sector 5 structure
content = re.sub(
    r'(<!-- СЕКТОР 5: Коммуникация с водителями -->\s*)        <div class="sector-wrapper">\s*<div class="sector-number">05</div>',
    r'\1<div class="sector-wrapper">\n    <div class="sector-number">05</div>',
    content
)

# Fix sector 5 ending
content = re.sub(
    r'(onclick="markAudioComplete\(this, \'audio5\', \'quiz-5\'\)">\s*🎧 Я закончил слушать этот блок\s*</button>\s*</div>\s*)\s*</section>\s*</div>\s*(<!-- СЕКТОР 6)',
    r'\1\n    </section>\n</div>\n\n\2',
    content
)

# Fix sector 6 structure
content = re.sub(
    r'(<!-- СЕКТОР 6: Compliance и аудиты -->\s*)        <div class="sector-wrapper">\s*<div class="sector-number">06</div>',
    r'\1<div class="sector-wrapper">\n    <div class="sector-number">06</div>',
    content
)

# Remove any extra blank lines between sectors
content = re.sub(r'\n\n\n+', r'\n\n', content)

# Write back
with open('pages/doc-module-8-complete.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Fixed all sectors structure in module 8")
