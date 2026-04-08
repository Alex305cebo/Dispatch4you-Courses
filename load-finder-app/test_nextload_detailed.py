"""
Детальная проверка NextLoad.com
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
    print("🔍 Детальная проверка NextLoad.com...")
    driver.get("https://www.nextload.com/")
    time.sleep(5)
    
    # Получаем текст
    body_text = driver.find_element(By.TAG_NAME, "body").text
    print(f"\n📄 Текст страницы (первые 2000 символов):")
    print(body_text[:2000])
    
    # Ищем ссылки на load board
    links = driver.find_elements(By.TAG_NAME, "a")
    load_links = []
    for link in links:
        href = link.get_attribute('href')
        text = link.text.lower()
        if href and ('load' in text or 'freight' in text or 'search' in text):
            load_links.append((href, link.text))
    
    print(f"\n🔗 Найдено ссылок на грузы: {len(load_links)}")
    if load_links:
        print("Примеры:")
        for href, text in load_links[:10]:
            print(f"  - {text}: {href}")
    
    # Ищем формы поиска
    forms = driver.find_elements(By.TAG_NAME, "form")
    print(f"\n📝 Найдено форм: {len(forms)}")
    
    # Ищем input поля
    inputs = driver.find_elements(By.TAG_NAME, "input")
    print(f"📝 Найдено input полей: {len(inputs)}")
    if inputs:
        print("Примеры:")
        for inp in inputs[:5]:
            name = inp.get_attribute('name')
            placeholder = inp.get_attribute('placeholder')
            if name or placeholder:
                print(f"  - {name or 'no-name'}: {placeholder or 'no-placeholder'}")

finally:
    driver.quit()
