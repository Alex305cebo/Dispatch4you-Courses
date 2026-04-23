# 🔍 Шаги для отладки Google Maps

## Что нужно сделать СЕЙЧАС:

### 1. Перезагрузите страницу в браузере
Нажмите **Ctrl+Shift+R** (или Cmd+Shift+R на Mac) для полной перезагрузки с очисткой кеша

### 2. Откройте консоль браузера
Нажмите **F12** и перейдите на вкладку **Console**

### 3. Проверьте логи

Вы должны увидеть:

```
🔑 Google Maps API ключ: AIzaSyDmGk4ivDi5nxKi...
📦 process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: undefined (или ключ)
🔄 Начинаем загрузку Google Maps API...
📡 Скрипт Google Maps добавлен в DOM
✅ Google Maps API загружен успешно
⏸️ Ожидание инициализации карты: { mapLoaded: true, hasMapRef: true, hasGoogleMapRef: false }
🗺️ Инициализация Google Maps...
✅ Google Maps инициализирована успешно
📍 Обновлено X маркеров траков
🛣️ Отрисовано X маршрутов
```

### 4. Если видите ошибки

#### Ошибка: "RefererNotAllowedMapError"
**Что это значит:** Ваш домен не разрешён в Google Cloud Console

**Решение:**
1. Откройте https://console.cloud.google.com/
2. Перейдите в **APIs & Services** → **Credentials**
3. Найдите ваш API ключ
4. В разделе **Application restrictions** выберите **HTTP referrers**
5. Добавьте:
   - `localhost:8081/*`
   - `localhost:19006/*`
   - `127.0.0.1:8081/*`
   - `dispatch4you.com/*`
   - `www.dispatch4you.com/*`
6. Нажмите **Save**
7. Подождите 5 минут и перезагрузите страницу

#### Ошибка: "ApiNotActivatedMapError"
**Что это значит:** Maps JavaScript API не включен

**Решение:**
1. Откройте https://console.cloud.google.com/
2. Перейдите в **APIs & Services** → **Library**
3. Найдите "Maps JavaScript API"
4. Нажмите **Enable**
5. Подождите 1-2 минуты и перезагрузите страницу

#### Ошибка: "InvalidKeyMapError"
**Что это значит:** API ключ неверный

**Решение:**
1. Проверьте API ключ в Google Cloud Console
2. Убедитесь что ключ активен
3. Скопируйте ключ заново
4. Обновите файл `GoogleMapView.tsx` (строка 10)

#### Ошибка: Карта не появляется, но ошибок нет
**Возможные причины:**
1. Контейнер карты имеет нулевую высоту
2. React Native Web не рендерит div правильно
3. CSS конфликт

**Решение:**
Проверьте в консоли:
```javascript
document.querySelector('#map') // или найдите div карты
// Проверьте его размеры
```

### 5. Тест API ключа отдельно

Откройте в новой вкладке:
```
http://localhost:8081/test-google-maps.html
```

Эта страница тестирует только Google Maps API без React/Expo.

**Если тест работает, но игра нет** - проблема в React Native Web или компоненте.

**Если тест не работает** - проблема с API ключом или Google Cloud настройками.

## Что я изменил:

1. ✅ Добавил API ключ напрямую в код (временно)
2. ✅ Добавил подробное логирование на каждом этапе
3. ✅ Добавил обработку ошибок в инициализации
4. ✅ Добавил проверку состояния перед инициализацией

## Следующие шаги:

1. Перезагрузите страницу (Ctrl+Shift+R)
2. Откройте консоль (F12)
3. Скопируйте ВСЕ сообщения из консоли
4. Отправьте мне скриншот или текст

## Полезные команды в консоли:

```javascript
// Проверить загружен ли Google Maps
console.log('Google Maps:', window.google?.maps ? 'Загружен' : 'Не загружен');

// Проверить API ключ
console.log('API Key:', 'AIzaSyDmGk4ivDi5nxKiLNok4WfZdlZa886EmI');

// Проверить контейнер карты
const mapDiv = document.querySelector('[style*="width: 100%"][style*="height: 100%"]');
console.log('Map container:', mapDiv, 'Size:', mapDiv?.offsetWidth, 'x', mapDiv?.offsetHeight);
```

## Если ничего не помогает:

Попробуйте открыть игру в режиме инкогнито (Ctrl+Shift+N) - это исключит проблемы с кешем и расширениями браузера.
