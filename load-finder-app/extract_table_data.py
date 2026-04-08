"""
Скрипт для извлечения ВСЕЙ информации из таблицы TruckerPath
Копирует все данные: Pick Up, Date, Drop Off, Distance, Trailer, Weight, Broker, Price
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

# Получаем город из аргументов
if len(sys.argv) < 2:
    print("❌ Укажите город!")
    print("Использование: python extract_table_data.py \"City, ST\"")
    sys.exit(1)

search_city = sys.argv[1]
city_safe = search_city.lower().replace(' ', '_').replace(',', '')

# Загружаем credentials
with open("credentials.json", "r") as f:
    creds = json.load(f)
    credentials = creds.get("truckerpath", {})

print("="*70)
print(f"🚛 ИЗВЛЕЧЕНИЕ ВСЕХ ДАННЫХ ИЗ ТАБЛИЦЫ: {search_city.upper()}")
print("="*70)

# Инициализация браузера (ВИДИМЫЙ)
chrome_options = Options()
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument('--window-size=1920,1080')
chrome_options.add_argument('--start-maximized')
chrome_options.add_argument('--force-device-scale-factor=0.33')  # Масштаб 33%

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

all_loads = []

try:
    # ЛОГИН
    print("\n🔐 Вход в TruckerPath...")
    driver.delete_all_cookies()
    driver.get("https://loadboard.truckerpath.com/carrier/loads/home")
    time.sleep(2)
    
    login_buttons = driver.find_elements(By.XPATH, "//*[contains(text(), 'Log In') or contains(text(), 'LOG IN')]")
    for btn in login_buttons:
        if btn.is_displayed():
            driver.execute_script("arguments[0].click();", btn)
            break
    
    try:
        email_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[placeholder='Email address'], input[type='email']"))
        )
    except:
        email_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "sign-in_email"))
        )
    
    time.sleep(0.2)
    email_input.send_keys(credentials['username'])
    
    try:
        password_input = driver.find_element(By.ID, "sign-in_password")
    except:
        password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
    
    password_input.send_keys(credentials['password'])
    time.sleep(0.8)
    
    try:
        signin_btn = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "button.tlant-btn-primary"))
        )
        signin_btn.click()
    except:
        password_input.send_keys(Keys.RETURN)
    
    time.sleep(2)
    print("✅ Вход выполнен!")
    
    # ПОИСК
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
            if 'pick' in placeholder.lower() and 'date' not in placeholder.lower():
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
        print(f"✅ Введено: {search_city}")
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
        print("⏳ Ждем загрузки результатов...")
        time.sleep(8)
    
    # ИЗВЛЕКАЕМ ВСЕ СТРОКИ ТАБЛИЦЫ
    print(f"\n📊 Извлекаем данные из таблицы...")
    
    # Ищем все строки таблицы
    rows = driver.find_elements(By.CSS_SELECTOR, "table tbody tr")
    print(f"Найдено строк в таблице: {len(rows)}")
    
    for idx, row in enumerate(rows):
        try:
            # Получаем все ячейки строки
            cells = row.find_elements(By.TAG_NAME, "td")
            
            if len(cells) < 5:  # Пропускаем заголовки или пустые строки
                continue
            
            # Извлекаем текст из каждой ячейки
            row_data = {}
            row_text = row.text
            
            # Разбиваем текст по пробелам/переносам
            parts = row_text.split()
            
            # Пытаемся найти основные поля
            # Pick Up (город)
            for i, part in enumerate(parts):
                if ',' in part and len(part) <= 4:  # Штат (например: AL, GA)
                    if i > 0:
                        row_data['pickup_city'] = parts[i-1]
                        row_data['pickup_state'] = part.replace(',', '')
                    break
            
            # Дата (Feb 24, Feb 25)
            for i, part in enumerate(parts):
                if part in ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']:
                    if i + 1 < len(parts):
                        row_data['date'] = f"{part} {parts[i+1]}"
                    break
            
            # Расстояние (906mi, 865mi)
            for part in parts:
                if 'mi' in part:
                    row_data['distance'] = part
                    break
            
            # Вес (48,000 или 48000)
            for i, part in enumerate(parts):
                if part.replace(',', '').isdigit() and len(part) >= 4:
                    if i + 1 < len(parts) and 'lbs' not in parts[i+1]:
                        row_data['weight'] = part
                    break
            
            # Цена ($1,950, $1,700)
            price_match = re.search(r'\$[\d,]+', row_text)
            if price_match:
                row_data['price'] = price_match.group(0)
            
            # Брокер (jakebrake, Genpro Inc, Dispatch)
            broker_keywords = ['jakebrake', 'Genpro', 'Dispatch', 'Beemac', 'Koola', 'DISPATCH']
            for keyword in broker_keywords:
                if keyword in row_text:
                    row_data['broker'] = keyword
                    break
            
            # Тип трейлера (F, V, R, SD F)
            trailer_types = ['F', 'V', 'R', 'SD F']
            for trailer in trailer_types:
                if f" {trailer} " in f" {row_text} ":
                    row_data['trailer'] = trailer
                    break
            
            # Сохраняем полный текст строки
            row_data['full_text'] = row_text
            row_data['row_number'] = idx + 1
            
            # Добавляем только если есть хоть какие-то данные
            if len(row_data) > 2:  # Больше чем просто row_number и full_text
                all_loads.append(row_data)
                print(f"\n✅ Груз #{idx + 1}:")
                for key, value in row_data.items():
                    if key not in ['full_text', 'row_number']:
                        print(f"   {key}: {value}")
        
        except Exception as e:
            print(f"⚠️ Ошибка обработки строки {idx + 1}: {e}")
            continue
    
    # Сохраняем результат
    output_file = f"{city_safe}_table_data.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(all_loads, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*70}")
    print(f"✅ ИЗВЛЕЧЕНИЕ ЗАВЕРШЕНО!")
    print(f"{'='*70}")
    print(f"📦 Всего грузов извлечено: {len(all_loads)}")
    print(f"💾 Результат сохранен: {output_file}")
    print(f"{'='*70}")
    
    # Показываем статистику
    loads_with_price = sum(1 for load in all_loads if 'price' in load)
    loads_with_broker = sum(1 for load in all_loads if 'broker' in load)
    loads_with_distance = sum(1 for load in all_loads if 'distance' in load)
    
    print(f"\n📊 Статистика:")
    print(f"   💰 С ценой: {loads_with_price}")
    print(f"   🏢 С брокером: {loads_with_broker}")
    print(f"   📏 С расстоянием: {loads_with_distance}")
    
    print("\n🌐 БРАУЗЕР ОСТАЕТСЯ ОТКРЫТЫМ!")
    print("Нажми Enter чтобы закрыть...")
    input()

except Exception as e:
    print(f"\n❌ ОШИБКА: {e}")
    import traceback
    traceback.print_exc()
    
    # Сохраняем то что успели
    if all_loads:
        output_file = f"{city_safe}_table_data_partial.json"
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(all_loads, f, indent=2, ensure_ascii=False)
        print(f"\n💾 Частичный результат: {output_file}")
        print(f"📦 Собрано грузов: {len(all_loads)}")
    
    print("\nНажми Enter чтобы закрыть...")
    input()

finally:
    driver.quit()
    print("✅ Браузер закрыт")
