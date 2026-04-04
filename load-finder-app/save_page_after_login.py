"""
Сохраняет HTML и скриншот страницы после логина
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
import json

# Загружаем credentials
with open("credentials.json", "r") as f:
    credentials = json.load(f).get("truckerpath", {})

# Запускаем браузер
chrome_options = Options()
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument('--window-size=1920,1080')

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

try:
    print("🔐 Логин...")
    driver.delete_all_cookies()
    driver.get("https://loadboard.truckerpath.com/carrier/loads/home")
    time.sleep(2)
    
    # Нажимаем Log In
    login_btn = driver.find_element(By.XPATH, "//*[contains(text(), 'Log In')]")
    login_btn.click()
    time.sleep(2)
    
    # Заполняем форму
    email_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "input[placeholder='Email address']"))
    )
    email_input.send_keys(credentials['username'])
    
    password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
    password_input.send_keys(credentials['password'])
    time.sleep(1)
    
    # Нажимаем Sign In
    signin_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button.tlant-btn-primary"))
    )
    signin_btn.click()
    time.sleep(5)
    
    print("✅ Залогинены!")
    print(f"URL: {driver.current_url}")
    
    # Сохраняем HTML
    html = driver.page_source
    with open("page_after_login.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("✅ HTML сохранен: page_after_login.html")
    
    # Сохраняем скриншот
    driver.save_screenshot("page_after_login.png")
    print("✅ Скриншот сохранен: page_after_login.png")
    
    print("\n⏸️  Браузер останется открытым 30 секунд...")
    time.sleep(30)
    
finally:
    driver.quit()
