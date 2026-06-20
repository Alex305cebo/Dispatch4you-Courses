# Office 4 Dispatch — Mobile App (WebView Wrapper)

Нативная обёртка для dispatch4you.com/game/ для публикации в Google Play и App Store.

## Как это работает

Приложение открывает сайт `https://dispatch4you.com/game/` внутри WebView.
Весь код игры остаётся на сервере — приложение просто показывает его в полноэкранном режиме.

## Быстрый старт

```bash
cd webview-app
npm install
npx expo start
```

## Сборка для Google Play

```bash
# 1. Установить EAS CLI (один раз)
npm install -g eas-cli

# 2. Залогиниться в Expo
eas login

# 3. Собрать APK для тестирования
eas build --platform android --profile preview

# 4. Собрать AAB для Google Play
eas build --platform android --profile production
```

## Сборка для App Store

```bash
eas build --platform ios --profile production
eas submit --platform ios
```

## Откат

Если что-то пошло не так — просто удалите папку `webview-app`.
Основной проект не затронут.

## Резервная ветка

```bash
git checkout backup-before-webview-wrapper
```
