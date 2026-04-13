# Настройка аналитики для Dispatch4You

## 🎯 Цель
Отслеживать поведение пользователей, конверсии и эффективность маркетинга.

## 📊 Google Analytics 4

### Шаг 1: Создание аккаунта
1. Перейти на https://analytics.google.com/
2. Нажать "Начать измерения"
3. Создать аккаунт: "Dispatch4You"
4. Создать ресурс: "dispatch4you.com"
5. Выбрать категорию: "Образование"
6. Получить Measurement ID (формат: G-XXXXXXXXXX)

### Шаг 2: Установка кода

Добавьте этот код в `<head>` ВСЕХ страниц (после мета-тегов, до CSS):

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', {
    'send_page_view': true,
    'anonymize_ip': true
  });
</script>
```

### Шаг 3: Настройка событий

Добавьте отслеживание ключевых действий:

```javascript
// Клик по кнопке "Начать обучение"
document.querySelector('.btn-primary').addEventListener('click', function() {
  gtag('event', 'click_start_learning', {
    'event_category': 'engagement',
    'event_label': 'Hero CTA'
  });
});

// Клик по карточке модуля
document.querySelectorAll('.feature-card').forEach(card => {
  card.addEventListener('click', function() {
    gtag('event', 'click_module', {
      'event_category': 'engagement',
      'event_label': this.querySelector('h3').textContent
    });
  });
});

// Открытие модального окна
function openBenefitModal(type) {
  gtag('event', 'open_modal', {
    'event_category': 'engagement',
    'event_label': type
  });
  // ... остальной код модалки
}

// Переход на страницу тарифов
document.querySelector('a[href*="pricing"]').addEventListener('click', function() {
  gtag('event', 'view_pricing', {
    'event_category': 'conversion',
    'event_label': 'Pricing Page'
  });
});

// Скролл до секции
function trackSectionView(sectionName) {
  gtag('event', 'scroll_to_section', {
    'event_category': 'engagement',
    'event_label': sectionName
  });
}

// Время на странице (каждые 30 секунд)
let timeOnPage = 0;
setInterval(() => {
  timeOnPage += 30;
  gtag('event', 'time_on_page', {
    'event_category': 'engagement',
    'value': timeOnPage
  });
}, 30000);
```

### Шаг 4: Настройка конверсий

В интерфейсе GA4:
1. Перейти в "Настройка" → "События"
2. Создать события-конверсии:
   - `purchase` - покупка курса
   - `sign_up` - регистрация
   - `view_pricing` - просмотр тарифов
   - `click_start_learning` - клик на CTA

## 📈 Yandex Metrika

### Шаг 1: Создание счётчика
1. Перейти на https://metrika.yandex.ru/
2. Нажать "Добавить счётчик"
3. Указать URL: dispatch4you.com
4. Включить опции:
   - ✅ Вебвизор
   - ✅ Карта кликов
   - ✅ Карта скроллинга
   - ✅ Аналитика форм
5. Получить номер счётчика (8-значный)

### Шаг 2: Установка кода

Добавьте этот код в `<head>` ВСЕХ страниц (после Google Analytics):

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
        webvisor:true,
        trackHash:true
   });
</script>
<noscript><div><img src="https://mc.yandex.ru/watch/XXXXXXXX" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
<!-- /Yandex.Metrika counter -->
```

### Шаг 3: Настройка целей

В интерфейсе Метрики:
1. Перейти в "Настройки" → "Цели"
2. Создать цели:

**Цель 1: Регистрация**
- Тип: JavaScript-событие
- Идентификатор: `registration`
- Код для отправки: `ym(XXXXXXXX, 'reachGoal', 'registration')`

**Цель 2: Покупка курса**
- Тип: JavaScript-событие
- Идентификатор: `purchase`
- Код: `ym(XXXXXXXX, 'reachGoal', 'purchase', {order_price: 800, currency: 'USD'})`

**Цель 3: Просмотр тарифов**
- Тип: URL
- Условие: содержит `/pricing.html`

**Цель 4: Клик на CTA**
- Тип: JavaScript-событие
- Идентификатор: `cta_click`

**Цель 5: Просмотр модулей**
- Тип: URL
- Условие: содержит `/pages/modules-index.html`

### Шаг 4: Отслеживание событий

```javascript
// Регистрация
function onRegistrationSuccess() {
  ym(XXXXXXXX, 'reachGoal', 'registration');
  gtag('event', 'sign_up', {
    'method': 'Email'
  });
}

// Покупка
function onPurchaseSuccess(price, plan) {
  ym(XXXXXXXX, 'reachGoal', 'purchase', {
    order_price: price,
    currency: 'USD'
  });
  gtag('event', 'purchase', {
    'transaction_id': 'T_' + Date.now(),
    'value': price,
    'currency': 'USD',
    'items': [{
      'item_name': plan,
      'price': price
    }]
  });
}

// Клик на CTA
document.querySelectorAll('.btn-primary, .pricing-btn-primary').forEach(btn => {
  btn.addEventListener('click', function() {
    ym(XXXXXXXX, 'reachGoal', 'cta_click');
    gtag('event', 'click_cta', {
      'event_label': this.textContent
    });
  });
});

// Внешние ссылки
document.querySelectorAll('a[href^="http"]').forEach(link => {
  link.addEventListener('click', function() {
    ym(XXXXXXXX, 'extLink', this.href);
  });
});
```

