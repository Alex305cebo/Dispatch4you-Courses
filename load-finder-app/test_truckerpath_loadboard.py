"""
Детальная проверка TruckerPath Load Board
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
chrome_options.add_argument('--window-size=1920,1080')

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

try:
    url = "https://loadboard.truckerpath.com/carrier/loads/home?source_caller=ui&utm_source=official_website&shortlink=cwgwebd1&utm_medium=web&c=homesite&pid=tp_homesite&af_xp=app"
    
    print("🔍 Проверка TruckerPath Load Board...")
    print(f"📍 URL: {url}\n")
    
    driver.get(url)
    time.sleep(5)
    
    # Получаем текст страницы
    body_text = driver.find_element(By.TAG_NAME, "body").text
    
    print("📄 Текст страницы (первые 2000 символов):")
    print(body_text[:2000])
    print("\n" + "="*70 + "\n")
    
    # Проверяем требование логина
    needs_login = any(kw in body_text.lower() for kw in ['login', 'sign in', 'sign up', 'register', 'create account'])
    
    print(f"🔐 Требует логин: {'ДА' if needs_login else 'НЕТ'}")
    
    # Ищем города
    html = driver.page_source
    cities = re.findall(r'[A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s[A-Z]{2}', html)
    print(f"📍 Найдено городов: {len(set(cities))}")
    if cities:
        print(f"   Примеры: {', '.join(list(set(cities))[:10])}")
    
    # Ищем телефоны
    phones = re.findall(r'\d{3}[-.\s]?\d{3}[-.\s]?\d{4}', body_text)
    print(f"📞 Найдено телефонов: {len(set(phones))}")
    if phones:
        print(f"   Примеры: {', '.join(list(set(phones))[:5])}")
    
    # Ищем элементы с грузами
    print("\n🔍 Поиск элементов с грузами...")
    
    # Пробуем разные селекторы
    selectors = [
        "div[class*='load']",
        "div[class*='freight']",
        "div[class*='card']",
        "div[class*='item']",
        "tr",
        ".load-item",
        ".freight-item",
    ]
    
    for selector in selectors:
        elements = driver.find_elements(By.CSS_SELECTOR, selector)
        if elements:
            print(f"   ✅ {selector}: {len(elements)} элементов")
            
            # Показываем первый элемент
            if elements[0].text:
                print(f"      Пример: {elements[0].text[:200]}")
    
    # Ищем кнопки и ссылки
    print("\n🔗 Кнопки и ссылки:")
    buttons = driver.find_elements(By.TAG_NAME, "button")
    print(f"   Кнопок: {len(buttons)}")
    
    links = driver.find_elements(By.TAG_NAME, "a")
    print(f"   Ссылок: {len(links)}")
    
    # Показываем текст кнопок
    if buttons:
        print("\n   Примеры кнопок:")
        for btn in buttons[:10]:
            if btn.text:
                print(f"      - {btn.text}")
    
    # Проверяем наличие формы поиска
    print("\n📝 Формы:")
    forms = driver.find_elements(By.TAG_NAME, "form")
    print(f"   Найдено форм: {len(forms)}")
    
    inputs = driver.find_elements(By.TAG_NAME, "input")
    print(f"   Найдено input полей: {len(inputs)}")
    
    if inputs:
        print("\n   Примеры input полей:")
        for inp in inputs[:10]:
            name = inp.get_attribute('name')
            placeholder = inp.get_attribute('placeholder')
            input_type = inp.get_attribute('type')
            if name or placeholder:
                print(f"      - Type: {input_type}, Name: {name}, Placeholder: {placeholder}")
    
    # Сохраняем скриншот
    driver.save_screenshot("load-finder-app/truckerpath_screenshot.png")
    print("\n📸 Скриншот сохранен: truckerpath_screenshot.png")
    
    # Итоговая оценка
    print("\n" + "="*70)
    print("📊 ИТОГОВАЯ ОЦЕНКА:")
    print("="*70)
    
    if needs_login:
        print("❌ Требуется логин для доступа к грузам")
        print("✅ Можно реализовать автоматический логин")
    else:
        print("🎯 ДОСТУПЕН БЕЗ ЛОГИНА!")
        print("✅ Можно парсить грузы напрямую")
    
    if len(cities) > 10:
        print(f"✅ Много данных о городах ({len(set(cities))} уникальных)")
    
    if len(phones) > 5:
        print(f"✅ Есть телефоны ({len(set(phones))} уникальных)")

finally:
    driver.quit()

print("\n✅ Проверка завершена")
