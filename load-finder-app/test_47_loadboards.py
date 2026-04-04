"""
Тестирование 47 бесплатных load boards
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time
import re

def quick_check(url, name):
    """Быстрая проверка load board"""
    print(f"\n🔍 {name}")
    
    chrome_options = Options()
    chrome_options.add_argument('--headless=new')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    try:
        driver.get(url)
        time.sleep(4)
        
        text = driver.find_element(By.TAG_NAME, "body").text.lower()
        html = driver.page_source
        
        # Проверки
        has_loads = 'load' in text and ('pickup' in text or 'origin' in text or 'freight' in text)
        needs_login = any(kw in text for kw in ['login', 'sign in', 'sign up', 'register', 'create account', 'member'])
        has_captcha = 'captcha' in text or 'cloudflare' in text or 'checking your browser' in text
        
        # Ищем города
        cities = re.findall(r'[A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s[A-Z]{2}', html)
        
        # Ищем телефоны
        phones = re.findall(r'\d{3}[-.\s]?\d{3}[-.\s]?\d{4}', text)
        
        status = "❌"
        if has_loads and not needs_login and not has_captcha and len(cities) > 3:
            status = "🎯 ДОСТУПЕН"
            print(f"   {status}")
            print(f"   📍 Города: {len(set(cities))}")
            print(f"   📞 Телефоны: {len(set(phones))}")
            print(f"   Примеры: {', '.join(list(set(cities))[:3])}")
        elif has_loads and not needs_login and not has_captcha:
            status = "⚠️ ВОЗМОЖНО"
            print(f"   {status} (мало данных)")
        elif needs_login:
            print(f"   ❌ Требует логин")
        elif has_captcha:
            print(f"   ❌ CAPTCHA")
        else:
            print(f"   ❌ Нет грузов")
    
    except Exception as e:
        print(f"   ❌ Ошибка: {str(e)[:50]}")
    
    finally:
        driver.quit()

if __name__ == "__main__":
    # Приоритетные источники из списка
    sources = [
        # Бесплатные без регистрации
        ("https://truckerpath.com/", "Trucker Path"),
        ("https://trulos.com/load-board/", "Trulos"),
        ("https://trulos.net/load-board-with-rates/", "Trulos.net (с ценами)"),
        ("https://www.freightfinder.com/", "Freight Finder"),
        ("https://www.nextload.com/", "NextLoad"),
        ("https://convoy.com/", "Convoy"),
        ("https://doft.com/", "Doft"),
        ("https://www.landstar.com/", "Landstar"),
        
        # Брокеры с бесплатными load boards
        ("https://www.uber.com/freight/", "Uber Freight"),
        ("https://www.schneider.com/", "Schneider"),
        ("https://www.coyote.com/", "CoyoteGO"),
        ("https://www.jbhunt.com/", "JB Hunt"),
        ("https://www.werner.com/", "Werner"),
        ("https://www.tql.com/", "TQL"),
        ("https://hoploads.com/", "Hoploads"),
        ("https://www.flockfreight.com/", "Flock Freight"),
    ]
    
    print("🚀 Тестирование бесплатных load boards...")
    print("="*70)
    
    for url, name in sources:
        quick_check(url, name)
        time.sleep(1)
    
    print("\n" + "="*70)
    print("✅ Тестирование завершено")
