#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import subprocess
import os

# Restore modules 1-2 from git
print("Step 1: Restoring modules 1-2 from git...\n")

for i in [1, 2]:
    module = f'doc-module-{i}.html'
    filepath = f'pages/{module}'
    print(f"Restoring: {module}...", end=' ')
    
    try:
        result = subprocess.run(
            ['git', 'show', f'35ad381:{filepath}'],
            capture_output=True,
            text=False
        )
        
        if result.returncode == 0:
            with open(filepath, 'wb') as f:
                f.write(result.stdout)
            print("✓")
        else:
            print("✗")
    except Exception as e:
        print(f"✗ {e}")

# Fix modules 3-12 encoding
print("\nStep 2: Fixing encoding for modules 3-12...\n")

for i in range(3, 13):
    module = f'doc-module-{i}.html'
    filepath = f'pages/{module}'
    
    if not os.path.exists(filepath):
        print(f"Skip: {module} (not found)")
        continue
    
    print(f"Fixing: {module}...", end=' ')
    
    try:
        # Read as bytes
        with open(filepath, 'rb') as f:
            raw_bytes = f.read()
        
        # Try to decode and check for corruption
        content = raw_bytes.decode('utf-8', errors='ignore')
        
        if 'Р ' in content or 'РЎ' in content:
            # File is corrupted - try to fix
            # The issue: UTF-8 text was interpreted as CP1251, then saved as UTF-8
            # Solution: encode back to CP1251, then decode as UTF-8
            
            try:
                fixed = content.encode('cp1251', errors='ignore').decode('utf-8', errors='ignore')
                
                # Check if it looks better
                if 'Модуль' in fixed or 'модуль' in fixed:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(fixed)
                    print("✓")
                else:
                    print("✗ (still corrupted)")
            except:
                print("✗ (failed)")
        else:
            print("OK (already fixed)")
            
    except Exception as e:
        print(f"✗ {e}")

print("\n" + "="*50)
print("Done!")
print("="*50)
