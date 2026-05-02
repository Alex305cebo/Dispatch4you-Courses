# 🚀 Load Finder - Инструкция по деплою на VPS

## 📋 Требования

- VPS с Ubuntu 20.04/22.04 (минимум 2GB RAM)
- Root или sudo доступ
- Открытый порт 5003 (или другой на выбор)

## 🔧 Шаг 1: Подключение к VPS

```bash
ssh root@your-vps-ip
```

## 📦 Шаг 2: Установка зависимостей

```bash
# Обновляем систему
apt update && apt upgrade -y

# Устанавливаем Python и pip
apt install python3 python3-pip python3-venv -y

# Устанавливаем Chrome и ChromeDriver
apt install wget unzip -y
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
apt install ./google-chrome-stable_current_amd64.deb -y

# Проверяем версию Chrome
google-chrome --version

# Устанавливаем дополнительные зависимости для Chrome
apt install -y \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libwayland-client0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    xdg-utils
```

## 📁 Шаг 3: Загрузка приложения

```bash
# Создаем директорию для приложения
mkdir -p /var/www/load-finder
cd /var/www/load-finder

# Загружаем файлы (используй git или scp)
# Вариант 1: Git
git clone https://github.com/Alex305cebo/dispatcher-courses.git
cd dispatcher-courses/load-finder-app

# Вариант 2: SCP (с локального компьютера)
# scp -r load-finder-app/* root@your-vps-ip:/var/www/load-finder/
```

## 🐍 Шаг 4: Настройка Python окружения

```bash
# Создаем виртуальное окружение
python3 -m venv venv

# Активируем окружение
source venv/bin/activate

# Устанавливаем зависимости
pip install --upgrade pip
pip install -r requirements.txt
```

## 🔐 Шаг 5: Настройка credentials

```bash
# Создаем файл credentials.json
nano credentials.json
```

Вставь содержимое:
```json
{
  "truckerpath": {
    "username": "your-email@example.com",
    "password": "your-password"
  }
}
```

Сохрани (Ctrl+O, Enter, Ctrl+X)

## 🔒 Шаг 6: Настройка прав доступа

```bash
# Устанавливаем правильные права
chmod 600 credentials.json
chmod +x app_full_collector.py
```

## 🚀 Шаг 7: Запуск приложения

### Вариант A: Простой запуск (для тестирования)

```bash
# Запускаем Flask в фоновом режиме
nohup python3 app_full_collector.py > load-finder.log 2>&1 &

# Проверяем логи
tail -f load-finder.log
```

### Вариант B: Production запуск с Gunicorn (Рекомендуется)

```bash
# Запускаем с Gunicorn
gunicorn --bind 0.0.0.0:5003 --workers 2 --timeout 300 wsgi:app
```

### Вариант C: Systemd сервис (Автозапуск)

Создаем systemd сервис:

```bash
nano /etc/systemd/system/load-finder.service
```

Вставляем:
```ini
[Unit]
Description=Load Finder Flask Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/load-finder
Environment="PATH=/var/www/load-finder/venv/bin"
ExecStart=/var/www/load-finder/venv/bin/gunicorn --bind 0.0.0.0:5003 --workers 2 --timeout 300 wsgi:app
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Сохраняем и запускаем:

```bash
# Перезагружаем systemd
systemctl daemon-reload

# Запускаем сервис
systemctl start load-finder

# Включаем автозапуск
systemctl enable load-finder

# Проверяем статус
systemctl status load-finder

# Смотрим логи
journalctl -u load-finder -f
```

## 🌐 Шаг 8: Настройка Nginx (Опционально)

Если хочешь использовать домен и HTTPS:

```bash
# Устанавливаем Nginx
apt install nginx -y

# Создаем конфигурацию
nano /etc/nginx/sites-available/load-finder
```

Вставляем:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }
}
```

Активируем:
```bash
ln -s /etc/nginx/sites-available/load-finder /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## 🔥 Шаг 9: Настройка Firewall

```bash
# Открываем порт 5003
ufw allow 5003/tcp

# Если используешь Nginx
ufw allow 80/tcp
ufw allow 443/tcp

# Включаем firewall
ufw enable
```

## ✅ Шаг 10: Проверка работы

```bash
# Проверяем что приложение запущено
curl http://localhost:5003

# Или с внешнего IP
curl http://your-vps-ip:5003
```

Открой в браузере:
- `http://your-vps-ip:5003` (прямой доступ)
- `http://your-domain.com` (если настроил Nginx)

## 🔧 Управление сервисом

```bash
# Остановить
systemctl stop load-finder

# Запустить
systemctl start load-finder

# Перезапустить
systemctl restart load-finder

# Статус
systemctl status load-finder

# Логи
journalctl -u load-finder -f
```

## 🐛 Troubleshooting

### Проблема: Chrome не запускается

```bash
# Запускаем Chrome в headless режиме
# В app_full_collector.py добавь в chrome_options:
chrome_options.add_argument('--headless')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
```

### Проблема: Недостаточно памяти

```bash
# Создаем swap файл (2GB)
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### Проблема: Порт занят

```bash
# Проверяем что использует порт
lsof -i :5003

# Убиваем процесс
kill -9 <PID>
```

## 📊 Мониторинг

```bash
# Проверяем использование ресурсов
htop

# Проверяем логи приложения
tail -f /var/www/load-finder/load-finder.log

# Проверяем логи systemd
journalctl -u load-finder -f
```

## 🔄 Обновление приложения

```bash
cd /var/www/load-finder
git pull
source venv/bin/activate
pip install -r requirements.txt
systemctl restart load-finder
```

## 🎯 Готово!

Теперь Load Finder доступен по адресу:
- **Прямой доступ:** `http://your-vps-ip:5003`
- **С доменом:** `http://your-domain.com`

## 📝 Важные заметки

1. **Безопасность credentials.json:**
   - Никогда не коммить в git
   - Права доступа 600
   - Хранить в безопасном месте

2. **Производительность:**
   - Минимум 2GB RAM
   - Рекомендуется 4GB для стабильной работы
   - Chrome потребляет много памяти

3. **Лимиты TruckerPath:**
   - Не злоупотребляй частыми запросами
   - Используй разумные интервалы между поисками

4. **Backup:**
   - Регулярно делай backup credentials.json
   - Backup базы данных брокеров

## 🆘 Поддержка

Если возникли проблемы:
1. Проверь логи: `journalctl -u load-finder -f`
2. Проверь статус: `systemctl status load-finder`
3. Проверь Chrome: `google-chrome --version`
4. Проверь порты: `netstat -tulpn | grep 5003`
