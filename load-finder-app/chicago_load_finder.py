"""
Поиск груза из Chicago, IL - браузер остается открытым
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

search_city = "Chicago, IL"

# Загружаем credentials
with open("credentials.json", "r") as f:
    creds = json.load(f)
    credentials = creds.get("truckerpath", {})

print("="*70)
print(f"🚛 ПОИСК ГРУЗА ИЗ {search_city.upper()}")
print("="*70)

# Инициализация браузера (ВИДИМЫЙ РЕЖИМ)
chrome_options = Options()
# НЕ используем headless - браузер будет видимым
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument('--window-size=1920,1080')
chrome_options.add_argument('--start-maximized')

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

try:
    # ========== ЛОГИН ==========
    print("\n🔐 Вход в TruckerPath Loadboard...")
    
    driver.delete_all_cookies()
    driver.get("https://loadboard.truckerpath.com/carrier/loads/home")
    time.sleep(2)
    
    # Нажимаем Log In
    print("   🔘 Нажимаем кнопку Log In...")
    login_buttons = driver.find_elements(By.XPATH, "//*[contains(text(), 'Log In') or contains(text(), 'LOG IN')]")
    for btn in login_buttons:
        if btn.is_displayed():
            driver.execute_script("arguments[0].click();", btn)
            break
    
    # Ждем модальное окно
    try:
        email_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[placeholder='Email address'], input[type='email']"))
        )
    except:
        email_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "sign-in_email"))
        )
    
    time.sleep(0.2)
    
    # Заполняем форму БЫСТРО
    email_input.send_keys(credentials['username'])
    
    try:
        password_input = driver.find_element(By.ID, "sign-in_password")
    except:
        password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
    
    password_input.send_keys(credentials['password'])
    time.sleep(0.8)
    
    # Нажимаем SIGN IN
    try:
        signin_btn = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "button.tlant-btn-primary"))
        )
        signin_btn.click()
    except:
        password_input.send_keys(Keys.RETURN)
    
    time.sleep(2)
    print("✅ Вход выполнен!")
    
    # ========== ПОИСК ==========
    print(f"\n🔍 Поиск грузов из {search_city}...")
    
    driver.refresh()
    time.sleep(3)
    
    # Ищем поле Pick Up
    pickup_input = None
    print("   🔍 Ищем поле Pick Up...")
    
    try:
        pickup_input = driver.find_element(By.CSS_SELECTOR, "input[placeholder*='Pick Up']")
        print("   ✅ Найдено поле Pick Up (по placeholder)")
    except:
        inputs = driver.find_elements(By.TAG_NAME, "input")
        for inp in inputs:
            placeholder = inp.get_attribute('placeholder') or ''
            aria_label = inp.get_attribute('aria-label') or ''
            input_id = inp.get_attribute('id') or ''
            
            if 'pick' in placeholder.lower() or 'pick' in aria_label.lower() or 'pick' in input_id.lower():
                if 'date' not in placeholder.lower() and 'date' not in aria_label.lower():
                    pickup_input = inp
                    print(f"   ✅ Найдено поле: placeholder='{placeholder}', id='{input_id}'")
                    break
    
    if pickup_input:
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", pickup_input)
        time.sleep(1)
        pickup_input.click()
        time.sleep(1)
        pickup_input.clear()
        time.sleep(0.5)
        pickup_input.send_keys(search_city)
        print(f"   ✅ Введено в Pick Up: {search_city}")
        time.sleep(2)
        pickup_input.send_keys(Keys.RETURN)
        time.sleep(1)
    else:
        print("   ❌ Поле Pick Up не найдено!")
    
    # Нажимаем SEARCH
    try:
        search_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'SEARCH')]")
    except:
        buttons = driver.find_elements(By.TAG_NAME, "button")
        for btn in buttons:
            if 'search' in btn.text.lower():
                search_btn = btn
                break
    
    if search_btn:
        search_btn.click()
        print("   ⏳ Ждем загрузки результатов...")
        time.sleep(8)
    
    # ========== КЛИК НА ПЕРВЫЙ ГРУЗ ==========
    print(f"\n🖱️ Ищем первый груз из результатов...")
    
    time.sleep(5)
    
    # Ищем строки таблицы - пробуем разные селекторы
    rows = []
    
    # Способ 1: tbody tr
    try:
        rows = driver.find_elements(By.CSS_SELECTOR, "table tbody tr")
        if len(rows) > 1:
            print(f"   📊 Найдено строк таблицы (tbody tr): {len(rows)}")
    except:
        pass
    
    # Способ 2: div role=row
    if len(rows) <= 1:
        try:
            rows = driver.find_elements(By.CSS_SELECTOR, "div[role='row']")
            if len(rows) > 0:
                print(f"   📊 Найдено строк (div role=row): {len(rows)}")
        except:
            pass
    
    # Способ 3: элементы с ценой
    if len(rows) <= 1:
        try:
            price_elements = driver.find_elements(By.XPATH, "//*[contains(text(), '$')]")
            rows = []
            for elem in price_elements:
                parent = elem
                for _ in range(3):
                    parent = parent.find_element(By.XPATH, "..")
                    if parent not in rows and len(parent.text) > 50:
                        rows.append(parent)
                        break
            print(f"   📊 Найдено элементов с ценой: {len(rows)}")
        except Exception as e:
            print(f"   ⚠️ Ошибка поиска по цене: {e}")
    
    first_row = None
    for idx, row in enumerate(rows):
        try:
            text = row.text
            if len(text) > 30 and '$' in text:
                print(f"   ✅ Берем первый груз из результатов: {text[:150]}...")
                first_row = row
                break
        except:
            continue
    
    if not first_row:
        print(f"❌ Грузы не найдены в результатах поиска")
        page_text = driver.find_element(By.TAG_NAME, "body").text
        print(f"Текст страницы (первые 500 символов): {page_text[:500]}")
    else:
        # КЛИКАЕМ
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", first_row)
        time.sleep(1)
        driver.execute_script("arguments[0].click();", first_row)
        print("   ✅ Кликнули на груз, ждем загрузки деталей...")
        time.sleep(3)
        
        # ========== ИЗВЛЕКАЕМ ДЕТАЛИ ==========
        print("\n📋 Извлекаем детали груза...")
        
        # Ждем пока появятся контакты
        max_attempts = 15
        contacts_found = False
        phone_found = None
        email_found = None
        
        for attempt in range(max_attempts):
            page_text = driver.find_element(By.TAG_NAME, "body").text
            
            # Ищем телефон
            phone_matches = re.findall(r'(\d{10,11})', page_text)
            for phone in phone_matches:
                phone_pos = page_text.find(phone)
                context_start = max(0, phone_pos - 50)
                context_end = min(len(page_text), phone_pos + len(phone) + 50)
                context = page_text[context_start:context_end]
                
                if 'Unlock' not in context and 'unlock' not in context.lower():
                    phone_found = phone
                    break
            
            # Ищем email
            email_matches = re.findall(r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', page_text)
            for email in email_matches:
                email_pos = page_text.find(email)
                context_start = max(0, email_pos - 50)
                context_end = min(len(page_text), email_pos + len(email) + 50)
                context = page_text[context_start:context_end]
                
                if 'Unlock' not in context and 'unlock' not in context.lower():
                    email_found = email
                    break
            
            if phone_found or email_found:
                contacts_found = True
                print(f"   ✅ Контакты найдены на попытке {attempt + 1}")
                if phone_found:
                    print(f"      📞 Телефон: {phone_found}")
                if email_found:
                    print(f"      📧 Email: {email_found}")
                break
            
            print(f"   ⏳ Попытка {attempt + 1}/{max_attempts}: ждем загрузки контактов...")
            time.sleep(2)
        
        if not contacts_found:
            print("   ⚠️ Контакты не найдены или заблокированы (Unlock)")
        
        # Финальный текст
        page_text = driver.find_element(By.TAG_NAME, "body").text
        
        details = {}
        
        if phone_found:
            details['phone'] = phone_found
        
        if email_found:
            details['email'] = email_found
        
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
        
        # Маршрут
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
        
        if 'origin' not in details:
            cities = re.findall(r'([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})', page_text)
            if len(cities) >= 2:
                details['origin'] = cities[0].strip()
                details['destination'] = cities[1].strip()
        
        # Broker
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
        with open("chicago_load.json", "w", encoding="utf-8") as f:
            json.dump(details, f, indent=2, ensure_ascii=False)
        
        # ========== ПОКАЗЫВАЕМ РЕЗУЛЬТАТ ==========
        print("\n" + "="*70)
        print(f"✅ ИНФОРМАЦИЯ О ГРУЗЕ ИЗ {search_city.upper()}:")
        print("="*70)
        print(f"📍 Маршрут: {details.get('origin', 'N/A')} → {details.get('destination', 'N/A')}")
        print(f"💰 Ставка: {details.get('rate', 'НЕ НАЙДЕНА')}")
        print(f"📏 Расстояние: {details.get('distance', 'НЕ НАЙДЕНО')}")
        print(f"⚖️ Вес: {details.get('weight', 'НЕ НАЙДЕН')}")
        print(f"🏢 Брокер: {details.get('broker', 'НЕ НАЙДЕН')}")
        print(f"\n📞 ТЕЛЕФОН: {details.get('phone', '❌ НЕ НАЙДЕН')}")
        print(f"📧 EMAIL: {details.get('email', '❌ НЕ НАЙДЕН')}")
        print("="*70)
        print(f"\n💾 Результат сохранен: chicago_load.json")
    
    print("\n🌐 БРАУЗЕР ОСТАЕТСЯ ОТКРЫТЫМ!")
    print("Нажми Enter чтобы закрыть браузер...")
    input()
    
except Exception as e:
    print(f"\n❌ ОШИБКА: {e}")
    import traceback
    traceback.print_exc()
    print("\nНажми Enter чтобы закрыть браузер...")
    input()

finally:
    driver.quit()
    print("✅ Браузер закрыт")
