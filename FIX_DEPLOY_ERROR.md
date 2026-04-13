# 🔴 Исправление ошибки деплоя

## Проблема
GitHub Actions показывает FAILED (красный крестик) при деплое на Hostinger.

## Причина
Скорее всего одна из этих проблем:
1. На сервере Hostinger нет Git репозитория
2. SSH ключ устарел или неправильный
3. Неправильный путь к папке
4. Нет прав на выполнение git pull

---

## 🔍 ШАГ 1: Проверьте логи ошибки (2 минуты)

1. Откройте: https://github.com/Alex305cebo/Dispatch4you-Courses/actions
2. Найдите failed workflow (красный крестик): "SEO optimization: add robots.txt..."
3. Кликните на него
4. Кликните на job "deploy"
5. Раскройте шаг "Deploy to Hostinger via SSH"
6. Посмотрите текст ошибки

**Возможные ошибки:**

### Ошибка 1: "fatal: not a git repository"
```
cd ~/domains/dispatch4you.com/public_html
fatal: not a git repository (or any of the parent directories): .git
```

**Решение:** На сервере не настроен Git. Нужно инициализировать репозиторий.

---

### Ошибка 2: "Permission denied"
```
Permission denied (publickey)
```

**Решение:** SSH ключ неправильный или устарел.

---

### Ошибка 3: "No such file or directory"
```
cd: ~/domains/dispatch4you.com/public_html: No such file or directory
```

**Решение:** Неправильный путь к папке.

---

## 🛠️ ШАГ 2: Исправление (выберите вашу ошибку)

### Решение для "not a git repository"

Нужно настроить Git на Hostinger сервере:

1. **Откройте Hostinger hPanel**
2. **Advanced → SSH Access**
3. **Включите SSH** (если выключен)
4. **Скопируйте команду подключения**

Пример:
```bash
ssh u123456789@dispatch4you.com -p 65002
```

5. **Откройте терминал на компьютере** (PowerShell или CMD)
6. **Подключитесь к серверу:**
```bash
ssh u123456789@dispatch4you.com -p 65002
```

7. **Введите пароль** (из Hostinger)

8. **Перейдите в папку сайта:**
```bash
cd domains/dispatch4you.com/public_html
```

9. **Инициализируйте Git:**
```bash
git init
git remote add origin https://github.com/Alex305cebo/Dispatch4you-Courses.git
git fetch origin
git checkout -b main
git pull origin main
```

10. **Проверьте что файлы появились:**
```bash
ls -la
```

Должны увидеть: robots.txt, sitemap.xml, index.html и т.д.

11. **Выйдите из SSH:**
```bash
exit
```

**Готово!** Теперь GitHub Actions сможет делать git pull.

---

### Решение для "Permission denied"

SSH ключ нужно обновить:

1. **Откройте Hostinger hPanel**
2. **Advanced → SSH Access**
3. **Создайте новый SSH ключ** или скопируйте существующий
4. **Откройте GitHub:**
   - Settings → Secrets and variables → Actions
5. **Обновите секреты:**
   - `SSH_HOST`: ftp.dispatch4you.com (или IP)
   - `SSH_USERNAME`: u123456789
   - `SSH_PRIVATE_KEY`: [ваш приватный ключ]
   - `SSH_PORT`: 65002 (или другой порт)

---

### Решение для "No such file or directory"

Путь к папке неправильный. Проверьте:

1. **Подключитесь по SSH** (см. выше)
2. **Найдите правильный путь:**
```bash
pwd
cd domains
ls -la
cd dispatch4you.com
ls -la
```

3. **Обновите workflow файл:**

Откройте `.github/workflows/deploy-hostinger.yml`

Измените путь на правильный:
```yaml
script: |
  cd ~/domains/dispatch4you.com/public_html  # или другой путь
  git pull origin main
```

---

## 🚀 ШАГ 3: Повторный деплой

После исправления:

1. **Сделайте коммит:**
```bash
git add .
git commit -m "Fix deploy path"
git push origin main
```

2. **GitHub Actions автоматически запустится**

3. **Проверьте статус:**
   - https://github.com/Alex305cebo/Dispatch4you-Courses/actions
   - Должна быть зелёная галочка ✅

---

## ✅ ШАГ 4: Проверка после успешного деплоя

Откройте в браузере:
- https://dispatch4you.com/robots.txt ✅
- https://dispatch4you.com/sitemap.xml ✅
- https://dispatch4you.com/og-image.png ✅

**Если файлы открываются = деплой работает!** 🎉

---

## 💡 Альтернативное решение (если SSH не работает)

Если не получается настроить SSH деплой, можно использовать FTP:

1. **Обновите workflow на FTP** (я уже создал конфигурацию)
2. **Настройте FTP секреты в GitHub**
3. **Деплой будет работать через FTP**

Но SSH быстрее и надёжнее, поэтому лучше исправить SSH.

---

## 📞 Нужна помощь?

**Hostinger Support:**
- Live Chat: 24/7 в hPanel
- Скажите: "Нужна помощь с настройкой Git и SSH для автодеплоя"

**GitHub Support:**
- https://support.github.com/

---

## 🎯 Краткая инструкция

1. Проверьте логи ошибки в GitHub Actions
2. Подключитесь по SSH к Hostinger
3. Инициализируйте Git репозиторий
4. Сделайте git pull вручную
5. Повторите git push - деплой должен заработать

**Время: 10-15 минут**

---

**После исправления деплой будет работать автоматически при каждом git push!**
