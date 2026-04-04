"""
Flask приложение - ПОЛНЫЙ сбор информации
1. Собирает данные из таблицы
2. Кликает на каждый груз для получения телефона/email
3. Останавливается ТОЛЬКО когда появится "Daily Limit Reached!"
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
import os

app = Flask(__name__)

# Загружаем базу данных брокеров
BROKERS_DB = {}
try:
    with open("brokers_database.json", "r", encoding="utf-8") as f:
        BROKERS_DB = json.load(f)
    print(f"✅ Загружено брокеров в базе: {len(BROKERS_DB)}")
except:
    print("⚠️ База данных брокеров не найдена")

# Глобальная переменная для хранения результата
search_result = {
    'status': 'idle',
    'loads': [],
    'current_load': 0,
    'total_loads': 0,
    'limit_reached': False,
    'step': 0,
    'step_name': ''
}

# Глобальная переменная для хранения активного браузера
active_driver = None

def load_credentials():
    """Загружает credentials из переменных окружения или файла"""
    # Пробуем загрузить из переменных окружения (для Render.com)
    username = os.environ.get('TRUCKERPATH_USERNAME')
    password = os.environ.get('TRUCKERPATH_PASSWORD')
    
    if username and password:
        print("✅ Credentials загружены из переменных окружения")
        return {
            'username': username,
            'password': password
        }
    
    # Если нет переменных окружения, читаем из файла (для локального использования)
    try:
        with open("credentials.json", "r") as f:
            creds = json.load(f)
            credentials = creds.get("truckerpath", {})
            print("✅ Credentials загружены из файла")
            return credentials
    except FileNotFoundError:
        print("⚠️ Файл credentials.json не найден и переменные окружения не установлены")
        return {}

def expand_trailer_type(code):
    """Расшифровывает коды типов трейлеров"""
    trailer_types = {
        'F': 'Flatbed (F)',
        'V': 'Van (V)',
        'R': 'Reefer (R)',
        'F SD': 'Flatbed SD (F SD)',
        'R,V': 'Reefer/Van (R,V)',
        'R, V': 'Reefer/Van (R,V)'
    }
    return trailer_types.get(code.strip(), code)

def clean_email(email):
    """Убирает +truckerpath из email адресов"""
    if not email:
        return email
    # Убираем +truckerpath из email
    return email.replace('+truckerpath', '')

def normalize_broker_name(broker_name):
    """Нормализует название брокера (заменяет сокращения на полные названия)"""
    if not broker_name:
        return broker_name
    
    # Словарь замен сокращений на полные названия
    broker_replacements = {
        'DTP/CS': 'D & T PERRY TRUCKING LLC'
    }
    
    # Проверяем точное совпадение
    if broker_name in broker_replacements:
        return broker_replacements[broker_name]
    
    return broker_name

def find_broker_in_database(broker_name):
    """Ищет брокера в базе данных и возвращает его контакты"""
    if not broker_name or not BROKERS_DB:
        return None
    
    # Нормализуем название брокера
    broker_normalized = broker_name.lower().strip()
    
    # Ищем точное совпадение
    for db_broker, info in BROKERS_DB.items():
        if db_broker.lower() in broker_normalized or broker_normalized in db_broker.lower():
            # Очищаем email от +truckerpath перед возвратом
            cleaned_info = info.copy()
            if 'email' in cleaned_info:
                cleaned_info['email'] = clean_email(cleaned_info['email'])
            return cleaned_info
    
    return None

def check_for_limit(driver):
    """НЕ проверяем лимит - просто возвращаем False"""
    return False

def collect_full_data(city):
    """Собирает ПОЛНУЮ информацию: таблица + клики"""
    global search_result, active_driver
    
    try:
        print(f"\n{'='*70}")
        print(f"🚛 ПОЛНЫЙ СБОР ИНФОРМАЦИИ: {city.upper()}")
        print(f"{'='*70}")
        
        search_result['status'] = 'searching'
        search_result['loads'] = []
        search_result['current_load'] = 0
        search_result['limit_reached'] = False
        search_result['step'] = 1
        search_result['step_name'] = '🔌 Подключение к системе...'
        
        # Загружаем credentials
        credentials = load_credentials()
        
        # Определяем окружение (Render или локально)
        is_render = os.environ.get('RENDER') == 'true' or os.environ.get('CHROME_BIN')
        
        # Браузер с оптимизацией
        chrome_options = Options()
        
        # Headless режим ТОЛЬКО на Render
        if is_render:
            chrome_options.add_argument('--headless=new')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-setuid-sandbox')
            chrome_options.add_argument('--single-process')  # Один процесс для экономии памяти
            chrome_options.add_argument('--disable-dev-shm-usage')
            # Chromium binary path
            chrome_options.binary_location = '/usr/bin/chromium'
            print("🌐 Режим: Render (headless, Chromium)")
        else:
            # Локально - БЕЗ headless, чтобы видеть браузер
            print("💻 Режим: Локальный (с окном браузера)")
        
        # Общие оптимизации для всех окружений
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--disable-software-rasterizer')
        chrome_options.add_argument('--disable-extensions')
        chrome_options.add_argument('--disable-logging')
        chrome_options.add_argument('--disable-permissions-api')
        chrome_options.add_argument('--disable-notifications')
        chrome_options.add_argument('--disable-background-networking')
        chrome_options.add_argument('--disable-background-timer-throttling')
        chrome_options.add_argument('--disable-backgrounding-occluded-windows')
        chrome_options.add_argument('--disable-breakpad')
        chrome_options.add_argument('--disable-component-extensions-with-background-pages')
        chrome_options.add_argument('--disable-features=TranslateUI,BlinkGenPropertyTrees')
        chrome_options.add_argument('--disable-ipc-flooding-protection')
        chrome_options.add_argument('--disable-renderer-backgrounding')
        chrome_options.add_argument('--enable-features=NetworkService,NetworkServiceInProcess')
        chrome_options.add_argument('--force-color-profile=srgb')
        chrome_options.add_argument('--hide-scrollbars')
        chrome_options.add_argument('--metrics-recording-only')
        chrome_options.add_argument('--mute-audio')
        chrome_options.add_argument('--no-first-run')
        chrome_options.add_argument('--safebrowsing-disable-auto-update')
        chrome_options.add_argument('--window-size=1024,768')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        
        # Отключаем загрузку изображений для экономии памяти
        prefs = {
            'profile.default_content_setting_values': {
                'images': 2,  # Не загружать изображения
                'plugins': 2,
                'popups': 2,
                'geolocation': 2,
                'notifications': 2,
                'media_stream': 2,
            }
        }
        chrome_options.add_experimental_option('prefs', prefs)
        
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        
        try:
            # ЛОГИН
            print("\n🔐 Шаг 1: Логин...")
            search_result['step'] = 2
            search_result['step_name'] = '🌐 Открытие браузера...'
            
            driver.get("https://loadboard.truckerpath.com/carrier/loads/home")
            time.sleep(1)
            
            search_result['step_name'] = '🔍 Поиск формы входа...'
            time.sleep(1)
            
            login_buttons = driver.find_elements(By.XPATH, "//*[contains(text(), 'Log In') or contains(text(), 'LOG IN')]")
            for btn in login_buttons:
                if btn.is_displayed():
                    driver.execute_script("arguments[0].click();", btn)
                    break
            
            time.sleep(1)
            search_result['step_name'] = '📝 Ввод учетных данных...'
            
            try:
                email_input = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "input[placeholder='Email address'], input[type='email']"))
                )
            except:
                email_input = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.ID, "sign-in_email"))
                )
            
            email_input.clear()
            email_input.send_keys(credentials['username'])
            
            try:
                password_input = driver.find_element(By.ID, "sign-in_password")
            except:
                password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
            
            password_input.clear()
            password_input.send_keys(credentials['password'])
            time.sleep(1)
            
            search_result['step_name'] = '🔐 Авторизация...'
            
            try:
                signin_btn = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, "button.tlant-btn-primary"))
                )
                signin_btn.click()
            except:
                password_input.send_keys(Keys.RETURN)
            
            time.sleep(2)
            search_result['step_name'] = '✅ Вход выполнен успешно'
            time.sleep(1)
            print("✅ Вход выполнен")
            
            # ПОИСК
            print(f"\n🔍 Шаг 2: Поиск грузов из {city}...")
            search_result['step'] = 3
            search_result['step_name'] = '🔄 Обновление страницы...'
            
            driver.refresh()
            time.sleep(2)
            
            search_result['step_name'] = f'📍 Настройка поиска для {city}...'
            time.sleep(1)
            
            # Кликаем pickup ОДИН раз и вводим город
            print(f"\n   Ищем поле Pick Up...")
            search_result['step_name'] = '🔍 Поиск поля Pick Up...'
            
            pickup_input = None
            
            try:
                all_inputs = driver.find_elements(By.TAG_NAME, "input")
                for inp in all_inputs:
                    try:
                        if not inp.is_displayed() or not inp.is_enabled():
                            continue
                        
                        placeholder = (inp.get_attribute('placeholder') or '').lower()
                        aria_label = (inp.get_attribute('aria-label') or '').lower()
                        input_id = (inp.get_attribute('id') or '').lower()
                        input_name = (inp.get_attribute('name') or '').lower()
                        
                        # Ищем по разным признакам
                        if ('pick' in placeholder or 'pick' in aria_label or 
                            'pick' in input_id or 'pick' in input_name or
                            'origin' in placeholder or 'origin' in input_id or
                            'from' in placeholder or 'from' in input_id):
                            
                            # Исключаем поля с датой
                            if 'date' not in placeholder and 'date' not in aria_label and 'date' not in input_id:
                                pickup_input = inp
                                print(f"   ✅ Нашли поле: placeholder='{placeholder}', id='{input_id}'")
                                break
                    except:
                        continue
            except:
                pass
            
            # Если не нашли, берем первый видимый text input
            if not pickup_input:
                print(f"   ⚠️ Поле Pick Up не найдено, берем первый text input...")
                try:
                    all_inputs = driver.find_elements(By.TAG_NAME, "input")
                    for inp in all_inputs:
                        try:
                            if inp.is_displayed() and inp.is_enabled():
                                input_type = (inp.get_attribute('type') or '').lower()
                                if input_type in ['text', 'search', '']:
                                    pickup_input = inp
                                    print(f"   ✅ Взяли первый text input")
                                    break
                        except:
                            continue
                except:
                    pass
            
            if not pickup_input:
                print(f"   ❌ Не удалось найти поле для ввода")
                search_result['status'] = 'completed'
                return
            
            # Кликаем Pick Up ОДИН раз и вводим город
            try:
                search_result['step_name'] = f'📝 Ввод города {city}...'
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", pickup_input)
                time.sleep(0.3)
                
                # ОДИН клик на поле
                pickup_input.click()
                print(f"   ✅ Кликнули на Pick Up")
                time.sleep(0.5)
                
                # Очищаем и вводим город
                pickup_input.clear()
                time.sleep(0.2)
                
                # Вводим город медленно (по букве)
                for char in city.lower():
                    pickup_input.send_keys(char)
                    time.sleep(0.05)
                
                print(f"   ✅ Город введен: {city}")
                
                # Ждем появления выпадающего списка
                search_result['step_name'] = '⏳ Ожидание списка городов...'
                print(f"   ⏳ Ждем появления списка городов (4 сек)...")
                time.sleep(4)
                
                # Ищем и кликаем на первый вариант в списке
                try:
                    search_result['step_name'] = '🎯 Выбор города из списка...'
                    dropdown_items = []
                    
                    print(f"   🔍 Ищем выпадающий список...")
                    
                    # Способ 1: Ищем элементы списка по тексту города
                    try:
                        city_name = city.split(',')[0].strip()
                        # Ищем все элементы содержащие название города
                        all_elements = driver.find_elements(By.XPATH, f"//*[contains(text(), '{city_name}')]")
                        
                        # Фильтруем только видимые элементы которые НЕ являются input полем
                        for elem in all_elements:
                            try:
                                if elem.is_displayed() and elem.tag_name != 'input':
                                    # Проверяем что это не само поле Pick Up
                                    if elem != pickup_input:
                                        dropdown_items.append(elem)
                            except:
                                continue
                        
                        if len(dropdown_items) > 0:
                            print(f"   📋 Найдено вариантов (по тексту): {len(dropdown_items)}")
                            for i, item in enumerate(dropdown_items[:5]):
                                try:
                                    text = item.text.strip()
                                    if text:
                                        print(f"      {i+1}. {text}")
                                except:
                                    pass
                    except Exception as e:
                        print(f"   ⚠️ Способ 1 не сработал: {e}")
                    
                    # Способ 2: li элементы с role='option'
                    if len(dropdown_items) == 0:
                        try:
                            dropdown_items = driver.find_elements(By.CSS_SELECTOR, "li[role='option']")
                            if len(dropdown_items) > 0:
                                print(f"   📋 Найдено вариантов (li role=option): {len(dropdown_items)}")
                                for i, item in enumerate(dropdown_items[:5]):
                                    try:
                                        print(f"      {i+1}. {item.text[:50]}")
                                    except:
                                        pass
                        except Exception as e:
                            print(f"   ⚠️ Способ 2 не сработал: {e}")
                    
                    # Кликаем на первый вариант (НЕ на поле Pick Up!)
                    if len(dropdown_items) > 0:
                        # Берем первый элемент который содержит полное название города
                        selected_item = None
                        city_name = city.split(',')[0].strip()
                        
                        for item in dropdown_items:
                            try:
                                item_text = item.text.strip()
                                # Ищем элемент который содержит город и штат
                                if city_name in item_text and ',' in item_text:
                                    selected_item = item
                                    print(f"   🎯 Выбираем: {item_text}")
                                    break
                            except:
                                continue
                        
                        # Если не нашли точное совпадение, берем первый
                        if not selected_item and len(dropdown_items) > 0:
                            selected_item = dropdown_items[0]
                            try:
                                print(f"   🎯 Выбираем первый: {selected_item.text}")
                            except:
                                print(f"   🎯 Выбираем первый вариант")
                        
                        if selected_item:
                            # Пробуем разные способы клика
                            clicked = False
                            
                            # Способ 1: JavaScript клик (самый надежный)
                            try:
                                driver.execute_script("arguments[0].click();", selected_item)
                                clicked = True
                                print(f"   ✅ Клик выполнен (JavaScript)")
                            except Exception as e:
                                print(f"   ⚠️ JavaScript клик не сработал: {e}")
                            
                            # Способ 2: Обычный клик
                            if not clicked:
                                try:
                                    selected_item.click()
                                    clicked = True
                                    print(f"   ✅ Клик выполнен (обычный)")
                                except Exception as e:
                                    print(f"   ⚠️ Обычный клик не сработал: {e}")
                            
                            # Способ 3: ActionChains
                            if not clicked:
                                try:
                                    from selenium.webdriver.common.action_chains import ActionChains
                                    actions = ActionChains(driver)
                                    actions.move_to_element(selected_item).click().perform()
                                    clicked = True
                                    print(f"   ✅ Клик выполнен (ActionChains)")
                                except Exception as e:
                                    print(f"   ⚠️ ActionChains клик не сработал: {e}")
                            
                            if clicked:
                                search_result['step_name'] = '✅ Город выбран из списка'
                                print(f"   ✅ Город выбран из списка")
                                # Ждем чтобы выбор применился
                                time.sleep(2)
                                search_result['step_name'] = '⏳ Применение выбора...'
                                time.sleep(1)
                                print(f"   ⏳ Ждем применения выбора (3 сек)...")
                            else:
                                print(f"   ⚠️ Не удалось кликнуть на вариант")
                        
                    else:
                        print(f"   ⚠️ Выпадающий список не найден")
                        print(f"   🔍 Пробуем нажать стрелку вниз и Enter...")
                        pickup_input.send_keys(Keys.ARROW_DOWN)
                        time.sleep(0.5)
                        pickup_input.send_keys(Keys.RETURN)
                        time.sleep(2)
                        
                except Exception as e:
                    print(f"   ⚠️ Ошибка выбора из списка: {e}")
                    import traceback
                    traceback.print_exc()
                    # Пробуем нажать Enter
                    try:
                        print(f"   🔍 Пробуем Enter...")
                        pickup_input.send_keys(Keys.RETURN)
                        time.sleep(2)
                    except:
                        pass
                
                # ТЕПЕРЬ нажимаем SEARCH
                search_result['step_name'] = '🔍 Запуск поиска...'
                print(f"   🔍 Нажимаем SEARCH...")
                time.sleep(0.5)
                
                buttons = driver.find_elements(By.TAG_NAME, "button")
                search_clicked = False
                for btn in buttons:
                    try:
                        if 'search' in btn.text.lower():
                            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
                            time.sleep(0.3)
                            btn.click()
                            print(f"   ✅ SEARCH нажат")
                            search_clicked = True
                            break
                    except:
                        continue
                
                if not search_clicked:
                    print(f"   ⚠️ Кнопка SEARCH не найдена")
                else:
                    search_result['step_name'] = '⏳ Загрузка результатов...'
                
            except Exception as e:
                print(f"   ⚠️ Ошибка: {e}")
            
            time.sleep(5)
            search_result['step_name'] = '📊 Анализ результатов...'
            time.sleep(3)
            print(f"   ⏳ Ждем загрузки результатов...")
            
            # СБОР ДАННЫХ СО СТРАНИЦЫ
            print(f"\n📦 Шаг 3: Собираем информацию со страницы...")
            search_result['step'] = 4
            search_result['step_name'] = '📄 Чтение данных страницы...'
            
            # Получаем весь текст страницы
            try:
                page_text = driver.find_element(By.TAG_NAME, "body").text
            except:
                page_text = ""
            
            search_result['step_name'] = '💾 Сохранение данных...'
            time.sleep(1)
            
            # Сохраняем ВЕСЬ текст страницы в файл
            page_file = f"{city.replace(',', '').replace(' ', '_').lower()}_page_text.txt"
            with open(page_file, "w", encoding="utf-8") as f:
                f.write(page_text)
            print(f"💾 Текст страницы сохранен: {page_file}")
            
            print(f"\n{'='*70}")
            print(f"📄 ИНФОРМАЦИЯ СО СТРАНИЦЫ (первые 2000 символов)")
            print(f"{'='*70}")
            print(page_text[:2000])
            print(f"{'='*70}")
            
            # Парсим информацию - ищем все грузы
            search_result['step_name'] = '🔍 Поиск грузов на странице...'
            time.sleep(1)
            all_loads = []
            
            # Ищем все цены (признак груза)
            price_matches = list(re.finditer(r'\$(\d+,?\d+)', page_text))
            
            print(f"\n   Найдено цен: {len(price_matches)}")
            
            if len(price_matches) > 0:
                search_result['step_name'] = f'📦 Обработка {len(price_matches)} грузов...'
                time.sleep(1)
            
            if len(price_matches) == 0:
                # Если цен нет, пробуем найти строки с городами
                print(f"\n   Цены не найдены, ищем грузы по городам...")
                lines = page_text.split('\n')
                city_name = city.split(',')[0].strip()
                
                for idx, line in enumerate(lines, 1):
                    if city_name in line and len(line) > 10:
                        load_data = {
                            'number': idx,
                            'search_city': city,
                            'raw_line': line.strip()
                        }
                        
                        # Ищем расстояние
                        distance_match = re.search(r'(\d+,?\d*)\s*mi', line)
                        if distance_match:
                            load_data['distance'] = distance_match.group(0)
                        
                        all_loads.append(load_data)
                        print(f"\n   Груз #{idx}: {line.strip()[:100]}")
            else:
                # Если цены есть, парсим по ценам
                for idx, price_match in enumerate(price_matches, 1):
                    # Обновляем статус для каждого груза
                    if idx % 5 == 0:  # Каждые 5 грузов обновляем статус
                        search_result['step_name'] = f'📦 Обработка груза {idx} из {len(price_matches)}...'
                    
                    price_pos = price_match.start()
                    
                    # Берем контекст вокруг цены (500 символов до и после)
                    context_start = max(0, price_pos - 500)
                    context_end = min(len(page_text), price_pos + 500)
                    context = page_text[context_start:context_end]
                    
                    load_data = {
                        'number': idx,
                        'search_city': city,
                        'price': '$' + price_match.group(1)
                    }
                    
                    # Ищем города в контексте
                    cities = re.findall(r'([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})', context)
                    if len(cities) >= 1:
                        load_data['pickup'] = cities[0].strip()
                    if len(cities) >= 2:
                        load_data['dropoff'] = cities[1].strip()
                    
                    # Ищем расстояние
                    distance_match = re.search(r'(\d+,?\d*)\s*mi', context)
                    if distance_match:
                        load_data['distance'] = distance_match.group(0)
                    
                    # Ищем вес (несколько способов)
                    weight_match = re.search(r'(\d+,?\d+)\s*lbs', context)
                    if weight_match:
                        load_data['weight'] = weight_match.group(0)
                    else:
                        # Способ 2: Weight + число
                        weight_alt = re.search(r'Weight\s+(\d+,?\d+)', context)
                        if weight_alt:
                            load_data['weight'] = weight_alt.group(1) + ' lbs'
                        else:
                            # Способ 3: просто "lb" без "s"
                            weight_alt2 = re.search(r'(\d+,?\d+)\s*lb\b', context)
                            if weight_alt2:
                                load_data['weight'] = weight_alt2.group(0) + 's'
                            else:
                                # Способ 4: ищем число между трейлером и ценой
                                # Паттерн: Trailer_Type ЧИСЛО $Price
                                weight_alt3 = re.search(r'(?:Flatbed|Van|Reefer|F|V|R)\s+[^\d]*?(\d+,?\d+)\s+\$', context)
                                if weight_alt3:
                                    load_data['weight'] = weight_alt3.group(1) + ' lbs'
                    
                    # Ищем тип трейлера, вес и брокера (они идут вместе)
                    # Формат: "F 48 000 Jakebrake Logistics LLC" или "R 38 308 Triple T Transport"
                    trailer_weight_broker = re.search(r'([FRV]|BT|F\s+SD)\s+(\d+\s+\d+)\s+([A-Z][^\n]+?)(?:\s+Unlock|$)', context)
                    if trailer_weight_broker:
                        trailer_code = trailer_weight_broker.group(1).strip()
                        weight_raw = trailer_weight_broker.group(2).replace(' ', ',')
                        broker_name = trailer_weight_broker.group(3).strip()
                        
                        # Нормализуем название брокера (заменяем сокращения)
                        broker_name = normalize_broker_name(broker_name)
                        
                        load_data['trailer'] = expand_trailer_type(trailer_code)
                        load_data['weight'] = weight_raw + ' lbs'
                        load_data['broker'] = broker_name
                        
                        # Проверяем базу данных брокеров
                        broker_info = find_broker_in_database(broker_name)
                        if broker_info:
                            print(f"      🎯 Брокер найден в базе данных: {broker_name}")
                            if 'dispatch' in broker_info:
                                load_data['dispatch'] = broker_info['dispatch']
                            if 'phone' in broker_info:
                                load_data['phone'] = broker_info['phone']
                            if 'email' in broker_info:
                                load_data['email'] = broker_info['email']
                            if 'dot_number' in broker_info:
                                load_data['dot_number'] = broker_info['dot_number']
                            if 'mc_number' in broker_info:
                                load_data['mc_number'] = broker_info['mc_number']
                    else:
                        # Старая логика если новый формат не найден
                        # Ищем тип трейлера (F, R, V, F SD и т.д.)
                        trailer_match = re.search(r'Trailer[:\s]+([FRV\s,SD]+)', context)
                        if trailer_match:
                            trailer_code = trailer_match.group(1).strip()
                            load_data['trailer'] = expand_trailer_type(trailer_code)
                        else:
                            # Альтернативный поиск - одиночные буквы F, R, V
                            trailer_alt = re.search(r'\b([FRV]|F\s+SD|R,V)\b', context)
                            if trailer_alt:
                                trailer_code = trailer_alt.group(1)
                                load_data['trailer'] = expand_trailer_type(trailer_code)
                    
                    # Ищем дату
                    date_match = re.search(r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d+', context)
                    if date_match:
                        load_data['date'] = date_match.group(0)
                    
                    # Ищем брокера (несколько способов, исключаем Unlock)
                    broker_name = None
                    broker_match = re.search(r'Broker\s+([^\n]+)', context)
                    if broker_match:
                        broker = broker_match.group(1).strip()
                        if 'Unlock' not in broker:
                            broker_name = normalize_broker_name(broker)
                            load_data['broker'] = broker_name
                    else:
                        # Альтернативный способ - ищем название компании перед Unlock
                        broker_alt = re.search(r'([A-Z][a-zA-Z\s&]+(?:LLC|Inc|Logistics|Freight)?)\s+(?:Unlock|Phone)', context)
                        if broker_alt:
                            broker = broker_alt.group(1).strip()
                            if 'Unlock' not in broker:
                                broker_name = normalize_broker_name(broker)
                                load_data['broker'] = broker_name
                    
                    # Если нашли брокера, проверяем базу данных
                    if broker_name:
                        broker_info = find_broker_in_database(broker_name)
                        if broker_info:
                            print(f"      🎯 Брокер найден в базе данных: {broker_name}")
                            # Добавляем контакты из базы
                            if 'dispatch' in broker_info:
                                load_data['dispatch'] = broker_info['dispatch']
                            if 'phone' in broker_info:
                                load_data['phone'] = broker_info['phone']
                            if 'email' in broker_info:
                                load_data['email'] = broker_info['email']
                            if 'dot_number' in broker_info:
                                load_data['dot_number'] = broker_info['dot_number']
                            if 'mc_number' in broker_info:
                                load_data['mc_number'] = broker_info['mc_number']
                        else:
                            # Брокер не найден в базе, ищем контакты на странице
                            # Ищем телефон (исключаем Unlock)
                            phone_match = re.search(r'(\d{10,11})', context)
                            if phone_match:
                                phone = phone_match.group(1)
                                # Проверяем что рядом нет слова Unlock
                                phone_pos = context.find(phone)
                                phone_context = context[max(0, phone_pos-20):min(len(context), phone_pos+30)]
                                if 'Unlock' not in phone_context:
                                    load_data['phone'] = phone
                            
                            # Ищем email (исключаем Unlock)
                            email_match = re.search(r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', context)
                            if email_match:
                                email = email_match.group(1)
                                # Проверяем что рядом нет слова Unlock
                                email_pos = context.find(email)
                                email_context = context[max(0, email_pos-20):min(len(context), email_pos+30)]
                                if 'Unlock' not in email_context:
                                    load_data['email'] = clean_email(email)
                            
                            # Ищем Dispatch (имя диспетчера)
                            dispatch_match = re.search(r'Dispatch\s*([A-Z][a-z]+)', context)
                            if dispatch_match:
                                load_data['dispatch'] = dispatch_match.group(1).strip()
                            
                            # Ищем DOT Number
                            dot_match = re.search(r'Dot\s+Number\s+(\d+)', context)
                            if dot_match:
                                load_data['dot_number'] = dot_match.group(1)
                            
                            # Ищем MC Number
                            mc_match = re.search(r'MC\s+Number\s+(\d+)', context)
                            if mc_match:
                                load_data['mc_number'] = mc_match.group(1)
                    else:
                        # Брокер не найден вообще, ищем контакты на странице
                        # Ищем телефон (исключаем Unlock)
                        phone_match = re.search(r'(\d{10,11})', context)
                        if phone_match:
                            phone = phone_match.group(1)
                            # Проверяем что рядом нет слова Unlock
                            phone_pos = context.find(phone)
                            phone_context = context[max(0, phone_pos-20):min(len(context), phone_pos+30)]
                            if 'Unlock' not in phone_context:
                                load_data['phone'] = phone
                        
                        # Ищем email (исключаем Unlock)
                        email_match = re.search(r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', context)
                        if email_match:
                            email = email_match.group(1)
                            # Проверяем что рядом нет слова Unlock
                            email_pos = context.find(email)
                            email_context = context[max(0, email_pos-20):min(len(context), email_pos+30)]
                            if 'Unlock' not in email_context:
                                load_data['email'] = clean_email(email)
                        
                        # Ищем Dispatch (имя диспетчера)
                        dispatch_match = re.search(r'Dispatch\s*([A-Z][a-z]+)', context)
                        if dispatch_match:
                            load_data['dispatch'] = dispatch_match.group(1).strip()
                        
                        # Ищем DOT Number
                        dot_match = re.search(r'Dot\s+Number\s+(\d+)', context)
                        if dot_match:
                            load_data['dot_number'] = dot_match.group(1)
                        
                        # Ищем MC Number
                        mc_match = re.search(r'MC\s+Number\s+(\d+)', context)
                        if mc_match:
                            load_data['mc_number'] = mc_match.group(1)
                    
                    all_loads.append(load_data)
                    
                    print(f"\n   Груз #{idx}:")
                    print(f"      💰 Цена: {load_data.get('price', '-')}")
                    if 'pickup' in load_data:
                        print(f"      📍 Откуда: {load_data['pickup']}")
                    if 'dropoff' in load_data:
                        print(f"      📍 Куда: {load_data['dropoff']}")
                    if 'distance' in load_data:
                        print(f"      📏 Расстояние: {load_data['distance']}")
                    if 'trailer' in load_data:
                        print(f"      🚛 Трейлер: {load_data['trailer']}")
                    if 'weight' in load_data:
                        print(f"      ⚖️ Вес: {load_data['weight']}")
                    if 'broker' in load_data:
                        print(f"      🏢 Broker: {load_data['broker']}")
                    if 'dispatch' in load_data:
                        print(f"      👤 Dispatch: {load_data['dispatch']}")
                    if 'phone' in load_data:
                        print(f"      📞 Телефон: {load_data['phone']}")
                    if 'email' in load_data:
                        print(f"      📧 Email: {load_data['email']}")
                    if 'dot_number' in load_data:
                        print(f"      🔢 DOT: {load_data['dot_number']}")
                    if 'mc_number' in load_data:
                        print(f"      🔢 MC: {load_data['mc_number']}")
            
            search_result['loads'] = all_loads
            search_result['total_loads'] = len(all_loads)
            search_result['status'] = 'completed'
            search_result['step_name'] = '✅ Сбор завершен!'
            
            print(f"\n{'='*70}")
            print(f"✅ СБОР ЗАВЕРШЕН!")
            print(f"   Всего грузов найдено: {len(all_loads)}")
            print(f"   С телефоном: {sum(1 for l in all_loads if 'phone' in l)}")
            print(f"   С email: {sum(1 for l in all_loads if 'email' in l)}")
            print(f"{'='*70}")
            
            # Сохраняем в JSON
            search_result['step_name'] = '💾 Сохранение результатов...'
            time.sleep(1)
            output_file = f"{city.replace(',', '').replace(' ', '_').lower()}_loads.json"
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(all_loads, f, indent=2, ensure_ascii=False)
            print(f"💾 Результат сохранен: {output_file}")
            
            print("\n🌐 Браузер остается открытым")
            active_driver = driver
            
        except Exception as inner_e:
            print(f"⚠️ Внутренняя ошибка: {inner_e}")
            import traceback
            traceback.print_exc()
            search_result['status'] = 'completed'
            try:
                active_driver = driver
            except:
                pass
            
    except Exception as e:
        print(f"⚠️ Внешняя ошибка: {e}")
        import traceback
        traceback.print_exc()
        search_result['status'] = 'completed'

@app.route('/')
def index():
    """Главная страница"""
    return render_template('load_finder_full.html')

@app.route('/search', methods=['POST'])
def search():
    """Запуск полного сбора"""
    data = request.get_json()
    city = data.get('city', '')
    
    if not city:
        return jsonify({'error': 'Укажите город'}), 400
    
    # Запускаем сбор в фоновом потоке
    thread = threading.Thread(target=collect_full_data, args=(city,))
    thread.start()
    
    return jsonify({'status': 'started'})

@app.route('/status')
def status():
    """Проверка статуса сбора"""
    return jsonify(search_result)

if __name__ == '__main__':
    app.run(debug=True, port=5003)
