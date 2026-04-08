"""
Быстрая проверка топ источников
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

sources = [
    ("https://trulos.net/load-board-with-rates/", "Trulos.net"),
    ("https://www.nextload.com/", "NextLoad"),
    ("https://doft.com/", "Doft"),
    ("https://hoploads.com/", "Hoploads"),
    ("https://www.landstar.com/capacity-providers/find-freight", "Landstar"),
]

print("🚀 Быстрая проверка топ источников...\n")

for url, name in sources:
    print(f"🔍 {name}")
    print(f"   URL: {url}")
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            text = soup.get_text().lower()
            html = str(soup)
            
            # Проверки
            has_loads = 'load' in text and ('pickup' in text or 'origin' in text or 'freight' in text)
            needs_login = any(kw in text for kw in ['login', 'sign in', 'sign up', 'register'])
            has_captcha = 'captcha' in text or 'cloudflare' in text
            
            # Ищем города
            cities = re.findall(r'[A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s[A-Z]{2}', html)
            
            # Ищем телефоны
            phones = re.findall(r'\d{3}[-.\s]?\d{3}[-.\s]?\d{4}', text)
            
            print(f"   ✅ Статус: {response.status_code}")
            print(f"   Грузы: {'ДА' if has_loads else 'НЕТ'}")
            print(f"   Логин: {'ДА' if needs_login else 'НЕТ'}")
            print(f"   CAPTCHA: {'ДА' if has_captcha else 'НЕТ'}")
            print(f"   Города: {len(set(cities))}")
            print(f"   Телефоны: {len(set(phones))}")
            
            if has_loads and not needs_login and not has_captcha and len(cities) > 3:
                print(f"   🎯 ПОТЕНЦИАЛЬНО ДОСТУПЕН!")
                print(f"      Примеры городов: {', '.join(list(set(cities))[:5])}")
        else:
            print(f"   ❌ Статус: {response.status_code}")
    
    except Exception as e:
        print(f"   ❌ Ошибка: {str(e)[:80]}")
    
    print()

print("✅ Проверка завершена")
