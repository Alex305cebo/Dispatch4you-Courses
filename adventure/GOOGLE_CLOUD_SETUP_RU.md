# 🔧 Настройка Google Cloud Console для Google Maps

## Шаг 1: Откройте Credentials (Учётные данные)

1. Перейдите по ссылке: https://console.cloud.google.com/apis/credentials
2. Или в левом меню Google Cloud Console выберите:
   - **APIs & Services** → **Credentials**

## Шаг 2: Найдите ваш API ключ

Вы должны увидеть список API ключей. Найдите ключ который начинается с:
```
AIzaSyDmGk4ivDi5nxKiLNok4WfZdlZa886EmI
```

## Шаг 3: Откройте настройки ключа

1. Нажмите на **название ключа** или **иконку карандаша** (Edit) справа от ключа
2. Откроется страница "Edit API key"

## Шаг 4: Настройте Application restrictions

На странице редактирования ключа найдите раздел **"Application restrictions"**:

### Вариант A: Для разработки (рекомендуется для тестирования)

1. Выберите **"None"** (Без ограничений)
2. Нажмите **"Save"** внизу страницы
3. Подождите 1-2 минуты
4. Перезагрузите игру (Ctrl+Shift+R)

**⚠️ Внимание:** Это небезопасно для production! После тестирования переключитесь на Вариант B.

### Вариант B: Для production (безопасно)

1. Выберите **"HTTP referrers (web sites)"**
2. В поле **"Website restrictions"** нажмите **"Add an item"**
3. Добавьте следующие домены (каждый на новой строке):

```
localhost:8081/*
127.0.0.1:8081/*
localhost:19006/*
localhost/*
dispatch4you.com/*
www.dispatch4you.com/*
*.dispatch4you.com/*
```

4. Нажмите **"Save"** внизу страницы
5. Подождите 2-5 минут (Google нужно время чтобы применить изменения)
6. Перезагрузите игру (Ctrl+Shift+R)

## Шаг 5: Проверьте API restrictions

На той же странице найдите раздел **"API restrictions"**:

1. Выберите **"Restrict key"**
2. В списке API выберите:
   - ✅ **Maps JavaScript API**
   - ✅ **Directions API** (если планируете использовать маршруты)
   - ✅ **Geocoding API** (опционально)
3. Нажмите **"Save"**

## Шаг 6: Проверьте что APIs включены

Вернитесь в главное меню и перейдите в **"Library"**:
https://console.cloud.google.com/apis/library

Найдите и убедитесь что включены:
- ✅ **Maps JavaScript API** - должно быть "API enabled"
- ✅ **Directions API** - должно быть "API enabled" (опционально)

Если не включены - нажмите на API и нажмите кнопку **"Enable"**.

## Шаг 7: Проверьте квоты и биллинг

1. Перейдите в **"Quotas"**: https://console.cloud.google.com/apis/api/maps-backend.googleapis.com/quotas
2. Убедитесь что у вас есть активные кредиты ($300)
3. Проверьте что биллинг аккаунт привязан к проекту

## Шаг 8: Тестирование

После настройки:

1. Подождите **2-5 минут** (важно!)
2. Откройте игру: http://localhost:8081
3. Нажмите **Ctrl+Shift+R** для полной перезагрузки
4. Откройте консоль (F12) и проверьте логи

### Успешная загрузка:
```
🔑 Google Maps API ключ: AIzaSyDmGk4ivDi5nxKi...
🔄 Начинаем загрузку Google Maps API...
📡 Скрипт Google Maps добавлен в DOM
✅ Google Maps API загружен успешно
✅ Google Maps инициализирована успешно
📍 Обновлено 3 маркеров траков
```

### Если всё ещё ошибка:

1. Проверьте что прошло 5 минут после сохранения
2. Очистите кеш браузера (Ctrl+Shift+Delete)
3. Попробуйте в режиме инкогнито (Ctrl+Shift+N)
4. Проверьте консоль на точную ошибку

## Частые ошибки:

### RefererNotAllowedMapError
**Причина:** Домен не разрешён в HTTP referrers

**Решение:** Добавьте `localhost:8081/*` в Website restrictions (Шаг 4, Вариант B)

### ApiNotActivatedMapError
**Причина:** Maps JavaScript API не включен

**Решение:** Перейдите в Library и включите Maps JavaScript API (Шаг 6)

### InvalidKeyMapError
**Причина:** API ключ неверный или удалён

**Решение:** Создайте новый API ключ в Credentials

### RequestDeniedMapError
**Причина:** Биллинг не настроен или кредиты закончились

**Решение:** Проверьте биллинг аккаунт и кредиты (Шаг 7)

## Быстрый тест без игры:

Откройте в браузере:
```
http://localhost:8081/public/test-google-maps.html
```

Эта страница тестирует только Google Maps API без React/Expo.

---

**После настройки обязательно подождите 2-5 минут перед тестированием!**
