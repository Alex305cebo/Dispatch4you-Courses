#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Замена inline navbar на nav-placeholder в courses.html
"""

def replace_navbar_in_courses():
    file_path = 'courses.html'
    
    # Читаем файл
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Ищем начало navbar (после <body>)
    start_marker = '<body>'
    end_marker = '  <!-- Main Content -->'
    
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker)
    
    if start_idx == -1 or end_idx == -1:
        print(f"❌ Не найдены маркеры в {file_path}")
        return False
    
    # Новый код с nav-placeholder
    new_nav = '''<body>
  <div id="nav-placeholder"></div>
  <script src="nav-loader.js"></script>

'''
    
    # Собираем новый контент
    new_content = (
        content[:start_idx + len(start_marker)] + '\n' +
        new_nav +
        content[end_idx:]
    )
    
    # Сохраняем
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"✅ {file_path} - navbar заменён на nav-placeholder")
    return True

if __name__ == '__main__':
    print("🔄 Замена navbar в courses.html...")
    replace_navbar_in_courses()
    print("\n✅ Готово!")
