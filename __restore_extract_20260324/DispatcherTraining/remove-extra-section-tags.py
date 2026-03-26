#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Remove extra </section> tags after quiz buttons
"""

import re

# Read the file
with open('pages/doc-module-8-complete.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove pattern: button -> </div> -> </section> -> </div>
# Should be: button -> </div> -> </div>
pattern = r'(</button>\s*</div>\s*)            </section>\s*        </div>'
replacement = r'\1    </div>'
content = re.sub(pattern, replacement, content)

# Write back
with open('pages/doc-module-8-complete.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Removed extra </section> tags after quiz buttons")
