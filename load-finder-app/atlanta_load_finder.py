"""
Находит первый груз из Atlanta, GA и показывает контакты брокера
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
from selenium.webdriver.common.keys import Keys
import time
import json
import re

# Загружаем credentials
with open("credentials.json", "r") as f:
    creds = json.load(f)
    credentials = creds.get("truckerpath", {})

print("="*70)
print("🚛 ПОИСК ГРУЗА ИЗ ATLANTA, GA С КОНТАКТАМИ БРОКЕРА")
print("="*70)

# Инициализация браузера (HEADLESS - невидимый режим)
chrome_options = Options()
chrome_options.add_argument('--headless=new')  # Невидимый режим
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument('--window-size=1920,1080')
chrome_options.add_argument('--disable-gpu')

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

try:
    # ========== ЛОГИН ==========
    print("\n🔐 Вход в TruckerPath Loadboard...")
    
    driver.delete_all_cookies()
    driver.get("https://loadboard.truckerpath.com/carrier/loads/home")
    time.sleep(1.5)
    
    # Нажимаем Log In
    print("   🔘 Ищем кнопку 'Log In'...")
    login_button_found = False
    
    try:
        login_buttons = driver.find_elements(By.XPATH, "//*[contains(text(), 'Log In') or contains(text(), 'LOG IN') or contains(text(), 'Sign In')]")
        for btn in login_buttons:
            if btn.is_displayed():
                driver.execute_script("arguments[0].scrollIntoView(true);", btn)
                time.sleep(1)
                driver.execute_script("arguments[0].click();", btn)
                print("   ✅ Кнопка 'Log In' нажата!")
                login_button_found = True
                break
    except:
        pass
    
    if not login_button_found:
        try:
            login_divs = driver.find_elements(By.XPATH, "//div[contains(text(), 'Log In')]")
            for div in login_divs:
                if div.is_displayed():
                    driver.execute_script("arguments[0].scrollIntoView(true);", div)
                    time.sleep(1)
                    driver.execute_script("arguments[0].click();", div)
                    print("   ✅ Div 'Log In' нажат!")
                    login_button_found = True
                    break
        except:
            pass
    
    # Ждем модальное окно
    print("   ⏳ Ожидаем модальное окно логина...")
    try:
        email_input = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[placeholder='Email address'], input[type='email'], input[id*='email']"))
        )
        print("   ✅ Модальное окно появилось!")
    except:
        email_input = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.ID, "sign-in_email"))
        )
        print("   ✅ Форма логина появилась!")
    
    time.sleep(2)
    
    # Заполняем Email
    driver.execute_script("arguments[0].scrollIntoView(true);", email_input)
    email_input.clear()
    email_input.click()
    email_input.send_keys(credentials['username'])
    print(f"   ✅ Email: {credentials['username']}")
    
    # Заполняем Password
    try:
        password_input = driver.find_element(By.ID, "sign-in_password")
    except:
        password_input = driver.find_element(By.CSS_SELECTOR, "input[placeholder='Password'], input[type='password']")
    
    password_input.clear()
    password_input.click()
    password_input.send_keys(credentials['password'])
    print(f"   ✅ Password: ***")
    
    time.sleep(0.8)
    
    # Нажимаем SIGN IN
    print("   🔘 Нажимаем кнопку 'SIGN IN'...")
    signin_found = False
    
    try:
        signin_btn = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "button.tlant-btn-primary"))
        )
        signin_btn.click()
        print("   ✅ Кнопка 'SIGN IN' нажата!")
        signin_found = True
    except:
        pass
    
    if not signin_found:
        try:
            signin_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'SIGN IN') or contains(text(), 'Sign In')]")
            for btn in signin_buttons:
                btn_text = btn.text.strip().upper()
                if "SIGN IN" in btn_text and "UP" not in btn_text:
                    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
                    time.sleep(1)
                    driver.execute_script("arguments[0].click();", btn)
                    print("   ✅ Кнопка 'SIGN IN' нажата (JS)!")
                    signin_found = True
                    break
        except:
            pass
    
    if not signin_found:
        password_input.send_keys(Keys.RETURN)
        print("   ✅ Нажат Enter!")
    
    time.sleep(5)
    print("✅ Вход выполнен!")
    
    # ========== ПОИСК ATLANTA, GA ==========
    print("\n🔍 Поиск грузов из Atlanta, GA...")
    
    driver.refresh()
    time.sleep(3)
    
    # Ищем поле Pick Up
    print("   📝 Ищем поле Pick Up...")
    pickup_input = None
    
    try:
        pickup_input = driver.find_element(By.CSS_SELECTOR, "input[placeholder*='Pick Up']")
    except:
        pass
    
    if not pickup_input:
        try:
            pickup_input = driver.find_element(By.CSS_SELECTOR, "input[id*='pick'], input[name*='pick']")
        except:
            pass
    
    if not pickup_input:
        inputs = driver.find_elements(By.TAG_NAME, "input")
        for inp in inputs:
            placeholder = inp.get_attribute('placeholder') or ''
            if 'pick' in placeholder.lower():
                pickup_input = inp
                break
    
    if pickup_input:
        pickup_input.click()
        time.sleep(0.5)
        pickup_input.clear()
        pickup_input.send_keys("Atlanta, GA")
        print("   ✅ Pick Up: Atlanta, GA")
        time.sleep(1.5)
        pickup_input.send_keys(Keys.RETURN)
        time.sleep(1)
    
    # Нажимаем SEARCH
    print("   🔘 Ищем кнопку SEARCH...")
    search_btn = None
    
    try:
        search_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'SEARCH') or contains(text(), 'Search')]")
    except:
        buttons = driver.find_elements(By.TAG_NAME, "button")
        for btn in buttons:
            if 'search' in btn.text.lower():
                search_btn = btn
                break
    
    if search_btn:
        search_btn.click()
        print("   ✅ Кнопка SEARCH нажата!")
        time.sleep(5)
    
    driver.save_screenshot("atlanta_search_results.png")
    print("   📸 Скриншот: atlanta_search_results.png")
    
    # ========== КЛИК НА ПЕРВЫЙ ГРУЗ ==========
    print("\n🖱️ Ищем первый груз из Atlanta, GA...")
    
    # Находим все строки таблицы
    rows = driver.find_elements(By.CSS_SELECTOR, "tr, div[role='row'], [class*='row']")
    
    first_atlanta_row = None
    for row in rows:
        try:
            text = row.text
            if 'Atlanta' in text and 'GA' in text:
                print(f"   ✅ Найден груз: {text[:100]}...")
                first_atlanta_row = row
                break
        except:
            continue
    
    if not first_atlanta_row:
        print("❌ Груз из Atlanta не найден!")
        
        # Показываем весь текст страницы
        page_text = driver.find_element(By.TAG_NAME, "body").text
        with open("no_atlanta_text.txt", "w", encoding="utf-8") as f:
            f.write(page_text)
        print("   📄 Текст страницы: no_atlanta_text.txt")
        
    else:
        # КЛИКАЕМ НА ГРУЗ
        print("\n🖱️ Кликаем на груз...")
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", first_atlanta_row)
        time.sleep(1)
        driver.execute_script("arguments[0].click();", first_atlanta_row)
        time.sleep(3)
        
        driver.save_screenshot("atlanta_after_click.png")
        print("   📸 Скриншот после клика: atlanta_after_click.png")
        
        # ========== ИЗВЛЕКАЕМ ДЕТАЛИ ==========
        print("\n📋 Извлекаем детали груза...")
        
        # Получаем весь текст страницы
        page_text = driver.find_element(By.TAG_NAME, "body").text
        
        with open("atlanta_load_details.txt", "w", encoding="utf-8") as f:
            f.write(page_text)
        print("   💾 Текст сохранен: atlanta_load_details.txt")
        
        # Парсим контакты
        details = {}
        
        # Телефон (разные форматы)
        phone_patterns = [
            r'(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})',  # 555-123-4567 или 555.123.4567
            r'\((\d{3})\)\s*(\d{3})[-.\s]?(\d{4})',  # (555) 123-4567
            r'(\d{10})',  # 5551234567
        ]
        
        for pattern in phone_patterns:
            phone_match = re.search(pattern, page_text)
            if phone_match:
                details['phone'] = phone_match.group(0)
                break
        
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
        
        # Маршрут (origin → destination) - улучшенный парсинг
        # Ищем паттерн: City, ST to City, ST или City, ST → City, ST
        route_patterns = [
            r'([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})\s+to\s+([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})',
            r'([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})\s*→\s*([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})',
            r'([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})\s*-\s*([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})',
        ]
        
        for pattern in route_patterns:
            route_match = re.search(pattern, page_text)
            if route_match:
                details['origin'] = route_match.group(1).strip()
                details['destination'] = route_match.group(2).strip()
                break
        
        # Если не нашли маршрут, ищем отдельно origin и destination в тексте
        if 'origin' not in details:
            # Ищем все города с штатами
            cities = re.findall(r'([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})', page_text)
            if len(cities) >= 2:
                details['origin'] = cities[0].strip()
                details['destination'] = cities[1].strip()
        
        # Broker name
        broker_keywords = ['LLC', 'Inc', 'Corp', 'Logistics', 'Transport', 'Freight']
        lines = page_text.split('\n')
        for line in lines:
            for keyword in broker_keywords:
                if keyword in line and len(line) < 100 and len(line) > 5:
                    details['broker'] = line.strip()
                    break
            if 'broker' in details:
                break
        
        # Сохраняем в JSON
        with open("atlanta_load.json", "w", encoding="utf-8") as f:
            json.dump(details, f, indent=2, ensure_ascii=False)
        
        # ========== ПОКАЗЫВАЕМ РЕЗУЛЬТАТ ==========
        print("\n" + "="*70)
        print("✅ ИНФОРМАЦИЯ О ГРУЗЕ ИЗ ATLANTA, GA:")
        print("="*70)
        print(f"📍 Маршрут: {details.get('origin', 'N/A')} → {details.get('destination', 'N/A')}")
        print(f"💰 Ставка: {details.get('rate', 'НЕ НАЙДЕНА')}")
        print(f"📏 Расстояние: {details.get('distance', 'НЕ НАЙДЕНО')}")
        print(f"⚖️ Вес: {details.get('weight', 'НЕ НАЙДЕН')}")
        print(f"🏢 Брокер: {details.get('broker', 'НЕ НАЙДЕН')}")
        print(f"\n📞 ТЕЛЕФОН: {details.get('phone', '❌ НЕ НАЙДЕН')}")
        print(f"📧 EMAIL: {details.get('email', '❌ НЕ НАЙДЕН')}")
        print("="*70)
        print("\n💾 Результат сохранен: atlanta_load.json")
    
    print("\n⏳ Закрываем браузер...")
    time.sleep(2)
    
except Exception as e:
    print(f"\n❌ ОШИБКА: {e}")
    import traceback
    traceback.print_exc()
    try:
        driver.save_screenshot("atlanta_error.png")
        print("   📸 Скриншот ошибки: atlanta_error.png")
    except:
        pass

finally:
    driver.quit()
    print("✅ Браузер закрыт")
