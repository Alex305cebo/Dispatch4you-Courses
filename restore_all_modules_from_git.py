#!/usr/bin/env python3
import subprocess
import os

# Try to restore modules from git history
# Start from commit 6f0cefd and go backwards

commits_to_try = [
    '6f0cefd',  # Module 4 created
    'HEAD',     # Current state
    'HEAD~1',   # 1 commit back
    'HEAD~5',   # 5 commits back
    'HEAD~10',  # 10 commits back
]

modules_to_restore = list(range(3, 13))  # Modules 3-12

print("Attempting to restore modules 3-12 from git history...\n")

restored = {}

for commit in commits_to_try:
    print(f"\nTrying commit: {commit}")
    
    for num in modules_to_restore:
        if num in restored:
            continue  # Already restored
        
        filepath = f'pages/doc-module-{num}.html'
        
        try:
            result = subprocess.run(
                ['git', 'show', f'{commit}:{filepath}'],
                capture_output=True,
                text=False,
                timeout=5
            )
            
            if result.returncode == 0:
                # Check if content looks good (has "Модуль" in it)
                content = result.stdout.decode('utf-8', errors='ignore')
                
                if 'Модуль' in content and len(content) > 10000:
                    # Save it
                    with open(filepath, 'wb') as f:
                        f.write(result.stdout)
                    
                    restored[num] = commit
                    print(f"  ✓ Module {num} restored from {commit}")
                    
        except Exception as e:
            pass

print(f"\n{'='*50}")
print(f"Restored {len(restored)} modules:")
for num, commit in sorted(restored.items()):
    print(f"  Module {num}: {commit}")

not_restored = [n for n in modules_to_restore if n not in restored]
if not_restored:
    print(f"\nNot restored: {not_restored}")
    print("These modules may need to be recreated manually.")

print(f"{'='*50}")
