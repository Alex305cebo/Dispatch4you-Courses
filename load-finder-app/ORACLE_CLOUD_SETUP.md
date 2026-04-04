# 🚀 Oracle Cloud Free Tier - Пошаговая настройка Load Finder

## ✅ ЧТО ПОЛУЧИШЬ:
- Бесплатный VPS навсегда (24GB RAM)
- Работает 24/7 без ограничений
- Публичный IP для домена dispatch4you.com
- HTTPS сертификат

---

## 📋 ШАГ 1: РЕГИСТРАЦИЯ ORACLE CLOUD (10 минут)

### 1.1 Создание аккаунта
1. Открой https://www.oracle.com/cloud/free/
2. Нажми **"Start for free"**
3. Заполни форму:
   - Email
   - Страна (выбери USA для лучшей доступности)
   - Имя и фамилия
4. Подтверди email
5. Введи данные кредитной карты (НЕ СПИШУТ деньги, только проверка)
   - Спишут $1 для проверки и сразу вернут
6. Дождись активации аккаунта (1-5 минут)

### 1.2 Вход в консоль
1. Зайди на https://cloud.oracle.com/
2. Войди с созданным аккаунтом
3. Выбери регион (рекомендую **US East (Ashburn)**)

---

## 📋 ШАГ 2: СОЗДАНИЕ VPS (15 минут)

### 2.1 Создание Compute Instance
1. В меню слева: **Compute** → **Instances**
2. Нажми **"Create Instance"**

### 2.2 Настройка сервера
**Name:** `load-finder-server`

**Image and Shape:**
- Нажми **"Change Image"**
- Выбери **Ubuntu 22.04** (Canonical Ubuntu)
- Нажми **"Select Image"**

**Shape:**
- Нажми **"Change Shape"**
- Выбери **Ampere (ARM)** → **VM.Standard.A1.Flex**
- OCPU: **4** (максимум для бесплатного)
- Memory: **24 GB** (максимум для бесплатного)
- Нажми **"Select Shape"**

**Networking:**
- Оставь по умолчанию (создаст новую VCN)
- Убедись что **"Assign a public IPv4 address"** включено ✅

**Add SSH Keys:**
- Выбери **"Generate a key pair for me"**
- Нажми **"Save Private Key"** → сохрани файл `ssh-key-*.key`
- Нажми **"Save Public Key"** → сохрани файл `ssh-key-*.key.pub`

### 2.3 Создание
1. Нажми **"Create"** внизу страницы
2. Дождись статуса **"Running"** (2-3 минуты)
3. **ЗАПИШИ PUBLIC IP ADDRESS** (например: 123.45.67.89)

---

## 📋 ШАГ 3: НАСТРОЙКА FIREWALL (5 минут)

### 3.1 Открытие портов
1. На странице Instance нажми на **VCN name** (Virtual Cloud Network)
2. Нажми на **Subnet** (Public Subnet)
3. Нажми на **Default Security List**
4. Нажми **"Add Ingress Rules"**

**Правило 1 - HTTP:**
- Source CIDR: `0.0.0.0/0`
- IP Protocol: `TCP`
- Destination Port Range: `80`
- Нажми **"Add Ingress Rules"**

**Правило 2 - HTTPS:**
- Source CIDR: `0.0.0.0/0`
- IP Protocol: `TCP`
- Destination Port Range: `443`
- Нажми **"Add Ingress Rules"**

**Правило 3 - Flask (5003):**
- Source CIDR: `0.0.0.0/0`
- IP Protocol: `TCP`
- Destination Port Range: `5003`
- Нажми **"Add Ingress Rules"**

---

## 📋 ШАГ 4: ПОДКЛЮЧЕНИЕ К СЕРВЕРУ (5 минут)

### 4.1 Подготовка SSH ключа (Windows)

**Вариант A - PowerShell:**
```powershell
# Переименуй ключ
Rename-Item "C:\Users\ТвоеИмя\Downloads\ssh-key-*.key" "oracle-key.pem"

# Подключись
ssh -i "C:\Users\ТвоеИмя\Downloads\oracle-key.pem" ubuntu@ТВОЙ_IP
```

**Вариант B - PuTTY:**
1. Скачай PuTTYgen: https://www.putty.org/
2. Открой PuTTYgen
3. Load → выбери `ssh-key-*.key`
4. Save private key → сохрани как `oracle-key.ppk`
5. Открой PuTTY
6. Host Name: `ubuntu@ТВОЙ_IP`
7. Connection → SSH → Auth → Browse → выбери `oracle-key.ppk`
8. Open

### 4.2 Первое подключение
```bash
# Ответь "yes" на вопрос о fingerprint
# Ты должен увидеть:
ubuntu@load-finder-server:~$
```

---

## 📋 ШАГ 5: УСТАНОВКА ПРИЛОЖЕНИЯ (10 минут)

### 5.1 Обновление системы
```bash
sudo apt update
sudo apt upgrade -y
```

### 5.2 Установка зависимостей
```bash
# Python и pip
sudo apt install -y python3-pip python3-venv git

# Chromium (легче чем Chrome)
sudo apt install -y chromium-browser chromium-chromedriver

# Nginx для веб-сервера
sudo apt install -y nginx
```

