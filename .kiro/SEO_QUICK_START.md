# 🚀 SEO Quick Start - Первые 7 дней

## ✅ Что уже сделано

- [x] `robots.txt` создан
- [x] `sitemap.xml` создан
- [x] `.htaccess` оптимизирован для SEO
- [x] Мета-теги обновлены на главной и about.html
- [x] Структурированные данные добавлены на главную
- [x] SEO-шаблон создан для новых страниц
- [x] Руководства написаны

## 📋 План на первую неделю

### День 1: Регистрация в поисковых системах

#### Google Search Console
1. Перейти: https://search.google.com/search-console
2. Нажать "Добавить ресурс" → "Домен" или "URL-префикс"
3. Ввести: `https://dispatch4you.com`
4. Подтвердить владение (один из способов):
   - **HTML-файл:** Скачать файл, загрузить в корень сайта
   - **HTML-тег:** Добавить мета-тег в `<head>`
   - **DNS:** Добавить TXT-запись в настройках домена
5. После подтверждения: Перейти в "Файлы Sitemap"
6. Добавить: `https://dispatch4you.com/sitemap.xml`
7. Нажать "Отправить"

#### Yandex Webmaster
1. Перейти: https://webmaster.yandex.ru
2. Нажать "Добавить сайт"
3. Ввести: `https://dispatch4you.com`
4. Подтвердить владение (HTML-файл или мета-тег)
5. Перейти в "Индексирование" → "Файлы Sitemap"
6. Добавить: `https://dispatch4you.com/sitemap.xml`
7. В разделе "Региональность" выбрать: Россия

**Время:** 30-40 минут

---

### День 2: Установка аналитики

#### Google Analytics 4
1. Перейти: https://analytics.google.com
2. Создать аккаунт "Dispatch4You"
3. Создать ресурс "dispatch4you.com"
4. Получить Measurement ID (G-XXXXXXXXXX)
5. Скопировать код отслеживания
6. Добавить в `<head>` всех страниц (после мета-тегов)

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

#### Yandex Metrika
1. Перейти: https://metrika.yandex.ru
2. Создать счётчик для dispatch4you.com
3. Включить: Вебвизор, Карта кликов, Карта скроллинга
4. Скопировать код счётчика
5. Добавить в `<head>` всех страниц (после Google Analytics)

**Проверка:**
- Откройте сайт
- Проверьте Real-Time отчёты в GA4
- Проверьте "Сейчас на сайте" в Метрике

**Время:** 30-40 минут

---

### День 3: Создание OG Image

1. Откройте Figma или Canva
2. Создайте изображение 1200×630 px
3. Используйте дизайн из `.kiro/OG_IMAGE_GUIDE.md`
4. Сохраните как `og-image.png`
5. Загрузите в корень сайта
6. Проверьте что файл доступен: `https://dispatch4you.com/og-image.png`

**Быстрый способ:**
- Используйте готовый HTML-шаблон из `OG_IMAGE_GUIDE.md`
- Откройте в браузере
- Сделайте скриншот 1200×630 px

**Проверка:**
- Facebook Debugger: https://developers.facebook.com/tools/debug/
- Вставьте URL, проверьте превью

**Время:** 20-30 минут

---

### День 4: Обновление мета-тегов (приоритетные страницы)

Используйте шаблон из `.kiro/seo-template.html`

#### Страницы для обновления:
1. `pricing.html` - тарифы
2. `pages/modules-index.html` - модули
3. `pages/documentation.html` - документация
4. `career.html` - карьера

#### Что добавить в каждую:
```html
<meta name="description" content="[Уникальное описание 150-160 символов]">
<meta name="keywords" content="[Ключевые слова через запятую]">
<link rel="canonical" href="https://dispatch4you.com/[путь].html">
<meta property="og:title" content="[Заголовок для соцсетей]">
<meta property="og:description" content="[Описание для соцсетей]">
<meta property="og:image" content="https://dispatch4you.com/og-image.png">
<meta property="og:url" content="https://dispatch4you.com/[путь].html">
```

**Примеры описаний:**

**pricing.html:**
```
Гибкие тарифы обучения диспетчера: от бесплатного доступа до премиум-пакета с менторством. Скидки до 20%. Полный доступ $800, Премиум $1,500.
```

**modules-index.html:**
```
Полная программа обучения диспетчера: 15 модулей от основ до профессионала. AI-симулятор, 300+ реальных кейсов, менторская поддержка 24/7.
```

**Время:** 40-60 минут

---

### День 5: Проверка производительности

#### Google PageSpeed Insights
1. Перейти: https://pagespeed.web.dev/
2. Проверить главную: `https://dispatch4you.com/`
3. Цель: 90+ (мобильные), 95+ (десктоп)

**Если скорость низкая:**
- Оптимизируйте изображения (WebP, сжатие)
- Минифицируйте CSS/JS
- Включите кеширование (уже в .htaccess)
- Используйте lazy loading для изображений

#### GTmetrix
1. Перейти: https://gtmetrix.com/
2. Проверить сайт
3. Изучить рекомендации

#### Mobile-Friendly Test
1. Перейти: https://search.google.com/test/mobile-friendly
2. Проверить главную страницу
3. Убедиться что сайт mobile-friendly

**Время:** 30 минут

---

### День 6: Внутренняя перелинковка

