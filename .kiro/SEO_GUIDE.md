# SEO Руководство для Dispatch4You

## 📋 Чек-лист SEO для каждой страницы

### Обязательные мета-теги

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Title: 50-60 символов -->
  <title>Заголовок страницы | Курсы Диспетчера</title>
  
  <!-- Description: 150-160 символов -->
  <meta name="description" content="Краткое описание страницы с ключевыми словами">
  
  <!-- Keywords (опционально, но полезно) -->
  <meta name="keywords" content="диспетчер, грузоперевозки, курсы, обучение, США">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="https://dispatch4you.com/page.html">
  
  <!-- Open Graph для соцсетей -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://dispatch4you.com/page.html">
  <meta property="og:title" content="Заголовок для соцсетей">
  <meta property="og:description" content="Описание для соцсетей">
  <meta property="og:image" content="https://dispatch4you.com/og-image.png">
  <meta property="og:locale" content="ru_RU">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Заголовок для Twitter">
  <meta name="twitter:description" content="Описание для Twitter">
  <meta name="twitter:image" content="https://dispatch4you.com/og-image.png">
  
  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
</head>
```

## 🎯 Ключевые слова по страницам

### Главная (index.html)
- **Основные:** курсы диспетчера, обучение диспетчера грузоперевозок, диспетчер США
- **Дополнительные:** удаленная работа диспетчером, профессия диспетчер, заработок диспетчера
- **Title:** Курсы Диспетчера Грузоперевозок США | Обучение с нуля
- **Description:** Станьте диспетчером грузоперевозок США. Обучение с нуля, практика на реальных кейсах, поддержка до первой работы. Заработок от $3,000/мес.

### О проекте (about.html)
- **Основные:** о курсах диспетчера, команда проекта, миссия
- **Title:** О проекте | Курсы Диспетчера Грузоперевозок
- **Description:** Dispatch4You — образовательная платформа для обучения диспетчеров грузоперевозок США. 48+ выпускников, средний доход $3,000+/мес.

### Модули (modules-index.html)
- **Основные:** программа обучения, модули курса, учебный план
- **Title:** Программа обучения | 15 модулей курса диспетчера
- **Description:** Полная программа обучения диспетчера: 15 модулей от основ до профессионала. AI-симулятор, реальные кейсы, практика.

### Документация (documentation.html)
- **Основные:** документы грузоперевозок, Rate Con, BOL, POD
- **Title:** Документация диспетчера | Все документы грузоперевозок
- **Description:** Полная база документов грузоперевозок США: Rate Con, BOL, POD, Invoice. Интерактивные примеры с пояснениями.

### AI Симулятор (ai-broker-chat.html)
- **Основные:** симулятор диспетчера, практика переговоров, AI брокер
- **Title:** AI Симулятор Диспетчера | Практика переговоров с брокерами
- **Description:** Тренируйте навыки переговоров с AI-брокером. Реалистичные сценарии, обратная связь, улучшение коммуникации.

### Тренажёр (Trainer-Quiz.html)
- **Основные:** тесты для диспетчера, квизы, флеш-карточки
- **Title:** Тренажёр Диспетчера | Тесты и квизы
- **Description:** Проверьте знания: флеш-карточки, квизы, тесты по всем темам. Игровой формат обучения.

### Карьера (career.html)
- **Основные:** работа диспетчером, вакансии, карьера в США
- **Title:** Карьера диспетчера | Как найти работу в США
- **Description:** Как стать диспетчером грузоперевозок: резюме, собеседования, поиск работы. Средний доход $3,000-8,000/мес.

### Тарифы (pricing.html)
- **Основные:** стоимость курса, тарифы, цены на обучение
- **Title:** Тарифы | Стоимость курса диспетчера
- **Description:** Гибкие тарифы обучения: от бесплатного доступа до премиум-пакета с менторством. Скидки до 20%.

## 🔧 Технические настройки

### 1. Структурированные данные (Schema.org)

Добавьте на главную страницу:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Dispatch4You",
  "description": "Курсы диспетчера грузоперевозок США",
  "url": "https://dispatch4you.com",
  "logo": "https://dispatch4you.com/logo.png",
  "sameAs": [
    "https://facebook.com/dispatch4you",
    "https://instagram.com/dispatch4you"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "email": "info@dispatch4you.com"
  }
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "Курс Диспетчера Грузоперевозок США",
  "description": "Полный курс обучения диспетчера с нуля до профессионала",
  "provider": {
    "@type": "Organization",
    "name": "Dispatch4You",
    "url": "https://dispatch4you.com"
  },
  "offers": {
    "@type": "Offer",
    "price": "800",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "courseMode": "online",
    "courseWorkload": "PT40H"
  }
}
</script>
```

