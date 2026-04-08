"""
Поиск альтернативных источников грузов
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

def check_source(url, name):
    """Проверяет источник"""
    print(f"\n{'='*70}")
    print(f"🔍 {name}")
    print(f"📍 {url}")
    
    chrome_options = Options()
    chrome_options.add_argument('--headless=new')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    try:
        driver.get(url)
        time.sleep(5)
        
        body = driver.find_element(By.TAG_NAME, "body")
        text = body.text.lower()
        html = driver.page_source
        
        # Ищем города в формате City, ST
        cities = re.findall(r'[A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s[A-Z]{2}', html)
        
        # Ищем телефоны
        phones = re.findall(r'\d{3}[-.\s]?\d{3}[-.\s]?\d{4}', text)
        
        # Ищем даты
        dates = re.findall(r'\d{1,2}/\d{1,2}/\d{2,4}', html)
        
        # Ищем таблицы
        tables = driver.find_elements(By.TAG_NAME, "table")
        rows = []
        if tables:
            for table in tables:
                rows.extend(table.find_elements(By.TAG_NAME, "tr"))
        
        has_loads = 'load' in text and ('pickup' in text or 'origin' in text or 'freight' in text)
        needs_login = any(kw in text for kw in ['login', 'sign in', 'sign up', 'register'])
        has_captcha = 'captcha' in text or 'cloudflare' in text
        
        print(f"✅ Есть грузы: {'ДА' if has_loads else 'НЕТ'}")
        print(f"🔐 Требует логин: {'ДА' if needs_login else 'НЕТ'}")
        print(f"🤖 CAPTCHA: {'ДА' if has_captcha else 'НЕТ'}")
        print(f"📍 Города: {len(set(cities))}")
        print(f"📞 Телефоны: {len(set(phones))}")
        print(f"📅 Даты: {len(set(dates))}")
        print(f"📊 Таблиц: {len(tables)}, строк: {len(rows)}")
        
        if has_loads and not needs_login and not has_captcha and len(cities) > 5:
            print(f"🎯 ПОТЕНЦИАЛЬНО ДОСТУПЕН!")
            print(f"   Примеры городов: {', '.join(list(set(cities))[:5])}")
            if phones:
                print(f"   Примеры телефонов: {', '.join(list(set(phones))[:3])}")
    
    except Exception as e:
        print(f"❌ ОШИБКА: {str(e)[:100]}")
    
    finally:
        driver.quit()

if __name__ == "__main__":
    # Альтернативные источники
    sources = [
        # Региональные load boards
        ("https://www.freightfinder.com/database/search/city-radius", "FreightFinder (прямой доступ)"),
        
        # Форумы и сообщества
        ("https://www.thetruckersreport.com/truckingindustry/forums/freight-brokers-and-load-boards.51/", "Truckers Report Forum"),
        
        # Агрегаторы
        ("https://www.truckerpath.com/", "TruckerPath Main"),
        
        # Другие load boards
        ("https://www.posteverywhere.com/", "Post Everywhere"),
        ("https://www.loadconnect.com/", "Load Connect"),
        ("https://www.superdispatch.com/load-board", "Super Dispatch"),
    ]
    
    print("🚀 Поиск альтернативных источников...")
    
    for url, name in sources:
        check_source(url, name)
        time.sleep(2)
    
    print(f"\n{'='*70}")
    print("✅ Поиск завершен")
