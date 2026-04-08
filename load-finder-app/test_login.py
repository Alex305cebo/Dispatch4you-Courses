"""
Тест логина на TruckerPath - анализ страницы
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time
import json

# Загружаем credentials
with open("credentials.json", "r") as f:
    creds = json.load(f)
    username = creds["truckerpath"]["username"]
    password = creds["truckerpath"]["password"]

print(f"Username: {username}")
print(f"Password: {password}")

# Запускаем браузер
chrome_options = Options()
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument('--window-size=1920,1080')

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

try:
    print("\n🔐 Открываем страницу логина...")
    driver.get("https://loadboard.truckerpath.com/carrier/sign-in")
    time.sleep(10)
    
    print("\n📋 Анализ страницы...")
    
    # Ищем все input поля
    inputs = driver.find_elements(By.TAG_NAME, "input")
    print(f"\nНайдено input полей: {len(inputs)}")
    
    for i, inp in enumerate(inputs, 1):
        print(f"\n{i}. INPUT:")
        print(f"   id: {inp.get_attribute('id')}")
        print(f"   name: {inp.get_attribute('name')}")
        print(f"   type: {inp.get_attribute('type')}")
        print(f"   visible: {inp.is_displayed()}")
        print(f"   enabled: {inp.is_enabled()}")
    
    # Сохраняем скриншот
    driver.save_screenshot("login_page.png")
    print("\n📸 Скриншот сохранен: login_page.png")
    
    # Сохраняем HTML
    with open("login_page.html", "w", encoding="utf-8") as f:
        f.write(driver.page_source)
    print("📄 HTML сохранен: login_page.html")
    
    print("\n⏳ Браузер закроется через 30 секунд...")
    print("👀 Посмотрите на страницу логина!")
    time.sleep(30)
    
finally:
    driver.quit()
