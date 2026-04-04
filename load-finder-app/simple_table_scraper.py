"""
ПРОСТОЙ скрипт - собирает ВСЮ информацию из таблицы TruckerPath
Работает ВСЕГДА, даже если лимит
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

if len(sys.argv) < 2:
    search_city = "Auburn, AL"
else:
    search_city = sys.argv[1]

# Загружаем credentials
with open("credentials.json", "r") as f:
    creds = json.load(f)
    credentials = creds.get("truckerpath", {})

print("="*70)
print(f"🚛 СБОР ИНФОРМАЦИИ ИЗ ТАБЛИЦЫ: {search_city.upper()}")
print("="*70)

# Браузер с масштабом 33%
chrome_options = Options()
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument('--start-maximized')
chrome_options.add_argument('--force-device-scale-factor=0.33')

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

all_loads = []

try:
    # ЛОГИН
    print("\n🔐 Логин...")
    driver.get("https://loadboard.truckerpath.com/carrier/loads/home")
    time.sleep(3)
    
    # Нажимаем Log In
    try:
        login_buttons = driver.find_elements(By.XPATH, "//*[contains(text(), 'Log In') or contains(text(), 'LOG IN')]")
        for btn in login_buttons:
            if btn.is_displayed():
                driver.execute_script("arguments[0].click();", btn)
                print("   Кликнули Log In")
                break
    except Exception as e:
        print(f"   Ошибка клика Log In: {e}")
    
    time.sleep(2)
    
    # Ждем форму логина
    try:
        email_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[placeholder='Email address'], input[type='email']"))
        )
    except:
        email_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "sign-in_email"))
        )
    
    print("   Вводим email...")
    email_input.clear()
    email_input.send_keys(credentials['username'])
    
    try:
        password_input = driver.find_element(By.ID, "sign-in_password")
    except:
        password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
    
    print("   Вводим пароль...")
    password_input.clear()
    password_input.send_keys(credentials['password'])
    time.sleep(1)
    
    # Нажимаем SIGN IN
    try:
        signin_btn = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "button.tlant-btn-primary"))
        )
        signin_btn.click()
        print("   Кликнули SIGN IN")
    except:
        password_input.send_keys(Keys.RETURN)
        print("   Нажали Enter")
    
    time.sleep(4)
    print("✅ Вход выполнен")
    
    # ПОИСК
    print(f"\n🔍 Поиск: {search_city}")
    driver.refresh()
    time.sleep(3)
    
    # Вводим город - ищем поле Pick Up разными способами
    pickup_input = None
    try:
        pickup_input = driver.find_element(By.CSS_SELECTOR, "input[placeholder*='Pick Up']")
    except:
        # Ищем среди всех input
        inputs = driver.find_elements(By.TAG_NAME, "input")
        for inp in inputs:
            placeholder = inp.get_attribute('placeholder') or ''
            aria_label = inp.get_attribute('aria-label') or ''
            input_id = inp.get_attribute('id') or ''
            
            if 'pick' in placeholder.lower() or 'pick' in aria_label.lower() or 'pick' in input_id.lower():
                if 'date' not in placeholder.lower() and 'date' not in aria_label.lower():
                    pickup_input = inp
                    print(f"   Нашли поле: {placeholder or aria_label or input_id}")
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
    else:
        print("   ⚠️ Поле Pick Up не найдено!")
        raise Exception("Поле Pick Up не найдено")
    
    # SEARCH
    search_btn = None
    try:
        search_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'SEARCH')]")
    except:
        # Ищем среди всех кнопок
        buttons = driver.find_elements(By.TAG_NAME, "button")
        for btn in buttons:
            if 'search' in btn.text.lower():
                search_btn = btn
                break
    
    if search_btn:
        search_btn.click()
        print("⏳ Ждем результаты...")
        time.sleep(10)
    else:
        print("   ⚠️ Кнопка SEARCH не найдена, пробуем без неё...")
        time.sleep(5)
    
    # ИЗВЛЕКАЕМ ВСЁ ИЗ ТАБЛИЦЫ
    print("\n📊 Извлекаем данные из таблицы...")
    
    # Получаем весь HTML таблицы
    page_source = driver.page_source
    
    # Ищем все строки
    rows = driver.find_elements(By.CSS_SELECTOR, "table tbody tr")
    print(f"Найдено строк: {len(rows)}")
    
    for idx, row in enumerate(rows, 1):
        try:
            text = row.text
            
            if len(text) < 20:
                continue
            
            print(f"\n--- Груз #{idx} ---")
            print(f"Текст строки: {text[:200]}")
            
            load = {
                'number': idx,
                'full_text': text,
                'search_city': search_city
            }
            
            # Парсим все что можем
            parts = text.split()
            
            # Ищем цену
            for part in parts:
                if '$' in part:
                    load['price'] = part
                    print(f"💰 Цена: {part}")
                    break
            
            # Ищем расстояние
            for part in parts:
                if 'mi' in part:
                    load['distance'] = part
                    print(f"📏 Расстояние: {part}")
                    break
            
            # Ищем дату
            months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            for i, part in enumerate(parts):
                if part in months and i + 1 < len(parts):
                    load['date'] = f"{part} {parts[i+1]}"
                    print(f"📅 Дата: {load['date']}")
                    break
            
            # Ищем города (с запятой и 2 буквы штата)
            cities = re.findall(r'([A-Za-z\s]+),\s*([A-Z]{2})', text)
            if len(cities) >= 1:
                load['pickup'] = f"{cities[0][0].strip()}, {cities[0][1]}"
                print(f"📍 Откуда: {load['pickup']}")
            if len(cities) >= 2:
                load['dropoff'] = f"{cities[1][0].strip()}, {cities[1][1]}"
                print(f"📍 Куда: {load['dropoff']}")
            
            # Ищем вес
            weight_match = re.search(r'(\d{2,3}),?(\d{3})', text)
            if weight_match:
                load['weight'] = weight_match.group(0)
                print(f"⚖️ Вес: {load['weight']}")
            
            # Ищем брокера
            brokers = ['jakebrake', 'Genpro', 'Dispatch', 'Beemac', 'Koola', 'DISPATCH']
            for broker in brokers:
                if broker in text:
                    load['broker'] = broker
                    print(f"🏢 Брокер: {broker}")
                    break
            
            all_loads.append(load)
            
        except Exception as e:
            print(f"⚠️ Ошибка строки {idx}: {e}")
    
    # Сохраняем
    output_file = f"{search_city.replace(',', '').replace(' ', '_').lower()}_loads.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(all_loads, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*70}")
    print(f"✅ ГОТОВО! Собрано грузов: {len(all_loads)}")
    print(f"💾 Файл: {output_file}")
    print(f"{'='*70}")
    
    # Статистика
    with_price = sum(1 for l in all_loads if 'price' in l)
    with_distance = sum(1 for l in all_loads if 'distance' in l)
    with_pickup = sum(1 for l in all_loads if 'pickup' in l)
    
    print(f"\n📊 Статистика:")
    print(f"   💰 С ценой: {with_price}")
    print(f"   📏 С расстоянием: {with_distance}")
    print(f"   📍 С маршрутом: {with_pickup}")
    
    print("\n🌐 Браузер остается открытым")
    print("Нажми Enter чтобы закрыть...")
    input()

except Exception as e:
    print(f"\n❌ ОШИБКА: {e}")
    import traceback
    traceback.print_exc()
    
    if all_loads:
        output_file = "loads_partial.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(all_loads, f, indent=2, ensure_ascii=False)
        print(f"💾 Частичный результат: {output_file} ({len(all_loads)} грузов)")
    
    print("\nНажми Enter...")
    input()

finally:
    driver.quit()
    print("✅ Закрыто")
