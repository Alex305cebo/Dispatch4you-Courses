"""
Детальная проверка uShip.com
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

chrome_options = Options()
chrome_options.add_argument('--headless=new')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

try:
    print("🔍 Проверка uShip.com...")
    driver.get("https://www.uship.com/")
    time.sleep(5)
    
    # Получаем весь текст
    body_text = driver.find_element(By.TAG_NAME, "body").text
    print(f"\n📄 Текст страницы (первые 2000 символов):")
    print(body_text[:2000])
    
    # Ищем ссылки на грузы
    links = driver.find_elements(By.TAG_NAME, "a")
    load_links = [link.get_attribute('href') for link in links if link.get_attribute('href') and 'ship' in link.get_attribute('href').lower()]
    
    print(f"\n🔗 Найдено ссылок с 'ship': {len(load_links)}")
    if load_links:
        print("Примеры:")
        for link in load_links[:5]:
            print(f"  - {link}")
    
    # Ищем элементы с грузами
    cards = driver.find_elements(By.CSS_SELECTOR, "div[class*='card'], div[class*='listing'], div[class*='item']")
    print(f"\n📦 Найдено карточек: {len(cards)}")
    
    if cards:
        print("\n📝 Примеры карточек:")
        for i, card in enumerate(cards[:5], 1):
            text = card.text
            if text and len(text) > 20:
                print(f"\n{i}. {text[:200]}")

finally:
    driver.quit()
