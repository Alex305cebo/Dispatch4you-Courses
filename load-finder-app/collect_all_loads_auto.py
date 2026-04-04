"""
Сбор информации по ВСЕМ грузам из списка по очереди
При достижении лимита - автоматически создает новый аккаунт и продолжает
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
import random
import string

# Получаем город из аргументов
if len(sys.argv) < 2:
    print("❌ Укажите город!")
    print("Использование: python collect_all_loads_auto.py \"City, ST\"")
    print("Пример: python collect_all_loads_auto.py \"Chicago, IL\"")
    sys.exit(1)

search_city = sys.argv[1]
city_name = search_city.split(',')[0].strip()
city_safe = city_name.lower().replace(' ', '_')

all_loads = []  # Список всех грузов
accounts_used = []  # Список использованных аккаунтов

def generate_random_name():
    """Генерирует случайное имя"""
    first_names = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles']
    last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']
    return random.choice(first_names), random.choice(last_names)

def generate_random_phone():
    """Генерирует случайный телефон"""
    return f"555{random.randint(1000000, 9999999)}"

def generate_random_password():
    """Генерирует случайный пароль"""
    chars = string.ascii_letters + string.digits
    password = ''.join(random.choice(chars) for _ in range(10))
    # Добавляем спецсимволы для надежности
    password += random.choice('!@#$')
    password += random.choice(string.ascii_uppercase)
    password += random.choice(string.ascii_lowercase)
    password += random.choice(string.digits)
    return password

def get_temp_email(driver):
    """Получает временный email с temp-mail.org"""
    print("   📧 Получаем временный email...")
    
    # Открываем temp-mail.org в новой вкладке
    driver.execute_script("window.open('https://temp-mail.org/en/', '_blank');")
    driver.switch_to.window(driver.window_handles[-1])
    time.sleep(3)
    
    try:
        # Ищем email на странице
        email_input = driver.find_element(By.ID, "mail")
        temp_email = email_input.get_attribute('value')
        
        if temp_email and '@' in temp_email:
            print(f"   ✅ Email получен: {temp_email}")
            # Закрываем вкладку temp-mail
            driver.close()
            driver.switch_to.window(driver.window_handles[0])
            return temp_email
    except:
        pass
    
    # Если не получилось, закрываем вкладку и возвращаем None
    driver.close()
    driver.switch_to.window(driver.window_handles[0])
    return None

def register_new_account(driver):
    """Регистрирует новый аккаунт на TruckerPath"""
    print("\n🆕 СОЗДАНИЕ НОВОГО АККАУНТА...")
    
    # Генерируем данные
    first_name, last_name = generate_random_name()
    phone = generate_random_phone()
    password = generate_random_password()
    
    # Получаем временный email
    temp_email = get_temp_email(driver)
    
    if not temp_email:
        print("   ❌ Не удалось получить временный email")
        return None
    
    print(f"   👤 Имя: {first_name} {last_name}")
    print(f"   📞 Телефон: {phone}")
    print(f"   🔑 Пароль: {password}")
    
    try:
        # Переходим на страницу регистрации
        driver.get("https://loadboard.truckerpath.com/carrier/loads/home")
        time.sleep(2)
        
        # Нажимаем Sign Up
        signup_buttons = driver.find_elements(By.XPATH, "//*[contains(text(), 'Sign Up') or contains(text(), 'SIGN UP')]")
        for btn in signup_buttons:
            if btn.is_displayed():
                driver.execute_script("arguments[0].click();", btn)
                break
        
        time.sleep(2)
        
        # Заполняем форму регистрации
        try:
            # First Name
            first_name_input = driver.find_element(By.CSS_SELECTOR, "input[placeholder*='First'], input[name*='first'], input[id*='first']")
            first_name_input.clear()
            first_name_input.send_keys(first_name)
            
            # Last Name
            last_name_input = driver.find_element(By.CSS_SELECTOR, "input[placeholder*='Last'], input[name*='last'], input[id*='last']")
            last_name_input.clear()
            last_name_input.send_keys(last_name)
            
            # Email
            email_input = driver.find_element(By.CSS_SELECTOR, "input[type='email'], input[placeholder*='Email']")
            email_input.clear()
            email_input.send_keys(temp_email)
            
            # Phone
            phone_input = driver.find_element(By.CSS_SELECTOR, "input[type='tel'], input[placeholder*='Phone']")
            phone_input.clear()
            phone_input.send_keys(phone)
            
            # Password
            password_inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='password']")
            if len(password_inputs) >= 1:
                password_inputs[0].clear()
                password_inputs[0].send_keys(password)
            
            time.sleep(1)
            
            # Нажимаем кнопку регистрации
            register_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Sign Up') or contains(text(), 'Register') or contains(text(), 'Create')]")
            register_btn.click()
            
            time.sleep(5)
            
            # Сохраняем credentials
            new_account = {
                'username': temp_email,
                'password': password,
                'first_name': first_name,
                'last_name': last_name,
                'phone': phone
            }
            
            # Добавляем в список использованных
            accounts_used.append(new_account)
            
            # Сохраняем в credentials.json
            try:
                with open("credentials.json", "r") as f:
                    creds = json.load(f)
            except:
                creds = {}
            
            creds['truckerpath'] = new_account
            
            with open("credentials.json", "w") as f:
                json.dump(creds, f, indent=2)
            
            print(f"   ✅ Аккаунт создан и сохранен!")
            return new_account
            
        except Exception as e:
            print(f"   ❌ Ошибка заполнения формы: {e}")
            return None
            
    except Exception as e:
        print(f"   ❌ Ошибка регистрации: {e}")
        return None

def login_account(driver, credentials):
    """Логинится с указанными credentials"""
    print(f"\n🔐 Вход с аккаунтом: {credentials['username']}")
    
    try:
        driver.get("https://loadboard.truckerpath.com/carrier/loads/home")
        time.sleep(2)
        
        # Нажимаем Log In
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
        
        # Заполняем форму
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
        print("   ✅ Вход выполнен!")
        return True
        
    except Exception as e:
        print(f"   ❌ Ошибка входа: {e}")
        return False

def check_for_limit(driver):
    """Проверяет появилось ли сообщение о лимите"""
    try:
        page_text = driver.find_element(By.TAG_NAME, "body").text
        
        # Ищем "Daily Limit Reached" или похожие сообщения
        if 'Daily Limit Reached' in page_text or 'Daily free load views left: 0' in page_text:
            return True
        
        # Ищем кнопку UPGRADE NOW
        upgrade_buttons = driver.find_elements(By.XPATH, "//*[contains(text(), 'UPGRADE NOW')]")
        if upgrade_buttons:
            return True
            
        return False
    except:
        return False

def perform_search(driver, search_city):
    """Выполняет поиск грузов"""
    print(f"\n🔍 Поиск грузов из {search_city}...")
    
    driver.refresh()
    time.sleep(3)
    
    # Ищем поле Pick Up
    pickup_input = None
    
    try:
        pickup_input = driver.find_element(By.CSS_SELECTOR, "input[placeholder*='Pick Up']")
    except:
        inputs = driver.find_elements(By.TAG_NAME, "input")
        for inp in inputs:
            placeholder = inp.get_attribute('placeholder') or ''
            aria_label = inp.get_attribute('aria-label') or ''
            input_id = inp.get_attribute('id') or ''
            
            if 'pick' in placeholder.lower() or 'pick' in aria_label.lower() or 'pick' in input_id.lower():
                if 'date' not in placeholder.lower() and 'date' not in aria_label.lower():
                    pickup_input = inp
                    break
    
    if pickup_input:
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", pickup_input)
        time.sleep(1)
        pickup_input.click()
        time.sleep(1)
        pickup_input.clear()
        time.sleep(0.5)
        pickup_input.send_keys(search_city)
        print(f"   ✅ Введено: {search_city}")
        time.sleep(2)
        pickup_input.send_keys(Keys.RETURN)
        time.sleep(1)
    
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

print("="*70)
print(f"🚛 АВТОМАТИЧЕСКИЙ СБОР ВСЕХ ГРУЗОВ ИЗ {search_city.upper()}")
print("="*70)

# Инициализация браузера
chrome_options = Options()
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument('--window-size=1920,1080')
chrome_options.add_argument('--start-maximized')

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

try:
    # Загружаем текущие credentials
    try:
        with open("credentials.json", "r") as f:
            creds = json.load(f)
            current_credentials = creds.get("truckerpath", {})
    except:
        current_credentials = None
    
    # Если нет credentials, создаем новый аккаунт
    if not current_credentials:
        current_credentials = register_new_account(driver)
        if not current_credentials:
            print("❌ Не удалось создать первый аккаунт")
            sys.exit(1)
    
    # Логинимся
    if not login_account(driver, current_credentials):
        print("❌ Не удалось войти")
        sys.exit(1)
    
    # Выполняем поиск
    perform_search(driver, search_city)
    
    # ========== СБОР ВСЕХ ГРУЗОВ ==========
    print(f"\n📦 Начинаем сбор грузов по очереди...")
    
    load_index = 0
    
    while True:
        load_index += 1
        print(f"\n{'='*70}")
        print(f"🔍 ГРУЗ #{load_index}")
        print(f"{'='*70}")
        
        # Проверяем лимит ПЕРЕД кликом
        if check_for_limit(driver):
            print(f"\n⚠️ ДОСТИГНУТ ЛИМИТ! Создаем новый аккаунт...")
            
            # Создаем новый аккаунт
            new_credentials = register_new_account(driver)
            if not new_credentials:
                print("❌ Не удалось создать новый аккаунт. Останавливаемся.")
                break
            
            # Логинимся новым аккаунтом
            if not login_account(driver, new_credentials):
                print("❌ Не удалось войти с новым аккаунтом. Останавливаемся.")
                break
            
            # Выполняем поиск заново
            perform_search(driver, search_city)
            
            current_credentials = new_credentials
        
        # Ищем все строки таблицы
        time.sleep(3)
        
        rows = []
        
        try:
            rows = driver.find_elements(By.CSS_SELECTOR, "table tbody tr")
            if len(rows) > 1:
                print(f"   📊 Найдено строк: {len(rows)}")
        except:
            pass
        
        if len(rows) <= 1:
            try:
                rows = driver.find_elements(By.CSS_SELECTOR, "div[role='row']")
                if len(rows) > 0:
                    print(f"   📊 Найдено строк: {len(rows)}")
            except:
                pass
        
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
            except:
                pass
        
        # Фильтруем строки с ценой
        valid_rows = []
        for row in rows:
            try:
                text = row.text
                if len(text) > 30 and '$' in text:
                    valid_rows.append(row)
            except:
                continue
        
        print(f"   ✅ Валидных грузов: {len(valid_rows)}")
        
        # Проверяем есть ли груз с нужным индексом
        if load_index > len(valid_rows):
            print(f"\n✅ Все грузы собраны! Всего: {len(all_loads)}")
            break
        
        # Берем груз по индексу
        target_row = valid_rows[load_index - 1]
        
        try:
            row_text = target_row.text[:100]
            print(f"   🎯 Кликаем на груз: {row_text}...")
        except:
            print(f"   🎯 Кликаем на груз #{load_index}...")
        
        # КЛИКАЕМ
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", target_row)
        time.sleep(1)
        driver.execute_script("arguments[0].click();", target_row)
        time.sleep(3)
        
        # Проверяем лимит ПОСЛЕ клика
        if check_for_limit(driver):
            print(f"\n⚠️ ДОСТИГНУТ ЛИМИТ после клика! Создаем новый аккаунт...")
            
            # Не засчитываем этот груз, уменьшаем индекс
            load_index -= 1
            
            # Создаем новый аккаунт
            new_credentials = register_new_account(driver)
            if not new_credentials:
                print("❌ Не удалось создать новый аккаунт. Останавливаемся.")
                break
            
            # Логинимся
            if not login_account(driver, new_credentials):
                print("❌ Не удалось войти с новым аккаунтом. Останавливаемся.")
                break
            
            # Выполняем поиск заново
            perform_search(driver, search_city)
            
            current_credentials = new_credentials
            continue
        
        # ========== ИЗВЛЕКАЕМ ДЕТАЛИ ==========
        print("   📋 Извлекаем детали...")
        
        time.sleep(2)
        
        page_text = driver.find_element(By.TAG_NAME, "body").text
        
        details = {
            'load_number': load_index,
            'search_city': search_city,
            'account_used': current_credentials['username']
        }
        
        # Телефон
        phone_matches = re.findall(r'(\d{10,11})', page_text)
        for phone in phone_matches:
            phone_pos = page_text.find(phone)
            context_start = max(0, phone_pos - 50)
            context_end = min(len(page_text), phone_pos + len(phone) + 50)
            context = page_text[context_start:context_end]
            
            if 'Unlock' not in context and 'unlock' not in context.lower():
                details['phone'] = phone
                print(f"      📞 Телефон: {phone}")
                break
        
        # Email
        email_matches = re.findall(r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', page_text)
        for email in email_matches:
            email_pos = page_text.find(email)
            context_start = max(0, email_pos - 50)
            context_end = min(len(page_text), email_pos + len(email) + 50)
            context = page_text[context_start:context_end]
            
            if 'Unlock' not in context and 'unlock' not in context.lower():
                details['email'] = email
                print(f"      📧 Email: {email}")
                break
        
        # Цена
        price_match = re.search(r'\$(\d+,?\d+)', page_text)
        if price_match:
            details['rate'] = '$' + price_match.group(1)
            print(f"      💰 Ставка: {details['rate']}")
        
        # Расстояние
        distance_match = re.search(r'(\d+,?\d*)\s*mi', page_text)
        if distance_match:
            details['distance'] = distance_match.group(0)
            print(f"      📏 Расстояние: {details['distance']}")
        
        # Вес
        weight_match = re.search(r'(\d+,?\d+)\s*lbs', page_text)
        if weight_match:
            details['weight'] = weight_match.group(0)
            print(f"      ⚖️ Вес: {details['weight']}")
        
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
                print(f"      📍 Маршрут: {details['origin']} → {details['destination']}")
                break
        
        if 'origin' not in details:
            cities = re.findall(r'([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})', page_text)
            if len(cities) >= 2:
                details['origin'] = cities[0].strip()
                details['destination'] = cities[1].strip()
                print(f"      📍 Маршрут: {details['origin']} → {details['destination']}")
        
        # Broker
        broker_keywords = ['LLC', 'Inc', 'Corp', 'Logistics', 'Transport', 'Freight']
        lines = page_text.split('\n')
        for line in lines:
            for keyword in broker_keywords:
                if keyword in line and len(line) < 100 and len(line) > 5:
                    details['broker'] = line.strip()
                    print(f"      🏢 Брокер: {details['broker']}")
                    break
            if 'broker' in details:
                break
        
        # Добавляем груз в список
        all_loads.append(details)
        print(f"   ✅ Груз #{load_index} сохранен")
        
        time.sleep(1)
    
    # ========== СОХРАНЯЕМ ВСЕ ГРУЗЫ ==========
    output_file = f"{city_safe}_all_loads_auto.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(all_loads, f, indent=2, ensure_ascii=False)
    
    # Сохраняем список использованных аккаунтов
    accounts_file = f"{city_safe}_accounts_used.json"
    with open(accounts_file, "w", encoding="utf-8") as f:
        json.dump(accounts_used, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*70}")
    print(f"✅ СБОР ЗАВЕРШЕН!")
    print(f"{'='*70}")
    print(f"📦 Всего собрано грузов: {len(all_loads)}")
    print(f"👥 Использовано аккаунтов: {len(accounts_used) + 1}")
    print(f"💾 Результат сохранен: {output_file}")
    print(f"💾 Аккаунты сохранены: {accounts_file}")
    print(f"{'='*70}")
    
    # Статистика
    loads_with_phone = sum(1 for load in all_loads if 'phone' in load)
    loads_with_email = sum(1 for load in all_loads if 'email' in load)
    loads_with_both = sum(1 for load in all_loads if 'phone' in load and 'email' in load)
    
    print(f"\n📊 Статистика:")
    print(f"   📞 С телефоном: {loads_with_phone}")
    print(f"   📧 С email: {loads_with_email}")
    print(f"   ✅ С обоими контактами: {loads_with_both}")
    
    print("\n⏳ Закрываем браузер через 5 секунд...")
    time.sleep(5)
    
except Exception as e:
    print(f"\n❌ ОШИБКА: {e}")
    import traceback
    traceback.print_exc()
    
    # Сохраняем то что успели собрать
    if all_loads:
        output_file = f"{city_safe}_all_loads_partial.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(all_loads, f, indent=2, ensure_ascii=False)
        print(f"\n💾 Частичный результат сохранен: {output_file}")
        print(f"📦 Собрано грузов: {len(all_loads)}")

finally:
    driver.quit()
    print("✅ Браузер закрыт")
