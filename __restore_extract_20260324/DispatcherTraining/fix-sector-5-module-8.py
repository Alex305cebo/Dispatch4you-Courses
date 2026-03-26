#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix Module 8 Sector 5 - Remove TMS content between quiz button and sector 6
"""

import re

# Read the file
with open('pages/doc-module-8-complete.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to find and remove TMS content between sector 5 quiz button and sector 6
# We want to remove everything from after the quiz button until "<!-- СЕКТОР 6"
pattern = r'(🎧 Я закончил слушать этот блок\s*</button>\s*</div>\s*)\s*<!-- СЕКТОР 6: Compliance и аудиты -->\s*<p><strong>TMS</strong>.*?</div>\s*</div>\s*</section>\s*<div class="case-study-block">.*?</div>\s*</div>\s*</div>\s*(<!-- СЕКТОР 6: Compliance и аудиты -->)'

replacement = r'\1\n\n                \2'

# Apply the fix
content_fixed = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Write back
with open('pages/doc-module-8-complete.html', 'w', encoding='utf-8') as f:
    f.write(content_fixed)

print("✅ Fixed sector 5 in module 8 - removed TMS content")
