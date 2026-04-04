"""
Тестирование Trulos.com - бесплатный load board без логина
"""
import requests
from bs4 import BeautifulSoup
import json
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

urls_to_test = [
    'https://trulos.com/load-board/',
    'https://trulos.com/fullview.html',
    'https://www.trulos.com/load-board.html',
    'https://www.trulos.com/truckload/',
]

print("🔍 Тестирую Trulos.com URLs...\n")

for url in urls_to_test:
    print(f"URL: {url}")
    try:
        response = requests.get(url, headers=headers, timeout=15)
        print(f"Статус: {response.status_code}")
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            text = soup.get_text()
            
            # Ищем признаки грузов
            has_loads = 'load' in text.lower() and ('pickup' in text.lower() or 'origin' in text.lower())
            print(f"Есть грузы: {has_loads}")
            
            # Ищем телефоны
            phones = re.findall(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
            print(f"Телефонов: {len(set(phones))}")
            
            # Ищем таблицы
            tables = soup.find_all('table')
            print(f"Таблиц: {len(tables)}")
            
            # Сохраняем HTML
            filename = url.replace('https://', '').replace('/', '_').replace('.', '_') + '.html'
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(soup.prettify())
            print(f"Сохранено: {filename}")
            
            # Ищем JavaScript с данными
            scripts = soup.find_all('script')
            for script in scripts:
                script_text = script.string if script.string else ''
                if 'load' in script_text.lower() and len(script_text) > 100:
                    print(f"\n📜 Найден JS с данными (первые 200 символов):")
                    print(script_text[:200])
                    break
        
        print()
        
    except Exception as e:
        print(f"Ошибка: {e}\n")

print("✅ Тестирование завершено")
