#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re

with open('pages/modules.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Удаляем navbar блок
content = re.sub(
    r'<div class="nav-container">.*?</div>\s*</div>\s*<div class="bg-grid"></div>',
    '',
    content,
    flags=re.DOTALL,
    count=1
)

with open('pages/modules.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('✅ modules.html обновлен!')
