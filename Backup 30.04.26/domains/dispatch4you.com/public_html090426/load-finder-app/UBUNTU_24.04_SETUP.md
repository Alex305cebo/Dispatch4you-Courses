# 🚀 Load Finder - Быстрая установка на Ubuntu 24.04 LTS

## 📋 Пошаговая инструкция

### Шаг 1: Подключение к VPS

```bash
ssh root@your-vps-ip
```

### Шаг 2: Копируй и вставляй команды по порядку

#### 2.1 Обновление системы
```bash
apt update && apt upgrade -y
```

#### 2.2 Установка Python и зависимостей
```bash
apt install -y python3 python3-pip python3-venv wget unzip curl git
```

#### 2.3 Установка Google Chrome
```bash
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
apt install -y ./google-chrome-stable_current_amd64.deb
rm google-chrome-stable_current_amd64.deb
```

#### 2.4 Установка зависимостей для Chrome
```bash
apt install -y fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 \
libatspi2.0-0 libcups2 libdbus-1-3 libdrm2 libgbm1 libgtk-3-0 libnspr4 \
libnss3 libwayland-client0 libxcomposite1 libxdamage1 libxfixes3 \
libxkbcommon0 libxrandr2 xdg-utils
```

#### 2.5 Проверка установки Chrome
```bash
google-chrome --version
```
Должно показать: `Google Chrome 1XX.X.XXXX.XX`

### Шаг 3: Создание директории и загрузка приложения

```bash
# Создаем директорию
mkdir -p /var/www/load-finder
cd /var/www/load-finder

# Клонируем репозиторий
git clone https://github.com/Alex305cebo/dispatcher-courses.git .

# Переходим в папку приложения
cd load-finder-app
```

### Шаг 4: Настройка Python окружения

```bash
# Создаем виртуальное окружение
python3 -m venv venv

# Активируем окружение
source venv/bin/activate

# Обновляем pip
pip install --upgrade pip

# Устанавливаем зависимости
pip install -r requirements.txt
```

### Шаг 5: Создание файла credentials.json

```bash
nano credentials.json
```

Вставь это содержимое (замени на свои данные):
```json
{
  "truckerpath": {
    "username": "your-email@example.com",
    "password": "your-password"
  }
}
```

Сохрани: `Ctrl+O`, `Enter`, `Ctrl+X`

### Шаг 6: Настройка прав доступа

```bash
chmod 600 credentials.json
```

### Шаг 7: Тестовый запуск

```bash
# Запускаем приложение для теста
python3 app_full_collector.py
```

Открой в браузере: `http://your-vps-ip:5003`

Если работает - нажми `Ctrl+C` для остановки и переходи к следующему шагу.

### Шаг 8: Создание systemd сервиса (автозапуск)

```bash
# Выходим из виртуального окружения
deactivate

# Создаем сервис
nano /etc/systemd/system/load-finder.service
```

Вставь это содержимое:
```ini
[Unit]
Description=Load Finder Flask Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/load-finder/load-finder-app
Environment="PATH=/var/www/load-finder/load-finder-app/venv/bin"
ExecStart=/var/www/load-finder/load-finder-app/venv/bin/gunicorn --bind 0.0.0.0:5003 --workers 2 --timeout 300 wsgi:app
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Сохрани: `Ctrl+O`, `Enter`, `Ctrl+X`

### Шаг 9: Запуск сервиса

```bash
# Перезагружаем systemd
systemctl daemon-reload

# Запускаем сервис
systemctl start load-finder

# Включаем автозапуск при перезагрузке
systemctl enable load-finder

# Проверяем статус
systemctl status load-finder
```

Должно показать: `Active: active (running)`

### Шаг 10: Открытие порта в firewall

```bash
# Устанавливаем UFW (если не установлен)
apt install -y ufw

# Разрешаем SSH (ВАЖНО!)
ufw allow 22/tcp

# Разрешаем порт приложения
ufw allow 5003/tcp

# Включаем firewall
ufw --force enable

# Проверяем статус
ufw status
```

### Шаг 11: Проверка работы

```bash
# Проверяем локально
curl http://localhost:5003

# Проверяем извне
curl http://your-vps-ip:5003
```

Открой в браузере: `http://your-vps-ip:5003`