### 5.3 Клонирование репозитория
```bash
cd ~
git clone https://github.com/Alex305cebo/dispatcher-courses.git
cd dispatcher-courses/load-finder-app
```

### 5.4 Установка Python зависимостей
```bash
pip3 install -r requirements.txt
```

### 5.5 Создание credentials.json
```bash
nano credentials.json
```

Вставь:
```json
{
  "truckerpath": {
    "username": "ТВОЙ_EMAIL",
    "password": "ТВОЙ_ПАРОЛЬ"
  }
}
```

Сохрани: `Ctrl+X` → `Y` → `Enter`

### 5.6 Тестовый запуск
```bash
python3 app_full_collector.py
```

Открой в браузере: `http://ТВОЙ_IP:5003`

Если работает - нажми `Ctrl+C` для остановки.

---

## 📋 ШАГ 6: АВТОЗАПУСК (5 минут)

### 6.1 Создание systemd service
```bash
sudo nano /etc/systemd/system/load-finder.service
```

Вставь:
```ini
[Unit]
Description=Load Finder Flask App
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/dispatcher-courses/load-finder-app
ExecStart=/usr/bin/python3 /home/ubuntu/dispatcher-courses/load-finder-app/app_full_collector.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Сохрани: `Ctrl+X` → `Y` → `Enter`

### 6.2 Запуск сервиса
```bash
sudo systemctl daemon-reload
sudo systemctl enable load-finder
sudo systemctl start load-finder
sudo systemctl status load-finder
```

Должен быть статус: **active (running)** ✅

---

## 📋 ШАГ 7: НАСТРОЙКА NGINX (5 минут)

### 7.1 Конфигурация Nginx
```bash
sudo nano /etc/nginx/sites-available/load-finder
```

Вставь:
```nginx
server {
    listen 80;
    server_name ТВОЙ_IP;

    location / {
        proxy_pass http://127.0.0.1:5003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Сохрани: `Ctrl+X` → `Y` → `Enter`

### 7.2 Активация конфигурации
```bash
sudo ln -s /etc/nginx/sites-available/load-finder /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7.3 Открытие портов в Ubuntu firewall
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5003/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

**Проверка:** Открой `http://ТВОЙ_IP` в браузере - должно работать! ✅

---

## 📋 ШАГ 8: НАСТРОЙКА ДОМЕНА (5 минут)

### 8.1 DNS настройки в Hostinger
1. Зайди на https://hpanel.hostinger.com/
2. Domains → dispatch4you.com → DNS / Name Servers
3. Нажми **"Add Record"**

**A Record:**
- Type: `A`
- Name: `load-finder` (или `@` для главного домена)
- Points to: `ТВОЙ_ORACLE_IP`
- TTL: `14400`

4. Нажми **"Add Record"**
5. Подожди 5-10 минут для распространения DNS

### 8.2 Обновление Nginx для домена
```bash
sudo nano /etc/nginx/sites-available/load-finder
```

Измени `server_name`:
```nginx
server_name load-finder.dispatch4you.com;
```

Сохрани и перезапусти:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## 📋 ШАГ 9: HTTPS СЕРТИФИКАТ (5 минут)

### 9.1 Установка Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 9.2 Получение сертификата
```bash
sudo certbot --nginx -d load-finder.dispatch4you.com
```

Ответь на вопросы:
- Email: `твой@email.com`
- Agree to terms: `Y`
- Share email: `N`
- Redirect HTTP to HTTPS: `2` (Yes)

### 9.3 Автообновление сертификата
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## 🎉 ГОТОВО!

Твое приложение работает на:
- **HTTP:** http://load-finder.dispatch4you.com
- **HTTPS:** https://load-finder.dispatch4you.com

### Полезные команды:

**Проверка статуса:**
```bash
sudo systemctl status load-finder
```

**Просмотр логов:**
```bash
sudo journalctl -u load-finder -f
```

**Перезапуск:**
```bash
sudo systemctl restart load-finder
```

**Обновление кода:**
```bash
cd ~/dispatcher-courses/load-finder-app
git pull
sudo systemctl restart load-finder
```

---

## 🆘 TROUBLESHOOTING

**Проблема: Не могу подключиться по SSH**
- Проверь что порт 22 открыт в Security List
- Проверь правильность пути к SSH ключу
- Попробуй: `ssh -v -i путь/к/ключу ubuntu@IP` для детальных логов

**Проблема: Сайт не открывается**
- Проверь статус: `sudo systemctl status load-finder`
- Проверь логи: `sudo journalctl -u load-finder -f`
- Проверь Nginx: `sudo nginx -t`
- Проверь firewall: `sudo ufw status`

**Проблема: Chrome не запускается**
- Проверь что Chromium установлен: `chromium-browser --version`
- Проверь логи приложения

---

## 💰 СТОИМОСТЬ

**Навсегда бесплатно!** Oracle Cloud Free Tier включает:
- 4 OCPU ARM
- 24 GB RAM
- 200 GB storage
- Unlimited bandwidth

Пока используешь Always Free ресурсы - платить не нужно! 🎉
