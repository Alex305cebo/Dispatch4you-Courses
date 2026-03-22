import os

sections = [
    (1,  "🎯", "Введение",          "Beginner", "Обзор индустрии грузоперевозок США", "#10b981",
     ["Что такое freight dispatching", "Структура индустрии грузоперевозок США", "Роли: shipper, carrier, broker, dispatcher", "Как работает цепочка поставок", "Перспективы рынка и возможности"]),
    (2,  "📖", "Глоссарий",         "Beginner", "75+ ключевых терминов и аббревиатур", "#10b981",
     ["BOL — Bill of Lading", "POD — Proof of Delivery", "Rate Confirmation", "HOS — Hours of Service", "FMCSA, DOT, MC Number", "Factoring, Lumper, Detention"]),
    (3,  "👤", "Роль диспетчера",   "Beginner", "Обязанности и ежедневная работа", "#10b981",
     ["Ежедневные задачи диспетчера", "Работа с водителями", "Коммуникация с брокерами", "Управление документами", "Тайм-менеджмент и приоритеты"]),
    (4,  "🚛", "Типы траков",       "Beginner", "Dry van, reefer, flatbed и другие", "#10b981",
     ["Dry Van — стандартный закрытый трак", "Reefer — рефрижератор", "Flatbed — платформа", "Step Deck и Lowboy", "Tanker и Specialized", "Как выбрать тип под груз"]),
    (5,  "🗺️", "Маршруты",         "Beginner", "Планирование и оптимизация маршрутов", "#10b981",
     ["Основы планирования маршрутов", "Зоны и регионы США", "Deadhead и как его минимизировать", "Fuel stops и rest areas", "Инструменты: Google Maps, PC*Miler"]),
    (6,  "💻", "Load Boards",       "Intermediate", "DAT, Truckstop, 123Loadboard", "#f59e0b",
     ["Что такое Load Board", "DAT — крупнейшая биржа грузов", "Truckstop.com — функции и поиск", "123Loadboard — для начинающих", "Как читать листинг груза", "Фильтры и алерты"]),
    (7,  "💬", "Переговоры",        "Intermediate", "Как договариваться о лучших ценах", "#f59e0b",
     ["Психология переговоров", "Как узнать рыночную ставку", "Скрипты для звонков брокерам", "Работа с возражениями", "Когда соглашаться, когда отказывать"]),
    (8,  "🤝", "Брокеры",           "Intermediate", "Верификация, факторинг, отношения", "#f59e0b",
     ["Как проверить брокера (FMCSA)", "Credit check и payment terms", "Факторинг — что это и зачем", "Построение долгосрочных отношений", "Топ брокеры рынка"]),
    (9,  "📋", "Документация",      "Intermediate", "Rate confirmation, BOL, POD", "#f59e0b",
     ["Rate Confirmation — разбор по пунктам", "Bill of Lading — заполнение", "Proof of Delivery", "Lumper receipts", "Detention и layover документы"]),
    (10, "⚠️", "Безопасность",      "Intermediate", "HOS, DOT requirements", "#f59e0b",
     ["Hours of Service (HOS) правила", "ELD — электронные логбуки", "DOT inspections", "CSA scores", "Что делать при аварии"]),
    (11, "💻", "Технологии",        "Advanced", "TMS, ELD, GPS tracking", "#ef4444",
     ["TMS — Transportation Management System", "ELD устройства и интеграция", "GPS tracking платформы", "Автоматизация рутинных задач", "AI инструменты для диспетчеров"]),
    (12, "📞", "Коммуникация",      "Advanced", "Общение с drivers, brokers, shippers", "#ef4444",
     ["Профессиональный английский для диспетчера", "Email шаблоны", "Телефонные скрипты", "Работа с конфликтными ситуациями", "Культурные особенности общения в США"]),
    (13, "🔧", "Решение проблем",   "Advanced", "Типичные ситуации и их решения", "#ef4444",
     ["Водитель опаздывает на pickup", "Груз повреждён", "Брокер не платит", "Водитель сломался в пути", "Отмена груза в последний момент"]),
    (14, "💰", "Финансы",           "Advanced", "Расчеты, прибыль, налоги", "#ef4444",
     ["Как рассчитать свою комиссию", "Структура расходов перевозчика", "Факторинг и cash flow", "Налоги для self-employed диспетчера", "Финансовое планирование"]),
    (15, "🚀", "Карьера",           "Advanced", "Трудоустройство и развитие", "#ef4444",
     ["Где искать работу диспетчером", "Как составить резюме", "Собственный диспетчерский бизнес", "Масштабирование и найм", "Доход $50K-150K+ — реальный путь"]),
]

level_colors = {"Beginner": "#10b981", "Intermediate": "#f59e0b", "Advanced": "#ef4444"}

