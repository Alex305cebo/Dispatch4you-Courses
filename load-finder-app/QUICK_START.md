# 🚀 Быстрый старт - Автоматический логин

## Вариант 1: Только FreightFinder (БЕЗ регистрации)

```bash
cd load-finder-app
python app_selenium.py
```

Откройте http://localhost:5000

**Результат:** ~100-150 реальных грузов

---

## Вариант 2: С автоматическим логином (БОЛЬШЕ грузов)

### Шаг 1: Зарегистрируйтесь вручную

**TruckerPath (БЕЗ MC Number):**
1. Перейдите на https://truckerpath.com/
2. Нажмите "Sign Up"
3. Заполните: email, password, company name, phone
4. Подтвердите email
5. ✅ Готово!

**Doft (БЕЗ MC Number):**
1. Перейдите на https://doft.com/
2. Нажмите "Sign Up"
3. Заполните: email, password, company name
4. Подтвердите email
5. ✅ Готово!

### Шаг 2: Сохраните credentials

Создайте файл `load-finder-app/credentials.json`:

```json
{
  "truckerpath": {
    "username": "your@email.com",
    "password": "your_password"
  },
  "doft": {
    "username": "your@email.com",
    "password": "your_password"
  }
}
```

### Шаг 3: Обновите app_selenium.py

Замените первую строку:

```python
# Было:
from multi_source_scraper import MultiSourceScraper
scraper = MultiSourceScraper()

# Стало:
from auto_login_scraper import AutoLoginScraper
scraper = AutoLoginScraper()
```

И замените метод в `/api/search`:

```python
# Было:
loads = scraper.search_all_sources(origin_state, equipment)

# Стало:
loads = scraper.search_all_sources_with_login(origin_state, equipment)
```

### Шаг 4: Запустите

```bash
python app_selenium.py
```

**Результат:** ~1100-2150 реальных грузов!

---

## Источники грузов

| Источник | Регистрация | MC Number | Грузов |
|----------|-------------|-----------|--------|
| FreightFinder | ❌ НЕТ | ❌ НЕТ | ~100-150 |
| TruckerPath | ✅ ДА | ❌ НЕТ | ~500-1000 |
| Doft | ✅ ДА | ❌ НЕТ | ~500-1000 |
| Convoy | ✅ ДА | ✅ ДА | ~1000+ |

---

## Безопасность

⚠️ **ВАЖНО:** Добавьте `credentials.json` в `.gitignore`!

Файл уже добавлен в `.gitignore`, но проверьте:

```bash
# Проверьте что credentials.json в .gitignore
cat .gitignore | grep credentials
```

---

## Тестирование

```python
from auto_login_scraper import AutoLoginScraper

scraper = AutoLoginScraper()

try:
    loads = scraper.search_all_sources_with_login("CA", "Van")
    print(f"Найдено: {len(loads)} грузов")
    
    # Показать источники
    sources = {}
    for load in loads:
        source = load['source']
        sources[source] = sources.get(source, 0) + 1
    
    print("\nГрузы по источникам:")
    for source, count in sources.items():
        print(f"  {source}: {count} грузов")

finally:
    scraper.close()
```

---

## Troubleshooting

**Проблема:** "credentials не найдены"
**Решение:** Создайте файл `credentials.json` с вашими данными

**Проблема:** "Ошибка логина"
**Решение:** Проверьте правильность email и password

**Проблема:** "Слишком долго"
**Решение:** Уменьшите количество источников или увеличьте timeout

**Проблема:** "Аккаунт заблокирован"
**Решение:** Добавьте больше задержек между запросами (time.sleep)
