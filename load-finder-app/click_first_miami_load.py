"""
Кликает на первый груз из Miami и показывает детали
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.keys import Keys
import time
import json
import re

# Credentials
with open("credentials.json", "r") as f:
    creds = json.load(f)
    credentials = creds.get("truckerpath", {})

print("="*70)
print("🚛 КЛИК НА ПЕРВЫЙ ГРУЗ ИЗ MIAMI, FL")
print("="*70)

# Браузер
chrome_options = Options()
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument('--window-size=1920,1080')

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

try:
    # ЛОГИН
    print("\n🔐 Логин...")
    driver.delete_all_cookies()
    driver.get("https://loadboard.truckerpath.com/carrier/loads/home")
    time.sleep(2)
    
    # Log In button
    login_btns = driver.find_elements(By.XPATH, "//*[contains(text(), 'Log In')]")
    for btn in login_btns:
        if btn.is_displayed():
            driver.execute_script("arguments[0].click();", btn)
            break
    time.sleep(2)
    
    # Email
    email_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email'], input[placeholder*='Email']"))
    )
    email_input.send_keys(credentials['username'])
    
    # Password
    password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
    password_input.send_keys(credentials['password'])
    time.sleep(1)
    
    # Sign In
    signin_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button.tlant-btn-primary"))
    )
    signin_btn.click()
    time.sleep(5)
    print("✅ Залогинились!")
    
    # ПОИСК MIAMI
    print("\n🔍 Поиск Miami, FL...")
    driver.refresh()
    time.sleep(3)
    
    # Pick Up field
    inputs = driver.find_elements(By.TAG_NAME, "input")
    for inp in inputs:
        placeholder = inp.get_attribute('placeholder') or ''
        if 'pick' in placeholder.lower():
            inp.click()
            time.sleep(0.5)
            inp.clear()
            inp.send_keys("Miami, FL")
            inp.send_keys(Keys.RETURN)
            print("✅ Ввели Miami, FL")
            time.sleep(3)
            break
    
    # SEARCH button
    buttons = driver.find_elements(By.TAG_NAME, "button")
    for btn in buttons:
        if 'search' in btn.text.lower():
            btn.click()
            print("✅ Нажали SEARCH")
            time.sleep(5)
            break
    
    # КЛИК НА ПЕРВЫЙ ГРУЗ
    print("\n🖱️ Ищем первый груз из Miami...")
    
    # Находим все строки
    rows = driver.find_elements(By.CSS_SELECTOR, "tr")
    
    first_miami_row = None
    for row in rows:
        text = row.text
        if 'Miami' in text and 'FL' in text:
            print(f"   Найден: {text[:80]}...")
            first_miami_row = row
            break
    
    if not first_miami_row:
        print("❌ Груз из Miami не найден!")
        driver.save_screenshot("no_miami.png")
    else:
        # КЛИКАЕМ
        print("\n🖱️ Кликаем на груз...")
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", first_miami_row)
        time.sleep(1)
        driver.execute_script("arguments[0].click();", first_miami_row)
        time.sleep(3)
        
        driver.save_screenshot("after_click.png")
        print("📸 Скриншот: after_click.png")
        
        # ИЗВЛЕКАЕМ ДЕТАЛИ
        print("\n📋 Извлекаем детали...")
        
        # Весь текст страницы
        page_text = driver.find_element(By.TAG_NAME, "body").text
        
        with open("clicked_load_text.txt", "w", encoding="utf-8") as f:
            f.write(page_text)
        print("💾 Текст: clicked_load_text.txt")
        
        # Парсим
        details = {}
        
        # Телефон
        phone_match = re.search(r'(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})', page_text)
        if phone_match:
            details['phone'] = phone_match.group(1)
        
        # Email
        email_match = re.search(r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', page_text)
        if email_match:
            details['email'] = email_match.group(1)
        
        # Цена
        price_match = re.search(r'\$(\d+,?\d+)', page_text)
        if price_match:
            details['rate'] = '$' + price_match.group(1)
        
        # Расстояние
        distance_match = re.search(r'(\d+,?\d*)\s*mi', page_text)
        if distance_match:
            details['distance'] = distance_match.group(0)
        
        # Вес
        weight_match = re.search(r'(\d+,?\d+)\s*lbs', page_text)
        if weight_match:
            details['weight'] = weight_match.group(0)
        
        # Broker
        broker_keywords = ['LLC', 'Inc', 'Corp', 'Logistics', 'Transport']
        lines = page_text.split('\n')
        for line in lines:
            for keyword in broker_keywords:
                if keyword in line and len(line) < 100:
                    details['broker'] = line.strip()
                    break
            if 'broker' in details:
                break
        
        # Сохраняем
        with open("first_miami_load.json", "w", encoding="utf-8") as f:
            json.dump(details, f, indent=2, ensure_ascii=False)
        
        # ПОКАЗЫВАЕМ
        print("\n" + "="*70)
        print("✅ ИНФОРМАЦИЯ О ПЕРВОМ ГРУЗЕ ИЗ MIAMI, FL:")
        print("="*70)
        print(f"📞 Телефон: {details.get('phone', 'НЕ НАЙДЕН')}")
        print(f"📧 Email: {details.get('email', 'НЕ НАЙДЕН')}")
        print(f"💰 Ставка: {details.get('rate', 'НЕ НАЙДЕНА')}")
        print(f"📏 Расстояние: {details.get('distance', 'НЕ НАЙДЕНО')}")
        print(f"⚖️ Вес: {details.get('weight', 'НЕ НАЙДЕН')}")
        print(f"🏢 Брокер: {details.get('broker', 'НЕ НАЙДЕН')}")
        print("="*70)
        print("\n💾 Результат: first_miami_load.json")
    
    input("\n⏸️ Enter чтобы закрыть...")
    
except Exception as e:
    print(f"\n❌ ОШИБКА: {e}")
    import traceback
    traceback.print_exc()
    try:
        driver.save_screenshot("error_click.png")
    except:
        pass

finally:
    driver.quit()
    print("✅ Браузер закрыт")
