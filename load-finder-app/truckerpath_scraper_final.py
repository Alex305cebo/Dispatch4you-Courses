"""
Парсер грузов с TruckerPath Loadboard
Использует автоматический логин с сохраненными credentials
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
import time
import json
import random

class TruckerPathScraper:
    def __init__(self):
        self.driver = None
        self.credentials = self.load_credentials()
    
    def load_credentials(self):
        """Загружает credentials из файла"""
        try:
            with open("credentials.json", "r") as f:
                creds = json.load(f)
                return creds.get("truckerpath", {})
        except:
            print("❌ Файл credentials.json не найден!")
            print("   Запустите сначала: python truckerpath_auto_register.py")
            return None
    
    def init_browser(self, headless=True):
        """Инициализация браузера"""
        print("🚀 Запуск браузера...")
        chrome_options = Options()
        if headless:
            chrome_options.add_argument('--headless=new')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--window-size=1920,1080')
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        print("✅ Браузер готов")
    
    def login(self):
        """Логин на TruckerPath Loadboard"""
        print("\n🔐 Вход в TruckerPath Loadboard...")
        
        try:
            # Сначала очищаем все cookies для чистого логина
            print("   🧹 Очищаем cookies...")
            self.driver.delete_all_cookies()
            
            # Открываем главную страницу loadboard
            print("   🌐 Открываем loadboard.truckerpath.com...")
            self.driver.get("https://loadboard.truckerpath.com/carrier/loads/home")
            time.sleep(1.5)  # Минимум для загрузки страницы
            
            # ШАГ 1: Нажимаем кнопку "Log In" справа сверху
            print("\n   🔘 Ищем кнопку 'Log In' справа сверху...")
            
            # Пробуем разные способы найти кнопку Log In
            login_button_found = False
            
            # Способ 1: Ищем по тексту "Log In"
            try:
                login_buttons = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Log In') or contains(text(), 'LOG IN') or contains(text(), 'Sign In')]")
                for btn in login_buttons:
                    if btn.is_displayed():
                        print(f"   ✅ Найдена кнопка: {btn.text}")
                        self.driver.execute_script("arguments[0].scrollIntoView(true);", btn)
                        time.sleep(1)
                        self.driver.execute_script("arguments[0].click();", btn)
                        print("   ✅ Кнопка 'Log In' нажата!")
                        login_button_found = True
                        break
            except Exception as e:
                print(f"   ⚠️ Способ 1 не сработал: {e}")
            
            # Способ 2: Ищем div с текстом "Log In"
            if not login_button_found:
                try:
                    login_divs = self.driver.find_elements(By.XPATH, "//div[contains(text(), 'Log In')]")
                    for div in login_divs:
                        if div.is_displayed():
                            print(f"   ✅ Найден div: {div.text}")
                            self.driver.execute_script("arguments[0].scrollIntoView(true);", div)
                            time.sleep(1)
                            self.driver.execute_script("arguments[0].click();", div)
                            print("   ✅ Div 'Log In' нажат!")
                            login_button_found = True
                            break
                except Exception as e:
                    print(f"   ⚠️ Способ 2 не сработал: {e}")
            
            # Способ 3: Ищем любые кликабельные элементы в header/nav
            if not login_button_found:
                try:
                    header_elements = self.driver.find_elements(By.CSS_SELECTOR, "header a, header button, nav a, nav button, [class*='header'] a, [class*='nav'] button")
                    for elem in header_elements:
                        elem_text = elem.text.upper()
                        if "LOG" in elem_text or "SIGN" in elem_text:
                            print(f"   ✅ Найден элемент в header: {elem.text}")
                            self.driver.execute_script("arguments[0].scrollIntoView(true);", elem)
                            time.sleep(1)
                            self.driver.execute_script("arguments[0].click();", elem)
                            print("   ✅ Элемент нажат!")
                            login_button_found = True
                            break
                except Exception as e:
                    print(f"   ⚠️ Способ 3 не сработал: {e}")
            
            if not login_button_found:
                print("   ⚠️ Кнопка Log In не найдена, возможно уже на странице логина")
            
            # ШАГ 2: ЖДЕМ появления модального окна с формой логина
            print("\n   ⏳ Ожидаем появления модального окна логина...")
            
            # Ждем появления модального окна (ищем по placeholder или другим атрибутам)
            try:
                # Пробуем найти поле Email по placeholder
                email_input = WebDriverWait(self.driver, 15).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "input[placeholder='Email address'], input[type='email'], input[id*='email']"))
                )
                print("   ✅ Модальное окно логина появилось!")
            except:
                # Альтернативный способ - ищем по ID
                email_input = WebDriverWait(self.driver, 15).until(
                    EC.presence_of_element_located((By.ID, "sign-in_email"))
                )
                print("   ✅ Форма логина появилась!")
            
            time.sleep(2)  # Дополнительная пауза для полной загрузки формы
            
            # ШАГ 3: Заполняем форму логина
            print("\n   📝 Заполнение формы логина...")
            
            # Прокручиваем к полю
            self.driver.execute_script("arguments[0].scrollIntoView(true);", email_input)
            
            # Заполняем Email
            email_input.clear()
            email_input.click()
            email_input.send_keys(self.credentials['username'])
            
            print(f"   ✅ Email: {self.credentials['username']}")
            
            # Вводим password
            try:
                # Пробуем найти по ID
                password_input = self.driver.find_element(By.ID, "sign-in_password")
            except:
                # Альтернативно - по placeholder или type
                password_input = self.driver.find_element(By.CSS_SELECTOR, "input[placeholder='Password'], input[type='password']")
            
            # Заполняем Password
            password_input.clear()
            password_input.click()
            password_input.send_keys(self.credentials['password'])
            
            print(f"   ✅ Password: ***")
            
            # Минимальная задержка для активации кнопки
            time.sleep(0.8)
            
            # ШАГ 4: Нажимаем кнопку "SIGN IN" в модальном окне
            print("\n   🔘 Нажимаем кнопку 'SIGN IN'...")
            
            signin_found = False
            
            # Способ 1: Ждем что синяя кнопка станет кликабельной
            try:
                signin_btn = WebDriverWait(self.driver, 10).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, "button.tlant-btn-primary"))
                )
                signin_btn.click()
                print("   ✅ Кнопка 'SIGN IN' нажата (primary button)!")
                signin_found = True
            except Exception as e:
                print(f"   ⚠️ Способ 1 не сработал: {e}")
            
            # Способ 2: Через JavaScript клик
            if not signin_found:
                try:
                    signin_buttons = self.driver.find_elements(By.XPATH, "//button[contains(text(), 'SIGN IN') or contains(text(), 'Sign In')]")
                    for btn in signin_buttons:
                        btn_text = btn.text.strip().upper()
                        if "SIGN IN" in btn_text and "UP" not in btn_text:
                            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
                            time.sleep(1)
                            self.driver.execute_script("arguments[0].click();", btn)
                            print("   ✅ Кнопка 'SIGN IN' нажата (JS)!")
                            signin_found = True
                            break
                except Exception as e:
                    print(f"   ⚠️ Способ 2 не сработал: {e}")
            
            # Способ 3: Ищем submit кнопку в модальном окне
            if not signin_found:
                try:
                    submit_btn = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
                    self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", submit_btn)
                    time.sleep(1)
                    self.driver.execute_script("arguments[0].click();", submit_btn)
                    print("   ✅ Кнопка 'SIGN IN' нажата (submit)!")
                    signin_found = True
                except Exception as e:
                    print(f"   ⚠️ Способ 3 не сработал: {e}")
            
            # Способ 4: Нажимаем Enter в поле password
            if not signin_found:
                try:
                    from selenium.webdriver.common.keys import Keys
                    password_input.send_keys(Keys.RETURN)
                    print("   ✅ Нажат Enter в поле password!")
                    signin_found = True
                except Exception as e:
                    print(f"   ⚠️ Способ 4 не сработал: {e}")
            
            if not signin_found:
                print("   ❌ Кнопка SIGN IN не найдена!")
            
            time.sleep(5)
            
            # Проверяем успешность логина
            current_url = self.driver.current_url
            print(f"\n   📍 Текущий URL: {current_url}")
            
            if "loads" in current_url and "sign-in" not in current_url:
                print("✅ Вход выполнен успешно!")
                return True
            else:
                print(f"⚠️ Возможно требуется дополнительная проверка")
                # Сохраняем скриншот для отладки
                self.driver.save_screenshot("login_result.png")
                print("   📸 Скриншот сохранен: login_result.png")
                return False
            
        except Exception as e:
            print(f"❌ Ошибка входа: {e}")
            import traceback
            traceback.print_exc()
            # Сохраняем скриншот для отладки
            try:
                self.driver.save_screenshot("login_error.png")
                print("   📸 Скриншот ошибки сохранен: login_error.png")
            except:
                pass
            return False
    
    def search_loads(self, origin_city="Los Angeles", origin_state="CA", equipment="Van"):
        """Поиск грузов через форму"""
        print(f"\n🔍 Поиск грузов: {origin_city}, {origin_state}")
        
        try:
            # Обновляем страницу после логина
            print("   🔄 Обновляем страницу...")
            self.driver.refresh()
            time.sleep(3)  # Ждем полной загрузки
            
            # Ищем поле Pick Up
            print("   📝 Ищем поле Pick Up...")
            try:
                # Пробуем разные селекторы
                pickup_input = None
                
                # Способ 1: По placeholder
                try:
                    pickup_input = self.driver.find_element(By.CSS_SELECTOR, "input[placeholder*='Pick Up']")
                    print("   ✅ Найдено по placeholder")
                except:
                    pass
                
                # Способ 2: По ID или name
                if not pickup_input:
                    try:
                        pickup_input = self.driver.find_element(By.CSS_SELECTOR, "input[id*='pick'], input[name*='pick']")
                        print("   ✅ Найдено по ID/name")
                    except:
                        pass
                
                # Способ 3: Ищем все input и находим нужный
                if not pickup_input:
                    inputs = self.driver.find_elements(By.TAG_NAME, "input")
                    for inp in inputs:
                        placeholder = inp.get_attribute('placeholder') or ''
                        if 'pick' in placeholder.lower():
                            pickup_input = inp
                            print(f"   ✅ Найдено: placeholder='{placeholder}'")
                            break
                
                if pickup_input:
                    pickup_input.click()
                    time.sleep(0.5)
                    
                    # Вводим город и штат
                    search_text = f"{origin_city}, {origin_state}"
                    pickup_input.clear()
                    pickup_input.send_keys(search_text)
                    print(f"   ✅ Pick Up: {search_text}")
                    time.sleep(1.5)
                    
                    # Нажимаем Enter
                    from selenium.webdriver.common.keys import Keys
                    pickup_input.send_keys(Keys.RETURN)
                    time.sleep(1)
                else:
                    print("   ⚠️ Поле Pick Up не найдено")
                
            except Exception as e:
                print(f"   ⚠️ Ошибка заполнения Pick Up: {e}")
            
            # Нажимаем кнопку SEARCH
            print("   🔘 Ищем кнопку SEARCH...")
            try:
                # Пробуем разные способы найти кнопку
                search_btn = None
                
                # Способ 1: По тексту
                try:
                    search_btn = self.driver.find_element(By.XPATH, "//button[contains(text(), 'SEARCH') or contains(text(), 'Search')]")
                except:
                    pass
                
                # Способ 2: По классу
                if not search_btn:
                    try:
                        buttons = self.driver.find_elements(By.TAG_NAME, "button")
                        for btn in buttons:
                            if 'search' in btn.text.lower():
                                search_btn = btn
                                break
                    except:
                        pass
                
                if search_btn:
                    search_btn.click()
                    print("   ✅ Кнопка SEARCH нажата!")
                    time.sleep(3)
                else:
                    print("   ⚠️ Кнопка SEARCH не найдена")
                
            except Exception as e:
                print(f"   ⚠️ Ошибка нажатия SEARCH: {e}")
            
            print("✅ Поиск выполнен")
            return True
            
        except Exception as e:
            print(f"❌ Ошибка поиска: {e}")
            return False
    
    def parse_loads(self):
        """Парсит грузы со страницы результатов - сканирует весь текст"""
        print("\n📦 Парсинг грузов...")
        
        loads = []
        
        try:
            # Сохраняем HTML результатов для анализа
            html = self.driver.page_source
            with open("search_results.html", "w", encoding="utf-8") as f:
                f.write(html)
            self.driver.save_screenshot("search_results.png")
            print("   📸 Сохранено: search_results.html и search_results.png")
            
            # Ждем загрузки результатов
            time.sleep(3)
            
            # Получаем ВЕСЬ текст страницы
            print("   🔍 Сканируем весь текст страницы...")
            page_text = self.driver.find_element(By.TAG_NAME, "body").text
            
            # Сохраняем текст для анализа
            with open("page_text.txt", "w", encoding="utf-8") as f:
                f.write(page_text)
            print("   📄 Текст сохранен: page_text.txt")
            
            # Разбиваем на строки
            lines = page_text.split('\n')
            print(f"   Всего строк: {len(lines)}")
            
            # Ищем паттерны грузов
            import re
            
            current_load = {}
            
            for i, line in enumerate(lines):
                line = line.strip()
                if not line:
                    continue
                
                # Ищем города с штатами (например: "Houston, TX" или "Los Angeles, CA")
                city_state_match = re.search(r'([A-Z][a-zA-Z\s]+),\s*([A-Z]{2})', line)
                
                # Ищем даты (Feb 24, Mar 02, etc)
                date_match = re.search(r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}', line)
                
                # Ищем расстояния (1092mi, 500mi, etc)
                distance_match = re.search(r'(\d+,?\d*)\s*mi', line)
                
                # Ищем цены ($2,250, $1,500, etc)
                price_match = re.search(r'\$(\d+,?\d+)', line)
                
                # Ищем вес (48,000 lbs, 45000 lbs, etc)
                weight_match = re.search(r'(\d+,?\d+)\s*lbs', line)
                
                # Ищем телефоны (10 цифр)
                phone_match = re.search(r'(\d{10})', line)
                
                # Ищем email
                email_match = re.search(r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', line)
                
                # Собираем данные
                if city_state_match:
                    city = city_state_match.group(1).strip()
                    state = city_state_match.group(2)
                    location = f"{city}, {state}"
                    
                    # Определяем это origin или destination
                    if 'origin' not in current_load:
                        current_load['origin'] = location
                    elif 'destination' not in current_load:
                        current_load['destination'] = location
                
                if date_match and 'pickup_date' not in current_load:
                    current_load['pickup_date'] = date_match.group(0)
                
                if distance_match and 'distance' not in current_load:
                    current_load['distance'] = distance_match.group(1) + ' mi'
                
                if price_match and 'rate' not in current_load:
                    current_load['rate'] = '$' + price_match.group(1)
                
                if weight_match and 'weight' not in current_load:
                    current_load['weight'] = weight_match.group(1) + ' lbs'
                
                if phone_match and 'phone' not in current_load:
                    current_load['phone'] = phone_match.group(1)
                
                if email_match and 'email' not in current_load:
                    current_load['email'] = email_match.group(1)
                
                # Если собрали достаточно данных - сохраняем груз
                if 'origin' in current_load and 'destination' in current_load:
                    load_data = {
                        'id': f"TP{random.randint(10000, 99999)}",
                        'origin': current_load.get('origin', 'N/A'),
                        'destination': current_load.get('destination', 'N/A'),
                        'pickup_date': current_load.get('pickup_date', 'N/A'),
                        'distance': current_load.get('distance', 'N/A'),
                        'weight': current_load.get('weight', 'N/A'),
                        'rate': current_load.get('rate', 'N/A'),
                        'phone': current_load.get('phone', 'N/A'),
                        'email': current_load.get('email', 'N/A'),
                        'equipment': 'Van',
                        'broker': 'TruckerPath',
                        'source': 'TruckerPath Loadboard'
                    }
                    loads.append(load_data)
                    current_load = {}  # Начинаем новый груз
                    
                    # Ограничиваем количество
                    if len(loads) >= 50:
                        break
            
            print(f"✅ Спарсено грузов: {len(loads)}")
            return loads
            
        except Exception as e:
            print(f"❌ Ошибка парсинга: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def run(self):
        """Запускает полный процесс"""
        print("="*70)
        print("🚛 TRUCKERPATH LOADBOARD SCRAPER")
        print("="*70)
        
        if not self.credentials:
            return []
        
        try:
            # Инициализируем браузер
            self.init_browser(headless=False)  # Видимый для отладки
            
            # Логинимся
            if not self.login():
                print("❌ Не удалось войти")
                return []
            
            # Сохраняем HTML и скриншот для анализа
            print("\n📸 Сохраняем страницу для анализа...")
            html = self.driver.page_source
            with open("page_after_login.html", "w", encoding="utf-8") as f:
                f.write(html)
            self.driver.save_screenshot("page_after_login.png")
            print("✅ Сохранено: page_after_login.html и page_after_login.png")
            
            # Ищем грузы
            success = self.search_loads()
            
            # Парсим грузы
            loads = []
            if success:
                loads = self.parse_loads()
            
            print(f"\n✅ Всего найдено грузов: {len(loads)}")
            
            return loads
            
        except Exception as e:
            print(f"\n❌ ОШИБКА: {e}")
            return []
        
        finally:
            if self.driver:
                print("\n⏳ Браузер закроется через 10 секунд...")
                time.sleep(10)
                self.driver.quit()

if __name__ == "__main__":
    scraper = TruckerPathScraper()
    loads = scraper.run()
    
    if loads:
        print(f"\n📊 Примеры грузов:")
        for i, load in enumerate(loads[:5], 1):
            print(f"\n{i}. {load['origin']} → {load['destination']}")
            print(f"   Pickup: {load['pickup_date']}")
            print(f"   Equipment: {load['equipment']}")
            print(f"   Broker: {load['broker']}")
