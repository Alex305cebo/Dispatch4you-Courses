# 🧪 Руководство по локальному тестированию

## ⚠️ Проблема: Страницы не работают локально

Когда вы открываете сайт через `file://` протокол (двойной клик на HTML файл), **Clean URLs не работают**, потому что `.htaccess` требует веб-сервер Apache.

## ✅ Решения

### Вариант 1: Быстрый тест (без сервера)
Откройте файл `test-local-navigation.html` - там все ссылки работают напрямую через `/pages/`

### Вариант 2: Запуск локального сервера (рекомендуется)

#### 🚀 Автоматический запуск
```powershell
.\start-local-server.ps1
```

Затем откройте в браузере:
- http://localhost:8000/modules
- http://localhost:8000/doc-module-1
- http://localhost:8000/simulator

#### 🔧 Ручной запуск

**С PHP:**
```bash
php -S localhost:8000
```

**С Python:**
```bash
python -m http.server 8000
```

**С Node.js (http-server):**
```bash
npx http-server -p 8000
```

### Вариант 3: VS Code Live Server

1. Установите расширение "Live Server" в VS Code
2. Правый клик на `index.html` → "Open with Live Server"
3. Сайт откроется автоматически

⚠️ **Важно:** Live Server не поддерживает `.htaccess`, но можно настроить прокси.

### Вариант 4: XAMPP (полноценный Apache)

1. Скачайте XAMPP: https://www.apachefriends.org/
2. Установите и запустите Apache
3. Скопируйте проект в `C:\xampp\htdocs\dispatch4you\`
4. Откройте: http://localhost/dispatch4you/modules

✅ **Это единственный способ, где Clean URLs работают на 100%**

## 📋 Проверка работы Clean URLs

После запуска сервера, проверьте эти ссылки:

### ✅ Должны работать:
- http://localhost:8000/modules
- http://localhost:8000/doc-module-1
- http://localhost:8000/doc-module-2
- http://localhost:8000/simulator
- http://localhost:8000/loadboard
- http://localhost:8000/testing

### ❌ НЕ работают без сервера:
- file:///C:/path/to/modules (404 ошибка)
- Двойной клик на HTML файл

## 🔗 Прямые ссылки (работают всегда)

Если сервер не запускается, используйте прямые ссылки:

```
pages/modules-index.html
pages/doc-module-1.html
pages/doc-module-2.html
pages/simulator.html
pages/loadboard.html
pages/testing.html
```

## 🐛 Решение проблем

### Проблема: "Не удалось получить доступ к файлу"
**Причина:** Открываете через `file://` протокол  
**Решение:** Запустите локальный сервер (см. выше)

### Проблема: "404 Not Found" на /modules
**Причина:** Сервер не поддерживает `.htaccess`  
**Решение:** Используйте XAMPP или прямые ссылки `/pages/modules-index.html`

### Проблема: PHP/Python не найден
**Причина:** Не установлен интерпретатор  
**Решение:** Установите PHP, Python или используйте XAMPP

## 📊 Сравнение методов

| Метод | Clean URLs | Сложность | Скорость |
|-------|-----------|-----------|----------|
| file:// | ❌ | Легко | Мгновенно |
| PHP Server | ⚠️ Частично | Легко | Быстро |
| Python Server | ❌ | Легко | Быстро |
| Live Server | ⚠️ Частично | Легко | Быстро |
| XAMPP | ✅ Полностью | Средне | Средне |
| Хостинг | ✅ Полностью | Сложно | Зависит |

## 🎯 Рекомендация

**Для разработки:** XAMPP (полная поддержка .htaccess)  
**Для быстрого теста:** `start-local-server.ps1` + прямые ссылки  
**Для продакшена:** Загрузите на хостинг с Apache

## 📞 Нужна помощь?

Если ничего не работает:
1. Откройте `test-local-navigation.html` - там все ссылки прямые
2. Или используйте полные пути: `pages/modules-index.html`
