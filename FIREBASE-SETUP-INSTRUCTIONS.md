# 🔥 Инструкция по настройке Firebase для Email/Password логина

## ❌ Текущая проблема

Ошибка 400 при попытке входа через email/password - это значит что Email/Password провайдер не включен в Firebase Console.

---

## ✅ Решение (5 минут)

### Шаг 1: Открой Firebase Console

Перейди на: https://console.firebase.google.com

### Шаг 2: Выбери проект

Выбери проект: **dispatch4you-80e0f**

### Шаг 3: Включи Email/Password провайдер

1. В левом меню выбери **Authentication** (🔐)
2. Перейди на вкладку **Sign-in method**
3. Найди **Email/Password** в списке провайдеров
4. Нажми на него
5. Включи переключатель **Enable**
6. Нажми **Save**

### Шаг 4: Проверь Authorized domains

1. В той же секции Authentication
2. Перейди на вкладку **Settings**
3. Найди секцию **Authorized domains**
4. Убедись что добавлены:
   - `localhost` (для локальной разработки)
   - `dispatch4you.com` (для продакшена)
5. Если нет - добавь их

---

## 🔍 Проверка

После включения Email/Password провайдера:

1. Обнови страницу login.html
2. Попробуй войти снова
3. Ошибка 400 должна исчезнуть

---

## 📝 Дополнительно: Создание тестового пользователя

Если хочешь создать тестового пользователя вручную:

1. Firebase Console → Authentication → Users
2. Нажми **Add user**
3. Введи:
   - Email: test@dispatch4you.com
   - Password: Test123456
4. Нажми **Add user**

Теперь можешь войти с этими данными!

---

## 🐛 Если проблема осталась

Проверь консоль браузера (F12) на наличие других ошибок:
- Ошибки CORS
- Ошибки Firebase SDK
- Ошибки сети

---

## 📞 Текущая конфигурация Firebase

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC505dhT1WjUPhXbinqLvEOTlEXWxYy8GI",
  authDomain: "dispatch4you-80e0f.firebaseapp.com",
  projectId: "dispatch4you-80e0f",
  storageBucket: "dispatch4you-80e0f.firebasestorage.app",
  messagingSenderId: "349235354473",
  appId: "1:349235354473:web:488aeb29211b02bb153bf8"
};
```

Эта конфигурация правильная ✅

---

**После включения Email/Password провайдера всё заработает!** 🎉
