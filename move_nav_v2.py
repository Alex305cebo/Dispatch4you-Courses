#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Improved script to move navigation block right after page header
"""

import re
import os

files = [
    "pages/routes.html", "pages/equipment.html", "pages/loadboards.html",
    "pages/negotiation.html", "pages/communication.html", "pages/problems.html",
    "pages/finances.html", "pages/regulations.html", "pages/technology.html",
    "pages/intro.html", "pages/glossary.html", "pages/role.html",
    "pages/docs.html", "pages/brokers.html", "pages/career.html",
    "pages/doc-module-1-complete.html", "pages/doc-module-2-complete.html",
    "pages/doc-module-3-complete.html", "pages/doc-module-4-complete.html",
    "pages/doc-module-5-complete.html", "pages/doc-module-6-complete.html",
    "pages/doc-module-7-complete.html", "pages/doc-module-8-complete.html",
    "pages/doc-module-9-complete.html", "pages/doc-module-10-complete.html",
    "pages/doc-module-11-complete.html", "pages/doc-module-12-complete.html"
]

def move_navigation(filepath):
    if not os.path.exists(filepath):
        print(f"❌ Not found: {filepath}")
        return False
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Find navigation block - more flexible pattern
        nav_patterns = [
            r'(<section[^>]*>\s*<div class="container">\s*<div[^>]*sector-navigation[^>]*>.*?</section>)',
            r'(<!-- ===== НАВИГАЦИЯ ПО КУРСУ ===== -->.*?</section>)',
        ]
        
        nav_block = None
        for pattern in nav_patterns:
            match = re.search(pattern, content, re.DOTALL)
            if match:
                nav_block = match.group(1)
                break
        
        if not nav_block:
            print(f"⚠️  No navigation in {filepath}")
            return False
        
        # Remove navigation
        content_clean = content.replace(nav_block, '')
        
        # Find where to insert - after first </section> that closes header/hero
        # Look for patterns that indicate end of header section
        insert_patterns = [
            (r'(</div>\s*</section>)(\s*\n\s*<!-- Gradient Line -->)', r'\1\2\n\n    '),
            (r'(</div>\s*</section>)(\s*\n\s*<!-- ===== [A-Z])', r'\1\2\n\n    '),
            (r'(</section>)(\s*\n\s*<!-- ===== [A-Z])', r'\1\2\n\n    '),
            (r'(</div>\s*</section>)(\s*\n\s*<section)', r'\1\n\n    ' + nav_block + r'\n\n\2'),
        ]
        
        inserted = False
        for pattern, replacement in insert_patterns:
            if re.search(pattern, content_clean):
                if '{nav}' in replacement:
                    new_content = re.sub(pattern, replacement.replace('{nav}', nav_block), content_clean, count=1)
                else:
                    # Insert nav_block before the replacement
                    new_content = re.sub(pattern, lambda m: m.group(1) + '\n\n    ' + nav_block + m.group(2), content_clean, count=1)
                
                with open(filepath, 'w', encoding='utf-8', newline='') as f:
                    f.write(new_content)
                
                print(f"✅ {filepath}")
                inserted = True
                break
        
        if not inserted:
            print(f"⚠️  No insert point in {filepath}")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error in {filepath}: {e}")
        return False

def main():
    print("Moving navigation blocks...\n")
    success = sum(1 for f in files if move_navigation(f))
    print(f"\n{'='*50}")
    print(f"✅ Success: {success}/{len(files)}")
    print(f"{'='*50}")

if __name__ == "__main__":
    main()
