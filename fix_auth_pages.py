import os
import re

# Страницы в корне (не backup файлы)
ROOT_PAGES = ['about.html', 'career.html', 'contacts.html', 'course.html',
              'faq.html', 'help.html', 'pricing.html', 'cargo-stats.html']

# Страницы в /pages/ папке — для них firebase-auth-init путь '../firebase-auth-init.js'
PAGES_DIR = 'pages'

def fix_root_page(filepath, firebase_path='firebase-auth-init.js'):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Убираем все дублирующие auth.js (оставляем только один)
    # Заменяем все вхождения src="auth.js" на пустую строку сначала
    count = content.count('<script src="auth.js"></script>')
    if count == 0:
        print(f'SKIP (no auth.js): {filepath}')
        return

    # Убираем все вхождения
    content = content.replace('<script src="auth.js"></script>', '')

    # Убираем лишние пустые строки (больше 2 подряд)
    content = re.sub(r'\n{3,}', '\n\n', content)

    # Добавляем один auth.js + firebase-auth-init перед </body>
    replacement = f'  <script src="auth.js"></script>\n  <script type="module" src="{firebase_path}"></script>\n\n</body>'
    content = content.replace('</body>', replacement, 1)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'FIXED ({count} auth.js -> 1): {filepath}')

# Исправляем корневые страницы
for page in ROOT_PAGES:
    if os.path.exists(page):
        fix_root_page(page, 'firebase-auth-init.js')

# Исправляем страницы в /pages/
if os.path.exists(PAGES_DIR):
    for fname in os.listdir(PAGES_DIR):
        if fname.endswith('.html'):
            fpath = os.path.join(PAGES_DIR, fname)
            with open(fpath, 'r', encoding='utf-8') as f:
                content = f.read()
            if '<script src="auth.js"></script>' in content or '<script src="../auth.js"></script>' in content:
                fix_root_page(fpath, '../firebase-auth-init.js')

print('Done!')
