#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import glob

def fix_file_encoding(filepath):
    """Fix double-encoded UTF-8 files"""
    try:
        # Read file as UTF-8
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if file has corrupted text
        if 'Р ' in content or 'РЎ' in content or 'Рў' in content:
            print(f"Fixing: {filepath}")
            
            # The text was UTF-8, saved as Windows-1251, then read as UTF-8
            # To fix: encode as latin-1 (to get original bytes), decode as UTF-8
            fixed_content = content.encode('latin-1').decode('utf-8')
            
            # Write back as UTF-8
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            
            print(f"  ✓ Fixed!")
            return True
        else:
            print(f"Skipping: {filepath} (looks OK)")
            return False
            
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

# Fix all module files
files = glob.glob('pages/doc-module-*.html')
files.sort()

fixed_count = 0
for filepath in files:
    if fix_file_encoding(filepath):
        fixed_count += 1

print(f"\nDone! Fixed {fixed_count} files.")
