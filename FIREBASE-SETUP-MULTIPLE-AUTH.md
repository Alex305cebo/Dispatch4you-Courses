# Настройка Firebase для множественных методов авторизации

## Проблема
Firebase по умолчанию не позволяет использовать один email для разных методов авторизации (Google и Email/Password).

## Решение

### Шаг 1: Настройка Firebase Console

1. Откройте [Firebase Console](https://console.firebase.google.com/)
2. Выберите проект `dispatch4you-80e0f`
3. Перейдите в **Authentication** → **Settings** (вкладка)
4. Найдите раздел **User account linking**
5. Выберите опцию: **"Allow creation of multiple accounts with the same email address"**
   
   ИЛИ (рекомендуется):
   
   **"Prevent creation of multiple accounts with the same email address"** + включите автоматическое связывание

### Шаг 2: Добавьте домен в Authorized domains

1. В Firebase Console → **Authentication** → **Settings**
2. Прокрутите до раздела **Authorized domains**
3. Нажмите **Add domain**
4. Добавьте: `dispatch4you.com`
5. Сохраните

### Шаг 3: Проверьте методы авторизации

1. В Firebase Console → **Authentication** → **Sign-in method**
2. Убедитесь что включены:
   - ✅ Email/Password
   - ✅ Google

## Что изменено в коде

### login.html
- Добавлена проверка существующих методов авторизации через `fetchSignInMethodsForEmail`
- Добавлены понятные сообщения об ошибках
- Если email зарегистрирован через Google, показывается подсказка войти через Google
- Если email зарегистрирован через Email/Password, показывается подсказка войти через форму

### Как это работает

1. **Пользователь пытается войти через Email/Password:**
   - Если аккаунт создан через Google → показывается сообщение "Войдите через Google"
   - Если аккаунт создан через Email/Password → вход выполняется

2. **Пользователь пытается войти через Google:**
   - Если аккаунт создан через Email/Password → показывается сообщение "Войдите через форму"
   - Если аккаунт создан через Google → вход выполняется

## Рекомендация

Для лучшего UX рекомендуется:
1. Включить в Firebase Console опцию автоматического связывания аккаунтов
2. Добавить в dashboard.html страницу настроек где пользователь может связать/отвязать методы авторизации

## Текущий статус

✅ Код обновлен в login.html
⏳ Требуется настройка Firebase Console (см. Шаг 1)
⏳ Требуется добавление домена (см. Шаг 2)
