# 🚀 Шпаргалка по деплою

## ⚡ Быстрый деплой (рекомендуется)

```powershell
./quick-deploy.ps1
```

Или с кастомным сообщением:
```powershell
./quick-deploy.ps1 -message "Добавлен модуль 13"
```

---

## 🔧 Ручной деплой

```bash
git add .
git commit -m "Update"
git push
```

---

## 📍 GitHub Secrets (настроить один раз)

`Settings → Secrets → Actions → New secret`

```
FTP_SERVER = ftp.dispatch4you.com
FTP_USERNAME = u123456789
FTP_PASSWORD = твой_пароль
```

---

## 🎯 Проверка статуса

- **GitHub Actions:** `github.com/твой-repo/actions`
- **Сайт:** `https://dispatch4you.com`
- **Время деплоя:** 2-5 минут

---

## 🚫 Что НЕ деплоится

- *.md файлы
- *.py, *.ps1, *.bat скрипты
- test-*.html файлы
- backup_* папки
- SESSION-*.md отчеты
- Dev проекты (audio-learning-platform и т.д.)

---

## ✅ Готово!

Просто пуши в main - всё остальное автоматически!
