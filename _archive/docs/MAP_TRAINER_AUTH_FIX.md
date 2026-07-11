# 🔧 Исправление авторизации в Map Trainer

## Проблема
После логина на главном сайте (`dispatch4you.com/login.html`), при переходе на `dispatch4you.com/map-trainer/` пользователя снова просят войти.

## Причина
Firebase Auth работает асинхронно и может не успеть синхронизировать сессию между разными путями сайта. Хук `useAuth` проверял только Firebase Auth состояние, игнорируя данные в `localStorage`.

## Что исправлено

### 1. `map-trainer/src/hooks/useAuth.js`
- ✅ Добавлена проверка `localStorage` при инициализации
- ✅ Добавлена проверка `authToken` как дополнительный индикатор авторизации
- ✅ Добавлена задержка 300мс для завершения процесса Firebase Auth
- ✅ Fallback на `localStorage` если Firebase вернул `null`
- ✅ Подробное логирование всех этапов проверки
- ✅ Сохранение токена при входе через Google

### 2. Логика работы
**До:**
```javascript
onAuthStateChanged(auth, (fbUser) => {
  if (fbUser) {
    // Сохраняем пользователя
  } else {
    // Удаляем всё из localStorage
    setUser(null);
  }
});
```

**После:**
```javascript
onAuthStateChanged(auth, (fbUser) => {
  setTimeout(() => {
    if (fbUser) {
      // Сохраняем пользователя + токен
    } else {
      // Проверяем localStorage как fallback
      const cachedUser = getUserFromCache();
      const hasToken = hasAuthToken();
      
      if (cachedUser && hasToken) {
        // Доверяем localStorage
        setUser(cachedUser);
      } else {
        // Только тогда выходим
        setUser(null);
      }
    }
  }, 300);
});
```

## Как это работает

1. **Пользователь логинится на главном сайте** (`login.html`)
   - Данные сохраняются в `localStorage.user`
   - Токен сохраняется в `localStorage.authToken`

2. **Пользователь переходит на map-trainer**
   - `useAuth` сразу читает `localStorage` и показывает пользователя
   - Параллельно Firebase проверяет сессию
   - Если Firebase подтверждает — всё ОК
   - Если Firebase вернул `null` — проверяем `localStorage`
   - Если есть данные в `localStorage` + токен — доверяем им

3. **Результат**
   - Нет мигания экрана логина
   - Пользователь сразу попадает в игру
   - Работает на мобильных устройствах

## Сборка проекта

```bash
cd map-trainer
npm run build
```

Файлы будут в `map-trainer/dist/`:
- `index.html`
- `assets/index-DNzdbdhN.js` (новый хеш)
- `assets/index-DdPfSiZb.css`

## Деплой

Скопируйте содержимое `map-trainer/dist/` на сервер в папку `/map-trainer/`:

```bash
# Локально
cd map-trainer/dist
# Загрузите все файлы на сервер
```

Или через FTP/SFTP:
- Загрузите `dist/index.html` → `/map-trainer/index.html`
- Загрузите `dist/assets/*` → `/map-trainer/assets/`
- Загрузите `dist/favicon.svg` → `/map-trainer/favicon.svg`
- Загрузите `dist/icons.svg` → `/map-trainer/icons.svg`

## Проверка

1. Откройте консоль браузера (F12)
2. Перейдите на `https://dispatch4you.com/map-trainer/`
3. В консоли увидите логи:
   ```
   🔵 [useAuth] Инициализация...
   🔵 [useAuth] Кеш: { hasCachedUser: true, hasToken: true, email: "user@example.com" }
   ✅ [useAuth] Найдены данные в localStorage, используем их
   🔵 [useAuth] Firebase Auth состояние: { isAuthenticated: true, email: "user@example.com" }
   ✅ [useAuth] Пользователь авторизован через Firebase
   ```

4. Если всё работает — вы сразу попадёте в игру без экрана логина

## Тестирование на мобильном

1. Откройте `https://dispatch4you.com/login.html` на телефоне
2. Войдите через Google
3. Перейдите на `https://dispatch4you.com/map-trainer/`
4. Должны сразу попасть в игру

## Если проблема осталась

1. Откройте консоль браузера
2. Проверьте логи `[useAuth]`
3. Проверьте что в `localStorage` есть:
   - `user` — объект с данными пользователя
   - `authToken` — строка с токеном
4. Очистите кеш браузера и попробуйте снова
5. Проверьте что Firebase Console настроен правильно (Authorized domains)

## Дополнительно

Теперь авторизация работает единообразно на всём сайте:
- ✅ `login.html` — вход через Google
- ✅ `dashboard.html` — личный кабинет
- ✅ `map-trainer/` — тренажёр географии
- ✅ Все используют один `localStorage.user` и `localStorage.authToken`
