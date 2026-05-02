# Load Finder - Поиск реальных грузов

Приложение для поиска актуальных грузов с бесплатных load boards.

## Возможности

- 🔍 Поиск грузов по городу/штату
- 🚛 Фильтрация по типу трейлера
- 💰 Расчет $/миля
- 📍 Поиск по радиусу
- 🔄 Автообновление данных

## Источники данных

- Trulos.com (бесплатный, без регистрации)
- TruckerPath (150k+ грузов)
- PickaTruckLoad.com

## Технологии

- Backend: Python (Flask)
- Scraper: BeautifulSoup4 / Selenium
- Frontend: HTML/CSS/JavaScript
- База данных: SQLite

## Установка

```bash
# Установить зависимости
pip install -r requirements.txt

# Запустить сервер
python app.py
```

## Использование

1. Откройте http://localhost:5000
2. Введите параметры поиска
3. Просмотрите актуальные грузы
4. Свяжитесь с брокером

## Структура проекта

```
load-finder-app/
├── app.py              # Flask сервер
├── scraper.py          # Парсер load boards
├── database.py         # Работа с БД
├── static/             # CSS, JS
├── templates/          # HTML шаблоны
└── data/               # База данных
```
