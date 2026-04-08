"""
Автоматическая регистрация на TruckerPath
Использует temp-mail.org для получения проверочного кода
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

class AutoRegisterTruckerPath:
    def __init__(self):
        self.driver = None
        self.email = None
        self.password = None
    
    def init_browser(self, headless=False):
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
    
    def generate_temp_email(self):
        """Генерирует временный email через temp-mail.org"""
        print("\n📧 Генерация временного email...")
        
        try:
            # Открываем temp-mail.org
            self.driver.get("https://temp-mail.org/ru/")
            time.sleep(3)
            
            # Получаем сгенерированный email
            email_input = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "mail"))
            )
            
            self.email = email_input.get_attribute('value')
            print(f"✅ Email создан: {self.email}")
            
            return self.email
            
        except Exception as e:
            print(f"❌ Ошибка генерации email: {e}")
            return None
    
    def register_on_truckerpath(self):
        """Регистрация на TruckerPath"""
        print("\n📝 Регистрация на TruckerPath...")
        
        # Генерируем пароль
        self.password = ''.join(random.choices(string.ascii_letters + string.digits, k=12)) + "!1Aa"
        
        try:
            # Открываем страницу регистрации в новой вкладке
            self.driver.execute_script("window.open('');")
            self.driver.switch_to.window(self.driver.window_handles[1])
            
            self.driver.get("https://truckerpath.com/")
            time.sleep(3)
            
            # Ищем кнопку Sign Up
            try:
                signup_btn = WebDriverWait(self.driver, 10).until(
                    EC.element_to_be_clickable((By.XPATH, "//a[contains(text(), 'Sign Up') or contains(text(), 'Sign up')]"))
                )
                signup_btn.click()
                time.sleep(2)
            except:
                print("⚠️ Кнопка Sign Up не найдена, пробуем прямую ссылку...")
                self.driver.get("https://truckerpath.com/signup")
                time.sleep(3)
            
            # Заполняем форму регистрации
            print("   Заполнение формы...")
            
            # Email
            try:
                email_field = self.driver.find_element(By.NAME, "email")
                email_field.clear()
                email_field.send_keys(self.email)
                print(f"   ✅ Email: {self.email}")
            except:
                print("   ⚠️ Поле email не найдено")
            
            # Password
            try:
                password_field = self.driver.find_element(By.NAME, "password")
                password_field.clear()
                password_field.send_keys(self.password)
                print(f"   ✅ Password: {self.password}")
            except:
                print("   ⚠️ Поле password не найдено")
            
            # Company Name (опционально)
            try:
                company_field = self.driver.find_element(By.NAME, "company")
                company_name = f"Transport_{random.randint(1000, 9999)}"
                company_field.clear()
                company_field.send_keys(company_name)
                print(f"   ✅ Company: {company_name}")
            except:
                print("   ⚠️ Поле company не найдено")
            
            # Phone (опционально)
            try:
                phone_field = self.driver.find_element(By.NAME, "phone")
                phone = f"555{random.randint(1000000, 9999999)}"
                phone_field.clear()
                phone_field.send_keys(phone)
                print(f"   ✅ Phone: {phone}")
            except:
                print("   ⚠️ Поле phone не найдено")
            
            # Сохраняем скриншот формы
            self.driver.save_screenshot("truckerpath_form.png")
            print("   📸 Скриншот формы сохранен")
            
            # Нажимаем Submit
            try:
                submit_btn = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
                submit_btn.click()
                print("   ✅ Форма отправлена")
                time.sleep(3)
            except:
                print("   ❌ Кнопка Submit не найдена")
                return False
            
            return True
            
        except Exception as e:
            print(f"❌ Ошибка регистрации: {e}")
            return False
    
    def check_temp_mail(self, timeout=60):
        """Проверяет temp-mail.org на наличие писем"""
        print(f"\n📬 Проверка почты (до {timeout} секунд)...")
        
        # Переключаемся на вкладку с temp-mail
        self.driver.switch_to.window(self.driver.window_handles[0])
        
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            try:
                # Обновляем страницу
                self.driver.refresh()
                time.sleep(3)
                
                # Ищем письма
                messages = self.driver.find_elements(By.CSS_SELECTOR, ".mail")
                
                if messages:
                    print(f"✅ Получено писем: {len(messages)}")
                    
                    # Кликаем на первое письмо
                    messages[0].click()
                    time.sleep(2)
                    
                    # Получаем содержимое письма
                    message_body = self.driver.find_element(By.ID, "click-to-copy")
                    text = message_body.text
                    
                    print("\n📄 Содержимое письма:")
                    print(text[:500])
                    
                    # Ищем ссылку для подтверждения
                    links = re.findall(r'https?://[^\s<>"]+', text)
                    
                    if links:
                        print(f"\n🔗 Найдено ссылок: {len(links)}")
                        for i, link in enumerate(links, 1):
                            print(f"   {i}. {link}")
                        
                        # Ищем ссылку с verify/confirm/activate
                        verify_link = None
                        for link in links:
                            if any(kw in link.lower() for kw in ['verify', 'confirm', 'activate', 'validation']):
                                verify_link = link
                                break
                        
                        if not verify_link:
                            verify_link = links[0]
                        
                        return verify_link
                
                remaining = int(timeout - (time.time() - start_time))
                print(f"   ⏳ Проверка... (осталось {remaining} сек)")
                time.sleep(5)
                
            except Exception as e:
                print(f"   ⚠️ Ошибка проверки: {e}")
                time.sleep(5)
        
        print("⏰ Время ожидания истекло")
        return None
    
    def verify_email(self, verify_link):
        """Подтверждает email по ссылке"""
        print(f"\n✅ Подтверждение email...")
        print(f"   Ссылка: {verify_link}")
        
        try:
            # Переключаемся на вкладку TruckerPath
            self.driver.switch_to.window(self.driver.window_handles[1])
            
            # Открываем ссылку подтверждения
            self.driver.get(verify_link)
            time.sleep(5)
            
            # Сохраняем скриншот
            self.driver.save_screenshot("truckerpath_verified.png")
            
            print("✅ Email подтвержден!")
            return True
            
        except Exception as e:
            print(f"❌ Ошибка подтверждения: {e}")
            return False
    
    def save_credentials(self):
        """Сохраняет credentials в файл"""
        print("\n💾 Сохранение credentials...")
        
        credentials = {
            "truckerpath": {
                "username": self.email,
                "password": self.password
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
        print(f"\n📋 Ваши данные:")
        print(f"   Email: {self.email}")
        print(f"   Password: {self.password}")
    
    def run(self):
        """Запускает полный процесс регистрации"""
        print("="*70)
        print("🤖 АВТОМАТИЧЕСКАЯ РЕГИСТРАЦИЯ НА TRUCKERPATH")
        print("="*70)
        
        try:
            # Инициализируем браузер
            self.init_browser(headless=False)  # Видимый браузер для отладки
            
            # Шаг 1: Генерируем email
            if not self.generate_temp_email():
                print("❌ Не удалось создать email")
                return False
            
            # Шаг 2: Регистрируемся
            if not self.register_on_truckerpath():
                print("❌ Не удалось зарегистрироваться")
                return False
            
            # Шаг 3: Проверяем почту
            verify_link = self.check_temp_mail(timeout=120)
            
            if not verify_link:
                print("❌ Не получено письмо с подтверждением")
                return False
            
            # Шаг 4: Подтверждаем email
            if not self.verify_email(verify_link):
                print("❌ Не удалось подтвердить email")
                return False
            
            # Шаг 5: Сохраняем credentials
            self.save_credentials()
            
            print("\n" + "="*70)
            print("✅ РЕГИСТРАЦИЯ ЗАВЕРШЕНА УСПЕШНО!")
            print("="*70)
            print("\nТеперь вы можете использовать автоматический логин:")
            print("  python auto_login_scraper.py")
            
            return True
            
        except Exception as e:
            print(f"\n❌ ОШИБКА: {e}")
            return False
        
        finally:
            if self.driver:
                print("\n⏳ Браузер закроется через 10 секунд...")
                time.sleep(10)
                self.driver.quit()

if __name__ == "__main__":
    registrar = AutoRegisterTruckerPath()
    success = registrar.run()
    
    if success:
        print("\n✅ Готово! Credentials сохранены.")
    else:
        print("\n❌ Регистрация не удалась. Попробуйте вручную.")
