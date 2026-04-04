"""
Flask приложение для поиска грузов через TruckerPath
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
    'data': None,
    'error': None,
    'step': 0  # Текущий этап
}

def search_load_background(city):
    """Фоновый поиск груза"""
    global search_result
    
    try:
        print(f"\n🔍 Начинаем поиск: {city}")
        search_result['status'] = 'searching'
        search_result['data'] = None
        search_result['error'] = None
        search_result['step'] = 1  # Этап 1: Логин
        
        # Загружаем credentials
        with open("credentials.json", "r") as f:
            creds = json.load(f)
            credentials = creds.get("truckerpath", {})
        
        # Инициализация браузера (ВИДИМЫЙ РЕЖИМ)
        chrome_options = Options()
        # chrome_options.add_argument('--headless=new')  # ОТКЛЮЧЕН - браузер будет видимым
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--start-maximized')  # Открываем на весь экран
        
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        
        try:
            # ЛОГИН
            print("   🌐 Открываем TruckerPath...")
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
            
            time.sleep(0.2)  # Минимальная пауза
            
            # Заполняем форму МАКСИМАЛЬНО БЫСТРО
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
            
            time.sleep(2)  # Минимум для завершения логина
            
            # ПОИСК
            search_result['step'] = 2  # Этап 2: Поиск
            print("   ✅ Переход к поиску грузов...")
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
                print(f"   📝 Всего найдено input полей: {len(inputs)}")
                for inp in inputs:
                    placeholder = inp.get_attribute('placeholder') or ''
                    aria_label = inp.get_attribute('aria-label') or ''
                    input_id = inp.get_attribute('id') or ''
                    
                    # Ищем поле с "Pick" но БЕЗ "Date"
                    if 'pick' in placeholder.lower() or 'pick' in aria_label.lower() or 'pick' in input_id.lower():
                        if 'date' not in placeholder.lower() and 'date' not in aria_label.lower():
                            pickup_input = inp
                            print(f"   ✅ Найдено поле: placeholder='{placeholder}', id='{input_id}'")
                            break
            
            if pickup_input:
                # Прокручиваем к полю
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", pickup_input)
                time.sleep(1)
                
                # Кликаем на поле
                pickup_input.click()
                time.sleep(1)
                
                # Очищаем поле
                pickup_input.clear()
                time.sleep(0.5)
                
                # Вводим город
                pickup_input.send_keys(city)
                print(f"   ✅ Введено в Pick Up: {city}")
                time.sleep(2)
                
                # Нажимаем Enter
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
            
            # КЛИК НА ПЕРВЫЙ ГРУЗ
            search_result['step'] = 3  # Этап 3: Клик на груз
            city_name = city.split(',')[0].strip()
            print(f"   🔍 Ищем груз из {city_name}...")
            
            # Ждем появления таблицы с результатами
            time.sleep(5)  # Увеличили время ожидания
            
            # Ищем строки таблицы - пробуем разные селекторы
            rows = []
            
            # Способ 1: Ищем tr в таблице
            try:
                rows = driver.find_elements(By.CSS_SELECTOR, "table tbody tr")
                if len(rows) > 1:
                    print(f"   📊 Найдено строк таблицы (tbody tr): {len(rows)}")
            except:
                pass
            
            # Способ 2: Ищем div с role="row"
            if len(rows) <= 1:
                try:
                    rows = driver.find_elements(By.CSS_SELECTOR, "div[role='row']")
                    if len(rows) > 0:
                        print(f"   📊 Найдено строк (div role=row): {len(rows)}")
                except:
                    pass
            
            # Способ 3: Ищем любые элементы с ценой ($) - это точно грузы
            if len(rows) <= 1:
                try:
                    # Ищем элементы содержащие цену
                    price_elements = driver.find_elements(By.XPATH, "//*[contains(text(), '$')]")
                    # Берем родительские элементы (строки)
                    rows = []
                    for elem in price_elements:
                        # Поднимаемся на 2-3 уровня вверх чтобы найти строку
                        parent = elem
                        for _ in range(3):
                            parent = parent.find_element(By.XPATH, "..")
                            if parent not in rows and len(parent.text) > 50:
                                rows.append(parent)
                                break
                    print(f"   📊 Найдено элементов с ценой: {len(rows)}")
                except Exception as e:
                    print(f"   ⚠️ Ошибка поиска по цене: {e}")
            
            # Способ 4: Ищем все кликабельные элементы с текстом
            if len(rows) <= 1:
                try:
                    clickable = driver.find_elements(By.XPATH, "//*[@role='button' or @onclick or contains(@class, 'clickable') or contains(@class, 'row')]")
                    for elem in clickable:
                        text = elem.text
                        if '$' in text and len(text) > 50:
                            rows.append(elem)
                    print(f"   📊 Найдено кликабельных элементов: {len(rows)}")
                except:
                    pass
            
            first_row = None
            # Просто берем ПЕРВУЮ строку с данными (не заголовок)
            for idx, row in enumerate(rows):
                try:
                    text = row.text
                    # Проверяем что это не заголовок и есть данные
                    if len(text) > 30 and '$' in text:  # Должна быть цена
                        print(f"   ✅ Берем первый груз из результатов: {text[:150]}...")
                        first_row = row
                        break
                except:
                    continue
            
            if not first_row:
                print(f"❌ Грузы не найдены в результатах поиска")
                # Сохраняем текст страницы для отладки
                page_text = driver.find_element(By.TAG_NAME, "body").text
                print(f"Текст страницы (первые 1000 символов): {page_text[:1000]}")
                search_result['status'] = 'error'
                search_result['error'] = f'Грузы не найдены в результатах поиска'
                return
            
            # КЛИКАЕМ
            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", first_row)
            time.sleep(1)
            driver.execute_script("arguments[0].click();", first_row)
            print("   ✅ Кликнули на груз, ждем загрузки деталей...")
            time.sleep(3)  # Начальная пауза
            
            # ИЗВЛЕКАЕМ ДЕТАЛИ
            search_result['step'] = 4  # Этап 4: Извлечение данных
            print("   📋 Извлекаем детали груза...")
            
            # Ждем пока появятся контакты (телефон или email) в правой панели
            max_attempts = 15  # Увеличили до 15 попыток (30 секунд)
            contacts_found = False
            phone_found = None
            email_found = None
            
            for attempt in range(max_attempts):
                page_text = driver.find_element(By.TAG_NAME, "body").text
                
                # Ищем телефон (10-11 цифр подряд)
                phone_matches = re.findall(r'(\d{10,11})', page_text)
                for phone in phone_matches:
                    # Проверяем контекст вокруг телефона
                    phone_pos = page_text.find(phone)
                    context_start = max(0, phone_pos - 50)
                    context_end = min(len(page_text), phone_pos + len(phone) + 50)
                    context = page_text[context_start:context_end]
                    
                    # Если рядом нет "Unlock" - это реальный телефон
                    if 'Unlock' not in context and 'unlock' not in context.lower():
                        phone_found = phone
                        break
                
                # Ищем email
                email_matches = re.findall(r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', page_text)
                for email in email_matches:
                    # Проверяем контекст вокруг email
                    email_pos = page_text.find(email)
                    context_start = max(0, email_pos - 50)
                    context_end = min(len(page_text), email_pos + len(email) + 50)
                    context = page_text[context_start:context_end]
                    
                    # Если рядом нет "Unlock" - это реальный email
                    if 'Unlock' not in context and 'unlock' not in context.lower():
                        email_found = email
                        break
                
                # Если нашли хотя бы один контакт - успех
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
            
            # Получаем финальный текст страницы
            page_text = driver.find_element(By.TAG_NAME, "body").text
            
            details = {}
            
            # Используем уже найденные контакты
            if phone_found:
                details['phone'] = phone_found
            
            if email_found:
                details['email'] = email_found
            
            # Если не нашли ранее, пробуем еще раз с разными паттернами
            if 'phone' not in details:
                phone_patterns = [
                    r'Phone[:\s]*(\d{10,11})',  # Phone: 7138560000
                    r'(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})',  # 713-856-0000
                    r'\((\d{3})\)\s*(\d{3})[-.\s]?(\d{4})',  # (713) 856-0000
                ]
                
                for pattern in phone_patterns:
                    phone_match = re.search(pattern, page_text)
                    if phone_match:
                        phone_candidate = phone_match.group(0)
                        # Проверяем что рядом нет "Unlock"
                        context_start = max(0, phone_match.start()-50)
                        context_end = min(len(page_text), phone_match.end()+50)
                        context = page_text[context_start:context_end]
                        if 'Unlock' not in context and 'unlock' not in context.lower():
                            details['phone'] = phone_candidate
                            print(f"   📞 Телефон найден (дополнительно): {phone_candidate}")
                            break
            
            if 'email' not in details:
                email_match = re.search(r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', page_text)
                if email_match:
                    email_candidate = email_match.group(1)
                    context_start = max(0, email_match.start()-50)
                    context_end = min(len(page_text), email_match.end()+50)
                    context = page_text[context_start:context_end]
                    if 'Unlock' not in context and 'unlock' not in context.lower():
                        details['email'] = email_candidate
                        print(f"   📧 Email найден (дополнительно): {email_candidate}")
            
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
            
            print(f"✅ Груз найден! Телефон: {details.get('phone', 'N/A')}, Email: {details.get('email', 'N/A')}")
            search_result['status'] = 'completed'
            search_result['data'] = details
            
        finally:
            driver.quit()
            print("🔒 Браузер закрыт")
            
    except Exception as e:
        print(f"❌ ОШИБКА: {e}")
        import traceback
        traceback.print_exc()
        search_result['status'] = 'error'
        search_result['error'] = str(e)

@app.route('/')
def index():
    """Главная страница"""
    return render_template('load_finder.html')

@app.route('/search', methods=['POST'])
def search():
    """Запуск поиска"""
    data = request.get_json()
    city = data.get('city', '')
    
    if not city:
        return jsonify({'error': 'Укажите город'}), 400
    
    # Запускаем поиск в фоновом потоке
    thread = threading.Thread(target=search_load_background, args=(city,))
    thread.start()
    
    return jsonify({'status': 'started'})

@app.route('/status')
def status():
    """Проверка статуса поиска"""
    return jsonify(search_result)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
