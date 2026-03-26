#!/usr/bin/env python3
# -*- coding: utf-8 -*-

print("Fixing symbols in modules 3-12...\n")

for num in range(3, 13):
    filepath = f'pages/doc-module-{num}.html'
    
    print(f"Module {num}...", end=' ')
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Fix arrow symbols
        content = content.replace("content: 'РІвЂ"С'", "content: '▼'")
        content = content.replace("content: 'РІвЂ вЂ™'", "content: '→'")
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print("✓")
        
    except Exception as e:
        print(f"✗ {e}")

print("\nDone!")
