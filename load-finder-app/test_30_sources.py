"""
Тестирование 30 бесплатных load boards
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import requests
from bs4 import BeautifulSoup
import re

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

# Источники которые заявлены как "free to use" БЕЗ регистрации
sources = [
    ("https://www.freightfinder.com/", "FreightFinder"),
    ("https://freefreightsearch.com/", "FreeFreightSearch"),
    ("https://www.dssln.com/", "DSSLN"),
    ("https://www.forcombo.com/lumber-transportation-board.aspx", "Forest Commodities"),
    ("https://www.maverickusa.com/", "Maverick Transportation"),
    ("https://schneider.com/", "Schneider"),
    ("https://www.swiftlogistics.com/", "Swift Logistics"),
    ("https://www.ryantrans.com/", "Ryan Transportation"),
    ("https://www.tql.com/", "TQL"),
    ("https://www.dumptruckloads.com/", "DumpTruckLoads"),
]

print("🚀 Тестирование бесплатных load boards БЕЗ регистрации...\n")

accessible = []

for url, name in sources:
    print(f"🔍 {name}")
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            text = soup.get_text().lower()
            html = str(soup)
            
            # Проверки
            has_loads = 'load' in text and ('pickup' in text or 'origin' in text or 'freight' in text)
            needs_login = 'login' in text or 'sign in' in text or 'sign up' in text
            has_captcha = 'captcha' in text or 'cloudflare' in text
            
            # Ищем города
            cities = re.findall(r'[A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s[A-Z]{2}', html)
            
            # Ищем телефоны
            phones = re.findall(r'\d{3}[-.\s]?\d{3}[-.\s]?\d{4}', text)
            
            # Ищем ссылки на load board
            load_board_links = []
            for link in soup.find_all('a', href=True):
                href = link['href'].lower()
                link_text = link.get_text().lower()
                if 'load' in href or 'freight' in href or 'load' in link_text:
                    load_board_links.append(link['href'])
            
            print(f"   ✅ Статус: {response.status_code}")
            print(f"   Грузы: {'ДА' if has_loads else 'НЕТ'}")
            print(f"   Логин: {'ДА' if needs_login else 'НЕТ'}")
            print(f"   Города: {len(set(cities))}")
            print(f"   Ссылки на load board: {len(load_board_links)}")
            
            if has_loads and not needs_login and not has_captcha:
                if len(cities) > 3:
                    print(f"   🎯 ДОСТУПЕН!")
                    accessible.append((name, url, len(cities)))
                elif load_board_links:
                    print(f"   ⚠️ ВОЗМОЖНО (есть ссылки на load board)")
                    print(f"      Примеры: {load_board_links[:2]}")
                else:
                    print(f"   ⚠️ ВОЗМОЖНО (мало данных)")
        else:
            print(f"   ❌ Статус: {response.status_code}")
    
    except Exception as e:
        print(f"   ❌ Ошибка: {str(e)[:60]}")
    
    print()

print("="*70)
print(f"\n✅ ДОСТУПНЫЕ ИСТОЧНИКИ ({len(accessible)}):")
for name, url, cities in accessible:
    print(f"   🎯 {name}: {cities} городов - {url}")

print("\n✅ Тестирование завершено")
