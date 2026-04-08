#!/usr/bin/env python3
import re

file_path = 'pages/doc-module-1.html'

# Read file
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to find quiz blocks with button at top
pattern = r'(<div class="quick-check-block[^>]*>)\s*(<div class="quiz-unlock-notice">.*?</div>)\s*(<button class="audio-completion-btn"[^>]*>.*?</button>)\s*(<div class="quick-check-header">.*?</div>.*?<div class="quick-check-feedback">.*?</div>)'

def move_button_to_bottom(match):
    opening_tag = match.group(1)
    notice = match.group(2)
    button = match.group(3)
    content_block = match.group(4)
    
    # Return with button and notice at the end
    return f'{opening_tag}\n                {content_block}\n                \n                {notice}\n\n                {button}'

# Replace all occurrences
content = re.sub(pattern, move_button_to_bottom, content, flags=re.DOTALL)

# Write back
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Moved quiz buttons to bottom for all quiz blocks")
