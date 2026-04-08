"""
Проверка TruckerPath с видимым браузером
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time
import re

chrome_options = Options()
# НЕ используем headless - открываем видимый браузер
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument('--window-size=1920,1080')

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

try:
    url = "https://loadboard.truckerpath.com/carrier/loads/home?source_caller=ui&utm_source=official_website&shortlink=cwgwebd1&utm_medium=web&c=homesite&pid=tp_homesite&af_xp=app"
    
    print("🔍 Открываю TruckerPath в видимом браузере...")
    print(f"📍 URL: {url}\n")
    print("⏳ Браузер откроется на 30 секунд...")
    print("   Посмотрите что отображается!\n")
    
    driver.get(url)
    
    # Закрываем cookie banner
    try:
        accept_btn = WebDriverWait(driver, 3).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Accept')]"))
        )
        accept_btn.click()
        print("✅ Cookie banner закрыт")
    except:
        pass
    
    # Ждем 30 секунд чтобы страница полностью загрузилась
    print("\n⏳ Ожидание 30 секунд для полной загрузки...")
    for i in range(30, 0, -5):
        print(f"   {i} секунд...")
        time.sleep(5)
        
        # Каждые 5 секунд проверяем что загрузилось
        html = driver.page_source
        cities = re.findall(r'[A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s[A-Z]{2}', html)
        
        if len(cities) > 10:
            print(f"   ✅ Найдено {len(cities)} городов!")
            break
    
    # Финальная проверка
    print("\n📊 Финальная проверка...")
    html = driver.page_source
    body_text = driver.find_element(By.TAG_NAME, "body").text
    
    cities = re.findall(r'[A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s[A-Z]{2}', html)
    phones = re.findall(r'\d{3}[-.\s]?\d{3}[-.\s]?\d{4}', body_text)
    rates = re.findall(r'\$[\d,]+(?:\.\d{2})?', body_text)
    
    print(f"📍 Городов: {len(cities)}")
    print(f"📞 Телефонов: {len(phones)}")
    print(f"💰 Ставок: {len(rates)}")
    
    if cities:
        print(f"\n   Примеры городов: {', '.join(list(set(cities))[:10])}")
    
    if phones:
        print(f"\n   Примеры телефонов: {', '.join(list(set(phones))[:5])}")
    
    # Сохраняем скриншот
    driver.save_screenshot("truckerpath_visible.png")
    print("\n📸 Скриншот сохранен: truckerpath_visible.png")
    
    # Сохраняем HTML
    with open("truckerpath_visible.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("📄 HTML сохранен: truckerpath_visible.html")
    
    print("\n✅ Проверка завершена")
    print("   Браузер закроется через 5 секунд...")
    time.sleep(5)

finally:
    driver.quit()
