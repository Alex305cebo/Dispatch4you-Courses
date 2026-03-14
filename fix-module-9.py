#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix module 9 - add missing closing </div> tags after quiz buttons
"""

import re

# Read the file
with open('pages/doc-module-9-complete.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern: Find quiz button followed immediately by next sector comment
# Need to add </div> to close sector-wrapper
for i in range(1, 8):  # Module 9 has 7 sectors
    next_sector = i + 1
    if next_sector <= 7:
        pattern = rf'(onclick="markAudioComplete\(this, \'audio{i}\', \'quiz-{i}\'\)">\s*🎧 Я закончил слушать этот блок\s*</button>\s*</div>\s*)(<!-- СЕКТОР {next_sector}:)'
        replacement = rf'\1</div>\n\n        \2'
        content = re.sub(pattern, replacement, content)

# Write back
with open('pages/doc-module-9-complete.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Fixed module 9 - added missing closing tags")