### 2. Хлебные крошки (Breadcrumbs)

Для внутренних страниц:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Главная",
      "item": "https://dispatch4you.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Модули",
      "item": "https://dispatch4you.com/pages/modules-index.html"
    }
  ]
}
</script>
```

### 3. Оптимизация изображений

- Используйте WebP формат с fallback на PNG/JPG
- Добавляйте alt-теги ко всем изображениям
- Используйте lazy loading: `<img loading="lazy" ...>`
- Оптимальный размер: до 200KB на изображение

```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <img src="image.png" alt="Описание изображения" loading="lazy">
</picture>
```

### 4. Производительность

```html
<!-- Preconnect к внешним ресурсам -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Preload критичных ресурсов -->
<link rel="preload" href="css/main.css" as="style">
<link rel="preload" href="js/main.js" as="script">

<!-- Defer для некритичных скриптов -->
<script src="analytics.js" defer></script>
```

## 📊 Мониторинг и аналитика

### Google Analytics 4

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Yandex Metrika

```html
<!-- Yandex.Metrika counter -->
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

## 🎯 Контент-стратегия

### Внутренняя перелинковка

- Главная → Модули, Тарифы, О проекте
- Модули → Документация, AI Симулятор, Тренажёр
- Каждая страница → Главная, Контакты

### H1-H6 структура

```
H1 - Один на страницу (основной заголовок)
H2 - Разделы страницы
H3 - Подразделы
H4-H6 - Детализация
```

### Оптимизация текста

- Плотность ключевых слов: 2-3%
- Длина текста: минимум 300 слов на страницу
- Используйте синонимы и LSI-ключевые слова
- Добавляйте внутренние ссылки (3-5 на страницу)

## 🚀 Чек-лист запуска

- [ ] robots.txt создан и настроен
- [ ] sitemap.xml создан и отправлен в Google Search Console
- [ ] Все страницы имеют уникальные title и description
- [ ] Open Graph теги настроены
- [ ] Favicon добавлен
- [ ] Структурированные данные добавлены
- [ ] Google Analytics подключен
- [ ] Yandex Metrika подключен
- [ ] Изображения оптимизированы
- [ ] Мобильная версия протестирована
- [ ] Скорость загрузки проверена (PageSpeed Insights)
- [ ] SSL сертификат установлен (HTTPS)

## 📈 Регулярное обновление

### Еженедельно
- Проверка позиций в поиске
- Анализ трафика в GA4
- Обновление sitemap.xml при добавлении страниц

### Ежемесячно
- Анализ поведенческих факторов
- Обновление контента на главных страницах
- Проверка битых ссылок
- Анализ конкурентов

### Ежеквартально
- Аудит всего сайта
- Обновление ключевых слов
- Оптимизация медленных страниц
- Обновление структурированных данных

## 🔗 Полезные инструменты

- **Google Search Console** - мониторинг индексации
- **Google PageSpeed Insights** - скорость загрузки
- **Yandex Webmaster** - индексация в Яндексе
- **Screaming Frog** - технический аудит
- **Ahrefs / Semrush** - анализ конкурентов
- **GTmetrix** - производительность сайта
