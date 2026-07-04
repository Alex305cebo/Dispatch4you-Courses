# Noto Animated Emoji (Google) — анимированные webp

Курируемый набор анимированных эмодзи для игр/UI.

- Источник: https://fonts.google.com/noto/animated-emojis (fonts.gstatic.com/s/e/notoemoji)
- Лицензия: CC BY 4.0 — свободно, включая коммерческое использование,
  с указанием авторства: "Animated emoji by Google (Noto Animated Emoji), CC BY 4.0".
- Формат: анимированный WebP 512×512 (~200-700 КБ каждый).

ВАЖНО для canvas-игр: drawImage() рисует только ПЕРВЫЙ кадр анимированного webp.
Анимация «живая» только в <img>-элементах (HTML UI: меню, попапы, оверлеи).
Для анимации на canvas нужен покадровый декодер (ImageDecoder API).
