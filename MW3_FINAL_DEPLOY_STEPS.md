# 🚀 MW3 GM2 — Финальные шаги деплоя

## ✅ Что уже сделано:

1. ✅ TypeScript скомпилирован
2. ✅ Deployment package создан (`C:\MW3 GM2\deploy`)
3. ✅ Git репозиторий инициализирован
4. ✅ Initial commit создан
5. ✅ .gitignore настроен

---

## 🎯 Что нужно сделать ТЕБЕ:

### Шаг 1: Создай GitHub репозиторий

1. Открой https://github.com/new
2. **Repository name:** `mw3-gm2-strategy`
3. **Description:** "MW3 GM2 Strategy - Mushroom Wars style RTS game"
4. **Public** (или Private если хочешь)
5. **НЕ добавляй** README, .gitignore, license (у нас уже есть)
6. Нажми **Create repository**

---

### Шаг 2: Скопируй URL репозитория

После создания GitHub покажет URL типа:
```
https://github.com/ТВО_ИМЯ/mw3-gm2-strategy.git
```

**Скопируй этот URL!**

---

### Шаг 3: Push на GitHub

Открой PowerShell и выполни:

```powershell
cd "C:\MW3 GM2"

# Добавь remote (замени URL на свой!)
git remote add origin https://github.com/ТВО_ИМЯ/mw3-gm2-strategy.git

# Переименуй ветку в main (если нужно)
git branch -M main

# Push
git push -u origin main
```

---

### Шаг 4: Включи GitHub Pages

1. Открой свой репозиторий на GitHub
2. Перейди в **Settings** (вверху справа)
3. Слева найди **Pages**
4. В разделе **Source:**
   - Branch: `main`
   - Folder: `/deploy` ⚠️ **ВАЖНО!**
5. Нажми **Save**

---

### Шаг 5: Подожди 2-3 минуты

GitHub Pages соберёт сайт. Обнови страницу Settings → Pages.

Увидишь сообщение:
```
✅ Your site is live at https://ТВО_ИМЯ.github.io/mw3-gm2-strategy/
```

---

## 🎮 Готово!

Игра доступна по адресу:
```
https://ТВО_ИМЯ.github.io/mw3-gm2-strategy/
```

---

## 🔄 Как обновить игру в будущем:

```powershell
cd "C:\MW3 GM2"

# 1. Внеси изменения в .ts файлы
# 2. Скомпилируй
npm run build

# 3. Скопируй новые .js в deploy
Copy-Item *.js deploy/ -Force

# 4. Commit и push
git add .
git commit -m "Update: описание изменений"
git push
```

GitHub Pages автоматически обновит сайт через 1-2 минуты.

---

## 🌐 Альтернатива: Hostinger

Если хочешь деплоить на Hostinger:

### Через File Manager:
1. Войди в Hostinger → File Manager
2. Открой `public_html`
3. Создай папку `mw3-gm2`
4. Загрузи все файлы из `C:\MW3 GM2\deploy`

**URL:** `https://твой-домен.com/mw3-gm2/`

### Через FTP (FileZilla):
1. **Host:** `ftp.твой-домен.com`
2. **Username:** твой FTP username
3. **Password:** твой FTP password
4. **Port:** 21
5. Загрузи файлы из `C:\MW3 GM2\deploy` в `public_html/mw3-gm2/`

---

## 📊 Статистика проекта:

- **Размер деплоя:** 67 KB
- **Файлов:** 8
- **Уровней:** 8 (Easy → Insane)
- **Типов зданий:** 6
- **Способностей:** 3
- **Поддержка:** Desktop + Mobile

---

## 🆘 Troubleshooting

### GitHub Pages показывает 404:
- Проверь что выбрал `/deploy` folder (не `/root`)
- Подожди 5-10 минут
- Проверь что файлы есть в папке deploy в репозитории

### Игра не загружается:
- Открой DevTools (F12) → Console
- Проверь ошибки загрузки файлов
- Убедись что все .js файлы есть в deploy/

### Git push не работает:
- Проверь что создал репозиторий на GitHub
- Проверь правильность URL
- Возможно нужна авторизация (GitHub token)

---

## 📞 Нужна помощь?

Если что-то не работает:
1. Проверь Console в браузере (F12)
2. Проверь что все файлы загружены
3. Попробуй открыть игру локально: `npm run serve`

---

**Дата:** 30.04.2026  
**Версия:** 2.3.1  
**Статус:** 🟢 Ready to Deploy

**Удачи с деплоем! 🎮🚀**
