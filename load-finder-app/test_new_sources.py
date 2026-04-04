"""
Тестирование новых потенциальных источников
"""
import requests
from bs4 import BeautifulSoup

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

sources = [
    ('Trulos (новый URL)', 'https://trulos.com/load-board/'),
    ('TruckerPath', 'https://framer.truckerpath.com/truckloads/free-load-board'),
    ('PickaTruckLoad (главная)', 'https://www.pickatruckload.com/'),
    ('Five Star Load Board', 'https://www.fivestarloadboard.com/post-loads/'),
    ('DOFT', 'https://doft.com/'),
    ('AllTruckers', 'https://alltruckers.com/'),
]

print("🔍 Тестирование новых источников...\n")

for name, url in sources:
    print(f"📦 {name}")
    print(f"   URL: {url}")
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        status = response.status_code
        
        if status == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            text = soup.get_text().lower()
            
            # Проверяем признаки
            has_login = 'login' in text or 'sign in' in text or 'sign up' in text
            has_loads = 'load' in text and ('origin' in text or 'pickup' in text or 'freight' in text)
            
            print(f"   ✅ Статус: {status}")
            print(f"   Требует логин: {'Да' if has_login else 'Нет'}")
            print(f"   Есть грузы: {'Да' if has_loads else 'Нет'}")
            
            if not has_login and has_loads:
                print(f"   🎯 ПОТЕНЦИАЛЬНО ДОСТУПЕН!")
        else:
            print(f"   ❌ Статус: {status}")
    
    except Exception as e:
        print(f"   ❌ Ошибка: {str(e)[:50]}")
    
    print()

print("✅ Тестирование завершено")
