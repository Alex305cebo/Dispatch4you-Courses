# 🔐 Руководство по автоматическому логину

## Как это работает

**Система НЕ создает фейковые аккаунты!**

Вместо этого:
1. ✅ Вы регистрируетесь ВРУЧНУЮ один раз
2. ✅ Сохраняете свои credentials в `credentials.json`
3. ✅ Система автоматически логинится используя ваши данные
4. ✅ Парсит грузы после успешного логина

## Шаг 1: Ручная регистрация

### TruckerPath.com

1. Перейдите на https://truckerpath.com/
2. Нажмите "Sign Up"
3. Заполните форму:
   - Email
   - Password
   - Company Name
   - Phone Number
4. Подтвердите email
5. ✅ Готово! Доступ мгновенный

**Требования:** НЕТ (не требуется MC Number)

---

### Convoy.com

1. Перейдите на https://convoy.com/
2. Нажмите "Sign Up"
3. Заполните форму:
   - Email
   - Password
   - Company Name
   - MC Number ⚠️
   - DOT Number ⚠️
   - Insurance Certificate ⚠️
4. Дождитесь одобрения (24-48 часов)
5. ✅ Готово!

**Требования:** MC Number, DOT Number, Insurance

---

### Doft.com

1. Перейдите на https://doft.com/
2. Нажмите "Sign Up"
3. Заполните форму:
   - Email
   - Password
   - Company Name
   - Phone Number
4. Подтвердите email
5. ✅ Готово! Доступ мгновенный

**Требования:** НЕТ (есть бесплатный план)

---

## Шаг 2: Сохранение credentials

### Вариант 1: Через Python скрипт

```python
from auto_login_scraper import AutoLoginScraper

scraper = AutoLoginScraper()

# Настройка TruckerPath
scraper.setup_truckerpath('your@email.com', 'your_password')

# Настройка Convoy
scraper.setup_convoy('your@email.com', 'your_password')

# Настройка Doft
scraper.setup_doft('your@email.com', 'your_password')
```

### Вариант 2: Вручную создать credentials.json

```json
{
  "truckerpath": {
    "username": "your@email.com",
    "password": "your_password"
  },
  "convoy": {
    "username": "your@email.com",
    "password": "your_password"
  },
  "doft": {
    "username": "your@email.com",
    "password": "your_password"
  }
}
```

**⚠️ ВАЖНО:** Добавьте `credentials.json` в `.gitignore`!

---

## Шаг 3: Использование

```python
from auto_login_scraper import AutoLoginScraper

scraper = AutoLoginScraper()

try:
    # Поиск грузов со всех источников (включая те что требуют логин)
    loads = scraper.search_all_sources_with_login("CA", "Van")
    
    print(f"\n📊 Найдено: {len(loads)} грузов")
    
    for i, load in enumerate(loads[:10], 1):
        print(f"\n{i}. {load['origin']} → {load['destination']}")
        print(f"   {load['broker']} | {load['phone']}")
        print(f"   Источник: {load['source']}")

finally:
    scraper.close()
```

---

## Интеграция с Flask

Обновите `app_selenium.py`:

```python
from auto_login_scraper import AutoLoginScraper

app = Flask(__name__)
scraper = AutoLoginScraper()  # Вместо MultiSourceScraper

@app.route('/api/search', methods=['POST'])
def search():
    try:
        filters = request.get_json()
        origin_state = filters.get('origin_state', 'AZ')
        equipment = filters.get('equipment_type', 'Van')
        
        # Используем метод с автоматическим логином
        loads = scraper.search_all_sources_with_login(origin_state, equipment)
        
        return jsonify({
            'success': True,
            'count': len(loads),
            'loads': loads
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
```

---

## Какие источники НЕ требуют MC Number?

### ✅ Можно зарегистрироваться БЕЗ MC Number:

1. **TruckerPath** - только email и телефон
2. **Doft** - есть бесплатный план без MC Number
3. **uShip** - для перевозчиков, но это marketplace

### ❌ Требуют MC Number:

1. **Convoy** - обязательно MC Number + страховка
2. **DAT** - обязательно MC Number
3. **Truckstop.com** - обязательно MC Number
4. **123Loadboard** - обязательно MC Number
5. **GetLoaded** - обязательно MC Number

---

## Преимущества этого подхода

✅ **Легально** - используете свои реальные аккаунты
✅ **Безопасно** - credentials хранятся локально
✅ **Автоматически** - логин происходит автоматически
✅ **Больше грузов** - доступ к дополнительным источникам
✅ **Один раз** - регистрация только один раз

---

## Недостатки

❌ **Требуется ручная регистрация** - нельзя полностью автоматизировать
❌ **MC Number** - большинство требуют MC Number
❌ **Верификация** - может занять 24-48 часов
❌ **Риск блокировки** - если слишком частые запросы

---

## Рекомендации

### Для максимального количества грузов:

1. **Зарегистрируйтесь на TruckerPath** (БЕЗ MC Number)
   - 150,000+ грузов ежедневно
   - Мгновенный доступ
   - Бесплатно для брокеров

2. **Зарегистрируйтесь на Doft** (БЕЗ MC Number)
   - 150,000+ грузов ежедневно
   - Есть бесплатный план
   - Мгновенный доступ

3. **Если есть MC Number - зарегистрируйтесь на Convoy**
   - Высококачественные грузы
   - Быстрые платежи
   - Требуется одобрение

### Итого:
- FreightFinder: ~100-150 грузов (БЕЗ регистрации)
- TruckerPath: ~500-1000 грузов (С регистрацией, БЕЗ MC)
- Doft: ~500-1000 грузов (С регистрацией, БЕЗ MC)
- **ВСЕГО: ~1100-2150 грузов!**

---

## Безопасность

### Защита credentials:

1. Добавьте в `.gitignore`:
```
credentials.json
```

2. Используйте переменные окружения:
```python
import os
from dotenv import load_dotenv

load_dotenv()

email = os.getenv('TRUCKERPATH_EMAIL')
password = os.getenv('TRUCKERPATH_PASSWORD')
```

3. Шифруйте credentials:
```python
from cryptography.fernet import Fernet

# Генерация ключа (один раз)
key = Fernet.generate_key()

# Шифрование
cipher = Fernet(key)
encrypted = cipher.encrypt(password.encode())

# Расшифровка
decrypted = cipher.decrypt(encrypted).decode()
```

---

## FAQ

**Q: Это легально?**
A: Да, если вы используете свои реальные аккаунты. НЕ создавайте фейковые аккаунты.

**Q: Могут ли заблокировать аккаунт?**
A: Да, если делать слишком много запросов. Рекомендуется добавлять задержки между запросами.

**Q: Нужен ли MC Number?**
A: Для TruckerPath и Doft - НЕТ. Для Convoy, DAT, Truckstop - ДА.

**Q: Сколько времени занимает регистрация?**
A: TruckerPath и Doft - мгновенно. Convoy - 24-48 часов.

**Q: Можно ли использовать один аккаунт для нескольких пользователей?**
A: Технически да, но это может нарушать Terms of Service.
