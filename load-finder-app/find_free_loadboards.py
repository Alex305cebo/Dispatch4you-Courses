"""
Поиск бесплатных load boards БЕЗ регистрации
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

def check_loadboard(url, name):
    """Проверяет один load board"""
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
        
        body_text = driver.find_element(By.TAG_NAME, "body").text.lower()
        
        # Проверяем признаки
        has_loads = 'load' in body_text and ('pickup' in body_text or 'origin' in body_text or 'freight' in body_text)
        needs_login = any(kw in body_text for kw in ['login', 'sign in', 'sign up', 'register', 'create account'])
        has_captcha = 'captcha' in body_text or 'cloudflare' in body_text
        
        # Ищем города (формат: City, ST)
        import re
        cities = re.findall(r'[A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s[A-Z]{2}', driver.page_source)
        has_city_pairs = len(cities) >= 2
        
        # Ищем телефоны
        phones = re.findall(r'\d{3}[-.\s]?\d{3}[-.\s]?\d{4}', body_text)
        has_phones = len(phones) > 0
        
        print(f"✅ Есть грузы: {'ДА' if has_loads else 'НЕТ'}")
        print(f"🔐 Требует логин: {'ДА' if needs_login else 'НЕТ'}")
        print(f"🤖 CAPTCHA: {'ДА' if has_captcha else 'НЕТ'}")
        print(f"📍 Города найдены: {len(cities)}")
        print(f"📞 Телефоны найдены: {len(phones)}")
        
        if has_loads and not needs_login and not has_captcha and (has_city_pairs or has_phones):
            print(f"🎯 ПОТЕНЦИАЛЬНО ДОСТУПЕН!")
            if cities:
                print(f"   Примеры городов: {', '.join(cities[:5])}")
        
    except Exception as e:
        print(f"❌ ОШИБКА: {e}")
    
    finally:
        driver.quit()

if __name__ == "__main__":
    # Список потенциальных бесплатных load boards
    sources = [
        ("https://www.freightfinder.com/database/search/city-radius", "FreightFinder (проверка)"),
        ("https://www.123loadboard.com/find-loads/", "123Loadboard"),
        ("https://www.getloaded.com/", "GetLoaded"),
        ("https://www.directfreight.com/", "Direct Freight"),
        ("https://www.truckstop.com/", "Truckstop.com"),
        ("https://www.dat.com/", "DAT Load Board"),
        ("https://www.coyote.com/load-board/", "Coyote Load Board"),
        ("https://www.uship.com/", "uShip"),
        ("https://www.freightquote.com/", "FreightQuote"),
        ("https://www.freightcenter.com/", "Freight Center"),
    ]
    
    print("🚀 Поиск бесплатных load boards БЕЗ регистрации...")
    
    for url, name in sources:
        check_loadboard(url, name)
        time.sleep(2)
    
    print(f"\n{'='*70}")
    print("✅ Поиск завершен")
    print(f"{'='*70}")
