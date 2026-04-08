#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix module 9 - remove double closing divs after quiz buttons
"""

import re

# Read the file
with open('pages/doc-module-9-complete.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern: Find double </div> after quiz button
# Replace with single </div>
pattern = r'(</button>\s*</div>\s*)\s*</div>\s*(<!-- СЕКТОР)'
replacement = r'\1</div>\n\n        \2'
content = re.sub(pattern, replacement, content)

# Write back
with open('pages/doc-module-9-complete.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Fixed module 9 - removed double closing divs")
