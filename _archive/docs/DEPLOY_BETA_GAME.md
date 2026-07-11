# 🚀 Деплой BETA версии игры v2.2.0-beta.1

## ✅ Что готово к деплою

### 📦 Собранные файлы
- ✅ `adventure/dist/` - production билд игры
- ✅ `interactive-feedback.css` - система визуальной обратной связи
- ✅ `interactive-feedback.js` - JavaScript для анимаций
- ✅ Все ассеты и статические файлы

### 📝 Изменения в версии 2.2.0-beta.1
1. Система визуальной обратной связи для всех кнопок
2. Ripple эффект при клике
3. Увеличенные крестики (48×56px)
4. Вибрация на мобильных
5. Улучшенные hover эффекты

---

## 🌐 Деплой на Hostinger

### Вариант 1: Через File Manager (рекомендуется)

1. **Зайти в Hostinger Panel**
   - https://hpanel.hostinger.com
   - Выбрать сайт dispatch4you.com

2. **Открыть File Manager**
   - Перейти в папку `public_html/`

3. **Загрузить файлы игры**
   ```
   Загрузить папку: adventure/dist/ → public_html/adventure/dist/
   
   Файлы для загрузки:
   - adventure/dist/index.html
   - adventure/dist/interactive-feedback.css
   - adventure/dist/interactive-feedback.js
   - adventure/dist/_expo/ (вся папка)
   - adventure/dist/assets/ (вся папка)
   - adventure/dist/favicon.ico
   - adventure/dist/metadata.json
   - adventure/dist/us-states.json
   ```

4. **Проверить .htaccess**
   - Убедиться что редирект `/game` настроен правильно
   - Файл уже обновлён локально

5. **Очистить кэш**
   - В Hostinger Panel → Website → Clear Cache
   - Или добавить `?v=2.2.0-beta.1` к URL

---

### Вариант 2: Через FTP

1. **Подключиться к FTP**
   ```
   Host: ftp.dispatch4you.com
   Username: [ваш FTP логин]
   Password: [ваш FTP пароль]
   Port: 21
   ```

2. **Загрузить файлы**
   ```
   Локальная папка: DispatcherTraining/adventure/dist/
   Удалённая папка: /public_html/adventure/dist/
   ```

3. **Загрузить корневые файлы**
   ```
   - interactive-feedback.css → /public_html/
   - interactive-feedback.js → /public_html/
   - .htaccess → /public_html/
   ```

---

### Вариант 3: Через Git (если настроен)

```bash
# Коммит изменений
git add .
git commit -m "🚀 Deploy BETA v2.2.0-beta.1: Interactive feedback system"

# Пуш на сервер
git push origin main

# На сервере (через SSH)
cd /home/u123456789/domains/dispatch4you.com/public_html
git pull origin main
```

---

## ✅ Чеклист деплоя

### Перед деплоем
- [x] Версия обновлена в package.json (2.2.0-beta.1)
- [x] CHANGELOG.md создан
- [x] Production билд собран (`npm run build:web`)
- [x] Файлы interactive-feedback скопированы в dist/
- [x] .htaccess обновлён

### Во время деплоя
- [ ] Создать бэкап текущей версии
- [ ] Загрузить новые файлы
- [ ] Проверить права доступа (644 для файлов, 755 для папок)
- [ ] Очистить кэш сервера

### После деплоя
- [ ] Открыть https://dispatch4you.com/game
- [ ] Проверить что игра загружается
- [ ] Проверить анимации кнопок (hover + click)
- [ ] Проверить на мобильном устройстве
- [ ] Проверить крестики закрытия модальных окон
- [ ] Проверить консоль браузера на ошибки

---

## 🧪 Тестирование BETA версии

### Desktop
1. Открыть https://dispatch4you.com/game
2. Навести на кнопку "Назначить" → должна подняться
3. Нажать на кнопку → должна сжаться + волна
4. Открыть модальное окно → крестик 48×48px
5. Проверить карточки траков → hover эффект

### Mobile
1. Открыть на телефоне
2. Нажать на кнопку → вибрация
3. Крестики должны быть 56×56px
4. Все элементы легко нажимаются

---

## 🔄 Откат (если что-то пошло не так)

### Быстрый откат
1. Зайти в File Manager
2. Восстановить бэкап папки `adventure/dist/`
3. Очистить кэш

### Через FTP
1. Загрузить старую версию из бэкапа
2. Перезагрузить сайт

---

## 📊 Мониторинг после деплоя

### Проверить через 5 минут:
- [ ] Игра загружается без ошибок
- [ ] Анимации работают
- [ ] Нет ошибок в консоли

### Проверить через 1 час:
- [ ] Пользователи не жалуются
- [ ] Метрики загрузки в норме
- [ ] Нет критических багов

### Проверить через 24 часа:
- [ ] Стабильная работа
- [ ] Положительные отзывы
- [ ] Готовность к переходу из BETA в stable

---

## 🎯 Следующие шаги

После успешного тестирования BETA:
1. Собрать feedback от пользователей
2. Исправить найденные баги
3. Обновить версию до 2.2.0 (убрать -beta.1)
4. Задеплоить stable версию

---

## 📞 Контакты для поддержки

Если возникли проблемы:
- Hostinger Support: https://hpanel.hostinger.com/tickets
- Документация: https://support.hostinger.com

---

**Версия:** 2.2.0-beta.1  
**Дата:** 2026-04-18  
**Статус:** ✅ Готово к деплою
