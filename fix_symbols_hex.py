#!/usr/bin/env python3
import codecs

print("Fixing symbols in modules 3-12...\n")

# Unicode characters
arrow_down = '\u25BC'  # ▼
arrow_right = '\u2192'  # →

for num in range(3, 13):
    filepath = f'pages/doc-module-{num}.html'
    
    print(f"Module {num}...", end=' ')
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Count replacements
        count = 0
        
        # Fix corrupted arrow symbols in CSS
        if "content: 'РІвЂ"С'" in content:
            content = content.replace("content: 'РІвЂ"С'", f"content: '{arrow_down}'")
            count += 1
        
        if "content: 'РІвЂ вЂ™'" in content:
            content = content.replace("content: 'РІвЂ вЂ™'", f"content: '{arrow_right}'")
            count += 1
        
        if count > 0:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✓ ({count} fixes)")
        else:
            print("OK")
        
    except Exception as e:
        print(f"✗ {e}")

print("\nDone!")
