import re
import os

files = [
    "about.html", "blog.html", "career.html", "contacts.html",
    "course.html", "courses.html", "dashboard.html", "faq.html",
    "help.html", "pricing.html",
    "pages/calls.html", "pages/cases.html", "pages/dispatcher-cards.html",
    "pages/documentation.html", "pages/load-finder.html", "pages/loadboard.html",
    "pages/module-1.html", "pages/module-2.html", "pages/module-3.html",
    "pages/module-4.html", "pages/module-5.html", "pages/module-6.html",
    "pages/module-7.html", "pages/module-8.html", "pages/module-9.html",
    "pages/module-10.html", "pages/module-11.html", "pages/module-12.html",
    "pages/modules.html", "pages/simulator.html",
    "pages/test-1.html", "pages/test-2.html", "pages/test-3.html",
    "pages/test-4.html", "pages/test-5.html", "pages/test-6.html",
    "pages/test-7.html", "pages/test-8.html", "pages/test-9.html",
    "pages/test-10.html", "pages/test-11.html", "pages/test-12.html",
    "pages/testing.html"
]

updated = 0

for filepath in files:
    if not os.path.exists(filepath):
        print(f"Файл не найден: {filepath}")
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Проверяем, не обновлен ли уже
    if '<div class="mobile-nav-links">\n      <div class="mobile-nav-actions">' in content:
        print(f"Уже обновлен: {filepath}")
        continue
    
    # Определяем путь к login/register
    login_path = "../login.html" if filepath.startswith("pages/") else "login.html"
    register_path = "../register.html" if filepath.startswith("pages/") else "register.html"
    
    # Паттерн для поиска начала mobile-nav-links
    pattern = r'(<div class="mobile-menu" id="mobileMenu">)\s*(<div class="mobile-nav-links">)\s*(<a href="[^"]*" class="nav-link[^"]*">🏠 Главная</a>)'
    
    replacement = f'''\\1
    \\2
      <div class="mobile-nav-actions">
        <a href="{login_path}" class="btn-login">Войти</a>
        <a href="{register_path}" class="btn-signup">Регистрация</a>
      </div>

      <div class="mobile-menu-divider"></div>

      \\3'''
    
    new_content = re.sub(pattern, replacement, content)
    
    if new_content == content:
        print(f"Паттерн не найден: {filepath}")
        continue
    
    # Удаляем старый блок mobile-nav-actions
    pattern2 = r'\s*<div class="mobile-menu-divider"></div>\s*<a href="[^"]*documentation[^"]*"'
    replacement2 = '\n      <a href="' + ('documentation.html' if filepath.startswith("pages/") else 'pages/documentation.html') + '"'
    new_content = re.sub(pattern2, replacement2, new_content)
    
    # Удаляем блок mobile-nav-actions в конце
    pattern3 = r'    </div>\s*<div class="mobile-nav-actions">.*?</div>\s*</div>'
    replacement3 = '    </div>\n  </div>'
    new_content = re.sub(pattern3, replacement3, new_content, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"Обновлен: {filepath}")
    updated += 1

print(f"\n=== Обновлено файлов: {updated} ===")