## 🔥 Facebook Pixel (опционально)

### Установка
```html
<!-- Facebook Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"
/></noscript>
<!-- End Facebook Pixel Code -->
```

### События
```javascript
// Просмотр контента
fbq('track', 'ViewContent', {
  content_name: 'Course Page',
  content_category: 'Education'
});

// Добавление в корзину
fbq('track', 'AddToCart', {
  content_name: 'Full Access Plan',
  value: 800,
  currency: 'USD'
});

// Покупка
fbq('track', 'Purchase', {
  value: 800,
  currency: 'USD'
});
```

## 📱 Hotjar (тепловые карты)

### Установка
```html
<!-- Hotjar Tracking Code -->
<script>
    (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:YOUR_SITE_ID,hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
</script>
```

## 🎯 Ключевые метрики для отслеживания

### Трафик
- Посетители (уникальные)
- Просмотры страниц
- Средняя длительность сессии
- Показатель отказов
- Источники трафика (органика, прямой, реферальный, соцсети)

### Поведение
- Самые популярные страницы
- Путь пользователя (User Flow)
- Карта кликов
- Карта скроллинга
- Время на странице

### Конверсии
- Регистрации (цель: 3-5%)
- Покупки (цель: 1-2%)
- Просмотры тарифов
- Клики на CTA
- Заполнение форм

### Аудитория
- География (страны, города)
- Устройства (десктоп, мобильные, планшеты)
- Браузеры
- Язык
- Новые vs возвращающиеся

## 📊 Дашборды для мониторинга

### Еженедельный отчёт
- Посетители: +/- % к прошлой неделе
- Конверсия в регистрацию: %
- Конверсия в покупку: %
- Топ-5 страниц по трафику
- Топ-3 источника трафика

### Ежемесячный отчёт
- Общий трафик: динамика
- ROI по каналам
- Стоимость привлечения (CAC)
- Lifetime Value (LTV)
- Воронка продаж

## 🔧 Создание общего файла аналитики

Создайте файл `analytics.js` и подключите на всех страницах:

```javascript
// analytics.js
(function() {
  'use strict';
  
  // Инициализация
  const GA_ID = 'G-XXXXXXXXXX';
  const YM_ID = 'XXXXXXXX';
  
  // Отслеживание кликов по кнопкам
  function trackButtonClick(button) {
    const text = button.textContent.trim();
    const href = button.getAttribute('href') || '';
    
    // Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'button_click', {
        'event_category': 'engagement',
        'event_label': text,
        'value': href
      });
    }
    
    // Yandex Metrika
    if (typeof ym !== 'undefined') {
      ym(YM_ID, 'reachGoal', 'button_click', {
        button_text: text,
        button_href: href
      });
    }
  }
  
  // Отслеживание скролла
  let scrollDepth = 0;
  window.addEventListener('scroll', function() {
    const depth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    
    if (depth > scrollDepth && depth % 25 === 0) {
      scrollDepth = depth;
      
      if (typeof gtag !== 'undefined') {
        gtag('event', 'scroll_depth', {
          'event_category': 'engagement',
          'value': depth
        });
      }
    }
  });
  
  // Автоматическое отслеживание всех кнопок
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('button, .btn, .pricing-btn, a[class*="btn"]').forEach(btn => {
      btn.addEventListener('click', function() {
        trackButtonClick(this);
      });
    });
  });
  
  // Отслеживание времени на странице
  let startTime = Date.now();
  window.addEventListener('beforeunload', function() {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    
    if (typeof gtag !== 'undefined') {
      gtag('event', 'time_on_page', {
        'event_category': 'engagement',
        'value': timeSpent
      });
    }
  });
})();
```

Подключение:
```html
<script src="/analytics.js" defer></script>
```

## ✅ Чек-лист установки

- [ ] Google Analytics 4 установлен на всех страницах
- [ ] Yandex Metrika установлена на всех страницах
- [ ] События настроены (регистрация, покупка, CTA)
- [ ] Цели созданы в Метрике
- [ ] Конверсии настроены в GA4
- [ ] Проверена работа счётчиков (Real-Time отчёты)
- [ ] Создан файл analytics.js
- [ ] Настроены еженедельные email-отчёты
- [ ] Добавлены в Google Search Console
- [ ] Связаны GA4 и Search Console

## 🚀 Проверка работы

### Google Analytics
1. Откройте сайт
2. Перейдите в GA4 → Отчёты → Реал-тайм
3. Должны увидеть себя в активных пользователях

### Yandex Metrika
1. Откройте сайт
2. Перейдите в Метрику → Мои отчёты → Посещаемость → Сейчас на сайте
3. Должны увидеть 1 посетителя (себя)

### Проверка событий
1. Откройте консоль браузера (F12)
2. Кликните на кнопку
3. В консоли должны появиться сообщения от gtag и ym
