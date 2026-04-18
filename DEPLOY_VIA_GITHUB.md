# 🚀 Деплой BETA через GitHub Actions

## ✅ Что готово:

- ✅ GitHub Action создан: `.github/workflows/deploy-beta-game.yml`
- ✅ Документация: `.github/SETUP_SECRETS.md`
- ✅ Быстрая инструкция: `.github/QUICK_DEPLOY_GITHUB.md`
- ✅ Архив: `game-beta-v2.2.0-20260418-190441.zip`

---

## 🎯 Деплой за 5 шагов:

### Шаг 1: Закоммить изменения
```bash
git add .
git commit -m "🚀 BETA v2.2.0-beta.1: Interactive feedback system + GitHub Actions deploy"
```

### Шаг 2: Запушить в GitHub
```bash
git push origin main
```

### Шаг 3: Настроить секреты (первый раз)
1. Открыть: https://github.com/ВАШ_USERNAME/ВАШ_РЕПОЗИТОРИЙ/settings/secrets/actions
2. Добавить 3 секрета:
   - `SFTP_USERNAME` - SSH логин от Hostinger
   - `SFTP_SERVER` - SSH сервер (ssh.hostinger.com)
   - `SSH_PRIVATE_KEY` - приватный SSH ключ

**Подробно:** `.github/SETUP_SECRETS.md`

### Шаг 4: Запустить деплой
1. Открыть: https://github.com/ВАШ_USERNAME/ВАШ_РЕПОЗИТОРИЙ/actions
2. Выбрать **"Deploy BETA Game v2.2.0-beta.1"**
3. Нажать **"Run workflow"**
4. Выбрать **beta**
5. Нажать **"Run workflow"**

### Шаг 5: Проверить
```
https://dispatch4you.com/game
```

---

## ⏱️ Время деплоя:

- Первый раз (с настройкой секретов): ~10 минут
- Последующие разы: ~3-5 минут (автоматически)

---

## 📊 Что делает GitHub Action:

```
1. Checkout кода                    [10 сек]
2. Setup Node.js                    [20 сек]
3. Install dependencies             [60 сек]
4. Build production                 [90 сек]
5. Copy interactive-feedback files  [5 сек]
6. Create archive                   [10 сек]
7. Deploy via SFTP                  [30 сек]
8. Create summary                   [5 сек]
────────────────────────────────────────────
TOTAL: ~3-5 минут
```

---

## 🔒 Безопасность:

- ✅ SSH ключи зашифрованы в GitHub Secrets
- ✅ Не видны в логах
- ✅ Доступны только в Actions
- ✅ Можно обновить в любой момент

---

## 🎯 Преимущества:

### Автоматизация
- Сборка, копирование, деплой - всё автоматически
- Не нужно помнить команды
- Не нужно вручную загружать файлы

### Надёжность
- Каждый шаг логируется
- Ошибки видны сразу
- История всех деплоев

### Скорость
- 3 клика вместо 10 шагов
- Параллельная работа
- Оптимизированная сборка

---

## 🔄 Откат:

Если что-то пошло не так:

### Вариант 1: Через Hostinger
1. File Manager → public_html/adventure/
2. Удалить `dist/`
3. Переименовать `dist.backup` → `dist`

### Вариант 2: Через GitHub
1. Actions → найти предыдущий успешный деплой
2. Re-run workflow

---

## 📖 Документация:

- **SETUP_SECRETS.md** - настройка секретов (первый раз)
- **QUICK_DEPLOY_GITHUB.md** - быстрая инструкция
- **deploy-beta-game.yml** - сам workflow

---

## 🆘 Проблемы?

### "Secrets not found"
→ Добавь секреты в Settings → Secrets → Actions

### "Permission denied"
→ Проверь SSH ключ в Hostinger Panel

### "Build failed"
→ Проверь логи в Actions, возможно нужно обновить зависимости

---

## ✅ Чеклист:

- [ ] Закоммитить изменения
- [ ] Запушить в GitHub
- [ ] Настроить секреты (первый раз)
- [ ] Запустить workflow
- [ ] Дождаться завершения (~3-5 мин)
- [ ] Проверить https://dispatch4you.com/game
- [ ] Протестировать на desktop
- [ ] Протестировать на mobile

---

**Готово! Деплой через GitHub Actions настроен! 🎉**
