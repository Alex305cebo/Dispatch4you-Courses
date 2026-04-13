# 🌐 Полная настройка Hostinger для Dispatch4You

## 📋 Содержание
1. [Базовая настройка хостинга](#базовая-настройка-хостинга)
2. [Настройка домена](#настройка-домена)
3. [SSL сертификат](#ssl-сертификат)
4. [Загрузка файлов](#загрузка-файлов)
5. [Настройка email](#настройка-email)
6. [Оптимизация производительности](#оптимизация-производительности)
7. [Резервное копирование](#резервное-копирование)
8. [Мониторинг](#мониторинг)

---

## 1. Базовая настройка хостинга

### Шаг 1.1: Вход в панель управления
1. Перейдите на https://hostinger.com
2. Войдите в аккаунт
3. Откройте **hPanel** (панель управления)
4. Выберите ваш хостинг-план

### Шаг 1.2: Проверка параметров хостинга
Перейдите в **Hosting → Manage**

Убедитесь что включено:
- ✅ **PHP версия:** 8.1 или выше
- ✅ **HTTPS:** Включён
- ✅ **HTTP/2:** Включён
- ✅ **Gzip сжатие:** Включено
- ✅ **Кеширование:** Включено

### Шаг 1.3: Настройка PHP
1. В hPanel перейдите: **Advanced → PHP Configuration**
2. Установите параметры:
   ```
   memory_limit = 256M
   max_execution_time = 300
   max_input_time = 300
   post_max_size = 64M
   upload_max_filesize = 64M
   ```
3. Нажмите **Save**

### Шаг 1.4: Настройка базы данных (если нужна)
Если планируете использовать базу данных:
1. Перейдите: **Databases → MySQL Databases**
2. Создайте новую БД:
   - **Database name:** dispatch4you_db
   - **Username:** dispatch4you_user
   - **Password:** [сгенерируйте сложный пароль]
3. Сохраните данные доступа в безопасном месте

---

## 2. Настройка домена

### Шаг 2.1: Подключение домена
Если домен куплен на Hostinger:
1. Перейдите: **Domains → Manage**
2. Домен должен быть автоматически привязан к хостингу
3. Проверьте статус: **Active**

Если домен куплен в другом месте:
1. В регистраторе домена измените NS-серверы на:
   ```
   ns1.dns-parking.com
   ns2.dns-parking.com
   ```
2. Подождите 24-48 часов для распространения DNS

### Шаг 2.2: Настройка DNS записей
1. В hPanel: **Domains → DNS / Nameservers**
2. Убедитесь что есть записи:

**A-запись:**
```
Type: A
Name: @
Points to: [IP вашего хостинга]
TTL: 14400
```

**A-запись для www:**
```
Type: A
Name: www
Points to: [IP вашего хостинга]
TTL: 14400
```

**CNAME (опционально):**
```
Type: CNAME
Name: www
Points to: dispatch4you.com
TTL: 14400
```

### Шаг 2.3: Проверка домена
1. Откройте терминал/командную строку
2. Выполните: `ping dispatch4you.com`
3. Должен вернуться IP вашего хостинга

---

## 3. SSL сертификат

### Шаг 3.1: Установка SSL (Let's Encrypt)
1. В hPanel: **Security → SSL**
2. Найдите ваш домен
3. Нажмите **Install SSL**
4. Выберите: **Let's Encrypt** (бесплатный)
5. Подождите 5-10 минут

### Шаг 3.2: Принудительный HTTPS
1. В hPanel: **Advanced → Force HTTPS**
2. Включите переключатель для вашего домена
3. Или добавьте в `.htaccess` (уже есть в вашем файле):
   ```apache
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   ```

### Шаг 3.3: Проверка SSL
1. Откройте: https://dispatch4you.com
2. В адресной строке должен быть замок 🔒
3. Проверьте на: https://www.ssllabs.com/ssltest/
   - Цель: рейтинг **A** или **A+**

---

## 4. Загрузка файлов

### Способ 1: File Manager (рекомендуется для начинающих)

#### Шаг 4.1: Открыть File Manager
1. В hPanel: **Files → File Manager**
2. Перейдите в папку: **public_html**
3. Удалите все файлы по умолчанию (index.html, default.php)

#### Шаг 4.2: Загрузка файлов
1. Нажмите **Upload Files**
2. Выберите все файлы проекта:
   - index.html
   - about.html
   - robots.txt
   - sitemap.xml
   - .htaccess
   - favicon.svg
   - og-image.png (когда создадите)
   - папки: css/, js/, pages/, audio/, images/
3. Дождитесь завершения загрузки

#### Шаг 4.3: Проверка структуры
Структура должна быть:
```
public_html/
├── index.html
├── about.html
├── robots.txt
├── sitemap.xml
├── .htaccess
├── favicon.svg
├── og-image.png
├── css/
├── js/
├── pages/
├── audio/
└── images/
```

### Способ 2: FTP (для продвинутых)

#### Шаг 4.1: Получить FTP данные
1. В hPanel: **Files → FTP Accounts**
2. Создайте FTP аккаунт или используйте существующий
3. Запишите:
   - **Host:** ftp.dispatch4you.com
   - **Username:** [ваш FTP логин]
   - **Password:** [ваш FTP пароль]
   - **Port:** 21

#### Шаг 4.2: Подключение через FileZilla
1. Скачайте FileZilla: https://filezilla-project.org/
2. Откройте FileZilla
3. Введите данные FTP
4. Нажмите **Quickconnect**
5. Перейдите в папку **public_html**
6. Перетащите файлы с компьютера на сервер

### Способ 3: Git (для разработчиков)

#### Шаг 4.1: Подключение по SSH
1. В hPanel: **Advanced → SSH Access**
2. Включите SSH
3. Подключитесь:
   ```bash
   ssh u123456789@dispatch4you.com
   ```

#### Шаг 4.2: Клонирование репозитория
```bash
cd public_html
git clone https://github.com/your-repo/DispatcherTraining.git .
```

---

## 5. Настройка Email

### Шаг 5.1: Создание email аккаунтов
1. В hPanel: **Emails → Email Accounts**
2. Создайте аккаунты:

**info@dispatch4you.com** (основной)
- Password: [сложный пароль]
- Storage: 5 GB

**support@dispatch4you.com** (поддержка)
- Password: [сложный пароль]
- Storage: 3 GB

**noreply@dispatch4you.com** (автоматические письма)
- Password: [сложный пароль]
- Storage: 1 GB

### Шаг 5.2: Настройка email клиента
Для Gmail/Outlook используйте:

**IMAP (входящие):**
```
Server: imap.hostinger.com
Port: 993
Security: SSL/TLS
Username: info@dispatch4you.com
Password: [ваш пароль]
```

**SMTP (исходящие):**
```
Server: smtp.hostinger.com
Port: 465
Security: SSL/TLS
Username: info@dispatch4you.com
Password: [ваш пароль]
```

### Шаг 5.3: Настройка SPF и DKIM
1. В hPanel: **Emails → Email Deliverability**
2. Включите **DKIM**
3. Добавьте SPF запись в DNS:
   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:_spf.hostinger.com ~all
   TTL: 14400
   ```

---

## 6. Оптимизация производительности

### Шаг 6.1: Включение кеширования
1. В hPanel: **Advanced → Cache Manager**
2. Включите:
   - ✅ **Browser Cache**
   - ✅ **Server Cache**
3. Установите время кеширования: **1 год** для статики

### Шаг 6.2: Оптимизация изображений
1. Конвертируйте все изображения в WebP
2. Сжимайте изображения (TinyPNG, Squoosh)
3. Используйте lazy loading

### Шаг 6.3: Минификация CSS/JS
Используйте онлайн инструменты:
- CSS: https://cssminifier.com/
- JS: https://javascript-minifier.com/

Или установите плагин минификации в hPanel.

### Шаг 6.4: CDN (опционально)
Для ускорения загрузки по всему миру:
1. В hPanel: **Advanced → Cloudflare**
2. Подключите бесплатный план Cloudflare
3. Следуйте инструкциям

---

## 7. Резервное копирование

### Шаг 7.1: Автоматические бэкапы
1. В hPanel: **Files → Backups**
2. Убедитесь что включены:
   - ✅ **Weekly backups** (еженедельные)
   - ✅ **Daily backups** (ежедневные - на премиум планах)

### Шаг 7.2: Ручное резервное копирование
1. В hPanel: **Files → Backups**
2. Нажмите **Generate Backup**
3. Скачайте backup на компьютер
4. Храните локально

### Шаг 7.3: Восстановление из бэкапа
1. В hPanel: **Files → Backups**
2. Выберите нужный бэкап
3. Нажмите **Restore**

---

## 8. Мониторинг

### Шаг 8.1: Uptime мониторинг
Используйте бесплатные сервисы:
- **UptimeRobot:** https://uptimerobot.com/
- **Pingdom:** https://www.pingdom.com/

Настройка UptimeRobot:
1. Зарегистрируйтесь
2. Добавьте монитор:
   - Type: HTTP(s)
   - URL: https://dispatch4you.com
   - Interval: 5 минут
3. Настройте уведомления на email

### Шаг 8.2: Мониторинг ресурсов
1. В hPanel: **Advanced → Resource Usage**
2. Отслеживайте:
   - CPU usage
   - RAM usage
   - Disk space
   - Bandwidth

### Шаг 8.3: Логи
1. В hPanel: **Advanced → Error Logs**
2. Проверяйте регулярно на ошибки
3. Исправляйте найденные проблемы

---

## 🔒 Безопасность

### Защита от DDoS
1. В hPanel: **Security → DDoS Protection**
2. Включите защиту

### Защита от вредоносного ПО
1. В hPanel: **Security → Malware Scanner**
2. Запускайте сканирование еженедельно

### Блокировка IP
Если видите подозрительную активность:
1. В hPanel: **Security → IP Blocker**
2. Добавьте IP в чёрный список

### Защита директорий паролем
Для защиты админ-панели:
1. В hPanel: **Security → Password Protect Directories**
2. Выберите директорию (например, /admin)
3. Создайте пользователя и пароль

---

## ✅ Финальная проверка

После настройки проверьте:
- [ ] Сайт открывается по https://dispatch4you.com
- [ ] SSL сертификат активен (замок в браузере)
- [ ] robots.txt доступен: https://dispatch4you.com/robots.txt
- [ ] sitemap.xml доступен: https://dispatch4you.com/sitemap.xml
- [ ] Email работает (отправьте тестовое письмо)
- [ ] Скорость загрузки > 90 (PageSpeed Insights)
- [ ] Все страницы открываются корректно
- [ ] Мобильная версия работает
- [ ] Бэкапы настроены
- [ ] Мониторинг работает

---

## 🆘 Решение проблем

### Сайт не открывается
1. Проверьте DNS: `nslookup dispatch4you.com`
2. Проверьте SSL сертификат
3. Проверьте .htaccess на ошибки
4. Свяжитесь с поддержкой Hostinger

### Ошибка 500
1. Проверьте Error Logs в hPanel
2. Проверьте права доступа к файлам (644 для файлов, 755 для папок)
3. Проверьте .htaccess на синтаксические ошибки

### Медленная загрузка
1. Включите кеширование
2. Оптимизируйте изображения
3. Минифицируйте CSS/JS
4. Подключите CDN

### Email не отправляется
1. Проверьте SMTP настройки
2. Проверьте SPF и DKIM записи
3. Проверьте не попали ли в спам

---

## 📞 Поддержка Hostinger

**Live Chat:** 24/7 в hPanel  
**Email:** support@hostinger.com  
**База знаний:** https://support.hostinger.com/

**Среднее время ответа:** 2-5 минут

---

## 📊 Рекомендуемые настройки для Dispatch4You

### Минимальный план
- **Hosting:** Premium Shared Hosting
- **RAM:** 2 GB
- **Storage:** 100 GB SSD
- **Bandwidth:** Unlimited
- **Websites:** 100

### Оптимальный план
- **Hosting:** Business Shared Hosting
- **RAM:** 4 GB
- **Storage:** 200 GB SSD
- **Bandwidth:** Unlimited
- **Daily backups:** ✅
- **Free CDN:** ✅

---

**Настройка завершена! Переходите к интеграции с Google →**
