# 📧 Руководство по временной почте

## 🚀 Быстрый старт

```bash
cd load-finder-app
python temp_email_generator.py
```

## 📋 Что делает скрипт:

1. ✅ Генерирует случайный временный email
2. ✅ Показывает входящие письма
3. ✅ Читает содержимое писем
4. ✅ Находит ссылки для подтверждения
5. ✅ Полностью БЕСПЛАТНО

## 🎯 Использование для регистрации на TruckerPath:

### Шаг 1: Запустите генератор

```bash
python temp_email_generator.py
```

### Шаг 2: Скопируйте email

Скрипт покажет:
```
✅ Ваш временный email: abc123xyz@1secmail.com
```

### Шаг 3: Зарегистрируйтесь на TruckerPath

1. Откройте https://truckerpath.com/
2. Нажмите "Sign Up"
3. Введите временный email
4. Заполните остальные поля
5. Нажмите "Register"

### Шаг 4: Проверьте почту

В скрипте выберите:
- `1` - Проверить почту сейчас
- `2` - Ждать письмо 60 секунд

### Шаг 5: Откройте ссылку подтверждения

Скрипт покажет:
```
🔗 Найденные ссылки:
   1. https://truckerpath.com/verify?token=...
```

Скопируйте ссылку и откройте в браузере.

### Шаг 6: Сохраните credentials

После подтверждения email, сохраните:
- Email: `abc123xyz@1secmail.com`
- Password: `ваш_пароль`

В файл `credentials.json`:
```json
{
  "truckerpath": {
    "username": "abc123xyz@1secmail.com",
    "password": "ваш_пароль"
  }
}
```

---

## 💻 Программное использование

```python
from temp_email_generator import TempEmailGenerator

# Создаем генератор
generator = TempEmailGenerator()

# Генерируем email
email = generator.generate_email()
print(f"Email: {email}")

# Используем email для регистрации...
# (здесь ваш код регистрации)

# Ждем письмо с подтверждением
messages = generator.wait_for_email(timeout=60)

if messages:
    # Читаем первое письмо
    msg = generator.read_message(messages[0]['id'])
    generator.display_message_content(msg)
```

---

## 🔧 API 1secmail.com

Скрипт использует бесплатный API:
- URL: https://www.1secmail.com/api/
- ✅ Не требует регистрации
- ✅ Не требует API ключа
- ✅ Полностью бесплатно
- ⏱️ Email живет ~1 час

### Доступные домены:
- @1secmail.com
- @1secmail.org
- @1secmail.net
- @wwjmp.com
- @esiix.com
- @xojxe.com
- @yoggm.com

---

## ⚠️ Ограничения

### Что НЕ работает:
❌ SMS верификация - нужен реальный телефон
❌ Долгосрочное хранение - email удаляется через ~1 час
❌ Некоторые сайты блокируют временные email

### Что работает:
✅ Email верификация
✅ Получение ссылок подтверждения
✅ Регистрация на большинстве сайтов
✅ Быстрая проверка почты

---

## 🎯 Альтернативные сервисы

Если 1secmail не работает, попробуйте:

### 1. TempMail.org
```python
# Откройте в браузере
https://temp-mail.org/
```

### 2. Guerrilla Mail
```python
# Откройте в браузере
https://www.guerrillamail.com/
```

### 3. 10MinuteMail
```python
# Откройте в браузере
https://10minutemail.com/
```

---

## 🤖 Автоматическая регистрация

Создам скрипт который автоматически:
1. Генерирует email
2. Заполняет форму регистрации
3. Ждет письмо
4. Извлекает ссылку подтверждения
5. Открывает ссылку
6. Сохраняет credentials

```python
from temp_email_generator import TempEmailGenerator
from selenium import webdriver
import time

def auto_register_truckerpath():
    # Генерируем email
    generator = TempEmailGenerator()
    email = generator.generate_email()
    password = "YourPassword123!"
    
    # Открываем браузер
    driver = webdriver.Chrome()
    
    try:
        # Переходим на страницу регистрации
        driver.get("https://truckerpath.com/signup")
        time.sleep(2)
        
        # Заполняем форму
        driver.find_element(By.NAME, "email").send_keys(email)
        driver.find_element(By.NAME, "password").send_keys(password)
        # ... остальные поля
        
        # Отправляем форму
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        time.sleep(3)
        
        print(f"✅ Форма отправлена")
        print(f"⏳ Ожидание письма...")
        
        # Ждем письмо
        messages = generator.wait_for_email(60)
        
        if messages:
            msg = generator.read_message(messages[0]['id'])
            
            # Ищем ссылку подтверждения
            import re
            text = msg.get('textBody', '')
            links = re.findall(r'https?://[^\s<>"]+verify[^\s<>"]*', text)
            
            if links:
                verify_link = links[0]
                print(f"✅ Найдена ссылка: {verify_link}")
                
                # Открываем ссылку
                driver.get(verify_link)
                time.sleep(3)
                
                print(f"✅ Email подтвержден!")
                print(f"\nCredentials:")
                print(f"  Email: {email}")
                print(f"  Password: {password}")
                
                return email, password
    
    finally:
        driver.quit()

# Использование
# email, password = auto_register_truckerpath()
```

---

## 📝 Примеры использования

### Пример 1: Простая проверка почты

```python
from temp_email_generator import TempEmailGenerator

gen = TempEmailGenerator()
email = gen.generate_email()

print(f"Используйте этот email: {email}")
input("Нажмите Enter после регистрации...")

messages = gen.check_inbox()
gen.display_messages(messages)
```

### Пример 2: Ожидание конкретного письма

```python
from temp_email_generator import TempEmailGenerator
import time

gen = TempEmailGenerator()
email = gen.generate_email()

# Регистрируемся...
print(f"Email: {email}")

# Ждем письмо от TruckerPath
while True:
    messages = gen.check_inbox()
    
    for msg in messages:
        if 'truckerpath' in msg.get('from', '').lower():
            full_msg = gen.read_message(msg['id'])
            gen.display_message_content(full_msg)
            break
    
    time.sleep(5)
```

---

## ✅ Итог

Временная почта - отличный способ:
- ✅ Зарегистрироваться без использования основного email
- ✅ Избежать спама
- ✅ Быстро протестировать сервис
- ✅ Получить доступ к load boards

**Используйте скрипт для регистрации на TruckerPath и получите доступ к 150,000+ грузам!**