Добавьте ссылки между страницами для лучшей навигации и SEO:

#### На главной (index.html):
```html
<!-- В секции "Что вы получите" -->
<a href="pages/modules-index.html">Смотреть все модули →</a>

<!-- В секции "Как это работает" -->
<a href="pages/documentation.html">Изучить документацию →</a>

<!-- В футере -->
<a href="about.html">О проекте</a>
<a href="career.html">Карьера</a>
<a href="contacts.html">Контакты</a>
```

#### На странице модулей:
```html
<a href="../index.html">← Вернуться на главную</a>
<a href="documentation.html">Документация →</a>
<a href="ai-broker-chat.html">AI Симулятор →</a>
```

**Правила:**
- 3-5 внутренних ссылок на страницу
- Используйте описательный anchor text
- Ссылки должны быть релевантны контексту

**Время:** 30-40 минут

---

### День 7: Настройка целей и проверка

#### Цели в Yandex Metrika
1. Перейти в Метрику → Настройки → Цели
2. Создать цели:

**Цель 1: Просмотр тарифов**
- Тип: URL
- Условие: содержит `/pricing.html`

**Цель 2: Просмотр модулей**
- Тип: URL
- Условие: содержит `/pages/modules-index.html`

**Цель 3: Клик на CTA**
- Тип: JavaScript-событие
- Идентификатор: `cta_click`
- Добавить код на кнопки:
```javascript
document.querySelectorAll('.btn-primary').forEach(btn => {
  btn.addEventListener('click', function() {
    ym(XXXXXXXX, 'reachGoal', 'cta_click');
  });
});
```

#### Финальная проверка
- [ ] Все счётчики работают (Real-Time)
- [ ] OG Image отображается в соцсетях
- [ ] Sitemap отправлен в Search Console и Webmaster
- [ ] Мета-теги уникальны на всех страницах
- [ ] Внутренние ссылки работают
- [ ] Сайт быстро загружается
- [ ] Мобильная версия корректна

**Время:** 40-50 минут

---

## 📊 Что отслеживать после запуска

### Первая неделя
- Индексация страниц в Search Console
- Первые посетители в аналитике
- Ошибки в Search Console (исправить)

### Первый месяц
- Позиции по ключевым запросам
- Источники трафика
- Показатель отказов (цель: < 60%)
- Время на сайте (цель: > 2 мин)

### Через 3 месяца
- Органический трафик: +50-100%
- Топ-10 по 3-5 ключевым запросам
- Конверсия в регистрацию: 3-5%

---

## 🎯 Ключевые запросы для продвижения

### Высокочастотные (ВЧ)
- курсы диспетчера
- обучение диспетчера
- диспетчер грузоперевозок

### Среднечастотные (СЧ)
- курсы диспетчера грузоперевозок США
- обучение диспетчера с нуля
- удаленная работа диспетчером
- профессия диспетчер

### Низкочастотные (НЧ)
- сколько зарабатывает диспетчер грузоперевозок
- как стать диспетчером грузоперевозок
- курсы диспетчера онлайн
- обучение диспетчера удаленно

---

## 📞 Нужна помощь?

### Документация
- `.kiro/SEO_GUIDE.md` - полное руководство
- `.kiro/SEO_CHECKLIST.md` - детальный чек-лист
- `.kiro/ANALYTICS_SETUP.md` - настройка аналитики
- `.kiro/OG_IMAGE_GUIDE.md` - создание изображений
- `.kiro/seo-template.html` - шаблон для новых страниц

### Инструменты
- Google Search Console: https://search.google.com/search-console
- Yandex Webmaster: https://webmaster.yandex.ru
- Google Analytics: https://analytics.google.com
- Yandex Metrika: https://metrika.yandex.ru
- PageSpeed Insights: https://pagespeed.web.dev/

### Проверка SEO
- Facebook Debugger: https://developers.facebook.com/tools/debug/
- Twitter Card Validator: https://cards-dev.twitter.com/validator
- LinkedIn Inspector: https://www.linkedin.com/post-inspector/

---

## ✅ Итоговый чек-лист первой недели

- [ ] День 1: Зарегистрирован в Search Console и Webmaster
- [ ] День 1: Sitemap отправлен в обе системы
- [ ] День 2: Google Analytics установлен
- [ ] День 2: Yandex Metrika установлена
- [ ] День 3: OG Image создан и загружен
- [ ] День 4: Мета-теги обновлены на 4+ страницах
- [ ] День 5: Скорость загрузки проверена
- [ ] День 6: Внутренние ссылки добавлены
- [ ] День 7: Цели настроены в Метрике
- [ ] День 7: Финальная проверка пройдена

**Поздравляем! Базовая SEO-оптимизация завершена. 🎉**

Теперь сайт готов к продвижению в поисковых системах.

---

## 🚀 Что дальше?

### Неделя 2-4: Контент
- Создать FAQ страницу
- Добавить отзывы выпускников
- Написать 2-3 статьи в блог

### Месяц 2: Продвижение
- Получить обратные ссылки (backlinks)
- Зарегистрироваться в каталогах курсов
- Создать профили в соцсетях

### Месяц 3: Оптимизация
- Анализ поведенческих факторов
- A/B тестирование заголовков
- Улучшение конверсии

**Успехов в продвижении! 💪**
