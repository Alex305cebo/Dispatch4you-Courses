#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import glob
import codecs

def fix_file_encoding(filepath):
    """Fix double-encoded UTF-8 files"""
    try:
        # Read file as bytes
        with open(filepath, 'rb') as f:
            raw_bytes = f.read()
        
        # Remove BOM if present
        if raw_bytes.startswith(codecs.BOM_UTF8):
            raw_bytes = raw_bytes[len(codecs.BOM_UTF8):]
            print(f"Removed BOM from: {filepath}")
        
        # Try to decode as UTF-8
        try:
            content = raw_bytes.decode('utf-8')
        except:
            content = raw_bytes.decode('utf-8', errors='ignore')
        
        # Check if file has corrupted text patterns
        if 'Р В' in content or 'РЎ' in content or 'Рў' in content or 'РЋ' in content:
            print(f"Fixing: {filepath}")
            
            # The corruption happened: UTF-8 text -> saved as CP1251 bytes -> read as UTF-8
            # To reverse: current UTF-8 string -> get CP1251 bytes -> decode as UTF-8
            try:
                # Encode current string as CP1251 to get original bytes
                cp1251_bytes = content.encode('cp1251')
                # Decode those bytes as UTF-8
                fixed_content = cp1251_bytes.decode('utf-8')
                
                # Write back as UTF-8 without BOM
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(fixed_content)
                
                print(f"  ✓ Fixed!")
                return True
            except Exception as e:
                print(f"  ✗ Failed: {e}")
                return False
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

print(f"\n{'='*50}")
print(f"Done! Fixed {fixed_count} files.")
print(f"{'='*50}")
