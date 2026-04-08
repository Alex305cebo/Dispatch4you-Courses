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
        
        # Check if file has corrupted text patterns
        if 'Р В' in content or 'РЎС' in content or 'Рў' in content:
            print(f"Fixing: {filepath}")
            
            # The text is UTF-8 that was misinterpreted
            # Original: UTF-8 bytes -> incorrectly decoded as Windows-1251 -> saved as UTF-8
            # To fix: encode as Windows-1251 -> decode as UTF-8
            
            try:
                # Get the bytes as if they were Windows-1251
                fixed_content = content.encode('windows-1251', errors='ignore').decode('utf-8', errors='ignore')
                
                # Write back as UTF-8
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(fixed_content)
                
                print(f"  ✓ Fixed!")
                return True
            except Exception as e:
                print(f"  ✗ Method 1 failed: {e}")
                
                # Try alternative: maybe it's UTF-8 bytes interpreted as latin-1
                try:
                    fixed_content = content.encode('iso-8859-1', errors='ignore').decode('utf-8', errors='ignore')
                    
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(fixed_content)
                    
                    print(f"  ✓ Fixed with method 2!")
                    return True
                except Exception as e2:
                    print(f"  ✗ Method 2 also failed: {e2}")
                    return False
        else:
            print(f"OK: {filepath}")
            return False
            
    except Exception as e:
        print(f"Error: {filepath}: {e}")
        return False

# Fix all module files
files = glob.glob('pages/doc-module-*.html')
files.sort()

print("Starting encoding fix...\n")
fixed_count = 0
for filepath in files:
    if fix_file_encoding(filepath):
        fixed_count += 1

print(f"\n{'='*50}")
print(f"Fixed {fixed_count} out of {len(files)} files")
print(f"{'='*50}")
