"""
replace_nav.py — заменяет хардкоженный навбар на <div id="nav-placeholder"> + <script src="nav-loader.js">
во всех HTML файлах сайта.
"""
import os
import re

ROOT = r"C:\DispatcherTraining"

# Файлы в корне — скрипт "nav-loader.js"
ROOT_FILES = [
    "dashboard.html", "about.html", "courses.html", "course.html",
    "faq.html", "help.html", "contacts.html", "career.html",
    "login.html", "register.html"
]

# Файлы в pages/ — скрипт "../nav-loader.js"
PAGES_DIR = os.path.join(ROOT, "pages")
PAGES_INCLUDE = [
    "doc-module-1-complete.html", "doc-module-2-complete.html",
    "doc-module-3-complete.html", "doc-module-4-complete.html",
    "doc-module-5-complete.html", "doc-module-6-complete.html",
    "doc-module-7-complete.html", "doc-module-8-complete.html",
    "doc-module-9-complete.html", "doc-module-10-complete.html",
    "doc-module-11-complete.html", "doc-module-12-complete.html",
    "modules-index.html", "documentation.html", "simulator.html",
    "testing.html", "analytics.html", "calls.html", "cases.html",
    "dispatcher-cards.html", "load-finder.html", "loadboard.html",
]

# Паттерн: от начала навбара до конца мобильного меню
# Ищем блок от <nav class="navbar"> (или <!-- Navigation -->) до закрытия </div> мобильного меню
NAV_PATTERN = re.compile(
    r'(\s*<!--\s*Navigation\s*-->\s*)?'   # опциональный комментарий
    r'\s*<nav class="navbar">.*?'          # начало навбара
    r'</div>\s*\n\s*</div>\s*\n\s*</div>' # три закрывающих </div> конца мобильного меню
    r'\s*\n',
    re.DOTALL
)

def replace_nav(filepath, script_src):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"  READ ERROR: {filepath}: {e}")
        return

    # Уже обработан?
    if 'nav-placeholder' in content:
        print(f"  SKIP (already done): {os.path.basename(filepath)}")
        return

    # Ищем навбар
    match = NAV_PATTERN.search(content)
    if not match:
        print(f"  NO MATCH: {os.path.basename(filepath)}")
        return

    replacement = f'\n  <div id="nav-placeholder"></div>\n  <script src="{script_src}"></script>\n\n'
    new_content = content[:match.start()] + replacement + content[match.end():]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"  OK: {os.path.basename(filepath)}")

print("=== Корневые файлы ===")
for fname in ROOT_FILES:
    fpath = os.path.join(ROOT, fname)
    if os.path.exists(fpath):
        replace_nav(fpath, "nav-loader.js")
    else:
        print(f"  NOT FOUND: {fname}")

print("\n=== pages/ файлы ===")
for fname in PAGES_INCLUDE:
    fpath = os.path.join(PAGES_DIR, fname)
    if os.path.exists(fpath):
        replace_nav(fpath, "../nav-loader.js")
    else:
        print(f"  NOT FOUND: {fname}")

print("\nДОНЕ")
