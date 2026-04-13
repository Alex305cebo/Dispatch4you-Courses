# SEO Чек-лист для Dispatch4You

## ✅ Базовая настройка (выполнено)

- [x] robots.txt создан и настроен
- [x] sitemap.xml создан
- [x] .htaccess оптимизирован для SEO
- [x] SEO-шаблон для новых страниц создан
- [x] Руководство по SEO написано

## 📋 Что нужно сделать дальше

### 1. Регистрация в поисковых системах

#### Google Search Console
1. Перейти на https://search.google.com/search-console
2. Добавить сайт dispatch4you.com
3. Подтвердить владение (через HTML-файл или DNS)
4. Отправить sitemap.xml: `https://dispatch4you.com/sitemap.xml`
5. Проверить индексацию страниц

#### Yandex Webmaster
1. Перейти на https://webmaster.yandex.ru
2. Добавить сайт dispatch4you.com
3. Подтвердить владение
4. Отправить sitemap.xml
5. Настроить регион: Россия

#### Bing Webmaster Tools
1. Перейти на https://www.bing.com/webmasters
2. Добавить сайт
3. Отправить sitemap.xml

### 2. Аналитика

#### Google Analytics 4
```html
<!-- Добавить в <head> всех страниц -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

#### Yandex Metrika
```html
<!-- Добавить в <head> всех страниц -->
<script type="text/javascript">
   (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
   m[i].l=1*new Date();
   for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
   k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
   (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

   ym(XXXXXXXX, "init", {
        clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true,
        webvisor:true
   });
</script>
```

### 3. Создание og-image.png

Создайте изображение 1200×630px для соцсетей:
- Логотип Dispatch4You
- Текст: "Курсы Диспетчера Грузоперевозок США"
- Подзаголовок: "Обучение с нуля • Заработок от $3,000/мес"
- Фон в стиле сайта (темный с градиентами)

Сохраните как `/og-image.png`

### 4. Обновление мета-тегов на всех страницах

Используйте шаблон из `.kiro/seo-template.html` для:

#### Приоритет 1 (высокий трафик)
- [ ] index.html - главная
- [ ] pages/modules-index.html - модули
- [ ] pricing.html - тарифы
- [ ] pages/documentation.html - документация

#### Приоритет 2 (средний трафик)
- [ ] about.html - о проекте
- [ ] career.html - карьера
- [ ] pages/ai-broker-chat.html - AI симулятор
- [ ] pages/Trainer-Quiz.html - тренажёр

#### Приоритет 3 (низкий трафик)
- [ ] contacts.html - контакты
- [ ] pages/analytics.html - аналитика
- [ ] pages/docs.html - документы
- [ ] pages/users-stats.html - статистика

### 5. Структурированные данные

Добавьте на главную страницу (index.html):

```html
<!-- Организация -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Dispatch4You",
  "description": "Курсы диспетчера грузоперевозок США",
  "url": "https://dispatch4you.com",
  "logo": "https://dispatch4you.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "email": "info@dispatch4you.com"
  }
}
</script>

