#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to move navigation block right after page header on all course pages
"""

import re
import os
from pathlib import Path

# List of files to process
files = [
    "pages/routes.html",
    "pages/equipment.html",
    "pages/loadboards.html",
    "pages/negotiation.html",
    "pages/communication.html",
    "pages/problems.html",
    "pages/finances.html",
    "pages/regulations.html",
    "pages/technology.html",
    "pages/intro.html",
    "pages/glossary.html",
    "pages/role.html",
    "pages/docs.html",
    "pages/brokers.html",
    "pages/career.html",
    "pages/documentation.html",
    "pages/doc-module-1-complete.html",
    "pages/doc-module-2-complete.html",
    "pages/doc-module-3-complete.html",
    "pages/doc-module-4-complete.html",
    "pages/doc-module-5-complete.html",
    "pages/doc-module-6-complete.html",
    "pages/doc-module-7-complete.html",
    "pages/doc-module-8-complete.html",
    "pages/doc-module-9-complete.html",
    "pages/doc-module-10-complete.html",
    "pages/doc-module-11-complete.html",
    "pages/doc-module-12-complete.html"
]

def move_navigation(filepath):
    """Move navigation block right after page header"""
    
    if not os.path.exists(filepath):
        print(f"❌ File not found: {filepath}")
        return False
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Pattern to find navigation block
        nav_pattern = r'(<section class="section"[^>]*>\s*<div class="container">\s*<div class="sector-wrapper sector-navigation.*?</section>)'
        
        # Find navigation block
        nav_match = re.search(nav_pattern, content, re.DOTALL)
        
        if not nav_match:
            print(f"⚠️  Navigation block not found in {filepath}")
            return False
        
        nav_block = nav_match.group(1)
        
        # Remove navigation from current position
        content_without_nav = content.replace(nav_block, '')
        
        # Find insertion point - right after page header section
        # Look for </section> that closes page-header or hero section
        header_patterns = [
            r'(</div>\s*</section>\s*\n\s*<!-- Gradient Line -->)',
            r'(</div>\s*</section>\s*\n\s*<!-- ===== НАВИГАЦИЯ)',
            r'(</section>\s*\n\s*<!-- ===== НАВИГАЦИЯ)'
        ]
        
        inserted = False
        for pattern in header_patterns:
            if re.search(pattern, content_without_nav):
                # Insert navigation right after header
                new_content = re.sub(
                    pattern,
                    r'\1\n\n    ' + nav_block,
                    content_without_nav,
                    count=1
                )
                
                # Save file
                with open(filepath, 'w', encoding='utf-8', newline='') as f:
                    f.write(new_content)
                
                print(f"✅ Moved navigation in {filepath}")
                inserted = True
                break
        
        if not inserted:
            print(f"⚠️  Could not find insertion point in {filepath}")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error processing {filepath}: {e}")
        return False

def main():
    print("Starting navigation block repositioning...\n")
    
    success_count = 0
    fail_count = 0
    
    for filepath in files:
        if move_navigation(filepath):
            success_count += 1
        else:
            fail_count += 1
    
    print(f"\n{'='*50}")
    print(f"✅ Successfully processed: {success_count} files")
    print(f"❌ Failed: {fail_count} files")
    print(f"{'='*50}")

if __name__ == "__main__":
    main()
