"""
Проверка прямых ссылок на load board страницы
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

def check_loadboard_page(url, name):
    """Проверяет страницу load board"""
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
        
        text = driver.find_element(By.TAG_NAME, "body").text.lower()
        html = driver.page_source
        
        # Проверки
        has_loads = 'load' in text and ('pickup' in text or 'origin' in text or 'freight' in text)
        needs_login = 'login' in text or 'sign in' in text or 'sign up' in text or 'register' in text
        has_captcha = 'captcha' in text or 'cloudflare' in text or 'checking your browser' in text
        
        # Ищем города
        cities = re.findall(r'[A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s[A-Z]{2}', html)
        
        # Ищем телефоны
        phones = re.findall(r'\d{3}[-.\s]?\d{3}[-.\s]?\d{4}', text)
        
        # Ищем таблицы
        tables = driver.find_elements(By.TAG_NAME, "table")
        
        # Ищем формы поиска
        forms = driver.find_elements(By.TAG_NAME, "form")
        
        print(f"✅ Грузы: {'ДА' if has_loads else 'НЕТ'}")
        print(f"🔐 Логин: {'ДА' if needs_login else 'НЕТ'}")
        print(f"🤖 CAPTCHA: {'ДА' if has_captcha else 'НЕТ'}")
        print(f"📍 Города: {len(set(cities))}")
        print(f"📞 Телефоны: {len(set(phones))}")
        print(f"📊 Таблиц: {len(tables)}")
        print(f"📝 Форм: {len(forms)}")
        
        if has_loads and not needs_login and not has_captcha and len(cities) > 5:
            print(f"🎯 ДОСТУПЕН!")
            print(f"   Примеры городов: {', '.join(list(set(cities))[:5])}")
            return True
        elif has_loads and not needs_login and not has_captcha:
            print(f"⚠️ ВОЗМОЖНО (мало данных)")
            if cities:
                print(f"   Города: {', '.join(list(set(cities))[:3])}")
            return False
        else:
            return False
    
    except Exception as e:
        print(f"❌ ОШИБКА: {str(e)[:100]}")
        return False
    
    finally:
        driver.quit()

if __name__ == "__main__":
    # Прямые ссылки на load board страницы
    sources = [
        ("https://www.freightfinder.com/database/search/city-radius", "FreightFinder Search"),
        ("https://www.freightfinder.com/database/search/", "FreightFinder Database"),
        ("https://trulos.com/fullview.html", "Trulos Fullview"),
        ("http://www.trulos.com/load-board.html", "Trulos Load Board HTML"),
        ("https://www.dssln.com/loadboard/", "DSSLN Load Board"),
        ("https://www.swiftlogistics.com/load-board/", "Swift Logistics Load Board"),
        ("https://www.ryantrans.com/carriers/", "Ryan Transportation Carriers"),
        ("https://www.tql.com/freight-broker-services/carrier-services", "TQL Carrier Services"),
    ]
    
    print("🚀 Проверка прямых ссылок на load board страницы...")
    
    accessible = []
    
    for url, name in sources:
        if check_loadboard_page(url, name):
            accessible.append((name, url))
        time.sleep(2)
    
    print(f"\n{'='*70}")
    print(f"\n✅ ДОСТУПНЫЕ ИСТОЧНИКИ ({len(accessible)}):")
    for name, url in accessible:
        print(f"   🎯 {name}")
        print(f"      {url}")
    
    print("\n✅ Проверка завершена")
