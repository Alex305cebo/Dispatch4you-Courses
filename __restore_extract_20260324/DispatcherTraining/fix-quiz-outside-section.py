#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Move all quizzes OUTSIDE of section tags in module 8
"""

import re

# Read the file
with open('pages/doc-module-8-complete.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern: Find case study closing, then quiz opening
# We need to insert </section> BEFORE the quiz

# For sectors 2-6, find the pattern and fix it
for i in range(2, 7):
    # Find: case study end -> quiz start
    # Insert: </section> before quiz
    pattern = rf'(</div>\s*</div>\s*</div>\s*)(            <div class="quick-check-block locked" id="quiz-{i}")'
    replacement = rf'\1    </section>\n\n\2'
    content = re.sub(pattern, replacement, content)

# Write back
with open('pages/doc-module-8-complete.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Moved all quizzes outside of section tags")
