"""
Детальная отладка источников - смотрим HTML структуру
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time

def debug_source(url, name):
    """Отладка одного источника"""
    print(f"\n{'='*70}")
    print(f"🔍 Отладка: {name}")
    print(f"📍 URL: {url}")
    print(f"{'='*70}")
    
    chrome_options = Options()
    chrome_options.add_argument('--headless=new')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    try:
        driver.get(url)
        time.sleep(5)
        
        # Получаем весь текст страницы
        body_text = driver.find_element(By.TAG_NAME, "body").text
        
        print(f"\n📄 Текст страницы (первые 1000 символов):")
        print(body_text[:1000])
        
        # Проверяем ключевые слова
        keywords = ['load', 'freight', 'pickup', 'delivery', 'origin', 'destination', 'truck']
        found_keywords = [kw for kw in keywords if kw.lower() in body_text.lower()]
        
        print(f"\n🔑 Найденные ключевые слова: {', '.join(found_keywords) if found_keywords else 'НЕТ'}")
        
        # Проверяем требование логина
        login_keywords = ['login', 'sign in', 'sign up', 'register', 'create account']
        needs_login = any(kw in body_text.lower() for kw in login_keywords)
        
        print(f"🔐 Требует логин: {'ДА' if needs_login else 'НЕТ'}")
        
        # Ищем таблицы
        tables = driver.find_elements(By.TAG_NAME, "table")
        print(f"📊 Найдено таблиц: {len(tables)}")
        
        # Ищем div с классами load/freight
        divs = driver.find_elements(By.CSS_SELECTOR, "div[class*='load'], div[class*='freight'], div[class*='card']")
        print(f"📦 Найдено div с load/freight/card: {len(divs)}")
        
        if divs:
            print(f"\n📝 Пример первого div:")
            print(divs[0].text[:200] if divs[0].text else "ПУСТО")
    
    except Exception as e:
        print(f"❌ ОШИБКА: {e}")
    
    finally:
        driver.quit()

if __name__ == "__main__":
    sources = [
        ("https://framer.truckerpath.com/truckloads/free-load-board", "TruckerPath"),
        ("https://www.pickatruckload.com/", "PickaTruckLoad"),
        ("https://alltruckers.com/", "AllTruckers"),
        ("https://trulos.com/load-board/", "Trulos"),
    ]
    
    for url, name in sources:
        debug_source(url, name)
        time.sleep(2)
    
    print(f"\n{'='*70}")
    print("✅ Отладка завершена")
    print(f"{'='*70}")