<!-- Курс -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "Курс Диспетчера Грузоперевозок США",
  "description": "Полный курс обучения диспетчера с нуля до профессионала",
  "provider": {
    "@type": "Organization",
    "name": "Dispatch4You"
  },
  "offers": {
    "@type": "Offer",
    "price": "800",
    "priceCurrency": "USD"
  }
}
</script>
```

### 6. Оптимизация изображений

- [ ] Конвертировать все PNG/JPG в WebP
- [ ] Добавить alt-теги ко всем изображениям
- [ ] Добавить `loading="lazy"` к изображениям ниже fold
- [ ] Сжать изображения (до 200KB каждое)

Пример:
```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.png" alt="Описание изображения" loading="lazy">
</picture>
```

### 7. Внутренняя перелинковка

Добавьте ссылки между страницами:

**Главная (index.html):**
- → Модули курса
- → Тарифы
- → О проекте
- → AI Симулятор

**Модули (modules-index.html):**
- → Документация
- → Тренажёр
- → AI Симулятор
- → Главная

**Каждая страница:**
- → Главная (в навигации)
- → Контакты (в футере)
- → Тарифы (CTA кнопка)

### 8. Производительность

Проверьте скорость загрузки:
- [ ] Google PageSpeed Insights: https://pagespeed.web.dev/
- [ ] GTmetrix: https://gtmetrix.com/
- [ ] WebPageTest: https://www.webpagetest.org/

Цели:
- PageSpeed Score: 90+ (мобильные), 95+ (десктоп)
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s

### 9. Мобильная оптимизация

- [ ] Проверить все страницы на мобильных (375px, 768px)
- [ ] Убедиться что кнопки кликабельны (минимум 44×44px)
- [ ] Проверить читаемость текста (минимум 16px)
- [ ] Тест в Google Mobile-Friendly Test

### 10. SSL и безопасность

- [ ] Убедиться что SSL сертификат установлен
- [ ] Все ссылки используют HTTPS
- [ ] Проверить в SSL Labs: https://www.ssllabs.com/ssltest/

### 11. Контент-маркетинг

#### Блог (опционально)
Создайте раздел `/blog/` с статьями:
- "Как стать диспетчером грузоперевозок с нуля"
- "Сколько зарабатывает диспетчер в США"
- "Топ-10 ошибок начинающих диспетчеров"
- "Документы грузоперевозок: полный гид"
- "Как найти работу диспетчером удалённо"

#### FAQ страница
Создайте `/faq.html` с часто задаваемыми вопросами:
- Нужно ли знание английского?
- Сколько времени занимает обучение?
- Какой доход у диспетчера?
- Можно ли работать из России/Украины/Казахстана?

### 12. Социальные сети

Создайте профили:
- [ ] Facebook: facebook.com/dispatch4you
- [ ] Instagram: instagram.com/dispatch4you
- [ ] YouTube: канал с видео-уроками
- [ ] Telegram: канал с новостями и кейсами
- [ ] VK: группа для русскоязычной аудитории

Добавьте ссылки в футер сайта.

### 13. Локальное SEO (если актуально)

Если есть офис:
- [ ] Создать профиль в Google My Business
- [ ] Добавить адрес на сайт
- [ ] Добавить LocalBusiness schema

### 14. Мониторинг позиций

Отслеживайте позиции по ключевым запросам:
- курсы диспетчера
- обучение диспетчера грузоперевозок
- диспетчер США
- удаленная работа диспетчером
- профессия диспетчер
- заработок диспетчера

Инструменты:
- Ahrefs
- Semrush
- SE Ranking
- Serpstat

### 15. Обратные ссылки (Backlinks)

Получите ссылки с:
- [ ] Профильные форумы о грузоперевозках
- [ ] Образовательные платформы
- [ ] Каталоги курсов
- [ ] Отзовики (Otzovik, IRecommend)
- [ ] Гостевые посты на смежных блогах

## 📊 KPI для отслеживания

### Трафик
- Органический трафик: +20% месяц к месяцу
- Прямой трафик: +10% месяц к месяцу
- Реферальный трафик: +15% месяц к месяцу

### Конверсии
- Регистрации: 3-5% от посетителей
- Покупки курса: 1-2% от посетителей
- Время на сайте: 3+ минуты
- Показатель отказов: < 60%

### Позиции
- Топ-10 по 5+ ключевым запросам (3 месяца)
- Топ-3 по 2+ ключевым запросам (6 месяцев)

### Индексация
- 100% страниц в индексе Google
- 100% страниц в индексе Yandex
- 0 ошибок в Search Console

## 🚀 Быстрый старт (первая неделя)

1. **День 1:** Зарегистрироваться в Google Search Console и Yandex Webmaster
2. **День 2:** Отправить sitemap.xml в обе системы
3. **День 3:** Установить Google Analytics и Yandex Metrika
4. **День 4:** Создать og-image.png и обновить мета-теги на главной
5. **День 5:** Обновить мета-теги на 5 основных страницах
6. **День 6:** Проверить скорость загрузки и мобильную версию
7. **День 7:** Создать профили в соцсетях и добавить ссылки на сайт

## 📞 Нужна помощь?

Если возникли вопросы по SEO:
1. Проверьте `.kiro/SEO_GUIDE.md` - полное руководство
2. Используйте `.kiro/seo-template.html` для новых страниц
3. Обновляйте `sitemap.xml` при добавлении страниц
4. Мониторьте Search Console еженедельно
