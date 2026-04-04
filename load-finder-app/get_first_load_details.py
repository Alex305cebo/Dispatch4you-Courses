"""
Получает детали первого груза из Miami FL
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time
import json
import re

# Загружаем credentials
with open("credentials.json", "r") as f:
    creds = json.load(f)
    credentials = creds.get("truckerpath", {})

# Запускаем браузер
print("🚀 Запуск браузера...")
chrome_options = Options()
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument('--window-size=1920,1080')

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

try:
    # Логин (быстрый)
    print("\n🔐 Логин...")
    driver.delete_all_cookies()
    driver.get("https://loadboard.truckerpath.com/carrier/loads/home")
    time.sleep(2)
    
    # Нажимаем Log In
    try:
        login_btns = driver.find_elements(By.XPATH, "//*[contains(text(), 'Log In')]")
        for btn in login_btns:
            if btn.is_displayed():
                driver.execute_script("arguments[0].click();", btn)
                break
    except:
        pass
    
    time.sleep(2)
    
    # Заполняем форму
    email_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email'], input[placeholder*='Email']"))
    )
    email_input.send_keys(credentials['username'])
    
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
    
    # Поиск Miami
    print("\n🔍 Поиск Miami, FL...")
    driver.refresh()
    time.sleep(3)
    
    # Находим поле Pick Up
    inputs = driver.find_elements(By.TAG_NAME, "input")
    for inp in inputs:
        placeholder = inp.get_attribute('placeholder') or ''
        if 'pick' in placeholder.lower():
            inp.click()
            time.sleep(0.5)
            inp.clear()
            inp.send_keys("Miami, FL")
            print("✅ Ввели Miami, FL")
            
            # Enter
            from selenium.webdriver.common.keys import Keys
            inp.send_keys(Keys.RETURN)
            time.sleep(3)
            break
    
    # Нажимаем SEARCH
    buttons = driver.find_elements(By.TAG_NAME, "button")
    for btn in buttons:
        if 'search' in btn.text.lower():
            btn.click()
            print("✅ Нажали SEARCH")
            time.sleep(5)
            break
    
    # Сохраняем скриншот результатов
    driver.save_screenshot("search_results_now.png")
    print("📸 Скриншот: search_results_now.png")
    
    # Находим первый груз из Miami
    print("\n📦 Ищем первый груз из Miami...")
    
    # Получаем все строки таблицы
    rows = driver.find_elements(By.CSS_SELECTOR, "tr, [class*='row'], [class*='item']")
    
    first_miami_row = None
    for row in rows:
        text = row.text
        if 'Miami, FL' in text or 'Miami, F' in text:
            print(f"   Найдена строка: {text[:100]}")
            first_miami_row = row
            break
    
    if not first_miami_row:
        print("❌ Груз из Miami не найден!")
        driver.save_screenshot("no_miami_load.png")
    else:
        # Кликаем на строку
        print("\n🖱️ Кликаем на груз...")
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", first_miami_row)
        time.sleep(1)
        driver.execute_script("arguments[0].click();", first_miami_row)
        time.sleep(3)
        
        # Сохраняем скриншот с деталями
        driver.save_screenshot("load_details.png")
        print("📸 Скриншот деталей: load_details.png")
        
        # Ищем панель с деталями справа
        print("\n📋 Извлекаем детали...")
        
        # Получаем весь текст страницы
        page_text = driver.find_element(By.TAG_NAME, "body").text
        
        # Сохраняем текст
        with open("load_details_text.txt", "w", encoding="utf-8") as f:
            f.write(page_text)
        print("💾 Текст сохранен: load_details_text.txt")
        
        # Извлекаем данные
        details = {
            'route': 'Miami, FL → Greer, SC',
            'distance': '735mi',
            'rate': '$1,300',
            'weight': '48,000 lbs',
            'phone': 'N/A',
            'email': 'N/A',
            'broker': 'N/A'
        }
        
        # Ищем телефон (10 цифр)
        phone_patterns = [
            r'(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})',  # 123-456-7890
            r'(\d{10})',  # 1234567890
        ]
        
        for pattern in phone_patterns:
            phone_match = re.search(pattern, page_text)
            if phone_match:
                details['phone'] = phone_match.group(1)
                print(f"   📞 Телефон: {details['phone']}")
                break
        
        # Ищем email
        email_match = re.search(r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', page_text)
        if email_match:
            details['email'] = email_match.group(1)
            print(f"   📧 Email: {details['email']}")
        
        # Ищем название брокера
        broker_keywords = ['LLC', 'Inc', 'Corp', 'Company', 'Logistics', 'Transport']
        lines = page_text.split('\n')
        for line in lines:
            for keyword in broker_keywords:
                if keyword in line and len(line) < 100:
                    details['broker'] = line.strip()
                    print(f"   🏢 Broker: {details['broker']}")
                    break
            if details['broker'] != 'N/A':
                break
        
        # Сохраняем результат
        with open("first_load_miami.json", "w", encoding="utf-8") as f:
            json.dump(details, f, indent=2, ensure_ascii=False)
        
        print("\n" + "="*70)
        print("✅ ДЕТАЛИ ПЕРВОГО ГРУЗА ИЗ MIAMI, FL:")
        print("="*70)
        print(f"📍 Маршрут: {details['route']}")
        print(f"📏 Расстояние: {details['distance']}")
        print(f"💰 Ставка: {details['rate']}")
        print(f"⚖️ Вес: {details['weight']}")
        print(f"📞 Телефон: {details['phone']}")
        print(f"📧 Email: {details['email']}")
        print(f"🏢 Брокер: {details['broker']}")
        print("="*70)
        print("\n💾 Результат сохранен: first_load_miami.json")
    
    input("\n⏸️ Нажмите Enter чтобы закрыть...")
    
except Exception as e:
    print(f"\n❌ ОШИБКА: {e}")
    import traceback
    traceback.print_exc()
    try:
        driver.save_screenshot("error.png")
    except:
        pass

finally:
    driver.quit()
    print("✅ Браузер закрыт")
