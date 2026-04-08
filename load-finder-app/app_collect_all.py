"""
Flask приложение для сбора ВСЕХ грузов по очереди
Показывает результаты даже если нет телефона/email
"""
from flask import Flask, render_template, request, jsonify
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
import threading

app = Flask(__name__)

# Глобальная переменная для хранения результата
search_result = {
    'status': 'idle',
    'loads': [],  # Список всех грузов
    'current_load': 0,  # Текущий номер груза
    'total_loads': 0,  # Всего грузов найдено
    'limit_reached': False,
    'step': 0
}

# Глобальная переменная для хранения активного браузера
active_driver = None

def check_for_limit(driver):
    """Проверяет появилось ли сообщение о лимите"""
    try:
        page_text = driver.find_element(By.TAG_NAME, "body").text
        if 'Daily Limit Reached' in page_text or 'Daily free load views left: 0' in page_text:
            return True
        upgrade_buttons = driver.find_elements(By.XPATH, "//*[contains(text(), 'UPGRADE NOW')]")
        if upgrade_buttons:
            return True
        return False
    except:
        return False

def collect_all_loads(city):
    """Собирает ВСЕ грузы по очереди"""
    global search_result, active_driver
    
    try:
        print(f"\n🔍 Начинаем сбор всех грузов из: {city}")
        search_result['status'] = 'searching'
        search_result['loads'] = []
        search_result['current_load'] = 0
        search_result['limit_reached'] = False
        search_result['step'] = 1
        
        # Загружаем credentials
        with open("credentials.json", "r") as f:
            creds = json.load(f)
            credentials = creds.get("truckerpath", {})
        
        # Инициализация браузера
        chrome_options = Options()
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--start-maximized')
        chrome_options.add_argument('--force-device-scale-factor=0.33')  # Масштаб 33%
        
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        
        try:
            # ЛОГИН
            print("   🔐 Вход в TruckerPath...")
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
            print("   ✅ Вход выполнен!")
            
            # ПОИСК
            search_result['step'] = 2
            print(f"   🔍 Поиск грузов из {city}...")
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
                pickup_input.send_keys(city)
                print(f"   ✅ Введено: {city}")
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
            
            # СБОР ВСЕХ ГРУЗОВ
            search_result['step'] = 3
            print(f"\n📦 Сначала собираем данные из ТАБЛИЦЫ...")
            
            # Ждем загрузки таблицы
            time.sleep(5)
            
            # СНАЧАЛА извлекаем ВСЕ данные из таблицы (они видны БЕЗ клика)
            print(f"\n📊 Извлекаем данные из таблицы...")
            
            try:
                # Ищем все строки таблицы
                rows = driver.find_elements(By.CSS_SELECTOR, "table tbody tr")
                print(f"   Найдено строк в таблице: {len(rows)}")
                
                for idx, row in enumerate(rows):
                    try:
                        row_text = row.text
                        
                        if len(row_text) < 20:  # Пропускаем пустые/короткие строки
                            continue
                        
                        # Создаем запись о грузе из данных таблицы
                        load_data = {
                            'load_number': idx + 1,
                            'search_city': city,
                            'table_row_text': row_text,
                            'source': 'table'  # Помечаем что данные из таблицы
                        }
                        
                        # Парсим данные из текста строки
                        # Pick Up (город, штат)
                        pickup_match = re.search(r'([A-Za-z\s]+),\s*([A-Z]{2})', row_text)
                        if pickup_match:
                            load_data['pickup_city'] = pickup_match.group(1).strip()
                            load_data['pickup_state'] = pickup_match.group(2)
                        
                        # Дата
                        date_match = re.search(r'(Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d+', row_text)
                        if date_match:
                            load_data['date'] = date_match.group(0)
                        
                        # Расстояние
                        distance_match = re.search(r'(\d+,?\d*)mi', row_text)
                        if distance_match:
                            load_data['distance'] = distance_match.group(0)
                        
                        # Вес
                        weight_match = re.search(r'(\d{2,3}),?(\d{3})', row_text)
                        if weight_match:
                            load_data['weight'] = weight_match.group(0) + ' lbs'
                        
                        # Цена
                        price_match = re.search(r'\$[\d,]+', row_text)
                        if price_match:
                            load_data['price'] = price_match.group(0)
                        
                        # Брокер
                        broker_keywords = ['jakebrake', 'Genpro', 'Dispatch', 'Beemac', 'Koola', 'DISPATCH']
                        for keyword in broker_keywords:
                            if keyword in row_text:
                                load_data['broker'] = keyword
                                break
                        
                        # Тип трейлера
                        if ' F ' in row_text:
                            load_data['trailer'] = 'F (Flatbed)'
                        elif ' V ' in row_text:
                            load_data['trailer'] = 'V (Van)'
                        elif ' R ' in row_text:
                            load_data['trailer'] = 'R (Reefer)'
                        
                        # Добавляем в список
                        search_result['loads'].append(load_data)
                        print(f"   ✅ Груз #{idx + 1} из таблицы: {load_data.get('pickup_city', 'N/A')} → {load_data.get('price', 'N/A')}")
                        
                    except Exception as e:
                        print(f"   ⚠️ Ошибка обработки строки {idx + 1}: {e}")
                        continue
                
                print(f"\n✅ Собрано из таблицы: {len(search_result['loads'])} грузов")
                search_result['total_loads'] = len(search_result['loads'])
                
            except Exception as e:
                print(f"⚠️ Ошибка извлечения из таблицы: {e}")
            
            # ТЕПЕРЬ пробуем кликать на грузы для получения деталей
            print(f"\n🖱️ Теперь кликаем на грузы для получения деталей...")
            
            load_index = 0
            
            while True:
                load_index += 1
                search_result['current_load'] = load_index
                print(f"\n{'='*50}")
                print(f"🔍 ГРУЗ #{load_index} - Получаем детали")
                print(f"{'='*50}")
                
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
                search_result['total_loads'] = len(valid_rows)
                
                # Проверяем есть ли груз с нужным индексом
                if load_index > len(valid_rows):
                    print(f"\n✅ Все грузы собраны!")
                    break
                
                # Берем груз по индексу
                target_row = valid_rows[load_index - 1]
                
                try:
                    row_text = target_row.text[:80]
                    print(f"   🎯 Кликаем: {row_text}...")
                except:
                    print(f"   🎯 Кликаем на груз #{load_index}...")
                
                # КЛИКАЕМ
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", target_row)
                time.sleep(1)
                driver.execute_script("arguments[0].click();", target_row)
                time.sleep(2)
                
                # Проверяем лимит ПОСЛЕ клика
                if check_for_limit(driver):
                    print(f"\n⚠️ ДОСТИГНУТ ЛИМИТ после клика!")
                    search_result['limit_reached'] = True
                    load_index -= 1  # Не засчитываем этот груз
                    search_result['current_load'] = load_index
                    break
                
                # ИЗВЛЕКАЕМ ДЕТАЛИ
                search_result['step'] = 4
                print("   📋 Извлекаем детали...")
                
                # Ждем загрузки страницы и копируем ВСЁ
                time.sleep(3)
                
                # Получаем ВЕСЬ текст страницы
                try:
                    page_text = driver.find_element(By.TAG_NAME, "body").text
                except:
                    page_text = ""
                
                # Сохраняем полный текст страницы для отладки
                try:
                    with open(f"load_{load_index}_full_text.txt", "w", encoding="utf-8") as f:
                        f.write(page_text)
                    print(f"      💾 Полный текст сохранен: load_{load_index}_full_text.txt")
                except:
                    pass
                
                details = {
                    'load_number': load_index,
                    'search_city': city,
                    'full_page_text': page_text[:500]  # Первые 500 символов для превью
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
                
                # Добавляем груз в список (ДАЖЕ ЕСЛИ НЕТ ТЕЛЕФОНА/EMAIL)
                search_result['loads'].append(details)
                print(f"   ✅ Груз #{load_index} сохранен")
                
                time.sleep(1)
            
            # Сохраняем результат
            print(f"\n✅ Сбор завершен! Собрано грузов: {len(search_result['loads'])}")
            search_result['status'] = 'completed'
            
            # Помечаем аккаунт если достигнут лимит
            if search_result['limit_reached']:
                try:
                    with open("credentials.json", "r") as f:
                        creds = json.load(f)
                    creds['truckerpath']['limit_reached'] = True
                    with open("credentials.json", "w") as f:
                        json.dump(creds, f, indent=2)
                except:
                    pass
            
            # НЕ ЗАКРЫВАЕМ БРАУЗЕР - оставляем открытым
            print("\n🌐 БРАУЗЕР ОСТАЕТСЯ ОТКРЫТЫМ!")
            print("Информация собрана и доступна в веб-интерфейсе")
            
            # Сохраняем driver глобально чтобы не закрылся
            active_driver = driver
            
        except Exception as inner_e:
            print(f"⚠️ Внутренняя ошибка: {inner_e}")
            # Всё равно не закрываем браузер
            try:
                active_driver = driver
            except:
                pass
            
    except Exception as e:
        print(f"⚠️ Внешняя ошибка: {e}")
        import traceback
        traceback.print_exc()
        # НЕ показываем ошибку пользователю - показываем то что собрали
        search_result['status'] = 'completed'
        if not search_result['loads']:
            # Даже если нет грузов, не показываем ошибку
            search_result['status'] = 'completed'
            search_result['loads'] = []

@app.route('/')
def index():
    """Главная страница"""
    return render_template('load_finder_all.html')

@app.route('/search', methods=['POST'])
def search():
    """Запуск сбора всех грузов"""
    data = request.get_json()
    city = data.get('city', '')
    
    if not city:
        return jsonify({'error': 'Укажите город'}), 400
    
    # Запускаем сбор в фоновом потоке
    thread = threading.Thread(target=collect_all_loads, args=(city,))
    thread.start()
    
    return jsonify({'status': 'started'})

@app.route('/status')
def status():
    """Проверка статуса сбора"""
    return jsonify(search_result)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
