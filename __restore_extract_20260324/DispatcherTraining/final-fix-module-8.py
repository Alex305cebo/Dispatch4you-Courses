#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Final fix for Module 8 - ensure all sectors have proper indentation (8 spaces inside main)
"""

import re

# Read the file
with open('pages/doc-module-8-complete.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix sector 3 - should have 8 spaces indent
content = re.sub(
    r'\n<!-- СЕКТОР 3: Контроль производительности -->\n<div class="sector-wrapper">\n    <div class="sector-number">03</div>\n    <section class="content-block">',
    r'\n        <!-- СЕКТОР 3: Контроль производительности -->\n        <div class="sector-wrapper">\n            <div class="sector-number">03</div>\n            <section class="content-block">',
    content
)

# Fix sector 4 - should have 8 spaces indent
content = re.sub(
    r'\n<!-- СЕКТОР 4: Решение конфликтов -->\n<div class="sector-wrapper">\n    <div class="sector-number">04</div>\n    <section class="content-block">',
    r'\n        <!-- СЕКТОР 4: Решение конфликтов -->\n        <div class="sector-wrapper">\n            <div class="sector-number">04</div>\n            <section class="content-block">',
    content
)

# Fix sector 5 - should have 8 spaces indent
content = re.sub(
    r'\n<!-- СЕКТОР 5: Коммуникация с водителями -->\n<div class="sector-wrapper">\n    <div class="sector-number">05</div>\n    <section class="content-block">',
    r'\n        <!-- СЕКТОР 5: Коммуникация с водителями -->\n        <div class="sector-wrapper">\n            <div class="sector-number">05</div>\n            <section class="content-block">',
    content
)

# Fix sector 6 - should have 8 spaces indent
content = re.sub(
    r'\n<!-- СЕКТОР 6: Compliance и аудиты -->\n<div class="sector-wrapper">\n    <div class="sector-number">06</div>\n    <section class="content-block">',
    r'\n        <!-- СЕКТОР 6: Compliance и аудиты -->\n        <div class="sector-wrapper">\n            <div class="sector-number">06</div>\n            <section class="content-block">',
    content
)

# Fix closing tags for sector 2 - should be 8 spaces
content = re.sub(
    r'(onclick="markAudioComplete\(this, \'audio2\', \'quiz-2\'\)">\s*🎧 Я закончил слушать этот блок\s*</button>\s*</div>\s*)    </section>\n</div>',
    r'\1        </section>\n        </div>',
    content
)

# Fix closing tags for sector 3 - should be 8 spaces
content = re.sub(
    r'(onclick="markAudioComplete\(this, \'audio3\', \'quiz-3\'\)">\s*🎧 Я закончил слушать этот блок\s*</button>\s*</div>\s*)    </section>\n</div>',
    r'\1        </section>\n        </div>',
    content
)

# Fix closing tags for sector 4 - should be 8 spaces
content = re.sub(
    r'(onclick="markAudioComplete\(this, \'audio4\', \'quiz-4\'\)">\s*🎧 Я закончил слушать этот блок\s*</button>\s*</div>\s*)    </section>\n</div>',
    r'\1        </section>\n        </div>',
    content
)

# Fix closing tags for sector 5 - should be 8 spaces
content = re.sub(
    r'(onclick="markAudioComplete\(this, \'audio5\', \'quiz-5\'\)">\s*🎧 Я закончил слушать этот блок\s*</button>\s*</div>\s*)    </section>\n</div>',
    r'\1        </section>\n        </div>',
    content
)

# Write back
with open('pages/doc-module-8-complete.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Final fix applied - all sectors now have proper 8-space indentation")
