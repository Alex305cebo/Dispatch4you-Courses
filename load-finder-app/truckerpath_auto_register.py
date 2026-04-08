"""
Автоматическая регистрация на TruckerPath Loadboard
Следует точному процессу с получением 6-значного кода верификации
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
import random
import string
import re
import json

class TruckerPathAutoRegister:
    def __init__(self):
        self.driver = None
        self.temp_mail_driver = None
        self.email = None
        self.password = None
        self.first_name = None
        self.last_name = None
        self.phone = None
    
    def init_browsers(self):
        """Инициализация двух браузеров - для temp-mail и TruckerPath"""
        print("🚀 Запуск браузеров...")
        
        chrome_options = Options()
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--window-size=1920,1080')
        
        service = Service(ChromeDriverManager().install())
        
        # Браузер для temp-mail
        self.temp_mail_driver = webdriver.Chrome(service=service, options=chrome_options)
        print("✅ Браузер temp-mail готов")
        
        # Браузер для TruckerPath
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        print("✅ Браузер TruckerPath готов")
    
    def generate_random_data(self):
        """Генерирует случайные данные для регистрации"""
        print("\n📝 Генерация данных...")
        
        # Имя и фамилия
        first_names = ['John', 'Mike', 'David', 'James', 'Robert', 'William', 'Richard', 'Thomas']
        last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis']
        
        self.first_name = random.choice(first_names)
        self.last_name = random.choice(last_names)
        
        # Телефон (555-XXX-XXXX формат)
        self.phone = f"555{random.randint(1000000, 9999999)}"
        
        # Пароль (минимум 8 символов, буквы и цифры)
        self.password = ''.join(random.choices(string.ascii_letters + string.digits, k=10)) + "!1Aa"
        
        print(f"   First Name: {self.first_name}")
        print(f"   Last Name: {self.last_name}")
        print(f"   Phone: {self.phone}")
        print(f"   Password: {self.password}")
    
    def get_temp_email(self):
        """Получает временный email с нескольких сервисов (fallback)"""
        print("\n📧 Получение временного email...")
        
        # Список сервисов для попытки
        services = [
            {
                'name': 'temp-mail.org',
                'url': 'https://temp-mail.org/ru/',
                'selector': 'ID:mail',
                'wait': 3
            },
            {
                'name': 'mohmal.com',
                'url': 'https://www.mohmal.com/ru/inbox',
                'selector': 'TEXT',  # Ищем в тексте страницы
                'wait': 5
            },
            {
                'name': 'minuteinbox.com',
                'url': 'https://www.minuteinbox.com/',
                'selector': 'TEXT',
                'wait': 5
            },
            {
                'name': 'internxt.com',
                'url': 'https://internxt.com/ru/temporary-email',
                'selector': 'TEXT',
                'wait': 5
            }
        ]
        
        for service in services:
            try:
                print(f"\n   🔄 Пробуем {service['name']}...")
                self.temp_mail_driver.get(service['url'])
                time.sleep(service['wait'])
                
                # Метод 1: Поиск по ID (для temp-mail.org)
                if service['selector'].startswith('ID:'):
                    element_id = service['selector'].split(':')[1]
                    for attempt in range(10):
                        try:
                            email_input = self.temp_mail_driver.find_element(By.ID, element_id)
                            email_value = email_input.get_attribute('value')
                            
                            if email_value and '@' in email_value and 'Загрузка' not in email_value and len(email_value) > 5:
                                self.email = email_value
                                print(f"   ✅ Email создан ({service['name']}): {self.email}")
                                return True
                            
                            time.sleep(1)
                        except:
                            time.sleep(1)
                
                # Метод 2: Поиск в тексте страницы (универсальный)
                elif service['selector'] == 'TEXT':
                    for attempt in range(10):
                        try:
                            # Ищем input поля с email
                            email_inputs = self.temp_mail_driver.find_elements(By.CSS_SELECTOR, 
                                "input[type='text'], input[type='email'], input[readonly]")
                            
                            for inp in email_inputs:
                                email_value = inp.get_attribute('value')
                                if email_value and '@' in email_value and len(email_value) > 5:
                                    self.email = email_value
                                    print(f"   ✅ Email создан ({service['name']}): {self.email}")
                                    return True
                            
                            # Альтернативно ищем в тексте страницы
                            page_text = self.temp_mail_driver.find_element(By.TAG_NAME, "body").text
                            email_match = re.search(r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', page_text)
                            if email_match:
                                potential_email = email_match.group(1)
                                # Проверяем что это не служебный email
                                if not any(x in potential_email.lower() for x in ['example', 'test', 'noreply', 'support']):
                                    self.email = potential_email
                                    print(f"   ✅ Email создан ({service['name']}): {self.email}")
                                    return True
                            
                            time.sleep(1)
                        except:
                            time.sleep(1)
                
                print(f"   ⚠️ {service['name']} не сработал")
                
            except Exception as e:
                print(f"   ⚠️ Ошибка {service['name']}: {e}")
        
        print("\n❌ Не удалось получить email ни с одного сервиса")
        return False
    
    def fill_registration_form(self):
        """Заполняет форму регистрации на TruckerPath"""
        print("\n📝 Заполнение формы регистрации...")
        
        try:
            # Открываем страницу регистрации
            url = "https://loadboard.truckerpath.com/carrier/sign-up?redirect=%2Fcarrier%2Floads%2Fhome"
            self.driver.get(url)
            time.sleep(5)
            
            print("✅ Страница регистрации открыта")
            
            # Заполняем First Name
            try:
                first_name_input = WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.ID, "sign-up_firstName"))
                )
                first_name_input.clear()
                first_name_input.send_keys(self.first_name)
                print(f"   ✅ First Name: {self.first_name}")
            except Exception as e:
                print(f"   ⚠️ First Name не найдено: {e}")
            
            # Заполняем Last Name
            try:
                last_name_input = self.driver.find_element(By.ID, "sign-up_lastName")
                last_name_input.clear()
                last_name_input.send_keys(self.last_name)
                print(f"   ✅ Last Name: {self.last_name}")
            except Exception as e:
                print(f"   ⚠️ Last Name не найдено: {e}")
            
            # Заполняем Phone
            try:
                phone_input = self.driver.find_element(By.ID, "sign-up_phone")
                phone_input.clear()
                phone_input.send_keys(self.phone)
                print(f"   ✅ Phone: {self.phone}")
            except Exception as e:
                print(f"   ⚠️ Phone не найдено: {e}")
            
            # Заполняем Email (login)
            try:
                email_input = self.driver.find_element(By.ID, "sign-up_email")
                email_input.clear()
                email_input.send_keys(self.email)
                print(f"   ✅ Email: {self.email}")
                time.sleep(1)
            except Exception as e:
                print(f"   ⚠️ Email не найдено: {e}")
            
            # Заполняем Password
            try:
                password_input = self.driver.find_element(By.ID, "sign-up_password")
                password_input.clear()
                password_input.send_keys(self.password)
                print(f"   ✅ Password: {self.password}")
                
                # Confirm Password
                confirm_password_input = self.driver.find_element(By.ID, "sign-up_rePassword")
                confirm_password_input.clear()
                confirm_password_input.send_keys(self.password)
                print(f"   ✅ Confirm Password: {self.password}")
            except Exception as e:
                print(f"   ⚠️ Password не найдено: {e}")
            
            print("\n✅ Форма заполнена")
            
            # СРАЗУ нажимаем GET CODE после заполнения формы
            print("\n📨 Нажимаем GET CODE сразу после заполнения...")
            time.sleep(2)  # Небольшая пауза для активации кнопки
            
            try:
                # Ищем кнопку GET CODE
                buttons = self.driver.find_elements(By.CSS_SELECTOR, "button.tlant-btn-text")
                for btn in buttons:
                    if "GET CODE" in btn.text:
                        self.driver.execute_script("arguments[0].scrollIntoView(true);", btn)
                        time.sleep(1)
                        btn.click()
                        print("✅ Кнопка GET CODE нажата!")
                        time.sleep(3)
                        break
            except Exception as e:
                print(f"⚠️ Не удалось нажать GET CODE: {e}")
            
            return True
            
        except Exception as e:
            print(f"❌ Ошибка заполнения формы: {e}")
            return False
    
    def request_verification_code(self):
        """Нажимает кнопку GET CODE для получения кода верификации"""
        print("\n📨 Запрос кода верификации...")
        
        try:
            # Ищем кнопку GET CODE по тексту
            get_code_btn = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'GET CODE')]"))
            )
            
            # Прокручиваем к кнопке
            self.driver.execute_script("arguments[0].scrollIntoView(true);", get_code_btn)
            time.sleep(1)
            
            # Кликаем
            get_code_btn.click()
            print("✅ Кнопка GET CODE нажата")
            time.sleep(3)
            
            return True
            
        except Exception as e:
            print(f"⚠️ Ошибка с XPath, пробуем альтернативный способ...")
            try:
                # Альтернативный способ - по классу
                buttons = self.driver.find_elements(By.CSS_SELECTOR, "button.tlant-btn-text")
                for btn in buttons:
                    if "GET CODE" in btn.text:
                        self.driver.execute_script("arguments[0].scrollIntoView(true);", btn)
                        time.sleep(1)
                        btn.click()
                        print("✅ Кнопка GET CODE нажата (альтернативный способ)")
                        time.sleep(3)
                        return True
                
                print(f"❌ Кнопка GET CODE не найдена")
                return False
            except Exception as e2:
                print(f"❌ Ошибка нажатия GET CODE: {e2}")
                return False
    
    def get_verification_code_from_email(self, timeout=120):
        """Получает 6-значный код верификации из temp-mail или internxt"""
        print(f"\n📬 Ожидание кода верификации (до {timeout} секунд)...")
        print("🔍 Ищем надпись 'is your Truckloads Verification Code'")
        print("   Сканируем страницу каждые 3 секунды...")
        
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            try:
                # Получаем весь текст страницы
                page_text = self.temp_mail_driver.find_element(By.TAG_NAME, "body").text
                
                # ГЛАВНЫЙ ПОИСК: ищем паттерн "XXXXXX is your Truckloads Verification Code"
                # Пример: "525424 is your Truckloads Verification Code"
                code_match = re.search(r'(\d{6})\s+is\s+your\s+Truckloads\s+Verification\s+Code', page_text, re.IGNORECASE)
                
                if code_match:
                    code = code_match.group(1)
                    print(f"\n✅ КОД НАЙДЕН: {code}")
                    print(f"   Полная строка: '{code} is your Truckloads Verification Code'")
                    return code
                
                # Показываем прогресс
                remaining = int(timeout - (time.time() - start_time))
                if remaining % 10 == 0:  # Каждые 10 секунд
                    print(f"   ⏳ Код не найден, продолжаем поиск... (осталось {remaining} сек)")
                
                time.sleep(3)  # Проверяем каждые 3 секунды
                
            except Exception as e:
                print(f"   ⚠️ Ошибка при сканировании: {e}")
                time.sleep(3)
        
        print("\n⏰ Время ожидания истекло - код не найден")
        print("   Возможные причины:")
        print("   - Письмо не пришло")
        print("   - Код находится в другом месте на странице")
        print("   - Временный email не работает")
        return None
    
    def enter_verification_code(self, code):
        """Вводит 6-значный код верификации"""
        print(f"\n🔢 Ввод кода верификации: {code}")
        
        try:
            # Ищем поле для кода по ID
            code_input = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "sign-up_code"))
            )
            
            code_input.clear()
            code_input.send_keys(code)
            print("✅ Код введен")
            time.sleep(2)
            
            return True
            
        except Exception as e:
            print(f"❌ Ошибка ввода кода: {e}")
            return False
    
    def submit_registration(self):
        """Нажимает кнопку SIGN UP"""
        print("\n✅ Отправка формы регистрации...")
        
        try:
            # Сначала пытаемся закрыть cookie banner если он есть
            try:
                cookie_buttons = self.driver.find_elements(By.CSS_SELECTOR, "[data-testid='preferences-link'], .termly-styles-root-d5f974, button[aria-label='Close']")
                for btn in cookie_buttons:
                    try:
                        btn.click()
                        print("   ✅ Cookie banner закрыт")
                        time.sleep(1)
                        break
                    except:
                        pass
            except:
                pass
            
            # Ищем кнопку SIGN UP - пробуем разные способы
            
            # Способ 1: По тексту через XPath
            try:
                signup_btn = WebDriverWait(self.driver, 10).until(
                    EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'SIGN UP')]"))
                )
                # Прокручиваем к кнопке
                self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", signup_btn)
                time.sleep(1)
                # Кликаем через JavaScript (надежнее)
                self.driver.execute_script("arguments[0].click();", signup_btn)
                print("✅ Кнопка SIGN UP нажата (XPath + JS)")
            except:
                # Способ 2: По типу submit
                try:
                    signup_btn = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
                    self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", signup_btn)
                    time.sleep(1)
                    self.driver.execute_script("arguments[0].click();", signup_btn)
                    print("✅ Кнопка SIGN UP нажата (submit + JS)")
                except:
                    # Способ 3: Ищем все кнопки и находим по тексту
                    buttons = self.driver.find_elements(By.TAG_NAME, "button")
                    for btn in buttons:
                        if "SIGN UP" in btn.text.upper():
                            self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
                            time.sleep(1)
                            self.driver.execute_script("arguments[0].click();", btn)
                            print("✅ Кнопка SIGN UP нажата (поиск по тексту + JS)")
                            break
            
            time.sleep(5)
            
            # Проверяем успешность регистрации
            current_url = self.driver.current_url
            print(f"   Текущий URL: {current_url}")
            
            if "loads" in current_url or "home" in current_url or "dashboard" in current_url:
                print("✅ Регистрация успешна!")
                return True
            else:
                print("⚠️ Возможно требуется дополнительная проверка")
                return True
            
        except Exception as e:
            print(f"❌ Ошибка отправки формы: {e}")
            return False
    
    def save_credentials(self):
        """Сохраняет credentials в файл"""
        print("\n💾 Сохранение credentials...")
        
        credentials = {
            "truckerpath": {
                "username": self.email,
                "password": self.password,
                "first_name": self.first_name,
                "last_name": self.last_name,
                "phone": self.phone
            }
        }
        
        # Читаем существующий файл если есть
        try:
            with open("credentials.json", "r") as f:
                existing = json.load(f)
                existing.update(credentials)
                credentials = existing
        except:
            pass
        
        # Сохраняем
        with open("credentials.json", "w") as f:
            json.dump(credentials, f, indent=2)
        
        print("✅ Credentials сохранены в credentials.json")
        print(f"\n📋 Ваши данные для входа:")
        print(f"   Email: {self.email}")
        print(f"   Password: {self.password}")
    
    def run(self):
        """Запускает полный процесс автоматической регистрации"""
        print("="*70)
        print("🤖 АВТОМАТИЧЕСКАЯ РЕГИСТРАЦИЯ НА TRUCKERPATH LOADBOARD")
        print("="*70)
        
        try:
            # ШАГ 1: Инициализация браузеров
            self.init_browsers()
            
            # ШАГ 2: Генерация данных
            self.generate_random_data()
            
            # ШАГ 3: Получение временного email
            if not self.get_temp_email():
                print("❌ Не удалось получить email")
                return False
            
            # ШАГ 4: Заполнение формы регистрации (включая нажатие GET CODE)
            if not self.fill_registration_form():
                print("❌ Не удалось заполнить форму")
                return False
            
            # ШАГ 5: Получение кода из email
            verification_code = self.get_verification_code_from_email(timeout=120)
            
            if not verification_code:
                print("❌ Не получен код верификации")
                return False
            
            # ШАГ 7: Ввод кода верификации
            if not self.enter_verification_code(verification_code):
                print("❌ Не удалось ввести код")
                return False
            
            # ШАГ 8: Отправка формы
            if not self.submit_registration():
                print("❌ Не удалось отправить форму")
                return False
            
            # ШАГ 9: Сохранение credentials
            self.save_credentials()
            
            print("\n" + "="*70)
            print("✅ РЕГИСТРАЦИЯ ЗАВЕРШЕНА УСПЕШНО!")
            print("="*70)
            print("\nТеперь вы можете использовать автоматический логин:")
            print("  python auto_login_scraper.py")
            
            return True
            
        except Exception as e:
            print(f"\n❌ ОШИБКА: {e}")
            import traceback
            traceback.print_exc()
            return False
        
        finally:
            print("\n⏳ Браузеры закроются через 10 секунд...")
            time.sleep(10)
            
            if self.driver:
                self.driver.quit()
            if self.temp_mail_driver:
                self.temp_mail_driver.quit()

if __name__ == "__main__":
    registrar = TruckerPathAutoRegister()
    success = registrar.run()
    
    if success:
        print("\n✅ Готово! Credentials сохранены.")
    else:
        print("\n❌ Регистрация не удалась. Проверьте логи.")