template = '''<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Раздел {num}: {name} | Курс Диспетчера</title>
    <link rel="icon" type="image/svg+xml" href="../favicon.svg">
    <link rel="stylesheet" href="../shared-nav.css">
    <style>
        * {{ margin:0; padding:0; box-sizing:border-box; }}
        :root {{
            --primary:#667eea; --bg:#070b14; --text:#f1f5f9; --muted:#94a3b8;
            --border:rgba(255,255,255,0.08); --accent:{color};
        }}
        body {{ font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; background:var(--bg); color:var(--text); line-height:1.7; padding-top:80px; }}
        body::before {{ content:''; position:fixed; inset:0; background:radial-gradient(circle at 20% 30%,rgba(102,126,234,0.08),transparent 60%),radial-gradient(circle at 80% 70%,rgba(118,75,162,0.08),transparent 60%); z-index:-1; }}
        .page-wrap {{ max-width:860px; margin:0 auto; padding:40px 24px 80px; }}
        .breadcrumb {{ font-size:13px; color:var(--muted); margin-bottom:32px; }}
        .breadcrumb a {{ color:var(--muted); text-decoration:none; }}
        .breadcrumb a:hover {{ color:var(--text); }}
        .section-header {{ margin-bottom:40px; }}
        .level-badge {{ display:inline-block; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:700; background:rgba(255,255,255,0.06); color:{color}; border:1px solid {color}40; margin-bottom:16px; }}
        .section-icon {{ font-size:56px; margin-bottom:16px; display:block; }}
        .section-num {{ font-size:13px; color:var(--muted); margin-bottom:8px; }}
        h1 {{ font-size:clamp(28px,5vw,42px); font-weight:800; margin-bottom:12px; }}
        .section-desc {{ font-size:17px; color:var(--muted); }}
        .content-card {{ background:rgba(255,255,255,0.03); border:1px solid var(--border); border-radius:16px; padding:28px; margin-bottom:20px; }}
        .content-card h2 {{ font-size:18px; font-weight:700; margin-bottom:16px; color:var(--text); display:flex; align-items:center; gap:10px; }}
        .topic-list {{ list-style:none; }}
        .topic-list li {{ padding:12px 0; border-bottom:1px solid var(--border); color:var(--muted); display:flex; align-items:flex-start; gap:10px; font-size:15px; }}
        .topic-list li:last-child {{ border-bottom:none; }}
        .topic-list li::before {{ content:'→'; color:{color}; font-weight:700; flex-shrink:0; margin-top:1px; }}
        .nav-buttons {{ display:flex; gap:12px; margin-top:40px; flex-wrap:wrap; }}
        .btn {{ padding:12px 24px; border-radius:10px; font-size:14px; font-weight:600; text-decoration:none; transition:all 0.2s; }}
        .btn-prev {{ background:rgba(255,255,255,0.06); color:var(--muted); border:1px solid var(--border); }}
        .btn-prev:hover {{ background:rgba(255,255,255,0.1); color:var(--text); }}
        .btn-next {{ background:var(--accent); color:#fff; }}
        .btn-next:hover {{ opacity:0.85; transform:translateY(-1px); }}
        .btn-back {{ background:rgba(99,102,241,0.15); color:#a78bfa; border:1px solid rgba(99,102,241,0.3); }}
        .btn-back:hover {{ background:rgba(99,102,241,0.25); }}
        @media(max-width:600px) {{ .page-wrap {{ padding:24px 16px 60px; }} }}
    </style>
</head>
<body>
    <div id="nav-placeholder" style="position:sticky;top:0;z-index:99999;"></div>
    <script src="../nav-loader.js"></script>
    <div class="page-wrap">
        <div class="breadcrumb">
            <a href="../index.html">Главная</a> › <a href="documentation.html">Программа курса</a> › Раздел {num}
        </div>
        <div class="section-header">
            <span class="level-badge">{level}</span>
            <span class="section-icon">{icon}</span>
            <div class="section-num">Раздел {num} из 15</div>
            <h1>{name}</h1>
            <p class="section-desc">{desc}</p>
        </div>
        <div class="content-card">
            <h2>📋 Темы раздела</h2>
            <ul class="topic-list">
{topics_html}
            </ul>
        </div>
        <div class="content-card">
            <h2>🎯 Что ты освоишь</h2>
            <ul class="topic-list">
                <li>Практические навыки применимые с первого дня работы</li>
                <li>Реальные примеры из индустрии грузоперевозок США</li>
                <li>Шаблоны и чек-листы для ежедневной работы</li>
            </ul>
        </div>
        <div class="nav-buttons">
            {prev_btn}
            <a href="documentation.html" class="btn btn-back">📚 Все разделы</a>
            {next_btn}
        </div>
    </div>
</body>
</html>'''

os.makedirs('pages', exist_ok=True)

for num, icon, name, level, desc, color, topics in sections:
    topics_html = '\n'.join(f'                <li>{t}</li>' for t in topics)
    prev_btn = f'<a href="course-section-{num-1}.html" class="btn btn-prev">← Раздел {num-1}</a>' if num > 1 else ''
    next_btn = f'<a href="course-section-{num+1}.html" class="btn btn-next">Раздел {num+1} →</a>' if num < 15 else ''
    html = template.format(num=num, icon=icon, name=name, level=level, desc=desc,
                           color=color, topics_html=topics_html, prev_btn=prev_btn, next_btn=next_btn)
    with open(f'pages/course-section-{num}.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'Created: course-section-{num}.html')

print('Done! 15 pages created.')
