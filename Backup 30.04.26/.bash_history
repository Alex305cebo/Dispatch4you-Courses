cd domains/dispatch4you.com/public_html
git pull origin main
bash server-deploy.sh
cd ~/public_html
ls -la
cd domains/dispatch4you.com/public_html
ls -la
git clone https://github.com/Alex305cebo/Dispatch4you-Courses.git .
git config --global --add safe.directory /home/u724602277/domains/dispatch4you.com/public_html
git status
# 1. Перейди в папку сайта
cd ~/public_html
# 2. Проверь что Git установлен
git --version
# 3. Проверь текущее состояние (если Git уже инициализирован)
git status
# Проверь текущую директорию
pwd
# Посмотри что есть в домашней папке
ls -la
# Найди папку с файлами сайта
find ~ -name "index.html" -type f 2>/dev/null | head -5
# Перейди в правильную папку
cd ~/domains/dispatch4you.com/public_html
# Проверь что там есть файлы
ls -la | head -20
# Инициализируй Git
git init
# Добавь remote репозиторий
git remote add origin https://github.com/Alex305cebo/Dispatch4you-Courses.git
# Настрой Git
git config user.email "your-email@example.com"
git config user.name "Alex305cebo"
git config credential.helper store
# Сделай первый pull
git pull origin main
cd public_html
git fetch origin && git reset --hard origin/main
find ~ -name ".git" -type d 2>/dev/null
cd /home/u724602277/domains/dispatch4you.com/public_html
git fetch origin && git reset --hard origin/main
cd /home/u724602277/domains/dispatch4you.com/public_html
git fetch origin && git reset --hard origin/main
cd /home/u724602277/domains/dispatch4you.com/public_html
git fetch origin && git reset --hard origin/main