## ✅ Готово! Приложение работает!

---

## 🔧 Полезные команды

### Управление сервисом
```bash
# Остановить
systemctl stop load-finder

# Запустить
systemctl start load-finder

# Перезапустить
systemctl restart load-finder

# Статус
systemctl status load-finder

# Логи (последние 50 строк)
journalctl -u load-finder -n 50

# Логи в реальном времени
journalctl -u load-finder -f
```

### Обновление приложения
```bash
cd /var/www/load-finder/load-finder-app
git pull
source venv/bin/activate
pip install -r requirements.txt
deactivate
systemctl restart load-finder
```

### Проверка ресурсов
```bash
# Использование памяти
free -h

# Использование диска
df -h

# Процессы
htop
```

---

## 🐛 Решение проблем

### Проблема: Сервис не запускается

```bash
# Смотрим подробные логи
journalctl -u load-finder -n 100 --no-pager

# Проверяем права на файлы
ls -la /var/www/load-finder/load-finder-app/

# Проверяем что Chrome установлен
google-chrome --version
```

### Проблема: Порт занят

```bash
# Проверяем что использует порт 5003
lsof -i :5003

# Убиваем процесс (замени PID на реальный)
kill -9 <PID>

# Перезапускаем сервис
systemctl restart load-finder
```

### Проблема: Недостаточно памяти

```bash
# Создаем swap файл 2GB
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Проверяем
free -h
```

### Проблема: Chrome не запускается

Отредактируй `app_full_collector.py`:
```bash
nano /var/www/load-finder/load-finder-app/app_full_collector.py
```

Найди строку с `chrome_options` и добавь:
```python
chrome_options.add_argument('--headless')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
```

Перезапусти:
```bash
systemctl restart load-finder
```

---

## 🌐 Настройка домена (Опционально)

Если хочешь использовать домен вместо IP:

### 1. Установка Nginx
```bash
apt install -y nginx
```

### 2. Создание конфигурации
```bash
nano /etc/nginx/sites-available/load-finder
```

Вставь:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

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

### 3. Активация конфигурации
```bash
ln -s /etc/nginx/sites-available/load-finder /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 4. Открытие портов
```bash
ufw allow 80/tcp
ufw allow 443/tcp
```

### 5. Установка SSL (HTTPS)
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com -d www.your-domain.com
```

Теперь доступно по: `https://your-domain.com`

---

## 📊 Мониторинг

### Установка htop для мониторинга
```bash
apt install -y htop
htop
```

### Проверка логов
```bash
# Логи приложения
journalctl -u load-finder -f

# Логи Nginx (если установлен)
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🔐 Безопасность

### Изменение SSH порта (Рекомендуется)
```bash
nano /etc/ssh/sshd_config
```
Измени `Port 22` на `Port 2222` (или другой)

```bash
systemctl restart sshd
ufw allow 2222/tcp
```

### Отключение root логина
```bash
# Создай нового пользователя
adduser loadfinder
usermod -aG sudo loadfinder

# Отредактируй SSH конфиг
nano /etc/ssh/sshd_config
```
Измени `PermitRootLogin yes` на `PermitRootLogin no`

```bash
systemctl restart sshd
```

---

## 📝 Важные заметки

1. **IP адрес VPS:** Запиши свой IP адрес
2. **Порт приложения:** 5003
3. **Путь к приложению:** `/var/www/load-finder/load-finder-app`
4. **Логи:** `journalctl -u load-finder -f`
5. **Credentials:** Храни в безопасности, не коммить в git

---

## 🎯 Итоговая проверка

Если все работает, ты должен видеть:

✅ `systemctl status load-finder` - Active (running)
✅ `curl http://localhost:5003` - HTML ответ
✅ `http://your-vps-ip:5003` в браузере - Load Finder интерфейс
✅ Можешь искать грузы и получать результаты

---

## 🆘 Нужна помощь?

Если что-то не работает:

1. Проверь логи: `journalctl -u load-finder -n 100`
2. Проверь статус: `systemctl status load-finder`
3. Проверь порты: `netstat -tulpn | grep 5003`
4. Проверь firewall: `ufw status`
5. Проверь Chrome: `google-chrome --version`

Удачи! 🚀
