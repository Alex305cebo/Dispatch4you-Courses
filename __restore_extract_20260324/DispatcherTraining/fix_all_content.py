#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import re

# Map of corrupted text to correct text
replacements = {
    'РІвЂ"С': '▼',
    'РІвЂ вЂ™': '→',
    'Р СљР С•Р ТРЎС"Р В»РЎРЉ': 'Модуль',
    'Р В РЎС™Р В РЎвЂўР В РўвЂР РЋРЎвЂњР В Р'В»Р РЋР Р‰': 'Модуль',
    # Common corrupted patterns
    'Р С': '',
    'РЎ': '',
    'Рў': '',
    'РЋ': '',
    'Р В': '',
}

print("Fixing content in modules 3-12...\n")

for num in range(3, 13):
    filepath = f'pages/doc-module-{num}.html'
    
    print(f"Processing module {num}...")
    
    try:
        # Read file
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Apply replacements
        modified = False
        for corrupted, correct in replacements.items():
            if corrupted in content:
                content = content.replace(corrupted, correct)
                modified = True
                print(f"  - Fixed: {corrupted[:20]}... → {correct}")
        
        if modified:
            # Write back
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  ✓ Module {num} updated\n")
        else:
            print(f"  - No corrupted patterns found\n")
        
    except Exception as e:
        print(f"  ✗ Error: {e}\n")

print("="*50)
print("Done!")
print("="*50)
