#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import subprocess
import os

# List of all modules to restore
modules = [
    'doc-module-1.html',
    'doc-module-2.html',
    'doc-module-3.html',
    'doc-module-4.html',
    'doc-module-5.html',
    'doc-module-6.html',
    'doc-module-7.html',
    'doc-module-8.html',
    'doc-module-9.html',
    'doc-module-10.html',
    'doc-module-11.html',
    'doc-module-12.html'
]

commit = '35ad381'  # Last good commit

print("Restoring modules from git...\n")

restored = 0
not_found = []

for module in modules:
    filepath = f'pages/{module}'
    print(f"Restoring: {module}...", end=' ')
    
    try:
        # Try to get file from git
        result = subprocess.run(
            ['git', 'show', f'{commit}:{filepath}'],
            capture_output=True,
            text=False  # Get bytes
        )
        
        if result.returncode == 0:
            # Write the file
            with open(filepath, 'wb') as f:
                f.write(result.stdout)
            print("✓")
            restored += 1
        else:
            print("✗ (not in git)")
            not_found.append(module)
            
    except Exception as e:
        print(f"✗ Error: {e}")
        not_found.append(module)

print(f"\n{'='*50}")
print(f"Restored: {restored}/{len(modules)}")
if not_found:
    print(f"Not found in git: {', '.join(not_found)}")
print(f"{'='*50}")
