# 💳 Инструкция по настройке платежных систем

## ✅ Что уже сделано:

1. ✅ Создана страница оплаты `checkout.html`
2. ✅ Интегрированы 3 способа оплаты:
   - 💳 Stripe (карты)
   - 🅿️ PayPal
   - 🇺🇸 US Transfers (Zelle, Venmo, Cash App)
3. ✅ Обновлены кнопки на `pricing.html`

---

## 🔧 Что нужно настроить:

### 1. Stripe (Основной способ)

#### Шаг 1: Регистрация
1. Зайди на https://stripe.com
2. Нажми "Start now" → Зарегистрируйся
3. Заполни данные компании

#### Шаг 2: Получи API ключи
1. Зайди в Dashboard → Developers → API keys
2. Скопируй:
   - **Publishable key** (начинается с `pk_`)
   - **Secret key** (начинается с `sk_`)

#### Шаг 3: Замени ключ в checkout.html
Найди строку 286:
```javascript
const stripe = Stripe('pk_test_YOUR_STRIPE_PUBLIC_KEY');
```

Замени на свой:
```javascript
const stripe = Stripe('pk_live_ВАШ_КЛЮЧ');
```

#### Шаг 4: Создай серверную часть
Создай файл `server.js` (Node.js):

```javascript
const express = require('express');
const stripe = require('stripe')('sk_live_ВАШ_SECRET_КЛЮЧ');
const app = express();

app.use(express.json());

app.post('/create-payment-intent', async (req, res) => {
  const { amount, email } = req.body;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: 'usd',
    receipt_email: email,
  });

  res.json({ clientSecret: paymentIntent.client_secret });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

---

### 2. PayPal

#### Шаг 1: Регистрация
1. Зайди на https://developer.paypal.com
2. Создай Business аккаунт
3. Зайди в Dashboard → My Apps & Credentials

#### Шаг 2: Создай приложение
1. Нажми "Create App"
2. Скопируй **Client ID**

#### Шаг 3: Замени в checkout.html
Найди строку 14:
```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=USD"></script>
```

Замени на:
```html
<script src="https://www.paypal.com/sdk/js?client-id=ВАШ_CLIENT_ID&currency=USD"></script>
```

---

### 3. US Transfers (Zelle, Venmo, Cash App)

#### Обновить данные в checkout.html

Найди строки 369-371:
```html
<p><strong>Zelle:</strong> dispatcher@example.com</p>
<p><strong>Venmo:</strong> @dispatcher-training</p>
<p><strong>Cash App:</strong> $DispatcherCourse</p>
```

Замени на свои реальные данные:
```html
<p><strong>Zelle:</strong> ВАШ_EMAIL</p>
<p><strong>Venmo:</strong> @ВАШ_VENMO</p>
<p><strong>Cash App:</strong> $ВАШ_CASHTAG</p>
```

---

## 📧 Email уведомления

Создай файл для обработки переводов:

```javascript
// confirm-transfer.js
const nodemailer = require('nodemailer');

app.post('/confirm-transfer', async (req, res) => {
  const { email, phone, plan, amount } = req.body;

  // Отправь email себе
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your@email.com',
      pass: 'your-password'
    }
  });

  await transporter.sendMail({
    from: 'your@email.com',
    to: 'your@email.com',
    subject: 'Новый перевод - подтверждение',
    text: `
      Email: ${email}
      Phone: ${phone}
      Plan: ${plan}
      Amount: $${amount}
    `
  });

  // Отправь email клиенту
  await transporter.sendMail({
    from: 'your@email.com',
    to: email,
    subject: 'Инструкции по оплате',
    html: `
      <h2>Спасибо за заказ!</h2>
      <p>Переведите $${amount} на один из способов:</p>
      <ul>
        <li>Zelle: ВАШ_EMAIL</li>
        <li>Venmo: @ВАШ_VENMO</li>
        <li>Cash App: $ВАШ_CASHTAG</li>
      </ul>
      <p>После перевода отправьте скриншот на support@dispatch4you.com</p>
    `
  });

  res.json({ success: true });
});
```

---

## 🚀 Деплой

### Вариант 1: Vercel (Рекомендуется)
```bash
npm install -g vercel
vercel
```

### Вариант 2: Heroku
```bash
heroku create
git push heroku main
```

---

## 🔐 Безопасность

1. ✅ Используй HTTPS (у тебя уже есть)
2. ✅ Храни Secret ключи в переменных окружения
3. ✅ Не коммить ключи в Git

Создай `.env`:
```
STRIPE_SECRET_KEY=sk_live_...
PAYPAL_CLIENT_ID=...
```

---

## 📊 Тестирование

### Stripe тестовые карты:
- **Успешная**: 4242 4242 4242 4242
- **Отклонена**: 4000 0000 0000 0002
- **3D Secure**: 4000 0027 6000 3184

### PayPal Sandbox:
Используй тестовый аккаунт из PayPal Developer Dashboard

---

## 💰 Комиссии

- **Stripe**: 2.9% + $0.30
- **PayPal**: 2.9% + фиксированная
- **US Transfers**: 0% (прямые переводы)

---

## 📞 Поддержка

Если нужна помощь:
1. Stripe: https://support.stripe.com
2. PayPal: https://developer.paypal.com/support
3. Документация: https://stripe.com/docs

---

## ✅ Чеклист запуска

- [ ] Зарегистрирован в Stripe
- [ ] Получены API ключи Stripe
- [ ] Заменен ключ в checkout.html
- [ ] Создан серверный endpoint
- [ ] Зарегистрирован в PayPal
- [ ] Получен Client ID PayPal
- [ ] Заменен Client ID в checkout.html
- [ ] Обновлены данные Zelle/Venmo/Cash App
- [ ] Настроены email уведомления
- [ ] Протестированы все способы оплаты
- [ ] Задеплоен на сервер

---

**Готово! Все платежные системы установлены и готовы к настройке.**
