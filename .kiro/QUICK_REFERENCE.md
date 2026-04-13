# ⚡ Быстрая шпаргалка - Все ссылки и команды

## 🔗 Важные ссылки

### Hostinger
- **hPanel:** https://hpanel.hostinger.com/
- **File Manager:** hPanel → Files → File Manager
- **Email:** hPanel → Emails → Email Accounts
- **DNS:** hPanel → Domains → DNS / Nameservers
- **SSL:** hPanel → Security → SSL
- **Backups:** hPanel → Files → Backups
- **Support:** Live Chat в hPanel (24/7)

### Google
- **Search Console:** https://search.google.com/search-console
- **Analytics:** https://analytics.google.com/
- **Tag Manager:** https://tagmanager.google.com/
- **My Business:** https://www.google.com/business/
- **Ads:** https://ads.google.com/

### Проверка SEO
- **PageSpeed:** https://pagespeed.web.dev/
- **SSL Test:** https://www.ssllabs.com/ssltest/
- **Mobile-Friendly:** https://search.google.com/test/mobile-friendly
- **Facebook Debugger:** https://developers.facebook.com/tools/debug/
- **Twitter Validator:** https://cards-dev.twitter.com/validator
- **Rich Results:** https://search.google.com/test/rich-results

### Мониторинг
- **UptimeRobot:** https://uptimerobot.com/
- **GTmetrix:** https://gtmetrix.com/
- **Pingdom:** https://tools.pingdom.com/

### Инструменты
- **TinyPNG:** https://tinypng.com/ (сжатие изображений)
- **CSS Minifier:** https://cssminifier.com/
- **JS Minifier:** https://javascript-minifier.com/
- **Canva:** https://www.canva.com/ (создание og-image)
- **Figma:** https://www.figma.com/

---

## 📝 Быстрые команды

### Проверка домена
```bash
# Проверка DNS
nslookup dispatch4you.com

# Проверка пинга
ping dispatch4you.com

# Проверка SSL
curl -I https://dispatch4you.com
```

### FTP подключение
```
Host: ftp.dispatch4you.com
Port: 21
Username: [ваш FTP логин]
Password: [ваш FTP пароль]
```

### Email настройки
**IMAP (входящие):**
```
Server: imap.hostinger.com
Port: 993
Security: SSL/TLS
```

**SMTP (исходящие):**
```
Server: smtp.hostinger.com
Port: 465
Security: SSL/TLS
```

---

## 🎯 Measurement IDs (заполните после создания)

```
Google Analytics 4:
Measurement ID: G-__________

Google Tag Manager:
Container ID: GTM-__________

Google Ads:
Conversion ID: AW-__________

Yandex Metrika:
Counter ID: __________

Facebook Pixel:
Pixel ID: __________
```

---

## 📋 Быстрые проверки

### Проверка сайта
- [ ] https://dispatch4you.com - открывается
- [ ] https://www.dispatch4you.com - редирект на без www
- [ ] http://dispatch4you.com - редирект на https
- [ ] Замок 🔒 в адресной строке

### Проверка файлов
- [ ] https://dispatch4you.com/robots.txt
- [ ] https://dispatch4you.com/sitemap.xml
- [ ] https://dispatch4you.com/og-image.png
- [ ] https://dispatch4you.com/favicon.svg

### Проверка страниц
- [ ] https://dispatch4you.com/ (главная)
- [ ] https://dispatch4you.com/about.html
- [ ] https://dispatch4you.com/pricing.html
- [ ] https://dispatch4you.com/career.html
- [ ] https://dispatch4you.com/contacts.html
- [ ] https://dispatch4you.com/pages/modules-index.html
- [ ] https://dispatch4you.com/pages/documentation.html

### Проверка аналитики
- [ ] GA4 Real-Time показывает посетителей
- [ ] Search Console: sitemap отправлен
- [ ] События отслеживаются в GA4
- [ ] Email уведомления работают

---

## 🔧 Коды для вставки

### Google Analytics 4
```html
<!-- Вставить в <head> всех страниц -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Google Tag Manager
```html
<!-- Вставить в <head> -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>

<!-- Вставить после <body> -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
```

### Yandex Metrika
```html
<!-- Вставить в <head> -->
<script type="text/javascript">
   (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
   m[i].l=1*new Date();
   for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
   k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
   (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
   ym(XXXXXXXX, "init", {clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});
</script>
```

---

## 📞 Контакты поддержки

### Hostinger
- **Live Chat:** 24/7 в hPanel
- **Email:** support@hostinger.com
- **База знаний:** https://support.hostinger.com/
- **Среднее время ответа:** 2-5 минут

### Google Support
- **Search Console:** https://support.google.com/webmasters
- **Analytics:** https://support.google.com/analytics
- **Ads:** https://support.google.com/google-ads
- **Форум:** https://support.google.com/webmasters/community

---

## 🎯 Ключевые метрики

### Цели на первый месяц
- Посетители: 10-50/день
- Показатель отказов: < 60%
- Время на сайте: > 2 минуты
- Скорость загрузки: > 90

### Цели на 3 месяца
- Посетители: 100-200/месяц
- Конверсия: 3-5%
- Топ-10: 3-5 запросов
- Индексация: 100% страниц

### Цели на 6 месяцев
- Посетители: 500-1000/месяц
- Конверсия: 5-7%
- Топ-3: 2+ запроса
- Органический трафик: 70%+

---

## 📚 Документация

### Основные файлы
- **MASTER_SETUP_PLAN.md** - пошаговый план на 3 дня
- **HOSTINGER_SETUP.md** - настройка хостинга
- **GOOGLE_INTEGRATION.md** - интеграция с Google
- **SEO_QUICK_START.md** - SEO на 7 дней
- **SEO_GUIDE.md** - полное руководство по SEO
- **ANALYTICS_SETUP.md** - настройка аналитики
- **OG_IMAGE_GUIDE.md** - создание изображений

### Шаблоны
- **seo-template.html** - шаблон мета-тегов
- **analytics-events.js** - отслеживание событий

---

## ⚡ Быстрый старт (если спешите)

### Минимум на сегодня (1 час)
1. Загрузите файлы на Hostinger
2. Установите SSL
3. Проверьте что сайт открывается

### Минимум на эту неделю (3 часа)
1. Создайте og-image.png
2. Зарегистрируйтесь в Search Console
3. Установите Google Analytics
4. Отправьте sitemap.xml

### Полная настройка (3 дня)
Следуйте **MASTER_SETUP_PLAN.md**

---

## 🔥 Частые ошибки

### ❌ Сайт не открывается
- Проверьте DNS записи
- Подождите 24-48 часов после изменения DNS
- Очистите кеш браузера (Ctrl+F5)

### ❌ SSL не работает
- Подождите 10-15 минут после установки
- Проверьте Force HTTPS в hPanel
- Очистите кеш браузера

### ❌ GA4 не показывает данные
- Проверьте Measurement ID
- Отключите AdBlock
- Подождите 24 часа

### ❌ Email не отправляется
- Проверьте SPF и DKIM
- Проверьте не попали ли в спам
- Используйте SMTP вместо mail()

---

## 💡 Полезные советы

1. **Делайте бэкапы** перед любыми изменениями
2. **Тестируйте на staging** перед публикацией
3. **Мониторьте ошибки** в Search Console
4. **Обновляйте контент** регулярно
5. **Отвечайте на отзывы** быстро
6. **Анализируйте конкурентов** постоянно
7. **Оптимизируйте скорость** всегда
8. **Следите за трендами** в индустрии

---

**Сохраните эту шпаргалку - она понадобится часто! 📌**
