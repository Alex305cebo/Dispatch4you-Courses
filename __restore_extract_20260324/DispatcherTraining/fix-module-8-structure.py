#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Fix Module 8 structure - fix sector nesting and ensure all quizzes have buttons
"""

import re

# Read the file
with open('pages/doc-module-8-complete.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Remove extra indentation from sectors 3-6 to match sectors 1-2
# Replace "            <div class="sector-wrapper">" with "        <div class="sector-wrapper">"
content = content.replace('            <div class="sector-wrapper">', '        <div class="sector-wrapper">')
content = content.replace('                <div class="sector-wrapper">', '        <div class="sector-wrapper">')
content = content.replace('                    <div class="sector-wrapper">', '        <div class="sector-wrapper">')

# Fix 2: Ensure proper closing of sector 1
# Find sector 1 quiz button and add closing tags after it
pattern1 = r'(🎧 Я закончил слушать этот блок\s*</button>\s*</div>\s*)(<!-- СЕКТОР 2)'
replacement1 = r'\1\n    </section>\n</div>\n\n\2'
content = re.sub(pattern1, replacement1, content)

# Fix 3: Ensure proper closing of sector 2
pattern2 = r'(onclick="markAudioComplete\(this, \'audio2\', \'quiz-2\'\)">\s*🎧 Я закончил слушать этот блок\s*</button>\s*</div>\s*)(<!-- СЕКТОР 3)'
replacement2 = r'\1\n        </section>\n    </div>\n\n\2'
content = re.sub(pattern2, replacement2, content)

# Fix 4: Ensure proper closing of sector 3
pattern3 = r'(onclick="markAudioComplete\(this, \'audio3\', \'quiz-3\'\)">\s*🎧 Я закончил слушать этот блок\s*</button>\s*</div>\s*)(<!-- СЕКТОР 4)'
replacement3 = r'\1\n            </section>\n        </div>\n\n\2'
content = re.sub(pattern3, replacement3, content)

# Fix 5: Ensure proper closing of sector 4
pattern4 = r'(onclick="markAudioComplete\(this, \'audio4\', \'quiz-4\'\)">\s*🎧 Я закончил слушать этот блок\s*</button>\s*</div>\s*)(<!-- СЕКТОР 5)'
replacement4 = r'\1\n                </section>\n            </div>\n\n\2'
content = re.sub(pattern4, replacement4, content)

# Fix 6: Ensure proper closing of sector 5
pattern5 = r'(onclick="markAudioComplete\(this, \'audio5\', \'quiz-5\'\)">\s*🎧 Я закончил слушать этот блок\s*</button>\s*</div>\s*)(<!-- СЕКТОР 6)'
replacement5 = r'\1\n                    </section>\n                </div>\n\n\2'
content = re.sub(pattern5, replacement5, content)

# Write back
with open('pages/doc-module-8-complete.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Fixed module 8 structure - normalized sector nesting and closing tags")
